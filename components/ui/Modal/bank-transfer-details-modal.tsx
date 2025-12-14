"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import type { VirtualAccount } from "lib/redux/paymentSlice"

interface BankTransferDetailsModalProps {
  isOpen: boolean
  onRequestClose: () => void
  virtualAccount: VirtualAccount | null
  onConfirm?: () => void
}

const BankTransferDetailsModal: React.FC<BankTransferDetailsModalProps> = ({
  isOpen,
  onRequestClose,
  virtualAccount,
  onConfirm,
}) => {
  const [isCopying, setIsCopying] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")
  useEffect(() => {
    if (!virtualAccount || !virtualAccount.expiresAtUtc) return

    const calculateTimeLeft = () => {
      const expiresAt = new Date(virtualAccount.expiresAtUtc).getTime()
      const now = Date.now()
      const diff = expiresAt - now

      if (diff <= 0) {
        setTimeLeft("Expired")
        return
      }

      const totalSeconds = Math.floor(diff / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      const parts = [] as string[]
      if (hours > 0) parts.push(`${hours}h`)
      if (minutes > 0 || hours > 0) parts.push(`${minutes}m`)
      parts.push(`${seconds}s`)

      setTimeLeft(parts.join(" "))
    }

    // Initial calculation
    calculateTimeLeft()

    const intervalId = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(intervalId)
  }, [virtualAccount])

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
        className="relative w-[90vw] max-w-2xl rounded-lg bg-white shadow-2xl"
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
            <div className="flex flex-col gap-1 rounded-md bg-white p-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-wide text-green-700">Account Number</span>
              <span className="select-all text-4xl font-extrabold tracking-[0.12em] text-gray-900 sm:text-5xl">
                {virtualAccount.accountNumber}
              </span>
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
              <span className="flex flex-col items-end text-right">
                <span className="font-semibold">{new Date(virtualAccount.expiresAtUtc).toLocaleString()}</span>
                {timeLeft && (
                  <span className="text-xs font-medium text-red-600">
                    {timeLeft === "Expired" ? "Expired" : `Time remaining: ${timeLeft}`}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t bg-white px-6 py-4 sm:flex-row sm:gap-4">
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
