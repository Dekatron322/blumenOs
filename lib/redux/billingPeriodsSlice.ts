// src/lib/redux/billingPeriodsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Billing Period
export interface LatestGeneratedBillHistory {
  id: number
  billingPeriodId: number
  generatedBillCount: number
  finalizedBillCount: number
  generatedAtUtc: string
}

export interface BillingPeriod {
  id: number
  year: number
  month: number
  periodKey: string
  displayName: string
  status: 1 | 2 // 1 = Active, 2 = Inactive (based on available values)
  latestGeneratedBillHistory?: LatestGeneratedBillHistory
  createdAt: string
  lastUpdated: string
}

export interface BillingPeriodsResponse {
  isSuccess: boolean
  message: string
  data: BillingPeriod[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface CreateCurrentBillingPeriodResponse {
  isSuccess: boolean
  message: string
  data: BillingPeriod
}

export interface CreatePastBillingPeriodRequest {
  year: number
  month: number
}

export interface CreatePastBillingPeriodResponse {
  isSuccess: boolean
  message: string
  data: BillingPeriod
}

// Request parameters interface
export interface BillingPeriodsRequestParams {
  pageNumber: number
  pageSize: number
  year?: number
  month?: number
  status?: 1 | 2
}

// Billing Period State
interface BillingPeriodState {
  // Billing periods list state
  billingPeriods: BillingPeriod[]
  loading: boolean
  error: string | null
  success: boolean

  // Pagination state
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Current billing period state (for viewing/editing)
  currentBillingPeriod: BillingPeriod | null
  currentBillingPeriodLoading: boolean
  currentBillingPeriodError: string | null

  // Create current billing period state
  createCurrentBillingPeriodLoading: boolean
  createCurrentBillingPeriodError: string | null
  createCurrentBillingPeriodSuccess: boolean

  // Create past billing period state
  createPastBillingPeriodLoading: boolean
  createPastBillingPeriodError: string | null
  createPastBillingPeriodSuccess: boolean
}

// Initial state
const initialState: BillingPeriodState = {
  billingPeriods: [],
  loading: false,
  error: null,
  success: false,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  currentBillingPeriod: null,
  currentBillingPeriodLoading: false,
  currentBillingPeriodError: null,
  createCurrentBillingPeriodLoading: false,
  createCurrentBillingPeriodError: null,
  createCurrentBillingPeriodSuccess: false,
  createPastBillingPeriodLoading: false,
  createPastBillingPeriodError: null,
  createPastBillingPeriodSuccess: false,
}

// Async thunk for fetching billing periods
export const fetchBillingPeriods = createAsyncThunk(
  "billingPeriods/fetchBillingPeriods",
  async (params: BillingPeriodsRequestParams, { rejectWithValue }) => {
    try {
      const { year, month, status } = params

      console.log("Fetching billing periods with params:", params)

      const response = await api.get<BillingPeriodsResponse>(buildApiUrl(API_ENDPOINTS.BILLING_PERIODS.GET), {
        params: {
          PageNumber: 1,
          PageSize: 100,
          ...(year !== undefined && { Year: year }),
          ...(month !== undefined && { Month: month }),
          ...(status !== undefined && { Status: status }),
        },
      })

      console.log("Billing periods API response:", response.data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch billing periods")
      }

      return response.data
    } catch (error: any) {
      console.error("Billing periods API error:", error)
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch billing periods")
      }
      return rejectWithValue(error.message || "Network error during billing periods fetch")
    }
  }
)

// Async thunk for creating current billing period
export const createCurrentBillingPeriod = createAsyncThunk(
  "billingPeriods/createCurrentBillingPeriod",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Creating current billing period")

      const response = await api.post<CreateCurrentBillingPeriodResponse>(
        buildApiUrl(API_ENDPOINTS.BILLING_PERIODS.CREATE_CURRENT_BILLING_PERIOD)
      )

      console.log("Create current billing period API response:", response.data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create current billing period")
      }

      return response.data
    } catch (error: any) {
      console.error("Create current billing period API error:", error)
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create current billing period")
      }
      return rejectWithValue(error.message || "Network error during current billing period creation")
    }
  }
)

// Async thunk for creating past billing period
export const createPastBillingPeriod = createAsyncThunk(
  "billingPeriods/createPastBillingPeriod",
  async (request: CreatePastBillingPeriodRequest, { rejectWithValue }) => {
    try {
      console.log("Creating past billing period with request:", request)

      const response = await api.post<CreatePastBillingPeriodResponse>(
        buildApiUrl(API_ENDPOINTS.BILLING_PERIODS.CREATE_PAST_BILLING_PERIOD),
        request
      )

      console.log("Create past billing period API response:", response.data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create past billing period")
      }

      return response.data
    } catch (error: any) {
      console.error("Create past billing period API error:", error)
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create past billing period")
      }
      return rejectWithValue(error.message || "Network error during past billing period creation")
    }
  }
)

// Billing periods slice
const billingPeriodsSlice = createSlice({
  name: "billingPeriods",
  initialState,
  reducers: {
    // Clear billing periods state
    clearBillingPeriodsState: (state) => {
      state.loading = false
      state.error = null
      state.success = false
      state.billingPeriods = []
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear current billing period state
    clearCurrentBillingPeriodState: (state) => {
      state.currentBillingPeriod = null
      state.currentBillingPeriodLoading = false
      state.currentBillingPeriodError = null
    },

    // Clear errors
    clearError: (state) => {
      state.error = null
      state.currentBillingPeriodError = null
      state.createCurrentBillingPeriodError = null
      state.createPastBillingPeriodError = null
    },

    // Clear create current billing period state
    clearCreateCurrentBillingPeriodState: (state) => {
      state.createCurrentBillingPeriodLoading = false
      state.createCurrentBillingPeriodError = null
      state.createCurrentBillingPeriodSuccess = false
    },

    // Clear create past billing period state
    clearCreatePastBillingPeriodState: (state) => {
      state.createPastBillingPeriodLoading = false
      state.createPastBillingPeriodError = null
      state.createPastBillingPeriodSuccess = false
    },

    // Reset billing periods state
    resetBillingPeriodsState: (state) => {
      state.loading = false
      state.error = null
      state.success = false
      state.billingPeriods = []
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.currentBillingPeriod = null
      state.currentBillingPeriodLoading = false
      state.currentBillingPeriodError = null
      state.createCurrentBillingPeriodLoading = false
      state.createCurrentBillingPeriodError = null
      state.createCurrentBillingPeriodSuccess = false
      state.createPastBillingPeriodLoading = false
      state.createPastBillingPeriodError = null
      state.createPastBillingPeriodSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch billing periods cases
      .addCase(fetchBillingPeriods.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchBillingPeriods.fulfilled, (state, action: PayloadAction<BillingPeriodsResponse>) => {
        state.loading = false
        state.success = true
        state.error = null
        state.billingPeriods = action.payload.data
        state.pagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchBillingPeriods.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch billing periods"
        state.success = false
        state.billingPeriods = []
      })
      // Create current billing period cases
      .addCase(createCurrentBillingPeriod.pending, (state) => {
        state.createCurrentBillingPeriodLoading = true
        state.createCurrentBillingPeriodError = null
        state.createCurrentBillingPeriodSuccess = false
      })
      .addCase(
        createCurrentBillingPeriod.fulfilled,
        (state, action: PayloadAction<CreateCurrentBillingPeriodResponse>) => {
          state.createCurrentBillingPeriodLoading = false
          state.createCurrentBillingPeriodSuccess = true
          state.createCurrentBillingPeriodError = null
          // Add the new billing period to the beginning of the list
          state.billingPeriods.unshift(action.payload.data)
          // Update current billing period
          state.currentBillingPeriod = action.payload.data
        }
      )
      .addCase(createCurrentBillingPeriod.rejected, (state, action) => {
        state.createCurrentBillingPeriodLoading = false
        state.createCurrentBillingPeriodError = (action.payload as string) || "Failed to create current billing period"
        state.createCurrentBillingPeriodSuccess = false
      })
      // Create past billing period cases
      .addCase(createPastBillingPeriod.pending, (state) => {
        state.createPastBillingPeriodLoading = true
        state.createPastBillingPeriodError = null
        state.createPastBillingPeriodSuccess = false
      })
      .addCase(createPastBillingPeriod.fulfilled, (state, action: PayloadAction<CreatePastBillingPeriodResponse>) => {
        state.createPastBillingPeriodLoading = false
        state.createPastBillingPeriodSuccess = true
        state.createPastBillingPeriodError = null
        // Add the new billing period to the beginning of the list
        state.billingPeriods.unshift(action.payload.data)
        // Update current billing period
        state.currentBillingPeriod = action.payload.data
      })
      .addCase(createPastBillingPeriod.rejected, (state, action) => {
        state.createPastBillingPeriodLoading = false
        state.createPastBillingPeriodError = (action.payload as string) || "Failed to create past billing period"
        state.createPastBillingPeriodSuccess = false
      })
  },
})

export const {
  clearBillingPeriodsState,
  clearCurrentBillingPeriodState,
  clearError,
  clearCreateCurrentBillingPeriodState,
  clearCreatePastBillingPeriodState,
  resetBillingPeriodsState,
} = billingPeriodsSlice.actions

export default billingPeriodsSlice.reducer
