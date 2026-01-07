"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"

interface GeneratedVirtualAccount {
  accountNumber: string
  bankName: string
  reference: string
  expiresAtUtc: string
}

interface VendToken {
  token: string
  amount: string
  unit: string
  description: string
  meterNumber: string
}

interface BankTransferDetailsModalProps {
  isOpen: boolean
  onRequestClose: () => void
  virtualAccount?: GeneratedVirtualAccount | null
  vendReference?: string | null
  onPaymentConfirmed?: (tokens: VendToken[]) => void
  onIHavePaid?: () => void
  isCheckingToken?: boolean
  pollingAttempts?: number
  maxPollingAttempts?: number
  paymentStatus?: string
  meterType?: "prepaid" | "postpaid"
}

const generateRandomVirtualAccount = (): GeneratedVirtualAccount => {
  const banks = ["Demo Bank", "Altima Bank", "Universal Trust Bank", "Metro Capital Bank", "Gateway Bank"]

  const randomBank = banks[Math.floor(Math.random() * banks.length)] || "Demo Bank"
  const accountNumber = String(Math.floor(10_000_000 + Math.random() * 89_000_000))
  const reference = `PAY-${Date.now()}`
  const expiresAtUtc = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  return {
    accountNumber,
    bankName: randomBank,
    reference,
    expiresAtUtc,
  }
}

const BankTransferDetailsModal: React.FC<BankTransferDetailsModalProps> = ({
  isOpen,
  onRequestClose,
  virtualAccount: propVirtualAccount,
  vendReference,
  onIHavePaid,
  isCheckingToken = false,
  pollingAttempts = 0,
  maxPollingAttempts = 12,
  paymentStatus = "Processing",
  meterType = "prepaid",
}) => {
  const [isCopying, setIsCopying] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [virtualAccount, setVirtualAccount] = useState<GeneratedVirtualAccount | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Use the passed virtual account if available, otherwise generate mock data
      setVirtualAccount(propVirtualAccount || generateRandomVirtualAccount())
      setTimeLeft("")
    } else {
      setVirtualAccount(null)
      setTimeLeft("")
    }
  }, [isOpen, propVirtualAccount])

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

          {/* Payment Confirmation Status */}
          {isCheckingToken && (
            <div className="mt-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex size-4 animate-pulse rounded-full bg-blue-500"></div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-blue-900">PAYMENT CONFIRMATION IN PROGRESS</h3>
                  <p className="text-sm text-blue-700">Checking your payment every 30 seconds...</p>
                  <p className="mt-1 text-xs text-blue-600">Please wait while we confirm your payment</p>
                </div>
                <div className="flex size-4 animate-pulse rounded-full bg-blue-500"></div>
              </div>
              {/* Payment Check Details */}
              <div className="mt-4 rounded-md bg-white p-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Reference:</span>
                    <span className="font-mono font-medium text-blue-900">{vendReference || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Status:</span>
                    <span
                      className={`font-medium ${
                        paymentStatus === "Paid" || paymentStatus === "Confirmed"
                          ? "text-green-600"
                          : paymentStatus === "Pending"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    >
                      {paymentStatus || "Processing"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Payment Check:</span>
                    <span className="font-medium text-blue-900">
                      <span className="flex items-center gap-2">
                        <span>
                          {pollingAttempts}/{maxPollingAttempts} attempts
                        </span>
                        <span className="text-xs text-blue-600">
                          (~{Math.round((maxPollingAttempts - pollingAttempts) * 0.5)}min left)
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3 overflow-hidden rounded-full bg-blue-200">
                  <div
                    className="h-2 bg-blue-600 transition-all duration-300"
                    style={{ width: `${(pollingAttempts / maxPollingAttempts) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Success Status */}
          {!isCheckingToken && (paymentStatus === "Paid" || paymentStatus === "Confirmed") && (
            <div className="mt-4 rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <div className="text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-green-500">
                  <svg className="size-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-900">PAYMENT CONFIRMED!</h3>
                <p className="text-sm text-green-700">Your bank transfer payment was successful!</p>
                <p className="mt-1 text-xs text-green-600">Payment has been applied to your postpaid account</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t bg-white px-6 py-4 sm:flex-row sm:gap-4">
          <ButtonModule variant="secondary" className="flex-1" size="md" onClick={onRequestClose}>
            Close
          </ButtonModule>
          {onIHavePaid && (
            <ButtonModule
              variant="primary"
              className="flex-1"
              size="md"
              onClick={() => {
                onIHavePaid()
                onRequestClose()
              }}
              disabled={isCheckingToken}
            >
              {isCheckingToken ? "Checking..." : "I have paid"}
            </ButtonModule>
          )}
          <ButtonModule variant="primary" className="flex-1" size="md" onClick={handleCopy}>
            {isCopying ? "Copied" : "Copy payment info"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default BankTransferDetailsModal
