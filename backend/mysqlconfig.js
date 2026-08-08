require("dotenv").config();
const mysql = require("mysql");

const host = process.env.DB_HOST || "127.0.0.1";
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "";
const database = process.env.DB_NAME || "dms_db";
const port = parseInt(process.env.DB_PORT || "3306", 10);

// Create connection & pool using environment settings
const pool = mysql.createPool({
  connectionLimit: 10,
  host,
  port,
  user,
  password,
  database,
});

module.exports = pool;
