import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Request body for creating a billing dispute
export interface CreateBillingDisputeRequest {
  billId: number
  reason: string
  details: string
  fileUrls: string[]
}

// Parameters for getting all billing disputes
export interface GetAllDisputesParams {
  PageNumber: number
  PageSize: number
  BillId?: number
  CustomerId?: number
  Status?: number // 0, 1, 2, 3
  Period?: string
  RaisedByUserId?: number
  AreaOfficeId?: number
}

// Payment item in dispute response
export interface DisputePaymentItem {
  id: number
  reference: string
  latitude: number
  longitude: number
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | string
  status: "Pending" | "Confirmed" | "Failed" | "Reversed" | string
  collectorType: "Customer" | "Agent" | "Vendor" | "Staff" | string
  amount: number
  amountApplied: number
  overPaymentAmount: number
  outstandingAfterPayment: number
  outstandingBeforePayment: number
  currency: string
  paidAtUtc: string
  confirmedAtUtc: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  postpaidBillId: number
  postpaidBillPeriod: string
  billTotalDue: number
  vendorId: number
  vendorName: string
  agentId: number
  agentCode: string
  agentName: string
  areaOfficeName: string
  distributionSubstationCode: string
  feederName: string
  paymentTypeId: number
  paymentTypeName: string
}

// Dispute data in response
export interface BillingDisputeData {
  id: number
  billId: number
  customerId: number
  customerName: string
  customerAccountNumber: string
  status: number
  reason: string
  details: string
  raisedByUserId: number
  raisedByName: string
  raisedAtUtc: string
  resolvedByUserId: number | null
  resolvedByName: string | null
  resolvedAtUtc: string | null
  resolutionNotes: string | null
  payments: DisputePaymentItem[]
  fileUrls: string[]
}

// Paginated response for getting all disputes
export interface GetAllDisputesResponse {
  isSuccess: boolean
  message: string
  data: BillingDisputeData[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// API response wrapper for single dispute
export interface BillingDisputeResponse {
  isSuccess: boolean
  message: string
  data: BillingDisputeData
}

// Parameters for getting a single dispute by ID
export interface GetDisputeByIdParams {
  id: number
}

// Slice state
interface BillingDisputeState {
  creating: boolean
  createError: string | null
  createSuccess: boolean
  dispute: BillingDisputeData | null

  // For get all disputes
  loadingDisputes: boolean
  disputes: BillingDisputeData[]
  disputesError: string | null
  disputesTotalCount: number
  disputesTotalPages: number
  disputesCurrentPage: number
  disputesPageSize: number
  disputesHasNext: boolean
  disputesHasPrevious: boolean

  // For get dispute by ID
  loadingDisputeById: boolean
  disputeById: BillingDisputeData | null
  disputeByIdError: string | null
}

const initialState: BillingDisputeState = {
  creating: false,
  createError: null,
  createSuccess: false,
  dispute: null,

  // For get all disputes
  loadingDisputes: false,
  disputes: [],
  disputesError: null,
  disputesTotalCount: 0,
  disputesTotalPages: 0,
  disputesCurrentPage: 0,
  disputesPageSize: 0,
  disputesHasNext: false,
  disputesHasPrevious: false,

  // For get dispute by ID
  loadingDisputeById: false,
  disputeById: null,
  disputeByIdError: null,
}

// Thunk for creating a billing dispute
export const createBillingDispute = createAsyncThunk(
  "billingDispute/createBillingDispute",
  async (request: CreateBillingDisputeRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<BillingDisputeResponse>(
        buildApiUrl(API_ENDPOINTS.BILLING_DISPUTE.CREATE_DISPUTE),
        request
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create billing dispute")
      }

      if (!response.data.data) {
        return rejectWithValue("Billing dispute data not found")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create billing dispute")
      }
      return rejectWithValue(error.message || "Network error during billing dispute creation")
    }
  }
)

// Thunk for getting all billing disputes
export const getAllBillingDisputes = createAsyncThunk(
  "billingDispute/getAllBillingDisputes",
  async (params: GetAllDisputesParams, { rejectWithValue }) => {
    try {
      // Convert params to query string
      const queryParams = new URLSearchParams()

      // Required parameters
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      // Optional parameters
      if (params.BillId !== undefined) {
        queryParams.append("BillId", params.BillId.toString())
      }
      if (params.CustomerId !== undefined) {
        queryParams.append("CustomerId", params.CustomerId.toString())
      }
      if (params.Status !== undefined) {
        queryParams.append("Status", params.Status.toString())
      }
      if (params.Period) {
        queryParams.append("Period", params.Period)
      }
      if (params.RaisedByUserId !== undefined) {
        queryParams.append("RaisedByUserId", params.RaisedByUserId.toString())
      }
      if (params.AreaOfficeId !== undefined) {
        queryParams.append("AreaOfficeId", params.AreaOfficeId.toString())
      }

      const response = await api.get<GetAllDisputesResponse>(
        `${buildApiUrl(API_ENDPOINTS.BILLING_DISPUTE.GET_ALL_DISPUTES)}?${queryParams.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch billing disputes")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch billing disputes")
      }
      return rejectWithValue(error.message || "Network error while fetching billing disputes")
    }
  }
)

// Thunk for getting a single dispute by ID
export const getDisputeById = createAsyncThunk(
  "billingDispute/getDisputeById",
  async (params: GetDisputeByIdParams, { rejectWithValue }) => {
    try {
      // Build the endpoint by replacing the {id} path parameter
      const endpoint = API_ENDPOINTS.BILLING_DISPUTE.GET_DISPUTE_BY_ID.replace("{id}", params.id.toString())

      const response = await api.get<BillingDisputeResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch dispute details")
      }

      if (!response.data.data) {
        return rejectWithValue("Dispute data not found")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch dispute details")
      }
      return rejectWithValue(error.message || "Network error while fetching dispute details")
    }
  }
)

const billingDisputeSlice = createSlice({
  name: "billingDispute",
  initialState,
  reducers: {
    clearBillingDisputeState: (state) => {
      state.creating = false
      state.createError = null
      state.createSuccess = false
      state.dispute = null

      // Also clear disputes state
      state.loadingDisputes = false
      state.disputes = []
      state.disputesError = null
      state.disputesTotalCount = 0
      state.disputesTotalPages = 0
      state.disputesCurrentPage = 0
      state.disputesPageSize = 0
      state.disputesHasNext = false
      state.disputesHasPrevious = false

      // Clear dispute by ID state
      state.loadingDisputeById = false
      state.disputeById = null
      state.disputeByIdError = null
    },
    clearBillingDisputeError: (state) => {
      state.createError = null
    },
    clearDisputesError: (state) => {
      state.disputesError = null
    },
    clearDisputesData: (state) => {
      state.loadingDisputes = false
      state.disputes = []
      state.disputesError = null
      state.disputesTotalCount = 0
      state.disputesTotalPages = 0
      state.disputesCurrentPage = 0
      state.disputesPageSize = 0
      state.disputesHasNext = false
      state.disputesHasPrevious = false
    },
    clearDisputeById: (state) => {
      state.loadingDisputeById = false
      state.disputeById = null
      state.disputeByIdError = null
    },
    clearDisputeByIdError: (state) => {
      state.disputeByIdError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Create dispute cases
      .addCase(createBillingDispute.pending, (state) => {
        state.creating = true
        state.createError = null
        state.createSuccess = false
        state.dispute = null
      })
      .addCase(createBillingDispute.fulfilled, (state, action: PayloadAction<BillingDisputeResponse>) => {
        state.creating = false
        state.createSuccess = true
        state.dispute = action.payload.data
        state.createError = null
      })
      .addCase(createBillingDispute.rejected, (state, action) => {
        state.creating = false
        state.createSuccess = false
        state.dispute = null
        state.createError = (action.payload as string) || "Failed to create billing dispute"
      })

      // Get all disputes cases
      .addCase(getAllBillingDisputes.pending, (state) => {
        state.loadingDisputes = true
        state.disputesError = null
      })
      .addCase(getAllBillingDisputes.fulfilled, (state, action: PayloadAction<GetAllDisputesResponse>) => {
        state.loadingDisputes = false
        state.disputes = action.payload.data || []
        state.disputesTotalCount = action.payload.totalCount || 0
        state.disputesTotalPages = action.payload.totalPages || 0
        state.disputesCurrentPage = action.payload.currentPage || 0
        state.disputesPageSize = action.payload.pageSize || 0
        state.disputesHasNext = action.payload.hasNext || false
        state.disputesHasPrevious = action.payload.hasPrevious || false
        state.disputesError = null
      })
      .addCase(getAllBillingDisputes.rejected, (state, action) => {
        state.loadingDisputes = false
        state.disputes = []
        state.disputesTotalCount = 0
        state.disputesTotalPages = 0
        state.disputesCurrentPage = 0
        state.disputesPageSize = 0
        state.disputesHasNext = false
        state.disputesHasPrevious = false
        state.disputesError = (action.payload as string) || "Failed to fetch billing disputes"
      })

      // Get dispute by ID cases
      .addCase(getDisputeById.pending, (state) => {
        state.loadingDisputeById = true
        state.disputeByIdError = null
        state.disputeById = null
      })
      .addCase(getDisputeById.fulfilled, (state, action: PayloadAction<BillingDisputeResponse>) => {
        state.loadingDisputeById = false
        state.disputeById = action.payload.data
        state.disputeByIdError = null
      })
      .addCase(getDisputeById.rejected, (state, action) => {
        state.loadingDisputeById = false
        state.disputeById = null
        state.disputeByIdError = (action.payload as string) || "Failed to fetch dispute details"
      })
  },
})

export const {
  clearBillingDisputeState,
  clearBillingDisputeError,
  clearDisputesError,
  clearDisputesData,
  clearDisputeById,
  clearDisputeByIdError,
} = billingDisputeSlice.actions

export default billingDisputeSlice.reducer
