const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET All Client
router.get("/", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM client");
        res.json(results);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET Client by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.query("SELECT * FROM client WHERE id = ?", [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CREATE New Client
router.post("/", async (req, res) => {
    const { company_name, pic_name, email, address, contact, username, password } = req.body;
    try {
        const insertClientSql = "INSERT INTO client (company_name, pic_name, email, address, contact) VALUES (?, ?, ?, ?, ?)";

        const [clientResult] = await db.query(insertClientSql, [company_name, pic_name, email, address, contact]);
        const clientId = clientResult.insertId;

        // 2. Jika username & password ada, insert ke users dan update client.user_id
        if (username && password) {
            const insertUserSql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'client')";

            const [userResult] = await db.query(insertUserSql, [username, password]);
            const userId = userResult.insertId;

            // 3. Update client.user_id
            const updateClientSql = "UPDATE client SET user_id = ? WHERE id = ?";
            await db.query(updateClientSql, [userId, clientId]);

            res.json({
                message: "Client berhasil ditambahkan dengan akun user!",
                client_id: clientId,
                user_id: userId
            });
        } else {
            // Jika tidak ada username/password, langsung response
            res.json({
                message: "Client berhasil ditambahkan!",
                client_id: clientId
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error", detail: err.message });
    }
});

// UPDATE Client
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
        company_name,
        pic_name,
        email,
        address,
        contact,
        username,
        password
    } = req.body;

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // Update basic client info
        const updateClientSql = "UPDATE client SET company_name = ?, pic_name = ?, email = ?, address = ?, contact = ? WHERE id = ?";
        await conn.query(updateClientSql, [company_name, pic_name, email, address, contact, id]);

        // Handle username and password
        if (username && password) {
            // Check if client already has a user_id
            const [clientRows] = await conn.query("SELECT user_id FROM client WHERE id = ?", [id]);
            const client = clientRows[0];

            if (client.user_id) {
                // Update existing user
                await conn.query("UPDATE users SET username = ?, password = ? WHERE id = ?", [username, password, client.user_id]);
            } else {
                // Create new user
                const insertUserSql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'client')";
                const [userResult] = await conn.query(insertUserSql, [username, password]);
                const userId = userResult.insertId;

                // Update client with user_id
                await conn.query("UPDATE client SET user_id = ? WHERE id = ?", [userId, id]);
            }
        }

        await conn.commit();
        res.json({
            message: "Client berhasil diperbarui!"
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: "Database error", detail: err.message });
    } finally {
        conn.release();
    }
});

// DELETE Client
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // Check if client has quotations
        const [quotationRows] = await conn.query("SELECT COUNT(*) as count FROM quotation WHERE client_id = ?", [id]);
        if (quotationRows[0].count > 0) {
            await conn.rollback();
            return res.status(400).json({ message: "Cannot delete client with existing quotations" });
        }

        // Check if client has invoices
        const [invoiceRows] = await conn.query("SELECT COUNT(*) as count FROM invoice WHERE client_id = ?", [id]);
        if (invoiceRows[0].count > 0) {
            await conn.rollback();
            return res.status(400).json({ message: "Cannot delete client with existing invoices" });
        }

        // Get user_id if exists
        const [clientRows] = await conn.query("SELECT user_id FROM client WHERE id = ?", [id]);
        const client = clientRows[0];

        // Delete associated user if exists
        if (client.user_id) {
            await conn.query("DELETE FROM users WHERE id = ?", [client.user_id]);
        }

        // Delete client
        await conn.query("DELETE FROM client WHERE id = ?", [id]);

        await conn.commit();
        res.json({ message: "Client berhasil dihapus" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: "Database error", detail: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;

// Test di Post Man
// GET All Clients: http://localhost:3000/api/clients
// GET Client by ID: http://localhost:3000/api/clients/1
// CREATE New Client: http://localhost:3000/api/clients (POST)
// UPDATE Client: http://localhost:3000/api/clients/1 (PUT)
// DELETE Client: http://localhost:3000/api/clients/1 (DELETE)
