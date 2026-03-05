"use client"

import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { Download, FileText, Loader2, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearDownloadScheduleRunPDFStatus,
  downloadScheduleRunPDF,
  DownloadScheduleRunPDFItem,
} from "lib/redux/postpaidSlice"
import { ButtonModule } from "components/ui/Button/Button"

interface DownloadScheduleRunPDFModalProps {
  isOpen: boolean
  onClose: () => void
  runId: number
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const DownloadScheduleRunPDFModal: React.FC<DownloadScheduleRunPDFModalProps> = ({ isOpen, onClose, runId }) => {
  const dispatch = useAppDispatch()

  const {
    downloadScheduleRunPDFLoading,
    downloadScheduleRunPDFError,
    downloadScheduleRunPDFSuccess,
    downloadScheduleRunPDFData,
  } = useAppSelector((state: any) => state.postpaidBilling)

  // Fetch PDF downloads when modal opens
  useEffect(() => {
    if (isOpen && runId) {
      dispatch(downloadScheduleRunPDF(runId))
    }
  }, [isOpen, runId, dispatch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearDownloadScheduleRunPDFStatus())
    }
  }, [dispatch])

  const handleClose = () => {
    dispatch(clearDownloadScheduleRunPDFStatus())
    onClose()
  }

  const handleDownloadFile = (item: DownloadScheduleRunPDFItem) => {
    const link = document.createElement("a")
    link.href = item.downloadUrl
    link.download = item.fileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAll = () => {
    if (!downloadScheduleRunPDFData) return
    downloadScheduleRunPDFData.forEach((item: DownloadScheduleRunPDFItem, index: number) => {
      setTimeout(() => {
        handleDownloadFile(item)
      }, index * 500)
    })
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
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
            <h3 className="text-lg font-semibold text-gray-900">Download PDF Files</h3>
            <button onClick={handleClose} className="rounded-full p-1 hover:bg-gray-100">
              <X className="size-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Loading State */}
          {downloadScheduleRunPDFLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="mt-3 text-sm text-gray-500">Fetching PDF downloads...</p>
            </div>
          )}

          {/* Error State */}
          {downloadScheduleRunPDFError && (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{downloadScheduleRunPDFError}</div>
              <div className="flex gap-3">
                <ButtonModule variant="outline" size="md" onClick={handleClose} className="flex-1">
                  Close
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={() => dispatch(downloadScheduleRunPDF(runId))}
                  className="flex-1"
                >
                  Retry
                </ButtonModule>
              </div>
            </div>
          )}

          {/* Success State - PDF List */}
          {downloadScheduleRunPDFSuccess && downloadScheduleRunPDFData && (
            <div className="space-y-4">
              {downloadScheduleRunPDFData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm font-medium text-gray-900">No PDF files available</p>
                  <p className="mt-1 text-xs text-gray-500">No PDF downloads are available for this run yet.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    {downloadScheduleRunPDFData.length} file(s) available for download
                  </p>

                  {/* File List */}
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {downloadScheduleRunPDFData.map((item: DownloadScheduleRunPDFItem) => (
                      <div
                        key={item.postpaidBillPrintJobId}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.fileName}</p>
                            <p className="text-xs text-gray-500">
                              Part {item.partNumber} &middot; {formatBytes(item.sizeBytes)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-purple-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 border-t border-gray-100 pt-4">
                    <ButtonModule variant="outline" size="md" onClick={handleClose} className="flex-1">
                      Close
                    </ButtonModule>
                    {downloadScheduleRunPDFData.length > 1 && (
                      <ButtonModule
                        variant="primary"
                        size="md"
                        onClick={handleDownloadAll}
                        className="flex-1"
                        icon={<Download />}
                      >
                        Download All
                      </ButtonModule>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default DownloadScheduleRunPDFModal
