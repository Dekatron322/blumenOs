"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { AgentsRequestParams, CollectorType, fetchAgents, PaymentChannel, PaymentStatus } from "lib/redux/agentSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearPaymentTypes, fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import AllPaymentsTable from "components/Tables/AllPaymentsTable"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
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
  agentOptions,
  statusOptions,
  channelOptions,
  collectorTypeOptions,
  paymentTypeOptions,
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
  agentOptions: Array<{ value: string | number; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  channelOptions: Array<{ value: string; label: string }>
  collectorTypeOptions: Array<{ value: string; label: string }>
  paymentTypeOptions: Array<{ value: string | number; label: string }>
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
}) => {
  return (
    <AnimatePresence>
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
            className="flex h-full w-full max-w-sm flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-shrink-0 border-b bg-white p-4">
              <div className="flex items-center justify-between">
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
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 md:text-sm"
                >
                  <X className="size-3 md:size-4" />
                  Clear All
                </button>
              </div>
            </div>

            {/* Filter Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
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

                {/* Channel Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Channel</label>
                  <FormSelectModule
                    name="channel"
                    value={localFilters.channel || ""}
                    onChange={(e) => handleFilterChange("channel", e.target.value || undefined)}
                    options={channelOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
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

            {/* Bottom Action Buttons - Fixed */}
            <div className="flex-shrink-0 border-t bg-white p-4 2xl:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="button-filled flex-1"
                >
                  <Filter className="size-4" />
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="button-oulined flex-1"
                >
                  <X className="size-4" />
                  Reset All
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function PaymentsPage() {
  const dispatch = useAppDispatch()
  const { agents } = useAppSelector((state) => state.agents)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)

  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    agentId: undefined as number | undefined,
    status: undefined as string | undefined,
    channel: undefined as string | undefined,
    collectorType: undefined as string | undefined,
    paymentTypeId: undefined as number | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    agentId: undefined as number | undefined,
    status: undefined as PaymentStatus | undefined,
    channel: undefined as PaymentChannel | undefined,
    collectorType: undefined as CollectorType | undefined,
    paymentTypeId: undefined as number | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  // Fetch agents, area offices, and payment types for filter options
  useEffect(() => {
    dispatch(
      fetchAgents({
        pageNumber: 1,
        pageSize: 100,
      } as AgentsRequestParams)
    )

    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )

    dispatch(fetchPaymentTypes())

    return () => {
      dispatch(clearAreaOffices())
      dispatch(clearPaymentTypes())
    }
  }, [dispatch])

  // Filter options
  const agentOptions = [
    { value: "", label: "All Agents" },
    ...agents.map((agent) => ({
      value: agent.id,
      label: agent.user.fullName,
    })),
  ]

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: PaymentStatus.Pending, label: "Pending" },
    { value: PaymentStatus.Confirmed, label: "Confirmed" },
    { value: PaymentStatus.Failed, label: "Failed" },
    { value: PaymentStatus.Reversed, label: "Reversed" },
  ]

  const channelOptions = [
    { value: "", label: "All Channels" },
    { value: PaymentChannel.Cash, label: "Cash" },
    { value: PaymentChannel.BankTransfer, label: "Bank Transfer" },
    { value: PaymentChannel.Pos, label: "POS" },
    { value: PaymentChannel.Card, label: "Card" },
    { value: PaymentChannel.VendorWallet, label: "Vendor Wallet" },
    { value: PaymentChannel.Cheque, label: "Cheque" },
  ]

  const collectorTypeOptions = [
    { value: "", label: "All Collectors" },
    { value: CollectorType.Customer, label: "Customer" },
    { value: CollectorType.SalesRep, label: "Sales Rep" },
    { value: CollectorType.Vendor, label: "Vendor" },
    { value: CollectorType.Staff, label: "Staff" },
  ]

  const paymentTypeOptions = [
    { value: "", label: "All Payment Types" },
    ...paymentTypes.map((type) => ({
      value: type.id,
      label: type.name,
    })),
  ]

  const sortOptions: SortOption[] = [
    { label: "Amount (Low to High)", value: "amount", order: "asc" },
    { label: "Amount (High to Low)", value: "amount", order: "desc" },
    { label: "Paid At (Oldest First)", value: "paidAtUtc", order: "asc" },
    { label: "Paid At (Newest First)", value: "paidAtUtc", order: "desc" },
    { label: "Reference (A-Z)", value: "reference", order: "asc" },
    { label: "Reference (Z-A)", value: "reference", order: "desc" },
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
      agentId: localFilters.agentId,
      status: localFilters.status as PaymentStatus | undefined,
      channel: localFilters.channel as PaymentChannel | undefined,
      collectorType: localFilters.collectorType as CollectorType | undefined,
      paymentTypeId: localFilters.paymentTypeId,
      paidFromUtc: localFilters.paidFromUtc,
      paidToUtc: localFilters.paidToUtc,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortBy ? localFilters.sortOrder : undefined,
    })
  }

  const resetFilters = () => {
    setLocalFilters({
      agentId: undefined,
      status: undefined,
      channel: undefined,
      collectorType: undefined,
      paymentTypeId: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({
      agentId: undefined,
      status: undefined,
      channel: undefined,
      collectorType: undefined,
      paymentTypeId: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.agentId) count++
    if (appliedFilters.status) count++
    if (appliedFilters.channel) count++
    if (appliedFilters.collectorType) count++
    if (appliedFilters.paymentTypeId) count++
    if (appliedFilters.paidFromUtc) count++
    if (appliedFilters.paidToUtc) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-8">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-3 py-4 2xl:container sm:px-4 lg:px-6 2xl:px-16">
            {/* Hero Header Section */}
            <motion.div
              className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-[#004B23] to-[#006B33] p-4 shadow-lg md:p-6 lg:p-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/20" />
                <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-white/10" />
                <div className="absolute right-1/4 top-1/2 size-20 rounded-full bg-white/10" />
              </div>

              {/* Header Content */}
              <div className="relative z-10">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white md:text-3xl">Payments Overview</h1>
                    <p className="mt-1 text-sm text-white/80 md:text-base">Track and manage all payment transactions</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <span className="flex size-2 animate-pulse rounded-full bg-emerald-400" />
                    Live data
                  </div>
                </div>

                {/* Statistics Cards */}
                <AllPaymentsTable appliedFilters={appliedFilters} showStatisticsOnly />
              </div>
            </motion.div>

            <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
              {/* Main Content */}
              <motion.div
                className={
                  showDesktopFilters
                    ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
                    : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
                }
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AllPaymentsTable
                  appliedFilters={appliedFilters}
                  showMobileFilters={showMobileFilters}
                  setShowMobileFilters={setShowMobileFilters}
                  showDesktopFilters={showDesktopFilters}
                  setShowDesktopFilters={setShowDesktopFilters}
                  getActiveFilterCount={getActiveFilterCount}
                />
              </motion.div>

              {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
              {showDesktopFilters && (
                <motion.div
                  key="desktop-filters-sidebar"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  className="hidden w-full flex-col rounded-md border bg-white 2xl:flex 2xl:w-80 2xl:self-start"
                >
                  {/* Header - Fixed */}
                  <div className="flex-shrink-0 border-b bg-white p-3 md:p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters & Sorting</h2>
                      <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
                      >
                        <X className="size-3 md:size-4" />
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Filter Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-3 md:p-5">
                    <div className="space-y-4">
                      {/* Agent Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Agent</label>
                        <FormSelectModule
                          name="agentId"
                          value={localFilters.agentId || ""}
                          onChange={(e) =>
                            handleFilterChange("agentId", e.target.value ? Number(e.target.value) : undefined)
                          }
                          options={agentOptions}
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

                      {/* Channel Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Channel</label>
                        <FormSelectModule
                          name="channel"
                          value={localFilters.channel || ""}
                          onChange={(e) => handleFilterChange("channel", e.target.value || undefined)}
                          options={channelOptions}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
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

                      {/* Payment Type Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Payment Type
                        </label>
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

                  {/* Action Buttons - Fixed */}
                  <div className="flex-shrink-0 space-y-3 border-t bg-white p-3 md:p-5">
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

                  {/* Summary Stats - Fixed */}
                  <div className="flex-shrink-0 rounded-lg bg-gray-50 p-3 md:p-4">
                    <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
                    <div className="space-y-1 text-xs md:text-sm">
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
        agentOptions={agentOptions}
        statusOptions={statusOptions}
        channelOptions={channelOptions}
        collectorTypeOptions={collectorTypeOptions}
        paymentTypeOptions={paymentTypeOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />
    </section>
  )
}
