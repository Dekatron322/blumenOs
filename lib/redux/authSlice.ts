import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_CONFIG, API_ENDPOINTS } from "lib/config/api"

// Interfaces
interface Tokens {
  accessToken: string
  refreshToken: string
  accessExpiry: string
  refreshExpiry: string
}

interface Status {
  value: number
  label: string
}

interface Country {
  id: number
  name: string
  callingCode: string
  abbreviation: string
  currency: null | string
}

interface Permission {
  id: number
  canViewUsers: boolean
  canManageUsers: boolean
  canManageAdmin: boolean
  canViewDashboard: boolean
  canViewTransactions: boolean
  canManageSystemSettings: boolean
}

interface Admin {
  id: number
  isActive: boolean
  isSuperAdmin: boolean
  permission: Permission
}

interface User {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  tag: string
  photo: string
  referralUrl: string
  dob: string
  email: string
  role: string
  status: Status
  isVerified: boolean
  country: Country
  admin: Admin
}

interface LoginResponse {
  tokens: Tokens
  user: User
  message: string
}

interface RefreshTokenResponse {
  tokens: {
    accessToken: string
    accessExpiry: string
  }
  message: string
}

interface LoginCredentials {
  username: string
  password: string
  appId: string
}

interface AuthState {
  user: User | null
  tokens: Tokens | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isRefreshing: boolean
}

// Configure axios instance
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
})

// Helper functions for localStorage
const loadAuthState = (): AuthState | undefined => {
  try {
    const serializedState = localStorage.getItem("authState")
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState) as AuthState
  } catch (err) {
    console.warn("Failed to load auth state from localStorage", err)
    return undefined
  }
}

const saveAuthState = (state: AuthState) => {
  try {
    const serializedState = JSON.stringify({
      user: state.user,
      tokens: state.tokens,
      isAuthenticated: state.isAuthenticated,
    })
    localStorage.setItem("authState", serializedState)
  } catch (err) {
    console.warn("Failed to save auth state to localStorage", err)
  }
}

// Check if token is expired
const isTokenExpired = (expiryDate: string): boolean => {
  return new Date() >= new Date(expiryDate)
}

// Refresh token function
export const refreshAccessToken = createAsyncThunk("auth/refreshToken", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { auth: AuthState }
    const refreshToken = state.auth.tokens?.refreshToken

    if (!refreshToken) {
      return rejectWithValue("No refresh token available")
    }

    const response = await api.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken,
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data)
    }
    return rejectWithValue(error.message)
  }
})

// Add request interceptor to inject token
api.interceptors.request.use(
  async (config) => {
    const authState = loadAuthState()

    if (authState?.tokens?.accessToken) {
      // Check if access token is expired
      if (isTokenExpired(authState.tokens.accessExpiry)) {
        try {
          // Attempt to refresh the token
          const response = await api.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
            refreshToken: authState.tokens.refreshToken,
          })

          // Update the stored tokens
          const updatedTokens = {
            ...authState.tokens,
            accessToken: response.data.tokens.accessToken,
            accessExpiry: response.data.tokens.accessExpiry,
          }

          // Save the updated tokens
          const updatedState = {
            ...authState,
            tokens: updatedTokens,
          }
          saveAuthState(updatedState)

          // Use the new access token
          config.headers.Authorization = `Bearer ${response.data.tokens.accessToken}`
        } catch (error) {
          // Refresh failed, redirect to login or handle accordingly
          console.error("Token refresh failed:", error)
          // You might want to dispatch a logout action here
        }
      } else {
        // Token is still valid, use it
        config.headers.Authorization = `Bearer ${authState.tokens.accessToken}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const authState = loadAuthState()

      if (authState?.tokens?.refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await api.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
            refreshToken: authState.tokens.refreshToken,
          })

          // Update the stored tokens
          const updatedTokens = {
            ...authState.tokens,
            accessToken: response.data.tokens.accessToken,
            accessExpiry: response.data.tokens.accessExpiry,
          }

          // Save the updated tokens
          const updatedState = {
            ...authState,
            tokens: updatedTokens,
          }
          saveAuthState(updatedState)
          // Update the authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.tokens.accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, redirect to login or handle accordingly
          console.error("Token refresh failed:", refreshError)
          // You might want to dispatch a logout action here
        }
      }
    }

    return Promise.reject(error)
  }
)

// Load initial state from localStorage if available
const persistedState = loadAuthState()
const initialState: AuthState = persistedState || {
  user: null,
  tokens: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isRefreshing: false,
}

export const loginUser = createAsyncThunk("auth/login", async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return response.data
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data)
    }
    return rejectWithValue(error.message)
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.tokens = null
      state.isAuthenticated = false
      state.error = null
      state.loading = false
      state.isRefreshing = false
      localStorage.removeItem("authState")
    },
    clearError: (state) => {
      state.error = null
    },
    initializeAuth: (state) => {
      const persistedState = loadAuthState()
      if (persistedState) {
        return { ...state, ...persistedState }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.tokens = action.payload.tokens
        saveAuthState(state)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Login failed"
      })
      .addCase(refreshAccessToken.pending, (state) => {
        state.isRefreshing = true
        state.error = null
      })
      .addCase(refreshAccessToken.fulfilled, (state, action: PayloadAction<RefreshTokenResponse>) => {
        state.isRefreshing = false
        if (state.tokens) {
          state.tokens.accessToken = action.payload.tokens.accessToken
          state.tokens.accessExpiry = action.payload.tokens.accessExpiry
          saveAuthState(state)
        }
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isRefreshing = false
        state.error = (action.payload as string) || "Token refresh failed"
        // Optionally logout the user if refresh fails
        state.user = null
        state.tokens = null
        state.isAuthenticated = false
        localStorage.removeItem("authState")
      })
  },
})

export const { logout, clearError, initializeAuth } = authSlice.actions
export default authSlice.reducer
