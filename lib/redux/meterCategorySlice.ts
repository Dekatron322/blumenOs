// src/lib/redux/meterCategorySlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interface for Meter Category
export interface MeterCategory {
  id: number
  name: string
  description: string
  isActive: boolean
}

// Interface for Meter Categories Request Parameters
export interface MeterCategoriesRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  isActive?: boolean
}

// Interface for Meter Categories Response
export interface MeterCategoriesResponse {
  isSuccess: boolean
  message: string
  data: MeterCategory[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Interface for Meter Categories State
export interface MeterCategoriesState {
  meterCategories: MeterCategory[]
  loading: boolean
  error: string | null
  success: boolean
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
const initialState: MeterCategoriesState = {
  meterCategories: [],
  loading: false,
  error: null,
  success: false,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
}

// Async Thunk for fetching meter categories
export const fetchMeterCategories = createAsyncThunk(
  "meterCategories/fetchMeterCategories",
  async (params: MeterCategoriesRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, search, isActive } = params

      const requestParams: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      }

      // Add optional parameters only if they are provided
      if (search !== undefined) requestParams.Search = search
      if (isActive !== undefined) requestParams.IsActive = isActive

      const response = await api.get<MeterCategoriesResponse>(
        buildApiUrl(API_ENDPOINTS.METER_CATEGORIES.CATEGORY_LISTS),
        {
          params: requestParams,
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch meter categories")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch meter categories")
      }
      return rejectWithValue(error.message || "Network error during meter categories fetch")
    }
  }
)

// Create slice
const meterCategorySlice = createSlice({
  name: "meterCategories",
  initialState,
  reducers: {
    // Clear meter categories state
    clearMeterCategories: (state) => {
      state.meterCategories = []
      state.error = null
      state.success = false
      state.loading = false
      state.pagination = initialState.pagination
    },
    // Clear error
    clearMeterCategoriesError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch meter categories
    builder
      .addCase(fetchMeterCategories.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchMeterCategories.fulfilled, (state, action: PayloadAction<MeterCategoriesResponse>) => {
        state.loading = false
        state.success = true
        state.meterCategories = action.payload.data
        state.pagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchMeterCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
  },
})

export const { clearMeterCategories, clearMeterCategoriesError } = meterCategorySlice.actions
export default meterCategorySlice.reducer
