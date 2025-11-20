// src/lib/redux/injectionSubstationSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for InjectionSubstation
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
  latitude: number
  longitude: number
  company: Company
}

export interface HTPole {
  id: number
  htPoleNumber: string
}

export interface Feeder {
  id: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
  injectionSubstation: InjectionSubstation
  htPole: HTPole
}

export interface InjectionSubstation {
  id: number
  nercCode: string
  injectionSubstationCode: string
  areaOffice: AreaOffice
  feeders?: Feeder[]
}

export interface InjectionSubstationsResponse {
  isSuccess: boolean
  message: string
  data: InjectionSubstation[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface InjectionSubstationResponse {
  isSuccess: boolean
  message: string
  data: InjectionSubstation[]
}

export interface SingleInjectionSubstationResponse {
  isSuccess: boolean
  message: string
  data: InjectionSubstation
}

export interface InjectionSubstationsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Request interfaces for adding injection substation
export interface CreateInjectionSubstationRequest {
  areaOfficeId: number
  nercCode: string
  injectionSubstationCode: string
}

export interface UpdateInjectionSubstationRequest {
  areaOfficeId: number
  nercCode: string
  injectionSubstationCode: string
}

export type CreateInjectionSubstationRequestPayload = CreateInjectionSubstationRequest[]

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

// InjectionSubstation State
interface InjectionSubstationState {
  // InjectionSubstations list state
  injectionSubstations: InjectionSubstation[]
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

  // Current injectionSubstation state (for viewing/editing)
  currentInjectionSubstation: InjectionSubstation | null
  currentInjectionSubstationLoading: boolean
  currentInjectionSubstationError: string | null

  // Create injectionSubstation state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update injectionSubstation state
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

  // Change Requests By Injection Substation ID state
  changeRequestsByInjectionSubstation: ChangeRequestListItem[]
  changeRequestsByInjectionSubstationLoading: boolean
  changeRequestsByInjectionSubstationError: string | null
  changeRequestsByInjectionSubstationSuccess: boolean
  changeRequestsByInjectionSubstationPagination: {
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
const initialState: InjectionSubstationState = {
  injectionSubstations: [],
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
  currentInjectionSubstation: null,
  currentInjectionSubstationLoading: false,
  currentInjectionSubstationError: null,
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
  changeRequestsByInjectionSubstation: [],
  changeRequestsByInjectionSubstationLoading: false,
  changeRequestsByInjectionSubstationError: null,
  changeRequestsByInjectionSubstationSuccess: false,
  changeRequestsByInjectionSubstationPagination: {
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
export const fetchInjectionSubstations = createAsyncThunk(
  "injectionSubstations/fetchInjectionSubstations",
  async (params: InjectionSubstationsRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        search,
        companyId,
        areaOfficeId,
        injectionSubstationId,
        feederId,
        serviceCenterId,
      } = params

      const response = await api.get<InjectionSubstationsResponse>(
        buildApiUrl(API_ENDPOINTS.INJECTION_SUBSTATION.GET),
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            ...(search && { Search: search }),
            ...(companyId && { CompanyId: companyId }),
            ...(areaOfficeId && { AreaOfficeId: areaOfficeId }),
            ...(injectionSubstationId && { InjectionSubstationId: injectionSubstationId }),
            ...(feederId && { FeederId: feederId }),
            ...(serviceCenterId && { ServiceCenterId: serviceCenterId }),
          },
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch injection substations")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch injection substations")
      }
      return rejectWithValue(error.message || "Network error during injection substations fetch")
    }
  }
)

export const fetchInjectionSubstationById = createAsyncThunk<InjectionSubstation, number, { rejectValue: string }>(
  "injectionSubstations/fetchInjectionSubstationById",
  async (injectionSubstationId: number, { rejectWithValue }) => {
    try {
      // Use the new GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.INJECTION_SUBSTATION.GET_BY_ID.replace("{id}", injectionSubstationId.toString())

      const response = await api.get<SingleInjectionSubstationResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch injection substation")
      }

      const injectionSubstation = response.data.data
      if (!injectionSubstation) {
        return rejectWithValue("Injection substation not found")
      }

      return injectionSubstation
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch injection substation")
      }
      return rejectWithValue(error.message || "Network error during injection substation fetch")
    }
  }
)

export const createInjectionSubstation = createAsyncThunk(
  "injectionSubstations/createInjectionSubstation",
  async (injectionSubstationData: CreateInjectionSubstationRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of injection substation requests
      const response = await api.post<InjectionSubstationResponse>(
        buildApiUrl(API_ENDPOINTS.INJECTION_SUBSTATION.ADD),
        injectionSubstationData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create injection substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create injection substation")
      }
      return rejectWithValue(error.message || "Network error during injection substation creation")
    }
  }
)

export const createSingleInjectionSubstation = createAsyncThunk(
  "injectionSubstations/createSingleInjectionSubstation",
  async (injectionSubstationData: CreateInjectionSubstationRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreateInjectionSubstationRequestPayload = [injectionSubstationData]

      const response = await api.post<InjectionSubstationResponse>(
        buildApiUrl(API_ENDPOINTS.INJECTION_SUBSTATION.ADD),
        payload
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create injection substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create injection substation")
      }
      return rejectWithValue(error.message || "Network error during injection substation creation")
    }
  }
)

export const updateInjectionSubstation = createAsyncThunk(
  "injectionSubstations/updateInjectionSubstation",
  async (
    { id, injectionSubstationData }: { id: number; injectionSubstationData: UpdateInjectionSubstationRequest },
    { rejectWithValue }
  ) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.INJECTION_SUBSTATION.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SingleInjectionSubstationResponse>(buildApiUrl(endpoint), injectionSubstationData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update injection substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update injection substation")
      }
      return rejectWithValue(error.message || "Network error during injection substation update")
    }
  }
)

// Change Request Async Thunks
export const submitChangeRequest = createAsyncThunk(
  "injectionSubstations/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.INJECTION_SUBSTATION.CHANGE_REQUEST.replace("{id}", id.toString())
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request response data not found")
      }

      return {
        injectionSubstationId: id,
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
  "injectionSubstations/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const response = await api.get<ChangeRequestsResponse>(
        buildApiUrl(API_ENDPOINTS.INJECTION_SUBSTATION.VIEW_CHANGE_REQUEST),
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

export const fetchChangeRequestsByInjectionSubstationId = createAsyncThunk(
  "injectionSubstations/fetchChangeRequestsByInjectionSubstationId",
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

      const endpoint = API_ENDPOINTS.INJECTION_SUBSTATION.CHANGE_REQUESTS_BY_ID.replace("{id}", id.toString())
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
        return rejectWithValue(response.data.message || "Failed to fetch change requests for injection substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch change requests for injection substation"
        )
      }
      return rejectWithValue(error.message || "Network error during injection substation change requests fetch")
    }
  }
)

export const fetchChangeRequestDetails = createAsyncThunk(
  "injectionSubstations/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.INJECTION_SUBSTATION.CHANGE_REQUEST_DETAILS.replace("{identifier}", identifier)
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
  "injectionSubstations/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.INJECTION_SUBSTATION.APPROVE_CHANGE_REQUEST.replace("{publicId}", publicId)
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
  "injectionSubstations/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.INJECTION_SUBSTATION.DECLINE_CHANGE_REQUEST.replace("{publicId}", publicId)
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

// InjectionSubstation slice
const injectionSubstationSlice = createSlice({
  name: "injectionSubstations",
  initialState,
  reducers: {
    // Clear injectionSubstations state
    clearInjectionSubstations: (state) => {
      state.injectionSubstations = []
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
      state.currentInjectionSubstationError = null
      state.createError = null
      state.updateError = null
      state.changeRequestError = null
      state.changeRequestsError = null
      state.changeRequestsByInjectionSubstationError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
    },

    // Clear current injectionSubstation
    clearCurrentInjectionSubstation: (state) => {
      state.currentInjectionSubstation = null
      state.currentInjectionSubstationError = null
    },

    // Reset injectionSubstation state
    resetInjectionSubstationState: (state) => {
      state.injectionSubstations = []
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
      state.currentInjectionSubstation = null
      state.currentInjectionSubstationLoading = false
      state.currentInjectionSubstationError = null
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
      state.changeRequestsByInjectionSubstation = []
      state.changeRequestsByInjectionSubstationLoading = false
      state.changeRequestsByInjectionSubstationError = null
      state.changeRequestsByInjectionSubstationSuccess = false
      state.changeRequestsByInjectionSubstationPagination = {
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

    // Set change requests by injection substation pagination
    setChangeRequestsByInjectionSubstationPagination: (
      state,
      action: PayloadAction<{ page: number; pageSize: number }>
    ) => {
      state.changeRequestsByInjectionSubstationPagination.currentPage = action.payload.page
      state.changeRequestsByInjectionSubstationPagination.pageSize = action.payload.pageSize
    },

    // Set current injection substation (for forms, etc.)
    setCurrentInjectionSubstation: (state, action: PayloadAction<InjectionSubstation | null>) => {
      state.currentInjectionSubstation = action.payload
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

    // Clear change requests by injection substation state
    clearChangeRequestsByInjectionSubstation: (state) => {
      state.changeRequestsByInjectionSubstation = []
      state.changeRequestsByInjectionSubstationError = null
      state.changeRequestsByInjectionSubstationSuccess = false
      state.changeRequestsByInjectionSubstationPagination = {
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
      // Fetch injectionSubstations cases
      .addCase(fetchInjectionSubstations.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchInjectionSubstations.fulfilled, (state, action: PayloadAction<InjectionSubstationsResponse>) => {
        state.loading = false
        state.success = true
        state.injectionSubstations = action.payload.data
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
      .addCase(fetchInjectionSubstations.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch injection substations"
        state.success = false
        state.injectionSubstations = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch injectionSubstation by ID cases
      .addCase(fetchInjectionSubstationById.pending, (state) => {
        state.currentInjectionSubstationLoading = true
        state.currentInjectionSubstationError = null
      })
      .addCase(fetchInjectionSubstationById.fulfilled, (state, action: PayloadAction<InjectionSubstation>) => {
        state.currentInjectionSubstationLoading = false
        state.currentInjectionSubstation = action.payload
        state.currentInjectionSubstationError = null
      })
      .addCase(fetchInjectionSubstationById.rejected, (state, action) => {
        state.currentInjectionSubstationLoading = false
        state.currentInjectionSubstationError = (action.payload as string) || "Failed to fetch injection substation"
        state.currentInjectionSubstation = null
      })
      // Create injection substation cases
      .addCase(createInjectionSubstation.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createInjectionSubstation.fulfilled, (state, action: PayloadAction<InjectionSubstationResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created injection substation to the list
        if (action.payload.data && action.payload.data.length > 0) {
          state.injectionSubstations.unshift(...action.payload.data)
        }
      })
      .addCase(createInjectionSubstation.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create injection substation"
        state.createSuccess = false
      })
      // Create single injection substation cases
      .addCase(createSingleInjectionSubstation.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(
        createSingleInjectionSubstation.fulfilled,
        (state, action: PayloadAction<InjectionSubstationResponse>) => {
          state.createLoading = false
          state.createSuccess = true
          state.createError = null

          // Optionally add the newly created injection substation to the list
          if (action.payload.data && action.payload.data.length > 0) {
            const newInjectionSubstation = action.payload.data[0]
            if (newInjectionSubstation) {
              state.injectionSubstations.unshift(newInjectionSubstation)
            }
          }
        }
      )
      .addCase(createSingleInjectionSubstation.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create injection substation"
        state.createSuccess = false
      })
      // Update injection substation cases
      .addCase(updateInjectionSubstation.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(
        updateInjectionSubstation.fulfilled,
        (state, action: PayloadAction<SingleInjectionSubstationResponse>) => {
          state.updateLoading = false
          state.updateSuccess = true
          state.updateError = null

          // Update the injection substation in the current list
          const updatedInjectionSubstation = action.payload.data
          const index = state.injectionSubstations.findIndex((is) => is.id === updatedInjectionSubstation.id)
          if (index !== -1) {
            state.injectionSubstations[index] = updatedInjectionSubstation
          }

          // Update current injection substation if it's the one being edited
          if (
            state.currentInjectionSubstation &&
            state.currentInjectionSubstation.id === updatedInjectionSubstation.id
          ) {
            state.currentInjectionSubstation = updatedInjectionSubstation
          }
        }
      )
      .addCase(updateInjectionSubstation.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update injection substation"
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
            injectionSubstationId: number
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
      // Fetch change requests by injection substation ID cases
      .addCase(fetchChangeRequestsByInjectionSubstationId.pending, (state) => {
        state.changeRequestsByInjectionSubstationLoading = true
        state.changeRequestsByInjectionSubstationError = null
        state.changeRequestsByInjectionSubstationSuccess = false
      })
      .addCase(
        fetchChangeRequestsByInjectionSubstationId.fulfilled,
        (state, action: PayloadAction<ChangeRequestsResponse>) => {
          state.changeRequestsByInjectionSubstationLoading = false
          state.changeRequestsByInjectionSubstationSuccess = true
          state.changeRequestsByInjectionSubstation = action.payload.data || []
          state.changeRequestsByInjectionSubstationPagination = {
            totalCount: action.payload.totalCount || 0,
            totalPages: action.payload.totalPages || 0,
            currentPage: action.payload.currentPage || 1,
            pageSize: action.payload.pageSize || 10,
            hasNext: action.payload.hasNext || false,
            hasPrevious: action.payload.hasPrevious || false,
          }
          state.changeRequestsByInjectionSubstationError = null
        }
      )
      .addCase(fetchChangeRequestsByInjectionSubstationId.rejected, (state, action) => {
        state.changeRequestsByInjectionSubstationLoading = false
        state.changeRequestsByInjectionSubstationError =
          (action.payload as string) || "Failed to fetch change requests for injection substation"
        state.changeRequestsByInjectionSubstationSuccess = false
        state.changeRequestsByInjectionSubstation = []
        state.changeRequestsByInjectionSubstationPagination = {
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

          // Update the change request in the injection-substation-specific list if it exists
          const injectionSubstationIndex = state.changeRequestsByInjectionSubstation.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (injectionSubstationIndex !== -1) {
            const req = state.changeRequestsByInjectionSubstation[injectionSubstationIndex]
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

          // Update the change request in the injection-substation-specific list if it exists
          const injectionSubstationIndex = state.changeRequestsByInjectionSubstation.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (injectionSubstationIndex !== -1) {
            const req = state.changeRequestsByInjectionSubstation[injectionSubstationIndex]
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
  clearInjectionSubstations,
  clearError,
  clearCurrentInjectionSubstation,
  resetInjectionSubstationState,
  setPagination,
  setChangeRequestsPagination,
  setChangeRequestsByInjectionSubstationPagination,
  setCurrentInjectionSubstation,
  clearCreateState,
  clearUpdateState,
  clearChangeRequestStatus,
  clearChangeRequests,
  clearChangeRequestsByInjectionSubstation,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
} = injectionSubstationSlice.actions

export default injectionSubstationSlice.reducer
