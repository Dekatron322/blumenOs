"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearError,
  fetchCboPerformance,
  fetchCollectionByBand,
  fetchCollectionEfficiency,
  fetchOutstandingArrears,
} from "lib/redux/performanceAnalyticsSlice"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BillingIcon, CollectionIcon, CustomeraIcon, RevenueIcon, VendingIcon } from "components/Icons/Icons"

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

// Enhanced Skeleton for Performance Cards
const PerformanceCardsSkeleton = () => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-gray-200"></div>
            <div className="size-6 rounded-full bg-gray-200"></div>
          </div>
          <div className="mb-2 flex items-center justify-between border-b py-2">
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </div>
          <div className="h-10 w-32 rounded bg-gray-300"></div>
        </div>
      ))}
    </div>
  )
}

// Enhanced Skeleton for Charts
const ChartSkeleton = ({ height = 300 }: { height?: number }) => {
  return (
    <div className="animate-pulse">
      <div className="h-[300px] w-full rounded bg-gray-200" />
    </div>
  )
}

// Card Component
const Card = ({
  children,
  className = "",
  title,
  icon,
}: {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: React.ReactNode
}) => (
  <div className={`rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}>
    <div className="mb-4 flex items-center justify-between">
      {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
      {icon && <div className="text-gray-400">{icon}</div>}
    </div>
    {children}
  </div>
)

// Metric Component
const Metric = ({ children, size = "lg" }: { children: React.ReactNode; size?: "sm" | "lg" }) => (
  <p className={`flex items-end gap-2 font-bold text-gray-900 ${size === "lg" ? "text-3xl" : "text-2xl"}`}>
    {children}
  </p>
)

// Text Component
const Text = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm font-medium text-gray-500 ${className}`}>{children}</p>
)

// Time Filter Types
type TimeFilter = "day" | "week" | "month" | "quarter" | "year"

export default function PerformanceAnalyticsDashboard() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month")
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number>(1)
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState<string>("₦")
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(300000) // 5 minutes default

  const dispatch = useAppDispatch()

  // Get state from Redux
  const {
    // Collection efficiency
    collectionEfficiencyData,
    collectionEfficiencyLoading,
    collectionEfficiencyError,

    // Outstanding arrears
    outstandingArrearsData,
    outstandingArrearsLoading,
    outstandingArrearsError,

    // Collection by band
    collectionByBandData,
    collectionByBandLoading,
    collectionByBandError,

    // CBO performance
    cboPerformanceData,
    cboPerformanceLoading,
    cboPerformanceError,
  } = useAppSelector((state) => state.performanceAnalytics)

  // Mock currencies data
  const currenciesData = {
    data: [
      { id: 1, symbol: "₦", name: "Nigerian Naira" },
      { id: 2, symbol: "USD", name: "US Dollar" },
      { id: 3, symbol: "EUR", name: "Euro" },
    ],
  }

  // Generate date range based on time filter
  const getDateRange = () => {
    const now = new Date()
    const endDateUtc = now.toISOString()
    const start = new Date(now)

    switch (timeFilter) {
      case "day":
        start.setUTCDate(start.getUTCDate() - 1)
        break
      case "week":
        start.setUTCDate(start.getUTCDate() - 7)
        break
      case "month":
        start.setUTCMonth(start.getUTCMonth() - 1)
        break
      case "quarter":
        start.setUTCMonth(start.getUTCMonth() - 3)
        break
      case "year":
        start.setUTCFullYear(start.getUTCFullYear() - 1)
        break
    }

    return {
      StartDateUtc: start.toISOString(),
      EndDateUtc: endDateUtc,
    }
  }

  // Fetch all performance data
  const fetchPerformanceData = useCallback(() => {
    const dateRange = getDateRange()

    // Clear previous errors
    dispatch(clearError())

    // Fetch collection efficiency
    dispatch(fetchCollectionEfficiency(dateRange))

    // Fetch outstanding arrears (no params needed)
    dispatch(fetchOutstandingArrears())

    // Fetch collection by band
    dispatch(fetchCollectionByBand(dateRange))

    // Fetch CBO performance
    dispatch(fetchCboPerformance(dateRange))
  }, [dispatch, timeFilter])

  // Initial data fetch
  useEffect(() => {
    fetchPerformanceData()
  }, [timeFilter, dispatch, fetchPerformanceData])

  // Short polling effect
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      fetchPerformanceData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [dispatch, timeFilter, isPolling, pollingInterval, fetchPerformanceData])

  // Handle currency change
  useEffect(() => {
    if (currenciesData?.data) {
      const selectedCurrency = currenciesData.data.find((currency) => currency.id === selectedCurrencyId)
      if (selectedCurrency) {
        setSelectedCurrencySymbol(selectedCurrency.symbol)
      }
    }
  }, [selectedCurrencyId])

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrencyId = Number(event.target.value)
    setSelectedCurrencyId(newCurrencyId)
  }

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter)
    setIsMobileFilterOpen(false)
  }

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const handlePollingIntervalChange = (interval: number) => {
    setPollingInterval(interval)
  }

  // Polling interval options
  const pollingOptions = [
    { value: 300000, label: "5m" },
    { value: 480000, label: "8m" },
    { value: 660000, label: "11m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh data after adding customer
    fetchPerformanceData()
  }

  const handleRefreshData = () => {
    fetchPerformanceData()
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return `${selectedCurrencySymbol}${value?.toLocaleString() || "0"}`
  }

  // Get time filter label
  const getTimeFilterLabel = (filter: TimeFilter) => {
    const labels = {
      day: "Today",
      week: "This Week",
      month: "This Month",
      quarter: "This Quarter",
      year: "This Year",
    }
    return labels[filter]
  }

  // Time Filter Button Component
  const TimeFilterButton = ({ filter, label }: { filter: TimeFilter; label: string }) => (
    <button
      onClick={() => handleTimeFilterChange(filter)}
      className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        timeFilter === filter ? "bg-[#004B23] text-[#FFFFFF]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  )

  // Chart colors
  const COLORS = ["#004B23", "#007200", "#38b000", "#9ef01a", "#ccff33", "#004B23", "#007200"]
  const COLLECTION_BAND_COLORS = ["#3b82f6", "#8b5cf6", "#ef4444", "#f97316", "#10b981", "#0ea5e9"]

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          {/* Main Content */}
          <div className="mx-auto w-full px-3 py-8 xl:container xl:px-16">
            {/* Header */}
            <div className="mb-6 flex w-full flex-col gap-4">
              <div className="flex w-full items-start justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl lg:text-3xl">
                    Performance Analytics
                  </h1>
                  <p className="text-sm font-medium text-gray-500 sm:text-base">Real Time performance analytics</p>
                </div>

                {/* Time Filter - Desktop */}
                <div className="hidden rounded-lg p-3 sm:bg-white sm:p-2 sm:shadow-sm xl:flex">
                  <div className="flex flex-row items-center gap-4 max-sm:justify-between sm:gap-4">
                    <div className="flex flex-row items-center gap-2 max-sm:justify-between sm:gap-3">
                      <span className="text-sm font-medium text-gray-500">Time Range:</span>
                      <div className="hidden items-center gap-2 sm:flex">
                        <TimeFilterButton filter="day" label="Today" />
                        <TimeFilterButton filter="week" label="This Week" />
                        <TimeFilterButton filter="month" label="This Month" />
                        <TimeFilterButton filter="quarter" label="This Quarter" />
                        <TimeFilterButton filter="year" label="This Year" />
                      </div>
                    </div>

                    {/* Polling Controls */}
                    <div className="flex items-center gap-2 border-l pl-4">
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
                          {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                        </DropdownPopover>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Filter - Mobile */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:w-auto">
                  <div className="rounded-lg p-3 sm:bg-white sm:p-2 sm:shadow-sm xl:hidden">
                    <div className="flex flex-row items-center gap-2 max-sm:justify-between sm:gap-3">
                      <span className="text-sm font-medium text-gray-500">Time Range:</span>
                      <div className="relative xl:hidden">
                        <button
                          type="button"
                          onClick={() => setIsMobileFilterOpen((prev) => !prev)}
                          className="inline-flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          <span>{getTimeFilterLabel(timeFilter)}</span>
                          <svg
                            className="size-4 text-gray-500"
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

                        {isMobileFilterOpen && (
                          <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-100 bg-white py-1 text-sm shadow-lg">
                            <div className="border-b border-gray-100 px-3 py-2">
                              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Time Range
                              </div>
                            </div>
                            {(["day", "week", "month", "quarter", "year"] as TimeFilter[]).map((filter) => (
                              <button
                                key={filter}
                                type="button"
                                onClick={() => handleTimeFilterChange(filter)}
                                className={`block w-full px-3 py-2 text-left capitalize ${
                                  timeFilter === filter ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {getTimeFilterLabel(filter)}
                              </button>
                            ))}

                            <div className="mb-2 mt-2 border-b border-gray-100"></div>
                            <div className="px-3 py-2">
                              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Auto-refresh
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={togglePolling}
                              className={`flex w-full items-center justify-between px-3 py-2 ${
                                isPolling ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {isPolling ? (
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                  </svg>
                                ) : (
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                )}
                                {isPolling ? "Enabled" : "Disabled"}
                              </span>
                            </button>

                            {isPolling && (
                              <div className="px-3 py-2">
                                <DropdownPopover
                                  options={pollingOptions}
                                  selectedValue={pollingInterval}
                                  onSelect={handlePollingIntervalChange}
                                >
                                  {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                                </DropdownPopover>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Collection Efficiency Card */}
            <div className="mb-6">
              <Card title="Collection Efficiency" icon={<CollectionIcon />}>
                {collectionEfficiencyLoading ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-6"
                      >
                        <div className="mb-2 h-4 w-24 rounded bg-gray-200"></div>
                        <div className="mb-2 h-8 w-32 rounded bg-gray-300"></div>
                        <div className="h-4 w-20 rounded bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                ) : collectionEfficiencyError ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-lg font-semibold text-red-600">Error</div>
                      <div className="text-sm text-gray-600">{collectionEfficiencyError}</div>
                      <button
                        onClick={handleRefreshData}
                        className="mt-4 rounded-md bg-[#004B23] px-4 py-2 text-sm text-white hover:bg-[#003318]"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : !collectionEfficiencyData ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-lg font-semibold text-gray-900">No data available</div>
                      <div className="text-sm text-gray-600">Try changing the time range.</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {/* Efficiency Percentage */}
                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
                      <div className="mb-2 text-sm font-medium uppercase tracking-wide text-green-600">
                        Collection Efficiency
                      </div>
                      <div className="text-3xl font-bold text-green-700">
                        {collectionEfficiencyData.efficiencyPercent?.toFixed(1) || "0.0"}%
                      </div>
                      <div className="mt-2 text-sm text-green-700">
                        {collectionEfficiencyData.efficiencyPercent >= 90
                          ? "Excellent Performance"
                          : collectionEfficiencyData.efficiencyPercent >= 80
                          ? "Good Performance"
                          : "Needs Improvement"}
                      </div>
                    </div>

                    {/* Total Billed */}
                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                      <div className="mb-2 text-sm font-medium uppercase tracking-wide text-blue-600">Total Billed</div>
                      <div className="text-3xl font-bold text-blue-900">
                        {formatCurrency(collectionEfficiencyData.totalBilled)}
                      </div>
                      <div className="mt-2 text-sm text-blue-700">
                        {collectionEfficiencyData.billCount?.toLocaleString() || "0"} bills issued
                      </div>
                    </div>

                    {/* Total Collected */}
                    <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                      <div className="mb-2 text-sm font-medium uppercase tracking-wide text-purple-600">
                        Total Collected
                      </div>
                      <div className="text-3xl font-bold text-purple-900">
                        {formatCurrency(collectionEfficiencyData.totalCollected)}
                      </div>
                      <div className="mt-2 text-sm text-purple-700">
                        {collectionEfficiencyData.billsWithPayments?.toLocaleString() || "0"} paid bills
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                      <div className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-600">
                        Performance vs Target
                      </div>
                      <div className="mb-4">
                        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                            style={{ width: `${Math.min(collectionEfficiencyData.efficiencyPercent || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span>Target: 85%</span>
                          <span className="font-semibold">
                            {collectionEfficiencyData.efficiencyPercent?.toFixed(1) || "0.0"}%
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {collectionEfficiencyData.efficiencyPercent >= 85 ? "Above target" : "Below target"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Summary Metrics */}
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Quick Stats Cards */}
              <Card title="Overall Performance" icon={<RevenueIcon />}>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Efficiency Rate</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {collectionEfficiencyData?.efficiencyPercent?.toFixed(1) || "0.0"}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Outstanding Arrears</div>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(outstandingArrearsData?.totalOutstanding || 0)}
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Collection Summary" icon={<CollectionIcon />}>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Billed</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(collectionEfficiencyData?.totalBilled || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Total Collected</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(collectionEfficiencyData?.totalCollected || 0)}
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Customer Metrics" icon={<CustomeraIcon />}>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Customers in Arrears</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {outstandingArrearsData?.customersInArrears.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Bills with Payments</div>
                    <div className="text-xl font-bold text-blue-600">
                      {collectionEfficiencyData?.billsWithPayments?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Outstanding Arrears Section */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Outstanding Arrears Card */}
              <Card title="Outstanding Arrears" icon={<RevenueIcon />}>
                {outstandingArrearsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="mb-2 h-4 w-32 rounded bg-gray-200"></div>
                        <div className="h-8 w-40 rounded bg-gray-300"></div>
                      </div>
                    ))}
                  </div>
                ) : outstandingArrearsError ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-lg font-semibold text-red-600">Error</div>
                      <div className="text-sm text-gray-600">{outstandingArrearsError}</div>
                    </div>
                  </div>
                ) : !outstandingArrearsData ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-lg font-semibold text-gray-900">No arrears data</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Total Outstanding */}
                    <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-6">
                      <div className="mb-2 text-sm font-medium uppercase tracking-wide text-red-600">
                        Total Outstanding
                      </div>
                      <div className="text-3xl font-bold text-red-900">
                        {formatCurrency(outstandingArrearsData.totalOutstanding)}
                      </div>
                      <div className="mt-2 text-sm text-red-700">
                        {outstandingArrearsData.customersInArrears.toLocaleString()} customers in arrears
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                        <div className="text-sm font-medium uppercase tracking-wide text-orange-600">Total Debits</div>
                        <div className="mt-1 text-2xl font-bold text-orange-900">
                          {formatCurrency(outstandingArrearsData.totalDebits)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4">
                        <div className="text-sm font-medium uppercase tracking-wide text-green-600">Total Credits</div>
                        <div className="mt-1 text-2xl font-bold text-green-900">
                          {formatCurrency(outstandingArrearsData.totalCredits)}
                        </div>
                      </div>
                    </div>

                    {/* Net Amount */}
                    <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                      <div className="text-sm font-medium uppercase tracking-wide text-gray-600">Net Outstanding</div>
                      <div className="mt-1 text-2xl font-bold text-gray-900">
                        {formatCurrency(outstandingArrearsData.totalDebits - outstandingArrearsData.totalCredits)}
                      </div>
                      <div className="mt-1 text-sm text-gray-700">Debits minus credits</div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Collection by Band Card */}
              <Card title="Collection by Band" icon={<BillingIcon />}>
                {collectionByBandLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="w-full">
                      <div className="mb-4 h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                            <div className="h-3 flex-1 animate-pulse rounded bg-gray-200"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : collectionByBandError ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-lg font-semibold text-red-600">Error</div>
                      <div className="text-sm text-gray-600">{collectionByBandError}</div>
                    </div>
                  </div>
                ) : !collectionByBandData || !collectionByBandData.slices?.length ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-lg font-semibold text-gray-900">No collection band data</div>
                      <div className="text-sm text-gray-600">Try changing the time range.</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium uppercase tracking-wide text-blue-600">Total Amount</div>
                          <div className="mt-1 text-2xl font-bold text-blue-900">
                            {formatCurrency(collectionByBandData.slices.reduce((sum, slice) => sum + slice.amount, 0))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium uppercase tracking-wide text-blue-600">Total Count</div>
                          <div className="mt-1 text-2xl font-bold text-blue-900">
                            {collectionByBandData.slices.reduce((sum, slice) => sum + slice.count, 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={collectionByBandData.slices.map((slice) => ({
                            name: slice.label,
                            amount: slice.amount,
                            count: slice.count,
                            percentage: slice.percentage,
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "amount" ? formatCurrency(value as number) : value,
                              name === "amount" ? "Amount" : name === "count" ? "Count" : "Percentage",
                            ]}
                          />
                          <Legend />
                          <Bar dataKey="amount" name="Amount" fill="#3b82f6" />
                          <Bar dataKey="count" name="Count" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Detailed Table */}
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Band</th>
                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Amount</th>
                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Count</th>
                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {collectionByBandData.slices.map((slice, index) => (
                            <tr key={slice.label} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="size-3 rounded-full"
                                    style={{
                                      backgroundColor: COLLECTION_BAND_COLORS[index % COLLECTION_BAND_COLORS.length],
                                    }}
                                  />
                                  <span className="text-sm font-medium">{slice.label}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right font-medium">{formatCurrency(slice.amount)}</td>
                              <td className="px-4 py-2 text-right">{slice.count.toLocaleString()}</td>
                              <td className="px-4 py-2 text-right">
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                                  {(slice.percentage || 0).toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* CBO Performance Section */}
            <div className="mb-6">
              <Card title="CBO Performance" icon={<CustomeraIcon />}>
                {cboPerformanceLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="w-full">
                      <div className="mb-4 h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-48 w-full animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ) : cboPerformanceError ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-lg font-semibold text-red-600">Error</div>
                      <div className="text-sm text-gray-600">{cboPerformanceError}</div>
                    </div>
                  </div>
                ) : !cboPerformanceData || !cboPerformanceData.slices?.length ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-lg font-semibold text-gray-900">No CBO performance data</div>
                      <div className="text-sm text-gray-600">Try changing the time range.</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                        <div className="text-sm font-medium uppercase tracking-wide text-purple-600">
                          Average Performance
                        </div>
                        <div className="mt-2 text-3xl font-bold text-purple-900">
                          {(
                            cboPerformanceData.slices.reduce((sum, slice) => sum + slice.percentage, 0) /
                            cboPerformanceData.slices.length
                          ).toFixed(1)}
                          %
                        </div>
                        <div className="mt-2 text-sm text-purple-700">Across all CBOs</div>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
                        <div className="text-sm font-medium uppercase tracking-wide text-green-600">
                          Total Collection
                        </div>
                        <div className="mt-2 text-3xl font-bold text-green-900">
                          {formatCurrency(cboPerformanceData.slices.reduce((sum, slice) => sum + slice.amount, 0))}
                        </div>
                        <div className="mt-2 text-sm text-green-700">Combined CBO collections</div>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                        <div className="text-sm font-medium uppercase tracking-wide text-blue-600">
                          Total Transactions
                        </div>
                        <div className="mt-2 text-3xl font-bold text-blue-900">
                          {cboPerformanceData.slices.reduce((sum, slice) => sum + slice.count, 0).toLocaleString()}
                        </div>
                        <div className="mt-2 text-sm text-blue-700">Total transaction count</div>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Pie Chart */}
                      <div className="h-80">
                        <h4 className="mb-4 text-sm font-medium text-gray-700">Performance Distribution</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={cboPerformanceData.slices}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.label}: ${(entry.percentage || 0).toFixed(1)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="percentage"
                            >
                              {cboPerformanceData.slices.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name, props) => [
                                name === "percentage"
                                  ? `${value}%`
                                  : name === "amount"
                                  ? formatCurrency(value as number)
                                  : value,
                                name === "percentage" ? "Performance" : name === "amount" ? "Amount" : "Count",
                              ]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Bar Chart */}
                      <div className="h-80">
                        <h4 className="mb-4 text-sm font-medium text-gray-700">Performance Comparison</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={cboPerformanceData.slices.map((slice) => ({
                              name: slice.label,
                              performance: slice.percentage,
                              amount: slice.amount / 1000, // Convert to thousands for better display
                              count: slice.count,
                            }))}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip
                              formatter={(value, name) => [
                                name === "performance"
                                  ? `${value}%`
                                  : name === "amount"
                                  ? `${formatCurrency((value as number) * 1000)}`
                                  : value,
                                name === "performance" ? "Performance %" : name === "amount" ? "Amount (K)" : "Count",
                              ]}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="performance" name="Performance %" fill="#004B23" />
                            <Bar yAxisId="right" dataKey="count" name="Transaction Count" fill="#38b000" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Performance Table */}
                    <div className="rounded-lg border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                CBO
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Performance
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Amount Collected
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Transactions
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {cboPerformanceData.slices.map((slice, index) => {
                              const performanceStatus =
                                slice.percentage >= 90
                                  ? "Excellent"
                                  : slice.percentage >= 80
                                  ? "Good"
                                  : slice.percentage >= 70
                                  ? "Average"
                                  : "Needs Improvement"
                              const statusColor =
                                slice.percentage >= 90
                                  ? "bg-green-100 text-green-800"
                                  : slice.percentage >= 80
                                  ? "bg-blue-100 text-blue-800"
                                  : slice.percentage >= 70
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"

                              return (
                                <tr key={slice.label} className="hover:bg-gray-50">
                                  <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0">
                                        <div
                                          className="flex size-8 items-center justify-center rounded-full font-bold text-white"
                                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        >
                                          {slice.label.charAt(0)}
                                        </div>
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{slice.label}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="mr-2 text-sm text-gray-900">
                                        {(slice.percentage || 0).toFixed(1)}%
                                      </div>
                                      <div className="w-32">
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                          <div
                                            className="h-2 rounded-full"
                                            style={{
                                              width: `${Math.min(slice.percentage, 100)}%`,
                                              backgroundColor: COLORS[index % COLORS.length],
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    {formatCurrency(slice.amount)}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {slice.count.toLocaleString()}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColor}`}
                                    >
                                      {performanceStatus}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InstallMeterModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />
    </section>
  )
}
