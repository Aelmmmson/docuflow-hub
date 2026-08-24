// src/config/apiConfig.ts

export const CORE_BANKING_CONFIG = {
  BASE_URL: import.meta.env.VITE_CORE_BANKING_BASE_URL || "http://10.203.14.33:8181",
  HEADERS: {
    "x-api-key": import.meta.env.VITE_CORE_BANKING_API_KEY || "test_PC",
    "x-api-secret": import.meta.env.VITE_CORE_BANKING_API_SECRET || "testPC",
    "Content-Type": "application/json",
    "X-FORWARDED-FOR": import.meta.env.VITE_CORE_BANKING_FORWARDED_FOR || "10.203.18.114",
  },
  ENDPOINTS: {
    EXPENSE_ACCOUNTS: "/core/api/v1.0/account/expenseAccounts",
    ACCOUNT_LOOKUP: "/core/api/v1.0/account/lookup/account-number",
  },
};
