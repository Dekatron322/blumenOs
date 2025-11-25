// src/lib/redux/paymentDunningSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Payment Dunning
export interface DunningAttempt {
  id: number
  attemptedAtUtc: string
  channel: "Sms" | "Email" | "PhoneCall" | "FieldVisit" | "Letter"
  outcome: "NoResponse" | "Contacted" | "PaymentPromised" | "PaymentMade" | "Refused" | "WrongContact"
  notes: string
  createdByName: string
}

export interface PaymentDunningCase {
  id: number
  caseNumber: string
  stage: "SoftReminder" | "HardReminder" | "FieldVisit" | "DisconnectionNotice"
  status: "Open" | "OnHold" | "Resolved" | "Cancelled"
  outstandingAmount: number
  nextActionDueAtUtc: string
  lastAttemptAtUtc: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  assignedToName: string
  postpaidBillId?: number
  billPeriod?: string
  billTotalDue?: number
  notes?: string
  closureReason?: string
  closedAtUtc?: string
  attempts?: DunningAttempt[]
}

export interface PaymentDunningResponse {
  isSuccess: boolean
  message: string
  data: PaymentDunningCase[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaymentDunningCaseResponse {
  isSuccess: boolean
  message: string
  data: PaymentDunningCase
}

export interface PaymentDunningRequestParams {
  pageNumber: number
  pageSize: number
  status?: "Open" | "OnHold" | "Resolved" | "Cancelled"
  stage?: "SoftReminder" | "HardReminder" | "FieldVisit" | "DisconnectionNotice"
  customerId?: number
  assignedToUserId?: number
  caseNumber?: string
  search?: string
}

export interface CreatePaymentDunningCaseRequest {
  customerId: number
  postpaidBillId: number
  outstandingAmount: number
  stage: "SoftReminder" | "HardReminder" | "FieldVisit" | "DisconnectionNotice"
  assignedToUserId: number
  nextActionDueAtUtc: string
  notes: string
}

// Payment Dunning State
interface PaymentDunningState {
  // Dunning cases list state
  dunningCases: PaymentDunningCase[]
  loading: boolean
  error: string | null
  success: boolean

  // Create dunning case state
  creating: boolean
  createError: string | null
  createSuccess: boolean

  // Pagination state
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Current dunning case state (for viewing/editing)
  currentDunningCase: PaymentDunningCase | null
  currentDunningCaseLoading: boolean
  currentDunningCaseError: string | null
}

// Initial state
const initialState: PaymentDunningState = {
  dunningCases: [],
  loading: false,
  error: null,
  success: false,
  creating: false,
  createError: null,
  createSuccess: false,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  currentDunningCase: null,
  currentDunningCaseLoading: false,
  currentDunningCaseError: null,
}

// Async thunks
export const fetchPaymentDunningCases = createAsyncThunk(
  "paymentDunning/fetchPaymentDunningCases",
  async (params: PaymentDunningRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, stage, customerId, assignedToUserId, caseNumber, search } = params

      const response = await api.get<PaymentDunningResponse>(buildApiUrl(API_ENDPOINTS.PAYMENT_DUNNING.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(status && { Status: status }),
          ...(stage && { Stage: stage }),
          ...(customerId !== undefined && { CustomerId: customerId }),
          ...(assignedToUserId !== undefined && { AssignedToUserId: assignedToUserId }),
          ...(caseNumber && { CaseNumber: caseNumber }),
          ...(search && { Search: search }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payment dunning cases")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payment dunning cases")
      }
      return rejectWithValue(error.message || "Network error during payment dunning cases fetch")
    }
  }
)

export const createPaymentDunningCase = createAsyncThunk(
  "paymentDunning/createPaymentDunningCase",
  async (dunningCaseData: CreatePaymentDunningCaseRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<PaymentDunningCaseResponse>(
        buildApiUrl(API_ENDPOINTS.PAYMENT_DUNNING.ADD),
        dunningCaseData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create payment dunning case")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create payment dunning case")
      }
      return rejectWithValue(error.message || "Network error during payment dunning case creation")
    }
  }
)

// Payment Dunning slice
const paymentDunningSlice = createSlice({
  name: "paymentDunning",
  initialState,
  reducers: {
    // Clear dunning cases state
    clearDunningCases: (state) => {
      state.dunningCases = []
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
      state.currentDunningCaseError = null
      state.createError = null
    },

    // Clear create state
    clearCreateState: (state) => {
      state.creating = false
      state.createError = null
      state.createSuccess = false
    },

    // Clear current dunning case
    clearCurrentDunningCase: (state) => {
      state.currentDunningCase = null
      state.currentDunningCaseError = null
    },

    // Reset payment dunning state
    resetPaymentDunningState: (state) => {
      state.dunningCases = []
      state.loading = false
      state.error = null
      state.success = false
      state.creating = false
      state.createError = null
      state.createSuccess = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.currentDunningCase = null
      state.currentDunningCaseLoading = false
      state.currentDunningCaseError = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set current dunning case (for when we get it from another source)
    setCurrentDunningCase: (state, action: PayloadAction<PaymentDunningCase>) => {
      state.currentDunningCase = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment dunning cases
      .addCase(fetchPaymentDunningCases.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchPaymentDunningCases.fulfilled, (state, action: PayloadAction<PaymentDunningResponse>) => {
        state.loading = false
        state.success = true
        state.dunningCases = action.payload.data
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
      .addCase(fetchPaymentDunningCases.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch payment dunning cases"
        state.success = false
        state.dunningCases = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })

      // Create payment dunning case
      .addCase(createPaymentDunningCase.pending, (state) => {
        state.creating = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createPaymentDunningCase.fulfilled, (state, action: PayloadAction<PaymentDunningCaseResponse>) => {
        state.creating = false
        state.createSuccess = true
        state.createError = null

        // Add the new case to the beginning of the list
        state.dunningCases.unshift(action.payload.data)

        // Update pagination totals
        state.pagination.totalCount += 1
        state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)
      })
      .addCase(createPaymentDunningCase.rejected, (state, action) => {
        state.creating = false
        state.createError = (action.payload as string) || "Failed to create payment dunning case"
        state.createSuccess = false
      })
  },
})

export const {
  clearDunningCases,
  clearError,
  clearCreateState,
  clearCurrentDunningCase,
  resetPaymentDunningState,
  setPagination,
  setCurrentDunningCase,
} = paymentDunningSlice.actions

export default paymentDunningSlice.reducer
