import TaxesLayout from "../../components/layout/Taxes-Layout";
import { useState } from "react";
import { useNavigate } from "react-router";

const AddTaxes = () => {
    const [form, setForm] = useState({
        tax_name: "",
        tax_percentage: "",

    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!form.tax_name || !form.tax_percentage) {
            setError("Please fill required fields marked with *");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                tax_name: form.tax_name,
                tax_percentage: form.tax_percentage,
            };

            const res = await fetch("http://localhost:3000/api/taxes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

            alert("Pajak berhasil ditambahkan");
            navigate('/taxes');
        } catch (err) {
            setError(err.message || "Failed to create taxes");
            setLoading(false);
        }
    };

    return (
        <TaxesLayout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Create New Taxes</h1>
                {/* Basic Info */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow-sm">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1">Tax Name <span className="text-red-500">*</span></label>
                            <input name="tax_name" value={form.tax_name} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter tax name..." />
                        </div>
                        <div>
                            <label className="block mb-1">Tax Percentage<span className="text-red-500">*</span></label>
                            <input name="tax_percentage" value={form.tax_percentage} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter tax percentage" />
                        </div>
                    </div>

                    {error && <div className="text-red-600">{error}</div>}
                    {success && <div className="text-green-600">{success}</div>}

                    <div className="flex justify-end items-center gap-3">
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? "Saving..." : "Save"}</button>
                        <button type="button" onClick={() => navigate('/taxes')} className="border px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            </div>
        </TaxesLayout>
    );
}

export default AddTaxes;
