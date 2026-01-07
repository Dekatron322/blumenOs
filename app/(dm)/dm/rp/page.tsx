"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  clearAgingState,
  clearPauseRecoveryPolicyState,
  clearRecoveryPoliciesState,
  clearRecoverySummaryState,
  clearResumeRecoveryPolicyState,
  fetchAgingData,
  fetchRecoveryPolicies,
  fetchRecoverySummary,
  pauseRecoveryPolicy,
  resumeRecoveryPolicy,
  selectAging,
  selectAgingError,
  selectAgingLoading,
  selectAgingPagination,
  selectAgingSuccess,
  selectPauseRecoveryPolicyLoading,
  selectRecoveryPolicies,
  selectRecoveryPoliciesError,
  selectRecoveryPoliciesLoading,
  selectRecoveryPoliciesPagination,
  selectRecoveryPoliciesSuccess,
  selectRecoverySummary,
  selectRecoverySummaryError,
  selectRecoverySummaryLoading,
  selectRecoverySummarySuccess,
  selectResumeRecoveryPolicyLoading,
} from "lib/redux/debtManagementSlice"
import type {
  AgingBucket,
  AgingDataItem,
  DebtManagementCustomersRequest,
  RecoveryPoliciesRequest,
  RecoveryPolicy,
  RecoverySummaryItem,
  RecoverySummaryRequest,
} from "lib/redux/debtManagementSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { ButtonModule } from "components/ui/Button/Button"
import { VscAdd, VscDebugPause, VscDebugStart } from "react-icons/vsc"
import { useRouter } from "next/navigation"
import PauseRecoveryPolicyModal from "components/ui/Modal/pause-recovery-policy-modal"
import ResumeRecoveryPolicyModal from "components/ui/Modal/resume-recovery-policy-modal"
import { notify } from "components/ui/Notification/Notification"

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

// Recovery Policies Component
const RecoveryPolicies = ({
  recoveryPolicies,
  recoveryPoliciesLoading,
  recoveryPoliciesError,
  pagination,
  onPageChange,
  onRefresh,
  onPausePolicy,
  pauseRecoveryPolicyLoading,
  onResumePolicy,
  resumeRecoveryPolicyLoading,
}: {
  recoveryPolicies: RecoveryPolicy[]
  recoveryPoliciesLoading: boolean
  recoveryPoliciesError: string | null
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
  onPausePolicy: (policy: RecoveryPolicy) => void
  pauseRecoveryPolicyLoading: boolean
  onResumePolicy: (policy: RecoveryPolicy) => void
  resumeRecoveryPolicyLoading: boolean
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getScopeLabel = (scope: number) => {
    switch (scope) {
      case 1:
        return "Global"
      case 2:
        return "Customer"
      case 3:
        return "Area Office"
      default:
        return "Unknown"
    }
  }

  const getRecoveryTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return "Percentage"
      case 2:
        return "Fixed Amount"
      case 3:
        return "Bucket Based"
      default:
        return "Unknown"
    }
  }

  const getEnforcementModeLabel = (mode: number) => {
    switch (mode) {
      case 1:
        return "Warning"
      case 2:
        return "Restriction"
      case 3:
        return "Disconnection"
      default:
        return "Unknown"
    }
  }

  if (recoveryPoliciesLoading) {
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

  if (recoveryPoliciesError) {
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
              <h5 className="text-sm font-medium text-red-800">Recovery Policies Error</h5>
              <p className="text-xs text-red-600">{recoveryPoliciesError}</p>
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
          <div className="rounded-full bg-blue-100 p-2">
            <svg className="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-900">Recovery Policies</h5>
            <p className="text-xs text-gray-500">Debt recovery policies and configurations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{pagination.totalCount} policies</span>
          <button
            onClick={onRefresh}
            className="rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
            title="Refresh recovery policies"
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
        {recoveryPolicies.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto size-12 text-gray-400">
              <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No recovery policies found</h3>
            <p className="mt-2 text-sm text-gray-500">No recovery policies are currently configured.</p>
          </div>
        ) : (
          recoveryPolicies.map((policy) => (
            <div key={policy.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-sm font-medium text-blue-600">{policy.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <h6 className="text-sm font-medium text-gray-900">{policy.name}</h6>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {/* <span className="text-xs text-gray-500">ID: {policy.id}</span> */}
                      {/* <span className="text-xs text-gray-400">•</span> */}
                      <span className="text-xs font-medium text-gray-600">{getScopeLabel(policy.scope)}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-medium text-gray-600">
                        {getRecoveryTypeLabel(policy.recoveryType)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          policy.isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {policy.isActive ? "Active" : "Inactive"}
                      </span>
                      {policy.isPaused && (
                        <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                          Paused
                        </span>
                      )}
                      {policy.enforcementEnabled && (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                          Enforcement
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">
                    {policy.recoveryType === 1 ? `${policy.recoveryValue}%` : formatCurrency(policy.recoveryValue)}
                  </p>
                  <p className="text-xs text-gray-500">Recovery Value</p>
                  <div className="mt-3 flex gap-2  pt-3">
                    {policy.isPaused ? (
                      <ButtonModule
                        size="sm"
                        variant="success"
                        icon={<VscDebugStart />}
                        onClick={() => onResumePolicy(policy)}
                        disabled={resumeRecoveryPolicyLoading}
                        className="flex items-center  rounded-md border   text-sm font-medium  transition-colors  disabled:cursor-not-allowed "
                      >
                        Resume Policy
                      </ButtonModule>
                    ) : (
                      <ButtonModule
                        size="sm"
                        variant="danger"
                        icon={<VscDebugPause />}
                        onClick={() => onPausePolicy(policy)}
                        disabled={pauseRecoveryPolicyLoading}
                        className="flex items-center  rounded-md border   text-sm font-medium  transition-colors  disabled:cursor-not-allowed "
                      >
                        Pause Policy
                      </ButtonModule>
                    )}
                  </div>
                </div>
              </div>

              {/* Policy Details */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Trigger Threshold</span>
                    <span className="text-xs font-bold text-gray-900">
                      {formatCurrency(policy.triggerThresholdAmount)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Min Monthly</span>
                    <span className="text-xs font-bold text-gray-900">
                      {formatCurrency(policy.minimumMonthlyRecovery)}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Min Recovery</span>
                    <span className="text-xs font-bold text-gray-900">{formatCurrency(policy.minRecoveryAmount)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Max Recovery</span>
                    <span className="text-xs font-bold text-gray-900">{formatCurrency(policy.maxRecoveryAmount)}</span>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Bucket</span>
                    <span className="text-xs font-bold text-gray-900">{policy.bucketName || "N/A"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Apply Before Bill</span>
                    <span className="text-xs font-bold text-gray-900">{policy.applyBeforeBill ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              {/* Enforcement Details */}
              {policy.enforcementEnabled && (
                <div className="mt-3 border-t pt-3">
                  <div className="mb-2 flex items-center gap-2">
                    <svg className="size-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-xs font-medium text-red-700">Enforcement Settings</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Mode:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {getEnforcementModeLabel(policy.enforcementMode)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Grace Days:</span>
                      <span className="text-xs font-medium text-gray-900">{policy.enforcementGraceDays}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Min Age:</span>
                      <span className="text-xs font-medium text-gray-900">{policy.enforcementMinAgeDays} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Monthly Min:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {formatCurrency(policy.enforcementMonthlyMinimum)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Effective Dates */}
              <div className="mt-3 border-t pt-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Effective: {formatDate(policy.effectiveFromUtc)} - {formatDate(policy.effectiveToUtc)}
                  </span>
                  <span>Created: {formatDate(policy.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
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
            policies
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
  const router = useRouter()

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

  // Recovery policies state
  const recoveryPolicies = useAppSelector(selectRecoveryPolicies)
  const recoveryPoliciesLoading = useAppSelector(selectRecoveryPoliciesLoading)
  const recoveryPoliciesError = useAppSelector(selectRecoveryPoliciesError)
  const recoveryPoliciesSuccess = useAppSelector(selectRecoveryPoliciesSuccess)
  const recoveryPoliciesPagination = useAppSelector(selectRecoveryPoliciesPagination)
  const pauseRecoveryPolicyLoading = useAppSelector(selectPauseRecoveryPolicyLoading)
  const resumeRecoveryPolicyLoading = useAppSelector(selectResumeRecoveryPolicyLoading)

  // Pause modal state
  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<RecoveryPolicy | null>(null)

  // Resume modal state
  const [resumeModalOpen, setResumeModalOpen] = useState(false)
  const [selectedResumePolicy, setSelectedResumePolicy] = useState<RecoveryPolicy | null>(null)

  // State for pagination
  const [agingPage, setAgingPage] = useState(1)
  const agingPageSize = 10
  const [recoveryPoliciesPage, setRecoveryPoliciesPage] = useState(1)
  const recoveryPoliciesPageSize = 10

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

  // Fetch recovery policies data
  useEffect(() => {
    const recoveryPoliciesParams: RecoveryPoliciesRequest = {
      PageNumber: recoveryPoliciesPage,
      PageSize: recoveryPoliciesPageSize,
    }

    dispatch(fetchRecoveryPolicies(recoveryPoliciesParams))
  }, [dispatch, recoveryPoliciesPage, recoveryPoliciesPageSize])

  // Cleanup debt management state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearRecoverySummaryState())
      dispatch(clearAgingState())
      dispatch(clearRecoveryPoliciesState())
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

    const recoveryPoliciesParams: RecoveryPoliciesRequest = {
      PageNumber: recoveryPoliciesPage,
      PageSize: recoveryPoliciesPageSize,
    }

    dispatch(fetchRecoverySummary(recoveryParams))
    dispatch(fetchAgingData(agingParams))
    dispatch(fetchRecoveryPolicies(recoveryPoliciesParams))
    setTimeout(() => setIsLoading(false), 1000)
  }, [dispatch, selectedPeriod, agingPage, agingPageSize, recoveryPoliciesPage, recoveryPoliciesPageSize])

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

  const handleRecoveryPoliciesPageChange = (page: number) => {
    setRecoveryPoliciesPage(page)
  }

  const handleRefreshRecoveryPolicies = () => {
    const recoveryPoliciesParams: RecoveryPoliciesRequest = {
      PageNumber: recoveryPoliciesPage,
      PageSize: recoveryPoliciesPageSize,
    }
    dispatch(fetchRecoveryPolicies(recoveryPoliciesParams))
  }

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const handlePollingIntervalChange = (interval: number) => {
    setPollingInterval(interval)
  }

  // Pause recovery policy handlers
  const handlePausePolicy = (policy: RecoveryPolicy) => {
    setSelectedPolicy(policy)
    setPauseModalOpen(true)
  }

  const handlePauseConfirm = () => {
    if (selectedPolicy) {
      dispatch(pauseRecoveryPolicy(selectedPolicy.id))
        .unwrap()
        .then(() => {
          // Show success notification
          notify("success", "Policy paused successfully")

          // Refresh the recovery policies list
          const recoveryPoliciesParams: RecoveryPoliciesRequest = {
            PageNumber: recoveryPoliciesPage,
            PageSize: recoveryPoliciesPageSize,
          }
          dispatch(fetchRecoveryPolicies(recoveryPoliciesParams))
        })
        .catch((error) => {
          console.error("Failed to pause policy:", error)
        })
    }
  }

  const handleClosePauseModal = () => {
    setPauseModalOpen(false)
    setSelectedPolicy(null)
    dispatch(clearPauseRecoveryPolicyState())
  }

  // Resume recovery policy handlers
  const handleResumePolicy = (policy: RecoveryPolicy) => {
    setSelectedResumePolicy(policy)
    setResumeModalOpen(true)
  }

  const handleResumeConfirm = async () => {
    if (selectedResumePolicy) {
      try {
        await dispatch(resumeRecoveryPolicy(selectedResumePolicy.id)).unwrap()

        // Show success notification
        notify("success", "Policy resumed successfully")

        // Refresh the recovery policies list
        const recoveryPoliciesParams: RecoveryPoliciesRequest = {
          PageNumber: recoveryPoliciesPage,
          PageSize: recoveryPoliciesPageSize,
        }
        dispatch(fetchRecoveryPolicies(recoveryPoliciesParams))

        // Close the modal after successful operation
        handleCloseResumeModal()
      } catch (error) {
        console.error("Failed to resume policy:", error)
        // Don't close the modal on error, let user try again
      }
    }
  }

  const handleCloseResumeModal = () => {
    setResumeModalOpen(false)
    setSelectedResumePolicy(null)
    dispatch(clearResumeRecoveryPolicyState())
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

        const recoveryPoliciesParams: RecoveryPoliciesRequest = {
          PageNumber: recoveryPoliciesPage,
          PageSize: recoveryPoliciesPageSize,
        }

        dispatch(fetchRecoverySummary(recoveryParams))
        dispatch(fetchAgingData(agingParams))
        dispatch(fetchRecoveryPolicies(recoveryPoliciesParams))
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
  }, [
    dispatch,
    isPolling,
    pollingInterval,
    selectedPeriod,
    agingPage,
    agingPageSize,
    recoveryPoliciesPage,
    recoveryPoliciesPageSize,
  ])

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full pb-20">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 2xl:container sm:px-3 xl:px-6 2xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col items-start justify-between gap-4 py-4 sm:py-6 md:gap-6 md:py-8 xl:flex-row xl:items-start">
              <div className="flex-1">
                <h4 className="text-lg font-semibold sm:text-xl md:text-2xl">Recovery Policies</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  Debt recovery policies and configurations management
                </p>
              </div>

              <motion.div
                className="flex flex-wrap items-center gap-3 xl:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  {/* Polling Controls */}
                  <ButtonModule variant="primary" size="md" icon={<VscAdd />} onClick={() => router.push("/dm/rp/add")}>
                    Add Recovery Policy
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

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-6"
                  >
                    <RecoveryPolicies
                      recoveryPolicies={[]}
                      recoveryPoliciesLoading={true}
                      recoveryPoliciesError={null}
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
                      onPausePolicy={() => {}}
                      pauseRecoveryPolicyLoading={false}
                      onResumePolicy={() => {}}
                      resumeRecoveryPolicyLoading={false}
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

                  {/* Recovery Policies */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-6"
                  >
                    <RecoveryPolicies
                      recoveryPolicies={recoveryPolicies}
                      recoveryPoliciesLoading={recoveryPoliciesLoading}
                      recoveryPoliciesError={recoveryPoliciesError}
                      pagination={recoveryPoliciesPagination}
                      onPageChange={handleRecoveryPoliciesPageChange}
                      onRefresh={handleRefreshRecoveryPolicies}
                      onPausePolicy={handlePausePolicy}
                      pauseRecoveryPolicyLoading={pauseRecoveryPolicyLoading}
                      onResumePolicy={handleResumePolicy}
                      resumeRecoveryPolicyLoading={resumeRecoveryPolicyLoading}
                    />
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pause Recovery Policy Modal */}
      <PauseRecoveryPolicyModal
        isOpen={pauseModalOpen}
        onRequestClose={handleClosePauseModal}
        onConfirm={handlePauseConfirm}
        policyId={selectedPolicy?.id || 0}
        policyName={selectedPolicy?.name || ""}
        customerName={selectedPolicy?.customerId ? `Customer ID: ${selectedPolicy.customerId}` : undefined}
        onSuccess={() => {
          // Refresh data after successful pause
          handleRefreshRecoveryPolicies()
        }}
      />

      {/* Resume Recovery Policy Modal */}
      <ResumeRecoveryPolicyModal
        isOpen={resumeModalOpen}
        onRequestClose={handleCloseResumeModal}
        onConfirm={handleResumeConfirm}
        policyId={selectedResumePolicy?.id || 0}
        policyName={selectedResumePolicy?.name || ""}
        customerName={selectedResumePolicy?.customerId ? `Customer ID: ${selectedResumePolicy.customerId}` : undefined}
      />
    </section>
  )
}
