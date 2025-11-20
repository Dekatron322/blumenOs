// src/lib/redux/feedersSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Feeder
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

export interface DistributionSubstation {
  id: number
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  status: string
  feeder: Feeder
}

export interface Feeder {
  id: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
  injectionSubstation: InjectionSubstation
  htPole: HtPole
  distributionSubstations?: DistributionSubstation[]
}

export interface FeedersResponse {
  isSuccess: boolean
  message: string
  data: Feeder[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface FeederResponse {
  isSuccess: boolean
  message: string
  data: Feeder[]
}

export interface SingleFeederResponse {
  isSuccess: boolean
  message: string
  data: Feeder
}

export interface FeedersRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Request interfaces for adding feeder
export interface CreateFeederRequest {
  injectionSubstationId: number
  htPoleId: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
}

export interface UpdateFeederRequest {
  injectionSubstationId: number
  htPoleId: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
}

export type CreateFeederRequestPayload = CreateFeederRequest[]

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

// Feeder State
interface FeederState {
  // Feeders list state
  feeders: Feeder[]
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

  // Current feeder state (for viewing/editing)
  currentFeeder: Feeder | null
  currentFeederLoading: boolean
  currentFeederError: string | null

  // Create feeder state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update feeder state
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

  // Change Requests By Feeder ID state
  changeRequestsByFeeder: ChangeRequestListItem[]
  changeRequestsByFeederLoading: boolean
  changeRequestsByFeederError: string | null
  changeRequestsByFeederSuccess: boolean
  changeRequestsByFeederPagination: {
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
const initialState: FeederState = {
  feeders: [],
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
  currentFeeder: null,
  currentFeederLoading: false,
  currentFeederError: null,
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
  changeRequestsByFeeder: [],
  changeRequestsByFeederLoading: false,
  changeRequestsByFeederError: null,
  changeRequestsByFeederSuccess: false,
  changeRequestsByFeederPagination: {
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
export const fetchFeeders = createAsyncThunk(
  "feeders/fetchFeeders",
  async (params: FeedersRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<FeedersResponse>(buildApiUrl(API_ENDPOINTS.FEEDERS.GET), {
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
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch feeders")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch feeders")
      }
      return rejectWithValue(error.message || "Network error during feeders fetch")
    }
  }
)

export const fetchFeederById = createAsyncThunk<Feeder, number, { rejectValue: string }>(
  "feeders/fetchFeederById",
  async (feederId: number, { rejectWithValue }) => {
    try {
      // Use the new GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.FEEDERS.GET_BY_ID.replace("{id}", feederId.toString())

      const response = await api.get<SingleFeederResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch feeder")
      }

      const feeder = response.data.data
      if (!feeder) {
        return rejectWithValue("Feeder not found")
      }

      return feeder
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch feeder")
      }
      return rejectWithValue(error.message || "Network error during feeder fetch")
    }
  }
)

export const createFeeder = createAsyncThunk(
  "feeders/createFeeder",
  async (feederData: CreateFeederRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of feeder requests
      const response = await api.post<FeederResponse>(buildApiUrl(API_ENDPOINTS.FEEDERS.ADD), feederData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create feeder")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create feeder")
      }
      return rejectWithValue(error.message || "Network error during feeder creation")
    }
  }
)

export const createSingleFeeder = createAsyncThunk(
  "feeders/createSingleFeeder",
  async (feederData: CreateFeederRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreateFeederRequestPayload = [feederData]

      const response = await api.post<FeederResponse>(buildApiUrl(API_ENDPOINTS.FEEDERS.ADD), payload)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create feeder")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create feeder")
      }
      return rejectWithValue(error.message || "Network error during feeder creation")
    }
  }
)

export const updateFeeder = createAsyncThunk(
  "feeders/updateFeeder",
  async ({ id, feederData }: { id: number; feederData: UpdateFeederRequest }, { rejectWithValue }) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.FEEDERS.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SingleFeederResponse>(buildApiUrl(endpoint), feederData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update feeder")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update feeder")
      }
      return rejectWithValue(error.message || "Network error during feeder update")
    }
  }
)

// Change Request Async Thunks
export const submitChangeRequest = createAsyncThunk(
  "feeders/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.FEEDERS.CHANGE_REQUEST.replace("{id}", id.toString())
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request response data not found")
      }

      return {
        feederId: id,
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
  "feeders/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const response = await api.get<ChangeRequestsResponse>(buildApiUrl(API_ENDPOINTS.FEEDERS.VIEW_CHANGE_REQUEST), {
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

export const fetchChangeRequestsByFeederId = createAsyncThunk(
  "feeders/fetchChangeRequestsByFeederId",
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

      const endpoint = API_ENDPOINTS.FEEDERS.CHANGE_REQUESTS_BY_ID.replace("{id}", id.toString())
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
        return rejectWithValue(response.data.message || "Failed to fetch change requests for feeder")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests for feeder")
      }
      return rejectWithValue(error.message || "Network error during feeder change requests fetch")
    }
  }
)

export const fetchChangeRequestDetails = createAsyncThunk(
  "feeders/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.FEEDERS.CHANGE_REQUEST_DETAILS.replace("{identifier}", identifier)
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
  "feeders/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.FEEDERS.APPROVE_CHANGE_REQUEST.replace("{publicId}", publicId)
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
  "feeders/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.FEEDERS.DECLINE_CHANGE_REQUEST.replace("{publicId}", publicId)
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

// Feeder slice
const feedersSlice = createSlice({
  name: "feeders",
  initialState,
  reducers: {
    // Clear feeders state
    clearFeeders: (state) => {
      state.feeders = []
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
      state.currentFeederError = null
      state.createError = null
      state.updateError = null
      state.changeRequestError = null
      state.changeRequestsError = null
      state.changeRequestsByFeederError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
    },

    // Clear current feeder
    clearCurrentFeeder: (state) => {
      state.currentFeeder = null
      state.currentFeederError = null
    },

    // Reset feeder state
    resetFeederState: (state) => {
      state.feeders = []
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
      state.currentFeeder = null
      state.currentFeederLoading = false
      state.currentFeederError = null
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
      state.changeRequestsByFeeder = []
      state.changeRequestsByFeederLoading = false
      state.changeRequestsByFeederError = null
      state.changeRequestsByFeederSuccess = false
      state.changeRequestsByFeederPagination = {
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

    // Set change requests by feeder pagination
    setChangeRequestsByFeederPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsByFeederPagination.currentPage = action.payload.page
      state.changeRequestsByFeederPagination.pageSize = action.payload.pageSize
    },

    // Set current feeder (for forms, etc.)
    setCurrentFeeder: (state, action: PayloadAction<Feeder | null>) => {
      state.currentFeeder = action.payload
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

    // Clear change requests by feeder state
    clearChangeRequestsByFeeder: (state) => {
      state.changeRequestsByFeeder = []
      state.changeRequestsByFeederError = null
      state.changeRequestsByFeederSuccess = false
      state.changeRequestsByFeederPagination = {
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
      // Fetch feeders cases
      .addCase(fetchFeeders.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchFeeders.fulfilled, (state, action: PayloadAction<FeedersResponse>) => {
        state.loading = false
        state.success = true
        state.feeders = action.payload.data
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
      .addCase(fetchFeeders.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch feeders"
        state.success = false
        state.feeders = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch feeder by ID cases
      .addCase(fetchFeederById.pending, (state) => {
        state.currentFeederLoading = true
        state.currentFeederError = null
      })
      .addCase(fetchFeederById.fulfilled, (state, action: PayloadAction<Feeder>) => {
        state.currentFeederLoading = false
        state.currentFeeder = action.payload
        state.currentFeederError = null
      })
      .addCase(fetchFeederById.rejected, (state, action) => {
        state.currentFeederLoading = false
        state.currentFeederError = (action.payload as string) || "Failed to fetch feeder"
        state.currentFeeder = null
      })
      // Create feeder cases
      .addCase(createFeeder.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createFeeder.fulfilled, (state, action: PayloadAction<FeederResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created feeder to the list
        if (action.payload.data && action.payload.data.length > 0) {
          state.feeders.unshift(...action.payload.data)
        }
      })
      .addCase(createFeeder.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create feeder"
        state.createSuccess = false
      })
      // Create single feeder cases
      .addCase(createSingleFeeder.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createSingleFeeder.fulfilled, (state, action: PayloadAction<FeederResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created feeder to the list
        if (action.payload.data && action.payload.data.length > 0) {
          const newFeeder = action.payload.data[0]
          if (newFeeder) {
            state.feeders.unshift(newFeeder)
          }
        }
      })
      .addCase(createSingleFeeder.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create feeder"
        state.createSuccess = false
      })
      // Update feeder cases
      .addCase(updateFeeder.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateFeeder.fulfilled, (state, action: PayloadAction<SingleFeederResponse>) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.updateError = null

        // Update the feeder in the current list
        const updatedFeeder = action.payload.data
        const index = state.feeders.findIndex((f) => f.id === updatedFeeder.id)
        if (index !== -1) {
          state.feeders[index] = updatedFeeder
        }

        // Update current feeder if it's the one being edited
        if (state.currentFeeder && state.currentFeeder.id === updatedFeeder.id) {
          state.currentFeeder = updatedFeeder
        }
      })
      .addCase(updateFeeder.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update feeder"
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
            feederId: number
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
      // Fetch change requests by feeder ID cases
      .addCase(fetchChangeRequestsByFeederId.pending, (state) => {
        state.changeRequestsByFeederLoading = true
        state.changeRequestsByFeederError = null
        state.changeRequestsByFeederSuccess = false
      })
      .addCase(fetchChangeRequestsByFeederId.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsByFeederLoading = false
        state.changeRequestsByFeederSuccess = true
        state.changeRequestsByFeeder = action.payload.data || []
        state.changeRequestsByFeederPagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.changeRequestsByFeederError = null
      })
      .addCase(fetchChangeRequestsByFeederId.rejected, (state, action) => {
        state.changeRequestsByFeederLoading = false
        state.changeRequestsByFeederError = (action.payload as string) || "Failed to fetch change requests for feeder"
        state.changeRequestsByFeederSuccess = false
        state.changeRequestsByFeeder = []
        state.changeRequestsByFeederPagination = {
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

          // Update the change request in the feeder-specific list if it exists
          const feederIndex = state.changeRequestsByFeeder.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (feederIndex !== -1) {
            const req = state.changeRequestsByFeeder[feederIndex]
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

          // Update the change request in the feeder-specific list if it exists
          const feederIndex = state.changeRequestsByFeeder.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (feederIndex !== -1) {
            const req = state.changeRequestsByFeeder[feederIndex]
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
  clearFeeders,
  clearError,
  clearCurrentFeeder,
  resetFeederState,
  setPagination,
  setChangeRequestsPagination,
  setChangeRequestsByFeederPagination,
  setCurrentFeeder,
  clearCreateState,
  clearUpdateState,
  clearChangeRequestStatus,
  clearChangeRequests,
  clearChangeRequestsByFeeder,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
} = feedersSlice.actions

export default feedersSlice.reducer
