"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import type { Payment } from "lib/redux/paymentSlice"
import Image from "next/image"

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
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-2xl overflow-hidden bg-[#EFEFEF] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-between bg-[#EFEFEF] px-4 pt-4 sm:flex-row sm:px-6">
          <Image src="/kadco.svg" alt="" height={120} width={123} className="max-sm:w-20" />
          <div className="mt-3 text-center sm:mt-0 sm:text-right">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">Payment Receipt</h2>
            {payment && (
              <p className="max-w-[250px] break-words text-xs text-gray-500 sm:max-w-none">
                Reference: {payment.reference}
              </p>
            )}
          </div>
        </div>

        {payment ? (
          <div className="relative space-y-4 px-4 pb-4 text-sm text-gray-800 sm:space-y-6 sm:px-6">
            {/* Paid Stamp Overlay - responsive size and positioning */}
            <div className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 opacity-90 max-sm:right-0 sm:-top-6 sm:left-1/2">
              <Image
                src="/paid-stamp.svg"
                alt="Paid stamp"
                width={190}
                height={190}
                className="h-32 w-32 select-none sm:h-48 sm:w-48 md:h-[190px] md:w-[190px]"
                priority
              />
            </div>

            {/* Top summary */}
            <div className="relative flex flex-col items-start justify-between rounded-lg bg-white p-4 sm:flex-row sm:items-center">
              <div className="mb-3 w-full sm:mb-0 sm:w-auto">
                <p className="text-xs text-gray-500">Customer</p>
                <p className="break-words font-semibold text-gray-900">{payment.customerName}</p>
                <p className="text-xs text-gray-500">Account: {payment.customerAccountNumber}</p>
              </div>
              <div className="w-full text-left sm:w-auto sm:text-right">
                <p className="text-xs text-gray-500">Amount Paid</p>
                <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {formatCurrency(payment.amount, payment.currency)}
                </p>
                <p className="break-words text-xs text-gray-500">Paid at: {formatDateTime(payment.paidAtUtc)}</p>
              </div>
            </div>

            <div className="gap-4 rounded-lg bg-gray-50 p-4">
              <div className="grid w-full grid-cols-1 gap-4 border-b border-dashed border-gray-200 pb-2 sm:grid-cols-2 sm:gap-10">
                <p className="font-semibold text-gray-600">Payment Details</p>
                <p className="mt-2 font-semibold text-gray-600 max-sm:hidden sm:mt-0">Bills Summary</p>
              </div>
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 pt-4 text-xs sm:grid-cols-2 sm:gap-10">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status: </span>
                    <span className="break-words font-semibold">{payment.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Channel: </span>
                    <span className="break-words font-semibold">{payment.channel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Type: </span>
                    <span className="break-words font-semibold">{payment.paymentTypeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recorded By: </span>
                    <span className="break-words font-semibold">{payment.recordedByName}</span>
                  </div>
                </div>
                <div className="grid w-full grid-cols-1 gap-4 border-b border-dashed border-gray-200 pb-2 sm:hidden sm:grid-cols-2 sm:gap-10">
                  <p className="font-semibold text-gray-600">Payment Details</p>
                  <p className="mt-2 font-semibold text-gray-600 max-sm:hidden sm:mt-0">Bills Summary</p>
                </div>
                <div className="space-y-2 sm:mt-0">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bill Period: </span>
                    <span className="break-words font-semibold">{payment.postpaidBillPeriod || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bill Total Due: </span>
                    <span className="break-words font-semibold">
                      {formatCurrency(payment.billTotalDue, payment.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Outstanding Before: </span>
                    <span className="break-words font-semibold">
                      {formatCurrency(payment.outstandingBeforePayment, payment.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Outstanding After: </span>
                    <span className="break-words font-semibold">
                      {formatCurrency(payment.outstandingAfterPayment, payment.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {payment.narrative && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs">
                  <p className="mb-1 font-medium text-gray-700">Narrative</p>
                  <p className="break-words text-gray-600">{payment.narrative}</p>
                </div>
              )}

              {payment.externalReference && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs">
                  <p className="mb-1 font-medium text-gray-700">External Reference</p>
                  <p className="break-words text-gray-600">{payment.externalReference}</p>
                </div>
              )}
            </div>
            <p className="text-center text-xs font-medium">Powered by Blumentechnologies</p>
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
