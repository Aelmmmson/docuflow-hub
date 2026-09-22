const helper = require("./helper"); //access helper functions
require("dotenv").config();
const pool = require("../mysqlconfig");
const cache = require("memory-cache");
const connection = require("../mysqlconfig");
const newsCollection = "news";
const messageCollection = "messages";


/***********************************************************************************************************
 * handles all approver setups and all related activity in the app
 * 
 * Activities in {
	* getApproverSetups() - get all the approver setups,
	* getApproverUsers() - get all the users who are approvers,
	* createApproverSetup() - create an approval flow for documents 
	* updateApproverSetup() - update the approval flow for documents
 * }
 ***************************************************************************************************************/

//just for testing of api speed
const testSpeed = async (req, res) => {
	console.log("testing api");
	res.status(200).json({ result: "ok 1" });
	// return;
};

//returns all the document types
const getApproverSetups = async (req, res) => {
	try {
	  const query = `select DISTINCT(count(doctype_id)) approval_stages,doc_approval_setups.id,description,doctype_id,sum(number_of_approvers) number_of_approvers,sum(number_of_mandatory_approvers) mandatory_approvers,details from doc_approval_setups join code_creation_details ON code_creation_details.id = doc_approval_setups.doctype_id GROUP BY doctype_id`;
  
	  // Get a connection from the pool
	  pool.getConnection((err, connection) => {
		if (err) {
		  console.error("Error getting connection from pool: ", err);
		  res.status(500).json({ error: "Database connection failed." });
		  return;
		}
  
  
		// Execute the query
		connection.query(query, (err, results) => {
		  if (err) {
			console.error("Error executing query: ", err);
			res.status(500).json({ error: "Query execution failed." });
		  } else {
			// console.log("Query successful: ", results);
			res.status(200).json({
			  setups: results,
			  code: "200",
			});
		  }
  
		  // Release the connection back to the pool
		  connection.release();
		});
	  });
	} catch (error) {
	  console.error("Unexpected error: ", error);
	  res.status(500).json({ error: "An unexpected error occurred." });
	}
};

//returns all users with approver role
const getApproverUsers = async (req, res) => {
    const { branch_id, scope } = req.query;
    let query = `SELECT users.id as userId, concat(users.first_name, " ", users.last_name) as name, roles.name as role,
        roles.name as role_name, COALESCE(users.branch_id, users.branch) as branch_id, users.branch as branch_name,
        CASE 
        WHEN users.status = 1 THEN 'Active'
        WHEN users.status = 0 THEN 'Inactive'
        ELSE users.status 
        END as status
        FROM users
        JOIN model_has_roles ON users.id = model_has_roles.model_id
        JOIN roles ON model_has_roles.role_id = roles.id 
        WHERE (LOWER(roles.name) LIKE '%approver%' OR LOWER(roles.name) = 'approver')
          AND (users.status = 1 OR users.status = '1' OR users.status = 'Active')`;

    const queryParams = [];
    if (branch_id && scope !== 'HEAD_OFFICE') {
        query += ` AND (users.branch_id = ? OR users.branch = ?)`;
        queryParams.push(String(branch_id), String(branch_id));
    }

    query += ` ORDER BY users.first_name ASC`;

    // Get a connection from the pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error getting connection from pool: ", err);
            res.status(500).json({ error: "Database connection failed." });
            return;
        }

        // Execute the query
        connection.query(query, queryParams, (err, results) => {
            if (err) {
                console.error("Error executing query: ", err);
                res.status(500).json({ error: "Query execution failed." });
            } else {
                res.status(200).json({
                    approvers: results || [],
                    code: "200",
                });
            }

            // Release the connection back to the pool
            connection.release();
        });
    });
}

/**
 * Creates an approver setup for a document type
 * @param {Object} req - Request object containing doctype_id and stages
 * @param {Object} res - Response object
 * @returns {Object} JSON response with setup status
 */
const createApproverSetup = async (req, res) => {
    try {
        const { doctype_id, stages,posted_by } = req.body;

        // Validate required fields
        if (!doctype_id || !stages) {
            return res.status(400).json({
                message: 'document type and the number of stages are required',
                code: '400'
            });
        }

        const num_of_stages = stages.length;
        let approval_stage = 1;

        // Loop through each stage
        for (const stage of stages) {
            const stage_name = stage.name;
            const quorum = stage.quorum;
            const num_of_approvers = stage.approvers ? stage.approvers.length : 0;
            let mandatory_approvers = 0;

            if (stage.approvers && Array.isArray(stage.approvers) && stage.approvers.length > 0) {
                for (const approver of stage.approvers) {
                    if (approver.isMandatory) mandatory_approvers++;
                    if (approver.userId) {
                        await helper.dynamicInsert('doc_approvers', {
                            doctype_id: doctype_id,
                            approver_id: approver.userId,
                            is_mandatory: approver.isMandatory ? 1 : 0,
                            approval_stage: approval_stage
                        }).catch(() => {});
                    }
                }
            }

            // Insert stage setup
            const setupData = {
                doctype_id: doctype_id,
                approval_stage: approval_stage,
                stage_desc: stage_name,
                number_of_approvers: num_of_approvers,
                number_of_mandatory_approvers: mandatory_approvers,
                quorum: 1,
                approvers: JSON.stringify(stage.approvers || []),
                details: JSON.stringify(stages),
                posted_by: posted_by || 1,
                scope: approval_stage === 1 ? 'BRANCH' : 'HEAD_OFFICE',
                is_required: approval_stage === 1 ? 1 : (stage.isRequired || stage.is_required ? 1 : 0),
                threshold_amount: parseFloat(stage.threshold_amount || stage.threshold || 0),
                quorum_count: 1
            };

            const setupResult = await helper.dynamicInsert('doc_approval_setups', setupData);
            if (setupResult.status !== 'success') {
                return res.status(500).json({
                    message: 'Failed to create approval setup stage',
                    code: '500'
                });
            }

            approval_stage++;
        }

        return res.status(200).json({
            message: 'Approver setup created successfully',
            code: '200'
        });

    } catch (error) {
        console.error('Error in createApproverSetup:', error);
        return res.status(500).json({
            message: 'Failed to create setup',
            error: error.message,
            code: '500'
        });
    }
};

/**
 * Updates an existing approver setup for a document type
 */
const updateApproverSetup = async (req, res) => {
    try {
        const { doctype_id, stages, posted_by } = req.body;

        if (!doctype_id || !stages) {
            return res.status(400).json({
                message: 'document type and stages are required',
                code: '400'
            });
        }

        const data = { doctype_id: doctype_id };
        await helper.deleteRecordsWithCondition('doc_approvers', [data]);
        await helper.deleteRecordsWithCondition('doc_approval_setups', [data]);

        let approval_stage = 1;

        for (const stage of stages) {
            const stage_name = stage.name;
            const num_of_approvers = stage.approvers ? stage.approvers.length : 0;
            let mandatory_approvers = 0;

            if (stage.approvers && Array.isArray(stage.approvers) && stage.approvers.length > 0) {
                for (const approver of stage.approvers) {
                    if (approver.isMandatory) mandatory_approvers++;
                    if (approver.userId) {
                        await helper.dynamicInsert('doc_approvers', {
                            doctype_id: doctype_id,
                            approver_id: approver.userId,
                            is_mandatory: approver.isMandatory ? 1 : 0,
                            approval_stage: approval_stage
                        }).catch(() => {});
                    }
                }
            }

            const setupData = {
                doctype_id: doctype_id,
                approval_stage: approval_stage,
                stage_desc: stage_name,
                number_of_approvers: num_of_approvers,
                number_of_mandatory_approvers: mandatory_approvers,
                quorum: 1,
                approvers: JSON.stringify(stage.approvers || []),
                details: JSON.stringify(stages),
                posted_by: posted_by || 1,
                scope: approval_stage === 1 ? 'BRANCH' : 'HEAD_OFFICE',
                is_required: approval_stage === 1 ? 1 : (stage.isRequired || stage.is_required ? 1 : 0),
                threshold_amount: parseFloat(stage.threshold_amount || stage.threshold || 0),
                quorum_count: 1
            };

            const setupResult = await helper.dynamicInsert('doc_approval_setups', setupData);
            if (setupResult.status !== 'success') {
                return res.status(500).json({
                    message: 'Failed to update approval setup stage',
                    code: '500'
                });
            }

            approval_stage++;
        }

        return res.status(200).json({
            message: 'Approver setup updated successfully',
            code: '200'
        });

    } catch (error) {
        console.error('Error in updateApproverSetup:', error);
        return res.status(500).json({
            message: 'Failed to update setup',
            error: error.message,
            code: '500'
        });
    }
};

/**
 * Verifies if a Document Type has valid, active approvers configured
 * @param {Object} req - Request object containing doctypeId
 * @param {Object} res - Response object
 */
const verifyDocTypeApprovers = async (req, res) => {
    try {
        const doctypeId = req.params.doctypeId;
        if (!doctypeId) {
            return res.status(400).json({
                isValid: false,
                status: "INVALID_PARAM",
                message: "Document Type ID is required",
                code: "400"
            });
        }

        // Query configured approvers joined with user status
        const query = `
            SELECT 
                da.id,
                da.doctype_id,
                da.approver_id,
                da.is_mandatory,
                da.approval_stage,
                u.id AS user_id,
                CONCAT(u.first_name, ' ', u.last_name) AS user_name,
                u.status AS user_status
            FROM doc_approvers da
            LEFT JOIN users u ON da.approver_id = u.id
            WHERE da.doctype_id = ?
        `;

        const approversResult = await helper.selectRecordsWithQuery(query, [doctypeId]);
        const approverRows = approversResult.data || [];

        if (approverRows.length === 0) {
            return res.status(200).json({
                isValid: false,
                status: "NO_APPROVERS",
                message: "No approval workflow is configured for this Document Type. Please configure approver setups before creating requests of this type.",
                inactiveApprovers: [],
                code: "200"
            });
        }

        // Check if any approver is missing/null user OR inactive (status != 1 and status != 'Active' and status != '1')
        const inactiveOrMissing = approverRows.filter(a => {
            if (!a.user_id) return true; // User missing from database
            const status = String(a.user_status).toLowerCase().trim();
            return status !== "1" && status !== "active";
        });

        if (inactiveOrMissing.length > 0) {
            const inactiveNames = Array.from(new Set(inactiveOrMissing.map(a => a.user_name || `User ID: ${a.approver_id}`)));
            return res.status(200).json({
                isValid: false,
                status: "INACTIVE_APPROVERS",
                message: `One or more configured approvers for this Document Type are currently inactive or unavailable (${inactiveNames.join(", ")}). You cannot create requests until all required approvers are active in the system.`,
                inactiveApprovers: inactiveNames,
                code: "200"
            });
        }

        return res.status(200).json({
            isValid: true,
            status: "VALID",
            message: null,
            inactiveApprovers: [],
            code: "200"
        });

    } catch (error) {
        console.error("Error in verifyDocTypeApprovers:", error);
        return res.status(500).json({
            isValid: false,
            status: "ERROR",
            message: "Failed to verify Document Type approvers",
            code: "500"
        });
    }
};

module.exports = {
    getApproverSetups,
    getApproverUsers,
    testSpeed,
    createApproverSetup,
    updateApproverSetup,
    verifyDocTypeApprovers
};
