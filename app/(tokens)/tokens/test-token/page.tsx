"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { CsvJobsParams, downloadTestToken, fetchCsvJobs } from "lib/redux/fileManagementSlice"
import { VscEye } from "react-icons/vsc"
import CsvUploadFailuresModal from "components/ui/Modal/CsvUploadFailuresModal"
import { useRouter } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { RootState } from "lib/redux/store"
import { clearTestToken as clearTestTokenDataAction, fetchMeters, testToken } from "lib/redux/metersSlice"
import {
  createFileIntent,
  FileIntentResponse,
  finalizeFile,
  processTestTokenBulkUpload,
  resetTestTokenBulkUploadState,
} from "lib/redux/fileManagementSlice"
import { SearchModule } from "components/ui/Search/search-module"
import {
  AlertCircle,
  ChevronRight,
  CloudUpload,
  Download,
  FileIcon,
  FileSpreadsheet,
  Filter,
  Menu,
  RefreshCw,
  Search,
  X,
} from "lucide-react"
import { VscAdd, VscArrowLeft, VscArrowRight, VscChevronLeft, VscChevronRight } from "react-icons/vsc"
import * as XLSX from "xlsx"

interface Meter {
  id: number
  meterID: string
  customerAccountNumber: string
  customerFullName: string
  meterType: number
  meterBrand: string
  isMeterActive: boolean
  status: number
  state: number
  address: string
  city: string
}

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// Job Type options for filters - Test Token related job types
const jobTypeOptions = [{ value: "27", label: "Test Token Import" }]

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

const TestToken = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")

  // Single test token states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [controlValue, setControlValue] = useState(0)
  const [mfrCodeValue, setMfrCodeValue] = useState(0)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Bulk test token states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSV Jobs state
  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [isFailuresModalOpen, setIsFailuresModalOpen] = useState(false)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  // Local state for filters
  const [localFilters, setLocalFilters] = useState<Partial<CsvJobsParams>>({
    PageNumber: 1,
    PageSize: 10,
    JobType: 27, // Default to Test Token Import only
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

  const { meters, loading, error, testTokenLoading, testTokenError, testTokenData } = useAppSelector(
    (state: RootState) => state.meters
  )

  const {
    fileIntent,
    fileIntentLoading,
    fileIntentError,
    finalizeFileLoading,
    testTokenBulkUploadLoading,
    testTokenBulkUploadError,
    testTokenBulkUploadSuccess,
    testTokenBulkUploadResponse,
    csvJobs,
    csvJobsLoading,
    csvJobsError,
    csvJobsSuccess,
    csvJobsPagination,
    downloadCsvLoading,
    downloadTestTokenLoading,
  } = useAppSelector((state: RootState) => state.fileManagement)

  // Search handler function
  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(
        fetchMeters({
          pageNumber: 1,
          pageSize: 10,
          search: searchQuery.trim(),
        })
      )
    }
  }

  // Cleanup function to clear file management data when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearTestTokenDataAction())
      dispatch(resetTestTokenBulkUploadState())
    }
  }, [dispatch])

  // Initial load and filter changes for CSV jobs
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

  const handleMeterSelect = (meter: Meter) => {
    setSelectedMeter(meter)
  }

  const handleTestToken = async () => {
    if (!selectedMeter) {
      notify("error", "Please select a meter first")
      return
    }

    try {
      const result = await dispatch(
        testToken({
          id: selectedMeter.id,
          requestData: {
            control: controlValue,
            mfrcode: mfrCodeValue,
          },
        })
      )
      if (result.meta.requestStatus === "fulfilled") {
        notify("success", "Test token generated successfully")
      } else {
        notify("error", result.payload as string)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to generate test token")
    }
  }

  const handleCopyToken = async () => {
    if (testTokenData?.tokenDec) {
      try {
        await navigator.clipboard.writeText(testTokenData.tokenDec)
        setCopiedToken(true)
        notify("success", "Token copied to clipboard")
        setTimeout(() => setCopiedToken(false), 2000)
      } catch (error) {
        notify("error", "Failed to copy token")
      }
    }
  }

  const handleRetry = () => {
    if (searchQuery.trim()) {
      dispatch(
        fetchMeters({
          pageNumber: 1,
          pageSize: 10,
          search: searchQuery.trim(),
        })
      )
    }
  }

  // Filter jobs to only show test token job types
  const testTokenJobTypes = [27] // Test Token job type values
  const filteredCsvJobs = csvJobs.filter((job) => testTokenJobTypes.includes(job.jobType))

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (!e.target.value.trim()) {
      setSelectedMeter(null)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      notify("error", "File size must be less than 10MB")
      return
    }
    if (!file.name.match(/\.(csv|xlsx|xls)$/)) {
      notify("error", "Only CSV and Excel files are allowed")
      return
    }
    setSelectedFile(file)
    setUploadError(null)
    setUploadSuccess(false)
    dispatch(resetTestTokenBulkUploadState())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      notify("error", "Please select a file first")
      return
    }

    try {
      // Step 1: Create file intent
      const fileIntentRequest = {
        fileName: selectedFile.name,
        contentType: selectedFile.type,
        sizeBytes: selectedFile.size,
        purpose: "meters-test-token",
        checksum: await calculateFileChecksum(selectedFile),
        bulkInsertType: "test-token",
        columns: ["meterNumber"], // Required columns for test token
      }

      const intentResult = await dispatch(createFileIntent(fileIntentRequest))
      if (intentResult.meta.requestStatus !== "fulfilled") {
        throw new Error((intentResult.payload as string) || "Failed to create file intent")
      }

      const { fileId, uploadUrl } = (intentResult.payload as FileIntentResponse).data

      // Step 2: Upload file to S3
      setIsUploading(true)
      const uploadProgress = simulateUploadProgress()

      await uploadFileToS3(uploadUrl, selectedFile, (progress) => {
        setUploadProgress(progress)
      })

      // Step 3: Finalize file
      const finalizeResult = await dispatch(finalizeFile(fileId))
      if (finalizeResult.meta.requestStatus !== "fulfilled") {
        throw new Error((finalizeResult.payload as string) || "Failed to finalize file")
      }

      // Step 4: Process test token bulk upload
      const bulkUploadResult = await dispatch(processTestTokenBulkUpload({ fileId }))
      if (bulkUploadResult.meta.requestStatus === "fulfilled") {
        setUploadSuccess(true)
        notify("success", "Bulk test token processed successfully")
        setSelectedFile(null)
      } else {
        throw new Error((bulkUploadResult.payload as string) || "Failed to process bulk test token")
      }
    } catch (error: any) {
      setUploadError(error.message || "Failed to process bulk test token")
      notify("error", error.message || "Failed to process bulk test token")
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  // Helper function to calculate file checksum
  const calculateFileChecksum = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Helper function to simulate upload progress
  const simulateUploadProgress = (): void => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }
      setUploadProgress({ loaded: progress, total: 100, percentage: Math.round(progress) })
    }, 200)
  }

  // Helper function to upload file to S3
  const uploadFileToS3 = async (
    url: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const percentage = Math.round((event.loaded / event.total) * 100)
          onProgress({ loaded: event.loaded, total: event.total, percentage })
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"))
      })

      xhr.open("PUT", url)
      xhr.send(file)
    })
  }

  // Helper function to download sample CSV template
  const downloadSampleTemplate = () => {
    const csvContent = "meterNumber\n14537792120"
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "test-token-template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetBulkUpload = () => {
    setSelectedFile(null)
    setUploadError(null)
    setUploadSuccess(false)
    setUploadProgress(null)
    dispatch(resetTestTokenBulkUploadState())
  }

  const handleClearFilters = () => {
    resetFilters()
  }

  const handleApplyFilters = () => {
    applyFilters()
  }

  // CSV Jobs helper functions
  const handleSearchJobs = useCallback(() => {
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
      JobType: 27, // Default to Test Token Import only
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
    // First try to find in the options array
    const option = jobTypeOptions.find((opt) => opt.value === jobType.toString())
    if (option) {
      return option.label
    }

    // Fallback for known job types
    if (jobType === 27) {
      return "Test Token Import"
    }

    return `Type ${jobType}`
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
        return "text-orange-600 bg-orange-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const handleViewFailures = (job: any) => {
    setSelectedJob(job)
    setIsFailuresModalOpen(true)
  }

  const handleDownloadCsv = async (job: any) => {
    try {
      const result = await dispatch(downloadTestToken({ id: job.id }))
      if (downloadTestToken.fulfilled.match(result)) {
        notify("success", "CSV downloaded successfully")
      } else {
        throw new Error(result.payload as string)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to download CSV")
    }
  }

  const handleCloseFailuresModal = () => {
    setIsFailuresModalOpen(false)
    setSelectedJob(null)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <>
      <DashboardNav />
      <div className="min-h-screen bg-gray-50">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Test Token</h1>
              <p className="mt-2 text-gray-600">Generate test tokens for individual meters or bulk operations</p>
            </div>

            {/* Tab Selection */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setActiveTab("single")}
                className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-200 ${
                  activeTab === "single"
                    ? "border-[#004B23] bg-gradient-to-br from-[#004B23]/5 to-[#004B23]/10 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      activeTab === "single" ? "bg-[#004B23] text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Search className="size-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Single Test Token</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Generate test tokens for individual meters using search
                    </p>
                    {activeTab === "single" && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-[#004B23] px-2 py-1 text-xs font-medium text-white">
                          Active
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {activeTab === "single" && (
                  <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-[#004B23]/10" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("bulk")}
                className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-200 ${
                  activeTab === "bulk"
                    ? "border-[#004B23] bg-gradient-to-br from-[#004B23]/5 to-[#004B23]/10 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      activeTab === "bulk" ? "bg-[#004B23] text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <CloudUpload className="size-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Bulk Test Token</h3>
                    <p className="mt-1 text-sm text-gray-600">Upload CSV file for bulk test token generation</p>
                    {activeTab === "bulk" && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-[#004B23] px-2 py-1 text-xs font-medium text-white">
                          Active
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {activeTab === "bulk" && (
                  <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-[#004B23]/10" />
                )}
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "single" ? (
                <motion.div
                  key="single"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Single Test Token Content */}
                  <div className="mb-6">
                    <SearchModule
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onSearch={handleSearch}
                      placeholder="Search by meter number, customer account number, or customer name..."
                      height="h-12"
                      className="w-full md:w-auto"
                    />
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-red-800">Error searching meters</h3>
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          onClick={handleRetry}
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          Retry
                        </ButtonModule>
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <div className="mb-6 flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-sm text-gray-600">Searching meters...</span>
                      </div>
                    </div>
                  )}

                  {/* Search Results */}
                  {meters && meters.length > 0 && !loading && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-medium text-gray-900">Search Results</h3>
                      <div className="space-y-2">
                        {meters.map((meter) => (
                          <div
                            key={meter.id}
                            onClick={() => handleMeterSelect(meter)}
                            className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                              selectedMeter?.id === meter.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{meter.meterID}</span>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                      meter.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {meter.status === 1 ? "active" : "inactive"}
                                  </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                  <p>Customer: {meter.customerFullName}</p>
                                  <p>Account: {meter.customerAccountNumber}</p>
                                  <p>
                                    Address: {meter.address}, {meter.city}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ButtonModule variant="outline" onClick={() => handleMeterSelect(meter)}>
                                  Continue
                                </ButtonModule>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Meter Details */}
                  {selectedMeter && (
                    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                      <h3 className="mb-4 text-lg font-medium text-gray-900">Selected Meter</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Meter ID</p>
                          <p className="text-sm text-gray-900">{selectedMeter.meterID}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Customer Name</p>
                          <p className="text-sm text-gray-900">{selectedMeter.customerFullName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Account Number</p>
                          <p className="text-sm text-gray-900">{selectedMeter.customerAccountNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <p className="text-sm text-gray-900">{selectedMeter.status === 1 ? "active" : "inactive"}</p>
                        </div>
                      </div>

                      {/* Test Token Parameters */}
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Control Value</label>
                          <FormInputModule
                            type="number"
                            value={controlValue}
                            onChange={(e) => setControlValue(parseInt(e.target.value) || 0)}
                            placeholder="Enter control value"
                            className="w-full"
                            label={""}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">MFR Code Value</label>
                          <FormInputModule
                            type="number"
                            value={mfrCodeValue}
                            onChange={(e) => setMfrCodeValue(parseInt(e.target.value) || 0)}
                            placeholder="Enter MFR code value"
                            className="w-full"
                            label={""}
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <ButtonModule
                          onClick={handleTestToken}
                          disabled={testTokenLoading}
                          className="w-full sm:w-auto"
                        >
                          {testTokenLoading ? "Generating Test Token..." : "Generate Test Token"}
                        </ButtonModule>
                      </div>
                    </div>
                  )}

                  {/* Test Token Result */}
                  {testTokenData && (
                    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                      <h3 className="mb-4 text-lg font-medium text-gray-900">Test Token Result</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Token Decimal</p>
                          <div className="mt-1 flex items-center gap-2">
                            <p className="font-mono text-sm text-gray-900">{testTokenData.tokenDec}</p>
                            <ButtonModule
                              variant="outline"
                              size="sm"
                              onClick={handleCopyToken}
                              className="border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                              {copiedToken ? "Copied!" : "Copy"}
                            </ButtonModule>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Token Hex</p>
                          <p className="mt-1 font-mono text-sm text-gray-900">{testTokenData.tokenHex}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">DRN</p>
                          <p className="mt-1 text-sm text-gray-900">{testTokenData.drn}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">PAN</p>
                          <p className="mt-1 text-sm text-gray-900">{testTokenData.pan}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Description</p>
                          <p className="mt-1 text-sm text-gray-900">{testTokenData.description}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Token Class</p>
                          <p className="mt-1 text-sm text-gray-900">{testTokenData.tokenClass}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test Token Error */}
                  {testTokenError && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                      <h3 className="text-sm font-medium text-red-800">Error generating test token</h3>
                      <p className="text-sm text-red-600">{testTokenError}</p>
                    </div>
                  )}

                  {/* No Results */}
                  {searchQuery && !loading && meters && meters.length === 0 && !error && (
                    <div className="mb-6 py-8 text-center">
                      <p className="text-sm text-gray-600">No meters found matching &ldquo;{searchQuery}&ldquo;</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="bulk"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Bulk Test Token Content */}
                  <div className="mb-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Upload File</h3>
                        <p className="text-sm text-gray-600">
                          Upload a CSV file with meter numbers to generate test tokens
                        </p>
                      </div>
                      <ButtonModule
                        onClick={downloadSampleTemplate}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <FileSpreadsheet className="size-4" />
                        Download Template
                      </ButtonModule>
                    </div>
                    <div
                      className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                        isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <p className="text-lg font-medium text-gray-900">
                          {selectedFile ? selectedFile.name : "Drop your file here, or click to browse"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">Supports CSV and Excel files (.csv, .xlsx, .xls)</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        <ButtonModule
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="mx-auto mt-4"
                        >
                          {selectedFile ? "Change File" : "Select File"}
                        </ButtonModule>
                      </div>
                    </div>
                  </div>

                  {/* Upload Error */}
                  {uploadError && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                      <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
                      <p className="text-sm text-red-600">{uploadError}</p>
                    </div>
                  )}

                  {/* File Intent Error */}
                  {fileIntentError && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                      <h3 className="text-sm font-medium text-red-800">File Intent Error</h3>
                      <p className="text-sm text-red-600">{fileIntentError}</p>
                    </div>
                  )}

                  {/* Test Token Bulk Upload Error */}
                  {testTokenBulkUploadError && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                      <h3 className="text-sm font-medium text-red-800">Bulk Upload Error</h3>
                      <p className="text-sm text-red-600">{testTokenBulkUploadError}</p>
                    </div>
                  )}

                  {/* Upload Success */}
                  {uploadSuccess && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                      <h3 className="text-sm font-medium text-green-800">Success</h3>
                      <p className="text-sm text-green-600">Bulk test token processed successfully</p>
                      {testTokenBulkUploadResponse && (
                        <div className="mt-2 text-sm text-green-600">
                          <p>Job ID: {testTokenBulkUploadResponse.data.id}</p>
                          <p>Status: {testTokenBulkUploadResponse.data.status === 1 ? "Processing" : "Completed"}</p>
                          <p>Total Rows: {testTokenBulkUploadResponse.data.totalRows}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Progress */}
                  {(isUploading || fileIntentLoading || finalizeFileLoading || testTokenBulkUploadLoading) && (
                    <div className="mb-6">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {fileIntentLoading
                            ? "Preparing file..."
                            : finalizeFileLoading
                            ? "Finalizing file..."
                            : testTokenBulkUploadLoading
                            ? "Processing bulk test token..."
                            : "Uploading file..."}
                        </span>
                        <span className="text-sm text-gray-500">
                          {uploadProgress ? `${uploadProgress.percentage}%` : "0%"}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                          style={{ width: uploadProgress ? `${uploadProgress.percentage}%` : "0%" }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <ButtonModule
                      onClick={handleBulkUpload}
                      disabled={
                        !selectedFile ||
                        isUploading ||
                        fileIntentLoading ||
                        finalizeFileLoading ||
                        testTokenBulkUploadLoading
                      }
                      className="flex-1 sm:flex-none"
                    >
                      {isUploading || fileIntentLoading || finalizeFileLoading || testTokenBulkUploadLoading
                        ? "Processing..."
                        : "Process Bulk Test"}
                    </ButtonModule>
                    {(selectedFile || uploadSuccess) && (
                      <ButtonModule
                        onClick={resetBulkUpload}
                        variant="outline"
                        disabled={isUploading || fileIntentLoading || finalizeFileLoading || testTokenBulkUploadLoading}
                        className="flex-1 sm:flex-none"
                      >
                        Reset
                      </ButtonModule>
                    )}
                  </div>

                  {/* Queued Jobs Section */}
                  <div className="mt-8">
                    <div className="mb-6 rounded-lg border bg-white">
                      {/* Results Header */}
                      <div className="border-b p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">Test Token Jobs</h3>
                            {csvJobsPagination && (
                              <p className="text-sm text-gray-600">
                                Showing {filteredCsvJobs.length} of {csvJobsPagination.totalCount} jobs
                              </p>
                            )}
                          </div>
                          <ButtonModule
                            variant="outline"
                            onClick={handleRefreshTableData}
                            disabled={csvJobsLoading}
                            size="sm"
                          >
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

                      {/* Filters Section */}
                      <div className="border-b p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-sm font-medium">Filters</h4>
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
                              <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                                Search
                              </label>
                              <SearchModule
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={handleSearchJobs}
                                placeholder="Search jobs..."
                                className="w-full md:w-auto"
                                bgClassName="bg-white"
                                searchTypeOptions={undefined}
                                onSearchTypeChange={undefined}
                              />
                            </div>

                            {/* Status Filter */}
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                                Status
                              </label>
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
                              <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                                Has Failures
                              </label>
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

                            {/* Action Buttons */}
                            <div className="flex items-end gap-2">
                              <button
                                onClick={applyFilters}
                                className="button-filled flex-1 rounded-md px-3 py-2 text-sm"
                              >
                                Apply
                              </button>
                              <button
                                onClick={resetFilters}
                                className="button-outlined flex-1 rounded-md px-3 py-2 text-sm"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        )}
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
                                      <p>No test token jobs found</p>
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
                                    <td className="whitespace-nowrap border-b p-3 text-sm">
                                      {getJobTypeLabel(job.jobType)}
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
                                        {job.failedRows !== null && job.failedRows !== undefined
                                          ? job.failedRows
                                          : "N/A"}
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
                                        <ButtonModule
                                          variant="outline"
                                          size="sm"
                                          icon={<Download className="h-4 w-4" />}
                                          onClick={() => handleDownloadCsv(job)}
                                          className="whitespace-nowrap"
                                          disabled={downloadCsvLoading}
                                        >
                                          {downloadCsvLoading ? "Downloading..." : "Download"}
                                        </ButtonModule>
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
                                <VscChevronLeft className="size-4" />
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
                                <VscChevronRight className="size-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CSV Jobs Table */}
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
    </>
  )
}

export default TestToken
