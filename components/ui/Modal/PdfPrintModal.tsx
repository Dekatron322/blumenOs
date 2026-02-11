"use client"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CloudUpload, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { createFileIntent, finalizeFile, processPrintBulkUpload } from "lib/redux/fileManagementSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { fetchCountries } from "lib/redux/countriesSlice"
import { selectAllProvinces } from "lib/redux/countriesSlice"
import * as XLSX from "xlsx"

import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { SingleBillingPrintRequest } from "lib/redux/postpaidSlice"

const groupByOptions = [
  { value: "1", label: "Feeder" },
  { value: "2", label: "Area Office" },
  { value: "3", label: "Distribution Substation" },
  { value: "4", label: "Province" },
]

const booleanOptions = [
  { value: "", label: "All" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
]

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface PdfPrintModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SingleBillingPrintRequest) => void
  loading: boolean
  error: string | null
  success: boolean
  message: string | null
  billingPeriods: any[]
  feeders: any[]
}

const PdfPrintModal: React.FC<PdfPrintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  success,
  message,
  billingPeriods,
  feeders,
}) => {
  const dispatch = useAppDispatch()
  const {
    fileIntentLoading,
    fileIntentError,
    finalizeFileLoading,
    finalizeFileError,
    billingBulkUploadLoading,
    billingBulkUploadError,
    printBulkUploadLoading,
    printBulkUploadError,
  } = useAppSelector((state: { fileManagement: any }) => state.fileManagement)

  const { areaOffices, loading: areaOfficesLoading } = useAppSelector(
    (state: { areaOffices: any }) => state.areaOffices
  )
  const {
    distributionSubstations,
    loading: distributionSubstationsLoading,
    error: distributionSubstationsError,
  } = useAppSelector((state: { distributionSubstations: any }) => state.distributionSubstations)
  console.log("Distribution substations state:", {
    distributionSubstations,
    distributionSubstationsLoading,
    distributionSubstationsError,
  })
  const provinces = useAppSelector(selectAllProvinces)
  const { loading: countriesLoading, error: countriesError } = useAppSelector(
    (state: { countries: any }) => state.countries
  )

  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [formData, setFormData] = useState<SingleBillingPrintRequest>({
    billingPeriodId: 0,
    feederId: 0,
    areaOfficeId: 0,
    distributionSubstationId: 0,
    provinceId: 0,
    isMd: true,
    groupBy: 1,
    maxBillsPerFile: 1000,
  })

  // Bulk upload form state
  const [bulkFormData, setBulkFormData] = useState({
    billingPeriodId: 0,
    groupBy: 1,
    maxBillsPerFile: 1000,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [finalizedFile, setFinalizedFile] = useState<any>(null)
  const [bulkUploadProcessed, setBulkUploadProcessed] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: keyof SingleBillingPrintRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleBulkFormChange = (field: keyof typeof bulkFormData, value: any) => {
    setBulkFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Bulk upload helper functions
  const getBulkInsertType = (uploadType: number): string => {
    switch (uploadType) {
      case 20:
        return "bill-finalize"
      default:
        return "bill-finalize"
    }
  }

  const getPurpose = (uploadType: number): string => {
    switch (uploadType) {
      case 20:
        return "postpaid-bill-print-bulk"
      default:
        return "postpaid-bill-print-bulk"
    }
  }

  // Extract column names from Excel or CSV file
  const extractColumnsFromFile = useCallback(async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          if (file.type === "text/csv" || file.name.endsWith(".csv")) {
            const text = e.target?.result as string
            const lines = text.split("\n")
            if (lines.length > 0) {
              const headers = lines[0]!.split(",").map((h) => h.trim().replace(/"/g, ""))
              resolve(headers.filter((header) => header && header !== ""))
            } else {
              resolve([])
            }
          } else {
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
          resolve([])
        }
      }
      reader.onerror = () => resolve([])
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        setSelectedFile(file)
        setUploadError(null)
        setUploadSuccess(false)
        setFinalizedFile(null)
        setUploadProgress(null)
      } else {
        // Handle case where user cancels file selection
        // Keep the current selected file and restore the file input value
        if (fileInputRef.current && selectedFile) {
          // Create a new FileList to restore the file input
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(selectedFile)
          fileInputRef.current.files = dataTransfer.files
        }
      }
    },
    [selectedFile]
  )

  // Handle file drop
  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file) {
        setSelectedFile(file)
        setUploadError(null)
        setUploadSuccess(false)
        setFinalizedFile(null)
        setUploadProgress(null)
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

  // Remove selected file
  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null)
    setUploadError(null)
    setUploadSuccess(false)
    setFinalizedFile(null)
    setUploadProgress(null)
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

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Handle bulk upload (file upload and finalization only)
  const handleBulkUpload = useCallback(async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)
    setUploadProgress(null)

    try {
      // Extract columns from the uploaded file
      const extractedColumns = await extractColumnsFromFile(selectedFile)

      if (extractedColumns.length === 0) {
        notify("error", "File Processing Failed", {
          description: "No columns found in the file. Please ensure your file has headers.",
          duration: 5000,
        })
        throw new Error("No columns found in the file. Please ensure your file has headers.")
      }

      // Use the actual extracted columns from the uploaded file
      const paymentColumns = extractedColumns

      // Step 1: Create file intent with payment column groups
      const checksum = await calculateChecksum(selectedFile)

      const intentRequest = {
        fileName: selectedFile.name,
        contentType: selectedFile.type,
        sizeBytes: selectedFile.size,
        purpose: getPurpose(20), // Mark Bills for Printing
        checksum,
        bulkInsertType: getBulkInsertType(20),
        jobType: 25,
        columns: paymentColumns,
      }

      let intentResult
      try {
        intentResult = await dispatch(createFileIntent(intentRequest)).unwrap()
      } catch (error: any) {
        notify("error", "Upload Failed", {
          description: error.message || "Failed to create file intent",
          duration: 5000,
        })
        throw error
      }

      if (!intentResult.isSuccess) {
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

              notify("success", "File Uploaded Successfully!", {
                description: `File ${selectedFile.name} has been uploaded and is ready for processing`,
                duration: 5000,
              })

              // Note: Print bulk upload will be handled by the form submission after file is finalized
              resolve()
            } catch (finalizeError) {
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
        xhr.setRequestHeader("Content-Type", selectedFile.type)
        xhr.send(selectedFile)
      })
    } catch (error) {
      console.error("Upload process error:", error)
      notify("error", "Upload Failed", {
        description: error instanceof Error ? error.message : "Upload failed",
        duration: 5000,
      })
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, dispatch, extractColumnsFromFile])

  // Handle print job form submission
  const handlePrintJobSubmit = useCallback(async () => {
    if (!finalizedFile || !bulkFormData.billingPeriodId) return

    try {
      const printBulkResult = await dispatch(
        processPrintBulkUpload({
          billingPeriodId: bulkFormData.billingPeriodId,
          fileId: finalizedFile.fileId,
          groupBy: bulkFormData.groupBy,
          maxBillsPerFile: bulkFormData.maxBillsPerFile,
        })
      ).unwrap()

      if (!printBulkResult.isSuccess) {
        throw new Error(printBulkResult.message)
      }

      setBulkUploadProcessed(true)

      // Show success notification
      const succeededRows =
        (printBulkResult.data as any)?.succeededRows || (printBulkResult.data as any)?.job?.succeededRows || 0
      notify("success", "Print Job Started!", {
        description: `${succeededRows} billing records queued for PDF printing`,
        duration: 6000,
      })

      // Optionally close the modal after successful submission
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Print job submission failed:", error)
      notify("error", "Print Job Failed", {
        description: error instanceof Error ? error.message : "Failed to start print job",
        duration: 5000,
      })
    }
  }, [finalizedFile, bulkFormData, dispatch, onClose])

  // Fetch area offices, distribution substations, and countries (for provinces) on mount
  useEffect(() => {
    console.log("PdfPrintModal useEffect:", { isOpen, areaOffices, distributionSubstations, provinces })
    if (isOpen && (!areaOffices || areaOffices.length === 0)) {
      console.log("Fetching area offices...")
      dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 1000 }))
        .unwrap()
        .then((result: any) => {
          console.log("Area offices fetched successfully:", result)
        })
        .catch((error: any) => {
          console.error("Error fetching area offices:", error)
        })
    }
    if (isOpen && (!distributionSubstations || distributionSubstations.length === 0)) {
      console.log("Fetching distribution substations...")
      dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 1000 }))
        .unwrap()
        .then((result: any) => {
          console.log("Distribution substations fetched successfully:", result)
          console.log("Distribution substations data:", result.data)
          console.log("Distribution substations length:", result.data?.length)
        })
        .catch((error: any) => {
          console.error("Error fetching distribution substations:", error)
          console.error("Error details:", error.response?.data)
        })
    }
    if (isOpen && (!provinces || provinces.length === 0)) {
      console.log("Fetching countries (for provinces)...")
      dispatch(fetchCountries())
        .unwrap()
        .then((result: any) => {
          console.log("Countries fetched successfully:", result)
        })
        .catch((error: any) => {
          console.error("Error fetching countries:", error)
        })
    }
  }, [isOpen, dispatch, areaOffices, distributionSubstations, provinces])

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
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-white/50 px-3 py-1 font-mono text-sm font-bold text-white/80">
                  PDF PRINT
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">Generate PDF Hardcopies</h3>
              <p className="mt-1 text-sm text-white">Queue jobs to generate PDF hardcopies for postpaid bills</p>

              {/* Tabs */}
              <div className="mt-4 flex rounded-lg bg-white/10 p-1">
                <button
                  onClick={() => setActiveTab("single")}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === "single" ? "bg-white text-green-800" : "text-white/80 hover:text-white"
                  }`}
                >
                  Single Upload
                </button>
                <button
                  onClick={() => setActiveTab("bulk")}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === "bulk" ? "bg-white text-green-800" : "text-white/80 hover:text-white"
                  }`}
                >
                  Bulk Upload
                </button>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="rounded-full bg-white/50 p-2 text-gray-600 transition-colors hover:bg-white/70"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error and Success Messages */}
          {error && (
            <motion.div
              className="mb-6 rounded-lg bg-red-50 p-4 text-red-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Error</p>
              </div>
              <p className="mt-1 text-sm">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              className="mb-6 rounded-lg bg-green-50 p-4 text-green-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Success</p>
              </div>
              <p className="mt-1 text-sm">{message}</p>
            </motion.div>
          )}

          {/* Bulk Upload Error Messages */}
          {(fileIntentError || uploadError || finalizeFileError || billingBulkUploadError || printBulkUploadError) && (
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
                    {fileIntentError ||
                      uploadError ||
                      finalizeFileError ||
                      billingBulkUploadError ||
                      printBulkUploadError}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Single Upload Tab */}
          {activeTab === "single" && (
            <form onSubmit={handleSubmit} className="grid-col grid space-y-6">
              {/* Billing Period */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Billing Period *</label>
                <FormSelectModule
                  value={formData.billingPeriodId.toString()}
                  onChange={(e) => handleInputChange("billingPeriodId", Number(e.target.value))}
                  options={[
                    { value: "", label: "Select Billing Period" },
                    ...(billingPeriods || []).map((period: any) => ({
                      value: period.id.toString(),
                      label: period.displayName || period.period,
                    })),
                  ]}
                  className="w-full"
                  disabled={loading}
                  name="billingPeriod"
                />
              </div>

              {/* Group By */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Group By *</label>
                  <FormSelectModule
                    value={formData.groupBy?.toString() || ""}
                    onChange={(e) => handleInputChange("groupBy", Number(e.target.value))}
                    options={groupByOptions}
                    className="w-full"
                    disabled={loading}
                    name="groupBy"
                  />
                </div>

                {/* Feeder */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Feeder</label>
                  <FormSelectModule
                    value={formData.feederId?.toString() || ""}
                    onChange={(e) => handleInputChange("feederId", Number(e.target.value))}
                    options={[
                      { value: "0", label: "All Feeders" },
                      ...(feeders || []).map((feeder: any) => ({
                        value: feeder.id.toString(),
                        label: feeder.name || feeder.code,
                      })),
                    ]}
                    className="w-full"
                    disabled={loading}
                    name="feeder"
                  />
                </div>

                {/* Area Office */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Area Office</label>
                  <FormSelectModule
                    value={formData.areaOfficeId?.toString() || ""}
                    onChange={(e) => handleInputChange("areaOfficeId", Number(e.target.value))}
                    options={[
                      { value: "", label: "Select Area Office" },
                      ...(areaOffices || []).map((office: any) => {
                        console.log("Mapping area office:", office)
                        return {
                          value: office.id.toString(),
                          label: office.nameOfNewOAreaffice || office.name || office.displayName,
                        }
                      }),
                    ]}
                    className="w-full"
                    disabled={loading}
                    name="areaOffice"
                  />
                </div>

                {/* Distribution Substation */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Distribution Substation</label>
                  <FormSelectModule
                    value={formData.distributionSubstationId?.toString() || ""}
                    onChange={(e) => handleInputChange("distributionSubstationId", Number(e.target.value))}
                    options={[
                      { value: "", label: "Select Distribution Substation" },
                      ...(distributionSubstations || []).map((substation: any) => {
                        console.log("Mapping distribution substation:", substation)
                        console.log("Available fields:", Object.keys(substation))
                        return {
                          value: substation.id.toString(),
                          label: substation.dssCode || substation.name || `DSS-${substation.id}`,
                        }
                      }),
                    ]}
                    className="w-full"
                    disabled={loading}
                    name="distributionSubstation"
                  />
                </div>

                {/* Province */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Province</label>
                  <FormSelectModule
                    value={formData.provinceId?.toString() || ""}
                    onChange={(e) => handleInputChange("provinceId", Number(e.target.value))}
                    options={[
                      { value: "", label: "Select Province" },
                      ...(provinces || []).map((province: any) => ({
                        value: province.id.toString(),
                        label: province.name,
                      })),
                    ]}
                    className="w-full"
                    disabled={loading}
                    name="province"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Is MD</label>
                  <FormSelectModule
                    value={formData.isMd?.toString() || ""}
                    onChange={(e) => handleInputChange("isMd", e.target.value === "true")}
                    options={booleanOptions}
                    className="w-full"
                    disabled={loading}
                    name="isMd"
                  />
                </div>
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Max Bills Per File</label>
                  <input
                    type="number"
                    value={formData.maxBillsPerFile || ""}
                    onChange={(e) => handleInputChange("maxBillsPerFile", Number(e.target.value) || 5000)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="1000"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <ButtonModule type="submit" variant="primary" disabled={loading} loading={loading}>
                  {loading ? "Generating..." : "Generate PDF"}
                </ButtonModule>
              </div>
            </form>
          )}

          {/* Bulk Upload Tab */}
          {activeTab === "bulk" && (
            <div className="space-y-6">
              {/* Template Download */}
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="w-2/3">
                    <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                    <p className="text-sm text-blue-600">
                      Download our CSV template with the required columns for Mark Bills for Printing.
                    </p>
                  </div>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const headers = "CustomerAccountNo,MonthYear"
                      const sampleData = [headers].join("\n")
                      const blob = new Blob([sampleData], { type: "text/csv;charset=utf-8;" })
                      const link = document.createElement("a")
                      const url = URL.createObjectURL(blob)
                      link.setAttribute("href", url)
                      link.setAttribute("download", "sample-mark-bills-for-printing.csv")
                      link.style.visibility = "hidden"
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    Download Template
                  </ButtonModule>
                </div>
              </div>

              {/* File Upload Area - Show until file is finalized */}
              {!finalizedFile ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-[#f9f9f9] p-6 text-center">
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    onChange={handleFileSelect}
                    disabled={isUploading || printBulkUploadLoading}
                    className="hidden"
                  />

                  {!selectedFile ? (
                    <div
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`transition-colors ${isDragOver ? "border-blue-400 bg-blue-50" : ""}`}
                    >
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
                      <p className="mt-1 text-xs text-gray-500">Supports CSV, Excel (.xlsx, .xls) files (max 50MB)</p>
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
                          onClick={() => fileInputRef.current?.click()}
                          disabled={
                            isUploading ||
                            printBulkUploadLoading ||
                            (!!uploadProgress && uploadProgress.percentage !== 100 && !uploadError)
                          }
                        >
                          Choose Different File
                        </ButtonModule>
                        <ButtonModule
                          variant="primary"
                          onClick={() => {
                            void handleBulkUpload()
                          }}
                          disabled={isUploading || uploadSuccess || !!uploadProgress || printBulkUploadLoading}
                        >
                          {isUploading || printBulkUploadLoading ? "Uploading..." : "Upload File"}
                        </ButtonModule>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Show form after file is finalized */
                <div className="space-y-6">
                  {/* File Success Message */}
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <svg className="size-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-green-800">File Uploaded Successfully</h3>
                        <p className="text-sm text-green-600">{finalizedFile.fileName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Upload Form */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Print Job Settings</h3>
                    <div className="space-y-4">
                      {/* Billing Period */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Billing Period *</label>
                        <FormSelectModule
                          value={bulkFormData.billingPeriodId.toString()}
                          onChange={(e) => handleBulkFormChange("billingPeriodId", Number(e.target.value))}
                          options={[
                            { value: "0", label: "Select Billing Period" },
                            ...(billingPeriods || []).map((period: any) => ({
                              value: period.id.toString(),
                              label: period.displayName || period.period,
                            })),
                          ]}
                          className="w-full"
                          disabled={printBulkUploadLoading}
                          name="bulkBillingPeriod"
                        />
                      </div>

                      {/* Group By */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Group By *</label>
                        <FormSelectModule
                          value={bulkFormData.groupBy?.toString() || ""}
                          onChange={(e) => handleBulkFormChange("groupBy", Number(e.target.value))}
                          options={groupByOptions}
                          className="w-full"
                          disabled={printBulkUploadLoading}
                          name="bulkGroupBy"
                        />
                      </div>

                      {/* Max Bills Per File */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Max Bills Per File</label>
                        <input
                          type="number"
                          value={bulkFormData.maxBillsPerFile || ""}
                          onChange={(e) => handleBulkFormChange("maxBillsPerFile", Number(e.target.value) || 1000)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="1000"
                          disabled={printBulkUploadLoading}
                        />
                        <p className="mt-1 text-xs text-gray-500">Default is 1000 bills per file</p>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end">
                        <ButtonModule
                          variant="primary"
                          onClick={() => {
                            void handlePrintJobSubmit()
                          }}
                          disabled={!bulkFormData.billingPeriodId || printBulkUploadLoading}
                          loading={printBulkUploadLoading}
                        >
                          {printBulkUploadLoading ? "Processing..." : "Start Print Job"}
                        </ButtonModule>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress - Show during file upload */}
              {uploadProgress && !finalizedFile && (
                <div
                  className={`rounded-lg border p-4 ${
                    uploadProgress.percentage === 100 ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"
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
                        className={`text-xs ${uploadProgress.percentage === 100 ? "text-green-700" : "text-blue-700"}`}
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
                    className={`mt-2 text-xs ${uploadProgress.percentage === 100 ? "text-green-700" : "text-blue-700"}`}
                  >
                    {formatFileSize(uploadProgress.loaded)} of {formatFileSize(uploadProgress.total)} uploaded
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PdfPrintModal
