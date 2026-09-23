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
                quorum_count: 1,
                scope: approval_stage === 1 ? 'BRANCH' : 'HEAD_OFFICE',
                is_required: 1,
                threshold_amount: parseFloat(stage.threshold_amount || stage.thresholdAmount || stage.threshold || 0),
                approvers: JSON.stringify(stage.approvers || []),
                details: JSON.stringify(stages),
                posted_by: posted_by || 1
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
                quorum_count: 1,
                scope: approval_stage === 1 ? 'BRANCH' : 'HEAD_OFFICE',
                is_required: 1,
                threshold_amount: parseFloat(stage.threshold_amount || stage.thresholdAmount || stage.threshold || 0),
                approvers: JSON.stringify(stage.approvers || []),
                details: JSON.stringify(stages),
                posted_by: posted_by || 1
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
        const branchId = req.query.branch_id || req.query.branch;
        const branchName = req.query.branch_name || req.query.branch_desc || "";

        if (!doctypeId) {
            return res.status(400).json({
                isValid: false,
                status: "INVALID_PARAM",
                message: "Document Type ID is required",
                code: "400"
            });
        }

        // 1. Check if Document Type has an approval setup configured in doc_approval_setups or doc_approvers
        const setupQuery = `SELECT id, doctype_id FROM doc_approval_setups WHERE doctype_id = ? LIMIT 1`;
        const setupRes = await helper.selectRecordsWithQuery(setupQuery, [doctypeId]);

        const approversQuery = `
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

        const approversResult = await helper.selectRecordsWithQuery(approversQuery, [doctypeId]);
        const approverRows = approversResult.data || [];
        const hasSetup = (setupRes.data && setupRes.data.length > 0) || approverRows.length > 0;

        if (!hasSetup) {
            return res.status(200).json({
                isValid: false,
                status: "NO_APPROVERS",
                message: "No approval workflow is configured for this Document Type. Please configure approver setups before creating requests of this type.",
                inactiveApprovers: [],
                code: "200"
            });
        }

        // 2. Check if Originating Branch (or system) has active approvers
        if (branchId || branchName) {
            let hrData = null;
            try {
                const { fetchHrEmployeesFromSwagger } = require("./users");
                hrData = await fetchHrEmployeesFromSwagger();
            } catch (e) {
                console.warn("[verifyDocTypeApprovers] Could not fetch HR data:", e.message);
            }

            const usersQuery = `
                SELECT u.id, u.first_name, u.last_name, u.email, u.employee_id, u.status, r.name as role
                FROM users u
                JOIN model_has_roles mhr ON u.id = mhr.model_id
                JOIN roles r ON mhr.role_id = r.id
                WHERE (LOWER(r.name) LIKE '%approver%' OR LOWER(r.name) = 'admin' OR LOWER(r.name) = 'md' OR LOWER(r.name) LIKE '%managing director%')
                  AND (u.status = 1 OR u.status = '1' OR u.status = 'Active')
            `;
            const activeUsersRes = await helper.selectRecordsWithQuery(usersQuery);
            const activeUsers = activeUsersRes.data || [];

            const cleanBranchStr = (str) => {
                if (!str) return "";
                return String(str)
                    .replace(/\([^)]*\)/g, "")
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .toLowerCase()
                    .replace(/^0+/, "");
            };

            const cleanBranchCode = (str) => {
                if (!str) return "";
                const parenMatch = String(str).match(/\((\d+)\)/);
                if (parenMatch) return parenMatch[1].replace(/^0+/, "");
                const digits = String(str).replace(/[^0-9]/g, "").replace(/^0+/, "");
                return digits;
            };

            const targetCode1 = cleanBranchCode(branchId);
            const targetCode2 = cleanBranchCode(branchName);
            const targetStr = cleanBranchStr(branchName);

            let branchApproversCount = 0;
            if (hrData && Array.isArray(hrData.employees)) {
                const { masterBranches, employees } = hrData;
                const empMap = new Map();
                employees.forEach((e) => {
                    if (e.employeeCode) empMap.set(String(e.employeeCode).trim().toLowerCase(), e);
                    if (e.workEmail) empMap.set(String(e.workEmail).toLowerCase().trim(), e);
                    if (e.email) empMap.set(String(e.email).toLowerCase().trim(), e);
                });

                const resolveHrBranch = (rawVal, masterBranches) => {
                    if (!rawVal || !Array.isArray(masterBranches) || masterBranches.length === 0) return null;
                    const str = String(rawVal).trim();
                    const padded = str.padStart(3, '0');
                    return masterBranches.find(b => 
                        String(b.id).trim() === str || 
                        String(b.code).trim() === str || 
                        String(b.code).trim() === padded ||
                        b.name.toLowerCase().includes(str.toLowerCase()) ||
                        (b.description && b.description.toLowerCase().includes(str.toLowerCase()))
                    );
                };

                activeUsers.forEach((u) => {
                    const hrEmp = empMap.get(String(u.employee_id || "").trim().toLowerCase()) || empMap.get(String(u.email || "").toLowerCase().trim());
                    const rawBranchVal = hrEmp?.branch || hrEmp?.branchCode;
                    const matchedBranch = resolveHrBranch(rawBranchVal, masterBranches);

                    const userBId = matchedBranch ? String(matchedBranch.id) : String(rawBranchVal || "");
                    const userBName = matchedBranch ? `${matchedBranch.name} (${matchedBranch.code})` : (rawBranchVal ? String(rawBranchVal) : "");

                    const uCode1 = cleanBranchCode(userBId);
                    const uCode2 = cleanBranchCode(userBName);
                    const uCode3 = cleanBranchCode(rawBranchVal);
                    const uStr = cleanBranchStr(userBName);

                    const isCodeMatch = (targetCode1 && (targetCode1 === uCode1 || targetCode1 === uCode2 || targetCode1 === uCode3)) ||
                                        (targetCode2 && (targetCode2 === uCode1 || targetCode2 === uCode2 || targetCode2 === uCode3));

                    const isNameMatch = targetStr && uStr && (targetStr === uStr || targetStr.includes(uStr) || uStr.includes(targetStr));

                    if (isCodeMatch || isNameMatch) {
                        branchApproversCount++;
                    }
                });
            }

            if (branchApproversCount === 0) {
                const displayBranchStr = branchName || `Branch ${branchId}`;
                return res.status(200).json({
                    isValid: false,
                    status: "NO_BRANCH_APPROVERS",
                    message: `Originating branch (${displayBranchStr}) has no active approvers configured in the system. Requests cannot be created until an active approver is assigned to your branch.`,
                    inactiveApprovers: [],
                    code: "200"
                });
            }
        }

        // 3. Check if any specific configured approver for this doctype is inactive
        if (approverRows.length > 0) {
            const inactiveOrMissing = approverRows.filter(a => {
                if (!a.user_id) return true;
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
