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

async function checkBranches() {
  try {
    const branchesFromCode = await query("SELECT id, description, code_id FROM code_creation_details WHERE code_id = 1");
    console.log("Branches from code_creation_details (code_id=1):", branchesFromCode);

    const limits = await query("SELECT * FROM branch_approval_limits");
    console.log("Rows in branch_approval_limits:", limits);
  } catch (err) {
    console.error("Error checking database:", err);
  } finally {
    connection.end();
  }
}

checkBranches();
