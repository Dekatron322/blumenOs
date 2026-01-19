// src/lib/redux/paymentSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import { CollectorType, PaymentChannel } from "./agentSlice"

// Interfaces for Payment
export interface VirtualAccount {
  accountNumber: string
  bankName: string
  reference: string
  expiresAtUtc: string
}

export interface Token {
  token: string
  tokenDec: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

export interface Collector {
  type: CollectorType
  name: string
  agentId: number | null
  agentCode: string | null
  agentType: string | null
  vendorId: number | null
  vendorName: string | null
  staffName: string | null
  customerId: number | null
  customerName: string | null
}

export interface Payment {
  id: number
  reference: string
  externalReference: string
  channel: PaymentChannel
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  isPending: boolean
  totalAmountPaid: number
  currency: string
  paidAtUtc: string
  customerName: string
  customerAccountNumber: string
  customerAddress: string
  customerPhoneNumber: string
  customerMeterNumber: string
  accountType: string
  tariffRate: number
  units: number
  vatRate: number
  vatAmount: number
  electricityAmount: number
  outstandingDebt: number
  debtPayable: number
  paymentTypeName: string
  collector: Collector
  token?: Token
  // Legacy fields - keeping for backward compatibility
  collectorType?: CollectorType
  amount?: number
  amountApplied?: number
  overPaymentAmount?: number
  outstandingAfterPayment?: number
  outstandingBeforePayment?: number
  confirmedAtUtc?: string
  customerId?: number
  postpaidBillId?: number
  postpaidBillPeriod?: string
  billTotalDue?: number
  vendorId?: number
  vendorName?: string
  agentId?: number
  agentCode?: string
  agentName?: string
  areaOfficeName?: string
  distributionSubstationCode?: string
  feederName?: string
  paymentTypeId?: number
  narrative?: string
  virtualAccount?: VirtualAccount
  vendorAccountId?: string
  recordedByName?: string
}

export interface PaymentTracking {
  id: number
  reference: string
  amount: number
  channel: "Cash" | "Transfer" | "Card" | "POS" | "BankDeposit"
  status: "Pending" | "Processing" | "Completed" | "Failed" | "Cancelled"
  clearanceStatus: "Uncleared" | "Clearing" | "Cleared" | "Suspended"
  isRemitted: boolean
  paidAtUtc: string
  location: string
  agentId: number
  agentName: string
  clearedByUserId: number | null
  clearedByName: string | null
  remittedByUserId: number | null
  remittedByName: string | null
  remittanceId: number | null
  remittanceStatus: string | null
  remittanceDepositedAtUtc: string | null
  remittanceTellerUrl: string | null
  collectionOfficerUserId: number | null
  collectionOfficerName: string | null
}

export interface PaymentResponse {
  isSuccess: boolean
  message: string
  data: Payment
}

export interface PaymentTrackingResponse {
  isSuccess: boolean
  message: string
  data: PaymentTracking
}

export interface PaymentsResponse {
  isSuccess: boolean
  message: string
  data: Payment[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaymentsRequestParams {
  pageNumber: number
  pageSize: number
  customerId?: number
  vendorId?: number
  agentId?: number
  postpaidBillId?: number
  paymentTypeId?: number
  channel?: PaymentChannel
  status?: "Pending" | "Confirmed" | "Failed" | "Reversed"
  collectorType?: CollectorType
  paidFromUtc?: string
  paidToUtc?: string
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Create Payment Request Interface
export interface CreatePaymentRequest {
  postpaidBillId?: number
  customerId?: number
  paymentTypeId: number
  amount: number
  channel: PaymentChannel
  currency: string
  externalReference?: string
  narrative?: string
  paidAtUtc: string
  agentId?: number | null
  vendorId?: number | null
  collectorType: CollectorType
}

// Interfaces for Change Request
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

// Interface for Payment Channels Response
export interface PaymentChannelsResponse {
  isSuccess: boolean
  message: string
  data: string[]
}

// Interface for Cash Holder
export interface CashHolder {
  holderType: string
  holderId: number
  holderName: string
  totalAmount: number
  paymentCount: number
}

// Interface for Cash Holders Response
export interface CashHoldersResponse {
  isSuccess: boolean
  message: string
  data: CashHolder[]
}

// Interface for Cash Holders Request Params
export interface CashHoldersRequestParams {
  startUtc?: string
  endUtc?: string
  order?: string
}

// Interface for Bank
export interface Bank {
  name: string
  additionalProp1: string
  additionalProp2: string
  additionalProp3: string
}

// Interface for Bank Lists Response
export interface BankListsResponse {
  isSuccess: boolean
  message: string
  data: Bank[]
}

// Interface for Bank Lists Request Params
export interface BankListsRequestParams {
  provider?: string
}

// Interfaces for Top Performers
export interface TopPerformerAgent {
  id: number
  name: string
  amount: number
  count: number
}

export interface TopPerformerVendor {
  id: number
  name: string
  amount: number
  count: number
}

export interface TopPerformerWindow {
  window: string
  topAgents: TopPerformerAgent[]
  topVendors: TopPerformerVendor[]
}

export interface TopPerformersData {
  windows: TopPerformerWindow[]
}

export interface TopPerformersResponse {
  isSuccess: boolean
  message: string
  data: TopPerformersData
}

export interface TopPerformersRequest {
  today?: boolean
  thisWeek?: boolean
  thisMonth?: boolean
  thisYear?: boolean
  allTime?: boolean
  areaOfficeId?: number
  serviceCenterId?: number
  distributionSubstationId?: number
  feederId?: number
}

// Interface for Confirm Payment Request
export interface ConfirmPaymentRequest {
  amount: number
  externalReference: string
  confirmedAtUtc: string
  narrative: string
  skipRecovery: boolean
}

// Payment State
interface PaymentState {
  // Payments list state
  payments: Payment[]
  loading: boolean
  error: string | null
  success: boolean

  // Single payment state
  currentPayment: Payment | null
  currentPaymentLoading: boolean
  currentPaymentError: string | null
  currentPaymentSuccess: boolean

  // Create payment state
  createPaymentLoading: boolean
  createPaymentError: string | null
  createPaymentSuccess: boolean
  createdPayment: Payment | null

  // Pagination state
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

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

  // Change Requests By Payment ID state
  changeRequestsByPayment: ChangeRequestListItem[]
  changeRequestsByPaymentLoading: boolean
  changeRequestsByPaymentError: string | null
  changeRequestsByPaymentSuccess: boolean
  changeRequestsByPaymentPagination: {
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

  // Payment Channels state
  paymentChannels: string[]
  paymentChannelsLoading: boolean
  paymentChannelsError: string | null
  paymentChannelsSuccess: boolean

  // Payment Tracking state
  paymentTracking: PaymentTracking | null
  paymentTrackingLoading: boolean
  paymentTrackingError: string | null
  paymentTrackingSuccess: boolean

  // Cash Holders state
  cashHolders: CashHolder[]
  cashHoldersLoading: boolean
  cashHoldersError: string | null
  cashHoldersSuccess: boolean

  // Top Performers state
  topPerformers: TopPerformersData | null
  topPerformersLoading: boolean
  topPerformersError: string | null
  topPerformersSuccess: boolean

  // Confirm Payment state
  confirmPaymentLoading: boolean
  confirmPaymentError: string | null
  confirmPaymentSuccess: boolean
  confirmedPayment: Payment | null

  // Bank Lists state
  bankLists: Bank[]
  bankListsLoading: boolean
  bankListsError: string | null
  bankListsSuccess: boolean
}

// Initial state
const initialState: PaymentState = {
  payments: [],
  loading: false,
  error: null,
  success: false,

  currentPayment: null,
  currentPaymentLoading: false,
  currentPaymentError: null,
  currentPaymentSuccess: false,

  createPaymentLoading: false,
  createPaymentError: null,
  createPaymentSuccess: false,
  createdPayment: null,

  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },

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

  changeRequestsByPayment: [],
  changeRequestsByPaymentLoading: false,
  changeRequestsByPaymentError: null,
  changeRequestsByPaymentSuccess: false,
  changeRequestsByPaymentPagination: {
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

  // Payment Channels
  paymentChannels: [],
  paymentChannelsLoading: false,
  paymentChannelsError: null,
  paymentChannelsSuccess: false,

  // Payment Tracking
  paymentTracking: null,
  paymentTrackingLoading: false,
  paymentTrackingError: null,
  paymentTrackingSuccess: false,

  // Cash Holders
  cashHolders: [],
  cashHoldersLoading: false,
  cashHoldersError: null,
  cashHoldersSuccess: false,

  // Top Performers
  topPerformers: null,
  topPerformersLoading: false,
  topPerformersError: null,
  topPerformersSuccess: false,

  // Confirm Payment
  confirmPaymentLoading: false,
  confirmPaymentError: null,
  confirmPaymentSuccess: false,
  confirmedPayment: null,

  // Bank Lists
  bankLists: [],
  bankListsLoading: false,
  bankListsError: null,
  bankListsSuccess: false,
}

// Async thunk for fetching payments
export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (params: PaymentsRequestParams, { rejectWithValue }) => {
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
        sortBy,
        sortOrder,
      } = params

      const response = await api.get<PaymentsResponse>(buildApiUrl(API_ENDPOINTS.PAYMENTS.GET), {
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
          ...(sortBy && { SortBy: sortBy }),
          ...(sortOrder && { SortOrder: sortOrder }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payments")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payments")
      }
      return rejectWithValue(error.message || "Network error during payments fetch")
    }
  }
)

// Async thunk for fetching payment by ID
export const fetchPaymentById = createAsyncThunk(
  "payments/fetchPaymentById",
  async (paymentId: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.PAYMENTS.GET_BY_ID).replace("{id}", paymentId.toString())

      const response = await api.get<PaymentResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payment")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payment")
      }
      return rejectWithValue(error.message || "Network error during payment fetch")
    }
  }
)

// Async thunk for creating a new payment
export const createPayment = createAsyncThunk(
  "payments/createPayment",
  async (paymentData: CreatePaymentRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<PaymentResponse>(buildApiUrl(API_ENDPOINTS.PAYMENTS.ADD), paymentData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create payment")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create payment")
      }
      return rejectWithValue(error.message || "Network error during payment creation")
    }
  }
)

// Change Request Async Thunks
export const submitChangeRequest = createAsyncThunk(
  "payments/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.PAYMENTS.CHANGE_REQUEST.replace("{id}", id.toString())
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request response data not found")
      }

      return {
        paymentId: id,
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

export const fetchChangeRequests = createAsyncThunk(
  "payments/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const response = await api.get<ChangeRequestsResponse>(buildApiUrl(API_ENDPOINTS.PAYMENTS.VIEW_CHANGE_REQUEST), {
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

export const fetchChangeRequestsByPaymentId = createAsyncThunk(
  "payments/fetchChangeRequestsByPaymentId",
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

      const endpoint = API_ENDPOINTS.PAYMENTS.CHANGE_REQUESTS_BY_ID.replace("{id}", id.toString())
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
        return rejectWithValue(response.data.message || "Failed to fetch change requests for payment")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests for payment")
      }
      return rejectWithValue(error.message || "Network error during payment change requests fetch")
    }
  }
)

export const fetchChangeRequestDetails = createAsyncThunk(
  "payments/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.PAYMENTS.CHANGE_REQUEST_DETAILS.replace("{identifier}", identifier)
      const response = await api.get<ChangeRequestDetailsResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change request details")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request details not found")
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
  "payments/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.PAYMENTS.APPROVE_CHANGE_REQUEST.replace("{publicId}", publicId)
      const requestBody: ApproveChangeRequestRequest = {}

      if (notes) {
        requestBody.notes = notes
      }

      const response = await api.post<ApproveChangeRequestResponse>(buildApiUrl(endpoint), requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to approve change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Approved change request data not found")
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
  "payments/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.PAYMENTS.DECLINE_CHANGE_REQUEST.replace("{publicId}", publicId)
      const requestBody: DeclineChangeRequestRequest = {
        reason: reason,
      }

      const response = await api.post<DeclineChangeRequestResponse>(buildApiUrl(endpoint), requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to decline change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Declined change request data not found")
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

// Async thunk for fetching payment channels
export const fetchPaymentChannels = createAsyncThunk(
  "payments/fetchPaymentChannels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<PaymentChannelsResponse>(buildApiUrl(API_ENDPOINTS.PAYMENTS.PAYMENT_CHANNELS))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payment channels")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payment channels")
      }
      return rejectWithValue(error.message || "Network error during payment channels fetch")
    }
  }
)

// Async thunk for fetching payment tracking
export const fetchPaymentTracking = createAsyncThunk(
  "payments/fetchPaymentTracking",
  async (id: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.PAYMENTS.TRACK_PAYMENT.replace("{id}", id.toString()))
      const response = await api.get<PaymentTrackingResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payment tracking")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payment tracking")
      }
      return rejectWithValue(error.message || "Network error during payment tracking fetch")
    }
  }
)

// Async thunk for fetching cash holders
export const fetchCashHolders = createAsyncThunk(
  "payments/fetchCashHolders",
  async (params: CashHoldersRequestParams, { rejectWithValue }) => {
    try {
      const { startUtc, endUtc, order } = params

      const response = await api.get<CashHoldersResponse>(buildApiUrl(API_ENDPOINTS.PAYMENTS.CASH_HOLDERS), {
        params: {
          ...(startUtc && { startUtc }),
          ...(endUtc && { endUtc }),
          ...(order && { order }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch cash holders")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch cash holders")
      }
      return rejectWithValue(error.message || "Network error during cash holders fetch")
    }
  }
)

// Async thunk for fetching top performers
export const fetchTopPerformers = createAsyncThunk(
  "payments/fetchTopPerformers",
  async (requestData: TopPerformersRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<TopPerformersResponse>(
        buildApiUrl(API_ENDPOINTS.PAYMENTS.TOP_PERFORMERS),
        requestData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch top performers")
      }

      if (!response.data.data) {
        return rejectWithValue("Top performers data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch top performers")
      }
      return rejectWithValue(error.message || "Network error during top performers fetch")
    }
  }
)

// Async thunk for confirming payment
export const confirmPayment = createAsyncThunk(
  "payments/confirmPayment",
  async ({ id, confirmData }: { id: number; confirmData: ConfirmPaymentRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.PAYMENTS.CONFIRM.replace("{id}", id.toString())
      const response = await api.post<PaymentResponse>(buildApiUrl(endpoint), confirmData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to confirm payment")
      }

      if (!response.data.data) {
        return rejectWithValue("Confirmed payment data not found")
      }

      return {
        paymentId: id,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to confirm payment")
      }
      return rejectWithValue(error.message || "Network error during payment confirmation")
    }
  }
)

// Async thunk for fetching bank lists
export const fetchBankLists = createAsyncThunk("payments/fetchBankLists", async (params?: BankListsRequestParams) => {
  try {
    const { provider } = params || {}

    const response = await api.get<BankListsResponse>(buildApiUrl(API_ENDPOINTS.PAYMENTS.BANK_LISTS), {
      params: {
        ...(provider && { provider }),
      },
    })

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch bank lists")
    }

    return response.data.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch bank lists")
    }
    return rejectWithValue(error.message || "Network error during bank lists fetch")
  }
})

// Payment slice
const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    // Clear payments state
    clearPayments: (state) => {
      state.payments = []
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

    // Clear current payment state
    clearCurrentPayment: (state) => {
      state.currentPayment = null
      state.currentPaymentError = null
      state.currentPaymentSuccess = false
      state.currentPaymentLoading = false
    },

    // Clear create payment state
    clearCreatePayment: (state) => {
      state.createPaymentLoading = false
      state.createPaymentError = null
      state.createPaymentSuccess = false
      state.createdPayment = null
    },

    // Clear errors
    clearError: (state) => {
      state.error = null
      state.currentPaymentError = null
      state.createPaymentError = null
      state.changeRequestError = null
      state.changeRequestsError = null
      state.changeRequestsByPaymentError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
      state.topPerformersError = null
      state.confirmPaymentError = null
      state.bankListsError = null
    },

    // Reset payment state
    resetPaymentState: (state) => {
      state.payments = []
      state.loading = false
      state.error = null
      state.success = false
      state.currentPayment = null
      state.currentPaymentLoading = false
      state.currentPaymentError = null
      state.currentPaymentSuccess = false
      state.createPaymentLoading = false
      state.createPaymentError = null
      state.createPaymentSuccess = false
      state.createdPayment = null
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
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
      state.changeRequestsByPayment = []
      state.changeRequestsByPaymentLoading = false
      state.changeRequestsByPaymentError = null
      state.changeRequestsByPaymentSuccess = false
      state.changeRequestsByPaymentPagination = {
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
      state.paymentChannels = []
      state.paymentChannelsLoading = false
      state.paymentChannelsError = null
      state.paymentChannelsSuccess = false
      state.paymentTracking = null
      state.paymentTrackingLoading = false
      state.paymentTrackingError = null
      state.paymentTrackingSuccess = false
      state.cashHolders = []
      state.cashHoldersLoading = false
      state.cashHoldersError = null
      state.cashHoldersSuccess = false
      state.topPerformers = null
      state.topPerformersLoading = false
      state.topPerformersError = null
      state.topPerformersSuccess = false

      // Confirm Payment
      state.confirmPaymentLoading = false
      state.confirmPaymentError = null
      state.confirmPaymentSuccess = false
      state.confirmedPayment = null
    },

    // Clear payment tracking state
    clearPaymentTracking: (state) => {
      state.paymentTracking = null
      state.paymentTrackingLoading = false
      state.paymentTrackingError = null
      state.paymentTrackingSuccess = false
    },

    // Clear cash holders state
    clearCashHolders: (state) => {
      state.cashHolders = []
      state.cashHoldersLoading = false
      state.cashHoldersError = null
      state.cashHoldersSuccess = false
    },

    // Clear top performers state
    clearTopPerformers: (state) => {
      state.topPerformers = null
      state.topPerformersLoading = false
      state.topPerformersError = null
      state.topPerformersSuccess = false
    },

    // Clear confirm payment state
    clearConfirmPayment: (state) => {
      state.confirmPaymentLoading = false
      state.confirmPaymentError = null
      state.confirmPaymentSuccess = false
      state.confirmedPayment = null
    },

    // Clear bank lists state
    clearBankLists: (state) => {
      state.bankListsLoading = false
      state.bankListsError = null
      state.bankListsSuccess = false
      state.bankLists = []
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

    // Set change requests by payment pagination
    setChangeRequestsByPaymentPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsByPaymentPagination.currentPage = action.payload.page
      state.changeRequestsByPaymentPagination.pageSize = action.payload.pageSize
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

    // Clear change requests by payment state
    clearChangeRequestsByPayment: (state) => {
      state.changeRequestsByPayment = []
      state.changeRequestsByPaymentError = null
      state.changeRequestsByPaymentSuccess = false
      state.changeRequestsByPaymentPagination = {
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch payments cases
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<PaymentsResponse>) => {
        state.loading = false
        state.success = true
        state.payments = action.payload.data
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
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch payments"
        state.success = false
        state.payments = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })

      // Fetch payment by ID cases
      .addCase(fetchPaymentById.pending, (state) => {
        state.currentPaymentLoading = true
        state.currentPaymentError = null
        state.currentPaymentSuccess = false
      })
      .addCase(fetchPaymentById.fulfilled, (state, action: PayloadAction<PaymentResponse>) => {
        state.currentPaymentLoading = false
        state.currentPaymentSuccess = true
        state.currentPayment = action.payload.data
        state.currentPaymentError = null
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.currentPaymentLoading = false
        state.currentPaymentError = (action.payload as string) || "Failed to fetch payment"
        state.currentPaymentSuccess = false
        state.currentPayment = null
      })

      // Create payment cases
      .addCase(createPayment.pending, (state) => {
        state.createPaymentLoading = true
        state.createPaymentError = null
        state.createPaymentSuccess = false
        state.createdPayment = null
      })
      .addCase(createPayment.fulfilled, (state, action: PayloadAction<PaymentResponse>) => {
        state.createPaymentLoading = false
        state.createPaymentSuccess = true
        state.createdPayment = action.payload.data
        state.createPaymentError = null

        // Add the new payment to the beginning of the payments list
        state.payments = [action.payload.data, ...state.payments]

        // Update pagination totals
        state.pagination.totalCount += 1
        state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.createPaymentLoading = false
        state.createPaymentError = (action.payload as string) || "Failed to create payment"
        state.createPaymentSuccess = false
        state.createdPayment = null
      })

      // Change request cases
      .addCase(submitChangeRequest.pending, (state) => {
        state.changeRequestLoading = true
        state.changeRequestError = null
        state.changeRequestSuccess = false
        state.changeRequestResponse = null
      })
      .addCase(
        submitChangeRequest.fulfilled,
        (
          state,
          action: PayloadAction<{
            paymentId: number
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
      .addCase(submitChangeRequest.rejected, (state, action) => {
        state.changeRequestLoading = false
        state.changeRequestError = (action.payload as string) || "Failed to submit change request"
        state.changeRequestSuccess = false
        state.changeRequestResponse = null
      })

      // Fetch change requests cases
      .addCase(fetchChangeRequests.pending, (state) => {
        state.changeRequestsLoading = true
        state.changeRequestsError = null
        state.changeRequestsSuccess = false
      })
      .addCase(fetchChangeRequests.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsLoading = false
        state.changeRequestsSuccess = true
        state.changeRequests = action.payload.data || []
        state.changeRequestsPagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.changeRequestsError = null
      })
      .addCase(fetchChangeRequests.rejected, (state, action) => {
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

      // Fetch change requests by payment ID cases
      .addCase(fetchChangeRequestsByPaymentId.pending, (state) => {
        state.changeRequestsByPaymentLoading = true
        state.changeRequestsByPaymentError = null
        state.changeRequestsByPaymentSuccess = false
      })
      .addCase(fetchChangeRequestsByPaymentId.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsByPaymentLoading = false
        state.changeRequestsByPaymentSuccess = true
        state.changeRequestsByPayment = action.payload.data || []
        state.changeRequestsByPaymentPagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.changeRequestsByPaymentError = null
      })
      .addCase(fetchChangeRequestsByPaymentId.rejected, (state, action) => {
        state.changeRequestsByPaymentLoading = false
        state.changeRequestsByPaymentError = (action.payload as string) || "Failed to fetch change requests for payment"
        state.changeRequestsByPaymentSuccess = false
        state.changeRequestsByPayment = []
        state.changeRequestsByPaymentPagination = {
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

          // Update the change request in the payment-specific list if it exists
          const paymentIndex = state.changeRequestsByPayment.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (paymentIndex !== -1) {
            const req = state.changeRequestsByPayment[paymentIndex]
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

          // Update the change request in the payment-specific list if it exists
          const paymentIndex = state.changeRequestsByPayment.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (paymentIndex !== -1) {
            const req = state.changeRequestsByPayment[paymentIndex]
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

      // Fetch payment channels cases
      .addCase(fetchPaymentChannels.pending, (state) => {
        state.paymentChannelsLoading = true
        state.paymentChannelsError = null
        state.paymentChannelsSuccess = false
      })
      .addCase(fetchPaymentChannels.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.paymentChannelsLoading = false
        state.paymentChannelsSuccess = true
        state.paymentChannelsError = null
        state.paymentChannels = action.payload
      })
      .addCase(fetchPaymentChannels.rejected, (state, action) => {
        state.paymentChannelsLoading = false
        state.paymentChannelsError = (action.payload as string) || "Failed to fetch payment channels"
        state.paymentChannelsSuccess = false
        state.paymentChannels = []
      })

      // Payment Tracking reducers
      .addCase(fetchPaymentTracking.pending, (state) => {
        state.paymentTrackingLoading = true
        state.paymentTrackingError = null
        state.paymentTrackingSuccess = false
      })
      .addCase(fetchPaymentTracking.fulfilled, (state, action) => {
        state.paymentTrackingLoading = false
        state.paymentTrackingSuccess = true
        state.paymentTrackingError = null
        state.paymentTracking = action.payload
      })
      .addCase(fetchPaymentTracking.rejected, (state, action) => {
        state.paymentTrackingLoading = false
        state.paymentTrackingError = (action.payload as string) || "Failed to fetch payment tracking"
        state.paymentTrackingSuccess = false
        state.paymentTracking = null
      })

      // Fetch cash holders cases
      .addCase(fetchCashHolders.pending, (state) => {
        state.cashHoldersLoading = true
        state.cashHoldersError = null
        state.cashHoldersSuccess = false
      })
      .addCase(fetchCashHolders.fulfilled, (state, action: PayloadAction<CashHolder[]>) => {
        state.cashHoldersLoading = false
        state.cashHoldersSuccess = true
        state.cashHoldersError = null
        state.cashHolders = action.payload
      })
      .addCase(fetchCashHolders.rejected, (state, action) => {
        state.cashHoldersLoading = false
        state.cashHoldersError = (action.payload as string) || "Failed to fetch cash holders"
        state.cashHoldersSuccess = false
        state.cashHolders = []
      })

      // Fetch top performers cases
      .addCase(fetchTopPerformers.pending, (state) => {
        state.topPerformersLoading = true
        state.topPerformersError = null
        state.topPerformersSuccess = false
      })
      .addCase(fetchTopPerformers.fulfilled, (state, action: PayloadAction<TopPerformersData>) => {
        state.topPerformersLoading = false
        state.topPerformersSuccess = true
        state.topPerformersError = null
        state.topPerformers = action.payload
      })
      .addCase(fetchTopPerformers.rejected, (state, action) => {
        state.topPerformersLoading = false
        state.topPerformersError = (action.payload as string) || "Failed to fetch top performers"
        state.topPerformersSuccess = false
        state.topPerformers = null
      })

      // Confirm payment cases
      .addCase(confirmPayment.pending, (state) => {
        state.confirmPaymentLoading = true
        state.confirmPaymentError = null
        state.confirmPaymentSuccess = false
        state.confirmedPayment = null
      })
      .addCase(
        confirmPayment.fulfilled,
        (
          state,
          action: PayloadAction<{
            paymentId: number
            data: Payment
            message: string
          }>
        ) => {
          state.confirmPaymentLoading = false
          state.confirmPaymentSuccess = true
          state.confirmPaymentError = null
          state.confirmedPayment = action.payload.data

          // Update the payment in the payments list if it exists
          const index = state.payments.findIndex((p) => p.id === action.payload.paymentId)
          if (index !== -1) {
            state.payments[index] = action.payload.data
          }

          // Update the current payment if it's the same one
          if (state.currentPayment && state.currentPayment.id === action.payload.paymentId) {
            state.currentPayment = action.payload.data
          }
        }
      )
      .addCase(confirmPayment.rejected, (state, action) => {
        state.confirmPaymentLoading = false
        state.confirmPaymentError = (action.payload as string) || "Failed to confirm payment"
        state.confirmPaymentSuccess = false
        state.confirmedPayment = null
      })

      // Fetch bank lists cases
      .addCase(fetchBankLists.pending, (state) => {
        state.bankListsLoading = true
        state.bankListsError = null
        state.bankListsSuccess = false
      })
      .addCase(fetchBankLists.fulfilled, (state, action: PayloadAction<Bank[]>) => {
        state.bankListsLoading = false
        state.bankListsSuccess = true
        state.bankListsError = null
        state.bankLists = action.payload
      })
      .addCase(fetchBankLists.rejected, (state, action) => {
        state.bankListsLoading = false
        state.bankListsError = (action.payload as string) || "Failed to fetch bank lists"
        state.bankListsSuccess = false
        state.bankLists = []
      })
  },
})

export const {
  clearPayments,
  clearCurrentPayment,
  clearCreatePayment,
  clearError,
  resetPaymentState,
  setPagination,
  setChangeRequestsPagination,
  setChangeRequestsByPaymentPagination,
  clearChangeRequestStatus,
  clearChangeRequests,
  clearChangeRequestsByPayment,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
  clearPaymentTracking,
  clearCashHolders,
  clearTopPerformers,
  clearConfirmPayment,
  clearBankLists,
} = paymentSlice.actions

export default paymentSlice.reducer
function rejectWithValue(arg0: string): any {
  throw new Error("Function not implemented.")
}
