"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import Image from "next/image"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface TokenData {
  token: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

interface SuperAdminVendTokenModalProps {
  isOpen: boolean
  onRequestClose: () => void
  tokenData: TokenData | null
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

const SuperAdminVendTokenModal: React.FC<SuperAdminVendTokenModalProps> = ({
  isOpen,
  onRequestClose,
  tokenData,
  paymentData,
}) => {
  const [isCopyingToken, setIsCopyingToken] = useState(false)
  const [isCopyingAll, setIsCopyingAll] = useState(false)
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
    if (!paymentData || !tokenData) return

    // Create thermal printer optimized receipt (58mm/80mm width)
    const thermalReceiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Token Receipt</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.4;
            width: 80mm;
            padding: 5mm;
            background: white;
            color: black;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .double-divider {
            border-top: 2px solid #000;
            margin: 8px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
          }
          .row-label { text-align: left; }
          .row-value { text-align: right; font-weight: bold; }
          .header { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          .subheader { font-size: 10px; margin-bottom: 10px; }
          .amount-large { font-size: 18px; font-weight: bold; }
          .footer { font-size: 10px; margin-top: 10px; }
          .stamp { 
            font-size: 20px; 
            font-weight: bold; 
            border: 2px solid #000; 
            padding: 5px 15px; 
            display: inline-block;
            margin: 10px 0;
          }
          .logo {
            width: 35mm;
            max-width: 100%;
            height: auto;
            margin-bottom: 8px;
          }
          .token-box {
            border: 2px solid #000;
            padding: 10px;
            margin: 10px 0;
            text-align: center;
            background: #f5f5f5;
          }
          .token-value {
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 2px;
            font-family: monospace;
            word-break: break-all;
          }
          @media print {
            body { width: 80mm; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <img src="${window.location.origin}/kadco.svg" alt="KADCO" class="logo" />
          <div class="divider"></div>
          <div class="bold">TOKEN RECEIPT</div>
          <div class="stamp">PAID</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Ref:</span>
          <span class="row-value">${paymentData.reference}</span>
        </div>
        <div class="row">
          <span class="row-label">Date:</span>
          <span class="row-value">${formatDateTime(paymentData.paidAtUtc)}</span>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="center bold">CUSTOMER DETAILS</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Name:</span>
          <span class="row-value">${paymentData.customerName}</span>
        </div>
        <div class="row">
          <span class="row-label">Account:</span>
          <span class="row-value">${paymentData.customerAccountNumber}</span>
        </div>
        ${
          paymentData.customerAddress
            ? `
        <div class="row">
          <span class="row-label">Address:</span>
          <span class="row-value" style="max-width: 60%; text-align: right;">${paymentData.customerAddress}</span>
        </div>
        `
            : ""
        }
        ${
          tokenData.drn
            ? `
        <div class="row">
          <span class="row-label">Meter:</span>
          <span class="row-value">${tokenData.drn}</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.customerPhoneNumber
            ? `
        <div class="row">
          <span class="row-label">Phone:</span>
          <span class="row-value">${paymentData.customerPhoneNumber}</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.accountType
            ? `
        <div class="row">
          <span class="row-label">Type:</span>
          <span class="row-value">${paymentData.accountType}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center bold">PAYMENT DETAILS</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Channel:</span>
          <span class="row-value">${paymentData.channel}</span>
        </div>
        <div class="row">
          <span class="row-label">Status:</span>
          <span class="row-value">${paymentData.status || "Confirmed"}</span>
        </div>
        ${
          paymentData.paymentTypeName
            ? `
        <div class="row">
          <span class="row-label">Type:</span>
          <span class="row-value">${paymentData.paymentTypeName}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center bold">BILLING SUMMARY</div>
        <div class="divider"></div>
        
        ${
          paymentData.tariffRate
            ? `
        <div class="row">
          <span class="row-label">Tariff:</span>
          <span class="row-value">${formatCurrency(paymentData.tariffRate, paymentData.currency)}/kWh</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.units
            ? `
        <div class="row">
          <span class="row-label">Units:</span>
          <span class="row-value">${paymentData.units} kWh</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.electricityAmount
            ? `
        <div class="row">
          <span class="row-label">Electricity:</span>
          <span class="row-value">${formatCurrency(paymentData.electricityAmount, paymentData.currency)}</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.vatAmount
            ? `
        <div class="row">
          <span class="row-label">VAT:</span>
          <span class="row-value">${formatCurrency(paymentData.vatAmount, paymentData.currency)}</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.debtPayable
            ? `
        <div class="row">
          <span class="row-label">Debt Paid:</span>
          <span class="row-value">${formatCurrency(paymentData.debtPayable, paymentData.currency)}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center">
          <div class="bold">TOTAL PAID</div>
          <div class="amount-large">${formatCurrency(paymentData.totalAmountPaid, paymentData.currency)}</div>
        </div>
        
        <div class="double-divider"></div>
        <div class="center bold">TOKEN</div>
        <div class="token-box">
          <div class="token-value">${tokenData.token}</div>
          <div style="margin-top: 8px; font-size: 11px;">
            ${tokenData.vendedAmount} ${tokenData.unit}
          </div>
          ${tokenData.drn ? `<div style="font-size: 10px; margin-top: 4px;">Meter: ${tokenData.drn}</div>` : ""}
        </div>
        
        <div class="double-divider"></div>
        
        <div class="center footer">
          <p>Thank you for your payment!</p>
          <p>This receipt serves as proof of payment.</p>
          <p style="margin-top: 10px;">--------------------------------</p>
          <p>Powered by BlumenOS</p>
        </div>
      </body>
      </html>
    `

    // Create a hidden iframe for printing without opening a new page
    const printFrame = document.createElement("iframe")
    printFrame.style.position = "absolute"
    printFrame.style.top = "-9999px"
    printFrame.style.left = "-9999px"
    printFrame.style.width = "0"
    printFrame.style.height = "0"
    printFrame.style.border = "none"
    document.body.appendChild(printFrame)

    const frameDoc = printFrame.contentWindow?.document
    if (frameDoc) {
      frameDoc.open()
      frameDoc.write(thermalReceiptContent)
      frameDoc.close()

      setTimeout(() => {
        printFrame.contentWindow?.focus()
        printFrame.contentWindow?.print()
        setTimeout(() => {
          document.body.removeChild(printFrame)
        }, 500)
      }, 250)
    }
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

      const fileName = `Token-Receipt-${paymentData.customerAccountNumber}-${paymentData.reference}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  if (!isOpen || !tokenData || !paymentData) return null

  if (showReceipt) {
    // Show Receipt Modal
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
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">Token Receipt</h2>
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

            {/* Token Information */}
            {/* <div className="relative rounded-lg bg-white p-4">
              <div className="mb-4">
                <p className="text-xs text-gray-500">Electricity Token</p>
                <p className="break-words font-mono text-xl font-bold text-gray-900">{tokenData.token}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-900">
                    {tokenData.vendedAmount} {tokenData.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Meter Number</p>
                  <p className="font-mono font-semibold text-gray-900">{tokenData.drn}</p>
                </div>
              </div>
            </div> */}

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
                  <span className="text-gray-500">Electricity Amount:</span>
                  <span className="font-semibold">
                    {paymentData.electricityAmount
                      ? formatCurrency(paymentData.electricityAmount, paymentData.currency)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">VAT Rate:</span>
                  <span className="font-semibold">
                    {paymentData.vatRate ? `${(paymentData.vatRate * 100).toFixed(1)}%` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">VAT Amount:</span>
                  <span className="font-semibold">
                    {paymentData.vatAmount ? formatCurrency(paymentData.vatAmount, paymentData.currency) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tariff Rate:</span>
                  <span className="font-semibold">
                    {paymentData.tariffRate ? formatCurrency(paymentData.tariffRate, paymentData.currency) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Units Purchased:</span>
                  <span className="font-semibold">{paymentData.units ? `${paymentData.units} kWh` : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Outstanding Debt:</span>
                  <span className="font-semibold">
                    {paymentData.outstandingDebt !== undefined
                      ? formatCurrency(paymentData.outstandingDebt, paymentData.currency)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="gap-4 rounded-lg bg-gray-50 p-4">
              <div className="grid w-full grid-cols-1 gap-4 border-b border-dashed border-gray-200 pb-2 sm:grid-cols-2 sm:gap-10">
                <p className="font-semibold text-gray-600">Payment Details</p>
                <p className="mt-2 font-semibold text-gray-600 max-sm:hidden sm:mt-0">Token Information</p>
              </div>
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 pt-4 text-xs sm:grid-cols-2 sm:gap-10">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status: </span>
                    <span className="break-words font-semibold">{paymentData.status || "Confirmed"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Channel: </span>
                    <span className="break-words font-semibold">{paymentData.channel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Type: </span>
                    <span className="break-words font-semibold">{paymentData.paymentTypeName || "Energy Bill"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference: </span>
                    <span className="break-words font-semibold">{paymentData.reference}</span>
                  </div>
                </div>
                <div className="space-y-2 sm:mt-0">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Token: </span>
                    <span className="break-words font-semibold">{tokenData.token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Units: </span>
                    <span className="break-words font-semibold">
                      {tokenData.vendedAmount} {tokenData.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Description: </span>
                    <span className="break-words font-semibold">{tokenData.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Meter Number: </span>
                    <span className="break-words font-semibold">{tokenData.drn}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-gray-500">
              <p>Thank you for your payment!</p>
              <p className="mt-1">This receipt serves as proof of payment.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            <ButtonModule variant="outline" onClick={() => setShowReceipt(false)} className="w-full sm:w-auto">
              Back to Token
            </ButtonModule>
            <ButtonModule variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
              Print
            </ButtonModule>
            <ButtonModule variant="primary" onClick={handleDownloadPDF} className="w-full sm:w-auto">
              Download PDF
            </ButtonModule>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Show Token Modal

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
    } ${paymentData.totalAmountPaid.toLocaleString()}\nPayment Channel: ${paymentData.channel}\nDate: ${new Date(
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
        <div className="flex items-center justify-between border-b bg-[#F9F9F9] px-6 py-4 max-sm:px-3">
          <h2 className="text-lg font-semibold text-gray-900 max-sm:text-base">Vend Successful </h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 max-sm:p-3">
          {/* <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
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
          </div> */}

          {/* Token Information */}
          <div className="mb-6 max-sm:mb-4">
            <h3 className="mb-3 text-base font-semibold text-gray-800">Token Details</h3>
            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
              <div className="flex flex-col gap-1 rounded-md bg-white p-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Electricity Token</span>
                <span className="select-all text-3xl font-extrabold tracking-[0.12em] text-gray-900 max-sm:text-base sm:text-3xl">
                  {tokenData.token}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 max-sm:text-xs">
                    Amount
                  </span>
                  <p className="text-lg font-bold text-gray-900 max-sm:text-sm">
                    {tokenData.vendedAmount} {tokenData.unit}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 max-sm:text-xs">
                    Meter Number
                  </span>
                  <p className="font-mono text-lg font-bold text-gray-900 max-sm:text-sm">{tokenData.drn}</p>
                </div>
                {/* <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Description</span>
                  <p className="text-lg font-bold text-gray-900">{tokenData.description}</p>
                </div> */}
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
                  {paymentData.currency} {paymentData.totalAmountPaid.toLocaleString()}
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

        <div className="flex gap-3  border-t bg-white px-6 py-4 max-sm:px-3  sm:gap-4">
          <ButtonModule variant="secondary" className="flex w-full" size="md" onClick={handleCopyToken}>
            {isCopyingToken ? "Copied!" : "Copy Token"}
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex w-full"
            size="md"
            onClick={() => {
              setShowReceipt(true)
              setTimeout(() => handlePrint(), 100)
            }}
          >
            Print Receipt
          </ButtonModule>
          <ButtonModule variant="outline" className="flex w-full" size="md" onClick={() => setShowReceipt(true)}>
            View Receipt
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SuperAdminVendTokenModal
