"use client"

import React, { useCallback, useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
  SortAsc,
  SortDesc,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { DataQualityItem, DataQualityParams, fetchDataQuality } from "lib/redux/customerSlice"
import { fetchCustomers } from "lib/redux/formDataSlice"
import { fetchVendors } from "lib/redux/vendorSlice"
import { fetchAgents } from "lib/redux/agentSlice"
import { fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import { ButtonModule } from "components/ui/Button/Button"
import ResolveDataQualityModal from "components/Modals/ResolveDataQualityModal"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

// Types
interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface AppliedFilters {
  customerId?: number
  provinceId?: number
  serviceCenterId?: number
  distributionSubstationId?: number
  feederId?: number
  paymentTypeId?: number
  ruleKey?: string
  status?: "Open" | "Resolved" | "Ignored"
  severity?: "Warning" | "Error"
  resolutionAction?: string
  fromUtc?: string
  toUtc?: string
  detectedFromUtc?: string
  detectedToUtc?: string
  paidFromUtc?: string
  paidToUtc?: string
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  minAmount?: number
  maxAmount?: number
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
  channelOptions,
  statusOptions,
  severityOptions,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
  paymentTypeOptions,
  resolutionActionOptions,
  handleCustomerSearch,
  searchTerms,
  searchLoading,
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
  channelOptions: Array<{ value: string; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  severityOptions: Array<{ value: string; label: string }>
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
  paymentTypeOptions: Array<{ value: string | number; label: string }>
  resolutionActionOptions: Array<{ value: string; label: string }>
  handleCustomerSearch?: (searchTerm: string) => void
  searchTerms?: Record<string, string>
  searchLoading?: Record<string, boolean>
}) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="mobile-filter-sidebar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm lg:hidden"
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
                  <X className="size-5" />
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
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Customer</label>
                  <FormSelectModule
                    name="customerId"
                    value={localFilters.customerId || ""}
                    onChange={(e) => handleFilterChange("customerId", e.target.value || undefined)}
                    options={customerOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                    onSearchChange={handleCustomerSearch}
                    searchTerm={searchTerms?.customer || ""}
                    searchable
                    disabled={searchLoading?.customer}
                  />
                </div>

                {/* Severity Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Severity</label>
                  <FormSelectModule
                    name="severity"
                    value={localFilters.severity || ""}
                    onChange={(e) => handleFilterChange("severity", e.target.value || undefined)}
                    options={severityOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Rule Key Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Rule Key</label>
                  <FormSelectModule
                    name="ruleKey"
                    value={localFilters.ruleKey || ""}
                    onChange={(e) => handleFilterChange("ruleKey", e.target.value || undefined)}
                    options={[{ value: "", label: "All Rules" }]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Status</label>
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
                          className={`rounded-md px-3 py-2 text-xs transition-colors ${
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

                {/* Payment Type Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Payment Type</label>
                  <FormSelectModule
                    name="paymentTypeId"
                    value={localFilters.paymentTypeId || ""}
                    onChange={(e) => handleFilterChange("paymentTypeId", e.target.value || undefined)}
                    options={paymentTypeOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Resolution Action Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Resolution Action</label>
                  <div className="grid grid-cols-2 gap-2">
                    {resolutionActionOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange(
                              "resolutionAction",
                              localFilters.resolutionAction === option.value ? undefined : option.value
                            )
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors ${
                            localFilters.resolutionAction === option.value
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Amount Range Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Min Amount</label>
                  <input
                    type="number"
                    value={localFilters.minAmount || ""}
                    onChange={(e) =>
                      handleFilterChange("minAmount", e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="Enter min amount..."
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Max Amount</label>
                  <input
                    type="number"
                    value={localFilters.maxAmount || ""}
                    onChange={(e) =>
                      handleFilterChange("maxAmount", e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="Enter max amount..."
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                {/* Date Range Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Detected From</label>
                  <input
                    type="date"
                    value={localFilters.detectedFromUtc || ""}
                    onChange={(e) => handleFilterChange("detectedFromUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Detected To</label>
                  <input
                    type="date"
                    value={localFilters.detectedToUtc || ""}
                    onChange={(e) => handleFilterChange("detectedToUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Paid From</label>
                  <input
                    type="date"
                    value={localFilters.paidFromUtc || ""}
                    onChange={(e) => handleFilterChange("paidFromUtc", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Paid To</label>
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
                    className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700"
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
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
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
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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

// Severity configuration
const getSeverityConfig = (severity: string) => {
  const configs = {
    Warning: {
      label: "Warning",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <AlertCircle className="size-3.5 text-amber-600" />,
    },
    Error: {
      label: "Error",
      color: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle className="size-3.5 text-red-600" />,
    },
  }
  return configs[severity as keyof typeof configs] || configs.Warning
}

// Status configuration
const getStatusConfig = (status: string) => {
  const configs = {
    Open: {
      label: "Open",
      color: "bg-red-50 text-red-700 border-red-200",
      icon: <AlertCircle className="size-3.5 text-red-600" />,
    },
    Resolved: {
      label: "Resolved",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle className="size-3.5 text-emerald-600" />,
    },
    Ignored: {
      label: "Ignored",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: <XCircle className="size-3.5 text-gray-600" />,
    },
  }
  return configs[status as keyof typeof configs] || configs.Open
}

// Formatting utilities
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  } catch {
    return "—"
  }
}

const formatDateTime = (dateString: string, isStartDate: boolean = true) => {
  if (!dateString) return undefined
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return undefined

  if (isStartDate) {
    date.setHours(0, 0, 0, 0)
  } else {
    date.setHours(23, 59, 59, 999)
  }

  return date.toISOString()
}

// Loading Skeleton
const TableSkeleton = () => (
  <div className="space-y-4">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div>
        <div className="h-8 w-48 rounded bg-gray-200"></div>
        <div className="mt-1 h-4 w-64 rounded bg-gray-200"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-64 rounded bg-gray-200"></div>
        <div className="h-10 w-32 rounded bg-gray-200"></div>
        <div className="h-10 w-32 rounded bg-gray-200"></div>
        <div className="h-10 w-24 rounded bg-gray-200"></div>
      </div>
    </div>

    {/* Filters skeleton */}
    <div className="flex flex-wrap gap-3">
      <div className="h-10 w-64 rounded bg-gray-200"></div>
      <div className="h-10 w-32 rounded bg-gray-200"></div>
      <div className="h-10 w-32 rounded bg-gray-200"></div>
    </div>

    {/* Table skeleton */}
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[...Array(9)].map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {[...Array(5)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(9)].map((_, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3">
                  <div className="h-4 w-full rounded bg-gray-200"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination skeleton */}
    <div className="flex items-center justify-between">
      <div className="h-4 w-48 rounded bg-gray-200"></div>
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded bg-gray-200"></div>
        <div className="h-8 w-20 rounded bg-gray-200"></div>
      </div>
    </div>
  </div>
)

// Export Modal Component
const ExportModal = ({
  isOpen,
  onClose,
  onExport,
  customerOptions,
  statusOptions,
  channelOptions,
  vendorOptions,
  agentOptions,
  paymentTypeOptions,
  searchTerms,
  searchLoading,
  handleCustomerSearch,
}: {
  isOpen: boolean
  onClose: () => void
  onExport: (params: any) => void
  customerOptions: Array<{ value: string | number; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  channelOptions: Array<{ value: string; label: string }>
  vendorOptions: Array<{ value: string | number; label: string }>
  agentOptions: Array<{ value: string | number; label: string }>
  paymentTypeOptions: Array<{ value: string | number; label: string }>
  searchTerms?: Record<string, string>
  searchLoading?: Record<string, boolean>
  handleCustomerSearch?: (searchTerm: string) => void
}) => {
  const [exportDateRange, setExportDateRange] = useState<"all" | "today" | "week" | "month" | "custom">("all")
  const [exportFromDate, setExportFromDate] = useState("")
  const [exportToDate, setExportToDate] = useState("")
  const [exportCustomerId, setExportCustomerId] = useState("")
  const [exportRuleKey, setExportRuleKey] = useState("")
  const [exportStatus, setExportStatus] = useState("")
  const [exportSeverity, setExportSeverity] = useState("")
  const [exportChannel, setExportChannel] = useState("")
  const [exportReference, setExportReference] = useState("")
  const [exportVendorId, setExportVendorId] = useState("")
  const [exportAgentId, setExportAgentId] = useState("")
  const [exportPaymentTypeId, setExportPaymentTypeId] = useState("")

  const handleExport = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let fromDate: string | undefined
    let toDate: string | undefined

    switch (exportDateRange) {
      case "today":
        fromDate = today.toISOString()
        toDate = new Date(today.setHours(23, 59, 59, 999)).toISOString()
        break
      case "week":
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        fromDate = weekAgo.toISOString()
        toDate = new Date().toISOString()
        break
      case "month":
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        fromDate = monthAgo.toISOString()
        toDate = new Date().toISOString()
        break
      case "custom":
        fromDate = exportFromDate ? new Date(exportFromDate).toISOString() : undefined
        toDate = exportToDate ? new Date(exportToDate + "T23:59:59").toISOString() : undefined
        break
    }

    onExport({
      dateRange: exportDateRange,
      fromDate,
      toDate,
      customerId: exportCustomerId || undefined,
      ruleKey: exportRuleKey || undefined,
      status: exportStatus || undefined,
      severity: exportSeverity || undefined,
      channel: exportChannel || undefined,
      reference: exportReference || undefined,
      vendorId: exportVendorId || undefined,
      agentId: exportAgentId || undefined,
      paymentTypeId: exportPaymentTypeId || undefined,
    })
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl rounded-lg bg-white shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Export Data Quality Issues</h3>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
              <X className="size-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
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
                        ? "border-blue-600 bg-blue-50 text-blue-700"
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
                    ? "border-blue-600 bg-blue-50 text-blue-700"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">To</label>
                  <input
                    type="date"
                    value={exportToDate}
                    onChange={(e) => setExportToDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* Status and Channel */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                <FormSelectModule
                  name="exportStatus"
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                  options={statusOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Channel</label>
                <FormSelectModule
                  name="exportChannel"
                  value={exportChannel}
                  onChange={(e) => setExportChannel(e.target.value)}
                  options={channelOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>
            </div>

            {/* Customer and Reference */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Customer</label>
                <FormSelectModule
                  name="exportCustomerId"
                  value={exportCustomerId}
                  onChange={(e) => setExportCustomerId(e.target.value)}
                  options={customerOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                  onSearchChange={handleCustomerSearch}
                  searchTerm={searchTerms?.customer || ""}
                  searchable
                  disabled={searchLoading?.customer}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Reference</label>
                <input
                  type="text"
                  placeholder="Enter reference"
                  value={exportReference}
                  onChange={(e) => setExportReference(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Vendor and Agent */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Vendor</label>
                <FormSelectModule
                  name="exportVendorId"
                  value={exportVendorId}
                  onChange={(e) => setExportVendorId(e.target.value)}
                  options={vendorOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Agent</label>
                <FormSelectModule
                  name="exportAgentId"
                  value={exportAgentId}
                  onChange={(e) => setExportAgentId(e.target.value)}
                  options={agentOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>
            </div>

            {/* Payment Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Payment Type</label>
              <FormSelectModule
                name="exportPaymentTypeId"
                value={exportPaymentTypeId}
                onChange={(e) => setExportPaymentTypeId(e.target.value)}
                options={paymentTypeOptions}
                className="w-full"
                controlClassName="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Download className="mr-2 inline-block size-4" />
              Export
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Component
interface AllDataQualityTableProps {
  agentId?: number
  customerId?: number
  appliedFilters?: AppliedFilters
  showStatisticsOnly?: boolean
}

const AllDataQualityTable: React.FC<AllDataQualityTableProps> = ({ customerId }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const customersState = useAppSelector((state) => state.customers)
  const { dataQuality, dataQualityLoading, dataQualityError, dataQualityPagination } = customersState
  const { customers } = useAppSelector((state) => state.formData)
  const { vendors } = useAppSelector((state) => state.vendors)
  const { agents } = useAppSelector((state) => state.agents)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)

  // Local state
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedItem, setSelectedItem] = useState<DataQualityItem | null>(null)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // Search states for dropdowns
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({ customer: "" })
  const [searchLoading, setSearchLoading] = useState<Record<string, boolean>>({ customer: false })

  // Debounced search ref
  const debouncedSearchRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Filter states
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    provinceId: undefined as number | undefined,
    serviceCenterId: undefined as number | undefined,
    distributionSubstationId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    paymentTypeId: undefined as number | undefined,
    ruleKey: undefined as string | undefined,
    status: undefined as "Open" | "Resolved" | "Ignored" | undefined,
    severity: undefined as "Warning" | "Error" | undefined,
    resolutionAction: undefined as string | undefined,
    fromUtc: undefined as string | undefined,
    toUtc: undefined as string | undefined,
    detectedFromUtc: undefined as string | undefined,
    detectedToUtc: undefined as string | undefined,
    paidFromUtc: undefined as string | undefined,
    paidToUtc: undefined as string | undefined,
    search: undefined as string | undefined,
    minAmount: undefined as number | undefined,
    maxAmount: undefined as number | undefined,
    sortBy: "detectedAtUtc",
    sortOrder: "desc" as "asc" | "desc",
  })

  // Applied filters that trigger API calls
  const [appliedFilters, setAppliedFilters] = useState(localFilters)

  // Pagination
  const currentPage = dataQualityPagination?.currentPage || 1
  const pageSize = dataQualityPagination?.pageSize || 10
  const totalRecords = dataQualityPagination?.totalCount || 0
  const totalPages = dataQualityPagination?.totalPages || 0

  // Filter dropdown options
  const customerOptions = [
    { value: "", label: "All Customers" },
    ...(customers?.map((customer) => ({
      value: customer.id,
      label: `${customer.fullName} (${customer.accountNumber})`,
    })) || []),
  ]

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Open", label: "Open" },
    { value: "Resolved", label: "Resolved" },
    { value: "Ignored", label: "Ignored" },
  ]

  const severityOptions = [
    { value: "", label: "All Severities" },
    { value: "Warning", label: "Warning" },
    { value: "Error", label: "Error" },
  ]

  const channelOptions = [
    { value: "", label: "All Channels" },
    { value: "Cash", label: "Cash" },
    { value: "BankTransfer", label: "Bank Transfer" },
    { value: "Pos", label: "POS" },
    { value: "Card", label: "Card" },
  ]

  const vendorOptions = [
    { value: "", label: "All Vendors" },
    ...(vendors?.map((vendor) => ({ value: vendor.id, label: vendor.name })) || []),
  ]

  const agentOptions = [
    { value: "", label: "All Agents" },
    ...(agents?.map((agent) => ({ value: agent.id, label: agent.user.fullName })) || []),
  ]

  const paymentTypeOptions = [
    { value: "", label: "All Payment Types" },
    ...(paymentTypes?.map((type) => ({ value: type.id, label: type.name })) || []),
  ]

  const resolutionActionOptions = [
    { value: "", label: "All Actions" },
    { value: "MarkAsResolved", label: "Mark as Resolved" },
    { value: "Ignore", label: "Ignore" },
    { value: "Escalate", label: "Escalate" },
    { value: "Investigate", label: "Investigate" },
  ]

  const sortOptions: SortOption[] = [
    { label: "Detected Date (Newest)", value: "detectedAtUtc", order: "desc" },
    { label: "Detected Date (Oldest)", value: "detectedAtUtc", order: "asc" },
    { label: "Customer Name A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name Z-A", value: "customerName", order: "desc" },
    { label: "Severity", value: "severity", order: "asc" },
    { label: "Status", value: "status", order: "asc" },
  ]

  // Fetch related data
  useEffect(() => {
    dispatch(fetchCustomers({ PageNumber: 1, PageSize: 100 }))
    dispatch(fetchVendors({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchAgents({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchPaymentTypes())
  }, [dispatch])

  // Fetch data quality issues
  useEffect(() => {
    const params: DataQualityParams = {
      PageNumber: currentPage,
      PageSize: pageSize,
      ...(customerId !== undefined && { CustomerId: customerId }),
      ...(searchText && { RuleKey: searchText }),
      ...(appliedFilters.customerId && { CustomerId: appliedFilters.customerId }),
      ...(appliedFilters.provinceId && { ProvinceId: appliedFilters.provinceId }),
      ...(appliedFilters.serviceCenterId && { ServiceCenterId: appliedFilters.serviceCenterId }),
      ...(appliedFilters.distributionSubstationId && {
        DistributionSubstationId: appliedFilters.distributionSubstationId,
      }),
      ...(appliedFilters.feederId && { FeederId: appliedFilters.feederId }),
      ...(appliedFilters.ruleKey && { RuleKey: appliedFilters.ruleKey }),
      ...(appliedFilters.status && { Status: appliedFilters.status }),
      ...(appliedFilters.severity && { Severity: appliedFilters.severity }),
      ...(appliedFilters.detectedFromUtc && { FromUtc: formatDateTime(appliedFilters.detectedFromUtc, true) }),
      ...(appliedFilters.detectedToUtc && { ToUtc: formatDateTime(appliedFilters.detectedToUtc, false) }),
      ...(appliedFilters.minAmount && { MinAmount: appliedFilters.minAmount }),
      ...(appliedFilters.maxAmount && { MaxAmount: appliedFilters.maxAmount }),
      SortBy: appliedFilters.sortBy,
      SortOrder: appliedFilters.sortOrder,
    }

    dispatch(fetchDataQuality(params))
  }, [dispatch, currentPage, pageSize, searchText, customerId, appliedFilters])

  const handleCustomerSearch = useCallback(
    (searchTerm: string) => {
      setSearchTerms((prev) => ({ ...prev, customer: searchTerm }))

      if (debouncedSearchRef.current.customer) {
        clearTimeout(debouncedSearchRef.current.customer)
      }

      debouncedSearchRef.current.customer = setTimeout(() => {
        if (searchTerm.trim()) {
          setSearchLoading((prev) => ({ ...prev, customer: true }))
          dispatch(
            fetchCustomers({
              PageNumber: 1,
              PageSize: 50,
              Search: searchTerm.trim(),
            })
          ).finally(() => {
            setSearchLoading((prev) => ({ ...prev, customer: false }))
          })
        } else {
          dispatch(fetchCustomers({ PageNumber: 1, PageSize: 100 }))
        }
      }, 500)
    },
    [dispatch]
  )

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  const applyFilters = () => {
    setAppliedFilters(localFilters)
  }

  const resetFilters = () => {
    setLocalFilters({
      customerId: undefined,
      provinceId: undefined,
      serviceCenterId: undefined,
      distributionSubstationId: undefined,
      feederId: undefined,
      paymentTypeId: undefined,
      ruleKey: undefined,
      status: undefined,
      severity: undefined,
      resolutionAction: undefined,
      fromUtc: undefined,
      toUtc: undefined,
      detectedFromUtc: undefined,
      detectedToUtc: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      search: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: "detectedAtUtc",
      sortOrder: "desc",
    })
    setAppliedFilters({
      customerId: undefined,
      provinceId: undefined,
      serviceCenterId: undefined,
      distributionSubstationId: undefined,
      feederId: undefined,
      paymentTypeId: undefined,
      ruleKey: undefined,
      status: undefined,
      severity: undefined,
      resolutionAction: undefined,
      fromUtc: undefined,
      toUtc: undefined,
      detectedFromUtc: undefined,
      detectedToUtc: undefined,
      paidFromUtc: undefined,
      paidToUtc: undefined,
      search: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: "detectedAtUtc",
      sortOrder: "desc",
    })
    setSearchText("")
    setSearchInput("")
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    if (trimmed.length === 0 || trimmed.length >= 3) {
      setSearchText(trimmed)
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
  }

  const handleResolve = (item: DataQualityItem) => {
    setSelectedItem(item)
    setIsResolveModalOpen(true)
  }

  const handleCloseResolveModal = () => {
    setIsResolveModalOpen(false)
    setSelectedItem(null)
    // Refresh data
    dispatch(
      fetchDataQuality({
        PageNumber: currentPage,
        PageSize: pageSize,
        ...appliedFilters,
      })
    )
  }

  const handleViewCustomer = (customerId: number) => {
    router.push(`/customers/${customerId}`)
  }

  const handleExport = async (exportParams: any) => {
    setIsExporting(true)
    setShowExportModal(false)

    try {
      // Build filtered data for export
      let filteredData = dataQuality || []

      // Apply export filters
      if (exportParams.customerId) {
        filteredData = filteredData.filter((item) => item.customerId === parseInt(exportParams.customerId))
      }
      if (exportParams.status) {
        filteredData = filteredData.filter((item) => item.status === exportParams.status)
      }
      if (exportParams.severity) {
        filteredData = filteredData.filter((item) => item.severity === exportParams.severity)
      }
      if (exportParams.ruleKey) {
        filteredData = filteredData.filter((item) =>
          item.ruleKey.toLowerCase().includes(exportParams.ruleKey.toLowerCase())
        )
      }
      if (exportParams.fromDate) {
        filteredData = filteredData.filter(
          (item) => item.detectedAtUtc && new Date(item.detectedAtUtc) >= new Date(exportParams.fromDate)
        )
      }
      if (exportParams.toDate) {
        filteredData = filteredData.filter(
          (item) => item.detectedAtUtc && new Date(item.detectedAtUtc) <= new Date(exportParams.toDate)
        )
      }

      if (filteredData.length === 0) {
        alert("No data quality issues found matching your criteria.")
        setIsExporting(false)
        return
      }

      // Generate CSV
      const headers = [
        "ID",
        "Customer Name",
        "Account Number",
        "Rule Key",
        "Issue",
        "Severity",
        "Status",
        "Detected At",
        "Resolved At",
        "Resolution Note",
        "Phone Number",
        "Email",
        "Address",
        "Is PPM",
      ]

      const csvRows = filteredData.map((item) => [
        item.id,
        item.customerName || "-",
        item.customerAccountNumber || "-",
        item.ruleKey || "-",
        item.issue || "-",
        item.severity || "-",
        item.status || "-",
        item.detectedAtUtc ? new Date(item.detectedAtUtc).toLocaleString() : "-",
        item.resolvedAtUtc ? new Date(item.resolvedAtUtc).toLocaleString() : "-",
        item.resolutionNote || "-",
        item.phoneNumber || "-",
        item.email || "-",
        item.address || "-",
        item.isPPM ? "Yes" : "No",
      ])

      const escapeCSV = (value: string | number | undefined) => {
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
      link.setAttribute("download", `data_quality_export_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleSort = (column: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }))
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.customerId) count++
    if (appliedFilters.provinceId) count++
    if (appliedFilters.serviceCenterId) count++
    if (appliedFilters.distributionSubstationId) count++
    if (appliedFilters.feederId) count++
    if (appliedFilters.ruleKey) count++
    if (appliedFilters.status) count++
    if (appliedFilters.severity) count++
    if (appliedFilters.fromUtc) count++
    if (appliedFilters.toUtc) count++
    if (appliedFilters.detectedFromUtc) count++
    if (appliedFilters.detectedToUtc) count++
    if (appliedFilters.search) count++
    if (appliedFilters.minAmount) count++
    if (appliedFilters.maxAmount) count++
    return count
  }

  const paginate = (pageNumber: number) => {
    dispatch(
      fetchDataQuality({
        PageNumber: pageNumber,
        PageSize: pageSize,
        ...appliedFilters,
      })
    )
  }

  if (dataQualityLoading && dataQuality.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-4 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Data Quality Issues</h2>
            <p className="text-sm text-gray-500">
              {totalRecords} issue(s) found • {dataQuality.filter((i) => i.status === "Open").length} open
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearch}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                placeholder="Search by rule key..."
                className="h-10 w-64 rounded-lg border border-gray-300 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:hidden"
            >
              <Filter className="size-4" />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            {/* Desktop Filter Toggle */}
            <button
              onClick={() => setShowDesktopFilters(!showDesktopFilters)}
              className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:flex"
            >
              {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
              {showDesktopFilters ? "Hide Filters" : "Show Filters"}
              {getActiveFilterCount() > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            {/* Export button */}
            <ButtonModule
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(true)}
              disabled={isExporting || dataQuality.length === 0}
              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Download className={`mr-2 size-4 ${isExporting ? "animate-pulse" : ""}`} />
              {isExporting ? "Exporting..." : "Export CSV"}
            </ButtonModule>

            {/* Refresh button */}
            <ButtonModule
              variant="outline"
              size="sm"
              onClick={() => {
                dispatch(
                  fetchDataQuality({
                    PageNumber: currentPage,
                    PageSize: pageSize,
                    ...appliedFilters,
                  })
                )
              }}
              disabled={dataQualityLoading}
              className="border-gray-300 bg-white hover:bg-gray-50"
            >
              <RefreshCw className={`mr-2 size-4 ${dataQualityLoading ? "animate-spin" : ""}`} />
              Refresh
            </ButtonModule>
          </div>
        </div>

        {/* Active filters display */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 p-2">
            {Object.entries(appliedFilters).map(([key, value]) => {
              if (!value || value === "asc" || value === "detectedAtUtc") return null
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm"
                >
                  {key}: {String(value)}
                  <button
                    onClick={() => {
                      setLocalFilters((prev) => ({ ...prev, [key]: undefined }))
                      setAppliedFilters((prev) => ({ ...prev, [key]: undefined }))
                    }}
                    className="ml-1 rounded-full hover:bg-blue-100"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )
            })}
            <button onClick={resetFilters} className="text-xs font-medium text-blue-700 hover:text-blue-800">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col-reverse items-start gap-6 lg:flex-row">
        {/* Main Table */}
        <motion.div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-3 md:p-5 lg:max-w-[calc(100%-356px)] lg:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-5 lg:flex-1"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Error Message */}
          {dataQualityError && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <p>Error loading data quality issues: {dataQualityError}</p>
            </div>
          )}

          {dataQuality.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
                <FileText className="size-6 text-gray-400" />
              </div>
              <h3 className="mt-4 text-base font-medium text-gray-900">No issues found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchText || getActiveFilterCount() > 0
                  ? "Try adjusting your search or filters"
                  : "No data quality issues detected"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        ID
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                        onClick={() => handleSort("customerName")}
                      >
                        <div className="flex items-center gap-1">
                          Customer
                          {appliedFilters.sortBy === "customerName" && (appliedFilters.sortOrder === "asc" ? "↑" : "↓")}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Rule Key
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Issue
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                        onClick={() => handleSort("severity")}
                      >
                        <div className="flex items-center gap-1">
                          Severity
                          {appliedFilters.sortBy === "severity" && (appliedFilters.sortOrder === "asc" ? "↑" : "↓")}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {appliedFilters.sortBy === "status" && (appliedFilters.sortOrder === "asc" ? "↑" : "↓")}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                        onClick={() => handleSort("detectedAtUtc")}
                      >
                        <div className="flex items-center gap-1">
                          Detected
                          {appliedFilters.sortBy === "detectedAtUtc" &&
                            (appliedFilters.sortOrder === "asc" ? "↑" : "↓")}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Type
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {dataQuality.map((item: DataQualityItem) => {
                      const severityConfig = getSeverityConfig(item.severity)
                      const statusConfig = getStatusConfig(item.status)

                      return (
                        <tr key={item.id} className="transition-colors hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{item.id}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.customerName || "-"}</p>
                              <p className="text-xs text-gray-500">{item.customerAccountNumber || "-"}</p>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{item.ruleKey || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="max-w-xs truncate text-sm text-gray-700" title={item.issue}>
                              {item.issue || "-"}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${severityConfig.color}`}
                            >
                              {severityConfig.icon}
                              {severityConfig.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}
                            >
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                            {formatDate(item.detectedAtUtc)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {item.isPPM ? (
                              <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                PPM
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex justify-end gap-2">
                              {item.status === "Open" && (
                                <button
                                  onClick={() => handleResolve(item)}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                >
                                  <CheckCircle className="size-3.5" />
                                  Resolve
                                </button>
                              )}
                              <button
                                onClick={() => handleViewCustomer(item.customerId)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                <Eye className="size-3.5" />
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of{" "}
                  {totalRecords} issues
                </div>
                <div className="flex items-center gap-2">
                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-gray-300"
                  >
                    Previous
                  </ButtonModule>

                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-gray-300"
                  >
                    Next
                  </ButtonModule>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Desktop Filters Sidebar */}
        {showDesktopFilters && (
          <motion.div
            key="desktop-filters-sidebar"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="hidden w-full flex-col rounded-md border bg-white p-3 md:p-5 lg:mt-0 lg:flex lg:w-80 lg:self-start"
          >
            <div className="mb-4 flex shrink-0 items-center justify-between border-b pb-3">
              <h2 className="text-base font-semibold text-gray-900">Filters & Sorting</h2>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <X className="size-3" />
                Clear All
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 400px)" }}>
              {/* Customer Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Customer</label>
                <FormSelectModule
                  name="customerId"
                  value={localFilters.customerId || ""}
                  onChange={(e) => handleFilterChange("customerId", e.target.value || undefined)}
                  options={customerOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                  onSearchChange={handleCustomerSearch}
                  searchTerm={searchTerms.customer}
                  searchable
                  disabled={searchLoading.customer}
                />
              </div>

              {/* Severity Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Severity</label>
                <FormSelectModule
                  name="severity"
                  value={localFilters.severity || ""}
                  onChange={(e) => handleFilterChange("severity", e.target.value || undefined)}
                  options={severityOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Rule Key Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Rule Key</label>
                <FormSelectModule
                  name="ruleKey"
                  value={localFilters.ruleKey || ""}
                  onChange={(e) => handleFilterChange("ruleKey", e.target.value || undefined)}
                  options={[{ value: "", label: "All Rules" }]}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions
                    .filter((opt) => opt.value !== "")
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("status", localFilters.status === option.value ? undefined : option.value)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors ${
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

              {/* Payment Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Payment Type</label>
                <FormSelectModule
                  name="paymentTypeId"
                  value={localFilters.paymentTypeId || ""}
                  onChange={(e) => handleFilterChange("paymentTypeId", e.target.value || undefined)}
                  options={paymentTypeOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Resolution Action Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Resolution Action</label>
                <div className="grid grid-cols-2 gap-2">
                  {resolutionActionOptions
                    .filter((opt) => opt.value !== "")
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "resolutionAction",
                            localFilters.resolutionAction === option.value ? undefined : option.value
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors ${
                          localFilters.resolutionAction === option.value
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Amount Range Filters */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Min Amount</label>
                <input
                  type="number"
                  value={localFilters.minAmount || ""}
                  onChange={(e) =>
                    handleFilterChange("minAmount", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="Enter min amount..."
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Max Amount</label>
                <input
                  type="number"
                  value={localFilters.maxAmount || ""}
                  onChange={(e) =>
                    handleFilterChange("maxAmount", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="Enter max amount..."
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                />
              </div>

              {/* Date Range Filters */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Detected From</label>
                <input
                  type="date"
                  value={localFilters.detectedFromUtc || ""}
                  onChange={(e) => handleFilterChange("detectedFromUtc", e.target.value || undefined)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Detected To</label>
                <input
                  type="date"
                  value={localFilters.detectedToUtc || ""}
                  onChange={(e) => handleFilterChange("detectedToUtc", e.target.value || undefined)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Paid From</label>
                <input
                  type="date"
                  value={localFilters.paidFromUtc || ""}
                  onChange={(e) => handleFilterChange("paidFromUtc", e.target.value || undefined)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Paid To</label>
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
                  className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700"
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
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
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
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 shrink-0 space-y-3 border-t pt-4">
              <button
                onClick={applyFilters}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Reset All
              </button>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 shrink-0 rounded-lg bg-gray-50 p-3">
              <h3 className="mb-2 text-sm font-medium text-gray-900">Summary</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">{totalRecords?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium">
                    {currentPage} / {totalPages || 1}
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
        channelOptions={channelOptions}
        statusOptions={statusOptions}
        severityOptions={severityOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
        paymentTypeOptions={paymentTypeOptions}
        resolutionActionOptions={resolutionActionOptions}
        handleCustomerSearch={handleCustomerSearch}
        searchTerms={searchTerms}
        searchLoading={searchLoading}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        customerOptions={customerOptions}
        statusOptions={statusOptions}
        channelOptions={channelOptions}
        vendorOptions={vendorOptions}
        agentOptions={agentOptions}
        paymentTypeOptions={paymentTypeOptions}
        searchTerms={searchTerms}
        searchLoading={searchLoading}
        handleCustomerSearch={handleCustomerSearch}
      />

      {/* Resolve Modal */}
      {selectedItem && (
        <ResolveDataQualityModal
          isOpen={isResolveModalOpen}
          onClose={handleCloseResolveModal}
          dataQualityItem={selectedItem}
        />
      )}
    </div>
  )
}

export default AllDataQualityTable
