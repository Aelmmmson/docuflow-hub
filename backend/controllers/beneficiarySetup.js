const helper = require("./helper"); //access helper functions
require("dotenv").config();
const pool = require("../mysqlconfig");
const axios = require("axios"); //for making api calls to core banking

/***********************************************************************************************************
 * handles all approver setups and all related activity in the app
 * 
 * Activities in {
    * getAllAccounts() - get all accounts,
  * createAccount() - create accounts
  * updateBeneficiary() - updates account details
 * }
 ***************************************************************************************************************/

//just for testing of api speed
const testSpeed = async (req, res) => {
    console.log("testing api");
    res.status(200).json({ result: "ok 1" });
    // return;
};

/**
 * Creates a new account setup
 * @param {Object} req - Request object containing account details
 * @param {Object} res - Response object
 * @returns {Object} JSON response with creation status
 */
const createAccount = async (req, res) => {
    try {
        const { beneficiary_name, account_number,description, status, posted_by } = req.body;

        // Validate required fields
        const dataEntry = [
            { name: "Account Name", value: beneficiary_name },
            { name: "Account Number", value: account_number },
            { name: "Description", value: description },
            {name: "Status", value: status}
        ];

        // Check for null or empty values
        const validationResult = await helper.checkForNullOrEmpty(dataEntry);
        if (validationResult.status !== "success") {
            return res.status(400).json({
                message: validationResult.message,
                code: "400"
            });
        }

        // Data to be inserted
        const accountData = {
            beneficiary_name,
            account_number,
            description,
            status: status || 1, // Default to active if not provided
            posted_by
        };

        // Insert the account
        const result = await helper.dynamicInsert('beneficiary_setups', accountData);
        
        if (result.status === "success") {
            return res.status(200).json({
                message: "Account setup created successfully",
                code: "200"
            });
        } else {
            return res.status(400).json({
                message: "Failed to create account setup",
                code: "400"
            });
        }

    } catch (error) {
        console.error("Error in createAccount:", error);
        return res.status(500).json({
            message: "Failed to create setup",
            error: error.message,
            code: "500"
        });
    }
};

//returns all accounts
const getAllAccounts = async (req, res) => {
    try {
        const query = `SELECT * from beneficiary_setups;`;
    
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
                accounts: results,
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

//returns all accounts
const getAllActiveAccounts = async (req, res) => {
    try {
        const query = `SELECT * from beneficiary_setups where status =1;`;
    
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
                accounts: results,
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


/**
 * Updates an existing account setup
 * @param {Object} req - Request object containing account details
 * @param {Object} res - Response object
 * @returns {Object} JSON response with update status
 */
const updateBeneficiary = async (req, res) => {
    try {
        const { beneficiary_id } = req.params;
        const { beneficiary_name, account_number, description, status, posted_by } = req.body;

        // Check if account exists
        const accountQuery = `SELECT * FROM beneficiary_setups WHERE id = ?`;
        const accountResult = await helper.selectRecordsWithQuery(accountQuery, [beneficiary_id]);
        
        if (accountResult.status !== "success" || accountResult.data.length === 0) {
            return res.status(404).json({
                message: "Beneficiary not found",
                code: "404"
            });
        }

        // Validate required fields
        const dataEntry = [
            { name: "Account Name", value: beneficiary_name },
            { name: "Account Number", value: account_number },
            { name: "Description", value: description },
            { name: "Status", value: status }
        ];

        const validationResult = await helper.checkForNullOrEmpty(dataEntry);
        if (validationResult.status !== "success") {
            return res.status(400).json({
                message: validationResult.message,
                code: "400"
            });
        }

        // Data to be updated
        const accountData = {
            beneficiary_name,
            account_number,
            account_type,
            status,
            posted_by,
            updated_at: new Date()
        };

        // Update the account
        const result = await helper.dynamicUpdateWithId('account_setups', accountData, accountId);
        
        if (result.status === "success") {
            return res.status(200).json({
                message: "Account updated successfully",
                code: "200"
            });
        } else {
            return res.status(400).json({
                message: "Failed to update account",
                code: "400"
            });
        }

    } catch (error) {
        console.error("Error in updateBeneficiary:", error);
        return res.status(500).json({
            message: "Failed to update account",
            error: error.message,
            code: "500"
        });
    }
};

/**
 * Gets a beneficiary by name
 * @param {Object} req - Request object containing the beneficiary name
 * @param {Object} res - Response object
 * @returns {Object} JSON response with beneficiary details
 */

const getBeneficiaryByName = async (req, res) => {
    try {

        const { name } = req.params;
        // Validate the name parameter
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                message: "Invalid beneficiary name",
                code: "400"
            });
        }
        // Query to find the beneficiary by name
        const query = `SELECT * FROM beneficiary_setups WHERE beneficiary_name LIKE ?`;
        const searchName = `%${name}%`; // Use wildcard for partial match
        const results = await helper.selectRecordsWithQuery(query, [searchName]);
        if (results.status !== "success" || results.data.length === 0) {
            return res.status(404).json({
                message: "Beneficiary not found",
                code: "404"
            });
        }
        // Return the found beneficiary
        return res.status(200).json({
            beneficiary: results.data,
            code: "200"
        });
    } catch (error) {
        console.error("Error in getBeneficiaryByName:", error);
        return res.status(500).json({
            message: "Failed to retrieve beneficiary",
            error: error.message,
            code: "500"
        });
    }
};



module.exports = {
    getAllAccounts,
    getAllActiveAccounts,
    createAccount,
    updateBeneficiary,
    getBeneficiaryByName
};
