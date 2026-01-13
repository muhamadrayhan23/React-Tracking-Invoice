import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "./invoicePdf";

const InvoiceDetail = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [items, setItems] = useState([]);
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const fetchInvoice = async () => {
        const res = await fetch(`http://localhost:3000/api/invoices/${id}`);
        const data = await res.json();
        setInvoice(data.invoice);
        setItems(data.items || []);
        setTerms(data.terms || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const publishInvoice = async () => {
        if (!window.confirm("Publish invoice ini?")) return;

        alert("Invoice berhasil dipublish!");

        await fetch(`http://localhost:3000/api/invoices/${id}/publish`, {
            method: "PUT"

        });
        fetchInvoice();
    };


    if (loading) return <p>Loading...</p>;
    if (!invoice) return <p>Invoice tidak ditemukan</p>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* BUTTON DOWNLOAD PDF AND EXCEL */}
            <div className="flex justify-end gap-3 mb-4">
                <PDFDownloadLink
                    document={<InvoicePDF invoice={invoice} items={items} terms={terms} />}
                    fileName={`${invoice.invoice_number}.pdf`}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                >
                    Download PDF
                </PDFDownloadLink>
            </div>

            {/* INVOICE  */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-5xl mx-auto">
                {/* HEADER */}
                <div className="flex justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-semibold">Invoice</h1>
                        <p className="text-sm text-gray-500">{invoice.invoice_number}</p>
                    </div>
                    <div className={`text-2xl font-bold ${invoice.status === 'Draft' ? 'text-gray-500' :
                        invoice.status === 'Issued' ? 'text-yellow-500' :
                            invoice.status === 'Partially Paid' ? 'text-blue-500' :
                                invoice.status === 'Paid' ? 'text-green-500' :
                                    invoice.status === 'Overdue' ? 'text-red-500' :
                                        'text-gray-400'
                        }`}>
                        {invoice.status}
                    </div>
                </div>

                {/* CLIENT INFO */}
                <div className="flex justify-between mb-6">
                    <div className="text-sm w-60">
                        <p className="text-blue-400">PT Bandung Teknologi Semesta</p>
                        <p>Jl. Nata Kusumah VII, RT.01/RW.07,
                            Kabupaten Bandung, Jawa Barat 40225</p>
                    </div>

                    <div className="flex mb-6">
                        <div className="text-sm text-right">
                            <p className="font-semibold">Invoice To</p>
                            <p>{invoice.company_name}</p>
                            <p>{invoice.address}</p>
                        </div>
                    </div>
                </div>

                {/* DATE */}
                <div className="flex-start text-sm mb-6 w-60">
                    <p><strong>Project:</strong> {invoice.project_title}</p>
                    <p><strong>Invoice Date:</strong> {formatDate(invoice.issue_date)}</p>
                    <p><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>
                </div>

                {/* ITEM TABLE */}
                <table className="border-collapse border border-gray-200 rounded w-full">
                    <thead>
                        <tr className="bg-black text-white text-sm">
                            <th className="border border-gray-200 px-4 py-2 text-left">Item Detail</th>
                            <th className="border border-gray-200 px-4 py-2 text-center">Qty</th>
                            <th className="border border-gray-200 px-4 py-2 text-center">Price</th>
                            <th className="border border-gray-200 px-4 py-2 text-center">Tax</th>
                            <th className="border border-gray-200 px-4 py-2 text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} className="text-sm border-b border-gray-200">
                                <td className="border border-gray-200 px-4 py-2">{item.description}</td>
                                <td className="border border-gray-200 px-4 py-2 text-center">{item.qty}</td>
                                <td className="border border-gray-200 px-4 py-2 text-center">Rp {Number(item.price).toLocaleString("id-ID")}</td>
                                <td className="border border-gray-200 px-4 py-2 text-center">{item.tax_rate}%</td>
                                <td className="border border-gray-200 px-4 py-2 text-center">Rp {(
                                    Number(item.total)).toLocaleString("id-ID")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* SUMMARY */}
                <div className="flex justify-end mt-6 border-b border-gray-200">
                    <div className="w-64  space-y-2">
                        <div className="flex justify-between">
                            <span> Subtotal</span>
                            <span>Rp {(
                                Number(invoice.subtotal)
                            ).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span> Rp {Number(invoice.tax).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span>
                            <span>Rp {Number(invoice.discount).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>Rp {Number(invoice.total).toLocaleString("id-ID")}</span>
                        </div>
                    </div>
                </div>

                {/* TERMS DETAILS */}
                {['Issued', 'Partially Paid', 'Paid', 'Overdue'].includes(invoice.status) && terms.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-4">Term Details</h2>
                        <table className="border-collapse border border-gray-200 rounded w-full">
                            <thead>
                                <tr className="bg-black text-white text-sm border border-gray-200">
                                    <th className="border border-gray-200 px-4 py-2 text-center">Term Number</th>
                                    <th className="border border-gray-200 px-4 py-2 text-center">Nominal</th>
                                    <th className="border border-gray-200 px-4 py-2 text-center">Percentage</th>
                                    <th className="border border-gray-200 px-4 py-2 text-center">Estimate Date</th>
                                    <th className="border border-gray-200 px-4 py-2 text-center">Payment Date</th>
                                    <th className="border border-gray-200 px-4 py-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {terms.map((term, i) => (
                                    <tr key={i} className="text-sm border border-gray-200">
                                        <td className="border border-gray-200 px-4 py-2 text-center">{term.term_number}</td>
                                        <td className="border border-gray-200 px-4 py-2 text-center">Rp {Number(term.nominal).toLocaleString("id-ID")}</td>
                                        <td className="border border-gray-200 px-4 py-2 text-center">{term.term_percentage}%</td>
                                        <td className="border border-gray-200 px-4 py-2 text-center">{formatDate(term.term_estimate)}</td>
                                        <td className="border border-gray-200 px-4 py-2 text-center">{term.term_status === 'unpaid' && !term.payment_date ? 'N/A' : formatDate(term.payment_date)}</td>
                                        <td className={`border border-gray-200 px-4 py-2 text-center ${term.term_status === 'paid' ? 'text-green-500' : term.term_status === 'unpaid' ? 'text-red-500' : 'text-gray-500'}`}>{term.term_status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {
                invoice.status === "Draft" && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={publishInvoice}
                            className="px-4 py-2 bg-green-600 text-white rounded text-sm"
                        >
                            Publish Invoice
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default InvoiceDetail;
