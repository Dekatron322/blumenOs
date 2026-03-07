"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  Download,
  FileText,
  Filter,
  Hash,
  Home,
  Info,
  Loader2,
  MapPin,
  PieChart,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react"
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

// Types
interface FilterModalProps {
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
  activeFilterCount: number
}

// Status options for filters
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Open", label: "Open" },
  { value: "Resolved", label: "Resolved" },
]

const resolutionActionOptions = [
  { value: "", label: "All Actions" },
  { value: PaymentAnomalyResolutionAction.None.toString(), label: "None" },
  { value: PaymentAnomalyResolutionAction.Cancel.toString(), label: "Cancel" },
  { value: PaymentAnomalyResolutionAction.Refund.toString(), label: "Refund" },
  { value: PaymentAnomalyResolutionAction.Ignore.toString(), label: "Ignore" },
]

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

const collectorTypeOptions = [
  { value: "", label: "All Collectors" },
  { value: "Customer", label: "Customer" },
  { value: "SalesRep", label: "Sales Representative" },
  { value: "Vendor", label: "Vendor" },
  { value: "Staff", label: "Staff" },
  { value: "Migration", label: "Migration" },
]

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "Open":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: "text-amber-600",
      }
    case "Resolved":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: "text-emerald-600",
      }
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: "text-gray-600",
      }
  }
}

const getResolutionActionColor = (action: PaymentAnomalyResolutionAction) => {
  switch (action) {
    case PaymentAnomalyResolutionAction.None:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: "text-gray-600",
      }
    case PaymentAnomalyResolutionAction.Cancel:
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: "text-red-600",
      }
    case PaymentAnomalyResolutionAction.Refund:
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: "text-blue-600",
      }
    case PaymentAnomalyResolutionAction.Ignore:
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        icon: "text-purple-600",
      }
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: "text-gray-600",
      }
  }
}

// Filter Modal Component
const FilterModal: React.FC<FilterModalProps> = ({
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
  activeFilterCount,
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
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#004B23] to-[#006B33] px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-xs font-bold text-white">FILTERS</span>
                {activeFilterCount > 0 && (
                  <motion.span
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="size-2 rounded-full bg-white" />
                    {activeFilterCount} Active
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
              <X className="size-5" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1">
            <motion.button
              onClick={() => setModalTab("filters")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                modalTab === "filters" ? "bg-white text-[#004B23]" : "bg-white/10 text-white hover:bg-white/20"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Filter className="size-3.5" />
              Filters
            </motion.button>
            <motion.button
              onClick={() => setModalTab("active")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                modalTab === "active" ? "bg-white text-[#004B23]" : "bg-white/10 text-white hover:bg-white/20"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle className="size-3.5" />
              Active Filters
            </motion.button>
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
                {/* Entity Filters */}
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <Users className="size-3.5 text-[#004B23]" />
                    Entity Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Customer</label>
                      <FormSelectModule
                        name="customerId"
                        value={localFilters.customerId || ""}
                        onChange={(e) =>
                          handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={customerOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Vendor</label>
                      <FormSelectModule
                        name="vendorId"
                        value={localFilters.vendorId || ""}
                        onChange={(e) =>
                          handleFilterChange("vendorId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={vendorOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Processing Filters */}
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <CreditCard className="size-3.5 text-[#004B23]" />
                    Processing Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Agent</label>
                      <FormSelectModule
                        name="agentId"
                        value={localFilters.agentId || ""}
                        onChange={(e) =>
                          handleFilterChange("agentId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={agentOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Channel</label>
                      <FormSelectModule
                        name="channel"
                        value={localFilters.Channel || ""}
                        onChange={(e) => handleFilterChange("Channel", e.target.value || undefined)}
                        options={channelOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Anomaly Filters */}
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <AlertCircle className="size-3.5 text-[#004B23]" />
                    Anomaly Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Rule Key</label>
                      <input
                        type="text"
                        value={localFilters.RuleKey || ""}
                        onChange={(e) => handleFilterChange("RuleKey", e.target.value || undefined)}
                        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter rule key"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Status</label>
                      <FormSelectModule
                        name="status"
                        value={localFilters.Status || ""}
                        onChange={(e) => handleFilterChange("Status", e.target.value || undefined)}
                        options={statusOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Resolution Action</label>
                      <FormSelectModule
                        name="resolutionAction"
                        value={localFilters.ResolutionAction || ""}
                        onChange={(e) => handleFilterChange("ResolutionAction", e.target.value || undefined)}
                        options={resolutionActionOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Payment Type</label>
                      <FormSelectModule
                        name="paymentTypeId"
                        value={localFilters.PaymentTypeId?.toString() || ""}
                        onChange={(e) =>
                          handleFilterChange("PaymentTypeId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={paymentTypes.map((pt) => ({ value: pt.id, label: pt.name }))}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Collector Type</label>
                      <FormSelectModule
                        name="collectorType"
                        value={localFilters.CollectorType || ""}
                        onChange={(e) => handleFilterChange("CollectorType", e.target.value || undefined)}
                        options={collectorTypeOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <Calendar className="size-3.5 text-[#004B23]" />
                    Date Range
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">From Date</label>
                      <input
                        type="date"
                        value={localFilters.StartDateUtc || ""}
                        onChange={(e) => handleFilterChange("StartDateUtc", e.target.value || undefined)}
                        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">To Date</label>
                      <input
                        type="date"
                        value={localFilters.EndDateUtc || ""}
                        onChange={(e) => handleFilterChange("EndDateUtc", e.target.value || undefined)}
                        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              >
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <CheckCircle className="size-3.5 text-[#004B23]" />
                    Active Filters
                  </h4>

                  {activeFilterCount === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-200">
                        <Filter className="size-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500">No active filters</p>
                      <p className="mt-1 text-[11px] text-gray-400">Apply filters to see them here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {localFilters.customerId && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Customer</p>
                            <p className="text-[11px] text-gray-500">
                              {customerOptions.find((opt) => opt.value === localFilters.customerId)?.label ||
                                localFilters.customerId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("customerId", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.vendorId && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Vendor</p>
                            <p className="text-[11px] text-gray-500">
                              {vendorOptions.find((opt) => opt.value === localFilters.vendorId)?.label ||
                                localFilters.vendorId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("vendorId", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.agentId && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Agent</p>
                            <p className="text-[11px] text-gray-500">
                              {agentOptions.find((opt) => opt.value === localFilters.agentId)?.label ||
                                localFilters.agentId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("agentId", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.Channel && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Channel</p>
                            <p className="text-[11px] text-gray-500">{localFilters.Channel}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("Channel", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.RuleKey && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Rule Key</p>
                            <p className="text-[11px] text-gray-500">{localFilters.RuleKey}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("RuleKey", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.Status && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Status</p>
                            <p className="text-[11px] text-gray-500">{localFilters.Status}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("Status", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.ResolutionAction && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Resolution Action</p>
                            <p className="text-[11px] text-gray-500">
                              {Number(localFilters.ResolutionAction) === PaymentAnomalyResolutionAction.None
                                ? "None"
                                : Number(localFilters.ResolutionAction) === PaymentAnomalyResolutionAction.Cancel
                                ? "Cancel"
                                : Number(localFilters.ResolutionAction) === PaymentAnomalyResolutionAction.Refund
                                ? "Refund"
                                : "Ignore"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("ResolutionAction", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.PaymentTypeId && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Payment Type</p>
                            <p className="text-[11px] text-gray-500">
                              {paymentTypes.find((pt) => pt.id === localFilters.PaymentTypeId)?.name ||
                                localFilters.PaymentTypeId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("PaymentTypeId", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.CollectorType && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Collector Type</p>
                            <p className="text-[11px] text-gray-500">{localFilters.CollectorType}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("CollectorType", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.StartDateUtc && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">From Date</p>
                            <p className="text-[11px] text-gray-500">
                              {new Date(localFilters.StartDateUtc).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("StartDateUtc", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.EndDateUtc && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">To Date</p>
                            <p className="text-[11px] text-gray-500">
                              {new Date(localFilters.EndDateUtc).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("EndDateUtc", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
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
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500">{activeFilterCount} active filter(s)</p>
            <div className="flex gap-2">
              <motion.button
                onClick={handleClearAll}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear All
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                className="rounded-lg bg-[#004B23] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#003618]"
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

// Payment Anomaly Card Component
const PaymentAnomalyCard = ({ item, index }: { item: any; index: number }) => {
  const statusColors = getStatusColor(item.status)
  const resolutionColors = getResolutionActionColor(item.resolutionAction)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Background Pattern */}
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-gray-50 to-transparent opacity-50 transition-transform group-hover:scale-110" />

      <div className="relative">
        {/* Header */}
        <div className="mb-1 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2.5 ${resolutionColors.bg}`}>
              {item.resolutionAction === PaymentAnomalyResolutionAction.Cancel ? (
                <X className={`size-3 ${resolutionColors.icon}`} />
              ) : item.resolutionAction === PaymentAnomalyResolutionAction.Refund ? (
                <RefreshCw className={`size-3 ${resolutionColors.icon}`} />
              ) : (
                <AlertTriangle className={`size-3 ${resolutionColors.icon}`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-gray-500">{item.ruleKey}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-gray-900">{item.totalCount.toLocaleString()}</span>
            <span className="text-[11px] text-gray-500">occurrences</span>
          </div>
        </div>

        {/* Amount */}
        <div className="mt-2 flex items-center gap-1">
          <DollarSign className="size-3.5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(item.totalAmount)}
          </span>
        </div>

        {/* Details Grid */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <div className={`rounded-full p-1 ${resolutionColors.bg}`}>
                <AlertCircle className={`size-3.5 ${resolutionColors.icon}`} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-500">Resolution</p>
                <p className={`text-xs font-semibold ${resolutionColors.text}`}>
                  {item.resolutionAction === PaymentAnomalyResolutionAction.None
                    ? "None"
                    : item.resolutionAction === PaymentAnomalyResolutionAction.Cancel
                    ? "Cancel"
                    : item.resolutionAction === PaymentAnomalyResolutionAction.Refund
                    ? "Refund"
                    : "Ignore"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-1">
                <Calendar className="size-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-500">Date</p>
                <p className="text-xs font-semibold text-gray-900">{new Date(item.bucketDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Channel & Collector */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-600">
            {item.channel}
          </span>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-600">
            {item.collectorType}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function PaymentAnomaliesPage() {
  const dispatch = useAppDispatch()
  const { agents } = useAppSelector((state) => state.agents)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { paymentAnomalies, paymentAnomaliesLoading, paymentAnomaliesError } = useAppSelector((state) => state.payments)

  const [showFilterModal, setShowFilterModal] = useState(false)
  const [anomaliesAccordionOpen, setAnomaliesAccordionOpen] = useState(true)
  const [showAllCards, setShowAllCards] = useState(false)

  // Local state for filters
  const [localFilters, setLocalFilters] = useState<PaymentAnomaliesRequestParams>({
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

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState<PaymentAnomaliesRequestParams>({})

  // Fetch payment anomalies data
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

  // Create options arrays for filters
  const agentOptions = [
    { value: "", label: "All Agents" },
    ...agents.map((agent) => ({
      value: agent.id,
      label: agent.user.fullName,
    })),
  ]

  const customerOptions: Array<{ value: string | number; label: string }> = [{ value: "", label: "All Customers" }]
  const vendorOptions: Array<{ value: string | number; label: string }> = [{ value: "", label: "All Vendors" }]

  // Filter handlers
  const applyFilters = () => {
    // Convert date strings to ISO format with time components
    const formatFromUtc = (dateString: string | undefined) => {
      if (!dateString) return undefined
      return new Date(dateString).toISOString()
    }

    const formatToUtc = (dateString: string | undefined) => {
      if (!dateString) return undefined
      const date = new Date(dateString)
      date.setHours(22, 59, 59, 999)
      return date.toISOString()
    }

    setAppliedFilters({
      StartDateUtc: formatFromUtc(localFilters.StartDateUtc),
      EndDateUtc: formatToUtc(localFilters.EndDateUtc),
      RuleKey: localFilters.RuleKey,
      Status: localFilters.Status as "Open" | "Resolved" | undefined,
      ResolutionAction: localFilters.ResolutionAction,
      PaymentTypeId: localFilters.PaymentTypeId,
      Channel: localFilters.Channel as
        | "Cash"
        | "BankTransfer"
        | "Pos"
        | "Card"
        | "VendorWallet"
        | "Chaque"
        | "BankDeposit"
        | "Vendor"
        | "Migration"
        | undefined,
      CollectorType: localFilters.CollectorType as
        | "Customer"
        | "SalesRep"
        | "Vendor"
        | "Staff"
        | "Migration"
        | undefined,
    })
    setShowFilterModal(false)
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

  const handleFilterChange = (key: string, value: string | number | undefined) => {
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
    if (localFilters.agentId) count++
    if (localFilters.customerId) count++
    if (localFilters.vendorId) count++
    return count
  }

  // Calculate summary statistics
  const totalAnomalies = paymentAnomalies?.reduce((sum, item) => sum + item.totalCount, 0) || 0
  const totalAmount = paymentAnomalies?.reduce((sum, item) => sum + item.totalAmount, 0) || 0
  const openAnomalies =
    paymentAnomalies?.filter((item) => item.status === "Open").reduce((sum, item) => sum + item.totalCount, 0) || 0
  const resolvedAnomalies =
    paymentAnomalies?.filter((item) => item.status === "Resolved").reduce((sum, item) => sum + item.totalCount, 0) || 0

  // Group by resolution action
  const cancelActions =
    paymentAnomalies
      ?.filter((item) => item.resolutionAction === PaymentAnomalyResolutionAction.Cancel)
      .reduce((sum, item) => sum + item.totalCount, 0) || 0
  const refundActions =
    paymentAnomalies
      ?.filter((item) => item.resolutionAction === PaymentAnomalyResolutionAction.Refund)
      .reduce((sum, item) => sum + item.totalCount, 0) || 0

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-24 sm:pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Payment Anomalies</h1>
                  <p className="mt-1 text-sm text-gray-600">Track and manage payment anomalies and irregularities</p>
                </div>
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#004B23] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003618]"
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
            </div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Total Anomalies Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-amber-100 p-2">
                        <AlertTriangle className="size-4 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Total Anomalies</h3>
                        <p className="text-xs text-gray-500">detected issues</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-amber-700">
                      {paymentAnomaliesLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : paymentAnomaliesError ? (
                        <span className="text-red-500">-</span>
                      ) : (
                        totalAnomalies.toLocaleString() || "0"
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Detection Rate</span>
                      <span className="font-medium text-gray-900">
                        {paymentAnomaliesLoading
                          ? "..."
                          : paymentAnomaliesError
                          ? "0"
                          : Math.min(
                              100,
                              Math.round((totalAnomalies / Math.max(1, paymentAnomalies?.length || 1)) * 100)
                            )}
                        %
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: paymentAnomaliesLoading
                            ? "0%"
                            : paymentAnomaliesError
                            ? "0%"
                            : `${Math.min(100, (totalAnomalies / Math.max(1, paymentAnomalies?.length || 1)) * 100)}%`,
                        }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                      />
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-amber-50 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <AlertCircle className="size-3 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">Open</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-amber-900">
                        {paymentAnomaliesLoading
                          ? "..."
                          : paymentAnomaliesError
                          ? "-"
                          : openAnomalies.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="size-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Resolved</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-emerald-900">
                        {paymentAnomaliesLoading
                          ? "..."
                          : paymentAnomaliesError
                          ? "-"
                          : resolvedAnomalies.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Total Amount Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-emerald-100 p-2">
                        <DollarSign className="size-4 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Total Amount</h3>
                        <p className="text-xs text-gray-500">anomaly amount</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">
                      {paymentAnomaliesLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : paymentAnomaliesError ? (
                        <span className="text-red-500">-</span>
                      ) : (
                        new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(totalAmount)
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Avg. Amount</span>
                      <span className="font-medium text-gray-900">
                        {paymentAnomaliesLoading
                          ? "..."
                          : paymentAnomaliesError
                          ? "0"
                          : new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(totalAnomalies > 0 ? totalAmount / totalAnomalies : 0)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: paymentAnomaliesLoading
                            ? "0%"
                            : paymentAnomaliesError
                            ? "0%"
                            : `${Math.min(100, (totalAmount / 10000000) * 100)}%`, // Example scaling
                        }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Action Breakdown */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-red-50 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <X className="size-3 text-red-600" />
                        <span className="text-xs font-medium text-red-700">Cancel</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-red-900">
                        {paymentAnomaliesLoading
                          ? "..."
                          : paymentAnomaliesError
                          ? "-"
                          : cancelActions.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <RefreshCw className="size-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Refund</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-blue-900">
                        {paymentAnomaliesLoading
                          ? "..."
                          : paymentAnomaliesError
                          ? "-"
                          : refundActions.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Payment Anomalies Summary - Card Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-100 p-2.5">
                        <BarChart3 className="size-5 text-purple-700" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Payment Anomalies Summary</h2>
                        <p className="text-sm text-gray-600">{paymentAnomalies?.length || 0} anomaly records found</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAnomaliesAccordionOpen(!anomaliesAccordionOpen)}
                      className="rounded-lg p-2 hover:bg-gray-100"
                    >
                      <ChevronDown
                        className={`size-5 text-gray-500 transition-transform duration-200 ${
                          anomaliesAccordionOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {anomaliesAccordionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-6"
                    >
                      {paymentAnomaliesLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="flex items-center gap-3">
                            <Loader2 className="size-5 animate-spin text-gray-500" />
                            <span className="text-sm text-gray-500">Loading payment anomalies...</span>
                          </div>
                        </div>
                      ) : paymentAnomaliesError ? (
                        <div className="py-12 text-center">
                          <AlertCircle className="mx-auto mb-3 size-8 text-red-500" />
                          <p className="text-sm text-red-600">{paymentAnomaliesError}</p>
                        </div>
                      ) : !paymentAnomalies || paymentAnomalies.length === 0 ? (
                        <div className="py-12 text-center">
                          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100">
                            <CheckCircle className="size-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600">No payment anomalies found</p>
                          <p className="mt-1 text-xs text-gray-500">All payment processing is normal</p>
                        </div>
                      ) : (
                        <div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {paymentAnomalies
                              .slice(0, showAllCards ? paymentAnomalies.length : 3)
                              .map((item, index) => (
                                <PaymentAnomalyCard key={index} item={item} index={index} />
                              ))}
                          </div>
                          {paymentAnomalies.length > 3 && (
                            <div className="mt-6 flex justify-center">
                              <motion.button
                                onClick={() => setShowAllCards(!showAllCards)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {showAllCards ? (
                                  <>
                                    <ChevronDown className="size-4 rotate-180" />
                                    Show Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="size-4" />
                                    Load More ({paymentAnomalies.length - 3} more)
                                  </>
                                )}
                              </motion.button>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* All Anomalies Table */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <AllAnomaliesTable />
              </motion.div>
            </motion.div>
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
        paymentTypes={paymentTypes}
        activeFilterCount={getActiveFilterCount()}
      />
    </section>
  )
}
