
import { useEffect, useState } from "react";
import QuotationLayout from "../../components/layout/Quotation-Layout";
import { Link, useNavigate } from "react-router-dom";
import { X, Eye, Edit, Trash2, Search, ReceiptText, DollarSign, Building2, CalendarCheck, CalendarClock, Info, FolderOpen, FileText } from "lucide-react";

const Quotation = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const filteredQuotations = quotations.filter((q) =>
        q.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.estimate_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.expiry_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredQuotations.length / ITEMS_PER_PAGE);

    const paginatedQuotations = filteredQuotations.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:3000/api/quotations");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setQuotations(data || []);
        } catch (err) {
            setError(err.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    const handleDelete = async (id) => {
        if (!confirm("Yakin ingin menghapus quotation ini?")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/quotations/${id}`, {
                method: "DELETE",
            });

            alert("Quotation berhasil dihapus!");

            if (!res.ok) throw new Error("Failed to delete");

            fetchQuotations();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSend = async (id) => {
        if (!confirm("Yakin ingin mengirim quotation ini?")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/quotations/${id}/publish`, {
                method: "PUT",
            });

            if (!res.ok) throw new Error("Failed to publish");

            alert("Quotation berhasil dikirim!");

            fetchQuotations();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleConvertToInvoice = async (id) => {
        if (!confirm("Yakin ingin mengkonversi quotation ini ke invoice?")) return;


        try {
            const res = await fetch(`http://localhost:3000/api/quotations/${id}/convert-to-invoice`, {
                method: "POST",
            });

            alert("Quotation berhasil di convert ke Invoice");

            if (!res.ok) throw new Error("Failed to convert");

            const data = await res.json();

            fetchQuotations();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <QuotationLayout>
            <div className="m-3 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2.5 border-b border-gray-200">
                    <h1 className="text-2xl font-semibold pb-4">Quotation</h1>
                    <Link
                        to="/quotations/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        + Create New Quotation
                    </Link>
                </div>

                <div className="bg-white rounded border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4 relative">
                        <h2 className="font-medium">Quotation List</h2>
                        <input
                            type="search"
                            placeholder="Search quotations..."
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
                                        <th className="py-3">Company</th>
                                        <th>Estimate Date</th>
                                        <th>Expiry Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedQuotations.map((q) => (
                                        <tr key={q.id} className="border-b border-gray-200">
                                            <td className="py-4">{q.company_name}</td>
                                            <td>{formatDate(q.estimate_date)}</td>
                                            <td>{formatDate(q.expiry_date)}</td>
                                            <td>
                                                <span className={`px-2 py-1 rounded-full text-xs ${q.status === 'draft' ? 'text-gray-600 bg-gray-50' :
                                                    q.status === 'sent' ? 'text-blue-600 bg-blue-50' :
                                                        q.status === 'revised' ? 'text-yellow-600 bg-yellow-50' :
                                                            q.status === 'rejected' ? 'text-red-600 bg-red-50' :
                                                                q.status === 'approved' ? 'text-green-600 bg-green-50' :
                                                                    'text-gray-600 bg-gray-50'
                                                    }`}>
                                                    {q.status}
                                                </span>
                                            </td>
                                            <td className=" gap-2 items-center p-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedQuotation(q);
                                                        setShowDetail(true);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        navigate(`/quotations/edit/${q.id}`)
                                                    }
                                                    disabled={q.status === 'sent' || q.status === 'approved'}
                                                    className={`p-1 rounded text-indigo-600 ${q.status === 'sent' || q.status === 'approved'
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                {/* Button Edit Quotation (Draft or Revised Only) */}
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    disabled={q.status === 'sent' || q.status === 'approved'}
                                                    className={`p-1 rounded text-red-600 ${q.status === 'sent' || q.status === 'approved'
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                {/* Button Send Quotation (Draft or Revised Only) */}
                                                {(q.status === 'draft' || q.status === 'revised') && (
                                                    <button
                                                        onClick={() => handleSend(q.id)}
                                                        className="p-1 hover:bg-gray-100 rounded text-blue-600"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                )}

                                                {/* Button Convert to Invoice (Approve Only) */}
                                                {q.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleConvertToInvoice(q.id)}
                                                        className="p-1 hover:bg-gray-100 rounded text-green-600"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                )}
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

                            {filteredQuotations.length === 0 && (
                                <div className="text-center text-gray-500 mt-4 w-full">
                                    Quotations Not Available
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* MODAL DETAIL */}

                {showDetail && selectedQuotation && (
                    <div className=" fixed inset-0 z-50 flex items-center justify-center">
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
                                        <ReceiptText size={20} />
                                    </div>
                                    <h3 className="text-lg font-semibold">Quotation Details</h3>
                                </div>

                                <button
                                    onClick={() => setShowDetail(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-5 space-y-5">
                                {/* Company */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <Building2 size={16} />
                                        <span>Company</span>
                                    </div>
                                    <div className="border rounded-lg px-4 py-3 bg-gray-50">
                                        {selectedQuotation.company_name}
                                    </div>
                                </div>

                                {/* Estimate Date */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <CalendarCheck size={16} />
                                        <span>Estimate Date</span>
                                    </div>
                                    <div className="border rounded-lg px-4 py-3 bg-gray-50">
                                        {formatDate(selectedQuotation.estimate_date)}
                                    </div>
                                </div>

                                {/* Expiry Date */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <CalendarClock size={16} />
                                        <span>Expiry Date</span>
                                    </div>
                                    <div className="border rounded-lg px-4 py-3 bg-gray-50">
                                        {formatDate(selectedQuotation.expiry_date)}
                                    </div>
                                </div>

                                {/* Project Title */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <FolderOpen size={16} />
                                        <span>Project Title</span>
                                    </div>
                                    <div className="border rounded-lg px-4 py-3 bg-gray-50">
                                        {selectedQuotation.project_title}
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <Info size={16} />
                                        <span>Status</span>
                                    </div>
                                    <div className="border rounded-lg px-4 py-3 bg-gray-50">
                                        {selectedQuotation.status}
                                    </div>
                                </div>

                                {/* Total */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <DollarSign size={16} />
                                        <span>Total</span>
                                    </div>
                                    <div className="border rounded-lg px-4 py-3 bg-gray-50">
                                        {Number(selectedQuotation.total).toLocaleString("id-ID")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </QuotationLayout>
    );
};

export default Quotation;
