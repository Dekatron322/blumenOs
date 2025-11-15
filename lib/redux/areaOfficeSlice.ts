// src/lib/redux/areaOfficeSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for AreaOffice
export interface Company {
  id: number
  name: string
  nercCode: string
  nercSupplyStructure: number
}

export interface InjectionSubstation {
  id: number
  nercCode: string
  injectionSubstationCode: string
  areaOffice: AreaOffice
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

export interface AreaOffice {
  id: number
  nameOfNewOAreaffice: string
  newKaedcoCode: string
  newNercCode: string
  oldKaedcoCode?: string
  oldNercCode?: string
  nameOfOldOAreaffice?: string
  latitude: number
  longitude: number
  company: Company
  injectionSubstations?: InjectionSubstation[]
  serviceCenters?: ServiceCenter[]
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

export interface AreaOfficeResponse {
  isSuccess: boolean
  message: string
  data: AreaOffice[]
}

export interface SingleAreaOfficeResponse {
  isSuccess: boolean
  message: string
  data: AreaOffice
}

export interface AreaOfficesRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Request interfaces for adding area office
export interface CreateAreaOfficeRequest {
  companyId: number
  oldNercCode: string
  newNercCode: string
  oldKaedcoCode: string
  newKaedcoCode: string
  nameOfOldOAreaffice: string
  nameOfNewOAreaffice: string
  latitude: number
  longitude: number
}

export interface UpdateAreaOfficeRequest {
  companyId: number
  oldNercCode: string
  newNercCode: string
  oldKaedcoCode: string
  newKaedcoCode: string
  nameOfOldOAreaffice: string
  nameOfNewOAreaffice: string
  latitude: number
  longitude: number
}

export type CreateAreaOfficeRequestPayload = CreateAreaOfficeRequest[]

// AreaOffice State
interface AreaOfficeState {
  // AreaOffices list state
  areaOffices: AreaOffice[]
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

  // Current areaOffice state (for viewing/editing)
  currentAreaOffice: AreaOffice | null
  currentAreaOfficeLoading: boolean
  currentAreaOfficeError: string | null

  // Create areaOffice state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update areaOffice state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean
}

// Initial state
const initialState: AreaOfficeState = {
  areaOffices: [],
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
  currentAreaOffice: null,
  currentAreaOfficeLoading: false,
  currentAreaOfficeError: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
}

// Async thunks
export const fetchAreaOffices = createAsyncThunk(
  "areaOffices/fetchAreaOffices",
  async (params: AreaOfficesRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<AreaOfficesResponse>(buildApiUrl(API_ENDPOINTS.AREA_OFFICE.GET), {
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
        return rejectWithValue(response.data.message || "Failed to fetch area offices")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch area offices")
      }
      return rejectWithValue(error.message || "Network error during area offices fetch")
    }
  }
)

export const fetchAreaOfficeById = createAsyncThunk<AreaOffice, number, { rejectValue: string }>(
  "areaOffices/fetchAreaOfficeById",
  async (areaOfficeId: number, { rejectWithValue }) => {
    try {
      // Use the new GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.AREA_OFFICE.GET_BY_ID.replace("{id}", areaOfficeId.toString())

      const response = await api.get<SingleAreaOfficeResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch area office")
      }

      const areaOffice = response.data.data
      if (!areaOffice) {
        return rejectWithValue("Area office not found")
      }

      return areaOffice
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch area office")
      }
      return rejectWithValue(error.message || "Network error during area office fetch")
    }
  }
)

export const createAreaOffice = createAsyncThunk(
  "areaOffices/createAreaOffice",
  async (areaOfficeData: CreateAreaOfficeRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of area office requests
      const response = await api.post<AreaOfficeResponse>(buildApiUrl(API_ENDPOINTS.AREA_OFFICE.ADD), areaOfficeData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create area office")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create area office")
      }
      return rejectWithValue(error.message || "Network error during area office creation")
    }
  }
)

export const createSingleAreaOffice = createAsyncThunk(
  "areaOffices/createSingleAreaOffice",
  async (areaOfficeData: CreateAreaOfficeRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreateAreaOfficeRequestPayload = [areaOfficeData]

      const response = await api.post<AreaOfficeResponse>(buildApiUrl(API_ENDPOINTS.AREA_OFFICE.ADD), payload)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create area office")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create area office")
      }
      return rejectWithValue(error.message || "Network error during area office creation")
    }
  }
)

export const updateAreaOffice = createAsyncThunk(
  "areaOffices/updateAreaOffice",
  async ({ id, areaOfficeData }: { id: number; areaOfficeData: UpdateAreaOfficeRequest }, { rejectWithValue }) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.AREA_OFFICE.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SingleAreaOfficeResponse>(buildApiUrl(endpoint), areaOfficeData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update area office")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update area office")
      }
      return rejectWithValue(error.message || "Network error during area office update")
    }
  }
)

// AreaOffice slice
const areaOfficeSlice = createSlice({
  name: "areaOffices",
  initialState,
  reducers: {
    // Clear areaOffices state
    clearAreaOffices: (state) => {
      state.areaOffices = []
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
      state.currentAreaOfficeError = null
      state.createError = null
      state.updateError = null
    },

    // Clear current areaOffice
    clearCurrentAreaOffice: (state) => {
      state.currentAreaOffice = null
      state.currentAreaOfficeError = null
    },

    // Reset areaOffice state
    resetAreaOfficeState: (state) => {
      state.areaOffices = []
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
      state.currentAreaOffice = null
      state.currentAreaOfficeLoading = false
      state.currentAreaOfficeError = null
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

    // Set current area office (for forms, etc.)
    setCurrentAreaOffice: (state, action: PayloadAction<AreaOffice | null>) => {
      state.currentAreaOffice = action.payload
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
      // Fetch areaOffices cases
      .addCase(fetchAreaOffices.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchAreaOffices.fulfilled, (state, action: PayloadAction<AreaOfficesResponse>) => {
        state.loading = false
        state.success = true
        state.areaOffices = action.payload.data
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
      .addCase(fetchAreaOffices.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch area offices"
        state.success = false
        state.areaOffices = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch areaOffice by ID cases
      .addCase(fetchAreaOfficeById.pending, (state) => {
        state.currentAreaOfficeLoading = true
        state.currentAreaOfficeError = null
      })
      .addCase(fetchAreaOfficeById.fulfilled, (state, action: PayloadAction<AreaOffice>) => {
        state.currentAreaOfficeLoading = false
        state.currentAreaOffice = action.payload
        state.currentAreaOfficeError = null
      })
      .addCase(fetchAreaOfficeById.rejected, (state, action) => {
        state.currentAreaOfficeLoading = false
        state.currentAreaOfficeError = (action.payload as string) || "Failed to fetch area office"
        state.currentAreaOffice = null
      })
      // Create area office cases
      .addCase(createAreaOffice.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createAreaOffice.fulfilled, (state, action: PayloadAction<AreaOfficeResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created area office to the list
        if (action.payload.data && action.payload.data.length > 0) {
          state.areaOffices.unshift(...action.payload.data)
        }
      })
      .addCase(createAreaOffice.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create area office"
        state.createSuccess = false
      })
      // Create single area office cases
      .addCase(createSingleAreaOffice.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createSingleAreaOffice.fulfilled, (state, action: PayloadAction<AreaOfficeResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created area office to the list
        if (action.payload.data && action.payload.data.length > 0) {
          const newAreaOffice = action.payload.data[0]
          if (newAreaOffice) {
            state.areaOffices.unshift(newAreaOffice)
          }
        }
      })
      .addCase(createSingleAreaOffice.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create area office"
        state.createSuccess = false
      })
      // Update area office cases
      .addCase(updateAreaOffice.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateAreaOffice.fulfilled, (state, action: PayloadAction<SingleAreaOfficeResponse>) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.updateError = null

        // Update the area office in the current list
        const updatedAreaOffice = action.payload.data
        const index = state.areaOffices.findIndex((ao) => ao.id === updatedAreaOffice.id)
        if (index !== -1) {
          state.areaOffices[index] = updatedAreaOffice
        }

        // Update current area office if it's the one being edited
        if (state.currentAreaOffice && state.currentAreaOffice.id === updatedAreaOffice.id) {
          state.currentAreaOffice = updatedAreaOffice
        }
      })
      .addCase(updateAreaOffice.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update area office"
        state.updateSuccess = false
      })
  },
})

export const {
  clearAreaOffices,
  clearError,
  clearCurrentAreaOffice,
  resetAreaOfficeState,
  setPagination,
  setCurrentAreaOffice,
  clearCreateState,
  clearUpdateState,
} = areaOfficeSlice.actions

export default areaOfficeSlice.reducer
