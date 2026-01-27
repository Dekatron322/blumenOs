// src/lib/redux/fileManagementSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for File Management
// Interfaces for bulk upload
export interface BulkUploadRequest {
  fileId: number
  confirm: boolean
}

export interface BulkUploadPreview {
  fileId: number
  fileName: string
  fileSize: number
  totalRows: number
  validRows: number
  invalidRows: number
  totalAmount: number
  earliestPaidAtUtc: string
  latestPaidAtUtc: string
  channels: string[]
}

export interface BulkUploadJob {
  id: number
  jobType: number
  status: number
  requestedByUserId: number
  requestedAtUtc: string
  fileName: string
  fileKey: string
  fileUrl: string
  fileSize: number
  totalRows: number
  processedRows: number
  succeededRows: number
  failedRows: number
  lastProcessedRow: number
  retryCount: number
  startedAtUtc: string
  completedAtUtc: string
  lastError: string
  errorBlobKey: string
  payloadJson: string
}

// CSV Jobs interfaces
export interface CsvJob {
  id: number
  jobType: number
  status: number
  requestedByUserId: number
  requestedAtUtc: string
  fileName: string
  fileKey: string
  fileUrl: string
  fileSize: number
  totalRows: number
  processedRows: number
  succeededRows: number
  failedRows: number
  lastProcessedRow: number
  retryCount: number
  startedAtUtc: string
  completedAtUtc: string
  lastError: string
  errorBlobKey: string
  payloadJson: string
}

export interface CsvJobsParams {
  PageNumber: number
  PageSize: number
  JobType?: number
  Status?: number
  RequestedByUserId?: number
  RequestedFromUtc?: string
  RequestedToUtc?: string
  FileName?: string
  HasFailures?: boolean
  Search?: string
}

export interface CsvJobsResponse {
  isSuccess: boolean
  message: string
  data: CsvJob[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// CSV Upload Failures interfaces
export interface CsvUploadFailure {
  id: number
  csvBulkInsertionJobId: number
  lineNumber: number
  message: string
  rawLine: string
  createdAtUtc: string
}

export interface CsvUploadFailuresParams {
  id: number
  PageNumber: number
  PageSize: number
}

export interface CsvUploadFailuresResponse {
  isSuccess: boolean
  message: string
  data: CsvUploadFailure[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface BulkUploadData {
  queued: boolean
  preview: BulkUploadPreview
  job: BulkUploadJob
  confirmationQuestions: string[]
}

export interface BulkUploadResponse {
  isSuccess: boolean
  message: string
  data: BulkUploadData
}

export interface FileIntentRequest {
  fileName: string
  contentType: string
  sizeBytes: number
  purpose: string
  checksum: string
  bulkInsertType: string
  columns: string[]
}

export interface RequiredHeaders {
  [key: string]: string
}

export interface FileIntentData {
  fileId: number
  objectKey: string
  uploadUrl: string
  publicUrl: string
  expiresAtUtc: string
  requiredHeaders: RequiredHeaders
}

export interface FileIntentResponse {
  isSuccess: boolean
  message: string
  data: FileIntentData
}

export interface FinalizeFileData {
  fileId: number
  objectKey: string
  publicUrl: string
  status: string
}

export interface FinalizeFileResponse {
  isSuccess: boolean
  message: string
  data: FinalizeFileData
}

// File Management State
interface FileManagementState {
  // File intent state
  fileIntent: FileIntentData | null
  fileIntentLoading: boolean
  fileIntentError: string | null
  fileIntentSuccess: boolean
  fileIntentResponse: FileIntentResponse | null

  // Finalize file state
  finalizeFileLoading: boolean
  finalizeFileError: string | null
  finalizeFileSuccess: boolean
  finalizeFileResponse: FinalizeFileResponse | null

  // Bulk Upload state
  bulkUploadLoading: boolean
  bulkUploadError: string | null
  bulkUploadSuccess: boolean
  bulkUploadResponse: BulkUploadResponse | null

  // CSV Jobs state
  csvJobsLoading: boolean
  csvJobsError: string | null
  csvJobsSuccess: boolean
  csvJobsResponse: CsvJobsResponse | null
  csvJobs: CsvJob[]
  csvJobsPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null

  // CSV Upload Failures state
  csvUploadFailuresLoading: boolean
  csvUploadFailuresError: string | null
  csvUploadFailuresSuccess: boolean
  csvUploadFailuresResponse: CsvUploadFailuresResponse | null
  csvUploadFailures: CsvUploadFailure[]
  csvUploadFailuresPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  } | null
}

// Initial state
const initialState: FileManagementState = {
  // File Intent state
  fileIntent: null,
  fileIntentLoading: false,
  fileIntentError: null,
  fileIntentSuccess: false,
  fileIntentResponse: null,

  // Finalize File state
  finalizeFileLoading: false,
  finalizeFileError: null,
  finalizeFileSuccess: false,
  finalizeFileResponse: null,

  // Bulk Upload state
  bulkUploadLoading: false,
  bulkUploadError: null,
  bulkUploadSuccess: false,
  bulkUploadResponse: null,

  // CSV Jobs state
  csvJobsLoading: false,
  csvJobsError: null,
  csvJobsSuccess: false,
  csvJobsResponse: null,
  csvJobs: [],
  csvJobsPagination: null,

  // CSV Upload Failures state
  csvUploadFailuresLoading: false,
  csvUploadFailuresError: null,
  csvUploadFailuresSuccess: false,
  csvUploadFailuresResponse: null,
  csvUploadFailures: [],
  csvUploadFailuresPagination: null,
}

// Async thunks
export const createFileIntent = createAsyncThunk(
  "fileManagement/createFileIntent",
  async (request: FileIntentRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<FileIntentResponse>(buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.INTENT), request)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create file intent")
    }
  }
)

export const finalizeFile = createAsyncThunk(
  "fileManagement/finalizeFile",
  async (fileId: number, { rejectWithValue }) => {
    try {
      const endpoint = buildEndpointWithParams(API_ENDPOINTS.FILE_MANAGEMENT.FINALIZE, { id: fileId })
      const response = await api.post<FinalizeFileResponse>(endpoint, {})
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to finalize file")
    }
  }
)

export const processBulkUpload = createAsyncThunk(
  "fileManagement/processBulkUpload",
  async (request: BulkUploadRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<BulkUploadResponse>(API_ENDPOINTS.FILE_MANAGEMENT.BULK_UPLOAD, request)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process bulk upload")
    }
  }
)

// CSV Jobs async thunk
export const fetchCsvJobs = createAsyncThunk(
  "fileManagement/fetchCsvJobs",
  async (params: CsvJobsParams, { rejectWithValue }) => {
    try {
      // Build query string from parameters
      const queryParams = new URLSearchParams()

      // Required parameters
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      // Optional parameters - only add if they exist
      if (params.JobType !== undefined) queryParams.append("JobType", params.JobType.toString())
      if (params.Status !== undefined) queryParams.append("Status", params.Status.toString())
      if (params.RequestedByUserId !== undefined)
        queryParams.append("RequestedByUserId", params.RequestedByUserId.toString())
      if (params.RequestedFromUtc) queryParams.append("RequestedFromUtc", params.RequestedFromUtc)
      if (params.RequestedToUtc) queryParams.append("RequestedToUtc", params.RequestedToUtc)
      if (params.FileName) queryParams.append("FileName", params.FileName)
      if (params.HasFailures !== undefined) queryParams.append("HasFailures", params.HasFailures.toString())
      if (params.Search) queryParams.append("Search", params.Search)

      const url = `${buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CSV_JOBS)}?${queryParams.toString()}`
      const response = await api.get<CsvJobsResponse>(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch CSV jobs")
    }
  }
)

// CSV Upload Failures async thunk
export const fetchCsvUploadFailures = createAsyncThunk(
  "fileManagement/fetchCsvUploadFailures",
  async (params: CsvUploadFailuresParams, { rejectWithValue }) => {
    try {
      // Build query string from parameters
      const queryParams = new URLSearchParams()
      queryParams.append("PageNumber", params.PageNumber.toString())
      queryParams.append("PageSize", params.PageSize.toString())

      const endpoint = buildEndpointWithParams(API_ENDPOINTS.FILE_MANAGEMENT.CSV_UPLOAD_FAILURES, { id: params.id })
      const url = `${buildApiUrl(endpoint)}?${queryParams.toString()}`
      const response = await api.get<CsvUploadFailuresResponse>(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch CSV upload failures")
    }
  }
)

// Helper function to replace path parameters in endpoint
const buildEndpointWithParams = (
  endpoint: string,
  params: Record<string, string | number | boolean | null | undefined>
): string => {
  let builtEndpoint = endpoint
  Object.entries(params).forEach(([key, value]) => {
    const stringValue = value != null ? String(value) : ""
    builtEndpoint = builtEndpoint.replace(`{${key}}`, stringValue)
  })
  return builtEndpoint
}

// Slice
const fileManagementSlice = createSlice({
  name: "fileManagement",
  initialState,
  reducers: {
    // Reset file intent state
    resetFileIntentState: (state) => {
      state.fileIntent = null
      state.fileIntentLoading = false
      state.fileIntentError = null
      state.fileIntentSuccess = false
    },
    // Reset finalize file state
    resetFinalizeFileState: (state) => {
      state.finalizeFileLoading = false
      state.finalizeFileError = null
      state.finalizeFileSuccess = false
      state.finalizeFileResponse = null
    },
    resetBulkUploadState: (state) => {
      state.bulkUploadLoading = false
      state.bulkUploadError = null
      state.bulkUploadSuccess = false
      state.bulkUploadResponse = null
    },
    // Reset CSV Jobs state
    resetCsvJobsState: (state) => {
      state.csvJobsLoading = false
      state.csvJobsError = null
      state.csvJobsSuccess = false
      state.csvJobsResponse = null
      state.csvJobs = []
      state.csvJobsPagination = null
    },
    // Reset CSV Upload Failures state
    resetCsvUploadFailuresState: (state) => {
      state.csvUploadFailuresLoading = false
      state.csvUploadFailuresError = null
      state.csvUploadFailuresSuccess = false
      state.csvUploadFailuresResponse = null
      state.csvUploadFailures = []
      state.csvUploadFailuresPagination = null
    },
    // Reset all file management state
    resetFileManagementState: (state) => {
      state.fileIntent = null
      state.fileIntentLoading = false
      state.fileIntentError = null
      state.fileIntentSuccess = false
      state.fileIntentResponse = null
      state.finalizeFileLoading = false
      state.finalizeFileError = null
      state.finalizeFileSuccess = false
      state.finalizeFileResponse = null
      state.bulkUploadLoading = false
      state.bulkUploadError = null
      state.bulkUploadSuccess = false
      state.bulkUploadResponse = null
      state.csvJobsLoading = false
      state.csvJobsError = null
      state.csvJobsSuccess = false
      state.csvJobsResponse = null
      state.csvJobs = []
      state.csvJobsPagination = null
    },
  },
  extraReducers: (builder) => {
    // Create file intent
    builder
      .addCase(createFileIntent.pending, (state) => {
        state.fileIntentLoading = true
        state.fileIntentError = null
        state.fileIntentSuccess = false
      })
      .addCase(createFileIntent.fulfilled, (state, action) => {
        state.fileIntentLoading = false
        state.fileIntentSuccess = true
        state.fileIntentResponse = action.payload
        state.fileIntent = action.payload.data
      })
      .addCase(createFileIntent.rejected, (state, action) => {
        state.fileIntentLoading = false
        state.fileIntentError = action.payload as string
        state.fileIntentSuccess = false
      })

      // Finalize File reducers
      .addCase(finalizeFile.pending, (state) => {
        state.finalizeFileLoading = true
        state.finalizeFileError = null
        state.finalizeFileSuccess = false
      })
      .addCase(finalizeFile.fulfilled, (state, action) => {
        state.finalizeFileLoading = false
        state.finalizeFileSuccess = true
        state.finalizeFileResponse = action.payload
      })
      .addCase(finalizeFile.rejected, (state, action) => {
        state.finalizeFileLoading = false
        state.finalizeFileError = action.payload as string
        state.finalizeFileSuccess = false
      })

      // Bulk Upload reducers
      .addCase(processBulkUpload.pending, (state) => {
        state.bulkUploadLoading = true
        state.bulkUploadError = null
        state.bulkUploadSuccess = false
      })
      .addCase(processBulkUpload.fulfilled, (state, action) => {
        state.bulkUploadLoading = false
        state.bulkUploadSuccess = true
        state.bulkUploadResponse = action.payload
      })
      .addCase(processBulkUpload.rejected, (state, action) => {
        state.bulkUploadLoading = false
        state.bulkUploadError = action.payload as string
        state.bulkUploadSuccess = false
      })

      // CSV Jobs reducers
      .addCase(fetchCsvJobs.pending, (state) => {
        state.csvJobsLoading = true
        state.csvJobsError = null
        state.csvJobsSuccess = false
      })
      .addCase(fetchCsvJobs.fulfilled, (state, action) => {
        state.csvJobsLoading = false
        state.csvJobsSuccess = true
        state.csvJobsResponse = action.payload
        state.csvJobs = action.payload.data
        state.csvJobsPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchCsvJobs.rejected, (state, action) => {
        state.csvJobsLoading = false
        state.csvJobsError = action.payload as string
        state.csvJobsSuccess = false
      })

      // CSV Upload Failures reducers
      .addCase(fetchCsvUploadFailures.pending, (state) => {
        state.csvUploadFailuresLoading = true
        state.csvUploadFailuresError = null
        state.csvUploadFailuresSuccess = false
      })
      .addCase(fetchCsvUploadFailures.fulfilled, (state, action) => {
        state.csvUploadFailuresLoading = false
        state.csvUploadFailuresSuccess = true
        state.csvUploadFailuresResponse = action.payload
        state.csvUploadFailures = action.payload.data
        state.csvUploadFailuresPagination = {
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchCsvUploadFailures.rejected, (state, action) => {
        state.csvUploadFailuresLoading = false
        state.csvUploadFailuresError = action.payload as string
        state.csvUploadFailuresSuccess = false
      })
  },
})

export const {
  resetFileIntentState,
  resetFinalizeFileState,
  resetFileManagementState,
  resetBulkUploadState,
  resetCsvJobsState,
  resetCsvUploadFailuresState,
} = fileManagementSlice.actions

export default fileManagementSlice.reducer
