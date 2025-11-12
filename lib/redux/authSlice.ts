import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_CONFIG, API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces
interface Role {
  roleId: number
  name: string
  slug: string
  category: string
}

interface Privilege {
  key: string
  name: string
  category: string
  actions: string[]
}

interface User {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  accountId: string
  isActive: boolean
  mustChangePassword: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  profilePicture: string | null
  roles: Role[]
  privileges: Privilege[]
}

interface Tokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

interface LoginResponse {
  isSuccess: boolean
  message: string
  data: {
    accessToken: string
    expiresAt: string
    refreshToken: string
    user: User
    mustChangePassword: boolean
  }
}

interface RefreshTokenResponse {
  isSuccess: boolean
  message: string
  data: {
    accessToken: string
    expiresAt: string
    refreshToken: string
    user: User
    mustChangePassword: boolean
  }
}

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

interface ChangePasswordResponse {
  isSuccess: boolean
  message: string
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
  mustChangePassword: boolean
  isChangingPassword: boolean
  changePasswordError: string | null
  changePasswordSuccess: boolean
}

// Configure axios instance
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Helper functions for localStorage
const loadAuthState = (): Partial<AuthState> | undefined => {
  try {
    const serializedState = localStorage.getItem("authState")
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState) as Partial<AuthState>
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
      mustChangePassword: state.mustChangePassword,
    })
    localStorage.setItem("authState", serializedState)
  } catch (err) {
    console.warn("Failed to save auth state to localStorage", err)
  }
}

const clearAuthState = () => {
  try {
    localStorage.removeItem("authState")
  } catch (err) {
    console.warn("Failed to clear auth state from localStorage", err)
  }
}

// Check if token is expired
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
})

// Change password function
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<ChangePasswordResponse>(
        buildApiUrl(API_ENDPOINTS.AUTH.CHANGE_PASSWORD),
        passwordData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Password change failed")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Password change failed")
      }
      return rejectWithValue(error.message || "Network error during password change")
    }
  }
)

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

          if (response.data.isSuccess) {
            // Update the stored tokens
            const updatedTokens = {
              accessToken: response.data.data.accessToken,
              refreshToken: response.data.data.refreshToken,
              expiresAt: response.data.data.expiresAt,
            }

            // Save the updated tokens
            const updatedState = {
              ...authState,
              tokens: updatedTokens,
              mustChangePassword: response.data.data.mustChangePassword,
            } as AuthState
            saveAuthState(updatedState)

            // Update the authorization header and retry the original request
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login or handle accordingly
          console.error("Token refresh failed:", refreshError)
          // Clear auth state on refresh failure
          clearAuthState()
          window.location.href = "/"
        }
      } else {
        // No refresh token available, redirect to login
        clearAuthState()
        window.location.href = "/"
      }
    }

    return Promise.reject(error)
  }
)

// Load initial state from localStorage if available
const persistedState = loadAuthState()
const initialState: AuthState = {
  user: persistedState?.user || null,
  tokens: persistedState?.tokens || null,
  loading: false,
  error: null,
  isAuthenticated: persistedState?.isAuthenticated || false,
  isRefreshing: false,
  mustChangePassword: persistedState?.mustChangePassword || false,
  isChangingPassword: false,
  changePasswordError: null,
  changePasswordSuccess: false,
}

export const loginUser = createAsyncThunk("auth/", async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const response = await api.post<LoginResponse>(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), credentials)

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Login failed")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Login failed")
    }
    return rejectWithValue(error.message || "Network error during login")
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
      state.mustChangePassword = false
      state.isChangingPassword = false
      state.changePasswordError = null
      state.changePasswordSuccess = false
      clearAuthState()
    },
    clearError: (state) => {
      state.error = null
      state.changePasswordError = null
    },
    clearChangePasswordStatus: (state) => {
      state.changePasswordError = null
      state.changePasswordSuccess = false
    },
    initializeAuth: (state) => {
      const persistedState = loadAuthState()
      if (persistedState) {
        state.user = persistedState.user || null
        state.tokens = persistedState.tokens || null
        state.isAuthenticated = persistedState.isAuthenticated || false
        state.mustChangePassword = persistedState.mustChangePassword || false
      }
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        saveAuthState(state)
      }
    },
    resetMustChangePassword: (state) => {
      state.mustChangePassword = false
      saveAuthState(state)
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.data.user
        state.tokens = {
          accessToken: action.payload.data.accessToken,
          refreshToken: action.payload.data.refreshToken,
          expiresAt: action.payload.data.expiresAt,
        }
        state.mustChangePassword = action.payload.data.mustChangePassword
        state.error = null
        saveAuthState(state)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Login failed"
        state.isAuthenticated = false
        state.user = null
        state.tokens = null
        state.mustChangePassword = false
      })
      // Refresh token cases
      .addCase(refreshAccessToken.pending, (state) => {
        state.isRefreshing = true
        state.error = null
      })
      .addCase(refreshAccessToken.fulfilled, (state, action: PayloadAction<RefreshTokenResponse>) => {
        state.isRefreshing = false
        if (state.tokens) {
          state.tokens.accessToken = action.payload.data.accessToken
          state.tokens.refreshToken = action.payload.data.refreshToken
          state.tokens.expiresAt = action.payload.data.expiresAt
          state.mustChangePassword = action.payload.data.mustChangePassword
          state.error = null
          saveAuthState(state)
        }
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isRefreshing = false
        state.error = (action.payload as string) || "Token refresh failed"
        // Logout the user if refresh fails
        state.user = null
        state.tokens = null
        state.isAuthenticated = false
        state.mustChangePassword = false
        clearAuthState()
      })
      // Change password cases
      .addCase(changePassword.pending, (state) => {
        state.isChangingPassword = true
        state.changePasswordError = null
        state.changePasswordSuccess = false
      })
      .addCase(changePassword.fulfilled, (state, action: PayloadAction<ChangePasswordResponse>) => {
        state.isChangingPassword = false
        state.changePasswordSuccess = true
        state.changePasswordError = null

        // If the user was required to change password, update the state
        if (state.mustChangePassword) {
          state.mustChangePassword = false
          saveAuthState(state)
        }
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isChangingPassword = false
        state.changePasswordError = (action.payload as string) || "Password change failed"
        state.changePasswordSuccess = false
      })
  },
})

export const {
  logout,
  clearError,
  clearChangePasswordStatus,
  initializeAuth,
  updateUserProfile,
  resetMustChangePassword,
} = authSlice.actions
export default authSlice.reducer
