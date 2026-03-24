"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Info,
  Loader2,
  RefreshCw,
  TrendingUp,
  User,
  XCircle,
  Zap,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearAllTariffOverridesState, fetchAllTariffOverrides } from "lib/redux/customerSlice"
import { fetchEmployeeById } from "lib/redux/employeeSlice"
import type { TariffOverrideData } from "lib/redux/customerSlice"
import type { Employee } from "lib/redux/employeeSlice"

interface TariffOverridesTabProps {
  customerId: number
  customerName: string
}

const TariffOverridesTab: React.FC<TariffOverridesTabProps> = ({ customerId, customerName }) => {
  const dispatch = useAppDispatch()
  const { allTariffOverrides, allTariffOverridesLoading, allTariffOverridesError, allTariffOverridesSuccess } =
    useAppSelector((state) => state.customers)

  // State to store employee names
  const [employeeNames, setEmployeeNames] = useState<Record<number, string>>({})
  const [loadingEmployees, setLoadingEmployees] = useState<Record<number, boolean>>({})

  useEffect(() => {
    // Fetch tariff overrides when component mounts
    dispatch(fetchAllTariffOverrides(customerId))

    // Cleanup on unmount
    return () => {
      dispatch(clearAllTariffOverridesState())
    }
  }, [dispatch, customerId])

  // Fetch employee name when needed
  const fetchEmployeeName = async (userId: number) => {
    if (employeeNames[userId] || loadingEmployees[userId]) {
      return
    }

    setLoadingEmployees((prev) => ({ ...prev, [userId]: true }))

    try {
      const result = await dispatch(fetchEmployeeById(userId))
      if (fetchEmployeeById.fulfilled.match(result)) {
        setEmployeeNames((prev) => ({ ...prev, [userId]: result.payload.fullName }))
      }
    } catch (error) {
      console.error(`Failed to fetch employee ${userId}:`, error)
    } finally {
      setLoadingEmployees((prev) => ({ ...prev, [userId]: false }))
    }
  }

  // Fetch employee names for all overrides
  useEffect(() => {
    if (allTariffOverrides.length > 0) {
      allTariffOverrides.forEach((override) => {
        fetchEmployeeName(override.requestedByUserId)
      })
    }
  }, [allTariffOverrides])

  const handleRefresh = () => {
    dispatch(fetchAllTariffOverrides(customerId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (isActive: boolean, effectiveFrom: string, effectiveTo: string) => {
    const now = new Date()
    const fromDate = new Date(effectiveFrom)
    const toDate = new Date(effectiveTo)

    if (!isActive) {
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
          <XCircle className="size-3.5" />
          Inactive
        </div>
      )
    }

    if (now < fromDate) {
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
          <Clock className="size-3.5" />
          Pending
        </div>
      )
    }

    if (now > toDate) {
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
          <XCircle className="size-3.5" />
          Expired
        </div>
      )
    }

    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        <CheckCircle className="size-3.5" />
        Active
      </div>
    )
  }

  const getStatusColor = (isActive: boolean, effectiveFrom: string, effectiveTo: string) => {
    const now = new Date()
    const fromDate = new Date(effectiveFrom)
    const toDate = new Date(effectiveTo)

    if (!isActive || now > toDate) return "border-gray-200 bg-gray-50"
    if (now < fromDate) return "border-amber-200 bg-amber-50"
    return "border-emerald-200 bg-emerald-50"
  }

  if (allTariffOverridesLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading tariff overrides...</p>
        </div>
      </motion.div>
    )
  }

  if (allTariffOverridesError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="size-12 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Tariff Overrides</h3>
            <p className="mt-1 text-sm text-gray-600">{allTariffOverridesError}</p>
          </div>
          <ButtonModule variant="primary" onClick={handleRefresh} className="mt-2">
            <RefreshCw className="mr-2 size-4" />
            Try Again
          </ButtonModule>
        </div>
      </motion.div>
    )
  }

  if (!allTariffOverrides.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-gray-100 p-3">
            <Calendar className="size-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No Tariff Overrides</h3>
            <p className="mt-1 text-sm text-gray-600">{customerName} doesn&apos;t have any tariff overrides yet.</p>
          </div>
          <ButtonModule variant="primary" onClick={handleRefresh} className="mt-2">
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </ButtonModule>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Zap className="size-5 text-blue-600" />
            Tariff Overrides
          </h2>
          <p className="mt-1 text-sm text-gray-600">Manage tariff overrides for {customerName}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Overrides</p>
            <p className="text-lg font-semibold text-gray-900">{allTariffOverrides.length}</p>
          </div>
          <ButtonModule variant="secondary" onClick={handleRefresh} disabled={allTariffOverridesLoading}>
            <RefreshCw className={`mr-2 size-4 ${allTariffOverridesLoading ? "animate-spin" : ""}`} />
            Refresh
          </ButtonModule>
        </div>
      </div>

      {/* Tariff Overrides Grid */}
      <div className="grid gap-4">
        <AnimatePresence>
          {allTariffOverrides.map((override: TariffOverrideData, index: number) => {
            const statusColor = getStatusColor(override.isActive, override.effectiveFromUtc, override.effectiveToUtc)
            const isExpired = new Date() > new Date(override.effectiveToUtc)

            return (
              <motion.div
                key={override.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`rounded-xl border-2 ${statusColor} bg-white shadow-sm transition-all duration-200 hover:shadow-md`}
              >
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-xl p-3 ${isExpired ? "bg-gray-100" : "bg-blue-100"}`}>
                        <TrendingUp className={`size-6 ${isExpired ? "text-gray-600" : "text-blue-600"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          {getStatusBadge(override.isActive, override.effectiveFromUtc, override.effectiveToUtc)}
                          <h3 className="text-xl font-bold text-gray-900">
                            ₦{override.tariffRateOverride.toFixed(4)}
                            <span className="ml-2 text-sm font-normal text-gray-500">per kWh</span>
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="size-4" />
                          <span>
                            {formatDate(override.effectiveFromUtc)} - {formatDate(override.effectiveToUtc)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                        <div className="mt-1">
                          {getStatusBadge(override.isActive, override.effectiveFromUtc, override.effectiveToUtc)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                        <User className="size-4" />
                        <span>Requested By</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {loadingEmployees[override.requestedByUserId] ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-3 animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : employeeNames[override.requestedByUserId] ? (
                          employeeNames[override.requestedByUserId]
                        ) : (
                          `User ID: ${override.requestedByUserId}`
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                        <Info className="size-4" />
                        <span>Reason</span>
                      </div>
                      <p className="line-clamp-2 text-sm font-medium text-gray-900">{override.reason}</p>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="size-4" />
                        <span>Duration</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {Math.ceil(
                          (new Date(override.effectiveToUtc).getTime() -
                            new Date(override.effectiveFromUtc).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    </div>
                  </div>

                  {/* Timeline Information */}
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(override.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span> {formatDate(override.lastUpdated)}
                      </div>
                      {override.approvedAtUtc && (
                        <div>
                          <span className="font-medium text-emerald-600">Approved:</span>{" "}
                          {formatDate(override.approvedAtUtc)}
                        </div>
                      )}
                      {override.deactivatedAtUtc && (
                        <div>
                          <span className="font-medium text-red-600">Deactivated:</span>{" "}
                          {formatDate(override.deactivatedAtUtc)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default TariffOverridesTab
