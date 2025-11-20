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

// Interfaces for Reset Password
export interface ResetPasswordRequest {
  newPassword: string
}

export interface ResetPasswordResponse {
  isSuccess: boolean
  message: string
}

// Interfaces for Change Request
export interface ChangeRequestItem {
  path: string
  value: string
}

export interface ChangeRequestDispute {
  type: number
  disputeId: number
}

export interface ChangeRequestPreconditions {
  [key: string]: string
}

export interface ChangeRequestData {
  changes: ChangeRequestItem[]
  comment: string
  dispute?: ChangeRequestDispute
  preconditions?: ChangeRequestPreconditions
}

export interface ChangeRequestResponseData {
  publicId: string
  reference: string
  status: number
  entityType: number
  entityId: number
  entityLabel: string
  requestedBy: string
  requestedAtUtc: string
  patchDocument: string
  displayDiff: string
  requesterComment: string
  canonicalPaths: string
  source: number
  autoApproved: boolean
  approvalNotes: string
  declinedReason: string
  approvedAtUtc: string
  approvedBy: string
  appliedAtUtc: string
  failureReason: string
  disputeType: number
  disputeId: number
}

export interface ChangeRequestResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestResponseData
}

// Interfaces for View Change Requests
export interface ChangeRequestListItem {
  publicId: string
  reference: string
  status: number
  entityType: number
  entityId: number
  entityLabel: string
  requestedBy: string
  requestedAtUtc: string
  source?: number
}

export interface ChangeRequestsResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestListItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ChangeRequestsRequestParams {
  pageNumber: number
  pageSize: number
  status?: number
  source?: number
  reference?: string
  publicId?: string
}

// Interfaces for Change Request Details
export interface ChangeRequestDetails {
  publicId: string
  reference: string
  status: number
  entityType: number
  entityId: number
  entityLabel: string
  requestedBy: string
  requestedAtUtc: string
  patchDocument: string
  displayDiff: string
  requesterComment: string
  canonicalPaths: string
  source: number
  autoApproved: boolean
  approvalNotes: string | null
  declinedReason: string | null
  approvedAtUtc: string | null
  approvedBy: string | null
  appliedAtUtc: string | null
  failureReason: string | null
  disputeType: number | null
  disputeId: number | null
}

export interface ChangeRequestDetailsResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestDetails
}

// Interfaces for Approve Change Request
export interface ApproveChangeRequestRequest {
  notes?: string
}

export interface ApproveChangeRequestResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestResponseData
}

// Interfaces for Decline Change Request
export interface DeclineChangeRequestRequest {
  reason: string
}

export interface DeclineChangeRequestResponse {
  isSuccess: boolean
  message: string
  data: ChangeRequestResponseData
}

// Interfaces for Employee Report
export interface EmployeeReportData {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  mustChangePasswordUsers: number
  emailVerifiedUsers: number
  phoneVerifiedUsers: number
  withDepartmentUsers: number
  withoutDepartmentUsers: number
  withAreaOfficeUsers: number
  withoutAreaOfficeUsers: number
  loggedInLast30Days: number
  pendingInvitations: number
  expiringInvitations: number
}

export interface EmployeeReportResponse {
  isSuccess: boolean
  message: string
  data: EmployeeReportData
}

// Interfaces for Department Report
export interface DepartmentReportItem {
  departmentId: number
  departmentName: string
  totalUsers: number
  activeUsers: number
}

export interface DepartmentReportResponse {
  isSuccess: boolean
  message: string
  data: DepartmentReportItem[]
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

  // Reset Password state
  resetPasswordLoading: boolean
  resetPasswordError: string | null
  resetPasswordSuccess: boolean

  // Change Request state
  changeRequestLoading: boolean
  changeRequestError: string | null
  changeRequestSuccess: boolean
  changeRequestResponse: ChangeRequestResponseData | null

  // View Change Requests state
  changeRequests: ChangeRequestListItem[]
  changeRequestsLoading: boolean
  changeRequestsError: string | null
  changeRequestsSuccess: boolean
  changeRequestsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Change Requests By Employee ID state
  changeRequestsByEmployee: ChangeRequestListItem[]
  changeRequestsByEmployeeLoading: boolean
  changeRequestsByEmployeeError: string | null
  changeRequestsByEmployeeSuccess: boolean
  changeRequestsByEmployeePagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // Change Request Details state
  changeRequestDetails: ChangeRequestDetails | null
  changeRequestDetailsLoading: boolean
  changeRequestDetailsError: string | null
  changeRequestDetailsSuccess: boolean

  // Approve Change Request state
  approveChangeRequestLoading: boolean
  approveChangeRequestError: string | null
  approveChangeRequestSuccess: boolean
  approveChangeRequestResponse: ChangeRequestResponseData | null

  // Decline Change Request state
  declineChangeRequestLoading: boolean
  declineChangeRequestError: string | null
  declineChangeRequestSuccess: boolean
  declineChangeRequestResponse: ChangeRequestResponseData | null

  // Employee Report state
  employeeReport: EmployeeReportData | null
  employeeReportLoading: boolean
  employeeReportError: string | null
  employeeReportSuccess: boolean

  // Department Report state
  departmentReport: DepartmentReportItem[]
  departmentReportLoading: boolean
  departmentReportError: string | null
  departmentReportSuccess: boolean

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
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccess: false,
  changeRequestLoading: false,
  changeRequestError: null,
  changeRequestSuccess: false,
  changeRequestResponse: null,
  changeRequests: [],
  changeRequestsLoading: false,
  changeRequestsError: null,
  changeRequestsSuccess: false,
  changeRequestsPagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  changeRequestsByEmployee: [],
  changeRequestsByEmployeeLoading: false,
  changeRequestsByEmployeeError: null,
  changeRequestsByEmployeeSuccess: false,
  changeRequestsByEmployeePagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  changeRequestDetails: null,
  changeRequestDetailsLoading: false,
  changeRequestDetailsError: null,
  changeRequestDetailsSuccess: false,
  approveChangeRequestLoading: false,
  approveChangeRequestError: null,
  approveChangeRequestSuccess: false,
  approveChangeRequestResponse: null,
  declineChangeRequestLoading: false,
  declineChangeRequestError: null,
  declineChangeRequestSuccess: false,
  declineChangeRequestResponse: null,
  employeeReport: null,
  employeeReportLoading: false,
  employeeReportError: null,
  employeeReportSuccess: false,
  departmentReport: [],
  departmentReportLoading: false,
  departmentReportError: null,
  departmentReportSuccess: false,
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

export const fetchEmployeeReport = createAsyncThunk("employee/fetchEmployeeReport", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<EmployeeReportResponse>(buildApiUrl(API_ENDPOINTS.EMPLOYEE.EMPLOYEE_REPORT))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch employee report")
    }

    // Fixed: Ensure data exists
    if (!response.data.data) {
      return rejectWithValue("Employee report data not found")
    }

    return response.data.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch employee report")
    }
    return rejectWithValue(error.message || "Network error during employee report fetch")
  }
})

export const fetchDepartmentReport = createAsyncThunk(
  "employee/fetchDepartmentReport",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<DepartmentReportResponse>(
        buildApiUrl(API_ENDPOINTS.EMPLOYEE.REPORTS_BY_DEPARTMENT)
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch department report")
      }

      // Fixed: Ensure data exists with fallback
      if (!response.data.data) {
        return rejectWithValue("Department report data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch department report")
      }
      return rejectWithValue(error.message || "Network error during department report fetch")
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

export const resetEmployeePassword = createAsyncThunk(
  "employee/resetEmployeePassword",
  async ({ id, passwordData }: { id: number; passwordData: ResetPasswordRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.EMPLOYEE.RESET_PASSWORD.replace("{id}", id.toString())
      const response = await api.post<ResetPasswordResponse>(buildApiUrl(endpoint), passwordData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to reset password")
      }

      return {
        employeeId: id,
        message: response.data.message || "Password reset successfully",
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to reset password")
      }
      return rejectWithValue(error.message || "Network error during password reset")
    }
  }
)

export const submitChangeRequest = createAsyncThunk(
  "employee/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.EMPLOYEE.CHANGE_REQUEST.replace("{id}", id.toString())
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      // Fixed: Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Change request response data not found")
      }

      return {
        employeeId: id,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to submit change request")
      }
      return rejectWithValue(error.message || "Network error during change request submission")
    }
  }
)

export const fetchChangeRequests = createAsyncThunk(
  "employee/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const response = await api.get<ChangeRequestsResponse>(buildApiUrl(API_ENDPOINTS.EMPLOYEE.VIEW_CHANGE_REQUEST), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(status !== undefined && { Status: status }),
          ...(source !== undefined && { Source: source }),
          ...(reference && { Reference: reference }),
          ...(publicId && { PublicId: publicId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change requests")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests")
      }
      return rejectWithValue(error.message || "Network error during change requests fetch")
    }
  }
)

// New async thunk for fetching change requests by employee ID
export const fetchChangeRequestsByEmployeeId = createAsyncThunk(
  "employee/fetchChangeRequestsByEmployeeId",
  async (
    {
      id,
      params,
    }: {
      id: number
      params: ChangeRequestsRequestParams
    },
    { rejectWithValue }
  ) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const endpoint = API_ENDPOINTS.EMPLOYEE.CHANGE_REQUESTS_BY_ID.replace("{id}", id.toString())
      const response = await api.get<ChangeRequestsResponse>(buildApiUrl(endpoint), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(status !== undefined && { Status: status }),
          ...(source !== undefined && { Source: source }),
          ...(reference && { Reference: reference }),
          ...(publicId && { PublicId: publicId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change requests for employee")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests for employee")
      }
      return rejectWithValue(error.message || "Network error during employee change requests fetch")
    }
  }
)

export const fetchChangeRequestDetails = createAsyncThunk(
  "employee/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.EMPLOYEE.CHANGE_REQUEST_DETAILS.replace("{identifier}", identifier)
      const response = await api.get<ChangeRequestDetailsResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change request details")
      }

      // Fixed: Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Change request details not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change request details")
      }
      return rejectWithValue(error.message || "Network error during change request details fetch")
    }
  }
)

export const approveChangeRequest = createAsyncThunk(
  "employee/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.EMPLOYEE.APPROVE_CHANGE_REQUEST.replace("{publicId}", publicId)
      const requestBody: ApproveChangeRequestRequest = {}

      if (notes) {
        requestBody.notes = notes
      }

      const response = await api.post<ApproveChangeRequestResponse>(buildApiUrl(endpoint), requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to approve change request")
      }

      // Fixed: Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Approved change request data not found")
      }

      return {
        publicId,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to approve change request")
      }
      return rejectWithValue(error.message || "Network error during change request approval")
    }
  }
)

export const declineChangeRequest = createAsyncThunk(
  "employee/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.EMPLOYEE.DECLINE_CHANGE_REQUEST.replace("{publicId}", publicId)
      const requestBody: DeclineChangeRequestRequest = {
        reason: reason,
      }

      const response = await api.post<DeclineChangeRequestResponse>(buildApiUrl(endpoint), requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to decline change request")
      }

      // Fixed: Ensure data exists
      if (!response.data.data) {
        return rejectWithValue("Declined change request data not found")
      }

      return {
        publicId,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to decline change request")
      }
      return rejectWithValue(error.message || "Network error during change request decline")
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

    // Clear employee report
    clearEmployeeReport: (state) => {
      state.employeeReport = null
      state.employeeReportError = null
      state.employeeReportSuccess = false
      state.employeeReportLoading = false
    },

    // Clear department report
    clearDepartmentReport: (state) => {
      state.departmentReport = []
      state.departmentReportError = null
      state.departmentReportSuccess = false
      state.departmentReportLoading = false
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

    // Clear reset password status
    clearResetPasswordStatus: (state) => {
      state.resetPasswordError = null
      state.resetPasswordSuccess = false
      state.resetPasswordLoading = false
    },

    // Clear change request status
    clearChangeRequestStatus: (state) => {
      state.changeRequestError = null
      state.changeRequestSuccess = false
      state.changeRequestLoading = false
      state.changeRequestResponse = null
    },

    // Clear change requests state
    clearChangeRequests: (state) => {
      state.changeRequests = []
      state.changeRequestsError = null
      state.changeRequestsSuccess = false
      state.changeRequestsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear change requests by employee state
    clearChangeRequestsByEmployee: (state) => {
      state.changeRequestsByEmployee = []
      state.changeRequestsByEmployeeError = null
      state.changeRequestsByEmployeeSuccess = false
      state.changeRequestsByEmployeePagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear change request details
    clearChangeRequestDetails: (state) => {
      state.changeRequestDetails = null
      state.changeRequestDetailsError = null
      state.changeRequestDetailsSuccess = false
      state.changeRequestDetailsLoading = false
    },

    // Clear approve change request status
    clearApproveChangeRequestStatus: (state) => {
      state.approveChangeRequestError = null
      state.approveChangeRequestSuccess = false
      state.approveChangeRequestLoading = false
      state.approveChangeRequestResponse = null
    },

    // Clear decline change request status
    clearDeclineChangeRequestStatus: (state) => {
      state.declineChangeRequestError = null
      state.declineChangeRequestSuccess = false
      state.declineChangeRequestLoading = false
      state.declineChangeRequestResponse = null
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.inviteError = null
      state.employeesError = null
      state.employeeDetailsError = null
      state.employeeReportError = null
      state.departmentReportError = null
      state.updateError = null
      state.deactivateError = null
      state.activateError = null
      state.resetPasswordError = null
      state.changeRequestError = null
      state.changeRequestsError = null
      state.changeRequestsByEmployeeError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
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
      state.resetPasswordLoading = false
      state.resetPasswordError = null
      state.resetPasswordSuccess = false
      state.changeRequestLoading = false
      state.changeRequestError = null
      state.changeRequestSuccess = false
      state.changeRequestResponse = null
      state.changeRequests = []
      state.changeRequestsLoading = false
      state.changeRequestsError = null
      state.changeRequestsSuccess = false
      state.changeRequestsPagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.changeRequestsByEmployee = []
      state.changeRequestsByEmployeeLoading = false
      state.changeRequestsByEmployeeError = null
      state.changeRequestsByEmployeeSuccess = false
      state.changeRequestsByEmployeePagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.changeRequestDetails = null
      state.changeRequestDetailsLoading = false
      state.changeRequestDetailsError = null
      state.changeRequestDetailsSuccess = false
      state.approveChangeRequestLoading = false
      state.approveChangeRequestError = null
      state.approveChangeRequestSuccess = false
      state.approveChangeRequestResponse = null
      state.declineChangeRequestLoading = false
      state.declineChangeRequestError = null
      state.declineChangeRequestSuccess = false
      state.declineChangeRequestResponse = null
      state.employeeReport = null
      state.employeeReportLoading = false
      state.employeeReportError = null
      state.employeeReportSuccess = false
      state.departmentReport = []
      state.departmentReportLoading = false
      state.departmentReportError = null
      state.departmentReportSuccess = false
      state.loading = false
      state.error = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set change requests pagination
    setChangeRequestsPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsPagination.currentPage = action.payload.page
      state.changeRequestsPagination.pageSize = action.payload.pageSize
    },

    // Set change requests by employee pagination
    setChangeRequestsByEmployeePagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsByEmployeePagination.currentPage = action.payload.page
      state.changeRequestsByEmployeePagination.pageSize = action.payload.pageSize
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
      // Fetch employee report cases
      .addCase(fetchEmployeeReport.pending, (state) => {
        state.employeeReportLoading = true
        state.employeeReportError = null
        state.employeeReportSuccess = false
      })
      .addCase(fetchEmployeeReport.fulfilled, (state, action: PayloadAction<EmployeeReportData>) => {
        state.employeeReportLoading = false
        state.employeeReportSuccess = true
        state.employeeReport = action.payload
        state.employeeReportError = null
      })
      .addCase(fetchEmployeeReport.rejected, (state, action) => {
        state.employeeReportLoading = false
        state.employeeReportError = (action.payload as string) || "Failed to fetch employee report"
        state.employeeReportSuccess = false
        state.employeeReport = null
      })
      // Fetch department report cases
      .addCase(fetchDepartmentReport.pending, (state) => {
        state.departmentReportLoading = true
        state.departmentReportError = null
        state.departmentReportSuccess = false
      })
      .addCase(fetchDepartmentReport.fulfilled, (state, action: PayloadAction<DepartmentReportItem[]>) => {
        state.departmentReportLoading = false
        state.departmentReportSuccess = true
        state.departmentReport = action.payload
        state.departmentReportError = null
      })
      .addCase(fetchDepartmentReport.rejected, (state, action) => {
        state.departmentReportLoading = false
        state.departmentReportError = (action.payload as string) || "Failed to fetch department report"
        state.departmentReportSuccess = false
        state.departmentReport = []
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
      // Reset password cases
      .addCase(resetEmployeePassword.pending, (state) => {
        state.resetPasswordLoading = true
        state.resetPasswordError = null
        state.resetPasswordSuccess = false
      })
      .addCase(
        resetEmployeePassword.fulfilled,
        (state, action: PayloadAction<{ employeeId: number; message: string }>) => {
          state.resetPasswordLoading = false
          state.resetPasswordSuccess = true
          state.resetPasswordError = null

          const { employeeId } = action.payload

          // Update the employee's mustChangePassword status in the list
          const index = state.employees.findIndex((emp) => emp.id === employeeId)
          if (index !== -1) {
            const employee = state.employees[index]
            if (employee) {
              employee.mustChangePassword = true
            }
          }

          // Update employee details if it's the current one
          if (state.employeeDetails && state.employeeDetails.id === employeeId) {
            state.employeeDetails.mustChangePassword = true
          }
        }
      )
      .addCase(resetEmployeePassword.rejected, (state, action) => {
        state.resetPasswordLoading = false
        state.resetPasswordError = (action.payload as string) || "Failed to reset password"
        state.resetPasswordSuccess = false
      })
      // Change request cases
      .addCase(submitChangeRequest.pending, (state) => {
        state.changeRequestLoading = true
        state.changeRequestError = null
        state.changeRequestSuccess = false
        state.changeRequestResponse = null
      })
      .addCase(
        submitChangeRequest.fulfilled,
        (
          state,
          action: PayloadAction<{
            employeeId: number
            data: ChangeRequestResponseData
            message: string
          }>
        ) => {
          state.changeRequestLoading = false
          state.changeRequestSuccess = true
          state.changeRequestError = null
          state.changeRequestResponse = action.payload.data
        }
      )
      .addCase(submitChangeRequest.rejected, (state, action) => {
        state.changeRequestLoading = false
        state.changeRequestError = (action.payload as string) || "Failed to submit change request"
        state.changeRequestSuccess = false
        state.changeRequestResponse = null
      })
      // Fetch change requests cases
      .addCase(fetchChangeRequests.pending, (state) => {
        state.changeRequestsLoading = true
        state.changeRequestsError = null
        state.changeRequestsSuccess = false
      })
      .addCase(fetchChangeRequests.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsLoading = false
        state.changeRequestsSuccess = true
        // Fixed: Ensure data exists with fallback
        state.changeRequests = action.payload.data || []
        state.changeRequestsPagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.changeRequestsError = null
      })
      .addCase(fetchChangeRequests.rejected, (state, action) => {
        state.changeRequestsLoading = false
        state.changeRequestsError = (action.payload as string) || "Failed to fetch change requests"
        state.changeRequestsSuccess = false
        state.changeRequests = []
        state.changeRequestsPagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch change requests by employee ID cases
      .addCase(fetchChangeRequestsByEmployeeId.pending, (state) => {
        state.changeRequestsByEmployeeLoading = true
        state.changeRequestsByEmployeeError = null
        state.changeRequestsByEmployeeSuccess = false
      })
      .addCase(fetchChangeRequestsByEmployeeId.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsByEmployeeLoading = false
        state.changeRequestsByEmployeeSuccess = true
        // Fixed: Ensure data exists with fallback
        state.changeRequestsByEmployee = action.payload.data || []
        state.changeRequestsByEmployeePagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.changeRequestsByEmployeeError = null
      })
      .addCase(fetchChangeRequestsByEmployeeId.rejected, (state, action) => {
        state.changeRequestsByEmployeeLoading = false
        state.changeRequestsByEmployeeError =
          (action.payload as string) || "Failed to fetch change requests for employee"
        state.changeRequestsByEmployeeSuccess = false
        state.changeRequestsByEmployee = []
        state.changeRequestsByEmployeePagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch change request details cases
      .addCase(fetchChangeRequestDetails.pending, (state) => {
        state.changeRequestDetailsLoading = true
        state.changeRequestDetailsError = null
        state.changeRequestDetailsSuccess = false
      })
      .addCase(fetchChangeRequestDetails.fulfilled, (state, action: PayloadAction<ChangeRequestDetails>) => {
        state.changeRequestDetailsLoading = false
        state.changeRequestDetailsSuccess = true
        state.changeRequestDetails = action.payload
        state.changeRequestDetailsError = null
      })
      .addCase(fetchChangeRequestDetails.rejected, (state, action) => {
        state.changeRequestDetailsLoading = false
        state.changeRequestDetailsError = (action.payload as string) || "Failed to fetch change request details"
        state.changeRequestDetailsSuccess = false
        state.changeRequestDetails = null
      })
      // Approve change request cases
      .addCase(approveChangeRequest.pending, (state) => {
        state.approveChangeRequestLoading = true
        state.approveChangeRequestError = null
        state.approveChangeRequestSuccess = false
        state.approveChangeRequestResponse = null
      })
      .addCase(
        approveChangeRequest.fulfilled,
        (
          state,
          action: PayloadAction<{
            publicId: string
            data: ChangeRequestResponseData
            message: string
          }>
        ) => {
          state.approveChangeRequestLoading = false
          state.approveChangeRequestSuccess = true
          state.approveChangeRequestError = null
          state.approveChangeRequestResponse = action.payload.data

          // Update the change request in the list if it exists
          const index = state.changeRequests.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (index !== -1) {
            const req = state.changeRequests[index]
            if (req) {
              req.status = 1 // Set status to APPROVED
            }
          }

          // Update the change request in the employee-specific list if it exists
          const employeeIndex = state.changeRequestsByEmployee.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (employeeIndex !== -1) {
            const req = state.changeRequestsByEmployee[employeeIndex]
            if (req) {
              req.status = 1 // Set status to APPROVED
            }
          }

          // Update change request details if it's the current one
          if (state.changeRequestDetails && state.changeRequestDetails.publicId === action.payload.publicId) {
            state.changeRequestDetails.status = 1 // Set status to APPROVED
            state.changeRequestDetails.approvalNotes = action.payload.data.approvalNotes
            state.changeRequestDetails.approvedAtUtc = action.payload.data.approvedAtUtc
            state.changeRequestDetails.approvedBy = action.payload.data.approvedBy
          }
        }
      )
      .addCase(approveChangeRequest.rejected, (state, action) => {
        state.approveChangeRequestLoading = false
        state.approveChangeRequestError = (action.payload as string) || "Failed to approve change request"
        state.approveChangeRequestSuccess = false
        state.approveChangeRequestResponse = null
      })
      // Decline change request cases
      .addCase(declineChangeRequest.pending, (state) => {
        state.declineChangeRequestLoading = true
        state.declineChangeRequestError = null
        state.declineChangeRequestSuccess = false
        state.declineChangeRequestResponse = null
      })
      .addCase(
        declineChangeRequest.fulfilled,
        (
          state,
          action: PayloadAction<{
            publicId: string
            data: ChangeRequestResponseData
            message: string
          }>
        ) => {
          state.declineChangeRequestLoading = false
          state.declineChangeRequestSuccess = true
          state.declineChangeRequestError = null
          state.declineChangeRequestResponse = action.payload.data

          // Update the change request in the list if it exists
          const index = state.changeRequests.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (index !== -1) {
            const req = state.changeRequests[index]
            if (req) {
              req.status = 2 // Set status to DECLINED
            }
          }

          // Update the change request in the employee-specific list if it exists
          const employeeIndex = state.changeRequestsByEmployee.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (employeeIndex !== -1) {
            const req = state.changeRequestsByEmployee[employeeIndex]
            if (req) {
              req.status = 2 // Set status to DECLINED
            }
          }

          // Update change request details if it's the current one
          if (state.changeRequestDetails && state.changeRequestDetails.publicId === action.payload.publicId) {
            state.changeRequestDetails.status = 2 // Set status to DECLINED
            state.changeRequestDetails.declinedReason = action.payload.data.declinedReason
          }
        }
      )
      .addCase(declineChangeRequest.rejected, (state, action) => {
        state.declineChangeRequestLoading = false
        state.declineChangeRequestError = (action.payload as string) || "Failed to decline change request"
        state.declineChangeRequestSuccess = false
        state.declineChangeRequestResponse = null
      })
  },
})

export const {
  clearEmployees,
  clearEmployeeDetails,
  clearEmployeeReport,
  clearDepartmentReport,
  clearInviteStatus,
  clearUpdateStatus,
  clearDeactivateStatus,
  clearActivateStatus,
  clearResetPasswordStatus,
  clearChangeRequestStatus,
  clearChangeRequests,
  clearChangeRequestsByEmployee,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
  clearError,
  resetEmployeeState,
  setPagination,
  setChangeRequestsPagination,
  setChangeRequestsByEmployeePagination,
  updateEmployeeInList,
  removeEmployeeFromList,
} = employeeSlice.actions

export default employeeSlice.reducer
