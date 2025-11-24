"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BillingIcon, PlayIcon, PostpaidIcon, RefreshCircleIcon } from "components/Icons/Icons"
import { ButtonModule } from "components/ui/Button/Button"
import BillingInfo from "components/BillingInfo/BillingInfo"
import StartBillingRun from "components/ui/Modal/start-billing-run"
import {
  clearPostpaidBillingAnalytics,
  fetchPostpaidBillingAnalytics,
  setPostpaidBillingAnalyticsParams,
} from "lib/redux/analyticsSlice"
import type { PostpaidBillingAnalyticsParams } from "lib/redux/analyticsSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

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

// Enhanced Skeleton for Billing Analytics Cards
const BillingAnalyticsSkeleton = () => {
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

// Main Loading Component
const LoadingState = ({ showAnalytics = true }) => {
  return (
    <div className="flex-3 relative mt-5 flex items-start gap-6">
      {showAnalytics ? (
        <>
          <TableSkeleton />
          <BillingAnalyticsSkeleton />
        </>
      ) : (
        <div className="w-full">
          <TableSkeleton />
        </div>
      )}
    </div>
  )
}

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
      className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex w-full max-sm:flex-col">
        <div className="w-full">
          <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
            {/* Total Bills Card */}
            <motion.div
              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                <BillingIcon />
                <span className="font-medium">Total Bills</span>
              </div>
              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">All Bills:</p>
                  <p className="text-secondary text-xl font-bold">{formatNumber(analyticsData.totalBills)}</p>
                </div>
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Finalized:</p>
                  <p className="text-secondary font-medium">
                    {formatNumber(analyticsData.finalizedBills)} (
                    {calculatePercentage(analyticsData.finalizedBills, analyticsData.totalBills)}%)
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Revenue Summary Card */}
            <motion.div
              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                {/* <AnalyticsIcon /> */}
                <span className="font-medium">Revenue Summary</span>
              </div>
              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Current Bill:</p>
                  <p className="text-secondary text-xl font-bold">
                    {formatCurrency(analyticsData.totalCurrentBillAmount)}
                  </p>
                </div>
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Total Due:</p>
                  <p className="text-secondary font-medium">{formatCurrency(analyticsData.totalAmountDue)}</p>
                </div>
              </div>
            </motion.div>

            {/* Consumption Card */}
            <motion.div
              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                <PostpaidIcon />
                <span className="font-medium">Consumption</span>
              </div>
              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Total kWh:</p>
                  <p className="text-secondary text-xl font-bold">{formatNumber(analyticsData.totalConsumptionKwh)}</p>
                </div>
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Forecast:</p>
                  <p className="text-secondary font-medium">{formatNumber(analyticsData.forecastConsumptionKwh)} kWh</p>
                </div>
              </div>
            </motion.div>

            {/* Disputes & Adjustments Card */}
            <motion.div
              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                {/* <DisputeIcon /> */}
                <span className="font-medium">Disputes & Adjustments</span>
              </div>
              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Active Disputes:</p>
                  <div className="flex gap-1">
                    <p className="text-secondary font-medium">{formatNumber(analyticsData.activeDisputes)}</p>
                    <ArrowIcon />
                  </div>
                </div>
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Adjustments:</p>
                  <p className="text-secondary font-medium">{formatCurrency(analyticsData.totalAdjustmentsApplied)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
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
    <div className="flex items-center gap-3">
      <label htmlFor="period-select" className="text-sm font-medium text-gray-700">
        Billing Period:
      </label>
      <div className="relative">
        <button
          id="period-select"
          type="button"
          className="flex min-w-[160px] items-center justify-between gap-2 rounded-md border border-[#0a0a0a] bg-transparent px-3 py-2 text-sm focus:border-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
          <span>{periods.find((p) => p.value === selectedValue)?.label ?? selectedValue}</span>
          <svg
            className="size-4 text-gray-500"
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
          <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
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
        )}
      </div>
    </div>
  )
}

export default function BillingDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [isStartBillingRunModalOpen, setIsStartBillingRunModalOpen] = useState(false)

  const getCurrentPeriod = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }

  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => getCurrentPeriod())

  // Redux hooks
  const dispatch = useAppDispatch()
  const {
    postpaidBillingAnalyticsData,
    postpaidBillingAnalyticsLoading,
    postpaidBillingAnalyticsError,
    postpaidBillingAnalyticsParams,
  } = useAppSelector((state) => state.analytics)

  // Fetch postpaid billing analytics on component mount and when period changes
  useEffect(() => {
    const params: PostpaidBillingAnalyticsParams = {
      period: selectedPeriod,
      status: 1, // Finalized bills
      category: 2, // Postpaid category
    }
    dispatch(setPostpaidBillingAnalyticsParams(params))
    dispatch(fetchPostpaidBillingAnalytics(params))
  }, [dispatch, selectedPeriod])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    const params: PostpaidBillingAnalyticsParams = {
      period: selectedPeriod,
      status: 1,
      category: 2,
    }
    dispatch(clearPostpaidBillingAnalytics())
    dispatch(fetchPostpaidBillingAnalytics(params))
    setTimeout(() => setIsLoading(false), 1000)
  }

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

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            {/* Page Header - Always Visible */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Billing Engine</h4>
                <p>Tariff management, bill generation, and billing cycles</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <PeriodSelector currentPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />
                <ButtonModule
                  variant="outline"
                  size="md"
                  icon={<PlayIcon />}
                  onClick={handleStartBillingRun}
                  disabled={postpaidBillingAnalyticsLoading}
                >
                  Publish Billing Run
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={handleRefreshData}
                  icon={<RefreshCircleIcon />}
                  iconPosition="start"
                  disabled={postpaidBillingAnalyticsLoading || isLoading}
                >
                  {postpaidBillingAnalyticsLoading || isLoading ? "Refreshing..." : "Refresh Data"}
                </ButtonModule>
              </motion.div>
            </div>

            {/* Error Message */}
            {postpaidBillingAnalyticsError && (
              <motion.div
                className="mx-16 mb-4 rounded-md bg-red-50 p-4 text-red-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p>Error loading billing analytics: {postpaidBillingAnalyticsError}</p>
              </motion.div>
            )}

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                {postpaidBillingAnalyticsLoading || isLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showAnalytics={true} />
                  </>
                ) : (
                  // Loaded State - Billing Dashboard
                  <>
                    {postpaidBillingAnalyticsData && (
                      <>
                        <PostpaidBillingAnalyticsCards analyticsData={postpaidBillingAnalyticsData} />

                        {/* Additional Metrics Summary */}
                        <motion.div
                          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          {/* Bill Status Summary */}
                          <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-800">Bill Status</p>
                                <p className="text-2xl font-bold text-blue-900">
                                  {formatNumber(postpaidBillingAnalyticsData.finalizedBills)} /{" "}
                                  {formatNumber(postpaidBillingAnalyticsData.totalBills)}
                                </p>
                              </div>
                              <div className="rounded-full bg-blue-100 p-2">
                                <BillingIcon />
                              </div>
                            </div>
                            <p className="mt-2 text-xs text-blue-600">
                              {formatNumber(postpaidBillingAnalyticsData.draftBills)} draft,{" "}
                              {formatNumber(postpaidBillingAnalyticsData.reversedBills)} reversed
                            </p>
                          </div>

                          {/* Financial Overview */}
                          <div className="rounded-lg bg-green-50 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-800">Revenue</p>
                                <p className="text-2xl font-bold text-green-900">
                                  {new Intl.NumberFormat("en-NG", {
                                    style: "currency",
                                    currency: "NGN",
                                    notation: "compact",
                                    maximumFractionDigits: 1,
                                  }).format(postpaidBillingAnalyticsData.totalCurrentBillAmount)}
                                </p>
                              </div>
                              {/* <div className="rounded-full bg-green-100 p-2">
                                <AnalyticsIcon />
                              </div> */}
                            </div>
                            <p className="mt-2 text-xs text-green-600">
                              VAT:{" "}
                              {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                                notation: "compact",
                                maximumFractionDigits: 1,
                              }).format(postpaidBillingAnalyticsData.totalVatAmount)}
                            </p>
                          </div>

                          {/* Consumption Metrics */}
                          <div className="rounded-lg bg-orange-50 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-orange-800">Energy Consumption</p>
                                <p className="text-2xl font-bold text-orange-900">
                                  {formatNumber(postpaidBillingAnalyticsData.totalConsumptionKwh)} kWh
                                </p>
                              </div>
                              <div className="rounded-full bg-orange-100 p-2">
                                <PostpaidIcon />
                              </div>
                            </div>
                            <p className="mt-2 text-xs text-orange-600">
                              {formatNumber(postpaidBillingAnalyticsData.estimatedBills)} estimated bills
                            </p>
                          </div>

                          {/* Quality Metrics */}
                          <div className="rounded-lg bg-purple-50 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-purple-800">Data Quality</p>
                                <p className="text-2xl font-bold text-purple-900">
                                  {formatNumber(postpaidBillingAnalyticsData.flaggedMeterReadings)}
                                </p>
                              </div>
                              {/* <div className="rounded-full bg-purple-100 p-2">
                                <DisputeIcon />
                              </div> */}
                            </div>
                            <p className="mt-2 text-xs text-purple-600">
                              {formatNumber(postpaidBillingAnalyticsData.activeDisputes)} active disputes
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="mt-6"
                        >
                          <BillingInfo />
                        </motion.div>
                      </>
                    )}

                    {/* Empty State */}
                    {!postpaidBillingAnalyticsData &&
                      !postpaidBillingAnalyticsLoading &&
                      !postpaidBillingAnalyticsError && (
                        <motion.div
                          className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-12"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="text-center">
                            <BillingIcon />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No Billing Data</h3>
                            <p className="mt-2 text-sm text-gray-500">
                              No postpaid billing analytics data available for the selected period.
                            </p>
                            <ButtonModule
                              variant="primary"
                              size="md"
                              onClick={handleRefreshData}
                              className="mt-4"
                              icon={<RefreshCircleIcon />}
                              iconPosition="start"
                            >
                              Refresh Data
                            </ButtonModule>
                          </div>
                        </motion.div>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <StartBillingRun
        isOpen={isStartBillingRunModalOpen}
        onRequestClose={() => setIsStartBillingRunModalOpen(false)}
        onSuccess={handleBillingRunSuccess}
      />
    </section>
  )
}
