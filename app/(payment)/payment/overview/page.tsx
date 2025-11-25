"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  AlertIcon,
  BankIcon,
  MetersProgrammedIcon,
  MobileMoneyIcon,
  PdfFileIcon,
  PlayIcon,
  PosIcon,
  TamperIcon,
  TokenGeneratedIcon,
  VendingIcon,
} from "components/Icons/Icons"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import { ButtonModule } from "components/ui/Button/Button"
import PaymentInfo from "components/PaymentInfo/PaymentInfo"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchPaymentSummaryAnalytics, setPaymentSummaryAnalyticsParams } from "lib/redux/analyticsSlice"

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

// Payment Channel Interface
interface PaymentChannel {
  name: string
  status: "active" | "inactive"
  amount: number
  transactions: number
  share: number
  color?: string
  bgColor?: string
  icon: JSX.Element
}

// Time Filter Types
type TimeFilter = "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth" | "thisYear" | "allTime"

interface TimeFilterTab {
  key: TimeFilter
  label: string
  isActive: boolean
}

// Generate payment channels data from API response
const generatePaymentChannelsFromData = (paymentData: any): PaymentChannel[] => {
  if (!paymentData?.windows || paymentData.windows.length === 0) {
    return generateDefaultPaymentChannels()
  }

  const currentWindow = paymentData.windows[0] // Get the first (current) time window
  const totalAmount = currentWindow.amount
  const totalTransactions = currentWindow.count

  return currentWindow.byChannel.map((channel: any) => ({
    name: formatChannelName(channel.key),
    status: "active",
    amount: channel.amount,
    transactions: channel.count,
    share: totalAmount > 0 ? (channel.amount / totalAmount) * 100 : 0,
    color: getChannelColor(channel.key),
    icon: getChannelIcon(channel.key),
  }))
}

// Format channel name for display
const formatChannelName = (channelKey: string): string => {
  const nameMap: { [key: string]: string } = {
    Cash: "Cash",
    BankTransfer: "Bank Transfer",
    MobileMoney: "Mobile Money",
    POS: "POS/Agent",
    Card: "Online Cards",
    Bank: "Bank Transfer",
    Mobile: "Mobile Money",
  }
  return nameMap[channelKey] || channelKey
}

// Get color for payment channel
const getChannelColor = (channelName: string): string => {
  const colors: { [key: string]: string } = {
    Cash: "bg-yellow-500",
    BankTransfer: "bg-blue-500",
    Bank: "bg-blue-500",
    MobileMoney: "bg-green-500",
    Mobile: "bg-green-500",
    POS: "bg-purple-500",
    Card: "bg-orange-500",
    "Online Cards": "bg-orange-500",
  }
  return colors[channelName] || "bg-gray-500"
}

// Get icon for payment channel
const getChannelIcon = (channelName: string): JSX.Element => {
  const icons: { [key: string]: JSX.Element } = {
    Cash: <TokenGeneratedIcon />,
    BankTransfer: <BankIcon />,
    Bank: <BankIcon />,
    MobileMoney: <MobileMoneyIcon />,
    Mobile: <MobileMoneyIcon />,
    POS: <PosIcon />,
    Card: <AlertIcon />,
    "Online Cards": <AlertIcon />,
  }
  return icons[channelName] || <AlertIcon />
}

// Generate default payment channels (fallback)
const generateDefaultPaymentChannels = (): PaymentChannel[] => {
  return [
    {
      name: "Bank Transfer",
      status: "active",
      amount: 895000,
      transactions: 3420,
      share: 35.8,
      color: "bg-blue-500",
      icon: <BankIcon />,
    },
    {
      name: "Mobile Money",
      status: "active",
      amount: 678000,
      transactions: 5680,
      share: 27.1,
      color: "bg-green-500",
      icon: <MobileMoneyIcon />,
    },
    {
      name: "POS/Agent",
      status: "active",
      amount: 524000,
      transactions: 2890,
      share: 21,
      color: "bg-purple-500",
      icon: <PosIcon />,
    },
    {
      name: "Online Cards",
      status: "active",
      amount: 402000,
      transactions: 1640,
      share: 16.1,
      color: "bg-orange-500",
      icon: <AlertIcon />,
    },
  ]
}

// Calculate metrics from payment summary data
const calculateMetricsFromData = (paymentData: any, timeFilter: TimeFilter) => {
  if (!paymentData?.windows || paymentData.windows.length === 0) {
    return generateDefaultMetrics(timeFilter)
  }

  const currentWindow = paymentData.windows[0]

  const todaysCollections = currentWindow.amount
  const paymentsToday = currentWindow.count

  // For trend calculation, we'll use a simple mock since we only get one window
  // In a real scenario, you might want to store previous data for comparison
  const trend = calculateTrend(timeFilter, todaysCollections)

  // Calculate collection efficiency (mock calculation based on amount)
  const collectionEfficiency = Math.min(95, Math.max(70, (currentWindow.amount / 100000) * 100))

  // Calculate outstanding debt (mock calculation)
  const outstandingDebt = Math.max(0, 500000 - currentWindow.amount)

  return {
    todaysCollections,
    collectionEfficiency: Math.round(collectionEfficiency * 10) / 10,
    outstandingDebt,
    paymentsToday,
    trend: Math.round(trend * 10) / 10,
  }
}

// Calculate trend based on time filter and current amount
const calculateTrend = (timeFilter: TimeFilter, currentAmount: number): number => {
  const baseAmounts: { [key in TimeFilter]: number } = {
    today: 45000,
    yesterday: 42000,
    thisWeek: 180000,
    lastWeek: 165000,
    thisMonth: 750000,
    lastMonth: 680000,
    thisYear: 8500000,
    allTime: 50000,
  }

  const baseAmount = baseAmounts[timeFilter]
  return baseAmount > 0 ? ((currentAmount - baseAmount) / baseAmount) * 100 : 0
}

// Generate default metrics (fallback)
const generateDefaultMetrics = (timeFilter: TimeFilter) => {
  const baseAmount =
    timeFilter === "today"
      ? 52675
      : timeFilter === "yesterday"
      ? 48000
      : timeFilter === "thisWeek"
      ? 185000
      : timeFilter === "lastWeek"
      ? 168000
      : timeFilter === "thisMonth"
      ? 750000
      : timeFilter === "lastMonth"
      ? 680000
      : timeFilter === "thisYear"
      ? 8500000
      : 52675

  return {
    todaysCollections: baseAmount,
    collectionEfficiency: 82.5,
    outstandingDebt: 447325,
    paymentsToday: 13,
    trend: 5.3,
  }
}

// Time filter tabs configuration
const timeFilterTabs: TimeFilterTab[] = [
  { key: "today", label: "Today", isActive: true },
  { key: "yesterday", label: "Yesterday", isActive: false },
  { key: "thisWeek", label: "This Week", isActive: false },
  { key: "lastWeek", label: "Last Week", isActive: false },
  { key: "thisMonth", label: "This Month", isActive: false },
  { key: "lastMonth", label: "Last Month", isActive: false },
  { key: "thisYear", label: "This Year", isActive: false },
  { key: "allTime", label: "All Time", isActive: false },
]

export default function BillingDashboard() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilter>("today")
  const [tabs, setTabs] = useState<TimeFilterTab[]>(timeFilterTabs)

  const dispatch = useAppDispatch()
  const { paymentSummaryData, paymentSummaryLoading, paymentSummaryError } = useAppSelector((state) => state.analytics)

  // Calculate metrics from API data or use defaults
  const metrics = paymentSummaryData
    ? calculateMetricsFromData(paymentSummaryData, activeTimeFilter)
    : generateDefaultMetrics(activeTimeFilter)

  const { todaysCollections, collectionEfficiency, outstandingDebt, paymentsToday, trend } = metrics

  // Generate payment channels from API data
  const paymentChannels = paymentSummaryData
    ? generatePaymentChannelsFromData(paymentSummaryData)
    : generateDefaultPaymentChannels()

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `₦${(amount / 1000000000).toFixed(2)}B`
    } else if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(0)}M`
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`
    }
    return `₦${amount.toLocaleString()}`
  }

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  // Handle time filter change
  const handleTimeFilterChange = (filterKey: TimeFilter) => {
    setActiveTimeFilter(filterKey)
    setTabs(
      tabs.map((tab) => ({
        ...tab,
        isActive: tab.key === filterKey,
      }))
    )

    // Create POST request body for the selected time filter
    const requestBody = {
      today: filterKey === "today",
      yesterday: filterKey === "yesterday",
      thisWeek: filterKey === "thisWeek",
      lastWeek: filterKey === "lastWeek",
      thisMonth: filterKey === "thisMonth",
      lastMonth: filterKey === "lastMonth",
      thisYear: filterKey === "thisYear",
      allTime: filterKey === "allTime",
    }

    dispatch(setPaymentSummaryAnalyticsParams(requestBody))
    dispatch(fetchPaymentSummaryAnalytics(requestBody))
  }

  // Fetch initial data
  useEffect(() => {
    const initialRequestBody = {
      today: true,
      yesterday: false,
      thisWeek: false,
      lastWeek: false,
      thisMonth: false,
      lastMonth: false,
      thisYear: false,
      allTime: false,
    }

    dispatch(setPaymentSummaryAnalyticsParams(initialRequestBody))
    dispatch(fetchPaymentSummaryAnalytics(initialRequestBody))
  }, [dispatch])

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh data after adding customer
    const requestBody = {
      today: activeTimeFilter === "today",
      yesterday: activeTimeFilter === "yesterday",
      thisWeek: activeTimeFilter === "thisWeek",
      lastWeek: activeTimeFilter === "lastWeek",
      thisMonth: activeTimeFilter === "thisMonth",
      lastMonth: activeTimeFilter === "lastMonth",
      thisYear: activeTimeFilter === "thisYear",
      allTime: activeTimeFilter === "allTime",
    }
    dispatch(fetchPaymentSummaryAnalytics(requestBody))
  }

  const handleRefreshData = () => {
    const requestBody = {
      today: activeTimeFilter === "today",
      yesterday: activeTimeFilter === "yesterday",
      thisWeek: activeTimeFilter === "thisWeek",
      lastWeek: activeTimeFilter === "lastWeek",
      thisMonth: activeTimeFilter === "thisMonth",
      lastMonth: activeTimeFilter === "lastMonth",
      thisYear: activeTimeFilter === "thisYear",
      allTime: activeTimeFilter === "allTime",
    }

    dispatch(fetchPaymentSummaryAnalytics(requestBody))
  }

  // Show loading state when API is loading
  const showLoading = paymentSummaryLoading

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            {/* Page Header - Always Visible */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Collections & Payments</h4>
                <p>Payment processing, reconciliation, and receivables management</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  className="mt-2"
                  icon={<PdfFileIcon />}
                  onClick={handleRefreshData}
                  disabled={showLoading}
                >
                  {showLoading ? "Refreshing..." : "Export Report"}
                </ButtonModule>
              </motion.div>
            </div>

            {/* Time Filter Tabs - styled like PaymentInfo TabNavigation */}
            <motion.div
              className="px-16 max-md:px-0 max-sm:px-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6 w-fit rounded-md bg-white p-2">
                <nav className="-mb-px flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleTimeFilterChange(tab.key)}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                        tab.isActive
                          ? "bg-[#0a0a0a] text-white"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                      } ${showLoading ? "cursor-not-allowed opacity-70" : ""}`}
                      disabled={showLoading}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                {showLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={true} />
                  </>
                ) : (
                  // Loaded State - Billing Dashboard
                  <>
                    <motion.div
                      className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex w-full max-sm:flex-col">
                        <div className="w-full">
                          <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
                            {/* Collections Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-green-600">
                                  <TokenGeneratedIcon />
                                </div>
                                <span className="font-medium">
                                  {activeTimeFilter === "today"
                                    ? "Today's"
                                    : activeTimeFilter === "yesterday"
                                    ? "Yesterday's"
                                    : activeTimeFilter.charAt(0).toUpperCase() + activeTimeFilter.slice(1)}{" "}
                                  Collections
                                </span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Amount:</p>
                                  <p className="text-secondary text-xl font-bold">
                                    {formatCurrency(todaysCollections)}
                                  </p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Trend:</p>
                                  <p className="text-secondary font-medium">
                                    <span className={trend >= 0 ? "text-green-500" : "text-red-500"}>
                                      {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
                                    </span>{" "}
                                    {activeTimeFilter === "today"
                                      ? "from yesterday"
                                      : activeTimeFilter === "yesterday"
                                      ? "from previous day"
                                      : activeTimeFilter === "thisWeek"
                                      ? "from last week"
                                      : activeTimeFilter === "lastWeek"
                                      ? "from previous week"
                                      : activeTimeFilter === "thisMonth"
                                      ? "from last month"
                                      : activeTimeFilter === "lastMonth"
                                      ? "from previous month"
                                      : "from previous period"}
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Collection Efficiency Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-blue-600">
                                  <MetersProgrammedIcon />
                                </div>
                                <span className="font-medium">Collection Efficiency</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Rate:</p>
                                  <p className="text-secondary text-xl font-bold">{collectionEfficiency}%</p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Status:</p>
                                  <div className="flex items-center gap-1">
                                    <div
                                      className={`size-2 rounded-full ${
                                        collectionEfficiency >= 85
                                          ? "bg-green-500"
                                          : collectionEfficiency >= 75
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                      }`}
                                    ></div>
                                    <p className="text-secondary font-medium">
                                      {collectionEfficiency >= 85
                                        ? "Excellent"
                                        : collectionEfficiency >= 75
                                        ? "Good"
                                        : "Needs Attention"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Outstanding Debt Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-orange-600">
                                  <VendingIcon />
                                </div>
                                <span className="font-medium">Outstanding Debt</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Total:</p>
                                  <p className="text-secondary text-xl font-bold">{formatCurrency(outstandingDebt)}</p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Aging:</p>
                                  <p className="text-secondary font-medium">
                                    <span className="text-orange-500">45% over 90 days</span>
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Payments Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-purple-600">
                                  <TamperIcon />
                                </div>
                                <span className="font-medium">
                                  {activeTimeFilter === "today"
                                    ? "Payments Today"
                                    : activeTimeFilter === "yesterday"
                                    ? "Payments Yesterday"
                                    : activeTimeFilter.charAt(0).toUpperCase() +
                                      activeTimeFilter.slice(1) +
                                      " Payments"}
                                </span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Transactions:</p>
                                  <div className="flex gap-1">
                                    <p className="text-secondary text-xl font-bold">{formatNumber(paymentsToday)}</p>
                                    <ArrowIcon />
                                  </div>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Avg. Value:</p>
                                  <p className="text-secondary font-medium">
                                    {formatCurrency(paymentsToday > 0 ? todaysCollections / paymentsToday : 0)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Payment Channels Performance Section */}
                    <motion.div
                      className="mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">
                          Payment Channels Performance ({tabs.find((t) => t.isActive)?.label})
                        </h3>
                        <p className="text-sm text-gray-600">Real-time performance across all payment channels</p>
                      </div>

                      {paymentChannels.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                          {paymentChannels.map((channel, index) => (
                            <motion.div
                              key={channel.name}
                              className="rounded-lg border bg-white p-4 shadow-sm"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`rounded-full p-2 ${(
                                      channel.bgColor ??
                                      channel.color ??
                                      "bg-blue-500"
                                    ).replace("bg-", "bg-")} bg-opacity-10`}
                                  >
                                    <div
                                      className={(channel.bgColor ?? channel.color ?? "bg-blue-500").replace(
                                        "bg-",
                                        "text-"
                                      )}
                                    >
                                      {channel.icon}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{channel.name}</h4>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`size-2 rounded-full ${
                                          channel.status === "active" ? "bg-green-500" : "bg-red-500"
                                        }`}
                                      ></div>
                                      <span className="text-sm capitalize text-gray-600">{channel.status}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 space-y-3">
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(channel.amount)}</p>
                                  <p className="text-sm text-gray-600">
                                    {formatNumber(channel.transactions)} transactions
                                  </p>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Share of total</span>
                                    <span className="font-semibold text-gray-900">{channel.share.toFixed(1)}%</span>
                                  </div>
                                  <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                                    <div
                                      className={`h-2 rounded-full ${channel.color}`}
                                      style={{ width: `${channel.share}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                          <p className="text-gray-500">No payment channel data available</p>
                        </div>
                      )}
                    </motion.div>

                    {/* Error Message */}
                    {paymentSummaryError && (
                      <motion.div
                        className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex items-center gap-2">
                          <AlertIcon />
                          <p className="text-red-700">Error loading payment data: {paymentSummaryError}</p>
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-6"
                    >
                      <PaymentInfo />
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
