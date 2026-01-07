"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { resumeRecoveryPolicy } from "lib/redux/debtManagementSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"

interface ResumeRecoveryPolicyModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm?: () => void
  policyId: number
  policyName: string
  customerName?: string
  onSuccess?: () => void
}

const ResumeRecoveryPolicyModal: React.FC<ResumeRecoveryPolicyModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  policyId,
  policyName,
  customerName,
  onSuccess,
}) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = React.useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    try {
      setIsLoading(true)

      // If custom onConfirm is provided, use it and let it handle closing the modal
      if (onConfirm) {
        await onConfirm()
        return
      }

      // Otherwise, use the default resume recovery policy action
      const result = await dispatch(resumeRecoveryPolicy(policyId))

      if (resumeRecoveryPolicy.fulfilled.match(result)) {
        notify("success", `Recovery policy "${policyName}" has been resumed successfully`)
        onSuccess?.()
        onRequestClose()
      } else {
        throw new Error(result.payload as string)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to resume recovery policy")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleConfirm()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
      onKeyDown={handleKeyPress}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[500px] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Resume Recovery Policy</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col items-center px-6 pb-6 pt-6">
            {/* Success Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-green-50">
                <svg className="size-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Policy Information */}
            <div className="mb-4 w-full text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{policyName}</h3>
              {customerName && <p className="text-sm text-gray-600">Customer: {customerName}</p>}
            </div>

            {/* Message */}
            <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Confirm Policy Resume</h3>
            <p className="mb-4 text-center text-gray-600">Are you sure you want to resume this recovery policy?</p>
            <p className="mb-6 text-center text-sm text-green-600">
              The policy will become active again and will start processing recoveries immediately.
            </p>

            {/* Resume Notice */}
            <div className="w-full rounded-lg bg-green-50 p-4">
              <div className="flex items-start">
                <svg
                  className="mr-3 mt-0.5 size-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800">Policy Activation</h4>
                  <p className="mt-1 text-sm text-green-700">
                    Once resumed, this policy will immediately begin processing recoveries according to its configured
                    rules and thresholds.
                  </p>
                </div>
              </div>
            </div>

            {/* Policy Details */}
            <div className="mt-6 w-full rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Policy Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Policy ID:</span>
                  <span className="text-sm font-semibold text-gray-900">#{policyId}</span>
                </div>
                {customerName && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Customer:</span>
                    <span className="text-sm font-semibold text-gray-900">{customerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Action:</span>
                  <span className="text-sm font-semibold text-green-600">Resume Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-3 border-t border-gray-200 bg-gray-50 p-6">
          <ButtonModule variant="secondary" onClick={onRequestClose} disabled={isLoading} className="flex-1" size="lg">
            Cancel
          </ButtonModule>
          <ButtonModule variant="success" className="flex-1" size="lg" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Resuming..." : "Resume Policy"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ResumeRecoveryPolicyModal
