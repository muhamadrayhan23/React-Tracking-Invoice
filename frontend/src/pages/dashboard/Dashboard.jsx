import DashboardLayout from "../../components/layout/Dashboard-Layout";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useEffect, useState } from "react";


const Dashboard = () => {
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState("");
    const [dashboardData, setDashboardData] = useState({
        quotationSummary: [],
        invoiceSummary: [],
        overdueInvoices: [],
        notifications: []
    });
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const initDashboard = async () => {
            try {

                const user = JSON.parse(localStorage.getItem("user"));

                if (!user) {
                    window.location.replace("/login");
                    return;
                }

                if (user.role !== "admin") {
                    window.location.replace("/unauthorized");
                    return;
                }


                setUserName(user.username);
                setUserRole(user.role);


                await fetchDashboardData();
            } catch (error) {
                console.error("Dashboard init error:", error);
                window.location.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        initDashboard();
    }, []);


    /* =========================
       FETCH DASHBOARD DATA
    ========================= */
    const fetchDashboardData = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const res = await fetch("http://localhost:3000/api/dashboard", {
            headers: {
                "x-user-id": user.id
            }
        });

        if (!res.ok) throw new Error("Dashboard error");

        const data = await res.json();
        setDashboardData(data);
    };


    /* =========================
       WELCOME MESSAGE
    ========================= */
    const getWelcomeMessage = () => {
        return `Hello ${userName}! Check the Qoutation and Invoice summary below.`;
    };

    // Prepare data for charts
    const getQuotationStatusColor = (status) => {
        if (status === 'draft') return 'gray';
        if (status === 'sent') return 'blue';
        if (status === 'approved') return 'green';
        if (status === 'rejected') return 'red'; // default
    };

    const getInvoiceStatusColor = (status) => {
        if (status === 'Draft') return 'grey';
        if (status === 'Issued') return 'yellow';
        if (status === 'Partially Paid') return 'blue';
        if (status === 'Paid') return 'green';
        if (status === 'Overdue') return 'red';
    };

    const getHexColor = (color) => {
        if (color === 'gray') return '#9CA3AF';
        if (color === 'blue') return '#3B82F6';
        if (color === 'green') return '#22C55E';
        if (color === 'red') return '#EF4444';
        if (color === 'grey') return '#6B7280';
        if (color === 'yellow') return '#EAB308';
    };

    const allQuotationStatuses = ['draft', 'sent', 'approved', 'rejected'];
    const quotationData = allQuotationStatuses.map(status => {
        const found = dashboardData.quotationSummary.find(item => item.status === status);
        return {
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: found ? found.count : 0,
            color: getQuotationStatusColor(status)
        };
    });

    const allInvoiceStatuses = ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue'];
    const invoiceData = allInvoiceStatuses.map(status => {
        const found = dashboardData.invoiceSummary.find(item => item.status === status);
        return {
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: found ? found.count : 0,
            color: getInvoiceStatusColor(status)
        };
    });

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <DashboardLayout>
            <div className="m-3 flex flex-col gap-2.5">

                {/* TITLE */}
                <div className="rounded-xl p-5" style={{
                    background: `linear-gradient(135deg, #0004FF 0%, #3B82F6 100%)`
                }}>
                    <h1 className="text-2xl text-white font-bold">Dashboard</h1>
                    <p className="text-white">
                        {getWelcomeMessage()}
                    </p>
                </div>

                {/* KPI CARDS QUOTATION*/}
                <div className="flex flex-wrap gap-2.5">
                    {quotationData.map((q, i) => (
                        <div
                            key={i}
                            className="flex-1 min-w-[200px] bg-white rounded-xl p-5 shadow-sm
                       border-l-4"
                            style={{
                                borderColor:
                                    q.color === "gray" ? "#9CA3AF" :
                                        q.color === "blue" ? "#3B82F6" :
                                            q.color === "green" ? "#22C55E" :
                                                "#EF4444"
                            }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-gray-500 text-sm">
                                    {q.name}
                                </p>

                                <span
                                    className={`text-xs px-2 py-1 rounded-full
                        ${q.color === "gray" && "bg-gray-100 text-gray-600"}
                        ${q.color === "blue" && "bg-blue-100 text-blue-600"}
                        ${q.color === "green" && "bg-green-100 text-green-600"}
                        ${q.color === "red" && "bg-red-100 text-red-600"}
                         ${q.color === "yellow" && "bg-yellow-100 text-yellow-600"}
                    `}
                                >
                                    {q.name}
                                </span>
                            </div>

                            <h2 className="text-3xl font-bold">
                                {q.value}
                            </h2>
                        </div>
                    ))}
                </div>


                {/* CHARTS */}
                <div className="flex flex-wrap gap-2.5">

                    {/* BAR CHART */}
                    <div className="flex-1 min-w-[300px] bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold mb-4">
                            Quotation Summary
                        </h3>

                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={quotationData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* PIE CHART INVOICE */}
                    <div className="flex-1 min-w-[300px] bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold mb-4">
                            Invoice Summary
                        </h3>

                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={invoiceData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={90}
                                    label
                                >
                                    {invoiceData.map((inv, i) => (
                                        <Cell key={i} fill={getHexColor(inv.color)} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Keterangan Status Invoice */}
                        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3">
                            {invoiceData.map((inv, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span
                                        className="inline-block rounded"
                                        style={{
                                            width: 12,
                                            height: 12,
                                            background: getHexColor(inv.color),
                                            borderRadius: 3
                                        }}
                                    />
                                    <span className="text-sm">
                                        {inv.name} <span>({inv.value})</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION */}
                <div className="flex flex-wrap gap-2.5">

                    {/* OVERDUE */}
                    <div className="flex-1 min-w-[300px] bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold mb-4">
                            Invoice Overdue
                        </h3>

                        <ul className="space-y-3 text-sm">
                            {dashboardData.overdueInvoices.length > 0 ? dashboardData.overdueInvoices.map((inv, i) => (
                                <li key={i} className="flex justify-between">
                                    <span>{inv.invoice_number} • {inv.company_name}</span>
                                    <span className="text-red-600 font-semibold">
                                        Rp {Number(inv.overdue_amount).toLocaleString("id-ID")}
                                    </span>
                                </li>
                            )) : (
                                <li className="text-gray-500">No overdue invoices</li>
                            )}
                        </ul>
                    </div>

                    {/* NOTIFICATION */}
                    <div className="flex-1 min-w-[300px] bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold mb-4">
                            Notifications
                        </h3>

                        <ul className="space-y-3 text-sm">
                            {dashboardData.notifications?.length > 0 ? (
                                dashboardData.notifications.map((notif, i) => (
                                    <li key={i} className="flex justify-between">
                                        <span>
                                            {notif.ref} {notif.status}
                                        </span>
                                        <span
                                            className={
                                                notif.status === "approved"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }
                                        >
                                            {notif.status.charAt(0).toUpperCase() + notif.status.slice(1)}
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">No recent notifications</li>
                            )}
                        </ul>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
