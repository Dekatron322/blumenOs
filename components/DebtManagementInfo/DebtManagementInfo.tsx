import React, { useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
  Search,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import Dropdown from "components/Dropdown/Dropdown"
import DebtManagementTabNavigation from "./DebtManagementTabNavigation"
import AllDebtRecovery from "components/BillingInfo/AllDebtRecovery"
import type { DebtEntryData, DebtManagementCustomer } from "lib/redux/debtManagementSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { VscEye } from "react-icons/vsc"
import { UserIcon } from "components/Icons/Icons"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { type Customer, fetchCustomers } from "lib/redux/customerSlice"
import EmptySearchState from "components/ui/EmptySearchState"

// ==================== Status Badge Component ====================
const StatusBadge = ({ status }: { status: number }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 1:
        return {
          label: "Pending",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          dotColor: "bg-amber-500",
        }
      case 2:
        return {
          label: "Approved",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dotColor: "bg-emerald-500",
        }
      case 3:
        return {
          label: "Rejected",
          className: "bg-red-50 text-red-700 border-red-200",
          dotColor: "bg-red-500",
        }
      default:
        return {
          label: "Pending",
          className: "bg-gray-50 text-gray-700 border-gray-200",
          dotColor: "bg-gray-500",
        }
    }
  }

  const config = getStatusConfig()

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  )
}
// ==================== Action Buttons Component ====================
interface ActionButtonsProps {
  customer: DebtManagementCustomer
  onViewDetails: (customer: DebtManagementCustomer) => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ customer, onViewDetails }) => {
  const handleViewDetails = () => {
    onViewDetails(customer)
  }

  const handleViewLedger = () => {
    // Handle view ledger logic
    console.log("View ledger for customer:", customer.customerId)
  }

  return (
    <div className="flex items-center gap-1">
      <motion.button
        onClick={handleViewDetails}
        className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="View Details"
      >
        <VscEye className="size-3" />
        <span className="hidden sm:inline">Details</span>
      </motion.button>

      <motion.button
        onClick={handleViewLedger}
        className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="View Ledger"
      >
        <Search className="size-3" />
        <span className="hidden sm:inline">Ledger</span>
      </motion.button>
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
            <div className="shrink-0 border-t bg-white p-4">
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

// ==================== Loading Skeleton ====================
const LoadingSkeleton = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-6 w-40 rounded-lg bg-gray-200"></div>
            <div className="mt-1 h-4 w-56 rounded-lg bg-gray-200"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-lg bg-gray-200"></div>
            <div className="h-9 w-28 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {[...Array(7)].map((_, i) => (
                <th key={i} className="px-3 py-2.5">
                  <div className="h-3.5 w-16 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {[...Array(7)].map((_, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2.5">
                    <div className="h-3.5 w-full rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-40 rounded bg-gray-200"></div>
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded-lg bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
  onCustomerIdFilterChange?: (customerId: number | undefined) => void
  onMinDebtFilterChange?: (minDebt: number | undefined) => void
  onMaxDebtFilterChange?: (maxDebt: number | undefined) => void
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void
}) => {
  const dispatch = useAppDispatch()
  const { customers: customerList, loading: customersLoadingList } = useAppSelector((state) => state.customers)

  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    minDebt: undefined as number | undefined,
    maxDebt: undefined as number | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
    lastLedgerStartDate: undefined as string | undefined,
    lastLedgerEndDate: undefined as string | undefined,
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    customerId: undefined as number | undefined,
    minDebt: undefined as number | undefined,
    maxDebt: undefined as number | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
    lastLedgerStartDate: undefined as string | undefined,
    lastLedgerEndDate: undefined as string | undefined,
  })

  const currentPage = pagination?.currentPage || 1
  const pageSize = pagination?.pageSize || 10
  const totalRecords = pagination?.totalCount || 0
  const totalPages = pagination?.totalPages || 0

  // Sort options
  const sortOptions = [
    { label: "Customer Name (A-Z)", value: "customerName", order: "asc" as const },
    { label: "Customer Name (Z-A)", value: "customerName", order: "desc" as const },
    { label: "Balance (Low to High)", value: "outstandingBalance", order: "asc" as const },
    { label: "Balance (High to Low)", value: "outstandingBalance", order: "desc" as const },
    { label: "Account No (Asc)", value: "accountNumber", order: "asc" as const },
    { label: "Account No (Desc)", value: "accountNumber", order: "desc" as const },
    { label: "Last Activity (Newest)", value: "lastLedgerAtUtc", order: "desc" as const },
    { label: "Last Activity (Oldest)", value: "lastLedgerAtUtc", order: "asc" as const },
  ]

  // Fetch customers on component mount
  useEffect(() => {
    dispatch(fetchCustomers({ pageNumber: 1, pageSize: 1000 }))
  }, [dispatch])

  // Prepare customer options for FormSelectModule
  const customerOptions = customerList.map((customer: Customer) => ({
    value: customer.id,
    label: `${customer.fullName} (${customer.accountNumber})`,
  }))

  // Handle customer search
  const handleCustomerSearch = (searchTerm: string) => {
    setCustomerSearchTerm(searchTerm)
    if (searchTerm.length >= 2) {
      dispatch(fetchCustomers({ pageNumber: 1, pageSize: 100, search: searchTerm }))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    const newOrder = isAscending ? "desc" : "asc"
    setSortOrder(newOrder)
    setSortColumn(column)
    handleSortChange({
      label: column,
      value: column,
      order: newOrder,
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      setSearchText(trimmed)
      setCurrentPage(1)
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
  }

  const setCurrentPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    // Handle page size change if needed
    onPageChange(1)
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  const handleSortChange = (option: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  const applyFilters = () => {
    setAppliedFilters({
      customerId: localFilters.customerId,
      minDebt: localFilters.minDebt,
      maxDebt: localFilters.maxDebt,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortBy ? localFilters.sortOrder : undefined,
      lastLedgerStartDate: localFilters.lastLedgerStartDate,
      lastLedgerEndDate: localFilters.lastLedgerEndDate,
    })
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setLocalFilters({
      customerId: undefined,
      minDebt: undefined,
      maxDebt: undefined,
      sortBy: "",
      sortOrder: "asc",
      lastLedgerStartDate: undefined,
      lastLedgerEndDate: undefined,
    })
    setAppliedFilters({
      customerId: undefined,
      minDebt: undefined,
      maxDebt: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      lastLedgerStartDate: undefined,
      lastLedgerEndDate: undefined,
    })
    setSearchText("")
    setSearchInput("")
    setCurrentPage(1)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.customerId) count++
    if (appliedFilters.minDebt) count++
    if (appliedFilters.maxDebt) count++
    if (appliedFilters.lastLedgerStartDate) count++
    if (appliedFilters.lastLedgerEndDate) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  const handleViewDetails = (customer: DebtManagementCustomer) => {
    // Handle view details logic
    console.log("View customer details:", customer)
  }

  if (customersLoading) return <LoadingSkeleton />

  if (customersError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
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
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Debt Management Customers</h2>
            <p className="mt-1 text-xs text-gray-600">Customers with outstanding balances</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearch}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                placeholder="Search customers..."
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-8 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchInput && (
                <button
                  onClick={handleCancelSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:hidden"
              >
                <Filter className="size-3.5" />
                <span>Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {/* Desktop Filter Toggle */}
              <button
                onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                className="hidden items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:flex"
              >
                {showDesktopFilters ? <X className="size-3.5" /> : <Filter className="size-3.5" />}
                <span>{showDesktopFilters ? "Hide Filters" : "Show Filters"}</span>
                {getActiveFilterCount() > 0 && (
                  <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {/* Refresh Button */}
              <button
                onClick={onRefresh}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gray-200 pt-3">
            <span className="text-xs text-gray-600">Active:</span>
            {appliedFilters.customerId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                Customer ID
                <button
                  onClick={() => handleFilterChange("customerId", undefined)}
                  className="ml-0.5 hover:text-blue-900"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {appliedFilters.minDebt && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                Min Debt
                <button
                  onClick={() => handleFilterChange("minDebt", undefined)}
                  className="ml-0.5 hover:text-green-900"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {appliedFilters.maxDebt && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                Max Debt
                <button
                  onClick={() => handleFilterChange("maxDebt", undefined)}
                  className="ml-0.5 hover:text-green-900"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content with Table on Left, Filters on Right */}
      <div className="flex flex-col-reverse gap-5 lg:flex-row">
        {/* Table - Takes remaining width */}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {customers.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center px-4">
                <EmptySearchState title="No customers found" description={searchText || getActiveFilterCount() > 0
                    ? "Try adjusting your search or filters"
                    : "Customers with outstanding balances will appear here"} />
                {(searchText || getActiveFilterCount() > 0) && (
                  <button
                    onClick={resetFilters}
                    className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80">
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("customerName")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Customer
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("accountNumber")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Account
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("outstandingBalance")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Outstanding Balance
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("totalDebits")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Total Debits
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("totalCredits")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Total Credits
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("lastLedgerAtUtc")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Last Activity
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {customers.map((customer, index) => (
                          <motion.tr
                            key={customer.customerId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.01 }}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                          >
                            <td className="whitespace-nowrap p-2 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="flex size-6 items-center justify-center rounded-full bg-gray-100">
                                  <UserIcon />
                                </div>
                                <div className="font-medium text-gray-900">{customer.customerName}</div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">{customer.accountNumber}</td>
                            <td className="whitespace-nowrap p-2 text-xs font-semibold text-red-600">
                              {formatCurrency(customer.outstandingBalance)}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {formatCurrency(customer.totalDebits)}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {formatCurrency(customer.totalCredits)}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {formatDateTime(customer.lastLedgerAtUtc)}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600">Show rows</p>
                    <select
                      value={pageSize}
                      onChange={handleRowsChange}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <p className="text-xs text-gray-600">
                      {currentPage * pageSize - pageSize + 1}-{Math.min(currentPage * pageSize, totalRecords)} of{" "}
                      {totalRecords}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex size-6 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdOutlineArrowBackIosNew className="size-3" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = index + 1
                      } else if (currentPage <= 3) {
                        pageNum = index + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + index
                      } else {
                        pageNum = currentPage - 2 + index
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`flex size-6 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="text-xs text-gray-500">...</span>
                    )}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex size-6 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdOutlineArrowForwardIos className="size-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop Filter Panel - On the Right */}
        {showDesktopFilters && (
          <div className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Filters & Sorting</h3>
                <button onClick={resetFilters} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  Clear All
                </button>
              </div>
              {getActiveFilterCount() > 0 && (
                <p className="mt-1 text-xs text-gray-600">{getActiveFilterCount()} active filter(s)</p>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-3">
              <div className="space-y-4">
                {/* Customer Filter */}
                <div className="space-y-1">
                  <FormSelectModule
                    label="Customer"
                    name="customerId"
                    value={localFilters.customerId || ""}
                    onChange={(e) =>
                      handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={customerOptions}
                    searchable={true}
                    searchTerm={customerSearchTerm}
                    onSearchChange={handleCustomerSearch}
                    loading={customersLoadingList}
                    controlClassName="h-10"
                  />
                </div>

                {/* Amount Range Filter */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Outstanding Balance Range (NGN)</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Min:</span>
                      <input
                        type="number"
                        value={localFilters.minDebt || ""}
                        onChange={(e) =>
                          handleFilterChange("minDebt", e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="0"
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Max:</span>
                      <input
                        type="number"
                        value={localFilters.maxDebt || ""}
                        onChange={(e) =>
                          handleFilterChange("maxDebt", e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="No limit"
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Range Filters */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Last Activity From</label>
                  <input
                    type="date"
                    value={localFilters.lastLedgerStartDate || ""}
                    onChange={(e) => handleFilterChange("lastLedgerStartDate", e.target.value || undefined)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Last Activity To</label>
                  <input
                    type="date"
                    value={localFilters.lastLedgerEndDate || ""}
                    onChange={(e) => handleFilterChange("lastLedgerEndDate", e.target.value || undefined)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Sort Options */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Sort By</label>
                  <div className="space-y-1">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => handleSortChange(option)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                          localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                          <span>
                            {option.order === "asc" ? (
                              <SortAsc className="size-3.5" />
                            ) : (
                              <SortDesc className="size-3.5" />
                            )}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3">
              <button
                onClick={applyFilters}
                className="mb-2 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                Apply Filters
              </button>

              {/* Summary */}
              <div className="rounded-lg bg-gray-50 p-2">
                <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Summary</h4>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-gray-900">{totalRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Page:</span>
                    <span className="font-medium text-gray-900">
                      {currentPage}/{totalPages || 1}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filters:</span>
                    <span className="font-medium text-gray-900">{getActiveFilterCount()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Sidebar */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-[1000] flex size-full max-w-sm flex-col bg-white shadow-xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Filters & Sorting</h2>
                    {getActiveFilterCount() > 0 && (
                      <p className="mt-1 text-sm text-gray-600">{getActiveFilterCount()} active filter(s)</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-5">
                  {/* Customer Filter */}
                  <div className="space-y-1.5">
                    <FormSelectModule
                      label="Customer"
                      name="customerId"
                      value={localFilters.customerId || ""}
                      onChange={(e) =>
                        handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                      }
                      options={customerOptions}
                      searchable={true}
                      searchTerm={customerSearchTerm}
                      onSearchChange={handleCustomerSearch}
                      loading={customersLoadingList}
                      controlClassName="h-10"
                    />
                  </div>

                  {/* Amount Range Filter */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Outstanding Balance Range (NGN)</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Min:</span>
                        <input
                          type="number"
                          value={localFilters.minDebt || ""}
                          onChange={(e) =>
                            handleFilterChange("minDebt", e.target.value ? Number(e.target.value) : undefined)
                          }
                          placeholder="0"
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Max:</span>
                        <input
                          type="number"
                          value={localFilters.maxDebt || ""}
                          onChange={(e) =>
                            handleFilterChange("maxDebt", e.target.value ? Number(e.target.value) : undefined)
                          }
                          placeholder="No limit"
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date Range Filters */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Last Activity From</label>
                    <input
                      type="date"
                      value={localFilters.lastLedgerStartDate || ""}
                      onChange={(e) => handleFilterChange("lastLedgerStartDate", e.target.value || undefined)}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Last Activity To</label>
                    <input
                      type="date"
                      value={localFilters.lastLedgerEndDate || ""}
                      onChange={(e) => handleFilterChange("lastLedgerEndDate", e.target.value || undefined)}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Sort By</label>
                    <div className="space-y-1.5">
                      {sortOptions.map((option) => (
                        <button
                          key={`${option.value}-${option.order}`}
                          onClick={() => handleSortChange(option)}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                            localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span>{option.label}</span>
                          {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                            <span>
                              {option.order === "asc" ? (
                                <SortAsc className="size-3.5" />
                              ) : (
                                <SortDesc className="size-3.5" />
                              )}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      applyFilters()
                      setShowMobileFilters(false)
                    }}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => {
                      resetFilters()
                      setShowMobileFilters(false)
                    }}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
                <p className="text-lg font-medium max-sm:pb-3 md:text-xl">All Manually Entered Debts</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
              <EmptySearchState title="No debt entries found" />
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
