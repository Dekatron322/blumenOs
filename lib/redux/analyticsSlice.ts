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

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.assetManagementError = null
      state.customerAnalyticsError = null
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
  },
})

export const { clearAssetManagementAnalytics, clearCustomerAnalytics, clearError, resetAnalyticsState } =
  analyticsSlice.actions

export default analyticsSlice.reducer
