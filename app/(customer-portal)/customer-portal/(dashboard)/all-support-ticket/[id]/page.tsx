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
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Shield,
  User,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearTicketDetailStatus, getTicketDetail } from "lib/redux/customersDashboardSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { UserOutlineIcon } from "components/Icons/Icons"
import { format } from "date-fns"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"

// Status badge configuration
const getStatusConfig = (status: string) => {
  const configs = {
    Open: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: Clock,
      label: "OPEN",
    },
    "In Progress": {
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: RefreshCw,
      label: "IN PROGRESS",
    },
    Closed: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: CheckCircle,
      label: "CLOSED",
    },
    Pending: {
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: Clock,
      label: "PENDING",
    },
  }
  return configs[status as keyof typeof configs] || configs.Open
}

const SupportTicketDetails = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const ticketId = params.id as string

  // Get ticket details from Redux store
  const { ticketDetailData, isLoadingTicketDetail, ticketDetailError, ticketDetailSuccess } = useAppSelector(
    (state) => state.customersDashboard
  )

  const [isExporting, setIsExporting] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  useEffect(() => {
    if (ticketId) {
      const id = parseInt(ticketId)
      if (!isNaN(id)) {
        dispatch(getTicketDetail({ id }))
      }
    }

    // Cleanup function to clear ticket details when component unmounts
    return () => {
      dispatch(clearTicketDetailStatus())
    }
  }, [dispatch, ticketId])

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
    if (ticketId) {
      const id = parseInt(ticketId)
      if (!isNaN(id)) {
        dispatch(getTicketDetail({ id }))
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
    if (!ticketDetailData) return

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
      doc.text("SUPPORT TICKET DETAILS", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Ticket Information Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Ticket Summary Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("TICKET SUMMARY", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Ticket Reference", ticketDetailData.reference],
          ["Title", ticketDetailData.title],
          ["Status", ticketDetailData.status],
          ["Category", ticketDetailData.categoryName],
          ["Customer Name", ticketDetailData.customerName],
          ["Account Number", ticketDetailData.customerAccountNumber],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Timeline Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("TIMELINE", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Created At", formatDate(ticketDetailData.createdAtUtc)],
          ["Last Message At", formatDate(ticketDetailData.lastMessageAtUtc)],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Messages Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("MESSAGES", 14, yPosition)
      yPosition += 10

      if (ticketDetailData.messages && ticketDetailData.messages.length > 0) {
        const messagesBody = ticketDetailData.messages.map((message, index) => [
          `${index + 1}. ${message.senderName}`,
          `${message.senderType} - ${formatDate(message.sentAtUtc)}`,
          message.message,
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [["Sender", "Time", "Message"]],
          body: messagesBody,
          theme: "grid",
          headStyles: { fillColor: [139, 92, 246], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 50 },
            2: { cellWidth: "auto" },
          },
        })
      } else {
        autoTable(doc, {
          startY: yPosition,
          head: [["Field", "Details"]],
          body: [["Messages", "No messages found"]],
          theme: "grid",
          headStyles: { fillColor: [139, 92, 246], textColor: 255 },
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
      doc.save(`ticket-${ticketDetailData.reference}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoadingTicketDetail) {
    return <LoadingSkeleton />
  }

  if (ticketDetailError || !ticketDetailData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-gray-400 sm:size-16" />
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {ticketDetailError ? "Error Loading Ticket" : "Ticket Not Found"}
          </h1>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            {ticketDetailError || "The support ticket you're looking for doesn't exist."}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonModule variant="outline" onClick={() => router.back()}>
              Back to Tickets
            </ButtonModule>
            <ButtonModule variant="primary" onClick={handleRefresh}>
              Try Again
            </ButtonModule>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(ticketDetailData.status)
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
                      <h1 className="text-lg font-bold text-gray-900 sm:text-xl xl:text-2xl">Ticket Details</h1>
                      <p className="text-xs text-gray-600 sm:text-sm">Complete overview and messages</p>
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
                {/* Left Column - Ticket Summary & Quick Info */}
                <div className="flex w-full flex-col space-y-6 xl:w-[35%]">
                  {/* Ticket Summary Card */}
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

                      <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">{ticketDetailData.title}</h2>
                      <p className="mb-4 text-sm text-gray-600 sm:text-base">Ticket #{ticketDetailData.reference}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color} sm:text-sm`}
                        >
                          {statusConfig.label}
                        </div>
                        <div className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 sm:text-sm">
                          {ticketDetailData.categoryName}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Customer:</span>
                          <span className="font-semibold text-gray-900">{ticketDetailData.customerName}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Account:</span>
                          <span className="font-semibold text-gray-900">{ticketDetailData.customerAccountNumber}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Created:</span>
                          <span className="font-semibold text-gray-900">
                            {formatDate(ticketDetailData.createdAtUtc)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Last Message:</span>
                          <span className="font-semibold text-gray-900">
                            {formatDate(ticketDetailData.lastMessageAtUtc)}
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
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {ticketDetailData.customerName}
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
                            {ticketDetailData.customerAccountNumber}
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
                  {/* Ticket Timeline */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      Ticket Timeline
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Created At</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatDate(ticketDetailData.createdAtUtc)}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Ticket Status</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            <span className={`inline-flex items-center gap-1 ${statusConfig.color}`}>
                              <StatusIcon className="size-4" />
                              {ticketDetailData.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Last Message At</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatDate(ticketDetailData.lastMessageAtUtc)}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Category</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {ticketDetailData.categoryName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Ticket Messages */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <MessageCircle className="size-5" />
                      Ticket Messages
                    </h3>
                    {ticketDetailData.messages && ticketDetailData.messages.length > 0 ? (
                      <div className="space-y-4">
                        {ticketDetailData.messages.map((message, index) => (
                          <div
                            key={message.id}
                            className={`rounded-lg border p-4 ${
                              message.senderType === "Customer"
                                ? "border-blue-200 bg-blue-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex size-8 items-center justify-center rounded-full ${
                                    message.senderType === "Customer" ? "bg-blue-100" : "bg-gray-300"
                                  }`}
                                >
                                  <User className="size-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{message.senderName}</p>
                                  <p className="text-xs text-gray-600">{message.senderType}</p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">{formatDate(message.sentAtUtc)}</p>
                            </div>
                            <p className="whitespace-pre-wrap text-gray-800">{message.message}</p>
                            {message.fileUrls && message.fileUrls.length > 0 && (
                              <div className="mt-3">
                                <p className="mb-2 text-xs font-medium text-gray-600">Attachments:</p>
                                <div className="flex flex-wrap gap-2">
                                  {message.fileUrls.map((url, fileIndex) => (
                                    <button
                                      key={fileIndex}
                                      onClick={() => window.open(url, "_blank")}
                                      className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                                    >
                                      <ExternalLink className="size-3" />
                                      File {fileIndex + 1}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <MessageCircle className="mx-auto mb-4 size-12 text-gray-300" />
                        <p className="text-gray-500">No messages found for this ticket</p>
                      </div>
                    )}
                  </motion.div>
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

export default SupportTicketDetails
