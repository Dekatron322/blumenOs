"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { activateCustomer } from "lib/redux/customerSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"

interface ActivateCustomerModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm?: () => void
  customerId: number
  customerName: string
  accountNumber: string
  onSuccess?: () => void
}

const ActivateCustomerModal: React.FC<ActivateCustomerModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  customerId,
  customerName,
  accountNumber,
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

      // Otherwise, use the default activate customer action
      const result = await dispatch(activateCustomer(customerId))

      if (activateCustomer.fulfilled.match(result)) {
        notify("success", `Account for ${customerName} has been activated successfully`)
        onSuccess?.()
        onRequestClose()
      } else {
        throw new Error(result.payload as string)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to activate account")
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
          <h2 className="text-xl font-bold text-gray-900">Activate Customer Account</h2>
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

            {/* Customer Information */}
            <div className="mb-4 w-full text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{customerName}</h3>
              <p className="text-sm text-gray-600">Account: {accountNumber}</p>
            </div>

            {/* Message */}
            <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Confirm Account Activation</h3>
            <p className="mb-4 text-center text-gray-600">
              Are you sure you want to activate this customer&apos;s account?
            </p>
            <p className="mb-6 text-center text-sm text-green-600">
              The customer will regain full access to all services and features.
            </p>

            {/* Activation Notice */}
            <div className="w-full rounded-lg bg-blue-50 p-4">
              <div className="flex items-start">
                <svg className="mr-3 mt-0.5 size-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-800">Activation Notice</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Activating this account will restore the customer&apos;s ability to:
                  </p>
                  <ul className="mt-2 list-inside list-disc text-sm text-blue-600">
                    <li>Access their account dashboard</li>
                    <li>Make payments and view billing history</li>
                    <li>Request services and support</li>
                    <li>Receive notifications and updates</li>
                  </ul>
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
            {isLoading ? "Activating..." : "Activate Account"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ActivateCustomerModal
