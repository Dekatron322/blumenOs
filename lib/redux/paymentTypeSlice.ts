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

export interface PaymentTypeResponse {
  isSuccess: boolean
  message: string
  data: PaymentType
}

export interface DeletePaymentTypeResponse {
  isSuccess: boolean
  message: string
  data: null
}

export interface CreatePaymentTypeRequest {
  name: string
  description: string
  isActive: boolean
}

export interface UpdatePaymentTypeRequest {
  id: number
  name: string
  description: string
  isActive: boolean
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

  // Operation states
  creating: boolean
  createError: string | null
  createSuccess: boolean

  updating: boolean
  updateError: string | null
  updateSuccess: boolean

  deleting: boolean
  deleteError: string | null
  deleteSuccess: boolean
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
  creating: false,
  createError: null,
  createSuccess: false,
  updating: false,
  updateError: null,
  updateSuccess: false,
  deleting: false,
  deleteError: null,
  deleteSuccess: false,
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

export const createPaymentType = createAsyncThunk(
  "paymentTypes/createPaymentType",
  async (paymentTypeData: CreatePaymentTypeRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<PaymentTypeResponse>(
        buildApiUrl(API_ENDPOINTS.PAYMENT_TYPE.CREATE),
        paymentTypeData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to create payment type")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to create payment type")
      }
      return rejectWithValue(error.message || "Network error during payment type creation")
    }
  }
)

export const updatePaymentType = createAsyncThunk(
  "paymentTypes/updatePaymentType",
  async (paymentTypeData: UpdatePaymentTypeRequest, { rejectWithValue }) => {
    try {
      // Extract id from the request data for the URL
      const { id, ...updateData } = paymentTypeData

      const response = await api.put<PaymentTypeResponse>(
        buildApiUrl(API_ENDPOINTS.PAYMENT_TYPE.UPDATE.replace("{id}", id.toString())),
        updateData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update payment type")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update payment type")
      }
      return rejectWithValue(error.message || "Network error during payment type update")
    }
  }
)

export const deletePaymentType = createAsyncThunk(
  "paymentTypes/deletePaymentType",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.delete<DeletePaymentTypeResponse>(
        buildApiUrl(API_ENDPOINTS.PAYMENT_TYPE.DELETE.replace("{id}", id.toString()))
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to delete payment type")
      }

      return { id, ...response.data }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to delete payment type")
      }
      return rejectWithValue(error.message || "Network error during payment type deletion")
    }
  }
)

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
      state.createError = null
      state.updateError = null
      state.deleteError = null
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
      state.creating = false
      state.createError = null
      state.createSuccess = false
      state.updating = false
      state.updateError = null
      state.updateSuccess = false
      state.deleting = false
      state.deleteError = null
      state.deleteSuccess = false
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

    // Reset create state
    resetCreateState: (state) => {
      state.creating = false
      state.createError = null
      state.createSuccess = false
    },

    // Reset update state
    resetUpdateState: (state) => {
      state.updating = false
      state.updateError = null
      state.updateSuccess = false
    },

    // Reset delete state
    resetDeleteState: (state) => {
      state.deleting = false
      state.deleteError = null
      state.deleteSuccess = false
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

      // Create paymentType cases
      .addCase(createPaymentType.pending, (state) => {
        state.creating = true
        state.createError = null
        state.createSuccess = false
      })
      .addCase(createPaymentType.fulfilled, (state, action: PayloadAction<PaymentTypeResponse>) => {
        state.creating = false
        state.createSuccess = true
        // Add the new payment type to the beginning of the list
        state.paymentTypes.unshift(action.payload.data)
        // Set it as current payment type
        state.currentPaymentType = action.payload.data
      })
      .addCase(createPaymentType.rejected, (state, action) => {
        state.creating = false
        state.createError = (action.payload as string) || "Failed to create payment type"
        state.createSuccess = false
      })

      // Update paymentType cases
      .addCase(updatePaymentType.pending, (state) => {
        state.updating = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updatePaymentType.fulfilled, (state, action: PayloadAction<PaymentTypeResponse>) => {
        state.updating = false
        state.updateSuccess = true

        const updatedPaymentType = action.payload.data

        // Update payment type in the list
        const index = state.paymentTypes.findIndex((paymentType) => paymentType.id === updatedPaymentType.id)
        if (index !== -1) {
          state.paymentTypes[index] = updatedPaymentType
        }

        // Update current payment type if it's the one being edited
        if (state.currentPaymentType && state.currentPaymentType.id === updatedPaymentType.id) {
          state.currentPaymentType = updatedPaymentType
        }
      })
      .addCase(updatePaymentType.rejected, (state, action) => {
        state.updating = false
        state.updateError = (action.payload as string) || "Failed to update payment type"
        state.updateSuccess = false
      })

      // Delete paymentType cases
      .addCase(deletePaymentType.pending, (state) => {
        state.deleting = true
        state.deleteError = null
        state.deleteSuccess = false
      })
      .addCase(deletePaymentType.fulfilled, (state, action) => {
        state.deleting = false
        state.deleteSuccess = true

        const deletedId = action.payload.id

        // Remove payment type from the list
        state.paymentTypes = state.paymentTypes.filter((paymentType) => paymentType.id !== deletedId)

        // Clear current payment type if it's the one being deleted
        if (state.currentPaymentType && state.currentPaymentType.id === deletedId) {
          state.currentPaymentType = null
        }
      })
      .addCase(deletePaymentType.rejected, (state, action) => {
        state.deleting = false
        state.deleteError = (action.payload as string) || "Failed to delete payment type"
        state.deleteSuccess = false
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
  resetCreateState,
  resetUpdateState,
  resetDeleteState,
} = paymentTypeSlice.actions

export default paymentTypeSlice.reducer
