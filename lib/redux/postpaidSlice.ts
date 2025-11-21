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

// Billing Job Interfaces
export interface BillingJob {
  id: number
  period: string
  areaOfficeId: number
  areaOfficeName: string
  status: number
  draftedCount: number
  finalizedCount: number
  skippedCount: number
  totalCustomers: number
  processedCustomers: number
  lastError: string
  requestedAtUtc: string
  startedAtUtc: string
  completedAtUtc: string
  requestedByUserId: number
  requestedByName: string
}

export interface BillingJobResponse {
  isSuccess: boolean
  message: string
  data: BillingJob
}

export interface BillingJobsResponse {
  isSuccess: boolean
  message: string
  data: BillingJob[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface BillingJobsRequestParams {
  pageNumber: number
  pageSize: number
  period?: string
  areaOfficeId?: number
  status?: number
  fromRequestedAtUtc?: string
  toRequestedAtUtc?: string
}

// Create Billing Job Interfaces
export interface CreateBillingJobRequest {
  period: string
  areaOfficeId: number
}

export interface CreateBillingJobResponse {
  isSuccess: boolean
  message: string
  data: BillingJob
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

  // Billing jobs state
  billingJobs: BillingJob[]
  billingJobsLoading: boolean
  billingJobsError: string | null
  billingJobsSuccess: boolean
  billingJobsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Current billing job state (for viewing details)
  currentBillingJob: BillingJob | null
  currentBillingJobLoading: boolean
  currentBillingJobError: string | null

  // Create billing job state
  createBillingJobLoading: boolean
  createBillingJobError: string | null
  createBillingJobSuccess: boolean
  createBillingJobMessage: string | null
  createdBillingJob: BillingJob | null

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

  // Billing jobs filters
  billingJobsFilters: {
    period?: string
    areaOfficeId?: number
    status?: number
    fromRequestedAtUtc?: string
    toRequestedAtUtc?: string
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
  billingJobs: [],
  billingJobsLoading: false,
  billingJobsError: null,
  billingJobsSuccess: false,
  billingJobsPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  currentBillingJob: null,
  currentBillingJobLoading: false,
  currentBillingJobError: null,
  createBillingJobLoading: false,
  createBillingJobError: null,
  createBillingJobSuccess: false,
  createBillingJobMessage: null,
  createdBillingJob: null,
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
  billingJobsFilters: {},
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

export const fetchBillingJobs = createAsyncThunk(
  "postpaidBilling/fetchBillingJobs",
  async (params: BillingJobsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, period, areaOfficeId, status, fromRequestedAtUtc, toRequestedAtUtc } = params

      const response = await api.get<BillingJobsResponse>(buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.BILLING_JOBS), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(period && { Period: period }),
          ...(areaOfficeId && { AreaOfficeId: areaOfficeId }),
          ...(status !== undefined && { Status: status }),
          ...(fromRequestedAtUtc && { FromRequestedAtUtc: fromRequestedAtUtc }),
          ...(toRequestedAtUtc && { ToRequestedAtUtc: toRequestedAtUtc }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch billing jobs")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch billing jobs")
      }
      return rejectWithValue(error.message || "Network error during billing jobs fetch")
    }
  }
)

export const fetchBillingJobById = createAsyncThunk<BillingJob, number, { rejectValue: string }>(
  "postpaidBilling/fetchBillingJobById",
  async (jobId: number, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.POSTPAID_BILLING.BILLING_JOBS_BY_ID, { id: jobId })
      const response = await api.get<BillingJobResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch billing job")
      }

      if (!response.data.data) {
        return rejectWithValue("Billing job not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch billing job")
      }
      return rejectWithValue(error.message || "Network error during billing job fetch")
    }
  }
)

export const createBillingJob = createAsyncThunk(
  "postpaidBilling/createBillingJob",
  async (requestData: CreateBillingJobRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateBillingJobResponse>(
        buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.ADD_BILLING_JOB),
        requestData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create billing job")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create billing job")
      }
      return rejectWithValue(error.message || "Network error during billing job creation")
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

    // Clear billing jobs state
    clearBillingJobs: (state) => {
      state.billingJobs = []
      state.billingJobsError = null
      state.billingJobsSuccess = false
      state.billingJobsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear current billing job state
    clearCurrentBillingJob: (state) => {
      state.currentBillingJob = null
      state.currentBillingJobError = null
      state.currentBillingJobLoading = false
    },

    // Clear create billing job state
    clearCreateBillingJob: (state) => {
      state.createBillingJobLoading = false
      state.createBillingJobError = null
      state.createBillingJobSuccess = false
      state.createBillingJobMessage = null
      state.createdBillingJob = null
    },

    // Clear errors
    clearError: (state) => {
      state.error = null
      state.currentBillError = null
      state.billingJobsError = null
      state.currentBillingJobError = null
      state.createBillingJobError = null
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
      state.billingJobs = []
      state.billingJobsLoading = false
      state.billingJobsError = null
      state.billingJobsSuccess = false
      state.billingJobsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.currentBillingJob = null
      state.currentBillingJobLoading = false
      state.currentBillingJobError = null
      state.createBillingJobLoading = false
      state.createBillingJobError = null
      state.createBillingJobSuccess = false
      state.createBillingJobMessage = null
      state.createdBillingJob = null
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
      state.billingJobsFilters = {}
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set billing jobs pagination
    setBillingJobsPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.billingJobsPagination.currentPage = action.payload.page
      state.billingJobsPagination.pageSize = action.payload.pageSize
    },

    // Set filters
    setFilters: (state, action: PayloadAction<Partial<PostpaidBillingState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    // Set billing jobs filters
    setBillingJobsFilters: (state, action: PayloadAction<Partial<PostpaidBillingState["billingJobsFilters"]>>) => {
      state.billingJobsFilters = { ...state.billingJobsFilters, ...action.payload }
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {}
    },

    // Clear billing jobs filters
    clearBillingJobsFilters: (state) => {
      state.billingJobsFilters = {}
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
      // Fetch billing jobs cases
      .addCase(fetchBillingJobs.pending, (state) => {
        state.billingJobsLoading = true
        state.billingJobsError = null
        state.billingJobsSuccess = false
      })
      .addCase(fetchBillingJobs.fulfilled, (state, action: PayloadAction<BillingJobsResponse>) => {
        state.billingJobsLoading = false
        state.billingJobsSuccess = true
        state.billingJobs = action.payload.data
        state.billingJobsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
        state.billingJobsError = null
      })
      .addCase(fetchBillingJobs.rejected, (state, action) => {
        state.billingJobsLoading = false
        state.billingJobsError = (action.payload as string) || "Failed to fetch billing jobs"
        state.billingJobsSuccess = false
        state.billingJobs = []
        state.billingJobsPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch billing job by ID cases
      .addCase(fetchBillingJobById.pending, (state) => {
        state.currentBillingJobLoading = true
        state.currentBillingJobError = null
      })
      .addCase(fetchBillingJobById.fulfilled, (state, action: PayloadAction<BillingJob>) => {
        state.currentBillingJobLoading = false
        state.currentBillingJob = action.payload
        state.currentBillingJobError = null
      })
      .addCase(fetchBillingJobById.rejected, (state, action) => {
        state.currentBillingJobLoading = false
        state.currentBillingJobError = (action.payload as string) || "Failed to fetch billing job"
        state.currentBillingJob = null
      })
      // Create billing job cases
      .addCase(createBillingJob.pending, (state) => {
        state.createBillingJobLoading = true
        state.createBillingJobError = null
        state.createBillingJobSuccess = false
        state.createBillingJobMessage = null
        state.createdBillingJob = null
      })
      .addCase(createBillingJob.fulfilled, (state, action: PayloadAction<CreateBillingJobResponse>) => {
        state.createBillingJobLoading = false
        state.createBillingJobSuccess = true
        state.createBillingJobMessage = action.payload.message || "Billing job created successfully"
        state.createdBillingJob = action.payload.data
        state.createBillingJobError = null
      })
      .addCase(createBillingJob.rejected, (state, action) => {
        state.createBillingJobLoading = false
        state.createBillingJobError = (action.payload as string) || "Failed to create billing job"
        state.createBillingJobSuccess = false
        state.createBillingJobMessage = null
        state.createdBillingJob = null
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
  clearBillingJobs,
  clearCurrentBillingJob,
  clearCreateBillingJob,
  clearError,
  clearCurrentBill,
  clearFinalizeState,
  clearFinalizeByAreaOfficeState,
  resetBillingState,
  setPagination,
  setBillingJobsPagination,
  setFilters,
  setBillingJobsFilters,
  clearFilters,
  clearBillingJobsFilters,
} = postpaidSlice.actions

export default postpaidSlice.reducer
