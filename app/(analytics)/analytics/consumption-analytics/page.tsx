"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { motion } from "framer-motion"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import {
  clearConsumptionAnalytics,
  clearMetersProgrammed,
  clearNewConnections,
  clearPostpaidTrend,
  clearPrepaidTokens,
  clearPrepaidVends,
  fetchConsumptionAnalytics,
  fetchMetersProgrammed,
  fetchNewConnections,
  fetchPostpaidTrend,
  fetchPrepaidTokens,
  fetchPrepaidVends,
} from "lib/redux/consumptionAnalyticsSlice"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  BillingIcon,
  CollectionIcon,
  ConnectionIcon,
  CustomeraIcon,
  MetersProgrammedIcon,
  RevenueIcon,
  TokenGeneratedIcon,
  VendingIcon,
} from "components/Icons/Icons"

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

// Time filter types
type TimeFilter = "day" | "week" | "month" | "year" | "all"

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
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-gray-200"></div>
        <div className="h-10 w-32 rounded bg-gray-200"></div>
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

// Card Component
const Card = ({
  children,
  className = "",
  title,
  icon,
  trend,
}: {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: React.ReactNode
  trend?: { value: string; positive: boolean }
}) => (
  <div className={`rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}>
    <div className="mb-4 flex items-center justify-between">
      {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
      {icon && <div className="text-gray-400">{icon}</div>}
    </div>
    {children}
    {trend && (
      <div className={`mt-2 text-sm ${trend.positive ? "text-green-500" : "text-red-500"}`}>
        {trend.positive ? "↑" : "↓"} {trend.value}
      </div>
    )}
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

// Trend Indicator Component
const TrendIndicator = ({ value, positive }: { value: string; positive: boolean }) => (
  <span className={`inline-flex items-center ${positive ? "text-green-500" : "text-red-500"}`}>
    {positive ? (
      <svg className="mr-1 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="mr-1 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )}
    {value}
  </span>
)

// Time Filter Button Component
const TimeFilterButton = ({
  filter,
  label,
  currentFilter,
  onClick,
}: {
  filter: TimeFilter
  label: string
  currentFilter: TimeFilter
  onClick: (filter: TimeFilter) => void
}) => (
  <button
    onClick={() => onClick(filter)}
    className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      currentFilter === filter ? "bg-[#004B23] text-[#FFFFFF]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
    }`}
  >
    {label}
  </button>
)

export default function MeteringDashboard() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month")
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState<string>("NGN")
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(300000) // 5 minutes default

  const dispatch = useAppDispatch()
  const {
    data: consumptionData,
    loading: consumptionLoading,
    error: consumptionError,
    isSuccess: consumptionSuccess,
    postpaidTrendData,
    postpaidTrendLoading,
    postpaidTrendError,
    postpaidTrendSuccess,
    prepaidVendsData,
    prepaidVendsLoading,
    prepaidVendsError,
    prepaidVendsSuccess,
    prepaidTokensData,
    prepaidTokensLoading,
    prepaidTokensError,
    prepaidTokensSuccess,
    newConnectionsData,
    newConnectionsLoading,
    newConnectionsError,
    newConnectionsSuccess,
    metersProgrammedData,
    metersProgrammedLoading,
    metersProgrammedError,
    metersProgrammedSuccess,
  } = useAppSelector((state) => state.consumptionAnalytics)

  // Calculate totals from API data
  const totalEnergyDelivered = (consumptionData || []).reduce((acc, point) => acc + point.energyDeliveredKwh, 0)
  const totalEnergyBilled = (consumptionData || []).reduce((acc, point) => acc + point.energyBilledKwh, 0)
  const totalCustomers =
    (prepaidVendsData || []).reduce((acc, point) => acc + point.vendCount, 0) + (postpaidTrendData || []).length
  const totalPrepaidCustomers = (prepaidVendsData || []).reduce((acc, point) => acc + point.vendCount, 0)
  const totalPostpaidCustomers = totalCustomers - totalPrepaidCustomers
  const totalMeters = totalCustomers // Assuming one meter per customer
  const readSuccessRate = consumptionData.length > 0 ? 95.5 : 0 // Placeholder - should come from API
  const alerts = 0 // Placeholder - should come from API
  const collectionEfficiency = 90.2 // Placeholder - should come from API

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatKwh = (num: number) => {
    return `${num.toLocaleString()} kWh`
  }

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh data after adding customer
    refreshConsumptionData()
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    refreshConsumptionData()
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const refreshConsumptionData = useCallback(() => {
    const now = new Date()
    const endDateUtc = now.toISOString()
    const start = new Date(now)

    if (timeFilter === "day") {
      start.setUTCDate(start.getUTCDate() - 1)
    } else if (timeFilter === "week") {
      start.setUTCDate(start.getUTCDate() - 7)
    } else if (timeFilter === "month") {
      start.setUTCMonth(start.getUTCMonth() - 1)
    } else if (timeFilter === "year") {
      start.setUTCFullYear(start.getUTCFullYear() - 1)
    } else {
      start.setUTCFullYear(start.getUTCFullYear() - 10)
    }

    const startDateUtc = start.toISOString()

    // Fetch all consumption analytics data
    dispatch(
      fetchConsumptionAnalytics({
        StartDateUtc: startDateUtc,
        EndDateUtc: endDateUtc,
      })
    )

    dispatch(
      fetchPostpaidTrend({
        StartDateUtc: startDateUtc,
        EndDateUtc: endDateUtc,
      })
    )

    dispatch(
      fetchPrepaidVends({
        StartDateUtc: startDateUtc,
        EndDateUtc: endDateUtc,
      })
    )

    dispatch(
      fetchPrepaidTokens({
        StartDateUtc: startDateUtc,
        EndDateUtc: endDateUtc,
      })
    )

    dispatch(
      fetchNewConnections({
        StartDateUtc: startDateUtc,
        EndDateUtc: endDateUtc,
      })
    )

    dispatch(
      fetchMetersProgrammed({
        StartDateUtc: startDateUtc,
        EndDateUtc: endDateUtc,
      })
    )
  }, [dispatch, timeFilter])

  useEffect(() => {
    refreshConsumptionData()

    // Cleanup on unmount
    return () => {
      dispatch(clearConsumptionAnalytics())
      dispatch(clearPostpaidTrend())
      dispatch(clearPrepaidVends())
      dispatch(clearPrepaidTokens())
      dispatch(clearNewConnections())
      dispatch(clearMetersProgrammed())
    }
  }, [dispatch, timeFilter, refreshConsumptionData])

  // Short polling effect
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      refreshConsumptionData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [dispatch, timeFilter, isPolling, pollingInterval, refreshConsumptionData])

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

  const getTimeFilterLabel = (filter: TimeFilter) => {
    if (filter === "day") return "Today"
    if (filter === "week") return "This Week"
    if (filter === "month") return "This Month"
    if (filter === "year") return "This Year"
    return "All Time"
  }

  // Prepare chart data
  const energyBalanceChartData = (consumptionData || []).map((point) => ({
    name: point.feederName,
    delivered: point.energyDeliveredKwh,
    billed: point.energyBilledKwh,
  }))

  const postpaidTrendChartData = (postpaidTrendData || []).map((point) => ({
    date: new Date(point.periodStart).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
    }),
    delivered: point.energyDeliveredKwh,
    billed: point.energyBilledKwh,
  }))

  const prepaidVendsChartData = (prepaidVendsData || []).map((point) => ({
    date: new Date(point.bucketDate).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
    }),
    vends: point.vendCount,
    tokens: point.tokenCount,
    kwh: point.totalKwh,
    amount: point.totalAmount,
  }))

  const prepaidTokensChartData = (prepaidTokensData || []).map((point) => ({
    date: new Date(point.bucketDate).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
    }),
    totalTokens: point.totalTokens,
    keyChangeTokens: point.keyChangeTokens,
    clearTamperTokens: point.clearTamperTokens,
    clearCreditTokens: point.clearCreditTokens,
  }))

  const newConnectionsChartData = (newConnectionsData.points || []).map((point) => ({
    date: new Date(point.bucketDate).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
    }),
    connections: point.count,
  }))

  const metersProgrammedChartData = (metersProgrammedData || []).map((point) => ({
    date: new Date(point.bucketDate).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
    }),
    programmed: point.programmedCount,
    distinct: point.distinctMeters,
  }))

  const COLORS = ["#004B23", "#38b000", "#007200", "#4f46e5", "#ea5806", "#dc2626"]

  const getCardIcon = (title: string) => {
    const normalized = title.toLowerCase()
    if (normalized.includes("revenue")) return <RevenueIcon />
    if (normalized.includes("consumption") || normalized.includes("energy")) return <CollectionIcon />
    if (normalized.includes("customer")) return <CustomeraIcon />
    if (normalized.includes("meter")) return <MetersProgrammedIcon />
    if (normalized.includes("alert")) return <BillingIcon />
    if (normalized.includes("token")) return <TokenGeneratedIcon />
    if (normalized.includes("connection")) return <ConnectionIcon />
    if (normalized.includes("vend")) return <VendingIcon />
    return <RevenueIcon />
  }

  // Calculate totals
  const totalPrepaidVends = (prepaidVendsData || []).reduce((acc, point) => acc + point.vendCount, 0)
  const totalPrepaidTokens = (prepaidTokensData || []).reduce((acc, point) => acc + point.totalTokens, 0)
  const totalKeyChangeTokens = (prepaidTokensData || []).reduce((acc, point) => acc + point.keyChangeTokens, 0)
  const totalClearTamperTokens = (prepaidTokensData || []).reduce((acc, point) => acc + point.clearTamperTokens, 0)
  const totalClearCreditTokens = (prepaidTokensData || []).reduce((acc, point) => acc + point.clearCreditTokens, 0)
  const totalMetersProgrammed = (metersProgrammedData || []).reduce((acc, point) => acc + point.programmedCount, 0)
  const totalDistinctMetersProgrammed = (metersProgrammedData || []).reduce(
    (acc, point) => acc + point.distinctMeters,
    0
  )

  // Calculate energy efficiency
  const calculateEnergyEfficiency = () => {
    if (consumptionData.length === 0) return 0
    const totalDelivered = consumptionData.reduce((acc, point) => acc + point.energyDeliveredKwh, 0)
    const totalBilled = consumptionData.reduce((acc, point) => acc + point.energyBilledKwh, 0)
    return totalDelivered > 0 ? (totalBilled / totalDelivered) * 100 : 0
  }

  const energyEfficiency = calculateEnergyEfficiency()

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto w-full px-3 py-8 xl:container xl:px-16">
            {/* Header Section */}
            <div className="mb-6 flex w-full flex-col gap-4">
              <div className="flex w-full items-start justify-between max-2xl:flex-col">
                <div>
                  <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl lg:text-3xl">
                    Consumption Analytics
                  </h1>
                  <p className="text-sm font-medium text-gray-500 sm:text-base">
                    Real-time overview of energy consumption
                  </p>
                </div>
                <div className="hidden rounded-lg p-3 max-2xl:mt-4 sm:bg-white sm:p-2 sm:shadow-sm xl:flex">
                  <div className="flex flex-row items-center gap-4 max-sm:justify-between sm:gap-4">
                    <div className="flex flex-row items-center gap-2 max-sm:justify-between sm:gap-3">
                      <span className="text-sm font-medium text-gray-500">Time Range:</span>
                      <div className="hidden items-center gap-2 sm:flex">
                        <TimeFilterButton
                          filter="day"
                          label="Today"
                          currentFilter={timeFilter}
                          onClick={handleTimeFilterChange}
                        />
                        <TimeFilterButton
                          filter="week"
                          label="This Week"
                          currentFilter={timeFilter}
                          onClick={handleTimeFilterChange}
                        />
                        <TimeFilterButton
                          filter="month"
                          label="This Month"
                          currentFilter={timeFilter}
                          onClick={handleTimeFilterChange}
                        />
                        <TimeFilterButton
                          filter="year"
                          label="This Year"
                          currentFilter={timeFilter}
                          onClick={handleTimeFilterChange}
                        />
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

              {/* Mobile Time Filter Section */}
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
                            <button
                              type="button"
                              onClick={() => handleTimeFilterChange("day")}
                              className={`block w-full px-3 py-2 text-left ${
                                timeFilter === "day" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              Today
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTimeFilterChange("week")}
                              className={`block w-full px-3 py-2 text-left ${
                                timeFilter === "week" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              This Week
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTimeFilterChange("month")}
                              className={`block w-full px-3 py-2 text-left ${
                                timeFilter === "month" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              This Month
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTimeFilterChange("year")}
                              className={`block w-full px-3 py-2 text-left ${
                                timeFilter === "year" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              This Year
                            </button>

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

            {/* Quick Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
              <Card title="Total Energy Consumption" icon={getCardIcon("Total Energy Consumption")}>
                <div className="mb-2 flex items-center justify-between border-b py-2">
                  <Text>Delivered vs Billed</Text>
                  <Text className="text-xs">{getTimeFilterLabel(timeFilter)}</Text>
                </div>
                <Metric>{formatKwh(totalEnergyDelivered)}</Metric>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-green-600">Billed: {formatKwh(totalEnergyBilled)}</span>
                  <span className="text-blue-600">Efficiency: {energyEfficiency.toFixed(1)}%</span>
                </div>
              </Card>

              <Card title="Prepaid Operations" icon={getCardIcon("Prepaid Operations")}>
                <div className="mb-2 flex items-center justify-between border-b py-2">
                  <Text>Vends & Tokens</Text>
                  <Text className="text-xs">{getTimeFilterLabel(timeFilter)}</Text>
                </div>
                <Metric>{formatNumber(totalPrepaidVends)} vends</Metric>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-green-600">{formatNumber(totalPrepaidTokens)} tokens</span>
                  <span className="text-blue-600">{formatNumber(totalPrepaidCustomers)} customers</span>
                </div>
              </Card>

              <Card title="Meter Operations" icon={getCardIcon("Meter Operations")}>
                <div className="mb-2 flex items-center justify-between border-b py-2">
                  <Text>Programming & Connections</Text>
                  <Text className="text-xs">{getTimeFilterLabel(timeFilter)}</Text>
                </div>
                <Metric>{formatNumber(totalMeters)}</Metric>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-green-600">Programmed: {formatNumber(totalMetersProgrammed)}</span>
                  <span className="text-blue-600">New: {formatNumber(newConnectionsData.totalConnections || 0)}</span>
                </div>
              </Card>

              <Card title="System Performance" icon={getCardIcon("System Performance")}>
                <div className="mb-2 flex items-center justify-between border-b py-2">
                  <Text>Success Rate & Alerts</Text>
                  <Text className="text-xs">{getTimeFilterLabel(timeFilter)}</Text>
                </div>
                <Metric>{readSuccessRate}%</Metric>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-green-600">Efficiency: {collectionEfficiency}%</span>
                  <span className="text-red-600">Alerts: {formatNumber(alerts)}</span>
                </div>
              </Card>
            </div>

            {/* Main Analytics Section */}
            <div className="mb-6 grid grid-cols-1 gap-6 ">
              {/* Energy Balance Chart */}
              <div className="lg:col-span-2">
                <Card title="Energy Balance by Feeder">
                  {consumptionLoading ? (
                    <div className="animate-pulse">
                      <div className="h-[300px] w-full rounded bg-gray-200" />
                    </div>
                  ) : consumptionError ? (
                    <div className="flex h-[300px] items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="text-center">
                        <div className="mb-2 text-lg font-semibold text-red-600">Error Loading Data</div>
                        <div className="text-sm text-gray-600">{consumptionError}</div>
                        <button
                          onClick={refreshConsumptionData}
                          className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : energyBalanceChartData.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="mb-2 text-lg font-semibold text-gray-900">No Energy Data</div>
                        <div className="text-sm text-gray-600">Try changing the time range</div>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={energyBalanceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatKwh(Number(value)), "kWh"]} />
                        <Legend />
                        <Bar dataKey="delivered" name="Energy Delivered" fill="#004B23" />
                        <Bar dataKey="billed" name="Energy Billed" fill="#38b000" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </div>
            </div>

            {/* Postpaid Trend and Prepaid Operations */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Postpaid Energy Trend */}
              <Card title="Postpaid Energy Trend">
                {postpaidTrendLoading ? (
                  <div className="animate-pulse">
                    <div className="h-[250px] w-full rounded bg-gray-200" />
                  </div>
                ) : postpaidTrendError ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-red-600">Error</div>
                      <div className="text-xs text-gray-600">{postpaidTrendError}</div>
                    </div>
                  </div>
                ) : postpaidTrendChartData.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-gray-900">No Postpaid Data</div>
                      <div className="text-xs text-gray-600">Try changing the time range</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={postpaidTrendChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatKwh(Number(value)), "kWh"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="delivered"
                        stroke="#004B23"
                        activeDot={{ r: 8 }}
                        name="Energy Delivered"
                      />
                      <Line type="monotone" dataKey="billed" stroke="#38b000" name="Energy Billed" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* Prepaid Vends Trend */}
              <Card title="Prepaid Vends Trend">
                {prepaidVendsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-[250px] w-full rounded bg-gray-200" />
                  </div>
                ) : prepaidVendsError ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-red-600">Error</div>
                      <div className="text-xs text-gray-600">{prepaidVendsError}</div>
                    </div>
                  </div>
                ) : prepaidVendsChartData.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-gray-900">No Prepaid Vends Data</div>
                      <div className="text-xs text-gray-600">Try changing the time range</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={prepaidVendsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="vends"
                        stroke="#004B23"
                        fill="#004B23"
                        fillOpacity={0.3}
                        name="Vends Count"
                      />
                      <Area
                        type="monotone"
                        dataKey="tokens"
                        stroke="#38b000"
                        fill="#38b000"
                        fillOpacity={0.3}
                        name="Tokens Count"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            {/* Token Operations and New Connections */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Token Types Breakdown */}
              <Card title="Token Types Breakdown">
                {prepaidTokensLoading ? (
                  <div className="animate-pulse">
                    <div className="h-[250px] w-full rounded bg-gray-200" />
                  </div>
                ) : prepaidTokensError ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-red-600">Error</div>
                      <div className="text-xs text-gray-600">{prepaidTokensError}</div>
                    </div>
                  </div>
                ) : prepaidTokensChartData.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-gray-900">No Token Data</div>
                      <div className="text-xs text-gray-600">Try changing the time range</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={prepaidTokensChartData.slice(-10)}>
                      {" "}
                      {/* Last 10 data points */}
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="keyChangeTokens" fill="#004B23" name="Key Change Tokens" />
                      <Bar dataKey="clearTamperTokens" fill="#38b000" name="Clear Tamper Tokens" />
                      <Bar dataKey="clearCreditTokens" fill="#007200" name="Clear Credit Tokens" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* New Connections Trend */}
              <Card title="New Connections Trend">
                {newConnectionsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-[250px] w-full rounded bg-gray-200" />
                  </div>
                ) : newConnectionsError ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-red-600">Error</div>
                      <div className="text-xs text-gray-600">{newConnectionsError}</div>
                    </div>
                  </div>
                ) : newConnectionsChartData.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-gray-900">No Connections Data</div>
                      <div className="text-xs text-gray-600">Try changing the time range</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={newConnectionsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="connections"
                        stroke="#004B23"
                        fill="#004B23"
                        fillOpacity={0.3}
                        name="New Connections"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            {/* Meter Programming and Performance */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Meters Programmed Trend */}
              <Card title="Meters Programmed Trend">
                {metersProgrammedLoading ? (
                  <div className="animate-pulse">
                    <div className="h-[250px] w-full rounded bg-gray-200" />
                  </div>
                ) : metersProgrammedError ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-red-600">Error</div>
                      <div className="text-xs text-gray-600">{metersProgrammedError}</div>
                    </div>
                  </div>
                ) : metersProgrammedChartData.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-gray-900">No Programming Data</div>
                      <div className="text-xs text-gray-600">Try changing the time range</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={metersProgrammedChartData.slice(-10)}>
                      {" "}
                      {/* Last 10 data points */}
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="programmed" fill="#004B23" name="Programmed Count" />
                      <Bar dataKey="distinct" fill="#38b000" name="Distinct Meters" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* Performance Summary */}
              <Card title="Performance Summary">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="text-sm font-medium text-blue-600">Energy Efficiency</div>
                    <div className="text-2xl font-bold text-blue-900">{energyEfficiency.toFixed(1)}%</div>
                    <div className="mt-1 h-2 w-full rounded-full bg-blue-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.min(energyEfficiency, 100)}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-blue-600">Billed vs Delivered</div>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="text-sm font-medium text-green-600">Read Success Rate</div>
                    <div className="text-2xl font-bold text-green-900">{readSuccessRate}%</div>
                    <div className="mt-1 h-2 w-full rounded-full bg-green-200">
                      <div className="h-full rounded-full bg-green-600" style={{ width: `${readSuccessRate}%` }}></div>
                    </div>
                    <div className="mt-1 text-xs text-green-600">Meter readings</div>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-4">
                    <div className="text-sm font-medium text-purple-600">Collection Efficiency</div>
                    <div className="text-2xl font-bold text-purple-900">{collectionEfficiency}%</div>
                    <div className="mt-1 h-2 w-full rounded-full bg-purple-200">
                      <div
                        className="h-full rounded-full bg-purple-600"
                        style={{ width: `${collectionEfficiency}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-purple-600">Revenue collection</div>
                  </div>

                  <div className="rounded-lg bg-orange-50 p-4">
                    <div className="text-sm font-medium text-orange-600">Active Alerts</div>
                    <div className="text-2xl font-bold text-orange-900">{formatNumber(alerts)}</div>
                    <div className="mt-1 text-xs text-orange-600">Require attention</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Detailed Token Statistics */}
            <div className="mb-6">
              <Card title="Token Statistics Summary">
                {prepaidTokensLoading ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="rounded-lg bg-gray-100 p-6">
                        <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-300"></div>
                        <div className="mb-2 h-8 w-24 animate-pulse rounded bg-gray-400"></div>
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                      </div>
                    ))}
                  </div>
                ) : prepaidTokensError ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-lg font-semibold text-red-600">Error</div>
                      <div className="text-sm text-gray-600">{prepaidTokensError}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                      <div className="mb-2 text-sm font-medium uppercase tracking-wide text-blue-600">
                        Total Tokens Generated
                      </div>
                      <div className="text-3xl font-bold text-blue-900">{formatNumber(totalPrepaidTokens)}</div>
                      <div className="mt-2 text-sm text-blue-700">{prepaidTokensChartData.length} days of data</div>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
                      <div className="mb-2 text-sm font-medium uppercase tracking-wide text-green-600">
                        Key Change Tokens
                      </div>
                      <div className="text-3xl font-bold text-green-900">{formatNumber(totalKeyChangeTokens)}</div>
                      <div className="mt-2 text-sm text-green-700">
                        {((totalKeyChangeTokens / totalPrepaidTokens) * 100).toFixed(1)}% of total
                      </div>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                      <div className="mb-2 text-sm font-medium uppercase tracking-wide text-purple-600">
                        Clear Tamper Tokens
                      </div>
                      <div className="text-3xl font-bold text-purple-900">{formatNumber(totalClearTamperTokens)}</div>
                      <div className="mt-2 text-sm text-purple-700">
                        {((totalClearTamperTokens / totalPrepaidTokens) * 100).toFixed(1)}% of total
                      </div>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-6">
                      <div className="mb-2 text-sm font-medium uppercase tracking-wide text-orange-600">
                        Clear Credit Tokens
                      </div>
                      <div className="text-3xl font-bold text-orange-900">{formatNumber(totalClearCreditTokens)}</div>
                      <div className="mt-2 text-sm text-orange-700">
                        {((totalClearCreditTokens / totalPrepaidTokens) * 100).toFixed(1)}% of total
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
