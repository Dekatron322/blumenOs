"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { suspendCustomer } from "lib/redux/customerSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"

interface SuspendCustomerModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm?: () => void
  customerId: number
  customerName: string
  accountNumber: string
  onSuccess?: () => void
}

const SuspendCustomerModal: React.FC<SuspendCustomerModalProps> = ({
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
  const [suspensionReason, setSuspensionReason] = React.useState("")

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSuspensionReason("")
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = async () => {
    // Validate reason
    if (!suspensionReason.trim()) {
      notify("error", "Please provide a reason for suspension")
      return
    }

    try {
      setIsLoading(true)

      // If custom onConfirm is provided, use it
      if (onConfirm) {
        await onConfirm()
        onRequestClose()
        return
      }

      // Otherwise, use the default suspend customer action
      const result = await dispatch(
        suspendCustomer({
          id: customerId,
          suspendData: { reason: suspensionReason.trim() },
        })
      )

      if (suspendCustomer.fulfilled.match(result)) {
        notify("success", `Account for ${customerName} has been suspended successfully`)
        onSuccess?.()
        onRequestClose()
      } else {
        throw new Error(result.payload as string)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to suspend account")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && suspensionReason.trim()) {
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
          <h2 className="text-xl font-bold text-gray-900">Suspend Customer Account</h2>
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
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
            <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Confirm Account Suspension</h3>
            <p className="mb-4 text-center text-gray-600">
              Are you sure you want to suspend this customer&apos;s account?
            </p>
            <p className="mb-6 text-center text-sm text-gray-500">
              The customer will not be able to access services until the account is reactivated.
            </p>

            {/* Suspension Reason Input */}
            <div className="w-full">
              <label htmlFor="suspensionReason" className="mb-2 block text-sm font-medium text-gray-700">
                Suspension Reason *
              </label>
              <textarea
                id="suspensionReason"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Please provide the reason for suspending this account..."
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={3}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                This reason will be recorded and visible in the customer&apos;s account history.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={onRequestClose} disabled={isLoading}>
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="danger"
            className="flex-1"
            size="lg"
            onClick={handleConfirm}
            disabled={isLoading || !suspensionReason.trim()}
          >
            {isLoading ? "Suspending..." : "Suspend Account"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SuspendCustomerModal
