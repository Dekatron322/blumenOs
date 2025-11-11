// src/lib/redux/areaOfficeSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for AreaOffice
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

export interface AreaOfficesResponse {
  isSuccess: boolean
  message: string
  data: AreaOffice[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface AreaOfficesRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// AreaOffice State
interface AreaOfficeState {
  // AreaOffices list state
  areaOffices: AreaOffice[]
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

  // Current areaOffice state (for viewing/editing)
  currentAreaOffice: AreaOffice | null
  currentAreaOfficeLoading: boolean
  currentAreaOfficeError: string | null
}

// Initial state
const initialState: AreaOfficeState = {
  areaOffices: [],
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
  currentAreaOffice: null,
  currentAreaOfficeLoading: false,
  currentAreaOfficeError: null,
}

// Async thunks
export const fetchAreaOffices = createAsyncThunk(
  "areaOffices/fetchAreaOffices",
  async (params: AreaOfficesRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<AreaOfficesResponse>(buildApiUrl(API_ENDPOINTS.AREA_OFFICE.GET), {
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
        return rejectWithValue(response.data.message || "Failed to fetch area offices")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch area offices")
      }
      return rejectWithValue(error.message || "Network error during area offices fetch")
    }
  }
)

export const fetchAreaOfficeById = createAsyncThunk<AreaOffice, number, { rejectValue: string }>(
  "areaOffices/fetchAreaOfficeById",
  async (areaOfficeId: number, { rejectWithValue }) => {
    try {
      // Note: This assumes there's a GET by ID endpoint
      // You might need to adjust this based on your actual API
      const response = await api.get<AreaOfficesResponse>(
        `${buildApiUrl(API_ENDPOINTS.AREA_OFFICE.GET)}/${areaOfficeId}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch area office")
      }

      const areaOffice = response.data.data?.[0]
      if (!areaOffice) {
        return rejectWithValue("Area office not found")
      }

      return areaOffice
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch area office")
      }
      return rejectWithValue(error.message || "Network error during area office fetch")
    }
  }
)

// AreaOffice slice
const areaOfficeSlice = createSlice({
  name: "areaOffices",
  initialState,
  reducers: {
    // Clear areaOffices state
    clearAreaOffices: (state) => {
      state.areaOffices = []
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
      state.currentAreaOfficeError = null
    },

    // Clear current areaOffice
    clearCurrentAreaOffice: (state) => {
      state.currentAreaOffice = null
      state.currentAreaOfficeError = null
    },

    // Reset areaOffice state
    resetAreaOfficeState: (state) => {
      state.areaOffices = []
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
      state.currentAreaOffice = null
      state.currentAreaOfficeLoading = false
      state.currentAreaOfficeError = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set current area office (for forms, etc.)
    setCurrentAreaOffice: (state, action: PayloadAction<AreaOffice | null>) => {
      state.currentAreaOffice = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch areaOffices cases
      .addCase(fetchAreaOffices.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchAreaOffices.fulfilled, (state, action: PayloadAction<AreaOfficesResponse>) => {
        state.loading = false
        state.success = true
        state.areaOffices = action.payload.data
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
      .addCase(fetchAreaOffices.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch area offices"
        state.success = false
        state.areaOffices = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch areaOffice by ID cases
      .addCase(fetchAreaOfficeById.pending, (state) => {
        state.currentAreaOfficeLoading = true
        state.currentAreaOfficeError = null
      })
      .addCase(fetchAreaOfficeById.fulfilled, (state, action: PayloadAction<AreaOffice>) => {
        state.currentAreaOfficeLoading = false
        state.currentAreaOffice = action.payload
        state.currentAreaOfficeError = null
      })
      .addCase(fetchAreaOfficeById.rejected, (state, action) => {
        state.currentAreaOfficeLoading = false
        state.currentAreaOfficeError = (action.payload as string) || "Failed to fetch area office"
        state.currentAreaOffice = null
      })
  },
})

export const {
  clearAreaOffices,
  clearError,
  clearCurrentAreaOffice,
  resetAreaOfficeState,
  setPagination,
  setCurrentAreaOffice,
} = areaOfficeSlice.actions

export default areaOfficeSlice.reducer
