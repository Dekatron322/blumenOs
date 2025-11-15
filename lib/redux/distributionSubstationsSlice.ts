// src/lib/redux/distributionSubstationsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for DistributionSubstation
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

export interface DistributionSubstation {
  id: number
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  status: string
  feeder: Feeder
}

export interface DistributionSubstationsResponse {
  isSuccess: boolean
  message: string
  data: DistributionSubstation[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface DistributionSubstationsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// DistributionSubstation State
interface DistributionSubstationState {
  // DistributionSubstations list state
  distributionSubstations: DistributionSubstation[]
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

  // Current distributionSubstation state (for viewing/editing)
  currentDistributionSubstation: DistributionSubstation | null
  currentDistributionSubstationLoading: boolean
  currentDistributionSubstationError: string | null
}

// Initial state
const initialState: DistributionSubstationState = {
  distributionSubstations: [],
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
  currentDistributionSubstation: null,
  currentDistributionSubstationLoading: false,
  currentDistributionSubstationError: null,
}

// Async thunks
export const fetchDistributionSubstations = createAsyncThunk(
  "distributionSubstations/fetchDistributionSubstations",
  async (params: DistributionSubstationsRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<DistributionSubstationsResponse>(
        buildApiUrl(API_ENDPOINTS.DISTRIBUTION_STATION.GET),
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
        return rejectWithValue(response.data.message || "Failed to fetch distribution substations")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch distribution substations")
      }
      return rejectWithValue(error.message || "Network error during distribution substations fetch")
    }
  }
)

export const fetchDistributionSubstationById = createAsyncThunk<
  DistributionSubstation,
  number,
  { rejectValue: string }
>(
  "distributionSubstations/fetchDistributionSubstationById",
  async (distributionSubstationId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<DistributionSubstationsResponse>(
        `${buildApiUrl(API_ENDPOINTS.DISTRIBUTION_STATION.GET)}/${distributionSubstationId}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch distribution substation")
      }

      const distributionSubstation = response.data.data?.[0]
      if (!distributionSubstation) {
        return rejectWithValue("Distribution substation not found")
      }

      return distributionSubstation
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch distribution substation")
      }
      return rejectWithValue(error.message || "Network error during distribution substation fetch")
    }
  }
)

// DistributionSubstation slice
const distributionSubstationSlice = createSlice({
  name: "distributionSubstations",
  initialState,
  reducers: {
    // Clear distributionSubstations state
    clearDistributionSubstations: (state) => {
      state.distributionSubstations = []
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
      state.currentDistributionSubstationError = null
    },

    // Clear current distributionSubstation
    clearCurrentDistributionSubstation: (state) => {
      state.currentDistributionSubstation = null
      state.currentDistributionSubstationError = null
    },

    // Reset distributionSubstation state
    resetDistributionSubstationState: (state) => {
      state.distributionSubstations = []
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
      state.currentDistributionSubstation = null
      state.currentDistributionSubstationLoading = false
      state.currentDistributionSubstationError = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set current distribution substation (for forms, etc.)
    setCurrentDistributionSubstation: (state, action: PayloadAction<DistributionSubstation | null>) => {
      state.currentDistributionSubstation = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch distributionSubstations cases
      .addCase(fetchDistributionSubstations.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(
        fetchDistributionSubstations.fulfilled,
        (state, action: PayloadAction<DistributionSubstationsResponse>) => {
          state.loading = false
          state.success = true
          state.distributionSubstations = action.payload.data
          state.pagination = {
            totalCount: action.payload.totalCount,
            totalPages: action.payload.totalPages,
            currentPage: action.payload.currentPage,
            pageSize: action.payload.pageSize,
            hasNext: action.payload.hasNext,
            hasPrevious: action.payload.hasPrevious,
          }
          state.error = null
        }
      )
      .addCase(fetchDistributionSubstations.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch distribution substations"
        state.success = false
        state.distributionSubstations = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch distributionSubstation by ID cases
      .addCase(fetchDistributionSubstationById.pending, (state) => {
        state.currentDistributionSubstationLoading = true
        state.currentDistributionSubstationError = null
      })
      .addCase(fetchDistributionSubstationById.fulfilled, (state, action: PayloadAction<DistributionSubstation>) => {
        state.currentDistributionSubstationLoading = false
        state.currentDistributionSubstation = action.payload
        state.currentDistributionSubstationError = null
      })
      .addCase(fetchDistributionSubstationById.rejected, (state, action) => {
        state.currentDistributionSubstationLoading = false
        state.currentDistributionSubstationError =
          (action.payload as string) || "Failed to fetch distribution substation"
        state.currentDistributionSubstation = null
      })
  },
})

export const {
  clearDistributionSubstations,
  clearError,
  clearCurrentDistributionSubstation,
  resetDistributionSubstationState,
  setPagination,
  setCurrentDistributionSubstation,
} = distributionSubstationSlice.actions

export default distributionSubstationSlice.reducer
