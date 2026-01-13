const express = require("express");
const cors = require("cors");

// Admin Routes
const loginRoutes = require("./routes/loginRoutes");
const clientRoutes = require("./routes/clientRoutes");
const itemRoutes = require("./routes/itemRoutes");
const taxRoutes = require("./routes/taxRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Client Routes
const clientDashboardRoutes = require("./routes/clientDashboardRoutes");
const clientInvoiceRoutes = require("./routes/clientInvoiceRoutes");
const clientQuotationRoutes = require("./routes/clientQuotationRoutes")

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors()); // 
app.use(express.json());

// Admin
app.use("/api/auth", loginRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/taxes", taxRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Client
app.use("/api/dashboard/client", clientDashboardRoutes);
app.use("/api/quotation/client", clientQuotationRoutes);
app.use("/api/invoice/client", clientInvoiceRoutes);

/* =========================
   SERVER
========================= */
app.listen(3000, () => {
   console.log("Server running on http://localhost:3000");
});
