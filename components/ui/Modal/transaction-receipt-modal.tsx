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
    if (!transaction) return

    // Create thermal printer optimized receipt (58mm/80mm width)
    const thermalReceiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Transaction Receipt</title>
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
          <div class="bold">TRANSACTION RECEIPT</div>
          <div class="stamp">${transaction.status === "Confirmed" ? "PAID" : transaction.status?.toUpperCase()}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Ref:</span>
          <span class="row-value">${transaction.reference}</span>
        </div>
        <div class="row">
          <span class="row-label">Date:</span>
          <span class="row-value">${formatDateTime(transaction.paidAtUtc)}</span>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="center bold">CUSTOMER DETAILS</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Name:</span>
          <span class="row-value">${transaction.customerName}</span>
        </div>
        <div class="row">
          <span class="row-label">Account:</span>
          <span class="row-value">${transaction.customerAccountNumber}</span>
        </div>
        ${
          transaction.agentName
            ? `
        <div class="row">
          <span class="row-label">Agent:</span>
          <span class="row-value">${transaction.agentName}</span>
        </div>
        `
            : ""
        }
        ${
          transaction.areaOfficeName
            ? `
        <div class="row">
          <span class="row-label">Area Office:</span>
          <span class="row-value">${transaction.areaOfficeName}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center bold">TRANSACTION DETAILS</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Channel:</span>
          <span class="row-value">${transaction.channel}</span>
        </div>
        <div class="row">
          <span class="row-label">Type:</span>
          <span class="row-value">${transaction.paymentTypeName}</span>
        </div>
        <div class="row">
          <span class="row-label">Collector:</span>
          <span class="row-value">${transaction.collectorType}</span>
        </div>
        <div class="row">
          <span class="row-label">Status:</span>
          <span class="row-value">${transaction.status}</span>
        </div>
        ${
          transaction.clearanceStatus
            ? `
        <div class="row">
          <span class="row-label">Clearance:</span>
          <span class="row-value">${transaction.clearanceStatus}</span>
        </div>
        `
            : ""
        }
        ${
          transaction.confirmedAtUtc
            ? `
        <div class="row">
          <span class="row-label">Confirmed:</span>
          <span class="row-value">${formatDateTime(transaction.confirmedAtUtc)}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center bold">BILLING SUMMARY</div>
        <div class="divider"></div>
        
        ${
          transaction.tariffRate
            ? `
        <div class="row">
          <span class="row-label">Tariff:</span>
          <span class="row-value">${formatCurrency(transaction.tariffRate, transaction.currency)}/kWh</span>
        </div>
        `
            : ""
        }
        ${
          transaction.units
            ? `
        <div class="row">
          <span class="row-label">Units:</span>
          <span class="row-value">${transaction.units} kWh</span>
        </div>
        `
            : ""
        }
        ${
          transaction.electricityAmount
            ? `
        <div class="row">
          <span class="row-label">Electricity:</span>
          <span class="row-value">${formatCurrency(transaction.electricityAmount, transaction.currency)}</span>
        </div>
        `
            : ""
        }
        ${
          transaction.vatAmount
            ? `
        <div class="row">
          <span class="row-label">VAT:</span>
          <span class="row-value">${formatCurrency(transaction.vatAmount, transaction.currency)}</span>
        </div>
        `
            : ""
        }
        ${
          transaction.debtPayable
            ? `
        <div class="row">
          <span class="row-label">Debt Paid:</span>
          <span class="row-value">${formatCurrency(transaction.debtPayable, transaction.currency)}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center">
          <div class="bold">TOTAL PAID</div>
          <div class="amount-large">${formatCurrency(transaction.amount, transaction.currency)}</div>
        </div>
        
        ${
          transaction.tokens && transaction.tokens.length > 0
            ? transaction.tokens
                .map(
                  (token, index) => `
        <div class="double-divider"></div>
        <div class="center bold">TOKEN ${transaction.tokens.length > 1 ? index + 1 : ""}</div>
        <div class="token-box">
          <div class="token-value">${token.token}</div>
          ${
            token.vendedAmount
              ? `<div style="margin-top: 8px; font-size: 11px;">${token.vendedAmount} ${token.unit || "kWh"}</div>`
              : ""
          }
        </div>
        `
                )
                .join("")
            : ""
        }
        
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
