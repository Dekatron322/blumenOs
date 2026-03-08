"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchPrepaidTransactions, PrepaidTransaction, PrepaidTransactionParams } from "lib/redux/metersSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { VscChevronDown, VscChevronUp } from "react-icons/vsc"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { formatCurrency } from "utils/formatCurrency"
import TransactionReceiptModal from "components/ui/Modal/transaction-receipt-modal"
import EmptySearchState from "components/ui/EmptySearchState"

// Compact Action Dropdown
const CompactActionDropdown: React.FC<{
  transaction: PrepaidTransaction
  onViewDetails: (transaction: PrepaidTransaction) => void
}> = ({ transaction, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-6 items-center justify-center rounded-md hover:bg-gray-100"
      >
        <RxDotsVertical className="size-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 z-50 mt-1 w-36 rounded-md border border-gray-200 bg-white py-1 text-xs shadow-lg"
          >
            <button
              onClick={() => {
                onViewDetails(transaction)
                setIsOpen(false)
              }}
              className="block w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-50"
            >
              View Details
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="block w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-50"
            >
              View Receipt
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="block w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-50"
            >
              Download Tokens
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact Badge
const CompactBadge = ({ children, color = "gray" }: { children: React.ReactNode; color?: string }) => {
  const colors: { [key: string]: string } = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        colors[color] || colors.gray
      }`}
    >
      {children}
    </span>
  )
}

// Compact Filter Sidebar
const CompactFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  resetFilters,
  getActiveFilterCount,
  serviceStations,
  distributionSubstations,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string) => void
  handleSortChange: (option: any) => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  serviceStations: any[]
  distributionSubstations: any[]
}) => {
  const [activeTab, setActiveTab] = useState<"filters" | "sort">("filters")

  const statusOptions = [
    { value: "Pending", label: "Pending", color: "yellow" },
    { value: "Confirmed", label: "Confirmed", color: "green" },
    { value: "Failed", label: "Failed", color: "red" },
    { value: "Reversed", label: "Reversed", color: "gray" },
  ]

  const channelOptions = [
    { value: "Cash", label: "Cash", color: "blue" },
    { value: "BankTransfer", label: "Bank Transfer", color: "purple" },
    { value: "Pos", label: "POS", color: "yellow" },
    { value: "Card", label: "Card", color: "red" },
    { value: "VendorWallet", label: "Wallet", color: "green" },
    { value: "Chaque", label: "Chaque", color: "orange" },
  ]

  const collectorTypeOptions = [
    { value: "Customer", label: "Customer", color: "blue" },
    { value: "SalesRep", label: "Sales Rep", color: "green" },
    { value: "Vendor", label: "Vendor", color: "purple" },
    { value: "Staff", label: "Staff", color: "orange" },
  ]

  const clearanceStatusOptions = [
    { value: "Uncleared", label: "Uncleared", color: "red" },
    { value: "Cleared", label: "Cleared", color: "green" },
    { value: "ClearedWithCondition", label: "Cleared with Condition", color: "yellow" },
  ]

  const sortOptions = [
    { label: "Reference A-Z", value: "reference", order: "asc" },
    { label: "Reference Z-A", value: "reference", order: "desc" },
    { label: "Customer Name A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name Z-A", value: "customerName", order: "desc" },
    { label: "Amount Low-High", value: "amount", order: "asc" },
    { label: "Amount High-Low", value: "amount", order: "desc" },
    { label: "Date Newest", value: "paidAtUtc", order: "desc" },
    { label: "Date Oldest", value: "paidAtUtc", order: "asc" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            className="absolute right-0 top-0 flex h-full w-80 flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-3">
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
                  <ArrowLeft className="size-4" />
                </button>
                <h2 className="text-sm font-semibold">Filters & Sorting</h2>
                {getActiveFilterCount() > 0 && (
                  <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
                    {getActiveFilterCount()}
                  </span>
                )}
              </div>
              <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-800">
                Clear All
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("filters")}
                className={`flex-1 py-2 text-xs font-medium ${
                  activeTab === "filters"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Filters ({getActiveFilterCount()})
              </button>
              <button
                onClick={() => setActiveTab("sort")}
                className={`flex-1 py-2 text-xs font-medium ${
                  activeTab === "sort"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sorting
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === "filters" ? (
                <div className="space-y-4">
                  {/* Transaction Status */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Transaction Status</label>
                    <div className="flex flex-wrap gap-1.5">
                      {statusOptions.map((status) => (
                        <button
                          key={status.value}
                          onClick={() =>
                            handleFilterChange("status", localFilters.status === status.value ? "" : status.value)
                          }
                          className={`rounded-full px-2 py-1 text-[10px] transition-colors ${
                            localFilters.status === status.value
                              ? `bg-${status.color}-100 text-${status.color}-700 ring-1 ring-${status.color}-200`
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Channel */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Payment Channel</label>
                    <div className="flex flex-wrap gap-1.5">
                      {channelOptions.map((channel) => (
                        <button
                          key={channel.value}
                          onClick={() =>
                            handleFilterChange("channel", localFilters.channel === channel.value ? "" : channel.value)
                          }
                          className={`rounded-full px-2 py-1 text-[10px] transition-colors ${
                            localFilters.channel === channel.value
                              ? `bg-${channel.color}-100 text-${channel.color}-700 ring-1 ring-${channel.color}-200`
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {channel.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Collector Type */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Collector Type</label>
                    <div className="flex flex-wrap gap-1.5">
                      {collectorTypeOptions.map((type) => (
                        <button
                          key={type.value}
                          onClick={() =>
                            handleFilterChange(
                              "collectorType",
                              localFilters.collectorType === type.value ? "" : type.value
                            )
                          }
                          className={`rounded-full px-2 py-1 text-[10px] transition-colors ${
                            localFilters.collectorType === type.value
                              ? `bg-${type.color}-100 text-${type.color}-700 ring-1 ring-${type.color}-200`
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clearance Status */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Clearance Status</label>
                    <div className="flex flex-wrap gap-1.5">
                      {clearanceStatusOptions.map((status) => (
                        <button
                          key={status.value}
                          onClick={() =>
                            handleFilterChange(
                              "clearanceStatus",
                              localFilters.clearanceStatus === status.value ? "" : status.value
                            )
                          }
                          className={`rounded-full px-2 py-1 text-[10px] transition-colors ${
                            localFilters.clearanceStatus === status.value
                              ? `bg-${status.color}-100 text-${status.color}-700 ring-1 ring-${status.color}-200`
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Service Center */}
                  <div>
                    <FormSelectModule
                      label="Service Center"
                      name="serviceCenterId"
                      value={localFilters.serviceCenterId}
                      onChange={(e) => handleFilterChange("serviceCenterId", e.target.value)}
                      options={[
                        { value: "", label: "All Service Centers" },
                        ...serviceStations.map((sc) => ({ value: sc.id.toString(), label: sc.name })),
                      ]}
                      className="w-full"
                      controlClassName="h-8 text-xs"
                    />
                  </div>

                  {/* Distribution Substation */}
                  <div>
                    <FormSelectModule
                      label="Distribution Substation"
                      name="distributionSubstationId"
                      value={localFilters.distributionSubstationId}
                      onChange={(e) => handleFilterChange("distributionSubstationId", e.target.value)}
                      options={[
                        { value: "", label: "All Substations" },
                        ...distributionSubstations.map((ds) => ({
                          value: ds.id.toString(),
                          label: `${ds.dssCode} - ${ds.feeder?.name || "Unknown"}`,
                        })),
                      ]}
                      className="w-full"
                      controlClassName="h-8 text-xs"
                    />
                  </div>

                  {/* Prepaid Only */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Transaction Type</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() =>
                          handleFilterChange("prepaidOnly", localFilters.prepaidOnly === "true" ? "" : "true")
                        }
                        className={`rounded-full px-2 py-1 text-[10px] transition-colors ${
                          localFilters.prepaidOnly === "true"
                            ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Prepaid Only
                      </button>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Date Range</label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                        value={localFilters.paidFromUtc?.split("T")[0] || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "paidFromUtc",
                            e.target.value ? new Date(e.target.value).toISOString() : ""
                          )
                        }
                        placeholder="From Date"
                      />
                      <input
                        type="date"
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                        value={localFilters.paidToUtc?.split("T")[0] || ""}
                        onChange={(e) =>
                          handleFilterChange("paidToUtc", e.target.value ? new Date(e.target.value).toISOString() : "")
                        }
                        placeholder="To Date"
                      />
                    </div>
                  </div>

                  {/* Meter Active */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Meter Status</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() =>
                          handleFilterChange("isMeterActive", localFilters.isMeterActive === "true" ? "" : "true")
                        }
                        className={`rounded-full px-2 py-1 text-[10px] transition-colors ${
                          localFilters.isMeterActive === "true"
                            ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Active Only
                      </button>
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <FormSelectModule
                      label="State"
                      name="state"
                      value={localFilters.state}
                      onChange={(e) => handleFilterChange("state", e.target.value)}
                      options={[
                        { value: "", label: "All States" },
                        { value: "1", label: "Abuja" },
                        { value: "2", label: "Kaduna" },
                        { value: "3", label: "Kano" },
                        { value: "4", label: "Katsina" },
                        { value: "5", label: "Kebbi" },
                        { value: "6", label: "Sokoto" },
                        { value: "7", label: "Zamfara" },
                      ]}
                      className="w-full"
                      controlClassName="h-8 text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={`${option.value}-${option.order}`}
                      onClick={() => handleSortChange(option)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                        localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                          ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span>{option.label}</span>
                      {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                        <span className="text-purple-600">
                          {option.order === "asc" ? <SortAsc className="size-3" /> : <SortDesc className="size-3" />}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Apply Button */}
            <div className="border-t p-3">
              <button
                onClick={onClose}
                className="w-full rounded-md bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>

            {/* Summary Stats */}
            <div className="border-t bg-gray-50 p-3">
              <h3 className="mb-1 text-xs font-medium text-gray-700">Summary</h3>
              <div className="space-y-1 text-[10px] text-gray-600">
                <div className="flex justify-between">
                  <span>Active Filters:</span>
                  <span className="font-medium">{getActiveFilterCount()}</span>
                </div>
                {localFilters.sortBy && (
                  <div className="flex justify-between">
                    <span>Sort By:</span>
                    <span className="font-medium">
                      {sortOptions.find(
                        (opt) => opt.value === localFilters.sortBy && opt.order === localFilters.sortOrder
                      )?.label || "None"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Compact Loading Skeleton
const CompactLoadingSkeleton = () => {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 },
          }}
        >
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div>
              <div className="h-3 w-32 rounded bg-gray-200"></div>
              <div className="mt-1 h-2 w-24 rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="h-6 w-16 rounded bg-gray-200"></div>
        </motion.div>
      ))}
    </div>
  )
}

// Main Component
const PrepaidTransactionTable: React.FC<{ pageSize?: number }> = ({ pageSize: propPageSize = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(propPageSize)
  const [showFilters, setShowFilters] = useState(false)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<PrepaidTransaction | null>(null)

  const [localFilters, setLocalFilters] = useState({
    status: "",
    channel: "",
    collectorType: "",
    clearanceStatus: "",
    serviceCenterId: "",
    distributionSubstationId: "",
    injectionSubstationId: "",
    feederId: "",
    prepaidOnly: "",
    paidFromUtc: "",
    paidToUtc: "",
    isMeterActive: "",
    state: "",
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  const dispatch = useAppDispatch()
  const {
    prepaidTransactions,
    prepaidTransactionsPagination: pagination,
    prepaidTransactionsLoading: loading,
  } = useAppSelector((state) => state.meters)
  const { serviceStations } = useAppSelector((state) => state.serviceStations)
  const { distributionSubstations } = useAppSelector((state) => state.distributionSubstations)

  useEffect(() => {
    const params: PrepaidTransactionParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
    }

    // Add all filters to params
    if (localFilters.status) params.status = localFilters.status as any
    if (localFilters.channel) params.channel = localFilters.channel as any
    if (localFilters.collectorType) params.collectorType = localFilters.collectorType as any
    if (localFilters.clearanceStatus) params.clearanceStatus = localFilters.clearanceStatus as any
    if (localFilters.serviceCenterId) params.serviceCenterId = parseInt(localFilters.serviceCenterId)
    if (localFilters.distributionSubstationId)
      params.distributionSubstationId = parseInt(localFilters.distributionSubstationId)
    if (localFilters.injectionSubstationId) params.injectionSubstationId = parseInt(localFilters.injectionSubstationId)
    if (localFilters.feederId) params.feederId = parseInt(localFilters.feederId)
    if (localFilters.prepaidOnly) params.prepaidOnly = localFilters.prepaidOnly === "true"
    if (localFilters.paidFromUtc) params.paidFromUtc = localFilters.paidFromUtc
    if (localFilters.paidToUtc) params.paidToUtc = localFilters.paidToUtc
    if (localFilters.isMeterActive) params.isMeterActive = localFilters.isMeterActive === "true"
    if (localFilters.sortBy) {
      params.sortBy = localFilters.sortBy
      params.sortOrder = localFilters.sortOrder
    }

    dispatch(fetchPrepaidTransactions(params))
  }, [dispatch, currentPage, pageSize, localFilters])

  useEffect(() => {
    if (!serviceStations.length) {
      dispatch(fetchServiceStations({ pageNumber: 1, pageSize: 100 }))
    }
    if (!distributionSubstations.length) {
      dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 100 }))
    }
  }, [dispatch, serviceStations.length, distributionSubstations.length])

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSortChange = (option: any) => {
    setLocalFilters((prev) => ({ ...prev, sortBy: option.value, sortOrder: option.order }))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setLocalFilters({
      status: "",
      channel: "",
      collectorType: "",
      clearanceStatus: "",
      serviceCenterId: "",
      distributionSubstationId: "",
      injectionSubstationId: "",
      feederId: "",
      prepaidOnly: "",
      paidFromUtc: "",
      paidToUtc: "",
      isMeterActive: "",
      state: "",
      sortBy: "",
      sortOrder: "asc",
    })
    setCurrentPage(1)
  }

  const getActiveFilterCount = () => {
    return Object.keys(localFilters).filter(
      (key) => key !== "sortOrder" && localFilters[key as keyof typeof localFilters]
    ).length
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      Pending: "yellow",
      Confirmed: "green",
      Failed: "red",
      Reversed: "gray",
    }
    return colors[status] || "gray"
  }

  const getChannelColor = (channel: string) => {
    const colors: { [key: string]: string } = {
      Cash: "blue",
      BankTransfer: "purple",
      Pos: "yellow",
      Card: "red",
      VendorWallet: "green",
      Chaque: "orange",
    }
    return colors[channel] || "gray"
  }

  const getCollectorColor = (collectorType: string) => {
    const colors: { [key: string]: string } = {
      Customer: "blue",
      SalesRep: "green",
      Vendor: "purple",
      Staff: "orange",
    }
    return colors[collectorType] || "gray"
  }

  const totalPages = Math.ceil((pagination?.totalCount || 0) / pageSize)

  return (
    <>
      <div className="space-y-3">
        {/* Header - Compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs hover:bg-gray-50"
            >
              <Filter className="size-3.5" />
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="ml-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-[8px] text-white">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
            <h2 className="text-sm font-medium text-gray-700">Prepaid Transactions</h2>
          </div>

          {getActiveFilterCount() > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              title="Clear all filters"
            >
              <X className="size-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {/* Active Filters Bar */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-md bg-gray-50 p-2">
            <span className="text-[10px] font-medium text-gray-500">Active filters:</span>
            {localFilters.status && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] text-yellow-700">
                Status: {localFilters.status}
              </span>
            )}
            {localFilters.channel && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
                Channel: {localFilters.channel}
              </span>
            )}
            {localFilters.collectorType && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] text-purple-700">
                Collector: {localFilters.collectorType}
              </span>
            )}
            {localFilters.clearanceStatus && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
                Clearance: {localFilters.clearanceStatus}
              </span>
            )}
            {localFilters.serviceCenterId && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">Service Center</span>
            )}
            {localFilters.paidFromUtc && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                From: {new Date(localFilters.paidFromUtc).toLocaleDateString()}
              </span>
            )}
            {localFilters.paidToUtc && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                To: {new Date(localFilters.paidToUtc).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Table - Compact Card View for Mobile, Table for Desktop */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {loading && prepaidTransactions.length === 0 ? (
            <CompactLoadingSkeleton />
          ) : prepaidTransactions.length === 0 ? (
            <div className="flex items-center justify-center">
              <EmptySearchState title="No transactions found" className="py-6" />
            </div>
          ) : (
            <>
              {/* Mobile Card View (hidden on desktop) */}
              <div className="block divide-y divide-gray-100 lg:hidden">
                {prepaidTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-900">{transaction.reference}</span>
                          <CompactBadge color={getStatusColor(transaction.status)}>{transaction.status}</CompactBadge>
                        </div>
                        <p className="mt-1 text-xs text-gray-600">{transaction.customerName}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                          <span>{new Date(transaction.paidAtUtc).toLocaleDateString()}</span>
                          <span className="font-medium text-gray-900">₦{formatCurrency(transaction.amount)}</span>
                          <CompactBadge color={getChannelColor(transaction.channel)}>
                            {transaction.channel}
                          </CompactBadge>
                          <CompactBadge color={getCollectorColor(transaction.collectorType)}>
                            {transaction.collectorType}
                          </CompactBadge>
                        </div>
                      </div>
                      <CompactActionDropdown
                        transaction={transaction}
                        onViewDetails={(t) => {
                          setExpandedRow(expandedRow === t.id ? null : t.id)
                          setSelectedTransaction(t)
                        }}
                      />
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedRow === transaction.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 border-t pt-3 text-xs"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] text-gray-500">Amount Applied</p>
                              <p className="text-xs font-medium">₦{formatCurrency(transaction.amountApplied)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">VAT</p>
                              <p className="text-xs font-medium">₦{formatCurrency(transaction.vatAmount)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Clearance Status</p>
                              <p className="text-xs">{transaction.clearanceStatus || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Confirmed At</p>
                              <p className="text-xs">
                                {transaction.confirmedAtUtc
                                  ? new Date(transaction.confirmedAtUtc).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              onClick={() => setShowReceiptModal(true)}
                              className="rounded-md bg-blue-50 px-3 py-1.5 text-[10px] font-medium text-blue-700 hover:bg-blue-100"
                            >
                              View Receipt
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (hidden on mobile) */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Reference
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Channel
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Collector
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Clearance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-sm">
                    {prepaidTransactions.map((transaction) => (
                      <React.Fragment key={transaction.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{transaction.reference}</td>
                          <td className="px-4 py-3">{transaction.customerName}</td>
                          <td className="px-4 py-3 font-medium">₦{formatCurrency(transaction.amount)}</td>
                          <td className="px-4 py-3">
                            <CompactBadge color={getChannelColor(transaction.channel)}>
                              {transaction.channel}
                            </CompactBadge>
                          </td>
                          <td className="px-4 py-3">
                            <CompactBadge color={getStatusColor(transaction.status)}>{transaction.status}</CompactBadge>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(transaction.paidAtUtc).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <CompactBadge color={getCollectorColor(transaction.collectorType)}>
                              {transaction.collectorType}
                            </CompactBadge>
                          </td>
                          <td className="px-4 py-3">
                            {transaction.clearanceStatus ? (
                              <CompactBadge color={transaction.clearanceStatus === "Cleared" ? "green" : "yellow"}>
                                {transaction.clearanceStatus}
                              </CompactBadge>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setExpandedRow(expandedRow === transaction.id ? null : transaction.id)
                                setSelectedTransaction(transaction)
                              }}
                              className="rounded p-1 hover:bg-gray-100"
                            >
                              {expandedRow === transaction.id ? (
                                <VscChevronUp className="size-4" />
                              ) : (
                                <VscChevronDown className="size-4" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row for Desktop */}
                        <AnimatePresence>
                          {expandedRow === transaction.id && (
                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <td colSpan={9} className="bg-gray-50 p-4">
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-500">Amount Applied</p>
                                    <p className="font-medium">₦{formatCurrency(transaction.amountApplied)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">VAT Amount</p>
                                    <p className="font-medium">₦{formatCurrency(transaction.vatAmount)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Confirmed At</p>
                                    <p className="font-medium">
                                      {transaction.confirmedAtUtc
                                        ? new Date(transaction.confirmedAtUtc).toLocaleString()
                                        : "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Manual Entry</p>
                                    <p className="font-medium">{transaction.isManualEntry ? "Yes" : "No"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Currency</p>
                                    <p className="font-medium">{transaction.currency}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">System Generated</p>
                                    <p className="font-medium">{transaction.isSystemGenerated ? "Yes" : "No"}</p>
                                  </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                  <button
                                    onClick={() => setShowReceiptModal(true)}
                                    className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                  >
                                    View Receipt
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Pagination - Compact */}
        {prepaidTransactions.length > 0 && (
          <div className="flex items-center justify-between text-xs">
            <p className="text-gray-600">
              {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, pagination?.totalCount || 0)} of{" "}
              {pagination?.totalCount || 0}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-50"
              >
                <MdOutlineArrowBackIosNew className="size-3" />
              </button>
              <span className="px-2 py-1 text-gray-700">{currentPage}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-50"
              >
                <MdOutlineArrowForwardIos className="size-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      <CompactFilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        serviceStations={serviceStations}
        distributionSubstations={distributionSubstations}
      />

      {/* Receipt Modal */}
      <TransactionReceiptModal
        isOpen={showReceiptModal}
        onRequestClose={() => setShowReceiptModal(false)}
        transaction={selectedTransaction}
      />
    </>
  )
}

export default PrepaidTransactionTable
