// src/lib/redux/meterReadingSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Meter Reading
export interface MeterReading {
  id: number
  customerId: number
  period: string
  previousReadingKwh: number
  presentReadingKwh: number
  capturedAtUtc: string
  capturedByUserId: number
  capturedByName: string
  customerName: string
  customerAccountNumber: string
  notes: string
  validConsumptionKwh: number
  invalidConsumptionKwh: number
  averageConsumptionBaselineKwh: number
  standardDeviationKwh: number
  lowThresholdKwh: number
  highThresholdKwh: number
  anomalyScore: number
  validationStatus: number
  isFlaggedForReview: boolean
  isRollover: boolean
  rolloverCount: number
  rolloverAdjustmentKwh: number
  estimatedConsumptionKwh: number
  validatedAtUtc: string | null
  validationNotes: string | null
}

export interface MeterReadingsResponse {
  isSuccess: boolean
  message: string
  data: MeterReading[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface MeterReadingsRequestParams {
  pageNumber: number
  pageSize: number
  period?: string
  customerId?: number
  distributionSubstationId?: number
  feederId?: number
  areaOfficeId?: number
}

// Meter Reading State
interface MeterReadingState {
  // Meter readings list state
  meterReadings: MeterReading[]
  meterReadingsLoading: boolean
  meterReadingsError: string | null
  meterReadingsSuccess: boolean

  // Pagination state
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // General meter reading state
  loading: boolean
  error: string | null
}

// Initial state
const initialState: MeterReadingState = {
  meterReadings: [],
  meterReadingsLoading: false,
  meterReadingsError: null,
  meterReadingsSuccess: false,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  loading: false,
  error: null,
}

// Async thunks
export const fetchMeterReadings = createAsyncThunk(
  "meterReading/fetchMeterReadings",
  async (params: MeterReadingsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, period, customerId, distributionSubstationId, feederId, areaOfficeId } = params

      const response = await api.get<MeterReadingsResponse>(buildApiUrl(API_ENDPOINTS.METER_READINGS.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(period && { Period: period }),
          ...(customerId !== undefined && { CustomerId: customerId }),
          ...(distributionSubstationId !== undefined && { DistributionSubstationId: distributionSubstationId }),
          ...(feederId !== undefined && { FeederId: feederId }),
          ...(areaOfficeId !== undefined && { AreaOfficeId: areaOfficeId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch meter readings")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch meter readings")
      }
      return rejectWithValue(error.message || "Network error during meter readings fetch")
    }
  }
)

// Meter Reading slice
const meterReadingSlice = createSlice({
  name: "meterReading",
  initialState,
  reducers: {
    // Clear meter readings state
    clearMeterReadings: (state) => {
      state.meterReadings = []
      state.meterReadingsError = null
      state.meterReadingsSuccess = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.meterReadingsError = null
    },

    // Reset meter reading state
    resetMeterReadingState: (state) => {
      state.meterReadings = []
      state.meterReadingsLoading = false
      state.meterReadingsError = null
      state.meterReadingsSuccess = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.loading = false
      state.error = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Update meter reading in list (optimistic update)
    updateMeterReadingInList: (state, action: PayloadAction<MeterReading>) => {
      const index = state.meterReadings.findIndex((mr) => mr.id === action.payload.id)
      if (index !== -1) {
        state.meterReadings[index] = action.payload
      }
    },

    // Remove meter reading from list
    removeMeterReadingFromList: (state, action: PayloadAction<number>) => {
      state.meterReadings = state.meterReadings.filter((mr) => mr.id !== action.payload)
      state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1)
    },

    // Flag meter reading for review
    flagMeterReadingForReview: (state, action: PayloadAction<{ id: number; isFlagged: boolean }>) => {
      const { id, isFlagged } = action.payload

      // Update in list
      const index = state.meterReadings.findIndex((mr) => mr.id === id)
      const meterReading = state.meterReadings[index]

      if (index !== -1 && meterReading) {
        meterReading.isFlaggedForReview = isFlagged
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch meter readings cases
      .addCase(fetchMeterReadings.pending, (state) => {
        state.meterReadingsLoading = true
        state.meterReadingsError = null
        state.meterReadingsSuccess = false
        state.loading = true
      })
      .addCase(fetchMeterReadings.fulfilled, (state, action: PayloadAction<MeterReadingsResponse>) => {
        state.meterReadingsLoading = false
        state.meterReadingsSuccess = true
        state.loading = false
        state.meterReadings = action.payload.data || []
        state.pagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.meterReadingsError = null
      })
      .addCase(fetchMeterReadings.rejected, (state, action) => {
        state.meterReadingsLoading = false
        state.loading = false
        state.meterReadingsError = (action.payload as string) || "Failed to fetch meter readings"
        state.meterReadingsSuccess = false
        state.meterReadings = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
  },
})

export const {
  clearMeterReadings,
  clearError,
  resetMeterReadingState,
  setPagination,
  updateMeterReadingInList,
  removeMeterReadingFromList,
  flagMeterReadingForReview,
} = meterReadingSlice.actions

export default meterReadingSlice.reducer
