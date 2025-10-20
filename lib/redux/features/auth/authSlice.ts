// src/lib/redux/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface AuthState {
  token: string | null
  user: { username: string } | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

function isAuthState(obj: any): obj is AuthState {
  return (
    (obj.token === null || typeof obj.token === "string") &&
    (obj.user === null ||
      (typeof obj.user === "object" && obj.user !== null && typeof obj.user.username === "string")) &&
    typeof obj.isAuthenticated === "boolean" &&
    typeof obj.loading === "boolean" &&
    (obj.error === null || typeof obj.error === "string")
  )
}

const loadInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (isAuthState(parsed)) return parsed
      } catch {}
    }
  }
  return {
    token: null,
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }
}

const initialState: AuthState = loadInitialState()

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true
      state.error = null
    },
    loginSuccess(state, action: PayloadAction<{ token: string; username: string }>) {
      state.token = action.payload.token
      state.user = { username: action.payload.username }
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      if (typeof window !== "undefined") {
        localStorage.setItem("auth", JSON.stringify({ ...state }))
      }
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
      state.isAuthenticated = false
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth")
      }
    },
    logout(state) {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth")
      }
    },
    setAuthState(state, action: PayloadAction<AuthState>) {
      return action.payload
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, setAuthState } = authSlice.actions

export default authSlice.reducer
