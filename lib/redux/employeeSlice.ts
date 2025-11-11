// src/lib/redux/employeeSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Employee
export interface Employee {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  accountId: string
  isActive: boolean
  mustChangePassword: boolean
  employeeId: string | null
  position: string | null
  employmentType: string | null
  departmentId: number | null
  departmentName: string | null
  areaOfficeId: number | null
  areaOfficeName: string | null
}

export interface EmployeesResponse {
  data: Employee[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  isSuccess: boolean
  message: string
}

export interface EmployeesRequestParams {
  pageNumber: number
  pageSize: number
}

// Interfaces for Employee Invite
interface InviteUserRequest {
  fullName: string
  email: string
  phoneNumber: string
  roleIds: number[]
  areaOfficeId: number
  departmentId: number
  employeeId: string
  position: string
  emergencyContact: string
  address: string
  supervisorId: number
  employmentType: string
  isActive: boolean
}

interface InviteUsersRequest {
  users: InviteUserRequest[]
}

interface Role {
  roleId: number
  name: string
  slug: string
  category: string
}

interface Privilege {
  key: string
  name: string
  category: string
  actions: string[]
}

interface InvitedUser {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  accountId: string
  isActive: boolean
  mustChangePassword: boolean
  employeeId: string
  position: string
  employmentType: string
  departmentId: number
  departmentName: string
  areaOfficeId: number
  areaOfficeName: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  profilePicture: string
  emergencyContact: string
  address: string
  supervisorId: number
  supervisorName: string
  roles: Role[]
  privileges: Privilege[]
}

interface InviteUserResponse {
  user: InvitedUser
  temporaryPassword: string
}

interface InviteUsersResponse {
  isSuccess: boolean
  message: string
  data: InviteUserResponse[]
}

// Employee State
interface EmployeeState {
  // Employees list state
  employees: Employee[]
  employeesLoading: boolean
  employeesError: string | null
  employeesSuccess: boolean

  // Pagination state
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Invite state
  inviteLoading: boolean
  inviteError: string | null
  inviteSuccess: boolean
  invitedUsers: InviteUserResponse[] | null

  // General employee state
  loading: boolean
  error: string | null
}

// Initial state
const initialState: EmployeeState = {
  employees: [],
  employeesLoading: false,
  employeesError: null,
  employeesSuccess: false,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  inviteLoading: false,
  inviteError: null,
  inviteSuccess: false,
  invitedUsers: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchEmployees = createAsyncThunk(
  "employee/fetchEmployees",
  async (params: EmployeesRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize } = params

      const response = await api.get<EmployeesResponse>(buildApiUrl(API_ENDPOINTS.EMPLOYEE.EMPLOYEE), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch employees")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch employees")
      }
      return rejectWithValue(error.message || "Network error during employees fetch")
    }
  }
)

export const fetchEmployeeById = createAsyncThunk<Employee, number, { rejectValue: string }>(
  "employee/fetchEmployeeById",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<EmployeesResponse>(`${buildApiUrl(API_ENDPOINTS.EMPLOYEE.EMPLOYEE)}/${employeeId}`)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch employee")
      }

      const employee = response.data.data?.[0]
      if (!employee) {
        return rejectWithValue("Employee not found")
      }
      return employee
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch employee")
      }
      return rejectWithValue(error.message || "Network error during employee fetch")
    }
  }
)

export const inviteEmployees = createAsyncThunk(
  "employee/inviteEmployees",
  async (inviteData: InviteUsersRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<InviteUsersResponse>(buildApiUrl(API_ENDPOINTS.EMPLOYEE.INVITE), inviteData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to invite employees")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to invite employees")
      }
      return rejectWithValue(error.message || "Network error during employee invitation")
    }
  }
)

export const updateEmployee = createAsyncThunk<
  Employee,
  { id: number; employeeData: Partial<Employee> },
  { rejectValue: string }
>(
  "employee/updateEmployee",
  async ({ id, employeeData }, { rejectWithValue }) => {
    try {
      const response = await api.put<EmployeesResponse>(
        `${buildApiUrl(API_ENDPOINTS.EMPLOYEE.EMPLOYEE)}/${id}`,
        employeeData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update employee") as any
      }

      const updated = response.data.data?.[0]
      if (!updated) {
        return rejectWithValue("Failed to update employee") as any
      }

      return updated
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update employee") as any
      }
      return rejectWithValue(error.message || "Network error during employee update") as any
    }
  }
)

export const deleteEmployee = createAsyncThunk(
  "employee/deleteEmployee",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      const response = await api.delete<EmployeesResponse>(
        `${buildApiUrl(API_ENDPOINTS.EMPLOYEE.EMPLOYEE)}/${employeeId}`
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to delete employee")
      }

      return employeeId
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to delete employee")
      }
      return rejectWithValue(error.message || "Network error during employee deletion")
    }
  }
)

// Employee slice
const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    // Clear employees state
    clearEmployees: (state) => {
      state.employees = []
      state.employeesError = null
      state.employeesSuccess = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear invite status
    clearInviteStatus: (state) => {
      state.inviteError = null
      state.inviteSuccess = false
      state.invitedUsers = null
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.inviteError = null
      state.employeesError = null
    },

    // Reset employee state
    resetEmployeeState: (state) => {
      state.employees = []
      state.employeesLoading = false
      state.employeesError = null
      state.employeesSuccess = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.inviteLoading = false
      state.inviteError = null
      state.inviteSuccess = false
      state.invitedUsers = null
      state.loading = false
      state.error = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Update employee in list (optimistic update)
    updateEmployeeInList: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex((emp) => emp.id === action.payload.id)
      if (index !== -1) {
        state.employees[index] = action.payload
      }
    },

    // Remove employee from list
    removeEmployeeFromList: (state, action: PayloadAction<number>) => {
      state.employees = state.employees.filter((emp) => emp.id !== action.payload)
      state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees cases
      .addCase(fetchEmployees.pending, (state) => {
        state.employeesLoading = true
        state.employeesError = null
        state.employeesSuccess = false
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<EmployeesResponse>) => {
        state.employeesLoading = false
        state.employeesSuccess = true
        state.employees = action.payload.data
        state.pagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
        state.employeesError = null
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.employeesLoading = false
        state.employeesError = (action.payload as string) || "Failed to fetch employees"
        state.employeesSuccess = false
        state.employees = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch employee by ID cases
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false
        // You might want to store the current employee separately
        state.error = null
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch employee"
      })
      // Invite employees cases
      .addCase(inviteEmployees.pending, (state) => {
        state.inviteLoading = true
        state.inviteError = null
        state.inviteSuccess = false
        state.invitedUsers = null
      })
      .addCase(inviteEmployees.fulfilled, (state, action: PayloadAction<InviteUsersResponse>) => {
        state.inviteLoading = false
        state.inviteSuccess = true
        state.invitedUsers = action.payload.data
        state.inviteError = null
      })
      .addCase(inviteEmployees.rejected, (state, action) => {
        state.inviteLoading = false
        state.inviteError = (action.payload as string) || "Failed to invite employees"
        state.inviteSuccess = false
        state.invitedUsers = null
      })
      // Update employee cases
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false
        // Update the employee in the list
        const index = state.employees.findIndex((emp) => emp.id === action.payload.id)
        if (index !== -1) {
          state.employees[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to update employee"
      })
      // Delete employee cases
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteEmployee.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false
        state.employees = state.employees.filter((emp) => emp.id !== action.payload)
        state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1)
        state.error = null
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to delete employee"
      })
  },
})

export const {
  clearEmployees,
  clearInviteStatus,
  clearError,
  resetEmployeeState,
  setPagination,
  updateEmployeeInList,
  removeEmployeeFromList,
} = employeeSlice.actions

export default employeeSlice.reducer
