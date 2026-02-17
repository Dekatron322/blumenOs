import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS } from "lib/config/api"

// Feeders interfaces
export interface Feeder {
  id: number
  name: string
  kaedcoFeederCode: string
}

export interface FeedersParams {
  PageNumber: number
  PageSize: number
  Search?: string
}

export interface FeedersResponse {
  isSuccess: boolean
  message: string
  data: Feeder[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Area Offices interfaces
export interface AreaOffice {
  id: number
  name: string
}

export interface AreaOfficesParams {
  PageNumber: number
  PageSize: number
  Search?: string
}

export interface AreaOfficesResponse {
  isSuccess: boolean
  message: string
  data: AreaOffice[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Distribution Substation interfaces
export interface DistributionSubstation {
  id: number
  dssCode: string
  name: string
}

export interface DistributionSubstationParams {
  PageNumber: number
  PageSize: number
  Search?: string
}

export interface DistributionSubstationResponse {
  isSuccess: boolean
  message: string
  data: DistributionSubstation[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Customers interfaces
export interface Customer {
  id: number
  fullName: string
  accountNumber: string
}

export interface CustomersParams {
  PageNumber: number
  PageSize: number
  Search?: string
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

// Meters interfaces
export interface Meter {
  id: number
  customerName: string
  meterNumber: string
}

export interface MetersParams {
  PageNumber: number
  PageSize: number
  Search?: string
}

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

// Service Centers interfaces
export interface ServiceCenter {
  id: number
  name: string
}

export interface ServiceCentersParams {
  PageNumber: number
  PageSize: number
  Search?: string
}

export interface ServiceCentersResponse {
  isSuccess: boolean
  message: string
  data: ServiceCenter[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Form Data State
interface FormDataState {
  // Feeders state
  feeders: Feeder[]
  feedersLoading: boolean
  feedersError: string | null
  feedersSuccess: boolean
  feedersResponse: FeedersResponse | null
  feedersPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null

  // Area Offices state
  areaOffices: AreaOffice[]
  areaOfficesLoading: boolean
  areaOfficesError: string | null
  areaOfficesSuccess: boolean
  areaOfficesResponse: AreaOfficesResponse | null
  areaOfficesPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null

  // Distribution Substation state
  distributionSubstations: DistributionSubstation[]
  distributionSubstationsLoading: boolean
  distributionSubstationsError: string | null
  distributionSubstationsSuccess: boolean
  distributionSubstationsResponse: DistributionSubstationResponse | null
  distributionSubstationsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null

  // Customers state
  customers: Customer[]
  customersLoading: boolean
  customersError: string | null
  customersSuccess: boolean
  customersResponse: CustomersResponse | null
  customersPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null

  // Meters state
  meters: Meter[]
  metersLoading: boolean
  metersError: string | null
  metersSuccess: boolean
  metersResponse: MetersResponse | null
  metersPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null

  // Service Centers state
  serviceCenters: ServiceCenter[]
  serviceCentersLoading: boolean
  serviceCentersError: string | null
  serviceCentersSuccess: boolean
  serviceCentersResponse: ServiceCentersResponse | null
  serviceCentersPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null
}

// Initial state
const initialState: FormDataState = {
  // Feeders state
  feeders: [],
  feedersLoading: false,
  feedersError: null,
  feedersSuccess: false,
  feedersResponse: null,
  feedersPagination: null,

  // Area Offices state
  areaOffices: [],
  areaOfficesLoading: false,
  areaOfficesError: null,
  areaOfficesSuccess: false,
  areaOfficesResponse: null,
  areaOfficesPagination: null,

  // Distribution Substation state
  distributionSubstations: [],
  distributionSubstationsLoading: false,
  distributionSubstationsError: null,
  distributionSubstationsSuccess: false,
  distributionSubstationsResponse: null,
  distributionSubstationsPagination: null,

  // Customers state
  customers: [],
  customersLoading: false,
  customersError: null,
  customersSuccess: false,
  customersResponse: null,
  customersPagination: null,

  // Meters state
  meters: [],
  metersLoading: false,
  metersError: null,
  metersSuccess: false,
  metersResponse: null,
  metersPagination: null,

  // Service Centers state
  serviceCenters: [],
  serviceCentersLoading: false,
  serviceCentersError: null,
  serviceCentersSuccess: false,
  serviceCentersResponse: null,
  serviceCentersPagination: null,
}

// Async thunks
export const fetchFeeders = createAsyncThunk(
  "formData/fetchFeeders",
  async (params: FeedersParams, { rejectWithValue }) => {
    try {
      console.log("fetchFeeders called with params:", params)

      // Build URL manually to ensure Search parameter is included
      let url = API_ENDPOINTS.FORM_DATA.feeders
      const queryParams = new URLSearchParams()

      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.Search && params.Search.trim()) {
        queryParams.append("Search", params.Search.trim())
      }

      const fullUrl = `${url}?${queryParams.toString()}`
      console.log("Full URL being called:", fullUrl)

      const response = await api.get<FeedersResponse>(fullUrl)
      console.log("API response:", response)
      return response.data
    } catch (error: any) {
      console.error("fetchFeeders error:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to fetch feeders")
    }
  }
)

export const fetchAreaOffices = createAsyncThunk(
  "formData/fetchAreaOffices",
  async (params: AreaOfficesParams, { rejectWithValue }) => {
    try {
      console.log("fetchAreaOffices called with params:", params)

      // Build URL manually to ensure Search parameter is included
      let url = API_ENDPOINTS.FORM_DATA.area_office
      const queryParams = new URLSearchParams()

      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.Search && params.Search.trim()) {
        queryParams.append("Search", params.Search.trim())
      }

      const fullUrl = `${url}?${queryParams.toString()}`
      console.log("Full URL being called:", fullUrl)

      const response = await api.get<AreaOfficesResponse>(fullUrl)
      console.log("API response:", response)
      return response.data
    } catch (error: any) {
      console.error("fetchAreaOffices error:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to fetch area offices")
    }
  }
)

export const fetchDistributionSubstations = createAsyncThunk(
  "formData/fetchDistributionSubstations",
  async (params: DistributionSubstationParams, { rejectWithValue }) => {
    try {
      console.log("fetchDistributionSubstations called with params:", params)

      // Build URL manually to ensure Search parameter is included
      let url = API_ENDPOINTS.FORM_DATA.distribution_substation
      const queryParams = new URLSearchParams()

      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.Search && params.Search.trim()) {
        queryParams.append("Search", params.Search.trim())
      }

      const fullUrl = `${url}?${queryParams.toString()}`
      console.log("Full URL being called:", fullUrl)

      const response = await api.get<DistributionSubstationResponse>(fullUrl)
      console.log("API response:", response)
      return response.data
    } catch (error: any) {
      console.error("fetchDistributionSubstations error:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to fetch distribution substations")
    }
  }
)

export const fetchCustomers = createAsyncThunk(
  "formData/fetchCustomers",
  async (params: CustomersParams, { rejectWithValue }) => {
    try {
      console.log("fetchCustomers called with params:", params)

      // Build URL manually to ensure Search parameter is included
      let url = API_ENDPOINTS.FORM_DATA.customers
      const queryParams = new URLSearchParams()

      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.Search && params.Search.trim()) {
        queryParams.append("Search", params.Search.trim())
      }

      const fullUrl = `${url}?${queryParams.toString()}`
      console.log("Full URL being called:", fullUrl)

      const response = await api.get<CustomersResponse>(fullUrl)
      console.log("API response:", response)
      return response.data
    } catch (error: any) {
      console.error("fetchCustomers error:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to fetch customers")
    }
  }
)

export const fetchMeters = createAsyncThunk(
  "formData/fetchMeters",
  async (params: MetersParams, { rejectWithValue }) => {
    try {
      console.log("fetchMeters called with params:", params)

      // Build URL manually to ensure Search parameter is included
      let url = API_ENDPOINTS.FORM_DATA.meters
      const queryParams = new URLSearchParams()

      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.Search && params.Search.trim()) {
        queryParams.append("Search", params.Search.trim())
      }

      const fullUrl = `${url}?${queryParams.toString()}`
      console.log("Full URL being called:", fullUrl)

      const response = await api.get<MetersResponse>(fullUrl)
      console.log("API response:", response)
      return response.data
    } catch (error: any) {
      console.error("fetchMeters error:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to fetch meters")
    }
  }
)

export const fetchServiceCenters = createAsyncThunk(
  "formData/fetchServiceCenters",
  async (params: ServiceCentersParams, { rejectWithValue }) => {
    try {
      console.log("fetchServiceCenters called with params:", params)

      // Build URL manually to ensure Search parameter is included
      let url = API_ENDPOINTS.FORM_DATA.service_centers
      const queryParams = new URLSearchParams()

      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      if (params.Search && params.Search.trim()) {
        queryParams.append("Search", params.Search.trim())
      }

      const fullUrl = `${url}?${queryParams.toString()}`
      console.log("Full URL being called:", fullUrl)

      const response = await api.get<ServiceCentersResponse>(fullUrl)
      console.log("API response:", response)
      return response.data
    } catch (error: any) {
      console.error("fetchServiceCenters error:", error)
      return rejectWithValue(error.response?.data?.message || "Failed to fetch service centers")
    }
  }
)

// Slice
const formDataSlice = createSlice({
  name: "formData",
  initialState,
  reducers: {
    resetFeedersState: (state) => {
      state.feedersLoading = false
      state.feedersError = null
      state.feedersSuccess = false
      state.feedersResponse = null
    },
    clearFeedersError: (state) => {
      state.feedersError = null
    },
    resetAreaOfficesState: (state) => {
      state.areaOfficesLoading = false
      state.areaOfficesError = null
      state.areaOfficesSuccess = false
      state.areaOfficesResponse = null
    },
    clearAreaOfficesError: (state) => {
      state.areaOfficesError = null
    },
    resetDistributionSubstationsState: (state) => {
      state.distributionSubstationsLoading = false
      state.distributionSubstationsError = null
      state.distributionSubstationsSuccess = false
      state.distributionSubstationsResponse = null
    },
    clearDistributionSubstationsError: (state) => {
      state.distributionSubstationsError = null
    },
    resetCustomersState: (state) => {
      state.customersLoading = false
      state.customersError = null
      state.customersSuccess = false
      state.customersResponse = null
    },
    clearCustomersError: (state) => {
      state.customersError = null
    },
    resetMetersState: (state) => {
      state.metersLoading = false
      state.metersError = null
      state.metersSuccess = false
      state.metersResponse = null
    },
    clearMetersError: (state) => {
      state.metersError = null
    },
    resetServiceCentersState: (state) => {
      state.serviceCentersLoading = false
      state.serviceCentersError = null
      state.serviceCentersSuccess = false
      state.serviceCentersResponse = null
    },
    clearServiceCentersError: (state) => {
      state.serviceCentersError = null
    },
  },
  extraReducers: (builder) => {
    // Feeders
    builder
      .addCase(fetchFeeders.pending, (state) => {
        state.feedersLoading = true
        state.feedersError = null
        state.feedersSuccess = false
      })
      .addCase(fetchFeeders.fulfilled, (state, action: PayloadAction<FeedersResponse>) => {
        state.feedersLoading = false
        state.feedersSuccess = true
        state.feedersResponse = action.payload
        state.feeders = action.payload.data
        state.feedersPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchFeeders.rejected, (state, action) => {
        state.feedersLoading = false
        state.feedersError = action.payload as string
        state.feedersSuccess = false
      })

    // Area Offices
    builder
      .addCase(fetchAreaOffices.pending, (state) => {
        state.areaOfficesLoading = true
        state.areaOfficesError = null
        state.areaOfficesSuccess = false
      })
      .addCase(fetchAreaOffices.fulfilled, (state, action: PayloadAction<AreaOfficesResponse>) => {
        state.areaOfficesLoading = false
        state.areaOfficesSuccess = true
        state.areaOfficesResponse = action.payload
        state.areaOffices = action.payload.data
        state.areaOfficesPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchAreaOffices.rejected, (state, action) => {
        state.areaOfficesLoading = false
        state.areaOfficesError = action.payload as string
        state.areaOfficesSuccess = false
      })

    // Distribution Substations
    builder
      .addCase(fetchDistributionSubstations.pending, (state) => {
        state.distributionSubstationsLoading = true
        state.distributionSubstationsError = null
        state.distributionSubstationsSuccess = false
      })
      .addCase(
        fetchDistributionSubstations.fulfilled,
        (state, action: PayloadAction<DistributionSubstationResponse>) => {
          state.distributionSubstationsLoading = false
          state.distributionSubstationsSuccess = true
          state.distributionSubstationsResponse = action.payload
          state.distributionSubstations = action.payload.data
          state.distributionSubstationsPagination = {
            totalCount: action.payload.totalCount,
            totalPages: action.payload.totalPages,
            currentPage: action.payload.currentPage,
            pageSize: action.payload.pageSize,
            hasNext: action.payload.hasNext,
            hasPrevious: action.payload.hasPrevious,
          }
        }
      )
      .addCase(fetchDistributionSubstations.rejected, (state, action) => {
        state.distributionSubstationsLoading = false
        state.distributionSubstationsError = action.payload as string
        state.distributionSubstationsSuccess = false
      })

    // Customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.customersLoading = true
        state.customersError = null
        state.customersSuccess = false
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<CustomersResponse>) => {
        state.customersLoading = false
        state.customersSuccess = true
        state.customersResponse = action.payload
        state.customers = action.payload.data
        state.customersPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.customersLoading = false
        state.customersError = action.payload as string
        state.customersSuccess = false
      })

    // Meters
    builder
      .addCase(fetchMeters.pending, (state) => {
        state.metersLoading = true
        state.metersError = null
        state.metersSuccess = false
      })
      .addCase(fetchMeters.fulfilled, (state, action: PayloadAction<MetersResponse>) => {
        state.metersLoading = false
        state.metersSuccess = true
        state.metersResponse = action.payload
        state.meters = action.payload.data
        state.metersPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchMeters.rejected, (state, action) => {
        state.metersLoading = false
        state.metersError = action.payload as string
        state.metersSuccess = false
      })

    // Service Centers
    builder
      .addCase(fetchServiceCenters.pending, (state) => {
        state.serviceCentersLoading = true
        state.serviceCentersError = null
        state.serviceCentersSuccess = false
      })
      .addCase(fetchServiceCenters.fulfilled, (state, action: PayloadAction<ServiceCentersResponse>) => {
        state.serviceCentersLoading = false
        state.serviceCentersSuccess = true
        state.serviceCentersResponse = action.payload
        state.serviceCenters = action.payload.data
        state.serviceCentersPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchServiceCenters.rejected, (state, action) => {
        state.serviceCentersLoading = false
        state.serviceCentersError = action.payload as string
        state.serviceCentersSuccess = false
      })
  },
})

export const {
  resetFeedersState,
  clearFeedersError,
  resetAreaOfficesState,
  clearAreaOfficesError,
  resetDistributionSubstationsState,
  clearDistributionSubstationsError,
  resetCustomersState,
  clearCustomersError,
  resetMetersState,
  clearMetersError,
  resetServiceCentersState,
  clearServiceCentersError,
} = formDataSlice.actions

export default formDataSlice.reducer
