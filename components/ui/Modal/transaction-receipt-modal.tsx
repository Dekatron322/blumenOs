"use client"

import React, { useRef } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import Image from "next/image"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { PrepaidTransaction } from "lib/redux/metersSlice"

interface TransactionReceiptModalProps {
  isOpen: boolean
  onRequestClose: () => void
  transaction: PrepaidTransaction | null
}

const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({ isOpen, onRequestClose, transaction }) => {
  const receiptRef = useRef<HTMLDivElement>(null)

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

  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !transaction) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#EFEFEF",
      })

      const imgData = canvas.toDataURL("image/png")

      // A5 format: 148 x 210 mm = 420 x 595 points at 72 DPI
      const pageWidth = 420
      const pageHeight = 595
      const margin = 20

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a5",
      })

      pdf.setFillColor(239, 239, 239) // #EFEFEF background
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      // Scale image to fit A5 page with margins
      const maxWidth = pageWidth - margin * 2
      const maxHeight = pageHeight - margin * 2
      const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height)
      const imgWidth = canvas.width * scale
      const imgHeight = canvas.height * scale
      const x = (pageWidth - imgWidth) / 2
      const y = margin

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight)

      const fileName = `Transaction-Receipt-${transaction.customerAccountNumber}-${transaction.reference}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  if (!isOpen || !transaction) return null

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
        <div ref={receiptRef} className="relative space-y-4 px-4 pb-4 text-sm text-gray-800 sm:space-y-6 sm:px-6">
          {/* Header */}
          <div className="flex flex-col items-center justify-between bg-[#EFEFEF] pt-4 sm:flex-row">
            <Image src="/kadco.svg" alt="" height={120} width={123} className="max-sm:w-20" />
            <div className="mt-3 text-center sm:mt-0 sm:text-right">
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">Transaction Receipt</h2>
              <p className="max-w-[250px] break-words text-xs text-gray-500 sm:max-w-none">
                Reference: {transaction.reference}
              </p>
            </div>
          </div>

          {/* Paid Stamp Overlay */}
          <div className="pointer-events-none absolute top-10 z-10 -translate-x-1/2 opacity-90 max-sm:right-0 sm:left-1/2">
            <Image
              src="/paid-stamp.svg"
              alt="Paid stamp"
              width={190}
              height={190}
              className="h-32 w-32 select-none sm:h-48 sm:w-48 md:h-[190px] md:w-[190px]"
              priority
            />
          </div>

          {/* Customer and Payment Summary */}
          <div className="relative flex flex-col items-start justify-between rounded-lg bg-white p-4 sm:flex-row sm:items-center">
            <div className="mb-3 w-full sm:mb-0 sm:w-auto">
              <p className="text-xs text-gray-500">Customer</p>
              <p className="break-words font-semibold text-gray-900">{transaction.customerName}</p>
              <p className="text-xs text-gray-500">Account: {transaction.customerAccountNumber}</p>
              {transaction.agentName && <p className="text-xs text-gray-500">Agent: {transaction.agentName}</p>}
              {transaction.areaOfficeName && (
                <p className="text-xs text-gray-500">Area Office: {transaction.areaOfficeName}</p>
              )}
            </div>
            <div className="w-full text-left sm:w-auto sm:text-right">
              <p className="text-xs text-gray-500">Amount Paid</p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
              <p className="break-words text-xs text-gray-500">Paid at: {formatDateTime(transaction.paidAtUtc)}</p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="rounded-lg bg-white p-4">
            <h4 className="mb-3 font-semibold text-gray-600">Transaction Details</h4>
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Reference:</span>
                <span className="font-medium">{transaction.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`font-medium ${
                    transaction.status === "Confirmed"
                      ? "text-green-600"
                      : transaction.status === "Pending"
                      ? "text-yellow-600"
                      : transaction.status === "Failed"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Channel:</span>
                <span className="font-medium">{transaction.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Collector Type:</span>
                <span className="font-medium">{transaction.collectorType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Type:</span>
                <span className="font-medium">{transaction.paymentTypeName}</span>
              </div>
              {transaction.confirmedAtUtc && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Confirmed At:</span>
                  <span className="font-medium">{formatDateTime(transaction.confirmedAtUtc)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Manual Entry:</span>
                <span className="font-medium">{transaction.isManualEntry ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Clearance Status:</span>
                <span
                  className={`font-medium ${
                    transaction.clearanceStatus === "Cleared"
                      ? "text-green-600"
                      : transaction.clearanceStatus === "ClearedWithCondition"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                >
                  {transaction.clearanceStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Billing Details */}
          <div className="rounded-lg bg-white p-4">
            <h4 className="mb-3 font-semibold text-gray-600">Billing Details</h4>
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">{formatCurrency(transaction.amount, transaction.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Applied:</span>
                <span className="font-medium">{formatCurrency(transaction.amountApplied, transaction.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">VAT Amount:</span>
                <span className="font-medium">{formatCurrency(transaction.vatAmount, transaction.currency)}</span>
              </div>
              {transaction.overPaymentAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Over Payment:</span>
                  <span className="font-medium">
                    {formatCurrency(transaction.overPaymentAmount, transaction.currency)}
                  </span>
                </div>
              )}
              {transaction.vendorCommissionAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendor Commission:</span>
                  <span className="font-medium">
                    {formatCurrency(transaction.vendorCommissionAmount, transaction.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Outstanding Before:</span>
                <span className="font-medium">
                  {formatCurrency(transaction.outstandingBeforePayment, transaction.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Outstanding After:</span>
                <span className="font-medium">
                  {formatCurrency(transaction.outstandingAfterPayment, transaction.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="rounded-lg bg-white p-4">
            <h4 className="mb-3 font-semibold text-gray-600">Additional Information</h4>
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              {transaction.distributionSubstationCode && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Distribution Substation:</span>
                  <span className="font-medium">{transaction.distributionSubstationCode}</span>
                </div>
              )}
              {transaction.feederName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Feeder:</span>
                  <span className="font-medium">{transaction.feederName}</span>
                </div>
              )}
              {transaction.vendorName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendor:</span>
                  <span className="font-medium">{transaction.vendorName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Is Remitted:</span>
                <span className="font-medium">{transaction.isRemitted ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="rounded-lg bg-white p-4 text-center">
            <p className="text-xs text-gray-500">Thank you for your payment!</p>
            <p className="text-xs text-gray-500">This receipt serves as proof of payment</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-gray-200 bg-white p-4">
          <ButtonModule size="sm" variant="outline" onClick={handlePrint}>
            Print
          </ButtonModule>
          <ButtonModule size="sm" variant="outline" onClick={handleDownloadPDF}>
            Download PDF
          </ButtonModule>
          <ButtonModule size="sm" onClick={onRequestClose}>
            Close
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TransactionReceiptModal
