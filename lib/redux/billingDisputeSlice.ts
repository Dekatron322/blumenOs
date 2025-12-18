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

// Change request data in update response
export interface ChangeRequestData {
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

// Request body for updating dispute status
export interface UpdateDisputeStatusRequest {
  status: number
  resolutionNotes: string
}

// Parameters for updating dispute status
export interface UpdateDisputeStatusParams {
  id: number
  request: UpdateDisputeStatusRequest
}

// Response data for update dispute status
export interface UpdateDisputeStatusResponseData {
  dispute: BillingDisputeData
  changeRequest: ChangeRequestData
  isApplied: boolean
}

// API response wrapper for update dispute status
export interface UpdateDisputeStatusResponse {
  isSuccess: boolean
  message: string
  data: UpdateDisputeStatusResponseData
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

// =========== CHANGE REQUEST INTERFACES ===========

// Change request item
export interface ChangeRequestItem {
  path: string
  value: string
}

// Change request dispute
export interface ChangeRequestDispute {
  type: number
  disputeId: number
}

// Change request preconditions
export interface ChangeRequestPreconditions {
  [key: string]: string
}

// Request body for creating change request
export interface CreateChangeRequestRequest {
  changes: ChangeRequestItem[]
  comment: string
  dispute?: ChangeRequestDispute
  preconditions?: ChangeRequestPreconditions
}

// Parameters for creating change request
export interface CreateChangeRequestParams {
  id: number
  request: CreateChangeRequestRequest
}

// Change request response data
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

// API response wrapper for change request
export interface ChangeRequestResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestResponseData
}

// Change request list item (for paginated responses)
export interface ChangeRequestListItem {
  id: number
  publicId: string
  reference: string
  status: number
  source?: number
  entityType: number
  entityId: number
  entityLabel: string
  requestedBy: string
  requestedAtUtc: string
}

// Parameters for getting change requests by dispute ID
export interface GetChangeRequestsByDisputeIdParams {
  id: number
  PageNumber: number
  PageSize: number
  Status?: number
  Source?: number
  Reference?: string
  PublicId?: string
}

// Response for change requests by dispute ID
export interface ChangeRequestsByDisputeIdResponse {
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

// Parameters for viewing all change requests
export interface ViewChangeRequestsParams {
  PageNumber: number
  PageSize: number
  Status?: number
  Source?: number
  Reference?: string
  PublicId?: string
}

// Response for viewing all change requests
export interface ViewChangeRequestsResponse {
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

// Parameters for getting change request details
export interface GetChangeRequestDetailsParams {
  identifier: string
}

// Response for change request details
export interface ChangeRequestDetailsResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestResponseData
}

// Request body for approving change request
export interface ApproveChangeRequestRequest {
  notes?: string
}

// Parameters for approving change request
export interface ApproveChangeRequestParams {
  publicId: string
  request: ApproveChangeRequestRequest
}

// Response for approving change request
export interface ApproveChangeRequestResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestResponseData
}

// Request body for declining change request
export interface DeclineChangeRequestRequest {
  reason: string
}

// Parameters for declining change request
export interface DeclineChangeRequestParams {
  publicId: string
  request: DeclineChangeRequestRequest
}

// Response for declining change request
export interface DeclineChangeRequestResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestResponseData
}

// =========== SLICE STATE ===========

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

  // For update dispute status
  updatingDisputeStatus: boolean
  updateDisputeStatusResponse: UpdateDisputeStatusResponseData | null
  updateDisputeStatusError: string | null
  updateDisputeStatusSuccess: boolean

  // For create change request
  creatingChangeRequest: boolean
  changeRequestError: string | null
  changeRequestSuccess: boolean
  changeRequestResponse: ChangeRequestResponseData | null

  // For get change requests by dispute ID
  loadingChangeRequestsByDisputeId: boolean
  changeRequestsByDisputeId: ChangeRequestListItem[]
  changeRequestsByDisputeIdError: string | null
  changeRequestsByDisputeIdTotalCount: number
  changeRequestsByDisputeIdTotalPages: number
  changeRequestsByDisputeIdCurrentPage: number
  changeRequestsByDisputeIdPageSize: number
  changeRequestsByDisputeIdHasNext: boolean
  changeRequestsByDisputeIdHasPrevious: boolean

  // For view change requests
  loadingViewChangeRequests: boolean
  viewChangeRequests: ChangeRequestListItem[]
  viewChangeRequestsError: string | null
  viewChangeRequestsTotalCount: number
  viewChangeRequestsTotalPages: number
  viewChangeRequestsCurrentPage: number
  viewChangeRequestsPageSize: number
  viewChangeRequestsHasNext: boolean
  viewChangeRequestsHasPrevious: boolean

  // For change request details
  loadingChangeRequestDetails: boolean
  changeRequestDetails: ChangeRequestResponseData | null
  changeRequestDetailsError: string | null

  // For approve change request
  approvingChangeRequest: boolean
  approveChangeRequestError: string | null
  approveChangeRequestSuccess: boolean
  approveChangeRequestResponse: ChangeRequestResponseData | null

  // For decline change request
  decliningChangeRequest: boolean
  declineChangeRequestError: string | null
  declineChangeRequestSuccess: boolean
  declineChangeRequestResponse: ChangeRequestResponseData | null
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

  // For update dispute status
  updatingDisputeStatus: false,
  updateDisputeStatusResponse: null,
  updateDisputeStatusError: null,
  updateDisputeStatusSuccess: false,

  // For create change request
  creatingChangeRequest: false,
  changeRequestError: null,
  changeRequestSuccess: false,
  changeRequestResponse: null,

  // For get change requests by dispute ID
  loadingChangeRequestsByDisputeId: false,
  changeRequestsByDisputeId: [],
  changeRequestsByDisputeIdError: null,
  changeRequestsByDisputeIdTotalCount: 0,
  changeRequestsByDisputeIdTotalPages: 0,
  changeRequestsByDisputeIdCurrentPage: 0,
  changeRequestsByDisputeIdPageSize: 0,
  changeRequestsByDisputeIdHasNext: false,
  changeRequestsByDisputeIdHasPrevious: false,

  // For view change requests
  loadingViewChangeRequests: false,
  viewChangeRequests: [],
  viewChangeRequestsError: null,
  viewChangeRequestsTotalCount: 0,
  viewChangeRequestsTotalPages: 0,
  viewChangeRequestsCurrentPage: 0,
  viewChangeRequestsPageSize: 0,
  viewChangeRequestsHasNext: false,
  viewChangeRequestsHasPrevious: false,

  // For change request details
  loadingChangeRequestDetails: false,
  changeRequestDetails: null,
  changeRequestDetailsError: null,

  // For approve change request
  approvingChangeRequest: false,
  approveChangeRequestError: null,
  approveChangeRequestSuccess: false,
  approveChangeRequestResponse: null,

  // For decline change request
  decliningChangeRequest: false,
  declineChangeRequestError: null,
  declineChangeRequestSuccess: false,
  declineChangeRequestResponse: null,
}

// =========== THUNKS ===========

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

// Thunk for updating dispute status
export const updateDisputeStatus = createAsyncThunk(
  "billingDispute/updateDisputeStatus",
  async (params: UpdateDisputeStatusParams, { rejectWithValue }) => {
    try {
      // Build the endpoint by replacing the {id} path parameter
      const endpoint = API_ENDPOINTS.BILLING_DISPUTE.UPDATE_DISPUTE.replace("{id}", params.id.toString())

      const response = await api.patch<UpdateDisputeStatusResponse>(buildApiUrl(endpoint), params.request)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update dispute status")
      }

      if (!response.data.data) {
        return rejectWithValue("Update dispute status data not found")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update dispute status")
      }
      return rejectWithValue(error.message || "Network error while updating dispute status")
    }
  }
)

// Thunk for creating a change request
export const createChangeRequest = createAsyncThunk(
  "billingDispute/createChangeRequest",
  async (params: CreateChangeRequestParams, { rejectWithValue }) => {
    try {
      // Build the endpoint by replacing the {id} path parameter
      const endpoint = API_ENDPOINTS.BILLING_DISPUTE.CHANGE_REQUEST.replace("{id}", params.id.toString())

      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), params.request)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request data not found")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create change request")
      }
      return rejectWithValue(error.message || "Network error while creating change request")
    }
  }
)

// Thunk for getting change requests by dispute ID
export const getChangeRequestsByDisputeId = createAsyncThunk(
  "billingDispute/getChangeRequestsByDisputeId",
  async (params: GetChangeRequestsByDisputeIdParams, { rejectWithValue }) => {
    try {
      // Build the endpoint by replacing the {id} path parameter
      const endpoint = API_ENDPOINTS.BILLING_DISPUTE.CHANGE_REQUESTS_BY_ID.replace("{id}", params.id.toString())

      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.Status !== undefined) {
        queryParams.append("Status", params.Status.toString())
      }
      if (params.Source !== undefined) {
        queryParams.append("Source", params.Source.toString())
      }
      if (params.Reference) {
        queryParams.append("Reference", params.Reference)
      }
      if (params.PublicId) {
        queryParams.append("PublicId", params.PublicId)
      }

      const response = await api.get<ChangeRequestsByDisputeIdResponse>(
        `${buildApiUrl(endpoint)}?${queryParams.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change requests")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests")
      }
      return rejectWithValue(error.message || "Network error while fetching change requests")
    }
  }
)

// Thunk for viewing all change requests
export const viewChangeRequests = createAsyncThunk(
  "billingDispute/viewChangeRequests",
  async (params: ViewChangeRequestsParams, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.Status !== undefined) {
        queryParams.append("Status", params.Status.toString())
      }
      if (params.Source !== undefined) {
        queryParams.append("Source", params.Source.toString())
      }
      if (params.Reference) {
        queryParams.append("Reference", params.Reference)
      }
      if (params.PublicId) {
        queryParams.append("PublicId", params.PublicId)
      }

      const response = await api.get<ViewChangeRequestsResponse>(
        `${buildApiUrl(API_ENDPOINTS.BILLING_DISPUTE.VIEW_CHANGE_REQUEST)}?${queryParams.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change requests")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests")
      }
      return rejectWithValue(error.message || "Network error while fetching change requests")
    }
  }
)

// Thunk for getting change request details
export const getChangeRequestDetails = createAsyncThunk(
  "billingDispute/getChangeRequestDetails",
  async (params: GetChangeRequestDetailsParams, { rejectWithValue }) => {
    try {
      // Build the endpoint by replacing the {identifier} path parameter
      const endpoint = API_ENDPOINTS.BILLING_DISPUTE.CHANGE_REQUEST_DETAILS.replace("{identifier}", params.identifier)

      const response = await api.get<ChangeRequestDetailsResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change request details")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request details not found")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change request details")
      }
      return rejectWithValue(error.message || "Network error while fetching change request details")
    }
  }
)

// Thunk for approving a change request
export const approveChangeRequest = createAsyncThunk(
  "billingDispute/approveChangeRequest",
  async (params: ApproveChangeRequestParams, { rejectWithValue }) => {
    try {
      // Build the endpoint by replacing the {publicId} path parameter
      const endpoint = API_ENDPOINTS.BILLING_DISPUTE.APPROVE_CHANGE_REQUEST.replace("{publicId}", params.publicId)

      const response = await api.post<ApproveChangeRequestResponse>(buildApiUrl(endpoint), params.request)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to approve change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Approved change request data not found")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to approve change request")
      }
      return rejectWithValue(error.message || "Network error while approving change request")
    }
  }
)

// Thunk for declining a change request
export const declineChangeRequest = createAsyncThunk(
  "billingDispute/declineChangeRequest",
  async (params: DeclineChangeRequestParams, { rejectWithValue }) => {
    try {
      // Build the endpoint by replacing the {publicId} path parameter
      const endpoint = API_ENDPOINTS.BILLING_DISPUTE.DECLINE_CHANGE_REQUEST.replace("{publicId}", params.publicId)

      const response = await api.post<DeclineChangeRequestResponse>(buildApiUrl(endpoint), params.request)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to decline change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Declined change request data not found")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to decline change request")
      }
      return rejectWithValue(error.message || "Network error while declining change request")
    }
  }
)

// =========== SLICE ===========

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

      // Clear update dispute status state
      state.updatingDisputeStatus = false
      state.updateDisputeStatusResponse = null
      state.updateDisputeStatusError = null
      state.updateDisputeStatusSuccess = false

      // Clear change request state
      state.creatingChangeRequest = false
      state.changeRequestError = null
      state.changeRequestSuccess = false
      state.changeRequestResponse = null

      // Clear change requests by dispute ID state
      state.loadingChangeRequestsByDisputeId = false
      state.changeRequestsByDisputeId = []
      state.changeRequestsByDisputeIdError = null
      state.changeRequestsByDisputeIdTotalCount = 0
      state.changeRequestsByDisputeIdTotalPages = 0
      state.changeRequestsByDisputeIdCurrentPage = 0
      state.changeRequestsByDisputeIdPageSize = 0
      state.changeRequestsByDisputeIdHasNext = false
      state.changeRequestsByDisputeIdHasPrevious = false

      // Clear view change requests state
      state.loadingViewChangeRequests = false
      state.viewChangeRequests = []
      state.viewChangeRequestsError = null
      state.viewChangeRequestsTotalCount = 0
      state.viewChangeRequestsTotalPages = 0
      state.viewChangeRequestsCurrentPage = 0
      state.viewChangeRequestsPageSize = 0
      state.viewChangeRequestsHasNext = false
      state.viewChangeRequestsHasPrevious = false

      // Clear change request details state
      state.loadingChangeRequestDetails = false
      state.changeRequestDetails = null
      state.changeRequestDetailsError = null

      // Clear approve change request state
      state.approvingChangeRequest = false
      state.approveChangeRequestError = null
      state.approveChangeRequestSuccess = false
      state.approveChangeRequestResponse = null

      // Clear decline change request state
      state.decliningChangeRequest = false
      state.declineChangeRequestError = null
      state.declineChangeRequestSuccess = false
      state.declineChangeRequestResponse = null
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
    clearUpdateDisputeStatus: (state) => {
      state.updatingDisputeStatus = false
      state.updateDisputeStatusResponse = null
      state.updateDisputeStatusError = null
      state.updateDisputeStatusSuccess = false
    },
    clearUpdateDisputeStatusError: (state) => {
      state.updateDisputeStatusError = null
    },
    clearChangeRequestError: (state) => {
      state.changeRequestError = null
    },
    clearChangeRequestResponse: (state) => {
      state.changeRequestResponse = null
    },
    clearChangeRequestsByDisputeId: (state) => {
      state.loadingChangeRequestsByDisputeId = false
      state.changeRequestsByDisputeId = []
      state.changeRequestsByDisputeIdError = null
      state.changeRequestsByDisputeIdTotalCount = 0
      state.changeRequestsByDisputeIdTotalPages = 0
      state.changeRequestsByDisputeIdCurrentPage = 0
      state.changeRequestsByDisputeIdPageSize = 0
      state.changeRequestsByDisputeIdHasNext = false
      state.changeRequestsByDisputeIdHasPrevious = false
    },
    clearViewChangeRequests: (state) => {
      state.loadingViewChangeRequests = false
      state.viewChangeRequests = []
      state.viewChangeRequestsError = null
      state.viewChangeRequestsTotalCount = 0
      state.viewChangeRequestsTotalPages = 0
      state.viewChangeRequestsCurrentPage = 0
      state.viewChangeRequestsPageSize = 0
      state.viewChangeRequestsHasNext = false
      state.viewChangeRequestsHasPrevious = false
    },
    clearChangeRequestDetails: (state) => {
      state.loadingChangeRequestDetails = false
      state.changeRequestDetails = null
      state.changeRequestDetailsError = null
    },
    clearApproveChangeRequest: (state) => {
      state.approvingChangeRequest = false
      state.approveChangeRequestError = null
      state.approveChangeRequestSuccess = false
      state.approveChangeRequestResponse = null
    },
    clearDeclineChangeRequest: (state) => {
      state.decliningChangeRequest = false
      state.declineChangeRequestError = null
      state.declineChangeRequestSuccess = false
      state.declineChangeRequestResponse = null
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

      // Update dispute status cases
      .addCase(updateDisputeStatus.pending, (state) => {
        state.updatingDisputeStatus = true
        state.updateDisputeStatusError = null
        state.updateDisputeStatusSuccess = false
        state.updateDisputeStatusResponse = null
      })
      .addCase(updateDisputeStatus.fulfilled, (state, action: PayloadAction<UpdateDisputeStatusResponse>) => {
        state.updatingDisputeStatus = false
        state.updateDisputeStatusSuccess = true
        state.updateDisputeStatusResponse = action.payload.data
        state.updateDisputeStatusError = null

        // Update the disputeById if it exists and matches the updated dispute
        if (state.disputeById && state.disputeById.id === action.payload.data.dispute.id) {
          state.disputeById = action.payload.data.dispute
        }

        // Update the dispute in the disputes list if it exists
        const disputeIndex = state.disputes.findIndex((d) => d.id === action.payload.data.dispute.id)
        if (disputeIndex !== -1) {
          state.disputes[disputeIndex] = action.payload.data.dispute
        }
      })
      .addCase(updateDisputeStatus.rejected, (state, action) => {
        state.updatingDisputeStatus = false
        state.updateDisputeStatusSuccess = false
        state.updateDisputeStatusResponse = null
        state.updateDisputeStatusError = (action.payload as string) || "Failed to update dispute status"
      })

      // Create change request cases
      .addCase(createChangeRequest.pending, (state) => {
        state.creatingChangeRequest = true
        state.changeRequestError = null
        state.changeRequestSuccess = false
        state.changeRequestResponse = null
      })
      .addCase(createChangeRequest.fulfilled, (state, action: PayloadAction<ChangeRequestResponse>) => {
        state.creatingChangeRequest = false
        state.changeRequestSuccess = true
        state.changeRequestResponse = action.payload.data
        state.changeRequestError = null
      })
      .addCase(createChangeRequest.rejected, (state, action) => {
        state.creatingChangeRequest = false
        state.changeRequestSuccess = false
        state.changeRequestResponse = null
        state.changeRequestError = (action.payload as string) || "Failed to create change request"
      })

      // Get change requests by dispute ID cases
      .addCase(getChangeRequestsByDisputeId.pending, (state) => {
        state.loadingChangeRequestsByDisputeId = true
        state.changeRequestsByDisputeIdError = null
      })
      .addCase(
        getChangeRequestsByDisputeId.fulfilled,
        (state, action: PayloadAction<ChangeRequestsByDisputeIdResponse>) => {
          state.loadingChangeRequestsByDisputeId = false
          state.changeRequestsByDisputeId = action.payload.data || []
          state.changeRequestsByDisputeIdTotalCount = action.payload.totalCount || 0
          state.changeRequestsByDisputeIdTotalPages = action.payload.totalPages || 0
          state.changeRequestsByDisputeIdCurrentPage = action.payload.currentPage || 0
          state.changeRequestsByDisputeIdPageSize = action.payload.pageSize || 0
          state.changeRequestsByDisputeIdHasNext = action.payload.hasNext || false
          state.changeRequestsByDisputeIdHasPrevious = action.payload.hasPrevious || false
          state.changeRequestsByDisputeIdError = null
        }
      )
      .addCase(getChangeRequestsByDisputeId.rejected, (state, action) => {
        state.loadingChangeRequestsByDisputeId = false
        state.changeRequestsByDisputeId = []
        state.changeRequestsByDisputeIdTotalCount = 0
        state.changeRequestsByDisputeIdTotalPages = 0
        state.changeRequestsByDisputeIdCurrentPage = 0
        state.changeRequestsByDisputeIdPageSize = 0
        state.changeRequestsByDisputeIdHasNext = false
        state.changeRequestsByDisputeIdHasPrevious = false
        state.changeRequestsByDisputeIdError = (action.payload as string) || "Failed to fetch change requests"
      })

      // View change requests cases
      .addCase(viewChangeRequests.pending, (state) => {
        state.loadingViewChangeRequests = true
        state.viewChangeRequestsError = null
      })
      .addCase(viewChangeRequests.fulfilled, (state, action: PayloadAction<ViewChangeRequestsResponse>) => {
        state.loadingViewChangeRequests = false
        state.viewChangeRequests = action.payload.data || []
        state.viewChangeRequestsTotalCount = action.payload.totalCount || 0
        state.viewChangeRequestsTotalPages = action.payload.totalPages || 0
        state.viewChangeRequestsCurrentPage = action.payload.currentPage || 0
        state.viewChangeRequestsPageSize = action.payload.pageSize || 0
        state.viewChangeRequestsHasNext = action.payload.hasNext || false
        state.viewChangeRequestsHasPrevious = action.payload.hasPrevious || false
        state.viewChangeRequestsError = null
      })
      .addCase(viewChangeRequests.rejected, (state, action) => {
        state.loadingViewChangeRequests = false
        state.viewChangeRequests = []
        state.viewChangeRequestsTotalCount = 0
        state.viewChangeRequestsTotalPages = 0
        state.viewChangeRequestsCurrentPage = 0
        state.viewChangeRequestsPageSize = 0
        state.viewChangeRequestsHasNext = false
        state.viewChangeRequestsHasPrevious = false
        state.viewChangeRequestsError = (action.payload as string) || "Failed to fetch change requests"
      })

      // Get change request details cases
      .addCase(getChangeRequestDetails.pending, (state) => {
        state.loadingChangeRequestDetails = true
        state.changeRequestDetailsError = null
        state.changeRequestDetails = null
      })
      .addCase(getChangeRequestDetails.fulfilled, (state, action: PayloadAction<ChangeRequestDetailsResponse>) => {
        state.loadingChangeRequestDetails = false
        state.changeRequestDetails = action.payload.data
        state.changeRequestDetailsError = null
      })
      .addCase(getChangeRequestDetails.rejected, (state, action) => {
        state.loadingChangeRequestDetails = false
        state.changeRequestDetails = null
        state.changeRequestDetailsError = (action.payload as string) || "Failed to fetch change request details"
      })

      // Approve change request cases
      .addCase(approveChangeRequest.pending, (state) => {
        state.approvingChangeRequest = true
        state.approveChangeRequestError = null
        state.approveChangeRequestSuccess = false
        state.approveChangeRequestResponse = null
      })
      .addCase(approveChangeRequest.fulfilled, (state, action: PayloadAction<ApproveChangeRequestResponse>) => {
        state.approvingChangeRequest = false
        state.approveChangeRequestSuccess = true
        state.approveChangeRequestResponse = action.payload.data
        state.approveChangeRequestError = null

        // Update the change request in the view change requests list
        const viewIndex = state.viewChangeRequests.findIndex((cr) => cr.publicId === action.payload.data.publicId)
        if (viewIndex !== -1) {
          const viewRequest = state.viewChangeRequests[viewIndex]
          if (viewRequest) {
            viewRequest.status = 1 // Set status to APPROVED
          }
        }

        // Update the change request in the dispute-specific list
        const disputeIndex = state.changeRequestsByDisputeId.findIndex(
          (cr) => cr.publicId === action.payload.data.publicId
        )
        if (disputeIndex !== -1) {
          const disputeRequest = state.changeRequestsByDisputeId[disputeIndex]
          if (disputeRequest) {
            disputeRequest.status = 1 // Set status to APPROVED
          }
        }

        // Update change request details if it's the current one
        if (state.changeRequestDetails && state.changeRequestDetails.publicId === action.payload.data.publicId) {
          state.changeRequestDetails.status = 1 // Set status to APPROVED
          state.changeRequestDetails.approvalNotes = action.payload.data.approvalNotes
          state.changeRequestDetails.approvedAtUtc = action.payload.data.approvedAtUtc
          state.changeRequestDetails.approvedBy = action.payload.data.approvedBy
        }
      })
      .addCase(approveChangeRequest.rejected, (state, action) => {
        state.approvingChangeRequest = false
        state.approveChangeRequestSuccess = false
        state.approveChangeRequestResponse = null
        state.approveChangeRequestError = (action.payload as string) || "Failed to approve change request"
      })

      // Decline change request cases
      .addCase(declineChangeRequest.pending, (state) => {
        state.decliningChangeRequest = true
        state.declineChangeRequestError = null
        state.declineChangeRequestSuccess = false
        state.declineChangeRequestResponse = null
      })
      .addCase(declineChangeRequest.fulfilled, (state, action: PayloadAction<DeclineChangeRequestResponse>) => {
        state.decliningChangeRequest = false
        state.declineChangeRequestSuccess = true
        state.declineChangeRequestResponse = action.payload.data
        state.declineChangeRequestError = null

        // Update the change request in the view change requests list
        const viewIndex = state.viewChangeRequests.findIndex((cr) => cr.publicId === action.payload.data.publicId)
        if (viewIndex !== -1) {
          const viewRequest = state.viewChangeRequests[viewIndex]
          if (viewRequest) {
            viewRequest.status = 2 // Set status to DECLINED
          }
        }

        // Update the change request in the dispute-specific list
        const disputeIndex = state.changeRequestsByDisputeId.findIndex(
          (cr) => cr.publicId === action.payload.data.publicId
        )
        if (disputeIndex !== -1) {
          const disputeRequest = state.changeRequestsByDisputeId[disputeIndex]
          if (disputeRequest) {
            disputeRequest.status = 2 // Set status to DECLINED
          }
        }

        // Update change request details if it's the current one
        if (state.changeRequestDetails && state.changeRequestDetails.publicId === action.payload.data.publicId) {
          state.changeRequestDetails.status = 2 // Set status to DECLINED
          state.changeRequestDetails.declinedReason = action.payload.data.declinedReason
        }
      })
      .addCase(declineChangeRequest.rejected, (state, action) => {
        state.decliningChangeRequest = false
        state.declineChangeRequestSuccess = false
        state.declineChangeRequestResponse = null
        state.declineChangeRequestError = (action.payload as string) || "Failed to decline change request"
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
  clearUpdateDisputeStatus,
  clearUpdateDisputeStatusError,
  clearChangeRequestError,
  clearChangeRequestResponse,
  clearChangeRequestsByDisputeId,
  clearViewChangeRequests,
  clearChangeRequestDetails,
  clearApproveChangeRequest,
  clearDeclineChangeRequest,
} = billingDisputeSlice.actions

export default billingDisputeSlice.reducer
