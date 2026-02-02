// components/PostpaidBillDetailsModal.tsx
"use client"

import React, { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { Download, Printer } from "lucide-react"
import { PostpaidBill } from "lib/redux/postpaidSlice"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Adjustment } from "../../../lib/redux/postpaidSlice"

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
  const barcodeRef = useRef<HTMLCanvasElement>(null)
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

  const getCustomerStatusLabel = (code?: string | null) => {
    switch (code) {
      case "02":
        return "Active"
      case "04":
        return "Suspended"
      case "05":
        return "PPM"
      case "07":
        return "Inactive"
      default:
        return code || "Unknown"
    }
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

  const handleShare = async () => {
    if (!invoiceRef.current || !bill) return

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
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

      pdf.setFillColor(255, 255, 255)
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

      const fileName = `KAD-ELEC-Invoice-${bill.customerAccountNumber}-${bill.period.replace(/\s+/g, "-")}.pdf`

      const blob = pdf.output("blob")

      if (
        navigator.canShare &&
        navigator.canShare({ files: [new File([blob], fileName, { type: "application/pdf" })] })
      ) {
        const file = new File([blob], fileName, { type: "application/pdf" })
        await navigator.share({
          files: [file],
          title: "KAD-ELEC Invoice",
          text: `Invoice for account ${bill.customerAccountNumber} (${bill.period})`,
        })
      } else {
        pdf.save(fileName)
      }
    } catch (error) {
      console.error("Error sharing invoice:", error)
      alert("Error sharing invoice. Please try again.")
    }
  }

  // Generate simple 1D-style barcode on canvas using the account number
  const generateBarcode = () => {
    if (!barcodeRef.current || !bill) return

    const canvas = barcodeRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const value = String(bill.customerAccountNumber || "")

    // Canvas sizing for crisp lines
    const width = 220
    const height = 60
    canvas.width = width
    canvas.height = height

    // Background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, width, height)

    // Basic hash from the value to vary bar patterns
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0
    }

    const barWidth = 2
    const totalBars = Math.floor(width / barWidth)

    for (let i = 0; i < totalBars; i++) {
      // Derive a pseudo-random pattern from the hash and index
      const bit = (hash >> i % 32) & 1
      if (bit === 1) {
        ctx.fillStyle = "#000000"
        ctx.fillRect(i * barWidth, 4, barWidth, height - 16)
      }
    }

    // Draw the human-readable value below the bars
    ctx.fillStyle = "#000000"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "bottom"
    ctx.fillText(value, width / 2, height - 2)
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

      // A5 format: 148 x 210 mm = 420 x 595 points at 72 DPI
      const pageWidth = 420
      const pageHeight = 595
      const margin = 20

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a5",
      })

      // Optional: fill background (some viewers show transparent areas as gray)
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      // Scale image to fit A5 page with margins
      const maxWidth = pageWidth - margin * 2
      const maxHeight = pageHeight - margin * 2
      const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height)
      const imgWidth = canvas.width * scale
      const imgHeight = canvas.height * scale
      const x = (pageWidth - imgWidth) / 2
      const y = margin

      // Draw the captured invoice centered with margins
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight)

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

  // Initialize barcode when component mounts or bill changes
  useEffect(() => {
    if (bill && isOpen) {
      generateBarcode()
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
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A5;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            width: 420pt;
            height: 595pt;
            background: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-hide {
            display: none !important;
          }

          .a5-container {
            width: 420pt !important;
            height: 595pt !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }

          .a5-content {
            padding: 10pt !important;
            font-size: 8pt !important;
          }

          .a5-small-text {
            font-size: 7pt !important;
          }

          .a5-header {
            height: 30pt !important;
          }

          .a5-section {
            margin-bottom: 8pt !important;
          }

          .a5-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 4pt !important;
          }

          .a5-col {
            padding: 4pt !important;
          }

          .force-black-white {
            color: black !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-bg-green {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-bg-light-green {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-white-text {
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-hide-label {
            display: none !important;
          }

          .print-show-value {
            display: block !important;
            text-align: right !important;
            font-weight: normal !important;
            justify-content: flex-end !important;
            margin-left: auto !important;
            width: 100% !important;
          }

          .print-show-value > * {
            text-align: right !important;
            justify-content: flex-end !important;
          }

          .bg-white .print-show-value {
            text-align: right !important;
            justify-content: flex-end !important;
            margin-left: auto !important;
            width: 100% !important;
          }

          [style*="background-color"] {
            background-color: white !important;
          }

          .print-no-border {
            border: none !important;
          }

          .print-no-border-r {
            border-right: none !important;
          }

          .print-no-border-t {
            border-top: none !important;
          }

          .print-no-border-b {
            border-bottom: none !important;
          }

          .print-no-border-l {
            border-left: none !important;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm print:bg-white print:backdrop-blur-0"
        onClick={onRequestClose}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="a5-container relative flex h-[95vh] w-[90vw] max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl print:h-[595px] print:w-[420px] print:max-w-none print:rounded-none print:shadow-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex w-full items-center justify-between border-b bg-white p-6 print:hidden">
            <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
            <button
              onClick={onRequestClose}
              className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="relative flex-1 overflow-y-auto print:overflow-visible">
            <div className="a5-content relative z-10 p-8 print:p-4">
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
                  <div ref={invoiceRef} className="w-full print:p-0">
                    {/* Header - A5 Optimized */}
                    <div className="a5-header mb-6 flex items-center justify-between print:mb-2">
                      <div className="w-24 text-center print:w-20">
                        <img src="/kad.svg" alt="KAD-ELEC Logo" className="h-10 print:hidden" />
                      </div>

                      <div className="flex flex-1 justify-center">
                        <canvas ref={barcodeRef} className="h-12 w-40 print:h-10 print:w-36" />
                      </div>

                      <div className="w-24 text-center print:w-20">
                        <h1 className="mb-1 text-[9pt] font-bold text-gray-900 print:hidden">KAD-ELEC.</h1>
                        <div className="bg-[#6EAD2A] p-1 text-xs font-semibold text-white print:bg-white print:py-0.5 print:text-[7pt] print:text-black">
                          #{bill.customerAccountNumber}
                        </div>
                      </div>
                    </div>

                    {/* Billing Information */}
                    <div className="a5-section">
                      <div className="print-bg-green print-white-text flex w-full items-center justify-center bg-[#004B23] p-1.5 text-xs font-semibold text-white print:bg-white print:text-black">
                        <p className="print:invisible">BILLING INFORMATION</p>
                      </div>

                      <div className="print-no-border flex w-full border border-gray-300 bg-white text-[8pt] print:text-[7pt]">
                        <div className="print-no-border-r w-3/5 space-y-0.5 border-r border-gray-300">
                          <div className="print-bg-light-green print-white-text flex w-full items-center justify-between bg-[#6CAD2B] px-2 py-1 font-semibold">
                            <p className="print-hide-label">AREA OFFICE</p>
                            <div className="flex items-center justify-center bg-white px-4 text-center print:flex-grow print:justify-end">
                              <p className="print-show-value text-black">
                                {bill.customer?.areaOfficeName || bill.areaOfficeName || "-"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 px-2 ">
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Bill #:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.billingId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Bill Month:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.name}</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Customer Account:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.customerAccountNumber}</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Account Name:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {bill.customer?.fullName || bill.customerName}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Address:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {bill.customer?.address || "-"}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Phone Number:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {bill.customer?.phoneNumber || "-"}
                              </span>
                            </div>
                            <div className=" flex justify-between">
                              <span className="print-hide-label font-semibold">City:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.customer?.city || "-"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-2/5 space-y-0.5">
                          <div
                            className="print-white-text flex w-full items-center justify-between bg-[#008001] px-2 py-1 font-semibold print:bg-white print:text-black"
                            style={{ backgroundColor: "#008001" }}
                          >
                            <p className="print:invisible">SERVICE CENTER:</p>
                            <div className="flex items-center justify-center bg-white px-4 print:flex-grow print:justify-end">
                              <p className="print-show-value text-[7pt] text-black">
                                {bill.customer?.serviceCenterName || "-"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 px-2">
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">State:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.customer?.state || "-"}</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">11KV Feeder:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.feederName}</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">33KV Feeder:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {bill.distributionSubstationCode || bill.customer?.distributionSubstationCode || "-"}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">DT Name:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {bill.distributionSubstationCode || bill.customer?.distributionSubstationCode || "-"}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Sales Rep:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {bill.customer?.salesRepUser?.fullName || "-"}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Meter:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {bill.customer?.salesRepUser?.fullName || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Multiplier:</span>
                              <span className="print-show-value px-2 font-semibold">1.0</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Billing Charges */}
                    <div className="a5-section">
                      <div className="print-bg-green print-white-text flex w-full items-center justify-center bg-[#004B23] p-1.5 text-xs font-semibold text-white print:bg-white print:text-black">
                        <p className="print:invisible">BILLING CHARGES</p>
                      </div>

                      <div className="print-no-border flex w-full border border-gray-300 bg-white text-[8pt] print:text-[7pt]">
                        <div className="print-no-border-r w-3/5 space-y-0.5 border-r border-gray-300">
                          <div className="print-bg-light-green print-white-text flex w-full items-center justify-between bg-[#6CAD2B] px-2 py-1 font-semibold">
                            <p className="print-hide-label">CHARGES</p>
                            <p className="print-hide-label">TOTAL</p>
                          </div>

                          <div className="space-y-2 px-2 ">
                            <div className="mt-2 flex justify-between">
                              <span className="print-hide-label font-semibold">Last Payment Date:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {formatShortDate(bill.lastUpdated)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Last Payment Amount:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {formatCurrency(bill.paymentsPrevMonth)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">ADC:</span>
                              <span className="print-show-value px-2 font-semibold">9.14 kwh</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Present Reading:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.presentReadingKwh}</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Previous Reading:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.previousReadingKwh}</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Consumption:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.consumptionKwh}kwh</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Tariff Rate:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.tariffPerKwh}</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Tariff Class:</span>
                              <span className="print-show-value px-2 font-semibold">{bill.tariffPerKwh}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-2/5 space-y-0.5">
                          <div
                            className="print-white-text flex w-full items-center justify-between bg-[#008001] px-2 py-1 font-semibold print:bg-white print:text-black"
                            style={{ backgroundColor: "#008001" }}
                          >
                            <p className="print-hide-label">CHARGES</p>
                            <p className="print-hide-label">TOTAL</p>
                          </div>

                          <div className="space-y-2 px-2 ">
                            <div className="mt-2 flex justify-between">
                              <span className="print-hide-label font-semibold">Status Code:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {getCustomerStatusLabel(bill.customer?.statusCode)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Opening Balance:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {formatCurrency(bill.openingBalance)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Adjustment:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {formatCurrency(bill.adjustedOpeningBalance)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Total Payment Amt:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {formatCurrency(bill.currentBillAmount)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Net Arrears:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {formatCurrency(bill.openingBalance - bill.paymentsPrevMonth)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Energy Charged:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {formatCurrency(bill.chargeBeforeVat)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">Fixed Charge:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {formatCurrency(bill.actualBillAmount)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="print-hide-label font-semibold">VAT:</span>
                              <span className="print-show-value px-2 font-semibold">
                                {formatCurrency(bill.vatAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Due */}
                    <div className="print-no-border flex w-full border border-gray-300">
                      <div className="print-bg-light-green w-3/5 bg-[#6CAD2B]">
                        <div className="px-2 py-1.5">&nbsp;</div>
                      </div>

                      <div className="w-2/5 bg-[#E1E1E1]">
                        <div
                          className="print-white-text flex w-full items-center justify-between bg-[#008001] px-2 py-1.5 font-semibold print:bg-white print:text-black"
                          style={{ backgroundColor: "#008001" }}
                        >
                          <p className="text-[8pt] print:invisible">TOTAL DUE:</p>
                          <div className="flex items-center justify-center bg-white px-4 py-0.5 print:-mt-5 print:flex-grow print:justify-end">
                            <p className="print-show-value text-[8pt] font-bold text-black">
                              {formatCurrency(bill.totalDue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Notice */}
                    <div className="flex">
                      <div className="a5-small-text print-no-border mb-4 w-[60%] border border-gray-300 p-2 text-[6pt]  print:text-[5pt]">
                        <p className="mt-1  font-semibold print:text-[6pt]">IMPORTANT PAYMENT INFORMATION</p>
                        <p className="font-semibold print:text-[6pt]">
                          PAY ON OR BEFORE DUE DATE 11/15/2025 TO AVOID DISCONNECTION | PAY AT ANY OF OUR OFFICES OR TO
                          OUR SALES REPS USING OUR POSes OR ALTERNATIVE PAYMENT CHANNELS |{" "}
                          <b>ALWAYS DEMAND FOR RECEIPT AFTER PAYMENT IS MADE</b>
                        </p>
                      </div>
                      <div className="w-[40%]"></div>
                    </div>

                    {/* Summary Section */}
                    <div className="a5-small-text print-no-border flex w-full border border-gray-300 bg-white text-[7pt]">
                      <div className="print-no-border-r w-2/3 border-r border-gray-300">
                        <div className="print-bg-light-green print-white-text flex w-full items-center justify-between bg-[#6CAD2B] px-2 py-1 font-semibold">
                          <p className="print:invisible">Area OFFICE:</p>
                          <div className="flex items-center justify-center bg-white px-4 py-0.5 print:flex-grow print:justify-end">
                            <p className="print-show-value text-black">
                              {bill.customer?.areaOfficeName || bill.areaOfficeName || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 px-2">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Bill #:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {bill.billingId}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Bill Month:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">{bill.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Customer Account:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {bill.customerAccountNumber}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Account Name:</span>
                              <span className="print-show-value px-2 text-right font-semibold print:text-[5pt]">
                                {bill.customer?.fullName || bill.customerName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Address:</span>
                              <span className="print-show-value px-2 text-right font-semibold print:text-[5pt]">
                                {bill.customer?.address || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Consumption:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {bill.consumptionKwh}kwh
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Opening Balance:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {formatCurrency(bill.openingBalance)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 pl-2">
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Adjustment:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {formatCurrency(bill.adjustedOpeningBalance)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Total Payments:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {formatCurrency(bill.currentBillAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Net Arrears:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {formatCurrency(bill.openingBalance - bill.paymentsPrevMonth)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Meter:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {formatCurrency(bill.tariffPerKwh)}/kwh
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Tariff:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {formatCurrency(bill.tariffPerKwh)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">Rate:</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {formatCurrency(bill.tariffPerKwh)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="print-hide-label font-semibold">ADC</span>
                              <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                                {formatCurrency(bill.vatAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-1/3">
                        <div
                          className="print-white-text flex w-full items-center justify-between bg-[#008001] px-2 py-1 font-semibold print:bg-white print:text-black"
                          style={{ backgroundColor: "#008001" }}
                        >
                          <p className="print-hide-label">SERVICE CENTER:</p>
                          <div className="flex items-center justify-center bg-white px-4 py-0.5 print:flex-grow print:justify-end">
                            <p className="print-show-value text-black">{bill.customer?.serviceCenterName || "-"}</p>
                          </div>
                        </div>

                        <div className="space-y-2 px-2 ">
                          <div className="flex justify-between">
                            <span className="print-hide-label font-semibold">Present Reading:</span>
                            <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                              {bill.presentReadingKwh}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="print-hide-label font-semibold">Previous Reading:</span>
                            <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                              {bill.previousReadingKwh}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="print-hide-label font-semibold">Fixed Charge:</span>
                            <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                              {formatCurrency(bill.actualBillAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="print-hide-label font-semibold">Current Bill:</span>
                            <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                              {formatCurrency(bill.currentBillAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="print-hide-label font-semibold">VAT:</span>
                            <span className="print-show-value px-2 font-semibold print:text-[5pt]">
                              {bill.vatAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Total */}
                    <div className="print-no-border flex w-full border border-gray-300 ">
                      <div className="print-bg-light-green w-2/3 bg-[#6CAD2B]">
                        <div className="px-2 py-1">&nbsp;</div>
                      </div>

                      <div className="w-1/3 bg-[#E1E1E1]">
                        <div
                          className="print-white-text flex w-full items-center justify-between bg-[#008001]  px-6 py-1 font-semibold print:-m-3 print:bg-white print:text-black"
                          style={{ backgroundColor: "#008001" }}
                        >
                          <p className="text-[8pt] print:invisible">FINAL AMOUNT:</p>
                          <div className="flex items-center justify-center bg-white  print:flex-grow print:justify-end">
                            <p className="print-show-value text-[8pt] font-bold text-black">
                              {formatCurrency(bill.totalDue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Notice */}
                    <div className="print-no-border-t mt-3 border-t border-gray-300 pt-1 text-center text-[6pt] text-gray-600">
                      <p>
                        KADUNA ELECTRICITY DISTRIBUTION COMPANY | Customer Service: 0700 225 5332 |
                        www.kadunaelectric.com
                      </p>
                      <p>
                        This is a computer generated invoice | Invoice Date: {formatShortDate(new Date().toISOString())}
                      </p>
                    </div>
                  </div>

                  {/* Additional Information - Only show in non-print mode */}
                  {!loading && (
                    <div className="print-hide">
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
                    </div>
                  )}
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

          <div className="flex gap-4 border-t bg-white p-6 print:hidden">
            <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={onRequestClose}>
              Close
            </ButtonModule>
            {bill && (
              <>
                <ButtonModule variant="outline" className="flex items-center gap-2" size="lg" onClick={handlePrint}>
                  <Printer className="size-4" />
                  Print Invoice (A5)
                </ButtonModule>
                <ButtonModule variant="outline" className="flex items-center gap-2" size="lg" onClick={handleShare}>
                  <Printer className="size-4" />
                  Share Invoice
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  className="flex items-center gap-2"
                  size="lg"
                  onClick={handleDownload}
                  data-download-button
                >
                  <Download className="size-4" />
                  Download PDF (A5)
                </ButtonModule>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}

export default PostpaidBillDetailsModal
