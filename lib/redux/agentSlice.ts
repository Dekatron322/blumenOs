// src/lib/redux/agentSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Agent User
export interface AgentUserRole {
  roleId: number
  name: string
  slug: string
  category: string
}

export interface AgentUserPrivilege {
  key: string
  name: string
  category: string
  actions: string[]
}

export interface AgentUser {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  accountId: string
  isActive: boolean
  mustChangePassword: boolean
  employeeId: string
  position: string
  employmentType: string
  employmentStartAt: string
  employmentEndAt: string
  departmentId: number
  departmentName: string
  areaOfficeId: number
  areaOfficeName: string
  lastLoginAt: string
  createdAt: string
  lastUpdated: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  profilePicture: string
  emergencyContact: string
  address: string
  supervisorId: number
  supervisorName: string
  roles: AgentUserRole[]
  privileges: AgentUserPrivilege[]
}

// Interface for Collection Officer
export interface CollectionOfficer {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  accountId: string
  isActive: boolean
  mustChangePassword: boolean
  employeeId: string
  position: string
  employmentType: string
  employmentStartAt: string
  employmentEndAt: string
  departmentId: number
  departmentName: string
  areaOfficeId: number
  areaOfficeName: string
  lastLoginAt: string
  createdAt: string
  lastUpdated: string
}

// Interface for Sales Rep used in cash clearances
export interface ClearanceSalesRep {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  accountId: string
}

// Cash Clearance Status Enum
export enum CashClearanceStatus {
  Pending = 0,
  Approved = 1,
  ApprovedWithCondition = 2,
  Declined = 3,
}

// Interface for Cash Clearance
export interface CashClearance {
  approvedBy: {
    id: number
    fullName: string
    email: string
    employeeId?: string
    phoneNumber?: string
  }
  id: number
  createdAt: string
  agentId: number
  requestedByUserId: number
  collectionOfficerUserId: number | null
  approvedByUserId: number | null
  amountCleared: number
  requestedAmountAtHand: number
  cashAtHandBefore: number
  cashAtHandAfter: number
  clearedAt: string
  approvedAtUtc: string | null
  status: CashClearanceStatus
  issueFlag: number
  hasAmountDiscrepancy: boolean
  notes: string
  approvalNotes: string | null
  salesRep: {
    id: number
    fullName: string
    email: string
    phoneNumber: string
    accountId: string
    isActive: boolean
    mustChangePassword: boolean
    employeeId: string
    position: string
    employmentType: string
    employmentStartAt: string | null
    employmentEndAt: string | null
    departmentId: number
    departmentName: string | null
    areaOfficeId: number
    areaOfficeName: string | null
    lastLoginAt: string
    createdAt: string
    lastUpdated: string
  }
  collectionOfficer: CollectionOfficer | null
  requestedBy: CollectionOfficer
}

// Interface for Clear Cash Response
export interface ClearCashResponseData {
  id: number
  createdAt: string
  amountCleared: number
  cashAtHandBefore: number
  cashAtHandAfter: number
  clearedAt: string
  notes: string
  collectionOfficer: CollectionOfficer
  clearedBy: CollectionOfficer
}

export interface ClearCashResponse {
  isSuccess: boolean
  message: string
  data: ClearCashResponseData
}

// Interface for Clear Cash Request Body
export interface ClearCashRequest {
  collectionOfficerUserId: number
  amount: number
  notes: string
}

// Interface for Agent Clear Cash Request Body
export interface AgentClearCashRequest {
  amount: number
  notes: string
}

// Interface for Approve Clearance Request Body
export interface ApproveClearanceRequest {
  outcome: number
  clearedAmount: number
  notes: string
}

// Interface for Approve Clearance Response Data
export interface ApproveClearanceResponseData {
  id: number
  createdAt: string
  agentId: number
  requestedByUserId: number
  collectionOfficerUserId: number
  approvedByUserId: number
  amountCleared: number
  requestedAmountAtHand: number
  cashAtHandBefore: number
  cashAtHandAfter: number
  clearedAt: string
  approvedAtUtc: string
  status: number
  issueFlag: number
  notes: string
  approvalNotes: string
  salesRep: {
    id: number
    fullName: string
    email: string
    phoneNumber: string
    accountId: string
    isActive: boolean
    mustChangePassword: boolean
    employeeId: string
    position: string
    employmentType: string
    employmentStartAt: string
    employmentEndAt: string
    departmentId: number
    departmentName: string
    areaOfficeId: number
    areaOfficeName: string
    lastLoginAt: string
    createdAt: string
    lastUpdated: string
  }
  collectionOfficer: {
    id: number
    fullName: string
    email: string
    phoneNumber: string
    accountId: string
    isActive: boolean
    mustChangePassword: boolean
    employeeId: string
    position: string
    employmentType: string
    employmentStartAt: string
    employmentEndAt: string
    departmentId: number
    departmentName: string
    areaOfficeId: number
    areaOfficeName: string
    lastLoginAt: string
    createdAt: string
    lastUpdated: string
  }
  approvedBy: {
    id: number
    fullName: string
    email: string
    phoneNumber: string
    accountId: string
    isActive: boolean
    mustChangePassword: boolean
    employeeId: string
    position: string
    employmentType: string
    employmentStartAt: string
    employmentEndAt: string
    departmentId: number
    departmentName: string
    areaOfficeId: number
    areaOfficeName: string
    lastLoginAt: string
    createdAt: string
    lastUpdated: string
  }
  requestedBy: {
    id: number
    fullName: string
    email: string
    phoneNumber: string
    accountId: string
    isActive: boolean
    mustChangePassword: boolean
    employeeId: string
    position: string
    employmentType: string
    employmentStartAt: string
    employmentEndAt: string
    departmentId: number
    departmentName: string
    areaOfficeId: number
    areaOfficeName: string
    lastLoginAt: string
    createdAt: string
    lastUpdated: string
  }
}

// Interface for Approve Clearance Response
export interface ApproveClearanceResponse {
  isSuccess: boolean
  message: string
  data: ApproveClearanceResponseData
}

// Interface for Agent (Full Details)
export interface Agent {
  id: number
  agentCode: string
  status: string
  canCollectCash: boolean
  cashCollectionLimit: number
  cashAtHand: number
  lastCashCollectionDate: string
  user: AgentUser
  cashClearances: CashClearance[]
  areaOfficeId: number
  areaOfficeName: string
  serviceCenterId: number
  serviceCenterName: string
  tempPassword: string
}

// Interface for Agent Info (Summary for current logged-in agent)
export interface AgentInfo {
  agentId: number
  agentCode: string
  fullName: string
  email: string
  phoneNumber: string
  status: string
  canCollectCash: boolean
  cashCollectionLimit: number
  maxSingleAllowedCashAmount: number
  cashAtHand: number
  monthlyPerformanceScore: number
  lastCashCollectionDate: string
  areaOfficeName: string
  serviceCenterName: string
  agentType: string
}

export interface AgentInfoResponse {
  isSuccess: boolean
  message: string
  data: AgentInfo
}

// Interface for Agent Details Response
export interface AgentDetailsResponse {
  isSuccess: boolean
  message: string
  data: Agent
}

// Interface for Agents List Response
export interface AgentsResponse {
  isSuccess: boolean
  message: string
  data: Agent[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Interface for Add Agent Request Body
export interface AddAgentRequest {
  fullName: string
  email: string
  phoneNumber: string
  areaOfficeId: number
  serviceCenterId?: number
  distributionSubstationId?: number
  departmentId: number
  managerAgentId?: number
  agentType: string
  enforceJurisdiction: boolean
  employeeId: string
  position?: string
  emergencyContact?: string
  address?: string
  supervisorId?: number
  employmentType: string
  cashCollectionLimit: number
  maxSingleAllowedCashAmount?: number
  canCollectCash: boolean
  status: string
}

// Interface for Add Agent Response
export interface AddAgentResponse {
  isSuccess: boolean
  message: string
  data: Agent
}

// Interface for Add Existing User as Agent Request Body
export interface AddExistingUserAsAgentRequest {
  userAccountId: number
  areaOfficeId: number
  serviceCenterId: number
  distributionSubstationId: number
  managerAgentId: number
  agentType: string
  enforceJurisdiction: boolean
  status: string
  cashCollectionLimit: number
  maxSingleAllowedCashAmount: number
  canCollectCash: boolean
}

// Interface for Add Existing User as Agent Response
export interface AddExistingUserAsAgentResponse {
  isSuccess: boolean
  message: string
  data: Agent
}

// Interface for Agents Request Parameters
export interface AgentsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  status?: string
  AgentType?: string
  canCollectCash?: boolean
  minCashAtHand?: number
  maxCashAtHand?: number
  lastCashCollectionDateFrom?: string
  lastCashCollectionDateTo?: string
  areaOfficeId?: number
  serviceCenterId?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Interfaces for Change Request
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
  source: number
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
  sortBy?: string
  sortOrder?: "asc" | "desc"
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

// Interface for Clearances List Response
export interface ClearancesResponse {
  isSuccess: boolean
  message: string
  data: CashClearance[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Interface for Clearances Request Parameters
export interface ClearancesRequestParams {
  id?: number
  pageNumber: number
  pageSize: number
}

// Interfaces for Payments
export enum PaymentChannel {
  Cash = "Cash",
  BankTransfer = "BankTransfer",
  Pos = "Pos",
  Card = "Card",
  VendorWallet = "VendorWallet",
  Chaque = "Chaque",
}

export enum PaymentStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Failed = "Failed",
  Reversed = "Reversed",
}

export enum CollectorType {
  Customer = "Customer",
  SalesRep = "SalesRep",
  Vendor = "Vendor",
  Staff = "Staff",
}

export interface Payment {
  paymentDetails: any
  isPending: boolean
  id: number
  reference: string
  latitude: number
  longitude: number
  channel: PaymentChannel
  status: PaymentStatus
  collectorType: CollectorType
  amount: number
  amountApplied: number
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
  narrative: string
  externalReference: string
  vendorAccountId: string
  recordedByName: string
  virtualAccount?: {
    accountNumber: string
    bankName: string
    reference: string
    expiresAtUtc: string
  }
}

export interface PaymentsResponse {
  isSuccess: boolean
  message: string
  data: Payment[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaymentsRequestParams {
  id?: number
  pageNumber: number
  pageSize: number
  customerId?: number
  vendorId?: number
  agentId?: number
  postpaidBillId?: number
  paymentTypeId?: number
  channel?: PaymentChannel
  status?: PaymentStatus
  collectorType?: CollectorType
  paidFromUtc?: string
  paidToUtc?: string
  search?: string
}

export interface CreateAgentPaymentRequest {
  postpaidBillId?: number
  customerId?: number
  paymentTypeId: number
  amount: number
  channel: PaymentChannel
  currency: string
  externalReference?: string
  narrative?: string
  paidAtUtc: string
  collectorType: CollectorType
}

export interface AgentPaymentResponse {
  isSuccess: boolean
  message: string
  data: Payment
}

// ========== BILL LOOKUP INTERFACES ==========

// Interfaces for Bill Lookup
export enum BillCategory {
  Postpaid = 1,
  Prepaid = 2,
  Mixed = 3,
}

export enum BillStatus {
  Generated = 0,
  Issued = 1,
  Paid = 2,
  PartiallyPaid = 3,
  Overdue = 4,
  Cancelled = 5,
  Disputed = 6,
}

export enum AdjustmentStatus {
  NotAdjusted = 0,
  Adjusted = 1,
  AdjustmentPending = 2,
}

export enum MeterReadingValidationStatus {
  NotValidated = 0,
  Validated = 1,
  Flagged = 2,
  RequiresReview = 3,
}

export interface ActiveDispute {
  id: number
  status: number
  reason: string
  raisedAtUtc: string
}

export interface CustomerCategorySubCategory {
  id: number
  name: string
  description: string
  customerCategoryId: number
}

export interface CustomerCategory {
  id: number
  name: string
  description: string
  subCategories: CustomerCategorySubCategory[]
}

export interface TechnicalEngineerUser {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  accountId: string
  isActive: boolean
  mustChangePassword: boolean
  employeeId: string
  position: string
  employmentType: string
  employmentStartAt: string
  employmentEndAt: string
  departmentId: number
  departmentName: string
  areaOfficeId: number
  areaOfficeName: string
  lastLoginAt: string
  createdAt: string
  lastUpdated: string
}

export interface Company {
  id: number
  name: string
  nercCode: string
  nercSupplyStructure: number
}

export interface AreaOffice {
  id: number
  nameOfNewOAreaffice: string
  newKaedcoCode: string
  newNercCode: string
  oldNercCode: string
  oldKaedcoCode: string
  nameOfOldOAreaffice: string
  latitude: number
  longitude: number
  company: Company
}

export interface HtPole {
  id: number
  htPoleNumber: string
  technicalEngineerUserId: number
  technicalEngineerUser: TechnicalEngineerUser
}

export interface InjectionSubstation {
  id: number
  nercCode: string
  injectionSubstationCode: string
  technicalEngineerUserId: number
  technicalEngineerUser: TechnicalEngineerUser
  areaOffice: AreaOffice
}

export interface Feeder {
  id: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
  technicalEngineerUserId: number
  technicalEngineerUser: TechnicalEngineerUser
  injectionSubstation: InjectionSubstation
  htPole: HtPole
}

export interface DistributionSubstation {
  id: number
  oldDssCode: string
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  status: string
  technicalEngineerUserId: number
  technicalEngineerUser: TechnicalEngineerUser
  feeder: Feeder
  numberOfUnit: number
  unitOneCode: string
  unitTwoCode: string
  unitThreeCode: string
  unitFourCode: string
  publicOrDedicated: string
  remarks: string
}

export interface ServiceCenter {
  id: number
  name: string
  code: string
  address: string
  areaOfficeId: number
  areaOffice: AreaOffice
  latitude: number
  longitude: number
}

export interface AccountNumberHistory {
  oldAccountNumber: string
  newAccountNumber: string
  requestedByUserId: number
  requestedAtUtc: string
  reason: string
  oldAddress: string
  oldAddressTwo: string
  oldCity: string
  oldState: string
  oldLatitude: number
  oldLongitude: number
  newAddress: string
  newAddressTwo: string
  newCity: string
  newState: string
  newLatitude: number
  newLongitude: number
}

export interface MeterHistory {
  oldMeterNumber: string
  newMeterNumber: string
  requestedByUserId: number
  requestedAtUtc: string
  reason: string
  oldAddress: string
  oldAddressTwo: string
  oldCity: string
  oldState: string
  oldLatitude: number
  oldLongitude: number
  newAddress: string
  newAddressTwo: string
  newCity: string
  newState: string
  newLatitude: number
  newLongitude: number
}

export interface SalesRepUser {
  id: number
  fullName: string
  email: string
  phoneNumber: string
}

export interface Customer {
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
  distributionSubstationId: number
  distributionSubstationCode: string
  feederName: string
  areaOfficeName: string
  companyName: string
  address: string
  addressTwo: string
  city: string
  state: string
  lga: string
  serviceCenterId: number
  serviceCenterName: string
  latitude: number
  longitude: number
  tariff: number
  tariffCode: string
  tariffID: string
  tariffInddex: string
  tariffType: string
  tariffClass: string
  newRate: number
  vat: number
  isVATWaved: boolean
  meterNumber: string
  isPPM: boolean
  isMD: boolean
  isUrban: boolean
  isHRB: boolean
  isCustomerAccGovt: boolean
  comment: string
  band: string
  storedAverage: number
  totalMonthlyVend: number
  totalMonthlyDebt: number
  customerOutstandingDebtBalance: number
  salesRepUserId: number
  technicalEngineerUserId: number
  category: CustomerCategory
  subCategory: CustomerCategorySubCategory
  salesRepUser: SalesRepUser
  lastLoginAt: string
  suspensionReason: string
  suspendedAt: string
  distributionSubstation: DistributionSubstation
  technicalEngineerUser: SalesRepUser
  serviceCenter: ServiceCenter
  accountNumberHistory: AccountNumberHistory[]
  meterHistory: MeterHistory[]
}

export enum LedgerEntryType {
  Debit = 1,
  Credit = 2,
  Adjustment = 3,
}

export interface LedgerEntry {
  id: number
  type: LedgerEntryType
  amount: number
  code: string
  memo: string
  effectiveAtUtc: string
  referenceId: number
}

export interface BillDetails {
  id: number
  name: string
  period: string
  category: BillCategory
  status: BillStatus
  adjustmentStatus: AdjustmentStatus
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
  meterReadingValidationStatus: MeterReadingValidationStatus
  openDisputeCount: number
  activeDispute: ActiveDispute | null
  customer: Customer
  createdAt: string
  lastUpdated: string
  ledgerEntries: LedgerEntry[]
}

export interface BillLookupResponse {
  isSuccess: boolean
  message: string
  data: BillDetails
}

export interface BillLookupRequestParams {
  billNumber: string
}

// ========== END BILL LOOKUP INTERFACES ==========

// ========== CUSTOMER LOOKUP INTERFACES ==========

// Interfaces for Customer Lookup
export interface CustomerLookupDetails {
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
  distributionSubstationId: number
  distributionSubstationCode: string
  feederName: string
  areaOfficeName: string
  companyName: string
  address: string
  addressTwo: string
  city: string
  provinceId: number
  provinceName: string
  lga: string
  serviceCenterId: number
  serviceCenterName: string
  latitude: number
  longitude: number
  tariff: number
  tariffCode: string
  tariffID: string
  tariffInddex: string
  tariffType: string
  tariffClass: string
  newRate: number
  vat: number
  isVATWaved: boolean
  meterNumber: string
  isPPM: boolean
  isMD: boolean
  isUrban: boolean
  isHRB: boolean
  isCustomerAccGovt: boolean
  comment: string
  band: string
  storedAverage: number
  totalMonthlyVend: number
  totalMonthlyDebt: number
  totalLifetimeDebit: number
  totalLifetimeCredit: number
  customerOutstandingDebtBalance: number
  customerOutstandingCreditBalance: number
  customerOutstandingBalance: number
  salesRepUserId: number
  technicalEngineerUserId: number
  suspensionReason: string
  suspendedAt: string
  lastLoginAt: string
}

export interface CustomerLookupResponse {
  isSuccess: boolean
  message: string
  data: CustomerLookupDetails
}

export interface CustomerLookupRequestParams {
  reference: string
}

// ========== END CUSTOMER LOOKUP INTERFACES ==========

// ========== AGENT SUMMARY INTERFACES ==========

export enum TimeRange {
  Today = "today",
  Yesterday = "yesterday",
  ThisWeek = "thisWeek",
  ThisMonth = "thisMonth",
  LastMonth = "lastMonth",
  ThisYear = "thisYear",
  LastYear = "lastYear",
  AllTime = "allTime",
}

export interface CollectionByChannel {
  channel: PaymentChannel
  amount: number
  count: number
  percentage: number
}

export interface AgentSummaryPeriod {
  range: TimeRange
  collectedAmount: number
  collectedCount: number
  pendingAmount: number
  pendingCount: number
  cashClearedAmount: number
  cashClearanceCount: number
  billingDisputesRaised: number
  billingDisputesResolved: number
  changeRequestsRaised: number
  changeRequestsResolved: number
  outstandingCashEstimate: number
  collectionsByChannel: CollectionByChannel[]
}

export interface AgentSummaryData {
  generatedAtUtc: string
  periods: AgentSummaryPeriod[]
}

export interface AgentSummaryResponse {
  isSuccess: boolean
  message: string
  data: AgentSummaryData
}

// ========== END AGENT SUMMARY INTERFACES ==========

// ========== AGENT PERFORMANCE DAILY INTERFACES ==========

export interface AgentDailyPerformance {
  date: string
  score: number
  collectedAmount: number
  conditionalClearances: number
  declinedClearances: number
  issueCount: number
}

export interface AgentPerformanceDailyResponse {
  isSuccess: boolean
  message: string
  data: AgentDailyPerformance[]
}

export interface AgentPerformanceDailyRequestParams {
  startUtc: string
  endUtc: string
}

// ========== END AGENT PERFORMANCE DAILY INTERFACES ==========

// ========== PAYMENT CHANNELS INTERFACES ==========

export interface PaymentChannelsData {
  channels: PaymentChannel[]
  message: string
  cashAtHand: number
  cashCollectionLimit: number
  maxSingleAllowedCashAmount: number
}

export interface PaymentChannelsResponse {
  isSuccess: boolean
  message: string
  data: PaymentChannelsData
}

export interface PaymentChannelsRequestParams {
  amount: number
}

// ========== END PAYMENT CHANNELS INTERFACES ==========

// ========== VEND INTERFACES ==========

export interface VendRequest {
  meterNumber: string
  amount: number
  paymentTypeId: number
  channel: string
  latitude: number
  longitude: number
  externalReference: string
  narrative: string
}

export interface Token {
  token: string
  tokenDec: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

export interface VirtualAccount {
  accountNumber: string
  bankName: string
  reference: string
  expiresAtUtc: string
}

export interface VendPayment {
  id: number
  reference: string
  latitude: number
  longitude: number
  channel: string
  status: string
  collectorType: string
  amount: number
  amountApplied: number
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
  tokens: Token[]
  narrative: string
  externalReference: string
  virtualAccount: VirtualAccount
  vendorAccountId: string
  recordedByName: string
}

export interface VendData {
  isPending: boolean
  payment: VendPayment
  token: Token
  reference?: string
  totalAmountPaid?: number
  currency?: string
  customerName?: string
  customerAccountNumber?: string
  customerAddress?: string
  customerPhoneNumber?: string
  customerMeterNumber?: string
  accountType?: string
  tariffRate?: number
  units?: number
  vatRate?: number
  vatAmount?: number
  electricityAmount?: number
  outstandingDebt?: number
  debtPayable?: number
  status?: string
  paymentTypeName?: string
  channel?: string
  paidAtUtc?: string
  externalReference?: string
  paymentDetails?: {
    virtualAccount?: string
  }
}

export interface VendResponse {
  isSuccess: boolean
  message: string
  data: VendData
}

// ========== END VEND INTERFACES ==========

// ========== CHECK PAYMENT INTERFACES ==========

export interface CheckPaymentRequest {
  reference: string
}

// Interface for Confirm Payment Request
export interface ConfirmPaymentRequest {
  // Add any required fields for the confirm payment request
  // This might be empty or contain specific fields based on API requirements
}

export interface CheckPaymentData {
  id: number
  reference: string
  status: string
  amount: number
  currency: string
  customerName: string
  customerAccountNumber: string
  customerAddress?: string
  customerPhoneNumber?: string
  customerMeterNumber?: string
  accountType?: string
  tariffRate?: number
  units?: number
  vatRate?: number
  vatAmount?: number
  electricityAmount?: number
  outstandingDebt?: number
  debtPayable?: number
  totalAmountPaid?: number
  channel: string
  paidAtUtc: string
  confirmedAtUtc?: string
  externalReference?: string
  paymentTypeName?: string
  token?: Token
  isPending: boolean
}

export interface CheckPaymentResponse {
  isSuccess: boolean
  message: string
  data: CheckPaymentData
}

// ========== END CHECK PAYMENT INTERFACES ==========

// Agent State
interface AgentState {
  // Current logged-in agent info state
  agentInfo: AgentInfo | null
  agentInfoLoading: boolean
  agentInfoError: string | null
  agentInfoSuccess: boolean

  // Agent summary state
  agentSummary: AgentSummaryData | null
  agentSummaryLoading: boolean
  agentSummaryError: string | null
  agentSummarySuccess: boolean

  // Agent daily performance state
  agentPerformanceDaily: AgentDailyPerformance[]
  agentPerformanceDailyLoading: boolean
  agentPerformanceDailyError: string | null
  agentPerformanceDailySuccess: boolean

  // Payment channels state
  paymentChannels: PaymentChannelsData | null
  paymentChannelsLoading: boolean
  paymentChannelsError: string | null
  paymentChannelsSuccess: boolean

  // Vend state
  vendData: VendData | null
  vendLoading: boolean
  vendError: string | null
  vendSuccess: boolean

  // Check Payment state
  checkPaymentData: CheckPaymentData | null
  checkPaymentLoading: boolean
  checkPaymentError: string | null
  checkPaymentSuccess: boolean

  // Agents list state
  agents: Agent[]
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

  // Current agent state (for viewing/editing)
  currentAgent: Agent | null
  currentAgentLoading: boolean
  currentAgentError: string | null

  // Add agent state
  addAgentLoading: boolean
  addAgentError: string | null
  addAgentSuccess: boolean
  newlyAddedAgent: Agent | null

  // Add existing user as agent state
  addExistingUserAsAgentLoading: boolean
  addExistingUserAsAgentError: string | null
  addExistingUserAsAgentSuccess: boolean
  newlyAddedExistingUserAgent: Agent | null

  // Clear Cash state
  clearCashLoading: boolean
  clearCashError: string | null
  clearCashSuccess: boolean
  clearCashResponse: ClearCashResponseData | null

  // Agent Clear Cash state
  agentClearCashLoading: boolean
  agentClearCashError: string | null
  agentClearCashSuccess: boolean
  agentClearCashResponse: ClearCashResponseData | null

  // Approve Clearance state
  approveClearanceLoading: boolean
  approveClearanceError: string | null
  approveClearanceSuccess: boolean
  approveClearanceResponse: ApproveClearanceResponseData | null

  // Change Request state
  changeRequestLoading: boolean
  changeRequestError: string | null
  changeRequestSuccess: boolean
  changeRequestResponse: ChangeRequestResponseData | null

  // Change Requests By Agent ID state
  changeRequestsByAgent: ChangeRequestListItem[]
  changeRequestsByAgentLoading: boolean
  changeRequestsByAgentError: string | null
  changeRequestsByAgentSuccess: boolean
  changeRequestsByAgentPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

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

  // Clearances state
  clearances: CashClearance[]
  clearancesLoading: boolean
  clearancesError: string | null
  clearancesSuccess: boolean
  clearancesPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Payments state
  payments: Payment[]
  paymentsLoading: boolean
  paymentsError: string | null
  paymentsSuccess: boolean
  paymentsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  confirmPaymentLoading: boolean
  confirmPaymentError: string | null
  confirmPaymentSuccess: boolean

  // Create payment state
  createPaymentLoading: boolean
  createPaymentError: string | null
  createPaymentSuccess: boolean
  createdPayment: Payment | null

  // Bill Lookup state
  billLookup: BillDetails | null
  billLookupLoading: boolean
  billLookupError: string | null
  billLookupSuccess: boolean

  // Customer Lookup state
  customerLookup: CustomerLookupDetails | null
  customerLookupLoading: boolean
  customerLookupError: string | null
  customerLookupSuccess: boolean
}

// Initial state
const initialState: AgentState = {
  // Agent Info initial state
  agentInfo: null,
  agentInfoLoading: false,
  agentInfoError: null,
  agentInfoSuccess: false,

  // Agent Summary initial state
  agentSummary: null,
  agentSummaryLoading: false,
  agentSummaryError: null,
  agentSummarySuccess: false,

  // Agent Daily Performance initial state
  agentPerformanceDaily: [],
  agentPerformanceDailyLoading: false,
  agentPerformanceDailyError: null,
  agentPerformanceDailySuccess: false,

  // Payment Channels initial state
  paymentChannels: null,
  paymentChannelsLoading: false,
  paymentChannelsError: null,
  paymentChannelsSuccess: false,

  // Vend initial state
  vendData: null,
  vendLoading: false,
  vendError: null,
  vendSuccess: false,

  // Check Payment initial state
  checkPaymentData: null,
  checkPaymentLoading: false,
  checkPaymentError: null,
  checkPaymentSuccess: false,

  // Rest of the initial state
  agents: [],
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
  currentAgent: null,
  currentAgentLoading: false,
  currentAgentError: null,
  addAgentLoading: false,
  addAgentError: null,
  addAgentSuccess: false,
  newlyAddedAgent: null,
  addExistingUserAsAgentLoading: false,
  addExistingUserAsAgentError: null,
  addExistingUserAsAgentSuccess: false,
  newlyAddedExistingUserAgent: null,
  clearCashLoading: false,
  clearCashError: null,
  clearCashSuccess: false,
  clearCashResponse: null,
  agentClearCashLoading: false,
  agentClearCashError: null,
  agentClearCashSuccess: false,
  agentClearCashResponse: null,
  approveClearanceLoading: false,
  approveClearanceError: null,
  approveClearanceSuccess: false,
  approveClearanceResponse: null,
  changeRequestLoading: false,
  changeRequestError: null,
  changeRequestSuccess: false,
  changeRequestResponse: null,
  changeRequestsByAgent: [],
  changeRequestsByAgentLoading: false,
  changeRequestsByAgentError: null,
  changeRequestsByAgentSuccess: false,
  changeRequestsByAgentPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
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
  clearances: [],
  clearancesLoading: false,
  clearancesError: null,
  clearancesSuccess: false,
  clearancesPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  payments: [],
  paymentsLoading: false,
  paymentsError: null,
  paymentsSuccess: false,
  paymentsPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  confirmPaymentLoading: false,
  confirmPaymentError: null,
  confirmPaymentSuccess: false,
  createPaymentLoading: false,
  createPaymentError: null,
  createPaymentSuccess: false,
  createdPayment: null,
  // Bill Lookup initial state
  billLookup: null,
  billLookupLoading: false,
  billLookupError: null,
  billLookupSuccess: false,
  // Customer Lookup initial state
  customerLookup: null,
  customerLookupLoading: false,
  customerLookupError: null,
  customerLookupSuccess: false,
}

// Async thunks

// ========== AGENT INFO ASYNC THUNK ==========
export const fetchAgentInfo = createAsyncThunk("agents/fetchAgentInfo", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<AgentInfoResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.AGENT_INFO))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch agent info")
    }

    if (!response.data.data) {
      return rejectWithValue("Agent info not found")
    }

    return response.data.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch agent info")
    }
    return rejectWithValue(error.message || "Network error during agent info fetch")
  }
})

// ========== AGENT SUMMARY ASYNC THUNK ==========
export const fetchAgentSummary = createAsyncThunk("agents/fetchAgentSummary", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<AgentSummaryResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.AGENT_SUMMARY))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch agent summary")
    }

    if (!response.data.data) {
      return rejectWithValue("Agent summary not found")
    }

    return response.data.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch agent summary")
    }
    return rejectWithValue(error.message || "Network error during agent summary fetch")
  }
})

// ========== AGENT PERFORMANCE DAILY ASYNC THUNK ==========
export const fetchAgentPerformanceDaily = createAsyncThunk(
  "agents/fetchAgentPerformanceDaily",
  async (params: AgentPerformanceDailyRequestParams, { rejectWithValue }) => {
    try {
      const { startUtc, endUtc } = params

      const response = await api.get<AgentPerformanceDailyResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.PERFORMANCE), {
        params: {
          startUtc,
          endUtc,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch agent daily performance")
      }

      if (!response.data.data) {
        return rejectWithValue("Agent daily performance data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch agent daily performance")
      }
      return rejectWithValue(error.message || "Network error during agent daily performance fetch")
    }
  }
)

// ========== PAYMENT CHANNELS ASYNC THUNK ==========
export const fetchPaymentChannels = createAsyncThunk(
  "agents/fetchPaymentChannels",
  async (params: PaymentChannelsRequestParams, { rejectWithValue }) => {
    try {
      const { amount } = params

      const response = await api.get<PaymentChannelsResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.PAYMENT_CHANNEL), {
        params: {
          amount,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payment channels")
      }

      if (!response.data.data) {
        return rejectWithValue("Payment channels data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payment channels")
      }
      return rejectWithValue(error.message || "Network error during payment channels fetch")
    }
  }
)

export const vend = createAsyncThunk("agents/vend", async (vendData: VendRequest, { rejectWithValue }) => {
  try {
    const response = await api.post<VendResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.VEND), vendData)

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to vend")
    }

    if (!response.data.data) {
      return rejectWithValue("Vend data not found")
    }

    return response.data.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to vend")
    }
    return rejectWithValue(error.message || "Network error during vend")
  }
})

export const checkPayment = createAsyncThunk(
  "agents/checkPayment",
  async (checkPaymentData: CheckPaymentRequest, { rejectWithValue }) => {
    try {
      const response = await api.get<CheckPaymentResponse>(
        buildApiUrl(API_ENDPOINTS.AGENTS.CHECK_PAYMENT.replace("{reference}", checkPaymentData.reference))
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to check payment")
      }

      if (!response.data.data) {
        return rejectWithValue("Payment data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to check payment")
      }
      return rejectWithValue(error.message || "Network error during payment check")
    }
  }
)

// ========== BILL LOOKUP ASYNC THUNK ==========
export const lookupBill = createAsyncThunk("agents/lookupBill", async (billNumber: string, { rejectWithValue }) => {
  try {
    const response = await api.get<BillLookupResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.LOOKUP_BILL), {
      params: {
        billNumber,
      },
    })

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to lookup bill")
    }

    if (!response.data.data) {
      return rejectWithValue("Bill data not found")
    }

    return response.data.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to lookup bill")
    }
    return rejectWithValue(error.message || "Network error during bill lookup")
  }
})

export const lookupCustomer = createAsyncThunk(
  "agents/lookupCustomer",
  async (reference: string, { rejectWithValue }) => {
    try {
      const response = await api.get<CustomerLookupResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.LOOKUP_CUSTOMER), {
        params: {
          reference,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to lookup customer")
      }

      if (!response.data.data) {
        return rejectWithValue("Customer data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to lookup customer")
      }
      return rejectWithValue(error.message || "Network error during customer lookup")
    }
  }
)

export const fetchAgents = createAsyncThunk(
  "agents/fetchAgents",
  async (params: AgentsRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        search,
        status,
        canCollectCash,
        minCashAtHand,
        maxCashAtHand,
        lastCashCollectionDateFrom,
        lastCashCollectionDateTo,
        areaOfficeId,
        serviceCenterId,
        sortBy,
        sortOrder,
        AgentType,
      } = params

      const response = await api.get<AgentsResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(search && { Search: search }),
          ...(status && { Status: status }),
          ...(canCollectCash !== undefined && { CanCollectCash: canCollectCash }),
          ...(minCashAtHand !== undefined && { MinCashAtHand: minCashAtHand }),
          ...(maxCashAtHand !== undefined && { MaxCashAtHand: maxCashAtHand }),
          ...(lastCashCollectionDateFrom && { LastCashCollectionDateFrom: lastCashCollectionDateFrom }),
          ...(lastCashCollectionDateTo && { LastCashCollectionDateTo: lastCashCollectionDateTo }),
          ...(areaOfficeId !== undefined && { AreaOfficeId: areaOfficeId }),
          ...(serviceCenterId !== undefined && { ServiceCenterId: serviceCenterId }),
          ...(sortBy && { SortBy: sortBy }),
          ...(sortOrder && { SortOrder: sortOrder }),
          ...(AgentType && { AgentType }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch agents")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch agents")
      }
      return rejectWithValue(error.message || "Network error during agents fetch")
    }
  }
)

// Create Payment Async Thunk (for agents collecting payments)
export const createAgentPayment = createAsyncThunk(
  "agents/createPayment",
  async (paymentData: CreateAgentPaymentRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<AgentPaymentResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.PAYMENTS), paymentData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to record payment")
      }

      if (!response.data.data) {
        return rejectWithValue("Payment data not found")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to record payment")
      }
      return rejectWithValue(error.message || "Network error during payment creation")
    }
  }
)

export const fetchAgentById = createAsyncThunk("agents/fetchAgentById", async (id: number, { rejectWithValue }) => {
  try {
    const endpoint = API_ENDPOINTS.AGENTS.GET_BY_ID.replace("{id}", String(id))
    const response = await api.get<AgentDetailsResponse>(buildApiUrl(endpoint))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch agent details")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch agent details")
    }
    return rejectWithValue(error.message || "Network error during agent details fetch")
  }
})

export const addAgent = createAsyncThunk("agents/addAgent", async (agentData: AddAgentRequest, { rejectWithValue }) => {
  try {
    const response = await api.post<AddAgentResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.ADD), agentData)

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to add agent")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to add agent")
    }
    return rejectWithValue(error.message || "Network error during agent addition")
  }
})

export const addExistingUserAsAgent = createAsyncThunk(
  "agents/addExistingUserAsAgent",
  async (agentData: AddExistingUserAsAgentRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<AddExistingUserAsAgentResponse>(
        buildApiUrl(API_ENDPOINTS.AGENTS.ADD_EXISTING_USER),
        agentData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to add existing user as agent")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to add existing user as agent")
      }
      return rejectWithValue(error.message || "Network error during existing user agent addition")
    }
  }
)

// Clear Cash Async Thunk
export const clearCash = createAsyncThunk(
  "agents/clearCash",
  async (
    {
      id,
      clearCashData,
    }: {
      id: number
      clearCashData: ClearCashRequest
    },
    { rejectWithValue }
  ) => {
    try {
      const endpoint = API_ENDPOINTS.AGENTS.CLEAR_CASH.replace("{id}", id.toString())
      const response = await api.post<ClearCashResponse>(buildApiUrl(endpoint), clearCashData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to clear cash")
      }

      if (!response.data.data) {
        return rejectWithValue("Clear cash response data not found")
      }

      return {
        agentId: id,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to clear cash")
      }
      return rejectWithValue(error.message || "Network error during cash clearance")
    }
  }
)

// Agent Clear Cash Async Thunk
export const agentClearCash = createAsyncThunk(
  "agents/agentClearCash",
  async (clearCashData: AgentClearCashRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<ClearCashResponse>(
        buildApiUrl(API_ENDPOINTS.AGENTS.AGENT_CLEAR_CASH),
        clearCashData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to clear cash")
      }

      if (!response.data.data) {
        return rejectWithValue("Clear cash response data not found")
      }

      return {
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to clear cash")
      }
      return rejectWithValue(error.message || "Network error during cash clearance")
    }
  }
)

// Approve Clearance Async Thunk
export const approveClearance = createAsyncThunk(
  "agents/approveClearance",
  async (
    { clearanceId, requestBody }: { clearanceId: number; requestBody: ApproveClearanceRequest },
    { rejectWithValue }
  ) => {
    try {
      const endpoint = API_ENDPOINTS.AGENTS.APPROVE_CLEARANCE.replace("{clearanceId}", clearanceId.toString())
      const response = await api.post<ApproveClearanceResponse>(buildApiUrl(endpoint), requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to approve clearance")
      }

      if (!response.data.data) {
        return rejectWithValue("Approve clearance response data not found")
      }

      return {
        clearanceId,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to approve clearance")
      }
      return rejectWithValue(error.message || "Network error during clearance approval")
    }
  }
)

// Clearances Async Thunks
export const fetchClearances = createAsyncThunk(
  "agents/fetchClearances",
  async (params: ClearancesRequestParams, { rejectWithValue }) => {
    try {
      const { id, pageNumber, pageSize } = params

      const response = await api.get<ClearancesResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.CLEARANCE), {
        params: {
          id,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch clearances")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch clearances")
      }
      return rejectWithValue(error.message || "Network error during clearances fetch")
    }
  }
)

// Change Request Async Thunks
export const submitChangeRequest = createAsyncThunk(
  "agents/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.AGENTS.CHANGE_REQUEST.replace("{id}", id.toString())
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request response data not found")
      }

      return {
        agentId: id,
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

export const fetchChangeRequestsByAgentId = createAsyncThunk(
  "agents/fetchChangeRequestsByAgentId",
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

      const endpoint = API_ENDPOINTS.AGENTS.CHANGE_REQUESTS_BY_ID.replace("{id}", id.toString())
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
        return rejectWithValue(response.data.message || "Failed to fetch change requests for agent")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests for agent")
      }
      return rejectWithValue(error.message || "Network error during agent change requests fetch")
    }
  }
)

export const fetchChangeRequests = createAsyncThunk(
  "agents/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId, sortBy, sortOrder } = params

      const response = await api.get<ChangeRequestsResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.VIEW_CHANGE_REQUEST), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(status !== undefined && { Status: status }),
          ...(source !== undefined && { Source: source }),
          ...(reference && { Reference: reference }),
          ...(publicId && { PublicId: publicId }),
          ...(sortBy && { SortBy: sortBy }),
          ...(sortOrder && { SortOrder: sortOrder }),
        },
      })

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

export const fetchChangeRequestDetails = createAsyncThunk(
  "agents/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.AGENTS.CHANGE_REQUEST_DETAILS.replace("{identifier}", identifier)
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
  "agents/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.AGENTS.APPROVE_CHANGE_REQUEST.replace("{publicId}", publicId)
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
  "agents/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.AGENTS.DECLINE_CHANGE_REQUEST.replace("{publicId}", publicId)
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

// Payments Async Thunk
export const fetchPayments = createAsyncThunk(
  "agents/fetchPayments",
  async (params: PaymentsRequestParams, { rejectWithValue }) => {
    try {
      const {
        id,
        pageNumber,
        pageSize,
        customerId,
        vendorId,
        agentId,
        postpaidBillId,
        paymentTypeId,
        channel,
        status,
        collectorType,
        paidFromUtc,
        paidToUtc,
        search,
      } = params

      const response = await api.get<PaymentsResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.PAYMENTS), {
        params: {
          ...(id !== undefined && { id }),
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(customerId !== undefined && { CustomerId: customerId }),
          ...(vendorId !== undefined && { VendorId: vendorId }),
          ...(agentId !== undefined && { AgentId: agentId }),
          ...(postpaidBillId !== undefined && { PostpaidBillId: postpaidBillId }),
          ...(paymentTypeId !== undefined && { PaymentTypeId: paymentTypeId }),
          ...(channel && { Channel: channel }),
          ...(status && { Status: status }),
          ...(collectorType && { CollectorType: collectorType }),
          ...(paidFromUtc && { PaidFromUtc: paidFromUtc }),
          ...(paidToUtc && { PaidToUtc: paidToUtc }),
          ...(search && { Search: search }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payments")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payments")
      }
      return rejectWithValue(error.message || "Network error during payments fetch")
    }
  }
)

// Confirm Payment Async Thunk
export const confirmPayment = createAsyncThunk(
  "agents/confirmPayment",
  async (paymentId: number, { rejectWithValue }) => {
    try {
      const requestBody: ConfirmPaymentRequest = {} // Empty request body for now

      const response = await api.post(
        buildApiUrl(API_ENDPOINTS.PAYMENTS.CONFIRM.replace("{id}", paymentId.toString())),
        requestBody
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to confirm payment")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to confirm payment")
      }
      return rejectWithValue(error.message || "Network error during payment confirmation")
    }
  }
)

// Agent slice
const agentSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {
    // Clear agent info state
    clearAgentInfo: (state) => {
      state.agentInfo = null
      state.agentInfoError = null
      state.agentInfoSuccess = false
      state.agentInfoLoading = false
    },

    // Clear agent summary state
    clearAgentSummary: (state) => {
      state.agentSummary = null
      state.agentSummaryError = null
      state.agentSummarySuccess = false
      state.agentSummaryLoading = false
    },

    // Clear agent performance daily state
    clearAgentPerformanceDaily: (state) => {
      state.agentPerformanceDaily = []
      state.agentPerformanceDailyError = null
      state.agentPerformanceDailySuccess = false
      state.agentPerformanceDailyLoading = false
    },

    // Clear payment channels state
    clearPaymentChannels: (state) => {
      state.paymentChannels = null
      state.paymentChannelsError = null
      state.paymentChannelsSuccess = false
      state.paymentChannelsLoading = false
    },

    // Clear vend state
    clearVend: (state) => {
      state.vendData = null
      state.vendError = null
      state.vendSuccess = false
      state.vendLoading = false
    },

    // Clear check payment state
    clearCheckPayment: (state) => {
      state.checkPaymentData = null
      state.checkPaymentError = null
      state.checkPaymentSuccess = false
      state.checkPaymentLoading = false
    },

    // Set agent info (for when we get agent info from other sources)
    setAgentInfo: (state, action: PayloadAction<AgentInfo>) => {
      state.agentInfo = action.payload
      state.agentInfoSuccess = true
      state.agentInfoError = null
      state.agentInfoLoading = false
    },

    // Set agent summary (for when we get agent summary from other sources)
    setAgentSummary: (state, action: PayloadAction<AgentSummaryData>) => {
      state.agentSummary = action.payload
      state.agentSummarySuccess = true
      state.agentSummaryError = null
      state.agentSummaryLoading = false
    },

    // Set agent performance daily (for when we get agent performance daily from other sources)
    setAgentPerformanceDaily: (state, action: PayloadAction<AgentDailyPerformance[]>) => {
      state.agentPerformanceDaily = action.payload
      state.agentPerformanceDailySuccess = true
      state.agentPerformanceDailyError = null
      state.agentPerformanceDailyLoading = false
    },

    // Set payment channels (for when we get payment channels from other sources)
    setPaymentChannels: (state, action: PayloadAction<PaymentChannelsData>) => {
      state.paymentChannels = action.payload
      state.paymentChannelsSuccess = true
      state.paymentChannelsError = null
      state.paymentChannelsLoading = false
    },

    // Clear agents state
    clearAgents: (state) => {
      state.agents = []
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
      state.agentInfoError = null
      state.agentSummaryError = null
      state.agentPerformanceDailyError = null
      state.paymentChannelsError = null
      state.error = null
      state.currentAgentError = null
      state.addAgentError = null
      state.addExistingUserAsAgentError = null
      state.clearCashError = null
      state.changeRequestError = null
      state.changeRequestsByAgentError = null
      state.changeRequestsError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
      state.clearancesError = null
      state.paymentsError = null
      state.confirmPaymentError = null
      state.billLookupError = null
    },

    // Clear create payment state
    clearCreatePayment: (state) => {
      state.createPaymentLoading = false
      state.createPaymentError = null
      state.createPaymentSuccess = false
      state.createdPayment = null
    },

    // Clear current agent
    clearCurrentAgent: (state) => {
      state.currentAgent = null
      state.currentAgentError = null
    },

    // Clear add agent state
    clearAddAgent: (state) => {
      state.addAgentLoading = false
      state.addAgentError = null
      state.addAgentSuccess = false
      state.newlyAddedAgent = null
    },

    // Clear add existing user as agent state
    clearAddExistingUserAsAgent: (state) => {
      state.addExistingUserAsAgentLoading = false
      state.addExistingUserAsAgentError = null
      state.addExistingUserAsAgentSuccess = false
      state.newlyAddedExistingUserAgent = null
    },

    // Clear cash state
    clearCashStatus: (state) => {
      state.clearCashLoading = false
      state.clearCashError = null
      state.clearCashSuccess = false
      state.clearCashResponse = null
    },

    // Clear clearances state
    clearClearances: (state) => {
      state.clearances = []
      state.clearancesError = null
      state.clearancesSuccess = false
      state.clearancesPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear payments state
    clearPayments: (state) => {
      state.payments = []
      state.paymentsError = null
      state.paymentsSuccess = false
      state.paymentsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear bill lookup state
    clearBillLookup: (state) => {
      state.billLookup = null
      state.billLookupError = null
      state.billLookupSuccess = false
      state.billLookupLoading = false
    },

    clearCustomerLookup: (state) => {
      state.customerLookup = null
      state.customerLookupError = null
      state.customerLookupSuccess = false
      state.customerLookupLoading = false
    },

    // Reset agent state
    resetAgentState: (state) => {
      state.agentInfo = null
      state.agentInfoLoading = false
      state.agentInfoError = null
      state.agentInfoSuccess = false
      state.agentSummary = null
      state.agentSummaryLoading = false
      state.agentSummaryError = null
      state.agentSummarySuccess = false
      state.agentPerformanceDaily = []
      state.agentPerformanceDailyLoading = false
      state.agentPerformanceDailyError = null
      state.agentPerformanceDailySuccess = false
      state.paymentChannels = null
      state.paymentChannelsLoading = false
      state.paymentChannelsError = null
      state.paymentChannelsSuccess = false
      state.agents = []
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
      state.currentAgent = null
      state.currentAgentLoading = false
      state.currentAgentError = null
      state.addAgentLoading = false
      state.addAgentError = null
      state.addAgentSuccess = false
      state.newlyAddedAgent = null
      state.addExistingUserAsAgentLoading = false
      state.addExistingUserAsAgentError = null
      state.addExistingUserAsAgentSuccess = false
      state.newlyAddedExistingUserAgent = null
      state.clearCashLoading = false
      state.clearCashError = null
      state.clearCashSuccess = false
      state.clearCashResponse = null
      state.changeRequestLoading = false
      state.changeRequestError = null
      state.changeRequestSuccess = false
      state.changeRequestResponse = null
      state.changeRequestsByAgent = []
      state.changeRequestsByAgentLoading = false
      state.changeRequestsByAgentError = null
      state.changeRequestsByAgentSuccess = false
      state.changeRequestsByAgentPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
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
      state.clearances = []
      state.clearancesLoading = false
      state.clearancesError = null
      state.clearancesSuccess = false
      state.clearancesPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.payments = []
      state.paymentsLoading = false
      state.paymentsError = null
      state.paymentsSuccess = false
      state.paymentsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.billLookup = null
      state.billLookupLoading = false
      state.billLookupError = null
      state.billLookupSuccess = false
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set change requests pagination
    setChangeRequestsPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsPagination.currentPage = action.payload.page
      state.changeRequestsPagination.pageSize = action.payload.pageSize
    },

    // Set change requests by agent pagination
    setChangeRequestsByAgentPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsByAgentPagination.currentPage = action.payload.page
      state.changeRequestsByAgentPagination.pageSize = action.payload.pageSize
    },

    // Set clearances pagination
    setClearancesPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.clearancesPagination.currentPage = action.payload.page
      state.clearancesPagination.pageSize = action.payload.pageSize
    },

    // Set payments pagination
    setPaymentsPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.paymentsPagination.currentPage = action.payload.page
      state.paymentsPagination.pageSize = action.payload.pageSize
    },

    // Set current agent (for when we get agent data from other sources)
    setCurrentAgent: (state, action: PayloadAction<Agent>) => {
      state.currentAgent = action.payload
    },

    // Update agent in list (for optimistic updates)
    updateAgentInList: (state, action: PayloadAction<Agent>) => {
      const index = state.agents.findIndex((agent) => agent.id === action.payload.id)
      if (index !== -1) {
        state.agents[index] = action.payload
      }
    },

    // Add agent to list (optimistic update)
    addAgentToList: (state, action: PayloadAction<Agent>) => {
      state.agents.unshift(action.payload)
      state.pagination.totalCount += 1
    },

    // Remove agent from list
    removeAgentFromList: (state, action: PayloadAction<number>) => {
      state.agents = state.agents.filter((agent) => agent.id !== action.payload)
      state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1)
    },

    // Clear change request status
    clearChangeRequestStatus: (state) => {
      state.changeRequestError = null
      state.changeRequestSuccess = false
      state.changeRequestLoading = false
      state.changeRequestResponse = null
    },

    // Clear change requests by agent state
    clearChangeRequestsByAgent: (state) => {
      state.changeRequestsByAgent = []
      state.changeRequestsByAgentError = null
      state.changeRequestsByAgentSuccess = false
      state.changeRequestsByAgentPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
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

    // Update cash at hand in current agent (after clearance)
    updateCurrentAgentCashAtHand: (state, action: PayloadAction<number>) => {
      if (state.currentAgent) {
        state.currentAgent.cashAtHand = action.payload
      }
      // Also update in agents list
      const index = state.agents.findIndex((agent) => agent.id === state.currentAgent?.id)
      if (index !== -1) {
        const agent = state.agents[index]
        if (agent) {
          agent.cashAtHand = action.payload
        }
      }
    },

    // Update agent info cash at hand (after clearance)
    updateAgentInfoCashAtHand: (state, action: PayloadAction<number>) => {
      if (state.agentInfo) {
        state.agentInfo.cashAtHand = action.payload
      }
    },

    // Update agent info performance score
    updateAgentInfoPerformanceScore: (state, action: PayloadAction<number>) => {
      if (state.agentInfo) {
        state.agentInfo.monthlyPerformanceScore = action.payload
      }
    },

    // Set bill lookup data (for when we get bill data from other sources)
    setBillLookup: (state, action: PayloadAction<BillDetails>) => {
      state.billLookup = action.payload
      state.billLookupSuccess = true
      state.billLookupError = null
    },

    // Clear bill lookup data
    clearBillLookupData: (state) => {
      state.billLookup = null
      state.billLookupSuccess = false
      state.billLookupError = null
    },

    // Update agent summary after payment
    updateAgentSummaryAfterPayment: (state, action: PayloadAction<{ amount: number; channel: PaymentChannel }>) => {
      if (state.agentSummary) {
        const { amount, channel } = action.payload

        // Update all time periods that include current time
        const now = new Date()
        const currentPeriods = ["today", "thisWeek", "thisMonth", "thisYear", "allTime"]

        state.agentSummary.periods.forEach((period) => {
          if (currentPeriods.includes(period.range)) {
            // Update collected amount and count
            period.collectedAmount += amount
            period.collectedCount += 1

            // Update collections by channel
            const channelIndex = period.collectionsByChannel.findIndex((c) => c.channel === channel)
            if (channelIndex !== -1) {
              const channelEntry = period.collectionsByChannel[channelIndex]
              if (channelEntry) {
                channelEntry.amount += amount
                channelEntry.count += 1
              }
            } else {
              period.collectionsByChannel.push({
                channel,
                amount,
                count: 1,
                percentage: 0, // Will need to recalculate percentages
              })
            }

            // Recalculate percentages for all channels
            const total = period.collectionsByChannel.reduce((sum, c) => sum + c.amount, 0)
            period.collectionsByChannel.forEach((c) => {
              c.percentage = total > 0 ? (c.amount / total) * 100 : 0
            })
          }
        })
      }
    },

    // Update agent summary after cash clearance
    updateAgentSummaryAfterClearance: (state, action: PayloadAction<{ amount: number }>) => {
      if (state.agentSummary) {
        const { amount } = action.payload

        // Update all time periods that include current time
        const currentPeriods = ["today", "thisWeek", "thisMonth", "thisYear", "allTime"]

        state.agentSummary.periods.forEach((period) => {
          if (currentPeriods.includes(period.range)) {
            // Update cash cleared amount and count
            period.cashClearedAmount += amount
            period.cashClearanceCount += 1

            // Update outstanding cash estimate
            if (period.outstandingCashEstimate >= amount) {
              period.outstandingCashEstimate -= amount
            }
          }
        })
      }
    },

    // Update agent summary after change request
    updateAgentSummaryAfterChangeRequest: (state, action: PayloadAction<{ isResolved: boolean }>) => {
      if (state.agentSummary) {
        const { isResolved } = action.payload

        // Update all time periods that include current time
        const currentPeriods = ["today", "thisWeek", "thisMonth", "thisYear", "allTime"]

        state.agentSummary.periods.forEach((period) => {
          if (currentPeriods.includes(period.range)) {
            if (isResolved) {
              period.changeRequestsResolved += 1
            } else {
              period.changeRequestsRaised += 1
            }
          }
        })
      }
    },

    // Update agent performance daily after payment
    updateAgentPerformanceDailyAfterPayment: (state, action: PayloadAction<{ date: string; amount: number }>) => {
      const { date, amount } = action.payload
      const dateString = date.split("T")[0] // Get just the date part

      // Find or create entry for this date
      let entry = state.agentPerformanceDaily.find((item) => item.date.split("T")[0] === dateString)

      if (entry) {
        // Update existing entry
        entry.collectedAmount += amount
        entry.score = Math.max(0, Math.min(100, entry.score + 1)) // Increment score by 1, capped at 100
      } else {
        // Create new entry
        const newEntry: AgentDailyPerformance = {
          date,
          score: 1,
          collectedAmount: amount,
          conditionalClearances: 0,
          declinedClearances: 0,
          issueCount: 0,
        }
        state.agentPerformanceDaily.push(newEntry)
      }

      // Sort by date descending
      state.agentPerformanceDaily.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },

    // Update agent performance daily after clearance
    updateAgentPerformanceDailyAfterClearance: (
      state,
      action: PayloadAction<{ date: string; isConditional: boolean; isDeclined: boolean }>
    ) => {
      const { date, isConditional, isDeclined } = action.payload
      const dateString = date.split("T")[0] // Get just the date part

      // Find or create entry for this date
      let entry = state.agentPerformanceDaily.find((item) => item.date.split("T")[0] === dateString)

      if (entry) {
        // Update existing entry
        if (isConditional) {
          entry.conditionalClearances += 1
          entry.score = Math.max(0, entry.score - 1) // Decrement score by 1 for conditional clearance
        } else if (isDeclined) {
          entry.declinedClearances += 1
          entry.score = Math.max(0, entry.score - 2) // Decrement score by 2 for declined clearance
        } else {
          entry.score = Math.max(0, Math.min(100, entry.score + 1)) // Increment score by 1 for successful clearance
        }
      } else {
        // Create new entry
        const newEntry: AgentDailyPerformance = {
          date,
          score: isConditional ? -1 : isDeclined ? -2 : 1,
          collectedAmount: 0,
          conditionalClearances: isConditional ? 1 : 0,
          declinedClearances: isDeclined ? 1 : 0,
          issueCount: 0,
        }
        state.agentPerformanceDaily.push(newEntry)
      }

      // Sort by date descending
      state.agentPerformanceDaily.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },

    // Update agent performance daily after issue
    updateAgentPerformanceDailyAfterIssue: (state, action: PayloadAction<{ date: string }>) => {
      const { date } = action.payload
      const dateString = date.split("T")[0] // Get just the date part

      // Find or create entry for this date
      let entry = state.agentPerformanceDaily.find((item) => item.date.split("T")[0] === dateString)

      if (entry) {
        // Update existing entry
        entry.issueCount += 1
        entry.score = Math.max(0, entry.score - 1) // Decrement score by 1 for issue
      } else {
        // Create new entry
        const newEntry: AgentDailyPerformance = {
          date,
          score: -1,
          collectedAmount: 0,
          conditionalClearances: 0,
          declinedClearances: 0,
          issueCount: 1,
        }
        state.agentPerformanceDaily.push(newEntry)
      }

      // Sort by date descending
      state.agentPerformanceDaily.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },

    // Update payment channels state (for manual updates)
    updatePaymentChannels: (state, action: PayloadAction<PaymentChannel[]>) => {
      if (state.paymentChannels) {
        state.paymentChannels.channels = action.payload
      }
    },

    // Update payment channels with cash info
    updatePaymentChannelsWithCashInfo: (
      state,
      action: PayloadAction<{
        cashAtHand: number
        cashCollectionLimit: number
        maxSingleAllowedCashAmount: number
      }>
    ) => {
      if (state.paymentChannels) {
        state.paymentChannels.cashAtHand = action.payload.cashAtHand
        state.paymentChannels.cashCollectionLimit = action.payload.cashCollectionLimit
        state.paymentChannels.maxSingleAllowedCashAmount = action.payload.maxSingleAllowedCashAmount
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Agent Info cases
      .addCase(fetchAgentInfo.pending, (state) => {
        state.agentInfoLoading = true
        state.agentInfoError = null
        state.agentInfoSuccess = false
        state.agentInfo = null
      })
      .addCase(fetchAgentInfo.fulfilled, (state, action: PayloadAction<AgentInfo>) => {
        state.agentInfoLoading = false
        state.agentInfoSuccess = true
        state.agentInfo = action.payload
        state.agentInfoError = null
      })
      .addCase(fetchAgentInfo.rejected, (state, action) => {
        state.agentInfoLoading = false
        state.agentInfoError = (action.payload as string) || "Failed to fetch agent info"
        state.agentInfoSuccess = false
        state.agentInfo = null
      })

      // Agent Summary cases
      .addCase(fetchAgentSummary.pending, (state) => {
        state.agentSummaryLoading = true
        state.agentSummaryError = null
        state.agentSummarySuccess = false
        state.agentSummary = null
      })
      .addCase(fetchAgentSummary.fulfilled, (state, action: PayloadAction<AgentSummaryData>) => {
        state.agentSummaryLoading = false
        state.agentSummarySuccess = true
        state.agentSummary = action.payload
        state.agentSummaryError = null
      })
      .addCase(fetchAgentSummary.rejected, (state, action) => {
        state.agentSummaryLoading = false
        state.agentSummaryError = (action.payload as string) || "Failed to fetch agent summary"
        state.agentSummarySuccess = false
        state.agentSummary = null
      })

      // Agent Performance Daily cases
      .addCase(fetchAgentPerformanceDaily.pending, (state) => {
        state.agentPerformanceDailyLoading = true
        state.agentPerformanceDailyError = null
        state.agentPerformanceDailySuccess = false
        state.agentPerformanceDaily = []
      })
      .addCase(fetchAgentPerformanceDaily.fulfilled, (state, action: PayloadAction<AgentDailyPerformance[]>) => {
        state.agentPerformanceDailyLoading = false
        state.agentPerformanceDailySuccess = true
        state.agentPerformanceDaily = action.payload
        state.agentPerformanceDailyError = null
      })
      .addCase(fetchAgentPerformanceDaily.rejected, (state, action) => {
        state.agentPerformanceDailyLoading = false
        state.agentPerformanceDailyError = (action.payload as string) || "Failed to fetch agent daily performance"
        state.agentPerformanceDailySuccess = false
        state.agentPerformanceDaily = []
      })

      // Payment Channels cases
      .addCase(fetchPaymentChannels.pending, (state) => {
        state.paymentChannelsLoading = true
        state.paymentChannelsError = null
        state.paymentChannelsSuccess = false
        state.paymentChannels = null
      })
      .addCase(fetchPaymentChannels.fulfilled, (state, action: PayloadAction<PaymentChannelsData>) => {
        state.paymentChannelsLoading = false
        state.paymentChannelsSuccess = true
        state.paymentChannels = action.payload
        state.paymentChannelsError = null
      })
      .addCase(fetchPaymentChannels.rejected, (state, action) => {
        state.paymentChannelsLoading = false
        state.paymentChannelsError = (action.payload as string) || "Failed to fetch payment channels"
        state.paymentChannelsSuccess = false
        state.paymentChannels = null
      })

      // Vend cases
      .addCase(vend.pending, (state) => {
        state.vendLoading = true
        state.vendError = null
        state.vendSuccess = false
        state.vendData = null
      })
      .addCase(vend.fulfilled, (state, action: PayloadAction<VendData>) => {
        state.vendLoading = false
        state.vendSuccess = true
        state.vendData = action.payload
        state.vendError = null
      })
      .addCase(vend.rejected, (state, action) => {
        state.vendLoading = false
        state.vendError = (action.payload as string) || "Failed to vend"
        state.vendSuccess = false
        state.vendData = null
      })
      .addCase(checkPayment.pending, (state) => {
        state.checkPaymentLoading = true
        state.checkPaymentError = null
        state.checkPaymentSuccess = false
        state.checkPaymentData = null
      })
      .addCase(checkPayment.fulfilled, (state, action: PayloadAction<CheckPaymentData>) => {
        state.checkPaymentLoading = false
        state.checkPaymentSuccess = true
        state.checkPaymentData = action.payload
        state.checkPaymentError = null
      })
      .addCase(checkPayment.rejected, (state, action) => {
        state.checkPaymentLoading = false
        state.checkPaymentError = (action.payload as string) || "Failed to check payment"
        state.checkPaymentSuccess = false
        state.checkPaymentData = null
      })

      // Bill Lookup cases
      .addCase(lookupBill.pending, (state) => {
        state.billLookupLoading = true
        state.billLookupError = null
        state.billLookupSuccess = false
        state.billLookup = null
      })
      .addCase(lookupBill.fulfilled, (state, action: PayloadAction<BillDetails>) => {
        state.billLookupLoading = false
        state.billLookupSuccess = true
        state.billLookup = action.payload
        state.billLookupError = null
      })
      .addCase(lookupBill.rejected, (state, action) => {
        state.billLookupLoading = false
        state.billLookupError = (action.payload as string) || "Failed to lookup bill"
        state.billLookupSuccess = false
        state.billLookup = null
      })

      // Customer Lookup cases
      .addCase(lookupCustomer.pending, (state) => {
        state.customerLookupLoading = true
        state.customerLookupError = null
        state.customerLookupSuccess = false
        state.customerLookup = null
      })
      .addCase(lookupCustomer.fulfilled, (state, action: PayloadAction<CustomerLookupDetails>) => {
        state.customerLookupLoading = false
        state.customerLookupSuccess = true
        state.customerLookup = action.payload
        state.customerLookupError = null
      })
      .addCase(lookupCustomer.rejected, (state, action) => {
        state.customerLookupLoading = false
        state.customerLookupError = (action.payload as string) || "Failed to lookup customer"
        state.customerLookupSuccess = false
        state.customerLookup = null
      })

      // Fetch agents cases
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchAgents.fulfilled, (state, action: PayloadAction<AgentsResponse>) => {
        state.loading = false
        state.success = true
        state.agents = action.payload.data
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
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch agents"
        state.success = false
        state.agents = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })

      // Fetch agent by ID cases
      .addCase(fetchAgentById.pending, (state) => {
        state.currentAgentLoading = true
        state.currentAgentError = null
      })
      .addCase(fetchAgentById.fulfilled, (state, action: PayloadAction<AgentDetailsResponse>) => {
        state.currentAgentLoading = false
        state.currentAgent = action.payload.data
        state.currentAgentError = null
      })
      .addCase(fetchAgentById.rejected, (state, action) => {
        state.currentAgentLoading = false
        state.currentAgentError = (action.payload as string) || "Failed to fetch agent details"
        state.currentAgent = null
      })

      // Add agent cases
      .addCase(addAgent.pending, (state) => {
        state.addAgentLoading = true
        state.addAgentError = null
        state.addAgentSuccess = false
        state.newlyAddedAgent = null
      })
      .addCase(addAgent.fulfilled, (state, action: PayloadAction<AddAgentResponse>) => {
        state.addAgentLoading = false
        state.addAgentSuccess = true
        state.newlyAddedAgent = action.payload.data

        // Add the new agent to the beginning of the agents list
        state.agents.unshift(action.payload.data)
        state.pagination.totalCount += 1

        // Update current agent if we're viewing the same agent
        if (state.currentAgent?.id === action.payload.data.id) {
          state.currentAgent = action.payload.data
        }

        state.addAgentError = null
      })
      .addCase(addAgent.rejected, (state, action) => {
        state.addAgentLoading = false
        state.addAgentError = (action.payload as string) || "Failed to add agent"
        state.addAgentSuccess = false
        state.newlyAddedAgent = null
      })

      // Add existing user as agent cases
      .addCase(addExistingUserAsAgent.pending, (state) => {
        state.addExistingUserAsAgentLoading = true
        state.addExistingUserAsAgentError = null
        state.addExistingUserAsAgentSuccess = false
        state.newlyAddedExistingUserAgent = null
      })
      .addCase(addExistingUserAsAgent.fulfilled, (state, action: PayloadAction<AddExistingUserAsAgentResponse>) => {
        state.addExistingUserAsAgentLoading = false
        state.addExistingUserAsAgentSuccess = true
        state.newlyAddedExistingUserAgent = action.payload.data

        // Add the new agent to the beginning of the agents list
        state.agents.unshift(action.payload.data)
        state.pagination.totalCount += 1

        // Update current agent if we're viewing the same agent
        if (state.currentAgent?.id === action.payload.data.id) {
          state.currentAgent = action.payload.data
        }

        state.addExistingUserAsAgentError = null
      })
      .addCase(addExistingUserAsAgent.rejected, (state, action) => {
        state.addExistingUserAsAgentLoading = false
        state.addExistingUserAsAgentError = (action.payload as string) || "Failed to add existing user as agent"
        state.addExistingUserAsAgentSuccess = false
        state.newlyAddedExistingUserAgent = null
      })

      // Clear cash cases
      .addCase(clearCash.pending, (state) => {
        state.clearCashLoading = true
        state.clearCashError = null
        state.clearCashSuccess = false
        state.clearCashResponse = null
      })
      .addCase(
        clearCash.fulfilled,
        (
          state,
          action: PayloadAction<{
            agentId: number
            data: ClearCashResponseData
            message: string
          }>
        ) => {
          state.clearCashLoading = false
          state.clearCashSuccess = true
          state.clearCashError = null
          state.clearCashResponse = action.payload.data

          // Update current agent's cash at hand to the new value
          if (state.currentAgent) {
            state.currentAgent.cashAtHand = action.payload.data.cashAtHandAfter
          }

          // Update agent info's cash at hand if it's the same agent
          if (state.agentInfo && state.agentInfo.agentId === action.payload.agentId) {
            state.agentInfo.cashAtHand = action.payload.data.cashAtHandAfter
          }

          // Update agent in list if exists
          const index = state.agents.findIndex((agent) => agent.id === action.payload.agentId)
          if (index !== -1) {
            const agent = state.agents[index]
            if (agent) {
              agent.cashAtHand = action.payload.data.cashAtHandAfter
            }
          }

          // Update payment channels cash info
          if (state.paymentChannels) {
            state.paymentChannels.cashAtHand = action.payload.data.cashAtHandAfter
          }

          // Add the new clearance to the clearances list
          const newClearance: CashClearance = {
            id: action.payload.data.id,
            createdAt: action.payload.data.createdAt,
            agentId: action.payload.agentId,
            requestedByUserId: action.payload.data.collectionOfficer.id,
            collectionOfficerUserId: action.payload.data.collectionOfficer.id,
            approvedByUserId: action.payload.data.clearedBy.id,
            amountCleared: action.payload.data.amountCleared,
            requestedAmountAtHand: action.payload.data.cashAtHandBefore,
            cashAtHandBefore: action.payload.data.cashAtHandBefore,
            cashAtHandAfter: action.payload.data.cashAtHandAfter,
            clearedAt: action.payload.data.clearedAt,
            approvedAtUtc: action.payload.data.clearedAt,
            status: CashClearanceStatus.Approved,
            issueFlag: 0,
            notes: action.payload.data.notes,
            collectionOfficer: action.payload.data.collectionOfficer,
            approvedBy: action.payload.data.clearedBy,
            requestedBy: action.payload.data.collectionOfficer,
            hasAmountDiscrepancy: false,
            approvalNotes: null,
            salesRep: {
              id: 0,
              fullName: "",
              email: "",
              phoneNumber: "",
              accountId: "",
              isActive: false,
              mustChangePassword: false,
              employeeId: "",
              position: "",
              employmentType: "",
              employmentStartAt: null,
              employmentEndAt: null,
              departmentId: 0,
              departmentName: null,
              areaOfficeId: 0,
              areaOfficeName: null,
              lastLoginAt: "",
              createdAt: "",
              lastUpdated: "",
            },
          }

          // Add to beginning of clearances list and update pagination
          state.clearances.unshift(newClearance)
          state.clearancesPagination.totalCount += 1

          // Update agent summary
          if (state.agentSummary) {
            const amount = action.payload.data.amountCleared
            const currentPeriods = ["today", "thisWeek", "thisMonth", "thisYear", "allTime"]

            state.agentSummary.periods.forEach((period) => {
              if (currentPeriods.includes(period.range)) {
                period.cashClearedAmount += amount
                period.cashClearanceCount += 1
              }
            })
          }

          // Update agent performance daily
          const isConditional = false // Assuming successful clearance, not conditional
          const isDeclined = false // Assuming successful clearance, not declined
          state.agentPerformanceDaily = state.agentPerformanceDaily.map((entry) => {
            const entryDate = entry.date.split("T")[0]
            const clearanceDate = action.payload.data.clearedAt.split("T")[0]
            if (entryDate === clearanceDate) {
              return {
                ...entry,
                score: Math.max(0, Math.min(100, entry.score + 1)), // Increment score by 1
              }
            }
            return entry
          })
        }
      )
      .addCase(clearCash.rejected, (state, action) => {
        state.clearCashLoading = false
        state.clearCashError = (action.payload as string) || "Failed to clear cash"
        state.clearCashSuccess = false
        state.clearCashResponse = null
      })

      // Agent clear cash cases
      .addCase(agentClearCash.pending, (state) => {
        state.agentClearCashLoading = true
        state.agentClearCashError = null
        state.agentClearCashSuccess = false
        state.agentClearCashResponse = null
      })
      .addCase(
        agentClearCash.fulfilled,
        (state, action: PayloadAction<{ data: ClearCashResponseData; message: string }>) => {
          state.agentClearCashLoading = false
          state.agentClearCashSuccess = true
          state.agentClearCashError = null
          state.agentClearCashResponse = action.payload.data
        }
      )
      .addCase(agentClearCash.rejected, (state, action) => {
        state.agentClearCashLoading = false
        state.agentClearCashError = (action.payload as string) || "Failed to clear cash"
        state.agentClearCashSuccess = false
        state.agentClearCashResponse = null
      })

      // Approve clearance cases
      .addCase(approveClearance.pending, (state) => {
        state.approveClearanceLoading = true
        state.approveClearanceError = null
        state.approveClearanceSuccess = false
        state.approveClearanceResponse = null
      })
      .addCase(
        approveClearance.fulfilled,
        (
          state,
          action: PayloadAction<{ clearanceId: number; data: ApproveClearanceResponseData; message: string }>
        ) => {
          state.approveClearanceLoading = false
          state.approveClearanceSuccess = true
          state.approveClearanceError = null
          state.approveClearanceResponse = action.payload.data

          // Update the clearance status in the clearances list
          const clearanceIndex = state.clearances.findIndex((c) => c.id === action.payload.clearanceId)
          if (clearanceIndex !== -1) {
            const clearance = state.clearances[clearanceIndex]
            if (clearance) {
              clearance.status = CashClearanceStatus.Approved
              clearance.approvedAtUtc = action.payload.data.clearedAt
            }
          }
        }
      )
      .addCase(approveClearance.rejected, (state, action) => {
        state.approveClearanceLoading = false
        state.approveClearanceError = (action.payload as string) || "Failed to approve clearance"
        state.approveClearanceSuccess = false
        state.approveClearanceResponse = null
      })

      // Fetch clearances cases
      .addCase(fetchClearances.pending, (state) => {
        state.clearancesLoading = true
        state.clearancesError = null
        state.clearancesSuccess = false
      })
      .addCase(fetchClearances.fulfilled, (state, action: PayloadAction<ClearancesResponse>) => {
        state.clearancesLoading = false
        state.clearancesSuccess = true
        state.clearances = action.payload.data || []
        state.clearancesPagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.clearancesError = null
      })
      .addCase(fetchClearances.rejected, (state, action) => {
        state.clearancesLoading = false
        state.clearancesError = (action.payload as string) || "Failed to fetch clearances"
        state.clearancesSuccess = false
        state.clearances = []
        state.clearancesPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
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
            agentId: number
            data: ChangeRequestResponseData
            message: string
          }>
        ) => {
          state.changeRequestLoading = false
          state.changeRequestSuccess = true
          state.changeRequestError = null
          state.changeRequestResponse = action.payload.data

          // Update agent summary
          if (state.agentSummary) {
            const currentPeriods = ["today", "thisWeek", "thisMonth", "thisYear", "allTime"]

            state.agentSummary.periods.forEach((period) => {
              if (currentPeriods.includes(period.range)) {
                period.changeRequestsRaised += 1
              }
            })
          }
        }
      )
      .addCase(submitChangeRequest.rejected, (state, action) => {
        state.changeRequestLoading = false
        state.changeRequestError = (action.payload as string) || "Failed to submit change request"
        state.changeRequestSuccess = false
        state.changeRequestResponse = null
      })

      // Fetch change requests by agent ID cases
      .addCase(fetchChangeRequestsByAgentId.pending, (state) => {
        state.changeRequestsByAgentLoading = true
        state.changeRequestsByAgentError = null
        state.changeRequestsByAgentSuccess = false
      })
      .addCase(fetchChangeRequestsByAgentId.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsByAgentLoading = false
        state.changeRequestsByAgentSuccess = true
        state.changeRequestsByAgent = action.payload.data || []
        state.changeRequestsByAgentPagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.changeRequestsByAgentError = null
      })
      .addCase(fetchChangeRequestsByAgentId.rejected, (state, action) => {
        state.changeRequestsByAgentLoading = false
        state.changeRequestsByAgentError = (action.payload as string) || "Failed to fetch change requests for agent"
        state.changeRequestsByAgentSuccess = false
        state.changeRequestsByAgent = []
        state.changeRequestsByAgentPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
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

          // Update the change request in the agent-specific list if it exists
          const agentIndex = state.changeRequestsByAgent.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (agentIndex !== -1) {
            const req = state.changeRequestsByAgent[agentIndex]
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

          // Update agent summary
          if (state.agentSummary) {
            const currentPeriods = ["today", "thisWeek", "thisMonth", "thisYear", "allTime"]

            state.agentSummary.periods.forEach((period) => {
              if (currentPeriods.includes(period.range)) {
                period.changeRequestsResolved += 1
              }
            })
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

          // Update the change request in the agent-specific list if it exists
          const agentIndex = state.changeRequestsByAgent.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (agentIndex !== -1) {
            const req = state.changeRequestsByAgent[agentIndex]
            if (req) {
              req.status = 2 // Set status to DECLINED
            }
          }

          // Update change request details if it's the current one
          if (state.changeRequestDetails && state.changeRequestDetails.publicId === action.payload.publicId) {
            state.changeRequestDetails.status = 2 // Set status to DECLINED
            state.changeRequestDetails.declinedReason = action.payload.data.declinedReason
          }

          // Update agent summary (declined requests are also considered resolved)
          if (state.agentSummary) {
            const currentPeriods = ["today", "thisWeek", "thisMonth", "thisYear", "allTime"]

            state.agentSummary.periods.forEach((period) => {
              if (currentPeriods.includes(period.range)) {
                period.changeRequestsResolved += 1
              }
            })
          }
        }
      )
      .addCase(declineChangeRequest.rejected, (state, action) => {
        state.declineChangeRequestLoading = false
        state.declineChangeRequestError = (action.payload as string) || "Failed to decline change request"
        state.declineChangeRequestSuccess = false
        state.declineChangeRequestResponse = null
      })

      // Fetch payments cases
      .addCase(fetchPayments.pending, (state) => {
        state.paymentsLoading = true
        state.paymentsError = null
        state.paymentsSuccess = false
      })
      .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<PaymentsResponse>) => {
        state.paymentsLoading = false
        state.paymentsSuccess = true
        state.payments = action.payload.data || []
        state.paymentsPagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.paymentsError = null
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.paymentsLoading = false
        state.paymentsError = (action.payload as string) || "Failed to fetch payments"
        state.paymentsSuccess = false
        state.payments = []
        state.paymentsPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })

      // Confirm payment cases
      .addCase(confirmPayment.pending, (state) => {
        state.confirmPaymentLoading = true
        state.confirmPaymentError = null
        state.confirmPaymentSuccess = false
      })
      .addCase(confirmPayment.fulfilled, (state) => {
        state.confirmPaymentLoading = false
        state.confirmPaymentSuccess = true
        state.confirmPaymentError = null
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.confirmPaymentLoading = false
        state.confirmPaymentError = (action.payload as string) || "Failed to confirm payment"
        state.confirmPaymentSuccess = false
      })

      // Create payment cases
      .addCase(createAgentPayment.pending, (state) => {
        state.createPaymentLoading = true
        state.createPaymentError = null
        state.createPaymentSuccess = false
        state.createdPayment = null
      })
      .addCase(createAgentPayment.fulfilled, (state, action: PayloadAction<AgentPaymentResponse>) => {
        state.createPaymentLoading = false
        state.createPaymentSuccess = true
        state.createdPayment = action.payload.data
        state.createPaymentError = null

        // Prepend the new payment to the list
        state.payments = [action.payload.data, ...state.payments]

        // Update pagination totals if already initialised
        state.paymentsPagination.totalCount += 1
        state.paymentsPagination.totalPages = Math.ceil(
          state.paymentsPagination.totalCount / state.paymentsPagination.pageSize
        )

        // Update agent summary
        if (state.agentSummary) {
          const { amount, channel } = action.payload.data
          const currentPeriods = ["today", "thisWeek", "thisMonth", "thisYear", "allTime"]

          state.agentSummary.periods.forEach((period) => {
            if (currentPeriods.includes(period.range)) {
              // Update collected amount and count
              period.collectedAmount += amount
              period.collectedCount += 1

              // Update collections by channel
              const existingChannel = period.collectionsByChannel.find((c) => c.channel === channel)
              if (existingChannel) {
                existingChannel.amount += amount
                existingChannel.count += 1
              } else {
                period.collectionsByChannel.push({
                  channel,
                  amount,
                  count: 1,
                  percentage: 0, // Will need to recalculate percentages
                })
              }

              // Recalculate percentages for all channels
              const total = period.collectionsByChannel.reduce((sum, c) => sum + c.amount, 0)
              period.collectionsByChannel.forEach((c) => {
                c.percentage = total > 0 ? (c.amount / total) * 100 : 0
              })
            }
          })
        }

        // Update agent performance daily
        const paymentDate = action.payload.data.paidAtUtc.split("T")[0]
        const existingEntry = state.agentPerformanceDaily.find((entry) => entry.date.split("T")[0] === paymentDate)

        if (existingEntry) {
          // Update existing entry
          existingEntry.collectedAmount += action.payload.data.amount
          existingEntry.score = Math.max(0, Math.min(100, existingEntry.score + 1)) // Increment score by 1
        } else {
          // Create new entry
          const newEntry: AgentDailyPerformance = {
            date: action.payload.data.paidAtUtc,
            score: 1,
            collectedAmount: action.payload.data.amount,
            conditionalClearances: 0,
            declinedClearances: 0,
            issueCount: 0,
          }
          state.agentPerformanceDaily.push(newEntry)
          // Sort by date descending
          state.agentPerformanceDaily.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }

        // Update payment channels cash info if available
        if (state.paymentChannels) {
          state.paymentChannels.cashAtHand += action.payload.data.amount
        }

        // Update agent info cash at hand if available
        if (state.agentInfo) {
          state.agentInfo.cashAtHand += action.payload.data.amount
        }

        // Update current agent cash at hand if available
        if (state.currentAgent) {
          state.currentAgent.cashAtHand += action.payload.data.amount
        }
      })
      .addCase(createAgentPayment.rejected, (state, action) => {
        state.createPaymentLoading = false
        state.createPaymentError = (action.payload as string) || "Failed to record payment"
        state.createPaymentSuccess = false
        state.createdPayment = null
      })
  },
})

export const {
  clearAgentInfo,
  clearAgentSummary,
  clearAgentPerformanceDaily,
  clearPaymentChannels,
  clearVend,
  clearCheckPayment,
  setAgentInfo,
  setAgentSummary,
  setAgentPerformanceDaily,
  setPaymentChannels,
  clearAgents,
  clearError,
  clearCurrentAgent,
  clearAddAgent,
  clearAddExistingUserAsAgent,
  clearCashStatus,
  clearClearances,
  clearPayments,
  clearBillLookup,
  clearCustomerLookup,
  clearCreatePayment,
  resetAgentState,
  setPagination,
  setChangeRequestsPagination,
  setChangeRequestsByAgentPagination,
  setClearancesPagination,
  setPaymentsPagination,
  setCurrentAgent,
  updateAgentInList,
  addAgentToList,
  removeAgentFromList,
  clearChangeRequestStatus,
  clearChangeRequestsByAgent,
  clearChangeRequests,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
  updateCurrentAgentCashAtHand,
  updateAgentInfoCashAtHand,
  updateAgentInfoPerformanceScore,
  setBillLookup,
  clearBillLookupData,
  updateAgentSummaryAfterPayment,
  updateAgentSummaryAfterClearance,
  updateAgentSummaryAfterChangeRequest,
  updateAgentPerformanceDailyAfterPayment,
  updateAgentPerformanceDailyAfterClearance,
  updateAgentPerformanceDailyAfterIssue,
  updatePaymentChannels,
  updatePaymentChannelsWithCashInfo,
} = agentSlice.actions

export default agentSlice.reducer
