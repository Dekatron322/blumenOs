"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { initializeAuth, logout } from "lib/redux/authSlice"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, loading, tokens } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // Initialize auth state on mount
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/")
      } else if (tokens?.accessToken && !verifyTokenExpiration(tokens.accessToken)) {
        // Token is expired, log out
        dispatch(logout())
        router.push("/")
      }
    }
  }, [isAuthenticated, loading, router, dispatch, tokens])

  if (loading || (!isAuthenticated && typeof window !== "undefined")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-t-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
}

// Helper function to check token expiration with proper typing
function verifyTokenExpiration(token: string): boolean {
  try {
    // Define the expected JWT payload shape
    interface JwtPayload {
      exp?: number
      [key: string]: unknown // Allow other properties
    }

    // Split token and verify structure
    const parts = token.split(".")
    if (parts.length !== 3) {
      return false
    }

    const payloadBase64 = parts[1]
    if (!payloadBase64) {
      return false
    }

    // Decode and parse payload with type assertion
    const payloadJson = atob(payloadBase64)
    const payload = JSON.parse(payloadJson) as JwtPayload

    // Check expiration exists and is a valid number
    if (typeof payload.exp !== "number") {
      return false
    }

    return payload.exp * 1000 > Date.now()
  } catch (e) {
    console.error("Token verification failed:", e)
    return false
  }
}
