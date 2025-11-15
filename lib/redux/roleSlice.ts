// src/lib/redux/roleSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Role
export interface Role {
  id: number
  name: string
  slug: string
  category: string
  isSystem: boolean
  description: string
}

export interface RolesResponse {
  isSuccess: boolean
  message: string
  data: Role[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface RolesRequestParams {
  pageNumber: number
  pageSize: number
}

// Role State
interface RoleState {
  // Roles list state
  roles: Role[]
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

  // Current role state (for viewing/editing)
  currentRole: Role | null
  currentRoleLoading: boolean
  currentRoleError: string | null
}

// Initial state
const initialState: RoleState = {
  roles: [],
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
  currentRole: null,
  currentRoleLoading: false,
  currentRoleError: null,
}

// Async thunks
export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (params: RolesRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize } = params

      const response = await api.get<RolesResponse>(buildApiUrl(API_ENDPOINTS.ROLES.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch roles")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch roles")
      }
      return rejectWithValue(error.message || "Network error during roles fetch")
    }
  }
)

export const fetchRoleById = createAsyncThunk<Role, number, { rejectValue: string }>(
  "roles/fetchRoleById",
  async (roleId: number, { rejectWithValue }) => {
    try {
      // Note: This assumes there's a GET by ID endpoint
      // You might need to adjust this based on your actual API
      const response = await api.get<RolesResponse>(`${buildApiUrl(API_ENDPOINTS.ROLES.GET)}/${roleId}`)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch role")
      }

      const role = response.data.data?.[0]
      if (!role) {
        return rejectWithValue("Role not found")
      }

      return role
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch role")
      }
      return rejectWithValue(error.message || "Network error during role fetch")
    }
  }
)

// Role slice
const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    // Clear roles state
    clearRoles: (state) => {
      state.roles = []
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
      state.currentRoleError = null
    },

    // Clear current role
    clearCurrentRole: (state) => {
      state.currentRole = null
      state.currentRoleError = null
    },

    // Reset role state
    resetRoleState: (state) => {
      state.roles = []
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
      state.currentRole = null
      state.currentRoleLoading = false
      state.currentRoleError = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch roles cases
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<RolesResponse>) => {
        state.loading = false
        state.success = true
        state.roles = action.payload.data
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
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch roles"
        state.success = false
        state.roles = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch role by ID cases
      .addCase(fetchRoleById.pending, (state) => {
        state.currentRoleLoading = true
        state.currentRoleError = null
      })
      .addCase(fetchRoleById.fulfilled, (state, action: PayloadAction<Role>) => {
        state.currentRoleLoading = false
        state.currentRole = action.payload
        state.currentRoleError = null
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.currentRoleLoading = false
        state.currentRoleError = (action.payload as string) || "Failed to fetch role"
        state.currentRole = null
      })
  },
})

export const { clearRoles, clearError, clearCurrentRole, resetRoleState, setPagination } = roleSlice.actions

export default roleSlice.reducer
