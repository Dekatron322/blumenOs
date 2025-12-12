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
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-3 backdrop-blur-sm sm:px-4"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl sm:max-w-lg md:max-w-xl 2xl:max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:px-6 sm:py-5">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">Suspend Customer Account</h2>
          <button
            onClick={onRequestClose}
            className="flex size-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-8"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col items-center px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            {/* Warning Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-yellow-50 sm:size-20">
                <svg
                  className="size-8 text-yellow-500 sm:size-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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
              <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">{customerName}</h3>
              <p className="text-xs text-gray-600 sm:text-sm">Account: {accountNumber}</p>
            </div>

            {/* Message */}
            <h3 className="mb-2 text-center text-base font-semibold text-gray-900 sm:mb-3 sm:text-lg">
              Confirm Account Suspension
            </h3>
            <p className="mb-3 px-2 text-center text-sm text-gray-600 sm:mb-4 sm:px-0">
              Are you sure you want to suspend this customer&apos;s account?
            </p>
            <p className="mb-5 px-2 text-center text-xs text-gray-500 sm:mb-6 sm:px-0 sm:text-sm">
              The customer will not be able to access services until the account is reactivated.
            </p>

            {/* Suspension Reason Input */}
            <div className="w-full">
              <label htmlFor="suspensionReason" className="mb-2 block text-xs font-medium text-gray-700 sm:text-sm">
                Suspension Reason *
              </label>
              <textarea
                id="suspensionReason"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Please provide the reason for suspending this account..."
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm"
                rows={3}
                disabled={isLoading}
              />
              <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">
                This reason will be recorded and visible in the customer&apos;s account history.
              </p>
            </div>
          </div>
        </div>

        <div className="flex  gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]  sm:gap-4 sm:px-6 sm:py-5">
          <ButtonModule
            variant="secondary"
            className="flex-1 text-sm sm:text-base"
            size="sm"
            onClick={onRequestClose}
            disabled={isLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="danger"
            className="flex-1 text-sm sm:text-base"
            size="sm"
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
