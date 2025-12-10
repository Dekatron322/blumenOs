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
  totalPaid: number
  outstandingAmount: number
  reference: any
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
  publicReference: string
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
  customer?: {
    lastLoginAt: string | null
    suspensionReason: string | null
    suspendedAt: string | null
    distributionSubstationId: number
    distributionSubstationCode: string
    feederName: string
    areaOfficeName: string | null
    accountNumberHistory: any[]
    meterHistory: any[]
    id: number
    customerNumber: number
    customerID: string
    accountNumber: string
    autoNumber: string
    isCustomerNew: boolean
    isPostEnumerated: boolean
    statusCode: string
    isReadyforExtraction: boolean
    fullName: string
    phoneNumber: string
    phoneOffice: string
    gender: string
    email: string
    status: string
    isSuspended: boolean
    companyName: string | null
    address: string | null
    addressTwo: string | null
    city: string
    state: string
    lga: string
    serviceCenterId: number
    serviceCenterName: string
    latitude: number | null
    longitude: number | null
    tariff: number
    tariffCode: string
    tariffID: string
    tariffInddex: string
    tariffType: string
    tariffClass: string
    newRate: number | null
    vat: number
    isVATWaved: boolean
    meterNumber: string
    isPPM: boolean
    isMD: boolean
    isUrban: boolean
    isHRB: boolean
    isCustomerAccGovt: boolean
    comment: string | null
    band: string
    storedAverage: number | null
    totalMonthlyVend: number | null
    totalMonthlyDebt: number | null
    customerOutstandingDebtBalance: number | null
    salesRepUserId: number
    technicalEngineerUserId: number | null
    category: string | null
    subCategory: string | null
    salesRepUser: any
  } | null
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
  areaOfficeId?: number
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

// Manual Bill Interfaces
export interface CreateManualBillRequest {
  customerId: number
  period: string
  category: number
  feederId: number
  distributionSubstationId: number
  previousReadingKwh: number
  presentReadingKwh: number
  energyCapKwh: number
  tariffPerKwh: number
  vatRate: number
  isEstimated: boolean
  estimatedConsumptionKwh?: number
}

export interface CreateManualBillResponse {
  isSuccess: boolean
  message: string
  data: PostpaidBill
}

// Meter Reading Interfaces
export interface CreateMeterReadingRequest {
  customerId: number
  period: string
  previousReadingKwh: number
  presentReadingKwh: number
  notes?: string
}

export interface MeterReadingData {
  id: number
  customerId: number
  period: string
  previousReadingKwh: number
  presentReadingKwh: number
  capturedAtUtc: string
  capturedByUserId: number
  capturedByName: string
  customerName: string
  customerAccountNumber: string
  notes: string
  validConsumptionKwh: number
  invalidConsumptionKwh: number
  averageConsumptionBaselineKwh: number
  standardDeviationKwh: number
  lowThresholdKwh: number
  highThresholdKwh: number
  anomalyScore: number
  validationStatus: number
  isFlaggedForReview: boolean
  isRollover: boolean
  rolloverCount: number
  rolloverAdjustmentKwh: number
  estimatedConsumptionKwh: number
  validatedAtUtc: string | null
  validationNotes: string | null
}

export interface CreateMeterReadingResponse {
  isSuccess: boolean
  message: string
  data: MeterReadingData
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

  // Current bill by reference state
  currentBillByReference: PostpaidBill | null
  currentBillByReferenceLoading: boolean
  currentBillByReferenceError: string | null

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

  // Change Requests By Billing Job ID state
  changeRequestsByBillingJob: ChangeRequestListItem[]
  changeRequestsByBillingJobLoading: boolean
  changeRequestsByBillingJobError: string | null
  changeRequestsByBillingJobSuccess: boolean
  changeRequestsByBillingJobPagination: {
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

  // Create Manual Bill state
  createManualBillLoading: boolean
  createManualBillError: string | null
  createManualBillSuccess: boolean
  createManualBillMessage: string | null
  createdManualBill: PostpaidBill | null

  // Create Meter Reading state
  createMeterReadingLoading: boolean
  createMeterReadingError: string | null
  createMeterReadingSuccess: boolean
  createMeterReadingMessage: string | null
  createdMeterReading: MeterReadingData | null

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
  currentBillByReference: null,
  currentBillByReferenceLoading: false,
  currentBillByReferenceError: null,
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
  changeRequestsByBillingJob: [],
  changeRequestsByBillingJobLoading: false,
  changeRequestsByBillingJobError: null,
  changeRequestsByBillingJobSuccess: false,
  changeRequestsByBillingJobPagination: {
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
  createManualBillLoading: false,
  createManualBillError: null,
  createManualBillSuccess: false,
  createManualBillMessage: null,
  createdManualBill: null,
  createMeterReadingLoading: false,
  createMeterReadingError: null,
  createMeterReadingSuccess: false,
  createMeterReadingMessage: null,
  createdMeterReading: null,
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

export const fetchPostpaidBillByReference = createAsyncThunk<PostpaidBill, string, { rejectValue: string }>(
  "postpaidBilling/fetchPostpaidBillByReference",
  async (reference: string, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.POSTPAID_BILLING.GET_BY_REFERENCE, { reference })
      const response = await api.get<PostpaidBillResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch postpaid bill by reference")
      }

      if (!response.data.data) {
        return rejectWithValue("Postpaid bill not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch postpaid bill by reference")
      }
      return rejectWithValue(error.message || "Network error during postpaid bill by reference fetch")
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

// Change Request Async Thunks
export const submitChangeRequest = createAsyncThunk(
  "postpaidBilling/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.POSTPAID_BILLING.CHANGE_REQUEST, { id })
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request response data not found")
      }

      return {
        billingJobId: id,
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
  "postpaidBilling/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const response = await api.get<ChangeRequestsResponse>(
        buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.VIEW_CHANGE_REQUEST),
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            ...(status !== undefined && { Status: status }),
            ...(source !== undefined && { Source: source }),
            ...(reference && { Reference: reference }),
            ...(publicId && { PublicId: publicId }),
          },
        }
      )

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

export const fetchChangeRequestsByBillingJobId = createAsyncThunk(
  "postpaidBilling/fetchChangeRequestsByBillingJobId",
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

      const endpoint = buildEndpointWithParams(API_ENDPOINTS.POSTPAID_BILLING.CHANGE_REQUESTS_BY_ID, { id })
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
        return rejectWithValue(response.data.message || "Failed to fetch change requests for billing job")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests for billing job")
      }
      return rejectWithValue(error.message || "Network error during billing job change requests fetch")
    }
  }
)

export const fetchChangeRequestDetails = createAsyncThunk(
  "postpaidBilling/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.POSTPAID_BILLING.CHANGE_REQUEST_DETAILS, { identifier })
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
  "postpaidBilling/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.POSTPAID_BILLING.APPROVE_CHANGE_REQUEST, { publicId })
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
  "postpaidBilling/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.POSTPAID_BILLING.DECLINE_CHANGE_REQUEST, { publicId })
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

// Create Manual Bill Async Thunk
export const createManualBill = createAsyncThunk(
  "postpaidBilling/createManualBill",
  async (requestData: CreateManualBillRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateManualBillResponse>(
        buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.MANUAL_BILLS),
        requestData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create manual bill")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create manual bill")
      }
      return rejectWithValue(error.message || "Network error during manual bill creation")
    }
  }
)

// Create Meter Reading Async Thunk
export const createMeterReading = createAsyncThunk(
  "postpaidBilling/createMeterReading",
  async (requestData: CreateMeterReadingRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateMeterReadingResponse>(
        buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.METER_READINGS),
        requestData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create meter reading")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create meter reading")
      }
      return rejectWithValue(error.message || "Network error during meter reading creation")
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
      state.currentBillByReferenceError = null
      state.billingJobsError = null
      state.currentBillingJobError = null
      state.createBillingJobError = null
      state.finalizeError = null
      state.finalizeByAreaOfficeError = null
      state.changeRequestError = null
      state.changeRequestsError = null
      state.changeRequestsByBillingJobError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
      state.createManualBillError = null
      state.createMeterReadingError = null
    },

    // Clear current bill
    clearCurrentBill: (state) => {
      state.currentBill = null
      state.currentBillError = null
    },

    // Clear current bill by reference
    clearCurrentBillByReference: (state) => {
      state.currentBillByReference = null
      state.currentBillByReferenceError = null
      state.currentBillByReferenceLoading = false
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

    // Clear change requests by billing job state
    clearChangeRequestsByBillingJob: (state) => {
      state.changeRequestsByBillingJob = []
      state.changeRequestsByBillingJobError = null
      state.changeRequestsByBillingJobSuccess = false
      state.changeRequestsByBillingJobPagination = {
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

    // Clear create manual bill status
    clearCreateManualBillStatus: (state) => {
      state.createManualBillLoading = false
      state.createManualBillError = null
      state.createManualBillSuccess = false
      state.createManualBillMessage = null
      state.createdManualBill = null
    },

    // Clear create meter reading status
    clearCreateMeterReadingStatus: (state) => {
      state.createMeterReadingLoading = false
      state.createMeterReadingError = null
      state.createMeterReadingSuccess = false
      state.createMeterReadingMessage = null
      state.createdMeterReading = null
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
      state.currentBillByReference = null
      state.currentBillByReferenceLoading = false
      state.currentBillByReferenceError = null
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
      state.changeRequestsByBillingJob = []
      state.changeRequestsByBillingJobLoading = false
      state.changeRequestsByBillingJobError = null
      state.changeRequestsByBillingJobSuccess = false
      state.changeRequestsByBillingJobPagination = {
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
      state.createManualBillLoading = false
      state.createManualBillError = null
      state.createManualBillSuccess = false
      state.createManualBillMessage = null
      state.createdManualBill = null
      state.createMeterReadingLoading = false
      state.createMeterReadingError = null
      state.createMeterReadingSuccess = false
      state.createMeterReadingMessage = null
      state.createdMeterReading = null
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

    // Set change requests pagination
    setChangeRequestsPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsPagination.currentPage = action.payload.page
      state.changeRequestsPagination.pageSize = action.payload.pageSize
    },

    // Set change requests by billing job pagination
    setChangeRequestsByBillingJobPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsByBillingJobPagination.currentPage = action.payload.page
      state.changeRequestsByBillingJobPagination.pageSize = action.payload.pageSize
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
      // Fetch postpaid bill by reference cases
      .addCase(fetchPostpaidBillByReference.pending, (state) => {
        state.currentBillByReferenceLoading = true
        state.currentBillByReferenceError = null
      })
      .addCase(fetchPostpaidBillByReference.fulfilled, (state, action: PayloadAction<PostpaidBill>) => {
        state.currentBillByReferenceLoading = false
        state.currentBillByReference = action.payload
        state.currentBillByReferenceError = null
      })
      .addCase(fetchPostpaidBillByReference.rejected, (state, action) => {
        state.currentBillByReferenceLoading = false
        state.currentBillByReferenceError = (action.payload as string) || "Failed to fetch postpaid bill by reference"
        state.currentBillByReference = null
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
            billingJobId: number
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
      // Fetch change requests by billing job ID cases
      .addCase(fetchChangeRequestsByBillingJobId.pending, (state) => {
        state.changeRequestsByBillingJobLoading = true
        state.changeRequestsByBillingJobError = null
        state.changeRequestsByBillingJobSuccess = false
      })
      .addCase(fetchChangeRequestsByBillingJobId.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsByBillingJobLoading = false
        state.changeRequestsByBillingJobSuccess = true
        state.changeRequestsByBillingJob = action.payload.data || []
        state.changeRequestsByBillingJobPagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.changeRequestsByBillingJobError = null
      })
      .addCase(fetchChangeRequestsByBillingJobId.rejected, (state, action) => {
        state.changeRequestsByBillingJobLoading = false
        state.changeRequestsByBillingJobError =
          (action.payload as string) || "Failed to fetch change requests for billing job"
        state.changeRequestsByBillingJobSuccess = false
        state.changeRequestsByBillingJob = []
        state.changeRequestsByBillingJobPagination = {
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

          // Update the change request in the billing job-specific list if it exists
          const billingJobIndex = state.changeRequestsByBillingJob.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (billingJobIndex !== -1) {
            const req = state.changeRequestsByBillingJob[billingJobIndex]
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

          // Update the change request in the billing job-specific list if it exists
          const billingJobIndex = state.changeRequestsByBillingJob.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (billingJobIndex !== -1) {
            const req = state.changeRequestsByBillingJob[billingJobIndex]
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
      // Create manual bill cases
      .addCase(createManualBill.pending, (state) => {
        state.createManualBillLoading = true
        state.createManualBillError = null
        state.createManualBillSuccess = false
        state.createManualBillMessage = null
        state.createdManualBill = null
      })
      .addCase(createManualBill.fulfilled, (state, action: PayloadAction<CreateManualBillResponse>) => {
        state.createManualBillLoading = false
        state.createManualBillSuccess = true
        state.createManualBillMessage = action.payload.message || "Manual bill created successfully"
        state.createdManualBill = action.payload.data
        state.createManualBillError = null
      })
      .addCase(createManualBill.rejected, (state, action) => {
        state.createManualBillLoading = false
        state.createManualBillError = (action.payload as string) || "Failed to create manual bill"
        state.createManualBillSuccess = false
        state.createManualBillMessage = null
        state.createdManualBill = null
      })
      // Create meter reading cases
      .addCase(createMeterReading.pending, (state) => {
        state.createMeterReadingLoading = true
        state.createMeterReadingError = null
        state.createMeterReadingSuccess = false
        state.createMeterReadingMessage = null
        state.createdMeterReading = null
      })
      .addCase(createMeterReading.fulfilled, (state, action: PayloadAction<CreateMeterReadingResponse>) => {
        state.createMeterReadingLoading = false
        state.createMeterReadingSuccess = true
        state.createMeterReadingMessage = action.payload.message || "Meter reading created successfully"
        state.createdMeterReading = action.payload.data
        state.createMeterReadingError = null
      })
      .addCase(createMeterReading.rejected, (state, action) => {
        state.createMeterReadingLoading = false
        state.createMeterReadingError = (action.payload as string) || "Failed to create meter reading"
        state.createMeterReadingSuccess = false
        state.createMeterReadingMessage = null
        state.createdMeterReading = null
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
  clearCurrentBillByReference,
  clearFinalizeState,
  clearFinalizeByAreaOfficeState,
  clearChangeRequestStatus,
  clearChangeRequests,
  clearChangeRequestsByBillingJob,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
  clearCreateManualBillStatus,
  clearCreateMeterReadingStatus,
  resetBillingState,
  setPagination,
  setBillingJobsPagination,
  setChangeRequestsPagination,
  setChangeRequestsByBillingJobPagination,
  setFilters,
  setBillingJobsFilters,
  clearFilters,
  clearBillingJobsFilters,
} = postpaidSlice.actions

export default postpaidSlice.reducer
