import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { logout } from "../../services/authService";
import {
    Home,
    Users,
    Database,
    Box,
    ClipboardList,
    Receipt,
    ReceiptText,
    LogOut,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const Sidebar = () => {
    const [openMaster, setOpenMaster] = useState(() => JSON.parse(localStorage.getItem('openMaster')) || false);
    const [open, setOpen] = useState(false);

    const location = useLocation();

    useEffect(() => {
        localStorage.setItem('openMaster', JSON.stringify(openMaster));
    }, [openMaster]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout error:", err);
        }
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    useEffect(() => {
        const p = location.pathname;
        const match = p.startsWith("/clients") || p.startsWith("/items") || p.startsWith("/taxes") || p.startsWith("/discounts");
        if (match) setOpenMaster(true);
    }, [location.pathname]);

    const itemClass = (isActive) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-[rgba(185,185,185,0.28)]"}`;

    const subItemClass = (isActive) =>
        `flex items-center gap-3 px-4 py-2 rounded-md transition text-sm ${isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-[rgba(185,185,185,0.28)]"}`;

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
                <NavLink to="/dashboard" className={({ isActive }) => itemClass(isActive)}>
                    <Home size={16} />
                    <span>Dashboard</span>
                </NavLink>

                {/* MASTER DATA */}
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={() => setOpenMaster((s) => !s)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs uppercase text-gray-400"
                    >
                        <Database size={16} />
                        <span>Master Data</span>
                        <span>{openMaster ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                    </button>

                    {openMaster && (
                        <div className="mt-2 space-y-2 pl-6">
                            <NavLink to="/clients" className={({ isActive }) => subItemClass(isActive)}>
                                <Users size={16} />
                                <span>Client</span>
                            </NavLink>

                            <NavLink to="/items" className={({ isActive }) => subItemClass(isActive)}>
                                <Box size={16} />
                                <span>Item</span>
                            </NavLink>

                            <NavLink to="/taxes" className={({ isActive }) => subItemClass(isActive)}>
                                <Receipt size={16} />
                                <span>Taxes</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* TRANSAKSI */}
                <div className="mt-4">

                    <NavLink to="/quotations" className={({ isActive }) => itemClass(isActive)}>
                        <ReceiptText size={16} />
                        <span>Quotation</span>
                    </NavLink>

                    <NavLink to="/invoices" className={({ isActive }) => itemClass(isActive)}>
                        <ClipboardList size={16} />
                        <span>Invoice</span>
                    </NavLink>
                </div>
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

export default Sidebar;
