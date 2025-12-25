// API Configuration

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL as string,
}

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/identity/auth/login",
    REFRESH_TOKEN: "/identity/auth/refresh",
    CHANGE_PASSWORD: "/identity/auth/change-password",
  },

  COUNTRIES: {
    GET: "/system/countries",
  },

  AGENTS: {
    GET: "/agents",
    GET_BY_ID: "/agents/{id}",
    ADD: "/agents/with-user",
    ADD_EXISTING_USER: "/agents",
    CHANGE_REQUEST: "/agents/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/agents/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/agents/change-requests",
    CHANGE_REQUEST_DETAILS: "/agents/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/agents/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/agents/change-requests/{publicId}/decline",
    CLEARANCE: "/agents/clearances",
    CLEAR_CASH: "/agents/{id}/clear-cash",
    PAYMENTS: "/agents/payments",
    LOOKUP_BILL: "/agents/lookup/bill",
    AGENT_INFO: "/agents/me",
    AGENT_SUMMARY: "/agents/reports/self/summary",
    PERFORMANCE: "/agents/performance/daily",
    PAYMENT_CHANNEL: "/agents/payment-channels",
  },

  BILLING_DISPUTE: {
    CREATE_DISPUTE: "/billing/disputes",
    GET_ALL_DISPUTES: "/billing/disputes",
    GET_DISPUTE_BY_ID: "/billing/disputes/{id}",
    UPDATE_DISPUTE: "/billing/disputes/{id}/status",
    CHANGE_REQUEST: "/billing/disputes/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/billing/disputes/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/billing/disputes/change-requests",
    CHANGE_REQUEST_DETAILS: "/billing/disputes/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/billing/disputes/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/billing/disputes/change-requests/{publicId}/decline",
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
    GET_BY_ID: "/roles-management/roles/{id}",
    UPDATE_ROLE: "/roles-management/roles/{id}",
    CREATE_ROLE: "/roles-management/roles",
    DELETE_ROLE: "/roles-management/roles/{id}",
    PRIVILEGES: "/roles-management/privileges",
    MANAGE_PERMISSIONS: "/roles-management/roles/{id}/permissions",
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
    GET_DETAIL: "/departments/{id}",
    ADD: "/departments",
    UPDATE: "/departments/{id}",
  },

  COMPANY: {
    GET: "/assets/companies",
  },

  BACKGROUND_JOB: {
    GET: "/quartz",
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
    CUSTOMER_LOOKUP: "/customers/lookup",
  },

  CREATE_CUSTOMER: {
    ADD: "/customers/bulk",
    RECORD_PAYMENT: "/customers/{id}/payments/record",
    PAYMENT_CHANNELS: "/customers/{id}/payments/record/channels",
    CHANGE_ACCOUNT_NUMBER: "/customers/{id}/account-number/change",
  },

  CUSTOMER_CATEGORIES: {
    GET: "/customers/categories",
    GET_SUBCATEGORIES: "/customers/categories/{categoryId}/subcategories",
    ADD_SUBCATEGORIES: "/customers/categories/{categoryId}/subcategories",
    ADD_CATEGORY: "/customers/categories",
    EDIT_CATEGORY: "/customers/categories/{id}",
  },

  STATUS_MAP: {
    GET: "/customers/map/customers",
    ASSETS: "/customers/map/assets",
  },

  PAYMENT_TYPE: {
    GET: "/payments/types",
    CREATE: "/payments/types",
    UPDATE: "/payments/types/{id}",
    DELETE: "/payments/types/{id}",
  },

  POSTPAID_BILLING: {
    GET: "/billing/postpaid",
    GET_BY_ID: "/billing/postpaid/{id}",
    FINALIZE: "/billing/postpaid/finalize-period",
    FINALIZE_BY_AREA_OFFICE_ID: "/billing/postpaid/area-offices/{areaOfficeId}/finalize",
    BILLING_JOBS: "/billing/postpaid/jobs",
    GET_BY_REFERENCE: "/billing/postpaid/public/{reference}",
    BILLING_JOBS_BY_ID: "/billing/postpaid/jobs/{id}",
    ADD_BILLING_JOB: "/billing/postpaid/jobs",
    CHANGE_REQUEST: "/billing/postpaid/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/billing/postpaid/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/billing/postpaid/change-requests",
    CHANGE_REQUEST_DETAILS: "/billing/postpaid/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/billing/postpaid/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/billing/postpaid/change-requests/{publicId}/decline",
    MANUAL_BILLS: "/billing/postpaid/manual-bills",
    METER_READINGS: "/billing/postpaid/meter-readings",
    FINALIZE_SINGLE_BILL: "/billing/postpaid/{id}/finalize",
  },

  BILLING_PERIODS: {
    GET: "/billing/periods",
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
    PAYMENT_SUMMARY: "/payments/reports/summary",
    OUTAGE_SUMMARY: "/outages/report/summary",
    MAINTENANCE_SUMMARY: "/maintenance/report/summary",
    VENDOR_SUMMARY: "/vendors/reports/summary",
    SALES_REP: "/agents/reports/summary",
  },

  OUTAGE_MANAGEMENT: {
    GET: "/outages",
    ADD: "/outages",
    GET_BY_ID: "/outages/{id}",
    UPDATE: "/outages/{id}",
  },

  MAINTENANCE: {
    GET: "/maintenance",
    ADD: "/maintenance",
    GET_BY_ID: "/maintenance/{id}",
    UPDATE: "/maintenance/{id}",
  },

  PAYMENTS: {
    GET: "/payments",
    GET_BY_ID: "/payments/{id}",
    ADD: "/payments",
    CHANGE_REQUEST: "/payments/{id}/change-requests",
    PAYMENT_CHANNELS: "/payments/record/channels",
    CHANGE_REQUESTS_BY_ID: "/payments/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/payments/change-requests",
    CHANGE_REQUEST_DETAILS: "/payments/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/payments/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/payments/change-requests/{publicId}/decline",
  },

  PAYMENT_DUNNING: {
    GET: "/payments/dunning/cases",
    ADD: "/payments/dunning/cases",
  },

  REPORTING: {
    CARDS: "/reporting/dashboard/cards",
    ENERGY_BALANCE: "/reporting/dashboard/energy-balance",
    DAILY_COLLECTION: "/reporting/dashboard/daily-collection",
    COLLECTION_BY_BAND: "/reporting/performance/collection-by-band",
    CBO_PERFORMANCE: "/reporting/performance/cbo-performance",
    NEW_CONNECTIONS: "/reporting/dashboard/new-connections",
    PREPAID_VENDS: "/reporting/dashboard/prepaid-vends",
    TOKEN_GENERATED: "/reporting/dashboard/prepaid-tokens",
    METERS_PROGRAMMED: "/reporting/dashboard/meters-programmed",
    CUSTOMER_SEGMENT: "/reporting/dashboard/customer-segments",
    TREND: "/reporting/dashboard/trend",
    BREAKDOWN: "/reporting/dashboard/breakdown",
    COLLECTION_EFFICIENCY: "/reporting/dashboard/collection-efficiency",
    OUTSTANDING_ARREARS: "/reporting/dashboard/outstanding-arrears",
    DISPUTES: "/reporting/dashboard/disputes",
  },

  REVENUE_ANALYTICS: {
    DAILY_COLLECTION: "/reporting/revenue/daily-collection",
    BREAKDOWN: "/reporting/revenue/breakdown",
    PAYMENT_TYPES: "/reporting/revenue/payment-types",
    TOP_COLLECTORS: "/reporting/revenue/top-collectors",
  },

  CONSUMPTION_ANALYTICS: {
    ENERGY_BALANCE: "/reporting/consumption/energy-balance",
    POSTPAID_TREND: "/reporting/consumption/postpaid-trend",
    PREPAID_VENDS: "/reporting/consumption/prepaid-vends",
    PREPAID_TOKENS: "/reporting/consumption/prepaid-tokens",
    NEW_CONNECTIONS: "/reporting/consumption/new-connections",
    METERS_PROGRAMMED: "/reporting/consumption/meters-programmed",
  },

  PERFORMANCE_ANALYTICS: {
    COLLECTION_EFFICIENCY: "/reporting/performance/collection-efficiency",
    OUTSTANDING_ARREARS: "/reporting/performance/outstanding-arrears",
    COLLECTION_BY_BAND: "/reporting/performance/collection-by-band",
    CBO_PERFORMANCE: "/reporting/performance/cbo-performance",
  },

  VENDORS: {
    GET: "/vendors",
    GET_BY_ID: "/vendors/{id}",
    ADD: "/vendors/bulk",
    GET_VENDOR_WALLET: "/vendors/{id}/wallet",
    TOP_UP: "/vendors/{id}/wallet/top-up",
    SUSPEND: "/vendors/{id}/suspend",
    UPDATE_COMMISSION: "/vendors/{id}/commission",
    GENERATE_API_KEY: "/vendors/{id}/api-keys/rotate",
    CHANGE_REQUEST: "/vendors/{id}/change-requests",
    CHANGE_REQUESTS_BY_ID: "/vendors/{id}/change-requests",
    VIEW_CHANGE_REQUEST: "/vendors/change-requests",
    CHANGE_REQUEST_DETAILS: "/vendors/change-requests/{identifier}",
    APPROVE_CHANGE_REQUEST: "/vendors/change-requests/{publicId}/approve",
    DECLINE_CHANGE_REQUEST: "/vendors/change-requests/{publicId}/decline",
    VENDOR_PAYMENT: "/vendors/{id}/payments",
  },
}

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Environment switcher utility (for development/testing)
export const switchEnvironment = (env: "STAGING" | "PRODUCTION") => {
  // This would typically be handled by environment variables in a real app
  console.log(`Switching to ${env} environment: ${API_CONFIG.BASE_URL}`)
}
