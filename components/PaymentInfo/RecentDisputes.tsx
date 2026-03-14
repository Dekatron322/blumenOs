"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { HiRefresh } from "react-icons/hi"
import {
  AlertCircle,
  Award,
  ChevronDown,
  CreditCard,
  DollarSign,
  Medal,
  PieChart,
  RefreshCw,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

import { clearTopPerformers, fetchTopPerformers, TopPerformersRequest } from "lib/redux/paymentSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

// Modern Analytics Card Component
const AnalyticsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
  trendValue,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color?: "blue" | "green" | "purple" | "amber" | "emerald" | "red"
  trend?: "up" | "down"
  trendValue?: string
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2.5 ${colorClasses[color].split(" ")[0]}`}>
          <Icon className={`size-5 ${iconColors[color]}`} />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trendValue}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </motion.div>
  )
}

// Modern Skeleton Loader for Analytics Cards
const AnalyticsCardSkeleton = () => (
  <motion.div
    className="rounded-xl border border-gray-200 bg-white p-5"
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
    <div className="flex items-start justify-between">
      <div className="size-10 rounded-lg bg-gray-200"></div>
      <div className="h-6 w-16 rounded-full bg-gray-200"></div>
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-4 w-24 rounded bg-gray-200"></div>
      <div className="h-8 w-32 rounded bg-gray-200"></div>
      <div className="h-3 w-20 rounded bg-gray-200"></div>
    </div>
  </motion.div>
)

// Loading Skeleton for Performers List
const PerformersListSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((item) => (
      <motion.div
        key={item}
        className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3"
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
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-gray-200"></div>
          <div>
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="mt-1 h-3 w-16 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-4 w-20 rounded bg-gray-200"></div>
          <div className="mt-1 h-3 w-12 rounded bg-gray-200"></div>
        </div>
      </motion.div>
    ))}
  </div>
)

// Time Range Distribution Component (similar to Employee Department Categories)
const TimeRangeDistribution = ({
  performers,
  timeRange,
  agentType,
}: {
  performers: any[]
  timeRange: string
  agentType: string
}) => {
  const [showAll, setShowAll] = useState(false)
  const formatNumber = (num: number) => num?.toLocaleString() || "0"

  if (!performers || performers.length === 0) return null

  const displayPerformers = showAll ? performers : performers.slice(0, 3)
  const totalAmount = performers.reduce((sum, p) => sum + p.amount, 0)
  const totalTransactions = performers.reduce((sum, p) => sum + p.count, 0)

  const categories = displayPerformers.map((performer, index) => ({
    name:
      index === 0 ? "Top Performer" : index === 1 ? "Second Place" : index === 2 ? "Third Place" : `Rank ${index + 1}`,
    count: performer.amount || 0,
    percentage: Math.round((performer.amount / totalAmount) * 100) || 0,
    color: index === 0 ? "yellow" : index === 1 ? "gray" : index === 2 ? "orange" : "blue",
    icon: index === 0 ? Medal : index === 1 ? Award : index === 2 ? Star : Target,
    description: performer.name || "N/A",
    value: performer.count || 0,
  }))

  const colorClasses = {
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      light: "bg-yellow-100",
      dark: "bg-yellow-600",
      gradient: "from-yellow-500 to-yellow-600",
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      light: "bg-gray-100",
      dark: "bg-gray-600",
      gradient: "from-gray-500 to-gray-600",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      light: "bg-orange-100",
      dark: "bg-orange-600",
      gradient: "from-orange-500 to-orange-600",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      light: "bg-blue-100",
      dark: "bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
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
            <PieChart className="size-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Performance Distribution</h2>
            <p className="text-sm text-gray-600">Top performers breakdown for {timeRange}</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Total: {formatNumber(totalTransactions)} transactions
        </span>
      </div>

      {/* Categories Grid */}
      <div
        className={`grid gap-4 ${displayPerformers.length <= 3 ? "lg:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}
      >
        {categories.map((category, index) => {
          const colors = colorClasses[category.color as keyof typeof colorClasses]
          const Icon = category.icon

          if (category.count === 0) return null

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
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(category.count)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Share of total</span>
                  <span className="font-medium text-gray-900">{category.percentage}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                  />
                </div>
              </div>

              {/* Transaction Count */}
              <div className="mt-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                  <span className="text-xs text-gray-600">Transactions</span>
                  <span className="text-sm font-semibold text-gray-900">{formatNumber(category.value)}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Show More/Less Button */}
      {performers.length > 3 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {showAll ? (
              <>
                <ChevronDown className="size-4 rotate-180" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                Show More ({performers.length - 3} more)
              </>
            )}
          </button>
        </div>
      )}

      {/* Summary Stats Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
        {/* Left Column - Volume Stats */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Volume Statistics</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-100 p-1">
                  <DollarSign className="size-3 text-purple-700" />
                </div>
                <span className="text-sm text-gray-700">Total Volume</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-100 p-1">
                  <CreditCard className="size-3 text-emerald-700" />
                </div>
                <span className="text-sm text-gray-700">Total Transactions</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatNumber(totalTransactions)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-1">
                  <Target className="size-3 text-blue-700" />
                </div>
                <span className="text-sm text-gray-700">Average Transaction</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalTransactions > 0 ? Math.round(totalAmount / totalTransactions) : 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Performance Stats */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Performance Metrics</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-100 p-1">
                  <TrendingUp className="size-3 text-emerald-700" />
                </div>
                <span className="text-sm text-gray-700">Top Performer Share</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round((performers[0]?.amount / totalAmount) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-1">
                  <Users className="size-3 text-blue-700" />
                </div>
                <span className="text-sm text-gray-700">Active Performers</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{performers.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-amber-100 p-1">
                  <Zap className="size-3 text-amber-700" />
                </div>
                <span className="text-sm text-gray-700">Performance Gap</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {performers.length > 1
                  ? new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(performers[0]?.amount - (performers[1]?.amount || 0))
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Error Display Component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
      <div className="flex-1">
        <p className="font-medium text-red-900">Failed to load top performers</p>
        <p className="text-sm text-red-700">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
      >
        <RefreshCw className="size-4" />
        Retry
      </button>
    </div>
  </motion.div>
)

// Empty State Component
const EmptyState = ({
  timeRange,
  agentType,
  onViewAll,
}: {
  timeRange: string
  agentType: string
  onViewAll: () => void
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12"
  >
    <div className="text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
        <Users className="size-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No {agentType} found</h3>
      <p className="mt-2 text-sm text-gray-500">
        No {agentType} data available for {timeRange.toLowerCase()}.
      </p>
      <div className="mt-6">
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View All Time Data
        </button>
      </div>
    </div>
  </motion.div>
)

// Dropdown Popover Component (for time range)
const DropdownPopover = ({
  options,
  selectedValue,
  onSelect,
  children,
}: {
  options: { value: string; label: string }[]
  selectedValue: string
  onSelect: (value: string) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {children}
        <ChevronDown className={`size-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 z-20 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
            >
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

const PerformingAgents = () => {
  const dispatch = useAppDispatch()
  const { topPerformers, topPerformersLoading, topPerformersError, topPerformersSuccess } = useAppSelector(
    (state) => state.payments
  )

  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedTimeRange, setSelectedTimeRange] = useState("thisMonth")
  const [agentType, setAgentType] = useState("agents") // "agents" or "vendors"

  // Time range options
  const timeRanges = [
    { id: "today", label: "Today", value: "today" },
    { id: "thisWeek", label: "This Week", value: "thisWeek" },
    { id: "thisMonth", label: "This Month", value: "thisMonth" },
    { id: "thisYear", label: "This Year", value: "thisYear" },
    { id: "allTime", label: "All Time", value: "allTime" },
  ]

  // Build request body based on selected time range
  const getRequestData = (): TopPerformersRequest => {
    const baseRequest: TopPerformersRequest = {
      today: false,
      thisWeek: false,
      thisMonth: false,
      thisYear: false,
      allTime: false,
      areaOfficeId: 0,
      serviceCenterId: 0,
      distributionSubstationId: 0,
      feederId: 0,
    }

    switch (selectedTimeRange) {
      case "today":
        baseRequest.today = true
        break
      case "thisWeek":
        baseRequest.thisWeek = true
        break
      case "thisMonth":
        baseRequest.thisMonth = true
        break
      case "thisYear":
        baseRequest.thisYear = true
        break
      case "allTime":
        baseRequest.allTime = true
        break
    }

    return baseRequest
  }

  // Fetch top performers data
  const loadTopPerformers = () => {
    const requestData = getRequestData()
    dispatch(fetchTopPerformers(requestData))
  }

  // Initial load and on time range change
  useEffect(() => {
    loadTopPerformers()
  }, [selectedTimeRange])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearTopPerformers())
    }
  }, [])

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      setSearchText(trimmed)
    }
  }

  // Get current performers based on selected type
  const getCurrentPerformers = () => {
    if (!topPerformers || !topPerformers.windows || topPerformers.windows.length === 0) {
      return []
    }

    const windowData = topPerformers.windows.find((w) =>
      w.window.toLowerCase().includes(selectedTimeRange.toLowerCase().replace("this", "").replace("all", ""))
    )

    if (!windowData) return []

    return agentType === "agents" ? windowData.topAgents : windowData.topVendors
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get time range label
  const getTimeRangeLabel = () => {
    const range = timeRanges.find((r) => r.id === selectedTimeRange)
    return range ? range.label : "This Month"
  }

  // Get performers for display
  const performers = getCurrentPerformers()

  // Calculate summary stats for analytics cards
  const getSummaryStats = () => {
    if (!performers || performers.length === 0) {
      return {
        totalAmount: 0,
        totalTransactions: 0,
        avgTransaction: 0,
        topPerformerAmount: 0,
        uniquePerformers: 0,
      }
    }

    const totalAmount = performers.reduce((sum, p) => sum + p.amount, 0)
    const totalTransactions = performers.reduce((sum, p) => sum + p.count, 0)
    const avgTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0

    return {
      totalAmount,
      totalTransactions,
      avgTransaction: Math.round(avgTransaction),
      topPerformerAmount: performers[0]?.amount || 0,
      uniquePerformers: performers.length,
    }
  }

  const stats = getSummaryStats()

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Top Performers</h1>
              <p className="mt-1 text-sm text-gray-600">Track and analyze agent and vendor performance</p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Agent/Vendor Toggle */}
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setAgentType("agents")}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    agentType === "agents" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Agents
                </button>
                {/* <button
                  onClick={() => setAgentType("vendors")}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    agentType === "vendors" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Vendors
                </button> */}
              </div>

              {/* Time Range Dropdown */}
              <DropdownPopover options={timeRanges} selectedValue={selectedTimeRange} onSelect={setSelectedTimeRange}>
                {timeRanges.find((r) => r.id === selectedTimeRange)?.label}
              </DropdownPopover>

              {/* Refresh Button */}
              <button
                onClick={loadTopPerformers}
                disabled={topPerformersLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${topPerformersLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {topPerformersError && <ErrorDisplay error={topPerformersError} onRetry={loadTopPerformers} />}
        </AnimatePresence>

        {/* Analytics Cards Row */}
        {!topPerformersLoading && performers.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsCard
              title="Total Volume"
              value={formatCurrency(stats.totalAmount)}
              subtitle="All transactions value"
              icon={DollarSign}
              color="blue"
            />
            <AnalyticsCard
              title="Transactions"
              value={stats.totalTransactions}
              subtitle={`${performers.length} active performers`}
              icon={CreditCard}
              color="green"
            />
            <AnalyticsCard
              title="Average Transaction"
              value={formatCurrency(stats.avgTransaction)}
              subtitle="Per transaction average"
              icon={Target}
              color="purple"
            />
            <AnalyticsCard
              title="Top Performer"
              value={formatCurrency(stats.topPerformerAmount)}
              subtitle={performers[0]?.name || "N/A"}
              icon={Medal}
              color="amber"
            />
          </div>
        )}

        {/* Analytics Cards Skeleton */}
        {topPerformersLoading && !performers.length && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <AnalyticsCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left Column - Performers List */}

          {/* Right Column - Performance Distribution */}
          {!topPerformersLoading && !topPerformersError && performers.length > 0 && (
            <div className="lg:w-full">
              <TimeRangeDistribution performers={performers} timeRange={getTimeRangeLabel()} agentType={agentType} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default PerformingAgents
