// src/lib/redux/backgroundJobsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Background Jobs
export interface JobTrigger {
  triggerName: string
  triggerGroup: string
  triggerType: string
  state: string
  previousFireTimeUtc: string | null
  nextFireTimeUtc: string | null
  cronExpression: string | null
}

export interface BackgroundJob {
  jobName: string
  jobGroup: string
  description: string | null
  isRunning: boolean
  triggers: JobTrigger[]
}

export interface BackgroundJobsData {
  schedulerName: string
  schedulerInstanceId: string
  isStarted: boolean
  inStandbyMode: boolean
  isShutdown: boolean
  runningSinceUtc: string | null
  jobsExecuted: number
  jobs: BackgroundJob[]
}

export interface BackgroundJobsResponse {
  isSuccess: boolean
  message: string
  data: BackgroundJobsData
}

export interface BackgroundJobState {
  // Background jobs data
  backgroundJobsData: BackgroundJobsData | null
  backgroundJobsLoading: boolean
  backgroundJobsError: string | null
  backgroundJobsSuccess: boolean

  // Individual job states
  selectedJob: BackgroundJob | null
  selectedJobLoading: boolean
  selectedJobError: string | null
  selectedJobSuccess: boolean

  // Job operations state
  jobOperationLoading: boolean
  jobOperationError: string | null
  jobOperationSuccess: boolean
  jobOperationMessage: string | null

  // Polling state
  isPolling: boolean
  pollingInterval: number
  lastUpdated: string | null

  // Filter and search state
  searchTerm: string
  filterByStatus: "all" | "running" | "idle"
  sortBy: "name" | "group" | "status"
  sortOrder: "asc" | "desc"

  // Derived data
  filteredJobs: BackgroundJob[]

  // General state
  loading: boolean
  error: string | null
}

// Initial state
const initialState: BackgroundJobState = {
  backgroundJobsData: null,
  backgroundJobsLoading: false,
  backgroundJobsError: null,
  backgroundJobsSuccess: false,

  selectedJob: null,
  selectedJobLoading: false,
  selectedJobError: null,
  selectedJobSuccess: false,

  jobOperationLoading: false,
  jobOperationError: null,
  jobOperationSuccess: false,
  jobOperationMessage: null,

  isPolling: false,
  pollingInterval: 30000, // 30 seconds default
  lastUpdated: null,

  searchTerm: "",
  filterByStatus: "all",
  sortBy: "name",
  sortOrder: "asc",

  filteredJobs: [],

  loading: false,
  error: null,
}

// Async thunks - GET request for background jobs
export const fetchBackgroundJobs = createAsyncThunk(
  "backgroundJobs/fetchBackgroundJobs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<BackgroundJobsResponse>(buildApiUrl(API_ENDPOINTS.BACKGROUND_JOB.GET))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch background jobs")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch background jobs")
      }
      return rejectWithValue(error.message || "Network error during background jobs fetch")
    }
  }
)

// Async thunks - Pause a job (if you add this endpoint later)
export const pauseJob = createAsyncThunk(
  "backgroundJobs/pauseJob",
  async ({ jobName, jobGroup }: { jobName: string; jobGroup: string }, { rejectWithValue }) => {
    try {
      // Assuming you might add a pause endpoint later
      // const response = await api.post(buildApiUrl(API_ENDPOINTS.BACKGROUND_JOB.PAUSE), {
      //   jobName,
      //   jobGroup
      // })

      // For now, simulate a successful pause
      await new Promise((resolve) => setTimeout(resolve, 500))

      return {
        isSuccess: true,
        message: `Job ${jobName} paused successfully`,
        jobName,
        jobGroup,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to pause job")
      }
      return rejectWithValue(error.message || "Network error during job pause")
    }
  }
)

// Async thunks - Resume a job (if you add this endpoint later)
export const resumeJob = createAsyncThunk(
  "backgroundJobs/resumeJob",
  async ({ jobName, jobGroup }: { jobName: string; jobGroup: string }, { rejectWithValue }) => {
    try {
      // Assuming you might add a resume endpoint later
      // const response = await api.post(buildApiUrl(API_ENDPOINTS.BACKGROUND_JOB.RESUME), {
      //   jobName,
      //   jobGroup
      // })

      // For now, simulate a successful resume
      await new Promise((resolve) => setTimeout(resolve, 500))

      return {
        isSuccess: true,
        message: `Job ${jobName} resumed successfully`,
        jobName,
        jobGroup,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to resume job")
      }
      return rejectWithValue(error.message || "Network error during job resume")
    }
  }
)

// Async thunks - Trigger a job manually (if you add this endpoint later)
export const triggerJob = createAsyncThunk(
  "backgroundJobs/triggerJob",
  async ({ jobName, jobGroup }: { jobName: string; jobGroup: string }, { rejectWithValue }) => {
    try {
      // Assuming you might add a trigger endpoint later
      // const response = await api.post(buildApiUrl(API_ENDPOINTS.BACKGROUND_JOB.TRIGGER), {
      //   jobName,
      //   jobGroup
      // })

      // For now, simulate a successful trigger
      await new Promise((resolve) => setTimeout(resolve, 800))

      return {
        isSuccess: true,
        message: `Job ${jobName} triggered successfully`,
        jobName,
        jobGroup,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to trigger job")
      }
      return rejectWithValue(error.message || "Network error during job trigger")
    }
  }
)

// Background Jobs slice
const backgroundJobsSlice = createSlice({
  name: "backgroundJobs",
  initialState,
  reducers: {
    // Clear background jobs state
    clearBackgroundJobs: (state) => {
      state.backgroundJobsData = null
      state.backgroundJobsError = null
      state.backgroundJobsSuccess = false
      state.selectedJob = null
      state.lastUpdated = null
    },

    // Clear selected job state
    clearSelectedJob: (state) => {
      state.selectedJob = null
      state.selectedJobError = null
      state.selectedJobSuccess = false
      state.selectedJobLoading = false
    },

    // Clear job operation state
    clearJobOperation: (state) => {
      state.jobOperationLoading = false
      state.jobOperationError = null
      state.jobOperationSuccess = false
      state.jobOperationMessage = null
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.backgroundJobsError = null
      state.selectedJobError = null
      state.jobOperationError = null
    },

    // Reset background jobs state
    resetBackgroundJobsState: () => {
      return initialState
    },

    // Set selected job
    setSelectedJob: (state, action: PayloadAction<BackgroundJob>) => {
      state.selectedJob = action.payload
      state.selectedJobSuccess = true
    },

    // Update job status in the list
    updateJobStatus: (state, action: PayloadAction<{ jobName: string; jobGroup: string; isRunning: boolean }>) => {
      const { jobName, jobGroup, isRunning } = action.payload
      if (state.backgroundJobsData) {
        const jobIndex = state.backgroundJobsData.jobs.findIndex(
          (job) => job.jobName === jobName && job.jobGroup === jobGroup
        )
        if (jobIndex !== -1) {
          const job = state.backgroundJobsData.jobs[jobIndex]
          if (job) {
            job.isRunning = isRunning
          }
        }

        // Update selected job if it matches
        if (state.selectedJob && state.selectedJob.jobName === jobName && state.selectedJob.jobGroup === jobGroup) {
          state.selectedJob.isRunning = isRunning
        }
      }
    },

    // Update trigger state
    updateTriggerState: (
      state,
      action: PayloadAction<{
        jobName: string
        jobGroup: string
        triggerName: string
        triggerGroup: string
        state: string
        nextFireTimeUtc?: string | null
      }>
    ) => {
      const { jobName, jobGroup, triggerName, triggerGroup, state: triggerState, nextFireTimeUtc } = action.payload

      if (state.backgroundJobsData) {
        const jobIndex = state.backgroundJobsData.jobs.findIndex(
          (job) => job.jobName === jobName && job.jobGroup === jobGroup
        )

        if (jobIndex !== -1) {
          const job = state.backgroundJobsData.jobs[jobIndex]
          if (!job) return

          const triggerIndex = job.triggers.findIndex(
            (trigger) => trigger.triggerName === triggerName && trigger.triggerGroup === triggerGroup
          )

          if (triggerIndex !== -1) {
            const trigger = job.triggers[triggerIndex]
            if (!trigger) return

            trigger.state = triggerState
            if (nextFireTimeUtc !== undefined) {
              trigger.nextFireTimeUtc = nextFireTimeUtc
            }
          }
        }
      }
    },

    // Set polling
    setPolling: (state, action: PayloadAction<{ isPolling: boolean; interval?: number }>) => {
      state.isPolling = action.payload.isPolling
      if (action.payload.interval !== undefined) {
        state.pollingInterval = action.payload.interval
      }
    },

    // Set last updated timestamp
    setLastUpdated: (state, action: PayloadAction<string>) => {
      state.lastUpdated = action.payload
    },

    // Set search term
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },

    // Set filter by status
    setFilterByStatus: (state, action: PayloadAction<"all" | "running" | "idle">) => {
      state.filterByStatus = action.payload
    },

    // Set sort options
    setSortOptions: (
      state,
      action: PayloadAction<{ sortBy: "name" | "group" | "status"; sortOrder: "asc" | "desc" }>
    ) => {
      state.sortBy = action.payload.sortBy
      state.sortOrder = action.payload.sortOrder
    },

    // Get filtered and sorted jobs (computed property helper)
    getFilteredJobs: (state) => {
      if (!state.backgroundJobsData) {
        state.filteredJobs = []
        return
      }

      let filteredJobs = [...state.backgroundJobsData.jobs]

      // Apply search filter
      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase()
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.jobName.toLowerCase().includes(searchLower) ||
            job.jobGroup.toLowerCase().includes(searchLower) ||
            (job.description && job.description.toLowerCase().includes(searchLower))
        )
      }

      // Apply status filter
      if (state.filterByStatus !== "all") {
        filteredJobs = filteredJobs.filter((job) =>
          state.filterByStatus === "running" ? job.isRunning : !job.isRunning
        )
      }

      // Apply sorting
      filteredJobs.sort((a, b) => {
        let aValue: any, bValue: any

        switch (state.sortBy) {
          case "name":
            aValue = a.jobName
            bValue = b.jobName
            break
          case "group":
            aValue = a.jobGroup
            bValue = b.jobGroup
            break
          case "status":
            aValue = a.isRunning
            bValue = b.isRunning
            break
          default:
            aValue = a.jobName
            bValue = b.jobName
        }

        if (aValue < bValue) return state.sortOrder === "asc" ? -1 : 1
        if (aValue > bValue) return state.sortOrder === "asc" ? 1 : -1
        return 0
      })

      state.filteredJobs = filteredJobs
    },

    // Update scheduler status
    updateSchedulerStatus: (
      state,
      action: PayloadAction<{
        isStarted?: boolean
        inStandbyMode?: boolean
        isShutdown?: boolean
        runningSinceUtc?: string | null
      }>
    ) => {
      if (state.backgroundJobsData) {
        if (action.payload.isStarted !== undefined) {
          state.backgroundJobsData.isStarted = action.payload.isStarted
        }
        if (action.payload.inStandbyMode !== undefined) {
          state.backgroundJobsData.inStandbyMode = action.payload.inStandbyMode
        }
        if (action.payload.isShutdown !== undefined) {
          state.backgroundJobsData.isShutdown = action.payload.isShutdown
        }
        if (action.payload.runningSinceUtc !== undefined) {
          state.backgroundJobsData.runningSinceUtc = action.payload.runningSinceUtc
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch background jobs cases
      .addCase(fetchBackgroundJobs.pending, (state) => {
        state.backgroundJobsLoading = true
        state.backgroundJobsError = null
        state.backgroundJobsSuccess = false
        state.loading = true
      })
      .addCase(fetchBackgroundJobs.fulfilled, (state, action: PayloadAction<BackgroundJobsResponse>) => {
        state.backgroundJobsLoading = false
        state.backgroundJobsSuccess = true
        state.loading = false
        state.backgroundJobsData = action.payload.data
        state.lastUpdated = new Date().toISOString()
        state.backgroundJobsError = null
      })
      .addCase(fetchBackgroundJobs.rejected, (state, action) => {
        state.backgroundJobsLoading = false
        state.loading = false
        state.backgroundJobsError = (action.payload as string) || "Failed to fetch background jobs"
        state.backgroundJobsSuccess = false
        state.backgroundJobsData = null
      })
      // Pause job cases
      .addCase(pauseJob.pending, (state) => {
        state.jobOperationLoading = true
        state.jobOperationError = null
        state.jobOperationSuccess = false
        state.jobOperationMessage = null
        state.loading = true
      })
      .addCase(pauseJob.fulfilled, (state, action) => {
        state.jobOperationLoading = false
        state.jobOperationSuccess = true
        state.loading = false
        state.jobOperationMessage = action.payload.message

        // Update the job status in the list
        const { jobName, jobGroup } = action.payload
        if (state.backgroundJobsData) {
          const jobIndex = state.backgroundJobsData.jobs.findIndex(
            (job) => job.jobName === jobName && job.jobGroup === jobGroup
          )
          if (jobIndex !== -1) {
            const job = state.backgroundJobsData.jobs[jobIndex]
            if (job) {
              job.isRunning = false
            }
          }
        }
      })
      .addCase(pauseJob.rejected, (state, action) => {
        state.jobOperationLoading = false
        state.loading = false
        state.jobOperationError = (action.payload as string) || "Failed to pause job"
        state.jobOperationSuccess = false
      })
      // Resume job cases
      .addCase(resumeJob.pending, (state) => {
        state.jobOperationLoading = true
        state.jobOperationError = null
        state.jobOperationSuccess = false
        state.jobOperationMessage = null
        state.loading = true
      })
      .addCase(resumeJob.fulfilled, (state, action) => {
        state.jobOperationLoading = false
        state.jobOperationSuccess = true
        state.loading = false
        state.jobOperationMessage = action.payload.message

        // Update the job status in the list
        const { jobName, jobGroup } = action.payload
        if (state.backgroundJobsData) {
          const jobIndex = state.backgroundJobsData.jobs.findIndex(
            (job) => job.jobName === jobName && job.jobGroup === jobGroup
          )
          if (jobIndex !== -1) {
            const job = state.backgroundJobsData.jobs[jobIndex]
            if (job) {
              job.isRunning = true
            }
          }
        }
      })
      .addCase(resumeJob.rejected, (state, action) => {
        state.jobOperationLoading = false
        state.loading = false
        state.jobOperationError = (action.payload as string) || "Failed to resume job"
        state.jobOperationSuccess = false
      })
      // Trigger job cases
      .addCase(triggerJob.pending, (state) => {
        state.jobOperationLoading = true
        state.jobOperationError = null
        state.jobOperationSuccess = false
        state.jobOperationMessage = null
        state.loading = true
      })
      .addCase(triggerJob.fulfilled, (state, action) => {
        state.jobOperationLoading = false
        state.jobOperationSuccess = true
        state.loading = false
        state.jobOperationMessage = action.payload.message

        // Note: Triggering a job might not change its running status immediately
        // You might want to refetch the data to get updated status
      })
      .addCase(triggerJob.rejected, (state, action) => {
        state.jobOperationLoading = false
        state.loading = false
        state.jobOperationError = (action.payload as string) || "Failed to trigger job"
        state.jobOperationSuccess = false
      })
  },
})

export const {
  clearBackgroundJobs,
  clearSelectedJob,
  clearJobOperation,
  clearError,
  resetBackgroundJobsState,
  setSelectedJob,
  updateJobStatus,
  updateTriggerState,
  setPolling,
  setLastUpdated,
  setSearchTerm,
  setFilterByStatus,
  setSortOptions,
  getFilteredJobs,
  updateSchedulerStatus,
} = backgroundJobsSlice.actions

export default backgroundJobsSlice.reducer
