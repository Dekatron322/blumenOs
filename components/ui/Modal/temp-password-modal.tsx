"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"

interface TempPasswordModalProps {
  isOpen: boolean
  onRequestClose: () => void
  temporaryPassword: string | null
  email: string | null
}

const TempPasswordModal: React.FC<TempPasswordModalProps> = ({ isOpen, onRequestClose, temporaryPassword, email }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !temporaryPassword) return null

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(temporaryPassword).then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      })
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
        className="relative w-[90vw] max-w-lg rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b bg-[#F9F9F9] px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Temporary Password</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600">
            Share this one-time password with the employee securely. They will be asked to change it on first login.
          </p>

          <div className="mt-4 space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            {email && (
              <div className="flex justify-between gap-4">
                <span className="font-medium">Employee Email:</span>
                <span className="font-semibold">{email}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="font-medium">Temporary Password:</span>
              <span className="font-semibold">{temporaryPassword}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-t bg-white px-6 py-4">
          <ButtonModule variant="secondary" className="flex-1" size="md" onClick={onRequestClose}>
            Close
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="md" onClick={handleCopy}>
            {copied ? "Copied" : "Copy details"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TempPasswordModal
