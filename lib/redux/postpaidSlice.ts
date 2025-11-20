// src/lib/redux/postpaidSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Postpaid Billing
export interface LedgerEntry {
  id: number
  type: number
  amount: number
  code: string
  memo: string
  effectiveAtUtc: string
  referenceId: number
}

export interface ActiveDispute {
  id: number
  status: number
  reason: string
  raisedAtUtc: string
}

export interface PostpaidBill {
  dueDate: any
  name: string
  id: number
  period: string
  category: number
  status: number
  adjustmentStatus: number
  customerId: number
  customerName: string
  customerAccountNumber: string
  distributionSubstationId: number
  distributionSubstationCode: string
  feederId: number
  feederName: string
  areaOfficeId: number
  areaOfficeName: string
  meterReadingId: number
  feederEnergyCapId: number
  tariffPerKwh: number
  vatRate: number
  openingBalance: number
  paymentsPrevMonth: number
  consumptionKwh: number
  chargeBeforeVat: number
  vatAmount: number
  currentBillAmount: number
  adjustedOpeningBalance: number
  totalDue: number
  forecastConsumptionKwh: number
  forecastChargeBeforeVat: number
  forecastVatAmount: number
  forecastBillAmount: number
  forecastTotalDue: number
  isEstimated: boolean
  estimatedConsumptionKwh: number
  estimatedBillAmount: number
  actualConsumptionKwh: number
  actualBillAmount: number
  consumptionVarianceKwh: number
  billingVarianceAmount: number
  isMeterReadingFlagged: boolean
  meterReadingValidationStatus: number
  openDisputeCount: number
  activeDispute: ActiveDispute | null
  createdAt: string
  lastUpdated: string
  ledgerEntries: LedgerEntry[]
}

export interface PostpaidBillsResponse {
  isSuccess: boolean
  message: string
  data: PostpaidBill[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PostpaidBillResponse {
  isSuccess: boolean
  message: string
  data: PostpaidBill
}

export interface PostpaidBillsRequestParams {
  pageNumber: number
  pageSize: number
  period?: string
  customerId?: number
  accountNumber?: string
  status?: number
  category?: number
  areaOfficeId?: number
  feederId?: number
}

// Finalize Period Interfaces
export interface FinalizePeriodRequest {
  period: string
}

export interface FinalizePeriodResponse {
  isSuccess: boolean
  message: string
  data: string
}

// Finalize Period by Area Office Interfaces
export interface FinalizePeriodByAreaOfficeRequest {
  period: string
}

export interface FinalizePeriodByAreaOfficeResponse {
  isSuccess: boolean
  message: string
  data: PostpaidBill[]
}

// Postpaid Billing State
interface PostpaidBillingState {
  // Postpaid bills list state
  bills: PostpaidBill[]
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

  // Current bill state (for viewing/editing)
  currentBill: PostpaidBill | null
  currentBillLoading: boolean
  currentBillError: string | null

  // Finalize period state
  finalizeLoading: boolean
  finalizeError: string | null
  finalizeSuccess: boolean
  finalizeMessage: string | null

  // Finalize period by area office state
  finalizeByAreaOfficeLoading: boolean
  finalizeByAreaOfficeError: string | null
  finalizeByAreaOfficeSuccess: boolean
  finalizeByAreaOfficeMessage: string | null
  finalizedAreaOfficeBills: PostpaidBill[]

  // Search/filter state
  filters: {
    period?: string
    customerId?: number
    accountNumber?: string
    status?: number
    category?: number
    areaOfficeId?: number
    feederId?: number
  }
}

// Initial state
const initialState: PostpaidBillingState = {
  bills: [],
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
  currentBill: null,
  currentBillLoading: false,
  currentBillError: null,
  finalizeLoading: false,
  finalizeError: null,
  finalizeSuccess: false,
  finalizeMessage: null,
  finalizeByAreaOfficeLoading: false,
  finalizeByAreaOfficeError: null,
  finalizeByAreaOfficeSuccess: false,
  finalizeByAreaOfficeMessage: null,
  finalizedAreaOfficeBills: [],
  filters: {},
}

// Helper function to replace path parameters in endpoints
const buildEndpointWithParams = (endpoint: string, params: Record<string, string | number>): string => {
  let builtEndpoint = endpoint
  for (const [key, value] of Object.entries(params)) {
    builtEndpoint = builtEndpoint.replace(`{${key}}`, value.toString())
  }
  return builtEndpoint
}

// Async thunks
export const fetchPostpaidBills = createAsyncThunk(
  "postpaidBilling/fetchPostpaidBills",
  async (params: PostpaidBillsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, period, customerId, accountNumber, status, category, areaOfficeId, feederId } =
        params

      const response = await api.get<PostpaidBillsResponse>(buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(period && { Period: period }),
          ...(customerId && { CustomerId: customerId }),
          ...(accountNumber && { AccountNumber: accountNumber }),
          ...(status !== undefined && { Status: status }),
          ...(category !== undefined && { Category: category }),
          ...(areaOfficeId && { AreaOfficeId: areaOfficeId }),
          ...(feederId && { FeederId: feederId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch postpaid bills")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch postpaid bills")
      }
      return rejectWithValue(error.message || "Network error during postpaid bills fetch")
    }
  }
)

export const fetchPostpaidBillById = createAsyncThunk<PostpaidBill, number, { rejectValue: string }>(
  "postpaidBilling/fetchPostpaidBillById",
  async (billId: number, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.POSTPAID_BILLING.GET_BY_ID, { id: billId })
      const response = await api.get<PostpaidBillResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch postpaid bill")
      }

      if (!response.data.data) {
        return rejectWithValue("Postpaid bill not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch postpaid bill")
      }
      return rejectWithValue(error.message || "Network error during postpaid bill fetch")
    }
  }
)

export const finalizeBillingPeriod = createAsyncThunk(
  "postpaidBilling/finalizeBillingPeriod",
  async (requestData: FinalizePeriodRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<FinalizePeriodResponse>(
        buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.FINALIZE),
        requestData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to finalize billing period")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to finalize billing period")
      }
      return rejectWithValue(error.message || "Network error during billing period finalization")
    }
  }
)

export const finalizeBillingPeriodByAreaOffice = createAsyncThunk(
  "postpaidBilling/finalizeBillingPeriodByAreaOffice",
  async (
    { areaOfficeId, requestData }: { areaOfficeId: number; requestData: FinalizePeriodByAreaOfficeRequest },
    { rejectWithValue }
  ) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.POSTPAID_BILLING.FINALIZE_BY_AREA_OFFICE_ID, {
        areaOfficeId,
      })

      const response = await api.post<FinalizePeriodByAreaOfficeResponse>(buildApiUrl(endpoint), requestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to finalize billing period for area office")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to finalize billing period for area office")
      }
      return rejectWithValue(error.message || "Network error during area office billing period finalization")
    }
  }
)

// Postpaid billing slice
const postpaidSlice = createSlice({
  name: "postpaidBilling",
  initialState,
  reducers: {
    // Clear bills state
    clearBills: (state) => {
      state.bills = []
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
      state.currentBillError = null
      state.finalizeError = null
      state.finalizeByAreaOfficeError = null
    },

    // Clear current bill
    clearCurrentBill: (state) => {
      state.currentBill = null
      state.currentBillError = null
    },

    // Clear finalize state
    clearFinalizeState: (state) => {
      state.finalizeLoading = false
      state.finalizeError = null
      state.finalizeSuccess = false
      state.finalizeMessage = null
    },

    // Clear finalize by area office state
    clearFinalizeByAreaOfficeState: (state) => {
      state.finalizeByAreaOfficeLoading = false
      state.finalizeByAreaOfficeError = null
      state.finalizeByAreaOfficeSuccess = false
      state.finalizeByAreaOfficeMessage = null
      state.finalizedAreaOfficeBills = []
    },

    // Reset billing state
    resetBillingState: (state) => {
      state.bills = []
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
      state.currentBill = null
      state.currentBillLoading = false
      state.currentBillError = null
      state.finalizeLoading = false
      state.finalizeError = null
      state.finalizeSuccess = false
      state.finalizeMessage = null
      state.finalizeByAreaOfficeLoading = false
      state.finalizeByAreaOfficeError = null
      state.finalizeByAreaOfficeSuccess = false
      state.finalizeByAreaOfficeMessage = null
      state.finalizedAreaOfficeBills = []
      state.filters = {}
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set filters
    setFilters: (state, action: PayloadAction<Partial<PostpaidBillingState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {}
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch postpaid bills cases
      .addCase(fetchPostpaidBills.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchPostpaidBills.fulfilled, (state, action: PayloadAction<PostpaidBillsResponse>) => {
        state.loading = false
        state.success = true
        state.bills = action.payload.data
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
      .addCase(fetchPostpaidBills.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch postpaid bills"
        state.success = false
        state.bills = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch postpaid bill by ID cases
      .addCase(fetchPostpaidBillById.pending, (state) => {
        state.currentBillLoading = true
        state.currentBillError = null
      })
      .addCase(fetchPostpaidBillById.fulfilled, (state, action: PayloadAction<PostpaidBill>) => {
        state.currentBillLoading = false
        state.currentBill = action.payload
        state.currentBillError = null
      })
      .addCase(fetchPostpaidBillById.rejected, (state, action) => {
        state.currentBillLoading = false
        state.currentBillError = (action.payload as string) || "Failed to fetch postpaid bill"
        state.currentBill = null
      })
      // Finalize billing period cases
      .addCase(finalizeBillingPeriod.pending, (state) => {
        state.finalizeLoading = true
        state.finalizeError = null
        state.finalizeSuccess = false
        state.finalizeMessage = null
      })
      .addCase(finalizeBillingPeriod.fulfilled, (state, action: PayloadAction<FinalizePeriodResponse>) => {
        state.finalizeLoading = false
        state.finalizeSuccess = true
        state.finalizeMessage = action.payload.message || "Billing period finalized successfully"
        state.finalizeError = null
      })
      .addCase(finalizeBillingPeriod.rejected, (state, action) => {
        state.finalizeLoading = false
        state.finalizeError = (action.payload as string) || "Failed to finalize billing period"
        state.finalizeSuccess = false
        state.finalizeMessage = null
      })
      // Finalize billing period by area office cases
      .addCase(finalizeBillingPeriodByAreaOffice.pending, (state) => {
        state.finalizeByAreaOfficeLoading = true
        state.finalizeByAreaOfficeError = null
        state.finalizeByAreaOfficeSuccess = false
        state.finalizeByAreaOfficeMessage = null
      })
      .addCase(
        finalizeBillingPeriodByAreaOffice.fulfilled,
        (state, action: PayloadAction<FinalizePeriodByAreaOfficeResponse>) => {
          state.finalizeByAreaOfficeLoading = false
          state.finalizeByAreaOfficeSuccess = true
          state.finalizeByAreaOfficeMessage =
            action.payload.message || "Billing period finalized successfully for area office"
          state.finalizedAreaOfficeBills = action.payload.data
          state.finalizeByAreaOfficeError = null
        }
      )
      .addCase(finalizeBillingPeriodByAreaOffice.rejected, (state, action) => {
        state.finalizeByAreaOfficeLoading = false
        state.finalizeByAreaOfficeError =
          (action.payload as string) || "Failed to finalize billing period for area office"
        state.finalizeByAreaOfficeSuccess = false
        state.finalizeByAreaOfficeMessage = null
        state.finalizedAreaOfficeBills = []
      })
  },
})

export const {
  clearBills,
  clearError,
  clearCurrentBill,
  clearFinalizeState,
  clearFinalizeByAreaOfficeState,
  resetBillingState,
  setPagination,
  setFilters,
  clearFilters,
} = postpaidSlice.actions

export default postpaidSlice.reducer
