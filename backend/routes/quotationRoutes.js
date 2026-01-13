const express = require("express");
const router = express.Router();
const db = require("../config/db");

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
   GET ALL QUOTATION
====================================================== */
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT q.*, c.company_name
            FROM quotation q
            JOIN client c ON q.client_id = c.id
            ORDER BY q.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ======================================================
   GET QUOTATION DETAIL
====================================================== */
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [[quotation]] = await db.query(`
            SELECT q.*, c.company_name, c.pic_name, c.email, c.contact, c.address
            FROM quotation q
            JOIN client c ON q.client_id = c.id
            WHERE q.id = ?
        `, [id]);

        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        const [items] = await db.query(`
            SELECT qi.*, i.item_name
            FROM quotation_items qi
            LEFT JOIN item i ON qi.item_id = i.id
            WHERE qi.quotation_id = ?
        `, [id]);

        const [terms] = await db.query(`
            SELECT * FROM quotation_terms
            WHERE quotation_id = ?
            ORDER BY term_number
        `, [id]);

        res.json({ quotation, items, terms });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ======================================================
   CREATE QUOTATION
   - Draft atau Sent
====================================================== */
router.post("/", async (req, res) => {
    const {
        client_id,
        estimate_date,
        expiry_date,
        project_title,
        start_date,
        deadline,
        subtotal,
        discount,
        tax,
        total,
        status,
        items = [],
        terms = []
    } = req.body;

    const finalStatus = ["draft", "sent"].includes(status) ? status : "draft";
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [result] = await conn.query(`
            INSERT INTO quotation
            (client_id, estimate_date, expiry_date, project_title,
             start_date, deadline, subtotal, discount, tax, total, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            client_id, estimate_date, expiry_date, project_title,
            start_date, deadline, subtotal, discount || 0, tax, total, finalStatus
        ]);

        const quotationId = result.insertId;

        /* INSERT ITEMS */
        for (const item of items) {
            await conn.query(`
                INSERT INTO quotation_items
                (quotation_id, item_id, description, qty, price, tax_id, tax_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                quotationId,
                item.item_id,
                item.description,
                item.qty,
                item.price,
                item.tax_id,
                item.tax_rate || 0
            ]);
        }

        /* INSERT TERMS */
        for (const term of terms) {
            await conn.query(`
                INSERT INTO quotation_terms
                (quotation_id, term_number, nominal, term_percentage, term_estimate)
                VALUES (?, ?, ?, ?, ?)
            `, [
                quotationId,
                term.term_number,
                term.nominal,
                term.term_percentage,
                term.term_estimate || null
            ]);
        }

        await conn.commit();
        res.status(201).json({
            message: "Quotation berhasil dibuat",
            quotation_id: quotationId
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
});

/* ======================================================
   UPDATE QUOTATION
   - Hanya draft, rejected, revised
====================================================== */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
        client_id,
        estimate_date,
        expiry_date,
        project_title,
        start_date,
        deadline,
        subtotal,
        discount,
        tax,
        total,
        status,
        items = [],
        terms = []
    } = req.body;

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [[existing]] = await conn.query(
            "SELECT status FROM quotation WHERE id = ?",
            [id]
        );

        if (!existing) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        if (["sent", "approved"].includes(existing.status)) {
            return res.status(400).json({
                message: "Quotation tidak bisa diedit"
            });
        }

        // Determine new status
        let newStatus;
        if (status === "sent" && ["draft", "revised"].includes(existing.status)) {
            newStatus = "sent";
        } else if (existing.status === "rejected") {
            newStatus = "revised";
        } else {
            newStatus = existing.status;
        }

        await conn.query(`
            UPDATE quotation SET
            client_id=?, estimate_date=?, expiry_date=?, project_title=?,
            start_date=?, deadline=?, subtotal=?, discount=?, tax=?, total=?, status=?
            WHERE id=?
        `, [
            client_id, estimate_date, expiry_date, project_title,
            start_date, deadline, subtotal, discount || 0, tax, total, newStatus, id
        ]);

        await conn.query("DELETE FROM quotation_items WHERE quotation_id = ?", [id]);
        await conn.query("DELETE FROM quotation_terms WHERE quotation_id = ?", [id]);

        for (const item of items) {
            await conn.query(`
                INSERT INTO quotation_items
                (quotation_id, item_id, description, qty, price, tax_id, tax_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                id, item.item_id, item.description,
                item.qty, item.price, item.tax_id, item.tax_rate || 0
            ]);
        }

        for (const term of terms) {
            await conn.query(`
                INSERT INTO quotation_terms
                (quotation_id, term_number, nominal, term_percentage, term_estimate)
                VALUES (?, ?, ?, ?, ?)
            `, [
                id, term.term_number, term.nominal,
                term.term_percentage, term.term_estimate || null
            ]);
        }

        await conn.commit();
        res.json({ message: "Quotation berhasil diperbarui" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
});

/* ======================================================
   DELETE QUOTATION (ONLY DRAFT)
====================================================== */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [[q]] = await conn.query(
            "SELECT status FROM quotation WHERE id = ?",
            [id]
        );

        if (!q) return res.status(404).json({ message: "Quotation not found" });
        if (q.status !== "draft") {
            return res.status(400).json({
                message: "Hanya quotation draft yang bisa dihapus"
            });
        }

        await conn.query("DELETE FROM quotation_items WHERE quotation_id = ?", [id]);
        await conn.query("DELETE FROM quotation_terms WHERE quotation_id = ?", [id]);
        await conn.query("DELETE FROM quotation WHERE id = ?", [id]);

        await conn.commit();
        res.json({ message: "Quotation berhasil dihapus" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
});



// SEND
router.put("/:id/send", async (req, res) => {
    const { id } = req.params;

    const [result] = await db.query(`
        UPDATE quotation SET status = 'sent'
        WHERE id = ? AND status IN ('draft','revised')
    `, [id]);

    if (!result.affectedRows) {
        return res.status(400).json({ message: "Quotation tidak bisa dikirim" });
    }

    res.json({ message: "Quotation sent" });
});

// PUBLISH 
router.put("/:id/publish", async (req, res) => {
    const { id } = req.params;

    const [result] = await db.query(`
        UPDATE quotation SET status = 'sent'
        WHERE id = ? AND status IN ('draft','revised')
    `, [id]);

    if (!result.affectedRows) {
        return res.status(400).json({ message: "Quotation tidak bisa dipublish" });
    }

    res.json({ message: "Quotation berhasil dipublish" });
});


// CONVERT QUOTATION TO INVOICE (DRAFT)
router.post("/:id/convert-to-invoice", async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        /* 1. VALIDASI QUOTATION */
        const [[quotation]] = await conn.query(
            "SELECT * FROM quotation WHERE id = ? AND status = 'approved'",
            [id]
        );

        if (!quotation) {
            return res.status(400).json({
                message: "Quotation belum approved atau tidak ditemukan"
            });
        }

        /* 2. VALIDASI TERMIN */
        const [terms] = await conn.query(
            "SELECT * FROM quotation_terms WHERE quotation_id = ?",
            [id]
        );

        if (terms.length === 0) {
            return res.status(400).json({
                message: "Quotation belum memiliki termin pembayaran"
            });
        }

        /* 3. AMBIL TERMIN TERAKHIR */
        const lastTerm = terms[terms.length - 1];

        /* 4. GENERATE INVOICE NUMBER */
        const invoiceNumber = await generateInvoiceNumber(conn);
        if (!invoiceNumber) {
            throw new Error("Gagal generate invoice number");
        }

        /* 5. INSERT INVOICE (DRAFT TANPA TANGGAL) */
        const [invoiceResult] = await conn.query(`
            INSERT INTO invoice
            (invoice_number, quotation_id, client_id,
             issue_date, due_date,
             subtotal, discount, tax, total, status)
            VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, 'Draft')
        `, [
            invoiceNumber,
            quotation.id,
            quotation.client_id,
            quotation.subtotal,
            quotation.discount || 0,
            quotation.tax,
            quotation.total
        ]);

        const invoiceId = invoiceResult.insertId;

        /* 6. COPY ITEMS */
        const [items] = await conn.query(
            "SELECT * FROM quotation_items WHERE quotation_id = ?",
            [id]
        );

        for (const item of items) {
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

        /* 7. COPY TERMS */
        for (const term of terms) {
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
            message: "Quotation berhasil dikonversi ke invoice (Draft)",
            invoice_id: invoiceId,
            invoice_number: invoiceNumber,
            invoice_status: "Draft"
        });

    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({
            message: "Failed to convert quotation to invoice",
            error: err.message
        });
    } finally {
        conn.release();
    }
});

// CLIENT ACTION (Approve and Reject)
// APPROVE
router.put("/:id/approve", async (req, res) => {
    const { id } = req.params;

    const [result] = await db.query(`
        UPDATE quotation SET status = 'approved'
        WHERE id = ? AND status IN ('sent', 'revised')
    `, [id]);

    if (!result.affectedRows) {
        return res.status(400).json({ message: "Quotation tidak bisa di-approve" });
    }

    res.json({ message: "Quotation approved" });
});

// REJECT
router.put("/:id/reject", async (req, res) => {
    const { id } = req.params;

    const [result] = await db.query(`
        UPDATE quotation SET status = 'rejected'
        WHERE id = ? AND status = 'sent'
    `, [id]);

    if (!result.affectedRows) {
        return res.status(400).json({ message: "Quotation not found" });
    }

    res.json({ message: "Quotation rejected" });
});



module.exports = router;


/* =========================================================
   TESTING VIA POSTMAN
=========================================================

 GET ALL QUOTATION
GET http://localhost:3000/api/quotations

----------------------------------------------------------

 GET QUOTATION DETAIL
GET http://localhost:3000/api/quotations/1

----------------------------------------------------------

 CREATE QUOTATION (MULTI TERMIN)
POST http://localhost:3000/api/quotations
Body (raw JSON):
{
  "client_id": 1,
  "estimate_date": "2024-10-01",
  "expiry_date": "2024-10-15",
  "project_title": "Website Company Profile",
  "start_date": "2024-10-01",
  "deadline": "2024-12-01",
  "subtotal": 1000000,
  "discount": 0,
  "tax": 90000,
  "total": 1090000,
  "items": [
    {
      "item_id": 1,
      "description": "Development",
      "qty": 1,
      "price": 1000000,
      "tax_id": 1,
      "tax_rate": 9
    }
  ],
  "terms": [
    {
      "term_number": 1,
      "nominal": 545000,
      "term_percentage": 50,
      "term_estimate": "2024-10-15"
    },
    {
      "term_number": 2,
      "nominal": 545000,
      "term_percentage": 50,
      "term_estimate": "2024-11-15"
    }
  ]
}

----------------------------------------------------------

UPDATE QUOTATION
PUT http://localhost:3000/api/quotations/1

 RULE:
- status = draft → boleh edit
- status = rejected → boleh edit (status otomatis jadi revised)
- status = revised → boleh edit
- status = sent / approved → TIDAK BOLEH edit

----------------------------------------------------------

CLIENT ACTION (STATUS FLOW)

SEND QUOTATION
PUT http://localhost:3000/api/quotations/1/send
(draft / revised → sent)

APPROVE QUOTATION (CLIENT)
PUT http://localhost:3000/api/quotations/1/approve
(sent / revised → approved)

REJECT QUOTATION (CLIENT)
PUT http://localhost:3000/api/quotations/1/reject
(sent → rejected)

----------------------------------------------------------

 CONVERT TO INVOICE
POST http://localhost:3000/api/quotations/1/convert-to-invoice

 RULE:
- HANYA quotation dengan status "approved" yang bisa di convert

----------------------------------------------------------

 DELETE QUOTATION
DELETE http://localhost:3000/api/quotations/1

 NOTE:
- Pastikan quotation belum digunakan di invoice
- Akan menghapus:
  - quotation
  - quotation_items
  - quotation_terms

========================================================= */
