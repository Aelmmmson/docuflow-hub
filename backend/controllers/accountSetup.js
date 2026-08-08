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
  * updateAccount() - updates account details
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
        const { account_name, account_number, account_type, status, posted_by } = req.body;

        // Validate required fields
        const dataEntry = [
            { name: "Account Name", value: account_name },
            { name: "Account Number", value: account_number },
            { name: "Account Type", value: account_type },
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
            account_name,
            account_number,
            account_type,
            status: status || 1, // Default to active if not provided
            posted_by
        };

        // Insert the account
        const result = await helper.dynamicInsert('account_setups', accountData);
        
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
        const query = `SELECT * from account_setups;`;
    
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
        const query = `SELECT * from account_setups where status =1;`;
    
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

// =========================================================================================
// EXPENSE ACCOUNTS CACHE & CIRCUIT BREAKER STATE
// =========================================================================================
const CACHE_KEY = "expense_accounts_cache";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL
const CIRCUIT_FAILURE_THRESHOLD = 3; // Trip circuit after 3 failures
const CIRCUIT_RESET_MS = 60 * 1000; // 60s cooldown

let expenseAccountsCache = null;
let circuitState = "CLOSED"; // "CLOSED" | "OPEN" | "HALF-OPEN"
let consecutiveFailures = 0;
let nextCircuitAttemptTime = 0;
let isRevalidating = false;

/**
 * Helper: Executes Core Banking API Request with Metrics & Correlation ID
 */
const fetchExpenseAccountsFromCoreBanking = async (correlationId) => {
  const startTime = Date.now();
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "http://10.203.14.33:8181/core/api/v1.0/account/expenseAccounts",
    headers: {
      "x-api-key": "20171411891",
      "x-api-secret": "141116517P",
      "Content-Type": "application/json",
      "X-FORWARDED-FOR": "192.168.1.3",
      "X-Correlation-ID": correlationId,
    },
    timeout: 10000, // 10 second timeout
  };

  console.log(`[CORE BANKING API] Requesting expense accounts... [Correlation ID: ${correlationId}]`);

  try {
    const response = await axios.request(config);
    const durationMs = Date.now() - startTime;
    console.log(`[CORE BANKING API] Response received in ${durationMs}ms (HTTP ${response.status}) [Correlation ID: ${correlationId}]`);

    let rawData = response.data?.result || response.data?.expenseAccounts || response.data;
    if (!rawData || (!Array.isArray(rawData) && typeof rawData !== "object")) {
      throw { isDataError: true, message: "Invalid or empty payload structure received from Core Banking." };
    }

    // Unwrap nested wrapper objects (e.g. [{ responseCode: '000', message: '...', data: [...] }])
    let accountsList = [];
    if (Array.isArray(rawData)) {
      if (rawData.length > 0 && Array.isArray(rawData[0]?.data)) {
        accountsList = rawData.flatMap((wrapper) => wrapper.data || []);
      } else {
        accountsList = rawData;
      }
    } else if (rawData && typeof rawData === "object") {
      if (Array.isArray(rawData.data)) {
        accountsList = rawData.data;
      } else {
        accountsList = [rawData];
      }
    }

    // Reset circuit breaker on success
    if (circuitState !== "CLOSED") {
      console.log(`[CIRCUIT BREAKER] Upstream Core Banking healthy. Transitioning from ${circuitState} to CLOSED [Correlation ID: ${correlationId}]`);
    }
    consecutiveFailures = 0;
    circuitState = "CLOSED";

    // Update Cache
    const now = Date.now();
    expenseAccountsCache = {
      data: accountsList,
      cachedAt: new Date(now).toISOString(),
      expiresAt: now + CACHE_TTL_MS,
    };
    console.log(`[CACHE STORE] Successfully updated '${CACHE_KEY}' with ${accountsList.length} items. TTL: 1 hour [Correlation ID: ${correlationId}]`);

    return accountsList;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    consecutiveFailures++;

    // Evaluate Circuit Breaker State
    if (circuitState === "HALF-OPEN" || consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
      circuitState = "OPEN";
      nextCircuitAttemptTime = Date.now() + CIRCUIT_RESET_MS;
      console.error(`[CIRCUIT BREAKER ALERT] Circuit state changed to OPEN. Upstream failures: ${consecutiveFailures}/${CIRCUIT_FAILURE_THRESHOLD}. Pausing API requests for 60s [Correlation ID: ${correlationId}]`);
    } else {
      console.warn(`[CIRCUIT BREAKER WARNING] Upstream failure #${consecutiveFailures}/${CIRCUIT_FAILURE_THRESHOLD} [Correlation ID: ${correlationId}]`);
    }

    // Classify Error
    if (error.isDataError) {
      console.error(`[CORE BANKING API ERROR] Data Payload Error (${durationMs}ms) [Correlation ID: ${correlationId}]:`, error.message);
      throw { statusCode: 502, message: "Invalid or malformed data received from Core Banking system.", details: error.message };
    }

    if (error.response) {
      const status = error.response.status;
      console.error(`[CORE BANKING API ERROR] Upstream HTTP ${status} (${durationMs}ms) [Correlation ID: ${correlationId}]:`, error.response.data || error.message);
      if (status === 401 || status === 403) {
        throw { statusCode: 502, message: "Core Banking authentication error. Invalid API credentials or forbidden access.", details: `HTTP ${status}` };
      }
      throw { statusCode: 502, message: `Core Banking upstream server error (HTTP ${status}).`, details: error.response.data?.message || error.message };
    }

    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT" || error.code === "ENOTFOUND" || error.message?.includes("timeout")) {
      console.error(`[CORE BANKING API ERROR] Network Connectivity Failure (${durationMs}ms) [Correlation ID: ${correlationId}]:`, error.message || error.code);
      throw { statusCode: 502, message: "Core Banking service connectivity issue. Unable to connect to upstream provider.", details: error.message || error.code };
    }

    console.error(`[CORE BANKING API ERROR] Unexpected Error (${durationMs}ms) [Correlation ID: ${correlationId}]:`, error.message || error);
    throw { statusCode: 502, message: "Failed to fetch expense accounts from Core Banking system.", details: error.message || String(error) };
  }
};

/**
 * Controller: Returns expense accounts from Core Banking with caching, Stale-While-Revalidate, and Circuit Breaker.
 * NO Database fallback.
 */
const getExpenseAccounts = async (req, res) => {
  const correlationId = (req.headers && req.headers["x-correlation-id"]) || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  // 1. Evaluate Circuit Breaker State Transition (OPEN -> HALF-OPEN)
  if (circuitState === "OPEN") {
    if (now >= nextCircuitAttemptTime) {
      circuitState = "HALF-OPEN";
      console.log(`[CIRCUIT BREAKER] Cooldown elapsed. Transitioning from OPEN to HALF-OPEN (Testing Upstream) [Correlation ID: ${correlationId}]`);
    } else {
      const secondsLeft = Math.ceil((nextCircuitAttemptTime - now) / 1000);
      console.warn(`[CIRCUIT BREAKER] Request blocked by OPEN circuit. Upstream retry allowed in ${secondsLeft}s [Correlation ID: ${correlationId}]`);

      // If we have cached data (even if stale), serve it under circuit breaker OPEN state
      if (expenseAccountsCache && expenseAccountsCache.data) {
        console.log(`[CACHE HIT] Serving stale cached data under OPEN circuit state [Correlation ID: ${correlationId}]`);
        return res.status(200).json({
          expenseAccounts: expenseAccountsCache.data,
          code: "200",
          meta: {
            source: "cache",
            cachedAt: expenseAccountsCache.cachedAt,
            isStale: true,
            circuitBreaker: "OPEN",
            correlationId,
          },
        });
      }

      // No cache available and Circuit Breaker is OPEN -> Return HTTP 503
      return res.status(503).json({
        error: "Core Banking expense accounts service is temporarily unavailable due to multiple upstream failures.",
        code: "503",
        meta: {
          circuitBreaker: "OPEN",
          nextRetryInSeconds: secondsLeft,
          correlationId,
        },
      });
    }
  }

  // 2. Check Cache & Stale-While-Revalidate Pattern
  const hasCache = expenseAccountsCache !== null && Array.isArray(expenseAccountsCache.data);
  const isCacheFresh = hasCache && now < (expenseAccountsCache?.expiresAt || 0);

  if (hasCache) {
    if (isCacheFresh) {
      console.log(`[CACHE HIT] Returning fresh cached expense accounts (${expenseAccountsCache.data.length} items) [Correlation ID: ${correlationId}]`);
      return res.status(200).json({
        expenseAccounts: expenseAccountsCache.data,
        code: "200",
        meta: {
          source: "cache",
          cachedAt: expenseAccountsCache.cachedAt,
          isStale: false,
          circuitBreaker: circuitState,
          correlationId,
        },
      });
    } else {
      // Stale cache exists: Return stale data immediately to user, revalidate in background
      console.log(`[CACHE STALE] Returning stale cached data immediately & triggering background revalidation [Correlation ID: ${correlationId}]`);

      // Fire non-blocking background revalidation
      if (!isRevalidating && circuitState !== "OPEN") {
        isRevalidating = true;
        fetchExpenseAccountsFromCoreBanking(`bg_${correlationId}`)
          .then(() => console.log(`[BACKGROUND REVALIDATION] Background cache update succeeded [Correlation ID: ${correlationId}]`))
          .catch((err) => console.warn(`[BACKGROUND REVALIDATION] Background cache update failed: ${err.message} [Correlation ID: ${correlationId}]`))
          .finally(() => { isRevalidating = false; });
      }

      return res.status(200).json({
        expenseAccounts: expenseAccountsCache.data,
        code: "200",
        meta: {
          source: "cache",
          cachedAt: expenseAccountsCache.cachedAt,
          isStale: true,
          circuitBreaker: circuitState,
          correlationId,
        },
      });
    }
  }

  // 3. Synchronous Fetch (No cache available)
  try {
    const accounts = await fetchExpenseAccountsFromCoreBanking(correlationId);
    return res.status(200).json({
      expenseAccounts: accounts,
      code: "200",
      meta: {
        source: "api",
        cachedAt: expenseAccountsCache?.cachedAt || new Date().toISOString(),
        isStale: false,
        circuitBreaker: circuitState,
        correlationId,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 502;
    return res.status(statusCode).json({
      error: error.message || "Failed to fetch expense accounts from Core Banking system.",
      code: String(statusCode),
      details: error.details || null,
      meta: {
        source: "api",
        circuitBreaker: circuitState,
        correlationId,
      },
    });
  }
};

/**
 * Updates an existing account setup
 * @param {Object} req - Request object containing account details
 * @param {Object} res - Response object
 * @returns {Object} JSON response with update status
 */
const updateAccount = async (req, res) => {
    try {
        const { accountId } = req.params;
        const { account_name, account_number, account_type, status, posted_by } = req.body;

        // Check if account exists
        const accountQuery = `SELECT * FROM account_setups WHERE id = ?`;
        const accountResult = await helper.selectRecordsWithQuery(accountQuery, [accountId]);
        console.log(accountResult);
        if (accountResult.status !== "success" || accountResult.data.length === 0) {
            return res.status(404).json({
                message: "Account not found",
                code: "404"
            });
        }

        // Validate required fields
        const dataEntry = [
            { name: "Account Name", value: account_name },
            { name: "Account Number", value: account_number },
            { name: "Account Type", value: account_type },
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
            account_name,
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
        console.error("Error in updateAccount:", error);
        return res.status(500).json({
            message: "Failed to update account",
            error: error.message,
            code: "500"
        });
    }
};

/**
 * Core Banking Account Lookup by Account Number
 * URL: {{host}}/core/api/v1.0/account/lookup/account-number?a={accountNumber}
 */
const lookupAccount = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const cleanAccount = String(accountNumber || req.query.a || "").trim();

    if (!cleanAccount) {
      return res.status(400).json({ message: "Account number is required", code: "400" });
    }

    const apiConfig = require("../config/apiConfig");
    const config = {
      method: "get",
      url: `${apiConfig.CORE_BANKING_BASE_URL}${apiConfig.ENDPOINTS.ACCOUNT_LOOKUP}?a=${encodeURIComponent(cleanAccount)}`,
      headers: apiConfig.CORE_BANKING_HEADERS,
      timeout: 10000,
    };

    const response = await axios.request(config);
    const data = response.data?.data || response.data?.result || response.data;

    if (!data) {
      return res.status(404).json({ message: "Account not found in Core Banking system", code: "404" });
    }

    return res.status(200).json({
      message: "Account verified successfully",
      code: "200",
      data: data,
    });
  } catch (error) {
    console.error("[ACCOUNT LOOKUP ERROR]:", error?.response?.data || error?.message || error);
    return res.status(502).json({
      message: "Core Banking account lookup failed",
      code: "502",
      error: error?.response?.data?.message || error?.message || "Failed to reach Core Banking provider",
    });
  }
};

module.exports = {
	getAllAccounts,
  getAllActiveAccounts,
    testSpeed,
    createAccount,
    updateAccount,
    getExpenseAccounts,
    lookupAccount,
};
