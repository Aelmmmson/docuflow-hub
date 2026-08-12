const express = require("express"); //import express
const router = express.Router(); //create express router
const { checkToken,handleRefreshToken } = require("../middleware/authMiddleware");
const userController = require("../controllers/users"); //users controller
const newsController = require("../controllers/news.js"); //news controller
const parameterController = require("../controllers/parameters.js"); //news controller
const approverSetupController = require("../controllers/approverSetups.js"); //approver setup controller
const approvalActivityController = require("../controllers/approvalActivity.js"); //approver setup controller
const dashboardController = require("../controllers/dashboard.js");
const accountController = require("../controllers/accountSetup.js");
const documentController = require("../controllers/document.js");
const beneficiaryController = require("../controllers/beneficiarySetup.js");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Set the destination folder for uploaded files


//index route just for testing
//returns hello world
router.get("/", (req, res) => {
	res.send("Hello World!");
});

/*******************************************
 * AUTH ROUTES
*****************************************/
//group all user routes together to checkToken

//user registration route to register users
router.post("/user/login", userController.login);
router.post("/user/xauth-login", userController.xauthLogin);
router.post("/user/forgot-password", userController.forgotPassword);
router.get("/user/logout", userController.logout);
router.get("/user/refresh-token", handleRefreshToken);

router.use(checkToken);
router.post("/user/register", userController.register);
router.get("/get-users", userController.getUsers);
router.get("/get-users-roles", userController.getUserRoles);
// router.post("/delete-user", userController.deleteUser);
router.post("/user/logout", userController.logout);
router.get("/get-user/:userId", userController.getUser);
router.put("/update-user/:userId", userController.updateUser);
router.get("/check-user-engagement/:userId", userController.checkUserEngagement);
router.delete("/remove-user-from-approvals/:userId", userController.removeUserFromApprovals);
router.put("/user/update-self-profile", userController.updateSelfProfile);
router.put("/user/change-password", userController.changePassword);
router.get("/user/is-approver/:userId", userController.checkIsApprover);




//parameter routes
router.get("/get-parameters", parameterController.getParameters);
router.get("/get-code-creation-details/:codeId", parameterController.getCodeDetails);
router.get("/get-doc-types", parameterController.getDoctypes);
router.get("/get-available-doc-types", parameterController.getAvailableDoctypes);
router.get("/get-doctype-with-approval-setup", parameterController.getDoctypesWithApprovalSetups);
router.post("/add-doc-type", parameterController.addDoctype);
router.put("/update-doc-type", parameterController.updateDoctype);

//approver setups
router.get("/get-approver-setups", approverSetupController.getApproverSetups);
router.get("/get-approver-users", approverSetupController.getApproverUsers);
router.post("/create-doc-approvers-setup", approverSetupController.createApproverSetup);
router.put("/update-doc-approvers-setup", approverSetupController.updateApproverSetup);

//approval activity routes
router.get("/get-submitted-docs", approvalActivityController.getSubmittedDocs);
router.get("/get-approval-comments/:docId", approvalActivityController.getApprovalComments);
router.post("/get-pending-docs", approvalActivityController.getPendingDocs);
router.get("/get-pending-docs", approvalActivityController.getPendingDocs);
router.get("/get-pending-docs/:userId/:role", approvalActivityController.getPendingDocs);
router.put("/approve-doc", approvalActivityController.approveDoc);
router.post("/make-transaction", approvalActivityController.makeTransaction);
router.put("/reject-doc", approvalActivityController.rejectDoc);


//document routes
router.post("/generate-doc", documentController.generateDoc)
router.put("/update-doc/:docId", documentController.updateDoc)
router.get("/get-doc/:docId", documentController.getDocById)
router.get("/get-generated-docs/:userId/:role", documentController.getGeneratedDocs);
router.get("/get-drafted-docs/:userId/:role", documentController.getDraftedDocs);
router.get("/get-user-generated-docs", documentController.getGeneratedDocs);
router.put("/submit-doc/:docId", documentController.submitDoc);

//dashboard
router.get("/get-dashboard-stats/:userId/:role", dashboardController.getAdminDashboardValues);

//account routes
router.get("/get-all-accounts", accountController.getAllAccounts);
router.get("/get-expense-accounts", accountController.getExpenseAccounts);
router.get("/get-account-lookup/:accountNumber", accountController.lookupAccount);
router.get("/get-all-active-accounts", accountController.getAllActiveAccounts);
router.post("/add-account", accountController.createAccount);
router.put("/update-account/:accountId", accountController.updateAccount);


//beneficiary routes
router.post("/add-beneficiary-account", beneficiaryController.createAccount);
router.put("/update-beneficiary-account/:beneficiaryId", beneficiaryController.updateBeneficiary);
router.get("/get-all-beneficiary-accounts", beneficiaryController.getAllAccounts);
router.get("/find-beneficiary-by-name/:name", beneficiaryController.getBeneficiaryByName);

router.all("*", (req, res) => {
	res.status(403).json({ code: "404", message: "route not found" });
});
module.exports = router;

