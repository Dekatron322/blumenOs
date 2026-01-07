"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  clearAgingState,
  clearRecoverySummaryState,
  fetchAgingData,
  fetchRecoverySummary,
  selectAging,
  selectAgingError,
  selectAgingLoading,
  selectAgingPagination,
  selectAgingSuccess,
  selectRecoverySummary,
  selectRecoverySummaryError,
  selectRecoverySummaryLoading,
  selectRecoverySummarySuccess,
} from "lib/redux/debtManagementSlice"
import type {
  AgingDataItem,
  DebtManagementCustomersRequest,
  RecoverySummaryItem,
  RecoverySummaryRequest,
} from "lib/redux/debtManagementSlice"
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

  const selectedOption = options.find((opt) => opt.value === selectedValue)

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
const LoadingState = () => {
  return (
    <div className="mt-5 flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <TableSkeleton />
      </div>
    </div>
  )
}

// Debt Management Summary Component
const DebtManagementSummary = ({
  recoverySummary,
  recoverySummaryLoading,
  recoverySummaryError,
}: {
  recoverySummary: RecoverySummaryItem[]
  recoverySummaryLoading: boolean
  recoverySummaryError: string | null
}) => {
  // Calculate totals from recovery summary
  const totalRecoveredAmount = recoverySummary.reduce((sum, item) => sum + item.totalRecoveredAmount, 0)
  const totalRecoveries = recoverySummary.reduce((sum, item) => sum + item.totalRecoveries, 0)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
  }

  if (recoverySummaryLoading) {
    return (
      <motion.div
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 border-b pb-3">
          <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200"></div>
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (recoverySummaryError) {
    return (
      <motion.div
        className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-2">
            <svg className="size-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h5 className="text-sm font-medium text-red-800">Debt Recovery Error</h5>
            <p className="text-xs text-red-600">{recoverySummaryError}</p>
          </div>
        </div>
      </motion.div>
    )
  }
}

// Aging Data Component
const AgingData = ({
  agingData,
  agingLoading,
  agingError,
  pagination,
  onPageChange,
  onRefresh,
}: {
  agingData: AgingDataItem[]
  agingLoading: boolean
  agingError: string | null
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  onPageChange: (page: number) => void
  onRefresh: () => void
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getBucketColor = (maxDays: number) => {
    if (maxDays <= 30) return "text-green-600 bg-green-50"
    if (maxDays <= 60) return "text-yellow-600 bg-yellow-50"
    if (maxDays <= 90) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  if (agingLoading) {
    return (
      <motion.div
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between border-b pb-3">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="mt-4 space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (agingError) {
    return (
      <motion.div
        className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <svg className="size-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h5 className="text-sm font-medium text-red-800">Aging Data Error</h5>
              <p className="text-xs text-red-600">{agingError}</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-white shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-orange-100 p-2">
            <svg className="size-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-900">Debt Aging Analysis</h5>
            <p className="text-xs text-gray-500">Customer debt aging by time periods</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{pagination.totalCount} total accounts</span>
          <button
            onClick={onRefresh}
            className="rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
            title="Refresh aging data"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="divide-y">
        {agingData.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto size-12 text-gray-400">
              <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No aging data found</h3>
            <p className="mt-2 text-sm text-gray-500">No aging data available for the current period.</p>
          </div>
        ) : (
          agingData.map((item) => (
            <div key={item.customerId} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-orange-100">
                    <span className="text-sm font-medium text-orange-600">
                      {item.customerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h6 className="text-sm font-medium text-gray-900">{item.customerName}</h6>
                    <p className="text-xs text-gray-500">Account: {item.accountNumber}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-400">Max Age:</span>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getBucketColor(item.maxAgeDays)}`}>
                        {item.maxAgeDays} days
                      </span>
                      <span className="text-xs text-gray-400">Status:</span>
                      <span className="text-xs font-medium text-gray-600">{item.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">{formatCurrency(item.outstandingBalance)}</p>
                  <p className="text-xs text-gray-500">Total Outstanding</p>
                </div>
              </div>

              {/* Aging Buckets */}
              <div className="mt-4 border-t pt-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {item.buckets.map((bucket, index) => (
                    <div key={index} className="rounded-lg border p-2">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-medium text-gray-600">{bucket.name}</span>
                        <span className={`rounded px-1 py-0.5 text-xs font-medium ${getBucketColor(bucket.maxDays)}`}>
                          {bucket.maxDays}d
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-medium text-gray-900">{formatCurrency(bucket.amount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Count:</span>
                          <span className="font-medium text-gray-900">{bucket.entryCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-gray-500">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount}{" "}
            accounts
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevious}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function DebtAgingDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState<number>(480000) // Default 8 minutes (480,000 ms)

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

  // Aging state
  const agingData = useAppSelector(selectAging)
  const agingLoading = useAppSelector(selectAgingLoading)
  const agingError = useAppSelector(selectAgingError)
  const agingSuccess = useAppSelector(selectAgingSuccess)
  const agingPagination = useAppSelector(selectAgingPagination)

  // State for aging pagination
  const [agingPage, setAgingPage] = useState(1)
  const agingPageSize = 10

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

  // Fetch aging data
  useEffect(() => {
    const agingParams: DebtManagementCustomersRequest = {
      PageNumber: agingPage,
      PageSize: agingPageSize,
      SortDirection: 2, // Descending (highest debt first)
    }

    dispatch(fetchAgingData(agingParams))
  }, [dispatch, agingPage, agingPageSize])

  // Cleanup debt management state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearRecoverySummaryState())
      dispatch(clearAgingState())
    }
  }, [dispatch])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
  }

  const handleRefreshData = useCallback(() => {
    setIsLoading(true)

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

    const agingParams: DebtManagementCustomersRequest = {
      PageNumber: agingPage,
      PageSize: agingPageSize,
      SortDirection: 2,
    }

    dispatch(fetchRecoverySummary(recoveryParams))
    dispatch(fetchAgingData(agingParams))
    setTimeout(() => setIsLoading(false), 1000)
  }, [dispatch, selectedPeriod, agingPage, agingPageSize])

  const handleAgingPageChange = (page: number) => {
    setAgingPage(page)
  }

  const handleRefreshAging = () => {
    const agingParams: DebtManagementCustomersRequest = {
      PageNumber: agingPage,
      PageSize: agingPageSize,
      SortDirection: 2,
    }
    dispatch(fetchAgingData(agingParams))
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

        const agingParams: DebtManagementCustomersRequest = {
          PageNumber: agingPage,
          PageSize: agingPageSize,
          SortDirection: 2,
        }

        dispatch(fetchRecoverySummary(recoveryParams))
        dispatch(fetchAgingData(agingParams))
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
  }, [dispatch, isPolling, pollingInterval, selectedPeriod, agingPage, agingPageSize])

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full pb-20">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 2xl:container sm:px-3 xl:px-6 2xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col items-start justify-between gap-4 py-4 sm:py-6 md:gap-6 md:py-8 xl:flex-row xl:items-start">
              <div className="flex-1">
                <h4 className="text-lg font-semibold sm:text-xl md:text-2xl">Debt Aging Analysis</h4>
                <p className="text-sm text-gray-600 sm:text-base">Debt aging tracking and bucket analysis</p>
              </div>

              <motion.div
                className="flex flex-wrap items-center gap-3 xl:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center gap-3">
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
            {recoverySummaryError && (
              <motion.div
                className="mb-4 rounded-md bg-red-50 p-4 text-red-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm">Error loading debt recovery data: {recoverySummaryError}</p>
              </motion.div>
            )}

            {/* Main Content Area */}
            <div className="w-full">
              {recoverySummaryLoading || isLoading ? (
                // Loading State
                <>
                  <SkeletonLoader />
                  <LoadingState />
                  {/* Debt Management Summary Loading State */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="mt-6"
                  >
                    <DebtManagementSummary
                      recoverySummary={[]}
                      recoverySummaryLoading={true}
                      recoverySummaryError={null}
                    />
                  </motion.div>
                  {/* Debt Aging Data Loading State */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-6"
                  >
                    <AgingData
                      agingData={[]}
                      agingLoading={true}
                      agingError={null}
                      pagination={{
                        totalCount: 0,
                        totalPages: 0,
                        currentPage: 1,
                        pageSize: 10,
                        hasNext: false,
                        hasPrevious: false,
                      }}
                      onPageChange={() => {}}
                      onRefresh={() => {}}
                    />
                  </motion.div>
                </>
              ) : (
                // Loaded State - Debt Management Dashboard
                <>
                  {/* Debt Management Summary */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="mt-6"
                  >
                    <DebtManagementSummary
                      recoverySummary={recoverySummary}
                      recoverySummaryLoading={recoverySummaryLoading}
                      recoverySummaryError={recoverySummaryError}
                    />
                  </motion.div>

                  {/* Debt Aging Data */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-6"
                  >
                    <AgingData
                      agingData={agingData}
                      agingLoading={agingLoading}
                      agingError={agingError}
                      pagination={agingPagination}
                      onPageChange={handleAgingPageChange}
                      onRefresh={handleRefreshAging}
                    />
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
