// src/lib/redux/tariffGroupSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Request parameters interface for fetching tariff groups
export interface TariffGroupsRequest {
  PageNumber: number
  PageSize: number
  Search?: string
  ServiceBand?: number // Available values : 1, 2, 3, 4, 5
  IsActive?: boolean
  HasNonZeroTariffIndex?: boolean
}

// Tariff group interface
export interface TariffGroup {
  id: number
  tariffIndex: string
  tariffCode: string
  name: string
  serviceBand: number
  tariffType: string
  tariffClass: string
  tariffRate: number
  currency: string
  unitOfMeasure: string
  fixedCharge: number
  minimumCharge: number
  description: string
  isActive: boolean
  isLocked: boolean
  effectiveFromUtc: string
  effectiveToUtc: string
  publishedAtUtc: string
  publishedBy: string
  version: string
  supersedesTariffGroupId: number
  sourceDocumentRef: string
}

// Response interface for tariff groups
export interface TariffGroupsResponse {
  isSuccess: boolean
  message: string
  data: TariffGroup[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Tariff Group State
interface TariffGroupState {
  // Fetch tariff groups state
  tariffGroupsLoading: boolean
  tariffGroupsError: string | null
  tariffGroupsSuccess: boolean
  tariffGroups: TariffGroup[]
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
const initialState: TariffGroupState = {
  tariffGroupsLoading: false,
  tariffGroupsError: null,
  tariffGroupsSuccess: false,
  tariffGroups: [],
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
}

// Async thunk for fetching tariff groups
export const fetchTariffGroups = createAsyncThunk(
  "tariffGroups/fetchTariffGroups",
  async (params: TariffGroupsRequest, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.Search) {
        queryParams.append("Search", params.Search)
      }

      if (params.ServiceBand !== undefined) {
        queryParams.append("ServiceBand", params.ServiceBand.toString())
      }

      if (params.IsActive !== undefined) {
        queryParams.append("IsActive", params.IsActive.toString())
      }

      if (params.HasNonZeroTariffIndex !== undefined) {
        queryParams.append("HasNonZeroTariffIndex", params.HasNonZeroTariffIndex.toString())
      }

      const url = `${buildApiUrl(API_ENDPOINTS.TARIFF_GROUPS.GET)}?${queryParams.toString()}`
      const response = await api.get<TariffGroupsResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch tariff groups")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch tariff groups")
      }
      return rejectWithValue(error.message || "Network error during tariff groups fetch")
    }
  }
)

// Tariff Group slice
const tariffGroupSlice = createSlice({
  name: "tariffGroups",
  initialState,
  reducers: {
    // Clear tariff groups state
    clearTariffGroupsState: (state) => {
      state.tariffGroupsLoading = false
      state.tariffGroupsError = null
      state.tariffGroupsSuccess = false
      state.tariffGroups = []
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear errors
    clearError: (state) => {
      state.tariffGroupsError = null
    },

    // Reset tariff group state
    resetTariffGroupState: (state) => {
      state.tariffGroupsLoading = false
      state.tariffGroupsError = null
      state.tariffGroupsSuccess = false
      state.tariffGroups = []
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tariff groups cases
      .addCase(fetchTariffGroups.pending, (state) => {
        state.tariffGroupsLoading = true
        state.tariffGroupsError = null
        state.tariffGroupsSuccess = false
      })
      .addCase(fetchTariffGroups.fulfilled, (state, action: PayloadAction<TariffGroupsResponse>) => {
        state.tariffGroupsLoading = false
        state.tariffGroupsSuccess = true
        state.tariffGroupsError = null
        state.tariffGroups = action.payload.data
        state.pagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchTariffGroups.rejected, (state, action) => {
        state.tariffGroupsLoading = false
        state.tariffGroupsError = (action.payload as string) || "Failed to fetch tariff groups"
        state.tariffGroupsSuccess = false
        state.tariffGroups = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
          hasNext: false,
          hasPrevious: false,
        }
      })
  },
})

export const { clearTariffGroupsState, clearError, resetTariffGroupState } = tariffGroupSlice.actions

export default tariffGroupSlice.reducer
