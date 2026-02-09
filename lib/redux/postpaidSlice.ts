// src/lib/redux/postpaidSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { api } from "./authSlice"
import { API_CONFIG, API_ENDPOINTS, buildApiUrl } from "lib/config/api"

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
  totalPaid: any
  outstandingAmount: number
  reference: any
  id: number
  name: string
  period: string
  billingPeriodId: number
  billingPeriod: any
  category: number
  status: number
  adjustmentStatus: number
  customerId: number
  customerName: string
  customerAccountNumber: string
  customerStatusCode: any
  customerAverageDailyConsumption: any
  customerTariffCode: string
  customerMeterNumber: string | null
  netArrears: number
  billingId: string
  publicReference: any
  distributionSubstationId: number
  distributionSubstationCode: string
  distributionSubstationName: string
  feederId: number
  feederName: string
  areaOfficeId: number
  areaOfficeName: string
  meterReadingId: any
  feederEnergyCapId: any
  previousReadingKwh: number
  presentReadingKwh: number
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
  closingBalance: any
  isMigrated: boolean
  forecastConsumptionKwh: any
  forecastChargeBeforeVat: any
  forecastVatAmount: any
  forecastBillAmount: any
  forecastTotalDue: any
  isEstimated: boolean
  estimatedConsumptionKwh: any
  estimatedBillAmount: any
  actualConsumptionKwh: any
  actualBillAmount: any
  consumptionVarianceKwh: any
  billingVarianceAmount: any
  isMeterReadingFlagged: boolean
  meterReadingValidationStatus: any
  openDisputeCount: number
  activeDispute: ActiveDispute | null
  dueDate: string
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
  }
  createdAt: string
  lastUpdated: string | null
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
  billingPeriodId?: number
  customerId?: number
  accountNumber?: string
  status?: number
  category?: number
  areaOfficeId?: number
  feederId?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
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
  billingPeriodId?: number
  areaOfficeId?: number
  status?: number
  fromRequestedAtUtc?: string
  toRequestedAtUtc?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
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
  billingPeriodId: number
}

export interface FinalizePeriodResponse {
  isSuccess: boolean
  message: string
  data: string
}

// Finalize Period by Area Office Interfaces
export interface FinalizePeriodByAreaOfficeRequest {
  billingPeriodId: number
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
  billingPeriodId: number
  category: number
  feederId: number
  distributionSubstationId: number
  previousReadingKwh: number
  presentReadingKwh: number
  energyCapKwh?: number
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
  billingPeriodId: number
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

// Finalize Single Bill Interfaces
export interface FinalizeSingleBillRequest {
  effectiveAtUtc: string
  skipLedgerPosting: boolean
  billPdfUrl: string
}

export interface FinalizeSingleBillResponse {
  isSuccess: boolean
  message: string
  data: PostpaidBill
}

// Vendor Summary Report Interfaces
export interface VendorSummaryReportRequestParams {
  vendorId: number
  startDateUtc: string
  endDateUtc: string
  source?: string
}

export interface VendorSummaryReportData {
  totalCount: number
  capturedCount: number
  processedCount: number
  failedCount: number
}

export interface VendorSummaryReportResponse {
  isSuccess: boolean
  message: string
  data: VendorSummaryReportData
}

// Download AR Interfaces
export interface DownloadARRequestParams {
  billingPeriodId: number
  billingPeriodName?: string // Add billing period name for filename generation
  areaOfficeId?: number
  feederId?: number
  distributionSubstationId?: number
  isMd?: boolean
}

export interface DownloadARResponse {
  isSuccess: boolean
  message: string
  data: {
    blob: Blob
    filename: string
    headers: any
    contentDisposition: string | null
  }
}

// Printing Jobs Interfaces
export interface PrintingJobFile {
  fileName: string
  key: string
  url: string
  groupName: string
  groupId: number
  partNumber: number
  billCount: number
}

export interface PrintingJob {
  id: number
  billingPeriodId: number
  period: string
  groupBy: number
  feederId: number
  feederName: string
  areaOfficeId: number
  areaOfficeName: string
  distributionSubstationId: number
  distributionSubstationName: string
  provinceId: number
  provinceName: string
  isMd: boolean
  maxBillsPerFile: number
  status: number
  totalBills: number
  processedBills: number
  fileCount: number
  zipUrl: string
  zipKey: string
  requestedAtUtc: string
  startedAtUtc: string
  completedAtUtc: string
  lastError: string
  files: PrintingJobFile[]
}

export interface PrintingJobsResponse {
  isSuccess: boolean
  message: string
  data: PrintingJob[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PrintingJobsRequestParams {
  pageNumber: number
  pageSize: number
  billingPeriodId?: number
  groupBy?: number
  feederId?: number
  areaOfficeId?: number
  distributionSubstationId?: number
  provinceId?: number
  isMd?: boolean
}

// Mark as Ready to Print Interfaces
export interface MarkAsReadyToPrintRequest {
  billingPeriodId: number
  customerAccountNumbers: string[]
  feederId?: number
  distributionSubstationId?: number
  areaOfficeId?: number
  isMd?: boolean
  statusCode?: string
  billStatus?: number
}

export interface MarkAsReadyToPrintResponse {
  isSuccess: boolean
  message: string
  data: {
    updated: number
  }
}

// Adjustments Interfaces
export interface Adjustment {
  id: number
  postpaidBillId: number
  customerId: number
  customerName: string
  customerAccountNumber: string
  billingPeriodId: number
  period: string
  amount: number
  status: number
  csvBulkInsertionJobId: number
  uploadedByUserId: number
  uploadedByName: string
  approvedByUserId: number
  approvedByName: string
  approvedAtUtc: string
  createdAt: string
}

export interface AdjustmentsResponse {
  isSuccess: boolean
  message: string
  data: Adjustment[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface AdjustmentsRequestParams {
  pageNumber: number
  pageSize: number
  billingPeriodId?: number
  period?: string
  customerId?: number
  areaOfficeId?: number
  csvBulkInsertionJobId?: number
  status?: number
}

// Single Billing Print Interfaces
export interface SingleBillingPrintRequest {
  billingPeriodId: number
  feederId?: number
  areaOfficeId?: number
  distributionSubstationId?: number
  provinceId?: number
  isMd?: boolean
  groupBy?: number
  maxBillsPerFile?: number
}

export interface SingleBillingPrintFile {
  fileName: string
  key: string
}

export interface SingleBillingPrintResponseData {
  id: number
  billingPeriodId: number
  period: string
  groupBy: number
  feederId: number
  feederName: string
  areaOfficeId: number
  areaOfficeName: string
  distributionSubstationId: number
  distributionSubstationName: string
  provinceId: number
  provinceName: string
  isMd: boolean
  maxBillsPerFile: number
  status: number
  totalBills: number
  processedBills: number
  fileCount: number
  zipUrl: string
  zipKey: string
  requestedAtUtc: string
  startedAtUtc: string
  completedAtUtc: string
  lastError: string
  files: SingleBillingPrintFile[]
}

export interface SingleBillingPrintResponse {
  isSuccess: boolean
  message: string
  data: SingleBillingPrintResponseData
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

  // Finalize Single Bill state
  finalizeSingleBillLoading: boolean
  finalizeSingleBillError: string | null
  finalizeSingleBillSuccess: boolean
  finalizeSingleBillMessage: string | null
  finalizedSingleBill: PostpaidBill | null

  // Adjustments state
  adjustments: Adjustment[]
  adjustmentsLoading: boolean
  adjustmentsError: string | null
  adjustmentsSuccess: boolean
  adjustmentsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Vendor Summary Report state
  vendorSummaryReport: VendorSummaryReportData | null
  vendorSummaryReportLoading: boolean
  vendorSummaryReportError: string | null
  vendorSummaryReportSuccess: boolean

  // Download AR state
  downloadARLoading: boolean
  downloadARError: string | null
  downloadARSuccess: boolean
  downloadARMessage: string | null
  downloadARData: {
    blob: Blob
    filename: string
    headers: any
    contentDisposition: string | null
  } | null

  // Download Print Job state
  downloadPrintJobLoading: boolean
  downloadPrintJobError: string | null
  downloadPrintJobSuccess: boolean
  downloadPrintJobMessage: string | null

  // Printing Jobs state
  printingJobs: PrintingJob[]
  printingJobsLoading: boolean
  printingJobsError: string | null
  printingJobsSuccess: boolean
  printingJobsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Mark as Ready to Print state
  markAsReadyToPrintLoading: boolean
  markAsReadyToPrintError: string | null
  markAsReadyToPrintSuccess: boolean
  markAsReadyToPrintMessage: string | null
  markAsReadyToPrintData: {
    updated: number
  } | null

  // Single Billing Print state
  singleBillingPrintLoading: boolean
  singleBillingPrintError: string | null
  singleBillingPrintSuccess: boolean
  singleBillingPrintMessage: string | null
  singleBillingPrintData: SingleBillingPrintResponseData | null

  // Search/filter state
  filters: {
    period?: string
    billingPeriodId?: number
    customerId?: number
    accountNumber?: string
    status?: number
    category?: number
    areaOfficeId?: number
    feederId?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
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
  finalizeSingleBillLoading: false,
  finalizeSingleBillError: null,
  finalizeSingleBillSuccess: false,
  finalizeSingleBillMessage: null,
  finalizedSingleBill: null,
  adjustments: [],
  adjustmentsLoading: false,
  adjustmentsError: null,
  adjustmentsSuccess: false,
  adjustmentsPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  vendorSummaryReport: null,
  vendorSummaryReportLoading: false,
  vendorSummaryReportError: null,
  vendorSummaryReportSuccess: false,
  downloadARLoading: false,
  downloadARError: null,
  downloadARSuccess: false,
  downloadARMessage: null,
  downloadARData: null,

  // Download Print Job state
  downloadPrintJobLoading: false,
  downloadPrintJobError: null,
  downloadPrintJobSuccess: false,
  downloadPrintJobMessage: null,
  printingJobs: [],
  printingJobsLoading: false,
  printingJobsError: null,
  printingJobsSuccess: false,
  printingJobsPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  markAsReadyToPrintLoading: false,
  markAsReadyToPrintError: null,
  markAsReadyToPrintSuccess: false,
  markAsReadyToPrintMessage: null,
  markAsReadyToPrintData: null,
  singleBillingPrintLoading: false,
  singleBillingPrintError: null,
  singleBillingPrintSuccess: false,
  singleBillingPrintMessage: null,
  singleBillingPrintData: null,
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
      const {
        pageNumber,
        pageSize,
        period,
        billingPeriodId,
        customerId,
        accountNumber,
        status,
        category,
        areaOfficeId,
        feederId,
        sortBy,
        sortOrder,
      } = params

      const response = await api.get<PostpaidBillsResponse>(buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(period && { Period: period }),
          ...(billingPeriodId && { BillingPeriodId: billingPeriodId }),
          ...(customerId && { CustomerId: customerId }),
          ...(accountNumber && { AccountNumber: accountNumber }),
          ...(status !== undefined && { Status: status }),
          ...(category !== undefined && { Category: category }),
          ...(areaOfficeId && { AreaOfficeId: areaOfficeId }),
          ...(feederId && { FeederId: feederId }),
          ...(sortBy && { SortBy: sortBy }),
          ...(sortOrder && { SortOrder: sortOrder }),
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
      const {
        pageNumber,
        pageSize,
        billingPeriodId,
        areaOfficeId,
        status,
        fromRequestedAtUtc,
        toRequestedAtUtc,
        sortBy,
        sortOrder,
      } = params

      const response = await api.get<BillingJobsResponse>(buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.BILLING_JOBS), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(billingPeriodId && { BillingPeriodId: billingPeriodId }),
          ...(areaOfficeId && { AreaOfficeId: areaOfficeId }),
          ...(status !== undefined && { Status: status }),
          ...(fromRequestedAtUtc && { FromRequestedAtUtc: fromRequestedAtUtc }),
          ...(toRequestedAtUtc && { ToRequestedAtUtc: toRequestedAtUtc }),
          ...(sortBy && { SortBy: sortBy }),
          ...(sortOrder && { SortOrder: sortOrder }),
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

// Finalize Single Bill Async Thunk
export const finalizeSingleBill = createAsyncThunk(
  "postpaidBilling/finalizeSingleBill",
  async ({ id, requestData }: { id: number; requestData: FinalizeSingleBillRequest }, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.POSTPAID_BILLING.FINALIZE_SINGLE_BILL, { id })
      const response = await api.post<FinalizeSingleBillResponse>(buildApiUrl(endpoint), requestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to finalize single bill")
      }

      if (!response.data.data) {
        return rejectWithValue("Finalized single bill data not found")
      }

      return {
        billId: id,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to finalize single bill")
      }
      return rejectWithValue(error.message || "Network error during single bill finalization")
    }
  }
)

// Fetch Adjustments Async Thunk
export const fetchAdjustments = createAsyncThunk(
  "postpaidBilling/fetchAdjustments",
  async (params: AdjustmentsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, billingPeriodId, period, customerId, areaOfficeId, csvBulkInsertionJobId, status } =
        params

      const response = await api.get<AdjustmentsResponse>(buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.ADJUSTMENTS), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(billingPeriodId && { BillingPeriodId: billingPeriodId }),
          ...(period && { Period: period }),
          ...(customerId && { CustomerId: customerId }),
          ...(areaOfficeId && { AreaOfficeId: areaOfficeId }),
          ...(csvBulkInsertionJobId && { CsvBulkInsertionJobId: csvBulkInsertionJobId }),
          ...(status !== undefined && { Status: status }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch adjustments")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch adjustments")
      }
      return rejectWithValue(error.message || "Network error during adjustments fetch")
    }
  }
)

// Fetch Vendor Summary Report Async Thunk
export const fetchVendorSummaryReport = createAsyncThunk(
  "postpaidBilling/fetchVendorSummaryReport",
  async (params: VendorSummaryReportRequestParams, { rejectWithValue }) => {
    try {
      const { vendorId, startDateUtc, endDateUtc, source } = params

      // Build query parameters only if they exist
      const queryParams: any = {}
      if (vendorId !== undefined) queryParams.VendorId = vendorId
      if (startDateUtc) queryParams.StartDateUtc = startDateUtc
      if (endDateUtc) queryParams.EndDateUtc = endDateUtc
      if (source) queryParams.Source = source

      const response = await api.get<VendorSummaryReportResponse>(buildApiUrl(API_ENDPOINTS.VENDOR_SUMMARY_REPORT), {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch vendor summary report")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch vendor summary report")
      }
      return rejectWithValue(error.message || "Network error during vendor summary report fetch")
    }
  }
)

export const downloadAR = createAsyncThunk(
  "postpaidBilling/downloadAR",
  async (params: DownloadARRequestParams, { rejectWithValue }) => {
    try {
      const { billingPeriodId, billingPeriodName, areaOfficeId, feederId, distributionSubstationId, isMd } = params

      const response = await api.get(buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.DOWNLOAD_AR), {
        params: {
          BillingPeriodId: billingPeriodId,
          ...(areaOfficeId && { AreaOfficeId: areaOfficeId }),
          ...(feederId && { FeederId: feederId }),
          ...(distributionSubstationId && { DistributionSubstationId: distributionSubstationId }),
          ...(isMd !== undefined && { IsMd: isMd }),
        },
        responseType: "blob", // Important: Handle the response as a blob (file)
        // Add custom headers to ensure we get all response headers
        headers: {
          Accept: "text/csv, application/json, */*",
        },
        // Ensure we can access response headers
        withCredentials: true,
        // Override transformResponse to capture headers
        transformResponse: [
          (data, headers) => {
            console.log("TransformResponse headers:", headers)
            return data
          },
        ],
      })

      // Generate filename dynamically based on billing period name
      let filename = "AR_Report.csv" // fallback

      if (billingPeriodName) {
        // Format filename based on billing period name
        const formattedName = billingPeriodName.toUpperCase().replace(/\s+/g, " ")
        filename = `${formattedName} BILLING AR.csv`
        console.log("Generated dynamic filename:", filename)
      } else {
        // Fall back to a generic filename based on the billing period ID
        filename = `BILLING_PERIOD_${billingPeriodId}_AR.csv`
        console.log("Using fallback filename:", filename)
      }

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: "text/csv" })

      // Create download link and trigger download with the correct filename
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return {
        isSuccess: true,
        message: `AR report downloaded successfully as: ${filename}`,
        data: {
          blob: response.data,
          filename: filename,
          headers: response.headers,
          contentDisposition: response.headers["content-disposition"] || null,
        },
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to download AR report")
      }
      return rejectWithValue(error.message || "Network error during AR report download")
    }
  }
)

// Download Print Job Async Thunk
export const downloadPrintJob = createAsyncThunk(
  "postpaidBilling/downloadPrintJob",
  async (jobId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.DOWNLOAD_PRINT_JOB.replace("{id}", jobId.toString())),
        {
          responseType: "blob", // Important for file downloads
        }
      )

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers["content-disposition"]
      let filename = `print-job-${jobId}.zip`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: "application/zip" })

      // Create download link and trigger download with the correct filename
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the blob URL
      window.URL.revokeObjectURL(url)

      return {
        isSuccess: true,
        message: `Print job downloaded successfully as: ${filename}`,
        data: {
          blob: response.data,
          filename: filename,
          headers: response.headers,
          contentDisposition: contentDisposition || null,
        },
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to download print job")
      }
      return rejectWithValue(error.message || "Network error during print job download")
    }
  }
)

// Fetch Printing Jobs Async Thunk
export const fetchPrintingJobs = createAsyncThunk(
  "postpaidBilling/fetchPrintingJobs",
  async (params: PrintingJobsRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        billingPeriodId,
        groupBy,
        feederId,
        areaOfficeId,
        distributionSubstationId,
        provinceId,
        isMd,
      } = params

      const response = await api.get<PrintingJobsResponse>(
        buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.POSTPAID_BILL_PRINT),
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            ...(billingPeriodId && { BillingPeriodId: billingPeriodId }),
            ...(groupBy !== undefined && { GroupBy: groupBy }),
            ...(feederId && { FeederId: feederId }),
            ...(areaOfficeId && { AreaOfficeId: areaOfficeId }),
            ...(distributionSubstationId && { DistributionSubstationId: distributionSubstationId }),
            ...(provinceId && { ProvinceId: provinceId }),
            ...(isMd !== undefined && { IsMd: isMd }),
          },
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch printing jobs")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch printing jobs")
      }
      return rejectWithValue(error.message || "Network error during printing jobs fetch")
    }
  }
)

// Mark as Ready to Print Async Thunk
export const markAsReadyToPrint = createAsyncThunk(
  "postpaidBilling/markAsReadyToPrint",
  async (requestData: MarkAsReadyToPrintRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<MarkAsReadyToPrintResponse>(
        buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.MARK_AS_READY_TO_PRINT),
        requestData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to mark bills as ready to print")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to mark bills as ready to print")
      }
      return rejectWithValue(error.message || "Network error during mark as ready to print")
    }
  }
)

// Single Billing Print Async Thunk
export const singleBillingPrint = createAsyncThunk(
  "postpaidBilling/singleBillingPrint",
  async (requestData: SingleBillingPrintRequest, { rejectWithValue }) => {
    try {
      console.log("Starting single billing print with request:", requestData)

      const response = await api.post<SingleBillingPrintResponse>(
        buildApiUrl(API_ENDPOINTS.POSTPAID_BILLING.SINGLE_BILLING_PRINT),
        requestData
      )

      console.log("Single billing print API response:", response.data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to queue single billing print job")
      }

      return response.data
    } catch (error: any) {
      console.error("Single billing print API error:", error)
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to queue single billing print job")
      }
      return rejectWithValue(error.message || "Network error during single billing print")
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
      state.vendorSummaryReportError = null
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

    // Clear finalize single bill status
    clearFinalizeSingleBillStatus: (state) => {
      state.finalizeSingleBillLoading = false
      state.finalizeSingleBillError = null
      state.finalizeSingleBillSuccess = false
      state.finalizeSingleBillMessage = null
      state.finalizedSingleBill = null
    },

    // Clear adjustments status
    clearAdjustmentsStatus: (state) => {
      state.adjustmentsLoading = false
      state.adjustmentsError = null
      state.adjustmentsSuccess = false
      state.adjustments = []
      state.adjustmentsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear vendor summary report status
    clearVendorSummaryReportStatus: (state) => {
      state.vendorSummaryReportLoading = false
      state.vendorSummaryReportError = null
      state.vendorSummaryReportSuccess = false
      state.vendorSummaryReport = null
    },

    // Clear download AR status
    clearDownloadARStatus: (state) => {
      state.downloadARLoading = false
      state.downloadARError = null
      state.downloadARSuccess = false
      state.downloadARMessage = null
      state.downloadARData = null
    },

    // Clear printing jobs status
    clearPrintingJobsStatus: (state) => {
      state.printingJobsLoading = false
      state.printingJobsError = null
      state.printingJobsSuccess = false
      state.printingJobs = []
      state.printingJobsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear mark as ready to print status
    clearMarkAsReadyToPrintStatus: (state) => {
      state.markAsReadyToPrintLoading = false
      state.markAsReadyToPrintError = null
      state.markAsReadyToPrintSuccess = false
      state.markAsReadyToPrintMessage = null
      state.markAsReadyToPrintData = null
    },

    // Clear single billing print status
    clearSingleBillingPrintStatus: (state) => {
      state.singleBillingPrintLoading = false
      state.singleBillingPrintError = null
      state.singleBillingPrintSuccess = false
      state.singleBillingPrintMessage = null
      state.singleBillingPrintData = null
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
      state.finalizeSingleBillLoading = false
      state.finalizeSingleBillError = null
      state.finalizeSingleBillSuccess = false
      state.finalizeSingleBillMessage = null
      state.finalizedSingleBill = null
      state.adjustmentsLoading = false
      state.adjustmentsError = null
      state.adjustmentsSuccess = false
      state.adjustments = []
      state.adjustmentsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.vendorSummaryReport = null
      state.vendorSummaryReportLoading = false
      state.vendorSummaryReportError = null
      state.vendorSummaryReportSuccess = false
      state.filters = {}
      state.billingJobsFilters = {}
      state.printingJobs = []
      state.printingJobsLoading = false
      state.printingJobsError = null
      state.printingJobsSuccess = false
      state.printingJobsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.markAsReadyToPrintLoading = false
      state.markAsReadyToPrintError = null
      state.markAsReadyToPrintSuccess = false
      state.markAsReadyToPrintMessage = null
      state.markAsReadyToPrintData = null
      state.singleBillingPrintLoading = false
      state.singleBillingPrintError = null
      state.singleBillingPrintSuccess = false
      state.singleBillingPrintMessage = null
      state.singleBillingPrintData = null
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

    // Set adjustments pagination
    setAdjustmentsPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.adjustmentsPagination.currentPage = action.payload.page
      state.adjustmentsPagination.pageSize = action.payload.pageSize
    },

    // Set printing jobs pagination
    setPrintingJobsPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.printingJobsPagination.currentPage = action.payload.page
      state.printingJobsPagination.pageSize = action.payload.pageSize
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
      // Finalize single bill cases
      .addCase(finalizeSingleBill.pending, (state) => {
        state.finalizeSingleBillLoading = true
        state.finalizeSingleBillError = null
        state.finalizeSingleBillSuccess = false
        state.finalizeSingleBillMessage = null
        state.finalizedSingleBill = null
      })
      .addCase(
        finalizeSingleBill.fulfilled,
        (
          state,
          action: PayloadAction<{
            billId: number
            data: PostpaidBill
            message: string
          }>
        ) => {
          state.finalizeSingleBillLoading = false
          state.finalizeSingleBillSuccess = true
          state.finalizeSingleBillMessage = action.payload.message || "Single bill finalized successfully"
          state.finalizedSingleBill = action.payload.data
          state.finalizeSingleBillError = null

          // Update the bill in the bills list if it exists
          const index = state.bills.findIndex((bill) => bill.id === action.payload.billId)
          if (index !== -1) {
            state.bills[index] = action.payload.data
          }

          // Update current bill if it's the same bill
          if (state.currentBill && state.currentBill.id === action.payload.billId) {
            state.currentBill = action.payload.data
          }

          // Update current bill by reference if it's the same bill
          if (state.currentBillByReference && state.currentBillByReference.id === action.payload.billId) {
            state.currentBillByReference = action.payload.data
          }
        }
      )
      .addCase(finalizeSingleBill.rejected, (state, action) => {
        state.finalizeSingleBillLoading = false
        state.finalizeSingleBillError = (action.payload as string) || "Failed to finalize single bill"
        state.finalizeSingleBillSuccess = false
        state.finalizeSingleBillMessage = null
        state.finalizedSingleBill = null
      })
      // Fetch adjustments cases
      .addCase(fetchAdjustments.pending, (state) => {
        state.adjustmentsLoading = true
        state.adjustmentsError = null
        state.adjustmentsSuccess = false
      })
      .addCase(fetchAdjustments.fulfilled, (state, action: PayloadAction<AdjustmentsResponse>) => {
        state.adjustmentsLoading = false
        state.adjustmentsSuccess = true
        state.adjustments = action.payload.data
        state.adjustmentsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
        state.adjustmentsError = null
      })
      .addCase(fetchAdjustments.rejected, (state, action) => {
        state.adjustmentsLoading = false
        state.adjustmentsError = (action.payload as string) || "Failed to fetch adjustments"
        state.adjustmentsSuccess = false
        state.adjustments = []
        state.adjustmentsPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch vendor summary report cases
      .addCase(fetchVendorSummaryReport.pending, (state) => {
        state.vendorSummaryReportLoading = true
        state.vendorSummaryReportError = null
        state.vendorSummaryReportSuccess = false
      })
      .addCase(fetchVendorSummaryReport.fulfilled, (state, action: PayloadAction<VendorSummaryReportResponse>) => {
        state.vendorSummaryReportLoading = false
        state.vendorSummaryReportSuccess = true
        state.vendorSummaryReport = action.payload.data
        state.vendorSummaryReportError = null
      })
      .addCase(fetchVendorSummaryReport.rejected, (state, action) => {
        state.vendorSummaryReportLoading = false
        state.vendorSummaryReportError = (action.payload as string) || "Failed to fetch vendor summary report"
        state.vendorSummaryReportSuccess = false
        state.vendorSummaryReport = null
      })
      // Download AR cases
      .addCase(downloadAR.pending, (state) => {
        state.downloadARLoading = true
        state.downloadARError = null
        state.downloadARSuccess = false
        state.downloadARMessage = null
        state.downloadARData = null
      })
      .addCase(downloadAR.fulfilled, (state, action: PayloadAction<DownloadARResponse>) => {
        state.downloadARLoading = false
        state.downloadARSuccess = true
        state.downloadARMessage = action.payload.message || "AR report downloaded successfully"
        state.downloadARData = action.payload.data
        state.downloadARError = null
      })
      .addCase(downloadAR.rejected, (state, action) => {
        state.downloadARLoading = false
        state.downloadARError = (action.payload as string) || "Failed to download AR report"
        state.downloadARSuccess = false
        state.downloadARMessage = null
        state.downloadARData = null
      })
      // Download Print Job cases
      .addCase(downloadPrintJob.pending, (state) => {
        state.downloadPrintJobLoading = true
        state.downloadPrintJobError = null
        state.downloadPrintJobSuccess = false
        state.downloadPrintJobMessage = null
      })
      .addCase(downloadPrintJob.fulfilled, (state, action) => {
        state.downloadPrintJobLoading = false
        state.downloadPrintJobSuccess = true
        state.downloadPrintJobMessage = action.payload.message || "Print job downloaded successfully"
        state.downloadPrintJobError = null
      })
      .addCase(downloadPrintJob.rejected, (state, action) => {
        state.downloadPrintJobLoading = false
        state.downloadPrintJobError = (action.payload as string) || "Failed to download print job"
        state.downloadPrintJobSuccess = false
        state.downloadPrintJobMessage = null
      })
      // Fetch printing jobs cases
      .addCase(fetchPrintingJobs.pending, (state) => {
        state.printingJobsLoading = true
        state.printingJobsError = null
        state.printingJobsSuccess = false
      })
      .addCase(fetchPrintingJobs.fulfilled, (state, action: PayloadAction<PrintingJobsResponse>) => {
        state.printingJobsLoading = false
        state.printingJobsSuccess = true
        state.printingJobs = action.payload.data
        state.printingJobsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
        state.printingJobsError = null
      })
      .addCase(fetchPrintingJobs.rejected, (state, action) => {
        state.printingJobsLoading = false
        state.printingJobsError = (action.payload as string) || "Failed to fetch printing jobs"
        state.printingJobsSuccess = false
        state.printingJobs = []
        state.printingJobsPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Mark as Ready to Print cases
      .addCase(markAsReadyToPrint.pending, (state) => {
        state.markAsReadyToPrintLoading = true
        state.markAsReadyToPrintError = null
        state.markAsReadyToPrintSuccess = false
        state.markAsReadyToPrintMessage = null
        state.markAsReadyToPrintData = null
      })
      .addCase(markAsReadyToPrint.fulfilled, (state, action: PayloadAction<MarkAsReadyToPrintResponse>) => {
        state.markAsReadyToPrintLoading = false
        state.markAsReadyToPrintSuccess = true
        state.markAsReadyToPrintMessage = action.payload.message
        state.markAsReadyToPrintData = action.payload.data
      })
      .addCase(markAsReadyToPrint.rejected, (state, action) => {
        state.markAsReadyToPrintLoading = false
        state.markAsReadyToPrintError = (action.payload as string) || "Failed to mark bills as ready to print"
        state.markAsReadyToPrintSuccess = false
        state.markAsReadyToPrintMessage = null
        state.markAsReadyToPrintData = null
      })
      // Single Billing Print cases
      .addCase(singleBillingPrint.pending, (state) => {
        state.singleBillingPrintLoading = true
        state.singleBillingPrintError = null
        state.singleBillingPrintSuccess = false
        state.singleBillingPrintMessage = null
        state.singleBillingPrintData = null
      })
      .addCase(singleBillingPrint.fulfilled, (state, action: PayloadAction<SingleBillingPrintResponse>) => {
        state.singleBillingPrintLoading = false
        state.singleBillingPrintSuccess = true
        state.singleBillingPrintMessage = action.payload.message
        state.singleBillingPrintData = action.payload.data
      })
      .addCase(singleBillingPrint.rejected, (state, action) => {
        state.singleBillingPrintLoading = false
        state.singleBillingPrintError = (action.payload as string) || "Failed to queue single billing print job"
        state.singleBillingPrintSuccess = false
        state.singleBillingPrintMessage = null
        state.singleBillingPrintData = null
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
  clearFinalizeSingleBillStatus,
  clearAdjustmentsStatus,
  clearVendorSummaryReportStatus,
  clearDownloadARStatus,
  clearPrintingJobsStatus,
  clearMarkAsReadyToPrintStatus,
  clearSingleBillingPrintStatus,
  resetBillingState,
  setPagination,
  setBillingJobsPagination,
  setChangeRequestsPagination,
  setChangeRequestsByBillingJobPagination,
  setAdjustmentsPagination,
  setPrintingJobsPagination,
  setFilters,
  setBillingJobsFilters,
  clearFilters,
  clearBillingJobsFilters,
} = postpaidSlice.actions

export default postpaidSlice.reducer
