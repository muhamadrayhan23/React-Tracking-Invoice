import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "./components/common/AdminRoute";
import ClientRoute from "./components/common/ClientRoute";

// Login
import Login from "./pages/auth/Login";

// Admin Route
import Dashboard from "./pages/dashboard/Dashboard";
import Client from "./pages/client/Client";
import AddClient from "./pages/client/addClient";
import EditClient from "./pages/client/editClient";
import Item from "./pages/item/Item";
import AddItem from "./pages/item/addItem";
import EditItem from "./pages/item/editItem";
import Taxes from "./pages/taxes/Taxes";
import AddTaxes from "./pages/taxes/addTaxes";
import EditTaxes from "./pages/taxes/editTaxes";
import Quotation from "./pages/quotation/Quotation";
import AddQuotation from "./pages/quotation/addQuotation";
import EditQuotation from "./pages/quotation/editQuotation";
import Invoice from "./pages/invoice/Invoice";
import InvoiceDetail from "./pages/invoice/invoiceDetail";

// Client Route
import ClientDashboard from "./pages/client-side/dashboard/ClientDashboard";
import ClientQuotation from "./pages/client-side/quotation/ClientQuotation";
import ClientQuotationDetail from "./pages/client-side/quotation/ClientQuotationDetail";
import ClientInvoice from "./pages/client-side/invoice/ClientInvoice";
import ClientInvoiceDetail from "./pages/client-side/invoice/ClientInvoiceDetail";
import ClientPayment from "./pages/client-side/payment/Payment";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        {/* ================= ADMIN ONLY ================= */}

        <Route path="/dashboard" element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } />

        <Route path="/clients" element={<AdminRoute><Client /></AdminRoute>} />
        <Route path="/clients/new" element={<AdminRoute><AddClient /></AdminRoute>} />
        <Route path="/clients/edit/:id" element={<AdminRoute><EditClient /></AdminRoute>} />

        <Route path="/items" element={<AdminRoute><Item /></AdminRoute>} />
        <Route path="/items/new" element={<AdminRoute><AddItem /></AdminRoute>} />
        <Route path="/items/edit/:id" element={<AdminRoute><EditItem /></AdminRoute>} />

        <Route path="/taxes" element={<AdminRoute><Taxes /></AdminRoute>} />
        <Route path="/taxes/new" element={<AdminRoute><AddTaxes /></AdminRoute>} />
        <Route path="/taxes/edit/:id" element={<AdminRoute><EditTaxes /></AdminRoute>} />

        <Route path="/quotations" element={<AdminRoute><Quotation /></AdminRoute>} />
        <Route path="/quotations/new" element={<AdminRoute><AddQuotation /></AdminRoute>} />
        <Route path="/quotations/edit/:id" element={<AdminRoute><EditQuotation /></AdminRoute>} />

        <Route path="/invoices" element={<AdminRoute><Invoice /></AdminRoute>} />
        <Route path="/invoices/:id" element={<AdminRoute><InvoiceDetail /></AdminRoute>} />

        {/* ================= CLIENT ONLY ================= */}

        <Route path="/client-dashboard" element={
          <ClientRoute>
            <ClientDashboard />
          </ClientRoute>
        } />

        <Route path="/client-quotation" element={<ClientRoute><ClientQuotation /></ClientRoute>} />
        <Route path="/client-quotation/:id" element={<ClientRoute><ClientQuotationDetail /></ClientRoute>} />

        <Route path="/client-invoice" element={<ClientRoute><ClientInvoice /></ClientRoute>} />
        <Route path="/client-invoice/:id" element={<ClientRoute><ClientInvoiceDetail /></ClientRoute>} />
        <Route path="/client-payment" element={<ClientRoute><ClientPayment /></ClientRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
