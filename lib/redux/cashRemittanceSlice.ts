// src/lib/redux/cashRemittanceSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Cash Remittance Status Enum
export enum CashRemittanceStatus {
  Pending = 0,
  Deposited = 1,
  Verified = 2,
}

// Interface for Cash Remittance Summary
export interface CashRemittanceSummary {
  totalCashAtOffice: number
  totalRemitted: number
  totalCollected: number
}

// Interface for Cash Remittance Summary Response
export interface CashRemittanceSummaryResponse {
  isSuccess: boolean
  message: string
  data: CashRemittanceSummary
}

// Interface for Collection Officer
export interface CollectionOfficer {
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

// Interface for Cash Remittance Record
export interface CashRemittanceRecord {
  id: number
  amount: number
  bankName: string
  tellerNumber: string
  tellerUrl: string
  notes: string
  startDateUtc: string
  endDateUtc: string
  depositedAtUtc: string
  status: number
  collectionOfficer: CollectionOfficer
}

// Interface for Cash Remittance Records Response
export interface CashRemittanceRecordsResponse {
  isSuccess: boolean
  message: string
  data: CashRemittanceRecord[]
}

// Interface for creating a cash remittance record
export interface CreateCashRemittanceRequest {
  amount: number
  startDateUtc: string
  endDateUtc: string
  bankName: string
  tellerNumber: string
  notes: string
  depositedAtUtc: string
}

// Interface for cash remittance creation response
export interface CreateCashRemittanceResponse {
  isSuccess: boolean
  message: string
  data: CashRemittanceRecord
}

// Interface for Add Receipt Request
export interface AddReceiptRequest {
  tellerUrl: string
  tellerNumber: string
}

// Interface for Add Receipt Response
export interface AddReceiptResponse {
  isSuccess: boolean
  message: string
  data: CashRemittanceRecord
}

// Interface for Cash Remittance Request Params
export interface CashRemittanceRequestParams {
  startUtc: string
  endUtc: string
}

// Cash Remittance State
interface CashRemittanceState {
  // Summary state
  summary: CashRemittanceSummary | null
  summaryLoading: boolean
  summaryError: string | null
  summarySuccess: boolean

  // Records state
  records: CashRemittanceRecord[]
  recordsLoading: boolean
  recordsError: string | null
  recordsSuccess: boolean

  // Add record state
  addRecordLoading: boolean
  addRecordError: string | null
  addRecordSuccess: boolean

  // Add receipt state
  addReceiptLoading: boolean
  addReceiptError: string | null
  addReceiptSuccess: boolean
}

// Initial state
const initialState: CashRemittanceState = {
  summary: null,
  summaryLoading: false,
  summaryError: null,
  summarySuccess: false,

  records: [],
  recordsLoading: false,
  recordsError: null,
  recordsSuccess: false,

  addRecordLoading: false,
  addRecordError: null,
  addRecordSuccess: false,

  addReceiptLoading: false,
  addReceiptError: null,
  addReceiptSuccess: false,
}

// Async thunk for fetching cash remittance summary
export const fetchCashRemittanceSummary = createAsyncThunk(
  "cashRemittance/fetchSummary",
  async (params: CashRemittanceRequestParams, { rejectWithValue }) => {
    try {
      const { startUtc, endUtc } = params

      const response = await api.get<CashRemittanceSummaryResponse>(
        buildApiUrl(API_ENDPOINTS.CASH_REMITTANCE.SUMMARY),
        {
          params: {
            startUtc,
            endUtc,
          },
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch cash remittance summary")
      }

      if (!response.data.data) {
        return rejectWithValue("Cash remittance summary data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch cash remittance summary")
      }
      return rejectWithValue(error.message || "Network error during cash remittance summary fetch")
    }
  }
)

// Async thunk for fetching cash remittance records
export const fetchCashRemittanceRecords = createAsyncThunk(
  "cashRemittance/fetchRecords",
  async (params: CashRemittanceRequestParams, { rejectWithValue }) => {
    try {
      const { startUtc, endUtc } = params

      const response = await api.get<CashRemittanceRecordsResponse>(buildApiUrl(API_ENDPOINTS.CASH_REMITTANCE.GET), {
        params: {
          startUtc,
          endUtc,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch cash remittance records")
      }

      if (!response.data.data) {
        return rejectWithValue("Cash remittance records data not found")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch cash remittance records")
      }
      return rejectWithValue(error.message || "Network error during cash remittance records fetch")
    }
  }
)

// Async thunk for creating a cash remittance record
export const createCashRemittanceRecord = createAsyncThunk(
  "cashRemittance/createRecord",
  async (recordData: CreateCashRemittanceRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateCashRemittanceResponse>(
        buildApiUrl(API_ENDPOINTS.CASH_REMITTANCE.ADD),
        recordData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create cash remittance record")
      }

      if (!response.data.data) {
        return rejectWithValue("Cash remittance record creation failed")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create cash remittance record")
      }
      return rejectWithValue(error.message || "Network error during cash remittance record creation")
    }
  }
)

// Async thunk for adding receipt to cash remittance record
export const addReceiptToCashRemittance = createAsyncThunk(
  "cashRemittance/addReceipt",
  async ({ id, receiptData }: { id: number; receiptData: AddReceiptRequest }, { rejectWithValue }) => {
    try {
      const response = await api.post<AddReceiptResponse>(
        buildApiUrl(API_ENDPOINTS.CASH_REMITTANCE.RECORD.replace("{id}", id.toString())),
        receiptData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to add receipt to cash remittance record")
      }

      if (!response.data.data) {
        return rejectWithValue("Failed to add receipt to cash remittance record")
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to add receipt to cash remittance record")
      }
      return rejectWithValue(error.message || "Network error during receipt addition")
    }
  }
)

// Cash Remittance slice
const cashRemittanceSlice = createSlice({
  name: "cashRemittance",
  initialState,
  reducers: {
    // Clear summary state
    clearSummary: (state) => {
      state.summary = null
      state.summaryError = null
      state.summarySuccess = false
      state.summaryLoading = false
    },

    // Clear records state
    clearRecords: (state) => {
      state.records = []
      state.recordsError = null
      state.recordsSuccess = false
      state.recordsLoading = false
    },

    // Clear add record state
    clearAddRecord: (state) => {
      state.addRecordError = null
      state.addRecordSuccess = false
      state.addRecordLoading = false
    },

    // Clear add receipt state
    clearAddReceipt: (state) => {
      state.addReceiptError = null
      state.addReceiptSuccess = false
      state.addReceiptLoading = false
    },

    // Clear errors
    clearError: (state) => {
      state.summaryError = null
      state.recordsError = null
      state.addRecordError = null
      state.addReceiptError = null
    },

    // Reset cash remittance state
    resetCashRemittanceState: (state) => {
      state.summary = null
      state.summaryLoading = false
      state.summaryError = null
      state.summarySuccess = false
      state.records = []
      state.recordsLoading = false
      state.recordsError = null
      state.recordsSuccess = false
      state.addRecordLoading = false
      state.addRecordError = null
      state.addRecordSuccess = false
      state.addReceiptLoading = false
      state.addReceiptError = null
      state.addReceiptSuccess = false
    },
  },
  extraReducers: (builder) => {
    // Fetch cash remittance summary
    builder
      .addCase(fetchCashRemittanceSummary.pending, (state) => {
        state.summaryLoading = true
        state.summaryError = null
        state.summarySuccess = false
      })
      .addCase(fetchCashRemittanceSummary.fulfilled, (state, action: PayloadAction<CashRemittanceSummary>) => {
        state.summaryLoading = false
        state.summarySuccess = true
        state.summaryError = null
        state.summary = action.payload
      })
      .addCase(fetchCashRemittanceSummary.rejected, (state, action) => {
        state.summaryLoading = false
        state.summarySuccess = false
        state.summaryError = action.payload as string
      })

    // Fetch cash remittance records
    builder
      .addCase(fetchCashRemittanceRecords.pending, (state) => {
        state.recordsLoading = true
        state.recordsError = null
        state.recordsSuccess = false
      })
      .addCase(fetchCashRemittanceRecords.fulfilled, (state, action: PayloadAction<CashRemittanceRecord[]>) => {
        state.recordsLoading = false
        state.recordsSuccess = true
        state.recordsError = null
        state.records = action.payload
      })
      .addCase(fetchCashRemittanceRecords.rejected, (state, action) => {
        state.recordsLoading = false
        state.recordsSuccess = false
        state.recordsError = action.payload as string
      })

    // Create cash remittance record
    builder
      .addCase(createCashRemittanceRecord.pending, (state) => {
        state.addRecordLoading = true
        state.addRecordError = null
        state.addRecordSuccess = false
      })
      .addCase(createCashRemittanceRecord.fulfilled, (state, action: PayloadAction<CashRemittanceRecord>) => {
        state.addRecordLoading = false
        state.addRecordSuccess = true
        state.addRecordError = null
        // Add the new record to the beginning of the records array
        state.records.unshift(action.payload)
      })
      .addCase(createCashRemittanceRecord.rejected, (state, action) => {
        state.addRecordLoading = false
        state.addRecordSuccess = false
        state.addRecordError = action.payload as string
      })
      // Add receipt to cash remittance record
      .addCase(addReceiptToCashRemittance.pending, (state) => {
        state.addReceiptLoading = true
        state.addReceiptError = null
        state.addReceiptSuccess = false
      })
      .addCase(addReceiptToCashRemittance.fulfilled, (state, action) => {
        state.addReceiptLoading = false
        state.addReceiptSuccess = true
        state.addReceiptError = null
        // Update the record in the records array
        const recordIndex = state.records.findIndex((record) => record.id === action.payload.id)
        if (recordIndex !== -1) {
          state.records[recordIndex] = action.payload
        }
      })
      .addCase(addReceiptToCashRemittance.rejected, (state, action) => {
        state.addReceiptLoading = false
        state.addReceiptSuccess = false
        state.addReceiptError = action.payload as string
      })
  },
})

export const { clearSummary, clearRecords, clearAddRecord, clearAddReceipt, clearError, resetCashRemittanceState } =
  cashRemittanceSlice.actions

export default cashRemittanceSlice.reducer
