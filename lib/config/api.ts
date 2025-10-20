// API Configuration
type Environment = "STAGING" | "PRODUCTION"

export const API_CONFIG = {
  // Environment-based base URLs
  STAGING: "https://ultra-service-79baffa4bc31.herokuapp.com",
  PRODUCTION: "https://ultra-service-79baffa4bc31.herokuapp.com",

  // Current environment (change this to switch between staging/production)
  CURRENT_ENV: (process.env.NODE_ENV === "production" ? "PRODUCTION" : "STAGING") as Environment,

  // Get current base URL
  get BASE_URL(): string {
    return this[this.CURRENT_ENV]
  },
}

// Centralized API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/Admin/Login",
    REFRESH_TOKEN: "/Admin/RefreshToken",
  },

  SYSTEM: {
    CURRENCIES: "/System/Currencies",
  },

  // User/Customer endpoints
  USERS: {
    OVERVIEW: "/Admin/Users/Overview",
    LIST: "/Admin/Users",
    DETAILS: (id: string | number) => `/Admin/Users/${id}`,
    ADD_BONUS: "/Admin/Wallet/Bonus",
    DISABLE: "/Admin/Wallet/Disable",
    SUSPEND: "/Admin/User/Suspend",
  },

  // Transaction endpoints
  TRANSACTIONS: {
    LIST: "/Admin/Transactions",
    DETAILS: (id: string | number) => `/Admin/Transactions/${id}`,
    CRYPTO: "/Admin/Crypto/Transactions",
    OVERVIEW: "/Admin/Transactions/Overview",
    REFUND: "/Wallet/RefundPayBills",
    SETTLE: "Admin/Crypto/Refund",
  },

  BANKS: {
    LIST: "/Psb9/Banklist",
    VERIFY: "/Psb9/AccountEnquiry",
  },

  // Crypto endpoints
  CRYPTO: {
    LIST: "/Admin/Crypto",
    DETAILS: (id: string | number) => `/Admin/Crypto/${id}`,
    OVERVIEW: "/Admin/Crypto/Overview",
    TRANSFER: "/Admin/Crypto/Transfer",
    REQUEST_OTP: "/Admin/Request/Otp",
    QUOTATION: "/Admin/Quotation",
    SWAP: "/Admin/Crypto/Swap",
    SETTLE: "/Admin/Crypto/Settle",
    REFUND: "/Admin/Wallet/RefundWithdrawal",
  },

  // Dashboard endpoints
  DASHBOARD: {
    STATS: "/Admin/Dashboard/Stats",
    ANALYTICS: "/Admin/Dashboard/Analytics",
    WITHDRAW: "/Admin/Wallet/Withdraw",
  },

  //Series endpoints
  SERIES: {
    ANALYTICS: "/Admin/Transactions/Series",
  },

  FEES: {
    CRYPTO_FEES: "/Admin/CryptoFees",
    EDIT_CRYPTO_FEES: "/Admin/Crypto/Fee",
  },

  LOGS: {
    ADMIN_LOGS: "/Admin/Logs",
  },
}

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Environment switcher utility (for development/testing)
export const switchEnvironment = (env: "STAGING" | "PRODUCTION") => {
  // This would typically be handled by environment variables in a real app
  console.log(`Switching to ${env} environment: ${API_CONFIG[env]}`)
}
