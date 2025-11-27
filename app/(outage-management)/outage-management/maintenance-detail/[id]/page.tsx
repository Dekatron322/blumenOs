"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Calendar, Clock, FileText, Flag, MapPin, Users, Zap, Wrench, Shield, Bell } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentMaintenance, fetchMaintenanceById } from "lib/redux/maintenanceSlice"
import { fetchFeederById } from "lib/redux/feedersSlice"
import { fetchDistributionSubstationById } from "lib/redux/distributionSubstationsSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// LoadingSkeleton component for maintenance details
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-gray-100">
    <DashboardNav />
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 overflow-hidden rounded-md bg-gray-200">
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
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
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

// Helper functions
const getStatusConfig = (status: number) => {
  const configs = {
    1: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: "SCHEDULED",
      icon: <Calendar className="size-4" />,
    },
    2: {
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      label: "IN PROGRESS",
      icon: <Wrench className="size-4" />,
    },
    3: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      label: "COMPLETED",
      icon: <Shield className="size-4" />,
    },
    4: {
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
      label: "CANCELLED",
      icon: <Flag className="size-4" />,
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

const getTypeConfig = (type: number) => {
  const configs = {
    1: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      label: "PREVENTIVE",
      icon: <Shield className="size-4" />,
    },
    2: {
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "CORRECTIVE",
      icon: <Wrench className="size-4" />,
    },
    3: {
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      label: "EMERGENCY",
      icon: <AlertCircle className="size-4" />,
    },
  }
  return configs[type as keyof typeof configs] || configs[1]
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
    1: { label: "LOCAL", description: "Affecting local equipment and customers" },
    2: { label: "REGIONAL", description: "Affecting multiple areas and customers" },
  }
  return configs[scope as keyof typeof configs] || configs[1]
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
  if (hours === Math.floor(hours)) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`
  }
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return `${wholeHours}h ${minutes}m`
}

const MaintenanceDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const maintenanceId = params.id as string

  // Get maintenance details from Redux store
  const { currentMaintenance, currentMaintenanceLoading, currentMaintenanceError } = useAppSelector(
    (state) => state.maintenances
  )

  const { currentFeeder } = useAppSelector((state) => state.feeders)
  const { currentDistributionSubstation } = useAppSelector((state) => state.distributionSubstations)

  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (maintenanceId) {
      const id = parseInt(maintenanceId)
      if (!isNaN(id)) {
        dispatch(fetchMaintenanceById(id))
      }
    }

    // Cleanup function to clear maintenance details when component unmounts
    return () => {
      dispatch(clearCurrentMaintenance())
    }
  }, [dispatch, maintenanceId])

  useEffect(() => {
    if (!currentMaintenance) return

    const { distributionSubstationId, feederId } = currentMaintenance

    if (distributionSubstationId) {
      dispatch(fetchDistributionSubstationById(distributionSubstationId))
    }

    if (feederId) {
      dispatch(fetchFeederById(feederId))
    }
  }, [dispatch, currentMaintenance])

  const exportToPDF = async () => {
    if (!currentMaintenance) return

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
      doc.text("MAINTENANCE REPORT", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Maintenance Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Maintenance Basic Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("MAINTENANCE BASIC INFORMATION", 14, yPosition)
      yPosition += 10

      // Basic information table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Maintenance Title", currentMaintenance.title],
          ["Reference Code", currentMaintenance.referenceCode],
          ["Status", getStatusConfig(currentMaintenance.status).label],
          ["Type", getTypeConfig(currentMaintenance.type).label],
          ["Priority", getPriorityConfig(currentMaintenance.priority).label],
          ["Scope", getScopeConfig(currentMaintenance.scope).label],
          ["Distribution Substation", currentMaintenance.distributionSubstationName || "Not specified"],
          ["Feeder", currentMaintenance.feederName || "Not specified"],
          ["Requires Shutdown", currentMaintenance.requiresShutdown ? "Yes" : "No"],
          ["Customer Notified", currentMaintenance.customerNotified ? "Yes" : "No"],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Maintenance Details Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("MAINTENANCE DETAILS", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Details", currentMaintenance.details],
          ["Resolution Summary", currentMaintenance.resolutionSummary || "Not completed yet"],
          ["Scheduled Start", formatDate(currentMaintenance.scheduledStartAt)],
          ["Scheduled End", formatDate(currentMaintenance.scheduledEndAt)],
          [
            "Actual Start",
            currentMaintenance.actualStartAt ? formatDate(currentMaintenance.actualStartAt) : "Not started",
          ],
          [
            "Completed At",
            currentMaintenance.completedAt ? formatDate(currentMaintenance.completedAt) : "Not completed",
          ],
          ["Duration", formatDuration(currentMaintenance.durationHours)],
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
        body: [["Affected Customers", currentMaintenance.affectedCustomerCount.toString()]],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
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
      doc.save(`maintenance-${currentMaintenance.referenceCode}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (currentMaintenanceLoading) {
    return <LoadingSkeleton />
  }

  if (currentMaintenanceError || !currentMaintenance) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentMaintenanceError ? "Error Loading Maintenance" : "Maintenance Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">
            {currentMaintenanceError || "The maintenance you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Maintenance
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(currentMaintenance.status)
  const typeConfig = getTypeConfig(currentMaintenance.type)
  const priorityConfig = getPriorityConfig(currentMaintenance.priority)
  const scopeConfig = getScopeConfig(currentMaintenance.scope)

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
                      <h1 className="text-2xl font-bold text-gray-900">Maintenance Details</h1>
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
                      onClick={() => router.push(`/outage-management/update-maintenance/${currentMaintenance.id}`)}
                    >
                      <Wrench className="size-4" />
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
                      Maintenance Status
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
                        <div className={`flex size-10 items-center justify-center rounded-full ${typeConfig.bg}`}>
                          {typeConfig.icon}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Type</p>
                          <p className={`font-semibold ${typeConfig.color}`}>{typeConfig.label}</p>
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
                        <div className="text-2xl font-bold text-blue-600">
                          {currentMaintenance.affectedCustomerCount}
                        </div>
                        <div className="text-sm text-blue-600">Affected Customers</div>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-4">
                        <div className="text-sm font-medium text-amber-600">
                          {currentMaintenance.requiresShutdown ? "Shutdown Required" : "No Shutdown Required"}
                        </div>
                        <div className="text-xs text-amber-600">Power Impact</div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-4">
                        <div className="text-sm font-medium text-green-600">
                          {currentMaintenance.customerNotified ? "Customers Notified" : "Customers Not Notified"}
                        </div>
                        <div className="text-xs text-green-600">Notification Status</div>
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
                          {currentMaintenance.distributionSubstationName || "Not specified"}
                        </div>
                        <div className="text-sm text-gray-600">Distribution Substation</div>
                      </div>
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">
                          {currentMaintenance.feederName || "Not specified"}
                        </div>
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
                      Maintenance Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Maintenance Title</label>
                          <p className="font-semibold text-gray-900">{currentMaintenance.title}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Reference Code</label>
                          <p className="font-semibold text-gray-900">{currentMaintenance.referenceCode}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Scheduled Start</label>
                          <p className="font-semibold text-gray-900">
                            {formatDate(currentMaintenance.scheduledStartAt)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Scheduled End</label>
                          <p className="font-semibold text-gray-900">{formatDate(currentMaintenance.scheduledEndAt)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Distribution Substation</label>
                          <p className="font-semibold text-gray-900">
                            {currentDistributionSubstation
                              ? `${currentDistributionSubstation.dssCode} (${currentDistributionSubstation.nercCode})`
                              : currentMaintenance.distributionSubstationId}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Feeder</label>
                          <p className="font-semibold text-gray-900">
                            {currentFeeder
                              ? `${currentFeeder.name} (${currentFeeder.nercCode}) - ${currentFeeder.injectionSubstation.injectionSubstationCode}`
                              : currentMaintenance.feederId}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Requires Shutdown</label>
                          <p className="font-semibold text-gray-900">
                            {currentMaintenance.requiresShutdown ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Customer Notified</label>
                          <p className="font-semibold text-gray-900">
                            {currentMaintenance.customerNotified ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Maintenance Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Wrench className="size-5" />
                      Maintenance Details
                    </h3>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Details</label>
                        <p className="mt-2 text-gray-900">{currentMaintenance.details}</p>
                      </div>
                      {currentMaintenance.resolutionSummary && (
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Resolution Summary</label>
                          <p className="mt-2 text-gray-900">{currentMaintenance.resolutionSummary}</p>
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
                            <label className="text-sm font-medium text-gray-600">Scheduled Start</label>
                            <p className="font-semibold text-gray-900">
                              {formatDate(currentMaintenance.scheduledStartAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Calendar className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Scheduled End</label>
                            <p className="font-semibold text-gray-900">
                              {formatDate(currentMaintenance.scheduledEndAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {currentMaintenance.actualStartAt && (
                          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100">
                              <Wrench className="size-5 text-orange-600" />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Actual Start</label>
                              <p className="font-semibold text-gray-900">
                                {formatDate(currentMaintenance.actualStartAt)}
                              </p>
                            </div>
                          </div>
                        )}
                        {currentMaintenance.completedAt && (
                          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                              <Shield className="size-5 text-green-600" />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Completed At</label>
                              <p className="font-semibold text-gray-900">
                                {formatDate(currentMaintenance.completedAt)}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <Clock className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Duration</label>
                            <p className="font-semibold text-gray-900">
                              {formatDuration(currentMaintenance.durationHours)}
                            </p>
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

export default MaintenanceDetailsPage
