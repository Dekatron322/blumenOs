import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Audit Log Entity Interface
export interface AuditLog {
  id: number
  userId: number
  vendorId: number
  customerId: number
  agentId: number
  ipAddress: string
  userAgent: string
  deviceInfo: string
  browserInfo: string
  action: string
  entityName: string
  entityId: string
  description: string
  message: string
  status: string
  requestJson: string
  responseJson: string
  metadata: string
  performedAt: string
}

// Request Parameters Interface
export interface AuditLogsRequestParams {
  EntityName?: string
  EntityId?: string
  Action?: string
  UserId?: number
  VendorId?: number
  CustomerId?: number
  AgentId?: number
  Status?: string
  From?: string
  To?: string
  PageNumber: number
  PageSize: number
}

// API Response Interface
export interface AuditLogsResponse {
  isSuccess: boolean
  message: string
  data: AuditLog[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Pagination Interface
export interface AuditLogsPagination {
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// State Interface
interface AuditLogState {
  auditLogs: AuditLog[]
  auditLogsLoading: boolean
  auditLogsError: string | null
  auditLogsSuccess: boolean
  auditLogsPagination: AuditLogsPagination
  auditLogsParams: AuditLogsRequestParams | null
}

// Initial State
const initialState: AuditLogState = {
  auditLogs: [],
  auditLogsLoading: false,
  auditLogsError: null,
  auditLogsSuccess: false,
  auditLogsPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  auditLogsParams: null,
}

// Async Thunks
export const fetchAuditLogs = createAsyncThunk(
  "auditLogs/fetchAuditLogs",
  async (params: AuditLogsRequestParams, { rejectWithValue }) => {
    try {
      const response = await api.get<AuditLogsResponse>(buildApiUrl(API_ENDPOINTS.AUDIT_LOGS.audit_logs), {
        params,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch audit logs")
      }

      return {
        data: response.data.data || [],
        pagination: {
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
          pageSize: response.data.pageSize,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious,
        },
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch audit logs")
      }
      return rejectWithValue(error.message || "Network error during audit logs fetch")
    }
  }
)

// Audit Log Slice
const auditLogSlice = createSlice({
  name: "auditLogs",
  initialState,
  reducers: {
    // Clear audit logs state
    clearAuditLogs: (state) => {
      state.auditLogs = []
      state.auditLogsError = null
      state.auditLogsSuccess = false
      state.auditLogsLoading = false
      state.auditLogsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.auditLogsParams = null
    },

    // Clear error
    clearError: (state) => {
      state.auditLogsError = null
    },

    // Set audit logs params
    setAuditLogsParams: (state, action: PayloadAction<AuditLogsRequestParams>) => {
      state.auditLogsParams = action.payload
    },

    // Set pagination
    setAuditLogsPagination: (state, action: PayloadAction<Partial<AuditLogsPagination>>) => {
      state.auditLogsPagination = {
        ...state.auditLogsPagination,
        ...action.payload,
      }
    },

    // Reset state
    resetAuditLogState: (state) => {
      state.auditLogs = []
      state.auditLogsLoading = false
      state.auditLogsError = null
      state.auditLogsSuccess = false
      state.auditLogsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.auditLogsParams = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Audit Logs
      .addCase(fetchAuditLogs.pending, (state) => {
        state.auditLogsLoading = true
        state.auditLogsError = null
        state.auditLogsSuccess = false
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogsLoading = false
        state.auditLogs = action.payload.data
        state.auditLogsPagination = action.payload.pagination
        state.auditLogsParams = action.payload.params
        state.auditLogsSuccess = true
        state.auditLogsError = null
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.auditLogsLoading = false
        state.auditLogsError = action.payload as string
        state.auditLogsSuccess = false
      })
  },
})

// Export actions
export const { clearAuditLogs, clearError, setAuditLogsParams, setAuditLogsPagination, resetAuditLogState } =
  auditLogSlice.actions

// Export reducer
export default auditLogSlice.reducer
