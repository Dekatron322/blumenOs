"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Database,
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
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearDataQualitySummaryState,
  DataQualitySummaryParams,
  fetchDataQualitySummary,
} from "lib/redux/customerSlice"
import { fetchCountries } from "lib/redux/countriesSlice"
import { fetchDistributionSubstations, fetchFeeders, fetchServiceCenters } from "lib/redux/formDataSlice"
import AllDataQualityTable from "components/Tables/AllDataQualityTable"
import { ButtonModule } from "components/ui/Button/Button"

// Types
interface FilterModalProps {
  isOpen: boolean
  onRequestClose: () => void
  localFilters: DataQualitySummaryParams
  handleFilterChange: (key: string, value: string | number | undefined) => void
  applyFilters: () => void
  resetFilters: () => void
  provinceOptions: Array<{ value: string | number; label: string }>
  serviceStationOptions: Array<{ value: string | number; label: string }>
  distributionSubstationOptions: Array<{ value: string | number; label: string }>
  feederOptions: Array<{ value: string | number; label: string }>
  handleServiceCenterSearch?: (searchTerm: string) => void
  handleDistributionSubstationSearch?: (searchTerm: string) => void
  handleFeederSearch?: (searchTerm: string) => void
  searchTerms?: Record<string, string>
  searchLoading?: Record<string, boolean>
  activeFilterCount: number
}

// Status options for filters
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

// Helper functions
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Error":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: "text-red-600",
        light: "bg-red-100",
      }
    case "Warning":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: "text-amber-600",
        light: "bg-amber-100",
      }
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: "text-gray-600",
        light: "bg-gray-100",
      }
  }
}

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
    case "Ignored":
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: "text-gray-600",
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
  provinceOptions,
  serviceStationOptions,
  distributionSubstationOptions,
  feederOptions,
  handleServiceCenterSearch,
  handleDistributionSubstationSearch,
  handleFeederSearch,
  searchTerms = {},
  searchLoading = {},
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
              <h3 className="mt-2 text-lg font-semibold text-white">Filter Data Quality Issues</h3>
              <p className="mt-1 text-sm text-white/70">Apply filters to refine data quality issues</p>
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
                {/* Location Filters */}
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <MapPin className="size-3.5 text-[#004B23]" />
                    Location Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Province</label>
                      <FormSelectModule
                        name="provinceId"
                        value={localFilters.ProvinceId || ""}
                        onChange={(e) =>
                          handleFilterChange("ProvinceId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={provinceOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Service Center</label>
                      <FormSelectModule
                        name="serviceCenterId"
                        value={localFilters.ServiceCenterId || ""}
                        onChange={(e) =>
                          handleFilterChange("ServiceCenterId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={serviceStationOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                        onSearchChange={handleServiceCenterSearch}
                        searchTerm={searchTerms.serviceCenter || ""}
                        searchable
                        disabled={searchLoading.serviceCenter}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Distribution Substation</label>
                      <FormSelectModule
                        name="distributionSubstationId"
                        value={localFilters.DistributionSubstationId || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "DistributionSubstationId",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        options={distributionSubstationOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                        onSearchChange={handleDistributionSubstationSearch}
                        searchTerm={searchTerms.distributionSubstation || ""}
                        searchable
                        disabled={searchLoading.distributionSubstation}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Feeder</label>
                      <FormSelectModule
                        name="feederId"
                        value={localFilters.FeederId || ""}
                        onChange={(e) =>
                          handleFilterChange("FeederId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={feederOptions}
                        className="w-full"
                        controlClassName="h-9 text-xs bg-white"
                        onSearchChange={handleFeederSearch}
                        searchTerm={searchTerms.feeder || ""}
                        searchable
                        disabled={searchLoading.feeder}
                      />
                    </div>
                  </div>
                </div>

                {/* Issue Filters */}
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <AlertCircle className="size-3.5 text-[#004B23]" />
                    Issue Filters
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
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">Severity</label>
                      <FormSelectModule
                        name="severity"
                        value={localFilters.Severity || ""}
                        onChange={(e) => handleFilterChange("Severity", e.target.value || undefined)}
                        options={severityOptions}
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
                        value={localFilters.FromUtc ? new Date(localFilters.FromUtc).toISOString().slice(0, 10) : ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "FromUtc",
                            e.target.value ? new Date(e.target.value).toISOString() : undefined
                          )
                        }
                        className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">To Date</label>
                      <input
                        type="date"
                        value={localFilters.ToUtc ? new Date(localFilters.ToUtc).toISOString().slice(0, 10) : ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "ToUtc",
                            e.target.value ? new Date(e.target.value).toISOString() : undefined
                          )
                        }
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
                      {localFilters.ProvinceId && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Province</p>
                            <p className="text-[11px] text-gray-500">
                              {provinceOptions.find((opt) => opt.value === localFilters.ProvinceId)?.label ||
                                localFilters.ProvinceId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("ProvinceId", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.ServiceCenterId && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Service Center</p>
                            <p className="text-[11px] text-gray-500">
                              {serviceStationOptions.find((opt) => opt.value === localFilters.ServiceCenterId)?.label ||
                                localFilters.ServiceCenterId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("ServiceCenterId", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.DistributionSubstationId && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Distribution Substation</p>
                            <p className="text-[11px] text-gray-500">
                              {distributionSubstationOptions.find(
                                (opt) => opt.value === localFilters.DistributionSubstationId
                              )?.label || localFilters.DistributionSubstationId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("DistributionSubstationId", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.FeederId && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Feeder</p>
                            <p className="text-[11px] text-gray-500">
                              {feederOptions.find((opt) => opt.value === localFilters.FeederId)?.label ||
                                localFilters.FeederId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("FeederId", undefined)}
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
                      {localFilters.Severity && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">Severity</p>
                            <p className="text-[11px] text-gray-500">{localFilters.Severity}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("Severity", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.FromUtc && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">From Date</p>
                            <p className="text-[11px] text-gray-500">
                              {new Date(localFilters.FromUtc).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("FromUtc", undefined)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      )}
                      {localFilters.ToUtc && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <div>
                            <p className="text-[11px] font-medium text-gray-900">To Date</p>
                            <p className="text-[11px] text-gray-500">
                              {new Date(localFilters.ToUtc).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("ToUtc", undefined)}
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

// Data Quality Card Component
const DataQualityCard = ({ item, index }: { item: any; index: number }) => {
  const severityColors = getSeverityColor(item.severity)
  const statusColors = getStatusColor(item.status)

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
            <div className={`rounded-lg p-2.5 ${severityColors.light}`}>
              {item.severity === "Error" ? (
                <X className={`size-3 ${severityColors.icon}`} />
              ) : (
                <AlertTriangle className={`size-3 ${severityColors.icon}`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-gray-500">{item.ruleKey}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${severityColors.bg} ${severityColors.text} ${severityColors.border}`}
                >
                  {item.severity}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-gray-900">{item.totalCount.toLocaleString()}</span>
            <span className="text-[11px] text-gray-500">occurrences</span>
          </div>
        </div>
        <h3 className=" line-clamp-2  text-xs font-semibold text-gray-900">{item.issue}</h3>

        {/* Details Grid */}
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <div className={`rounded-full p-1 ${statusColors.bg}`}>
                {item.status === "Open" ? (
                  <AlertCircle className={`size-3.5 ${statusColors.icon}`} />
                ) : item.status === "Resolved" ? (
                  <CheckCircle className={`size-3.5 ${statusColors.icon}`} />
                ) : (
                  <X className={`size-3.5 ${statusColors.icon}`} />
                )}
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-500">Status</p>
                <p className={`text-xs font-semibold ${statusColors.text}`}>{item.status}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-1">
                <Calendar className="size-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-500">Last Detected</p>
                <p className="text-xs font-semibold text-gray-900">
                  {item.lastDetectedAt ? new Date(item.lastDetectedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Affected Records */}
        {item.affectedRecords && item.affectedRecords.length > 0 && (
          <div className="mt-3 rounded-lg bg-gray-50 p-3">
            <p className="mb-2 text-[11px] font-medium text-gray-500">Affected Records</p>
            <div className="flex flex-wrap gap-1.5">
              {item.affectedRecords.slice(0, 3).map((record: string, idx: number) => (
                <span
                  key={idx}
                  className="rounded-full border border-gray-200 bg-white px-2 py-1 font-mono text-[11px] text-gray-700"
                >
                  {record}
                </span>
              ))}
              {item.affectedRecords.length > 3 && (
                <span className="rounded-full bg-gray-200 px-2 py-1 text-[11px] text-gray-600">
                  +{item.affectedRecords.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
      </div>
    </motion.div>
  )
}

export default function DataQualityPage() {
  const dispatch = useAppDispatch()
  const { dataQualitySummary, dataQualitySummaryLoading, dataQualitySummaryError } = useAppSelector(
    (state) => state.customers
  )
  const { countries } = useAppSelector((state) => state.countries)
  const { serviceCenters, distributionSubstations, feeders } = useAppSelector((state) => state.formData)

  const [showFilterModal, setShowFilterModal] = useState(false)
  const [qualityAccordionOpen, setQualityAccordionOpen] = useState(true)
  const [showAllCards, setShowAllCards] = useState(false)

  // Search states for dropdowns
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({
    serviceCenter: "",
    distributionSubstation: "",
    feeder: "",
  })

  // Search loading states
  const [searchLoading, setSearchLoading] = useState<Record<string, boolean>>({
    serviceCenter: false,
    distributionSubstation: false,
    feeder: false,
  })

  // Debounced search ref
  const debouncedSearchRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Local state for filters
  const [localFilters, setLocalFilters] = useState<DataQualitySummaryParams>({})

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState<DataQualitySummaryParams>({})

  // Fetch data quality summary data
  useEffect(() => {
    dispatch(fetchDataQualitySummary(appliedFilters))
  }, [dispatch, appliedFilters])

  // Fetch location data for filter options
  useEffect(() => {
    dispatch(fetchCountries())
    dispatch(fetchServiceCenters({ PageNumber: 1, PageSize: 100 }))
    dispatch(fetchDistributionSubstations({ PageNumber: 1, PageSize: 100 }))
    dispatch(fetchFeeders({ PageNumber: 1, PageSize: 100 }))

    return () => {
      dispatch(clearDataQualitySummaryState())
    }
  }, [dispatch])

  // Create options arrays for location filters
  const provinceOptions = [
    { value: "", label: "All Provinces" },
    ...countries.flatMap((country) =>
      country.provinces.map((province) => ({
        value: province.id,
        label: province.name,
      }))
    ),
  ]

  const serviceStationOptions = [
    { value: "", label: "All Service Centers" },
    ...serviceCenters.map((serviceCenter) => ({
      value: serviceCenter.id,
      label: serviceCenter.name,
    })),
  ]

  const distributionSubstationOptions = [
    { value: "", label: "All Distribution Substations" },
    ...distributionSubstations.map((substation) => ({
      value: substation.id,
      label: `${substation.dssCode} (${substation.name})`,
    })),
  ]

  const feederOptions = [
    { value: "", label: "All Feeders" },
    ...feeders.map((feeder) => ({
      value: feeder.id,
      label: feeder.name,
    })),
  ]

  // Filter handlers
  const applyFilters = () => {
    setAppliedFilters({ ...localFilters })
    setShowFilterModal(false)
  }

  const resetFilters = () => {
    setLocalFilters({})
    setAppliedFilters({})
  }

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Debounced search handlers
  const handleServiceCenterSearch = useCallback(
    (searchTerm: string) => {
      setSearchTerms((prev) => ({ ...prev, serviceCenter: searchTerm }))

      if (debouncedSearchRef.current.serviceCenter) {
        clearTimeout(debouncedSearchRef.current.serviceCenter)
      }

      debouncedSearchRef.current.serviceCenter = setTimeout(() => {
        if (searchTerm.trim()) {
          setSearchLoading((prev) => ({ ...prev, serviceCenter: true }))

          const isNumericSearch = /^\d+$/.test(searchTerm.trim())
          const searchValue = isNumericSearch ? searchTerm.trim() : searchTerm.trim()

          dispatch(
            fetchServiceCenters({
              PageNumber: 1,
              PageSize: 50,
              Search: searchValue,
            })
          ).finally(() => {
            setSearchLoading((prev) => ({ ...prev, serviceCenter: false }))
          })
        } else if (searchTerm === "") {
          dispatch(
            fetchServiceCenters({
              PageNumber: 1,
              PageSize: 100,
            })
          )
        }
      }, 500)
    },
    [dispatch]
  )

  const handleDistributionSubstationSearch = useCallback(
    (searchTerm: string) => {
      setSearchTerms((prev) => ({ ...prev, distributionSubstation: searchTerm }))

      if (debouncedSearchRef.current.distributionSubstation) {
        clearTimeout(debouncedSearchRef.current.distributionSubstation)
      }

      debouncedSearchRef.current.distributionSubstation = setTimeout(() => {
        if (searchTerm.trim()) {
          setSearchLoading((prev) => ({ ...prev, distributionSubstation: true }))

          const isNumericSearch = /^\d+$/.test(searchTerm.trim())
          const searchValue = isNumericSearch ? searchTerm.trim() : searchTerm.trim()

          dispatch(
            fetchDistributionSubstations({
              PageNumber: 1,
              PageSize: 50,
              Search: searchValue,
            })
          ).finally(() => {
            setSearchLoading((prev) => ({ ...prev, distributionSubstation: false }))
          })
        } else if (searchTerm === "") {
          dispatch(
            fetchDistributionSubstations({
              PageNumber: 1,
              PageSize: 100,
            })
          )
        }
      }, 500)
    },
    [dispatch]
  )

  const handleFeederSearch = useCallback(
    (searchTerm: string) => {
      setSearchTerms((prev) => ({ ...prev, feeder: searchTerm }))

      if (debouncedSearchRef.current.feeder) {
        clearTimeout(debouncedSearchRef.current.feeder)
      }

      debouncedSearchRef.current.feeder = setTimeout(() => {
        if (searchTerm.trim()) {
          setSearchLoading((prev) => ({ ...prev, feeder: true }))

          const isNumericSearch = /^\d+$/.test(searchTerm.trim())
          const searchValue = isNumericSearch ? searchTerm.trim() : searchTerm.trim()

          dispatch(
            fetchFeeders({
              PageNumber: 1,
              PageSize: 50,
              Search: searchValue,
            })
          ).finally(() => {
            setSearchLoading((prev) => ({ ...prev, feeder: false }))
          })
        } else if (searchTerm === "") {
          dispatch(
            fetchFeeders({
              PageNumber: 1,
              PageSize: 100,
            })
          )
        }
      }, 500)
    },
    [dispatch]
  )

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.ProvinceId) count++
    if (appliedFilters.ServiceCenterId) count++
    if (appliedFilters.DistributionSubstationId) count++
    if (appliedFilters.FeederId) count++
    if (appliedFilters.RuleKey) count++
    if (appliedFilters.Status) count++
    if (appliedFilters.Severity) count++
    if (appliedFilters.FromUtc) count++
    if (appliedFilters.ToUtc) count++
    return count
  }

  // Calculate summary statistics
  const totalIssues = dataQualitySummary.reduce((sum, item) => sum + item.totalCount, 0)
  const openIssues = dataQualitySummary
    .filter((item) => item.status === "Open")
    .reduce((sum, item) => sum + item.totalCount, 0)
  const errorSeverity = dataQualitySummary
    .filter((item) => item.severity === "Error")
    .reduce((sum, item) => sum + item.totalCount, 0)
  const warningSeverity = dataQualitySummary
    .filter((item) => item.severity === "Warning")
    .reduce((sum, item) => sum + item.totalCount, 0)

  // Group by severity for chart visualization
  const severityGroups = {
    error: dataQualitySummary.filter((item) => item.severity === "Error"),
    warning: dataQualitySummary.filter((item) => item.severity === "Warning"),
  }

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
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Data Quality</h1>
                  <p className="mt-1 text-sm text-gray-600">Monitor and manage data quality issues across the system</p>
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
                {/* Total Issues Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Database className="size-4 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Total Issues</h3>
                        <p className="text-xs text-gray-500">across all categories</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-blue-700">
                      {dataQualitySummaryLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : dataQualitySummaryError ? (
                        <span className="text-red-500">-</span>
                      ) : (
                        totalIssues.toLocaleString() || "0"
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Issue Density</span>
                      <span className="font-medium text-gray-900">
                        {dataQualitySummaryLoading
                          ? "..."
                          : dataQualitySummaryError
                          ? "0"
                          : Math.min(100, Math.round((totalIssues / Math.max(1, dataQualitySummary.length)) * 100))}
                        %
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: dataQualitySummaryLoading
                            ? "0%"
                            : dataQualitySummaryError
                            ? "0%"
                            : `${Math.min(100, (totalIssues / Math.max(1, dataQualitySummary.length)) * 100)}%`,
                        }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      />
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-red-50 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <X className="size-3 text-red-600" />
                        <span className="text-xs font-medium text-red-700">Errors</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-red-900">
                        {dataQualitySummaryLoading
                          ? "..."
                          : dataQualitySummaryError
                          ? "-"
                          : errorSeverity.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <AlertTriangle className="size-3 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">Warnings</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-amber-900">
                        {dataQualitySummaryLoading
                          ? "..."
                          : dataQualitySummaryError
                          ? "-"
                          : warningSeverity.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Open Issues Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-amber-100 p-2">
                        <Activity className="size-4 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Open Issues</h3>
                        <p className="text-xs text-gray-500">pending resolution</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-amber-700">
                      {dataQualitySummaryLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : dataQualitySummaryError ? (
                        <span className="text-red-500">-</span>
                      ) : (
                        openIssues.toLocaleString() || "0"
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Resolution Rate</span>
                      <span className="font-medium text-gray-900">
                        {dataQualitySummaryLoading
                          ? "..."
                          : dataQualitySummaryError
                          ? "0"
                          : Math.round(((totalIssues - openIssues) / Math.max(1, totalIssues)) * 100)}
                        %
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: dataQualitySummaryLoading
                            ? "0%"
                            : dataQualitySummaryError
                            ? "0%"
                            : `${Math.round(((totalIssues - openIssues) / Math.max(1, totalIssues)) * 100)}%`,
                        }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                      />
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-emerald-50 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="size-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Resolved</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-emerald-900">
                        {dataQualitySummaryLoading
                          ? "..."
                          : dataQualitySummaryError
                          ? "-"
                          : (totalIssues - openIssues).toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="size-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">In Progress</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-blue-900">
                        {dataQualitySummaryLoading
                          ? "..."
                          : dataQualitySummaryError
                          ? "-"
                          : Math.floor(openIssues * 0.3).toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Data Quality Summary - Card Grid */}
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
                        <h2 className="text-lg font-semibold text-gray-900">Data Quality Summary</h2>
                        <p className="text-sm text-gray-600">{dataQualitySummary.length} quality rules evaluated</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setQualityAccordionOpen(!qualityAccordionOpen)}
                      className="rounded-lg p-2 hover:bg-gray-100"
                    >
                      <ChevronDown
                        className={`size-5 text-gray-500 transition-transform duration-200 ${
                          qualityAccordionOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {qualityAccordionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-6"
                    >
                      {dataQualitySummaryLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="flex items-center gap-3">
                            <Loader2 className="size-5 animate-spin text-gray-500" />
                            <span className="text-sm text-gray-500">Loading data quality summary...</span>
                          </div>
                        </div>
                      ) : dataQualitySummaryError ? (
                        <div className="py-12 text-center">
                          <AlertCircle className="mx-auto mb-3 size-8 text-red-500" />
                          <p className="text-sm text-red-600">{dataQualitySummaryError}</p>
                        </div>
                      ) : !dataQualitySummary || dataQualitySummary.length === 0 ? (
                        <div className="py-12 text-center">
                          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100">
                            <CheckCircle className="size-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600">No data quality issues found</p>
                          <p className="mt-1 text-xs text-gray-500">All systems are functioning normally</p>
                        </div>
                      ) : (
                        <div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {dataQualitySummary
                              .slice(0, showAllCards ? dataQualitySummary.length : 3)
                              .map((item, index) => (
                                <DataQualityCard key={index} item={item} index={index} />
                              ))}
                          </div>
                          {dataQualitySummary.length > 3 && (
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
                                    Load More ({dataQualitySummary.length - 3} more)
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

              {/* All Data Quality Table */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <AllDataQualityTable />
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
        provinceOptions={provinceOptions}
        serviceStationOptions={serviceStationOptions}
        distributionSubstationOptions={distributionSubstationOptions}
        feederOptions={feederOptions}
        handleServiceCenterSearch={handleServiceCenterSearch}
        handleDistributionSubstationSearch={handleDistributionSubstationSearch}
        handleFeederSearch={handleFeederSearch}
        searchTerms={searchTerms}
        searchLoading={searchLoading}
        activeFilterCount={getActiveFilterCount()}
      />
    </section>
  )
}
