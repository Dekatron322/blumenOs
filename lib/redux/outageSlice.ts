// src/lib/redux/outageSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Outage
export interface CustomerReport {
  id: number
  customerId: number
  customerName: string
  reason: number
  reasonLabel: string
  additionalNotes: string
  reportedAt: string
}

export interface Outage {
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

export interface OutagesResponse {
  isSuccess: boolean
  message: string
  data: Outage[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface OutageDetailResponse {
  isSuccess: boolean
  message: string
  data: Outage
}

export interface CreateOutageRequest {
  title: string
  details: string
  distributionSubstationId: number
  feederId: number
  scope: number
  priority: number
}

export interface CreateOutageResponse {
  isSuccess: boolean
  message: string
  data: Outage
}

export interface OutageRequestParams {
  // Query parameters
  Status?: number
  Priority?: number
  Scope?: number
  DistributionSubstationId?: number
  FeederId?: number
  CustomerGenerated?: boolean
  From?: string
  To?: string
  Search?: string
  PageNumber: number
  PageSize: number
}

// Outage State
interface OutageState {
  // Outages list state
  outages: Outage[]
  loading: boolean
  error: string | null
  success: boolean

  // Create outage state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Pagination state
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean

  // Current outage state (for viewing/editing)
  currentOutage: Outage | null
  currentOutageLoading: boolean
  currentOutageError: string | null

  // Request parameters
  requestParams: OutageRequestParams
}

// Initial state
const initialState: OutageState = {
  outages: [],
  loading: false,
  error: null,
  success: false,
  createLoading: false,
  createError: null,
  createSuccess: false,
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
  hasNext: false,
  hasPrevious: false,
  currentOutage: null,
  currentOutageLoading: false,
  currentOutageError: null,
  requestParams: {
    PageNumber: 1,
    PageSize: 10,
  },
}

// Async thunks
export const fetchOutages = createAsyncThunk(
  "outages/fetchOutages",
  async (params: OutageRequestParams, { rejectWithValue }) => {
    try {
      // Build query string from parameters
      const queryParams = new URLSearchParams()

      // Add optional parameters if they exist
      if (params.Status !== undefined) queryParams.append("Status", params.Status.toString())
      if (params.Priority !== undefined) queryParams.append("Priority", params.Priority.toString())
      if (params.Scope !== undefined) queryParams.append("Scope", params.Scope.toString())
      if (params.DistributionSubstationId !== undefined)
        queryParams.append("DistributionSubstationId", params.DistributionSubstationId.toString())
      if (params.FeederId !== undefined) queryParams.append("FeederId", params.FeederId.toString())
      if (params.CustomerGenerated !== undefined)
        queryParams.append("CustomerGenerated", params.CustomerGenerated.toString())
      if (params.From) queryParams.append("From", params.From)
      if (params.To) queryParams.append("To", params.To)
      if (params.Search) queryParams.append("Search", params.Search)

      // Add required pagination parameters
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      const queryString = queryParams.toString()
      const url = `${buildApiUrl(API_ENDPOINTS.OUTAGE_MANAGEMENT.GET)}${queryString ? `?${queryString}` : ""}`

      const response = await api.get<OutagesResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch outages")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch outages")
      }
      return rejectWithValue(error.message || "Network error during outages fetch")
    }
  }
)

export const fetchOutageById = createAsyncThunk(
  "outages/fetchOutageById",
  async (outageId: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.OUTAGE_MANAGEMENT.GET_BY_ID.replace("{id}", outageId.toString()))
      const response = await api.get<OutageDetailResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch outage details")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch outage details")
      }
      return rejectWithValue(error.message || "Network error during outage details fetch")
    }
  }
)

export const createOutage = createAsyncThunk(
  "outages/createOutage",
  async (outageData: CreateOutageRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateOutageResponse>(
        buildApiUrl(API_ENDPOINTS.OUTAGE_MANAGEMENT.ADD),
        outageData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create outage")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create outage")
      }
      return rejectWithValue(error.message || "Network error during outage creation")
    }
  }
)

// Outage slice
const outageSlice = createSlice({
  name: "outages",
  initialState,
  reducers: {
    // Clear outages state
    clearOutages: (state) => {
      state.outages = []
      state.error = null
      state.success = false
      state.totalCount = 0
      state.totalPages = 0
      state.currentPage = 1
      state.pageSize = 10
      state.hasNext = false
      state.hasPrevious = false
    },

    // Clear create outage state
    clearCreateOutageState: (state) => {
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
    },

    // Clear errors
    clearError: (state) => {
      state.error = null
      state.currentOutageError = null
      state.createError = null
    },

    // Clear current outage
    clearCurrentOutage: (state) => {
      state.currentOutage = null
      state.currentOutageError = null
      state.currentOutageLoading = false
    },

    // Reset outage state
    resetOutageState: (state) => {
      state.outages = []
      state.loading = false
      state.error = null
      state.success = false
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
      state.totalCount = 0
      state.totalPages = 0
      state.currentPage = 1
      state.pageSize = 10
      state.hasNext = false
      state.hasPrevious = false
      state.currentOutage = null
      state.currentOutageLoading = false
      state.currentOutageError = null
      state.requestParams = {
        PageNumber: 1,
        PageSize: 10,
      }
    },

    // Set current outage (for when we get outage data from other sources)
    setCurrentOutage: (state, action: PayloadAction<Outage>) => {
      state.currentOutage = action.payload
    },

    // Update outage in list (for optimistic updates)
    updateOutageInList: (state, action: PayloadAction<Outage>) => {
      const index = state.outages.findIndex((outage) => outage.id === action.payload.id)
      if (index !== -1) {
        state.outages[index] = action.payload
      }

      // Also update current outage if it's the same one
      if (state.currentOutage && state.currentOutage.id === action.payload.id) {
        state.currentOutage = action.payload
      }
    },

    // Add outage to list
    addOutageToList: (state, action: PayloadAction<Outage>) => {
      state.outages.unshift(action.payload)
      state.totalCount += 1
    },

    // Remove outage from list
    removeOutageFromList: (state, action: PayloadAction<number>) => {
      state.outages = state.outages.filter((outage) => outage.id !== action.payload)
      state.totalCount = Math.max(0, state.totalCount - 1)
    },

    // Update request parameters
    setRequestParams: (state, action: PayloadAction<Partial<OutageRequestParams>>) => {
      state.requestParams = {
        ...state.requestParams,
        ...action.payload,
      }
    },

    // Update pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.currentPage = action.payload.page
      state.pageSize = action.payload.pageSize
      state.requestParams.PageNumber = action.payload.page
      state.requestParams.PageSize = action.payload.pageSize
    },

    // Go to next page
    nextPage: (state) => {
      if (state.hasNext) {
        state.currentPage += 1
        state.requestParams.PageNumber = state.currentPage
      }
    },

    // Go to previous page
    previousPage: (state) => {
      if (state.hasPrevious) {
        state.currentPage = Math.max(1, state.currentPage - 1)
        state.requestParams.PageNumber = state.currentPage
      }
    },

    // Go to specific page
    goToPage: (state, action: PayloadAction<number>) => {
      const page = Math.max(1, Math.min(action.payload, state.totalPages))
      state.currentPage = page
      state.requestParams.PageNumber = page
    },

    // Filter outages by status
    filterByStatus: (state, action: PayloadAction<number | undefined>) => {
      state.requestParams.Status = action.payload
      state.currentPage = 1
      state.requestParams.PageNumber = 1
    },

    // Filter outages by priority
    filterByPriority: (state, action: PayloadAction<number | undefined>) => {
      state.requestParams.Priority = action.payload
      state.currentPage = 1
      state.requestParams.PageNumber = 1
    },

    // Filter outages by scope
    filterByScope: (state, action: PayloadAction<number | undefined>) => {
      state.requestParams.Scope = action.payload
      state.currentPage = 1
      state.requestParams.PageNumber = 1
    },

    // Filter outages by customer generated
    filterByCustomerGenerated: (state, action: PayloadAction<boolean | undefined>) => {
      state.requestParams.CustomerGenerated = action.payload
      state.currentPage = 1
      state.requestParams.PageNumber = 1
    },

    // Search outages
    searchOutages: (state, action: PayloadAction<string>) => {
      state.requestParams.Search = action.payload
      state.currentPage = 1
      state.requestParams.PageNumber = 1
    },

    // Clear search and filters
    clearFilters: (state) => {
      state.requestParams = {
        PageNumber: state.currentPage,
        PageSize: state.pageSize,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch outages cases
      .addCase(fetchOutages.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchOutages.fulfilled, (state, action: PayloadAction<OutagesResponse>) => {
        state.loading = false
        state.success = true
        state.outages = action.payload.data
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
        state.pageSize = action.payload.pageSize
        state.hasNext = action.payload.hasNext
        state.hasPrevious = action.payload.hasPrevious
        state.error = null
      })
      .addCase(fetchOutages.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch outages"
        state.success = false
        state.outages = []
        state.totalCount = 0
        state.totalPages = 0
        state.currentPage = 1
        state.hasNext = false
        state.hasPrevious = false
      })
      // Fetch outage by ID cases
      .addCase(fetchOutageById.pending, (state) => {
        state.currentOutageLoading = true
        state.currentOutageError = null
      })
      .addCase(fetchOutageById.fulfilled, (state, action: PayloadAction<OutageDetailResponse>) => {
        state.currentOutageLoading = false
        state.currentOutageError = null
        state.currentOutage = action.payload.data

        // Also update the outage in the list if it exists
        const index = state.outages.findIndex((outage) => outage.id === action.payload.data.id)
        if (index !== -1) {
          state.outages[index] = action.payload.data
        }
      })
      .addCase(fetchOutageById.rejected, (state, action) => {
        state.currentOutageLoading = false
        state.currentOutageError = (action.payload as string) || "Failed to fetch outage details"
        state.currentOutage = null
      })
      // Create outage cases
      .addCase(createOutage.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createOutage.fulfilled, (state, action: PayloadAction<CreateOutageResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null
        // Add the new outage to the beginning of the list
        state.outages.unshift(action.payload.data)
        state.totalCount += 1
      })
      .addCase(createOutage.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create outage"
        state.createSuccess = false
      })
  },
})

export const {
  clearOutages,
  clearCreateOutageState,
  clearError,
  clearCurrentOutage,
  resetOutageState,
  setCurrentOutage,
  updateOutageInList,
  addOutageToList,
  removeOutageFromList,
  setRequestParams,
  setPagination,
  nextPage,
  previousPage,
  goToPage,
  filterByStatus,
  filterByPriority,
  filterByScope,
  filterByCustomerGenerated,
  searchOutages,
  clearFilters,
} = outageSlice.actions

export default outageSlice.reducer
