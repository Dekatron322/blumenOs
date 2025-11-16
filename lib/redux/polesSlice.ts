// src/lib/redux/polesSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Pole
export interface Pole {
  id: number
  htPoleNumber: string
}

export interface PolesResponse {
  isSuccess: boolean
  message: string
  data: Pole[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PoleResponse {
  isSuccess: boolean
  message: string
  data: Pole[]
}

export interface SinglePoleResponse {
  isSuccess: boolean
  message: string
  data: Pole
}

export interface PolesRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Request interfaces for adding/updating pole
export interface CreatePoleRequest {
  htPoleNumber: string
}

export interface UpdatePoleRequest {
  htPoleNumber: string
}

export type CreatePoleRequestPayload = CreatePoleRequest[]

// Pole State
interface PoleState {
  // Poles list state
  poles: Pole[]
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

  // Current pole state (for viewing/editing)
  currentPole: Pole | null
  currentPoleLoading: boolean
  currentPoleError: string | null

  // Create pole state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update pole state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean
}

// Initial state
const initialState: PoleState = {
  poles: [],
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
  currentPole: null,
  currentPoleLoading: false,
  currentPoleError: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
}

// Async thunks
export const fetchPoles = createAsyncThunk(
  "poles/fetchPoles",
  async (params: PolesRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<PolesResponse>(buildApiUrl(API_ENDPOINTS.HT_POLE.GET), {
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
        return rejectWithValue(response.data.message || "Failed to fetch poles")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch poles")
      }
      return rejectWithValue(error.message || "Network error during poles fetch")
    }
  }
)

export const fetchPoleById = createAsyncThunk<Pole, number, { rejectValue: string }>(
  "poles/fetchPoleById",
  async (poleId: number, { rejectWithValue }) => {
    try {
      // Use the new GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.HT_POLE.GET_BY_ID.replace("{id}", poleId.toString())

      const response = await api.get<SinglePoleResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch pole")
      }

      const pole = response.data.data
      if (!pole) {
        return rejectWithValue("Pole not found")
      }

      return pole
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch pole")
      }
      return rejectWithValue(error.message || "Network error during pole fetch")
    }
  }
)

export const createPole = createAsyncThunk(
  "poles/createPole",
  async (poleData: CreatePoleRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of pole requests
      const response = await api.post<PoleResponse>(buildApiUrl(API_ENDPOINTS.HT_POLE.ADD), poleData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create pole")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create pole")
      }
      return rejectWithValue(error.message || "Network error during pole creation")
    }
  }
)

export const createSinglePole = createAsyncThunk(
  "poles/createSinglePole",
  async (poleData: CreatePoleRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreatePoleRequestPayload = [poleData]

      const response = await api.post<PoleResponse>(buildApiUrl(API_ENDPOINTS.HT_POLE.ADD), payload)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create pole")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create pole")
      }
      return rejectWithValue(error.message || "Network error during pole creation")
    }
  }
)

export const updatePole = createAsyncThunk(
  "poles/updatePole",
  async ({ id, poleData }: { id: number; poleData: UpdatePoleRequest }, { rejectWithValue }) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.HT_POLE.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SinglePoleResponse>(buildApiUrl(endpoint), poleData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update pole")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update pole")
      }
      return rejectWithValue(error.message || "Network error during pole update")
    }
  }
)

// Pole slice
const polesSlice = createSlice({
  name: "poles",
  initialState,
  reducers: {
    // Clear poles state
    clearPoles: (state) => {
      state.poles = []
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
      state.currentPoleError = null
      state.createError = null
      state.updateError = null
    },

    // Clear current pole
    clearCurrentPole: (state) => {
      state.currentPole = null
      state.currentPoleError = null
    },

    // Reset pole state
    resetPoleState: (state) => {
      state.poles = []
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
      state.currentPole = null
      state.currentPoleLoading = false
      state.currentPoleError = null
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

    // Set current pole (for forms, etc.)
    setCurrentPole: (state, action: PayloadAction<Pole | null>) => {
      state.currentPole = action.payload
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
      // Fetch poles cases
      .addCase(fetchPoles.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchPoles.fulfilled, (state, action: PayloadAction<PolesResponse>) => {
        state.loading = false
        state.success = true
        state.poles = action.payload.data
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
      .addCase(fetchPoles.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch poles"
        state.success = false
        state.poles = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch pole by ID cases
      .addCase(fetchPoleById.pending, (state) => {
        state.currentPoleLoading = true
        state.currentPoleError = null
      })
      .addCase(fetchPoleById.fulfilled, (state, action: PayloadAction<Pole>) => {
        state.currentPoleLoading = false
        state.currentPole = action.payload
        state.currentPoleError = null
      })
      .addCase(fetchPoleById.rejected, (state, action) => {
        state.currentPoleLoading = false
        state.currentPoleError = (action.payload as string) || "Failed to fetch pole"
        state.currentPole = null
      })
      // Create pole cases
      .addCase(createPole.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createPole.fulfilled, (state, action: PayloadAction<PoleResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created pole to the list
        if (action.payload.data && action.payload.data.length > 0) {
          state.poles.unshift(...action.payload.data)
        }
      })
      .addCase(createPole.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create pole"
        state.createSuccess = false
      })
      // Create single pole cases
      .addCase(createSinglePole.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createSinglePole.fulfilled, (state, action: PayloadAction<PoleResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created pole to the list
        if (action.payload.data && action.payload.data.length > 0) {
          const newPole = action.payload.data[0]
          if (newPole) {
            state.poles.unshift(newPole)
          }
        }
      })
      .addCase(createSinglePole.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create pole"
        state.createSuccess = false
      })
      // Update pole cases
      .addCase(updatePole.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updatePole.fulfilled, (state, action: PayloadAction<SinglePoleResponse>) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.updateError = null

        // Update the pole in the current list
        const updatedPole = action.payload.data
        const index = state.poles.findIndex((p) => p.id === updatedPole.id)
        if (index !== -1) {
          state.poles[index] = updatedPole
        }

        // Update current pole if it's the one being edited
        if (state.currentPole && state.currentPole.id === updatedPole.id) {
          state.currentPole = updatedPole
        }
      })
      .addCase(updatePole.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update pole"
        state.updateSuccess = false
      })
  },
})

export const {
  clearPoles,
  clearError,
  clearCurrentPole,
  resetPoleState,
  setPagination,
  setCurrentPole,
  clearCreateState,
  clearUpdateState,
} = polesSlice.actions

export default polesSlice.reducer
