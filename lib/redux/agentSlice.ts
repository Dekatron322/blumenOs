// src/lib/redux/agentSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Agent
export interface AgentUser {
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
  lastLoginAt: string
  createdAt: string
  lastUpdated: string
}

export interface Agent {
  id: number
  agentCode: string
  status: string
  canCollectCash: boolean
  cashCollectionLimit: number
  cashAtHand: number
  lastCashCollectionDate: string
  user: AgentUser
  areaOfficeId: number
  areaOfficeName: string
  serviceCenterId: number
  serviceCenterName: string
}

export interface AgentsResponse {
  isSuccess: boolean
  message: string
  data: Agent[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface AgentsRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  status?: string
  canCollectCash?: boolean
  minCashAtHand?: number
  maxCashAtHand?: number
  lastCashCollectionDateFrom?: string
  lastCashCollectionDateTo?: string
  areaOfficeId?: number
  serviceCenterId?: number
}

// Agent State
interface AgentState {
  // Agents list state
  agents: Agent[]
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

  // Current agent state (for viewing/editing)
  currentAgent: Agent | null
  currentAgentLoading: boolean
  currentAgentError: string | null
}

// Initial state
const initialState: AgentState = {
  agents: [],
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
  currentAgent: null,
  currentAgentLoading: false,
  currentAgentError: null,
}

// Async thunks
export const fetchAgents = createAsyncThunk(
  "agents/fetchAgents",
  async (params: AgentsRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        search,
        status,
        canCollectCash,
        minCashAtHand,
        maxCashAtHand,
        lastCashCollectionDateFrom,
        lastCashCollectionDateTo,
        areaOfficeId,
        serviceCenterId,
      } = params

      const response = await api.get<AgentsResponse>(buildApiUrl(API_ENDPOINTS.AGENTS.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(search && { Search: search }),
          ...(status && { Status: status }),
          ...(canCollectCash !== undefined && { CanCollectCash: canCollectCash }),
          ...(minCashAtHand !== undefined && { MinCashAtHand: minCashAtHand }),
          ...(maxCashAtHand !== undefined && { MaxCashAtHand: maxCashAtHand }),
          ...(lastCashCollectionDateFrom && { LastCashCollectionDateFrom: lastCashCollectionDateFrom }),
          ...(lastCashCollectionDateTo && { LastCashCollectionDateTo: lastCashCollectionDateTo }),
          ...(areaOfficeId !== undefined && { AreaOfficeId: areaOfficeId }),
          ...(serviceCenterId !== undefined && { ServiceCenterId: serviceCenterId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch agents")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch agents")
      }
      return rejectWithValue(error.message || "Network error during agents fetch")
    }
  }
)

// Agent slice
const agentSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {
    // Clear agents state
    clearAgents: (state) => {
      state.agents = []
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
      state.currentAgentError = null
    },

    // Clear current agent
    clearCurrentAgent: (state) => {
      state.currentAgent = null
      state.currentAgentError = null
    },

    // Reset agent state
    resetAgentState: (state) => {
      state.agents = []
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
      state.currentAgent = null
      state.currentAgentLoading = false
      state.currentAgentError = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Set current agent (for when we get agent data from other sources)
    setCurrentAgent: (state, action: PayloadAction<Agent>) => {
      state.currentAgent = action.payload
    },

    // Update agent in list (for optimistic updates)
    updateAgentInList: (state, action: PayloadAction<Agent>) => {
      const index = state.agents.findIndex((agent) => agent.id === action.payload.id)
      if (index !== -1) {
        state.agents[index] = action.payload
      }
    },

    // Remove agent from list
    removeAgentFromList: (state, action: PayloadAction<number>) => {
      state.agents = state.agents.filter((agent) => agent.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch agents cases
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchAgents.fulfilled, (state, action: PayloadAction<AgentsResponse>) => {
        state.loading = false
        state.success = true
        state.agents = action.payload.data
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
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch agents"
        state.success = false
        state.agents = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
  },
})

export const {
  clearAgents,
  clearError,
  clearCurrentAgent,
  resetAgentState,
  setPagination,
  setCurrentAgent,
  updateAgentInList,
  removeAgentFromList,
} = agentSlice.actions

export default agentSlice.reducer
