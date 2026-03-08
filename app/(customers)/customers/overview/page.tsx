"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useCallback, useEffect, useState } from "react"
import AddCustomerModal from "components/ui/Modal/add-customer-modal"
import { AnimatePresence, motion } from "framer-motion"
import AllCustomers from "components/Tables/AllCustomers"
import { ButtonModule } from "components/ui/Button/Button"
import { clearCustomerAnalytics, fetchCustomerAnalytics } from "lib/redux/analyticsSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { useRouter } from "next/navigation"
import { VscAdd } from "react-icons/vsc"
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Factory,
  FileText,
  Grid,
  Home,
  LayoutList,
  Loader2,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  User,
  Users,
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

// Modern Skeleton Loader for Categories Section
const CategoriesSectionSkeleton = () => {
  return (
    <motion.div
      className="mt-6 rounded-xl border border-gray-200 bg-white p-5"
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
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-40 rounded bg-gray-200"></div>
        <div className="h-6 w-24 rounded-full bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-16 rounded bg-gray-200"></div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-gray-200"></div>
                <div className="h-3 w-12 rounded bg-gray-200"></div>
              </div>
              <div className="h-1.5 w-full rounded bg-gray-200"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 rounded bg-gray-200"></div>
                <div className="h-8 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-gray-100 p-3">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="mt-2 space-y-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-20 rounded bg-gray-200"></div>
                <div className="h-3 w-12 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-gray-100 p-3">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="mt-2 h-20 w-full rounded bg-gray-200"></div>
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
      <CategoriesSectionSkeleton />

      {/* Main Content Skeleton */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="h-7 w-48 rounded bg-gray-200"></div>
            <div className="mt-1 h-4 w-64 rounded bg-gray-200"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded bg-gray-200"></div>
            <div className="h-9 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 w-full rounded bg-gray-100"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Customer Categories Section Component (redesigned to be under cards)
const CustomerCategoriesSection = ({ analyticsData }: { analyticsData: any }) => {
  const categories = [
    {
      name: "Residential",
      count: Math.round(analyticsData.totalCustomers * 0.7),
      percentage: 70,
      color: "blue",
      icon: Home,
      description: "Individual households and apartments",
      active: Math.round(analyticsData.totalCustomers * 0.7 * 0.85),
      inactive: Math.round(analyticsData.totalCustomers * 0.7 * 0.15),
    },
    {
      name: "Commercial",
      count: Math.round(analyticsData.totalCustomers * 0.2),
      percentage: 20,
      color: "purple",
      icon: Building2,
      description: "Shops, offices, and businesses",
      active: Math.round(analyticsData.totalCustomers * 0.2 * 0.9),
      inactive: Math.round(analyticsData.totalCustomers * 0.2 * 0.1),
    },
    {
      name: "Industrial",
      count: Math.round(analyticsData.totalCustomers * 0.1),
      percentage: 10,
      color: "amber",
      icon: Factory,
      description: "Manufacturing and industrial facilities",
      active: Math.round(analyticsData.totalCustomers * 0.1 * 0.95),
      inactive: Math.round(analyticsData.totalCustomers * 0.1 * 0.05),
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
            <h2 className="text-lg font-semibold text-gray-900">Customer Category Breakdown</h2>
            <p className="text-sm text-gray-600">Distribution by customer type and status</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Total: {analyticsData.totalCustomers.toLocaleString()}
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
                <span className={`text-sm font-semibold ${colors.text}`}>{category.count.toLocaleString()}</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Distribution</span>
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

              {/* Status Breakdown */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-emerald-50 p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="size-3 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Active</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-emerald-900">{category.active.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="size-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Inactive</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-amber-900">{category.inactive.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
        {/* Left Column - Customer Types */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Customer Type Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-100 p-1">
                  <Zap className="size-3 text-purple-700" />
                </div>
                <span className="text-sm text-gray-700">Prepaid Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {analyticsData.prepaidCustomers.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">
                  ({Math.round((analyticsData.prepaidCustomers / analyticsData.totalCustomers) * 100)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-amber-100 p-1">
                  <FileText className="size-3 text-amber-700" />
                </div>
                <span className="text-sm text-gray-700">Postpaid Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {analyticsData.postpaidCustomers.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">
                  ({Math.round((analyticsData.postpaidCustomers / analyticsData.totalCustomers) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Special Categories */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Special Categories</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-100 p-1">
                  <Users className="size-3 text-emerald-700" />
                </div>
                <span className="text-sm text-gray-700">PPM Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {analyticsData.isPpmCustomers.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">
                  ({Math.round((analyticsData.isPpmCustomers / analyticsData.totalCustomers) * 100)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-1">
                  <Building2 className="size-3 text-blue-700" />
                </div>
                <span className="text-sm text-gray-700">MD Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {analyticsData.isMdCustomers.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">
                  ({Math.round((analyticsData.isMdCustomers / analyticsData.totalCustomers) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AllTransactions() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // 8 minutes default

  const router = useRouter()

  // Redux hooks
  const dispatch = useAppDispatch()
  const { customerAnalyticsData, customerAnalyticsLoading, customerAnalyticsError, customerAnalyticsSuccess } =
    useAppSelector((state) => state.analytics)
  const { user } = useAppSelector((state) => state.auth)

  // Check if user has Write permission for customers
  const canAddCustomer = !!user?.privileges?.some((p) => p.key === "customers" && p.actions?.includes("W"))

  // Fetch customer analytics on component mount
  useEffect(() => {
    dispatch(fetchCustomerAnalytics())
  }, [dispatch])

  const handleRefreshData = useCallback(() => {
    dispatch(clearCustomerAnalytics())
    dispatch(fetchCustomerAnalytics())
  }, [dispatch])

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
    if (!isPolling) return

    const interval = setInterval(() => {
      handleRefreshData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [dispatch, isPolling, pollingInterval, handleRefreshData])

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh customer analytics after adding customer
    dispatch(fetchCustomerAnalytics())
  }

  const handleOpenAddCustomerModal = () => {
    router.push("/customers/add-customers")
  }

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
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
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Customer Management</h1>
                  <p className="mt-1 text-sm text-gray-600">Manage customer accounts, KYC, and service connections</p>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                  {canAddCustomer && (
                    <ButtonModule
                      variant="primary"
                      size="md"
                      onClick={handleOpenAddCustomerModal}
                      icon={<VscAdd className="size-4" />}
                      iconPosition="start"
                      className="bg-[#004B23] text-white hover:bg-[#003618]"
                    >
                      Add Customer
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
                    disabled={customerAnalyticsLoading}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className={`mr-2 size-4 ${customerAnalyticsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {customerAnalyticsError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Failed to load analytics</p>
                      <p className="text-sm text-red-700">{customerAnalyticsError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            {customerAnalyticsLoading && !customerAnalyticsData ? (
              <LoadingState />
            ) : customerAnalyticsData ? (
              <div className="w-full">
                {/* Analytics Cards Row */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <AnalyticsCard
                    title="Total Customers"
                    value={customerAnalyticsData.totalCustomers}
                    subtitle="All registered accounts"
                    icon={Users}
                    color="blue"
                  />
                  <AnalyticsCard
                    title="Active Customers"
                    value={customerAnalyticsData.activeCustomers}
                    subtitle={`${Math.round(
                      (customerAnalyticsData.activeCustomers / customerAnalyticsData.totalCustomers) * 100
                    )}% of total`}
                    icon={CheckCircle}
                    color="green"
                  />
                  <AnalyticsCard
                    title="Prepaid"
                    value={customerAnalyticsData.prepaidCustomers}
                    subtitle={`${Math.round(
                      (customerAnalyticsData.prepaidCustomers / customerAnalyticsData.totalCustomers) * 100
                    )}% of total`}
                    icon={Zap}
                    color="purple"
                  />
                  <AnalyticsCard
                    title="Postpaid"
                    value={customerAnalyticsData.postpaidCustomers}
                    subtitle={`${Math.round(
                      (customerAnalyticsData.postpaidCustomers / customerAnalyticsData.totalCustomers) * 100
                    )}% of total`}
                    icon={FileText}
                    color="amber"
                  />
                </div>

                {/* Customer Categories Section - Now under the cards */}
                <CustomerCategoriesSection analyticsData={customerAnalyticsData} />

                {/* All Customers Table/Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <AllCustomers />
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
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                    <Users className="size-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Customer Data</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    No customer analytics data available. Try refreshing the data.
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

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {customerAnalyticsLoading && !customerAnalyticsData && (
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
                  <p className="font-medium text-gray-900">Loading Customer Data</p>
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
