"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "lib/redux/store"

interface DashboardAccessGuardProps {
  children: React.ReactNode
}

export const DashboardAccessGuard: React.FC<DashboardAccessGuardProps> = ({ children }) => {
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!user) return

    const hasDashboardAccess = user.privileges?.some((p) => p.key === "reporting-analytics" && p.actions?.includes("R"))

    if (!hasDashboardAccess) {
      const hasCustomersAccess = user.privileges?.some((p) => p.key === "customers" && p.actions?.includes("R"))

      if (hasCustomersAccess) {
        router.replace("/customers/overview")
      }
    }
  }, [user, router])

  return <>{children}</>
}
