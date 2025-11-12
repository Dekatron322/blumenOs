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

// Extended Employee interface for detailed view
export interface EmployeeDetails {
  lastLoginAt: any
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
  createdAt?: string
  updatedAt?: string
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

export interface EmployeeDetailsResponse {
  isSuccess: boolean
  message: string
  data: EmployeeDetails
}

export interface EmployeesRequestParams {
  pageNumber: number
  pageSize: number
}

// Interfaces for Employee Update
export interface UpdateEmployeeRequest {
  fullName: string
  phoneNumber: string
  isActive: boolean
  roleIds: number[]
  areaOfficeId: number
  departmentId: number
  employeeId: string
  position: string
  emergencyContact: string
  address: string
  supervisorId: number
  employmentType: string
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
  description?: string
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

// Update Employee Response Interface
interface UpdateEmployeeResponse {
  isSuccess: boolean
  message: string
  data: EmployeeDetails
}

// Deactivate Employee Response Interface
interface DeactivateEmployeeResponse {
  isSuccess: boolean
  message: string
}

// Activate Employee Response Interface
interface ActivateEmployeeResponse {
  isSuccess: boolean
  message: string
}

// Employee State - Mutable Redux state object
interface EmployeeState {
  // Employees list state
  employees: Employee[]
  employeesLoading: boolean
  employeesError: string | null
  employeesSuccess: boolean

  // Employee details state
  employeeDetails: EmployeeDetails | null
  employeeDetailsLoading: boolean
  employeeDetailsError: string | null
  employeeDetailsSuccess: boolean

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

  // Update state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean

  // Deactivate state
  deactivateLoading: boolean
  deactivateError: string | null
  deactivateSuccess: boolean

  // Activate state
  activateLoading: boolean
  activateError: string | null
  activateSuccess: boolean

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
  employeeDetails: null,
  employeeDetailsLoading: false,
  employeeDetailsError: null,
  employeeDetailsSuccess: false,
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
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  deactivateLoading: false,
  deactivateError: null,
  deactivateSuccess: false,
  activateLoading: false,
  activateError: null,
  activateSuccess: false,
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

      // Fixed: Proper null check for data array
      const employees = response.data.data || []
      const employee = employees[0]
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

export const fetchEmployeeDetails = createAsyncThunk(
  "employee/fetchEmployeeDetails",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.EMPLOYEE.EMPLOYEE_DETAILS.replace("{id}", employeeId.toString())
      const response = await api.get<EmployeeDetailsResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch employee details")
      }

      // Fixed: Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Employee details not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch employee details")
      }
      return rejectWithValue(error.message || "Network error during employee details fetch")
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

      // Fixed: Ensure data exists and provide fallback
      return {
        ...response.data,
        data: response.data.data || [],
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to invite employees")
      }
      return rejectWithValue(error.message || "Network error during employee invitation")
    }
  }
)

export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async ({ id, employeeData }: { id: number; employeeData: UpdateEmployeeRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.EMPLOYEE.UPDATE_EMPLOYEE.replace("{id}", id.toString())
      const response = await api.put<UpdateEmployeeResponse>(buildApiUrl(endpoint), employeeData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update employee")
      }

      // Fixed: Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Updated employee data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update employee")
      }
      return rejectWithValue(error.message || "Network error during employee update")
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

export const deactivateEmployee = createAsyncThunk(
  "employee/deactivateEmployee",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.EMPLOYEE.DEACTIVATE.replace("{id}", employeeId.toString())
      const response = await api.post<DeactivateEmployeeResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to deactivate employee")
      }

      return { employeeId, message: response.data.message || "Employee deactivated successfully" }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to deactivate employee")
      }
      return rejectWithValue(error.message || "Network error during employee deactivation")
    }
  }
)

export const activateEmployee = createAsyncThunk(
  "employee/activateEmployee",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.EMPLOYEE.ACTIVATE.replace("{id}", employeeId.toString())
      const response = await api.post<ActivateEmployeeResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to activate employee")
      }

      return { employeeId, message: response.data.message || "Employee activated successfully" }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to activate employee")
      }
      return rejectWithValue(error.message || "Network error during employee activation")
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

    // Clear employee details
    clearEmployeeDetails: (state) => {
      state.employeeDetails = null
      state.employeeDetailsError = null
      state.employeeDetailsSuccess = false
    },

    // Clear invite status
    clearInviteStatus: (state) => {
      state.inviteError = null
      state.inviteSuccess = false
      state.invitedUsers = null
    },

    // Clear update status
    clearUpdateStatus: (state) => {
      state.updateError = null
      state.updateSuccess = false
      state.updateLoading = false
    },

    // Clear deactivate status
    clearDeactivateStatus: (state) => {
      state.deactivateError = null
      state.deactivateSuccess = false
      state.deactivateLoading = false
    },

    // Clear activate status
    clearActivateStatus: (state) => {
      state.activateError = null
      state.activateSuccess = false
      state.activateLoading = false
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.inviteError = null
      state.employeesError = null
      state.employeeDetailsError = null
      state.updateError = null
      state.deactivateError = null
      state.activateError = null
    },

    // Reset employee state
    resetEmployeeState: (state) => {
      state.employees = []
      state.employeesLoading = false
      state.employeesError = null
      state.employeesSuccess = false
      state.employeeDetails = null
      state.employeeDetailsLoading = false
      state.employeeDetailsError = null
      state.employeeDetailsSuccess = false
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
      state.updateLoading = false
      state.updateError = null
      state.updateSuccess = false
      state.deactivateLoading = false
      state.deactivateError = null
      state.deactivateSuccess = false
      state.activateLoading = false
      state.activateError = null
      state.activateSuccess = false
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
        // Fixed: Ensure data exists with fallback
        state.employees = action.payload.data || []
        state.pagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
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
        state.error = null
        // Optional: You can store the fetched employee if needed
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch employee"
      })
      // Fetch employee details cases
      .addCase(fetchEmployeeDetails.pending, (state) => {
        state.employeeDetailsLoading = true
        state.employeeDetailsError = null
        state.employeeDetailsSuccess = false
      })
      .addCase(fetchEmployeeDetails.fulfilled, (state, action: PayloadAction<EmployeeDetails>) => {
        state.employeeDetailsLoading = false
        state.employeeDetailsSuccess = true
        state.employeeDetails = action.payload
        state.employeeDetailsError = null
      })
      .addCase(fetchEmployeeDetails.rejected, (state, action) => {
        state.employeeDetailsLoading = false
        state.employeeDetailsError = (action.payload as string) || "Failed to fetch employee details"
        state.employeeDetailsSuccess = false
        state.employeeDetails = null
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
        // Fixed: Ensure data exists with fallback
        state.invitedUsers = action.payload.data || []
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
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateEmployee.fulfilled, (state, action: PayloadAction<EmployeeDetails>) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.updateError = null

        // Update the employee in the list if exists - convert EmployeeDetails to Employee format
        const index = state.employees.findIndex((emp) => emp.id === action.payload.id)
        if (index !== -1) {
          const updatedEmployee: Employee = {
            id: action.payload.id,
            fullName: action.payload.fullName,
            email: action.payload.email,
            phoneNumber: action.payload.phoneNumber,
            accountId: action.payload.accountId,
            isActive: action.payload.isActive,
            mustChangePassword: action.payload.mustChangePassword,
            employeeId: action.payload.employeeId,
            position: action.payload.position,
            employmentType: action.payload.employmentType,
            departmentId: action.payload.departmentId,
            departmentName: action.payload.departmentName,
            areaOfficeId: action.payload.areaOfficeId,
            areaOfficeName: action.payload.areaOfficeName,
          }
          state.employees[index] = updatedEmployee
        }

        // Update employee details if it's the current one
        if (state.employeeDetails && state.employeeDetails.id === action.payload.id) {
          state.employeeDetails = action.payload
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update employee"
        state.updateSuccess = false
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
      // Deactivate employee cases
      .addCase(deactivateEmployee.pending, (state) => {
        state.deactivateLoading = true
        state.deactivateError = null
        state.deactivateSuccess = false
      })
      .addCase(
        deactivateEmployee.fulfilled,
        (state, action: PayloadAction<{ employeeId: number; message: string }>) => {
          state.deactivateLoading = false
          state.deactivateSuccess = true
          state.deactivateError = null

          const { employeeId } = action.payload

          // Update the employee's isActive status in the list
          const index = state.employees.findIndex((emp) => emp.id === employeeId)
          if (index !== -1) {
            const employee = state.employees[index]
            if (employee) {
              employee.isActive = false
            }
          }

          // Update employee details if it's the current one
          if (state.employeeDetails && state.employeeDetails.id === employeeId) {
            state.employeeDetails.isActive = false
          }
        }
      )
      .addCase(deactivateEmployee.rejected, (state, action) => {
        state.deactivateLoading = false
        state.deactivateError = (action.payload as string) || "Failed to deactivate employee"
        state.deactivateSuccess = false
      })
      // Activate employee cases
      .addCase(activateEmployee.pending, (state) => {
        state.activateLoading = true
        state.activateError = null
        state.activateSuccess = false
      })
      .addCase(activateEmployee.fulfilled, (state, action: PayloadAction<{ employeeId: number; message: string }>) => {
        state.activateLoading = false
        state.activateSuccess = true
        state.activateError = null

        const { employeeId } = action.payload

        // Update the employee's isActive status in the list
        const index = state.employees.findIndex((emp) => emp.id === employeeId)
        if (index !== -1) {
          const employee = state.employees[index]
          if (employee) {
            employee.isActive = true
          }
        }

        // Update employee details if it's the current one
        if (state.employeeDetails && state.employeeDetails.id === employeeId) {
          state.employeeDetails.isActive = true
        }
      })
      .addCase(activateEmployee.rejected, (state, action) => {
        state.activateLoading = false
        state.activateError = (action.payload as string) || "Failed to activate employee"
        state.activateSuccess = false
      })
  },
})

export const {
  clearEmployees,
  clearEmployeeDetails,
  clearInviteStatus,
  clearUpdateStatus,
  clearDeactivateStatus,
  clearActivateStatus,
  clearError,
  resetEmployeeState,
  setPagination,
  updateEmployeeInList,
  removeEmployeeFromList,
} = employeeSlice.actions

export default employeeSlice.reducer
