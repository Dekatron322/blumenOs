// src/lib/redux/distributionSubstationsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for DistributionSubstation
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
  oldDssCode?: string
}

export interface DistributionSubstationsResponse {
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

export interface DistributionSubstationResponse {
  isSuccess: boolean
  message: string
  data: DistributionSubstation[]
}

export interface SingleDistributionSubstationResponse {
  isSuccess: boolean
  message: string
  data: DistributionSubstation
}

export interface DistributionSubstationsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Request interfaces for adding/updating distribution substation
export interface CreateDistributionSubstationRequest {
  feederId: number
  oldDssCode: string
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  numberOfUnit: number
  unitOneCode: string
  unitTwoCode: string
  unitThreeCode: string
  unitFourCode: string
  publicOrDedicated: string
  status: string
  remarks: string
}

export interface UpdateDistributionSubstationRequest {
  feederId: number
  oldDssCode: string
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  numberOfUnit: number
  unitOneCode: string
  unitTwoCode: string
  unitThreeCode: string
  unitFourCode: string
  publicOrDedicated: string
  status: string
  remarks: string
}

export type CreateDistributionSubstationRequestPayload = CreateDistributionSubstationRequest[]

// DistributionSubstation State
interface DistributionSubstationState {
  // DistributionSubstations list state
  distributionSubstations: DistributionSubstation[]
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

  // Current distributionSubstation state (for viewing/editing)
  currentDistributionSubstation: DistributionSubstation | null
  currentDistributionSubstationLoading: boolean
  currentDistributionSubstationError: string | null

  // Create distribution substation state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update distribution substation state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean
}

// Initial state
const initialState: DistributionSubstationState = {
  distributionSubstations: [],
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
  currentDistributionSubstation: null,
  currentDistributionSubstationLoading: false,
  currentDistributionSubstationError: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
}

// Async thunks
export const fetchDistributionSubstations = createAsyncThunk(
  "distributionSubstations/fetchDistributionSubstations",
  async (params: DistributionSubstationsRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<DistributionSubstationsResponse>(
        buildApiUrl(API_ENDPOINTS.DISTRIBUTION_STATION.GET),
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
        return rejectWithValue(response.data.message || "Failed to fetch distribution substations")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch distribution substations")
      }
      return rejectWithValue(error.message || "Network error during distribution substations fetch")
    }
  }
)

export const fetchDistributionSubstationById = createAsyncThunk<
  DistributionSubstation,
  number,
  { rejectValue: string }
>(
  "distributionSubstations/fetchDistributionSubstationById",
  async (distributionSubstationId: number, { rejectWithValue }) => {
    try {
      // Use the new GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.DISTRIBUTION_STATION.GET_BY_ID.replace("{id}", distributionSubstationId.toString())

      const response = await api.get<SingleDistributionSubstationResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch distribution substation")
      }

      const distributionSubstation = response.data.data
      if (!distributionSubstation) {
        return rejectWithValue("Distribution substation not found")
      }

      return distributionSubstation
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch distribution substation")
      }
      return rejectWithValue(error.message || "Network error during distribution substation fetch")
    }
  }
)

export const createDistributionSubstation = createAsyncThunk(
  "distributionSubstations/createDistributionSubstation",
  async (substationData: CreateDistributionSubstationRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of distribution substation requests
      const response = await api.post<DistributionSubstationResponse>(
        buildApiUrl(API_ENDPOINTS.DISTRIBUTION_STATION.ADD),
        substationData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create distribution substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create distribution substation")
      }
      return rejectWithValue(error.message || "Network error during distribution substation creation")
    }
  }
)

export const createSingleDistributionSubstation = createAsyncThunk(
  "distributionSubstations/createSingleDistributionSubstation",
  async (substationData: CreateDistributionSubstationRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreateDistributionSubstationRequestPayload = [substationData]

      const response = await api.post<DistributionSubstationResponse>(
        buildApiUrl(API_ENDPOINTS.DISTRIBUTION_STATION.ADD),
        payload
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create distribution substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create distribution substation")
      }
      return rejectWithValue(error.message || "Network error during distribution substation creation")
    }
  }
)

export const updateDistributionSubstation = createAsyncThunk(
  "distributionSubstations/updateDistributionSubstation",
  async (
    { id, substationData }: { id: number; substationData: UpdateDistributionSubstationRequest },
    { rejectWithValue }
  ) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.DISTRIBUTION_STATION.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SingleDistributionSubstationResponse>(buildApiUrl(endpoint), substationData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update distribution substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update distribution substation")
      }
      return rejectWithValue(error.message || "Network error during distribution substation update")
    }
  }
)

// DistributionSubstation slice
const distributionSubstationSlice = createSlice({
  name: "distributionSubstations",
  initialState,
  reducers: {
    // Clear distributionSubstations state
    clearDistributionSubstations: (state) => {
      state.distributionSubstations = []
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
      state.currentDistributionSubstationError = null
      state.createError = null
      state.updateError = null
    },

    // Clear current distributionSubstation
    clearCurrentDistributionSubstation: (state) => {
      state.currentDistributionSubstation = null
      state.currentDistributionSubstationError = null
    },

    // Reset distributionSubstation state
    resetDistributionSubstationState: (state) => {
      state.distributionSubstations = []
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
      state.currentDistributionSubstation = null
      state.currentDistributionSubstationLoading = false
      state.currentDistributionSubstationError = null
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

    // Set current distribution substation (for forms, etc.)
    setCurrentDistributionSubstation: (state, action: PayloadAction<DistributionSubstation | null>) => {
      state.currentDistributionSubstation = action.payload
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
      // Fetch distributionSubstations cases
      .addCase(fetchDistributionSubstations.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(
        fetchDistributionSubstations.fulfilled,
        (state, action: PayloadAction<DistributionSubstationsResponse>) => {
          state.loading = false
          state.success = true
          state.distributionSubstations = action.payload.data
          state.pagination = {
            totalCount: action.payload.totalCount,
            totalPages: action.payload.totalPages,
            currentPage: action.payload.currentPage,
            pageSize: action.payload.pageSize,
            hasNext: action.payload.hasNext,
            hasPrevious: action.payload.hasPrevious,
          }
          state.error = null
        }
      )
      .addCase(fetchDistributionSubstations.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch distribution substations"
        state.success = false
        state.distributionSubstations = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch distributionSubstation by ID cases
      .addCase(fetchDistributionSubstationById.pending, (state) => {
        state.currentDistributionSubstationLoading = true
        state.currentDistributionSubstationError = null
      })
      .addCase(fetchDistributionSubstationById.fulfilled, (state, action: PayloadAction<DistributionSubstation>) => {
        state.currentDistributionSubstationLoading = false
        state.currentDistributionSubstation = action.payload
        state.currentDistributionSubstationError = null
      })
      .addCase(fetchDistributionSubstationById.rejected, (state, action) => {
        state.currentDistributionSubstationLoading = false
        state.currentDistributionSubstationError =
          (action.payload as string) || "Failed to fetch distribution substation"
        state.currentDistributionSubstation = null
      })
      // Create distribution substation cases
      .addCase(createDistributionSubstation.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(
        createDistributionSubstation.fulfilled,
        (state, action: PayloadAction<DistributionSubstationResponse>) => {
          state.createLoading = false
          state.createSuccess = true
          state.createError = null

          // Optionally add the newly created distribution substation to the list
          if (action.payload.data && action.payload.data.length > 0) {
            state.distributionSubstations.unshift(...action.payload.data)
          }
        }
      )
      .addCase(createDistributionSubstation.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create distribution substation"
        state.createSuccess = false
      })
      // Create single distribution substation cases
      .addCase(createSingleDistributionSubstation.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(
        createSingleDistributionSubstation.fulfilled,
        (state, action: PayloadAction<DistributionSubstationResponse>) => {
          state.createLoading = false
          state.createSuccess = true
          state.createError = null

          // Optionally add the newly created distribution substation to the list
          if (action.payload.data && action.payload.data.length > 0) {
            const newSubstation = action.payload.data[0]
            if (newSubstation) {
              state.distributionSubstations.unshift(newSubstation)
            }
          }
        }
      )
      .addCase(createSingleDistributionSubstation.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create distribution substation"
        state.createSuccess = false
      })
      // Update distribution substation cases
      .addCase(updateDistributionSubstation.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(
        updateDistributionSubstation.fulfilled,
        (state, action: PayloadAction<SingleDistributionSubstationResponse>) => {
          state.updateLoading = false
          state.updateSuccess = true
          state.updateError = null

          // Update the distribution substation in the current list
          const updatedSubstation = action.payload.data
          const index = state.distributionSubstations.findIndex((s) => s.id === updatedSubstation.id)
          if (index !== -1) {
            state.distributionSubstations[index] = updatedSubstation
          }

          // Update current distribution substation if it's the one being edited
          if (state.currentDistributionSubstation && state.currentDistributionSubstation.id === updatedSubstation.id) {
            state.currentDistributionSubstation = updatedSubstation
          }
        }
      )
      .addCase(updateDistributionSubstation.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update distribution substation"
        state.updateSuccess = false
      })
  },
})

export const {
  clearDistributionSubstations,
  clearError,
  clearCurrentDistributionSubstation,
  resetDistributionSubstationState,
  setPagination,
  setCurrentDistributionSubstation,
  clearCreateState,
  clearUpdateState,
} = distributionSubstationSlice.actions

export default distributionSubstationSlice.reducer
