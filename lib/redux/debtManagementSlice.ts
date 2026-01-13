// src/lib/redux/debtManagementSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Request parameters interface for fetching recovery summary
export interface RecoverySummaryRequest {
  FromUtc: string
  ToUtc: string
  CustomerId?: number
}

// Recovery summary data item interface
export interface RecoverySummaryItem {
  periodKey: string
  totalRecoveredAmount: number
  totalRecoveries: number
}

// Response interface for recovery summary
export interface RecoverySummaryResponse {
  isSuccess: boolean
  message: string
  data: RecoverySummaryItem[]
}

// Request parameters interface for fetching debt management customers
export interface DebtManagementCustomersRequest {
  PageNumber: number
  PageSize: number
  Search?: string
  SortDirection: 1 | 2 // 1: Ascending, 2: Descending
  MinDebt?: number
  MaxDebt?: number
  AreaOfficeId?: number
  FeederId?: number
  DistributionSubstationId?: number
  SalesRepUserId?: number
  ServiceCenterId?: number
  ProvinceId?: number
}

// Debt management customer interface
export interface DebtManagementCustomer {
  customerId: number
  customerName: string
  accountNumber: string
  totalDebits: number
  totalCredits: number
  outstandingBalance: number
  lastLedgerAtUtc: string
}

// Response interface for debt management customers
export interface DebtManagementCustomersResponse {
  isSuccess: boolean
  message: string
  data: DebtManagementCustomer[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Aging bucket interface
export interface AgingBucket {
  name: string
  minDays: number
  maxDays: number
  amount: number
  entryCount: number
}

// Aging data item interface
export interface AgingDataItem {
  customerId: number
  customerName: string
  accountNumber: string
  outstandingBalance: number
  maxAgeDays: number
  status: string
  buckets: AgingBucket[]
}

// Response interface for aging data
export interface AgingResponse {
  isSuccess: boolean
  message: string
  data: AgingDataItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Recovery policy interface
export interface RecoveryPolicy {
  id: number
  name: string
  customerId: number
  scope: number
  recoveryType: number
  recoveryValue: number
  triggerThresholdAmount: number
  minimumMonthlyRecovery: number
  minRecoveryAmount: number
  maxRecoveryAmount: number
  bucketName: string
  applyBeforeBill: boolean
  enforcementEnabled: boolean
  enforcementBucketName: string
  enforcementMinAgeDays: number
  enforcementMonthlyMinimum: number
  enforcementGraceDays: number
  enforcementMode: number
  enforcementStartAtUtc: string
  isActive: boolean
  isPaused: boolean
  effectiveFromUtc: string
  effectiveToUtc: string
  createdAt: string
  lastUpdated: string
}

// Request parameters interface for fetching recovery policies
export interface RecoveryPoliciesRequest {
  PageNumber: number
  PageSize: number
  CustomerId?: number
  IsActive?: boolean
  IsPaused?: boolean
}

// Response interface for recovery policies
export interface RecoveryPoliciesResponse {
  isSuccess: boolean
  message: string
  data: RecoveryPolicy[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Request interface for creating recovery policy
export interface CreateRecoveryPolicyRequest {
  name: string
  customerId: number
  recoveryType: number
  recoveryValue: number
  triggerThresholdAmount: number
  minimumMonthlyRecovery: number
  minRecoveryAmount: number
  maxRecoveryAmount: number
  bucketName: string
  applyBeforeBill: boolean
  enforcementEnabled: boolean
  enforcementBucketName: string
  enforcementMinAgeDays: number
  enforcementMonthlyMinimum: number
  enforcementGraceDays: number
  enforcementMode: number
  enforcementStartAtUtc: string
  isActive: boolean
  isPaused: boolean
  effectiveFromUtc: string
  effectiveToUtc: string
}

// Response interface for creating recovery policy
export interface CreateRecoveryPolicyResponse {
  isSuccess: boolean
  message: string
  data: RecoveryPolicy
}

// Response interface for pausing recovery policy
export interface PauseRecoveryPolicyResponse {
  isSuccess: boolean
  message: string
  data: RecoveryPolicy
}

// Response interface for resuming recovery policy
export interface ResumeRecoveryPolicyResponse {
  isSuccess: boolean
  message: string
  data: RecoveryPolicy
}

// Request parameters interface for fetching debt recovery data
export interface DebtRecoveryRequest {
  PageNumber: number
  PageSize: number
  CustomerId?: number
  PolicyId?: number
  FromUtc?: string
  ToUtc?: string
}

// Debt recovery data item interface
export interface DebtRecoveryItem {
  id: number
  customerId: number
  customerName: string
  accountNumber: string
  paymentTransactionId: number
  paymentReference: string
  policyId: number
  policyName: string
  bucketName: string
  ageDays: number
  incomingAmount: number
  recoveryAmount: number
  outstandingBefore: number
  outstandingAfter: number
  recoveryPeriodKey: string
  recoveryType: number
  recoveryValue: number
  triggerThresholdAmount: number
  appliedBeforeBill: boolean
  ledgerEntryId: number
  createdAt: string
}

// Response interface for debt recovery
export interface DebtRecoveryResponse {
  isSuccess: boolean
  message: string
  data: DebtRecoveryItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Request interface for creating debt entry
export interface CreateDebtEntryRequest {
  customerId: number
  amount: number
  paymentTypeId: number
  reason: string
  effectiveAtUtc: string
}

// Debt entry data interface
export interface DebtEntryData {
  id: number
  customerId: number
  customerName: string
  customerAccountNumber: string
  amount: number
  paymentTypeId: number
  paymentTypeName: string
  reason: string
  status: number
  createdByUserId: number
  createdByName: string
  approvedByUserId: number
  approvedByName: string
  approvedAtUtc: string
  effectiveAtUtc: string
  ledgerEntryId: number
  createdAt: string
}

// Response interface for creating debt entry
export interface CreateDebtEntryResponse {
  isSuccess: boolean
  message: string
  data: DebtEntryData
}

// Request parameters interface for fetching all debt entries
export interface AllDebtEntriesRequest {
  PageNumber: number
  PageSize: number
  CustomerId?: number
  Status?: 1 | 2 | 3 // 1: Pending, 2: Approved, 3: Rejected
  PaymentTypeId?: number
}

// Response interface for all debt entries
export interface AllDebtEntriesResponse {
  isSuccess: boolean
  message: string
  data: DebtEntryData[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Response interface for debt entry detail
export interface DebtEntryDetailResponse {
  isSuccess: boolean
  message: string
  data: DebtEntryData
}

// Response interface for approving debt entry
export interface ApproveDebtEntryResponse {
  isSuccess: boolean
  message: string
  data: DebtEntryData
}

// Debt Management State
interface DebtManagementState {
  // Fetch recovery summary state
  recoverySummaryLoading: boolean
  recoverySummaryError: string | null
  recoverySummarySuccess: boolean
  recoverySummary: RecoverySummaryItem[]

  // Fetch debt management customers state
  customersLoading: boolean
  customersError: string | null
  customersSuccess: boolean
  customers: DebtManagementCustomer[]
  customersPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Fetch aging data state
  agingLoading: boolean
  agingError: string | null
  agingSuccess: boolean
  aging: AgingDataItem[]
  agingPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Request parameters
  requestParams: RecoverySummaryRequest | null
  customersRequestParams: DebtManagementCustomersRequest | null
  agingRequestParams: DebtManagementCustomersRequest | null

  // Create debt entry state
  createDebtEntryLoading: boolean
  createDebtEntryError: string | null
  createDebtEntrySuccess: boolean
  createdDebtEntry: DebtEntryData | null

  // All debt entries state
  allDebtEntriesLoading: boolean
  allDebtEntriesError: string | null
  allDebtEntriesSuccess: boolean
  allDebtEntries: DebtEntryData[]
  allDebtEntriesPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  allDebtEntriesRequestParams: AllDebtEntriesRequest | null

  // Debt entry detail state
  debtEntryDetailLoading: boolean
  debtEntryDetailError: string | null
  debtEntryDetailSuccess: boolean
  debtEntryDetail: DebtEntryData | null

  // Approve debt entry state
  approveDebtEntryLoading: boolean
  approveDebtEntryError: string | null
  approveDebtEntrySuccess: boolean
  approvedDebtEntry: DebtEntryData | null

  // Recovery policies state
  recoveryPoliciesLoading: boolean
  recoveryPoliciesError: string | null
  recoveryPoliciesSuccess: boolean
  recoveryPolicies: RecoveryPolicy[]
  recoveryPoliciesPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  recoveryPoliciesRequestParams: RecoveryPoliciesRequest | null

  // Create recovery policy state
  createRecoveryPolicyLoading: boolean
  createRecoveryPolicyError: string | null
  createRecoveryPolicySuccess: boolean
  createdRecoveryPolicy: RecoveryPolicy | null

  // Pause recovery policy state
  pauseRecoveryPolicyLoading: boolean
  pauseRecoveryPolicyError: string | null
  pauseRecoveryPolicySuccess: boolean
  pausedRecoveryPolicy: RecoveryPolicy | null

  // Resume recovery policy state
  resumeRecoveryPolicyLoading: boolean
  resumeRecoveryPolicyError: string | null
  resumeRecoveryPolicySuccess: boolean
  resumedRecoveryPolicy: RecoveryPolicy | null

  // Debt recovery state
  debtRecoveryLoading: boolean
  debtRecoveryError: string | null
  debtRecoverySuccess: boolean
  debtRecovery: DebtRecoveryItem[]
  debtRecoveryPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  debtRecoveryRequestParams: DebtRecoveryRequest | null
}

// Initial state
const initialState: DebtManagementState = {
  recoverySummaryLoading: false,
  recoverySummaryError: null,
  recoverySummarySuccess: false,
  recoverySummary: [],
  requestParams: null,

  customersLoading: false,
  customersError: null,
  customersSuccess: false,
  customers: [],
  customersPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  customersRequestParams: null,

  agingLoading: false,
  agingError: null,
  agingSuccess: false,
  aging: [],
  agingPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  agingRequestParams: null,

  createDebtEntryLoading: false,
  createDebtEntryError: null,
  createDebtEntrySuccess: false,
  createdDebtEntry: null,

  allDebtEntriesLoading: false,
  allDebtEntriesError: null,
  allDebtEntriesSuccess: false,
  allDebtEntries: [],
  allDebtEntriesPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  allDebtEntriesRequestParams: null,

  debtEntryDetailLoading: false,
  debtEntryDetailError: null,
  debtEntryDetailSuccess: false,
  debtEntryDetail: null,

  approveDebtEntryLoading: false,
  approveDebtEntryError: null,
  approveDebtEntrySuccess: false,
  approvedDebtEntry: null,

  recoveryPoliciesLoading: false,
  recoveryPoliciesError: null,
  recoveryPoliciesSuccess: false,
  recoveryPolicies: [],
  recoveryPoliciesPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  recoveryPoliciesRequestParams: null,

  createRecoveryPolicyLoading: false,
  createRecoveryPolicyError: null,
  createRecoveryPolicySuccess: false,
  createdRecoveryPolicy: null,

  pauseRecoveryPolicyLoading: false,
  pauseRecoveryPolicyError: null,
  pauseRecoveryPolicySuccess: false,
  pausedRecoveryPolicy: null,

  resumeRecoveryPolicyLoading: false,
  resumeRecoveryPolicyError: null,
  resumeRecoveryPolicySuccess: false,
  resumedRecoveryPolicy: null,

  debtRecoveryLoading: false,
  debtRecoveryError: null,
  debtRecoverySuccess: false,
  debtRecovery: [],
  debtRecoveryPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false,
  },
  debtRecoveryRequestParams: null,
}

// Async thunk for fetching recovery summary
export const fetchRecoverySummary = createAsyncThunk(
  "debtManagement/fetchRecoverySummary",
  async (params: RecoverySummaryRequest, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("FromUtc", params.FromUtc)
      queryParams.append("ToUtc", params.ToUtc)

      if (params.CustomerId !== undefined && params.CustomerId !== null) {
        queryParams.append("CustomerId", params.CustomerId.toString())
      }

      const url = `${buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.SUMMARY)}?${queryParams.toString()}`
      const response = await api.get<RecoverySummaryResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch recovery summary")
      }

      return {
        data: response.data,
        requestParams: params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch recovery summary")
      }
      return rejectWithValue(error.message || "Network error during recovery summary fetch")
    }
  }
)

// Async thunk for fetching debt management customers
export const fetchDebtManagementCustomers = createAsyncThunk(
  "debtManagement/fetchDebtManagementCustomers",
  async (params: DebtManagementCustomersRequest, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())
      queryParams.append("SortDirection", params.SortDirection.toString())

      if (params.Search !== undefined && params.Search !== null) {
        queryParams.append("Search", params.Search)
      }
      if (params.MinDebt !== undefined && params.MinDebt !== null) {
        queryParams.append("MinDebt", params.MinDebt.toString())
      }
      if (params.MaxDebt !== undefined && params.MaxDebt !== null) {
        queryParams.append("MaxDebt", params.MaxDebt.toString())
      }
      if (params.AreaOfficeId !== undefined && params.AreaOfficeId !== null) {
        queryParams.append("AreaOfficeId", params.AreaOfficeId.toString())
      }
      if (params.FeederId !== undefined && params.FeederId !== null) {
        queryParams.append("FeederId", params.FeederId.toString())
      }
      if (params.DistributionSubstationId !== undefined && params.DistributionSubstationId !== null) {
        queryParams.append("DistributionSubstationId", params.DistributionSubstationId.toString())
      }
      if (params.SalesRepUserId !== undefined && params.SalesRepUserId !== null) {
        queryParams.append("SalesRepUserId", params.SalesRepUserId.toString())
      }
      if (params.ServiceCenterId !== undefined && params.ServiceCenterId !== null) {
        queryParams.append("ServiceCenterId", params.ServiceCenterId.toString())
      }
      if (params.ProvinceId !== undefined && params.ProvinceId !== null) {
        queryParams.append("ProvinceId", params.ProvinceId.toString())
      }

      const url = `${buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.GET)}?${queryParams.toString()}`
      const response = await api.get<DebtManagementCustomersResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch debt management customers")
      }

      return {
        data: response.data,
        requestParams: params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch debt management customers")
      }
      return rejectWithValue(error.message || "Network error during customers fetch")
    }
  }
)

// Async thunk for fetching aging data
export const fetchAgingData = createAsyncThunk(
  "debtManagement/fetchAgingData",
  async (params: DebtManagementCustomersRequest, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())
      queryParams.append("SortDirection", params.SortDirection.toString())

      if (params.Search !== undefined && params.Search !== null) {
        queryParams.append("Search", params.Search)
      }
      if (params.MinDebt !== undefined && params.MinDebt !== null) {
        queryParams.append("MinDebt", params.MinDebt.toString())
      }
      if (params.MaxDebt !== undefined && params.MaxDebt !== null) {
        queryParams.append("MaxDebt", params.MaxDebt.toString())
      }
      if (params.AreaOfficeId !== undefined && params.AreaOfficeId !== null) {
        queryParams.append("AreaOfficeId", params.AreaOfficeId.toString())
      }
      if (params.FeederId !== undefined && params.FeederId !== null) {
        queryParams.append("FeederId", params.FeederId.toString())
      }
      if (params.DistributionSubstationId !== undefined && params.DistributionSubstationId !== null) {
        queryParams.append("DistributionSubstationId", params.DistributionSubstationId.toString())
      }
      if (params.SalesRepUserId !== undefined && params.SalesRepUserId !== null) {
        queryParams.append("SalesRepUserId", params.SalesRepUserId.toString())
      }
      if (params.ServiceCenterId !== undefined && params.ServiceCenterId !== null) {
        queryParams.append("ServiceCenterId", params.ServiceCenterId.toString())
      }
      if (params.ProvinceId !== undefined && params.ProvinceId !== null) {
        queryParams.append("ProvinceId", params.ProvinceId.toString())
      }

      const url = `${buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.AGING)}?${queryParams.toString()}`
      const response = await api.get<AgingResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch aging data")
      }

      return {
        data: response.data,
        requestParams: params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch aging data")
      }
      return rejectWithValue(error.message || "Network error during aging data fetch")
    }
  }
)

// Async thunk for creating debt entry
export const createDebtEntry = createAsyncThunk(
  "debtManagement/createDebtEntry",
  async (params: CreateDebtEntryRequest, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.ENTRIES)
      const response = await api.post<CreateDebtEntryResponse>(url, params)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create debt entry")
      }

      return {
        data: response.data,
        requestParams: params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create debt entry")
      }
      return rejectWithValue(error.message || "Network error during debt entry creation")
    }
  }
)

// Async thunk for fetching all debt entries
export const fetchAllDebtEntries = createAsyncThunk(
  "debtManagement/fetchAllDebtEntries",
  async (params: AllDebtEntriesRequest, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.CustomerId !== undefined && params.CustomerId !== null) {
        queryParams.append("CustomerId", params.CustomerId.toString())
      }
      if (params.Status !== undefined && params.Status !== null) {
        queryParams.append("Status", params.Status.toString())
      }
      if (params.PaymentTypeId !== undefined && params.PaymentTypeId !== null) {
        queryParams.append("PaymentTypeId", params.PaymentTypeId.toString())
      }

      const url = `${buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.ALL_ENTRIES)}?${queryParams.toString()}`
      const response = await api.get<AllDebtEntriesResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch all debt entries")
      }

      return {
        data: response.data,
        requestParams: params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch all debt entries")
      }
      return rejectWithValue(error.message || "Network error during all debt entries fetch")
    }
  }
)

// Fetch recovery policies
export const fetchRecoveryPolicies = createAsyncThunk(
  "debtManagement/fetchRecoveryPolicies",
  async (params: RecoveryPoliciesRequest, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.CustomerId !== undefined) {
        queryParams.append("CustomerId", params.CustomerId.toString())
      }
      if (params.IsActive !== undefined) {
        queryParams.append("IsActive", params.IsActive.toString())
      }
      if (params.IsPaused !== undefined) {
        queryParams.append("IsPaused", params.IsPaused.toString())
      }

      const response = await api.get<RecoveryPoliciesResponse>(
        `${buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.RECOVERY_POLICIES)}?${queryParams.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch recovery policies")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch recovery policies")
      }
      return rejectWithValue(error.message || "Network error during recovery policies fetch")
    }
  }
)

// Create recovery policy
export const createRecoveryPolicy = createAsyncThunk(
  "debtManagement/createRecoveryPolicy",
  async (params: CreateRecoveryPolicyRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateRecoveryPolicyResponse>(
        buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.ADD_RECOVERY_POLICY),
        params
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create recovery policy")
      }

      return {
        data: response.data,
        requestParams: params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create recovery policy")
      }
      return rejectWithValue(error.message || "Network error during recovery policy creation")
    }
  }
)

// Pause recovery policy
export const pauseRecoveryPolicy = createAsyncThunk(
  "debtManagement/pauseRecoveryPolicy",
  async (id: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.PAUSE.replace("{id}", id.toString()))
      const response = await api.post<PauseRecoveryPolicyResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to pause recovery policy")
      }

      return {
        data: response.data,
        policyId: id,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to pause recovery policy")
      }
      return rejectWithValue(error.message || "Network error during recovery policy pause")
    }
  }
)

// Resume recovery policy
export const resumeRecoveryPolicy = createAsyncThunk(
  "debtManagement/resumeRecoveryPolicy",
  async (id: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.RESUME.replace("{id}", id.toString()))
      const response = await api.post<ResumeRecoveryPolicyResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to resume recovery policy")
      }

      return {
        data: response.data,
        policyId: id,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to resume recovery policy")
      }
      return rejectWithValue(error.message || "Network error during recovery policy resume")
    }
  }
)

// Fetch debt entry detail
export const fetchDebtEntryDetail = createAsyncThunk(
  "debtManagement/fetchDebtEntryDetail",
  async (entryId: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.ENTRY_DETAIL.replace("{entryId}", entryId.toString()))
      const response = await api.get<DebtEntryDetailResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch debt entry detail")
      }

      return {
        data: response.data,
        entryId: entryId,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch debt entry detail")
      }
      return rejectWithValue(error.message || "Network error during debt entry detail fetch")
    }
  }
)

// Approve debt entry
export const approveDebtEntry = createAsyncThunk(
  "debtManagement/approveDebtEntry",
  async (entryId: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.APPROVE_ENTRY.replace("{entryId}", entryId.toString()))
      const response = await api.post<ApproveDebtEntryResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to approve debt entry")
      }

      return {
        data: response.data,
        entryId: entryId,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to approve debt entry")
      }
      return rejectWithValue(error.message || "Network error during debt entry approval")
    }
  }
)

// Async thunk for fetching debt recovery data
export const fetchDebtRecovery = createAsyncThunk(
  "debtManagement/fetchDebtRecovery",
  async (params: DebtRecoveryRequest, { rejectWithValue }) => {
    try {
      // Ensure valid pagination parameters
      const validParams = {
        ...params,
        PageNumber: Math.max(1, params.PageNumber),
        PageSize: Math.max(1, params.PageSize),
      }

      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", validParams.PageNumber.toString())
      queryParams.append("PageSize", validParams.PageSize.toString())

      if (validParams.CustomerId !== undefined && validParams.CustomerId !== null) {
        queryParams.append("CustomerId", validParams.CustomerId.toString())
      }
      if (validParams.PolicyId !== undefined && validParams.PolicyId !== null) {
        queryParams.append("PolicyId", validParams.PolicyId.toString())
      }
      if (validParams.FromUtc !== undefined && validParams.FromUtc !== null) {
        queryParams.append("FromUtc", validParams.FromUtc)
      }
      if (validParams.ToUtc !== undefined && validParams.ToUtc !== null) {
        queryParams.append("ToUtc", validParams.ToUtc)
      }

      const url = `${buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.DEBT_RECOVERY)}?${queryParams.toString()}`
      const response = await api.get<DebtRecoveryResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch debt recovery data")
      }

      return {
        data: response.data,
        requestParams: validParams,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch debt recovery data")
      }
      return rejectWithValue(error.message || "Network error during debt recovery data fetch")
    }
  }
)

// Debt Management slice
const debtManagementSlice = createSlice({
  name: "debtManagement",
  initialState,
  reducers: {
    // Clear recovery summary state
    clearRecoverySummaryState: (state) => {
      state.recoverySummaryLoading = false
      state.recoverySummaryError = null
      state.recoverySummarySuccess = false
      state.recoverySummary = []
      state.requestParams = null
    },

    // Clear errors
    clearError: (state) => {
      state.recoverySummaryError = null
    },

    // Reset debt management state
    resetDebtManagementState: () => {
      return initialState
    },

    // Set recovery summary data manually (if needed for caching or testing)
    setRecoverySummary: (state, action: PayloadAction<RecoverySummaryItem[]>) => {
      state.recoverySummary = action.payload
      state.recoverySummarySuccess = true
    },

    // Update request parameters
    setRequestParams: (state, action: PayloadAction<RecoverySummaryRequest>) => {
      state.requestParams = action.payload
    },

    // Clear customers state
    clearCustomersState: (state) => {
      state.customersLoading = false
      state.customersError = null
      state.customersSuccess = false
      state.customers = []
      state.customersPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
      state.customersRequestParams = null
    },

    // Set customers data manually (if needed for caching or testing)
    setCustomers: (state, action: PayloadAction<DebtManagementCustomer[]>) => {
      state.customers = action.payload
      state.customersSuccess = true
    },

    // Update customers request parameters
    setCustomersRequestParams: (state, action: PayloadAction<DebtManagementCustomersRequest>) => {
      state.customersRequestParams = action.payload
    },

    // Clear aging state
    clearAgingState: (state) => {
      state.agingLoading = false
      state.agingError = null
      state.agingSuccess = false
      state.aging = []
      state.agingPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
      state.agingRequestParams = null
    },

    // Set aging data manually (if needed for caching or testing)
    setAging: (state, action: PayloadAction<AgingDataItem[]>) => {
      state.aging = action.payload
      state.agingSuccess = true
    },

    // Update aging request parameters
    setAgingRequestParams: (state, action: PayloadAction<DebtManagementCustomersRequest>) => {
      state.agingRequestParams = action.payload
    },

    // Clear create debt entry state
    clearCreateDebtEntryState: (state) => {
      state.createDebtEntryLoading = false
      state.createDebtEntryError = null
      state.createDebtEntrySuccess = false
      state.createdDebtEntry = null
    },

    // Set created debt entry manually (if needed for caching or testing)
    setCreatedDebtEntry: (state, action: PayloadAction<DebtEntryData>) => {
      state.createdDebtEntry = action.payload
      state.createDebtEntrySuccess = true
    },

    // Clear all debt entries state
    clearAllDebtEntriesState: (state) => {
      state.allDebtEntriesLoading = false
      state.allDebtEntriesError = null
      state.allDebtEntriesSuccess = false
      state.allDebtEntries = []
      state.allDebtEntriesPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
      state.allDebtEntriesRequestParams = null
    },

    // Clear recovery policies state
    clearRecoveryPoliciesState: (state) => {
      state.recoveryPoliciesLoading = false
      state.recoveryPoliciesError = null
      state.recoveryPoliciesSuccess = false
      state.recoveryPolicies = []
      state.recoveryPoliciesPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
      state.recoveryPoliciesRequestParams = null
    },

    // Clear create recovery policy state
    clearCreateRecoveryPolicyState: (state) => {
      state.createRecoveryPolicyLoading = false
      state.createRecoveryPolicyError = null
      state.createRecoveryPolicySuccess = false
      state.createdRecoveryPolicy = null
    },

    // Clear pause recovery policy state
    clearPauseRecoveryPolicyState: (state) => {
      state.pauseRecoveryPolicyLoading = false
      state.pauseRecoveryPolicyError = null
      state.pauseRecoveryPolicySuccess = false
      state.pausedRecoveryPolicy = null
    },

    // Clear resume recovery policy state
    clearResumeRecoveryPolicyState: (state) => {
      state.resumeRecoveryPolicyLoading = false
      state.resumeRecoveryPolicyError = null
      state.resumeRecoveryPolicySuccess = false
      state.resumedRecoveryPolicy = null
    },

    // Set all debt entries data manually (if needed for caching or testing)
    setAllDebtEntries: (state, action: PayloadAction<DebtEntryData[]>) => {
      state.allDebtEntries = action.payload
      state.allDebtEntriesSuccess = true
    },

    // Update all debt entries request parameters
    setAllDebtEntriesRequestParams: (state, action: PayloadAction<AllDebtEntriesRequest>) => {
      state.allDebtEntriesRequestParams = action.payload
    },

    // Clear debt entry detail state
    clearDebtEntryDetailState: (state) => {
      state.debtEntryDetailLoading = false
      state.debtEntryDetailError = null
      state.debtEntryDetailSuccess = false
      state.debtEntryDetail = null
    },

    // Clear approve debt entry state
    clearApproveDebtEntryState: (state) => {
      state.approveDebtEntryLoading = false
      state.approveDebtEntryError = null
      state.approveDebtEntrySuccess = false
      state.approvedDebtEntry = null
    },

    // Clear debt recovery state
    clearDebtRecoveryState: (state) => {
      state.debtRecoveryLoading = false
      state.debtRecoveryError = null
      state.debtRecoverySuccess = false
      state.debtRecovery = []
      state.debtRecoveryPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
      state.debtRecoveryRequestParams = null
    },

    // Set debt recovery data manually (if needed for caching or testing)
    setDebtRecovery: (state, action: PayloadAction<DebtRecoveryItem[]>) => {
      state.debtRecovery = action.payload
      state.debtRecoverySuccess = true
    },

    // Update debt recovery request parameters
    setDebtRecoveryRequestParams: (state, action: PayloadAction<DebtRecoveryRequest>) => {
      state.debtRecoveryRequestParams = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch recovery summary cases
      .addCase(fetchRecoverySummary.pending, (state) => {
        state.recoverySummaryLoading = true
        state.recoverySummaryError = null
        state.recoverySummarySuccess = false
      })
      .addCase(
        fetchRecoverySummary.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: RecoverySummaryResponse
            requestParams: RecoverySummaryRequest
          }>
        ) => {
          state.recoverySummaryLoading = false
          state.recoverySummarySuccess = true
          state.recoverySummaryError = null
          state.recoverySummary = action.payload.data.data
          state.requestParams = action.payload.requestParams
        }
      )
      .addCase(fetchRecoverySummary.rejected, (state, action) => {
        state.recoverySummaryLoading = false
        state.recoverySummaryError = (action.payload as string) || "Failed to fetch recovery summary"
        state.recoverySummarySuccess = false
        state.recoverySummary = []
        state.requestParams = null
      })
      // Fetch debt management customers cases
      .addCase(fetchDebtManagementCustomers.pending, (state) => {
        state.customersLoading = true
        state.customersError = null
        state.customersSuccess = false
      })
      .addCase(
        fetchDebtManagementCustomers.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: DebtManagementCustomersResponse
            requestParams: DebtManagementCustomersRequest
          }>
        ) => {
          state.customersLoading = false
          state.customersSuccess = true
          state.customersError = null
          state.customers = action.payload.data.data
          state.customersPagination = {
            totalCount: action.payload.data.totalCount,
            totalPages: action.payload.data.totalPages,
            currentPage: action.payload.data.currentPage,
            pageSize: action.payload.data.pageSize,
            hasNext: action.payload.data.hasNext,
            hasPrevious: action.payload.data.hasPrevious,
          }
          state.customersRequestParams = action.payload.requestParams
        }
      )
      .addCase(fetchDebtManagementCustomers.rejected, (state, action) => {
        state.customersLoading = false
        state.customersError = (action.payload as string) || "Failed to fetch debt management customers"
        state.customersSuccess = false
        state.customers = []
        state.customersPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
          hasNext: false,
          hasPrevious: false,
        }
        state.customersRequestParams = null
      })
      // Fetch aging data cases
      .addCase(fetchAgingData.pending, (state) => {
        state.agingLoading = true
        state.agingError = null
        state.agingSuccess = false
      })
      .addCase(
        fetchAgingData.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: AgingResponse
            requestParams: DebtManagementCustomersRequest
          }>
        ) => {
          state.agingLoading = false
          state.agingSuccess = true
          state.agingError = null
          state.aging = action.payload.data.data
          state.agingPagination = {
            totalCount: action.payload.data.totalCount,
            totalPages: action.payload.data.totalPages,
            currentPage: action.payload.data.currentPage,
            pageSize: action.payload.data.pageSize,
            hasNext: action.payload.data.hasNext,
            hasPrevious: action.payload.data.hasPrevious,
          }
          state.agingRequestParams = action.payload.requestParams
        }
      )
      .addCase(fetchAgingData.rejected, (state, action) => {
        state.agingLoading = false
        state.agingError = (action.payload as string) || "Failed to fetch aging data"
        state.agingSuccess = false
        state.aging = []
        state.agingPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
          hasNext: false,
          hasPrevious: false,
        }
        state.agingRequestParams = null
      })
      // Create debt entry cases
      .addCase(createDebtEntry.pending, (state) => {
        state.createDebtEntryLoading = true
        state.createDebtEntryError = null
        state.createDebtEntrySuccess = false
      })
      .addCase(
        createDebtEntry.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: CreateDebtEntryResponse
            requestParams: CreateDebtEntryRequest
          }>
        ) => {
          state.createDebtEntryLoading = false
          state.createDebtEntrySuccess = true
          state.createDebtEntryError = null
          state.createdDebtEntry = action.payload.data.data
        }
      )
      .addCase(createDebtEntry.rejected, (state, action) => {
        state.createDebtEntryLoading = false
        state.createDebtEntryError = (action.payload as string) || "Failed to create debt entry"
        state.createDebtEntrySuccess = false
        state.createdDebtEntry = null
      })
      // Fetch all debt entries cases
      .addCase(fetchAllDebtEntries.pending, (state) => {
        state.allDebtEntriesLoading = true
        state.allDebtEntriesError = null
        state.allDebtEntriesSuccess = false
      })
      .addCase(
        fetchAllDebtEntries.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: AllDebtEntriesResponse
            requestParams: AllDebtEntriesRequest
          }>
        ) => {
          state.allDebtEntriesLoading = false
          state.allDebtEntriesSuccess = true
          state.allDebtEntriesError = null
          state.allDebtEntries = action.payload.data.data
          state.allDebtEntriesPagination = {
            totalCount: action.payload.data.totalCount,
            totalPages: action.payload.data.totalPages,
            currentPage: action.payload.data.currentPage,
            pageSize: action.payload.data.pageSize,
            hasNext: action.payload.data.hasNext,
            hasPrevious: action.payload.data.hasPrevious,
          }
          state.allDebtEntriesRequestParams = action.payload.requestParams
        }
      )
      .addCase(fetchAllDebtEntries.rejected, (state, action) => {
        state.allDebtEntriesLoading = false
        state.allDebtEntriesError = (action.payload as string) || "Failed to fetch all debt entries"
        state.allDebtEntriesSuccess = false
        state.allDebtEntries = []
        state.allDebtEntriesPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
          hasNext: false,
          hasPrevious: false,
        }
        state.allDebtEntriesRequestParams = null
      })
      // Fetch recovery policies cases
      .addCase(fetchRecoveryPolicies.pending, (state) => {
        state.recoveryPoliciesLoading = true
        state.recoveryPoliciesError = null
        state.recoveryPoliciesSuccess = false
      })
      .addCase(fetchRecoveryPolicies.fulfilled, (state, action: PayloadAction<RecoveryPoliciesResponse>) => {
        state.recoveryPoliciesLoading = false
        state.recoveryPoliciesSuccess = true
        state.recoveryPolicies = action.payload.data
        state.recoveryPoliciesPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchRecoveryPolicies.rejected, (state, action) => {
        state.recoveryPoliciesLoading = false
        state.recoveryPoliciesError = (action.payload as string) || "Failed to fetch recovery policies"
        state.recoveryPoliciesSuccess = false
        state.recoveryPolicies = []
        state.recoveryPoliciesPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
          hasNext: false,
          hasPrevious: false,
        }
        state.recoveryPoliciesRequestParams = null
      })
      // Create recovery policy cases
      .addCase(createRecoveryPolicy.pending, (state) => {
        state.createRecoveryPolicyLoading = true
        state.createRecoveryPolicyError = null
        state.createRecoveryPolicySuccess = false
      })
      .addCase(
        createRecoveryPolicy.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: CreateRecoveryPolicyResponse
            requestParams: CreateRecoveryPolicyRequest
          }>
        ) => {
          state.createRecoveryPolicyLoading = false
          state.createRecoveryPolicySuccess = true
          state.createdRecoveryPolicy = action.payload.data.data
        }
      )
      .addCase(createRecoveryPolicy.rejected, (state, action) => {
        state.createRecoveryPolicyLoading = false
        state.createRecoveryPolicyError = (action.payload as string) || "Failed to create recovery policy"
        state.createRecoveryPolicySuccess = false
        state.createdRecoveryPolicy = null
      })
      // Pause recovery policy cases
      .addCase(pauseRecoveryPolicy.pending, (state) => {
        state.pauseRecoveryPolicyLoading = true
        state.pauseRecoveryPolicyError = null
        state.pauseRecoveryPolicySuccess = false
      })
      .addCase(
        pauseRecoveryPolicy.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: PauseRecoveryPolicyResponse
            policyId: number
          }>
        ) => {
          state.pauseRecoveryPolicyLoading = false
          state.pauseRecoveryPolicySuccess = true
          state.pauseRecoveryPolicyError = null
          state.pausedRecoveryPolicy = action.payload.data.data

          // Update the policy in the recovery policies list if it exists
          const policyIndex = state.recoveryPolicies.findIndex((policy) => policy.id === action.payload.policyId)
          if (policyIndex !== -1) {
            state.recoveryPolicies[policyIndex] = action.payload.data.data
          }
        }
      )
      .addCase(pauseRecoveryPolicy.rejected, (state, action) => {
        state.pauseRecoveryPolicyLoading = false
        state.pauseRecoveryPolicyError = (action.payload as string) || "Failed to pause recovery policy"
        state.pauseRecoveryPolicySuccess = false
        state.pausedRecoveryPolicy = null
      })
      // Resume recovery policy cases
      .addCase(resumeRecoveryPolicy.pending, (state) => {
        state.resumeRecoveryPolicyLoading = true
        state.resumeRecoveryPolicyError = null
        state.resumeRecoveryPolicySuccess = false
      })
      .addCase(
        resumeRecoveryPolicy.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: ResumeRecoveryPolicyResponse
            policyId: number
          }>
        ) => {
          state.resumeRecoveryPolicyLoading = false
          state.resumeRecoveryPolicySuccess = true
          state.resumeRecoveryPolicyError = null
          state.resumedRecoveryPolicy = action.payload.data.data

          // Update the policy in the recovery policies list if it exists
          const policyIndex = state.recoveryPolicies.findIndex((policy) => policy.id === action.payload.policyId)
          if (policyIndex !== -1) {
            state.recoveryPolicies[policyIndex] = action.payload.data.data
          }
        }
      )
      .addCase(resumeRecoveryPolicy.rejected, (state, action) => {
        state.resumeRecoveryPolicyLoading = false
        state.resumeRecoveryPolicyError = (action.payload as string) || "Failed to resume recovery policy"
        state.resumeRecoveryPolicySuccess = false
        state.resumedRecoveryPolicy = null
      })
      // Fetch debt entry detail cases
      .addCase(fetchDebtEntryDetail.pending, (state) => {
        state.debtEntryDetailLoading = true
        state.debtEntryDetailError = null
        state.debtEntryDetailSuccess = false
      })
      .addCase(
        fetchDebtEntryDetail.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: DebtEntryDetailResponse
            entryId: number
          }>
        ) => {
          state.debtEntryDetailLoading = false
          state.debtEntryDetailSuccess = true
          state.debtEntryDetailError = null
          state.debtEntryDetail = action.payload.data.data
        }
      )
      .addCase(fetchDebtEntryDetail.rejected, (state, action) => {
        state.debtEntryDetailLoading = false
        state.debtEntryDetailError = (action.payload as string) || "Failed to fetch debt entry detail"
        state.debtEntryDetailSuccess = false
        state.debtEntryDetail = null
      })
      // Approve debt entry cases
      .addCase(approveDebtEntry.pending, (state) => {
        state.approveDebtEntryLoading = true
        state.approveDebtEntryError = null
        state.approveDebtEntrySuccess = false
      })
      .addCase(
        approveDebtEntry.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: ApproveDebtEntryResponse
            entryId: number
          }>
        ) => {
          state.approveDebtEntryLoading = false
          state.approveDebtEntrySuccess = true
          state.approveDebtEntryError = null
          state.approvedDebtEntry = action.payload.data.data

          // Update the entry in the all debt entries list if it exists
          const entryIndex = state.allDebtEntries.findIndex((entry) => entry.id === action.payload.entryId)
          if (entryIndex !== -1) {
            state.allDebtEntries[entryIndex] = action.payload.data.data
          }

          // Update the debt entry detail if it's currently loaded
          if (state.debtEntryDetail && state.debtEntryDetail.id === action.payload.entryId) {
            state.debtEntryDetail = action.payload.data.data
          }
        }
      )
      .addCase(approveDebtEntry.rejected, (state, action) => {
        state.approveDebtEntryLoading = false
        state.approveDebtEntryError = (action.payload as string) || "Failed to approve debt entry"
        state.approveDebtEntrySuccess = false
        state.approvedDebtEntry = null
      })
      // Fetch debt recovery cases
      .addCase(fetchDebtRecovery.pending, (state) => {
        state.debtRecoveryLoading = true
        state.debtRecoveryError = null
        state.debtRecoverySuccess = false
      })
      .addCase(
        fetchDebtRecovery.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: DebtRecoveryResponse
            requestParams: DebtRecoveryRequest
          }>
        ) => {
          state.debtRecoveryLoading = false
          state.debtRecoverySuccess = true
          state.debtRecoveryError = null
          state.debtRecovery = action.payload.data.data
          state.debtRecoveryPagination = {
            totalCount: action.payload.data.totalCount,
            totalPages: action.payload.data.totalPages,
            currentPage: action.payload.data.currentPage,
            pageSize: action.payload.data.pageSize,
            hasNext: action.payload.data.hasNext,
            hasPrevious: action.payload.data.hasPrevious,
          }
          state.debtRecoveryRequestParams = action.payload.requestParams
        }
      )
      .addCase(fetchDebtRecovery.rejected, (state, action) => {
        state.debtRecoveryLoading = false
        state.debtRecoveryError = (action.payload as string) || "Failed to fetch debt recovery data"
        state.debtRecoverySuccess = false
        state.debtRecovery = []
        state.debtRecoveryPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
          hasNext: false,
          hasPrevious: false,
        }
        state.debtRecoveryRequestParams = null
      })
  },
})

export const {
  clearRecoverySummaryState,
  clearError,
  resetDebtManagementState,
  setRecoverySummary,
  setRequestParams,
  clearCustomersState,
  setCustomers,
  setCustomersRequestParams,
  clearAgingState,
  setAging,
  setAgingRequestParams,
  clearCreateDebtEntryState,
  setCreatedDebtEntry,
  clearAllDebtEntriesState,
  clearRecoveryPoliciesState,
  clearCreateRecoveryPolicyState,
  clearPauseRecoveryPolicyState,
  clearResumeRecoveryPolicyState,
  setAllDebtEntries,
  setAllDebtEntriesRequestParams,
  clearDebtEntryDetailState,
  clearApproveDebtEntryState,
  clearDebtRecoveryState,
  setDebtRecovery,
  setDebtRecoveryRequestParams,
} = debtManagementSlice.actions

// Redux selectors
export const selectRecoverySummary = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.recoverySummary

export const selectRecoverySummaryLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.recoverySummaryLoading

export const selectRecoverySummaryError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.recoverySummaryError

export const selectRecoverySummarySuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.recoverySummarySuccess

export const selectRequestParams = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.requestParams

// Customer selectors
export const selectCustomers = (state: { debtManagement: DebtManagementState }) => state.debtManagement.customers

export const selectCustomersLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.customersLoading

export const selectCustomersError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.customersError

export const selectCustomersSuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.customersSuccess

export const selectCustomersPagination = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.customersPagination

export const selectCustomersRequestParams = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.customersRequestParams

// Aging selectors
export const selectAging = (state: { debtManagement: DebtManagementState }) => state.debtManagement.aging

export const selectAgingLoading = (state: { debtManagement: DebtManagementState }) => state.debtManagement.agingLoading

export const selectAgingError = (state: { debtManagement: DebtManagementState }) => state.debtManagement.agingError

export const selectAgingSuccess = (state: { debtManagement: DebtManagementState }) => state.debtManagement.agingSuccess

export const selectAgingPagination = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.agingPagination

export const selectAgingRequestParams = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.agingRequestParams

// Create debt entry selectors
export const selectCreateDebtEntryLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createDebtEntryLoading

export const selectCreateDebtEntryError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createDebtEntryError

export const selectCreateDebtEntrySuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createDebtEntrySuccess

export const selectCreatedDebtEntry = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createdDebtEntry

// All debt entries selectors
export const selectAllDebtEntries = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.allDebtEntries

export const selectAllDebtEntriesLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.allDebtEntriesLoading

export const selectAllDebtEntriesError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.allDebtEntriesError

export const selectAllDebtEntriesSuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.allDebtEntriesSuccess

export const selectAllDebtEntriesPagination = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.allDebtEntriesPagination

export const selectAllDebtEntriesRequestParams = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.allDebtEntriesRequestParams

// Recovery policies selectors
export const selectRecoveryPolicies = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.recoveryPolicies

export const selectRecoveryPoliciesLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.recoveryPoliciesLoading

export const selectRecoveryPoliciesError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.recoveryPoliciesError

export const selectRecoveryPoliciesSuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.recoveryPoliciesSuccess

export const selectRecoveryPoliciesPagination = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.recoveryPoliciesPagination

export const selectRecoveryPoliciesRequestParams = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.recoveryPoliciesRequestParams

// Create recovery policy selectors
export const selectCreateRecoveryPolicyLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createRecoveryPolicyLoading

export const selectCreateRecoveryPolicyError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createRecoveryPolicyError

export const selectCreateRecoveryPolicySuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createRecoveryPolicySuccess

export const selectCreatedRecoveryPolicy = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createdRecoveryPolicy

// Pause recovery policy selectors
export const selectPauseRecoveryPolicyLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.pauseRecoveryPolicyLoading

export const selectPauseRecoveryPolicyError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.pauseRecoveryPolicyError

export const selectPauseRecoveryPolicySuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.pauseRecoveryPolicySuccess

export const selectPausedRecoveryPolicy = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.pausedRecoveryPolicy

// Resume recovery policy selectors
export const selectResumeRecoveryPolicyLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.resumeRecoveryPolicyLoading

export const selectResumeRecoveryPolicyError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.resumeRecoveryPolicyError

export const selectResumeRecoveryPolicySuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.resumeRecoveryPolicySuccess

export const selectResumedRecoveryPolicy = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.resumedRecoveryPolicy

// Debt entry detail selectors
export const selectDebtEntryDetail = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.debtEntryDetail

export const selectDebtEntryDetailLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.debtEntryDetailLoading

export const selectDebtEntryDetailError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.debtEntryDetailError

export const selectDebtEntryDetailSuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.debtEntryDetailSuccess

// Approve debt entry selectors
export const selectApproveDebtEntryLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.approveDebtEntryLoading

export const selectApproveDebtEntryError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.approveDebtEntryError

export const selectApproveDebtEntrySuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.approveDebtEntrySuccess

export const selectApprovedDebtEntry = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.approvedDebtEntry

// Debt recovery selectors
export const selectDebtRecovery = (state: { debtManagement: DebtManagementState }) => state.debtManagement.debtRecovery

export const selectDebtRecoveryLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.debtRecoveryLoading

export const selectDebtRecoveryError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.debtRecoveryError

export const selectDebtRecoverySuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.debtRecoverySuccess

export const selectDebtRecoveryPagination = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.debtRecoveryPagination

export const selectDebtRecoveryRequestParams = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.debtRecoveryRequestParams

export default debtManagementSlice.reducer
