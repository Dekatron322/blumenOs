"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Edit3,
  FileText,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  FileSignature,
  Clock,
  AlertTriangle,
  CheckSquare,
  XCircle,
  RefreshCw,
  Download,
  ArrowLeft,
  File,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import {
  UserIcon,
  CalendarOutlineIcon,
  EmailOutlineIcon,
  PhoneOutlineIcon,
  MapOutlineIcon,
  ExportCsvIcon,
} from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearDisputeById, getDisputeById } from "lib/redux/billingDisputeSlice"
import { fetchPostpaidBillById, clearCurrentBill } from "lib/redux/postpaidSlice"
import { formatCurrency } from "utils/formatCurrency"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Status options mapping
const statusOptions = [
  { value: 0, label: "Pending", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { value: 1, label: "Under Review", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { value: 2, label: "Resolved", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { value: 3, label: "Rejected", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
]

// Priority options mapping
const priorityOptions = [
  { value: "low", label: "Low", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { value: "medium", label: "Medium", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { value: "high", label: "High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  { value: "critical", label: "Critical", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
]

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
    <DashboardNav />
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
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Left Column Skeleton */}
        <div className="w-full space-y-6 xl:w-[30%]">
          {/* Dispute Overview Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto size-16 rounded-full bg-gray-200 sm:size-20"></div>
                <div className="absolute -right-1 bottom-1 size-5 rounded-full bg-gray-200 sm:size-6"></div>
              </div>
              <div className="mx-auto mb-2 h-6 w-32 rounded bg-gray-200 sm:h-7"></div>
              <div className="mx-auto mb-4 h-4 w-24 rounded bg-gray-200"></div>
              <div className="mb-6 flex justify-center gap-2">
                <div className="h-6 w-16 rounded-full bg-gray-200 sm:w-20"></div>
                <div className="h-6 w-16 rounded-full bg-gray-200 sm:w-20"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 sm:h-6"></div>
            <div className="space-y-3">
              <div className="h-9 w-full rounded bg-gray-200 sm:h-10"></div>
              <div className="h-9 w-full rounded bg-gray-200 sm:h-10"></div>
              <div className="h-9 w-full rounded bg-gray-200 sm:h-10"></div>
            </div>
          </div>

          {/* Attachments Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 sm:h-6"></div>
            <div className="space-y-3">
              <div className="h-16 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
              <div className="mb-6 h-6 w-40 rounded bg-gray-200 sm:w-48"></div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const BillingDisputeDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const disputeId = params.id as string

  // Get dispute details from Redux store
  const { disputeById, loadingDisputeById, disputeByIdError } = useAppSelector((state) => state.billingDispute)
  const { currentBill } = useAppSelector((state) => state.postpaidBilling)

  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<"details" | "payments" | "timeline">("details")
  const [isMobileTabMenuOpen, setIsMobileTabMenuOpen] = useState(false)

  useEffect(() => {
    if (disputeId) {
      const id = parseInt(disputeId)
      if (!isNaN(id)) {
        dispatch(getDisputeById({ id }))
      }
    }

    // Cleanup function to clear dispute details when component unmounts
    return () => {
      dispatch(clearDisputeById())
    }
  }, [dispatch, disputeId])

  // Fetch related bill details using the billId from the dispute
  useEffect(() => {
    if (!disputeById?.billId) return

    dispatch(fetchPostpaidBillById(disputeById.billId))

    return () => {
      dispatch(clearCurrentBill())
    }
  }, [dispatch, disputeById?.billId])

  const getStatusConfig = (status: number) => {
    const config = statusOptions.find((opt) => opt.value === status) || statusOptions[0]
    return {
      ...config,
      icon: status === 2 ? CheckCircle : status === 3 ? XCircle : status === 1 ? RefreshCw : AlertCircle,
    }
  }

  const getPriorityConfig = (priorityValue: string) => {
    const config = priorityOptions.find((opt) => opt.value === priorityValue) || priorityOptions[1]
    return config
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phoneNumber
  }

  const calculateTotalDisputedAmount = () => {
    if (!disputeById?.payments) return 0
    return disputeById.payments.reduce((sum, payment) => sum + (payment.overPaymentAmount || 0), 0)
  }

  const calculateTotalOriginalAmount = () => {
    if (!disputeById?.payments) return 0
    return disputeById.payments.reduce((sum, payment) => sum + (payment.billTotalDue || 0), 0)
  }

  const getTabLabel = (tab: "details" | "payments" | "timeline") => {
    switch (tab) {
      case "details":
        return "Dispute Details"
      case "payments":
        return "Related Payments"
      case "timeline":
        return "Timeline"
      default:
        return "Dispute Details"
    }
  }

  const exportToPDF = async () => {
    if (!disputeById) return

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
      doc.text("BILLING DISPUTE RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Dispute Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Dispute Overview Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("DISPUTE OVERVIEW", 14, yPosition)
      yPosition += 10

      const statusConfig = getStatusConfig(disputeById.status)
      const priorityConfig = getPriorityConfig("medium") // You may need to map this from your data

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Dispute ID", `DIS-${disputeById.id}`],
          ["Customer Name", disputeById.customerName],
          ["Account Number", disputeById.customerAccountNumber],
          ["Status", statusConfig.label ?? "Unknown"],
          ["Priority", priorityConfig?.label ?? "Unknown"],
          ["Bill ID", disputeById.billId.toString()],
          ["Customer ID", disputeById.customerId.toString()],
          ["Total Disputed Amount", formatCurrency(calculateTotalDisputedAmount(), "₦")],
          ["Total Original Amount", formatCurrency(calculateTotalOriginalAmount(), "₦")],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Dispute Details Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("DISPUTE DETAILS", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Category", "Details"]],
        body: [
          ["Reason", disputeById.reason || "Not provided"],
          ["Details", disputeById.details || "Not provided"],
          ["Resolution Notes", disputeById.resolutionNotes || "Not resolved yet"],
          ["Raised By", disputeById.raisedByName || "N/A"],
          ["Raised At", formatDate(disputeById.raisedAtUtc)],
          ["Resolved By", disputeById.resolvedByName || "N/A"],
          ["Resolved At", formatDate(disputeById.resolvedAtUtc)],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Payments Section
      if (disputeById.payments && disputeById.payments.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("RELATED PAYMENTS", 14, yPosition)
        yPosition += 10

        const paymentsBody = disputeById.payments.map((payment) => [
          payment.reference,
          formatCurrency(payment.amount, payment.currency),
          formatCurrency(payment.overPaymentAmount, payment.currency),
          formatCurrency(payment.billTotalDue, payment.currency),
          payment.postpaidBillPeriod,
          payment.areaOfficeName || "N/A",
          payment.channel,
          formatDate(payment.paidAtUtc),
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [
            [
              "Reference",
              "Amount",
              "Disputed Amount",
              "Bill Total",
              "Billing Period",
              "Area Office",
              "Channel",
              "Paid At",
            ],
          ],
          body: paymentsBody,
          theme: "grid",
          headStyles: { fillColor: [139, 92, 246], textColor: 255 },
          styles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }

      // Attachments Section
      if (disputeById.fileUrls && disputeById.fileUrls.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("ATTACHMENTS", 14, yPosition)
        yPosition += 10

        const attachmentsBody = disputeById.fileUrls.map((url, index) => [
          `Attachment ${index + 1}`,
          url.substring(0, 50) + (url.length > 50 ? "..." : ""),
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [["Attachment", "URL"]],
          body: attachmentsBody,
          theme: "grid",
          headStyles: { fillColor: [245, 158, 11], textColor: 255 },
          styles: { fontSize: 9 },
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
      doc.save(`dispute-${disputeById.id}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleUpdateStatus = () => {
    // TODO: Implement update status functionality
    console.log("Update status clicked")
  }

  const handleAdjustBill = () => {
    // TODO: Implement adjust bill functionality
    console.log("Adjust bill clicked")
  }

  const handleAssignToAgent = () => {
    // TODO: Implement assign to agent functionality
    console.log("Assign to agent clicked")
  }

  if (loadingDisputeById) {
    return <LoadingSkeleton />
  }

  if (disputeByIdError || !disputeById) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-gray-400 sm:size-16" />
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {disputeByIdError ? "Error Loading Dispute" : "Dispute Not Found"}
          </h1>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            {disputeByIdError || "The dispute you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.push("/disputes/billing-disputes")}>
            Back to Disputes
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(disputeById.status)
  const StatusIcon = statusConfig.icon
  const billTotalDue = currentBill?.totalDue ?? calculateTotalOriginalAmount()
  const totalDisputedAmount = calculateTotalDisputedAmount()
  const totalOriginalAmount = calculateTotalOriginalAmount()

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col xl:container">
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-3 py-4 sm:px-3 xl:px-16">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      type="button"
                      onClick={() => router.push("/disputes/billing-disputes")}
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
                      <h1 className="text-lg font-bold text-gray-900 sm:text-xl xl:text-2xl">Dispute Details</h1>
                      <p className="text-xs text-gray-600 sm:text-sm">Complete overview and management</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 text-sm"
                      onClick={exportToPDF}
                      disabled={isExporting}
                    >
                      <ExportCsvIcon />
                      <span className="max-sm:hidden">{isExporting ? "Exporting..." : "Export PDF"}</span>
                      <span className="sm:hidden">Export</span>
                    </ButtonModule>

                    <ButtonModule
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-2 text-sm"
                      onClick={handleUpdateStatus}
                    >
                      <Edit3 className="size-3 sm:size-4" />
                      <span className="max-sm:hidden">Update Status</span>
                      <span className="sm:hidden">Update</span>
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-3 py-6 sm:px-3 sm:py-8 xl:px-16">
              <div className="flex w-full flex-col gap-6 xl:flex-row">
                {/* Left Column - Overview & Quick Actions */}
                <div className="flex w-full flex-col space-y-6 xl:w-[30%]">
                  {/* Dispute Overview Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 sm:size-20 sm:text-3xl">
                          <DollarSign className="size-8 sm:size-10" />
                        </div>
                        <div
                          className={`absolute -right-1 bottom-1 ${statusConfig.bg} ${statusConfig.border} rounded-full border-2 p-1 sm:p-1.5`}
                        >
                          <StatusIcon className={`size-3 ${statusConfig.color} sm:size-4`} />
                        </div>
                      </div>

                      <h2 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">Dispute #{disputeById.id}</h2>
                      <p className="mb-4 text-sm text-gray-600 sm:text-base">{disputeById.customerName}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color} sm:text-sm`}
                        >
                          {statusConfig.label}
                        </div>
                        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 sm:text-sm">
                          Account: {disputeById.customerAccountNumber}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-lg bg-gray-50 p-3">
                          <div className="text-sm font-medium text-gray-600">Total Disputed Amount</div>
                          <div className="text-lg font-bold text-gray-900 sm:text-xl">
                            {formatCurrency(totalDisputedAmount, "₦")}
                          </div>
                          <div className="text-xs text-gray-500">
                            Original: {formatCurrency(totalOriginalAmount, "₦")}
                          </div>
                        </div>

                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Bill ID:</span>
                            <span className="font-medium">#{disputeById.billId}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Raised By:</span>
                            <span className="font-medium">{disputeById.raisedByName}</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Date Raised:</span>
                            <span className="font-medium">{formatDate(disputeById.raisedAtUtc)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <ButtonModule
                        variant="outline"
                        size="md"
                        className="w-full justify-start gap-3 text-sm"
                        onClick={handleUpdateStatus}
                      >
                        <Edit3 className="size-4" />
                        Update Status
                      </ButtonModule>
                      <ButtonModule
                        variant="primary"
                        size="md"
                        className="w-full justify-start gap-3 text-sm"
                        onClick={handleAssignToAgent}
                      >
                        <UserIcon />
                        Assign to Agent
                      </ButtonModule>
                      <ButtonModule
                        variant="primary"
                        size="md"
                        className="w-full justify-start gap-3 text-sm"
                        onClick={handleAdjustBill}
                      >
                        <DollarSign className="size-4" />
                        Adjust Bill
                      </ButtonModule>
                    </div>
                  </motion.div>

                  {/* Attachments */}
                  {disputeById.fileUrls && disputeById.fileUrls.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                        <File />
                        Attachments ({disputeById.fileUrls.length})
                      </h3>
                      <div className="space-y-3">
                        {disputeById.fileUrls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                          >
                            <FileText className="size-4 text-blue-600" />
                            <div className="flex-1 truncate">
                              <div className="text-sm font-medium text-gray-900">Attachment {index + 1}</div>
                              <div className="truncate text-xs text-gray-500">
                                {new URL(url).pathname.split("/").pop()}
                              </div>
                            </div>
                            <Download className="size-4 text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:max-w-[70%]">
                  {/* Tab Navigation - mobile dropdown + desktop buttons */}
                  <div className="inline-flex rounded-md bg-white p-2">
                    {/* Mobile dropdown */}
                    <div className="relative sm:hidden">
                      <button
                        type="button"
                        className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
                        onClick={() => setIsMobileTabMenuOpen((prev) => !prev)}
                      >
                        <span>{getTabLabel(activeTab)}</span>
                        <ChevronDown
                          className={`size-4 transform text-gray-500 transition-transform ${
                            isMobileTabMenuOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>
                      {isMobileTabMenuOpen && (
                        <div className="absolute z-10 mt-2 min-w-full rounded-md border border-gray-200 bg-white shadow-lg">
                          <button
                            onClick={() => {
                              setActiveTab("details")
                              setIsMobileTabMenuOpen(false)
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                              activeTab === "details" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <FileText className="size-4" />
                            <span>Dispute Details</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("payments")
                              setIsMobileTabMenuOpen(false)
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                              activeTab === "payments" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <CreditCard className="size-4" />
                            <span>Related Payments</span>
                            {disputeById.payments?.length ? (
                              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium leading-none text-white">
                                {disputeById.payments.length}
                              </span>
                            ) : null}
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("timeline")
                              setIsMobileTabMenuOpen(false)
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                              activeTab === "timeline" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <Clock className="size-4" />
                            <span>Timeline</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Desktop tabs */}
                    <div className="hidden sm:inline-block">
                      <nav className="-mb-px flex space-x-2">
                        <button
                          onClick={() => setActiveTab("details")}
                          className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                            activeTab === "details"
                              ? "bg-[#004B23] text-white"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                          }`}
                        >
                          <FileText className="size-4" />
                          <span>Dispute Details</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("payments")}
                          className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                            activeTab === "payments"
                              ? "bg-[#004B23] text-white"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                          }`}
                        >
                          <CreditCard className="size-4" />
                          <span>Related Payments</span>
                          {disputeById.payments?.length ? (
                            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium leading-none text-white">
                              {disputeById.payments.length}
                            </span>
                          ) : null}
                        </button>
                        <button
                          onClick={() => setActiveTab("timeline")}
                          className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                            activeTab === "timeline"
                              ? "bg-[#004B23] text-white"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                          }`}
                        >
                          <Clock className="size-4" />
                          <span>Timeline</span>
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Dispute Details Tab */}
                  {activeTab === "details" && (
                    <>
                      {/* Customer Information */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                      >
                        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <User className="size-5" />
                          Customer Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 sm:size-10">
                                <User className="size-4 text-blue-600 sm:size-5" />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 sm:text-sm">Customer Name</label>
                                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                  {disputeById.customerName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 sm:size-10">
                                <CreditCard className="size-4 text-green-600 sm:size-5" />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 sm:text-sm">Account Number</label>
                                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                  {disputeById.customerAccountNumber}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 sm:size-10">
                                <Building className="size-4 text-purple-600 sm:size-5" />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 sm:text-sm">Customer ID</label>
                                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                  {disputeById.customerId}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 sm:size-10">
                                <FileSignature className="size-4 text-red-600 sm:size-5" />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 sm:text-sm">Bill ID</label>
                                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                  #{disputeById.billId}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Dispute Information */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                      >
                        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <FileText className="size-5" />
                          Dispute Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-4">
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Reason</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {disputeById.reason || "Not specified"}
                              </p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Status</label>
                              <div className="flex items-center gap-2">
                                <div className={`size-3 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></div>
                                <p className="text-sm font-semibold text-gray-900 sm:text-base">{statusConfig.label}</p>
                              </div>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Raised By</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {disputeById.raisedByName || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Details</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {disputeById.details || "No details provided"}
                              </p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Raised At</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {formatDate(disputeById.raisedAtUtc)}
                              </p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Resolved At</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {formatDate(disputeById.resolvedAtUtc) || "Not resolved yet"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Amount Information */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                      >
                        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                          Amount Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">
                              Total Disputed Amount
                            </label>
                            <p className="text-lg font-bold text-gray-900 sm:text-xl">
                              {formatCurrency(totalDisputedAmount, "₦")}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">
                              Total Original Amount
                            </label>
                            <p className="text-lg font-bold text-gray-900 sm:text-xl">
                              {formatCurrency(totalOriginalAmount, "₦")}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Difference</label>
                            <p className="text-lg font-bold text-gray-900 sm:text-xl">
                              {formatCurrency(totalOriginalAmount - totalDisputedAmount, "₦")}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">
                              Total Original Amount
                            </label>
                            <p className="text-lg font-bold text-gray-900 sm:text-xl">
                              {formatCurrency(totalOriginalAmount, "₦")}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Bill Total Due</label>
                            <p className="text-lg font-bold text-gray-900 sm:text-xl">
                              {formatCurrency(billTotalDue, "₦")}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Resolution Information */}
                      {disputeById.resolutionNotes && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                        >
                          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <CheckSquare className="size-5" />
                            Resolution Information
                          </h3>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Resolution Notes</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {disputeById.resolutionNotes}
                              </p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-xs font-medium text-gray-600 sm:text-sm">Resolved By</label>
                              <p className="text-sm font-semibold text-gray-900 sm:text-base">
                                {disputeById.resolvedByName || "N/A"}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {/* Payments Tab */}
                  {activeTab === "payments" && disputeById.payments && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <CreditCard className="size-5" />
                        Related Payments
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Reference
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Amount
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Disputed Amount
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Bill Total
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Billing Period
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Channel
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Status
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Paid At
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {disputeById.payments.map((payment, index) => (
                              <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">
                                  {payment.reference}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  {formatCurrency(payment.amount, payment.currency)}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  <span className="font-semibold text-red-600">
                                    {formatCurrency(payment.overPaymentAmount, payment.currency)}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  {formatCurrency(payment.billTotalDue, payment.currency)}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  {payment.postpaidBillPeriod}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                    {payment.channel}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      payment.status === "Confirmed"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : payment.status === "Pending"
                                        ? "bg-amber-50 text-amber-700"
                                        : payment.status === "Failed"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-gray-50 text-gray-700"
                                    }`}
                                  >
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                  {formatDate(payment.paidAtUtc)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {disputeById.payments.length === 0 && (
                        <div className="py-8 text-center">
                          <p className="text-sm text-gray-500 sm:text-base">No payments found for this dispute</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Timeline Tab */}
                  {activeTab === "timeline" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Clock className="size-5" />
                        Dispute Timeline
                      </h3>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100">
                              <CheckCircle className="size-4 text-emerald-600" />
                            </div>
                            <div className="mt-2 h-full w-0.5 bg-gray-200"></div>
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-gray-900">Dispute Raised</div>
                                <div className="text-xs text-gray-500">{formatDate(disputeById.raisedAtUtc)}</div>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">Raised by {disputeById.raisedByName}</p>
                              {disputeById.reason && (
                                <p className="mt-2 text-sm text-gray-700">
                                  <strong>Reason:</strong> {disputeById.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {disputeById.resolvedAtUtc && (
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                                <CheckCircle className="size-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 pb-8">
                              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-gray-900">Dispute Resolved</div>
                                  <div className="text-xs text-gray-500">{formatDate(disputeById.resolvedAtUtc)}</div>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">Resolved by {disputeById.resolvedByName}</p>
                                {disputeById.resolutionNotes && (
                                  <p className="mt-2 text-sm text-gray-700">
                                    <strong>Resolution:</strong> {disputeById.resolutionNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Current Status */}
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`flex size-8 items-center justify-center rounded-full ${statusConfig.bg}`}>
                              <StatusIcon className={`size-4 ${statusConfig.color}`} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <div className="font-medium text-gray-900">Current Status</div>
                              <div className="mt-2 flex items-center gap-2">
                                <div className={`size-3 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></div>
                                <p className="text-sm font-medium text-gray-700">{statusConfig.label}</p>
                              </div>
                              <p className="mt-2 text-sm text-gray-600">
                                Last updated: {formatDate(disputeById.resolvedAtUtc || disputeById.raisedAtUtc)}
                              </p>
                            </div>
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

export default BillingDisputeDetailsPage
