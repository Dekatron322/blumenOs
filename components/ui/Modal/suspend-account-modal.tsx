"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"

interface SuspendAccountModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: () => void
}

const SuspendAccountModal: React.FC<SuspendAccountModalProps> = ({ isOpen, onRequestClose, onConfirm }) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onRequestClose()
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
          <h2 className="text-xl font-bold text-gray-900">Suspend Account</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col items-center px-6 pb-6 pt-6">
            {/* Warning Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Confirm Account Suspension</h3>
            <p className="mb-2 text-center text-gray-600">Are you sure you want to suspend this customer account?</p>
            <p className="text-center text-sm text-gray-500">
              The customer will not be able to access services until the account is reactivated.
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="dangerSecondary" className="flex-1" size="lg" onClick={onRequestClose}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="danger" className="flex-1" size="lg" onClick={handleConfirm}>
            Suspend Account
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SuspendAccountModal
