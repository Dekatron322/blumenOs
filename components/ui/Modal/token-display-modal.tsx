"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import Image from "next/image"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface VendToken {
  token: string
  amount: string
  unit: string
  description: string
  meterNumber: string
}

interface TokenDisplayModalProps {
  isOpen: boolean
  onRequestClose: () => void
  tokenData: VendToken
  vendData?: any
  onDone: () => void
}

const TokenDisplayModal: React.FC<TokenDisplayModalProps> = ({
  isOpen,
  onRequestClose,
  tokenData,
  vendData,
  onDone,
}) => {
  const [isCopying, setIsCopying] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
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
    if (!receiptRef.current || !vendData) return

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

      const fileName = `Token-Receipt-${vendData.customerAccountNumber || "unknown"}-${
        vendData.reference || Date.now()
      }.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  if (!isOpen) return null

  if (showReceipt && vendData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm max-sm:items-end max-sm:px-0"
        onClick={() => setShowReceipt(false)}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="relative w-full max-w-2xl overflow-hidden bg-[#EFEFEF] shadow-2xl max-sm:h-[90vh] max-sm:max-w-full max-sm:rounded-t-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={receiptRef}
            className="relative space-y-4 px-4 pb-4 text-sm text-gray-800 max-sm:h-[calc(100vh-120px)] max-sm:overflow-y-auto sm:space-y-6 sm:px-6"
          >
            {/* Header */}
            <div className="flex flex-col items-center justify-between bg-[#EFEFEF] pt-4 max-sm:px-2 sm:flex-row">
              <Image src="/kadco.svg" alt="Kadco Logo" height={120} width={123} className="max-sm:h-16 max-sm:w-16" />
              <div className="mt-3 text-center max-sm:mt-2 sm:mt-0 sm:text-right">
                <h2 className="text-base font-bold text-gray-900 max-sm:text-sm sm:text-lg">Token Receipt</h2>
                <p className="max-w-[250px] break-words text-xs text-gray-500 max-sm:text-xs sm:max-w-none">
                  Reference: {vendData.reference}
                </p>
              </div>
            </div>

            {/* Paid Stamp Overlay */}
            <div className="pointer-events-none absolute top-10 z-10 -translate-x-1/2 opacity-90 max-sm:left-auto max-sm:right-4 max-sm:translate-x-0 sm:left-1/2">
              <Image
                src="/paid-stamp.svg"
                alt="Paid stamp"
                width={190}
                height={190}
                className="h-24 w-24 select-none max-sm:h-20 max-sm:w-20 sm:h-48 sm:w-48 md:h-[190px] md:w-[190px]"
                priority
              />
            </div>

            {/* Customer and Payment Summary */}
            <div className="relative flex flex-col items-start justify-between rounded-lg bg-white p-4 max-sm:p-3 sm:flex-row sm:items-center">
              <div className="mb-3 w-full max-sm:mb-2 sm:mb-0 sm:w-auto">
                <p className="text-xs text-gray-500 max-sm:text-xs">Customer</p>
                <p className="break-words font-semibold text-gray-900 max-sm:text-sm">
                  {vendData.customerName || "N/A"}
                </p>
                <p className="text-xs text-gray-500 max-sm:text-xs">
                  Account: {vendData.customerAccountNumber || "N/A"}
                </p>
                {vendData.customerAddress && (
                  <p className="text-xs text-gray-500 max-sm:text-xs">Address: {vendData.customerAddress}</p>
                )}
                {vendData.customerPhoneNumber && (
                  <p className="text-xs text-gray-500 max-sm:text-xs">Phone: {vendData.customerPhoneNumber}</p>
                )}
                {vendData.accountType && (
                  <p className="text-xs text-gray-500 max-sm:text-xs">Type: {vendData.accountType}</p>
                )}
              </div>
              <div className="w-full text-left max-sm:mt-2 max-sm:text-left sm:w-auto sm:text-right">
                <p className="text-xs text-gray-500 max-sm:text-xs">Amount Paid</p>
                <p className="text-xl font-bold text-gray-900 max-sm:text-lg sm:text-2xl">
                  {formatCurrency(vendData.totalAmountPaid || 0, vendData.currency || "NGN")}
                </p>
                <p className="break-words text-xs text-gray-500">
                  Paid at: {formatDateTime(vendData.paidAtUtc || new Date().toISOString())}
                </p>
                {vendData.externalReference && (
                  <p className="break-words text-xs text-gray-500 max-sm:text-xs">
                    Ext Ref: {vendData.externalReference}
                  </p>
                )}
              </div>
            </div>

            {/* Token Information */}
            <div className="relative rounded-lg bg-white p-4 max-sm:p-3">
              <div className="mb-4">
                <p className="text-xs text-gray-500 max-sm:text-xs">Electricity Token</p>
                <p className="break-words font-mono text-xl font-bold text-gray-900 max-sm:break-all max-sm:text-lg">
                  {tokenData.token}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 max-sm:grid-cols-1 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-900">
                    {tokenData.amount} {tokenData.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Meter Number</p>
                  <p className="font-mono font-semibold text-gray-900">{tokenData.meterNumber}</p>
                </div>
              </div>
            </div>

            {/* Billing Details */}
            <div className="rounded-lg bg-white p-4 max-sm:p-3">
              <h4 className="mb-3 font-semibold text-gray-600">Billing Details</h4>
              <div className="grid grid-cols-1 gap-3 text-xs max-sm:grid-cols-1 sm:grid-cols-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 max-sm:text-xs">Electricity Amount:</span>
                  <span className="font-semibold">
                    {vendData.electricityAmount
                      ? formatCurrency(vendData.electricityAmount, vendData.currency || "NGN")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 max-sm:text-xs">VAT Rate:</span>
                  <span className="font-semibold">
                    {vendData.vatRate ? `${(vendData.vatRate * 100).toFixed(1)}%` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 max-sm:text-xs">VAT Amount:</span>
                  <span className="font-semibold">
                    {vendData.vatAmount ? formatCurrency(vendData.vatAmount, vendData.currency || "NGN") : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 max-sm:text-xs">Tariff Rate:</span>
                  <span className="font-semibold">
                    {vendData.tariffRate ? formatCurrency(vendData.tariffRate, vendData.currency || "NGN") : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 max-sm:text-xs">Units Purchased:</span>
                  <span className="font-semibold max-sm:text-xs">
                    {vendData.units ? `${vendData.units} kWh` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 max-sm:text-xs">Outstanding Debt:</span>
                  <span className="font-semibold">
                    {vendData.outstandingDebt !== undefined
                      ? formatCurrency(vendData.outstandingDebt, vendData.currency || "NGN")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="gap-4 rounded-lg bg-gray-50 p-4 max-sm:p-3">
              <div className="grid w-full grid-cols-1 gap-4 border-b border-dashed border-gray-200 pb-2 max-sm:grid-cols-1 max-sm:gap-4 sm:grid-cols-2 sm:gap-10">
                <p className="font-semibold text-gray-600 max-sm:text-sm">Payment Details</p>
                <p className="mt-2 font-semibold text-gray-600 max-sm:hidden max-sm:text-sm sm:mt-0">
                  Token Information
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 pt-4 text-xs max-sm:grid-cols-1 max-sm:gap-4 max-sm:text-xs sm:grid-cols-2 sm:gap-10">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Status: </span>
                    <span className="break-words font-semibold max-sm:text-xs">{vendData.status || "Confirmed"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Channel: </span>
                    <span className="break-words font-semibold max-sm:text-xs">
                      {vendData.channel || "Bank Transfer"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Payment Type: </span>
                    <span className="break-words font-semibold max-sm:text-xs">
                      {vendData.paymentTypeName || "Energy Bill"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Reference: </span>
                    <span className="break-words font-semibold max-sm:text-xs">{vendData.reference || "N/A"}</span>
                  </div>
                </div>
                <div className="space-y-2 sm:mt-0">
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Token: </span>
                    <span className="break-words font-semibold max-sm:break-all max-sm:text-xs">{tokenData.token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Units: </span>
                    <span className="break-words font-semibold">
                      {tokenData.amount} {tokenData.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Description: </span>
                    <span className="break-words font-semibold max-sm:text-xs">{tokenData.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Meter Number: </span>
                    <span className="break-words font-semibold max-sm:break-all max-sm:text-xs">
                      {tokenData.meterNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-gray-500 max-sm:px-2 max-sm:pb-4">
              <p className="max-sm:text-xs">Thank you for your payment!</p>
              <p className="mt-1 max-sm:text-xs">This receipt serves as proof of payment.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 max-sm:gap-2 max-sm:px-3 max-sm:py-3 sm:flex-row sm:justify-end sm:px-6">
            <ButtonModule
              variant="outline"
              onClick={() => setShowReceipt(false)}
              className="w-full max-sm:text-sm sm:w-auto"
            >
              Back to Token
            </ButtonModule>
            <ButtonModule variant="outline" onClick={handlePrint} className="w-full max-sm:text-sm sm:w-auto">
              Print
            </ButtonModule>
            <ButtonModule variant="primary" onClick={handleDownloadPDF} className="w-full max-sm:text-sm sm:w-auto">
              Download PDF
            </ButtonModule>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  const handleCopyToken = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(tokenData.token).then(() => {
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
        className="relative w-[90vw] max-w-2xl rounded-lg bg-white shadow-2xl max-sm:flex max-sm:h-[90vh] max-sm:max-w-full max-sm:flex-col max-sm:rounded-t-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b bg-[#F9F9F9] px-6 py-4 max-sm:flex-shrink-0 max-sm:px-3 max-sm:py-3">
          <h2 className="text-lg font-semibold text-gray-900  max-sm:text-sm">Electricity Token Generated</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 max-sm:size-6"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-sm:p-3 max-sm:pb-20">
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-green-100">
              <svg className="size-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h3 className="mb-2 text-lg font-semibold text-green-900">PAYMENT SUCCESSFUL!</h3>
            <p className="text-sm text-gray-600">Your electricity token has been generated successfully.</p>
          </div>

          {/* Token Display Section */}
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
              <h3 className="text-lg font-bold text-green-900">YOUR ELECTRICITY TOKEN</h3>
              <p className="text-sm text-green-700">Copy this token to recharge your prepaid meter</p>
            </div>

            {/* Token Display */}
            <div className="mt-4 space-y-4">
              <div className="rounded-md border border-green-200 bg-white p-4">
                <div className="flex items-center justify-center">
                  <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Token:</span>
                      <span className="select-all text-center font-mono text-2xl font-bold text-green-700 max-sm:text-base">
                        {tokenData.token}
                      </span>
                    </div>
                    <div className="mt-2 justify-end text-center text-gray-600 max-sm:text-xs">
                      Amount: {tokenData.amount} {tokenData.unit}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyToken}
                    className="ml-2 rounded-md bg-green-100 p-2 text-green-700 transition-colors hover:bg-green-200"
                    title="Copy token to clipboard"
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

              {/* Token Details */}
              <div className="rounded-md border border-blue-200 bg-white p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Meter Number</p>
                    <p className="font-mono font-semibold text-gray-900">{tokenData.meterNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-900">
                      {tokenData.amount} {tokenData.unit}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="font-semibold text-gray-900">{tokenData.description}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="size-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-blue-800">
                      <strong>How to use your token:</strong>
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-blue-700">
                      <li>1. Enter the token on your prepaid meter</li>
                      <li>2. Press the &ldquo;Enter&ldquo; button on your meter</li>
                      <li>3. Wait for confirmation on your meter display</li>
                      <li>4. Save this token for your records</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
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
                  <strong>Important:</strong> Keep this token safe and secure. You can view and download a receipt with
                  full payment details.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t bg-white px-6 py-4 sm:flex-row sm:gap-4">
          <ButtonModule variant="secondary" className="flex-1" size="md" onClick={onRequestClose}>
            Close
          </ButtonModule>
          {vendData && (
            <ButtonModule variant="outline" className="flex-1" size="md" onClick={() => setShowReceipt(true)}>
              View Receipt
            </ButtonModule>
          )}
          <ButtonModule variant="primary" className="flex-1" size="md" onClick={onDone}>
            Done
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="md" onClick={handleCopyToken}>
            {isCopying ? "Copied!" : "Copy Token"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TokenDisplayModal
