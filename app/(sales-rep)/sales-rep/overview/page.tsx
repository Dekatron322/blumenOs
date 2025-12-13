"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "lib/redux/store"
import { motion } from "framer-motion"
import {
  CashClearanceIcon,
  CollectCash,
  CustomeraIcon,
  MakeChangeRequestIcon,
  MetersProgrammedIcon,
  PlayIcon,
  PlusIcon,
  RaiseTicketIcon,
  TamperIcon,
  TokenGeneratedIcon,
  VendingIcon,
  VendingIconOutline,
} from "components/Icons/Icons"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { ButtonModule } from "components/ui/Button/Button"
import AgentManagementInfo from "components/AgentManagementInfo/AgentManagementInfo"
import CashCollectionsTable from "components/Tables/CashCollections"
import AllPaymentsTable from "components/Tables/AllPaymentsTable"
import { formatCurrency } from "utils/formatCurrency"
import { useAppDispatch } from "lib/hooks/useRedux"
import { TimeRange, fetchAgentInfo, fetchAgentSummary } from "lib/redux/agentSlice"

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
          initial={{ opacity: 0.8 }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
            <div className="h-6 w-6 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            <div className="h-4 w-32 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-full justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                <div className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
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
    <div className="w-full rounded-md border bg-white p-5 lg:w-80">
      <div className="border-b pb-4">
        <div className="h-6 w-40 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
      </div>

      <div className="mt-4 space-y-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-12 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                <div className="h-5 w-20 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                <div className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="mt-6 rounded-lg bg-gray-50 p-3">
        <div className="mb-2 h-5 w-20 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
              <div className="h-4 w-12 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
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
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="h-8 w-40 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <div className="h-10 w-full animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] sm:w-80"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] max-sm:w-20"
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            className="rounded-lg border bg-white p-4 shadow-sm"
            initial={{ opacity: 0.8 }}
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.1,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                <div>
                  <div className="h-5 w-32 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                  <div className="mt-1 flex gap-2">
                    <div className="h-6 w-16 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                    <div className="h-6 w-20 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                  </div>
                </div>
              </div>
              <div className="h-6 w-6 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            </div>

            <div className="mt-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="h-4 w-full animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="h-9 flex-1 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
          <div className="h-8 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-7 w-7 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
              ></div>
            ))}
          </div>
          <div className="h-8 w-8 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        </div>

        <div className="h-4 w-24 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
      </div>
    </div>
  )
}

// Main Loading Component
const LoadingState = ({ showCategories = true }: { showCategories?: boolean }) => {
  return (
    <div className="relative mt-5 flex flex-col items-start gap-6 lg:flex-row">
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

export default function AgentManagementDashboard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>(TimeRange.Today)
  const { user } = useSelector((state: RootState) => state.auth)
  const { agentInfo, agentInfoLoading, agentInfoError, agentSummary, agentSummaryLoading, agentSummaryError } =
    useSelector((state: RootState) => state.agents)

  useEffect(() => {
    dispatch(fetchAgentInfo())
    dispatch(fetchAgentSummary())
  }, [dispatch])

  // Get the active period from agent summary based on the selected time range
  const activePeriod = agentSummary?.periods?.find((period) => period.range === activeTimeRange)

  // Fallback to the first available period if the selected one isn't present
  const kpiSource = activePeriod || agentSummary?.periods?.[0]

  // Derive KPI metrics for the summary cards from the summary data (AGENT_SUMMARY response)
  const summary = kpiSource ?? {
    collectedAmount: 0,
    collectedCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    cashClearedAmount: 0,
    cashClearanceCount: 0,
    billingDisputesRaised: 0,
    billingDisputesResolved: 0,
    changeRequestsRaised: 0,
    changeRequestsResolved: 0,
    outstandingCashEstimate: 0,
    collectionsByChannel: [],
  }

  // Format currency
  const formatSummaryCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(amount / 1000000) + "M"
    ) // Convert from kobo to millions
  }

  const formatDateTime = (value?: string | null) => {
    if (!value) return "N/A"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleAddAgentSuccess = async () => {
    setIsAddAgentModalOpen(false)
    // Refresh data after adding agent
    handleRefreshData()
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    Promise.all([dispatch(fetchAgentInfo()), dispatch(fetchAgentSummary())]).finally(() => {
      setIsLoading(false)
    })
  }

  const agentLastName = user?.fullName
    ? user.fullName
        .trim()
        .split(" ")
        .filter((part) => part.length > 0)
        .slice(-1)[0]
    : "Agent"

  const timeRanges = [
    { value: TimeRange.Today, label: "Today" },
    { value: TimeRange.Yesterday, label: "Yesterday" },
    { value: TimeRange.ThisWeek, label: "This Week" },
    { value: TimeRange.ThisMonth, label: "This Month" },
    { value: TimeRange.LastMonth, label: "Last Month" },
    { value: TimeRange.ThisYear, label: "This Year" },
    { value: TimeRange.AllTime, label: "All Time" },
  ]

  const getTimeRangeLabel = (range: TimeRange) => {
    const found = timeRanges.find((r) => r.value === range)
    return found ? found.label : range
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col px-3 lg:container sm:px-4 xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col justify-between gap-4 py-4 sm:py-6 md:flex-row md:gap-6">
              <div className="flex-1">
                <h4 className="text-xl font-semibold sm:text-2xl">Welcome {agentLastName}</h4>
                <p className="text-sm text-gray-600 sm:text-base">Overview of your monthly collections</p>
              </div>

              <motion.div
                className="flex items-center justify-start gap-3 md:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<VendingIconOutline color="white" />}
                  onClick={() => router.push("/sales-rep/vend")}
                >
                  <span className="hidden sm:inline">Vend</span>
                </ButtonModule>
                {(!agentInfo || agentInfo.cashAtHand < agentInfo.cashCollectionLimit) && (
                  <ButtonModule
                    variant="outline"
                    size="md"
                    className="w-full sm:w-auto"
                    icon={<CollectCash />}
                    onClick={() => router.push("/sales-rep/collect-payment")}
                  >
                    <span className="hidden sm:inline">Collect Payment</span>
                  </ButtonModule>
                )}

                <ButtonModule
                  variant="danger"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => router.push("/sales-rep/clear-cash")}
                >
                  <span className="hidden sm:inline">Clear Cash</span>
                </ButtonModule>
              </motion.div>
            </div>

            {/* Sales Rep Details - Cash at hand vs Collection limit */}
            {agentInfo && (
              <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Sales Rep Details</h3>
                    <p className="text-xs text-gray-500 sm:text-sm">
                      Cash at hand and collection limit for your profile
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                    <div className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                      Code: {agentInfo.agentCode}
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 font-medium ${
                        agentInfo.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      Status: {agentInfo.status}
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 font-medium ${
                        agentInfo.canCollectCash ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      Can Collect Cash: {agentInfo.canCollectCash ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 sm:text-sm">
                    <span>Cash at Hand vs Collection Limit</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(agentInfo.cashAtHand)} / {formatCurrency(agentInfo.cashCollectionLimit)}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200 sm:h-4">
                    {agentInfo.cashCollectionLimit > 0 && (
                      <div
                        className={`h-3 rounded-full transition-all duration-700 sm:h-4 ${
                          agentInfo.cashAtHand / agentInfo.cashCollectionLimit > 0.8
                            ? "bg-red-500"
                            : agentInfo.cashAtHand / agentInfo.cashCollectionLimit > 0.5
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min((agentInfo.cashAtHand / agentInfo.cashCollectionLimit) * 100, 100).toFixed(
                            1
                          )}%`,
                        }}
                      />
                    )}
                  </div>
                  {agentInfo.cashCollectionLimit > 0 && (
                    <div className="text-xs text-gray-500 sm:text-xs">
                      {((agentInfo.cashAtHand / agentInfo.cashCollectionLimit) * 100).toFixed(1)}% of limit used
                    </div>
                  )}
                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                      <div className="text-xs font-medium text-blue-600 sm:text-sm">Cash at Hand</div>
                      <div className="text-base font-bold text-blue-900 sm:text-lg">
                        {formatCurrency(agentInfo.cashAtHand)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3 sm:p-4">
                      <div className="text-xs font-medium text-emerald-600 sm:text-sm">Collection Limit</div>
                      <div className="text-base font-bold text-emerald-900 sm:text-lg">
                        {formatCurrency(agentInfo.cashCollectionLimit)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional agent details from AGENT_INFO */}
                <div className="mt-5">
                  <div className="grid gap-4 text-xs text-gray-600 sm:grid-cols-2 sm:text-sm">
                    <div className="space-y-1 rounded-lg bg-gray-50 p-3 sm:p-4">
                      <p className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-gray-500">Name</span>
                        <span className="truncate font-medium text-gray-800">{agentInfo.fullName}</span>
                      </p>
                      <p className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-gray-500">Phone</span>
                        <span className="truncate font-medium text-gray-800">{agentInfo.phoneNumber}</span>
                      </p>
                    </div>
                    <div className="space-y-1 rounded-lg bg-gray-50 p-3 sm:p-4">
                      <p className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-gray-500">Email</span>
                        <span className="truncate font-medium text-gray-800">{agentInfo.email}</span>
                      </p>
                      <p className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-gray-500">Last Updated</span>
                        <span className="truncate font-medium text-gray-800">
                          {formatDateTime(agentInfo.lastCashCollectionDate)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="mt-6">
              {/* Time Range Filters for Performance Summary */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Desktop: inline buttons */}
                <div className="hidden rounded-lg bg-white p-2 shadow-sm sm:block">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Performance Range:</span>
                    <div className="flex items-center gap-2">
                      {timeRanges.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setActiveTimeRange(range.value)}
                          className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                            activeTimeRange === range.value
                              ? "bg-[#004B23] text-white"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile: dropdown selector */}
                <div className="w-full sm:hidden">
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-500">Performance Range:</span>
                      <div className="relative">
                        <select
                          value={activeTimeRange}
                          onChange={(e) => setActiveTimeRange(e.target.value as TimeRange)}
                          className="block w-40 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {timeRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {agentInfoLoading || agentSummaryLoading ? (
                <>
                  <SkeletonLoader />
                  <LoadingState showCategories={true} />
                </>
              ) : (
                // Loaded State - Updated Agent Management Dashboard
                <>
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-full">
                      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Collections Summary Card */}
                        <motion.div
                          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center justify-between gap-2 border-b pb-4">
                            <div className="flex items-center gap-2">
                              <div className="text-blue-600">
                                <MetersProgrammedIcon />
                              </div>
                              <span className="text-sm font-medium sm:text-base">Collections Summary</span>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
                                {getTimeRangeLabel(activeTimeRange)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Amount Collected:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {formatSummaryCurrency(summary.collectedAmount)}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Collections Count:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {formatNumber(summary.collectedCount)}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Channels Used:</p>
                              <p className="text-secondary text-sm font-medium sm:text-base">
                                {formatNumber(summary.collectionsByChannel?.length ?? 0)}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Pending Collections Card */}
                        <motion.div
                          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center gap-2 border-b pb-4">
                            <div className="text-amber-600">
                              <MetersProgrammedIcon />
                            </div>
                            <span className="text-sm font-medium sm:text-base">Pending Collections</span>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Pending Amount:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {formatSummaryCurrency(summary.pendingAmount)}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Pending Count:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {formatNumber(summary.pendingCount)}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Outstanding Cash Est.:</p>
                              <p className="text-secondary text-sm font-medium sm:text-base">
                                {formatSummaryCurrency(summary.outstandingCashEstimate)}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Cash Clearance Card */}
                        <motion.div
                          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center gap-2 border-b pb-4">
                            <div className="text-green-600">
                              <VendingIcon />
                            </div>
                            <span className="text-sm font-medium sm:text-base">Cash Clearance</span>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Cash Cleared Amount:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {formatSummaryCurrency(summary.cashClearedAmount)}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Clearance Count:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {formatNumber(summary.cashClearanceCount)}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Billing & Change Requests Card */}
                        <motion.div
                          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center gap-2 border-b pb-4">
                            <div className="text-red-600">
                              <TamperIcon />
                            </div>
                            <span className="text-sm font-medium sm:text-base">Disputes & Changes</span>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Billing Disputes:</p>
                              <p className="text-secondary text-right text-sm font-medium sm:text-base">
                                {`${formatNumber(summary.billingDisputesRaised)} raised / ${formatNumber(
                                  summary.billingDisputesResolved
                                )} resolved`}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Change Requests:</p>
                              <p className="text-secondary text-right text-sm font-medium sm:text-base">
                                {`${formatNumber(summary.changeRequestsRaised)} raised / ${formatNumber(
                                  summary.changeRequestsResolved
                                )} resolved`}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-6"
                  >
                    <AllPaymentsTable agentId={agentInfo?.agentId} />
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={isAddAgentModalOpen}
        onRequestClose={() => setIsAddAgentModalOpen(false)}
        onSuccess={handleAddAgentSuccess}
      />
    </section>
  )
}
