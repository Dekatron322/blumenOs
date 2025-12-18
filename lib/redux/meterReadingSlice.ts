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

export interface MeterReadingResponse {
  isSuccess: boolean
  message: string
  data: MeterReading
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
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Create Meter Reading Request Interface
export interface CreateMeterReadingRequest {
  customerId: number
  period: string
  previousReadingKwh: number
  presentReadingKwh: number
  notes: string
}

// Meter Reading State
interface MeterReadingState {
  // Meter readings list state
  meterReadings: MeterReading[]
  meterReadingsLoading: boolean
  meterReadingsError: string | null
  meterReadingsSuccess: boolean

  // Single meter reading state
  currentMeterReading: MeterReading | null
  currentMeterReadingLoading: boolean
  currentMeterReadingError: string | null
  currentMeterReadingSuccess: boolean

  // Create meter reading state
  createMeterReadingLoading: boolean
  createMeterReadingError: string | null
  createMeterReadingSuccess: boolean
  createdMeterReading: MeterReading | null

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
  currentMeterReading: null,
  currentMeterReadingLoading: false,
  currentMeterReadingError: null,
  currentMeterReadingSuccess: false,
  createMeterReadingLoading: false,
  createMeterReadingError: null,
  createMeterReadingSuccess: false,
  createdMeterReading: null,
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
      const {
        pageNumber,
        pageSize,
        period,
        customerId,
        distributionSubstationId,
        feederId,
        areaOfficeId,
        sortBy,
        sortOrder,
      } = params

      const response = await api.get<MeterReadingsResponse>(buildApiUrl(API_ENDPOINTS.METER_READINGS.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(period && { Period: period }),
          ...(customerId !== undefined && { CustomerId: customerId }),
          ...(distributionSubstationId !== undefined && { DistributionSubstationId: distributionSubstationId }),
          ...(feederId !== undefined && { FeederId: feederId }),
          ...(areaOfficeId !== undefined && { AreaOfficeId: areaOfficeId }),
          ...(sortBy && { SortBy: sortBy }),
          ...(sortOrder && { SortOrder: sortOrder }),
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

export const fetchMeterReadingById = createAsyncThunk(
  "meterReading/fetchMeterReadingById",
  async (id: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METER_READINGS.GET_BY_ID.replace("{id}", id.toString())
      const response = await api.get<MeterReadingResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch meter reading")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch meter reading")
      }
      return rejectWithValue(error.message || "Network error during meter reading fetch")
    }
  }
)

export const createMeterReading = createAsyncThunk(
  "meterReading/createMeterReading",
  async (meterReadingData: CreateMeterReadingRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<MeterReadingResponse>(
        buildApiUrl(API_ENDPOINTS.METER_READINGS.ADD),
        meterReadingData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create meter reading")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create meter reading")
      }
      return rejectWithValue(error.message || "Network error during meter reading creation")
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

    // Clear current meter reading state
    clearCurrentMeterReading: (state) => {
      state.currentMeterReading = null
      state.currentMeterReadingError = null
      state.currentMeterReadingSuccess = false
      state.currentMeterReadingLoading = false
    },

    // Clear create meter reading state
    clearCreateMeterReading: (state) => {
      state.createMeterReadingLoading = false
      state.createMeterReadingError = null
      state.createMeterReadingSuccess = false
      state.createdMeterReading = null
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.meterReadingsError = null
      state.currentMeterReadingError = null
      state.createMeterReadingError = null
    },

    // Reset meter reading state
    resetMeterReadingState: (state) => {
      state.meterReadings = []
      state.meterReadingsLoading = false
      state.meterReadingsError = null
      state.meterReadingsSuccess = false
      state.currentMeterReading = null
      state.currentMeterReadingLoading = false
      state.currentMeterReadingError = null
      state.currentMeterReadingSuccess = false
      state.createMeterReadingLoading = false
      state.createMeterReadingError = null
      state.createMeterReadingSuccess = false
      state.createdMeterReading = null
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

      // Also update current meter reading if it's the same one
      if (state.currentMeterReading && state.currentMeterReading.id === action.payload.id) {
        state.currentMeterReading = action.payload
      }
    },

    // Add meter reading to list (optimistic update)
    addMeterReadingToList: (state, action: PayloadAction<MeterReading>) => {
      state.meterReadings.unshift(action.payload)
      state.pagination.totalCount += 1
      state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)
    },

    // Remove meter reading from list
    removeMeterReadingFromList: (state, action: PayloadAction<number>) => {
      state.meterReadings = state.meterReadings.filter((mr) => mr.id !== action.payload)
      state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1)
      state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)

      // Clear current meter reading if it's the same one
      if (state.currentMeterReading && state.currentMeterReading.id === action.payload) {
        state.currentMeterReading = null
      }
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

      // Update current meter reading if it's the same one
      if (state.currentMeterReading && state.currentMeterReading.id === id) {
        state.currentMeterReading.isFlaggedForReview = isFlagged
      }

      // Update created meter reading if it's the same one
      if (state.createdMeterReading && state.createdMeterReading.id === id) {
        state.createdMeterReading.isFlaggedForReview = isFlagged
      }
    },

    // Set current meter reading (for optimistic updates)
    setCurrentMeterReading: (state, action: PayloadAction<MeterReading>) => {
      state.currentMeterReading = action.payload
      state.currentMeterReadingSuccess = true
      state.currentMeterReadingError = null
    },

    // Set created meter reading (for optimistic updates)
    setCreatedMeterReading: (state, action: PayloadAction<MeterReading>) => {
      state.createdMeterReading = action.payload
      state.createMeterReadingSuccess = true
      state.createMeterReadingError = null
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

      // Fetch meter reading by ID cases
      .addCase(fetchMeterReadingById.pending, (state) => {
        state.currentMeterReadingLoading = true
        state.currentMeterReadingError = null
        state.currentMeterReadingSuccess = false
        state.loading = true
      })
      .addCase(fetchMeterReadingById.fulfilled, (state, action: PayloadAction<MeterReadingResponse>) => {
        state.currentMeterReadingLoading = false
        state.currentMeterReadingSuccess = true
        state.loading = false
        state.currentMeterReading = action.payload.data || null
        state.currentMeterReadingError = null
      })
      .addCase(fetchMeterReadingById.rejected, (state, action) => {
        state.currentMeterReadingLoading = false
        state.loading = false
        state.currentMeterReadingError = (action.payload as string) || "Failed to fetch meter reading"
        state.currentMeterReadingSuccess = false
        state.currentMeterReading = null
      })

      // Create meter reading cases
      .addCase(createMeterReading.pending, (state) => {
        state.createMeterReadingLoading = true
        state.createMeterReadingError = null
        state.createMeterReadingSuccess = false
        state.loading = true
      })
      .addCase(createMeterReading.fulfilled, (state, action: PayloadAction<MeterReadingResponse>) => {
        state.createMeterReadingLoading = false
        state.createMeterReadingSuccess = true
        state.loading = false
        state.createdMeterReading = action.payload.data || null

        // Add the new meter reading to the beginning of the list
        if (action.payload.data) {
          state.meterReadings.unshift(action.payload.data)
          state.pagination.totalCount += 1
          state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)
        }

        state.createMeterReadingError = null
      })
      .addCase(createMeterReading.rejected, (state, action) => {
        state.createMeterReadingLoading = false
        state.loading = false
        state.createMeterReadingError = (action.payload as string) || "Failed to create meter reading"
        state.createMeterReadingSuccess = false
        state.createdMeterReading = null
      })
  },
})

export const {
  clearMeterReadings,
  clearCurrentMeterReading,
  clearCreateMeterReading,
  clearError,
  resetMeterReadingState,
  setPagination,
  updateMeterReadingInList,
  addMeterReadingToList,
  removeMeterReadingFromList,
  flagMeterReadingForReview,
  setCurrentMeterReading,
  setCreatedMeterReading,
} = meterReadingSlice.actions

export default meterReadingSlice.reducer
