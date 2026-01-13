import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Trash2, Plus } from "lucide-react";
import QuotationLayout from "../../components/layout/Quotation-Layout";

const AddQuotation = () => {
    const navigate = useNavigate();

    //    Master Data
    const [clients, setClients] = useState([]);
    const [itemsMaster, setItemsMaster] = useState([]);
    const [taxes, setTaxes] = useState([]);

    // Form State
    const [form, setForm] = useState({
        client_id: "",
        estimate_date: "",
        expiry_date: "",
        project_title: "",
        start_date: "",
        deadline: "",
        discount: 0,
        discount_type: "percent", // percent | nominal
    });

    const [quotationItems, setQuotationItems] = useState([
        {
            item_id: "",
            description: "",
            qty: 1,
            price: 0,
            tax_id: "",
            tax_rate: 0,
        },
    ]);

    const [quotationTerms, setQuotationTerms] = useState([
        {
            term_number: 1,
            nominal: 0,
            term_estimate: "",
            term_percentage: 0,
        },
    ]);

    // Fecth Master Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, itemsRes, taxesRes] = await Promise.all([
                    fetch("http://localhost:3000/api/clients"),
                    fetch("http://localhost:3000/api/items"),
                    fetch("http://localhost:3000/api/taxes")
                ]);

                if (!clientsRes.ok) throw new Error("Failed to fetch clients");
                if (!itemsRes.ok) throw new Error("Failed to fetch items");
                if (!taxesRes.ok) throw new Error("Failed to fetch taxes");

                const clientsData = await clientsRes.json();
                const itemsData = await itemsRes.json();
                const taxesData = await taxesRes.json();

                setClients(clientsData);
                setItemsMaster(itemsData);
                // Normalize taxes data
                const normalizedTaxes = taxesData.map(t => ({
                    id: t.id,
                    name: t.tax_name,
                    rate: Number(t.tax_percentage)
                }));
                setTaxes(normalizedTaxes);
            } catch (error) {
                console.error("Error fetching master data:", error);
            }
        };

        fetchData();
    }, []);

    // Item Handler
    const addLine = () => {
        setQuotationItems(prev => [
            ...prev,
            {
                item_id: "",
                description: "",
                qty: 1,
                price: 0,
                tax_id: "",
                tax_rate: 0,
            },
        ]);
    };

    const removeLine = (index) => {
        setQuotationItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        setQuotationItems(prev => {
            const updated = [...prev];
            updated[index][field] = value;

            // Auto-fill tax rate when tax_id is selected
            if (field === "tax_id") {
                const selectedTax = taxes.find(t => t.id === Number(value));
                updated[index].tax_rate = selectedTax ? Number(selectedTax.rate) : 0;
            }

            return updated;
        });
    };

    // Handling Selected Item
    const handleSelectItem = (index, itemId) => {
        const selectedItem = itemsMaster.find(i => i.id === Number(itemId));

        setQuotationItems(prev => {
            const updated = [...prev];

            updated[index].item_id = itemId;
            updated[index].description = selectedItem?.description || "";
            updated[index].price = selectedItem?.default_price || 0;

            return updated;
        });
    };

    // Term Handler
    const addTerm = () => {
        const nextTermNumber = quotationTerms.length + 1;
        setQuotationTerms(prev => [
            ...prev,
            {
                term_number: nextTermNumber,
                nominal: 0,
                term_estimate: "",
                term_percentage: 0,
            },
        ]);
    };

    const removeTerm = (index) => {
        setQuotationTerms(prev => prev.filter((_, i) => i !== index));
    };

    const updateTerm = (index, field, value) => {
        setQuotationTerms(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };


    const subtotal = quotationItems.reduce(
        (sum, i) => sum + i.qty * i.price,
        0
    );

    const taxBreakdown = quotationItems.reduce((acc, item) => {
        const taxId = item.tax_id;
        const taxAmount = (item.qty * item.price * item.tax_rate) / 100;
        if (taxId) {
            if (!acc[taxId]) {
                const tax = taxes.find(t => t.id == taxId);
                acc[taxId] = { name: tax?.name || 'Unknown', rate: tax?.rate || 0, amount: 0 };
            }
            acc[taxId].amount += taxAmount;
        }
        return acc;
    }, {});

    const taxTotal = Object.values(taxBreakdown).reduce((sum, tax) => sum + tax.amount, 0);

    const discountValue =
        form.discount_type === "percent"
            ? (subtotal * form.discount) / 100
            : Number(form.discount);

    const total = subtotal - discountValue + taxTotal;

    // Submit Handler
    const submit = async (status) => {
        // Validation 
        if (!form.client_id || !form.estimate_date || !form.expiry_date || !form.project_title || !form.start_date || !form.deadline) {
            alert("Data quotation wajib diisi!");
            return;
        }

        const payload = {
            ...form,
            status,
            subtotal,
            discount: discountValue,
            tax: taxTotal,
            total,
            items: quotationItems,
            terms: quotationTerms,
        };

        try {
            const response = await fetch("http://localhost:3000/api/quotations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            alert("Quotation berhasil ditambahkan!");

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save quotation");
            }

            navigate("/quotations");
        } catch (error) {
            console.error("Error saving quotation:", error);
            alert("Error saving quotation: " + error.message);
        }
    };

    return (
        <QuotationLayout>
            <div className="p-6 bg-white rounded-lg space-y-6">

                {/* HEADER */}
                <h1 className="text-xl font-semibold">Create New Quotation</h1>

                {/* CLIENT */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="flex-1 w-full">
                        <label className="block mb-1 text-sm font-medium">Client <span className="text-red-500">*</span></label>
                        <select
                            value={form.client_id}
                            onChange={e => setForm({ ...form, client_id: e.target.value })}
                            className="w-full border border-gray-200 rounded px-3 py-2"
                        >
                            <option value="" className="border border-gray-200">Select Client</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.company_name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => navigate("/clients/new")}
                        className="border border-black px-3 py-2 rounded text-sm w-full sm:w-auto"
                    >
                        New Client
                    </button>
                </div>

                {/* DATES */}
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                        <label className="block mb-1">Estimate Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            value={form.estimate_date}
                            onChange={e => setForm({ ...form, estimate_date: e.target.value })}
                            className="w-full border border-gray-200 px-3 py-2 rounded"
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block mb-1">Expiry Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            value={form.expiry_date}
                            onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                            className="w-full border border-gray-200 px-3 py-2 rounded"
                        />
                    </div>
                </div>

                {/* PROJECT */}
                <div>
                    <label className="block mb-1">Project Title <span className="text-red-500">*</span></label>
                    <input
                        value={form.project_title}
                        onChange={e => setForm({ ...form, project_title: e.target.value })}
                        className="w-full border border-gray-200 px-3 py-2 rounded"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                        <label className="block mb-1">Start Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            value={form.start_date}
                            onChange={e => setForm({ ...form, start_date: e.target.value })}
                            className="w-full border border-gray-200 px-3 py-2 rounded"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block mb-1">Deadline <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            value={form.deadline}
                            onChange={e => setForm({ ...form, deadline: e.target.value })}
                            className="w-full border border-gray-200 px-3 py-2 rounded"
                        />
                    </div>
                </div>

                {/* ITEM LIST */}
                <div className="mt-6 flex flex-col">
                    <h3 className="font-semibold mb-3">Item List <span className="text-red-500">*</span></h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg flex-1">
                        <table className="w-full text-sm min-w-[800px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-center">Detail Item</th>
                                    <th className="p-3 text-center w-28">Qty</th>
                                    <th className="p-3 text-center w-36">Price</th>
                                    <th className="p-3 text-center w-40">Tax</th>
                                    <th className="p-3 text-center w-36 hidden sm:table-cell">Tax Amount</th>
                                    <th className="p-3 w-12">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {quotationItems.map((item, index) => (
                                    <tr key={index}>
                                        {/* DETAIL ITEM */}
                                        <td className="p-3">
                                            <select
                                                className="w-full border border-gray-200 rounded p-2 mb-2 text-black bg-white"
                                                value={item.item_id}
                                                onChange={(e) => handleSelectItem(index, e.target.value)}
                                            >
                                                <option value="">Select Item</option>
                                                {itemsMaster.map(i => (
                                                    <option key={i.id} value={i.id}>
                                                        {i.item_name}
                                                    </option>
                                                ))}
                                            </select>

                                            <input
                                                className="w-full border border-gray-200 rounded p-2 text-sm"
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) =>
                                                    updateItem(index, "description", e.target.value)
                                                }
                                            />
                                        </td>

                                        {/* QTY */}
                                        <td className="p-3 text-right">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full border border-gray-200 rounded p-2 text-right"
                                                value={item.qty}
                                                onChange={(e) =>
                                                    updateItem(index, "qty", e.target.value)
                                                }
                                            />
                                        </td>

                                        {/* PRICE */}
                                        <td className="p-3 text-right">
                                            <input
                                                type="number"
                                                className="w-full border border-gray-200 rounded p-2 text-right"
                                                value={item.price}
                                                onChange={(e) =>
                                                    updateItem(index, "price", e.target.value)
                                                }
                                            />
                                        </td>

                                        {/* TAX */}
                                        <td className="p-3">
                                            <select
                                                className="w-full border border-gray-200 rounded p-2 text-black bg-white"
                                                value={item.tax_id}
                                                onChange={(e) =>
                                                    updateItem(index, "tax_id", e.target.value)
                                                }
                                            >
                                                <option value="">Select Tax</option>
                                                {taxes.map(t => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name} {t.rate}%
                                                    </option>
                                                ))}
                                            </select>

                                        </td>

                                        {/* TAX AMOUNT */}
                                        <td className="p-3 text-right">
                                            {item.tax_id ? ((item.qty * item.price * item.tax_rate) / 100).toLocaleString() : '0'}
                                        </td>

                                        {/* ACTION */}
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => removeLine(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={addLine}
                        className="mt-3 flex items-center gap-2 text-white bg-blue-600 px-3 py-2 rounded self-end"
                    >
                        <Plus size={16} /> Add New Line
                    </button>
                </div>

                {/* TERM LIST */}
                <div className="mt-6 flex flex-col">
                    <h3 className="font-semibold mb-3">Payment Terms <span className="text-red-500">*</span></h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg flex-1">
                        <table className="w-full text-sm min-w-[800px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-center w-32">Term Number</th>
                                    <th className="p-3 text-center w-40 hidden sm:table-cell">Nominal</th>
                                    <th className="p-3 text-center w-40 hidden sm:table-cell">Term Percentage</th>
                                    <th className="p-3 text-center w-48 hidden sm:table-cell">Term Estimate</th>
                                    <th className="p-3 text-center w-12 ">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {quotationTerms.map((term, index) => (
                                    <tr key={index} >
                                        {/* TERM NUMBER */}
                                        <td className="p-3 text-center">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full border border-gray-200 rounded p-2 text-center"
                                                value={term.term_number}
                                                onChange={(e) =>
                                                    updateTerm(index, "term_number", Number(e.target.value))
                                                }
                                            />
                                        </td>

                                        {/* NOMINAL */}
                                        <td className="p-3 text-right">
                                            <input
                                                type="number"
                                                className="w-full border border-gray-200 rounded p-2 text-right"
                                                value={term.nominal}
                                                onChange={(e) =>
                                                    updateTerm(index, "nominal", Number(e.target.value))
                                                }
                                            />
                                        </td>

                                        {/* TERM PERCENTAGE */}
                                        <td className="p-3 text-right">
                                            <input
                                                type="number"
                                                className="w-full border border-gray-200 rounded p-2 text-right"
                                                value={term.term_percentage}
                                                onChange={(e) =>
                                                    updateTerm(index, "term_percentage", Number(e.target.value))
                                                }
                                            />
                                        </td>

                                        {/* TERM ESTIMATE */}
                                        <td className="p-3">
                                            <input
                                                type="date"
                                                className="w-full border border-gray-200 rounded p-2"
                                                value={term.term_estimate}
                                                onChange={(e) =>
                                                    updateTerm(index, "term_estimate", e.target.value)
                                                }
                                            />
                                        </td>

                                        {/* ACTION */}
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => removeTerm(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={addTerm}
                        className="mt-3 flex items-center gap-2 text-white bg-blue-600 px-3 py-2 rounded self-end"
                    >
                        <Plus size={16} /> Add New Term
                    </button>
                </div>

                {/* SUMMARY */}
                <div className="w-100 ml-auto border border-gray-200 rounded p-4 space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span>Discount</span>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={form.discount}
                                onChange={e => setForm({ ...form, discount: e.target.value })}
                                className="w-20 border border-gray-200 rounded px-2"
                            />
                            <select
                                value={form.discount_type}
                                onChange={e => setForm({ ...form, discount_type: e.target.value })}
                                className="border border-gray-200 rounded px-2"
                            >
                                <option value="percent">%</option>
                                <option value="nominal">Rp</option>
                            </select>
                        </div>
                    </div>

                    {/* TAX BREAKDOWN */}
                    {Object.keys(taxBreakdown).length > 0 && (
                        <div className="space-y-1">
                            {Object.entries(taxBreakdown).map(([taxId, tax]) => (
                                <div key={taxId} className="flex justify-between text-sm">
                                    <span>{tax.name} ({tax.rate}%)</span>
                                    <span>{tax.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{total.toLocaleString()}</span>
                    </div>
                </div>

                {/* ACTION */}
                <div className=" flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={() => submit("draft")}
                        className="bg-gray-200 px-4 py-2 rounded"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={() => submit("sent")}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Save and Sent
                    </button>
                    <button type="button"
                        onClick={() => navigate("/quotations")}
                        className="bg-gray-200 px-4 py-2 rounded border border-gray-200"
                    >Cancel</button>
                </div>
            </div>
        </QuotationLayout>
    );
};

export default AddQuotation;
