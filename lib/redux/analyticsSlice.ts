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

    // Set postpaid billing analytics parameters
    setPostpaidBillingAnalyticsParams: (state, action: PayloadAction<PostpaidBillingAnalyticsParams>) => {
      state.postpaidBillingAnalyticsParams = action.payload
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.assetManagementError = null
      state.customerAnalyticsError = null
      state.postpaidBillingAnalyticsError = null
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
  },
})

export const {
  clearAssetManagementAnalytics,
  clearCustomerAnalytics,
  clearPostpaidBillingAnalytics,
  setPostpaidBillingAnalyticsParams,
  clearError,
  resetAnalyticsState,
} = analyticsSlice.actions

export default analyticsSlice.reducer
