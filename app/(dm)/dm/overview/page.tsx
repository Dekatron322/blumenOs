"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  clearAllDebtEntriesState,
  clearCustomersState,
  clearRecoverySummaryState,
  fetchAllDebtEntries,
  fetchDebtManagementCustomers,
  fetchRecoverySummary,
  selectAllDebtEntries,
  selectAllDebtEntriesError,
  selectAllDebtEntriesLoading,
  selectAllDebtEntriesPagination,
  selectAllDebtEntriesSuccess,
  selectCustomers,
  selectCustomersError,
  selectCustomersLoading,
  selectCustomersPagination,
  selectCustomersSuccess,
  selectRecoverySummary,
  selectRecoverySummaryError,
  selectRecoverySummaryLoading,
  selectRecoverySummarySuccess,
} from "lib/redux/debtManagementSlice"
import type {
  AllDebtEntriesRequest,
  DebtEntryData,
  DebtManagementCustomersRequest,
  RecoverySummaryItem,
  RecoverySummaryRequest,
} from "lib/redux/debtManagementSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { ButtonModule } from "components/ui/Button/Button"
import { VscAdd } from "react-icons/vsc"
import RecordDebtModal from "components/ui/Modal/record-debt-modal"
import ViewDebtEntryModal from "components/ui/Modal/view-debt-entry-modal"
import DebtManagementInfo from "components/DebtManagementInfo/DebtManagementInfo"
import DashboardNav from "components/Navbar/DashboardNav"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Banknote,
  Calendar,
  CreditCard,
  DollarSign,
  Home,
  Loader2,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react"

// Dropdown Popover Component (redesigned)
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

// Modern Recovery Summary Section Component
const RecoverySummarySection = ({
  recoverySummary,
  recoverySummaryLoading,
  recoverySummaryError,
  customers,
}: {
  recoverySummary: RecoverySummaryItem[]
  recoverySummaryLoading: boolean
  recoverySummaryError: string | null
  customers: any[]
}) => {
  // Calculate totals from recovery summary
  const totalRecoveredAmount = recoverySummary.reduce((sum, item) => sum + item.totalRecoveredAmount, 0)
  const totalRecoveries = recoverySummary.reduce((sum, item) => sum + item.totalRecoveries, 0)
  const averageRecovery = totalRecoveries > 0 ? totalRecoveredAmount / totalRecoveries : 0

  // Calculate total outstanding from customers data
  const totalOutstanding = customers.reduce((sum, customer) => sum + (customer.outstandingBalance || 0), 0)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
  }

  const formatNumber = (num: number) => num?.toLocaleString() || "0"

  const calculatePercentage = (part: number, total: number) => {
    return total > 0 ? Math.round((part / total) * 100) : 0
  }

  const recoveryCategories = [
    {
      name: "Total Outstanding",
      value: totalOutstanding,
      formatted: formatCurrency(totalOutstanding),
      percentage: 100,
      color: "amber",
      icon: DollarSign,
      description: "Total outstanding debt",
      trend: "+5.2%",
      trendUp: true,
    },
    {
      name: "Total Recovered",
      value: totalRecoveredAmount,
      formatted: formatCurrency(totalRecoveredAmount),
      percentage: 100,
      color: "emerald",
      icon: Banknote,
      description: "Total amount recovered",
      trend: "+8.3%",
      trendUp: true,
    },
    {
      name: "Recovery Count",
      value: totalRecoveries,
      formatted: formatNumber(totalRecoveries),
      percentage: calculatePercentage(totalRecoveries, 1000),
      color: "blue",
      icon: CreditCard,
      description: "Number of recoveries",
      trend: "+12.7%",
      trendUp: true,
    },
    {
      name: "Average Recovery",
      value: averageRecovery,
      formatted: formatCurrency(averageRecovery),
      percentage: 87,
      color: "purple",
      icon: Wallet,
      description: "Average per recovery",
      trend: "-2.4%",
      trendUp: false,
    },
  ]

  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      light: "bg-emerald-100",
      dark: "bg-emerald-600",
      gradient: "from-emerald-500 to-emerald-600",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      light: "bg-blue-100",
      dark: "bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      light: "bg-purple-100",
      dark: "bg-purple-600",
      gradient: "from-purple-500 to-purple-600",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      light: "bg-amber-100",
      dark: "bg-amber-600",
      gradient: "from-amber-500 to-amber-600",
    },
  }

  if (recoverySummaryLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-gray-200 bg-white p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="size-10 rounded-lg bg-gray-200"></div>
          <div>
            <div className="h-5 w-40 rounded bg-gray-200"></div>
            <div className="mt-1 h-4 w-32 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="mt-2 h-8 w-32 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (recoverySummaryError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-red-200 bg-red-50 p-5"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Failed to load recovery data</p>
            <p className="text-sm text-red-700">{recoverySummaryError}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white p-5"
    >
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-100 p-2">
            <PieChart className="size-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Debt Recovery Summary</h2>
            <p className="text-sm text-gray-600">Current period recovery performance</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Last 30 days</span>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {recoveryCategories.map((category, index) => {
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
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    category.trendUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {category.trendUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {category.trend}
                </span>
              </div>

              {/* Value */}
              <div className="mt-3">
                <p className="text-2xl font-semibold text-gray-900">{category.formatted}</p>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Performance</span>
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
            </motion.div>
          )
        })}
      </div>

      {/* Recovery by Period */}
      {recoverySummary.length > 0 && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-600">Recovery by Period</h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recoverySummary.slice(0, 6).map((item, index) => {
              const trend = Math.floor(Math.random() * 20) + 3
              const isPositive = Math.random() > 0.3

              return (
                <div key={index} className="flex items-center justify-between rounded-lg bg-white p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.periodKey}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">{Math.floor(Math.random() * 20) + 5} recoveries</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.totalRecoveredAmount)}</p>
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs ${
                        isPositive ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                      {trend}%
                    </span>
                  </div>
                </div>
              )
            })}
            {recoverySummary.length > 6 && (
              <div className="flex items-center justify-center rounded-lg bg-white p-3">
                <p className="text-xs text-gray-500">+{recoverySummary.length - 6} more periods</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Modern Skeleton Loader for Debt Management Info
const DebtManagementInfoSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white"
    >
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="h-6 w-48 rounded bg-gray-200"></div>
      </div>
      <div className="p-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gray-200"></div>
              <div>
                <div className="h-4 w-32 rounded bg-gray-200"></div>
                <div className="mt-1 h-3 w-24 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 rounded bg-gray-200"></div>
              <div className="h-8 w-16 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Loading State Component
const LoadingState = () => {
  return (
    <div className="w-full">
      {/* Analytics Cards Skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <AnalyticsCardSkeleton key={i} />
        ))}
      </div>

      {/* Recovery Summary Skeleton */}
      <div className="mb-6">
        <AnalyticsCardSkeleton />
      </div>

      {/* Debt Management Info Skeleton */}
      <DebtManagementInfoSkeleton />
    </div>
  )
}

export default function DebtManagementDashboard() {
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState<number>(480000) // Default 8 minutes

  // Initialize selectedPeriod with a stable value
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  })

  // Redux hooks
  const dispatch = useAppDispatch()

  // Debt management state
  const recoverySummary = useAppSelector(selectRecoverySummary)
  const recoverySummaryLoading = useAppSelector(selectRecoverySummaryLoading)
  const recoverySummaryError = useAppSelector(selectRecoverySummaryError)
  const recoverySummarySuccess = useAppSelector(selectRecoverySummarySuccess)

  // Customers state
  const customers = useAppSelector(selectCustomers)
  const customersLoading = useAppSelector(selectCustomersLoading)
  const customersError = useAppSelector(selectCustomersError)
  const customersSuccess = useAppSelector(selectCustomersSuccess)
  const customersPagination = useAppSelector(selectCustomersPagination)

  // All debt entries state
  const allDebtEntries = useAppSelector(selectAllDebtEntries)
  const allDebtEntriesLoading = useAppSelector(selectAllDebtEntriesLoading)
  const allDebtEntriesError = useAppSelector(selectAllDebtEntriesError)
  const allDebtEntriesSuccess = useAppSelector(selectAllDebtEntriesSuccess)
  const allDebtEntriesPagination = useAppSelector(selectAllDebtEntriesPagination)
  const { user } = useAppSelector((state) => state.auth)

  // Check if user has Write permission for debt recording
  const canRecordDebt = !!user?.privileges?.some(
    (p) =>
      (p.key === "debt-management" && p.actions?.includes("W")) ||
      (p.key === "finance-bill-payments-and-vending" && p.actions?.includes("W")) ||
      (p.key === "customers" && p.actions?.includes("W"))
  )

  // State for customers pagination
  const [customersPage, setCustomersPage] = useState(1)
  const customersPageSize = 10

  // State for all debt entries pagination and filters
  const [allDebtEntriesPage, setAllDebtEntriesPage] = useState(1)
  const allDebtEntriesPageSize = 10
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>(undefined)
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<number | undefined>(undefined)

  // State for record debt modal
  const [isRecordDebtModalOpen, setIsRecordDebtModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number
    name: string
    accountNumber: string
  } | null>(null)

  // State for view debt entry modal
  const [isViewDebtEntryModalOpen, setIsViewDebtEntryModalOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<number>(0)

  // Fetch recovery summary data when period changes
  useEffect(() => {
    // Calculate date range for the selected period
    const [year, month] = selectedPeriod.split("-").map(Number)
    const validYear = year && !isNaN(year) ? year : new Date().getFullYear()
    const validMonth = month && !isNaN(month) && month >= 1 && month <= 12 ? month : new Date().getMonth() + 1
    const startDate = new Date(validYear, validMonth - 1, 1) // Start of month
    const endDate = new Date(validYear, validMonth, 0) // End of month

    const recoveryParams: RecoverySummaryRequest = {
      FromUtc: startDate.toISOString(),
      ToUtc: endDate.toISOString(),
    }

    dispatch(fetchRecoverySummary(recoveryParams))
  }, [dispatch, selectedPeriod])

  // Fetch customers data
  useEffect(() => {
    const customersParams: DebtManagementCustomersRequest = {
      PageNumber: customersPage,
      PageSize: customersPageSize,
      SortDirection: 2, // Descending (highest debt first)
    }

    dispatch(fetchDebtManagementCustomers(customersParams))
  }, [dispatch, customersPage, customersPageSize])

  // Fetch all debt entries data when page or filters change
  useEffect(() => {
    const allDebtEntriesParams: AllDebtEntriesRequest = {
      PageNumber: allDebtEntriesPage,
      PageSize: allDebtEntriesPageSize,
      ...(selectedCustomerId && { CustomerId: selectedCustomerId }),
      ...(selectedStatus && { Status: selectedStatus as 1 | 2 | 3 }),
      ...(selectedPaymentTypeId && { PaymentTypeId: selectedPaymentTypeId }),
    }

    dispatch(fetchAllDebtEntries(allDebtEntriesParams))
  }, [dispatch, allDebtEntriesPage, allDebtEntriesPageSize, selectedCustomerId, selectedStatus, selectedPaymentTypeId])

  // Cleanup debt management state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearRecoverySummaryState())
      dispatch(clearCustomersState())
      dispatch(clearAllDebtEntriesState())
    }
  }, [dispatch])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
  }

  const handleRefreshData = useCallback(() => {
    // Refresh recovery summary
    const [year, month] = selectedPeriod.split("-").map(Number)
    const validYear = year && !isNaN(year) ? year : new Date().getFullYear()
    const validMonth = month && !isNaN(month) && month >= 1 && month <= 12 ? month : new Date().getMonth() + 1
    const startDate = new Date(validYear, validMonth - 1, 1)
    const endDate = new Date(validYear, validMonth, 0)

    const recoveryParams: RecoverySummaryRequest = {
      FromUtc: startDate.toISOString(),
      ToUtc: endDate.toISOString(),
    }

    const customersParams: DebtManagementCustomersRequest = {
      PageNumber: customersPage,
      PageSize: customersPageSize,
      SortDirection: 2,
    }

    dispatch(fetchRecoverySummary(recoveryParams))
    dispatch(fetchDebtManagementCustomers(customersParams))
  }, [dispatch, selectedPeriod, customersPage, customersPageSize])

  const handleCustomersPageChange = (page: number) => {
    setCustomersPage(page)
  }

  const handleRefreshCustomers = () => {
    const customersParams: DebtManagementCustomersRequest = {
      PageNumber: customersPage,
      PageSize: customersPageSize,
      SortDirection: 2,
    }
    dispatch(fetchDebtManagementCustomers(customersParams))
  }

  const handleAllDebtEntriesPageChange = (page: number) => {
    setAllDebtEntriesPage(page)
  }

  const handleRefreshAllDebtEntries = () => {
    const allDebtEntriesParams: AllDebtEntriesRequest = {
      PageNumber: allDebtEntriesPage,
      PageSize: allDebtEntriesPageSize,
      ...(selectedCustomerId && { CustomerId: selectedCustomerId }),
      ...(selectedStatus && { Status: selectedStatus as 1 | 2 | 3 }),
      ...(selectedPaymentTypeId && { PaymentTypeId: selectedPaymentTypeId }),
    }
    dispatch(fetchAllDebtEntries(allDebtEntriesParams))
  }

  const handleCustomerIdFilterChange = (customerId: number | undefined) => {
    setSelectedCustomerId(customerId)
    setAllDebtEntriesPage(1) // Reset to first page when filter changes
  }

  const handleStatusFilterChange = (status: number | undefined) => {
    setSelectedStatus(status)
    setAllDebtEntriesPage(1) // Reset to first page when filter changes
  }

  const handlePaymentTypeIdFilterChange = (paymentTypeId: number | undefined) => {
    setSelectedPaymentTypeId(paymentTypeId)
    setAllDebtEntriesPage(1) // Reset to first page when filter changes
  }

  const handleOpenRecordDebtModal = (customerId: number, customerName: string, accountNumber: string) => {
    setSelectedCustomer({ id: customerId, name: customerName, accountNumber })
    setIsRecordDebtModalOpen(true)
  }

  const handleCloseRecordDebtModal = () => {
    setIsRecordDebtModalOpen(false)
    setSelectedCustomer(null)
  }

  // View debt entry handlers
  const handleViewEntryDetails = (entry: DebtEntryData) => {
    setSelectedEntryId(entry.id)
    setIsViewDebtEntryModalOpen(true)
  }

  const handleCloseViewDebtEntryModal = () => {
    setIsViewDebtEntryModalOpen(false)
    setSelectedEntryId(0)
  }

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const handlePollingIntervalChange = (interval: number) => {
    setPollingInterval(interval)
  }

  // Polling interval options - 8 minutes as default
  const pollingOptions = [
    { value: 480000, label: "8m" },
    { value: 600000, label: "10m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  // Short polling effect - only runs if isPolling is true and uses the selected interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isPolling) {
      // Initial fetch
      const fetchData = () => {
        const [year, month] = selectedPeriod.split("-").map(Number)
        const validYear = year && !isNaN(year) ? year : new Date().getFullYear()
        const validMonth = month && !isNaN(month) && month >= 1 && month <= 12 ? month : new Date().getMonth() + 1
        const startDate = new Date(validYear, validMonth - 1, 1)
        const endDate = new Date(validYear, validMonth, 0)

        const recoveryParams: RecoverySummaryRequest = {
          FromUtc: startDate.toISOString(),
          ToUtc: endDate.toISOString(),
        }

        const customersParams: DebtManagementCustomersRequest = {
          PageNumber: customersPage,
          PageSize: customersPageSize,
          SortDirection: 2,
        }

        dispatch(fetchRecoverySummary(recoveryParams))
        dispatch(fetchDebtManagementCustomers(customersParams))
      }

      // Set up the interval with the selected pollingInterval
      intervalId = setInterval(fetchData, pollingInterval)

      // Cleanup function
      return () => {
        if (intervalId) {
          clearInterval(intervalId)
        }
      }
    }

    // Return cleanup function even when polling is disabled
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [dispatch, isPolling, pollingInterval, selectedPeriod, customersPage, customersPageSize])

  // Calculate totals for analytics cards
  const totalRecoveredAmount = recoverySummary.reduce((sum, item) => sum + item.totalRecoveredAmount, 0)
  const totalRecoveries = recoverySummary.reduce((sum, item) => sum + item.totalRecoveries, 0)
  const averageRecovery = totalRecoveries > 0 ? totalRecoveredAmount / totalRecoveries : 0

  // Calculate total outstanding from customers data
  const totalOutstanding = customers.reduce((sum, customer) => sum + (customer.outstandingBalance || 0), 0)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
  }

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
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Debt Management</h1>
                  <p className="mt-1 text-sm text-gray-600">Debt recovery tracking and management</p>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                  {canRecordDebt && (
                    <ButtonModule
                      variant="primary"
                      size="md"
                      onClick={() => {
                        handleOpenRecordDebtModal(0, "Select Customer", "")
                      }}
                      icon={<VscAdd className="size-4" />}
                      iconPosition="start"
                      className="bg-[#004B23] text-white hover:bg-[#003618]"
                    >
                      Record Debt
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
                        onSelect={handlePollingIntervalChange}
                      >
                        {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                      </DropdownPopover>
                    )}
                  </div>

                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshData}
                    disabled={recoverySummaryLoading}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className={`mr-2 size-4 ${recoverySummaryLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {recoverySummaryError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Failed to load analytics</p>
                      <p className="text-sm text-red-700">{recoverySummaryError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            {recoverySummaryLoading && !recoverySummary.length ? (
              <LoadingState />
            ) : (
              <div className="w-full">
                {/* Analytics Cards Row */}

                {/* Recovery Summary Section */}
                <RecoverySummarySection
                  recoverySummary={recoverySummary}
                  recoverySummaryLoading={recoverySummaryLoading}
                  recoverySummaryError={recoverySummaryError}
                  customers={customers}
                />

                {/* Debt Management Tabbed Interface */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6"
                >
                  <DebtManagementInfo
                    customers={customers}
                    customersLoading={customersLoading}
                    customersError={customersError}
                    customersPagination={customersPagination}
                    onCustomersPageChange={handleCustomersPageChange}
                    onRefreshCustomers={handleRefreshCustomers}
                    allDebtEntries={allDebtEntries}
                    allDebtEntriesLoading={allDebtEntriesLoading}
                    allDebtEntriesError={allDebtEntriesError}
                    allDebtEntriesPagination={allDebtEntriesPagination}
                    onAllDebtEntriesPageChange={handleAllDebtEntriesPageChange}
                    onRefreshAllDebtEntries={handleRefreshAllDebtEntries}
                    selectedCustomerId={selectedCustomerId}
                    selectedStatus={selectedStatus}
                    selectedPaymentTypeId={selectedPaymentTypeId}
                    onCustomerIdFilterChange={handleCustomerIdFilterChange}
                    onStatusFilterChange={handleStatusFilterChange}
                    onPaymentTypeIdFilterChange={handlePaymentTypeIdFilterChange}
                    onViewEntryDetails={handleViewEntryDetails}
                  />
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Debt Modal */}
      {selectedCustomer && (
        <RecordDebtModal
          isOpen={isRecordDebtModalOpen}
          onRequestClose={handleCloseRecordDebtModal}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          accountNumber={selectedCustomer.accountNumber}
        />
      )}

      {/* View Debt Entry Modal */}
      <ViewDebtEntryModal
        isOpen={isViewDebtEntryModalOpen}
        onRequestClose={handleCloseViewDebtEntryModal}
        entryId={selectedEntryId}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {recoverySummaryLoading && !recoverySummary.length && (
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
                  <p className="font-medium text-gray-900">Loading Debt Data</p>
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
