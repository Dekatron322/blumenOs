"use client"

import React from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { CheckCircle, X } from "lucide-react"

interface CancelPaymentSuccessModalProps {
  isOpen: boolean
  onRequestClose: () => void
  cancelData: any
  onSuccess?: () => void
}

const CancelPaymentSuccessModal: React.FC<CancelPaymentSuccessModalProps> = ({
  isOpen,
  onRequestClose,
  cancelData,
  onSuccess,
}) => {
  if (!isOpen || !cancelData) return null

  const handleClose = () => {
    onRequestClose()
  }

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSuccessClose = () => {
    if (onSuccess) {
      onSuccess()
    }
    handleClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
              <CheckCircle className="size-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Payment Cancelled</h2>
              <p className="text-sm text-gray-500">Payment has been cancelled successfully</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-red-50 p-4">
            <CheckCircle className="size-5 text-red-600" />
            <span className="font-medium text-red-700">Payment Cancelled Successfully!</span>
          </div>

          {/* Cancellation Details */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-3 font-semibold text-gray-900">Cancellation Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Reference:</span>
                <span className="font-medium">{cancelData.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cancelled Amount:</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(cancelData.totalAmountPaid, cancelData.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-medium">{cancelData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account:</span>
                <span className="font-medium">{cancelData.customerAccountNumber}</span>
              </div>
              {cancelData.customerMeterNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Meter:</span>
                  <span className="font-medium">{cancelData.customerMeterNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                  {cancelData.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>This payment has been cancelled and cannot be undone.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
          <ButtonModule
            variant="primary"
            onClick={handleSuccessClose}
            className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
          >
            Done
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CancelPaymentSuccessModal
