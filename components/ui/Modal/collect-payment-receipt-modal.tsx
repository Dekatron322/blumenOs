"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import Image from "next/image"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface CollectPaymentReceiptModalProps {
  isOpen: boolean
  onRequestClose: () => void
  paymentData: {
    reference: string
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
    totalAmountPaid: number
    currency: string
    channel: string
    status?: string
    paymentTypeName?: string
    paidAtUtc: string
    externalReference?: string
  } | null
}

const CollectPaymentReceiptModal: React.FC<CollectPaymentReceiptModalProps> = ({
  isOpen,
  onRequestClose,
  paymentData,
}) => {
  const [isCopyingAll, setIsCopyingAll] = useState(false)
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
    if (!receiptRef.current || !paymentData) return

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

      const fileName = `Payment-Receipt-${paymentData.customerAccountNumber}-${paymentData.reference}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  const handleCopyAll = () => {
    if (!paymentData) return

    const text =
      `Payment Receipt\n` +
      `Reference: ${paymentData.reference}\n` +
      `Customer: ${paymentData.customerName}\n` +
      `Account Number: ${paymentData.customerAccountNumber}\n` +
      `Amount Paid: ${formatCurrency(paymentData.totalAmountPaid, paymentData.currency)}\n` +
      `Payment Type: ${paymentData.paymentTypeName}\n` +
      `Payment Channel: ${paymentData.channel}\n` +
      `Status: ${paymentData.status}\n` +
      `Paid At: ${formatDateTime(paymentData.paidAtUtc)}\n` +
      (paymentData.customerMeterNumber ? `Meter Number: ${paymentData.customerMeterNumber}\n` : "") +
      (paymentData.customerAddress ? `Address: ${paymentData.customerAddress}\n` : "") +
      (paymentData.customerPhoneNumber ? `Phone: ${paymentData.customerPhoneNumber}\n` : "") +
      (paymentData.externalReference ? `External Reference: ${paymentData.externalReference}\n` : "")

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopyingAll(true)
        setTimeout(() => setIsCopyingAll(false), 2000)
      })
    }
  }

  if (!isOpen || !paymentData) return null

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
          <div className="flex flex-col items-center justify-between bg-[#EFEFEF]  pt-4 sm:flex-row ">
            <Image src="/kadco.svg" alt="" height={120} width={123} className="max-sm:w-20" />
            <div className="mt-3 text-center sm:mt-0 sm:text-right">
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">Payment Receipt</h2>
              <p className="max-w-[250px] break-words text-xs text-gray-500 sm:max-w-none">
                Reference: {paymentData.reference}
              </p>
            </div>
          </div>

          {/* Paid Stamp Overlay */}
          <div className="pointer-events-none absolute  top-10 z-10 -translate-x-1/2 opacity-90 max-sm:right-0 sm:left-1/2">
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
              <p className="break-words font-semibold text-gray-900">{paymentData.customerName}</p>
              <p className="text-xs text-gray-500">Account: {paymentData.customerAccountNumber}</p>
              {paymentData.customerAddress && (
                <p className="text-xs text-gray-500">Address: {paymentData.customerAddress}</p>
              )}
              {paymentData.customerPhoneNumber && (
                <p className="text-xs text-gray-500">Phone: {paymentData.customerPhoneNumber}</p>
              )}
              {paymentData.customerMeterNumber && (
                <p className="text-xs text-gray-500">Meter: {paymentData.customerMeterNumber}</p>
              )}
              {paymentData.accountType && <p className="text-xs text-gray-500">Type: {paymentData.accountType}</p>}
            </div>
            <div className="w-full text-left sm:w-auto sm:text-right">
              <p className="text-xs text-gray-500">Amount Paid</p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                {formatCurrency(paymentData.totalAmountPaid, paymentData.currency)}
              </p>
              <p className="break-words text-xs text-gray-500">Paid at: {formatDateTime(paymentData.paidAtUtc)}</p>
              {paymentData.externalReference && (
                <p className="break-words text-xs text-gray-500">Ext Ref: {paymentData.externalReference}</p>
              )}
            </div>
          </div>

          {/* Billing Details */}
          <div className="rounded-lg bg-white p-4">
            <h4 className="mb-3 font-semibold text-gray-600">Billing Details</h4>
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Type:</span>
                <span className="font-medium">{paymentData.paymentTypeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Channel:</span>
                <span className="font-medium">{paymentData.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`font-medium capitalize ${
                    paymentData.status === "Confirmed"
                      ? "text-green-600"
                      : paymentData.status === "Pending"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                >
                  {paymentData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tariff Rate:</span>
                <span className="font-medium">₦{(paymentData.tariffRate || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="rounded-lg bg-white p-4">
            <h4 className="mb-3 font-semibold text-gray-600">Financial Breakdown</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Electricity Amount:</span>
                <span className="font-medium">
                  {formatCurrency(paymentData.electricityAmount || 0, paymentData.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">VAT Amount:</span>
                <span className="font-medium">{formatCurrency(paymentData.vatAmount || 0, paymentData.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Outstanding Debt:</span>
                <span className="font-medium">
                  {formatCurrency(paymentData.outstandingDebt || 0, paymentData.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Debt Payable:</span>
                <span className="font-medium">
                  {formatCurrency(paymentData.debtPayable || 0, paymentData.currency)}
                </span>
              </div>
              <div className="mt-2 border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Total Amount Paid:</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(paymentData.totalAmountPaid, paymentData.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>Thank you for your payment!</p>
            <p className="mt-1">This receipt serves as proof of payment.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t bg-white px-6 py-4 max-sm:px-3 sm:gap-4">
          <ButtonModule variant="secondary" className="flex w-full" size="md" onClick={handleCopyAll}>
            {isCopyingAll ? "Copied!" : "Copy Details"}
          </ButtonModule>
          <ButtonModule variant="outline" className="flex w-full" size="md" onClick={handleDownloadPDF}>
            Download PDF
          </ButtonModule>
          <ButtonModule variant="primary" className="flex w-full" size="md" onClick={onRequestClose}>
            Close
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CollectPaymentReceiptModal
