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
  isSuccess: true
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
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// API Key Generation Interfaces
export interface ApiKeyData {
  publicKey: string
  secretKey: string
  issuedAt: string
}

export interface ApiKeyResponse {
  isSuccess: boolean
  message: string
  data: ApiKeyData
}

// Change Request Interfaces
export interface ChangeRequestItem {
  path: string
  value: string
}

export interface ChangeRequestDispute {
  type: number
  disputeId: number
}

export interface ChangeRequestPreconditions {
  [key: string]: string
}

export interface ChangeRequestData {
  changes: ChangeRequestItem[]
  comment: string
  dispute?: ChangeRequestDispute
  preconditions?: ChangeRequestPreconditions
}

export interface ChangeRequestResponseData {
  id: number
  publicId: string
  reference: string
  status: number
  entityType: number
  entityId: number
  entityLabel: string
  requestedBy: string
  requestedAtUtc: string
  patchDocument: string
  displayDiff: string
  requesterComment: string
  canonicalPaths: string
  source: number
  autoApproved: boolean
  approvalNotes: string
  declinedReason: string
  approvedAtUtc: string
  approvedBy: string
  appliedAtUtc: string
  failureReason: string
  disputeType: number
  disputeId: number
}

export interface ChangeRequestResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestResponseData
}

// Interfaces for View Change Requests
export interface ChangeRequestListItem {
  id: number
  publicId: string
  reference: string
  status: number
  entityType: number
  entityId: number
  entityLabel: string
  requestedBy: string
  requestedAtUtc: string
  source?: number
}

export interface ChangeRequestsResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestListItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ChangeRequestsRequestParams {
  pageNumber: number
  pageSize: number
  status?: number
  source?: number
  reference?: string
  publicId?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Interfaces for Change Request Details
export interface ChangeRequestDetails {
  id: number
  publicId: string
  reference: string
  status: number
  entityType: number
  entityId: number
  entityLabel: string
  requestedBy: string
  requestedAtUtc: string
  patchDocument: string
  displayDiff: string
  requesterComment: string
  canonicalPaths: string
  source: number
  autoApproved: boolean
  approvalNotes: string | null
  declinedReason: string | null
  approvedAtUtc: string | null
  approvedBy: string | null
  appliedAtUtc: string | null
  failureReason: string | null
  disputeType: number | null
  disputeId: number | null
}

export interface ChangeRequestDetailsResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestDetails
}

// Interfaces for Approve Change Request
export interface ApproveChangeRequestRequest {
  notes?: string
}

export interface ApproveChangeRequestResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestResponseData
}

// Interfaces for Decline Change Request
export interface DeclineChangeRequestRequest {
  reason: string
}

export interface DeclineChangeRequestResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestResponseData
}

// Vendor Payment Interfaces
export interface VendorPayment {
  id: number
  reference: string
  latitude: number
  longitude: number
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet"
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  collectorType: "Customer" | "SalesRep" | "Vendor" | "Staff"
  amount: number
  amountApplied: number
  overPaymentAmount: number
  outstandingAfterPayment: number
  outstandingBeforePayment: number
  currency: string
  paidAtUtc: string
  confirmedAtUtc: string | null
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

export interface VendorPaymentsResponse {
  isSuccess: boolean
  message: string
  data: VendorPayment[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface VendorPaymentsRequestParams {
  pageNumber: number
  pageSize: number
  customerId?: number
  vendorId?: number
  agentId?: number
  postpaidBillId?: number
  paymentTypeId?: number
  channel?: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet"
  status?: "Pending" | "Confirmed" | "Failed" | "Reversed"
  collectorType?: "Customer" | "SalesRep" | "Vendor" | "Staff"
  paidFromUtc?: string
  paidToUtc?: string
  search?: string
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

  // API key generation state
  apiKeyGenerationLoading: boolean
  apiKeyGenerationError: string | null
  apiKeyGenerationSuccess: boolean
  generatedApiKey: ApiKeyData | null

  // Change Request state
  changeRequestLoading: boolean
  changeRequestError: string | null
  changeRequestSuccess: boolean
  changeRequestResponse: ChangeRequestResponseData | null

  // View Change Requests state
  changeRequests: ChangeRequestListItem[]
  changeRequestsLoading: boolean
  changeRequestsError: string | null
  changeRequestsSuccess: boolean
  changeRequestsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Change Requests By Vendor ID state
  changeRequestsByVendor: ChangeRequestListItem[]
  changeRequestsByVendorLoading: boolean
  changeRequestsByVendorError: string | null
  changeRequestsByVendorSuccess: boolean
  changeRequestsByVendorPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Change Request Details state
  changeRequestDetails: ChangeRequestDetails | null
  changeRequestDetailsLoading: boolean
  changeRequestDetailsError: string | null
  changeRequestDetailsSuccess: boolean

  // Approve Change Request state
  approveChangeRequestLoading: boolean
  approveChangeRequestError: string | null
  approveChangeRequestSuccess: boolean
  approveChangeRequestResponse: ChangeRequestResponseData | null

  // Decline Change Request state
  declineChangeRequestLoading: boolean
  declineChangeRequestError: string | null
  declineChangeRequestSuccess: boolean
  declineChangeRequestResponse: ChangeRequestResponseData | null

  // Vendor Payments state
  vendorPayments: VendorPayment[]
  vendorPaymentsLoading: boolean
  vendorPaymentsError: string | null
  vendorPaymentsSuccess: boolean
  vendorPaymentsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
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
  apiKeyGenerationLoading: false,
  apiKeyGenerationError: null,
  apiKeyGenerationSuccess: false,
  generatedApiKey: null,
  changeRequestLoading: false,
  changeRequestError: null,
  changeRequestSuccess: false,
  changeRequestResponse: null,
  changeRequests: [],
  changeRequestsLoading: false,
  changeRequestsError: null,
  changeRequestsSuccess: false,
  changeRequestsPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  changeRequestsByVendor: [],
  changeRequestsByVendorLoading: false,
  changeRequestsByVendorError: null,
  changeRequestsByVendorSuccess: false,
  changeRequestsByVendorPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  changeRequestDetails: null,
  changeRequestDetailsLoading: false,
  changeRequestDetailsError: null,
  changeRequestDetailsSuccess: false,
  approveChangeRequestLoading: false,
  approveChangeRequestError: null,
  approveChangeRequestSuccess: false,
  approveChangeRequestResponse: null,
  declineChangeRequestLoading: false,
  declineChangeRequestError: null,
  declineChangeRequestSuccess: false,
  declineChangeRequestResponse: null,
  vendorPayments: [],
  vendorPaymentsLoading: false,
  vendorPaymentsError: null,
  vendorPaymentsSuccess: false,
  vendorPaymentsPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
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
        sortBy,
        sortOrder,
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
          ...(sortBy && { SortBy: sortBy }),
          ...(sortOrder && { SortOrder: sortOrder }),
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

export const generateApiKey = createAsyncThunk("vendors/generateApiKey", async (id: number, { rejectWithValue }) => {
  try {
    const endpoint = API_ENDPOINTS.VENDORS.GENERATE_API_KEY.replace("{id}", id.toString())
    const response = await api.post<ApiKeyResponse>(buildApiUrl(endpoint))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to generate API key")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to generate API key")
    }
    return rejectWithValue(error.message || "Network error during API key generation")
  }
})

// Change Request Async Thunks
export const submitVendorChangeRequest = createAsyncThunk(
  "vendors/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.VENDORS.CHANGE_REQUEST.replace("{id}", id.toString())
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      return {
        vendorId: id,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to submit change request")
      }
      return rejectWithValue(error.message || "Network error during change request submission")
    }
  }
)

export const fetchVendorChangeRequests = createAsyncThunk(
  "vendors/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId, sortBy, sortOrder } = params

      const response = await api.get<ChangeRequestsResponse>(buildApiUrl(API_ENDPOINTS.VENDORS.VIEW_CHANGE_REQUEST), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(status !== undefined && { Status: status }),
          ...(source !== undefined && { Source: source }),
          ...(reference && { Reference: reference }),
          ...(publicId && { PublicId: publicId }),
          ...(sortBy && { SortBy: sortBy }),
          ...(sortOrder && { SortOrder: sortOrder }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change requests")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests")
      }
      return rejectWithValue(error.message || "Network error during change requests fetch")
    }
  }
)

export const fetchChangeRequestsByVendorId = createAsyncThunk(
  "vendors/fetchChangeRequestsByVendorId",
  async (
    {
      id,
      params,
    }: {
      id: number
      params: ChangeRequestsRequestParams
    },
    { rejectWithValue }
  ) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const endpoint = API_ENDPOINTS.VENDORS.CHANGE_REQUESTS_BY_ID.replace("{id}", id.toString())
      const response = await api.get<ChangeRequestsResponse>(buildApiUrl(endpoint), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(status !== undefined && { Status: status }),
          ...(source !== undefined && { Source: source }),
          ...(reference && { Reference: reference }),
          ...(publicId && { PublicId: publicId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change requests for vendor")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests for vendor")
      }
      return rejectWithValue(error.message || "Network error during vendor change requests fetch")
    }
  }
)

export const fetchChangeRequestDetails = createAsyncThunk(
  "vendors/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.VENDORS.CHANGE_REQUEST_DETAILS.replace("{identifier}", identifier)
      const response = await api.get<ChangeRequestDetailsResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change request details")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change request details")
      }
      return rejectWithValue(error.message || "Network error during change request details fetch")
    }
  }
)

export const approveChangeRequest = createAsyncThunk(
  "vendors/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.VENDORS.APPROVE_CHANGE_REQUEST.replace("{publicId}", publicId)
      const requestBody: ApproveChangeRequestRequest = {}

      if (notes) {
        requestBody.notes = notes
      }

      const response = await api.post<ApproveChangeRequestResponse>(buildApiUrl(endpoint), requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to approve change request")
      }

      return {
        publicId,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to approve change request")
      }
      return rejectWithValue(error.message || "Network error during change request approval")
    }
  }
)

export const declineChangeRequest = createAsyncThunk(
  "vendors/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.VENDORS.DECLINE_CHANGE_REQUEST.replace("{publicId}", publicId)
      const requestBody: DeclineChangeRequestRequest = {
        reason: reason,
      }

      const response = await api.post<DeclineChangeRequestResponse>(buildApiUrl(endpoint), requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to decline change request")
      }

      return {
        publicId,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to decline change request")
      }
      return rejectWithValue(error.message || "Network error during change request decline")
    }
  }
)

// Vendor Payment Async Thunks
export const fetchVendorPayments = createAsyncThunk(
  "vendors/fetchVendorPayments",
  async (
    {
      id,
      params,
    }: {
      id: number
      params: VendorPaymentsRequestParams
    },
    { rejectWithValue }
  ) => {
    try {
      const {
        pageNumber,
        pageSize,
        customerId,
        vendorId,
        agentId,
        postpaidBillId,
        paymentTypeId,
        channel,
        status,
        collectorType,
        paidFromUtc,
        paidToUtc,
        search,
      } = params

      const endpoint = API_ENDPOINTS.VENDORS.VENDOR_PAYMENT.replace("{id}", id.toString())
      const response = await api.get<VendorPaymentsResponse>(buildApiUrl(endpoint), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(customerId !== undefined && { CustomerId: customerId }),
          ...(vendorId !== undefined && { VendorId: vendorId }),
          ...(agentId !== undefined && { AgentId: agentId }),
          ...(postpaidBillId !== undefined && { PostpaidBillId: postpaidBillId }),
          ...(paymentTypeId !== undefined && { PaymentTypeId: paymentTypeId }),
          ...(channel && { Channel: channel }),
          ...(status && { Status: status }),
          ...(collectorType && { CollectorType: collectorType }),
          ...(paidFromUtc && { PaidFromUtc: paidFromUtc }),
          ...(paidToUtc && { PaidToUtc: paidToUtc }),
          ...(search && { Search: search }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch vendor payments")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch vendor payments")
      }
      return rejectWithValue(error.message || "Network error during vendor payments fetch")
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
      state.apiKeyGenerationError = null
      state.changeRequestError = null
      state.changeRequestsError = null
      state.changeRequestsByVendorError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
      state.vendorPaymentsError = null
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

    // Clear API key generation state
    clearApiKeyGeneration: (state) => {
      state.apiKeyGenerationLoading = false
      state.apiKeyGenerationError = null
      state.apiKeyGenerationSuccess = false
      state.generatedApiKey = null
    },

    // Clear change request status
    clearChangeRequestStatus: (state) => {
      state.changeRequestError = null
      state.changeRequestSuccess = false
      state.changeRequestLoading = false
      state.changeRequestResponse = null
    },

    // Clear change requests state
    clearChangeRequests: (state) => {
      state.changeRequests = []
      state.changeRequestsError = null
      state.changeRequestsSuccess = false
      state.changeRequestsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear change requests by vendor state
    clearChangeRequestsByVendor: (state) => {
      state.changeRequestsByVendor = []
      state.changeRequestsByVendorError = null
      state.changeRequestsByVendorSuccess = false
      state.changeRequestsByVendorPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear change request details
    clearChangeRequestDetails: (state) => {
      state.changeRequestDetails = null
      state.changeRequestDetailsError = null
      state.changeRequestDetailsSuccess = false
      state.changeRequestDetailsLoading = false
    },

    // Clear approve change request status
    clearApproveChangeRequestStatus: (state) => {
      state.approveChangeRequestError = null
      state.approveChangeRequestSuccess = false
      state.approveChangeRequestLoading = false
      state.approveChangeRequestResponse = null
    },

    // Clear decline change request status
    clearDeclineChangeRequestStatus: (state) => {
      state.declineChangeRequestError = null
      state.declineChangeRequestSuccess = false
      state.declineChangeRequestLoading = false
      state.declineChangeRequestResponse = null
    },

    // Clear vendor payments state
    clearVendorPayments: (state) => {
      state.vendorPayments = []
      state.vendorPaymentsError = null
      state.vendorPaymentsSuccess = false
      state.vendorPaymentsLoading = false
      state.vendorPaymentsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
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
      state.apiKeyGenerationLoading = false
      state.apiKeyGenerationError = null
      state.apiKeyGenerationSuccess = false
      state.generatedApiKey = null
      state.changeRequestLoading = false
      state.changeRequestError = null
      state.changeRequestSuccess = false
      state.changeRequestResponse = null
      state.changeRequests = []
      state.changeRequestsLoading = false
      state.changeRequestsError = null
      state.changeRequestsSuccess = false
      state.changeRequestsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.changeRequestsByVendor = []
      state.changeRequestsByVendorLoading = false
      state.changeRequestsByVendorError = null
      state.changeRequestsByVendorSuccess = false
      state.changeRequestsByVendorPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.changeRequestDetails = null
      state.changeRequestDetailsLoading = false
      state.changeRequestDetailsError = null
      state.changeRequestDetailsSuccess = false
      state.approveChangeRequestLoading = false
      state.approveChangeRequestError = null
      state.approveChangeRequestSuccess = false
      state.approveChangeRequestResponse = null
      state.declineChangeRequestLoading = false
      state.declineChangeRequestError = null
      state.declineChangeRequestSuccess = false
      state.declineChangeRequestResponse = null
      state.vendorPayments = []
      state.vendorPaymentsLoading = false
      state.vendorPaymentsError = null
      state.vendorPaymentsSuccess = false
      state.vendorPaymentsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set change requests pagination
    setChangeRequestsPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsPagination.currentPage = action.payload.page
      state.changeRequestsPagination.pageSize = action.payload.pageSize
    },

    // Set change requests by vendor pagination
    setChangeRequestsByVendorPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsByVendorPagination.currentPage = action.payload.page
      state.changeRequestsByVendorPagination.pageSize = action.payload.pageSize
    },

    // Set vendor payments pagination
    setVendorPaymentsPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.vendorPaymentsPagination.currentPage = action.payload.page
      state.vendorPaymentsPagination.pageSize = action.payload.pageSize
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

    // Update vendor API key info after generation (optimistic update)
    updateVendorApiKeyInfo: (state, action: PayloadAction<{ apiPublicKey: string; apiKeyIssuedAt: string }>) => {
      if (state.currentVendor) {
        state.currentVendor.apiPublicKey = action.payload.apiPublicKey
        state.currentVendor.apiKeyIssuedAt = action.payload.apiKeyIssuedAt
      }

      // Also update in vendors list if the vendor exists there
      const vendorIndex = state.vendors.findIndex((v) => v.id === state.currentVendor?.id)
      if (vendorIndex !== -1) {
        state.vendors[vendorIndex]!.apiPublicKey = action.payload.apiPublicKey
        state.vendors[vendorIndex]!.apiKeyIssuedAt = action.payload.apiKeyIssuedAt
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
      // Generate API key cases
      .addCase(generateApiKey.pending, (state) => {
        state.apiKeyGenerationLoading = true
        state.apiKeyGenerationError = null
        state.apiKeyGenerationSuccess = false
        state.generatedApiKey = null
      })
      .addCase(generateApiKey.fulfilled, (state, action: PayloadAction<ApiKeyResponse>) => {
        state.apiKeyGenerationLoading = false
        state.apiKeyGenerationSuccess = true
        state.generatedApiKey = action.payload.data
        state.apiKeyGenerationError = null

        // Update current vendor with new API key info
        if (state.currentVendor) {
          state.currentVendor.apiPublicKey = action.payload.data.publicKey
          state.currentVendor.apiKeyIssuedAt = action.payload.data.issuedAt
        }

        // Update vendor in vendors list
        const vendorIndex = state.vendors.findIndex((v) => v.id === state.currentVendor?.id)
        if (vendorIndex !== -1) {
          state.vendors[vendorIndex]!.apiPublicKey = action.payload.data.publicKey
          state.vendors[vendorIndex]!.apiKeyIssuedAt = action.payload.data.issuedAt
        }
      })
      .addCase(generateApiKey.rejected, (state, action) => {
        state.apiKeyGenerationLoading = false
        state.apiKeyGenerationError = (action.payload as string) || "Failed to generate API key"
        state.apiKeyGenerationSuccess = false
        state.generatedApiKey = null
      })
      // Change request cases
      .addCase(submitVendorChangeRequest.pending, (state) => {
        state.changeRequestLoading = true
        state.changeRequestError = null
        state.changeRequestSuccess = false
        state.changeRequestResponse = null
      })
      .addCase(
        submitVendorChangeRequest.fulfilled,
        (
          state,
          action: PayloadAction<{
            vendorId: number
            data: ChangeRequestResponseData
            message: string
          }>
        ) => {
          state.changeRequestLoading = false
          state.changeRequestSuccess = true
          state.changeRequestError = null
          state.changeRequestResponse = action.payload.data
        }
      )
      .addCase(submitVendorChangeRequest.rejected, (state, action) => {
        state.changeRequestLoading = false
        state.changeRequestError = (action.payload as string) || "Failed to submit change request"
        state.changeRequestSuccess = false
        state.changeRequestResponse = null
      })
      // Fetch change requests cases
      .addCase(fetchVendorChangeRequests.pending, (state) => {
        state.changeRequestsLoading = true
        state.changeRequestsError = null
        state.changeRequestsSuccess = false
      })
      .addCase(fetchVendorChangeRequests.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsLoading = false
        state.changeRequestsSuccess = true
        state.changeRequests = action.payload.data
        state.changeRequestsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
        state.changeRequestsError = null
      })
      .addCase(fetchVendorChangeRequests.rejected, (state, action) => {
        state.changeRequestsLoading = false
        state.changeRequestsError = (action.payload as string) || "Failed to fetch change requests"
        state.changeRequestsSuccess = false
        state.changeRequests = []
        state.changeRequestsPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch change requests by vendor ID cases
      .addCase(fetchChangeRequestsByVendorId.pending, (state) => {
        state.changeRequestsByVendorLoading = true
        state.changeRequestsByVendorError = null
        state.changeRequestsByVendorSuccess = false
      })
      .addCase(fetchChangeRequestsByVendorId.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsByVendorLoading = false
        state.changeRequestsByVendorSuccess = true
        state.changeRequestsByVendor = action.payload.data
        state.changeRequestsByVendorPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
        state.changeRequestsByVendorError = null
      })
      .addCase(fetchChangeRequestsByVendorId.rejected, (state, action) => {
        state.changeRequestsByVendorLoading = false
        state.changeRequestsByVendorError = (action.payload as string) || "Failed to fetch change requests for vendor"
        state.changeRequestsByVendorSuccess = false
        state.changeRequestsByVendor = []
        state.changeRequestsByVendorPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch change request details cases
      .addCase(fetchChangeRequestDetails.pending, (state) => {
        state.changeRequestDetailsLoading = true
        state.changeRequestDetailsError = null
        state.changeRequestDetailsSuccess = false
      })
      .addCase(fetchChangeRequestDetails.fulfilled, (state, action: PayloadAction<ChangeRequestDetails>) => {
        state.changeRequestDetailsLoading = false
        state.changeRequestDetailsSuccess = true
        state.changeRequestDetails = action.payload
        state.changeRequestDetailsError = null
      })
      .addCase(fetchChangeRequestDetails.rejected, (state, action) => {
        state.changeRequestDetailsLoading = false
        state.changeRequestDetailsError = (action.payload as string) || "Failed to fetch change request details"
        state.changeRequestDetailsSuccess = false
        state.changeRequestDetails = null
      })
      // Approve change request cases
      .addCase(approveChangeRequest.pending, (state) => {
        state.approveChangeRequestLoading = true
        state.approveChangeRequestError = null
        state.approveChangeRequestSuccess = false
        state.approveChangeRequestResponse = null
      })
      .addCase(
        approveChangeRequest.fulfilled,
        (
          state,
          action: PayloadAction<{
            publicId: string
            data: ChangeRequestResponseData
            message: string
          }>
        ) => {
          state.approveChangeRequestLoading = false
          state.approveChangeRequestSuccess = true
          state.approveChangeRequestError = null
          state.approveChangeRequestResponse = action.payload.data

          // Update the change request in the list if it exists
          const index = state.changeRequests.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (index !== -1) {
            const req = state.changeRequests[index]
            if (req) {
              req.status = 1 // Set status to APPROVED
            }
          }

          // Update the change request in the vendor-specific list if it exists
          const vendorIndex = state.changeRequestsByVendor.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (vendorIndex !== -1) {
            const req = state.changeRequestsByVendor[vendorIndex]
            if (req) {
              req.status = 1 // Set status to APPROVED
            }
          }

          // Update change request details if it's the current one
          if (state.changeRequestDetails && state.changeRequestDetails.publicId === action.payload.publicId) {
            state.changeRequestDetails.status = 1 // Set status to APPROVED
            state.changeRequestDetails.approvalNotes = action.payload.data.approvalNotes
            state.changeRequestDetails.approvedAtUtc = action.payload.data.approvedAtUtc
            state.changeRequestDetails.approvedBy = action.payload.data.approvedBy
          }
        }
      )
      .addCase(approveChangeRequest.rejected, (state, action) => {
        state.approveChangeRequestLoading = false
        state.approveChangeRequestError = (action.payload as string) || "Failed to approve change request"
        state.approveChangeRequestSuccess = false
        state.approveChangeRequestResponse = null
      })
      // Decline change request cases
      .addCase(declineChangeRequest.pending, (state) => {
        state.declineChangeRequestLoading = true
        state.declineChangeRequestError = null
        state.declineChangeRequestSuccess = false
        state.declineChangeRequestResponse = null
      })
      .addCase(
        declineChangeRequest.fulfilled,
        (
          state,
          action: PayloadAction<{
            publicId: string
            data: ChangeRequestResponseData
            message: string
          }>
        ) => {
          state.declineChangeRequestLoading = false
          state.declineChangeRequestSuccess = true
          state.declineChangeRequestError = null
          state.declineChangeRequestResponse = action.payload.data

          // Update the change request in the list if it exists
          const index = state.changeRequests.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (index !== -1) {
            const req = state.changeRequests[index]
            if (req) {
              req.status = 2 // Set status to DECLINED
            }
          }

          // Update the change request in the vendor-specific list if it exists
          const vendorIndex = state.changeRequestsByVendor.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (vendorIndex !== -1) {
            const req = state.changeRequestsByVendor[vendorIndex]
            if (req) {
              req.status = 2 // Set status to DECLINED
            }
          }

          // Update change request details if it's the current one
          if (state.changeRequestDetails && state.changeRequestDetails.publicId === action.payload.publicId) {
            state.changeRequestDetails.status = 2 // Set status to DECLINED
            state.changeRequestDetails.declinedReason = action.payload.data.declinedReason
          }
        }
      )
      .addCase(declineChangeRequest.rejected, (state, action) => {
        state.declineChangeRequestLoading = false
        state.declineChangeRequestError = (action.payload as string) || "Failed to decline change request"
        state.declineChangeRequestSuccess = false
        state.declineChangeRequestResponse = null
      })
      // Fetch vendor payments cases
      .addCase(fetchVendorPayments.pending, (state) => {
        state.vendorPaymentsLoading = true
        state.vendorPaymentsError = null
        state.vendorPaymentsSuccess = false
      })
      .addCase(fetchVendorPayments.fulfilled, (state, action: PayloadAction<VendorPaymentsResponse>) => {
        state.vendorPaymentsLoading = false
        state.vendorPaymentsSuccess = true
        state.vendorPayments = action.payload.data
        state.vendorPaymentsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
        state.vendorPaymentsError = null
      })
      .addCase(fetchVendorPayments.rejected, (state, action) => {
        state.vendorPaymentsLoading = false
        state.vendorPaymentsError = (action.payload as string) || "Failed to fetch vendor payments"
        state.vendorPaymentsSuccess = false
        state.vendorPayments = []
        state.vendorPaymentsPagination = {
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

export const {
  clearVendors,
  clearError,
  clearCurrentVendor,
  clearVendorWallet,
  clearVendorTopUp,
  clearVendorSuspend,
  clearVendorCommissionUpdate,
  clearBulkCreate,
  clearApiKeyGeneration,
  clearChangeRequestStatus,
  clearChangeRequests,
  clearChangeRequestsByVendor,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
  clearVendorPayments,
  resetVendorState,
  setPagination,
  setChangeRequestsPagination,
  setChangeRequestsByVendorPagination,
  setVendorPaymentsPagination,
  updateCurrentVendor,
  updateVendorWallet,
  updateWalletBalanceAfterTopUp,
  updateVendorSuspendStatus,
  updateVendorCommissionOptimistic,
  updateVendorApiKeyInfo,
} = vendorSlice.actions

export default vendorSlice.reducer
