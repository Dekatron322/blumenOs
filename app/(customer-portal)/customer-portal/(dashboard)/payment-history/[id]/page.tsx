"use client"

import React, { useEffect, useState } from "react"
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
import { clearPaymentDetail, getPaymentDetail } from "lib/redux/customersDashboardSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { UserOutlineIcon } from "components/Icons/Icons"
import { format } from "date-fns"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"

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

  // Get payment details from Redux store
  const { paymentDetail, isLoadingPaymentDetail, paymentDetailError, paymentDetailSuccess } = useAppSelector(
    (state) => state.customersDashboard
  )

  const [isExporting, setIsExporting] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount)
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

  const exportToPDF = async () => {
    if (!paymentDetail) return

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
          ["Payment Reference", paymentDetail.reference],
          ["Amount", formatCurrency(paymentDetail.amount, paymentDetail.currency)],
          ["Status", paymentDetail.status],
          ["Channel", paymentDetail.channel],
          ["Payment Type", paymentDetail.paymentTypeName],
          ["Currency", paymentDetail.currency],
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
          ["Customer Name", paymentDetail.customerName],
          ["Account Number", paymentDetail.customerAccountNumber],
          ["Customer ID", paymentDetail.customerId.toString()],
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
          ["Paid At", formatDate(paymentDetail.paidAtUtc)],
          ["Confirmed At", paymentDetail.confirmedAtUtc ? formatDate(paymentDetail.confirmedAtUtc) : "N/A"],
          ["Amount Applied", formatCurrency(paymentDetail.amountApplied, paymentDetail.currency)],
          ["VAT Amount", formatCurrency(paymentDetail.vatAmount, paymentDetail.currency)],
          ["Overpayment", formatCurrency(paymentDetail.overPaymentAmount, paymentDetail.currency)],
          ["Outstanding Before", formatCurrency(paymentDetail.outstandingBeforePayment, paymentDetail.currency)],
          ["Outstanding After", formatCurrency(paymentDetail.outstandingAfterPayment, paymentDetail.currency)],
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
          ["Collector Type", paymentDetail.collectorType],
          ["Agent Name", paymentDetail.agentName || "N/A"],
          ["Agent Code", paymentDetail.agentCode || "N/A"],
          ["Vendor Name", paymentDetail.vendorName || "N/A"],
          ["Recorded By", paymentDetail.recordedByName || "N/A"],
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
          ["Area Office", paymentDetail.areaOfficeName || "N/A"],
          ["Distribution Substation", paymentDetail.distributionSubstationCode || "N/A"],
          ["Feeder", paymentDetail.feederName || "N/A"],
          ["Latitude", paymentDetail.latitude.toString()],
          ["Longitude", paymentDetail.longitude.toString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Bill Information Section (if postpaid)
      if (paymentDetail.postpaidBillId) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("BILL INFORMATION", 14, yPosition)
        yPosition += 10

        autoTable(doc, {
          startY: yPosition,
          head: [["Field", "Details"]],
          body: [
            ["Bill ID", paymentDetail.postpaidBillId.toString()],
            ["Bill Period", paymentDetail.postpaidBillPeriod || "N/A"],
            ["Total Due", formatCurrency(paymentDetail.billTotalDue, paymentDetail.currency)],
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
          ["Narrative", paymentDetail.narrative || "N/A"],
          ["External Reference", paymentDetail.externalReference || "N/A"],
          ["Vendor Account ID", paymentDetail.vendorAccountId || "N/A"],
          ["Checkout URL", paymentDetail.checkoutUrl || "N/A"],
          ["Evidence File", paymentDetail.evidenceFileUrl || "N/A"],
          ["Manual Entry", paymentDetail.isManualEntry ? "Yes" : "No"],
          ["System Generated", paymentDetail.isSystemGenerated ? "Yes" : "No"],
          ["Recovery Applied", paymentDetail.recoveryApplied ? "Yes" : "No"],
          [
            "Recovery Amount",
            paymentDetail.recoveryApplied
              ? formatCurrency(paymentDetail.recoveryAmount, paymentDetail.currency)
              : "N/A",
          ],
          ["Recovery Policy", paymentDetail.recoveryPolicyName || "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Tokens Section (if tokens exist)
      if (paymentDetail.tokens && paymentDetail.tokens.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("TOKEN INFORMATION", 14, yPosition)
        yPosition += 10

        const tokensBody = paymentDetail.tokens.map((token, index) => [
          `Token ${index + 1}`,
          token.token,
          token.vendedAmount,
          token.unit,
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [["Token #", "Token", "Amount", "Unit"]],
          body: tokensBody,
          theme: "grid",
          headStyles: { fillColor: [139, 92, 246], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }

      // Virtual Account Section (if exists)
      if (paymentDetail.virtualAccount?.accountNumber) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("VIRTUAL ACCOUNT", 14, yPosition)
        yPosition += 10

        autoTable(doc, {
          startY: yPosition,
          head: [["Field", "Details"]],
          body: [
            ["Account Number", paymentDetail.virtualAccount.accountNumber],
            ["Bank Name", paymentDetail.virtualAccount.bankName],
            ["Reference", paymentDetail.virtualAccount.reference],
            ["Expires At", formatDate(paymentDetail.virtualAccount.expiresAtUtc)],
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
      doc.save(`payment-${paymentDetail.reference}-${new Date().toISOString().split("T")[0]}.pdf`)
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

  if (paymentDetailError || !paymentDetail) {
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

  const statusConfig = getStatusConfig(paymentDetail.status)
  const channelConfig = getChannelConfig(paymentDetail.channel)
  const collectorConfig = getCollectorConfig(paymentDetail.collectorType)
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
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 text-sm"
                      onClick={exportToPDF}
                      disabled={isExporting}
                    >
                      <Download className="size-3 sm:size-4" />
                      <span className="max-sm:hidden">{isExporting ? "Exporting..." : "Export PDF"}</span>
                      <span className="sm:hidden">{isExporting ? "..." : "PDF"}</span>
                    </ButtonModule>

                    {paymentDetail.evidenceFileUrl && (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2 text-sm"
                        onClick={() => window.open(paymentDetail.evidenceFileUrl, "_blank")}
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
                        {formatCurrency(paymentDetail.amount, paymentDetail.currency)}
                      </h2>
                      <p className="mb-4 text-sm text-gray-600 sm:text-base">Payment #{paymentDetail.reference}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color} sm:text-sm`}
                        >
                          {statusConfig.label}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${channelConfig.bg} ${channelConfig.color} sm:text-sm`}
                        >
                          {paymentDetail.channel}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${collectorConfig.bg} ${collectorConfig.color} sm:text-sm`}
                        >
                          {paymentDetail.collectorType}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Payment Type:</span>
                          <span className="font-semibold text-gray-900">{paymentDetail.paymentTypeName}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Currency:</span>
                          <span className="font-semibold text-gray-900">{paymentDetail.currency}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Applied Amount:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(paymentDetail.amountApplied, paymentDetail.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>VAT Amount:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(paymentDetail.vatAmount, paymentDetail.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tokens Card (if tokens exist) */}
                  {paymentDetail.tokens && paymentDetail.tokens.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                        Tokens Information
                      </h3>
                      <div className="space-y-3">
                        {paymentDetail.tokens.map((token, index) => (
                          <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="text-sm font-semibold text-gray-900 sm:text-base">Token</div>
                              <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                {token.unit}
                              </div>
                            </div>

                            {/* Token - Copyable */}
                            <div className="mb-3">
                              <label className="mb-1 block text-xs font-medium text-gray-600">Token Number</label>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 break-all rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-900">
                                  {token.token}
                                </div>
                                <button
                                  onClick={() => copyToClipboard(token.token, `token-${index}`)}
                                  className={`flex items-center justify-center rounded-md p-2 transition-colors ${
                                    copiedItem === `token-${index}`
                                      ? "bg-green-50 text-green-600"
                                      : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                  }`}
                                  title={copiedItem === `token-${index}` ? "Copied!" : "Copy token"}
                                >
                                  {copiedItem === `token-${index}` ? (
                                    <Check className="size-4" />
                                  ) : (
                                    <Copy className="size-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Other token details */}
                            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                              <div>
                                <label className="text-xs font-medium text-gray-600">Amount</label>
                                <div className="font-medium text-gray-900">{token.vendedAmount}</div>
                              </div>
                              {/* {token.description && (
                                <div>
                                  <label className="text-xs font-medium text-gray-600">Description</label>
                                  <div className="text-gray-900">{token.description}</div>
                                </div>
                              )} */}
                              {token.drn && (
                                <div>
                                  <label className="text-xs font-medium text-gray-600">Meter Number</label>
                                  <div className="flex items-center gap-2">
                                    <div className="font-mono text-xs text-gray-900">{token.drn}</div>
                                    <button
                                      onClick={() => copyToClipboard(token.drn, `drn-${index}`)}
                                      className={`rounded p-1 transition-colors ${
                                        copiedItem === `drn-${index}`
                                          ? "bg-green-50 text-green-600"
                                          : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                      }`}
                                      title={copiedItem === `drn-${index}` ? "Copied!" : "Copy DRN"}
                                    >
                                      {copiedItem === `drn-${index}` ? (
                                        <Check className="size-3" />
                                      ) : (
                                        <Copy className="size-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
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
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.customerName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 sm:size-10">
                          <CreditCard className="size-4 text-green-600 sm:size-5" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Account Number</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.customerAccountNumber}
                          </p>
                        </div>
                      </div>
                      {/* <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 sm:size-10">
                          <Shield className="size-4 text-purple-600 sm:size-5" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Customer ID</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentDetail.customerId}</p>
                        </div>
                      </div> */}
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
                      {paymentDetail.checkoutUrl && (
                        <ButtonModule
                          variant="primary"
                          size="md"
                          className="w-full justify-start gap-3 text-sm"
                          onClick={() => window.open(paymentDetail.checkoutUrl, "_blank")}
                        >
                          <ExternalLink className="size-4" />
                          View Checkout
                        </ButtonModule>
                      )}
                      {paymentDetail.evidenceFileUrl && (
                        <ButtonModule
                          variant="secondary"
                          size="md"
                          className="w-full justify-start gap-3 text-sm"
                          onClick={() => window.open(paymentDetail.evidenceFileUrl, "_blank")}
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
                              {formatDate(paymentDetail.paidAtUtc)}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Payment Channel</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentDetail.channel}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Confirmed At</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentDetail.confirmedAtUtc
                                ? formatDate(paymentDetail.confirmedAtUtc)
                                : "Not confirmed"}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Collector Type</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.collectorType}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Payment Status</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            <span className={`inline-flex items-center gap-1 ${statusConfig.color}`}>
                              <StatusIcon className="size-4" />
                              {paymentDetail.status}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Payment Type</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.paymentTypeName}
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
                            {formatCurrency(paymentDetail.amount, paymentDetail.currency)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Amount Applied</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(paymentDetail.amountApplied, paymentDetail.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">VAT Amount</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(paymentDetail.vatAmount, paymentDetail.currency)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Overpayment</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(paymentDetail.overPaymentAmount, paymentDetail.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Outstanding Before</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(paymentDetail.outstandingBeforePayment, paymentDetail.currency)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Outstanding After</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(paymentDetail.outstandingAfterPayment, paymentDetail.currency)}
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
                            {paymentDetail.collectorType}
                          </p>
                        </div>
                        {paymentDetail.agentName && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Agent Name</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentDetail.agentName}
                            </p>
                          </div>
                        )}
                        {paymentDetail.agentCode && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Agent Code</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentDetail.agentCode}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {paymentDetail.vendorName && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Vendor Name</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentDetail.vendorName}
                            </p>
                          </div>
                        )}
                        {paymentDetail.recordedByName && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Recorded By</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentDetail.recordedByName}
                            </p>
                          </div>
                        )}
                        {paymentDetail.vendorAccountId && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Vendor Account ID</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentDetail.vendorAccountId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Location Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <MapPin className="size-5" />
                      Location Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Latitude</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentDetail.latitude}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Longitude</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{paymentDetail.longitude}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Area Office</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.areaOfficeName || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">
                            Distribution Substation
                          </label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.distributionSubstationCode || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Feeder</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.feederName || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Coordinates</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.latitude}, {paymentDetail.longitude}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bill Information (if postpaid) */}
                  {paymentDetail.postpaidBillId && (
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
                              {paymentDetail.postpaidBillId}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Bill Period</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentDetail.postpaidBillPeriod || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Total Bill Due</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatCurrency(paymentDetail.billTotalDue, paymentDetail.currency)}
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
                            {paymentDetail.narrative || "No narrative"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">External Reference</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.externalReference || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Checkout URL</label>
                          <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.checkoutUrl ? (
                              <a
                                href={paymentDetail.checkoutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {paymentDetail.checkoutUrl}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Evidence File</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.evidenceFileUrl ? (
                              <a
                                href={paymentDetail.evidenceFileUrl}
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
                            {paymentDetail.isManualEntry ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">System Generated</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.isSystemGenerated ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Recovery Applied</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {paymentDetail.recoveryApplied ? "Yes" : "No"}
                          </p>
                        </div>
                        {paymentDetail.recoveryApplied && (
                          <>
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Recovery Amount</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {formatCurrency(paymentDetail.recoveryAmount, paymentDetail.currency)}
                              </p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Recovery Policy</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {paymentDetail.recoveryPolicyName || "N/A"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Virtual Account Information (if exists) */}
                  {paymentDetail.virtualAccount?.accountNumber && (
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
                              {paymentDetail.virtualAccount.accountNumber}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Bank Name</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentDetail.virtualAccount.bankName}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Reference</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {paymentDetail.virtualAccount.reference}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Expires At</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatDate(paymentDetail.virtualAccount.expiresAtUtc)}
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
