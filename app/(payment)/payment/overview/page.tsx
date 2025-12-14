"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  AlertIcon,
  BankIcon,
  BillingIcon,
  MetersProgrammedIcon,
  MobileMoneyIcon,
  PdfFileIcon,
  PlayIcon,
  PosIcon,
  PostpaidIcon,
  RefreshCircleIcon,
  TamperIcon,
  TokenGeneratedIcon,
  VendingIcon,
} from "components/Icons/Icons"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import StartBillingRun from "components/ui/Modal/start-billing-run"
import { ButtonModule } from "components/ui/Button/Button"
import PaymentInfo from "components/PaymentInfo/PaymentInfo"
import BillingInfo from "components/BillingInfo/BillingInfo"
import {
  clearPostpaidBillingAnalytics,
  fetchPaymentSummaryAnalytics,
  fetchPostpaidBillingAnalytics,
  setPaymentSummaryAnalyticsParams,
  setPostpaidBillingAnalyticsParams,
} from "lib/redux/analyticsSlice"
import type { PostpaidBillingAnalyticsParams } from "lib/redux/analyticsSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
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

// Enhanced Skeleton for Payment Analytics Cards
const PaymentAnalyticsSkeleton = () => {
  return (
    <div className="hidden w-full rounded-md border bg-white p-4 lg:block lg:w-80">
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
    <div className="flex-1 rounded-md border bg-white p-4 sm:p-5">
      {/* Header Skeleton */}
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <div className="h-10 w-full rounded bg-gray-200 sm:w-64"></div>
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-20 rounded bg-gray-200 sm:w-24"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gray-200 sm:size-12"></div>
                <div>
                  <div className="h-5 w-32 rounded bg-gray-200"></div>
                  <div className="mt-1 flex flex-wrap gap-2">
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

// Main Loading Component
const LoadingState = ({ showAnalytics = true }) => {
  return (
    <div className="mt-5 flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <TableSkeleton />
      </div>
      {showAnalytics && <PaymentAnalyticsSkeleton />}
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

  const currentWindow = paymentData.windows[0]
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

  const trend = calculateTrend(timeFilter, todaysCollections)

  const collectionEfficiency = Math.min(95, Math.max(70, (currentWindow.amount / 100000) * 100))

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

// Postpaid Billing Analytics Summary Cards Component
const PostpaidBillingAnalyticsCards = ({ analyticsData }: { analyticsData: any }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const calculatePercentage = (part: number, total: number) => {
    return total > 0 ? Math.round((part / total) * 100) : 0
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Bills Card */}
        <motion.div
          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 hover:shadow-md md:border"
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center gap-2 border-b pb-4">
            <BillingIcon />
            <span className="text-sm font-medium sm:text-base">Total Bills</span>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex w-full justify-between">
              <p className="text-grey-200 text-sm">All Bills:</p>
              <p className="text-secondary text-lg font-bold sm:text-xl">{formatNumber(analyticsData.totalBills)}</p>
            </div>
            <div className="flex w-full justify-between">
              <p className="text-grey-200 text-sm">Finalized:</p>
              <p className="text-secondary text-sm font-medium sm:text-base">
                {formatNumber(analyticsData.finalizedBills)} (
                {calculatePercentage(analyticsData.finalizedBills, analyticsData.totalBills)}%)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Revenue Summary Card */}
        <motion.div
          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 hover:shadow-md md:border"
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center gap-2 border-b pb-4">
            <span className="text-sm font-medium sm:text-base">Revenue Summary</span>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex w-full justify-between">
              <p className="text-grey-200 text-sm">Current Bill:</p>
              <p className="text-secondary text-lg font-bold sm:text-xl">
                {formatCurrency(analyticsData.totalCurrentBillAmount)}
              </p>
            </div>
            <div className="flex w-full justify-between">
              <p className="text-grey-200 text-sm">Total Due:</p>
              <p className="text-secondary text-sm font-medium sm:text-base">
                {formatCurrency(analyticsData.totalAmountDue)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Consumption Card */}
        <motion.div
          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 hover:shadow-md md:border"
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center gap-2 border-b pb-4">
            <PostpaidIcon />
            <span className="text-sm font-medium sm:text-base">Consumption</span>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex w-full justify-between">
              <p className="text-grey-200 text-sm">Total kWh:</p>
              <p className="text-secondary text-lg font-bold sm:text-xl">
                {formatNumber(analyticsData.totalConsumptionKwh)}
              </p>
            </div>
            <div className="flex w-full justify-between">
              <p className="text-grey-200 text-sm">Forecast:</p>
              <p className="text-secondary text-sm font-medium sm:text-base">
                {formatNumber(analyticsData.forecastConsumptionKwh)} kWh
              </p>
            </div>
          </div>
        </motion.div>

        {/* Disputes & Adjustments Card */}
        <motion.div
          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 hover:shadow-md md:border"
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center gap-2 border-b pb-4">
            <span className="text-sm font-medium sm:text-base">Disputes & Adjustments</span>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex w-full justify-between">
              <p className="text-grey-200 text-sm">Active Disputes:</p>
              <div className="flex items-center gap-1">
                <p className="text-secondary text-sm font-medium sm:text-base">
                  {formatNumber(analyticsData.activeDisputes)}
                </p>
                <ArrowIcon className="size-4" />
              </div>
            </div>
            <div className="flex w-full justify-between">
              <p className="text-grey-200 text-sm">Adjustments:</p>
              <p className="text-secondary text-sm font-medium sm:text-base">
                {formatCurrency(analyticsData.totalAdjustmentsApplied)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Period Selector Component
const PeriodSelector = ({
  currentPeriod,
  onPeriodChange,
}: {
  currentPeriod?: string
  onPeriodChange: (period: string) => void
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0")
  const currentPeriodValue = `${currentYear}-${currentMonth}`

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const periods = monthLabels.map((label, index) => {
    const monthNumber = String(index + 1).padStart(2, "0")
    return {
      value: `${currentYear}-${monthNumber}`,
      label: `${label} ${currentYear}`,
    }
  })

  const selectedValue = currentPeriod ?? currentPeriodValue

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="period-select" className="hidden text-sm font-medium text-gray-700 sm:block">
        Billing Period:
      </label>
      <div className="relative">
        <button
          id="period-select"
          type="button"
          className="flex min-w-[140px] items-center justify-between gap-2 rounded-md border border-[#004B23] bg-transparent px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23] sm:min-w-[160px]"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
          <span className="truncate">{periods.find((p) => p.value === selectedValue)?.label ?? selectedValue}</span>
          <svg
            className="size-4 shrink-0 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
            <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
              <div className="max-h-60 overflow-y-auto">
                {periods.map((period) => (
                  <button
                    key={period.value}
                    type="button"
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      period.value === selectedValue ? "bg-gray-100 font-medium" : ""
                    }`}
                    onClick={() => {
                      onPeriodChange(period.value)
                      setIsDropdownOpen(false)
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function BillingDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isStartBillingRunModalOpen, setIsStartBillingRunModalOpen] = useState(false)
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilter>("today")
  const [tabs, setTabs] = useState<TimeFilterTab[]>(timeFilterTabs)
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  })
  const [activeTab, setActiveTab] = useState<"collections" | "billing">("collections")
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false)

  const dispatch = useAppDispatch()
  const {
    paymentSummaryData,
    paymentSummaryLoading,
    paymentSummaryError,
    postpaidBillingAnalyticsData,
    postpaidBillingAnalyticsLoading,
    postpaidBillingAnalyticsError,
    postpaidBillingAnalyticsParams,
  } = useAppSelector((state) => state.analytics)

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

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
  }

  // Fetch initial data
  useEffect(() => {
    // Fetch payment summary data
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

    // Fetch postpaid billing analytics
    const params: PostpaidBillingAnalyticsParams = {
      period: selectedPeriod,
      status: 1,
      category: 2,
    }
    dispatch(setPostpaidBillingAnalyticsParams(params))
    dispatch(fetchPostpaidBillingAnalytics(params))
  }, [dispatch, selectedPeriod])

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
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
    setIsLoading(true)

    if (activeTab === "collections") {
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
    } else {
      const params: PostpaidBillingAnalyticsParams = {
        period: selectedPeriod,
        status: 1,
        category: 2,
      }
      dispatch(clearPostpaidBillingAnalytics())
      dispatch(fetchPostpaidBillingAnalytics(params))
    }

    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleStartBillingRun = () => {
    setIsStartBillingRunModalOpen(true)
  }

  const handleBillingRunSuccess = () => {
    setIsStartBillingRunModalOpen(false)
    handleRefreshData()
  }

  // Show loading state when API is loading
  const showLoading = paymentSummaryLoading || postpaidBillingAnalyticsLoading || isLoading

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col px-3 2xl:container sm:px-3 xl:px-16 ">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col items-start justify-between gap-4 py-4 sm:py-6 md:gap-6 md:py-8 xl:flex-row xl:items-start">
              <div className="flex-1">
                <h4 className="text-lg font-semibold sm:text-xl md:text-2xl">Billing & Collections</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  Payment processing, reconciliation, and billing management
                </p>
              </div>

              <motion.div
                className="flex flex-wrap items-center gap-3 xl:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start">
                  {activeTab === "billing" && (
                    <PeriodSelector currentPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />
                  )}
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
                  {activeTab === "collections" ? (
                    <ButtonModule
                      variant="primary"
                      size="md"
                      className="flex sm:flex-none"
                      icon={<PdfFileIcon />}
                      onClick={handleRefreshData}
                      disabled={showLoading}
                    >
                      {showLoading ? (
                        "Refreshing..."
                      ) : (
                        <>
                          <span className="hidden sm:inline">Export Report</span>
                          <span className="sm:hidden">Export</span>
                        </>
                      )}
                    </ButtonModule>
                  ) : (
                    <>
                      <ButtonModule
                        variant="outline"
                        size="md"
                        className="flex sm:flex-none"
                        icon={<PlayIcon />}
                        onClick={handleStartBillingRun}
                        disabled={postpaidBillingAnalyticsLoading}
                      >
                        <span className="hidden sm:inline">Publish Billing Run</span>
                        <span className="sm:hidden">Publish</span>
                      </ButtonModule>
                      <ButtonModule
                        variant="primary"
                        size="md"
                        className="flex sm:flex-none"
                        onClick={handleRefreshData}
                        icon={<RefreshCircleIcon />}
                        iconPosition="start"
                        disabled={postpaidBillingAnalyticsLoading || isLoading}
                      >
                        {postpaidBillingAnalyticsLoading || isLoading ? (
                          "Refreshing..."
                        ) : (
                          <>
                            <span className="hidden sm:inline">Refresh Data</span>
                            <span className="sm:hidden">Refresh</span>
                          </>
                        )}
                      </ButtonModule>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Tab Navigation */}

            {/* Time Filter Tabs (Collections only) */}
            {activeTab === "collections" && (
              <motion.div
                className="mb-4 w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {(() => {
                  if (!tabs.length) return null

                  const activeFilter = tabs.find((tab) => tab.isActive) || tabs[0]
                  if (!activeFilter) return null

                  return (
                    <>
                      {/* Mobile: Dropdown */}
                      <div className="w-full sm:hidden">
                        <div className="relative inline-block w-full max-w-xs">
                          <button
                            type="button"
                            onClick={() => setIsTimeFilterOpen((prev) => !prev)}
                            className="flex w-full items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004B23]"
                          >
                            <span className="truncate">{activeFilter.label}</span>
                            <svg
                              className="size-4 shrink-0 text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          {isTimeFilterOpen && (
                            <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-md bg-white p-1 shadow-lg ring-1 ring-black/5">
                              <nav className="flex flex-col gap-1">
                                {tabs.map((tab) => (
                                  <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => {
                                      handleTimeFilterChange(tab.key)
                                      setIsTimeFilterOpen(false)
                                    }}
                                    className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                                      tab.isActive
                                        ? "bg-[#004B23] text-white shadow-sm"
                                        : "bg-transparent text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <span className="truncate">{tab.label}</span>
                                  </button>
                                ))}
                              </nav>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Desktop: Horizontal tabs */}
                      <div className="hidden sm:block">
                        <div className="w-fit rounded-md bg-white p-2">
                          <nav className="-mb-px flex flex-wrap gap-2">
                            {tabs.map((tab) => (
                              <button
                                key={tab.key}
                                onClick={() => handleTimeFilterChange(tab.key)}
                                className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 ease-in-out sm:text-sm ${
                                  tab.isActive
                                    ? "bg-[#004B23] text-white shadow-sm"
                                    : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </nav>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </motion.div>
            )}

            {paymentSummaryError && activeTab === "collections" && (
              <motion.div
                className="mb-4 rounded-md bg-red-50 p-4 text-red-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm">Error loading payment data: {paymentSummaryError}</p>
              </motion.div>
            )}

            {postpaidBillingAnalyticsError && activeTab === "billing" && (
              <motion.div
                className="mb-4 rounded-md bg-red-50 p-4 text-red-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm">Error loading billing analytics: {postpaidBillingAnalyticsError}</p>
              </motion.div>
            )}

            {/* Main Content Area */}
            <div className="w-full">
              {showLoading ? (
                // Loading State
                <>
                  <SkeletonLoader />
                  <LoadingState showAnalytics={true} />
                </>
              ) : (
                // Loaded State
                <>
                  {activeTab === "collections" ? (
                    // Collections & Payments Tab
                    <>
                      <motion.div
                        className="w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {/* Collections Card */}
                          <motion.div
                            className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 hover:shadow-md md:border"
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          >
                            <div className="flex items-center gap-2 border-b pb-4">
                              <div className="text-green-600">
                                <TokenGeneratedIcon />
                              </div>
                              <span className="text-sm font-medium sm:text-base">
                                {activeTimeFilter === "today"
                                  ? "Today's"
                                  : activeTimeFilter === "yesterday"
                                  ? "Yesterday's"
                                  : activeTimeFilter.charAt(0).toUpperCase() + activeTimeFilter.slice(1)}{" "}
                                Collections
                              </span>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                              <div className="flex w-full justify-between">
                                <p className="text-grey-200 text-sm">Amount:</p>
                                <p className="text-secondary text-lg font-bold sm:text-xl">
                                  {formatCurrency(todaysCollections)}
                                </p>
                              </div>
                              <div className="flex w-full justify-between">
                                <p className="text-grey-200 text-sm">Trend:</p>
                                <p className="text-secondary text-sm font-medium sm:text-base">
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
                            className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 hover:shadow-md md:border"
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          >
                            <div className="flex items-center gap-2 border-b pb-4">
                              <div className="text-blue-600">
                                <MetersProgrammedIcon />
                              </div>
                              <span className="text-sm font-medium sm:text-base">Collection Efficiency</span>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                              <div className="flex w-full justify-between">
                                <p className="text-grey-200 text-sm">Rate:</p>
                                <p className="text-secondary text-lg font-bold sm:text-xl">{collectionEfficiency}%</p>
                              </div>
                              <div className="flex w-full justify-between">
                                <p className="text-grey-200 text-sm">Status:</p>
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
                                  <p className="text-secondary text-sm font-medium sm:text-base">
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
                            className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 hover:shadow-md md:border"
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          >
                            <div className="flex items-center gap-2 border-b pb-4">
                              <div className="text-orange-600">
                                <VendingIcon />
                              </div>
                              <span className="text-sm font-medium sm:text-base">Outstanding Debt</span>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                              <div className="flex w-full justify-between">
                                <p className="text-grey-200 text-sm">Total:</p>
                                <p className="text-secondary text-lg font-bold sm:text-xl">
                                  {formatCurrency(outstandingDebt)}
                                </p>
                              </div>
                              <div className="flex w-full justify-between">
                                <p className="text-grey-200 text-sm">Aging:</p>
                                <p className="text-secondary text-sm font-medium sm:text-base">
                                  <span className="text-orange-500">45% over 90 days</span>
                                </p>
                              </div>
                            </div>
                          </motion.div>

                          {/* Payments Card */}
                          <motion.div
                            className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 hover:shadow-md md:border"
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          >
                            <div className="flex items-center gap-2 border-b pb-4">
                              <div className="text-purple-600">
                                <TamperIcon />
                              </div>
                              <span className="text-sm font-medium sm:text-base">
                                {activeTimeFilter === "today"
                                  ? "Payments Today"
                                  : activeTimeFilter === "yesterday"
                                  ? "Payments Yesterday"
                                  : activeTimeFilter.charAt(0).toUpperCase() + activeTimeFilter.slice(1) + " Payments"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                              <div className="flex w-full justify-between">
                                <p className="text-grey-200 text-sm">Transactions:</p>
                                <div className="flex gap-1">
                                  <p className="text-secondary text-lg font-bold sm:text-xl">
                                    {formatNumber(paymentsToday)}
                                  </p>
                                  <ArrowIcon />
                                </div>
                              </div>
                              <div className="flex w-full justify-between">
                                <p className="text-grey-200 text-sm">Avg. Value:</p>
                                <p className="text-secondary text-sm font-medium sm:text-base">
                                  {formatCurrency(paymentsToday > 0 ? todaysCollections / paymentsToday : 0)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
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
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center sm:p-8">
                            <p className="text-gray-500">No payment channel data available</p>
                          </div>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-6"
                      >
                        <PaymentInfo />
                      </motion.div>
                    </>
                  ) : (
                    // Billing Engine Tab
                    <></>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <InstallMeterModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />
      <StartBillingRun
        isOpen={isStartBillingRunModalOpen}
        onRequestClose={() => setIsStartBillingRunModalOpen(false)}
        onSuccess={handleBillingRunSuccess}
      />
    </section>
  )
}
