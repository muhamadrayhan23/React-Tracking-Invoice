
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

        const [quotationRows] = await db.query(`
            SELECT
                q.id,
                q.project_title,
                q.start_date,
                q.deadline,
                q.estimate_date,
                q.expiry_date,
                q.subtotal,
                q.discount,
                q.tax,
                q.total,
                q.status,
                q.created_at,
                qi.item_id,
                qi.description,
                qi.qty as quantity,
                qi.price as unit_price,
                qi.total as item_total,
                qt.id as term_id,
                qt.term_number,
                qt.nominal,
                qt.term_percentage,
                qt.term_estimate
            FROM quotation q
            LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
            LEFT JOIN item i ON qi.item_id = i.id
            LEFT JOIN quotation_terms qt ON q.id = qt.quotation_id
            WHERE q.client_id = ?
            ORDER BY q.created_at DESC, qi.item_id, qt.term_number
        `, [client.id]);

        // Group the data by quotation
        const quotations = {};
        quotationRows.forEach(row => {
            const quotationId = row.id;
            if (!quotations[quotationId]) {
                quotations[quotationId] = {
                    id: row.id,
                    project_title: row.project_title,
                    start_date: row.start_date,
                    deadline: row.deadline,
                    estimate_date: row.estimate_date,
                    expiry_date: row.expiry_date,
                    subtotal: row.subtotal,
                    discount: row.discount,
                    tax: row.tax,
                    total: row.total,
                    status: row.status,
                    created_at: row.created_at,
                    items: [],
                    terms: []
                };
            }
            if (row.item_id && !quotations[quotationId].items.find(item => item.id === row.item_id)) {
                quotations[quotationId].items.push({
                    id: row.item_id,
                    item_name: row.item_name,
                    description: row.description,
                    quantity: row.quantity,
                    unit_price: row.unit_price,
                    total: row.item_total
                });
            }
            if (row.term_id && !quotations[quotationId].terms.find(term => term.id === row.term_id)) {
                quotations[quotationId].terms.push({
                    id: row.term_id,
                    term_number: row.term_number,
                    nominal: row.nominal,
                    term_percentage: row.term_percentage,
                    term_estimate: row.term_estimate
                });
            }
        });

        res.json(Object.values(quotations));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:user_id/:quotation_id", async (req, res) => {
    const { user_id, quotation_id } = req.params;

    try {
        const [[client]] = await db.query(
            "SELECT id FROM client WHERE user_id = ?",
            [user_id]
        );

        if (!client) {
            return res.status(404).json({ message: "Client tidak ditemukan" });
        }

        const [quotationRows] = await db.query(`
            SELECT
                q.id,
                q.project_title,
                q.start_date,
                q.deadline,
                q.expiry_date,
                q.subtotal,
                q.discount,
                q.tax,
                q.total,
                q.status,
                q.created_at,
                qi.item_id,
                qi.description,
                qi.qty,
                qi.price,
                qi.total as item_total,
                qt.id as term_id,
                qt.term_number,
                qt.nominal,
                qt.term_percentage,
                qt.term_estimate
            FROM quotation q
            LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
            LEFT JOIN quotation_terms qt ON q.id = qt.quotation_id
            WHERE q.client_id = ? AND q.id = ?
            ORDER BY qi.item_id, qt.term_number
        `, [client.id, quotation_id]);

        if (quotationRows.length === 0) {
            return res.status(404).json({ message: "Quotation tidak ditemukan" });
        }

        // Structure the response
        const quotation = {
            id: quotationRows[0].id,
            quotation_number: quotationRows[0].quotation_number,
            project_title: quotationRows[0].project_title,
            start_date: quotationRows[0].start_date,
            deadline: quotationRows[0].deadline,
            estimate_date: quotationRows[0].estimate_date,
            expiry_date: quotationRows[0].expiry_date,
            subtotal: quotationRows[0].subtotal,
            discount: quotationRows[0].discount,
            tax: quotationRows[0].tax,
            total: quotationRows[0].total,
            status: quotationRows[0].status,
            created_at: quotationRows[0].created_at,
        };

        const items = [];
        const terms = [];

        quotationRows.forEach(row => {
            if (row.item_id && !items.find(item => item.item_id === row.item_id)) {
                items.push({
                    item_id: row.item_id,
                    description: row.description,
                    qty: row.qty,
                    price: row.price,
                    total: row.item_total
                });
            }
            if (row.term_id && !terms.find(term => term.id === row.term_id)) {
                terms.push({
                    id: row.term_id,
                    term_number: row.term_number,
                    nominal: row.nominal,
                    term_percentage: row.term_percentage,
                    term_estimate: row.term_estimate
                });
            }
        });

        res.json({
            quotation,
            items,
            terms
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
