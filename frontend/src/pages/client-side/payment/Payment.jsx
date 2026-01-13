import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ClientPaymentLayout from "../../../components/client-layout/Payment-Layout";
import { getClientInvoices, getClientInvoiceDetail } from "../../../services/clientInvoiceService";
import { payInvoiceTerm } from "../../../services/paymentService";
import { ChevronDown } from "lucide-react";

const ClientPayment = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [nominal, setNominal] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const data = await getClientInvoices();
            setInvoices(data || []);
        } catch (err) {
            setError(err.message || "Failed to load invoices");
        }
    };

    const handleInvoiceChange = async (invoiceId) => {
        if (!invoiceId) {
            setSelectedInvoice(null);
            setSelectedTerm(null);
            return;
        }
        try {
            const invoice = await getClientInvoiceDetail(invoiceId);
            setSelectedInvoice(invoice);
            setSelectedTerm(null);
        } catch (err) {
            setError(err.message || "Failed to load invoice detail");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedInvoice || !selectedTerm || !nominal || !paymentDate) {
            setError("Please fill all fields");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await payInvoiceTerm(selectedInvoice.id, selectedTerm.term_number, parseFloat(nominal));
            alert("Payment submitted successfully");
            // Navigate to invoice detail
            navigate(`/client-invoice/${selectedInvoice.id}`);
        } catch (err) {
            setError(err.message || "Failed to submit payment");
        } finally {
            setLoading(false);
        }
    };

    const unpaidTerms = selectedInvoice?.terms?.filter(term => term.term_status === 'unpaid') || [];

    return (
        <ClientPaymentLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Payment</h1>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded border border-gray-200">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Select Invoice</label>
                        <div className="relative">
                            <select
                                value={selectedInvoice?.id || ""}
                                onChange={(e) => handleInvoiceChange(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 appearance-none"
                                required
                            >
                                <option value="" style={{ padding: '10px' }}>Choose Invoice</option>
                                {invoices.filter(inv => ['Issued', 'Partially Paid', 'Overdue'].includes(inv.status)).map((inv) => (
                                    <option key={inv.id} value={inv.id} style={{ padding: '10px' }}>
                                        {inv.invoice_number} - {inv.status} - Rp {Number(inv.total).toLocaleString("id-ID")}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    {selectedInvoice && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Select Term</label>
                                <div className="relative">
                                    <select
                                        value={selectedTerm?.id || ""}
                                        onChange={(e) => {
                                            const term = unpaidTerms.find(t => t.id === parseInt(e.target.value));
                                            setSelectedTerm(term);
                                            if (term) setNominal(term.nominal.toString());
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2 appearance-none"
                                        required
                                    >
                                        <option value="">Choose a term</option>
                                        {unpaidTerms.map((term) => (
                                            <option key={term.id} value={term.id}>
                                                Term {term.term_number} - Rp {Number(term.nominal).toLocaleString("id-ID")} - Due: {new Date(term.term_estimate).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5  pointer-events-none" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Amount of Payment</label>
                                <input
                                    type="number"
                                    value={nominal}
                                    onChange={(e) => setNominal(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder="Enter payment amount"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Payment Date</label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Payment"}
                            </button>
                        </>
                    )}
                </form>

                {selectedInvoice && (
                    <div className="mt-6 bg-white p-6 rounded shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
                        <p><strong>Invoice Number:</strong> {selectedInvoice.invoice_number}</p>
                        <p><strong>Status:</strong> {selectedInvoice.status}</p>
                        <p><strong>Total:</strong> Rp {Number(selectedInvoice.total).toLocaleString("id-ID")}</p>
                        <p><strong>Project:</strong> {selectedInvoice.project_title}</p>
                    </div>
                )}
            </div>
        </ClientPaymentLayout >
    );
};

export default ClientPayment;
