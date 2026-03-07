"use client"

import React, { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FiSend } from "react-icons/fi"
import {
  AlertCircle,
  BarChart3,
  Building2,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Factory,
  FileText,
  Home,
  Loader2,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react"

import BillingInfo from "components/BillingInfo/BillingInfo"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import StartBillingRun from "components/ui/Modal/start-billing-run"
import {
  clearPostpaidBillingAnalytics,
  fetchPostpaidBillingAnalytics,
  setPostpaidBillingAnalyticsParams,
} from "lib/redux/analyticsSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import type { PostpaidBillingAnalyticsParams } from "lib/redux/analyticsSlice"
import type { BillingPeriod } from "lib/redux/billingPeriodsSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

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
  color?: "blue" | "green" | "purple" | "amber" | "emerald"
  trend?: "up" | "down"
  trendValue?: string
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
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
        <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
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

// Billing Categories Section Component (redesigned to be under cards)
const BillingCategoriesSection = ({ analyticsData }: { analyticsData: any }) => {
  const categories = [
    {
      name: "Residential",
      count: Math.round(analyticsData.totalBills * 0.65),
      percentage: 65,
      amount: analyticsData.totalCurrentBillAmount * 0.55,
      color: "blue",
      icon: Home,
      description: "Individual households",
      finalized: Math.round(analyticsData.totalBills * 0.65 * 0.8),
      pending: Math.round(analyticsData.totalBills * 0.65 * 0.2),
    },
    {
      name: "Commercial",
      count: Math.round(analyticsData.totalBills * 0.25),
      percentage: 25,
      amount: analyticsData.totalCurrentBillAmount * 0.3,
      color: "purple",
      icon: Building2,
      description: "Businesses and offices",
      finalized: Math.round(analyticsData.totalBills * 0.25 * 0.85),
      pending: Math.round(analyticsData.totalBills * 0.25 * 0.15),
    },
    {
      name: "Industrial",
      count: Math.round(analyticsData.totalBills * 0.1),
      percentage: 10,
      amount: analyticsData.totalCurrentBillAmount * 0.15,
      color: "amber",
      icon: Factory,
      description: "Manufacturing facilities",
      finalized: Math.round(analyticsData.totalBills * 0.1 * 0.9),
      pending: Math.round(analyticsData.totalBills * 0.1 * 0.1),
    },
  ]

  const colorClasses = {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
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
            <h2 className="text-lg font-semibold text-gray-900">Billing Category Breakdown</h2>
            <p className="text-sm text-gray-600">Distribution by customer type and bill status</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Total Bills: {formatNumber(analyticsData.totalBills)}
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
                <span className={`text-sm font-semibold ${colors.text}`}>{formatNumber(category.count)}</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Bill Distribution</span>
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

              {/* Amount */}
              <div className="mt-3 rounded-lg bg-gray-50 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Total Amount</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(category.amount)}</span>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-emerald-50 p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="size-3 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Finalized</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-emerald-900">{formatNumber(category.finalized)}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="size-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Pending</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-amber-900">{formatNumber(category.pending)}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
        {/* Left Column - Revenue Summary */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Revenue Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-green-100 p-1">
                  <DollarSign className="size-3 text-green-700" />
                </div>
                <span className="text-sm text-gray-700">Current Bill Amount</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(analyticsData.totalCurrentBillAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-red-100 p-1">
                  <AlertCircle className="size-3 text-red-700" />
                </div>
                <span className="text-sm text-gray-700">Amount Due</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(analyticsData.totalAmountDue)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - VAT & Adjustments */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">VAT & Adjustments</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-100 p-1">
                  <CreditCard className="size-3 text-purple-700" />
                </div>
                <span className="text-sm text-gray-700">Total VAT</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(analyticsData.totalVatAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-amber-100 p-1">
                  <BarChart3 className="size-3 text-amber-700" />
                </div>
                <span className="text-sm text-gray-700">Adjustments</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(analyticsData.totalAdjustmentsApplied)}
              </span>
            </div>
          </div>
        </div>
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

      {/* Categories Section Skeleton */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="h-6 w-40 rounded bg-gray-200"></div>
            <div className="mt-1 h-4 w-64 rounded bg-gray-200"></div>
          </div>
          <div className="h-6 w-24 rounded-full bg-gray-200"></div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="rounded-lg border border-gray-100 bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-gray-200"></div>
                  <div>
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                    <div className="mt-1 h-3 w-24 rounded bg-gray-200"></div>
                  </div>
                </div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full rounded bg-gray-200"></div>
                <div className="h-8 w-full rounded bg-gray-200"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 rounded bg-gray-200"></div>
                  <div className="h-12 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gray-100 p-3">
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="mt-2 space-y-1">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-20 rounded bg-gray-200"></div>
                  <div className="h-3 w-16 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-gray-100 p-3">
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="mt-2 space-y-1">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-20 rounded bg-gray-200"></div>
                  <div className="h-3 w-16 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Info Skeleton */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="h-7 w-48 rounded bg-gray-200"></div>
        <div className="mt-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 w-full rounded bg-gray-100"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Period Selector Component (redesigned)
const PeriodSelector = React.memo(
  ({ currentPeriod, onPeriodChange }: { currentPeriod?: number; onPeriodChange: (period: number) => void }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // Fetch billing periods from API
    const dispatch = useAppDispatch()
    const { billingPeriods, loading: periodsLoading } = useAppSelector((state) => state.billingPeriods)

    useEffect(() => {
      if (billingPeriods.length === 0) {
        dispatch(
          fetchBillingPeriods({
            pageNumber: 0,
            pageSize: 0,
          })
        )
      }
    }, [dispatch, billingPeriods.length])

    // Convert billing periods to dropdown format
    const periods = billingPeriods.map((period: BillingPeriod) => ({
      value: period.id,
      label: period.displayName,
      periodKey: period.periodKey,
    }))

    // Find the latest period (sort by year and month descending)
    const latestPeriod =
      billingPeriods.length > 0
        ? billingPeriods.reduce((latest, current) => {
            if (current.year > latest.year) return current
            if (current.year === latest.year && current.month > latest.month) return current
            return latest
          })
        : null

    const selectedValue = currentPeriod ?? latestPeriod?.id ?? (periods.length > 0 ? periods[0]?.value : 0)

    return (
      <div className="flex items-center gap-2">
        <label htmlFor="period-select" className="hidden text-sm font-medium text-gray-700 sm:block">
          Billing Period:
        </label>
        <div className="relative">
          <button
            id="period-select"
            type="button"
            className="inline-flex min-w-[140px] items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:min-w-[160px]"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            disabled={periodsLoading}
          >
            <span className="truncate">
              {periodsLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                periods.find((p) => p.value === selectedValue)?.label ?? selectedValue
              )}
            </span>
            {!periodsLoading && (
              <svg
                className={`size-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
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
            )}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                >
                  <div className="max-h-60 overflow-y-auto">
                    {periodsLoading ? (
                      <div className="px-3 py-2 text-xs text-gray-500">Loading periods...</div>
                    ) : periods.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-gray-500">No periods available</div>
                    ) : (
                      periods.map((period) => (
                        <button
                          key={period.value}
                          type="button"
                          className={`block w-full px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 ${
                            period.value === selectedValue ? "bg-blue-50 font-medium text-blue-700" : "text-gray-700"
                          }`}
                          onClick={() => {
                            onPeriodChange(period.value)
                            setIsDropdownOpen(false)
                          }}
                        >
                          {period.label}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }
)

PeriodSelector.displayName = "PeriodSelector"

export default function BillingDashboard() {
  const [isStartBillingRunModalOpen, setIsStartBillingRunModalOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // 8 minutes default

  // Redux hooks
  const dispatch = useAppDispatch()
  const { postpaidBillingAnalyticsData, postpaidBillingAnalyticsLoading, postpaidBillingAnalyticsError } =
    useAppSelector((state) => state.analytics)
  const { user } = useAppSelector((state) => state.auth)
  const { billingPeriods } = useAppSelector((state) => state.billingPeriods)

  // Initialize selectedPeriod with the latest billing period
  const [selectedPeriod, setSelectedPeriod] = useState<number>(() => {
    // Find the latest period from available periods
    if (billingPeriods.length > 0) {
      return billingPeriods.reduce((latest, current) => {
        if (current.year > latest.year) return current
        if (current.year === latest.year && current.month > latest.month) return current
        return latest
      }).id
    }
    return 0
  })

  // Update selected period when billing periods are loaded
  useEffect(() => {
    if (billingPeriods.length > 0 && selectedPeriod === 0) {
      const latestPeriod = billingPeriods.reduce((latest, current) => {
        if (current.year > latest.year) return current
        if (current.year === latest.year && current.month > latest.month) return current
        return latest
      })
      setSelectedPeriod(latestPeriod.id)
    }
  }, [billingPeriods, selectedPeriod])

  // Fetch postpaid billing analytics only when we have a valid selected period
  useEffect(() => {
    if (selectedPeriod > 0) {
      const params: PostpaidBillingAnalyticsParams = {
        BillingPeriodId: selectedPeriod,
        Status: 1, // Finalized bills
        Category: 2, // Postpaid category
      }
      dispatch(setPostpaidBillingAnalyticsParams(params))
      dispatch(fetchPostpaidBillingAnalytics(params))
    }
  }, [dispatch, selectedPeriod])

  // Check if user has Write permission for postpaid billing
  const canPublishBills = !!user?.privileges?.some(
    (p) =>
      (p.key === "billing-postpaid" && p.actions?.includes("W")) ||
      (p.key === "billing-billing-proper" && p.actions?.includes("W"))
  )

  const handlePeriodChange = (period: number) => {
    setSelectedPeriod(period)
  }

  const handleRefreshData = useCallback(() => {
    if (selectedPeriod === 0) return // Don't refresh if no valid period selected

    const params: PostpaidBillingAnalyticsParams = {
      BillingPeriodId: selectedPeriod,
      Status: 1,
      Category: 2,
    }
    dispatch(clearPostpaidBillingAnalytics())
    dispatch(fetchPostpaidBillingAnalytics(params))
  }, [dispatch, selectedPeriod])

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

  // Short polling effect
  useEffect(() => {
    if (!isPolling || selectedPeriod === 0) return

    const interval = setInterval(() => {
      handleRefreshData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [dispatch, isPolling, pollingInterval, selectedPeriod, handleRefreshData])

  const handleStartBillingRun = () => {
    setIsStartBillingRunModalOpen(true)
  }

  const handleBillingRunSuccess = () => {
    setIsStartBillingRunModalOpen(false)
    handleRefreshData()
  }

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Billing Engine</h1>
                  <p className="mt-1 text-sm text-gray-600">Tariff management, bill generation, and billing cycles</p>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                  <PeriodSelector currentPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />

                  {canPublishBills && (
                    <ButtonModule
                      variant="primary"
                      size="md"
                      onClick={handleStartBillingRun}
                      icon={<FiSend className="size-4" />}
                      iconPosition="start"
                      className="bg-[#004B23] text-white hover:bg-[#003618]"
                      disabled={postpaidBillingAnalyticsLoading}
                    >
                      <span className="hidden sm:inline">Publish Postpaid Bills</span>
                      <span className="sm:hidden">Publish</span>
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
                    disabled={postpaidBillingAnalyticsLoading}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className={`mr-2 size-4 ${postpaidBillingAnalyticsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {postpaidBillingAnalyticsError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Failed to load billing analytics</p>
                      <p className="text-sm text-red-700">{postpaidBillingAnalyticsError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            {postpaidBillingAnalyticsLoading && !postpaidBillingAnalyticsData ? (
              <LoadingState />
            ) : postpaidBillingAnalyticsData ? (
              <div className="w-full">
                {/* Analytics Cards Row */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <AnalyticsCard
                    title="Total Bills"
                    value={formatNumber(postpaidBillingAnalyticsData.totalBills)}
                    subtitle="All bills this period"
                    icon={FileText}
                    color="blue"
                  />
                  <AnalyticsCard
                    title="Finalized Bills"
                    value={formatNumber(postpaidBillingAnalyticsData.finalizedBills)}
                    subtitle={`${Math.round(
                      (postpaidBillingAnalyticsData.finalizedBills / postpaidBillingAnalyticsData.totalBills) * 100
                    )}% completion rate`}
                    icon={CheckCircle}
                    color="green"
                  />
                  <AnalyticsCard
                    title="Current Bill Amount"
                    value={formatCurrency(postpaidBillingAnalyticsData.totalCurrentBillAmount)}
                    subtitle={`VAT: ${formatCurrency(postpaidBillingAnalyticsData.totalVatAmount)}`}
                    icon={DollarSign}
                    color="purple"
                  />
                  <AnalyticsCard
                    title="Total Consumption"
                    value={`${formatNumber(postpaidBillingAnalyticsData.totalConsumptionKwh)} kWh`}
                    subtitle={`Forecast: ${formatNumber(postpaidBillingAnalyticsData.forecastConsumptionKwh)} kWh`}
                    icon={Zap}
                    color="amber"
                  />
                </div>

                {/* Billing Categories Section - Now under the cards */}
                <BillingCategoriesSection analyticsData={postpaidBillingAnalyticsData} />

                {/* Billing Info Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6"
                >
                  <BillingInfo />
                </motion.div>
              </div>
            ) : (
              // Empty State
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <FileText className="size-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Billing Data</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    No postpaid billing analytics data available for the selected period.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1">
                      <button
                        onClick={togglePolling}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
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
                      variant="primary"
                      size="sm"
                      onClick={handleRefreshData}
                      icon={<RefreshCw className="size-4" />}
                      iconPosition="start"
                      className="bg-[#004B23] text-white hover:bg-[#003618]"
                    >
                      Refresh Data
                    </ButtonModule>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Start Billing Run Modal */}
      <StartBillingRun
        isOpen={isStartBillingRunModalOpen}
        onRequestClose={() => setIsStartBillingRunModalOpen(false)}
        onSuccess={handleBillingRunSuccess}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {postpaidBillingAnalyticsLoading && !postpaidBillingAnalyticsData && (
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
