// src/lib/redux/paymentSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import { CollectorType, PaymentChannel } from "./agentSlice"

// Enum for Payment Anomaly Resolution Actions
export enum PaymentAnomalyResolutionAction {
  None = 0,
  Cancel = 1,
  Refund = 2,
  Ignore = 3,
}

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
  status: "Pending" | "Confirmed" | "Failed" | "Reversed" | "Cancelled"
  isPending: boolean
  isPrepaid: boolean
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
  status?: "Pending" | "Confirmed" | "Failed" | "Reversed" | "Cancelled"
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

// Interfaces for Payment Anomalies
export interface PaymentAnomalyItem {
  bucketDate: string
  ruleKey: string
  status: "Open" | "Resolved"
  resolutionAction: PaymentAnomalyResolutionAction
  paymentTypeId: number
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque" | "BankDeposit" | "Vendor" | "Migration"
  collectorType: "Customer" | "SalesRep" | "Vendor" | "Staff" | "Migration"
  totalAmount: number
  totalCount: number
}

export interface PaymentAnomaliesResponse {
  isSuccess: boolean
  message: string
  data: PaymentAnomalyItem[]
}

export interface PaymentAnomaliesRequestParams {
  StartDateUtc?: string
  EndDateUtc?: string
  RuleKey?: string
  Status?: "Open" | "Resolved"
  ResolutionAction?: PaymentAnomalyResolutionAction
  PaymentTypeId?: number
  Channel?:
    | "Cash"
    | "BankTransfer"
    | "Pos"
    | "Card"
    | "VendorWallet"
    | "Chaque"
    | "BankDeposit"
    | "Vendor"
    | "Migration"
  CollectorType?: "Customer" | "SalesRep" | "Vendor" | "Staff" | "Migration"
  agentId?: number
  customerId?: number
  vendorId?: number
}

// Interfaces for All Anomalies
export interface AllAnomalyItem {
  id: number
  paymentId: number
  reference: string
  customerId: number
  customerName: string
  vendorId: number
  agentId: number
  paymentTypeId: number
  paymentTypeName: string
  amount: number
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque" | "BankDeposit" | "Vendor" | "Migration"
  paymentStatus: "Pending" | "Confirmed" | "Failed" | "Reversed" | "Cancelled"
  paidAtUtc: string
  ruleKey: string
  groupKey: string
  score: number
  status: "Open" | "Resolved"
  resolutionAction: PaymentAnomalyResolutionAction
  detectedAtUtc: string
  resolvedAtUtc: string
  resolutionNote: string
  issue: string
}

export interface AllAnomaliesResponse {
  isSuccess: boolean
  message: string
  data: AllAnomalyItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface AllAnomaliesRequestParams {
  pageNumber: number
  pageSize: number
  paymentId?: number
  customerId?: number
  vendorId?: number
  agentId?: number
  paymentTypeId?: number
  channel?:
    | "Cash"
    | "BankTransfer"
    | "Pos"
    | "Card"
    | "VendorWallet"
    | "Chaque"
    | "BankDeposit"
    | "Vendor"
    | "Migration"
  minAmount?: number
  maxAmount?: number
  status?: "Open" | "Resolved"
  resolutionAction?: PaymentAnomalyResolutionAction
  detectedFromUtc?: string
  detectedToUtc?: string
  paidFromUtc?: string
  paidToUtc?: string
  ruleKey?: string
  search?: string
}

// Interface for Resolve Anomaly Request
export interface ResolveAnomalyRequest {
  action: PaymentAnomalyResolutionAction
  note: string
}

// Interface for Resolve Anomaly Response
export interface ResolveAnomalyResponse {
  isSuccess: boolean
  message: string
  data: {
    action: PaymentAnomalyResolutionAction
    note: string
  }
}

// Interface for Export Payments Request
export interface ExportPaymentsRequest {
  fromUtc: string
  toUtc: string
  areaOfficeId?: number
  prepaidOrPostpaid?: string
}

// Interface for Export Payments Response
export interface ExportPaymentsResponse {
  isSuccess: boolean
  message: string
  data: Blob // Direct file response as Blob
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

// Interfaces for Refund Payment
export interface RefundPaymentRequest {
  reference: string
  reason: string
}

export interface RefundReceiptToken {
  token: string
  tokenDec: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

export interface RefundReceiptInner {
  reference: string
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
  totalAmountPaid: number
  currency: string
  channel: PaymentChannel
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  tokens: RefundReceiptToken[]
  serviceCharge: number
  discountBonus: number
}

export interface RefundPaymentDetails {
  reference: string
  checkoutUrl: string
  virtualAccount: VirtualAccount
}

export interface RefundCollector {
  type: string
  name: string
  agentId: number
  agentCode: string
  agentType: "SalesRep" | string
  vendorId: number
  vendorName: string
  staffName: string
  customerId: number
  customerName: string
}

export interface RefundReceipt {
  isPending: boolean
  externalReference: string
  reference: string
  paidAtUtc: string
  customerName: string
  customerAccountNumber: string
  customerAddress: string
  customerPhoneNumber: string
  customerMeterNumber: string
  customerId: number
  accountType: string
  tariffRate: number
  units: number
  vatRate: number
  vatAmount: number
  electricityAmount: number
  outstandingDebt: number
  debtPayable: number
  totalAmountPaid: number
  currency: string
  channel: PaymentChannel
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  paymentTypeName: string
  receipt: RefundReceiptInner
  paymentDetails: RefundPaymentDetails
  collector: RefundCollector
  token: RefundReceiptToken
}

export interface RefundPaymentData {
  originalReference: string
  refundReference: string
  refundCount: number
  refundLimit: number
  receipt: RefundReceipt
}

export interface RefundPaymentResponse {
  isSuccess: boolean
  message: string
  data: RefundPaymentData
}

// Interfaces for VEND Request
export interface VendRequest {
  meterNumber: string
  amount: number
  channel: string
  latitude: number
  longitude: number
  phoneNumber: string
  externalReference: string
  narrative: string
}

// Interfaces for VEND Response
export interface VendToken {
  token: string
  tokenDec: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

// Interfaces for Cancel Payment
export interface CancelPaymentRequest {
  reason: string
}

export interface CancelPaymentToken {
  token: string
  tokenDec: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

export interface CancelPaymentReceipt {
  reference: string
  bankReceiptNo: string
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
  totalAmountPaid: number
  currency: string
  channel: string
  status: string
  tokens: CancelPaymentToken[]
  serviceCharge: number
  discountBonus: number
}

export interface CancelPaymentPaymentDetails {
  reference: string
  checkoutUrl: string
  virtualAccount: {
    accountNumber: string
    bankName: string
    reference: string
    expiresAtUtc: string
  }
}

export interface CancelPaymentCollector {
  type: string
  name: string
  agentId: number
  agentCode: string
  agentType: string
  vendorId: number
  vendorName: string
  staffName: string
  customerId: number
  customerName: string
}

export interface CancelPaymentData {
  isPending: boolean
  externalReference: string
  bankReceiptNo: string
  reference: string
  paidAtUtc: string
  customerName: string
  customerAccountNumber: string
  customerAddress: string
  customerPhoneNumber: string
  customerMeterNumber: string
  customerId: number
  accountType: string
  tariffRate: number
  units: number
  vatRate: number
  vatAmount: number
  electricityAmount: number
  outstandingDebt: number
  debtPayable: number
  totalAmountPaid: number
  currency: string
  channel: string
  status: string
  paymentTypeName: string
  receipt: CancelPaymentReceipt
  paymentDetails: CancelPaymentPaymentDetails
  collector: CancelPaymentCollector
  token: CancelPaymentToken
}

export interface CancelPaymentResponse {
  isSuccess: boolean
  message: string
  data: CancelPaymentData
}

export interface VendReceipt {
  reference: string
  bankReceiptNo: string
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
  totalAmountPaid: number
  currency: string
  channel: string
  status: string
  tokens: VendToken[]
  serviceCharge: number
  discountBonus: number
}

export interface VendPaymentDetails {
  reference: string
  checkoutUrl: string
  virtualAccount: {
    accountNumber: string
    bankName: string
    reference: string
    expiresAtUtc: string
  }
}

export interface VendCollector {
  type: string
  name: string
  agentId: number
  agentCode: string
  agentType: string
  vendorId: number
  vendorName: string
  staffName: string
  customerId: number
  customerName: string
}

export interface VendData {
  isPending: boolean
  externalReference: string
  bankReceiptNo: string
  reference: string
  paidAtUtc: string
  customerName: string
  customerAccountNumber: string
  customerAddress: string
  customerPhoneNumber: string
  customerMeterNumber: string
  customerId: number
  accountType: string
  tariffRate: number
  units: number
  vatRate: number
  vatAmount: number
  electricityAmount: number
  outstandingDebt: number
  debtPayable: number
  totalAmountPaid: number
  currency: string
  channel: string
  status: string
  paymentTypeName: string
  receipt: VendReceipt
  paymentDetails: VendPaymentDetails
  collector: VendCollector
  token: VendToken
}

export interface VendResponse {
  isSuccess: boolean
  message: string
  data: VendData
}

// Interfaces for Cancel Payment by Reference
export interface CancelPaymentByReferenceRequest {
  reason: string
}

export interface CancelPaymentByReferenceResponse {
  isSuccess: boolean
  message: string
  data: CancelPaymentData
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

  // Refund Payment state
  refundPaymentLoading: boolean
  refundPaymentError: string | null
  refundPaymentSuccess: boolean
  refundPaymentData: RefundPaymentData | null

  // VEND state
  vendLoading: boolean
  vendError: string | null
  vendSuccess: boolean
  vendData: VendData | null

  // Cancel Payment state
  cancelPaymentLoading: boolean
  cancelPaymentError: string | null
  cancelPaymentSuccess: boolean
  cancelPaymentData: CancelPaymentData | null

  // Cancel Payment by Reference state
  cancelPaymentByReferenceLoading: boolean
  cancelPaymentByReferenceError: string | null
  cancelPaymentByReferenceSuccess: boolean
  cancelPaymentByReferenceData: CancelPaymentData | null

  // Check Payment by Reference state
  checkPaymentLoading: boolean
  checkPaymentError: string | null
  checkPaymentSuccess: boolean
  checkPaymentData: Payment | null

  // Payment Anomalies state
  paymentAnomalies: PaymentAnomalyItem[]
  paymentAnomaliesLoading: boolean
  paymentAnomaliesError: string | null
  paymentAnomaliesSuccess: boolean

  // All Anomalies state
  allAnomalies: AllAnomalyItem[]
  allAnomaliesLoading: boolean
  allAnomaliesError: string | null
  allAnomaliesSuccess: boolean
  allAnomaliesPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Resolve Anomaly state
  resolveAnomalyLoading: boolean
  resolveAnomalyError: string | null
  resolveAnomalySuccess: boolean

  // Export Payments state
  exportPaymentsLoading: boolean
  exportPaymentsError: string | null
  exportPaymentsSuccess: boolean
  exportPaymentsData: { data: Blob; fileName: string } | null
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

  // Refund Payment
  refundPaymentLoading: false,
  refundPaymentError: null,
  refundPaymentSuccess: false,
  refundPaymentData: null,

  // VEND
  vendLoading: false,
  vendError: null,
  vendSuccess: false,
  vendData: null,

  // Cancel Payment
  cancelPaymentLoading: false,
  cancelPaymentError: null,
  cancelPaymentSuccess: false,
  cancelPaymentData: null,

  // Cancel Payment by Reference
  cancelPaymentByReferenceLoading: false,
  cancelPaymentByReferenceError: null,
  cancelPaymentByReferenceSuccess: false,
  cancelPaymentByReferenceData: null,

  // Check Payment by Reference
  checkPaymentLoading: false,
  checkPaymentError: null,
  checkPaymentSuccess: false,
  checkPaymentData: null,

  // Payment Anomalies
  paymentAnomalies: [],
  paymentAnomaliesLoading: false,
  paymentAnomaliesError: null,
  paymentAnomaliesSuccess: false,

  // All Anomalies
  allAnomalies: [],
  allAnomaliesLoading: false,
  allAnomaliesError: null,
  allAnomaliesSuccess: false,
  allAnomaliesPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },

  // Resolve Anomaly
  resolveAnomalyLoading: false,
  resolveAnomalyError: null,
  resolveAnomalySuccess: false,

  // Export Payments
  exportPaymentsLoading: false,
  exportPaymentsError: null,
  exportPaymentsSuccess: false,
  exportPaymentsData: null,
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

// Async thunk for refunding a prepaid payment
export const refundPayment = createAsyncThunk(
  "payments/refundPayment",
  async ({ refundData }: { refundData: RefundPaymentRequest }, { rejectWithValue }) => {
    try {
      const response = await api.post<RefundPaymentResponse>(buildApiUrl(API_ENDPOINTS.PAYMENTS.REFUND), refundData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to refund payment")
      }

      if (!response.data.data) {
        return rejectWithValue("Refund payment data not found")
      }

      return {
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to refund payment")
      }
      return rejectWithValue(error.message || "Network error during payment refund")
    }
  }
)

// Async thunk for admin vend
export const adminVend = createAsyncThunk("payments/adminVend", async (vendData: VendRequest, { rejectWithValue }) => {
  try {
    const response = await api.post<VendResponse>(buildApiUrl(API_ENDPOINTS.PAYMENTS.VEND), vendData)

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to vend")
    }

    if (!response.data.data) {
      return rejectWithValue("Vend data not found")
    }

    return {
      data: response.data.data,
      message: response.data.message,
    }
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to vend")
    }
    return rejectWithValue(error.message || "Network error during vend")
  }
})

// Async thunk for canceling payment
export const cancelPayment = createAsyncThunk(
  "payments/cancelPayment",
  async ({ id, cancelData }: { id: number; cancelData: CancelPaymentRequest }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Payment ID is required")
      }

      const endpoint = API_ENDPOINTS.PAYMENTS.PAYMENT_CANCEL.replace("{id}", id.toString())
      console.log("Cancelling payment with endpoint:", endpoint)
      console.log("Cancel data:", cancelData)

      const response = await api.post<CancelPaymentResponse>(buildApiUrl(endpoint), cancelData)
      console.log("Cancel payment response:", response.data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to cancel payment")
      }

      if (!response.data.data) {
        return rejectWithValue("Cancel payment data not found")
      }

      return {
        paymentId: id,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      console.error("Cancel payment error:", error)
      console.error("Error response:", error.response?.data)
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to cancel payment")
      }
      return rejectWithValue(error.message || "Network error during payment cancellation")
    }
  }
)

// Async thunk for canceling payment by reference
export const cancelPaymentByReference = createAsyncThunk(
  "payments/cancelPaymentByReference",
  async (
    { reference, cancelData }: { reference: string; cancelData: CancelPaymentByReferenceRequest },
    { rejectWithValue }
  ) => {
    try {
      if (!reference) {
        return rejectWithValue("Payment reference is required")
      }

      const endpoint = API_ENDPOINTS.PAYMENTS.CANCEL_BY_REFERENCE.replace("{reference}", reference)
      console.log("Cancelling payment by reference with endpoint:", endpoint)
      console.log("Cancel data:", cancelData)

      const response = await api.post<CancelPaymentByReferenceResponse>(buildApiUrl(endpoint), cancelData)
      console.log("Cancel payment by reference response:", response.data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to cancel payment by reference")
      }

      if (!response.data.data) {
        return rejectWithValue("Cancel payment by reference data not found")
      }

      return {
        reference: reference,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      console.error("Cancel payment by reference error:", error)
      console.error("Error response:", error.response?.data)
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to cancel payment by reference")
      }
      return rejectWithValue(error.message || "Network error during payment cancellation by reference")
    }
  }
)

// Async thunk for checking payment by reference
export const checkPayment = createAsyncThunk(
  "payments/checkPayment",
  async (reference: string, { rejectWithValue }) => {
    try {
      if (!reference) {
        return rejectWithValue("Payment reference is required")
      }

      const endpoint = API_ENDPOINTS.AGENTS.CHECK_PAYMENT.replace("{reference}", reference)
      console.log("Checking payment with endpoint:", endpoint)

      const response = await api.get<PaymentResponse>(buildApiUrl(endpoint))
      console.log("Check payment response:", response.data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Payment not found")
      }

      if (!response.data.data) {
        return rejectWithValue("Payment data not found")
      }

      return response.data.data
    } catch (error: any) {
      console.error("Check payment error:", error)
      console.error("Error response:", error.response?.data)
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Payment not found")
      }
      return rejectWithValue(error.message || "Network error during payment lookup")
    }
  }
)

// Async thunk for fetching payment anomalies
export const fetchPaymentAnomalies = createAsyncThunk(
  "payments/fetchPaymentAnomalies",
  async (params: PaymentAnomaliesRequestParams, { rejectWithValue }) => {
    try {
      const { StartDateUtc, EndDateUtc, RuleKey, Status, ResolutionAction, PaymentTypeId, Channel, CollectorType } =
        params

      const response = await api.get<PaymentAnomaliesResponse>(buildApiUrl(API_ENDPOINTS.PAYMENTS.PAYMENT_ANOMALIES), {
        params: {
          ...(StartDateUtc && { StartDateUtc }),
          ...(EndDateUtc && { EndDateUtc }),
          ...(RuleKey && { RuleKey }),
          ...(Status && { Status }),
          ...(ResolutionAction && { ResolutionAction }),
          ...(PaymentTypeId !== undefined && { PaymentTypeId }),
          ...(Channel && { Channel }),
          ...(CollectorType && { CollectorType }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payment anomalies")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payment anomalies")
      }
      return rejectWithValue(error.message || "Network error during payment anomalies fetch")
    }
  }
)

// Async thunk for fetching all anomalies
export const fetchAllAnomalies = createAsyncThunk(
  "payments/fetchAllAnomalies",
  async (params: AllAnomaliesRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        paymentId,
        customerId,
        vendorId,
        agentId,
        paymentTypeId,
        channel,
        minAmount,
        maxAmount,
        status,
        resolutionAction,
        detectedFromUtc,
        detectedToUtc,
        paidFromUtc,
        paidToUtc,
        ruleKey,
        search,
      } = params

      const response = await api.get<AllAnomaliesResponse>(buildApiUrl(API_ENDPOINTS.PAYMENTS.ALL_ANOMALIES), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(paymentId !== undefined && { PaymentId: paymentId }),
          ...(customerId !== undefined && { CustomerId: customerId }),
          ...(vendorId !== undefined && { VendorId: vendorId }),
          ...(agentId !== undefined && { AgentId: agentId }),
          ...(paymentTypeId !== undefined && { PaymentTypeId: paymentTypeId }),
          ...(channel && { Channel: channel }),
          ...(minAmount !== undefined && { MinAmount: minAmount }),
          ...(maxAmount !== undefined && { MaxAmount: maxAmount }),
          ...(status && { Status: status }),
          ...(resolutionAction && { ResolutionAction: resolutionAction }),
          ...(detectedFromUtc && { DetectedFromUtc: detectedFromUtc }),
          ...(detectedToUtc && { DetectedToUtc: detectedToUtc }),
          ...(paidFromUtc && { PaidFromUtc: paidFromUtc }),
          ...(paidToUtc && { PaidToUtc: paidToUtc }),
          ...(ruleKey && { RuleKey: ruleKey }),
          ...(search && { Search: search }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch all anomalies")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch all anomalies")
      }
      return rejectWithValue(error.message || "Network error during all anomalies fetch")
    }
  }
)

// Async thunk for resolving anomaly
export const resolveAnomaly = createAsyncThunk(
  "payments/resolveAnomaly",
  async ({ id, resolveData }: { id: number; resolveData: ResolveAnomalyRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.PAYMENTS.RESOLVE_ANOMALY.replace("{id}", id.toString())
      const response = await api.post<ResolveAnomalyResponse>(buildApiUrl(endpoint), resolveData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to resolve anomaly")
      }

      return {
        anomalyId: id,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to resolve anomaly")
      }
      return rejectWithValue(error.message || "Network error during anomaly resolution")
    }
  }
)

// Async thunk for exporting payments
export const exportPayments = createAsyncThunk(
  "payments/exportPayments",
  async (exportData: ExportPaymentsRequest, { rejectWithValue }) => {
    try {
      const response = await api.get(buildApiUrl(API_ENDPOINTS.PAYMENTS.EXPORT), {
        params: {
          FromUtc: exportData.fromUtc,
          ToUtc: exportData.toUtc,
          ...(exportData.areaOfficeId && { AreaOfficeId: exportData.areaOfficeId }),
          ...(exportData.prepaidOrPostpaid && { prepaidOrPostpaid: exportData.prepaidOrPostpaid }),
        },
        responseType: "blob", // Important for file downloads
      })

      // Generate filename with date range in the format kadElectric-collection-{startDate}-{endDate}
      const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toISOString().split("T")[0] // Format as YYYY-MM-DD
      }

      const startDate = formatDate(exportData.fromUtc)
      const endDate = formatDate(exportData.toUtc)
      let fileName = `kadElectric-collection-${startDate}-${endDate}.csv`

      // Extract filename from content-disposition header as fallback
      const contentDisposition = response.headers["content-disposition"]
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1].replace(/['"]/g, "")
        }
      }

      // Return both blob and filename
      return {
        data: response.data,
        fileName: fileName,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to export payments")
      }
      return rejectWithValue(error.message || "Network error during payments export")
    }
  }
)

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
      state.refundPaymentError = null
      state.vendError = null
      state.cancelPaymentError = null
      state.paymentAnomaliesError = null
      state.resolveAnomalyError = null
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

      // Refund Payment
      state.refundPaymentLoading = false
      state.refundPaymentError = null
      state.refundPaymentSuccess = false
      state.refundPaymentData = null

      // VEND
      state.vendLoading = false
      state.vendError = null
      state.vendSuccess = false
      state.vendData = null

      // Cancel Payment
      state.cancelPaymentLoading = false
      state.cancelPaymentError = null
      state.cancelPaymentSuccess = false
      state.cancelPaymentData = null

      // Payment Anomalies
      state.paymentAnomaliesLoading = false
      state.paymentAnomaliesError = null
      state.paymentAnomaliesSuccess = false
      state.paymentAnomalies = []

      // Resolve Anomaly
      state.resolveAnomalyLoading = false
      state.resolveAnomalyError = null
      state.resolveAnomalySuccess = false
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

    // Clear refund payment state
    clearRefundPayment: (state) => {
      state.refundPaymentLoading = false
      state.refundPaymentError = null
      state.refundPaymentSuccess = false
      state.refundPaymentData = null
    },

    // Clear vend state
    clearVend: (state) => {
      state.vendLoading = false
      state.vendError = null
      state.vendSuccess = false
      state.vendData = null
    },

    // Clear cancel payment state
    clearCancelPayment: (state) => {
      state.cancelPaymentLoading = false
      state.cancelPaymentError = null
      state.cancelPaymentSuccess = false
      state.cancelPaymentData = null
    },

    // Clear cancel payment by reference state
    clearCancelPaymentByReference: (state) => {
      state.cancelPaymentByReferenceLoading = false
      state.cancelPaymentByReferenceError = null
      state.cancelPaymentByReferenceSuccess = false
      state.cancelPaymentByReferenceData = null
    },

    // Clear check payment state
    clearCheckPayment: (state) => {
      state.checkPaymentLoading = false
      state.checkPaymentError = null
      state.checkPaymentSuccess = false
      state.checkPaymentData = null
    },

    // Clear payment anomalies state
    clearPaymentAnomalies: (state) => {
      state.paymentAnomaliesLoading = false
      state.paymentAnomaliesError = null
      state.paymentAnomaliesSuccess = false
      state.paymentAnomalies = []
    },

    // Clear resolve anomaly state
    clearResolveAnomaly: (state) => {
      state.resolveAnomalyLoading = false
      state.resolveAnomalyError = null
      state.resolveAnomalySuccess = false
    },

    // Clear export payments state
    clearExportPayments: (state) => {
      state.exportPaymentsLoading = false
      state.exportPaymentsError = null
      state.exportPaymentsSuccess = false
      state.exportPaymentsData = null
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
        const errorMessage = action.payload
        state.changeRequestsByPaymentError =
          typeof errorMessage === "string" ? errorMessage : "Failed to fetch change requests for payment"
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

      // Refund payment cases
      .addCase(refundPayment.pending, (state) => {
        state.refundPaymentLoading = true
        state.refundPaymentError = null
        state.refundPaymentSuccess = false
        state.refundPaymentData = null
      })
      .addCase(
        refundPayment.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: RefundPaymentData
            message: string
          }>
        ) => {
          state.refundPaymentLoading = false
          state.refundPaymentSuccess = true
          state.refundPaymentError = null
          state.refundPaymentData = action.payload.data
        }
      )
      .addCase(refundPayment.rejected, (state, action) => {
        state.refundPaymentLoading = false
        state.refundPaymentError = (action.payload as string) || "Failed to refund payment"
        state.refundPaymentSuccess = false
        state.refundPaymentData = null
      })

      // Admin vend cases
      .addCase(adminVend.pending, (state) => {
        state.vendLoading = true
        state.vendError = null
        state.vendSuccess = false
        state.vendData = null
      })
      .addCase(
        adminVend.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: VendData
            message: string
          }>
        ) => {
          state.vendLoading = false
          state.vendSuccess = true
          state.vendError = null
          state.vendData = action.payload.data
        }
      )
      .addCase(adminVend.rejected, (state, action) => {
        state.vendLoading = false
        state.vendError = (action.payload as string) || "Failed to vend"
        state.vendSuccess = false
        state.vendData = null
      })

      // Cancel payment cases
      .addCase(cancelPayment.pending, (state) => {
        state.cancelPaymentLoading = true
        state.cancelPaymentError = null
        state.cancelPaymentSuccess = false
        state.cancelPaymentData = null
      })
      .addCase(
        cancelPayment.fulfilled,
        (
          state,
          action: PayloadAction<{
            paymentId: number
            data: CancelPaymentData
            message: string
          }>
        ) => {
          state.cancelPaymentLoading = false
          state.cancelPaymentSuccess = true
          state.cancelPaymentError = null
          state.cancelPaymentData = action.payload.data

          // Update the payment in the payments list if it exists
          const index = state.payments.findIndex((p) => p.id === action.payload.paymentId)
          if (index !== -1 && state.payments[index]) {
            // Update the payment status to reflect cancellation
            state.payments[index]!.status = "Cancelled" as const
          }

          // Update the current payment if it's the same one
          if (state.currentPayment && state.currentPayment.id === action.payload.paymentId) {
            state.currentPayment.status = "Cancelled" as const
          }
        }
      )
      .addCase(cancelPayment.rejected, (state, action) => {
        state.cancelPaymentLoading = false
        state.cancelPaymentError = (action.payload as string) || "Failed to cancel payment"
        state.cancelPaymentSuccess = false
        state.cancelPaymentData = null
      })

      // Cancel payment by reference cases
      .addCase(cancelPaymentByReference.pending, (state) => {
        state.cancelPaymentByReferenceLoading = true
        state.cancelPaymentByReferenceError = null
        state.cancelPaymentByReferenceSuccess = false
        state.cancelPaymentByReferenceData = null
      })
      .addCase(
        cancelPaymentByReference.fulfilled,
        (
          state,
          action: PayloadAction<{
            reference: string
            data: CancelPaymentData
            message: string
          }>
        ) => {
          state.cancelPaymentByReferenceLoading = false
          state.cancelPaymentByReferenceSuccess = true
          state.cancelPaymentByReferenceError = null
          state.cancelPaymentByReferenceData = action.payload.data

          // Update the payment in the payments list if it exists
          const index = state.payments.findIndex((p) => p.reference === action.payload.reference)
          if (index !== -1 && state.payments[index]) {
            // Update the payment status to reflect cancellation
            state.payments[index]!.status = "Cancelled" as const
          }

          // Update the current payment if it's the same one
          if (state.currentPayment && state.currentPayment.reference === action.payload.reference) {
            state.currentPayment.status = "Cancelled" as const
          }
        }
      )
      .addCase(cancelPaymentByReference.rejected, (state, action) => {
        state.cancelPaymentByReferenceLoading = false
        state.cancelPaymentByReferenceError = (action.payload as string) || "Failed to cancel payment by reference"
        state.cancelPaymentByReferenceSuccess = false
        state.cancelPaymentByReferenceData = null
      })

      // Check payment cases
      .addCase(checkPayment.pending, (state) => {
        state.checkPaymentLoading = true
        state.checkPaymentError = null
        state.checkPaymentSuccess = false
        state.checkPaymentData = null
      })
      .addCase(checkPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        state.checkPaymentLoading = false
        state.checkPaymentSuccess = true
        state.checkPaymentError = null
        state.checkPaymentData = action.payload
      })
      .addCase(checkPayment.rejected, (state, action) => {
        state.checkPaymentLoading = false
        state.checkPaymentError = (action.payload as string) || "Payment not found"
        state.checkPaymentSuccess = false
        state.checkPaymentData = null
      })

      // Fetch payment anomalies cases
      .addCase(fetchPaymentAnomalies.pending, (state) => {
        state.paymentAnomaliesLoading = true
        state.paymentAnomaliesError = null
        state.paymentAnomaliesSuccess = false
      })
      .addCase(fetchPaymentAnomalies.fulfilled, (state, action: PayloadAction<PaymentAnomalyItem[]>) => {
        state.paymentAnomaliesLoading = false
        state.paymentAnomaliesSuccess = true
        state.paymentAnomaliesError = null
        state.paymentAnomalies = action.payload
      })
      .addCase(fetchPaymentAnomalies.rejected, (state, action) => {
        state.paymentAnomaliesLoading = false
        state.paymentAnomaliesError = (action.payload as string) || "Failed to fetch payment anomalies"
        state.paymentAnomaliesSuccess = false
        state.paymentAnomalies = []
      })

      // Fetch all anomalies cases
      .addCase(fetchAllAnomalies.pending, (state) => {
        state.allAnomaliesLoading = true
        state.allAnomaliesError = null
        state.allAnomaliesSuccess = false
      })
      .addCase(fetchAllAnomalies.fulfilled, (state, action: PayloadAction<AllAnomaliesResponse>) => {
        state.allAnomaliesLoading = false
        state.allAnomaliesSuccess = true
        state.allAnomaliesError = null
        state.allAnomalies = action.payload.data
        state.allAnomaliesPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchAllAnomalies.rejected, (state, action) => {
        state.allAnomaliesLoading = false
        state.allAnomaliesError = (action.payload as string) || "Failed to fetch all anomalies"
        state.allAnomaliesSuccess = false
        state.allAnomalies = []
      })

      // Resolve anomaly cases
      .addCase(resolveAnomaly.pending, (state) => {
        state.resolveAnomalyLoading = true
        state.resolveAnomalyError = null
        state.resolveAnomalySuccess = false
      })
      .addCase(
        resolveAnomaly.fulfilled,
        (
          state,
          action: PayloadAction<{
            anomalyId: number
            data: {
              action: PaymentAnomalyResolutionAction
              note: string
            }
            message: string
          }>
        ) => {
          state.resolveAnomalyLoading = false
          state.resolveAnomalySuccess = true
          state.resolveAnomalyError = null

          // Update the anomaly in the allAnomalies list if it exists
          const index = state.allAnomalies.findIndex((anomaly) => anomaly.id === action.payload.anomalyId)
          if (index !== -1) {
            state.allAnomalies[index]!.status = "Resolved" as const
            state.allAnomalies[index]!.resolutionAction = action.payload.data.action
            state.allAnomalies[index]!.resolutionNote = action.payload.data.note
            state.allAnomalies[index]!.resolvedAtUtc = new Date().toISOString()
          }
        }
      )
      .addCase(resolveAnomaly.rejected, (state, action) => {
        state.resolveAnomalyLoading = false
        state.resolveAnomalyError = (action.payload as string) || "Failed to resolve anomaly"
        state.resolveAnomalySuccess = false
      })
      // Export payments cases
      .addCase(exportPayments.pending, (state) => {
        state.exportPaymentsLoading = true
        state.exportPaymentsError = null
        state.exportPaymentsSuccess = false
      })
      .addCase(exportPayments.fulfilled, (state, action) => {
        state.exportPaymentsLoading = false
        state.exportPaymentsSuccess = true
        state.exportPaymentsError = null
        state.exportPaymentsData = action.payload.data
      })
      .addCase(exportPayments.rejected, (state, action) => {
        state.exportPaymentsLoading = false
        state.exportPaymentsError = (action.payload as string) || "Failed to export payments"
        state.exportPaymentsSuccess = false
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
  clearRefundPayment,
  clearVend,
  clearCancelPayment,
  clearCancelPaymentByReference,
  clearCheckPayment,
  clearPaymentAnomalies,
  clearResolveAnomaly,
  clearExportPayments,
} = paymentSlice.actions

export default paymentSlice.reducer
function rejectWithValue(arg0: string): any {
  throw new Error("Function not implemented.")
}
