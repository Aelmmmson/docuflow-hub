const mysql = require("mysql");
const util = require("util");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dms_db_live",
  port: parseInt(process.env.DB_PORT || "3307"),
});

const query = util.promisify(connection.query).bind(connection);

async function run() {
  console.log(`Connected to database: ${process.env.DB_NAME || "dms_db_live"} on port ${process.env.DB_PORT || "3307"}`);

  // Helper to safely add column if not exists
  async function addColumnIfNotExists(table, column, definition) {
    const cols = await query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
    if (!cols || cols.length === 0) {
      console.log(`Adding column \`${column}\` to table \`${table}\`...`);
      await query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      console.log(`Column \`${column}\` added successfully.`);
    } else {
      console.log(`Column \`${column}\` already exists in \`${table}\`.`);
    }
  }

  try {
    // 1. Add columns to doc_approval_setups
    await addColumnIfNotExists("doc_approval_setups", "scope", "VARCHAR(20) DEFAULT 'BRANCH'");
    await addColumnIfNotExists("doc_approval_setups", "is_required", "TINYINT(1) DEFAULT 0");
    await addColumnIfNotExists("doc_approval_setups", "threshold_amount", "DECIMAL(15,2) DEFAULT 0.00");
    await addColumnIfNotExists("doc_approval_setups", "quorum_count", "INT DEFAULT 1");

    // 2. Add columns to users
    await addColumnIfNotExists("users", "approval_limit", "DECIMAL(15,2) DEFAULT 0.00");

    // 3. Add columns to request_documents
    await addColumnIfNotExists("request_documents", "routing_log", "LONGTEXT DEFAULT NULL");

    console.log("Database schema update for Tiered Approval Workflow completed successfully.");
  } catch (err) {
    console.error("Error updating schema:", err);
  } finally {
    connection.end();
  }
}

run();
