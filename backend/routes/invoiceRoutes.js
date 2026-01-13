const express = require("express");
const router = express.Router();
const db = require("../config/db");



/* ======================================================
 Evaluate Invoice Status 
====================================================== */
const evaluateInvoiceStatus = async (invoice_id, conn = db) => {
    /* GET INVOICE */
    const [[invoice]] = await conn.query(
        "SELECT total, status FROM invoice WHERE id = ?",
        [invoice_id]
    );
    if (!invoice) return;

    /* GET TERMIN SUMMARY */
    const [[summary]] = await conn.query(`
        SELECT
            COUNT(*) AS total_terms,
            SUM(CASE WHEN term_status = 'paid' THEN 1 ELSE 0 END) AS paid_terms,
            SUM(CASE WHEN term_status = 'paid' THEN nominal ELSE 0 END) AS paid_amount,
            SUM(
                CASE
                    WHEN term_status = 'unpaid'
                     AND term_estimate < CURDATE()
                    THEN 1 ELSE 0
                END
            ) AS overdue_terms
        FROM invoice_terms
        WHERE invoice_id = ?
    `, [invoice_id]);

    let newStatus = "Issued";

    /* PRIORITAS OVERDUE */
    if (summary.overdue_terms > 0) {
        newStatus = "Overdue";
    }
    /* TOTAL PAID SAMA DENGAN TOTAL INVOICE */
    else if (summary.paid_amount == invoice.total) {
        newStatus = "Paid";
    }
    /* SEBAGIAN TERMIN SUDAH DIBAYAR */
    else if (summary.paid_terms > 0) {
        newStatus = "Partially Paid";
    }

    /* UPDATE STATUS JIKA BERUBAH */
    if (newStatus !== invoice.status) {
        await conn.query(
            "UPDATE invoice SET status = ? WHERE id = ?",
            [newStatus, invoice_id]
        );
    }
};

/* ======================================================
   GENERATE INVOICE NUMBER (Otomatis)
====================================================== */
const generateInvoiceNumber = async (conn) => {
    const [[row]] = await conn.query(
        "SELECT COUNT(*) AS total FROM invoice"
    );
    return `INV-${String(row.total + 1).padStart(5, "0")}`;
};

/* ======================================================
   GET ALL INVOICES
====================================================== */
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, c.company_name
            FROM invoice i
            JOIN client c ON i.client_id = c.id
            ORDER BY i.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ======================================================
   GET INVOICE DETAIL
====================================================== */
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [[invoice]] = await db.query(`
            SELECT i.*, c.company_name, c.address, q.project_title
            FROM invoice i
            JOIN client c ON i.client_id = c.id
            JOIN quotation q ON i.quotation_id = q.id
            WHERE i.id = ?
        `, [id]);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const [items] = await db.query(
            "SELECT * FROM invoice_items WHERE invoice_id = ?",
            [id]
        );

        const [terms] = await db.query(
            "SELECT * FROM invoice_terms WHERE invoice_id = ? ORDER BY term_number",
            [id]
        );

        res.json({ invoice, items, terms });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ======================================================
   CREATE INVOICE FROM APPROVED QUOTATION
   STATUS DEFAULT: Draft
====================================================== */
router.post("/from-quotation/:quotation_id", async (req, res) => {
    const { quotation_id } = req.params;
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [[quotation]] = await conn.query(
            "SELECT * FROM quotation WHERE id = ? AND status = 'approved'",
            [quotation_id]
        );

        if (!quotation) {
            return res.status(400).json({
                message: "Quotation belum approved"
            });
        }

        /* GET DUE DATE FROM LAST TERM */
        const [[{ due_date }]] = await conn.query(
            "SELECT MAX(term_estimate) AS due_date FROM quotation_terms WHERE quotation_id = ?",
            [quotation_id]
        );

        const invoiceNumber = await generateInvoiceNumber(conn);

        const [result] = await conn.query(`
            INSERT INTO invoice
            (invoice_number, quotation_id, client_id, issue_date, due_date,
             subtotal, discount, tax, total, status)
            VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, 'Draft')
        `, [
            invoiceNumber,
            quotation.id,
            quotation.client_id,
            due_date,
            quotation.subtotal,
            quotation.discount,
            quotation.tax,
            quotation.total
        ]);

        const invoiceId = result.insertId;

        /* COPY ITEMS */
        const [qItems] = await conn.query(
            "SELECT * FROM quotation_items WHERE quotation_id = ?",
            [quotation.id]
        );

        for (const item of qItems) {
            await conn.query(`
                INSERT INTO invoice_items
                (invoice_id, item_id, description, qty, price, tax_id, tax_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                invoiceId,
                item.item_id,
                item.description,
                item.qty,
                item.price,
                item.tax_id,
                item.tax_rate
            ]);
        }

        /* COPY TERMS */
        const [qTerms] = await conn.query(
            "SELECT * FROM quotation_terms WHERE quotation_id = ?",
            [quotation.id]
        );

        for (const term of qTerms) {
            await conn.query(`
                INSERT INTO invoice_terms
                (invoice_id, term_number, nominal, term_percentage, term_estimate)
                VALUES (?, ?, ?, ?, ?)
            `, [
                invoiceId,
                term.term_number,
                term.nominal,
                term.term_percentage,
                term.term_estimate
            ]);
        }

        await conn.commit();
        res.status(201).json({
            message: "Invoice draft berhasil dibuat",
            invoice_id: invoiceId
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
});

/* ======================================================
   PUBLISH INVOICE (ADMIN)
====================================================== */
router.put("/:id/publish", async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [[invoice]] = await conn.query(
            "SELECT status FROM invoice WHERE id = ?",
            [id]
        );

        if (!invoice || invoice.status !== "Draft") {
            return res.status(400).json({
                message: "Invoice tidak bisa dipublish"
            });
        }

        const [[lastTerm]] = await conn.query(`
            SELECT term_estimate
            FROM invoice_terms
            WHERE invoice_id = ?
            ORDER BY id DESC
            LIMIT 1
        `, [id]);

        await conn.query(`
            UPDATE invoice
            SET status = 'Issued',
                issue_date = CURDATE(),
                due_date = ?
            WHERE id = ?
        `, [lastTerm?.term_estimate || null, id]);

        await conn.commit();
        res.json({ message: "Invoice berhasil dipublish" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
});


/* ======================================
   PAY INVOICE TERMIN 
====================================== */
router.post("/:invoice_id/pay-term", async (req, res) => {
    const { invoice_id } = req.params;
    const { term_number, nominal } = req.body;


    if (!term_number || !nominal) {
        return res.status(400).json({
            message: "term_number dan nominal wajib diisi"
        });
    }

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        /* CEK INVOICE */
        const [[invoice]] = await conn.query(
            "SELECT id, status FROM invoice WHERE id = ?",
            [invoice_id]
        );

        /* CEK STATUS INVOICE */
        if (!["Issued", "Partially Paid"].includes(invoice.status)) {
            return res.status(400).json({
                message: "Invoice tidak bisa menerima pembayaran"
            })
        }

        if (!invoice.status === "Issued") {
            return res.status(404).json({
                message: "Invoice tidak ditemukan"
            });
        }

        /* CEK TERMIN */
        const [[term]] = await conn.query(`
            SELECT * FROM invoice_terms
            WHERE invoice_id = ?
              AND term_number = ?
        `, [invoice_id, term_number]);

        if (!term) {
            return res.status(404).json({
                message: "Termin tidak ditemukan"
            });
        }

        if (term.term_status === "paid") {
            return res.status(400).json({
                message: "Termin sudah dibayar"
            });
        }

        /* VALIDASI NOMINAL DULU */
        if (Number(nominal) !== Number(term.nominal)) {
            return res.status(400).json({
                message: "Nominal pembayaran tidak sesuai tagihan"
            });
        }

        /* UPDATE TERMIN */
        await conn.query(`
            UPDATE invoice_terms
            SET term_status = 'paid',
                payment_date = CURDATE()
            WHERE id = ?
        `, [term.id]);

        await evaluateInvoiceStatus(invoice_id, conn);

        await conn.commit();
        res.json({
            message: `Termin ${term_number} berhasil dibayar`
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
});

/* ======================================================
   DELETE INVOICE (ONLY DRAFT)
====================================================== */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [[invoice]] = await conn.query(
            "SELECT status FROM invoice WHERE id = ?",
            [id]
        );

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (invoice.status !== "Draft") {
            return res.status(400).json({
                message: "Invoice yang sudah dipublish tidak bisa dihapus"
            });
        }

        await conn.query("DELETE FROM invoice_items WHERE invoice_id = ?", [id]);
        await conn.query("DELETE FROM invoice_terms WHERE invoice_id = ?", [id]);
        await conn.query("DELETE FROM invoice WHERE id = ?", [id]);

        await conn.commit();
        res.json({ message: "Invoice draft berhasil dihapus" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;

/* =========================================================
   TESTING VIA POSTMAN
=========================================================

 GET ALL INVOICES
GET http://localhost:3000/api/invoices

----------------------------------------------------------

 GET INVOICE DETAIL
GET http://localhost:3000/api/invoices/1

----------------------------------------------------------

 CREATE INVOICE FROM QUOTATION (APPROVED ONLY)
POST http://localhost:3000/api/invoices/from-quotation/1

----------------------------------------------------------

 PUBLISH INVOICE (ADMIN)
PUT http://localhost:3000/api/invoices/1/publish

----------------------------------------------------------

 PAY TERMIN (CLIENT)
POST http://localhost:3000/api/invoices/1/pay-term
Body (raw JSON):
{
    "term_number": 1,
    "nominal": 545000
}

----------------------------------------------------------

 DELETE INVOICE (DRAFT ONLY)
DELETE http://localhost:3000/api/invoices/1

========================================================= */
