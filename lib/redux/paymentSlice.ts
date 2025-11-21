// src/lib/redux/paymentSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Payment
export interface VirtualAccount {
  accountNumber: string
  bankName: string
  reference: string
  expiresAtUtc: string
}

export interface Payment {
  id: number
  reference: string
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet"
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  collectorType: "Customer" | "Agent" | "Vendor" | "Staff"
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
  narrative: string
  externalReference: string
  virtualAccount?: VirtualAccount
  vendorAccountId: string
  recordedByName: string
}

export interface PaymentResponse {
  isSuccess: boolean
  message: string
  data: Payment
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
  channel?: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet"
  status?: "Pending" | "Confirmed" | "Failed" | "Reversed"
  collectorType?: "Customer" | "Agent" | "Vendor" | "Staff"
  paidFromUtc?: string
  paidToUtc?: string
  search?: string
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

  // Pagination state
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
const initialState: PaymentState = {
  payments: [],
  loading: false,
  error: null,
  success: false,

  currentPayment: null,
  currentPaymentLoading: false,
  currentPaymentError: null,
  currentPaymentSuccess: false,

  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
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

    // Clear errors
    clearError: (state) => {
      state.error = null
      state.currentPaymentError = null
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
      state.pagination = {
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
  },
})

export const { clearPayments, clearCurrentPayment, clearError, resetPaymentState, setPagination } = paymentSlice.actions

export default paymentSlice.reducer
