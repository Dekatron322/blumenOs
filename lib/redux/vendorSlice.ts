// src/lib/redux/vendorSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Vendor
export interface Vendor {
  id: number
  accountId: string
  blumenpayId: string
  name: string
  phoneNumber: string
  email: string
  address: string
  city: string
  state: string
  canProcessPostpaid: boolean
  canProcessPrepaid: boolean
  status: string
  isSuspended: boolean
  commission: number
  employeeUserId: number
  employeeName: string
  apiPublicKey: string
  apiKeyIssuedAt: string
  apiKeyLastUsedAt: string
  documentUrls: string[]
}

export interface VendorsResponse {
  isSuccess: boolean
  message: string
  data: Vendor[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface VendorsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  state?: string
  status?: string
  isSuspended?: boolean
  canProcessPrepaid?: boolean
  canProcessPostpaid?: boolean
  employeeUserId?: number
}

// Vendor State
interface VendorState {
  // Vendors list state
  vendors: Vendor[]
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

  // Current vendor state (for viewing/editing)
  currentVendor: Vendor | null
  currentVendorLoading: boolean
  currentVendorError: string | null
}

// Initial state
const initialState: VendorState = {
  vendors: [],
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
  currentVendor: null,
  currentVendorLoading: false,
  currentVendorError: null,
}

// Async thunks
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
  async (params: VendorsRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        search,
        state,
        status,
        isSuspended,
        canProcessPrepaid,
        canProcessPostpaid,
        employeeUserId,
      } = params

      const response = await api.get<VendorsResponse>(buildApiUrl(API_ENDPOINTS.VENDORS.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(search && { Search: search }),
          ...(state && { State: state }),
          ...(status && { Status: status }),
          ...(isSuspended !== undefined && { IsSuspended: isSuspended }),
          ...(canProcessPrepaid !== undefined && { CanProcessPrepaid: canProcessPrepaid }),
          ...(canProcessPostpaid !== undefined && { CanProcessPostpaid: canProcessPostpaid }),
          ...(employeeUserId !== undefined && { EmployeeUserId: employeeUserId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch vendors")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch vendors")
      }
      return rejectWithValue(error.message || "Network error during vendors fetch")
    }
  }
)

// Vendor slice
const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    // Clear vendors state
    clearVendors: (state) => {
      state.vendors = []
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
      state.currentVendorError = null
    },

    // Clear current vendor
    clearCurrentVendor: (state) => {
      state.currentVendor = null
      state.currentVendorError = null
    },

    // Reset vendor state
    resetVendorState: (state) => {
      state.vendors = []
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
      state.currentVendor = null
      state.currentVendorLoading = false
      state.currentVendorError = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vendors cases
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchVendors.fulfilled, (state, action: PayloadAction<VendorsResponse>) => {
        state.loading = false
        state.success = true
        state.vendors = action.payload.data
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
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch vendors"
        state.success = false
        state.vendors = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
  },
})

export const { clearVendors, clearError, clearCurrentVendor, resetVendorState, setPagination } = vendorSlice.actions

export default vendorSlice.reducer
