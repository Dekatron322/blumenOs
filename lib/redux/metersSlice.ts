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

// Interface for Meter Detail Response Data
export interface MeterDetailData {
  id: number
  customerId: number
  customerAccountNumber: string
  customerFullName: string
  serialNumber: string
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
  distributionSubstationId: number
  feederId: number
  areaOfficeId: number
  state: number
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

// Interface for Meter Detail Response
export interface MeterDetailResponse {
  isSuccess: boolean
  message: string
  data: MeterDetailData
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
  prepaidCreditHistory: PrepaidCreditHistoryEntry[]
  prepaidCreditHistoryLoading: boolean
  prepaidCreditHistoryError: string | null
  clearTamperHistory: ClearTamperHistoryEntry[]
  clearTamperHistoryLoading: boolean
  clearTamperHistoryError: string | null
  clearCreditHistory: ClearTamperHistoryEntry[]
  clearCreditHistoryLoading: boolean
  clearCreditHistoryError: string | null
  keyChangeHistory: ClearTamperHistoryEntry[]
  keyChangeHistoryLoading: boolean
  keyChangeHistoryError: string | null
  setControlHistory: ClearTamperHistoryEntry[]
  setControlHistoryLoading: boolean
  setControlHistoryError: string | null
  addKeyChangeData: TokenData | null
  addKeyChangeLoading: boolean
  addKeyChangeError: string | null
  clearTamperData: TokenData | null
  clearTamperLoading: boolean
  clearTamperError: string | null
  clearCreditData: TokenData | null
  clearCreditLoading: boolean
  clearCreditError: string | null
  setControlData: TokenData | null
  setControlLoading: boolean
  setControlError: string | null
  summary: MetersSummaryData | null
  summaryLoading: boolean
  summaryError: string | null
  currentMeter: MeterDetailData | null
  meterLoading: boolean
  meterError: string | null
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
  prepaidCreditHistory: [],
  prepaidCreditHistoryLoading: false,
  prepaidCreditHistoryError: null,
  clearTamperHistory: [],
  clearTamperHistoryLoading: false,
  clearTamperHistoryError: null,
  clearCreditHistory: [],
  clearCreditHistoryLoading: false,
  clearCreditHistoryError: null,
  keyChangeHistory: [],
  keyChangeHistoryLoading: false,
  keyChangeHistoryError: null,
  setControlHistory: [],
  setControlHistoryLoading: false,
  setControlHistoryError: null,
  addKeyChangeData: null,
  addKeyChangeLoading: false,
  addKeyChangeError: null,
  clearTamperData: null,
  clearTamperLoading: false,
  clearTamperError: null,
  clearCreditData: null,
  clearCreditLoading: false,
  clearCreditError: null,
  setControlData: null,
  setControlLoading: false,
  setControlError: null,
  summary: null,
  summaryLoading: false,
  summaryError: null,
  currentMeter: null,
  meterLoading: false,
  meterError: null,
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
  distributionSubstationId: number
  feederId: number
  areaOfficeId: number
  state: number
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
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

// Interface for Meters Summary Data
export interface MetersSummaryData {
  totalMeters: number
  activeMeters: number
  deactivatedMeters: number
  suspendedMeters: number
  retiredMeters: number
  prepaidMeters: number
  postpaidMeters: number
  smartMeters: number
  byStatus: Array<{
    value: number
    name: string
    count: number
  }>
  byState: Array<{
    value: number
    name: string
    count: number
  }>
  byType: Array<{
    value: number
    name: string
    count: number
  }>
  byServiceBand: Array<{
    value: number
    name: string
    count: number
  }>
}

// Interface for Meters Summary Response
export interface MetersSummaryResponse {
  isSuccess: boolean
  message: string
  data: MetersSummaryData
}

// Interface for Prepaid Credit History entry
export interface PrepaidCreditHistoryEntry {
  id: number
  meterId: number
  userAccountId: number
  agentId: number
  vendorId: number
  requestPayload: string
  responsePayload: string
  isSuccessful: boolean
  errorCode: string
  errorMessage: string
  requestedAtUtc: string
  paymentId: number
}

// Interface for Prepaid Credit History Response
export interface PrepaidCreditHistoryResponse {
  isSuccess: boolean
  message: string
  data: PrepaidCreditHistoryEntry[]
}

// Interface for Clear Tamper History entry
export interface ClearTamperHistoryEntry {
  id: number
  meterId: number
  userAccountId: number
  agentId: number
  vendorId: number
  requestPayload: string
  responsePayload: string
  isSuccessful: boolean
  errorCode: string
  errorMessage: string
  requestedAtUtc: string
}

// Interface for Clear Tamper History Response
export interface ClearTamperHistoryResponse {
  isSuccess: boolean
  message: string
  data: ClearTamperHistoryEntry[]
}

// Add Key Change interfaces
export interface AddKeyChangeRequest {
  toSgc: number
  toKrn: number
  toTi: number
}

export interface TokenConfig {
  idRecord: string
  record2: string
  rollover: boolean
  toKen: number
  toKrn: number
  toSgc: number
  toTi: number
  toVkKcv: string
}

export interface Token {
  description: string
  drn: string
  ea: number
  idSm: string
  isReservedTid: boolean
  krn: number
  newConfig: TokenConfig
  pan: string
  scaledAmount: string
  scaledUnitName: string
  sgc: number
  stsUnitName: string
  subclass: number
  tct: number
  ti: number
  tid: number
  tokenClass: number
  tokenDec: string
  tokenHex: string
  transferAmount: number
  vkKcv: string
}

export interface Advice {
  idRecord: string
  rollover: boolean
  toKen: number
  toKrn: number
  toSgc: number
  toTi: number
}

export interface TokenData {
  advice: Advice
  raw: string
  success: boolean
  tokens: Token[]
}

export interface AddKeyChangeResponse {
  isSuccess: boolean
  message: string
  data: {
    data: TokenData
    error: {
      code: string
      error: string
      success: boolean
    }
  }
}

// Clear Tamper interfaces
export interface ClearTamperResponse {
  isSuccess: boolean
  message: string
  data: {
    data: TokenData
    error: {
      code: string
      error: string
      success: boolean
    }
  }
}

export interface ClearCreditResponse {
  isSuccess: boolean
  message: string
  data: {
    data: TokenData
    error: {
      code: string
      error: string
      success: boolean
    }
  }
}

export interface SetControlRequest {
  isFlag: boolean
  index: number
  value: number
  tokenTime: number
  flags: number
}

export interface SetControlResponse {
  isSuccess: boolean
  message: string
  data: {
    data: TokenData
    error: {
      code: string
      error: string
      success: boolean
    }
  }
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

// Async Thunk for fetching meter detail
export const fetchMeterDetail = createAsyncThunk("meters/fetchMeterDetail", async (id: number, { rejectWithValue }) => {
  try {
    const endpoint = API_ENDPOINTS.METERS.METER_DETAIL.replace("{id}", id.toString())
    const response = await api.get<MeterDetailResponse>(buildApiUrl(endpoint))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch meter details")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch meter details")
    }
    return rejectWithValue(error.message || "Network error during meter details fetch")
  }
})

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

// Async Thunk for fetching meters summary
export const fetchMetersSummary = createAsyncThunk("meters/fetchMetersSummary", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<MetersSummaryResponse>(buildApiUrl(API_ENDPOINTS.METERS.SUMMARY))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch meters summary")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch meters summary")
    }
    return rejectWithValue(error.message || "Network error during meters summary fetch")
  }
})

// Async Thunk for fetching prepaid credit history
export const fetchPrepaidCreditHistory = createAsyncThunk(
  "meters/fetchPrepaidCreditHistory",
  async (id: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.PREPAID_CREDIT_HISTORY.replace("{id}", id.toString())
      const response = await api.get<PrepaidCreditHistoryResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch prepaid credit history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch prepaid credit history")
      }
      return rejectWithValue(error.message || "Network error during prepaid credit history fetch")
    }
  }
)

// Async Thunk for fetching clear tamper history
export const fetchClearTamperHistory = createAsyncThunk(
  "meters/fetchClearTamperHistory",
  async (id: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.CLEAR_TAMPER_HISTORY.replace("{id}", id.toString())
      const response = await api.get<ClearTamperHistoryResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch clear tamper history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch clear tamper history")
      }
      return rejectWithValue(error.message || "Network error during clear tamper history fetch")
    }
  }
)

// Async Thunk for fetching clear credit history
export const fetchClearCreditHistory = createAsyncThunk(
  "meters/fetchClearCreditHistory",
  async (id: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.CLEAR_CREDIT_HISTORY.replace("{id}", id.toString())
      const response = await api.get<ClearTamperHistoryResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch clear credit history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch clear credit history")
      }
      return rejectWithValue(error.message || "Network error during clear credit history fetch")
    }
  }
)

// Async Thunk for fetching key change history
export const fetchKeyChangeHistory = createAsyncThunk(
  "meters/fetchKeyChangeHistory",
  async (id: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.KEY_CHANGE_HISTORY.replace("{id}", id.toString())
      const response = await api.get<ClearTamperHistoryResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch key change history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch key change history")
      }
      return rejectWithValue(error.message || "Network error during key change history fetch")
    }
  }
)

// Async Thunk for fetching set control history
export const fetchSetControlHistory = createAsyncThunk(
  "meters/fetchSetControlHistory",
  async (id: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.SET_CONTROL_HISTORY.replace("{id}", id.toString())
      const response = await api.get<ClearTamperHistoryResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch set control history")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch set control history")
      }
      return rejectWithValue(error.message || "Network error during set control history fetch")
    }
  }
)

// Async Thunk for adding key change
export const addKeyChange = createAsyncThunk(
  "meters/addKeyChange",
  async ({ id, requestData }: { id: number; requestData: AddKeyChangeRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.ADD_KEY_CHANGE.replace("{id}", id.toString())
      const response = await api.post<AddKeyChangeResponse>(buildApiUrl(endpoint), requestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to add key change")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to add key change")
      }
      return rejectWithValue(error.message || "Network error during key change addition")
    }
  }
)

// Async Thunk for clearing tamper
export const clearTamper = createAsyncThunk("meters/clearTamper", async (id: number, { rejectWithValue }) => {
  try {
    const endpoint = API_ENDPOINTS.METERS.CLEAR_TAMPER.replace("{id}", id.toString())
    const response = await api.post<ClearTamperResponse>(buildApiUrl(endpoint))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to clear tamper")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to clear tamper")
    }
    return rejectWithValue(error.message || "Network error during tamper clear")
  }
})

export const clearCredit = createAsyncThunk("meters/clearCredit", async (id: number, { rejectWithValue }) => {
  try {
    const endpoint = API_ENDPOINTS.METERS.CLEAR_CREDIT.replace("{id}", id.toString())
    const response = await api.post<ClearCreditResponse>(buildApiUrl(endpoint))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to clear credit")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to clear credit")
    }
    return rejectWithValue(error.message || "Network error during credit clear")
  }
})

export const setControl = createAsyncThunk(
  "meters/setControl",
  async ({ id, controlData }: { id: number; controlData: SetControlRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.METERS.SET_CONTROL.replace("{id}", id.toString())
      const response = await api.post<SetControlResponse>(buildApiUrl(endpoint), controlData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to set control")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to set control")
      }
      return rejectWithValue(error.message || "Network error during control set")
    }
  }
)

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
      state.currentMeter = null
      state.meterError = null
    },
    // Clear error
    clearMetersError: (state) => {
      state.error = null
      state.meterError = null
      state.success = false
    },
    // Clear current meter
    clearCurrentMeter: (state) => {
      state.currentMeter = null
      state.meterError = null
      state.meterLoading = false
    },
    // Clear prepaid credit history
    clearPrepaidCreditHistory: (state) => {
      state.prepaidCreditHistory = []
      state.prepaidCreditHistoryError = null
      state.prepaidCreditHistoryLoading = false
    },
    // Clear clear tamper history
    clearClearTamperHistory: (state) => {
      state.clearTamperHistory = []
      state.clearTamperHistoryError = null
      state.clearTamperHistoryLoading = false
    },
    // Clear clear credit history
    clearClearCreditHistory: (state) => {
      state.clearCreditHistory = []
      state.clearCreditHistoryError = null
      state.clearCreditHistoryLoading = false
    },
    // Clear key change history
    clearKeyChangeHistory: (state) => {
      state.keyChangeHistory = []
      state.keyChangeHistoryError = null
      state.keyChangeHistoryLoading = false
    },
    // Clear set control history
    clearSetControlHistory: (state) => {
      state.setControlHistory = []
      state.setControlHistoryError = null
      state.setControlHistoryLoading = false
    },
    // Clear add key change data
    clearAddKeyChange: (state) => {
      state.addKeyChangeData = null
      state.addKeyChangeError = null
      state.addKeyChangeLoading = false
    },
    // Clear tamper data
    clearTamperData: (state) => {
      state.clearTamperData = null
      state.clearTamperError = null
      state.clearTamperLoading = false
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
      // Fetch meter detail
      .addCase(fetchMeterDetail.pending, (state) => {
        state.meterLoading = true
        state.meterError = null
      })
      .addCase(fetchMeterDetail.fulfilled, (state, action: PayloadAction<MeterDetailResponse>) => {
        state.meterLoading = false
        state.currentMeter = action.payload.data
      })
      .addCase(fetchMeterDetail.rejected, (state, action) => {
        state.meterLoading = false
        state.meterError = action.payload as string
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
        // Also update the currentMeter if it's the same meter
        if (state.currentMeter && state.currentMeter.id === action.meta.arg.id) {
          state.currentMeter = {
            ...state.currentMeter,
            ...action.meta.arg.data,
            // Preserve fields that might not be in EditMeterRequest
            serialNumber: state.currentMeter.serialNumber,
            isSmart: state.currentMeter.isSmart,
            distributionSubstationId: state.currentMeter.distributionSubstationId,
            feederId: state.currentMeter.feederId,
            areaOfficeId: state.currentMeter.areaOfficeId,
            meterState: state.currentMeter.meterState,
          }
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
      // Fetch meters summary
      .addCase(fetchMetersSummary.pending, (state) => {
        state.summaryLoading = true
        state.summaryError = null
      })
      .addCase(fetchMetersSummary.fulfilled, (state, action: PayloadAction<MetersSummaryResponse>) => {
        state.summaryLoading = false
        state.summary = action.payload.data
      })
      .addCase(fetchMetersSummary.rejected, (state, action) => {
        state.summaryLoading = false
        state.summaryError = action.payload as string
      })
      // Fetch prepaid credit history
      .addCase(fetchPrepaidCreditHistory.pending, (state) => {
        state.prepaidCreditHistoryLoading = true
        state.prepaidCreditHistoryError = null
      })
      .addCase(fetchPrepaidCreditHistory.fulfilled, (state, action: PayloadAction<PrepaidCreditHistoryResponse>) => {
        state.prepaidCreditHistoryLoading = false
        state.prepaidCreditHistory = action.payload.data
      })
      .addCase(fetchPrepaidCreditHistory.rejected, (state, action) => {
        state.prepaidCreditHistoryLoading = false
        state.prepaidCreditHistoryError = action.payload as string
      })
      // Fetch clear tamper history
      .addCase(fetchClearTamperHistory.pending, (state) => {
        state.clearTamperHistoryLoading = true
        state.clearTamperHistoryError = null
      })
      .addCase(fetchClearTamperHistory.fulfilled, (state, action: PayloadAction<ClearTamperHistoryResponse>) => {
        state.clearTamperHistoryLoading = false
        state.clearTamperHistory = action.payload.data
      })
      .addCase(fetchClearTamperHistory.rejected, (state, action) => {
        state.clearTamperHistoryLoading = false
        state.clearTamperHistoryError = action.payload as string
      })
      // Fetch clear credit history
      .addCase(fetchClearCreditHistory.pending, (state) => {
        state.clearCreditHistoryLoading = true
        state.clearCreditHistoryError = null
      })
      .addCase(fetchClearCreditHistory.fulfilled, (state, action: PayloadAction<ClearTamperHistoryResponse>) => {
        state.clearCreditHistoryLoading = false
        state.clearCreditHistory = action.payload.data
      })
      .addCase(fetchClearCreditHistory.rejected, (state, action) => {
        state.clearCreditHistoryLoading = false
        state.clearCreditHistoryError = action.payload as string
      })
      // Fetch key change history
      .addCase(fetchKeyChangeHistory.pending, (state) => {
        state.keyChangeHistoryLoading = true
        state.keyChangeHistoryError = null
      })
      .addCase(fetchKeyChangeHistory.fulfilled, (state, action: PayloadAction<ClearTamperHistoryResponse>) => {
        state.keyChangeHistoryLoading = false
        state.keyChangeHistory = action.payload.data
      })
      .addCase(fetchKeyChangeHistory.rejected, (state, action) => {
        state.keyChangeHistoryLoading = false
        state.keyChangeHistoryError = action.payload as string
      })
      // Fetch set control history
      .addCase(fetchSetControlHistory.pending, (state) => {
        state.setControlHistoryLoading = true
        state.setControlHistoryError = null
      })
      .addCase(fetchSetControlHistory.fulfilled, (state, action: PayloadAction<ClearTamperHistoryResponse>) => {
        state.setControlHistoryLoading = false
        state.setControlHistory = action.payload.data
      })
      .addCase(fetchSetControlHistory.rejected, (state, action) => {
        state.setControlHistoryLoading = false
        state.setControlHistoryError = action.payload as string
      })
      // Add key change
      .addCase(addKeyChange.pending, (state) => {
        state.addKeyChangeLoading = true
        state.addKeyChangeError = null
      })
      .addCase(addKeyChange.fulfilled, (state, action: PayloadAction<AddKeyChangeResponse>) => {
        state.addKeyChangeLoading = false
        state.addKeyChangeData = action.payload.data.data
      })
      .addCase(addKeyChange.rejected, (state, action) => {
        state.addKeyChangeLoading = false
        state.addKeyChangeError = action.payload as string
      })
      // Clear tamper
      .addCase(clearTamper.pending, (state) => {
        state.clearTamperLoading = true
        state.clearTamperError = null
      })
      .addCase(clearTamper.fulfilled, (state, action: PayloadAction<ClearTamperResponse>) => {
        state.clearTamperLoading = false
        state.clearTamperData = action.payload.data.data
      })
      .addCase(clearTamper.rejected, (state, action) => {
        state.clearTamperLoading = false
        state.clearTamperError = action.payload as string
      })
      .addCase(clearCredit.pending, (state) => {
        state.clearCreditLoading = true
        state.clearCreditError = null
      })
      .addCase(clearCredit.fulfilled, (state, action: PayloadAction<ClearCreditResponse>) => {
        state.clearCreditLoading = false
        state.clearCreditData = action.payload.data.data
      })
      .addCase(clearCredit.rejected, (state, action) => {
        state.clearCreditLoading = false
        state.clearCreditError = action.payload as string
      })
      .addCase(setControl.pending, (state) => {
        state.setControlLoading = true
        state.setControlError = null
      })
      .addCase(setControl.fulfilled, (state, action: PayloadAction<SetControlResponse>) => {
        state.setControlLoading = false
        state.setControlData = action.payload.data.data
      })
      .addCase(setControl.rejected, (state, action) => {
        state.setControlLoading = false
        state.setControlError = action.payload as string
      })
  },
})

export const {
  clearMeters,
  clearMetersError,
  clearCurrentMeter,
  clearPrepaidCreditHistory,
  clearClearTamperHistory,
  clearClearCreditHistory,
  clearKeyChangeHistory,
  clearSetControlHistory,
  clearAddKeyChange,
  clearTamperData,
} = metersSlice.actions
export default metersSlice.reducer
