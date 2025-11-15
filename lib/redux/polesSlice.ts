// src/lib/redux/polesSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Pole
export interface Pole {
  id: number
  htPoleNumber: string
}

export interface PolesResponse {
  isSuccess: boolean
  message: string
  data: Pole[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PolesRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Pole State
interface PoleState {
  // Poles list state
  poles: Pole[]
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

  // Current pole state (for viewing/editing)
  currentPole: Pole | null
  currentPoleLoading: boolean
  currentPoleError: string | null
}

// Initial state
const initialState: PoleState = {
  poles: [],
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
  currentPole: null,
  currentPoleLoading: false,
  currentPoleError: null,
}

// Async thunks
export const fetchPoles = createAsyncThunk(
  "poles/fetchPoles",
  async (params: PolesRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<PolesResponse>(buildApiUrl(API_ENDPOINTS.HT_POLE.GET), {
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
        return rejectWithValue(response.data.message || "Failed to fetch poles")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch poles")
      }
      return rejectWithValue(error.message || "Network error during poles fetch")
    }
  }
)

export const fetchPoleById = createAsyncThunk<Pole, number, { rejectValue: string }>(
  "poles/fetchPoleById",
  async (poleId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<PolesResponse>(`${buildApiUrl(API_ENDPOINTS.HT_POLE.GET)}/${poleId}`)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch pole")
      }

      const pole = response.data.data?.[0]
      if (!pole) {
        return rejectWithValue("Pole not found")
      }

      return pole
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch pole")
      }
      return rejectWithValue(error.message || "Network error during pole fetch")
    }
  }
)

// Pole slice
const polesSlice = createSlice({
  name: "poles",
  initialState,
  reducers: {
    // Clear poles state
    clearPoles: (state) => {
      state.poles = []
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
      state.currentPoleError = null
    },

    // Clear current pole
    clearCurrentPole: (state) => {
      state.currentPole = null
      state.currentPoleError = null
    },

    // Reset pole state
    resetPoleState: (state) => {
      state.poles = []
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
      state.currentPole = null
      state.currentPoleLoading = false
      state.currentPoleError = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set current pole (for forms, etc.)
    setCurrentPole: (state, action: PayloadAction<Pole | null>) => {
      state.currentPole = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch poles cases
      .addCase(fetchPoles.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchPoles.fulfilled, (state, action: PayloadAction<PolesResponse>) => {
        state.loading = false
        state.success = true
        state.poles = action.payload.data
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
      .addCase(fetchPoles.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch poles"
        state.success = false
        state.poles = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch pole by ID cases
      .addCase(fetchPoleById.pending, (state) => {
        state.currentPoleLoading = true
        state.currentPoleError = null
      })
      .addCase(fetchPoleById.fulfilled, (state, action: PayloadAction<Pole>) => {
        state.currentPoleLoading = false
        state.currentPole = action.payload
        state.currentPoleError = null
      })
      .addCase(fetchPoleById.rejected, (state, action) => {
        state.currentPoleLoading = false
        state.currentPoleError = (action.payload as string) || "Failed to fetch pole"
        state.currentPole = null
      })
  },
})

export const { clearPoles, clearError, clearCurrentPole, resetPoleState, setPagination, setCurrentPole } =
  polesSlice.actions

export default polesSlice.reducer
