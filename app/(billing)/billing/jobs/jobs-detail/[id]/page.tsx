"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Edit3,
  FileText,
  MapPin,
  Play,
  RefreshCw,
  StopCircle,
  User,
  XCircle,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import {
  CalendarOutlineIcon,
  CycleIcon,
  ExportCsvIcon,
  ExportOutlineIcon,
  MapOutlineIcon,
  StatusIcon,
  UserRoleIcon,
} from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentBillingJob, fetchBillingJobById, BillingJob as ReduxBillingJob } from "lib/redux/postpaidSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
    <DashboardNav />
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-md bg-gray-200"></div>
          <div>
            <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Column Skeleton */}
        <div className="w-[30%] space-y-6">
          {/* Profile Card Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-gray-200"></div>
                <div className="absolute -right-1 bottom-1 h-6 w-6 rounded-full bg-gray-200"></div>
              </div>
              <div className="mx-auto mb-2 h-6 w-32 rounded bg-gray-200"></div>
              <div className="mx-auto mb-4 h-4 w-24 rounded bg-gray-200"></div>
              <div className="mb-6 flex justify-center gap-2">
                <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                <div className="h-6 w-20 rounded-full bg-gray-200"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-10 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 h-6 w-48 rounded bg-gray-200"></div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

const BillingJobDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const jobId = params.id as string

  // Get billing job details from Redux store
  const { currentBillingJob, currentBillingJobLoading, currentBillingJobError } = useAppSelector(
    (state) => state.postpaidBilling
  )

  const [isExporting, setIsExporting] = useState(false)
  const [activeAction, setActiveAction] = useState<"restart" | "cancel" | "download" | null>(null)

  useEffect(() => {
    if (jobId) {
      const id = parseInt(jobId)
      if (!isNaN(id)) {
        dispatch(fetchBillingJobById(id))
      }
    }

    // Cleanup function to clear billing job details when component unmounts
    return () => {
      dispatch(clearCurrentBillingJob())
    }
  }, [dispatch, jobId])

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
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: RefreshCw,
        label: "RUNNING",
      },
      2: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle,
        label: "COMPLETED",
      },
      3: {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: XCircle,
        label: "FAILED",
      },
      4: {
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
        icon: StopCircle,
        label: "CANCELLED",
      },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const calculateProgress = () => {
    if (!currentBillingJob || currentBillingJob.totalCustomers === 0) return 0
    return Math.round((currentBillingJob.processedCustomers / currentBillingJob.totalCustomers) * 100)
  }

  const getDuration = () => {
    if (!currentBillingJob || !currentBillingJob.startedAtUtc) return "N/A"

    const start = new Date(currentBillingJob.startedAtUtc)
    const end = currentBillingJob.completedAtUtc ? new Date(currentBillingJob.completedAtUtc) : new Date()

    const durationMs = end.getTime() - start.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  const formatDate = (dateString?: string) => {
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

  const formatNumber = (num: number) => {
    return num?.toLocaleString() || "0"
  }

  const exportToPDF = async () => {
    if (!currentBillingJob) return

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
      doc.text("BILLING JOB REPORT", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Billing Job Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Job Overview Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("JOB OVERVIEW", 14, yPosition)
      yPosition += 10

      const statusConfig = getStatusConfig(currentBillingJob.status)
      const progress = calculateProgress()

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Job ID", currentBillingJob.id.toString()],
          ["Period", currentBillingJob.period],
          ["Area Office", currentBillingJob.areaOfficeName],
          ["Status", statusConfig.label],
          ["Progress", `${progress}%`],
          ["Duration", getDuration()],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Processing Statistics Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("PROCESSING STATISTICS", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Metric", "Count"]],
        body: [
          ["Total Customers", formatNumber(currentBillingJob.totalCustomers)],
          ["Processed Customers", formatNumber(currentBillingJob.processedCustomers)],
          ["Drafted Bills", formatNumber(currentBillingJob.draftedCount)],
          ["Finalized Bills", formatNumber(currentBillingJob.finalizedCount)],
          ["Skipped Customers", formatNumber(currentBillingJob.skippedCount)],
          [
            "Success Rate",
            `${
              currentBillingJob.totalCustomers > 0
                ? Math.round((currentBillingJob.processedCustomers / currentBillingJob.totalCustomers) * 100)
                : 0
            }%`,
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Timeline Information
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("TIMELINE INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Event", "Timestamp"]],
        body: [
          ["Requested At", formatDate(currentBillingJob.requestedAtUtc)],
          ["Started At", formatDate(currentBillingJob.startedAtUtc)],
          ["Completed At", formatDate(currentBillingJob.completedAtUtc)],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Request Information
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("REQUEST INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Requested By", currentBillingJob.requestedByName],
          ["Requested By User ID", currentBillingJob.requestedByUserId.toString()],
          ...(currentBillingJob.lastError ? [["Last Error", currentBillingJob.lastError]] : []),
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
      doc.save(`billing-job-${currentBillingJob.id}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleRestartJob = () => {
    if (!currentBillingJob) return
    console.log("Restarting job:", currentBillingJob.id)
    setActiveAction("restart")
    // TODO: Implement actual restart logic
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleCancelJob = () => {
    if (!currentBillingJob) return
    console.log("Canceling job:", currentBillingJob.id)
    setActiveAction("cancel")
    // TODO: Implement actual cancel logic
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleDownloadOutput = () => {
    if (!currentBillingJob) return
    console.log("Downloading output for job:", currentBillingJob.id)
    setActiveAction("download")
    // TODO: Implement actual download logic
    setTimeout(() => setActiveAction(null), 2000)
  }

  if (currentBillingJobLoading) {
    return <LoadingSkeleton />
  }

  if (currentBillingJobError || !currentBillingJob) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentBillingJobError ? "Error Loading Job" : "Job Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">
            {currentBillingJobError || "The billing job you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Billing Jobs
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(currentBillingJob.status)
  const StatusIcon = statusConfig.icon
  const progress = calculateProgress()
  const duration = getDuration()

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-16 py-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      type="button"
                      onClick={() => router.back()}
                      className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      aria-label="Go back"
                      title="Go back"
                    >
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="new-arrow-right rotate-180 transform"
                      >
                        <path
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </motion.button>

                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Billing Job Details</h1>
                      <p className="text-gray-600">Complete overview and management</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={exportToPDF}
                      disabled={isExporting}
                    >
                      <ExportOutlineIcon className="size-4" />
                      {isExporting ? "Exporting..." : "Export PDF"}
                    </ButtonModule>

                    {currentBillingJob.status === 1 && (
                      <ButtonModule
                        variant="danger"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleCancelJob}
                        disabled={activeAction === "cancel"}
                      >
                        <StopCircle className="size-4" />
                        {activeAction === "cancel" ? "Canceling..." : "Cancel Job"}
                      </ButtonModule>
                    )}

                    {(currentBillingJob.status === 0 ||
                      currentBillingJob.status === 3 ||
                      currentBillingJob.status === 4) && (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleRestartJob}
                        disabled={activeAction === "restart"}
                      >
                        <Play className="size-4" />
                        {activeAction === "restart" ? "Restarting..." : "Restart Job"}
                      </ButtonModule>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-16 py-8">
              <div className="flex w-full gap-6">
                {/* Left Column - Job Overview & Quick Actions */}
                <div className="flex w-[30%] flex-col space-y-6 xl:col-span-1">
                  {/* Job Overview Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                          <CycleIcon />
                        </div>
                        <div
                          className={`absolute -right-1 bottom-1 ${statusConfig.bg} ${statusConfig.border} rounded-full border-2 p-1.5`}
                        >
                          <StatusIcon className={`size-4 ${statusConfig.color}`} />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">Billing Job #{currentBillingJob.id}</h2>
                      <p className="mb-4 text-gray-600">{currentBillingJob.period}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </div>
                        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
                          {currentBillingJob.areaOfficeName}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="mb-1 flex justify-between text-sm text-gray-600">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              progress === 100 ? "bg-emerald-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {formatNumber(currentBillingJob.processedCustomers)} of{" "}
                          {formatNumber(currentBillingJob.totalCustomers)} customers
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <CalendarOutlineIcon />
                          {formatDate(currentBillingJob.requestedAtUtc)}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Clock className="size-4" />
                          {duration}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <User className="size-4" />
                          {currentBillingJob.requestedByName}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <RefreshCw className="size-4" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      {(currentBillingJob.status === 0 ||
                        currentBillingJob.status === 3 ||
                        currentBillingJob.status === 4) && (
                        <ButtonModule
                          variant="primary"
                          className="w-full justify-start gap-3"
                          onClick={handleRestartJob}
                          disabled={activeAction === "restart"}
                        >
                          <Play className="size-4" />
                          {activeAction === "restart" ? "Restarting..." : "Restart Job"}
                        </ButtonModule>
                      )}

                      {currentBillingJob.status === 1 && (
                        <ButtonModule
                          variant="danger"
                          className="w-full justify-start gap-3"
                          onClick={handleCancelJob}
                          disabled={activeAction === "cancel"}
                        >
                          <StopCircle className="size-4" />
                          {activeAction === "cancel" ? "Canceling..." : "Cancel Job"}
                        </ButtonModule>
                      )}

                      {currentBillingJob.status === 2 && (
                        <ButtonModule
                          variant="secondary"
                          className="w-full justify-start gap-3"
                          onClick={handleDownloadOutput}
                          disabled={activeAction === "download"}
                        >
                          <Download className="size-4" />
                          {activeAction === "download" ? "Downloading..." : "Download Output"}
                        </ButtonModule>
                      )}

                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-start gap-3"
                        onClick={exportToPDF}
                        disabled={isExporting}
                      >
                        <FileText className="size-4" />
                        {isExporting ? "Exporting..." : "Export Report"}
                      </ButtonModule>
                    </div>
                  </motion.div>

                  {/* Statistics Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <UserRoleIcon />
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Drafted Bills:</span>
                        <span className="font-semibold">{formatNumber(currentBillingJob.draftedCount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Finalized Bills:</span>
                        <span className="font-semibold">{formatNumber(currentBillingJob.finalizedCount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Skipped:</span>
                        <span className="font-semibold">{formatNumber(currentBillingJob.skippedCount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Success Rate:</span>
                        <span className="font-semibold">
                          {currentBillingJob.totalCustomers > 0
                            ? `${Math.round(
                                (currentBillingJob.processedCustomers / currentBillingJob.totalCustomers) * 100
                              )}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:col-span-2">
                  {/* Job Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <CycleIcon />
                      Job Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Job ID</label>
                          <p className="font-semibold text-gray-900">{currentBillingJob.id}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Period</label>
                          <p className="font-semibold text-gray-900">{currentBillingJob.period}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Area Office ID</label>
                          <p className="font-semibold text-gray-900">{currentBillingJob.areaOfficeId}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <p className="font-semibold text-gray-900">
                            <span className={`inline-flex items-center gap-1 ${statusConfig.color}`}>
                              <StatusIcon className="size-4" />
                              {statusConfig.label}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Progress</label>
                          <p className="font-semibold text-gray-900">{progress}%</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Duration</label>
                          <p className="font-semibold text-gray-900">{duration}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Total Customers</label>
                          <p className="font-semibold text-gray-900">
                            {formatNumber(currentBillingJob.totalCustomers)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Processed Customers</label>
                          <p className="font-semibold text-gray-900">
                            {formatNumber(currentBillingJob.processedCustomers)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Completion Rate</label>
                          <p className="font-semibold text-gray-900">
                            {currentBillingJob.totalCustomers > 0
                              ? `${Math.round(
                                  (currentBillingJob.processedCustomers / currentBillingJob.totalCustomers) * 100
                                )}%`
                              : "0%"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Processing Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <RefreshCw className="size-5" />
                      Processing Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <FileText className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Drafted Bills</label>
                            <p className="font-semibold text-gray-900">
                              {formatNumber(currentBillingJob.draftedCount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <CheckCircle className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Finalized Bills</label>
                            <p className="font-semibold text-gray-900">
                              {formatNumber(currentBillingJob.finalizedCount)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100">
                            <AlertCircle className="size-5 text-amber-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Skipped Customers</label>
                            <p className="font-semibold text-gray-900">
                              {formatNumber(currentBillingJob.skippedCount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <User className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Remaining Customers</label>
                            <p className="font-semibold text-gray-900">
                              {formatNumber(currentBillingJob.totalCustomers - currentBillingJob.processedCustomers)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Timeline Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <CalendarOutlineIcon />
                      Timeline Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Requested At</label>
                          <p className="font-semibold text-gray-900">{formatDate(currentBillingJob.requestedAtUtc)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Started At</label>
                          <p className="font-semibold text-gray-900">{formatDate(currentBillingJob.startedAtUtc)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Completed At</label>
                          <p className="font-semibold text-gray-900">{formatDate(currentBillingJob.completedAtUtc)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Request Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <User className="size-5" />
                      Request Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Requested By</label>
                          <p className="font-semibold text-gray-900">{currentBillingJob.requestedByName}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <label className="text-sm font-medium text-gray-600">Area Office</label>
                          <p className="font-semibold text-gray-900">{currentBillingJob.areaOfficeName}</p>
                        </div>
                        {currentBillingJob.lastError && (
                          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                            <label className="text-sm font-medium text-red-600">Last Error</label>
                            <p className="font-semibold text-red-900">{currentBillingJob.lastError}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Progress Visualization */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <RefreshCw className="size-5" />
                      Progress Visualization
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Processing Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-4 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-4 rounded-full transition-all duration-1000 ${
                            progress === 100 ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="rounded-lg bg-blue-50 p-3">
                          <div className="text-sm font-medium text-blue-600">Total</div>
                          <div className="text-lg font-bold text-blue-900">
                            {formatNumber(currentBillingJob.totalCustomers)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3">
                          <div className="text-sm font-medium text-green-600">Processed</div>
                          <div className="text-lg font-bold text-green-900">
                            {formatNumber(currentBillingJob.processedCustomers)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-3">
                          <div className="text-sm font-medium text-amber-600">Skipped</div>
                          <div className="text-lg font-bold text-amber-900">
                            {formatNumber(currentBillingJob.skippedCount)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3">
                          <div className="text-sm font-medium text-gray-600">Remaining</div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatNumber(currentBillingJob.totalCustomers - currentBillingJob.processedCustomers)}
                          </div>
                        </div>
                      </div>
                    </div>
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

export default BillingJobDetailsPage
