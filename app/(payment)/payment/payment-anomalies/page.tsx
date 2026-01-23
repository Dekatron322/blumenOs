"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Calendar, ChevronDown, DollarSign, Filter, TrendingUp, X } from "lucide-react"
import {
  MdAttachMoney,
  MdCalendarToday,
  MdCheck,
  MdClose,
  MdCode,
  MdDevices,
  MdFilterList,
  MdPerson,
  MdTrendingUp,
  MdWarning,
} from "react-icons/md"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { AgentsRequestParams, CollectorType, fetchAgents, PaymentChannel, PaymentStatus } from "lib/redux/agentSlice"
import { clearPaymentTypes, fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import {
  clearPaymentAnomalies,
  fetchPaymentAnomalies,
  PaymentAnomaliesRequestParams,
  PaymentAnomalyResolutionAction,
} from "lib/redux/paymentSlice"
import AllRefundsTable from "components/Tables/AllRefundTable"
import AllAnomaliesTable from "components/Tables/AllAnomaliesTable"

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
  paymentTypes,
}: {
  isOpen: boolean
  onRequestClose: () => void
  localFilters: PaymentAnomaliesRequestParams
  handleFilterChange: (key: string, value: string | number | undefined) => void
  applyFilters: () => void
  resetFilters: () => void
  agentOptions: Array<{ value: string | number; label: string }>
  channelOptions: Array<{ value: string; label: string }>
  customerOptions: Array<{ value: string | number; label: string }>
  vendorOptions: Array<{ value: string | number; label: string }>
  paymentTypes: Array<{ id: number; name: string }>
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
    if (localFilters.Channel) count++
    if (localFilters.StartDateUtc) count++
    if (localFilters.EndDateUtc) count++
    if (localFilters.RuleKey) count++
    if (localFilters.Status) count++
    if (localFilters.ResolutionAction) count++
    if (localFilters.PaymentTypeId) count++
    if (localFilters.CollectorType) count++
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
              <h3 className="mt-2 text-lg font-semibold text-white">Filter Payment Anomalies</h3>
              <p className="mt-1 text-sm text-white/70">Apply filters to refine anomaly data</p>
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
                        value={localFilters.Channel || ""}
                        onChange={(e) => handleFilterChange("Channel", e.target.value || undefined)}
                        options={channelOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Rule Key & Status */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdCode className="text-[#004B23]" />
                    Anomaly Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Rule Key</label>
                      <input
                        type="text"
                        value={localFilters.RuleKey || ""}
                        onChange={(e) => handleFilterChange("RuleKey", e.target.value || undefined)}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter rule key"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                      <FormSelectModule
                        name="status"
                        value={localFilters.Status || ""}
                        onChange={(e) => handleFilterChange("Status", e.target.value || undefined)}
                        options={[
                          { value: "", label: "All Statuses" },
                          { value: "Open", label: "Open" },
                          { value: "Resolved", label: "Resolved" },
                        ]}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Resolution Action & Payment Type */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdDevices className="text-[#004B23]" />
                    Resolution & Payment Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Resolution Action</label>
                      <FormSelectModule
                        name="resolutionAction"
                        value={localFilters.ResolutionAction || ""}
                        onChange={(e) => handleFilterChange("ResolutionAction", e.target.value || undefined)}
                        options={[
                          { value: "", label: "All Actions" },
                          { value: PaymentAnomalyResolutionAction.None.toString(), label: "None" },
                          { value: PaymentAnomalyResolutionAction.Cancel.toString(), label: "Cancel" },
                          { value: PaymentAnomalyResolutionAction.Refund.toString(), label: "Refund" },
                          { value: PaymentAnomalyResolutionAction.Ignore.toString(), label: "Ignore" },
                        ]}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Payment Type</label>
                      <FormSelectModule
                        name="paymentTypeId"
                        value={localFilters.PaymentTypeId?.toString() || ""}
                        onChange={(e) =>
                          handleFilterChange("PaymentTypeId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={paymentTypes.map((pt) => ({ value: pt.id, label: pt.name }))}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Collector Type */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdPerson className="text-[#004B23]" />
                    Collector Filter
                  </h4>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Collector Type</label>
                    <FormSelectModule
                      name="collectorType"
                      value={localFilters.CollectorType || ""}
                      onChange={(e) => handleFilterChange("CollectorType", e.target.value || undefined)}
                      options={[
                        { value: "", label: "All Collectors" },
                        { value: "Customer", label: "Customer" },
                        { value: "SalesRep", label: "Sales Representative" },
                        { value: "Vendor", label: "Vendor" },
                        { value: "Staff", label: "Staff" },
                        { value: "Migration", label: "Migration" },
                      ]}
                      className="w-full"
                      controlClassName="h-10 bg-white"
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
                        value={localFilters.StartDateUtc || ""}
                        onChange={(e) => handleFilterChange("StartDateUtc", e.target.value || undefined)}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">To Date</label>
                      <input
                        type="date"
                        value={localFilters.EndDateUtc || ""}
                        onChange={(e) => handleFilterChange("EndDateUtc", e.target.value || undefined)}
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
                      {localFilters.Channel && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Channel</p>
                            <p className="text-xs text-gray-500">{localFilters.Channel}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("Channel", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.RuleKey && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Rule Key</p>
                            <p className="text-xs text-gray-500">{localFilters.RuleKey}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("RuleKey", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.Status && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Status</p>
                            <p className="text-xs text-gray-500">{localFilters.Status}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("Status", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.ResolutionAction && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Resolution Action</p>
                            <p className="text-xs text-gray-500">
                              {Number(localFilters.ResolutionAction) === PaymentAnomalyResolutionAction.None
                                ? "None"
                                : Number(localFilters.ResolutionAction) === PaymentAnomalyResolutionAction.Cancel
                                ? "Cancel"
                                : Number(localFilters.ResolutionAction) === PaymentAnomalyResolutionAction.Refund
                                ? "Refund"
                                : Number(localFilters.ResolutionAction) === PaymentAnomalyResolutionAction.Ignore
                                ? "Ignore"
                                : localFilters.ResolutionAction}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("ResolutionAction", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.PaymentTypeId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Payment Type</p>
                            <p className="text-xs text-gray-500">
                              {paymentTypes.find((pt) => pt.id === localFilters.PaymentTypeId)?.name ||
                                localFilters.PaymentTypeId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("PaymentTypeId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.CollectorType && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Collector Type</p>
                            <p className="text-xs text-gray-500">{localFilters.CollectorType}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("CollectorType", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.StartDateUtc && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">From Date</p>
                            <p className="text-xs text-gray-500">{localFilters.StartDateUtc}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("StartDateUtc", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.EndDateUtc && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">To Date</p>
                            <p className="text-xs text-gray-500">{localFilters.EndDateUtc}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("EndDateUtc", undefined)}
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
  paymentTypes,
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
  paymentTypes: Array<{ id: number; name: string }>
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
                {/* Rule Key Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Rule Key</label>
                  <input
                    type="text"
                    value={localFilters.RuleKey || ""}
                    onChange={(e) => handleFilterChange("RuleKey", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    placeholder="Enter rule key"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                  <FormSelectModule
                    name="status"
                    value={localFilters.Status || ""}
                    onChange={(e) => handleFilterChange("Status", e.target.value || undefined)}
                    options={[
                      { value: "", label: "All Statuses" },
                      { value: "Open", label: "Open" },
                      { value: "Resolved", label: "Resolved" },
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Resolution Action Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Resolution Action</label>
                  <FormSelectModule
                    name="resolutionAction"
                    value={localFilters.ResolutionAction || ""}
                    onChange={(e) => handleFilterChange("ResolutionAction", e.target.value || undefined)}
                    options={[
                      { value: "", label: "All Actions" },
                      { value: PaymentAnomalyResolutionAction.None.toString(), label: "None" },
                      { value: PaymentAnomalyResolutionAction.Cancel.toString(), label: "Cancel" },
                      { value: PaymentAnomalyResolutionAction.Refund.toString(), label: "Refund" },
                      { value: PaymentAnomalyResolutionAction.Ignore.toString(), label: "Ignore" },
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Payment Type Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Type</label>
                  <FormSelectModule
                    name="paymentTypeId"
                    value={localFilters.PaymentTypeId?.toString() || ""}
                    onChange={(e) =>
                      handleFilterChange("PaymentTypeId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={paymentTypes.map((pt) => ({ value: pt.id, label: pt.name }))}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Collector Type Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Collector Type</label>
                  <FormSelectModule
                    name="collectorType"
                    value={localFilters.CollectorType || ""}
                    onChange={(e) => handleFilterChange("CollectorType", e.target.value || undefined)}
                    options={[
                      { value: "", label: "All Collectors" },
                      { value: "Customer", label: "Customer" },
                      { value: "SalesRep", label: "Sales Representative" },
                      { value: "Vendor", label: "Vendor" },
                      { value: "Staff", label: "Staff" },
                      { value: "Migration", label: "Migration" },
                    ]}
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

                {/* Channel Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Channel</label>
                  <FormSelectModule
                    name="channel"
                    value={localFilters.Channel || ""}
                    onChange={(e) => handleFilterChange("Channel", e.target.value || undefined)}
                    options={channelOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Rule Key Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Rule Key</label>
                  <input
                    type="text"
                    value={localFilters.RuleKey || ""}
                    onChange={(e) => handleFilterChange("RuleKey", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    placeholder="Enter rule key"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                  <FormSelectModule
                    name="status"
                    value={localFilters.status || ""}
                    onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                    options={[
                      { value: "", label: "All Statuses" },
                      { value: "Open", label: "Open" },
                      { value: "Resolved", label: "Resolved" },
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Resolution Action Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Resolution Action</label>
                  <FormSelectModule
                    name="resolutionAction"
                    value={localFilters.resolutionAction || ""}
                    onChange={(e) => handleFilterChange("resolutionAction", e.target.value || undefined)}
                    options={[
                      { value: "", label: "All Actions" },
                      { value: PaymentAnomalyResolutionAction.None.toString(), label: "None" },
                      { value: PaymentAnomalyResolutionAction.Cancel.toString(), label: "Cancel" },
                      { value: PaymentAnomalyResolutionAction.Refund.toString(), label: "Refund" },
                      { value: PaymentAnomalyResolutionAction.Ignore.toString(), label: "Ignore" },
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Payment Type Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Type</label>
                  <FormSelectModule
                    name="paymentTypeId"
                    value={localFilters.paymentTypeId?.toString() || ""}
                    onChange={(e) =>
                      handleFilterChange("paymentTypeId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={paymentTypes.map((pt) => ({ value: pt.id, label: pt.name }))}
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
                    options={[
                      { value: "", label: "All Collectors" },
                      { value: "Customer", label: "Customer" },
                      { value: "SalesRep", label: "Sales Representative" },
                      { value: "Vendor", label: "Vendor" },
                      { value: "Staff", label: "Staff" },
                      { value: "Migration", label: "Migration" },
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Date Range Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">From Date</label>
                  <input
                    type="date"
                    value={localFilters.StartDateUtc || ""}
                    onChange={(e) => handleFilterChange("StartDateUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">To Date</label>
                  <input
                    type="date"
                    value={localFilters.EndDateUtc || ""}
                    onChange={(e) => handleFilterChange("EndDateUtc", e.target.value || undefined)}
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

export default function PaymentAnomaliesPage() {
  const dispatch = useAppDispatch()
  const { agents } = useAppSelector((state) => state.agents)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { paymentAnomalies, paymentAnomaliesLoading, paymentAnomaliesError } = useAppSelector((state) => state.payments)

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
    StartDateUtc: undefined as string | undefined,
    EndDateUtc: undefined as string | undefined,
    RuleKey: undefined as string | undefined,
    Status: undefined as "Open" | "Resolved" | undefined,
    ResolutionAction: undefined as PaymentAnomalyResolutionAction | undefined,
    PaymentTypeId: undefined as number | undefined,
    Channel: undefined as
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
    CollectorType: undefined as "Customer" | "SalesRep" | "Vendor" | "Staff" | "Migration" | undefined,
    agentId: undefined as number | undefined,
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState<PaymentAnomaliesRequestParams>({})

  // Fetch payment anomalies data and other options
  useEffect(() => {
    dispatch(fetchPaymentAnomalies(appliedFilters))
  }, [dispatch, appliedFilters])

  // Fetch agents and payment types for filter options
  useEffect(() => {
    dispatch(
      fetchAgents({
        pageNumber: 1,
        pageSize: 100,
      } as AgentsRequestParams)
    )

    dispatch(fetchPaymentTypes())

    return () => {
      dispatch(clearPaymentTypes())
      dispatch(clearPaymentAnomalies())
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
      StartDateUtc: formatFromUtc(localFilters.StartDateUtc),
      EndDateUtc: formatToUtc(localFilters.EndDateUtc),
      RuleKey: localFilters.RuleKey,
      Status: localFilters.Status,
      ResolutionAction: localFilters.ResolutionAction,
      PaymentTypeId: localFilters.PaymentTypeId,
      Channel: localFilters.Channel,
      CollectorType: localFilters.CollectorType,
    })
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    // Convert ResolutionAction string values to enum values
    const processedValue =
      key === "ResolutionAction" || key === "resolutionAction"
        ? value === ""
          ? undefined
          : (Number(value) as PaymentAnomalyResolutionAction)
        : value === ""
        ? undefined
        : value

    setLocalFilters((prev) => ({
      ...prev,
      [key]: processedValue,
    }))
  }

  const resetFilters = () => {
    setLocalFilters({
      StartDateUtc: undefined,
      EndDateUtc: undefined,
      RuleKey: undefined,
      Status: undefined,
      ResolutionAction: undefined,
      PaymentTypeId: undefined,
      Channel: undefined,
      CollectorType: undefined,
      agentId: undefined,
      customerId: undefined,
      vendorId: undefined,
    })
    setAppliedFilters({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.StartDateUtc) count++
    if (appliedFilters.EndDateUtc) count++
    if (appliedFilters.RuleKey) count++
    if (appliedFilters.Status) count++
    if (appliedFilters.ResolutionAction) count++
    if (appliedFilters.PaymentTypeId) count++
    if (appliedFilters.Channel) count++
    if (appliedFilters.CollectorType) count++
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
                    <h1 className="text-2xl font-bold text-white md:text-3xl">Payment Anomalies</h1>
                    <p className="mt-1 text-sm text-white/80 md:text-base">
                      Track and manage payment anomalies and irregularities
                    </p>
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
                  {/* Total Anomalies Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/5 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
                          <MdWarning className="text-sm" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Total Anomalies</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {paymentAnomaliesLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : paymentAnomaliesError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          paymentAnomalies?.reduce((sum, item) => sum + item.totalCount, 0).toLocaleString() || "0"
                        )}
                      </p>
                      <p className="mt-1 text-xs text-white/60">detected issues</p>
                    </div>
                  </div>

                  {/* Total Amount Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-emerald-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/20">
                          <MdAttachMoney className="text-sm text-emerald-300" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Total Amount</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {paymentAnomaliesLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : paymentAnomaliesError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(paymentAnomalies?.reduce((sum, item) => sum + item.totalAmount, 0) || 0)
                        )}
                      </p>
                      <p className="mt-1 text-xs text-emerald-300/80">anomaly amount</p>
                    </div>
                  </div>

                  {/* Open Anomalies Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-amber-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-400/20">
                          <AlertTriangle className="text-sm text-amber-300" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Open Anomalies</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {paymentAnomaliesLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : paymentAnomaliesError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          paymentAnomalies
                            ?.filter((item) => item.status === "Open")
                            .reduce((sum, item) => sum + item.totalCount, 0)
                            .toLocaleString() || "0"
                        )}
                      </p>
                      <p className="mt-1 text-xs text-amber-300/80">pending resolution</p>
                    </div>
                  </div>

                  {/* Top Rule Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-blue-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-400/20">
                          <TrendingUp className="text-sm text-blue-300" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Top Rule</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {paymentAnomaliesLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : paymentAnomaliesError ? (
                          <span className="text-red-300">Error</span>
                        ) : paymentAnomalies?.length > 0 ? (
                          paymentAnomalies?.[0]?.ruleKey
                        ) : (
                          "N/A"
                        )}
                      </p>
                      <p className="mt-1 text-xs text-blue-300/80">
                        {paymentAnomalies?.[0]?.totalCount || 0} occurrences
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Anomalies Table */}
                <div className="mt-6">
                  <div className="rounded-lg border bg-white/10 p-4 backdrop-blur-sm">
                    <h3 className="mb-4 text-lg font-semibold text-white">Payment Anomalies Summary</h3>

                    {paymentAnomaliesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
                      </div>
                    ) : paymentAnomaliesError ? (
                      <div className="py-8 text-center">
                        <p className="text-red-300">{paymentAnomaliesError}</p>
                      </div>
                    ) : !paymentAnomalies || paymentAnomalies.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-white/70">No payment anomalies found</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/20">
                              <th className="px-4 py-3 text-left font-medium text-white/80">Date</th>
                              <th className="px-4 py-3 text-left font-medium text-white/80">Rule Key</th>
                              <th className="px-4 py-3 text-left font-medium text-white/80">Status</th>
                              <th className="px-4 py-3 text-left font-medium text-white/80">Resolution</th>
                              <th className="px-4 py-3 text-left font-medium text-white/80">Channel</th>
                              <th className="px-4 py-3 text-left font-medium text-white/80">Collector</th>
                              <th className="px-4 py-3 text-right font-medium text-white/80">Count</th>
                              <th className="px-4 py-3 text-right font-medium text-white/80">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentAnomalies.map((anomaly, index) => (
                              <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                                <td className="px-4 py-3 text-white">
                                  {new Date(anomaly.bucketDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-white">{anomaly.ruleKey}</td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                      anomaly.status === "Open"
                                        ? "bg-amber-500/20 text-amber-300"
                                        : "bg-green-500/20 text-green-300"
                                    }`}
                                  >
                                    {anomaly.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-white">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                      anomaly.resolutionAction === PaymentAnomalyResolutionAction.None
                                        ? "bg-gray-500/20 text-gray-300"
                                        : anomaly.resolutionAction === PaymentAnomalyResolutionAction.Cancel
                                        ? "bg-red-500/20 text-red-300"
                                        : anomaly.resolutionAction === PaymentAnomalyResolutionAction.Refund
                                        ? "bg-blue-500/20 text-blue-300"
                                        : "bg-purple-500/20 text-purple-300"
                                    }`}
                                  >
                                    {anomaly.resolutionAction === PaymentAnomalyResolutionAction.None
                                      ? "None"
                                      : anomaly.resolutionAction === PaymentAnomalyResolutionAction.Cancel
                                      ? "Cancel"
                                      : anomaly.resolutionAction === PaymentAnomalyResolutionAction.Refund
                                      ? "Refund"
                                      : "Ignore"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-white">{anomaly.channel}</td>
                                <td className="px-4 py-3 text-white">{anomaly.collectorType}</td>
                                <td className="px-4 py-3 text-right text-white">
                                  {anomaly.totalCount.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right text-white">
                                  {new Intl.NumberFormat("en-NG", {
                                    style: "currency",
                                    currency: "NGN",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(anomaly.totalAmount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            <AllAnomaliesTable />

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
                      {/* Rule Key Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Rule Key</label>
                        <input
                          type="text"
                          value={localFilters.RuleKey || ""}
                          onChange={(e) => handleFilterChange("RuleKey", e.target.value || undefined)}
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                          placeholder="Enter rule key"
                        />
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                        <FormSelectModule
                          name="status"
                          value={localFilters.Status || ""}
                          onChange={(e) => handleFilterChange("Status", e.target.value || undefined)}
                          options={[
                            { value: "", label: "All Statuses" },
                            { value: "Open", label: "Open" },
                            { value: "Resolved", label: "Resolved" },
                          ]}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      {/* Resolution Action Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Resolution Action
                        </label>
                        <FormSelectModule
                          name="resolutionAction"
                          value={localFilters.ResolutionAction || ""}
                          onChange={(e) => handleFilterChange("ResolutionAction", e.target.value || undefined)}
                          options={[
                            { value: "", label: "All Actions" },
                            { value: "None", label: "None" },
                            { value: "Cancel", label: "Cancel" },
                            { value: "Refund", label: "Refund" },
                            { value: "Ignore", label: "Ignore" },
                          ]}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      {/* Payment Type Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Payment Type
                        </label>
                        <FormSelectModule
                          name="paymentTypeId"
                          value={localFilters.PaymentTypeId?.toString() || ""}
                          onChange={(e) =>
                            handleFilterChange("PaymentTypeId", e.target.value ? Number(e.target.value) : undefined)
                          }
                          options={paymentTypes.map((pt) => ({ value: pt.id, label: pt.name }))}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      {/* Collector Type Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Collector Type
                        </label>
                        <FormSelectModule
                          name="collectorType"
                          value={localFilters.CollectorType || ""}
                          onChange={(e) => handleFilterChange("CollectorType", e.target.value || undefined)}
                          options={[
                            { value: "", label: "All Collectors" },
                            { value: "Customer", label: "Customer" },
                            { value: "SalesRep", label: "Sales Representative" },
                            { value: "Vendor", label: "Vendor" },
                            { value: "Staff", label: "Staff" },
                            { value: "Migration", label: "Migration" },
                          ]}
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
                          value={localFilters.Channel || ""}
                          onChange={(e) => handleFilterChange("Channel", e.target.value || undefined)}
                          options={channelOptions}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      {/* Date Range Filters */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">From Date</label>
                        <input
                          type="date"
                          value={localFilters.StartDateUtc || ""}
                          onChange={(e) => handleFilterChange("StartDateUtc", e.target.value || undefined)}
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">To Date</label>
                        <input
                          type="date"
                          value={localFilters.EndDateUtc || ""}
                          onChange={(e) => handleFilterChange("EndDateUtc", e.target.value || undefined)}
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
        customerOptions={[]}
        vendorOptions={[]}
        paymentTypes={paymentTypes}
      />
    </section>
  )
}
