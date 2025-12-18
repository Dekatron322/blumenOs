"use client"

import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchPayments, Payment, PaymentsRequestParams } from "lib/redux/paymentSlice"
import { ArrowLeft, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearCustomers, fetchCustomers } from "lib/redux/customerSlice"
import { clearVendors, fetchVendors } from "lib/redux/vendorSlice"
import { clearAgents, fetchAgents } from "lib/redux/agentSlice"
import { clearPaymentTypes, fetchPaymentTypes } from "lib/redux/paymentTypeSlice"

type SortOrder = "asc" | "desc" | null

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

// Skeleton Components
const PaymentCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-3 shadow-sm md:p-4"
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
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="size-8 rounded-full bg-gray-200 md:size-10 lg:size-12"></div>
        <div className="min-w-0 flex-1">
          <div className="h-4 w-24 rounded bg-gray-200 md:h-5 md:w-28 lg:w-32"></div>
          <div className="mt-1 flex flex-wrap gap-1 md:gap-2">
            <div className="mt-1 h-5 w-12 rounded-full bg-gray-200 md:h-6 md:w-14 lg:w-16"></div>
            <div className="mt-1 h-5 w-14 rounded-full bg-gray-200 md:h-6 md:w-16 lg:w-20"></div>
          </div>
        </div>
      </div>
      <div className="size-4 rounded bg-gray-200 md:size-5 lg:size-6"></div>
    </div>

    <div className="mt-3 space-y-1.5 md:mt-4 md:space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="md:w-18 h-3 w-16 rounded bg-gray-200 md:h-4 lg:w-20"></div>
          <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-14 lg:w-16"></div>
        </div>
      ))}
    </div>

    <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
      <div className="h-3 w-full rounded bg-gray-200 md:h-4"></div>
    </div>

    <div className="mt-2 flex gap-2 md:mt-3">
      <div className="h-8 flex-1 rounded bg-gray-200 md:h-9"></div>
    </div>
  </motion.div>
)

const PaymentListItemSkeleton = () => (
  <motion.div
    className="border-b bg-white p-3 md:p-4"
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
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
      <div className="flex items-start gap-2 md:items-center md:gap-4">
        <div className="size-7 flex-shrink-0 rounded-full bg-gray-200 md:size-8 lg:size-10"></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
            <div className="h-4 w-28 rounded bg-gray-200 md:h-5 md:w-32 lg:w-40"></div>
            <div className="flex flex-wrap gap-1 md:gap-2">
              <div className="h-5 w-12 rounded-full bg-gray-200 md:h-6 md:w-14 lg:w-16"></div>
              <div className="h-5 w-14 rounded-full bg-gray-200 md:h-6 md:w-16 lg:w-20"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 md:gap-2 lg:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20 lg:w-24"></div>
            ))}
          </div>
          <div className="mt-2 hidden h-3 w-40 rounded bg-gray-200 md:block md:h-4 lg:w-64"></div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 md:justify-end md:gap-3">
        <div className="hidden text-right md:block">
          <div className="md:w-22 h-3 w-20 rounded bg-gray-200 md:h-4 lg:w-24"></div>
          <div className="md:w-18 mt-1 h-3 w-16 rounded bg-gray-200 md:h-4 lg:w-20"></div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-14 rounded bg-gray-200 md:h-8 md:w-16 lg:h-9 lg:w-20"></div>
          <div className="size-4 rounded bg-gray-200 md:size-5 lg:size-6"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const StatCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-2.5 md:p-3"
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="h-4 w-10 rounded bg-gray-200 md:h-5 md:w-12"></div>
        <div className="md:w-18 h-4 w-16 rounded bg-gray-200 md:h-5 lg:w-20"></div>
      </div>
      <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-14 lg:w-16"></div>
    </div>
    <div className="mt-2 space-y-1 md:mt-3">
      <div className="flex justify-between">
        <div className="md:w-18 h-3 w-16 rounded bg-gray-200 md:h-4 lg:w-20"></div>
        <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-14 lg:w-16"></div>
      </div>
    </div>
  </motion.div>
)

const PaginationSkeleton = () => (
  <motion.div
    className="mt-4 flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0"
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
    <div className="order-2 flex items-center gap-2 md:order-1">
      <div className="hidden h-4 w-12 rounded bg-gray-200 md:block md:w-16"></div>
      <div className="h-7 w-12 rounded bg-gray-200 md:h-8 md:w-14 lg:w-16"></div>
    </div>

    <div className="order-1 flex items-center gap-2 md:order-2 md:gap-3">
      <div className="size-6 rounded bg-gray-200 md:size-7 lg:size-8"></div>
      <div className="flex gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="size-5 rounded bg-gray-200 md:size-6 lg:size-7"></div>
        ))}
      </div>
      <div className="size-6 rounded bg-gray-200 md:size-7 lg:size-8"></div>
    </div>

    <div className="order-3 hidden h-4 w-20 rounded bg-gray-200 md:block lg:w-24"></div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <motion.div
    className="flex flex-col py-2"
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
    <div className="h-7 w-28 rounded bg-gray-200 md:h-8 md:w-32 lg:w-40"></div>
    <div className="mt-2 flex flex-col gap-3 md:mt-3 md:flex-row md:gap-4">
      <div className="h-9 w-full rounded bg-gray-200 md:h-10 md:w-64 lg:w-80"></div>
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-16 rounded bg-gray-200 md:h-10 md:w-20 lg:w-24"></div>
        ))}
      </div>
    </div>
  </motion.div>
)

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
            className="flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b pb-3">
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

            {/* Filter Content */}
            <div className="space-y-4 pb-20">
              {/* Customer Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
                <FormSelectModule
                  name="customerId"
                  value={localFilters.customerId || ""}
                  onChange={(e) => handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)}
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
                  onChange={(e) => handleFilterChange("vendorId", e.target.value ? Number(e.target.value) : undefined)}
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
                  onChange={(e) => handleFilterChange("agentId", e.target.value ? Number(e.target.value) : undefined)}
                  options={agentOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Payment Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Type</label>
                <FormSelectModule
                  name="paymentTypeId"
                  value={localFilters.paymentTypeId || ""}
                  onChange={(e) =>
                    handleFilterChange("paymentTypeId", e.target.value ? Number(e.target.value) : undefined)
                  }
                  options={paymentTypeOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Area Office Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                <FormSelectModule
                  name="areaOfficeId"
                  value={localFilters.areaOfficeId || ""}
                  onChange={(e) =>
                    handleFilterChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)
                  }
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
                  value={localFilters.channel || ""}
                  onChange={(e) => handleFilterChange("channel", e.target.value || undefined)}
                  options={channelOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <FormSelectModule
                  name="status"
                  value={localFilters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                  options={statusOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Collector Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Collector Type</label>
                <FormSelectModule
                  name="collectorType"
                  value={localFilters.collectorType || ""}
                  onChange={(e) => handleFilterChange("collectorType", e.target.value || undefined)}
                  options={collectorTypeOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Date Range Filters */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Paid From</label>
                <input
                  type="date"
                  value={localFilters.paidFromUtc || ""}
                  onChange={(e) => handleFilterChange("paidFromUtc", e.target.value || undefined)}
                  className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Paid To</label>
                <input
                  type="date"
                  value={localFilters.paidToUtc || ""}
                  onChange={(e) => handleFilterChange("paidToUtc", e.target.value || undefined)}
                  className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Sort By</label>
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
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="sticky bottom-0 border-t bg-white p-4 shadow-xl 2xl:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
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

const RecentPayments = () => {
  const dispatch = useAppDispatch()
  const { payments, loading, error, pagination } = useAppSelector((state) => state.payments)
  const { customers } = useAppSelector((state) => state.customers)
  const { vendors } = useAppSelector((state) => state.vendors)
  const { agents } = useAppSelector((state) => state.agents)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)

  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const router = useRouter()

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    paymentTypeId: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    channel: undefined as "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | undefined,
    status: undefined as "Pending" | "Confirmed" | "Failed" | "Reversed" | undefined,
    collectorType: undefined as "Customer" | "Agent" | "Vendor" | "Staff" | undefined,
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
    channel: undefined as "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | undefined,
    status: undefined as "Pending" | "Confirmed" | "Failed" | "Reversed" | undefined,
    collectorType: undefined as "Customer" | "Agent" | "Vendor" | "Staff" | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  const pageSize = pagination.pageSize || 6

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

  // Filter handlers
  const handleFilterChange = (key: string, value: string | number | undefined) => {
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

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-root="payment-actions"]')) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "Pending":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "Failed":
      case "Reversed":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#F2F2F2", color: "#666666" }
    }
  }

  const getPaymentMethodStyle = (method: string) => {
    switch (method) {
      case "Bank Transfer":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "POS Agent":
        return { backgroundColor: "#F4EDF7", color: "#954BAF" }
      case "Card Payment":
        return { backgroundColor: "#F0F7ED", color: "#4BAF5E" }
      case "Cash":
        return { backgroundColor: "#FEF7ED", color: "#F4A261" }
      default:
        return { backgroundColor: "#F2F2F2", color: "#666666" }
    }
  }

  const dotStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return { backgroundColor: "#589E67" }
      case "Pending":
        return { backgroundColor: "#D28E3D" }
      case "Failed":
      case "Reversed":
        return { backgroundColor: "#AF4B4B" }
      default:
        return { backgroundColor: "#666666" }
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      fetchPayments({
        pageNumber: 1,
        pageSize: newPageSize,
        search: searchText || undefined,
        ...appliedFilters,
      })
    )
    setCurrentPage(1)
  }

  const totalPages = pagination.totalPages || 1
  const totalRecords = pagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleViewDetails = (payment: Payment) => {
    router.push(`/payment/payment-detail/${payment.id}`)
  }

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-3 shadow-sm transition-all hover:shadow-md md:p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 md:size-10 lg:size-12">
            <span className="text-xs font-semibold text-blue-600 md:text-sm">
              {payment.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 md:text-base">{payment.customerName}</h3>
            <div className="mt-1 flex items-center gap-1 md:gap-2">
              <div
                style={getStatusStyle(payment.status)}
                className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs md:px-2 md:py-1"
              >
                <span className="size-1.5 rounded-full md:size-2" style={dotStyle(payment.status)}></span>
                {payment.status.toUpperCase()}
              </div>
              <div
                style={getPaymentMethodStyle(payment.channel)}
                className="rounded-full px-1.5 py-0.5 text-xs md:px-2 md:py-1"
              >
                {payment.channel}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-gray-600 md:mt-4 md:text-sm">
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-medium">{formatCurrency(payment.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Account:</span>
          <span className="font-medium">{payment.customerAccountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Reference:</span>
          <span className="font-medium">{payment.reference}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span className="font-medium">
            {payment.paidAtUtc ? new Date(payment.paidAtUtc).toLocaleDateString() : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Payment ID:</span>
          <div className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium md:px-2 md:py-1">{payment.id}</div>
        </div>
      </div>

      <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
        <p className="text-xs text-gray-500">{payment.externalReference || "No external reference"}</p>
      </div>

      <div className="mt-2 flex gap-1.5 md:mt-3">
        <button
          onClick={() => handleViewDetails(payment)}
          className="button-oulined flex flex-1 items-center justify-center gap-1.5 bg-white text-xs transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9] md:text-sm"
        >
          <VscEye className="size-3 md:size-4" />
          View Details
        </button>
      </div>
    </div>
  )

  const PaymentListItem = ({ payment }: { payment: Payment }) => (
    <div className="border-b bg-white p-3 transition-all hover:bg-gray-50 md:p-4">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex items-start gap-2 md:items-center md:gap-4">
          <div className="flex size-7 items-center justify-center rounded-full bg-blue-100 md:size-8 lg:size-10">
            <span className="text-xs font-semibold text-blue-600 md:text-sm">
              {payment.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
              <h3 className="truncate text-sm font-semibold text-gray-900 md:text-base">{payment.customerName}</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <div
                  style={getStatusStyle(payment.status)}
                  className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs md:px-2 md:py-1"
                >
                  <span className="size-1.5 rounded-full md:size-2" style={dotStyle(payment.status)}></span>
                  {payment.status.toUpperCase()}
                </div>
                <div
                  style={getPaymentMethodStyle(payment.channel)}
                  className="rounded-full px-1.5 py-0.5 text-xs md:px-2 md:py-1"
                >
                  {payment.channel}
                </div>
                <div className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium md:px-2 md:py-1">
                  ID: {payment.id}
                </div>
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-600 md:mt-2 md:gap-2.5 md:text-sm lg:gap-4">
              <span>
                <strong>Amount:</strong> {formatCurrency(payment.amount)}
              </span>
              <span>
                <strong>Account:</strong> {payment.customerAccountNumber}
              </span>
              <span>
                <strong>Reference:</strong> {payment.reference}
              </span>
              <span>
                <strong>Date:</strong> {payment.paidAtUtc ? new Date(payment.paidAtUtc).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 md:mt-2 md:text-sm">
              {payment.externalReference || "No external reference"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1.5 md:gap-3">
          <div className="hidden text-right text-xs md:block md:text-sm">
            <div className="font-medium text-gray-900">{payment.customerAccountNumber}</div>
            <div className={`mt-0.5 text-xs ${payment.status === "Pending" ? "text-amber-600" : "text-gray-500"}`}>
              {payment.status === "Pending" ? "Awaiting Confirmation" : "Processed"}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleViewDetails(payment)}
              className="button-oulined flex items-center gap-1.5 text-xs md:text-sm"
            >
              <VscEye className="size-3 md:size-4" />
              <span className="hidden md:inline">View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const StatCard = ({
    title,
    value,
    subtitle,
    color = "blue",
  }: {
    title: string
    value: string
    subtitle: string
    color?: string
  }) => (
    <div className="rounded-lg border bg-[#f9f9f9] p-2.5 transition-all hover:shadow-sm md:p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-gray-900 md:text-base">{title}</h3>
        </div>
        <div className="flex text-sm">
          <span className="font-medium">{value}</span>
        </div>
      </div>
      <div className="mt-2 space-y-1 md:mt-3">
        <div className="flex justify-between text-xs md:text-sm">
          <span className="text-gray-600">{subtitle}</span>
        </div>
      </div>
    </div>
  )

  const getPageItems = (): (number | string)[] => {
    const total = totalPages
    const current = currentPage
    const items: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    items.push(1)
    const showLeftEllipsis = current > 4
    const showRightEllipsis = current < total - 3

    if (!showLeftEllipsis) {
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      items.push("...", total - 3, total - 2, total - 1)
    } else {
      items.push("...", current - 1, current, current + 1, "...")
    }

    if (!items.includes(total)) {
      items.push(total)
    }

    return items
  }

  const getMobilePageItems = (): (number | string)[] => {
    const total = totalPages
    const current = currentPage
    const items: (number | string)[] = []

    if (total <= 4) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    if (current <= 3) {
      items.push(1, 2, 3, "...", total)
      return items
    }

    if (current > 3 && current < total - 2) {
      items.push(1, "...", current, "...", total)
      return items
    }

    items.push(1, "...", total - 2, total - 1, total)
    return items
  }

  if (loading) {
    return (
      <div className="flex-3 relative mt-5 flex flex-col items-start gap-4 lg:flex-row lg:gap-6">
        {/* Main Content Skeleton */}
        <div className="w-full rounded-md border bg-white p-3 md:p-4 lg:p-5">
          <HeaderSkeleton />

          {/* Payment Display Area Skeleton */}
          <div className="w-full">
            {viewMode === "grid" ? (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4 md:gap-4 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <PaymentCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="mt-3 divide-y md:mt-4">
                {[...Array(5)].map((_, index) => (
                  <PaymentListItemSkeleton key={index} />
                ))}
              </div>
            )}
          </div>

          <PaginationSkeleton />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row-reverse">
        {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
        {showDesktopFilters && (
          <motion.div
            key="desktop-filters-sidebar"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="hidden w-full rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:block 2xl:w-80"
          >
            <div className="mb-4 flex items-center justify-between border-b pb-3 md:pb-4">
              <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters & Sorting</h2>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
              >
                <X className="size-3 md:size-4" />
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
                <FormSelectModule
                  name="customerId"
                  value={localFilters.customerId || ""}
                  onChange={(e) =>
                    handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                  }
                  options={customerOptions}
                  className="w-full"
                />
              </div>

              {/* Vendor Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Vendor</label>
                <FormSelectModule
                  name="vendorId"
                  value={localFilters.vendorId || ""}
                  onChange={(e) => handleFilterChange("vendorId", e.target.value ? Number(e.target.value) : undefined)}
                  options={vendorOptions}
                  className="w-full"
                />
              </div>

              {/* Agent Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Agent</label>
                <FormSelectModule
                  name="agentId"
                  value={localFilters.agentId || ""}
                  onChange={(e) => handleFilterChange("agentId", e.target.value ? Number(e.target.value) : undefined)}
                  options={agentOptions}
                  className="w-full"
                />
              </div>

              {/* Payment Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Type</label>
                <FormSelectModule
                  name="paymentTypeId"
                  value={localFilters.paymentTypeId || ""}
                  onChange={(e) =>
                    handleFilterChange("paymentTypeId", e.target.value ? Number(e.target.value) : undefined)
                  }
                  options={paymentTypeOptions}
                  className="w-full"
                />
              </div>

              {/* Area Office Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                <FormSelectModule
                  name="areaOfficeId"
                  value={localFilters.areaOfficeId || ""}
                  onChange={(e) =>
                    handleFilterChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)
                  }
                  options={areaOfficeOptions}
                  className="w-full"
                />
              </div>

              {/* Channel Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Channel</label>
                <FormSelectModule
                  name="channel"
                  value={localFilters.channel || ""}
                  onChange={(e) => handleFilterChange("channel", e.target.value || undefined)}
                  options={channelOptions}
                  className="w-full"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <FormSelectModule
                  name="status"
                  value={localFilters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                  options={statusOptions}
                  className="w-full"
                />
              </div>

              {/* Collector Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Collector Type</label>
                <FormSelectModule
                  name="collectorType"
                  value={localFilters.collectorType || ""}
                  onChange={(e) => handleFilterChange("collectorType", e.target.value || undefined)}
                  options={collectorTypeOptions}
                  className="w-full"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Sort By</label>
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
              </div>

              {/* Apply Filters Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content - Payments List/Grid */}
        <motion.div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-3 md:p-4 lg:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-4 lg:p-5 2xl:flex-1"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col py-1 md:py-2">
            <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
              <div className="flex items-center gap-3">
                {/* Filter Button for ALL screens up to 2xl */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 2xl:hidden"
                >
                  <Filter className="size-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
                <p className="text-lg font-medium md:text-xl lg:text-2xl">Recent Payments</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Hide/Show Filters button - Desktop only (2xl and above) */}
                <button
                  type="button"
                  onClick={() => setShowDesktopFilters((prev) => !prev)}
                  className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
                >
                  {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                  {showDesktopFilters ? "Hide filters" : "Show filters"}
                </button>
                <button
                  className="button-oulined flex items-center gap-1.5 border-[#2563EB] bg-[#DBEAFE] px-2 py-1.5 text-xs hover:border-[#2563EB] hover:bg-[#DBEAFE] md:gap-2 md:px-3 md:py-2 md:text-sm"
                  onClick={() => {
                    /* Export functionality */
                  }}
                  disabled={!payments || payments.length === 0}
                >
                  <ExportCsvIcon color="#2563EB" size={16} className="md:size-5" />
                  <p className="text-xs text-[#2563EB] md:text-sm">Export CSV</p>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="flex-1">
                <SearchModule
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onCancel={handleCancelSearch}
                  placeholder="Search by customer, account, or reference"
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-2.5">
                <div className="flex gap-1.5">
                  <button
                    className={`button-oulined px-2 py-1.5 text-xs md:px-3 md:py-2 md:text-sm ${
                      viewMode === "grid" ? "bg-[#f9f9f9]" : ""
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <MdGridView className="size-3.5 md:size-4 lg:size-5" />
                    <p className="text-xs md:text-sm">Grid</p>
                  </button>
                  <button
                    className={`button-oulined px-2 py-1.5 text-xs md:px-3 md:py-2 md:text-sm ${
                      viewMode === "list" ? "bg-[#f9f9f9]" : ""
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <MdFormatListBulleted className="size-3.5 md:size-4 lg:size-5" />
                    <p className="text-xs md:text-sm">List</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Display Area */}
          <div className="w-full">
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 md:py-8">
                <div className="text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-gray-100 md:size-12">
                    <VscEye className="size-5 text-gray-400 md:size-6" />
                  </div>
                  <h3 className="mt-3 text-base font-medium text-gray-900 md:mt-4 md:text-lg">No payments found</h3>
                  <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm">
                    {searchText || getActiveFilterCount() > 0
                      ? "Try adjusting your search criteria or filters"
                      : "No payments available"}
                  </p>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4 md:gap-4 lg:grid-cols-3">
                {payments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>
            ) : (
              <div className="mt-3 divide-y md:mt-4">
                {payments.map((payment) => (
                  <PaymentListItem key={payment.id} payment={payment} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {payments.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0">
            <div className="order-2 flex items-center gap-1.5 md:order-1">
              <p className="text-xs md:text-sm">Show rows</p>
              <select
                value={pagination.pageSize || 6}
                onChange={handleRowsChange}
                className="bg-[#F2F2F2] p-1 text-xs md:text-sm"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={24}>24</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="order-1 flex items-center gap-2 md:order-2 md:gap-3">
              <button
                className={`px-2 py-1 md:px-3 md:py-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <BiSolidLeftArrow className="size-3.5 md:size-4 lg:size-5" />
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                {/* Desktop pagination */}
                <div className="hidden items-center gap-1 md:flex md:gap-2">
                  {getPageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex size-6 items-center justify-center rounded-md text-xs md:h-7 md:w-7 md:text-sm lg:h-[27px] lg:w-[30px] ${
                          currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => changePage(item)}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-gray-500">
                        {item}
                      </span>
                    )
                  )}
                </div>

                {/* Mobile pagination */}
                <div className="flex items-center gap-1 md:hidden">
                  {getMobilePageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex size-6 items-center justify-center rounded-md text-xs ${
                          currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => changePage(item)}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-xs text-gray-500">
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>

              <button
                className={`px-2 py-1 md:px-3 md:py-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <BiSolidRightArrow className="size-3.5 md:size-4 lg:size-5" />
              </button>
            </div>

            <p className="order-3 text-xs max-sm:hidden md:text-sm lg:text-base">
              Page {currentPage} of {totalPages} ({totalRecords} total records
              {getActiveFilterCount() > 0 && " - filtered"})
            </p>
          </div>
        )}
        </motion.div>
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
      />
    </>
  )
}

export default RecentPayments
