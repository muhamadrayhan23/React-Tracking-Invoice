import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import {
    Home,
    ReceiptText,
    ClipboardList,
    CreditCard,
    LogOut,
} from "lucide-react";

const ClientSidebar = () => {
    const [open, setOpen] = useState(false);

    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    const itemClass = (isActive) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-[rgba(185,185,185,0.28)]"}`;

    return (
        <aside className="w-64 bg-gray-100 border-r border-gray-400 p-4">
            {/* LOGO */}
            <div className="h-16 flex items-center justify-center border-b border-gray-400">
                <img src="/image/logo-btek.png" alt="logo-btek" className="w-8 h-8" />
                <h1 className="text-lg font-medium italic text-black-600 pl-2">
                    BTEK Invoiceflow
                </h1>
            </div>

            {/* MENU */}
            <nav className="flex-1 p-4 space-y-2">
                <NavLink to="/client-dashboard" className={({ isActive }) => itemClass(isActive)}>
                    <Home size={16} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/client-quotation" className={({ isActive }) => itemClass(isActive)}>
                    <ReceiptText size={16} />
                    <span>Quotation</span>
                </NavLink>

                <NavLink to="/client-invoice" className={({ isActive }) => itemClass(isActive)}>
                    <ClipboardList size={16} />
                    <span>Invoice</span>
                </NavLink>

                <NavLink to="/client-payment" className={({ isActive }) => itemClass(isActive)}>
                    <CreditCard size={16} />
                    <span>Payment</span>
                </NavLink>
            </nav>

            {/* LOGOUT */}
            <div className="p-4 border-t border-gray-400 items-center">
                <button
                    onClick={() => setOpen((s) => !s)}
                    className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                    <LogOut size={16} /> Log Out
                </button>
                {/* Overlay Confimartion */}
                {open && (
                    <div className="asbolute left-0 bottom-full mb-3 w-full z-50 mt-2">
                        {/* Modal */}
                        <div className="relative bg-white rounded-xl p-6  z-50">
                            <div className="bg-white rounded-xl  p-4">
                                <p className="text-sm text-black mb-5 text-center">
                                    Are you sure to logout?
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={handleLogout} className="flex-1 bg-red-500 text-white py-2 text-xs rounded-lg">
                                        Logout
                                    </button>
                                    <button onClick={() => setOpen(false)} className="flex-1 border py-2 text-xs rounded-lg">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default ClientSidebar;
