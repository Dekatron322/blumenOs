// src/lib/redux/vendorSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Vendor Employee User
export interface VendorEmployeeUser {
  id: number
  fullName: string
  email: string
  phoneNumber: string
}

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
  suspendedAt?: string
  suspensionReason?: string
  lastLoginAt?: string
  employeeUser?: VendorEmployeeUser
}

// Vendor Wallet Interfaces
export interface VendorWallet {
  balance: number
  currency: string
  lastTopUpAt: string
}

export interface VendorWalletResponse {
  isSuccess: boolean
  message: string
  data: VendorWallet
}

// Vendor Wallet Top-up Interfaces
export interface VendorTopUpRequest {
  amount: number
}

export interface VendorTopUpResponseData {
  reference: string
  externalReference: string
  amount: number
  settledAmount: number
  status: string
  currency: string
  blumenPayAccountNumber: string
  blumenPayBankName: string
  blumenPayReference: string
  blumenPayExpiresAtUtc: string
  confirmedAtUtc: string
}

export interface VendorTopUpResponse {
  isSuccess: boolean
  message: string
  data: VendorTopUpResponseData
}

// Vendor Suspend Interfaces
export interface VendorSuspendRequest {
  reason: string
}

export interface VendorSuspendResponse {
  isSuccess: boolean
  message: string
  data: Vendor
}

// Vendor Commission Update Interfaces
export interface VendorCommissionUpdateRequest {
  commission: number
}

export interface VendorCommissionUpdateResponse {
  isSuccess: boolean
  message: string
  data: Vendor
}

// Bulk Vendor Creation Interfaces
export interface BulkVendorRequest {
  blumenpayId: string
  name: string
  phoneNumber: string
  email: string
  address: string
  city: string
  state: string
  canProcessPostpaid: boolean
  canProcessPrepaid: boolean
  commission: number
  employeeUserId: number
  documentUrls: string[]
}

export interface BulkVendorsRequest {
  vendors: BulkVendorRequest[]
}

export interface BulkVendorsResponse {
  isSuccess: boolean
  message: string
  data: Vendor[]
}

export interface VendorResponse {
  isSuccess: boolean
  message: string
  data: Vendor
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

  // Vendor wallet state
  vendorWallet: VendorWallet | null
  vendorWalletLoading: boolean
  vendorWalletError: string | null

  // Vendor wallet top-up state
  vendorTopUpLoading: boolean
  vendorTopUpError: string | null
  vendorTopUpSuccess: boolean
  vendorTopUpData: VendorTopUpResponseData | null

  // Vendor suspend state
  vendorSuspendLoading: boolean
  vendorSuspendError: string | null
  vendorSuspendSuccess: boolean

  // Vendor commission update state
  vendorCommissionUpdateLoading: boolean
  vendorCommissionUpdateError: string | null
  vendorCommissionUpdateSuccess: boolean

  // Bulk vendor creation state
  bulkCreateLoading: boolean
  bulkCreateError: string | null
  bulkCreateSuccess: boolean
  createdVendors: Vendor[]
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
  vendorWallet: null,
  vendorWalletLoading: false,
  vendorWalletError: null,
  vendorTopUpLoading: false,
  vendorTopUpError: null,
  vendorTopUpSuccess: false,
  vendorTopUpData: null,
  vendorSuspendLoading: false,
  vendorSuspendError: null,
  vendorSuspendSuccess: false,
  vendorCommissionUpdateLoading: false,
  vendorCommissionUpdateError: null,
  vendorCommissionUpdateSuccess: false,
  bulkCreateLoading: false,
  bulkCreateError: null,
  bulkCreateSuccess: false,
  createdVendors: [],
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

export const fetchVendorById = createAsyncThunk("vendors/fetchVendorById", async (id: number, { rejectWithValue }) => {
  try {
    const endpoint = API_ENDPOINTS.VENDORS.GET_BY_ID.replace("{id}", id.toString())
    const response = await api.get<VendorResponse>(buildApiUrl(endpoint))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch vendor")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch vendor")
    }
    return rejectWithValue(error.message || "Network error during vendor fetch")
  }
})

export const fetchVendorWallet = createAsyncThunk(
  "vendors/fetchVendorWallet",
  async (id: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.VENDORS.GET_VENDOR_WALLET.replace("{id}", id.toString())
      const response = await api.get<VendorWalletResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch vendor wallet")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch vendor wallet")
      }
      return rejectWithValue(error.message || "Network error during vendor wallet fetch")
    }
  }
)

export const topUpVendorWallet = createAsyncThunk(
  "vendors/topUpVendorWallet",
  async ({ id, amount }: { id: number; amount: number }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.VENDORS.TOP_UP.replace("{id}", id.toString())
      const requestData: VendorTopUpRequest = { amount }

      const response = await api.post<VendorTopUpResponse>(buildApiUrl(endpoint), requestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to top up vendor wallet")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to top up vendor wallet")
      }
      return rejectWithValue(error.message || "Network error during wallet top-up")
    }
  }
)

export const suspendVendor = createAsyncThunk(
  "vendors/suspendVendor",
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.VENDORS.SUSPEND.replace("{id}", id.toString())
      const requestData: VendorSuspendRequest = { reason }

      const response = await api.post<VendorSuspendResponse>(buildApiUrl(endpoint), requestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to suspend vendor")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to suspend vendor")
      }
      return rejectWithValue(error.message || "Network error during vendor suspension")
    }
  }
)

export const updateVendorCommission = createAsyncThunk(
  "vendors/updateVendorCommission",
  async ({ id, commission }: { id: number; commission: number }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.VENDORS.UPDATE_COMMISSION.replace("{id}", id.toString())
      const requestData: VendorCommissionUpdateRequest = { commission }

      const response = await api.put<VendorCommissionUpdateResponse>(buildApiUrl(endpoint), requestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update vendor commission")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update vendor commission")
      }
      return rejectWithValue(error.message || "Network error during commission update")
    }
  }
)

export const createBulkVendors = createAsyncThunk(
  "vendors/createBulkVendors",
  async (vendorsData: BulkVendorsRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<BulkVendorsResponse>(buildApiUrl(API_ENDPOINTS.VENDORS.ADD), vendorsData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create vendors")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create vendors")
      }
      return rejectWithValue(error.message || "Network error during vendors creation")
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
      state.vendorWalletError = null
      state.vendorTopUpError = null
      state.vendorSuspendError = null
      state.vendorCommissionUpdateError = null
      state.bulkCreateError = null
    },

    // Clear current vendor
    clearCurrentVendor: (state) => {
      state.currentVendor = null
      state.currentVendorError = null
    },

    // Clear vendor wallet
    clearVendorWallet: (state) => {
      state.vendorWallet = null
      state.vendorWalletError = null
    },

    // Clear vendor top-up state
    clearVendorTopUp: (state) => {
      state.vendorTopUpLoading = false
      state.vendorTopUpError = null
      state.vendorTopUpSuccess = false
      state.vendorTopUpData = null
    },

    // Clear vendor suspend state
    clearVendorSuspend: (state) => {
      state.vendorSuspendLoading = false
      state.vendorSuspendError = null
      state.vendorSuspendSuccess = false
    },

    // Clear vendor commission update state
    clearVendorCommissionUpdate: (state) => {
      state.vendorCommissionUpdateLoading = false
      state.vendorCommissionUpdateError = null
      state.vendorCommissionUpdateSuccess = false
    },

    // Clear bulk create state
    clearBulkCreate: (state) => {
      state.bulkCreateLoading = false
      state.bulkCreateError = null
      state.bulkCreateSuccess = false
      state.createdVendors = []
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
      state.vendorWallet = null
      state.vendorWalletLoading = false
      state.vendorWalletError = null
      state.vendorTopUpLoading = false
      state.vendorTopUpError = null
      state.vendorTopUpSuccess = false
      state.vendorTopUpData = null
      state.vendorSuspendLoading = false
      state.vendorSuspendError = null
      state.vendorSuspendSuccess = false
      state.vendorCommissionUpdateLoading = false
      state.vendorCommissionUpdateError = null
      state.vendorCommissionUpdateSuccess = false
      state.bulkCreateLoading = false
      state.bulkCreateError = null
      state.bulkCreateSuccess = false
      state.createdVendors = []
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Update current vendor (for optimistic updates)
    updateCurrentVendor: (state, action: PayloadAction<Partial<Vendor>>) => {
      if (state.currentVendor) {
        state.currentVendor = { ...state.currentVendor, ...action.payload }
      }
    },

    // Update vendor wallet (for optimistic updates)
    updateVendorWallet: (state, action: PayloadAction<Partial<VendorWallet>>) => {
      if (state.vendorWallet) {
        state.vendorWallet = { ...state.vendorWallet, ...action.payload }
      }
    },

    // Update vendor wallet balance after successful top-up (optimistic update)
    updateWalletBalanceAfterTopUp: (state, action: PayloadAction<number>) => {
      if (state.vendorWallet) {
        state.vendorWallet.balance += action.payload
        state.vendorWallet.lastTopUpAt = new Date().toISOString()
      }
    },

    // Update vendor suspend status (optimistic update)
    updateVendorSuspendStatus: (state, action: PayloadAction<{ isSuspended: boolean; suspensionReason?: string }>) => {
      if (state.currentVendor) {
        state.currentVendor.isSuspended = action.payload.isSuspended
        state.currentVendor.suspensionReason = action.payload.suspensionReason
        state.currentVendor.suspendedAt = action.payload.isSuspended ? new Date().toISOString() : undefined
        state.currentVendor.status = action.payload.isSuspended ? "SUSPENDED" : "ACTIVE"
      }

      // Also update in vendors list if the vendor exists there
      const vendorIndex = state.vendors.findIndex((v) => v.id === state.currentVendor?.id)
      if (vendorIndex !== -1) {
        const vendor = state.vendors[vendorIndex]!
        vendor.isSuspended = action.payload.isSuspended
        vendor.suspensionReason = action.payload.suspensionReason
        vendor.suspendedAt = action.payload.isSuspended ? new Date().toISOString() : undefined
        vendor.status = action.payload.isSuspended ? "SUSPENDED" : "ACTIVE"
      }
    },

    // Update vendor commission (optimistic update)
    updateVendorCommissionOptimistic: (state, action: PayloadAction<number>) => {
      if (state.currentVendor) {
        state.currentVendor.commission = action.payload
      }

      // Also update in vendors list if the vendor exists there
      const vendorIndex = state.vendors.findIndex((v) => v.id === state.currentVendor?.id)
      if (vendorIndex !== -1) {
        state.vendors[vendorIndex]!.commission = action.payload
      }
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
      // Fetch vendor by ID cases
      .addCase(fetchVendorById.pending, (state) => {
        state.currentVendorLoading = true
        state.currentVendorError = null
      })
      .addCase(fetchVendorById.fulfilled, (state, action: PayloadAction<VendorResponse>) => {
        state.currentVendorLoading = false
        state.currentVendor = action.payload.data
        state.currentVendorError = null
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.currentVendorLoading = false
        state.currentVendorError = (action.payload as string) || "Failed to fetch vendor"
        state.currentVendor = null
      })
      // Fetch vendor wallet cases
      .addCase(fetchVendorWallet.pending, (state) => {
        state.vendorWalletLoading = true
        state.vendorWalletError = null
      })
      .addCase(fetchVendorWallet.fulfilled, (state, action: PayloadAction<VendorWalletResponse>) => {
        state.vendorWalletLoading = false
        state.vendorWallet = action.payload.data
        state.vendorWalletError = null
      })
      .addCase(fetchVendorWallet.rejected, (state, action) => {
        state.vendorWalletLoading = false
        state.vendorWalletError = (action.payload as string) || "Failed to fetch vendor wallet"
        state.vendorWallet = null
      })
      // Top up vendor wallet cases
      .addCase(topUpVendorWallet.pending, (state) => {
        state.vendorTopUpLoading = true
        state.vendorTopUpError = null
        state.vendorTopUpSuccess = false
        state.vendorTopUpData = null
      })
      .addCase(topUpVendorWallet.fulfilled, (state, action: PayloadAction<VendorTopUpResponse>) => {
        state.vendorTopUpLoading = false
        state.vendorTopUpSuccess = true
        state.vendorTopUpData = action.payload.data
        state.vendorTopUpError = null

        // Optimistically update the wallet balance
        if (state.vendorWallet) {
          state.vendorWallet.balance += action.payload.data.amount
          state.vendorWallet.lastTopUpAt = new Date().toISOString()
        }
      })
      .addCase(topUpVendorWallet.rejected, (state, action) => {
        state.vendorTopUpLoading = false
        state.vendorTopUpError = (action.payload as string) || "Failed to top up vendor wallet"
        state.vendorTopUpSuccess = false
        state.vendorTopUpData = null
      })
      // Suspend vendor cases
      .addCase(suspendVendor.pending, (state) => {
        state.vendorSuspendLoading = true
        state.vendorSuspendError = null
        state.vendorSuspendSuccess = false
      })
      .addCase(suspendVendor.fulfilled, (state, action: PayloadAction<VendorSuspendResponse>) => {
        state.vendorSuspendLoading = false
        state.vendorSuspendSuccess = true
        state.vendorSuspendError = null

        // Update current vendor with suspended data
        if (state.currentVendor && state.currentVendor.id === action.payload.data.id) {
          state.currentVendor = action.payload.data
        }

        // Update vendor in vendors list
        const vendorIndex = state.vendors.findIndex((v) => v.id === action.payload.data.id)
        if (vendorIndex !== -1) {
          state.vendors[vendorIndex] = action.payload.data
        }
      })
      .addCase(suspendVendor.rejected, (state, action) => {
        state.vendorSuspendLoading = false
        state.vendorSuspendError = (action.payload as string) || "Failed to suspend vendor"
        state.vendorSuspendSuccess = false
      })
      // Update vendor commission cases
      .addCase(updateVendorCommission.pending, (state) => {
        state.vendorCommissionUpdateLoading = true
        state.vendorCommissionUpdateError = null
        state.vendorCommissionUpdateSuccess = false
      })
      .addCase(updateVendorCommission.fulfilled, (state, action: PayloadAction<VendorCommissionUpdateResponse>) => {
        state.vendorCommissionUpdateLoading = false
        state.vendorCommissionUpdateSuccess = true
        state.vendorCommissionUpdateError = null

        // Update current vendor with new commission data
        if (state.currentVendor && state.currentVendor.id === action.payload.data.id) {
          state.currentVendor = action.payload.data
        }

        // Update vendor in vendors list
        const vendorIndex = state.vendors.findIndex((v) => v.id === action.payload.data.id)
        if (vendorIndex !== -1) {
          state.vendors[vendorIndex] = action.payload.data
        }
      })
      .addCase(updateVendorCommission.rejected, (state, action) => {
        state.vendorCommissionUpdateLoading = false
        state.vendorCommissionUpdateError = (action.payload as string) || "Failed to update vendor commission"
        state.vendorCommissionUpdateSuccess = false
      })
      // Create bulk vendors cases
      .addCase(createBulkVendors.pending, (state) => {
        state.bulkCreateLoading = true
        state.bulkCreateError = null
        state.bulkCreateSuccess = false
        state.createdVendors = []
      })
      .addCase(createBulkVendors.fulfilled, (state, action: PayloadAction<BulkVendorsResponse>) => {
        state.bulkCreateLoading = false
        state.bulkCreateSuccess = true
        state.createdVendors = action.payload.data
        state.bulkCreateError = null

        // Optionally add the newly created vendors to the current vendors list
        // This can be useful if you want to immediately show them in the list
        state.vendors = [...action.payload.data, ...state.vendors]
      })
      .addCase(createBulkVendors.rejected, (state, action) => {
        state.bulkCreateLoading = false
        state.bulkCreateError = (action.payload as string) || "Failed to create vendors"
        state.bulkCreateSuccess = false
        state.createdVendors = []
      })
  },
})

export const {
  clearVendors,
  clearError,
  clearCurrentVendor,
  clearVendorWallet,
  clearVendorTopUp,
  clearVendorSuspend,
  clearVendorCommissionUpdate,
  clearBulkCreate,
  resetVendorState,
  setPagination,
  updateCurrentVendor,
  updateVendorWallet,
  updateWalletBalanceAfterTopUp,
  updateVendorSuspendStatus,
  updateVendorCommissionOptimistic,
} = vendorSlice.actions

export default vendorSlice.reducer
