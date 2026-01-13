const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET All Item
router.get("/", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM item");
        res.json(results);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET Item by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.query("SELECT * FROM item WHERE id = ?", [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CREATE New Item
router.post("/", async (req, res) => {
    const { item_name, description, category, default_price } = req.body;
    const insertItemSql = "INSERT INTO item (item_name, description, category, default_price) VALUES (?, ?, ?, ?)";

    try {
        await db.query(insertItemSql, [item_name, description, category, default_price]);
        res.json({ message: "Item berhasil di tambahkan!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error", detail: err.sqlMessage });
    }
});

// UPDATE Item
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { item_name, description, category, default_price } = req.body;
    const updateItemSql = "UPDATE item SET item_name = ? , description = ?, category = ?, default_price = ? WHERE id = ?";

    try {
        await db.query(updateItemSql, [item_name, description, category, default_price, id]);
        res.json({ message: "Item berhasil diperbarui!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error", detail: err.sqlMessage });
    }
});

// DELETE Item
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const deleteItemSql = "DELETE FROM item WHERE id = ?";

    try {
        await db.query(deleteItemSql, [id]);
        res.json({ message: "Item berhasil dihapus!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error", detail: err.sqlMessage });
    }
});

module.exports = router;

// Cara Test di POSTMAN
// GET http://localhost:3000/api/items/
// GET http://localhost:3000/api/items/1
// POST http://localhost:3000/api/items/
// PUT http://localhost:3000/api/items/1
// DELETE http://localhost:3000/api/items/1
