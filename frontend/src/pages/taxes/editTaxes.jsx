import TaxesLayout from "../../components/layout/Taxes-Layout";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

const EditTaxes = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        tax_name: "",
        tax_percentage: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const fetchTaxes = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/taxes/${id}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.message || "Failed to load taxes");

                setForm({
                    tax_name: data.tax_name,
                    tax_percentage: data.tax_percentage
                });
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTaxes();
    }, [id]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.tax_name || !form.tax_percentage) {
            setError("Please fill required fields marked with *");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                tax_name: form.tax_name,
                tax_percentage: form.tax_percentage
            };


            const res = await fetch(`http://localhost:3000/api/taxes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update taxes");

            alert("Pajak berhasil diperbarui");
            navigate("/taxes");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TaxesLayout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Edit Taxes</h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-white p-6 rounded shadow-sm"
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1">
                                Tax Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="tax_name"
                                value={form.tax_name}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1">
                                Tax Percentage <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="tax_percentage"
                                value={form.tax_percentage}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-600">{error}</div>}

                    <div className="flex justify-end gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {loading ? "Saving..." : "Update"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/taxes")}
                            className="border px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </TaxesLayout>
    );
};

export default EditTaxes;
