"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MdClose, MdCheckCircle, MdInfo, MdWarning } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearResolveAnomaly,
  PaymentAnomalyResolutionAction,
  resolveAnomaly,
  ResolveAnomalyRequest,
} from "lib/redux/paymentSlice"

interface ResolveAnomalyModalProps {
  isOpen: boolean
  onClose: () => void
  anomaly: {
    id: number
    reference: string
    customerName: string
    amount: number
    channel: string
    ruleKey: string
    issue: string
    status: string
  }
}

const ResolveAnomalyModal: React.FC<ResolveAnomalyModalProps> = ({ isOpen, onClose, anomaly }) => {
  const dispatch = useAppDispatch()
  const { resolveAnomalyLoading, resolveAnomalyError, resolveAnomalySuccess } = useAppSelector(
    (state) => state.payments
  )

  const [formData, setFormData] = useState<ResolveAnomalyRequest>({
    action: PaymentAnomalyResolutionAction.None,
    note: "",
  })

  const resolutionActions: Array<{
    value: PaymentAnomalyResolutionAction
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }> = [
    { value: PaymentAnomalyResolutionAction.None, label: "None", icon: MdInfo, color: "text-gray-600" },
    { value: PaymentAnomalyResolutionAction.Cancel, label: "Cancel Payment", icon: MdClose, color: "text-red-600" },
    {
      value: PaymentAnomalyResolutionAction.Refund,
      label: "Refund Payment",
      icon: MdWarning,
      color: "text-orange-600",
    },
    {
      value: PaymentAnomalyResolutionAction.Ignore,
      label: "Ignore Anomaly",
      icon: MdCheckCircle,
      color: "text-green-600",
    },
  ]

  const handleSubmit = async () => {
    try {
      const result = await dispatch(resolveAnomaly({ id: anomaly.id, resolveData: formData }))

      if (resolveAnomaly.fulfilled.match(result)) {
        // Show success notification
        notify("success", "Anomaly resolved successfully", {
          title: `Anomaly ANM-${anomaly.id} has been resolved`,
          description: `Action: ${formData.action} - ${formData.note || "No additional notes"}`,
        })

        // Close modal after successful resolution
        setTimeout(() => {
          onClose()
          dispatch(clearResolveAnomaly())
        }, 1500)
      } else if (resolveAnomaly.rejected.match(result)) {
        // Show error notification
        notify("error", "Failed to resolve anomaly", {
          title: "Resolution failed",
          description: (result.payload as string) || "An error occurred while resolving the anomaly. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error resolving anomaly:", error)
      notify("error", "Failed to resolve anomaly", {
        title: "Resolution failed",
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  const handleClose = () => {
    dispatch(clearResolveAnomaly())
    onClose()
  }

  const getActionStyle = (action: PaymentAnomalyResolutionAction) => {
    switch (action) {
      case PaymentAnomalyResolutionAction.Cancel:
        return { backgroundColor: "#FEE2E2", color: "#DC2626" }
      case PaymentAnomalyResolutionAction.Refund:
        return { backgroundColor: "#FED7AA", color: "#EA580C" }
      case PaymentAnomalyResolutionAction.Ignore:
        return { backgroundColor: "#DCFCE7", color: "#16A34A" }
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
                    ANM-{anomaly.id}
                  </span>
                  <motion.span
                    className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="size-2 rounded-full bg-yellow-500" />
                    {anomaly.status}
                  </motion.span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">Resolve Anomaly</h3>
                <p className="mt-1 text-sm text-white/70">Review and resolve payment anomaly</p>
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
              {/* Anomaly Details */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                  <MdInfo className="text-[#004B23]" />
                  Anomaly Details
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Payment Reference</p>
                    <p className="mt-1 font-medium text-gray-900">{anomaly.reference}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Customer</p>
                    <p className="mt-1 font-medium text-gray-900">{anomaly.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Amount</p>
                    <p className="mt-1 font-medium text-gray-900">₦{anomaly.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">Channel</p>
                    <p className="mt-1 font-medium text-gray-900">{anomaly.channel}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium uppercase text-gray-400">Rule</p>
                    <p className="mt-1 font-medium text-gray-900">{anomaly.ruleKey}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium uppercase text-gray-400">Issue Description</p>
                    <p className="mt-1 text-gray-700">{anomaly.issue}</p>
                  </div>
                </div>
              </div>

              {/* Resolution Form */}
              <div className="rounded-xl border border-gray-200 p-4">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <MdCheckCircle className="text-[#004B23]" />
                  Resolution Action
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Select Action *</label>
                    <div className="grid gap-3">
                      {resolutionActions.map((action) => (
                        <motion.button
                          key={action.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, action: action.value })}
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                            formData.action === action.value
                              ? "border-[#004B23] bg-[#004B23]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <action.icon className={`text-lg ${action.color}`} />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{action.label}</p>
                            <p className="text-xs text-gray-500">
                              {action.value === PaymentAnomalyResolutionAction.Cancel &&
                                "Cancel the associated payment transaction"}
                              {action.value === PaymentAnomalyResolutionAction.Refund &&
                                "Process a refund for the payment"}
                              {action.value === PaymentAnomalyResolutionAction.Ignore &&
                                "Mark this anomaly as resolved without action"}
                              {action.value === PaymentAnomalyResolutionAction.None &&
                                "No action taken on this anomaly"}
                            </p>
                          </div>
                          {formData.action === action.value && (
                            <motion.div
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#004B23]"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <div className="h-2 w-2 rounded-full bg-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Resolution Note *</label>
                    <textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      rows={4}
                      placeholder="Enter detailed notes about this resolution..."
                    />
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {resolveAnomalyError && (
                <motion.div
                  className="rounded-lg border border-red-200 bg-red-50 p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-red-800">
                    <MdWarning className="text-lg" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">{resolveAnomalyError}</p>
                </motion.div>
              )}

              {resolveAnomalySuccess && (
                <motion.div
                  className="rounded-lg border border-green-200 bg-green-50 p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-green-800">
                    <MdCheckCircle className="text-lg" />
                    <span className="font-medium">Success</span>
                  </div>
                  <p className="mt-1 text-sm text-green-700">Anomaly resolved successfully!</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Anomaly ID: <span className="font-mono font-medium">ANM-{anomaly.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <ButtonModule variant="outline" size="sm" onClick={handleClose} disabled={resolveAnomalyLoading}>
                  Cancel
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={resolveAnomalyLoading || !formData.note.trim()}
                  loading={resolveAnomalyLoading}
                >
                  {resolveAnomalyLoading ? "Resolving..." : "Resolve Anomaly"}
                </ButtonModule>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ResolveAnomalyModal
