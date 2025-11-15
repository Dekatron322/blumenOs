// src/lib/redux/injectionSubstationSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for InjectionSubstation
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

export interface HTPole {
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
  htPole: HTPole
}

export interface InjectionSubstation {
  id: number
  nercCode: string
  injectionSubstationCode: string
  areaOffice: AreaOffice
  feeders?: Feeder[]
}

export interface InjectionSubstationsResponse {
  isSuccess: boolean
  message: string
  data: InjectionSubstation[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface InjectionSubstationResponse {
  isSuccess: boolean
  message: string
  data: InjectionSubstation[]
}

export interface SingleInjectionSubstationResponse {
  isSuccess: boolean
  message: string
  data: InjectionSubstation
}

export interface InjectionSubstationsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Request interfaces for adding injection substation
export interface CreateInjectionSubstationRequest {
  areaOfficeId: number
  nercCode: string
  injectionSubstationCode: string
}

export interface UpdateInjectionSubstationRequest {
  areaOfficeId: number
  nercCode: string
  injectionSubstationCode: string
}

export type CreateInjectionSubstationRequestPayload = CreateInjectionSubstationRequest[]

// InjectionSubstation State
interface InjectionSubstationState {
  // InjectionSubstations list state
  injectionSubstations: InjectionSubstation[]
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

  // Current injectionSubstation state (for viewing/editing)
  currentInjectionSubstation: InjectionSubstation | null
  currentInjectionSubstationLoading: boolean
  currentInjectionSubstationError: string | null

  // Create injectionSubstation state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update injectionSubstation state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean
}

// Initial state
const initialState: InjectionSubstationState = {
  injectionSubstations: [],
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
  currentInjectionSubstation: null,
  currentInjectionSubstationLoading: false,
  currentInjectionSubstationError: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
}

// Async thunks
export const fetchInjectionSubstations = createAsyncThunk(
  "injectionSubstations/fetchInjectionSubstations",
  async (params: InjectionSubstationsRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<InjectionSubstationsResponse>(
        buildApiUrl(API_ENDPOINTS.INJECTION_SUBSTATION.GET),
        {
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
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch injection substations")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch injection substations")
      }
      return rejectWithValue(error.message || "Network error during injection substations fetch")
    }
  }
)

export const fetchInjectionSubstationById = createAsyncThunk<InjectionSubstation, number, { rejectValue: string }>(
  "injectionSubstations/fetchInjectionSubstationById",
  async (injectionSubstationId: number, { rejectWithValue }) => {
    try {
      // Use the new GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.INJECTION_SUBSTATION.GET_BY_ID.replace("{id}", injectionSubstationId.toString())

      const response = await api.get<SingleInjectionSubstationResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch injection substation")
      }

      const injectionSubstation = response.data.data
      if (!injectionSubstation) {
        return rejectWithValue("Injection substation not found")
      }

      return injectionSubstation
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch injection substation")
      }
      return rejectWithValue(error.message || "Network error during injection substation fetch")
    }
  }
)

export const createInjectionSubstation = createAsyncThunk(
  "injectionSubstations/createInjectionSubstation",
  async (injectionSubstationData: CreateInjectionSubstationRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of injection substation requests
      const response = await api.post<InjectionSubstationResponse>(
        buildApiUrl(API_ENDPOINTS.INJECTION_SUBSTATION.ADD),
        injectionSubstationData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create injection substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create injection substation")
      }
      return rejectWithValue(error.message || "Network error during injection substation creation")
    }
  }
)

export const createSingleInjectionSubstation = createAsyncThunk(
  "injectionSubstations/createSingleInjectionSubstation",
  async (injectionSubstationData: CreateInjectionSubstationRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreateInjectionSubstationRequestPayload = [injectionSubstationData]

      const response = await api.post<InjectionSubstationResponse>(
        buildApiUrl(API_ENDPOINTS.INJECTION_SUBSTATION.ADD),
        payload
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create injection substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create injection substation")
      }
      return rejectWithValue(error.message || "Network error during injection substation creation")
    }
  }
)

export const updateInjectionSubstation = createAsyncThunk(
  "injectionSubstations/updateInjectionSubstation",
  async (
    { id, injectionSubstationData }: { id: number; injectionSubstationData: UpdateInjectionSubstationRequest },
    { rejectWithValue }
  ) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.INJECTION_SUBSTATION.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SingleInjectionSubstationResponse>(buildApiUrl(endpoint), injectionSubstationData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update injection substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update injection substation")
      }
      return rejectWithValue(error.message || "Network error during injection substation update")
    }
  }
)

// InjectionSubstation slice
const injectionSubstationSlice = createSlice({
  name: "injectionSubstations",
  initialState,
  reducers: {
    // Clear injectionSubstations state
    clearInjectionSubstations: (state) => {
      state.injectionSubstations = []
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
      state.currentInjectionSubstationError = null
      state.createError = null
      state.updateError = null
    },

    // Clear current injectionSubstation
    clearCurrentInjectionSubstation: (state) => {
      state.currentInjectionSubstation = null
      state.currentInjectionSubstationError = null
    },

    // Reset injectionSubstation state
    resetInjectionSubstationState: (state) => {
      state.injectionSubstations = []
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
      state.currentInjectionSubstation = null
      state.currentInjectionSubstationLoading = false
      state.currentInjectionSubstationError = null
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

    // Set current injection substation (for forms, etc.)
    setCurrentInjectionSubstation: (state, action: PayloadAction<InjectionSubstation | null>) => {
      state.currentInjectionSubstation = action.payload
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
      // Fetch injectionSubstations cases
      .addCase(fetchInjectionSubstations.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchInjectionSubstations.fulfilled, (state, action: PayloadAction<InjectionSubstationsResponse>) => {
        state.loading = false
        state.success = true
        state.injectionSubstations = action.payload.data
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
      .addCase(fetchInjectionSubstations.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch injection substations"
        state.success = false
        state.injectionSubstations = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch injectionSubstation by ID cases
      .addCase(fetchInjectionSubstationById.pending, (state) => {
        state.currentInjectionSubstationLoading = true
        state.currentInjectionSubstationError = null
      })
      .addCase(fetchInjectionSubstationById.fulfilled, (state, action: PayloadAction<InjectionSubstation>) => {
        state.currentInjectionSubstationLoading = false
        state.currentInjectionSubstation = action.payload
        state.currentInjectionSubstationError = null
      })
      .addCase(fetchInjectionSubstationById.rejected, (state, action) => {
        state.currentInjectionSubstationLoading = false
        state.currentInjectionSubstationError = (action.payload as string) || "Failed to fetch injection substation"
        state.currentInjectionSubstation = null
      })
      // Create injection substation cases
      .addCase(createInjectionSubstation.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createInjectionSubstation.fulfilled, (state, action: PayloadAction<InjectionSubstationResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created injection substation to the list
        if (action.payload.data && action.payload.data.length > 0) {
          state.injectionSubstations.unshift(...action.payload.data)
        }
      })
      .addCase(createInjectionSubstation.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create injection substation"
        state.createSuccess = false
      })
      // Create single injection substation cases
      .addCase(createSingleInjectionSubstation.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(
        createSingleInjectionSubstation.fulfilled,
        (state, action: PayloadAction<InjectionSubstationResponse>) => {
          state.createLoading = false
          state.createSuccess = true
          state.createError = null

          // Optionally add the newly created injection substation to the list
          if (action.payload.data && action.payload.data.length > 0) {
            const newInjectionSubstation = action.payload.data[0]
            if (newInjectionSubstation) {
              state.injectionSubstations.unshift(newInjectionSubstation)
            }
          }
        }
      )
      .addCase(createSingleInjectionSubstation.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create injection substation"
        state.createSuccess = false
      })
      // Update injection substation cases
      .addCase(updateInjectionSubstation.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(
        updateInjectionSubstation.fulfilled,
        (state, action: PayloadAction<SingleInjectionSubstationResponse>) => {
          state.updateLoading = false
          state.updateSuccess = true
          state.updateError = null

          // Update the injection substation in the current list
          const updatedInjectionSubstation = action.payload.data
          const index = state.injectionSubstations.findIndex((is) => is.id === updatedInjectionSubstation.id)
          if (index !== -1) {
            state.injectionSubstations[index] = updatedInjectionSubstation
          }

          // Update current injection substation if it's the one being edited
          if (
            state.currentInjectionSubstation &&
            state.currentInjectionSubstation.id === updatedInjectionSubstation.id
          ) {
            state.currentInjectionSubstation = updatedInjectionSubstation
          }
        }
      )
      .addCase(updateInjectionSubstation.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update injection substation"
        state.updateSuccess = false
      })
  },
})

export const {
  clearInjectionSubstations,
  clearError,
  clearCurrentInjectionSubstation,
  resetInjectionSubstationState,
  setPagination,
  setCurrentInjectionSubstation,
  clearCreateState,
  clearUpdateState,
} = injectionSubstationSlice.actions

export default injectionSubstationSlice.reducer
