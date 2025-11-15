// src/lib/redux/injectionSubstationSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for InjectionSubstation
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

export interface InjectionSubstationsResponse {
  isSuccess: boolean
  message: string
  data: InjectionSubstation[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface InjectionSubstationsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// InjectionSubstation State
interface InjectionSubstationState {
  // InjectionSubstations list state
  injectionSubstations: InjectionSubstation[]
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

  // Current injectionSubstation state (for viewing/editing)
  currentInjectionSubstation: InjectionSubstation | null
  currentInjectionSubstationLoading: boolean
  currentInjectionSubstationError: string | null
}

// Initial state
const initialState: InjectionSubstationState = {
  injectionSubstations: [],
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
  currentInjectionSubstation: null,
  currentInjectionSubstationLoading: false,
  currentInjectionSubstationError: null,
}

// Async thunks
export const fetchInjectionSubstations = createAsyncThunk(
  "injectionSubstations/fetchInjectionSubstations",
  async (params: InjectionSubstationsRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<InjectionSubstationsResponse>(
        buildApiUrl(API_ENDPOINTS.INJECTION_SUBSTATION.GET),
        {
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
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch injection substations")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch injection substations")
      }
      return rejectWithValue(error.message || "Network error during injection substations fetch")
    }
  }
)

export const fetchInjectionSubstationById = createAsyncThunk<InjectionSubstation, number, { rejectValue: string }>(
  "injectionSubstations/fetchInjectionSubstationById",
  async (injectionSubstationId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<InjectionSubstationsResponse>(
        `${buildApiUrl(API_ENDPOINTS.INJECTION_SUBSTATION.GET)}/${injectionSubstationId}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch injection substation")
      }

      const injectionSubstation = response.data.data?.[0]
      if (!injectionSubstation) {
        return rejectWithValue("Injection substation not found")
      }

      return injectionSubstation
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch injection substation")
      }
      return rejectWithValue(error.message || "Network error during injection substation fetch")
    }
  }
)

// InjectionSubstation slice
const injectionSubstationSlice = createSlice({
  name: "injectionSubstations",
  initialState,
  reducers: {
    // Clear injectionSubstations state
    clearInjectionSubstations: (state) => {
      state.injectionSubstations = []
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
      state.currentInjectionSubstationError = null
    },

    // Clear current injectionSubstation
    clearCurrentInjectionSubstation: (state) => {
      state.currentInjectionSubstation = null
      state.currentInjectionSubstationError = null
    },

    // Reset injectionSubstation state
    resetInjectionSubstationState: (state) => {
      state.injectionSubstations = []
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
      state.currentInjectionSubstation = null
      state.currentInjectionSubstationLoading = false
      state.currentInjectionSubstationError = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set current injection substation (for forms, etc.)
    setCurrentInjectionSubstation: (state, action: PayloadAction<InjectionSubstation | null>) => {
      state.currentInjectionSubstation = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch injectionSubstations cases
      .addCase(fetchInjectionSubstations.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchInjectionSubstations.fulfilled, (state, action: PayloadAction<InjectionSubstationsResponse>) => {
        state.loading = false
        state.success = true
        state.injectionSubstations = action.payload.data
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
      .addCase(fetchInjectionSubstations.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch injection substations"
        state.success = false
        state.injectionSubstations = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch injectionSubstation by ID cases
      .addCase(fetchInjectionSubstationById.pending, (state) => {
        state.currentInjectionSubstationLoading = true
        state.currentInjectionSubstationError = null
      })
      .addCase(fetchInjectionSubstationById.fulfilled, (state, action: PayloadAction<InjectionSubstation>) => {
        state.currentInjectionSubstationLoading = false
        state.currentInjectionSubstation = action.payload
        state.currentInjectionSubstationError = null
      })
      .addCase(fetchInjectionSubstationById.rejected, (state, action) => {
        state.currentInjectionSubstationLoading = false
        state.currentInjectionSubstationError = (action.payload as string) || "Failed to fetch injection substation"
        state.currentInjectionSubstation = null
      })
  },
})

export const {
  clearInjectionSubstations,
  clearError,
  clearCurrentInjectionSubstation,
  resetInjectionSubstationState,
  setPagination,
  setCurrentInjectionSubstation,
} = injectionSubstationSlice.actions

export default injectionSubstationSlice.reducer
