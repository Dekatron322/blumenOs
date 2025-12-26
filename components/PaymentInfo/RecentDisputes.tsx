"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { HiChevronDown, HiChevronUp, HiFilter, HiRefresh } from "react-icons/hi"

import { fetchTopPerformers, clearTopPerformers, TopPerformersRequest } from "lib/redux/paymentSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

const PerformingAgents = () => {
  const dispatch = useAppDispatch()
  const { topPerformers, topPerformersLoading, topPerformersError, topPerformersSuccess } = useAppSelector(
    (state) => state.payments
  )

  const [searchText, setSearchText] = useState("")
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showMobileActions, setShowMobileActions] = useState(false)
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
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "under-review":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "escalated":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDisputeTypeColor = (type: string) => {
    switch (type) {
      case "double-charge":
        return "bg-red-100 text-red-800"
      case "service-not-rendered":
        return "bg-orange-100 text-orange-800"
      case "incorrect-amount":
        return "bg-blue-100 text-blue-800"
      case "unauthorized-transaction":
        return "bg-purple-100 text-purple-800"
      case "other":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "Bank Transfer":
        return "bg-blue-100 text-blue-800"
      case "Mobile Money":
        return "bg-purple-100 text-purple-800"
      case "POS Agent":
        return "bg-orange-100 text-orange-800"
      case "Card Payment":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".action-dropdown")) {
        setIsDropdownOpen(false)
        setSelectedDispute(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Auto-hide sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowSidebar(false)
      } else {
        setShowSidebar(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Loading skeleton for performers
  const LoadingSkeleton = () => (
    <div className="space-y-3 md:space-y-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="size-10 rounded-full bg-gray-300"></div>
                <div className="flex-1">
                  <div className="mb-2 h-4 w-32 rounded bg-gray-300"></div>
                  <div className="h-3 w-24 rounded bg-gray-300"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="h-3 w-full rounded bg-gray-300"></div>
                <div className="h-3 w-full rounded bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Error display
  const ErrorDisplay = () => (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 md:p-6">
      <div className="flex items-start">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 md:text-base">Failed to load top performers</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{topPerformersError}</p>
            <button
              onClick={loadTopPerformers}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
            >
              <HiRefresh className="size-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Empty state
  const EmptyState = () => (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-200">
          <HiFilter className="size-6 text-gray-500" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 md:text-base">
          No {agentType === "agents" ? "agents" : "vendors"} found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No {agentType === "agents" ? "agents" : "vendors"} data available for {getTimeRangeLabel().toLowerCase()}.
        </p>
        <button
          onClick={() => setSelectedTimeRange("allTime")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View All Time Data
        </button>
      </div>
    </div>
  )

  const PerformerCard = ({ performer, index, rank }: { performer: any; index: number; rank: number }) => (
    <motion.div
      key={performer.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-sm md:p-5"
    >
      <div className="flex items-start gap-4">
        {/* Rank Badge */}
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-bold md:size-12 ${
            rank === 1
              ? "bg-yellow-100 text-yellow-800"
              : rank === 2
              ? "bg-gray-100 text-gray-800"
              : rank === 3
              ? "bg-orange-100 text-orange-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          #{rank}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-3">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold text-gray-900 md:text-base">{performer.name}</h4>
              <p className="mt-0.5 text-xs text-gray-500 md:text-sm">ID: {performer.id}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 md:mt-0 md:flex-col md:items-end">
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                {performer.count} {performer.count === 1 ? "payment" : "payments"}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-gray-500 md:text-sm">Total Amount:</p>
              <p className="text-lg font-bold text-gray-900 md:text-xl">{formatCurrency(performer.amount)}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500 md:text-sm">Average Per Transaction:</p>
              <p className="text-sm font-medium text-gray-900 md:text-base">
                {formatCurrency(performer.count > 0 ? Math.round(performer.amount / performer.count) : 0)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>Performance Score</span>
              <span>{Math.round((performer.count / (performers[0]?.count || 1)) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${
                  rank === 1
                    ? "bg-yellow-500"
                    : rank === 2
                    ? "bg-gray-500"
                    : rank === 3
                    ? "bg-orange-500"
                    : "bg-blue-500"
                }`}
                style={{
                  width: `${Math.min(100, Math.round((performer.count / (performers[0]?.count || 1)) * 100))}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const StatCard = ({
    title,
    items,
  }: {
    title: string
    items: Array<{ label: string; value: string; color: string; count: number }>
  }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-3 md:p-4 lg:p-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 md:text-base lg:text-lg">{title}</h3>
      <div className="space-y-2 md:space-y-3 lg:space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${item.color} md:size-3`}></div>
              <span className="text-xs text-gray-700 md:text-sm">{item.label}</span>
            </div>
            <span className={`text-xs font-semibold md:text-sm ${item.color.replace("bg-", "text-")}`}>
              {item.count} {item.count === 1 ? "dispute" : "disputes"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const QuickActionsCard = () => (
    <div className="rounded-lg border border-gray-200 bg-white p-3 md:p-4 lg:p-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 md:text-base lg:text-lg">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-2 md:gap-3">
        <button className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 sm:py-2.5 md:px-4 md:py-2 md:text-sm">
          View All Reports
        </button>
        <button className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:py-2.5 md:px-4 md:py-2 md:text-sm">
          Export Data
        </button>
        <button className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:col-span-1 sm:py-2.5 md:px-4 md:py-2 md:text-sm">
          Analytics Dashboard
        </button>
      </div>
    </div>
  )

  const MobileQuickActions = () => (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white shadow-lg ring-1 ring-gray-200 md:hidden">
      <div className="flex items-center gap-1 p-1">
        <button
          onClick={() => setShowMobileActions(!showMobileActions)}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          aria-label="Quick actions"
        >
          <span>Actions</span>
          {showMobileActions ? <HiChevronUp className="size-4" /> : <HiChevronDown className="size-4" />}
        </button>
      </div>

      {showMobileActions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
        >
          <button className="mb-1 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            View All Reports
          </button>
          <button className="mb-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export Data
          </button>
          <button className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Analytics Dashboard
          </button>
        </motion.div>
      )}
    </div>
  )

  // Summary statistics
  const getSummaryStats = () => {
    if (!performers || performers.length === 0) {
      return {
        totalAmount: 0,
        totalTransactions: 0,
        avgTransaction: 0,
        topPerformerName: "N/A",
      }
    }

    const totalAmount = performers.reduce((sum, p) => sum + p.amount, 0)
    const totalTransactions = performers.reduce((sum, p) => sum + p.count, 0)
    const avgTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0

    return {
      totalAmount,
      totalTransactions,
      avgTransaction: Math.round(avgTransaction),
      topPerformerName: performers[0]?.name || "N/A",
    }
  }

  const stats = getSummaryStats()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 lg:flex-row lg:gap-6"
    >
      {/* Left Column - Top Performers List */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-3 md:p-4 lg:p-6">
          <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between md:block">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold md:text-lg">Top Performers</h3>
                <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  <span>{getTimeRangeLabel()}</span>
                </div>
              </div>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs hover:bg-gray-50 md:hidden"
                aria-label="Toggle sidebar"
              >
                <span>Stats</span>
                {showSidebar ? <HiChevronUp className="size-3" /> : <HiChevronDown className="size-3" />}
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              {/* Time Range Filter */}
              <FormSelectModule
                name="timeRange"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                options={timeRanges}
                className="w-full sm:w-auto"
                controlClassName="h-[38px] text-xs md:text-sm"
              />

              {/* Agent/Vendor Toggle */}
              <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setAgentType("agents")}
                  className={`rounded px-3 py-1.5 text-xs font-medium md:text-sm ${
                    agentType === "agents" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Agents
                </button>
                <button
                  onClick={() => setAgentType("vendors")}
                  className={`rounded px-3 py-1.5 text-xs font-medium md:text-sm ${
                    agentType === "vendors" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Vendors
                </button>
              </div>

              <div className="flex-1 md:max-w-md">
                <SearchModule
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onCancel={handleCancelSearch}
                  placeholder={`Search ${agentType}...`}
                  className="w-full"
                />
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadTopPerformers}
                disabled={topPerformersLoading}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs hover:bg-gray-50 disabled:opacity-50 md:text-sm"
              >
                <HiRefresh className={`size-3 md:size-4 ${topPerformersLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {topPerformersLoading && <LoadingSkeleton />}

          {/* Error State */}
          {topPerformersError && <ErrorDisplay />}

          {/* Empty State */}
          {!topPerformersLoading && !topPerformersError && performers.length === 0 && <EmptyState />}

          {/* Success State - Performers List */}
          {!topPerformersLoading && !topPerformersError && performers.length > 0 && (
            <div className="space-y-3 md:space-y-4">
              {performers.map((performer, index) => (
                <PerformerCard key={performer.id} performer={performer} index={index} rank={index + 1} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Statistics */}

      {/* Mobile Quick Actions Button */}
      <MobileQuickActions />

      {/* Mobile Toggle Sidebar Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <span>{showSidebar ? "Hide" : "Show"} Stats</span>
        {showSidebar ? <HiChevronUp className="size-4" /> : <HiChevronDown className="size-4" />}
      </button>
    </motion.div>
  )
}

export default PerformingAgents
