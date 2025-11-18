// components/PostpaidBillDetailsModal.tsx
"use client"

import React, { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { Download, Printer } from "lucide-react"
import { PostpaidBill } from "lib/redux/postpaidSlice"
import * as QRCode from "qrcode"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface PostpaidBillDetailsModalProps {
  isOpen: boolean
  onRequestClose: () => void
  bill: PostpaidBill | null
  loading?: boolean
}

const PostpaidBillDetailsModal: React.FC<PostpaidBillDetailsModalProps> = ({
  isOpen,
  onRequestClose,
  bill,
  loading = false,
}) => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusConfig = (status: number) => {
    const configs = {
      0: { color: "text-amber-600", bg: "bg-amber-50", label: "PENDING" },
      1: { color: "text-emerald-600", bg: "bg-emerald-50", label: "PAID" },
      2: { color: "text-red-600", bg: "bg-red-50", label: "OVERDUE" },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const handlePrint = () => {
    window.print()
  }

  // Generate QR code data for the invoice
  const generateQRCodeData = () => {
    if (!bill) return ""

    const invoiceData = {
      accountNumber: bill.customerAccountNumber,
      accountName: bill.customerName,
      period: bill.period,
      totalDue: bill.totalDue,
      dueDate: bill.dueDate,
      invoiceDate: bill.createdAt,
      consumption: bill.consumptionKwh,
      company: "KAD-ELEC",
      type: "ELECTRICITY_BILL",
    }

    return JSON.stringify(invoiceData)
  }

  // Generate scannable QR code
  const generateQRCode = async () => {
    if (!qrCodeRef.current || !bill) return

    try {
      const qrData = generateQRCodeData()

      await QRCode.toCanvas(qrCodeRef.current, qrData, {
        width: 120,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      })
    } catch (err) {
      console.error("Error generating QR code:", err)
      // Fallback: Draw simple QR code pattern
      const canvas = qrCodeRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "#000000"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText("QR ERROR", canvas.width / 2, canvas.height / 2)
      }
    }
  }

  // Download PDF functionality
  const handleDownload = async () => {
    if (!invoiceRef.current || !bill) return

    const downloadButton = document.querySelector("[data-download-button]") as HTMLButtonElement | null
    const originalHtml = downloadButton?.innerHTML

    try {
      // Show loading state
      if (downloadButton) {
        downloadButton.innerHTML =
          '<div class="flex items-center gap-2"><div class="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>Generating PDF...</div>'
        downloadButton.disabled = true
      }

      // Capture the invoice content
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      // Create PDF with margins
      const imgData = canvas.toDataURL("image/png")

      // Define margins (in px since we use "px" as unit)
      const margin = 32 // adjust this value for more/less margin
      const pageWidth = canvas.width + margin * 2
      const pageHeight = canvas.height + margin * 2

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [pageWidth, pageHeight],
      })

      // Optional: fill background (some viewers show transparent areas as gray)
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      // Draw the captured invoice centered with margins
      pdf.addImage(imgData, "PNG", margin, margin, canvas.width, canvas.height)

      // Generate filename
      const fileName = `KAD-ELEC-Invoice-${bill.customerAccountNumber}-${bill.period.replace(/\s+/g, "-")}.pdf`

      // Download PDF
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      // Restore button state
      if (downloadButton && originalHtml != null) {
        downloadButton.innerHTML = originalHtml
        downloadButton.disabled = false
      }
    }
  }

  // Initialize QR code when component mounts or bill changes
  useEffect(() => {
    if (bill && isOpen) {
      generateQRCode()
    }
  }, [bill, isOpen])

  if (!isOpen) return null

  const statusConfig = bill ? getStatusConfig(bill.status) : getStatusConfig(0)

  // Calculate invoice values based on actual API response structure
  const calculateInvoiceValues = () => {
    if (!bill) return { subtotal: 0, tax: 0, discount: 0, grandTotal: 0 }

    // Using actual fields from the API response
    const subtotal = bill.currentBillAmount + bill.openingBalance - bill.paymentsPrevMonth
    const tax = bill.vatAmount
    const discount = 0 // No discount field in API, set to 0
    const grandTotal = bill.totalDue

    return { subtotal, tax, discount, grandTotal }
  }

  const invoiceValues = calculateInvoiceValues()

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
        className="relative flex h-[95vh] w-[90vw] max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between border-b bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto">
          <div className="relative z-10 p-8">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="size-8 animate-spin text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-gray-600">Loading bill details...</p>
                </div>
              </div>
            ) : bill ? (
              <>
                {/* Visible invoice content (also used for PDF capture) */}
                <div ref={invoiceRef} className="">
                  {/* Header */}
                  <div className="flex justify-between">
                    <div className="mb-8 text-center">
                      <img src="/kad.svg" alt="KAD-ELEC Logo" />
                    </div>
                    <div className="mb-8 text-center">
                      <h1 className="mb-2 font-bold text-gray-900">KAD-ELEC.</h1>
                      <div className="bg-[#6EAD2A] p-1 text-sm font-semibold text-white">
                        #{bill.customerAccountNumber}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Grid */}
                  <div className="mb-8 flex items-center justify-between gap-8 rounded-2xl bg-gradient-to-r from-[#008001] to-[#51A31D] p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#ffffff]">
                          ACCOUNT NUMBER
                        </div>
                        <div className="text-lg font-bold text-[#95EE94]">{bill.customerAccountNumber}</div>
                      </div>
                      <div>
                        <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#ffffff]">
                          ACCOUNT NAME
                        </div>
                        <div className="text-lg font-bold text-[#95EE94]">{bill.customerName}</div>
                      </div>
                      <div>
                        <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#ffffff]">DATE</div>
                        <div className="text-lg font-bold text-[#95EE94]">{formatDate(bill.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center justify-center rounded-md bg-white p-2 shadow-sm">
                        <canvas ref={qrCodeRef} width="120" height="120" className="border border-gray-200" />
                      </div>
                      <div className="mt-2 text-xs font-medium text-white">SCAN TO VERIFY INVOICE</div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-white">
                          AREA OFFICE / SERVICE CENTER
                        </div>
                        <div className="text-lg text-[#95EE94]">
                          {bill.areaOfficeName} / {bill.areaOfficeName}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-white">BILL PERIOD</div>
                        <div className="text-lg text-[#95EE94]">{bill.period}</div>
                      </div>
                      <div>
                        <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-white">
                          CITY / STATE
                        </div>
                        <div className="text-lg text-[#95EE94]">Kaduna / Kaduna</div>
                      </div>
                    </div>
                  </div>

                  {/* Billing Details */}
                  <div className="mb-8 grid grid-cols-2 overflow-hidden rounded-2xl border bg-white">
                    <div className="space-y-3">
                      <div className="w-full bg-[#6CAD2B] px-4 py-3 text-sm font-semibold text-gray-100">
                        BILLING INFORMATION
                      </div>
                      <div className="flex w-full justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">11 KV Feeder:</span>
                        <span className="ml-2 text-sm text-gray-900">11 KVA {bill.feederName}</span>
                      </div>
                      <div className="flex w-full justify-between bg-[#EBEBEB] px-4 py-3">
                        <span className="text-sm font-semibold text-gray-600">33 KV Injection:</span>
                        <span className="ml-2 text-sm text-gray-900">33 KV {bill.distributionSubstationCode}</span>
                      </div>
                      <div className="flex w-full justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">DT Code:</span>
                        <span className="text-sm text-gray-900">{bill.distributionSubstationCode}</span>
                      </div>
                      <div className="flex w-full justify-between bg-[#EBEBEB] px-4 py-3">
                        <span className="text-sm font-semibold text-gray-600">Last Payment Amount:</span>
                        <span className="ml-2 text-sm text-gray-900">{formatCurrency(bill.paymentsPrevMonth)}</span>
                      </div>
                      <div className="flex w-full justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">Last Payment Date:</span>
                        <span className="ml-2 text-sm text-gray-900">{formatShortDate(bill.lastUpdated)}</span>
                      </div>
                      <div className="flex w-full justify-between bg-[#EBEBEB] px-4 py-3">
                        <span className="text-sm font-semibold text-gray-600">Consumption:</span>
                        <span className="ml-2 text-sm text-gray-900">{bill.consumptionKwh}kwh</span>
                      </div>
                      <div className="flex w-full justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">Tariff Rate:</span>
                        <span className="ml-2 text-sm text-gray-900">{formatCurrency(bill.tariffPerKwh)}/kwh</span>
                      </div>
                      <div className="flex w-full justify-between bg-[#EBEBEB] px-4 py-3">
                        <span className="text-sm font-semibold text-gray-600">Payment Status:</span>
                        <span className="ml-2 text-sm text-gray-900">{statusConfig.label}</span>
                      </div>
                    </div>

                    <div className="space-y-3 border-l border-gray-200 bg-[#EBEBEB] pb-4">
                      <div className="flex w-full justify-between bg-[#008001] px-4 py-3 text-sm font-semibold text-gray-100">
                        <p>Charges</p>
                        <p>Total</p>
                      </div>
                      <div className="flex items-center justify-between px-4 pt-3">
                        <span className="text-sm font-semibold text-gray-600">Opening Balance:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(bill.openingBalance)}</span>
                      </div>
                      <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">Adjustment:</span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(bill.adjustedOpeningBalance - bill.openingBalance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">Total Payment Amount:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(bill.paymentsPrevMonth)}</span>
                      </div>
                      <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">Net Arrears:</span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(bill.openingBalance - bill.paymentsPrevMonth)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">Energy Charged:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(bill.chargeBeforeVat)}</span>
                      </div>
                      <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">Fixed Charged:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(0)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-gray-200 px-4 pt-2">
                        <span className="text-sm font-semibold text-gray-600">SUBTOTAL:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(invoiceValues.subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">TAX VAT {bill.vatRate}%:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(bill.vatAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between px-4">
                        <span className="text-sm font-semibold text-gray-600">Current Bill Amount:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(bill.currentBillAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thank You Message */}
                  <div className="flex w-full items-stretch overflow-hidden rounded-2xl">
                    <div className="flex h-20 w-1/2 items-center bg-[#6BAE2A] p-4">
                      <div className="text-lg font-semibold text-[#ffffff]">THANK YOU FOR YOUR BUSINESS</div>
                    </div>
                    <div className="flex h-20 w-1/2 flex-col items-end justify-center bg-[#008001] px-4 text-end">
                      <div className="mb-1 text-sm font-semibold text-[#ffffff]">GRAND TOTAL</div>
                      <div className="text-2xl font-bold text-[#ffffff]">{formatCurrency(bill.totalDue)}</div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {bill.isEstimated && (
                    <div className="mt-4 rounded-lg bg-amber-50 p-4">
                      <div className="flex items-center">
                        <svg className="mr-2 size-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-semibold text-amber-800">Estimated Bill</span>
                      </div>
                      <p className="mt-1 text-sm text-amber-700">
                        This bill is estimated based on forecasted consumption of {bill.forecastConsumptionKwh}kwh.
                      </p>
                    </div>
                  )}

                  {/* Active Dispute Warning */}
                  {bill.activeDispute && (
                    <div className="mt-4 rounded-lg bg-red-50 p-4">
                      <div className="flex items-center">
                        <svg className="mr-2 size-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-semibold text-red-800">Active Dispute</span>
                      </div>
                      <p className="mt-1 text-sm text-red-700">Reason: {bill.activeDispute.reason}</p>
                      <p className="text-sm text-red-700">Raised: {formatDate(bill.activeDispute.raisedAtUtc)}</p>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="mt-8 border-y border-t border-[#008002] py-3 pt-4 text-center text-sm text-gray-600">
                    <div className="mb-2 text-[#008002]">
                      Contact Us: Mail@Kadunaelectric.Com / Phone: +234(903)1754067 / Web: www.kadelectric.com
                    </div>
                  </div>

                  <div className="mt-4 bg-[#008002] p-4 text-center text-sm font-semibold text-white">
                    POWERED BY BLUMENTECHNOLOGIES LTD
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="mb-2 text-lg text-red-500">No bill data available</div>
                  <p className="text-gray-600">Please try again later</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 border-t bg-white p-6">
          <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={onRequestClose}>
            Close
          </ButtonModule>
          {bill && (
            <>
              <ButtonModule variant="outline" className="flex items-center gap-2" size="lg" onClick={handlePrint}>
                <Printer className="size-4" />
                Print Invoice
              </ButtonModule>
              <ButtonModule
                variant="primary"
                className="flex items-center gap-2"
                size="lg"
                onClick={handleDownload}
                data-download-button
              >
                <Download className="size-4" />
                Download PDF
              </ButtonModule>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PostpaidBillDetailsModal
