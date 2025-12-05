"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import type { VirtualAccount } from "lib/redux/paymentSlice"

interface BankTransferDetailsModalProps {
  isOpen: boolean
  onRequestClose: () => void
  virtualAccount: VirtualAccount | null
}

const BankTransferDetailsModal: React.FC<BankTransferDetailsModalProps> = ({
  isOpen,
  onRequestClose,
  virtualAccount,
}) => {
  const [isCopying, setIsCopying] = useState(false)

  if (!isOpen || !virtualAccount) return null

  const handleCopy = () => {
    const text = `Account Number: ${virtualAccount.accountNumber}\nBank Name: ${
      virtualAccount.bankName
    }\nPayment Reference: ${virtualAccount.reference}\nExpires At: ${new Date(
      virtualAccount.expiresAtUtc
    ).toLocaleString()}`

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopying(true)
        setTimeout(() => setIsCopying(false), 2000)
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
          <h2 className="text-lg font-semibold text-gray-900">Bank Transfer Details</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600">
            Use the virtual account details below to complete your bank transfer. You can copy all the details for easy
            sharing.
          </p>

          <div className="mt-4 space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <div className="flex justify-between gap-4">
              <span className="font-medium">Account Number:</span>
              <span className="font-semibold">{virtualAccount.accountNumber}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium">Bank Name:</span>
              <span className="font-semibold">{virtualAccount.bankName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium">Payment Reference:</span>
              <span className="font-semibold">{virtualAccount.reference}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium">Expires At:</span>
              <span className="font-semibold">{new Date(virtualAccount.expiresAtUtc).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-t bg-white px-6 py-4">
          <ButtonModule variant="secondary" className="flex-1" size="md" onClick={onRequestClose}>
            Close
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="md" onClick={handleCopy}>
            {isCopying ? "Copied" : "Copy payment info"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default BankTransferDetailsModal
