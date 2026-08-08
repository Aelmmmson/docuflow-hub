const MongoClient = require("mongodb").MongoClient;
const helper = require("./helper"); //access helper functions
require("dotenv").config();
const axios = require("axios");
const cache = require("memory-cache");
const newsCollection = "news";

/***********************************************************************************************************
 * handles all stats 
 * 
 * Activities in {
 * getAdminDashboardValues() - Retrieves all dashboard related data,
 * }
 ***************************************************************************************************************/

// const getAdminDashboardValues = async (req, res) => {
//   try {
//     const { userId, role } = req.params;
    
//     // Determine if user is admin/finance/approver
//     const isAdmin = ['admin', 'finance', 'approver'].includes(role);
    
//     // Build WHERE clause based on role
//     const userFilter = isAdmin ? '' : 'AND posted_by = ?';
//     const userParams = isAdmin ? [] : [userId];

//     // Single query to get all counts at once
//     const countsQuery = `
//       SELECT 
//         COUNT(*) as total_docs,
//         COUNT(*) FILTER (WHERE status IN ('APPROVED', 'PAID')) as approved_docs,
//         COUNT(*) FILTER (WHERE status IN ('PENDING', 'DRAFT', 'SUBMITTED')) as unapproved_docs,
//         COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected_docs
//       FROM request_documents
//       WHERE 1=1 ${userFilter}
//     `;
    
//     const countsResult = await helper.selectRecordsWithQuery(countsQuery, userParams);

//     // Recent documents
//     const recentDocsQuery = `
//       SELECT rd.*, c.description AS doctype_name
//       FROM request_documents rd
//       JOIN code_creation_details c ON rd.doctype_id = c.id AND c.code_id = 2
//       WHERE 1=1 ${userFilter}
//       ORDER BY rd.id DESC
//       LIMIT 4
//     `;
//     const recentDocs = await helper.selectRecordsWithQuery(recentDocsQuery, userParams);

//     // Sum of amounts by category
//     const sumQuery = `
//       SELECT 
//         ${isAdmin ? 'SUM(COALESCE(r.approved_amount, r.requested_amount)) as requested_amount,' : 'r.requested_amount,'}
//         c.description,
//         c.color_code
//       FROM request_documents r
//       JOIN code_creation_details c ON c.id = r.doctype_id
//       WHERE r.status = 'PAID' ${userFilter}
//       ${isAdmin ? 'GROUP BY r.doctype_id, c.description, c.color_code' : ''}
//     `;
//     const sumResult = await helper.selectRecordsWithQuery(sumQuery, userParams);

//     // Document count per category
//     const categoryQuery = `
//       SELECT 
//         COUNT(r.doctype_id) as quantity,
//         c.description,
//         c.color_code
//       FROM request_documents r
//       JOIN code_creation_details c ON c.id = r.doctype_id
//       WHERE 1=1 ${userFilter}
//       GROUP BY r.doctype_id, c.description, c.color_code
//     `;
//     const categoryResult = await helper.selectRecordsWithQuery(categoryQuery, userParams);

//     // Return structured response
//     res.status(200).json({
//       result: {
//         counts: countsResult.data[0],
//         recent_documents: recentDocs.data,
//         amount_by_category: sumResult.data,
//         docs_by_category: categoryResult.data
//       },
//       status: "200"
//     });

//   } catch (error) {
//     console.error("Dashboard error:", error);
//     res.status(400).json({ 
//       result: "Failed to retrieve data", 
//       status: "400" 
//     });
//   }
// }; //for mysql



// const getAdminDashboardValues = async (req, res) => {
//   try {

// 		const { userId, role } = req.params;
		
// 		// Determine if user is admin/finance/approver
// 		const isAdmin = ['admin', 'finance', 'approver'].includes(role);
		
// 		// Build WHERE clause based on role
// 		const userFilter = isAdmin ? '' : 'AND posted_by = ?';
// 		const userParams = isAdmin ? [] : [userId];

// 		// MySQL-compatible counts query using CASE statements
// 		const countsQuery = `
// 		SELECT 
// 			COUNT(*) as total_docs,
// 			SUM(CASE WHEN status IN ('APPROVED', 'PAID') THEN 1 ELSE 0 END) as approved_docs,
// 			SUM(CASE WHEN status IN ('PENDING', 'DRAFT', 'SUBMITTED') THEN 1 ELSE 0 END) as unapproved_docs,
// 			SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_docs
// 		FROM request_documents
// 		WHERE 1=1 ${userFilter}
// 		`;
		
// 		const countsResult = await helper.selectRecordsWithQuery(countsQuery, userParams);

// 		// Recent documents
// 		const recentDocsQuery = `
// 		SELECT rd.*, c.description AS doctype_name
// 		FROM request_documents rd
// 		JOIN code_creation_details c ON rd.doctype_id = c.id AND c.code_id = 2
// 		WHERE 1=1 ${userFilter}
// 		ORDER BY rd.id DESC
// 		LIMIT 4
// 		`;
// 		const recentDocs = await helper.selectRecordsWithQuery(recentDocsQuery, userParams);

// 		// Sum of amounts by category
// 		const sumQuery = `
// 		SELECT 
// 			${isAdmin ? 'SUM(COALESCE(r.approved_amount, r.requested_amount)) as requested_amount,' : 'r.requested_amount,'}
// 			c.description,
// 			c.color_code
// 		FROM request_documents r
// 		JOIN code_creation_details c ON c.id = r.doctype_id
// 		WHERE r.status = 'PAID' ${userFilter}
// 		${isAdmin ? 'GROUP BY r.doctype_id, c.description, c.color_code' : ''}
// 		`;
// 		const sumResult = await helper.selectRecordsWithQuery(sumQuery, userParams);

// 		// Document count per category
// 		const categoryQuery = `
// 		SELECT 
// 			COUNT(r.doctype_id) as quantity,
// 			c.description,
// 			c.color_code
// 		FROM request_documents r
// 		JOIN code_creation_details c ON c.id = r.doctype_id
// 		WHERE 1=1 ${userFilter}
// 		GROUP BY r.doctype_id, c.description, c.color_code
// 		`;
// 		const categoryResult = await helper.selectRecordsWithQuery(categoryQuery, userParams);

// 		// Return structured response
// 		res.status(200).json({
// 		result: {
// 			counts: countsResult.data[0],
// 			recent_documents: recentDocs.data,
// 			amount_by_category: sumResult.data,
// 			docs_by_category: categoryResult.data
// 		},
// 		status: "200"
// 		});

//   } catch (error) {
// 		console.error("Dashboard error:", error);
// 		res.status(400).json({ 
// 		result: "Failed to retrieve data", 
// 		status: "400" 
// 		});
//   }
// };

const getAdminDashboardValues = async (req, res) => {
  try {
    const { userId, role } = req.params;
    const { startDate, endDate } = req.query;

    // Determine if user is admin/finance/approver
    const isAdmin = ['admin', 'finance', 'approver'].includes(role);

    // Build WHERE clause based on role with table alias support
    const buildUserFilter = (alias = '') => {
      const col = alias ? `${alias}.posted_by` : 'posted_by';
      return isAdmin ? '' : `AND ${col} = ?`;
    };

    const userFilter = buildUserFilter();
    const userFilterRd = buildUserFilter('rd');
    const userFilterR = buildUserFilter('r');

    const userParams = isAdmin ? [] : [userId];

    // Build date range filter with table alias support
    const buildDateFilter = (alias = '') => {
      const col = alias ? `${alias}.created_at` : 'created_at';
      if (startDate && endDate) return `AND DATE(${col}) BETWEEN ? AND ?`;
      if (startDate) return `AND DATE(${col}) >= ?`;
      if (endDate) return `AND DATE(${col}) <= ?`;
      return '';
    };

    const dateFilter = buildDateFilter();
    const dateFilterRd = buildDateFilter('rd');
    const dateFilterR = buildDateFilter('r');

    // Date params
    let dateParams = [];
    if (startDate && endDate) {
      dateParams = [startDate, endDate];
    } else if (startDate) {
      dateParams = [startDate];
    } else if (endDate) {
      dateParams = [endDate];
    }

    const baseParams = [...userParams, ...dateParams];

    // Counts query
    const countsQuery = `
    SELECT 
      COUNT(*) as total_docs,
      SUM(CASE WHEN status IN ('APPROVED', 'PAID') THEN 1 ELSE 0 END) as approved_docs,
      SUM(CASE WHEN status IN ('PENDING', 'DRAFT', 'SUBMITTED') THEN 1 ELSE 0 END) as unapproved_docs,
      SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_docs
    FROM request_documents
    WHERE 1=1 ${userFilter} ${dateFilter}
    `;
    const countsResult = await helper.selectRecordsWithQuery(countsQuery, baseParams);

    // Recent documents
    const recentDocsQuery = `
    SELECT rd.*, c.description AS doctype_name
    FROM request_documents rd
    JOIN code_creation_details c ON rd.doctype_id = c.id AND c.code_id = 2
    WHERE 1=1 ${userFilterRd} ${dateFilterRd}
    ORDER BY rd.id DESC
    LIMIT 4
    `;
    const recentDocs = await helper.selectRecordsWithQuery(recentDocsQuery, baseParams);

    // Sum of amounts by category
    const sumQuery = `
    SELECT 
      SUM(COALESCE(r.approved_amount, r.requested_amount)) as requested_amount,
      c.description,
      c.color_code
    FROM request_documents r
    JOIN code_creation_details c ON c.id = r.doctype_id
    WHERE r.status = 'PAID' ${userFilterR} ${dateFilterR}
    GROUP BY r.doctype_id, c.description, c.color_code
    `;
    const sumResult = await helper.selectRecordsWithQuery(sumQuery, baseParams);

    // Document count per category
    const categoryQuery = `
    SELECT 
      COUNT(r.doctype_id) as quantity,
      c.description,
      c.color_code
    FROM request_documents r
    JOIN code_creation_details c ON c.id = r.doctype_id
    WHERE 1=1 ${userFilterR} ${dateFilterR}
    GROUP BY r.doctype_id, c.description, c.color_code
    `;
    const categoryResult = await helper.selectRecordsWithQuery(categoryQuery, baseParams);

    res.status(200).json({
      result: {
        counts: countsResult.data?.[0] || { total_docs: 0, approved_docs: 0, unapproved_docs: 0, rejected_docs: 0 },
        recent_documents: recentDocs.data || [],
        amount_by_category: sumResult.data || [],
        docs_by_category: categoryResult.data || []
      },
      status: "200"
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(400).json({ 
      result: "Failed to retrieve data", 
      status: "400" 
    });
  }
};

module.exports = {
  getAdminDashboardValues
};
