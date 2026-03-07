"use client"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  RefreshCw,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"

import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { PlusIcon, UserIcon } from "components/Icons/Icons"
import { SearchModule } from "components/ui/Search/search-module"

import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearAgents, fetchAgents } from "lib/redux/agentSlice"
import { hasPermission, isUserPermission, UserPermission } from "components/Sidebar/Links"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearCustomers, fetchCustomers } from "lib/redux/customerSlice"
import { clearPaymentTypes, fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import {
  clearExportPayments,
  clearPayments,
  exportPayments,
  ExportPaymentsRequest,
  fetchPaymentChannels,
  fetchPayments,
  Payment,
  PaymentsRequestParams,
} from "lib/redux/paymentSlice"
import { CollectorType, PaymentChannel } from "lib/redux/agentSlice"
import { clearVendors, fetchVendors } from "lib/redux/vendorSlice"
import { clearDistributionSubstations, fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { clearFeeders, fetchFeeders } from "lib/redux/feedersSlice"
import { clearServiceStations, fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { clearBills, fetchPostpaidBills } from "lib/redux/postpaidSlice"
import { clearCountries, fetchCountries } from "lib/redux/countriesSlice"
import { VscEye } from "react-icons/vsc"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"

// Boolean options for filters
const booleanOptions = [
  { value: "", label: "All" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
]

// Clearance status options for filters
const clearanceStatusOptions = [
  { value: "", label: "All" },
  { value: "Uncleared", label: "Uncleared" },
  { value: "Cleared", label: "Cleared" },
  { value: "ClearedWithCondition", label: "Cleared with Condition" },
]

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
              <VscEye className="size-3.5" />
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
    case "BankDeposit":
      return PaymentChannel.Cash // Map to Cash as enum doesn't exist
    case "Vendor":
      return PaymentChannel.VendorWallet // Map to VendorWallet as enum doesn't exist
    case "Migration":
      return PaymentChannel.Cash // Map to Cash as enum doesn't exist
    default:
      return PaymentChannel.Cash
  }
}

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

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

const LoadingSkeleton = () => {
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-4 py-8  max-sm:px-2 xl:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Payment Management</h4>
                <p className="text-gray-600">Track and manage customer payments and transactions</p>
              </div>
            </div>
            <motion.div
              className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5"
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
                      {[...Array(10)].map((_, i) => (
                        <th key={i} className="whitespace-nowrap border-b p-4">
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {[...Array(10)].map((_, cellIndex) => (
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
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
  paymentTypeOptions,
  areaOfficeOptions,
  channelOptions,
  statusOptions,
  collectorTypeOptions,
  distributionSubstationOptions,
  feederOptions,
  serviceCenterOptions,
  postpaidBillOptions,
  customerProvinceOptions,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
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
  paymentTypeOptions: Array<{ value: string | number; label: string }>
  areaOfficeOptions: Array<{ value: string | number; label: string }>
  channelOptions: Array<{ value: string | PaymentChannel; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  collectorTypeOptions: Array<{ value: string; label: string }>
  distributionSubstationOptions: Array<{ value: string | number; label: string }>
  feederOptions: Array<{ value: string | number; label: string }>
  serviceCenterOptions: Array<{ value: string | number; label: string }>
  postpaidBillOptions: Array<{ value: string | number; label: string }>
  customerProvinceOptions: Array<{ value: string | number; label: string }>
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
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

                {/* Payment Type Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentTypeOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => {
                        const paymentTypeValue = typeof option.value === "number" ? option.value : Number(option.value)
                        return (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleFilterChange(
                                "paymentTypeId",
                                localFilters.paymentTypeId === paymentTypeValue ? undefined : paymentTypeValue
                              )
                            }
                            className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                              localFilters.paymentTypeId === paymentTypeValue
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                  </div>
                </div>

                {/* Area Office Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                  <FormSelectModule
                    name="areaOfficeId"
                    value={localFilters.areaOfficeId || ""}
                    onChange={(e) => handleFilterChange("areaOfficeId", e.target.value || undefined)}
                    options={areaOfficeOptions}
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

                {/* Collector Type Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Collector Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {collectorTypeOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange(
                              "collectorType",
                              localFilters.collectorType === option.value ? undefined : option.value
                            )
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.collectorType === option.value
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Date Range Filters */}
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
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Reference</label>
                  <input
                    type="text"
                    value={localFilters.reference || ""}
                    onChange={(e) => handleFilterChange("reference", e.target.value || undefined)}
                    placeholder="Enter reference..."
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Account Number</label>
                  <input
                    type="text"
                    value={localFilters.accountNumber || ""}
                    onChange={(e) => handleFilterChange("accountNumber", e.target.value || undefined)}
                    placeholder="Enter account number..."
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Meter Number</label>
                  <input
                    type="text"
                    value={localFilters.meterNumber || ""}
                    onChange={(e) => handleFilterChange("meterNumber", e.target.value || undefined)}
                    placeholder="Enter meter number..."
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                {/* ID Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                    Distribution Substation
                  </label>
                  <FormSelectModule
                    name="distributionSubstationId"
                    value={localFilters.distributionSubstationId || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "distributionSubstationId",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    options={distributionSubstationOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Feeder</label>
                  <FormSelectModule
                    name="feederId"
                    value={localFilters.feederId || ""}
                    onChange={(e) =>
                      handleFilterChange("feederId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={feederOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Service Center</label>
                  <FormSelectModule
                    name="serviceCenterId"
                    value={localFilters.serviceCenterId || ""}
                    onChange={(e) =>
                      handleFilterChange("serviceCenterId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={serviceCenterOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Postpaid Bill</label>
                  <FormSelectModule
                    name="postpaidBillId"
                    value={localFilters.postpaidBillId || ""}
                    onChange={(e) =>
                      handleFilterChange("postpaidBillId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={postpaidBillOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer Province</label>
                  <FormSelectModule
                    name="customerProvinceId"
                    value={localFilters.customerProvinceId || ""}
                    onChange={(e) =>
                      handleFilterChange("customerProvinceId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={customerProvinceOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Clearance Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Clearance Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {clearanceStatusOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange(
                              "clearanceStatus",
                              localFilters.clearanceStatus === option.value ? undefined : option.value
                            )
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.clearanceStatus === option.value
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Boolean Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Prepaid Only</label>
                  <div className="grid grid-cols-3 gap-2">
                    {booleanOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "prepaidOnly",
                            localFilters.prepaidOnly ===
                              (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                              ? undefined
                              : option.value === "true"
                              ? "true"
                              : option.value === "false"
                              ? "false"
                              : undefined
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.prepaidOnly ===
                          (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Is Cleared</label>
                  <div className="grid grid-cols-3 gap-2">
                    {booleanOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "isCleared",
                            localFilters.isCleared ===
                              (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                              ? undefined
                              : option.value === "true"
                              ? "true"
                              : option.value === "false"
                              ? "false"
                              : undefined
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.isCleared ===
                          (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Is Remitted</label>
                  <div className="grid grid-cols-3 gap-2">
                    {booleanOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "isRemitted",
                            localFilters.isRemitted ===
                              (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                              ? undefined
                              : option.value === "true"
                              ? "true"
                              : option.value === "false"
                              ? "false"
                              : undefined
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.isRemitted ===
                          (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer Is PPM</label>
                  <div className="grid grid-cols-3 gap-2">
                    {booleanOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "customerIsPPM",
                            localFilters.customerIsPPM ===
                              (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                              ? undefined
                              : option.value === "true"
                              ? "true"
                              : option.value === "false"
                              ? "false"
                              : undefined
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.customerIsPPM ===
                          (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer Is MD</label>
                  <div className="grid grid-cols-3 gap-2">
                    {booleanOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "customerIsMD",
                            localFilters.customerIsMD ===
                              (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                              ? undefined
                              : option.value === "true"
                              ? "true"
                              : option.value === "false"
                              ? "false"
                              : undefined
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.customerIsMD ===
                          (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer Is Urban</label>
                  <div className="grid grid-cols-3 gap-2">
                    {booleanOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "customerIsUrban",
                            localFilters.customerIsUrban ===
                              (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                              ? undefined
                              : option.value === "true"
                              ? "true"
                              : option.value === "false"
                              ? "false"
                              : undefined
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.customerIsUrban ===
                          (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
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

const AllPayments: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    payments,
    loading,
    error,
    pagination,
    exportPaymentsLoading,
    exportPaymentsError,
    exportPaymentsSuccess,
    exportPaymentsData,
  } = useAppSelector((state) => state.payments)
  const { customers } = useAppSelector((state) => state.customers)
  const { vendors } = useAppSelector((state) => state.vendors)
  const { agents } = useAppSelector((state) => state.agents)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { areaOffices, loading: areaOfficesLoading } = useAppSelector((state) => state.areaOffices)
  const { paymentChannels, paymentChannelsLoading } = useAppSelector((state) => state.payments)

  // Debug area offices
  console.log("Area offices data:", areaOffices, "Loading:", areaOfficesLoading)
  const { distributionSubstations } = useAppSelector((state) => state.distributionSubstations)
  const { feeders } = useAppSelector((state) => state.feeders)
  const { serviceStations } = useAppSelector((state) => state.serviceStations)
  const { bills: postpaidBills } = useAppSelector((state) => state.postpaidBilling)
  const { countries } = useAppSelector((state) => state.countries)

  const router = useRouter()

  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // Default 8 minutes (480,000 ms)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // Export CSV state
  const [isExporting, setIsExporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportDateRange, setExportDateRange] = useState<"all" | "today" | "week" | "month" | "custom">("all")
  const [exportFromDate, setExportFromDate] = useState("")
  const [exportToDate, setExportToDate] = useState("")
  const [exportPaymentCategory, setExportPaymentCategory] = useState<"all" | "prepaid" | "postpaid">("all")
  const [exportAreaOfficeId, setExportAreaOfficeId] = useState("")
  const [exportDistributionSubstationId, setExportDistributionSubstationId] = useState("")
  const [exportFeederId, setExportFeederId] = useState("")
  const [exportRegionId, setExportRegionId] = useState("")

  // User permissions state
  const [userPermissions, setUserPermissions] = useState<UserPermission | null>(null)

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    paymentTypeId: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    distributionSubstationId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    serviceCenterId: undefined as number | undefined,
    postpaidBillId: undefined as number | undefined,
    prepaidOnly: undefined as boolean | undefined,
    channel: undefined as PaymentChannel | undefined,
    status: undefined as "Pending" | "Confirmed" | "Failed" | "Reversed" | undefined,
    collectorType: undefined as CollectorType | undefined,
    clearanceStatus: undefined as "Uncleared" | "Cleared" | "ClearedWithCondition" | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    reference: undefined as string | undefined,
    accountNumber: undefined as string | undefined,
    meterNumber: undefined as string | undefined,
    agentIds: undefined as number[] | undefined,
    isCleared: undefined as boolean | undefined,
    isRemitted: undefined as boolean | undefined,
    customerIsPPM: undefined as boolean | undefined,
    customerIsMD: undefined as boolean | undefined,
    customerIsUrban: undefined as boolean | undefined,
    customerProvinceId: undefined as number | undefined,
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
    distributionSubstationId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    serviceCenterId: undefined as number | undefined,
    postpaidBillId: undefined as number | undefined,
    prepaidOnly: undefined as boolean | undefined,
    channel: undefined as PaymentChannel | undefined,
    status: undefined as "Pending" | "Confirmed" | "Failed" | "Reversed" | undefined,
    collectorType: undefined as CollectorType | undefined,
    clearanceStatus: undefined as "Uncleared" | "Cleared" | "ClearedWithCondition" | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    reference: undefined as string | undefined,
    accountNumber: undefined as string | undefined,
    meterNumber: undefined as string | undefined,
    agentIds: undefined as number[] | undefined,
    isCleared: undefined as boolean | undefined,
    isRemitted: undefined as boolean | undefined,
    customerIsPPM: undefined as boolean | undefined,
    customerIsMD: undefined as boolean | undefined,
    customerIsUrban: undefined as boolean | undefined,
    customerProvinceId: undefined as number | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  const pageSize = 10

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
    dispatch(fetchPaymentChannels())
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )
    dispatch(
      fetchDistributionSubstations({
        pageNumber: 1,
        pageSize: 100,
      })
    )
    dispatch(
      fetchFeeders({
        pageNumber: 1,
        pageSize: 100,
      })
    )
    dispatch(fetchCountries())
    dispatch(
      fetchServiceStations({
        pageNumber: 1,
        pageSize: 100,
      })
    )
    dispatch(
      fetchPostpaidBills({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    // Cleanup function to clear states when component unmounts
    return () => {
      dispatch(clearCustomers())
      dispatch(clearVendors())
      dispatch(clearAgents())
      dispatch(clearPaymentTypes())
      dispatch(clearAreaOffices())
      dispatch(clearPayments())
      dispatch(clearDistributionSubstations())
      dispatch(clearFeeders())
      dispatch(clearCountries())
      dispatch(clearServiceStations())
      dispatch(clearBills())
    }
  }, [dispatch])

  // Load user permissions from localStorage
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    const storedPermissions = localStorage.getItem("userPermissions")
    if (storedPermissions) {
      try {
        const parsed = JSON.parse(storedPermissions)
        if (isUserPermission(parsed)) {
          setUserPermissions(parsed)
        } else {
          setUserPermissions(null)
        }
      } catch {
        setUserPermissions(null)
      }
    }
  }, [])

  // Fetch payments when component mounts or filters change
  useEffect(() => {
    const fetchParams: PaymentsRequestParams = {
      pageNumber: currentPage,
      pageSize,
      ...(searchText && { search: searchText }),
      ...(appliedFilters.customerId && { customerId: appliedFilters.customerId }),
      ...(appliedFilters.vendorId && { vendorId: appliedFilters.vendorId }),
      ...(appliedFilters.agentId && { agentId: appliedFilters.agentId }),
      ...(appliedFilters.paymentTypeId && { paymentTypeId: appliedFilters.paymentTypeId }),
      ...(appliedFilters.areaOfficeId && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.distributionSubstationId && {
        distributionSubstationId: appliedFilters.distributionSubstationId,
      }),
      ...(appliedFilters.feederId && { feederId: appliedFilters.feederId }),
      ...(appliedFilters.serviceCenterId && { serviceCenterId: appliedFilters.serviceCenterId }),
      ...(appliedFilters.postpaidBillId && { postpaidBillId: appliedFilters.postpaidBillId }),
      ...(appliedFilters.prepaidOnly !== undefined && { prepaidOnly: appliedFilters.prepaidOnly }),
      ...(appliedFilters.channel && { channel: appliedFilters.channel }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.collectorType && { collectorType: appliedFilters.collectorType }),
      ...(appliedFilters.clearanceStatus && { clearanceStatus: appliedFilters.clearanceStatus }),
      ...(appliedFilters.paidFromUtc && { paidFromUtc: appliedFilters.paidFromUtc }),
      ...(appliedFilters.paidToUtc && { paidToUtc: appliedFilters.paidToUtc }),
      ...(appliedFilters.reference && { reference: appliedFilters.reference }),
      ...(appliedFilters.accountNumber && { accountNumber: appliedFilters.accountNumber }),
      ...(appliedFilters.meterNumber && { meterNumber: appliedFilters.meterNumber }),
      ...(appliedFilters.agentIds && appliedFilters.agentIds.length > 0 && { agentIds: appliedFilters.agentIds }),
      ...(appliedFilters.isCleared !== undefined && { isCleared: appliedFilters.isCleared }),
      ...(appliedFilters.isRemitted !== undefined && { isRemitted: appliedFilters.isRemitted }),
      ...(appliedFilters.customerIsPPM !== undefined && { customerIsPPM: appliedFilters.customerIsPPM }),
      ...(appliedFilters.customerIsMD !== undefined && { customerIsMD: appliedFilters.customerIsMD }),
      ...(appliedFilters.customerIsUrban !== undefined && { customerIsUrban: appliedFilters.customerIsUrban }),
      ...(appliedFilters.customerProvinceId && { customerProvinceId: appliedFilters.customerProvinceId }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    void dispatch(fetchPayments(fetchParams))
  }, [dispatch, currentPage, searchText, appliedFilters])

  const handleRefreshData = useCallback(() => {
    const fetchParams: PaymentsRequestParams = {
      pageNumber: currentPage,
      pageSize,
      ...(searchText && { search: searchText }),
      ...(appliedFilters.customerId && { customerId: appliedFilters.customerId }),
      ...(appliedFilters.vendorId && { vendorId: appliedFilters.vendorId }),
      ...(appliedFilters.agentId && { agentId: appliedFilters.agentId }),
      ...(appliedFilters.paymentTypeId && { paymentTypeId: appliedFilters.paymentTypeId }),
      ...(appliedFilters.areaOfficeId && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.distributionSubstationId && {
        distributionSubstationId: appliedFilters.distributionSubstationId,
      }),
      ...(appliedFilters.feederId && { feederId: appliedFilters.feederId }),
      ...(appliedFilters.serviceCenterId && { serviceCenterId: appliedFilters.serviceCenterId }),
      ...(appliedFilters.postpaidBillId && { postpaidBillId: appliedFilters.postpaidBillId }),
      ...(appliedFilters.prepaidOnly !== undefined && { prepaidOnly: appliedFilters.prepaidOnly }),
      ...(appliedFilters.channel && { channel: appliedFilters.channel }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.collectorType && { collectorType: appliedFilters.collectorType }),
      ...(appliedFilters.clearanceStatus && { clearanceStatus: appliedFilters.clearanceStatus }),
      ...(appliedFilters.paidFromUtc && { paidFromUtc: appliedFilters.paidFromUtc }),
      ...(appliedFilters.paidToUtc && { paidToUtc: appliedFilters.paidToUtc }),
      ...(appliedFilters.reference && { reference: appliedFilters.reference }),
      ...(appliedFilters.accountNumber && { accountNumber: appliedFilters.accountNumber }),
      ...(appliedFilters.meterNumber && { meterNumber: appliedFilters.meterNumber }),
      ...(appliedFilters.agentIds && appliedFilters.agentIds.length > 0 && { agentIds: appliedFilters.agentIds }),
      ...(appliedFilters.isCleared !== undefined && { isCleared: appliedFilters.isCleared }),
      ...(appliedFilters.isRemitted !== undefined && { isRemitted: appliedFilters.isRemitted }),
      ...(appliedFilters.customerIsPPM !== undefined && { customerIsPPM: appliedFilters.customerIsPPM }),
      ...(appliedFilters.customerIsMD !== undefined && { customerIsMD: appliedFilters.customerIsMD }),
      ...(appliedFilters.customerIsUrban !== undefined && { customerIsUrban: appliedFilters.customerIsUrban }),
      ...(appliedFilters.customerProvinceId && { customerProvinceId: appliedFilters.customerProvinceId }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    void dispatch(fetchPayments(fetchParams))
  }, [dispatch, currentPage, searchText, appliedFilters, pageSize])

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

  // Short polling effect
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      handleRefreshData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [dispatch, isPolling, pollingInterval, handleRefreshData])

  const getStatusStyle = (status: Payment["status"]) => {
    switch (status) {
      case "Confirmed":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "Pending":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "Failed":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "Reversed":
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getPaymentMethodStyle = (channel: PaymentChannel) => {
    switch (channel) {
      case PaymentChannel.BankTransfer:
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case PaymentChannel.Cash:
        return {
          backgroundColor: "#DBE8FE",
          color: "#2563EB",
        }
      case PaymentChannel.Pos:
        return {
          backgroundColor: "#FFFBEB",
          color: "#D97706",
        }
      case PaymentChannel.Card:
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case PaymentChannel.VendorWallet:
        return {
          backgroundColor: "#FEF2F2",
          color: "#DC2626",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getCollectorTypeStyle = (collectorType: CollectorType) => {
    switch (collectorType) {
      case CollectorType.Customer:
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case CollectorType.SalesRep:
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case CollectorType.Vendor:
        return {
          backgroundColor: "#FFFBEB",
          color: "#D97706",
        }
      case CollectorType.Staff:
        return {
          backgroundColor: "#DBE8FE",
          color: "#2563EB",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Handle individual filter changes (local state)
  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    let processedValue: string | number | boolean | undefined = value

    // Handle channel field - convert string to enum
    if (key === "channel" && typeof value === "string" && value) {
      processedValue = channelStringToEnum(value)
    }

    // Handle collectorType field - convert string to enum
    if (key === "collectorType" && typeof value === "string" && value) {
      processedValue = value as CollectorType
    }

    // Handle boolean fields
    if (["prepaidOnly", "isCleared", "isRemitted", "customerIsPPM", "customerIsMD", "customerIsUrban"].includes(key)) {
      if (typeof value === "string") {
        processedValue = value === "true" ? true : value === "false" ? false : undefined
      } else if (typeof value === "boolean") {
        processedValue = value
      }
    }

    // Handle clearanceStatus field
    if (key === "clearanceStatus" && typeof value === "string" && value) {
      processedValue = value as "Uncleared" | "Cleared" | "ClearedWithCondition"
    }

    setLocalFilters((prev) => ({
      ...prev,
      [key]: processedValue,
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
    setAppliedFilters({
      customerId: localFilters.customerId,
      vendorId: localFilters.vendorId,
      agentId: localFilters.agentId,
      paymentTypeId: localFilters.paymentTypeId,
      areaOfficeId: localFilters.areaOfficeId,
      distributionSubstationId: localFilters.distributionSubstationId,
      feederId: localFilters.feederId,
      serviceCenterId: localFilters.serviceCenterId,
      postpaidBillId: localFilters.postpaidBillId,
      prepaidOnly: localFilters.prepaidOnly,
      channel: localFilters.channel,
      status: localFilters.status,
      collectorType: localFilters.collectorType,
      clearanceStatus: localFilters.clearanceStatus,
      paidFromUtc: localFilters.paidFromUtc,
      paidToUtc: localFilters.paidToUtc,
      reference: localFilters.reference,
      accountNumber: localFilters.accountNumber,
      meterNumber: localFilters.meterNumber,
      agentIds: localFilters.agentIds,
      isCleared: localFilters.isCleared,
      isRemitted: localFilters.isRemitted,
      customerIsPPM: localFilters.customerIsPPM,
      customerIsMD: localFilters.customerIsMD,
      customerIsUrban: localFilters.customerIsUrban,
      customerProvinceId: localFilters.customerProvinceId,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortOrder || undefined,
    })
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      paymentTypeId: undefined,
      areaOfficeId: undefined,
      distributionSubstationId: undefined,
      feederId: undefined,
      serviceCenterId: undefined,
      postpaidBillId: undefined,
      prepaidOnly: undefined,
      channel: undefined,
      status: undefined,
      collectorType: undefined,
      clearanceStatus: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      reference: undefined,
      accountNumber: undefined,
      meterNumber: undefined,
      agentIds: undefined,
      isCleared: undefined,
      isRemitted: undefined,
      customerIsPPM: undefined,
      customerIsMD: undefined,
      customerIsUrban: undefined,
      customerProvinceId: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      paymentTypeId: undefined,
      areaOfficeId: undefined,
      distributionSubstationId: undefined,
      feederId: undefined,
      serviceCenterId: undefined,
      postpaidBillId: undefined,
      prepaidOnly: undefined,
      channel: undefined,
      status: undefined,
      collectorType: undefined,
      clearanceStatus: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      reference: undefined,
      accountNumber: undefined,
      meterNumber: undefined,
      agentIds: undefined,
      isCleared: undefined,
      isRemitted: undefined,
      customerIsPPM: undefined,
      customerIsMD: undefined,
      customerIsUrban: undefined,
      customerProvinceId: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.customerId) count++
    if (appliedFilters.vendorId) count++
    if (appliedFilters.agentId) count++
    if (appliedFilters.paymentTypeId) count++
    if (appliedFilters.areaOfficeId) count++
    if (appliedFilters.distributionSubstationId) count++
    if (appliedFilters.feederId) count++
    if (appliedFilters.serviceCenterId) count++
    if (appliedFilters.postpaidBillId) count++
    if (appliedFilters.prepaidOnly !== undefined) count++
    if (appliedFilters.channel) count++
    if (appliedFilters.status) count++
    if (appliedFilters.collectorType) count++
    if (appliedFilters.clearanceStatus) count++
    if (appliedFilters.paidFromUtc) count++
    if (appliedFilters.paidToUtc) count++
    if (appliedFilters.reference) count++
    if (appliedFilters.accountNumber) count++
    if (appliedFilters.meterNumber) count++
    if (appliedFilters.agentIds && appliedFilters.agentIds.length > 0) count++
    if (appliedFilters.isCleared !== undefined) count++
    if (appliedFilters.isRemitted !== undefined) count++
    if (appliedFilters.customerIsPPM !== undefined) count++
    if (appliedFilters.customerIsMD !== undefined) count++
    if (appliedFilters.customerIsUrban !== undefined) count++
    if (appliedFilters.customerProvinceId) count++
    if (appliedFilters.sortBy) count++
    return count
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

  const paymentTypeOptions = [
    { value: "", label: "All Payment Types" },
    ...paymentTypes.map((type) => ({
      value: type.id,
      label: type.name,
    })),
  ]

  const areaOfficeOptions = [
    { value: "", label: "All Area Offices" },
    ...areaOffices.map((office) => ({
      value: office.id,
      label: `${office.nameOfNewOAreaffice} (${office.newKaedcoCode})`,
    })),
  ]

  // New filter options for dropdowns
  const distributionSubstationOptions = [
    { value: "", label: "All Distribution Substations" },
    ...distributionSubstations.map((dts) => ({
      value: dts.id,
      label: `${dts.dssCode} (${dts.nercCode})`,
    })),
  ]

  const feederOptions = [
    { value: "", label: "All Feeders" },
    ...feeders.map((feeder) => ({
      value: feeder.id,
      label: `${feeder.name} (${feeder.kaedcoFeederCode})`,
    })),
  ]

  const serviceCenterOptions = [
    { value: "", label: "All Service Centers" },
    ...serviceStations.map((station) => ({
      value: station.id,
      label: `${station.name} (${station.code})`,
    })),
  ]

  const postpaidBillOptions = [
    { value: "", label: "All Postpaid Bills" },
    ...postpaidBills.map((bill) => ({
      value: bill.id,
      label: `Bill ${bill.billingId} - ${bill.customerName} (${bill.period})`,
    })),
  ]

  const customerProvinceOptions = [
    { value: "", label: "All Provinces" },
    // Extract unique provinces from customers
    ...Array.from(new Set(customers.map((customer) => customer.provinceName).filter((province) => province))).map(
      (provinceName, index) => ({
        value: index + 1, // Since we don't have province IDs, use index + 1
        label: provinceName,
      })
    ),
  ]

  // Create region options from countries data
  const regionOptions = [
    { value: "", label: "All Regions" },
    ...countries.flatMap((country) =>
      country.provinces.map((province) => ({
        value: province.id.toString(),
        label: province.name,
      }))
    ),
  ]

  // Generate channel options from payment channels endpoint
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

  const collectorTypeOptions = [
    { value: "", label: "All Collector Types" },
    { value: "Customer", label: "Customer" },
    { value: "SalesRep", label: "Agent" },
    { value: "Vendor", label: "Vendor" },
    { value: "Staff", label: "Staff" },
    { value: "Migration", label: "Migration" },
  ]

  const clearanceStatusOptions = [
    { value: "", label: "All Clearance Statuses" },
    { value: "Uncleared", label: "Uncleared" },
    { value: "Cleared", label: "Cleared" },
    { value: "ClearedWithCondition", label: "Cleared With Condition" },
  ]

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Amount Low-High", value: "amount", order: "asc" },
    { label: "Amount High-Low", value: "amount", order: "desc" },
    { label: "Date Asc", value: "paidAtUtc", order: "asc" },
    { label: "Date Desc", value: "paidAtUtc", order: "desc" },
    { label: "Customer Name A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name Z-A", value: "customerName", order: "desc" },
    { label: "Reference Asc", value: "reference", order: "asc" },
    { label: "Reference Desc", value: "reference", order: "desc" },
  ]

  const handleSearch = () => {
    setSearchText(searchInput.trim())
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleCancelSearch = () => {
    setSearchInput("")
    setSearchText("")
    setCurrentPage(1)
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleViewDetails = (payment: Payment) => {
    router.push(`/payment/payment-detail/${payment.id}`)
  }

  const toggleSort = (field: string) => {
    const currentOrder = localFilters.sortOrder
    const currentField = localFilters.sortBy

    if (currentField === field) {
      // Toggle between asc and desc
      handleSortChange({
        label: "",
        value: field,
        order: currentOrder === "asc" ? "desc" : "asc",
      })
    } else {
      // Start with desc for new field
      handleSortChange({
        label: "",
        value: field,
        order: "desc",
      })
    }
  }

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

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

    try {
      const dateRange = getExportDateRange()

      // Build export request using the new API parameters
      const exportRequest: ExportPaymentsRequest = {
        fromUtc: dateRange.from || new Date(0).toISOString(),
        toUtc: dateRange.to || new Date().toISOString(),
        ...(exportAreaOfficeId && { areaOfficeId: parseInt(exportAreaOfficeId) }),
        ...(exportPaymentCategory !== "all" && { prepaidOrPostpaid: exportPaymentCategory }),
        ...(exportDistributionSubstationId && { dssId: parseInt(exportDistributionSubstationId) }),
        ...(exportFeederId && { feederId: parseInt(exportFeederId) }),
        ...(exportRegionId && { regionId: parseInt(exportRegionId) }),
      }

      console.log("Exporting payments with request:", exportRequest)

      // Dispatch the export action
      const result = await dispatch(exportPayments(exportRequest))

      if (exportPayments.fulfilled.match(result)) {
        // Create download link from blob
        const { data: blob, fileName } = result.payload
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error((result.payload as string) || "Export failed")
      }
    } catch (error) {
      console.error("Failed to export payments:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Handle export state changes
  useEffect(() => {
    if (exportPaymentsSuccess && exportPaymentsData) {
      setIsExporting(false)
      setShowExportModal(false)
      const { fileName } = exportPaymentsData
      dispatch(clearExportPayments())
    }
  }, [exportPaymentsSuccess, exportPaymentsData, dispatch])

  // Handle export errors
  useEffect(() => {
    if (exportPaymentsError) {
      setIsExporting(false)
      setShowExportModal(false)
      dispatch(clearExportPayments())
    }
  }, [exportPaymentsError, dispatch])

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="p-4 text-red-600">Error loading payments: {error}</div>

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-3 py-4  max-sm:px-3 md:px-4 lg:px-6 2xl:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Payment Management</h4>
                <p className="text-gray-600">Track and manage customer payments and transactions</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  icon={<PlusIcon />}
                  onClick={() => router.push("/payment/record-payment")}
                >
                  Record Payment
                </ButtonModule>
                {/* Polling Controls */}
                <div className="flex items-center gap-2 rounded-md border-r bg-white p-2 pr-3">
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
                      {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                    </DropdownPopover>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
              {/* Main Content */}
              <motion.div
                className={
                  showDesktopFilters
                    ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
                    : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Header */}
                <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {/* Filter Button for ALL screens up to 2xl */}
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white  px-3 py-2 text-sm hover:bg-gray-50 2xl:hidden"
                    >
                      <Filter className="size-4" />
                      Filters
                      {getActiveFilterCount() > 0 && (
                        <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </button>
                    <h3 className="text-lg font-semibold sm:text-xl">Payment Directory</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="">
                      <div className="max-w-md">
                        <SearchModule
                          placeholder="Search customers or references..."
                          value={searchInput}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          onCancel={handleCancelSearch}
                          onSearch={handleSearch}
                        />
                      </div>
                    </div>
                    {/* Hide/Show Filters button - Desktop only (2xl and above) */}
                    <button
                      type="button"
                      onClick={() => setShowDesktopFilters((prev) => !prev)}
                      className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300  bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
                    >
                      {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                      {showDesktopFilters ? "Hide filters" : "Show filters"}
                    </button>
                    {/* Export CSV Button */}
                    <button
                      onClick={() => setShowExportModal(true)}
                      disabled={isExporting || exportPaymentsLoading}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        isExporting || exportPaymentsLoading
                          ? "cursor-not-allowed bg-gray-400 text-white"
                          : "border-[#004B23] bg-[#004B23] text-white hover:bg-[#003a1b]"
                      }`}
                    >
                      <Download className={`size-4 ${isExporting || exportPaymentsLoading ? "animate-pulse" : ""}`} />
                      {isExporting || exportPaymentsLoading ? "Exporting..." : "Export"}
                    </button>
                  </div>
                </div>

                {/* Search */}

                {payments.length === 0 ? (
                  <motion.div
                    className="flex h-60 flex-col items-center justify-center gap-2 rounded-lg bg-[#F6F6F9]"
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
                      {searchText ? "No matching payments found" : "No payments available"}
                    </motion.p>
                  </motion.div>
                ) : (
                  <>
                    {/* Table Container with Max Width and Scroll */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
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
                                  onClick={() => toggleSort("amount")}
                                  className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                                >
                                  Amount
                                  <RxCaretSort className="size-3.5" />
                                </button>
                              </th>
                              <th className="p-2 text-left">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                  Payment Type
                                </span>
                              </th>
                              <th className="p-2 text-left">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                  Purchase Type
                                </span>
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
                                  onClick={() => toggleSort("channel")}
                                  className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                                >
                                  Channel
                                  <RxCaretSort className="size-3.5" />
                                </button>
                              </th>
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
                                  onClick={() => toggleSort("paidAtUtc")}
                                  className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                                >
                                  Date
                                  <RxCaretSort className="size-3.5" />
                                </button>
                              </th>
                              <th className="p-2 text-left">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                  Collector
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
                                    <div>
                                      <div className="font-medium text-gray-900">{payment.customerName || "-"}</div>
                                      {payment.customerAccountNumber && (
                                        <div className="text-[10px] text-gray-500">{payment.customerAccountNumber}</div>
                                      )}
                                      {payment.postpaidBillPeriod && (
                                        <div className="text-[10px] text-blue-600">{payment.postpaidBillPeriod}</div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap p-2 text-xs font-semibold text-gray-900">
                                    {formatCurrency(payment.amount || 0, payment.currency)}
                                  </td>
                                  <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                                    {payment.paymentTypeName || "-"}
                                  </td>
                                  <td className="whitespace-nowrap p-2">
                                    <motion.div
                                      className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.1 }}
                                      style={{
                                        backgroundColor:
                                          payment.isPrepaid === true
                                            ? "#dbeafe"
                                            : payment.isPrepaid === false
                                            ? "#f3e8ff"
                                            : "#f3f4f6",
                                        color:
                                          payment.isPrepaid === true
                                            ? "#1e40af"
                                            : payment.isPrepaid === false
                                            ? "#6b21a8"
                                            : "#374151",
                                      }}
                                    >
                                      {payment.isPrepaid === true
                                        ? "Prepaid"
                                        : payment.isPrepaid === false
                                        ? "Postpaid"
                                        : "-"}
                                    </motion.div>
                                  </td>
                                  <td className="whitespace-nowrap p-2">
                                    <StatusBadge
                                      status={payment.status as "Pending" | "Confirmed" | "Failed" | "Reversed"}
                                    />
                                  </td>
                                  <td className="whitespace-nowrap p-2">
                                    <ChannelBadge channel={payment.channel} />
                                  </td>
                                  <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                                    {payment.reference || "-"}
                                  </td>
                                  <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                                    {formatDateTime(payment.paidAtUtc)}
                                  </td>
                                  <td className="whitespace-nowrap p-2">
                                    {payment.collector ? (
                                      <CollectorTypeBadge type={payment.collector.type} />
                                    ) : (
                                      <span className="text-xs text-gray-500">-</span>
                                    )}
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
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-600">Show rows</p>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            const newSize = Number(e.target.value)
                            // Note: You might need to add a handler for page size changes
                            setCurrentPage(1)
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <p className="text-xs text-gray-600">
                          {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, pagination.totalCount)}{" "}
                          of {pagination.totalCount}
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

                        {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, index) => {
                          let pageNum: number
                          if (pagination.totalPages <= 5) {
                            pageNum = index + 1
                          } else if (currentPage <= 3) {
                            pageNum = index + 1
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + index
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

                        {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                          <span className="text-xs text-gray-500">...</span>
                        )}

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === pagination.totalPages}
                          className="flex size-6 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <MdOutlineArrowForwardIos className="size-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
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

                    {/* Payment Type Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {paymentTypeOptions
                          .filter((opt) => opt.value !== "")
                          .map((option) => {
                            const paymentTypeValue =
                              typeof option.value === "number" ? option.value : Number(option.value)
                            return (
                              <button
                                key={option.value}
                                onClick={() =>
                                  handleFilterChange(
                                    "paymentTypeId",
                                    localFilters.paymentTypeId === paymentTypeValue ? undefined : paymentTypeValue
                                  )
                                }
                                className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                                  localFilters.paymentTypeId === paymentTypeValue
                                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {option.label}
                              </button>
                            )
                          })}
                      </div>
                    </div>

                    {/* Area Office Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                      <FormSelectModule
                        name="areaOfficeId"
                        value={localFilters.areaOfficeId || ""}
                        onChange={(e) => handleFilterChange("areaOfficeId", e.target.value || undefined)}
                        options={areaOfficeOptions}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    </div>

                    {/* Channel Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Channel</label>
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

                    {/* Collector Type Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Collector Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {collectorTypeOptions
                          .filter((opt) => opt.value !== "")
                          .map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                handleFilterChange(
                                  "collectorType",
                                  localFilters.collectorType === option.value ? undefined : option.value
                                )
                              }
                              className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                                localFilters.collectorType === option.value
                                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Date Range Filters */}
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
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Reference</label>
                      <input
                        type="text"
                        value={localFilters.reference || ""}
                        onChange={(e) => handleFilterChange("reference", e.target.value || undefined)}
                        placeholder="Enter reference..."
                        className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={localFilters.accountNumber || ""}
                        onChange={(e) => handleFilterChange("accountNumber", e.target.value || undefined)}
                        placeholder="Enter account number..."
                        className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Meter Number</label>
                      <input
                        type="text"
                        value={localFilters.meterNumber || ""}
                        onChange={(e) => handleFilterChange("meterNumber", e.target.value || undefined)}
                        placeholder="Enter meter number..."
                        className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                      />
                    </div>

                    {/* ID Filters */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Distribution Substation
                      </label>
                      <FormSelectModule
                        name="distributionSubstationId"
                        value={localFilters.distributionSubstationId || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "distributionSubstationId",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        options={distributionSubstationOptions}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Feeder</label>
                      <FormSelectModule
                        name="feederId"
                        value={localFilters.feederId || ""}
                        onChange={(e) =>
                          handleFilterChange("feederId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={feederOptions}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Service Center
                      </label>
                      <FormSelectModule
                        name="serviceCenterId"
                        value={localFilters.serviceCenterId || ""}
                        onChange={(e) =>
                          handleFilterChange("serviceCenterId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={serviceCenterOptions}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Postpaid Bill</label>
                      <FormSelectModule
                        name="postpaidBillId"
                        value={localFilters.postpaidBillId || ""}
                        onChange={(e) =>
                          handleFilterChange("postpaidBillId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={postpaidBillOptions}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Customer Province
                      </label>
                      <FormSelectModule
                        name="customerProvinceId"
                        value={localFilters.customerProvinceId || ""}
                        onChange={(e) =>
                          handleFilterChange("customerProvinceId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={customerProvinceOptions}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    </div>

                    {/* Clearance Status Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Clearance Status
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {clearanceStatusOptions
                          .filter((opt) => opt.value !== "")
                          .map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                handleFilterChange(
                                  "clearanceStatus",
                                  localFilters.clearanceStatus === option.value ? undefined : option.value
                                )
                              }
                              className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                                localFilters.clearanceStatus === option.value
                                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Boolean Filters */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Prepaid Only</label>
                      <div className="grid grid-cols-3 gap-2">
                        {booleanOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleFilterChange(
                                "prepaidOnly",
                                localFilters.prepaidOnly ===
                                  (option.value === "true" ? true : option.value === "false" ? false : undefined)
                                  ? undefined
                                  : option.value === "true"
                                  ? true
                                  : option.value === "false"
                                  ? false
                                  : undefined
                              )
                            }
                            className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                              localFilters.prepaidOnly ===
                              (option.value === "true" ? true : option.value === "false" ? false : undefined)
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Is Cleared</label>
                      <div className="grid grid-cols-3 gap-2">
                        {booleanOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleFilterChange(
                                "isCleared",
                                localFilters.isCleared ===
                                  (option.value === "true" ? true : option.value === "false" ? false : undefined)
                                  ? undefined
                                  : option.value === "true"
                                  ? true
                                  : option.value === "false"
                                  ? false
                                  : undefined
                              )
                            }
                            className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                              localFilters.isCleared ===
                              (option.value === "true" ? true : option.value === "false" ? false : undefined)
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Is Remitted</label>
                      <div className="grid grid-cols-3 gap-2">
                        {booleanOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleFilterChange(
                                "isRemitted",
                                localFilters.isRemitted ===
                                  (option.value === "true" ? true : option.value === "false" ? false : undefined)
                                  ? undefined
                                  : option.value === "true"
                                  ? true
                                  : option.value === "false"
                                  ? false
                                  : undefined
                              )
                            }
                            className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                              localFilters.isRemitted ===
                              (option.value === "true" ? true : option.value === "false" ? false : undefined)
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Customer Is PPM
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {booleanOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleFilterChange(
                                "customerIsPPM",
                                localFilters.customerIsPPM ===
                                  (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                                  ? undefined
                                  : option.value === "true"
                                  ? "true"
                                  : option.value === "false"
                                  ? "false"
                                  : undefined
                              )
                            }
                            className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                              localFilters.customerIsPPM ===
                              (option.value === "true" ? "true" : option.value === "false" ? "false" : undefined)
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Customer Is MD
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {booleanOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleFilterChange(
                                "customerIsMD",
                                localFilters.customerIsMD ===
                                  (option.value === "true" ? true : option.value === "false" ? false : undefined)
                                  ? undefined
                                  : option.value === "true"
                                  ? true
                                  : option.value === "false"
                                  ? false
                                  : undefined
                              )
                            }
                            className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                              localFilters.customerIsMD ===
                              (option.value === "true" ? true : option.value === "false" ? false : undefined)
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                        Customer Is Urban
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {booleanOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleFilterChange(
                                "customerIsUrban",
                                localFilters.customerIsUrban ===
                                  (option.value === "true" ? true : option.value === "false" ? false : undefined)
                                  ? undefined
                                  : option.value === "true"
                                  ? true
                                  : option.value === "false"
                                  ? false
                                  : undefined
                              )
                            }
                            className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                              localFilters.customerIsUrban ===
                              (option.value === "true" ? true : option.value === "false" ? false : undefined)
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
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
                        <span className="font-medium">{pagination.totalCount?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Page:</span>
                        <span className="font-medium">
                          {currentPage} / {pagination.totalPages || 1}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Filters:</span>
                        <span className="font-medium">{getActiveFilterCount()}</span>
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
        distributionSubstationOptions={distributionSubstationOptions}
        feederOptions={feederOptions}
        serviceCenterOptions={serviceCenterOptions}
        postpaidBillOptions={postpaidBillOptions}
        customerProvinceOptions={customerProvinceOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
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
              className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Export Payments to CSV</h3>
                  <button onClick={() => setShowExportModal(false)} className="rounded-full p-1 hover:bg-gray-100">
                    <X className="size-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
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

                  {/* Payment Category */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Payment Category</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "all", label: "All" },
                        { value: "prepaid", label: "Prepaid" },
                        { value: "postpaid", label: "Postpaid" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setExportPaymentCategory(option.value as typeof exportPaymentCategory)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            exportPaymentCategory === option.value
                              ? "border-[#004B23] bg-[#004B23]/10 text-[#004B23]"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Area Office */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Area Office</label>
                    {areaOfficesLoading ? (
                      <div className="h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        Loading area offices...
                      </div>
                    ) : (
                      <FormSelectModule
                        name="exportAreaOfficeId"
                        value={exportAreaOfficeId}
                        onChange={(e) => setExportAreaOfficeId(e.target.value)}
                        options={[
                          { value: "", label: "All Area Offices" },
                          ...areaOffices.map((office) => ({
                            value: office.id.toString(),
                            label: office.nameOfNewOAreaffice || `Office ${office.id}`,
                          })),
                        ]}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    )}
                  </div>

                  {/* Distribution Substation */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Distribution Substation</label>
                    {distributionSubstations.length === 0 ? (
                      <div className="h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        Loading distribution substations...
                      </div>
                    ) : (
                      <FormSelectModule
                        name="exportDistributionSubstationId"
                        value={exportDistributionSubstationId}
                        onChange={(e) => setExportDistributionSubstationId(e.target.value)}
                        options={[
                          { value: "", label: "All Distribution Substations" },
                          ...distributionSubstations.map((dss) => ({
                            value: dss.id.toString(),
                            label: dss.name || `DSS ${dss.id}`,
                          })),
                        ]}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    )}
                  </div>

                  {/* Feeder */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Feeder</label>
                    {feeders.length === 0 ? (
                      <div className="h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        Loading feeders...
                      </div>
                    ) : (
                      <FormSelectModule
                        name="exportFeederId"
                        value={exportFeederId}
                        onChange={(e) => setExportFeederId(e.target.value)}
                        options={[
                          { value: "", label: "All Feeders" },
                          ...feeders.map((feeder) => ({
                            value: feeder.id.toString(),
                            label: feeder.name || `Feeder ${feeder.id}`,
                          })),
                        ]}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    )}
                  </div>

                  {/* Region */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Region</label>
                    {countries.length === 0 ? (
                      <div className="h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        Loading regions...
                      </div>
                    ) : (
                      <FormSelectModule
                        name="exportRegionId"
                        value={exportRegionId}
                        onChange={(e) => setExportRegionId(e.target.value)}
                        options={regionOptions}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    )}
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
                    disabled={
                      (exportDateRange === "custom" && !exportFromDate && !exportToDate) ||
                      isExporting ||
                      exportPaymentsLoading
                    }
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                      (exportDateRange === "custom" && !exportFromDate && !exportToDate) ||
                      isExporting ||
                      exportPaymentsLoading
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-[#004B23] hover:bg-[#003a1b]"
                    }`}
                  >
                    <Download
                      className={`mr-2 inline-block size-4 ${
                        isExporting || exportPaymentsLoading ? "animate-pulse" : ""
                      }`}
                    />
                    {isExporting || exportPaymentsLoading ? "Exporting..." : "Export"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default AllPayments
