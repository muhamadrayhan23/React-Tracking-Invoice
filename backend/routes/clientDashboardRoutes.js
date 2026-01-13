// routes/dashboardClientRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        /* =============================
           GET CLIENT ID FROM USER
        ============================== */
        const [[client]] = await db.query(
            "SELECT id FROM client WHERE user_id = ?",
            [userId]
        );

        if (!client) {
            return res.status(404).json({ message: "Client tidak ditemukan" });
        }

        const clientId = client.id;

        /* =============================
           QUOTATIONS CLIENT
        ============================== */
        const [quotations] = await db.query(`
            SELECT
                id,
                project_title,
                estimate_date,
                expiry_date,
                subtotal,
                discount,
                tax,
                total,
                status,
                created_at
            FROM quotation
            WHERE client_id = ? AND status != 'draft'
            ORDER BY created_at DESC
        `, [clientId]);

        /* =============================
           INVOICES CLIENT
        ============================== */
        const [invoices] = await db.query(`
            SELECT
                i.id,
                i.invoice_number,
                i.issue_date,
                i.due_date,
                i.subtotal,
                i.discount,
                i.tax,
                i.total,
                i.status,
                q.project_title
            FROM invoice i
            LEFT JOIN quotation q ON i.quotation_id = q.id
            WHERE i.client_id = ? AND i.status != 'Draft'
            ORDER BY i.created_at DESC
        `, [clientId]);

        /* =============================
           PAYMENT STATUS (TERMS)
        ============================== */
        const [paymentStatus] = await db.query(`
            SELECT 
                i.invoice_number,
                it.term_number,
                it.nominal,
                it.term_status,
                it.term_estimate,
                it.payment_date
            FROM invoice_terms it
            JOIN invoice i ON it.invoice_id = i.id
            WHERE i.client_id = ?
            ORDER BY i.id, it.term_number
        `, [clientId]);

        /* =============================
           OVERDUE INVOICES
        ============================== */
        const [overdueInvoices] = await db.query(`
            SELECT 
                invoice_number,
                total,
                due_date
            FROM invoice
            WHERE client_id = ?
            AND status = 'Overdue'
        `, [clientId]);

        return res.json({
            quotations,
            invoices,
            paymentStatus,
            overdueInvoices
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
