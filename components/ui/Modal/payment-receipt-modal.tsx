"use client"

import React, { useRef } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import type { Payment } from "lib/redux/paymentSlice"
import Image from "next/image"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface PaymentReceiptModalProps {
  isOpen: boolean
  onRequestClose: () => void
  payment: Payment | null
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ isOpen, onRequestClose, payment }) => {
  const receiptRef = useRef<HTMLDivElement>(null)

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
    if (!payment) return

    // Create thermal printer optimized receipt (58mm/80mm width)
    const thermalReceiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
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
            border: 1px solid #000;
            padding: 8px;
            margin: 8px 0;
            text-align: center;
          }
          .token-value {
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 2px;
            font-family: monospace;
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
          <div class="bold">PAYMENT RECEIPT</div>
          <div class="stamp">PAID</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Ref:</span>
          <span class="row-value">${payment.reference}</span>
        </div>
        <div class="row">
          <span class="row-label">Date:</span>
          <span class="row-value">${formatDateTime(payment.paidAtUtc)}</span>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="center bold">CUSTOMER DETAILS</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Name:</span>
          <span class="row-value">${payment.customerName}</span>
        </div>
        <div class="row">
          <span class="row-label">Account:</span>
          <span class="row-value">${payment.customerAccountNumber}</span>
        </div>
        ${
          payment.customerMeterNumber
            ? `
        <div class="row">
          <span class="row-label">Meter:</span>
          <span class="row-value">${payment.customerMeterNumber}</span>
        </div>
        `
            : ""
        }
        ${
          payment.customerPhoneNumber
            ? `
        <div class="row">
          <span class="row-label">Phone:</span>
          <span class="row-value">${payment.customerPhoneNumber}</span>
        </div>
        `
            : ""
        }
        ${
          payment.accountType
            ? `
        <div class="row">
          <span class="row-label">Type:</span>
          <span class="row-value">${payment.accountType}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center bold">PAYMENT DETAILS</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Type:</span>
          <span class="row-value">${payment.paymentTypeName || "N/A"}</span>
        </div>
        <div class="row">
          <span class="row-label">Channel:</span>
          <span class="row-value">${payment.channel}</span>
        </div>
        <div class="row">
          <span class="row-label">Status:</span>
          <span class="row-value">${payment.status}</span>
        </div>
        ${
          payment.externalReference
            ? `
        <div class="row">
          <span class="row-label">Ext Ref:</span>
          <span class="row-value">${payment.externalReference}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center bold">ENERGY SUMMARY</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Tariff:</span>
          <span class="row-value">${formatCurrency(payment.tariffRate || 0, payment.currency)}/kWh</span>
        </div>
        <div class="row">
          <span class="row-label">Units:</span>
          <span class="row-value">${payment.units || 0} kWh</span>
        </div>
        <div class="row">
          <span class="row-label">Electricity:</span>
          <span class="row-value">${formatCurrency(payment.electricityAmount || 0, payment.currency)}</span>
        </div>
        <div class="row">
          <span class="row-label">VAT (${((payment.vatRate || 0) * 100).toFixed(1)}%):</span>
          <span class="row-value">${formatCurrency(payment.vatAmount || 0, payment.currency)}</span>
        </div>
        ${
          payment.outstandingDebt || payment.outstandingAfterPayment
            ? `
        <div class="row">
          <span class="row-label">O/S Debt:</span>
          <span class="row-value">${formatCurrency(
            payment.outstandingAfterPayment ?? payment.outstandingDebt ?? 0,
            payment.currency
          )}</span>
        </div>
        `
            : ""
        }
        ${
          payment.debtPayable
            ? `
        <div class="row">
          <span class="row-label">Debt Paid:</span>
          <span class="row-value">${formatCurrency(payment.debtPayable, payment.currency)}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center">
          <div class="bold">TOTAL PAID</div>
          <div class="amount-large">${formatCurrency(payment.amount || payment.totalAmountPaid, payment.currency)}</div>
        </div>
        
        ${
          payment.token
            ? `
        <div class="double-divider"></div>
        <div class="center bold">TOKEN</div>
        <div class="token-box">
          <div class="token-value">${payment.token.token}</div>
          <div style="margin-top: 5px; font-size: 10px;">
            ${payment.token.vendedAmount} ${payment.token.unit}
          </div>
          <div style="font-size: 10px;">Meter: ${payment.token.drn}</div>
        </div>
        `
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
    if (!receiptRef.current || !payment) return

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

      const fileName = `Payment-Receipt-${payment.customerAccountNumber}-${payment.reference}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
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
          <>
            <div ref={receiptRef} className="relative space-y-4 px-4 pb-4 text-sm text-gray-800 sm:space-y-6 sm:px-6">
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
                  <p className="text-xs text-gray-500">Phone: {payment.customerPhoneNumber || "N/A"}</p>
                  <p className="text-xs text-gray-500">Address: {payment.customerAddress || "N/A"}</p>
                  <p className="text-xs text-gray-500">Meter: {payment.customerMeterNumber || "N/A"}</p>
                  <p className="text-xs text-gray-500">Type: {payment.accountType || "N/A"}</p>
                </div>
                <div className="w-full text-left sm:w-auto sm:text-right">
                  <p className="text-xs text-gray-500">Total Amount Paid</p>
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                    {formatCurrency(payment.amount || payment.totalAmountPaid, payment.currency)}
                  </p>
                  <p className="break-words text-xs text-gray-500">Paid at: {formatDateTime(payment.paidAtUtc)}</p>
                  <p className="break-words text-xs text-gray-500">Payment Type: {payment.paymentTypeName}</p>
                </div>
              </div>

              <div className="gap-4 rounded-lg bg-gray-50 p-4">
                <div className="grid w-full grid-cols-1 gap-4 border-b border-dashed border-gray-200 pb-2 sm:grid-cols-2 sm:gap-10">
                  <p className="font-semibold text-gray-600">Payment Details</p>
                  <p className="mt-2 font-semibold text-gray-600 max-sm:hidden sm:mt-0">Energy Summary</p>
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
                      <span className="text-gray-500">External Reference: </span>
                      <span className="break-words font-semibold">{payment.externalReference || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Is Pending: </span>
                      <span className="break-words font-semibold">
                        {payment.isPending ?? payment.status === "Pending" ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="grid w-full grid-cols-1 gap-4 border-b border-dashed border-gray-200 pb-2 sm:hidden sm:grid-cols-2 sm:gap-10">
                    <p className="font-semibold text-gray-600">Payment Details</p>
                    <p className="mt-2 font-semibold text-gray-600 max-sm:hidden sm:mt-0">Energy Summary</p>
                  </div>
                  <div className="space-y-2 sm:mt-0">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tariff Rate: </span>
                      <span className="break-words font-semibold">
                        {formatCurrency(payment.tariffRate || 0, payment.currency)}/kWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Units Purchased: </span>
                      <span className="break-words font-semibold">{payment.units || 0} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">VAT Rate: </span>
                      <span className="break-words font-semibold">{((payment.vatRate || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">VAT Amount: </span>
                      <span className="break-words font-semibold">
                        {formatCurrency(payment.vatAmount || 0, payment.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Electricity Amount: </span>
                      <span className="break-words font-semibold">
                        {formatCurrency(payment.electricityAmount || 0, payment.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Debt Information */}
                <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 pt-4 text-xs sm:grid-cols-2 sm:gap-10">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Outstanding Debt: </span>
                      <span className="break-words font-semibold">
                        {formatCurrency(
                          payment.outstandingAfterPayment ?? payment.outstandingDebt ?? 0,
                          payment.currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Debt Payable: </span>
                      <span className="break-words font-semibold">
                        {formatCurrency(payment.debtPayable || 0, payment.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Token Information */}
                {payment.token && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs">
                    <p className="mb-2 font-medium text-gray-700">Token Information</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Token: </span>
                        <span className="break-words font-mono font-semibold">{payment.token.token}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Vended Amount: </span>
                        <span className="break-words font-semibold">
                          {payment.token.vendedAmount} {payment.token.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Description: </span>
                        <span className="break-words font-semibold">{payment.token.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Meter Number: </span>
                        <span className="break-words font-mono font-semibold">{payment.token.drn}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center text-xs text-gray-500">
                <p>Thank you for your payment!</p>
                <p className="mt-1">This receipt serves as proof of payment.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
              <ButtonModule variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
                Print
              </ButtonModule>
              <ButtonModule variant="primary" onClick={handleDownloadPDF} className="w-full sm:w-auto">
                Download PDF
              </ButtonModule>
            </div>
          </>
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
