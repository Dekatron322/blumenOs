"use client"
import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, AlertTriangle, Clock, FileIcon, Filter, RefreshCw, RotateCcw, TrendingUp, X } from "lucide-react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"

import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { SearchModule } from "components/ui/Search/search-module"

import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearRetryAllError,
  clearRetryError,
  fetchMeterCaptures,
  MeterCaptureRequestParams,
  retryAllFailed,
  retryMeterCapture,
} from "lib/redux/meterCaptureSlice"
import { fetchVendorSummaryReport, VendorSummaryReportRequestParams } from "lib/redux/postpaidSlice"
import { fetchVendors } from "lib/redux/vendorSlice"
import { VscEye } from "react-icons/vsc"
import MeterCaptureDetailsModal from "components/ui/Modal/MeterCaptureDetailsModal"
import { notify } from "components/ui/Notification/Notification"
import { getVendorEnumerationStatusText, VendorEnumerationStatus } from "lib/types/vendorEnumeration"
import { DateFilter, getDateRangeUtc } from "utils/dateRange"

// Status options for meter captures
const statusOptions = [
  { value: "", label: "All Statuses" },
  {
    value: VendorEnumerationStatus.Captured.toString(),
    label: getVendorEnumerationStatusText(VendorEnumerationStatus.Captured),
  },
  {
    value: VendorEnumerationStatus.Processed.toString(),
    label: getVendorEnumerationStatusText(VendorEnumerationStatus.Processed),
  },
  {
    value: VendorEnumerationStatus.Failed.toString(),
    label: getVendorEnumerationStatusText(VendorEnumerationStatus.Failed),
  },
]

// Source options for meter captures
const sourceOptions = [
  { value: "", label: "All Sources" },
  { value: "API", label: "API" },
  { value: "CSV", label: "CSV Upload" },
  { value: "MANUAL", label: "Manual Entry" },
]

// Filter Modal Component
const FilterModal = ({
  isOpen,
  onRequestClose,
  timeFilter,
  summaryVendorIdFilter,
  summarySourceFilter,
  customStartDate,
  customEndDate,
  vendors,
  vendorsLoading,
  vendorsError,
  handleTimeFilterChange,
  handleSummaryVendorIdFilterChange,
  handleSummarySourceFilterChange,
  handleCustomDateChange,
  clearSummaryFilters,
  refreshVendorSummaryData,
}: {
  isOpen: boolean
  onRequestClose: () => void
  timeFilter: DateFilter
  summaryVendorIdFilter: string
  summarySourceFilter: string
  customStartDate: string
  customEndDate: string
  vendors: any[]
  vendorsLoading: boolean
  vendorsError: string | null
  handleTimeFilterChange: (filter: DateFilter) => void
  handleSummaryVendorIdFilterChange: (vendorId: string) => void
  handleSummarySourceFilterChange: (source: string) => void
  handleCustomDateChange: (field: "start" | "end", value: string) => void
  clearSummaryFilters: () => void
  refreshVendorSummaryData: () => void
}) => {
  const [modalTab, setModalTab] = useState<"filters" | "active">("filters")

  const handleSubmit = () => {
    refreshVendorSummaryData()
    onRequestClose()
  }

  const handleClearAll = () => {
    clearSummaryFilters()
    onRequestClose()
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (customStartDate && customEndDate) count++
    if (summaryVendorIdFilter) count++
    if (summarySourceFilter) count++
    return count
  }

  const getTimeFilterLabel = (filter: DateFilter) => {
    if (filter === "day") return "Today"
    if (filter === "yesterday") return "Yesterday"
    if (filter === "week") return "This Week"
    if (filter === "lastWeek") return "Last Week"
    if (filter === "month") return "This Month"
    if (filter === "lastMonth") return "Last Month"
    if (filter === "year") return "This Year"
    if (filter === "lastYear") return "Last Year"
    return "All Time"
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
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-green-600 to-green-800 px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2">
                  <Filter className="text-lg text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Filter Vendor Summary Report</h3>
                  <p className="mt-1 text-sm text-white/80">Refine your summary data with specific criteria</p>
                </div>
              </div>
              {getActiveFilterCount() > 0 && (
                <motion.div
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="size-2 rounded-full bg-white" />
                  {getActiveFilterCount()} filter{getActiveFilterCount() === 1 ? "" : "s"} applied
                </motion.div>
              )}
            </div>
            <motion.button
              onClick={onRequestClose}
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="text-xl" />
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
                {/* Quick Actions Bar */}
                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-1">
                      <TrendingUp className="size-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-900">Quick API Actions</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const today = new Date()
                        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
                        handleCustomDateChange("start", startOfDay.toISOString().slice(0, 16))
                        handleCustomDateChange("end", endOfDay.toISOString().slice(0, 16))
                        handleSummaryVendorIdFilterChange("")
                        handleSummarySourceFilterChange("")
                      }}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-50"
                    >
                      Today (startDateUtc/endDateUtc)
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date()
                        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
                        const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
                        handleCustomDateChange("start", weekStart.toISOString().slice(0, 16))
                        handleCustomDateChange("end", weekEnd.toISOString().slice(0, 16))
                        handleSummaryVendorIdFilterChange("")
                        handleSummarySourceFilterChange("")
                      }}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-green-700 shadow-sm hover:bg-green-50"
                    >
                      This Week All Vendors
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date()
                        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
                        handleCustomDateChange("start", monthStart.toISOString().slice(0, 16))
                        handleCustomDateChange("end", monthEnd.toISOString().slice(0, 16))
                        handleSummaryVendorIdFilterChange("")
                        handleSummarySourceFilterChange("API")
                      }}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-purple-700 shadow-sm hover:bg-purple-50"
                    >
                      This Month API Only
                    </button>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Clock className="text-lg text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Date Range</h4>
                        <p className="text-sm text-gray-500">Filter by startDateUtc and endDateUtc parameters</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Start Date (UTC)</label>
                      <input
                        type="datetime-local"
                        value={customStartDate}
                        onChange={(e) => handleCustomDateChange("start", e.target.value)}
                        className="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">End Date (UTC)</label>
                      <input
                        type="datetime-local"
                        value={customEndDate}
                        onChange={(e) => handleCustomDateChange("end", e.target.value)}
                        className="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Vendor ID Filter */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-100 p-2">
                        <AlertTriangle className="text-lg text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Vendor</h4>
                        <p className="text-sm text-gray-500">Filter by vendor</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {/* Vendor Tabs */}
                    <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                      <button
                        onClick={() => handleSummaryVendorIdFilterChange("")}
                        className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          summaryVendorIdFilter === ""
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        All Vendors
                      </button>
                      {!vendorsLoading &&
                        !vendorsError &&
                        vendors.slice(0, 20).map((vendor) => (
                          <button
                            key={vendor.id}
                            onClick={() => handleSummaryVendorIdFilterChange(vendor.id.toString())}
                            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                              summaryVendorIdFilter === vendor.id.toString()
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {vendor.name}
                          </button>
                        ))}
                    </div>

                    {/* Loading/Error States */}
                    {vendorsLoading && (
                      <div className="flex items-center justify-center py-2">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-green-500"></div>
                        <p className="text-xs text-gray-500">Loading vendors...</p>
                      </div>
                    )}
                    {vendorsError && <p className="text-xs text-red-500">Error loading vendors: {vendorsError}</p>}

                    {/* Show more vendors indicator */}
                    {!vendorsLoading && !vendorsError && vendors.length > 20 && (
                      <p className="text-xs italic text-gray-500">
                        Showing first 20 of {vendors.length} vendors. Scroll to see more.
                      </p>
                    )}
                  </div>
                </div>

                {/* Source Filter */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-100 p-2">
                        <FileIcon className="text-lg text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Source</h4>
                        <p className="text-sm text-gray-500">Filter by source parameter (API | CSV | MANUAL)</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSummarySourceFilterChange("")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        summarySourceFilter === ""
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Sources
                    </button>
                    <button
                      onClick={() => handleSummarySourceFilterChange("API")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        summarySourceFilter === "API"
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      API
                    </button>
                    <button
                      onClick={() => handleSummarySourceFilterChange("CSV")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        summarySourceFilter === "CSV"
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      CSV Upload
                    </button>
                    <button
                      onClick={() => handleSummarySourceFilterChange("MANUAL")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        summarySourceFilter === "MANUAL"
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Manual Entry
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {getActiveFilterCount() > 0 && (
                <span>
                  {getActiveFilterCount()} filter{getActiveFilterCount() === 1 ? "" : "s"} applied
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClearAll}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-gradient-to-r from-green-600 to-green-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:from-blue-700 hover:to-indigo-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface ActionDropdownProps {
  meterCapture: any
  onViewDetails: (meterCapture: any) => void
}

const LoadingSkeleton = () => {
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-4 py-8 2xl:container max-sm:px-2 xl:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Bulk Upload Management</h4>
                <p className="text-gray-600">Track and manage CSV bulk upload jobs</p>
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
                      {[...Array(13)].map((_, i) => (
                        <th key={i} className="whitespace-nowrap border-b p-4">
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {[...Array(13)].map((_, cellIndex) => (
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

const MeterCapture: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    meterCaptures,
    loading,
    error,
    pagination,
    retryLoading,
    retryError,
    retrySuccess,
    retryAllLoading,
    retryAllError,
    retryAllSuccess,
  } = useAppSelector((state) => state.meterCapture)

  const { vendorSummaryReport, vendorSummaryReportLoading, vendorSummaryReportError } = useAppSelector(
    (state) => state.postpaidBilling
  )

  const { vendors, loading: vendorsLoading, error: vendorsError } = useAppSelector((state) => state.vendors)

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [isSortExpanded, setIsSortExpanded] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [selectedCapture, setSelectedCapture] = useState<any>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)
  const [timeFilter, setTimeFilter] = useState<DateFilter>("month")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [showSummaryFilters, setShowSummaryFilters] = useState(false)
  const [summaryVendorIdFilter, setSummaryVendorIdFilter] = useState("")
  const [summarySourceFilter, setSummarySourceFilter] = useState("")
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Local state for filters
  const [localFilters, setLocalFilters] = useState<Partial<MeterCaptureRequestParams>>({
    pageNumber: 1,
    pageSize: 10,
    vendorId: undefined,
    status: undefined,
    referenceId: undefined,
    source: undefined,
    accountNumber: undefined,
    meterNumber: undefined,
    fromUtc: undefined,
    toUtc: undefined,
  })

  // Separate state for table-only refresh
  const [tableRefreshKey, setTableRefreshKey] = useState(0)

  // Show toast notifications for retry operations
  useEffect(() => {
    if (retrySuccess) {
      notify("success", "The meter capture has been queued for retry.", { title: "Retry Successful" })
      dispatch(clearRetryError())
    }
  }, [retrySuccess, dispatch])

  useEffect(() => {
    if (retryError) {
      notify("error", retryError, { title: "Retry Failed" })
    }
  }, [retryError])

  useEffect(() => {
    if (retryAllSuccess) {
      notify("success", "All failed meter captures have been queued for retry.", { title: "Retry All Successful" })
      dispatch(clearRetryAllError())
    }
  }, [retryAllSuccess, dispatch])

  useEffect(() => {
    if (retryAllError) {
      notify("error", retryAllError, { title: "Retry All Failed" })
    }
  }, [retryAllError])

  // Initial load and filter changes
  useEffect(() => {
    const fetchParams: MeterCaptureRequestParams = {
      pageNumber: currentPage,
      pageSize: 10,
      ...(localFilters.vendorId && { vendorId: localFilters.vendorId }),
      ...(localFilters.status && { status: localFilters.status }),
      ...(localFilters.referenceId && { referenceId: localFilters.referenceId }),
      ...(localFilters.source && { source: localFilters.source }),
      ...(localFilters.accountNumber && { accountNumber: localFilters.accountNumber }),
      ...(localFilters.meterNumber && { meterNumber: localFilters.meterNumber }),
      ...(localFilters.fromUtc && { fromUtc: localFilters.fromUtc }),
      ...(localFilters.toUtc && { toUtc: localFilters.toUtc }),
    }

    void dispatch(fetchMeterCaptures(fetchParams))
    setHasInitialLoad(true)
  }, [dispatch, currentPage, localFilters, tableRefreshKey])

  // Separate handler for table-only refresh
  const handleRefreshTableData = useCallback(() => {
    // This only triggers a table refresh by incrementing the refresh key
    setTableRefreshKey((prev) => prev + 1)
  }, [])

  // Keep the existing refresh handler for other purposes if needed
  const handleRefreshData = useCallback(() => {
    const fetchParams: MeterCaptureRequestParams = {
      pageNumber: currentPage,
      pageSize: 10,
      ...(localFilters.vendorId && { vendorId: localFilters.vendorId }),
      ...(localFilters.status && { status: localFilters.status }),
      ...(localFilters.referenceId && { referenceId: localFilters.referenceId }),
      ...(localFilters.source && { source: localFilters.source }),
      ...(localFilters.accountNumber && { accountNumber: localFilters.accountNumber }),
      ...(localFilters.meterNumber && { meterNumber: localFilters.meterNumber }),
      ...(localFilters.fromUtc && { fromUtc: localFilters.fromUtc }),
      ...(localFilters.toUtc && { toUtc: localFilters.toUtc }),
    }
    void dispatch(fetchMeterCaptures(fetchParams))
  }, [dispatch, currentPage, localFilters])

  const handleSearch = useCallback(() => {
    const fetchParams: MeterCaptureRequestParams = {
      pageNumber: 1,
      pageSize: 10,
      ...(localFilters.vendorId && { vendorId: localFilters.vendorId }),
      ...(localFilters.status && { status: localFilters.status }),
      ...(localFilters.referenceId && { referenceId: localFilters.referenceId }),
      ...(localFilters.source && { source: localFilters.source }),
      ...(localFilters.accountNumber && { accountNumber: localFilters.accountNumber }),
      ...(localFilters.meterNumber && { meterNumber: localFilters.meterNumber }),
      ...(localFilters.fromUtc && { fromUtc: localFilters.fromUtc }),
      ...(localFilters.toUtc && { toUtc: localFilters.toUtc }),
    }
    setCurrentPage(1)
    void dispatch(fetchMeterCaptures(fetchParams))
  }, [dispatch, localFilters])

  const handleFilterChange = (key: keyof MeterCaptureRequestParams, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  const applyFilters = () => {
    setCurrentPage(1)
    // Trigger a fresh fetch with updated filters
    handleRefreshData()
  }

  const resetFilters = () => {
    setLocalFilters({
      pageNumber: 1,
      pageSize: 10,
      vendorId: undefined,
      status: undefined,
      referenceId: undefined,
      source: undefined,
      accountNumber: undefined,
      meterNumber: undefined,
      fromUtc: undefined,
      toUtc: undefined,
    })
    setSearchText("")
    setCurrentPage(1)
  }

  // Fetch vendor summary report data
  const refreshVendorSummaryData = () => {
    const requestParams: VendorSummaryReportRequestParams = {
      vendorId: summaryVendorIdFilter ? parseInt(summaryVendorIdFilter) : 0,
      startDateUtc: customStartDate || "",
      endDateUtc: customEndDate || "",
    }

    // Update parameters if they are explicitly provided
    if (customStartDate && customEndDate) {
      requestParams.startDateUtc = customStartDate
      requestParams.endDateUtc = customEndDate
    }

    if (summaryVendorIdFilter) {
      requestParams.vendorId = parseInt(summaryVendorIdFilter)
    }

    if (summarySourceFilter) {
      requestParams.source = summarySourceFilter
    }

    dispatch(fetchVendorSummaryReport(requestParams))
  }

  // Fetch vendor summary report on component mount and when filters change
  useEffect(() => {
    refreshVendorSummaryData()
  }, [customStartDate, customEndDate, summaryVendorIdFilter, summarySourceFilter])

  // Fetch vendors list on component mount
  useEffect(() => {
    dispatch(fetchVendors({ pageNumber: 1, pageSize: 1000 })) // Fetch all vendors
  }, [dispatch])

  const getActiveFilterCount = () => {
    return Object.entries(localFilters).filter(([key, value]) => {
      if (key === "pageNumber" || key === "pageSize") return false
      return value !== undefined && value !== ""
    }).length
  }

  const getSourceLabel = (source: string) => {
    const option = sourceOptions.find((opt) => opt.value === source)
    return option?.label || source
  }

  // Vendor summary report filter handlers
  const handleSummaryVendorIdFilterChange = (vendorId: string) => {
    setSummaryVendorIdFilter(vendorId)
  }

  const handleSummarySourceFilterChange = (source: string) => {
    setSummarySourceFilter(source)
  }

  const handleTimeFilterChange = (filter: DateFilter) => {
    setTimeFilter(filter)
  }

  const handleCustomDateChange = (field: "start" | "end", value: string) => {
    if (field === "start") {
      setCustomStartDate(value)
    } else {
      setCustomEndDate(value)
    }
  }

  const clearSummaryFilters = () => {
    setCustomStartDate("")
    setCustomEndDate("")
    setSummaryVendorIdFilter("")
    setSummarySourceFilter("")
  }

  const getSummaryActiveFilterCount = () => {
    let count = 0
    if (customStartDate && customEndDate) count++
    if (summaryVendorIdFilter) count++
    if (summarySourceFilter) count++
    return count
  }

  const getStatusLabel = (status: number) => {
    return getVendorEnumerationStatusText(status as VendorEnumerationStatus)
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case VendorEnumerationStatus.Captured:
        return "text-amber-700 bg-amber-100"
      case VendorEnumerationStatus.Processed:
        return "text-blue-700 bg-blue-100"
      case VendorEnumerationStatus.Failed:
        return "text-red-700 bg-red-100"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const handleViewDetails = (meterCapture: any) => {
    setSelectedCapture(meterCapture)
    setIsDetailsModalOpen(true)
  }

  const handleRetry = async (id: number) => {
    try {
      const result = await dispatch(retryMeterCapture(id)).unwrap()
      // Refresh the data after successful retry
      handleRefreshTableData()
      return result
    } catch (error) {
      // Error is handled in the Redux state
      console.error("Retry failed:", error)
      throw error
    }
  }

  const handleRetryAllFailed = async () => {
    try {
      const result = await dispatch(retryAllFailed()).unwrap()
      // Refresh the data after successful retry
      handleRefreshTableData()
      return result
    } catch (error) {
      // Error is handled in the Redux state
      console.error("Retry all failed:", error)
      throw error
    }
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedCapture(null)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (loading && !hasInitialLoad) {
    return <LoadingSkeleton />
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full  px-3 py-8 2xl:container max-sm:px-2 md:px-4 lg:px-6 2xl:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Meter Capture Management</h4>
                <p className="text-gray-600">View and manage meter enumeration data</p>
              </div>
              <ButtonModule
                onClick={handleRetryAllFailed}
                disabled={retryAllLoading}
                icon={<RotateCcw className={`size-4 ${retryAllLoading ? "animate-spin" : ""}`} />}
              >
                {retryAllLoading ? "Retrying..." : "Retry Failed Captures"}
              </ButtonModule>
            </div>

            {/* Vendor Summary Report Cards */}
            <div className="mb-6 rounded-lg border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">Vendor Summary Report</h3>
                  {getSummaryActiveFilterCount() > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getSummaryActiveFilterCount()} active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowFilterModal(true)} className="rounded-lg p-2 hover:bg-gray-100">
                    <Filter className="size-4" />
                  </button>
                  <button
                    onClick={refreshVendorSummaryData}
                    disabled={vendorSummaryReportLoading}
                    className="rounded-lg p-2 hover:bg-gray-100"
                  >
                    <RefreshCw className={`size-4 ${vendorSummaryReportLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {/* Total Count Card */}
                <div className="group relative overflow-hidden rounded-xl bg-blue-50 p-4 transition-all hover:bg-blue-100 md:p-5">
                  <div className="absolute -right-4 -top-4 size-16 rounded-full bg-blue-100/50 transition-transform group-hover:scale-110" />
                  <div className="relative">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-blue-200">
                        <FileIcon className="size-4 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wider text-blue-700">Total Count</p>
                    <p className="mt-1 text-lg font-bold text-blue-900 md:text-xl lg:text-2xl">
                      {vendorSummaryReportLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : vendorSummaryReportError ? (
                        <span className="text-red-500">Error</span>
                      ) : (
                        vendorSummaryReport?.totalCount?.toLocaleString() || "0"
                      )}
                    </p>
                    <p className="mt-1 text-xs text-blue-600">All enumerations</p>
                  </div>
                </div>

                {/* Captured Count Card */}
                <div className="group relative overflow-hidden rounded-xl bg-emerald-50 p-4 transition-all hover:bg-emerald-100 md:p-5">
                  <div className="absolute -right-4 -top-4 size-16 rounded-full bg-emerald-100/50 transition-transform group-hover:scale-110" />
                  <div className="relative">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-200">
                        <TrendingUp className="size-4 text-emerald-600" />
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">Captured</p>
                    <p className="mt-1 text-lg font-bold text-emerald-900 md:text-xl lg:text-2xl">
                      {vendorSummaryReportLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : vendorSummaryReportError ? (
                        <span className="text-red-500">Error</span>
                      ) : (
                        vendorSummaryReport?.capturedCount?.toLocaleString() || "0"
                      )}
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">
                      {vendorSummaryReport?.totalCount
                        ? Math.round((vendorSummaryReport.capturedCount / vendorSummaryReport.totalCount) * 100)
                        : 0}
                      % captured
                    </p>
                  </div>
                </div>

                {/* Processed Count Card */}
                <div className="group relative overflow-hidden rounded-xl bg-amber-50 p-4 transition-all hover:bg-amber-100 md:p-5">
                  <div className="absolute -right-4 -top-4 size-16 rounded-full bg-amber-100/50 transition-transform group-hover:scale-110" />
                  <div className="relative">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-amber-200">
                        <Clock className="size-4 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wider text-amber-700">Processed</p>
                    <p className="mt-1 text-lg font-bold text-amber-900 md:text-xl lg:text-2xl">
                      {vendorSummaryReportLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : vendorSummaryReportError ? (
                        <span className="text-red-500">Error</span>
                      ) : (
                        vendorSummaryReport?.processedCount?.toLocaleString() || "0"
                      )}
                    </p>
                    <p className="mt-1 text-xs text-amber-600">
                      {vendorSummaryReport?.totalCount
                        ? Math.round((vendorSummaryReport.processedCount / vendorSummaryReport.totalCount) * 100)
                        : 0}
                      % processed
                    </p>
                  </div>
                </div>

                {/* Failed Count Card */}
                <div className="group relative overflow-hidden rounded-xl bg-red-50 p-4 transition-all hover:bg-red-100 md:p-5">
                  <div className="absolute -right-4 -top-4 size-16 rounded-full bg-red-100/50 transition-transform group-hover:scale-110" />
                  <div className="relative">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-red-200">
                        <AlertTriangle className="size-4 text-red-600" />
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wider text-red-700">Failed</p>
                    <p className="mt-1 text-lg font-bold text-red-900 md:text-xl lg:text-2xl">
                      {vendorSummaryReportLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : vendorSummaryReportError ? (
                        <span className="text-red-500">Error</span>
                      ) : (
                        vendorSummaryReport?.failedCount?.toLocaleString() || "0"
                      )}
                    </p>
                    <p className="mt-1 text-xs text-red-600">
                      {vendorSummaryReport?.totalCount
                        ? Math.round((vendorSummaryReport.failedCount / vendorSummaryReport.totalCount) * 100)
                        : 0}
                      % failure rate
                    </p>
                  </div>
                </div>
              </div>

              {/* Error State */}
              {vendorSummaryReportError && (
                <div className="mt-4 rounded-lg bg-red-50 p-4">
                  <div className="flex items-center gap-3">
                    <svg className="size-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-800">Error loading summary data</h4>
                      <p className="text-xs text-red-700">{vendorSummaryReportError}</p>
                    </div>
                    <button
                      onClick={refreshVendorSummaryData}
                      className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filters Section */}
            <div className="mb-6 rounded-lg border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <div className="flex items-center gap-2">
                  {getActiveFilterCount() > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getActiveFilterCount()} active
                    </span>
                  )}
                  <button
                    onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                    className="rounded-lg p-2 hover:bg-gray-100"
                  >
                    <Filter className="size-4" />
                  </button>
                </div>
              </div>

              {showDesktopFilters && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Search */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Search</label>
                    <SearchModule
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onSearch={handleSearch}
                      placeholder="Search captures..."
                      className="w-full md:w-auto"
                      bgClassName="bg-white"
                      searchTypeOptions={undefined}
                      onSearchTypeChange={undefined}
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
                      placeholder="Vendor ID..."
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                    <FormSelectModule
                      name="status"
                      value={localFilters.status?.toString() || ""}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value ? Number(e.target.value) : undefined)
                      }
                      options={statusOptions}
                      className="w-full"
                      controlClassName="h-9 text-sm"
                    />
                  </div>

                  {/* Source Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Source</label>
                    <FormSelectModule
                      name="source"
                      value={localFilters.source || ""}
                      onChange={(e) => handleFilterChange("source", e.target.value)}
                      options={sourceOptions}
                      className="w-full"
                      controlClassName="h-9 text-sm"
                    />
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">From Date</label>
                    <input
                      type="date"
                      value={localFilters.fromUtc || ""}
                      onChange={(e) => handleFilterChange("fromUtc", e.target.value)}
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">To Date</label>
                    <input
                      type="date"
                      value={localFilters.toUtc || ""}
                      onChange={(e) => handleFilterChange("toUtc", e.target.value)}
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    />
                  </div>

                  {/* Reference ID Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Reference ID</label>
                    <input
                      type="text"
                      value={localFilters.referenceId || ""}
                      onChange={(e) => handleFilterChange("referenceId", e.target.value)}
                      placeholder="Reference ID..."
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    />
                  </div>

                  {/* Account Number Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Account Number</label>
                    <input
                      type="text"
                      value={localFilters.accountNumber || ""}
                      onChange={(e) => handleFilterChange("accountNumber", e.target.value)}
                      placeholder="Account Number..."
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    />
                  </div>

                  {/* Meter Number Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Meter Number</label>
                    <input
                      type="text"
                      value={localFilters.meterNumber || ""}
                      onChange={(e) => handleFilterChange("meterNumber", e.target.value)}
                      placeholder="Meter Number..."
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-end gap-2">
                    <button onClick={applyFilters} className="button-filled flex-1 rounded-md px-3 py-2 text-sm">
                      Apply
                    </button>
                    <button onClick={resetFilters} className="button-outlined flex-1 rounded-md px-3 py-2 text-sm">
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="rounded-lg border bg-white">
              {/* Results Header */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Meter Captures</h3>
                    {pagination && (
                      <p className="text-sm text-gray-600">
                        Showing {meterCaptures.length} of {pagination.totalCount} captures
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <ButtonModule
                      variant="outline"
                      onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                      size="sm"
                    >
                      <Filter className="size-4" />
                      {showDesktopFilters ? "Hide Filters" : "Show Filters"}
                    </ButtonModule>
                    <ButtonModule variant="outline" onClick={handleRefreshTableData} disabled={loading} size="sm">
                      <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                      Refresh
                    </ButtonModule>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="size-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="max-h-[70vh] w-full overflow-x-auto overflow-y-hidden ">
                <div className="min-w-[1600px]">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Vendor Name</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Reference ID</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Purpose</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Account Number</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Installer Name</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">New Meter Number</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Old Meter Number</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Status</th>
                        {/* <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Source</th> */}
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Created</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Processed</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Error</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meterCaptures.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="border-b p-8 text-center">
                            <div className="text-gray-500">
                              <FileIcon className="mx-auto mb-2 size-12 text-gray-300" />
                              <p>No meter captures found</p>
                              <p className="text-sm">Try adjusting your filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        meterCaptures.map((capture) => (
                          <tr key={capture.id} className="border-b hover:bg-gray-50">
                            <td className="border-b p-3 text-sm">
                              <div className="font-medium">{capture.vendorName}</div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="max-w-xs truncate whitespace-nowrap" title={capture.referenceId}>
                                {capture.referenceId}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="max-w-xs truncate whitespace-nowrap" title={capture.purpose}>
                                {capture.purpose || "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="max-w-xs truncate whitespace-nowrap" title={capture.accountNumber}>
                                {capture.accountNumber || "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="max-w-xs truncate whitespace-nowrap" title={capture.installerName}>
                                {capture.installerName || "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="max-w-xs truncate whitespace-nowrap" title={capture.newMeterNumber}>
                                {capture.newMeterNumber || "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="max-w-xs truncate whitespace-nowrap" title={capture.oldMeterNumber}>
                                {capture.oldMeterNumber || "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <span
                                className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                  capture.status
                                )}`}
                              >
                                {getStatusLabel(capture.status)}
                              </span>
                            </td>
                            {/* <td className="border-b p-3 text-sm">
                              <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                                {getSourceLabel(capture.source)}
                              </span>
                            </td> */}
                            <td className="border-b p-3 text-sm">{new Date(capture.createdAtUtc).toLocaleString()}</td>
                            <td className="border-b p-3 text-sm">
                              {capture.processedAtUtc ? new Date(capture.processedAtUtc).toLocaleString() : "N/A"}
                            </td>
                            <td className="border-b p-3 text-sm">
                              {capture.error ? (
                                <div className="max-w-xs truncate text-red-600" title={capture.error}>
                                  {capture.error}
                                </div>
                              ) : (
                                <span className="text-green-600">None</span>
                              )}
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="flex items-center gap-2">
                                {capture.error && (
                                  <ButtonModule
                                    variant="outline"
                                    size="sm"
                                    icon={<VscEye />}
                                    onClick={() => handleViewDetails(capture)}
                                    className="whitespace-nowrap"
                                  >
                                    View Details
                                  </ButtonModule>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="border-t p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevious}
                        className="rounded-lg border p-2 disabled:opacity-50"
                      >
                        <MdOutlineArrowBackIosNew className="size-4" />
                      </button>
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                        const pageNumber = index + 1
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`rounded-lg border px-3 py-2 text-sm ${
                              currentPage === pageNumber
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="rounded-lg border p-2 disabled:opacity-50"
                      >
                        <MdOutlineArrowForwardIos className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Meter Capture Details Modal */}
      <MeterCaptureDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        meterCapture={selectedCapture}
        retryLoading={retryLoading}
      />

      {/* Vendor Summary Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
        timeFilter={timeFilter}
        summaryVendorIdFilter={summaryVendorIdFilter}
        summarySourceFilter={summarySourceFilter}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        vendors={vendors}
        vendorsLoading={vendorsLoading}
        vendorsError={vendorsError}
        handleTimeFilterChange={handleTimeFilterChange}
        handleSummaryVendorIdFilterChange={handleSummaryVendorIdFilterChange}
        handleSummarySourceFilterChange={handleSummarySourceFilterChange}
        handleCustomDateChange={handleCustomDateChange}
        clearSummaryFilters={clearSummaryFilters}
        refreshVendorSummaryData={refreshVendorSummaryData}
      />
    </section>
  )
}

export default MeterCapture
