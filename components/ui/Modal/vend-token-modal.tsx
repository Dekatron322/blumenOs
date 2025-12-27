"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"

interface TokenData {
  token: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

interface VendTokenModalProps {
  isOpen: boolean
  onRequestClose: () => void
  tokenData: TokenData | null
  paymentData: {
    reference: string
    customerName: string
    customerAccountNumber: string
    amount: number
    currency: string
    channel: string
    paidAtUtc: string
  } | null
}

const VendTokenModal: React.FC<VendTokenModalProps> = ({ isOpen, onRequestClose, tokenData, paymentData }) => {
  const [isCopyingToken, setIsCopyingToken] = useState(false)
  const [isCopyingAll, setIsCopyingAll] = useState(false)

  if (!isOpen || !tokenData || !paymentData) return null

  const handleCopyToken = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(tokenData.token).then(() => {
        setIsCopyingToken(true)
        setTimeout(() => setIsCopyingToken(false), 2000)
      })
    }
  }

  const handleCopyAll = () => {
    const text = `Token: ${tokenData.token}\nAmount: ${tokenData.vendedAmount} ${tokenData.unit}\nDescription: ${
      tokenData.description
    }\nDRN: ${tokenData.drn}\nPayment Reference: ${paymentData.reference}\nCustomer: ${
      paymentData.customerName
    }\nAccount Number: ${paymentData.customerAccountNumber}\nAmount Paid: ${
      paymentData.currency
    } ${paymentData.amount.toLocaleString()}\nPayment Channel: ${paymentData.channel}\nDate: ${new Date(
      paymentData.paidAtUtc
    ).toLocaleString()}`

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopyingAll(true)
        setTimeout(() => setIsCopyingAll(false), 2000)
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
          <h2 className="text-lg font-semibold text-gray-900">Vend Successful - Token Information</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-800">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">Vend completed successfully</span>
            </div>
          </div>

          {/* Token Information */}
          <div className="mb-6">
            <h3 className="mb-3 text-base font-semibold text-gray-800">Token Details</h3>
            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
              <div className="flex flex-col gap-1 rounded-md bg-white p-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Electricity Token</span>
                <span className="select-all text-3xl font-extrabold tracking-[0.12em] text-gray-900 sm:text-4xl">
                  {tokenData.token}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Amount</span>
                  <p className="text-lg font-bold text-gray-900">
                    {tokenData.vendedAmount} {tokenData.unit}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Description</span>
                  <p className="text-lg font-bold text-gray-900">{tokenData.description}</p>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">DRN</span>
                <p className="font-mono text-lg font-bold text-gray-900">{tokenData.drn}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-gray-800">Payment Information</h3>
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-medium text-gray-600">Payment Reference:</span>
                <span className="font-semibold">{paymentData.reference}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium text-gray-600">Customer:</span>
                <span className="font-semibold">{paymentData.customerName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium text-gray-600">Account Number:</span>
                <span className="font-semibold">{paymentData.customerAccountNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium text-gray-600">Amount Paid:</span>
                <span className="font-semibold">
                  {paymentData.currency} {paymentData.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium text-gray-600">Payment Channel:</span>
                <span className="font-semibold">{paymentData.channel}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium text-gray-600">Date & Time:</span>
                <span className="font-semibold">{new Date(paymentData.paidAtUtc).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t bg-white px-6 py-4 sm:flex-row sm:gap-4">
          <ButtonModule variant="secondary" className="flex-1" size="md" onClick={handleCopyToken}>
            {isCopyingToken ? "Copied!" : "Copy Token"}
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="md" onClick={handleCopyAll}>
            {isCopyingAll ? "Copied!" : "Copy All Details"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default VendTokenModal
