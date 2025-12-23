// src/lib/redux/revenueAnalyticsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Types for the revenue analytics API
export interface RevenueAnalyticsParams {
  StartDateUtc: string
  EndDateUtc: string
  AreaOfficeId?: number
  Channel?: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque"
  CollectorType?: "Customer" | "SalesRep" | "Vendor" | "Staff"
}

export interface RevenueBreakdownParams extends RevenueAnalyticsParams {
  dimension: 0 | 1 | 2 | 3 | 4 | 5
}

export interface RevenueTopCollectorsParams extends RevenueAnalyticsParams {
  top: number
}

export interface RevenuePoint {
  bucketDate: string
  amount: number
  count: number
}

export interface RevenueAnalyticsData {
  points: RevenuePoint[]
}

export interface RevenueAnalyticsResponse {
  isSuccess: boolean
  message: string
  data: RevenueAnalyticsData
}

export interface RevenueBreakdownSlice {
  label: string
  amount: number
  count: number
  percentage: number
}

export interface RevenueBreakdownData {
  dimension: number
  slices: RevenueBreakdownSlice[]
}

export interface RevenueBreakdownResponse {
  isSuccess: boolean
  message: string
  data: RevenueBreakdownData
}

export interface RevenueTopCollector {
  collectorType: "Customer" | "SalesRep" | "Vendor" | "Staff"
  collectorId: number
  collectorName: string
  totalAmount: number
  totalCount: number
  averageAmount: number
}

export interface RevenueTopCollectorsData {
  collectors: RevenueTopCollector[]
}

export interface RevenueTopCollectorsResponse {
  isSuccess: boolean
  message: string
  data: RevenueTopCollectorsData
}

interface RevenueAnalyticsState {
  data: RevenuePoint[]
  loading: boolean
  error: string | null
  isSuccess: boolean
  message: string | null
  // Breakdown state
  breakdownSlices: RevenueBreakdownSlice[]
  breakdownLoading: boolean
  breakdownError: string | null
  breakdownSuccess: boolean
  currentBreakdownDimension: number | null
  // Payment types state
  paymentTypesSlices: RevenueBreakdownSlice[]
  paymentTypesLoading: boolean
  paymentTypesError: string | null
  paymentTypesSuccess: boolean
  currentPaymentTypesDimension: number | null
  // Top collectors state
  topCollectors: RevenueTopCollector[]
  topCollectorsLoading: boolean
  topCollectorsError: string | null
  topCollectorsSuccess: boolean
}

const initialState: RevenueAnalyticsState = {
  data: [],
  loading: false,
  error: null,
  isSuccess: false,
  message: null,
  // Breakdown initial state
  breakdownSlices: [],
  breakdownLoading: false,
  breakdownError: null,
  breakdownSuccess: false,
  currentBreakdownDimension: null,
  // Payment types initial state
  paymentTypesSlices: [],
  paymentTypesLoading: false,
  paymentTypesError: null,
  paymentTypesSuccess: false,
  currentPaymentTypesDimension: null,
  // Top collectors initial state
  topCollectors: [],
  topCollectorsLoading: false,
  topCollectorsError: null,
  topCollectorsSuccess: false,
}

// Async thunk for fetching revenue analytics
export const fetchRevenueAnalytics = createAsyncThunk(
  "revenueAnalytics/fetchRevenueAnalytics",
  async (params: RevenueAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<RevenueAnalyticsResponse>(
        buildApiUrl(API_ENDPOINTS.REVENUE_ANALYTICS.DAILY_COLLECTION),
        {
          params: {
            StartDateUtc: params.StartDateUtc,
            EndDateUtc: params.EndDateUtc,
            ...(params.AreaOfficeId !== undefined && { AreaOfficeId: params.AreaOfficeId }),
            ...(params.Channel && { Channel: params.Channel }),
            ...(params.CollectorType && { CollectorType: params.CollectorType }),
          },
        }
      )

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "Failed to fetch revenue analytics")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching revenue breakdown
export const fetchRevenueBreakdown = createAsyncThunk(
  "revenueAnalytics/fetchRevenueBreakdown",
  async (params: RevenueBreakdownParams, { rejectWithValue }) => {
    try {
      const response = await api.get<RevenueBreakdownResponse>(buildApiUrl(API_ENDPOINTS.REVENUE_ANALYTICS.BREAKDOWN), {
        params: {
          StartDateUtc: params.StartDateUtc,
          EndDateUtc: params.EndDateUtc,
          ...(params.AreaOfficeId !== undefined && { AreaOfficeId: params.AreaOfficeId }),
          ...(params.Channel && { Channel: params.Channel }),
          ...(params.CollectorType && { CollectorType: params.CollectorType }),
          dimension: params.dimension,
        },
      })

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "Failed to fetch revenue breakdown")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching revenue payment types
export const fetchRevenuePaymentTypes = createAsyncThunk(
  "revenueAnalytics/fetchRevenuePaymentTypes",
  async (params: RevenueAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<RevenueBreakdownResponse>(
        buildApiUrl(API_ENDPOINTS.REVENUE_ANALYTICS.PAYMENT_TYPES),
        {
          params: {
            StartDateUtc: params.StartDateUtc,
            EndDateUtc: params.EndDateUtc,
            ...(params.AreaOfficeId !== undefined && { AreaOfficeId: params.AreaOfficeId }),
            ...(params.Channel && { Channel: params.Channel }),
            ...(params.CollectorType && { CollectorType: params.CollectorType }),
          },
        }
      )

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "Failed to fetch revenue payment types")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching revenue top collectors
export const fetchRevenueTopCollectors = createAsyncThunk(
  "revenueAnalytics/fetchRevenueTopCollectors",
  async (params: RevenueTopCollectorsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<RevenueTopCollectorsResponse>(
        buildApiUrl(API_ENDPOINTS.REVENUE_ANALYTICS.TOP_COLLECTORS),
        {
          params: {
            StartDateUtc: params.StartDateUtc,
            EndDateUtc: params.EndDateUtc,
            ...(params.AreaOfficeId !== undefined && { AreaOfficeId: params.AreaOfficeId }),
            ...(params.Channel && { Channel: params.Channel }),
            ...(params.CollectorType && { CollectorType: params.CollectorType }),
            top: params.top,
          },
        }
      )

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "Failed to fetch revenue top collectors")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

const revenueAnalyticsSlice = createSlice({
  name: "revenueAnalytics",
  initialState,
  reducers: {
    clearRevenueAnalytics(state) {
      state.data = []
      state.loading = false
      state.error = null
      state.isSuccess = false
      state.message = null
    },
    clearError(state) {
      state.error = null
    },
    clearRevenueBreakdown(state) {
      state.breakdownSlices = []
      state.breakdownLoading = false
      state.breakdownError = null
      state.breakdownSuccess = false
      state.currentBreakdownDimension = null
    },
    clearRevenuePaymentTypes(state) {
      state.paymentTypesSlices = []
      state.paymentTypesLoading = false
      state.paymentTypesError = null
      state.paymentTypesSuccess = false
      state.currentPaymentTypesDimension = null
    },
    clearRevenueTopCollectors(state) {
      state.topCollectors = []
      state.topCollectorsLoading = false
      state.topCollectorsError = null
      state.topCollectorsSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
        state.isSuccess = false
        state.message = null
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.isSuccess = true
        state.message = action.payload.message
        state.data = action.payload.data.points
        state.error = null
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch revenue analytics"
        state.isSuccess = false
        state.message = null
        state.data = []
      })
      // Fetch revenue breakdown
      .addCase(fetchRevenueBreakdown.pending, (state) => {
        state.breakdownLoading = true
        state.breakdownError = null
        state.breakdownSuccess = false
      })
      .addCase(fetchRevenueBreakdown.fulfilled, (state, action) => {
        state.breakdownLoading = false
        state.breakdownSuccess = true
        state.breakdownSlices = action.payload.data.slices
        state.currentBreakdownDimension = action.payload.data.dimension
        state.breakdownError = null
      })
      .addCase(fetchRevenueBreakdown.rejected, (state, action) => {
        state.breakdownLoading = false
        state.breakdownError = (action.payload as string) || "Failed to fetch revenue breakdown"
        state.breakdownSuccess = false
        state.breakdownSlices = []
        state.currentBreakdownDimension = null
      })
      // Fetch revenue payment types
      .addCase(fetchRevenuePaymentTypes.pending, (state) => {
        state.paymentTypesLoading = true
        state.paymentTypesError = null
        state.paymentTypesSuccess = false
      })
      .addCase(fetchRevenuePaymentTypes.fulfilled, (state, action) => {
        state.paymentTypesLoading = false
        state.paymentTypesSuccess = true
        state.paymentTypesSlices = action.payload.data.slices
        state.currentPaymentTypesDimension = action.payload.data.dimension
        state.paymentTypesError = null
      })
      .addCase(fetchRevenuePaymentTypes.rejected, (state, action) => {
        state.paymentTypesLoading = false
        state.paymentTypesError = (action.payload as string) || "Failed to fetch revenue payment types"
        state.paymentTypesSuccess = false
        state.paymentTypesSlices = []
        state.currentPaymentTypesDimension = null
      })
      // Fetch revenue top collectors
      .addCase(fetchRevenueTopCollectors.pending, (state) => {
        state.topCollectorsLoading = true
        state.topCollectorsError = null
        state.topCollectorsSuccess = false
      })
      .addCase(fetchRevenueTopCollectors.fulfilled, (state, action) => {
        state.topCollectorsLoading = false
        state.topCollectorsSuccess = true
        state.topCollectors = action.payload.data.collectors
        state.topCollectorsError = null
      })
      .addCase(fetchRevenueTopCollectors.rejected, (state, action) => {
        state.topCollectorsLoading = false
        state.topCollectorsError = (action.payload as string) || "Failed to fetch revenue top collectors"
        state.topCollectorsSuccess = false
        state.topCollectors = []
      })
  },
})

export const {
  clearRevenueAnalytics,
  clearError,
  clearRevenueBreakdown,
  clearRevenuePaymentTypes,
  clearRevenueTopCollectors,
} = revenueAnalyticsSlice.actions
export default revenueAnalyticsSlice.reducer
