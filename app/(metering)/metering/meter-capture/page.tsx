"use client"
import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, FileIcon, Filter, RefreshCw, RotateCcw } from "lucide-react"
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
import { VscEye } from "react-icons/vsc"
import MeterCaptureDetailsModal from "components/ui/Modal/MeterCaptureDetailsModal"
import { notify } from "components/ui/Notification/Notification"
import { getVendorEnumerationStatusText, VendorEnumerationStatus } from "lib/types/vendorEnumeration"

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

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [selectedCapture, setSelectedCapture] = useState<any>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

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
                  <ButtonModule variant="outline" onClick={handleRefreshTableData} disabled={loading} size="sm">
                    <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
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
    </section>
  )
}

export default MeterCapture
