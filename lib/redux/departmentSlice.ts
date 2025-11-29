// src/lib/redux/departmentSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Department
export interface Department {
  id: number
  name: string
  description: string
  isActive: boolean
  companyId: number
  companyName: string
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
      // Note: This assumes there's a GET by ID endpoint
      // You might need to adjust this based on your actual API
      const response = await api.get<DepartmentsResponse>(
        `${buildApiUrl(API_ENDPOINTS.DEPARTMENT.GET)}/${departmentId}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch department")
      }

      const department = response.data.data?.[0]
      if (!department) {
        return rejectWithValue("Department not found")
      }

      return department
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch department")
      }
      return rejectWithValue(error.message || "Network error during department fetch")
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
    },

    // Clear current department
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null
      state.currentDepartmentError = null
    },

    // Reset department state
    resetDepartmentState: (state) => {
      state.departments = []
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
      state.currentDepartment = null
      state.currentDepartmentLoading = false
      state.currentDepartmentError = null
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
    updateDepartment: (state, action: PayloadAction<Department>) => {
      const index = state.departments.findIndex((dept) => dept.id === action.payload.id)
      if (index !== -1) {
        state.departments[index] = action.payload
      }
    },

    // Remove a department from the list
    removeDepartment: (state, action: PayloadAction<number>) => {
      state.departments = state.departments.filter((dept) => dept.id !== action.payload)
      state.pagination.totalCount -= 1
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
  },
})

export const {
  clearDepartments,
  clearError,
  clearCurrentDepartment,
  resetDepartmentState,
  setPagination,
  setCurrentDepartment,
  addDepartment,
  updateDepartment,
  removeDepartment,
} = departmentSlice.actions

export default departmentSlice.reducer
