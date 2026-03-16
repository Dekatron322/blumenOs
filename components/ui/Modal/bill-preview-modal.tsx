"use client"

import React, { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { Download, ChevronLeft, ChevronRight, Printer } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Bill } from "../../BillingInfo/AllBills"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchPostpaidBills, setPagination } from "lib/redux/postpaidSlice"
import { formatCurrency } from "utils/formatCurrency"

interface BillPreviewModalProps {
  isOpen: boolean
  onRequestClose: () => void
  bills: Bill[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

const BillPreviewModal: React.FC<BillPreviewModalProps> = ({
  isOpen,
  onRequestClose,
  bills,
  currentIndex,
  setCurrentIndex,
}) => {
  const dispatch = useAppDispatch()
  const { pagination, loading } = useAppSelector((state) => state.postpaidBilling)

  const barcodeRef = useRef<HTMLCanvasElement>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)

  const currentBill = bills[currentIndex]

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
    if (!invoiceRef.current || !currentBill) return

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

      const fileName = `KAD-ELEC-Invoice-${currentBill.accountNumber}-${currentBill.billingCycle.replace(
        /\s+/g,
        "-"
      )}.pdf`

      const blob = pdf.output("blob")

      if (
        navigator.canShare &&
        navigator.canShare({ files: [new File([blob], fileName, { type: "application/pdf" })] })
      ) {
        const file = new File([blob], fileName, { type: "application/pdf" })
        await navigator.share({
          files: [file],
          title: "KAD-ELEC Invoice",
          text: `Invoice for account ${currentBill.accountNumber} (${currentBill.billingCycle})`,
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
    if (!barcodeRef.current || !currentBill) return

    const canvas = barcodeRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const value = String(currentBill.accountNumber || "")

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
    if (!invoiceRef.current || !currentBill) return

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
      const fileName = `KAD-ELEC-Invoice-${currentBill.accountNumber}-${currentBill.billingCycle.replace(
        /\s+/g,
        "-"
      )}.pdf`

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

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (pagination.currentPage > 1 && !loading) {
      // Fetch previous page if we're at the beginning and there are previous pages
      const prevPage = pagination.currentPage - 1
      await dispatch(
        fetchPostpaidBills({
          pageNumber: prevPage,
          pageSize: pagination.pageSize,
        })
      )
      dispatch(setPagination({ page: prevPage, pageSize: pagination.pageSize }))
      // Set index to last item of previous page
      setTimeout(() => setCurrentIndex(pagination.pageSize - 1), 100)
    }
  }

  const handleNext = async () => {
    if (currentIndex < bills.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (pagination.hasNext && !loading) {
      // Fetch next page if we're at the end and there are more pages
      const nextPage = pagination.currentPage + 1
      await dispatch(
        fetchPostpaidBills({
          pageNumber: nextPage,
          pageSize: pagination.pageSize,
        })
      )
      dispatch(setPagination({ page: nextPage, pageSize: pagination.pageSize }))
      // Set index to first item of next page
      setTimeout(() => setCurrentIndex(0), 100)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === "ArrowLeft") {
      handlePrevious()
    } else if (e.key === "ArrowRight") {
      handleNext()
    } else if (e.key === "Escape") {
      onRequestClose()
    }
  }

  // Initialize barcode when component mounts or bill changes
  useEffect(() => {
    if (currentBill && isOpen) {
      generateBarcode()
    }
  }, [currentBill, isOpen])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, currentIndex])

  if (!isOpen || !currentBill) return null

  const statusConfig = getStatusConfig(currentBill.status)

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A5;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
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
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">Bill Preview</h2>
              <div className="text-sm text-gray-500">
                {currentIndex + 1} of {bills.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0 && pagination.currentPage === 1}
                className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && currentIndex === 0 && pagination.currentPage > 1 ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : (
                  <ChevronLeft className="size-4" />
                )}
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === bills.length - 1 && !pagination.hasNext}
                className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                {loading && currentIndex === bills.length - 1 && pagination.hasNext ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </button>
              <button
                onClick={onRequestClose}
                className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto print:overflow-visible">
            <div className="a5-content relative z-10 p-8 print:p-4">
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
                      #{currentBill.accountNumber}
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
                          <p className="print-show-value text-black">{currentBill.areaOfficeName || "-"}</p>
                        </div>
                      </div>

                      <div className="space-y-2 px-2">
                        <div className="flex justify-between">
                          <span className="print-hide-label font-semibold">Bill #:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.billingId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="print-hide-label font-semibold">Bill Month:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.name}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Customer Account:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.accountNumber}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Account Name:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.customerName}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Address:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.customerAddress}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Phone Number:</span>
                          <span className="print-show-value px-2 font-semibold">
                            {currentBill.customerPhoneNumber || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="print-hide-label font-semibold">City:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.customerCity || "-"}</span>
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
                            {currentBill.serviceCenterName || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 px-2">
                        <div className="flex justify-between">
                          <span className="print-hide-label font-semibold">State:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.customerCity || "-"}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">11KV Feeder:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.location}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">33KV Feeder:</span>
                          <span className="print-show-value px-2 font-semibold">
                            {currentBill.distributionSubstationCode || "-"}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">DT Name:</span>
                          <span className="print-show-value px-2 font-semibold">
                            {currentBill.distributionSubstationName || "-"}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Sales Rep:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.salesRepName || "-"}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Meter:</span>
                          <span className="print-show-value px-2 font-semibold">
                            {currentBill.customerMeterNumber || "-"}
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

                      <div className="space-y-2 px-2">
                        <div className="mt-2 flex justify-between">
                          <span className="print-hide-label font-semibold">Last Payment Date:</span>
                          <span className="print-show-value px-2 font-semibold">
                            {currentBill.lastUpdated ? formatShortDate(currentBill.lastUpdated) : "N/A"}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Last Payment Amount:</span>
                          <span className="print-show-value px-2 font-semibold">
                            {formatCurrency(currentBill.lastPaymentAmount || 0)}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">ADC:</span>
                          <span className="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Present Reading:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.consumption}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Previous Reading:</span>
                          <span className="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Consumption:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.consumption}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Tariff Rate:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.tariff}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Tariff Class:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.customerTariffCode}</span>
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

                      <div className="space-y-2 px-2">
                        <div className="mt-2 flex justify-between">
                          <span className="print-hide-label font-semibold">Status Code:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.customerStatusCode}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Opening Balance:</span>
                          <span className="print-show-value px-2 font-semibold">{currentBill.openingBalance}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Adjustment:</span>
                          <span className="print-show-value px-2 font-semibold">
                            ₦{currentBill.adjustedOpeningBalance}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Total Payment Amt:</span>
                          <span className="print-show-value px-2 font-semibold">
                            {formatCurrency(currentBill.amount)}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Net Arrears:</span>
                          <span className="print-show-value px-2 font-semibold">
                            ₦{formatCurrency(currentBill.netArrears || 0)}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Energy Charged:</span>
                          <span className="print-show-value px-2 font-semibold">
                            {formatCurrency(currentBill.chargeBeforeVat || 0)}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">Fixed Charge:</span>
                          <span className="print-show-value px-2 font-semibold">
                            {formatCurrency(currentBill.actualBillAmount || 0)}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="print-hide-label font-semibold">VAT:</span>
                          <span className="print-show-value px-2 font-semibold">
                            {formatCurrency(currentBill.vatAmount || 0)}
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
                          ₦{formatCurrency(currentBill.totalDue || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Notice */}
                <div className="flex">
                  <div className="a5-small-text print-no-border mb-4 mt-1 w-[60%] border border-gray-300 p-2 text-[6pt] print:text-[5pt]">
                    <p className="mt-1 font-semibold print:text-[5pt]">IMPORTANT PAYMENT INFORMATION</p>
                    <p className="font-semibold print:text-[5pt]">
                      PAY ON OR BEFORE DUE DATE {formatDate(currentBill.dueDate)} TO AVOID DISCONNECTION | PAY AT ANY OF
                      OUR OFFICES OR TO OUR SALES REPS USING OUR POSes OR ALTERNATIVE PAYMENT CHANNELS |{" "}
                      <b>ALWAYS DEMAND FOR RECEIPT AFTER PAYMENT IS MADE</b>
                    </p>
                  </div>
                  <div className="w-[40%]"></div>
                </div>

                {/* Footer Notice */}
                <div className="print-no-border-t mt-3 border-t border-gray-300 pt-1 text-center text-[6pt] text-gray-600">
                  <p>
                    KADUNA ELECTRICITY DISTRIBUTION COMPANY | Customer Service: 0700 225 5332 | www.kadunaelectric.com
                  </p>
                  <p>
                    This is a computer generated invoice | Invoice Date: {formatShortDate(new Date().toISOString())}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t bg-white p-6 print:hidden">
            <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={onRequestClose}>
              Close
            </ButtonModule>
            {currentBill && (
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

export default BillPreviewModal
