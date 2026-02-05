// src/lib/redux/metersSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import { CustomerMeterTariff } from "./customersDashboardSlice"

// Type alias for Tariff to maintain compatibility
type Tariff = CustomerMeterTariff

// Interface for Meter
export interface Meter {
  tariff: any
  id: number
  customerId: number
  customerAccountNumber: string
  customerFullName: string
  meterIsPPM: boolean
  drn: string
  sgc: number
  krn: string
  ti: number
  ea: number
  tct: number
  ken: number
  mfrCode: number
  installationDate: string
  meterID: string
  meterAddedBy: string
  meterEditedBy: string
  meterDateCreated: string
  meterTypeId: string
  meterType: number
  meterBrand: string
  meterCategory: string
  isMeterActive: boolean
  status: number
  state: number
  sealNumber: string
  tariffRate: number
  tariffIndex: string
  serviceBand: number
  customerClass: string
  injectionSubstationId: number
  locationState: string
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
  latitude: number
  longitude: number
  tenantFullName: string
  tenantPhoneNumber: string
  phaseType?: string
}

// Interface for Meter Detail Response Data
export interface MeterDetailData {
  phaseType: string | undefined
  id: number
  customerId: number
  customerAccountNumber: string
  customerFullName: string
  serialNumber: string
  meterIsPPM: boolean
  drn: string
  sgc: number
  krn: string
  ti: number
  ea: number
  tct: number
  ken: number
  mfrCode: number
  installationDate: string
  meterID: string
  meterAddedBy: string
  meterEditedBy: string
  meterDateCreated: string
  meterTypeId: string
  meterType: number
  isSmart: boolean
  meterBrand: string
  meterCategory: string
  isMeterActive: boolean
  status: number
  meterState: number
  sealNumber: string
  poleNumber: string
  tariffRate: number
  tariffId: number
  tariffIndex: string
  serviceBand: number
  customerClass: string
  injectionSubstationId: number
  distributionSubstationId: number
  feederId: number
  areaOfficeId: number
  state: number
  locationState: string
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
  latitude: number
  longitude: number
  tenantFullName: string
  tenantPhoneNumber: string
  currentTariffOverride: any
  tariff?: Tariff
}

// Interface for Meter Detail Response
export interface MeterDetailResponse {
  isSuccess: boolean
  message: string
  data: MeterDetailData
}

// Interface for Meters Request Parameters
export interface MetersRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  customerId?: number
  meterIsPPM?: boolean
  isMeterActive?: boolean
  status?: number
  state?: number
  meterType?: number
  serviceBand?: number
  injectionSubstationId?: number
  drn?: string
  tenantPhoneNumber?: string
}

// Interface for Meters Response
export interface MetersResponse {
  isSuccess: boolean
  message: string
  data: Meter[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Interface for Meters State
export interface MetersState {
  meters: Meter[]
  loading: boolean
  error: string | null
  success: boolean
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  meterHistory: MeterHistoryEntry[]
  historyLoading: boolean
  historyError: string | null
  prepaidCreditHistory: PrepaidCreditHistoryEntry[]
  prepaidCreditHistoryLoading: boolean
  prepaidCreditHistoryError: string | null
  prepaidCreditHistoryPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  clearTamperHistory: ClearTamperHistoryEntry[]
  clearTamperHistoryLoading: boolean
  clearTamperHistoryError: string | null
  clearTamperHistoryPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  clearCreditHistory: ClearTamperHistoryEntry[]
  clearCreditHistoryLoading: boolean
  clearCreditHistoryError: string | null
  clearCreditHistoryPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  keyChangeHistory: ClearTamperHistoryEntry[]
  keyChangeHistoryLoading: boolean
  keyChangeHistoryError: string | null
  keyChangeHistoryPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  setControlHistory: ClearTamperHistoryEntry[]
  setControlHistoryLoading: boolean
  setControlHistoryError: string | null
  setControlHistoryPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  addKeyChangeData: TokenData | null
  addKeyChangeLoading: boolean
  addKeyChangeError: string | null
  clearTamperData: TokenData | null
  clearTamperLoading: boolean
  clearTamperError: string | null
  clearCreditData: TokenData | null
  clearCreditLoading: boolean
  clearCreditError: string | null
  setControlData: TokenData | null
  setControlLoading: boolean
  setControlError: string | null
  verifyTokenData: VerifyTokenResult | null
  verifyTokenLoading: boolean
  verifyTokenError: string | null
  verifyTokenHistory: VerifyTokenHistoryEntry[]
  verifyTokenHistoryLoading: boolean
  verifyTokenHistoryError: string | null
  verifyTokenHistoryPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  updatePhaseData: MeterDetailData | null
  updatePhaseLoading: boolean
  updatePhaseError: string | null
  changeTechnicalConfigData: MeterDetailData | null
  changeTechnicalConfigLoading: boolean
  changeTechnicalConfigError: string | null
  changeTariffData: MeterDetailData | null
  changeTariffLoading: boolean
  changeTariffError: string | null
  prepaidTransactions: PrepaidTransaction[]
  prepaidTransactionsLoading: boolean
  prepaidTransactionsError: string | null
  prepaidTransactionsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  failedPayments: FailedPayment[]
  failedPaymentsLoading: boolean
  failedPaymentsError: string | null
  failedPaymentsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  retryFailedPaymentLoading: boolean
  retryFailedPaymentError: string | null
  retryFailedPaymentSuccess: boolean
  retryFailedPaymentData: RetryFailedPaymentData | null
  summary: MetersSummaryData | null
  summaryLoading: boolean
  summaryError: string | null
  currentMeter: MeterDetailData | null
  meterLoading: boolean
  meterError: string | null
}

// Initial state
const initialState: MetersState = {
  meters: [],
  loading: false,
  error: null,
  success: false,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  meterHistory: [],
  historyLoading: false,
  historyError: null,
  prepaidCreditHistory: [],
  prepaidCreditHistoryLoading: false,
  prepaidCreditHistoryError: null,
  prepaidCreditHistoryPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  clearTamperHistory: [],
  clearTamperHistoryLoading: false,
  clearTamperHistoryError: null,
  clearTamperHistoryPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  clearCreditHistory: [],
  clearCreditHistoryLoading: false,
  clearCreditHistoryError: null,
  clearCreditHistoryPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  keyChangeHistory: [],
  keyChangeHistoryLoading: false,
  keyChangeHistoryError: null,
  keyChangeHistoryPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  setControlHistory: [],
  setControlHistoryLoading: false,
  setControlHistoryError: null,
  setControlHistoryPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  addKeyChangeData: null,
  addKeyChangeLoading: false,
  addKeyChangeError: null,
  clearTamperData: null,
  clearTamperLoading: false,
  clearTamperError: null,
  clearCreditData: null,
  clearCreditLoading: false,
  clearCreditError: null,
  setControlData: null,
  setControlLoading: false,
  setControlError: null,
  verifyTokenData: null,
  verifyTokenLoading: false,
  verifyTokenError: null,
  verifyTokenHistory: [],
  verifyTokenHistoryLoading: false,
  verifyTokenHistoryError: null,
  verifyTokenHistoryPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  updatePhaseData: null,
  updatePhaseLoading: false,
  updatePhaseError: null,
  changeTechnicalConfigData: null,
  changeTechnicalConfigLoading: false,
  changeTechnicalConfigError: null,
  changeTariffData: null,
  changeTariffLoading: false,
  changeTariffError: null,
  prepaidTransactions: [],
  prepaidTransactionsLoading: false,
  prepaidTransactionsError: null,
  prepaidTransactionsPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  failedPayments: [],
  failedPaymentsLoading: false,
  failedPaymentsError: null,
  failedPaymentsPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  retryFailedPaymentLoading: false,
  retryFailedPaymentError: null,
  retryFailedPaymentSuccess: false,
  retryFailedPaymentData: null,
  summary: null,
  summaryLoading: false,
  summaryError: null,
  currentMeter: null,
  meterLoading: false,
  meterError: null,
}

export interface EditMeterRequest {
  serialNumber: string
  drn: string
  sgc?: number
  krn: string
  ea: number
  tct: number
  ken: number
  mfrCode: number
  installationDate: string
  meterType: number
  isSmart: boolean
  meterBrand: string
  meterCategory: string
  isMeterActive: boolean
  status: number
  meterState: number
  sealNumber: string
  poleNumber: string
  tariffId: number
  state: number
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
  latitude: number
  longitude: number
  changeReason: string
}

// Interface for Update Meter Phase Request
export interface UpdateMeterPhaseRequest {
  phaseType: string
  changeReason: string
}

// Interface for Update Meter Phase Response
export interface UpdateMeterPhaseResponse {
  isSuccess: boolean
  message: string
  data: MeterDetailData
}

// Interface for Change Technical Config Request
export interface ChangeTechnicalConfigRequest {
  sgc: number
  krn: string
  tct: number
  ken: number
  mfrCode: number
  ea: number
  changeReason: string
}

// Interface for Change Technical Config Response
export interface ChangeTechnicalConfigResponse {
  isSuccess: boolean
  message: string
  data: MeterDetailData
}

// Interface for Change Tariff Request
export interface ChangeTariffRequest {
  ti: number
  changeReason: string
}

// Interface for Change Tariff Response
export interface ChangeTariffResponse {
  isSuccess: boolean
  message: string
  data: MeterDetailData
}

// Interface for Add Meter Request
export interface AddMeterRequest {
  customerId: number
  serialNumber: string
  drn: string
  sgc?: number
  krn: string
  ti?: number
  ea?: number
  tct?: number
  ken?: number
  mfrCode?: number
  installationDate: string
  meterType: number
  isSmart: boolean
  meterBrand: string
  meterCategory: string
  isMeterActive: boolean
  status: number
  meterState: number
  sealNumber: string
  poleNumber: string
  tariffId: number
  distributionSubstationId: number
  state: number
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
  latitude: number
  longitude: number
}

// Interface for Add Meter Response
export interface AddMeterResponse {
  isSuccess: boolean
  message: string
  data: Meter
}

// Interface for Replace Meter Request
export interface ReplaceMeterRequest {
  customerId: number
  oldMeterId: number
  serialNumber: string
  drn: string
  sgc?: number
  krn: string
  ti?: number
  ea?: number
  tct?: number
  ken?: number
  mfrCode?: number
  installationDate: string
  meterType: number
  isSmart: boolean
  meterBrand: string
  meterCategory: string
  isMeterActive: boolean
  status: number
  meterState: number
  sealNumber: string
  poleNumber: string
  tariffId: number
  distributionSubstationId: number
  state: number
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
  latitude: number
  longitude: number
}

// Interface for Meter History entry
export interface MeterHistoryEntry {
  id: number
  meterId: number
  userAccountId: number
  agentId: number
  vendorId: number
  changeType: string
  changedFields: string
  oldPayload: string
  newPayload: string
  reason: string
  changedAtUtc: string
}

// Interface for Meter History Response
export interface MeterHistoryResponse {
  isSuccess: boolean
  message: string
  data: MeterHistoryEntry[]
}

// Interface for Meters Summary Data
export interface MetersSummaryData {
  totalMeters: number
  activeMeters: number
  deactivatedMeters: number
  suspendedMeters: number
  retiredMeters: number
  prepaidMeters: number
  postpaidMeters: number
  smartMeters: number
  byStatus: Array<{
    value: number
    name: string
    count: number
  }>
  byState: Array<{
    value: number
    name: string
    count: number
  }>
  byType: Array<{
    value: number
    name: string
    count: number
  }>
  byServiceBand: Array<{
    value: number
    name: string
    count: number
  }>
}

// Interface for Meters Summary Response
export interface MetersSummaryResponse {
  isSuccess: boolean
  message: string
  data: MetersSummaryData
}

// Interface for Prepaid Credit History entry
export interface PrepaidCreditHistoryEntry {
  id: number
  meterId: number
  userAccountId: number
  agentId: number
  vendorId: number
  requestPayload: string
  responsePayload: string
  isSuccessful: boolean
  errorCode: string
  errorMessage: string
  requestedAtUtc: string
  paymentId: number
}

// Interface for Prepaid Credit History Response
export interface PrepaidCreditHistoryResponse {
  isSuccess: boolean
  message: string
  data: PrepaidCreditHistoryEntry[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Interface for Clear Tamper History entry
export interface ClearTamperHistoryEntry {
  id: number
  meterId: number
  userAccountId: number
  agentId: number
  vendorId: number
  requestPayload: string
  responsePayload: string
  isSuccessful: boolean
  errorCode: string
  errorMessage: string
  requestedAtUtc: string
}

// Interface for Clear Tamper History Response
export interface ClearTamperHistoryResponse {
  isSuccess: boolean
  message: string
  data: ClearTamperHistoryEntry[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Add Key Change interfaces
export interface AddKeyChangeRequest {
  toSgc: number
  toKrn: number
  toTi: number
}

export interface TokenConfig {
  idRecord: string
  record2: string
  rollover: boolean
  toKen: number
  toKrn: number
  toSgc: number
  toTi: number
  toVkKcv: string
}

export interface Token {
  description: string
  drn: string
  ea: number
  idSm: string
  isReservedTid: boolean
  krn: number
  newConfig: TokenConfig
  pan: string
  scaledAmount: string
  scaledUnitName: string
  sgc: number
  stsUnitName: string
  subclass: number
  tct: number
  ti: number
  tid: number
  tokenClass: number
  tokenDec: string
  tokenHex: string
  transferAmount: number
  vkKcv: string
}

export interface Advice {
  idRecord: string
  rollover: boolean
  toKen: number
  toKrn: number
  toSgc: number
  toTi: number
}

export interface TokenData {
  advice: Advice
  raw: string
  success: boolean
  tokens: Token[]
}

export interface AddKeyChangeResponse {
  isSuccess: boolean
  message: string
  data: {
    data: TokenData
    error: {
      code: string
      error: string
      success: boolean
    }
  }
}

// Clear Tamper interfaces
export interface ClearTamperResponse {
  isSuccess: boolean
  message: string
  data: {
    data: TokenData
    error: {
      code: string
      error: string
      success: boolean
    }
  }
}

export interface ClearCreditResponse {
  isSuccess: boolean
  message: string
  data: {
    data: TokenData
    error: {
      code: string
      error: string
      success: boolean
    }
  }
}

export interface SetControlRequest {
  isFlag: boolean
  index: number
  value: number
  tokenTime: number
  flags: number
}

export interface SetControlResponse {
  isSuccess: boolean
  message: string
  data: {
    data: TokenData
    error: {
      code: string
      error: string
      success: boolean
    }
  }
}

// Verify Token interfaces
export interface VerifyTokenRequest {
  tokenDec: string
}

export interface VerifyTokenResult {
  meterTestToken: string
  token: {
    description: string
    drn: string
    ea: number
    idSm: string
    isReservedTid: boolean
    krn: number
    newConfig: string
    pan: string
    scaledAmount: string
    scaledUnitName: string
    sgc: number
    stsUnitName: string
    subclass: number
    tct: number
    ti: number
    tid: number
    tokenClass: number
    tokenDec: string
    tokenHex: string
    transferAmount: number
    vkKcv: string
  }
  validationResult: string
}

export interface VerifyTokenResponse {
  isSuccess: boolean
  message: string
  data: {
    data: {
      result: VerifyTokenResult
      success: boolean
    }
    error: {
      code: string
      error: string
      success: boolean
    }
  }
}

// Interface for Failed Payment entry
export interface FailedPayment {
  requestId: string
  operation: number
  attemptCount: number
  maxAttempts: number
  lastAttemptAtUtc: string
  completedAtUtc: string
  drn: string
  paymentId: number
  paymentReference: string
  paymentChannel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque"
  paymentStatus: "Pending" | "Confirmed" | "Failed" | "Reversed"
  amount: number
  paidAtUtc: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  vendorId: number
  agentId: number
  errorCode: string
  errorMessage: string
  createdAt: string
  lastUpdated: string
}

// Interface for Failed Payment Request Parameters
export interface FailedPaymentParams {
  pageNumber: number
  pageSize: number
  paymentReference?: string
  meterNumber?: string
}

// Interface for Failed Payment Response
export interface FailedPaymentResponse {
  isSuccess: boolean
  message: string
  data: FailedPayment[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Interface for Token entry in retry response
export interface RetryToken {
  token: string
  tokenDec: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

// Interface for Receipt in retry response
export interface RetryReceipt {
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
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque"
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  tokens: RetryToken[]
  serviceCharge: number
  discountBonus: number
}

// Interface for Virtual Account in retry response
export interface RetryVirtualAccount {
  accountNumber: string
  bankName: string
  reference: string
  expiresAtUtc: string
}

// Interface for Payment Details in retry response
export interface RetryPaymentDetails {
  reference: string
  checkoutUrl: string
  virtualAccount: RetryVirtualAccount
}

// Interface for Collector in retry response
export interface RetryCollector {
  type: string
  name: string
  agentId: number
  agentCode: string
  agentType: "SalesRep" | "Agent" | "Vendor" | "Staff"
  vendorId: number
  vendorName: string
  staffName: string
  customerId: number
  customerName: string
}

// Interface for Token in retry response
export interface RetryTokenData {
  token: string
  tokenDec: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

// Interface for Retry Failed Payment Response Data
export interface RetryFailedPaymentData {
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
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque"
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  paymentTypeName: string
  receipt: RetryReceipt
  paymentDetails: RetryPaymentDetails
  collector: RetryCollector
  token: RetryTokenData
}

// Interface for Retry Failed Payment Response
export interface RetryFailedPaymentResponse {
  isSuccess: boolean
  message: string
  data: RetryFailedPaymentData
}

// Interface for Prepaid Transaction entry
export interface PrepaidTransaction {
  debtPayable: any
  electricityAmount: any
  units: any
  tariffRate: any
  id: number
  reference: string
  latitude: number
  longitude: number
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque"
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  collectorType: "Customer" | "SalesRep" | "Vendor" | "Staff"
  clearanceStatus: "Uncleared" | "Cleared" | "ClearedWithCondition"
  amount: number
  amountApplied: number
  vatAmount: number
  overPaymentAmount: number
  outstandingAfterPayment: number
  outstandingBeforePayment: number
  vendorCommissionRatePercent: number
  vendorCommissionAmount: number
  vendorDebitAmount: number
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
  isManualEntry: boolean
  isSystemGenerated: boolean
  evidenceFileUrl: string
  recoveryApplied: boolean
  recoveryAmount: number
  recoveryPolicyId: number
  recoveryPolicyName: string
  isCleared: boolean
  isRemitted: boolean
  customerIsPPM: boolean
  customerIsMD: boolean
  customerIsUrban: boolean
  customerProvinceId: number
  tokens: PrepaidTransactionToken[]
}

// Interface for Prepaid Transaction Token
export interface PrepaidTransactionToken {
  token: string
  tokenDec: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

// Interface for Prepaid Transaction Request Parameters
export interface PrepaidTransactionParams {
  pageNumber: number
  pageSize: number
  customerId?: number
  vendorId?: number
  agentId?: number
  areaOfficeId?: number
  distributionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
  postpaidBillId?: number
  paymentTypeId?: number
  prepaidOnly?: boolean
  channel?: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque"
  status?: "Pending" | "Confirmed" | "Failed" | "Reversed"
  collectorType?: "Customer" | "SalesRep" | "Vendor" | "Staff"
  clearanceStatus?: "Uncleared" | "Cleared" | "ClearedWithCondition"
  paidFromUtc?: string
  paidToUtc?: string
  search?: string
  isCleared?: boolean
  isRemitted?: boolean
  customerIsPPM?: boolean
  customerIsMD?: boolean
  customerIsUrban?: boolean
  customerProvinceId?: number
  isMeterActive?: boolean
}

// Interface for Prepaid Transaction Response
export interface PrepaidTransactionResponse {
  isSuccess: boolean
  message: string
  data: PrepaidTransaction[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Verify Token History interfaces
export interface VerifyTokenHistoryEntry {
  id: number
  meterId: number
  userAccountId: number
  agentId: number
  vendorId: number
  requestPayload: string
  responsePayload: string
  isSuccessful: boolean
  errorCode: string
  errorMessage: string
  requestedAtUtc: string
}

export interface VerifyTokenHistoryResponse {
  isSuccess: boolean
  message: string
  data: VerifyTokenHistoryEntry[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Async Thunk for fetching meters
export const fetchMeters = createAsyncThunk(
  "meters/fetchMeters",
  async (params: MetersRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        search,
        customerId,
        meterIsPPM,
        isMeterActive,
        status,
        state,
        meterType,
        serviceBand,
        injectionSubstationId,
        drn,
        tenantPhoneNumber,
      } = params

      const requestParams: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      }

      // Add optional parameters only if they are provided
      if (search !== undefined) requestParams.Search = search
      if (customerId !== undefined) requestParams.CustomerId = customerId
      if (meterIsPPM !== undefined) requestParams.MeterIsPPM = meterIsPPM
      if (isMeterActive !== undefined) requestParams.IsMeterActive = isMeterActive
      if (status !== undefined) requestParams.Status = status
      if (state !== undefined) requestParams.State = state
      if (meterType !== undefined) requestParams.MeterType = meterType
      if (serviceBand !== undefined) requestParams.ServiceBand = serviceBand
      if (injectionSubstationId !== undefined) requestParams.InjectionSubstationId = injectionSubstationId
      if (drn !== undefined) requestParams.Drn = drn
      if (tenantPhoneNumber !== undefined) requestParams.TenantPhoneNumber = tenantPhoneNumber

      const response = await api.get<MetersResponse>(buildApiUrl(API_ENDPOINTS.METERS.LIST_METERS), {
        params: requestParams,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch meters")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch meters")
      }
      return rejectWithValue(error.message || "Network error during meters fetch")
    }
  }
)

// Async Thunk for fetching meter detail
export const fetchMeterDetail = createAsyncThunk("meters/fetchMeterDetail", async (id: number, { rejectWithValue }) => {
  try {
    const endpoint = API_ENDPOINTS.METERS.METER_DETAIL.replace("{id}", id.toString())
    const response = await api.get<MeterDetailResponse>(buildApiUrl(endpoint))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch meter details")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch meter details")
    }
    return rejectWithValue(error.message || "Network error during meter details fetch")
  }
})

// Async Thunk for fetching meter history
export const fetchMeterHistory = createAsyncThunk(
  "meters/fetchMeterHistory",
  async (id: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.METER_HISTORY.replace("{id}", id.toString())
      const response = await api.get<MeterHistoryResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch meter history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch meter history")
      }
      return rejectWithValue(error.message || "Network error during meter history fetch")
    }
  }
)

// Async Thunk for editing a meter
export const editMeter = createAsyncThunk(
  "meters/editMeter",
  async ({ id, data }: { id: number; data: EditMeterRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.EDIT_METER.replace("{id}", id.toString())
      const response = await api.put(buildApiUrl(endpoint), data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to edit meter")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to edit meter")
      }
      return rejectWithValue(error.message || "Network error during meter edit")
    }
  }
)

// Async Thunk for adding a new meter
export const addMeter = createAsyncThunk("meters/addMeter", async (data: AddMeterRequest, { rejectWithValue }) => {
  try {
    const response = await api.post<AddMeterResponse>(buildApiUrl(API_ENDPOINTS.METERS.ADD_METER), data)

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to add meter")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to add meter")
    }
    return rejectWithValue(error.message || "Network error during meter addition")
  }
})

// Async Thunk for replacing a meter
export const replaceMeter = createAsyncThunk(
  "meters/replaceMeter",
  async (data: ReplaceMeterRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<AddMeterResponse>(buildApiUrl(API_ENDPOINTS.METERS.ADD_METER), data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to replace meter")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to replace meter")
      }
      return rejectWithValue(error.message || "Network error during meter replacement")
    }
  }
)

// Async Thunk for fetching meters summary
export const fetchMetersSummary = createAsyncThunk("meters/fetchMetersSummary", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<MetersSummaryResponse>(buildApiUrl(API_ENDPOINTS.METERS.SUMMARY))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch meters summary")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch meters summary")
    }
    return rejectWithValue(error.message || "Network error during meters summary fetch")
  }
})

// Async Thunk for fetching prepaid credit history
export const fetchPrepaidCreditHistory = createAsyncThunk(
  "meters/fetchPrepaidCreditHistory",
  async ({ id, pageNumber, pageSize }: { id: number; pageNumber: number; pageSize: number }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.PREPAID_CREDIT_HISTORY.replace("{id}", id.toString())
      const response = await api.get<PrepaidCreditHistoryResponse>(buildApiUrl(endpoint), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch prepaid credit history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch prepaid credit history")
      }
      return rejectWithValue(error.message || "Network error during prepaid credit history fetch")
    }
  }
)

// Async Thunk for fetching clear tamper history
export const fetchClearTamperHistory = createAsyncThunk(
  "meters/fetchClearTamperHistory",
  async ({ id, pageNumber, pageSize }: { id: number; pageNumber: number; pageSize: number }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.CLEAR_TAMPER_HISTORY.replace("{id}", id.toString())
      const response = await api.get<ClearTamperHistoryResponse>(buildApiUrl(endpoint), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch clear tamper history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch clear tamper history")
      }
      return rejectWithValue(error.message || "Network error during clear tamper history fetch")
    }
  }
)

// Async Thunk for fetching clear credit history
export const fetchClearCreditHistory = createAsyncThunk(
  "meters/fetchClearCreditHistory",
  async ({ id, pageNumber, pageSize }: { id: number; pageNumber: number; pageSize: number }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.CLEAR_CREDIT_HISTORY.replace("{id}", id.toString())
      const response = await api.get<ClearTamperHistoryResponse>(buildApiUrl(endpoint), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch clear credit history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch clear credit history")
      }
      return rejectWithValue(error.message || "Network error during clear credit history fetch")
    }
  }
)

// Async Thunk for fetching key change history
export const fetchKeyChangeHistory = createAsyncThunk(
  "meters/fetchKeyChangeHistory",
  async ({ id, pageNumber, pageSize }: { id: number; pageNumber: number; pageSize: number }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.KEY_CHANGE_HISTORY.replace("{id}", id.toString())
      const response = await api.get<ClearTamperHistoryResponse>(buildApiUrl(endpoint), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch key change history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch key change history")
      }
      return rejectWithValue(error.message || "Network error during key change history fetch")
    }
  }
)

// Async Thunk for fetching set control history
export const fetchSetControlHistory = createAsyncThunk(
  "meters/fetchSetControlHistory",
  async ({ id, pageNumber, pageSize }: { id: number; pageNumber: number; pageSize: number }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.SET_CONTROL_HISTORY.replace("{id}", id.toString())
      const response = await api.get<ClearTamperHistoryResponse>(buildApiUrl(endpoint), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch set control history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch set control history")
      }
      return rejectWithValue(error.message || "Network error during set control history fetch")
    }
  }
)

// Async Thunk for adding key change
export const addKeyChange = createAsyncThunk(
  "meters/addKeyChange",
  async ({ id, requestData }: { id: number; requestData: AddKeyChangeRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.ADD_KEY_CHANGE.replace("{id}", id.toString())
      const response = await api.post<AddKeyChangeResponse>(buildApiUrl(endpoint), requestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to add key change")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to add key change")
      }
      return rejectWithValue(error.message || "Network error during key change addition")
    }
  }
)

// Async Thunk for clearing tamper
export const clearTamper = createAsyncThunk("meters/clearTamper", async (id: number, { rejectWithValue }) => {
  try {
    const endpoint = API_ENDPOINTS.METERS.CLEAR_TAMPER.replace("{id}", id.toString())
    const response = await api.post<ClearTamperResponse>(buildApiUrl(endpoint))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to clear tamper")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to clear tamper")
    }
    return rejectWithValue(error.message || "Network error during tamper clear")
  }
})

export const clearCredit = createAsyncThunk("meters/clearCredit", async (id: number, { rejectWithValue }) => {
  try {
    const endpoint = API_ENDPOINTS.METERS.CLEAR_CREDIT.replace("{id}", id.toString())
    const response = await api.post<ClearCreditResponse>(buildApiUrl(endpoint))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to clear credit")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to clear credit")
    }
    return rejectWithValue(error.message || "Network error during credit clear")
  }
})

export const setControl = createAsyncThunk(
  "meters/setControl",
  async ({ id, controlData }: { id: number; controlData: SetControlRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.SET_CONTROL.replace("{id}", id.toString())
      const response = await api.post<SetControlResponse>(buildApiUrl(endpoint), controlData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to set control")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to set control")
      }
      return rejectWithValue(error.message || "Network error during control set")
    }
  }
)

// Async Thunk for verifying token
export const verifyToken = createAsyncThunk(
  "meters/verifyToken",
  async ({ id, requestData }: { id: number; requestData: VerifyTokenRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.VERIFY_TOKEN.replace("{id}", id.toString())
      const response = await api.post<VerifyTokenResponse>(buildApiUrl(endpoint), requestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to verify token")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to verify token")
      }
      return rejectWithValue(error.message || "Network error during token verification")
    }
  }
)

// Async Thunk for updating meter phase
export const updateMeterPhase = createAsyncThunk(
  "meters/updateMeterPhase",
  async ({ id, data }: { id: number; data: UpdateMeterPhaseRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.UPDATE_METER_PHASE.replace("{id}", id.toString())
      const response = await api.post<UpdateMeterPhaseResponse>(buildApiUrl(endpoint), data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update meter phase")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update meter phase")
      }
      return rejectWithValue(error.message || "Network error during meter phase update")
    }
  }
)

// Async Thunk for changing technical config
export const changeTechnicalConfig = createAsyncThunk(
  "meters/changeTechnicalConfig",
  async ({ id, data }: { id: number; data: ChangeTechnicalConfigRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.CHANGE_TECHNICAL_CONFIG.replace("{id}", id.toString())
      const response = await api.post<ChangeTechnicalConfigResponse>(buildApiUrl(endpoint), data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to change technical config")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to change technical config")
      }
      return rejectWithValue(error.message || "Network error during technical config change")
    }
  }
)

// Async Thunk for changing tariff
export const changeTariff = createAsyncThunk(
  "meters/changeTariff",
  async ({ id, data }: { id: number; data: ChangeTariffRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.CHANGE_TARIFF.replace("{id}", id.toString())
      const response = await api.post<ChangeTariffResponse>(buildApiUrl(endpoint), data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to change tariff")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to change tariff")
      }
      return rejectWithValue(error.message || "Network error during tariff change")
    }
  }
)

// Async Thunk for fetching prepaid transactions
export const fetchPrepaidTransactions = createAsyncThunk(
  "meters/fetchPrepaidTransactions",
  async (params: PrepaidTransactionParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        customerId,
        vendorId,
        agentId,
        areaOfficeId,
        distributionSubstationId,
        feederId,
        serviceCenterId,
        postpaidBillId,
        paymentTypeId,
        prepaidOnly,
        channel,
        status,
        collectorType,
        clearanceStatus,
        paidFromUtc,
        paidToUtc,
        search,
        isCleared,
        isRemitted,
        customerIsPPM,
        customerIsMD,
        customerIsUrban,
        customerProvinceId,
      } = params

      const requestParams: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      }

      // Add optional parameters only if they are provided
      if (customerId !== undefined) requestParams.CustomerId = customerId
      if (vendorId !== undefined) requestParams.VendorId = vendorId
      if (agentId !== undefined) requestParams.AgentId = agentId
      if (areaOfficeId !== undefined) requestParams.AreaOfficeId = areaOfficeId
      if (distributionSubstationId !== undefined) requestParams.DistributionSubstationId = distributionSubstationId
      if (feederId !== undefined) requestParams.FeederId = feederId
      if (serviceCenterId !== undefined) requestParams.ServiceCenterId = serviceCenterId
      if (postpaidBillId !== undefined) requestParams.PostpaidBillId = postpaidBillId
      if (paymentTypeId !== undefined) requestParams.PaymentTypeId = paymentTypeId
      if (prepaidOnly !== undefined) requestParams.PrepaidOnly = prepaidOnly
      if (channel !== undefined) requestParams.Channel = channel
      if (status !== undefined) requestParams.Status = status
      if (collectorType !== undefined) requestParams.CollectorType = collectorType
      if (clearanceStatus !== undefined) requestParams.ClearanceStatus = clearanceStatus
      if (paidFromUtc !== undefined) requestParams.PaidFromUtc = paidFromUtc
      if (paidToUtc !== undefined) requestParams.PaidToUtc = paidToUtc
      if (search !== undefined) requestParams.Search = search
      if (isCleared !== undefined) requestParams.IsCleared = isCleared
      if (isRemitted !== undefined) requestParams.IsRemitted = isRemitted
      if (customerIsPPM !== undefined) requestParams.CustomerIsPPM = customerIsPPM
      if (customerIsMD !== undefined) requestParams.CustomerIsMD = customerIsMD
      if (customerIsUrban !== undefined) requestParams.CustomerIsUrban = customerIsUrban
      if (customerProvinceId !== undefined) requestParams.CustomerProvinceId = customerProvinceId

      const response = await api.get<PrepaidTransactionResponse>(
        buildApiUrl(API_ENDPOINTS.METER_READINGS.PREPAID_TRANSACTION),
        {
          params: requestParams,
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch prepaid transactions")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch prepaid transactions")
      }
      return rejectWithValue(error.message || "Network error during prepaid transactions fetch")
    }
  }
)

// Async Thunk for fetching failed payments
export const fetchFailedPayments = createAsyncThunk(
  "meters/fetchFailedPayments",
  async (params: FailedPaymentParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, paymentReference, meterNumber } = params

      const requestParams: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      }

      // Add optional parameters only if they are provided
      if (paymentReference !== undefined) requestParams.PaymentReference = paymentReference
      if (meterNumber !== undefined) requestParams.MeterNumber = meterNumber

      const response = await api.get<FailedPaymentResponse>(buildApiUrl(API_ENDPOINTS.METER_READINGS.FAILED_PAYMENTS), {
        params: requestParams,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch failed payments")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch failed payments")
      }
      return rejectWithValue(error.message || "Network error during failed payments fetch")
    }
  }
)

// Async Thunk for fetching verify token history
export const fetchVerifyTokenHistory = createAsyncThunk(
  "meters/fetchVerifyTokenHistory",
  async ({ id, pageNumber, pageSize }: { id: number; pageNumber: number; pageSize: number }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.VERIFY_TOKEN_HISTORY.replace("{id}", id.toString())
      const response = await api.get<VerifyTokenHistoryResponse>(buildApiUrl(endpoint), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch verify token history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch verify token history")
      }
      return rejectWithValue(error.message || "Network error during verify token history fetch")
    }
  }
)

// Async Thunk for retrying failed payment
export const retryFailedPayment = createAsyncThunk(
  "meters/retryFailedPayment",
  async (paymentId: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METER_READINGS.RETRY_FAILED_PAYMENTS.replace("{paymentId}", paymentId.toString())
      const response = await api.post<RetryFailedPaymentResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to retry payment")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to retry payment")
      }
      return rejectWithValue(error.message || "Network error during payment retry")
    }
  }
)

// Create slice
const metersSlice = createSlice({
  name: "meters",
  initialState,
  reducers: {
    // Clear meters state
    clearMeters: (state) => {
      state.meters = []
      state.error = null
      state.success = false
      state.loading = false
      state.pagination = initialState.pagination
      state.currentMeter = null
      state.meterError = null
    },
    // Clear error
    clearMetersError: (state) => {
      state.error = null
      state.meterError = null
      state.success = false
    },
    // Clear current meter
    clearCurrentMeter: (state) => {
      state.currentMeter = null
      state.meterError = null
      state.meterLoading = false
    },
    // Clear prepaid credit history
    clearPrepaidCreditHistory: (state) => {
      state.prepaidCreditHistory = []
      state.prepaidCreditHistoryError = null
      state.prepaidCreditHistoryLoading = false
      state.prepaidCreditHistoryPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
    },
    // Clear clear tamper history
    clearClearTamperHistory: (state) => {
      state.clearTamperHistory = []
      state.clearTamperHistoryError = null
      state.clearTamperHistoryLoading = false
      state.clearTamperHistoryPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
    },
    // Clear clear credit history
    clearClearCreditHistory: (state) => {
      state.clearCreditHistory = []
      state.clearCreditHistoryError = null
      state.clearCreditHistoryLoading = false
      state.clearCreditHistoryPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
    },
    // Clear key change history
    clearKeyChangeHistory: (state) => {
      state.keyChangeHistory = []
      state.keyChangeHistoryError = null
      state.keyChangeHistoryLoading = false
      state.keyChangeHistoryPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
    },
    // Clear set control history
    clearSetControlHistory: (state) => {
      state.setControlHistory = []
      state.setControlHistoryError = null
      state.setControlHistoryLoading = false
      state.setControlHistoryPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
    },
    // Clear add key change data
    clearAddKeyChange: (state) => {
      state.addKeyChangeData = null
      state.addKeyChangeError = null
      state.addKeyChangeLoading = false
    },
    // Clear tamper data
    clearTamperData: (state) => {
      state.clearTamperData = null
      state.clearTamperError = null
      state.clearTamperLoading = false
    },
    // Clear verify token data
    clearVerifyToken: (state) => {
      state.verifyTokenData = null
      state.verifyTokenError = null
      state.verifyTokenLoading = false
    },
    // Clear verify token history
    clearVerifyTokenHistory: (state) => {
      state.verifyTokenHistory = []
      state.verifyTokenHistoryError = null
      state.verifyTokenHistoryLoading = false
      state.verifyTokenHistoryPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
    },
    // Clear update phase data
    clearUpdatePhase: (state) => {
      state.updatePhaseData = null
      state.updatePhaseError = null
      state.updatePhaseLoading = false
    },
    // Clear change technical config data
    clearChangeTechnicalConfig: (state) => {
      state.changeTechnicalConfigData = null
      state.changeTechnicalConfigError = null
      state.changeTechnicalConfigLoading = false
    },
    // Clear change tariff data
    clearChangeTariff: (state) => {
      state.changeTariffData = null
      state.changeTariffError = null
      state.changeTariffLoading = false
    },
    // Clear prepaid transactions
    clearPrepaidTransactions: (state) => {
      state.prepaidTransactions = []
      state.prepaidTransactionsError = null
      state.prepaidTransactionsLoading = false
      state.prepaidTransactionsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,
        hasNext: false,
        hasPrevious: false,
      }
    },
    // Clear failed payments
    clearFailedPayments: (state) => {
      state.failedPayments = []
      state.failedPaymentsError = null
      state.failedPaymentsLoading = false
      state.failedPaymentsPagination = initialState.failedPaymentsPagination
    },
    // Clear retry failed payment state
    clearRetryFailedPayment: (state) => {
      state.retryFailedPaymentLoading = false
      state.retryFailedPaymentError = null
      state.retryFailedPaymentSuccess = false
      state.retryFailedPaymentData = null
    },
  },
  extraReducers: (builder) => {
    // Fetch meters
    builder
      .addCase(fetchMeters.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchMeters.fulfilled, (state, action: PayloadAction<MetersResponse>) => {
        state.loading = false
        state.success = true
        state.meters = action.payload.data
        state.pagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchMeters.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
      // Fetch meter detail
      .addCase(fetchMeterDetail.pending, (state) => {
        state.meterLoading = true
        state.meterError = null
      })
      .addCase(fetchMeterDetail.fulfilled, (state, action: PayloadAction<MeterDetailResponse>) => {
        state.meterLoading = false
        state.currentMeter = action.payload.data
      })
      .addCase(fetchMeterDetail.rejected, (state, action) => {
        state.meterLoading = false
        state.meterError = action.payload as string
      })
      // Edit meter
      .addCase(editMeter.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(editMeter.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        // Update the meter in the meters array if it exists
        const index = state.meters.findIndex((meter) => meter.id === action.meta.arg.id)
        if (index !== -1) {
          const updateData = action.meta.arg.data
          // state.meters[index] = {
          //   ...state.meters[index],
          //   ...updateData,
          //   id: state.meters[index].id, // Ensure id is always preserved as a number
          //   customerId: state.meters[index].customerId, // Preserve customerId
          //   customerAccountNumber: state.meters[index].customerAccountNumber, // Preserve customerAccountNumber
          //   customerFullName: state.meters[index].customerFullName, // Preserve customerFullName
          // }
        }
        // Also update the currentMeter if it's the same meter
        if (state.currentMeter && state.currentMeter.id === action.meta.arg.id) {
          const updateData = action.meta.arg.data
          state.currentMeter = {
            ...state.currentMeter,
            ...updateData,
            id: state.currentMeter.id, // Ensure id is always preserved as a number
            customerId: state.currentMeter.customerId, // Preserve customerId
            customerAccountNumber: state.currentMeter.customerAccountNumber, // Preserve customerAccountNumber
            customerFullName: state.currentMeter.customerFullName, // Preserve customerFullName
            // Preserve fields that might not be in EditMeterRequest
            serialNumber: state.currentMeter.serialNumber,
            isSmart: state.currentMeter.isSmart,
            distributionSubstationId: state.currentMeter.distributionSubstationId,
            feederId: state.currentMeter.feederId,
            areaOfficeId: state.currentMeter.areaOfficeId,
            meterState: state.currentMeter.meterState,
          }
        }
      })
      .addCase(editMeter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
      // Fetch meter history
      .addCase(fetchMeterHistory.pending, (state) => {
        state.historyLoading = true
        state.historyError = null
      })
      .addCase(fetchMeterHistory.fulfilled, (state, action: PayloadAction<MeterHistoryResponse>) => {
        state.historyLoading = false
        state.meterHistory = action.payload.data
      })
      .addCase(fetchMeterHistory.rejected, (state, action) => {
        state.historyLoading = false
        state.historyError = action.payload as string
      })
      // Add meter
      .addCase(addMeter.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(addMeter.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        // Add the new meter to the meters array
        state.meters.unshift(action.payload.data)
      })
      .addCase(addMeter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
      // Replace meter
      .addCase(replaceMeter.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(replaceMeter.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        // Add the new meter to the meters array
        state.meters.unshift(action.payload.data)
      })
      .addCase(replaceMeter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
      // Fetch meters summary
      .addCase(fetchMetersSummary.pending, (state) => {
        state.summaryLoading = true
        state.summaryError = null
      })
      .addCase(fetchMetersSummary.fulfilled, (state, action: PayloadAction<MetersSummaryResponse>) => {
        state.summaryLoading = false
        state.summary = action.payload.data
      })
      .addCase(fetchMetersSummary.rejected, (state, action) => {
        state.summaryLoading = false
        state.summaryError = action.payload as string
      })
      // Fetch prepaid credit history
      .addCase(fetchPrepaidCreditHistory.pending, (state) => {
        state.prepaidCreditHistoryLoading = true
        state.prepaidCreditHistoryError = null
      })
      .addCase(fetchPrepaidCreditHistory.fulfilled, (state, action: PayloadAction<PrepaidCreditHistoryResponse>) => {
        state.prepaidCreditHistoryLoading = false
        state.prepaidCreditHistory = action.payload.data
        state.prepaidCreditHistoryPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchPrepaidCreditHistory.rejected, (state, action) => {
        state.prepaidCreditHistoryLoading = false
        state.prepaidCreditHistoryError = action.payload as string
      })
      // Fetch clear tamper history
      .addCase(fetchClearTamperHistory.pending, (state) => {
        state.clearTamperHistoryLoading = true
        state.clearTamperHistoryError = null
      })
      .addCase(fetchClearTamperHistory.fulfilled, (state, action: PayloadAction<ClearTamperHistoryResponse>) => {
        state.clearTamperHistoryLoading = false
        state.clearTamperHistory = action.payload.data
        state.clearTamperHistoryPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchClearTamperHistory.rejected, (state, action) => {
        state.clearTamperHistoryLoading = false
        state.clearTamperHistoryError = action.payload as string
      })
      // Fetch clear credit history
      .addCase(fetchClearCreditHistory.pending, (state) => {
        state.clearCreditHistoryLoading = true
        state.clearCreditHistoryError = null
      })
      .addCase(fetchClearCreditHistory.fulfilled, (state, action: PayloadAction<ClearTamperHistoryResponse>) => {
        state.clearCreditHistoryLoading = false
        state.clearCreditHistory = action.payload.data
        state.clearCreditHistoryPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchClearCreditHistory.rejected, (state, action) => {
        state.clearCreditHistoryLoading = false
        state.clearCreditHistoryError = action.payload as string
      })
      // Fetch key change history
      .addCase(fetchKeyChangeHistory.pending, (state) => {
        state.keyChangeHistoryLoading = true
        state.keyChangeHistoryError = null
      })
      .addCase(fetchKeyChangeHistory.fulfilled, (state, action: PayloadAction<ClearTamperHistoryResponse>) => {
        state.keyChangeHistoryLoading = false
        state.keyChangeHistory = action.payload.data
        state.keyChangeHistoryPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchKeyChangeHistory.rejected, (state, action) => {
        state.keyChangeHistoryLoading = false
        state.keyChangeHistoryError = action.payload as string
      })
      // Fetch set control history
      .addCase(fetchSetControlHistory.pending, (state) => {
        state.setControlHistoryLoading = true
        state.setControlHistoryError = null
      })
      .addCase(fetchSetControlHistory.fulfilled, (state, action: PayloadAction<ClearTamperHistoryResponse>) => {
        state.setControlHistoryLoading = false
        state.setControlHistory = action.payload.data
        state.setControlHistoryPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchSetControlHistory.rejected, (state, action) => {
        state.setControlHistoryLoading = false
        state.setControlHistoryError = action.payload as string
      })
      // Add key change
      .addCase(addKeyChange.pending, (state) => {
        state.addKeyChangeLoading = true
        state.addKeyChangeError = null
      })
      .addCase(addKeyChange.fulfilled, (state, action: PayloadAction<AddKeyChangeResponse>) => {
        state.addKeyChangeLoading = false
        state.addKeyChangeData = action.payload.data.data
      })
      .addCase(addKeyChange.rejected, (state, action) => {
        state.addKeyChangeLoading = false
        state.addKeyChangeError = action.payload as string
      })
      // Clear tamper
      .addCase(clearTamper.pending, (state) => {
        state.clearTamperLoading = true
        state.clearTamperError = null
      })
      .addCase(clearTamper.fulfilled, (state, action: PayloadAction<ClearTamperResponse>) => {
        state.clearTamperLoading = false
        state.clearTamperData = action.payload.data.data
      })
      .addCase(clearTamper.rejected, (state, action) => {
        state.clearTamperLoading = false
        state.clearTamperError = action.payload as string
      })
      .addCase(clearCredit.pending, (state) => {
        state.clearCreditLoading = true
        state.clearCreditError = null
      })
      .addCase(clearCredit.fulfilled, (state, action: PayloadAction<ClearCreditResponse>) => {
        state.clearCreditLoading = false
        state.clearCreditData = action.payload.data.data
      })
      .addCase(clearCredit.rejected, (state, action) => {
        state.clearCreditLoading = false
        state.clearCreditError = action.payload as string
      })
      .addCase(setControl.pending, (state) => {
        state.setControlLoading = true
        state.setControlError = null
      })
      .addCase(setControl.fulfilled, (state, action: PayloadAction<SetControlResponse>) => {
        state.setControlLoading = false
        state.setControlData = action.payload.data.data
      })
      .addCase(setControl.rejected, (state, action) => {
        state.setControlLoading = false
        state.setControlError = action.payload as string
      })
      // Verify token
      .addCase(verifyToken.pending, (state) => {
        state.verifyTokenLoading = true
        state.verifyTokenError = null
      })
      .addCase(verifyToken.fulfilled, (state, action: PayloadAction<VerifyTokenResponse>) => {
        state.verifyTokenLoading = false
        state.verifyTokenData = action.payload.data.data.result
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.verifyTokenLoading = false
        state.verifyTokenError = action.payload as string
      })
      // Fetch verify token history
      .addCase(fetchVerifyTokenHistory.pending, (state) => {
        state.verifyTokenHistoryLoading = true
        state.verifyTokenHistoryError = null
      })
      .addCase(fetchVerifyTokenHistory.fulfilled, (state, action: PayloadAction<VerifyTokenHistoryResponse>) => {
        state.verifyTokenHistoryLoading = false
        state.verifyTokenHistory = action.payload.data
        state.verifyTokenHistoryPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchVerifyTokenHistory.rejected, (state, action) => {
        state.verifyTokenHistoryLoading = false
        state.verifyTokenHistoryError = action.payload as string
      })
      // Update meter phase
      .addCase(updateMeterPhase.pending, (state) => {
        state.updatePhaseLoading = true
        state.updatePhaseError = null
      })
      .addCase(
        updateMeterPhase.fulfilled,
        (
          state,
          action: PayloadAction<
            UpdateMeterPhaseResponse,
            string,
            { arg: { id: number; data: UpdateMeterPhaseRequest } }
          >
        ) => {
          state.updatePhaseLoading = false
          state.updatePhaseData = action.payload.data
          // Update the current meter if it's the same meter
          if (state.currentMeter && state.currentMeter.id === action.meta.arg.id) {
            state.currentMeter = {
              ...state.currentMeter,
              phaseType: action.payload.data.phaseType,
            }
          }
          // Update the meter in the meters array if it exists
          const index = state.meters.findIndex((meter) => meter.id === action.meta.arg.id)
          if (index !== -1) {
            state.meters[index] = {
              ...state.meters[index],
              phaseType: action.payload.data.phaseType,
            } as Meter
          }
        }
      )
      .addCase(updateMeterPhase.rejected, (state, action) => {
        state.updatePhaseLoading = false
        state.updatePhaseError = action.payload as string
      })
      // Change technical config
      .addCase(changeTechnicalConfig.pending, (state) => {
        state.changeTechnicalConfigLoading = true
        state.changeTechnicalConfigError = null
      })
      .addCase(
        changeTechnicalConfig.fulfilled,
        (
          state,
          action: PayloadAction<
            ChangeTechnicalConfigResponse,
            string,
            { arg: { id: number; data: ChangeTechnicalConfigRequest } }
          >
        ) => {
          state.changeTechnicalConfigLoading = false
          state.changeTechnicalConfigData = action.payload.data
          // Update the current meter if it's the same meter
          if (state.currentMeter && state.currentMeter.id === action.meta.arg.id) {
            state.currentMeter = {
              ...state.currentMeter,
              sgc: action.payload.data.sgc,
              krn: action.payload.data.krn,
              tct: action.payload.data.tct,
              ken: action.payload.data.ken,
              mfrCode: action.payload.data.mfrCode,
              ea: action.payload.data.ea,
            }
          }
          // Update the meter in the meters array if it exists
          const index = state.meters.findIndex((meter) => meter.id === action.meta.arg.id)
          if (index !== -1) {
            state.meters[index] = {
              ...state.meters[index],
              sgc: action.payload.data.sgc,
              krn: action.payload.data.krn,
              tct: action.payload.data.tct,
              ken: action.payload.data.ken,
              mfrCode: action.payload.data.mfrCode,
              ea: action.payload.data.ea,
            } as Meter
          }
        }
      )
      .addCase(changeTechnicalConfig.rejected, (state, action) => {
        state.changeTechnicalConfigLoading = false
        state.changeTechnicalConfigError = action.payload as string
      })
      // Change tariff
      .addCase(changeTariff.pending, (state) => {
        state.changeTariffLoading = true
        state.changeTariffError = null
      })
      .addCase(
        changeTariff.fulfilled,
        (
          state,
          action: PayloadAction<ChangeTariffResponse, string, { arg: { id: number; data: ChangeTariffRequest } }>
        ) => {
          state.changeTariffLoading = false
          state.changeTariffData = action.payload.data
          // Update the current meter if it's the same meter
          if (state.currentMeter && state.currentMeter.id === action.meta.arg.id) {
            state.currentMeter = {
              ...state.currentMeter,
              ti: action.payload.data.ti,
              tariffRate: action.payload.data.tariffRate,
              tariffId: action.payload.data.tariffId,
              tariff: action.payload.data.tariff,
            }
          }
          // Update the meter in the meters array if it exists
          const index = state.meters.findIndex((meter) => meter.id === action.meta.arg.id)
          if (index !== -1) {
            state.meters[index] = {
              ...state.meters[index],
              ti: action.payload.data.ti,
              tariffRate: action.payload.data.tariffRate,
            } as Meter
          }
        }
      )
      .addCase(changeTariff.rejected, (state, action) => {
        state.changeTariffLoading = false
        state.changeTariffError = action.payload as string
      })
      // Fetch prepaid transactions
      .addCase(fetchPrepaidTransactions.pending, (state) => {
        state.prepaidTransactionsLoading = true
        state.prepaidTransactionsError = null
      })
      .addCase(fetchPrepaidTransactions.fulfilled, (state, action: PayloadAction<PrepaidTransactionResponse>) => {
        state.prepaidTransactionsLoading = false
        state.prepaidTransactions = action.payload.data
        state.prepaidTransactionsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchPrepaidTransactions.rejected, (state, action) => {
        state.prepaidTransactionsLoading = false
        state.prepaidTransactionsError = action.payload as string
      })
      // Fetch failed payments
      .addCase(fetchFailedPayments.pending, (state) => {
        state.failedPaymentsLoading = true
        state.failedPaymentsError = null
      })
      .addCase(fetchFailedPayments.fulfilled, (state, action: PayloadAction<FailedPaymentResponse>) => {
        state.failedPaymentsLoading = false
        state.failedPayments = action.payload.data
        state.failedPaymentsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchFailedPayments.rejected, (state, action) => {
        state.failedPaymentsLoading = false
        state.failedPaymentsError = action.payload as string
      })
      // Retry failed payment
      .addCase(retryFailedPayment.pending, (state) => {
        state.retryFailedPaymentLoading = true
        state.retryFailedPaymentError = null
        state.retryFailedPaymentSuccess = false
      })
      .addCase(retryFailedPayment.fulfilled, (state, action: PayloadAction<RetryFailedPaymentResponse>) => {
        state.retryFailedPaymentLoading = false
        state.retryFailedPaymentSuccess = true
        state.retryFailedPaymentData = action.payload.data
      })
      .addCase(retryFailedPayment.rejected, (state, action) => {
        state.retryFailedPaymentLoading = false
        state.retryFailedPaymentError = action.payload as string
        state.retryFailedPaymentSuccess = false
      })
  },
})

export const {
  clearMeters,
  clearMetersError,
  clearCurrentMeter,
  clearPrepaidCreditHistory,
  clearClearTamperHistory,
  clearClearCreditHistory,
  clearKeyChangeHistory,
  clearSetControlHistory,
  clearAddKeyChange,
  clearTamperData,
  clearVerifyToken,
  clearVerifyTokenHistory,
  clearUpdatePhase,
  clearChangeTechnicalConfig,
  clearChangeTariff,
  clearPrepaidTransactions,
  clearFailedPayments,
  clearRetryFailedPayment,
} = metersSlice.actions
export default metersSlice.reducer
