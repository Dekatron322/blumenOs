// src/lib/redux/distributionSubstationsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for DistributionSubstation
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

export interface InjectionSubstation {
  id: number
  nercCode: string
  injectionSubstationCode: string
  areaOffice: AreaOffice
}

export interface HtPole {
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
  htPole: HtPole
}

export interface DistributionSubstation {
  id: number
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  status: string
  feeder: Feeder
  numberOfUnit: number
  unitOneCode: string
  unitTwoCode: string
  unitThreeCode: string
  unitFourCode: string
  publicOrDedicated: string
  remarks: string
  oldDssCode?: string
}

export interface DistributionSubstationsResponse {
  isSuccess: boolean
  message: string
  data: DistributionSubstation[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface DistributionSubstationResponse {
  isSuccess: boolean
  message: string
  data: DistributionSubstation[]
}

export interface SingleDistributionSubstationResponse {
  isSuccess: boolean
  message: string
  data: DistributionSubstation
}

export interface DistributionSubstationsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Request interfaces for adding/updating distribution substation
export interface CreateDistributionSubstationRequest {
  feederId: number
  oldDssCode: string
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  numberOfUnit: number
  unitOneCode: string
  unitTwoCode: string
  unitThreeCode: string
  unitFourCode: string
  publicOrDedicated: string
  status: string
  remarks: string
}

export interface UpdateDistributionSubstationRequest {
  feederId: number
  oldDssCode: string
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  numberOfUnit: number
  unitOneCode: string
  unitTwoCode: string
  unitThreeCode: string
  unitFourCode: string
  publicOrDedicated: string
  status: string
  remarks: string
}

export type CreateDistributionSubstationRequestPayload = CreateDistributionSubstationRequest[]

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

// DistributionSubstation State
interface DistributionSubstationState {
  // DistributionSubstations list state
  distributionSubstations: DistributionSubstation[]
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

  // Current distributionSubstation state (for viewing/editing)
  currentDistributionSubstation: DistributionSubstation | null
  currentDistributionSubstationLoading: boolean
  currentDistributionSubstationError: string | null

  // Create distribution substation state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update distribution substation state
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

  // Change Requests By Distribution Substation ID state
  changeRequestsByDistributionSubstation: ChangeRequestListItem[]
  changeRequestsByDistributionSubstationLoading: boolean
  changeRequestsByDistributionSubstationError: string | null
  changeRequestsByDistributionSubstationSuccess: boolean
  changeRequestsByDistributionSubstationPagination: {
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
const initialState: DistributionSubstationState = {
  distributionSubstations: [],
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
  currentDistributionSubstation: null,
  currentDistributionSubstationLoading: false,
  currentDistributionSubstationError: null,
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
  changeRequestsByDistributionSubstation: [],
  changeRequestsByDistributionSubstationLoading: false,
  changeRequestsByDistributionSubstationError: null,
  changeRequestsByDistributionSubstationSuccess: false,
  changeRequestsByDistributionSubstationPagination: {
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
export const fetchDistributionSubstations = createAsyncThunk(
  "distributionSubstations/fetchDistributionSubstations",
  async (params: DistributionSubstationsRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<DistributionSubstationsResponse>(
        buildApiUrl(API_ENDPOINTS.DISTRIBUTION_STATION.GET),
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
        return rejectWithValue(response.data.message || "Failed to fetch distribution substations")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch distribution substations")
      }
      return rejectWithValue(error.message || "Network error during distribution substations fetch")
    }
  }
)

export const fetchDistributionSubstationById = createAsyncThunk<
  DistributionSubstation,
  number,
  { rejectValue: string }
>(
  "distributionSubstations/fetchDistributionSubstationById",
  async (distributionSubstationId: number, { rejectWithValue }) => {
    try {
      // Use the new GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.DISTRIBUTION_STATION.GET_BY_ID.replace("{id}", distributionSubstationId.toString())

      const response = await api.get<SingleDistributionSubstationResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch distribution substation")
      }

      const distributionSubstation = response.data.data
      if (!distributionSubstation) {
        return rejectWithValue("Distribution substation not found")
      }

      return distributionSubstation
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch distribution substation")
      }
      return rejectWithValue(error.message || "Network error during distribution substation fetch")
    }
  }
)

export const createDistributionSubstation = createAsyncThunk(
  "distributionSubstations/createDistributionSubstation",
  async (substationData: CreateDistributionSubstationRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of distribution substation requests
      const response = await api.post<DistributionSubstationResponse>(
        buildApiUrl(API_ENDPOINTS.DISTRIBUTION_STATION.ADD),
        substationData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create distribution substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create distribution substation")
      }
      return rejectWithValue(error.message || "Network error during distribution substation creation")
    }
  }
)

export const createSingleDistributionSubstation = createAsyncThunk(
  "distributionSubstations/createSingleDistributionSubstation",
  async (substationData: CreateDistributionSubstationRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreateDistributionSubstationRequestPayload = [substationData]

      const response = await api.post<DistributionSubstationResponse>(
        buildApiUrl(API_ENDPOINTS.DISTRIBUTION_STATION.ADD),
        payload
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create distribution substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create distribution substation")
      }
      return rejectWithValue(error.message || "Network error during distribution substation creation")
    }
  }
)

export const updateDistributionSubstation = createAsyncThunk(
  "distributionSubstations/updateDistributionSubstation",
  async (
    { id, substationData }: { id: number; substationData: UpdateDistributionSubstationRequest },
    { rejectWithValue }
  ) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.DISTRIBUTION_STATION.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SingleDistributionSubstationResponse>(buildApiUrl(endpoint), substationData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update distribution substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update distribution substation")
      }
      return rejectWithValue(error.message || "Network error during distribution substation update")
    }
  }
)

// Change Request Async Thunks
export const submitChangeRequest = createAsyncThunk(
  "distributionSubstations/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.DISTRIBUTION_STATION.CHANGE_REQUEST.replace("{id}", id.toString())
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request response data not found")
      }

      return {
        distributionSubstationId: id,
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
  "distributionSubstations/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const response = await api.get<ChangeRequestsResponse>(
        buildApiUrl(API_ENDPOINTS.DISTRIBUTION_STATION.VIEW_CHANGE_REQUEST),
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

export const fetchChangeRequestsByDistributionSubstationId = createAsyncThunk(
  "distributionSubstations/fetchChangeRequestsByDistributionSubstationId",
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

      const endpoint = API_ENDPOINTS.DISTRIBUTION_STATION.CHANGE_REQUESTS_BY_ID.replace("{id}", id.toString())
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
        return rejectWithValue(response.data.message || "Failed to fetch change requests for distribution substation")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch change requests for distribution substation"
        )
      }
      return rejectWithValue(error.message || "Network error during distribution substation change requests fetch")
    }
  }
)

export const fetchChangeRequestDetails = createAsyncThunk(
  "distributionSubstations/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.DISTRIBUTION_STATION.CHANGE_REQUEST_DETAILS.replace("{identifier}", identifier)
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
  "distributionSubstations/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.DISTRIBUTION_STATION.APPROVE_CHANGE_REQUEST.replace("{publicId}", publicId)
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
  "distributionSubstations/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.DISTRIBUTION_STATION.DECLINE_CHANGE_REQUEST.replace("{publicId}", publicId)
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

// DistributionSubstation slice
const distributionSubstationSlice = createSlice({
  name: "distributionSubstations",
  initialState,
  reducers: {
    // Clear distributionSubstations state
    clearDistributionSubstations: (state) => {
      state.distributionSubstations = []
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
      state.currentDistributionSubstationError = null
      state.createError = null
      state.updateError = null
      state.changeRequestError = null
      state.changeRequestsError = null
      state.changeRequestsByDistributionSubstationError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
    },

    // Clear current distributionSubstation
    clearCurrentDistributionSubstation: (state) => {
      state.currentDistributionSubstation = null
      state.currentDistributionSubstationError = null
    },

    // Reset distributionSubstation state
    resetDistributionSubstationState: (state) => {
      state.distributionSubstations = []
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
      state.currentDistributionSubstation = null
      state.currentDistributionSubstationLoading = false
      state.currentDistributionSubstationError = null
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
      state.changeRequestsByDistributionSubstation = []
      state.changeRequestsByDistributionSubstationLoading = false
      state.changeRequestsByDistributionSubstationError = null
      state.changeRequestsByDistributionSubstationSuccess = false
      state.changeRequestsByDistributionSubstationPagination = {
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

    // Set change requests by distribution substation pagination
    setChangeRequestsByDistributionSubstationPagination: (
      state,
      action: PayloadAction<{ page: number; pageSize: number }>
    ) => {
      state.changeRequestsByDistributionSubstationPagination.currentPage = action.payload.page
      state.changeRequestsByDistributionSubstationPagination.pageSize = action.payload.pageSize
    },

    // Set current distribution substation (for forms, etc.)
    setCurrentDistributionSubstation: (state, action: PayloadAction<DistributionSubstation | null>) => {
      state.currentDistributionSubstation = action.payload
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

    // Clear change requests by distribution substation state
    clearChangeRequestsByDistributionSubstation: (state) => {
      state.changeRequestsByDistributionSubstation = []
      state.changeRequestsByDistributionSubstationError = null
      state.changeRequestsByDistributionSubstationSuccess = false
      state.changeRequestsByDistributionSubstationPagination = {
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
      // Fetch distributionSubstations cases
      .addCase(fetchDistributionSubstations.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(
        fetchDistributionSubstations.fulfilled,
        (state, action: PayloadAction<DistributionSubstationsResponse>) => {
          state.loading = false
          state.success = true
          state.distributionSubstations = action.payload.data
          state.pagination = {
            totalCount: action.payload.totalCount,
            totalPages: action.payload.totalPages,
            currentPage: action.payload.currentPage,
            pageSize: action.payload.pageSize,
            hasNext: action.payload.hasNext,
            hasPrevious: action.payload.hasPrevious,
          }
          state.error = null
        }
      )
      .addCase(fetchDistributionSubstations.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch distribution substations"
        state.success = false
        state.distributionSubstations = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch distributionSubstation by ID cases
      .addCase(fetchDistributionSubstationById.pending, (state) => {
        state.currentDistributionSubstationLoading = true
        state.currentDistributionSubstationError = null
      })
      .addCase(fetchDistributionSubstationById.fulfilled, (state, action: PayloadAction<DistributionSubstation>) => {
        state.currentDistributionSubstationLoading = false
        state.currentDistributionSubstation = action.payload
        state.currentDistributionSubstationError = null
      })
      .addCase(fetchDistributionSubstationById.rejected, (state, action) => {
        state.currentDistributionSubstationLoading = false
        state.currentDistributionSubstationError =
          (action.payload as string) || "Failed to fetch distribution substation"
        state.currentDistributionSubstation = null
      })
      // Create distribution substation cases
      .addCase(createDistributionSubstation.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(
        createDistributionSubstation.fulfilled,
        (state, action: PayloadAction<DistributionSubstationResponse>) => {
          state.createLoading = false
          state.createSuccess = true
          state.createError = null

          // Optionally add the newly created distribution substation to the list
          if (action.payload.data && action.payload.data.length > 0) {
            state.distributionSubstations.unshift(...action.payload.data)
          }
        }
      )
      .addCase(createDistributionSubstation.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create distribution substation"
        state.createSuccess = false
      })
      // Create single distribution substation cases
      .addCase(createSingleDistributionSubstation.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(
        createSingleDistributionSubstation.fulfilled,
        (state, action: PayloadAction<DistributionSubstationResponse>) => {
          state.createLoading = false
          state.createSuccess = true
          state.createError = null

          // Optionally add the newly created distribution substation to the list
          if (action.payload.data && action.payload.data.length > 0) {
            const newSubstation = action.payload.data[0]
            if (newSubstation) {
              state.distributionSubstations.unshift(newSubstation)
            }
          }
        }
      )
      .addCase(createSingleDistributionSubstation.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create distribution substation"
        state.createSuccess = false
      })
      // Update distribution substation cases
      .addCase(updateDistributionSubstation.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(
        updateDistributionSubstation.fulfilled,
        (state, action: PayloadAction<SingleDistributionSubstationResponse>) => {
          state.updateLoading = false
          state.updateSuccess = true
          state.updateError = null

          // Update the distribution substation in the current list
          const updatedSubstation = action.payload.data
          const index = state.distributionSubstations.findIndex((s) => s.id === updatedSubstation.id)
          if (index !== -1) {
            state.distributionSubstations[index] = updatedSubstation
          }

          // Update current distribution substation if it's the one being edited
          if (state.currentDistributionSubstation && state.currentDistributionSubstation.id === updatedSubstation.id) {
            state.currentDistributionSubstation = updatedSubstation
          }
        }
      )
      .addCase(updateDistributionSubstation.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update distribution substation"
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
            distributionSubstationId: number
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
      // Fetch change requests by distribution substation ID cases
      .addCase(fetchChangeRequestsByDistributionSubstationId.pending, (state) => {
        state.changeRequestsByDistributionSubstationLoading = true
        state.changeRequestsByDistributionSubstationError = null
        state.changeRequestsByDistributionSubstationSuccess = false
      })
      .addCase(
        fetchChangeRequestsByDistributionSubstationId.fulfilled,
        (state, action: PayloadAction<ChangeRequestsResponse>) => {
          state.changeRequestsByDistributionSubstationLoading = false
          state.changeRequestsByDistributionSubstationSuccess = true
          state.changeRequestsByDistributionSubstation = action.payload.data || []
          state.changeRequestsByDistributionSubstationPagination = {
            totalCount: action.payload.totalCount || 0,
            totalPages: action.payload.totalPages || 0,
            currentPage: action.payload.currentPage || 1,
            pageSize: action.payload.pageSize || 10,
            hasNext: action.payload.hasNext || false,
            hasPrevious: action.payload.hasPrevious || false,
          }
          state.changeRequestsByDistributionSubstationError = null
        }
      )
      .addCase(fetchChangeRequestsByDistributionSubstationId.rejected, (state, action) => {
        state.changeRequestsByDistributionSubstationLoading = false
        state.changeRequestsByDistributionSubstationError =
          (action.payload as string) || "Failed to fetch change requests for distribution substation"
        state.changeRequestsByDistributionSubstationSuccess = false
        state.changeRequestsByDistributionSubstation = []
        state.changeRequestsByDistributionSubstationPagination = {
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

          // Update the change request in the distribution substation-specific list if it exists
          const distributionSubstationIndex = state.changeRequestsByDistributionSubstation.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (distributionSubstationIndex !== -1) {
            const req = state.changeRequestsByDistributionSubstation[distributionSubstationIndex]
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

          // Update the change request in the distribution substation-specific list if it exists
          const distributionSubstationIndex = state.changeRequestsByDistributionSubstation.findIndex(
            (cr) => cr.publicId === action.payload.publicId
          )
          if (distributionSubstationIndex !== -1) {
            const req = state.changeRequestsByDistributionSubstation[distributionSubstationIndex]
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
  clearDistributionSubstations,
  clearError,
  clearCurrentDistributionSubstation,
  resetDistributionSubstationState,
  setPagination,
  setChangeRequestsPagination,
  setChangeRequestsByDistributionSubstationPagination,
  setCurrentDistributionSubstation,
  clearCreateState,
  clearUpdateState,
  clearChangeRequestStatus,
  clearChangeRequests,
  clearChangeRequestsByDistributionSubstation,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
} = distributionSubstationSlice.actions

export default distributionSubstationSlice.reducer
