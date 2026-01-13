import ClientLayout from "../../components/layout/Client-Layout";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";

const AddClient = () => {
    const [form, setForm] = useState({
        company_name: "",
        pic_name: "",
        email: "",
        contact: "",
        address: "",
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!form.company_name || !form.pic_name || !form.email || !form.contact || !form.address) {
            setError("Please fill required fields marked with *");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                company_name: form.company_name,
                pic_name: form.pic_name,
                email: form.email,
                address: form.address,
                contact: form.contact,
                username: form.username || null,
                password: form.password || null
            };

            const res = await fetch("http://localhost:3000/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

            alert("Client berhasil ditambahkan!");
            navigate('/clients');
        } catch (err) {
            setError(err.message || "Failed to create client");
            setLoading(false);
        }
    };

    return (
        <ClientLayout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Create New Client</h1>
                {/* Basic Info */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow-sm">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1">Company Name <span className="text-red-500">*</span></label>
                            <input name="company_name" value={form.company_name} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter company name..." />
                        </div>
                        <div>
                            <label className="block mb-1">PIC Name <span className="text-red-500">*</span></label>
                            <input name="pic_name" value={form.pic_name} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter PIC name..." />
                        </div>

                        <div>
                            <label className="block mb-1">Email <span className="text-red-500">*</span></label>
                            <input name="email" value={form.email} onChange={handleChange} type="email" className="w-full border rounded px-3 py-2" placeholder="Enter email address..." />
                        </div>
                        <div>
                            <label className="block mb-1">Contact <span className="text-red-500">*</span></label>
                            <input name="contact" value={form.contact} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter contact..." />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1">Address <span className="text-red-500">*</span></label>
                        <textarea name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2 h-28" placeholder="Enter Address..."></textarea>
                    </div>

                    {/* Username and Password Optional  */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1">Username (Optional)</label>
                            <input name="username" value={form.username} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter username..." />
                        </div>
                        <div>
                            <label className="block mb-1">Password (Optional)</label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2 pr-10"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && <div className="text-red-600">{error}</div>}
                    {success && <div className="text-green-600">{success}</div>}

                    <div className="flex justify-end items-center gap-3">
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? "Saving..." : "Save"}</button>
                        <button type="button" onClick={() => navigate('/clients')} className="border px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            </div>
        </ClientLayout>
    );
}

export default AddClient;
