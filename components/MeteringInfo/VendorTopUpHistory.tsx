"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Filter,
  Info,
  Loader2,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchVendorTopUpHistory } from "lib/redux/vendorSlice"

interface VendorTopUpHistoryItem {
  id: number
  vendorId: number
  vendorName: string
  reference: string
  amount: number
  status: "Pending" | "Confirmed" | "Failed"
  createdAtUtc: string
  confirmedAtUtc?: string
  topUpBy: "Vendor" | "Admin"
  narrative?: string
}

interface VendorTopUpHistoryResponse {
  data: VendorTopUpHistoryItem[]
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// ==================== Status Badge Component ====================
const StatusBadge = ({ status }: { status: "Pending" | "Confirmed" | "Failed" }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Failed":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getDotColor = () => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-500"
      case "Pending":
        return "bg-amber-500"
      case "Failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusStyles()}`}
    >
      <span className={`size-1.5 rounded-full ${getDotColor()}`} />
      {status}
    </span>
  )
}

// ==================== TopUp By Badge Component ====================
const TopUpByBadge = ({ topUpBy }: { topUpBy: "Vendor" | "Admin" }) => {
  const getTopUpByStyles = () => {
    switch (topUpBy) {
      case "Vendor":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Admin":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getTopUpByStyles()}`}>
      {topUpBy}
    </span>
  )
}

// ==================== Action Buttons Component ====================
interface ActionButtonsProps {
  item: VendorTopUpHistoryItem
  onViewDetails: (item: VendorTopUpHistoryItem) => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ item, onViewDetails }) => {
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(item)
  }

  const handleViewHistory = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("View history:", item.reference)
  }

  return (
    <div className="flex items-center gap-1">
      <motion.button
        onClick={handleViewDetails}
        className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Eye className="size-3" />
        View Details
      </motion.button>
    </div>
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
              {[...Array(8)].map((_, i) => (
                <th key={i} className="px-3 py-2.5">
                  <div className="h-3.5 w-16 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {[...Array(8)].map((_, cellIndex) => (
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

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface VendorTopUpHistoryProps {
  pageSize?: number
}

// ==================== Mobile Filter Sidebar ====================
const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-5">
                {/* Quick Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Active Filters</span>
                  <button onClick={resetFilters} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Clear All
                  </button>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Status</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Pending", "Confirmed", "Failed"].map((statusValue) => (
                      <button
                        key={statusValue}
                        onClick={() =>
                          handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                        }
                        className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                          localFilters.status === statusValue
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {statusValue}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TopUp By Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Top-up By</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Vendor", "Admin"].map((topUpByValue) => (
                      <button
                        key={topUpByValue}
                        onClick={() =>
                          handleFilterChange(
                            "topUpBy",
                            localFilters.topUpBy === topUpByValue ? undefined : topUpByValue
                          )
                        }
                        className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                          localFilters.topUpBy === topUpByValue
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {topUpByValue}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => setIsSortExpanded(!isSortExpanded)}
                    className="flex w-full items-center justify-between text-xs font-medium text-gray-700"
                  >
                    <span>Sort By</span>
                    {isSortExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  </button>

                  <AnimatePresence>
                    {isSortExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5 overflow-hidden"
                      >
                        {sortOptions.map((option) => (
                          <button
                            key={`${option.value}-${option.order}`}
                            onClick={() => handleSortChange(option)}
                            className={`flex w-full items-center justify-between rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                              localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                                ? "border-purple-500 bg-purple-50 text-purple-700"
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg bg-[#004B23] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003618]"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
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
  )
}

// ==================== Desktop Filter Panel (Right Side) ====================
const DesktopFilterPanel = ({
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
  totalRecords,
  currentPage,
  totalPages,
}: {
  localFilters: any
  handleFilterChange: (key: string, value: string | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
  totalRecords: number
  currentPage: number
  totalPages: number
}) => {
  return (
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
            <label className="text-xs font-medium text-gray-700">Status</label>
            <div className="grid grid-cols-2 gap-1">
              {["Pending", "Confirmed", "Failed"].map((statusValue) => (
                <button
                  key={statusValue}
                  onClick={() =>
                    handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                  }
                  className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
                    localFilters.status === statusValue
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {statusValue}
                </button>
              ))}
            </div>
          </div>

          {/* TopUp By Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Top-up By</label>
            <div className="grid grid-cols-2 gap-1">
              {["Vendor", "Admin"].map((topUpByValue) => (
                <button
                  key={topUpByValue}
                  onClick={() =>
                    handleFilterChange("topUpBy", localFilters.topUpBy === topUpByValue ? undefined : topUpByValue)
                  }
                  className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
                    localFilters.topUpBy === topUpByValue
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {topUpByValue}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-1">
            <button
              onClick={() => setIsSortExpanded(!isSortExpanded)}
              className="flex w-full items-center justify-between text-xs font-medium text-gray-700"
            >
              <span>Sort By</span>
              {isSortExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>

            <AnimatePresence>
              {isSortExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={`${option.value}-${option.order}`}
                      onClick={() => handleSortChange(option)}
                      className={`flex w-full items-center justify-between rounded-lg border px-2 py-1 text-xs transition-colors ${
                        localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                          ? "border-purple-500 bg-purple-50 text-purple-700"
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={applyFilters}
          className="mb-2 w-full rounded-lg bg-[#004B23] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#003618]"
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
  )
}

const VendorTopUpHistory: React.FC<VendorTopUpHistoryProps> = ({ pageSize: propPageSize = 10 }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { vendorTopUpHistory, vendorTopUpHistoryPagination, vendorTopUpHistoryLoading, vendorTopUpHistoryError } =
    useAppSelector((state) => state.vendors)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    status: undefined as string | undefined,
    topUpBy: undefined as string | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    status: undefined as string | undefined,
    topUpBy: undefined as string | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  const currentPage = vendorTopUpHistoryPagination?.currentPage || 1
  const pageSize = vendorTopUpHistoryPagination?.pageSize || propPageSize
  const totalRecords = vendorTopUpHistoryPagination?.totalCount || 0
  const totalPages = vendorTopUpHistoryPagination?.totalPages || 0

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Reference A-Z", value: "reference", order: "asc" },
    { label: "Reference Z-A", value: "reference", order: "desc" },
    { label: "Vendor Name A-Z", value: "vendorName", order: "asc" },
    { label: "Vendor Name Z-A", value: "vendorName", order: "desc" },
    { label: "Amount Low-High", value: "amount", order: "asc" },
    { label: "Amount High-Low", value: "amount", order: "desc" },
    { label: "Date Newest", value: "createdAtUtc", order: "desc" },
    { label: "Date Oldest", value: "createdAtUtc", order: "asc" },
  ]

  // Fetch vendor top-up history based on applied filters
  useEffect(() => {
    const params: any = {
      pageNumber: currentPage,
      pageSize: pageSize,
      search: searchText || undefined,
      ...appliedFilters,
    }

    dispatch(fetchVendorTopUpHistory(params))
  }, [dispatch, currentPage, pageSize, searchText, appliedFilters])

  const handleViewDetails = (item: VendorTopUpHistoryItem) => {
    router.push(`/vendor-management/vendor-topup-detail/${item.id}`)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
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
      const params: any = {
        pageNumber: page,
        pageSize: pageSize,
        search: searchText || undefined,
        ...appliedFilters,
      }
      dispatch(fetchVendorTopUpHistory(params))
    }
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    const params: any = {
      pageNumber: 1,
      pageSize: newPageSize,
      search: searchText || undefined,
      ...appliedFilters,
    }
    dispatch(fetchVendorTopUpHistory(params))
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  const applyFilters = () => {
    setAppliedFilters({
      status: localFilters.status,
      topUpBy: localFilters.topUpBy,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortBy ? localFilters.sortOrder : undefined,
    })
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setLocalFilters({
      status: undefined,
      topUpBy: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({
      status: undefined,
      topUpBy: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setSearchText("")
    setSearchInput("")
    setCurrentPage(1)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.status) count++
    if (appliedFilters.topUpBy) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  const isLoading = vendorTopUpHistoryLoading

  if (isLoading && !vendorTopUpHistory?.length) return <LoadingSkeleton />
  if (vendorTopUpHistoryError)
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="size-4 text-red-600" />
          <p className="text-sm text-red-700">Error loading vendor top-up history: {vendorTopUpHistoryError}</p>
        </div>
      </div>
    )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vendor Top-up History</h2>
          <p className="mt-1 text-xs text-gray-600">View and manage all vendor top-up transactions</p>
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
              placeholder="Search top-ups..."
              className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-8 pr-8 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                <span className="flex size-4 items-center justify-center rounded-full bg-[#004B23] text-[10px] font-semibold text-white">
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
                <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-[#004B23] text-[10px] font-semibold text-white">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            {/* Export Button */}
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Export</span>
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
              Status
              <button onClick={() => handleFilterChange("status", undefined)} className="ml-0.5 hover:text-blue-900">
                <X className="size-2.5" />
              </button>
            </span>
          )}
          {appliedFilters.topUpBy && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
              Top-up By
              <button onClick={() => handleFilterChange("topUpBy", undefined)} className="ml-0.5 hover:text-purple-900">
                <X className="size-2.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {vendorTopUpHistoryError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2">
              <AlertCircle className="size-4 text-red-600" />
              <p className="text-xs text-red-700">{vendorTopUpHistoryError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with Table on Left, Filters on Right */}
      <div className="flex flex-col-reverse gap-5 lg:flex-row">
        {/* Table - Takes remaining width */}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {!vendorTopUpHistory?.length ? (
              <div className="flex h-72 flex-col items-center justify-center px-4">
                <div className="rounded-full bg-gray-100 p-3">
                  <Info className="size-6 text-gray-400" />
                </div>
                <p className="mt-3 text-base font-medium text-gray-900">No top-up history found</p>
                <p className="mt-1 text-xs text-gray-600">
                  {searchText || getActiveFilterCount() > 0
                    ? "Try adjusting your search or filters"
                    : "Vendor top-ups will appear here once processed"}
                </p>
                {(searchText || getActiveFilterCount() > 0) && (
                  <button
                    onClick={resetFilters}
                    className="mt-3 rounded-lg bg-[#004B23] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#003618]"
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
                            onClick={() => toggleSort("reference")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Reference
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("vendorName")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Vendor
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("amount")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Amount
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("status")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Status
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("topUpBy")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Top-up By
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("createdAtUtc")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Date
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
                        {vendorTopUpHistory?.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.01 }}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                          >
                            <td className="whitespace-nowrap p-2 text-xs font-medium text-gray-900">
                              {item.reference}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">{item.vendorName}</td>
                            <td className="whitespace-nowrap p-2 text-xs font-semibold text-gray-900">
                              {formatCurrency(item.amount)}
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <TopUpByBadge topUpBy={item.topUpBy} />
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {formatDateTime(item.createdAtUtc)}
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <ActionButtons item={item} onViewDetails={handleViewDetails} />
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
                              ? "bg-[#004B23] text-white"
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
          <DesktopFilterPanel
            localFilters={localFilters}
            handleFilterChange={handleFilterChange}
            handleSortChange={handleSortChange}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
            getActiveFilterCount={getActiveFilterCount}
            sortOptions={sortOptions}
            isSortExpanded={isSortExpanded}
            setIsSortExpanded={setIsSortExpanded}
            totalRecords={totalRecords}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}
      </div>

      {/* Mobile Filter Sidebar */}
      <MobileFilterSidebar
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />
    </div>
  )
}

export default VendorTopUpHistory
