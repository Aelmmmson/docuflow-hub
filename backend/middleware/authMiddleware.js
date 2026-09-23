require('dotenv').config()
const apiKey = process.env.API_KEY;
const jwt = require("jsonwebtoken");
const helper = require("../controllers/helper");
const { access } = require('fs');
const { refreshToken } = require('firebase-admin/app');
const passwordResetTokenCollection = "password_reset_tokens";

function checkApiKey(req, res, next) {
    console.log("Checking API Key for path:", req.path);
	if (req.path.startsWith("/v1/api")) {
		const providedKey = req.headers["x-api-key"];

		if (!providedKey || providedKey !== apiKey) {
			return res.status(401).json({ error: "Unauthorized1" });
		}

		next();
	} else {
		next();
	}
}

const checkToken = (req, res, next) => {
	try {
		const token = req.headers.authorization || req.headers.Authorization;
		if (!token?.startsWith("Bearer ")) {
			return res.status(401).json({ error: "Unauthorized2" });
		}
		
		access_token = token.split(" ")[1];
		// console.log(access_token)
		jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
			if (err) {
				console.log("checking token expired",user);
				// data = {email: user.email}
				// const deleted = await helper.deleteRecordsWithCondition(passwordResetTokenCollection, [data]);
				// if (deleted.status === "success") {
				// 	return res.status(403).json({ error: "Forbidden" });
				// }
				// return res.status(403).json({ error: "Forbidden check" });
			}

			// console.log(user);
			// req.email = user.email;
			next();
		});
	} catch (error) {
		console.log(error)
		
	}
	
};

const handleRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        const refreshToken = cookies?.refreshToken || req.headers["x-refresh-token"];

        if (!refreshToken) {
            return res.status(401).json({ error: "Unauthorized - No refresh token", code: "401" });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "refresh_secret", async (err, decoded) => {
            if (err || !decoded?.email) {
                return res.status(403).json({ error: "Forbidden - Invalid refresh token", code: "403" });
            }

            const email = decoded.email;
            const query = `SELECT u.id AS user_id, u.first_name, u.last_name, u.employee_id, u.email, u.signature, 
                                 r.id AS role_id, r.name AS role_name 
                          FROM users u 
                          JOIN model_has_roles m ON u.id = m.model_id 
                          JOIN roles r ON r.id = m.role_id 
                          WHERE u.email = ?`;
                    
            const userDetails = await helper.selectRecordsWithQuery(query, [email]);

            if (userDetails.status === "success" && userDetails.data && userDetails.data.length > 0) {
                const userData = userDetails.data[0];

                const axios = require("axios");
                const headers = { "x-api-key": process.env.HR_MOBILE_API_KEY || "81780c52fe24634d0ab7164a6e7a74c908da568a906111db" };

                let masterBranches = [];
                let allEmployees = [];
                try {
                    const hrBranchRes = await axios.get("http://10.203.14.114:3099/v1/api/hr/me/branches", { headers, timeout: 5000 });
                    masterBranches = hrBranchRes.data?.data?.branches || [];

                    let page = 1;
                    let totalPages = 1;
                    do {
                        const empRes = await axios.get(`http://10.203.14.114:3099/v1/api/hr/me/employees?limit=200&page=${page}`, { headers, timeout: 5000 });
                        const data = empRes.data?.data;
                        if (data && Array.isArray(data.employees)) {
                            allEmployees.push(...data.employees);
                            totalPages = data.pages || 1;
                        }
                        page++;
                    } while (page <= totalPages);
                } catch (hrErr) {
                    console.error("[HR API FAILURE in handleRefreshToken]:", hrErr.message);
                    return res.status(503).json({ error: "HR API Service Unavailable", code: "503" });
                }

                const hrEmp = allEmployees.find((e) =>
                    (e.employeeCode && String(e.employeeCode).trim().toLowerCase() === String(userData.employee_id).trim().toLowerCase()) ||
                    (e.workEmail && String(e.workEmail).trim().toLowerCase() === String(userData.email).trim().toLowerCase()) ||
                    (e.email && String(e.email).trim().toLowerCase() === String(userData.email).trim().toLowerCase())
                );

                const rawBranchVal = hrEmp?.branch || hrEmp?.branchCode;
                let matchedBranch = null;
                if (rawBranchVal && Array.isArray(masterBranches)) {
                    const str = String(rawBranchVal).trim();
                    const padded = str.padStart(3, '0');
                    matchedBranch = masterBranches.find(b => 
                        String(b.id).trim() === str || 
                        String(b.code).trim() === str || 
                        String(b.code).trim() === padded ||
                        b.name.toLowerCase().includes(str.toLowerCase()) ||
                        (b.description && b.description.toLowerCase().includes(str.toLowerCase()))
                    );
                }

                if (matchedBranch) {
                    const limitQuery = `SELECT approval_limit FROM branch_approval_limits WHERE branch_id = ? LIMIT 1`;
                    const limitRes = await helper.selectRecordsWithQuery(limitQuery, [String(matchedBranch.id)]).catch(() => null);
                    const limitVal = (limitRes && limitRes.data && limitRes.data.length > 0) ? parseFloat(limitRes.data[0].approval_limit) : 0;

                    userData.branch = {
                        id: String(matchedBranch.id),
                        description: `${matchedBranch.name} (${matchedBranch.code})`,
                        approval_limit: limitVal
                    };
                    userData.branch_id = String(matchedBranch.id);
                } else {
                    userData.branch = null;
                    userData.branch_id = null;
                }

                const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET || "access_secret", { expiresIn: "60m" });
                return res.status(200).json({ accessToken, user: [userData], code: "200" });
            } else {
                return res.status(403).json({ error: "Forbidden - User not found", code: "403" });
            }
        });

    } catch (error) {
        console.error("Error in handleRefreshToken:", error);
        return res.status(500).json({ error: "Internal Server Error", code: "500" });
    }
};

module.exports = { checkApiKey, checkToken, handleRefreshToken };
