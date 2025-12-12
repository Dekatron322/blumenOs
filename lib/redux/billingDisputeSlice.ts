import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Request body for creating a billing dispute
export interface CreateBillingDisputeRequest {
  billId: number
  reason: string
  details: string
  fileUrls: string[]
}

// Payment item in dispute response
export interface DisputePaymentItem {
  id: number
  reference: string
  latitude: number
  longitude: number
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | string
  status: "Pending" | "Confirmed" | "Failed" | "Reversed" | string
  collectorType: "Customer" | "Agent" | "Vendor" | "Staff" | string
  amount: number
  amountApplied: number
  overPaymentAmount: number
  outstandingAfterPayment: number
  outstandingBeforePayment: number
  currency: string
  paidAtUtc: string
  confirmedAtUtc: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  postpaidBillId: number
  postpaidBillPeriod: string
  billTotalDue: number
  vendorId: number
  vendorName: string
  agentId: number
  agentCode: string
  agentName: string
  areaOfficeName: string
  distributionSubstationCode: string
  feederName: string
  paymentTypeId: number
  paymentTypeName: string
}

// Dispute data in response
export interface BillingDisputeData {
  id: number
  billId: number
  customerId: number
  customerName: string
  customerAccountNumber: string
  status: number
  reason: string
  details: string
  raisedByUserId: number
  raisedByName: string
  raisedAtUtc: string
  resolvedByUserId: number | null
  resolvedByName: string | null
  resolvedAtUtc: string | null
  resolutionNotes: string | null
  payments: DisputePaymentItem[]
  fileUrls: string[]
}

// API response wrapper
export interface BillingDisputeResponse {
  isSuccess: boolean
  message: string
  data: BillingDisputeData
}

// Slice state
interface BillingDisputeState {
  creating: boolean
  createError: string | null
  createSuccess: boolean
  dispute: BillingDisputeData | null
}

const initialState: BillingDisputeState = {
  creating: false,
  createError: null,
  createSuccess: false,
  dispute: null,
}

// Thunk for creating a billing dispute
export const createBillingDispute = createAsyncThunk(
  "billingDispute/createBillingDispute",
  async (request: CreateBillingDisputeRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<BillingDisputeResponse>(
        buildApiUrl(API_ENDPOINTS.BILLING_DISPUTE.CREATE_DISPUTE),
        request
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create billing dispute")
      }

      if (!response.data.data) {
        return rejectWithValue("Billing dispute data not found")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create billing dispute")
      }
      return rejectWithValue(error.message || "Network error during billing dispute creation")
    }
  }
)

const billingDisputeSlice = createSlice({
  name: "billingDispute",
  initialState,
  reducers: {
    clearBillingDisputeState: (state) => {
      state.creating = false
      state.createError = null
      state.createSuccess = false
      state.dispute = null
    },
    clearBillingDisputeError: (state) => {
      state.createError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBillingDispute.pending, (state) => {
        state.creating = true
        state.createError = null
        state.createSuccess = false
        state.dispute = null
      })
      .addCase(createBillingDispute.fulfilled, (state, action: PayloadAction<BillingDisputeResponse>) => {
        state.creating = false
        state.createSuccess = true
        state.dispute = action.payload.data
        state.createError = null
      })
      .addCase(createBillingDispute.rejected, (state, action) => {
        state.creating = false
        state.createSuccess = false
        state.dispute = null
        state.createError = (action.payload as string) || "Failed to create billing dispute"
      })
  },
})

export const { clearBillingDisputeState, clearBillingDisputeError } = billingDisputeSlice.actions

export default billingDisputeSlice.reducer
