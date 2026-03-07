"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
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
import {
  AllAnomaliesRequestParams,
  AllAnomalyItem,
  fetchAllAnomalies,
  PaymentAnomalyResolutionAction,
} from "lib/redux/paymentSlice"
import { fetchCustomers } from "lib/redux/customerSlice"
import { fetchVendors } from "lib/redux/vendorSlice"
import { fetchAgentById, fetchAgents } from "lib/redux/agentSlice"
import { fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import { api } from "lib/redux/authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import ResolveAnomalyModal from "components/Modals/ResolveAnomalyModal"

// ==================== Status Badge Component ====================
const StatusBadge = ({ status }: { status: "Open" | "Resolved" }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Open":
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getDotColor = () => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-500"
      case "Open":
        return "bg-amber-500"
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

// ==================== Channel Badge Component ====================
const ChannelBadge = ({ channel }: { channel: string }) => {
  const getChannelStyles = () => {
    switch (channel) {
      case "Cash":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "BankTransfer":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Pos":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Card":
        return "bg-pink-50 text-pink-700 border-pink-200"
      case "VendorWallet":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Chaque":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "BankDeposit":
        return "bg-green-50 text-green-700 border-green-200"
      case "Vendor":
        return "bg-indigo-50 text-indigo-700 border-indigo-200"
      case "Migration":
        return "bg-cyan-50 text-cyan-700 border-cyan-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getChannelStyles()}`}>
      {channel}
    </span>
  )
}

interface ActionDropdownProps {
  anomaly: AllAnomalyItem
  onViewDetails: (anomaly: AllAnomalyItem) => void
  onResolve?: (anomaly: AllAnomalyItem) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ anomaly, onViewDetails, onResolve }) => {
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
    onViewDetails(anomaly)
    setIsOpen(false)
  }

  const handleResolve = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onResolve) {
      onResolve(anomaly)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        className="flex size-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RxDotsVertical className="size-4" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-50 min-w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            style={
              dropdownDirection === "bottom"
                ? {
                    top: dropdownRef.current
                      ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 4
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
                : {
                    bottom: dropdownRef.current
                      ? window.innerHeight - dropdownRef.current.getBoundingClientRect().top + window.scrollY + 4
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
            }
            initial={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -5 : 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -5 : 5 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={handleViewDetails}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Eye className="size-3.5" />
              View Details
            </button>
            <button
              onClick={handleResolve}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RefreshCw className="size-3.5" />
              Resolve
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

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
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {[...Array(11)].map((_, i) => (
                <th key={i} className="px-3 py-2.5">
                  <div className="h-3.5 w-16 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {[...Array(11)].map((_, cellIndex) => (
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

interface AppliedFilters {
  agentId?: number
  customerId?: number
  vendorId?: number
  paymentTypeId?: number
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
  status?: "Open" | "Resolved"
  resolutionAction?: PaymentAnomalyResolutionAction
  minAmount?: number
  maxAmount?: number
  detectedFromUtc?: string
  detectedToUtc?: string
  paidFromUtc?: string
  paidToUtc?: string
  ruleKey?: string
  search?: string
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
  paymentTypeOptions,
  resolutionActionOptions,
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
  paymentTypeOptions: Array<{ value: string | number; label: string }>
  resolutionActionOptions: Array<{ value: string; label: string }>
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
            className="flex size-full max-w-sm flex-col bg-white"
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

                {/* Payment Type Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Type</label>
                  <FormSelectModule
                    name="paymentTypeId"
                    value={localFilters.paymentTypeId || ""}
                    onChange={(e) => handleFilterChange("paymentTypeId", e.target.value || undefined)}
                    options={paymentTypeOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Resolution Action Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Resolution Action</label>
                  <div className="grid grid-cols-2 gap-2">
                    {resolutionActionOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange(
                              "resolutionAction",
                              localFilters.resolutionAction === option.value ? undefined : option.value
                            )
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.resolutionAction === option.value
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Amount Range Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Min Amount</label>
                  <input
                    type="number"
                    value={localFilters.minAmount || ""}
                    onChange={(e) =>
                      handleFilterChange("minAmount", e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="Enter min amount..."
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Max Amount</label>
                  <input
                    type="number"
                    value={localFilters.maxAmount || ""}
                    onChange={(e) =>
                      handleFilterChange("maxAmount", e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="Enter max amount..."
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                {/* Date Range Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Detected From</label>
                  <input
                    type="date"
                    value={localFilters.detectedFromUtc || ""}
                    onChange={(e) => handleFilterChange("detectedFromUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Detected To</label>
                  <input
                    type="date"
                    value={localFilters.detectedToUtc || ""}
                    onChange={(e) => handleFilterChange("detectedToUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Paid From</label>
                  <input
                    type="date"
                    value={localFilters.paidFromUtc || ""}
                    onChange={(e) => handleFilterChange("paidFromUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Paid To</label>
                  <input
                    type="date"
                    value={localFilters.paidToUtc || ""}
                    onChange={(e) => handleFilterChange("paidToUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                {/* Text Input Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Rule Key</label>
                  <input
                    type="text"
                    value={localFilters.ruleKey || ""}
                    onChange={(e) => handleFilterChange("ruleKey", e.target.value || undefined)}
                    placeholder="Enter rule key..."
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

interface AllAnomaliesTableProps {
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

const AllAnomaliesTable: React.FC<AllAnomaliesTableProps> = ({
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
  const paymentsState = useAppSelector((state) => state.payments)
  const { allAnomalies, allAnomaliesLoading, allAnomaliesError, allAnomaliesPagination } = paymentsState
  const { customers } = useAppSelector((state) => state.customers)
  const { vendors } = useAppSelector((state) => state.vendors)
  const { agents } = useAppSelector((state) => state.agents)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { user } = useAppSelector((state) => state.auth)

  // Helper functions to find names by ID
  const [agentNameCache, setAgentNameCache] = useState<Map<number, string>>(new Map())
  const [loadingAgentNames, setLoadingAgentNames] = useState<Set<number>>(new Set())
  const [displayAgentNames, setDisplayAgentNames] = useState<Map<number, string>>(new Map())

  const getAgentName = async (agentId: number) => {
    // First check if we already have it in cache
    if (agentNameCache.has(agentId)) {
      return agentNameCache.get(agentId)!
    }

    // Check if it's in the local agents array (from fetchAgents)
    const agent = agents.find((a) => a.id === agentId)
    if (agent && agent.user.fullName) {
      // Cache it for future use
      setAgentNameCache((prev) => new Map(prev.set(agentId, agent.user.fullName)))
      setDisplayAgentNames((prev) => new Map(prev.set(agentId, agent.user.fullName)))
      return agent.user.fullName
    }

    // If not in cache and currently loading, return loading indicator
    if (loadingAgentNames.has(agentId)) {
      return "Loading..."
    }

    // If not in cache and not loading, fetch from API
    setLoadingAgentNames((prev) => new Set(prev.add(agentId)))
    setDisplayAgentNames((prev) => new Map(prev.set(agentId, "Loading...")))

    try {
      const result = await dispatch(fetchAgentById(agentId)).unwrap()
      const agentName = result.data?.user?.fullName || `ID: ${agentId}`

      // Cache the result
      setAgentNameCache((prev) => new Map(prev.set(agentId, agentName)))
      setDisplayAgentNames((prev) => new Map(prev.set(agentId, agentName)))
      return agentName
    } catch (error) {
      console.error(`Failed to fetch agent ${agentId}:`, error)
      const fallbackName = `ID: ${agentId}`
      setDisplayAgentNames((prev) => new Map(prev.set(agentId, fallbackName)))
      return fallbackName
    } finally {
      setLoadingAgentNames((prev) => {
        const newSet = new Set(prev)
        newSet.delete(agentId)
        return newSet
      })
    }
  }

  // Load agent names for all anomalies when component mounts or anomalies change
  useEffect(() => {
    const uniqueAgentIds = [...new Set(allAnomalies.map((a) => a.agentId).filter(Boolean))] as number[]

    uniqueAgentIds.forEach((agentId) => {
      if (!displayAgentNames.has(agentId) && !loadingAgentNames.has(agentId)) {
        getAgentName(agentId)
      }
    })
  }, [allAnomalies])

  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find((v) => v.id === vendorId)
    return vendor ? vendor.name : `ID: ${vendorId}`
  }

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedAnomaly, setSelectedAnomaly] = useState<AllAnomalyItem | null>(null)
  const [showMobileFiltersLocal, setShowMobileFiltersLocal] = useState(false)
  const [showDesktopFiltersLocal, setShowDesktopFiltersLocal] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)

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
  const [exportPaymentTypeId, setExportPaymentTypeId] = useState<string>("")
  const [exportRuleKey, setExportRuleKey] = useState<string>("")
  const [exportReference, setExportReference] = useState<string>("") // Added missing state

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    paymentTypeId: undefined as number | undefined,
    status: undefined as "Open" | "Resolved" | undefined,
    resolutionAction: undefined as PaymentAnomalyResolutionAction | undefined,
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
    minAmount: undefined as number | undefined,
    maxAmount: undefined as number | undefined,
    detectedFromUtc: undefined as string | undefined,
    detectedToUtc: undefined as string | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    ruleKey: undefined as string | undefined,
    search: undefined as string | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state - triggers API calls
  const [appliedFiltersLocal, setAppliedFiltersLocal] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    paymentTypeId: undefined as number | undefined,
    status: undefined as "Open" | "Resolved" | undefined,
    resolutionAction: undefined as PaymentAnomalyResolutionAction | undefined,
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
    minAmount: undefined as number | undefined,
    maxAmount: undefined as number | undefined,
    detectedFromUtc: undefined as string | undefined,
    detectedToUtc: undefined as string | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    ruleKey: undefined as string | undefined,
    search: undefined as string | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  const handleViewAnomalyDetails = (anomaly: AllAnomalyItem) => {
    router.push(`/payment/anomaly-details/${anomaly.id}`)
  }

  const handleResolve = (anomaly: AllAnomalyItem) => {
    setSelectedAnomaly(anomaly)
    setIsResolveModalOpen(true)
  }

  const handleCloseResolveModal = () => {
    setIsResolveModalOpen(false)
    setSelectedAnomaly(null)
  }

  // Get pagination values from Redux state
  const currentPage = allAnomaliesPagination?.currentPage || 1
  const pageSize = allAnomaliesPagination?.pageSize || 10
  const totalRecords = allAnomaliesPagination?.totalCount || 0
  const totalPages = allAnomaliesPagination?.totalPages || 0

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
    dispatch(fetchPaymentTypes())
  }, [dispatch])

  // Fetch anomalies on component mount and when search/pagination/filters change
  useEffect(() => {
    const fetchParams: AllAnomaliesRequestParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
      // Use agentId prop if provided, otherwise use appliedFilters.agentId
      ...(agentId !== undefined && { agentId }),
      ...(customerId !== undefined && { customerId }),
      ...(searchText && { search: searchText }),
      // Applied filters from local state
      ...(appliedFiltersLocal.customerId && { customerId: appliedFiltersLocal.customerId }),
      ...(appliedFiltersLocal.vendorId && { vendorId: appliedFiltersLocal.vendorId }),
      ...(appliedFiltersLocal.agentId && { agentId: appliedFiltersLocal.agentId }),
      ...(appliedFiltersLocal.paymentTypeId && { paymentTypeId: appliedFiltersLocal.paymentTypeId }),
      ...(appliedFiltersLocal.status && { status: appliedFiltersLocal.status }),
      ...(appliedFiltersLocal.resolutionAction && { resolutionAction: appliedFiltersLocal.resolutionAction }),
      ...(appliedFiltersLocal.channel && {
        channel: appliedFiltersLocal.channel as AllAnomaliesRequestParams["channel"],
      }),
      ...(appliedFiltersLocal.minAmount !== undefined && { minAmount: appliedFiltersLocal.minAmount }),
      ...(appliedFiltersLocal.maxAmount !== undefined && { maxAmount: appliedFiltersLocal.maxAmount }),
      ...(appliedFiltersLocal.detectedFromUtc && {
        detectedFromUtc: formatDateTime(appliedFiltersLocal.detectedFromUtc, true),
      }),
      ...(appliedFiltersLocal.detectedToUtc && {
        detectedToUtc: formatDateTime(appliedFiltersLocal.detectedToUtc, false),
      }),
      ...(appliedFiltersLocal.paidFromUtc && { paidFromUtc: formatDateTime(appliedFiltersLocal.paidFromUtc, true) }),
      ...(appliedFiltersLocal.paidToUtc && { paidToUtc: formatDateTime(appliedFiltersLocal.paidToUtc, false) }),
      ...(appliedFiltersLocal.ruleKey && { ruleKey: appliedFiltersLocal.ruleKey }),
      ...(appliedFiltersLocal.search && { search: appliedFiltersLocal.search }),
      ...(appliedFiltersLocal.sortBy && { sortBy: appliedFiltersLocal.sortBy }),
      ...(appliedFiltersLocal.sortOrder && { sortOrder: appliedFiltersLocal.sortOrder }),
    }

    dispatch(fetchAllAnomalies(fetchParams))
  }, [dispatch, currentPage, pageSize, searchText, agentId, customerId, JSON.stringify(appliedFiltersLocal)])

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

  const getStatusStyle = (status: "Open" | "Resolved") => {
    switch (status) {
      case "Resolved":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          dotColor: "#589E67",
        }
      case "Open":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
          dotColor: "#D97706",
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
      // The useEffect will handle the API call with updated searchText
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
    // The useEffect will handle the API call with updated searchText
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
      paymentTypeId: localFilters.paymentTypeId,
      status: localFilters.status,
      resolutionAction: localFilters.resolutionAction,
      channel: localFilters.channel,
      minAmount: localFilters.minAmount,
      maxAmount: localFilters.maxAmount,
      detectedFromUtc: localFilters.detectedFromUtc,
      detectedToUtc: localFilters.detectedToUtc,
      paidFromUtc: localFilters.paidFromUtc,
      paidToUtc: localFilters.paidToUtc,
      ruleKey: localFilters.ruleKey,
      search: localFilters.search,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortOrder || undefined,
    })
    // The useEffect will handle the API call with updated appliedFiltersLocal
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      paymentTypeId: undefined,
      status: undefined,
      resolutionAction: undefined,
      channel: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      detectedFromUtc: undefined,
      detectedToUtc: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      ruleKey: undefined,
      search: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFiltersLocal({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      paymentTypeId: undefined,
      status: undefined,
      resolutionAction: undefined,
      channel: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      detectedFromUtc: undefined,
      detectedToUtc: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      ruleKey: undefined,
      search: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setSearchText("")
    setSearchInput("")
    // The useEffect will handle the API call with updated appliedFiltersLocal
  }

  // Get active filter count
  const getActiveFilterCountLocal = () => {
    let count = 0
    if (appliedFiltersLocal.customerId) count++
    if (appliedFiltersLocal.vendorId) count++
    if (appliedFiltersLocal.agentId) count++
    if (appliedFiltersLocal.paymentTypeId) count++
    if (appliedFiltersLocal.status) count++
    if (appliedFiltersLocal.resolutionAction) count++
    if (appliedFiltersLocal.channel) count++
    if (appliedFiltersLocal.minAmount !== undefined) count++
    if (appliedFiltersLocal.maxAmount !== undefined) count++
    if (appliedFiltersLocal.detectedFromUtc) count++
    if (appliedFiltersLocal.detectedToUtc) count++
    if (appliedFiltersLocal.paidFromUtc) count++
    if (appliedFiltersLocal.paidToUtc) count++
    if (appliedFiltersLocal.ruleKey) count++
    if (appliedFiltersLocal.search) count++
    if (appliedFiltersLocal.sortBy) count++
    return count
  }

  const paginate = (pageNumber: number) => {
    const fetchParams: AllAnomaliesRequestParams = {
      pageNumber: pageNumber,
      pageSize: pageSize,
      ...(agentId !== undefined && { agentId }),
      ...(customerId !== undefined && { customerId }),
      ...(searchText && { search: searchText }),
      ...(appliedFiltersLocal.customerId && { customerId: appliedFiltersLocal.customerId }),
      ...(appliedFiltersLocal.vendorId && { vendorId: appliedFiltersLocal.vendorId }),
      ...(appliedFiltersLocal.agentId && { agentId: appliedFiltersLocal.agentId }),
      ...(appliedFiltersLocal.paymentTypeId && { paymentTypeId: appliedFiltersLocal.paymentTypeId }),
      ...(appliedFiltersLocal.status && { status: appliedFiltersLocal.status }),
      ...(appliedFiltersLocal.resolutionAction && { resolutionAction: appliedFiltersLocal.resolutionAction }),
      ...(appliedFiltersLocal.channel && {
        channel: appliedFiltersLocal.channel as AllAnomaliesRequestParams["channel"],
      }),
      ...(appliedFiltersLocal.minAmount !== undefined && { minAmount: appliedFiltersLocal.minAmount }),
      ...(appliedFiltersLocal.maxAmount !== undefined && { maxAmount: appliedFiltersLocal.maxAmount }),
      ...(appliedFiltersLocal.detectedFromUtc && {
        detectedFromUtc: formatDateTime(appliedFiltersLocal.detectedFromUtc, true),
      }),
      ...(appliedFiltersLocal.detectedToUtc && {
        detectedToUtc: formatDateTime(appliedFiltersLocal.detectedToUtc, false),
      }),
      ...(appliedFiltersLocal.paidFromUtc && { paidFromUtc: formatDateTime(appliedFiltersLocal.paidFromUtc, true) }),
      ...(appliedFiltersLocal.paidToUtc && { paidToUtc: formatDateTime(appliedFiltersLocal.paidToUtc, false) }),
      ...(appliedFiltersLocal.ruleKey && { ruleKey: appliedFiltersLocal.ruleKey }),
      ...(appliedFiltersLocal.search && { search: appliedFiltersLocal.search }),
      ...(appliedFiltersLocal.sortBy && { sortBy: appliedFiltersLocal.sortBy }),
      ...(appliedFiltersLocal.sortOrder && { sortOrder: appliedFiltersLocal.sortOrder }),
    }
    dispatch(fetchAllAnomalies(fetchParams))
  }

  // Filter options
  const customerOptions = [
    { value: "", label: "All Customers" },
    ...(customers?.map((customer) => ({
      value: customer.id,
      label: `${customer.fullName} (${customer.accountNumber})`,
    })) || []),
  ]

  const vendorOptions = [
    { value: "", label: "All Vendors" },
    ...(vendors?.map((vendor) => ({
      value: vendor.id,
      label: vendor.name,
    })) || []),
  ]

  const agentOptions = [
    { value: "", label: "All Agents" },
    ...(agents?.map((agent) => ({
      value: agent.id,
      label: `${agent.user.fullName} (${agent.agentCode})`,
    })) || []),
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
    { value: "Open", label: "Open" },
    { value: "Resolved", label: "Resolved" },
  ]

  const resolutionActionOptions = [
    { value: "", label: "All Actions" },
    { value: PaymentAnomalyResolutionAction.None.toString(), label: "None" },
    { value: PaymentAnomalyResolutionAction.Cancel.toString(), label: "Cancel" },
    { value: PaymentAnomalyResolutionAction.Refund.toString(), label: "Refund" },
    { value: PaymentAnomalyResolutionAction.Ignore.toString(), label: "Ignore" },
  ]

  const paymentTypeOptions = [
    { value: "", label: "All Payment Types" },
    ...(paymentTypes?.map((type) => ({
      value: type.id,
      label: type.name,
    })) || []),
  ]

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Amount Low-High", value: "amount", order: "asc" },
    { label: "Amount High-Low", value: "amount", order: "desc" },
    { label: "Detected Date Asc", value: "detectedAtUtc", order: "asc" },
    { label: "Detected Date Desc", value: "detectedAtUtc", order: "desc" },
    { label: "Customer Name A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name Z-A", value: "customerName", order: "desc" },
    { label: "Reference Asc", value: "reference", order: "asc" },
    { label: "Reference Desc", value: "reference", order: "desc" },
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
        pageNumber: 1,
        pageSize: 1000000,
        ...(dateRange.from && { detectedFromUtc: dateRange.from }),
        ...(dateRange.to && { detectedToUtc: dateRange.to }),
        ...(exportChannel !== "all" && { channel: exportChannel }),
        ...(exportStatus !== "all" && { status: exportStatus }),
        ...(exportCustomerId && { customerId: parseInt(exportCustomerId) }),
        ...(exportVendorId && { vendorId: parseInt(exportVendorId) }),
        ...(exportAgentId && { agentId: parseInt(exportAgentId) }),
        ...(exportPaymentTypeId && { paymentTypeId: parseInt(exportPaymentTypeId) }),
        ...(exportRuleKey && { ruleKey: exportRuleKey }),
        ...(exportReference && { reference: exportReference }),
      }

      console.log("Exporting anomalies with params:", params)

      const response = await api.get(buildApiUrl(API_ENDPOINTS.PAYMENTS.ALL_ANOMALIES), { params })

      console.log("API Response:", response)

      let allAnomalies: AllAnomalyItem[] = response.data?.data || []

      console.log("Anomalies found:", allAnomalies.length)

      if (allAnomalies.length === 0) {
        console.log("No anomalies found for export")
        alert("No anomalies found matching your criteria. Please adjust your filters and try again.")
        setIsExporting(false)
        return
      }

      const headers = [
        "Anomaly ID",
        "Payment Reference",
        "Amount",
        "Customer Name",
        "Customer ID",
        "Vendor ID",
        "Agent ID",
        "Payment Type",
        "Channel",
        "Status",
        "Resolution Action",
        "Detected At",
        "Resolved At",
        "Rule Key",
        "Issue",
      ]

      const csvRows = allAnomalies.map((anomaly) => [
        anomaly.id,
        anomaly.reference || "-",
        anomaly.amount,
        anomaly.customerName || "-",
        anomaly.customerId || "-",
        anomaly.vendorId || "-",
        anomaly.agentId || "-",
        anomaly.paymentTypeName || "-",
        anomaly.channel,
        anomaly.status,
        anomaly.resolutionAction,
        anomaly.detectedAtUtc ? formatDate(anomaly.detectedAtUtc) : "-",
        anomaly.resolvedAtUtc ? formatDate(anomaly.resolvedAtUtc) : "-",
        anomaly.ruleKey || "-",
        anomaly.issue || "-",
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
      link.setAttribute("download", `anomalies_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("Export completed successfully")
    } catch (error) {
      console.error("Failed to export anomalies:", error)
      alert(
        `Failed to export anomalies: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
      )
    } finally {
      setIsExporting(false)
    }
  }

  if (allAnomaliesLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Payment Anomalies</h2>
            <p className="mt-1 text-xs text-gray-600">View and manage all payment anomalies</p>
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
                placeholder="Search anomalies..."
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
                onClick={() => setShowMobileFiltersLocal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:hidden"
              >
                <Filter className="size-3.5" />
                <span>Filters</span>
                {getActiveFilterCountLocal() > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-[#004B23] text-[10px] font-semibold text-white">
                    {getActiveFilterCountLocal()}
                  </span>
                )}
              </button>

              {/* Desktop Filter Toggle */}
              <button
                onClick={() => setShowDesktopFiltersLocal(!showDesktopFiltersLocal)}
                className="hidden items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:flex"
              >
                {showDesktopFiltersLocal ? <X className="size-3.5" /> : <Filter className="size-3.5" />}
                <span>{showDesktopFiltersLocal ? "Hide Filters" : "Show Filters"}</span>
                {getActiveFilterCountLocal() > 0 && (
                  <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-[#004B23] text-[10px] font-semibold text-white">
                    {getActiveFilterCountLocal()}
                  </span>
                )}
              </button>

              {/* Export Button */}
              <button
                onClick={() => setShowExportModal(true)}
                disabled={isExporting}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFilterCountLocal() > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gray-200 pt-3">
            <span className="text-xs text-gray-600">Active:</span>
            {appliedFiltersLocal.customerId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                Customer
                <button
                  onClick={() => handleFilterChange("customerId", undefined)}
                  className="ml-0.5 hover:text-blue-900"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {appliedFiltersLocal.vendorId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                Vendor
                <button
                  onClick={() => handleFilterChange("vendorId", undefined)}
                  className="ml-0.5 hover:text-purple-900"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {appliedFiltersLocal.status && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {appliedFiltersLocal.status}
                <button onClick={() => handleFilterChange("status", undefined)} className="ml-0.5 hover:text-amber-900">
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {appliedFiltersLocal.channel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                {appliedFiltersLocal.channel}
                <button
                  onClick={() => handleFilterChange("channel", undefined)}
                  className="ml-0.5 hover:text-emerald-900"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {allAnomaliesError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2">
                <AlertCircle className="size-4 text-red-600" />
                <p className="text-xs text-red-700">{allAnomaliesError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content with Table on Left, Filters on Right */}
      <div className="flex flex-col-reverse gap-5 lg:flex-row">
        {/* Table - Takes remaining width */}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {allAnomalies.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center px-4">
                <div className="rounded-full bg-gray-100 p-3">
                  <Info className="size-6 text-gray-400" />
                </div>
                <p className="mt-3 text-base font-medium text-gray-900">No anomalies found</p>
                <p className="mt-1 text-xs text-gray-600">
                  {searchText || getActiveFilterCountLocal() > 0
                    ? "Try adjusting your search or filters"
                    : "Anomalies will appear here once payments are processed"}
                </p>
                {(searchText || getActiveFilterCountLocal() > 0) && (
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
                  <table className="w-full min-w-[1200px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80">
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("id")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            ID
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
                            onClick={() => toggleSort("customerName")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Customer
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
                            onClick={() => toggleSort("agentName")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Agent
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("paymentTypeName")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Payment Type
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("channel")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Channel
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
                            onClick={() => toggleSort("detectedAtUtc")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Detected
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
                        {allAnomalies.map((anomaly, index) => (
                          <motion.tr
                            key={anomaly.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.01 }}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                          >
                            <td className="whitespace-nowrap p-2 text-xs font-medium text-gray-900">{anomaly.id}</td>
                            <td className="whitespace-nowrap p-2 text-xs font-semibold text-gray-900">
                              {formatCurrency(anomaly.amount)}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs">
                              <div>
                                <div className="font-medium text-gray-900">{anomaly.customerName || "-"}</div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {anomaly.vendorId ? getVendorName(anomaly.vendorId) : "-"}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {anomaly.agentId
                                ? displayAgentNames.get(anomaly.agentId) || `ID: ${anomaly.agentId}`
                                : "-"}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {anomaly.paymentTypeName || "-"}
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <ChannelBadge channel={anomaly.channel} />
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <StatusBadge status={anomaly.status} />
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {formatDate(anomaly.detectedAtUtc)}
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleResolve(anomaly)}
                                  className="flex items-center gap-1 rounded-lg bg-[#004B23] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-[#003618]"
                                >
                                  <RefreshCw className="size-3" />
                                  Resolve
                                </button>
                              </div>
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
                      onChange={(e) => {
                        const newPageSize = Number(e.target.value)
                        const fetchParams: AllAnomaliesRequestParams = {
                          pageNumber: 1,
                          pageSize: newPageSize,
                          ...(agentId !== undefined && { agentId }),
                          ...(customerId !== undefined && { customerId }),
                          ...(searchText && { search: searchText }),
                          ...(appliedFiltersLocal.customerId && { customerId: appliedFiltersLocal.customerId }),
                          ...(appliedFiltersLocal.vendorId && { vendorId: appliedFiltersLocal.vendorId }),
                          ...(appliedFiltersLocal.agentId && { agentId: appliedFiltersLocal.agentId }),
                          ...(appliedFiltersLocal.paymentTypeId && {
                            paymentTypeId: appliedFiltersLocal.paymentTypeId,
                          }),
                          ...(appliedFiltersLocal.status && { status: appliedFiltersLocal.status }),
                          ...(appliedFiltersLocal.resolutionAction && {
                            resolutionAction: appliedFiltersLocal.resolutionAction,
                          }),
                          ...(appliedFiltersLocal.channel && {
                            channel: appliedFiltersLocal.channel as AllAnomaliesRequestParams["channel"],
                          }),
                          ...(appliedFiltersLocal.minAmount !== undefined && {
                            minAmount: appliedFiltersLocal.minAmount,
                          }),
                          ...(appliedFiltersLocal.maxAmount !== undefined && {
                            maxAmount: appliedFiltersLocal.maxAmount,
                          }),
                          ...(appliedFiltersLocal.detectedFromUtc && {
                            detectedFromUtc: formatDateTime(appliedFiltersLocal.detectedFromUtc, true),
                          }),
                          ...(appliedFiltersLocal.detectedToUtc && {
                            detectedToUtc: formatDateTime(appliedFiltersLocal.detectedToUtc, false),
                          }),
                          ...(appliedFiltersLocal.paidFromUtc && {
                            paidFromUtc: formatDateTime(appliedFiltersLocal.paidFromUtc, true),
                          }),
                          ...(appliedFiltersLocal.paidToUtc && {
                            paidToUtc: formatDateTime(appliedFiltersLocal.paidToUtc, false),
                          }),
                          ...(appliedFiltersLocal.ruleKey && { ruleKey: appliedFiltersLocal.ruleKey }),
                          ...(appliedFiltersLocal.search && { search: appliedFiltersLocal.search }),
                          ...(appliedFiltersLocal.sortBy && { sortBy: appliedFiltersLocal.sortBy }),
                          ...(appliedFiltersLocal.sortOrder && { sortOrder: appliedFiltersLocal.sortOrder }),
                        }
                        dispatch(fetchAllAnomalies(fetchParams))
                      }}
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
                      onClick={() => paginate(currentPage - 1)}
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
                          onClick={() => paginate(pageNum)}
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
                      onClick={() => paginate(currentPage + 1)}
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
        {showDesktopFiltersLocal && (
          <div className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Filters & Sorting</h3>
                <button onClick={resetFilters} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  Clear All
                </button>
              </div>
              {getActiveFilterCountLocal() > 0 && (
                <p className="mt-1 text-xs text-gray-600">{getActiveFilterCountLocal()} active filter(s)</p>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-3">
              <div className="space-y-4">
                {/* Customer Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Customer</label>
                  <FormSelectModule
                    name="customerId"
                    value={localFilters.customerId || ""}
                    onChange={(e) =>
                      handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={customerOptions}
                    className="w-full"
                    controlClassName="h-8 text-xs border-gray-300"
                  />
                </div>

                {/* Vendor Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Vendor</label>
                  <FormSelectModule
                    name="vendorId"
                    value={localFilters.vendorId || ""}
                    onChange={(e) =>
                      handleFilterChange("vendorId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={vendorOptions}
                    className="w-full"
                    controlClassName="h-8 text-xs border-gray-300"
                  />
                </div>

                {/* Agent Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Agent</label>
                  <FormSelectModule
                    name="agentId"
                    value={localFilters.agentId || ""}
                    onChange={(e) => handleFilterChange("agentId", e.target.value ? Number(e.target.value) : undefined)}
                    options={agentOptions}
                    className="w-full"
                    controlClassName="h-8 text-xs border-gray-300"
                  />
                </div>

                {/* Payment Type Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Payment Type</label>
                  <div className="grid grid-cols-2 gap-1">
                    {paymentTypeOptions
                      .filter((opt) => opt.value !== "")
                      .slice(0, 6)
                      .map((typeOption) => (
                        <button
                          key={typeOption.value}
                          onClick={() =>
                            handleFilterChange(
                              "paymentTypeId",
                              localFilters.paymentTypeId === Number(typeOption.value)
                                ? undefined
                                : Number(typeOption.value)
                            )
                          }
                          className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
                            localFilters.paymentTypeId === Number(typeOption.value)
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {typeOption.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Channel Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Payment Channel</label>
                  <FormSelectModule
                    name="channel"
                    value={String(localFilters.channel || "")}
                    onChange={(e) => handleFilterChange("channel", e.target.value || undefined)}
                    options={channelOptions}
                    className="w-full"
                    controlClassName="h-8 text-xs border-gray-300"
                  />
                </div>

                {/* Status Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Status</label>
                  <div className="grid grid-cols-2 gap-1">
                    {["Open", "Resolved"].map((statusValue) => {
                      return (
                        <button
                          key={statusValue}
                          onClick={() =>
                            handleFilterChange(
                              "status",
                              localFilters.status === statusValue ? undefined : (statusValue as "Open" | "Resolved")
                            )
                          }
                          className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
                            localFilters.status === statusValue
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {statusValue}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Resolution Action Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Resolution Action</label>
                  <div className="grid grid-cols-2 gap-1">
                    {resolutionActionOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange(
                              "resolutionAction",
                              localFilters.resolutionAction?.toString() === option.value ? undefined : option.value
                            )
                          }
                          className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
                            localFilters.resolutionAction?.toString() === (option.value as string)
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Amount Range Filters */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Min Amount</label>
                  <input
                    type="number"
                    value={localFilters.minAmount || ""}
                    onChange={(e) =>
                      handleFilterChange("minAmount", e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="Enter min amount..."
                    className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Max Amount</label>
                  <input
                    type="number"
                    value={localFilters.maxAmount || ""}
                    onChange={(e) =>
                      handleFilterChange("maxAmount", e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="Enter max amount..."
                    className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Date Range Filters */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Detected From</label>
                  <input
                    type="date"
                    value={localFilters.detectedFromUtc || ""}
                    onChange={(e) => handleFilterChange("detectedFromUtc", e.target.value || undefined)}
                    className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Detected To</label>
                  <input
                    type="date"
                    value={localFilters.detectedToUtc || ""}
                    onChange={(e) => handleFilterChange("detectedToUtc", e.target.value || undefined)}
                    className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Paid From</label>
                  <input
                    type="date"
                    value={localFilters.paidFromUtc || ""}
                    onChange={(e) => handleFilterChange("paidFromUtc", e.target.value || undefined)}
                    className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Paid To</label>
                  <input
                    type="date"
                    value={localFilters.paidToUtc || ""}
                    onChange={(e) => handleFilterChange("paidToUtc", e.target.value || undefined)}
                    className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Text Input Filters */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Rule Key</label>
                  <input
                    type="text"
                    value={localFilters.ruleKey || ""}
                    onChange={(e) => handleFilterChange("ruleKey", e.target.value || undefined)}
                    placeholder="Enter rule key..."
                    className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
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
                    <span className="font-medium text-gray-900">{getActiveFilterCountLocal()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        paymentTypeOptions={paymentTypeOptions}
        resolutionActionOptions={resolutionActionOptions}
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
                  <h3 className="text-lg font-semibold text-gray-900">Export Anomalies to CSV</h3>
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
                        <option value="Open">Open</option>
                        <option value="Resolved">Resolved</option>
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
                        <option value="Chaque">Chaque</option>
                        <option value="BankDeposit">Bank Deposit</option>
                        <option value="Vendor">Vendor</option>
                        <option value="Migration">Migration</option>
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

                  {/* Payment Type */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Payment Type</label>
                    <select
                      value={exportPaymentTypeId}
                      onChange={(e) => setExportPaymentTypeId(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                    >
                      <option value="">All Types</option>
                      {paymentTypes?.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      )) || []}
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

      {/* Resolve Anomaly Modal */}
      {selectedAnomaly && (
        <ResolveAnomalyModal
          isOpen={isResolveModalOpen}
          onClose={handleCloseResolveModal}
          anomaly={{
            id: selectedAnomaly.id,
            reference: selectedAnomaly.reference,
            customerName: selectedAnomaly.customerName,
            amount: selectedAnomaly.amount,
            channel: selectedAnomaly.channel,
            ruleKey: selectedAnomaly.ruleKey,
            issue: selectedAnomaly.issue,
            status: selectedAnomaly.status,
          }}
        />
      )}
    </div>
  )
}

export default AllAnomaliesTable
