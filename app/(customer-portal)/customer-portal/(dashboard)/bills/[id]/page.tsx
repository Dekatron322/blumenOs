"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Globe,
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
import { clearBillDetails, getBillDetails } from "lib/redux/customersDashboardSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { UserOutlineIcon } from "components/Icons/Icons"
import { format } from "date-fns"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"

// Status badge configuration
const getStatusConfig = (status: number) => {
  const configs = {
    0: {
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: Clock,
      label: "PENDING",
    },
    1: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: CheckCircle,
      label: "CONFIRMED",
    },
    2: {
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: AlertCircle,
      label: "FAILED",
    },
  }
  return configs[status as keyof typeof configs] || configs[0]
}

const BillsDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const billId = params.id as string

  // Get bill details from Redux store
  const { billDetails, isLoadingBillDetails, billDetailsError, billDetailsSuccess } = useAppSelector(
    (state) => state.customersDashboard
  )

  const [isExporting, setIsExporting] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  useEffect(() => {
    if (billId) {
      const id = parseInt(billId)
      if (!isNaN(id)) {
        dispatch(getBillDetails({ id }))
      }
    }

    // Cleanup function to clear bill details when component unmounts
    return () => {
      dispatch(clearBillDetails())
    }
  }, [dispatch, billId])

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
    if (billId) {
      const id = parseInt(billId)
      if (!isNaN(id)) {
        dispatch(getBillDetails({ id }))
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
    if (!billDetails) return

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
      doc.text("BILL DETAILS", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Bill Information Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Bill Summary Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("BILL SUMMARY", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Bill Reference", billDetails.publicReference],
          ["Bill Name", billDetails.name],
          ["Period", billDetails.period],
          ["Status", billDetails.status.toString()],
          ["Category", billDetails.category.toString()],
          ["Total Due", formatCurrency(billDetails.totalDue, "NGN")],
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
          ["Customer Name", billDetails.customerName],
          ["Account Number", billDetails.customerAccountNumber],
          ["Customer ID", billDetails.customerId.toString()],
          ["Phone", billDetails.customer?.phoneNumber || "N/A"],
          ["Email", billDetails.customer?.email || "N/A"],
          ["Address", billDetails.customer?.address || "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Billing Details Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("BILLING DETAILS", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Consumption (kWh)", billDetails.consumptionKwh.toString()],
          ["Charge Before VAT", formatCurrency(billDetails.chargeBeforeVat, "NGN")],
          ["VAT Amount", formatCurrency(billDetails.vatAmount, "NGN")],
          ["Current Bill Amount", formatCurrency(billDetails.currentBillAmount, "NGN")],
          ["Opening Balance", formatCurrency(billDetails.openingBalance, "NGN")],
          ["Total Due", formatCurrency(billDetails.totalDue, "NGN")],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
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
          ["Area Office", billDetails.areaOfficeName],
          ["Distribution Substation", billDetails.distributionSubstationCode],
          ["Feeder", billDetails.feederName],
          ["Service Center", billDetails.customer.serviceCenter?.name || "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Tariff Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("TARIFF INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Tariff Name", billDetails.customer.tariff?.name || "N/A"],
          ["Tariff Code", billDetails.customer.tariff?.tariffCode || "N/A"],
          [
            "Tariff Rate",
            billDetails.customer.tariff ? formatCurrency(billDetails.customer.tariff.tariffRate, "NGN") : "N/A",
          ],
          ["Tariff Class", billDetails.customer.tariff?.tariffClass || "N/A"],
          ["Tariff Type", billDetails.customer.tariff?.tariffType || "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      // Add page numbers
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10)
      }

      // Save the PDF
      doc.save(`bill-${billDetails.publicReference}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoadingBillDetails) {
    return <LoadingSkeleton />
  }

  if (billDetailsError || !billDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-gray-400 sm:size-16" />
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {billDetailsError ? "Error Loading Bill" : "Bill Not Found"}
          </h1>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            {billDetailsError || "The bill you're looking for doesn't exist."}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonModule variant="outline" onClick={() => router.back()}>
              Back to Bills
            </ButtonModule>
            <ButtonModule variant="primary" onClick={handleRefresh}>
              Try Again
            </ButtonModule>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(billDetails.status)
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
                      <h1 className="text-lg font-bold text-gray-900 sm:text-xl xl:text-2xl">Bill Details</h1>
                      <p className="text-xs text-gray-600 sm:text-sm">Complete overview and information</p>
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
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-3 py-6 sm:px-4 sm:py-8 md:px-6 2xl:px-16">
              <div className="flex w-full flex-col gap-6 xl:flex-row">
                {/* Left Column - Bill Summary & Quick Info */}
                <div className="flex w-full flex-col space-y-6 xl:w-[35%]">
                  {/* Bill Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <div className="text-center">
                      <div className="relative mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 sm:size-24">
                        <FileText className="size-8 text-blue-600 sm:size-10" />
                        <div className="absolute -right-1 bottom-1 rounded-full bg-white p-1 shadow-md">
                          <div
                            className={`flex size-6 items-center justify-center rounded-full ${statusConfig.bg} sm:size-7`}
                          >
                            <StatusIcon className={`size-3 ${statusConfig.color} sm:size-4`} />
                          </div>
                        </div>
                      </div>

                      <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                        {formatCurrency(billDetails.totalDue, "NGN")}
                      </h2>
                      <p className="mb-4 text-sm text-gray-600 sm:text-base">Bill #{billDetails.publicReference}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color} sm:text-sm`}
                        >
                          {statusConfig.label}
                        </div>
                        <div className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 sm:text-sm">
                          {billDetails.category === 1 ? "Residential" : "Commercial"}
                        </div>
                        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 sm:text-sm">
                          {billDetails.period}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Consumption:</span>
                          <span className="font-semibold text-gray-900">{billDetails.consumptionKwh} kWh</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>VAT Amount:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(billDetails.vatAmount, "NGN")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Current Bill:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(billDetails.currentBillAmount, "NGN")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Opening Balance:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(billDetails.openingBalance, "NGN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

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
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{billDetails.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 sm:size-10">
                          <CreditCard className="size-4 text-green-600 sm:size-5" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Account Number</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customerAccountNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 sm:size-10">
                          <Phone className="size-4 text-purple-600 sm:size-5" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Phone Number</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer?.phoneNumber || "N/A"}
                          </p>
                        </div>
                      </div>
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
                        variant="secondary"
                        size="md"
                        className="w-full justify-start gap-3 text-sm"
                        onClick={exportToPDF}
                        disabled={isExporting}
                      >
                        <Download className="size-4" />
                        {isExporting ? "Exporting..." : "Export PDF"}
                      </ButtonModule>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:w-[65%]">
                  {/* Bill Timeline */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">Bill Timeline</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Billing Period</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">{billDetails.period}</p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Created At</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatDate(billDetails.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Bill Status</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            <span className={`inline-flex items-center gap-1 ${statusConfig.color}`}>
                              <StatusIcon className="size-4" />
                              {statusConfig.label}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Category</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.category === 1 ? "Residential" : "Commercial"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Last Updated</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatDate(billDetails.lastUpdated)}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Reference</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.publicReference}
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
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Total Due</label>
                          <p className="text-lg font-bold text-gray-900 sm:text-xl">
                            {formatCurrency(billDetails.totalDue, "NGN")}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Current Bill Amount</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(billDetails.currentBillAmount, "NGN")}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Charge Before VAT</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(billDetails.chargeBeforeVat, "NGN")}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">VAT Amount</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(billDetails.vatAmount, "NGN")}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Opening Balance</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(billDetails.openingBalance, "NGN")}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Consumption (kWh)</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.consumptionKwh} kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tariff Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Package className="size-5" />
                      Tariff Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Tariff Name</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer.tariff?.name || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Tariff Code</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer.tariff?.tariffCode || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Tariff Class</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer.tariff?.tariffClass || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Tariff Rate</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer.tariff
                              ? formatCurrency(billDetails.customer.tariff.tariffRate, "NGN")
                              : "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Tariff Type</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer.tariff?.tariffType || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Service Band</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer.tariff?.serviceBand?.toString() || "N/A"}
                          </p>
                        </div>
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
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Area Office</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.areaOfficeName}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Service Center</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer.serviceCenter?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">
                            Distribution Substation
                          </label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.distributionSubstationCode}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Feeder</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{billDetails.feederName}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Phone Number</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer?.phoneNumber || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Customer Address</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer?.address || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">City</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.customer?.city || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Billing Period Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Calendar className="size-5" />
                      Billing Period Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Period</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">{billDetails.period}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Billing Period ID</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.billingPeriodId}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Year</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.billingPeriod?.year || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Month</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.billingPeriod?.month || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Display Name</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.billingPeriod?.displayName || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Period Key</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.billingPeriod?.periodKey || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Meter Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Package className="size-5" />
                      Meter Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Meter Reading ID</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.meterReadingId}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Is Estimated</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.isEstimated ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">
                            Is Meter Reading Flagged
                          </label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.isMeterReadingFlagged ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Estimated Consumption</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.estimatedConsumptionKwh} kWh
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Actual Consumption</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.actualConsumptionKwh} kWh
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Consumption Variance</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {billDetails.consumptionVarianceKwh} kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Dispute Information */}
                  {billDetails.activeDispute && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <AlertCircle className="size-5" />
                        Dispute Information
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Dispute ID</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {billDetails.activeDispute.id}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Status</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {billDetails.activeDispute.status}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Reason</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {billDetails.activeDispute.reason}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Raised At</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatDate(billDetails.activeDispute.raisedAtUtc)}
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

export default BillsDetailsPage
