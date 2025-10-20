// components/ProtectedRoute.tsx
"use client"

import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "lib/redux/store"
import { useEffect } from "react"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) {
    return null // Return nothing while checking auth state
  }

  return <>{children}</>
}
