"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"

interface VendBankTransferModalProps {
  isOpen: boolean
  onRequestClose: () => void
  virtualAccount: {
    accountNumber: string
    bankName: string
    reference: string
    expiresAtUtc: string
  } | null
  paymentData: {
    reference: string
    amount: number
    currency: string
    customerName: string
    customerAccountNumber: string
  } | null
  onCheckPayment: () => void
  onConfirm: () => void
  isCheckingPayment?: boolean
}

const VendBankTransferModal: React.FC<VendBankTransferModalProps> = ({
  isOpen,
  onRequestClose,
  virtualAccount,
  paymentData,
  onCheckPayment,
  onConfirm,
  isCheckingPayment = false,
}) => {
  const [isCopying, setIsCopying] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [canCheckPayment, setCanCheckPayment] = useState(false)
  const [checkTime] = useState(() => new Date(Date.now() + 60 * 1000)) // 1 minute from now when user can check payment

  useEffect(() => {
    if (!isOpen) return

    const calculateTimeLeft = () => {
      const now = Date.now()
      const diff = checkTime.getTime() - now

      if (diff <= 0) {
        setTimeLeft("Ready")
        setCanCheckPayment(true)
        return
      }

      setCanCheckPayment(false)
      const totalSeconds = Math.floor(diff / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`)
    }

    // Initial calculation
    calculateTimeLeft()

    const intervalId = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(intervalId)
  }, [isOpen, checkTime])

  if (!isOpen || !virtualAccount || !paymentData) return null

  const handleCopy = () => {
    const text = `Account Number: ${virtualAccount.accountNumber}\nBank Name: ${
      virtualAccount.bankName
    }\nPayment Reference: ${virtualAccount.reference}\nAmount: ${
      paymentData.currency
    } ${paymentData.amount.toLocaleString()}\nCustomer: ${paymentData.customerName} (${
      paymentData.customerAccountNumber
    })\nExpires At: ${new Date(virtualAccount.expiresAtUtc).toLocaleString()}`

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
        <div className="flex items-center justify-between border-b bg-[#F9F9F9] px-6 py-4 max-sm:px-3">
          <h2 className="text-lg font-semibold text-gray-900 max-sm:text-base">Bank Transfer Payment</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 max-sm:p-3">
          {/* Payment Status */}

          {/* Payment Summary */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{paymentData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-medium">{paymentData.customerAccountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="text-lg font-bold">
                  {paymentData.currency} {paymentData.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Reference:</span>
                <span className="font-medium">{paymentData.reference}</span>
              </div>
            </div>
          </div>

          {/* Virtual Account Details */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Virtual Account Details</h3>
            <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              <div className="flex flex-col gap-1 rounded-md bg-white p-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-green-700">Account Number</span>
                <span className="select-all text-4xl font-extrabold tracking-[0.12em] text-gray-900 max-sm:text-base sm:text-5xl">
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
                <span className="font-medium">Can Check Payment From:</span>
                <span className="font-semibold">{checkTime.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mb-6">
            <div
              className={`rounded-lg border-2 p-6 text-center ${
                canCheckPayment ? "border-green-300 bg-green-50" : "border-blue-300 bg-blue-50"
              }`}
            >
              <div className="mb-2 text-sm font-semibold uppercase tracking-wide">
                {canCheckPayment ? "Payment Ready to Check" : "Wait Before Checking"}
              </div>
              <div
                className={`text-5xl font-bold tracking-wider ${canCheckPayment ? "text-green-600" : "text-blue-600"}`}
              >
                {timeLeft}
              </div>
              {!canCheckPayment ? (
                <p className="mt-2 text-sm text-gray-600">Make your bank transfer, then wait to check payment status</p>
              ) : (
                <p className="mt-2 text-sm text-green-600">You can now check your payment status!</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          {/* <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-blue-800">Instructions:</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-blue-700">
              <li>Copy the virtual account details above</li>
              <li>Make a bank transfer for the exact amount</li>
              <li>Use the payment reference as the transfer description</li>
              <li>Click "Check Payment" after making the transfer</li>
              <li>Your electricity token will be generated automatically</li>
            </ol>
          </div> */}
        </div>

        <div className="flex flex-col gap-3 border-t bg-white px-6 py-4 max-sm:px-3 sm:flex-row sm:gap-4">
          <ButtonModule variant="secondary" className="flex-1" size="md" onClick={handleCopy}>
            {isCopying ? "Copied!" : "Copy Details"}
          </ButtonModule>
          <ButtonModule
            variant={canCheckPayment ? "primary" : "secondary"}
            className="flex-1"
            size="md"
            onClick={onCheckPayment}
            disabled={!canCheckPayment || isCheckingPayment}
          >
            {!canCheckPayment ? `Wait: ${timeLeft}` : isCheckingPayment ? "Checking..." : "Check Payment"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default VendBankTransferModal
