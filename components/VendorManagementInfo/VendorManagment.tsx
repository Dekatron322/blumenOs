import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
  MapPin,
  Phone,
  Search,
  SortAsc,
  SortDesc,
  Users,
  X,
} from "lucide-react"
import { RxCaretSort } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { SearchModule } from "components/ui/Search/search-module"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchVendors } from "lib/redux/vendorSlice"
import EmptySearchState from "components/ui/EmptySearchState"

// ==================== Status Badge Component ====================
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    const normalized = status.toLowerCase()
    if (normalized === "active") {
      return {
        label: "Active",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
      }
    }
    if (normalized === "inactive") {
      return {
        label: "Inactive",
        className: "bg-gray-50 text-gray-700 border-gray-200",
        dotColor: "bg-gray-500",
      }
    }
    if (normalized === "low stock") {
      return {
        label: "Low Stock",
        className: "bg-red-50 text-red-700 border-red-200",
        dotColor: "bg-red-500",
      }
    }
    return {
      label: status,
      className: "bg-gray-50 text-gray-700 border-gray-200",
      dotColor: "bg-gray-500",
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
  vendor: Vendor
  onViewDetails: (vendor: Vendor) => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ vendor, onViewDetails }) => {
  const handleViewDetails = () => {
    onViewDetails(vendor)
  }

  const handleEdit = () => {
    // Handle edit logic
    console.log("Edit vendor:", vendor.id)
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
        <Search className="size-3" />
        <span className="hidden sm:inline">Details</span>
      </motion.button>
    </div>
  )
}

// Filter Sidebar Component for Mobile
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
  statusOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | boolean | undefined) => void
  handleSortChange: (option: { label: string; value: string; order: "asc" | "desc" }) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  sortOptions: { label: string; value: string; order: "asc" | "desc" }[]
  statusOptions: { value: string; label: string }[]
}) => {
  const [isSortExpanded, setIsSortExpanded] = useState(true)
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm lg:hidden"
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
                  <label className="mb-2 block text-sm font-medium text-gray-700">Search Vendor</label>
                  <input
                    type="text"
                    value={localFilters.search || ""}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    placeholder="Search by name or phone"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Filters Section */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">Filters</span>
                    {isFiltersExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {isFiltersExpanded && (
                    <div className="mt-3 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      {/* Status Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">Status</label>
                        <FormSelectModule
                          value={localFilters.status || ""}
                          onChange={(e) => handleFilterChange("status", e.target.value)}
                          options={statusOptions}
                          className="w-full"
                          name={"status"}
                        />
                      </div>
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

interface Vendor {
  id: number
  name: string
  status: "active" | "inactive" | "low stock"
  phone: string
  location: string
  dailySales: string
  transactionsToday: number
  stockBalance: string
  commissionRate: string
  performance: "Excellent" | "Good" | "Average" | "Poor"
  businessType: string
  totalRevenue: string
  contactPerson: string
}

interface VendorManagementProps {
  onStartNewCycle?: () => void
}

const VendorManagement: React.FC<VendorManagementProps> = ({ onStartNewCycle }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { vendors: apiVendors, loading, error } = useAppSelector((state) => state.vendors)

  const [searchInput, setSearchInput] = useState("")
  const [searchText, setSearchText] = useState("")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Local state for filters
  const [localFilters, setLocalFilters] = useState<{
    status?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
    search?: string
  }>({
    sortBy: "",
    sortOrder: "asc",
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState<{
    status?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }>({})

  // Filter options
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "low stock", label: "Low Stock" },
  ]

  const sortOptions = [
    { label: "Name (A-Z)", value: "name", order: "asc" as const },
    { label: "Name (Z-A)", value: "name", order: "desc" as const },
    { label: "Status (A-Z)", value: "status", order: "asc" as const },
    { label: "Status (Z-A)", value: "status", order: "desc" as const },
    { label: "Location (A-Z)", value: "location", order: "asc" as const },
    { label: "Location (Z-A)", value: "location", order: "desc" as const },
  ]

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  // Handle sort changes
  const handleSortChange = (option: { label: string; value: string; order: "asc" | "desc" }) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({
      status: localFilters.status,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortOrder || undefined,
    })
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({})
    setSearchText("")
    setSearchInput("")
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.status) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
    setCurrentPage(1)
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      setSearchText(trimmed)
      setCurrentPage(1)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleViewDetails = (vendor: Vendor) => {
    router.push(`/vendor-management/vendor-detail/${vendor.id}`)
  }

  // Fetch vendors with filters
  useEffect(() => {
    dispatch(
      fetchVendors({
        pageNumber: currentPage,
        pageSize,
        ...(searchText && { search: searchText }),
        ...(appliedFilters.status && { status: appliedFilters.status }),
        ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
        ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
      })
    )
  }, [dispatch, currentPage, pageSize, searchText, appliedFilters])

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= 10) {
      // Assuming max 10 pages for now
      setCurrentPage(page)
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "N/A"
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading && apiVendors.length === 0) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-red-900">Error Loading Vendors</h3>
          <button
            onClick={() => {
              setAppliedFilters({})
              setCurrentPage(1)
              dispatch(fetchVendors({ pageNumber: 1, pageSize }))
            }}
            className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
        <div className="mt-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const mapStatus = (status: string, isSuspended: boolean): Vendor["status"] => {
    if (isSuspended) return "inactive"
    const normalized = status.toLowerCase()
    if (normalized.includes("inactive")) return "inactive"
    if (normalized.includes("low")) return "low stock"
    return "active"
  }

  const mappedVendors: Vendor[] = apiVendors.map((v) => ({
    id: v.id,
    name: v.name,
    status: mapStatus(v.status, v.isSuspended),
    phone: v.phoneNumber,
    location: [v.city, v.state].filter(Boolean).join(", "),
    dailySales: "₦0",
    transactionsToday: 0,
    stockBalance: "₦0",
    commissionRate: `U: ${v.urbanCommissionPercent}%, R: ${v.ruralCommissionPercent}%`,
    performance: "Good",
    businessType: "",
    totalRevenue: "₦0",
    contactPerson: v.employeeName,
  }))

  const vendors = mappedVendors.filter((vendor) => {
    if (!searchText) return true
    const q = searchText.toLowerCase()
    return (
      vendor.name.toLowerCase().includes(q) ||
      vendor.contactPerson.toLowerCase().includes(q) ||
      vendor.location.toLowerCase().includes(q)
    )
  })

  return (
    <div className="w-full space-y-5">
      {/* Header Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Vendor Directory</h2>
            <p className="mt-1 text-xs text-gray-600">Manage and monitor all vendors</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
                onClick={() => {
                  dispatch(fetchVendors({ pageNumber: currentPage, pageSize, ...appliedFilters }))
                }}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
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
            {appliedFilters.status && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                Status: {appliedFilters.status}
                <button
                  onClick={() => {
                    setLocalFilters((prev) => ({ ...prev, status: undefined }))
                    setAppliedFilters((prev) => ({ ...prev, status: undefined }))
                  }}
                  className="ml-0.5 hover:text-blue-900"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Search Priority Section */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-green-50/60 to-white p-4 shadow-sm">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#004B23]">Primary action</p>
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Search Vendors</h2>
          <p className="text-xs text-gray-600 sm:text-sm">Find vendors quickly by name, phone number, or vendor ID.</p>
        </div>

        <SearchModule
          value={searchInput}
          onChange={handleSearchChange}
          onCancel={handleCancelSearch}
          onSearch={handleManualSearch}
          placeholder="Search by vendor name, phone number, or vendor ID..."
          height="h-14"
          className="!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm md:!w-full [&_button]:min-h-[38px] [&_button]:px-4 [&_button]:text-sm [&_input]:text-sm sm:[&_input]:text-base"
        />
      </div>

      {/* Main Content with Table on Left, Filters on Right */}
      <div className="flex flex-col-reverse gap-5 lg:flex-row">
        {/* Table - Takes remaining width */}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {vendors.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center px-4">
                <EmptySearchState
                  title="No vendors found"
                  description={
                    searchText || getActiveFilterCount() > 0
                      ? "Try adjusting your search or filters"
                      : "Vendors will appear here"
                  }
                />
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
                            onClick={() => {
                              const option = sortOptions.find((o) => o.value === "name")
                              if (option) handleSortChange(option)
                            }}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Vendor
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => {
                              const option = sortOptions.find((o) => o.value === "name")
                              if (option) handleSortChange(option)
                            }}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Contact
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => {
                              const option = sortOptions.find((o) => o.value === "location")
                              if (option) handleSortChange(option)
                            }}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Location
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            Commission Rate
                          </span>
                        </th>
                        <th className="p-2 text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            Daily Sales
                          </span>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => {
                              const option = sortOptions.find((o) => o.value === "status")
                              if (option) handleSortChange(option)
                            }}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Status
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            Actions
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {vendors.map((vendor, index) => (
                          <motion.tr
                            key={vendor.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.01 }}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                          >
                            <td className="whitespace-nowrap p-2 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="flex size-6 items-center justify-center rounded-full bg-gray-100">
                                  <Users className="size-3" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{vendor.name}</div>
                                  <div className="text-gray-500">{vendor.contactPerson}</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              <div className="flex items-center gap-1">
                                <Phone className="size-3 text-gray-400" />
                                <span>{vendor.phone}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              <div className="flex items-center gap-1">
                                <MapPin className="size-3 text-gray-400" />
                                <span>{vendor.location}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs font-semibold text-green-600">
                              {vendor.commissionRate}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs font-semibold text-gray-900">
                              {vendor.dailySales}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs">
                              <StatusBadge status={vendor.status} />
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <ActionButtons vendor={vendor} onViewDetails={handleViewDetails} />
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
                    <FormSelectModule
                      value={pageSize.toString()}
                      onChange={(value) => {
                        // Handle page size change if needed
                        setCurrentPage(1)
                      }}
                      options={[
                        { value: "10", label: "10" },
                        { value: "20", label: "20" },
                        { value: "50", label: "50" },
                        { value: "100", label: "100" },
                      ]}
                      className="w-16"
                      name={""}
                    />
                    <p className="text-xs text-gray-600">
                      {currentPage * pageSize - pageSize + 1}-{Math.min(currentPage * pageSize, vendors.length)} of{" "}
                      {vendors.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex size-6 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdOutlineArrowBackIosNew className="size-3" />
                    </button>

                    {Array.from({ length: Math.min(5, 10) }).map((_, index) => {
                      let pageNum
                      const totalPages = 10
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
                          onClick={() => handlePageChange(pageNum)}
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

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === 10}
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
                {/* Status Filter */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <FormSelectModule
                    value={localFilters.status || ""}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    options={statusOptions}
                    className="w-full"
                    name={"status"}
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
                    <span className="font-medium text-gray-900">{vendors.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Page:</span>
                    <span className="font-medium text-gray-900">{currentPage}/10</span>
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
        statusOptions={statusOptions}
      />
    </div>
  )
}

export default VendorManagement
