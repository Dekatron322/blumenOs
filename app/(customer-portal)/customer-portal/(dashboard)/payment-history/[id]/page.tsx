"use client"

import React, { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Shield,
  User,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearPaymentDetail, getPaymentDetail, type PaymentDetail } from "lib/redux/customersDashboardSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { UserOutlineIcon } from "components/Icons/Icons"
import { format } from "date-fns"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"
import Image from "next/image"
import html2canvas from "html2canvas"

// Status badge configuration
const getStatusConfig = (status: string) => {
  const configs = {
    Pending: {
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: Clock,
      label: "PENDING",
    },
    Confirmed: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: CheckCircle,
      label: "CONFIRMED",
    },
    Failed: {
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: AlertCircle,
      label: "FAILED",
    },
    Processing: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: RefreshCw,
      label: "PROCESSING",
    },
  }
  return configs[status as keyof typeof configs] || configs.Pending
}

// Channel badge configuration
const getChannelConfig = (channel: string) => {
  const configs = {
    Cash: { color: "text-green-600", bg: "bg-green-50" },
    Card: { color: "text-blue-600", bg: "bg-blue-50" },
    Mobile: { color: "text-purple-600", bg: "bg-purple-50" },
    Bank: { color: "text-indigo-600", bg: "bg-indigo-50" },
    BankTransfer: { color: "text-indigo-600", bg: "bg-indigo-50" },
    Online: { color: "text-cyan-600", bg: "bg-cyan-50" },
  }
  return configs[channel as keyof typeof configs] || { color: "text-gray-600", bg: "bg-gray-50" }
}

// Collector type configuration
const getCollectorConfig = (collectorType: string) => {
  const configs = {
    Customer: { color: "text-teal-600", bg: "bg-teal-50" },
    Agent: { color: "text-orange-600", bg: "bg-orange-50" },
    Vendor: { color: "text-pink-600", bg: "bg-pink-50" },
    System: { color: "text-gray-600", bg: "bg-gray-50" },
  }
  return configs[collectorType as keyof typeof configs] || configs.System
}

const PaymentDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const paymentId = params.id as string
  const receiptRef = useRef<HTMLDivElement>(null)

  // Get payment details from Redux store
  const { paymentDetail, isLoadingPaymentDetail, paymentDetailError, paymentDetailSuccess } = useAppSelector(
    (state) => state.customersDashboard
  )

  // Extract actual payment data from the nested response
  const paymentData: PaymentDetail | null = paymentDetail?.data || null

  const [isExporting, setIsExporting] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

  useEffect(() => {
    if (paymentId) {
      const id = parseInt(paymentId)
      if (!isNaN(id)) {
        dispatch(getPaymentDetail({ id }))
      }
    }

    // Cleanup function to clear payment details when component unmounts
    return () => {
      dispatch(clearPaymentDetail())
    }
  }, [dispatch, paymentId])

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp")
    } catch {
      return "Invalid date"
    }
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phoneNumber
  }

  const handleRefresh = () => {
    if (paymentId) {
      const id = parseInt(paymentId)
      if (!isNaN(id)) {
        dispatch(getPaymentDetail({ id }))
      }
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(type)
      setTimeout(() => setCopiedItem(null), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

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

      const fileName = `Payment-Receipt-${paymentData.customerAccountNumber}-${paymentData.reference}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  const exportToPDF = async () => {
    if (!paymentData) return

    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Add header with company branding
      doc.setFillColor(249, 249, 249)
      doc.rect(0, 0, pageWidth, 60, "F")

      // Company name
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("PAYMENT RECEIPT", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Payment Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Payment Summary Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("PAYMENT SUMMARY", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Payment Reference", paymentData.reference],
          ["Amount", formatCurrency(paymentData.totalAmountPaid || paymentData.amount, paymentData.currency)],
          ["Status", paymentData.status],
          ["Channel", paymentData.channel],
          ["Payment Type", paymentData.paymentTypeName],
          ["Currency", paymentData.currency],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Customer Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("CUSTOMER INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Customer Name", paymentData.customerName],
          ["Account Number", paymentData.customerAccountNumber],
          ["Customer ID", paymentData.customerId?.toString() || "N/A"],
          ["Phone Number", paymentData.customerPhoneNumber || "N/A"],
          ["Address", paymentData.customerAddress || "N/A"],
          ["Meter Number", paymentData.customerMeterNumber || "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Payment Details Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("PAYMENT DETAILS", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Paid At", formatDate(paymentData.paidAtUtc)],
          ["Confirmed At", paymentData.confirmedAtUtc || "N/A"],
          ["Electricity Amount", formatCurrency(paymentData.electricityAmount, paymentData.currency)],
          ["VAT Amount", formatCurrency(paymentData.vatAmount, paymentData.currency)],
          ["VAT Rate", `${(paymentData.vatRate * 100).toFixed(2)}%`],
          ["Units Purchased", `${paymentData.units} kWh`],
          ["Tariff Rate", formatCurrency(paymentData.tariffRate, paymentData.currency)],
          ["Outstanding Debt", formatCurrency(paymentData.outstandingDebt, paymentData.currency)],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Collector Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("COLLECTOR INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Account Type", paymentData.accountType || "N/A"],
          ["External Reference", paymentData.externalReference || "N/A"],
          ["Virtual Account", paymentData.paymentDetails?.virtualAccount?.accountNumber || "N/A"],
          ["Bank Name", paymentData.paymentDetails?.virtualAccount?.bankName || "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Location Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("LOCATION INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Area Office", paymentData.areaOfficeName || "N/A"],
          ["Distribution Substation", paymentData.distributionSubstationCode || "N/A"],
          ["Feeder", paymentData.feederName || "N/A"],
          ["Latitude", paymentData.latitude?.toString() || "N/A"],
          ["Longitude", paymentData.longitude?.toString() || "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Bill Information Section (if postpaid)
      if (paymentData.postpaidBillId) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("BILL INFORMATION", 14, yPosition)
        yPosition += 10

        autoTable(doc, {
          startY: yPosition,
          head: [["Field", "Details"]],
          body: [
            ["Bill ID", paymentData.postpaidBillId?.toString() || "N/A"],
            ["Bill Period", paymentData.postpaidBillPeriod || "N/A"],
            ["Total Due", formatCurrency(paymentData.billTotalDue || 0, paymentData.currency)],
          ],
          theme: "grid",
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }

      // Additional Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("ADDITIONAL INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Narrative", paymentData.narrative || "N/A"],
          ["External Reference", paymentData.externalReference || "N/A"],
          ["Vendor Account ID", paymentData.vendorAccountId || "N/A"],
          ["Checkout URL", paymentData.paymentDetails?.checkoutUrl || "N/A"],
          ["Evidence File", paymentData.evidenceFileUrl || "N/A"],
          ["Manual Entry", paymentData.isManualEntry ? "Yes" : "No"],
          ["System Generated", paymentData.isSystemGenerated ? "Yes" : "No"],
          ["Recovery Applied", paymentData.recoveryApplied ? "Yes" : "No"],
          [
            "Recovery Amount",
            paymentData.recoveryApplied ? formatCurrency(paymentData.recoveryAmount || 0, paymentData.currency) : "N/A",
          ],
          ["Recovery Policy", paymentData.recoveryPolicyName || "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Token Information Section (if token exists)
      if (paymentData.token) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("TOKEN INFORMATION", 14, yPosition)
        yPosition += 10

        autoTable(doc, {
          startY: yPosition,
          head: [["Field", "Details"]],
          body: [
            ["Token", paymentData.token?.token || ""],
            ["Token Decimal", paymentData.token?.tokenDec || ""],
            ["Vended Amount", `${paymentData.token?.vendedAmount || ""} ${paymentData.token?.unit || ""}`],
            ["Description", paymentData.token?.description || "N/A"],
            ["DRN", paymentData.token?.drn || "N/A"],
          ],
          theme: "grid",
          headStyles: { fillColor: [139, 92, 246], textColor: 255 },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }

      // Virtual Account Section (if exists)
      if (paymentData.paymentDetails?.virtualAccount?.accountNumber) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("VIRTUAL ACCOUNT", 14, yPosition)
        yPosition += 10

        autoTable(doc, {
          startY: yPosition,
          head: [["Field", "Details"]],
          body: [
            ["Account Number", paymentData.paymentDetails.virtualAccount.accountNumber],
            ["Bank Name", paymentData.paymentDetails.virtualAccount.bankName],
            ["Reference", paymentData.paymentDetails.virtualAccount.reference],
            ["Expires At", formatDate(paymentData.paymentDetails.virtualAccount.expiresAtUtc)],
          ],
          theme: "grid",
          headStyles: { fillColor: [245, 158, 11], textColor: 255 },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        })
      }

      // Add page numbers
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10)
      }

      // Save the PDF
      doc.save(`payment-${paymentData.reference}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoadingPaymentDetail) {
    return <LoadingSkeleton />
  }

  if (paymentDetailError || !paymentData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-gray-400 sm:size-16" />
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {paymentDetailError ? "Error Loading Payment" : "Payment Not Found"}
          </h1>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            {paymentDetailError || "The payment you're looking for doesn't exist."}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonModule variant="outline" onClick={() => router.back()}>
              Back to Payments
            </ButtonModule>
            <ButtonModule variant="primary" onClick={handleRefresh}>
              Try Again
            </ButtonModule>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(paymentData.status)
  const channelConfig = getChannelConfig(paymentData.channel)
  const collectorConfig = getCollectorConfig(paymentData.collectorType || "System")
  const StatusIcon = statusConfig.icon

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <CustomerDashboardNav />
          <div className="mx-auto flex w-full flex-col 2xl:container">
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-3 py-4 sm:px-4 md:px-6 2xl:px-16">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      type="button"
                      onClick={() => router.back()}
                      className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-[#f9f9f9] text-gray-700 hover:bg-gray-50 sm:size-9"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      aria-label="Go back"
                      title="Go back"
                    >
                      <ArrowLeft className="size-4" />
                    </motion.button>

                    <div>
                      <h1 className="text-lg font-bold text-gray-900 sm:text-xl xl:text-2xl">Payment Details</h1>
                      <p className="text-xs text-gray-600 sm:text-sm">Complete overview and receipt</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 text-sm"
                      onClick={handleRefresh}
                    >
                      <RefreshCw className="size-3 sm:size-4" />
                      <span className="max-sm:hidden">Refresh</span>
                      <span className="sm:hidden">Refresh</span>
                    </ButtonModule>

                    <ButtonModule
                      variant="outline"
                      size="md"
                      className="justify-start text-sm"
                      onClick={() => setIsReceiptModalOpen(true)}
                    >
                      <FileText className="size-4" />
                      View Receipt
                    </ButtonModule>

                    {paymentData.evidenceFileUrl && (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2 text-sm"
                        onClick={() => window.open(paymentData.evidenceFileUrl, "_blank")}
                      >
                        <FileText className="size-3 sm:size-4" />
                        <span className="max-sm:hidden">View Evidence</span>
                        <span className="sm:hidden">Evidence</span>
                      </ButtonModule>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-3 py-6 sm:px-4 sm:py-8 md:px-6 2xl:px-16">
              <div className="flex w-full flex-col gap-6 xl:flex-row">
                {/* Left Column - Payment Summary & Quick Info */}
                <div className="flex w-full flex-col space-y-6 xl:w-[35%]">
                  {/* Payment Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <div className="text-center">
                      <div className="relative mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 sm:size-24">
                        <DollarSign className="size-8 text-blue-600 sm:size-10" />
                        <div className="absolute -right-1 bottom-1 rounded-full bg-white p-1 shadow-md">
                          <div
                            className={`flex size-6 items-center justify-center rounded-full ${statusConfig.bg} sm:size-7`}
                          >
                            <StatusIcon className={`size-3 ${statusConfig.color} sm:size-4`} />
                          </div>
                        </div>
                      </div>

                      <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                        {formatCurrency(paymentData.totalAmountPaid || paymentData.amount, paymentData.currency)}
                      </h2>
                      {/* <p className="mb-4 text-sm text-gray-600 sm:text-base">Payment #{paymentDetail.reference}</p> */}

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color} sm:text-sm`}
                        >
                          {statusConfig.label}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${channelConfig.bg} ${channelConfig.color} sm:text-sm`}
                        >
                          {paymentData.channel}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${collectorConfig.bg} ${collectorConfig.color} sm:text-sm`}
                        >
                          {paymentData.collectorType || "System"}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Payment Type:</span>
                          <span className="font-semibold text-gray-900">{paymentData.paymentTypeName}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Currency:</span>
                          <span className="font-semibold text-gray-900">{paymentData.currency}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Electricity Amount:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(paymentData.electricityAmount, paymentData.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>VAT Amount:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(paymentData.vatAmount, paymentData.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Units:</span>
                          <span className="font-semibold text-gray-900">{paymentData.units} kWh</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Token Card (if token exists) */}
                  {paymentData.token && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                        Token Information
                      </h3>
                      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-sm font-semibold text-gray-900 sm:text-base">Token</div>
                          <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                            {paymentData.token?.unit}
                          </div>
                        </div>

                        {/* Token - Copyable */}
                        <div className="mb-3">
                          <label className="mb-1 block text-xs font-medium text-gray-600">Token Number</label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 break-all rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-900">
                              {paymentData.token?.token}
                            </div>
                            <button
                              onClick={() => copyToClipboard(paymentData.token?.token || "", "token")}
                              className={`flex items-center justify-center rounded-md p-2 transition-colors ${
                                copiedItem === "token"
                                  ? "bg-green-50 text-green-600"
                                  : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                              }`}
                              title={copiedItem === "token" ? "Copied!" : "Copy token"}
                            >
                              {copiedItem === "token" ? <Check className="size-4" /> : <Copy className="size-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Other token details */}
                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Amount</label>
                            <div className="font-medium text-gray-900">{paymentData.token?.vendedAmount}</div>
                          </div>
                          {paymentData.token?.drn && (
                            <div>
                              <label className="text-xs font-medium text-gray-600">Meter Number</label>
                              <div className="flex items-center gap-2">
                                <div className="font-mono text-xs text-gray-900">{paymentData.token?.drn}</div>
                                <button
                                  onClick={() => copyToClipboard(paymentData.token?.drn || "", "drn")}
                                  className={`rounded p-1 transition-colors ${
                                    copiedItem === "drn"
                                      ? "bg-green-50 text-green-600"
                                      : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                  }`}
                                  title={copiedItem === "drn" ? "Copied!" : "Copy DRN"}
                                >
                                  {copiedItem === "drn" ? <Check className="size-3" /> : <Copy className="size-3" />}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Customer Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                      <UserOutlineIcon className="size-4 sm:size-5" />
                      Customer Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 sm:size-10">
                          <User className="size-4 text-blue-600 sm:size-5" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Customer Name</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentData.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 sm:size-10">
                          <CreditCard className="size-4 text-green-600 sm:size-5" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Account Number</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.customerAccountNumber}
                          </p>
                        </div>
                      </div>
                      {paymentData.customerPhoneNumber && (
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 sm:size-10">
                            <Phone className="size-4 text-blue-600 sm:size-5" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Phone Number</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatPhoneNumber(paymentData.customerPhoneNumber)}
                            </p>
                          </div>
                        </div>
                      )}
                      {paymentData.customerMeterNumber && (
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 sm:size-10">
                            <Package className="size-4 text-purple-600 sm:size-5" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Meter Number</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentData.customerMeterNumber}
                            </p>
                          </div>
                        </div>
                      )}
                      {paymentData.accountType && (
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100 sm:size-10">
                            <Shield className="size-4 text-orange-600 sm:size-5" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Account Type</label>
                            <p className="text-sm font-semibold capitalize text-gray-900 sm:text-base">
                              {paymentData.accountType}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 sm:size-10">
                          <Shield className="size-4 text-purple-600 sm:size-5" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Customer ID</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentData.customerId}</p>
                        </div>
                      </div> */}
                    </div>
                  </motion.div>

                  {/* Payment Details Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                      <DollarSign className="size-4 sm:size-5" />
                      Payment Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Tariff Rate</span>
                        <span className="text-sm font-semibold text-gray-900 sm:text-base">
                          {formatCurrency(paymentData.tariffRate, paymentData.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Units Purchased</span>
                        <span className="text-sm font-semibold text-gray-900 sm:text-base">
                          {paymentData.units} kWh
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">VAT Rate</span>
                        <span className="text-sm font-semibold text-gray-900 sm:text-base">
                          {(paymentData.vatRate * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Outstanding Debt</span>
                        <span className="text-sm font-semibold text-gray-900 sm:text-base">
                          {formatCurrency(paymentData.outstandingDebt, paymentData.currency)}
                        </span>
                      </div>
                      {paymentData.externalReference && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                          <span className="text-xs font-medium text-gray-600 sm:text-sm">External Reference</span>
                          <span className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.externalReference}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Quick Actions Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                      Quick Actions
                    </h3>
                    <div className="flex gap-3 max-sm:flex-col max-sm:gap-3 sm:flex 2xl:flex-col">
                      <ButtonModule
                        variant="outline"
                        size="md"
                        className="w-full justify-start gap-3 text-sm"
                        onClick={handleRefresh}
                      >
                        <RefreshCw className="size-4" />
                        Refresh Details
                      </ButtonModule>
                      <ButtonModule
                        variant="primary"
                        size="md"
                        className="w-full justify-start gap-3 text-sm"
                        onClick={() => setIsReceiptModalOpen(true)}
                      >
                        <FileText className="size-4" />
                        View Receipt
                      </ButtonModule>

                      {paymentData.evidenceFileUrl && (
                        <ButtonModule
                          variant="secondary"
                          size="md"
                          className="w-full justify-start gap-3 text-sm"
                          onClick={() => window.open(paymentData.evidenceFileUrl, "_blank")}
                        >
                          <FileText className="size-4" />
                          View Evidence
                        </ButtonModule>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:w-[65%]">
                  {/* Payment Timeline */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      Payment Timeline
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Paid At</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatDate(paymentData.paidAtUtc)}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Payment Channel</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentData.channel}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Confirmed At</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentData.confirmedAtUtc ? formatDate(paymentData.confirmedAtUtc) : "Not confirmed"}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Collector Type</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.collectorType || "System"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Payment Status</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            <span className={`inline-flex items-center gap-1 ${statusConfig.color}`}>
                              <StatusIcon className="size-4" />
                              {paymentData.status}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Payment Type</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.paymentTypeName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Amount Breakdown */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      Amount Breakdown
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Total Amount</label>
                          <p className="text-lg font-bold text-gray-900 sm:text-xl">
                            {formatCurrency(paymentData.totalAmountPaid || paymentData.amount, paymentData.currency)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Electricity Amount</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(paymentData.electricityAmount, paymentData.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">VAT Amount</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(paymentData.vatAmount, paymentData.currency)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Units Purchased</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentData.units} kWh</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Tariff Rate</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(paymentData.tariffRate, paymentData.currency)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Outstanding Debt</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(paymentData.outstandingDebt, paymentData.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Collector & Vendor Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <User className="size-5" />
                      Collector & Vendor Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Collector Type</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.collectorType || "System"}
                          </p>
                        </div>
                        {paymentData.agentName && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Agent Name</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentData.agentName}</p>
                          </div>
                        )}
                        {paymentData.agentCode && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Agent Code</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentData.agentCode}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {paymentData.vendorName && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Vendor Name</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentData.vendorName}</p>
                          </div>
                        )}
                        {paymentData.recordedByName && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Recorded By</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentData.recordedByName}
                            </p>
                          </div>
                        )}
                        {paymentData.vendorAccountId && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Vendor Account ID</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentData.vendorAccountId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Location Information */}

                  {/* Bill Information (if postpaid) */}
                  {paymentData.postpaidBillId && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <FileText className="size-5" />
                        Bill Information
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Bill ID</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentData.postpaidBillId}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Bill Period</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentData.postpaidBillPeriod || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Total Bill Due</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatCurrency(paymentData.billTotalDue || 0, paymentData.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Additional Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Narrative</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.narrative || "No narrative"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">External Reference</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.externalReference || "N/A"}
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Evidence File</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.evidenceFileUrl ? (
                              <a
                                href={paymentData.evidenceFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Evidence
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Manual Entry</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.isManualEntry ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">System Generated</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.isSystemGenerated ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Recovery Applied</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentData.recoveryApplied ? "Yes" : "No"}
                          </p>
                        </div>
                        {paymentData.recoveryApplied && (
                          <>
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Recovery Amount</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {formatCurrency(paymentData.recoveryAmount || 0, paymentData.currency)}
                              </p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Recovery Policy</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {paymentData.recoveryPolicyName || "N/A"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Virtual Account Information (if exists) */}
                  {paymentData.paymentDetails?.virtualAccount?.accountNumber && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <CreditCard className="size-5" />
                        Virtual Account Information
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Account Number</label>
                            <p className="font-mono text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentData.paymentDetails.virtualAccount.accountNumber}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Bank Name</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentData.paymentDetails.virtualAccount.bankName}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Reference</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentData.paymentDetails.virtualAccount.reference}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Expires At</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatDate(paymentData.paymentDetails.virtualAccount.expiresAtUtc)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {isReceiptModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm max-sm:items-end max-sm:px-0"
          onClick={() => setIsReceiptModalOpen(false)}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-2xl overflow-hidden bg-[#EFEFEF] shadow-2xl max-sm:h-[90vh] max-sm:w-[90vw] max-sm:max-w-full max-sm:rounded-t-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={receiptRef}
              className="relative space-y-4 px-4 pb-4 text-sm text-gray-800 max-sm:h-[calc(90vh-140px)] max-sm:overflow-y-auto sm:space-y-6 sm:px-6"
            >
              {/* Header */}
              <div className="flex flex-col items-center justify-between bg-[#EFEFEF] pt-4 max-sm:px-2 sm:flex-row">
                <Image src="/kadco.svg" alt="" height={120} width={123} className="max-sm:h-16 max-sm:w-16" />
                <div className="mt-3 text-center max-sm:mt-2 sm:mt-0 sm:text-right">
                  <h2 className="text-base font-bold text-gray-900 max-sm:text-sm sm:text-lg">Payment Receipt</h2>
                  <p className="max-w-[250px] break-words text-xs text-gray-500 max-sm:text-xs sm:max-w-none">
                    Reference: {paymentData?.reference}
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
                  <p className="break-words font-semibold text-gray-900 max-sm:text-sm">{paymentData?.customerName}</p>
                  <p className="text-xs text-gray-500 max-sm:text-xs">Account: {paymentData?.customerAccountNumber}</p>
                  {paymentData?.customerAddress && (
                    <p className="text-xs text-gray-500 max-sm:text-xs">Address: {paymentData.customerAddress}</p>
                  )}
                  {paymentData?.customerPhoneNumber && (
                    <p className="text-xs text-gray-500 max-sm:text-xs">Phone: {paymentData.customerPhoneNumber}</p>
                  )}
                  {paymentData?.customerMeterNumber && (
                    <p className="text-xs text-gray-500 max-sm:text-xs">Meter: {paymentData.customerMeterNumber}</p>
                  )}
                  {paymentData?.accountType && (
                    <p className="text-xs text-gray-500 max-sm:text-xs">Type: {paymentData.accountType}</p>
                  )}
                </div>
                <div className="w-full text-left max-sm:mt-2 max-sm:text-left sm:w-auto sm:text-right">
                  <p className="text-xs text-gray-500 max-sm:text-xs">Amount Paid</p>
                  <p className="text-xl font-bold text-gray-900 max-sm:text-lg sm:text-2xl">
                    {formatCurrency(
                      paymentData?.totalAmountPaid || paymentData?.amount || 0,
                      paymentData?.currency || "NGN"
                    )}
                  </p>
                  <p className="break-words text-xs text-gray-500 max-sm:text-xs">
                    Paid at: {formatDateTime(paymentData?.paidAtUtc || "")}
                  </p>
                  {paymentData?.externalReference && (
                    <p className="break-words text-xs text-gray-500 max-sm:text-xs">
                      Ext Ref: {paymentData.externalReference}
                    </p>
                  )}
                </div>
              </div>

              {/* Token Information */}
              {paymentData?.token && (
                <div className="relative rounded-lg bg-white p-4 max-sm:p-3">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 max-sm:text-xs">Electricity Token</p>
                    <p className="break-words font-mono text-xl font-bold text-gray-900 max-sm:break-all max-sm:text-lg">
                      {paymentData.token?.token}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 max-sm:grid-cols-1 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500 max-sm:text-xs">Amount</p>
                      <p className="font-semibold text-gray-900 max-sm:text-sm">
                        {paymentData.token?.vendedAmount} {paymentData.token?.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 max-sm:text-xs">Meter Number</p>
                      <p className="font-mono font-semibold text-gray-900 max-sm:break-all max-sm:text-sm">
                        {paymentData.token?.drn}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Details */}
              <div className="rounded-lg bg-white p-4 max-sm:p-3">
                <h4 className="mb-3 font-semibold text-gray-600">Billing Details</h4>
                <div className="grid grid-cols-1 gap-3 text-xs max-sm:grid-cols-1 max-sm:gap-4 max-sm:text-xs sm:grid-cols-2 ">
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Electricity Amount:</span>
                    <span className="font-semibold">
                      {paymentData?.electricityAmount
                        ? formatCurrency(paymentData.electricityAmount, paymentData.currency || "NGN")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">VAT Rate:</span>
                    <span className="font-semibold">
                      {paymentData?.vatRate ? `${(paymentData.vatRate * 100).toFixed(1)}%` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">VAT Amount:</span>
                    <span className="font-semibold">
                      {paymentData?.vatAmount
                        ? formatCurrency(paymentData.vatAmount, paymentData.currency || "NGN")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Tariff Rate:</span>
                    <span className="font-semibold">
                      {paymentData?.tariffRate
                        ? formatCurrency(paymentData.tariffRate, paymentData.currency || "NGN")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Units Purchased:</span>
                    <span className="font-semibold max-sm:text-xs">
                      {paymentData?.units ? `${paymentData.units} kWh` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 max-sm:text-xs">Outstanding Debt:</span>
                    <span className="font-semibold">
                      {paymentData?.outstandingDebt !== undefined
                        ? formatCurrency(paymentData.outstandingDebt, paymentData.currency || "NGN")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="gap-4 rounded-lg bg-gray-50 p-4 max-sm:p-3">
                <div className="grid w-full grid-cols-1 gap-4 border-b border-dashed border-gray-200 pb-2 max-sm:grid-cols-1 max-sm:gap-4 sm:grid-cols-2 sm:gap-10">
                  <p className="font-semibold text-gray-600 max-sm:text-sm">Payment Details</p>
                  {paymentData?.token && (
                    <p className="mt-2 font-semibold text-gray-600 max-sm:hidden max-sm:text-sm sm:mt-0">
                      Token Information
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 pt-4 text-xs max-sm:grid-cols-1 max-sm:gap-4 max-sm:text-xs sm:grid-cols-2 sm:gap-10">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 max-sm:text-xs">Status: </span>
                      <span className="break-words font-semibold max-sm:text-xs">
                        {paymentData?.status || "Confirmed"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 max-sm:text-xs">Channel: </span>
                      <span className="break-words font-semibold max-sm:text-xs">{paymentData?.channel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 max-sm:text-xs">Payment Type: </span>
                      <span className="break-words font-semibold max-sm:text-xs">
                        {paymentData?.paymentTypeName || "Energy Bill"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 max-sm:text-xs">Reference: </span>
                      <span className="break-words font-semibold max-sm:text-xs">{paymentData?.reference}</span>
                    </div>
                  </div>
                  {paymentData?.token && (
                    <div className="space-y-2 sm:mt-0">
                      <div className="flex justify-between">
                        <span className="text-gray-500 max-sm:text-xs">Token: </span>
                        <span className="break-words font-semibold">{paymentData.token?.token || ""}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 max-sm:text-xs">Units: </span>
                        <span className="break-words font-semibold">
                          {paymentData.token?.vendedAmount} {paymentData.token?.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 max-sm:text-xs">Description: </span>
                        <span className="break-words font-semibold">{paymentData.token?.description || ""}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 max-sm:text-xs">Meter Number: </span>
                        <span className="break-words font-semibold">{paymentData.token?.drn}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center text-xs text-gray-500 max-sm:px-2 max-sm:pb-4">
                <p className="max-sm:text-xs">Thank you for your payment!</p>
                <p className="mt-1 max-sm:text-xs">This receipt serves as proof of payment.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 max-sm:flex-shrink-0 max-sm:gap-2 max-sm:px-3 max-sm:py-3 sm:flex-row sm:justify-end sm:px-6">
              <ButtonModule
                variant="outline"
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-full max-sm:text-sm sm:w-auto"
              >
                Close
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
      )}
    </section>
  )
}

// LoadingSkeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-gray-100">
    <CustomerDashboardNav />
    <div className="container mx-auto p-4 sm:p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="size-8 rounded-md bg-gray-200 sm:size-9"></div>
          <div>
            <div className="mb-2 h-6 w-32 rounded bg-gray-200 sm:h-8 sm:w-40"></div>
            <div className="h-4 w-40 rounded bg-gray-200 sm:w-48"></div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className="h-9 w-20 rounded bg-gray-200 sm:w-24"></div>
          <div className="h-9 w-20 rounded bg-gray-200 sm:w-24"></div>
          <div className="h-9 w-20 rounded bg-gray-200 sm:w-24"></div>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Left Column Skeleton */}
        <div className="w-full space-y-6 xl:w-[35%]">
          {/* Summary Card Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto size-20 rounded-full bg-gray-200 sm:size-24"></div>
                <div className="absolute -right-1 bottom-1 size-6 rounded-full bg-gray-200 sm:size-7"></div>
              </div>
              <div className="mx-auto mb-2 h-8 w-32 rounded bg-gray-200 sm:h-10 sm:w-40"></div>
              <div className="mx-auto mb-4 h-4 w-24 rounded bg-gray-200 sm:w-32"></div>
              <div className="mb-6 flex justify-center gap-2">
                <div className="h-6 w-20 rounded-full bg-gray-200 sm:w-24"></div>
                <div className="h-6 w-20 rounded-full bg-gray-200 sm:w-24"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
              </div>
            </div>
          </div>

          {/* Customer Info Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 h-5 w-40 rounded bg-gray-200 sm:h-6"></div>
            <div className="space-y-4">
              <div className="h-16 w-full rounded bg-gray-200"></div>
              <div className="h-16 w-full rounded bg-gray-200"></div>
              <div className="h-16 w-full rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 sm:h-6"></div>
            <div className="space-y-3">
              <div className="h-10 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
              <div className="mb-6 h-6 w-48 rounded bg-gray-200 sm:w-56"></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-4">
                  <div className="h-20 w-full rounded bg-gray-200"></div>
                  <div className="h-20 w-full rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-20 w-full rounded bg-gray-200"></div>
                  <div className="h-20 w-full rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-20 w-full rounded bg-gray-200"></div>
                  <div className="h-20 w-full rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default PaymentDetailsPage
