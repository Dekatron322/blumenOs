"use client"
import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Eye, FileIcon, Filter, RefreshCw } from "lucide-react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"

import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { SearchModule } from "components/ui/Search/search-module"

import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { AdjustmentsRequestParams, fetchAdjustments } from "lib/redux/postpaidSlice"
import { fetchCustomers } from "lib/redux/customerSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import { VscCloudUpload } from "react-icons/vsc"

// Status options for filters - matching the API values
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "0", label: "Pending" },
  { value: "1", label: "Approved" },
  { value: "2", label: "Rejected" },
]

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface ActionDropdownProps {
  csvJob: any
  onViewDetails: (csvJob: any) => void
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
                <h4 className="text-2xl font-semibold">Bill Adjustments</h4>
                <p className="text-gray-600">View and manage bill adjustment records</p>
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
                      {[...Array(8)].map((_, i) => (
                        <th key={i} className="whitespace-nowrap border-b p-4">
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {[...Array(8)].map((_, cellIndex) => (
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

const Adjustments: React.FC = () => {
  const dispatch = useAppDispatch()
  const { adjustments, adjustmentsLoading, adjustmentsError, adjustmentsSuccess, adjustmentsPagination } =
    useAppSelector((state) => state.postpaidBilling)
  const { customers, loading: customersLoading } = useAppSelector((state) => state.customers)
  const { areaOffices, loading: areaOfficesLoading } = useAppSelector((state) => state.areaOffices)
  const { billingPeriods, loading: billingPeriodsLoading } = useAppSelector((state) => state.billingPeriods)

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [isFailuresModalOpen, setIsFailuresModalOpen] = useState(false)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  // Local state for filters
  const [localFilters, setLocalFilters] = useState<Partial<AdjustmentsRequestParams>>({
    pageNumber: 1,
    pageSize: 10,
    billingPeriodId: undefined,
    period: undefined,
    customerId: undefined,
    areaOfficeId: undefined,
    csvBulkInsertionJobId: undefined,
    status: undefined,
  })

  // Separate state for table-only refresh
  const [tableRefreshKey, setTableRefreshKey] = useState(0)

  // Fetch dropdown data on component mount
  useEffect(() => {
    // Fetch customers for dropdown
    void dispatch(fetchCustomers({ pageNumber: 1, pageSize: 1000 })) // Fetch all customers for dropdown

    // Fetch area offices for dropdown
    void dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 1000 })) // Fetch all area offices for dropdown

    // Fetch billing periods for dropdown
    void dispatch(
      fetchBillingPeriods({
        pageNumber: 1,
        pageSize: 100,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      })
    )
  }, [dispatch])

  // Initial load and filter changes
  useEffect(() => {
    const fetchParams: AdjustmentsRequestParams = {
      pageNumber: currentPage,
      pageSize: 10,
      ...(localFilters.billingPeriodId && { billingPeriodId: localFilters.billingPeriodId }),
      ...(localFilters.period && { period: localFilters.period }),
      ...(localFilters.customerId && { customerId: localFilters.customerId }),
      ...(localFilters.areaOfficeId && { areaOfficeId: localFilters.areaOfficeId }),
      ...(localFilters.csvBulkInsertionJobId && { csvBulkInsertionJobId: localFilters.csvBulkInsertionJobId }),
      ...(localFilters.status !== undefined && { status: localFilters.status }),
    }

    void dispatch(fetchAdjustments(fetchParams))
    setHasInitialLoad(true)
  }, [dispatch, currentPage, localFilters, searchText, tableRefreshKey])

  // Separate handler for table-only refresh
  const handleRefreshTableData = useCallback(() => {
    // This only triggers a table refresh by incrementing the refresh key
    setTableRefreshKey((prev) => prev + 1)
  }, [])

  // Keep the existing refresh handler for other purposes if needed
  const handleRefreshData = useCallback(() => {
    const fetchParams: AdjustmentsRequestParams = {
      pageNumber: currentPage,
      pageSize: 10,
      ...(localFilters.billingPeriodId && { billingPeriodId: localFilters.billingPeriodId }),
      ...(localFilters.period && { period: localFilters.period }),
      ...(localFilters.customerId && { customerId: localFilters.customerId }),
      ...(localFilters.areaOfficeId && { areaOfficeId: localFilters.areaOfficeId }),
      ...(localFilters.csvBulkInsertionJobId && { csvBulkInsertionJobId: localFilters.csvBulkInsertionJobId }),
      ...(localFilters.status !== undefined && { status: localFilters.status }),
    }
    void dispatch(fetchAdjustments(fetchParams))
  }, [dispatch, currentPage, localFilters, searchText])

  const handleSearch = useCallback(() => {
    const fetchParams: AdjustmentsRequestParams = {
      pageNumber: 1,
      pageSize: 10,
      ...(localFilters.billingPeriodId && { billingPeriodId: localFilters.billingPeriodId }),
      ...(localFilters.period && { period: localFilters.period }),
      ...(localFilters.customerId && { customerId: localFilters.customerId }),
      ...(localFilters.areaOfficeId && { areaOfficeId: localFilters.areaOfficeId }),
      ...(localFilters.csvBulkInsertionJobId && { csvBulkInsertionJobId: localFilters.csvBulkInsertionJobId }),
      ...(localFilters.status !== undefined && { status: localFilters.status }),
    }
    setCurrentPage(1)
    void dispatch(fetchAdjustments(fetchParams))
  }, [dispatch, localFilters, searchText])

  const handleFilterChange = (key: keyof AdjustmentsRequestParams, value: any) => {
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
      billingPeriodId: undefined,
      period: undefined,
      customerId: undefined,
      areaOfficeId: undefined,
      csvBulkInsertionJobId: undefined,
      status: undefined,
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

  // Generate dropdown options
  const getCustomerOptions = () => {
    if (!customers || customers.length === 0) return []
    return customers.map((customer) => ({
      value: customer.id.toString(),
      label: `${customer.fullName} (${customer.accountNumber})`,
    }))
  }

  const getAreaOfficeOptions = () => {
    if (!areaOffices || areaOffices.length === 0) return []
    return areaOffices.map((areaOffice) => ({
      value: areaOffice.id.toString(),
      label: areaOffice.nameOfNewOAreaffice || areaOffice.nameOfOldOAreaffice || `Area Office ${areaOffice.id}`,
    }))
  }

  const getBillingPeriodOptions = () => {
    if (!billingPeriods || billingPeriods.length === 0) return []
    return billingPeriods.map((period) => ({
      value: period.id.toString(),
      label: `${period.displayName} (${period.year}-${period.month.toString().padStart(2, "0")})`,
    }))
  }

  const getStatusLabel = (status: number) => {
    const option = statusOptions.find((opt) => opt.value === status.toString())
    return option?.label || `Status ${status}`
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "text-yellow-600 bg-yellow-50"
      case 1:
        return "text-green-600 bg-green-50"
      case 2:
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const handleViewDetails = (adjustment: any) => {
    console.log("View details:", adjustment)
    // You can implement a modal or navigation to details page
  }

  const handleViewFailures = (adjustment: any) => {
    setSelectedJob(adjustment)
    setIsFailuresModalOpen(true)
  }

  const handleCloseFailuresModal = () => {
    setIsFailuresModalOpen(false)
    setSelectedJob(null)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // No filtering needed since we're already fetching adjustments
  const adjustmentsData = adjustments

  if (adjustmentsLoading && !hasInitialLoad) {
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
                <h4 className="text-2xl font-semibold">Bill Adjustments</h4>
                <p className="text-gray-600">View and manage bill adjustment records</p>
              </div>
              <div className="flex items-center gap-3">
                <ButtonModule variant="outline" disabled={adjustmentsLoading}>
                  Approve Bulk Adjust
                </ButtonModule>
                <ButtonModule
                  onClick={() => router.push("/billing/adjustments/add-bulk-upload")}
                  className="button-outlined flex items-center gap-2"
                  icon={<VscCloudUpload />}
                >
                  Add Bulk Adjustments Upload
                </ButtonModule>
              </div>
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

                  {/* Billing Period Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Billing Period</label>
                    {billingPeriodsLoading ? (
                      <div className="h-9 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        Loading billing periods...
                      </div>
                    ) : (
                      <FormSelectModule
                        name="billingPeriodId"
                        value={localFilters.billingPeriodId?.toString() || ""}
                        onChange={(e) =>
                          handleFilterChange("billingPeriodId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={getBillingPeriodOptions()}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    )}
                  </div>

                  {/* Period Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Period</label>
                    <input
                      type="text"
                      value={localFilters.period || ""}
                      onChange={(e) => handleFilterChange("period", e.target.value)}
                      placeholder="Period..."
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    />
                  </div>

                  {/* Customer Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
                    {customersLoading ? (
                      <div className="h-9 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        Loading customers...
                      </div>
                    ) : (
                      <FormSelectModule
                        name="customerId"
                        value={localFilters.customerId?.toString() || ""}
                        onChange={(e) =>
                          handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={getCustomerOptions()}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    )}
                  </div>

                  {/* Area Office Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                    {areaOfficesLoading ? (
                      <div className="h-9 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        Loading area offices...
                      </div>
                    ) : (
                      <FormSelectModule
                        name="areaOfficeId"
                        value={localFilters.areaOfficeId?.toString() || ""}
                        onChange={(e) =>
                          handleFilterChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={getAreaOfficeOptions()}
                        className="w-full"
                        controlClassName="h-9 text-sm"
                      />
                    )}
                  </div>

                  {/* CSV Bulk Insertion Job ID Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">CSV Job ID</label>
                    <input
                      type="number"
                      value={localFilters.csvBulkInsertionJobId || ""}
                      onChange={(e) =>
                        handleFilterChange("csvBulkInsertionJobId", e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="CSV job ID..."
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-end gap-2 lg:col-span-2">
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
                    <h3 className="text-lg font-semibold">Bill Adjustments</h3>
                    {adjustmentsPagination && (
                      <p className="text-sm text-gray-600">
                        Showing {adjustmentsData.length} of {adjustmentsPagination.totalCount} adjustments
                      </p>
                    )}
                  </div>
                  <ButtonModule
                    variant="outline"
                    onClick={handleRefreshTableData}
                    disabled={adjustmentsLoading}
                    size="sm"
                  >
                    <RefreshCw className={`size-4 ${adjustmentsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                  {adjustmentsError && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="size-4" />
                      <span className="text-sm">{adjustmentsError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="max-h-[70vh] w-full overflow-x-auto overflow-y-hidden ">
                <div className="min-w-[1200px]">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Customer Name</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Account Number</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Period</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Amount</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Uploaded By</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Approved By</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Created At</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustmentsData.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="border-b p-8 text-center">
                            <div className="text-gray-500">
                              <FileIcon className="mx-auto mb-2 size-12 text-gray-300" />
                              <p>No adjustments found</p>
                              <p className="text-sm">Try adjusting your filters or create new adjustments</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        adjustmentsData.map((adjustment) => (
                          <tr key={adjustment.id} className="border-b hover:bg-gray-50">
                            <td className="border-b p-3 text-sm">
                              <div className="max-w-xs truncate whitespace-nowrap" title={adjustment.customerName}>
                                {adjustment.customerName}
                              </div>
                            </td>
                            <td className="whitespace-nowrap border-b p-3 text-sm">
                              {adjustment.customerAccountNumber}
                            </td>
                            <td className="whitespace-nowrap border-b p-3 text-sm">{adjustment.period}</td>
                            <td className="whitespace-nowrap border-b p-3 text-sm">
                              <div className="font-medium text-blue-600">
                                ${adjustment.amount?.toFixed(2) || "0.00"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <span
                                className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                  adjustment.status
                                )}`}
                              >
                                {getStatusLabel(adjustment.status)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap border-b p-3 text-sm">
                              {adjustment.uploadedByName || "N/A"}
                            </td>
                            <td className="whitespace-nowrap border-b p-3 text-sm">
                              {adjustment.approvedByName || "N/A"}
                            </td>
                            <td className="whitespace-nowrap border-b p-3 text-sm">
                              {new Date(adjustment.createdAt).toLocaleString()}
                            </td>
                            <td className="border-b p-3 text-sm">
                              <ButtonModule
                                variant="outline"
                                size="sm"
                                icon={<Eye />}
                                onClick={() => handleViewDetails(adjustment)}
                                className="whitespace-nowrap"
                              >
                                View Details
                              </ButtonModule>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {adjustmentsPagination && adjustmentsPagination.totalPages > 1 && (
                <div className="border-t p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {adjustmentsPagination.currentPage} of {adjustmentsPagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!adjustmentsPagination.hasPrevious}
                        className="rounded-lg border p-2 disabled:opacity-50"
                      >
                        <MdOutlineArrowBackIosNew className="size-4" />
                      </button>
                      {[...Array(Math.min(5, adjustmentsPagination.totalPages))].map((_, index) => {
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
                        disabled={!adjustmentsPagination.hasNext}
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
    </section>
  )
}

export default Adjustments
