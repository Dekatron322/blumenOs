// src/lib/redux/createCustomerSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Request interface for creating customer
export interface CreateCustomerRequest {
  fullName: string
  phoneNumber: string
  phoneOffice: string
  gender: string
  customerID: string
  autoNumber: string
  isCustomerNew: boolean
  isPostEnumerated: boolean
  statusCode: string
  isReadyforExtraction: boolean
  email: string
  address: string
  distributionSubstationId: number
  addressTwo: string
  city: string
  state: string
  lga: string
  serviceCenterId: number
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
  isPPM: boolean
  isMD: boolean
  isUrban: boolean
  isHRB: boolean
  isCustomerAccGovt: boolean
  comment: string
  band: string
  storedAverage: number
  salesRepUserId: number
  technicalEngineerUserId: number
  customerCategoryId: number
  customerSubCategoryId: number
}

export interface CreateCustomerRequestPayload {
  customers: CreateCustomerRequest[]
}

// Response interface
export interface CreatedCustomer {
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
  distributionSubstation: {
    id: number
    oldDssCode: string
    dssCode: string
    nercCode: string
    transformerCapacityInKva: number
    latitude: number
    longitude: number
    status: string
    technicalEngineerUserId: number
    technicalEngineerUser: {
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
    feeder: {
      id: number
      name: string
      nercCode: string
      kaedcoFeederCode: string
      feederVoltage: number
      technicalEngineerUserId: number
      technicalEngineerUser: {
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
      injectionSubstation: {
        id: number
        nercCode: string
        injectionSubstationCode: string
        technicalEngineerUserId: number
        technicalEngineerUser: {
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
        areaOffice: {
          id: number
          nameOfNewOAreaffice: string
          newKaedcoCode: string
          newNercCode: string
          oldNercCode: string
          oldKaedcoCode: string
          nameOfOldOAreaffice: string
          latitude: number
          longitude: number
          company: {
            id: number
            name: string
            nercCode: string
            nercSupplyStructure: number
          }
        }
      }
      htPole: {
        id: number
        htPoleNumber: string
        technicalEngineerUserId: number
        technicalEngineerUser: {
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
    }
    numberOfUnit: number
    unitOneCode: string
    unitTwoCode: string
    unitThreeCode: string
    unitFourCode: string
    publicOrDedicated: string
    remarks: string
  }
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
    areaOffice: {
      id: number
      nameOfNewOAreaffice: string
      newKaedcoCode: string
      newNercCode: string
      oldNercCode: string
      oldKaedcoCode: string
      nameOfOldOAreaffice: string
      latitude: number
      longitude: number
      company: {
        id: number
        name: string
        nercCode: string
        nercSupplyStructure: number
      }
    }
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
    oldState: string
    oldLatitude: number
    oldLongitude: number
    newAddress: string
    newAddressTwo: string
    newCity: string
    newState: string
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
    oldState: string
    oldLatitude: number
    oldLongitude: number
    newAddress: string
    newAddressTwo: string
    newCity: string
    newState: string
    newLatitude: number
    newLongitude: number
  }>
}

export interface CreateCustomerResponse {
  isSuccess: boolean
  message: string
  data: CreatedCustomer[]
}

// Record Payment interfaces
export interface CustomerRecordPaymentRequest {
  paymentTypeId: number
  amount: number
  channel: string
  currency: string
  externalReference?: string
  narrative?: string
  evidenceFileUrl?: string
  paidAtUtc: string
}

export interface CustomerRecordPaymentResponse {
  isSuccess: boolean
  message: string
  data: {
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
    evidenceFileUrl?: string
    recoveryApplied: boolean
    recoveryAmount: number
    recoveryPolicyId: number
    recoveryPolicyName: string
    tokens: Array<{
      token: string
      tokenDec: string
      vendedAmount: string
      unit: string
      description: string
      drn: string
    }>
    narrative: string
    externalReference: string
    virtualAccount?: {
      accountNumber: string
      bankName: string
      reference: string
      expiresAtUtc: string
    }
    vendorAccountId: string
    recordedByName: string
  }
}

// Customer payment channels interfaces
export interface CustomerPaymentChannelsResponse {
  isSuccess: boolean
  message: string
  data: string[]
}

// Customer State
interface CustomerState {
  // Create customer state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean
  createdCustomers: CreatedCustomer[]

  // Record payment state
  recordPaymentLoading: boolean
  recordPaymentError: string | null
  recordPaymentSuccess: boolean
  recordedPayment: CustomerRecordPaymentResponse["data"] | null

  // Customer payment channels state
  customerPaymentChannelsLoading: boolean
  customerPaymentChannelsError: string | null
  customerPaymentChannelsSuccess: boolean
  customerPaymentChannels: string[]
}

// Initial state
const initialState: CustomerState = {
  createLoading: false,
  createError: null,
  createSuccess: false,
  createdCustomers: [],

  // Record payment initial state
  recordPaymentLoading: false,
  recordPaymentError: null,
  recordPaymentSuccess: false,
  recordedPayment: null,

  // Customer payment channels initial state
  customerPaymentChannelsLoading: false,
  customerPaymentChannelsError: null,
  customerPaymentChannelsSuccess: false,
  customerPaymentChannels: [],
}

// Async thunk for creating a single customer
export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData: CreateCustomerRequest, { rejectWithValue }) => {
    try {
      // Wrap single customer in array as required by API
      const payload: CreateCustomerRequestPayload = {
        customers: [customerData],
      }

      const response = await api.post<CreateCustomerResponse>(buildApiUrl(API_ENDPOINTS.CREATE_CUSTOMER.ADD), payload)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create customer")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create customer")
      }
      return rejectWithValue(error.message || "Network error during customer creation")
    }
  }
)

// Async thunk for recording payment for a customer
export const recordCustomerPayment = createAsyncThunk(
  "customers/recordCustomerPayment",
  async (
    { customerId, paymentData }: { customerId: number; paymentData: CustomerRecordPaymentRequest },
    { rejectWithValue }
  ) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.CREATE_CUSTOMER.RECORD_PAYMENT).replace("{id}", customerId.toString())
      const response = await api.post<CustomerRecordPaymentResponse>(url, paymentData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to record payment")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to record payment")
      }
      return rejectWithValue(error.message || "Network error during payment recording")
    }
  }
)

// Async thunk for fetching customer payment channels
export const fetchCustomerPaymentChannels = createAsyncThunk(
  "customers/fetchCustomerPaymentChannels",
  async (customerId: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.CREATE_CUSTOMER.PAYMENT_CHANNELS).replace("{id}", customerId.toString())
      const response = await api.get<CustomerPaymentChannelsResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch customer payment channels")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch customer payment channels")
      }
      return rejectWithValue(error.message || "Network error during customer payment channels fetch")
    }
  }
)

// Customer slice
const createCustomerSlice = createSlice({
  name: "createCustomer",
  initialState,
  reducers: {
    // Clear create state
    clearCreateState: (state) => {
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
      state.createdCustomers = []
    },

    // Clear record payment state
    clearRecordPaymentState: (state) => {
      state.recordPaymentLoading = false
      state.recordPaymentError = null
      state.recordPaymentSuccess = false
      state.recordedPayment = null
    },

    // Clear customer payment channels state
    clearCustomerPaymentChannelsState: (state) => {
      state.customerPaymentChannelsLoading = false
      state.customerPaymentChannelsError = null
      state.customerPaymentChannelsSuccess = false
      state.customerPaymentChannels = []
    },

    // Clear errors
    clearError: (state) => {
      state.createError = null
      state.recordPaymentError = null
      state.customerPaymentChannelsError = null
    },

    // Reset customer state
    resetCustomerState: (state) => {
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
      state.createdCustomers = []
      state.recordPaymentLoading = false
      state.recordPaymentError = null
      state.recordPaymentSuccess = false
      state.recordedPayment = null
      state.customerPaymentChannelsLoading = false
      state.customerPaymentChannelsError = null
      state.customerPaymentChannelsSuccess = false
      state.customerPaymentChannels = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Create customer cases
      .addCase(createCustomer.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createCustomer.fulfilled, (state, action: PayloadAction<CreateCustomerResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Store the created customers
        if (action.payload.data && action.payload.data.length > 0) {
          state.createdCustomers = action.payload.data
        }
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create customer"
        state.createSuccess = false
        state.createdCustomers = []
      })
      // Record payment cases
      .addCase(recordCustomerPayment.pending, (state) => {
        state.recordPaymentLoading = true
        state.recordPaymentError = null
        state.recordPaymentSuccess = false
      })
      .addCase(recordCustomerPayment.fulfilled, (state, action: PayloadAction<CustomerRecordPaymentResponse>) => {
        state.recordPaymentLoading = false
        state.recordPaymentSuccess = true
        state.recordPaymentError = null
        state.recordedPayment = action.payload.data
      })
      .addCase(recordCustomerPayment.rejected, (state, action) => {
        state.recordPaymentLoading = false
        state.recordPaymentError = (action.payload as string) || "Failed to record payment"
        state.recordPaymentSuccess = false
        state.recordedPayment = null
      })
      // Fetch customer payment channels cases
      .addCase(fetchCustomerPaymentChannels.pending, (state) => {
        state.customerPaymentChannelsLoading = true
        state.customerPaymentChannelsError = null
        state.customerPaymentChannelsSuccess = false
      })
      .addCase(fetchCustomerPaymentChannels.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.customerPaymentChannelsLoading = false
        state.customerPaymentChannelsSuccess = true
        state.customerPaymentChannelsError = null
        state.customerPaymentChannels = action.payload
      })
      .addCase(fetchCustomerPaymentChannels.rejected, (state, action) => {
        state.customerPaymentChannelsLoading = false
        state.customerPaymentChannelsError = (action.payload as string) || "Failed to fetch customer payment channels"
        state.customerPaymentChannelsSuccess = false
        state.customerPaymentChannels = []
      })
  },
})

export const {
  clearCreateState,
  clearRecordPaymentState,
  clearCustomerPaymentChannelsState,
  clearError,
  resetCustomerState,
} = createCustomerSlice.actions

export default createCustomerSlice.reducer
