import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Types for collection efficiency parameters
export interface PerformanceAnalyticsParams {
  StartDateUtc: string
  EndDateUtc: string
  AreaOfficeId?: number
  Channel?: string
  CollectorType?: string
}

// Types for collection efficiency response
export interface CollectionEfficiencyData {
  totalBilled: number
  totalCollected: number
  efficiencyPercent: number
  billCount: number
  billsWithPayments: number
}

export interface CollectionEfficiencyResponse {
  isSuccess: boolean
  message: string
  data: CollectionEfficiencyData
}

export interface OutstandingArrearsData {
  totalOutstanding: number
  totalDebits: number
  totalCredits: number
  customersInArrears: number
}

export interface OutstandingArrearsResponse {
  isSuccess: boolean
  message: string
  data: OutstandingArrearsData
}

export interface CollectionByBandSlice {
  label: string
  amount: number
  count: number
  percentage: number
}

export interface CollectionByBandData {
  dimension: number
  slices: CollectionByBandSlice[]
}

export interface CollectionByBandResponse {
  isSuccess: boolean
  message: string
  data: CollectionByBandData
}

export interface CboPerformanceSlice {
  label: string
  amount: number
  count: number
  percentage: number
}

export interface CboPerformanceData {
  dimension: number
  slices: CboPerformanceSlice[]
}

export interface CboPerformanceResponse {
  isSuccess: boolean
  message: string
  data: CboPerformanceData
}

interface PerformanceAnalyticsState {
  // Collection efficiency state
  collectionEfficiencyData: CollectionEfficiencyData | null
  collectionEfficiencyLoading: boolean
  collectionEfficiencyError: string | null
  collectionEfficiencySuccess: boolean
  collectionEfficiencyMessage: string | null

  // Outstanding arrears state
  outstandingArrearsData: OutstandingArrearsData | null
  outstandingArrearsLoading: boolean
  outstandingArrearsError: string | null
  outstandingArrearsSuccess: boolean
  outstandingArrearsMessage: string | null

  // Collection by band state
  collectionByBandData: CollectionByBandData | null
  collectionByBandLoading: boolean
  collectionByBandError: string | null
  collectionByBandSuccess: boolean
  collectionByBandMessage: string | null

  // CBO performance state
  cboPerformanceData: CboPerformanceData | null
  cboPerformanceLoading: boolean
  cboPerformanceError: string | null
  cboPerformanceSuccess: boolean
  cboPerformanceMessage: string | null
}

const initialState: PerformanceAnalyticsState = {
  // Collection efficiency initial state
  collectionEfficiencyData: null,
  collectionEfficiencyLoading: false,
  collectionEfficiencyError: null,
  collectionEfficiencySuccess: false,
  collectionEfficiencyMessage: null,

  // Outstanding arrears initial state
  outstandingArrearsData: null,
  outstandingArrearsLoading: false,
  outstandingArrearsError: null,
  outstandingArrearsSuccess: false,
  outstandingArrearsMessage: null,

  // Collection by band initial state
  collectionByBandData: null,
  collectionByBandLoading: false,
  collectionByBandError: null,
  collectionByBandSuccess: false,
  collectionByBandMessage: null,

  // CBO performance initial state
  cboPerformanceData: null,
  cboPerformanceLoading: false,
  cboPerformanceError: null,
  cboPerformanceSuccess: false,
  cboPerformanceMessage: null,
}

// Async thunk for fetching collection efficiency
export const fetchCollectionEfficiency = createAsyncThunk(
  "performanceAnalytics/fetchCollectionEfficiency",
  async (params: PerformanceAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<CollectionEfficiencyResponse>(
        buildApiUrl(API_ENDPOINTS.PERFORMANCE_ANALYTICS.COLLECTION_EFFICIENCY),
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
        throw new Error(response.data.message || "Failed to fetch collection efficiency")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching outstanding arrears
export const fetchOutstandingArrears = createAsyncThunk(
  "performanceAnalytics/fetchOutstandingArrears",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<OutstandingArrearsResponse>(
        buildApiUrl(API_ENDPOINTS.PERFORMANCE_ANALYTICS.OUTSTANDING_ARREARS)
      )

      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "Failed to fetch outstanding arrears")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching collection by band
export const fetchCollectionByBand = createAsyncThunk(
  "performanceAnalytics/fetchCollectionByBand",
  async (params: PerformanceAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<CollectionByBandResponse>(
        buildApiUrl(API_ENDPOINTS.PERFORMANCE_ANALYTICS.COLLECTION_BY_BAND),
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
        throw new Error(response.data.message || "Failed to fetch collection by band")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching CBO performance
export const fetchCboPerformance = createAsyncThunk(
  "performanceAnalytics/fetchCboPerformance",
  async (params: PerformanceAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<CboPerformanceResponse>(
        buildApiUrl(API_ENDPOINTS.PERFORMANCE_ANALYTICS.CBO_PERFORMANCE),
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
        throw new Error(response.data.message || "Failed to fetch CBO performance")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

const performanceAnalyticsSlice = createSlice({
  name: "performanceAnalytics",
  initialState,
  reducers: {
    clearCollectionEfficiency(state) {
      state.collectionEfficiencyData = null
      state.collectionEfficiencyLoading = false
      state.collectionEfficiencyError = null
      state.collectionEfficiencySuccess = false
      state.collectionEfficiencyMessage = null
    },
    clearOutstandingArrears(state) {
      state.outstandingArrearsData = null
      state.outstandingArrearsLoading = false
      state.outstandingArrearsError = null
      state.outstandingArrearsSuccess = false
      state.outstandingArrearsMessage = null
    },
    clearCollectionByBand(state) {
      state.collectionByBandData = null
      state.collectionByBandLoading = false
      state.collectionByBandError = null
      state.collectionByBandSuccess = false
      state.collectionByBandMessage = null
    },
    clearCboPerformance(state) {
      state.cboPerformanceData = null
      state.cboPerformanceLoading = false
      state.cboPerformanceError = null
      state.cboPerformanceSuccess = false
      state.cboPerformanceMessage = null
    },
    clearError(state) {
      state.collectionEfficiencyError = null
      state.outstandingArrearsError = null
      state.collectionByBandError = null
      state.cboPerformanceError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch collection efficiency
      .addCase(fetchCollectionEfficiency.pending, (state) => {
        state.collectionEfficiencyLoading = true
        state.collectionEfficiencyError = null
        state.collectionEfficiencySuccess = false
        state.collectionEfficiencyMessage = null
      })
      .addCase(fetchCollectionEfficiency.fulfilled, (state, action: PayloadAction<CollectionEfficiencyResponse>) => {
        state.collectionEfficiencyLoading = false
        state.collectionEfficiencySuccess = true
        state.collectionEfficiencyMessage = action.payload.message
        state.collectionEfficiencyData = action.payload.data
      })
      .addCase(fetchCollectionEfficiency.rejected, (state, action) => {
        state.collectionEfficiencyLoading = false
        state.collectionEfficiencyError = action.payload as string
        state.collectionEfficiencySuccess = false
        state.collectionEfficiencyMessage = null
      })
      // Fetch outstanding arrears
      .addCase(fetchOutstandingArrears.pending, (state) => {
        state.outstandingArrearsLoading = true
        state.outstandingArrearsError = null
        state.outstandingArrearsSuccess = false
        state.outstandingArrearsMessage = null
      })
      .addCase(fetchOutstandingArrears.fulfilled, (state, action: PayloadAction<OutstandingArrearsResponse>) => {
        state.outstandingArrearsLoading = false
        state.outstandingArrearsSuccess = true
        state.outstandingArrearsMessage = action.payload.message
        state.outstandingArrearsData = action.payload.data
      })
      .addCase(fetchOutstandingArrears.rejected, (state, action) => {
        state.outstandingArrearsLoading = false
        state.outstandingArrearsError = action.payload as string
        state.outstandingArrearsSuccess = false
        state.outstandingArrearsMessage = null
      })
      // Fetch collection by band
      .addCase(fetchCollectionByBand.pending, (state) => {
        state.collectionByBandLoading = true
        state.collectionByBandError = null
        state.collectionByBandSuccess = false
        state.collectionByBandMessage = null
      })
      .addCase(fetchCollectionByBand.fulfilled, (state, action: PayloadAction<CollectionByBandResponse>) => {
        state.collectionByBandLoading = false
        state.collectionByBandSuccess = true
        state.collectionByBandMessage = action.payload.message
        state.collectionByBandData = action.payload.data
      })
      .addCase(fetchCollectionByBand.rejected, (state, action) => {
        state.collectionByBandLoading = false
        state.collectionByBandError = action.payload as string
        state.collectionByBandSuccess = false
        state.collectionByBandMessage = null
      })
      // Fetch CBO performance
      .addCase(fetchCboPerformance.pending, (state) => {
        state.cboPerformanceLoading = true
        state.cboPerformanceError = null
        state.cboPerformanceSuccess = false
        state.cboPerformanceMessage = null
      })
      .addCase(fetchCboPerformance.fulfilled, (state, action: PayloadAction<CboPerformanceResponse>) => {
        state.cboPerformanceLoading = false
        state.cboPerformanceSuccess = true
        state.cboPerformanceMessage = action.payload.message
        state.cboPerformanceData = action.payload.data
      })
      .addCase(fetchCboPerformance.rejected, (state, action) => {
        state.cboPerformanceLoading = false
        state.cboPerformanceError = action.payload as string
        state.cboPerformanceSuccess = false
        state.cboPerformanceMessage = null
      })
  },
})

export const {
  clearCollectionEfficiency,
  clearOutstandingArrears,
  clearCollectionByBand,
  clearCboPerformance,
  clearError,
} = performanceAnalyticsSlice.actions

export default performanceAnalyticsSlice.reducer
