"use client"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
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
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearCustomers, fetchCustomers } from "lib/redux/customerSlice"
import { clearPaymentTypes, fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import {
  clearPayments,
  fetchPaymentChannels,
  fetchPayments,
  Payment,
  PaymentsRequestParams,
} from "lib/redux/paymentSlice"
import { CollectorType, PaymentChannel } from "lib/redux/agentSlice"
import { clearVendors, fetchVendors } from "lib/redux/vendorSlice"
import { VscEye } from "react-icons/vsc"

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

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

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
                      {[...Array(8)].map((_, i) => (
                        <th key={i} className="whitespace-nowrap border-b p-4">
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {[...Array(8)].map((_, cellIndex) => (
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
  channelOptions: Array<{ value: string | PaymentChannel; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  collectorTypeOptions: Array<{ value: string; label: string }>
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
  const { payments, loading, error, success, pagination } = useAppSelector((state) => state.payments)
  const { customers } = useAppSelector((state) => state.customers)
  const { vendors } = useAppSelector((state) => state.vendors)
  const { agents } = useAppSelector((state) => state.agents)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { paymentChannels, paymentChannelsLoading } = useAppSelector((state) => state.payments)

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

  // Local state for filters to avoid too many Redux dispatches
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

    // Cleanup function to clear states when component unmounts
    return () => {
      dispatch(clearCustomers())
      dispatch(clearVendors())
      dispatch(clearAgents())
      dispatch(clearPaymentTypes())
      dispatch(clearAreaOffices())
      dispatch(clearPayments())
    }
  }, [dispatch])

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
      ...(appliedFilters.channel && { channel: appliedFilters.channel }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.collectorType && { collectorType: appliedFilters.collectorType }),
      ...(appliedFilters.paidFromUtc && { paidFromUtc: appliedFilters.paidFromUtc }),
      ...(appliedFilters.paidToUtc && { paidToUtc: appliedFilters.paidToUtc }),
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
      ...(appliedFilters.channel && { channel: appliedFilters.channel }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.collectorType && { collectorType: appliedFilters.collectorType }),
      ...(appliedFilters.paidFromUtc && { paidFromUtc: appliedFilters.paidFromUtc }),
      ...(appliedFilters.paidToUtc && { paidToUtc: appliedFilters.paidToUtc }),
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
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    let processedValue = value

    // Handle channel field - convert string to enum
    if (key === "channel" && typeof value === "string" && value) {
      processedValue = channelStringToEnum(value)
    }

    // Handle collectorType field - convert string to enum
    if (key === "collectorType" && typeof value === "string" && value) {
      processedValue = value as CollectorType
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
      channel: localFilters.channel,
      status: localFilters.status,
      collectorType: localFilters.collectorType,
      paidFromUtc: localFilters.paidFromUtc,
      paidToUtc: localFilters.paidToUtc,
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

  // Generate channel options from payment channels endpoint
  const channelOptions = [
    { value: "", label: "All Channels" },
    ...paymentChannels.map((channel) => ({
      value: channelStringToEnum(channel),
      label: channel,
    })),
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
                              <th className="sticky right-0 z-10 whitespace-nowrap border-y bg-white  p-4 text-sm font-semibold text-gray-900">
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
                                  {formatCurrency(payment.totalAmountPaid, payment.currency)}
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
                                  {payment.collectorType && (
                                    <motion.div
                                      style={getCollectorTypeStyle(payment.collectorType)}
                                      className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.1 }}
                                    >
                                      {payment.collectorType}
                                    </motion.div>
                                  )}
                                </td>
                                {/* <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <MapIcon />
                                    {payment.areaOfficeName}
                                  </div>
                                </td> */}
                                <td className="shadow-[ -2px_0_5px_-2px_rgba(0,0,0,0.1) ] sticky right-0 z-10 whitespace-nowrap border-b bg-white px-4 py-3 text-sm shadow-md">
                                  <ButtonModule
                                    size="sm"
                                    variant="outline"
                                    icon={<VscEye />}
                                    onClick={() => router.push(`/payment/payment-detail/${payment.id}`)}
                                  >
                                    View
                                  </ButtonModule>
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

                  <div className="space-y-4 overflow-y-auto">
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
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />
    </section>
  )
}

export default AllPayments
