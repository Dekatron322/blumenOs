import React, { useState } from "react"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import Dropdown from "components/Dropdown/Dropdown"
import DebtManagementTabNavigation from "./DebtManagementTabNavigation"
import type { DebtEntryData, DebtManagementCustomer } from "lib/redux/debtManagementSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { VscEye } from "react-icons/vsc"

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
      <div className="flex flex-col items-start gap-6 2xl:flex-row">
        <div className="w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
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
          </div>
        </div>
      </div>
    )
  }

  if (customersError) {
    return (
      <div className="flex flex-col items-start gap-6 2xl:flex-row">
        <div className="w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
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
                  <h5 className="text-sm font-medium text-red-800">Customers Error</h5>
                  <p className="text-xs text-red-600">{customersError}</p>
                </div>
              </div>
              <button
                onClick={onRefresh}
                className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
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
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col border-b p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-100 p-2">
                  <svg className="size-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900">Debt Management Customers</h5>
                  <p className="text-xs text-gray-500">Customers with outstanding balances</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Filter Button for ALL screens */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Filter className="size-4" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>

                  {/* Active filters badge */}
                  {getActiveFilterCount() > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                      </span>
                      <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-800">
                        Clear all
                      </button>
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
                </div>
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
              </div>
            </div>

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
          </div>

          <div className="divide-y">
            {customers.length === 0 ? (
              <div className="p-8 text-center">
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
                <h3 className="mt-4 text-sm font-medium text-gray-900">No customers found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {localFilters.search
                    ? "No customers match your search criteria."
                    : "No customers with outstanding balances in the current period."}
                </p>
              </div>
            ) : (
              customers.map((customer) => (
                <div key={customer.customerId} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100">
                        <span className="text-sm font-medium text-indigo-600">
                          {customer.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h6 className="text-sm font-medium text-gray-900">{customer.customerName}</h6>
                        <p className="text-xs text-gray-500">Account: {customer.accountNumber}</p>
                        {customer.lastLedgerAtUtc && (
                          <p className="text-xs text-gray-400">Last activity: {formatDate(customer.lastLedgerAtUtc)}</p>
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
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{" "}
                  {pagination.totalCount} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  if (allDebtEntriesLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">All Debt Entries</h3>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        </div>
        <div className="mt-4 space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 w-full rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
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
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">All Debt Entries</h3>
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Filter Button for ALL screens */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Filter className="size-4" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>

                  {/* Active filters badge */}
                  {getActiveFilterCount() > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                      </span>
                      <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-800">
                        Clear all
                      </button>
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
                </div>
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
            </div>

            {/* Enhanced Filter Controls */}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Payment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Effective Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {allDebtEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      No debt entries found
                    </td>
                  </tr>
                ) : (
                  allDebtEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{entry.customerName}</div>
                          <div className="text-xs text-gray-500">{entry.customerAccountNumber}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{entry.paymentTypeName}</td>
                      <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(entry.status)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(entry.effectiveAtUtc)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{" "}
                  {pagination.totalCount} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
              <select
                value={localFilters.customerId || ""}
                onChange={(e) => handleFilterChange("customerId", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Customers</option>
                {/* Options would be populated dynamically */}
              </select>
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
              <select
                value={localFilters.paymentTypeId || ""}
                onChange={(e) => handleFilterChange("paymentTypeId", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Payment Types</option>
                {/* Options would be populated dynamically */}
              </select>
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
