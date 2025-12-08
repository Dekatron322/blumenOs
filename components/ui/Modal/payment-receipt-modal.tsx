"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import type { Payment } from "lib/redux/paymentSlice"

interface PaymentReceiptModalProps {
  isOpen: boolean
  onRequestClose: () => void
  payment: Payment | null
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ isOpen, onRequestClose, payment }) => {
  if (!isOpen) return null

  const formatCurrency = (amount: number, currency: string) => {
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

  const handlePrint = () => {
    window.print()
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
        className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payment Receipt</h2>
            {payment && <p className="text-xs text-gray-500">Reference: {payment.reference}</p>}
          </div>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        {payment ? (
          <div className="space-y-6 px-6 py-4 text-sm text-gray-800">
            {/* Top summary */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-semibold text-gray-900">{payment.customerName}</p>
                <p className="text-xs text-gray-500">Account: {payment.customerAccountNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Amount Paid</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</p>
                <p className="text-xs text-gray-500">Paid at: {formatDateTime(payment.paidAtUtc)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 text-xs">
              <div className="space-y-1">
                <p className="font-medium text-gray-600">Payment Details</p>
                <p>
                  <span className="text-gray-500">Status: </span>
                  <span className="font-semibold">{payment.status}</span>
                </p>
                <p>
                  <span className="text-gray-500">Channel: </span>
                  <span className="font-semibold">{payment.channel}</span>
                </p>
                <p>
                  <span className="text-gray-500">Payment Type: </span>
                  <span className="font-semibold">{payment.paymentTypeName}</span>
                </p>
                <p>
                  <span className="text-gray-500">Recorded By: </span>
                  <span className="font-semibold">{payment.recordedByName}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-600">Bill Summary</p>
                <p>
                  <span className="text-gray-500">Bill Period: </span>
                  <span className="font-semibold">{payment.postpaidBillPeriod || "N/A"}</span>
                </p>
                <p>
                  <span className="text-gray-500">Bill Total Due: </span>
                  <span className="font-semibold">{formatCurrency(payment.billTotalDue, payment.currency)}</span>
                </p>
                <p>
                  <span className="text-gray-500">Outstanding Before: </span>
                  <span className="font-semibold">
                    {formatCurrency(payment.outstandingBeforePayment, payment.currency)}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Outstanding After: </span>
                  <span className="font-semibold">
                    {formatCurrency(payment.outstandingAfterPayment, payment.currency)}
                  </span>
                </p>
              </div>
            </div>

            {payment.narrative && (
              <div className="rounded-lg bg-gray-50 p-3 text-xs">
                <p className="mb-1 font-medium text-gray-700">Narrative</p>
                <p className="text-gray-600">{payment.narrative}</p>
              </div>
            )}

            {payment.externalReference && (
              <div className="rounded-lg bg-gray-50 p-3 text-xs">
                <p className="mb-1 font-medium text-gray-700">External Reference</p>
                <p className="text-gray-600">{payment.externalReference}</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <ButtonModule variant="primary" size="sm" onClick={handlePrint}>
                Print Receipt
              </ButtonModule>
              <ButtonModule variant="outline" size="sm" onClick={onRequestClose}>
                Close
              </ButtonModule>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center px-6 py-10">
            <p className="text-sm text-gray-500">No payment information available.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default PaymentReceiptModal
