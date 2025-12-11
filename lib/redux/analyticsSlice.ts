// src/lib/redux/analyticsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Asset Management Analytics
export interface AssetManagementData {
  companies: number
  areaOffices: number
  injectionSubstations: number
  feeders: number
  distributionSubstations: number
  htPoles: number
}

// Interfaces for Customer Analytics
export interface CustomerByState {
  state: string
  count: number
}

export interface CustomerByDistributionSubstation {
  id: number
  name: string
  count: number
}

export interface CustomerByUser {
  id: number
  name: string
  count: number
}

export interface CustomerAnalyticsData {
  totalCustomers: number
  prepaidCustomers: number
  postpaidCustomers: number
  isPpmCustomers: number
  isMdCustomers: number
  activeCustomers: number
  suspendedCustomers: number
  customersByState: CustomerByState[]
  customersByDistributionSubstation: CustomerByDistributionSubstation[]
  customersBySalesRepUser: CustomerByUser[]
  customersByTechnicalEngineerUser: CustomerByUser[]
}

// Interfaces for Postpaid Billing Analytics
export interface PostpaidBillingAnalyticsData {
  period: string
  totalBills: number
  draftBills: number
  finalizedBills: number
  reversedBills: number
  totalOpeningBalance: number
  totalPaymentsPrevMonth: number
  totalAdjustedOpeningBalance: number
  totalConsumptionKwh: number
  totalChargeBeforeVat: number
  totalVatAmount: number
  totalCurrentBillAmount: number
  totalAmountDue: number
  forecastConsumptionKwh: number
  forecastBillAmount: number
  forecastTotalDue: number
  flaggedMeterReadings: number
  totalInvalidConsumptionKwh: number
  estimatedBills: number
  totalEstimatedConsumptionKwh: number
  totalBillingVarianceCredits: number
  totalBillingVarianceDebits: number
  activeDisputes: number
  resolvedDisputes: number
  totalAdjustmentsApplied: number
  generatedAtUtc: string
}

export interface PostpaidBillingAnalyticsParams {
  period?: string
  customerId?: number
  accountNumber?: string
  status?: 0 | 1 | 2
  category?: 1 | 2
  areaOfficeId?: number
  feederId?: number
}

// Interfaces for Payment Summary Analytics
export interface PaymentSummaryByChannel {
  key: string
  count: number
  amount: number
}

export interface PaymentSummaryByCollector {
  key: string
  count: number
  amount: number
}

export interface PaymentSummaryByStatus {
  key: string
  count: number
  amount: number
}

export interface PaymentSummaryByPaymentType {
  key: string
  count: number
  amount: number
}

export interface PaymentSummaryWindow {
  window: string
  count: number
  amount: number
  byChannel: PaymentSummaryByChannel[]
  byCollector: PaymentSummaryByCollector[]
  byStatus: PaymentSummaryByStatus[]
  byPaymentType: PaymentSummaryByPaymentType[]
}

export interface PaymentSummaryData {
  windows: PaymentSummaryWindow[]
}

export interface PaymentSummaryParams {
  today?: boolean
  yesterday?: boolean
  thisWeek?: boolean
  lastWeek?: boolean
  thisMonth?: boolean
  lastMonth?: boolean
  thisYear?: boolean
  allTime?: boolean
}

// Interfaces for Outage Summary Analytics
export interface OutageSummaryByStatus {
  key: string
  count: number
}

export interface OutageSummaryByPriority {
  key: string
  count: number
}

export interface OutageSummaryByScope {
  key: string
  count: number
}

export interface OutageSummaryTimeline {
  date: string
  count: number
}

export interface OutageSummaryData {
  total: number
  open: number
  resolved: number
  byStatus: OutageSummaryByStatus[]
  byPriority: OutageSummaryByPriority[]
  byScope: OutageSummaryByScope[]
  timeline: OutageSummaryTimeline[]
}

export interface OutageSummaryParams {
  From?: string
  To?: string
  Scope?: number
  DistributionSubstationId?: number
  FeederId?: number
}

// Interfaces for Maintenance Summary Analytics
export interface MaintenanceSummaryByStatus {
  key: string
  count: number
}

export interface MaintenanceSummaryByPriority {
  key: string
  count: number
}

export interface MaintenanceSummaryByType {
  key: string
  count: number
}

export interface MaintenanceSummaryTimeline {
  date: string
  count: number
}

export interface MaintenanceSummaryData {
  total: number
  active: number
  completed: number
  byStatus: MaintenanceSummaryByStatus[]
  byPriority: MaintenanceSummaryByPriority[]
  byType: MaintenanceSummaryByType[]
  timeline: MaintenanceSummaryTimeline[]
}

export interface MaintenanceSummaryParams {
  From?: string
  To?: string
  Scope?: number
  Type?: number
  DistributionSubstationId?: number
  FeederId?: number
}

// Interfaces for Vendor Summary Analytics
export interface VendorByState {
  state: string
  count: number
}

export interface VendorSummaryData {
  totalVendors: number
  activeVendors: number
  suspendedVendors: number
  vendorsByState: VendorByState[]
}

export interface VendorSummaryParams {
  state?: string
  status?: "active" | "suspended"
}

// Interfaces for Sales Rep Analytics
export interface SalesRepOverview {
  totalAgents: number
  activeAgents: number
  inactiveAgents: number
  totalCashAtHand: number
}

export interface SalesRepTransactions {
  totalAmount: number
  totalCount: number
  confirmedAmount: number
  confirmedCount: number
  pendingAmount: number
  pendingCount: number
}

export interface SalesRepPerformanceAgent {
  id: number
  name: string
  amount: number
  count: number
}

export interface SalesRepPerformance {
  topAgents: SalesRepPerformanceAgent[]
}

export interface SalesRepCashClearance {
  currentCashAtHand: number
  clearedAmount: number
  clearanceCount: number
  rangeStartUtc: string
  rangeEndUtc: string
}

export interface SalesRepAnalyticsData {
  overview: SalesRepOverview
  transactions: SalesRepTransactions
  performance: SalesRepPerformance
  cashClearance: SalesRepCashClearance
}

export interface SalesRepAnalyticsParams {
  startDateUtc?: string
  endDateUtc?: string
  topCount?: number
}

export interface AssetManagementResponse {
  isSuccess: boolean
  message: string
  data: AssetManagementData
}

export interface CustomerAnalyticsResponse {
  isSuccess: boolean
  message: string
  data: CustomerAnalyticsData
}

export interface PostpaidBillingAnalyticsResponse {
  isSuccess: boolean
  message: string
  data: PostpaidBillingAnalyticsData
}

export interface PaymentSummaryResponse {
  isSuccess: boolean
  message: string
  data: PaymentSummaryData
}

export interface OutageSummaryResponse {
  isSuccess: boolean
  message: string
  data: OutageSummaryData
}

export interface MaintenanceSummaryResponse {
  isSuccess: boolean
  message: string
  data: MaintenanceSummaryData
}

export interface VendorSummaryResponse {
  isSuccess: boolean
  message: string
  data: VendorSummaryData
}

export interface SalesRepAnalyticsResponse {
  isSuccess: boolean
  message: string
  data: SalesRepAnalyticsData
}

// Analytics State
interface AnalyticsState {
  // Asset Management state
  assetManagementData: AssetManagementData | null
  assetManagementLoading: boolean
  assetManagementError: string | null
  assetManagementSuccess: boolean

  // Customer Analytics state
  customerAnalyticsData: CustomerAnalyticsData | null
  customerAnalyticsLoading: boolean
  customerAnalyticsError: string | null
  customerAnalyticsSuccess: boolean

  // Postpaid Billing Analytics state
  postpaidBillingAnalyticsData: PostpaidBillingAnalyticsData | null
  postpaidBillingAnalyticsLoading: boolean
  postpaidBillingAnalyticsError: string | null
  postpaidBillingAnalyticsSuccess: boolean
  postpaidBillingAnalyticsParams: PostpaidBillingAnalyticsParams | null

  // Payment Summary Analytics state
  paymentSummaryData: PaymentSummaryData | null
  paymentSummaryLoading: boolean
  paymentSummaryError: string | null
  paymentSummarySuccess: boolean
  paymentSummaryParams: PaymentSummaryParams | null

  // Outage Summary Analytics state
  outageSummaryData: OutageSummaryData | null
  outageSummaryLoading: boolean
  outageSummaryError: string | null
  outageSummarySuccess: boolean
  outageSummaryParams: OutageSummaryParams | null

  // Maintenance Summary Analytics state
  maintenanceSummaryData: MaintenanceSummaryData | null
  maintenanceSummaryLoading: boolean
  maintenanceSummaryError: string | null
  maintenanceSummarySuccess: boolean
  maintenanceSummaryParams: MaintenanceSummaryParams | null

  // Vendor Summary Analytics state
  vendorSummaryData: VendorSummaryData | null
  vendorSummaryLoading: boolean
  vendorSummaryError: string | null
  vendorSummarySuccess: boolean
  vendorSummaryParams: VendorSummaryParams | null

  // Sales Rep Analytics state
  salesRepAnalyticsData: SalesRepAnalyticsData | null
  salesRepAnalyticsLoading: boolean
  salesRepAnalyticsError: string | null
  salesRepAnalyticsSuccess: boolean
  salesRepAnalyticsParams: SalesRepAnalyticsParams | null

  // General analytics state
  loading: boolean
  error: string | null
}

// Initial state
const initialState: AnalyticsState = {
  assetManagementData: null,
  assetManagementLoading: false,
  assetManagementError: null,
  assetManagementSuccess: false,

  customerAnalyticsData: null,
  customerAnalyticsLoading: false,
  customerAnalyticsError: null,
  customerAnalyticsSuccess: false,

  postpaidBillingAnalyticsData: null,
  postpaidBillingAnalyticsLoading: false,
  postpaidBillingAnalyticsError: null,
  postpaidBillingAnalyticsSuccess: false,
  postpaidBillingAnalyticsParams: null,

  paymentSummaryData: null,
  paymentSummaryLoading: false,
  paymentSummaryError: null,
  paymentSummarySuccess: false,
  paymentSummaryParams: null,

  outageSummaryData: null,
  outageSummaryLoading: false,
  outageSummaryError: null,
  outageSummarySuccess: false,
  outageSummaryParams: null,

  maintenanceSummaryData: null,
  maintenanceSummaryLoading: false,
  maintenanceSummaryError: null,
  maintenanceSummarySuccess: false,
  maintenanceSummaryParams: null,

  vendorSummaryData: null,
  vendorSummaryLoading: false,
  vendorSummaryError: null,
  vendorSummarySuccess: false,
  vendorSummaryParams: null,

  salesRepAnalyticsData: null,
  salesRepAnalyticsLoading: false,
  salesRepAnalyticsError: null,
  salesRepAnalyticsSuccess: false,
  salesRepAnalyticsParams: null,

  loading: false,
  error: null,
}

// Async thunks
export const fetchAssetManagementAnalytics = createAsyncThunk(
  "analytics/fetchAssetManagementAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<AssetManagementResponse>(buildApiUrl(API_ENDPOINTS.ANALYTICS.ASSET_MANAGEMENT))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch asset management analytics")
      }

      // Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Asset management analytics data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch asset management analytics")
      }
      return rejectWithValue(error.message || "Network error during asset management analytics fetch")
    }
  }
)

export const fetchCustomerAnalytics = createAsyncThunk(
  "analytics/fetchCustomerAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<CustomerAnalyticsResponse>(buildApiUrl(API_ENDPOINTS.ANALYTICS.CUSTOMER))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch customer analytics")
      }

      // Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Customer analytics data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch customer analytics")
      }
      return rejectWithValue(error.message || "Network error during customer analytics fetch")
    }
  }
)

export const fetchPostpaidBillingAnalytics = createAsyncThunk(
  "analytics/fetchPostpaidBillingAnalytics",
  async (params: PostpaidBillingAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<PostpaidBillingAnalyticsResponse>(
        buildApiUrl(API_ENDPOINTS.ANALYTICS.POSTPAID_BILLING),
        { params }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch postpaid billing analytics")
      }

      // Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Postpaid billing analytics data not found")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch postpaid billing analytics")
      }
      return rejectWithValue(error.message || "Network error during postpaid billing analytics fetch")
    }
  }
)

export const fetchPaymentSummaryAnalytics = createAsyncThunk(
  "analytics/fetchPaymentSummaryAnalytics",
  async (params: PaymentSummaryParams, { rejectWithValue }) => {
    try {
      const response = await api.post<PaymentSummaryResponse>(
        buildApiUrl(API_ENDPOINTS.ANALYTICS.PAYMENT_SUMMARY),
        params // Send as request body for POST
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payment summary analytics")
      }

      // Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Payment summary analytics data not found")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payment summary analytics")
      }
      return rejectWithValue(error.message || "Network error during payment summary analytics fetch")
    }
  }
)

export const fetchOutageSummaryAnalytics = createAsyncThunk(
  "analytics/fetchOutageSummaryAnalytics",
  async (params: OutageSummaryParams, { rejectWithValue }) => {
    try {
      const response = await api.get<OutageSummaryResponse>(buildApiUrl(API_ENDPOINTS.ANALYTICS.OUTAGE_SUMMARY), {
        params,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch outage summary analytics")
      }

      // Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Outage summary analytics data not found")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch outage summary analytics")
      }
      return rejectWithValue(error.message || "Network error during outage summary analytics fetch")
    }
  }
)

export const fetchMaintenanceSummaryAnalytics = createAsyncThunk(
  "analytics/fetchMaintenanceSummaryAnalytics",
  async (params: MaintenanceSummaryParams, { rejectWithValue }) => {
    try {
      const response = await api.get<MaintenanceSummaryResponse>(
        buildApiUrl(API_ENDPOINTS.ANALYTICS.MAINTENANCE_SUMMARY),
        {
          params,
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch maintenance summary analytics")
      }

      // Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Maintenance summary analytics data not found")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch maintenance summary analytics")
      }
      return rejectWithValue(error.message || "Network error during maintenance summary analytics fetch")
    }
  }
)

export const fetchVendorSummaryAnalytics = createAsyncThunk(
  "analytics/fetchVendorSummaryAnalytics",
  async (params: VendorSummaryParams, { rejectWithValue }) => {
    try {
      const response = await api.get<VendorSummaryResponse>(buildApiUrl(API_ENDPOINTS.ANALYTICS.VENDOR_SUMMARY), {
        params,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch vendor summary analytics")
      }

      // Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Vendor summary analytics data not found")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch vendor summary analytics")
      }
      return rejectWithValue(error.message || "Network error during vendor summary analytics fetch")
    }
  }
)

export const fetchSalesRepAnalytics = createAsyncThunk(
  "analytics/fetchSalesRepAnalytics",
  async (params: SalesRepAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.post<SalesRepAnalyticsResponse>(
        buildApiUrl(API_ENDPOINTS.ANALYTICS.SALES_REP),
        params // Send as request body for POST
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch sales rep analytics")
      }

      // Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Sales rep analytics data not found")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch sales rep analytics")
      }
      return rejectWithValue(error.message || "Network error during sales rep analytics fetch")
    }
  }
)

// Analytics slice
const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    // Clear asset management analytics state
    clearAssetManagementAnalytics: (state) => {
      state.assetManagementData = null
      state.assetManagementError = null
      state.assetManagementSuccess = false
      state.assetManagementLoading = false
    },

    // Clear customer analytics state
    clearCustomerAnalytics: (state) => {
      state.customerAnalyticsData = null
      state.customerAnalyticsError = null
      state.customerAnalyticsSuccess = false
      state.customerAnalyticsLoading = false
    },

    // Clear postpaid billing analytics state
    clearPostpaidBillingAnalytics: (state) => {
      state.postpaidBillingAnalyticsData = null
      state.postpaidBillingAnalyticsError = null
      state.postpaidBillingAnalyticsSuccess = false
      state.postpaidBillingAnalyticsLoading = false
      state.postpaidBillingAnalyticsParams = null
    },

    // Clear payment summary analytics state
    clearPaymentSummaryAnalytics: (state) => {
      state.paymentSummaryData = null
      state.paymentSummaryError = null
      state.paymentSummarySuccess = false
      state.paymentSummaryLoading = false
      state.paymentSummaryParams = null
    },

    // Clear outage summary analytics state
    clearOutageSummaryAnalytics: (state) => {
      state.outageSummaryData = null
      state.outageSummaryError = null
      state.outageSummarySuccess = false
      state.outageSummaryLoading = false
      state.outageSummaryParams = null
    },

    // Clear maintenance summary analytics state
    clearMaintenanceSummaryAnalytics: (state) => {
      state.maintenanceSummaryData = null
      state.maintenanceSummaryError = null
      state.maintenanceSummarySuccess = false
      state.maintenanceSummaryLoading = false
      state.maintenanceSummaryParams = null
    },

    // Clear vendor summary analytics state
    clearVendorSummaryAnalytics: (state) => {
      state.vendorSummaryData = null
      state.vendorSummaryError = null
      state.vendorSummarySuccess = false
      state.vendorSummaryLoading = false
      state.vendorSummaryParams = null
    },

    // Clear sales rep analytics state
    clearSalesRepAnalytics: (state) => {
      state.salesRepAnalyticsData = null
      state.salesRepAnalyticsError = null
      state.salesRepAnalyticsSuccess = false
      state.salesRepAnalyticsLoading = false
      state.salesRepAnalyticsParams = null
    },

    // Set postpaid billing analytics parameters
    setPostpaidBillingAnalyticsParams: (state, action: PayloadAction<PostpaidBillingAnalyticsParams>) => {
      state.postpaidBillingAnalyticsParams = action.payload
    },

    // Set payment summary analytics parameters
    setPaymentSummaryAnalyticsParams: (state, action: PayloadAction<PaymentSummaryParams>) => {
      state.paymentSummaryParams = action.payload
    },

    // Set outage summary analytics parameters
    setOutageSummaryAnalyticsParams: (state, action: PayloadAction<OutageSummaryParams>) => {
      state.outageSummaryParams = action.payload
    },

    // Set maintenance summary analytics parameters
    setMaintenanceSummaryAnalyticsParams: (state, action: PayloadAction<MaintenanceSummaryParams>) => {
      state.maintenanceSummaryParams = action.payload
    },

    // Set vendor summary analytics parameters
    setVendorSummaryAnalyticsParams: (state, action: PayloadAction<VendorSummaryParams>) => {
      state.vendorSummaryParams = action.payload
    },

    // Set sales rep analytics parameters
    setSalesRepAnalyticsParams: (state, action: PayloadAction<SalesRepAnalyticsParams>) => {
      state.salesRepAnalyticsParams = action.payload
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.assetManagementError = null
      state.customerAnalyticsError = null
      state.postpaidBillingAnalyticsError = null
      state.paymentSummaryError = null
      state.outageSummaryError = null
      state.maintenanceSummaryError = null
      state.vendorSummaryError = null
      state.salesRepAnalyticsError = null
    },

    // Reset analytics state
    resetAnalyticsState: (state) => {
      state.assetManagementData = null
      state.assetManagementLoading = false
      state.assetManagementError = null
      state.assetManagementSuccess = false

      state.customerAnalyticsData = null
      state.customerAnalyticsLoading = false
      state.customerAnalyticsError = null
      state.customerAnalyticsSuccess = false

      state.postpaidBillingAnalyticsData = null
      state.postpaidBillingAnalyticsLoading = false
      state.postpaidBillingAnalyticsError = null
      state.postpaidBillingAnalyticsSuccess = false
      state.postpaidBillingAnalyticsParams = null

      state.paymentSummaryData = null
      state.paymentSummaryLoading = false
      state.paymentSummaryError = null
      state.paymentSummarySuccess = false
      state.paymentSummaryParams = null

      state.outageSummaryData = null
      state.outageSummaryLoading = false
      state.outageSummaryError = null
      state.outageSummarySuccess = false
      state.outageSummaryParams = null

      state.maintenanceSummaryData = null
      state.maintenanceSummaryLoading = false
      state.maintenanceSummaryError = null
      state.maintenanceSummarySuccess = false
      state.maintenanceSummaryParams = null

      state.vendorSummaryData = null
      state.vendorSummaryLoading = false
      state.vendorSummaryError = null
      state.vendorSummarySuccess = false
      state.vendorSummaryParams = null

      state.salesRepAnalyticsData = null
      state.salesRepAnalyticsLoading = false
      state.salesRepAnalyticsError = null
      state.salesRepAnalyticsSuccess = false
      state.salesRepAnalyticsParams = null

      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch asset management analytics cases
      .addCase(fetchAssetManagementAnalytics.pending, (state) => {
        state.assetManagementLoading = true
        state.assetManagementError = null
        state.assetManagementSuccess = false
      })
      .addCase(fetchAssetManagementAnalytics.fulfilled, (state, action: PayloadAction<AssetManagementData>) => {
        state.assetManagementLoading = false
        state.assetManagementSuccess = true
        state.assetManagementData = action.payload
        state.assetManagementError = null
      })
      .addCase(fetchAssetManagementAnalytics.rejected, (state, action) => {
        state.assetManagementLoading = false
        state.assetManagementError = (action.payload as string) || "Failed to fetch asset management analytics"
        state.assetManagementSuccess = false
        state.assetManagementData = null
      })

      // Fetch customer analytics cases
      .addCase(fetchCustomerAnalytics.pending, (state) => {
        state.customerAnalyticsLoading = true
        state.customerAnalyticsError = null
        state.customerAnalyticsSuccess = false
      })
      .addCase(fetchCustomerAnalytics.fulfilled, (state, action: PayloadAction<CustomerAnalyticsData>) => {
        state.customerAnalyticsLoading = false
        state.customerAnalyticsSuccess = true
        state.customerAnalyticsData = action.payload
        state.customerAnalyticsError = null
      })
      .addCase(fetchCustomerAnalytics.rejected, (state, action) => {
        state.customerAnalyticsLoading = false
        state.customerAnalyticsError = (action.payload as string) || "Failed to fetch customer analytics"
        state.customerAnalyticsSuccess = false
        state.customerAnalyticsData = null
      })

      // Fetch postpaid billing analytics cases
      .addCase(fetchPostpaidBillingAnalytics.pending, (state) => {
        state.postpaidBillingAnalyticsLoading = true
        state.postpaidBillingAnalyticsError = null
        state.postpaidBillingAnalyticsSuccess = false
      })
      .addCase(
        fetchPostpaidBillingAnalytics.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: PostpaidBillingAnalyticsData
            params: PostpaidBillingAnalyticsParams
          }>
        ) => {
          state.postpaidBillingAnalyticsLoading = false
          state.postpaidBillingAnalyticsSuccess = true
          state.postpaidBillingAnalyticsData = action.payload.data
          state.postpaidBillingAnalyticsParams = action.payload.params
          state.postpaidBillingAnalyticsError = null
        }
      )
      .addCase(fetchPostpaidBillingAnalytics.rejected, (state, action) => {
        state.postpaidBillingAnalyticsLoading = false
        state.postpaidBillingAnalyticsError = (action.payload as string) || "Failed to fetch postpaid billing analytics"
        state.postpaidBillingAnalyticsSuccess = false
        state.postpaidBillingAnalyticsData = null
      })

      // Fetch payment summary analytics cases
      .addCase(fetchPaymentSummaryAnalytics.pending, (state) => {
        state.paymentSummaryLoading = true
        state.paymentSummaryError = null
        state.paymentSummarySuccess = false
      })
      .addCase(
        fetchPaymentSummaryAnalytics.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: PaymentSummaryData
            params: PaymentSummaryParams
          }>
        ) => {
          state.paymentSummaryLoading = false
          state.paymentSummarySuccess = true
          state.paymentSummaryData = action.payload.data
          state.paymentSummaryParams = action.payload.params
          state.paymentSummaryError = null
        }
      )
      .addCase(fetchPaymentSummaryAnalytics.rejected, (state, action) => {
        state.paymentSummaryLoading = false
        state.paymentSummaryError = (action.payload as string) || "Failed to fetch payment summary analytics"
        state.paymentSummarySuccess = false
        state.paymentSummaryData = null
      })

      // Fetch outage summary analytics cases
      .addCase(fetchOutageSummaryAnalytics.pending, (state) => {
        state.outageSummaryLoading = true
        state.outageSummaryError = null
        state.outageSummarySuccess = false
      })
      .addCase(
        fetchOutageSummaryAnalytics.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: OutageSummaryData
            params: OutageSummaryParams
          }>
        ) => {
          state.outageSummaryLoading = false
          state.outageSummarySuccess = true
          state.outageSummaryData = action.payload.data
          state.outageSummaryParams = action.payload.params
          state.outageSummaryError = null
        }
      )
      .addCase(fetchOutageSummaryAnalytics.rejected, (state, action) => {
        state.outageSummaryLoading = false
        state.outageSummaryError = (action.payload as string) || "Failed to fetch outage summary analytics"
        state.outageSummarySuccess = false
        state.outageSummaryData = null
      })

      // Fetch maintenance summary analytics cases
      .addCase(fetchMaintenanceSummaryAnalytics.pending, (state) => {
        state.maintenanceSummaryLoading = true
        state.maintenanceSummaryError = null
        state.maintenanceSummarySuccess = false
      })
      .addCase(
        fetchMaintenanceSummaryAnalytics.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: MaintenanceSummaryData
            params: MaintenanceSummaryParams
          }>
        ) => {
          state.maintenanceSummaryLoading = false
          state.maintenanceSummarySuccess = true
          state.maintenanceSummaryData = action.payload.data
          state.maintenanceSummaryParams = action.payload.params
          state.maintenanceSummaryError = null
        }
      )
      .addCase(fetchMaintenanceSummaryAnalytics.rejected, (state, action) => {
        state.maintenanceSummaryLoading = false
        state.maintenanceSummaryError = (action.payload as string) || "Failed to fetch maintenance summary analytics"
        state.maintenanceSummarySuccess = false
        state.maintenanceSummaryData = null
      })

      // Fetch vendor summary analytics cases
      .addCase(fetchVendorSummaryAnalytics.pending, (state) => {
        state.vendorSummaryLoading = true
        state.vendorSummaryError = null
        state.vendorSummarySuccess = false
      })
      .addCase(
        fetchVendorSummaryAnalytics.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: VendorSummaryData
            params: VendorSummaryParams
          }>
        ) => {
          state.vendorSummaryLoading = false
          state.vendorSummarySuccess = true
          state.vendorSummaryData = action.payload.data
          state.vendorSummaryParams = action.payload.params
          state.vendorSummaryError = null
        }
      )
      .addCase(fetchVendorSummaryAnalytics.rejected, (state, action) => {
        state.vendorSummaryLoading = false
        state.vendorSummaryError = (action.payload as string) || "Failed to fetch vendor summary analytics"
        state.vendorSummarySuccess = false
        state.vendorSummaryData = null
      })

      // Fetch sales rep analytics cases
      .addCase(fetchSalesRepAnalytics.pending, (state) => {
        state.salesRepAnalyticsLoading = true
        state.salesRepAnalyticsError = null
        state.salesRepAnalyticsSuccess = false
      })
      .addCase(
        fetchSalesRepAnalytics.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: SalesRepAnalyticsData
            params: SalesRepAnalyticsParams
          }>
        ) => {
          state.salesRepAnalyticsLoading = false
          state.salesRepAnalyticsSuccess = true
          state.salesRepAnalyticsData = action.payload.data
          state.salesRepAnalyticsParams = action.payload.params
          state.salesRepAnalyticsError = null
        }
      )
      .addCase(fetchSalesRepAnalytics.rejected, (state, action) => {
        state.salesRepAnalyticsLoading = false
        state.salesRepAnalyticsError = (action.payload as string) || "Failed to fetch sales rep analytics"
        state.salesRepAnalyticsSuccess = false
        state.salesRepAnalyticsData = null
      })
  },
})

export const {
  clearAssetManagementAnalytics,
  clearCustomerAnalytics,
  clearPostpaidBillingAnalytics,
  clearPaymentSummaryAnalytics,
  clearOutageSummaryAnalytics,
  clearMaintenanceSummaryAnalytics,
  clearVendorSummaryAnalytics,
  clearSalesRepAnalytics,
  setPostpaidBillingAnalyticsParams,
  setPaymentSummaryAnalyticsParams,
  setOutageSummaryAnalyticsParams,
  setMaintenanceSummaryAnalyticsParams,
  setVendorSummaryAnalyticsParams,
  setSalesRepAnalyticsParams,
  clearError,
  resetAnalyticsState,
} = analyticsSlice.actions

export default analyticsSlice.reducer
