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

// Customer State
interface CustomerState {
  // Create customer state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean
  createdCustomers: CreatedCustomer[]
}

// Initial state
const initialState: CustomerState = {
  createLoading: false,
  createError: null,
  createSuccess: false,
  createdCustomers: [],
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

    // Clear errors
    clearError: (state) => {
      state.createError = null
    },

    // Reset customer state
    resetCustomerState: (state) => {
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
      state.createdCustomers = []
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
  },
})

export const { clearCreateState, clearError, resetCustomerState } = createCustomerSlice.actions

export default createCustomerSlice.reducer
