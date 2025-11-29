// src/lib/redux/paymentTypeSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for PaymentType
export interface PaymentType {
  id: number
  name: string
  description: string
  isActive: boolean
}

export interface PaymentTypesResponse {
  isSuccess: boolean
  message: string
  data: PaymentType[]
}

export interface PaymentTypeRequestParams {
  // You can add any future parameters here if needed
  // For now, the endpoint doesn't require any parameters
}

// PaymentType State
interface PaymentTypeState {
  // PaymentTypes list state
  paymentTypes: PaymentType[]
  loading: boolean
  error: string | null
  success: boolean

  // Current paymentType state (for viewing/editing)
  currentPaymentType: PaymentType | null
  currentPaymentTypeLoading: boolean
  currentPaymentTypeError: string | null
}

// Initial state
const initialState: PaymentTypeState = {
  paymentTypes: [],
  loading: false,
  error: null,
  success: false,
  currentPaymentType: null,
  currentPaymentTypeLoading: false,
  currentPaymentTypeError: null,
}

// Async thunks
export const fetchPaymentTypes = createAsyncThunk("paymentTypes/fetchPaymentTypes", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<PaymentTypesResponse>(buildApiUrl(API_ENDPOINTS.PAYMENT_TYPE.GET))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch payment types")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch payment types")
    }
    return rejectWithValue(error.message || "Network error during payment types fetch")
  }
})

// PaymentType slice
const paymentTypeSlice = createSlice({
  name: "paymentTypes",
  initialState,
  reducers: {
    // Clear paymentTypes state
    clearPaymentTypes: (state) => {
      state.paymentTypes = []
      state.error = null
      state.success = false
    },

    // Clear errors
    clearError: (state) => {
      state.error = null
      state.currentPaymentTypeError = null
    },

    // Clear current paymentType
    clearCurrentPaymentType: (state) => {
      state.currentPaymentType = null
      state.currentPaymentTypeError = null
    },

    // Reset paymentType state
    resetPaymentTypeState: (state) => {
      state.paymentTypes = []
      state.loading = false
      state.error = null
      state.success = false
      state.currentPaymentType = null
      state.currentPaymentTypeLoading = false
      state.currentPaymentTypeError = null
    },

    // Set current paymentType (for when we get paymentType data from other sources)
    setCurrentPaymentType: (state, action: PayloadAction<PaymentType>) => {
      state.currentPaymentType = action.payload
    },

    // Update paymentType in list (for optimistic updates)
    updatePaymentTypeInList: (state, action: PayloadAction<PaymentType>) => {
      const index = state.paymentTypes.findIndex((paymentType) => paymentType.id === action.payload.id)
      if (index !== -1) {
        state.paymentTypes[index] = action.payload
      }
    },

    // Add paymentType to list
    addPaymentTypeToList: (state, action: PayloadAction<PaymentType>) => {
      state.paymentTypes.unshift(action.payload)
    },

    // Remove paymentType from list
    removePaymentTypeFromList: (state, action: PayloadAction<number>) => {
      state.paymentTypes = state.paymentTypes.filter((paymentType) => paymentType.id !== action.payload)
    },

    // Toggle paymentType active status
    togglePaymentTypeActiveStatus: (state, action: PayloadAction<number>) => {
      const paymentType = state.paymentTypes.find((pt) => pt.id === action.payload)
      if (paymentType) {
        paymentType.isActive = !paymentType.isActive
      }
      if (state.currentPaymentType && state.currentPaymentType.id === action.payload) {
        state.currentPaymentType.isActive = !state.currentPaymentType.isActive
      }
    },

    // Filter active payment types
    setActivePaymentTypes: (state) => {
      state.paymentTypes = state.paymentTypes.filter((paymentType) => paymentType.isActive)
    },

    // Filter inactive payment types
    setInactivePaymentTypes: (state) => {
      state.paymentTypes = state.paymentTypes.filter((paymentType) => !paymentType.isActive)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch paymentTypes cases
      .addCase(fetchPaymentTypes.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchPaymentTypes.fulfilled, (state, action: PayloadAction<PaymentTypesResponse>) => {
        state.loading = false
        state.success = true
        state.paymentTypes = action.payload.data
        state.error = null
      })
      .addCase(fetchPaymentTypes.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch payment types"
        state.success = false
        state.paymentTypes = []
      })
  },
})

export const {
  clearPaymentTypes,
  clearError,
  clearCurrentPaymentType,
  resetPaymentTypeState,
  setCurrentPaymentType,
  updatePaymentTypeInList,
  addPaymentTypeToList,
  removePaymentTypeFromList,
  togglePaymentTypeActiveStatus,
  setActivePaymentTypes,
  setInactivePaymentTypes,
} = paymentTypeSlice.actions

export default paymentTypeSlice.reducer
