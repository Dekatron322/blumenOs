// API Configuration
type Environment = "STAGING" | "PRODUCTION"

export const API_CONFIG = {
  // Environment-based base URLs
  STAGING: "https://blumenos-e0fba1f74776.herokuapp.com",
  PRODUCTION: "https://blumenos-e0fba1f74776.herokuapp.com",

  // Current environment (change this to switch between staging/production)
  CURRENT_ENV: (process.env.NODE_ENV === "production" ? "PRODUCTION" : "STAGING") as Environment,

  // Get current base URL
  get BASE_URL(): string {
    return this[this.CURRENT_ENV]
  },
}

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/identity/auth/login",
    REFRESH_TOKEN: "/identity/auth/refresh",
    CHANGE_PASSWORD: "/identity/auth/change-password",
  },

  EMPLOYEE: {
    EMPLOYEE: "/identity/users",
    INVITE: "/identity/users/invite",
    EMPLOYEE_DETAILS: "/identity/users/{id}",
    UPDATE_EMPLOYEE: "/identity/users/{id}",
    DEACTIVATE: "/identity/users/{id}/deactivate",
    ACTIVATE: "/identity/users/{id}/activate",
    RESET_PASSWORD: "/identity/users/{id}/reset-password",
    CHANGE_REQUEST: "/identity/users/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/identity/users/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/identity/users/change-requests",
    CHANGE_REQUEST_DETAILS: "/identity/users/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/identity/users/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/identity/users/change-requests/{publicId}/decline",
    EMPLOYEE_REPORT: "/identity/users/reports/summary",
    REPORTS_BY_DEPARTMENT: "/identity/users/reports/by-department",
  },

  ROLES: {
    GET: "/roles-management/roles",
  },

  AREA_OFFICE: {
    GET: "/assets/area-offices",
  },

  DEPARTMENT: {
    GET: "/departments",
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
