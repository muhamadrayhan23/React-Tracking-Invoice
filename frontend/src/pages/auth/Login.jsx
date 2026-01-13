import { useState } from "react";
import { login } from "../../services/authService";
import { User, Eye, EyeOff } from "lucide-react";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const result = await login({ username, password });

            // ✅ SIMPAN USER LENGKAP
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("user", JSON.stringify(result.user));

            if (result.user.role === "admin") {
                window.location.href = "/dashboard";
            } else {
                window.location.href = "/client-dashboard";
            }

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="bg-white w-full max-w-2xl h-[560px] rounded-xl border border-gray-200">
                <div className="flex h-full">
                    <div className="flex-1" />
                    <div className="w-[460px] flex items-center justify-center">
                        <div className="w-[360px] text-center">
                            <img
                                src="/image/btek-invoflow.png"
                                alt="InvoiceFlow"
                                className="mx-auto w-60 h-60 mb-2"
                            />

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className="w-full border border-gray-200 px-4 py-2 rounded-full pr-10"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="w-full border border-gray-200  px-4 py-2 rounded-full pr-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showPassword ? <Eye /> : <EyeOff />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-50 bg-blue-600 text-white py-2 rounded-full"
                                >
                                    {loading ? "Loading..." : "LOGIN"}
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="flex-1" />
                </div>
            </div>
        </div>
    );
};

export default Login;
