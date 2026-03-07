"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { getJobTypeLabel, getJobTypeValue } from "lib/constants/jobTypes"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { api } from "lib/redux/authSlice"
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
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import {
  BillingScheduleRunItem,
  BillingScheduleRunStage,
  cancelBillingScheduleRun,
  clearBillingScheduleRunStatus,
  clearExportArScheduleRunStatus,
  clearExportScheduleRunARStatus,
  clearRunPdfGenerationStatus,
  exportArScheduleRun,
  ExportArScheduleRunRequest,
  exportScheduleRunAR,
  fetchBillingScheduleRun,
  fetchBillingScheduleRuns,
  publishBillingScheduleRun,
  runPdfGeneration,
  RunPdfGenerationRequest,
  startBillingScheduleRun,
} from "lib/redux/postpaidSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import * as XLSX from "xlsx"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import CsvUploadFailuresModal from "components/ui/Modal/CsvUploadFailuresModal"
import { CreateBillingScheduleRunModal } from "components/ui/Modal"
import DownloadScheduleRunPDFModal from "components/ui/Modal/DownloadScheduleRunPDFModal"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CloudUpload,
  Download,
  Eye,
  FileDown,
  FileIcon,
  FileText,
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

interface CsvJobByIdResponse {
  isSuccess: boolean
  message: string
  data: CsvJob
}

interface CsvJobsLookupResponse {
  isSuccess: boolean
  message: string
  data: CsvJob[]
}

interface CsvJobFailuresResponse {
  isSuccess: boolean
  message: string
  data: Array<{
    id: number
    lineNumber: number
    message: string
    rawLine: string
    createdAtUtc?: string
  }>
  totalCount?: number
  totalPages?: number
  currentPage?: number
  pageSize?: number
  hasNext?: boolean
  hasPrevious?: boolean
}

interface TrackScheduleCustomersRequest {
  fileId: number
}

interface TrackScheduleCustomersResponse {
  isSuccess: boolean
  message: string
  data: CsvJob | { id: number; status?: number; [key: string]: any }
}

const TRACKING_TERMINAL_STATUSES = new Set([3, 4, 5])
const SCHEDULE_CUSTOMER_TRACKING_BULK_INSERT_TYPE = "schedule-customer-tracking"
const SCHEDULE_CUSTOMER_TRACKING_JOB_TYPE = getJobTypeValue("Schedule Customer Tracking Import")
const CSV_JOBS_POLL_INTERVAL_MS = 30000
const MANUAL_TRACKING_JOB_STORAGE_PREFIX = "billing:manual-track-job"
const MANUAL_TRACK_POLL_INITIAL_DELAY_MS = 3000
const MANUAL_TRACK_POLL_INTERVAL_MS = 8000
const MANUAL_TRACK_FAILURES_PAGE_SIZE = 10
const METER_READING_JOB_TYPE = getJobTypeValue("Meter Reading Import")
const FEEDER_ENERGY_CAP_JOB_TYPE = getJobTypeValue("Feeder Energy Cap Import")
const CUSTOMER_TARIFF_CHANGE_JOB_TYPE = getJobTypeValue("Customer Tariff Change")
const CUSTOMER_STATUS_CHANGE_JOB_TYPE = getJobTypeValue("Customer Status Change")
const CUSTOMER_STORED_AVERAGE_JOB_TYPE = getJobTypeValue("Customer Stored Average Update")
const CUSTOMER_SRDT_JOB_TYPE = getJobTypeValue("Customer SR/DT Update")
const BILL_ADJUSTMENT_JOB_TYPE = getJobTypeValue("Bill Adjustment")
const ESTIMATED_CONSUMPTION_JOB_TYPE = getJobTypeValue("Postpaid Estimated Consumption Import")
const METER_CHANGE_OUT_JOB_TYPE = getJobTypeValue("Meter Change-Out")

// Hook to get latest jobs for all upload types
const useLatestJobs = () => {
  const dispatch = useAppDispatch()
  const [latestJobs, setLatestJobs] = useState<Record<number, CsvJob | null>>({})
  const [isLoading, setIsLoading] = useState(false)
  const hasLoadedOnceRef = useRef(false)

  const fetchLatestJobs = useCallback(
    async (options?: { silent?: boolean }) => {
      const shouldShowLoader = options?.silent !== true && !hasLoadedOnceRef.current
      if (shouldShowLoader) {
        setIsLoading(true)
      }

      try {
        const jobTypes = [
          METER_READING_JOB_TYPE,
          FEEDER_ENERGY_CAP_JOB_TYPE,
          CUSTOMER_TARIFF_CHANGE_JOB_TYPE,
          CUSTOMER_STATUS_CHANGE_JOB_TYPE,
          CUSTOMER_STORED_AVERAGE_JOB_TYPE,
          CUSTOMER_SRDT_JOB_TYPE,
          BILL_ADJUSTMENT_JOB_TYPE,
          ESTIMATED_CONSUMPTION_JOB_TYPE,
          METER_CHANGE_OUT_JOB_TYPE,
        ] // Specific job types for billing generate details
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
        hasLoadedOnceRef.current = true
      } catch (error) {
        console.error("Failed to fetch latest jobs:", error)
      } finally {
        if (shouldShowLoader) {
          setIsLoading(false)
        }
      }
    },
    [dispatch]
  )

  useEffect(() => {
    fetchLatestJobs({ silent: false })
  }, [fetchLatestJobs])

  // Poll all job types so cards always show the latest result regardless of status.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetchLatestJobs({ silent: true })
      } catch (error) {
        console.error("Failed to refresh latest jobs:", error)
      }
    }, CSV_JOBS_POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [fetchLatestJobs])

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
  const [statusFilter, setStatusFilter] = useState<string>("")

  const fetchJobs = useCallback(async () => {
    if (!jobType) return

    const params = {
      PageNumber: currentPage,
      PageSize: 10,
      JobType: jobType,
      Status: statusFilter ? Number(statusFilter) : undefined,
    }

    try {
      await dispatch(fetchCsvJobs(params)).unwrap()
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    }
  }, [dispatch, jobType, currentPage, statusFilter])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Poll for updates every 30 seconds if there are running jobs
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
          }
          await dispatch(fetchCsvJobs(params)).unwrap()
        } catch (error) {
          console.error("Failed to fetch job updates:", error)
        }
      }, CSV_JOBS_POLL_INTERVAL_MS)

      return () => clearInterval(interval)
    }
  }, [csvJobs, jobType, currentPage, statusFilter, dispatch])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
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
    statusFilter,
    handlePageChange,
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

const getRunStateTone = (state: number | undefined) => {
  switch (state) {
    case 1:
      return {
        label: "Running",
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        nodeClass: "border-amber-300 bg-amber-50 text-amber-700",
      }
    case 2:
      return {
        label: "Completed",
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        nodeClass: "border-emerald-300 bg-emerald-50 text-emerald-700",
      }
    case 3:
      return {
        label: "Failed",
        badgeClass: "border-red-200 bg-red-50 text-red-700",
        nodeClass: "border-red-300 bg-red-50 text-red-700",
      }
    case 0:
    default:
      return {
        label: "Pending",
        badgeClass: "border-gray-200 bg-gray-50 text-gray-600",
        nodeClass: "border-gray-300 bg-gray-50 text-gray-500",
      }
  }
}

const getRunStageLabel = (stage: number) => {
  switch (stage) {
    case 1:
      return "Bill Generation"
    case 2:
      return "Publish"
    case 3:
      return "AR Export"
    case 4:
      return "PDF Generation"
    default:
      return `Stage ${stage}`
  }
}

const getRunStageIcon = (stage: number) => {
  switch (stage) {
    case 1:
      return FileText
    case 2:
      return Upload
    case 3:
      return FileDown
    case 4:
      return FileIcon
    default:
      return FileText
  }
}

const getCustomStageLabelByIndex = (stageIndex: number) => {
  switch (stageIndex) {
    case 0:
      return "Recompute"
    case 1:
      return "AR Export"
    case 2:
      return "PDF Generation"
    default:
      return `Stage ${stageIndex + 1}`
  }
}

const getCustomStageIconByIndex = (stageIndex: number) => {
  switch (stageIndex) {
    case 0:
      return RefreshCw
    case 1:
      return FileDown
    case 2:
      return FileIcon
    default:
      return FileText
  }
}

const parseUtcDate = (value: string | null | undefined) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatUtcDateTime = (value: string | null | undefined) => {
  const parsed = parseUtcDate(value)
  if (!parsed) return null
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatStageDuration = (startedAtUtc: string | null | undefined, completedAtUtc: string | null | undefined) => {
  const startedDate = parseUtcDate(startedAtUtc)
  const completedDate = parseUtcDate(completedAtUtc)

  if (!startedDate || !completedDate) {
    return null
  }

  const diffMs = Math.max(0, completedDate.getTime() - startedDate.getTime())
  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

const getCsvJobStatusLabel = (status: number | null | undefined) => {
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

const getCsvJobStatusTone = (status: number | null | undefined) => {
  switch (status) {
    case 1:
      return "border-yellow-200 bg-yellow-100 text-yellow-800"
    case 2:
      return "border-blue-200 bg-blue-100 text-blue-800"
    case 3:
      return "border-emerald-200 bg-emerald-100 text-emerald-800"
    case 4:
      return "border-red-200 bg-red-100 text-red-800"
    case 5:
      return "border-orange-200 bg-orange-100 text-orange-800"
    default:
      return "border-gray-200 bg-gray-100 text-gray-700"
  }
}

// Component to display job status with progress
const JobStatusIndicator = ({ job, isLoading }: { job: CsvJob | null; isLoading: boolean }) => {
  if (!job) {
    return (
      <div className="rounded border border-dashed border-gray-200 bg-white p-2 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5">
          {isLoading ? <Loader2 className="size-3 animate-spin" /> : null}
          <span className={isLoading ? "" : "text-gray-400"}>Start</span>
        </div>
      </div>
    )
  }

  const getStatusTone = (status: number) => {
    switch (status) {
      case 1:
        return {
          chipClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
          barClass: "bg-yellow-500",
        }
      case 2:
        return {
          chipClass: "bg-blue-100 text-blue-800 border-blue-200",
          barClass: "bg-blue-500",
        }
      case 3:
        return {
          chipClass: "bg-green-100 text-green-800 border-green-200",
          barClass: "bg-green-500",
        }
      case 4:
        return {
          chipClass: "bg-red-100 text-red-800 border-red-200",
          barClass: "bg-red-500",
        }
      case 5:
        return {
          chipClass: "bg-orange-100 text-orange-800 border-orange-200",
          barClass: "bg-orange-500",
        }
      default:
        return {
          chipClass: "bg-gray-100 text-gray-800 border-gray-200",
          barClass: "bg-gray-500",
        }
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

  const progressPercentage = job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0
  const safeProgress = Math.max(0, Math.min(100, progressPercentage))
  const statusTone = getStatusTone(job.status)
  const requestDate = job.requestedAtUtc ? new Date(job.requestedAtUtc) : null
  const hasValidRequestDate = requestDate && !Number.isNaN(requestDate.getTime())
  const formattedRequestDate = hasValidRequestDate
    ? requestDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "No date"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusTone.chipClass}`}>
            {getStatusLabel(job.status)}
          </span>
          {isLoading || job.status === 1 || job.status === 2 ? (
            <RefreshCw className="size-3 animate-spin text-blue-500" />
          ) : null}
        </div>
        <span className="text-[11px] font-medium text-gray-600">{safeProgress}%</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ease-in-out ${statusTone.barClass}`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-[11px]">
        <div className="rounded bg-white px-1.5 py-1 text-center">
          <div className="font-medium text-blue-600">{job.processedRows}</div>
          <div className="text-[10px] text-gray-500">Processed</div>
        </div>
        <div className="rounded bg-white px-1.5 py-1 text-center">
          <div className="font-medium text-green-600">{job.succeededRows}</div>
          <div className="text-[10px] text-gray-500">Succeeded</div>
        </div>
        <div className="rounded bg-white px-1.5 py-1 text-center">
          <div className="font-medium text-red-600">{job.failedRows}</div>
          <div className="text-[10px] text-gray-500">Failed</div>
        </div>
        <div className="rounded bg-white px-1.5 py-1 text-center">
          <div className="font-medium text-gray-600">{job.totalRows}</div>
          <div className="text-[10px] text-gray-500">Total</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="size-3 text-gray-400" />
          <span>{formattedRequestDate}</span>
        </div>
        {job.requestedByUser?.fullName ? (
          <div className="max-w-[60%] truncate">By {job.requestedByUser.fullName}</div>
        ) : null}
      </div>
    </div>
  )
}

// Job Type Uploads Table Component
const JobTypeUploadsTable = ({ jobType }: { jobType: number | null }) => {
  const { jobs, loading, error, pagination, currentPage, statusFilter, handlePageChange, handleStatusFilter, refetch } =
    useJobTypeUploads(jobType)

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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Table Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Recent Uploads - {getJobTypeLabel(jobType)}</h3>
            {pagination && (
              <p className="text-sm text-gray-600">
                Showing {jobs.length} of {pagination.totalCount} uploads
              </p>
            )}
          </div>
          <ButtonModule
            variant="outline"
            onClick={refetch}
            disabled={loading}
            size="sm"
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </ButtonModule>
        </div>

        {/* Filters */}
        <div className="mt-3 flex justify-end">
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

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      {/* Table */}
      <div className="max-h-[60vh] w-full overflow-x-auto overflow-y-hidden">
        <div className="min-w-[980px]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  File
                </th>
                <th className="border-b border-gray-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Status
                </th>
                <th className="border-b border-gray-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Requested
                </th>
                <th className="border-b border-gray-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Progress
                </th>
                <th className="border-b border-gray-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Results
                </th>
                <th className="border-b border-gray-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border-b border-gray-200 p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-500">Loading uploads...</span>
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border-b border-gray-200 p-8 text-center">
                    <div className="text-gray-500">
                      <FileIcon className="mx-auto mb-2 size-10 text-gray-300" />
                      <p className="text-sm">No uploads found for this type</p>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job: CsvJob) => {
                  const totalRows = typeof job.totalRows === "number" ? job.totalRows : 0
                  const succeededRows = typeof job.succeededRows === "number" ? job.succeededRows : 0
                  const processedRows = typeof job.processedRows === "number" ? job.processedRows : 0
                  const failedRows = typeof job.failedRows === "number" ? job.failedRows : 0
                  const progressPercentage = totalRows > 0 ? Math.round((processedRows / totalRows) * 100) : 0
                  const safeProgress = Math.max(0, Math.min(100, progressPercentage))

                  return (
                    <tr key={job.id} className="border-b border-gray-100 align-top hover:bg-gray-50/80">
                      <td className="border-b border-gray-100 p-3 text-sm">
                        <div className="max-w-80">
                          <p className="truncate font-medium text-gray-900" title={job.fileName}>
                            {job.fileName}
                          </p>
                          <p
                            className="mt-0.5 text-xs text-gray-500"
                            title={job.requestedByUser?.fullName || "Unknown"}
                          >
                            By {job.requestedByUser?.fullName || "Unknown"}
                          </p>
                        </div>
                      </td>
                      <td className="border-b border-gray-100 p-3 text-sm">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {getStatusLabel(job.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap border-b border-gray-100 p-3 text-sm text-gray-700">
                        {formatUtcDateTime(job.requestedAtUtc) || new Date(job.requestedAtUtc).toLocaleString()}
                      </td>
                      <td className="border-b border-gray-100 p-3 text-sm">
                        <div className="min-w-40">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Processed</span>
                            <span className="text-xs font-medium text-gray-700">{safeProgress}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${safeProgress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-gray-100 p-3 text-sm">
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <span className="rounded bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                            Processed: {processedRows.toLocaleString()}
                          </span>
                          <span className="rounded bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                            Succeeded: {succeededRows.toLocaleString()}
                          </span>
                          <span className="rounded bg-red-50 px-2 py-0.5 font-medium text-red-700">
                            Failed: {failedRows.toLocaleString()}
                          </span>
                          <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                            Total: {totalRows.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="border-b border-gray-100 p-3 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {job.failedRows > 0 && (
                            <ButtonModule
                              variant="outline"
                              size="sm"
                              icon={<VscEye />}
                              onClick={() => handleViewFailures(job)}
                              className="whitespace-nowrap border-amber-300 bg-white text-amber-700 hover:bg-amber-50"
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
                              className="whitespace-nowrap border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                              disabled={downloadCsvLoading}
                            >
                              {downloadCsvLoading ? "Downloading..." : "Download"}
                            </ButtonModule>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MdOutlineArrowBackIosNew className="size-4" />
              </button>
              {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                const pageNumber = index + 1
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      currentPage === pageNumber
                        ? "border-[#004B23] bg-[#e9f5ef] text-[#004B23]"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
    startBillingScheduleRunMessage,
    cancelBillingScheduleRunLoading,
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
    exportScheduleRunARLoading,
    exportScheduleRunARError,
    runPdfGenerationLoading,
    runPdfGenerationSuccess,
    runPdfGenerationError,
    runPdfGenerationMessage,
    runPdfGenerationData,
    billingScheduleRuns,
    billingScheduleRunsLoading,
  } = useAppSelector((state: any) => state.postpaidBilling)

  // Get latest jobs for all upload types
  const { latestJobs, isLoading: jobsLoading, refetch: refetchLatestJobs } = useLatestJobs()
  const isLatestRunStageRunning =
    billingScheduleRun?.latestRunProgress?.stages?.some((stage: BillingScheduleRunStage) => stage.state === 1) === true

  // Upload type options with enhanced metadata
  const uploadTypeOptions: UploadTypeOption[] = [
    {
      name: "Customer Meter Reading",
      value: METER_READING_JOB_TYPE,
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
      value: CUSTOMER_STORED_AVERAGE_JOB_TYPE,
      description: "Update stored average consumption values for customers",
      requiredColumns: ["CustomerAccountNo", "TariffCode"],
      sampleData: ["CustomerAccountNo,TariffCode", "CUST001,R1", "CUST002,R2", "CUST003,R3"],
    },
    {
      name: "Customer-DT Reallignment",
      value: CUSTOMER_SRDT_JOB_TYPE,
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
      value: ESTIMATED_CONSUMPTION_JOB_TYPE,
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
      value: CUSTOMER_STATUS_CHANGE_JOB_TYPE,
      description: "Update customer status codes (Active, Inactive, Disconnected, etc.)",
      requiredColumns: ["CustomerAccountNo", "StatusCodeChange"],
      sampleData: ["CustomerAccountNo,StatusCodeChange", "CUST001,INACTIVE", "CUST002,ACTIVE", "CUST003,DISCONNECTED"],
    },
    {
      name: "Customer Tariff Change",
      value: CUSTOMER_TARIFF_CHANGE_JOB_TYPE,
      description: "Change tariff assignments for multiple customers",
      requiredColumns: ["CustomerAccountNo", "TariffCode"],
      sampleData: ["CustomerAccountNo,TariffCode", "CUST001,R2", "CUST002,R3", "CUST003,R1"],
    },
    {
      name: "Meter Change Out",
      value: METER_CHANGE_OUT_JOB_TYPE,
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
      value: FEEDER_ENERGY_CAP_JOB_TYPE,
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
      value: BILL_ADJUSTMENT_JOB_TYPE,
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
      case METER_READING_JOB_TYPE:
        return "meter-readings-account"
      case FEEDER_ENERGY_CAP_JOB_TYPE:
        return "feeder-energy-cap"
      case CUSTOMER_TARIFF_CHANGE_JOB_TYPE:
        return "customer-tariff-change"
      case CUSTOMER_STATUS_CHANGE_JOB_TYPE:
        return "customer-status-change"
      case CUSTOMER_STORED_AVERAGE_JOB_TYPE:
        return "customer-stored-average-update"
      case CUSTOMER_SRDT_JOB_TYPE:
        return "customer-srdt-update"
      case BILL_ADJUSTMENT_JOB_TYPE:
        return "bill-adjustment"
      case ESTIMATED_CONSUMPTION_JOB_TYPE:
        return "customer-estimated-consumption"
      case METER_CHANGE_OUT_JOB_TYPE:
        return "meter-changeout"
      default:
        return "meter-readings-account"
    }
  }

  // Helper function to get purpose based on upload type
  const getPurpose = (uploadType: number | string | null): string => {
    switch (uploadType) {
      case METER_READING_JOB_TYPE:
        return "postpaid-meter-readings-account-bulk"
      case FEEDER_ENERGY_CAP_JOB_TYPE:
        return "feeder-energy-caps-bulk"
      case CUSTOMER_TARIFF_CHANGE_JOB_TYPE:
        return "customer-tariff-change-bulk"
      case CUSTOMER_STATUS_CHANGE_JOB_TYPE:
        return "customer-status-change-bulk"
      case CUSTOMER_STORED_AVERAGE_JOB_TYPE:
        return "customer-stored-average-update-bulk"
      case CUSTOMER_SRDT_JOB_TYPE:
        return "customer-srdt-update-bulk"
      case BILL_ADJUSTMENT_JOB_TYPE:
        return "postpaid-bill-adjustments-bulk"
      case ESTIMATED_CONSUMPTION_JOB_TYPE:
        return "customer-estimated-consumption-bulk"
      case METER_CHANGE_OUT_JOB_TYPE:
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
  const [manualTrackFile, setManualTrackFile] = useState<File | null>(null)
  const [manualTrackJob, setManualTrackJob] = useState<CsvJob | null>(null)
  const [manualTrackJobId, setManualTrackJobId] = useState<number | null>(null)
  const [manualTrackLoading, setManualTrackLoading] = useState(false)
  const [manualTrackError, setManualTrackError] = useState<string | null>(null)
  const [manualTrackFailureCount, setManualTrackFailureCount] = useState<number | null>(null)
  const [manualTrackLastUpdatedAt, setManualTrackLastUpdatedAt] = useState<string | null>(null)
  const [manualTrackRecoveryChecking, setManualTrackRecoveryChecking] = useState(false)
  const [manualTrackFailures, setManualTrackFailures] = useState<CsvJobFailuresResponse["data"]>([])
  const [manualTrackFailuresLoading, setManualTrackFailuresLoading] = useState(false)
  const [manualTrackFailuresError, setManualTrackFailuresError] = useState<string | null>(null)
  const [manualTrackFailuresPage, setManualTrackFailuresPage] = useState(1)
  const [manualTrackFailuresTotalPages, setManualTrackFailuresTotalPages] = useState(1)
  const [manualTrackFailuresTotalCount, setManualTrackFailuresTotalCount] = useState(0)
  const [manualTrackFailuresHasNext, setManualTrackFailuresHasNext] = useState(false)
  const [manualTrackFailuresHasPrevious, setManualTrackFailuresHasPrevious] = useState(false)
  const [isManualTrackFailuresVisible, setIsManualTrackFailuresVisible] = useState(false)

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
    let isCancelled = false
    const parsedId = scheduleId ? parseInt(scheduleId) : NaN
    if (isNaN(parsedId)) {
      setIsRunStatusChecking(false)
      return
    }

    setIsRunStatusChecking(true)
    dispatch(clearBillingScheduleRunStatus())
    Promise.allSettled([
      dispatch(fetchBillingScheduleRun(parsedId)),
      dispatch(
        fetchBillingScheduleRuns({
          scheduleId: parsedId,
          pageNumber: 1,
          pageSize: 20,
        })
      ),
    ]).finally(() => {
      if (!isCancelled) {
        setIsRunStatusChecking(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [dispatch, scheduleId])

  // Show action buttons when billing schedule run data is available and respective flags are true
  const showPublishButton = billingScheduleRun?.latestRunProgress?.showPublishButton === true
  const showGeneratePdfButton = billingScheduleRun?.latestRunProgress?.showGeneratePdfButton === true

  // Generate PDF modal state
  const [isGeneratePdfModalOpen, setIsGeneratePdfModalOpen] = useState(false)
  const [pdfGroupBy, setPdfGroupBy] = useState("")
  const [pdfGroupByError, setPdfGroupByError] = useState("")
  const [pdfMaxBillsPerFile, setPdfMaxBillsPerFile] = useState("5000")

  // Export AR modal state
  const [isExportArModalOpen, setIsExportArModalOpen] = useState(false)
  const [isArExportDownloadMode, setIsArExportDownloadMode] = useState(false)
  const [exportArAreaOffice, setExportArAreaOffice] = useState("")
  const [exportArFeeder, setExportArFeeder] = useState("")
  const [exportArDistributionSubstation, setExportArDistributionSubstation] = useState("")
  const [exportArStatusCode, setExportArStatusCode] = useState("")
  const [exportArAreaOfficeSearch, setExportArAreaOfficeSearch] = useState("")
  const [exportArFeederSearch, setExportArFeederSearch] = useState("")
  const [exportArDistributionSubstationSearch, setExportArDistributionSubstationSearch] = useState("")

  const [scheduleType, setScheduleType] = useState<string>("")
  const [isRunStatusChecking, setIsRunStatusChecking] = useState(true)
  const [isRunStateSyncing, setIsRunStateSyncing] = useState(false)
  const [isRunDetailsDrawerOpen, setIsRunDetailsDrawerOpen] = useState(false)
  const [isRunDrawerRefreshing, setIsRunDrawerRefreshing] = useState(false)
  const [isCancelRunConfirmOpen, setIsCancelRunConfirmOpen] = useState(false)
  const [downloadPdfRunId, setDownloadPdfRunId] = useState<number | null>(null)
  const [expandedRunStages, setExpandedRunStages] = useState<Record<number, boolean>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const manualTrackFileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const manualTrackTerminalHandledRef = useRef<number | null>(null)
  const manualTrackRecoveryRunRef = useRef<number | null>(null)
  const isManualTrackMountedRef = useRef(true)

  // Reset states on unmount
  useEffect(() => {
    isManualTrackMountedRef.current = true
    return () => {
      isManualTrackMountedRef.current = false
      dispatch(resetFileManagementState())
      dispatch({ type: "fileManagement/resetBillingBulkUploadState" })
    }
  }, [dispatch])

  useEffect(() => {
    if (!isRunDetailsDrawerOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isRunDetailsDrawerOpen])

  useEffect(() => {
    const stages = billingScheduleRun?.latestRunProgress?.stages

    if (!stages || stages.length === 0) {
      setExpandedRunStages({})
      return
    }

    setExpandedRunStages((prev) => {
      const existingStages = Object.keys(prev).map((key) => Number(key))
      const allStagesAlreadyTracked =
        existingStages.length > 0 && stages.every((stage: { stage: number }) => existingStages.includes(stage.stage))

      if (allStagesAlreadyTracked) {
        return prev
      }

      return stages.reduce(
        (acc: { [x: string]: boolean }, stage: { stage: string | number }, index: number) => {
          acc[stage.stage] = index === 0
          return acc
        },
        {} as Record<number, boolean>
      )
    })
  }, [billingScheduleRun?.latestRunProgress?.runId, billingScheduleRun?.latestRunProgress?.stages])

  // Fetch dropdown options when any modal that needs them opens
  useEffect(() => {
    if (showCreateRunModal || isExportArModalOpen) {
      dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 1000 }))
      dispatch(fetchFeeders({ pageNumber: 1, pageSize: 1000 }))
      dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 1000 }))
    }
    if (showCreateRunModal) {
      dispatch(fetchBillingPeriods({ pageNumber: 1, pageSize: 1000 }))
    }
  }, [showCreateRunModal, isExportArModalOpen, dispatch])

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

      if (!pdfGroupBy) {
        setPdfGroupByError("Group By is required for batch print.")
        return
      }

      setPdfGroupByError("")

      const requestData: RunPdfGenerationRequest = {
        groupBy: parseInt(pdfGroupBy),
        maxBillsPerFile: parseInt(pdfMaxBillsPerFile) || 5000,
      }

      const result = await dispatch(runPdfGeneration({ runId, requestData })).unwrap()

      notify("success", "PDF Generation Started", {
        description: result.message || "PDF generation job has been created successfully",
      })

      setIsGeneratePdfModalOpen(false)
      setIsRunStateSyncing(true)

      // Refresh the billing schedule run data and jobs so UI updates
      const parsedId = scheduleId ? parseInt(scheduleId) : NaN
      if (!isNaN(parsedId)) {
        dispatch(fetchBillingScheduleRun(parsedId))
      }
      refetchLatestJobs()
    } catch (error: any) {
      setIsRunStateSyncing(false)
      notify("error", "Failed to Generate PDF", {
        description: error.message || error || "An error occurred while creating the PDF generation job",
      })
    }
  }, [dispatch, billingScheduleRun, pdfGroupBy, pdfMaxBillsPerFile, scheduleId, refetchLatestJobs])

  const handleCloseGeneratePdfModal = () => {
    setIsGeneratePdfModalOpen(false)
    dispatch(clearRunPdfGenerationStatus())
    setPdfGroupBy("")
    setPdfGroupByError("")
    setPdfMaxBillsPerFile("5000")
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
        isScoped: true,
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
      setIsRunStateSyncing(true)

      // Refresh the billing schedule run data and jobs so UI updates
      const parsedId = scheduleId ? parseInt(scheduleId) : NaN
      if (!isNaN(parsedId)) {
        dispatch(fetchBillingScheduleRun(parsedId))
      }
      refetchLatestJobs()
    } catch (error: any) {
      setIsRunStateSyncing(false)
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

  // Run AR generation directly (no modal) with fixed payload
  const handleRunArGeneration = useCallback(async () => {
    try {
      const runId = billingScheduleRun?.latestRunProgress?.runId

      if (!runId) {
        notify("error", "No Run Available", {
          description: "No billing schedule run is available to run AR generation",
        })
        return
      }

      const result = await dispatch(
        exportArScheduleRun({
          runId,
          requestData: {
            isScoped: true,
          },
        })
      ).unwrap()

      notify("success", "AR Generation Started", {
        description: result.message || "AR generation job has been created successfully",
      })

      setIsRunStateSyncing(true)

      const parsedId = scheduleId ? parseInt(scheduleId) : NaN
      if (!isNaN(parsedId)) {
        dispatch(fetchBillingScheduleRun(parsedId))
      }
      refetchLatestJobs()
    } catch (error: any) {
      setIsRunStateSyncing(false)
      notify("error", "Failed to Run AR Generation", {
        description: error.message || "An error occurred while creating the AR generation job",
      })
    }
  }, [dispatch, billingScheduleRun, scheduleId, refetchLatestJobs])

  // Handle Export AR CSV download for schedule run
  const handleExportArCsv = useCallback(async () => {
    try {
      const runId = billingScheduleRun?.latestRunProgress?.runId

      if (!runId) {
        notify("error", "No Run Available", {
          description: "No billing schedule run is available to export AR",
        })
        return
      }

      const result = await dispatch(
        exportScheduleRunAR({
          runId,
          isScoped: false,
          ...(exportArStatusCode && { statusCode: exportArStatusCode }),
          ...(exportArAreaOffice && { areaOfficeId: parseInt(exportArAreaOffice) }),
          ...(exportArFeeder && { feederId: parseInt(exportArFeeder) }),
          ...(exportArDistributionSubstation && { distributionSubstationId: parseInt(exportArDistributionSubstation) }),
        })
      ).unwrap()

      notify("success", "AR Exported", {
        description: result.message || "AR CSV exported successfully",
      })

      setIsExportArModalOpen(false)
    } catch (error: any) {
      notify("error", "Failed to Export AR", {
        description: error.message || "An error occurred while exporting AR CSV",
      })
    }
  }, [
    dispatch,
    billingScheduleRun,
    exportArStatusCode,
    exportArAreaOffice,
    exportArFeeder,
    exportArDistributionSubstation,
  ])

  const handleCloseExportArModal = () => {
    setIsExportArModalOpen(false)
    setIsArExportDownloadMode(false)
    dispatch(clearExportArScheduleRunStatus())
    dispatch(clearExportScheduleRunARStatus())
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
  const calculateChecksum = useCallback(async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }, [])

  const buildFileMetadataChecksum = useCallback(async (file: File): Promise<string> => {
    const metadataFingerprint = `${file.name}:${file.size}:${file.type}:${file.lastModified}`
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(metadataFingerprint))
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }, [])

  const uploadFileToSignedUrl = useCallback((uploadUrl: string, file: File, contentType?: string) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
          return
        }
        reject(new Error(`Upload failed with status ${xhr.status}`))
      })

      xhr.addEventListener("error", () => reject(new Error("Failed to upload file")))
      xhr.open("PUT", uploadUrl)
      if (contentType) {
        xhr.setRequestHeader("Content-Type", contentType)
      }
      xhr.send(file)
    })
  }, [])

  const getManualTrackingStorageKey = useCallback((runId: number) => {
    return `${MANUAL_TRACKING_JOB_STORAGE_PREFIX}:${runId}`
  }, [])

  const readPersistedManualTrackingJobId = useCallback(
    (runId: number): number | null => {
      if (typeof window === "undefined") {
        return null
      }

      const key = getManualTrackingStorageKey(runId)
      const value = window.localStorage.getItem(key)
      if (!value) {
        return null
      }

      const parsed = Number.parseInt(value, 10)
      return Number.isNaN(parsed) ? null : parsed
    },
    [getManualTrackingStorageKey]
  )

  const persistManualTrackingJobId = useCallback(
    (runId: number, jobId: number) => {
      if (typeof window === "undefined") {
        return
      }
      window.localStorage.setItem(getManualTrackingStorageKey(runId), jobId.toString())
    },
    [getManualTrackingStorageKey]
  )

  const clearPersistedManualTrackingJobId = useCallback(
    (runId: number) => {
      if (typeof window === "undefined") {
        return
      }
      window.localStorage.removeItem(getManualTrackingStorageKey(runId))
    },
    [getManualTrackingStorageKey]
  )

  const extractRunIdFromCsvJobPayload = useCallback((payloadJson: string | null | undefined): number | null => {
    if (!payloadJson) {
      return null
    }

    const regexMatches = payloadJson.match(/"(?:runId|postpaidBillingScheduleRunId)"\s*:\s*(\d+)/i)
    if (regexMatches?.[1]) {
      const parsed = Number.parseInt(regexMatches[1], 10)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }

    try {
      const payload = JSON.parse(payloadJson)
      const stack: any[] = [payload]

      while (stack.length > 0) {
        const current = stack.pop()
        if (!current || typeof current !== "object") {
          continue
        }

        for (const [key, value] of Object.entries(current)) {
          const normalized = key.toLowerCase()
          if ((normalized === "runid" || normalized === "postpaidbillingschedulerunid") && typeof value === "number") {
            return value
          }

          if (value && typeof value === "object") {
            stack.push(value)
          }
        }
      }
    } catch {
      return null
    }

    return null
  }, [])

  const isScheduleCustomerTrackingJob = useCallback((job: CsvJob) => {
    if (job.jobType === SCHEDULE_CUSTOMER_TRACKING_JOB_TYPE) {
      return true
    }

    const payload = job.payloadJson || ""
    if (!payload) {
      return false
    }

    return payload.includes(SCHEDULE_CUSTOMER_TRACKING_BULK_INSERT_TYPE)
  }, [])

  const fetchLatestActiveManualTrackingJob = useCallback(
    async (runId: number): Promise<CsvJob | null> => {
      const endpoint = buildApiUrl(API_ENDPOINTS.FILE_MANAGEMENT.CSV_JOBS)

      const fetchByStatus = async (status: number) => {
        const query = new URLSearchParams({
          PageNumber: "1",
          PageSize: "50",
          Status: status.toString(),
          JobType: SCHEDULE_CUSTOMER_TRACKING_JOB_TYPE.toString(),
        })

        const response = await api.get<CsvJobsLookupResponse>(`${endpoint}?${query.toString()}`)
        if (!response.data?.isSuccess || !Array.isArray(response.data.data)) {
          return [] as CsvJob[]
        }
        return response.data.data
      }

      const [queuedJobs, runningJobs] = await Promise.all([fetchByStatus(1), fetchByStatus(2)])
      const activeJobs = [...queuedJobs, ...runningJobs]

      const matchingRunJob = activeJobs.find(
        (job) => isScheduleCustomerTrackingJob(job) && extractRunIdFromCsvJobPayload(job.payloadJson) === runId
      )
      if (matchingRunJob) {
        return matchingRunJob
      }

      return null
    },
    [extractRunIdFromCsvJobPayload, isScheduleCustomerTrackingJob]
  )

  const resetManualTrackFailuresView = useCallback(() => {
    setManualTrackFailures([])
    setManualTrackFailuresLoading(false)
    setManualTrackFailuresError(null)
    setManualTrackFailuresPage(1)
    setManualTrackFailuresTotalPages(1)
    setManualTrackFailuresTotalCount(0)
    setManualTrackFailuresHasNext(false)
    setManualTrackFailuresHasPrevious(false)
    setIsManualTrackFailuresVisible(false)
  }, [])

  const handleManualTrackFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0] ?? null
      setManualTrackFile(selectedFile)
      setManualTrackError(null)
      resetManualTrackFailuresView()
    },
    [resetManualTrackFailuresView]
  )

  const fetchCsvJobById = useCallback(async (jobId: number): Promise<CsvJob> => {
    const endpoint = API_ENDPOINTS.FILE_MANAGEMENT.CSV_JOB_BY_ID.replace("{id}", jobId.toString())
    const response = await api.get<CsvJobByIdResponse>(buildApiUrl(endpoint))

    if (!response.data?.isSuccess || !response.data?.data) {
      throw new Error(response.data?.message || "Failed to fetch tracking job status")
    }

    return response.data.data
  }, [])

  const fetchCsvFailuresCount = useCallback(async (jobId: number) => {
    const endpoint = API_ENDPOINTS.FILE_MANAGEMENT.CSV_UPLOAD_FAILURES.replace("{id}", jobId.toString())
    const response = await api.get<CsvJobFailuresResponse>(`${buildApiUrl(endpoint)}?PageNumber=1&PageSize=1`)

    if (!response.data?.isSuccess) {
      return null
    }

    if (typeof response.data.totalCount === "number") {
      return response.data.totalCount
    }

    return Array.isArray(response.data.data) ? response.data.data.length : null
  }, [])

  const fetchCsvFailuresPage = useCallback(async (jobId: number, pageNumber: number, pageSize: number) => {
    const endpoint = API_ENDPOINTS.FILE_MANAGEMENT.CSV_UPLOAD_FAILURES.replace("{id}", jobId.toString())
    const response = await api.get<CsvJobFailuresResponse>(
      `${buildApiUrl(endpoint)}?PageNumber=${pageNumber}&PageSize=${pageSize}`
    )

    if (!response.data?.isSuccess) {
      throw new Error(response.data?.message || "Failed to load failure rows")
    }

    return {
      rows: Array.isArray(response.data.data) ? response.data.data : [],
      totalCount: typeof response.data.totalCount === "number" ? response.data.totalCount : 0,
      totalPages:
        typeof response.data.totalPages === "number" && response.data.totalPages > 0 ? response.data.totalPages : 1,
      currentPage: typeof response.data.currentPage === "number" ? response.data.currentPage : pageNumber,
      hasNext:
        typeof response.data.hasNext === "boolean"
          ? response.data.hasNext
          : (typeof response.data.currentPage === "number" ? response.data.currentPage : pageNumber) <
            (typeof response.data.totalPages === "number" && response.data.totalPages > 0
              ? response.data.totalPages
              : 1),
      hasPrevious:
        typeof response.data.hasPrevious === "boolean"
          ? response.data.hasPrevious
          : (typeof response.data.currentPage === "number" ? response.data.currentPage : pageNumber) > 1,
    }
  }, [])

  const loadManualTrackFailures = useCallback(
    async (jobId: number, pageNumber: number) => {
      try {
        setManualTrackFailuresLoading(true)
        setManualTrackFailuresError(null)

        const failurePage = await fetchCsvFailuresPage(jobId, pageNumber, MANUAL_TRACK_FAILURES_PAGE_SIZE)

        if (!isManualTrackMountedRef.current) {
          return
        }

        setManualTrackFailures(failurePage.rows)
        setManualTrackFailuresPage(failurePage.currentPage)
        setManualTrackFailuresTotalPages(failurePage.totalPages)
        setManualTrackFailuresTotalCount(failurePage.totalCount)
        setManualTrackFailuresHasNext(failurePage.hasNext)
        setManualTrackFailuresHasPrevious(failurePage.hasPrevious)
      } catch (error: any) {
        if (!isManualTrackMountedRef.current) {
          return
        }
        setManualTrackFailuresError(error?.message || "Failed to load failure rows")
      } finally {
        if (isManualTrackMountedRef.current) {
          setManualTrackFailuresLoading(false)
        }
      }
    },
    [fetchCsvFailuresPage]
  )

  const handleManualTrackAccounts = useCallback(async () => {
    try {
      const runId = billingScheduleRun?.latestRunProgress?.runId
      const runStatus = billingScheduleRun?.latestRunProgress?.runStatus
      const hasRunningStage = billingScheduleRun?.latestRunProgress?.hasRunningStage === true
      const isCustomRun = billingScheduleRun?.name?.trim().toLowerCase().includes("custom") === true

      if (!isCustomRun) {
        notify("error", "Manual Tracking Unavailable", {
          description: "Manual account loading is only available for custom schedules.",
        })
        return
      }

      if (!runId) {
        notify("error", "Run Not Found", {
          description: "Create a run first before loading customer accounts manually.",
        })
        return
      }

      if (runStatus !== 0) {
        notify("error", "Run Not Startable", {
          description: "Manual account loading is only available while the run is in Draft.",
        })
        return
      }

      if (hasRunningStage) {
        notify("error", "Run Busy", {
          description: "A run stage is currently processing. Please wait for completion.",
        })
        return
      }

      if (!manualTrackFile) {
        notify("error", "Tracking File Required", {
          description: "Select a tracking file in CSV or XLSX format.",
        })
        return
      }

      const fileNameLower = manualTrackFile.name.toLowerCase()
      const isSupportedFileType = fileNameLower.endsWith(".csv") || fileNameLower.endsWith(".xlsx")
      if (!isSupportedFileType) {
        notify("error", "Invalid File Type", {
          description: "Tracking file must be a .csv or .xlsx file.",
        })
        return
      }

      setManualTrackLoading(true)
      setManualTrackError(null)
      setManualTrackFailureCount(null)
      setManualTrackLastUpdatedAt(null)
      setManualTrackJob(null)
      setManualTrackJobId(null)
      resetManualTrackFailuresView()

      const checksum = await buildFileMetadataChecksum(manualTrackFile)

      const intentPayload = {
        fileName: manualTrackFile.name,
        contentType: manualTrackFile.type || "application/octet-stream",
        sizeBytes: manualTrackFile.size,
        purpose: "postpaid-schedule-customer-tracking-bulk",
        checksum,
        bulkInsertType: SCHEDULE_CUSTOMER_TRACKING_BULK_INSERT_TYPE,
        columns: ["CustomerAccountNo"],
      }

      const fileIntentResult = await dispatch(createFileIntent(intentPayload)).unwrap()
      if (!fileIntentResult?.isSuccess) {
        throw new Error(fileIntentResult?.message || "Failed to create file upload intent")
      }

      const fileId = fileIntentResult.data?.fileId
      const uploadUrl = fileIntentResult.data?.uploadUrl
      if (!fileId || !uploadUrl) {
        throw new Error("Upload intent did not return a valid file destination")
      }

      await uploadFileToSignedUrl(uploadUrl, manualTrackFile, manualTrackFile.type || "application/octet-stream")

      const finalizeResult = await dispatch(finalizeFile(fileId)).unwrap()
      if (!finalizeResult?.isSuccess) {
        throw new Error(finalizeResult?.message || "Failed to finalize uploaded file")
      }

      const trackEndpoint = API_ENDPOINTS.POSTPAID_BILLING.TRACK_BILLING_SCHEDULE_CUSTOMERS_BULK.replace(
        "{runId}",
        runId.toString()
      )
      const trackResult = await api.post<TrackScheduleCustomersResponse>(buildApiUrl(trackEndpoint), {
        fileId,
      } as TrackScheduleCustomersRequest)

      if (!trackResult.data?.isSuccess || !trackResult.data?.data) {
        throw new Error(trackResult.data?.message || "Failed to start account tracking")
      }

      const returnedJobId =
        typeof (trackResult.data.data as CsvJob)?.id === "number"
          ? (trackResult.data.data as CsvJob).id
          : typeof (trackResult.data.data as { id?: number })?.id === "number"
          ? (trackResult.data.data as { id: number }).id
          : null

      if (!returnedJobId) {
        throw new Error("Tracking job id was not returned by the server")
      }

      setManualTrackJobId(returnedJobId)
      persistManualTrackingJobId(runId, returnedJobId)
      manualTrackTerminalHandledRef.current = null
      setManualTrackLastUpdatedAt(new Date().toISOString())

      // Try immediate read for fast UI feedback before polling loop takes over
      try {
        const latestJob = await fetchCsvJobById(returnedJobId)
        setManualTrackJob(latestJob)
      } catch {
        setManualTrackJob({
          id: returnedJobId,
          jobType: 0,
          status: 1,
          requestedByUserId: 0,
          requestedAtUtc: new Date().toISOString(),
          fileName: manualTrackFile.name,
          fileKey: "",
          fileUrl: "",
          fileSize: manualTrackFile.size,
          totalRows: 0,
          processedRows: 0,
          succeededRows: 0,
          failedRows: 0,
          lastProcessedRow: 0,
          retryCount: 0,
          startedAtUtc: "",
          completedAtUtc: "",
          lastError: "",
          errorBlobKey: "",
          payloadJson: "",
        })
      }

      notify("success", "Manual Tracking Started", {
        description: `${manualTrackFile.name} queued for tracking.`,
      })
    } catch (error: any) {
      const message = error?.message || "Failed to load accounts for tracking"
      setManualTrackError(message)
      setManualTrackLoading(false)
      notify("error", "Manual Tracking Failed", {
        description: message,
      })
    }
  }, [
    billingScheduleRun,
    manualTrackFile,
    buildFileMetadataChecksum,
    dispatch,
    uploadFileToSignedUrl,
    fetchCsvJobById,
    resetManualTrackFailuresView,
    persistManualTrackingJobId,
  ])

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
                if (selectedUploadType === METER_READING_JOB_TYPE) {
                  // Customer Meter Reading - use meter reading account bulk upload endpoint
                  bulkResult = await dispatch(processMeterReadingBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === FEEDER_ENERGY_CAP_JOB_TYPE) {
                  // Feeder Energy Cap - use feeder energy cap endpoint with confirm
                  bulkResult = await dispatch(processFeederEnergyCapBulkUpload({ fileId, confirm: true })).unwrap()
                } else if (selectedUploadType === CUSTOMER_TARIFF_CHANGE_JOB_TYPE) {
                  // Customer Tariff Change - use customer tariff change endpoint
                  bulkResult = await dispatch(processCustomerTariffChangeBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === CUSTOMER_STATUS_CHANGE_JOB_TYPE) {
                  // Customer Status Change - use customer status change endpoint
                  bulkResult = await dispatch(processCustomerStatusChangeBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === CUSTOMER_STORED_AVERAGE_JOB_TYPE) {
                  // Customer Stored Average - use customer stored average update endpoint
                  bulkResult = await dispatch(processCustomerStoredAverageUpdateBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === CUSTOMER_SRDT_JOB_TYPE) {
                  // Customer-DT Reallignment - use customer SRDT update endpoint
                  bulkResult = await dispatch(processCustomerSrdtUpdateBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === BILL_ADJUSTMENT_JOB_TYPE) {
                  // Bill Adjustment - use adjustment billing endpoint
                  bulkResult = await dispatch(processAdjustmentBillingBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === ESTIMATED_CONSUMPTION_JOB_TYPE) {
                  // Customer Estimated Consumption - use customer estimated consumption endpoint
                  bulkResult = await dispatch(processPostpaidEstimatedConsumptionBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === METER_CHANGE_OUT_JOB_TYPE) {
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
  }, [selectedFile, selectedUploadType, dispatch, extractColumnsFromFile, calculateChecksum])

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
    setManualTrackFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (manualTrackFileInputRef.current) {
      manualTrackFileInputRef.current.value = ""
    }
    dispatch(resetFileManagementState())
    dispatch({ type: "fileManagement/resetBillingBulkUploadState" })
  }, [dispatch])

  const toggleRunStageExpand = useCallback((stage: number) => {
    setExpandedRunStages((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }))
  }, [])

  const openCreateRunModal = useCallback(() => {
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
  }, [])

  const refreshRunAndJobs = useCallback(async () => {
    const parsedId = scheduleId ? parseInt(scheduleId) : NaN

    if (isNaN(parsedId)) {
      return
    }

    await Promise.allSettled([
      dispatch(fetchBillingScheduleRun(parsedId)),
      dispatch(
        fetchBillingScheduleRuns({
          scheduleId: parsedId,
          pageNumber: 1,
          pageSize: 20,
        })
      ),
      refetchLatestJobs(),
    ])
  }, [dispatch, scheduleId, refetchLatestJobs])

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
      setIsRunStateSyncing(true)
      await refreshRunAndJobs()
    } catch (error: any) {
      notify("error", "Failed to Create Run", {
        description: error.message || "An error occurred while creating the billing schedule run",
      })
    }
  }, [dispatch, runFormData, refreshRunAndJobs])

  // Handle start billing schedule run
  const handleStartBillingScheduleRun = useCallback(async () => {
    try {
      const isCustomRun = billingScheduleRun?.name?.trim().toLowerCase().includes("custom") === true
      const latestRun = billingScheduleRun?.latestRunProgress
      const currentRunStatus = typeof latestRun?.runStatus === "number" ? latestRun.runStatus : null
      const hasRunStageInProgress = latestRun?.hasRunningStage === true || isLatestRunStageRunning
      const canCarryOutActions =
        (billingScheduleRun?.canCarryOutBillActions ?? latestRun?.canCarryOutBillActions) === true

      if (isCustomRun) {
        if (hasRunStageInProgress) {
          notify("error", "Recompute In Progress", {
            description: "A run stage is currently processing. Wait for it to finish before starting recompute.",
          })
          return
        }

        if (currentRunStatus !== 0) {
          notify("error", "Run Not Startable", {
            description: "Custom recompute can only be started while the run is in Draft.",
          })
          return
        }

        if (!canCarryOutActions) {
          notify("error", "Tracking Required", {
            description:
              "No tracked customer scope is available yet. Upload customer tracking data or run a schedule-linked CSV bulk job first.",
          })
          return
        }
      }

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
      setIsRunStateSyncing(true)
      await refreshRunAndJobs()
    } catch (error: any) {
      setIsRunStateSyncing(false)
      notify("error", "Failed to Start Run", {
        description: error.message || "An error occurred while starting the billing schedule run",
      })
    }
  }, [
    dispatch,
    createBillingScheduleRunResponse,
    startBillingScheduleRunMessage,
    billingScheduleRun,
    isLatestRunStageRunning,
    refreshRunAndJobs,
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
      setIsRunStateSyncing(true)
      await refreshRunAndJobs()
    } catch (error: any) {
      setIsRunStateSyncing(false)
      notify("error", "Failed to Publish Bills", {
        description: error.message || "An error occurred while publishing the billing schedule run",
      })
    }
  }, [dispatch, billingScheduleRun, refreshRunAndJobs])

  // Open cancel confirmation modal
  const handleCancelBillingScheduleRun = useCallback(() => {
    const runId = billingScheduleRun?.latestRunProgress?.runId

    if (!runId) {
      notify("error", "No Run Available", {
        description: "No billing schedule run is available to cancel",
      })
      return
    }

    setIsCancelRunConfirmOpen(true)
  }, [billingScheduleRun])

  // Confirm and cancel billing schedule run
  const handleConfirmCancelBillingScheduleRun = useCallback(async () => {
    try {
      const runId = billingScheduleRun?.latestRunProgress?.runId

      if (!runId) {
        notify("error", "No Run Available", {
          description: "No billing schedule run is available to cancel",
        })
        setIsCancelRunConfirmOpen(false)
        return
      }

      const result = await dispatch(cancelBillingScheduleRun(runId)).unwrap()

      notify("success", "Run Canceled", {
        description: result.message || "Billing schedule run has been canceled successfully",
      })

      setIsCancelRunConfirmOpen(false)
      setIsRunDetailsDrawerOpen(false)

      setIsRunStateSyncing(true)
      await refreshRunAndJobs()
    } catch (error: any) {
      setIsRunStateSyncing(false)
      notify("error", "Failed to Cancel Run", {
        description: error.message || "An error occurred while canceling the billing schedule run",
      })
    }
  }, [dispatch, billingScheduleRun, refreshRunAndJobs])

  useEffect(() => {
    if (!isRunDetailsDrawerOpen) {
      setIsRunDrawerRefreshing(false)
      return
    }

    let isCancelled = false
    setIsRunDrawerRefreshing(true)
    refreshRunAndJobs().finally(() => {
      if (!isCancelled) {
        setIsRunDrawerRefreshing(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [isRunDetailsDrawerOpen, refreshRunAndJobs])

  // Poll schedule run while an active stage is running so UI unblocks immediately on completion
  useEffect(() => {
    const latestRunId = billingScheduleRun?.latestRunProgress?.runId
    const hasRunningStage = billingScheduleRun?.latestRunProgress?.hasRunningStage === true || isLatestRunStageRunning

    if (!latestRunId || !hasRunningStage) return

    const pollIntervalMs = isRunDetailsDrawerOpen || isRunStateSyncing ? 2000 : 7000

    const pollRunState = () => {
      refreshRunAndJobs()
    }

    // Pull once immediately for responsive UX, then keep polling while active
    pollRunState()

    const interval = setInterval(() => {
      pollRunState()
    }, pollIntervalMs)

    return () => clearInterval(interval)
  }, [
    dispatch,
    scheduleId,
    isRunDetailsDrawerOpen,
    isRunStateSyncing,
    billingScheduleRun?.latestRunProgress?.runId,
    billingScheduleRun?.latestRunProgress?.hasRunningStage,
    isLatestRunStageRunning,
    refreshRunAndJobs,
  ])

  // Force short-interval sync after start/create actions so blockers/loaders update without manual refresh
  useEffect(() => {
    if (!isRunStateSyncing) return

    let attempts = 0
    const maxAttempts = 10

    const syncRunState = () => {
      attempts += 1
      refreshRunAndJobs()

      if (attempts >= maxAttempts) {
        setIsRunStateSyncing(false)
      }
    }

    syncRunState()
    const interval = setInterval(syncRunState, 2000)

    return () => clearInterval(interval)
  }, [isRunStateSyncing, refreshRunAndJobs])

  useEffect(() => {
    const latestRunId = billingScheduleRun?.latestRunProgress?.runId
    const isCustomRun = billingScheduleRun?.name?.trim().toLowerCase().includes("custom") === true

    if (!latestRunId || !isCustomRun) {
      manualTrackRecoveryRunRef.current = null
      setManualTrackRecoveryChecking(false)
      return
    }

    if (manualTrackJobId || manualTrackRecoveryRunRef.current === latestRunId) {
      setManualTrackRecoveryChecking(false)
      return
    }

    manualTrackRecoveryRunRef.current = latestRunId
    setManualTrackRecoveryChecking(true)
    let isCancelled = false

    const recoverManualTrackingJob = async () => {
      let recoveredJob: CsvJob | null = null
      let recoveredTerminalJob: CsvJob | null = null

      const persistedJobId = readPersistedManualTrackingJobId(latestRunId)
      if (persistedJobId) {
        try {
          const persistedJob = await fetchCsvJobById(persistedJobId)
          const persistedJobRunId = extractRunIdFromCsvJobPayload(persistedJob.payloadJson)
          if (
            isScheduleCustomerTrackingJob(persistedJob) &&
            (persistedJobRunId === null || persistedJobRunId === latestRunId)
          ) {
            if (persistedJob.status === 1 || persistedJob.status === 2) {
              recoveredJob = persistedJob
            } else if (TRACKING_TERMINAL_STATUSES.has(persistedJob.status)) {
              recoveredTerminalJob = persistedJob
            }
          } else {
            clearPersistedManualTrackingJobId(latestRunId)
          }
        } catch {
          clearPersistedManualTrackingJobId(latestRunId)
        }
      }

      if (!recoveredJob) {
        try {
          recoveredJob = await fetchLatestActiveManualTrackingJob(latestRunId)
        } catch {
          recoveredJob = null
        }
      }

      if (!recoveredJob && recoveredTerminalJob) {
        recoveredJob = recoveredTerminalJob
      }

      if (!recoveredJob || isCancelled || !isManualTrackMountedRef.current) {
        return
      }

      const isRecoveredJobActive = recoveredJob.status === 1 || recoveredJob.status === 2
      setManualTrackJob(recoveredJob)
      setManualTrackLastUpdatedAt(new Date().toISOString())
      setManualTrackError(null)

      if (isRecoveredJobActive) {
        setManualTrackJobId(recoveredJob.id)
        setManualTrackLoading(true)
        persistManualTrackingJobId(latestRunId, recoveredJob.id)
        return
      }

      setManualTrackLoading(false)
      clearPersistedManualTrackingJobId(latestRunId)
      if (recoveredJob.status === 4 || recoveredJob.status === 5) {
        const failureCount = await fetchCsvFailuresCount(recoveredJob.id)
        if (!isCancelled && isManualTrackMountedRef.current) {
          setManualTrackFailureCount(failureCount)
        }
      }

      if (!isCancelled && isManualTrackMountedRef.current) {
        setManualTrackRecoveryChecking(false)
      }
    }

    recoverManualTrackingJob().finally(() => {
      if (!isCancelled && isManualTrackMountedRef.current) {
        setManualTrackRecoveryChecking(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [
    billingScheduleRun?.latestRunProgress?.runId,
    billingScheduleRun?.name,
    manualTrackJobId,
    readPersistedManualTrackingJobId,
    fetchCsvJobById,
    extractRunIdFromCsvJobPayload,
    isScheduleCustomerTrackingJob,
    clearPersistedManualTrackingJobId,
    fetchLatestActiveManualTrackingJob,
    persistManualTrackingJobId,
    fetchCsvFailuresCount,
  ])

  useEffect(() => {
    if (!manualTrackJob) {
      return
    }

    const resolvedRunId =
      extractRunIdFromCsvJobPayload(manualTrackJob.payloadJson) ?? billingScheduleRun?.latestRunProgress?.runId ?? null

    if (!resolvedRunId) {
      return
    }

    if (manualTrackJob.status === 1 || manualTrackJob.status === 2) {
      persistManualTrackingJobId(resolvedRunId, manualTrackJob.id)
      return
    }

    if (TRACKING_TERMINAL_STATUSES.has(manualTrackJob.status)) {
      clearPersistedManualTrackingJobId(resolvedRunId)
    }
  }, [
    manualTrackJob,
    billingScheduleRun?.latestRunProgress?.runId,
    extractRunIdFromCsvJobPayload,
    persistManualTrackingJobId,
    clearPersistedManualTrackingJobId,
  ])

  useEffect(() => {
    if (!manualTrackJobId) return
    if (typeof manualTrackJob?.status === "number" && TRACKING_TERMINAL_STATUSES.has(manualTrackJob.status)) return

    let isCancelled = false
    let interval: ReturnType<typeof setInterval> | null = null

    const pollManualTrackJob = async () => {
      try {
        const latestJob = await fetchCsvJobById(manualTrackJobId)

        if (isCancelled || !isManualTrackMountedRef.current) {
          return
        }

        setManualTrackJob(latestJob)
        setManualTrackLastUpdatedAt(new Date().toISOString())
        setManualTrackError(null)
      } catch (error: any) {
        if (!isCancelled && isManualTrackMountedRef.current) {
          setManualTrackError(error?.message || "Failed to refresh manual tracking status")
        }
      }
    }

    const timeout = setTimeout(() => {
      pollManualTrackJob()
      interval = setInterval(pollManualTrackJob, MANUAL_TRACK_POLL_INTERVAL_MS)
    }, MANUAL_TRACK_POLL_INITIAL_DELAY_MS)

    return () => {
      isCancelled = true
      clearTimeout(timeout)
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [manualTrackJobId, manualTrackJob?.status, fetchCsvJobById])

  useEffect(() => {
    if (!manualTrackJobId || !manualTrackJob) return
    if (!TRACKING_TERMINAL_STATUSES.has(manualTrackJob.status)) return
    if (manualTrackTerminalHandledRef.current === manualTrackJob.id) return

    manualTrackTerminalHandledRef.current = manualTrackJob.id
    setManualTrackLoading(false)

    const hydrateTerminalState = async () => {
      const resolvedRunId =
        extractRunIdFromCsvJobPayload(manualTrackJob.payloadJson) ??
        billingScheduleRun?.latestRunProgress?.runId ??
        null
      if (resolvedRunId) {
        clearPersistedManualTrackingJobId(resolvedRunId)
      }

      if (manualTrackJob.status === 5 || manualTrackJob.status === 4) {
        const failureCount = await fetchCsvFailuresCount(manualTrackJob.id)
        if (isManualTrackMountedRef.current) {
          setManualTrackFailureCount(failureCount)
        }
      } else if (isManualTrackMountedRef.current) {
        resetManualTrackFailuresView()
      }

      await refreshRunAndJobs()

      if (!isManualTrackMountedRef.current) {
        return
      }

      if (manualTrackJob.status === 3) {
        notify("success", "Accounts Loaded", {
          description: "Customer scope updated successfully. Recompute can now proceed when available.",
        })
        return
      }

      if (manualTrackJob.status === 5) {
        notify("warning", "Accounts Loaded With Failures", {
          description: "Some rows failed while others were tracked successfully.",
        })
        return
      }

      notify("error", "Account Loading Failed", {
        description: manualTrackJob.lastError || "The tracking import failed. Please review the input and retry.",
      })
    }

    hydrateTerminalState()
  }, [
    manualTrackJobId,
    manualTrackJob,
    fetchCsvFailuresCount,
    refreshRunAndJobs,
    resetManualTrackFailuresView,
    extractRunIdFromCsvJobPayload,
    billingScheduleRun?.latestRunProgress?.runId,
    clearPersistedManualTrackingJobId,
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
  const isCustomSchedule = billingScheduleRun?.name?.trim().toLowerCase().includes("custom") === true
  const latestRunProgress = billingScheduleRun?.latestRunProgress ?? null
  const latestRunFromHistory =
    billingScheduleRuns?.slice()?.sort((a: BillingScheduleRunItem, b: BillingScheduleRunItem) => {
      const timeA = new Date(a.lastUpdated || a.completedAtUtc || a.createdAt || 0).getTime()
      const timeB = new Date(b.lastUpdated || b.completedAtUtc || b.createdAt || 0).getTime()
      return timeB - timeA
    })?.[0] ?? null
  const latestCompletedRunFromHistory = latestRunFromHistory?.status === 2 ? latestRunFromHistory : null
  const rawRunStages = latestRunProgress?.stages ?? []
  const runStages = isCustomSchedule
    ? rawRunStages.filter((_: any, stageIndex: number) => stageIndex !== 1).slice(0, 3)
    : rawRunStages
  const runningRunStageIndex = runStages.findIndex((stage: BillingScheduleRunStage) => stage.state === 1)
  const runningRunStage = runningRunStageIndex >= 0 ? runStages[runningRunStageIndex] : null
  const hasRunningStage = latestRunProgress?.hasRunningStage === true || runningRunStage !== null
  const hasActiveRunTask = hasRunningStage
  const runStatus = typeof latestRunProgress?.runStatus === "number" ? latestRunProgress.runStatus : null
  const isRunDraft = runStatus === 0
  const runCanCarryOutBillActions =
    (billingScheduleRun?.canCarryOutBillActions ?? latestRunProgress?.canCarryOutBillActions) === true
  const completedRunStages = runStages.filter((stage: BillingScheduleRunStage) => stage.state === 2).length
  const runCompletionPercentage = runStages.length > 0 ? Math.round((completedRunStages / runStages.length) * 100) : 0
  const runStatusTone = getRunStateTone(latestRunProgress?.runStatus)
  const latestRunStartedAt = formatUtcDateTime(latestRunProgress?.startedAtUtc)
  const hasLatestRun = latestRunProgress !== null
  const hasCompletedRunHistory = latestCompletedRunFromHistory !== null
  const latestCompletedRunAt = formatUtcDateTime(
    latestCompletedRunFromHistory?.completedAtUtc || latestCompletedRunFromHistory?.lastUpdated
  )
  const runningStageLabel = runningRunStage
    ? isCustomSchedule
      ? getCustomStageLabelByIndex(runningRunStageIndex)
      : getRunStageLabel(runningRunStage.stage)
    : null
  const isExportArActionLoading = isArExportDownloadMode ? exportScheduleRunARLoading : exportArScheduleRunLoading
  const exportArActionError = isArExportDownloadMode ? exportScheduleRunARError : exportArScheduleRunError
  const showRunDetailsSyncIndicator = isRunStateSyncing || isRunDrawerRefreshing
  const currentScheduleName = billingScheduleRun?.name?.trim()
    ? `${billingScheduleRun.name.trim()} Blilling Schdule`
    : "Billing Schedule"
  const isRunStateRefreshing = isRunStatusChecking
  const isRunHistoryRefreshing = billingScheduleRunsLoading && billingScheduleRuns.length === 0
  const isRunActionBusy =
    createBillingScheduleRunLoading ||
    startBillingScheduleRunLoading ||
    publishBillingScheduleRunLoading ||
    cancelBillingScheduleRunLoading
  const canCancelCurrentRun =
    hasLatestRun &&
    typeof latestRunProgress?.runId === "number" &&
    latestRunProgress.runStatus !== 2 &&
    latestRunProgress.runStatus !== 3
  const isCancelCurrentRunDisabled = cancelBillingScheduleRunLoading || hasRunningStage
  const canStartCustomRecompute = hasLatestRun && runCanCarryOutBillActions && isRunDraft && !hasActiveRunTask
  const canStartNonCustomBillGeneration = hasLatestRun && !hasActiveRunTask
  const canStartDraftRun = isCustomSchedule ? canStartCustomRecompute : canStartNonCustomBillGeneration
  const customRecomputeBlockReason = !isCustomSchedule
    ? null
    : !hasLatestRun
    ? "Create and initialize a run before recompute."
    : hasActiveRunTask
    ? "A run stage is currently processing."
    : !isRunDraft
    ? "Recompute is only available while the run is in Draft."
    : !runCanCarryOutBillActions
    ? "No tracked customer scope yet. Upload tracking data or process a schedule-linked CSV bulk job first."
    : null
  const hasManualTrackFile = manualTrackFile !== null
  const manualTrackFileName = manualTrackFile?.name || null
  const manualTrackFileSize = manualTrackFile ? formatFileSize(manualTrackFile.size) : null
  const hasSupportedManualTrackFileType =
    manualTrackFile !== null &&
    (manualTrackFile.name.toLowerCase().endsWith(".csv") || manualTrackFile.name.toLowerCase().endsWith(".xlsx"))
  const manualTrackStatusLabel = getCsvJobStatusLabel(manualTrackJob?.status)
  const manualTrackStatusTone = getCsvJobStatusTone(manualTrackJob?.status)
  const isManualTrackInFlight = manualTrackJob?.status === 1 || manualTrackJob?.status === 2
  const isManualTrackFailureStatus = manualTrackJob?.status === 4 || manualTrackJob?.status === 5
  const manualTrackFailureRowsCount =
    typeof manualTrackFailureCount === "number"
      ? manualTrackFailureCount
      : typeof manualTrackJob?.failedRows === "number"
      ? manualTrackJob.failedRows
      : 0
  const hasManualTrackFailures = manualTrackFailureRowsCount > 0
  const canLoadManualAccounts =
    isCustomSchedule &&
    hasLatestRun &&
    isRunDraft &&
    !hasActiveRunTask &&
    !isRunStateRefreshing &&
    !manualTrackRecoveryChecking &&
    !manualTrackLoading &&
    !isManualTrackInFlight &&
    hasManualTrackFile &&
    hasSupportedManualTrackFileType
  const manualLoadBlockReason = !isCustomSchedule
    ? "Manual account loading is only available for custom schedules."
    : !hasLatestRun
    ? "Create and initialize a run before loading accounts."
    : !isRunDraft
    ? "Manual account loading is only available while the run is in Draft."
    : hasActiveRunTask
    ? "A run stage is currently processing."
    : isRunStateRefreshing
    ? "Run status is refreshing. Please wait."
    : manualTrackRecoveryChecking
    ? "Checking for any active customer loading job..."
    : manualTrackLoading
    ? "Account loading is currently in progress."
    : isManualTrackInFlight
    ? "A customer loading job is still running. Wait for it to finish before uploading another file."
    : !hasManualTrackFile
    ? "Select a CSV or XLSX file to load accounts."
    : !hasSupportedManualTrackFileType
    ? "Tracking file must be .csv or .xlsx."
    : null
  const showManualLoadPanel = isCustomSchedule && hasLatestRun
  const isManualTrackTerminal = manualTrackJob ? TRACKING_TERMINAL_STATUSES.has(manualTrackJob.status) : false

  // Single source of truth for blocking UX during active run operations
  const isRunInProgress = hasActiveRunTask || isRunActionBusy
  const isUploadTypeSelectionBlocked =
    isRunStateRefreshing || isRunHistoryRefreshing || !hasLatestRun || isRunInProgress
  const showCompletedRunPanel = !isRunStateRefreshing && !hasLatestRun && hasCompletedRunHistory
  const showNoRunWarning = !isRunStateRefreshing && !isRunHistoryRefreshing && !hasLatestRun && !hasCompletedRunHistory
  const showCustomScopeWarning =
    isCustomSchedule &&
    hasLatestRun &&
    !isRunStateRefreshing &&
    !hasActiveRunTask &&
    isRunDraft &&
    !runCanCarryOutBillActions

  useEffect(() => {
    if (!isRunDetailsDrawerOpen) {
      return
    }

    if (runStatus === 2 || (!hasLatestRun && hasCompletedRunHistory)) {
      setIsRunDetailsDrawerOpen(false)
    }
  }, [isRunDetailsDrawerOpen, runStatus, hasLatestRun, hasCompletedRunHistory])

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
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-24 sm:pb-10">
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
                      <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">{currentScheduleName}</h1>
                      <p className="mt-1 text-sm text-gray-600">
                        Bulk upload billing records for this schedule using CSV or Excel files
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (hasLatestRun) {
                        setIsRunDetailsDrawerOpen(true)
                        return
                      }
                      openCreateRunModal()
                    }}
                    disabled={isRunStateRefreshing}
                    className="inline-flex items-center gap-2 rounded-lg border border-green-700 bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    {isRunStateRefreshing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Checking...
                      </>
                    ) : hasLatestRun ? (
                      <>
                        <Eye className="size-4" />
                        Run Details
                      </>
                    ) : (
                      <>
                        <Play className="size-4" />
                        Start Run
                      </>
                    )}
                  </button>
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
                  className="overflow-hidden rounded-xl border border-gray-200/60 bg-transparent p-6"
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
                  className="overflow-hidden rounded-xl border border-gray-200/60 bg-transparent p-6"
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
                  className="overflow-hidden rounded-xl border border-gray-200/60 bg-transparent"
                >
                  {/* Upload Type Selection */}
                  {!hasCompletedUploadTypeSelection && (
                    <div className="p-4 sm:p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Select Upload Type</h2>
                          <p className="text-sm text-gray-600">Choose the type of billing upload you want to perform</p>
                        </div>
                        <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          {uploadTypeOptions.length} options
                        </div>
                      </div>

                      {isRunStateRefreshing && (
                        <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <Loader2 className="size-5 shrink-0 animate-spin text-blue-600" />
                          <p className="text-sm text-blue-800">Checking current run status...</p>
                        </div>
                      )}

                      {!isRunStateRefreshing && isRunHistoryRefreshing && (
                        <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <Loader2 className="size-5 shrink-0 animate-spin text-blue-600" />
                          <p className="text-sm text-blue-800">Checking run history...</p>
                        </div>
                      )}

                      {showCompletedRunPanel && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="rounded-full bg-emerald-100 p-1.5">
                                <CheckCircle className="size-4 text-emerald-700" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-emerald-900">
                                  Latest run completed successfully
                                </p>
                                <p className="text-sm text-emerald-800">
                                  {latestCompletedRunFromHistory?.title || `Run #${latestCompletedRunFromHistory?.id}`}
                                  {latestCompletedRunAt ? ` • Completed ${latestCompletedRunAt}` : ""}
                                </p>
                                <p className="mt-0.5 text-xs text-emerald-700">
                                  You can download generated PDF files for this run or start a new run.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (latestCompletedRunFromHistory?.id) {
                                    setDownloadPdfRunId(latestCompletedRunFromHistory.id)
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                              >
                                <Download className="size-3.5" />
                                View PDF Files
                              </button>
                              <button
                                type="button"
                                onClick={openCreateRunModal}
                                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700 bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-800"
                              >
                                <Play className="size-3.5" />
                                Start New Run
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {showNoRunWarning && (
                        <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                          <Info className="size-5 shrink-0 text-amber-600" />
                          <p className="text-sm text-amber-800">
                            No active billing schedule run found. Start a run before selecting an upload type.
                          </p>
                        </div>
                      )}

                      {showManualLoadPanel && (
                        <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50/40 p-3.5">
                          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-indigo-900">Manual Account Loading</p>
                              <p className="text-xs text-indigo-700">
                                Upload a CSV or XLSX tracking file to load customer scope for recompute.
                              </p>
                            </div>
                            <div className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700">
                              {hasManualTrackFile ? "File selected" : "No file selected"}
                            </div>
                          </div>

                          <input
                            ref={manualTrackFileInputRef}
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={handleManualTrackFileChange}
                            className="hidden"
                          />

                          <div className="rounded-md border border-dashed border-indigo-200 bg-white p-3">
                            {hasManualTrackFile ? (
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{manualTrackFileName}</p>
                                  <p className="text-xs text-gray-500">
                                    {manualTrackFileSize}
                                    {!hasSupportedManualTrackFileType ? " • Unsupported extension" : ""}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => manualTrackFileInputRef.current?.click()}
                                  disabled={manualTrackRecoveryChecking || manualTrackLoading || isManualTrackInFlight}
                                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Replace File
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm text-gray-500">No file chosen yet.</p>
                                <button
                                  type="button"
                                  onClick={() => manualTrackFileInputRef.current?.click()}
                                  disabled={manualTrackRecoveryChecking || manualTrackLoading || isManualTrackInFlight}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-indigo-300 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <CloudUpload className="size-3.5" />
                                  Choose File
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[11px] text-indigo-700">
                              Supported formats: <span className="font-medium">.csv</span> or{" "}
                              <span className="font-medium">.xlsx</span>. File is sent directly without client-side CSV
                              parsing.
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setManualTrackFile(null)
                                  setManualTrackError(null)
                                  resetManualTrackFailuresView()
                                  if (manualTrackFileInputRef.current) {
                                    manualTrackFileInputRef.current.value = ""
                                  }
                                }}
                                disabled={
                                  manualTrackRecoveryChecking ||
                                  manualTrackLoading ||
                                  isManualTrackInFlight ||
                                  !hasManualTrackFile
                                }
                                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                onClick={handleManualTrackAccounts}
                                disabled={!canLoadManualAccounts}
                                title={!canLoadManualAccounts ? manualLoadBlockReason || undefined : undefined}
                                className="inline-flex items-center gap-1.5 rounded-md border border-indigo-700 bg-indigo-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {manualTrackLoading || isManualTrackInFlight ? (
                                  <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="size-3.5" />
                                    Load Accounts
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {manualTrackRecoveryChecking && (
                            <div className="mt-2 flex items-center gap-2 rounded border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs text-blue-800">
                              <Loader2 className="size-3.5 animate-spin" />
                              Checking for active customer loading jobs...
                            </div>
                          )}

                          {isManualTrackInFlight && (
                            <div className="mt-2 rounded border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs text-blue-800">
                              A customer loading job is in progress. New CSV uploads are locked until it completes.
                            </div>
                          )}

                          {(manualTrackJob || manualTrackError) && (
                            <div className="mt-3 rounded-md border border-indigo-100 bg-white p-3">
                              {manualTrackJob ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${manualTrackStatusTone}`}
                                      >
                                        {manualTrackStatusLabel}
                                      </span>
                                      {(manualTrackJob.status === 1 || manualTrackJob.status === 2) && (
                                        <RefreshCw className="size-3 animate-spin text-blue-500" />
                                      )}
                                    </div>
                                    <span className="text-[11px] text-gray-500">
                                      Job #{manualTrackJob.id}
                                      {manualTrackLastUpdatedAt
                                        ? ` • Updated ${formatUtcDateTime(manualTrackLastUpdatedAt)}`
                                        : ""}
                                    </span>
                                  </div>

                                  <JobStatusIndicator
                                    job={manualTrackJob}
                                    isLoading={manualTrackLoading && !isManualTrackTerminal}
                                  />

                                  {isManualTrackFailureStatus && (
                                    <div className="space-y-2 rounded border border-amber-200 bg-amber-50 px-2.5 py-2">
                                      <div className="flex flex-wrap items-start justify-between gap-2">
                                        <p className="text-xs text-amber-800">
                                          {manualTrackJob.status === 5
                                            ? "Some rows failed; successful rows were tracked."
                                            : "Tracking failed. Review account numbers and retry."}
                                          {manualTrackFailureRowsCount > 0
                                            ? ` Failure rows: ${manualTrackFailureRowsCount.toLocaleString()}.`
                                            : ""}
                                        </p>

                                        {hasManualTrackFailures && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (isManualTrackFailuresVisible) {
                                                setIsManualTrackFailuresVisible(false)
                                                return
                                              }

                                              setIsManualTrackFailuresVisible(true)
                                              void loadManualTrackFailures(manualTrackJob.id, 1)
                                            }}
                                            disabled={manualTrackFailuresLoading}
                                            className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            {manualTrackFailuresLoading && isManualTrackFailuresVisible ? (
                                              <Loader2 className="size-3 animate-spin" />
                                            ) : (
                                              <VscEye className="size-3.5" />
                                            )}
                                            {isManualTrackFailuresVisible ? "Hide Failures" : "View Failures"}
                                          </button>
                                        )}
                                      </div>

                                      {isManualTrackFailuresVisible && (
                                        <div className="rounded-md border border-amber-200 bg-white p-2.5">
                                          <div className="mb-2 flex items-center justify-between gap-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                                              Failure Rows
                                            </p>
                                            <span className="text-[11px] text-amber-700">
                                              Page {manualTrackFailuresPage} of {manualTrackFailuresTotalPages}
                                            </span>
                                          </div>

                                          <div className="overflow-x-auto">
                                            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-xs">
                                              <thead>
                                                <tr className="bg-amber-50">
                                                  <th className="border-b border-amber-100 px-2 py-1.5 text-left font-medium text-amber-900">
                                                    Line
                                                  </th>
                                                  <th className="border-b border-amber-100 px-2 py-1.5 text-left font-medium text-amber-900">
                                                    Message
                                                  </th>
                                                  <th className="border-b border-amber-100 px-2 py-1.5 text-left font-medium text-amber-900">
                                                    Raw Row
                                                  </th>
                                                  <th className="border-b border-amber-100 px-2 py-1.5 text-left font-medium text-amber-900">
                                                    Created
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {manualTrackFailuresLoading ? (
                                                  <tr>
                                                    <td colSpan={4} className="px-2 py-4">
                                                      <div className="flex items-center justify-center gap-1.5 text-amber-700">
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                        <span>Loading failure rows...</span>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                ) : manualTrackFailuresError ? (
                                                  <tr>
                                                    <td colSpan={4} className="px-2 py-4 text-center text-red-700">
                                                      {manualTrackFailuresError}
                                                    </td>
                                                  </tr>
                                                ) : manualTrackFailures.length === 0 ? (
                                                  <tr>
                                                    <td colSpan={4} className="px-2 py-4 text-center text-gray-500">
                                                      No failure rows found on this page.
                                                    </td>
                                                  </tr>
                                                ) : (
                                                  manualTrackFailures.map((failure) => (
                                                    <tr key={failure.id} className="align-top">
                                                      <td className="border-b border-amber-100 p-2 font-medium text-gray-800">
                                                        {failure.lineNumber}
                                                      </td>
                                                      <td
                                                        className="border-b border-amber-100 p-2 text-gray-700"
                                                        title={failure.message}
                                                      >
                                                        <p className="max-w-64 truncate">{failure.message}</p>
                                                      </td>
                                                      <td
                                                        className="border-b border-amber-100 p-2 font-mono text-[11px] text-gray-700"
                                                        title={failure.rawLine}
                                                      >
                                                        <p className="max-w-[22rem] truncate">{failure.rawLine}</p>
                                                      </td>
                                                      <td className="border-b border-amber-100 p-2 text-gray-600">
                                                        {formatUtcDateTime(failure.createdAtUtc) || "N/A"}
                                                      </td>
                                                    </tr>
                                                  ))
                                                )}
                                              </tbody>
                                            </table>
                                          </div>

                                          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-gray-600">
                                            <span>
                                              Showing {manualTrackFailures.length} of{" "}
                                              {manualTrackFailuresTotalCount.toLocaleString()} failure rows
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (manualTrackFailuresHasPrevious) {
                                                    void loadManualTrackFailures(
                                                      manualTrackJob.id,
                                                      manualTrackFailuresPage - 1
                                                    )
                                                  }
                                                }}
                                                disabled={!manualTrackFailuresHasPrevious || manualTrackFailuresLoading}
                                                className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                              >
                                                <MdOutlineArrowBackIosNew className="size-3" />
                                                Prev
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (manualTrackFailuresHasNext) {
                                                    void loadManualTrackFailures(
                                                      manualTrackJob.id,
                                                      manualTrackFailuresPage + 1
                                                    )
                                                  }
                                                }}
                                                disabled={!manualTrackFailuresHasNext || manualTrackFailuresLoading}
                                                className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                              >
                                                Next
                                                <MdOutlineArrowForwardIos className="size-3" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : null}

                              {manualTrackError ? (
                                <div className="mt-2 rounded border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700">
                                  {manualTrackError}
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}

                      {showCustomScopeWarning && (
                        <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                          <Info className="size-5 shrink-0 text-amber-600" />
                          <p className="text-sm text-amber-800">
                            Recompute is locked until tracked customers are available for this custom run.
                          </p>
                        </div>
                      )}

                      {!isRunStateRefreshing && hasLatestRun && isRunInProgress && (
                        <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <Loader2 className="size-5 shrink-0 animate-spin text-blue-600" />
                          <p className="text-sm text-blue-800">
                            {runningStageLabel
                              ? `${runningStageLabel} is running. Upload type selection is temporarily blocked.`
                              : "A billing run task is in progress. Upload type selection is temporarily blocked."}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {uploadTypeOptions.map((type) => {
                          const latestJob =
                            latestJobs[typeof type.value === "number" ? type.value : parseInt(type.value)] || null
                          const isLoading = jobsLoading
                          const isCardDisabled = isUploadTypeSelectionBlocked

                          return (
                            <motion.button
                              key={type.value}
                              whileHover={{ scale: isCardDisabled ? 1 : 1.01 }}
                              whileTap={{ scale: isCardDisabled ? 1 : 0.99 }}
                              onClick={() => {
                                if (!isCardDisabled) {
                                  setSelectedUploadType(
                                    typeof type.value === "number" ? type.value : parseInt(type.value)
                                  )
                                  setHasCompletedUploadTypeSelection(true)
                                }
                              }}
                              disabled={isCardDisabled}
                              className={`group relative rounded-lg border border-gray-200 bg-white p-3 text-left transition-all ${
                                isCardDisabled
                                  ? "cursor-not-allowed border-gray-300 opacity-50"
                                  : "hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              }`}
                            >
                              <h3 className="mb-1.5 text-base font-semibold text-gray-900 group-hover:text-blue-600">
                                {type.name}
                              </h3>
                              <p className="mb-3 line-clamp-2 text-xs leading-5 text-gray-600">{type.description}</p>

                              {/* Job Status Section */}
                              <div className="rounded-md border border-gray-100 bg-gray-50 p-2.5">
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
                      {isRunInProgress && (
                        <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <Loader2 className="size-5 shrink-0 animate-spin text-blue-600" />
                          <p className="text-sm text-blue-800">
                            {runningStageLabel
                              ? `${runningStageLabel} is running. Upload actions are temporarily disabled.`
                              : "A billing run task is in progress. Upload actions are temporarily disabled."}
                          </p>
                        </div>
                      )}

                      {/* Flow Context Header */}
                      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                                Schedule Flow
                              </p>
                              <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                {selectedUploadTypeDetails.name} Upload
                              </h3>
                              <p className="mt-1 text-sm text-gray-600">{selectedUploadTypeDetails.description}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                                <p className="font-semibold">Step 1</p>
                                <p>Upload type selected</p>
                              </div>
                              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-800">
                                <p className="font-semibold">Step 2</p>
                                <p>Upload and validate file</p>
                              </div>
                              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                                <p className="font-semibold">Step 3</p>
                                <p>Track processing result</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-64">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                                Active Run
                              </p>
                              <p className="mt-1 text-sm font-semibold text-gray-900">
                                {latestRunProgress?.runTitle ||
                                  (latestRunProgress?.runId ? `Run #${latestRunProgress.runId}` : "No run")}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${runStatusTone.badgeClass}`}
                                >
                                  {runStatusTone.label}
                                </span>
                                {runningStageLabel ? (
                                  <span className="text-[11px] text-gray-600">{runningStageLabel}</span>
                                ) : null}
                              </div>
                            </div>

                            <ButtonModule
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedUploadType(null)
                                setHasCompletedUploadTypeSelection(false)
                                setSelectedFile(null)
                                setExtractedColumns([])
                              }}
                              disabled={isRunInProgress}
                              className="w-full bg-[#004B23] text-white hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Change Type
                            </ButtonModule>
                          </div>
                        </div>
                      </div>

                      {/* Upload Setup */}
                      <div className="mb-6">
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-start gap-3">
                              <div className="rounded-full bg-gray-100 p-2">
                                <Download className="size-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Template</p>
                                <p className="text-sm text-gray-600">Download a sample file for this upload type.</p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Required headers are validated automatically when you upload.
                                </p>
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
                                variant="outline"
                                size="sm"
                                onClick={downloadSampleFile}
                                icon={<Download className="size-4" />}
                                disabled={columnsLoading || isRunInProgress}
                                className="border-[#004B23] bg-white text-[#004B23] hover:bg-[#e9f5ef]"
                              >
                                Download Template
                              </ButtonModule>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: File Upload */}
                      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Step 2</p>
                            <h4 className="mt-1 text-base font-semibold text-gray-900">Upload File</h4>
                            <p className="text-sm text-gray-600">
                              Upload your CSV/XLSX file for{" "}
                              <span className="font-medium">{selectedUploadTypeDetails.name}</span>.
                            </p>
                          </div>
                          <span className="inline-flex w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                            Max 50MB
                          </span>
                        </div>

                        <div
                          ref={dropZoneRef}
                          onDrop={handleFileDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDragEnter={handleDragEnter}
                          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                            isRunInProgress
                              ? "pointer-events-none border-gray-300 bg-gray-100 opacity-70"
                              : isDragOver
                              ? "border-blue-400 bg-blue-50"
                              : selectedFile
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-gray-300 bg-gray-50 hover:border-gray-400"
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isLoading || isRunInProgress}
                          />

                          {!selectedFile ? (
                            <div>
                              <CloudUpload
                                className={`mx-auto size-16 ${isDragOver ? "text-blue-500" : "text-gray-400"}`}
                              />
                              <p className="mt-4 text-base text-gray-700">
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="rounded-lg bg-[#004B23] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#003618] focus:outline-none focus:ring-2 focus:ring-[#004B23] focus:ring-offset-2"
                                  disabled={isLoading || isRunInProgress}
                                >
                                  Select File
                                </button>{" "}
                                or drag and drop
                              </p>
                              <p className="mt-2 text-sm text-gray-500">Supported: CSV, XLSX, XLS</p>
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

                              <FileText className="mx-auto size-16 text-emerald-500" />
                              <p className="mt-2 font-medium text-gray-900">{selectedFile.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>

                              {/* Extracted Columns Display */}
                              {extractedColumns.length > 0 && (
                                <div className="mt-4">
                                  <p className="mb-2 text-xs font-medium text-gray-700">Detected columns</p>
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
                                            isRequired ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
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
                                    className="flex items-center gap-2 rounded-lg bg-[#004B23] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#003618] focus:outline-none focus:ring-2 focus:ring-[#004B23] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

                        {selectedFile && !uploadSuccess && (
                          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <div className="flex items-center gap-2">
                              <Info className="size-4 text-gray-500" />
                              <p className="text-xs text-gray-600">
                                This upload feeds the active run and will appear in Step 3 (Recent Uploads) for
                                monitoring.
                              </p>
                            </div>
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
                    </div>
                  )}

                  {/* Recent Uploads Table for Selected Job Type */}
                  {selectedUploadType && (
                    <div className="border-t border-gray-200 bg-gray-50/60">
                      <div className="p-6">
                        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Step 3</p>
                          <h4 className="mt-1 text-base font-semibold text-gray-900">Track Upload Processing</h4>
                          <p className="text-sm text-gray-600">
                            Monitor job progress, inspect failures, and confirm this upload is ready for downstream run
                            actions.
                          </p>
                        </div>
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

        <AnimatePresence>
          {isRunDetailsDrawerOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close run details"
                className="fixed inset-0 z-[95] bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsRunDetailsDrawerOpen(false)}
              />
              <motion.aside
                className="fixed inset-y-0 right-0 z-[96] h-screen w-full max-w-2xl border-l border-gray-200 bg-[#f6f8fb] shadow-2xl"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 260 }}
              >
                <div className="flex h-full flex-col">
                  <div className="border-b border-gray-200 bg-white px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                          Billing Run Details
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                          {billingScheduleRun?.name || "Billing Schedule"}
                        </h2>
                        {billingScheduleRun?.description ? (
                          <p className="mt-1 text-sm text-gray-600">{billingScheduleRun.description}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRunDetailsDrawerOpen(false)}
                        className="rounded-md border border-gray-300 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    {isRunStatusChecking || isRunDrawerRefreshing ? (
                      <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <Loader2 className="size-5 animate-spin text-blue-600" />
                        <p className="text-sm text-blue-800">Checking current run status...</p>
                      </div>
                    ) : !latestRunProgress ? (
                      <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h3 className="text-base font-semibold text-gray-900">No run available</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Start a billing run to unlock timeline status and stage actions.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRunDetailsDrawerOpen(false)
                            openCreateRunModal()
                          }}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          <Play className="size-4" />
                          Start Run
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                                Latest Run
                              </p>
                              <p className="mt-1 font-mono text-sm font-semibold text-gray-900">
                                {latestRunProgress.runTitle}
                              </p>
                            </div>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${runStatusTone.badgeClass}`}
                            >
                              {runStatusTone.label}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Calendar className="size-4 text-gray-500" />
                              {latestRunStartedAt ? `Last run ${latestRunStartedAt}` : "No run date available"}
                            </div>
                            <p className="text-xs font-medium text-gray-700">
                              {completedRunStages}/{runStages.length} stages done
                            </p>
                          </div>

                          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                              style={{ width: `${runCompletionPercentage}%` }}
                            />
                          </div>
                          <p className="mt-1 text-right text-xs font-medium text-gray-600">
                            {runCompletionPercentage}% complete
                          </p>

                          {canCancelCurrentRun && (
                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                onClick={handleCancelBillingScheduleRun}
                                disabled={isCancelCurrentRunDisabled}
                                title={hasRunningStage ? "Cancel is disabled while a stage is running" : undefined}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {cancelBillingScheduleRunLoading ? (
                                  <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Canceling...
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="size-3.5" />
                                    Cancel Current Run
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="min-h-[44px]">
                          <div
                            className={`rounded-xl border border-blue-200 bg-blue-50 p-3 transition-opacity duration-200 ${
                              showRunDetailsSyncIndicator ? "opacity-100" : "pointer-events-none opacity-0"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Loader2 className="size-4 animate-spin text-blue-600" />
                              <p className="text-xs font-medium text-blue-800">Updating run details...</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                            Run Stages
                          </p>
                          {runStages.length === 0 ? (
                            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                              No stage progress data yet.
                            </div>
                          ) : (
                            <div className="relative space-y-3 pl-8">
                              <div className="absolute inset-y-0 left-3.5 w-px bg-gray-200" />
                              {runStages.map((stage: BillingScheduleRunStage, stageIndex: number) => {
                                const stageTone = getRunStateTone(stage.state)
                                const StageIcon = isCustomSchedule
                                  ? getCustomStageIconByIndex(stageIndex)
                                  : getRunStageIcon(stage.stage)
                                const stageLabel = isCustomSchedule
                                  ? getCustomStageLabelByIndex(stageIndex)
                                  : getRunStageLabel(stage.stage)
                                const isExpanded = expandedRunStages[stage.stage] ?? stage.stage === 1
                                const stageProgress =
                                  stage.total > 0 ? Math.min(100, Math.round((stage.processed / stage.total) * 100)) : 0
                                const startedAtLabel = formatUtcDateTime(stage.startedAtUtc)
                                const completedAtLabel = formatUtcDateTime(stage.completedAtUtc)
                                const stageDuration = formatStageDuration(stage.startedAtUtc, stage.completedAtUtc)

                                return (
                                  <div key={stage.stage} className="relative">
                                    <div
                                      className={`absolute -left-8 top-5 flex size-7 items-center justify-center rounded-full border ${stageTone.nodeClass}`}
                                    >
                                      {stage.state === 2 ? (
                                        <CheckCircle className="size-4" />
                                      ) : stage.state === 1 ? (
                                        <Loader2 className="size-4 animate-spin" />
                                      ) : stage.state === 3 ? (
                                        <AlertCircle className="size-4" />
                                      ) : (
                                        <div className="size-2 rounded-full bg-gray-400" />
                                      )}
                                    </div>

                                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                      <button
                                        type="button"
                                        onClick={() => toggleRunStageExpand(stage.stage)}
                                        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="rounded-md bg-gray-100 p-1.5 text-gray-600">
                                            <StageIcon className="size-4" />
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm font-semibold text-gray-900">
                                                Stage {stageIndex + 1} - {stageLabel}
                                              </p>
                                              <span
                                                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${stageTone.badgeClass}`}
                                              >
                                                {stageTone.label}
                                              </span>
                                            </div>
                                            {stage.message ? (
                                              <p className="mt-1 text-xs text-gray-600">{stage.message}</p>
                                            ) : null}
                                          </div>
                                        </div>
                                        <MdOutlineArrowForwardIos
                                          className={`mt-1 size-4 text-gray-400 transition-transform ${
                                            isExpanded ? "rotate-90" : ""
                                          }`}
                                        />
                                      </button>

                                      <AnimatePresence initial={false}>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-t border-gray-100"
                                          >
                                            <div className="space-y-3 px-4 py-3">
                                              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                                                <div className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5">
                                                  <span className="text-[10px] uppercase tracking-wide text-gray-500">
                                                    Total
                                                  </span>
                                                  <p className="font-medium text-gray-900">
                                                    {stage.total.toLocaleString()}
                                                  </p>
                                                </div>
                                                <div className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5">
                                                  <span className="text-[10px] uppercase tracking-wide text-gray-500">
                                                    Processed
                                                  </span>
                                                  <p className="font-medium text-gray-900">
                                                    {stage.processed.toLocaleString()}
                                                  </p>
                                                </div>
                                                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5">
                                                  <span className="text-[10px] uppercase tracking-wide text-emerald-600">
                                                    Succeeded
                                                  </span>
                                                  <p className="font-medium text-emerald-700">
                                                    {stage.succeeded.toLocaleString()}
                                                  </p>
                                                </div>
                                                <div className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5">
                                                  <span className="text-[10px] uppercase tracking-wide text-red-600">
                                                    Failed
                                                  </span>
                                                  <p className="font-medium text-red-700">
                                                    {stage.failed.toLocaleString()}
                                                  </p>
                                                </div>
                                                <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5">
                                                  <span className="text-[10px] uppercase tracking-wide text-amber-600">
                                                    Pending
                                                  </span>
                                                  <p className="font-medium text-amber-700">
                                                    {stage.pending.toLocaleString()}
                                                  </p>
                                                </div>
                                              </div>

                                              <div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                                  <div
                                                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${stageProgress}%` }}
                                                  />
                                                </div>
                                                <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                                                  <span>{stageProgress}% complete</span>
                                                  {stageDuration ? <span>{stageDuration}</span> : null}
                                                </div>
                                              </div>

                                              <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                                                {startedAtLabel ? (
                                                  <div className="flex items-center gap-1.5">
                                                    <Calendar className="size-3.5 text-gray-500" />
                                                    <span>Started {startedAtLabel}</span>
                                                  </div>
                                                ) : null}
                                                {completedAtLabel ? (
                                                  <div className="flex items-center gap-1.5">
                                                    <Calendar className="size-3.5 text-gray-500" />
                                                    <span>Completed {completedAtLabel}</span>
                                                  </div>
                                                ) : null}
                                              </div>

                                              {stage.lastError ? (
                                                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                                  <strong>Error:</strong> {stage.lastError}
                                                </div>
                                              ) : null}

                                              <div className="flex flex-wrap gap-2">
                                                {(isCustomSchedule ? stageIndex === 0 : stage.stage === 1) ? (
                                                  <button
                                                    type="button"
                                                    onClick={handleStartBillingScheduleRun}
                                                    disabled={startBillingScheduleRunLoading || !canStartDraftRun}
                                                    title={
                                                      !canStartDraftRun && isCustomSchedule
                                                        ? customRecomputeBlockReason || undefined
                                                        : undefined
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                  >
                                                    {startBillingScheduleRunLoading ? (
                                                      <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                      <Play className="size-3.5" />
                                                    )}
                                                    {canStartDraftRun
                                                      ? isCustomSchedule
                                                        ? "Start Recompute"
                                                        : "Start Bill Generation"
                                                      : isCustomSchedule
                                                      ? hasActiveRunTask
                                                        ? "Recompute Running"
                                                        : !isRunDraft
                                                        ? "Recompute Unavailable"
                                                        : "Tracking Required"
                                                      : "Bill Generation Running"}
                                                  </button>
                                                ) : null}

                                                {!isCustomSchedule && stage.stage === 2 && showPublishButton ? (
                                                  <button
                                                    type="button"
                                                    onClick={handlePublishBillingScheduleRun}
                                                    disabled={publishBillingScheduleRunLoading || isRunInProgress}
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                  >
                                                    {publishBillingScheduleRunLoading ? (
                                                      <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                      <CheckCircle className="size-3.5" />
                                                    )}
                                                    {publishBillingScheduleRunLoading
                                                      ? "Publishing..."
                                                      : "Publish Draft Bill"}
                                                  </button>
                                                ) : null}

                                                {(isCustomSchedule ? stageIndex === 1 : stage.stage === 3) ? (
                                                  stage.state === 2 ? (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        setIsArExportDownloadMode(true)
                                                        setIsRunDetailsDrawerOpen(false)
                                                        setIsExportArModalOpen(true)
                                                      }}
                                                      disabled={exportScheduleRunARLoading}
                                                      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                      {exportScheduleRunARLoading ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                      ) : (
                                                        <FileDown className="size-3.5" />
                                                      )}
                                                      Export AR
                                                    </button>
                                                  ) : (
                                                    <button
                                                      type="button"
                                                      onClick={handleRunArGeneration}
                                                      disabled={exportArScheduleRunLoading || isRunInProgress}
                                                      className="inline-flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                      {exportArScheduleRunLoading ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                      ) : (
                                                        <FileDown className="size-3.5" />
                                                      )}
                                                      Run AR Generation
                                                    </button>
                                                  )
                                                ) : null}

                                                {(isCustomSchedule ? stageIndex === 2 : stage.stage === 4) &&
                                                showGeneratePdfButton ? (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setIsRunDetailsDrawerOpen(false)
                                                      setIsGeneratePdfModalOpen(true)
                                                    }}
                                                    disabled={isRunInProgress}
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                  >
                                                    <FileText className="size-3.5" />
                                                    Generate PDF
                                                  </button>
                                                ) : null}
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Cancel Run Confirmation Modal */}
        {isCancelRunConfirmOpen && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!cancelBillingScheduleRunLoading) {
                setIsCancelRunConfirmOpen(false)
              }
            }}
          >
            <motion.div
              className="mx-4 w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-2xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-100 p-2">
                  <AlertCircle className="size-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cancel Current Run?</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Are you sure you want to cancel this billing schedule run? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCancelRunConfirmOpen(false)}
                  disabled={cancelBillingScheduleRunLoading}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keep Run
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancelBillingScheduleRun}
                  disabled={cancelBillingScheduleRunLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelBillingScheduleRunLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Canceling...
                    </>
                  ) : (
                    "Yes, Cancel Run"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

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
                  {/* Group By */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Group By <span className="text-red-500">*</span>
                    </label>
                    <FormSelectModule
                      name="pdfGroupBy"
                      value={pdfGroupBy}
                      onChange={(e) => {
                        setPdfGroupBy(e.target.value)
                        if (pdfGroupByError) {
                          setPdfGroupByError("")
                        }
                      }}
                      options={[
                        { value: "", label: "Select group by" },
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

                  {pdfGroupByError && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{pdfGroupByError}</div>
                  )}

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
                    disabled={runPdfGenerationLoading || !pdfGroupBy}
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isArExportDownloadMode ? "Export AR Report" : "Run AR Generation"}
                  </h3>
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
                  {exportArActionError && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{exportArActionError}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <ButtonModule
                    variant="outline"
                    size="md"
                    onClick={handleCloseExportArModal}
                    disabled={isExportArActionLoading}
                    className="flex-1"
                  >
                    Cancel
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="md"
                    onClick={isArExportDownloadMode ? handleExportArCsv : handleExportAr}
                    disabled={isExportArActionLoading}
                    className="flex-1"
                    icon={<FileDown />}
                  >
                    {isExportArActionLoading
                      ? isArExportDownloadMode
                        ? "Exporting..."
                        : "Running..."
                      : isArExportDownloadMode
                      ? "Export AR"
                      : "Run AR Generation"}
                  </ButtonModule>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        <DownloadScheduleRunPDFModal
          isOpen={downloadPdfRunId !== null}
          onClose={() => setDownloadPdfRunId(null)}
          runId={downloadPdfRunId ?? 0}
        />
      </section>
    </>
  )
}

export default FileManagementPage
