// src/lib/redux/feedersSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Feeder
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
  latitude: number
  longitude: number
  company: Company
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

export interface DistributionSubstation {
  id: number
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  status: string
  feeder: Feeder
}

export interface Feeder {
  id: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
  injectionSubstation: InjectionSubstation
  htPole: HtPole
  distributionSubstations?: DistributionSubstation[]
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

export interface FeederResponse {
  isSuccess: boolean
  message: string
  data: Feeder[]
}

export interface SingleFeederResponse {
  isSuccess: boolean
  message: string
  data: Feeder
}

export interface FeedersRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Request interfaces for adding feeder
export interface CreateFeederRequest {
  injectionSubstationId: number
  htPoleId: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
}

export interface UpdateFeederRequest {
  injectionSubstationId: number
  htPoleId: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
}

export type CreateFeederRequestPayload = CreateFeederRequest[]

// Feeder State
interface FeederState {
  // Feeders list state
  feeders: Feeder[]
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

  // Current feeder state (for viewing/editing)
  currentFeeder: Feeder | null
  currentFeederLoading: boolean
  currentFeederError: string | null

  // Create feeder state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update feeder state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean
}

// Initial state
const initialState: FeederState = {
  feeders: [],
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
  currentFeeder: null,
  currentFeederLoading: false,
  currentFeederError: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
}

// Async thunks
export const fetchFeeders = createAsyncThunk(
  "feeders/fetchFeeders",
  async (params: FeedersRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        search,
        companyId,
        areaOfficeId,
        injectionSubstationId,
        feederId,
        serviceCenterId,
      } = params

      const response = await api.get<FeedersResponse>(buildApiUrl(API_ENDPOINTS.FEEDERS.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(search && { Search: search }),
          ...(companyId && { CompanyId: companyId }),
          ...(areaOfficeId && { AreaOfficeId: areaOfficeId }),
          ...(injectionSubstationId && { InjectionSubstationId: injectionSubstationId }),
          ...(feederId && { FeederId: feederId }),
          ...(serviceCenterId && { ServiceCenterId: serviceCenterId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch feeders")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch feeders")
      }
      return rejectWithValue(error.message || "Network error during feeders fetch")
    }
  }
)

export const fetchFeederById = createAsyncThunk<Feeder, number, { rejectValue: string }>(
  "feeders/fetchFeederById",
  async (feederId: number, { rejectWithValue }) => {
    try {
      // Use the new GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.FEEDERS.GET_BY_ID.replace("{id}", feederId.toString())

      const response = await api.get<SingleFeederResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch feeder")
      }

      const feeder = response.data.data
      if (!feeder) {
        return rejectWithValue("Feeder not found")
      }

      return feeder
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch feeder")
      }
      return rejectWithValue(error.message || "Network error during feeder fetch")
    }
  }
)

export const createFeeder = createAsyncThunk(
  "feeders/createFeeder",
  async (feederData: CreateFeederRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of feeder requests
      const response = await api.post<FeederResponse>(buildApiUrl(API_ENDPOINTS.FEEDERS.ADD), feederData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create feeder")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create feeder")
      }
      return rejectWithValue(error.message || "Network error during feeder creation")
    }
  }
)

export const createSingleFeeder = createAsyncThunk(
  "feeders/createSingleFeeder",
  async (feederData: CreateFeederRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreateFeederRequestPayload = [feederData]

      const response = await api.post<FeederResponse>(buildApiUrl(API_ENDPOINTS.FEEDERS.ADD), payload)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create feeder")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create feeder")
      }
      return rejectWithValue(error.message || "Network error during feeder creation")
    }
  }
)

export const updateFeeder = createAsyncThunk(
  "feeders/updateFeeder",
  async ({ id, feederData }: { id: number; feederData: UpdateFeederRequest }, { rejectWithValue }) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.FEEDERS.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SingleFeederResponse>(buildApiUrl(endpoint), feederData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update feeder")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update feeder")
      }
      return rejectWithValue(error.message || "Network error during feeder update")
    }
  }
)

// Feeder slice
const feedersSlice = createSlice({
  name: "feeders",
  initialState,
  reducers: {
    // Clear feeders state
    clearFeeders: (state) => {
      state.feeders = []
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
      state.currentFeederError = null
      state.createError = null
      state.updateError = null
    },

    // Clear current feeder
    clearCurrentFeeder: (state) => {
      state.currentFeeder = null
      state.currentFeederError = null
    },

    // Reset feeder state
    resetFeederState: (state) => {
      state.feeders = []
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
      state.currentFeeder = null
      state.currentFeederLoading = false
      state.currentFeederError = null
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

    // Set current feeder (for forms, etc.)
    setCurrentFeeder: (state, action: PayloadAction<Feeder | null>) => {
      state.currentFeeder = action.payload
    },

    // Clear create state
    clearCreateState: (state) => {
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
    },

    // Clear update state
    clearUpdateState: (state) => {
      state.updateLoading = false
      state.updateError = null
      state.updateSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feeders cases
      .addCase(fetchFeeders.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchFeeders.fulfilled, (state, action: PayloadAction<FeedersResponse>) => {
        state.loading = false
        state.success = true
        state.feeders = action.payload.data
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
      .addCase(fetchFeeders.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch feeders"
        state.success = false
        state.feeders = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch feeder by ID cases
      .addCase(fetchFeederById.pending, (state) => {
        state.currentFeederLoading = true
        state.currentFeederError = null
      })
      .addCase(fetchFeederById.fulfilled, (state, action: PayloadAction<Feeder>) => {
        state.currentFeederLoading = false
        state.currentFeeder = action.payload
        state.currentFeederError = null
      })
      .addCase(fetchFeederById.rejected, (state, action) => {
        state.currentFeederLoading = false
        state.currentFeederError = (action.payload as string) || "Failed to fetch feeder"
        state.currentFeeder = null
      })
      // Create feeder cases
      .addCase(createFeeder.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createFeeder.fulfilled, (state, action: PayloadAction<FeederResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created feeder to the list
        if (action.payload.data && action.payload.data.length > 0) {
          state.feeders.unshift(...action.payload.data)
        }
      })
      .addCase(createFeeder.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create feeder"
        state.createSuccess = false
      })
      // Create single feeder cases
      .addCase(createSingleFeeder.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createSingleFeeder.fulfilled, (state, action: PayloadAction<FeederResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created feeder to the list
        if (action.payload.data && action.payload.data.length > 0) {
          const newFeeder = action.payload.data[0]
          if (newFeeder) {
            state.feeders.unshift(newFeeder)
          }
        }
      })
      .addCase(createSingleFeeder.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create feeder"
        state.createSuccess = false
      })
      // Update feeder cases
      .addCase(updateFeeder.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateFeeder.fulfilled, (state, action: PayloadAction<SingleFeederResponse>) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.updateError = null

        // Update the feeder in the current list
        const updatedFeeder = action.payload.data
        const index = state.feeders.findIndex((f) => f.id === updatedFeeder.id)
        if (index !== -1) {
          state.feeders[index] = updatedFeeder
        }

        // Update current feeder if it's the one being edited
        if (state.currentFeeder && state.currentFeeder.id === updatedFeeder.id) {
          state.currentFeeder = updatedFeeder
        }
      })
      .addCase(updateFeeder.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update feeder"
        state.updateSuccess = false
      })
  },
})

export const {
  clearFeeders,
  clearError,
  clearCurrentFeeder,
  resetFeederState,
  setPagination,
  setCurrentFeeder,
  clearCreateState,
  clearUpdateState,
} = feedersSlice.actions

export default feedersSlice.reducer
