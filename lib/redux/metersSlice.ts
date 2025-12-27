// src/lib/redux/metersSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interface for Meter
export interface Meter {
  id: number
  customerId: number
  customerAccountNumber: string
  customerFullName: string
  meterIsPPM: boolean
  drn: string
  sgc: number
  krn: string
  ti: number
  ea: number
  tct: number
  ken: number
  mfrCode: number
  installationDate: string
  meterID: string
  meterAddedBy: string
  meterEditedBy: string
  meterDateCreated: string
  meterTypeId: string
  meterType: number
  meterBrand: string
  meterCategory: string
  isMeterActive: boolean
  status: number
  state: number
  sealNumber: string
  tariffRate: number
  tariffIndex: string
  serviceBand: number
  customerClass: string
  injectionSubstationId: number
  locationState: string
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
  latitude: number
  longitude: number
  tenantFullName: string
  tenantPhoneNumber: string
}

// Interface for Meters Request Parameters
export interface MetersRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  customerId?: number
  meterIsPPM?: boolean
  isMeterActive?: boolean
  status?: number
  state?: number
  meterType?: number
  serviceBand?: number
  injectionSubstationId?: number
  drn?: string
  tenantPhoneNumber?: string
}

// Interface for Meters Response
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

// Interface for Meters State
export interface MetersState {
  meters: Meter[]
  loading: boolean
  error: string | null
  success: boolean
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  meterHistory: MeterHistoryEntry[]
  historyLoading: boolean
  historyError: string | null
}

// Initial state
const initialState: MetersState = {
  meters: [],
  loading: false,
  error: null,
  success: false,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 0,
    hasNext: false,
    hasPrevious: false,
  },
  meterHistory: [],
  historyLoading: false,
  historyError: null,
}

export interface EditMeterRequest {
  id: number
  customerId: number
  customerAccountNumber: string
  customerFullName: string
  meterIsPPM: boolean
  drn: string
  sgc: number
  krn: string
  ti: number
  ea: number
  tct: number
  ken: number
  mfrCode: number
  installationDate: string
  meterID: string
  meterAddedBy: string
  meterEditedBy: string
  meterDateCreated: string
  meterTypeId: string
  meterType: number
  meterBrand: string
  meterCategory: string
  isMeterActive: boolean
  status: number
  state: number
  sealNumber: string
  tariffRate: number
  tariffIndex: string
  serviceBand: number
  customerClass: string
  injectionSubstationId: number
  locationState: string
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
  latitude: number
  longitude: number
  tenantFullName: string
  tenantPhoneNumber: string
  changeReason: string
}

// Interface for Add Meter Request
export interface AddMeterRequest {
  customerId: number
  serialNumber: string
  drn: string
  sgc: number
  krn: string
  ti: number
  ea: number
  tct: number
  ken: number
  mfrCode: number
  installationDate: string
  meterAddedBy: string
  meterEditedBy: string
  meterDateCreated: string
  meterType: number
  isSmart: boolean
  meterBrand: string
  meterCategory: string
  isMeterActive: boolean
  status: number
  meterState: number
  sealNumber: string
  tariffRate: number
  tariffIndex: string
  serviceBand: number
  customerClass: string
  injectionSubstationId: number
  state: number
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
  latitude: number
  longitude: number
  tenantFullName: string
  tenantPhoneNumber: string
}

// Interface for Add Meter Response
export interface AddMeterResponse {
  isSuccess: boolean
  message: string
  data: Meter
}

// Interface for Meter History entry
export interface MeterHistoryEntry {
  id: number
  meterId: number
  userAccountId: number
  agentId: number
  vendorId: number
  changeType: string
  changedFields: string
  oldPayload: string
  newPayload: string
  reason: string
  changedAtUtc: string
}

// Interface for Meter History Response
export interface MeterHistoryResponse {
  isSuccess: boolean
  message: string
  data: MeterHistoryEntry[]
}

// Async Thunk for fetching meters
export const fetchMeters = createAsyncThunk(
  "meters/fetchMeters",
  async (params: MetersRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        search,
        customerId,
        meterIsPPM,
        isMeterActive,
        status,
        state,
        meterType,
        serviceBand,
        injectionSubstationId,
        drn,
        tenantPhoneNumber,
      } = params

      const requestParams: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      }

      // Add optional parameters only if they are provided
      if (search !== undefined) requestParams.Search = search
      if (customerId !== undefined) requestParams.CustomerId = customerId
      if (meterIsPPM !== undefined) requestParams.MeterIsPPM = meterIsPPM
      if (isMeterActive !== undefined) requestParams.IsMeterActive = isMeterActive
      if (status !== undefined) requestParams.Status = status
      if (state !== undefined) requestParams.State = state
      if (meterType !== undefined) requestParams.MeterType = meterType
      if (serviceBand !== undefined) requestParams.ServiceBand = serviceBand
      if (injectionSubstationId !== undefined) requestParams.InjectionSubstationId = injectionSubstationId
      if (drn !== undefined) requestParams.Drn = drn
      if (tenantPhoneNumber !== undefined) requestParams.TenantPhoneNumber = tenantPhoneNumber

      const response = await api.get<MetersResponse>(buildApiUrl(API_ENDPOINTS.METERS.LIST_METERS), {
        params: requestParams,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch meters")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch meters")
      }
      return rejectWithValue(error.message || "Network error during meters fetch")
    }
  }
)

// Async Thunk for fetching meter history
export const fetchMeterHistory = createAsyncThunk(
  "meters/fetchMeterHistory",
  async (id: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.METER_HISTORY.replace("{id}", id.toString())
      const response = await api.get<MeterHistoryResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch meter history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch meter history")
      }
      return rejectWithValue(error.message || "Network error during meter history fetch")
    }
  }
)

// Async Thunk for editing a meter
export const editMeter = createAsyncThunk(
  "meters/editMeter",
  async ({ id, data }: { id: number; data: EditMeterRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.EDIT_METER.replace("{id}", id.toString())
      const response = await api.put(buildApiUrl(endpoint), data)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to edit meter")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to edit meter")
      }
      return rejectWithValue(error.message || "Network error during meter edit")
    }
  }
)

// Async Thunk for adding a new meter
export const addMeter = createAsyncThunk("meters/addMeter", async (data: AddMeterRequest, { rejectWithValue }) => {
  try {
    const response = await api.post<AddMeterResponse>(buildApiUrl(API_ENDPOINTS.METERS.ADD_METER), data)

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to add meter")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to add meter")
    }
    return rejectWithValue(error.message || "Network error during meter addition")
  }
})

// Create slice
const metersSlice = createSlice({
  name: "meters",
  initialState,
  reducers: {
    // Clear meters state
    clearMeters: (state) => {
      state.meters = []
      state.error = null
      state.success = false
      state.loading = false
      state.pagination = initialState.pagination
    },
    // Clear error
    clearMetersError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch meters
    builder
      .addCase(fetchMeters.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchMeters.fulfilled, (state, action: PayloadAction<MetersResponse>) => {
        state.loading = false
        state.success = true
        state.meters = action.payload.data
        state.pagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchMeters.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
      // Edit meter
      .addCase(editMeter.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(editMeter.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        // Update the meter in the meters array if it exists
        const index = state.meters.findIndex((meter) => meter.id === action.meta.arg.id)
        if (index !== -1) {
          const updateData = action.meta.arg.data
          state.meters[index] = { ...state.meters[index], ...updateData }
        }
      })
      .addCase(editMeter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
      // Fetch meter history
      .addCase(fetchMeterHistory.pending, (state) => {
        state.historyLoading = true
        state.historyError = null
      })
      .addCase(fetchMeterHistory.fulfilled, (state, action: PayloadAction<MeterHistoryResponse>) => {
        state.historyLoading = false
        state.meterHistory = action.payload.data
      })
      .addCase(fetchMeterHistory.rejected, (state, action) => {
        state.historyLoading = false
        state.historyError = action.payload as string
      })
      // Add meter
      .addCase(addMeter.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(addMeter.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        // Add the new meter to the meters array
        state.meters.unshift(action.payload.data)
      })
      .addCase(addMeter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })
  },
})

export const { clearMeters, clearMetersError } = metersSlice.actions
export default metersSlice.reducer
