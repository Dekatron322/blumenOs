// src/lib/redux/areaOfficeSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for User
export interface User {
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
  employmentStartAt: string
  employmentEndAt: string
  departmentId: number
  departmentName: string
  areaOfficeId: number
  areaOfficeName: string
  lastLoginAt: string
  createdAt: string
  lastUpdated: string
}

// Interfaces for Company
export interface Company {
  id: number
  name: string
  nercCode: string
  nercSupplyStructure: number
}

export interface AreaOffice {
  id: number
  nameOfNewOAreaffice: string
  newKaedcoCode: string
  newNercCode: string
  oldKaedcoCode?: string
  oldNercCode?: string
  nameOfOldOAreaffice?: string
  latitude: number
  longitude: number
  company: Company
}

export interface InjectionSubstation {
  id: number
  nercCode: string
  injectionSubstationCode: string
  technicalEngineerUserId: number
  technicalEngineerUser: User
  areaOffice: AreaOffice
}

export interface ServiceCenter {
  id: number
  name: string
  code: string
  address: string
  areaOfficeId: number
  areaOffice: AreaOffice
  latitude: number
  longitude: number
}

export interface AreaOfficeDetail {
  id: number
  nameOfNewOAreaffice: string
  newKaedcoCode: string
  newNercCode: string
  oldKaedcoCode?: string
  oldNercCode?: string
  nameOfOldOAreaffice?: string
  latitude: number
  longitude: number
  company: Company
  injectionSubstations?: InjectionSubstation[]
  serviceCenters?: ServiceCenter[]
}

export interface AreaOfficesResponse {
  isSuccess: boolean
  message: string
  data: AreaOffice[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface AreaOfficeResponse {
  isSuccess: boolean
  message: string
  data: AreaOffice[]
}

export interface SingleAreaOfficeResponse {
  isSuccess: boolean
  message: string
  data: AreaOfficeDetail
}

export interface AreaOfficesRequestParams {
  PageNumber: number
  PageSize: number
  Search?: string
  CompanyId?: number
  AreaOfficeId?: number
  InjectionSubstationId?: number
  FeederId?: number
  ServiceCenterId?: number
}

// Request interfaces for adding area office
export interface CreateAreaOfficeRequest {
  companyId: number
  oldNercCode: string
  newNercCode: string
  oldKaedcoCode: string
  newKaedcoCode: string
  nameOfOldOAreaffice: string
  nameOfNewOAreaffice: string
  latitude: number
  longitude: number
}

export interface UpdateAreaOfficeRequest {
  companyId: number
  oldNercCode: string
  newNercCode: string
  oldKaedcoCode: string
  newKaedcoCode: string
  nameOfOldOAreaffice: string
  nameOfNewOAreaffice: string
  latitude: number
  longitude: number
}

export type CreateAreaOfficeRequestPayload = CreateAreaOfficeRequest[]

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

// AreaOffice State
export interface AreaOfficeState {
  // AreaOffices list state
  areaOffices: AreaOffice[]
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

  // Current areaOffice state (for viewing/editing)
  currentAreaOffice: AreaOfficeDetail | null
  currentAreaOfficeLoading: boolean
  currentAreaOfficeError: string | null

  // Create areaOffice state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update areaOffice state
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean

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

  // Change Requests By Area Office ID state
  changeRequestsByAreaOffice: ChangeRequestListItem[]
  changeRequestsByAreaOfficeLoading: boolean
  changeRequestsByAreaOfficeError: string | null
  changeRequestsByAreaOfficeSuccess: boolean
  changeRequestsByAreaOfficePagination: {
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
}

// Initial state
const initialState: AreaOfficeState = {
  areaOffices: [],
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
  currentAreaOffice: null,
  currentAreaOfficeLoading: false,
  currentAreaOfficeError: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
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
  changeRequestsByAreaOffice: [],
  changeRequestsByAreaOfficeLoading: false,
  changeRequestsByAreaOfficeError: null,
  changeRequestsByAreaOfficeSuccess: false,
  changeRequestsByAreaOfficePagination: {
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
}

// Async thunks
export const fetchAreaOffices = createAsyncThunk(
  "areaOffices/fetchAreaOffices",
  async (params: AreaOfficesRequestParams, { rejectWithValue }) => {
    try {
      const {
        PageNumber,
        PageSize,
        Search,
        CompanyId,
        AreaOfficeId,
        InjectionSubstationId,
        FeederId,
        ServiceCenterId,
      } = params

      const response = await api.get<AreaOfficesResponse>(buildApiUrl(API_ENDPOINTS.AREA_OFFICE.GET), {
        params: {
          PageNumber,
          PageSize,
          ...(Search && { Search }),
          ...(CompanyId && { CompanyId }),
          ...(AreaOfficeId && { AreaOfficeId }),
          ...(InjectionSubstationId && { InjectionSubstationId }),
          ...(FeederId && { FeederId }),
          ...(ServiceCenterId && { ServiceCenterId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch area offices")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch area offices")
      }
      return rejectWithValue(error.message || "Network error during area offices fetch")
    }
  }
)

export const fetchAreaOfficeById = createAsyncThunk<AreaOfficeDetail, number, { rejectValue: string }>(
  "areaOffices/fetchAreaOfficeById",
  async (areaOfficeId: number, { rejectWithValue }) => {
    try {
      // Use the new GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.AREA_OFFICE.GET_BY_ID.replace("{id}", areaOfficeId.toString())

      const response = await api.get<SingleAreaOfficeResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch area office")
      }

      const areaOffice = response.data.data
      if (!areaOffice) {
        return rejectWithValue("Area office not found")
      }

      return areaOffice
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch area office")
      }
      return rejectWithValue(error.message || "Network error during area office fetch")
    }
  }
)

export const createAreaOffice = createAsyncThunk(
  "areaOffices/createAreaOffice",
  async (areaOfficeData: CreateAreaOfficeRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of area office requests
      const response = await api.post<AreaOfficeResponse>(buildApiUrl(API_ENDPOINTS.AREA_OFFICE.ADD), areaOfficeData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create area office")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create area office")
      }
      return rejectWithValue(error.message || "Network error during area office creation")
    }
  }
)

export const createSingleAreaOffice = createAsyncThunk(
  "areaOffices/createSingleAreaOffice",
  async (areaOfficeData: CreateAreaOfficeRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreateAreaOfficeRequestPayload = [areaOfficeData]

      const response = await api.post<AreaOfficeResponse>(buildApiUrl(API_ENDPOINTS.AREA_OFFICE.ADD), payload)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create area office")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create area office")
      }
      return rejectWithValue(error.message || "Network error during area office creation")
    }
  }
)

export const updateAreaOffice = createAsyncThunk(
  "areaOffices/updateAreaOffice",
  async ({ id, areaOfficeData }: { id: number; areaOfficeData: UpdateAreaOfficeRequest }, { rejectWithValue }) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.AREA_OFFICE.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SingleAreaOfficeResponse>(buildApiUrl(endpoint), areaOfficeData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update area office")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update area office")
      }
      return rejectWithValue(error.message || "Network error during area office update")
    }
  }
)

// Change Request Async Thunks
export const submitChangeRequest = createAsyncThunk(
  "areaOffices/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.AREA_OFFICE.CHANGE_REQUEST.replace("{id}", id.toString())
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request response data not found")
      }

      return {
        areaOfficeId: id,
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
  "areaOffices/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const response = await api.get<ChangeRequestsResponse>(
        buildApiUrl(API_ENDPOINTS.AREA_OFFICE.VIEW_CHANGE_REQUEST),
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            ...(status !== undefined && { Status: status }),
            ...(source !== undefined && { Source: source }),
            ...(reference && { Reference: reference }),
            ...(publicId && { PublicId: publicId }),
          },
        }
      )

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

export const fetchChangeRequestsByAreaOfficeId = createAsyncThunk(
  "areaOffices/fetchChangeRequestsByAreaOfficeId",
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

      const endpoint = API_ENDPOINTS.AREA_OFFICE.CHANGE_REQUESTS_BY_ID.replace("{id}", id.toString())
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
        return rejectWithValue(response.data.message || "Failed to fetch change requests for area office")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests for area office")
      }
      return rejectWithValue(error.message || "Network error during area office change requests fetch")
    }
  }
)

export const fetchChangeRequestDetails = createAsyncThunk(
  "areaOffices/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.AREA_OFFICE.CHANGE_REQUEST_DETAILS.replace("{identifier}", identifier)
      const response = await api.get<ChangeRequestDetailsResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch change request details")
      }

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
  "areaOffices/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.AREA_OFFICE.APPROVE_CHANGE_REQUEST.replace("{publicId}", publicId)
      const requestBody: ApproveChangeRequestRequest = {}

      if (notes) {
        requestBody.notes = notes
      }

      const response = await api.post<ApproveChangeRequestResponse>(buildApiUrl(endpoint), requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to approve change request")
      }

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
  "areaOffices/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.AREA_OFFICE.DECLINE_CHANGE_REQUEST.replace("{publicId}", publicId)
      const requestBody: DeclineChangeRequestRequest = {
        reason: reason,
      }

      const response = await api.post<DeclineChangeRequestResponse>(buildApiUrl(endpoint), requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to decline change request")
      }

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

// AreaOffice slice
const areaOfficeSlice = createSlice({
  name: "areaOffices",
  initialState,
  reducers: {
    // Clear areaOffices state
    clearAreaOffices: (state) => {
      state.areaOffices = []
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
      state.currentAreaOfficeError = null
      state.createError = null
      state.updateError = null
      state.changeRequestError = null
      state.changeRequestsError = null
      state.changeRequestsByAreaOfficeError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
    },

    // Clear current areaOffice
    clearCurrentAreaOffice: (state) => {
      state.currentAreaOffice = null
      state.currentAreaOfficeError = null
    },

    // Reset areaOffice state
    resetAreaOfficeState: (state) => {
      state.areaOffices = []
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
      state.currentAreaOffice = null
      state.currentAreaOfficeLoading = false
      state.currentAreaOfficeError = null
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
      state.updateLoading = false
      state.updateError = null
      state.updateSuccess = false
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
      state.changeRequestsByAreaOffice = []
      state.changeRequestsByAreaOfficeLoading = false
      state.changeRequestsByAreaOfficeError = null
      state.changeRequestsByAreaOfficeSuccess = false
      state.changeRequestsByAreaOfficePagination = {
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

    // Set change requests by area office pagination
    setChangeRequestsByAreaOfficePagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsByAreaOfficePagination.currentPage = action.payload.page
      state.changeRequestsByAreaOfficePagination.pageSize = action.payload.pageSize
    },

    // Set current area office (for forms, etc.)
    setCurrentAreaOffice: (state, action: PayloadAction<AreaOfficeDetail | null>) => {
      state.currentAreaOffice = action.payload
    },

    // Clear create state
    clearCreateState: (state) => {
      state.createLoading = false
      state.createError = null
      state.createSuccess = false
    },

    // Clear update state
    clearUpdateState: (state) => {
      state.updateLoading = false
      state.updateError = null
      state.updateSuccess = false
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

    // Clear change requests by area office state
    clearChangeRequestsByAreaOffice: (state) => {
      state.changeRequestsByAreaOffice = []
      state.changeRequestsByAreaOfficeError = null
      state.changeRequestsByAreaOfficeSuccess = false
      state.changeRequestsByAreaOfficePagination = {
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch areaOffices cases
      .addCase(fetchAreaOffices.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchAreaOffices.fulfilled, (state, action: PayloadAction<AreaOfficesResponse>) => {
        state.loading = false
        state.success = true
        state.areaOffices = action.payload.data
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
      .addCase(fetchAreaOffices.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch area offices"
        state.success = false
        state.areaOffices = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch areaOffice by ID cases
      .addCase(fetchAreaOfficeById.pending, (state) => {
        state.currentAreaOfficeLoading = true
        state.currentAreaOfficeError = null
      })
      .addCase(fetchAreaOfficeById.fulfilled, (state, action: PayloadAction<AreaOfficeDetail>) => {
        state.currentAreaOfficeLoading = false
        state.currentAreaOffice = action.payload
        state.currentAreaOfficeError = null
      })
      .addCase(fetchAreaOfficeById.rejected, (state, action) => {
        state.currentAreaOfficeLoading = false
        state.currentAreaOfficeError = (action.payload as string) || "Failed to fetch area office"
        state.currentAreaOffice = null
      })
      // Create area office cases
      .addCase(createAreaOffice.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createAreaOffice.fulfilled, (state, action: PayloadAction<AreaOfficeResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created area office to the list
        if (action.payload.data && action.payload.data.length > 0) {
          state.areaOffices.unshift(...action.payload.data)
        }
      })
      .addCase(createAreaOffice.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create area office"
        state.createSuccess = false
      })
      // Create single area office cases
      .addCase(createSingleAreaOffice.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createSingleAreaOffice.fulfilled, (state, action: PayloadAction<AreaOfficeResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created area office to the list
        if (action.payload.data && action.payload.data.length > 0) {
          const newAreaOffice = action.payload.data[0]
          if (newAreaOffice) {
            state.areaOffices.unshift(newAreaOffice)
          }
        }
      })
      .addCase(createSingleAreaOffice.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create area office"
        state.createSuccess = false
      })
      // Update area office cases
      .addCase(updateAreaOffice.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateAreaOffice.fulfilled, (state, action: PayloadAction<SingleAreaOfficeResponse>) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.updateError = null

        // Update the area office in the current list
        const updatedAreaOffice = action.payload.data
        const index = state.areaOffices.findIndex((ao) => ao.id === updatedAreaOffice.id)
        if (index !== -1) {
          state.areaOffices[index] = updatedAreaOffice
        }

        // Update current area office if it's the one being edited
        if (state.currentAreaOffice && state.currentAreaOffice.id === updatedAreaOffice.id) {
          state.currentAreaOffice = updatedAreaOffice
        }
      })
      .addCase(updateAreaOffice.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update area office"
        state.updateSuccess = false
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
            areaOfficeId: number
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
      // Fetch change requests by area office ID cases
      .addCase(fetchChangeRequestsByAreaOfficeId.pending, (state) => {
        state.changeRequestsByAreaOfficeLoading = true
        state.changeRequestsByAreaOfficeError = null
        state.changeRequestsByAreaOfficeSuccess = false
      })
      .addCase(fetchChangeRequestsByAreaOfficeId.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsByAreaOfficeLoading = false
        state.changeRequestsByAreaOfficeSuccess = true
        state.changeRequestsByAreaOffice = action.payload.data || []
        state.changeRequestsByAreaOfficePagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.changeRequestsByAreaOfficeError = null
      })
      .addCase(fetchChangeRequestsByAreaOfficeId.rejected, (state, action) => {
        state.changeRequestsByAreaOfficeLoading = false
        state.changeRequestsByAreaOfficeError =
          (action.payload as string) || "Failed to fetch change requests for area office"
        state.changeRequestsByAreaOfficeSuccess = false
        state.changeRequestsByAreaOffice = []
        state.changeRequestsByAreaOfficePagination = {
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

          // Update the change request in the area-office-specific list if it exists
          const areaOfficeIndex = state.changeRequestsByAreaOffice.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (areaOfficeIndex !== -1) {
            const req = state.changeRequestsByAreaOffice[areaOfficeIndex]
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

          // Update the change request in the area-office-specific list if it exists
          const areaOfficeIndex = state.changeRequestsByAreaOffice.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (areaOfficeIndex !== -1) {
            const req = state.changeRequestsByAreaOffice[areaOfficeIndex]
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
  clearAreaOffices,
  clearError,
  clearCurrentAreaOffice,
  resetAreaOfficeState,
  setPagination,
  setChangeRequestsPagination,
  setChangeRequestsByAreaOfficePagination,
  setCurrentAreaOffice,
  clearCreateState,
  clearUpdateState,
  clearChangeRequestStatus,
  clearChangeRequests,
  clearChangeRequestsByAreaOffice,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
} = areaOfficeSlice.actions

export default areaOfficeSlice.reducer
