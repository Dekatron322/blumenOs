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
import { fetchPayments, Payment, PaymentsRequestParams } from "lib/redux/paymentSlice"
import { CollectorType, PaymentChannel } from "lib/redux/agentSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearCustomers, fetchCustomers } from "lib/redux/customerSlice"
import { clearVendors, fetchVendors } from "lib/redux/vendorSlice"
import { clearAgents, fetchAgents } from "lib/redux/agentSlice"
import { clearPaymentTypes, fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import EmptySearchState from "components/ui/EmptySearchState"

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

// ==================== Collector Type Badge ====================
const CollectorTypeBadge = ({ type }: { type: string }) => {
  const getTypeStyles = () => {
    switch (type) {
      case "Customer":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Agent":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "Vendor":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Staff":
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getTypeStyles()}`}>{type}</span>
  )
}

// ==================== Action Dropdown Component ====================
interface ActionDropdownProps {
  payment: Payment
  onViewDetails: (payment: Payment) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ payment, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    onViewDetails(payment)
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

// ==================== Sort Option Interface ====================
interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

// Channel mapping utilities
const channelStringToEnum = (channelString: string): PaymentChannel => {
  switch (channelString) {
    case "Cash":
      return PaymentChannel.Cash
    case "BankTransfer":
      return PaymentChannel.BankTransfer
    case "Pos":
      return PaymentChannel.Pos
    case "Card":
      return PaymentChannel.Card
    case "VendorWallet":
      return PaymentChannel.VendorWallet
    case "Chaque":
      return PaymentChannel.Chaque
    default:
      return PaymentChannel.Cash
  }
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
  paymentTypeOptions,
  areaOfficeOptions,
  channelOptions,
  statusOptions,
  collectorTypeOptions,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  customerOptions: Array<{ value: string | number; label: string }>
  vendorOptions: Array<{ value: string | number; label: string }>
  agentOptions: Array<{ value: string | number; label: string }>
  paymentTypeOptions: Array<{ value: string | number; label: string }>
  areaOfficeOptions: Array<{ value: string | number; label: string }>
  channelOptions: Array<{ value: string; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  collectorTypeOptions: Array<{ value: string; label: string }>
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

                {/* Customer Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Customer</label>
                  <FormSelectModule
                    name="customerId"
                    value={localFilters.customerId || ""}
                    onChange={(e) =>
                      handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                    }
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
                    onChange={(e) =>
                      handleFilterChange("vendorId", e.target.value ? Number(e.target.value) : undefined)
                    }
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
                    onChange={(e) => handleFilterChange("agentId", e.target.value ? Number(e.target.value) : undefined)}
                    options={agentOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm border-gray-300"
                  />
                </div>

                {/* Payment Type Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Payment Type</label>
                  <div className="grid grid-cols-2 gap-1.5">
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
                          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
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

                {/* Area Office Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Area Office</label>
                  <FormSelectModule
                    name="areaOfficeId"
                    value={localFilters.areaOfficeId || ""}
                    onChange={(e) =>
                      handleFilterChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={areaOfficeOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm border-gray-300"
                  />
                </div>

                {/* Channel Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Payment Channel</label>
                  <FormSelectModule
                    name="channel"
                    value={localFilters.channel || ""}
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
                    {["Confirmed", "Pending", "Failed", "Reversed"].map((statusValue) => {
                      const statusLabel = statusOptions.find((opt) => opt.value === statusValue)?.label || statusValue
                      return (
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
                          {statusLabel}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Collector Type Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Collector Type</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Customer", "Agent", "Vendor", "Staff"].map((collectorTypeValue) => {
                      const collectorTypeLabel =
                        collectorTypeOptions.find((opt) => opt.value === collectorTypeValue)?.label ||
                        collectorTypeValue
                      return (
                        <button
                          key={collectorTypeValue}
                          onClick={() =>
                            handleFilterChange(
                              "collectorType",
                              localFilters.collectorType === collectorTypeValue ? undefined : collectorTypeValue
                            )
                          }
                          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                            localFilters.collectorType === collectorTypeValue
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {collectorTypeLabel}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Date Range Filters */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Paid From</label>
                  <input
                    type="date"
                    value={localFilters.paidFromUtc || ""}
                    onChange={(e) => handleFilterChange("paidFromUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Paid To</label>
                  <input
                    type="date"
                    value={localFilters.paidToUtc || ""}
                    onChange={(e) => handleFilterChange("paidToUtc", e.target.value || undefined)}
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
                  className="flex-1 rounded-md bg-[#004B23] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00361a] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
  paymentTypeOptions,
  areaOfficeOptions,
  channelOptions,
  statusOptions,
  collectorTypeOptions,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
  totalRecords,
  currentPage,
  totalPages,
}: {
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  customerOptions: Array<{ value: string | number; label: string }>
  vendorOptions: Array<{ value: string | number; label: string }>
  agentOptions: Array<{ value: string | number; label: string }>
  paymentTypeOptions: Array<{ value: string | number; label: string }>
  areaOfficeOptions: Array<{ value: string | number; label: string }>
  channelOptions: Array<{ value: string; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  collectorTypeOptions: Array<{ value: string; label: string }>
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
          {/* Customer Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Customer</label>
            <FormSelectModule
              name="customerId"
              value={localFilters.customerId || ""}
              onChange={(e) => handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)}
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
              onChange={(e) => handleFilterChange("vendorId", e.target.value ? Number(e.target.value) : undefined)}
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
                        localFilters.paymentTypeId === Number(typeOption.value) ? undefined : Number(typeOption.value)
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

          {/* Area Office Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Area Office</label>
            <FormSelectModule
              name="areaOfficeId"
              value={localFilters.areaOfficeId || ""}
              onChange={(e) => handleFilterChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)}
              options={areaOfficeOptions}
              className="w-full"
              controlClassName="h-8 text-xs border-gray-300"
            />
          </div>

          {/* Channel Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Payment Channel</label>
            <FormSelectModule
              name="channel"
              value={localFilters.channel || ""}
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
              {["Confirmed", "Pending", "Failed", "Reversed"].map((statusValue) => {
                const statusLabel = statusOptions.find((opt) => opt.value === statusValue)?.label || statusValue
                return (
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
                    {statusLabel}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Collector Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Collector Type</label>
            <div className="grid grid-cols-2 gap-1">
              {["Customer", "Agent", "Vendor", "Staff"].map((collectorTypeValue) => {
                const collectorTypeLabel =
                  collectorTypeOptions.find((opt) => opt.value === collectorTypeValue)?.label || collectorTypeValue
                return (
                  <button
                    key={collectorTypeValue}
                    onClick={() =>
                      handleFilterChange(
                        "collectorType",
                        localFilters.collectorType === collectorTypeValue ? undefined : collectorTypeValue
                      )
                    }
                    className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
                      localFilters.collectorType === collectorTypeValue
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {collectorTypeLabel}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date Range Filters */}
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
  const [paymentType, setPaymentType] = useState("")
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
            <h3 className="text-lg font-semibold text-gray-900">Export Payments to CSV</h3>
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

            {/* Payment Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
              >
                <option value="">All Types</option>
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
                <option value="deposit">Deposit</option>
                <option value="fee">Service Fee</option>
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
const RecentPayments = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { payments, loading, error, pagination } = useAppSelector((state) => state.payments)
  const { customers } = useAppSelector((state) => state.customers)
  const { vendors } = useAppSelector((state) => state.vendors)
  const { agents } = useAppSelector((state) => state.agents)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // Export CSV state
  const [isExporting, setIsExporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    paymentTypeId: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    channel: undefined as PaymentChannel | undefined,
    status: undefined as "Pending" | "Confirmed" | "Failed" | "Reversed" | undefined,
    collectorType: undefined as CollectorType | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    paymentTypeId: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    channel: undefined as PaymentChannel | undefined,
    status: undefined as "Pending" | "Confirmed" | "Failed" | "Reversed" | undefined,
    collectorType: undefined as CollectorType | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  const currentPage = pagination?.currentPage || 1
  const pageSize = pagination?.pageSize || 10
  const totalRecords = pagination?.totalCount || 0
  const totalPages = pagination?.totalPages || 0

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
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )

    return () => {
      dispatch(clearCustomers())
      dispatch(clearVendors())
      dispatch(clearAgents())
      dispatch(clearPaymentTypes())
      dispatch(clearAreaOffices())
    }
  }, [dispatch])

  // Fetch payments based on applied filters
  useEffect(() => {
    const params: PaymentsRequestParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
      search: searchText || undefined,
      ...appliedFilters,
    }

    dispatch(fetchPayments(params))
  }, [dispatch, currentPage, pageSize, searchText, appliedFilters])

  const handleViewDetails = (payment: Payment) => {
    router.push(`/payment/payment-detail/${payment.id}`)
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
      const params: PaymentsRequestParams = {
        pageNumber: page,
        pageSize: pageSize,
        search: searchText || undefined,
        ...appliedFilters,
      }
      dispatch(fetchPayments(params))
    }
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    const params: PaymentsRequestParams = {
      pageNumber: 1,
      pageSize: newPageSize,
      search: searchText || undefined,
      ...appliedFilters,
    }
    dispatch(fetchPayments(params))
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    let processedValue = value

    if (key === "channel" && typeof value === "string" && value) {
      processedValue = channelStringToEnum(value)
    }

    if (key === "collectorType" && typeof value === "string" && value) {
      processedValue = value as CollectorType
    }

    setLocalFilters((prev) => ({
      ...prev,
      [key]: processedValue === "" ? undefined : processedValue,
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
      customerId: localFilters.customerId,
      vendorId: localFilters.vendorId,
      agentId: localFilters.agentId,
      paymentTypeId: localFilters.paymentTypeId,
      areaOfficeId: localFilters.areaOfficeId,
      channel: localFilters.channel,
      status: localFilters.status,
      collectorType: localFilters.collectorType,
      paidFromUtc: localFilters.paidFromUtc,
      paidToUtc: localFilters.paidToUtc,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortBy ? localFilters.sortOrder : undefined,
    })
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setLocalFilters({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      paymentTypeId: undefined,
      areaOfficeId: undefined,
      channel: undefined,
      status: undefined,
      collectorType: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      paymentTypeId: undefined,
      areaOfficeId: undefined,
      channel: undefined,
      status: undefined,
      collectorType: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setSearchText("")
    setSearchInput("")
    setCurrentPage(1)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.customerId) count++
    if (appliedFilters.vendorId) count++
    if (appliedFilters.agentId) count++
    if (appliedFilters.paymentTypeId) count++
    if (appliedFilters.areaOfficeId) count++
    if (appliedFilters.channel) count++
    if (appliedFilters.status) count++
    if (appliedFilters.collectorType) count++
    if (appliedFilters.paidFromUtc) count++
    if (appliedFilters.paidToUtc) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  // Filter options
  const customerOptions = [
    { value: "", label: "All Customers" },
    ...customers.map((customer) => ({
      value: customer.id,
      label: customer.fullName || customer.accountNumber || `Customer ${customer.id}`,
    })),
  ]

  const vendorOptions = [
    { value: "", label: "All Vendors" },
    ...vendors.map((vendor) => ({
      value: vendor.id,
      label: vendor.name || `Vendor ${vendor.id}`,
    })),
  ]

  const agentOptions = [
    { value: "", label: "All Agents" },
    ...agents.map((agent) => ({
      value: agent.id,
      label: agent.user?.fullName || agent.agentCode || `Agent ${agent.id}`,
    })),
  ]

  const paymentTypeOptions = [
    { value: "", label: "All Payment Types" },
    ...paymentTypes.map((type) => ({
      value: type.id,
      label: type.name || `Payment Type ${type.id}`,
    })),
  ]

  const areaOfficeOptions = [
    { value: "", label: "All Area Offices" },
    ...areaOffices.map((office) => ({
      value: office.id,
      label: office.nameOfNewOAreaffice || `Area Office ${office.id}`,
    })),
  ]

  const channelOptions = [
    { value: "", label: "All Channels" },
    { value: "Cash", label: "Cash" },
    { value: "BankTransfer", label: "Bank Transfer" },
    { value: "Pos", label: "POS Agent" },
    { value: "Card", label: "Card Payment" },
    { value: "VendorWallet", label: "Vendor Wallet" },
  ]

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Pending", label: "Pending" },
    { value: "Failed", label: "Failed" },
    { value: "Reversed", label: "Reversed" },
  ]

  const collectorTypeOptions = [
    { value: "", label: "All Collector Types" },
    { value: "Customer", label: "Customer" },
    { value: "Agent", label: "Agent" },
    { value: "Vendor", label: "Vendor" },
    { value: "Staff", label: "Staff" },
  ]

  const sortOptions: SortOption[] = [
    { label: "Date (Newest First)", value: "paidAtUtc", order: "desc" },
    { label: "Date (Oldest First)", value: "paidAtUtc", order: "asc" },
    { label: "Amount (High to Low)", value: "amount", order: "desc" },
    { label: "Amount (Low to High)", value: "amount", order: "asc" },
    { label: "Customer Name (A-Z)", value: "customerName", order: "asc" },
    { label: "Customer Name (Z-A)", value: "customerName", order: "desc" },
  ]

  const exportToCSV = async () => {
    setIsExporting(true)
    setShowExportModal(false)

    try {
      // In a real implementation, you would call your export API here
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Exporting payments...")
    } catch (error) {
      console.error("Failed to export payments:", error)
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            <p className="mt-1 text-xs text-gray-600">View and manage all payment transactions</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
        {getActiveFilterCount() > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gray-200 pt-3">
            <span className="text-xs text-gray-600">Active:</span>
            {appliedFilters.customerId && (
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
            {appliedFilters.vendorId && (
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
            {appliedFilters.status && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {appliedFilters.status}
                <button onClick={() => handleFilterChange("status", undefined)} className="ml-0.5 hover:text-amber-900">
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {appliedFilters.channel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                {appliedFilters.channel}
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
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2">
                <AlertCircle className="size-4 text-red-600" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Priority Section */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-green-50/60 to-white p-4 shadow-sm">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#004B23]">Primary action</p>
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Search Payments</h2>
          <p className="text-xs text-gray-600 sm:text-sm">
            Find payments quickly by transaction ID, customer name, amount, or payment method.
          </p>
        </div>

        <SearchModule
          value={searchInput}
          onChange={handleSearch}
          onCancel={handleCancelSearch}
          onSearch={handleManualSearch}
          placeholder="Search by transaction ID, customer name, amount, or payment method..."
          height="h-14"
          className="!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm md:!w-full [&_button]:min-h-[38px] [&_button]:px-4 [&_button]:text-sm [&_input]:text-sm sm:[&_input]:text-base"
        />
      </div>

      {/* Main Content with Table on Left, Filters on Right */}
      <div className="flex flex-col-reverse gap-5 lg:flex-row">
        {/* Table - Takes remaining width */}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {payments.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center px-4">
                <EmptySearchState
                  title="No payments found"
                  description={
                    searchText || getActiveFilterCount() > 0
                      ? "Try adjusting your search or filters"
                      : "Payments will appear here once processed"
                  }
                />
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
                  <table className="w-full min-w-[1200px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80">
                        <th className="p-2 text-left">
                          <button
                            onClick={() => toggleSort("reference")}
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
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            Collector
                          </span>
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
                            onClick={() => toggleSort("paidAtUtc")}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Date
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            Payment ID
                          </span>
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
                        {payments.map((payment, index) => (
                          <motion.tr
                            key={payment.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.01 }}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                          >
                            <td className="whitespace-nowrap p-2 text-xs font-medium text-gray-900">
                              {payment.reference || `PAY-${payment.id}`}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs font-semibold text-gray-900">
                              {formatCurrency(payment.amount || 0)}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs">
                              <div>
                                <div className="font-medium text-gray-900">{payment.customerName || "-"}</div>
                                {payment.customerAccountNumber && (
                                  <div className="text-[10px] text-gray-500">{payment.customerAccountNumber}</div>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">{payment.vendorName || "-"}</td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">{payment.agentName || "-"}</td>
                            <td className="whitespace-nowrap p-2">
                              <CollectorTypeBadge type={payment.collectorType || "Customer"} />
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <ChannelBadge channel={payment.channel} />
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <StatusBadge status={"Pending"} />
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              {formatDateTime(payment.paidAtUtc)}
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                                {payment.id}
                              </span>
                            </td>
                            <td className="whitespace-nowrap p-2">
                              <ActionDropdown payment={payment} onViewDetails={handleViewDetails} />
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
            customerOptions={customerOptions}
            vendorOptions={vendorOptions}
            agentOptions={agentOptions}
            paymentTypeOptions={paymentTypeOptions}
            areaOfficeOptions={areaOfficeOptions}
            channelOptions={channelOptions}
            statusOptions={statusOptions}
            collectorTypeOptions={collectorTypeOptions}
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
        customerOptions={customerOptions}
        vendorOptions={vendorOptions}
        agentOptions={agentOptions}
        paymentTypeOptions={paymentTypeOptions}
        areaOfficeOptions={areaOfficeOptions}
        channelOptions={channelOptions}
        statusOptions={statusOptions}
        collectorTypeOptions={collectorTypeOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
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

export default RecentPayments
