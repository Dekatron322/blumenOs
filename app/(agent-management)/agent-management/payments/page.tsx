"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Filter, SortAsc, SortDesc, X } from "lucide-react"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchAgents, AgentsRequestParams, CollectorType, PaymentChannel, PaymentStatus } from "lib/redux/agentSlice"
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
                <FormSelectModule
                  name="status"
                  value={localFilters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                  options={statusOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
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

export default function PaymentsPage() {
  const dispatch = useAppDispatch()
  const { agents } = useAppSelector((state) => state.agents)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)

  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)

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
    { value: PaymentChannel.Chaque, label: "Cheque" },
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
          <div className="mx-auto w-full px-3 py-8 2xl:container xl:px-16">
            {/* Header and Statistics Container - At the Top */}
                    <motion.div
              className="mb-6 w-full rounded-md border bg-white p-3 md:p-4 lg:p-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Header Section */}
              <div className="mb-4">
                <h4 className="text-2xl font-semibold">Payments</h4>
                <p className="text-sm text-gray-600">Track and manage agent payments</p>
              </div>

              {/* Statistics Cards */}
              <AllPaymentsTable appliedFilters={appliedFilters} showStatisticsOnly />
            </motion.div>

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

              {/* Main Content - Payments Table */}
              <motion.div
                className={
                  showDesktopFilters
                    ? "w-full rounded-md border bg-white p-3 md:p-4 lg:p-6 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
                    : "w-full rounded-md border bg-white p-3 md:p-4 lg:p-6 2xl:flex-1"
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
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
      />
    </section>
  )
}
