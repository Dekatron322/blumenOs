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
}

// Request parameters interface
export interface BillingPeriodsRequestParams {
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
  currentBillingPeriod: null,
  currentBillingPeriodLoading: false,
  currentBillingPeriodError: null,
}

// Async thunk for fetching billing periods
export const fetchBillingPeriods = createAsyncThunk(
  "billingPeriods/fetchBillingPeriods",
  async (params: BillingPeriodsRequestParams = {}, { rejectWithValue }) => {
    try {
      // Build query parameters
      const searchParams = new URLSearchParams()

      if (params.year !== undefined) {
        searchParams.append("year", params.year.toString())
      }

      if (params.month !== undefined) {
        searchParams.append("month", params.month.toString())
      }

      if (params.status !== undefined) {
        searchParams.append("status", params.status.toString())
      }

      const queryString = searchParams.toString()
      const url = queryString
        ? `${buildApiUrl(API_ENDPOINTS.BILLING_PERIODS.GET)}?${queryString}`
        : buildApiUrl(API_ENDPOINTS.BILLING_PERIODS.GET)

      const response = await api.get<BillingPeriodsResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch billing periods")
      }

      return response.data.data
    } catch (error: any) {
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
      .addCase(fetchBillingPeriods.fulfilled, (state, action: PayloadAction<BillingPeriod[]>) => {
        state.loading = false
        state.success = true
        state.error = null
        state.billingPeriods = action.payload
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
