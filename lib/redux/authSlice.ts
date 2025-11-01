import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_CONFIG, API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces
interface Tokens {
  accessToken: string
  refreshToken: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  region: string
  businessUnit: string
  roles: string[]
  status: string
}

interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    refreshToken: string
    user: User
  }
}

interface RefreshTokenResponse {
  success: boolean
  message: string
  data: {
    token: string
    refreshToken: string
  }
}

interface LoginCredentials {
  email: string
  password: string
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

// Check if token is expired (you might want to decode JWT to check expiration)
const isTokenExpired = (token: string): boolean => {
  try {
    const [, payloadPart = ""] = token.split(".")
    const payload = JSON.parse(atob(payloadPart)) as { exp?: number }
    if (typeof payload.exp !== "number") return true
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// Refresh token function
export const refreshAccessToken = createAsyncThunk("auth/refreshToken", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { auth: AuthState }
    const refreshToken = state.auth.tokens?.refreshToken

    if (!refreshToken) {
      return rejectWithValue("No refresh token available")
    }

    const response = await api.post<RefreshTokenResponse>(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN), {
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
  (config) => {
    const authState = loadAuthState()

    if (authState?.tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${authState.tokens.accessToken}`
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
          const response = await api.post<RefreshTokenResponse>(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN), {
            refreshToken: authState.tokens.refreshToken,
          })

          // Update the stored tokens
          const updatedTokens = {
            accessToken: response.data.data.token,
            refreshToken: response.data.data.refreshToken,
          }

          // Save the updated tokens
          const updatedState = {
            ...authState,
            tokens: updatedTokens,
          }
          saveAuthState(updatedState)

          // Update the authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, redirect to login or handle accordingly
          console.error("Token refresh failed:", refreshError)
          // Clear auth state on refresh failure
          localStorage.removeItem("authState")
          window.location.href = "/login"
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
    const response = await api.post<LoginResponse>(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), credentials)
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
        state.user = action.payload.data.user
        state.tokens = {
          accessToken: action.payload.data.token,
          refreshToken: action.payload.data.refreshToken,
        }
        saveAuthState(state)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as any)?.message || "Login failed"
      })
      .addCase(refreshAccessToken.pending, (state) => {
        state.isRefreshing = true
        state.error = null
      })
      .addCase(refreshAccessToken.fulfilled, (state, action: PayloadAction<RefreshTokenResponse>) => {
        state.isRefreshing = false
        if (state.tokens) {
          state.tokens.accessToken = action.payload.data.token
          state.tokens.refreshToken = action.payload.data.refreshToken
          saveAuthState(state)
        }
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isRefreshing = false
        state.error = (action.payload as any)?.message || "Token refresh failed"
        // Logout the user if refresh fails
        state.user = null
        state.tokens = null
        state.isAuthenticated = false
        localStorage.removeItem("authState")
      })
  },
})

export const { logout, clearError, initializeAuth } = authSlice.actions
export default authSlice.reducer
