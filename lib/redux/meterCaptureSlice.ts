// src/lib/redux/meterCaptureSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interface for Meter Capture enumeration data
export interface MeterCaptureData {
  id: number
  vendorId: number
  vendorName: string
  status: 1 | 2 | 3
  referenceId: string
  source: string
  error: string
  createdAtUtc: string
  processedAtUtc: string
}

// Interface for Meter Capture Response
export interface MeterCaptureResponse {
  isSuccess: boolean
  message: string
  data: MeterCaptureData[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Interface for Retry Response
export interface RetryMeterCaptureResponse {
  isSuccess: boolean
  message: string
}

// Interface for Meter Capture Request Parameters
export interface MeterCaptureRequestParams {
  pageNumber: number
  pageSize: number
  vendorId?: number
  status?: 1 | 2 | 3
  referenceId?: string
  source?: string
  fromUtc?: string
  toUtc?: string
}

// Interface for Meter Capture State
export interface MeterCaptureState {
  meterCaptures: MeterCaptureData[]
  loading: boolean
  error: string | null
  success: boolean
  retryLoading: boolean
  retryError: string | null
  retrySuccess: boolean
  retryAllLoading: boolean
  retryAllError: string | null
  retryAllSuccess: boolean
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// Initial state
const initialState: MeterCaptureState = {
  meterCaptures: [],
  loading: false,
  error: null,
  success: false,
  retryLoading: false,
  retryError: null,
  retrySuccess: false,
  retryAllLoading: false,
  retryAllError: null,
  retryAllSuccess: false,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
}

// Async Thunk for fetching meter captures
export const fetchMeterCaptures = createAsyncThunk(
  "meterCapture/fetchMeterCaptures",
  async (params: MeterCaptureRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, vendorId, status, referenceId, source, fromUtc, toUtc } = params

      const requestParams: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      }

      // Add optional parameters only if they are provided
      if (vendorId !== undefined) requestParams.VendorId = vendorId
      if (status !== undefined) requestParams.Status = status
      if (referenceId !== undefined) requestParams.ReferenceId = referenceId
      if (source !== undefined) requestParams.Source = source
      if (fromUtc !== undefined) requestParams.FromUtc = fromUtc
      if (toUtc !== undefined) requestParams.ToUtc = toUtc

      const response = await api.get<MeterCaptureResponse>(buildApiUrl(API_ENDPOINTS.METER_CAPTURE.GET), {
        params: requestParams,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch meter captures")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch meter captures")
      }
      return rejectWithValue(error.message || "Network error during meter captures fetch")
    }
  }
)

// Async Thunk for retrying a failed meter capture
export const retryMeterCapture = createAsyncThunk(
  "meterCapture/retryMeterCapture",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.post<RetryMeterCaptureResponse>(
        buildApiUrl(API_ENDPOINTS.METER_CAPTURE.RETRY_SINGLE_FAILED.replace("{id}", id.toString()))
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to retry meter capture")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to retry meter capture")
      }
      return rejectWithValue(error.message || "Network error during meter capture retry")
    }
  }
)

// Async Thunk for retrying all failed meter captures
export const retryAllFailed = createAsyncThunk("meterCapture/retryAllFailed", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post<RetryMeterCaptureResponse>(
      buildApiUrl(API_ENDPOINTS.METER_CAPTURE.RETRY_ALL_FAILED)
    )

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to retry all failed meter captures")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to retry all failed meter captures")
    }
    return rejectWithValue(error.message || "Network error during retry all failed meter captures")
  }
})

// Create the slice
const meterCaptureSlice = createSlice({
  name: "meterCapture",
  initialState,
  reducers: {
    clearMeterCaptureError: (state) => {
      state.error = null
    },
    clearRetryError: (state) => {
      state.retryError = null
      state.retrySuccess = false
    },
    clearRetryAllError: (state) => {
      state.retryAllError = null
      state.retryAllSuccess = false
    },
    resetMeterCaptureState: (state) => {
      state.meterCaptures = []
      state.loading = false
      state.error = null
      state.success = false
      state.retryLoading = false
      state.retryError = null
      state.retrySuccess = false
      state.retryAllLoading = false
      state.retryAllError = null
      state.retryAllSuccess = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch meter captures
      .addCase(fetchMeterCaptures.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchMeterCaptures.fulfilled, (state, action: PayloadAction<MeterCaptureResponse>) => {
        state.loading = false
        state.success = true
        state.meterCaptures = action.payload.data
        state.pagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchMeterCaptures.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
      // Retry meter capture
      .addCase(retryMeterCapture.pending, (state) => {
        state.retryLoading = true
        state.retryError = null
        state.retrySuccess = false
      })
      .addCase(retryMeterCapture.fulfilled, (state, action: PayloadAction<RetryMeterCaptureResponse>) => {
        state.retryLoading = false
        state.retrySuccess = true
      })
      .addCase(retryMeterCapture.rejected, (state, action) => {
        state.retryLoading = false
        state.retryError = action.payload as string
        state.retrySuccess = false
      })
      // Retry all failed meter captures
      .addCase(retryAllFailed.pending, (state) => {
        state.retryAllLoading = true
        state.retryAllError = null
        state.retryAllSuccess = false
      })
      .addCase(retryAllFailed.fulfilled, (state, action: PayloadAction<RetryMeterCaptureResponse>) => {
        state.retryAllLoading = false
        state.retryAllSuccess = true
      })
      .addCase(retryAllFailed.rejected, (state, action) => {
        state.retryAllLoading = false
        state.retryAllError = action.payload as string
        state.retryAllSuccess = false
      })
  },
})

export const { clearMeterCaptureError, clearRetryError, clearRetryAllError, resetMeterCaptureState } =
  meterCaptureSlice.actions

export default meterCaptureSlice.reducer
