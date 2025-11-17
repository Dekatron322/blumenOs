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

export interface InjectionSubstation {
  id: number
  nercCode: string
  injectionSubstationCode: string
  areaOffice: AreaOffice
}

export interface HtPole {
  id: number
  htPoleNumber: string
}

export interface Feeder {
  id: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
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

export interface TechnicalEngineerUser {
  id: number
  fullName: string
  email: string
  phoneNumber: string
}

export interface Customer {
  createdAt: any
  id: number
  accountNumber: string
  fullName: string
  phoneNumber: string
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
  serviceCenterId: number
  serviceCenterName: string
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
  salesRepUser: SalesRepUser
  lastLoginAt: string
  suspensionReason: string
  suspendedAt: string
  distributionSubstation: DistributionSubstation
  technicalEngineerUser: TechnicalEngineerUser
  serviceCenter: ServiceCenter
}

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

export interface CustomersRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  status?: string
  isSuspended?: boolean
  distributionSubstationId?: number
  serviceCenterId?: number
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

// Customer State
interface CustomerState {
  // Customers list state
  customers: Customer[]
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

  // Current customer state (for viewing/editing)
  currentCustomer: Customer | null
  currentCustomerLoading: boolean
  currentCustomerError: string | null

  // Update customer state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean

  // Suspend customer state
  suspendLoading: boolean
  suspendError: string | null
  suspendSuccess: boolean

  // Search and filter state
  filters: {
    search: string
    status: string
    isSuspended: boolean | null
    distributionSubstationId: number | null
    serviceCenterId: number | null
  }
}

// Initial state
const initialState: CustomerState = {
  customers: [],
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
  currentCustomer: null,
  currentCustomerLoading: false,
  currentCustomerError: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  suspendLoading: false,
  suspendError: null,
  suspendSuccess: false,
  filters: {
    search: "",
    status: "",
    isSuspended: null,
    distributionSubstationId: null,
    serviceCenterId: null,
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
      state.updateError = null
      state.suspendError = null
    },

    // Clear current customer
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null
      state.currentCustomerError = null
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
      state.updateLoading = false
      state.updateError = null
      state.updateSuccess = false
      state.suspendLoading = false
      state.suspendError = null
      state.suspendSuccess = false
      state.filters = {
        search: "",
        status: "",
        isSuspended: null,
        distributionSubstationId: null,
        serviceCenterId: null,
      }
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set current customer (for forms, etc.)
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload
    },

    // Set filters
    setFilters: (state, action: PayloadAction<Partial<CustomerState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
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
  },
  extraReducers: (builder) => {
    builder
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
  },
})

export const {
  clearCustomers,
  clearError,
  clearCurrentCustomer,
  resetCustomerState,
  setPagination,
  setCurrentCustomer,
  setFilters,
  clearFilters,
  addCustomer,
  updateCustomer,
  removeCustomer,
  updateCustomerSuspension,
  updateCustomerStatus,
  updateCustomerLastLogin,
  updateCustomerMeterInfo,
  updateCustomerFinancialInfo,
  clearUpdateState,
  clearSuspendState,
} = customerSlice.actions

export default customerSlice.reducer
