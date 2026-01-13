import React, { useState } from "react"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort } from "react-icons/rx"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import Dropdown from "components/Dropdown/Dropdown"
import DebtManagementTabNavigation from "./DebtManagementTabNavigation"
import AllDebtRecovery from "components/BillingInfo/AllDebtRecovery"
import type { DebtEntryData, DebtManagementCustomer } from "lib/redux/debtManagementSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { VscEye } from "react-icons/vsc"
import { UserIcon } from "components/Icons/Icons"

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
                    className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">Date Range</span>
                    {isDateRangeExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {isDateRangeExpanded && (
                    <div className="mt-3 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
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
                    className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">Sort By</span>
                    {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {isSortExpanded && (
                    <div className="mt-3 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                      {sortOptions.map((option) => (
                        <button
                          key={`${option.value}-${option.order}`}
                          onClick={() => handleSortChange(option)}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>{option.label}</span>
                          {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                            <span className="text-blue-600">
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

            {/* Footer Actions - Fixed at bottom */}
            <div className="flex-shrink-0 border-t bg-white p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const DebtManagementCustomers = ({
  customers,
  customersLoading,
  customersError,
  pagination,
  onPageChange,
  onRefresh,
  onSearchChange,
  onCustomerIdFilterChange,
  onMinDebtFilterChange,
  onMaxDebtFilterChange,
  onSortChange,
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
  onSearchChange?: (search: string) => void
  onCustomerIdFilterChange?: (customerId?: number) => void
  onMinDebtFilterChange?: (minDebt?: number) => void
  onMaxDebtFilterChange?: (maxDebt?: number) => void
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false)

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    search: "",
    customerId: "",
    minDebt: "",
    maxDebt: "",
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
    lastLedgerStartDate: "",
    lastLedgerEndDate: "",
  })

  // Mock customer data for dropdown (in real app, this would come from Redux)
  const allCustomers = customers // Use the customers prop for dropdown options

  // Format customer options for dropdown
  const getCustomerOptions = () => {
    return allCustomers.map((customer) => `${customer.customerName} (${customer.accountNumber}) `)
  }

  // Handle customer selection
  const handleCustomerSelect = (option: string) => {
    // Find the customer by matching the display string
    const customer = allCustomers.find((c) => `${c.customerName} (${c.accountNumber}) ` === option)
    if (customer) {
      handleFilterChange("customerId", customer.customerId.toString())
    } else {
      handleFilterChange("customerId", "")
    }
  }

  // Get current customer display value
  const getCurrentCustomerDisplay = () => {
    if (!localFilters.customerId) return ""
    const customer = allCustomers.find((c) => c.customerId.toString() === localFilters.customerId.toString())
    if (customer) {
      return `${customer.customerName} (${customer.accountNumber}) `
    }
    return ""
  }

  // Sort options
  const sortOptions: { label: string; value: string; order: "asc" | "desc" }[] = [
    { label: "Customer Name: A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name: Z-A", value: "customerName", order: "desc" },
    { label: "Balance: Low to High", value: "outstandingBalance", order: "asc" },
    { label: "Balance: High to Low", value: "outstandingBalance", order: "desc" },
    { label: "Account No Asc", value: "accountNumber", order: "asc" },
    { label: "Account No Desc", value: "accountNumber", order: "desc" },
    { label: "Last Activity (Newest)", value: "lastLedgerAtUtc", order: "desc" },
    { label: "Last Activity (Oldest)", value: "lastLedgerAtUtc", order: "asc" },
  ]

  // Get min and max debt amounts from customers for range filtering
  const getAmountRange = () => {
    if (customers.length === 0) return { min: 0, max: 100000 }
    const amounts = customers.map((customer) => customer.outstandingBalance)
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    }
  }

  const amountRange = getAmountRange()

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
    onPageChange(1) // Reset to first page when sort changes
  }

  // Apply filters
  const applyFilters = () => {
    // Apply the filters to the parent component
    console.log("Applying customer filters:", localFilters)

    // Call parent component filter handlers if they exist
    if (onSearchChange) {
      onSearchChange(localFilters.search || "")
    }

    if (onCustomerIdFilterChange) {
      onCustomerIdFilterChange(localFilters.customerId ? Number(localFilters.customerId) : undefined)
    }

    if (onMinDebtFilterChange) {
      onMinDebtFilterChange(localFilters.minDebt ? Number(localFilters.minDebt) : undefined)
    }

    if (onMaxDebtFilterChange) {
      onMaxDebtFilterChange(localFilters.maxDebt ? Number(localFilters.maxDebt) : undefined)
    }

    if (onSortChange) {
      onSortChange(localFilters.sortBy || "", localFilters.sortOrder)
    }

    onPageChange(1) // Reset to first page when filters are applied
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      search: "",
      customerId: "",
      minDebt: "",
      maxDebt: "",
      sortBy: "",
      sortOrder: "asc",
      lastLedgerStartDate: "",
      lastLedgerEndDate: "",
    })
    onPageChange(1)
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
    if (localFilters.sortBy) count++
    return count
  }

  // Handle search changes
  const handleSearchChange = (value: string) => {
    handleFilterChange("search", value)
  }

  const handleSearchCancel = () => {
    handleFilterChange("search", "")
  }

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

  if (customersLoading) {
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

        {/* Customer List Skeleton */}
        <div className="w-full border-x bg-[#f9f9f9]">
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 animate-pulse rounded-full bg-gray-200"></div>
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
            </div>
          ))}
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

  if (customersError) {
    return (
      <motion.div
        className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-red-900">Error Loading Customers</h3>
          <button
            onClick={onRefresh}
            className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
        <div className="mt-2">
          <p className="text-sm text-red-600">{customersError}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-6 2xl:flex-row">
      {/* Table Content */}
      <div
        className={
          showDesktopFilters
            ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
            : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
        }
      >
        <>
          <motion.div
            className="items-center justify-between border-b py-2 md:flex md:py-4"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
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

              <div>
                <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Debt Management Customers</p>
                <p className="text-sm text-gray-600">Customers with outstanding balances</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{pagination.totalCount} total customers</span>
              <button
                onClick={onRefresh}
                className="rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                title="Refresh customers"
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

              {/* Hide/Show Filters button - Desktop only (2xl and above) */}
              <button
                type="button"
                onClick={() => setShowDesktopFilters((prev) => !prev)}
                className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
              >
                {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                {showDesktopFilters ? "Hide filters" : "Show filters"}
                {getActiveFilterCount() > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </div>
          </motion.div>

          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={localFilters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by customer name or account number..."
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {localFilters.search && (
                <button
                  onClick={handleSearchCancel}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="size-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {customers.length === 0 ? (
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
                {localFilters.search ? "No matching customers found" : "No customers found"}
              </motion.p>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="w-full border-x bg-[#FFFFFF]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {customers.map((customer, index) => (
                  <motion.div
                    key={customer.customerId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100">
                          <UserIcon />
                        </div>
                        <div>
                          <h6 className="text-sm font-medium text-gray-900">{customer.customerName}</h6>
                          <p className="text-xs text-gray-500">Account: {customer.accountNumber}</p>
                          {customer.lastLedgerAtUtc && (
                            <p className="text-xs text-gray-400">
                              Last activity: {formatDate(customer.lastLedgerAtUtc)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">
                          {formatCurrency(customer.outstandingBalance)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Debits: {formatCurrency(customer.totalDebits)} / Credits:{" "}
                          {formatCurrency(customer.totalCredits)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                  Page {pagination.currentPage} of {pagination.totalPages || 1} (
                  {pagination.totalCount.toLocaleString()} total customers)
                </p>
              </div>
            </>
          )}

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
            sortOptions={[...sortOptions]}
            amountRange={amountRange}
          />
        </>
      </div>

      {/* Desktop Filters Sidebar (2xl and above) */}
      {showDesktopFilters && (
        <motion.div
          key="desktop-filters-sidebar-customers"
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
                disabled={customersLoading}
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
                    onChange={(e) => handleFilterChange("minDebt", e.target.value ? Number(e.target.value) : "")}
                    placeholder="0"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 md:text-sm">Max:</span>
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
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{option.label}</span>
                    {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                      <span className="text-blue-600">
                        {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Filter Buttons */}
          <div className="border-t pt-4">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  applyFilters()
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <Filter className="size-4" />
                  Apply Filters
                </div>
              </button>
              <button
                onClick={resetFilters}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

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
  onViewDetails,
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
  onViewDetails: (entry: DebtEntryData) => void
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)

  // Local state for filters
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
    sortOrder: "asc" as "asc" | "desc",
  })

  // Sort options
  const sortOptions: { label: string; value: string; order: "asc" | "desc" }[] = [
    { label: "Amount: Low to High", value: "amount", order: "asc" },
    { label: "Amount: High to Low", value: "amount", order: "desc" },
    { label: "Created Date: Oldest First", value: "createdAt", order: "asc" },
    { label: "Created Date: Newest First", value: "createdAt", order: "desc" },
    { label: "Customer Name: A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name: Z-A", value: "customerName", order: "desc" },
  ]

  // Get min and max amounts from entries for range filtering
  const getAmountRange = () => {
    if (allDebtEntries.length === 0) return { min: 0, max: 100000 }
    const amounts = allDebtEntries.map((entry) => entry.amount)
    return { min: Math.min(...amounts), max: Math.max(...amounts) }
  }

  const amountRange = getAmountRange()

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
    onPageChange(1) // Reset to first page when sort changes
  }

  // Apply filters
  const applyFilters = () => {
    // Apply the filters to the parent component
    onCustomerIdFilterChange(localFilters.customerId ? Number(localFilters.customerId) : undefined)
    onStatusFilterChange(localFilters.status ? Number(localFilters.status) : undefined)
    onPaymentTypeIdFilterChange(localFilters.paymentTypeId ? Number(localFilters.paymentTypeId) : undefined)
    onPageChange(1) // Reset to first page when filters are applied
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
      sortOrder: "asc",
    })
    onCustomerIdFilterChange(undefined)
    onStatusFilterChange(undefined)
    onPaymentTypeIdFilterChange(undefined)
    onPageChange(1)
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
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="whitespace-nowrap border-b p-3 sm:p-4">
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(7)].map((_, cellIndex) => (
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
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
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
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-6 2xl:flex-row">
      {/* Table Content */}
      <div
        className={
          showDesktopFilters
            ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
            : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
        }
      >
        <>
          <motion.div
            className="items-center justify-between border-b py-2 md:flex md:py-4"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
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

              <div>
                <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">All Manually Entered Debts</p>
                <p className="text-sm text-gray-600">View and manage all debt entries</p>
              </div>
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

              {/* Hide/Show Filters button - Desktop only (2xl and above) */}
              <button
                type="button"
                onClick={() => setShowDesktopFilters((prev) => !prev)}
                className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
              >
                {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                {showDesktopFilters ? "Hide filters" : "Show filters"}
                {getActiveFilterCount() > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {getActiveFilterCount()}
                  </span>
                )}
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
                      <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                        <div className="flex items-center gap-2">
                          Customer <RxCaretSort />
                        </div>
                      </th>
                      <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                        <div className="flex items-center gap-2">
                          Amount <RxCaretSort />
                        </div>
                      </th>
                      <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                        <div className="flex items-center gap-2">
                          Payment Type <RxCaretSort />
                        </div>
                      </th>
                      <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                        <div className="flex items-center gap-2">
                          Status <RxCaretSort />
                        </div>
                      </th>
                      <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                        <div className="flex items-center gap-2">
                          Created <RxCaretSort />
                        </div>
                      </th>
                      <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                        <div className="flex items-center gap-2">
                          Effective Date <RxCaretSort />
                        </div>
                      </th>
                      <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                        <div className="flex items-center gap-2">Actions</div>
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
                        <td className="whitespace-nowrap border-b px-4 py-3">
                          <ButtonModule
                            size="sm"
                            variant="outline"
                            icon={<VscEye />}
                            onClick={() => onViewDetails(entry)}
                            className="flex items-center gap-1 rounded-md border text-sm font-medium transition-colors"
                          >
                            View Details
                          </ButtonModule>
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
                  Page {pagination.currentPage} of {pagination.totalPages || 1} (
                  {pagination.totalCount.toLocaleString()} total entries)
                </p>
              </div>
            </>
          )}

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
        </>
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
              <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
              <input
                type="text"
                value={localFilters.customerId || ""}
                onChange={(e) => handleFilterChange("customerId", e.target.value)}
                placeholder="Enter customer ID"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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
                      handleFilterChange("status", localFilters.status === status.value ? "" : Number(status.value))
                    }
                    className={`rounded-md px-3 py-2 text-xs transition-colors ${status.color} ${
                      localFilters.status === status.value ? "ring-2 ring-current ring-offset-1" : "hover:opacity-90"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Type Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Type</label>
              <input
                type="text"
                value={localFilters.paymentTypeId || ""}
                onChange={(e) => handleFilterChange("paymentTypeId", e.target.value)}
                placeholder="Enter payment type ID"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Amount Range Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Amount Range (NGN)</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 md:text-sm">Min:</span>
                  <input
                    type="number"
                    value={localFilters.minAmount || ""}
                    onChange={(e) => handleFilterChange("minAmount", e.target.value ? Number(e.target.value) : "")}
                    placeholder="0"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 md:text-sm">Max:</span>
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
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{option.label}</span>
                    {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                      <span className="text-blue-600">
                        {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Filter Buttons */}
          <div className="border-t pt-4">
            <div className="flex gap-3">
              <button
                onClick={applyFilters}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <Filter className="size-4" />
                  Apply Filters
                </div>
              </button>
              <button
                onClick={resetFilters}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <X className="size-4" />
                  Reset All
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

interface DebtManagementInfoProps {
  // Props for DebtManagementCustomers
  customers: DebtManagementCustomer[]
  customersLoading: boolean
  customersError: string | null
  customersPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  onCustomersPageChange: (page: number) => void
  onRefreshCustomers: () => void
  onCustomersSearchChange?: (search: string) => void
  onCustomersCustomerIdFilterChange?: (customerId: number | undefined) => void
  onCustomersMinDebtFilterChange?: (minDebt: number | undefined) => void
  onCustomersMaxDebtFilterChange?: (maxDebt: number | undefined) => void
  onCustomersSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void

  // Props for AllDebtEntriesTable
  allDebtEntries: DebtEntryData[]
  allDebtEntriesLoading: boolean
  allDebtEntriesError: string | null
  allDebtEntriesPagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }
  onAllDebtEntriesPageChange: (page: number) => void
  onRefreshAllDebtEntries: () => void
  selectedCustomerId?: number
  selectedStatus?: number
  selectedPaymentTypeId?: number
  onCustomerIdFilterChange: (customerId: number | undefined) => void
  onStatusFilterChange: (status: number | undefined) => void
  onPaymentTypeIdFilterChange: (paymentTypeId: number | undefined) => void
  onViewEntryDetails: (entry: DebtEntryData) => void
}

const DebtManagementInfo: React.FC<DebtManagementInfoProps> = ({
  customers,
  customersLoading,
  customersError,
  customersPagination,
  onCustomersPageChange,
  onRefreshCustomers,
  onCustomersSearchChange,
  onCustomersCustomerIdFilterChange,
  onCustomersMinDebtFilterChange,
  onCustomersMaxDebtFilterChange,
  onCustomersSortChange,
  allDebtEntries,
  allDebtEntriesLoading,
  allDebtEntriesError,
  allDebtEntriesPagination,
  onAllDebtEntriesPageChange,
  onRefreshAllDebtEntries,
  selectedCustomerId,
  selectedStatus,
  selectedPaymentTypeId,
  onCustomerIdFilterChange,
  onStatusFilterChange,
  onPaymentTypeIdFilterChange,
  onViewEntryDetails,
}) => {
  const [activeTab, setActiveTab] = useState("Customers")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "Customers":
        return (
          <DebtManagementCustomers
            customers={customers}
            customersLoading={customersLoading}
            customersError={customersError}
            pagination={customersPagination}
            onPageChange={onCustomersPageChange}
            onRefresh={onRefreshCustomers}
            onSearchChange={onCustomersSearchChange}
            onCustomerIdFilterChange={onCustomersCustomerIdFilterChange}
            onMinDebtFilterChange={onCustomersMinDebtFilterChange}
            onMaxDebtFilterChange={onCustomersMaxDebtFilterChange}
            onSortChange={onCustomersSortChange}
          />
        )
      case "DebtEntries":
        return (
          <AllDebtEntriesTable
            allDebtEntries={allDebtEntries}
            allDebtEntriesLoading={allDebtEntriesLoading}
            allDebtEntriesError={allDebtEntriesError}
            pagination={allDebtEntriesPagination}
            onPageChange={onAllDebtEntriesPageChange}
            onRefresh={onRefreshAllDebtEntries}
            selectedCustomerId={selectedCustomerId}
            selectedStatus={selectedStatus}
            selectedPaymentTypeId={selectedPaymentTypeId}
            onCustomerIdFilterChange={onCustomerIdFilterChange}
            onStatusFilterChange={onStatusFilterChange}
            onPaymentTypeIdFilterChange={onPaymentTypeIdFilterChange}
            onViewDetails={onViewEntryDetails}
          />
        )
      case "DebtRecovery":
        return <AllDebtRecovery />
      default:
        return (
          <DebtManagementCustomers
            customers={customers}
            customersLoading={customersLoading}
            customersError={customersError}
            pagination={customersPagination}
            onPageChange={onCustomersPageChange}
            onRefresh={onRefreshCustomers}
            onSearchChange={onCustomersSearchChange}
            onCustomerIdFilterChange={onCustomersCustomerIdFilterChange}
            onMinDebtFilterChange={onCustomersMinDebtFilterChange}
            onMaxDebtFilterChange={onCustomersMaxDebtFilterChange}
            onSortChange={onCustomersSortChange}
          />
        )
    }
  }

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <DebtManagementTabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-4">{renderTabContent()}</div>
    </div>
  )
}

export default DebtManagementInfo
