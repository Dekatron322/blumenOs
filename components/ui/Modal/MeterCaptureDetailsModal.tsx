"use client"
import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, RotateCcw } from "lucide-react"
import { MdCalendarToday, MdClose, MdError, MdInfo } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"

interface MeterCaptureDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  meterCapture: any
  onRetry?: (id: number) => void
  retryLoading?: boolean
  retryDisabled?: boolean
}

const MeterCaptureDetailsModal: React.FC<MeterCaptureDetailsModalProps> = ({
  isOpen,
  onClose,
  meterCapture,
  onRetry,
  retryLoading,
}) => {
  const handleClose = () => {
    onClose()
  }

  const handleRetry = async () => {
    if (onRetry && meterCapture) {
      try {
        await onRetry(meterCapture.id)
        // Close modal on successful retry
        onClose()
      } catch (error) {
        // Error is handled by the parent component
        console.error("Retry failed:", error)
      }
    }
  }

  if (!isOpen || !meterCapture) return null

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case 2:
        return "text-blue-600 bg-blue-50 border-blue-200"
      case 3:
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return "Pending"
      case 2:
        return "Processing"
      case 3:
        return "Completed"
      default:
        return "Unknown"
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "API":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "CSV":
        return "text-green-600 bg-green-50 border-green-200"
      case "MANUAL":
        return "text-purple-600 bg-purple-50 border-purple-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Modal Header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#004B23] to-[#006B33] px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-sm font-bold text-white">
                    MC-{meterCapture.id}
                  </span>
                  <motion.span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                      meterCapture.status
                    )
                      .replace("text-", "text-white/")
                      .replace("bg-", "bg-white/")}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        getStatusColor(meterCapture.status).includes("green")
                          ? "bg-green-400"
                          : getStatusColor(meterCapture.status).includes("blue")
                          ? "bg-blue-400"
                          : getStatusColor(meterCapture.status).includes("yellow")
                          ? "bg-yellow-400"
                          : "bg-gray-400"
                      }`}
                    />
                    {getStatusLabel(meterCapture.status)}
                  </motion.span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">Meter Capture Details</h3>
                <p className="mt-1 text-sm text-white/70">Vendor: {meterCapture.vendorName}</p>
              </div>
              <motion.button
                onClick={handleClose}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MdClose className="text-xl" />
              </motion.button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <MdInfo className="text-[#004B23]" />
                  Basic Information
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Capture ID</p>
                    <p className="mt-1 font-mono font-medium text-gray-900">{meterCapture.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Vendor ID</p>
                    <p className="mt-1 font-medium text-gray-900">{meterCapture.vendorId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Vendor Name</p>
                    <p className="mt-1 font-medium text-gray-900">{meterCapture.vendorName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Reference ID</p>
                    <p className="mt-1 font-mono font-medium text-gray-900">{meterCapture.referenceId}</p>
                  </div>
                </div>
              </div>

              {/* Status and Source */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <MdInfo className="text-[#004B23]" />
                  Status & Source
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Status</p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                          meterCapture.status
                        )}`}
                      >
                        <span
                          className={`size-2 rounded-full ${
                            getStatusColor(meterCapture.status).includes("green")
                              ? "bg-green-600"
                              : getStatusColor(meterCapture.status).includes("blue")
                              ? "bg-blue-600"
                              : getStatusColor(meterCapture.status).includes("yellow")
                              ? "bg-yellow-600"
                              : "bg-gray-600"
                          }`}
                        />
                        {getStatusLabel(meterCapture.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Source</p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getSourceColor(
                          meterCapture.source
                        )}`}
                      >
                        {meterCapture.source}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <MdCalendarToday className="text-[#004B23]" />
                  Timestamps
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Created At</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {new Date(meterCapture.createdAtUtc).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Processed At</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {meterCapture.processedAtUtc
                        ? new Date(meterCapture.processedAtUtc).toLocaleString()
                        : "Not processed yet"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Information */}
              {meterCapture.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-red-900">
                    <MdError className="text-red-600" />
                    Error Information
                  </h4>
                  <div className="rounded-lg border border-red-200 bg-red-100 p-3">
                    <p className="font-mono text-sm text-red-800">{meterCapture.error}</p>
                  </div>
                  {meterCapture.status === 1 && onRetry && (
                    <div className="mt-4">
                      <ButtonModule
                        onClick={handleRetry}
                        disabled={retryLoading}
                        icon={<RotateCcw className="size-4" />}
                        className="button-filled w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        {retryLoading ? "Retrying..." : "Retry Failed Capture"}
                      </ButtonModule>
                    </div>
                  )}
                </div>
              )}

              {/* Success Message */}
              {!meterCapture.error && meterCapture.status === 3 && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-green-900">
                    <MdInfo className="text-green-600" />
                    Processing Complete
                  </h4>
                  <p className="text-sm text-green-700">
                    This meter capture has been successfully processed without any errors.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex justify-between">
              <div>
                <ButtonModule onClick={handleRetry} disabled={retryLoading} icon={<RotateCcw className="size-4" />}>
                  {retryLoading ? "Retrying..." : "Retry"}
                </ButtonModule>
              </div>
              <ButtonModule variant="outline" onClick={handleClose} className="button-outlined">
                Close
              </ButtonModule>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MeterCaptureDetailsModal
