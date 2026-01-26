"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Filter, X } from "lucide-react"
import { MdCalendarToday, MdCheck, MdClose, MdCode, MdDevices, MdFilterList, MdPerson } from "react-icons/md"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { AgentsRequestParams, fetchAgents } from "lib/redux/agentSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearPaymentTypes, fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import { fetchRefundSummary, RefundSummaryParams } from "lib/redux/refundSlice"
import { fetchCustomers } from "lib/redux/customerSlice"
import { fetchVendors } from "lib/redux/vendorSlice"
import AllRefundsTable from "components/Tables/AllRefundTable"

// Filter Modal Component
const FilterModal = ({
  isOpen,
  onRequestClose,
  localFilters,
  handleFilterChange,
  applyFilters,
  resetFilters,
  agentOptions,
  channelOptions,
  customerOptions,
  vendorOptions,
}: {
  isOpen: boolean
  onRequestClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  applyFilters: () => void
  resetFilters: () => void
  agentOptions: Array<{ value: string | number; label: string }>
  channelOptions: Array<{ value: string; label: string }>
  customerOptions: Array<{ value: string | number; label: string }>
  vendorOptions: Array<{ value: string | number; label: string }>
}) => {
  const [modalTab, setModalTab] = useState<"filters" | "active">("filters")

  const handleSubmit = () => {
    applyFilters()
    onRequestClose()
  }

  const handleClearAll = () => {
    resetFilters()
    onRequestClose()
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.customerId) count++
    if (localFilters.vendorId) count++
    if (localFilters.agentId) count++
    if (localFilters.channel) count++
    if (localFilters.fromUtc) count++
    if (localFilters.toUtc) count++
    if (localFilters.refundTypeKey) count++
    return count
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onRequestClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-[#004B23] to-[#006B33] px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-sm font-bold text-white">FILTERS</span>
                {getActiveFilterCount() > 0 && (
                  <motion.span
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="size-2 rounded-full bg-white" />
                    {getActiveFilterCount()} Active
                  </motion.span>
                )}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">Filter Refunds</h3>
              <p className="mt-1 text-sm text-white/70">Apply filters to refine refund data</p>
            </div>
            <motion.button
              onClick={onRequestClose}
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MdClose className="text-xl" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1">
            {[
              { id: "filters", label: "Filters", icon: MdFilterList },
              { id: "active", label: "Active Filters", icon: MdCheck },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setModalTab(tab.id as typeof modalTab)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  modalTab === tab.id ? "bg-white text-[#004B23]" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="text-lg" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {modalTab === "filters" && (
              <motion.div
                key="filters"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Customer ID & Vendor ID */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdPerson className="text-[#004B23]" />
                    Entity Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Customer</label>
                      <FormSelectModule
                        name="customerId"
                        value={localFilters.customerId || ""}
                        onChange={(e) =>
                          handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={customerOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Vendor</label>
                      <FormSelectModule
                        name="vendorId"
                        value={localFilters.vendorId || ""}
                        onChange={(e) =>
                          handleFilterChange("vendorId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={vendorOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Agent & Channel */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdDevices className="text-[#004B23]" />
                    Processing Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Agent</label>
                      <FormSelectModule
                        name="agentId"
                        value={localFilters.agentId || ""}
                        onChange={(e) =>
                          handleFilterChange("agentId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={agentOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Channel</label>
                      <FormSelectModule
                        name="channel"
                        value={localFilters.channel || ""}
                        onChange={(e) => handleFilterChange("channel", e.target.value || undefined)}
                        options={channelOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Refund Type */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdCode className="text-[#004B23]" />
                    Type Filters
                  </h4>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Refund Type</label>
                    <input
                      type="text"
                      value={localFilters.refundTypeKey || ""}
                      onChange={(e) => handleFilterChange("refundTypeKey", e.target.value || undefined)}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter refund type"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdCalendarToday className="text-[#004B23]" />
                    Date Range
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">From Date</label>
                      <input
                        type="date"
                        value={localFilters.fromUtc || ""}
                        onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">To Date</label>
                      <input
                        type="date"
                        value={localFilters.toUtc || ""}
                        onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {modalTab === "active" && (
              <motion.div
                key="active"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                    <MdCheck className="text-[#004B23]" />
                    Active Filters
                  </h4>

                  {getActiveFilterCount() === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-200">
                        <MdFilterList className="size-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No active filters</p>
                      <p className="mt-1 text-sm text-gray-400">Apply filters to see them here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {localFilters.customerId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Customer</p>
                            <p className="text-xs text-gray-500">
                              {customerOptions.find((opt) => opt.value === localFilters.customerId)?.label ||
                                localFilters.customerId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("customerId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.vendorId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Vendor</p>
                            <p className="text-xs text-gray-500">
                              {vendorOptions.find((opt) => opt.value === localFilters.vendorId)?.label ||
                                localFilters.vendorId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("vendorId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.agentId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Agent</p>
                            <p className="text-xs text-gray-500">
                              {agentOptions.find((opt) => opt.value === localFilters.agentId)?.label ||
                                localFilters.agentId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("agentId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.channel && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Channel</p>
                            <p className="text-xs text-gray-500">{localFilters.channel}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("channel", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.refundTypeKey && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Refund Type</p>
                            <p className="text-xs text-gray-500">{localFilters.refundTypeKey}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("refundTypeKey", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.fromUtc && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">From Date</p>
                            <p className="text-xs text-gray-500">{localFilters.fromUtc}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("fromUtc", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.toUtc && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">To Date</p>
                            <p className="text-xs text-gray-500">{localFilters.toUtc}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("toUtc", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{getActiveFilterCount()} active filter(s)</p>
            <div className="flex gap-3">
              <motion.button
                onClick={handleClearAll}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear All
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                className="rounded-lg bg-[#004B23] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003318]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply Filters
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  agentOptions,
  channelOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  agentOptions: Array<{ value: string | number; label: string }>
  channelOptions: Array<{ value: string; label: string }>
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
                {/* Customer ID Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer ID</label>
                  <input
                    type="number"
                    value={localFilters.customerId || ""}
                    onChange={(e) =>
                      handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    placeholder="Enter customer ID"
                  />
                </div>

                {/* Vendor ID Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Vendor ID</label>
                  <input
                    type="number"
                    value={localFilters.vendorId || ""}
                    onChange={(e) =>
                      handleFilterChange("vendorId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    placeholder="Enter vendor ID"
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

                {/* Refund Type Key Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Refund Type</label>
                  <input
                    type="text"
                    value={localFilters.refundTypeKey || ""}
                    onChange={(e) => handleFilterChange("refundTypeKey", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    placeholder="Enter refund type key"
                  />
                </div>

                {/* Date Range Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">From Date</label>
                  <input
                    type="date"
                    value={localFilters.fromUtc || ""}
                    onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">To Date</label>
                  <input
                    type="date"
                    value={localFilters.toUtc || ""}
                    onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
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

export default function RefundOverviewPage() {
  const dispatch = useAppDispatch()
  const { agents } = useAppSelector((state) => state.agents)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { refundSummaryData, refundSummaryLoading, refundSummaryError } = useAppSelector((state) => state.refunds)
  const { customers } = useAppSelector((state) => state.customers)
  const { vendors } = useAppSelector((state) => state.vendors)

  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Tab state for refund breakdown sections
  const [activeTab, setActiveTab] = useState("channel")

  // Tab selection function
  const selectTab = (tab: string) => {
    setActiveTab(tab)
  }

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    channel: undefined as
      | "Cash"
      | "BankTransfer"
      | "Pos"
      | "Card"
      | "VendorWallet"
      | "Cheque"
      | "BankDeposit"
      | "Vendor"
      | "Migration"
      | undefined,
    fromUtc: undefined as string | undefined,
    toUtc: undefined as string | undefined,
    refundTypeKey: undefined as string | undefined,
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState<RefundSummaryParams>({})

  // Fetch refund summary data and other options
  useEffect(() => {
    dispatch(fetchRefundSummary(appliedFilters))
  }, [dispatch, appliedFilters])

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

    // Fetch customers and vendors for filter options
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

  const channelOptions = [
    { value: "", label: "All Channels" },
    { value: "Cash", label: "Cash" },
    { value: "BankTransfer", label: "Bank Transfer" },
    { value: "Pos", label: "POS" },
    { value: "Card", label: "Card" },
    { value: "VendorWallet", label: "Vendor Wallet" },
    { value: "Cheque", label: "Cheque" },
    { value: "BankDeposit", label: "Bank Deposit" },
    { value: "Vendor", label: "Vendor" },
    { value: "Migration", label: "Migration" },
  ]

  // Filter handlers
  const applyFilters = () => {
    // Convert date strings to ISO format with time components
    const formatFromUtc = (dateString: string | undefined) => {
      if (!dateString) return undefined
      return `${dateString}T00:00:00.000Z`
    }

    const formatToUtc = (dateString: string | undefined) => {
      if (!dateString) return undefined
      return `${dateString}T22:59:59.999Z`
    }

    setAppliedFilters({
      CustomerId: localFilters.customerId,
      VendorId: localFilters.vendorId,
      AgentId: localFilters.agentId,
      Channel: localFilters.channel || undefined,
      FromUtc: formatFromUtc(localFilters.fromUtc),
      ToUtc: formatToUtc(localFilters.toUtc),
      RefundTypeKey: localFilters.refundTypeKey,
    })
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  const resetFilters = () => {
    setLocalFilters({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      channel: undefined,
      fromUtc: undefined,
      toUtc: undefined,
      refundTypeKey: undefined,
    })
    setAppliedFilters({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.CustomerId) count++
    if (appliedFilters.VendorId) count++
    if (appliedFilters.AgentId) count++
    if (appliedFilters.Channel) count++
    if (appliedFilters.FromUtc) count++
    if (appliedFilters.ToUtc) count++
    if (appliedFilters.RefundTypeKey) count++
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
                    <h1 className="text-2xl font-bold text-white md:text-3xl">Refund Overview</h1>
                    <p className="mt-1 text-sm text-white/80 md:text-base">Track and manage all refund transactions</p>
                  </div>
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    <Filter className="size-4" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>
                </div>

                {/* Filter Button */}

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                  {/* Total Refunds Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/5 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
                          <span className="text-sm">🔄</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Total Refunds</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {refundSummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : refundSummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          refundSummaryData?.totalCount?.toLocaleString() || "0"
                        )}
                      </p>
                      <p className="mt-1 text-xs text-white/60">transactions</p>
                    </div>
                  </div>

                  {/* Total Amount Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-emerald-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/20">
                          <span className="text-sm text-emerald-300">₦</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Total Amount</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {refundSummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : refundSummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(refundSummaryData?.totalAmount || 0)
                        )}
                      </p>
                      <p className="mt-1 text-xs text-emerald-300/80">gross amount</p>
                    </div>
                  </div>

                  {/* Net Amount Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-blue-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-400/20">
                          <span className="text-sm text-blue-300">💎</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Net Amount</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {refundSummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : refundSummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(refundSummaryData?.totalNetAmount || 0)
                        )}
                      </p>
                      <p className="mt-1 text-xs text-blue-300/80">after deductions</p>
                    </div>
                  </div>

                  {/* Top Channel Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-amber-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-400/20">
                          <span className="text-sm text-amber-300">🏆</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Top Channel</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {refundSummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : refundSummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          refundSummaryData?.byChannel?.[0]?.channel || "N/A"
                        )}
                      </p>
                      <p className="mt-1 text-xs text-amber-300/80">
                        {refundSummaryData?.byChannel?.[0]?.totalCount || 0} refunds
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refund Breakdown Tabs */}
                <div className="mt-6">
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 rounded-lg border bg-white/10 p-1 backdrop-blur-sm">
                    {refundSummaryData?.byChannel && refundSummaryData.byChannel.length > 0 && (
                      <button
                        onClick={() => selectTab("channel")}
                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === "channel"
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        By Channel
                      </button>
                    )}
                    {refundSummaryData?.byVendor && refundSummaryData.byVendor.length > 0 && (
                      <button
                        onClick={() => selectTab("vendor")}
                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === "vendor"
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        By Vendor
                      </button>
                    )}
                    {refundSummaryData?.byDate && refundSummaryData.byDate.length > 0 && (
                      <button
                        onClick={() => selectTab("date")}
                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === "date"
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        By Date
                      </button>
                    )}
                  </div>

                  {/* Tab Content */}
                  <div className="mt-4">
                    {/* By Channel Tab Content */}
                    {activeTab === "channel" &&
                      refundSummaryData?.byChannel &&
                      refundSummaryData.byChannel.length > 0 && (
                        <div className="rounded-lg border bg-white/10 p-4 backdrop-blur-sm">
                          <h3 className="mb-4 text-lg font-semibold text-white">Refunds by Channel</h3>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {refundSummaryData.byChannel.map((channel, index) => (
                              <div key={index} className="rounded-lg border bg-white/10 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-white">{channel.channel}</p>
                                    <p className="text-xs text-white/70">{channel.count} refunds</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-white">
                                      ₦{channel.totalAmount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-white/70">
                                      Net: ₦{channel.totalNetAmount.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* By Vendor Tab Content */}
                    {activeTab === "vendor" && refundSummaryData?.byVendor && refundSummaryData.byVendor.length > 0 && (
                      <div className="rounded-lg border bg-white/10 p-4 backdrop-blur-sm">
                        <h3 className="mb-4 text-lg font-semibold text-white">Refunds by Vendor</h3>
                        <div className="overflow-x-auto">
                          <div className="min-w-full">
                            {refundSummaryData.byVendor.slice(0, 5).map((vendor, index) => (
                              <div key={index} className="mb-3 rounded-lg border bg-white/10 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-white">{vendor.vendorName}</p>
                                    <p className="text-xs text-white/70">{vendor.totalCount} refunds</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-white">
                                      ₦{vendor.totalAmount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-white/70">
                                      Net: ₦{vendor.totalNetAmount.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {refundSummaryData.byVendor.length > 5 && (
                              <p className="text-center text-sm text-white/70">
                                +{refundSummaryData.byVendor.length - 5} more vendors
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* By Date Tab Content */}
                    {activeTab === "date" && refundSummaryData?.byDate && refundSummaryData.byDate.length > 0 && (
                      <div className="rounded-lg border bg-white/10 p-4 backdrop-blur-sm">
                        <h3 className="mb-4 text-lg font-semibold text-white">Refunds by Date</h3>
                        <div className="overflow-x-auto">
                          <div className="min-w-full">
                            {refundSummaryData.byDate.slice(0, 7).map((date, index) => (
                              <div key={index} className="mb-3 rounded-lg border bg-white/10 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-white">
                                      {new Date(date.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-white/70">{date.totalCount} refunds</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-white">₦{date.totalAmount.toLocaleString()}</p>
                                    <p className="text-xs text-white/70">
                                      Net: ₦{date.totalNetAmount.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {refundSummaryData.byDate.length > 7 && (
                              <p className="text-center text-sm text-white/70">
                                +{refundSummaryData.byDate.length - 7} more dates
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            <AllRefundsTable />

            <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
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
                      {/* Customer ID Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer ID</label>
                        <input
                          type="number"
                          value={localFilters.customerId || ""}
                          onChange={(e) =>
                            handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                          }
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                          placeholder="Enter customer ID"
                        />
                      </div>

                      {/* Vendor ID Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Vendor ID</label>
                        <input
                          type="number"
                          value={localFilters.vendorId || ""}
                          onChange={(e) =>
                            handleFilterChange("vendorId", e.target.value ? Number(e.target.value) : undefined)
                          }
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                          placeholder="Enter vendor ID"
                        />
                      </div>

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

                      {/* Refund Type Key Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Refund Type</label>
                        <input
                          type="text"
                          value={localFilters.refundTypeKey || ""}
                          onChange={(e) => handleFilterChange("refundTypeKey", e.target.value || undefined)}
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                          placeholder="Enter refund type key"
                        />
                      </div>

                      {/* Date Range Filters */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">From Date</label>
                        <input
                          type="date"
                          value={localFilters.fromUtc || ""}
                          onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">To Date</label>
                        <input
                          type="date"
                          value={localFilters.toUtc || ""}
                          onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                        />
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

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        agentOptions={agentOptions}
        channelOptions={channelOptions}
        customerOptions={customerOptions}
        vendorOptions={vendorOptions}
      />
    </section>
  )
}
