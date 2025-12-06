// src/lib/redux/departmentSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import type { RootState } from "lib/redux/store"

// Interfaces for Department
export interface Department {
  id: number
  name: string
  description: string
  isActive: boolean
  companyId: number
  companyName: string
  createdAt?: string
  lastUpdated?: string
}

// Interface for single department response
export interface DepartmentResponse {
  isSuccess: boolean
  message: string
  data: Department
}

export interface DepartmentsResponse {
  isSuccess: boolean
  message: string
  data: Department[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface DepartmentsRequestParams {
  pageNumber: number
  pageSize: number
  companyId?: number
  search?: string
  isActive?: boolean
}

// Create Department Request Interface
export interface CreateDepartmentRequest {
  companyId: number
  name: string
  description: string
  isActive: boolean
}

// Update Department Request Interface
export interface UpdateDepartmentRequest {
  id: number
  companyId: number
  name: string
  description: string
  isActive: boolean
}

// Delete Department Request Interface
export interface DeleteDepartmentRequest {
  id: number
}

// Department State
interface DepartmentState {
  // Departments list state
  departments: Department[]
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

  // Current department state (for viewing/editing)
  currentDepartment: Department | null
  currentDepartmentLoading: boolean
  currentDepartmentError: string | null

  // Create/Update/Delete state
  operationLoading: boolean
  operationError: string | null
  operationSuccess: boolean
}

// Initial state
const initialState: DepartmentState = {
  departments: [],
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
  currentDepartment: null,
  currentDepartmentLoading: false,
  currentDepartmentError: null,
  operationLoading: false,
  operationError: null,
  operationSuccess: false,
}

// Async thunks
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (params: DepartmentsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, companyId, search, isActive } = params

      const response = await api.get<DepartmentsResponse>(buildApiUrl(API_ENDPOINTS.DEPARTMENT.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(companyId && { CompanyId: companyId }),
          ...(search && { Search: search }),
          ...(isActive !== undefined && { IsActive: isActive }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch departments")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch departments")
      }
      return rejectWithValue(error.message || "Network error during departments fetch")
    }
  }
)

export const fetchDepartmentById = createAsyncThunk<Department, number, { rejectValue: string }>(
  "departments/fetchDepartmentById",
  async (departmentId: number, { rejectWithValue }) => {
    try {
      // Build URL with parameter replacement for {id}
      const url = buildApiUrl(API_ENDPOINTS.DEPARTMENT.GET_DETAIL).replace("{id}", departmentId.toString())

      const response = await api.get<DepartmentResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch department")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch department")
      }
      return rejectWithValue(error.message || "Network error during department fetch")
    }
  }
)

export const createDepartment = createAsyncThunk<Department, CreateDepartmentRequest, { rejectValue: string }>(
  "departments/createDepartment",
  async (departmentData: CreateDepartmentRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<DepartmentResponse>(buildApiUrl(API_ENDPOINTS.DEPARTMENT.ADD), departmentData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create department")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create department")
      }
      return rejectWithValue(error.message || "Network error during department creation")
    }
  }
)

export const updateDepartment = createAsyncThunk<Department, UpdateDepartmentRequest, { rejectValue: string }>(
  "departments/updateDepartment",
  async (departmentData: UpdateDepartmentRequest, { rejectWithValue }) => {
    try {
      // Build URL with parameter replacement for {id} using the UPDATE endpoint
      const url = buildApiUrl(API_ENDPOINTS.DEPARTMENT.UPDATE).replace("{id}", departmentData.id.toString())

      // Prepare request body
      const requestBody = {
        companyId: departmentData.companyId,
        name: departmentData.name,
        description: departmentData.description,
        isActive: departmentData.isActive,
      }

      const response = await api.put<DepartmentResponse>(url, requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update department")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update department")
      }
      return rejectWithValue(error.message || "Network error during department update")
    }
  }
)

export const deleteDepartment = createAsyncThunk<number, number, { rejectValue: string }>(
  "departments/deleteDepartment",
  async (departmentId: number, { rejectWithValue }) => {
    try {
      // Build URL with parameter replacement for {id}
      const url = buildApiUrl(API_ENDPOINTS.DEPARTMENT.GET_DETAIL).replace("{id}", departmentId.toString())

      const response = await api.delete<DepartmentResponse>(url)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to delete department")
      }

      return departmentId
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to delete department")
      }
      return rejectWithValue(error.message || "Network error during department deletion")
    }
  }
)

// Department slice
const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    // Clear departments state
    clearDepartments: (state) => {
      state.departments = []
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
      state.currentDepartmentError = null
      state.operationError = null
    },

    // Clear current department
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null
      state.currentDepartmentError = null
    },

    // Clear operation state
    clearOperationState: (state) => {
      state.operationLoading = false
      state.operationError = null
      state.operationSuccess = false
    },

    // Reset department state
    resetDepartmentState: () => {
      return initialState
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set current department (for forms, etc.)
    setCurrentDepartment: (state, action: PayloadAction<Department | null>) => {
      state.currentDepartment = action.payload
    },

    // Add a new department to the list (for optimistic updates)
    addDepartment: (state, action: PayloadAction<Department>) => {
      state.departments.unshift(action.payload)
      state.pagination.totalCount += 1
    },

    // Update a department in the list
    updateDepartmentInList: (state, action: PayloadAction<Department>) => {
      const index = state.departments.findIndex((dept) => dept.id === action.payload.id)
      if (index !== -1) {
        state.departments[index] = action.payload
      }
      // Also update current department if it's the same one
      if (state.currentDepartment?.id === action.payload.id) {
        state.currentDepartment = action.payload
      }
    },

    // Remove a department from the list
    removeDepartmentFromList: (state, action: PayloadAction<number>) => {
      state.departments = state.departments.filter((dept) => dept.id !== action.payload)
      state.pagination.totalCount -= 1
      // Clear current department if it's the same one
      if (state.currentDepartment?.id === action.payload) {
        state.currentDepartment = null
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch departments cases
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchDepartments.fulfilled, (state, action: PayloadAction<DepartmentsResponse>) => {
        state.loading = false
        state.success = true
        state.departments = action.payload.data
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
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch departments"
        state.success = false
        state.departments = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })

      // Fetch department by ID cases
      .addCase(fetchDepartmentById.pending, (state) => {
        state.currentDepartmentLoading = true
        state.currentDepartmentError = null
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action: PayloadAction<Department>) => {
        state.currentDepartmentLoading = false
        state.currentDepartment = action.payload
        state.currentDepartmentError = null
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.currentDepartmentLoading = false
        state.currentDepartmentError = (action.payload as string) || "Failed to fetch department"
        state.currentDepartment = null
      })

      // Create department cases
      .addCase(createDepartment.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
        state.operationSuccess = false
      })
      .addCase(createDepartment.fulfilled, (state, action: PayloadAction<Department>) => {
        state.operationLoading = false
        state.operationSuccess = true
        state.operationError = null
        // Add the new department to the beginning of the list
        state.departments.unshift(action.payload)
        state.pagination.totalCount += 1
        // Also set as current department
        state.currentDepartment = action.payload
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = (action.payload as string) || "Failed to create department"
        state.operationSuccess = false
      })

      // Update department cases
      .addCase(updateDepartment.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
        state.operationSuccess = false
      })
      .addCase(updateDepartment.fulfilled, (state, action: PayloadAction<Department>) => {
        state.operationLoading = false
        state.operationSuccess = true
        state.operationError = null

        // Update in the list
        const index = state.departments.findIndex((dept) => dept.id === action.payload.id)
        if (index !== -1) {
          state.departments[index] = action.payload
        }

        // Update current department if it's the same one
        if (state.currentDepartment?.id === action.payload.id) {
          state.currentDepartment = action.payload
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = (action.payload as string) || "Failed to update department"
        state.operationSuccess = false
      })

      // Delete department cases
      .addCase(deleteDepartment.pending, (state) => {
        state.operationLoading = true
        state.operationError = null
        state.operationSuccess = false
      })
      .addCase(deleteDepartment.fulfilled, (state, action: PayloadAction<number>) => {
        state.operationLoading = false
        state.operationSuccess = true
        state.operationError = null

        // Remove from the list
        state.departments = state.departments.filter((dept) => dept.id !== action.payload)
        state.pagination.totalCount -= 1

        // Clear current department if it's the same one
        if (state.currentDepartment?.id === action.payload) {
          state.currentDepartment = null
        }
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.operationLoading = false
        state.operationError = (action.payload as string) || "Failed to delete department"
        state.operationSuccess = false
      })
  },
})

export const {
  clearDepartments,
  clearError,
  clearCurrentDepartment,
  clearOperationState,
  resetDepartmentState,
  setPagination,
  setCurrentDepartment,
  addDepartment,
  updateDepartmentInList,
  removeDepartmentFromList,
} = departmentSlice.actions

// Selectors
export const selectDepartments = (state: RootState) => state.departments.departments

export const selectDepartmentsLoading = (state: RootState) => state.departments.loading

export const selectDepartmentsError = (state: RootState) => state.departments.error

export const selectDepartmentsSuccess = (state: RootState) => state.departments.success

export const selectDepartmentsPagination = (state: RootState) => state.departments.pagination

export const selectCurrentDepartment = (state: RootState) => state.departments.currentDepartment

export const selectCurrentDepartmentLoading = (state: RootState) => state.departments.currentDepartmentLoading

export const selectCurrentDepartmentError = (state: RootState) => state.departments.currentDepartmentError

export const selectOperationLoading = (state: RootState) => state.departments.operationLoading

export const selectOperationError = (state: RootState) => state.departments.operationError

export const selectOperationSuccess = (state: RootState) => state.departments.operationSuccess

export default departmentSlice.reducer
