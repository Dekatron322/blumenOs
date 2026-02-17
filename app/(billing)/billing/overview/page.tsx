"use client"

import React, { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FiSend } from "react-icons/fi"

import BillingInfo from "components/BillingInfo/BillingInfo"
import { BillingIcon, PostpaidIcon, RefreshCircleIcon } from "components/Icons/Icons"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import StartBillingRun from "components/ui/Modal/start-billing-run"

import ArrowIcon from "public/arrow-icon"

import {
  clearPostpaidBillingAnalytics,
  fetchPostpaidBillingAnalytics,
  setPostpaidBillingAnalyticsParams,
} from "lib/redux/analyticsSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import type { PostpaidBillingAnalyticsParams } from "lib/redux/analyticsSlice"
import type { BillingPeriod } from "lib/redux/billingPeriodsSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

// Dropdown Popover Component
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

  const _selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
                className={`block w-full px-3 py-2 text-left ${
                  option.value === selectedValue ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

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

// Enhanced Skeleton for Billing Analytics Cards
const BillingAnalyticsSkeleton = () => {
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
      {showAnalytics && <BillingAnalyticsSkeleton />}
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
    }, [dispatch, billingPeriods.length]) // Only fetch if no periods exist

    // Convert billing periods to dropdown format
    const periods = billingPeriods.map((period: BillingPeriod) => ({
      value: period.id, // Use id for API calls as expected by API
      label: period.displayName,
      periodKey: period.periodKey, // Keep periodKey for reference if needed
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
            className="flex min-w-[140px] items-center justify-between gap-2 rounded-md border border-[#004B23] bg-transparent px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23] sm:min-w-[160px]"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            disabled={periodsLoading}
          >
            <span className="truncate">
              {periodsLoading ? "Loading..." : periods.find((p) => p.value === selectedValue)?.label ?? selectedValue}
            </span>
            {!periodsLoading && (
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
            )}
            {periodsLoading && (
              <svg
                className="size-4 shrink-0 animate-spin text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
                <div className="max-h-60 overflow-y-auto">
                  {periodsLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-500">Loading periods...</div>
                  ) : periods.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">No periods available</div>
                  ) : (
                    periods.map((period) => (
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
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
)

PeriodSelector.displayName = "PeriodSelector"

export default function BillingDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [isStartBillingRunModalOpen, setIsStartBillingRunModalOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState<number>(480000) // Default 8 minutes (480,000 ms)

  const _getCurrentPeriod = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }

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
  }, [dispatch, selectedPeriod]) // Remove billingPeriods to prevent duplicate calls

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

    setIsLoading(true)
    const params: PostpaidBillingAnalyticsParams = {
      BillingPeriodId: selectedPeriod,
      Status: 1,
      Category: 2,
    }
    dispatch(clearPostpaidBillingAnalytics())
    dispatch(fetchPostpaidBillingAnalytics(params))
    setTimeout(() => setIsLoading(false), 1000)
  }, [dispatch, selectedPeriod])

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

    if (isPolling && selectedPeriod > 0 && !postpaidBillingAnalyticsLoading) {
      // Initial fetch only if not already loading
      const fetchData = () => {
        // Don't fetch if already loading to prevent duplicate calls
        if (!postpaidBillingAnalyticsLoading) {
          const params: PostpaidBillingAnalyticsParams = {
            BillingPeriodId: selectedPeriod,
            Status: 1,
            Category: 2,
          }
          dispatch(fetchPostpaidBillingAnalytics(params))
        }
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
  }, [dispatch, isPolling, pollingInterval, selectedPeriod, postpaidBillingAnalyticsLoading])

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
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col px-3 2xl:container sm:px-3 xl:px-6 2xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col items-start justify-between gap-4 py-4 sm:py-6 md:gap-6 md:py-8 xl:flex-row xl:items-start">
              <div className="flex-1">
                <h4 className="text-lg font-semibold sm:text-xl md:text-2xl">Billing Engine</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  Tariff management, bill generation, and billing cycles
                </p>
              </div>

              <motion.div
                className="flex flex-wrap items-center gap-3 xl:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <PeriodSelector currentPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />
                  {/* {canPublishBills && (
                    <ButtonModule
                      variant="primary"
                      size="md"
                      className="flex sm:flex-none"
                      icon={<FiSend />}
                      onClick={handleStartBillingRun}
                      disabled={postpaidBillingAnalyticsLoading}
                    >
                      <span className="hidden sm:inline">Publish Postpaid Bills</span>
                      <span className="sm:hidden">Publish</span>
                    </ButtonModule>
                  )} */}
                  {/* Polling Controls */}
                  <div className="flex items-center gap-2 rounded-md border-r bg-white p-2 pr-3">
                    <span className="text-sm font-medium text-gray-500">Auto-refresh:</span>
                    <button
                      onClick={togglePolling}
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        isPolling
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {isPolling ? (
                        <>
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          ON
                        </>
                      ) : (
                        <>
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          OFF
                        </>
                      )}
                    </button>

                    {isPolling && (
                      <DropdownPopover
                        options={pollingOptions}
                        selectedValue={pollingInterval}
                        onSelect={handlePollingIntervalChange}
                      >
                        <span className="text-sm font-medium">
                          {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                        </span>
                      </DropdownPopover>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Error Message */}
            {postpaidBillingAnalyticsError && (
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
                        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        {/* Bill Status Summary */}
                        <div className="rounded-lg bg-blue-50 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-800">Bill Status</p>
                              <p className="text-xl font-bold text-blue-900 sm:text-2xl">
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
                              <p className="text-xl font-bold text-green-900 sm:text-2xl">
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                  notation: "compact",
                                  maximumFractionDigits: 1,
                                }).format(postpaidBillingAnalyticsData.totalCurrentBillAmount)}
                              </p>
                            </div>
                            <div className="rounded-full bg-green-100 p-2">
                              <BillingIcon />
                            </div>
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
                              <p className="text-xl font-bold text-orange-900 sm:text-2xl">
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
                              <p className="text-xl font-bold text-purple-900 sm:text-2xl">
                                {formatNumber(postpaidBillingAnalyticsData.flaggedMeterReadings)}
                              </p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-2">
                              <BillingIcon />
                            </div>
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
                        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6 sm:p-8 md:p-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="text-center">
                          <div className="mx-auto size-12 text-gray-400">
                            <BillingIcon />
                          </div>
                          <h3 className="mt-4 text-lg font-medium text-gray-900">No Billing Data</h3>
                          <p className="mt-2 text-sm text-gray-500">
                            No postpaid billing analytics data available for the selected period.
                          </p>
                          <div className="mt-4">
                            <ButtonModule
                              variant="primary"
                              size="md"
                              onClick={handleRefreshData}
                              icon={<RefreshCircleIcon />}
                              iconPosition="start"
                            >
                              Refresh Data
                            </ButtonModule>
                          </div>
                        </div>
                      </motion.div>
                    )}
                </>
              )}
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
