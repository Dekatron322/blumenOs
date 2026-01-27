// src/lib/redux/refundSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Refund Summary
export interface RefundSummaryByChannel {
  count: number
  channel: string
  totalCount: number
  totalAmount: number
  totalNetAmount: number
}

export interface RefundSummaryByVendor {
  vendorId: number
  vendorName: string
  totalCount: number
  totalAmount: number
  totalNetAmount: number
}

export interface RefundSummaryByAgent {
  agentId: number
  agentName: string
  totalCount: number
  totalAmount: number
  totalNetAmount: number
}

export interface RefundSummaryByDate {
  date: string
  totalCount: number
  totalAmount: number
  totalNetAmount: number
}

export interface RefundSummaryData {
  totalCount: number
  totalAmount: number
  totalNetAmount: number
  byChannel: RefundSummaryByChannel[]
  byVendor: RefundSummaryByVendor[]
  byAgent: RefundSummaryByAgent[]
  byDate: RefundSummaryByDate[]
}

export interface RefundSummaryParams {
  CustomerId?: number
  VendorId?: number
  AgentId?: number
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
  FromUtc?: string
  ToUtc?: string
  RefundTypeKey?: string
}

export interface RefundSummaryResponse {
  isSuccess: boolean
  message: string
  data: RefundSummaryData
}

// Interfaces for Refund History
export interface RefundHistoryItem {
  id: number
  refundReference: string
  originalReference: string
  reason: string
  amount: number
  currency: string
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque" | "BankDeposit" | "Vendor" | "Migration"
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  refundedAtUtc: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  vendorId: number
  vendorName: string
  agentId: number
  agentName: string
  refundTypeKey: string
  refundTypeName: string
}

export interface RefundHistoryParams {
  PageNumber: number
  PageSize: number
  CustomerId?: number
  VendorId?: number
  AgentId?: number
  Reference?: string
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
  Status?: "Pending" | "Confirmed" | "Failed" | "Reversed"
  FromUtc?: string
  ToUtc?: string
  RefundTypeKey?: string
}

export interface RefundHistoryResponse {
  isSuccess: boolean
  message: string
  data: RefundHistoryItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Interfaces for Make Refund
export interface MakeRefundRequest {
  reference: string
  reason: string
  refundTypeKey: string
}

export interface Token {
  token: string
  tokenDec: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

export interface VirtualAccount {
  accountNumber: string
  bankName: string
  reference: string
  expiresAtUtc: string
}

export interface PaymentDetails {
  reference: string
  checkoutUrl: string
  virtualAccount: VirtualAccount
}

export interface Collector {
  type: string
  name: string
  agentId: number
  agentCode: string
  agentType: "SalesRep"
  vendorId: number
  vendorName: string
  staffName: string
  customerId: number
  customerName: string
}

export interface Receipt {
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
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque" | "BankDeposit" | "Vendor" | "Migration"
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  paymentTypeName: string
  receipt: {
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
    channel:
      | "Cash"
      | "BankTransfer"
      | "Pos"
      | "Card"
      | "VendorWallet"
      | "Chaque"
      | "BankDeposit"
      | "Vendor"
      | "Migration"
    status: "Pending" | "Confirmed" | "Failed" | "Reversed"
    tokens: Token[]
    serviceCharge: number
    discountBonus: number
  }
  paymentDetails: PaymentDetails
  collector: Collector
  token: Token
}

export interface MakeRefundData {
  refundTypeKey: string
  refundTypeName: string
  originalReference: string
  refundReference: string
  refundCount: number
  refundLimit: number
  receipt: Receipt
}

export interface MakeRefundResponse {
  isSuccess: boolean
  message: string
  data: MakeRefundData
}

// Refund State
interface RefundState {
  // Refund Summary state
  refundSummaryData: RefundSummaryData | null
  refundSummaryLoading: boolean
  refundSummaryError: string | null
  refundSummarySuccess: boolean
  refundSummaryParams: RefundSummaryParams | null

  // Refund History state
  refundHistoryData: RefundHistoryItem[]
  refundHistoryLoading: boolean
  refundHistoryError: string | null
  refundHistorySuccess: boolean
  refundHistoryParams: RefundHistoryParams | null
  refundHistoryPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null

  // Make Refund state
  makeRefundData: MakeRefundData | null
  makeRefundLoading: boolean
  makeRefundError: string | null
  makeRefundSuccess: boolean

  // General refund state
  loading: boolean
  error: string | null
}

// Initial state
const initialState: RefundState = {
  refundSummaryData: null,
  refundSummaryLoading: false,
  refundSummaryError: null,
  refundSummarySuccess: false,
  refundSummaryParams: null,

  refundHistoryData: [],
  refundHistoryLoading: false,
  refundHistoryError: null,
  refundHistorySuccess: false,
  refundHistoryParams: null,
  refundHistoryPagination: null,

  // Make Refund state
  makeRefundData: null,
  makeRefundLoading: false,
  makeRefundError: null,
  makeRefundSuccess: false,

  loading: false,
  error: null,
}

// Async thunk for fetching refund summary
export const fetchRefundSummary = createAsyncThunk(
  "refunds/fetchRefundSummary",
  async (params: RefundSummaryParams, { rejectWithValue }) => {
    try {
      const response = await api.get<RefundSummaryResponse>(buildApiUrl(API_ENDPOINTS.REFUND.SUMMARY), {
        params: {
          ...(params.CustomerId !== undefined && { CustomerId: params.CustomerId }),
          ...(params.VendorId !== undefined && { VendorId: params.VendorId }),
          ...(params.AgentId !== undefined && { AgentId: params.AgentId }),
          ...(params.Channel && { Channel: params.Channel }),
          ...(params.FromUtc && { FromUtc: params.FromUtc }),
          ...(params.ToUtc && { ToUtc: params.ToUtc }),
          ...(params.RefundTypeKey && { RefundTypeKey: params.RefundTypeKey }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch refund summary")
      }

      // Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Refund summary data not found")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch refund summary")
      }
      return rejectWithValue(error.message || "Network error during refund summary fetch")
    }
  }
)

// Async thunk for fetching refund history
export const fetchRefundHistory = createAsyncThunk(
  "refunds/fetchRefundHistory",
  async (params: RefundHistoryParams, { rejectWithValue }) => {
    try {
      const response = await api.get<RefundHistoryResponse>(buildApiUrl(API_ENDPOINTS.REFUND.REFUND_HISTORY), {
        params: {
          PageNumber: params.PageNumber,
          PageSize: params.PageSize,
          ...(params.CustomerId !== undefined && { CustomerId: params.CustomerId }),
          ...(params.VendorId !== undefined && { VendorId: params.VendorId }),
          ...(params.AgentId !== undefined && { AgentId: params.AgentId }),
          ...(params.Reference && { Reference: params.Reference }),
          ...(params.Channel && { Channel: params.Channel }),
          ...(params.Status && { Status: params.Status }),
          ...(params.FromUtc && { FromUtc: params.FromUtc }),
          ...(params.ToUtc && { ToUtc: params.ToUtc }),
          ...(params.RefundTypeKey && { RefundTypeKey: params.RefundTypeKey }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch refund history")
      }

      return {
        data: response.data.data,
        pagination: {
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          pageSize: response.data.pageSize,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious,
        },
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch refund history")
      }
      return rejectWithValue(error.message || "Network error during refund history fetch")
    }
  }
)

// Async thunk for making a refund
export const makeRefund = createAsyncThunk(
  "refunds/makeRefund",
  async (refundData: MakeRefundRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<MakeRefundResponse>(buildApiUrl(API_ENDPOINTS.REFUND.MAKE_REFUND), refundData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to make refund")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to make refund")
      }
      return rejectWithValue(error.message || "Network error during refund creation")
    }
  }
)

// Refund slice
const refundSlice = createSlice({
  name: "refunds",
  initialState,
  reducers: {
    // Clear refund summary state
    clearRefundSummary: (state) => {
      state.refundSummaryData = null
      state.refundSummaryError = null
      state.refundSummarySuccess = false
      state.refundSummaryLoading = false
      state.refundSummaryParams = null
    },

    // Set refund summary parameters
    setRefundSummaryParams: (state, action: PayloadAction<RefundSummaryParams>) => {
      state.refundSummaryParams = action.payload
    },

    // Clear refund history state
    clearRefundHistory: (state) => {
      state.refundHistoryData = []
      state.refundHistoryError = null
      state.refundHistorySuccess = false
      state.refundHistoryLoading = false
      state.refundHistoryParams = null
      state.refundHistoryPagination = null
    },

    // Set refund history parameters
    setRefundHistoryParams: (state, action: PayloadAction<RefundHistoryParams>) => {
      state.refundHistoryParams = action.payload
    },

    // Clear make refund state
    clearMakeRefund: (state) => {
      state.makeRefundData = null
      state.makeRefundError = null
      state.makeRefundSuccess = false
      state.makeRefundLoading = false
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.refundSummaryError = null
      state.refundHistoryError = null
    },

    // Reset refund state
    resetRefundState: (state) => {
      state.refundSummaryData = null
      state.refundSummaryLoading = false
      state.refundSummaryError = null
      state.refundSummarySuccess = false
      state.refundSummaryParams = null
      state.refundHistoryData = []
      state.refundHistoryLoading = false
      state.refundHistoryError = null
      state.refundHistorySuccess = false
      state.refundHistoryParams = null
      state.refundHistoryPagination = null
      state.makeRefundData = null
      state.makeRefundLoading = false
      state.makeRefundError = null
      state.makeRefundSuccess = false
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch refund summary
    builder
      .addCase(fetchRefundSummary.pending, (state) => {
        state.refundSummaryLoading = true
        state.refundSummaryError = null
        state.refundSummarySuccess = false
      })
      .addCase(fetchRefundSummary.fulfilled, (state, action) => {
        state.refundSummaryLoading = false
        state.refundSummarySuccess = true
        state.refundSummaryData = action.payload.data
        state.refundSummaryParams = action.payload.params
      })
      .addCase(fetchRefundSummary.rejected, (state, action) => {
        state.refundSummaryLoading = false
        state.refundSummaryError = action.payload as string
        state.refundSummarySuccess = false
      })

    // Fetch refund history
    builder
      .addCase(fetchRefundHistory.pending, (state) => {
        state.refundHistoryLoading = true
        state.refundHistoryError = null
        state.refundHistorySuccess = false
      })
      .addCase(fetchRefundHistory.fulfilled, (state, action) => {
        state.refundHistoryLoading = false
        state.refundHistorySuccess = true
        state.refundHistoryData = action.payload.data
        state.refundHistoryParams = action.payload.params
        state.refundHistoryPagination = action.payload.pagination
      })
      .addCase(fetchRefundHistory.rejected, (state, action) => {
        state.refundHistoryLoading = false
        state.refundHistoryError = action.payload as string
        state.refundHistorySuccess = false
      })

    // Make refund
    builder
      .addCase(makeRefund.pending, (state) => {
        state.makeRefundLoading = true
        state.makeRefundError = null
        state.makeRefundSuccess = false
      })
      .addCase(makeRefund.fulfilled, (state, action) => {
        state.makeRefundLoading = false
        state.makeRefundSuccess = true
        state.makeRefundData = action.payload
      })
      .addCase(makeRefund.rejected, (state, action) => {
        state.makeRefundLoading = false
        state.makeRefundError = action.payload as string
        state.makeRefundSuccess = false
      })
  },
})

export const {
  clearRefundSummary,
  setRefundSummaryParams,
  clearRefundHistory,
  setRefundHistoryParams,
  clearMakeRefund,
  clearError,
  resetRefundState,
} = refundSlice.actions

export default refundSlice.reducer
