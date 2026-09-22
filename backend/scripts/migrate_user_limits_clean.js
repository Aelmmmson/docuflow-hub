const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3307", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dms_db_live",
  waitForConnections: true, connectionLimit: 10, queueLimit: 0
});

pool.query("SHOW COLUMNS FROM doc_approval_setups", (err, res) => {
  if (err) console.error(err);
  else console.log("doc_approval_setups columns:", res.map(r => r.Field));
  process.exit(0);
});
