"use client"
import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, FileIcon, Filter, RefreshCw } from "lucide-react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"

import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { SearchModule } from "components/ui/Search/search-module"

import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { CsvJobsParams, fetchCsvJobs } from "lib/redux/fileManagementSlice"
import { VscCloudUpload, VscEye } from "react-icons/vsc"
import CsvUploadFailuresModal from "components/ui/Modal/CsvUploadFailuresModal"

// Job Type options for filters - Billing related job types only
const jobTypeOptions = [
  { value: "17", label: "Bill Generate Missing" },
  { value: "18", label: "Bill Generate Past" },
  { value: "19", label: "Bill Adjustment" },
  { value: "20", label: "Bill Finalize" },
  { value: "21", label: "Bill Crucial Ops" },
  { value: "3", label: "Feeder Energy Cap Import" },
]

// Status options for filters
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Queued" },
  { value: "2", label: "Running" },
  { value: "3", label: "Completed" },
  { value: "4", label: "Failed" },
  { value: "5", label: "Partially Completed" },
]

// Boolean options for filters
const booleanOptions = [
  { value: "", label: "All" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
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

const BulkUploads: React.FC = () => {
  const dispatch = useAppDispatch()
  const { csvJobs, csvJobsLoading, csvJobsError, csvJobsSuccess, csvJobsPagination } = useAppSelector(
    (state) => state.fileManagement
  )

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
  const [localFilters, setLocalFilters] = useState<Partial<CsvJobsParams>>({
    PageNumber: 1,
    PageSize: 10,
    JobType: undefined,
    Status: undefined,
    RequestedByUserId: undefined,
    RequestedFromUtc: undefined,
    RequestedToUtc: undefined,
    FileName: undefined,
    HasFailures: undefined,
    Search: undefined,
  })

  // Separate state for table-only refresh
  const [tableRefreshKey, setTableRefreshKey] = useState(0)

  // Initial load and filter changes
  useEffect(() => {
    const fetchParams: CsvJobsParams = {
      PageNumber: currentPage,
      PageSize: 10,
      ...(localFilters.JobType && { JobType: localFilters.JobType }),
      ...(localFilters.Status && { Status: localFilters.Status }),
      ...(localFilters.RequestedByUserId && { RequestedByUserId: localFilters.RequestedByUserId }),
      ...(localFilters.RequestedFromUtc && { RequestedFromUtc: localFilters.RequestedFromUtc }),
      ...(localFilters.RequestedToUtc && { RequestedToUtc: localFilters.RequestedToUtc }),
      ...(localFilters.FileName && { FileName: localFilters.FileName }),
      ...(localFilters.HasFailures !== undefined && { HasFailures: localFilters.HasFailures }),
      ...(searchText && { Search: searchText }),
    }

    void dispatch(fetchCsvJobs(fetchParams))
    setHasInitialLoad(true)
  }, [dispatch, currentPage, localFilters, searchText, tableRefreshKey])

  // Separate handler for table-only refresh
  const handleRefreshTableData = useCallback(() => {
    // This only triggers a table refresh by incrementing the refresh key
    setTableRefreshKey((prev) => prev + 1)
  }, [])

  // Keep the existing refresh handler for other purposes if needed
  const handleRefreshData = useCallback(() => {
    const fetchParams: CsvJobsParams = {
      PageNumber: currentPage,
      PageSize: 10,
      ...(localFilters.JobType && { JobType: localFilters.JobType }),
      ...(localFilters.Status && { Status: localFilters.Status }),
      ...(localFilters.RequestedByUserId && { RequestedByUserId: localFilters.RequestedByUserId }),
      ...(localFilters.RequestedFromUtc && { RequestedFromUtc: localFilters.RequestedFromUtc }),
      ...(localFilters.RequestedToUtc && { RequestedToUtc: localFilters.RequestedToUtc }),
      ...(localFilters.FileName && { FileName: localFilters.FileName }),
      ...(localFilters.HasFailures !== undefined && { HasFailures: localFilters.HasFailures }),
      ...(searchText && { Search: searchText }),
    }
    void dispatch(fetchCsvJobs(fetchParams))
  }, [dispatch, currentPage, localFilters, searchText])

  const handleSearch = useCallback(() => {
    const fetchParams: CsvJobsParams = {
      PageNumber: 1,
      PageSize: 10,
      ...(localFilters.JobType && { JobType: localFilters.JobType }),
      ...(localFilters.Status && { Status: localFilters.Status }),
      ...(localFilters.RequestedByUserId && { RequestedByUserId: localFilters.RequestedByUserId }),
      ...(localFilters.RequestedFromUtc && { RequestedFromUtc: localFilters.RequestedFromUtc }),
      ...(localFilters.RequestedToUtc && { RequestedToUtc: localFilters.RequestedToUtc }),
      ...(localFilters.FileName && { FileName: localFilters.FileName }),
      ...(localFilters.HasFailures !== undefined && { HasFailures: localFilters.HasFailures }),
      ...(searchText && { Search: searchText }),
    }
    setCurrentPage(1)
    void dispatch(fetchCsvJobs(fetchParams))
  }, [dispatch, localFilters, searchText])

  const handleFilterChange = (key: keyof CsvJobsParams, value: any) => {
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
      PageNumber: 1,
      PageSize: 10,
      JobType: undefined,
      Status: undefined,
      RequestedByUserId: undefined,
      RequestedFromUtc: undefined,
      RequestedToUtc: undefined,
      FileName: undefined,
      HasFailures: undefined,
      Search: undefined,
    })
    setSearchText("")
    setCurrentPage(1)
  }

  const getActiveFilterCount = () => {
    return Object.entries(localFilters).filter(([key, value]) => {
      if (key === "PageNumber" || key === "PageSize") return false
      return value !== undefined && value !== ""
    }).length
  }

  const getJobTypeLabel = (jobType: number) => {
    const option = jobTypeOptions.find((opt) => opt.value === jobType.toString())
    return option?.label || `Type ${jobType}`
  }

  const getStatusLabel = (status: number) => {
    const option = statusOptions.find((opt) => opt.value === status.toString())
    return option?.label || `Status ${status}`
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "text-yellow-600 bg-yellow-50"
      case 2:
        return "text-blue-600 bg-blue-50"
      case 3:
        return "text-green-600 bg-green-50"
      case 4:
        return "text-red-600 bg-red-50"
      case 5:
        return "text-gray-600 bg-gray-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const handleViewDetails = (csvJob: any) => {
    console.log("View details:", csvJob)
    // You can implement a modal or navigation to details page
  }

  const handleViewFailures = (job: any) => {
    setSelectedJob(job)
    setIsFailuresModalOpen(true)
  }

  const handleCloseFailuresModal = () => {
    setIsFailuresModalOpen(false)
    setSelectedJob(null)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Filter jobs to only show billing-related job types
  const billingJobTypes = [17, 18, 19, 20, 21, 3] // Billing job type values
  const filteredCsvJobs = csvJobs.filter((job) => billingJobTypes.includes(job.jobType))

  if (csvJobsLoading && !hasInitialLoad) {
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
                <h4 className="text-2xl font-semibold">Bulk Upload Management</h4>
                <p className="text-gray-600">Track and manage CSV bulk upload jobs</p>
              </div>
              <div className="flex items-center gap-3">
                <ButtonModule
                  onClick={() => router.push("/billing/bulk-upload/add-bulk-upload")}
                  className="button-outlined flex items-center gap-2"
                  disabled={csvJobsLoading}
                  icon={<VscCloudUpload />}
                >
                  Add Bulk Billing Upload
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
                  {/* Search */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Search</label>
                    <SearchModule
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onSearch={handleSearch}
                      placeholder="Search jobs..."
                      className="w-full md:w-auto"
                      bgClassName="bg-white"
                      searchTypeOptions={undefined}
                      onSearchTypeChange={undefined}
                    />
                  </div>

                  {/* Job Type Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Job Type</label>
                    <FormSelectModule
                      name="jobType"
                      value={localFilters.JobType?.toString() || ""}
                      onChange={(e) =>
                        handleFilterChange("JobType", e.target.value ? Number(e.target.value) : undefined)
                      }
                      options={jobTypeOptions}
                      className="w-full"
                      controlClassName="h-9 text-sm"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                    <FormSelectModule
                      name="status"
                      value={localFilters.Status?.toString() || ""}
                      onChange={(e) =>
                        handleFilterChange("Status", e.target.value ? Number(e.target.value) : undefined)
                      }
                      options={statusOptions}
                      className="w-full"
                      controlClassName="h-9 text-sm"
                    />
                  </div>

                  {/* Has Failures Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Has Failures</label>
                    <FormSelectModule
                      name="hasFailures"
                      value={localFilters.HasFailures?.toString() || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "HasFailures",
                          e.target.value === "true" ? true : e.target.value === "false" ? false : undefined
                        )
                      }
                      options={booleanOptions}
                      className="w-full"
                      controlClassName="h-9 text-sm"
                    />
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">From Date</label>
                    <input
                      type="date"
                      value={localFilters.RequestedFromUtc || ""}
                      onChange={(e) => handleFilterChange("RequestedFromUtc", e.target.value)}
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">To Date</label>
                    <input
                      type="date"
                      value={localFilters.RequestedToUtc || ""}
                      onChange={(e) => handleFilterChange("RequestedToUtc", e.target.value)}
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    />
                  </div>

                  {/* File Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">File Name</label>
                    <input
                      type="text"
                      value={localFilters.FileName || ""}
                      onChange={(e) => handleFilterChange("FileName", e.target.value)}
                      placeholder="File name..."
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
                    <h3 className="text-lg font-semibold">CSV Jobs</h3>
                    {csvJobsPagination && (
                      <p className="text-sm text-gray-600">
                        Showing {filteredCsvJobs.length} of {csvJobsPagination.totalCount} jobs
                      </p>
                    )}
                  </div>
                  <ButtonModule variant="outline" onClick={handleRefreshTableData} disabled={csvJobsLoading} size="sm">
                    <RefreshCw className={`size-4 ${csvJobsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                  {csvJobsError && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="size-4" />
                      <span className="text-sm">{csvJobsError}</span>
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
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">File Name</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Job Type</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Requested</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Progress</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Processed</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Succeeded</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Failed</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Total</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCsvJobs.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="border-b p-8 text-center">
                            <div className="text-gray-500">
                              <FileIcon className="mx-auto mb-2 size-12 text-gray-300" />
                              <p>No CSV jobs found</p>
                              <p className="text-sm">Try adjusting your filters or create a new bulk upload</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCsvJobs.map((job) => (
                          <tr key={job.id} className="border-b hover:bg-gray-50">
                            <td className="border-b p-3 text-sm">
                              <div className="max-w-xs truncate whitespace-nowrap" title={job.fileName}>
                                {job.fileName}
                              </div>
                            </td>
                            <td className="whitespace-nowrap border-b p-3 text-sm">{getJobTypeLabel(job.jobType)}</td>
                            <td className="border-b p-3 text-sm">
                              <span
                                className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                  job.status
                                )}`}
                              >
                                {getStatusLabel(job.status)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap border-b p-3 text-sm">
                              {new Date(job.requestedAtUtc).toLocaleString()}
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-blue-600"
                                    style={{
                                      width: `${
                                        job.totalRows !== null && job.totalRows > 0
                                          ? (job.processedRows / job.totalRows) * 100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">
                                  {job.totalRows !== null && job.totalRows > 0
                                    ? Math.round((job.processedRows / job.totalRows) * 100)
                                    : "Processing"}
                                </span>
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="font-medium text-blue-600">
                                {job.processedRows !== null && job.processedRows !== undefined
                                  ? job.processedRows
                                  : "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="font-medium text-green-600">
                                {job.succeededRows !== null && job.succeededRows !== undefined
                                  ? job.succeededRows
                                  : "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="font-medium text-red-600">
                                {job.failedRows !== null && job.failedRows !== undefined ? job.failedRows : "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="font-medium text-gray-600">
                                {job.totalRows !== null && job.totalRows !== undefined ? job.totalRows : "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              {job.failedRows > 0 && (
                                <ButtonModule
                                  variant="outline"
                                  size="sm"
                                  icon={<VscEye />}
                                  onClick={() => handleViewFailures(job)}
                                  className="whitespace-nowrap"
                                >
                                  View Failures
                                </ButtonModule>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {csvJobsPagination && csvJobsPagination.totalPages > 1 && (
                <div className="border-t p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {csvJobsPagination.currentPage} of {csvJobsPagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!csvJobsPagination.hasPrevious}
                        className="rounded-lg border p-2 disabled:opacity-50"
                      >
                        <MdOutlineArrowBackIosNew className="size-4" />
                      </button>
                      {[...Array(Math.min(5, csvJobsPagination.totalPages))].map((_, index) => {
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
                        disabled={!csvJobsPagination.hasNext}
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

      {/* CSV Upload Failures Modal */}
      {selectedJob && (
        <CsvUploadFailuresModal
          isOpen={isFailuresModalOpen}
          onClose={handleCloseFailuresModal}
          jobId={selectedJob.id}
          fileName={selectedJob.fileName}
        />
      )}
    </section>
  )
}

export default BulkUploads
