"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  createBillingScheduleRun,
  CreateBillingScheduleRunRequest,
  createFileIntent,
  CsvJob,
  downloadCsv,
  fetchCsvJobs,
  fetchJobTypeTemplate,
  finalizeFile,
  processAdjustmentBillingBulkUpload,
  processCustomerSrdtUpdateBulkUpload,
  processCustomerStatusChangeBulkUpload,
  processCustomerStoredAverageUpdateBulkUpload,
  processCustomerTariffChangeBulkUpload,
  processFeederEnergyCapBulkUpload,
  processMeterChangeOut,
  processMeterReadingBulkUpload,
  processPostpaidEstimatedConsumptionBulkUpload,
  resetFileManagementState,
} from "lib/redux/fileManagementSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchFeeders } from "lib/redux/feedersSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { fetchBillingPeriods, Stage } from "lib/redux/billingPeriodsSlice"
import {
  BillingScheduleRunStage,
  clearExportArScheduleRunStatus,
  clearRunPdfGenerationStatus,
  exportArScheduleRun,
  ExportArScheduleRunRequest,
  fetchBillingScheduleProgress,
  fetchBillingScheduleRun,
  publishBillingScheduleRun,
  runPdfGeneration,
  RunPdfGenerationRequest,
  startBillingScheduleRun,
} from "lib/redux/postpaidSlice"
import * as XLSX from "xlsx"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { SearchModule } from "components/ui/Search/search-module"
import CsvUploadFailuresModal from "components/ui/Modal/CsvUploadFailuresModal"
import { ColumnHelpModal, CreateBillingScheduleRunModal } from "components/ui/Modal"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  CloudUpload,
  Download,
  Eye,
  FileDown,
  FileIcon,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  Play,
  RefreshCw,
  Upload,
  X,
} from "lucide-react"
import { VscEye } from "react-icons/vsc"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import BillingScheduleRunsTab from "components/BillingInfo/BillingScheduleRunsTab"
import BillPreviewTab from "components/BillingInfo/BillPreviewTab"

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UploadTypeOption {
  name: string
  value: number | string
  description: string
  requiredColumns: string[]
  sampleData: string[]
}

// Hook to get latest jobs for all upload types
const useLatestJobs = () => {
  const dispatch = useAppDispatch()
  const [latestJobs, setLatestJobs] = useState<Record<number, CsvJob | null>>({})
  const [isLoading, setIsLoading] = useState(false)
  const latestJobsRef = useRef<Record<number, CsvJob | null>>({})

  // Keep ref in sync with state
  useEffect(() => {
    latestJobsRef.current = latestJobs
  }, [latestJobs])

  const fetchLatestJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const jobTypes = [2, 3, 7, 8, 9, 10, 19, 24, 32] // Specific job types for billing generate details
      const jobsData: Record<number, CsvJob | null> = {}

      // Fetch all job types in parallel to reduce sequential API calls
      const results = await Promise.allSettled(
        jobTypes.map((jobType) =>
          dispatch(
            fetchCsvJobs({
              PageNumber: 1,
              PageSize: 1,
              JobType: jobType,
              Status: undefined,
            })
          ).unwrap()
        )
      )

      jobTypes.forEach((jobType, index) => {
        const result = results[index]
        if (result && result.status === "fulfilled" && result.value.isSuccess && result.value.data.length > 0) {
          jobsData[jobType] = result.value.data[0] ?? null
        } else {
          jobsData[jobType] = null
        }
      })

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

    if (!hasRunningJobs) return

    const interval = setInterval(async () => {
      try {
        const currentJobs = latestJobsRef.current
        const runningJobTypes = Object.entries(currentJobs)
          .filter(([_, job]) => job && (job.status === 1 || job.status === 2))
          .map(([jobType, _]) => parseInt(jobType))

        if (runningJobTypes.length === 0) return

        const jobsData: Record<number, CsvJob | null> = { ...currentJobs }

        const results = await Promise.allSettled(
          runningJobTypes.map((jobType) =>
            dispatch(
              fetchCsvJobs({
                PageNumber: 1,
                PageSize: 1,
                JobType: jobType,
                Status: undefined,
              })
            ).unwrap()
          )
        )

        runningJobTypes.forEach((jobType, index) => {
          const result = results[index]
          if (result && result.status === "fulfilled" && result.value.isSuccess && result.value.data.length > 0) {
            jobsData[jobType] = result.value.data[0] ?? null
          }
        })

        setLatestJobs(jobsData)
      } catch (error) {
        console.error("Failed to fetch running job updates:", error)
      }
    }, 5000)

    return () => clearInterval(interval)
    // Only re-run when the *presence* of running jobs changes, not on every latestJobs update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.values(latestJobs).some((job) => job && (job.status === 1 || job.status === 2)), dispatch])

  return { latestJobs, isLoading, refetch: fetchLatestJobs }
}

// Utility function to extract columns from CSV data
const extractColumnsFromCSV = (csvData: string): string[] => {
  if (!csvData) return []

  const lines = csvData.split("\n")
  if (lines.length === 0) return []

  // Get the first line (header) and split by comma
  const headerLine = lines[0]?.trim() || ""
  const columns = headerLine.split(",").map((col: string) => col.trim().replace(/"/g, ""))

  return columns.filter((col: string) => col.length > 0)
}

// Hook to fetch template data and extract required columns
const useTemplateColumns = (jobType: number | null) => {
  const dispatch = useAppDispatch()
  const [templateColumns, setTemplateColumns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplateColumns = useCallback(async () => {
    if (!jobType) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await dispatch(fetchJobTypeTemplate({ jobType })).unwrap()

      if (result.isSuccess && result.data) {
        // Extract columns from CSV data
        const lines = result.data.split("\n")
        if (lines.length > 0) {
          const headerLine = lines[0].trim()
          const columns = headerLine.split(",").map((col: string) => col.trim().replace(/"/g, ""))
          const filteredColumns = columns.filter((col: string) => col.length > 0)
          setTemplateColumns(filteredColumns)
        }
      } else {
        setError(result.message || "Failed to fetch template")
      }
    } catch (error: any) {
      console.error("Failed to fetch template columns:", error)

      // Check if error contains CSV data
      if (error.message && error.message.includes("CustomerName,TariffCode")) {
        const lines = error.message.split("\n")
        if (lines.length > 0) {
          const headerLine = lines[0].trim()
          const columns = headerLine.split(",").map((col: string) => col.trim().replace(/"/g, ""))
          const filteredColumns = columns.filter((col: string) => col.length > 0)
          setTemplateColumns(filteredColumns)
        }
      } else {
        setError(error.message || "Failed to fetch template")
      }
    } finally {
      setIsLoading(false)
    }
  }, [jobType, dispatch])

  useEffect(() => {
    fetchTemplateColumns()
  }, [fetchTemplateColumns])

  return { templateColumns, isLoading, error, refetch: fetchTemplateColumns }
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
    { name: "Customer Meter Reading", value: 2, description: "", requiredColumns: [], sampleData: [] },
    { name: "Feeder Energy Cap", value: 3, description: "", requiredColumns: [], sampleData: [] },
    { name: "Customer Tariff Change", value: 7, description: "", requiredColumns: [], sampleData: [] },
    { name: "Customer Status Change", value: 8, description: "", requiredColumns: [], sampleData: [] },
    { name: "Customer Stored Average Update", value: 9, description: "", requiredColumns: [], sampleData: [] },
    { name: "Customer-DT Reallignment", value: 10, description: "", requiredColumns: [], sampleData: [] },
    { name: "Bill Adjustment", value: 19, description: "", requiredColumns: [], sampleData: [] },
    { name: "Customer Estimated Consumption", value: 24, description: "", requiredColumns: [], sampleData: [] },
    { name: "Meter Change Out", value: 32, description: "", requiredColumns: [], sampleData: [] },
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
      return "text-green-600 bg-green-50"
    case 3:
      return "text-blue-600 bg-blue-50"
    case 4:
      return "text-red-600 bg-red-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

const getStatusText = (status: number | undefined) => {
  switch (status) {
    case 0:
      return "Queued"
    case 1:
      return "Running"
    case 2:
      return "Completed"
    case 3:
      return "Failed"
    default:
      return "Unknown"
  }
}

// Get stage name based on stage number
const getStageName = (stage: number | undefined) => {
  switch (stage) {
    case 1:
      return "Generating Draft Bill"
    case 2:
      return "Publishing Draft Bill"
    case 3:
      return "Exporting AR"
    case 4:
      return "Generating PDF"
    default:
      return "Processing"
  }
}

// Stage state enum: Pending = 0, Running = 1, Succeeded = 2, Failed = 3
// Get the currently running stage from stages array (state === 1 means Running)
const getRunningStage = (stages: Stage[] | undefined) => {
  if (!stages || stages.length === 0) return null
  // Find the stage with state === 1 (Running)
  const runningStage = stages.find((s) => s.state === 1)
  return runningStage || null
}

// Get the current stage name based on the running stage in the stages array
const getCurrentStageName = (stages: Stage[] | undefined) => {
  const runningStage = getRunningStage(stages)
  if (runningStage) {
    return getStageName(runningStage.stage)
  }
  return "Processing"
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
                      <span className="text-xs text-gray-600">
                        {job.totalRows !== null && job.totalRows > 0
                          ? Math.round((job.succeededRows / job.totalRows) * 100) + "%"
                          : "Processing"}
                      </span>
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
    billingBulkUploadLoading,
    billingBulkUploadError,
    billingBulkUploadSuccess,
    billRecomputeBulkUploadLoading,
    billRecomputeBulkUploadError,
    billRecomputeBulkUploadSuccess,
    billManualEnergyBulkUploadLoading,
    billManualEnergyBulkUploadError,
    billManualEnergyBulkUploadSuccess,
    debtRecoveryNoEnergyBulkUploadLoading,
    debtRecoveryNoEnergyBulkUploadError,
    debtRecoveryNoEnergyBulkUploadSuccess,
    createBillingScheduleRunLoading,
    createBillingScheduleRunError,
    createBillingScheduleRunSuccess,
    createBillingScheduleRunResponse,
  } = useAppSelector((state: { fileManagement: any }) => state.fileManagement)

  // Redux state for dropdown options
  const { areaOffices, loading: areaOfficesLoading } = useAppSelector((state: any) => state.areaOffices)

  const { feeders, loading: feedersLoading } = useAppSelector((state: any) => state.feeders)

  const { distributionSubstations, loading: distributionSubstationsLoading } = useAppSelector(
    (state: any) => state.distributionSubstations
  )

  const { billingPeriods, loading: billingPeriodsLoading } = useAppSelector((state: any) => state.billingPeriods)

  // Billing schedule run state
  const {
    billingScheduleRun,
    billingScheduleRunLoading,
    startBillingScheduleRunLoading,
    startBillingScheduleRunError,
    startBillingScheduleRunSuccess,
    startBillingScheduleRunMessage,
    billingScheduleProgressLoading,
    billingScheduleProgress,
    billingScheduleProgressSuccess,
    publishBillingScheduleRunLoading,
    publishBillingScheduleRunSuccess,
    publishBillingScheduleRunError,
    publishBillingScheduleRunMessage,
    publishBillingScheduleRunData,
    exportArScheduleRunLoading,
    exportArScheduleRunSuccess,
    exportArScheduleRunError,
    exportArScheduleRunMessage,
    exportArScheduleRunData,
    runPdfGenerationLoading,
    runPdfGenerationSuccess,
    runPdfGenerationError,
    runPdfGenerationMessage,
    runPdfGenerationData,
  } = useAppSelector((state: any) => state.postpaidBilling)

  // Get latest jobs for all upload types
  const { latestJobs, isLoading: jobsLoading, refetch: refetchLatestJobs } = useLatestJobs()

  // Upload type options with enhanced metadata
  const uploadTypeOptions: UploadTypeOption[] = [
    {
      name: "Customer Meter Reading",
      value: 2,
      description: "Upload meter readings for customer accounts",
      requiredColumns: ["CustomerAccountNo", "PresentReading", "PreviousReading", "MonthYear"],
      sampleData: [
        "CustomerAccountNo,PresentReading,PreviousReading,MonthYear",
        "123456789,4567.5,4321.2,2026-01",
        "987654321,7890.1,7654.3,2026-01",
        "555666777,3210.8,2987.4,2026-02",
      ],
    },
    {
      name: "Customer Stored Average",
      value: 9,
      description: "Update stored average consumption values for customers",
      requiredColumns: ["CustomerAccountNo", "TariffCode"],
      sampleData: ["CustomerAccountNo,TariffCode", "CUST001,R1", "CUST002,R2", "CUST003,R3"],
    },
    {
      name: "Customer-DT Reallignment",
      value: 10,
      description: "Reassign customers to different distribution transformers",
      requiredColumns: ["DssCode", "EmployeeNo", "CustomerAccountNo"],
      sampleData: [
        "DssCode,EmployeeNo,CustomerAccountNo",
        "DT001,EMP001,CUST001",
        "DT002,EMP002,CUST002",
        "DT003,EMP003,CUST003",
      ],
    },
    {
      name: "Customer Estimated Consumption",
      value: 24,
      description: "Upload estimated consumption values for postpaid customers",
      requiredColumns: ["CustomerAccountNo", "EstimatedConsumptionKwh", "MonthYear"],
      sampleData: [
        "CustomerAccountNo,EstimatedConsumptionKwh,MonthYear",
        "CUST001,150.5,2026-01",
        "CUST002,200.75,2026-01",
        "CUST003,175.25,2026-02",
      ],
    },
    {
      name: "Customer Status Change",
      value: 8,
      description: "Update customer status codes (Active, Inactive, Disconnected, etc.)",
      requiredColumns: ["CustomerAccountNo", "StatusCodeChange"],
      sampleData: ["CustomerAccountNo,StatusCodeChange", "CUST001,INACTIVE", "CUST002,ACTIVE", "CUST003,DISCONNECTED"],
    },
    {
      name: "Customer Tariff Change",
      value: 7,
      description: "Change tariff assignments for multiple customers",
      requiredColumns: ["CustomerAccountNo", "TariffCode"],
      sampleData: ["CustomerAccountNo,TariffCode", "CUST001,R2", "CUST002,R3", "CUST003,R1"],
    },
    {
      name: "Meter Change Out",
      value: 32,
      description: "Process meter replacements with final and initial readings",
      requiredColumns: ["CustomerAccountNo", "PresentReading", "InitialReading", "NewMeterNumber"],
      sampleData: [
        "CustomerAccountNo,PresentReading,InitialReading,NewMeterNumber",
        "CUST001,4567.5,4321.2,MTR004",
        "CUST002,7890.1,7654.3,MTR005",
        "CUST003,3210.8,2987.4,MTR006",
      ],
    },
    {
      name: "Feeder Energy Cap",
      value: 3,
      description: "Upload feeder energy cap limits and allocations",
      requiredColumns: ["EnergyReceived", "EnergyAdviced", "FeederName"],
      sampleData: [
        "EnergyReceived,EnergyAdviced,FeederName",
        "1500.5,1450.75,Feeder A",
        "2000.0,1950.25,Feeder B",
        "1750.25,1700.5,Feeder C",
      ],
    },
    {
      name: "Bill Adjustment",
      value: 19,
      description: "Apply bill adjustments to customer accounts for specific billing periods",
      requiredColumns: ["CustomerAccountNo", "MonthYear", "Amount"],
      sampleData: [
        "CustomerAccountNo,MonthYear,Amount",
        "123456789,2026-01,150.50",
        "987654321,2026-01,-75.25",
        "555666777,2026-02,200.00",
      ],
    },
  ]

  // Helper function to get bulkInsertType based on upload type
  const getBulkInsertType = (uploadType: number | string | null): string => {
    switch (uploadType) {
      case 2:
        return "meter-readings-account"
      case 3:
        return "feeder-energy-cap"
      case 7:
        return "customer-tariff-change"
      case 8:
        return "customer-status-change"
      case 9:
        return "customer-stored-average-update"
      case 10:
        return "customer-srdt-update"
      case 19:
        return "bill-adjustment"
      case 24:
        return "customer-estimated-consumption"
      case 32:
        return "meter-changeout"
      default:
        return "meter-readings-account"
    }
  }

  // Helper function to get purpose based on upload type
  const getPurpose = (uploadType: number | string | null): string => {
    switch (uploadType) {
      case 2:
        return "postpaid-meter-readings-account-bulk"
      case 3:
        return "feeder-energy-caps-bulk"
      case 7:
        return "customer-tariff-change-bulk"
      case 8:
        return "customer-status-change-bulk"
      case 9:
        return "customer-stored-average-update-bulk"
      case 10:
        return "customer-srdt-update-bulk"
      case 19:
        return "postpaid-bill-adjustments-bulk"
      case 24:
        return "customer-estimated-consumption-bulk"
      case 32:
        return "meter-changeout-bulk"
      default:
        return "meter-readings-account-bulk"
    }
  }

  // Tab state
  const [activeTab, setActiveTab] = useState<"bulk-upload" | "schedule-runs" | "bill-preview">("bulk-upload")

  // Local state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedUploadType, setSelectedUploadType] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Get template columns for selected upload type
  const { templateColumns, isLoading: columnsLoading, error: columnsError } = useTemplateColumns(selectedUploadType)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [finalizedFile, setFinalizedFile] = useState<any>(null)
  const [bulkUploadProcessed, setBulkUploadProcessed] = useState(false)
  const [bulkUploadResponse, setBulkUploadResponse] = useState<any>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [hasCompletedUploadTypeSelection, setHasCompletedUploadTypeSelection] = useState(false)
  const [extractedColumns, setExtractedColumns] = useState<string[]>([])
  const [isValidatingFile, setIsValidatingFile] = useState(false)
  const [showColumnHelp, setShowColumnHelp] = useState(false)

  // Billing Schedule Run form state
  const [showCreateRunModal, setShowCreateRunModal] = useState(false)
  const [runFormData, setRunFormData] = useState<CreateBillingScheduleRunRequest>({
    billingPeriodId: 0,
    areaOfficeId: 0,
    feederId: 0,
    distributionSubstationId: 0,
    title: "",
  })

  // Get schedule ID from URL
  const scheduleId = typeof window !== "undefined" ? window.location.pathname.split("/").pop() ?? null : null

  // Fetch billing schedule run data
  useEffect(() => {
    const parsedId = scheduleId ? parseInt(scheduleId) : NaN
    if (!isNaN(parsedId)) {
      dispatch(fetchBillingScheduleRun(parsedId))
    }
  }, [dispatch, scheduleId])

  // Show action buttons when billing schedule run data is available and respective flags are true
  const showPublishButton = billingScheduleRun?.latestRunProgress?.showPublishButton === true
  const showExportArButton = billingScheduleRun?.latestRunProgress?.showExportArButton === true
  const showGeneratePdfButton = billingScheduleRun?.latestRunProgress?.showGeneratePdfButton === true

  // Generate PDF modal state
  const [isGeneratePdfModalOpen, setIsGeneratePdfModalOpen] = useState(false)
  const [pdfAreaOffice, setPdfAreaOffice] = useState("")
  const [pdfFeeder, setPdfFeeder] = useState("")
  const [pdfDistributionSubstation, setPdfDistributionSubstation] = useState("")
  const [pdfGroupBy, setPdfGroupBy] = useState("0")
  const [pdfMaxBillsPerFile, setPdfMaxBillsPerFile] = useState("5000")
  const [pdfAreaOfficeSearch, setPdfAreaOfficeSearch] = useState("")
  const [pdfFeederSearch, setPdfFeederSearch] = useState("")
  const [pdfDistributionSubstationSearch, setPdfDistributionSubstationSearch] = useState("")

  // Export AR modal state
  const [isExportArModalOpen, setIsExportArModalOpen] = useState(false)
  const [exportArAreaOffice, setExportArAreaOffice] = useState("")
  const [exportArFeeder, setExportArFeeder] = useState("")
  const [exportArDistributionSubstation, setExportArDistributionSubstation] = useState("")
  const [exportArStatusCode, setExportArStatusCode] = useState("")
  const [exportArAreaOfficeSearch, setExportArAreaOfficeSearch] = useState("")
  const [exportArFeederSearch, setExportArFeederSearch] = useState("")
  const [exportArDistributionSubstationSearch, setExportArDistributionSubstationSearch] = useState("")

  const [scheduleType, setScheduleType] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Reset states on unmount
  useEffect(() => {
    return () => {
      dispatch(resetFileManagementState())
      dispatch({ type: "fileManagement/resetBillingBulkUploadState" })
    }
  }, [dispatch])

  // Fetch dropdown options when any modal that needs them opens
  useEffect(() => {
    if (showCreateRunModal || isGeneratePdfModalOpen || isExportArModalOpen) {
      dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 1000 }))
      dispatch(fetchFeeders({ pageNumber: 1, pageSize: 1000 }))
      dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 1000 }))
    }
    if (showCreateRunModal) {
      dispatch(fetchBillingPeriods({ pageNumber: 1, pageSize: 1000 }))
    }
  }, [showCreateRunModal, isGeneratePdfModalOpen, isExportArModalOpen, dispatch])

  // Generate PDF search handlers
  const handlePdfAreaOfficeSearchChange = (searchValue: string) => {
    setPdfAreaOfficeSearch(searchValue)
  }

  const handlePdfFeederSearchChange = (searchValue: string) => {
    setPdfFeederSearch(searchValue)
  }

  const handlePdfDistributionSubstationSearchChange = (searchValue: string) => {
    setPdfDistributionSubstationSearch(searchValue)
  }

  const handlePdfAreaOfficeSearchClick = () => {
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 1000, Search: pdfAreaOfficeSearch }))
  }

  const handlePdfFeederSearchClick = () => {
    dispatch(fetchFeeders({ pageNumber: 1, pageSize: 1000, search: pdfFeederSearch }))
  }

  const handlePdfDistributionSubstationSearchClick = () => {
    dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 1000, search: pdfDistributionSubstationSearch }))
  }

  // Handle Generate PDF submit
  const handleGeneratePdf = useCallback(async () => {
    try {
      let runId = billingScheduleRun?.latestRunProgress?.runId

      if (!runId) {
        notify("error", "No Run Available", {
          description: "No billing schedule run is available to generate PDF",
        })
        return
      }

      const requestData: RunPdfGenerationRequest = {
        groupBy: parseInt(pdfGroupBy),
        maxBillsPerFile: parseInt(pdfMaxBillsPerFile) || 5000,
        ...(pdfAreaOffice && { areaOfficeId: parseInt(pdfAreaOffice) }),
        ...(pdfFeeder && { feederId: parseInt(pdfFeeder) }),
        ...(pdfDistributionSubstation && { distributionSubstationId: parseInt(pdfDistributionSubstation) }),
      }

      const result = await dispatch(runPdfGeneration({ runId, requestData })).unwrap()

      notify("success", "PDF Generation Started", {
        description: result.message || "PDF generation job has been created successfully",
      })

      setIsGeneratePdfModalOpen(false)

      // Refresh the billing schedule run data and jobs so UI updates
      const parsedId = scheduleId ? parseInt(scheduleId) : NaN
      if (!isNaN(parsedId)) {
        dispatch(fetchBillingScheduleRun(parsedId))
      }
      refetchLatestJobs()
    } catch (error: any) {
      notify("error", "Failed to Generate PDF", {
        description: error.message || error || "An error occurred while creating the PDF generation job",
      })
    }
  }, [
    dispatch,
    billingScheduleRun,
    pdfGroupBy,
    pdfMaxBillsPerFile,
    pdfAreaOffice,
    pdfFeeder,
    pdfDistributionSubstation,
    scheduleId,
    refetchLatestJobs,
  ])

  const handleCloseGeneratePdfModal = () => {
    setIsGeneratePdfModalOpen(false)
    dispatch(clearRunPdfGenerationStatus())
    setPdfAreaOffice("")
    setPdfFeeder("")
    setPdfDistributionSubstation("")
    setPdfGroupBy("0")
    setPdfMaxBillsPerFile("5000")
    setPdfAreaOfficeSearch("")
    setPdfFeederSearch("")
    setPdfDistributionSubstationSearch("")
  }

  // Export AR search handlers
  const handleExportArAreaOfficeSearchChange = (searchValue: string) => {
    setExportArAreaOfficeSearch(searchValue)
  }

  const handleExportArFeederSearchChange = (searchValue: string) => {
    setExportArFeederSearch(searchValue)
  }

  const handleExportArDistributionSubstationSearchChange = (searchValue: string) => {
    setExportArDistributionSubstationSearch(searchValue)
  }

  const handleExportArAreaOfficeSearchClick = () => {
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 1000, Search: exportArAreaOfficeSearch }))
  }

  const handleExportArFeederSearchClick = () => {
    dispatch(fetchFeeders({ pageNumber: 1, pageSize: 1000, search: exportArFeederSearch }))
  }

  const handleExportArDistributionSubstationSearchClick = () => {
    dispatch(
      fetchDistributionSubstations({ pageNumber: 1, pageSize: 1000, search: exportArDistributionSubstationSearch })
    )
  }

  // Handle Export AR submit
  const handleExportAr = useCallback(async () => {
    try {
      let runId = billingScheduleRun?.latestRunProgress?.runId

      if (!runId) {
        notify("error", "No Run Available", {
          description: "No billing schedule run is available to export AR",
        })
        return
      }

      const requestData: ExportArScheduleRunRequest = {
        isScoped: false,
        ...(exportArStatusCode && { statusCode: exportArStatusCode }),
        ...(exportArAreaOffice && { areaOfficeId: parseInt(exportArAreaOffice) }),
        ...(exportArFeeder && { feederId: parseInt(exportArFeeder) }),
        ...(exportArDistributionSubstation && { distributionSubstationId: parseInt(exportArDistributionSubstation) }),
      }

      const result = await dispatch(exportArScheduleRun({ runId, requestData })).unwrap()

      notify("success", "AR Export Job Created", {
        description: result.message || "AR export job has been created successfully",
      })

      setIsExportArModalOpen(false)

      // Refresh the billing schedule run data and jobs so UI updates
      const parsedId = scheduleId ? parseInt(scheduleId) : NaN
      if (!isNaN(parsedId)) {
        dispatch(fetchBillingScheduleRun(parsedId))
      }
      refetchLatestJobs()
    } catch (error: any) {
      notify("error", "Failed to Export AR", {
        description: error.message || error || "An error occurred while creating the AR export job",
      })
    }
  }, [
    dispatch,
    billingScheduleRun,
    exportArStatusCode,
    exportArAreaOffice,
    exportArFeeder,
    exportArDistributionSubstation,
    scheduleId,
    refetchLatestJobs,
  ])

  const handleCloseExportArModal = () => {
    setIsExportArModalOpen(false)
    dispatch(clearExportArScheduleRunStatus())
    setExportArAreaOffice("")
    setExportArFeeder("")
    setExportArDistributionSubstation("")
    setExportArStatusCode("")
    setExportArAreaOfficeSearch("")
    setExportArFeederSearch("")
    setExportArDistributionSubstationSearch("")
  }

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

        // Case-insensitive column matching using dynamic template columns
        const requiredColumns = templateColumns.length > 0 ? templateColumns : uploadType.requiredColumns
        const missingColumns = requiredColumns.filter(
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
      event.preventDefault() // Prevent any default form behavior

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
                if (selectedUploadType === 2) {
                  // Customer Meter Reading - use meter reading account bulk upload endpoint
                  bulkResult = await dispatch(processMeterReadingBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 3) {
                  // Feeder Energy Cap - use feeder energy cap endpoint with confirm
                  bulkResult = await dispatch(processFeederEnergyCapBulkUpload({ fileId, confirm: true })).unwrap()
                } else if (selectedUploadType === 7) {
                  // Customer Tariff Change - use customer tariff change endpoint
                  bulkResult = await dispatch(processCustomerTariffChangeBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 8) {
                  // Customer Status Change - use customer status change endpoint
                  bulkResult = await dispatch(processCustomerStatusChangeBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 9) {
                  // Customer Stored Average - use customer stored average update endpoint
                  bulkResult = await dispatch(processCustomerStoredAverageUpdateBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 10) {
                  // Customer-DT Reallignment - use customer SRDT update endpoint
                  bulkResult = await dispatch(processCustomerSrdtUpdateBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 19) {
                  // Bill Adjustment - use adjustment billing endpoint
                  bulkResult = await dispatch(processAdjustmentBillingBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 24) {
                  // Customer Estimated Consumption - use customer estimated consumption endpoint
                  bulkResult = await dispatch(processPostpaidEstimatedConsumptionBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 32) {
                  // Meter Change Out - use meter changeout endpoint
                  bulkResult = await dispatch(processMeterChangeOut({ fileId })).unwrap()
                } else {
                  // Fallback to general meter reading endpoint
                  bulkResult = await dispatch(processMeterReadingBulkUpload({ fileId })).unwrap()
                }

                if (!bulkResult.isSuccess) {
                  throw new Error(bulkResult.message)
                }

                setBulkUploadProcessed(true)
                setBulkUploadResponse(bulkResult)
                console.log("=== Bulk Upload Complete ===")
                console.log("Bulk upload data:", bulkResult.data)

                // Show bulk upload success notification
                const succeededRows =
                  (bulkResult.data as any)?.succeededRows ||
                  (bulkResult.data as any)?.job?.succeededRows ||
                  (bulkResult.data as any)?.preview?.validRows ||
                  0

                notify("success", "Processing Started!", {
                  description: `${succeededRows} billing records queued for processing`,
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
  }, [selectedFile, selectedUploadType, dispatch, extractColumnsFromFile])

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
    dispatch({ type: "fileManagement/resetBillingBulkUploadState" })
  }, [dispatch])

  // Handle billing schedule run creation
  const handleCreateBillingScheduleRun = useCallback(async () => {
    try {
      const scheduleId = window.location.pathname.split("/").pop() // Get ID from URL
      if (!scheduleId) {
        notify("error", "Invalid Schedule", {
          description: "Schedule ID not found",
        })
        return
      }

      await dispatch(
        createBillingScheduleRun({
          id: parseInt(scheduleId),
          request: runFormData,
        })
      ).unwrap()

      notify("success", "Run Created Successfully", {
        description: "The billing schedule run has been created and started",
      })

      setShowCreateRunModal(false)
      setRunFormData({
        billingPeriodId: 0,
        areaOfficeId: 0,
        feederId: 0,
        distributionSubstationId: 0,
        title: "",
      })

      // Refresh jobs and schedule run data so cards enable and buttons update
      refetchLatestJobs()
      const parsedId = scheduleId ? parseInt(scheduleId) : NaN
      if (!isNaN(parsedId)) {
        dispatch(fetchBillingScheduleRun(parsedId))
      }
    } catch (error: any) {
      notify("error", "Failed to Create Run", {
        description: error.message || "An error occurred while creating the billing schedule run",
      })
    }
  }, [dispatch, runFormData, refetchLatestJobs, scheduleId])

  // Handle start billing schedule run
  const handleStartBillingScheduleRun = useCallback(async () => {
    try {
      // Get the runId from the billing schedule run data first (latest run)
      let runId = billingScheduleRun?.latestRunProgress?.runId

      // If no latest run or latest run is completed/failed, use the create response
      if (
        !runId ||
        billingScheduleRun?.latestRunProgress?.runStatus === 2 ||
        billingScheduleRun?.latestRunProgress?.runStatus === 3
      ) {
        runId = createBillingScheduleRunResponse?.data?.postpaidBillingJobRunId
      }

      if (!runId) {
        notify("error", "Run Not Found", {
          description: "Billing schedule run ID not found. Please create a run first.",
        })
        return
      }

      await dispatch(startBillingScheduleRun(runId)).unwrap()

      notify("success", "Run Started Successfully", {
        description: startBillingScheduleRunMessage || "The billing schedule run has been started",
      })

      // Immediately refresh schedule run data and jobs so UI updates
      const parsedId = scheduleId ? parseInt(scheduleId) : NaN
      if (!isNaN(parsedId)) {
        dispatch(fetchBillingScheduleRun(parsedId))
      }
      refetchLatestJobs()
    } catch (error: any) {
      notify("error", "Failed to Start Run", {
        description: error.message || "An error occurred while starting the billing schedule run",
      })
    }
  }, [
    dispatch,
    createBillingScheduleRunResponse,
    startBillingScheduleRunMessage,
    billingScheduleRun,
    scheduleId,
    refetchLatestJobs,
  ])

  // Handle publish billing schedule run
  const handlePublishBillingScheduleRun = useCallback(async () => {
    try {
      // Get the runId from the billing schedule run data
      let runId = billingScheduleRun?.latestRunProgress?.runId

      if (!runId) {
        notify("error", "No Run Available", {
          description: "No billing schedule run is available to publish",
        })
        return
      }

      const result = await dispatch(publishBillingScheduleRun(runId)).unwrap()

      notify("success", "Bills Published Successfully", {
        description: result.message || `Published ${result.data?.totalBills || 0} bills successfully`,
      })

      // Refresh the billing schedule run data and jobs so UI updates
      const parsedId = scheduleId ? parseInt(scheduleId) : NaN
      if (!isNaN(parsedId)) {
        dispatch(fetchBillingScheduleRun(parsedId))
      }
      refetchLatestJobs()
    } catch (error: any) {
      notify("error", "Failed to Publish Bills", {
        description: error.message || "An error occurred while publishing the billing schedule run",
      })
    }
  }, [dispatch, billingScheduleRun, scheduleId, refetchLatestJobs])

  // Handle fetch billing schedule progress
  const handleFetchBillingScheduleProgress = useCallback(
    async (runId: number) => {
      try {
        await dispatch(fetchBillingScheduleProgress(runId)).unwrap()
      } catch (error: any) {
        console.error("Failed to fetch billing schedule progress:", error)
      }
    },
    [dispatch]
  )

  // Poll for progress when run is started
  useEffect(() => {
    const runId = createBillingScheduleRunResponse?.data?.postpaidBillingJobRunId

    if (runId && startBillingScheduleRunSuccess) {
      // Start polling for progress
      const interval = setInterval(() => {
        handleFetchBillingScheduleProgress(runId)
      }, 30000) // Poll every 30 seconds

      // Check if run is completed and stop polling
      if (billingScheduleProgress?.status === 2 || billingScheduleProgress?.status === 3) {
        // Completed or Failed
        clearInterval(interval)
      }

      return () => clearInterval(interval)
    }
  }, [
    startBillingScheduleRunSuccess,
    createBillingScheduleRunResponse,
    billingScheduleProgress?.status,
    handleFetchBillingScheduleProgress,
  ])

  // Poll for progress when we have a latest runId from billing schedule run and hasRunningStage is true
  useEffect(() => {
    const latestRunId = billingScheduleRun?.latestRunProgress?.runId
    const hasRunningStage = billingScheduleRun?.latestRunProgress?.hasRunningStage

    if (latestRunId && hasRunningStage === true) {
      // Start polling for progress and schedule run data
      const interval = setInterval(() => {
        handleFetchBillingScheduleProgress(latestRunId)
        // Also refresh schedule run data so buttons auto-update
        const parsedId = scheduleId ? parseInt(scheduleId) : NaN
        if (!isNaN(parsedId)) {
          dispatch(fetchBillingScheduleRun(parsedId))
        }
        refetchLatestJobs()
      }, 30000) // Poll every 30 seconds

      // Check if run is completed and stop polling
      if (billingScheduleProgress?.status === 2 || billingScheduleProgress?.status === 3) {
        // Completed or Failed - do a final refresh then stop
        clearInterval(interval)
        const parsedId = scheduleId ? parseInt(scheduleId) : NaN
        if (!isNaN(parsedId)) {
          dispatch(fetchBillingScheduleRun(parsedId))
        }
        refetchLatestJobs()
      }

      return () => clearInterval(interval)
    }
  }, [
    billingScheduleRun?.latestRunProgress?.runId,
    billingScheduleRun?.latestRunProgress?.hasRunningStage,
    billingScheduleProgress?.status,
    handleFetchBillingScheduleProgress,
    dispatch,
    scheduleId,
    refetchLatestJobs,
  ])

  // Download template using the new endpoint
  const downloadSampleFile = useCallback(async () => {
    if (!selectedUploadType) return

    try {
      console.log(`Fetching template for job type: ${selectedUploadType}`)

      // Dispatch the fetchJobTypeTemplate action
      const result = await dispatch(fetchJobTypeTemplate({ jobType: selectedUploadType })).unwrap()

      console.log("API Response:", result)

      if (result.isSuccess && result.data) {
        console.log("CSV Data received:", result.data)

        // Create a blob from the CSV data
        const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)

        // Create download link
        const link = document.createElement("a")
        link.href = url
        link.download = `template-job-type-${selectedUploadType}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        notify("success", "Template Downloaded", {
          description: "CSV template has been downloaded successfully",
          duration: 3000,
        })
      } else {
        console.error("API returned unsuccessful response:", result)
        notify("error", "Download Failed", {
          description: result.message || "Failed to download template",
          duration: 5000,
        })
      }
    } catch (error: any) {
      console.error("Failed to download template:", error)

      // Check if the error contains CSV data (sometimes the API returns data but throws an error)
      if (error.message && error.message.includes("CustomerName,TariffCode")) {
        console.log("Found CSV data in error message, attempting to download...")

        try {
          // Extract CSV data from error message
          const csvData = error.message
          const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
          const url = URL.createObjectURL(blob)

          const link = document.createElement("a")
          link.href = url
          link.download = `template-job-type-${selectedUploadType}.csv`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)

          notify("success", "Template Downloaded", {
            description: "CSV template has been downloaded successfully",
            duration: 3000,
          })
          return
        } catch (downloadError) {
          console.error("Failed to download from error data:", downloadError)
        }
      }

      notify("error", "Download Failed", {
        description: error.message || "An error occurred while downloading the template",
        duration: 5000,
      })
    }
  }, [selectedUploadType, dispatch])

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

  // Check if any run is in progress using hasRunningStage from API
  const isRunInProgress =
    (billingScheduleProgress && (billingScheduleProgress.status === 0 || billingScheduleProgress.status === 1)) ||
    billingScheduleRun?.latestRunProgress?.hasRunningStage === true

  // Check if there are no running jobs
  const hasNoRunningJobs =
    !jobsLoading && !Object.values(latestJobs).some((job) => job && (job.status === 1 || job.status === 2))

  // Check if any loading state is active
  const isLoading =
    fileIntentLoading ||
    finalizeFileLoading ||
    billingBulkUploadLoading ||
    billRecomputeBulkUploadLoading ||
    billManualEnergyBulkUploadLoading ||
    debtRecoveryNoEnergyBulkUploadLoading ||
    isUploading ||
    isValidatingFile

  return (
    <>
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
                      onClick={() => router.push("/billing/generate")}
                      className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Go back to billing generate"
                    >
                      <ArrowLeft className="size-5" />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Bulk Upload Billing</h1>
                      <p className="mt-1 text-sm text-gray-600">
                        Upload billing records in bulk using CSV or Excel files
                      </p>
                    </div>
                  </div>

                  {/* Desktop Actions */}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab("bulk-upload")}
                      className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                        activeTab === "bulk-upload"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="size-4" />
                        Bulk Upload
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("schedule-runs")}
                      className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                        activeTab === "schedule-runs"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="size-4" />
                        Schedule Runs
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("bill-preview")}
                      className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                        activeTab === "bill-preview"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="size-4" />
                        Bill Preview
                      </div>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Schedule Runs Tab */}
              {activeTab === "schedule-runs" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden rounded-xl bg-white p-6 shadow-lg"
                >
                  <BillingScheduleRunsTab scheduleId={scheduleId} />
                </motion.div>
              )}

              {/* Bill Preview Tab */}
              {activeTab === "bill-preview" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden rounded-xl bg-white p-6 shadow-lg"
                >
                  <BillPreviewTab scheduleId={scheduleId} />
                </motion.div>
              )}

              {/* Bulk Upload Tab - Main Content */}
              {activeTab === "bulk-upload" && (
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
                          <p className="text-sm text-gray-600">Choose the type of billing upload you want to perform</p>
                        </div>
                        <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          {uploadTypeOptions.length} options
                        </div>
                      </div>

                      {billingScheduleRun?.latestRunProgress === null && (
                        <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                          <Info className="size-5 shrink-0 text-amber-600" />
                          <p className="text-sm text-amber-800">
                            No running jobs detected. Please start a billing schedule run before selecting an upload
                            type.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {uploadTypeOptions.map((type) => {
                          const latestJob =
                            latestJobs[typeof type.value === "number" ? type.value : parseInt(type.value)] || null
                          const isLoading = jobsLoading
                          const isCardDisabled = isRunInProgress || billingScheduleRun?.latestRunProgress === null

                          return (
                            <motion.button
                              key={type.value}
                              whileHover={{ scale: isCardDisabled ? 1 : 1.02 }}
                              whileTap={{ scale: isCardDisabled ? 1 : 0.98 }}
                              onClick={() => {
                                if (!isCardDisabled) {
                                  setSelectedUploadType(
                                    typeof type.value === "number" ? type.value : parseInt(type.value)
                                  )
                                  setHasCompletedUploadTypeSelection(true)
                                }
                              }}
                              disabled={isCardDisabled}
                              className={`group relative rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition-all ${
                                isCardDisabled
                                  ? "cursor-not-allowed border-gray-300 opacity-50"
                                  : "hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              }`}
                            >
                              <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-blue-600">
                                {type.name}
                              </h3>
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
                    <div id="upload-section" className="p-6">
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
                            disabled={isRunInProgress}
                            className="border-blue-300 bg-white text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                              <div className="flex items-center gap-3">
                                {columnsLoading && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="size-3 animate-spin rounded-full border border-gray-300 border-t-blue-600" />
                                    Loading columns...
                                  </div>
                                )}
                                <ButtonModule
                                  variant="primary"
                                  size="sm"
                                  onClick={downloadSampleFile}
                                  icon={<Download className="size-4" />}
                                  disabled={columnsLoading || isRunInProgress}
                                >
                                  Download Template
                                </ButtonModule>
                              </div>
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
                      <ColumnHelpModal
                        isOpen={showColumnHelp}
                        onClose={() => setShowColumnHelp(false)}
                        templateColumns={templateColumns}
                        requiredColumns={selectedUploadTypeDetails.requiredColumns}
                      />

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
                                    const requiredColumns =
                                      templateColumns.length > 0
                                        ? templateColumns
                                        : selectedUploadTypeDetails.requiredColumns
                                    const isRequired = requiredColumns.some(
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
                                  type="button"
                                  onClick={handleUpload}
                                  disabled={
                                    !selectedFile ||
                                    !selectedUploadType ||
                                    isLoading ||
                                    uploadSuccess ||
                                    isRunInProgress
                                  }
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
                                  className={`h-full ${
                                    uploadProgress.percentage === 100 ? "bg-green-500" : "bg-blue-500"
                                  }`}
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
                                onClick={() => router.push("/billing/bulk-upload")}
                                disabled={isRunInProgress}
                                className="bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                          billingBulkUploadError ||
                          billRecomputeBulkUploadError ||
                          billManualEnergyBulkUploadError ||
                          debtRecoveryNoEnergyBulkUploadError) && (
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
                                    billingBulkUploadError ||
                                    billRecomputeBulkUploadError ||
                                    billManualEnergyBulkUploadError ||
                                    debtRecoveryNoEnergyBulkUploadError}
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
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-4 shadow-lg sm:hidden">
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/billing/bulk-upload")}
                disabled={isRunInProgress}
                className="flex-1 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Upload History
              </button>
              <button
                onClick={handleReset}
                disabled={isLoading || isRunInProgress}
                className="flex-1 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>
            </div>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || !selectedUploadType || isLoading || uploadSuccess || isRunInProgress}
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
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

          <CreateBillingScheduleRunModal
            isOpen={showCreateRunModal}
            onClose={() => setShowCreateRunModal(false)}
            onSubmit={handleCreateBillingScheduleRun}
            formData={runFormData}
            onFormDataChange={setRunFormData}
            scheduleType={scheduleType}
            loading={createBillingScheduleRunLoading}
            billingPeriods={billingPeriods}
            billingPeriodsLoading={billingPeriodsLoading}
            feeders={feeders}
            feedersLoading={feedersLoading}
            areaOffices={areaOffices}
            areaOfficesLoading={areaOfficesLoading}
            distributionSubstations={distributionSubstations}
            distributionSubstationsLoading={distributionSubstationsLoading}
          />
        </AnimatePresence>

        {/* Run in Progress Overlay */}
        {isRunInProgress && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <RefreshCw className="size-6 animate-spin text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getCurrentStageName(billingScheduleRun?.latestRunProgress?.stages)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    All operations are temporarily disabled while a billing schedule run is in progress. Please wait for
                    the run to complete.
                  </p>
                  {billingScheduleRun?.latestRunProgress?.stages && (
                    <p className="mt-2 text-xs text-blue-600">
                      {(() => {
                        const stage = getRunningStage(billingScheduleRun.latestRunProgress.stages)
                        return stage ? getStageName(stage.stage) : "Processing..."
                      })()}
                    </p>
                  )}
                </div>
                <div className="mt-4 w-full rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> You can monitor the progress in the progress bar at the bottom of the screen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Bottom Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-4 pl-72 sm:px-6 sm:pl-72 lg:px-8 lg:pl-72">
            <div className="flex flex-col gap-3">
              {/* Progress Display - uses running stage data from latestRunProgress */}
              {(() => {
                const runningStage = getRunningStage(billingScheduleRun?.latestRunProgress?.stages)
                const hasProgress = runningStage || billingScheduleProgressLoading

                if (!hasProgress) return null

                const progressPercentage =
                  runningStage && runningStage.total > 0
                    ? Math.round((runningStage.processed / runningStage.total) * 100)
                    : 0

                return (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center">
                          {billingScheduleProgressLoading ? (
                            <div className="size-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                          ) : (
                            <RefreshCw className="size-5 animate-spin text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">
                            {getCurrentStageName(billingScheduleRun?.latestRunProgress?.stages)}
                          </h4>
                          <p className="text-xs text-blue-700">
                            {billingScheduleProgressLoading
                              ? "Fetching progress..."
                              : getStageName(runningStage?.stage) || "Processing..."}
                          </p>
                        </div>
                      </div>
                      {runningStage && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-900">
                            {runningStage.processed} / {runningStage.total}
                          </div>
                          <div className="text-xs text-blue-700">{progressPercentage}%</div>
                        </div>
                      )}
                    </div>

                    {runningStage && (
                      <div className="mt-3 space-y-2">
                        <div className="h-2 w-full rounded-full bg-blue-200">
                          <div
                            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                            style={{
                              width: `${progressPercentage}%`,
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-blue-700">Total:</span>
                            <span className="ml-1 font-medium text-blue-900">{runningStage.total}</span>
                          </div>
                          <div>
                            <span className="text-green-700">Succeeded:</span>
                            <span className="ml-1 font-medium text-green-900">{runningStage.succeeded}</span>
                          </div>
                          <div>
                            <span className="text-red-700">Failed:</span>
                            <span className="ml-1 font-medium text-red-900">{runningStage.failed}</span>
                          </div>
                          <div>
                            <span className="text-orange-700">Pending:</span>
                            <span className="ml-1 font-medium text-orange-900">{runningStage.pending}</span>
                          </div>
                        </div>
                        {runningStage.lastError && (
                          <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-600">
                            <strong>Last Error:</strong> {runningStage.lastError}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Current Running Stage Progress */}
                    {billingScheduleRun?.latestRunProgress?.stages?.filter(
                      (stage: BillingScheduleRunStage) => stage.state === 1
                    ).length > 0 && (
                      <div className="mt-4 border-t border-blue-200 pt-4">
                        <h5 className="mb-3 text-sm font-medium text-blue-900">Current Progress</h5>
                        <div className="space-y-3">
                          {billingScheduleRun.latestRunProgress.stages
                            .filter((stage: BillingScheduleRunStage) => stage.state === 1)
                            .map((stage: BillingScheduleRunStage) => {
                              const stageProgress =
                                stage.total > 0 ? Math.round((stage.processed / stage.total) * 100) : 0
                              const getStatusColor = (state: number, failed: number, succeeded: number) => {
                                // Handle failed stages that might have state 2 but failed > 0
                                if (failed > 0 && succeeded === 0) {
                                  return "text-red-600 bg-red-50 border-red-200" // Failed
                                }
                                switch (state) {
                                  case 0:
                                    return "text-gray-500 bg-gray-50 border-gray-200" // Pending
                                  case 1:
                                    return "text-blue-600 bg-blue-50 border-blue-200" // Running
                                  case 2:
                                    return "text-green-600 bg-green-50 border-green-200" // Succeeded
                                  case 3:
                                    return "text-red-600 bg-red-50 border-red-200" // Failed
                                  default:
                                    return "text-gray-500 bg-gray-50 border-gray-200"
                                }
                              }
                              const getStatusIcon = (state: number, failed: number, succeeded: number) => {
                                // Handle failed stages that might have state 2 but failed > 0
                                if (failed > 0 && succeeded === 0) {
                                  return <X className="size-3 text-red-600" />
                                }
                                switch (state) {
                                  case 0:
                                    return <div className="size-3 rounded-full bg-gray-400" />
                                  case 1:
                                    return (
                                      <div className="size-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    )
                                  case 2:
                                    return <CheckCircle className="size-3 text-green-600" />
                                  case 3:
                                    return <X className="size-3 text-red-600" />
                                  default:
                                    return <div className="size-3 rounded-full bg-gray-400" />
                                }
                              }
                              const getStatusText = (state: number, failed: number, succeeded: number) => {
                                // Handle failed stages that might have state 2 but failed > 0
                                if (failed > 0 && succeeded === 0) {
                                  return "Failed"
                                }
                                switch (state) {
                                  case 0:
                                    return "Pending"
                                  case 1:
                                    return "Running"
                                  case 2:
                                    return "Completed"
                                  case 3:
                                    return "Failed"
                                  default:
                                    return "Unknown"
                                }
                              }

                              return (
                                <div
                                  key={stage.stage}
                                  className={`rounded-lg border p-3 ${getStatusColor(
                                    stage.state,
                                    stage.failed,
                                    stage.succeeded
                                  )}`}
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(stage.state, stage.failed, stage.succeeded)}
                                      <span className="text-sm font-medium">{getStageName(stage.stage)}</span>
                                      <span className="rounded-full bg-white/60 px-2 py-1 text-xs font-medium">
                                        {getStatusText(stage.state, stage.failed, stage.succeeded)}
                                      </span>
                                    </div>
                                    {stage.total > 0 && (
                                      <div className="text-xs font-medium">
                                        {stage.processed} / {stage.total} ({stageProgress}%)
                                      </div>
                                    )}
                                  </div>

                                  <p className="mb-2 text-xs opacity-80">{stage.message}</p>

                                  {stage.total > 0 && stage.state !== 0 && (
                                    <div className="space-y-1">
                                      <div className="h-1.5 w-full rounded-full bg-white/60">
                                        <div
                                          className={`h-1.5 rounded-full transition-all duration-300 ${
                                            stage.state === 1
                                              ? "bg-blue-600"
                                              : stage.state === 2
                                              ? "bg-green-600"
                                              : stage.state === 3
                                              ? "bg-red-600"
                                              : "bg-gray-400"
                                          }`}
                                          style={{ width: `${stageProgress}%` }}
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 gap-2 text-xs">
                                        <div>
                                          <span className="opacity-70">Total:</span>
                                          <span className="ml-1 font-medium">{stage.total}</span>
                                        </div>
                                        <div>
                                          <span className="text-green-700 opacity-70">Success:</span>
                                          <span className="ml-1 font-medium text-green-800">{stage.succeeded}</span>
                                        </div>
                                        <div>
                                          <span className="text-red-700 opacity-70">Failed:</span>
                                          <span className="ml-1 font-medium text-red-800">{stage.failed}</span>
                                        </div>
                                        <div>
                                          <span className="text-orange-700 opacity-70">Pending:</span>
                                          <span className="ml-1 font-medium text-orange-800">{stage.pending}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {stage.lastError && (
                                    <div className="mt-2 rounded bg-red-100 p-2 text-xs text-red-700">
                                      <strong>Error:</strong> {stage.lastError}
                                    </div>
                                  )}

                                  <div className="mt-2 text-xs opacity-60">
                                    {stage.requestedAtUtc && (
                                      <div>Requested: {new Date(stage.requestedAtUtc).toLocaleString()}</div>
                                    )}
                                    {stage.startedAtUtc && (
                                      <div>Started: {new Date(stage.startedAtUtc).toLocaleString()}</div>
                                    )}
                                    {stage.completedAtUtc && (
                                      <div>Completed: {new Date(stage.completedAtUtc).toLocaleString()}</div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              <div className="flex w-full gap-3 ">
                {billingScheduleRun?.latestRunProgress === null ? (
                  <button
                    className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      setShowCreateRunModal(true)
                      const sid = window.location.pathname.split("/").pop()
                      if (sid === "6") {
                        setScheduleType("Feeder")
                      } else if (sid === "7") {
                        setScheduleType("AreaOffice")
                      } else if (sid === "8") {
                        setScheduleType("Distribution Substation")
                      } else {
                        setScheduleType("Custom MD")
                      }
                    }}
                  >
                    <Play className="mr-2 size-5" />
                    Start Run
                  </button>
                ) : (
                  <>
                    {/* Hide Generate Draft Bill button when run is active */}
                    {(!billingScheduleProgress ||
                      billingScheduleProgress.status === 2 ||
                      billingScheduleProgress.status === 3) &&
                    billingScheduleRun?.latestRunProgress?.hasRunningStage !== true ? (
                      <button
                        className="flex w-full items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handleStartBillingScheduleRun}
                        disabled={
                          startBillingScheduleRunLoading ||
                          (billingScheduleProgress &&
                            (billingScheduleProgress.status === 0 || billingScheduleProgress.status === 1)) ||
                          billingScheduleRun?.latestRunProgress?.hasRunningStage === true
                        }
                      >
                        {startBillingScheduleRunLoading ? (
                          <>
                            <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Starting Run...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 size-5" />
                            Generate Draft Bill
                          </>
                        )}
                      </button>
                    ) : null}

                    {/* Show active run indicator when run is in progress */}
                    {(billingScheduleProgress &&
                      (billingScheduleProgress.status === 0 || billingScheduleProgress.status === 1)) ||
                    billingScheduleRun?.latestRunProgress?.hasRunningStage === true ? (
                      <div className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white">
                        <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>{getCurrentStageName(billingScheduleRun?.latestRunProgress?.stages)}...</span>
                      </div>
                    ) : null}

                    {/* Show completed state */}
                    {/* {(billingScheduleProgress && billingScheduleProgress.status === 2) ||
                  (billingScheduleRun?.latestRunProgress && billingScheduleRun.latestRunProgress.runStatus === 2) ? (
                    <div className="flex w-full items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white">
                      <CheckCircle className="mr-2 size-5" />
                      <span>Run Completed Successfully</span>
                    </div>
                  ) : null} */}

                    {/* Show failed state */}
                    {(billingScheduleProgress && billingScheduleProgress.status === 3) ||
                    (billingScheduleRun?.latestRunProgress && billingScheduleRun.latestRunProgress.runStatus === 3) ? (
                      <div className="flex w-full items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-base font-medium text-white">
                        <AlertCircle className="mr-2 size-5" />
                        <span>Run Failed</span>
                      </div>
                    ) : null}
                    {showPublishButton && (
                      <button
                        className="flex w-full items-center justify-center rounded-lg bg-green-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handlePublishBillingScheduleRun}
                        disabled={isRunInProgress || publishBillingScheduleRunLoading}
                      >
                        {publishBillingScheduleRunLoading ? (
                          <>
                            <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Publishing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 size-5" />
                            Publish Draft Bill
                          </>
                        )}
                      </button>
                    )}
                    {showExportArButton && (
                      <button
                        className="flex w-full items-center justify-center rounded-lg bg-green-800 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setIsExportArModalOpen(true)}
                        disabled={isRunInProgress}
                      >
                        <FileDown className="mr-2 size-5" />
                        Export AR
                      </button>
                    )}
                    {showGeneratePdfButton && (
                      <button
                        className="flex w-full items-center justify-center rounded-lg bg-green-700 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setIsGeneratePdfModalOpen(true)}
                        disabled={isRunInProgress}
                      >
                        <FileDown className="mr-2 size-5" />
                        Generate PDF
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Generate PDF Modal */}
        {isGeneratePdfModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseGeneratePdfModal}
          >
            <motion.div
              className="w-full max-w-lg rounded-lg bg-white shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Generate PDF Bills</h3>
                  <button onClick={handleCloseGeneratePdfModal} className="rounded-full p-1 hover:bg-gray-100">
                    <X className="size-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  {/* Area Office - Optional */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Area Office</label>
                    <FormSelectModule
                      name="pdfAreaOffice"
                      value={pdfAreaOffice}
                      onChange={(e) => setPdfAreaOffice(e.target.value)}
                      searchable={true}
                      searchTerm={pdfAreaOfficeSearch}
                      onSearchChange={handlePdfAreaOfficeSearchChange}
                      onSearchClick={handlePdfAreaOfficeSearchClick}
                      loading={areaOfficesLoading}
                      options={
                        areaOffices?.map((office: any) => ({
                          value: office.id.toString(),
                          label: office.name,
                        })) || []
                      }
                    />
                  </div>

                  {/* Feeder - Optional */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Feeder</label>
                    <FormSelectModule
                      name="pdfFeeder"
                      value={pdfFeeder}
                      onChange={(e) => setPdfFeeder(e.target.value)}
                      searchable={true}
                      searchTerm={pdfFeederSearch}
                      onSearchChange={handlePdfFeederSearchChange}
                      onSearchClick={handlePdfFeederSearchClick}
                      loading={feedersLoading}
                      options={
                        feeders?.map((feeder: any) => ({
                          value: feeder.id.toString(),
                          label: feeder.name,
                        })) || []
                      }
                    />
                  </div>

                  {/* Distribution Substation - Optional */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Distribution Substation</label>
                    <FormSelectModule
                      name="pdfDistributionSubstation"
                      value={pdfDistributionSubstation}
                      onChange={(e) => setPdfDistributionSubstation(e.target.value)}
                      searchable={true}
                      searchTerm={pdfDistributionSubstationSearch}
                      onSearchChange={handlePdfDistributionSubstationSearchChange}
                      onSearchClick={handlePdfDistributionSubstationSearchClick}
                      loading={distributionSubstationsLoading}
                      options={
                        distributionSubstations?.map((substation: any) => ({
                          value: substation.id.toString(),
                          label: substation.name?.toString() || substation.dssCode || `Substation ${substation.id}`,
                        })) || []
                      }
                    />
                  </div>

                  {/* Group By */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Group By</label>
                    <FormSelectModule
                      name="pdfGroupBy"
                      value={pdfGroupBy}
                      onChange={(e) => setPdfGroupBy(e.target.value)}
                      options={[
                        { value: "0", label: "None" },
                        { value: "1", label: "Area Office" },
                        { value: "2", label: "Feeder" },
                        { value: "3", label: "Distribution Substation" },
                      ]}
                    />
                  </div>

                  {/* Max Bills Per File */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Max Bills Per File</label>
                    <input
                      type="number"
                      value={pdfMaxBillsPerFile}
                      onChange={(e) => setPdfMaxBillsPerFile(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      min="1"
                      max="10000"
                      placeholder="5000"
                    />
                  </div>

                  {/* Error Message */}
                  {runPdfGenerationError && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{runPdfGenerationError}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <ButtonModule
                    variant="outline"
                    size="md"
                    onClick={handleCloseGeneratePdfModal}
                    disabled={runPdfGenerationLoading}
                    className="flex-1"
                  >
                    Cancel
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="md"
                    onClick={handleGeneratePdf}
                    disabled={runPdfGenerationLoading}
                    className="flex-1"
                    icon={<FileDown />}
                  >
                    {runPdfGenerationLoading ? "Generating..." : "Generate PDF"}
                  </ButtonModule>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Export AR Modal */}
        {isExportArModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseExportArModal}
          >
            <motion.div
              className="w-full max-w-lg rounded-lg bg-white shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Export AR Report</h3>
                  <button onClick={handleCloseExportArModal} className="rounded-full p-1 hover:bg-gray-100">
                    <X className="size-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  {/* Area Office - Optional */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Area Office</label>
                    <FormSelectModule
                      name="exportArAreaOffice"
                      value={exportArAreaOffice}
                      onChange={(e) => setExportArAreaOffice(e.target.value)}
                      searchable={true}
                      searchTerm={exportArAreaOfficeSearch}
                      onSearchChange={handleExportArAreaOfficeSearchChange}
                      onSearchClick={handleExportArAreaOfficeSearchClick}
                      loading={areaOfficesLoading}
                      options={
                        areaOffices?.map((office: any) => ({
                          value: office.id.toString(),
                          label: office.name,
                        })) || []
                      }
                    />
                  </div>

                  {/* Feeder - Optional */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Feeder</label>
                    <FormSelectModule
                      name="exportArFeeder"
                      value={exportArFeeder}
                      onChange={(e) => setExportArFeeder(e.target.value)}
                      searchable={true}
                      searchTerm={exportArFeederSearch}
                      onSearchChange={handleExportArFeederSearchChange}
                      onSearchClick={handleExportArFeederSearchClick}
                      loading={feedersLoading}
                      options={
                        feeders?.map((feeder: any) => ({
                          value: feeder.id.toString(),
                          label: feeder.name,
                        })) || []
                      }
                    />
                  </div>

                  {/* Distribution Substation - Optional */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Distribution Substation</label>
                    <FormSelectModule
                      name="exportArDistributionSubstation"
                      value={exportArDistributionSubstation}
                      onChange={(e) => setExportArDistributionSubstation(e.target.value)}
                      searchable={true}
                      searchTerm={exportArDistributionSubstationSearch}
                      onSearchChange={handleExportArDistributionSubstationSearchChange}
                      onSearchClick={handleExportArDistributionSubstationSearchClick}
                      loading={distributionSubstationsLoading}
                      options={
                        distributionSubstations?.map((substation: any) => ({
                          value: substation.id.toString(),
                          label: substation.name?.toString() || substation.dssCode || `Substation ${substation.id}`,
                        })) || []
                      }
                    />
                  </div>

                  {/* Status Code - Optional */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Status Code</label>
                    <FormSelectModule
                      name="exportArStatusCode"
                      value={exportArStatusCode}
                      onChange={(e) => setExportArStatusCode(e.target.value)}
                      options={[
                        { value: "", label: "All Statuses" },
                        { value: "A", label: "Active" },
                        { value: "I", label: "Inactive" },
                        { value: "S", label: "Suspended" },
                      ]}
                    />
                  </div>

                  {/* Error Message */}
                  {exportArScheduleRunError && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{exportArScheduleRunError}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <ButtonModule
                    variant="outline"
                    size="md"
                    onClick={handleCloseExportArModal}
                    disabled={exportArScheduleRunLoading}
                    className="flex-1"
                  >
                    Cancel
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="md"
                    onClick={handleExportAr}
                    disabled={exportArScheduleRunLoading}
                    className="flex-1"
                    icon={<FileDown />}
                  >
                    {exportArScheduleRunLoading ? "Exporting..." : "Export AR"}
                  </ButtonModule>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </section>
    </>
  )
}

export default FileManagementPage
