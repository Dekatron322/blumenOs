// src/lib/redux/serviceStationSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for ServiceStation
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

export interface ServiceStation {
  id: number
  name: string
  code: string
  address: string
  areaOfficeId: number
  areaOffice: AreaOffice
  latitude: number
  longitude: number
}

export interface ServiceStationsResponse {
  isSuccess: boolean
  message: string
  data: ServiceStation[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ServiceStationsBulkResponse {
  isSuccess: boolean
  message: string
  data: ServiceStation[]
}

export interface SingleServiceStationResponse {
  isSuccess: boolean
  message: string
  data: ServiceStation
}

export interface ServiceStationsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Request interfaces for adding service station
export interface CreateServiceStationRequest {
  areaOfficeId: number
  name: string
  code: string
  address: string
  latitude: number
  longitude: number
}

export interface UpdateServiceStationRequest {
  areaOfficeId: number
  name: string
  code: string
  address: string
  latitude: number
  longitude: number
}

export type CreateServiceStationRequestPayload = CreateServiceStationRequest[]

// ServiceStation State
interface ServiceStationState {
  // ServiceStations list state
  serviceStations: ServiceStation[]
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

  // Current serviceStation state (for viewing/editing)
  currentServiceStation: ServiceStation | null
  currentServiceStationLoading: boolean
  currentServiceStationError: string | null

  // Create serviceStation state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update serviceStation state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean
}

// Initial state
const initialState: ServiceStationState = {
  serviceStations: [],
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
  currentServiceStation: null,
  currentServiceStationLoading: false,
  currentServiceStationError: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
}

// Async thunks
export const fetchServiceStations = createAsyncThunk(
  "serviceStations/fetchServiceStations",
  async (params: ServiceStationsRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<ServiceStationsResponse>(buildApiUrl(API_ENDPOINTS.SERVICE_STATION.GET), {
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
        return rejectWithValue(response.data.message || "Failed to fetch service stations")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch service stations")
      }
      return rejectWithValue(error.message || "Network error during service stations fetch")
    }
  }
)

export const fetchServiceStationById = createAsyncThunk<ServiceStation, number, { rejectValue: string }>(
  "serviceStations/fetchServiceStationById",
  async (serviceStationId: number, { rejectWithValue }) => {
    try {
      // Use the GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.SERVICE_STATION.GET_BY_ID.replace("{id}", serviceStationId.toString())

      const response = await api.get<SingleServiceStationResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch service station")
      }

      const serviceStation = response.data.data
      if (!serviceStation) {
        return rejectWithValue("Service station not found")
      }

      return serviceStation
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch service station")
      }
      return rejectWithValue(error.message || "Network error during service station fetch")
    }
  }
)

export const createServiceStation = createAsyncThunk(
  "serviceStations/createServiceStation",
  async (serviceStationData: CreateServiceStationRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of service station requests
      const response = await api.post<ServiceStationsBulkResponse>(
        buildApiUrl(API_ENDPOINTS.SERVICE_STATION.ADD),
        serviceStationData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create service station")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create service station")
      }
      return rejectWithValue(error.message || "Network error during service station creation")
    }
  }
)

export const createSingleServiceStation = createAsyncThunk(
  "serviceStations/createSingleServiceStation",
  async (serviceStationData: CreateServiceStationRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreateServiceStationRequestPayload = [serviceStationData]

      const response = await api.post<ServiceStationsBulkResponse>(
        buildApiUrl(API_ENDPOINTS.SERVICE_STATION.ADD),
        payload
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create service station")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create service station")
      }
      return rejectWithValue(error.message || "Network error during service station creation")
    }
  }
)

export const updateServiceStation = createAsyncThunk(
  "serviceStations/updateServiceStation",
  async (
    { id, serviceStationData }: { id: number; serviceStationData: UpdateServiceStationRequest },
    { rejectWithValue }
  ) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.SERVICE_STATION.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SingleServiceStationResponse>(buildApiUrl(endpoint), serviceStationData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update service station")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update service station")
      }
      return rejectWithValue(error.message || "Network error during service station update")
    }
  }
)

// ServiceStation slice
const serviceStationSlice = createSlice({
  name: "serviceStations",
  initialState,
  reducers: {
    // Clear serviceStations state
    clearServiceStations: (state) => {
      state.serviceStations = []
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
      state.currentServiceStationError = null
      state.createError = null
      state.updateError = null
    },

    // Clear current serviceStation
    clearCurrentServiceStation: (state) => {
      state.currentServiceStation = null
      state.currentServiceStationError = null
    },

    // Reset serviceStation state
    resetServiceStationState: (state) => {
      state.serviceStations = []
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
      state.currentServiceStation = null
      state.currentServiceStationLoading = false
      state.currentServiceStationError = null
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

    // Set current service station (for forms, etc.)
    setCurrentServiceStation: (state, action: PayloadAction<ServiceStation | null>) => {
      state.currentServiceStation = action.payload
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
      // Fetch serviceStations cases
      .addCase(fetchServiceStations.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchServiceStations.fulfilled, (state, action: PayloadAction<ServiceStationsResponse>) => {
        state.loading = false
        state.success = true
        state.serviceStations = action.payload.data
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
      .addCase(fetchServiceStations.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch service stations"
        state.success = false
        state.serviceStations = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch serviceStation by ID cases
      .addCase(fetchServiceStationById.pending, (state) => {
        state.currentServiceStationLoading = true
        state.currentServiceStationError = null
      })
      .addCase(fetchServiceStationById.fulfilled, (state, action: PayloadAction<ServiceStation>) => {
        state.currentServiceStationLoading = false
        state.currentServiceStation = action.payload
        state.currentServiceStationError = null
      })
      .addCase(fetchServiceStationById.rejected, (state, action) => {
        state.currentServiceStationLoading = false
        state.currentServiceStationError = (action.payload as string) || "Failed to fetch service station"
        state.currentServiceStation = null
      })
      // Create service station cases
      .addCase(createServiceStation.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createServiceStation.fulfilled, (state, action: PayloadAction<ServiceStationsBulkResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created service station to the list
        if (action.payload.data && action.payload.data.length > 0) {
          state.serviceStations.unshift(...action.payload.data)
        }
      })
      .addCase(createServiceStation.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create service station"
        state.createSuccess = false
      })
      // Create single service station cases
      .addCase(createSingleServiceStation.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createSingleServiceStation.fulfilled, (state, action: PayloadAction<ServiceStationsBulkResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created service station to the list
        if (action.payload.data && action.payload.data.length > 0) {
          const newServiceStation = action.payload.data[0]
          if (newServiceStation) {
            state.serviceStations.unshift(newServiceStation)
          }
        }
      })
      .addCase(createSingleServiceStation.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create service station"
        state.createSuccess = false
      })
      // Update service station cases
      .addCase(updateServiceStation.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateServiceStation.fulfilled, (state, action: PayloadAction<SingleServiceStationResponse>) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.updateError = null

        // Update the service station in the current list
        const updatedServiceStation = action.payload.data
        const index = state.serviceStations.findIndex((ss) => ss.id === updatedServiceStation.id)
        if (index !== -1) {
          state.serviceStations[index] = updatedServiceStation
        }

        // Update current service station if it's the one being edited
        if (state.currentServiceStation && state.currentServiceStation.id === updatedServiceStation.id) {
          state.currentServiceStation = updatedServiceStation
        }
      })
      .addCase(updateServiceStation.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update service station"
        state.updateSuccess = false
      })
  },
})

export const {
  clearServiceStations,
  clearError,
  clearCurrentServiceStation,
  resetServiceStationState,
  setPagination,
  setCurrentServiceStation,
  clearCreateState,
  clearUpdateState,
} = serviceStationSlice.actions

export default serviceStationSlice.reducer
