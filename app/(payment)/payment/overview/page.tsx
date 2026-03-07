"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Filter,
  Loader2,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react"
import {
  MdAccountBalance,
  MdAttachMoney,
  MdCalendarToday,
  MdCheck,
  MdClose,
  MdCode,
  MdDevices,
  MdFilterList,
  MdPerson,
  MdReceipt,
  MdStore,
  MdSwapHoriz,
} from "react-icons/md"
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

// ==================== Dropdown Popover Component ====================
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

// ==================== Modern Analytics Card ====================
const AnalyticsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
  trendValue,
  isLoading = false,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color?: "blue" | "green" | "purple" | "amber" | "emerald" | "red"
  trend?: "up" | "down"
  trendValue?: string
  isLoading?: boolean
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

  if (isLoading) {
    return (
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

// ==================== Payment Channel Card ====================
const PaymentChannelCard = ({
  channel,
  amount,
  transactions,
  share,
  status,
  icon,
  color = "blue",
  index,
}: {
  channel: string
  amount: number
  transactions: number
  share: number
  status: string
  icon: React.ReactNode
  color?: "blue" | "purple" | "amber" | "emerald" | "pink" | "orange"
  index: number
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      gradient: "from-blue-500 to-blue-600",
      light: "bg-blue-100",
      dark: "text-blue-600",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      gradient: "from-purple-500 to-purple-600",
      light: "bg-purple-100",
      dark: "text-purple-600",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      gradient: "from-amber-500 to-amber-600",
      light: "bg-amber-100",
      dark: "text-amber-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      gradient: "from-emerald-500 to-emerald-600",
      light: "bg-emerald-100",
      dark: "text-emerald-600",
    },
    pink: {
      bg: "bg-pink-50",
      text: "text-pink-700",
      gradient: "from-pink-500 to-pink-600",
      light: "bg-pink-100",
      dark: "text-pink-600",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      gradient: "from-orange-500 to-orange-600",
      light: "bg-orange-100",
      dark: "text-orange-600",
    },
  }

  const colors = colorClasses[color]
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `₦${(amount / 1000000000).toFixed(2)}B`
    } else if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`
    }
    return `₦${amount.toLocaleString()}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`rounded-lg p-2 ${colors.bg}`}>
            <div className={colors.dark}>{icon}</div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{channel}</h3>
            <div className="flex items-center gap-1.5">
              <div className={`size-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
              <span className="text-xs capitalize text-gray-500">{status}</span>
            </div>
          </div>
        </div>
        <span className={`text-sm font-semibold ${colors.text}`}>{transactions.toLocaleString()}</span>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Share of total</span>
          <span className="font-medium text-gray-900">{share.toFixed(1)}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${share}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
            className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
          />
        </div>
      </div>

      {/* Amount Breakdown */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Amount</span>
          <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Avg. per transaction</span>
          <span className="text-gray-700">{formatCurrency(amount / (transactions || 1))}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== Period Selector ====================
const PeriodSelector = ({
  currentPeriod,
  onPeriodChange,
}: {
  currentPeriod?: string
  onPeriodChange: (period: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

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
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Calendar className="size-3.5" />
        <span>{periods.find((p) => p.value === selectedValue)?.label ?? selectedValue}</span>
        <ChevronDown className={`size-3.5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 z-20 mt-1 max-h-60 w-40 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
            >
              {periods.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => {
                    onPeriodChange(period.value)
                    setIsOpen(false)
                  }}
                  className={`block w-full px-3 py-2 text-left text-xs transition-colors ${
                    period.value === selectedValue
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== Time Filter Tabs ====================
const TimeFilterTabs = ({
  tabs,
  activeFilter,
  onFilterChange,
}: {
  tabs: Array<{ key: string; label: string }>
  activeFilter: string
  onFilterChange: (key: string) => void
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const activeTab = tabs.find((t) => t.key === activeFilter) || tabs[0]

  return (
    <div className="w-full">
      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span>{activeTab?.label || "Select Filter"}</span>
            <ChevronDown className={`size-4 text-gray-500 transition-transform ${isMobileOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isMobileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMobileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        onFilterChange(tab.key)
                        setIsMobileOpen(false)
                      }}
                      className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                        tab.key === activeFilter
                          ? "bg-[#004B23] font-medium text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <div className="flex space-x-1 rounded-lg border border-gray-200 bg-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab.key === activeFilter
                  ? "bg-[#004B23] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== Loading State ====================
const LoadingState = () => {
  return (
    <div className="w-full space-y-6">
      {/* Analytics Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <AnalyticsCard key={i} title="" value="" icon={MdAttachMoney} isLoading={true} />
        ))}
      </div>

      {/* Payment Channels Skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-48 rounded bg-gray-200"></div>
          <div className="h-6 w-24 rounded-full bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-gray-100"></div>
          ))}
        </div>
      </div>

      {/* Payment Info Skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 rounded bg-gray-200"></div>
          <div className="h-8 w-48 rounded bg-gray-200"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full rounded bg-gray-100"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== Main Component ====================
export default function BillingDashboard() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isStartBillingRunModalOpen, setIsStartBillingRunModalOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // Default 8 minutes
  const [activeTimeFilter, setActiveTimeFilter] = useState<string>("today")
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  })
  const [activeTab, setActiveTab] = useState<"collections" | "billing">("collections")

  const dispatch = useAppDispatch()
  const {
    paymentSummaryData,
    paymentSummaryLoading,
    paymentSummaryError,
    postpaidBillingAnalyticsData,
    postpaidBillingAnalyticsLoading,
    postpaidBillingAnalyticsError,
  } = useAppSelector((state) => state.analytics)

  // Time filter tabs
  const timeFilterTabs = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "thisWeek", label: "This Week" },
    { key: "lastWeek", label: "Last Week" },
    { key: "thisMonth", label: "This Month" },
    { key: "lastMonth", label: "Last Month" },
    { key: "thisYear", label: "This Year" },
    { key: "allTime", label: "All Time" },
  ]

  // Polling options
  const pollingOptions = [
    { value: 480000, label: "8m" },
    { value: 600000, label: "10m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  // Calculate metrics from payment data
  const calculateMetrics = () => {
    if (!paymentSummaryData?.windows || paymentSummaryData.windows.length === 0) {
      return {
        todaysCollections: 0,
        collectionEfficiency: 0,
        outstandingDebt: 0,
        paymentsToday: 0,
        trend: 0,
        channels: [],
      }
    }

    const currentWindow = paymentSummaryData.windows[0]
    if (!currentWindow) {
      return {
        todaysCollections: 0,
        collectionEfficiency: 0,
        outstandingDebt: 0,
        paymentsToday: 0,
        trend: 0,
        channels: [],
      }
    }
    const totalAmount = currentWindow.amount
    const totalTransactions = currentWindow.count

    // Calculate trend (mock - replace with actual trend calculation)
    const trend = activeTimeFilter === "today" ? 12.5 : activeTimeFilter === "yesterday" ? -3.2 : 8.7

    // Calculate collection efficiency (mock)
    const collectionEfficiency = Math.min(98, Math.max(65, Math.round((totalAmount / 2000000) * 100)))

    // Calculate outstanding debt (mock)
    const outstandingDebt = Math.max(0, 5000000 - totalAmount)

    // Generate payment channels
    const channels = currentWindow.byChannel.map((channel: any, index: number) => {
      const colors = ["blue", "purple", "amber", "emerald", "pink", "orange"]
      const icons: { [key: string]: React.ReactNode } = {
        Cash: <TokenGeneratedIcon />,
        BankTransfer: <BankIcon />,
        MobileMoney: <MobileMoneyIcon />,
        POS: <PosIcon />,
        Card: <AlertIcon />,
      }

      return {
        name: channel.key,
        amount: channel.amount,
        transactions: channel.count,
        share: totalAmount > 0 ? (channel.amount / totalAmount) * 100 : 0,
        status: "active",
        icon: icons[channel.key] || <AlertIcon />,
        color: colors[index % colors.length] as any,
      }
    })

    return {
      todaysCollections: totalAmount,
      collectionEfficiency,
      outstandingDebt,
      paymentsToday: totalTransactions,
      trend,
      channels,
    }
  }

  const metrics = calculateMetrics()
  const { todaysCollections, collectionEfficiency, outstandingDebt, paymentsToday, trend, channels } = metrics

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `₦${(amount / 1000000000).toFixed(2)}B`
    } else if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`
    }
    return `₦${amount.toLocaleString()}`
  }

  // Handle time filter change
  const handleTimeFilterChange = (filterKey: string) => {
    setActiveTimeFilter(filterKey)

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

  // Handle period change for billing
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    const params: PostpaidBillingAnalyticsParams = {
      BillingPeriodId: parseInt(period.replace("-", ""), 10),
      Status: 1,
      Category: 2,
    }
    dispatch(setPostpaidBillingAnalyticsParams(params))
    dispatch(fetchPostpaidBillingAnalytics(params))
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
      BillingPeriodId: parseInt(selectedPeriod.replace("-", ""), 10),
      Status: 1,
      Category: 2,
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

  const handleRefreshData = useCallback(() => {
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
        BillingPeriodId: parseInt(selectedPeriod.replace("-", ""), 10),
        Status: 1,
        Category: 2,
      }
      dispatch(clearPostpaidBillingAnalytics())
      dispatch(fetchPostpaidBillingAnalytics(params))
    }
  }, [dispatch, activeTab, activeTimeFilter, selectedPeriod])

  const handleStartBillingRun = () => {
    setIsStartBillingRunModalOpen(true)
  }

  const handleBillingRunSuccess = () => {
    setIsStartBillingRunModalOpen(false)
    handleRefreshData()
  }

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  // Short polling effect
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      handleRefreshData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [dispatch, isPolling, pollingInterval, handleRefreshData])

  const isLoading = paymentSummaryLoading || postpaidBillingAnalyticsLoading

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
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Billing & Collections</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Payment processing, reconciliation, and billing management
                  </p>
                </div>

                {/* Header Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Billing Period Selector */}
                  {activeTab === "billing" && (
                    <PeriodSelector currentPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />
                  )}

                  {/* Action Buttons */}
                  {activeTab === "billing" && (
                    <ButtonModule
                      variant="primary"
                      size="sm"
                      onClick={handleStartBillingRun}
                      disabled={postpaidBillingAnalyticsLoading}
                      className="bg-[#004B23] text-white hover:bg-[#003618]"
                    >
                      <PlayIcon />
                      Publish Run
                    </ButtonModule>
                  )}

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
                        onSelect={setPollingInterval}
                      >
                        {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                      </DropdownPopover>
                    )}
                  </div>

                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshData}
                    disabled={isLoading}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Time Filter Tabs (Collections only) */}
            {activeTab === "collections" && (
              <div className="mb-6">
                <TimeFilterTabs
                  tabs={timeFilterTabs}
                  activeFilter={activeTimeFilter}
                  onFilterChange={handleTimeFilterChange}
                />
              </div>
            )}

            {/* Error Messages */}
            <AnimatePresence>
              {paymentSummaryError && activeTab === "collections" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Failed to load payment data</p>
                      <p className="text-sm text-red-700">{paymentSummaryError}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {postpaidBillingAnalyticsError && activeTab === "billing" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Failed to load billing analytics</p>
                      <p className="text-sm text-red-700">{postpaidBillingAnalyticsError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            {isLoading ? (
              <LoadingState />
            ) : (
              <div className="space-y-6">
                {activeTab === "collections" ? (
                  <>
                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <AnalyticsCard
                        title="Today's Collections"
                        value={formatCurrency(todaysCollections)}
                        subtitle="Total amount collected"
                        icon={MdAttachMoney}
                        color="green"
                        trend={trend >= 0 ? "up" : "down"}
                        trendValue={`${Math.abs(trend)}%`}
                      />
                      <AnalyticsCard
                        title="Collection Efficiency"
                        value={`${collectionEfficiency}%`}
                        subtitle="Target: 95%"
                        icon={MdAccountBalance}
                        color={collectionEfficiency >= 85 ? "emerald" : collectionEfficiency >= 70 ? "amber" : "red"}
                      />
                      <AnalyticsCard
                        title="Outstanding Debt"
                        value={formatCurrency(outstandingDebt)}
                        subtitle="Aging: 45% over 90 days"
                        icon={MdReceipt}
                        color="amber"
                      />
                      <AnalyticsCard
                        title="Payments Today"
                        value={paymentsToday.toLocaleString()}
                        subtitle={`Avg: ${formatCurrency(todaysCollections / (paymentsToday || 1))}`}
                        icon={MdSwapHoriz}
                        color="purple"
                      />
                    </div>

                    {/* Payment Channels Performance */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-gray-200 bg-white p-5"
                    >
                      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-blue-100 p-2">
                            <PieChart className="size-5 text-blue-700" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">Payment Channels Performance</h2>
                            <p className="text-sm text-gray-600">Real-time performance across all payment channels</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {channels.length} active channels
                        </span>
                      </div>

                      {channels.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {channels.map((channel: any, index: number) => (
                            <PaymentChannelCard
                              key={channel.name}
                              channel={channel.name}
                              amount={channel.amount}
                              transactions={channel.transactions}
                              share={channel.share}
                              status={channel.status}
                              icon={channel.icon}
                              color={channel.color}
                              index={index}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
                          <p className="text-sm text-gray-500">No payment channel data available</p>
                        </div>
                      )}
                    </motion.div>

                    {/* Payment Info Table */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >
                      <PaymentInfo />
                    </motion.div>
                  </>
                ) : (
                  // Billing Engine Tab
                  <>
                    {/* Postpaid Billing Analytics Cards */}
                    {postpaidBillingAnalyticsData && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AnalyticsCard
                          title="Total Bills"
                          value={postpaidBillingAnalyticsData.totalBills?.toLocaleString() || 0}
                          subtitle={`Finalized: ${postpaidBillingAnalyticsData.finalizedBills?.toLocaleString() || 0}`}
                          icon={MdReceipt}
                          color="blue"
                        />
                        <AnalyticsCard
                          title="Current Bill Amount"
                          value={formatCurrency(postpaidBillingAnalyticsData.totalCurrentBillAmount || 0)}
                          subtitle="Total due this period"
                          icon={MdAttachMoney}
                          color="green"
                        />
                        <AnalyticsCard
                          title="Total Consumption"
                          value={`${(postpaidBillingAnalyticsData.totalConsumptionKwh || 0).toLocaleString()} kWh`}
                          subtitle={`Forecast: ${(
                            postpaidBillingAnalyticsData.forecastConsumptionKwh || 0
                          ).toLocaleString()} kWh`}
                          icon={MdAccountBalance}
                          color="purple"
                        />
                        <AnalyticsCard
                          title="Active Disputes"
                          value={postpaidBillingAnalyticsData.activeDisputes?.toLocaleString() || 0}
                          subtitle={`Adjustments: ${formatCurrency(
                            postpaidBillingAnalyticsData.totalAdjustmentsApplied || 0
                          )}`}
                          icon={MdSwapHoriz}
                          color="amber"
                        />
                      </div>
                    )}

                    {/* Billing Info Component */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <BillingInfo />
                    </motion.div>
                  </>
                )}
              </div>
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
      <StartBillingRun
        isOpen={isStartBillingRunModalOpen}
        onRequestClose={() => setIsStartBillingRunModalOpen(false)}
        onSuccess={handleBillingRunSuccess}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl bg-white p-6 shadow-xl"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="size-12 animate-spin rounded-full border-4 border-[#004B23] border-t-transparent" />
                <div className="text-center">
                  <p className="font-medium text-gray-900">Loading Billing Data</p>
                  <p className="text-sm text-gray-600">Please wait</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
