"use client"

import React, { useCallback, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { createFileIntent, finalizeFile, processBulkUpload } from "lib/redux/fileManagementSlice"
import * as XLSX from "xlsx"
import DashboardNav from "components/Navbar/DashboardNav"
import { AlertCircle, CheckCircle, CloudUpload, Download, FileText, X } from "lucide-react"

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

const FileManagementPage = () => {
  const dispatch = useAppDispatch()
  const {
    fileIntent,
    fileIntentLoading,
    fileIntentError,
    fileIntentSuccess,
    finalizeFileLoading,
    finalizeFileError,
    finalizeFileSuccess,
    bulkUploadLoading,
    bulkUploadError,
    bulkUploadSuccess,
    bulkUploadResponse,
  } = useAppSelector((state: { fileManagement: any }) => state.fileManagement)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [finalizedFile, setFinalizedFile] = useState<any>(null)
  const [bulkUploadProcessed, setBulkUploadProcessed] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
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

    console.log("=== Starting Upload Process ===")
    console.log("Selected file:", selectedFile.name, selectedFile.type)

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
        purpose: "payments-bulk-record",
        checksum,
        bulkInsertType: "payments",
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
        throw error
      }

      if (!intentResult.isSuccess) {
        console.log("API Response Error:", intentResult)
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

              // Step 4: Process bulk upload
              console.log("=== Processing Bulk Upload ===")
              try {
                const bulkResult = await dispatch(processBulkUpload({ fileId, confirm: true })).unwrap()

                if (!bulkResult.isSuccess) {
                  throw new Error(bulkResult.message)
                }

                setBulkUploadProcessed(true)
                console.log("=== Bulk Upload Complete ===")
                console.log("Bulk upload data:", bulkResult.data)
              } catch (bulkError) {
                console.error("Bulk upload failed:", bulkError)
                setUploadError(bulkError instanceof Error ? bulkError.message : "Failed to process bulk upload")
              }

              resolve()
            } catch (finalizeError) {
              setUploadError(finalizeError instanceof Error ? finalizeError.message : "Failed to finalize upload")
              reject(finalizeError)
            }
          } else {
            const error = new Error(`Upload failed with status ${xhr.status}`)
            reject(error)
          }
        })

        xhr.addEventListener("error", () => {
          const error = new Error("Network error during upload")
          reject(error)
        })

        // Open and send the request
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", selectedFile.type)
        xhr.send(selectedFile)
      })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, dispatch])

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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    dispatch({ type: "fileManagement/resetFileManagementState" })
  }, [dispatch])

  // Generate and download sample CSV file
  const downloadSampleFile = useCallback(() => {
    const sampleData = [
      "fullName,phoneNumber,nercAcctNumber,phoneOffice,gender,isPostEnumerated,statusCode,email,address,distributionSubstationId,addressTwo,mapName,type,city,provinceId,lga,serviceCenterId,latitude,longitude,tariffId,isPPM,isMD,isUrban,isHRB,isCustomerAccGovt,comment,storedAverage,customerCategoryId,customerSubCategoryId",
      "John Doe,08012345678,NERC123456,08012345679,Male,true,ACT,john.doe@example.com,123 Main Street Kaduna,1,Suite 456,Map-A,Residential,Kaduna,1,Kaduna,1,10.5167,7.4333,1,true,true,true,false,true,Regular customer,500,1,1",
      "Jane Smith,08098765432,NERC789012,08098765433,Female,false,INA,jane.smith@example.com,456 Independence Avenue Kano,2,,Map-B,Commercial,Kano,2,Kano,2,12.0000,8.5200,2,false,true,true,true,false,Business customer,750,2,2",
      "Ahmed Ibrahim,08055556666,NERC345678,08055556667,Male,true,ACT,ahmed.ibrahim@example.com,789 Ahmadu Bello Way Zaria,3,,Map-C,Residential,Zaria,1,Zaria,3,11.0667,7.7167,3,true,false,true,false,true,New connection,600,1,2",
    ].join("\n")

    const blob = new Blob([sampleData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "sample_cus_bulk.csv")
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <>
      <DashboardNav />
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">File Management</h1>

          {/* Drag and Drop Upload Area */}
          <div className="space-y-4">
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all ${
                isDragOver ? "scale-105 border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-gray-400"
              } ${isUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDragEnter={handleDragEnter}
              onDragExit={handleDragExit}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />

              {!selectedFile ? (
                <div className="space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <CloudUpload className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragging ? "Drop your file here" : "Drag and drop your file here"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">or click to browse from your computer</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p>Supports CSV, Excel (.xlsx, .xls) and other file formats</p>
                    <p>Maximum file size: 50MB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown type"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSelectedFile()
                    }}
                    disabled={isUploading}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remove File
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Upload Progress */}
            {uploadProgress && (
              <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="mb-3 flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <CloudUpload className="h-4 w-4 animate-pulse text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Uploading file...</p>
                    <p className="text-xs text-blue-700">{uploadProgress.percentage}% complete</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-800">{uploadProgress.percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-blue-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-blue-700">
                  {formatFileSize(uploadProgress.loaded)} of {formatFileSize(uploadProgress.total)} uploaded
                </p>
              </div>
            )}

            {/* Error Messages */}
            {(fileIntentError || uploadError || finalizeFileError || bulkUploadError) && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start">
                  <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Upload Failed</p>
                    <p className="mt-1 text-sm text-red-700">
                      {fileIntentError || uploadError || finalizeFileError || bulkUploadError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Messages */}
            {uploadSuccess && finalizedFile && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-start">
                  <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">Upload Successful!</p>
                    <div className="mt-3 space-y-2 text-sm text-green-700">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">File ID:</span> {finalizedFile.fileId}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {finalizedFile.status}
                        </div>
                        <div>
                          <span className="font-medium">Object Key:</span> {finalizedFile.objectKey}
                        </div>
                        {finalizedFile.publicUrl && (
                          <div>
                            <span className="font-medium">Public URL:</span>{" "}
                            <a
                              href={finalizedFile.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-blue-600 underline hover:text-blue-800"
                            >
                              View File
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Bulk Upload Status */}
                      {bulkUploadProcessed && bulkUploadResponse && (
                        <div className="mt-4 border-t border-green-300 pt-4">
                          <p className="mb-3 font-medium text-green-900">Bulk Upload Processed!</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Queued:</span>{" "}
                              {bulkUploadResponse.data.queued ? "Yes" : "No"}
                            </div>
                            <div>
                              <span className="font-medium">Total Rows:</span>{" "}
                              {bulkUploadResponse.data?.preview?.totalRows || 0}
                            </div>
                            <div>
                              <span className="font-medium">Valid Rows:</span>{" "}
                              {bulkUploadResponse.data?.preview?.validRows || 0}
                            </div>
                            <div>
                              <span className="font-medium">Invalid Rows:</span>{" "}
                              {bulkUploadResponse.data?.preview?.invalidRows || 0}
                            </div>
                            <div>
                              <span className="font-medium">Total Amount:</span>{" "}
                              {bulkUploadResponse.data?.preview?.totalAmount || 0}
                            </div>
                            <div>
                              <span className="font-medium">Job ID:</span> {bulkUploadResponse.data?.job?.id || 0}
                            </div>
                            <div>
                              <span className="font-medium">Job Status:</span>{" "}
                              {bulkUploadResponse.data?.job?.status || "Unknown"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={downloadSampleFile}
                disabled={isUploading}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Sample CSV
              </button>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading || fileIntentLoading || finalizeFileLoading}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudUpload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={isUploading}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="mr-2 h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Instructions */}
          {/* <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
              <h3 className="mb-3 flex items-center text-sm font-semibold text-blue-900">
                <CloudUpload className="mr-2 h-4 w-4" />
                How it works
              </h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2 font-medium">1.</span>
                  <span>Download the sample CSV file for reference</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-medium">2.</span>
                  <span>Drag and drop your file or click to browse</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-medium">3.</span>
                  <span>Click "Upload File" to start the upload process</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-medium">4.</span>
                  <span>File is uploaded directly to cloud storage</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-medium">5.</span>
                  <span>Upload is finalized and processed automatically</span>
                </li>
              </ol>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-5">
              <h3 className="mb-3 flex items-center text-sm font-semibold text-green-900">
                <FileText className="mr-2 h-4 w-4" />
                Sample File Information
              </h3>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex justify-between">
                  <span className="font-medium">Format:</span>
                  <span>CSV file with customer bulk import data</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Columns:</span>
                  <span>23 fields matching CreateCustomerRequest</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sample Data:</span>
                  <span>3 sample customers with Nigerian data</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Usage:</span>
                  <span>Template for bulk customer uploads</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Filename:</span>
                  <span>sample_customers_bulk.csv</span>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  )
}

export default FileManagementPage
