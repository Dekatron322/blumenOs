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
          <h2 className="text-xl font-bold text-gray-900">Deactivate Account</h2>
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
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <svg className="size-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Confirm Account Deactivation</h3>
            <p className="mb-2 text-center text-gray-600">
              Are you sure you want to deactivate {employeeName}&apos;s account?
            </p>
            <p className="text-center text-sm text-gray-500">
              The employee will not be able to access services until the account is reactivated.
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule
            variant="dangerSecondary"
            className="flex-1"
            size="lg"
            onClick={onRequestClose}
            disabled={isLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule variant="danger" className="flex-1" size="lg" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Deactivating..." : "Deactivate Account"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SuspendAccountModal
