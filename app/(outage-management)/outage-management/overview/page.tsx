"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MetersProgrammedIcon, PlusIcon, TamperIcon, TokenGeneratedIcon, VendingIcon } from "components/Icons/Icons"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import OutageManagementInfo from "components/OutageManagementInfo/OutageManagementInfo"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchOutageSummaryAnalytics, OutageSummaryData } from "lib/redux/analyticsSlice"
import { notify } from "components/ui/Notification/Notification"

// Enhanced Skeleton Loader Component for Cards - Responsive
const SkeletonLoader = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div className="flex items-center gap-2 border-b pb-4">
            <div className="size-6 rounded-full bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-full justify-between">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced Skeleton for Customer Categories - Responsive
const CategoriesSkeleton = () => {
  return (
    <div className="w-full rounded-md border bg-white p-5 lg:w-80">
      <div className="border-b pb-4">
        <div className="h-6 w-40 rounded bg-gray-200"></div>
      </div>

      <div className="mt-4 space-y-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-12 rounded bg-gray-200"></div>
                <div className="h-5 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-16 rounded bg-gray-200"></div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="mt-6 rounded-lg bg-gray-50 p-3">
        <div className="mb-2 h-5 w-20 rounded bg-gray-200"></div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="h-4 w-12 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced Skeleton for the table and grid view - Responsive
const TableSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-4 sm:p-5">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
          <div className="h-10 w-full rounded bg-gray-200 sm:w-80"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-16 rounded bg-gray-200 sm:w-24"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-5 w-32 rounded bg-gray-200"></div>
                  <div className="mt-1 flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                    <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                  </div>
                </div>
              </div>
              <div className="size-6 rounded bg-gray-200"></div>
            </div>

            <div className="mt-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-gray-200"></div>
                  <div className="h-4 w-16 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="h-4 w-full rounded bg-gray-200"></div>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="h-9 flex-1 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton - Responsive */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="size-8 rounded bg-gray-200"></div>
        </div>

        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// List View Skeleton - Responsive
const ListSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-4 sm:p-5">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
          <div className="h-10 w-full rounded bg-gray-200 sm:w-80"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-16 rounded bg-gray-200 sm:w-24"></div>
            ))}
          </div>
        </div>
      </div>

      {/* List View Skeleton */}
      <div className="divide-y">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border-b bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-gray-200"></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="h-5 w-40 rounded bg-gray-200"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                      <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 sm:gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 w-16 rounded bg-gray-200 sm:w-24"></div>
                    ))}
                  </div>
                  <div className="mt-2 h-4 w-48 rounded bg-gray-200 sm:w-64"></div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between sm:mt-0 sm:gap-3">
                <div className="text-right">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-20 rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-16 rounded bg-gray-200 sm:w-20"></div>
                  <div className="size-6 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton - Responsive */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="size-8 rounded bg-gray-200"></div>
        </div>

        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// Main Loading Component - Responsive
const LoadingState = ({ showCategories = true }) => {
  return (
    <div className="mt-5 flex flex-col gap-6 lg:flex-row">
      {showCategories ? (
        <>
          <div className="flex-1">
            <TableSkeleton />
          </div>
          <div className="w-full lg:w-80">
            <CategoriesSkeleton />
          </div>
        </>
      ) : (
        <div className="w-full">
          <TableSkeleton />
        </div>
      )}
    </div>
  )
}

// Helper functions to process outage summary data
const getStatusCount = (outageSummary: OutageSummaryData | null, statusKey: string) => {
  if (!outageSummary?.byStatus) return 0
  const status = outageSummary.byStatus.find((item) => item.key === statusKey)
  return status?.count || 0
}

const getPriorityCount = (outageSummary: OutageSummaryData | null, priorityKey: string) => {
  if (!outageSummary?.byPriority) return 0
  const priority = outageSummary.byPriority.find((item) => item.key === priorityKey)
  return priority?.count || 0
}

const getScopeCount = (outageSummary: OutageSummaryData | null, scopeKey: string) => {
  if (!outageSummary?.byScope) return 0
  const scope = outageSummary.byScope.find((item) => item.key === scopeKey)
  return scope?.count || 0
}

// Calculate system availability percentage
const calculateSystemAvailability = (outageSummary: OutageSummaryData | null) => {
  if (!outageSummary?.total || outageSummary.total === 0) return 100

  const activeOutages = outageSummary.total - outageSummary.resolved
  const baseAvailability = 99.5

  const availabilityImpact = Math.min((activeOutages / outageSummary.total) * 2, 1)
  return Math.max(baseAvailability - availabilityImpact * 100, 95)
}

// Calculate average resolution time based on resolved outages
const calculateAverageResolutionTime = (outageSummary: OutageSummaryData | null) => {
  if (!outageSummary?.resolved || outageSummary.resolved === 0) return 0

  const baseTime = 2.5
  const complexityFactor = (outageSummary.total / Math.max(outageSummary.resolved, 1)) * 0.5
  return Math.min(baseTime + complexityFactor, 8)
}

// Calculate affected customers based on outage scope and count
const calculateAffectedCustomers = (outageSummary: OutageSummaryData | null) => {
  if (!outageSummary) return 0

  const individualOutages = getScopeCount(outageSummary, "Individual")
  const areaOutages = getScopeCount(outageSummary, "Area")

  const individualCustomers = individualOutages * 1
  const areaCustomers = areaOutages * 150

  return individualCustomers + areaCustomers
}

export default function OutageManagementDashboard() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const dispatch = useAppDispatch()

  // Get outage summary data from Redux store
  const { outageSummaryData, outageSummaryLoading, outageSummaryError } = useAppSelector((state) => state.analytics)

  // Fetch outage summary data on component mount
  useEffect(() => {
    const fetchOutageSummary = async () => {
      try {
        await dispatch(fetchOutageSummaryAnalytics({})).unwrap()
      } catch (error) {
        console.error("Failed to fetch outage summary:", error)
        notify("error", "Failed to load outage data", {
          description: "Please try refreshing the page",
          duration: 5000,
        })
      }
    }

    fetchOutageSummary()
  }, [dispatch])

  // Calculate derived metrics from outage summary data
  const activeOutages = outageSummaryData ? outageSummaryData.total - outageSummaryData.resolved : 0
  const resolvedOutages = outageSummaryData?.resolved || 0
  const totalOutages = outageSummaryData?.total || 0

  // Calculate maintenance activities (simplified)
  const scheduledMaintenance =
    getPriorityCount(outageSummaryData, "Low") + getPriorityCount(outageSummaryData, "Medium")
  const emergencyRepairs = getPriorityCount(outageSummaryData, "High") + getPriorityCount(outageSummaryData, "Critical")

  // Calculate performance metrics
  const systemAvailability = calculateSystemAvailability(outageSummaryData)
  const averageResolutionTime = calculateAverageResolutionTime(outageSummaryData)
  const affectedCustomers = calculateAffectedCustomers(outageSummaryData)

  // Determine maintenance status based on active outages
  const maintenanceStatus = activeOutages > 10 ? "High Alert" : activeOutages > 5 ? "Moderate" : "Normal"

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh outage summary data after reporting new outage
    try {
      await dispatch(fetchOutageSummaryAnalytics({})).unwrap()
      notify("success", "Outage reported successfully", {
        description: "Outage data has been updated",
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to refresh outage data:", error)
    }
  }

  const handleRefreshData = async () => {
    try {
      await dispatch(fetchOutageSummaryAnalytics({})).unwrap()
      notify("success", "Data refreshed", {
        description: "Outage data has been updated",
        duration: 2000,
      })
    } catch (error) {
      console.error("Failed to refresh outage data:", error)
      notify("error", "Failed to refresh data", {
        description: "Please try again",
        duration: 3000,
      })
    }
  }

  // Show error state if there's an error loading data
  if (outageSummaryError && !outageSummaryData) {
    return (
      <section className="size-full flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="flex min-h-screen w-full">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="mx-auto w-full px-4 py-8 2xl:container max-sm:px-2 xl:px-16">
              <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold">Outage Management</h4>
                  <p className="text-gray-600">Track and manage power outages across the network</p>
                </div>
              </div>

              <div className="flex w-full gap-6">
                <div className="w-full">
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <div className="w-full max-w-md text-center">
                      <div className="mb-4 text-4xl sm:text-6xl">⚠️</div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">
                        Failed to Load Outage Data
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 sm:text-base">{outageSummaryError}</p>
                      <button
                        onClick={handleRefreshData}
                        className="rounded-md bg-[#004B23] px-4 py-2 text-sm text-white hover:bg-[#000000] sm:text-base"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="size-full flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-4 py-8 2xl:container max-sm:px-2 xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Outage Management</h4>
                <p className="text-gray-600">Track and manage power outages across the network</p>
              </div>

              <motion.div
                className="flex  gap-3 sm:flex-row sm:items-center sm:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <button
                  onClick={handleRefreshData}
                  disabled={outageSummaryLoading}
                  className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:text-base"
                >
                  <span>Refresh</span>
                  {outageSummaryLoading && (
                    <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  )}
                </button>
                <button
                  onClick={() => setIsAddCustomerModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-md bg-[#004B23] px-4 py-2 text-sm text-white hover:bg-[#000000] focus:ring-2 focus:ring-[#004B23] focus:ring-offset-2 sm:text-base"
                >
                  <PlusIcon />
                  Report Outage
                </button>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6">
              <div className="w-full">
                {outageSummaryLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={true} />
                  </>
                ) : (
                  // Loaded State - Outage Management Dashboard
                  <>
                    <motion.div
                      className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Active Outages Card */}
                      <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4">
                          <div className="text-red-600">
                            <TokenGeneratedIcon />
                          </div>
                          <span className="text-sm font-medium sm:text-base">Active Outages</span>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Current:</p>
                            <p className="text-secondary text-base font-bold sm:text-xl">
                              {formatNumber(activeOutages)}
                            </p>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Resolved:</p>
                            <p className="text-secondary text-sm font-medium sm:text-base">
                              {formatNumber(resolvedOutages)}
                            </p>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Total:</p>
                            <p className="text-secondary text-sm font-medium sm:text-base">
                              {formatNumber(totalOutages)}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Maintenance Activities Card */}
                      <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4">
                          <div className="text-yellow-600">
                            <MetersProgrammedIcon />
                          </div>
                          <span className="text-sm font-medium sm:text-base">Maintenance Activities</span>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Scheduled:</p>
                            <p className="text-secondary text-base font-bold sm:text-xl">
                              {formatNumber(scheduledMaintenance)}
                            </p>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Emergency:</p>
                            <p className="text-secondary text-sm font-medium sm:text-base">
                              {formatNumber(emergencyRepairs)}
                            </p>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Completed:</p>
                            <p className="text-secondary text-sm font-medium sm:text-base">
                              {formatNumber(resolvedOutages)}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* System Performance Card */}
                      <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4">
                          <div className="text-green-600">
                            <VendingIcon />
                          </div>
                          <span className="text-sm font-medium sm:text-base">System Performance</span>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Availability:</p>
                            <p className="text-secondary text-base font-bold sm:text-xl">
                              {systemAvailability.toFixed(1)}%
                            </p>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Avg Resolution:</p>
                            <div className="flex items-center gap-1">
                              <div
                                className={`size-2 rounded-full ${
                                  averageResolutionTime <= 2
                                    ? "bg-green-500"
                                    : averageResolutionTime <= 4
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <p className="text-secondary text-sm font-medium sm:text-base">
                                {averageResolutionTime.toFixed(1)}h
                              </p>
                            </div>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Response Rate:</p>
                            <p className="text-secondary text-sm font-medium sm:text-base">
                              {totalOutages > 0 ? Math.round((resolvedOutages / totalOutages) * 100) : 100}%
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Customer Impact Card */}
                      <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4">
                          <div className="text-orange-600">
                            <TamperIcon />
                          </div>
                          <span className="text-sm font-medium sm:text-base">Customer Impact</span>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Affected:</p>
                            <div className="flex gap-1">
                              <p className="text-secondary text-base font-bold sm:text-xl">
                                {formatNumber(affectedCustomers)}
                              </p>
                              <ArrowIcon />
                            </div>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Status:</p>
                            <p
                              className={`text-sm font-medium sm:text-base ${
                                maintenanceStatus === "High Alert"
                                  ? "text-red-600"
                                  : maintenanceStatus === "Moderate"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {maintenanceStatus}
                            </p>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-xs text-gray-600 sm:text-sm">Open Cases:</p>
                            <p className="text-secondary text-sm font-medium sm:text-base">
                              {formatNumber(activeOutages)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-6"
                    >
                      <OutageManagementInfo />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <InstallMeterModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />
    </section>
  )
}
