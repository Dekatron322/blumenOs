"use client"

import { DateFilter, getDateRangeUtcCapitalized } from "utils/dateRange"
import { formatCurrencyWithAbbreviation } from "utils/helpers"
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
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  PieChart as PieChartIcon,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"

// Performance Analytics Categories Component
const PerformanceAnalyticsCategories = ({
  collectionEfficiencyData,
  outstandingArrearsData,
}: {
  collectionEfficiencyData: any
  outstandingArrearsData: any
}) => {
  const formatNumber = (num: number) => num?.toLocaleString() || "0"

  // Calculate percentages
  const calculatePercentage = (part: number, total: number) => {
    return total > 0 ? Math.round((part / total) * 100) : 0
  }

  const collectionRate = calculatePercentage(
    collectionEfficiencyData?.totalCollected || 0,
    collectionEfficiencyData?.totalBilled || 0
  )
  const arrearsRate = calculatePercentage(
    outstandingArrearsData?.totalOutstanding || 0,
    collectionEfficiencyData?.totalBilled || 0
  )

  const categories = [
    {
      name: "Collection Efficiency",
      count: collectionEfficiencyData?.efficiencyPercent || 0,
      percentage: collectionEfficiencyData?.efficiencyPercent || 0,
      color: "green",
      icon: Target,
      description: "Overall collection performance",
      active: Math.round((collectionEfficiencyData?.totalCollected || 0) * 0.9),
      inactive: Math.round((collectionEfficiencyData?.totalCollected || 0) * 0.1),
    },
    {
      name: "Total Billed",
      count: collectionEfficiencyData?.totalBilled || 0,
      percentage: 100,
      color: "blue",
      icon: DollarSign,
      description: "Total amount billed",
      active: collectionEfficiencyData?.billCount || 0,
      inactive: Math.round((collectionEfficiencyData?.billCount || 0) * 0.1),
    },
    {
      name: "Outstanding Arrears",
      count: outstandingArrearsData?.totalOutstanding || 0,
      percentage: arrearsRate,
      color: "red",
      icon: AlertCircle,
      description: "Total outstanding amount",
      active: outstandingArrearsData?.customersInArrears || 0,
      inactive: Math.round((outstandingArrearsData?.customersInArrears || 0) * 0.2),
    },
  ]

  const colorClasses = {
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      light: "bg-green-100",
      dark: "bg-green-600",
      gradient: "from-green-500 to-green-600",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      light: "bg-blue-100",
      dark: "bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      light: "bg-red-100",
      dark: "bg-red-600",
      gradient: "from-red-500 to-red-600",
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-xl border border-gray-200 bg-white p-5"
    >
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-100 p-2">
            <PieChartIcon className="size-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
            <p className="text-sm text-gray-600">Key performance metrics and indicators</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Efficiency: {collectionEfficiencyData?.efficiencyPercent?.toFixed(1) || "0.0"}%
        </span>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {categories.map((category, index) => {
          const colors = colorClasses[category.color as keyof typeof colorClasses]
          const Icon = category.icon

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${colors.bg}`}>
                    <Icon className={`size-4 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${colors.text}`}>
                  {category.name === "Collection Efficiency"
                    ? `${category.count.toFixed(1)}%`
                    : formatNumber(category.count)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Performance</span>
                  <span className="font-medium text-gray-900">{category.percentage.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(category.percentage, 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                  />
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-emerald-50 p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="size-3 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">
                      {category.name === "Collection Efficiency"
                        ? "Target Achieved"
                        : category.name === "Total Billed"
                        ? "Bills Issued"
                        : category.name === "Outstanding Arrears"
                        ? "Active Accounts"
                        : "Completed"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-emerald-900">{formatNumber(category.active)}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="size-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">
                      {category.name === "Collection Efficiency"
                        ? "Below Target"
                        : category.name === "Total Billed"
                        ? "Pending Bills"
                        : category.name === "Outstanding Arrears"
                        ? "Overdue Accounts"
                        : "Pending"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-amber-900">{formatNumber(category.inactive)}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
        {/* Left Column - Collection Status */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Collection Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-100 p-1">
                  <CheckCircle className="size-3 text-emerald-700" />
                </div>
                <span className="text-sm text-gray-700">Bills with Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(collectionEfficiencyData?.billsWithPayments || 0)}
                </span>
                <span className="text-xs text-gray-500">
                  (
                  {calculatePercentage(
                    collectionEfficiencyData?.billsWithPayments || 0,
                    collectionEfficiencyData?.billCount || 0
                  )}
                  %)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-1">
                  <DollarSign className="size-3 text-blue-700" />
                </div>
                <span className="text-sm text-gray-700">Total Collected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(collectionEfficiencyData?.totalCollected || 0)}
                </span>
                <span className="text-xs text-gray-500">
                  (
                  {calculatePercentage(
                    collectionEfficiencyData?.totalCollected || 0,
                    collectionEfficiencyData?.totalBilled || 0
                  )}
                  %)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-100 p-1">
                  <BarChart3 className="size-3 text-purple-700" />
                </div>
                <span className="text-sm text-gray-700">Performance Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {collectionEfficiencyData?.efficiencyPercent?.toFixed(1) || "0.0"}%
                </span>
                <span className="text-xs text-gray-500">
                  {collectionEfficiencyData?.efficiencyPercent >= 90
                    ? "Excellent"
                    : collectionEfficiencyData?.efficiencyPercent >= 80
                    ? "Good"
                    : "Needs Improvement"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Arrears Status */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Arrears Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-red-100 p-1">
                  <AlertCircle className="size-3 text-red-700" />
                </div>
                <span className="text-sm text-gray-700">Customers in Arrears</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(outstandingArrearsData?.customersInArrears || 0)}
                </span>
                <span className="text-xs text-gray-500">
                  (
                  {calculatePercentage(
                    outstandingArrearsData?.customersInArrears || 0,
                    outstandingArrearsData?.totalOutstanding || 0
                  )}
                  %)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-orange-100 p-1">
                  <TrendingUp className="size-3 text-orange-700" />
                </div>
                <span className="text-sm text-gray-700">Total Debits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(outstandingArrearsData?.totalDebits || 0)}
                </span>
                <span className="text-xs text-gray-500">
                  (
                  {calculatePercentage(
                    outstandingArrearsData?.totalDebits || 0,
                    outstandingArrearsData?.totalOutstanding || 0
                  )}
                  %)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-green-100 p-1">
                  <TrendingDown className="size-3 text-green-700" />
                </div>
                <span className="text-sm text-gray-700">Total Credits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(outstandingArrearsData?.totalCredits || 0)}
                </span>
                <span className="text-xs text-gray-500">
                  (
                  {calculatePercentage(
                    outstandingArrearsData?.totalCredits || 0,
                    outstandingArrearsData?.totalOutstanding || 0
                  )}
                  %)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

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
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
          <div className="absolute right-0 z-20 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
                className={`block w-full px-3 py-2 text-left text-xs transition-colors ${
                  option.value === selectedValue
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
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

// Loading State Component
const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-[#004B23]" />
        <p className="text-sm text-gray-500">Loading performance data...</p>
      </div>
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

  // Fetch all performance data
  const fetchPerformanceData = useCallback(() => {
    const dateRange = getDateRangeUtcCapitalized(timeFilter as DateFilter)

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

  // Time filter options
  const timeFilterOptions = [
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
  ]

  // Format numbers with commas
  const formatNumber = (num: number) => num?.toLocaleString() || "0"

  // Calculate percentages for cards
  const calculatePercentage = (part: number, total: number) => {
    return total > 0 ? Math.round((part / total) * 100) : 0
  }

  // Check if any data is loading
  const anyLoading =
    collectionEfficiencyLoading || outstandingArrearsLoading || collectionByBandLoading || cboPerformanceLoading

  // Check if any data has errors
  const anyError = collectionEfficiencyError || outstandingArrearsError || collectionByBandError || cboPerformanceError

  // Check if we have any data
  const hasData = collectionEfficiencyData || outstandingArrearsData || collectionByBandData || cboPerformanceData

  // Chart colors
  const COLORS = ["#004B23", "#007200", "#38b000", "#9ef01a", "#ccff33", "#004B23", "#007200"]
  const COLLECTION_BAND_COLORS = ["#3b82f6", "#8b5cf6", "#ef4444", "#f97316", "#10b981", "#0ea5e9"]

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-24 sm:pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Performance Analytics</h1>
                  <p className="mt-1 text-sm text-gray-600">Real-time performance metrics and analytics</p>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                  {/* Time Filter */}
                  <DropdownPopover
                    options={timeFilterOptions.map((opt, index) => ({ ...opt, value: index }))}
                    selectedValue={timeFilterOptions.findIndex((opt) => opt.value === timeFilter)}
                    onSelect={(index) => {
                      const option = timeFilterOptions[index]
                      if (option) {
                        setTimeFilter(option.value as TimeFilter)
                      }
                    }}
                  >
                    {timeFilterOptions.find((opt) => opt.value === timeFilter)?.label}
                  </DropdownPopover>

                  {/* Polling Controls */}
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1">
                    <button
                      onClick={togglePolling}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        isPolling ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <RefreshCw className={`size-3.5 ${isPolling ? "animate-spin" : ""}`} />
                      {isPolling ? "ON" : "OFF"}
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

                  <button
                    onClick={fetchPerformanceData}
                    disabled={anyLoading}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RefreshCw className={`size-3.5 ${anyLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {anyError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Failed to load analytics</p>
                    <p className="text-sm text-red-700">{anyError}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Main Content */}
            {anyLoading && !hasData ? (
              <LoadingState />
            ) : hasData ? (
              <div className="w-full">
                {/* Performance Analytics Categories */}
                <PerformanceAnalyticsCategories
                  collectionEfficiencyData={collectionEfficiencyData}
                  outstandingArrearsData={outstandingArrearsData}
                />

                {/* Charts Section */}
                <div className="space-y-6">
                  {/* Collection by Band Chart - Full Width */}
                  {collectionByBandData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="rounded-xl border border-gray-200 bg-white p-6"
                    >
                      {/* Header */}
                      <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-blue-100 p-2">
                            <BarChart3 className="size-5 text-blue-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Collection by Band</h3>
                            <p className="text-sm text-gray-600">Revenue distribution across customer bands</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {collectionByBandData.slices?.length} Bands
                        </span>
                      </div>

                      {collectionByBandLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="size-8 animate-spin text-blue-600" />
                            <p className="text-sm text-gray-500">Loading collection by band...</p>
                          </div>
                        </div>
                      ) : collectionByBandError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                          {collectionByBandError}
                        </div>
                      ) : collectionByBandData.slices?.length === 0 ? (
                        <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                          <div className="text-sm font-semibold text-gray-900">No collection-by-band data</div>
                          <div className="mt-1 text-sm text-gray-600">Try changing the time range.</div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Summary Cards */}
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                            {/* Total Revenue Card */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="rounded-lg bg-blue-50 p-2">
                                    <DollarSign className="size-4 text-blue-700" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900">Total Revenue</h3>
                                    <p className="text-xs text-gray-500">All bands combined</p>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-blue-700">
                                  {formatCurrency(
                                    collectionByBandData.slices?.reduce((sum, slice) => sum + slice.amount, 0)
                                  )}
                                </span>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Performance</span>
                                  <span className="font-medium text-gray-900">100%</span>
                                </div>
                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                  />
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-emerald-50 p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <CheckCircle className="size-3 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-700">Complete</span>
                                  </div>
                                  <p className="mt-1 text-sm font-semibold text-emerald-900">
                                    {collectionByBandData.slices?.length}
                                  </p>
                                </div>
                                <div className="rounded-lg bg-amber-50 p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Clock className="size-3 text-amber-600" />
                                    <span className="text-xs font-medium text-amber-700">Bands</span>
                                  </div>
                                  <p className="mt-1 text-sm font-semibold text-amber-900">Active</p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Total Customers Card */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="rounded-lg bg-purple-50 p-2">
                                    <Users className="size-4 text-purple-700" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900">Total Customers</h3>
                                    <p className="text-xs text-gray-500">Across all bands</p>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-purple-700">
                                  {formatNumber(
                                    collectionByBandData.slices?.reduce((sum, slice) => sum + slice.count, 0)
                                  )}
                                </span>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Coverage</span>
                                  <span className="font-medium text-gray-900">100%</span>
                                </div>
                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                                  />
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-emerald-50 p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <CheckCircle className="size-3 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-700">Active</span>
                                  </div>
                                  <p className="mt-1 text-sm font-semibold text-emerald-900">
                                    {formatNumber(
                                      Math.round(
                                        collectionByBandData.slices?.reduce((sum, slice) => sum + slice.count, 0) * 0.8
                                      )
                                    )}
                                  </p>
                                </div>
                                <div className="rounded-lg bg-amber-50 p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Clock className="size-3 text-amber-600" />
                                    <span className="text-xs font-medium text-amber-700">Inactive</span>
                                  </div>
                                  <p className="mt-1 text-sm font-semibold text-amber-900">
                                    {formatNumber(
                                      Math.round(
                                        collectionByBandData.slices?.reduce((sum, slice) => sum + slice.count, 0) * 0.2
                                      )
                                    )}
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Average Per Band Card */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="rounded-lg bg-green-50 p-2">
                                    <BarChart3 className="size-4 text-green-700" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900">Avg. Per Band</h3>
                                    <p className="text-xs text-gray-500">Average revenue</p>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-green-700">
                                  {formatCurrency(
                                    Math.round(
                                      collectionByBandData.slices?.reduce((sum, slice) => sum + slice.amount, 0) /
                                        collectionByBandData.slices?.length
                                    )
                                  )}
                                </span>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Efficiency</span>
                                  <span className="font-medium text-gray-900">85%</span>
                                </div>
                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "85%" }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                                  />
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-emerald-50 p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <CheckCircle className="size-3 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-700">Target</span>
                                  </div>
                                  <p className="mt-1 text-sm font-semibold text-emerald-900">Met</p>
                                </div>
                                <div className="rounded-lg bg-amber-50 p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Clock className="size-3 text-amber-600" />
                                    <span className="text-xs font-medium text-amber-700">Growth</span>
                                  </div>
                                  <p className="mt-1 text-sm font-semibold text-amber-900">+12%</p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Top Band Card */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="rounded-lg bg-orange-50 p-2">
                                    <TrendingUp className="size-4 text-orange-700" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900">Top Band</h3>
                                    <p className="text-xs text-gray-500">Best performer</p>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-orange-700">
                                  {collectionByBandData.slices?.length > 0
                                    ? collectionByBandData.slices[0]?.label
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Performance</span>
                                  <span className="font-medium text-gray-900">
                                    {collectionByBandData.slices?.length > 0
                                      ? calculatePercentage(
                                          collectionByBandData.slices[0]?.amount || 0,
                                          collectionByBandData.slices.reduce((sum, slice) => sum + slice.amount, 0)
                                        ).toFixed(1)
                                      : "0.0"}
                                    %
                                  </span>
                                </div>
                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width:
                                        collectionByBandData.slices?.length > 0
                                          ? `${Math.min(
                                              calculatePercentage(
                                                collectionByBandData.slices[0]?.amount || 0,
                                                collectionByBandData.slices.reduce(
                                                  (sum, slice) => sum + slice.amount,
                                                  0
                                                )
                                              ),
                                              100
                                            )}%`
                                          : "0%",
                                    }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                                  />
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-emerald-50 p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <CheckCircle className="size-3 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-700">Revenue</span>
                                  </div>
                                  <p className="mt-1 text-sm font-semibold text-emerald-900">
                                    {collectionByBandData.slices?.length > 0
                                      ? formatCurrency(collectionByBandData.slices[0]?.amount || 0)
                                      : "₦0"}
                                  </p>
                                </div>
                                <div className="rounded-lg bg-amber-50 p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Clock className="size-3 text-amber-600" />
                                    <span className="text-xs font-medium text-amber-700">Rank</span>
                                  </div>
                                  <p className="mt-1 text-sm font-semibold text-amber-900">#1</p>
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Chart and Details Side by Side */}
                          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Chart */}
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={collectionByBandData.slices?.map((slice, index) => ({
                                      name: slice.label,
                                      value: slice.amount,
                                      fill: COLLECTION_BAND_COLORS[index % COLLECTION_BAND_COLORS.length],
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                      `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {collectionByBandData.slices?.map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={COLLECTION_BAND_COLORS[index % COLLECTION_BAND_COLORS.length]}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value: number, name) => [formatCurrency(value), "Revenue"]} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="h-80 overflow-y-auto">
                              <h4 className="mb-3 text-sm font-medium text-gray-700">Band Performance Details</h4>
                              <div className="space-y-4">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-600">
                                  Band Revenue Status
                                </h4>
                                <div className="space-y-2 rounded-md bg-gray-50 p-4">
                                  {collectionByBandData.slices?.map((slice, index) => {
                                    const percentage = calculatePercentage(
                                      slice.amount,
                                      collectionByBandData.slices?.reduce((sum, s) => sum + s.amount, 0)
                                    )
                                    return (
                                      <div
                                        key={slice.label}
                                        className="flex items-center justify-between rounded-lg bg-white p-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="rounded-full bg-blue-100 p-1">
                                            <BarChart3 className="size-3 text-blue-700" />
                                          </div>
                                          <span className="text-sm text-gray-700">{slice.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(slice.amount)}
                                          </span>
                                          <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              <div className="mt-6 space-y-4">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-600">
                                  Band Customer Status
                                </h4>
                                <div className="space-y-2 rounded-md bg-gray-50 p-4">
                                  {collectionByBandData.slices?.map((slice, index) => {
                                    const customerPercentage = calculatePercentage(
                                      slice.count,
                                      collectionByBandData.slices?.reduce((sum, s) => sum + s.count, 0)
                                    )
                                    return (
                                      <div
                                        key={slice.label}
                                        className="flex items-center justify-between rounded-lg bg-white p-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="rounded-full bg-purple-100 p-1">
                                            <Users className="size-3 text-purple-700" />
                                          </div>
                                          <span className="text-sm text-gray-700">{slice.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-gray-900">
                                            {formatNumber(slice.count)}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            ({customerPercentage.toFixed(1)}%)
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              <div className="mt-6 space-y-4">
                                <h4 className="text-xs font-medium uppercase tracking-wider text-gray-600">
                                  Band Efficiency Status
                                </h4>
                                <div className="space-y-2 rounded-md bg-gray-50 p-4">
                                  {collectionByBandData.slices?.map((slice, index) => {
                                    const avgPerCustomer = slice.count > 0 ? Math.round(slice.amount / slice.count) : 0
                                    const maxAvgPerCustomer = Math.max(
                                      ...collectionByBandData.slices?.map((s) =>
                                        s.count > 0 ? Math.round(s.amount / s.count) : 0
                                      )
                                    )
                                    const efficiencyPercentage =
                                      maxAvgPerCustomer > 0 ? calculatePercentage(avgPerCustomer, maxAvgPerCustomer) : 0
                                    return (
                                      <div
                                        key={slice.label}
                                        className="flex items-center justify-between rounded-lg bg-white p-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="rounded-full bg-green-100 p-1">
                                            <Target className="size-3 text-green-700" />
                                          </div>
                                          <span className="text-sm text-gray-700">{slice.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(avgPerCustomer)}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            ({efficiencyPercentage.toFixed(1)}%)
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* CBO Performance Chart */}
                  {cboPerformanceData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="rounded-xl border border-gray-200 bg-white p-6"
                    >
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">CBO Performance</h3>
                      {cboPerformanceLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="size-8 animate-spin text-orange-600" />
                            <p className="text-sm text-gray-500">Loading CBO performance...</p>
                          </div>
                        </div>
                      ) : cboPerformanceError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                          {cboPerformanceError}
                        </div>
                      ) : cboPerformanceData.slices.length === 0 ? (
                        <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                          <div className="text-sm font-semibold text-gray-900">No CBO performance data</div>
                          <div className="mt-1 text-sm text-gray-600">Try changing the time range.</div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={cboPerformanceData.slices}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip
                              formatter={(value, name) => [
                                name === "amount" ? formatCurrency(value as number) : value,
                                name === "amount" ? "Amount" : name === "count" ? "Count" : "Percentage",
                              ]}
                            />
                            <Bar dataKey="amount" fill="#004B23" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Outstanding Arrears Section */}
                {outstandingArrearsData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-6 rounded-xl border border-gray-200 bg-white p-5"
                  >
                    {/* Header */}
                    <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-red-100 p-2">
                          <AlertCircle className="size-5 text-red-700" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Outstanding Arrears Summary</h2>
                          <p className="text-sm text-gray-600">Arrears breakdown and payment status</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        {outstandingArrearsData.customersInArrears.toLocaleString()} Customers
                      </span>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      {/* Total Outstanding Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-red-50 p-2">
                              <AlertCircle className="size-4 text-red-700" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">Total Outstanding</h3>
                              <p className="text-xs text-gray-500">Total arrears amount</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-red-700">
                            {
                              formatCurrencyWithAbbreviation(
                                outstandingArrearsData.totalOutstanding,
                                selectedCurrencySymbol
                              ).formatted
                            }
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Outstanding</span>
                            <span className="font-medium text-gray-900">100%</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                              className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600"
                            />
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-emerald-50 p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <CheckCircle className="size-3 text-emerald-600" />
                              <span className="text-xs font-medium text-emerald-700">Full Amount</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-emerald-900">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalOutstanding,
                                  selectedCurrencySymbol
                                ).formatted
                              }
                            </p>
                          </div>
                          <div className="rounded-lg bg-amber-50 p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="size-3 text-amber-600" />
                              <span className="text-xs font-medium text-amber-700">Customers</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-amber-900">
                              {outstandingArrearsData.customersInArrears.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Total Debits Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-orange-50 p-2">
                              <TrendingDown className="size-4 text-orange-700" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">Total Debits</h3>
                              <p className="text-xs text-gray-500">Outstanding debits</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-orange-700">
                            {
                              formatCurrencyWithAbbreviation(outstandingArrearsData.totalDebits, selectedCurrencySymbol)
                                .formatted
                            }
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Debit Share</span>
                            <span className="font-medium text-gray-900">
                              {calculatePercentage(
                                outstandingArrearsData.totalDebits,
                                outstandingArrearsData.totalOutstanding
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(
                                  calculatePercentage(
                                    outstandingArrearsData.totalDebits,
                                    outstandingArrearsData.totalOutstanding
                                  ),
                                  100
                                )}%`,
                              }}
                              transition={{ duration: 0.5, delay: 0.5 }}
                              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                            />
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-emerald-50 p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <CheckCircle className="size-3 text-emerald-600" />
                              <span className="text-xs font-medium text-emerald-700">Amount</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-emerald-900">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalDebits,
                                  selectedCurrencySymbol
                                ).formatted
                              }
                            </p>
                          </div>
                          <div className="rounded-lg bg-amber-50 p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="size-3 text-amber-600" />
                              <span className="text-xs font-medium text-amber-700">Share</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-amber-900">
                              {calculatePercentage(
                                outstandingArrearsData.totalDebits,
                                outstandingArrearsData.totalOutstanding
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Total Credits Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-green-50 p-2">
                              <TrendingUp className="size-4 text-green-700" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">Total Credits</h3>
                              <p className="text-xs text-gray-500">Outstanding credits</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-green-700">
                            {
                              formatCurrencyWithAbbreviation(
                                outstandingArrearsData.totalCredits,
                                selectedCurrencySymbol
                              ).formatted
                            }
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Credit Share</span>
                            <span className="font-medium text-gray-900">
                              {calculatePercentage(
                                outstandingArrearsData.totalCredits,
                                outstandingArrearsData.totalOutstanding
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(
                                  calculatePercentage(
                                    outstandingArrearsData.totalCredits,
                                    outstandingArrearsData.totalOutstanding
                                  ),
                                  100
                                )}%`,
                              }}
                              transition={{ duration: 0.5, delay: 0.6 }}
                              className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                            />
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-emerald-50 p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <CheckCircle className="size-3 text-emerald-600" />
                              <span className="text-xs font-medium text-emerald-700">Amount</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-emerald-900">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalCredits,
                                  selectedCurrencySymbol
                                ).formatted
                              }
                            </p>
                          </div>
                          <div className="rounded-lg bg-amber-50 p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="size-3 text-amber-600" />
                              <span className="text-xs font-medium text-amber-700">Share</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-amber-900">
                              {calculatePercentage(
                                outstandingArrearsData.totalCredits,
                                outstandingArrearsData.totalOutstanding
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              // Empty State
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                    <PieChartIcon className="size-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Performance Data</h3>
                  <p className="mt-1 text-sm text-gray-600">Try refreshing the data or changing the time range.</p>
                  <button
                    onClick={fetchPerformanceData}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <RefreshCw className="size-4" />
                    Refresh Data
                  </button>
                </div>
              </motion.div>
            )}
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
