import { useState, useEffect } from "react";
import { useParams } from "react-router";
import ClientQuotationLayout from "../../../components/client-layout/Quotation-Layout";
import { getClientQuotationDetail, approveQuotation, rejectQuotation } from "../../../services/clientQuotationService";

const ClientDetailQuotation = () => {
    const { id } = useParams();
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchQuotationDetail();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const fetchQuotationDetail = async () => {
        try {
            const data = await getClientQuotationDetail(id);
            setQuotation(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menyetujui penawaran ini?")) return;
        try {
            await approveQuotation(id);
            alert("Penawaran berhasil disetujui!");
            fetchQuotationDetail();
        } catch (err) {
            alert("Failed to approve quotation: " + err.message);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menolak penawaran ini?")) return;
        try {
            await rejectQuotation(id);
            alert("Penawaran berhasil ditolak!");
            fetchQuotationDetail();
        } catch (err) {
            alert("Failed to reject quotation: " + err.message);
        }
    };

    if (loading) return <ClientQuotationLayout><div className="p-6">Loading...</div></ClientQuotationLayout>;
    if (error) return <ClientQuotationLayout><div className="p-6 text-red-500">Error: {error}</div></ClientQuotationLayout>;

    if (!quotation) return <ClientQuotationLayout><div className="p-6">Quotation not found</div></ClientQuotationLayout>;

    return (
        <ClientQuotationLayout>
            <div className="p-2.5">
                <h1 className="text-2xl font-bold mb-4">Quotation Detail</h1>
                <div className="bg-white p-6 rounded-lg border border-gray-200 w-full">
                    <div className="border-b-2 border-gray-300 pb-4 mb-6">
                        <h1 className="text-3xl font-bold text-center text-gray-800">QUOTATION</h1>
                        <div className="flex justify-between mt-4">
                            <div>
                                <p className="text-lg font-semibold">Quotation #{quotation.quotation.id}</p>
                                <p className="text-gray-600">Project: {quotation.quotation.project_title}</p>
                                <p className="text-gray-600">Start Date: {formatDate(quotation.quotation.start_date)}</p>
                                <p className="text-gray-600">Deadline: {formatDate(quotation.quotation.deadline)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-600">Estimate Date: {formatDate(quotation.quotation.estimate_date)}</p>
                                <p className="text-gray-600">Expiry Date: {formatDate(quotation.quotation.expiry_date)}</p>
                                <p className="text-gray-600">Status: <span className={`font-bold ${quotation.quotation.status === 'approved' ? 'text-green-600' : quotation.quotation.status === 'rejected' ? 'text-red-600' : quotation.quotation.status === 'sent' ? 'text-blue-600' : quotation.quotation.status === 'revised' ? 'text-yellow-600' : 'text-gray-600'}`}>{quotation.quotation.status.toUpperCase()}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Items</h2>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-black text-white ">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Item Detail</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.items && quotation.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">{item.qty}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">Rp {Number(item.price).toLocaleString("id-ID")}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">Rp {Number(item.qty * item.price).toLocaleString("id-ID")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Terms</h2>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Term Number</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right">Nominal</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right">Percentage</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right">Estimate Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.terms && quotation.terms.map((term, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 px-4 py-2">{term.term_number}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">Rp {Number(term.nominal).toLocaleString("id-ID")}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">{term.term_percentage}%</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">{formatDate(term.term_estimate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t-2 border-gray-300 pt-4">
                        <div className="flex justify-end">
                            <div className="w-1/3">
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold">Subtotal:</span>
                                    <span>Rp {Number(quotation.quotation.subtotal).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold">Discount:</span>
                                    <span>Rp {Number(quotation.quotation.discount).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold">Tax:</span>
                                    <span>Rp {Number(quotation.quotation.tax).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                                    <span>Total:</span>
                                    <span>Rp {Number(quotation.quotation.total).toLocaleString("id-ID")}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(quotation.quotation.status === 'sent' || quotation.quotation.status === 'revised') && (
                        <div className="mt-6 flex justify-center space-x-4">
                            <button
                                onClick={() => handleApprove(quotation.quotation.id)}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
                            >
                                Approve Quotation
                            </button>
                            <button
                                onClick={() => handleReject(quotation.quotation.id)}
                                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
                            >
                                Reject Quotation
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </ClientQuotationLayout>
    );
};

export default ClientDetailQuotation;
