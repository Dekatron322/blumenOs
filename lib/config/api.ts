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
    ADD: "/assets/area-offices",
    UPDATE: "/assets/area-offices/{id}",
    GET_BY_ID: "/assets/area-offices/{id}",
    CHANGE_REQUEST: "/assets/area-offices/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/assets/area-offices/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/assets/area-offices/change-requests",
    CHANGE_REQUEST_DETAILS: "/assets/area-offices/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/assets/area-offices/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/assets/area-offices/change-requests/{publicId}/decline",
  },

  FEEDERS: {
    GET: "/assets/feeders",
    ADD: "/assets/feeders",
    GET_BY_ID: "/assets/feeders/{id}",
    UPDATE: "/assets/feeders/{id}",
    CHANGE_REQUEST: "/assets/feeders/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/assets/feeders/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/assets/feeders/change-requests",
    CHANGE_REQUEST_DETAILS: "/assets/feeders/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/assets/feeders/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/assets/feeders/change-requests/{publicId}/decline",
  },

  INJECTION_SUBSTATION: {
    GET: "/assets/injection-substations",
    ADD: "/assets/injection-substations",
    GET_BY_ID: "/assets/injection-substations/{id}",
    UPDATE: "/assets/injection-substations/{id}",
    CHANGE_REQUEST: "/assets/injection-substations/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/assets/injection-substations/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/assets/injection-substations/change-requests",
    CHANGE_REQUEST_DETAILS: "/assets/injection-substations/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/assets/injection-substations/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/assets/injection-substations/change-requests/{publicId}/decline",
  },

  SERVICE_STATION: {
    GET: "/assets/service-centers",
    ADD: "/assets/service-centers",
    GET_BY_ID: "/assets/service-centers/{id}",
    UPDATE: "/assets/service-centers/{id}",
  },

  HT_POLE: {
    GET: "/assets/ht-poles",
    ADD: "/assets/ht-poles",
    GET_BY_ID: "/assets/ht-poles/{id}",
    UPDATE: "/assets/ht-poles/{id}",
    CHANGE_REQUEST: "/assets/ht-poles/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/assets/ht-poles/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/assets/ht-poles/change-requests",
    CHANGE_REQUEST_DETAILS: "/assets/ht-poles/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/assets/ht-poles/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/assets/ht-poles/change-requests/{publicId}/decline",
  },

  DISTRIBUTION_STATION: {
    GET: "/assets/distribution-substations",
    ADD: "/assets/distribution-substations",
    GET_BY_ID: "/assets/distribution-substations/{id}",
    UPDATE: "/assets/distribution-substations/{id}",
    CHANGE_REQUEST: "/assets/distribution-substations/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/assets/distribution-substations/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/assets/distribution-substations/change-requests",
    CHANGE_REQUEST_DETAILS: "/assets/distribution-substations/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/assets/distribution-substations/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/assets/distribution-substations/change-requests/{publicId}/decline",
  },

  DEPARTMENT: {
    GET: "/departments",
  },

  CUSTOMER: {
    GET: "/customers",
    GET_BY_ID: "/customers/{id}",
    ADD: "/customers/bulk",
    UPDATE: "/customers/{id}",
    SUSPEND: "/customers/{id}/suspend",
    ACTIVATE: "/customers/{id}/activate",
    PAYMENT_DISPUTE: "/customers/{id}/payment-disputes",
    CHANGE_REQUEST: "/customers/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/customers/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/customers/change-requests",
    CHANGE_REQUEST_DETAILS: "/customers/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/customers/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/customers/change-requests/{publicId}/decline",
  },

  POSTPAID_BILLING: {
    GET: "/billing/postpaid",
    GET_BY_ID: "/billing/postpaid/{id}",
    FINALIZE: "/billing/postpaid/finalize-period",
    FINALIZE_BY_AREA_OFFICE_ID: "/billing/postpaid/area-offices/{areaOfficeId}/finalize",
    BILLING_JOBS: "/billing/postpaid/jobs",
    BILLING_JOBS_BY_ID: "/billing/postpaid/jobs/{id}",
    ADD_BILLING_JOB: "/billing/postpaid/jobs",
    CHANGE_REQUEST: "/billing/postpaid/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/billing/postpaid/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/billing/postpaid/change-requests",
    CHANGE_REQUEST_DETAILS: "/billing/postpaid/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/billing/postpaid/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/billing/postpaid/change-requests/{publicId}/decline",
  },

  METER_READINGS: {
    GET: "/billing/postpaid/meter-readings",
    GET_BY_ID: "/billing/postpaid/meter-readings/{id}",
    ADD: "/billing/postpaid/meter-readings",
  },

  FEEDER_ENERGY_CAP: {
    GET: "/billing/postpaid/feeder-energy-caps",
    GET_BY_ID: "/billing/postpaid/feeder-energy-caps/{id}",
    ADD: "/billing/postpaid/feeder-energy-caps/apply-all",
  },

  ANALYTICS: {
    ASSET_MANAGEMENT: "/assets/reports/summary",
    CUSTOMER: "/customers/reports/summary",
    POSTPAID_BILLING: "/billing/postpaid/summary",
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
