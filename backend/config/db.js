const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "track_invoice",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("Database connected!");

module.exports = db;
