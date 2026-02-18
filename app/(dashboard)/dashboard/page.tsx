"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  fetchBreakdown,
  fetchCboPerformance,
  fetchCollectionByBand,
  fetchCollectionEfficiency,
  fetchCustomerSegments,
  fetchDailyCollection,
  fetchDashboardCards,
  fetchDisputes,
  fetchEnergyBalance,
  fetchMetersProgrammed,
  fetchNewConnections,
  fetchOutstandingArrears,
  fetchPrepaidVends,
  fetchTokenGenerated,
  fetchTrend,
} from "lib/redux/reportingSlice"

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

import {
  Area,
  AreaChart,
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
import Footer from "components/Footer/Footer"
import { formatCurrencyWithAbbreviation } from "utils/helpers"
import { DateFilter, getDateRangeUtc } from "utils/dateRange"

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
type TimeFilter = "lastYear" | "lastMonth" | "lastWeek" | "yesterday" | "day" | "week" | "month" | "year" | "all"

export default function Dashboard() {
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number>(1)
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState<string>("₦")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("day")
  const [activeView, setActiveView] = useState<"kpi" | "statistics">("kpi")
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // 8 minutes default
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()

  const {
    dashboardCards,
    dashboardCardsLoading,
    dashboardCardsError,
    energyBalancePoints,
    energyBalanceLoading,
    energyBalanceError,
    dailyCollectionPoints,
    dailyCollectionLoading,
    dailyCollectionError,
    collectionByBandSlices,
    collectionByBandLoading,
    collectionByBandError,
    cboPerformanceSlices,
    cboPerformanceLoading,
    cboPerformanceError,
    newConnectionsTotal,
    newConnectionsLoading,
    newConnectionsError,
    prepaidVendsPoints,
    prepaidVendsLoading,
    prepaidVendsError,
    tokenGeneratedPoints,
    tokenGeneratedLoading,
    tokenGeneratedError,
    metersProgrammedPoints,
    metersProgrammedLoading,
    metersProgrammedError,
    customerSegmentsData,
    customerSegmentsLoading,
    customerSegmentsError,
    trendPoints,
    trendLoading,
    trendError,
    breakdownSlices,
    breakdownLoading,
    breakdownError,
    collectionEfficiencyData,
    collectionEfficiencyLoading,
    collectionEfficiencyError,
    outstandingArrearsData,
    outstandingArrearsLoading,
    outstandingArrearsError,
    disputesData,
    disputesLoading,
    disputesError,
  } = useAppSelector((state) => state.reporting)

  const activeCustomersData = customerSegmentsData?.segments?.map((segment) => ({
    name: segment.label,
    value: segment.count,
  })) || [
    { name: "Postpaid", value: 35000 },
    { name: "Prepaid", value: 85000 },
  ]

  const COLORS = ["#004B23", "#ea5806", "#007200", "#38b000", "#4f46e5"]

  // Mock currencies data
  const currenciesData = {
    data: [
      { id: 1, symbol: "₦", name: "Nigerian Naira" },
      { id: 2, symbol: "USD", name: "US Dollar" },
      { id: 3, symbol: "EUR", name: "Euro" },
    ],
  }

  const refreshDashboardData = useCallback(() => {
    let startDateUtc: string
    let endDateUtc: string

    // Use custom date range if provided (datetime-local format preserves time)
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate)
      startDateUtc = start.toISOString()

      const end = new Date(customEndDate)
      endDateUtc = end.toISOString()
    } else {
      const dateRange = getDateRangeUtc(timeFilter as DateFilter)
      startDateUtc = dateRange.startDateUtc
      endDateUtc = dateRange.endDateUtc
    }

    dispatch(
      fetchDashboardCards({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchEnergyBalance({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchDailyCollection({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchCollectionByBand({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchCboPerformance({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchNewConnections({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchPrepaidVends({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchTokenGenerated({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchMetersProgrammed({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchCustomerSegments({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchTrend({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(
      fetchBreakdown({
        startDateUtc,
        endDateUtc,
        dimension: 0,
      })
    )

    dispatch(
      fetchCollectionEfficiency({
        startDateUtc,
        endDateUtc,
      })
    )

    dispatch(fetchOutstandingArrears())
    dispatch(fetchDisputes())
  }, [dispatch, timeFilter, customStartDate, customEndDate])

  useEffect(() => {
    refreshDashboardData()
  }, [dispatch, timeFilter, refreshDashboardData])

  // Short polling effect
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      refreshDashboardData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [dispatch, timeFilter, isPolling, pollingInterval, refreshDashboardData])

  // Memoize chart data to prevent unnecessary re-renders
  const memoizedEnergyBalanceChartData = useMemo(
    () =>
      (energyBalancePoints || []).map((p) => ({
        name: p.feederName,
        delivered: p.energyDeliveredKwh,
        billed: p.energyBilledKwh,
      })),
    [energyBalancePoints]
  )

  const memoizedDisputesChartData = useMemo(
    () => [
      ...(disputesData?.billing?.map((item) => ({
        name: `Billing - ${item.status}`,
        count: item.count,
        amount: item.amount,
        percentage: item.percentage,
        type: "billing",
      })) || []),
      ...(disputesData?.payments?.map((item) => ({
        name: `Payment - ${item.status}`,
        count: item.count,
        amount: item.amount,
        percentage: item.percentage,
        type: "payments",
      })) || []),
    ],
    [disputesData]
  )

  const memoizedDailyCollectionChartData = useMemo(
    () =>
      (dailyCollectionPoints || []).map((p) => ({
        day: new Date(p.bucketDate).toLocaleDateString(undefined, { month: "short", day: "2-digit" }),
        collection: p.amount,
      })),
    [dailyCollectionPoints]
  )

  const collectionByBandChartData = (collectionByBandSlices || []).map((s) => ({
    name: s.label,
    percentage: s.percentage,
    amount: s.amount,
    count: s.count,
  }))

  const collectionByBandTotal = (collectionByBandSlices || []).reduce(
    (acc, s) => {
      acc.amount += s.amount
      acc.count += s.count
      return acc
    },
    { amount: 0, count: 0 }
  )

  const cboPerformanceChartData = (cboPerformanceSlices || []).map((s) => ({
    name: s.label,
    performance: s.percentage,
    amount: s.amount,
    count: s.count,
  }))

  const prepaidVendsTotal = (prepaidVendsPoints || []).reduce((acc, p) => acc + (p.vendCount || 0), 0)

  const tokensGeneratedTotal = (tokenGeneratedPoints || []).reduce((acc, p) => acc + (p.totalTokens || 0), 0)

  const metersProgrammedTotal = (metersProgrammedPoints || []).reduce((acc, p) => acc + (p.programmedCount || 0), 0)
  const metersProgrammedDistinctTotal = (metersProgrammedPoints || []).reduce(
    (acc, p) => acc + (p.distinctMeters || 0),
    0
  )

  const formatCardValue = (value: number, valueFormat: string) => {
    if (valueFormat === "currency") {
      const { formatted } = formatCurrencyWithAbbreviation(Number(value), selectedCurrencySymbol)
      return formatted
    }
    if (valueFormat === "percent") {
      return `${Number(value).toFixed(1)}%`
    }
    return Number(value).toLocaleString()
  }

  const getCardTrend = (card: { comparisonChangePercent: number | null } | undefined) => {
    const changePercent = card?.comparisonChangePercent
    if (changePercent === null || changePercent === undefined) return null
    if (!Number.isFinite(changePercent)) return null
    return {
      value: `${Math.abs(changePercent).toFixed(1)}%`,
      positive: changePercent >= 0,
    }
  }

  const getCardIcon = (title: string) => {
    const normalized = title.toLowerCase()
    if (normalized.includes("collection")) return <CollectionIcon />
    if (normalized.includes("ticket")) return <RevenueIcon />
    if (normalized.includes("customer")) return <CustomeraIcon />
    if (normalized.includes("dispute")) return <BillingIcon />
    if (normalized.includes("vendor")) return <VendingIcon />
    return <RevenueIcon />
  }

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
    { value: 480000, label: "8m" },
    { value: 660000, label: "11m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  const getTimeFilterLabel = (filter: TimeFilter) => {
    if (filter === "day") return "Today"
    if (filter === "yesterday") return "Yesterday"
    if (filter === "week") return "This Week"
    if (filter === "lastWeek") return "Last Week"
    if (filter === "month") return "This Month"
    if (filter === "lastMonth") return "Last Month"
    if (filter === "year") return "This Year"
    if (filter === "lastYear") return "Last Year"
    return "All Time"
  }

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

  const Metric = ({ children, size = "lg" }: { children: React.ReactNode; size?: "sm" | "lg" }) => (
    <p className={`flex items-end gap-2 font-bold text-gray-900 ${size === "lg" ? "text-3xl" : "text-2xl"}`}>
      {children}
    </p>
  )

  const Text = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm font-medium text-gray-500 ${className}`}>{children}</p>
  )

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

  // Calculate derived metrics
  const collectionEfficiencyColor =
    collectionEfficiencyData && (collectionEfficiencyData.efficiencyPercent || 0) >= 90
      ? "text-green-500"
      : collectionEfficiencyData && (collectionEfficiencyData.efficiencyPercent || 0) >= 80
      ? "text-yellow-500"
      : "text-red-500"

  return (
    <>
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="flex w-full">
          <div className="flex w-full flex-col">
            <DashboardNav />

            <div className="mx-auto w-full px-3 py-8 2xl:container sm:px-4 md:px-6 2xl:px-16">
              <div className="mb-6 flex w-full flex-col gap-4">
                <div className="flex w-full items-start justify-between gap-4 2xl:flex-col">
                  <div className="flex w-full items-center justify-between gap-4">
                    <div>
                      <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl lg:text-3xl">
                        Dashboard Overview
                      </h1>
                      <p className="text-sm font-medium text-gray-500 sm:text-base">
                        Comprehensive overview of utility operations
                      </p>
                    </div>
                    <div className="hidden items-center gap-2 rounded-md bg-white p-2  xl:flex">
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
                  <div className="hidden rounded-lg p-3 sm:bg-white sm:p-2 sm:shadow-sm xl:flex">
                    <div className="flex flex-row items-center gap-4 max-sm:justify-between sm:gap-4">
                      <div className="flex flex-row items-center gap-2 max-sm:justify-between sm:gap-3">
                        <span className="text-sm  font-medium text-gray-500">Time Range:</span>

                        {/* Desktop Layout */}
                        <div className="hidden items-center gap-2 sm:flex">
                          <TimeFilterButton filter="day" label="Today" />
                          <TimeFilterButton filter="yesterday" label="Yesterday" />
                          <TimeFilterButton filter="week" label="This Week" />
                          <TimeFilterButton filter="lastWeek" label="Last Week" />
                          <TimeFilterButton filter="month" label="This Month" />
                          <TimeFilterButton filter="lastMonth" label="Last Month" />
                          <TimeFilterButton filter="year" label="This Year" />
                          <TimeFilterButton filter="lastYear" label="Last Year" />
                          <TimeFilterButton filter="all" label="All Time" />
                        </div>
                      </div>

                      {/* Date Range Filter */}
                      <div className="relative flex items-center gap-2 border-l pl-4">
                        <button
                          type="button"
                          onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
                          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                            customStartDate && customEndDate
                              ? "border-[#004B23] bg-[#004B23]/10 text-[#004B23]"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {customStartDate && customEndDate ? `${customStartDate} - ${customEndDate}` : "Custom Range"}
                          <svg
                            className={`size-4 transition-transform ${isDateRangeOpen ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isDateRangeOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsDateRangeOpen(false)} />
                            <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                              <div className="mb-3 text-sm font-medium text-gray-700">Select Date & Time Range</div>
                              <div className="space-y-3">
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Start Date & Time
                                  </label>
                                  <input
                                    type="datetime-local"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-gray-600">
                                    End Date & Time
                                  </label>
                                  <input
                                    type="datetime-local"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                                  />
                                </div>
                              </div>
                              <div className="mt-4 flex gap-2">
                                {(customStartDate || customEndDate) && (
                                  <button
                                    onClick={() => {
                                      setCustomStartDate("")
                                      setCustomEndDate("")
                                    }}
                                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                  >
                                    Clear
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    if (customStartDate && customEndDate) {
                                      refreshDashboardData()
                                      setIsDateRangeOpen(false)
                                    }
                                  }}
                                  disabled={!customStartDate || !customEndDate}
                                  className="flex-1 rounded-md bg-[#004B23] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003318] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Time Filter Section with Mobile Slider */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="w-full sm:w-auto">
                    <div className="rounded-lg p-3 sm:bg-white sm:p-2 sm:shadow-sm xl:hidden">
                      <div className="flex flex-row items-center gap-2 max-sm:justify-between sm:gap-3">
                        <span className="text-sm font-medium text-gray-500">Time Range:</span>

                        {/* Mobile Dropdown Layout */}
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
                                onClick={() => handleTimeFilterChange("yesterday")}
                                className={`block w-full px-3 py-2 text-left ${
                                  timeFilter === "yesterday"
                                    ? "bg-[#004B23] text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                Yesterday
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
                                onClick={() => handleTimeFilterChange("lastWeek")}
                                className={`block w-full px-3 py-2 text-left ${
                                  timeFilter === "lastWeek"
                                    ? "bg-[#004B23] text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                Last Week
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
                                onClick={() => handleTimeFilterChange("lastMonth")}
                                className={`block w-full px-3 py-2 text-left ${
                                  timeFilter === "lastMonth"
                                    ? "bg-[#004B23] text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                Last Month
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
                              <button
                                type="button"
                                onClick={() => handleTimeFilterChange("lastYear")}
                                className={`block w-full px-3 py-2 text-left ${
                                  timeFilter === "lastYear"
                                    ? "bg-[#004B23] text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                Last Year
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTimeFilterChange("all")}
                                className={`block w-full px-3 py-2 text-left ${
                                  timeFilter === "all" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                All Time
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

              {activeView === "kpi" && (
                <>
                  <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-6">
                    {(dashboardCards || []).map((card, index) => (
                      <Card
                        key={card.title}
                        title={card.title}
                        icon={getCardIcon(card.title)}
                        className={index < 3 ? "2xl:col-span-2" : "2xl:col-span-3"}
                      >
                        <div className="mb-2 flex items-center justify-between border-b py-2">
                          <Text>{card.description}</Text>
                          <Text className="text-xs">
                            {timeFilter === "day"
                              ? "00:00:00 AM to 23:59:59 PM"
                              : timeFilter === "year"
                              ? "Jan to Dec"
                              : card.periodLabel}
                          </Text>
                        </div>

                        {dashboardCardsLoading || isLoading ? (
                          <div className="animate-pulse">
                            <div className="h-8 w-32 rounded bg-gray-200"></div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                              <Metric>{formatCardValue(card.value, card.valueFormat)}</Metric>
                              {card.valueFormat === "currency" && (
                                <div className="text-sm text-gray-600">
                                  {(() => {
                                    const { full } = formatCurrencyWithAbbreviation(card.value, selectedCurrencySymbol)
                                    return full
                                  })()}
                                </div>
                              )}
                            </div>
                            {getCardTrend(card) && (
                              <TrendIndicator
                                value={getCardTrend(card)!.value}
                                positive={getCardTrend(card)!.positive}
                              />
                            )}
                          </div>
                        )}
                      </Card>
                    ))}

                    {!dashboardCardsLoading && !isLoading && dashboardCards.length === 0 && (
                      <Card title="Dashboard Cards" icon={<RevenueIcon />}>
                        <div className="mb-2 flex items-center justify-between border-b py-2">
                          <Text>No card data returned.</Text>
                        </div>
                        <Metric size="sm">-</Metric>
                      </Card>
                    )}
                  </div>

                  {/* Collection Efficiency Card */}
                  <div className="mb-6">
                    <Card title="Collection Efficiency">
                      {collectionEfficiencyLoading ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                          {/* Efficiency Percentage Skeleton */}
                          <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
                            <div className="mb-2 h-4 w-32 animate-pulse rounded bg-green-200"></div>
                            <div className="mb-2 h-10 w-20 animate-pulse rounded bg-green-300"></div>
                            <div className="h-4 w-24 animate-pulse rounded bg-green-200"></div>
                          </div>

                          {/* Total Billed Skeleton */}
                          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-blue-200"></div>
                            <div className="mb-2 h-8 w-32 animate-pulse rounded bg-blue-300"></div>
                            <div className="h-4 w-16 animate-pulse rounded bg-blue-200"></div>
                          </div>

                          {/* Total Collected Skeleton */}
                          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                            <div className="mb-2 h-4 w-28 animate-pulse rounded bg-purple-200"></div>
                            <div className="mb-2 h-8 w-32 animate-pulse rounded bg-purple-300"></div>
                            <div className="h-4 w-20 animate-pulse rounded bg-purple-200"></div>
                          </div>

                          {/* Performance Indicator Skeleton */}
                          <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                            <div className="mb-4 h-4 w-full animate-pulse rounded bg-gray-200"></div>
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                          </div>
                        </div>
                      ) : collectionEfficiencyError ? (
                        <div className="flex h-64 items-center justify-center">
                          <div className="text-center">
                            <div className="mb-2 text-lg font-semibold text-red-600">Error</div>
                            <div className="text-sm text-gray-600">{collectionEfficiencyError}</div>
                          </div>
                        </div>
                      ) : !collectionEfficiencyData ? (
                        <div className="flex h-64 items-center justify-center">
                          <div className="text-center">
                            <div className="mb-2 text-lg font-semibold text-gray-900">
                              No collection efficiency data
                            </div>
                            <div className="text-sm text-gray-600">Try changing the time range.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                          {/* Efficiency Percentage Card */}
                          <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
                            <div className="mb-2 text-sm font-medium uppercase tracking-wide text-green-600">
                              Collection Efficiency
                            </div>
                            <div className={`text-3xl font-bold ${collectionEfficiencyColor}`}>
                              {collectionEfficiencyData.efficiencyPercent?.toFixed(1) || "0.0"}%
                            </div>
                            <div className="mt-2 text-sm text-green-700">
                              {collectionEfficiencyData.efficiencyPercent >= 90
                                ? "Excellent"
                                : collectionEfficiencyData.efficiencyPercent >= 80
                                ? "Good"
                                : "Needs Improvement"}
                            </div>
                          </div>

                          {/* Total Billed Card */}
                          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                            <div className="mb-2 text-sm font-medium uppercase tracking-wide text-blue-600">
                              Total Billed
                            </div>
                            <div className="">
                              <div className="text-3xl font-bold text-blue-900">
                                {collectionEfficiencyData.totalBilled
                                  ? (() => {
                                      const { formatted } = formatCurrencyWithAbbreviation(
                                        collectionEfficiencyData.totalBilled,
                                        selectedCurrencySymbol
                                      )
                                      return formatted
                                    })()
                                  : `${selectedCurrencySymbol}0`}
                              </div>
                              <div className="flex w-full items-center justify-between">
                                <div className="text-sm text-blue-700">
                                  {collectionEfficiencyData.totalBilled
                                    ? (() => {
                                        const { full } = formatCurrencyWithAbbreviation(
                                          collectionEfficiencyData.totalBilled,
                                          selectedCurrencySymbol
                                        )
                                        return full
                                      })()
                                    : `${selectedCurrencySymbol}0`}
                                </div>

                                <div className="mt-2 text-sm text-blue-700">
                                  {collectionEfficiencyData.billCount?.toLocaleString() || "0"} bills
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Total Collected Card */}
                          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                            <div className="mb-2 text-sm font-medium uppercase tracking-wide text-purple-600">
                              Total Collected
                            </div>
                            <div className="">
                              <div className="text-3xl font-bold text-purple-900">
                                {collectionEfficiencyData.totalCollected
                                  ? (() => {
                                      const { formatted } = formatCurrencyWithAbbreviation(
                                        collectionEfficiencyData.totalCollected,
                                        selectedCurrencySymbol
                                      )
                                      return formatted
                                    })()
                                  : `${selectedCurrencySymbol}0`}
                              </div>
                              <div className="flex w-full items-center justify-between">
                                <div className="text-sm text-purple-700">
                                  {collectionEfficiencyData.totalCollected
                                    ? (() => {
                                        const { full } = formatCurrencyWithAbbreviation(
                                          collectionEfficiencyData.totalCollected,
                                          selectedCurrencySymbol
                                        )
                                        return full
                                      })()
                                    : `${selectedCurrencySymbol}0`}
                                </div>

                                <div className="mt-2 text-sm text-purple-700">
                                  {collectionEfficiencyData.billsWithPayments?.toLocaleString() || "0"} paid bills
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Performance Indicator */}
                          <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                            <div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-600">
                              Performance
                            </div>
                            <div className="mb-4">
                              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                                  style={{
                                    width: `${Math.min(collectionEfficiencyData.efficiencyPercent || 0, 100)}%`,
                                  }}
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
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* ENERGY DELIVERED vs ENERGY BILLED Chart */}
                  <Card title="ENERGY DELIVERED vs ENERGY BILLED" className="mb-6">
                    {energyBalanceLoading ? (
                      <div className="animate-pulse">
                        <div className="h-[300px] w-full rounded bg-gray-200" />
                      </div>
                    ) : energyBalanceError ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {energyBalanceError}
                      </div>
                    ) : memoizedEnergyBalanceChartData.length === 0 ? (
                      <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3v18h18M7 14l3-3 4 4 6-7"
                            />
                          </svg>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">No energy balance data</div>
                        <div className="mt-1 max-w-md text-sm text-gray-600">
                          Try changing the time range or confirm feeders exist for the selected period.
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={memoizedEnergyBalanceChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="delivered" name="Energy Delivered (kWh)" fill="#004B23" />
                          <Bar dataKey="billed" name="Energy Billed (kWh)" fill="#38b000" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Card>

                  {dashboardCardsError && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {dashboardCardsError}
                    </div>
                  )}

                  {/* Collection by BAND Section */}
                  <div className="mb-6 grid grid-cols-1 gap-6 2xl:grid-cols-2">
                    <Card title="Collection by BAND">
                      <div className="my-4 flex flex-col">
                        {collectionByBandLoading ? (
                          <div className="animate-pulse">
                            <div className="mb-4 h-24 w-full rounded bg-gray-200" />
                            <div className="h-[200px] w-full rounded bg-gray-200" />
                          </div>
                        ) : collectionByBandError ? (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {collectionByBandError}
                          </div>
                        ) : collectionByBandSlices.length === 0 ? (
                          <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                            <div className="text-sm font-semibold text-gray-900">No collection-by-band data</div>
                            <div className="mt-1 text-sm text-gray-600">Try changing the time range.</div>
                          </div>
                        ) : (
                          <>
                            <div className="mb-4 overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="p-2text-left font-medium text-gray-700">Band</th>
                                    <th className="p-2text-right font-medium text-gray-700">Collection</th>
                                    <th className="p-2text-right font-medium text-gray-700">%</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {collectionByBandSlices.map((item) => (
                                    <tr key={item.label} className="border-b border-gray-100 hover:bg-gray-50">
                                      <td className="p-2text-gray-800">{item.label}</td>
                                      <td className="p-2text-right text-gray-800">
                                        {selectedCurrencySymbol}
                                        {item.amount.toLocaleString()}
                                      </td>
                                      <td className="p-2text-right text-gray-800">{item.percentage}%</td>
                                    </tr>
                                  ))}
                                  <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                                    <td className="p-2text-gray-900">Total</td>
                                    <td className="p-2text-right text-gray-900">
                                      {selectedCurrencySymbol}
                                      {collectionByBandTotal.amount.toLocaleString()}
                                    </td>
                                    <td className="p-2text-right text-gray-900">100%</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={collectionByBandChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="percentage" name="Collection %" fill="#004B23" />
                              </BarChart>
                            </ResponsiveContainer>
                          </>
                        )}
                      </div>
                    </Card>

                    <div className="grid grid-cols-1  gap-6">
                      <Card title="Daily Collection">
                        {dailyCollectionLoading ? (
                          <div className="animate-pulse">
                            <div className="h-[200px] w-full rounded bg-gray-200" />
                          </div>
                        ) : dailyCollectionError ? (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {dailyCollectionError}
                          </div>
                        ) : memoizedDailyCollectionChartData.length === 0 ? (
                          <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                            <div className="text-sm font-semibold text-gray-900">No daily collection data</div>
                            <div className="mt-1 text-sm text-gray-600">Try changing the time range.</div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={memoizedDailyCollectionChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="day" />
                              <YAxis />
                              <Tooltip />
                              <Area
                                type="monotone"
                                dataKey="collection"
                                stroke="#004B23"
                                fill="#004B23"
                                fillOpacity={0.3}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </Card>

                      <Card title="State Performance">
                        {cboPerformanceLoading ? (
                          <div className="animate-pulse">
                            <div className="h-[150px] w-full rounded bg-gray-200" />
                          </div>
                        ) : cboPerformanceError ? (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {cboPerformanceError}
                          </div>
                        ) : cboPerformanceChartData.length === 0 ? (
                          <div className="flex h-[150px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                            <div className="text-sm font-semibold text-gray-900">No State performance data</div>
                            <div className="mt-1 text-sm text-gray-600">Try changing the time range.</div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={cboPerformanceChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Bar dataKey="performance" name="Performance %" fill="#004B23" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </Card>
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-4">
                    <Card title="New Connections (MTD)" icon={<ConnectionIcon />}>
                      <div className="mb-2 flex items-center justify-between border-b py-2">
                        <Text>Meter Installations</Text>
                      </div>
                      {newConnectionsLoading || isLoading ? (
                        <div className="animate-pulse">
                          <div className="h-8 w-32 rounded bg-gray-200"></div>
                        </div>
                      ) : newConnectionsError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                          {newConnectionsError}
                        </div>
                      ) : newConnectionsTotal === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700">
                          No new connections for this period.
                        </div>
                      ) : (
                        <>
                          <Metric size="lg">{newConnectionsTotal.toLocaleString()}</Metric>
                          <div className="mt-2 text-sm text-gray-600">Total connections this period</div>
                        </>
                      )}
                    </Card>

                    <Card title="Prepaid Vends" icon={<VendingIcon />}>
                      <div className="mb-2 flex items-center justify-between border-b py-2">
                        <Text>Token Transactions</Text>
                      </div>
                      {prepaidVendsLoading || isLoading ? (
                        <div className="animate-pulse">
                          <div className="h-8 w-32 rounded bg-gray-200"></div>
                        </div>
                      ) : prepaidVendsError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                          {prepaidVendsError}
                        </div>
                      ) : prepaidVendsTotal === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700">
                          No prepaid vends for this period.
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Metric size="lg">{prepaidVendsTotal.toLocaleString()}</Metric>
                        </div>
                      )}
                    </Card>

                    <Card title="Tokens Generated" icon={<TokenGeneratedIcon />}>
                      <div className="mb-2 flex items-center justify-between border-b py-2">
                        <Text>KCT, CTT, CCT Tokens</Text>
                      </div>
                      {tokenGeneratedLoading || isLoading ? (
                        <div className="animate-pulse">
                          <div className="h-8 w-32 rounded bg-gray-200"></div>
                        </div>
                      ) : tokenGeneratedError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                          {tokenGeneratedError}
                        </div>
                      ) : tokensGeneratedTotal === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700">
                          No tokens generated for this period.
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Metric size="lg">{tokensGeneratedTotal.toLocaleString()}</Metric>
                        </div>
                      )}
                    </Card>

                    <Card title="Meters Programmed" icon={<MetersProgrammedIcon />}>
                      <div className="mb-2 flex items-center justify-between border-b py-2">
                        <Text>{metersProgrammedDistinctTotal.toLocaleString()} distinct meters</Text>
                      </div>
                      {metersProgrammedLoading || isLoading ? (
                        <div className="animate-pulse">
                          <div className="h-8 w-32 rounded bg-gray-200"></div>
                        </div>
                      ) : metersProgrammedError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                          {metersProgrammedError}
                        </div>
                      ) : metersProgrammedTotal === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700">
                          No meters programmed for this period.
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Metric size="lg">{metersProgrammedTotal.toLocaleString()}</Metric>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Outstanding Arrears Section */}
                  <div className="mb-6">
                    <Card title="Outstanding Arrears Summary" icon={<RevenueIcon />}>
                      {outstandingArrearsLoading || isLoading ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          {/* Total Outstanding Skeleton */}
                          <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-6">
                            <div className="mb-2 h-4 w-32 animate-pulse rounded bg-red-200"></div>
                            <div className="mb-2 h-10 w-32 animate-pulse rounded bg-red-300"></div>
                            <div className="h-4 w-24 animate-pulse rounded bg-red-200"></div>
                          </div>

                          {/* Debits Skeleton */}
                          <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-6">
                            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-orange-200"></div>
                            <div className="mb-2 h-8 w-28 animate-pulse rounded bg-orange-300"></div>
                            <div className="h-4 w-20 animate-pulse rounded bg-orange-200"></div>
                          </div>

                          {/* Credits Skeleton */}
                          <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
                            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-green-200"></div>
                            <div className="mb-2 h-8 w-28 animate-pulse rounded bg-green-300"></div>
                            <div className="h-4 w-20 animate-pulse rounded bg-green-200"></div>
                          </div>
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
                            <div className="text-sm text-gray-600">Try refreshing the dashboard.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          {/* Total Outstanding Card */}
                          <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-6">
                            <div className="mb-2 text-sm font-medium uppercase tracking-wide text-red-600">
                              Total Outstanding
                            </div>
                            <div className="text-3xl font-bold text-red-900">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalOutstanding,
                                  selectedCurrencySymbol
                                ).formatted
                              }
                            </div>
                            <div className="mt-1 text-sm text-red-700">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalOutstanding,
                                  selectedCurrencySymbol
                                ).full
                              }
                            </div>
                            <div className="mt-2 text-sm text-red-700">
                              {outstandingArrearsData.customersInArrears.toLocaleString()} customers in arrears
                            </div>
                          </div>

                          {/* Total Debits Card */}
                          <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-6">
                            <div className="mb-2 text-sm font-medium uppercase tracking-wide text-orange-600">
                              Total Debits
                            </div>
                            <div className="text-3xl font-bold text-orange-900">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalDebits,
                                  selectedCurrencySymbol
                                ).formatted
                              }
                            </div>
                            <div className="mt-1 text-sm text-orange-700">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalDebits,
                                  selectedCurrencySymbol
                                ).full
                              }
                            </div>
                            <div className="mt-2 text-sm text-orange-700">Outstanding charges and fees</div>
                          </div>

                          {/* Total Credits Card */}
                          <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
                            <div className="mb-2 text-sm font-medium uppercase tracking-wide text-green-600">
                              Total Credits
                            </div>
                            <div className="text-3xl font-bold text-green-900">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalCredits,
                                  selectedCurrencySymbol
                                ).formatted
                              }
                            </div>
                            <div className="mt-1 text-sm text-green-700">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalCredits,
                                  selectedCurrencySymbol
                                ).full
                              }
                            </div>
                            <div className="mt-2 text-sm text-green-700">Payments and adjustments</div>
                          </div>
                        </div>
                      )}

                      {/* Bottom row with net amount and performance indicator */}
                      {outstandingArrearsData && !outstandingArrearsLoading && !outstandingArrearsError && (
                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                          {/* Net Amount Card */}
                          <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                            <div className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-600">
                              Net Amount
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalDebits - outstandingArrearsData.totalCredits,
                                  selectedCurrencySymbol
                                ).formatted
                              }
                            </div>
                            <div className="mt-1 text-sm text-gray-700">
                              {
                                formatCurrencyWithAbbreviation(
                                  outstandingArrearsData.totalDebits - outstandingArrearsData.totalCredits,
                                  selectedCurrencySymbol
                                ).full
                              }
                            </div>
                            <div className="mt-2 text-sm text-gray-700">Debits minus credits</div>
                          </div>

                          {/* Arrears Ratio Card */}
                          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                            <div className="mb-2 text-sm font-medium uppercase tracking-wide text-blue-600">
                              Arrears Ratio
                            </div>
                            <div className="mb-4">
                              <div className="h-4 w-full overflow-hidden rounded-full bg-blue-200">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                                  style={{
                                    width: `${Math.min(
                                      (outstandingArrearsData.totalDebits /
                                        (outstandingArrearsData.totalDebits + outstandingArrearsData.totalCredits)) *
                                        100 || 0,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-sm text-blue-700">
                              <div className="flex justify-between">
                                <span>Debit/Credit Ratio</span>
                                <span className="font-semibold">
                                  {(
                                    (outstandingArrearsData.totalDebits /
                                      (outstandingArrearsData.totalDebits + outstandingArrearsData.totalCredits)) *
                                      100 || 0
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Additional Charts Section */}
                  <div className="mb-6 grid grid-cols-1 gap-6 2xl:grid-cols-3">
                    <div className="col-span-2 grid grid-cols-1 gap-6">
                      <Card>
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Payment Breakdown</h3>
                          <p className="text-sm text-gray-600">Payment channels and collector types analysis</p>
                        </div>
                        {breakdownLoading ? (
                          <div className="flex h-64 items-center justify-center p-4">
                            <div className="w-full">
                              {/* Chart skeleton */}
                              <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200"></div>
                              <div className="flex h-48 items-end justify-between gap-2">
                                {[...Array(8)].map((_, i) => (
                                  <div key={i} className="flex w-full flex-col gap-1">
                                    <div
                                      className="h-full animate-pulse rounded bg-gray-200"
                                      style={{ height: `${Math.random() * 60 + 20}%` }}
                                    ></div>
                                    <div className="h-2 w-full animate-pulse rounded bg-gray-200"></div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 flex justify-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="size-3 animate-pulse rounded bg-gray-300"></div>
                                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="size-3 animate-pulse rounded bg-gray-300"></div>
                                  <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : breakdownError ? (
                          <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                              <div className="mb-2 text-lg font-semibold text-red-600">Error</div>
                              <div className="text-sm text-gray-600">{breakdownError}</div>
                            </div>
                          </div>
                        ) : !breakdownSlices || breakdownSlices.length === 0 ? (
                          <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                              <div className="mb-2 text-lg font-semibold text-gray-900">No breakdown data</div>
                              <div className="text-sm text-gray-600">Try changing the time range.</div>
                            </div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={breakdownSlices}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="label" />
                              <YAxis yAxisId="left" orientation="left" stroke="#004B23" />
                              <YAxis yAxisId="right" orientation="right" stroke="#ea5806" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "8px",
                                }}
                                formatter={(value: number, name: string) => [
                                  name === "amount"
                                    ? `${selectedCurrencySymbol}${value.toLocaleString()}`
                                    : value.toLocaleString(),
                                  name === "amount" ? "Amount" : name === "count" ? "Count" : "Percentage",
                                ]}
                              />
                              <Legend />
                              <Bar yAxisId="left" dataKey="amount" fill="#004B23" name="Amount" />
                              <Bar yAxisId="right" dataKey="count" fill="#ea5806" name="Count" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </Card>

                      <Card title="DISPUTES OVERVIEW">
                        {disputesLoading ? (
                          <div className="animate-pulse">
                            <div className="h-[300px] w-full rounded bg-gray-200" />
                          </div>
                        ) : disputesError ? (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {disputesError}
                          </div>
                        ) : memoizedDisputesChartData.length === 0 ? (
                          <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                              </svg>
                            </div>
                            <div className="text-sm font-semibold text-gray-900">No disputes data</div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={memoizedDisputesChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="count" name="Dispute Count" fill="#dc2626" />
                              <Bar dataKey="amount" name="Dispute Amount" fill="#f97316" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <Card title="ACTIVE CUSTOMERS SUMMARY" className="border-0 shadow-lg">
                        <div className="space-y-6">
                          {/* Header with total customers */}
                          <div className="border-b border-gray-100 pb-4 text-center">
                            <div className="mb-2">
                              <div className="mb-1 text-3xl font-bold text-gray-900">
                                {customerSegmentsData?.totalCustomers?.toLocaleString() || "0"}
                              </div>
                              <div className="text-sm font-medium uppercase tracking-wide text-gray-500">
                                Total Active Customers
                              </div>
                            </div>
                            {customerSegmentsData && (
                              <div className="mt-3 flex justify-center gap-6 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                  <span>Active: {customerSegmentsData.activeCustomers.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                  <span>Suspended: {customerSegmentsData.suspendedCustomers.toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Pie Chart */}
                          <div className="flex justify-center">
                            <ResponsiveContainer width="100%" height={180}>
                              <PieChart>
                                <Pie
                                  data={activeCustomersData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={45}
                                  outerRadius={70}
                                  paddingAngle={3}
                                  dataKey="value"
                                  startAngle={90}
                                  endAngle={-270}
                                >
                                  {activeCustomersData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                      className="transition-opacity hover:opacity-80"
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                  }}
                                  formatter={(value: number) => [value.toLocaleString(), "Customers"]}
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  height={36}
                                  formatter={(value) => <span className="text-xs text-gray-700">{value}</span>}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Customer metrics grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3 text-center">
                              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-600">
                                Postpaid
                              </div>
                              <div className="text-xl font-bold text-blue-900">
                                {customerSegmentsData?.postpaidCustomers?.toLocaleString() || "0"}
                              </div>
                              <div className="mt-1 text-xs text-blue-600">
                                {customerSegmentsData &&
                                  `${(
                                    (customerSegmentsData.postpaidCustomers / customerSegmentsData.totalCustomers) *
                                    100
                                  ).toFixed(1)}%`}
                              </div>
                            </div>
                            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-3 text-center">
                              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-green-600">
                                Prepaid
                              </div>
                              <div className="text-xl font-bold text-green-900">
                                {customerSegmentsData?.prepaidCustomers?.toLocaleString() || "0"}
                              </div>
                              <div className="mt-1 text-xs text-green-600">
                                {customerSegmentsData &&
                                  `${(
                                    (customerSegmentsData.prepaidCustomers / customerSegmentsData.totalCustomers) *
                                    100
                                  ).toFixed(1)}%`}
                              </div>
                            </div>
                            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-3 text-center">
                              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-600">
                                Active
                              </div>
                              <div className="text-xl font-bold text-purple-900">
                                {customerSegmentsData?.activeCustomers?.toLocaleString() || "0"}
                              </div>
                              <div className="mt-1 text-xs text-purple-600">
                                {customerSegmentsData &&
                                  `${(
                                    (customerSegmentsData.activeCustomers / customerSegmentsData.totalCustomers) *
                                    100
                                  ).toFixed(1)}%`}
                              </div>
                            </div>
                            <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-3 text-center">
                              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-orange-600">
                                Suspended
                              </div>
                              <div className="text-xl font-bold text-orange-900">
                                {customerSegmentsData?.suspendedCustomers?.toLocaleString() || "0"}
                              </div>
                              <div className="mt-1 text-xs text-orange-600">
                                {customerSegmentsData &&
                                  `${(
                                    (customerSegmentsData.suspendedCustomers / customerSegmentsData.totalCustomers) *
                                    100
                                  ).toFixed(1)}%`}
                              </div>
                            </div>
                            <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 text-center">
                              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-cyan-600">
                                Unmetered
                              </div>
                              <div className="text-xl font-bold text-cyan-900">
                                {customerSegmentsData?.unmeteredCustomers?.toLocaleString() || "0"}
                              </div>
                              <div className="mt-1 text-xs text-cyan-600">
                                {customerSegmentsData &&
                                  `${(
                                    (customerSegmentsData.unmeteredCustomers / customerSegmentsData.totalCustomers) *
                                    100
                                  ).toFixed(1)}%`}
                              </div>
                            </div>
                            <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 text-center">
                              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-600">MD</div>
                              <div className="text-xl font-bold text-indigo-900">
                                {customerSegmentsData?.mdCustomers?.toLocaleString() || "0"}
                              </div>
                              <div className="mt-1 text-xs text-indigo-600">
                                {customerSegmentsData &&
                                  `${(
                                    (customerSegmentsData.mdCustomers / customerSegmentsData.totalCustomers) *
                                    100
                                  ).toFixed(1)}%`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Trend Chart */}
                  <Card className="mb-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Payment Trends</h3>
                      <p className="text-sm text-gray-600">Confirmed payments over time</p>
                    </div>
                    {trendLoading ? (
                      <div className="flex h-64 items-center justify-center p-4">
                        <div className="w-full">
                          {/* Chart skeleton */}
                          <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200"></div>
                          <div className="flex h-48 items-end justify-between gap-2">
                            {[...Array(12)].map((_, i) => (
                              <div key={i} className="flex w-full flex-col gap-1">
                                <div
                                  className="h-full animate-pulse rounded bg-gray-200"
                                  style={{ height: `${Math.random() * 60 + 20}%` }}
                                ></div>
                                <div className="h-2 w-full animate-pulse rounded bg-gray-200"></div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex justify-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="size-3 animate-pulse rounded bg-gray-300"></div>
                              <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="size-3 animate-pulse rounded bg-gray-300"></div>
                              <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : trendError ? (
                      <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                          <div className="mb-2 text-lg font-semibold text-red-600">Error</div>
                          <div className="text-sm text-gray-600">{trendError}</div>
                        </div>
                      </div>
                    ) : !trendPoints || trendPoints.length === 0 ? (
                      <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                          <div className="mb-2 text-lg font-semibold text-gray-900">No trend data</div>
                          <div className="text-sm text-gray-600">Try changing the time range.</div>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart
                          data={trendPoints.map((point) => ({
                            date: new Date(point.bucketDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "2-digit",
                            }),
                            amount: point.amount,
                            count: point.count,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" orientation="left" stroke="#004B23" />
                          <YAxis yAxisId="right" orientation="right" stroke="#ea5806" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number, name: string) => [
                              name === "amount"
                                ? `${selectedCurrencySymbol}${value.toLocaleString()}`
                                : value.toLocaleString(),
                              name === "amount" ? "Amount" : "Count",
                            ]}
                          />
                          <Legend />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="amount"
                            stroke="#004B23"
                            fill="#004B23"
                            fillOpacity={0.3}
                            name="Amount"
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="count"
                            stroke="#ea5806"
                            fill="#ea5806"
                            fillOpacity={0.3}
                            name="Count"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </Card>

                  {/* Breakdown Chart */}

                  {/* Date Range */}
                  <Card className="mb-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Text>Selected Date Range:</Text>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2">
                          <Text>From:</Text>
                          <span className="font-medium text-gray-900">11/03/2025</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Text>To:</Text>
                          <span className="font-medium text-gray-900">11/03/2025</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
