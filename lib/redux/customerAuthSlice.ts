import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces
interface RequestOtpRequest {
  accountNumber: string
  phoneNumber: string
  fingerprint: string
}

interface RequestOtpResponse {
  isSuccess: boolean
  message: string
}

interface VerifyOtpRequest {
  accountNumber: string
  phoneNumber: string
  fingerprint: string
  otp: string
}

interface CustomerTokens {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

interface Customer {
  id: number
  customerNumber: number
  accountNumber: string
  autoNumber: string
  isCustomerNew: boolean
  isPostEnumerated: boolean
  statusCode: string
  isReadyforExtraction: boolean
  fullName: string
  phoneNumber: string
  employeeNo: string
  salesRepPhone: string
  phoneOffice: string
  gender: string
  email: string
  status: string
  isSuspended: boolean
  lastLoginAt: string
  suspensionReason: string
  suspendedAt: string
  distributionSubstationId: number
  distributionSubstationCode: string
  feederName: string
  areaOfficeName: string
  companyName: string
  address: string
  addressTwo: string
  mapName: string
  type: string
  city: string
  provinceId: number
  provinceName: string
  lga: string
  serviceCenterId: number
  serviceCenterName: string
  latitude: number
  longitude: number
  tariffRate: number
  tariffId: number
  tariff: any
  isPPM: boolean
  isMeteredPostpaid: boolean
  isMD: boolean
  isUrban: boolean
  isHRB: boolean
  isCustomerAccGovt: boolean
  comment: string
  storedAverage: number
  totalMonthlyVend: number
  totalMonthlyDebt: number
  totalLifetimeDebit: number
  totalLifetimeCredit: number
  customerOutstandingDebtBalance: number
  customerOutstandingCreditBalance: number
  customerOutstandingBalance: number
  customerOutstandingBalanceLabel: string
  salesRepUserId: number
  technicalEngineerUserId: number
  meters: any[]
  currentTariffOverride: any
  currentVatOverride: any
}

interface VerifyOtpResponse {
  isSuccess: boolean
  message: string
  data: {
    accessToken: string
    accessTokenExpiresAt: string
    refreshToken: string
    refreshTokenExpiresAt: string
    customer: Customer
  }
}

interface RefreshTokenRequest {
  refreshToken: string
}

interface RefreshTokenResponse {
  isSuccess: boolean
  message: string
  data: {
    accessToken: string
    accessTokenExpiresAt: string
    refreshToken: string
    refreshTokenExpiresAt: string
    customer: Customer
  }
}

// Define the structure for stored auth state
interface StoredCustomerAuthState {
  tokens?: CustomerTokens
  customer?: Customer
  isAuthenticated?: boolean
}

export interface CustomerAuthState {
  isRequestingOtp: boolean
  otpRequestError: string | null
  otpRequestSuccess: boolean
  lastOtpRequestMessage: string | null
  isVerifyingOtp: boolean
  otpVerificationError: string | null
  otpVerificationSuccess: boolean
  lastOtpVerificationMessage: string | null
  isRefreshingToken: boolean
  tokenRefreshError: string | null
  tokenRefreshSuccess: boolean
  lastTokenRefreshMessage: string | null
  isAuthenticated: boolean
  customer: Customer | null
  tokens: CustomerTokens | null
}

const initialState: CustomerAuthState = {
  isRequestingOtp: false,
  otpRequestError: null,
  otpRequestSuccess: false,
  lastOtpRequestMessage: null,
  isVerifyingOtp: false,
  otpVerificationError: null,
  otpVerificationSuccess: false,
  lastOtpVerificationMessage: null,
  isRefreshingToken: false,
  tokenRefreshError: null,
  tokenRefreshSuccess: false,
  lastTokenRefreshMessage: null,
  isAuthenticated: false,
  customer: null,
  tokens: null,
}

// Helper functions for localStorage
const loadCustomerAuthState = (): StoredCustomerAuthState | undefined => {
  if (typeof window === "undefined") {
    return undefined
  }
  try {
    const serializedState = localStorage.getItem("customerAuthState")
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState) as StoredCustomerAuthState
  } catch (err) {
    console.warn("Failed to load customer auth state from localStorage", err)
    return undefined
  }
}

const saveCustomerAuthState = (state: CustomerAuthState) => {
  if (typeof window === "undefined") {
    return
  }
  try {
    const serializedState = JSON.stringify({
      customer: state.customer,
      tokens: state.tokens,
      isAuthenticated: state.isAuthenticated,
    })
    localStorage.setItem("customerAuthState", serializedState)
  } catch (err) {
    console.warn("Failed to save customer auth state to localStorage", err)
  }
}

const clearCustomerAuthState = () => {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem("customerAuthState")
  } catch (err) {
    console.warn("Failed to clear customer auth state from localStorage", err)
  }
}

// Load initial state from localStorage if available
const persistedState = loadCustomerAuthState()
const initialStateWithPersistence: CustomerAuthState = {
  ...initialState,
  customer: persistedState?.customer || null,
  tokens: persistedState?.tokens || null,
  isAuthenticated: persistedState?.isAuthenticated || false,
}

// Request OTP thunk
export const requestCustomerOtp = createAsyncThunk(
  "customerAuth/requestOtp",
  async (otpData: RequestOtpRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<RequestOtpResponse>(buildApiUrl(API_ENDPOINTS.CUSTOMER_AUTH.REQUEST_OTP), otpData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "OTP request failed")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "OTP request failed")
      }
      return rejectWithValue(error.message || "Network error during OTP request")
    }
  }
)

// Verify OTP thunk
export const verifyCustomerOtp = createAsyncThunk(
  "customerAuth/verifyOtp",
  async (otpData: VerifyOtpRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<VerifyOtpResponse>(buildApiUrl(API_ENDPOINTS.CUSTOMER_AUTH.VERIFY_OTP), otpData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "OTP verification failed")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "OTP verification failed")
      }
      return rejectWithValue(error.message || "Network error during OTP verification")
    }
  }
)

// Initialize customer auth state from localStorage
export const initializeCustomerAuth = createAsyncThunk("customerAuth/initialize", async (_, { dispatch }) => {
  try {
    const storedState = loadCustomerAuthState()
    if (storedState?.tokens?.accessToken) {
      // Validate token by making a test request or checking expiry
      // For now, just return the stored state
      return storedState
    }
    return null
  } catch (error) {
    console.warn("Failed to initialize customer auth:", error)
    clearCustomerAuthState()
    return null
  }
})

export const refreshCustomerToken = createAsyncThunk(
  "customerAuth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { customerAuth: CustomerAuthState }
      const refreshToken = state.customerAuth.tokens?.refreshToken

      if (!refreshToken) {
        return rejectWithValue("No refresh token available")
      }

      const response = await api.post<RefreshTokenResponse>(buildApiUrl(API_ENDPOINTS.CUSTOMER_AUTH.REFRESH_TOKEN), {
        refreshToken,
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Token refresh failed")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Token refresh failed")
      }
      return rejectWithValue(error.message || "Network error during token refresh")
    }
  }
)

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState: initialStateWithPersistence,
  reducers: {
    clearOtpRequestStatus: (state) => {
      state.otpRequestError = null
      state.otpRequestSuccess = false
      state.lastOtpRequestMessage = null
    },
    clearOtpVerificationStatus: (state) => {
      state.otpVerificationError = null
      state.otpVerificationSuccess = false
      state.lastOtpVerificationMessage = null
    },
    clearTokenRefreshStatus: (state) => {
      state.tokenRefreshError = null
      state.tokenRefreshSuccess = false
      state.lastTokenRefreshMessage = null
    },
    resetCustomerAuth: (state) => {
      state.isRequestingOtp = false
      state.otpRequestError = null
      state.otpRequestSuccess = false
      state.lastOtpRequestMessage = null
      state.isVerifyingOtp = false
      state.otpVerificationError = null
      state.otpVerificationSuccess = false
      state.lastOtpVerificationMessage = null
      state.isRefreshingToken = false
      state.tokenRefreshError = null
      state.tokenRefreshSuccess = false
      state.lastTokenRefreshMessage = null
      state.isAuthenticated = false
      state.customer = null
      state.tokens = null
      clearCustomerAuthState()
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize customer auth
      .addCase(initializeCustomerAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = action.payload.isAuthenticated || false
          state.customer = action.payload.customer || null
          state.tokens = action.payload.tokens || null
        }
      })
      // Request OTP cases
      .addCase(requestCustomerOtp.pending, (state) => {
        state.isRequestingOtp = true
        state.otpRequestError = null
        state.otpRequestSuccess = false
        state.lastOtpRequestMessage = null
      })
      .addCase(requestCustomerOtp.fulfilled, (state, action: PayloadAction<RequestOtpResponse>) => {
        state.isRequestingOtp = false
        state.otpRequestSuccess = true
        state.otpRequestError = null
        state.lastOtpRequestMessage = action.payload.message
      })
      .addCase(requestCustomerOtp.rejected, (state, action) => {
        state.isRequestingOtp = false
        state.otpRequestError = (action.payload as string) || "OTP request failed"
        state.otpRequestSuccess = false
        state.lastOtpRequestMessage = null
      })
      // Verify OTP cases
      .addCase(verifyCustomerOtp.pending, (state) => {
        state.isVerifyingOtp = true
        state.otpVerificationError = null
        state.otpVerificationSuccess = false
        state.lastOtpVerificationMessage = null
      })
      .addCase(verifyCustomerOtp.fulfilled, (state, action: PayloadAction<VerifyOtpResponse>) => {
        state.isVerifyingOtp = false
        state.otpVerificationSuccess = true
        state.otpVerificationError = null
        state.lastOtpVerificationMessage = action.payload.message
        state.isAuthenticated = true
        state.customer = action.payload.data.customer
        state.tokens = {
          accessToken: action.payload.data.accessToken,
          accessTokenExpiresAt: action.payload.data.accessTokenExpiresAt,
          refreshToken: action.payload.data.refreshToken,
          refreshTokenExpiresAt: action.payload.data.refreshTokenExpiresAt,
        }
        saveCustomerAuthState(state)
      })
      .addCase(verifyCustomerOtp.rejected, (state, action) => {
        state.isVerifyingOtp = false
        state.otpVerificationError = (action.payload as string) || "OTP verification failed"
        state.otpVerificationSuccess = false
        state.lastOtpVerificationMessage = null
        state.isAuthenticated = false
        state.customer = null
        state.tokens = null
        clearCustomerAuthState()
      })
      // Refresh token cases
      .addCase(refreshCustomerToken.pending, (state) => {
        state.isRefreshingToken = true
        state.tokenRefreshError = null
        state.tokenRefreshSuccess = false
        state.lastTokenRefreshMessage = null
      })
      .addCase(refreshCustomerToken.fulfilled, (state, action: PayloadAction<RefreshTokenResponse>) => {
        state.isRefreshingToken = false
        state.tokenRefreshSuccess = true
        state.tokenRefreshError = null
        state.lastTokenRefreshMessage = action.payload.message
        // Update tokens with new ones from refresh response
        state.tokens = {
          accessToken: action.payload.data.accessToken,
          accessTokenExpiresAt: action.payload.data.accessTokenExpiresAt,
          refreshToken: action.payload.data.refreshToken,
          refreshTokenExpiresAt: action.payload.data.refreshTokenExpiresAt,
        }
        // Update customer data if provided
        if (action.payload.data.customer) {
          state.customer = action.payload.data.customer
        }
        saveCustomerAuthState(state)
      })
      .addCase(refreshCustomerToken.rejected, (state, action) => {
        state.isRefreshingToken = false
        state.tokenRefreshError = (action.payload as string) || "Token refresh failed"
        state.tokenRefreshSuccess = false
        state.lastTokenRefreshMessage = null
        // On refresh failure, clear authentication state
        state.isAuthenticated = false
        state.customer = null
        state.tokens = null
        clearCustomerAuthState()
      })
  },
})

export const { clearOtpRequestStatus, clearOtpVerificationStatus, clearTokenRefreshStatus, resetCustomerAuth } =
  customerAuthSlice.actions
export default customerAuthSlice.reducer
