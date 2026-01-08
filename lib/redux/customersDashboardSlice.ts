import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import type { RootState } from "./store"

// Define the structure of the stored customer auth state
interface StoredCustomerAuthState {
  tokens?: {
    accessToken?: string
    refreshToken?: string
    accessTokenExpiresAt?: string
    refreshTokenExpiresAt?: string
  }
  customer?: any
  isAuthenticated?: boolean
}

// Create customer-specific API instance with interceptors
const customerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://sandbox-api.blumenos.com",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to inject customer token from localStorage
customerApi.interceptors.request.use(
  (config) => {
    try {
      const storedCustomerAuth = localStorage.getItem("customerAuthState")
      if (storedCustomerAuth) {
        const customerAuthState: StoredCustomerAuthState = JSON.parse(storedCustomerAuth) as StoredCustomerAuthState
        if (customerAuthState?.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${customerAuthState.tokens.accessToken}`
        }
      }
    } catch (err) {
      console.warn("Failed to load customer auth state from localStorage", err)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token expiration (similar to authSlice)
customerApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const storedCustomerAuth = localStorage.getItem("customerAuthState")
        if (storedCustomerAuth) {
          const customerAuthState: StoredCustomerAuthState = JSON.parse(storedCustomerAuth) as StoredCustomerAuthState
          const refreshToken = customerAuthState?.tokens?.refreshToken

          if (refreshToken) {
            // Attempt to refresh the customer token
            const refreshResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://sandbox-api.blumenos.com"}/customers/auth/refresh`,
              { refreshToken }
            )

            if (refreshResponse.data.isSuccess) {
              // Update the stored tokens
              const updatedTokens = {
                accessToken: refreshResponse.data.data.accessToken,
                accessTokenExpiresAt: refreshResponse.data.data.accessTokenExpiresAt,
                refreshToken: refreshResponse.data.data.refreshToken,
                refreshTokenExpiresAt: refreshResponse.data.data.refreshTokenExpiresAt,
              }

              const updatedState: StoredCustomerAuthState = {
                ...customerAuthState,
                tokens: updatedTokens,
              }

              localStorage.setItem("customerAuthState", JSON.stringify(updatedState))

              // Update the authorization header and retry the original request
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`
              return customerApi(originalRequest)
            }
          }
        }
      } catch (refreshError) {
        console.error("Customer token refresh failed:", refreshError)
        // Clear auth state on refresh failure
        localStorage.removeItem("customerAuthState")
        // You might want to dispatch a logout action here or redirect to login
      }
    }

    return Promise.reject(error)
  }
)

// Interfaces
interface PaymentByChannel {
  key: string
  count: number
  amount: number
}

interface PaymentByCollector {
  key: string
  count: number
  amount: number
}

interface PaymentByStatus {
  key: string
  count: number
  amount: number
}

interface PaymentByType {
  key: string
  count: number
  amount: number
}

interface PaymentWindow {
  window: string
  count: number
  amount: number
  byChannel: PaymentByChannel[]
  byCollector: PaymentByCollector[]
  byStatus: PaymentByStatus[]
  byPaymentType: PaymentByType[]
}

interface PaymentsSummaryData {
  windows: PaymentWindow[]
}

interface PaymentsSummaryResponse {
  isSuccess: boolean
  message: string
  data: PaymentsSummaryData
}

// Virtual Account Interface
interface VirtualAccount {
  accountNumber: string
  bankName: string
  reference: string
  expiresAtUtc: string
}

// Payment Token Interface
interface PaymentToken {
  token: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

// Customer Lookup Response Interface
interface CustomerLookupData {
  id: number
  customerNumber: number
  accountNumber: string
  fullName: string
  phoneNumber: string
  email: string
  address: string
  addressTwo: string
  city: string
  serviceCenterId: number
  serviceCenterName: string
  tariffRate: number
  tariffId: number
  isPPM: boolean
  isMeteredPostpaid: boolean
  customerOutstandingDebtBalance: number
  meters: Array<{
    id: number
    customerId: number
    customerAccountNumber: string
    customerFullName: string
    serialNumber: string
    drn: string
    tariffRate: number
    tariffId: number
    isMeterActive: boolean
    meterBrand: string
    meterCategory: string
    address: string
    city: string
  }>
}

interface CustomerLookupResponse {
  isSuccess: boolean
  message: string
  data: CustomerLookupData
}

// Vend Token Interface (updated with meterNumber)
export interface VendToken {
  token: string
  amount: string
  unit: string
  description: string
  meterNumber: string
}

// Vend Response Data Interface
interface VendResponseData {
  id: number
  reference: string
  amount: number
  currency: string
  channel: string
  status: string
  checkoutUrl: string
  virtualAccount: VirtualAccount
  tokens: VendToken[]
}

interface VendResponse {
  isSuccess: boolean
  message: string
  data: VendResponseData
}

// Get Token Response Data Interface
interface GetTokenResponseData {
  id: number
  reference: string
  amount: number
  currency: string
  channel: string
  status: string
  tokens: VendToken[]
  recoveryApplied: boolean
  recoveryAmount: number
  recoveryPolicyId: number
  recoveryPolicyName: string
}

interface GetTokenResponse {
  isSuccess: boolean
  message: string
  data: GetTokenResponseData
}

// Payment Item Interface (for list)
interface PaymentItem {
  id: number
  reference: string
  latitude: number
  longitude: number
  channel: string
  status: string
  collectorType: string
  amount: number
  amountApplied: number
  vatAmount: number
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
  isManualEntry: boolean
  isSystemGenerated: boolean
  evidenceFileUrl: string
  recoveryApplied: boolean
  recoveryAmount: number
  recoveryPolicyId: number
  recoveryPolicyName: string
  tokens: PaymentToken[]
}

// Payment Detail Interface (extends PaymentItem with additional fields)
interface PaymentDetail extends PaymentItem {
  narrative: string
  externalReference: string
  virtualAccount: VirtualAccount
  checkoutUrl: string
  vendorAccountId: string
  recordedByName: string
}

// Payments List Response Interface
interface PaymentsListResponse {
  isSuccess: boolean
  message: string
  data: PaymentItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Payment Detail Response Interface
interface PaymentDetailResponse {
  isSuccess: boolean
  message: string
  data: PaymentDetail
}

// Request Interfaces
interface GetPaymentsSummaryRequest {
  range: string
}

interface GetPaymentsListRequest {
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
  channel?: string
  status?: string
  collectorType?: string
  clearanceStatus?: string
  paidFromUtc?: string
  paidToUtc?: string
  search?: string
  isCleared?: boolean
  isRemitted?: boolean
  customerIsPPM?: boolean
  customerIsMD?: boolean
  customerIsUrban?: boolean
  customerProvinceId?: number
}

interface GetPaymentDetailRequest {
  id: number
}

// Customer Lookup Request Interface
interface CustomerLookupRequest {
  reference: string
  type: string
}

// Vend Request Interface
interface VendRequest {
  customerNumber: string
  amount: number
  channel: string
  type: string
  callbackUrl: string
}

// Get Token Request Interface
interface GetTokenRequest {
  reference: string
}

// Recent Outage Item Interface
interface RecentOutageItem {
  id: number
  referenceCode: string
  title: string
  priority: number
  status: number
  scope: number
  distributionSubstationId: number
  feederId: number
  distributionSubstationName: string
  feederName: string
  isCustomerGenerated: boolean
  affectedCustomerCount: number
  customerReportCount: number
  reportedAt: string
  durationHours: number
}

// Recent Outages Response Interface
interface RecentOutagesResponse {
  isSuccess: boolean
  message: string
  data: RecentOutageItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Recent Outages Request Interface
interface GetRecentOutagesRequest {
  pageNumber: number
  pageSize: number
  days?: number
}

// Report Outage Request Interface
interface ReportOutageRequest {
  reason: number
  additionalNotes: string
}

// Customer Meters Request Interface
interface GetCustomerMetersRequest {
  pageNumber: number
  pageSize: number
  search?: string
  customerId?: number
  meterIsPPM?: boolean
  isMeterActive?: boolean
  status?: number
  meterState?: number
  meterType?: number
  serviceBand?: number
  injectionSubstationId?: number
  distributionSubstationId?: number
  feederId?: number
  areaOfficeId?: number
  drn?: string
  tenantPhoneNumber?: string
  poleNumber?: string
}

// Customer Report Interface
interface CustomerReport {
  id: number
  customerId: number
  customerName: string
  reason: number
  reasonInfo: string
  additionalNotes: string
  reportedAt: string
}

// Report Outage Response Data Interface
interface ReportOutageResponseData {
  id: number
  referenceCode: string
  title: string
  priority: number
  status: number
  scope: number
  distributionSubstationId: number
  feederId: number
  distributionSubstationName: string
  feederName: string
  isCustomerGenerated: boolean
  affectedCustomerCount: number
  customerReportCount: number
  reportedAt: string
  durationHours: number
  details: string
  resolutionSummary: string
  restoredAt: string
  customerReports: CustomerReport[]
}

// Report Outage Response Interface
interface ReportOutageResponse {
  isSuccess: boolean
  message: string
  data: ReportOutageResponseData
}

// Customer Meter Tariff Interface
interface CustomerMeterTariff {
  id: number
  tariffIndex: string
  tariffCode: string
  name: string
  serviceBand: number
  tariffType: string
  tariffClass: string
  tariffRate: number
  currency: string
  unitOfMeasure: string
  fixedCharge: number
  minimumCharge: number
  description: string
  isActive: boolean
  isLocked: boolean
  effectiveFromUtc: string
  effectiveToUtc: string
  publishedAtUtc: string
  publishedBy: string
  version: string
  supersedesTariffGroupId: number
  sourceDocumentRef: string
}

// Customer Meter Interface
interface CustomerMeter {
  id: number
  customerId: number
  customerAccountNumber: string
  customerFullName: string
  serialNumber: string
  drn: string
  sgc: number
  krn: string
  ti: number
  ea: number
  tct: number
  ken: number
  mfrCode: number
  installationDate: string
  meterAddedBy: string
  meterEditedBy: string
  meterDateCreated: string
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
  tariff: CustomerMeterTariff
  injectionSubstationId: number
  distributionSubstationId: number
  feederId: number
  areaOfficeId: number
  state: number
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
  latitude: number
  longitude: number
  tenantFullName: string
  tenantPhoneNumber: string
}

// Customer Meters Response Interface
interface CustomerMetersResponse {
  isSuccess: boolean
  message: string
  data: CustomerMeter[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Payment Type Interface
interface PaymentType {
  id: number
  name: string
  description: string
  isActive: boolean
  supportRecoveryTrigger: boolean
  canSelfService: boolean
  isSystem: boolean
  isEnergyBill: boolean
  isDebtClearance: boolean
}

// Payment Types Response Interface
interface PaymentTypesResponse {
  isSuccess: boolean
  message: string
  data: PaymentType[]
}

// Make Payment Request Interface
interface MakePaymentRequest {
  paymentTypeId: number
  amount: number
  channel: string
}

// Get My Bills Request Interface
interface GetMyBillsRequest {
  pageNumber: number
  pageSize: number
  billingPeriodId?: number
  customerId?: number
  customerName?: string
  accountNumber?: string
  status?: number
  adjustmentStatus?: number
  category?: number
  areaOfficeId?: number
  feederId?: number
  distributionSubstationId?: number
  serviceCenterId?: number
  feederEnergyCapId?: number
  customerIsMD?: boolean
  customerIsUrban?: boolean
  customerProvinceId?: number
}

// Make Payment Response Token Interface
interface MakePaymentToken {
  token: string
  tokenDec: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

// Make Payment Response Virtual Account Interface
interface MakePaymentVirtualAccount {
  accountNumber: string
  bankName: string
  reference: string
  expiresAtUtc: string
}

// Make Payment Response Data Interface
interface MakePaymentResponseData {
  id: number
  reference: string
  latitude: number
  longitude: number
  channel: string
  status: string
  collectorType: string
  amount: number
  amountApplied: number
  vatAmount: number
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
  isManualEntry: boolean
  isSystemGenerated: boolean
  evidenceFileUrl: string
  recoveryApplied: boolean
  recoveryAmount: number
  recoveryPolicyId: number
  recoveryPolicyName: string
  tokens: MakePaymentToken[]
  narrative: string
  externalReference: string
  virtualAccount: MakePaymentVirtualAccount
  checkoutUrl: string
  vendorAccountId: string
  recordedByName: string
}

// Make Payment Response Interface
interface MakePaymentResponse {
  isSuccess: boolean
  message: string
  data: MakePaymentResponseData
}

// Bill Interfaces
interface BillingPeriod {
  id: number
  year: number
  month: number
  periodKey: string
  displayName: string
  status: number
  latestGeneratedBillHistory: {
    id: number
    billingPeriodId: number
    generatedBillCount: number
    finalizedBillCount: number
    generatedAtUtc: string
  }
  createdAt: string
  lastUpdated: string
}

interface ActiveDispute {
  id: number
  status: number
  reason: string
  raisedAtUtc: string
}

interface LedgerEntry {
  id: number
  type: number
  amount: number
  code: string
  memo: string
  effectiveAtUtc: string
  referenceId: number
}

interface BillItem {
  id: number
  name: string
  period: string
  billingPeriodId: number
  billingPeriod: BillingPeriod
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
  customer: any
  createdAt: string
  lastUpdated: string
  ledgerEntries: LedgerEntry[]
}

interface MyBillsResponse {
  isSuccess: boolean
  message: string
  data: BillItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Bill details interface matching API response
interface BillDetails {
  id: number
  name: string
  period: string
  billingPeriodId: number
  billingPeriod: {
    id: number
    year: number
    month: number
    periodKey: string
    displayName: string
    status: number
    latestGeneratedBillHistory: {
      id: number
      billingPeriodId: number
      generatedBillCount: number
      finalizedBillCount: number
      generatedAtUtc: string
    }
    createdAt: string
    lastUpdated: string
  }
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
  activeDispute: {
    id: number
    status: number
    reason: string
    raisedAtUtc: string
  } | null
  customer: {
    id: number
    customerNumber: number
    accountNumber: string
    autoNumber: string
    isCustomerNew: boolean
    isPostEnumerated: boolean
    statusCode: string
    isReadyforExtraction: boolean
    fullName: string
    phoneNumber: string
    employeeNo: string
    salesRepPhone: string
    phoneOffice: string
    gender: string
    email: string
    status: string
    isSuspended: boolean
    distributionSubstationId: number
    distributionSubstationCode: string
    feederName: string
    areaOfficeName: string
    companyName: string
    address: string
    addressTwo: string
    mapName: string
    type: string
    city: string
    provinceId: number
    provinceName: string
    lga: string
    serviceCenterId: number
    serviceCenterName: string
    latitude: number
    longitude: number
    tariffRate: number
    tariffId: number
    tariff: {
      id: number
      tariffIndex: string
      tariffCode: string
      name: string
      serviceBand: number
      tariffType: string
      tariffClass: string
      tariffRate: number
      currency: string
      unitOfMeasure: string
      fixedCharge: number
      minimumCharge: number
      description: string
      isActive: boolean
      isLocked: boolean
      effectiveFromUtc: string
      effectiveToUtc: string
      publishedAtUtc: string
      publishedBy: string
      version: string
      supersedesTariffGroupId: number
      sourceDocumentRef: string
    }
    isPPM: boolean
    isMeteredPostpaid: boolean
    isMD: boolean
    isUrban: boolean
    isHRB: boolean
    isCustomerAccGovt: boolean
    comment: string
    storedAverage: number
    totalMonthlyVend: number
    totalMonthlyDebt: number
    totalLifetimeDebit: number
    totalLifetimeCredit: number
    customerOutstandingDebtBalance: number
    customerOutstandingCreditBalance: number
    customerOutstandingBalance: number
    customerOutstandingBalanceLabel: string
    salesRepUserId: number
    technicalEngineerUserId: number
    category: {
      id: number
      name: string
      description: string
      subCategories: Array<{
        id: number
        name: string
        description: string
        customerCategoryId: number
      }>
    }
    subCategory: {
      id: number
      name: string
      description: string
      customerCategoryId: number
    }
    salesRepUser: {
      id: number
      fullName: string
      email: string
      phoneNumber: string
    }
    lastLoginAt: string
    suspensionReason: string
    suspendedAt: string
    distributionSubstation: any
    technicalEngineerUser: {
      id: number
      fullName: string
      email: string
      phoneNumber: string
    }
    serviceCenter: {
      id: number
      name: string
      code: string
      address: string
      areaOfficeId: number
      areaOffice: any
      latitude: number
      longitude: number
    }
    accountNumberHistory: Array<{
      oldAccountNumber: string
      newAccountNumber: string
      requestedByUserId: number
      requestedAtUtc: string
      reason: string
      oldAddress: string
      oldAddressTwo: string
      oldCity: string
      oldProvinceId: number
      oldLatitude: number
      oldLongitude: number
      newAddress: string
      newAddressTwo: string
      newCity: string
      newProvinceId: number
      newLatitude: number
      newLongitude: number
    }>
    meterHistory: Array<{
      oldMeterNumber: string
      newMeterNumber: string
      requestedByUserId: number
      requestedAtUtc: string
      reason: string
      oldAddress: string
      oldAddressTwo: string
      oldCity: string
      oldProvinceId: number
      oldLatitude: number
      oldLongitude: number
      newAddress: string
      newAddressTwo: string
      newCity: string
      newProvinceId: number
      newLatitude: number
      newLongitude: number
    }>
    meters: Array<{
      id: number
      customerId: number
      customerAccountNumber: string
      customerFullName: string
      serialNumber: string
      drn: string
      sgc: number
      krn: string
      ti: number
      ea: number
      tct: number
      ken: number
      mfrCode: number
      installationDate: string
      meterAddedBy: string
      meterEditedBy: string
      meterDateCreated: string
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
      tariff: any
      injectionSubstationId: number
      distributionSubstationId: number
      feederId: number
      areaOfficeId: number
      state: number
      address: string
      addressTwo: string
      city: string
      apartmentNumber: string
      latitude: number
      longitude: number
      tenantFullName: string
      tenantPhoneNumber: string
    }>
    currentTariffOverride: {
      id: number
      tariffRateOverride: number
      effectiveFromUtc: string
      effectiveToUtc: string
      reason: string
    } | null
    currentVatOverride: {
      id: number
      vatRateOverride: number
      isVatWaived: boolean
      effectiveFromUtc: string
      effectiveToUtc: string
      reason: string
    } | null
  }
  createdAt: string
  lastUpdated: string
  ledgerEntries: Array<{
    id: number
    type: number
    amount: number
    code: string
    memo: string
    effectiveAtUtc: string
    referenceId: number
  }>
}

// Bill details response interface
interface BillDetailsResponse {
  isSuccess: boolean
  message: string
  data: BillDetails
}

// Support Category Interface
interface SupportCategory {
  id: number
  name: string
  description: string
  isActive: boolean
}

// Support Categories Response Interface
interface SupportCategoriesResponse {
  isSuccess: boolean
  message: string
  data: SupportCategory[]
}

// Raise Ticket Request Interface
interface RaiseTicketRequest {
  categoryId: number
  title: string
  message: string
  fileUrls: string[]
}

// Ticket Message Interface
interface TicketMessage {
  id: number
  senderType: "Customer" | "Agent" | "System"
  senderCustomerId?: number
  senderUserId?: number
  senderName: string
  message: string
  fileUrls: string[]
  sentAtUtc: string
}

// Raised Ticket Data Interface
interface RaisedTicketData {
  id: number
  reference: string
  title: string
  status: "Open" | "In-Progress" | "Resolved" | "Closed"
  categoryId: number
  categoryName: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  createdAtUtc: string
  lastMessageAtUtc: string
  messages: TicketMessage[]
}

// Raise Ticket Response Interface
interface RaiseTicketResponse {
  isSuccess: boolean
  message: string
  data: RaisedTicketData
}

// Support Ticket Item Interface
interface SupportTicketItem {
  id: number
  reference: string
  title: string
  status: "Open" | "In-Progress" | "Resolved" | "Closed"
  categoryId: number
  categoryName: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  lastMessageAtUtc: string
  createdAtUtc: string
}

// Support Tickets Response Interface
interface SupportTicketsResponse {
  isSuccess: boolean
  message: string
  data: SupportTicketItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Ticket Detail Message Interface
interface TicketDetailMessage {
  id: number
  senderType: "Customer" | "User"
  senderCustomerId?: number
  senderUserId?: number
  senderName: string
  message: string
  fileUrls: string[]
  sentAtUtc: string
}

// Ticket Detail Data Interface
interface TicketDetailData {
  id: number
  reference: string
  title: string
  status: "Open" | "Closed" | "In Progress" | string
  categoryId: number
  categoryName: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  createdAtUtc: string
  lastMessageAtUtc: string
  messages: TicketDetailMessage[]
}

// Ticket Detail Response Interface
interface TicketDetailResponse {
  isSuccess: boolean
  message: string
  data: TicketDetailData
}

// Get Support Tickets Request Interface
interface GetSupportTicketsRequest {
  pageNumber: number
  pageSize: number
  customerId?: number
  categoryId?: number
  status?: string
  reference?: string
  search?: string
  startDateUtc?: string
  endDateUtc?: string
}

interface CustomersDashboardState {
  isLoadingSummary: boolean
  isLoadingPayments: boolean
  isLoadingPaymentDetail: boolean
  isLookingUpCustomer: boolean
  isVending: boolean
  isGettingToken: boolean
  isLoadingRecentOutages: boolean
  isReportingOutage: boolean
  isLoadingCustomerMeters: boolean
  isLoadingPaymentTypes: boolean
  isMakingPayment: boolean
  isLoadingMyBills: boolean
  isLoadingBillDetails: boolean
  isLoadingSupportCategories: boolean
  isRaisingTicket: boolean
  isLoadingSupportTickets: boolean
  isLoadingTicketDetail: boolean
  summaryError: string | null
  paymentsError: string | null
  paymentDetailError: string | null
  customerLookupError: string | null
  vendError: string | null
  getTokenError: string | null
  recentOutagesError: string | null
  reportOutageError: string | null
  customerMetersError: string | null
  paymentTypesError: string | null
  makePaymentError: string | null
  myBillsError: string | null
  billDetailsError: string | null
  supportCategoriesError: string | null
  raiseTicketError: string | null
  supportTicketsError: string | null
  ticketDetailError: string | null
  summarySuccess: boolean
  paymentsSuccess: boolean
  paymentDetailSuccess: boolean
  customerLookupSuccess: boolean
  vendSuccess: boolean
  getTokenSuccess: boolean
  recentOutagesSuccess: boolean
  reportOutageSuccess: boolean
  customerMetersSuccess: boolean
  paymentTypesSuccess: boolean
  makePaymentSuccess: boolean
  myBillsSuccess: boolean
  billDetailsSuccess: boolean
  supportCategoriesSuccess: boolean
  raiseTicketSuccess: boolean
  supportTicketsSuccess: boolean
  ticketDetailSuccess: boolean
  lastSummaryMessage: string | null
  lastPaymentsMessage: string | null
  lastPaymentDetailMessage: string | null
  lastCustomerLookupMessage: string | null
  lastVendMessage: string | null
  lastGetTokenMessage: string | null
  lastRecentOutagesMessage: string | null
  lastReportOutageMessage: string | null
  lastCustomerMetersMessage: string | null
  lastPaymentTypesMessage: string | null
  lastMakePaymentMessage: string | null
  lastMyBillsMessage: string | null
  lastBillDetailsMessage: string | null
  lastSupportCategoriesMessage: string | null
  lastRaiseTicketMessage: string | null
  lastSupportTicketsMessage: string | null
  lastTicketDetailMessage: string | null
  paymentsSummary: PaymentsSummaryData | null
  paymentsList: PaymentItem[] | null
  paymentDetail: PaymentDetail | null
  customerLookupData: CustomerLookupData | null
  vendResponseData: VendResponseData | null
  getTokenResponseData: GetTokenResponseData | null
  recentOutagesList: RecentOutageItem[] | null
  reportOutageResponseData: ReportOutageResponseData | null
  customerMetersList: CustomerMeter[] | null
  paymentTypesList: PaymentType[] | null
  makePaymentResponseData: MakePaymentResponseData | null
  myBillsList: BillItem[] | null
  billDetails: BillDetails | null
  supportCategoriesList: SupportCategory[] | null
  raisedTicketData: RaisedTicketData | null
  supportTicketsList: SupportTicketItem[] | null
  ticketDetailData: TicketDetailData | null
  paymentsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null
  recentOutagesPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null
  customerMetersPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null
  myBillsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null
  supportTicketsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null
}

const initialState: CustomersDashboardState = {
  isLoadingSummary: false,
  isLoadingPayments: false,
  isLoadingPaymentDetail: false,
  isLookingUpCustomer: false,
  isVending: false,
  isGettingToken: false,
  isLoadingRecentOutages: false,
  isReportingOutage: false,
  isLoadingCustomerMeters: false,
  isLoadingPaymentTypes: false,
  isMakingPayment: false,
  isLoadingMyBills: false,
  isLoadingBillDetails: false,
  isLoadingSupportCategories: false,
  isRaisingTicket: false,
  isLoadingSupportTickets: false,
  isLoadingTicketDetail: false,
  summaryError: null,
  paymentsError: null,
  paymentDetailError: null,
  customerLookupError: null,
  vendError: null,
  getTokenError: null,
  recentOutagesError: null,
  reportOutageError: null,
  customerMetersError: null,
  paymentTypesError: null,
  makePaymentError: null,
  myBillsError: null,
  billDetailsError: null,
  supportCategoriesError: null,
  raiseTicketError: null,
  supportTicketsError: null,
  ticketDetailError: null,
  summarySuccess: false,
  paymentsSuccess: false,
  paymentDetailSuccess: false,
  customerLookupSuccess: false,
  vendSuccess: false,
  getTokenSuccess: false,
  recentOutagesSuccess: false,
  reportOutageSuccess: false,
  customerMetersSuccess: false,
  paymentTypesSuccess: false,
  makePaymentSuccess: false,
  myBillsSuccess: false,
  billDetailsSuccess: false,
  supportCategoriesSuccess: false,
  raiseTicketSuccess: false,
  supportTicketsSuccess: false,
  ticketDetailSuccess: false,
  lastSummaryMessage: null,
  lastPaymentsMessage: null,
  lastPaymentDetailMessage: null,
  lastCustomerLookupMessage: null,
  lastVendMessage: null,
  lastGetTokenMessage: null,
  lastRecentOutagesMessage: null,
  lastReportOutageMessage: null,
  lastCustomerMetersMessage: null,
  lastPaymentTypesMessage: null,
  lastMakePaymentMessage: null,
  lastMyBillsMessage: null,
  lastBillDetailsMessage: null,
  lastSupportCategoriesMessage: null,
  lastRaiseTicketMessage: null,
  lastSupportTicketsMessage: null,
  lastTicketDetailMessage: null,
  paymentsSummary: null,
  paymentsList: null,
  paymentDetail: null,
  customerLookupData: null,
  vendResponseData: null,
  getTokenResponseData: null,
  recentOutagesList: null,
  reportOutageResponseData: null,
  customerMetersList: null,
  paymentTypesList: null,
  makePaymentResponseData: null,
  myBillsList: null,
  billDetails: null,
  supportCategoriesList: null,
  raisedTicketData: null,
  supportTicketsList: null,
  ticketDetailData: null,
  paymentsPagination: null,
  recentOutagesPagination: null,
  customerMetersPagination: null,
  myBillsPagination: null,
  supportTicketsPagination: null,
}

// Get payments summary thunk
export const getPaymentsSummary = createAsyncThunk(
  "customersDashboard/getPaymentsSummary",
  async ({ range }: GetPaymentsSummaryRequest, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (range) {
        params.append("range", range)
      }

      const response = await customerApi.get<PaymentsSummaryResponse>(
        `${buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.SUMMARY)}?${params.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payments summary")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payments summary")
      }
      return rejectWithValue(error.message || "Network error while fetching payments summary")
    }
  }
)

// Get payments list thunk
export const getPaymentsList = createAsyncThunk(
  "customersDashboard/getPaymentsList",
  async (request: GetPaymentsListRequest, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()

      // Required parameters
      params.append("PageNumber", request.pageNumber.toString())
      params.append("PageSize", request.pageSize.toString())

      // Optional parameters - only append if they exist
      if (request.customerId !== undefined) params.append("CustomerId", request.customerId.toString())
      if (request.vendorId !== undefined) params.append("VendorId", request.vendorId.toString())
      if (request.agentId !== undefined) params.append("AgentId", request.agentId.toString())
      if (request.areaOfficeId !== undefined) params.append("AreaOfficeId", request.areaOfficeId.toString())
      if (request.distributionSubstationId !== undefined)
        params.append("DistributionSubstationId", request.distributionSubstationId.toString())
      if (request.feederId !== undefined) params.append("FeederId", request.feederId.toString())
      if (request.serviceCenterId !== undefined) params.append("ServiceCenterId", request.serviceCenterId.toString())
      if (request.postpaidBillId !== undefined) params.append("PostpaidBillId", request.postpaidBillId.toString())
      if (request.paymentTypeId !== undefined) params.append("PaymentTypeId", request.paymentTypeId.toString())
      if (request.prepaidOnly !== undefined) params.append("PrepaidOnly", request.prepaidOnly.toString())
      if (request.channel) params.append("Channel", request.channel)
      if (request.status) params.append("Status", request.status)
      if (request.collectorType) params.append("CollectorType", request.collectorType)
      if (request.clearanceStatus) params.append("ClearanceStatus", request.clearanceStatus)
      if (request.paidFromUtc) params.append("PaidFromUtc", request.paidFromUtc)
      if (request.paidToUtc) params.append("PaidToUtc", request.paidToUtc)
      if (request.search) params.append("Search", request.search)
      if (request.isCleared !== undefined) params.append("IsCleared", request.isCleared.toString())
      if (request.isRemitted !== undefined) params.append("IsRemitted", request.isRemitted.toString())
      if (request.customerIsPPM !== undefined) params.append("CustomerIsPPM", request.customerIsPPM.toString())
      if (request.customerIsMD !== undefined) params.append("CustomerIsMD", request.customerIsMD.toString())
      if (request.customerIsUrban !== undefined) params.append("CustomerIsUrban", request.customerIsUrban.toString())
      if (request.customerProvinceId !== undefined)
        params.append("CustomerProvinceId", request.customerProvinceId.toString())

      const response = await customerApi.get<PaymentsListResponse>(
        `${buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.PAYMENTS)}?${params.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payments list")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payments list")
      }
      return rejectWithValue(error.message || "Network error while fetching payments list")
    }
  }
)

// Get payment detail thunk
export const getPaymentDetail = createAsyncThunk(
  "customersDashboard/getPaymentDetail",
  async ({ id }: GetPaymentDetailRequest, { rejectWithValue }) => {
    try {
      // Build the URL with the payment ID parameter
      const url = buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.PAYMENT_DETAIL).replace("{id}", id.toString())

      const response = await customerApi.get<PaymentDetailResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payment details")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payment details")
      }
      return rejectWithValue(error.message || "Network error while fetching payment details")
    }
  }
)

// Customer lookup thunk
export const customerLookup = createAsyncThunk(
  "customersDashboard/customerLookup",
  async ({ reference, type }: CustomerLookupRequest, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (reference) params.append("reference", reference)
      if (type) params.append("type", type)

      const response = await customerApi.get<CustomerLookupResponse>(
        `${buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.CUSTOMER_LOOKUP)}?${params.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to lookup customer")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to lookup customer")
      }
      return rejectWithValue(error.message || "Network error while looking up customer")
    }
  }
)

// Vend thunk
export const vend = createAsyncThunk("customersDashboard/vend", async (request: VendRequest, { rejectWithValue }) => {
  try {
    const response = await customerApi.post<VendResponse>(buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.VEND), request)

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to process vend")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to process vend")
    }
    return rejectWithValue(error.message || "Network error while processing vend")
  }
})

// Get token thunk
export const getToken = createAsyncThunk(
  "customersDashboard/getToken",
  async ({ reference }: GetTokenRequest, { rejectWithValue }) => {
    try {
      const response = await customerApi.post<GetTokenResponse>(
        buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.GET_TOKEN),
        { reference }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to get token")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to get token")
      }
      return rejectWithValue(error.message || "Network error while getting token")
    }
  }
)

// Get recent outages thunk
export const getRecentOutages = createAsyncThunk(
  "customersDashboard/getRecentOutages",
  async ({ pageNumber, pageSize, days }: GetRecentOutagesRequest, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()

      // Required parameters
      params.append("PageNumber", pageNumber.toString())
      params.append("PageSize", pageSize.toString())

      // Optional parameter
      if (days !== undefined) {
        params.append("days", days.toString())
      }

      const response = await customerApi.get<RecentOutagesResponse>(
        `${buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.RECENT_OUTAGES)}?${params.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch recent outages")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch recent outages")
      }
      return rejectWithValue(error.message || "Network error while fetching recent outages")
    }
  }
)

// Report outage thunk
export const reportOutage = createAsyncThunk(
  "customersDashboard/reportOutage",
  async ({ reason, additionalNotes }: ReportOutageRequest, { rejectWithValue }) => {
    try {
      const response = await customerApi.post<ReportOutageResponse>(
        buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.REPORT_OUTAGE),
        {
          reason,
          additionalNotes,
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to report outage")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to report outage")
      }
      return rejectWithValue(error.message || "Network error while reporting outage")
    }
  }
)

// Get customer meters thunk
export const getCustomerMeters = createAsyncThunk(
  "customersDashboard/getCustomerMeters",
  async (request: GetCustomerMetersRequest, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()

      // Required parameters
      params.append("PageNumber", request.pageNumber.toString())
      params.append("PageSize", request.pageSize.toString())

      // Optional parameters - only append if they exist
      if (request.search) params.append("Search", request.search)
      if (request.customerId !== undefined) params.append("CustomerId", request.customerId.toString())
      if (request.meterIsPPM !== undefined) params.append("MeterIsPPM", request.meterIsPPM.toString())
      if (request.isMeterActive !== undefined) params.append("IsMeterActive", request.isMeterActive.toString())
      if (request.status !== undefined) params.append("Status", request.status.toString())
      if (request.meterState !== undefined) params.append("MeterState", request.meterState.toString())
      if (request.meterType !== undefined) params.append("MeterType", request.meterType.toString())
      if (request.serviceBand !== undefined) params.append("ServiceBand", request.serviceBand.toString())
      if (request.injectionSubstationId !== undefined)
        params.append("InjectionSubstationId", request.injectionSubstationId.toString())
      if (request.distributionSubstationId !== undefined)
        params.append("DistributionSubstationId", request.distributionSubstationId.toString())
      if (request.feederId !== undefined) params.append("FeederId", request.feederId.toString())
      if (request.areaOfficeId !== undefined) params.append("AreaOfficeId", request.areaOfficeId.toString())
      if (request.drn) params.append("Drn", request.drn)
      if (request.tenantPhoneNumber) params.append("TenantPhoneNumber", request.tenantPhoneNumber)
      if (request.poleNumber) params.append("PoleNumber", request.poleNumber)

      const response = await customerApi.get<CustomerMetersResponse>(
        `${buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.CUSTOMER_METERS)}?${params.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch customer meters")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch customer meters")
      }
      return rejectWithValue(error.message || "Network error while fetching customer meters")
    }
  }
)

// Get payment types thunk
export const getPaymentTypes = createAsyncThunk(
  "customersDashboard/getPaymentTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerApi.get<PaymentTypesResponse>(
        buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.PAYMENT_TYPES)
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payment types")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payment types")
      }
      return rejectWithValue(error.message || "Network error while fetching payment types")
    }
  }
)

// Make payment thunk
export const makePayment = createAsyncThunk(
  "customersDashboard/makePayment",
  async ({ paymentTypeId, amount, channel }: MakePaymentRequest, { rejectWithValue }) => {
    console.log("makePayment thunk called with:", { paymentTypeId, amount, channel })
    try {
      const url = buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.MAKE_PAYMENT)
      console.log("Making POST request to:", url)

      const response = await customerApi.post<MakePaymentResponse>(url, {
        paymentTypeId,
        amount,
        channel,
      })

      console.log("makePayment response:", response.data)

      if (!response.data.isSuccess) {
        console.log("makePayment failed:", response.data.message)
        return rejectWithValue(response.data.message || "Failed to make payment")
      }

      console.log("makePayment success")
      return response.data
    } catch (error: any) {
      console.error("makePayment error:", error)
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to make payment")
      }
      return rejectWithValue(error.message || "Network error while making payment")
    }
  }
)

// Get my bills thunk
export const getMyBills = createAsyncThunk(
  "customersDashboard/getMyBills",
  async (request: GetMyBillsRequest, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()

      // Required parameters
      params.append("PageNumber", request.pageNumber.toString())
      params.append("PageSize", request.pageSize.toString())

      // Optional parameters - only append if they exist
      if (request.billingPeriodId !== undefined) params.append("BillingPeriodId", request.billingPeriodId.toString())
      if (request.customerId !== undefined) params.append("CustomerId", request.customerId.toString())
      if (request.customerName) params.append("CustomerName", request.customerName)
      if (request.accountNumber) params.append("AccountNumber", request.accountNumber)
      if (request.status !== undefined) params.append("Status", request.status.toString())
      if (request.adjustmentStatus !== undefined) params.append("AdjustmentStatus", request.adjustmentStatus.toString())
      if (request.category !== undefined) params.append("Category", request.category.toString())
      if (request.areaOfficeId !== undefined) params.append("AreaOfficeId", request.areaOfficeId.toString())
      if (request.feederId !== undefined) params.append("FeederId", request.feederId.toString())
      if (request.distributionSubstationId !== undefined)
        params.append("DistributionSubstationId", request.distributionSubstationId.toString())
      if (request.serviceCenterId !== undefined) params.append("ServiceCenterId", request.serviceCenterId.toString())
      if (request.feederEnergyCapId !== undefined)
        params.append("FeederEnergyCapId", request.feederEnergyCapId.toString())
      if (request.customerIsMD !== undefined) params.append("CustomerIsMD", request.customerIsMD.toString())
      if (request.customerIsUrban !== undefined) params.append("CustomerIsUrban", request.customerIsUrban.toString())
      if (request.customerProvinceId !== undefined)
        params.append("CustomerProvinceId", request.customerProvinceId.toString())

      const response = await customerApi.get<MyBillsResponse>(
        `${buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.MY_BILLS)}?${params.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch bills")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch bills")
      }
      return rejectWithValue(error.message || "Network error while fetching bills")
    }
  }
)

// Get bill details thunk
export const getBillDetails = createAsyncThunk(
  "customersDashboard/getBillDetails",
  async ({ id }: { id: number }, { rejectWithValue }) => {
    try {
      const response = await customerApi.get<BillDetailsResponse>(
        buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.BILLS_DETAILS).replace("{id}", id.toString())
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch bill details")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch bill details")
      }
      return rejectWithValue(error.message || "Network error while fetching bill details")
    }
  }
)

// Get support categories thunk
export const getSupportCategories = createAsyncThunk(
  "customersDashboard/getSupportCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerApi.get<SupportCategoriesResponse>(
        buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.SUPPORT_CATEGORIES)
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch support categories")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch support categories")
      }
      return rejectWithValue(error.message || "Network error while fetching support categories")
    }
  }
)

// Raise ticket thunk
export const raiseTicket = createAsyncThunk(
  "customersDashboard/raiseTicket",
  async (ticketData: RaiseTicketRequest, { rejectWithValue }) => {
    try {
      const response = await customerApi.post<RaiseTicketResponse>(
        buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.RAISE_TICKET),
        ticketData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to raise ticket")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to raise ticket")
      }
      return rejectWithValue(error.message || "Network error while raising ticket")
    }
  }
)

// Get support tickets thunk
export const getSupportTickets = createAsyncThunk(
  "customersDashboard/getSupportTickets",
  async (request: GetSupportTicketsRequest, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()

      // Required parameters
      params.append("PageNumber", request.pageNumber.toString())
      params.append("PageSize", request.pageSize.toString())

      // Optional parameters - only append if they exist
      if (request.customerId !== undefined) params.append("CustomerId", request.customerId.toString())
      if (request.categoryId !== undefined) params.append("CategoryId", request.categoryId.toString())
      if (request.status) params.append("Status", request.status)
      if (request.reference) params.append("Reference", request.reference)
      if (request.search) params.append("Search", request.search)
      if (request.startDateUtc) params.append("StartDateUtc", request.startDateUtc)
      if (request.endDateUtc) params.append("EndDateUtc", request.endDateUtc)

      const response = await customerApi.get<SupportTicketsResponse>(
        `${buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.SUPPORT_TICKETS)}?${params.toString()}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch support tickets")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch support tickets")
      }
      return rejectWithValue(error.message || "Network error while fetching support tickets")
    }
  }
)

// Get ticket detail thunk
export const getTicketDetail = createAsyncThunk(
  "customersDashboard/getTicketDetail",
  async ({ id }: { id: number }, { rejectWithValue }) => {
    try {
      const response = await customerApi.get<TicketDetailResponse>(
        buildApiUrl(API_ENDPOINTS.CUSTOMERS_DASHBOARD.TICKET_DETAIL.replace("{id}", id.toString()))
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch ticket detail")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch ticket detail")
      }
      return rejectWithValue(error.message || "Network error while fetching ticket detail")
    }
  }
)

const customersDashboardSlice = createSlice({
  name: "customersDashboard",
  initialState,
  reducers: {
    clearSummaryStatus: (state) => {
      state.summaryError = null
      state.summarySuccess = false
      state.lastSummaryMessage = null
    },
    clearPaymentsStatus: (state) => {
      state.paymentsError = null
      state.paymentsSuccess = false
      state.lastPaymentsMessage = null
    },
    clearSupportTicketsStatus: (state) => {
      state.supportTicketsError = null
      state.supportTicketsSuccess = false
      state.lastSupportTicketsMessage = null
    },
    clearPaymentDetailStatus: (state) => {
      state.paymentDetailError = null
      state.paymentDetailSuccess = false
      state.lastPaymentDetailMessage = null
    },
    clearPaymentDetail: (state) => {
      state.paymentDetail = null
      state.paymentDetailError = null
      state.paymentDetailSuccess = false
      state.lastPaymentDetailMessage = null
      state.isLoadingPaymentDetail = false
    },
    clearCustomerLookupStatus: (state) => {
      state.customerLookupError = null
      state.customerLookupSuccess = false
      state.lastCustomerLookupMessage = null
    },
    clearVendStatus: (state) => {
      state.vendError = null
      state.vendSuccess = false
      state.lastVendMessage = null
    },
    clearGetTokenStatus: (state) => {
      state.getTokenError = null
      state.getTokenSuccess = false
      state.lastGetTokenMessage = null
    },
    clearRecentOutagesStatus: (state) => {
      state.recentOutagesError = null
      state.recentOutagesSuccess = false
      state.lastRecentOutagesMessage = null
    },
    clearReportOutageStatus: (state) => {
      state.reportOutageError = null
      state.reportOutageSuccess = false
      state.lastReportOutageMessage = null
    },
    clearCustomerMetersStatus: (state) => {
      state.customerMetersError = null
      state.customerMetersSuccess = false
      state.lastCustomerMetersMessage = null
    },
    clearPaymentTypesStatus: (state) => {
      state.paymentTypesError = null
      state.paymentTypesSuccess = false
      state.lastPaymentTypesMessage = null
    },
    clearMakePaymentStatus: (state) => {
      state.makePaymentError = null
      state.makePaymentSuccess = false
      state.lastMakePaymentMessage = null
    },
    clearMyBillsStatus: (state) => {
      state.myBillsError = null
      state.myBillsSuccess = false
      state.lastMyBillsMessage = null
    },
    clearBillDetailsStatus: (state) => {
      state.billDetailsError = null
      state.billDetailsSuccess = false
      state.lastBillDetailsMessage = null
    },
    clearSupportCategoriesStatus: (state) => {
      state.supportCategoriesError = null
      state.supportCategoriesSuccess = false
      state.lastSupportCategoriesMessage = null
    },
    clearRaiseTicketStatus: (state) => {
      state.raiseTicketError = null
      state.raiseTicketSuccess = false
      state.lastRaiseTicketMessage = null
    },
    clearTicketDetailStatus: (state) => {
      state.ticketDetailError = null
      state.ticketDetailSuccess = false
      state.lastTicketDetailMessage = null
    },
    clearBillDetails: (state) => {
      state.billDetails = null
      state.billDetailsError = null
      state.billDetailsSuccess = false
      state.lastBillDetailsMessage = null
      state.isLoadingBillDetails = false
    },
    resetCustomersDashboard: (state) => {
      state.isLoadingSummary = false
      state.isLoadingPayments = false
      state.isLoadingPaymentDetail = false
      state.isLookingUpCustomer = false
      state.isVending = false
      state.isGettingToken = false
      state.isLoadingRecentOutages = false
      state.isReportingOutage = false
      state.isLoadingCustomerMeters = false
      state.isLoadingPaymentTypes = false
      state.isMakingPayment = false
      state.isLoadingMyBills = false
      state.isLoadingBillDetails = false
      state.isLoadingSupportCategories = false
      state.isRaisingTicket = false
      state.isLoadingSupportTickets = false
      state.isLoadingTicketDetail = false
      state.summaryError = null
      state.paymentsError = null
      state.paymentDetailError = null
      state.customerLookupError = null
      state.vendError = null
      state.getTokenError = null
      state.recentOutagesError = null
      state.reportOutageError = null
      state.customerMetersError = null
      state.paymentTypesError = null
      state.makePaymentError = null
      state.myBillsError = null
      state.billDetailsError = null
      state.supportCategoriesError = null
      state.raiseTicketError = null
      state.supportTicketsError = null
      state.ticketDetailError = null
      state.summarySuccess = false
      state.paymentsSuccess = false
      state.paymentDetailSuccess = false
      state.customerLookupSuccess = false
      state.vendSuccess = false
      state.getTokenSuccess = false
      state.recentOutagesSuccess = false
      state.reportOutageSuccess = false
      state.customerMetersSuccess = false
      state.paymentTypesSuccess = false
      state.makePaymentSuccess = false
      state.myBillsSuccess = false
      state.billDetailsSuccess = false
      state.supportCategoriesSuccess = false
      state.raiseTicketSuccess = false
      state.supportTicketsSuccess = false
      state.ticketDetailSuccess = false
      state.lastSummaryMessage = null
      state.lastPaymentsMessage = null
      state.lastPaymentDetailMessage = null
      state.lastCustomerLookupMessage = null
      state.lastVendMessage = null
      state.lastGetTokenMessage = null
      state.lastRecentOutagesMessage = null
      state.lastReportOutageMessage = null
      state.lastCustomerMetersMessage = null
      state.lastPaymentTypesMessage = null
      state.lastMakePaymentMessage = null
      state.lastMyBillsMessage = null
      state.lastBillDetailsMessage = null
      state.lastSupportCategoriesMessage = null
      state.lastRaiseTicketMessage = null
      state.lastSupportTicketsMessage = null
      state.lastTicketDetailMessage = null
      state.paymentsSummary = null
      state.paymentsList = null
      state.paymentDetail = null
      state.customerLookupData = null
      state.vendResponseData = null
      state.getTokenResponseData = null
      state.recentOutagesList = null
      state.reportOutageResponseData = null
      state.customerMetersList = null
      state.paymentTypesList = null
      state.makePaymentResponseData = null
      state.myBillsList = null
      state.billDetails = null
      state.supportCategoriesList = null
      state.raisedTicketData = null
      state.supportTicketsList = null
      state.ticketDetailData = null
      state.paymentsPagination = null
      state.recentOutagesPagination = null
      state.customerMetersPagination = null
      state.myBillsPagination = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get payments summary cases
      .addCase(getPaymentsSummary.pending, (state) => {
        state.isLoadingSummary = true
        state.summaryError = null
        state.summarySuccess = false
        state.lastSummaryMessage = null
      })
      .addCase(getPaymentsSummary.fulfilled, (state, action: PayloadAction<PaymentsSummaryResponse>) => {
        state.isLoadingSummary = false
        state.summarySuccess = true
        state.summaryError = null
        state.lastSummaryMessage = action.payload.message
        state.paymentsSummary = action.payload.data
      })
      .addCase(getPaymentsSummary.rejected, (state, action) => {
        state.isLoadingSummary = false
        state.summaryError = (action.payload as string) || "Failed to fetch payments summary"
        state.summarySuccess = false
        state.lastSummaryMessage = null
        state.paymentsSummary = null
      })
      // Get payments list cases
      .addCase(getPaymentsList.pending, (state) => {
        state.isLoadingPayments = true
        state.paymentsError = null
        state.paymentsSuccess = false
        state.lastPaymentsMessage = null
      })
      .addCase(getPaymentsList.fulfilled, (state, action: PayloadAction<PaymentsListResponse>) => {
        state.isLoadingPayments = false
        state.paymentsSuccess = true
        state.paymentsError = null
        state.lastPaymentsMessage = action.payload.message
        state.paymentsList = action.payload.data
        state.paymentsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(getPaymentsList.rejected, (state, action) => {
        state.isLoadingPayments = false
        state.paymentsError = (action.payload as string) || "Failed to fetch payments list"
        state.paymentsSuccess = false
        state.lastPaymentsMessage = null
        state.paymentsList = null
        state.paymentsPagination = null
      })
      // Get payment detail cases
      .addCase(getPaymentDetail.pending, (state) => {
        state.isLoadingPaymentDetail = true
        state.paymentDetailError = null
        state.paymentDetailSuccess = false
        state.lastPaymentDetailMessage = null
      })
      .addCase(getPaymentDetail.fulfilled, (state, action: PayloadAction<PaymentDetailResponse>) => {
        state.isLoadingPaymentDetail = false
        state.paymentDetailSuccess = true
        state.paymentDetailError = null
        state.lastPaymentDetailMessage = action.payload.message
        state.paymentDetail = action.payload.data
      })
      .addCase(getPaymentDetail.rejected, (state, action) => {
        state.isLoadingPaymentDetail = false
        state.paymentDetailError = (action.payload as string) || "Failed to fetch payment details"
        state.paymentDetailSuccess = false
        state.lastPaymentDetailMessage = null
        state.paymentDetail = null
      })
      // Customer lookup cases
      .addCase(customerLookup.pending, (state) => {
        state.isLookingUpCustomer = true
        state.customerLookupError = null
        state.customerLookupSuccess = false
        state.lastCustomerLookupMessage = null
      })
      .addCase(customerLookup.fulfilled, (state, action: PayloadAction<CustomerLookupResponse>) => {
        state.isLookingUpCustomer = false
        state.customerLookupSuccess = true
        state.customerLookupError = null
        state.lastCustomerLookupMessage = action.payload.message
        state.customerLookupData = action.payload.data
      })
      .addCase(customerLookup.rejected, (state, action) => {
        state.isLookingUpCustomer = false
        state.customerLookupError = (action.payload as string) || "Failed to lookup customer"
        state.customerLookupSuccess = false
        state.lastCustomerLookupMessage = null
        state.customerLookupData = null
      })
      // Vend cases
      .addCase(vend.pending, (state) => {
        state.isVending = true
        state.vendError = null
        state.vendSuccess = false
        state.lastVendMessage = null
      })
      .addCase(vend.fulfilled, (state, action: PayloadAction<VendResponse>) => {
        state.isVending = false
        state.vendSuccess = true
        state.vendError = null
        state.lastVendMessage = action.payload.message
        state.vendResponseData = action.payload.data
      })
      .addCase(vend.rejected, (state, action) => {
        state.isVending = false
        state.vendError = (action.payload as string) || "Failed to process vend"
        state.vendSuccess = false
        state.lastVendMessage = null
        state.vendResponseData = null
      })
      // Get token cases
      .addCase(getToken.pending, (state) => {
        state.isGettingToken = true
        state.getTokenError = null
        state.getTokenSuccess = false
        state.lastGetTokenMessage = null
      })
      .addCase(getToken.fulfilled, (state, action: PayloadAction<GetTokenResponse>) => {
        state.isGettingToken = false
        state.getTokenSuccess = true
        state.getTokenError = null
        state.lastGetTokenMessage = action.payload.message
        state.getTokenResponseData = action.payload.data
      })
      .addCase(getToken.rejected, (state, action) => {
        state.isGettingToken = false
        state.getTokenError = (action.payload as string) || "Failed to get token"
        state.getTokenSuccess = false
        state.lastGetTokenMessage = null
        state.getTokenResponseData = null
      })
      // Get recent outages cases
      .addCase(getRecentOutages.pending, (state) => {
        state.isLoadingRecentOutages = true
        state.recentOutagesError = null
        state.recentOutagesSuccess = false
        state.lastRecentOutagesMessage = null
      })
      .addCase(getRecentOutages.fulfilled, (state, action: PayloadAction<RecentOutagesResponse>) => {
        state.isLoadingRecentOutages = false
        state.recentOutagesSuccess = true
        state.recentOutagesError = null
        state.lastRecentOutagesMessage = action.payload.message
        state.recentOutagesList = action.payload.data
        state.recentOutagesPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(getRecentOutages.rejected, (state, action) => {
        state.isLoadingRecentOutages = false
        state.recentOutagesError = (action.payload as string) || "Failed to fetch recent outages"
        state.recentOutagesSuccess = false
        state.lastRecentOutagesMessage = null
        state.recentOutagesList = null
        state.recentOutagesPagination = null
      })
      // Report outage cases
      .addCase(reportOutage.pending, (state) => {
        state.isReportingOutage = true
        state.reportOutageError = null
        state.reportOutageSuccess = false
        state.lastReportOutageMessage = null
      })
      .addCase(reportOutage.fulfilled, (state, action: PayloadAction<ReportOutageResponse>) => {
        state.isReportingOutage = false
        state.reportOutageSuccess = true
        state.reportOutageError = null
        state.lastReportOutageMessage = action.payload.message
        state.reportOutageResponseData = action.payload.data
      })
      .addCase(reportOutage.rejected, (state, action) => {
        state.isReportingOutage = false
        state.reportOutageError = (action.payload as string) || "Failed to report outage"
        state.reportOutageSuccess = false
        state.lastReportOutageMessage = null
        state.reportOutageResponseData = null
      })
      // Get customer meters cases
      .addCase(getCustomerMeters.pending, (state) => {
        state.isLoadingCustomerMeters = true
        state.customerMetersError = null
        state.customerMetersSuccess = false
        state.lastCustomerMetersMessage = null
      })
      .addCase(getCustomerMeters.fulfilled, (state, action: PayloadAction<CustomerMetersResponse>) => {
        state.isLoadingCustomerMeters = false
        state.customerMetersSuccess = true
        state.customerMetersError = null
        state.lastCustomerMetersMessage = action.payload.message
        state.customerMetersList = action.payload.data
        state.customerMetersPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(getCustomerMeters.rejected, (state, action) => {
        state.isLoadingCustomerMeters = false
        state.customerMetersError = (action.payload as string) || "Failed to fetch customer meters"
        state.customerMetersSuccess = false
        state.lastCustomerMetersMessage = null
        state.customerMetersList = null
        state.customerMetersPagination = null
      })
      // Get payment types cases
      .addCase(getPaymentTypes.pending, (state) => {
        state.isLoadingPaymentTypes = true
        state.paymentTypesError = null
        state.paymentTypesSuccess = false
        state.lastPaymentTypesMessage = null
      })
      .addCase(getPaymentTypes.fulfilled, (state, action: PayloadAction<PaymentTypesResponse>) => {
        state.isLoadingPaymentTypes = false
        state.paymentTypesSuccess = true
        state.paymentTypesError = null
        state.lastPaymentTypesMessage = action.payload.message
        state.paymentTypesList = action.payload.data
      })
      .addCase(getPaymentTypes.rejected, (state, action) => {
        state.isLoadingPaymentTypes = false
        state.paymentTypesError = (action.payload as string) || "Failed to fetch payment types"
        state.paymentTypesSuccess = false
        state.lastPaymentTypesMessage = null
        state.paymentTypesList = null
      })
      // Make payment cases
      .addCase(makePayment.pending, (state) => {
        state.isMakingPayment = true
        state.makePaymentError = null
        state.makePaymentSuccess = false
        state.lastMakePaymentMessage = null
      })
      .addCase(makePayment.fulfilled, (state, action: PayloadAction<MakePaymentResponse>) => {
        state.isMakingPayment = false
        state.makePaymentSuccess = true
        state.makePaymentError = null
        state.lastMakePaymentMessage = action.payload.message
        state.makePaymentResponseData = action.payload.data
      })
      .addCase(makePayment.rejected, (state, action) => {
        state.isMakingPayment = false
        state.makePaymentError = (action.payload as string) || "Failed to make payment"
        state.makePaymentSuccess = false
        state.lastMakePaymentMessage = null
        state.makePaymentResponseData = null
      })
      // Get my bills cases
      .addCase(getMyBills.pending, (state) => {
        state.isLoadingMyBills = true
        state.myBillsError = null
        state.myBillsSuccess = false
        state.lastMyBillsMessage = null
      })
      .addCase(getMyBills.fulfilled, (state, action: PayloadAction<MyBillsResponse>) => {
        state.isLoadingMyBills = false
        state.myBillsSuccess = true
        state.myBillsError = null
        state.lastMyBillsMessage = action.payload.message
        state.myBillsList = action.payload.data
        state.myBillsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(getMyBills.rejected, (state, action) => {
        state.isLoadingMyBills = false
        state.myBillsError = (action.payload as string) || "Failed to fetch bills"
        state.myBillsSuccess = false
        state.lastMyBillsMessage = null
        state.myBillsList = null
        state.myBillsPagination = null
      })
      // Get bill details cases
      .addCase(getBillDetails.pending, (state) => {
        state.isLoadingBillDetails = true
        state.billDetailsError = null
        state.billDetailsSuccess = false
        state.lastBillDetailsMessage = null
      })
      .addCase(getBillDetails.fulfilled, (state, action: PayloadAction<BillDetailsResponse>) => {
        state.isLoadingBillDetails = false
        state.billDetailsSuccess = true
        state.billDetailsError = null
        state.lastBillDetailsMessage = action.payload.message
        state.billDetails = action.payload.data
      })
      .addCase(getBillDetails.rejected, (state, action) => {
        state.isLoadingBillDetails = false
        state.billDetailsError = (action.payload as string) || "Failed to fetch bill details"
        state.billDetailsSuccess = false
        state.lastBillDetailsMessage = null
        state.billDetails = null
      })
      // Get support categories cases
      .addCase(getSupportCategories.pending, (state) => {
        state.isLoadingSupportCategories = true
        state.supportCategoriesError = null
        state.supportCategoriesSuccess = false
        state.lastSupportCategoriesMessage = null
      })
      .addCase(getSupportCategories.fulfilled, (state, action: PayloadAction<SupportCategoriesResponse>) => {
        state.isLoadingSupportCategories = false
        state.supportCategoriesSuccess = true
        state.supportCategoriesError = null
        state.lastSupportCategoriesMessage = action.payload.message
        state.supportCategoriesList = action.payload.data
      })
      .addCase(getSupportCategories.rejected, (state, action) => {
        state.isLoadingSupportCategories = false
        state.supportCategoriesError = (action.payload as string) || "Failed to fetch support categories"
        state.supportCategoriesSuccess = false
        state.lastSupportCategoriesMessage = (action.payload as string) || "Failed to fetch support categories"
      })
      // Raise ticket cases
      .addCase(raiseTicket.pending, (state) => {
        state.isRaisingTicket = true
        state.raiseTicketError = null
        state.raiseTicketSuccess = false
        state.lastRaiseTicketMessage = null
      })
      .addCase(raiseTicket.fulfilled, (state, action: PayloadAction<RaiseTicketResponse>) => {
        state.isRaisingTicket = false
        state.raiseTicketSuccess = true
        state.raiseTicketError = null
        state.lastRaiseTicketMessage = action.payload.message
        state.raisedTicketData = action.payload.data
      })
      .addCase(raiseTicket.rejected, (state, action) => {
        state.isRaisingTicket = false
        state.raiseTicketError = (action.payload as string) || "Failed to raise ticket"
        state.raiseTicketSuccess = false
        state.lastRaiseTicketMessage = (action.payload as string) || "Failed to raise ticket"
      })
      // Get support tickets cases
      .addCase(getSupportTickets.pending, (state) => {
        state.isLoadingSupportTickets = true
        state.supportTicketsError = null
        state.supportTicketsSuccess = false
        state.lastSupportTicketsMessage = null
      })
      .addCase(getSupportTickets.fulfilled, (state, action: PayloadAction<SupportTicketsResponse>) => {
        state.isLoadingSupportTickets = false
        state.supportTicketsSuccess = true
        state.supportTicketsError = null
        state.lastSupportTicketsMessage = action.payload.message
        state.supportTicketsList = action.payload.data
        state.supportTicketsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(getSupportTickets.rejected, (state, action) => {
        state.isLoadingSupportTickets = false
        state.supportTicketsError = (action.payload as string) || "Failed to fetch support tickets"
        state.supportTicketsSuccess = false
        state.lastSupportTicketsMessage = (action.payload as string) || "Failed to fetch support tickets"
        state.supportTicketsList = null
        state.supportTicketsPagination = null
      })
      // Get ticket detail cases
      .addCase(getTicketDetail.pending, (state) => {
        state.isLoadingTicketDetail = true
        state.ticketDetailError = null
        state.ticketDetailSuccess = false
        state.lastTicketDetailMessage = null
      })
      .addCase(getTicketDetail.fulfilled, (state, action: PayloadAction<TicketDetailResponse>) => {
        state.isLoadingTicketDetail = false
        state.ticketDetailSuccess = true
        state.ticketDetailError = null
        state.lastTicketDetailMessage = action.payload.message
        state.ticketDetailData = action.payload.data
      })
      .addCase(getTicketDetail.rejected, (state, action) => {
        state.isLoadingTicketDetail = false
        state.ticketDetailError = (action.payload as string) || "Failed to fetch ticket detail"
        state.ticketDetailSuccess = false
        state.lastTicketDetailMessage = (action.payload as string) || "Failed to fetch ticket detail"
        state.ticketDetailData = null
      })
  },
})

export const {
  clearSummaryStatus,
  clearPaymentsStatus,
  clearSupportTicketsStatus,
  clearPaymentDetailStatus,
  clearPaymentDetail,
  clearCustomerLookupStatus,
  clearVendStatus,
  clearGetTokenStatus,
  clearRecentOutagesStatus,
  clearReportOutageStatus,
  clearCustomerMetersStatus,
  clearPaymentTypesStatus,
  clearMakePaymentStatus,
  clearMyBillsStatus,
  clearBillDetailsStatus,
  clearSupportCategoriesStatus,
  clearRaiseTicketStatus,
  clearTicketDetailStatus,
  resetCustomersDashboard,
} = customersDashboardSlice.actions

// Selectors
export const selectPaymentsSummary = (state: RootState) => state.customersDashboard.paymentsSummary
export const selectPaymentsSummaryLoading = (state: RootState) => state.customersDashboard.isLoadingSummary
export const selectPaymentsSummaryError = (state: RootState) => state.customersDashboard.summaryError

export const selectPaymentsList = (state: RootState) => state.customersDashboard.paymentsList
export const selectPaymentsPagination = (state: RootState) => state.customersDashboard.paymentsPagination
export const selectPaymentsLoading = (state: RootState) => state.customersDashboard.isLoadingPayments
export const selectPaymentsError = (state: RootState) => state.customersDashboard.paymentsError

export const selectPaymentDetail = (state: RootState) => state.customersDashboard.paymentDetail
export const selectPaymentDetailLoading = (state: RootState) => state.customersDashboard.isLoadingPaymentDetail
export const selectPaymentDetailError = (state: RootState) => state.customersDashboard.paymentDetailError
export const selectPaymentDetailSuccess = (state: RootState) => state.customersDashboard.paymentDetailSuccess

// Customer lookup selectors
export const selectCustomerLookupData = (state: RootState) => state.customersDashboard.customerLookupData
export const selectCustomerLookupLoading = (state: RootState) => state.customersDashboard.isLookingUpCustomer
export const selectCustomerLookupError = (state: RootState) => state.customersDashboard.customerLookupError
export const selectCustomerLookupSuccess = (state: RootState) => state.customersDashboard.customerLookupSuccess

// Vend selectors
export const selectVendResponseData = (state: RootState) => state.customersDashboard.vendResponseData
export const selectVendLoading = (state: RootState) => state.customersDashboard.isVending
export const selectVendError = (state: RootState) => state.customersDashboard.vendError
export const selectVendSuccess = (state: RootState) => state.customersDashboard.vendSuccess

// Get token selectors
export const selectGetTokenResponseData = (state: RootState) => state.customersDashboard.getTokenResponseData
export const selectGetTokenLoading = (state: RootState) => state.customersDashboard.isGettingToken
export const selectGetTokenError = (state: RootState) => state.customersDashboard.getTokenError
export const selectGetTokenSuccess = (state: RootState) => state.customersDashboard.getTokenSuccess

// Recent outages selectors
export const selectRecentOutagesList = (state: RootState) => state.customersDashboard.recentOutagesList
export const selectRecentOutagesPagination = (state: RootState) => state.customersDashboard.recentOutagesPagination
export const selectRecentOutagesLoading = (state: RootState) => state.customersDashboard.isLoadingRecentOutages
export const selectRecentOutagesError = (state: RootState) => state.customersDashboard.recentOutagesError
export const selectRecentOutagesSuccess = (state: RootState) => state.customersDashboard.recentOutagesSuccess

// Report outage selectors
export const selectReportOutageResponseData = (state: RootState) => state.customersDashboard.reportOutageResponseData
export const selectReportOutageLoading = (state: RootState) => state.customersDashboard.isReportingOutage
export const selectReportOutageError = (state: RootState) => state.customersDashboard.reportOutageError
export const selectReportOutageSuccess = (state: RootState) => state.customersDashboard.reportOutageSuccess

// Customer meters selectors
export const selectCustomerMetersList = (state: RootState) => state.customersDashboard.customerMetersList
export const selectCustomerMetersPagination = (state: RootState) => state.customersDashboard.customerMetersPagination
export const selectCustomerMetersLoading = (state: RootState) => state.customersDashboard.isLoadingCustomerMeters
export const selectCustomerMetersError = (state: RootState) => state.customersDashboard.customerMetersError
export const selectCustomerMetersSuccess = (state: RootState) => state.customersDashboard.customerMetersSuccess

// Payment types selectors
export const selectPaymentTypesList = (state: RootState) => state.customersDashboard.paymentTypesList
export const selectPaymentTypesLoading = (state: RootState) => state.customersDashboard.isLoadingPaymentTypes
export const selectPaymentTypesError = (state: RootState) => state.customersDashboard.paymentTypesError
export const selectPaymentTypesSuccess = (state: RootState) => state.customersDashboard.paymentTypesSuccess

// Make payment selectors
export const selectMakePaymentResponseData = (state: RootState) => state.customersDashboard.makePaymentResponseData
export const selectMakePaymentLoading = (state: RootState) => state.customersDashboard.isMakingPayment
export const selectMakePaymentError = (state: RootState) => state.customersDashboard.makePaymentError
export const selectMakePaymentSuccess = (state: RootState) => state.customersDashboard.makePaymentSuccess

// My bills selectors
export const selectMyBillsList = (state: RootState) => state.customersDashboard.myBillsList
export const selectMyBillsPagination = (state: RootState) => state.customersDashboard.myBillsPagination
export const selectMyBillsLoading = (state: RootState) => state.customersDashboard.isLoadingMyBills
export const selectMyBillsError = (state: RootState) => state.customersDashboard.myBillsError
export const selectMyBillsSuccess = (state: RootState) => state.customersDashboard.myBillsSuccess

// Bill details selectors
export const selectBillDetails = (state: RootState) => state.customersDashboard.billDetails
export const selectBillDetailsLoading = (state: RootState) => state.customersDashboard.isLoadingBillDetails
export const selectBillDetailsError = (state: RootState) => state.customersDashboard.billDetailsError
export const selectBillDetailsSuccess = (state: RootState) => state.customersDashboard.billDetailsSuccess

// Support categories selectors
export const selectSupportCategoriesList = (state: RootState) => state.customersDashboard.supportCategoriesList
export const selectSupportCategoriesLoading = (state: RootState) => state.customersDashboard.isLoadingSupportCategories
export const selectSupportCategoriesError = (state: RootState) => state.customersDashboard.supportCategoriesError
export const selectSupportCategoriesSuccess = (state: RootState) => state.customersDashboard.supportCategoriesSuccess

// Raise ticket selectors
export const selectRaisedTicketData = (state: RootState) => state.customersDashboard.raisedTicketData
export const selectRaiseTicketLoading = (state: RootState) => state.customersDashboard.isRaisingTicket
export const selectRaiseTicketError = (state: RootState) => state.customersDashboard.raiseTicketError
export const selectRaiseTicketSuccess = (state: RootState) => state.customersDashboard.raiseTicketSuccess
export const selectRaiseTicketMessage = (state: RootState) => state.customersDashboard.lastRaiseTicketMessage

// Support tickets selectors
export const selectSupportTicketsList = (state: RootState) => state.customersDashboard.supportTicketsList
export const selectSupportTicketsPagination = (state: RootState) => state.customersDashboard.supportTicketsPagination
export const selectSupportTicketsLoading = (state: RootState) => state.customersDashboard.isLoadingSupportTickets
export const selectSupportTicketsError = (state: RootState) => state.customersDashboard.supportTicketsError
export const selectSupportTicketsSuccess = (state: RootState) => state.customersDashboard.supportTicketsSuccess

// Ticket detail selectors
export const selectTicketDetailData = (state: RootState) => state.customersDashboard.ticketDetailData
export const selectTicketDetailLoading = (state: RootState) => state.customersDashboard.isLoadingTicketDetail
export const selectTicketDetailError = (state: RootState) => state.customersDashboard.ticketDetailError
export const selectTicketDetailSuccess = (state: RootState) => state.customersDashboard.ticketDetailSuccess
export const selectTicketDetailMessage = (state: RootState) => state.customersDashboard.lastTicketDetailMessage

// Export the customer API instance for use in other customer portal components
export { customerApi }

export default customersDashboardSlice.reducer
