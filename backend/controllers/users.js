const helper = require("./helper");
const bcrypt = require("bcrypt"); //import bcrypt for hashing
const saltRounds = 10; //the number of time the password will be hashed with a unique salt{unique number}
const loggedInUsersCollection = "loggedInUsers";
const usersCollection = "users";
const rolesCollection = "roles";
const passwordResetTokenCollection = "password_reset_tokens";
const pool = require("../mysqlconfig");
const jwt = require("jsonwebtoken");
const { refreshToken } = require("firebase-admin/app");
const { notifyPasswordReset } = require("../services/emailService");
require("dotenv").config();

/***********************************************************************************************************
 * usercontroller handles all user creation and authentication and any other user-related activity in the app
 * 
 * Activities include {
	* register() - to add new users,
	* login() - to authenticate user,
	* logout() - to unauthenticate a user,
	* getUsers() - to get all users in the app,
	* getUser() - get a single user
	* deactivateUser() - to deactivate a user,
	* updateUser() - to change the details of a user,
	* changeUserPassword() -  to reset user password
	* checkForUniqueEmail() - handles the checking of unique passwords
	* checkForUniquePhone() -  handles the checking of unique phone numbers
 * }
 * 
 ***************************************************************************************************************/

//handles the registration of users in the system
const register = async (req, res) => {
	try {
		// Access and validate data from the request body
		const { employee_id, first_name, last_name, email, rank, phone, status, role, posted_by, signature } = req.body;

		// Pass data entry into array
		const dataEntry = [
			{ name: "employee id", value: employee_id },
			{ name: "firstname", value: first_name },
			{ name: "last name", value: last_name },
			{ name: "email", value: email },
			// { name: "phone", value: phone },
			{ name: "user role", value: role },
			{ name: "status", value: status },
			{ name: "posted by", value: posted_by },
		];

		// Check for null or empty values from data entry
		const result = helper.checkForNullOrEmpty(dataEntry);

		if (result.status !== "success") {
			return res.status(203).json({ result: result.message, code: "203" });
		}

		
		// Check for unique values safely
		try {
			const conditions = [{ "email": email }, { "employee_id": employee_id }];
			if (phone) conditions.push({ "phone": phone });
			const isUnique = await helper.checkUniqueColumn(usersCollection, conditions);
			if (isUnique.status === "error") {
				return res.status(409).json({ result: isUnique.message || "Email, Staff ID, or Phone already registered", code: "409" });
			}
		} catch (uniqueErr) {
			console.log("User unique check conflict:", uniqueErr);
			return res.status(409).json({ result: uniqueErr.message || "User with this Email or Staff ID already exists", code: "409" });
		}


		const password = "pass1234";

		// Encrypt password
		const hashedPassword = await new Promise((resolve, reject) => {
			bcrypt.hash(password, saltRounds, (err, hash) => {
				if (err) reject(err);
				else resolve(hash);
			});
		});

		// Insert user into the database
		const data = {
			employee_id,
			first_name,
			last_name,
			phone,
			email,
			password: hashedPassword,
			posted_by,
			status,
			signature: signature || null
		};

		const insertUser = await helper.dynamicInsert(usersCollection, data);

		if(insertUser.status === "success") {
			// Insert user role into the database
			const getUser = await helper.selectRecordsWithCondition(usersCollection, [{ email: email }]);
			const userId = getUser.data[0].id;

			const getRole = await helper.selectRecordsWithCondition(rolesCollection,[{name: role}]);
			const roleId = getRole.data[0].id;

			//role data
			const roleData = {
				role_id: roleId,
				model_id: userId,
				"model_type":"App\Models\User"
			};

			const insertRole = await helper.dynamicInsert("model_has_roles", roleData);

			if (insertRole.status === "success") {
				notifyPasswordReset({
					email: email,
					recipientName: `${first_name} ${last_name}`,
					newPassword: "pass1234",
					message: "Your xDMS user account has been created. Your default temporary password is set to: <strong>pass1234</strong>."
				}).catch(err => console.error("Registration password email failed:", err));

				return res.status(201).json({ result: "User registered successfully", code: "201" });
			} else {
				return res.status(400).json({ result: insertRole.message, code: "400" });
			}

		} else {
			console.log("Error inserting user:", insertUser.message);
			const errMsg = String(insertUser.message || "");
			if (errMsg.includes("users_signature_unique") || errMsg.includes("signature")) {
				return res.status(409).json({ result: "This signature image is already registered for another user. Please upload a unique signature image.", code: "409" });
			}
			return res.status(400).json({ result: "Failed to register user: " + (insertUser.message || ""), code: "400" });
		}

	} catch (error) {
		console.error("Error during registration:", error);
		return res.status(500).json({
			result: "An error occurred, see logs for details",
			code: "500"
		});
	}
};

//handles the authentication of users of the system
const login = async (req, res) => {
	try {
		// Access data from the request body
		const { email, password } = req.body;
		console.log(req.body);
		//pass data entry into array
		const dataEntry = [
			{ name: "email", value: email },
			{ name: "password", value: password }
		];

		//check for null or empty values from data entry
		const result = helper.checkForNullOrEmpty(dataEntry);

		//if check is successful get the user's encrypted password and compare with the incoming password
		if (result.status === "success") {
			data = {email: email}
			console.log("im now entering")
			const deleted = await helper.deleteRecordsWithCondition(passwordResetTokenCollection, [data]);
			if (deleted.status === "success") {
				console.log("Token deleted successfully");
			}else{
				//delete failed
				console.log("watsup",deleted.message);
				// res.status(500).json({ error: "Internal Server Error" });
			}

			//retrieve user with that email
			const userQuery = await helper.selectRecordsWithCondition(usersCollection, [{ email: email }]);
			if (userQuery.status === "success") {
				const userPassowrd = userQuery.data[0].password;

				//check if the password is correct
				const result = await bcrypt.compare(password, userPassowrd);
				if (result) {

					const query = `SELECT u.id AS user_id,u.first_name,u.last_name,u.employee_id,u.email,u.signature,r.id AS role_id,r.name AS role_name FROM users u JOIN model_has_roles m ON u.id = m.model_id JOIN roles r ON r.id = m.role_id WHERE u.email = '${email}';`

					const userDetails = await helper.selectRecordsWithQuery(query);

					if(userDetails.status === "success"){

						//generate token
						const accessToken = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET || "access_secret", { expiresIn: "60m" });
						const refreshToken = jwt.sign({ email: email }, process.env.REFRESH_TOKEN_SECRET || "refresh_secret", { expiresIn: "1d" });

						//save the token in the database (delete old token first to prevent ER_DUP_ENTRY)
						const data = {
							email: userQuery.data[0].email,
							token: refreshToken
						};

						await helper.deleteRecordsWithCondition(passwordResetTokenCollection, [{ email: userQuery.data[0].email }]).catch(() => {});
						await helper.dynamicInsert(passwordResetTokenCollection, data).catch(() => {});

						const isProduction = process.env.NODE_ENV === "production";
						res.cookie("refreshToken", refreshToken, {
							httpOnly: true,
							sameSite: isProduction ? "None" : "Lax",
							secure: isProduction,
							maxAge: 24 * 60 * 60 * 1000
						});

						res.status(200).json({
							result: "User authenticated successfully",
							user: userDetails.data,
							accessToken: accessToken,
							code: "200"
						});
					}
				} else {
					res.status(401).json({
						result: "Password or email is incorrect",
						code: "401"
					});
				}
			}else{
				console.log("no user found",userQuery.message);
				res.status(401).json({ result: "Password or Email is incorrect", code: "401" });
			}


		} else {
			res.status(400).json({ result: result.message, code: "400" });
		}
	} catch (error) {
		console.error("[SERVER ERROR] Exception during user login:", error);
		res.status(500).json({
			result: "An error occurred, see logs for details",
			code: "500"
		});
	}
};

const logout = async (req, res) => {
	try {
		const cookies = req.cookies;
		!cookies?.refreshToken && res.status(401).json({ error: "No Content" });

		const refreshToken = cookies.refreshToken;

		//select refresh token from db 
		data = {token: refreshToken}
		const user = await helper.selectRecordsWithCondition(passwordResetTokenCollection, [data]);
		if (user.status === "success" ){
			//delete the refresh token from db
			const deleted = await helper.deleteRecordsWithCondition(passwordResetTokenCollection, [data]);
			if (deleted.status === "success") {
				res.clearCookie("refreshToken",{httpOnly:true,sameSite:'None',secure:true});
				res.status(200).json({ status: "success", message: "User logged out successfully" });
			}else{
				//delete failed
				console.log(deleted.message);
				res.status(500).json({ error: "Internal Server Error" });
			}

		}else{
			console.log(user.message);
			res.clearCookie("refreshToken",{httpOnly:true,sameSite:'None',secure:true});
			// res.sendStatus(403)
			// .json({ result: user.message, code: "403" });
		}
	} catch (error) {
		console.log(error);
		res.status(400).json({ error: "Internal Server Error"})
	}
}

//handles getting all users
const getUsers = async (req, res) => {
	try {
		// Query to get all users with their roles and formatted status
		const query = `
			SELECT u.*, r.name as role,
				CASE 
					WHEN u.status = 1 THEN 'Active'
					WHEN u.status = 0 THEN 'Inactive'
					ELSE u.status 
				END as status
			FROM users u
			JOIN model_has_roles mhr ON u.id = mhr.model_id
			JOIN roles r ON mhr.role_id = r.id`;

	    //get records
		const users = await helper.selectRecordsWithQuery(query);
		if(users.status === "success"){
			res.status(200).json({results:users.data, code:"200"});
		}else{
			console.log("Error retrieving users:", users.message);
			res.status(400).json({result:users.message, code:"400"});
		}
		
	} catch (error) {
		console.error("Error retrieving users:", error);
		res.status(500).json({ result: "Internal server error", code: "500" });
	}
};

//get a single user
const getUser = async (req, res) => {
	try {

		console.log("User ID:", req.params.userId);
		const userId = req.params.userId;
		if (!userId) {
			return res.status(400).json({ result: "User ID is required", code: "400" });
		}
		
			query = `SELECT CONCAT(users.first_name, ' ', users.last_name) AS employee, users.*, model_has_roles.role_id AS role,roles.name AS role_name FROM users JOIN model_has_roles ON users.id = model_has_roles.model_id JOIN roles ON model_has_roles.role_id = roles.id WHERE users.id = ? LIMIT 1`;
			
			//check for null or empty values from data entry
			const result = await helper.selectRecordsWithQuery(query, [userId]);

			if (result.status === "success") {
				res.status(200).json({ result: result.data, code: "200" });
			}else{
				res.status(404).json({ result: result.message, code: "404" });	
			}

	} catch (error) {
		console.error("Unexpected Error", error);
		res.status(500).json({
			result: "An error occurred, see logs for details",
			code: "500"
		});
	}
};

//delete user
const deactivateUser = async (req, res) => {
	try {
		const user = req.body.user_id;
		const deletedBy = req.body.deleted_by;

		//check if user is already logged in
		if (!await helper.isAuthUser(deletedBy)) {
			res.status(400).json({ result: "Unauthenticated User", code: "400" });
			return;
		}

		//pass data entry into array
		const dataEntry = [
			{ name: "user", value: user },
			{ name: "deleted by", value: deletedBy }
		];

		//check for null or empty values from data entry
		const result = helper.checkForNullOrEmpty(dataEntry);

		//if check is successful delete the user
		if (result.status === "success") {
			//check if user to be deleted is actually a registered user
			if (!await helper.getObjectById(usersCollection, user)) {
				res.status(200).json({ result: "no user found", code: "200" });
				return;
			}

			const deleteUser = await prisma[usersCollection].delete({
				where: {
					id: user
				}
			});

			console.log(deleteUser);

			if (deleteUser) {
				//check the loggedInUsers table to see if the user being deleted is logged in and log the user out
				if (await helper.getObjectById(loggedInUsersCollection, deleteUser.id)) {
					const deleteAuthUser = await prisma[loggedInUsersCollection].delete({
						where: {
							userId: deleteUser.id
						}
					});
				}

				res.status(200).json({ result: "User deleted", code: "200" });
			}
		} else {
			res.status(400).json({ result: result.message, code: "400" });
		}
	} catch (error) {
		console.error("[SERVER ERROR] Exception during user deletion:", error);
		res.status(500).json({
			result: "An error occurred, see logs for details",
			code: "500"
		});
	}
};

//update user
const updateUser = async(req,res) =>{
	try{
		// Access and validate data from the request body
		const { employee_id, first_name, last_name, email, rank, phone, status, role, posted_by, signature } = req.body;

		// Pass data entry into array
		const dataEntry = [
			// { name: "employee id", value: employee_id },
			// { name: "firstname", value: first_name },
			// { name: "last name", value: last_name },
			// { name: "email", value: email },
			// { name: "phone", value: phone },
			{ name: "user role", value: role },
			{ name: "status", value: status },
			{ name: "posted by", value: posted_by },
		];

		// Check for null or empty values from data entry
		const result = helper.checkForNullOrEmpty(dataEntry);

		if(result.status === "success"){
			const data = {
				employee_id,
				first_name,
				last_name,
				posted_by,
				status,
				...(signature !== undefined && signature !== null && signature !== "" ? { signature } : {})
			};

			let updateUser = await helper.dynamicUpdateWithId(usersCollection, data, req.params.userId);

			if (updateUser.status === "error") {
				const errMsg = String(updateUser.message || "");
				if (errMsg.includes("users_signature_unique") || errMsg.includes("signature")) {
					return res.status(400).json({
						result: "This signature image is already registered for another user. Please upload a unique signature image.",
						code: "400"
					});
				}
				if (errMsg.includes("users_phone_unique") || errMsg.includes("phone")) {
					return res.status(400).json({
						result: "This phone number is already registered for another user.",
						code: "400"
					});
				}
				if (errMsg.includes("users_email_unique") || errMsg.includes("email")) {
					return res.status(400).json({
						result: "This email address is already registered for another user.",
						code: "400"
					});
				}
				if (errMsg.includes("users_employee_id_unique")) {
					return res.status(400).json({
						result: "This employee ID is already registered for another user.",
						code: "400"
					});
				}
				console.log("Error updating user:", updateUser.message);
				return res.status(400).json({ result: "Failed to update user: " + (updateUser.message || ""), code: "400" });
			}

			if (updateUser.status === "success") {
				// update user role safely (case-insensitive role name match)
				const roleQuery = `SELECT * FROM roles WHERE LOWER(name) = ? LIMIT 1;`;
				const getRole = await helper.selectRecordsWithQuery(roleQuery, [String(role).toLowerCase()]);
				
				if (getRole.status === "success" && getRole.data && getRole.data.length > 0) {
					const roleId = getRole.data[0].id;
					const roleData = {
						role_id: roleId,
						model_id: req.params.userId,
						"model_type": "App\\Models\\User"
					};

					const roleUpdate = await helper.dynamicUpdateWithId("model_has_roles", roleData, req.params.userId, "model_id");

					if (roleUpdate.status === "success" || roleUpdate.message?.includes("No records updated")) {
						return res.status(200).json({ result: "User updated successfully", code: "200" });
					} else {
						return res.status(203).json({ result: roleUpdate.message, code: "203" });
					}
				} else {
					return res.status(200).json({ result: "User updated successfully", code: "200" });
				}
			} else {
				console.log("Error updating user:", updateUser.message);
				return res.status(400).json({ result: "An error occurred, see logs for details", code: "400" });
			}
		} else {
			return res.status(400).json({ result: result.message, code: "400" });
		}

	} catch(error) {
		console.error("Error updating user", error);
		return res.status(500).json({ result: "An error occurred, see logs for details", code: "500" });
	}
};

//get all user roles
const getUserRoles = async (req, res) => {
	try {
		const query = `select * from roles`;
		const roles = await helper.selectRecordsWithQuery(query);

		if(roles.message = "success"){
			console.log(roles.data);
			res.status(200).json({results:roles.data, code:"200"});
		}else{
			res.status(203).json({results:roles.message, code:"203"});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({results:"An error occurred check logs", code:"500"})
	}
}





const xauthLogin = async (req, res) => {
	try {
		const { token, staffId } = req.body;
		let staffIdentifier = staffId;

		if (token) {
			const axios = require("axios");
			const staff360Host = process.env.STAFF360_HOST || "http://10.203.14.15:8080";
			const appKey = process.env.XAUTH_APP_KEY || "";
			const appSecret = process.env.XAUTH_APP_SECRET || "";

			try {
				const decodeRes = await axios.post(`${staff360Host}/api/v1/xauth/decode`, {
					token,
					appKey,
					appSecret,
				});

				if (decodeRes.data && decodeRes.data.success && decodeRes.data.data) {
					staffIdentifier = decodeRes.data.data.staffId;
				}
			} catch (decodeErr) {
				console.warn("[XAUTH] Decode error in backend:", decodeErr.message);
			}
		}

		const staffIdVal = req.body.staffId || staffIdentifier || "";
		const userEmailVal = req.body.email || staffIdentifier || "";
		const usernameVal = req.body.username || staffIdentifier || "";

		const query = `SELECT u.id AS user_id, u.first_name, u.last_name, u.employee_id, u.email, r.id AS role_id, r.name AS role_name FROM users u JOIN model_has_roles m ON u.id = m.model_id JOIN roles r ON r.id = m.role_id WHERE u.employee_id = ? OR u.email = ? OR u.first_name = ? OR u.last_name = ? LIMIT 1;`;

		const userDetails = await helper.selectRecordsWithQuery(query, [staffIdVal, userEmailVal, usernameVal, staffIdentifier || ""]);

		if (userDetails.status === "success" && userDetails.data && userDetails.data.length > 0) {
			const email = userDetails.data[0].email;
			const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET || "access_secret", { expiresIn: "60m" });
			const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET || "refresh_secret", { expiresIn: "1d" });

			const data = { email, token: refreshToken };
			await helper.deleteRecordsWithCondition(passwordResetTokenCollection, [{ email }]).catch(() => {});
			await helper.dynamicInsert(passwordResetTokenCollection, data).catch(() => {});

			const isProduction = process.env.NODE_ENV === "production";
			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				sameSite: isProduction ? "None" : "Lax",
				secure: isProduction,
				maxAge: 24 * 60 * 60 * 1000
			});

			return res.status(200).json({
				result: "User authenticated successfully",
				user: userDetails.data,
				accessToken,
				refreshToken,
				code: "200",
			});
		} else {
			return res.status(404).json({
				result: "Your X100 account is not registered in DocuFlow. Please see the team in charge to sign you up unto the system.",
				code: "404",
			});
		}
	} catch (error) {
		console.error("Error during XAuth login:", error);
		return res.status(500).json({
			result: "An error occurred during XAuth login",
			code: "500",
		});
	}
};

const updateSelfProfile = async (req, res) => {
	try {
		const { userId, first_name, last_name, email, signature } = req.body;
		if (!userId) {
			return res.status(400).json({ result: "User ID is required", code: "400" });
		}

		const data = {};
		if (first_name !== undefined && first_name !== null) data.first_name = first_name;
		if (last_name !== undefined && last_name !== null) data.last_name = last_name;
		if (email !== undefined && email !== null) data.email = email;
		if (signature !== undefined && signature !== null) data.signature = signature;

		let updateUser = { status: "success" };
		if (Object.keys(data).length > 0) {
			try {
				updateUser = await helper.dynamicUpdateWithId(usersCollection, data, userId);
			} catch (dbErr) {
				console.warn("DB update failed, attempting column subset update:", dbErr);
				// Fallback: update only first_name, last_name, signature
				const safeData = {};
				if (first_name) safeData.first_name = first_name;
				if (last_name) safeData.last_name = last_name;
				if (signature) safeData.signature = signature;
				updateUser = await helper.dynamicUpdateWithId(usersCollection, safeData, userId);
			}
		}

		if (updateUser.status === "success" || updateUser) {
			const query = `SELECT u.id AS user_id, u.first_name, u.last_name, u.employee_id, u.email, u.signature, r.id AS role_id, r.name AS role_name FROM users u JOIN model_has_roles m ON u.id = m.model_id JOIN roles r ON r.id = m.role_id WHERE u.id = ? LIMIT 1;`;
			let userDetails = await helper.selectRecordsWithQuery(query, [userId]).catch(() => null);
			const updatedUserObj = userDetails?.data?.[0] || {
				user_id: Number(userId),
				first_name,
				last_name,
				email,
				signature,
			};
			return res.status(200).json({
				result: "Profile updated successfully",
				user: updatedUserObj,
				code: "200"
			});
		} else {
			return res.status(400).json({ result: updateUser.message || "Failed to update profile", code: "400" });
		}
	} catch (error) {
		console.error("Error updating profile:", error);
		return res.status(500).json({ result: "An error occurred updating profile: " + (error.message || ""), code: "500" });
	}
};

const changePassword = async (req, res) => {
	try {
		const { userId, currentPassword, newPassword } = req.body;
		if (!userId || !currentPassword || !newPassword) {
			return res.status(400).json({ result: "User ID, current password, and new password are required", code: "400" });
		}

		const userQuery = await helper.selectRecordsWithCondition(usersCollection, [{ id: userId }]);
		if (userQuery.status !== "success" || !userQuery.data || userQuery.data.length === 0) {
			return res.status(404).json({ result: "User not found", code: "404" });
		}

		const currentHashed = userQuery.data[0].password;
		const isMatch = await bcrypt.compare(currentPassword, currentHashed);
		if (!isMatch) {
			return res.status(401).json({ result: "Current password is incorrect", code: "401" });
		}

		const newHashed = await bcrypt.hash(newPassword, saltRounds);
		const updateRes = await helper.dynamicUpdateWithId(usersCollection, { password: newHashed }, userId);

		if (updateRes.status === "success") {
			notifyPasswordReset({
				email: userQuery.data[0].email,
				recipientName: `${userQuery.data[0].first_name || ""} ${userQuery.data[0].last_name || ""}`.trim() || "User",
				message: "Your password has been changed successfully."
			}).catch((err) => console.error("Change password email notification failed:", err));

			return res.status(200).json({ result: "Password changed successfully", code: "200" });
		} else {
			return res.status(400).json({ result: updateRes.message || "Failed to change password", code: "400" });
		}
	} catch (error) {
		console.error("Error changing password:", error);
		return res.status(500).json({ result: "An error occurred", code: "500" });
	}
};

const forgotPassword = async (req, res) => {
	try {
		const { emailOrStaffId, newPassword } = req.body;
		if (!emailOrStaffId) {
			return res.status(400).json({ result: "Email or Staff ID is required", code: "400" });
		}

		const query = `SELECT * FROM users WHERE email = ? OR employee_id = ? LIMIT 1;`;
		const userQuery = await helper.selectRecordsWithQuery(query, [emailOrStaffId, emailOrStaffId]);

		if (userQuery.status !== "success" || !userQuery.data || userQuery.data.length === 0) {
			return res.status(404).json({ result: "No account found with provided Email or Staff ID", code: "404" });
		}

		const user = userQuery.data[0];
		const passwordToSet = newPassword || "pass1234";
		const hashedPassword = await bcrypt.hash(passwordToSet, saltRounds);

		const updateRes = await helper.dynamicUpdateWithId(usersCollection, { password: hashedPassword }, user.id);
		if (updateRes.status === "success") {
			notifyPasswordReset({
				email: user.email,
				recipientName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User",
				newPassword: passwordToSet,
				message: `Your password reset request has been processed. Your temporary password is set to: <strong>${passwordToSet}</strong>.`
			}).catch((err) => console.error("Forgot password email notification failed:", err));

			return res.status(200).json({
				result: `Password reset successfully. Default password is set to: ${passwordToSet}`,
				code: "200"
			});
		} else {
			return res.status(400).json({ result: "Could not reset password", code: "400" });
		}
	} catch (error) {
		console.error("Error in forgot password:", error);
		return res.status(500).json({ result: "An error occurred", code: "500" });
	}
};

/**
 * Check if user is assigned as an active approver in any approval setup matrix (doc_approvers)
 * and analyze potential workflow deadlocks if removed.
 */
const checkUserEngagement = async (req, res) => {
  try {
    const { userId } = req.params;

    const userApproverSql = `
      SELECT da.*, dt.description AS doctype_name
      FROM doc_approvers da
      LEFT JOIN code_creation_details dt ON dt.id = da.doctype_id AND dt.code_id = 2
      WHERE da.approver_id = ?
    `;

    const userApprovalsRes = await helper.selectRecordsWithQuery(userApproverSql, [userId]);
    const userApprovals = userApprovalsRes.status === "success" ? userApprovalsRes.data : [];

    if (!userApprovals || userApprovals.length === 0) {
      return res.status(200).json({
        code: "200",
        hasEngagements: false,
        canRemoveSafely: true,
        engagements: [],
        conflicts: []
      });
    }

    const conflicts = [];
    const engagements = [];

    for (const app of userApprovals) {
      const doctypeId = app.doctype_id;
      const stageNum = app.approval_stage;
      const doctypeName = app.doctype_name || `DocType #${doctypeId}`;
      const isUserMandatory = !!app.is_mandatory;

      const stageApproversRes = await helper.selectRecordsWithQuery(
        `SELECT * FROM doc_approvers WHERE doctype_id = ? AND approval_stage = ?`,
        [doctypeId, stageNum]
      );
      const stageApprovers = stageApproversRes.status === "success" ? stageApproversRes.data : [];

      const setupResData = await helper.selectRecordsWithQuery(
        `SELECT * FROM doc_approval_setups WHERE doctype_id = ?`,
        [doctypeId]
      );
      const setupRes = setupResData.status === "success" ? setupResData.data : [];

      let stageQuorum = 1;
      if (setupRes && setupRes.length > 0) {
        stageQuorum = Number(setupRes[0].quorum || 1);
      }

      const totalStageApprovers = stageApprovers.length;
      const remainingApproversCount = totalStageApprovers - 1;
      const remainingMandatoryCount = stageApprovers.filter(a => a.is_mandatory && String(a.approver_id) !== String(userId)).length;

      let isConflict = false;
      let reason = "";

      if (remainingApproversCount < 1) {
        isConflict = true;
        reason = `Removing this user leaves Stage ${stageNum} with ZERO approvers.`;
      } else if (remainingApproversCount < stageQuorum) {
        isConflict = true;
        reason = `Removing this user drops Stage ${stageNum} approvers (${remainingApproversCount}) below required quorum (${stageQuorum}).`;
      } else if (isUserMandatory && remainingMandatoryCount < 1 && stageQuorum === 1) {
        isConflict = true;
        reason = `Removing this user leaves Stage ${stageNum} with NO mandatory approvers.`;
      }

      const engagementDetail = {
        doctypeId,
        doctypeName,
        stageNum,
        isMandatory: isUserMandatory,
        totalStageApprovers,
        remainingApproversCount,
        stageQuorum,
        isConflict,
        reason
      };

      engagements.push(engagementDetail);
      if (isConflict) {
        conflicts.push(engagementDetail);
      }
    }

    const canRemoveSafely = conflicts.length === 0;

    return res.status(200).json({
      code: "200",
      hasEngagements: true,
      canRemoveSafely,
      engagements,
      conflicts
    });

  } catch (error) {
    console.error("[USER ENGAGEMENT CHECK ERROR]:", error);
    return res.status(500).json({
      code: "500",
      result: "Failed to check user engagements",
      error: error.message
    });
  }
};

/**
 * Remove user from all doc_approvers setups
 */
const removeUserFromApprovals = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleteQuery = `DELETE FROM doc_approvers WHERE approver_id = ?`;
    
    pool.getConnection((err, connection) => {
      if (err) {
        return res.status(500).json({ code: "500", result: "Database connection failed" });
      }
      connection.query(deleteQuery, [userId], (qErr) => {
        connection.release();
        if (qErr) {
          return res.status(500).json({ code: "500", result: "Failed to delete user from approvals" });
        }
        return res.status(200).json({
          code: "200",
          message: "User successfully removed from active approval setups"
        });
      });
    });
  } catch (error) {
    console.error("[REMOVE USER FROM APPROVALS ERROR]:", error);
    return res.status(500).json({
      code: "500",
      result: "Failed to remove user from approval setups",
      error: error.message
    });
  }
};

module.exports = {
	register,
	login,
	xauthLogin,
	logout,
	getUsers,
	updateUser,
	getUser,
	getUserRoles,
	updateSelfProfile,
	changePassword,
	forgotPassword,
	checkUserEngagement,
	removeUserFromApprovals
};
