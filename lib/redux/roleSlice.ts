// src/lib/redux/roleSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Privilege
export interface Privilege {
  id: number
  key: string
  name: string
  category: string
  availableActions: number
  description: string
}

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

// Manage Permissions Request Interface
export interface ManagePermissionsRequest {
  privileges: PrivilegeAssignment[]
}

// Manage Permissions Response Interface
export interface ManagePermissionsResponse {
  isSuccess: boolean
  message: string
  data?: Role // Optional role data that might be returned
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

// Privileges Response Interface
export interface PrivilegesResponse {
  isSuccess: boolean
  message: string
  data: Privilege[]
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

// Privileges Request Parameters (optional)
export interface PrivilegesRequestParams {
  category?: string
  search?: string
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

  // Privileges state
  privileges: Privilege[]
  privilegesLoading: boolean
  privilegesError: string | null
  privilegesSuccess: boolean
  privilegesCategories: string[]

  // Manage permissions state
  managePermissionsLoading: boolean
  managePermissionsSuccess: boolean
  managePermissionsError: string | null
  managedRoleId: number | null
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
  privileges: [],
  privilegesLoading: false,
  privilegesError: null,
  privilegesSuccess: false,
  privilegesCategories: [],
  managePermissionsLoading: false,
  managePermissionsSuccess: false,
  managePermissionsError: null,
  managedRoleId: null,
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

export const fetchPrivileges = createAsyncThunk(
  "roles/fetchPrivileges",
  async (params?: PrivilegesRequestParams, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams: Record<string, any> = {}

      if (params?.category) {
        queryParams.category = params.category
      }

      if (params?.search) {
        queryParams.search = params.search
      }

      const response = await api.get<PrivilegesResponse>(buildApiUrl(API_ENDPOINTS.ROLES.PRIVILEGES), {
        params: queryParams,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch privileges")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch privileges")
      }
      return rejectWithValue(error.message || "Network error during privileges fetch")
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

export const managePermissions = createAsyncThunk<
  { roleId: number; privileges: RolePrivilege[] },
  { roleId: number; privileges: PrivilegeAssignment[] },
  { rejectValue: string }
>("roles/managePermissions", async ({ roleId, privileges }, { rejectWithValue, dispatch }) => {
  try {
    // Validate that role is not a system role (system roles shouldn't have permissions modified via this endpoint)
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
      return rejectWithValue("System roles cannot have permissions modified")
    }

    // Validate privileges array
    if (!Array.isArray(privileges)) {
      return rejectWithValue("Privileges must be an array")
    }

    // Validate each privilege assignment
    for (const privilege of privileges) {
      if (!privilege.privilegeId || privilege.privilegeId <= 0) {
        return rejectWithValue("Invalid privilege ID")
      }
      if (typeof privilege.actions !== "number" || privilege.actions < 0) {
        return rejectWithValue("Invalid actions value for privilege")
      }
    }

    // Proceed with managing permissions
    const url = buildApiUrl(API_ENDPOINTS.ROLES.MANAGE_PERMISSIONS.replace("{id}", roleId.toString()))

    const requestData: ManagePermissionsRequest = { privileges }

    const response = await api.put<ManagePermissionsResponse>(url, requestData)

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to manage permissions")
    }

    // Refetch the updated role details to get the latest privileges
    dispatch(fetchRoleById(roleId))

    // We need to convert the privilege assignments back to role privileges for the state
    // In a real implementation, the API might return the updated role with privileges
    // For now, we'll return what we have and let the fetchRoleById update the state
    const rolePrivileges: RolePrivilege[] = privileges.map((p) => ({
      privilegeId: p.privilegeId,
      privilegeKey: "", // Will be populated by fetchRoleById
      privilegeName: "", // Will be populated by fetchRoleById
      privilegeCategory: "", // Will be populated by fetchRoleById
      actions: p.actions,
      availableActions: 0, // Will be populated by fetchRoleById
    }))

    return { roleId, privileges: rolePrivileges }
  } catch (error: any) {
    if (error.response?.data) {
      const errorData = error.response.data
      if (errorData.message) {
        return rejectWithValue(errorData.message)
      }
      return rejectWithValue("Failed to manage permissions")
    }
    return rejectWithValue(error.message || "Network error during permissions management")
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

// Helper function to extract unique categories from privileges
const extractCategoriesFromPrivileges = (privileges: Privilege[]): string[] => {
  const categories = new Set<string>()
  privileges.forEach((privilege) => {
    if (privilege.category) {
      categories.add(privilege.category)
    }
  })
  return Array.from(categories).sort()
}

// Helper function to convert Privilege to RolePrivilege for role creation
export const convertToRolePrivilege = (privilege: Privilege, actions: number = 0): RolePrivilege => ({
  privilegeId: privilege.id,
  privilegeKey: privilege.key,
  privilegeName: privilege.name,
  privilegeCategory: privilege.category,
  actions: actions,
  availableActions: privilege.availableActions,
})

// Helper function to convert RolePrivilege to PrivilegeAssignment for API calls
export const convertToPrivilegeAssignment = (rolePrivilege: RolePrivilege): PrivilegeAssignment => ({
  privilegeId: rolePrivilege.privilegeId,
  actions: rolePrivilege.actions,
})

// Helper function to get available actions as array of strings
export const getAvailableActions = (availableActions: number): string[] => {
  const actions: string[] = []
  if (availableActions & 1) actions.push("Create")
  if (availableActions & 2) actions.push("Read")
  if (availableActions & 4) actions.push("Update")
  if (availableActions & 8) actions.push("Delete")
  if (availableActions & 16) actions.push("Approve")
  if (availableActions & 32) actions.push("View All")
  return actions
}

// Helper function to get actions as array of strings
export const getActions = (actions: number): string[] => {
  const actionList: string[] = []
  if (actions & 1) actionList.push("Create")
  if (actions & 2) actionList.push("Read")
  if (actions & 4) actionList.push("Update")
  if (actions & 8) actionList.push("Delete")
  if (actions & 16) actionList.push("Approve")
  if (actions & 32) actionList.push("View All")
  return actionList
}

// Helper function to validate actions against available actions
export const validateActions = (actions: number, availableActions: number): boolean => {
  // Check if all requested actions are available
  return (actions & ~availableActions) === 0
}

// Helper function to get valid actions (intersection of requested and available)
export const getValidActions = (requestedActions: number, availableActions: number): number => {
  return requestedActions & availableActions
}

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
      state.privilegesError = null
      state.managePermissionsError = null
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

    // Clear privileges state
    clearPrivileges: (state) => {
      state.privileges = []
      state.privilegesLoading = false
      state.privilegesError = null
      state.privilegesSuccess = false
      state.privilegesCategories = []
    },

    // Clear manage permissions state
    clearManagePermissionsState: (state) => {
      state.managePermissionsLoading = false
      state.managePermissionsSuccess = false
      state.managePermissionsError = null
      state.managedRoleId = null
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
      state.privileges = []
      state.privilegesLoading = false
      state.privilegesError = null
      state.privilegesSuccess = false
      state.privilegesCategories = []
      state.managePermissionsLoading = false
      state.managePermissionsSuccess = false
      state.managePermissionsError = null
      state.managedRoleId = null
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

    // Reset privileges state
    resetPrivilegesState: (state) => {
      state.privilegesLoading = false
      state.privilegesSuccess = false
      state.privilegesError = null
    },

    // Reset manage permissions state
    resetManagePermissionsState: (state) => {
      state.managePermissionsLoading = false
      state.managePermissionsSuccess = false
      state.managePermissionsError = null
      state.managedRoleId = null
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

    // Update current role privileges (for optimistic updates during permission management)
    updateCurrentRolePrivileges: (state, action: PayloadAction<RolePrivilege[]>) => {
      if (state.currentRole) {
        state.currentRole.privileges = action.payload
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

    // Update role privileges in the list
    updateRolePrivilegesInList: (state, action: PayloadAction<{ roleId: number; privileges: RolePrivilege[] }>) => {
      const index = state.roles.findIndex((role) => role.id === action.payload.roleId)
      if (index !== -1) {
        const role = state.roles[index]
        if (role) {
          role.privileges = action.payload.privileges
        }
      }
    },

    // Remove a role from the list
    removeRoleFromList: (state, action: PayloadAction<number>) => {
      state.roles = state.roles.filter((role) => role.id !== action.payload)
      state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1)
      state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)
    },

    // Filter privileges by category
    filterPrivilegesByCategory: (state, action: PayloadAction<string | null>) => {
      if (!action.payload) {
        // Reset to show all privileges
        state.privileges = state.privileges
      } else {
        // Filter privileges by category
        state.privileges = state.privileges.filter((privilege) => privilege.category === action.payload)
      }
    },

    // Search privileges
    searchPrivileges: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase()
      if (!searchTerm) {
        // Reset to show all privileges
        state.privileges = state.privileges
      } else {
        // Filter privileges by search term
        state.privileges = state.privileges.filter(
          (privilege) =>
            privilege.name.toLowerCase().includes(searchTerm) ||
            privilege.key.toLowerCase().includes(searchTerm) ||
            privilege.description?.toLowerCase().includes(searchTerm) ||
            privilege.category.toLowerCase().includes(searchTerm)
        )
      }
    },

    // Optimistically update role privileges
    optimisticUpdateRolePrivileges: (state, action: PayloadAction<{ roleId: number; privileges: RolePrivilege[] }>) => {
      const { roleId, privileges } = action.payload

      // Update current role if it's the same role
      if (state.currentRole && state.currentRole.id === roleId) {
        state.currentRole.privileges = privileges
      }

      // Update role in the list
      const index = state.roles.findIndex((role) => role.id === roleId)
      if (index !== -1) {
        const role = state.roles[index]
        if (role) {
          role.privileges = privileges
        }
      }
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

      // Fetch privileges cases
      .addCase(fetchPrivileges.pending, (state) => {
        state.privilegesLoading = true
        state.privilegesError = null
        state.privilegesSuccess = false
      })
      .addCase(fetchPrivileges.fulfilled, (state, action: PayloadAction<PrivilegesResponse>) => {
        state.privilegesLoading = false
        state.privilegesSuccess = true
        state.privileges = action.payload.data
        state.privilegesCategories = extractCategoriesFromPrivileges(action.payload.data)
        state.privilegesError = null
      })
      .addCase(fetchPrivileges.rejected, (state, action) => {
        state.privilegesLoading = false
        state.privilegesSuccess = false
        state.privilegesError = (action.payload as string) || "Failed to fetch privileges"
        state.privileges = []
        state.privilegesCategories = []
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

      // Manage permissions cases
      .addCase(managePermissions.pending, (state) => {
        state.managePermissionsLoading = true
        state.managePermissionsSuccess = false
        state.managePermissionsError = null
        state.managedRoleId = null
      })
      .addCase(
        managePermissions.fulfilled,
        (state, action: PayloadAction<{ roleId: number; privileges: RolePrivilege[] }>) => {
          state.managePermissionsLoading = false
          state.managePermissionsSuccess = true
          state.managePermissionsError = null
          state.managedRoleId = action.payload.roleId

          // Note: The actual role privileges are updated by the fetchRoleById thunk
          // that gets dispatched in managePermissions.fulfilled
        }
      )
      .addCase(managePermissions.rejected, (state, action) => {
        state.managePermissionsLoading = false
        state.managePermissionsSuccess = false
        state.managePermissionsError = (action.payload as string) || "Failed to manage permissions"
        state.managedRoleId = null
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
  clearPrivileges,
  clearManagePermissionsState,
  resetRoleState,
  resetUpdateState,
  resetCreateState,
  resetDeleteState,
  resetPrivilegesState,
  resetManagePermissionsState,
  setPagination,
  updateCurrentRole,
  updateCurrentRolePrivileges,
  addRoleToList,
  updateRoleInList,
  updateRolePrivilegesInList,
  removeRoleFromList,
  filterPrivilegesByCategory,
  searchPrivileges,
  optimisticUpdateRolePrivileges,
} = roleSlice.actions

export default roleSlice.reducer
