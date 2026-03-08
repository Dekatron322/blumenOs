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
  Info,
  Search,
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
import { clearAgents, fetchAgents, PaymentChannel } from "lib/redux/agentSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearCustomers, fetchCustomers } from "lib/redux/customerSlice"
import { clearPaymentTypes, fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import { fetchPaymentChannels } from "lib/redux/paymentSlice"
import {
  AllVendorPayment,
  AllVendorPaymentsRequestParams,
  clearAllVendorPayments,
  clearVendors,
  fetchAllVendorPayments,
  fetchVendors,
} from "lib/redux/vendorSlice"
import { VscEye } from "react-icons/vsc"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import { api } from "lib/redux/authSlice"
import EmptySearchState from "components/ui/EmptySearchState"

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

interface ActionButtonsProps {
  payment: AllVendorPayment
  onViewDetails: (payment: AllVendorPayment) => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ payment, onViewDetails }) => {
  const handleViewDetails = () => {
    onViewDetails(payment)
  }

  const handleProcessRefund = () => {
    console.log("Process refund:", payment.id)
  }

  const handleExportReceipt = () => {
    console.log("Export receipt:", payment.id)
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={handleViewDetails}
        className="flex items-center justify-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs  text-blue-700 transition-colors hover:bg-blue-100"
        title="View Details"
      >
        <VscEye className="size-3" />
        <p className="text-xs">View Details</p>
      </button>
      {/* <button
        onClick={handleProcessRefund}
        className="flex items-center justify-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100"
        title="Process Refund"
      >
        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </button> */}
      {/* <button
        onClick={handleExportReceipt}
        className="flex items-center justify-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
        title="Export Receipt"
      >
        <Download className="size-3" />
      </button> */}
    </div>
  )
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
    allVendorPayments,
    allVendorPaymentsLoading: loading,
    allVendorPaymentsError: error,
    allVendorPaymentsSuccess: success,
    allVendorPaymentsPagination: pagination,
  } = useAppSelector((state) => state.vendors)
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

  // Export CSV state
  const [isExporting, setIsExporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportDateRange, setExportDateRange] = useState<"all" | "today" | "week" | "month" | "custom">("all")
  const [exportFromDate, setExportFromDate] = useState("")
  const [exportToDate, setExportToDate] = useState("")

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    reference: undefined as string | undefined,
    accountNumber: undefined as string | undefined,
    meterNumber: undefined as string | undefined,
    paymentTypeId: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    distributionSubstationId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    serviceCenterId: undefined as number | undefined,
    channel: undefined as string | undefined,
    status: undefined as string | undefined,
    collectorType: undefined as string | undefined,
    clearanceStatus: undefined as string | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    prepaidOnly: undefined as boolean | undefined,
    isCleared: undefined as boolean | undefined,
    isRemitted: undefined as boolean | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    reference: undefined as string | undefined,
    accountNumber: undefined as string | undefined,
    meterNumber: undefined as string | undefined,
    paymentTypeId: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    distributionSubstationId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    serviceCenterId: undefined as number | undefined,
    channel: undefined as string | undefined,
    status: undefined as string | undefined,
    collectorType: undefined as string | undefined,
    clearanceStatus: undefined as string | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    prepaidOnly: undefined as boolean | undefined,
    isCleared: undefined as boolean | undefined,
    isRemitted: undefined as boolean | undefined,
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
      dispatch(clearAllVendorPayments())
    }
  }, [dispatch])

  // Fetch vendor payments when component mounts or filters change
  useEffect(() => {
    const fetchParams: AllVendorPaymentsRequestParams = {
      pageNumber: currentPage,
      pageSize,
      ...(searchText && { search: searchText }),
      ...(appliedFilters.customerId && { customerId: appliedFilters.customerId }),
      ...(appliedFilters.vendorId && { vendorId: appliedFilters.vendorId }),
      ...(appliedFilters.agentId && { agentId: appliedFilters.agentId }),
      ...(appliedFilters.reference && { reference: appliedFilters.reference }),
      ...(appliedFilters.accountNumber && { accountNumber: appliedFilters.accountNumber }),
      ...(appliedFilters.meterNumber && { meterNumber: appliedFilters.meterNumber }),
      ...(appliedFilters.paymentTypeId && { paymentTypeId: appliedFilters.paymentTypeId }),
      ...(appliedFilters.areaOfficeId && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.distributionSubstationId && {
        distributionSubstationId: appliedFilters.distributionSubstationId,
      }),
      ...(appliedFilters.feederId && { feederId: appliedFilters.feederId }),
      ...(appliedFilters.serviceCenterId && { serviceCenterId: appliedFilters.serviceCenterId }),
      ...(appliedFilters.channel && { channel: appliedFilters.channel }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.collectorType && { collectorType: appliedFilters.collectorType }),
      ...(appliedFilters.clearanceStatus && { clearanceStatus: appliedFilters.clearanceStatus }),
      ...(appliedFilters.paidFromUtc && { paidFromUtc: appliedFilters.paidFromUtc }),
      ...(appliedFilters.paidToUtc && { paidToUtc: appliedFilters.paidToUtc }),
      ...(appliedFilters.prepaidOnly !== undefined && { prepaidOnly: appliedFilters.prepaidOnly }),
      ...(appliedFilters.isCleared !== undefined && { isCleared: appliedFilters.isCleared }),
      ...(appliedFilters.isRemitted !== undefined && { isRemitted: appliedFilters.isRemitted }),
    }

    void dispatch(fetchAllVendorPayments(fetchParams))
  }, [dispatch, currentPage, searchText, appliedFilters])

  const handleRefreshData = useCallback(() => {
    const fetchParams: AllVendorPaymentsRequestParams = {
      pageNumber: currentPage,
      pageSize,
      ...(searchText && { search: searchText }),
      ...(appliedFilters.customerId && { customerId: appliedFilters.customerId }),
      ...(appliedFilters.vendorId && { vendorId: appliedFilters.vendorId }),
      ...(appliedFilters.agentId && { agentId: appliedFilters.agentId }),
      ...(appliedFilters.reference && { reference: appliedFilters.reference }),
      ...(appliedFilters.accountNumber && { accountNumber: appliedFilters.accountNumber }),
      ...(appliedFilters.meterNumber && { meterNumber: appliedFilters.meterNumber }),
      ...(appliedFilters.paymentTypeId && { paymentTypeId: appliedFilters.paymentTypeId }),
      ...(appliedFilters.areaOfficeId && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.distributionSubstationId && {
        distributionSubstationId: appliedFilters.distributionSubstationId,
      }),
      ...(appliedFilters.feederId && { feederId: appliedFilters.feederId }),
      ...(appliedFilters.serviceCenterId && { serviceCenterId: appliedFilters.serviceCenterId }),
      ...(appliedFilters.channel && { channel: appliedFilters.channel }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.collectorType && { collectorType: appliedFilters.collectorType }),
      ...(appliedFilters.clearanceStatus && { clearanceStatus: appliedFilters.clearanceStatus }),
      ...(appliedFilters.paidFromUtc && { paidFromUtc: appliedFilters.paidFromUtc }),
      ...(appliedFilters.paidToUtc && { paidToUtc: appliedFilters.paidToUtc }),
      ...(appliedFilters.prepaidOnly !== undefined && { prepaidOnly: appliedFilters.prepaidOnly }),
      ...(appliedFilters.isCleared !== undefined && { isCleared: appliedFilters.isCleared }),
      ...(appliedFilters.isRemitted !== undefined && { isRemitted: appliedFilters.isRemitted }),
    }

    void dispatch(fetchAllVendorPayments(fetchParams))
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

  const getStatusStyle = (status: string) => {
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

  const getPaymentMethodStyle = (channel: string) => {
    switch (channel) {
      case "BankTransfer":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "Cash":
        return {
          backgroundColor: "#DBE8FE",
          color: "#2563EB",
        }
      case "Pos":
        return {
          backgroundColor: "#FFFBEB",
          color: "#D97706",
        }
      case "Card":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case "VendorWallet":
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

  const getCollectorTypeStyle = (collectorType: string) => {
    switch (collectorType) {
      case "Customer":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "SalesRep":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case "Vendor":
        return {
          backgroundColor: "#FFFBEB",
          color: "#D97706",
        }
      case "Staff":
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
    setAppliedFilters({
      customerId: localFilters.customerId,
      vendorId: localFilters.vendorId,
      agentId: localFilters.agentId,
      reference: localFilters.reference,
      accountNumber: localFilters.accountNumber,
      meterNumber: localFilters.meterNumber,
      paymentTypeId: localFilters.paymentTypeId,
      areaOfficeId: localFilters.areaOfficeId,
      distributionSubstationId: localFilters.distributionSubstationId,
      feederId: localFilters.feederId,
      serviceCenterId: localFilters.serviceCenterId,
      channel: localFilters.channel,
      status: localFilters.status,
      collectorType: localFilters.collectorType,
      clearanceStatus: localFilters.clearanceStatus,
      paidFromUtc: localFilters.paidFromUtc,
      paidToUtc: localFilters.paidToUtc,
      prepaidOnly: localFilters.prepaidOnly,
      isCleared: localFilters.isCleared,
      isRemitted: localFilters.isRemitted,
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
      reference: undefined,
      accountNumber: undefined,
      meterNumber: undefined,
      paymentTypeId: undefined,
      areaOfficeId: undefined,
      distributionSubstationId: undefined,
      feederId: undefined,
      serviceCenterId: undefined,
      channel: undefined,
      status: undefined,
      collectorType: undefined,
      clearanceStatus: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      prepaidOnly: undefined,
      isCleared: undefined,
      isRemitted: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      reference: undefined,
      accountNumber: undefined,
      meterNumber: undefined,
      paymentTypeId: undefined,
      areaOfficeId: undefined,
      distributionSubstationId: undefined,
      feederId: undefined,
      serviceCenterId: undefined,
      channel: undefined,
      status: undefined,
      collectorType: undefined,
      clearanceStatus: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      prepaidOnly: undefined,
      isCleared: undefined,
      isRemitted: undefined,
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
      value: channel,
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
    handleRefreshData()
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
        return {
          from: weekAgo.toISOString(),
          to: new Date().toISOString(),
        }
      case "month":
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return {
          from: monthAgo.toISOString(),
          to: new Date().toISOString(),
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
    setIsExporting(true)
    setShowExportModal(false)

    try {
      const dateRange = getExportDateRange()

      const response = await api.get(buildApiUrl(API_ENDPOINTS.VENDORS.ALL_VENDOR_PAYMENT), {
        params: {
          PageNumber: 1,
          PageSize: 10000,
          ...(searchText && { Search: searchText }),
          ...(appliedFilters.customerId && { CustomerId: appliedFilters.customerId }),
          ...(appliedFilters.vendorId && { VendorId: appliedFilters.vendorId }),
          ...(appliedFilters.agentId && { AgentId: appliedFilters.agentId }),
          ...(appliedFilters.reference && { Reference: appliedFilters.reference }),
          ...(appliedFilters.accountNumber && { AccountNumber: appliedFilters.accountNumber }),
          ...(appliedFilters.meterNumber && { MeterNumber: appliedFilters.meterNumber }),
          ...(appliedFilters.paymentTypeId && { PaymentTypeId: appliedFilters.paymentTypeId }),
          ...(appliedFilters.areaOfficeId && { AreaOfficeId: appliedFilters.areaOfficeId }),
          ...(appliedFilters.distributionSubstationId && {
            DistributionSubstationId: appliedFilters.distributionSubstationId,
          }),
          ...(appliedFilters.feederId && { FeederId: appliedFilters.feederId }),
          ...(appliedFilters.serviceCenterId && { ServiceCenterId: appliedFilters.serviceCenterId }),
          ...(appliedFilters.channel && { Channel: appliedFilters.channel }),
          ...(appliedFilters.status && { Status: appliedFilters.status }),
          ...(appliedFilters.collectorType && { CollectorType: appliedFilters.collectorType }),
          ...(appliedFilters.clearanceStatus && { ClearanceStatus: appliedFilters.clearanceStatus }),
          ...(dateRange.from || appliedFilters.paidFromUtc
            ? { PaidFromUtc: dateRange.from || appliedFilters.paidFromUtc }
            : {}),
          ...(dateRange.to || appliedFilters.paidToUtc ? { PaidToUtc: dateRange.to || appliedFilters.paidToUtc } : {}),
          ...(appliedFilters.prepaidOnly !== undefined && { PrepaidOnly: appliedFilters.prepaidOnly }),
          ...(appliedFilters.isCleared !== undefined && { IsCleared: appliedFilters.isCleared }),
          ...(appliedFilters.isRemitted !== undefined && { IsRemitted: appliedFilters.isRemitted }),
        },
      })

      const exportPayments: AllVendorPayment[] = response.data?.data || []

      if (exportPayments.length === 0) {
        setIsExporting(false)
        return
      }

      const headers = [
        "Reference",
        "Amount",
        "VAT Amount",
        "Vendor Commission",
        "Currency",
        "Customer Name",
        "Customer Account",
        "Vendor Name",
        "Payment Type",
        "Channel",
        "Status",
        "Collector Type",
        "Is Prepaid",
        "Date/Time",
        "Area Office",
        "Feeder",
      ]

      const csvRows = exportPayments.map((payment) => [
        payment.reference || `PAY-${payment.id}`,
        payment.amount,
        payment.vatAmount,
        payment.vendorCommissionAmount,
        payment.currency || "NGN",
        payment.customerName || "-",
        payment.customerAccountNumber || "-",
        payment.vendorName || "-",
        payment.paymentTypeName || "-",
        payment.channel,
        payment.status,
        payment.collectorType,
        payment.isPrepaid ? "Yes" : "No",
        payment.paidAtUtc ? formatDate(payment.paidAtUtc) : "-",
        payment.areaOfficeName || "-",
        payment.feederName || "-",
      ])

      const escapeCSV = (value: string | number | boolean | undefined) => {
        const stringValue = String(value)
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }

      const csvContent = [headers.map(escapeCSV).join(","), ...csvRows.map((row) => row.map(escapeCSV).join(","))].join(
        "\n"
      )

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `vendor_collections_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export vendor collections:", error)
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="p-4 text-red-600">Error loading vendor collections: {error}</div>

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-3 py-4  max-sm:px-3 md:px-4 lg:px-6 ">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Vendor Collections</h4>
                <p className="text-gray-600">Track and manage vendor payment collections</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
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

            <div className="w-full space-y-5">
              {/* Header Section */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Vendor Collections</h2>
                    <p className="mt-1 text-xs text-gray-600">Track and manage vendor payment collections</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Polling Controls */}

                    {/* Search */}
                    <div className="relative min-w-[220px]">
                      <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Search customers or references..."
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

                      {/* Export CSV Button */}
                      <button
                        onClick={() => setShowExportModal(true)}
                        disabled={isExporting}
                        className={`flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium transition-colors ${
                          isExporting ? "cursor-not-allowed opacity-50" : "text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        <Download className={`size-3.5 ${isExporting ? "animate-pulse" : ""}`} />
                        <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export"}</span>
                      </button>

                      {/* Refresh Button */}
                      <button
                        onClick={handleRefreshData}
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
                        Customer: {customerOptions.find((opt) => opt.value === appliedFilters.customerId)?.label}
                        <button
                          onClick={() => {
                            setLocalFilters((prev) => ({ ...prev, customerId: undefined }))
                            setAppliedFilters((prev) => ({ ...prev, customerId: undefined }))
                          }}
                          className="ml-0.5 hover:text-blue-900"
                        >
                          <X className="size-2.5" />
                        </button>
                      </span>
                    )}
                    {appliedFilters.vendorId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        Vendor: {vendorOptions.find((opt) => opt.value === appliedFilters.vendorId)?.label}
                        <button
                          onClick={() => {
                            setLocalFilters((prev) => ({ ...prev, vendorId: undefined }))
                            setAppliedFilters((prev) => ({ ...prev, vendorId: undefined }))
                          }}
                          className="ml-0.5 hover:text-blue-900"
                        >
                          <X className="size-2.5" />
                        </button>
                      </span>
                    )}
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

              {/* Main Content with Table on Left, Filters on Right */}
              <div className="flex flex-col-reverse gap-5 lg:flex-row">
                {/* Table - Takes remaining width */}
                <div className="min-w-0 flex-1">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    {allVendorPayments.length === 0 ? (
                      <div className="flex h-72 flex-col items-center justify-center px-4">
                        <EmptySearchState title="No payments found" description={searchText || getActiveFilterCount() > 0
                            ? "Try adjusting your search or filters"
                            : "Payments will appear here"} />
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
                          <table className="w-full min-w-[1200px]">
                            <thead>
                              <tr className="border-b border-gray-200 bg-gray-50/80">
                                <th className="p-2 text-left">
                                  <div className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                    <UserIcon />
                                    Customer
                                  </div>
                                </th>
                                <th className="p-2 text-left">
                                  <div className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                    Amount
                                  </div>
                                </th>
                                <th className="p-2 text-left">
                                  <div className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                    Status
                                  </div>
                                </th>
                                <th className="p-2 text-left">
                                  <div className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                    Payment Method
                                  </div>
                                </th>
                                <th className="p-2 text-left">
                                  <div className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                    Reference
                                  </div>
                                </th>
                                <th className="p-2 text-left">
                                  <div className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                    Timestamp
                                  </div>
                                </th>
                                <th className="p-2 text-left">
                                  <div className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                    Collector Type
                                  </div>
                                </th>
                                <th className="p-2 text-left">
                                  <div className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                    Actions
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <AnimatePresence>
                                {allVendorPayments.map((payment, index) => (
                                  <motion.tr
                                    key={payment.id}
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
                                        <div>
                                          <div className="font-medium text-gray-900">{payment.customerName}</div>
                                          <div className="text-gray-500">{payment.customerAccountNumber}</div>
                                          {payment.vendorName && (
                                            <div className="text-xs text-blue-600">Vendor: {payment.vendorName}</div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap p-2 text-xs font-semibold text-gray-900">
                                      {formatCurrency(payment.amount || 0, payment.currency)}
                                    </td>
                                    <td className="whitespace-nowrap p-2 text-xs">
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
                                        />
                                        {payment.status}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap p-2 text-xs">
                                      <motion.div
                                        style={getPaymentMethodStyle(payment.channel)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        {payment.channel}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap p-2 text-xs text-gray-600">{payment.reference}</td>
                                    <td className="whitespace-nowrap p-2 text-xs text-gray-600">
                                      {formatDate(payment.paidAtUtc)}
                                    </td>
                                    <td className="whitespace-nowrap p-2 text-xs">
                                      {payment.collector && (
                                        <motion.div
                                          style={getCollectorTypeStyle(payment.collector.type)}
                                          className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                                          whileHover={{ scale: 1.05 }}
                                          transition={{ duration: 0.1 }}
                                        >
                                          {payment.collector.type} - {payment.collector.name}
                                        </motion.div>
                                      )}
                                    </td>
                                    <td className="whitespace-nowrap p-2">
                                      <ActionButtons
                                        payment={payment}
                                        onViewDetails={(payment) =>
                                          router.push(`/payment/payment-detail/${payment.id}`)
                                        }
                                      />
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
                              {currentPage * pageSize - pageSize + 1}-
                              {Math.min(currentPage * pageSize, pagination.totalCount || 0)} of{" "}
                              {pagination.totalCount || 0}
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
                              let pageNum
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
                                      ? "bg-blue-600 text-white"
                                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            })}

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
                  </div>
                </div>

                {/* Desktop Filter Panel - On the Right */}
                {showDesktopFilters && (
                  <div className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white">
                    {/* Header */}
                    <div className="border-b border-gray-200 p-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Filters & Sorting</h3>
                        <button
                          onClick={resetFilters}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
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
                          <label className="text-sm font-medium text-gray-700">Customer</label>
                          <FormSelectModule
                            value={localFilters.customerId || ""}
                            onChange={(e) => handleFilterChange("customerId", e.target.value)}
                            options={customerOptions}
                            className="w-full"
                            name={"customerId"}
                          />
                        </div>

                        {/* Vendor Filter */}
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Vendor</label>
                          <FormSelectModule
                            value={localFilters.vendorId || ""}
                            onChange={(e) => handleFilterChange("vendorId", e.target.value)}
                            options={vendorOptions}
                            className="w-full"
                            name={"vendorId"}
                          />
                        </div>

                        {/* Agent Filter */}
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Agent</label>
                          <FormSelectModule
                            value={localFilters.agentId || ""}
                            onChange={(e) => handleFilterChange("agentId", e.target.value)}
                            options={agentOptions}
                            className="w-full"
                            name={"agentId"}
                          />
                        </div>

                        {/* Payment Type Filter */}
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Payment Type</label>
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
                                    className={`rounded-lg px-3 py-2 text-xs transition-colors ${
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
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Area Office</label>
                          <FormSelectModule
                            value={localFilters.areaOfficeId || ""}
                            onChange={(e) => handleFilterChange("areaOfficeId", e.target.value)}
                            options={areaOfficeOptions}
                            className="w-full"
                            name={"areaOfficeId"}
                          />
                        </div>

                        {/* Channel Filter */}
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Channel</label>
                          <FormSelectModule
                            value={String(localFilters.channel || "")}
                            onChange={(e) => handleFilterChange("channel", e.target.value)}
                            options={channelOptions}
                            className="w-full"
                            name={"channel"}
                          />
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Status</label>
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
                                  className={`rounded-lg px-3 py-2 text-xs transition-colors ${
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
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Collector Type</label>
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
                                  className={`rounded-lg px-3 py-2 text-xs transition-colors ${
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
                        <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                          Summary
                        </h4>
                        <div className="space-y-0.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-medium text-gray-900">
                              {pagination.totalCount?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Page:</span>
                            <span className="font-medium text-gray-900">
                              {currentPage}/{pagination.totalPages || 1}
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
                      className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Export Payments to CSV</h3>
                        <button
                          onClick={() => setShowExportModal(false)}
                          className="rounded-full p-1 hover:bg-gray-100"
                        >
                          <X className="size-5 text-gray-500" />
                        </button>
                      </div>

                      {/* Date Range Selection */}
                      <div className="mb-4 space-y-3">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Date Range</label>
                          <select
                            value={exportDateRange}
                            onChange={(e) => {
                              setExportDateRange(e.target.value as "today" | "week" | "month" | "custom")
                              if (e.target.value !== "custom") {
                                setExportFromDate("")
                                setExportToDate("")
                              }
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="custom">Custom Range</option>
                          </select>
                        </div>

                        {exportDateRange === "custom" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">From Date</label>
                              <input
                                type="date"
                                value={exportFromDate}
                                onChange={(e) => setExportFromDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">To Date</label>
                              <input
                                type="date"
                                value={exportToDate}
                                onChange={(e) => setExportToDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
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
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          <Download className="mr-2 inline-block size-4" />
                          Export
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Export Payments to CSV</h3>
                <button onClick={() => setShowExportModal(false)} className="rounded-full p-1 hover:bg-gray-100">
                  <X className="size-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
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
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">From</label>
                    <input
                      type="date"
                      value={exportFromDate}
                      onChange={(e) => setExportFromDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">To</label>
                    <input
                      type="date"
                      value={exportToDate}
                      onChange={(e) => setExportToDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                    />
                  </div>
                </div>
              )}

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default AllPayments
