"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"

interface SuperAdminBankTransferProps {
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
    customerAddress?: string
    customerPhoneNumber?: string
    customerMeterNumber?: string
    accountType?: string
    tariffRate?: number
    units?: number
    vatRate?: number
    vatAmount?: number
    electricityAmount?: number
    outstandingDebt?: number
    debtPayable?: number
    totalAmountPaid?: number
    status?: string
    paymentTypeName?: string
  } | null
  onCheckPayment: () => void
  onConfirm: () => void
  isCheckingPayment?: boolean
}

const SuperAdminBankTransfer: React.FC<SuperAdminBankTransferProps> = ({
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
  const [isPolling, setIsPolling] = useState(false)
  const [pollingAttempts, setPollingAttempts] = useState(0)

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

  // Reset polling state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsPolling(false)
      setPollingAttempts(0)
    }
  }, [isOpen])

  // Short polling logic
  useEffect(() => {
    if (!isPolling) return

    const pollInterval = setInterval(async () => {
      try {
        setPollingAttempts((prev) => prev + 1)

        // Call the check payment function
        await onCheckPayment()

        // Check if payment is confirmed and has token - this will be handled by the parent component
        // The polling will stop automatically when the modal closes due to token being found

        // If we reach max attempts (30 attempts = 5 minutes at 10 second intervals), stop polling
        if (pollingAttempts >= 30) {
          setIsPolling(false)
          setPollingAttempts(0)
        }
      } catch (error) {
        console.error("Polling error:", error)
        // Stop polling on error
        setIsPolling(false)
        setPollingAttempts(0)
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(pollInterval)
  }, [isPolling, pollingAttempts, onCheckPayment])

  if (!isOpen || !virtualAccount || !paymentData) return null

  const handleCheckPayment = () => {
    if (!canCheckPayment || isCheckingPayment) return

    setIsPolling(true)
    setPollingAttempts(0)
  }

  const handleCopy = () => {
    const text = `Account Number: ${virtualAccount.accountNumber}\nBank Name: ${
      virtualAccount.bankName
    }\nPayment Reference: ${virtualAccount.reference}\nAmount: ${
      paymentData.currency
    } ${paymentData.totalAmountPaid?.toLocaleString()}\nCustomer: ${paymentData.customerName} (${
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
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm max-sm:items-end max-sm:px-0"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative flex max-h-[90vh] w-[90vw] max-w-2xl flex-col rounded-lg bg-white shadow-2xl max-sm:h-[90vh] max-sm:max-w-full max-sm:rounded-t-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b bg-[#F9F9F9] px-6 py-4 max-sm:px-3 max-sm:py-3">
          <h2 className="text-lg font-semibold text-gray-900 max-sm:text-sm">Bank Transfer Payment</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 max-sm:size-6"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-sm:p-3 max-sm:pb-20">
          {/* Payment Status */}

          {/* Payment Summary */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 max-sm:mb-4 max-sm:p-3">
            <h3 className="mb-3 text-sm font-semibold text-gray-800 max-sm:text-xs">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 max-sm:text-xs">Customer:</span>
                <span className="font-medium max-sm:text-xs">{paymentData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 max-sm:text-xs">Account Number:</span>
                <span className="font-medium max-sm:text-xs">{paymentData.customerAccountNumber}</span>
              </div>
              {paymentData.customerMeterNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600 max-sm:text-xs">Meter Number:</span>
                  <span className="font-medium max-sm:text-xs">{paymentData.customerMeterNumber}</span>
                </div>
              )}
              {paymentData.customerPhoneNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600 max-sm:text-xs">Phone Number:</span>
                  <span className="font-medium max-sm:text-xs">{paymentData.customerPhoneNumber}</span>
                </div>
              )}
              {/* {paymentData.customerAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="max-w-[60%] text-right font-medium">{paymentData.customerAddress}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-medium capitalize">{paymentData.accountType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Type:</span>
                <span className="font-medium">{paymentData.paymentTypeName}</span>
              </div>
              {paymentData.tariffRate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tariff Rate:</span>
                  <span className="font-medium">₦{paymentData.tariffRate.toFixed(2)}</span>
                </div>
              )}
              {paymentData.units && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Units:</span>
                  <span className="font-medium">{paymentData.units.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Electricity Amount:</span>
                <span className="font-medium">₦{paymentData.electricityAmount?.toLocaleString()}</span>
              </div>
              {paymentData.vatAmount && paymentData.vatAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT Amount:</span>
                  <span className="font-medium">₦{paymentData.vatAmount.toLocaleString()}</span>
                </div>
              )}
              {paymentData.outstandingDebt && paymentData.outstandingDebt > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Outstanding Debt:</span>
                  <span className="font-medium">₦{paymentData.outstandingDebt.toLocaleString()}</span>
                </div>
              )} */}
              <div className="flex justify-between">
                <span className="text-gray-600 max-sm:text-xs">Total Amount Paid:</span>
                <span className="text-lg font-bold max-sm:text-base max-sm:font-semibold">
                  {paymentData.currency} {paymentData.totalAmountPaid?.toLocaleString()}
                </span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-gray-600">Payment Reference:</span>
                <span className="font-medium">{paymentData.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-medium capitalize ${
                    paymentData.status === "Pending"
                      ? "text-amber-600"
                      : paymentData.status === "Completed"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {paymentData.status}
                </span>
              </div> */}
            </div>
          </div>

          {/* Virtual Account Details */}
          <div className="mb-6 max-sm:mb-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800 max-sm:text-xs">Virtual Account Details</h3>
            <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 max-sm:p-3 max-sm:text-xs">
              <div className="flex flex-col gap-1 rounded-md bg-white p-3 text-center max-sm:p-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-green-700 max-sm:text-xs">
                  Account Number
                </span>
                <span className="select-all text-3xl font-extrabold tracking-[0.12em] text-gray-900 max-sm:text-2xl max-sm:tracking-normal sm:text-5xl">
                  {virtualAccount.accountNumber}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium max-sm:text-xs">Bank Name:</span>
                <span className="font-semibold max-sm:text-xs">{virtualAccount.bankName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium max-sm:text-xs">Payment Reference:</span>
                <span className="font-semibold max-sm:break-all max-sm:text-xs">{virtualAccount.reference}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium max-sm:text-xs">Expires At:</span>
                <span className="font-semibold max-sm:text-xs">
                  {new Date(virtualAccount.expiresAtUtc).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Confirmation Status */}
          {isPolling && (
            <div className="mt-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 max-sm:mt-3 max-sm:p-3">
              <div className="flex items-center justify-center gap-3">
                <div className="flex size-4 animate-pulse rounded-full bg-blue-500"></div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-blue-900 max-sm:text-base max-sm:font-semibold">
                    PAYMENT CONFIRMATION IN PROGRESS
                  </h3>
                  <p className="text-sm text-blue-700 max-sm:text-xs">Checking your payment every 10 seconds...</p>
                  <p className="mt-1 text-xs text-blue-600 max-sm:text-xs">Please wait while we confirm your payment</p>
                </div>
                <div className="flex size-4 animate-pulse rounded-full bg-blue-500"></div>
              </div>
              {/* Payment Check Details */}
              <div className="mt-4 rounded-md bg-white p-3 max-sm:mt-2 max-sm:p-2">
                <div className="space-y-2 text-sm max-sm:text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-700 max-sm:text-xs">Reference:</span>
                    <span className="font-mono font-medium text-blue-900 max-sm:text-xs max-sm:font-normal">
                      {paymentData?.reference || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 max-sm:text-xs">Status:</span>
                    <span
                      className={`font-medium max-sm:text-xs ${
                        paymentData?.status === "Paid" || paymentData?.status === "Confirmed"
                          ? "text-green-600"
                          : paymentData?.status === "Pending"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    >
                      {paymentData?.status || "Processing"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 max-sm:text-xs">Payment Check:</span>
                    <span className="font-medium text-blue-900 max-sm:text-xs">
                      <span className="flex items-center gap-2">
                        <span>{pollingAttempts}/30 attempts</span>
                        <span className="text-xs text-blue-600 max-sm:text-xs">
                          (~{Math.round((30 - pollingAttempts) * 0.17)}min left)
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3 overflow-hidden rounded-full bg-blue-200">
                  <div
                    className="h-2 bg-blue-600 transition-all duration-300"
                    style={{ width: `${(pollingAttempts / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {/* <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-blue-800">Instructions:</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-blue-700">
              <li>Copy the virtual account details above</li>
              <li>Make a bank transfer for the exact amount</li>
              <li>Click "Check Payment" after making the transfer</li>
              <li>Your electricity token will be generated automatically</li>
            </ol>
          </div> */}
        </div>

        <div className="flex flex-shrink-0 gap-3 border-t bg-white px-6 py-4 max-sm:gap-2 max-sm:px-3 max-sm:py-3 sm:flex-row sm:gap-4">
          <ButtonModule variant="secondary" className="flex w-full max-sm:text-sm" size="sm" onClick={handleCopy}>
            {isCopying ? "Copied!" : "Copy Details"}
          </ButtonModule>
          <ButtonModule
            variant={isPolling ? "secondary" : canCheckPayment ? "primary" : "secondary"}
            className="flex w-full max-sm:text-sm"
            size="sm"
            onClick={handleCheckPayment}
            disabled={!canCheckPayment || isCheckingPayment || isPolling}
          >
            {!canCheckPayment
              ? `Wait: ${timeLeft}`
              : isPolling
              ? `Checking... (${pollingAttempts}/30)`
              : isCheckingPayment
              ? "Checking..."
              : "Check Payment"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SuperAdminBankTransfer
