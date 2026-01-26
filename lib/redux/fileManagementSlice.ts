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
  },
})

export const { resetFileIntentState, resetFinalizeFileState, resetFileManagementState, resetBulkUploadState } =
  fileManagementSlice.actions

export default fileManagementSlice.reducer
