// src/lib/redux/meterBrandsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interface for Meter Brand
export interface MeterBrand {
  id: number
  name: string
  description: string
  isActive: boolean
}

// Interface for Meter Brands Request Parameters
export interface MeterBrandsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  isActive?: boolean
}

// Interface for Meter Brands Response
export interface MeterBrandsResponse {
  isSuccess: boolean
  message: string
  data: MeterBrand[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Interface for Meter Brands State
export interface MeterBrandsState {
  meterBrands: MeterBrand[]
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
const initialState: MeterBrandsState = {
  meterBrands: [],
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

// Async Thunk for fetching meter brands
export const fetchMeterBrands = createAsyncThunk(
  "meterBrands/fetchMeterBrands",
  async (params: MeterBrandsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, search, isActive } = params

      const requestParams: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      }

      // Add optional parameters only if they are provided
      if (search !== undefined) requestParams.Search = search
      if (isActive !== undefined) requestParams.IsActive = isActive

      const response = await api.get<MeterBrandsResponse>(buildApiUrl(API_ENDPOINTS.METER_BRANDS.BRAND_LISTS), {
        params: requestParams,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch meter brands")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch meter brands")
      }
      return rejectWithValue(error.message || "Network error during meter brands fetch")
    }
  }
)

// Create slice
const meterBrandsSlice = createSlice({
  name: "meterBrands",
  initialState,
  reducers: {
    // Clear meter brands state
    clearMeterBrands: (state) => {
      state.meterBrands = []
      state.error = null
      state.success = false
      state.loading = false
      state.pagination = initialState.pagination
    },
    // Clear error
    clearMeterBrandsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch meter brands
    builder
      .addCase(fetchMeterBrands.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchMeterBrands.fulfilled, (state, action: PayloadAction<MeterBrandsResponse>) => {
        state.loading = false
        state.success = true
        state.meterBrands = action.payload.data
        state.pagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchMeterBrands.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
  },
})

export const { clearMeterBrands, clearMeterBrandsError } = meterBrandsSlice.actions
export default meterBrandsSlice.reducer
