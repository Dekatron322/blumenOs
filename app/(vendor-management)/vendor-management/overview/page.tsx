"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useEffect, useState } from "react"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { AnimatePresence, motion } from "framer-motion"
import VendorManagement from "components/VendorManagementInfo/VendorManagment"
import { ButtonModule } from "components/ui/Button/Button"
import { fetchVendorSummaryAnalytics } from "lib/redux/analyticsSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { VscAdd } from "react-icons/vsc"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  MapPin,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
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
  color?: "blue" | "green" | "purple" | "amber" | "emerald" | "orange"
  trend?: "up" | "down"
  trendValue?: string
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  }

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    orange: "text-orange-600",
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

// Modern Skeleton Loader for State Distribution Section
const StateDistributionSkeleton = () => {
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
        <div className="h-6 w-48 rounded bg-gray-200"></div>
        <div className="h-6 w-24 rounded-full bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-gray-200"></div>
              <div className="h-4 w-16 rounded bg-gray-200"></div>
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

      {/* State Distribution Section Skeleton */}
      <StateDistributionSkeleton />

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

// Vendor State Distribution Section Component
const VendorStateDistributionSection = ({ vendorData }: { vendorData: any }) => {
  if (!vendorData?.vendorsByState || vendorData.vendorsByState.length === 0) {
    return null
  }

  const topStates = vendorData.vendorsByState.slice(0, 6)
  const totalStates = vendorData.vendorsByState.length
  const avgVendorsPerState = Math.round(vendorData.totalVendors / totalStates)

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
            <MapPin className="size-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Vendor Distribution by State</h2>
            <p className="text-sm text-gray-600">Geographic coverage and vendor presence</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          {totalStates} states covered
        </span>
      </div>

      {/* States Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topStates.map((state: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2">
                  <MapPin className="size-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{state.state}</h3>
                  <p className="text-xs text-gray-500">Vendor presence</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-blue-600">{state.count.toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {totalStates > 6 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">+{totalStates - 6} more states with vendor coverage</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Coverage Metrics</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-1">
                  <MapPin className="size-3 text-blue-700" />
                </div>
                <span className="text-sm text-gray-700">States Covered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{totalStates.toLocaleString()}</span>
                <span className="text-xs text-gray-500">total</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-100 p-1">
                  <Users className="size-3 text-purple-700" />
                </div>
                <span className="text-sm text-gray-700">Avg Vendors/State</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{avgVendorsPerState.toLocaleString()}</span>
                <span className="text-xs text-gray-500">average</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Top Performing States</h4>
          <div className="space-y-2">
            {topStates.slice(0, 2).map((state: any, index: number) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-white p-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-emerald-100 p-1">
                    <TrendingUp className="size-3 text-emerald-700" />
                  </div>
                  <span className="text-sm text-gray-700">{state.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{state.count.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">
                    ({Math.round((state.count / vendorData.totalVendors) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function VendorManagementDashboard() {
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // 8 minutes default

  const dispatch = useAppDispatch()
  const { vendorSummaryData, vendorSummaryLoading, vendorSummaryError, vendorSummarySuccess } = useAppSelector(
    (state) => state.analytics
  )
  const { user } = useAppSelector((state) => state.auth)

  // Check if user has Write permission for vendors
  const canAddVendor = !!user?.privileges?.some(
    (p) => (p.key === "vendor-management" || p.key === "vendors") && p.actions?.includes("W")
  )

  // Fetch vendor analytics on component mount
  useEffect(() => {
    dispatch(fetchVendorSummaryAnalytics({}))
  }, [dispatch])

  const handleRefreshData = useCallback(() => {
    dispatch(fetchVendorSummaryAnalytics({}))
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

  const handleAddVendorSuccess = async () => {
    setIsAddVendorModalOpen(false)
    // Refresh vendor analytics after adding vendor
    dispatch(fetchVendorSummaryAnalytics({}))
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
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Vendor Management</h1>
                  <p className="mt-1 text-sm text-gray-600">Vendor onboarding, commissions, and performance tracking</p>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                  {canAddVendor && (
                    <ButtonModule
                      variant="primary"
                      size="md"
                      onClick={() => setIsAddVendorModalOpen(true)}
                      icon={<VscAdd className="size-4" />}
                      iconPosition="start"
                      className="bg-[#004B23] text-white hover:bg-[#003618]"
                    >
                      Add Vendor
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
                    disabled={vendorSummaryLoading}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className={`mr-2 size-4 ${vendorSummaryLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {vendorSummaryError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Failed to load vendor analytics</p>
                      <p className="text-sm text-red-700">{vendorSummaryError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            {vendorSummaryLoading && !vendorSummaryData ? (
              <LoadingState />
            ) : vendorSummaryData ? (
              <div className="w-full">
                {/* Analytics Cards Row */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <AnalyticsCard
                    title="Total Vendors"
                    value={vendorSummaryData.totalVendors}
                    subtitle="All registered vendors"
                    icon={Users}
                    color="blue"
                  />
                  <AnalyticsCard
                    title="Active Vendors"
                    value={vendorSummaryData.activeVendors}
                    subtitle={`${Math.round(
                      (vendorSummaryData.activeVendors / vendorSummaryData.totalVendors) * 100
                    )}% of total`}
                    icon={CheckCircle}
                    color="green"
                  />
                  <AnalyticsCard
                    title="Suspended Vendors"
                    value={vendorSummaryData.suspendedVendors}
                    subtitle={`${Math.round(
                      (vendorSummaryData.suspendedVendors / vendorSummaryData.totalVendors) * 100
                    )}% of total`}
                    icon={AlertTriangle}
                    color="orange"
                  />
                  <AnalyticsCard
                    title="States Covered"
                    value={vendorSummaryData.vendorsByState?.length || 0}
                    subtitle="Geographic coverage"
                    icon={MapPin}
                    color="purple"
                  />
                </div>

                {/* Vendor State Distribution Section */}
                <VendorStateDistributionSection vendorData={vendorSummaryData} />

                {/* Vendor Management Table/Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white p-4"
                >
                  <VendorManagement />
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
                  <h3 className="text-lg font-medium text-gray-900">No Vendor Data</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    No vendor analytics data available. Try refreshing the data.
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

      {/* Add Vendor Modal */}
      <AddAgentModal
        isOpen={isAddVendorModalOpen}
        onRequestClose={() => setIsAddVendorModalOpen(false)}
        onSuccess={handleAddVendorSuccess}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {vendorSummaryLoading && !vendorSummaryData && (
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
                  <p className="font-medium text-gray-900">Loading Vendor Data</p>
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
