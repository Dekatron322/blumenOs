"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MdCheckCircle, MdClose, MdInfo, MdWarning } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearResolveDataQualityState, resolveDataQuality, ResolveDataQualityRequest } from "lib/redux/customerSlice"

interface ResolveDataQualityModalProps {
  isOpen: boolean
  onClose: () => void
  dataQualityItem: {
    id: number
    customerName: string
    customerAccountNumber: string
    ruleKey: string
    issue: string
    severity: "Warning" | "Error"
    status: "Open" | "Resolved" | "Ignored"
    detectedAtUtc: string
  }
}

const ResolveDataQualityModal: React.FC<ResolveDataQualityModalProps> = ({ isOpen, onClose, dataQualityItem }) => {
  const dispatch = useAppDispatch()
  const { resolveDataQualityLoading, resolveDataQualityError, resolveDataQualitySuccess } = useAppSelector(
    (state) => state.customers
  )

  const [formData, setFormData] = useState<ResolveDataQualityRequest>({
    status: "Resolved",
    note: "",
  })

  const resolutionStatuses: Array<{
    value: "Open" | "Resolved" | "Ignored"
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }> = [
    { value: "Open", label: "Keep Open", icon: MdInfo, color: "text-gray-600" },
    { value: "Resolved", label: "Mark Resolved", icon: MdCheckCircle, color: "text-green-600" },
    { value: "Ignored", label: "Ignore Issue", icon: MdWarning, color: "text-orange-600" },
  ]

  const handleSubmit = async () => {
    try {
      const result = await dispatch(resolveDataQuality({ id: dataQualityItem.id, requestData: formData }))

      if (resolveDataQuality.fulfilled.match(result)) {
        // Show success notification
        notify("success", "Data quality issue resolved successfully", {
          title: `Issue DQ-${dataQualityItem.id} has been ${formData.status.toLowerCase()}`,
          description: `Status: ${formData.status} - ${formData.note || "No additional notes"}`,
        })

        // Close modal after successful resolution
        setTimeout(() => {
          onClose()
          dispatch(clearResolveDataQualityState())
        }, 1500)
      } else if (resolveDataQuality.rejected.match(result)) {
        // Show error notification
        notify("error", "Failed to resolve data quality issue", {
          title: "Resolution failed",
          description:
            (result.payload as string) || "An error occurred while resolving the data quality issue. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error resolving data quality:", error)
      notify("error", "Failed to resolve data quality issue", {
        title: "Resolution failed",
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  const handleClose = () => {
    dispatch(clearResolveDataQualityState())
    onClose()
  }

  const getStatusStyle = (status: "Open" | "Resolved" | "Ignored") => {
    switch (status) {
      case "Resolved":
        return { backgroundColor: "#DCFCE7", color: "#16A34A" }
      case "Ignored":
        return { backgroundColor: "#FED7AA", color: "#EA580C" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }

  const getSeverityStyle = (severity: "Warning" | "Error") => {
    switch (severity) {
      case "Error":
        return { backgroundColor: "#FEE2E2", color: "#DC2626" }
      case "Warning":
        return { backgroundColor: "#FEF3C7", color: "#D97706" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
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
                    DQ-{dataQualityItem.id}
                  </span>
                  <motion.span
                    className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="size-2 rounded-full bg-yellow-500" />
                    {dataQualityItem.status}
                  </motion.span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">Resolve Data Quality Issue</h3>
                <p className="mt-1 text-sm text-white/70">Review and resolve data quality issue</p>
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
              {/* Data Quality Issue Details */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                  <MdInfo className="text-[#004B23]" />
                  Issue Details
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Customer</p>
                    <p className="mt-1 font-medium text-gray-900">{dataQualityItem.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Account Number</p>
                    <p className="mt-1 font-medium text-gray-900">{dataQualityItem.customerAccountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Rule</p>
                    <p className="mt-1 font-medium text-gray-900">{dataQualityItem.ruleKey}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Severity</p>
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                        style={getSeverityStyle(dataQualityItem.severity)}
                      >
                        {dataQualityItem.severity}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium uppercase text-gray-400">Issue Description</p>
                    <p className="mt-1 font-medium text-gray-900">{dataQualityItem.issue}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium uppercase text-gray-400">Detected Date</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {dataQualityItem.detectedAtUtc
                        ? new Date(dataQualityItem.detectedAtUtc).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resolution Form */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Resolution Status</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {resolutionStatuses.map((statusOption) => (
                      <motion.button
                        key={statusOption.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: statusOption.value })}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                          formData.status === statusOption.value
                            ? "border-[#004B23] bg-[#004B23] text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <statusOption.icon className="text-lg" />
                        {statusOption.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="note" className="mb-2 block text-sm font-medium text-gray-700">
                    Resolution Notes
                  </label>
                  <textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Enter any additional notes about this resolution..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                  />
                </div>
              </div>

              {/* Error Display */}
              {resolveDataQualityError && (
                <motion.div
                  className="rounded-lg border border-red-200 bg-red-50 p-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-red-800">{resolveDataQualityError}</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-end gap-3">
              <ButtonModule
                variant="outline"
                onClick={handleClose}
                disabled={resolveDataQualityLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </ButtonModule>
              <ButtonModule
                onClick={handleSubmit}
                loading={resolveDataQualityLoading}
                disabled={!formData.note.trim() || resolveDataQualityLoading}
                className="bg-[#004B23] text-white hover:bg-[#006B33]"
              >
                {resolveDataQualityLoading ? "Resolving..." : "Resolve Issue"}
              </ButtonModule>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ResolveDataQualityModal
