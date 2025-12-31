"use client"

import DashboardNav from "components/Navbar/DashboardNav"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { MetersProgrammedIcon, PlusIcon, TamperIcon, TokenGeneratedIcon, VendingIcon } from "components/Icons/Icons"
import MeteringInfo from "components/MeteringInfo/MeteringInfo"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchMetersSummary } from "lib/redux/metersSlice"

// Dropdown Popover Component
const DropdownPopover = ({
  options,
  selectedValue,
  onSelect,
  children,
}: {
  options: { value: number; label: string }[]
  selectedValue: number
  onSelect: (value: number) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {children}
        <svg
          className={`size-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
                className={`block w-full px-3 py-2 text-left ${
                  option.value === selectedValue ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
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
          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
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

// Enhanced Skeleton for Customer Categories
const CategoriesSkeleton = () => {
  return (
    <div className="w-80 rounded-md border bg-white p-5">
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

// Enhanced Skeleton for the table and grid view
const TableSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex gap-4">
          <div className="h-10 w-80 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      {/* Pagination Skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-2">
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

// List View Skeleton
const ListSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex gap-4">
          <div className="h-10 w-80 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>

      {/* List View Skeleton */}
      <div className="divide-y">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-gray-200"></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-40 rounded bg-gray-200"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                      <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 w-24 rounded bg-gray-200"></div>
                    ))}
                  </div>
                  <div className="mt-1 h-4 w-64 rounded bg-gray-200"></div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-20 rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-20 rounded bg-gray-200"></div>
                  <div className="size-6 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-2">
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

// Main Loading Component
const LoadingState = ({ showCategories = true }) => {
  return (
    <div className="flex-3 relative mt-5 flex items-start gap-6">
      {showCategories ? (
        <>
          <TableSkeleton />
          <CategoriesSkeleton />
        </>
      ) : (
        <div className="w-full">
          <TableSkeleton />
        </div>
      )}
    </div>
  )
}

export default function MeteringDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState<number>(480000) // Default 8 minutes (480,000 ms)

  const dispatch = useAppDispatch()
  const { summary, summaryLoading, summaryError } = useAppSelector((state) => state.meters)

  // Fetch meters summary on component mount
  useEffect(() => {
    dispatch(fetchMetersSummary())
  }, [dispatch])

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const handlePollingIntervalChange = (interval: number) => {
    setPollingInterval(interval)
  }

  // Polling interval options - 8 minutes as default
  const pollingOptions = [
    { value: 480000, label: "8m" },
    { value: 600000, label: "10m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  // Short polling effect - only runs if isPolling is true and uses the selected interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isPolling) {
      intervalId = setInterval(() => {
        dispatch(fetchMetersSummary())
      }, pollingInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [dispatch, isPolling, pollingInterval])

  // Calculate derived values from summary data
  const meterData = {
    smartMeters: summary?.smartMeters || 0,
    conventionalMeters: summary ? summary.totalMeters - summary.smartMeters : 0,
    totalMeters: summary?.totalMeters || 0,
    activeMeters: summary?.activeMeters || 0,
    deactivatedMeters: summary?.deactivatedMeters || 0,
    suspendedMeters: summary?.suspendedMeters || 0,
    retiredMeters: summary?.retiredMeters || 0,
    prepaidMeters: summary?.prepaidMeters || 0,
    postpaidMeters: summary?.postpaidMeters || 0,
    byStatus: summary?.byStatus || [],
    byState: summary?.byState || [],
    byType: summary?.byType || [],
    byServiceBand: summary?.byServiceBand || [],
  }

  // Calculate percentages
  const calculatePercentage = (value: number) => {
    return meterData.totalMeters > 0 ? Math.round((value / meterData.totalMeters) * 100) : 0
  }

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleRefreshData = () => {
    dispatch(fetchMetersSummary())
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex flex-col 2xl:container">
            {/* Page Header - Always Visible */}
            <div className="flex w-full justify-between px-3 max-md:flex-col  max-sm:my-4 max-sm:px-3 sm:px-4 md:my-4 md:px-6 2xl:px-16">
              <div>
                <h4 className="text-2xl font-semibold">Metering & AMI</h4>
                <p>Advanced Metering Infrastructure and meter management</p>
              </div>

              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <button
                  onClick={() => router.push("/metering/install-new-meter")}
                  className="flex items-center gap-2 rounded-md bg-[#004B23] px-4 py-2 text-white focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#000000]"
                >
                  <PlusIcon />
                  Install Meter
                </button>
                {/* Auto-refresh controls */}
                <div className="flex items-center gap-2 rounded-md border-r bg-white p-2 pr-3">
                  <span className="text-sm font-medium text-gray-500">Auto-refresh:</span>
                  <button
                    onClick={togglePolling}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isPolling
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {isPolling ? (
                      <>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        ON
                      </>
                    ) : (
                      <>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        OFF
                      </>
                    )}
                  </button>

                  {isPolling && (
                    <DropdownPopover
                      options={pollingOptions}
                      selectedValue={pollingInterval}
                      onSelect={handlePollingIntervalChange}
                    >
                      <span className="text-sm font-medium">
                        {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                      </span>
                    </DropdownPopover>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 sm:px-4 md:px-6 2xl:px-16">
              <div className="w-full">
                {summaryError ? (
                  // Error State
                  <div className="rounded-md border border-red-200 bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 0 100-16 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading meter data</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{summaryError}</p>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => dispatch(fetchMetersSummary())}
                            className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : summaryLoading || isLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={true} />
                  </>
                ) : (
                  // Loaded State - Clean White Card Design
                  <>
                    {/* Main Metrics Grid */}
                    <motion.div
                      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Total Meters Card */}
                      <motion.div
                        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md"
                        whileHover={{ y: -3, scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Meters</p>
                            <p className="text-3xl font-bold text-gray-800">{formatNumber(meterData.totalMeters)}</p>
                          </div>
                          <div className="rounded-full bg-gray-100 p-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-gray-600">
                              <span className="text-xs font-medium text-white">Σ</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          <p>All installed meters in the system</p>
                        </div>
                      </motion.div>

                      {/* Active Meters Card */}
                      <motion.div
                        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md"
                        whileHover={{ y: -3, scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Meters</p>
                            <p className="text-3xl font-bold text-gray-800">{formatNumber(meterData.activeMeters)}</p>
                          </div>
                          <div className="rounded-full bg-green-50 p-2">
                            <VendingIcon />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Operational</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {calculatePercentage(meterData.activeMeters)}%
                          </span>
                        </div>
                      </motion.div>

                      {/* Deactivated Meters Card */}
                      <motion.div
                        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md"
                        whileHover={{ y: -3, scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Deactivated Meters</p>
                            <p className="text-3xl font-bold text-gray-800">
                              {formatNumber(meterData.deactivatedMeters)}
                            </p>
                          </div>
                          <div className="rounded-full bg-red-50 p-2">
                            <TamperIcon />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Non-operational</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {calculatePercentage(meterData.deactivatedMeters)}%
                          </span>
                        </div>
                      </motion.div>

                      {/* Smart Meters Card */}
                      <motion.div
                        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md"
                        whileHover={{ y: -3, scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Smart Meters</p>
                            <p className="text-3xl font-bold text-gray-800">{formatNumber(meterData.smartMeters)}</p>
                          </div>
                          <div className="rounded-full bg-blue-50 p-2">
                            <TokenGeneratedIcon />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">AMI Technology</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {calculatePercentage(meterData.smartMeters)}%
                          </span>
                        </div>
                      </motion.div>

                      {/* Prepaid Meters Card */}
                      <motion.div
                        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md"
                        whileHover={{ y: -3, scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Prepaid Meters</p>
                            <p className="text-3xl font-bold text-gray-800">{formatNumber(meterData.prepaidMeters)}</p>
                          </div>
                          <div className="rounded-full bg-amber-50 p-2">
                            <MetersProgrammedIcon />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Pay-as-you-go</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {calculatePercentage(meterData.prepaidMeters)}%
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Secondary Metrics Row */}
                    <motion.div
                      className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {/* Conventional Meters Card */}
                      <motion.div
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-md"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-gray-100 p-2">
                            <div className="size-4 rounded-full bg-gray-600"></div>
                          </div>
                          <span className="font-medium text-gray-700">Conventional Meters</span>
                        </div>
                        <div className="mt-3 flex items-end justify-between">
                          <p className="text-2xl font-bold text-gray-800">
                            {formatNumber(meterData.conventionalMeters)}
                          </p>
                          <p className="text-sm font-medium text-gray-600">
                            {calculatePercentage(meterData.conventionalMeters)}%
                          </p>
                        </div>
                      </motion.div>

                      {/* Suspended Meters Card */}
                      <motion.div
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-md"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-yellow-50 p-2">
                            <div className="size-4 rounded-full bg-yellow-600"></div>
                          </div>
                          <span className="font-medium text-gray-700">Suspended Meters</span>
                        </div>
                        <div className="mt-3 flex items-end justify-between">
                          <p className="text-2xl font-bold text-gray-800">{formatNumber(meterData.suspendedMeters)}</p>
                          <p className="text-sm font-medium text-gray-600">
                            {calculatePercentage(meterData.suspendedMeters)}%
                          </p>
                        </div>
                      </motion.div>

                      {/* Postpaid Meters Card */}
                      <motion.div
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-md"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-blue-50 p-2">
                            <div className="size-4 rounded-full bg-blue-600"></div>
                          </div>
                          <span className="font-medium text-gray-700">Postpaid Meters</span>
                        </div>
                        <div className="mt-3 flex items-end justify-between">
                          <p className="text-2xl font-bold text-gray-800">{formatNumber(meterData.postpaidMeters)}</p>
                          <p className="text-sm font-medium text-gray-600">
                            {calculatePercentage(meterData.postpaidMeters)}%
                          </p>
                        </div>
                      </motion.div>

                      {/* Retired Meters Card */}
                      <motion.div
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-md"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-gray-200 p-2">
                            <div className="size-4 rounded-full bg-gray-700"></div>
                          </div>
                          <span className="font-medium text-gray-700">Retired Meters</span>
                        </div>
                        <div className="mt-3 flex items-end justify-between">
                          <p className="text-2xl font-bold text-gray-800">{formatNumber(meterData.retiredMeters)}</p>
                          <p className="text-sm font-medium text-gray-600">
                            {calculatePercentage(meterData.retiredMeters)}%
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Statistics Overview */}
                    <motion.div
                      className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <h3 className="mb-4 text-lg font-semibold text-gray-800">Meter Statistics Overview</h3>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Status Distribution */}
                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                          <h4 className="mb-3 font-medium text-gray-700">By Status</h4>
                          <div className="space-y-3">
                            {meterData.byStatus.map((status) => (
                              <div key={status.value} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{status.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">{status.count}</span>
                                  <span className="text-xs text-gray-500">
                                    ({Math.round((status.count / meterData.totalMeters) * 100)}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* State Distribution */}
                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                          <h4 className="mb-3 font-medium text-gray-700">By State</h4>
                          <div className="space-y-3">
                            {meterData.byState.map((state) => (
                              <div key={state.value} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{state.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">{state.count}</span>
                                  <span className="text-xs text-gray-500">
                                    ({Math.round((state.count / meterData.totalMeters) * 100)}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Type Distribution */}
                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                          <h4 className="mb-3 font-medium text-gray-700">By Type</h4>
                          <div className="space-y-3">
                            {meterData.byType.map((type) => (
                              <div key={type.value || "unknown"} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{type.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">{type.count}</span>
                                  <span className="text-xs text-gray-500">
                                    ({Math.round((type.count / meterData.totalMeters) * 100)}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Service Band Distribution */}
                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                          <h4 className="mb-3 font-medium text-gray-700">By Service Band</h4>
                          <div className="space-y-3">
                            {meterData.byServiceBand.map((band) => (
                              <div key={band.value} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Band {band.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">{band.count}</span>
                                  <span className="text-xs text-gray-500">
                                    ({Math.round((band.count / meterData.totalMeters) * 100)}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Performance Metrics */}
                    <motion.div
                      className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-blue-50 p-2">
                            <div className="size-6 rounded-full bg-blue-600"></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">AMI Coverage Rate</p>
                            <p className="text-3xl font-bold text-gray-800">
                              {calculatePercentage(meterData.smartMeters)}%
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Smart meters to total meters ratio</p>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-green-50 p-2">
                            <div className="size-6 rounded-full bg-green-600"></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Rate</p>
                            <p className="text-3xl font-bold text-gray-800">
                              {calculatePercentage(meterData.activeMeters)}%
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Operational meters in system</p>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-amber-50 p-2">
                            <div className="size-6 rounded-full bg-amber-600"></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Prepaid Adoption</p>
                            <p className="text-3xl font-bold text-gray-800">
                              {calculatePercentage(meterData.prepaidMeters)}%
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Prepaid meters to total meters</p>
                      </div>
                    </motion.div>

                    {/* Metering Info Component */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="mt-6"
                    >
                      <MeteringInfo />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
