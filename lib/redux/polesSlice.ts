// src/lib/redux/polesSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Pole
export interface Pole {
  id: number
  htPoleNumber: string
}

export interface PolesResponse {
  isSuccess: boolean
  message: string
  data: Pole[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PoleResponse {
  isSuccess: boolean
  message: string
  data: Pole[]
}

export interface SinglePoleResponse {
  isSuccess: boolean
  message: string
  data: Pole
}

export interface PolesRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Request interfaces for adding/updating pole
export interface CreatePoleRequest {
  htPoleNumber: string
}

export interface UpdatePoleRequest {
  htPoleNumber: string
}

export type CreatePoleRequestPayload = CreatePoleRequest[]

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

// Pole State
interface PoleState {
  // Poles list state
  poles: Pole[]
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

  // Current pole state (for viewing/editing)
  currentPole: Pole | null
  currentPoleLoading: boolean
  currentPoleError: string | null

  // Create pole state
  createLoading: boolean
  createError: string | null
  createSuccess: boolean

  // Update pole state
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

  // Change Requests By Pole ID state
  changeRequestsByPole: ChangeRequestListItem[]
  changeRequestsByPoleLoading: boolean
  changeRequestsByPoleError: string | null
  changeRequestsByPoleSuccess: boolean
  changeRequestsByPolePagination: {
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
const initialState: PoleState = {
  poles: [],
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
  currentPole: null,
  currentPoleLoading: false,
  currentPoleError: null,
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
  changeRequestsByPole: [],
  changeRequestsByPoleLoading: false,
  changeRequestsByPoleError: null,
  changeRequestsByPoleSuccess: false,
  changeRequestsByPolePagination: {
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
export const fetchPoles = createAsyncThunk(
  "poles/fetchPoles",
  async (params: PolesRequestParams, { rejectWithValue }) => {
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

      const response = await api.get<PolesResponse>(buildApiUrl(API_ENDPOINTS.HT_POLE.GET), {
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
        return rejectWithValue(response.data.message || "Failed to fetch poles")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch poles")
      }
      return rejectWithValue(error.message || "Network error during poles fetch")
    }
  }
)

export const fetchPoleById = createAsyncThunk<Pole, number, { rejectValue: string }>(
  "poles/fetchPoleById",
  async (poleId: number, { rejectWithValue }) => {
    try {
      // Use the new GET_BY_ID endpoint with parameter replacement
      const endpoint = API_ENDPOINTS.HT_POLE.GET_BY_ID.replace("{id}", poleId.toString())

      const response = await api.get<SinglePoleResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch pole")
      }

      const pole = response.data.data
      if (!pole) {
        return rejectWithValue("Pole not found")
      }

      return pole
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch pole")
      }
      return rejectWithValue(error.message || "Network error during pole fetch")
    }
  }
)

export const createPole = createAsyncThunk(
  "poles/createPole",
  async (poleData: CreatePoleRequestPayload, { rejectWithValue }) => {
    try {
      // API expects a plain array of pole requests
      const response = await api.post<PoleResponse>(buildApiUrl(API_ENDPOINTS.HT_POLE.ADD), poleData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create pole")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create pole")
      }
      return rejectWithValue(error.message || "Network error during pole creation")
    }
  }
)

export const createSinglePole = createAsyncThunk(
  "poles/createSinglePole",
  async (poleData: CreatePoleRequest, { rejectWithValue }) => {
    try {
      // Send a single-element array to match the bulk API contract
      const payload: CreatePoleRequestPayload = [poleData]

      const response = await api.post<PoleResponse>(buildApiUrl(API_ENDPOINTS.HT_POLE.ADD), payload)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create pole")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create pole")
      }
      return rejectWithValue(error.message || "Network error during pole creation")
    }
  }
)

export const updatePole = createAsyncThunk(
  "poles/updatePole",
  async ({ id, poleData }: { id: number; poleData: UpdatePoleRequest }, { rejectWithValue }) => {
    try {
      // Replace the {id} placeholder in the endpoint with the actual ID
      const endpoint = API_ENDPOINTS.HT_POLE.UPDATE.replace("{id}", id.toString())

      const response = await api.put<SinglePoleResponse>(buildApiUrl(endpoint), poleData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update pole")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update pole")
      }
      return rejectWithValue(error.message || "Network error during pole update")
    }
  }
)

// Change Request Async Thunks
export const submitChangeRequest = createAsyncThunk(
  "poles/submitChangeRequest",
  async ({ id, changeRequestData }: { id: number; changeRequestData: ChangeRequestData }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.HT_POLE.CHANGE_REQUEST.replace("{id}", id.toString())
      const response = await api.post<ChangeRequestResponse>(buildApiUrl(endpoint), changeRequestData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to submit change request")
      }

      if (!response.data.data) {
        return rejectWithValue("Change request response data not found")
      }

      return {
        poleId: id,
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
  "poles/fetchChangeRequests",
  async (params: ChangeRequestsRequestParams, { rejectWithValue }) => {
    try {
      const { pageNumber, pageSize, status, source, reference, publicId } = params

      const response = await api.get<ChangeRequestsResponse>(buildApiUrl(API_ENDPOINTS.HT_POLE.VIEW_CHANGE_REQUEST), {
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

export const fetchChangeRequestsByPoleId = createAsyncThunk(
  "poles/fetchChangeRequestsByPoleId",
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

      const endpoint = API_ENDPOINTS.HT_POLE.CHANGE_REQUESTS_BY_ID.replace("{id}", id.toString())
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
        return rejectWithValue(response.data.message || "Failed to fetch change requests for pole")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch change requests for pole")
      }
      return rejectWithValue(error.message || "Network error during pole change requests fetch")
    }
  }
)

export const fetchChangeRequestDetails = createAsyncThunk(
  "poles/fetchChangeRequestDetails",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.HT_POLE.CHANGE_REQUEST_DETAILS.replace("{identifier}", identifier)
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
  "poles/approveChangeRequest",
  async ({ publicId, notes }: { publicId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.HT_POLE.APPROVE_CHANGE_REQUEST.replace("{publicId}", publicId)
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
  "poles/declineChangeRequest",
  async ({ publicId, reason }: { publicId: string; reason: string }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.HT_POLE.DECLINE_CHANGE_REQUEST.replace("{publicId}", publicId)
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

// Pole slice
const polesSlice = createSlice({
  name: "poles",
  initialState,
  reducers: {
    // Clear poles state
    clearPoles: (state) => {
      state.poles = []
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
      state.currentPoleError = null
      state.createError = null
      state.updateError = null
      state.changeRequestError = null
      state.changeRequestsError = null
      state.changeRequestsByPoleError = null
      state.changeRequestDetailsError = null
      state.approveChangeRequestError = null
      state.declineChangeRequestError = null
    },

    // Clear current pole
    clearCurrentPole: (state) => {
      state.currentPole = null
      state.currentPoleError = null
    },

    // Reset pole state
    resetPoleState: (state) => {
      state.poles = []
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
      state.currentPole = null
      state.currentPoleLoading = false
      state.currentPoleError = null
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
      state.changeRequestsByPole = []
      state.changeRequestsByPoleLoading = false
      state.changeRequestsByPoleError = null
      state.changeRequestsByPoleSuccess = false
      state.changeRequestsByPolePagination = {
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

    // Set change requests by pole pagination
    setChangeRequestsByPolePagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.changeRequestsByPolePagination.currentPage = action.payload.page
      state.changeRequestsByPolePagination.pageSize = action.payload.pageSize
    },

    // Set current pole (for forms, etc.)
    setCurrentPole: (state, action: PayloadAction<Pole | null>) => {
      state.currentPole = action.payload
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

    // Clear change requests by pole state
    clearChangeRequestsByPole: (state) => {
      state.changeRequestsByPole = []
      state.changeRequestsByPoleError = null
      state.changeRequestsByPoleSuccess = false
      state.changeRequestsByPolePagination = {
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
      // Fetch poles cases
      .addCase(fetchPoles.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchPoles.fulfilled, (state, action: PayloadAction<PolesResponse>) => {
        state.loading = false
        state.success = true
        state.poles = action.payload.data
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
      .addCase(fetchPoles.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch poles"
        state.success = false
        state.poles = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch pole by ID cases
      .addCase(fetchPoleById.pending, (state) => {
        state.currentPoleLoading = true
        state.currentPoleError = null
      })
      .addCase(fetchPoleById.fulfilled, (state, action: PayloadAction<Pole>) => {
        state.currentPoleLoading = false
        state.currentPole = action.payload
        state.currentPoleError = null
      })
      .addCase(fetchPoleById.rejected, (state, action) => {
        state.currentPoleLoading = false
        state.currentPoleError = (action.payload as string) || "Failed to fetch pole"
        state.currentPole = null
      })
      // Create pole cases
      .addCase(createPole.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createPole.fulfilled, (state, action: PayloadAction<PoleResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created pole to the list
        if (action.payload.data && action.payload.data.length > 0) {
          state.poles.unshift(...action.payload.data)
        }
      })
      .addCase(createPole.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create pole"
        state.createSuccess = false
      })
      // Create single pole cases
      .addCase(createSinglePole.pending, (state) => {
        state.createLoading = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createSinglePole.fulfilled, (state, action: PayloadAction<PoleResponse>) => {
        state.createLoading = false
        state.createSuccess = true
        state.createError = null

        // Optionally add the newly created pole to the list
        if (action.payload.data && action.payload.data.length > 0) {
          const newPole = action.payload.data[0]
          if (newPole) {
            state.poles.unshift(newPole)
          }
        }
      })
      .addCase(createSinglePole.rejected, (state, action) => {
        state.createLoading = false
        state.createError = (action.payload as string) || "Failed to create pole"
        state.createSuccess = false
      })
      // Update pole cases
      .addCase(updatePole.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updatePole.fulfilled, (state, action: PayloadAction<SinglePoleResponse>) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.updateError = null

        // Update the pole in the current list
        const updatedPole = action.payload.data
        const index = state.poles.findIndex((p) => p.id === updatedPole.id)
        if (index !== -1) {
          state.poles[index] = updatedPole
        }

        // Update current pole if it's the one being edited
        if (state.currentPole && state.currentPole.id === updatedPole.id) {
          state.currentPole = updatedPole
        }
      })
      .addCase(updatePole.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = (action.payload as string) || "Failed to update pole"
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
            poleId: number
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
      // Fetch change requests by pole ID cases
      .addCase(fetchChangeRequestsByPoleId.pending, (state) => {
        state.changeRequestsByPoleLoading = true
        state.changeRequestsByPoleError = null
        state.changeRequestsByPoleSuccess = false
      })
      .addCase(fetchChangeRequestsByPoleId.fulfilled, (state, action: PayloadAction<ChangeRequestsResponse>) => {
        state.changeRequestsByPoleLoading = false
        state.changeRequestsByPoleSuccess = true
        state.changeRequestsByPole = action.payload.data || []
        state.changeRequestsByPolePagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.changeRequestsByPoleError = null
      })
      .addCase(fetchChangeRequestsByPoleId.rejected, (state, action) => {
        state.changeRequestsByPoleLoading = false
        state.changeRequestsByPoleError = (action.payload as string) || "Failed to fetch change requests for pole"
        state.changeRequestsByPoleSuccess = false
        state.changeRequestsByPole = []
        state.changeRequestsByPolePagination = {
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

          // Update the change request in the pole-specific list if it exists
          const poleIndex = state.changeRequestsByPole.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (poleIndex !== -1) {
            const req = state.changeRequestsByPole[poleIndex]
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

          // Update the change request in the pole-specific list if it exists
          const poleIndex = state.changeRequestsByPole.findIndex((cr) => cr.publicId === action.payload.publicId)
          if (poleIndex !== -1) {
            const req = state.changeRequestsByPole[poleIndex]
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
  clearPoles,
  clearError,
  clearCurrentPole,
  resetPoleState,
  setPagination,
  setChangeRequestsPagination,
  setChangeRequestsByPolePagination,
  setCurrentPole,
  clearCreateState,
  clearUpdateState,
  clearChangeRequestStatus,
  clearChangeRequests,
  clearChangeRequestsByPole,
  clearChangeRequestDetails,
  clearApproveChangeRequestStatus,
  clearDeclineChangeRequestStatus,
} = polesSlice.actions

export default polesSlice.reducer
