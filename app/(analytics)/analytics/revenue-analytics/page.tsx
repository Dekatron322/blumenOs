"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { motion } from "framer-motion"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import {
  clearRevenueAnalytics,
  clearRevenueBreakdown,
  clearRevenuePaymentTypes,
  clearRevenueTopCollectors,
  fetchRevenueAnalytics,
  fetchRevenueBreakdown,
  fetchRevenuePaymentTypes,
  fetchRevenueTopCollectors,
} from "lib/redux/revenueAnalyticsSlice"
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
import { BillingIcon, CollectionIcon, CustomeraIcon, MetersProgrammedIcon, RevenueIcon } from "components/Icons/Icons"

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

// List View Skeleton

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
const Metric = ({ children, size = "md" }: { children: React.ReactNode; size?: "sm" | "md" | "lg" }) => (
  <p
    className={`flex items-end gap-2 font-bold text-gray-900 ${
      size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-xl"
    }`}
  >
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
  const [breakdownDimension, setBreakdownDimension] = useState<0 | 1 | 2 | 3 | 4 | 5>(0)
  const [showCategories, setShowCategories] = useState(true)
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null)
  const [secondsAgo, setSecondsAgo] = useState(0)

  const dispatch = useAppDispatch()
  const {
    data: revenueData,
    loading: revenueLoading,
    error: revenueError,
    isSuccess: revenueSuccess,
    breakdownSlices,
    breakdownLoading,
    breakdownError,
    breakdownSuccess,
    currentBreakdownDimension,
    paymentTypesSlices,
    paymentTypesLoading,
    paymentTypesError,
    paymentTypesSuccess,
    topCollectors,
    topCollectorsLoading,
    topCollectorsError,
    topCollectorsSuccess,
  } = useAppSelector((state) => state.revenueAnalytics)

  // Generate mock meter data
  const generateMeterData = () => {
    return {
      smartMeters: 89420,
      conventionalMeters: 29514,
      readSuccessRate: 94.2,
      alerts: 847,
      totalMeters: 89420 + 29514,
      revenueToday: 2450000,
      revenueMTD: 45200000,
      revenueYTD: 512000000,
      customers: 125000,
      prepaidCustomers: 85000,
      postpaidCustomers: 35000,
      collectionEfficiency: 92.5,
    }
  }

  const [meterData, setMeterData] = useState(generateMeterData())

  // Use mock data
  const {
    smartMeters,
    conventionalMeters,
    readSuccessRate,
    alerts,
    totalMeters,
    revenueToday,
    revenueMTD,
    revenueYTD,
    customers,
    prepaidCustomers,
    postpaidCustomers,
    collectionEfficiency,
  } = meterData

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh data after adding customer
    setMeterData(generateMeterData())
    refreshRevenueData()
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setMeterData(generateMeterData())
      refreshRevenueData()
      setIsLoading(false)
    }, 1000)
  }

  const refreshRevenueData = () => {
    const now = new Date()
    setLastFetchTime(now)
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

    // Fetch all revenue analytics data
    dispatch(
      fetchRevenueAnalytics({
        StartDateUtc: startDateUtc,
        EndDateUtc: endDateUtc,
      })
    )

    dispatch(
      fetchRevenueBreakdown({
        StartDateUtc: startDateUtc,
        EndDateUtc: endDateUtc,
        dimension: breakdownDimension,
      })
    )

    dispatch(
      fetchRevenuePaymentTypes({
        StartDateUtc: startDateUtc,
        EndDateUtc: endDateUtc,
      })
    )

    dispatch(
      fetchRevenueTopCollectors({
        StartDateUtc: startDateUtc,
        EndDateUtc: endDateUtc,
        top: 10,
      })
    )
  }

  useEffect(() => {
    refreshRevenueData()

    // Cleanup on unmount
    return () => {
      dispatch(clearRevenueAnalytics())
      dispatch(clearRevenueBreakdown())
      dispatch(clearRevenuePaymentTypes())
      dispatch(clearRevenueTopCollectors())
    }
  }, [dispatch, timeFilter, breakdownDimension])

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter)
    setIsMobileFilterOpen(false)
  }

  const getTimeFilterLabel = (filter: TimeFilter) => {
    if (filter === "day") return "Today"
    if (filter === "week") return "This Week"
    if (filter === "month") return "This Month"
    if (filter === "year") return "This Year"
    return "All Time"
  }

  // Prepare chart data
  const dailyRevenueChartData = (revenueData || []).map((point) => ({
    date: new Date(point.bucketDate).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
    }),
    amount: point.amount,
    count: point.count,
  }))

  const revenueBreakdownChartData = (breakdownSlices || []).map((slice) => ({
    name: slice.label,
    amount: slice.amount,
    percentage: slice.percentage,
    count: slice.count,
  }))

  const paymentTypesChartData = (paymentTypesSlices || []).map((slice) => ({
    name: slice.label,
    value: slice.amount,
    percentage: slice.percentage,
  }))

  const topCollectorsChartData = (topCollectors || []).slice(0, 10).map((collector) => ({
    name: collector.collectorName.substring(0, 15) + (collector.collectorName.length > 15 ? "..." : ""),
    amount: collector.totalAmount,
    count: collector.totalCount,
    type: collector.collectorType,
  }))

  const meterTypesData = [
    { name: "Smart Meters", value: smartMeters, color: "#004B23" },
    { name: "Conventional Meters", value: conventionalMeters, color: "#38b000" },
  ]

  const customerTypesData = [
    { name: "Prepaid", value: prepaidCustomers, color: "#004B23" },
    { name: "Postpaid", value: postpaidCustomers, color: "#38b000" },
  ]

  const COLORS = ["#004B23", "#38b000", "#007200", "#4f46e5", "#ea5806", "#dc2626"]

  const getCardIcon = (title: string) => {
    const normalized = title.toLowerCase()
    if (normalized.includes("revenue")) return <RevenueIcon />
    if (normalized.includes("collection")) return <CollectionIcon />
    if (normalized.includes("customer")) return <CustomeraIcon />
    if (normalized.includes("meter")) return <MetersProgrammedIcon />
    if (normalized.includes("alert")) return <BillingIcon />
    return <RevenueIcon />
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto w-full px-3 py-8 xl:container xl:px-16">
            {/* Header Section */}
            <div className="mb-6 flex w-full flex-col gap-4">
              <div className="flex w-full items-start justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl lg:text-3xl">
                    Revenue Analytics
                  </h1>
                  <p className="text-sm font-medium text-gray-500 sm:text-base">
                    Comprehensive view of revenue collection, payment methods, and top performers
                  </p>
                </div>
                <div className="hidden rounded-lg p-3 sm:bg-white sm:p-2 sm:shadow-sm xl:flex">
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
                          <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border border-gray-100 bg-white py-1 text-sm shadow-lg">
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
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card title="Total Meters" icon={getCardIcon("Total Meters")}>
                <div className="mb-2 flex items-center justify-between border-b py-2">
                  <Text>Smart & Conventional</Text>
                  <Text className="text-xs">{getTimeFilterLabel(timeFilter)}</Text>
                </div>
                <Metric>{formatNumber(totalMeters)}</Metric>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-green-600">Smart: {formatNumber(smartMeters)}</span>
                  <span className="text-blue-600">Conv: {formatNumber(conventionalMeters)}</span>
                </div>
              </Card>

              <Card title="Total Revenue" icon={getCardIcon("Total Revenue")}>
                <div className="mb-2 flex items-center justify-between border-b py-2">
                  <Text>{getTimeFilterLabel(timeFilter)} Revenue</Text>
                  <Text className="text-xs">Currency: {selectedCurrencySymbol}</Text>
                </div>
                <Metric>
                  {selectedCurrencySymbol}
                  {formatNumber(timeFilter === "day" ? revenueToday : timeFilter === "month" ? revenueMTD : revenueYTD)}
                </Metric>
                <div className="mt-2 text-sm text-gray-600">{revenueData?.length || 0} days of data</div>
              </Card>

              <Card title="Total Customers" icon={getCardIcon("Total Customers")}>
                <div className="mb-2 flex items-center justify-between border-b py-2">
                  <Text>Active Customers</Text>
                  <Text className="text-xs">{getTimeFilterLabel(timeFilter)}</Text>
                </div>
                <Metric>{formatNumber(customers)}</Metric>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-green-600">Prepaid: {formatNumber(prepaidCustomers)}</span>
                  <span className="text-blue-600">Postpaid: {formatNumber(postpaidCustomers)}</span>
                </div>
              </Card>

              <Card title="Collection Efficiency" icon={getCardIcon("Collection Efficiency")}>
                <div className="mb-2 flex items-center justify-between border-b py-2">
                  <Text>Success Rate</Text>
                  <Text className="text-xs">{getTimeFilterLabel(timeFilter)}</Text>
                </div>
                <Metric>{collectionEfficiency}%</Metric>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-green-600">Read Success: {readSuccessRate}%</span>
                  <span className="text-red-600">Alerts: {formatNumber(alerts)}</span>
                </div>
              </Card>
            </div>

            {/* Main Analytics Section */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Daily Revenue Trend */}
              <div className="lg:col-span-2">
                <Card title="Daily Revenue Trend">
                  {revenueLoading ? (
                    <div className="animate-pulse">
                      <div className="h-[300px] w-full rounded bg-gray-200" />
                    </div>
                  ) : revenueError ? (
                    <div className="flex h-[300px] items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="text-center">
                        <div className="mb-2 text-lg font-semibold text-red-600">Error Loading Data</div>
                        <div className="text-sm text-gray-600">{revenueError}</div>
                        <button
                          onClick={refreshRevenueData}
                          className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : dailyRevenueChartData.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="mb-2 text-lg font-semibold text-gray-900">No Revenue Data</div>
                        <div className="text-sm text-gray-600">Try changing the time range</div>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dailyRevenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${selectedCurrencySymbol}${formatNumber(Number(value))}`, "Amount"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#004B23"
                          fill="#004B23"
                          fillOpacity={0.3}
                          name="Revenue"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </div>

              {/* Payment Types Breakdown */}
              <Card title="Payment Types Breakdown">
                {paymentTypesLoading ? (
                  <div className="animate-pulse">
                    <div className="h-[300px] w-full rounded bg-gray-200" />
                  </div>
                ) : paymentTypesError ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-red-600">Error</div>
                      <div className="text-xs text-gray-600">{paymentTypesError}</div>
                    </div>
                  </div>
                ) : paymentTypesChartData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-gray-900">No Payment Data</div>
                      <div className="text-xs text-gray-600">Try changing the time range</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentTypesChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentTypesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${selectedCurrencySymbol}${formatNumber(Number(value))}`, "Amount"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            {/* Revenue Breakdown and Top Collectors */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Revenue Breakdown by Dimension */}
              <Card title="Revenue Breakdown">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <Text>Breakdown by:</Text>
                    <select
                      value={breakdownDimension}
                      onChange={(e) => setBreakdownDimension(parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5)}
                      className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                    >
                      <option value={0}>Service Type</option>
                      <option value={1}>Area Office</option>
                      <option value={2}>Customer Category</option>
                      <option value={3}>Payment Channel</option>
                      <option value={4}>Collector Type</option>
                      <option value={5}>Revenue Band</option>
                    </select>
                  </div>
                </div>

                {breakdownLoading ? (
                  <div className="animate-pulse">
                    <div className="h-[250px] w-full rounded bg-gray-200" />
                  </div>
                ) : breakdownError ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-red-600">Error</div>
                      <div className="text-xs text-gray-600">{breakdownError}</div>
                    </div>
                  </div>
                ) : revenueBreakdownChartData.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-gray-900">No Breakdown Data</div>
                      <div className="text-xs text-gray-600">Try changing the dimension</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueBreakdownChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${selectedCurrencySymbol}${formatNumber(Number(value))}`, "Amount"]}
                      />
                      <Bar dataKey="amount" fill="#004B23" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {/* Top Collectors */}
              <Card title="Top 10 Collectors">
                {topCollectorsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-[250px] w-full rounded bg-gray-200" />
                  </div>
                ) : topCollectorsError ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-red-600">Error</div>
                      <div className="text-xs text-gray-600">{topCollectorsError}</div>
                    </div>
                  </div>
                ) : topCollectorsChartData.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm font-semibold text-gray-900">No Collector Data</div>
                      <div className="text-xs text-gray-600">Try changing the time range</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topCollectorsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${selectedCurrencySymbol}${formatNumber(Number(value))}`, "Amount"]}
                      />
                      <Bar dataKey="amount" fill="#38b000" name="Collection Amount" />
                    </BarChart>
                  </ResponsiveContainer>
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
