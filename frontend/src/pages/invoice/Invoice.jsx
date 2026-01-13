import { useEffect, useState } from "react";
import { Eye, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router";
import InvoiceLayout from "../../components/layout/Invoice-Layout";

const Invoice = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const filteredInvoices = invoices.filter((inv) =>
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);

    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:3000/api/invoices");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setInvoices(data || []);
        } catch (err) {
            setError(err.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin ingin menghapus invoice ini?")) return;

        alert("Invoice berhasil dihapus!");

        try {
            const res = await fetch(`http://localhost:3000/api/invoices/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            fetchInvoices();
        } catch (err) {
            alert(err.message);
        }
    };

    const statusBadge = (status) => {
        const base = "px-3 py-1 rounded-full text-xs font-medium";
        switch (status) {
            case "Draft":
                return `${base} bg-gray-200 text-gray-700`;
            case "Issued":
                return `${base} bg-yellow-100 text-yellow-700`;
            case "Partially Paid":
                return `${base} bg-blue-100 text-blue-700`;
            case "Paid":
                return `${base} bg-green-100 text-green-700`;
            case "Overdue":
                return `${base} bg-red-100 text-red-700`;
            default:
                return base;
        }
    };

    return (
        <InvoiceLayout>
            <div className="m-3 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2.5 border-b border-gray-200">
                    <h1 className="text-2xl font-semibold pb-4">Invoice</h1>
                </div>

                <div className="bg-white rounded border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4 relative">
                        <h2 className="font-medium">Invoice List</h2>
                        <input
                            type="search"
                            placeholder="Search invoices..."
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
                                        <th className="py-3">Invoice Number</th>
                                        <th>Client</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedInvoices.map((inv) => (
                                        <tr key={inv.id} className="border-b border-gray-200">
                                            <td className="py-4">{inv.invoice_number}</td>
                                            <td>{inv.company_name}</td>
                                            <td>Rp {Number(inv.total).toLocaleString("id-ID")}</td>
                                            <td>
                                                <span className={`px-2 py-1 rounded-full text-xs ${inv.status === 'Draft' ? 'text-gray-600 bg-gray-50' :
                                                    inv.status === 'Issued' ? 'text-yellow-500 bg-yellow-50' :
                                                        inv.status === 'Partially Paid' ? 'text-blue-500 bg-blue-50' :
                                                            inv.status === 'Paid' ? 'text-green-500 bg-green-50' :
                                                                inv.status === 'Overdue' ? 'text-red-500 bg-red-50' :
                                                                    'text-gray-500 bg-gray-50'
                                                    }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className=" gap-2 items-center p-1">
                                                <button
                                                    onClick={() => {
                                                        navigate(`/invoices/${inv.id}`)
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(inv.id)}
                                                    disabled={inv.status !== "Draft"}
                                                    className={`p-1 rounded text-red-600 ${inv.status !== "Draft"
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-gray-100'
                                                        }`}
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
                                        disabled={currentPage === 1 || totalPages === 0}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        Prev
                                    </button>

                                    <button
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            {filteredInvoices.length === 0 && (
                                <div className="text-center text-gray-500 mt-4 w-full">
                                    Invoices Not Available
                                </div>
                            )}
                        </div>
                    )}
                </div>


            </div>
        </InvoiceLayout>
    );
};

export default Invoice;
