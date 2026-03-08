"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
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

// ==================== Status Badge Component ====================
const StatusBadge = ({ status }: { status: "Pending" | "Confirmed" | "Failed" | "Reversed" }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Failed":
        return "bg-red-50 text-red-700 border-red-200"
      case "Reversed":
        return "bg-blue-50 text-blue-700 border-blue-200"
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
      case "Reversed":
        return "bg-blue-500"
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

// ==================== Action Dropdown Component ====================
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
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RefreshCw className="size-3.5" />
              Update Payment
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {[...Array(10)].map((_, i) => (
                <th key={i} className="px-3 py-2.5">
                  <div className="h-3.5 w-16 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {[...Array(10)].map((_, cellIndex) => (
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

// ==================== Sort Option Interface ====================
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

                {/* Customer Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Customer</label>
                  <FormSelectModule
                    name="customerId"
                    value={localFilters.customerId || ""}
                    onChange={(e) => handleFilterChange("customerId", e.target.value || undefined)}
                    options={customerOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm border-gray-300"
                  />
                </div>

                {/* Vendor Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Vendor</label>
                  <FormSelectModule
                    name="vendorId"
                    value={localFilters.vendorId || ""}
                    onChange={(e) => handleFilterChange("vendorId", e.target.value || undefined)}
                    options={vendorOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm border-gray-300"
                  />
                </div>

                {/* Agent Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Agent</label>
                  <FormSelectModule
                    name="agentId"
                    value={localFilters.agentId || ""}
                    onChange={(e) => handleFilterChange("agentId", e.target.value || undefined)}
                    options={agentOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm border-gray-300"
                  />
                </div>

                {/* Channel Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Payment Channel</label>
                  <FormSelectModule
                    name="channel"
                    value={String(localFilters.channel || "")}
                    onChange={(e) => handleFilterChange("channel", e.target.value || undefined)}
                    options={channelOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm border-gray-300"
                  />
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Status</label>
                  <div className="grid grid-cols-2 gap-1.5">
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
                          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                            localFilters.status === option.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Refund Type Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Refund Type</label>
                  <FormSelectModule
                    name="refundTypeKey"
                    value={String(localFilters.refundTypeKey || "")}
                    onChange={(e) => handleFilterChange("refundTypeKey", e.target.value || undefined)}
                    options={refundTypeOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm border-gray-300"
                  />
                </div>

                {/* Date Range Filters */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">From Date</label>
                  <input
                    type="date"
                    value={localFilters.fromUtc || ""}
                    onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">To Date</label>
                  <input
                    type="date"
                    value={localFilters.toUtc || ""}
                    onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Reference Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Reference</label>
                  <input
                    type="text"
                    value={localFilters.reference || ""}
                    onChange={(e) => handleFilterChange("reference", e.target.value || undefined)}
                    placeholder="Enter reference..."
                    className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
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
  customerOptions,
  vendorOptions,
  agentOptions,
  channelOptions,
  statusOptions,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
  refundTypeOptions,
  totalRecords,
  currentPage,
  totalPages,
}: {
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
          {/* Customer Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Customer</label>
            <FormSelectModule
              name="customerId"
              value={localFilters.customerId || ""}
              onChange={(e) => handleFilterChange("customerId", e.target.value || undefined)}
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
              onChange={(e) => handleFilterChange("vendorId", e.target.value || undefined)}
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
              onChange={(e) => handleFilterChange("agentId", e.target.value || undefined)}
              options={agentOptions}
              className="w-full"
              controlClassName="h-8 text-xs border-gray-300"
            />
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
              {statusOptions
                .filter((opt) => opt.value !== "")
                .map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleFilterChange("status", localFilters.status === option.value ? undefined : option.value)
                    }
                    className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
                      localFilters.status === option.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
            </div>
          </div>

          {/* Refund Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Refund Type</label>
            <FormSelectModule
              name="refundTypeKey"
              value={String(localFilters.refundTypeKey || "")}
              onChange={(e) => handleFilterChange("refundTypeKey", e.target.value || undefined)}
              options={refundTypeOptions}
              className="w-full"
              controlClassName="h-8 text-xs border-gray-300"
            />
          </div>

          {/* Date Range Filters */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">From Date</label>
            <input
              type="date"
              value={localFilters.fromUtc || ""}
              onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
              className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={localFilters.toUtc || ""}
              onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
              className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Reference Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Reference</label>
            <input
              type="text"
              value={localFilters.reference || ""}
              onChange={(e) => handleFilterChange("reference", e.target.value || undefined)}
              placeholder="Enter reference..."
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
              <span className="font-medium text-gray-900">{getActiveFilterCount()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Export Modal ====================
const ExportModal = ({
  isOpen,
  onClose,
  onExport,
  isExporting,
}: {
  isOpen: boolean
  onClose: () => void
  onExport: () => void
  isExporting: boolean
}) => {
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month" | "custom">("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [channel, setChannel] = useState("all")
  const [status, setStatus] = useState("all")
  const [customerId, setCustomerId] = useState("")
  const [vendorId, setVendorId] = useState("")
  const [agentId, setAgentId] = useState("")
  const [refundType, setRefundType] = useState("")
  const [reference, setReference] = useState("")

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Export Refunds to CSV</h3>
            <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="space-y-5">
            {/* Date Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Date Range</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: "all", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "week", label: "Last 7 Days" },
                  { value: "month", label: "Last 30 Days" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDateRange(option.value as typeof dateRange)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                      dateRange === option.value
                        ? "border-[#004B23] bg-[#e9f5ef] text-[#004B23]"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setDateRange("custom")}
                className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                  dateRange === "custom"
                    ? "border-[#004B23] bg-[#e9f5ef] text-[#004B23]"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Calendar className="mr-1.5 inline-block size-3.5" />
                Custom Range
              </button>
            </div>

            {dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                  />
                </div>
              </div>
            )}

            {/* Status and Channel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Failed">Failed</option>
                  <option value="Reversed">Reversed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Customer ID</label>
                <input
                  type="text"
                  placeholder="Enter ID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Reference</label>
                <input
                  type="text"
                  placeholder="Enter reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Vendor ID</label>
                <input
                  type="text"
                  placeholder="Enter ID"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Agent ID</label>
                <input
                  type="text"
                  placeholder="Enter ID"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                />
              </div>
            </div>

            {/* Refund Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Refund Type</label>
              <select
                value={refundType}
                onChange={(e) => setRefundType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
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
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onExport}
              disabled={isExporting}
              className="flex-1 rounded-lg bg-[#004B23] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" />
                  Exporting...
                </span>
              ) : (
                "Export"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== Main Table Component ====================
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
      date.setHours(0, 0, 0, 0)
    } else {
      date.setHours(23, 59, 59, 999)
    }

    return date.toISOString()
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

  const exportToCSV = async () => {
    setIsExporting(true)
    setShowExportModal(false)

    try {
      // In a real implementation, you would call your export API here
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // You would normally dispatch an action here to fetch and download the CSV
      console.log("Exporting refunds...")
    } catch (error) {
      console.error("Failed to export refunds:", error)
    } finally {
      setIsExporting(false)
    }
  }

  if (refundHistoryLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Refunds</h2>
            <p className="mt-1 text-xs text-gray-600">View and manage all refund transactions</p>
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
                placeholder="Search refunds..."
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
          {refundHistoryError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2">
                <AlertCircle className="size-4 text-red-600" />
                <p className="text-xs text-red-700">{refundHistoryError}</p>
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
            {refundHistoryData.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center px-4">
                <div className="rounded-full bg-gray-100 p-3">
                  <Info className="size-6 text-gray-400" />
                </div>
                <p className="mt-3 text-base font-medium text-gray-900">No refunds found</p>
                <p className="mt-1 text-xs text-gray-600">
                  {searchText ? "Try adjusting your search or filters" : "Refunds will appear here once processed"}
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
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80">
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("refundReference")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Ref
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
                            onClick={() => toggleSort("refundTypeName")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Type
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
                            onClick={() => toggleSort("refundedAtUtc")}
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
                        {refundHistoryData.map((refund, index) => (
                          <motion.tr
                            key={refund.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.01 }}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                          >
                            <td className="whitespace-nowrap p-2 text-xs font-medium text-gray-900">
                              {refund.refundReference || `REF-${refund.id}`}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs font-semibold text-gray-900">
                              {formatCurrency(refund.amount)}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs">
                              <div>
                                <div className="font-medium text-gray-900">{refund.customerName || "-"}</div>
                                {refund.customerAccountNumber && (
                                  <div className="text-[10px] text-gray-500">{refund.customerAccountNumber}</div>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">{refund.vendorName || "-"}</td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">{refund.agentName || "-"}</td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {refund.refundTypeName || "-"}
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <ChannelBadge channel={refund.channel} />
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <StatusBadge status={refund.status} />
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {refund.refundedAtUtc ? formatDate(refund.refundedAtUtc) : "-"}
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <ActionDropdown refund={refund} onViewDetails={handleViewRefundDetails} />
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2.5">
                  <p className="text-xs text-gray-600">
                    {currentPage * pageSize - pageSize + 1}-{Math.min(currentPage * pageSize, totalRecords)} of{" "}
                    {totalRecords}
                  </p>
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
          <DesktopFilterPanel
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
            totalRecords={totalRecords}
            currentPage={currentPage}
            totalPages={totalPages}
          />
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

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={exportToCSV}
            isExporting={isExporting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AllRefundsTable
