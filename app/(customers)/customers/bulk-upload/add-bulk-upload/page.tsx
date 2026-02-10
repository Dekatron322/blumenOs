"use client"

import React, { useCallback, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  createFileIntent,
  finalizeFile,
  processCustomerBulkUpload,
  processCustomerFeederUpdateBulkUpload,
  processCustomerInfoUpdateBulkUpload,
  processCustomerSetupBulkUpload,
  processCustomerSrdtUpdateBulkUpload,
  processCustomerStatusChangeBulkUpload,
  processCustomerStoredAverageUpdateBulkUpload,
  processCustomerTariffChangeBulkUpload,
  processExistingCustomerBulkUpload,
  processMeterReadingStoredAverageUpdateBulkUpload,
  processPostpaidEstimatedConsumptionBulkUpload,
  processStatusCodesBulkUpload,
} from "lib/redux/fileManagementSlice"
import * as XLSX from "xlsx"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { CloudUpload } from "lucide-react"
import { VscAdd } from "react-icons/vsc"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

const FileManagementPage = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { fileIntentLoading, fileIntentError, finalizeFileLoading, finalizeFileError, customerBulkUploadError } =
    useAppSelector((state: { fileManagement: any }) => state.fileManagement)

  // Upload type options
  const uploadTypeOptions = [
    { name: "New Customers", value: 1 },
    { name: "Import Existing Customers", value: 23 },
    { name: "Customer Info Update", value: 5 },
    // { name: "Customer Feeder Update", value: 6 },
    { name: "Customer Tariff Change", value: 7 },
    { name: "Customer Status Change", value: 8 },
    { name: "Customer Stored Average Update", value: 9 },
    { name: "Customer SRDT Update", value: 10 },
    { name: "Customer Estimated Consumption", value: 24 },
  ]

  // Helper function to get bulkInsertType based on upload type
  const getBulkInsertType = (uploadType: number | null): string => {
    switch (uploadType) {
      case 1:
        return "customers"
      case 23:
        return "customer-existing-import"
      case 5:
        return "customer-info"
      case 6:
        return "customer-feeder"
      case 7:
        return "customer-tariff"
      case 8:
        return "customer-status-change"
      case 9:
        return "customer-stored-average"
      case 10:
        return "customer-srdt"
      case 16:
        return "meter-reading-stored-average"
      case 24:
        return "postpaid-estimated-consumption"
      default:
        return "customers" // fallback
    }
  }

  // Helper function to get purpose based on upload type
  const getPurpose = (uploadType: number | null): string => {
    switch (uploadType) {
      case 1:
        return "customers-bulk-import"
      case 23:
        return "customers-existing-import-bulk"
      case 5:
        return "customers-info-update-bulk"
      case 6:
        return "customers-feeder-update-bulk"
      case 7:
        return "customers-tariff-change-bulk"
      case 8:
        return "customers-status-change-bulk"
      case 9:
        return "customers-stored-average-bulk"
      case 10:
        return "customers-srdt-bulk"
      case 16:
        return "meter-reading-stored-average-bulk"
      case 24:
        return "postpaid-estimated-consumption-bulk"
      default:
        return "customers-bulk-import"
    }
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedUploadType, setSelectedUploadType] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [finalizedFile, setFinalizedFile] = useState<any>(null)
  const [bulkUploadProcessed, setBulkUploadProcessed] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hasCompletedUploadTypeSelection, setHasCompletedUploadTypeSelection] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
            console.log("CSV text content (first 200 chars):", text.substring(0, 200))

            const lines = text.split("\n")
            console.log("CSV lines count:", lines.length)
            console.log("First line:", lines[0])

            if (lines.length > 0) {
              const headers = lines[0]!.split(",").map((h) => h.trim().replace(/"/g, ""))
              console.log("Parsed headers:", headers)
              const filteredHeaders = headers.filter((header) => header && header !== "")
              console.log("Filtered headers:", filteredHeaders)
              resolve(filteredHeaders)
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
              const headers = jsonData[0] as string[]
              resolve(headers.filter((header) => header && header.toString().trim() !== ""))
            } else {
              resolve([])
            }
          }
        } catch (error) {
          console.error("Error reading file:", error)
          resolve([])
        }
      }

      reader.onerror = (error) => {
        console.error("FileReader error:", error)
        resolve([])
      }

      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        console.log("Reading file as text")
        reader.readAsText(file)
      } else {
        console.log("Reading file as array buffer")
        reader.readAsArrayBuffer(file)
      }
    })
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError(null)
      setUploadSuccess(false)
      setFinalizedFile(null)
      setUploadProgress(null)
      // Don't reset upload type when new file is selected - only reset on manual change
    }
  }, [])

  // Handle file drop
  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file) {
        setSelectedFile(file)
        setUploadError(null)
        setUploadSuccess(false)
        setFinalizedFile(null)
        setUploadProgress(null)
        // Don't reset upload type when new file is dropped - only reset on manual change
      }
    }
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  // Handle drag enter
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setIsDragOver(true)
  }, [])

  // Handle drag exit
  const handleDragExit = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setIsDragOver(false)
  }, [])

  // Remove selected file
  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null)
    setUploadError(null)
    setUploadSuccess(false)
    setFinalizedFile(null)
    setUploadProgress(null)
    setSelectedUploadType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  // Calculate file checksum (simple implementation)
  const calculateChecksum = async (file: File): Promise<string> => {
    // For now, return a simple hash - in production, use SHA-256
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Start upload process
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return
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
    setUploadProgress(null)

    try {
      console.log("=== Extracting Columns ===")
      // Extract columns from the uploaded file
      const extractedColumns = await extractColumnsFromFile(selectedFile)

      console.log("Extracted columns result:", extractedColumns)
      console.log("Extracted columns length:", extractedColumns.length)

      if (extractedColumns.length === 0) {
        // Show error notification
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
        contentType: selectedFile.type,
        sizeBytes: selectedFile.size,
        purpose: getPurpose(selectedUploadType),
        checksum,
        bulkInsertType: getBulkInsertType(selectedUploadType),
        jobType: selectedUploadType,
        columns: paymentColumns,
      }

      // Debug: Log what we're sending
      console.log("=== Final Intent Request ===")
      console.log("Sending intent request:", intentRequest)

      let intentResult
      try {
        intentResult = await dispatch(createFileIntent(intentRequest)).unwrap()
      } catch (error: any) {
        console.log("API Call Failed:", error)
        console.log("Error details:", error.message)
        if (error.response) {
          console.log("Response data:", error.response.data)
          console.log("Response status:", error.response.status)
        }
        // Show error notification
        notify("error", "Upload Failed", {
          description: error.message || "Failed to create file intent",
          duration: 5000,
        })
        throw error
      }

      if (!intentResult.isSuccess) {
        console.log("API Response Error:", intentResult)
        // Show error notification
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

      return new Promise<void>((resolve, reject) => {
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

              // Show success notification
              notify("success", "Upload Successfully Queued!", {
                description: `File ${selectedFile.name} has been queued for processing`,
                duration: 5000,
              })

              // Step 4: Process bulk upload
              console.log("=== Processing Bulk Upload ===")
              try {
                let bulkResult

                // Use different endpoint based on upload type
                if (selectedUploadType === 23) {
                  // Import Existing Customers
                  bulkResult = await dispatch(processExistingCustomerBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 5) {
                  // Customer Info Update
                  bulkResult = await dispatch(processCustomerInfoUpdateBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 6) {
                  // Customer Feeder Update
                  bulkResult = await dispatch(processCustomerFeederUpdateBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 7) {
                  // Customer Tariff Change
                  bulkResult = await dispatch(processCustomerTariffChangeBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 8) {
                  // Customer Status Code Change
                  bulkResult = await dispatch(processStatusCodesBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 9) {
                  // Customer Stored Average Update
                  bulkResult = await dispatch(processCustomerStoredAverageUpdateBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 10) {
                  // Customer SRDT Update
                  bulkResult = await dispatch(processCustomerSrdtUpdateBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 16) {
                  // Customer Bill Energy
                  bulkResult = await dispatch(processMeterReadingStoredAverageUpdateBulkUpload({ fileId })).unwrap()
                } else if (selectedUploadType === 24) {
                  // Customer Estimated Consumption
                  bulkResult = await dispatch(processPostpaidEstimatedConsumptionBulkUpload({ fileId })).unwrap()
                } else {
                  // Regular Customer Import and other types
                  bulkResult = await dispatch(processCustomerBulkUpload({ fileId })).unwrap()
                }

                if (!bulkResult.isSuccess) {
                  throw new Error(bulkResult.message)
                }

                setBulkUploadProcessed(true)
                console.log("=== Bulk Upload Complete ===")
                console.log("Bulk upload data:", bulkResult.data)

                // Show bulk upload success notification
                notify("success", "Processing Started!", {
                  description: `${bulkResult.data?.succeededRows || 0} customer records queued for processing`,
                  duration: 6000,
                })
              } catch (bulkError) {
                console.error("Bulk upload failed:", bulkError)
                // Show error notification
                notify("error", "Bulk Upload Failed", {
                  description: bulkError instanceof Error ? bulkError.message : "Failed to process bulk upload",
                  duration: 5000,
                })
                setUploadError(bulkError instanceof Error ? bulkError.message : "Failed to process bulk upload")
              }

              resolve()
            } catch (finalizeError) {
              console.error("Finalize error:", finalizeError)
              // Show error notification
              notify("error", "Finalization Failed", {
                description: finalizeError instanceof Error ? finalizeError.message : "Failed to finalize upload",
                duration: 5000,
              })
              setUploadError(finalizeError instanceof Error ? finalizeError.message : "Failed to finalize upload")
              reject(finalizeError)
            }
          } else {
            const error = new Error(`Upload failed with status ${xhr.status}`)
            // Show error notification
            notify("error", "Upload Failed", {
              description: `Upload failed with status ${xhr.status}`,
              duration: 5000,
            })
            reject(error)
          }
        })

        xhr.addEventListener("error", () => {
          const error = new Error("Network error during upload")
          // Show error notification
          notify("error", "Network Error", {
            description: "Network error during upload",
            duration: 5000,
          })
          reject(error)
        })

        // Open and send the request
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", selectedFile.type)
        xhr.send(selectedFile)
      })
    } catch (error) {
      console.error("Upload process error:", error)
      // Show error notification
      notify("error", "Upload Failed", {
        description: error instanceof Error ? error.message : "Upload failed",
        duration: 5000,
      })
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, dispatch, selectedUploadType, extractColumnsFromFile])

  // Reset form
  const handleReset = useCallback(() => {
    setSelectedFile(null)
    setUploadProgress(null)
    setIsUploading(false)
    setUploadError(null)
    setUploadSuccess(false)
    setFinalizedFile(null)
    setBulkUploadProcessed(false)
    setIsDragOver(false)
    setIsDragging(false)
    setSelectedUploadType(null)
    setHasCompletedUploadTypeSelection(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    dispatch({ type: "fileManagement/resetFileManagementState" })
  }, [dispatch])

  // Generate and download sample CSV file
  const downloadSampleFile = useCallback(() => {
    let headers: string
    let sampleRows: string[]

    // Generate different templates based on upload type
    if (selectedUploadType === 23) {
      // Import Existing Customers template
      headers =
        "CustomerName,CustomerAccountNo,CustomerAddress1,CustomerAddress2,CustomerCity,CustomerState,TelephoneNumber,Tariff,FeederName,Transformers,DTNumber,TechnicalEngineer,EmployeeNo,AreaOffice,ServiceCenter,StoredAverage,OpeningBalance,IsPPM,Longitute,Latitude,MotherAccountNumber,IsSeperation,EmailAdddress,StatusCode,Error"
      sampleRows = []
    } else if (selectedUploadType === 5) {
      // Customer Tariff Change template
      headers = "CustomerAccountNo,TariffCode"
      sampleRows = []
    } else if (selectedUploadType === 8) {
      // Customer Status Code Change template
      headers = "CustomerAccountNo,StatusCodeChange"
      sampleRows = []
    } else if (selectedUploadType === 9) {
      // Customer Stored Average Update template
      headers = "CustomerAccountNo,TariffCode"
      sampleRows = []
    } else if (selectedUploadType === 10) {
      // Customer SR DT Update template
      headers = "DssCode,EmployeeNo,CustomerAccountNo"
      sampleRows = []
    } else if (selectedUploadType === 16) {
      // Customer Bill Energy template
      headers = "CustomerAccountNo,CustomerStoredAverage,MonthYear"
      sampleRows = []
    } else if (selectedUploadType === 24) {
      // Postpaid Estimated Consumption template
      headers = "CustomerAccountNo,EstimatedConsumptionKwh,MonthYear"
      sampleRows = []
    } else {
      // Default template for other upload types
      headers = "CustomerAccountNo,CustomerName,Address,Phone,Email,TariffCode,FeederCode,Status"
      sampleRows = []
    }

    const sampleData = [headers, ...sampleRows].join("\n")

    const blob = new Blob([sampleData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      selectedUploadType === 23
        ? "sample-import-existing-customers.csv"
        : selectedUploadType === 7
        ? "sample-customer-tariff-change.csv"
        : selectedUploadType === 8
        ? "sample-customer-status-code-change.csv"
        : selectedUploadType === 9
        ? "sample-customer-stored-average-update.csv"
        : selectedUploadType === 10
        ? "sample-customer-sr-dt-update.csv"
        : selectedUploadType === 16
        ? "sample-customer-bill-energy.csv"
        : selectedUploadType === 24
        ? "sample-postpaid-estimated-consumption.csv"
        : "sample_customers_bulk.csv"
    )
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [selectedUploadType])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 md:py-4 2xl:px-16">
            {/* Page Header - Mobile Optimized */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 sm:hidden"
                    aria-label="Go back"
                  >
                    <svg
                      width="1em"
                      height="1em"
                      viewBox="0 0 17 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="new-arrow-right rotate-180 transform"
                    >
                      <path
                        d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Bulk Upload Customers</h1>
                    <p className="text-sm text-gray-600">Upload customer records in bulk using CSV or Excel files</p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule variant="outline" size="sm" onClick={() => router.push("/customers/bulk-upload")}>
                    Go to Bulk Upload Page
                  </ButtonModule>
                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isUploading || uploadSuccess}
                  >
                    Reset Form
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      void handleUpload()
                    }}
                    disabled={
                      !selectedFile ||
                      !selectedUploadType ||
                      isUploading ||
                      uploadSuccess ||
                      fileIntentLoading ||
                      finalizeFileLoading
                    }
                    icon={<VscAdd />}
                    iconPosition="start"
                  >
                    {isUploading ? "Uploading..." : "Upload File"}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-lg bg-white p-4 shadow-sm sm:p-6"
              >
                {/* Upload Type Selection - Only show if user hasn't completed initial selection */}
                {!hasCompletedUploadTypeSelection && (
                  <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 bg-[#f9f9f9] p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Select Upload Type</h3>
                    <p className="mb-6 text-sm text-gray-600">
                      Choose the type of customer bulk upload you want to perform. This determines how the system will
                      process your file.
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {uploadTypeOptions.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setSelectedUploadType(type.value)
                            setHasCompletedUploadTypeSelection(true)
                          }}
                          className="rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{type.name}</h4>
                              {/* <p className="mt-1 text-xs text-gray-500">Type {type.value}</p> */}
                            </div>
                            <div className="flex size-8 items-center justify-center rounded-full border-2 border-gray-300">
                              {selectedUploadType === type.value && <div className="size-4 rounded-full bg-blue-600" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload Area - Only show after upload type selection is completed */}
                {hasCompletedUploadTypeSelection && selectedUploadType && (
                  <>
                    {/* Selected Upload Type Display */}
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">Selected Upload Type</h3>
                          <p className="text-sm text-blue-600">
                            {uploadTypeOptions.find((t) => t.value === selectedUploadType)?.name} (Type{" "}
                            {selectedUploadType})
                          </p>
                        </div>
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUploadType(null)
                            setHasCompletedUploadTypeSelection(false)
                          }}
                        >
                          Change Type
                        </ButtonModule>
                      </div>
                    </div>

                    {/* Template Download */}
                    <div className="mb-6 rounded-lg bg-blue-50 p-4">
                      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                          <p className="text-sm text-blue-600">
                            Download our customer CSV template with the required columns for the selected upload type.
                          </p>
                        </div>
                        <ButtonModule variant="primary" size="sm" onClick={downloadSampleFile}>
                          Download Template
                        </ButtonModule>
                      </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 bg-[#f9f9f9] p-6 text-center sm:p-8">
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                        className="hidden"
                      />

                      {!selectedFile ? (
                        <div>
                          <svg
                            className="mx-auto size-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <div className="mt-4 flex w-full flex-col items-center justify-center">
                            <ButtonModule variant="primary" onClick={() => fileInputRef.current?.click()}>
                              Choose File
                            </ButtonModule>
                            <p className="mt-2 text-sm text-gray-600">or drag and drop your file here</p>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Supports CSV, Excel (.xlsx, .xls) files (max 50MB)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <svg
                            className="mx-auto size-12 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="mt-2 text-sm font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown type"}
                          </p>
                          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                            <ButtonModule
                              variant="secondary"
                              onClick={removeSelectedFile}
                              disabled={
                                isUploading ||
                                (!!uploadProgress &&
                                  uploadProgress.percentage !== 100 &&
                                  !uploadError &&
                                  !fileIntentError &&
                                  !finalizeFileError &&
                                  !customerBulkUploadError)
                              }
                            >
                              Choose Different File
                            </ButtonModule>
                            <ButtonModule
                              variant="primary"
                              onClick={() => {
                                void handleUpload()
                              }}
                              disabled={
                                isUploading ||
                                uploadSuccess ||
                                !!uploadProgress ||
                                !selectedUploadType ||
                                fileIntentLoading ||
                                finalizeFileLoading
                              }
                            >
                              {isUploading ? "Uploading..." : "Upload File"}
                            </ButtonModule>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress && (
                      <div
                        className={`mb-6 rounded-lg border p-4 ${
                          uploadProgress.percentage === 100
                            ? "border-green-200 bg-green-50"
                            : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="mb-3 flex items-center">
                          <div
                            className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
                              uploadProgress.percentage === 100 ? "bg-green-100" : "bg-blue-100"
                            }`}
                          >
                            <CloudUpload
                              className={`h-4 w-4 ${
                                uploadProgress.percentage === 100 ? "text-green-600" : "animate-pulse text-blue-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                uploadProgress.percentage === 100 ? "text-green-900" : "text-blue-900"
                              }`}
                            >
                              {uploadProgress.percentage === 100 ? "Upload complete!" : "Uploading file..."}
                            </p>
                            <p
                              className={`text-xs ${
                                uploadProgress.percentage === 100 ? "text-green-700" : "text-blue-700"
                              }`}
                            >
                              {uploadProgress.percentage}% complete
                            </p>
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              uploadProgress.percentage === 100 ? "text-green-800" : "text-blue-800"
                            }`}
                          >
                            {uploadProgress.percentage}%
                          </span>
                        </div>
                        <div
                          className={`h-2 w-full rounded-full ${
                            uploadProgress.percentage === 100 ? "bg-green-200" : "bg-blue-200"
                          }`}
                        >
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ease-out ${
                              uploadProgress.percentage === 100 ? "bg-green-600" : "bg-blue-600"
                            }`}
                            style={{ width: `${uploadProgress.percentage}%` }}
                          />
                        </div>
                        <p
                          className={`mt-2 text-xs ${
                            uploadProgress.percentage === 100 ? "text-green-700" : "text-blue-700"
                          }`}
                        >
                          {formatFileSize(uploadProgress.loaded)} of {formatFileSize(uploadProgress.total)} uploaded
                        </p>
                      </div>
                    )}

                    {/* Go to Bulk Upload Page - shown after upload progress */}
                    {uploadProgress && uploadProgress.percentage === 100 && (
                      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900">Upload completed successfully!</p>
                            <p className="text-xs text-green-700">View your upload history and manage bulk uploads</p>
                          </div>
                          <ButtonModule
                            variant="primary"
                            size="sm"
                            onClick={() => router.push("/customers/bulk-upload")}
                          >
                            Go to Bulk Upload Page
                          </ButtonModule>
                        </div>
                      </div>
                    )}

                    {/* Error Messages */}
                    {(fileIntentError || uploadError || finalizeFileError || customerBulkUploadError) && (
                      <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <svg className="size-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
                            <div className="mt-2 text-sm text-red-700">
                              {fileIntentError || uploadError || finalizeFileError || customerBulkUploadError}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 shadow-lg sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/customers/bulk-upload")}
              className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
            >
              Go to Bulk Upload Page
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isUploading || uploadSuccess}
              className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                void handleUpload()
              }}
              disabled={
                !selectedFile ||
                !selectedUploadType ||
                isUploading ||
                uploadSuccess ||
                fileIntentLoading ||
                finalizeFileLoading
              }
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FileManagementPage
