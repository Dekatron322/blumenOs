"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"

interface VendToken {
  token: string
  amount: string
  unit: string
  description: string
  meterNumber: string
}

interface CardPaymentModalProps {
  isOpen: boolean
  onRequestClose: () => void
  vendReference?: string | null
  onPaymentConfirmed?: (tokens: VendToken[]) => void
  isCheckingToken?: boolean
  pollingAttempts?: number
  maxPollingAttempts?: number
  paymentStatus?: string
  tokens?: VendToken[]
  meterType?: "prepaid" | "postpaid"
}

const CardPaymentModal: React.FC<CardPaymentModalProps> = ({
  isOpen,
  onRequestClose,
  vendReference,
  onPaymentConfirmed,
  isCheckingToken = false,
  pollingAttempts = 0,
  maxPollingAttempts = 12,
  paymentStatus = "Processing",
  tokens = [],
  meterType = "prepaid",
}) => {
  const [isCopying, setIsCopying] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    const text = `Transaction Reference: ${vendReference || "N/A"}\nPayment Status: ${
      paymentStatus || "Processing"
    }\nPayment Channel: Card`

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
          <h2 className="text-lg font-semibold text-gray-900">Card Payment Processing</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-blue-100">
              {isCheckingToken ? (
                <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              ) : (
                <svg className="size-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              )}
            </div>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {isCheckingToken ? "Confirming Payment" : "Payment Submitted"}
            </h3>

            <p className="text-sm text-gray-600">
              {isCheckingToken
                ? "We're confirming your card payment. This usually takes a few seconds..."
                : "Your card payment has been submitted. We're waiting for confirmation."}
            </p>
          </div>

          {/* Payment Confirmation Status */}
          {isCheckingToken && (
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
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
                    <span className="text-blue-700">Payment Method:</span>
                    <span className="font-medium text-blue-900">Card Payment</span>
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
            <>
              {tokens && tokens.length > 0 ? (
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
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
                    <p className="text-sm text-green-700">Your electricity tokens have been generated</p>
                  </div>

                  {/* Tokens Display */}
                  <div className="mt-4 space-y-2">
                    {tokens.map((token, index) => (
                      <div key={index} className="rounded-md border border-green-200 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Token:</span>
                              <span className="select-all font-mono text-sm font-bold text-green-700">
                                {token.token}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                              ₦{token.amount} {token.unit}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(token.token)
                              setIsCopying(true)
                              setTimeout(() => setIsCopying(false), 2000)
                            }}
                            className="ml-2 rounded-md bg-green-100 p-2 text-green-700 transition-colors hover:bg-green-200"
                          >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="size-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-yellow-800">
                          <strong>How to use your token:</strong>
                        </p>
                        <ul className="mt-1 space-y-1 text-xs text-yellow-700">
                          <li>1. Enter the token on your prepaid meter</li>
                          <li>2. Press the &ldquo;Enter&ldquo; button on your meter</li>
                          <li>3. Wait for confirmation on your meter display</li>
                          <li>4. Save this token for your records</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-green-500">
                      <svg className="size-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-green-900">PAYMENT CONFIRMED</h3>
                      <p className="text-sm text-green-700">Your card payment was successful!</p>
                      <p className="mt-1 text-xs text-green-600">Payment has been applied to your postpaid account</p>
                    </div>
                    <div className="flex size-8 items-center justify-center rounded-full bg-green-500">
                      <svg className="size-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Warning Message */}
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="size-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-amber-800">
                  <strong>Please don&apos;t close this window</strong> while we confirm your payment. Your electricity
                  tokens will be displayed here once payment is confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t bg-white px-6 py-4 sm:flex-row sm:gap-4">
          <ButtonModule variant="secondary" className="flex-1" size="md" onClick={onRequestClose}>
            Close
          </ButtonModule>
          {onPaymentConfirmed &&
            !isCheckingToken &&
            (paymentStatus === "Paid" || paymentStatus === "Confirmed") &&
            ((meterType === "prepaid" && tokens && tokens.length > 0) || meterType === "postpaid") && (
              <ButtonModule
                variant="primary"
                className="flex-1"
                size="md"
                onClick={() => {
                  onPaymentConfirmed(tokens)
                }}
              >
                Done
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

export default CardPaymentModal
