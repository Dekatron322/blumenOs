import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

export interface StatusMapRequestQuery {
  pageNumber: number
  pageSize: number
}

export interface StatusMapRequestBody {
  state: string
  feederId: number
  paymentStatus: number
  salesRepUserId: number
}

export interface StatusMapAssetsRequestQuery {
  nameDescription: string
  pageNumber: number
  pageSize: number
}

export interface StatusMapAssetsRequestBody {
  feederId: number
  areaOfficeId: number
}

export interface StatusMapCustomer {
  id: number
  accountNumber: string
  fullName: string
  status: number
  outstanding: number
  latitude: number
  longitude: number
  state: string
  city: string
  lga: string
  feederId: number
  feederName: string
  distributionSubstationId: number
  distributionSubstationCode: string
  serviceCenterId: number
  serviceCenterName: string
  salesRepUserId: number
  salesRepName: string
}

export interface StatusMapResponse {
  isSuccess: boolean
  message: string
  data: StatusMapCustomer[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface StatusMapAsset {
  type: string
  id: number
  name: string
  latitude: number
  longitude: number
  feederId: number
  feederName: string
  areaOfficeId: number
  areaOfficeName: string
}

export interface StatusMapAssetsResponse {
  isSuccess: boolean
  message: string
  data: StatusMapAsset[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

interface StatusMapState {
  loading: boolean
  error: string | null
  customers: StatusMapCustomer[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  assetsLoading: boolean
  assetsError: string | null
  assets: StatusMapAsset[]
  assetsTotalCount: number
  assetsTotalPages: number
  assetsCurrentPage: number
  assetsPageSize: number
  assetsHasNext: boolean
  assetsHasPrevious: boolean
}

const initialState: StatusMapState = {
  loading: false,
  error: null,
  customers: [],
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
  hasNext: false,
  hasPrevious: false,
  assetsLoading: false,
  assetsError: null,
  assets: [],
  assetsTotalCount: 0,
  assetsTotalPages: 0,
  assetsCurrentPage: 1,
  assetsPageSize: 10,
  assetsHasNext: false,
  assetsHasPrevious: false,
}

export const fetchStatusMapCustomers = createAsyncThunk(
  "statusMap/fetchStatusMapCustomers",
  async (
    params: {
      query: StatusMapRequestQuery
      body: StatusMapRequestBody
    },
    { rejectWithValue }
  ) => {
    try {
      const { query, body } = params
      const response = await api.post<StatusMapResponse>(buildApiUrl(API_ENDPOINTS.STATUS_MAP.GET), body, {
        params: {
          PageNumber: query.pageNumber,
          PageSize: query.pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch status map customers")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch status map customers")
      }
      return rejectWithValue(error.message || "Network error during status map fetch")
    }
  }
)

export const fetchStatusMapAssets = createAsyncThunk(
  "statusMap/fetchStatusMapAssets",
  async (
    params: {
      query: StatusMapAssetsRequestQuery
      body: StatusMapAssetsRequestBody
    },
    { rejectWithValue }
  ) => {
    try {
      const { query, body } = params
      const response = await api.post<StatusMapAssetsResponse>(buildApiUrl(API_ENDPOINTS.STATUS_MAP.ASSETS), body, {
        params: {
          NameDescription: query.nameDescription,
          PageNumber: query.pageNumber,
          PageSize: query.pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch status map assets")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch status map assets")
      }
      return rejectWithValue(error.message || "Network error during status map assets fetch")
    }
  }
)

const statusMapSlice = createSlice({
  name: "statusMap",
  initialState,
  reducers: {
    clearStatusMapError: (state) => {
      state.error = null
    },
    clearStatusMapData: (state) => {
      state.customers = []
      state.totalCount = 0
      state.totalPages = 0
      state.currentPage = 1
      state.pageSize = 10
      state.hasNext = false
      state.hasPrevious = false
      state.error = null
      state.assets = []
      state.assetsTotalCount = 0
      state.assetsTotalPages = 0
      state.assetsCurrentPage = 1
      state.assetsPageSize = 10
      state.assetsHasNext = false
      state.assetsHasPrevious = false
      state.assetsError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatusMapCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStatusMapCustomers.fulfilled, (state, action: PayloadAction<StatusMapResponse>) => {
        state.loading = false
        state.customers = action.payload.data
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
        state.pageSize = action.payload.pageSize
        state.hasNext = action.payload.hasNext
        state.hasPrevious = action.payload.hasPrevious
        state.error = null
      })
      .addCase(fetchStatusMapCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch status map customers"
        state.customers = []
        state.totalCount = 0
        state.totalPages = 0
        state.currentPage = 1
        state.pageSize = 10
        state.hasNext = false
        state.hasPrevious = false
      })
      .addCase(fetchStatusMapAssets.pending, (state) => {
        state.assetsLoading = true
        state.assetsError = null
      })
      .addCase(fetchStatusMapAssets.fulfilled, (state, action: PayloadAction<StatusMapAssetsResponse>) => {
        state.assetsLoading = false
        state.assets = action.payload.data
        state.assetsTotalCount = action.payload.totalCount
        state.assetsTotalPages = action.payload.totalPages
        state.assetsCurrentPage = action.payload.currentPage
        state.assetsPageSize = action.payload.pageSize
        state.assetsHasNext = action.payload.hasNext
        state.assetsHasPrevious = action.payload.hasPrevious
        state.assetsError = null
      })
      .addCase(fetchStatusMapAssets.rejected, (state, action) => {
        state.assetsLoading = false
        state.assetsError = (action.payload as string) || "Failed to fetch status map assets"
        state.assets = []
        state.assetsTotalCount = 0
        state.assetsTotalPages = 0
        state.assetsCurrentPage = 1
        state.assetsPageSize = 10
        state.assetsHasNext = false
        state.assetsHasPrevious = false
      })
  },
})

export const { clearStatusMapError, clearStatusMapData } = statusMapSlice.actions

export default statusMapSlice.reducer
