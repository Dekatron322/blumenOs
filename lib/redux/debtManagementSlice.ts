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

// Clearance promo interface
export interface ClearancePromo {
  id: number
  name: string
  code: string
  description: string
  discountPercent: number
  startAtUtc: string
  endAtUtc: string
  scope: number
  provinceId: number | null
  areaOfficeId: number | null
  feederId: number | null
  isActive: boolean
  isPaused: boolean
  createdAt: string
  lastUpdated: string | null
}

// Request parameters interface for fetching clearance promos
export interface ClearancePromosRequest {
  PageNumber: number
  PageSize: number
  Search?: string
  Code?: string
  Scope?: number
  IsActive?: boolean
  IsPaused?: boolean
  AsOfUtc?: string
}

// Response interface for clearance promos
export interface ClearancePromosResponse {
  isSuccess: boolean
  message: string
  data: ClearancePromo[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Response interface for pause promo
export interface PausePromoResponse {
  isSuccess: boolean
  message: string
  data: ClearancePromo
}

// Response interface for resume promo
export interface ResumePromoResponse {
  isSuccess: boolean
  message: string
  data: ClearancePromo
}

// Request interface for creating promo
export interface CreatePromoRequest {
  name: string
  code: string
  description: string
  discountPercent: number
  startAtUtc: string
  endAtUtc: string
  scope: number
  provinceId: number
  areaOfficeId: number
  feederId: number
  isActive: boolean
  isPaused: boolean
}

// Response interface for creating promo
export interface CreatePromoResponse {
  isSuccess: boolean
  message: string
  data: ClearancePromo
}

// Request interface for updating promo
export interface UpdatePromoRequest {
  name: string
  code: string
  description: string
  discountPercent: number
  startAtUtc: string
  endAtUtc: string
  scope: number
  provinceId: number
  areaOfficeId: number
  feederId: number
  isActive: boolean
  isPaused: boolean
}

// Response interface for updating promo
export interface UpdatePromoResponse {
  isSuccess: boolean
  message: string
  data: ClearancePromo
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

  // Clearance promos state
  clearancePromosLoading: boolean
  clearancePromosError: string | null
  clearancePromosSuccess: boolean
  clearancePromos: ClearancePromo[]
  clearancePromosPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  clearancePromosRequestParams: ClearancePromosRequest | null

  // Pause promo state
  pausePromoLoading: boolean
  pausePromoError: string | null
  pausePromoSuccess: boolean
  pausedPromo: ClearancePromo | null

  // Resume promo state
  resumePromoLoading: boolean
  resumePromoError: string | null
  resumePromoSuccess: boolean
  resumedPromo: ClearancePromo | null

  // Create promo state
  createPromoLoading: boolean
  createPromoError: string | null
  createPromoSuccess: boolean
  createdPromo: ClearancePromo | null

  // Update promo state
  updatePromoLoading: boolean
  updatePromoError: string | null
  updatePromoSuccess: boolean
  updatedPromo: ClearancePromo | null

  // Promo details state
  promoDetailsLoading: boolean
  promoDetailsError: string | null
  promoDetailsSuccess: boolean
  promoDetails: ClearancePromo | null
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

  clearancePromosLoading: false,
  clearancePromosError: null,
  clearancePromosSuccess: false,
  clearancePromos: [],
  clearancePromosPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  clearancePromosRequestParams: null,

  pausePromoLoading: false,
  pausePromoError: null,
  pausePromoSuccess: false,
  pausedPromo: null,

  resumePromoLoading: false,
  resumePromoError: null,
  resumePromoSuccess: false,
  resumedPromo: null,

  createPromoLoading: false,
  createPromoError: null,
  createPromoSuccess: false,
  createdPromo: null,

  // Update promo state
  updatePromoLoading: false,
  updatePromoError: null,
  updatePromoSuccess: false,
  updatedPromo: null,

  // Promo details state
  promoDetailsLoading: false,
  promoDetailsError: null,
  promoDetailsSuccess: false,
  promoDetails: null,
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

// Async thunk for fetching clearance promos
export const fetchClearancePromos = createAsyncThunk(
  "debtManagement/fetchClearancePromos",
  async (params: ClearancePromosRequest, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.Search !== undefined && params.Search !== null) {
        queryParams.append("Search", params.Search)
      }
      if (params.Code !== undefined && params.Code !== null) {
        queryParams.append("Code", params.Code)
      }
      if (params.Scope !== undefined && params.Scope !== null) {
        queryParams.append("Scope", params.Scope.toString())
      }
      if (params.IsActive !== undefined) {
        queryParams.append("IsActive", params.IsActive.toString())
      }
      if (params.IsPaused !== undefined) {
        queryParams.append("IsPaused", params.IsPaused.toString())
      }
      if (params.AsOfUtc !== undefined && params.AsOfUtc !== null) {
        queryParams.append("AsOfUtc", params.AsOfUtc)
      }

      const url = `${buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.CLEARANCE_PROMO_LIST)}?${queryParams.toString()}`
      const response = await api.get<ClearancePromosResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch clearance promos")
      }

      return {
        data: response.data,
        requestParams: params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch clearance promos")
      }
      return rejectWithValue(error.message || "Network error during clearance promos fetch")
    }
  }
)

// Async thunk for pausing a promo
export const pausePromo = createAsyncThunk(
  "debtManagement/pausePromo",
  async (promoId: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.PAUSE_PROMO).replace("{id}", promoId.toString())
      const response = await api.post<PausePromoResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to pause promo")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to pause promo")
      }
      return rejectWithValue(error.message || "Network error during promo pause")
    }
  }
)

// Async thunk for resuming a promo
export const resumePromo = createAsyncThunk(
  "debtManagement/resumePromo",
  async (promoId: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.RESUME_PROMO).replace("{id}", promoId.toString())
      const response = await api.post<ResumePromoResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to resume promo")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to resume promo")
      }
      return rejectWithValue(error.message || "Network error during promo resume")
    }
  }
)

// Async thunk for creating a promo
export const createPromo = createAsyncThunk(
  "debtManagement/createPromo",
  async (params: CreatePromoRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CreatePromoResponse>(buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.ADD_PROMO), params)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create promo")
      }

      return {
        data: response.data,
        requestParams: params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create promo")
      }
      return rejectWithValue(error.message || "Network error during promo creation")
    }
  }
)

// Async thunk for updating a promo
export const updatePromo = createAsyncThunk(
  "debtManagement/updatePromo",
  async ({ id, params }: { id: number; params: UpdatePromoRequest }, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.UPDATE_PROMO.replace("{id}", id.toString()))
      const response = await api.put<UpdatePromoResponse>(url, params)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update promo")
      }

      return {
        data: response.data,
        promoId: id,
        requestParams: params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update promo")
      }
      return rejectWithValue(error.message || "Network error during promo update")
    }
  }
)

// Async thunk for fetching promo details
export const fetchPromoDetails = createAsyncThunk(
  "debtManagement/fetchPromoDetails",
  async (promoId: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.DEBT_MANAGEMENT.PROMO_DETAILS.replace("{id}", promoId.toString()))
      const response = await api.get<{ data: ClearancePromo; isSuccess: boolean; message: string }>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch promo details")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch promo details")
      }
      return rejectWithValue(error.message || "Network error during promo details fetch")
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

    // Clear clearance promos state
    clearClearancePromosState: (state) => {
      state.clearancePromosLoading = false
      state.clearancePromosError = null
      state.clearancePromosSuccess = false
      state.clearancePromos = []
      state.clearancePromosPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
      state.clearancePromosRequestParams = null
    },

    // Clear pause promo state
    clearPausePromoState: (state) => {
      state.pausePromoLoading = false
      state.pausePromoError = null
      state.pausePromoSuccess = false
      state.pausedPromo = null
    },

    // Clear resume promo state
    clearResumePromoState: (state) => {
      state.resumePromoLoading = false
      state.resumePromoError = null
      state.resumePromoSuccess = false
      state.resumedPromo = null
    },

    // Clear create promo state
    clearCreatePromoState: (state) => {
      state.createPromoLoading = false
      state.createPromoError = null
      state.createPromoSuccess = false
      state.createdPromo = null
    },

    // Clear update promo state
    clearUpdatePromoState: (state) => {
      state.updatePromoLoading = false
      state.updatePromoError = null
      state.updatePromoSuccess = false
      state.updatedPromo = null
    },

    // Clear promo details state
    clearPromoDetailsState: (state) => {
      state.promoDetailsLoading = false
      state.promoDetailsError = null
      state.promoDetailsSuccess = false
      state.promoDetails = null
    },

    // Set clearance promos data manually (if needed for caching or testing)
    setClearancePromos: (state, action: PayloadAction<ClearancePromo[]>) => {
      state.clearancePromos = action.payload
      state.clearancePromosSuccess = true
    },

    // Update clearance promos request parameters
    setClearancePromosRequestParams: (state, action: PayloadAction<ClearancePromosRequest>) => {
      state.clearancePromosRequestParams = action.payload
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
      // Fetch clearance promos cases
      .addCase(fetchClearancePromos.pending, (state) => {
        state.clearancePromosLoading = true
        state.clearancePromosError = null
        state.clearancePromosSuccess = false
      })
      .addCase(
        fetchClearancePromos.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: ClearancePromosResponse
            requestParams: ClearancePromosRequest
          }>
        ) => {
          state.clearancePromosLoading = false
          state.clearancePromosSuccess = true
          state.clearancePromosError = null
          state.clearancePromos = action.payload.data.data
          state.clearancePromosPagination = {
            totalCount: action.payload.data.totalCount,
            totalPages: action.payload.data.totalPages,
            currentPage: action.payload.data.currentPage,
            pageSize: action.payload.data.pageSize,
            hasNext: action.payload.data.hasNext,
            hasPrevious: action.payload.data.hasPrevious,
          }
          state.clearancePromosRequestParams = action.payload.requestParams
        }
      )
      .addCase(fetchClearancePromos.rejected, (state, action) => {
        state.clearancePromosLoading = false
        state.clearancePromosError = (action.payload as string) || "Failed to fetch clearance promos"
        state.clearancePromosSuccess = false
        state.clearancePromos = []
        state.clearancePromosPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
          hasNext: false,
          hasPrevious: false,
        }
        state.clearancePromosRequestParams = null
      })
      // Pause promo cases
      .addCase(pausePromo.pending, (state) => {
        state.pausePromoLoading = true
        state.pausePromoError = null
        state.pausePromoSuccess = false
      })
      .addCase(pausePromo.fulfilled, (state, action: PayloadAction<ClearancePromo>) => {
        state.pausePromoLoading = false
        state.pausePromoSuccess = true
        state.pausedPromo = action.payload

        // Update the promo in the clearance promos list if it exists
        const index = state.clearancePromos.findIndex((promo) => promo.id === action.payload.id)
        if (index !== -1) {
          state.clearancePromos[index] = action.payload
        }
      })
      .addCase(pausePromo.rejected, (state, action) => {
        state.pausePromoLoading = false
        state.pausePromoError = (action.payload as string) || "Failed to pause promo"
        state.pausePromoSuccess = false
        state.pausedPromo = null
      })
      // Resume promo cases
      .addCase(resumePromo.pending, (state) => {
        state.resumePromoLoading = true
        state.resumePromoError = null
        state.resumePromoSuccess = false
      })
      .addCase(resumePromo.fulfilled, (state, action: PayloadAction<ClearancePromo>) => {
        state.resumePromoLoading = false
        state.resumePromoSuccess = true
        state.resumedPromo = action.payload

        // Update the promo in the clearance promos list if it exists
        const index = state.clearancePromos.findIndex((promo) => promo.id === action.payload.id)
        if (index !== -1) {
          state.clearancePromos[index] = action.payload
        }
      })
      .addCase(resumePromo.rejected, (state, action) => {
        state.resumePromoLoading = false
        state.resumePromoError = (action.payload as string) || "Failed to resume promo"
        state.resumePromoSuccess = false
        state.resumedPromo = null
      })
      // Create promo cases
      .addCase(createPromo.pending, (state) => {
        state.createPromoLoading = true
        state.createPromoError = null
        state.createPromoSuccess = false
      })
      .addCase(
        createPromo.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: CreatePromoResponse
            requestParams: CreatePromoRequest
          }>
        ) => {
          state.createPromoLoading = false
          state.createPromoSuccess = true
          state.createPromoError = null
          state.createdPromo = action.payload.data.data

          // Add the new promo to the clearance promos list
          state.clearancePromos.unshift(action.payload.data.data)
          state.clearancePromosPagination.totalCount += 1
        }
      )
      .addCase(createPromo.rejected, (state, action) => {
        state.createPromoLoading = false
        state.createPromoError = (action.payload as string) || "Failed to create promo"
        state.createPromoSuccess = false
        state.createdPromo = null
      })
      // Update promo cases
      .addCase(updatePromo.pending, (state) => {
        state.updatePromoLoading = true
        state.updatePromoError = null
        state.updatePromoSuccess = false
      })
      .addCase(
        updatePromo.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: UpdatePromoResponse
            promoId: number
            requestParams: UpdatePromoRequest
          }>
        ) => {
          state.updatePromoLoading = false
          state.updatePromoSuccess = true
          state.updatePromoError = null
          state.updatedPromo = action.payload.data.data

          // Update the promo in the clearance promos list if it exists
          const index = state.clearancePromos.findIndex((promo) => promo.id === action.payload.promoId)
          if (index !== -1) {
            state.clearancePromos[index] = action.payload.data.data
          }

          // Update the promo details if it's currently loaded
          if (state.promoDetails && state.promoDetails.id === action.payload.promoId) {
            state.promoDetails = action.payload.data.data
          }
        }
      )
      .addCase(updatePromo.rejected, (state, action) => {
        state.updatePromoLoading = false
        state.updatePromoError = (action.payload as string) || "Failed to update promo"
        state.updatePromoSuccess = false
        state.updatedPromo = null
      })
      // Fetch promo details cases
      .addCase(fetchPromoDetails.pending, (state) => {
        state.promoDetailsLoading = true
        state.promoDetailsError = null
        state.promoDetailsSuccess = false
      })
      .addCase(fetchPromoDetails.fulfilled, (state, action: PayloadAction<ClearancePromo>) => {
        state.promoDetailsLoading = false
        state.promoDetailsSuccess = true
        state.promoDetailsError = null
        state.promoDetails = action.payload
      })
      .addCase(fetchPromoDetails.rejected, (state, action) => {
        state.promoDetailsLoading = false
        state.promoDetailsError = (action.payload as string) || "Failed to fetch promo details"
        state.promoDetailsSuccess = false
        state.promoDetails = null
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
  clearClearancePromosState,
  setClearancePromos,
  setClearancePromosRequestParams,
  clearPausePromoState,
  clearResumePromoState,
  clearCreatePromoState,
  clearUpdatePromoState,
  clearPromoDetailsState,
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

// Clearance promos selectors
export const selectClearancePromos = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.clearancePromos

export const selectClearancePromosLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.clearancePromosLoading

export const selectClearancePromosError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.clearancePromosError

export const selectClearancePromosSuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.clearancePromosSuccess

export const selectClearancePromosPagination = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.clearancePromosPagination

export const selectClearancePromosRequestParams = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.clearancePromosRequestParams

// Pause promo selectors
export const selectPausePromoLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.pausePromoLoading

export const selectPausePromoError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.pausePromoError

export const selectPausePromoSuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.pausePromoSuccess

export const selectPausedPromo = (state: { debtManagement: DebtManagementState }) => state.debtManagement.pausedPromo

// Resume promo selectors
export const selectResumePromoLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.resumePromoLoading

export const selectResumePromoError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.resumePromoError

export const selectResumePromoSuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.resumePromoSuccess

export const selectResumedPromo = (state: { debtManagement: DebtManagementState }) => state.debtManagement.resumedPromo

// Create promo selectors
export const selectCreatePromoLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createPromoLoading

export const selectCreatePromoError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createPromoError

export const selectCreatePromoSuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.createPromoSuccess

export const selectCreatedPromo = (state: { debtManagement: DebtManagementState }) => state.debtManagement.createdPromo

// Update promo selectors
export const selectUpdatePromoLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.updatePromoLoading

export const selectUpdatePromoError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.updatePromoError

export const selectUpdatePromoSuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.updatePromoSuccess

export const selectUpdatedPromo = (state: { debtManagement: DebtManagementState }) => state.debtManagement.updatedPromo

// Promo details selectors
export const selectPromoDetails = (state: { debtManagement: DebtManagementState }) => state.debtManagement.promoDetails

export const selectPromoDetailsLoading = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.promoDetailsLoading

export const selectPromoDetailsError = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.promoDetailsError

export const selectPromoDetailsSuccess = (state: { debtManagement: DebtManagementState }) =>
  state.debtManagement.promoDetailsSuccess

export default debtManagementSlice.reducer
