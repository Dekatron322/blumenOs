"use client"

import React, { useRef } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { CheckCircle, Edit, X } from "lucide-react"

interface EditPaymentSuccessModalProps {
  isOpen: boolean
  onRequestClose: () => void
  editPaymentData: {
    totalAmountPaid: number
    newAmount: number
    reason: string
    effectiveAtUtc: string
    collector?: {
      type: string
      name: string
      agentId: number | null
      agentCode: string | null
      agentType: string | null
      vendorId: number | null
      vendorName: string | null
      staffName: string | null
      customerId: number | null
      customerName: string | null
    }
    token?: {
      token: string
      vendedAmount: string
      unit: string
    } | null
  } | null
  originalAmount?: number // For comparison purposes
  onSuccess?: () => void
}

const EditPaymentSuccessModal: React.FC<EditPaymentSuccessModalProps> = ({
  isOpen,
  onRequestClose,
  editPaymentData,
  originalAmount,
  onSuccess,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !editPaymentData) return null

  const handleClose = () => {
    onRequestClose()
    onSuccess?.()
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

  const handlePrint = () => {
    if (!editPaymentData) return

    const receipt = editPaymentData

    const thermalReceiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Edit Receipt</title>
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
            color: #000;
          }
          .logo {
            width: 35mm;
            max-width: 100%;
            height: auto;
            margin-bottom: 8px;
          }
          .highlight-box {
            border: 2px solid #000;
            padding: 8px;
            margin: 8px 0;
            text-align: center;
            background: #f0f0f0;
          }
          .old-amount {
            text-decoration: line-through;
            color: #666;
            font-size: 14px;
          }
          .new-amount {
            font-size: 16px;
            font-weight: bold;
            color: #000;
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
          <div class="bold">PAYMENT EDIT RECEIPT</div>
          <div class="stamp">EDITED</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Edit Date:</span>
          <span class="row-value">${formatDateTime(editPaymentData.effectiveAtUtc)}</span>
        </div>
        <div class="row">
          <span class="row-label">Edit Reason:</span>
          <span class="row-value">${editPaymentData.reason}</span>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="center bold">AMOUNT CHANGES</div>
        <div class="divider"></div>
        
        <div class="highlight-box">
          <div style="margin-bottom: 5px;">
            <span class="row-label">Old Amount:</span>
            <span class="old-amount">${formatCurrency(originalAmount || 0, "NGN")}</span>
          </div>
          <div>
            <span class="row-label">New Amount:</span>
            <span class="new-amount">${formatCurrency(editPaymentData.newAmount, "NGN")}</span>
          </div>
        </div>
        
        <div class="row" style="margin-top: 8px;">
          <span class="row-label">Difference:</span>
          <span class="row-value" style="color: ${editPaymentData.newAmount > (originalAmount || 0) ? "green" : "red"};>
            ${editPaymentData.newAmount > (originalAmount || 0) ? "+" : ""}${formatCurrency(
              editPaymentData.newAmount - (originalAmount || 0),
              "NGN"
            )}
          </span>
        </div>
        
        <div class="double-divider"></div>
        
        ${
          editPaymentData.token
            ? `
        <div class="double-divider"></div>
        <div class="center bold">TOKEN INFO</div>
        <div class="divider"></div>
        <div class="row">
          <span class="row-label">Token:</span>
          <span class="row-value">${editPaymentData.token.token}</span>
        </div>
        <div class="row">
          <span class="row-label">Units:</span>
          <span class="row-value">${editPaymentData.token.vendedAmount} ${editPaymentData.token.unit}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center footer">
          <div class="bold">Thank you for your payment!</div>
          <div style="margin-top: 5px; font-size: 9px;">
            This receipt serves as proof of payment edit
          </div>
          <div style="margin-top: 3px; font-size: 9px;">
            Generated: ${formatDateTime(new Date().toISOString())}
          </div>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(thermalReceiptContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, canvas.height * (80 / canvas.width)],
      })

      pdf.addImage(imgData, "PNG", 0, 0, 80, canvas.height * (80 / canvas.width))
      pdf.save(`payment-edit-receipt-${formatDateTime(new Date().toISOString()).replace(/[^a-zA-Z0-9]/g, "-")}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
              <Edit className="size-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payment Edited Successfully</h2>
              <p className="text-sm text-gray-500">Payment amount has been updated</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div ref={receiptRef} className="bg-white p-4 sm:p-6">
            {/* Success Message */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="size-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Payment Amount Updated</h3>
              <p className="mt-2 text-gray-600">
                Edit Reason: <span className="font-medium">{editPaymentData.reason}</span>
              </p>
            </div>

            {/* Amount Comparison */}
            <div className="mb-6 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Previous Amount</p>
                  <p className="text-lg font-medium text-gray-900 line-through">
                    {formatCurrency(originalAmount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">New Amount</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(editPaymentData.newAmount)}</p>
                </div>
              </div>
              <div className="mt-3 border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Difference:</span>
                  <span
                    className={`text-lg font-bold ${
                      editPaymentData.newAmount > (originalAmount || 0) ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {editPaymentData.newAmount > (originalAmount || 0) ? "+" : ""}
                    {formatCurrency(editPaymentData.newAmount - (originalAmount || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Payment Details */}
            <div className="mb-6">
              <h4 className="mb-2 text-sm font-medium text-gray-900">Payment Details</h4>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Edit Reason:</span>
                    <span className="font-medium">{editPaymentData.reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Effective Date:</span>
                    <span className="font-medium">{formatDateTime(editPaymentData.effectiveAtUtc)}</span>
                  </div>
                  {editPaymentData.collector && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Edited By:</span>
                      <span className="font-medium">{editPaymentData.collector.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Token Info (if available) */}
            {editPaymentData.token && (
              <div className="mb-6">
                <h4 className="mb-2 text-sm font-medium text-gray-900">Token Information</h4>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Token:</span>
                      <span className="font-mono font-medium">{editPaymentData.token.token}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Units:</span>
                      <span className="font-medium">
                        {editPaymentData.token.vendedAmount} {editPaymentData.token.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
              <p>This receipt serves as proof of payment edit</p>
              <p>Generated: {formatDateTime(new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-gray-200 bg-white p-4 sm:flex-row sm:justify-end sm:px-6">
          <ButtonModule variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
            Print Receipt
          </ButtonModule>
          <ButtonModule variant="secondary" onClick={handleDownloadPDF} className="w-full sm:w-auto">
            Download PDF
          </ButtonModule>
          <ButtonModule
            variant="primary"
            onClick={handleClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
          >
            Done
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default EditPaymentSuccessModal
