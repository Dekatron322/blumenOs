// src/lib/redux/customerSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Customer
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

export interface InjectionSubstation {
  id: number
  nercCode: string
  injectionSubstationCode: string
  technicalEngineerUserId: number
  technicalEngineerUser: TechnicalEngineerUser
  areaOffice: AreaOffice
}

export interface HtPole {
  id: number
  htPoleNumber: string
  technicalEngineerUserId: number
  technicalEngineerUser: TechnicalEngineerUser
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

export interface SalesRepUser {
  id: number
  fullName: string
  email: string
  phoneNumber: string
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
  salesRepUser: SalesRepUser
  lastLoginAt: string
  suspensionReason: string
  suspendedAt: string
  distributionSubstation: DistributionSubstation
  technicalEngineerUser: TechnicalEngineerUser
  serviceCenter: ServiceCenter
  accountNumberHistory: AccountNumberHistory[]
  meterHistory: MeterHistory[]
  createdAt?: any
}

export interface CustomerMapItem {
  id: number
  accountNumber: string
  fullName: string
  status: number
  outstanding: number
  latitude: number
  longitude: number
  state: string
  city: string
  lga: string
  feederId: number
  feederName: string
  distributionSubstationId: number
  distributionSubstationCode: string
  serviceCenterId: number
  serviceCenterName: string
  salesRepUserId: number
  salesRepName: string
}

export interface AssetMapItem {
  type: string
  id: number
  name: string
  latitude: number
  longitude: number
  feederId: number
  feederName: string
  areaOfficeId: number
  areaOfficeName: string
}

export interface CustomersMapResponse {
  customers: CustomerMapItem[]
  assets: AssetMapItem[]
}

export interface CustomersMapRequest {
  state: string
  feederId: number
  paymentStatus: number
  salesRepUserId: number
  includeCustomers: boolean
  includeAssets: boolean
}

const FALLBACK_MAP_CUSTOMERS: CustomerMapItem[] = [
  {
    id: 1,
    accountNumber: "FAKE001",
    fullName: "John Doe",
    status: 3,
    outstanding: 12000,
    latitude: 10.52,
    longitude: 7.44,
    state: "Kaduna",
    city: "Kaduna",
    lga: "Chikun",
    feederId: 533,
    feederName: "11KV ABU",
    distributionSubstationId: 1,
    distributionSubstationCode: "DSS-001",
    serviceCenterId: 1,
    serviceCenterName: "Banawa",
    salesRepUserId: 0,
    salesRepName: "N/A",
  },
  {
    id: 2,
    accountNumber: "FAKE002",
    fullName: "Jane Smith",
    status: 1,
    outstanding: 0,
    latitude: 12.00,
    longitude: 8.52,
    state: "Kano",
    city: "Kano",
    lga: "Nassarawa",
    feederId: 533,
    feederName: "11KV ABU",
    distributionSubstationId: 2,
    distributionSubstationCode: "DSS-002",
    serviceCenterId: 2,
    serviceCenterName: "Center01",
    salesRepUserId: 0,
    salesRepName: "N/A",
  },
]

const FALLBACK_MAP_ASSETS: AssetMapItem[] = [
  {
    type: "substation",
    id: 101,
    name: "Substation 1",
    latitude: 10.56,
    longitude: 7.47,
    feederId: 533,
    feederName: "11KV ABU",
    areaOfficeId: 10,
    areaOfficeName: "Banawa AO",
  },
  {
    type: "transformer",
    id: 102,
    name: "Transformer 1",
    latitude: 12.02,
    longitude: 8.50,
    feederId: 533,
    feederName: "11KV ABU",
    areaOfficeId: 11,
    areaOfficeName: "Sabon Gari AO",
  },
  {
    type: "service",
    id: 103,
    name: "Service Center",
    latitude: 9.09,
    longitude: 7.51,
    feederId: 533,
    feederName: "11KV ABU",
    areaOfficeId: 10,
    areaOfficeName: "Banawa AO",
  },
]

export interface CustomersResponse {
  isSuccess: boolean
  message: string
  data: Customer[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface CustomerResponse {
  isSuccess: boolean
  message: string
  data: Customer
}

export interface BulkCreateCustomerResponse {
  isSuccess: boolean
  message: string
  data: {
    successful: Customer[]
    failed: Array<{
      customerData: any
      error: string
    }>
  }
}

// Payment Disputes Interfaces
export interface Payment {
  id: number
  reference: string
  channel: "Cash" | "Transfer" | "Card" | "USSD" | string
  status: "Pending" | "Confirmed" | "Failed" | "Cancelled" | string
  collectorType: "Customer" | "Agent" | "Vendor" | string
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
}

export interface PaymentDispute {
  id: number
  status: "Open" | "InReview" | "Resolved" | "Rejected"
  source: "Employee" | "Customer"
  resolutionAction: string
  paymentTransactionId: number
  paymentReference: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  requestedAmount: number
  resolvedAmount: number
  reason: string
  details: string
  resolutionNotes: string
  resolvedAtUtc: string
  createdAt: string
  payment: Payment
}

export interface PaymentDisputesResponse {
  isSuccess: boolean
  message: string
  data: PaymentDispute[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface CustomersRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  status?: string
  isSuspended?: boolean
  distributionSubstationId?: number
  serviceCenterId?: number
}

export interface PaymentDisputesRequestParams {
  pageNumber: number
  pageSize: number
  customerId?: number
  paymentTransactionId?: number
  status?: "Open" | "InReview" | "Resolved" | "Rejected"
  source?: "Employee" | "Customer"
}

// Create Customer Request Interface
export interface CreateCustomerRequest {
  fullName: string
  phoneNumber: string
  email: string
  address: string
  distributionSubstationId: number
  status: string
  addressTwo?: string
  city: string
  state: string
  serviceCenterId: number
  latitude: number
  longitude: number
  tariff: number
  meterNumber: string
  isPPM: boolean
  isMD: boolean
  comment?: string
  band: string
  storedAverage: number
  totalMonthlyVend: number
  totalMonthlyDebt: number
  customerOutstandingDebtBalance: number
  salesRepUserId: number
  technicalEngineerUserId: number
}

export interface BulkCreateCustomerRequest {
  customers: CreateCustomerRequest[]
}

// Update Customer Request Interface
export interface UpdateCustomerRequest {
  fullName: string
  phoneNumber: string
  email: string
  address: string
  distributionSubstationId: number
  status: string
  addressTwo: string
  city: string
  state: string
  serviceCenterId: number
  latitude: number
  longitude: number
  tariff: number
  meterNumber: string
  isPPM: boolean
  isMD: boolean
  comment: string
  band: string
  storedAverage: number
  totalMonthlyVend: number
  totalMonthlyDebt: number
  customerOutstandingDebtBalance: number
  salesRepUserId: number
  technicalEngineerUserId: number
}

// Suspend Customer Request Interface
export interface SuspendCustomerRequest {
  reason: string
}

// Activate Customer Request Interface (empty body for activation)
export interface ActivateCustomerRequest {
  // No specific fields needed for activation, just the endpoint call
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

// Customer Lookup Interfaces
export interface CustomerLookupParams {
  reference: string
  type: string
}

export interface CustomerLookupResponse {
  isSuccess: boolean
  message: string
  data: Customer
}

// Customer State
interface CustomerState {
  // Customers list state
  customers: Customer[]
  loading: boolean
  error: string | null
  success: boolean

  // Map state
  mapCustomers: CustomerMapItem[]
  mapAssets: AssetMapItem[]
  mapLoading: boolean
  mapError: string | null
  mapSuccess: boolean

  // Pagination state
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Current customer state (for viewing/editing)
  currentCustomer: Customer | null
  currentCustomerLoading: boolean
  currentCustomerError: string | null

  // Customer lookup state
  customerLookup: Customer | null
  customerLookupLoading: boolean
  customerLookupError: string | null
  customerLookupSuccess: boolean

  // Create customer state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean
  bulkCreateResults: {
    successful: Customer[]
    failed: Array<{
      customerData: any
      error: string
    }>
  } | null

  // Update customer state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean

  // Suspend customer state
  suspendLoading: boolean
  suspendError: string | null
  suspendSuccess: boolean

  // Activate customer state
  activateLoading: boolean
  activateError: string | null
  activateSuccess: boolean

  // Payment Disputes state
  paymentDisputes: PaymentDispute[]
  paymentDisputesLoading: boolean
  paymentDisputesError: string | null
  paymentDisputesSuccess: boolean
  paymentDisputesPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

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

  // Change Requests By Customer ID state
  changeRequestsByCustomer: ChangeRequestListItem[]
  changeRequestsByCustomerLoading: boolean
  changeRequestsByCustomerError: string | null
  changeRequestsByCustomerSuccess: boolean
  changeRequestsByCustomerPagination: {
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

  // Search and filter state
  filters: {
    search: string
    status: string
    isSuspended: boolean | null
    distributionSubstationId: number | null
    serviceCenterId: number | null
  }

  // Payment disputes filters
  paymentDisputesFilters: {
    customerId: number | null
    paymentTransactionId: number | null
    status: "Open" | "InReview" | "Resolved" | "Rejected" | null
    source: "Employee" | "Customer" | null
  }
}

// Initial state
const initialState: CustomerState = {
  customers: [],
  loading: false,
  error: null,
  success: false,
  mapCustomers: [],
  mapAssets: [],
  mapLoading: false,
  mapError: null,
  mapSuccess: false,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  currentCustomer: null,
  currentCustomerLoading: false,
  currentCustomerError: null,
  customerLookup: null,
  customerLookupLoading: false,
  customerLookupError: null,
  customerLookupSuccess: false,
  createLoading: false,
  createError: null,
  createSuccess: false,
  bulkCreateResults: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  suspendLoading: false,
  suspendError: null,
  suspendSuccess: false,
  activateLoading: false,
  activateError: null,
  activateSuccess: false,
  paymentDisputes: [],
  paymentDisputesLoading: false,
  paymentDisputesError: null,
  paymentDisputesSuccess: false,
  paymentDisputesPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
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
  changeRequestsByCustomer: [],
  changeRequestsByCustomerLoading: false,
  changeRequestsByCustomerError: null,
  changeRequestsByCustomerSuccess: false,
  changeRequestsByCustomerPagination: {
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
  filters: {
    search: "",
    status: "",
    isSuspended: null,
    distributionSubstationId: null,
    serviceCenterId: null,
  },
  paymentDisputesFilters: {
    customerId: null,
    paymentTransactionId: null,
    status: null,
    source: null,
  },
}

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

// Async thunks
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (params: CustomersRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, search, status, isSuspended, distributionSubstationId, serviceCenterId } = params

      const response = await api.get<CustomersResponse>(buildApiUrl(API_ENDPOINTS.CUSTOMER.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(search && { Search: search }),
          ...(status && { Status: status }),
          ...(isSuspended !== undefined && { IsSuspended: isSuspended }),
          ...(distributionSubstationId && { DistributionSubstationId: distributionSubstationId }),
          ...(serviceCenterId && { ServiceCenterId: serviceCenterId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch customers")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch customers")
      }
      return rejectWithValue(error.message || "Network error during customers fetch")
    }
  }
)

export const fetchCustomersMap = createAsyncThunk(
  "customers/fetchCustomersMap",
  async (body: CustomersMapRequest, { rejectWithValue }) => {
    try {
      const response = await api.post(buildApiUrl(API_ENDPOINTS.CUSTOMER.MAP), body)
      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch customers map")
      }
      return response.data.data as CustomersMapResponse
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch customers map")
      }
      return rejectWithValue(error.message || "Network error during customers map fetch")
    }
  }
)

export const fetchCustomerById = createAsyncThunk<Customer, number, { rejectValue: string }>(
  "customers/fetchCustomerById",
  async (customerId: number, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.CUSTOMER.GET_BY_ID, { id: customerId })
      const response = await api.get<CustomerResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch customer")
      }

      if (!response.data.data) {
        return rejectWithValue("Customer not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch customer")
      }
      return rejectWithValue(error.message || "Network error during customer fetch")
    }
  }
)

export const lookupCustomer = createAsyncThunk(
  "customers/lookupCustomer",
  async (params: CustomerLookupParams, { rejectWithValue }) => {
    try {
      const { reference, type } = params

      const response = await api.get<CustomerLookupResponse>(buildApiUrl(API_ENDPOINTS.CUSTOMER.CUSTOMER_LOOKUP), {
        params: {
          reference,
          type,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to lookup customer")
      }

      if (!response.data.data) {
        return rejectWithValue("Customer not found")
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

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData: CreateCustomerRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CustomerResponse>(buildApiUrl(API_ENDPOINTS.CUSTOMER.ADD), customerData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create customer")
      }

      if (!response.data.data) {
        return rejectWithValue("Customer data not returned after creation")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create customer")
      }
      return rejectWithValue(error.message || "Network error during customer creation")
    }
  }
)

export const bulkCreateCustomers = createAsyncThunk(
  "customers/bulkCreateCustomers",
  async (bulkData: BulkCreateCustomerRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<BulkCreateCustomerResponse>(buildApiUrl(API_ENDPOINTS.CUSTOMER.ADD), bulkData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create customers in bulk")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create customers in bulk")
      }
      return rejectWithValue(error.message || "Network error during bulk customer creation")
    }
  }
)

export const updateCustomerById = createAsyncThunk(
  "customers/updateCustomerById",
  async ({ id, updateData }: { id: number; updateData: UpdateCustomerRequest }, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.CUSTOMER.UPDATE, { id })
      const response = await api.put<CustomerResponse>(buildApiUrl(endpoint), updateData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update customer")
      }

      if (!response.data.data) {
        return rejectWithValue("Customer data not returned after update")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update customer")
      }
      return rejectWithValue(error.message || "Network error during customer update")
    }
  }
)

export const suspendCustomer = createAsyncThunk(
  "customers/suspendCustomer",
  async ({ id, suspendData }: { id: number; suspendData: SuspendCustomerRequest }, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.CUSTOMER.SUSPEND, { id })
      const response = await api.post<CustomerResponse>(buildApiUrl(endpoint), suspendData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to suspend customer")
      }

      if (!response.data.data) {
        return rejectWithValue("Customer data not returned after suspension")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to suspend customer")
      }
      return rejectWithValue(error.message || "Network error during customer suspension")
    }
  }
)

export const activateCustomer = createAsyncThunk(
  "customers/activateCustomer",
  async (id: number, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.CUSTOMER.ACTIVATE, { id })
      const response = await api.post<CustomerResponse>(buildApiUrl(endpoint), {})

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to activate customer")
      }

      if (!response.data.data) {
        return rejectWithValue("Customer data not returned after activation")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to activate customer")
      }
      return rejectWithValue(error.message || "Network error during customer activation")
    }
  }
)

// Payment Disputes Async Thunks
export const fetchPaymentDisputes = createAsyncThunk(
  "customers/fetchPaymentDisputes",
  async (params: PaymentDisputesRequestParams & { customerId: number }, { rejectWithValue }) => {
    try {
      const { customerId, pageNumber, pageSize, paymentTransactionId, status, source } = params

      const endpoint = buildEndpointWithParams(API_ENDPOINTS.CUSTOMER.PAYMENT_DISPUTE, { id: customerId })

      const response = await api.get<PaymentDisputesResponse>(buildApiUrl(endpoint), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(paymentTransactionId && { PaymentTransactionId: paymentTransactionId }),
          ...(status && { Status: status }),
          ...(source && { Source: source }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch payment disputes")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch payment disputes")
      }
      return rejectWithValue(error.message || "Network error during payment disputes fetch")
    }
  }
)

// Change Request Async Thunks
export const submitChangeRequest = createAsyncThunk(
  "customers/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.CUSTOMER.CHANGE_REQUEST, { id })
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request response data not found")
      }

      return {
        customerId: id,
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
  "customers/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const response = await api.get<ChangeRequestsResponse>(buildApiUrl(API_ENDPOINTS.CUSTOMER.VIEW_CHANGE_REQUEST), {
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

export const fetchChangeRequestsByCustomerId = createAsyncThunk(
  "customers/fetchChangeRequestsByCustomerId",
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

      const endpoint = buildEndpointWithParams(API_ENDPOINTS.CUSTOMER.CHANGE_REQUESTS_BY_ID, { id })
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
        return rejectWithValue(response.data.message || "Failed to fetch change requests for customer")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests for customer")
      }
      return rejectWithValue(error.message || "Network error during customer change requests fetch")
    }
  }
)

export const fetchChangeRequestDetails = createAsyncThunk(
  "customers/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.CUSTOMER.CHANGE_REQUEST_DETAILS, { identifier })
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
  "customers/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.CUSTOMER.APPROVE_CHANGE_REQUEST, { publicId })
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
  "customers/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.CUSTOMER.DECLINE_CHANGE_REQUEST, { publicId })
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

// Customer slice
const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    // Clear customers state
    clearCustomers: (state) => {
      state.customers = []
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
      state.currentCustomerError = null
      state.customerLookupError = null
      state.createError = null
      state.updateError = null
      state.suspendError = null
      state.activateError = null
      state.paymentDisputesError = null
      state.changeRequestError = null
      state.changeRequestsError = null
      state.changeRequestsByCustomerError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
    },

    // Clear current customer
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null
      state.currentCustomerError = null
    },

    // Clear customer lookup
    clearCustomerLookup: (state) => {
      state.customerLookup = null
      state.customerLookupError = null
      state.customerLookupLoading = false
      state.customerLookupSuccess = false
    },

    // Reset customer state
    resetCustomerState: (state) => {
      state.customers = []
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
      state.currentCustomer = null
      state.currentCustomerLoading = false
      state.currentCustomerError = null
      state.customerLookup = null
      state.customerLookupLoading = false
      state.customerLookupError = null
      state.customerLookupSuccess = false
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
      state.bulkCreateResults = null
      state.updateLoading = false
      state.updateError = null
      state.updateSuccess = false
      state.suspendLoading = false
      state.suspendError = null
      state.suspendSuccess = false
      state.activateLoading = false
      state.activateError = null
      state.activateSuccess = false
      state.paymentDisputes = []
      state.paymentDisputesLoading = false
      state.paymentDisputesError = null
      state.paymentDisputesSuccess = false
      state.paymentDisputesPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
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
      state.changeRequestsByCustomer = []
      state.changeRequestsByCustomerLoading = false
      state.changeRequestsByCustomerError = null
      state.changeRequestsByCustomerSuccess = false
      state.changeRequestsByCustomerPagination = {
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
      state.filters = {
        search: "",
        status: "",
        isSuspended: null,
        distributionSubstationId: null,
        serviceCenterId: null,
      }
      state.paymentDisputesFilters = {
        customerId: null,
        paymentTransactionId: null,
        status: null,
        source: null,
      }
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set payment disputes pagination
    setPaymentDisputesPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.paymentDisputesPagination.currentPage = action.payload.page
      state.paymentDisputesPagination.pageSize = action.payload.pageSize
    },

    // Set change requests pagination
    setChangeRequestsPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsPagination.currentPage = action.payload.page
      state.changeRequestsPagination.pageSize = action.payload.pageSize
    },

    // Set change requests by customer pagination
    setChangeRequestsByCustomerPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsByCustomerPagination.currentPage = action.payload.page
      state.changeRequestsByCustomerPagination.pageSize = action.payload.pageSize
    },

    // Set current customer (for forms, etc.)
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload
    },

    // Set filters
    setFilters: (state, action: PayloadAction<Partial<CustomerState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    // Set payment disputes filters
    setPaymentDisputesFilters: (state, action: PayloadAction<Partial<CustomerState["paymentDisputesFilters"]>>) => {
      state.paymentDisputesFilters = { ...state.paymentDisputesFilters, ...action.payload }
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        search: "",
        status: "",
        isSuspended: null,
        distributionSubstationId: null,
        serviceCenterId: null,
      }
    },

    // Clear payment disputes filters
    clearPaymentDisputesFilters: (state) => {
      state.paymentDisputesFilters = {
        customerId: null,
        paymentTransactionId: null,
        status: null,
        source: null,
      }
    },

    // Add a new customer to the list (for optimistic updates)
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.unshift(action.payload)
      state.pagination.totalCount += 1
    },

    // Update a customer in the list
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex((customer) => customer.id === action.payload.id)
      if (index !== -1) {
        state.customers[index] = action.payload
      }
      // Also update current customer if it's the same
      if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
        state.currentCustomer = action.payload
      }
    },

    // Remove a customer from the list
    removeCustomer: (state, action: PayloadAction<number>) => {
      state.customers = state.customers.filter((customer) => customer.id !== action.payload)
      state.pagination.totalCount -= 1
      // Clear current customer if it's the same
      if (state.currentCustomer && state.currentCustomer.id === action.payload) {
        state.currentCustomer = null
      }
    },

    // Update customer suspension status
    updateCustomerSuspension: (
      state,
      action: PayloadAction<{ id: number; isSuspended: boolean; suspensionReason?: string; suspendedAt?: string }>
    ) => {
      const customer = state.customers.find((c) => c.id === action.payload.id)
      if (customer) {
        customer.isSuspended = action.payload.isSuspended
        if (action.payload.suspensionReason) {
          customer.suspensionReason = action.payload.suspensionReason
        }
        if (action.payload.suspendedAt) {
          customer.suspendedAt = action.payload.suspendedAt
        }
      }
      if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
        state.currentCustomer.isSuspended = action.payload.isSuspended
        if (action.payload.suspensionReason) {
          state.currentCustomer.suspensionReason = action.payload.suspensionReason
        }
        if (action.payload.suspendedAt) {
          state.currentCustomer.suspendedAt = action.payload.suspendedAt
        }
      }
    },

    // Update customer status
    updateCustomerStatus: (state, action: PayloadAction<{ id: number; status: string }>) => {
      const customer = state.customers.find((c) => c.id === action.payload.id)
      if (customer) {
        customer.status = action.payload.status
      }
      if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
        state.currentCustomer.status = action.payload.status
      }
    },

    // Update customer last login
    updateCustomerLastLogin: (state, action: PayloadAction<{ id: number; lastLoginAt: string }>) => {
      const customer = state.customers.find((c) => c.id === action.payload.id)
      if (customer) {
        customer.lastLoginAt = action.payload.lastLoginAt
      }
      if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
        state.currentCustomer.lastLoginAt = action.payload.lastLoginAt
      }
    },

    // Update customer meter information
    updateCustomerMeterInfo: (
      state,
      action: PayloadAction<{ id: number; meterNumber: string; isPPM: boolean; isMD: boolean; band: string }>
    ) => {
      const customer = state.customers.find((c) => c.id === action.payload.id)
      if (customer) {
        customer.meterNumber = action.payload.meterNumber
        customer.isPPM = action.payload.isPPM
        customer.isMD = action.payload.isMD
        customer.band = action.payload.band
      }
      if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
        state.currentCustomer.meterNumber = action.payload.meterNumber
        state.currentCustomer.isPPM = action.payload.isPPM
        state.currentCustomer.isMD = action.payload.isMD
        state.currentCustomer.band = action.payload.band
      }
    },

    // Update customer financial information
    updateCustomerFinancialInfo: (
      state,
      action: PayloadAction<{
        id: number
        storedAverage: number
        totalMonthlyVend: number
        totalMonthlyDebt: number
        customerOutstandingDebtBalance: number
      }>
    ) => {
      const customer = state.customers.find((c) => c.id === action.payload.id)
      if (customer) {
        customer.storedAverage = action.payload.storedAverage
        customer.totalMonthlyVend = action.payload.totalMonthlyVend
        customer.totalMonthlyDebt = action.payload.totalMonthlyDebt
        customer.customerOutstandingDebtBalance = action.payload.customerOutstandingDebtBalance
      }
      if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
        state.currentCustomer.storedAverage = action.payload.storedAverage
        state.currentCustomer.totalMonthlyVend = action.payload.totalMonthlyVend
        state.currentCustomer.totalMonthlyDebt = action.payload.totalMonthlyDebt
        state.currentCustomer.customerOutstandingDebtBalance = action.payload.customerOutstandingDebtBalance
      }
    },

    // Clear create state
    clearCreateState: (state) => {
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
      state.bulkCreateResults = null
    },

    // Clear update state
    clearUpdateState: (state) => {
      state.updateLoading = false
      state.updateError = null
      state.updateSuccess = false
    },

    // Clear suspend state
    clearSuspendState: (state) => {
      state.suspendLoading = false
      state.suspendError = null
      state.suspendSuccess = false
    },

    // Clear activate state
    clearActivateState: (state) => {
      state.activateLoading = false
      state.activateError = null
      state.activateSuccess = false
    },

    // Clear payment disputes state
    clearPaymentDisputesState: (state) => {
      state.paymentDisputes = []
      state.paymentDisputesLoading = false
      state.paymentDisputesError = null
      state.paymentDisputesSuccess = false
      state.paymentDisputesPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Add payment dispute
    addPaymentDispute: (state, action: PayloadAction<PaymentDispute>) => {
      state.paymentDisputes.unshift(action.payload)
      state.paymentDisputesPagination.totalCount += 1
    },

    // Update payment dispute
    updatePaymentDispute: (state, action: PayloadAction<PaymentDispute>) => {
      const index = state.paymentDisputes.findIndex((dispute) => dispute.id === action.payload.id)
      if (index !== -1) {
        state.paymentDisputes[index] = action.payload
      }
    },

    // Remove payment dispute
    removePaymentDispute: (state, action: PayloadAction<number>) => {
      state.paymentDisputes = state.paymentDisputes.filter((dispute) => dispute.id !== action.payload)
      state.paymentDisputesPagination.totalCount -= 1
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

    // Clear change requests by customer state
    clearChangeRequestsByCustomer: (state) => {
      state.changeRequestsByCustomer = []
      state.changeRequestsByCustomerError = null
      state.changeRequestsByCustomerSuccess = false
      state.changeRequestsByCustomerPagination = {
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers cases
      // Fetch customers map cases
      .addCase(fetchCustomersMap.pending, (state) => {
        state.mapLoading = true
        state.mapError = null
        state.mapSuccess = false
      })
      .addCase(fetchCustomersMap.fulfilled, (state, action: PayloadAction<CustomersMapResponse>) => {
        state.mapLoading = false
        const customers = (action.payload.customers || []).filter(
          (c) => typeof c.latitude === "number" && typeof c.longitude === "number"
        )
        const assets = (action.payload.assets || []).filter(
          (a) => typeof a.latitude === "number" && typeof a.longitude === "number"
        )
        if (customers.length === 0 && assets.length === 0) {
          state.mapCustomers = FALLBACK_MAP_CUSTOMERS
          state.mapAssets = FALLBACK_MAP_ASSETS
          state.mapSuccess = false
        } else {
          state.mapCustomers = customers
          state.mapAssets = assets
          state.mapSuccess = true
        }
        state.mapError = null
      })
      .addCase(fetchCustomersMap.rejected, (state, action) => {
        state.mapLoading = false
        state.mapError = (action.payload as string) || "Failed to fetch customers map"
        state.mapSuccess = false
        state.mapCustomers = FALLBACK_MAP_CUSTOMERS
        state.mapAssets = FALLBACK_MAP_ASSETS
      })
      // Fetch customers cases
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<CustomersResponse>) => {
        state.loading = false
        state.success = true
        state.customers = action.payload.data
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
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch customers"
        state.success = false
        state.customers = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch customer by ID cases
      .addCase(fetchCustomerById.pending, (state) => {
        state.currentCustomerLoading = true
        state.currentCustomerError = null
      })
      .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.currentCustomerLoading = false
        state.currentCustomer = action.payload
        state.currentCustomerError = null
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.currentCustomerLoading = false
        state.currentCustomerError = (action.payload as string) || "Failed to fetch customer"
        state.currentCustomer = null
      })
      // Lookup customer cases
      .addCase(lookupCustomer.pending, (state) => {
        state.customerLookupLoading = true
        state.customerLookupError = null
        state.customerLookupSuccess = false
      })
      .addCase(lookupCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
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
      // Create customer cases
      .addCase(createCustomer.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.createLoading = false
        state.createSuccess = true

        // Add the new customer to the beginning of the list
        state.customers.unshift(action.payload)
        state.pagination.totalCount += 1

        state.createError = null
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create customer"
        state.createSuccess = false
      })
      // Bulk create customers cases
      .addCase(bulkCreateCustomers.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
        state.bulkCreateResults = null
      })
      .addCase(bulkCreateCustomers.fulfilled, (state, action) => {
        state.createLoading = false
        state.createSuccess = true
        state.bulkCreateResults = action.payload

        // Add successful customers to the list
        if (action.payload.successful && action.payload.successful.length > 0) {
          state.customers.unshift(...action.payload.successful)
          state.pagination.totalCount += action.payload.successful.length
        }

        state.createError = null
      })
      .addCase(bulkCreateCustomers.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create customers in bulk"
        state.createSuccess = false
        state.bulkCreateResults = null
      })
      // Update customer by ID cases
      .addCase(updateCustomerById.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateCustomerById.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.updateLoading = false
        state.updateSuccess = true

        // Update the customer in the list
        const index = state.customers.findIndex((customer) => customer.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }

        // Update current customer if it's the same
        if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
          state.currentCustomer = action.payload
        }

        state.updateError = null
      })
      .addCase(updateCustomerById.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update customer"
        state.updateSuccess = false
      })
      // Suspend customer cases
      .addCase(suspendCustomer.pending, (state) => {
        state.suspendLoading = true
        state.suspendError = null
        state.suspendSuccess = false
      })
      .addCase(suspendCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.suspendLoading = false
        state.suspendSuccess = true

        // Update the customer in the list
        const index = state.customers.findIndex((customer) => customer.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }

        // Update current customer if it's the same
        if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
          state.currentCustomer = action.payload
        }

        state.suspendError = null
      })
      .addCase(suspendCustomer.rejected, (state, action) => {
        state.suspendLoading = false
        state.suspendError = (action.payload as string) || "Failed to suspend customer"
        state.suspendSuccess = false
      })
      // Activate customer cases
      .addCase(activateCustomer.pending, (state) => {
        state.activateLoading = true
        state.activateError = null
        state.activateSuccess = false
      })
      .addCase(activateCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.activateLoading = false
        state.activateSuccess = true

        // Update the customer in the list
        const index = state.customers.findIndex((customer) => customer.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }

        // Update current customer if it's the same
        if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
          state.currentCustomer = action.payload
        }

        state.activateError = null
      })
      .addCase(activateCustomer.rejected, (state, action) => {
        state.activateLoading = false
        state.activateError = (action.payload as string) || "Failed to activate customer"
        state.activateSuccess = false
      })
      // Fetch payment disputes cases
      .addCase(fetchPaymentDisputes.pending, (state) => {
        state.paymentDisputesLoading = true
        state.paymentDisputesError = null
        state.paymentDisputesSuccess = false
      })
      .addCase(fetchPaymentDisputes.fulfilled, (state, action: PayloadAction<PaymentDisputesResponse>) => {
        state.paymentDisputesLoading = false
        state.paymentDisputesSuccess = true
        state.paymentDisputes = action.payload.data
        state.paymentDisputesPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
        state.paymentDisputesError = null
      })
      .addCase(fetchPaymentDisputes.rejected, (state, action) => {
        state.paymentDisputesLoading = false
        state.paymentDisputesError = (action.payload as string) || "Failed to fetch payment disputes"
        state.paymentDisputesSuccess = false
        state.paymentDisputes = []
        state.paymentDisputesPagination = {
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
            customerId: number
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
      // Fetch change requests by customer ID cases
      .addCase(fetchChangeRequestsByCustomerId.pending, (state) => {
        state.changeRequestsByCustomerLoading = true
        state.changeRequestsByCustomerError = null
        state.changeRequestsByCustomerSuccess = false
      })
      .addCase(fetchChangeRequestsByCustomerId.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsByCustomerLoading = false
        state.changeRequestsByCustomerSuccess = true
        state.changeRequestsByCustomer = action.payload.data || []
        state.changeRequestsByCustomerPagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.changeRequestsByCustomerError = null
      })
      .addCase(fetchChangeRequestsByCustomerId.rejected, (state, action) => {
        state.changeRequestsByCustomerLoading = false
        state.changeRequestsByCustomerError =
          (action.payload as string) || "Failed to fetch change requests for customer"
        state.changeRequestsByCustomerSuccess = false
        state.changeRequestsByCustomer = []
        state.changeRequestsByCustomerPagination = {
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

          // Update the change request in the customer-specific list if it exists
          const customerIndex = state.changeRequestsByCustomer.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (customerIndex !== -1) {
            const req = state.changeRequestsByCustomer[customerIndex]
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

          // Update the change request in the customer-specific list if it exists
          const customerIndex = state.changeRequestsByCustomer.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (customerIndex !== -1) {
            const req = state.changeRequestsByCustomer[customerIndex]
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
  },
})

export const {
  clearCustomers,
  clearError,
  clearCurrentCustomer,
  clearCustomerLookup,
  resetCustomerState,
  setPagination,
  setPaymentDisputesPagination,
  setChangeRequestsPagination,
  setChangeRequestsByCustomerPagination,
  setCurrentCustomer,
  setFilters,
  setPaymentDisputesFilters,
  clearFilters,
  clearPaymentDisputesFilters,
  addCustomer,
  updateCustomer,
  removeCustomer,
  updateCustomerSuspension,
  updateCustomerStatus,
  updateCustomerLastLogin,
  updateCustomerMeterInfo,
  updateCustomerFinancialInfo,
  clearCreateState,
  clearUpdateState,
  clearSuspendState,
  clearActivateState,
  clearPaymentDisputesState,
  addPaymentDispute,
  updatePaymentDispute,
  removePaymentDispute,
  clearChangeRequestStatus,
  clearChangeRequests,
  clearChangeRequestsByCustomer,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
} = customerSlice.actions

export default customerSlice.reducer
