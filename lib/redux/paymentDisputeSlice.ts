// src/lib/redux/paymentDisputeSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Payment Dispute Status Enum
export enum PaymentDisputeStatus {
  Open = "Open",
  InReview = "InReview",
  Resolved = "Resolved",
  Rejected = "Rejected",
}

// Payment Dispute Source Enum
export enum PaymentDisputeSource {
  Employee = "Employee",
  Customer = "Customer",
}

// Payment Dispute Resolution Action Enum
export enum PaymentDisputeResolutionAction {
  None = "None",
  Refund = "Refund",
  Adjustment = "Adjustment",
  Waiver = "Waiver",
}

// Payment Channel Enum (from payment slice)
export enum PaymentChannel {
  Cash = "Cash",
  BankTransfer = "BankTransfer",
  Pos = "Pos",
  Card = "Card",
  VendorWallet = "VendorWallet",
  Chaque = "Chaque",
  BankDeposit = "BankDeposit",
  Vendor = "Vendor",
  Migration = "Migration",
}

// Payment Status Enum (from payment slice)
export enum PaymentStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Failed = "Failed",
  Reversed = "Reversed",
}

// Collector Type Enum (from payment slice)
export enum CollectorType {
  Customer = "Customer",
  SalesRep = "SalesRep",
  Vendor = "Vendor",
  Staff = "Staff",
}

// Collector Interface (from payment slice)
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

// Payment Token Interface (from payment slice)
export interface PaymentToken {
  token: string
  tokenDec?: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

// Payment Interface (simplified from payment slice)
export interface Payment {
  id: number
  reference: string
  bankReceiptNo: string
  latitude: number
  longitude: number
  phoneNumber: string
  channel: PaymentChannel
  status: PaymentStatus
  collectorType: CollectorType
  isPrepaid: boolean
  agentType: string
  amount: number
  amountApplied: number
  vatAmount: number
  overPaymentAmount: number
  outstandingAfterPayment: number
  outstandingBeforePayment: number
  customerOutstandingDebtBalance: number
  vendorCommissionRatePercent: number
  vendorCommissionAmount: number
  vendorDebitAmount: number
  currency: string
  paidAtUtc: string
  confirmedAtUtc: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  customerAddress: string
  postpaidBillId: number
  postpaidBillPeriod: string
  billTotalDue: number
  vendorId: number
  vendorName: string
  agentId: number
  agentCode: string
  agentName: string
  recordedByName: string
  areaOfficeName: string
  distributionSubstationCode: string
  feederName: string
  paymentTypeId: number
  paymentTypeName: string
  isManualEntry: boolean
  isSystemGenerated: boolean
  evidenceFileUrl: string
  shouldUpgrade: boolean
  recoveryApplied: boolean
  recoveryAmount: number
  recoveryPolicyId: number
  recoveryPolicyName: string
  collector: Collector
  tokens: PaymentToken[]
  upgrade?: {
    upgradeId: number
    message: string
    keyChangeTokens: PaymentToken[]
    creditToken: PaymentToken
  }
}

// Payment Dispute Interface
export interface PaymentDispute {
  id: number
  status: PaymentDisputeStatus
  source: PaymentDisputeSource
  resolutionAction: PaymentDisputeResolutionAction
  paymentTransactionId: number
  paymentReference: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  requestedAmount: number
  resolvedAmount: number
  reason: string
  details: string
  resolutionNotes: string
  resolvedAtUtc: string
  createdAt: string
  payment: Payment
}

// Payment Disputes Response Interface
export interface PaymentDisputesResponse {
  isSuccess: boolean
  message: string
  data: PaymentDispute[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Payment Disputes Request Parameters Interface
export interface PaymentDisputesRequestParams {
  pageNumber: number
  pageSize: number
  customerId?: number
  paymentTransactionId?: number
  status?: PaymentDisputeStatus
  source?: PaymentDisputeSource
}

// Payment Dispute State Interface
interface PaymentDisputeState {
  disputes: PaymentDispute[]
  loading: boolean
  error: string | null
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Initial State
const initialState: PaymentDisputeState = {
  disputes: [],
  loading: false,
  error: null,
  totalCount: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 0,
  hasNext: false,
  hasPrevious: false,
}

// Async Thunk for Fetching Payment Disputes
export const fetchPaymentDisputes = createAsyncThunk<
  PaymentDisputesResponse,
  PaymentDisputesRequestParams,
  { rejectValue: string }
>(
  "paymentDisputes/fetchPaymentDisputes",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.pageNumber.toString())
      queryParams.append("PageSize", params.pageSize.toString())
      
      if (params.customerId) {
        queryParams.append("CustomerId", params.customerId.toString())
      }
      
      if (params.paymentTransactionId) {
        queryParams.append("PaymentTransactionId", params.paymentTransactionId.toString())
      }
      
      if (params.status) {
        queryParams.append("Status", params.status)
      }
      
      if (params.source) {
        queryParams.append("Source", params.source)
      }

      const response = await api.get(
        `${buildApiUrl(API_ENDPOINTS.PAYMENT_DISPUTE.GET_PAYMENT_DISPUTES)}?${queryParams.toString()}`
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment disputes"
      )
    }
  }
)

// Payment Dispute Slice
const paymentDisputeSlice = createSlice({
  name: "paymentDisputes",
  initialState,
  reducers: {
    clearPaymentDisputesError: (state) => {
      state.error = null
    },
    resetPaymentDisputes: (state) => {
      state.disputes = []
      state.loading = false
      state.error = null
      state.totalCount = 0
      state.totalPages = 0
      state.currentPage = 0
      state.pageSize = 0
      state.hasNext = false
      state.hasPrevious = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payment Disputes
      .addCase(fetchPaymentDisputes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaymentDisputes.fulfilled, (state, action: PayloadAction<PaymentDisputesResponse>) => {
        state.loading = false
        state.disputes = action.payload.data
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
        state.pageSize = action.payload.pageSize
        state.hasNext = action.payload.hasNext
        state.hasPrevious = action.payload.hasPrevious
      })
      .addCase(fetchPaymentDisputes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearPaymentDisputesError, resetPaymentDisputes } = paymentDisputeSlice.actions

export default paymentDisputeSlice.reducer
