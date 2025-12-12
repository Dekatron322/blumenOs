"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { deactivateEmployee } from "lib/redux/employeeSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"

interface SuspendAccountModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm?: () => void
  employeeId: number
  employeeName: string
  onSuccess?: () => void
}

const SuspendAccountModal: React.FC<SuspendAccountModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  employeeId,
  employeeName,
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
        await onConfirm() // Added await to ensure it completes
        onRequestClose()
        return
      }

      // Otherwise, use the default deactivate employee action
      const result = await dispatch(deactivateEmployee(employeeId))

      if (deactivateEmployee.fulfilled.match(result)) {
        notify("success", `Account for ${employeeName} has been deactivated successfully`)
        onSuccess?.()
      } else {
        throw new Error(result.payload as string)
      }

      onRequestClose()
    } catch (error: any) {
      notify("error", error.message || "Failed to deactivate account")
    } finally {
      setIsLoading(false)
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
        className="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl sm:max-w-lg md:max-w-xl lg:w-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:px-6 sm:py-6">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Deactivate Account</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-10"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col items-center px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
            {/* Warning Icon */}
            <div className="mb-4 flex items-center justify-center sm:mb-6">
              <div className="flex size-16 items-center justify-center rounded-full bg-red-50 sm:size-20">
                <svg className="size-8 text-red-500 sm:size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            {/* Message */}
            <h3 className="mb-3 text-center text-base font-semibold text-gray-900 sm:text-lg">
              Confirm Account Deactivation
            </h3>
            <p className="mb-2 text-center text-sm text-gray-600 sm:text-base">
              Are you sure you want to deactivate {employeeName}&apos;s account?
            </p>
            <p className="text-center text-xs text-gray-500 sm:text-sm">
              The employee will not be able to access services until the account is reactivated.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:flex-row sm:gap-4 sm:px-6 sm:py-6">
          <ButtonModule
            variant="dangerSecondary"
            className="flex w-full"
            size="md"
            onClick={onRequestClose}
            disabled={isLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule variant="danger" className="flex w-full" size="md" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Deactivating..." : "Deactivate Account"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SuspendAccountModal
