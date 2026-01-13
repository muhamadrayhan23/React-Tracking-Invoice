const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ======================================================
   GET DASHBOARD DATA (ADMIN)
   Header: x-user-id
====================================================== */
router.get("/", async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({ message: "User ID required" });
        }

        // Get user role
        const [[user]] = await db.query(
            "SELECT role FROM users WHERE id = ?",
            [userId]
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === 'admin') {
            // Admin dashboard data
            const [quotationSummary] = await db.query(`
                SELECT status, COUNT(*) as count
                FROM quotation
                GROUP BY status
            `);

            const [notifications] = await db.query(
                `SELECT
                CONCAT('QT-', q.id) AS ref,
                q.status,
                q.updated_at
            FROM quotation q
            WHERE q.status = 'approved'
            ORDER BY q.updated_at DESC
            LIMIT 3`
            );

            const [invoiceSummary] = await db.query(`
                SELECT status, COUNT(*) as count
                FROM invoice
                GROUP BY status
            `);

            const [overdueInvoices] = await db.query(`
                SELECT i.invoice_number, c.company_name,
                       i.total - COALESCE(SUM(it.nominal), 0) AS overdue_amount
                FROM invoice i
                JOIN client c ON i.client_id = c.id
                LEFT JOIN invoice_terms it
                       ON i.id = it.invoice_id AND it.term_status = 'paid'
                WHERE i.status = 'Overdue'
                GROUP BY i.id
                LIMIT 10
            `);

            return res.json({
                role: "admin",
                quotationSummary,
                invoiceSummary,
                overdueInvoices,
                notifications
            });
        } else {
            return res.status(403).json({ message: "Invalid role" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
