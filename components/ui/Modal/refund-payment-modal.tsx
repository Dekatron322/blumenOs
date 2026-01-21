"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearRefundPayment, refundPayment } from "lib/redux/paymentSlice"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { AlertCircle, CheckCircle, RefreshCw, X } from "lucide-react"

interface RefundPaymentModalProps {
  isOpen: boolean
  onRequestClose: () => void
  paymentReference: string
  onSuccess?: () => void
}

const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({
  isOpen,
  onRequestClose,
  paymentReference,
  onSuccess,
}) => {
  const dispatch = useAppDispatch()
  const receiptRef = useRef<HTMLDivElement>(null)

  const { refundPaymentLoading, refundPaymentError, refundPaymentSuccess, refundPaymentData } = useAppSelector(
    (state) => state.payments
  )

  const [reference, setReference] = useState("")
  const [reason, setReason] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setReference(paymentReference)
      setReason("")
      setShowReceipt(false)
    }
  }, [isOpen, paymentReference])

  useEffect(() => {
    if (refundPaymentSuccess && refundPaymentData) {
      setShowReceipt(true)
    }
  }, [refundPaymentSuccess, refundPaymentData])

  useEffect(() => {
    return () => {
      dispatch(clearRefundPayment())
    }
  }, [dispatch])

  if (!isOpen) return null

  const handleClose = () => {
    dispatch(clearRefundPayment())
    setShowReceipt(false)
    setReference("")
    setReason("")
    onRequestClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reference.trim() || !reason.trim()) return

    await dispatch(
      refundPayment({
        refundData: {
          reference: reference.trim(),
          reason: reason.trim(),
        },
      })
    )
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
    if (!refundPaymentData) return

    const receipt = refundPaymentData.receipt
    const tokens = receipt.receipt?.tokens || []
    const mainToken = receipt.token

    const thermalReceiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Refund Receipt</title>
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
            color: #059669;
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
          <div class="bold">REFUND/RE-VEND RECEIPT</div>
          <div class="stamp">REFUNDED</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Original Ref:</span>
          <span class="row-value">${refundPaymentData.originalReference}</span>
        </div>
        <div class="row">
          <span class="row-label">Refund Ref:</span>
          <span class="row-value">${refundPaymentData.refundReference}</span>
        </div>
        <div class="row">
          <span class="row-label">Date:</span>
          <span class="row-value">${formatDateTime(receipt.paidAtUtc)}</span>
        </div>
        <div class="row">
          <span class="row-label">Refund Count:</span>
          <span class="row-value">${refundPaymentData.refundCount} / ${refundPaymentData.refundLimit}</span>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="center bold">CUSTOMER DETAILS</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Name:</span>
          <span class="row-value">${receipt.customerName}</span>
        </div>
        <div class="row">
          <span class="row-label">Account:</span>
          <span class="row-value">${receipt.customerAccountNumber}</span>
        </div>
        ${
          receipt.customerMeterNumber
            ? `
        <div class="row">
          <span class="row-label">Meter:</span>
          <span class="row-value">${receipt.customerMeterNumber}</span>
        </div>
        `
            : ""
        }
        ${
          receipt.customerPhoneNumber
            ? `
        <div class="row">
          <span class="row-label">Phone:</span>
          <span class="row-value">${receipt.customerPhoneNumber}</span>
        </div>
        `
            : ""
        }
        ${
          receipt.customerAddress
            ? `
        <div style="margin: 4px 0;">
          <span class="row-label">Address:</span>
          <div style="font-size: 10px; margin-top: 2px;">${receipt.customerAddress}</div>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center bold">ENERGY SUMMARY</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Tariff:</span>
          <span class="row-value">${formatCurrency(receipt.tariffRate || 0, receipt.currency)}/kWh</span>
        </div>
        <div class="row">
          <span class="row-label">Units:</span>
          <span class="row-value">${receipt.units || 0} kWh</span>
        </div>
        <div class="row">
          <span class="row-label">Electricity:</span>
          <span class="row-value">${formatCurrency(receipt.electricityAmount || 0, receipt.currency)}</span>
        </div>
        <div class="row">
          <span class="row-label">VAT (${((receipt.vatRate || 0) * 100).toFixed(1)}%):</span>
          <span class="row-value">${formatCurrency(receipt.vatAmount || 0, receipt.currency)}</span>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="center">
          <div class="bold">TOTAL AMOUNT</div>
          <div class="amount-large">${formatCurrency(receipt.totalAmountPaid, receipt.currency)}</div>
        </div>
        
        ${
          mainToken
            ? `
        <div class="double-divider"></div>
        <div class="center bold">NEW TOKEN</div>
        <div class="token-box">
          <div class="token-value">${mainToken.token}</div>
          <div style="margin-top: 5px; font-size: 10px;">
            ${mainToken.vendedAmount} ${mainToken.unit}
          </div>
          <div style="font-size: 10px;">Meter: ${mainToken.drn}</div>
        </div>
        `
            : ""
        }
        
        ${
          tokens.length > 0
            ? `
        <div class="double-divider"></div>
        <div class="center bold">ALL TOKENS</div>
        ${tokens
          .map(
            (t) => `
        <div class="token-box">
          <div class="token-value">${t.token}</div>
          <div style="margin-top: 5px; font-size: 10px;">
            ${t.vendedAmount} ${t.unit}
          </div>
          <div style="font-size: 10px;">${t.description}</div>
        </div>
        `
          )
          .join("")}
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center footer">
          <p>Refund/Re-vend successful!</p>
          <p>This receipt serves as proof of refund.</p>
          <p style="margin-top: 10px;">--------------------------------</p>
          <p>Powered by BlumenOS</p>
        </div>
      </body>
      </html>
    `

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
    if (!receiptRef.current || !refundPaymentData) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#EFEFEF",
      })

      const imgData = canvas.toDataURL("image/png")

      const pageWidth = 420
      const pageHeight = 595
      const margin = 20

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a5",
      })

      pdf.setFillColor(239, 239, 239)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      const maxWidth = pageWidth - margin * 2
      const maxHeight = pageHeight - margin * 2
      const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height)
      const imgWidth = canvas.width * scale
      const imgHeight = canvas.height * scale
      const x = (pageWidth - imgWidth) / 2
      const y = margin

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight)

      const fileName = `Refund-Receipt-${refundPaymentData.refundReference}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
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
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
              <RefreshCw className="size-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Refund Payment</h2>
              <p className="text-sm text-gray-500">Re-vend token for prepaid payment</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {!showReceipt ? (
          /* Refund Form */
          <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
            {refundPaymentError && (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="size-5 shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{refundPaymentError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="reference" className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Enter payment reference"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="mb-2 block text-sm font-medium text-gray-700">
                  Reason for Refund <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Enter reason for refund/re-vend"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Important Notice</p>
                  <p className="mt-1">
                    This action will generate a replacement token for the customer. Refund attempts are limited. Please
                    ensure this is a valid refund request.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
              <ButtonModule type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Cancel
              </ButtonModule>
              <ButtonModule
                type="submit"
                variant="primary"
                className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                disabled={refundPaymentLoading || !reference.trim() || !reason.trim()}
              >
                {refundPaymentLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="size-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Process Refund"
                )}
              </ButtonModule>
            </div>
          </form>
        ) : (
          /* Receipt View */
          refundPaymentData && (
            <>
              <div className="bg-[#EFEFEF] px-4 pt-4 sm:px-6">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-100 p-3">
                  <CheckCircle className="size-5 text-emerald-600" />
                  <span className="font-medium text-emerald-700">Refund Successful!</span>
                </div>
              </div>

              <div ref={receiptRef} className="space-y-4 bg-[#EFEFEF] px-4 pb-4 sm:space-y-6 sm:px-6">
                {/* Refund Summary */}
                <div className="rounded-lg bg-white p-4">
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Original Reference</p>
                      <p className="font-semibold text-gray-900">{refundPaymentData.originalReference}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Refund Reference</p>
                      <p className="font-semibold text-gray-900">{refundPaymentData.refundReference}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Refund Count</p>
                      <p className="font-semibold text-gray-900">
                        {refundPaymentData.refundCount} of {refundPaymentData.refundLimit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                        {refundPaymentData.receipt.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="rounded-lg bg-white p-4">
                  <h4 className="mb-3 font-semibold text-gray-900">Customer Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{refundPaymentData.receipt.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account:</span>
                      <span className="font-medium">{refundPaymentData.receipt.customerAccountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Meter:</span>
                      <span className="font-medium">{refundPaymentData.receipt.customerMeterNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{refundPaymentData.receipt.customerPhoneNumber || "N/A"}</span>
                    </div>
                    {refundPaymentData.receipt.customerAddress && (
                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-gray-500">Address:</span>
                        <span className="ml-2 font-medium">{refundPaymentData.receipt.customerAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="rounded-lg bg-white p-4">
                  <h4 className="mb-3 font-semibold text-gray-900">Payment Summary</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Amount:</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(refundPaymentData.receipt.totalAmountPaid, refundPaymentData.receipt.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Units:</span>
                      <span className="font-medium">{refundPaymentData.receipt.units} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Electricity:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          refundPaymentData.receipt.electricityAmount,
                          refundPaymentData.receipt.currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">VAT:</span>
                      <span className="font-medium">
                        {formatCurrency(refundPaymentData.receipt.vatAmount, refundPaymentData.receipt.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Token Display */}
                {refundPaymentData.receipt.token && (
                  <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
                    <h4 className="mb-3 text-center font-semibold text-emerald-800">New Token Generated</h4>
                    <div className="rounded-lg bg-white p-4 text-center">
                      <p className="mb-2 break-all font-mono text-2xl font-bold tracking-wider text-gray-900">
                        {refundPaymentData.receipt.token.token}
                      </p>
                      <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Amount:</strong> {refundPaymentData.receipt.token.vendedAmount}{" "}
                          {refundPaymentData.receipt.token.unit}
                        </span>
                        <span>
                          <strong>Meter:</strong> {refundPaymentData.receipt.token.drn}
                        </span>
                      </div>
                      {refundPaymentData.receipt.token.description && (
                        <p className="mt-2 text-xs text-gray-500">{refundPaymentData.receipt.token.description}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Multiple Tokens from inner receipt */}
                {refundPaymentData.receipt.receipt?.tokens && refundPaymentData.receipt.receipt.tokens.length > 0 && (
                  <div className="rounded-lg bg-white p-4">
                    <h4 className="mb-3 font-semibold text-gray-900">All Tokens</h4>
                    <div className="space-y-3">
                      {refundPaymentData.receipt.receipt.tokens.map((token, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="mb-1 break-all font-mono text-lg font-bold text-gray-900">{token.token}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                            <span>
                              {token.vendedAmount} {token.unit}
                            </span>
                            <span>{token.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center text-xs text-gray-500">
                  <p>Refund/Re-vend completed successfully!</p>
                  <p className="mt-1">This receipt serves as proof of refund.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                <ButtonModule variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
                  Print Receipt
                </ButtonModule>
                <ButtonModule variant="secondary" onClick={handleDownloadPDF} className="w-full sm:w-auto">
                  Download PDF
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  onClick={handleSuccessClose}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                >
                  Done
                </ButtonModule>
              </div>
            </>
          )
        )}
      </motion.div>
    </motion.div>
  )
}

export default RefundPaymentModal
