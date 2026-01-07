"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
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
  RecoverySummaryRequest,
  RecoverySummaryItem,
} from "lib/redux/debtManagementSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { ButtonModule } from "components/ui/Button/Button"
import { VscAdd, VscEye } from "react-icons/vsc"
import RecordDebtModal from "components/ui/Modal/record-debt-modal"
import ViewDebtEntryModal from "components/ui/Modal/view-debt-entry-modal"
import DebtManagementInfo from "components/DebtManagementInfo/DebtManagementInfo"

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

  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-indigo-100 p-2">
            <svg className="size-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-900">Debt Recovery Summary</h5>
            <p className="text-xs text-gray-500">Current period recovery performance</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Recovered</span>
          <span className="text-sm font-semibold text-green-600">{formatCurrency(totalRecoveredAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Recovery Count</span>
          <span className="text-sm font-semibold text-indigo-600">{totalRecoveries.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Average Recovery</span>
          <span className="text-sm font-semibold text-gray-900">
            {totalRecoveries > 0 ? formatCurrency(totalRecoveredAmount / totalRecoveries) : formatCurrency(0)}
          </span>
        </div>
      </div>

      {recoverySummary.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <p className="mb-2 text-xs text-gray-500">Recovery by Period:</p>
          <div className="space-y-1">
            {recoverySummary.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-600">{item.periodKey}</span>
                <span className="font-medium text-gray-900">{formatCurrency(item.totalRecoveredAmount)}</span>
              </div>
            ))}
            {recoverySummary.length > 3 && (
              <p className="text-xs italic text-gray-400">+{recoverySummary.length - 3} more periods...</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function DebtManagementDashboard() {
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

    const customersParams: DebtManagementCustomersRequest = {
      PageNumber: customersPage,
      PageSize: customersPageSize,
      SortDirection: 2,
    }

    dispatch(fetchRecoverySummary(recoveryParams))
    dispatch(fetchDebtManagementCustomers(customersParams))
    setTimeout(() => setIsLoading(false), 1000)
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

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full pb-20">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 2xl:container sm:px-3 xl:px-6 2xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col items-start justify-between gap-4 py-4 sm:py-6 md:gap-6 md:py-8 xl:flex-row xl:items-start">
              <div className="flex-1">
                <h4 className="text-lg font-semibold sm:text-xl md:text-2xl">Debt Management</h4>
                <p className="text-sm text-gray-600 sm:text-base">Debt recovery tracking and management</p>
              </div>

              <motion.div
                className="flex flex-wrap items-center gap-3 xl:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  {/* Polling Controls */}
                  <ButtonModule
                    variant="primary"
                    size="md"
                    icon={<VscAdd />}
                    iconPosition="start"
                    onClick={() => {
                      // For now, open with a placeholder customer ID
                      // In a real implementation, you might want a customer selection modal
                      handleOpenRecordDebtModal(0, "Select Customer", "")
                    }}
                  >
                    Record Debt
                  </ButtonModule>
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

                  {/* Debt Management Tabbed Interface */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
                </>
              )}
            </div>
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
    </section>
  )
}
