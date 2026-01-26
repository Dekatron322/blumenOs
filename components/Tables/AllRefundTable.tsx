"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Download, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearRefundHistory,
  fetchRefundHistory,
  RefundHistoryItem,
  RefundHistoryParams,
  setRefundHistoryParams,
} from "lib/redux/refundSlice"
import { fetchCustomers } from "lib/redux/customerSlice"
import { fetchVendors } from "lib/redux/vendorSlice"
import { fetchAgents } from "lib/redux/agentSlice"
import { api } from "lib/redux/authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

interface ActionDropdownProps {
  refund: RefundHistoryItem
  onViewDetails: (refund: RefundHistoryItem) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ refund, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return

    const buttonRect = dropdownRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    const dropdownHeight = 120

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownDirection("top")
    } else {
      setDropdownDirection("bottom")
    }
  }

  const handleButtonClick = () => {
    calculateDropdownPosition()
    setIsOpen(!isOpen)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(refund)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="focus::bg-gray-100 flex size-7 cursor-pointer items-center justify-center gap-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-200"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <RxDotsVertical />
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={
              dropdownDirection === "bottom"
                ? {
                    top: dropdownRef.current
                      ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 2
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
                : {
                    bottom: dropdownRef.current
                      ? window.innerHeight - dropdownRef.current.getBoundingClientRect().top + window.scrollY + 2
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
            }
            initial={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -10 : 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="py-1">
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewDetails}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View Details
              </motion.button>

              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  // You can add edit payment functionality here
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Payment
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const LoadingSkeleton = () => {
  return (
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5">
      {/* Header Section Skeleton */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="mb-3 md:mb-0">
          <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
          <div className="h-4 w-64 rounded bg-gray-200"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-48 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(11)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(11)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section Skeleton */}
      <div className="flex items-center justify-between border-t py-3">
        <div className="h-6 w-48 rounded bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200"></div>
          ))}
          <div className="size-8 rounded bg-gray-200"></div>
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

interface AppliedFilters {
  agentId?: number
  customerId?: number
  vendorId?: number
  status?: "Pending" | "Confirmed" | "Failed" | "Reversed"
  channel?:
    | "Cash"
    | "BankTransfer"
    | "Pos"
    | "Card"
    | "VendorWallet"
    | "Chaque"
    | "BankDeposit"
    | "Vendor"
    | "Migration"
  reference?: string
  fromUtc?: string
  toUtc?: string
  refundTypeKey?: string
  pageNumber?: number
  pageSize?: number
}

// Mobile Filter Sidebar Component
const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  customerOptions,
  vendorOptions,
  agentOptions,
  channelOptions,
  statusOptions,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
  refundTypeOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | boolean | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  customerOptions: Array<{ value: string | number; label: string }>
  vendorOptions: Array<{ value: string | number; label: string }>
  agentOptions: Array<{ value: string | number; label: string }>
  channelOptions: Array<{ value: string; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
  refundTypeOptions: Array<{ value: string; label: string }>
}) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="mobile-filter-sidebar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <motion.div
            key="mobile-filter-content"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex h-full w-full max-w-sm flex-col bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="flex shrink-0 items-center justify-between border-b bg-white p-4">
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

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Customer Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
                  <FormSelectModule
                    name="customerId"
                    value={localFilters.customerId || ""}
                    onChange={(e) => handleFilterChange("customerId", e.target.value || undefined)}
                    options={customerOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Vendor Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Vendor</label>
                  <FormSelectModule
                    name="vendorId"
                    value={localFilters.vendorId || ""}
                    onChange={(e) => handleFilterChange("vendorId", e.target.value || undefined)}
                    options={vendorOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Agent Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Agent</label>
                  <FormSelectModule
                    name="agentId"
                    value={localFilters.agentId || ""}
                    onChange={(e) => handleFilterChange("agentId", e.target.value || undefined)}
                    options={agentOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Channel Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Channel</label>
                  <FormSelectModule
                    name="channel"
                    value={String(localFilters.channel || "")}
                    onChange={(e) => handleFilterChange("channel", e.target.value || undefined)}
                    options={channelOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange(
                              "status",
                              localFilters.status === option.value ? undefined : option.value
                            )
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.status === option.value
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Refund Type Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Refund Type</label>
                  <FormSelectModule
                    name="refundTypeKey"
                    value={String(localFilters.refundTypeKey || "")}
                    onChange={(e) => handleFilterChange("refundTypeKey", e.target.value || undefined)}
                    options={refundTypeOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Date Range Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Refund From</label>
                  <input
                    type="date"
                    value={localFilters.fromUtc || ""}
                    onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Refund To</label>
                  <input
                    type="date"
                    value={localFilters.toUtc || ""}
                    onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                {/* Text Input Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Reference</label>
                  <input
                    type="text"
                    value={localFilters.reference || ""}
                    onChange={(e) => handleFilterChange("reference", e.target.value || undefined)}
                    placeholder="Enter reference..."
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                {/* Sort Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsSortExpanded((prev) => !prev)}
                    className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                    aria-expanded={isSortExpanded}
                  >
                    <span>Sort By</span>
                    {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {isSortExpanded && (
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
                  )}
                </div>
              </div>
            </div>

            {/* Fixed Bottom Action Buttons */}
            <div className="shrink-0 border-t bg-white p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="button-filled flex w-full items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Filter className="size-4" />
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="button-outlined flex w-full items-center justify-center gap-2 text-sm md:text-base"
                >
                  <X className="size-4" />
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface AllRefundsTableProps {
  agentId?: number
  customerId?: number
  appliedFilters?: AppliedFilters
  showStatisticsOnly?: boolean
  showMobileFilters?: boolean
  setShowMobileFilters?: (show: boolean) => void
  showDesktopFilters?: boolean
  setShowDesktopFilters?: (show: boolean) => void
  getActiveFilterCount?: () => number
}

const AllRefundsTable: React.FC<AllRefundsTableProps> = ({
  agentId,
  customerId,
  appliedFilters = {} as AppliedFilters,
  showMobileFilters,
  setShowMobileFilters,
  showDesktopFilters,
  setShowDesktopFilters,
  getActiveFilterCount,
}) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { refundHistoryData, refundHistoryLoading, refundHistoryError, refundHistoryPagination, refundHistoryParams } =
    useAppSelector((state) => state.refunds)
  const { customers } = useAppSelector((state) => state.customers)
  const { vendors } = useAppSelector((state) => state.vendors)
  const { agents } = useAppSelector((state) => state.agents)
  const { user } = useAppSelector((state) => state.auth)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedRefund, setSelectedRefund] = useState<RefundHistoryItem | null>(null)
  const [showMobileFiltersLocal, setShowMobileFiltersLocal] = useState(false)
  const [showDesktopFiltersLocal, setShowDesktopFiltersLocal] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // Export CSV state
  const [isExporting, setIsExporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportDateRange, setExportDateRange] = useState<"all" | "today" | "week" | "month" | "custom">("all")
  const [exportFromDate, setExportFromDate] = useState("")
  const [exportToDate, setExportToDate] = useState("")
  const [exportChannel, setExportChannel] = useState<string>("all")
  const [exportStatus, setExportStatus] = useState<string>("all")
  const [exportCustomerId, setExportCustomerId] = useState<string>("")
  const [exportVendorId, setExportVendorId] = useState<string>("")
  const [exportAgentId, setExportAgentId] = useState<string>("")
  const [exportRefundTypeKey, setExportRefundTypeKey] = useState<string>("")
  const [exportReference, setExportReference] = useState<string>("")

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    status: undefined as "Pending" | "Confirmed" | "Failed" | "Reversed" | undefined,
    channel: undefined as
      | "Cash"
      | "BankTransfer"
      | "Pos"
      | "Card"
      | "VendorWallet"
      | "Chaque"
      | "BankDeposit"
      | "Vendor"
      | "Migration"
      | undefined,
    reference: undefined as string | undefined,
    fromUtc: undefined as string | undefined,
    toUtc: undefined as string | undefined,
    refundTypeKey: undefined as string | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state - triggers API calls
  const [appliedFiltersLocal, setAppliedFiltersLocal] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    status: undefined as "Pending" | "Confirmed" | "Failed" | "Reversed" | undefined,
    channel: undefined as
      | "Cash"
      | "BankTransfer"
      | "Pos"
      | "Card"
      | "VendorWallet"
      | "Chaque"
      | "BankDeposit"
      | "Vendor"
      | "Migration"
      | undefined,
    reference: undefined as string | undefined,
    fromUtc: undefined as string | undefined,
    toUtc: undefined as string | undefined,
    refundTypeKey: undefined as string | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  const handleViewRefundDetails = (refund: RefundHistoryItem) => {
    router.push(`/refund/refund-details/${refund.id}`)
  }

  // Get pagination values from Redux state
  const currentPage = refundHistoryPagination?.currentPage || 1
  const pageSize = refundHistoryPagination?.pageSize || 10
  const totalRecords = refundHistoryPagination?.totalCount || 0
  const totalPages = refundHistoryPagination?.totalPages || 0

  // Fetch related data for filters
  useEffect(() => {
    dispatch(
      fetchCustomers({
        pageNumber: 1,
        pageSize: 100,
      })
    )
    dispatch(
      fetchVendors({
        pageNumber: 1,
        pageSize: 100,
      })
    )
    dispatch(
      fetchAgents({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch])

  // Fetch refunds on component mount and when search/pagination/filters change
  useEffect(() => {
    const fetchParams: RefundHistoryParams = {
      PageNumber: currentPage,
      PageSize: pageSize,
      // Use agentId prop if provided, otherwise use appliedFilters.agentId
      ...(agentId !== undefined && { AgentId: agentId }),
      ...(customerId !== undefined && { CustomerId: customerId }),
      ...(searchText && { Reference: searchText }),
      // Applied filters from local state
      ...(appliedFiltersLocal.customerId && { CustomerId: appliedFiltersLocal.customerId }),
      ...(appliedFiltersLocal.vendorId && { VendorId: appliedFiltersLocal.vendorId }),
      ...(appliedFiltersLocal.agentId && { AgentId: appliedFiltersLocal.agentId }),
      ...(appliedFiltersLocal.status && { Status: appliedFiltersLocal.status }),
      ...(appliedFiltersLocal.channel && { Channel: appliedFiltersLocal.channel }),
      ...(appliedFiltersLocal.reference && { Reference: appliedFiltersLocal.reference }),
      ...(appliedFiltersLocal.fromUtc && { FromUtc: formatDateTime(appliedFiltersLocal.fromUtc, true) }),
      ...(appliedFiltersLocal.toUtc && { ToUtc: formatDateTime(appliedFiltersLocal.toUtc, false) }),
      ...(appliedFiltersLocal.refundTypeKey && { RefundTypeKey: appliedFiltersLocal.refundTypeKey }),
      ...(appliedFiltersLocal.sortBy && { SortBy: appliedFiltersLocal.sortBy }),
      ...(appliedFiltersLocal.sortOrder && { SortOrder: appliedFiltersLocal.sortOrder }),
    }

    dispatch(fetchRefundHistory(fetchParams))
  }, [dispatch, currentPage, pageSize, searchText, agentId, customerId, JSON.stringify(appliedFiltersLocal)])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearRefundHistory())
    }
  }, [dispatch])

  const formatDateTime = (dateString: string, isStartDate: boolean = true) => {
    if (!dateString) return undefined
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return undefined

    if (isStartDate) {
      // For start date, set time to beginning of day (00:00:00.000 local time)
      date.setHours(0, 0, 0, 0)
    } else {
      // For end date, set time to end of day (23:59:59.999 local time)
      date.setHours(23, 59, 59, 999)
    }

    return date.toISOString()
  }

  const getStatusStyle = (status: "Pending" | "Confirmed" | "Failed" | "Reversed") => {
    switch (status) {
      case "Confirmed":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          dotColor: "#589E67",
        }
      case "Pending":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
          dotColor: "#D97706",
        }
      case "Failed":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          dotColor: "#AF4B4B",
        }
      case "Reversed":
        return {
          backgroundColor: "#EFF6FF",
          color: "#3B82F6",
          dotColor: "#3B82F6",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          dotColor: "#6B7280",
        }
    }
  }

  const getChannelStyle = (
    channel:
      | "Cash"
      | "BankTransfer"
      | "Pos"
      | "Card"
      | "VendorWallet"
      | "Chaque"
      | "BankDeposit"
      | "Vendor"
      | "Migration"
  ) => {
    switch (channel) {
      case "Cash":
        return {
          backgroundColor: "#F3E8FF",
          color: "#7C3AED",
        }
      case "BankTransfer":
        return {
          backgroundColor: "#E0F2FE",
          color: "#0284C7",
        }
      case "Pos":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      case "Card":
        return {
          backgroundColor: "#FCE7F3",
          color: "#DB2777",
        }
      case "VendorWallet":
        return {
          backgroundColor: "#DCFCE7",
          color: "#16A34A",
        }
      case "Chaque":
        return {
          backgroundColor: "#FFEDD5",
          color: "#EA580C",
        }
      case "BankDeposit":
        return {
          backgroundColor: "#F0FDF4",
          color: "#166534",
        }
      case "Vendor":
        return {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
        }
      case "Migration":
        return {
          backgroundColor: "#EFF6FF",
          color: "#3B82F6",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
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
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
    handleSortChange({
      label: column,
      value: column,
      order: isAscending ? "desc" : "asc",
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
      dispatch(
        setRefundHistoryParams({
          ...refundHistoryParams,
          PageNumber: 1,
          PageSize: pageSize,
        } as RefundHistoryParams)
      )
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
    dispatch(
      setRefundHistoryParams({
        ...refundHistoryParams,
        PageNumber: 1,
        PageSize: pageSize,
      } as RefundHistoryParams)
    )
  }

  // Handle individual filter changes (local state)
  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  // Apply all filters at once
  const applyFilters = () => {
    setAppliedFiltersLocal({
      customerId: localFilters.customerId,
      vendorId: localFilters.vendorId,
      agentId: localFilters.agentId,
      status: localFilters.status,
      channel: localFilters.channel,
      reference: localFilters.reference,
      fromUtc: localFilters.fromUtc,
      toUtc: localFilters.toUtc,
      refundTypeKey: localFilters.refundTypeKey,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortOrder || undefined,
    })
    dispatch(
      setRefundHistoryParams({
        ...refundHistoryParams,
        PageNumber: 1,
        PageSize: pageSize,
      } as RefundHistoryParams)
    )
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      status: undefined,
      channel: undefined,
      reference: undefined,
      fromUtc: undefined,
      toUtc: undefined,
      refundTypeKey: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFiltersLocal({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      status: undefined,
      channel: undefined,
      reference: undefined,
      fromUtc: undefined,
      toUtc: undefined,
      refundTypeKey: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setSearchText("")
    setSearchInput("")
    dispatch(
      setRefundHistoryParams({
        ...refundHistoryParams,
        PageNumber: 1,
        PageSize: pageSize,
      } as RefundHistoryParams)
    )
  }

  // Get active filter count
  const getActiveFilterCountLocal = () => {
    let count = 0
    if (appliedFiltersLocal.customerId) count++
    if (appliedFiltersLocal.vendorId) count++
    if (appliedFiltersLocal.agentId) count++
    if (appliedFiltersLocal.status) count++
    if (appliedFiltersLocal.channel) count++
    if (appliedFiltersLocal.reference) count++
    if (appliedFiltersLocal.fromUtc) count++
    if (appliedFiltersLocal.toUtc) count++
    if (appliedFiltersLocal.refundTypeKey) count++
    if (appliedFiltersLocal.sortBy) count++
    return count
  }

  const paginate = (pageNumber: number) => {
    const fetchParams: RefundHistoryParams = {
      PageNumber: pageNumber,
      PageSize: pageSize,
      ...(agentId !== undefined && { AgentId: agentId }),
      ...(customerId !== undefined && { CustomerId: customerId }),
      ...(searchText && { Reference: searchText }),
      ...(appliedFiltersLocal.customerId && { CustomerId: appliedFiltersLocal.customerId }),
      ...(appliedFiltersLocal.vendorId && { VendorId: appliedFiltersLocal.vendorId }),
      ...(appliedFiltersLocal.agentId && { AgentId: appliedFiltersLocal.agentId }),
      ...(appliedFiltersLocal.status && { Status: appliedFiltersLocal.status }),
      ...(appliedFiltersLocal.channel && { Channel: appliedFiltersLocal.channel }),
      ...(appliedFiltersLocal.reference && { Reference: appliedFiltersLocal.reference }),
      ...(appliedFiltersLocal.fromUtc && { FromUtc: formatDateTime(appliedFiltersLocal.fromUtc, true) }),
      ...(appliedFiltersLocal.toUtc && { ToUtc: formatDateTime(appliedFiltersLocal.toUtc, false) }),
      ...(appliedFiltersLocal.refundTypeKey && { RefundTypeKey: appliedFiltersLocal.refundTypeKey }),
      ...(appliedFiltersLocal.sortBy && { SortBy: appliedFiltersLocal.sortBy }),
      ...(appliedFiltersLocal.sortOrder && { SortOrder: appliedFiltersLocal.sortOrder }),
    }
    dispatch(fetchRefundHistory(fetchParams))
  }

  // Filter options
  const customerOptions = [
    { value: "", label: "All Customers" },
    ...customers.map((customer) => ({
      value: customer.id,
      label: `${customer.fullName} (${customer.accountNumber})`,
    })),
  ]

  const vendorOptions = [
    { value: "", label: "All Vendors" },
    ...vendors.map((vendor) => ({
      value: vendor.id,
      label: vendor.name,
    })),
  ]

  const agentOptions = [
    { value: "", label: "All Agents" },
    ...agents.map((agent) => ({
      value: agent.id,
      label: `${agent.user.fullName} (${agent.agentCode})`,
    })),
  ]

  const channelOptions = [
    { value: "", label: "All Channels" },
    { value: "Cash", label: "Cash" },
    { value: "BankTransfer", label: "Bank Transfer" },
    { value: "Pos", label: "POS" },
    { value: "Card", label: "Card" },
    { value: "VendorWallet", label: "Vendor Wallet" },
    { value: "Chaque", label: "Chaque" },
    { value: "BankDeposit", label: "Bank Deposit" },
    { value: "Vendor", label: "Vendor" },
    { value: "Migration", label: "Migration" },
  ]

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Failed", label: "Failed" },
    { value: "Reversed", label: "Reversed" },
  ]

  const refundTypeOptions = [
    { value: "", label: "All Refund Types" },
    { value: "full", label: "Full Refund" },
    { value: "partial", label: "Partial Refund" },
    { value: "chargeback", label: "Chargeback" },
    { value: "dispute", label: "Dispute" },
    { value: "reversal", label: "Reversal" },
  ]

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Amount Low-High", value: "amount", order: "asc" },
    { label: "Amount High-Low", value: "amount", order: "desc" },
    { label: "Date Asc", value: "refundedAtUtc", order: "asc" },
    { label: "Date Desc", value: "refundedAtUtc", order: "desc" },
    { label: "Customer Name A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name Z-A", value: "customerName", order: "desc" },
    { label: "Reference Asc", value: "refundReference", order: "asc" },
    { label: "Reference Desc", value: "refundReference", order: "desc" },
  ]

  const getExportDateRange = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (exportDateRange) {
      case "today":
        const endOfToday = new Date(today)
        endOfToday.setHours(23, 59, 59, 999)
        return {
          from: today.toISOString(),
          to: endOfToday.toISOString(),
        }
      case "week":
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        const endOfWeek = new Date()
        endOfWeek.setHours(23, 59, 59, 999)
        return {
          from: weekAgo.toISOString(),
          to: endOfWeek.toISOString(),
        }
      case "month":
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        const endOfMonth = new Date()
        endOfMonth.setHours(23, 59, 59, 999)
        return {
          from: monthAgo.toISOString(),
          to: endOfMonth.toISOString(),
        }
      case "custom":
        return {
          from: exportFromDate ? new Date(exportFromDate).toISOString() : undefined,
          to: exportToDate ? new Date(exportToDate + "T23:59:59").toISOString() : undefined,
        }
      default:
        return { from: undefined, to: undefined }
    }
  }

  const exportToCSV = async () => {
    console.log("Export function called!")
    setIsExporting(true)
    setShowExportModal(false)

    try {
      const dateRange = getExportDateRange()

      // Build API parameters
      const params: any = {
        PageNumber: 1,
        PageSize: 1000000,
        ...(dateRange.from && { FromUtc: dateRange.from }),
        ...(dateRange.to && { ToUtc: dateRange.to }),
        ...(exportChannel !== "all" && { Channel: exportChannel }),
        ...(exportStatus !== "all" && { Status: exportStatus }),
        ...(exportCustomerId && { CustomerId: parseInt(exportCustomerId) }),
        ...(exportVendorId && { VendorId: parseInt(exportVendorId) }),
        ...(exportAgentId && { AgentId: parseInt(exportAgentId) }),
        ...(exportRefundTypeKey && { RefundTypeKey: exportRefundTypeKey }),
        ...(exportReference && { Reference: exportReference }),
      }

      console.log("Exporting refunds with params:", params)

      const response = await api.get(buildApiUrl(API_ENDPOINTS.REFUND.REFUND_HISTORY), { params })

      console.log("API Response:", response)

      let allRefunds: RefundHistoryItem[] = response.data?.data || []

      console.log("Refunds found:", allRefunds.length)

      if (allRefunds.length === 0) {
        console.log("No refunds found for export")
        alert("No refunds found matching your criteria. Please adjust your filters and try again.")
        setIsExporting(false)
        return
      }

      const headers = [
        "Refund Reference",
        "Original Reference",
        "Amount",
        "Currency",
        "Customer Name",
        "Customer Account",
        "Vendor",
        "Agent",
        "Refund Type",
        "Channel",
        "Status",
        "Date/Time",
        "Reason",
      ]

      const csvRows = allRefunds.map((refund) => [
        refund.refundReference || `REF-${refund.id}`,
        refund.originalReference || "-",
        refund.amount,
        refund.currency || "NGN",
        refund.customerName || "-",
        refund.customerAccountNumber || "-",
        refund.vendorName || "-",
        refund.agentName || "-",
        refund.refundTypeName || "-",
        refund.channel,
        refund.status,
        refund.refundedAtUtc ? formatDate(refund.refundedAtUtc) : "-",
        refund.reason || "-",
      ])

      const escapeCSV = (value: string | number | undefined) => {
        const stringValue = String(value)
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }

      const csvContent = [headers.map(escapeCSV).join(","), ...csvRows.map((row) => row.map(escapeCSV).join(","))].join(
        "\n"
      )

      console.log("CSV content generated, length:", csvContent.length)

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `refunds_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("Export completed successfully")
    } catch (error) {
      console.error("Failed to export refunds:", error)
      alert(`Failed to export refunds: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`)
    } finally {
      setIsExporting(false)
    }
  }

  if (refundHistoryLoading) return <LoadingSkeleton />

  return (
    <div className="w-full">
      {/* Header Section with Title, Search and Filters */}
      <div className="mb-4 space-y-4">
        {/* Title Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-xl font-semibold text-gray-900 md:text-2xl">Refunds</h4>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border-b">
              <SearchModule
                value={searchInput}
                onChange={handleSearch}
                onCancel={handleCancelSearch}
                onSearch={handleManualSearch}
                placeholder="Search refunds..."
                className="w-full max-w-md"
                bgClassName="bg-gray-50"
              />
            </div>
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFiltersLocal(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 2xl:hidden"
            >
              <Filter className="size-4" />
              <span className="hidden xs:inline">Filters</span>
              {getActiveFilterCountLocal() > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-[#004B23] text-xs font-semibold text-white">
                  {getActiveFilterCountLocal()}
                </span>
              )}
            </button>

            {/* Desktop Filter Toggle */}
            <button
              onClick={() => setShowDesktopFiltersLocal(!showDesktopFiltersLocal)}
              className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 2xl:flex"
            >
              {showDesktopFiltersLocal ? <X className="size-4" /> : <Filter className="size-4" />}
              {showDesktopFiltersLocal ? "Hide Filters" : "Show Filters"}
              {getActiveFilterCountLocal() > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-[#004B23] text-xs font-semibold text-white">
                  {getActiveFilterCountLocal()}
                </span>
              )}
            </button>
            {/* Export CSV Button */}
            <button
              onClick={() => setShowExportModal(true)}
              disabled={isExporting}
              className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium transition-colors ${
                isExporting ? "cursor-not-allowed text-gray-400" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Download className={`size-4 ${isExporting ? "animate-pulse" : ""}`} />
              {isExporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content */}
        <motion.div
          className={
            showDesktopFiltersLocal
              ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Error Message */}
          {refundHistoryError && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
              <p>Error loading refunds: {refundHistoryError}</p>
            </div>
          )}

          {refundHistoryData.length === 0 ? (
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
                {searchText ? "No matching refunds found" : "No refunds available"}
              </motion.p>
              <motion.p
                className="text-sm text-gray-600"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {searchText
                  ? "Try adjusting your search term"
                  : "Refunds will appear here once transactions are processed"}
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
                <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
                  <thead>
                    <tr>
                      <th className="whitespace-nowrap border-b p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                          Ref
                        </div>
                      </th>
                      <th
                        className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("amount")}
                      >
                        <div className="flex items-center gap-2">
                          Amount <RxCaretSort />
                        </div>
                      </th>
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
                        onClick={() => toggleSort("vendorName")}
                      >
                        <div className="flex items-center gap-2">
                          Vendor <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("agentName")}
                      >
                        <div className="flex items-center gap-2">
                          Agent <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("refundTypeName")}
                      >
                        <div className="flex items-center gap-2">
                          Refund Type <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("channel")}
                      >
                        <div className="flex items-center gap-2">
                          Channel <RxCaretSort />
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
                        onClick={() => toggleSort("refundedAtUtc")}
                      >
                        <div className="flex items-center gap-2">
                          Date/Time <RxCaretSort />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {refundHistoryData.map((refund, index) => (
                        <motion.tr
                          key={refund.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                            {refund.refundReference || `REF-${refund.id}`}
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-semibold">
                            {formatCurrency(refund.amount)}
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <div>
                              <div className="font-medium">{refund.customerName || "-"}</div>
                              <div className="text-xs text-gray-500">{refund.customerAccountNumber || ""}</div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <div>
                              <div className="font-medium">{refund.vendorName || "-"}</div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <div>
                              <div className="font-medium">{refund.agentName || "-"}</div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            {refund.refundTypeName || "-"}
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <motion.div
                              style={getChannelStyle(refund.channel)}
                              className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.1 }}
                            >
                              {refund.channel}
                            </motion.div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <motion.div
                              style={getStatusStyle(refund.status)}
                              className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.1 }}
                            >
                              <span
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor: getStatusStyle(refund.status).dotColor,
                                }}
                              ></span>
                              {refund.status}
                            </motion.div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            {refund.refundedAtUtc ? formatDate(refund.refundedAtUtc) : "-"}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>

              <motion.div
                className="flex items-center justify-between border-t py-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of{" "}
                  {totalRecords} refunds
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center rounded-md p-2 ${
                      currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
                    whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                  >
                    <MdOutlineArrowBackIosNew />
                  </motion.button>

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
                      <motion.button
                        key={index}
                        onClick={() => paginate(pageNum)}
                        className={`flex size-8 items-center justify-center rounded-md text-sm ${
                          currentPage === pageNum
                            ? "bg-[#004B23] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        {pageNum}
                      </motion.button>
                    )
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

                  {totalPages > 5 && currentPage < totalPages - 1 && (
                    <motion.button
                      onClick={() => paginate(totalPages)}
                      className={`flex size-8 items-center justify-center rounded-md text-sm ${
                        currentPage === totalPages
                          ? "bg-[#004B23] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {totalPages}
                    </motion.button>
                  )}

                  <motion.button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center rounded-md p-2 ${
                      currentPage === totalPages
                        ? "cursor-not-allowed text-gray-400"
                        : "text-[#003F9F] hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: currentPage === totalPages ? 1 : 1.1 }}
                    whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                  >
                    <MdOutlineArrowForwardIos />
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
        {showDesktopFiltersLocal && (
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

            <div className="flex-1 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 400px)" }}>
              {/* Customer Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
                <FormSelectModule
                  name="customerId"
                  value={localFilters.customerId || ""}
                  onChange={(e) => handleFilterChange("customerId", e.target.value || undefined)}
                  options={customerOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Vendor Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Vendor</label>
                <FormSelectModule
                  name="vendorId"
                  value={localFilters.vendorId || ""}
                  onChange={(e) => handleFilterChange("vendorId", e.target.value || undefined)}
                  options={vendorOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Agent Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Agent</label>
                <FormSelectModule
                  name="agentId"
                  value={localFilters.agentId || ""}
                  onChange={(e) => handleFilterChange("agentId", e.target.value || undefined)}
                  options={agentOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Channel Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Channel</label>
                <FormSelectModule
                  name="channel"
                  value={String(localFilters.channel || "")}
                  onChange={(e) => handleFilterChange("channel", e.target.value || undefined)}
                  options={channelOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions
                    .filter((opt) => opt.value !== "")
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("status", localFilters.status === option.value ? undefined : option.value)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === option.value
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Refund Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Refund Type</label>
                <FormSelectModule
                  name="refundTypeKey"
                  value={String(localFilters.refundTypeKey || "")}
                  onChange={(e) => handleFilterChange("refundTypeKey", e.target.value || undefined)}
                  options={refundTypeOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Date Range Filters */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Refund From</label>
                <input
                  type="date"
                  value={localFilters.fromUtc || ""}
                  onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Refund To</label>
                <input
                  type="date"
                  value={localFilters.toUtc || ""}
                  onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                />
              </div>

              {/* Text Input Filters */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Reference</label>
                <input
                  type="text"
                  value={localFilters.reference || ""}
                  onChange={(e) => handleFilterChange("reference", e.target.value || undefined)}
                  placeholder="Enter reference..."
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSortExpanded((prev) => !prev)}
                  className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                  aria-expanded={isSortExpanded}
                >
                  <span>Sort By</span>
                  {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {isSortExpanded && (
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
                            {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 shrink-0 space-y-3 border-t pt-4">
              <button
                onClick={applyFilters}
                className="button-filled flex w-full items-center justify-center gap-2 text-sm md:text-base"
              >
                <Filter className="size-4" />
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="button-oulined flex w-full items-center justify-center gap-2 text-sm md:text-base"
              >
                <X className="size-4" />
                Reset All
              </button>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 shrink-0 rounded-lg bg-gray-50 p-3 md:mt-6">
              <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">{totalRecords?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium">
                    {currentPage} / {totalPages || 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Filters:</span>
                  <span className="font-medium">{getActiveFilterCountLocal()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Filter Sidebar */}
      <MobileFilterSidebar
        isOpen={showMobileFiltersLocal}
        onClose={() => setShowMobileFiltersLocal(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCountLocal}
        customerOptions={customerOptions}
        vendorOptions={vendorOptions}
        agentOptions={agentOptions}
        channelOptions={channelOptions}
        statusOptions={statusOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
        refundTypeOptions={refundTypeOptions}
      />

      {/* Export CSV Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              className="w-full max-w-lg rounded-lg bg-white shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Export Refunds to CSV</h3>
                  <button onClick={() => setShowExportModal(false)} className="rounded-full p-1 hover:bg-gray-100">
                    <X className="size-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Date Range */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "all", label: "All Time" },
                        { value: "today", label: "Today" },
                        { value: "week", label: "Last 7 Days" },
                        { value: "month", label: "Last 30 Days" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setExportDateRange(option.value as typeof exportDateRange)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            exportDateRange === option.value
                              ? "border-[#004B23] bg-[#004B23]/10 text-[#004B23]"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setExportDateRange("custom")}
                      className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        exportDateRange === "custom"
                          ? "border-[#004B23] bg-[#004B23]/10 text-[#004B23]"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Calendar className="mr-2 inline-block size-4" />
                      Custom Date Range
                    </button>
                  </div>

                  {exportDateRange === "custom" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">From</label>
                        <input
                          type="date"
                          value={exportFromDate}
                          onChange={(e) => setExportFromDate(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">To</label>
                        <input
                          type="date"
                          value={exportToDate}
                          onChange={(e) => setExportToDate(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status and Channel */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={exportStatus}
                        onChange={(e) => setExportStatus(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Failed">Failed</option>
                        <option value="Reversed">Reversed</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Channel</label>
                      <select
                        value={exportChannel}
                        onChange={(e) => setExportChannel(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      >
                        <option value="all">All Channels</option>
                        <option value="Cash">Cash</option>
                        <option value="BankTransfer">Bank Transfer</option>
                        <option value="Pos">POS</option>
                        <option value="Card">Card</option>
                        <option value="VendorWallet">Vendor Wallet</option>
                      </select>
                    </div>
                  </div>

                  {/* ID Filters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Customer ID</label>
                      <input
                        type="text"
                        placeholder="Enter ID"
                        value={exportCustomerId}
                        onChange={(e) => setExportCustomerId(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Reference</label>
                      <input
                        type="text"
                        placeholder="Enter reference"
                        value={exportReference}
                        onChange={(e) => setExportReference(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      />
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Vendor ID</label>
                      <input
                        type="text"
                        placeholder="Enter ID"
                        value={exportVendorId}
                        onChange={(e) => setExportVendorId(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Agent ID</label>
                      <input
                        type="text"
                        placeholder="Enter ID"
                        value={exportAgentId}
                        onChange={(e) => setExportAgentId(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      />
                    </div>
                  </div>

                  {/* Refund Type */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Refund Type</label>
                    <select
                      value={exportRefundTypeKey}
                      onChange={(e) => setExportRefundTypeKey(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                    >
                      <option value="">All Types</option>
                      <option value="full">Full Refund</option>
                      <option value="partial">Partial Refund</option>
                      <option value="chargeback">Chargeback</option>
                      <option value="dispute">Dispute</option>
                      <option value="reversal">Reversal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={exportToCSV}
                    disabled={exportDateRange === "custom" && !exportFromDate && !exportToDate}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                      exportDateRange === "custom" && !exportFromDate && !exportToDate
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-[#004B23] hover:bg-[#003a1b]"
                    }`}
                  >
                    <Download className="mr-2 inline-block size-4" />
                    Export
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AllRefundsTable
