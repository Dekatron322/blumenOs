"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  clearCustomersState,
  clearRecoverySummaryState,
  fetchDebtManagementCustomers,
  fetchRecoverySummary,
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
  DebtManagementCustomer,
  DebtManagementCustomersRequest,
  RecoverySummaryItem,
  RecoverySummaryRequest,
} from "lib/redux/debtManagementSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { ArrowLeft, ChevronDown, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import Dropdown from "components/Dropdown/Dropdown"
import { fetchCustomers } from "lib/redux/customerSlice"
import { SearchModule } from "components/ui/Search/search-module"

// Date Range Filter Component
const DateRangeFilter = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: {
  label: string
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="mt-1 block text-xs text-gray-500">From</span>
        </div>
        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="mt-1 block text-xs text-gray-500">To</span>
        </div>
      </div>
    </div>
  )
}

// Filter Sidebar Component for Mobile and Desktop
const FilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  sortOptions,
  amountRange,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  handleSortChange: (option: { label: string; value: string; order: "asc" | "desc" }) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  sortOptions: { label: string; value: string; order: "asc" | "desc" }[]
  amountRange: { min: number; max: number }
}) => {
  const [isSortExpanded, setIsSortExpanded] = useState(true)
  const [isDateRangeExpanded, setIsDateRangeExpanded] = useState(false)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex max-h-screen w-full max-w-sm flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed at top */}
            <div className="shrink-0 border-b bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold">Filters & Sorting</h2>
                    {getActiveFilterCount() > 0 && (
                      <p className="text-xs text-gray-500">{getActiveFilterCount()} active filter(s)</p>
                    )}
                  </div>
                </div>
                <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">
                  Clear All
                </button>
              </div>
            </div>

            {/* Filter Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {/* Search Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Search</label>
                  <input
                    type="text"
                    value={localFilters.search || ""}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    placeholder="Search by name or account number"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Customer ID Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Customer ID</label>
                  <input
                    type="number"
                    value={localFilters.customerId || ""}
                    onChange={(e) => handleFilterChange("customerId", e.target.value ? Number(e.target.value) : "")}
                    placeholder="Enter customer ID"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Amount Range Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Outstanding Balance Range (NGN)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Min:</span>
                      <input
                        type="number"
                        value={localFilters.minDebt || ""}
                        onChange={(e) => handleFilterChange("minDebt", e.target.value ? Number(e.target.value) : "")}
                        placeholder="0"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Max:</span>
                      <input
                        type="number"
                        value={localFilters.maxDebt || ""}
                        onChange={(e) => handleFilterChange("maxDebt", e.target.value ? Number(e.target.value) : "")}
                        placeholder="No limit"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsDateRangeExpanded(!isDateRangeExpanded)}
                    className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-700"
                  >
                    <span>Last Activity Date Range</span>
                    <ChevronDown className={`size-4 transition-transform ${isDateRangeExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {isDateRangeExpanded && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <DateRangeFilter
                        label="Last Ledger Date"
                        startDate={localFilters.lastLedgerStartDate || ""}
                        endDate={localFilters.lastLedgerEndDate || ""}
                        onStartDateChange={(date) => handleFilterChange("lastLedgerStartDate", date)}
                        onEndDateChange={(date) => handleFilterChange("lastLedgerEndDate", date)}
                      />
                    </div>
                  )}
                </div>

                {/* Sort Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsSortExpanded(!isSortExpanded)}
                    className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-700"
                  >
                    <span>Sort By</span>
                    <ChevronDown className={`size-4 transition-transform ${isSortExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {isSortExpanded && (
                    <div className="space-y-2">
                      {sortOptions.map((option) => (
                        <button
                          key={`${option.value}-${option.order}`}
                          onClick={() => handleSortChange(option)}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                              ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>{option.label}</span>
                          {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                            <span className="text-purple-600">
                              {option.order === "asc" ? (
                                <SortAsc className="size-4" />
                              ) : (
                                <SortDesc className="size-4" />
                              )}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons - Fixed at bottom */}
            <div className="shrink-0 border-t bg-white p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Filter className="size-4" />
                    Apply Filters
                  </div>
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <div className="flex items-center justify-center gap-2">
                    <X className="size-4" />
                    Reset All
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

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
          <div className="size-6 animate-pulse rounded-full bg-gray-200"></div>
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

// Debt Management Customers Component
const DebtManagementCustomers = ({
  customers,
  customersLoading,
  customersError,
  pagination,
  onPageChange,
  onRefresh,
  searchInput,
  onSearchChange,
  onSearchCancel,
  onManualSearch,
  viewMode,
  onViewModeChange,
  onPageSizeChange,
  getActiveFilterCount,
  resetFilters,
}: {
  customers: DebtManagementCustomer[]
  customersLoading: boolean
  customersError: string | null
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
  searchInput: string
  onSearchChange: (value: string) => void
  onSearchCancel: () => void
  onManualSearch: () => void
  viewMode: "list" | "grid"
  onViewModeChange: (mode: "list" | "grid") => void
  onPageSizeChange: (size: number) => void
  getActiveFilterCount: () => number
  resetFilters: () => void
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

  const getDebtStyle = (amount: number) => {
    if (amount === 0) {
      return "border border-emerald-200 bg-emerald-100 text-emerald-700"
    } else if (amount <= 5000) {
      return "border border-amber-200 bg-amber-100 text-amber-700"
    } else {
      return "border border-red-200 bg-red-100 text-red-700"
    }
  }

  const handleViewDetails = (customer: DebtManagementCustomer) => {
    // Navigate to customer details in the same page
    window.location.href = `/customers/${customer.customerId}`
  }

  const getPageItems = (): (number | string)[] => {
    const total = pagination.totalPages
    const current = pagination.currentPage
    const items: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    items.push(1)
    const showLeftEllipsis = current > 4
    const showRightEllipsis = current < total - 3

    if (!showLeftEllipsis) {
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      items.push("...", total - 3, total - 2, total - 1)
    } else {
      items.push("...", current - 1, current, current + 1, "...")
    }

    if (!items.includes(total)) {
      items.push(total)
    }

    return items
  }

  if (customersLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#004B23]"></div>
          <p className="text-sm text-gray-500">Loading customers...</p>
        </div>
      </div>
    )
  }

  if (customersError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
            <svg className="size-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">Failed to load customers</p>
            <p className="mt-1 text-sm text-gray-500">{customersError}</p>
          </div>
          <button
            onClick={onRefresh}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* View Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <button
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            viewMode === "list"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => onViewModeChange("list")}
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="hidden sm:inline">List</span>
        </button>
        <button
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            viewMode === "grid"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => onViewModeChange("grid")}
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          <span className="hidden sm:inline">Grid</span>
        </button>
      </div>

      {/* Customer Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mx-auto size-12 text-gray-400">
                  <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">No customers found</h3>
                <p className="text-sm text-gray-500">
                  {searchInput
                    ? "No customers match your search criteria."
                    : "No customers with outstanding balances in the current period."}
                </p>
                {searchInput && (
                  <button
                    onClick={resetFilters}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.customerId}
                className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm"
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100">
                      <span className="text-sm font-semibold text-indigo-600">
                        {customer.customerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{customer.customerName}</h3>
                      <p className="text-xs text-gray-500">{customer.accountNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Outstanding:</span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getDebtStyle(
                        customer.outstandingBalance
                      )}`}
                    >
                      {formatCurrency(customer.outstandingBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Debits:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(customer.totalDebits)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(customer.totalCredits)}</span>
                  </div>
                </div>

                {/* Last Activity */}
                {customer.lastLedgerAtUtc && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500">Last activity: {formatDate(customer.lastLedgerAtUtc)}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3">
                  <button
                    onClick={() => handleViewDetails(customer)}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Account
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Outstanding
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Debits
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Credits
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Last Activity
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="mx-auto size-12 text-gray-400">
                        <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">No customers found</h3>
                      <p className="text-sm text-gray-500">
                        {searchInput
                          ? "No customers match your search criteria."
                          : "No customers with outstanding balances in the current period."}
                      </p>
                      {searchInput && (
                        <button
                          onClick={resetFilters}
                          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.customerId} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100">
                          <span className="text-xs font-semibold text-indigo-600">
                            {customer.customerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.customerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.accountNumber}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getDebtStyle(
                          customer.outstandingBalance
                        )}`}
                      >
                        {formatCurrency(customer.outstandingBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(customer.totalDebits)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(customer.totalCredits)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {customer.lastLedgerAtUtc ? formatDate(customer.lastLedgerAtUtc) : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {customers.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Rows per page:</span>
            <div className="relative">
              <select
                name="pageSize"
                value={pagination.pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-9 w-16 cursor-pointer appearance-none rounded-md border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value={6}>6 rows</option>
                <option value={10}>10 rows</option>
                <option value={12}>12 rows</option>
                <option value={18}>18 rows</option>
                <option value={24}>24 rows</option>
                <option value={50}>50 rows</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
                <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`flex size-8 items-center justify-center rounded-md border ${
                pagination.currentPage === 1
                  ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {getPageItems().map((item, index) =>
                typeof item === "number" ? (
                  <button
                    key={item}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      pagination.currentPage === item
                        ? "bg-[#004B23] font-medium text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => onPageChange(item)}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={`ellipsis-${index}`} className="px-1 text-sm text-gray-500">
                    {item}
                  </span>
                )
              )}
            </div>

            <button
              className={`flex size-8 items-center justify-center rounded-md border ${
                pagination.currentPage === pagination.totalPages
                  ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DebtManagementDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState<number>(480000) // Default 8 minutes (480,000 ms)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // Initialize selectedPeriod with a stable value
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  })

  // State for customers pagination
  const [customersPage, setCustomersPage] = useState(1)
  const [customersPageSize, setCustomersPageSize] = useState(10)

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

  // Customer dropdown state
  const allCustomers = useAppSelector((state) => state.customers.customers)
  const allCustomersLoading = useAppSelector((state) => state.customers.loading)
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false)

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    search: "",
    customerId: "",
    minDebt: "",
    maxDebt: "",
    lastLedgerStartDate: "",
    lastLedgerEndDate: "",
    sortBy: "outstandingBalance",
    sortOrder: "desc",
  })

  // Fetch customers data with filters
  useEffect(() => {
    const customersParams: DebtManagementCustomersRequest = {
      PageNumber: customersPage,
      PageSize: customersPageSize,
      SortDirection: localFilters.sortOrder === "desc" ? 2 : 1,
      ...(localFilters.search && { Search: localFilters.search }),
      ...(localFilters.customerId && { CustomerId: Number(localFilters.customerId) }),
      ...(localFilters.minDebt && { MinDebt: Number(localFilters.minDebt) }),
      ...(localFilters.maxDebt && { MaxDebt: Number(localFilters.maxDebt) }),
    }

    dispatch(fetchDebtManagementCustomers(customersParams))
  }, [dispatch, customersPage, customersPageSize, localFilters])

  // Separate state for search input to enable manual search
  const [searchInput, setSearchInput] = useState("")

  // Sort options
  const sortOptions: { label: string; value: string; order: "asc" | "desc" }[] = [
    { label: "Highest Debt First", value: "outstandingBalance", order: "desc" },
    { label: "Lowest Debt First", value: "outstandingBalance", order: "asc" },
    { label: "Name A-Z", value: "customerName", order: "asc" },
    { label: "Name Z-A", value: "customerName", order: "desc" },
    { label: "Account No Asc", value: "accountNumber", order: "asc" },
    { label: "Account No Desc", value: "accountNumber", order: "desc" },
    { label: "Last Activity (Newest)", value: "lastLedgerAtUtc", order: "desc" },
    { label: "Last Activity (Oldest)", value: "lastLedgerAtUtc", order: "asc" },
  ]

  // Get min and max debt amounts from customers for range filtering
  const getAmountRange = () => {
    if (!customers || customers.length === 0) return { min: 0, max: 100000 }
    const amounts = customers.map((customer) => customer.outstandingBalance)
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    }
  }

  // Format customer options for dropdown
  const getCustomerOptions = () => {
    return allCustomers.map((customer) => `${customer.fullName} (${customer.accountNumber}) `)
  }

  // Handle customer selection
  const handleCustomerSelect = (option: string) => {
    // Find the customer by matching the display string
    const customer = allCustomers.find((c) => `${c.fullName} (${c.accountNumber}) ` === option)
    if (customer) {
      handleFilterChange("customerId", customer.id.toString())
    }
  }

  // Get current customer display value
  const getCurrentCustomerDisplay = () => {
    if (!localFilters.customerId) return ""
    const customer = allCustomers.find((c) => c.id.toString() === localFilters.customerId.toString())
    if (customer) {
      return `${customer.fullName} (${customer.accountNumber}) `
    }
    return ""
  }

  const amountRange = getAmountRange()

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

  // Fetch customers data with filters
  useEffect(() => {
    const customersParams: DebtManagementCustomersRequest = {
      PageNumber: customersPage,
      PageSize: customersPageSize,
      SortDirection: localFilters.sortOrder === "desc" ? 2 : 1,
      ...(localFilters.search && { Search: localFilters.search }),
      ...(localFilters.customerId && { CustomerId: Number(localFilters.customerId) }),
      ...(localFilters.minDebt && { MinDebt: Number(localFilters.minDebt) }),
      ...(localFilters.maxDebt && { MaxDebt: Number(localFilters.maxDebt) }),
    }

    dispatch(fetchDebtManagementCustomers(customersParams))
  }, [dispatch, customersPage, customersPageSize, localFilters])

  // Fetch all customers for dropdown
  useEffect(() => {
    dispatch(
      fetchCustomers({
        pageNumber: 1,
        pageSize: 1000, // Get all customers for dropdown
      })
    )
  }, [dispatch])

  // Cleanup debt management state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearRecoverySummaryState())
      dispatch(clearCustomersState())
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
      SortDirection: localFilters.sortOrder === "desc" ? 2 : 1,
      ...(localFilters.search && { Search: localFilters.search }),
      ...(localFilters.customerId && { CustomerId: Number(localFilters.customerId) }),
      ...(localFilters.minDebt && { MinDebt: Number(localFilters.minDebt) }),
      ...(localFilters.maxDebt && { MaxDebt: Number(localFilters.maxDebt) }),
    }

    dispatch(fetchRecoverySummary(recoveryParams))
    dispatch(fetchDebtManagementCustomers(customersParams))
    setTimeout(() => setIsLoading(false), 1000)
  }, [dispatch, selectedPeriod, customersPage, customersPageSize, localFilters])

  // Handle view mode change
  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode)
  }

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setCustomersPageSize(size)
    setCustomersPage(1) // Reset to first page when page size changes
  }

  const handleCustomersPageChange = (page: number) => {
    setCustomersPage(page)
  }

  const handleRefreshCustomers = () => {
    const customersParams: DebtManagementCustomersRequest = {
      PageNumber: customersPage,
      PageSize: customersPageSize,
      SortDirection: localFilters.sortOrder === "desc" ? 2 : 1,
      ...(localFilters.search && { Search: localFilters.search }),
      ...(localFilters.customerId && { CustomerId: Number(localFilters.customerId) }),
      ...(localFilters.minDebt && { MinDebt: Number(localFilters.minDebt) }),
      ...(localFilters.maxDebt && { MaxDebt: Number(localFilters.maxDebt) }),
    }
    dispatch(fetchDebtManagementCustomers(customersParams))
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
    setCustomersPage(1) // Reset to first page when filters change
  }

  // Handle sort change
  const handleSortChange = (option: { label: string; value: string; order: "asc" | "desc" }) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
    setCustomersPage(1) // Reset to first page when sort changes
  }

  // Apply filters
  const applyFilters = () => {
    // Already applied through useEffect
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      search: "",
      customerId: "",
      minDebt: "",
      maxDebt: "",
      lastLedgerStartDate: "",
      lastLedgerEndDate: "",
      sortBy: "outstandingBalance",
      sortOrder: "desc",
    })
    setCustomersPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.search) count++
    if (localFilters.customerId) count++
    if (localFilters.minDebt) count++
    if (localFilters.maxDebt) count++
    if (localFilters.lastLedgerStartDate) count++
    if (localFilters.lastLedgerEndDate) count++
    if (localFilters.sortBy !== "outstandingBalance" || localFilters.sortOrder !== "desc") count++
    return count
  }

  // Search handlers
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleSearchCancel = () => {
    setSearchInput("")
    handleFilterChange("search", "")
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      handleFilterChange("search", trimmed)
    }
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
          SortDirection: localFilters.sortOrder === "desc" ? 2 : 1,
          ...(localFilters.search && { Search: localFilters.search }),
          ...(localFilters.customerId && { CustomerId: Number(localFilters.customerId) }),
          ...(localFilters.minDebt && { MinDebt: Number(localFilters.minDebt) }),
          ...(localFilters.maxDebt && { MaxDebt: Number(localFilters.maxDebt) }),
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
  }, [dispatch, isPolling, pollingInterval, selectedPeriod, customersPage, customersPageSize, localFilters])

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full pb-20">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3  sm:px-3 xl:px-6 ">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col items-start justify-between gap-4 py-4 sm:py-6 md:gap-6 md:py-8 xl:flex-row xl:items-start">
              <div className="flex-1">
                <h4 className="text-lg font-semibold sm:text-xl md:text-xl">Debt Management</h4>
                <p className="text-sm text-gray-600 sm:text-base">Debt recovery tracking and management</p>
              </div>

              <motion.div
                className="flex flex-wrap items-center gap-3 xl:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Filter Button for ALL screens up to 2xl */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 2xl:hidden"
                >
                  <Filter className="size-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                {/* Active filters badge - Desktop only (2xl and above) */}
                {getActiveFilterCount() > 0 && (
                  <div className="hidden items-center gap-2 2xl:flex">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Hide/Show Filters button - Desktop only (2xl and above) */}
                <button
                  type="button"
                  onClick={() => setShowDesktopFilters((prev) => !prev)}
                  className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
                >
                  {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                  {showDesktopFilters ? "Hide filters" : "Show filters"}
                </button>

                {/* Polling Controls */}
                <div className="flex items-center gap-2 rounded-md border bg-white p-2 pr-3">
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
            <div className="flex flex-col items-start gap-6 2xl:flex-row">
              {/* Main Content */}
              <div
                className={showDesktopFilters ? "w-full 2xl:max-w-[calc(100%-356px)] 2xl:flex-1" : "w-full 2xl:flex-1"}
              >
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
                    {/* Debt Management Customers Loading State */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-6"
                    >
                      <DebtManagementCustomers
                        customers={[]}
                        customersLoading={true}
                        customersError={null}
                        pagination={{
                          totalCount: 0,
                          totalPages: 0,
                          currentPage: 1,
                          pageSize: customersPageSize,
                          hasNext: false,
                          hasPrevious: false,
                        }}
                        onPageChange={() => {}}
                        onRefresh={() => {}}
                        searchInput=""
                        onSearchChange={() => {}}
                        onSearchCancel={() => {}}
                        onManualSearch={() => {}}
                        viewMode={viewMode}
                        onViewModeChange={() => {}}
                        onPageSizeChange={() => {}}
                        getActiveFilterCount={() => 0}
                        resetFilters={() => {}}
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

                    {/* Search Priority Section */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.25 }}
                      className="mt-6"
                    >
                      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-green-50/60 to-white p-4 shadow-sm">
                        <div className="mb-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#004B23]">
                            Primary action
                          </p>
                          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Search Debt Management</h2>
                          <p className="text-xs text-gray-600 sm:text-sm">
                            Find customers quickly by name, account number, or customer ID.
                          </p>
                        </div>

                        <SearchModule
                          value={localFilters.search || ""}
                          onChange={(e) => handleFilterChange("search", e.target.value)}
                          onCancel={handleSearchCancel}
                          onSearch={handleManualSearch}
                          placeholder="Search by customer name, account number, or customer ID..."
                          height="h-14"
                          className="!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm md:!w-full [&_button]:min-h-[38px] [&_button]:px-4 [&_button]:text-sm [&_input]:text-sm sm:[&_input]:text-base"
                        />
                      </div>
                    </motion.div>

                    {/* Debt Management Customers */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-6"
                    >
                      <DebtManagementCustomers
                        customers={customers}
                        customersLoading={customersLoading}
                        customersError={customersError}
                        pagination={customersPagination}
                        onPageChange={handleCustomersPageChange}
                        onRefresh={handleRefreshCustomers}
                        searchInput={localFilters.search}
                        onSearchChange={handleSearchChange}
                        onSearchCancel={handleSearchCancel}
                        onManualSearch={handleManualSearch}
                        viewMode={viewMode}
                        onViewModeChange={handleViewModeChange}
                        onPageSizeChange={handlePageSizeChange}
                        getActiveFilterCount={getActiveFilterCount}
                        resetFilters={resetFilters}
                      />
                    </motion.div>
                  </>
                )}
              </div>

              {/* Desktop Filters Sidebar (2xl and above) */}
              {showDesktopFilters && (
                <motion.div
                  key="desktop-filters-sidebar"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  className="hidden w-full flex-col rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:flex 2xl:w-80 2xl:self-start"
                >
                  <div className="mb-4 flex shrink-0 items-center justify-between border-b pb-3 md:pb-4">
                    <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters & Sorting</h2>
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
                    >
                      <X className="size-3 md:size-4" />
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Search Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Search</label>
                      <input
                        type="text"
                        value={localFilters.search || ""}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        placeholder="Search by name or account number"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Customer Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
                      <Dropdown
                        label="Select customer"
                        options={getCustomerOptions()}
                        value={getCurrentCustomerDisplay()}
                        onSelect={handleCustomerSelect}
                        isOpen={isCustomerDropdownOpen}
                        toggleDropdown={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                        disabled={allCustomersLoading}
                      />
                    </div>

                    {/* Amount Range Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Outstanding Balance Range (NGN)
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 md:text-sm">Min:</span>
                          <input
                            type="number"
                            value={localFilters.minDebt || ""}
                            onChange={(e) =>
                              handleFilterChange("minDebt", e.target.value ? Number(e.target.value) : "")
                            }
                            placeholder="0"
                            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 md:text-sm">Max:</span>
                          <input
                            type="number"
                            value={localFilters.maxDebt || ""}
                            onChange={(e) =>
                              handleFilterChange("maxDebt", e.target.value ? Number(e.target.value) : "")
                            }
                            placeholder="No limit"
                            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Last Activity Date Range
                      </label>
                      <div className="space-y-2">
                        <DateRangeFilter
                          label="Last Ledger Date"
                          startDate={localFilters.lastLedgerStartDate || ""}
                          endDate={localFilters.lastLedgerEndDate || ""}
                          onStartDateChange={(date) => handleFilterChange("lastLedgerStartDate", date)}
                          onEndDateChange={(date) => handleFilterChange("lastLedgerEndDate", date)}
                        />
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Sort By</label>
                      <div className="space-y-2">
                        {sortOptions.map((option) => (
                          <button
                            key={`${option.value}-${option.order}`}
                            onClick={() => handleSortChange(option)}
                            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                              localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                                ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <span>{option.label}</span>
                            {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                              <span className="text-purple-600">
                                {option.order === "asc" ? (
                                  <SortAsc className="size-4" />
                                ) : (
                                  <SortDesc className="size-4" />
                                )}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 shrink-0 space-y-3 border-t pt-4">
                    <button
                      onClick={applyFilters}
                      className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Filter className="size-4" />
                        Apply Filters
                      </div>
                    </button>
                    <button
                      onClick={resetFilters}
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <X className="size-4" />
                        Reset All
                      </div>
                    </button>
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-4 shrink-0 rounded-lg bg-gray-50 p-3 md:mt-6">
                    <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
                    <div className="space-y-1 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Customers:</span>
                        <span className="font-medium">{customersPagination.totalCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Page:</span>
                        <span className="font-medium">
                          {customersPage} / {customersPagination.totalPages}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Filters:</span>
                        <span className="font-medium">{getActiveFilterCount()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Balance Range:</span>
                        <span className="font-medium">
                          ₦{amountRange.min.toLocaleString()} - ₦{amountRange.max.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <FilterSidebar
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        sortOptions={sortOptions}
        amountRange={amountRange}
      />
    </section>
  )
}
