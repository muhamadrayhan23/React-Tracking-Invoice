import { useEffect, useState } from "react";
import ItemLayout from "../../components/layout/Item-Layout";
import { Link, useNavigate } from "react-router";
import { X, Eye, Edit, Trash2, Search, Boxes, DollarSign, List, ReceiptText } from "lucide-react";

const Items = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedItems, setSelectedItems] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    const filteredItems = items.filter((i) =>
        i.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:3000/api/items");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(data || []);
        } catch (err) {
            setError(err.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    const handleDelete = async (id) => {
        if (!confirm("Yakin ingin menghapus item ini?")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/items/${id}`, {
                method: "DELETE",
            });

            alert("Item berhasil dihapus!");

            if (!res.ok) throw new Error("Failed to delete");

            fetchItems();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <ItemLayout>
            <div className="m-3 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2.5 border-b border-gray-200">
                    <h1 className="text-2xl font-semibold pb-4">Item</h1>
                    <Link
                        to="/items/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        + Create New Item
                    </Link>
                </div>

                <div className="bg-white rounded border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4 relative">
                        <h2 className="font-medium">Client List</h2>
                        <input
                            type="search"
                            placeholder="Search item..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-200 rounded px-3 pr-9 py-1"></input>
                        <Search
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                    </div>

                    {loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-center">
                                <thead>
                                    <tr className="text-sm text-gray-600 border-b border-gray-200 bg-[#FAFAFA]">
                                        <th className="py-3">Item</th>
                                        <th>Category</th>
                                        <th>Default Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.map((i) => (
                                        <tr key={i.id} className="border-b border-gray-200">
                                            <td className="py-4">{i.item_name}</td>
                                            <td>{i.category}</td>
                                            <td>Rp {Number(i.default_price).toLocaleString("id-ID")}</td>
                                            <td className=" gap-2 items-center p-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedItems(i);
                                                        setShowDetail(true);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        navigate(`/items/edit/${i.id}`)
                                                    }
                                                    className="p-1 hover:bg-gray-100 rounded text-indigo-600"
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(i.id)}
                                                    className="p-1 hover:bg-gray-100 rounded text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-sm text-gray-500">
                                    Page {currentPage} of {totalPages}
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        Prev
                                    </button>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            {filteredItems.length === 0 && (
                                <div className="text-center text-gray-500 mt-4 w-full">
                                    Item Not Available
                                </div>
                            )}
                        </div>

                    )}
                </div>

                {/* MODAL DETAIL */}

                {showDetail && selectedItems && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setShowDetail(false)}
                        />

                        {/* Modal */}
                        <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 z-50 shadow-xl">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <Boxes size={16} />
                                    </div>
                                    <h3 className="text-lg font-semibold">Item Details</h3>
                                </div>

                                <button
                                    onClick={() => setShowDetail(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>


                            <div className="px-6 py-5 space-y-5">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-black mb-2">
                                        <Boxes size={16} />
                                        <span>Item</span>
                                    </div>
                                    <div className="border rounded-lg px-4 py-3 bg-gray-50">
                                        {selectedItems.item_name}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-sm text-black mb-2">
                                        <ReceiptText size={16} />
                                        <span>Description</span>
                                    </div>
                                    <div className="border rounded-lg px-4 py-3 bg-gray-50">
                                        {selectedItems.description}
                                    </div>
                                </div>


                                <div>
                                    <div className="flex items-center gap-2 text-sm text-black mb-2">
                                        <List size={16} />
                                        <span>Category</span>
                                    </div>
                                    <div className="border rounded-lg px-4 py-3 bg-gray-50">
                                        {selectedItems.category}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-sm text-black mb-2">
                                        <DollarSign size={16} />
                                        <span>Default Price</span>
                                    </div>
                                    <div className="border rounded-lg px-4 py-3 bg-gray-50 whitespace-pre-line">
                                        {Number(selectedItems.default_price).toLocaleString("id-ID")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ItemLayout>
    );
};

export default Items;
