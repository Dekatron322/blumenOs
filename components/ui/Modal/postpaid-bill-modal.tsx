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

      const margin = 32
      const pageWidth = canvas.width + margin * 2
      const pageHeight = canvas.height + margin * 2

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [pageWidth, pageHeight],
      })

      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      pdf.addImage(imgData, "PNG", margin, margin, canvas.width, canvas.height)

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
                  <div className="flex items-center justify-between">
                    <div className="mb-8 text-center">
                      <img src="/kad.svg" alt="KAD-ELEC Logo" />
                    </div>
                    <div className="mb-8 flex flex-1 justify-center">
                      <canvas ref={barcodeRef} className="h-16 w-56" />
                    </div>
                    <div className="mb-8 text-center">
                      <h1 className="mb-2 font-bold text-gray-900">KAD-ELEC.</h1>
                      <div className="bg-[#6EAD2A] p-1 text-sm font-semibold text-white">
                        #{bill.customerAccountNumber}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Grid */}

                  {/* Billing Details */}
                  <div className="text-semibold flex w-full items-center justify-center bg-[#004B23] p-2 text-[#ffffff]">
                    <p>BILLING INFORMATION</p>
                  </div>
                  <div className=" grid grid-cols-2  border bg-[#EBEBEB]">
                    <div className="space-y-3">
                      <div className="flex w-full justify-between bg-[#6CAD2B] px-4 py-3 text-sm font-semibold text-gray-100">
                        <p>AREA OFFICE</p>
                        <p>{bill.customer?.areaOfficeName || bill.areaOfficeName || "-"}</p>
                      </div>
                      <div className="flex flex-col bg-[#EBEBEB]">
                        <div className="flex w-full justify-between px-4 ">
                          <span className="text-sm font-semibold text-gray-600"># Bill:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.customerAccountNumber}</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Bill Month:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.period}</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Customer Account:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.customerAccountNumber}</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Account Name:</span>
                          <span className="ml-2 text-sm text-gray-900">
                            {bill.customer?.fullName || bill.customerName}
                          </span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Address:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.customer?.address || "-"}</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Phone number:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.customer?.phoneNumber || "-"}</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">City:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.customer?.city || "-"}</span>
                        </div>
                        {/* <div className="flex w-full justify-between px-4">
                          <span className="text-sm font-semibold text-gray-600">11 KV Feeder:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.feederName}</span>
                        </div>
                        <div className="flex w-full justify-between  px-4 py-3">
                          <span className="text-sm font-semibold text-gray-600">33 KV Injection:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.distributionSubstationCode}</span>
                        </div>

                        <div className="flex w-full justify-between  px-4 py-3">
                          <span className="text-sm font-semibold text-gray-600">Last Payment Amount:</span>
                          <span className="ml-2 text-sm text-gray-900">{formatCurrency(bill.paymentsPrevMonth)}</span>
                        </div>
                        <div className="flex w-full justify-between px-4">
                          <span className="text-sm font-semibold text-gray-600">Last Payment Date:</span>
                          <span className="ml-2 text-sm text-gray-900">{formatShortDate(bill.lastUpdated)}</span>
                        </div>
                        <div className="flex w-full justify-between  px-4 py-3">
                          <span className="text-sm font-semibold text-gray-600">Consumption:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.consumptionKwh}kwh</span>
                        </div>
                        <div className="flex w-full justify-between px-4">
                          <span className="text-sm font-semibold text-gray-600">Tariff Rate:</span>
                          <span className="ml-2 text-sm text-gray-900">{formatCurrency(bill.tariffPerKwh)}/kwh</span>
                        </div>
                        <div className="flex w-full justify-between  px-4 py-3">
                          <span className="text-sm font-semibold text-gray-600">Payment Status:</span>
                          <span className="ml-2 text-sm text-gray-900">{statusConfig.label}</span>
                        </div> */}
                      </div>
                    </div>

                    <div className="space-y-3 border-l border-gray-200 bg-[#E1E1E1] pb-4">
                      <div className="flex w-full justify-between bg-[#008001] px-4 py-3 text-sm font-semibold text-gray-100">
                        <p>SERVICE CENTER:</p>
                        <p>{bill.customer?.serviceCenterName || "-"}</p>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">State:</span>
                        <span className="text-sm text-gray-900">{bill.customer?.state || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">11KV Feeder:</span>
                        <span className="text-sm text-gray-900">{bill.feederName}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">33kv Feeder:</span>
                        <span className="text-sm text-gray-900">
                          {bill.distributionSubstationCode || bill.customer?.distributionSubstationCode || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">DT Name:</span>
                        <span className="text-sm text-gray-900">DT Name</span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">Sales Rep:</span>
                        <span className="text-sm text-gray-900">Sales Rep</span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">Meter:</span>
                        <span className="text-sm text-gray-900">No Meter</span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">Multiplier:</span>
                        <span className="text-sm text-gray-900">1.00</span>
                      </div>
                      {/* <div className="flex items-center justify-between px-4 pt-3">
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
                      </div> */}
                    </div>
                  </div>

                  <div className="text-semibold flex w-full items-center justify-center bg-[#004B23] p-2 text-[#ffffff]">
                    <p>BILLING CHARGES</p>
                  </div>
                  <div className="grid grid-cols-2  border bg-[#EBEBEB]">
                    <div className="space-y-3">
                      <div className="flex w-full justify-between bg-[#6CAD2B] px-4 py-3 text-sm font-semibold text-gray-100">
                        <p>CHARGES</p>
                        <p>TOTAL</p>
                      </div>
                      <div className="flex flex-col bg-[#EBEBEB]">
                        <div className="flex w-full justify-between px-4 ">
                          <span className="text-sm font-semibold text-gray-600">Last Payment Date:</span>
                          <span className="ml-2 text-sm text-gray-900">{formatShortDate(bill.lastUpdated)}</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Last Payment Amount:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.paymentsPrevMonth}</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">ADC:</span>
                          <span className="ml-2 text-sm text-gray-900">9.14 kwh</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Present Reading:</span>
                          <span className="ml-2 text-sm text-gray-900">0</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Previous Reading:</span>
                          <span className="ml-2 text-sm text-gray-900">0</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Consumption:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.consumptionKwh}kwh</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Tarrif Rate:</span>
                          <span className="ml-2 text-sm text-gray-900">{formatCurrency(bill.tariffPerKwh)}/kwh</span>
                        </div>
                        <div className="flex w-full justify-between px-4 pt-3">
                          <span className="text-sm font-semibold text-gray-600">Tarrif Class:</span>
                          <span className="ml-2 text-sm text-gray-900">A1</span>
                        </div>
                        {/* <div className="flex w-full justify-between px-4">
                          <span className="text-sm font-semibold text-gray-600">11 KV Feeder:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.feederName}</span>
                        </div>
                        <div className="flex w-full justify-between  px-4 py-3">
                          <span className="text-sm font-semibold text-gray-600">33 KV Injection:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.distributionSubstationCode}</span>
                        </div>

                        <div className="flex w-full justify-between  px-4 py-3">
                          <span className="text-sm font-semibold text-gray-600">Last Payment Amount:</span>
                          <span className="ml-2 text-sm text-gray-900">{formatCurrency(bill.paymentsPrevMonth)}</span>
                        </div>
                        <div className="flex w-full justify-between px-4">
                          <span className="text-sm font-semibold text-gray-600">Last Payment Date:</span>
                          <span className="ml-2 text-sm text-gray-900">{formatShortDate(bill.lastUpdated)}</span>
                        </div>
                        <div className="flex w-full justify-between  px-4 py-3">
                          <span className="text-sm font-semibold text-gray-600">Consumption:</span>
                          <span className="ml-2 text-sm text-gray-900">{bill.consumptionKwh}kwh</span>
                        </div>
                        <div className="flex w-full justify-between px-4">
                          <span className="text-sm font-semibold text-gray-600">Tariff Rate:</span>
                          <span className="ml-2 text-sm text-gray-900">{formatCurrency(bill.tariffPerKwh)}/kwh</span>
                        </div>
                        <div className="flex w-full justify-between  px-4 py-3">
                          <span className="text-sm font-semibold text-gray-600">Payment Status:</span>
                          <span className="ml-2 text-sm text-gray-900">{statusConfig.label}</span>
                        </div> */}
                      </div>
                    </div>

                    <div className="space-y-3 border-l border-gray-200 bg-[#E1E1E1] pb-4">
                      <div className="flex w-full justify-between bg-[#008001] px-4 py-3 text-sm font-semibold text-gray-100">
                        <p>CHARGES</p>
                        <p>TOTAL</p>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">Status Code:</span>
                        <span className="text-sm text-gray-900">{bill.customer?.statusCode || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">Opening Balance:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(bill.openingBalance)}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">Adjustment:</span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(bill.adjustedOpeningBalance - bill.openingBalance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">Total Payment Amt:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(bill.paymentsPrevMonth)}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">Net Arrears:</span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(bill.openingBalance - bill.paymentsPrevMonth)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">Energy Charged:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(bill.chargeBeforeVat)}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">Fixed Charge:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 ">
                        <span className="text-sm font-semibold text-gray-600">VAT:</span>
                        <span className="text-sm text-gray-900">{formatCurrency(bill.vatAmount)}</span>
                      </div>
                      {/* <div className="flex items-center justify-between px-4 pt-3">
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
                      </div> */}
                    </div>
                  </div>
                  <div className="grid grid-cols-2  border ">
                    <div className="space-y-3">
                      <div className="flex w-full justify-between bg-[#6CAD2B] px-4 py-3 text-sm font-semibold text-gray-100">
                        <p>-</p>
                        <p>-</p>
                      </div>
                    </div>

                    <div className="space-y-3 border-l border-gray-200 bg-[#E1E1E1] ">
                      <div className="flex w-full justify-between bg-[#008001] px-4 py-3 text-sm font-semibold text-gray-100">
                        <p>TOTAL DUE:</p>
                        <p>{formatCurrency(bill.totalDue)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Thank You Message */}
                  {/* <div className="flex w-full items-stretch overflow-hidden rounded-2xl">
                    <div className="flex h-20 w-1/2 items-center bg-[#6BAE2A] p-4">
                      <div className="text-lg font-semibold text-[#ffffff]">THANK YOU FOR YOUR BUSINESS</div>
                    </div>
                    <div className="flex h-20 w-1/2 flex-col items-end justify-center bg-[#008001] px-4 text-end">
                      <div className="mb-1 text-sm font-semibold text-[#ffffff]">GRAND TOTAL</div>
                      <div className="text-2xl font-bold text-[#ffffff]">{formatCurrency(bill.totalDue)}</div>
                    </div>
                  </div> */}

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
                  <div className="mt-8   py-3 pt-4 text-center text-sm text-gray-600">
                    <div className="mb-2">
                      <p>
                        Bill Created on: 11/1/2025 3:00:36 PM Sales Rep&lsquo;s Telephone: : Area Office Telephone No:
                        PAY AT ANY BANK NATIONWIDE POS OR NEAREST CASH OFFICE ***PAY ON OR BEFORE 11/15/2025 3:00:36 PM
                        TO AVOID DISCONNECTION*** | Status Code 02=Active, Status Code 04 = Disconnection
                      </p>
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
