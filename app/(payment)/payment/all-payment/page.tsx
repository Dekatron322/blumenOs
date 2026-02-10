"use client"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
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
import { RxDotsVertical } from "react-icons/rx"

import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { MapIcon, PlusIcon, UserIcon } from "components/Icons/Icons"
import { SearchModule } from "components/ui/Search/search-module"

import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearAgents, fetchAgents } from "lib/redux/agentSlice"
import { hasPermission, isUserPermission, UserPermission } from "components/Sidebar/Links"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearCustomers, fetchCustomers } from "lib/redux/customerSlice"
import { clearPaymentTypes, fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import {
  cancelPayment,
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
import { VscEye, VscTrash } from "react-icons/vsc"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import { api } from "lib/redux/authSlice"
import { notify } from "components/ui/Notification/Notification"

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

interface ActionDropdownProps {
  payment: Payment
  onViewDetails: (payment: Payment) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ payment, onViewDetails }) => {
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
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
                  console.log("Process refund:", payment.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Process Refund
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Export receipt:", payment.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Export Receipt
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
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-4 py-8 2xl:container max-sm:px-2 xl:px-16">
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
    success,
    pagination,
    cancelPaymentLoading,
    cancelPaymentError,
    cancelPaymentSuccess,
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

  // Additional state for modal tabs
  const [exportModalTab, setExportModalTab] = useState<"basic" | "advanced">("basic")
  const [exportChannel, setExportChannel] = useState<string>("all")
  const [exportStatus, setExportStatus] = useState<string>("all")
  const [exportCollectorType, setExportCollectorType] = useState<string>("all")
  const [exportClearanceStatus, setExportClearanceStatus] = useState<string>("all")

  // User permissions state
  const [userPermissions, setUserPermissions] = useState<UserPermission | null>(null)
  const [exportCustomerId, setExportCustomerId] = useState<string>("")
  const [exportVendorId, setExportVendorId] = useState<string>("")
  const [exportAgentId, setExportAgentId] = useState<string>("")
  const [exportPaymentTypeId, setExportPaymentTypeId] = useState<string>("")
  const [exportAreaOfficeId, setExportAreaOfficeId] = useState<string>("")
  const [exportDistributionSubstationId, setExportDistributionSubstationId] = useState<string>("")
  const [exportFeederId, setExportFeederId] = useState<string>("")
  const [exportServiceCenterId, setExportServiceCenterId] = useState<string>("")
  const [exportPostpaidBillId, setExportPostpaidBillId] = useState<string>("")
  const [exportCustomerProvinceId, setExportCustomerProvinceId] = useState<string>("")

  // Cancel payment state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [paymentToCancel, setPaymentToCancel] = useState<Payment | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [exportReference, setExportReference] = useState<string>("")
  const [exportAccountNumber, setExportAccountNumber] = useState<string>("")
  const [exportMeterNumber, setExportMeterNumber] = useState<string>("")
  const [exportSearch, setExportSearch] = useState<string>("")
  const [exportIsCleared, setExportIsCleared] = useState<string>("all")
  const [exportIsRemitted, setExportIsRemitted] = useState<string>("all")
  const [exportCustomerIsPPM, setExportCustomerIsPPM] = useState<string>("all")
  const [exportCustomerIsMD, setExportCustomerIsMD] = useState<string>("all")
  const [exportCustomerIsUrban, setExportCustomerIsUrban] = useState<string>("all")

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

  // Cancel payment handlers
  const handleCancelPayment = (payment: Payment) => {
    setPaymentToCancel(payment)
    setIsCancelModalOpen(true)
  }

  const confirmCancelPayment = async () => {
    console.log("confirmCancelPayment called", { paymentToCancel, cancelReason })

    if (!paymentToCancel || !cancelReason.trim()) {
      notify("warning", "Please provide a reason for cancellation")
      return
    }

    try {
      console.log("Dispatching cancelPayment with:", {
        id: paymentToCancel.id,
        cancelData: { reason: cancelReason },
      })

      const result = await dispatch(
        cancelPayment({
          id: paymentToCancel.id,
          cancelData: { reason: cancelReason },
        })
      ).unwrap()

      console.log("Cancel payment successful:", result)

      setIsCancelModalOpen(false)
      setPaymentToCancel(null)
      setCancelReason("")

      // Show success notification
      notify("success", "Payment cancelled successfully!")
    } catch (error) {
      console.error("Failed to cancel payment:", error)
      notify("error", `Failed to cancel payment: ${error}`)
    }
  }

  const canCancelPayment = (payment: Payment) => {
    // Check payment status first
    const validStatus = payment.status === "Pending" || payment.status === "Confirmed"
    if (!validStatus) return false

    // Check if user has execute payment privilege
    if (!userPermissions) return false

    // Use the same hasPermission function as the sidebar
    const paymentLinkItem = {
      name: "Cancel Payment",
      privilegeKey: "payments",
      requiredActions: ["E"],
      icon: ({ isActive }: { isActive: boolean }) => <div />, // Dummy icon since this is only for permission checking
    }

    return hasPermission(paymentLinkItem, userPermissions)
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

  const handleAddPaymentSuccess = async () => {
    setIsAddPaymentModalOpen(false)
    // Refresh data after adding payment
    const fetchParams: PaymentsRequestParams = {
      pageNumber: currentPage,
      pageSize,
      ...(searchText && { search: searchText }),
      ...appliedFilters,
    }
    void dispatch(fetchPayments(fetchParams))
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

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
        // notify({
        //   type: "success",
        //   message: `Payments exported successfully as ${fileName}`,
        // })
      } else {
        throw new Error((result.payload as string) || "Export failed")
      }
    } catch (error) {
      console.error("Failed to export payments:", error)
      // notify({
      //   type: "error",
      //   message: `Failed to export payments: ${error instanceof Error ? error.message : "Unknown error"}`,
      // })
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
      // notify({
      //   type: "success",
      //   message: `Payments exported successfully as ${fileName}`,
      // })
      dispatch(clearExportPayments())
    }
  }, [exportPaymentsSuccess, exportPaymentsData, dispatch])

  // Handle export errors
  useEffect(() => {
    if (exportPaymentsError) {
      setIsExporting(false)
      setShowExportModal(false)
      // notify({
      //   type: "error",
      //   message: exportPaymentsError,
      // })
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
          <div className="mx-auto w-full px-3 py-4 2xl:container max-sm:px-3 md:px-4 lg:px-6 2xl:px-16">
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
                      className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium transition-colors ${
                        isExporting || exportPaymentsLoading
                          ? "cursor-not-allowed text-gray-400"
                          : "text-gray-700 hover:bg-gray-50"
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
                    <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                      <div className="max-w-full overflow-x-auto">
                        <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <MdOutlineCheckBoxOutlineBlank className="text-lg text-gray-400" />
                                  Customer
                                </div>
                              </th>
                              <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">Amount</div>
                              </th>
                              <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">Payment Type</div>
                              </th>
                              <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">Purchase Type</div>
                              </th>
                              <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">Status</div>
                              </th>
                              <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">Payment Method</div>
                              </th>
                              <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">Reference</div>
                              </th>
                              <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">Timestamp</div>
                              </th>
                              <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">Collector Type</div>
                              </th>
                              {/* <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">Location</div>
                              </th> */}
                              <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">Actions</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {payments.map((payment) => (
                              <motion.tr
                                key={payment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="hover:bg-gray-50"
                              >
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                    <UserIcon />
                                    <div>
                                      <div className="font-medium text-gray-900">{payment.customerName}</div>
                                      <div className="text-xs text-gray-500">{payment.customerAccountNumber}</div>
                                      {payment.postpaidBillPeriod && (
                                        <div className="text-xs text-blue-600">{payment.postpaidBillPeriod}</div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                                  {formatCurrency(payment.amount || 0, payment.currency)}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-900">
                                  <div className="font-medium">{payment.paymentTypeName || "-"}</div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
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
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  <motion.div
                                    style={getStatusStyle(payment.status)}
                                    className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.1 }}
                                  >
                                    <span
                                      className="size-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          payment.status === "Confirmed"
                                            ? "#589E67"
                                            : payment.status === "Pending"
                                            ? "#D97706"
                                            : payment.status === "Failed"
                                            ? "#AF4B4B"
                                            : "#6B7280",
                                      }}
                                    ></span>
                                    {payment.status}
                                  </motion.div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  <motion.div
                                    style={getPaymentMethodStyle(payment.channel)}
                                    className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.1 }}
                                  >
                                    {payment.channel}
                                  </motion.div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                  {payment.reference}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                  {formatDate(payment.paidAtUtc)}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  {payment.collector && (
                                    <motion.div
                                      style={getCollectorTypeStyle(payment.collector.type)}
                                      className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.1 }}
                                    >
                                      {payment.collector.type} - {payment.collector.name}
                                    </motion.div>
                                  )}
                                </td>
                                {/* <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <MapIcon />
                                    {payment.areaOfficeName}
                                  </div>
                                </td> */}
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  <div className="flex gap-1 ">
                                    <ButtonModule
                                      size="sm"
                                      variant="outline"
                                      icon={<VscEye />}
                                      onClick={() => router.push(`/payment/payment-detail/${payment.id}`)}
                                    >
                                      View
                                    </ButtonModule>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination */}
                    <motion.div
                      className="flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="text-sm text-gray-700">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, pagination.totalCount)} of {pagination.totalCount} entries
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`flex items-center justify-center rounded-md p-2 ${
                            currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                          }`}
                          whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
                          whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                        >
                          <MdOutlineArrowBackIosNew size={16} />
                        </motion.button>

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

                        {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                          <span className="px-1 text-gray-500">...</span>
                        )}

                        {pagination.totalPages > 5 && currentPage < pagination.totalPages - 1 && (
                          <motion.button
                            onClick={() => paginate(pagination.totalPages)}
                            className={`flex size-8 items-center justify-center rounded-md text-sm ${
                              currentPage === pagination.totalPages
                                ? "bg-[#004B23] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {pagination.totalPages}
                          </motion.button>
                        )}

                        <motion.button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === pagination.totalPages}
                          className={`flex items-center justify-center rounded-md p-2 ${
                            currentPage === pagination.totalPages
                              ? "cursor-not-allowed text-gray-400"
                              : "text-[#003F9F] hover:bg-gray-100"
                          }`}
                          whileHover={{ scale: currentPage === pagination.totalPages ? 1 : 1.1 }}
                          whileTap={{ scale: currentPage === pagination.totalPages ? 1 : 0.95 }}
                        >
                          <MdOutlineArrowForwardIos size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
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

      <AddAgentModal
        isOpen={isAddPaymentModalOpen}
        onRequestClose={() => setIsAddPaymentModalOpen(false)}
        onSuccess={handleAddPaymentSuccess}
      />

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
              className="w-full max-w-lg rounded-lg bg-white shadow-xl"
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

                {/* <div className="mt-3 flex space-x-1 rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setExportModalTab("basic")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      exportModalTab === "basic"
                        ? "bg-white text-[#004B23] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Basic Filters
                  </button>
                  <button
                    onClick={() => setExportModalTab("advanced")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      exportModalTab === "advanced"
                        ? "bg-white text-[#004B23] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Advanced Filters
                  </button>
                </div> */}
              </div>

              <div className=" p-4">
                {exportModalTab === "basic" ? (
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
                  </div>
                ) : (
                  <div className="space-y-4">
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

                    {/* Collector Type and Clearance Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Collector Type</label>
                        <select
                          value={exportCollectorType}
                          onChange={(e) => setExportCollectorType(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        >
                          <option value="all">All Types</option>
                          <option value="Customer">Customer</option>
                          <option value="SalesRep">Sales Rep</option>
                          <option value="Vendor">Vendor</option>
                          <option value="Staff">Staff</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Clearance Status</label>
                        <select
                          value={exportClearanceStatus}
                          onChange={(e) => setExportClearanceStatus(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        >
                          <option value="all">All Status</option>
                          <option value="Uncleared">Uncleared</option>
                          <option value="Cleared">Cleared</option>
                          <option value="ClearedWithCondition">Cleared with Condition</option>
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

                    {/* Account Number */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Account Number</label>
                      <input
                        type="text"
                        placeholder="Enter account number"
                        value={exportAccountNumber}
                        onChange={(e) => setExportAccountNumber(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      />
                    </div>

                    {/* Boolean Filters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Cleared Status</label>
                        <select
                          value={exportIsCleared}
                          onChange={(e) => setExportIsCleared(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        >
                          <option value="all">Any</option>
                          <option value="true">Cleared</option>
                          <option value="false">Not Cleared</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Remitted Status</label>
                        <select
                          value={exportIsRemitted}
                          onChange={(e) => setExportIsRemitted(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        >
                          <option value="all">Any</option>
                          <option value="true">Remitted</option>
                          <option value="false">Not Remitted</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
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
