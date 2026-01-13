// routes/invoiceClientRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {

        const [[client]] = await db.query(
            "SELECT id FROM client WHERE user_id = ?",
            [id]
        );

        if (!client) {
            return res.status(404).json({ message: "Client tidak ditemukan" });
        }


        const [invoiceRows] = await db.query(`
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
                i.created_at,
                q.project_title,
                ii.id as item_id,
                ii.description,
                ii.qty as quantity,
                ii.price as unit_price,
                ii.total as item_total,
                it.id as term_id,
                it.term_number,
                it.nominal,
                it.term_percentage,
                it.term_status,
                it.term_estimate,
                it.payment_date
            FROM invoice i
            LEFT JOIN quotation q ON i.quotation_id = q.id
            LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
            LEFT JOIN item ON ii.item_id = item.id
            LEFT JOIN invoice_terms it ON i.id = it.invoice_id
            WHERE i.client_id = ? AND i.status != 'Draft'
            ORDER BY i.created_at DESC, ii.id, it.term_number
        `, [client.id]);

        // Group the data by invoice
        const invoices = {};
        invoiceRows.forEach(row => {
            const invoiceId = row.id;
            if (!invoices[invoiceId]) {
                invoices[invoiceId] = {
                    id: row.id,
                    invoice_number: row.invoice_number,
                    issue_date: row.issue_date,
                    due_date: row.due_date,
                    subtotal: row.subtotal,
                    discount: row.discount,
                    tax: row.tax,
                    total: row.total,
                    status: row.status,
                    created_at: row.created_at,
                    project_title: row.project_title,
                    items: [],
                    terms: []
                };
            }
            if (row.item_id && !invoices[invoiceId].items.find(item => item.id === row.item_id)) {
                invoices[invoiceId].items.push({
                    id: row.item_id,
                    item_name: row.item_name,
                    description: row.description,
                    quantity: row.quantity,
                    unit_price: row.unit_price,
                    total: row.item_total
                });
            }
            if (row.term_id && !invoices[invoiceId].terms.find(term => term.id === row.term_id)) {
                invoices[invoiceId].terms.push({
                    id: row.term_id,
                    term_number: row.term_number,
                    nominal: row.nominal,
                    term_percentage: row.term_percentage,
                    term_status: row.term_status,
                    term_estimate: row.term_estimate,
                    payment_date: row.payment_date
                });
            }
        });

        res.json(Object.values(invoices));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Get specific invoice detail for client
router.get("/:userId/:invoiceId", async (req, res) => {
    const { userId, invoiceId } = req.params;

    try {
        const [[client]] = await db.query(
            "SELECT id FROM client WHERE user_id = ?",
            [userId]
        );

        if (!client) {
            return res.status(404).json({ message: "Client tidak ditemukan" });
        }

        const [invoiceRows] = await db.query(`
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
                i.created_at,
                q.project_title,
                ii.id as item_id,
                ii.description,
                ii.qty as quantity,
                ii.price as unit_price,
                ii.total as item_total,
                it.id as term_id,
                it.term_number,
                it.nominal,
                it.term_percentage,
                it.term_status,
                it.term_estimate,
                it.payment_date
            FROM invoice i
            LEFT JOIN quotation q ON i.quotation_id = q.id
            LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
            LEFT JOIN item ON ii.item_id = item.id
            LEFT JOIN invoice_terms it ON i.id = it.invoice_id
            WHERE i.id = ? AND i.client_id = ? AND i.status != 'Draft'
        `, [invoiceId, client.id]);

        if (invoiceRows.length === 0) {
            return res.status(404).json({ message: "Invoice tidak ditemukan" });
        }

        // Group the data by invoice (should be only one)
        const invoice = {
            id: invoiceRows[0].id,
            invoice_number: invoiceRows[0].invoice_number,
            issue_date: invoiceRows[0].issue_date,
            due_date: invoiceRows[0].due_date,
            subtotal: invoiceRows[0].subtotal,
            discount: invoiceRows[0].discount,
            tax: invoiceRows[0].tax,
            total: invoiceRows[0].total,
            status: invoiceRows[0].status,
            created_at: invoiceRows[0].created_at,
            project_title: invoiceRows[0].project_title,
            items: [],
            terms: []
        };

        invoiceRows.forEach(row => {
            if (row.item_id && !invoice.items.find(item => item.id === row.item_id)) {
                invoice.items.push({
                    id: row.item_id,
                    description: row.description,
                    quantity: row.quantity,
                    unit_price: row.unit_price,
                    total: row.item_total
                });
            }
            if (row.term_id && !invoice.terms.find(term => term.id === row.term_id)) {
                invoice.terms.push({
                    id: row.term_id,
                    term_number: row.term_number,
                    nominal: row.nominal,
                    term_percentage: row.term_percentage,
                    term_status: row.term_status,
                    term_estimate: row.term_estimate,
                    payment_date: row.payment_date
                });
            }
        });

        res.json(invoice);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
