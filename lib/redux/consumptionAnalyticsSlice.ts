// src/lib/redux/consumptionAnalyticsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Types for the consumption analytics API
export interface ConsumptionAnalyticsParams {
  StartDateUtc: string
  EndDateUtc: string
  AreaOfficeId?: number
  Channel?: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque"
  CollectorType?: "Customer" | "SalesRep" | "Vendor" | "Staff"
}

export interface EnergyBalancePoint {
  periodStart: string
  feederId: number
  feederName: string
  energyDeliveredKwh: number
  energyBilledKwh: number
}

export interface ConsumptionAnalyticsData {
  points: EnergyBalancePoint[]
}

export interface PostpaidTrendPoint {
  periodStart: string
  energyDeliveredKwh: number
  energyBilledKwh: number
}

export interface PostpaidTrendData {
  points: PostpaidTrendPoint[]
}

export interface ConsumptionAnalyticsResponse {
  isSuccess: boolean
  message: string
  data: ConsumptionAnalyticsData
}

export interface PostpaidTrendResponse {
  isSuccess: boolean
  message: string
  data: PostpaidTrendData
}

export interface PrepaidVendsPoint {
  bucketDate: string
  vendCount: number
  tokenCount: number
  totalKwh: number
  totalAmount: number
}

export interface PrepaidVendsData {
  points: PrepaidVendsPoint[]
}

export interface PrepaidVendsResponse {
  isSuccess: boolean
  message: string
  data: PrepaidVendsData
}

export interface PrepaidTokensPoint {
  bucketDate: string
  totalTokens: number
  keyChangeTokens: number
  clearTamperTokens: number
  clearCreditTokens: number
}

export interface PrepaidTokensData {
  points: PrepaidTokensPoint[]
}

export interface PrepaidTokensResponse {
  isSuccess: boolean
  message: string
  data: PrepaidTokensData
}

export interface NewConnectionsPoint {
  bucketDate: string
  count: number
}

export interface NewConnectionsData {
  totalConnections: number
  points: NewConnectionsPoint[]
}

export interface NewConnectionsResponse {
  isSuccess: boolean
  message: string
  data: NewConnectionsData
}

export interface MetersProgrammedPoint {
  bucketDate: string
  programmedCount: number
  distinctMeters: number
}

export interface MetersProgrammedData {
  points: MetersProgrammedPoint[]
}

export interface MetersProgrammedResponse {
  isSuccess: boolean
  message: string
  data: MetersProgrammedData
}

interface ConsumptionAnalyticsState {
  // Energy balance state
  data: EnergyBalancePoint[]
  loading: boolean
  error: string | null
  isSuccess: boolean
  message: string | null

  // Postpaid trend state
  postpaidTrendData: PostpaidTrendPoint[]
  postpaidTrendLoading: boolean
  postpaidTrendError: string | null
  postpaidTrendSuccess: boolean
  postpaidTrendMessage: string | null

  // Prepaid vends state
  prepaidVendsData: PrepaidVendsPoint[]
  prepaidVendsLoading: boolean
  prepaidVendsError: string | null
  prepaidVendsSuccess: boolean
  prepaidVendsMessage: string | null

  // Prepaid tokens state
  prepaidTokensData: PrepaidTokensPoint[]
  prepaidTokensLoading: boolean
  prepaidTokensError: string | null
  prepaidTokensSuccess: boolean
  prepaidTokensMessage: string | null

  // New connections state
  newConnectionsData: NewConnectionsData
  newConnectionsLoading: boolean
  newConnectionsError: string | null
  newConnectionsSuccess: boolean
  newConnectionsMessage: string | null

  // Meters programmed state
  metersProgrammedData: MetersProgrammedPoint[]
  metersProgrammedLoading: boolean
  metersProgrammedError: string | null
  metersProgrammedSuccess: boolean
  metersProgrammedMessage: string | null
}

const initialState: ConsumptionAnalyticsState = {
  // Energy balance initial state
  data: [],
  loading: false,
  error: null,
  isSuccess: false,
  message: null,

  // Postpaid trend initial state
  postpaidTrendData: [],
  postpaidTrendLoading: false,
  postpaidTrendError: null,
  postpaidTrendSuccess: false,
  postpaidTrendMessage: null,

  // Prepaid vends initial state
  prepaidVendsData: [],
  prepaidVendsLoading: false,
  prepaidVendsError: null,
  prepaidVendsSuccess: false,
  prepaidVendsMessage: null,

  // Prepaid tokens initial state
  prepaidTokensData: [],
  prepaidTokensLoading: false,
  prepaidTokensError: null,
  prepaidTokensSuccess: false,
  prepaidTokensMessage: null,

  // New connections initial state
  newConnectionsData: { totalConnections: 0, points: [] },
  newConnectionsLoading: false,
  newConnectionsError: null,
  newConnectionsSuccess: false,
  newConnectionsMessage: null,

  // Meters programmed initial state
  metersProgrammedData: [],
  metersProgrammedLoading: false,
  metersProgrammedError: null,
  metersProgrammedSuccess: false,
  metersProgrammedMessage: null,
}

// Async thunk for fetching consumption analytics (energy balance)
export const fetchConsumptionAnalytics = createAsyncThunk(
  "consumptionAnalytics/fetchConsumptionAnalytics",
  async (params: ConsumptionAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<ConsumptionAnalyticsResponse>(
        buildApiUrl(API_ENDPOINTS.CONSUMPTION_ANALYTICS.ENERGY_BALANCE),
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
        throw new Error(response.data.message || "Failed to fetch consumption analytics")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching postpaid trend
export const fetchPostpaidTrend = createAsyncThunk(
  "consumptionAnalytics/fetchPostpaidTrend",
  async (params: ConsumptionAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<PostpaidTrendResponse>(
        buildApiUrl(API_ENDPOINTS.CONSUMPTION_ANALYTICS.POSTPAID_TREND),
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
        throw new Error(response.data.message || "Failed to fetch postpaid trend")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching prepaid vends
export const fetchPrepaidVends = createAsyncThunk(
  "consumptionAnalytics/fetchPrepaidVends",
  async (params: ConsumptionAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<PrepaidVendsResponse>(
        buildApiUrl(API_ENDPOINTS.CONSUMPTION_ANALYTICS.PREPAID_VENDS),
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
        throw new Error(response.data.message || "Failed to fetch prepaid vends")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching prepaid tokens
export const fetchPrepaidTokens = createAsyncThunk(
  "consumptionAnalytics/fetchPrepaidTokens",
  async (params: ConsumptionAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<PrepaidTokensResponse>(
        buildApiUrl(API_ENDPOINTS.CONSUMPTION_ANALYTICS.PREPAID_TOKENS),
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
        throw new Error(response.data.message || "Failed to fetch prepaid tokens")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching new connections
export const fetchNewConnections = createAsyncThunk(
  "consumptionAnalytics/fetchNewConnections",
  async (params: ConsumptionAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<NewConnectionsResponse>(
        buildApiUrl(API_ENDPOINTS.CONSUMPTION_ANALYTICS.NEW_CONNECTIONS),
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
        throw new Error(response.data.message || "Failed to fetch new connections")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

// Async thunk for fetching meters programmed
export const fetchMetersProgrammed = createAsyncThunk(
  "consumptionAnalytics/fetchMetersProgrammed",
  async (params: ConsumptionAnalyticsParams, { rejectWithValue }) => {
    try {
      const response = await api.get<MetersProgrammedResponse>(
        buildApiUrl(API_ENDPOINTS.CONSUMPTION_ANALYTICS.METERS_PROGRAMMED),
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
        throw new Error(response.data.message || "Failed to fetch meters programmed")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }
)

const consumptionAnalyticsSlice = createSlice({
  name: "consumptionAnalytics",
  initialState,
  reducers: {
    clearConsumptionAnalytics(state) {
      state.data = []
      state.loading = false
      state.error = null
      state.isSuccess = false
      state.message = null
    },
    clearPostpaidTrend(state) {
      state.postpaidTrendData = []
      state.postpaidTrendLoading = false
      state.postpaidTrendError = null
      state.postpaidTrendSuccess = false
      state.postpaidTrendMessage = null
    },
    clearPrepaidVends(state) {
      state.prepaidVendsData = []
      state.prepaidVendsLoading = false
      state.prepaidVendsError = null
      state.prepaidVendsSuccess = false
      state.prepaidVendsMessage = null
    },
    clearPrepaidTokens(state) {
      state.prepaidTokensData = []
      state.prepaidTokensLoading = false
      state.prepaidTokensError = null
      state.prepaidTokensSuccess = false
      state.prepaidTokensMessage = null
    },
    clearNewConnections(state) {
      state.newConnectionsData = { totalConnections: 0, points: [] }
      state.newConnectionsLoading = false
      state.newConnectionsError = null
      state.newConnectionsSuccess = false
      state.newConnectionsMessage = null
    },
    clearMetersProgrammed(state) {
      state.metersProgrammedData = []
      state.metersProgrammedLoading = false
      state.metersProgrammedError = null
      state.metersProgrammedSuccess = false
      state.metersProgrammedMessage = null
    },
    clearError(state) {
      state.error = null
      state.postpaidTrendError = null
      state.prepaidVendsError = null
      state.prepaidTokensError = null
      state.newConnectionsError = null
      state.metersProgrammedError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch consumption analytics (energy balance)
      .addCase(fetchConsumptionAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
        state.isSuccess = false
        state.message = null
      })
      .addCase(fetchConsumptionAnalytics.fulfilled, (state, action: PayloadAction<ConsumptionAnalyticsResponse>) => {
        state.loading = false
        state.isSuccess = true
        state.message = action.payload.message
        state.data = action.payload.data.points
      })
      .addCase(fetchConsumptionAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isSuccess = false
        state.message = null
      })
      // Fetch postpaid trend
      .addCase(fetchPostpaidTrend.pending, (state) => {
        state.postpaidTrendLoading = true
        state.postpaidTrendError = null
        state.postpaidTrendSuccess = false
        state.postpaidTrendMessage = null
      })
      .addCase(fetchPostpaidTrend.fulfilled, (state, action: PayloadAction<PostpaidTrendResponse>) => {
        state.postpaidTrendLoading = false
        state.postpaidTrendSuccess = true
        state.postpaidTrendMessage = action.payload.message
        state.postpaidTrendData = action.payload.data.points
      })
      .addCase(fetchPostpaidTrend.rejected, (state, action) => {
        state.postpaidTrendLoading = false
        state.postpaidTrendError = action.payload as string
        state.postpaidTrendSuccess = false
        state.postpaidTrendMessage = null
      })
      // Fetch prepaid vends
      .addCase(fetchPrepaidVends.pending, (state) => {
        state.prepaidVendsLoading = true
        state.prepaidVendsError = null
        state.prepaidVendsSuccess = false
        state.prepaidVendsMessage = null
      })
      .addCase(fetchPrepaidVends.fulfilled, (state, action: PayloadAction<PrepaidVendsResponse>) => {
        state.prepaidVendsLoading = false
        state.prepaidVendsSuccess = true
        state.prepaidVendsMessage = action.payload.message
        state.prepaidVendsData = action.payload.data.points
      })
      .addCase(fetchPrepaidVends.rejected, (state, action) => {
        state.prepaidVendsLoading = false
        state.prepaidVendsError = action.payload as string
        state.prepaidVendsSuccess = false
        state.prepaidVendsMessage = null
      })
      // Fetch prepaid tokens
      .addCase(fetchPrepaidTokens.pending, (state) => {
        state.prepaidTokensLoading = true
        state.prepaidTokensError = null
        state.prepaidTokensSuccess = false
        state.prepaidTokensMessage = null
      })
      .addCase(fetchPrepaidTokens.fulfilled, (state, action: PayloadAction<PrepaidTokensResponse>) => {
        state.prepaidTokensLoading = false
        state.prepaidTokensSuccess = true
        state.prepaidTokensMessage = action.payload.message
        state.prepaidTokensData = action.payload.data.points
      })
      .addCase(fetchPrepaidTokens.rejected, (state, action) => {
        state.prepaidTokensLoading = false
        state.prepaidTokensError = action.payload as string
        state.prepaidTokensSuccess = false
        state.prepaidTokensMessage = null
      })
      // Fetch new connections
      .addCase(fetchNewConnections.pending, (state) => {
        state.newConnectionsLoading = true
        state.newConnectionsError = null
        state.newConnectionsSuccess = false
        state.newConnectionsMessage = null
      })
      .addCase(fetchNewConnections.fulfilled, (state, action: PayloadAction<NewConnectionsResponse>) => {
        state.newConnectionsLoading = false
        state.newConnectionsSuccess = true
        state.newConnectionsMessage = action.payload.message
        state.newConnectionsData = action.payload.data
      })
      .addCase(fetchNewConnections.rejected, (state, action) => {
        state.newConnectionsLoading = false
        state.newConnectionsError = action.payload as string
        state.newConnectionsSuccess = false
        state.newConnectionsMessage = null
      })
      // Fetch meters programmed
      .addCase(fetchMetersProgrammed.pending, (state) => {
        state.metersProgrammedLoading = true
        state.metersProgrammedError = null
        state.metersProgrammedSuccess = false
        state.metersProgrammedMessage = null
      })
      .addCase(fetchMetersProgrammed.fulfilled, (state, action: PayloadAction<MetersProgrammedResponse>) => {
        state.metersProgrammedLoading = false
        state.metersProgrammedSuccess = true
        state.metersProgrammedMessage = action.payload.message
        state.metersProgrammedData = action.payload.data.points
      })
      .addCase(fetchMetersProgrammed.rejected, (state, action) => {
        state.metersProgrammedLoading = false
        state.metersProgrammedError = action.payload as string
        state.metersProgrammedSuccess = false
        state.metersProgrammedMessage = null
      })
  },
})

export const {
  clearConsumptionAnalytics,
  clearPostpaidTrend,
  clearPrepaidVends,
  clearPrepaidTokens,
  clearNewConnections,
  clearMetersProgrammed,
  clearError,
} = consumptionAnalyticsSlice.actions

export default consumptionAnalyticsSlice.reducer
