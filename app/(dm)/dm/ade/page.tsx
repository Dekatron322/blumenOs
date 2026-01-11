"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  clearAllDebtEntriesState,
  fetchAllDebtEntries,
  selectAllDebtEntries,
  selectAllDebtEntriesError,
  selectAllDebtEntriesLoading,
  selectAllDebtEntriesPagination,
  selectAllDebtEntriesSuccess,
} from "lib/redux/debtManagementSlice"
import type { AllDebtEntriesRequest, DebtEntryData } from "lib/redux/debtManagementSlice"
import { fetchCustomers } from "lib/redux/customerSlice"
import { fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import DashboardNav from "components/Navbar/DashboardNav"
import { ArrowLeft, ChevronDown, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { RxCaretSort } from "react-icons/rx"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { UserIcon } from "components/Icons/Icons"
import { AnimatePresence } from "framer-motion"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

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
  minAmount,
  maxAmount,
  sortOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  handleSortChange: (option: { label: string; value: string; order: "asc" | "desc" }) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  minAmount: number
  maxAmount: number
  sortOptions: { label: string; value: string; order: "asc" | "desc" }[]
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
            <div className="flex-shrink-0 border-b bg-white p-4">
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
                {/* Amount Range Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Amount Range (NGN)</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Min:</span>
                      <input
                        type="number"
                        value={localFilters.minAmount || ""}
                        onChange={(e) => handleFilterChange("minAmount", e.target.value ? Number(e.target.value) : "")}
                        placeholder="0"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Max:</span>
                      <input
                        type="number"
                        value={localFilters.maxAmount || ""}
                        onChange={(e) => handleFilterChange("maxAmount", e.target.value ? Number(e.target.value) : "")}
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
                    <span>Date Range</span>
                    <ChevronDown className={`size-4 transition-transform ${isDateRangeExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {isDateRangeExpanded && (
                    <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <DateRangeFilter
                        label="Created Date"
                        startDate={localFilters.createdStartDate || ""}
                        endDate={localFilters.createdEndDate || ""}
                        onStartDateChange={(date) => handleFilterChange("createdStartDate", date)}
                        onEndDateChange={(date) => handleFilterChange("createdEndDate", date)}
                      />

                      <DateRangeFilter
                        label="Effective Date"
                        startDate={localFilters.effectiveStartDate || ""}
                        endDate={localFilters.effectiveEndDate || ""}
                        onStartDateChange={(date) => handleFilterChange("effectiveStartDate", date)}
                        onEndDateChange={(date) => handleFilterChange("effectiveEndDate", date)}
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
            <div className="flex-shrink-0 border-t bg-white p-4">
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

// All Debt Entries Table Component
const AllDebtEntriesTable = ({
  allDebtEntries,
  allDebtEntriesLoading,
  allDebtEntriesError,
  pagination,
  onPageChange,
  onRefresh,
  selectedCustomerId,
  selectedStatus,
  selectedPaymentTypeId,
  onCustomerIdFilterChange,
  onStatusFilterChange,
  onPaymentTypeIdFilterChange,
}: {
  allDebtEntries: DebtEntryData[]
  allDebtEntriesLoading: boolean
  allDebtEntriesError: string | null
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
  selectedCustomerId?: number
  selectedStatus?: number
  selectedPaymentTypeId?: number
  onCustomerIdFilterChange: (customerId: number | undefined) => void
  onStatusFilterChange: (status: number | undefined) => void
  onPaymentTypeIdFilterChange: (paymentTypeId: number | undefined) => void
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getStatusBadge = (status: number) => {
    const statusConfig = {
      1: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      2: { label: "Approved", className: "bg-green-100 text-green-800" },
      3: { label: "Rejected", className: "bg-red-100 text-red-800" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[1]
    return (
      <motion.div
        className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${config.className}`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.1 }}
      >
        <span
          className="size-2 rounded-full"
          style={{
            backgroundColor: config.className.includes("yellow")
              ? "#D97706"
              : config.className.includes("green")
              ? "#059669"
              : "#DC2626",
          }}
        ></span>
        {config.label}
      </motion.div>
    )
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  if (allDebtEntriesLoading) {
    return (
      <motion.div
        className="container mt-5 flex w-full flex-col rounded-md border bg-white p-3 sm:p-5"
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
        {/* Header Section Skeleton */}
        <div className="items-center justify-between border-b py-2 md:flex md:py-4">
          <div className="mb-3 md:mb-0">
            <div className="mb-2 h-8 w-40 rounded bg-gray-200 sm:w-48"></div>
            <div className="h-4 w-56 rounded bg-gray-200 sm:w-64"></div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="h-10 w-full rounded bg-gray-200 sm:w-48"></div>
            <div className="h-10 w-24 rounded bg-gray-200 sm:w-28"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
          <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="whitespace-nowrap border-b p-3 sm:p-4">
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(6)].map((_, cellIndex) => (
                    <td key={cellIndex} className="whitespace-nowrap border-b px-3 py-2 sm:px-4 sm:py-3">
                      <div className="h-4 w-full rounded bg-gray-200"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section Skeleton */}
        <div className="flex flex-col items-center justify-between gap-3 border-t py-3 sm:flex-row">
          <div className="h-6 w-48 rounded bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-gray-200"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-8 rounded bg-gray-200"></div>
            ))}
            <div className="size-8 rounded bg-gray-200"></div>
          </div>
          <div className="h-6 w-32 rounded bg-gray-200"></div>
        </div>
      </motion.div>
    )
  }

  if (allDebtEntriesError) {
    return (
      <motion.div
        className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-red-900">Error Loading Debt Entries</h3>
          <button
            onClick={onRefresh}
            className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
        <div className="mt-2">
          <p className="text-sm text-red-600">{allDebtEntriesError}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">All Debt Entries</p>
          <p className="text-sm text-gray-600">View and manage all debt entries</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
            title="Refresh debt entries"
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
      </motion.div>

      {allDebtEntries.length === 0 ? (
        <motion.div
          className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F6F6F9]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.p
            className="text-base font-bold text-[#202B3C]"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            No debt entries found
          </motion.p>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="w-full overflow-x-auto border-x bg-[#FFFFFF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("customerName")}
                  >
                    <div className="flex items-center gap-2">
                      Customer <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center gap-2">
                      Amount <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("paymentTypeName")}
                  >
                    <div className="flex items-center gap-2">
                      Payment Type <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      Created <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("effectiveAtUtc")}
                  >
                    <div className="flex items-center gap-2">
                      Effective Date <RxCaretSort />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {allDebtEntries.map((entry: DebtEntryData, index: number) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap border-b px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-gray-100">
                          <UserIcon />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{entry.customerName}</div>
                          <div className="text-xs text-gray-500">{entry.customerAccountNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-900">
                      {entry.paymentTypeName}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">{getStatusBadge(entry.status)}</td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                      {formatDate(entry.effectiveAtUtc)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
            <div className="flex items-center gap-1 max-sm:hidden">
              <p className="text-xs sm:text-sm">Show rows</p>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  // Handle page size change if needed
                }}
                className="bg-[#F2F2F2] p-1 text-xs sm:text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                className={`px-2 py-1 sm:px-3 sm:py-2 ${
                  pagination.currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <BiSolidLeftArrow className="size-4 sm:size-5" />
              </button>

              <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden items-center gap-1 sm:flex sm:gap-2">
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`flex size-6 items-center justify-center rounded-md text-xs sm:h-7 sm:w-8 sm:text-sm ${
                        pagination.currentPage === page ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                      }`}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 sm:hidden">
                  {Array.from({ length: Math.min(pagination.totalPages, 4) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`flex size-6 items-center justify-center rounded-md text-xs ${
                        pagination.currentPage === page ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                      }`}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className={`px-2 py-1 sm:px-3 sm:py-2 ${
                  pagination.currentPage === pagination.totalPages || pagination.totalPages === 0
                    ? "cursor-not-allowed text-gray-400"
                    : "text-[#000000]"
                }`}
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
              >
                <BiSolidRightArrow className="size-4 sm:size-5" />
              </button>
            </div>

            <p className="text-center text-xs text-gray-600 sm:text-right sm:text-sm">
              Page {pagination.currentPage} of {pagination.totalPages || 1} ({pagination.totalCount.toLocaleString()}{" "}
              total entries)
            </p>
          </div>
        </>
      )}
    </>
  )
}

export default function AllDebtEntriesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState<number>(480000) // Default 8 minutes (480,000 ms)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)

  // Redux hooks
  const dispatch = useAppDispatch()

  // All debt entries state
  const allDebtEntries = useAppSelector(selectAllDebtEntries)
  const allDebtEntriesLoading = useAppSelector(selectAllDebtEntriesLoading)
  const allDebtEntriesError = useAppSelector(selectAllDebtEntriesError)
  const allDebtEntriesSuccess = useAppSelector(selectAllDebtEntriesSuccess)
  const allDebtEntriesPagination = useAppSelector(selectAllDebtEntriesPagination)

  // Customer state for dropdown
  const { customers, loading: customersLoading, error: customersError } = useAppSelector((state) => state.customers)

  // Payment types state for dropdown
  const {
    paymentTypes,
    loading: paymentTypesLoading,
    error: paymentTypesError,
  } = useAppSelector((state) => state.paymentTypes)

  // State for pagination and filters
  const [allDebtEntriesPage, setAllDebtEntriesPage] = useState(1)
  const allDebtEntriesPageSize = 10

  // Local state for filters (similar to AllCustomers component)
  const [localFilters, setLocalFilters] = useState({
    customerId: "",
    status: "",
    paymentTypeId: "",
    minAmount: "",
    maxAmount: "",
    createdStartDate: "",
    createdEndDate: "",
    effectiveStartDate: "",
    effectiveEndDate: "",
    sortBy: "",
    sortOrder: "desc" as "asc" | "desc",
  })

  // Sort options
  const sortOptions: { label: string; value: string; order: "asc" | "desc" }[] = [
    { label: "Amount Low to High", value: "amount", order: "asc" },
    { label: "Amount High to Low", value: "amount", order: "desc" },
    { label: "Date Created (Newest)", value: "createdAt", order: "desc" },
    { label: "Date Created (Oldest)", value: "createdAt", order: "asc" },
    { label: "Effective Date (Newest)", value: "effectiveAtUtc", order: "desc" },
    { label: "Effective Date (Oldest)", value: "effectiveAtUtc", order: "asc" },
    { label: "Customer Name A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name Z-A", value: "customerName", order: "desc" },
  ]

  // Get min and max amounts from entries for range filtering
  const getAmountRange = () => {
    if (allDebtEntries.length === 0) return { min: 0, max: 100000 }
    const amounts = allDebtEntries.map((entry) => entry.amount)
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    }
  }

  const amountRange = getAmountRange()

  // Fetch all debt entries data when page or filters change
  useEffect(() => {
    const fetchDebtEntries = () => {
      const allDebtEntriesParams: AllDebtEntriesRequest = {
        PageNumber: allDebtEntriesPage,
        PageSize: allDebtEntriesPageSize,
        ...(localFilters.customerId && { CustomerId: Number(localFilters.customerId) }),
        ...(localFilters.status && { Status: Number(localFilters.status) as 1 | 2 | 3 }),
        ...(localFilters.paymentTypeId && { PaymentTypeId: Number(localFilters.paymentTypeId) }),
      }

      dispatch(fetchAllDebtEntries(allDebtEntriesParams))
    }

    fetchDebtEntries()
  }, [
    dispatch,
    allDebtEntriesPage,
    allDebtEntriesPageSize,
    localFilters.customerId,
    localFilters.status,
    localFilters.paymentTypeId,
  ])

  // Fetch customers for dropdown
  useEffect(() => {
    dispatch(
      fetchCustomers({
        pageNumber: 1,
        pageSize: 1000, // Get all customers for dropdown
      })
    )
  }, [dispatch])

  // Fetch payment types for dropdown
  useEffect(() => {
    dispatch(fetchPaymentTypes())
  }, [dispatch])

  // Cleanup state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAllDebtEntriesState())
    }
  }, [dispatch])

  const handleAllDebtEntriesPageChange = (page: number) => {
    setAllDebtEntriesPage(page)
  }

  const handleRefreshAllDebtEntries = () => {
    const allDebtEntriesParams: AllDebtEntriesRequest = {
      PageNumber: allDebtEntriesPage,
      PageSize: allDebtEntriesPageSize,
      ...(localFilters.customerId && { CustomerId: Number(localFilters.customerId) }),
      ...(localFilters.status && { Status: Number(localFilters.status) as 1 | 2 | 3 }),
      ...(localFilters.paymentTypeId && { PaymentTypeId: Number(localFilters.paymentTypeId) }),
    }
    dispatch(fetchAllDebtEntries(allDebtEntriesParams))
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Handle sort change
  const handleSortChange = (option: { label: string; value: string; order: "asc" | "desc" }) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
    setAllDebtEntriesPage(1) // Reset to first page when sort changes
  }

  // Apply filters
  const applyFilters = () => {
    // Note: The backend API only supports CustomerId, Status, and PaymentTypeId filters
    // Additional filters (amount range, date range) would need backend support
    setAllDebtEntriesPage(1) // Reset to first page when filters are applied
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      customerId: "",
      status: "",
      paymentTypeId: "",
      minAmount: "",
      maxAmount: "",
      createdStartDate: "",
      createdEndDate: "",
      effectiveStartDate: "",
      effectiveEndDate: "",
      sortBy: "",
      sortOrder: "desc",
    })
    setAllDebtEntriesPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.customerId) count++
    if (localFilters.status) count++
    if (localFilters.paymentTypeId) count++
    if (localFilters.minAmount) count++
    if (localFilters.maxAmount) count++
    if (localFilters.createdStartDate) count++
    if (localFilters.createdEndDate) count++
    if (localFilters.effectiveStartDate) count++
    if (localFilters.effectiveEndDate) count++
    if (localFilters.sortBy) count++
    return count
  }

  // Quick filter handlers (for the simple filters in the table)
  const handleCustomerIdFilterChange = (customerId: number | undefined) => {
    handleFilterChange("customerId", customerId?.toString() || "")
    setAllDebtEntriesPage(1)
  }

  const handleStatusFilterChange = (status: number | undefined) => {
    handleFilterChange("status", status?.toString() || "")
    setAllDebtEntriesPage(1)
  }

  const handlePaymentTypeIdFilterChange = (paymentTypeId: number | undefined) => {
    handleFilterChange("paymentTypeId", paymentTypeId?.toString() || "")
    setAllDebtEntriesPage(1)
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
        const allDebtEntriesParams: AllDebtEntriesRequest = {
          PageNumber: allDebtEntriesPage,
          PageSize: allDebtEntriesPageSize,
          ...(localFilters.customerId && { CustomerId: Number(localFilters.customerId) }),
          ...(localFilters.status && { Status: Number(localFilters.status) as 1 | 2 | 3 }),
          ...(localFilters.paymentTypeId && { PaymentTypeId: Number(localFilters.paymentTypeId) }),
        }

        dispatch(fetchAllDebtEntries(allDebtEntriesParams))
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
    allDebtEntriesPage,
    allDebtEntriesPageSize,
    localFilters.customerId,
    localFilters.status,
    localFilters.paymentTypeId,
  ])

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <DashboardNav />
      <div className="flex min-h-screen w-full pb-10">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 2xl:container sm:px-3 xl:px-6 2xl:px-16">
            {/* Page Header */}
            <div className="flex w-full flex-col items-start justify-between gap-4 py-4 sm:py-6 md:gap-6 md:py-4 xl:flex-row xl:items-start">
              <div className="flex-1">
                <h4 className="text-lg font-semibold sm:text-xl md:text-2xl">All Debt Entries</h4>
                <p className="text-sm text-gray-600 sm:text-base">View and manage all debt entries</p>
              </div>

              {/* Controls Section */}
              <div className="flex flex-wrap items-center gap-3 xl:justify-end">
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
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-start gap-6 2xl:flex-row">
              {/* Table Content */}
              <div
                className={
                  showDesktopFilters
                    ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
                    : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
                }
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <AllDebtEntriesTable
                    allDebtEntries={allDebtEntries}
                    allDebtEntriesLoading={allDebtEntriesLoading}
                    allDebtEntriesError={allDebtEntriesError}
                    pagination={allDebtEntriesPagination}
                    onPageChange={handleAllDebtEntriesPageChange}
                    onRefresh={handleRefreshAllDebtEntries}
                    selectedCustomerId={localFilters.customerId ? Number(localFilters.customerId) : undefined}
                    selectedStatus={localFilters.status ? Number(localFilters.status) : undefined}
                    selectedPaymentTypeId={localFilters.paymentTypeId ? Number(localFilters.paymentTypeId) : undefined}
                    onCustomerIdFilterChange={handleCustomerIdFilterChange}
                    onStatusFilterChange={handleStatusFilterChange}
                    onPaymentTypeIdFilterChange={handlePaymentTypeIdFilterChange}
                  />
                </motion.div>
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
                    {/* Customer Filter */}
                    <div>
                      <FormSelectModule
                        label="Customer"
                        name="customerId"
                        value={localFilters.customerId || ""}
                        onChange={(e) => handleFilterChange("customerId", e.target.value)}
                        options={[
                          { value: "", label: "All Customers" },
                          ...customers.map((customer) => ({
                            value: customer.id.toString(),
                            label: `${customer.fullName} - ${customer.accountNumber}`,
                          })),
                        ]}
                        disabled={customersLoading}
                        searchable={true}
                        className="w-full"
                      />
                      {customersError && <p className="mt-1 text-xs text-red-600">Failed to load customers</p>}
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "1", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
                          { value: "2", label: "Approved", color: "bg-green-100 text-green-800" },
                          { value: "3", label: "Rejected", color: "bg-red-100 text-red-800" },
                        ].map((status) => (
                          <button
                            key={status.value}
                            onClick={() =>
                              handleFilterChange(
                                "status",
                                localFilters.status === status.value ? "" : Number(status.value)
                              )
                            }
                            className={`rounded-md px-3 py-2 text-xs transition-colors ${status.color} ${
                              localFilters.status === status.value
                                ? "ring-2 ring-current ring-offset-1"
                                : "hover:opacity-90"
                            }`}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Type Filter */}
                    <div>
                      <FormSelectModule
                        label="Payment Type"
                        name="paymentTypeId"
                        value={localFilters.paymentTypeId || ""}
                        onChange={(e) => handleFilterChange("paymentTypeId", e.target.value)}
                        options={[
                          { value: "", label: "All Payment Types" },
                          ...paymentTypes.map((paymentType) => ({
                            value: paymentType.id.toString(),
                            label: paymentType.name,
                          })),
                        ]}
                        disabled={paymentTypesLoading}
                        searchable={true}
                        className="w-full"
                      />
                      {paymentTypesError && <p className="mt-1 text-xs text-red-600">Failed to load payment types</p>}
                    </div>

                    {/* Amount Range Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Amount Range (NGN)
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 md:text-sm">Min:</span>
                          <input
                            type="number"
                            value={localFilters.minAmount || ""}
                            onChange={(e) =>
                              handleFilterChange("minAmount", e.target.value ? Number(e.target.value) : "")
                            }
                            placeholder="0"
                            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 md:text-sm">Max:</span>
                          <input
                            type="number"
                            value={localFilters.maxAmount || ""}
                            onChange={(e) =>
                              handleFilterChange("maxAmount", e.target.value ? Number(e.target.value) : "")
                            }
                            placeholder="No limit"
                            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date Range Filters */}
                    <div className="space-y-4">
                      <DateRangeFilter
                        label="Created Date"
                        startDate={localFilters.createdStartDate || ""}
                        endDate={localFilters.createdEndDate || ""}
                        onStartDateChange={(date) => handleFilterChange("createdStartDate", date)}
                        onEndDateChange={(date) => handleFilterChange("createdEndDate", date)}
                      />

                      <DateRangeFilter
                        label="Effective Date"
                        startDate={localFilters.effectiveStartDate || ""}
                        endDate={localFilters.effectiveEndDate || ""}
                        onStartDateChange={(date) => handleFilterChange("effectiveStartDate", date)}
                        onEndDateChange={(date) => handleFilterChange("effectiveEndDate", date)}
                      />
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
                        <span className="text-gray-600">Total Records:</span>
                        <span className="font-medium">{allDebtEntriesPagination.totalCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Page:</span>
                        <span className="font-medium">
                          {allDebtEntriesPage} / {allDebtEntriesPagination.totalPages}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Filters:</span>
                        <span className="font-medium">{getActiveFilterCount()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Range:</span>
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
        minAmount={amountRange.min}
        maxAmount={amountRange.max}
        sortOptions={sortOptions}
      />
    </section>
  )
}
