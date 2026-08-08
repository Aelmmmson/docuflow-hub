// src/config/apiConfig.ts

export const CORE_BANKING_CONFIG = {
  BASE_URL: "http://10.203.14.33:8181",
  HEADERS: {
    "x-api-key": "test_PC",
    "x-api-secret": "testPC",
    "Content-Type": "application/json",
    "X-FORWARDED-FOR": "10.203.18.114",
  },
  ENDPOINTS: {
    EXPENSE_ACCOUNTS: "/core/api/v1.0/account/expenseAccounts",
    ACCOUNT_LOOKUP: "/core/api/v1.0/account/lookup/account-number",
  },
};
