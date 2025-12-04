// src/lib/redux/roleSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Role Privileges
export interface RolePrivilege {
  privilegeId: number
  privilegeKey: string
  privilegeName: string
  privilegeCategory: string
  actions: number
  availableActions: number
}

export interface PrivilegeAssignment {
  privilegeId: number
  actions: number
}

// Interfaces for Role
export interface Role {
  id: number
  name: string
  slug: string
  category: string
  isSystem: boolean
  description: string
  privileges?: RolePrivilege[]
}

// Create Role Request Interface
export interface CreateRoleRequest {
  name: string
  description: string
  category: string
  privileges: PrivilegeAssignment[]
}

// Update Role Request Interface
export interface UpdateRoleRequest {
  name: string
  description: string
  category: string
}

// Delete Role Response Interface
export interface DeleteRoleResponse {
  isSuccess: boolean
  message: string
}

export interface RoleDetailResponse {
  isSuccess: boolean
  message: string
  data: Role
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

  // Update role state
  updateRoleLoading: boolean
  updateRoleSuccess: boolean
  updateRoleError: string | null

  // Create role state
  createRoleLoading: boolean
  createRoleSuccess: boolean
  createRoleError: string | null
  createdRole: Role | null

  // Delete role state
  deleteRoleLoading: boolean
  deleteRoleSuccess: boolean
  deleteRoleError: string | null
  deletedRoleId: number | null
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
  updateRoleLoading: false,
  updateRoleSuccess: false,
  updateRoleError: null,
  createRoleLoading: false,
  createRoleSuccess: false,
  createRoleError: null,
  createdRole: null,
  deleteRoleLoading: false,
  deleteRoleSuccess: false,
  deleteRoleError: null,
  deletedRoleId: null,
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
      const url = buildApiUrl(API_ENDPOINTS.ROLES.GET_BY_ID.replace("{id}", roleId.toString()))
      const response = await api.get<RoleDetailResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch role details")
      }

      if (!response.data.data) {
        return rejectWithValue("Role not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.message) {
          return rejectWithValue(errorData.message)
        }
        return rejectWithValue("Failed to fetch role details")
      }
      return rejectWithValue(error.message || "Network error during role details fetch")
    }
  }
)

export const createRole = createAsyncThunk<Role, CreateRoleRequest, { rejectValue: string }>(
  "roles/createRole",
  async (roleData: CreateRoleRequest, { rejectWithValue }) => {
    try {
      // Validate required fields
      if (!roleData.name?.trim()) {
        return rejectWithValue("Role name is required")
      }

      if (!roleData.category?.trim()) {
        return rejectWithValue("Category is required")
      }

      // Validate name length
      if (roleData.name.length < 2) {
        return rejectWithValue("Role name must be at least 2 characters")
      }

      if (roleData.name.length > 100) {
        return rejectWithValue("Role name must be less than 100 characters")
      }

      // Validate description length if provided
      if (roleData.description && roleData.description.length > 500) {
        return rejectWithValue("Description must be less than 500 characters")
      }

      // Validate privileges array
      if (!Array.isArray(roleData.privileges)) {
        return rejectWithValue("Privileges must be an array")
      }

      // Validate each privilege assignment
      for (const privilege of roleData.privileges) {
        if (!privilege.privilegeId || privilege.privilegeId <= 0) {
          return rejectWithValue("Invalid privilege ID")
        }
        if (typeof privilege.actions !== "number" || privilege.actions < 0) {
          return rejectWithValue("Invalid actions value for privilege")
        }
      }

      const url = buildApiUrl(API_ENDPOINTS.ROLES.CREATE_ROLE)

      const response = await api.post<RoleDetailResponse>(url, roleData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create role")
      }

      if (!response.data.data) {
        return rejectWithValue("Role data not returned after creation")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.message) {
          return rejectWithValue(errorData.message)
        }
        return rejectWithValue("Failed to create role")
      }
      return rejectWithValue(error.message || "Network error during role creation")
    }
  }
)

export const updateRole = createAsyncThunk<
  Role,
  { roleId: number; roleData: UpdateRoleRequest },
  { rejectValue: string }
>("roles/updateRole", async ({ roleId, roleData }, { rejectWithValue, dispatch }) => {
  try {
    // Validate that role is not a system role (system roles shouldn't be updated via this endpoint)
    // First, fetch the current role to check if it's a system role
    const currentRoleUrl = buildApiUrl(API_ENDPOINTS.ROLES.GET_BY_ID.replace("{id}", roleId.toString()))
    const currentRoleResponse = await api.get<RoleDetailResponse>(currentRoleUrl)

    if (!currentRoleResponse.data.isSuccess) {
      return rejectWithValue(currentRoleResponse.data.message || "Failed to fetch role details")
    }

    const currentRole = currentRoleResponse.data.data
    if (!currentRole) {
      return rejectWithValue("Role not found")
    }

    if (currentRole.isSystem) {
      return rejectWithValue("System roles cannot be updated")
    }

    // Proceed with the update
    const url = buildApiUrl(API_ENDPOINTS.ROLES.UPDATE_ROLE.replace("{id}", roleId.toString()))

    const response = await api.put<RoleDetailResponse>(url, roleData)

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to update role")
    }

    if (!response.data.data) {
      return rejectWithValue("Role data not returned after update")
    }

    // Optionally, refetch the updated role details
    dispatch(fetchRoleById(roleId))

    return response.data.data
  } catch (error: any) {
    if (error.response?.data) {
      const errorData = error.response.data
      if (errorData.message) {
        return rejectWithValue(errorData.message)
      }
      return rejectWithValue("Failed to update role")
    }
    return rejectWithValue(error.message || "Network error during role update")
  }
})

export const deleteRole = createAsyncThunk<number, number, { rejectValue: string }>(
  "roles/deleteRole",
  async (roleId: number, { rejectWithValue }) => {
    try {
      // First, fetch the current role to check if it's a system role
      const currentRoleUrl = buildApiUrl(API_ENDPOINTS.ROLES.GET_BY_ID.replace("{id}", roleId.toString()))
      const currentRoleResponse = await api.get<RoleDetailResponse>(currentRoleUrl)

      if (!currentRoleResponse.data.isSuccess) {
        return rejectWithValue(currentRoleResponse.data.message || "Failed to fetch role details")
      }

      const currentRole = currentRoleResponse.data.data
      if (!currentRole) {
        return rejectWithValue("Role not found")
      }

      // Check if role is a system role
      if (currentRole.isSystem) {
        return rejectWithValue("System roles cannot be deleted")
      }

      // Proceed with the deletion
      const url = buildApiUrl(API_ENDPOINTS.ROLES.DELETE_ROLE.replace("{id}", roleId.toString()))

      const response = await api.delete<DeleteRoleResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to delete role")
      }

      return roleId
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.message) {
          return rejectWithValue(errorData.message)
        }
        return rejectWithValue("Failed to delete role")
      }
      return rejectWithValue(error.message || "Network error during role deletion")
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
      state.updateRoleError = null
      state.createRoleError = null
      state.deleteRoleError = null
    },

    // Clear current role
    clearCurrentRole: (state) => {
      state.currentRole = null
      state.currentRoleError = null
    },

    // Clear created role
    clearCreatedRole: (state) => {
      state.createdRole = null
      state.createRoleSuccess = false
      state.createRoleError = null
    },

    // Clear deleted role state
    clearDeleteRoleState: (state) => {
      state.deleteRoleLoading = false
      state.deleteRoleSuccess = false
      state.deleteRoleError = null
      state.deletedRoleId = null
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
      state.updateRoleLoading = false
      state.updateRoleSuccess = false
      state.updateRoleError = null
      state.createRoleLoading = false
      state.createRoleSuccess = false
      state.createRoleError = null
      state.createdRole = null
      state.deleteRoleLoading = false
      state.deleteRoleSuccess = false
      state.deleteRoleError = null
      state.deletedRoleId = null
    },

    // Reset update state
    resetUpdateState: (state) => {
      state.updateRoleLoading = false
      state.updateRoleSuccess = false
      state.updateRoleError = null
    },

    // Reset create state
    resetCreateState: (state) => {
      state.createRoleLoading = false
      state.createRoleSuccess = false
      state.createRoleError = null
      state.createdRole = null
    },

    // Reset delete state
    resetDeleteState: (state) => {
      state.deleteRoleLoading = false
      state.deleteRoleSuccess = false
      state.deleteRoleError = null
      state.deletedRoleId = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Update current role (for optimistic updates or local modifications)
    updateCurrentRole: (state, action: PayloadAction<Partial<Role>>) => {
      if (state.currentRole) {
        state.currentRole = {
          ...state.currentRole,
          ...action.payload,
        }
      }
    },

    // Add a role to the list (for optimistic updates)
    addRoleToList: (state, action: PayloadAction<Role>) => {
      state.roles.unshift(action.payload)
      state.pagination.totalCount += 1
      state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)
    },

    // Update a role in the list
    updateRoleInList: (state, action: PayloadAction<Role>) => {
      const index = state.roles.findIndex((role) => role.id === action.payload.id)
      if (index !== -1) {
        state.roles[index] = action.payload
      }
    },

    // Remove a role from the list
    removeRoleFromList: (state, action: PayloadAction<number>) => {
      state.roles = state.roles.filter((role) => role.id !== action.payload)
      state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1)
      state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)
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
        state.currentRoleError = (action.payload as string) || "Failed to fetch role details"
        state.currentRole = null
      })

      // Create role cases
      .addCase(createRole.pending, (state) => {
        state.createRoleLoading = true
        state.createRoleSuccess = false
        state.createRoleError = null
        state.createdRole = null
      })
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.createRoleLoading = false
        state.createRoleSuccess = true
        state.createRoleError = null
        state.createdRole = action.payload

        // Add the new role to the beginning of the list (optimistic update)
        state.roles.unshift(action.payload)
        state.pagination.totalCount += 1
        state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)
      })
      .addCase(createRole.rejected, (state, action) => {
        state.createRoleLoading = false
        state.createRoleSuccess = false
        state.createRoleError = (action.payload as string) || "Failed to create role"
        state.createdRole = null
      })

      // Update role cases
      .addCase(updateRole.pending, (state) => {
        state.updateRoleLoading = true
        state.updateRoleSuccess = false
        state.updateRoleError = null
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.updateRoleLoading = false
        state.updateRoleSuccess = true
        state.updateRoleError = null

        // Update current role if it's the same role
        if (state.currentRole && state.currentRole.id === action.payload.id) {
          state.currentRole = action.payload
        }

        // Update role in the list
        const index = state.roles.findIndex((role) => role.id === action.payload.id)
        if (index !== -1) {
          state.roles[index] = action.payload
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.updateRoleLoading = false
        state.updateRoleSuccess = false
        state.updateRoleError = (action.payload as string) || "Failed to update role"
      })

      // Delete role cases
      .addCase(deleteRole.pending, (state) => {
        state.deleteRoleLoading = true
        state.deleteRoleSuccess = false
        state.deleteRoleError = null
        state.deletedRoleId = null
      })
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<number>) => {
        state.deleteRoleLoading = false
        state.deleteRoleSuccess = true
        state.deleteRoleError = null
        state.deletedRoleId = action.payload

        // Remove the deleted role from the list
        state.roles = state.roles.filter((role) => role.id !== action.payload)
        state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1)
        state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)

        // Clear current role if it's the deleted one
        if (state.currentRole && state.currentRole.id === action.payload) {
          state.currentRole = null
          state.currentRoleError = null
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.deleteRoleLoading = false
        state.deleteRoleSuccess = false
        state.deleteRoleError = (action.payload as string) || "Failed to delete role"
        state.deletedRoleId = null
      })
  },
})

export const {
  clearRoles,
  clearError,
  clearCurrentRole,
  clearCreatedRole,
  clearDeleteRoleState,
  resetRoleState,
  resetUpdateState,
  resetCreateState,
  resetDeleteState,
  setPagination,
  updateCurrentRole,
  addRoleToList,
  updateRoleInList,
  removeRoleFromList,
} = roleSlice.actions

export default roleSlice.reducer
