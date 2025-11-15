// src/lib/redux/feedersSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Feeder
export interface Company {
  id: number
  name: string
  nercCode: string
  nercSupplyStructure: number
}

export interface AreaOffice {
  id: number
  nameOfNewOAreaffice: string
  newKaedcoCode: string
  newNercCode: string
  latitude: number
  longitude: number
  company: Company
}

export interface InjectionSubstation {
  id: number
  nercCode: string
  injectionSubstationCode: string
  areaOffice: AreaOffice
}

export interface HtPole {
  id: number
  htPoleNumber: string
}

export interface Feeder {
  id: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
  injectionSubstation: InjectionSubstation
  htPole: HtPole
}

export interface FeedersResponse {
  isSuccess: boolean
  message: string
  data: Feeder[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface FeedersRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Feeder State
interface FeederState {
  // Feeders list state
  feeders: Feeder[]
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

  // Current feeder state (for viewing/editing)
  currentFeeder: Feeder | null
  currentFeederLoading: boolean
  currentFeederError: string | null
}

// Initial state
const initialState: FeederState = {
  feeders: [],
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
  currentFeeder: null,
  currentFeederLoading: false,
  currentFeederError: null,
}

// Async thunks
export const fetchFeeders = createAsyncThunk(
  "feeders/fetchFeeders",
  async (params: FeedersRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        search,
        companyId,
        areaOfficeId,
        injectionSubstationId,
        feederId,
        serviceCenterId,
      } = params

      const response = await api.get<FeedersResponse>(buildApiUrl(API_ENDPOINTS.FEEDERS.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(search && { Search: search }),
          ...(companyId && { CompanyId: companyId }),
          ...(areaOfficeId && { AreaOfficeId: areaOfficeId }),
          ...(injectionSubstationId && { InjectionSubstationId: injectionSubstationId }),
          ...(feederId && { FeederId: feederId }),
          ...(serviceCenterId && { ServiceCenterId: serviceCenterId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch feeders")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch feeders")
      }
      return rejectWithValue(error.message || "Network error during feeders fetch")
    }
  }
)

export const fetchFeederById = createAsyncThunk<Feeder, number, { rejectValue: string }>(
  "feeders/fetchFeederById",
  async (feederId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<FeedersResponse>(`${buildApiUrl(API_ENDPOINTS.FEEDERS.GET)}/${feederId}`)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch feeder")
      }

      const feeder = response.data.data?.[0]
      if (!feeder) {
        return rejectWithValue("Feeder not found")
      }

      return feeder
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch feeder")
      }
      return rejectWithValue(error.message || "Network error during feeder fetch")
    }
  }
)

// Feeder slice
const feedersSlice = createSlice({
  name: "feeders",
  initialState,
  reducers: {
    // Clear feeders state
    clearFeeders: (state) => {
      state.feeders = []
      state.error = null
      state.success = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear errors
    clearError: (state) => {
      state.error = null
      state.currentFeederError = null
    },

    // Clear current feeder
    clearCurrentFeeder: (state) => {
      state.currentFeeder = null
      state.currentFeederError = null
    },

    // Reset feeder state
    resetFeederState: (state) => {
      state.feeders = []
      state.loading = false
      state.error = null
      state.success = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.currentFeeder = null
      state.currentFeederLoading = false
      state.currentFeederError = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set current feeder (for forms, etc.)
    setCurrentFeeder: (state, action: PayloadAction<Feeder | null>) => {
      state.currentFeeder = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feeders cases
      .addCase(fetchFeeders.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchFeeders.fulfilled, (state, action: PayloadAction<FeedersResponse>) => {
        state.loading = false
        state.success = true
        state.feeders = action.payload.data
        state.pagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
        state.error = null
      })
      .addCase(fetchFeeders.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch feeders"
        state.success = false
        state.feeders = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch feeder by ID cases
      .addCase(fetchFeederById.pending, (state) => {
        state.currentFeederLoading = true
        state.currentFeederError = null
      })
      .addCase(fetchFeederById.fulfilled, (state, action: PayloadAction<Feeder>) => {
        state.currentFeederLoading = false
        state.currentFeeder = action.payload
        state.currentFeederError = null
      })
      .addCase(fetchFeederById.rejected, (state, action) => {
        state.currentFeederLoading = false
        state.currentFeederError = (action.payload as string) || "Failed to fetch feeder"
        state.currentFeeder = null
      })
  },
})

export const { clearFeeders, clearError, clearCurrentFeeder, resetFeederState, setPagination, setCurrentFeeder } =
  feedersSlice.actions

export default feedersSlice.reducer
