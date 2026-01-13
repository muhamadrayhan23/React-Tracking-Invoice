import { useEffect, useState } from "react";
import TaxesLayout from "../../components/layout/Taxes-Layout";
import { Link, useNavigate } from "react-router";
import { Edit, Trash2, Search } from "lucide-react";

const Taxes = () => {
    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const ITEMS_PER_PAGE = 3;
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    const filteredTaxes = taxes.filter((t) =>
        t.tax_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tax_percentage.toLowerCase().includes(searchTerm.toLowerCase())

    );

    const totalPages = Math.ceil(filteredTaxes.length / ITEMS_PER_PAGE);

    const paginatedTaxes = filteredTaxes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    const fetchTaxes = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:3000/api/taxes");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setTaxes(data || []);
        } catch (err) {
            setError(err.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxes();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    const handleDelete = async (id) => {
        if (!confirm("Yakin ingin menghapus pajak ini?")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/taxes/${id}`, {
                method: "DELETE",
            });

            alert("Pajak berhasil dihapus!");

            if (!res.ok) throw new Error("Failed to delete");

            fetchTaxes();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <TaxesLayout>
            <div className="m-3 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2.5 border-b border-gray-200">
                    <h1 className="text-2xl font-semibold pb-4">Taxes</h1>
                    <Link
                        to="/taxes/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        + Create New Taxes
                    </Link>
                </div>

                <div className="bg-white rounded border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4 relative">
                        <h2 className="font-medium">Tax List</h2>
                        <input
                            type="search"
                            placeholder="Search tax..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className=" border border-gray-200 rounded px-3 pr-9 py-1"></input>
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
                                        <th className="py-3">Tax Name</th>
                                        <th>Tax Percentage</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTaxes.map((t) => (
                                        <tr key={t.id} className="border-b border-gray-200 ">
                                            <td className="py-4">{t.tax_name}</td>
                                            <td>{t.tax_percentage}</td>
                                            <td className=" gap-2 items-center p-1">
                                                <button
                                                    onClick={() =>
                                                        navigate(`/taxes/edit/${t.id}`)
                                                    }
                                                    className="p-1 hover:bg-gray-100 rounded text-indigo-600"
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(t.id)}
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
                            {filteredTaxes.length === 0 && (
                                <div className="text-center text-gray-500 mt-4 w-full">
                                    Tax Not Available
                                </div>
                            )}
                        </div>

                    )}
                </div>
            </div>
        </TaxesLayout>
    );
};

export default Taxes;
