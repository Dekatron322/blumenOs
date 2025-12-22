// src/lib/redux/maintenanceSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Maintenance
export interface Maintenance {
  id: number
  referenceCode: string
  title: string
  type: number
  priority: number
  status: number
  scope: number
  distributionSubstationId: number
  feederId: number
  distributionSubstationName: string
  feederName: string
  affectedCustomerCount: number
  scheduledStartAt: string
  scheduledEndAt: string
  actualStartAt: string
  completedAt: string
  durationHours: number
  details: string
  resolutionSummary: string
  requiresShutdown: boolean
  customerNotified: boolean
}

export interface MaintenanceResponse {
  isSuccess: boolean
  message: string
  data: Maintenance[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface MaintenanceRequestParams {
  pageNumber: number
  pageSize: number
  status?: number
  priority?: number
  type?: number
  scope?: number
  distributionSubstationId?: number
  feederId?: number
  from?: string
  to?: string
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Create Maintenance Request
export interface CreateMaintenanceRequest {
  title: string
  details: string
  type: number
  priority: number
  scheduledStartAt: string
  scheduledEndAt: string
  distributionSubstationId: number
  feederId: number
  scope: number
  requiresShutdown: boolean
  customerNotified: boolean
}

export interface CreateMaintenanceResponse {
  isSuccess: boolean
  message: string
  data: Maintenance
}

// Get Maintenance By ID Response
export interface MaintenanceByIdResponse {
  isSuccess: boolean
  message: string
  data: Maintenance
}

// Update Maintenance Request
export interface UpdateMaintenanceRequest {
  status?: number
  priority?: number
  type?: number
  details?: string
  resolutionSummary?: string
  actualStartAt?: string
  completedAt?: string
  customerNotified?: boolean
}

export interface UpdateMaintenanceResponse {
  isSuccess: boolean
  message: string
  data: Maintenance
}

// Maintenance State
interface MaintenanceState {
  // Maintenance list state
  maintenances: Maintenance[]
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

  // Current maintenance state (for viewing/editing)
  currentMaintenance: Maintenance | null
  currentMaintenanceLoading: boolean
  currentMaintenanceError: string | null

  // Create maintenance state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update maintenance state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean

  // Filters for querying maintenances (excluding pagination fields)
  filters: Partial<Omit<MaintenanceRequestParams, "pageNumber" | "pageSize">>
}

// Initial state
const initialState: MaintenanceState = {
  maintenances: [],
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
  currentMaintenance: null,
  currentMaintenanceLoading: false,
  currentMaintenanceError: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  filters: {},
}

// Async thunks
export const fetchMaintenances = createAsyncThunk(
  "maintenances/fetchMaintenances",
  async (params: MaintenanceRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        status,
        priority,
        type,
        scope,
        distributionSubstationId,
        feederId,
        from,
        to,
        search,
        sortBy,
        sortOrder,
      } = params

      const response = await api.get<MaintenanceResponse>(buildApiUrl(API_ENDPOINTS.MAINTENANCE.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(status !== undefined && { Status: status }),
          ...(priority !== undefined && { Priority: priority }),
          ...(type !== undefined && { Type: type }),
          ...(scope !== undefined && { Scope: scope }),
          ...(distributionSubstationId !== undefined && { DistributionSubstationId: distributionSubstationId }),
          ...(feederId !== undefined && { FeederId: feederId }),
          ...(from && { From: from }),
          ...(to && { To: to }),
          ...(search && { Search: search }),
          ...(sortBy && { SortBy: sortBy }),
          ...(sortOrder && { SortOrder: sortOrder }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch maintenances")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch maintenances")
      }
      return rejectWithValue(error.message || "Network error during maintenances fetch")
    }
  }
)

export const createMaintenance = createAsyncThunk(
  "maintenances/createMaintenance",
  async (maintenanceData: CreateMaintenanceRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateMaintenanceResponse>(
        buildApiUrl(API_ENDPOINTS.MAINTENANCE.ADD),
        maintenanceData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create maintenance")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create maintenance")
      }
      return rejectWithValue(error.message || "Network error during maintenance creation")
    }
  }
)

export const fetchMaintenanceById = createAsyncThunk(
  "maintenances/fetchMaintenanceById",
  async (maintenanceId: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MAINTENANCE.GET_BY_ID.replace("{id}", maintenanceId.toString()))
      const response = await api.get<MaintenanceByIdResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch maintenance details")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch maintenance details")
      }
      return rejectWithValue(error.message || "Network error during maintenance details fetch")
    }
  }
)

export const updateMaintenance = createAsyncThunk(
  "maintenances/updateMaintenance",
  async (
    { maintenanceId, updateData }: { maintenanceId: number; updateData: UpdateMaintenanceRequest },
    { rejectWithValue }
  ) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.MAINTENANCE.UPDATE.replace("{id}", maintenanceId.toString()))
      const response = await api.patch<UpdateMaintenanceResponse>(url, updateData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update maintenance")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update maintenance")
      }
      return rejectWithValue(error.message || "Network error during maintenance update")
    }
  }
)

// Maintenance slice
const maintenanceSlice = createSlice({
  name: "maintenances",
  initialState,
  reducers: {
    // Clear maintenances state
    clearMaintenances: (state) => {
      state.maintenances = []
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
      state.currentMaintenanceError = null
      state.createError = null
      state.updateError = null
    },

    // Clear current maintenance
    clearCurrentMaintenance: (state) => {
      state.currentMaintenance = null
      state.currentMaintenanceError = null
    },

    // Reset maintenance state
    resetMaintenanceState: (state) => {
      state.maintenances = []
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
      state.currentMaintenance = null
      state.currentMaintenanceLoading = false
      state.currentMaintenanceError = null
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
      state.updateLoading = false
      state.updateError = null
      state.updateSuccess = false
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set current maintenance (for viewing details)
    setCurrentMaintenance: (state, action: PayloadAction<Maintenance>) => {
      state.currentMaintenance = action.payload
    },

    // Set filters used for fetching maintenances
    setFilters: (state, action: PayloadAction<Partial<Omit<MaintenanceRequestParams, "pageNumber" | "pageSize">>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
      // Whenever filters change, reset to first page
      state.pagination.currentPage = 1
    },

    // Clear all filters
    clearFilters: (state) => {
      state.filters = {}
      state.pagination.currentPage = 1
    },

    // Clear create maintenance state
    clearCreateState: (state) => {
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
    },

    // Clear update maintenance state
    clearUpdateState: (state) => {
      state.updateLoading = false
      state.updateError = null
      state.updateSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch maintenances cases
      .addCase(fetchMaintenances.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchMaintenances.fulfilled, (state, action: PayloadAction<MaintenanceResponse>) => {
        state.loading = false
        state.success = true
        state.maintenances = action.payload.data
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
      .addCase(fetchMaintenances.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch maintenances"
        state.success = false
        state.maintenances = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })

      // Create maintenance cases
      .addCase(createMaintenance.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createMaintenance.fulfilled, (state, action: PayloadAction<CreateMaintenanceResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Add the new maintenance to the beginning of the list
        if (action.payload.data) {
          state.maintenances.unshift(action.payload.data)

          // Update pagination totals
          state.pagination.totalCount += 1
          state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)
        }
      })
      .addCase(createMaintenance.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create maintenance"
        state.createSuccess = false
      })

      // Fetch maintenance by ID cases
      .addCase(fetchMaintenanceById.pending, (state) => {
        state.currentMaintenanceLoading = true
        state.currentMaintenanceError = null
      })
      .addCase(fetchMaintenanceById.fulfilled, (state, action: PayloadAction<MaintenanceByIdResponse>) => {
        state.currentMaintenanceLoading = false
        state.currentMaintenance = action.payload.data
        state.currentMaintenanceError = null
      })
      .addCase(fetchMaintenanceById.rejected, (state, action) => {
        state.currentMaintenanceLoading = false
        state.currentMaintenanceError = (action.payload as string) || "Failed to fetch maintenance details"
        state.currentMaintenance = null
      })

      // Update maintenance cases
      .addCase(updateMaintenance.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateMaintenance.fulfilled, (state, action: PayloadAction<UpdateMaintenanceResponse>) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.updateError = null

        // Update the current maintenance if it's the one being updated
        if (state.currentMaintenance && state.currentMaintenance.id === action.payload.data.id) {
          state.currentMaintenance = action.payload.data
        }

        // Update the maintenance in the list if it exists
        const index = state.maintenances.findIndex((maintenance) => maintenance.id === action.payload.data.id)
        if (index !== -1) {
          state.maintenances[index] = action.payload.data
        }
      })
      .addCase(updateMaintenance.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update maintenance"
        state.updateSuccess = false
      })
  },
})

export const {
  clearMaintenances,
  clearError,
  clearCurrentMaintenance,
  resetMaintenanceState,
  setPagination,
  setCurrentMaintenance,
  setFilters,
  clearFilters,
  clearCreateState,
  clearUpdateState,
} = maintenanceSlice.actions

export default maintenanceSlice.reducer
