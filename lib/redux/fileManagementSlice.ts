// src/lib/redux/fileManagementSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for File Management
// Interfaces for bulk upload
export interface BulkUploadRequest {
  fileId: number
  confirm: boolean
}

// Customer Bulk Upload interfaces
export interface CustomerBulkUploadRequest {
  fileId: number
}

export interface CustomerBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Meter Bulk Upload interfaces
export interface MeterBulkUploadRequest {
  fileId: number
}

export interface MeterBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Customer Setup Bulk Upload interfaces
export interface CustomerSetupBulkUploadRequest {
  fileId: number
}

export interface CustomerSetupBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Customer Info Update Bulk Upload interfaces
export interface CustomerInfoUpdateBulkUploadRequest {
  fileId: number
}

export interface CustomerInfoUpdateBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Customer Feeder Update Bulk Upload interfaces
export interface CustomerFeederUpdateBulkUploadRequest {
  fileId: number
}

export interface CustomerFeederUpdateBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Customer Tariff Change Bulk Upload interfaces
export interface CustomerTariffChangeBulkUploadRequest {
  fileId: number
}

export interface CustomerTariffChangeBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Customer Status Change Bulk Upload interfaces
export interface CustomerStatusChangeBulkUploadRequest {
  fileId: number
}

export interface CustomerStatusChangeBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Customer Stored Average Update Bulk Upload interfaces
export interface CustomerStoredAverageUpdateBulkUploadRequest {
  fileId: number
}

export interface CustomerStoredAverageUpdateBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Customer SRDT Update Bulk Upload interfaces
export interface CustomerSrdtUpdateBulkUploadRequest {
  fileId: number
}

export interface CustomerSrdtUpdateBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Meter Reading Bulk Upload interfaces
export interface MeterReadingBulkUploadRequest {
  fileId: number
}

export interface MeterReadingBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Meter Reading (General) Bulk Upload interfaces
export interface MeterReadingGeneralBulkUploadRequest {
  fileId: number
  confirm: boolean
}

export interface MeterReadingGeneralBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: {
    queued: boolean
    preview: {
      fileId: number
      fileName: string
      fileSize: number
      totalRows: number
      validRows: number
      invalidRows: number
      distinctMeters: number
      periodKeys: string[]
    }
    job: BulkUploadJob
    confirmationQuestions: string[]
  }
}

// Meter Reading Stored Average Update Bulk Upload interfaces
export interface MeterReadingStoredAverageUpdateBulkUploadRequest {
  fileId: number
}

export interface MeterReadingStoredAverageUpdateBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Missing Postpaid Billing Bulk Upload interfaces
export interface MissingPostpaidBillingBulkUploadRequest {
  fileId: number
}

export interface MissingPostpaidBillingBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// General Billing Bulk Upload interfaces
export interface BillingBulkUploadRequest {
  fileId: number
}

export interface BillingBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Past Postpaid Billing Bulk Upload interfaces
export interface PastPostpaidBillingBulkUploadRequest {
  fileId: number
}

export interface PastPostpaidBillingBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Adjustment Billing Bulk Upload interfaces
export interface AdjustmentBillingBulkUploadRequest {
  fileId: number
}

export interface AdjustmentBillingBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Finalize Billing Bulk Upload interfaces
export interface FinalizeBillingBulkUploadRequest {
  fileId: number
}

export interface FinalizeBillingBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Bill Crucial Ops Bulk Upload interfaces
export interface BillCrucialOpsBulkUploadRequest {
  fileId: number
}

export interface BillCrucialOpsBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

// Feeder Energy Cap Bulk Upload interfaces
export interface FeederEnergyCapBulkUploadRequest {
  fileId: number
  confirm: boolean
}

export interface FeederEnergyCapPreview {
  fileId: number
  fileName: string
  fileSize: number
  totalRows: number
  validRows: number
  invalidRows: number
  distinctFeeders: number
  totalEnergyCapKwh: number
  periodKeys: string[]
}

export interface FeederEnergyCapBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: {
    queued: boolean
    preview: FeederEnergyCapPreview
    job: BulkUploadJob
    confirmationQuestions: string[]
  }
}

// Distribution Substation Bulk Upload interfaces
export interface DistributionSubstationBulkUploadRequest {
  fileId: number
}

export interface DistributionSubstationBulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadJob
}

export interface BulkUploadPreview {
  fileId: number
  fileName: string
  fileSize: number
  totalRows: number
  validRows: number
  invalidRows: number
  totalAmount: number
  earliestPaidAtUtc: string
  latestPaidAtUtc: string
  channels: string[]
}

export interface BulkUploadJob {
  id: number
  jobType: number
  status: number
  requestedByUserId: number
  requestedAtUtc: string
  fileName: string
  fileKey: string
  fileUrl: string
  fileSize: number
  totalRows: number
  processedRows: number
  succeededRows: number
  failedRows: number
  lastProcessedRow: number
  retryCount: number
  startedAtUtc: string
  completedAtUtc: string
  lastError: string
  errorBlobKey: string
  payloadJson: string
}

// CSV Jobs interfaces
export interface CsvJob {
  id: number
  jobType: number
  status: number
  requestedByUserId: number
  requestedAtUtc: string
  fileName: string
  fileKey: string
  fileUrl: string
  fileSize: number
  totalRows: number
  processedRows: number
  succeededRows: number
  failedRows: number
  lastProcessedRow: number
  retryCount: number
  startedAtUtc: string
  completedAtUtc: string
  lastError: string
  errorBlobKey: string
  payloadJson: string
}

export interface CsvJobsParams {
  PageNumber: number
  PageSize: number
  JobType?: number
  Status?: number
  RequestedByUserId?: number
  RequestedFromUtc?: string
  RequestedToUtc?: string
  FileName?: string
  HasFailures?: boolean
  Search?: string
}

export interface CsvJobsResponse {
  isSuccess: boolean
  message: string
  data: CsvJob[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// CSV Upload Failures interfaces
export interface CsvUploadFailure {
  id: number
  csvBulkInsertionJobId: number
  lineNumber: number
  message: string
  rawLine: string
  createdAtUtc: string
}

export interface CsvUploadFailuresParams {
  id: number
  PageNumber: number
  PageSize: number
}

export interface CsvUploadFailuresResponse {
  isSuccess: boolean
  message: string
  data: CsvUploadFailure[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface BulkUploadData {
  queued: boolean
  preview: BulkUploadPreview
  job: BulkUploadJob
  confirmationQuestions: string[]
}

export interface BulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadData
}

export interface FileIntentRequest {
  fileName: string
  contentType: string
  sizeBytes: number
  purpose: string
  checksum: string
  bulkInsertType: string
  columns: string[]
}

export interface RequiredHeaders {
  [key: string]: string
}

export interface FileIntentData {
  fileId: number
  objectKey: string
  uploadUrl: string
  publicUrl: string
  expiresAtUtc: string
  requiredHeaders: RequiredHeaders
}

export interface FileIntentResponse {
  isSuccess: boolean
  message: string
  data: FileIntentData
}

export interface FinalizeFileData {
  fileId: number
  objectKey: string
  publicUrl: string
  status: string
}

export interface FinalizeFileResponse {
  isSuccess: boolean
  message: string
  data: FinalizeFileData
}

// File Management State
interface FileManagementState {
  // File intent state
  fileIntent: FileIntentData | null
  fileIntentLoading: boolean
  fileIntentError: string | null
  fileIntentSuccess: boolean
  fileIntentResponse: FileIntentResponse | null

  // Finalize file state
  finalizeFileLoading: boolean
  finalizeFileError: string | null
  finalizeFileSuccess: boolean
  finalizeFileResponse: FinalizeFileResponse | null

  // Bulk Upload state
  bulkUploadLoading: boolean
  bulkUploadError: string | null
  bulkUploadSuccess: boolean
  bulkUploadResponse: BulkUploadResponse | null

  // Customer Bulk Upload state
  customerBulkUploadLoading: boolean
  customerBulkUploadError: string | null
  customerBulkUploadSuccess: boolean
  customerBulkUploadResponse: CustomerBulkUploadResponse | null

  // Meter Bulk Upload state
  meterBulkUploadLoading: boolean
  meterBulkUploadError: string | null
  meterBulkUploadSuccess: boolean
  meterBulkUploadResponse: MeterBulkUploadResponse | null

  // Customer Setup Bulk Upload state
  customerSetupBulkUploadLoading: boolean
  customerSetupBulkUploadError: string | null
  customerSetupBulkUploadSuccess: boolean
  customerSetupBulkUploadResponse: CustomerSetupBulkUploadResponse | null

  // Customer Info Update Bulk Upload state
  customerInfoUpdateBulkUploadLoading: boolean
  customerInfoUpdateBulkUploadError: string | null
  customerInfoUpdateBulkUploadSuccess: boolean
  customerInfoUpdateBulkUploadResponse: CustomerInfoUpdateBulkUploadResponse | null

  // Customer Feeder Update Bulk Upload state
  customerFeederUpdateBulkUploadLoading: boolean
  customerFeederUpdateBulkUploadError: string | null
  customerFeederUpdateBulkUploadSuccess: boolean
  customerFeederUpdateBulkUploadResponse: CustomerFeederUpdateBulkUploadResponse | null

  // Customer Tariff Change Bulk Upload state
  customerTariffChangeBulkUploadLoading: boolean
  customerTariffChangeBulkUploadError: string | null
  customerTariffChangeBulkUploadSuccess: boolean
  customerTariffChangeBulkUploadResponse: CustomerTariffChangeBulkUploadResponse | null

  // Customer Status Change Bulk Upload state
  customerStatusChangeBulkUploadLoading: boolean
  customerStatusChangeBulkUploadError: string | null
  customerStatusChangeBulkUploadSuccess: boolean
  customerStatusChangeBulkUploadResponse: CustomerStatusChangeBulkUploadResponse | null

  // Customer Stored Average Update Bulk Upload state
  customerStoredAverageUpdateBulkUploadLoading: boolean
  customerStoredAverageUpdateBulkUploadError: string | null
  customerStoredAverageUpdateBulkUploadSuccess: boolean
  customerStoredAverageUpdateBulkUploadResponse: CustomerStoredAverageUpdateBulkUploadResponse | null

  // Customer SRDT Update Bulk Upload state
  customerSrdtUpdateBulkUploadLoading: boolean
  customerSrdtUpdateBulkUploadError: string | null
  customerSrdtUpdateBulkUploadSuccess: boolean
  customerSrdtUpdateBulkUploadResponse: CustomerSrdtUpdateBulkUploadResponse | null

  // Meter Reading Bulk Upload state
  meterReadingBulkUploadLoading: boolean
  meterReadingBulkUploadError: string | null
  meterReadingBulkUploadSuccess: boolean
  meterReadingBulkUploadResponse: MeterReadingBulkUploadResponse | null

  // Meter Reading (General) Bulk Upload state
  meterReadingGeneralBulkUploadLoading: boolean
  meterReadingGeneralBulkUploadError: string | null
  meterReadingGeneralBulkUploadSuccess: boolean
  meterReadingGeneralBulkUploadResponse: MeterReadingGeneralBulkUploadResponse | null

  // Meter Reading Stored Average Update Bulk Upload state
  meterReadingStoredAverageUpdateBulkUploadLoading: boolean
  meterReadingStoredAverageUpdateBulkUploadError: string | null
  meterReadingStoredAverageUpdateBulkUploadSuccess: boolean
  meterReadingStoredAverageUpdateBulkUploadResponse: MeterReadingStoredAverageUpdateBulkUploadResponse | null

  // Missing Postpaid Billing Bulk Upload state
  missingPostpaidBillingBulkUploadLoading: boolean
  missingPostpaidBillingBulkUploadError: string | null
  missingPostpaidBillingBulkUploadSuccess: boolean
  missingPostpaidBillingBulkUploadResponse: MissingPostpaidBillingBulkUploadResponse | null

  // General Billing Bulk Upload state
  billingBulkUploadLoading: boolean
  billingBulkUploadError: string | null
  billingBulkUploadSuccess: boolean
  billingBulkUploadResponse: BillingBulkUploadResponse | null

  // Past Postpaid Billing Bulk Upload state
  pastPostpaidBillingBulkUploadLoading: boolean
  pastPostpaidBillingBulkUploadError: string | null
  pastPostpaidBillingBulkUploadSuccess: boolean
  pastPostpaidBillingBulkUploadResponse: PastPostpaidBillingBulkUploadResponse | null

  // Adjustment Billing Bulk Upload state
  adjustmentBillingBulkUploadLoading: boolean
  adjustmentBillingBulkUploadError: string | null
  adjustmentBillingBulkUploadSuccess: boolean
  adjustmentBillingBulkUploadResponse: AdjustmentBillingBulkUploadResponse | null

  // Finalize Billing Bulk Upload state
  finalizeBillingBulkUploadLoading: boolean
  finalizeBillingBulkUploadError: string | null
  finalizeBillingBulkUploadSuccess: boolean
  finalizeBillingBulkUploadResponse: FinalizeBillingBulkUploadResponse | null

  // Bill Crucial Ops Bulk Upload state
  billCrucialOpsBulkUploadLoading: boolean
  billCrucialOpsBulkUploadError: string | null
  billCrucialOpsBulkUploadSuccess: boolean
  billCrucialOpsBulkUploadResponse: BillCrucialOpsBulkUploadResponse | null

  // Feeder Energy Cap Bulk Upload state
  feederEnergyCapBulkUploadLoading: boolean
  feederEnergyCapBulkUploadError: string | null
  feederEnergyCapBulkUploadSuccess: boolean
  feederEnergyCapBulkUploadResponse: FeederEnergyCapBulkUploadResponse | null

  // Distribution Substation Bulk Upload state
  distributionSubstationBulkUploadLoading: boolean
  distributionSubstationBulkUploadError: string | null
  distributionSubstationBulkUploadSuccess: boolean
  distributionSubstationBulkUploadResponse: DistributionSubstationBulkUploadResponse | null

  // CSV Jobs state
  csvJobsLoading: boolean
  csvJobsError: string | null
  csvJobsSuccess: boolean
  csvJobsResponse: CsvJobsResponse | null
  csvJobs: CsvJob[]
  csvJobsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null

  // CSV Upload Failures state
  csvUploadFailuresLoading: boolean
  csvUploadFailuresError: string | null
  csvUploadFailuresSuccess: boolean
  csvUploadFailuresResponse: CsvUploadFailuresResponse | null
  csvUploadFailures: CsvUploadFailure[]
  csvUploadFailuresPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null
}

// Initial state
const initialState: FileManagementState = {
  // File Intent state
  fileIntent: null,
  fileIntentLoading: false,
  fileIntentError: null,
  fileIntentSuccess: false,
  fileIntentResponse: null,

  // Finalize File state
  finalizeFileLoading: false,
  finalizeFileError: null,
  finalizeFileSuccess: false,
  finalizeFileResponse: null,

  // Bulk Upload state
  bulkUploadLoading: false,
  bulkUploadError: null,
  bulkUploadSuccess: false,
  bulkUploadResponse: null,

  // Customer Bulk Upload state
  customerBulkUploadLoading: false,
  customerBulkUploadError: null,
  customerBulkUploadSuccess: false,
  customerBulkUploadResponse: null,

  // Meter Bulk Upload state
  meterBulkUploadLoading: false,
  meterBulkUploadError: null,
  meterBulkUploadSuccess: false,
  meterBulkUploadResponse: null,

  // Customer Setup Bulk Upload state
  customerSetupBulkUploadLoading: false,
  customerSetupBulkUploadError: null,
  customerSetupBulkUploadSuccess: false,
  customerSetupBulkUploadResponse: null,

  // Customer Info Update Bulk Upload state
  customerInfoUpdateBulkUploadLoading: false,
  customerInfoUpdateBulkUploadError: null,
  customerInfoUpdateBulkUploadSuccess: false,
  customerInfoUpdateBulkUploadResponse: null,

  // Customer Feeder Update Bulk Upload state
  customerFeederUpdateBulkUploadLoading: false,
  customerFeederUpdateBulkUploadError: null,
  customerFeederUpdateBulkUploadSuccess: false,
  customerFeederUpdateBulkUploadResponse: null,

  // Customer Tariff Change Bulk Upload state
  customerTariffChangeBulkUploadLoading: false,
  customerTariffChangeBulkUploadError: null,
  customerTariffChangeBulkUploadSuccess: false,
  customerTariffChangeBulkUploadResponse: null,

  // Customer Status Change Bulk Upload state
  customerStatusChangeBulkUploadLoading: false,
  customerStatusChangeBulkUploadError: null,
  customerStatusChangeBulkUploadSuccess: false,
  customerStatusChangeBulkUploadResponse: null,

  // Customer Stored Average Update Bulk Upload state
  customerStoredAverageUpdateBulkUploadLoading: false,
  customerStoredAverageUpdateBulkUploadError: null,
  customerStoredAverageUpdateBulkUploadSuccess: false,
  customerStoredAverageUpdateBulkUploadResponse: null,

  // Customer SRDT Update Bulk Upload state
  customerSrdtUpdateBulkUploadLoading: false,
  customerSrdtUpdateBulkUploadError: null,
  customerSrdtUpdateBulkUploadSuccess: false,
  customerSrdtUpdateBulkUploadResponse: null,

  // Meter Reading Bulk Upload state
  meterReadingBulkUploadLoading: false,
  meterReadingBulkUploadError: null,
  meterReadingBulkUploadSuccess: false,
  meterReadingBulkUploadResponse: null,

  // Meter Reading (General) Bulk Upload state
  meterReadingGeneralBulkUploadLoading: false,
  meterReadingGeneralBulkUploadError: null,
  meterReadingGeneralBulkUploadSuccess: false,
  meterReadingGeneralBulkUploadResponse: null,

  // Meter Reading Stored Average Update Bulk Upload state
  meterReadingStoredAverageUpdateBulkUploadLoading: false,
  meterReadingStoredAverageUpdateBulkUploadError: null,
  meterReadingStoredAverageUpdateBulkUploadSuccess: false,
  meterReadingStoredAverageUpdateBulkUploadResponse: null,

  // Missing Postpaid Billing Bulk Upload state
  missingPostpaidBillingBulkUploadLoading: false,
  missingPostpaidBillingBulkUploadError: null,
  missingPostpaidBillingBulkUploadSuccess: false,
  missingPostpaidBillingBulkUploadResponse: null,

  // General Billing Bulk Upload state
  billingBulkUploadLoading: false,
  billingBulkUploadError: null,
  billingBulkUploadSuccess: false,
  billingBulkUploadResponse: null,

  // Past Postpaid Billing Bulk Upload state
  pastPostpaidBillingBulkUploadLoading: false,
  pastPostpaidBillingBulkUploadError: null,
  pastPostpaidBillingBulkUploadSuccess: false,
  pastPostpaidBillingBulkUploadResponse: null,

  // Adjustment Billing Bulk Upload state
  adjustmentBillingBulkUploadLoading: false,
  adjustmentBillingBulkUploadError: null,
  adjustmentBillingBulkUploadSuccess: false,
  adjustmentBillingBulkUploadResponse: null,

  // Finalize Billing Bulk Upload state
  finalizeBillingBulkUploadLoading: false,
  finalizeBillingBulkUploadError: null,
  finalizeBillingBulkUploadSuccess: false,
  finalizeBillingBulkUploadResponse: null,

  // Bill Crucial Ops Bulk Upload state
  billCrucialOpsBulkUploadLoading: false,
  billCrucialOpsBulkUploadError: null,
  billCrucialOpsBulkUploadSuccess: false,
  billCrucialOpsBulkUploadResponse: null,

  // Feeder Energy Cap Bulk Upload state
  feederEnergyCapBulkUploadLoading: false,
  feederEnergyCapBulkUploadError: null,
  feederEnergyCapBulkUploadSuccess: false,
  feederEnergyCapBulkUploadResponse: null,

  // Distribution Substation Bulk Upload state
  distributionSubstationBulkUploadLoading: false,
  distributionSubstationBulkUploadError: null,
  distributionSubstationBulkUploadSuccess: false,
  distributionSubstationBulkUploadResponse: null,

  // CSV Jobs state
  csvJobsLoading: false,
  csvJobsError: null,
  csvJobsSuccess: false,
  csvJobsResponse: null,
  csvJobs: [],
  csvJobsPagination: null,

  // CSV Upload Failures state
  csvUploadFailuresLoading: false,
  csvUploadFailuresError: null,
  csvUploadFailuresSuccess: false,
  csvUploadFailuresResponse: null,
  csvUploadFailures: [],
  csvUploadFailuresPagination: null,
}

// Async thunks
export const createFileIntent = createAsyncThunk(
  "fileManagement/createFileIntent",
  async (request: FileIntentRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<FileIntentResponse>(buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.INTENT), request)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create file intent")
    }
  }
)

export const finalizeFile = createAsyncThunk(
  "fileManagement/finalizeFile",
  async (fileId: number, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.FILE_MANAGEMENT.FINALIZE, { id: fileId })
      const response = await api.post<FinalizeFileResponse>(endpoint, {})
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to finalize file")
    }
  }
)

export const processBulkUpload = createAsyncThunk(
  "fileManagement/processBulkUpload",
  async (request: BulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<BulkUploadResponse>(API_ENDPOINTS.FILE_MANAGEMENT.BULK_UPLOAD, request)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process bulk upload")
    }
  }
)

export const processCustomerBulkUpload = createAsyncThunk(
  "fileManagement/processCustomerBulkUpload",
  async (request: CustomerBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CustomerBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CUSTOMER_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process customer bulk upload")
    }
  }
)

export const processMeterBulkUpload = createAsyncThunk(
  "fileManagement/processMeterBulkUpload",
  async (request: MeterBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<MeterBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.METER_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process meter bulk upload")
    }
  }
)

export const processCustomerSetupBulkUpload = createAsyncThunk(
  "fileManagement/processCustomerSetupBulkUpload",
  async (request: CustomerSetupBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CustomerSetupBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CUSTOMER_SETUP_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process customer setup bulk upload")
    }
  }
)

export const processCustomerInfoUpdateBulkUpload = createAsyncThunk(
  "fileManagement/processCustomerInfoUpdateBulkUpload",
  async (request: CustomerInfoUpdateBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CustomerInfoUpdateBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CUSTOMER_INFO_UPDATE_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process customer info update bulk upload")
    }
  }
)

export const processCustomerFeederUpdateBulkUpload = createAsyncThunk(
  "fileManagement/processCustomerFeederUpdateBulkUpload",
  async (request: CustomerFeederUpdateBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CustomerFeederUpdateBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CUSTOMER_FEEDER_UPDATE_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process customer feeder update bulk upload")
    }
  }
)

export const processCustomerTariffChangeBulkUpload = createAsyncThunk(
  "fileManagement/processCustomerTariffChangeBulkUpload",
  async (request: CustomerTariffChangeBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CustomerTariffChangeBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CUSTOMER_TARIFF_CHANGE_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process customer tariff change bulk upload")
    }
  }
)

export const processCustomerStatusChangeBulkUpload = createAsyncThunk(
  "fileManagement/processCustomerStatusChangeBulkUpload",
  async (request: CustomerStatusChangeBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CustomerStatusChangeBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CUSTOMER_STATUS_CHANGE_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process customer status change bulk upload")
    }
  }
)

export const processCustomerStoredAverageUpdateBulkUpload = createAsyncThunk(
  "fileManagement/processCustomerStoredAverageUpdateBulkUpload",
  async (request: CustomerStoredAverageUpdateBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CustomerStoredAverageUpdateBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CUSTOMER_STORED_AVERAGE_UPDATE_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to process customer stored average update bulk upload"
      )
    }
  }
)

export const processCustomerSrdtUpdateBulkUpload = createAsyncThunk(
  "fileManagement/processCustomerSrdtUpdateBulkUpload",
  async (request: CustomerSrdtUpdateBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CustomerSrdtUpdateBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CUSTOMER_SRDT_UPDATE_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process customer SRDT update bulk upload")
    }
  }
)

export const processMeterReadingBulkUpload = createAsyncThunk(
  "fileManagement/processMeterReadingBulkUpload",
  async (request: MeterReadingBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<MeterReadingBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.METER_READING_ACCOUNT_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process meter reading bulk upload")
    }
  }
)

export const processMeterReadingGeneralBulkUpload = createAsyncThunk(
  "fileManagement/processMeterReadingGeneralBulkUpload",
  async (request: MeterReadingGeneralBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<MeterReadingGeneralBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.METER_READING_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process meter reading general bulk upload")
    }
  }
)

export const processMeterReadingStoredAverageUpdateBulkUpload = createAsyncThunk(
  "fileManagement/processMeterReadingStoredAverageUpdateBulkUpload",
  async (request: MeterReadingStoredAverageUpdateBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<MeterReadingStoredAverageUpdateBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.METER_READING_STORED_AVERAGE_UPDATE_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to process meter reading stored average update bulk upload"
      )
    }
  }
)

export const processMissingPostpaidBillingBulkUpload = createAsyncThunk(
  "fileManagement/processMissingPostpaidBillingBulkUpload",
  async (request: MissingPostpaidBillingBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<MissingPostpaidBillingBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.MISSING_POSTPAID_BILLING_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process missing postpaid billing bulk upload")
    }
  }
)

export const processBillingBulkUpload = createAsyncThunk(
  "fileManagement/processBillingBulkUpload",
  async (request: BillingBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<BillingBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.BILLING_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process billing bulk upload")
    }
  }
)

export const processPastPostpaidBillingBulkUpload = createAsyncThunk(
  "fileManagement/processPastPostpaidBillingBulkUpload",
  async (request: PastPostpaidBillingBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<PastPostpaidBillingBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.PAST_POSTPAID_BILLING_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process past postpaid billing bulk upload")
    }
  }
)

export const processAdjustmentBillingBulkUpload = createAsyncThunk(
  "fileManagement/processAdjustmentBillingBulkUpload",
  async (request: AdjustmentBillingBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<AdjustmentBillingBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.ADJUSTMENT_BILLING_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process adjustment billing bulk upload")
    }
  }
)

export const processFinalizeBillingBulkUpload = createAsyncThunk(
  "fileManagement/processFinalizeBillingBulkUpload",
  async (request: FinalizeBillingBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<FinalizeBillingBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.FINALIZE_BILLING_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process finalize billing bulk upload")
    }
  }
)

export const processBillCrucialOpsBulkUpload = createAsyncThunk(
  "fileManagement/processBillCrucialOpsBulkUpload",
  async (request: BillCrucialOpsBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<BillCrucialOpsBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.BILL_CRUCIAL_OPS_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process bill crucial ops bulk upload")
    }
  }
)

export const processFeederEnergyCapBulkUpload = createAsyncThunk(
  "fileManagement/processFeederEnergyCapBulkUpload",
  async (request: FeederEnergyCapBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<FeederEnergyCapBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.FEEDER_ENERGY_CAP_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process feeder energy cap bulk upload")
    }
  }
)

export const processDistributionSubstationBulkUpload = createAsyncThunk(
  "fileManagement/processDistributionSubstationBulkUpload",
  async (request: DistributionSubstationBulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<DistributionSubstationBulkUploadResponse>(
        buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.DISTRIBUTION_SUBSTATION_BULK_UPLOAD),
        request
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process distribution substation bulk upload")
    }
  }
)

// CSV Jobs async thunk
export const fetchCsvJobs = createAsyncThunk(
  "fileManagement/fetchCsvJobs",
  async (params: CsvJobsParams, { rejectWithValue }) => {
    try {
      // Build query string from parameters
      const queryParams = new URLSearchParams()

      // Required parameters
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      // Optional parameters - only add if they exist
      if (params.JobType !== undefined) queryParams.append("JobType", params.JobType.toString())
      if (params.Status !== undefined) queryParams.append("Status", params.Status.toString())
      if (params.RequestedByUserId !== undefined)
        queryParams.append("RequestedByUserId", params.RequestedByUserId.toString())
      if (params.RequestedFromUtc) queryParams.append("RequestedFromUtc", params.RequestedFromUtc)
      if (params.RequestedToUtc) queryParams.append("RequestedToUtc", params.RequestedToUtc)
      if (params.FileName) queryParams.append("FileName", params.FileName)
      if (params.HasFailures !== undefined) queryParams.append("HasFailures", params.HasFailures.toString())
      if (params.Search) queryParams.append("Search", params.Search)

      const url = `${buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CSV_JOBS)}?${queryParams.toString()}`
      const response = await api.get<CsvJobsResponse>(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch CSV jobs")
    }
  }
)

// CSV Upload Failures async thunk
export const fetchCsvUploadFailures = createAsyncThunk(
  "fileManagement/fetchCsvUploadFailures",
  async (params: CsvUploadFailuresParams, { rejectWithValue }) => {
    try {
      // Build query string from parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      const endpoint = buildEndpointWithParams(API_ENDPOINTS.FILE_MANAGEMENT.CSV_UPLOAD_FAILURES, { id: params.id })
      const url = `${buildApiUrl(endpoint)}?${queryParams.toString()}`
      const response = await api.get<CsvUploadFailuresResponse>(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch CSV upload failures")
    }
  }
)

// Helper function to replace path parameters in endpoint
const buildEndpointWithParams = (
  endpoint: string,
  params: Record<string, string | number | boolean | null | undefined>
): string => {
  let builtEndpoint = endpoint
  Object.entries(params).forEach(([key, value]) => {
    const stringValue = value != null ? String(value) : ""
    builtEndpoint = builtEndpoint.replace(`{${key}}`, stringValue)
  })
  return builtEndpoint
}

// Slice
const fileManagementSlice = createSlice({
  name: "fileManagement",
  initialState,
  reducers: {
    // Reset file intent state
    resetFileIntentState: (state) => {
      state.fileIntent = null
      state.fileIntentLoading = false
      state.fileIntentError = null
      state.fileIntentSuccess = false
    },
    // Reset finalize file state
    resetFinalizeFileState: (state) => {
      state.finalizeFileLoading = false
      state.finalizeFileError = null
      state.finalizeFileSuccess = false
      state.finalizeFileResponse = null
    },
    resetBulkUploadState: (state) => {
      state.bulkUploadLoading = false
      state.bulkUploadError = null
      state.bulkUploadSuccess = false
      state.bulkUploadResponse = null
    },
    resetCustomerBulkUploadState: (state) => {
      state.customerBulkUploadLoading = false
      state.customerBulkUploadError = null
      state.customerBulkUploadSuccess = false
      state.customerBulkUploadResponse = null
    },
    resetMeterBulkUploadState: (state) => {
      state.meterBulkUploadLoading = false
      state.meterBulkUploadError = null
      state.meterBulkUploadSuccess = false
      state.meterBulkUploadResponse = null
    },
    resetCustomerSetupBulkUploadState: (state) => {
      state.customerSetupBulkUploadLoading = false
      state.customerSetupBulkUploadError = null
      state.customerSetupBulkUploadSuccess = false
      state.customerSetupBulkUploadResponse = null
    },
    resetCustomerInfoUpdateBulkUploadState: (state) => {
      state.customerInfoUpdateBulkUploadLoading = false
      state.customerInfoUpdateBulkUploadError = null
      state.customerInfoUpdateBulkUploadSuccess = false
      state.customerInfoUpdateBulkUploadResponse = null
    },
    resetCustomerFeederUpdateBulkUploadState: (state) => {
      state.customerFeederUpdateBulkUploadLoading = false
      state.customerFeederUpdateBulkUploadError = null
      state.customerFeederUpdateBulkUploadSuccess = false
      state.customerFeederUpdateBulkUploadResponse = null
    },
    resetCustomerTariffChangeBulkUploadState: (state) => {
      state.customerTariffChangeBulkUploadLoading = false
      state.customerTariffChangeBulkUploadError = null
      state.customerTariffChangeBulkUploadSuccess = false
      state.customerTariffChangeBulkUploadResponse = null
    },
    resetCustomerStatusChangeBulkUploadState: (state) => {
      state.customerStatusChangeBulkUploadLoading = false
      state.customerStatusChangeBulkUploadError = null
      state.customerStatusChangeBulkUploadSuccess = false
      state.customerStatusChangeBulkUploadResponse = null
    },
    resetCustomerStoredAverageUpdateBulkUploadState: (state) => {
      state.customerStoredAverageUpdateBulkUploadLoading = false
      state.customerStoredAverageUpdateBulkUploadError = null
      state.customerStoredAverageUpdateBulkUploadSuccess = false
      state.customerStoredAverageUpdateBulkUploadResponse = null
    },
    resetCustomerSrdtUpdateBulkUploadState: (state) => {
      state.customerSrdtUpdateBulkUploadLoading = false
      state.customerSrdtUpdateBulkUploadError = null
      state.customerSrdtUpdateBulkUploadSuccess = false
      state.customerSrdtUpdateBulkUploadResponse = null
    },
    resetMeterReadingBulkUploadState: (state) => {
      state.meterReadingBulkUploadLoading = false
      state.meterReadingBulkUploadError = null
      state.meterReadingBulkUploadSuccess = false
      state.meterReadingBulkUploadResponse = null
    },
    resetMeterReadingGeneralBulkUploadState: (state) => {
      state.meterReadingGeneralBulkUploadLoading = false
      state.meterReadingGeneralBulkUploadError = null
      state.meterReadingGeneralBulkUploadSuccess = false
      state.meterReadingGeneralBulkUploadResponse = null
    },
    resetMeterReadingStoredAverageUpdateBulkUploadState: (state) => {
      state.meterReadingStoredAverageUpdateBulkUploadLoading = false
      state.meterReadingStoredAverageUpdateBulkUploadError = null
      state.meterReadingStoredAverageUpdateBulkUploadSuccess = false
      state.meterReadingStoredAverageUpdateBulkUploadResponse = null
    },
    resetMissingPostpaidBillingBulkUploadState: (state) => {
      state.missingPostpaidBillingBulkUploadLoading = false
      state.missingPostpaidBillingBulkUploadError = null
      state.missingPostpaidBillingBulkUploadSuccess = false
      state.missingPostpaidBillingBulkUploadResponse = null
    },
    resetBillingBulkUploadState: (state) => {
      state.billingBulkUploadLoading = false
      state.billingBulkUploadError = null
      state.billingBulkUploadSuccess = false
      state.billingBulkUploadResponse = null
    },
    resetPastPostpaidBillingBulkUploadState: (state) => {
      state.pastPostpaidBillingBulkUploadLoading = false
      state.pastPostpaidBillingBulkUploadError = null
      state.pastPostpaidBillingBulkUploadSuccess = false
      state.pastPostpaidBillingBulkUploadResponse = null
    },
    resetAdjustmentBillingBulkUploadState: (state) => {
      state.adjustmentBillingBulkUploadLoading = false
      state.adjustmentBillingBulkUploadError = null
      state.adjustmentBillingBulkUploadSuccess = false
      state.adjustmentBillingBulkUploadResponse = null
    },
    resetFinalizeBillingBulkUploadState: (state) => {
      state.finalizeBillingBulkUploadLoading = false
      state.finalizeBillingBulkUploadError = null
      state.finalizeBillingBulkUploadSuccess = false
      state.finalizeBillingBulkUploadResponse = null
    },
    resetBillCrucialOpsBulkUploadState: (state) => {
      state.billCrucialOpsBulkUploadLoading = false
      state.billCrucialOpsBulkUploadError = null
      state.billCrucialOpsBulkUploadSuccess = false
      state.billCrucialOpsBulkUploadResponse = null
    },
    resetFeederEnergyCapBulkUploadState: (state) => {
      state.feederEnergyCapBulkUploadLoading = false
      state.feederEnergyCapBulkUploadError = null
      state.feederEnergyCapBulkUploadSuccess = false
      state.feederEnergyCapBulkUploadResponse = null
    },
    resetDistributionSubstationBulkUploadState: (state) => {
      state.distributionSubstationBulkUploadLoading = false
      state.distributionSubstationBulkUploadError = null
      state.distributionSubstationBulkUploadSuccess = false
      state.distributionSubstationBulkUploadResponse = null
    },
    // Reset CSV Jobs state
    resetCsvJobsState: (state) => {
      state.csvJobsLoading = false
      state.csvJobsError = null
      state.csvJobsSuccess = false
      state.csvJobsResponse = null
      state.csvJobs = []
      state.csvJobsPagination = null
    },
    // Reset CSV Upload Failures state
    resetCsvUploadFailuresState: (state) => {
      state.csvUploadFailuresLoading = false
      state.csvUploadFailuresError = null
      state.csvUploadFailuresSuccess = false
      state.csvUploadFailuresResponse = null
      state.csvUploadFailures = []
      state.csvUploadFailuresPagination = null
    },
    // Reset all file management state
    resetFileManagementState: (state) => {
      state.fileIntent = null
      state.fileIntentLoading = false
      state.fileIntentError = null
      state.fileIntentSuccess = false
      state.fileIntentResponse = null
      state.finalizeFileLoading = false
      state.finalizeFileError = null
      state.finalizeFileSuccess = false
      state.finalizeFileResponse = null
      state.bulkUploadLoading = false
      state.bulkUploadError = null
      state.bulkUploadSuccess = false
      state.bulkUploadResponse = null
      state.customerBulkUploadLoading = false
      state.customerBulkUploadError = null
      state.customerBulkUploadSuccess = false
      state.customerBulkUploadResponse = null
      state.meterBulkUploadLoading = false
      state.meterBulkUploadError = null
      state.meterBulkUploadSuccess = false
      state.meterBulkUploadResponse = null
      state.customerSetupBulkUploadLoading = false
      state.customerSetupBulkUploadError = null
      state.customerSetupBulkUploadSuccess = false
      state.customerSetupBulkUploadResponse = null
      state.customerInfoUpdateBulkUploadLoading = false
      state.customerInfoUpdateBulkUploadError = null
      state.customerInfoUpdateBulkUploadSuccess = false
      state.customerInfoUpdateBulkUploadResponse = null
      state.customerFeederUpdateBulkUploadLoading = false
      state.customerFeederUpdateBulkUploadError = null
      state.customerFeederUpdateBulkUploadSuccess = false
      state.customerFeederUpdateBulkUploadResponse = null
      state.customerTariffChangeBulkUploadLoading = false
      state.customerTariffChangeBulkUploadError = null
      state.customerTariffChangeBulkUploadSuccess = false
      state.customerTariffChangeBulkUploadResponse = null
      state.customerStatusChangeBulkUploadLoading = false
      state.customerStatusChangeBulkUploadError = null
      state.customerStatusChangeBulkUploadSuccess = false
      state.customerStatusChangeBulkUploadResponse = null
      state.customerStoredAverageUpdateBulkUploadLoading = false
      state.customerStoredAverageUpdateBulkUploadError = null
      state.customerStoredAverageUpdateBulkUploadSuccess = false
      state.customerStoredAverageUpdateBulkUploadResponse = null
      state.customerSrdtUpdateBulkUploadLoading = false
      state.customerSrdtUpdateBulkUploadError = null
      state.customerSrdtUpdateBulkUploadSuccess = false
      state.customerSrdtUpdateBulkUploadResponse = null
      state.meterReadingBulkUploadLoading = false
      state.meterReadingBulkUploadError = null
      state.meterReadingBulkUploadSuccess = false
      state.meterReadingBulkUploadResponse = null
      state.meterReadingGeneralBulkUploadLoading = false
      state.meterReadingGeneralBulkUploadError = null
      state.meterReadingGeneralBulkUploadSuccess = false
      state.meterReadingGeneralBulkUploadResponse = null
      state.meterReadingStoredAverageUpdateBulkUploadLoading = false
      state.meterReadingStoredAverageUpdateBulkUploadError = null
      state.meterReadingStoredAverageUpdateBulkUploadSuccess = false
      state.meterReadingStoredAverageUpdateBulkUploadResponse = null
      state.missingPostpaidBillingBulkUploadLoading = false
      state.missingPostpaidBillingBulkUploadError = null
      state.missingPostpaidBillingBulkUploadSuccess = false
      state.missingPostpaidBillingBulkUploadResponse = null
      state.billingBulkUploadLoading = false
      state.billingBulkUploadError = null
      state.billingBulkUploadSuccess = false
      state.billingBulkUploadResponse = null
      state.pastPostpaidBillingBulkUploadLoading = false
      state.pastPostpaidBillingBulkUploadError = null
      state.pastPostpaidBillingBulkUploadSuccess = false
      state.pastPostpaidBillingBulkUploadResponse = null
      state.adjustmentBillingBulkUploadLoading = false
      state.adjustmentBillingBulkUploadError = null
      state.adjustmentBillingBulkUploadSuccess = false
      state.adjustmentBillingBulkUploadResponse = null
      state.finalizeBillingBulkUploadLoading = false
      state.finalizeBillingBulkUploadError = null
      state.finalizeBillingBulkUploadSuccess = false
      state.finalizeBillingBulkUploadResponse = null
      state.billCrucialOpsBulkUploadLoading = false
      state.billCrucialOpsBulkUploadError = null
      state.billCrucialOpsBulkUploadSuccess = false
      state.billCrucialOpsBulkUploadResponse = null
      state.feederEnergyCapBulkUploadLoading = false
      state.feederEnergyCapBulkUploadError = null
      state.feederEnergyCapBulkUploadSuccess = false
      state.feederEnergyCapBulkUploadResponse = null
      state.distributionSubstationBulkUploadLoading = false
      state.distributionSubstationBulkUploadError = null
      state.distributionSubstationBulkUploadSuccess = false
      state.distributionSubstationBulkUploadResponse = null
      state.csvJobsLoading = false
      state.csvJobsError = null
      state.csvJobsSuccess = false
      state.csvJobsResponse = null
      state.csvJobs = []
      state.csvJobsPagination = null
    },
  },
  extraReducers: (builder) => {
    // Create file intent
    builder
      .addCase(createFileIntent.pending, (state) => {
        state.fileIntentLoading = true
        state.fileIntentError = null
        state.fileIntentSuccess = false
      })
      .addCase(createFileIntent.fulfilled, (state, action) => {
        state.fileIntentLoading = false
        state.fileIntentSuccess = true
        state.fileIntentResponse = action.payload
        state.fileIntent = action.payload.data
      })
      .addCase(createFileIntent.rejected, (state, action) => {
        state.fileIntentLoading = false
        state.fileIntentError = action.payload as string
        state.fileIntentSuccess = false
      })

      // Finalize File reducers
      .addCase(finalizeFile.pending, (state) => {
        state.finalizeFileLoading = true
        state.finalizeFileError = null
        state.finalizeFileSuccess = false
      })
      .addCase(finalizeFile.fulfilled, (state, action) => {
        state.finalizeFileLoading = false
        state.finalizeFileSuccess = true
        state.finalizeFileResponse = action.payload
      })
      .addCase(finalizeFile.rejected, (state, action) => {
        state.finalizeFileLoading = false
        state.finalizeFileError = action.payload as string
        state.finalizeFileSuccess = false
      })

      // Bulk Upload reducers
      .addCase(processBulkUpload.pending, (state) => {
        state.bulkUploadLoading = true
        state.bulkUploadError = null
        state.bulkUploadSuccess = false
      })
      .addCase(processBulkUpload.fulfilled, (state, action) => {
        state.bulkUploadLoading = false
        state.bulkUploadSuccess = true
        state.bulkUploadResponse = action.payload
      })
      .addCase(processBulkUpload.rejected, (state, action) => {
        state.bulkUploadLoading = false
        state.bulkUploadError = action.payload as string
        state.bulkUploadSuccess = false
      })

      // Customer Bulk Upload reducers
      .addCase(processCustomerBulkUpload.pending, (state) => {
        state.customerBulkUploadLoading = true
        state.customerBulkUploadError = null
        state.customerBulkUploadSuccess = false
      })
      .addCase(processCustomerBulkUpload.fulfilled, (state, action) => {
        state.customerBulkUploadLoading = false
        state.customerBulkUploadSuccess = true
        state.customerBulkUploadResponse = action.payload
      })
      .addCase(processCustomerBulkUpload.rejected, (state, action) => {
        state.customerBulkUploadLoading = false
        state.customerBulkUploadError = action.payload as string
        state.customerBulkUploadSuccess = false
      })

      // Meter Bulk Upload reducers
      .addCase(processMeterBulkUpload.pending, (state) => {
        state.meterBulkUploadLoading = true
        state.meterBulkUploadError = null
        state.meterBulkUploadSuccess = false
      })
      .addCase(processMeterBulkUpload.fulfilled, (state, action) => {
        state.meterBulkUploadLoading = false
        state.meterBulkUploadSuccess = true
        state.meterBulkUploadResponse = action.payload
      })
      .addCase(processMeterBulkUpload.rejected, (state, action) => {
        state.meterBulkUploadLoading = false
        state.meterBulkUploadError = action.payload as string
        state.meterBulkUploadSuccess = false
      })

      // Customer Setup Bulk Upload reducers
      .addCase(processCustomerSetupBulkUpload.pending, (state) => {
        state.customerSetupBulkUploadLoading = true
        state.customerSetupBulkUploadError = null
        state.customerSetupBulkUploadSuccess = false
      })
      .addCase(processCustomerSetupBulkUpload.fulfilled, (state, action) => {
        state.customerSetupBulkUploadLoading = false
        state.customerSetupBulkUploadSuccess = true
        state.customerSetupBulkUploadResponse = action.payload
      })
      .addCase(processCustomerSetupBulkUpload.rejected, (state, action) => {
        state.customerSetupBulkUploadLoading = false
        state.customerSetupBulkUploadError = action.payload as string
        state.customerSetupBulkUploadSuccess = false
      })

      // Customer Info Update Bulk Upload reducers
      .addCase(processCustomerInfoUpdateBulkUpload.pending, (state) => {
        state.customerInfoUpdateBulkUploadLoading = true
        state.customerInfoUpdateBulkUploadError = null
        state.customerInfoUpdateBulkUploadSuccess = false
      })
      .addCase(processCustomerInfoUpdateBulkUpload.fulfilled, (state, action) => {
        state.customerInfoUpdateBulkUploadLoading = false
        state.customerInfoUpdateBulkUploadSuccess = true
        state.customerInfoUpdateBulkUploadResponse = action.payload
      })
      .addCase(processCustomerInfoUpdateBulkUpload.rejected, (state, action) => {
        state.customerInfoUpdateBulkUploadLoading = false
        state.customerInfoUpdateBulkUploadError = action.payload as string
        state.customerInfoUpdateBulkUploadSuccess = false
      })

      // Customer Feeder Update Bulk Upload reducers
      .addCase(processCustomerFeederUpdateBulkUpload.pending, (state) => {
        state.customerFeederUpdateBulkUploadLoading = true
        state.customerFeederUpdateBulkUploadError = null
        state.customerFeederUpdateBulkUploadSuccess = false
      })
      .addCase(processCustomerFeederUpdateBulkUpload.fulfilled, (state, action) => {
        state.customerFeederUpdateBulkUploadLoading = false
        state.customerFeederUpdateBulkUploadSuccess = true
        state.customerFeederUpdateBulkUploadResponse = action.payload
      })
      .addCase(processCustomerFeederUpdateBulkUpload.rejected, (state, action) => {
        state.customerFeederUpdateBulkUploadLoading = false
        state.customerFeederUpdateBulkUploadError = action.payload as string
        state.customerFeederUpdateBulkUploadSuccess = false
      })

      // Customer Tariff Change Bulk Upload reducers
      .addCase(processCustomerTariffChangeBulkUpload.pending, (state) => {
        state.customerTariffChangeBulkUploadLoading = true
        state.customerTariffChangeBulkUploadError = null
        state.customerTariffChangeBulkUploadSuccess = false
      })
      .addCase(processCustomerTariffChangeBulkUpload.fulfilled, (state, action) => {
        state.customerTariffChangeBulkUploadLoading = false
        state.customerTariffChangeBulkUploadSuccess = true
        state.customerTariffChangeBulkUploadResponse = action.payload
      })
      .addCase(processCustomerTariffChangeBulkUpload.rejected, (state, action) => {
        state.customerTariffChangeBulkUploadLoading = false
        state.customerTariffChangeBulkUploadError = action.payload as string
        state.customerTariffChangeBulkUploadSuccess = false
      })

      // Customer Status Change Bulk Upload reducers
      .addCase(processCustomerStatusChangeBulkUpload.pending, (state) => {
        state.customerStatusChangeBulkUploadLoading = true
        state.customerStatusChangeBulkUploadError = null
        state.customerStatusChangeBulkUploadSuccess = false
      })
      .addCase(processCustomerStatusChangeBulkUpload.fulfilled, (state, action) => {
        state.customerStatusChangeBulkUploadLoading = false
        state.customerStatusChangeBulkUploadSuccess = true
        state.customerStatusChangeBulkUploadResponse = action.payload
      })
      .addCase(processCustomerStatusChangeBulkUpload.rejected, (state, action) => {
        state.customerStatusChangeBulkUploadLoading = false
        state.customerStatusChangeBulkUploadError = action.payload as string
        state.customerStatusChangeBulkUploadSuccess = false
      })

      // Customer Stored Average Update Bulk Upload reducers
      .addCase(processCustomerStoredAverageUpdateBulkUpload.pending, (state) => {
        state.customerStoredAverageUpdateBulkUploadLoading = true
        state.customerStoredAverageUpdateBulkUploadError = null
        state.customerStoredAverageUpdateBulkUploadSuccess = false
      })
      .addCase(processCustomerStoredAverageUpdateBulkUpload.fulfilled, (state, action) => {
        state.customerStoredAverageUpdateBulkUploadLoading = false
        state.customerStoredAverageUpdateBulkUploadSuccess = true
        state.customerStoredAverageUpdateBulkUploadResponse = action.payload
      })
      .addCase(processCustomerStoredAverageUpdateBulkUpload.rejected, (state, action) => {
        state.customerStoredAverageUpdateBulkUploadLoading = false
        state.customerStoredAverageUpdateBulkUploadError = action.payload as string
        state.customerStoredAverageUpdateBulkUploadSuccess = false
      })

      // Customer SRDT Update Bulk Upload reducers
      .addCase(processCustomerSrdtUpdateBulkUpload.pending, (state) => {
        state.customerSrdtUpdateBulkUploadLoading = true
        state.customerSrdtUpdateBulkUploadError = null
        state.customerSrdtUpdateBulkUploadSuccess = false
      })
      .addCase(processCustomerSrdtUpdateBulkUpload.fulfilled, (state, action) => {
        state.customerSrdtUpdateBulkUploadLoading = false
        state.customerSrdtUpdateBulkUploadSuccess = true
        state.customerSrdtUpdateBulkUploadResponse = action.payload
      })
      .addCase(processCustomerSrdtUpdateBulkUpload.rejected, (state, action) => {
        state.customerSrdtUpdateBulkUploadLoading = false
        state.customerSrdtUpdateBulkUploadError = action.payload as string
        state.customerSrdtUpdateBulkUploadSuccess = false
      })

      // Meter Reading Bulk Upload reducers
      .addCase(processMeterReadingBulkUpload.pending, (state) => {
        state.meterReadingBulkUploadLoading = true
        state.meterReadingBulkUploadError = null
        state.meterReadingBulkUploadSuccess = false
      })
      .addCase(processMeterReadingBulkUpload.fulfilled, (state, action) => {
        state.meterReadingBulkUploadLoading = false
        state.meterReadingBulkUploadSuccess = true
        state.meterReadingBulkUploadResponse = action.payload
      })
      .addCase(processMeterReadingBulkUpload.rejected, (state, action) => {
        state.meterReadingBulkUploadLoading = false
        state.meterReadingBulkUploadError = action.payload as string
        state.meterReadingBulkUploadSuccess = false
      })

      // Meter Reading (General) Bulk Upload reducers
      .addCase(processMeterReadingGeneralBulkUpload.pending, (state) => {
        state.meterReadingGeneralBulkUploadLoading = true
        state.meterReadingGeneralBulkUploadError = null
        state.meterReadingGeneralBulkUploadSuccess = false
      })
      .addCase(processMeterReadingGeneralBulkUpload.fulfilled, (state, action) => {
        state.meterReadingGeneralBulkUploadLoading = false
        state.meterReadingGeneralBulkUploadSuccess = true
        state.meterReadingGeneralBulkUploadResponse = action.payload
      })
      .addCase(processMeterReadingGeneralBulkUpload.rejected, (state, action) => {
        state.meterReadingGeneralBulkUploadLoading = false
        state.meterReadingGeneralBulkUploadError = action.payload as string
        state.meterReadingGeneralBulkUploadSuccess = false
      })

      // Meter Reading Stored Average Update Bulk Upload reducers
      .addCase(processMeterReadingStoredAverageUpdateBulkUpload.pending, (state) => {
        state.meterReadingStoredAverageUpdateBulkUploadLoading = true
        state.meterReadingStoredAverageUpdateBulkUploadError = null
        state.meterReadingStoredAverageUpdateBulkUploadSuccess = false
      })
      .addCase(processMeterReadingStoredAverageUpdateBulkUpload.fulfilled, (state, action) => {
        state.meterReadingStoredAverageUpdateBulkUploadLoading = false
        state.meterReadingStoredAverageUpdateBulkUploadSuccess = true
        state.meterReadingStoredAverageUpdateBulkUploadResponse = action.payload
      })
      .addCase(processMeterReadingStoredAverageUpdateBulkUpload.rejected, (state, action) => {
        state.meterReadingStoredAverageUpdateBulkUploadLoading = false
        state.meterReadingStoredAverageUpdateBulkUploadError = action.payload as string
        state.meterReadingStoredAverageUpdateBulkUploadSuccess = false
      })

      // Missing Postpaid Billing Bulk Upload reducers
      .addCase(processMissingPostpaidBillingBulkUpload.pending, (state) => {
        state.missingPostpaidBillingBulkUploadLoading = true
        state.missingPostpaidBillingBulkUploadError = null
        state.missingPostpaidBillingBulkUploadSuccess = false
      })
      .addCase(processMissingPostpaidBillingBulkUpload.fulfilled, (state, action) => {
        state.missingPostpaidBillingBulkUploadLoading = false
        state.missingPostpaidBillingBulkUploadSuccess = true
        state.missingPostpaidBillingBulkUploadResponse = action.payload
      })
      .addCase(processMissingPostpaidBillingBulkUpload.rejected, (state, action) => {
        state.missingPostpaidBillingBulkUploadLoading = false
        state.missingPostpaidBillingBulkUploadError = action.payload as string
        state.missingPostpaidBillingBulkUploadSuccess = false
      })

      // General Billing Bulk Upload reducers
      .addCase(processBillingBulkUpload.pending, (state) => {
        state.billingBulkUploadLoading = true
        state.billingBulkUploadError = null
        state.billingBulkUploadSuccess = false
      })
      .addCase(processBillingBulkUpload.fulfilled, (state, action) => {
        state.billingBulkUploadLoading = false
        state.billingBulkUploadSuccess = true
        state.billingBulkUploadResponse = action.payload
      })
      .addCase(processBillingBulkUpload.rejected, (state, action) => {
        state.billingBulkUploadLoading = false
        state.billingBulkUploadError = action.payload as string
        state.billingBulkUploadSuccess = false
      })

      // Past Postpaid Billing Bulk Upload reducers
      .addCase(processPastPostpaidBillingBulkUpload.pending, (state) => {
        state.pastPostpaidBillingBulkUploadLoading = true
        state.pastPostpaidBillingBulkUploadError = null
        state.pastPostpaidBillingBulkUploadSuccess = false
      })
      .addCase(processPastPostpaidBillingBulkUpload.fulfilled, (state, action) => {
        state.pastPostpaidBillingBulkUploadLoading = false
        state.pastPostpaidBillingBulkUploadSuccess = true
        state.pastPostpaidBillingBulkUploadResponse = action.payload
      })
      .addCase(processPastPostpaidBillingBulkUpload.rejected, (state, action) => {
        state.pastPostpaidBillingBulkUploadLoading = false
        state.pastPostpaidBillingBulkUploadError = action.payload as string
        state.pastPostpaidBillingBulkUploadSuccess = false
      })

      // Adjustment Billing Bulk Upload reducers
      .addCase(processAdjustmentBillingBulkUpload.pending, (state) => {
        state.adjustmentBillingBulkUploadLoading = true
        state.adjustmentBillingBulkUploadError = null
        state.adjustmentBillingBulkUploadSuccess = false
      })
      .addCase(processAdjustmentBillingBulkUpload.fulfilled, (state, action) => {
        state.adjustmentBillingBulkUploadLoading = false
        state.adjustmentBillingBulkUploadSuccess = true
        state.adjustmentBillingBulkUploadResponse = action.payload
      })
      .addCase(processAdjustmentBillingBulkUpload.rejected, (state, action) => {
        state.adjustmentBillingBulkUploadLoading = false
        state.adjustmentBillingBulkUploadError = action.payload as string
        state.adjustmentBillingBulkUploadSuccess = false
      })

      // Finalize Billing Bulk Upload reducers
      .addCase(processFinalizeBillingBulkUpload.pending, (state) => {
        state.finalizeBillingBulkUploadLoading = true
        state.finalizeBillingBulkUploadError = null
        state.finalizeBillingBulkUploadSuccess = false
      })
      .addCase(processFinalizeBillingBulkUpload.fulfilled, (state, action) => {
        state.finalizeBillingBulkUploadLoading = false
        state.finalizeBillingBulkUploadSuccess = true
        state.finalizeBillingBulkUploadResponse = action.payload
      })
      .addCase(processFinalizeBillingBulkUpload.rejected, (state, action) => {
        state.finalizeBillingBulkUploadLoading = false
        state.finalizeBillingBulkUploadError = action.payload as string
        state.finalizeBillingBulkUploadSuccess = false
      })

      // Bill Crucial Ops Bulk Upload reducers
      .addCase(processBillCrucialOpsBulkUpload.pending, (state) => {
        state.billCrucialOpsBulkUploadLoading = true
        state.billCrucialOpsBulkUploadError = null
        state.billCrucialOpsBulkUploadSuccess = false
      })
      .addCase(processBillCrucialOpsBulkUpload.fulfilled, (state, action) => {
        state.billCrucialOpsBulkUploadLoading = false
        state.billCrucialOpsBulkUploadSuccess = true
        state.billCrucialOpsBulkUploadResponse = action.payload
      })
      .addCase(processBillCrucialOpsBulkUpload.rejected, (state, action) => {
        state.billCrucialOpsBulkUploadLoading = false
        state.billCrucialOpsBulkUploadError = action.payload as string
        state.billCrucialOpsBulkUploadSuccess = false
      })

      // Feeder Energy Cap Bulk Upload reducers
      .addCase(processFeederEnergyCapBulkUpload.pending, (state) => {
        state.feederEnergyCapBulkUploadLoading = true
        state.feederEnergyCapBulkUploadError = null
        state.feederEnergyCapBulkUploadSuccess = false
      })
      .addCase(processFeederEnergyCapBulkUpload.fulfilled, (state, action) => {
        state.feederEnergyCapBulkUploadLoading = false
        state.feederEnergyCapBulkUploadSuccess = true
        state.feederEnergyCapBulkUploadResponse = action.payload
      })
      .addCase(processFeederEnergyCapBulkUpload.rejected, (state, action) => {
        state.feederEnergyCapBulkUploadLoading = false
        state.feederEnergyCapBulkUploadError = action.payload as string
        state.feederEnergyCapBulkUploadSuccess = false
      })

      // Distribution Substation Bulk Upload reducers
      .addCase(processDistributionSubstationBulkUpload.pending, (state) => {
        state.distributionSubstationBulkUploadLoading = true
        state.distributionSubstationBulkUploadError = null
        state.distributionSubstationBulkUploadSuccess = false
      })
      .addCase(processDistributionSubstationBulkUpload.fulfilled, (state, action) => {
        state.distributionSubstationBulkUploadLoading = false
        state.distributionSubstationBulkUploadSuccess = true
        state.distributionSubstationBulkUploadResponse = action.payload
      })
      .addCase(processDistributionSubstationBulkUpload.rejected, (state, action) => {
        state.distributionSubstationBulkUploadLoading = false
        state.distributionSubstationBulkUploadError = action.payload as string
        state.distributionSubstationBulkUploadSuccess = false
      })

      // CSV Jobs reducers
      .addCase(fetchCsvJobs.pending, (state) => {
        state.csvJobsLoading = true
        state.csvJobsError = null
        state.csvJobsSuccess = false
      })
      .addCase(fetchCsvJobs.fulfilled, (state, action) => {
        state.csvJobsLoading = false
        state.csvJobsSuccess = true
        state.csvJobsResponse = action.payload
        state.csvJobs = action.payload.data
        state.csvJobsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchCsvJobs.rejected, (state, action) => {
        state.csvJobsLoading = false
        state.csvJobsError = action.payload as string
        state.csvJobsSuccess = false
      })

      // CSV Upload Failures reducers
      .addCase(fetchCsvUploadFailures.pending, (state) => {
        state.csvUploadFailuresLoading = true
        state.csvUploadFailuresError = null
        state.csvUploadFailuresSuccess = false
      })
      .addCase(fetchCsvUploadFailures.fulfilled, (state, action) => {
        state.csvUploadFailuresLoading = false
        state.csvUploadFailuresSuccess = true
        state.csvUploadFailuresResponse = action.payload
        state.csvUploadFailures = action.payload.data
        state.csvUploadFailuresPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchCsvUploadFailures.rejected, (state, action) => {
        state.csvUploadFailuresLoading = false
        state.csvUploadFailuresError = action.payload as string
        state.csvUploadFailuresSuccess = false
      })
  },
})

export const {
  resetFileIntentState,
  resetFinalizeFileState,
  resetFileManagementState,
  resetBulkUploadState,
  resetCustomerBulkUploadState,
  resetMeterBulkUploadState,
  resetCustomerSetupBulkUploadState,
  resetCustomerInfoUpdateBulkUploadState,
  resetCustomerFeederUpdateBulkUploadState,
  resetCustomerTariffChangeBulkUploadState,
  resetCustomerStatusChangeBulkUploadState,
  resetCustomerStoredAverageUpdateBulkUploadState,
  resetCustomerSrdtUpdateBulkUploadState,
  resetMeterReadingBulkUploadState,
  resetMeterReadingGeneralBulkUploadState,
  resetMeterReadingStoredAverageUpdateBulkUploadState,
  resetMissingPostpaidBillingBulkUploadState,
  resetBillingBulkUploadState,
  resetPastPostpaidBillingBulkUploadState,
  resetAdjustmentBillingBulkUploadState,
  resetFinalizeBillingBulkUploadState,
  resetBillCrucialOpsBulkUploadState,
  resetFeederEnergyCapBulkUploadState,
  resetCsvJobsState,
  resetCsvUploadFailuresState,
} = fileManagementSlice.actions

export default fileManagementSlice.reducer
