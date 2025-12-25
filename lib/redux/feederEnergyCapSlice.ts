// src/lib/redux/feederEnergyCapSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Feeder Energy Cap
export interface FeederEnergyCap {
  id: number
  feederId: number
  period: string
  energyCapKwh: number
  tariffOverridePerKwh: number
  capturedAtUtc: string
  capturedByUserId: number
  capturedByName: string
  notes: string
}

export interface FeederEnergyCapsResponse {
  isSuccess: boolean
  message: string
  data: FeederEnergyCap[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface FeederEnergyCapResponse {
  isSuccess: boolean
  message: string
  data: FeederEnergyCap
}

export interface ApplyFeederEnergyCapsRequest {
  billingPeriodId: number
  energyCapKwh: number
  tariffOverridePerKwh: number
  notes: string
  areaOfficeId: number
}

export interface CreateSingleFeederEnergyCapRequest {
  feederId: number
  billingPeriodId: number
  energyCapKwh: number
  tariffOverridePerKwh: number
  notes: string
}

export interface CreateSingleFeederEnergyCapResponse {
  isSuccess: boolean
  message: string
  data: FeederEnergyCap
}

export interface ApplyFeederEnergyCapsResponse {
  isSuccess: boolean
  message: string
  data: FeederEnergyCap[]
}

export interface FeederEnergyCapsRequestParams {
  pageNumber: number
  pageSize: number
  billingPeriodId?: number
  feederId?: number
  areaOfficeId?: number
  companyId?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Feeder Energy Cap State
interface FeederEnergyCapState {
  // Feeder energy caps list state
  feederEnergyCaps: FeederEnergyCap[]
  feederEnergyCapsLoading: boolean
  feederEnergyCapsError: string | null
  feederEnergyCapsSuccess: boolean

  // Single feeder energy cap state
  selectedFeederEnergyCap: FeederEnergyCap | null
  selectedFeederEnergyCapLoading: boolean
  selectedFeederEnergyCapError: string | null
  selectedFeederEnergyCapSuccess: boolean

  // Apply all feeder energy caps state
  applyFeederEnergyCapsLoading: boolean
  applyFeederEnergyCapsError: string | null
  applyFeederEnergyCapsSuccess: boolean
  appliedFeederEnergyCaps: FeederEnergyCap[]

  // Create single feeder energy cap state
  createSingleFeederEnergyCapLoading: boolean
  createSingleFeederEnergyCapError: string | null
  createSingleFeederEnergyCapSuccess: boolean
  createdSingleFeederEnergyCap: FeederEnergyCap | null

  // Pagination state
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // General state
  loading: boolean
  error: string | null
}

// Initial state
const initialState: FeederEnergyCapState = {
  feederEnergyCaps: [],
  feederEnergyCapsLoading: false,
  feederEnergyCapsError: null,
  feederEnergyCapsSuccess: false,
  selectedFeederEnergyCap: null,
  selectedFeederEnergyCapLoading: false,
  selectedFeederEnergyCapError: null,
  selectedFeederEnergyCapSuccess: false,
  applyFeederEnergyCapsLoading: false,
  applyFeederEnergyCapsError: null,
  applyFeederEnergyCapsSuccess: false,
  appliedFeederEnergyCaps: [],

  // Create single feeder energy cap state
  createSingleFeederEnergyCapLoading: false,
  createSingleFeederEnergyCapError: null,
  createSingleFeederEnergyCapSuccess: false,
  createdSingleFeederEnergyCap: null,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 50,
    hasNext: false,
    hasPrevious: false,
  },
  loading: false,
  error: null,
}

// Async thunks - GET request for list
export const fetchFeederEnergyCaps = createAsyncThunk(
  "feederEnergyCap/fetchFeederEnergyCaps",
  async (params: FeederEnergyCapsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, billingPeriodId, feederId, areaOfficeId, companyId, sortBy, sortOrder } = params

      const response = await api.get<FeederEnergyCapsResponse>(buildApiUrl(API_ENDPOINTS.FEEDER_ENERGY_CAP.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(billingPeriodId !== undefined && { BillingPeriodId: billingPeriodId }),
          ...(feederId !== undefined && { FeederId: feederId }),
          ...(areaOfficeId !== undefined && { AreaOfficeId: areaOfficeId }),
          ...(companyId !== undefined && { CompanyId: companyId }),
          ...(sortBy && { SortBy: sortBy }),
          ...(sortOrder && { SortOrder: sortOrder }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch feeder energy caps")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch feeder energy caps")
      }
      return rejectWithValue(error.message || "Network error during feeder energy caps fetch")
    }
  }
)

// Async thunks - GET request by ID
export const fetchFeederEnergyCapById = createAsyncThunk(
  "feederEnergyCap/fetchFeederEnergyCapById",
  async (id: number, { rejectWithValue }) => {
    try {
      const url = buildApiUrl(API_ENDPOINTS.FEEDER_ENERGY_CAP.GET_BY_ID).replace("{id}", id.toString())

      const response = await api.get<FeederEnergyCapResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch feeder energy cap")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch feeder energy cap")
      }
      return rejectWithValue(error.message || "Network error during feeder energy cap fetch")
    }
  }
)

// Async thunks - POST request to apply all feeder energy caps
export const applyFeederEnergyCaps = createAsyncThunk(
  "feederEnergyCap/applyFeederEnergyCaps",
  async (requestData: ApplyFeederEnergyCapsRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<ApplyFeederEnergyCapsResponse>(
        buildApiUrl(API_ENDPOINTS.FEEDER_ENERGY_CAP.ADD),
        requestData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to apply feeder energy caps")
      }

      return response.data
    } catch (error: any) {
      console.error("Error applying feeder energy caps:", error)
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message)
      }
      return rejectWithValue(error.message || "Failed to apply feeder energy caps")
    }
  }
)

// Async thunks - POST request to create single feeder energy cap
export const createSingleFeederEnergyCap = createAsyncThunk(
  "feederEnergyCap/createSingleFeederEnergyCap",
  async (requestData: CreateSingleFeederEnergyCapRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateSingleFeederEnergyCapResponse>(
        buildApiUrl(API_ENDPOINTS.FEEDER_ENERGY_CAP.CREATE_SINGLE),
        requestData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create feeder energy cap")
      }

      return response.data
    } catch (error: any) {
      console.error("Error creating feeder energy cap:", error)
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message)
      }
      return rejectWithValue(error.message || "Failed to create feeder energy cap")
    }
  }
)

// Feeder Energy Cap slice
const feederEnergyCapSlice = createSlice({
  name: "feederEnergyCap",
  initialState,
  reducers: {
    // Clear feeder energy caps state
    clearFeederEnergyCaps: (state) => {
      state.feederEnergyCaps = []
      state.feederEnergyCapsError = null
      state.feederEnergyCapsSuccess = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 50,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear selected feeder energy cap state
    clearSelectedFeederEnergyCap: (state) => {
      state.selectedFeederEnergyCap = null
      state.selectedFeederEnergyCapError = null
      state.selectedFeederEnergyCapSuccess = false
      state.selectedFeederEnergyCapLoading = false
    },

    // Clear apply feeder energy caps state
    clearApplyFeederEnergyCaps: (state) => {
      state.applyFeederEnergyCapsLoading = false
      state.applyFeederEnergyCapsError = null
      state.applyFeederEnergyCapsSuccess = false
      state.appliedFeederEnergyCaps = []
    },

    // Clear create single feeder energy cap state
    clearCreateSingleFeederEnergyCap: (state) => {
      state.createSingleFeederEnergyCapLoading = false
      state.createSingleFeederEnergyCapError = null
      state.createSingleFeederEnergyCapSuccess = false
      state.createdSingleFeederEnergyCap = null
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.feederEnergyCapsError = null
      state.selectedFeederEnergyCapError = null
      state.applyFeederEnergyCapsError = null
      state.createSingleFeederEnergyCapError = null
    },

    // Reset feeder energy cap state
    resetFeederEnergyCapState: (state) => {
      state.feederEnergyCaps = []
      state.feederEnergyCapsLoading = false
      state.feederEnergyCapsError = null
      state.feederEnergyCapsSuccess = false
      state.selectedFeederEnergyCap = null
      state.selectedFeederEnergyCapLoading = false
      state.selectedFeederEnergyCapError = null
      state.selectedFeederEnergyCapSuccess = false
      state.applyFeederEnergyCapsLoading = false
      state.applyFeederEnergyCapsError = null
      state.applyFeederEnergyCapsSuccess = false
      state.appliedFeederEnergyCaps = []
      state.createSingleFeederEnergyCapLoading = false
      state.createSingleFeederEnergyCapError = null
      state.createSingleFeederEnergyCapSuccess = false
      state.createdSingleFeederEnergyCap = null
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 50,
        hasNext: false,
        hasPrevious: false,
      }
      state.loading = false
      state.error = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Update feeder energy cap in list
    updateFeederEnergyCapInList: (state, action: PayloadAction<FeederEnergyCap>) => {
      const index = state.feederEnergyCaps.findIndex((fec) => fec.id === action.payload.id)
      if (index !== -1) {
        state.feederEnergyCaps[index] = action.payload
      }
    },

    // Update selected feeder energy cap
    updateSelectedFeederEnergyCap: (state, action: PayloadAction<FeederEnergyCap>) => {
      state.selectedFeederEnergyCap = action.payload
    },

    // Update energy cap value
    updateEnergyCapValue: (state, action: PayloadAction<{ id: number; energyCapKwh: number }>) => {
      const { id, energyCapKwh } = action.payload
      const feeder = state.feederEnergyCaps.find((fec) => fec.id === id)
      if (feeder) {
        feeder.energyCapKwh = energyCapKwh
      }
      // Also update selected feeder energy cap if it matches the ID
      if (state.selectedFeederEnergyCap && state.selectedFeederEnergyCap.id === id) {
        state.selectedFeederEnergyCap.energyCapKwh = energyCapKwh
      }
    },

    updateTariffOverride: (state, action: PayloadAction<{ id: number; tariffOverridePerKwh: number }>) => {
      const { id, tariffOverridePerKwh } = action.payload
      const feeder = state.feederEnergyCaps.find((fec) => fec.id === id)
      if (feeder) {
        feeder.tariffOverridePerKwh = tariffOverridePerKwh
      }
      // Also update selected feeder energy cap if it matches the ID
      if (state.selectedFeederEnergyCap && state.selectedFeederEnergyCap.id === id) {
        state.selectedFeederEnergyCap.tariffOverridePerKwh = tariffOverridePerKwh
      }
    },

    updateNotes: (state, action: PayloadAction<{ id: number; notes: string }>) => {
      const { id, notes } = action.payload
      const feeder = state.feederEnergyCaps.find((fec) => fec.id === id)
      if (feeder) {
        feeder.notes = notes
      }
      // Also update selected feeder energy cap if it matches the ID
      if (state.selectedFeederEnergyCap && state.selectedFeederEnergyCap.id === id) {
        state.selectedFeederEnergyCap.notes = notes
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feeder energy caps cases
      .addCase(fetchFeederEnergyCaps.pending, (state) => {
        state.feederEnergyCapsLoading = true
        state.feederEnergyCapsError = null
        state.feederEnergyCapsSuccess = false
        state.loading = true
      })
      .addCase(fetchFeederEnergyCaps.fulfilled, (state, action: PayloadAction<FeederEnergyCapsResponse>) => {
        state.feederEnergyCapsLoading = false
        state.feederEnergyCapsSuccess = true
        state.loading = false
        state.feederEnergyCaps = action.payload.data || []
        state.pagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 50,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.feederEnergyCapsError = null
      })
      .addCase(fetchFeederEnergyCaps.rejected, (state, action) => {
        state.feederEnergyCapsLoading = false
        state.loading = false
        state.feederEnergyCapsError = (action.payload as string) || "Failed to fetch feeder energy caps"
        state.feederEnergyCapsSuccess = false
        state.feederEnergyCaps = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch feeder energy cap by ID cases
      .addCase(fetchFeederEnergyCapById.pending, (state) => {
        state.selectedFeederEnergyCapLoading = true
        state.selectedFeederEnergyCapError = null
        state.selectedFeederEnergyCapSuccess = false
        state.loading = true
      })
      .addCase(fetchFeederEnergyCapById.fulfilled, (state, action: PayloadAction<FeederEnergyCapResponse>) => {
        state.selectedFeederEnergyCapLoading = false
        state.selectedFeederEnergyCapSuccess = true
        state.loading = false
        state.selectedFeederEnergyCap = action.payload.data
        state.selectedFeederEnergyCapError = null
      })
      .addCase(fetchFeederEnergyCapById.rejected, (state, action) => {
        state.selectedFeederEnergyCapLoading = false
        state.loading = false
        state.selectedFeederEnergyCapError = (action.payload as string) || "Failed to fetch feeder energy cap"
        state.selectedFeederEnergyCapSuccess = false
        state.selectedFeederEnergyCap = null
      })
      // Apply feeder energy caps cases
      .addCase(applyFeederEnergyCaps.pending, (state) => {
        state.applyFeederEnergyCapsLoading = true
        state.applyFeederEnergyCapsError = null
        state.applyFeederEnergyCapsSuccess = false
        state.loading = true
      })
      .addCase(applyFeederEnergyCaps.fulfilled, (state, action: PayloadAction<ApplyFeederEnergyCapsResponse>) => {
        state.applyFeederEnergyCapsLoading = false
        state.applyFeederEnergyCapsSuccess = true
        state.loading = false
        state.appliedFeederEnergyCaps = action.payload.data || []
        state.applyFeederEnergyCapsError = null

        // Optionally update the main list with the applied data
        if (action.payload.data && action.payload.data.length > 0) {
          // You can choose to merge with existing data or replace it
          // For now, we'll just store it separately in appliedFeederEnergyCaps
        }
      })
      .addCase(applyFeederEnergyCaps.rejected, (state, action) => {
        state.applyFeederEnergyCapsLoading = false
        state.loading = false
        state.applyFeederEnergyCapsError = (action.payload as string) || "Failed to apply feeder energy caps"
        state.applyFeederEnergyCapsSuccess = false
        state.appliedFeederEnergyCaps = []
      })
      // Create single feeder energy cap cases
      .addCase(createSingleFeederEnergyCap.pending, (state) => {
        state.createSingleFeederEnergyCapLoading = true
        state.createSingleFeederEnergyCapError = null
        state.createSingleFeederEnergyCapSuccess = false
        state.loading = true
      })
      .addCase(
        createSingleFeederEnergyCap.fulfilled,
        (state, action: PayloadAction<CreateSingleFeederEnergyCapResponse>) => {
          state.createSingleFeederEnergyCapLoading = false
          state.createSingleFeederEnergyCapSuccess = true
          state.loading = false
          state.createdSingleFeederEnergyCap = action.payload.data || null
          state.createSingleFeederEnergyCapError = null

          // Optionally add the new cap to the main list
          if (action.payload.data) {
            state.feederEnergyCaps.unshift(action.payload.data)
          }
        }
      )
      .addCase(createSingleFeederEnergyCap.rejected, (state, action) => {
        state.createSingleFeederEnergyCapLoading = false
        state.loading = false
        state.createSingleFeederEnergyCapError = (action.payload as string) || "Failed to create feeder energy cap"
        state.createSingleFeederEnergyCapSuccess = false
        state.createdSingleFeederEnergyCap = null
      })
  },
})

export const {
  clearFeederEnergyCaps,
  clearSelectedFeederEnergyCap,
  clearApplyFeederEnergyCaps,
  clearCreateSingleFeederEnergyCap,
  clearError,
  resetFeederEnergyCapState,
  setPagination,
  updateFeederEnergyCapInList,
  updateSelectedFeederEnergyCap,
  updateEnergyCapValue,
  updateTariffOverride,
  updateNotes,
} = feederEnergyCapSlice.actions

export default feederEnergyCapSlice.reducer
