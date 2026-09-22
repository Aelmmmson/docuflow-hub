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

pool.query("SHOW TABLES LIKE '%branch%'", (err, res) => {
  if (err) console.error(err);
  else console.log("Branch tables:", res);

  pool.query("SELECT * FROM code_creations WHERE title LIKE '%branch%' OR title LIKE '%Branch%'", (err2, res2) => {
    if (err2) console.error(err2);
    else console.log("Branch code creations:", res2);

    pool.query("SHOW COLUMNS FROM users LIKE '%branch%'", (err3, res3) => {
      if (err3) console.error(err3);
      else console.log("Users branch columns:", res3.map(r => r.Field));

      pool.query("SHOW COLUMNS FROM request_documents LIKE '%branch%'", (err4, res4) => {
        if (err4) console.error(err4);
        else console.log("Request documents branch columns:", res4.map(r => r.Field));
        process.exit(0);
      });
    });
  });
});
