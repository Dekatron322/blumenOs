"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { pauseRecoveryPolicy } from "lib/redux/debtManagementSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"

interface PauseRecoveryPolicyModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm?: () => void
  policyId: number
  policyName: string
  customerName?: string
  onSuccess?: () => void
}

const PauseRecoveryPolicyModal: React.FC<PauseRecoveryPolicyModalProps> = ({
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

      // If custom onConfirm is provided, use it
      if (onConfirm) {
        await onConfirm()
        onRequestClose()
        return
      }

      // Otherwise, use the default pause recovery policy action
      const result = await dispatch(pauseRecoveryPolicy(policyId))

      if (pauseRecoveryPolicy.fulfilled.match(result)) {
        notify("success", `Recovery policy "${policyName}" has been paused successfully`)
        onSuccess?.()
        onRequestClose()
      } else {
        throw new Error(result.payload as string)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to pause recovery policy")
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
          <h2 className="text-xl font-bold text-gray-900">Pause Recovery Policy</h2>
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
            {/* Warning Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-yellow-50">
                <svg className="size-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
            <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Confirm Policy Pause</h3>
            <p className="mb-4 text-center text-gray-600">Are you sure you want to pause this recovery policy?</p>
            <p className="mb-6 text-center text-sm text-yellow-600">
              The policy will be temporarily suspended and will not process any recoveries until resumed.
            </p>

            {/* Pause Notice */}
            <div className="w-full rounded-lg bg-yellow-50 p-4">
              <div className="flex items-start">
                <svg
                  className="mr-3 mt-0.5 size-5 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-800">Pause Notice</h4>
                  <p className="mt-1 text-sm text-yellow-700">Pausing this policy will temporarily suspend:</p>
                  <ul className="mt-2 list-inside list-disc text-sm text-yellow-600">
                    <li>Automatic debt recovery processing</li>
                    <li>Enforcement actions (if enabled)</li>
                    <li>Monthly recovery calculations</li>
                    <li>Trigger threshold monitoring</li>
                  </ul>
                  <p className="mt-2 text-sm text-yellow-700">
                    The policy can be resumed at any time from the recovery policies management page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={onRequestClose} disabled={isLoading}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="lg" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Pausing..." : "Pause Policy"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PauseRecoveryPolicyModal
