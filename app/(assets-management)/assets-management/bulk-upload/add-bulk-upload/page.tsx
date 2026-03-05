"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  createFileIntent,
  CsvJob,
  downloadCsv,
  fetchCsvJobs,
  finalizeFile,
  processDistributionSubstationBulkUpload,
  processDistributionSubstationFeederRealignmentBulkUpload,
  processFeederBandChangeBulkUpload,
  resetFileManagementState,
} from "lib/redux/fileManagementSlice"
import * as XLSX from "xlsx"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { SearchModule } from "components/ui/Search/search-module"
import CsvUploadFailuresModal from "components/ui/Modal/CsvUploadFailuresModal"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  CloudUpload,
  Download,
  FileIcon,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react"
import { VscAdd, VscCloudUpload, VscEye } from "react-icons/vsc"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UploadTypeOption {
  name: string
  value: number
  description: string
  requiredColumns: string[]
  sampleData: string[]
}

// Hook to get latest jobs for all upload types
const useLatestJobs = () => {
  const dispatch = useAppDispatch()
  const { csvJobs, csvJobsLoading } = useAppSelector((state: { fileManagement: any }) => state.fileManagement)
  const [latestJobs, setLatestJobs] = useState<Record<number, CsvJob | null>>({})
  const [isLoading, setIsLoading] = useState(false)

  const fetchLatestJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const jobTypes = [13, 26, 27] // All assets management job types
      const jobsData: Record<number, CsvJob | null> = {}

      // Fetch latest job for each type
      for (const jobType of jobTypes) {
        try {
          const result = await dispatch(
            fetchCsvJobs({
              PageNumber: 1,
              PageSize: 1,
              JobType: jobType,
              Status: undefined,
            })
          ).unwrap()

          if (result.isSuccess && result.data.length > 0) {
            jobsData[jobType] = result.data[0] ?? null
          } else {
            jobsData[jobType] = null
          }
        } catch (error) {
          console.error(`Failed to fetch latest job for type ${jobType}:`, error)
          jobsData[jobType] = null
        }
      }

      setLatestJobs(jobsData)
    } catch (error) {
      console.error("Failed to fetch latest jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    fetchLatestJobs()
  }, [fetchLatestJobs])

  // Poll for updates every 5 seconds if there are running jobs
  useEffect(() => {
    const hasRunningJobs = Object.values(latestJobs).some((job) => job && (job.status === 1 || job.status === 2))

    if (hasRunningJobs) {
      // Only fetch running job types to reduce API calls
      const runningJobTypes = Object.entries(latestJobs)
        .filter(([_, job]) => job && (job.status === 1 || job.status === 2))
        .map(([jobType, _]) => parseInt(jobType))

      const interval = setInterval(async () => {
        try {
          const jobsData: Record<number, CsvJob | null> = { ...latestJobs }

          // Only fetch updates for running jobs
          for (const jobType of runningJobTypes) {
            try {
              const result = await dispatch(
                fetchCsvJobs({
                  PageNumber: 1,
                  PageSize: 1,
                  JobType: jobType,
                  Status: undefined,
                })
              ).unwrap()

              if (result.isSuccess && result.data.length > 0) {
                jobsData[jobType] = result.data[0] ?? null
              } else {
                jobsData[jobType] = null
              }
            } catch (error) {
              console.error(`Failed to fetch running job update for type ${jobType}:`, error)
            }
          }

          setLatestJobs(jobsData)
        } catch (error) {
          console.error("Failed to fetch running job updates:", error)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [latestJobs, dispatch])

  return { latestJobs, isLoading, refetch: fetchLatestJobs }
}

// Hook to fetch CSV jobs for a specific job type
const useJobTypeUploads = (jobType: number | null) => {
  const dispatch = useAppDispatch()
  const { csvJobs, csvJobsLoading, csvJobsError, csvJobsPagination } = useAppSelector(
    (state: { fileManagement: any }) => state.fileManagement
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const fetchJobs = useCallback(async () => {
    if (!jobType) return

    const params = {
      PageNumber: currentPage,
      PageSize: 10,
      JobType: jobType,
      Status: statusFilter ? Number(statusFilter) : undefined,
      Search: searchText || undefined,
    }

    try {
      await dispatch(fetchCsvJobs(params)).unwrap()
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    }
  }, [dispatch, jobType, currentPage, statusFilter, searchText])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Poll for updates every 5 seconds if there are running jobs
  useEffect(() => {
    const hasRunningJobs = csvJobs.some((job: CsvJob) => job.status === 1 || job.status === 2)

    if (hasRunningJobs && jobType) {
      const interval = setInterval(async () => {
        try {
          const params = {
            PageNumber: currentPage,
            PageSize: 10,
            JobType: jobType,
            Status: statusFilter ? Number(statusFilter) : undefined,
            Search: searchText || undefined,
          }
          await dispatch(fetchCsvJobs(params)).unwrap()
        } catch (error) {
          console.error("Failed to fetch job updates:", error)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [csvJobs, jobType, currentPage, statusFilter, searchText, dispatch])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchJobs()
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  return {
    jobs: csvJobs,
    loading: csvJobsLoading,
    error: csvJobsError,
    pagination: csvJobsPagination,
    currentPage,
    searchText,
    statusFilter,
    setSearchText,
    handlePageChange,
    handleSearch,
    handleStatusFilter,
    refetch: fetchJobs,
  }
}

// Status options for filters
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Queued" },
  { value: "2", label: "Running" },
  { value: "3", label: "Completed" },
  { value: "4", label: "Failed" },
  { value: "5", label: "Partially Completed" },
]

// Helper functions for table
const getJobTypeLabel = (jobType: number) => {
  const uploadTypeOptions = [
    { name: "Distribution Substation Import", value: 13, description: "", requiredColumns: [], sampleData: [] },
    {
      name: "Distribution Substation Feeder Realignment",
      value: 26,
      description: "",
      requiredColumns: [],
      sampleData: [],
    },
    { name: "Feeder Band Change", value: 27, description: "", requiredColumns: [], sampleData: [] },
  ]
  const option = uploadTypeOptions.find((opt) => opt.value === jobType)
  return option?.name || `Type ${jobType}`
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

// Component to display job status with progress
const JobStatusIndicator = ({ job, isLoading }: { job: CsvJob | null; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Loader2 className="size-3 animate-spin" />
        <span>Loading...</span>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-xs text-gray-400">
        <span>No recent jobs</span>
      </div>
    )
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case 3:
        return "bg-green-100 text-green-800 border-green-200"
      case 4:
        return "bg-red-100 text-red-800 border-red-200"
      case 5:
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return "Queued"
      case 2:
        return "Running"
      case 3:
        return "Completed"
      case 4:
        return "Failed"
      case 5:
        return "Partial"
      default:
        return "Unknown"
    }
  }

  const progressPercentage = job.totalRows > 0 ? (job.processedRows / job.totalRows) * 100 : 0

  return (
    <div className="space-y-2">
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(job.status)}`}>
          {getStatusLabel(job.status)}
        </span>
        {job.status === 1 || job.status === 2 ? <RefreshCw className="size-3 animate-spin text-blue-500" /> : null}
      </div>

      {/* Statistics for all jobs */}
      <div className="grid grid-cols-4 gap-1 text-xs">
        <div className="text-center">
          <div className="font-medium text-blue-600">{job.processedRows}</div>
          <div className="text-gray-500">Processed</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-green-600">{job.succeededRows}</div>
          <div className="text-gray-500">Succeeded</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-red-600">{job.failedRows}</div>
          <div className="text-gray-500">Failed</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-600">{job.totalRows}</div>
          <div className="text-gray-500">Total</div>
        </div>
      </div>

      {/* Horizontal progress bar for queued/running jobs */}
      {(job.status === 1 || job.status === 2) && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>{job.processedRows}</span>
            <span>{job.totalRows}</span>
          </div>
        </div>
      )}

      {/* Last updated info */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div>Requested Date: {new Date(job.requestedAtUtc).toLocaleDateString()}</div>
        {job.requestedByUser && <div>Requested By: {job.requestedByUser.fullName}</div>}
      </div>
    </div>
  )
}

// Job Type Uploads Table Component
const JobTypeUploadsTable = ({ jobType }: { jobType: number | null }) => {
  console.log("JobTypeUploadsTable rendered with jobType:", jobType)

  const {
    jobs,
    loading,
    error,
    pagination,
    currentPage,
    searchText,
    statusFilter,
    setSearchText,
    handlePageChange,
    handleSearch,
    handleStatusFilter,
    refetch,
  } = useJobTypeUploads(jobType)

  console.log("useJobTypeUploads returned:", { jobs, loading, error, pagination })

  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [isFailuresModalOpen, setIsFailuresModalOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { downloadCsvLoading } = useAppSelector((state: { fileManagement: any }) => state.fileManagement)

  const handleViewFailures = (job: any) => {
    setSelectedJob(job)
    setIsFailuresModalOpen(true)
  }

  const handleCloseFailuresModal = () => {
    setIsFailuresModalOpen(false)
    setSelectedJob(null)
  }

  const handleDownloadCsv = async (job: any) => {
    try {
      const result = await dispatch(downloadCsv({ id: job.id }))
      if (downloadCsv.fulfilled.match(result)) {
        const blob = result.payload.data
        const fileName = result.payload.fileName
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  if (!jobType) return null

  return (
    <div className="rounded-lg border bg-white">
      {/* Table Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Recent Uploads - {getJobTypeLabel(jobType)}</h3>
            {pagination && (
              <p className="text-sm text-gray-600">
                Showing {jobs.length} of {pagination.totalCount} uploads
              </p>
            )}
          </div>
          <ButtonModule variant="outline" onClick={refetch} disabled={loading} size="sm">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </ButtonModule>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              placeholder="Search uploads..."
              className="w-full"
              bgClassName="bg-white"
              searchTypeOptions={undefined}
              onSearchTypeChange={undefined}
            />
          </div>
          <div className="w-full sm:w-48">
            <FormSelectModule
              name="status"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              options={statusOptions}
              className="w-full"
              controlClassName="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[60vh] w-full overflow-x-auto overflow-y-hidden">
        <div className="min-w-[1200px]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="border-b p-3 text-left text-sm font-medium text-gray-700">File Name</th>
                <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Requested By</th>
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
              {loading && jobs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border-b p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      <span className="text-gray-500">Loading uploads...</span>
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border-b p-8 text-center">
                    <div className="text-gray-500">
                      <FileIcon className="mx-auto mb-2 size-12 text-gray-300" />
                      <p>No uploads found for this type</p>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job: CsvJob) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    <td className="border-b p-3 text-sm">
                      <div className="max-w-xs truncate whitespace-nowrap" title={job.fileName}>
                        {job.fileName}
                      </div>
                    </td>
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
                      <div
                        className="max-w-xs truncate whitespace-nowrap"
                        title={job.requestedByUser?.fullName || "Unknown"}
                      >
                        {job.requestedByUser?.fullName || "Unknown"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b p-3 text-sm">
                      {new Date(job.requestedAtUtc).toLocaleString()}
                    </td>
                    <td className="border-b p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="size-24 rounded-full bg-gray-200">
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
                        {job.processedRows !== null && job.processedRows !== undefined ? job.processedRows : "N/A"}
                      </div>
                    </td>
                    <td className="border-b p-3 text-sm">
                      <div className="font-medium text-green-600">
                        {job.succeededRows !== null && job.succeededRows !== undefined ? job.succeededRows : "N/A"}
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
                      <div className="flex gap-2">
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
                        {(job.status === 3 || job.status === 5) && (
                          <ButtonModule
                            variant="outline"
                            size="sm"
                            icon={<Download className="size-4" />}
                            onClick={() => handleDownloadCsv(job)}
                            className="whitespace-nowrap"
                            disabled={downloadCsvLoading}
                          >
                            {downloadCsvLoading ? "Downloading..." : "Download"}
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

      {/* CSV Upload Failures Modal */}
      {selectedJob && (
        <CsvUploadFailuresModal
          isOpen={isFailuresModalOpen}
          onClose={handleCloseFailuresModal}
          jobId={selectedJob.id}
          fileName={selectedJob.fileName}
        />
      )}
    </div>
  )
}

const FileManagementPage = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Redux state
  const {
    fileIntentLoading,
    fileIntentError,
    finalizeFileLoading,
    finalizeFileError,
    distributionSubstationBulkUploadLoading,
    distributionSubstationBulkUploadError,
    distributionSubstationFeederRealignmentBulkUploadLoading,
    distributionSubstationFeederRealignmentBulkUploadError,
    feederBandChangeBulkUploadLoading,
    feederBandChangeBulkUploadError,
  } = useAppSelector((state: { fileManagement: any }) => state.fileManagement)

  // Get latest jobs for all upload types
  const { latestJobs, isLoading: jobsLoading } = useLatestJobs()

  // Upload type options with enhanced metadata
  const uploadTypeOptions: UploadTypeOption[] = [
    {
      name: "Distribution Substations",
      value: 13,
      description: "Bulk upload distribution substation records with location and technical details",
      requiredColumns: [
        "SubstationName",
        "SubstationCode",
        "VoltageLevel",
        "CapacityKVA",
        "Location",
        "Latitude",
        "Longitude",
        "CommissioningDate",
        "Status",
        "Region",
        "FeederName",
      ],
      sampleData: [
        "SubstationName,SubstationCode,VoltageLevel,CapacityKVA,Location,Latitude,Longitude,CommissioningDate,Status,Region,FeederName",
        "Main Substation A,SUB001,11kV,500,Central District,6.5244,3.3792,2024-01-15,Active,Lagos,Feeder 1",
        "Substation B,SUB002,33kV,1000,Industrial Area,6.5245,3.3793,2024-02-20,Active,Abuja,Feeder 2",
        "Rural Substation C,SUB003,11kV,250,Rural Zone,6.5246,3.3794,2024-03-10,Pending,Kano,Feeder 3",
      ],
    },
    {
      name: "Distribution Substations Feeder Realignment",
      value: 26,
      description: "Realign distribution substations to different feeders",
      requiredColumns: ["FeederName", "DssCode"],
      sampleData: ["FeederName,DssCode", "Feeder A,SUB001", "Feeder B,SUB002", "Feeder C,SUB003"],
    },
    {
      name: "Feeder Band Change",
      value: 27,
      description: "Update feeder band assignments and configurations",
      requiredColumns: ["FeederName", "Band"],
      sampleData: ["FeederName,Band", "Feeder A,Band A", "Feeder B,Band B", "Feeder C,Band C"],
    },
  ]

  // Helper function to get bulkInsertType based on upload type
  const getBulkInsertType = (uploadType: number | null): string => {
    switch (uploadType) {
      case 13:
        return "distribution-substation-upload"
      case 26:
        return "distribution-substation-feeder-realignment"
      case 27:
        return "feeder-band-change"
      default:
        return "distribution-substation-upload"
    }
  }

  // Helper function to get purpose based on upload type
  const getPurpose = (uploadType: number | null): string => {
    switch (uploadType) {
      case 13:
        return "distribution-substations-bulk"
      case 26:
        return "distribution-substations-feeder-realignment-bulk"
      case 27:
        return "feeders-band-change-bulk"
      default:
        return "distribution-substations-bulk"
    }
  }

  // Local state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedUploadType, setSelectedUploadType] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [finalizedFile, setFinalizedFile] = useState<any>(null)
  const [bulkUploadProcessed, setBulkUploadProcessed] = useState(false)
  const [bulkUploadResponse, setBulkUploadResponse] = useState<any>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [hasCompletedUploadTypeSelection, setHasCompletedUploadTypeSelection] = useState(false)
  const [extractedColumns, setExtractedColumns] = useState<string[]>([])
  const [isValidatingFile, setIsValidatingFile] = useState(false)
  const [showColumnHelp, setShowColumnHelp] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Reset states on unmount
  useEffect(() => {
    return () => {
      dispatch(resetFileManagementState())
    }
  }, [dispatch])

  // Extract column names from Excel or CSV file
  const extractColumnsFromFile = useCallback(async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          console.log("Processing file:", file.name, "Type:", file.type)

          if (file.type === "text/csv" || file.name.endsWith(".csv")) {
            // Handle CSV files
            const text = e.target?.result as string
            const lines = text.split("\n")

            if (lines.length > 0) {
              const headers = lines[0]!
                .split(",")
                .map((h) => h.trim().replace(/^["']|["']$/g, ""))
                .filter((header) => header && header !== "")
              resolve(headers)
            } else {
              resolve([])
            }
          } else {
            // Handle Excel files
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: "array" })
            const firstSheetName = workbook.SheetNames[0]

            if (!firstSheetName) {
              resolve([])
              return
            }

            const worksheet = workbook.Sheets[firstSheetName]

            if (!worksheet) {
              resolve([])
              return
            }

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

            if (jsonData.length > 0) {
              const headers = (jsonData[0] as string[])
                .filter((header) => header && header.toString().trim() !== "")
                .map((h) => h.toString().trim())
              resolve(headers)
            } else {
              resolve([])
            }
          }
        } catch (error) {
          console.error("Error reading file:", error)
          reject(error)
        }
      }

      reader.onerror = (error) => {
        console.error("FileReader error:", error)
        reject(error)
      }

      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }, [])

  // Validate file columns against required columns
  const validateFileColumns = useCallback(
    async (file: File): Promise<{ isValid: boolean; missingColumns: string[]; extractedColumns: string[] }> => {
      if (!selectedUploadType) {
        return { isValid: false, missingColumns: [], extractedColumns: [] }
      }

      setIsValidatingFile(true)
      try {
        const columns = await extractColumnsFromFile(file)
        const uploadType = uploadTypeOptions.find((t) => t.value === selectedUploadType)

        if (!uploadType) {
          return { isValid: false, missingColumns: [], extractedColumns: columns }
        }

        // Case-insensitive column matching
        const missingColumns = uploadType.requiredColumns.filter(
          (required) => !columns.some((col) => col.toLowerCase() === required.toLowerCase())
        )

        setExtractedColumns(columns)
        return {
          isValid: missingColumns.length === 0,
          missingColumns,
          extractedColumns: columns,
        }
      } catch (error) {
        return { isValid: false, missingColumns: [], extractedColumns: [] }
      } finally {
        setIsValidatingFile(false)
      }
    },
    [selectedUploadType, uploadTypeOptions, extractColumnsFromFile]
  )

  // Handle file selection
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          notify("error", "File Too Large", {
            description: "Maximum file size is 50MB",
            duration: 5000,
          })
          return
        }

        // Validate file type
        const isValidType =
          file.type === "text/csv" ||
          file.name.endsWith(".csv") ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls")

        if (!isValidType) {
          notify("error", "Invalid File Type", {
            description: "Please upload CSV or Excel files only",
            duration: 5000,
          })
          return
        }

        setSelectedFile(file)
        setUploadError(null)
        setUploadSuccess(false)
        setFinalizedFile(null)
        setUploadProgress(null)
        setBulkUploadResponse(null)

        // Validate columns if upload type is selected
        if (selectedUploadType) {
          const validation = await validateFileColumns(file)
          if (!validation.isValid && validation.missingColumns.length > 0) {
            notify("warning", "Missing Required Columns", {
              description: `Missing: ${validation.missingColumns.join(", ")}`,
              duration: 7000,
            })
          } else if (validation.isValid) {
            notify("success", "File Validation Passed", {
              description: "All required columns found",
              duration: 3000,
            })
          }
        }
      } else {
        // Handle case where user cancels file selection
        if (fileInputRef.current && selectedFile) {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(selectedFile)
          fileInputRef.current.files = dataTransfer.files
        }
      }
    },
    [selectedFile, selectedUploadType, validateFileColumns]
  )

  // Handle file drop
  const handleFileDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        const file = files[0]

        if (!file) {
          return
        }

        // Validate file type
        const isValidType =
          file.type === "text/csv" ||
          file.name.endsWith(".csv") ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls")

        if (!isValidType) {
          notify("error", "Invalid File Type", {
            description: "Please upload CSV or Excel files only",
            duration: 5000,
          })
          return
        }

        // Validate file size
        if (file.size > 50 * 1024 * 1024) {
          notify("error", "File Too Large", {
            description: "Maximum file size is 50MB",
            duration: 5000,
          })
          return
        }

        setSelectedFile(file)
        setUploadError(null)
        setUploadSuccess(false)
        setFinalizedFile(null)
        setUploadProgress(null)
        setBulkUploadResponse(null)

        // Validate columns if upload type is selected
        if (selectedUploadType) {
          const validation = await validateFileColumns(file)
          if (!validation.isValid && validation.missingColumns.length > 0) {
            notify("warning", "Missing Required Columns", {
              description: `Missing: ${validation.missingColumns.join(", ")}`,
              duration: 7000,
            })
          }
        }
      }
    },
    [selectedUploadType, validateFileColumns]
  )

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  // Remove selected file
  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null)
    setUploadError(null)
    setUploadSuccess(false)
    setFinalizedFile(null)
    setUploadProgress(null)
    setBulkUploadResponse(null)
    setExtractedColumns([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  // Calculate file checksum
  const calculateChecksum = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Start upload process
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      notify("error", "No File Selected", {
        description: "Please select a file to upload",
        duration: 5000,
      })
      return
    }

    if (!selectedUploadType) {
      notify("error", "Upload Type Required", {
        description: "Please select an upload type before proceeding",
        duration: 5000,
      })
      return
    }

    console.log("=== Starting Upload Process ===")
    console.log("Selected file:", selectedFile.name, selectedFile.type)
    console.log("Selected upload type:", selectedUploadType)

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)
    setUploadProgress({ loaded: 0, total: selectedFile.size, percentage: 0 })

    try {
      console.log("=== Extracting Columns ===")
      // Extract columns from the uploaded file
      const extractedColumns = await extractColumnsFromFile(selectedFile)

      console.log("Extracted columns result:", extractedColumns)
      console.log("Extracted columns length:", extractedColumns.length)

      if (extractedColumns.length === 0) {
        notify("error", "File Processing Failed", {
          description: "No columns found in the file. Please ensure your file has headers.",
          duration: 5000,
        })
        throw new Error("No columns found in the file. Please ensure your file has headers.")
      }

      console.log("Extracted columns from file:", extractedColumns)

      // Use the actual extracted columns from the uploaded file
      const paymentColumns = extractedColumns

      // Step 1: Create file intent with payment column groups
      console.log("=== Calculating Checksum ===")
      const checksum = await calculateChecksum(selectedFile)
      console.log("Calculated checksum:", checksum)

      const intentRequest = {
        fileName: selectedFile.name,
        contentType: selectedFile.type || "application/octet-stream",
        sizeBytes: selectedFile.size,
        purpose: getPurpose(selectedUploadType),
        checksum,
        bulkInsertType: getBulkInsertType(selectedUploadType),
        jobType: selectedUploadType,
        columns: paymentColumns,
      }

      console.log("=== Final Intent Request ===")
      console.log("Sending intent request:", intentRequest)

      let intentResult
      try {
        intentResult = await dispatch(createFileIntent(intentRequest)).unwrap()
      } catch (error: any) {
        console.log("API Call Failed:", error)
        notify("error", "Upload Failed", {
          description: error.message || "Failed to create file intent",
          duration: 5000,
        })
        throw error
      }

      if (!intentResult.isSuccess) {
        console.log("API Response Error:", intentResult)
        notify("error", "Upload Failed", {
          description: intentResult.message || "File intent creation failed",
          duration: 5000,
        })
        throw new Error(intentResult.message)
      }

      // Step 2: Upload file directly to Spaces using the signed URL
      const { uploadUrl, fileId } = intentResult.data

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            }
            setUploadProgress(progress)
          }
        })

        xhr.addEventListener("load", async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Step 3: Finalize the upload
            try {
              const finalizeResult = await dispatch(finalizeFile(fileId)).unwrap()

              if (!finalizeResult.isSuccess) {
                throw new Error(finalizeResult.message)
              }

              setFinalizedFile(finalizeResult.data)
              setUploadSuccess(true)

              notify("success", "Upload Successfully Queued!", {
                description: `File ${selectedFile.name} has been queued for processing`,
                duration: 5000,
              })

              // Step 4: Process bulk upload
              console.log("=== Processing Bulk Upload ===")
              try {
                let bulkResult

                // Use different endpoint based on upload type
                if (selectedUploadType === 26) {
                  // Distribution Substation Feeder Realignment
                  bulkResult = await dispatch(
                    processDistributionSubstationFeederRealignmentBulkUpload({ fileId })
                  ).unwrap()
                } else if (selectedUploadType === 27) {
                  // Feeder Band Change
                  bulkResult = await dispatch(processFeederBandChangeBulkUpload({ fileId })).unwrap()
                } else {
                  // Regular Distribution Substation Upload
                  bulkResult = await dispatch(processDistributionSubstationBulkUpload({ fileId })).unwrap()
                }

                if (!bulkResult.isSuccess) {
                  throw new Error(bulkResult.message)
                }

                setBulkUploadProcessed(true)
                setBulkUploadResponse(bulkResult)
                console.log("=== Bulk Upload Complete ===")
                console.log("Bulk upload data:", bulkResult.data)

                // Show bulk upload success notification
                const uploadTypeName =
                  uploadTypeOptions.find((t) => t.value === selectedUploadType)?.name || "Bulk Upload"

                notify("success", "Processing Started!", {
                  description: `${uploadTypeName} records queued for processing`,
                  duration: 6000,
                })
              } catch (bulkError: any) {
                console.error("Bulk upload failed:", bulkError)
                notify("warning", "Upload Queued", {
                  description: "File uploaded but processing failed. Please check bulk upload page.",
                  duration: 5000,
                })
                setUploadError(bulkError instanceof Error ? bulkError.message : "Failed to process bulk upload")
              }

              resolve()
            } catch (finalizeError: any) {
              console.error("Finalize error:", finalizeError)
              notify("error", "Finalization Failed", {
                description: finalizeError instanceof Error ? finalizeError.message : "Failed to finalize upload",
                duration: 5000,
              })
              setUploadError(finalizeError instanceof Error ? finalizeError.message : "Failed to finalize upload")
              reject(finalizeError)
            }
          } else {
            const error = new Error(`Upload failed with status ${xhr.status}`)
            notify("error", "Upload Failed", {
              description: `Upload failed with status ${xhr.status}`,
              duration: 5000,
            })
            reject(error)
          }
        })

        xhr.addEventListener("error", () => {
          const error = new Error("Network error during upload")
          notify("error", "Network Error", {
            description: "Network error during upload",
            duration: 5000,
          })
          reject(error)
        })

        // Open and send the request
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", selectedFile.type || "application/octet-stream")
        xhr.send(selectedFile)
      })
    } catch (error: any) {
      console.error("Upload process error:", error)
      notify("error", "Upload Failed", {
        description: error instanceof Error ? error.message : "Upload failed",
        duration: 5000,
      })
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, selectedUploadType, dispatch, extractColumnsFromFile, uploadTypeOptions])

  // Reset form
  const handleReset = useCallback(() => {
    setSelectedFile(null)
    setSelectedUploadType(null)
    setUploadProgress(null)
    setIsUploading(false)
    setUploadError(null)
    setUploadSuccess(false)
    setFinalizedFile(null)
    setBulkUploadProcessed(false)
    setBulkUploadResponse(null)
    setIsDragOver(false)
    setHasCompletedUploadTypeSelection(false)
    setExtractedColumns([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    dispatch(resetFileManagementState())
  }, [dispatch])

  // Generate and download sample CSV file
  const downloadSampleFile = useCallback(() => {
    if (!selectedUploadType) return

    const uploadType = uploadTypeOptions.find((t) => t.value === selectedUploadType)
    if (!uploadType) return

    const sampleData = uploadType.sampleData.join("\n")
    const blob = new Blob([sampleData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `sample-${uploadType.name.toLowerCase().replace(/\s+/g, "-")}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    notify("success", "Template Downloaded", {
      description: "Sample CSV file has been downloaded",
      duration: 3000,
    })
  }, [selectedUploadType, uploadTypeOptions])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Get selected upload type details
  const selectedUploadTypeDetails = uploadTypeOptions.find((t) => t.value === selectedUploadType)

  // Check if any loading state is active
  const isLoading =
    fileIntentLoading ||
    finalizeFileLoading ||
    distributionSubstationBulkUploadLoading ||
    distributionSubstationFeederRealignmentBulkUploadLoading ||
    feederBandChangeBulkUploadLoading ||
    isUploading ||
    isValidatingFile

  console.log("Main component render state:", { selectedUploadType, hasCompletedUploadTypeSelection })

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-24 sm:pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.back()}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Bulk Upload Assets</h1>
                    <p className="mt-1 text-sm text-gray-600">Upload asset records in bulk using CSV or Excel files</p>
                  </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/assets-management/bulk-upload")}
                  >
                    View Upload History
                  </ButtonModule>
                  <ButtonModule variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
                    Reset
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    onClick={handleUpload}
                    disabled={!selectedFile || !selectedUploadType || isLoading || uploadSuccess}
                    icon={<Upload className="size-4" />}
                  >
                    {isUploading ? "Uploading..." : "Upload File"}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-xl bg-white shadow-lg"
            >
              {/* Upload Type Selection */}
              {!hasCompletedUploadTypeSelection && (
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Select Upload Type</h2>
                      <p className="text-sm text-gray-600">Choose the type of asset upload you want to perform</p>
                    </div>
                    <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      3 options
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {uploadTypeOptions.map((type) => {
                      const latestJob = latestJobs[type.value] || null
                      const isLoading = jobsLoading

                      return (
                        <motion.button
                          key={type.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            console.log("Upload type selected:", type.value)
                            setSelectedUploadType(type.value)
                            setHasCompletedUploadTypeSelection(true)
                            console.log("selectedUploadType set to:", type.value)
                          }}
                          className="group relative rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-blue-600">{type.name}</h3>
                          <p className="mb-4 text-sm text-gray-600">{type.description}</p>

                          {/* Job Status Section */}
                          <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">Latest Job Status</span>
                              {latestJob && (latestJob.status === 1 || latestJob.status === 2) && (
                                <RefreshCw className="size-3 animate-spin text-blue-500" />
                              )}
                            </div>
                            <JobStatusIndicator job={latestJob} isLoading={isLoading} />
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* File Upload Section */}
              {hasCompletedUploadTypeSelection && selectedUploadTypeDetails && (
                <div className="p-6">
                  {/* Selected Type Header */}
                  <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-200 p-2">
                          <FileSpreadsheet className="size-5 text-blue-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              Selected Type
                            </span>
                            <h3 className="font-semibold text-blue-900">{selectedUploadTypeDetails.name}</h3>
                          </div>
                          <p className="mt-1 text-sm text-blue-700">{selectedUploadTypeDetails.description}</p>
                        </div>
                      </div>
                      <ButtonModule
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUploadType(null)
                          setHasCompletedUploadTypeSelection(false)
                          setSelectedFile(null)
                          setExtractedColumns([])
                        }}
                        className="border-blue-300 bg-white text-blue-700 hover:bg-blue-100"
                      >
                        Change Type
                      </ButtonModule>
                    </div>
                  </div>

                  {/* Template Download & Column Info */}
                  <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                          <div className="flex items-start gap-3">
                            <Download className="mt-0.5 size-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">Need a template?</p>
                              <p className="text-sm text-gray-600">Download a sample CSV with the correct format</p>
                            </div>
                          </div>
                          <ButtonModule
                            variant="primary"
                            size="sm"
                            onClick={downloadSampleFile}
                            icon={<Download className="size-4" />}
                          >
                            Download Template
                          </ButtonModule>
                        </div>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => setShowColumnHelp(!showColumnHelp)}
                        className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition-colors hover:bg-gray-100"
                      >
                        <HelpCircle className="size-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Required Columns</p>
                          <p className="text-sm text-gray-600">Click to view all</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Column Help Modal */}
                  <AnimatePresence>
                    {showColumnHelp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden"
                      >
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Info className="size-5 text-blue-600" />
                              <h4 className="font-medium text-blue-900">Required Columns</h4>
                            </div>
                            <button
                              onClick={() => setShowColumnHelp(false)}
                              className="rounded-full p-1 text-blue-600 hover:bg-blue-200"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                            {selectedUploadTypeDetails.requiredColumns.map((col, idx) => (
                              <div key={idx} className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
                                <div className="size-2 rounded-full bg-green-500" />
                                <span className="text-sm text-gray-700">{col}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* File Upload Drop Zone */}
                  <div
                    ref={dropZoneRef}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDragEnter={handleDragEnter}
                    className={`relative mb-6 rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                      isDragOver
                        ? "border-blue-400 bg-blue-50"
                        : selectedFile
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isLoading}
                    />

                    {!selectedFile ? (
                      <div>
                        <CloudUpload
                          className={`mx-auto h-16 w-16 ${isDragOver ? "text-blue-500" : "text-gray-400"}`}
                        />
                        <p className="mt-4 text-base text-gray-700">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            disabled={isLoading}
                          >
                            Click to upload
                          </button>{" "}
                          or drag and drop
                        </p>
                        <p className="mt-2 text-sm text-gray-500">CSV or Excel files (max 50MB)</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={removeSelectedFile}
                          className="absolute -right-2 -top-2 rounded-full bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          disabled={isLoading}
                          aria-label="Remove file"
                        >
                          <X className="size-4" />
                        </button>

                        <FileText className="mx-auto h-16 w-16 text-green-500" />
                        <p className="mt-2 font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>

                        {/* Extracted Columns Display */}
                        {extractedColumns.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-xs font-medium text-gray-700">Found columns:</p>
                            <div className="flex flex-wrap justify-center gap-1">
                              {extractedColumns.map((col, idx) => {
                                const isRequired = selectedUploadTypeDetails.requiredColumns.some(
                                  (rc) => rc.toLowerCase() === col.toLowerCase()
                                )
                                return (
                                  <span
                                    key={idx}
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                      isRequired ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {col}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Validation Status */}
                        {isValidatingFile && (
                          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                            <div className="size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            <span>Validating file...</span>
                          </div>
                        )}

                        {/* Upload File Button */}
                        {!isValidatingFile && (
                          <div className="mt-6 flex justify-center">
                            <button
                              onClick={handleUpload}
                              disabled={!selectedFile || !selectedUploadType || isLoading || uploadSuccess}
                              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUploading ? (
                                <>
                                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="size-4" />
                                  <span>Upload File</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upload Progress */}
                  <AnimatePresence>
                    {uploadProgress && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden"
                      >
                        <div
                          className={`rounded-lg border p-4 ${
                            uploadProgress.percentage === 100
                              ? "border-green-200 bg-green-50"
                              : "border-blue-200 bg-blue-50"
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                  uploadProgress.percentage === 100 ? "bg-green-200" : "bg-blue-200"
                                }`}
                              >
                                {uploadProgress.percentage === 100 ? (
                                  <CheckCircle className="size-5 text-green-600" />
                                ) : (
                                  <CloudUpload className="size-5 animate-pulse text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-medium ${
                                    uploadProgress.percentage === 100 ? "text-green-900" : "text-blue-900"
                                  }`}
                                >
                                  {uploadProgress.percentage === 100 ? "Upload Complete!" : "Uploading file..."}
                                </p>
                                <p
                                  className={`text-xs ${
                                    uploadProgress.percentage === 100 ? "text-green-700" : "text-blue-700"
                                  }`}
                                >
                                  {uploadProgress.percentage}% • {formatFileSize(uploadProgress.loaded)} of{" "}
                                  {formatFileSize(uploadProgress.total)}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-2xl font-bold ${
                                uploadProgress.percentage === 100 ? "text-green-800" : "text-blue-800"
                              }`}
                            >
                              {uploadProgress.percentage}%
                            </span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress.percentage}%` }}
                              transition={{ duration: 0.3 }}
                              className={`h-full ${uploadProgress.percentage === 100 ? "bg-green-500" : "bg-blue-500"}`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success Message */}
                  <AnimatePresence>
                    {uploadSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4"
                      >
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 size-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-900">Upload Successful!</p>
                              <p className="text-sm text-green-700">
                                Your file has been uploaded and queued for processing
                              </p>
                            </div>
                          </div>
                          <ButtonModule
                            variant="primary"
                            size="sm"
                            onClick={() => router.push("/assets-management/bulk-upload")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            View Upload History
                          </ButtonModule>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Messages */}
                  <AnimatePresence>
                    {(uploadError ||
                      fileIntentError ||
                      finalizeFileError ||
                      distributionSubstationBulkUploadError ||
                      distributionSubstationFeederRealignmentBulkUploadError ||
                      feederBandChangeBulkUploadError) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
                          <div>
                            <p className="font-medium text-red-900">Upload Failed</p>
                            <p className="text-sm text-red-700">
                              {uploadError ||
                                fileIntentError ||
                                finalizeFileError ||
                                distributionSubstationBulkUploadError ||
                                distributionSubstationFeederRealignmentBulkUploadError ||
                                feederBandChangeBulkUploadError}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* File Info Card */}
                  {selectedFile && !uploadSuccess && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-2">
                        <Info className="size-4 text-gray-500" />
                        <p className="text-xs text-gray-600">
                          Maximum file size: 50MB • Supported formats: CSV, XLSX, XLS
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Uploads Table for Selected Job Type */}
              {selectedUploadType && (
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <JobTypeUploadsTable jobType={selectedUploadType} />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Additional Upload Button */}

      {/* Mobile Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-4 shadow-lg sm:hidden">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/assets-management/bulk-upload")}
              className="flex-1 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
            >
              Upload History
            </button>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedUploadType || isLoading || uploadSuccess}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004B23] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="size-4" />
                <span>Upload File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl bg-white p-6 shadow-xl"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <div className="text-center">
                  <p className="font-medium text-gray-900">
                    {isValidatingFile ? "Validating file..." : "Processing..."}
                  </p>
                  <p className="text-sm text-gray-600">Please wait</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default FileManagementPage
