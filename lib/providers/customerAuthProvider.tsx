"use client"

import { useEffect } from "react"
import { useAppDispatch } from "lib/hooks/useRedux"
import { initializeCustomerAuth } from "lib/redux/customerAuthSlice"

interface CustomerAuthProviderProps {
  children: React.ReactNode
}

export default function CustomerAuthProvider({ children }: CustomerAuthProviderProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Initialize customer auth state from localStorage when the provider mounts
    dispatch(initializeCustomerAuth())
  }, [dispatch])

  return <>{children}</>
}
