"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Calendar, Clock, FileText, Flag, MapPin, Users, Zap } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentOutage, fetchOutageById } from "lib/redux/outageSlice"
import { fetchFeederById } from "lib/redux/feedersSlice"
import { fetchDistributionSubstationById } from "lib/redux/distributionSubstationsSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// LoadingSkeleton component for outage details
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-gray-100">
    <DashboardNav />
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-9 overflow-hidden rounded-md bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div>
            <div className="mb-2 h-8 w-48 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </div>
            <div className="h-4 w-32 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            />
          </div>
          <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Column Skeleton */}
        <div className="w-[30%] space-y-6">
          {/* Status Card Skeleton */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="mb-1 h-4 w-24 rounded bg-gray-200"></div>
                    <div className="h-3 w-16 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Card Skeleton */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 w-full rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-6 h-6 w-48 overflow-hidden rounded bg-gray-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: item * 0.1,
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  {[1, 2, 3].map((subItem) => (
                    <div key={subItem} className="space-y-2">
                      <div className="h-4 w-32 overflow-hidden rounded bg-gray-200">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1,
                          }}
                        />
                      </div>
                      <div className="h-6 w-40 overflow-hidden rounded bg-gray-200">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1 + 0.05,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((subItem) => (
                    <div key={subItem} className="space-y-2">
                      <div className="h-4 w-32 overflow-hidden rounded bg-gray-200">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1 + 0.15,
                          }}
                        />
                      </div>
                      <div className="h-6 w-40 overflow-hidden rounded bg-gray-200">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1 + 0.2,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Customer Report Card Component
const CustomerReportCard = ({ report }: { report: any }) => {
  const getReasonLabel = (reason: number) => {
    const reasons = {
      0: "No Power",
      1: "Voltage Fluctuation",
      2: "Equipment Damage",
      3: "Safety Concern",
      4: "Other",
    }
    return reasons[reason as keyof typeof reasons] || "Unknown Reason"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
              <Users className="size-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{report.customerName}</h4>
              <p className="text-sm text-gray-600">Customer ID: {report.customerId}</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Reason:</span>
              <span className="font-medium text-gray-900">{getReasonLabel(report.reason)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Reported:</span>
              <span className="font-medium text-gray-900">{formatDate(report.reportedAt)}</span>
            </div>
            {report.additionalNotes && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Additional Notes:</p>
                <p className="text-sm text-gray-800">{report.additionalNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
const getStatusConfig = (status: number) => {
  const configs = {
    1: {
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      label: "REPORTED",
      icon: <FileText className="size-4" />,
    },
    2: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: "INVESTIGATING",
      icon: <AlertCircle className="size-4" />,
    },
    3: {
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      label: "REPAIRING",
      icon: <Zap className="size-4" />,
    },
    4: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      label: "RESTORED",
      icon: <Clock className="size-4" />,
    },
    5: {
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
      label: "CANCELLED",
      icon: <Flag className="size-4" />,
    },
  }
  return configs[status as keyof typeof configs] || configs[1]
}

const getPriorityConfig = (priority: number) => {
  const configs = {
    1: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      label: "LOW",
    },
    2: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: "MEDIUM",
    },
    3: {
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      label: "HIGH",
    },
    4: {
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "CRITICAL",
    },
  }
  return configs[priority as keyof typeof configs] || configs[2]
}

const getScopeConfig = (scope: number) => {
  const configs = {
    1: { label: "INDIVIDUAL CUSTOMER", description: "Affecting a single customer" },
    2: { label: "AREA/FEEDER", description: "Affecting multiple customers in an area" },
  }
  return configs[scope as keyof typeof configs] || configs[2]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatDuration = (hours: number) => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`
  }
  return `${hours.toFixed(1)} hour${hours !== 1 ? "s" : ""}`
}

const OutageDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const outageId = params.id as string

  // Get outage details from Redux store
  const { currentOutage, currentOutageLoading, currentOutageError } = useAppSelector((state) => state.outages)

  const { currentFeeder } = useAppSelector((state) => state.feeders)
  const { currentDistributionSubstation } = useAppSelector((state) => state.distributionSubstations)

  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (outageId) {
      const id = parseInt(outageId)
      if (!isNaN(id)) {
        dispatch(fetchOutageById(id))
      }
    }

    // Cleanup function to clear outage details when component unmounts
    return () => {
      dispatch(clearCurrentOutage())
    }
  }, [dispatch, outageId])

  useEffect(() => {
    if (!currentOutage) return

    const { distributionSubstationId, feederId } = currentOutage

    if (distributionSubstationId) {
      dispatch(fetchDistributionSubstationById(distributionSubstationId))
    }

    if (feederId) {
      dispatch(fetchFeederById(feederId))
    }
  }, [dispatch, currentOutage])

  const exportToPDF = async () => {
    if (!currentOutage) return

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
      doc.text("OUTAGE REPORT", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Outage Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Outage Basic Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("OUTAGE BASIC INFORMATION", 14, yPosition)
      yPosition += 10

      // Basic information table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Outage Title", currentOutage.title],
          ["Reference Code", currentOutage.referenceCode],
          ["Status", getStatusConfig(currentOutage.status).label],
          ["Priority", getPriorityConfig(currentOutage.priority).label],
          ["Scope", getScopeConfig(currentOutage.scope).label],
          ["Distribution Substation", currentOutage.distributionSubstationName || "Not specified"],
          ["Feeder", currentOutage.feederName || "Not specified"],
          ["Customer Generated", currentOutage.isCustomerGenerated ? "Yes" : "No"],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Outage Details Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("OUTAGE DETAILS", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Details", currentOutage.details],
          ["Resolution Summary", currentOutage.resolutionSummary || "Not resolved yet"],
          ["Reported At", formatDate(currentOutage.reportedAt)],
          ["Restored At", currentOutage.restoredAt ? formatDate(currentOutage.restoredAt) : "Not restored"],
          ["Duration", formatDuration(currentOutage.durationHours)],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Impact Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("IMPACT INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Affected Customers", currentOutage.affectedCustomerCount.toString()],
          ["Customer Reports", currentOutage.customerReportCount.toString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Customer Reports Section
      if (currentOutage.customerReports && currentOutage.customerReports.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("CUSTOMER REPORTS", 14, yPosition)
        yPosition += 10

        const customerReportsBody = currentOutage.customerReports.map((report) => [
          report.customerName,
          report.customerId.toString(),
          report.reasonLabel,
          formatDate(report.reportedAt),
          report.additionalNotes || "No additional notes",
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [["Customer Name", "Customer ID", "Reason", "Reported At", "Additional Notes"]],
          body: customerReportsBody,
          theme: "grid",
          headStyles: { fillColor: [245, 158, 11], textColor: 255 },
          styles: { fontSize: 8 },
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
      doc.save(`outage-${currentOutage.referenceCode}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (currentOutageLoading) {
    return <LoadingSkeleton />
  }

  if (currentOutageError || !currentOutage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentOutageError ? "Error Loading Outage" : "Outage Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">{currentOutageError || "The outage you're looking for doesn't exist."}</p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Outages
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(currentOutage.status)
  const priorityConfig = getPriorityConfig(currentOutage.priority)
  const scopeConfig = getScopeConfig(currentOutage.scope)

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
                      className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-[#f9f9f9] text-gray-700 hover:bg-[#f9f9f9]"
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
                      <h1 className="text-2xl font-bold text-gray-900">Outage Details</h1>
                      <p className="text-gray-600">Complete overview and tracking</p>
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
                      <FileText className="size-4" />
                      {isExporting ? "Exporting..." : "Export PDF"}
                    </ButtonModule>

                    <ButtonModule
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => router.push(`/outages/update-outage/${currentOutage.id}`)}
                    >
                      <AlertCircle className="size-4" />
                      Update Status
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-16 py-8">
              <div className="flex w-full gap-6">
                {/* Left Column - Status & Quick Info */}
                <div className="flex w-[30%] flex-col space-y-6 xl:col-span-1">
                  {/* Status Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Flag className="size-5" />
                      Outage Status
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 items-center justify-center rounded-full ${statusConfig.bg}`}>
                          {statusConfig.icon}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Status</p>
                          <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 items-center justify-center rounded-full ${priorityConfig.bg}`}>
                          <Flag className={`size-5 ${priorityConfig.color}`} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Priority</p>
                          <p className={`font-semibold ${priorityConfig.color}`}>{priorityConfig.label}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
                          <Users className="size-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Scope</p>
                          <p className="font-semibold text-purple-600">{scopeConfig.label}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
                          <Calendar className="size-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">{formatDuration(currentOutage.durationHours)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Impact Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Users className="size-5" />
                      Impact Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="text-2xl font-bold text-blue-600">{currentOutage.affectedCustomerCount}</div>
                        <div className="text-sm text-blue-600">Affected Customers</div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-4">
                        <div className="text-2xl font-bold text-green-600">{currentOutage.customerReportCount}</div>
                        <div className="text-sm text-green-600">Customer Reports</div>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-4">
                        <div className="text-sm font-medium text-amber-600">
                          {currentOutage.isCustomerGenerated ? "Customer Reported" : "System Detected"}
                        </div>
                        <div className="text-xs text-amber-600">Report Source</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Location Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <MapPin className="size-5" />
                      Location Details
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">
                          {currentOutage.distributionSubstationName || "Not specified"}
                        </div>
                        <div className="text-sm text-gray-600">Distribution Station</div>
                      </div>
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">{currentOutage.feederName || "Not specified"}</div>
                        <div className="text-sm text-gray-600">Feeder</div>
                      </div>
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="text-sm text-gray-600">{scopeConfig.description}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:col-span-2">
                  {/* Basic Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <FileText className="size-5" />
                      Outage Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Outage Title</label>
                          <p className="font-semibold text-gray-900">{currentOutage.title}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Reference Code</label>
                          <p className="font-semibold text-gray-900">{currentOutage.referenceCode}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Reported At</label>
                          <p className="font-semibold text-gray-900">{formatDate(currentOutage.reportedAt)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Distribution Station</label>
                          <p className="font-semibold text-gray-900">
                            {currentDistributionSubstation
                              ? `${currentDistributionSubstation.dssCode} (${currentDistributionSubstation.nercCode})`
                              : currentOutage.distributionSubstationId}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Feeder</label>
                          <p className="font-semibold text-gray-900">
                            {currentFeeder
                              ? `${currentFeeder.name} (${currentFeeder.nercCode}) - ${currentFeeder.injectionSubstation.injectionSubstationCode}`
                              : currentOutage.feederId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Outage Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <AlertCircle className="size-5" />
                      Outage Details
                    </h3>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Details</label>
                        <p className="mt-2 text-gray-900">{currentOutage.details}</p>
                      </div>
                      {currentOutage.resolutionSummary && (
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Resolution Summary</label>
                          <p className="mt-2 text-gray-900">{currentOutage.resolutionSummary}</p>
                        </div>
                      )}
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
                      <Clock className="size-5" />
                      Timeline
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Calendar className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Reported</label>
                            <p className="font-semibold text-gray-900">{formatDate(currentOutage.reportedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100">
                            <Clock className="size-5 text-amber-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Duration</label>
                            <p className="font-semibold text-gray-900">{formatDuration(currentOutage.durationHours)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {currentOutage.restoredAt && (
                          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                              <Zap className="size-5 text-green-600" />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Restored At</label>
                              <p className="font-semibold text-gray-900">{formatDate(currentOutage.restoredAt)}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <Users className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Report Source</label>
                            <p className="font-semibold text-gray-900">
                              {currentOutage.isCustomerGenerated ? "Customer" : "System"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Customer Reports Section */}
                  {currentOutage.customerReports && currentOutage.customerReports.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Users className="size-5" />
                        Customer Reports ({currentOutage.customerReports.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {currentOutage.customerReports.map((report) => (
                          <CustomerReportCard key={report.id} report={report} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* No Customer Reports Message */}
                  {(!currentOutage.customerReports || currentOutage.customerReports.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="py-8 text-center">
                        <Users className="mx-auto mb-4 size-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">No Customer Reports</h3>
                        <p className="text-gray-600">No customer reports have been submitted for this outage yet.</p>
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

export default OutageDetailsPage
