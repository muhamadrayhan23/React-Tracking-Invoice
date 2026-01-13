import ItemLayout from "../../components/layout/Item-Layout";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

const EditItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        item_name: "",
        description: "",
        category: "",
        default_price: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/items/${id}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.message || "Failed to load item");

                setForm({
                    item_name: data.item_name || "",
                    description: data.description || "",
                    category: data.category || "",
                    default_price: data.default_price || ""
                });
            } catch (err) {
                setError(err.message);
            }
        };

        fetchItem();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.item_name || !form.description || !form.category || !form.default_price) {
            setError("Please fill required fields marked with *");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                item_name: form.item_name,
                description: form.description,
                category: form.category,
                default_price: Number(form.default_price)
            };

            const res = await fetch(`http://localhost:3000/api/items/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update item");

            alert("Item berhasil diperbarui");
            navigate("/items");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ItemLayout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Edit Item</h1>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow-sm">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1">
                                Item Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="item_name"
                                value={form.item_name}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block mb-1">
                                Default Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="default_price"
                                value={form.default_price}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 h-28"
                        />
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
                            onClick={() => navigate("/items")}
                            className="border px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </ItemLayout>
    );
};

export default EditItem;
