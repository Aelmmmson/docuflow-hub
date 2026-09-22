const pool = require("../mysqlconfig");

const getBranchApprovalLimits = async (req, res) => {
  try {
    const query = `
      SELECT 
        ccd.id AS branch_id,
        ccd.description AS branch_name,
        bal.id,
        bal.approval_limit,
        bal.currency,
        bal.updated_at,
        bal.updated_by
      FROM code_creation_details ccd
      LEFT JOIN branch_approval_limits bal ON (CAST(ccd.id AS CHAR) = CAST(bal.branch_id AS CHAR))
      WHERE ccd.code_id = 1 OR ccd.code_id = '1'
      ORDER BY ccd.id ASC
    `;
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Database connection error in getBranchApprovalLimits:", err);
        return res.status(500).json({ code: 500, error: "Database connection failed." });
      }
      connection.query(query, (err, results) => {
        if (err || !results || results.length === 0) {
          // Fallback to querying branch_approval_limits directly if join yields nothing
          const fallbackQuery = `SELECT id, branch_id, branch_name, doctype_id, approval_limit, currency, updated_at, updated_by FROM branch_approval_limits ORDER BY branch_id ASC`;
          connection.query(fallbackQuery, (fErr, fResults) => {
            connection.release();
            if (fErr) {
              console.error("Query error in fallback getBranchApprovalLimits:", fErr);
              return res.status(500).json({ code: 500, error: "Error fetching branch approval limits." });
            }
            return res.status(200).json({ code: 200, limits: fResults || [] });
          });
          return;
        }
        connection.release();
        res.status(200).json({ code: 200, limits: results || [] });
      });
    });
  } catch (error) {
    console.error("Error in getBranchApprovalLimits:", error);
    res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

const updateBranchApprovalLimit = async (req, res) => {
  try {
    const { branch_id, branch_name, doctype_id, approval_limit, currency, posted_by } = req.body;
    if (!branch_id || approval_limit === undefined || approval_limit === null) {
      return res.status(400).json({ code: 400, error: "branch_id and approval_limit are required." });
    }

    const targetBranchId = String(branch_id);
    const targetDocTypeId = doctype_id !== undefined && doctype_id !== null ? doctype_id : null;
    const limitValue = parseFloat(approval_limit) || 0;
    const currValue = currency || 'GHS';

    const query = `
      INSERT INTO branch_approval_limits (branch_id, branch_name, doctype_id, approval_limit, currency, updated_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        branch_name = COALESCE(VALUES(branch_name), branch_name),
        approval_limit = VALUES(approval_limit),
        currency = VALUES(currency),
        updated_by = VALUES(updated_by)
    `;

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Database connection error in updateBranchApprovalLimit:", err);
        return res.status(500).json({ code: 500, error: "Database connection failed." });
      }
      connection.query(query, [targetBranchId, branch_name || null, targetDocTypeId, limitValue, currValue, posted_by || 'system'], (err, results) => {
        connection.release();
        if (err) {
          console.error("Query error in updateBranchApprovalLimit:", err);
          return res.status(500).json({ code: 500, error: "Error updating branch approval limit." });
        }
        res.status(200).json({ code: 200, message: "Branch approval limit updated successfully.", branch_id: targetBranchId, approval_limit: limitValue });
      });
    });
  } catch (error) {
    console.error("Error in updateBranchApprovalLimit:", error);
    res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

module.exports = {
  getBranchApprovalLimits,
  updateBranchApprovalLimit,
};
