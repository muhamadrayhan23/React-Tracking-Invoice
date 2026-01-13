const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET All Taxes
router.get("/", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM taxes");
        res.json(results);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET Tax by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.query("SELECT * FROM taxes WHERE id = ?", [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CREATE New Tax
router.post("/", async (req, res) => {
    const { tax_name, tax_percentage } = req.body;
    const insertTaxSql = "INSERT INTO taxes (tax_name, tax_percentage) VALUES (?, ?)";

    try {
        await db.query(insertTaxSql, [tax_name, tax_percentage]);
        res.json({ message: "Pajak berhasil di tambahkan!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error", detail: err.sqlMessage });
    }
});

// Update Tax
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { tax_name, tax_percentage } = req.body;
    const updateTaxSql = "UPDATE taxes SET tax_name = ?, tax_percentage = ? WHERE id = ?";

    try {
        await db.query(updateTaxSql, [tax_name, tax_percentage, id]);
        res.json({ message: "Pajak berhasil diperbarui" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error", detail: err.sqlMessage });
    }
});

// DELETE Tax
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const deleteTaxSql = "DELETE FROM taxes WHERE id = ?";

    try {
        await db.query(deleteTaxSql, [id]);
        res.json({ message: "Pajak berhasil dihapus!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error", detail: err.sqlMessage });
    }
});

module.exports = router;

// Cara Test di POSTMAN
// GET http://localhost:3000/api/taxes/
// GET http://localhost:3000/api/taxes/1
// POST http://localhost:3000/api/taxes/
// Body (JSON): { "tax_name": "VAT", "tax_percentage": 10 }
// PUT http://localhost:3000/api/taxes/1
// Body (JSON): { "tax_name": "Updated VAT", "tax_percentage": 12 }
// DELETE http://localhost:3000/api/taxes/1
