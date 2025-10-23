// API Configuration
type Environment = "STAGING" | "PRODUCTION"

export const API_CONFIG = {
  // Environment-based base URLs
  STAGING: "https://api-blumenos-com.onrender.com/api",
  PRODUCTION: "https://api-blumenos-com.onrender.com/api",

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
    LOGIN: "/auth/login",
    REFRESH_TOKEN: "/auth/refresh",
  },

  CUSTOMER: {
    GET: "/customer",
    ADD: "/customer",
    UPDATE: "/customer/:id",
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
