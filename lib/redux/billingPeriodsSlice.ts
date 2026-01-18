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
  },
})

export const { clearBillingPeriodsState, clearCurrentBillingPeriodState, clearError, resetBillingPeriodsState } =
  billingPeriodsSlice.actions

export default billingPeriodsSlice.reducer
