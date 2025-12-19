"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, BarChart3, Calendar, CheckCircle, FileText, Flag, TrendingUp, User, Zap } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { CalendarOutlineIcon, ExportOutlineIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentMeterReading, fetchMeterReadingById, MeterReading } from "lib/redux/meterReadingSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Image from "next/image"

// LoadingSkeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-gray-100">
    <DashboardNav />
    <div className="container mx-auto p-4 sm:p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="size-8 rounded-md bg-gray-200 sm:size-9"></div>
          <div>
            <div className="mb-2 h-7 w-40 rounded bg-gray-200 sm:h-8 sm:w-48"></div>
            <div className="h-4 w-32 rounded bg-gray-200 sm:w-40"></div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className="h-9 w-20 rounded bg-gray-200 sm:w-24"></div>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Left Column Skeleton */}
        <div className="w-full space-y-6 xl:w-[30%]">
          {/* Overview Card Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto size-16 rounded-full bg-gray-200 sm:size-20"></div>
                <div className="absolute -right-1 bottom-1 size-5 rounded-full bg-gray-200 sm:size-6"></div>
              </div>
              <div className="mx-auto mb-2 h-6 w-32 rounded bg-gray-200 sm:h-7"></div>
              <div className="mx-auto mb-4 h-4 w-24 rounded bg-gray-200"></div>
              <div className="mb-6 flex flex-wrap justify-center gap-2">
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

          {/* Quick Stats Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 sm:h-6"></div>
            <div className="space-y-4">
              <div className="h-16 w-full rounded bg-gray-200 sm:h-20"></div>
              <div className="h-16 w-full rounded bg-gray-200 sm:h-20"></div>
              <div className="h-16 w-full rounded bg-gray-200 sm:h-20"></div>
            </div>
          </div>

          {/* Capture Info Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 sm:h-6"></div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
              <div className="mb-6 h-6 w-40 rounded bg-gray-200 sm:w-48"></div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="h-16 w-full rounded bg-gray-200"></div>
                  <div className="h-16 w-full rounded bg-gray-200"></div>
                  <div className="h-16 w-full rounded bg-gray-200"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-16 w-full rounded bg-gray-200"></div>
                  <div className="h-16 w-full rounded bg-gray-200"></div>
                  <div className="h-16 w-full rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const MeterReadingDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const meterReadingId = params.id as string

  // Get meter reading details from Redux store
  const { currentMeterReading, currentMeterReadingLoading, currentMeterReadingError, currentMeterReadingSuccess } =
    useAppSelector((state) => state.meterReadings)

  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (meterReadingId) {
      const id = parseInt(meterReadingId)
      if (!isNaN(id)) {
        dispatch(fetchMeterReadingById(id))
      }
    }

    // Cleanup function to clear meter reading details when component unmounts
    return () => {
      dispatch(clearCurrentMeterReading())
    }
  }, [dispatch, meterReadingId])

  const getValidationStatusConfig = (status: number) => {
    const configs = {
      0: {
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
        icon: FileText,
        label: "PENDING",
      },
      1: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle,
        label: "VALID",
      },
      2: {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: AlertCircle,
        label: "INVALID",
      },
      3: {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: Flag,
        label: "FLAGGED",
      },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getAnomalyScoreConfig = (score: number) => {
    if (score < 0.3) return { color: "text-emerald-600", bg: "bg-emerald-50", label: "LOW" }
    if (score < 0.7) return { color: "text-amber-600", bg: "bg-amber-50", label: "MEDIUM" }
    return { color: "text-red-600", bg: "bg-red-50", label: "HIGH" }
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat().format(value)
  }

  const calculateConsumption = (meterReading: MeterReading) => {
    return meterReading.presentReadingKwh - meterReading.previousReadingKwh
  }

  const exportToPDF = async () => {
    if (!currentMeterReading) return

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
      doc.text("METER READING RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Meter Reading Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Meter Reading Overview Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("METER READING OVERVIEW", 14, yPosition)
      yPosition += 10

      const consumption = calculateConsumption(currentMeterReading)
      const validationStatusConfig = getValidationStatusConfig(currentMeterReading.validationStatus)
      const anomalyConfig = getAnomalyScoreConfig(currentMeterReading.anomalyScore)

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Reading ID", currentMeterReading.id.toString()],
          ["Customer", `${currentMeterReading.customerName} (${currentMeterReading.customerAccountNumber})`],
          ["Period", currentMeterReading.period],
          ["Validation Status", validationStatusConfig.label],
          ["Anomaly Score", `${(currentMeterReading.anomalyScore * 100).toFixed(1)}% - ${anomalyConfig.label}`],
          ["Flagged for Review", currentMeterReading.isFlaggedForReview ? "Yes" : "No"],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Reading Details Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("READING DETAILS", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Metric", "Value", "Unit"]],
        body: [
          ["Previous Reading", formatNumber(currentMeterReading.previousReadingKwh), "kWh"],
          ["Present Reading", formatNumber(currentMeterReading.presentReadingKwh), "kWh"],
          ["Consumption", formatNumber(consumption), "kWh"],
          ["Valid Consumption", formatNumber(currentMeterReading.validConsumptionKwh), "kWh"],
          ["Invalid Consumption", formatNumber(currentMeterReading.invalidConsumptionKwh), "kWh"],
          ["Estimated Consumption", formatNumber(currentMeterReading.estimatedConsumptionKwh), "kWh"],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Validation & Analysis Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("VALIDATION & ANALYSIS", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Analysis Metric", "Value", "Threshold"]],
        body: [
          ["Average Baseline", formatNumber(currentMeterReading.averageConsumptionBaselineKwh), "kWh"],
          ["Standard Deviation", formatNumber(currentMeterReading.standardDeviationKwh), "kWh"],
          ["Low Threshold", formatNumber(currentMeterReading.lowThresholdKwh), "kWh"],
          ["High Threshold", formatNumber(currentMeterReading.highThresholdKwh), "kWh"],
          ["Anomaly Score", (currentMeterReading.anomalyScore * 100).toFixed(1) + "%", "0-100%"],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Rollover Information
      if (currentMeterReading.isRollover) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("ROLLOVER INFORMATION", 14, yPosition)
        yPosition += 10

        autoTable(doc, {
          startY: yPosition,
          head: [["Rollover Metric", "Value"]],
          body: [
            ["Rollover Count", currentMeterReading.rolloverCount.toString()],
            ["Rollover Adjustment", formatNumber(currentMeterReading.rolloverAdjustmentKwh) + " kWh"],
            ["Is Rollover", currentMeterReading.isRollover ? "Yes" : "No"],
          ],
          theme: "grid",
          headStyles: { fillColor: [245, 158, 11], textColor: 255 },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }

      // Capture & Validation Information
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("CAPTURE & VALIDATION INFO", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Event", "Timestamp", "User"]],
        body: [
          ["Captured At", formatDate(currentMeterReading.capturedAtUtc), currentMeterReading.capturedByName],
          [
            "Validated At",
            formatDate(currentMeterReading.validatedAtUtc),
            currentMeterReading.validatedAtUtc ? "Validator" : "N/A",
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      // Notes Section
      if (currentMeterReading.notes || currentMeterReading.validationNotes) {
        yPosition = (doc as any).lastAutoTable.finalY + 15
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("NOTES", 14, yPosition)
        yPosition += 10

        const notesBody = []
        if (currentMeterReading.notes) {
          notesBody.push(["Capture Notes", currentMeterReading.notes])
        }
        if (currentMeterReading.validationNotes) {
          notesBody.push(["Validation Notes", currentMeterReading.validationNotes])
        }

        autoTable(doc, {
          startY: yPosition,
          head: [["Type", "Notes"]],
          body: notesBody,
          theme: "grid",
          headStyles: { fillColor: [107, 114, 128], textColor: 255 },
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
      doc.save(`meter-reading-${currentMeterReading.id}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (currentMeterReadingLoading) {
    return <LoadingSkeleton />
  }

  if (currentMeterReadingError || !currentMeterReading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-4 sm:p-6">
        <div className="flex w-full max-w-md flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-gray-400 sm:size-16" />
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {currentMeterReadingError ? "Error Loading Meter Reading" : "Meter Reading Not Found"}
          </h1>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            {currentMeterReadingError || "The meter reading you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()} className="w-full sm:w-auto">
            Back to Meter Readings
          </ButtonModule>
        </div>
      </div>
    )
  }

  const validationStatusConfig = getValidationStatusConfig(currentMeterReading.validationStatus)
  const anomalyConfig = getAnomalyScoreConfig(currentMeterReading.anomalyScore)
  const StatusIcon = validationStatusConfig.icon
  const consumption = calculateConsumption(currentMeterReading)

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex flex-col 2xl:container">
            <div className="sticky top-16 z-40 w-full border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-3 py-4  xl:px-16 ">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
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
                      <h1 className="text-lg font-bold text-gray-900 sm:text-xl xl:text-2xl">Meter Reading Details</h1>
                      <p className="text-xs text-gray-600 sm:text-sm">Complete overview and analysis</p>
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
                      <ExportOutlineIcon className="size-3 sm:size-4" />
                      <span className="max-sm:hidden">{isExporting ? "Exporting..." : "Export"}</span>
                      <span className="sm:hidden">Export</span>
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-3 py-6  sm:py-8 xl:px-16">
              <div className="flex w-full flex-col gap-6 xl:flex-row">
                {/* Left Column - Overview & Quick Stats */}
                <div className="flex w-full flex-col space-y-6 xl:w-[30%]">
                  {/* Overview Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 sm:size-20 sm:text-3xl">
                          <Zap className="size-5 sm:size-7" />
                        </div>
                        <div
                          className={`absolute -right-1 bottom-1 ${validationStatusConfig.bg} ${validationStatusConfig.border} rounded-full border-2 p-1 sm:p-1.5`}
                        >
                          <StatusIcon className={`size-3 ${validationStatusConfig.color} sm:size-4`} />
                        </div>
                      </div>

                      <h2 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">
                        Reading #{currentMeterReading.id}
                      </h2>
                      <p className="mb-4 text-sm text-gray-600 sm:text-base">{currentMeterReading.period}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${validationStatusConfig.bg} ${validationStatusConfig.color} sm:text-sm`}
                        >
                          {validationStatusConfig.label}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${anomalyConfig.bg} ${anomalyConfig.color} sm:text-sm`}
                        >
                          Anomaly: {anomalyConfig.label}
                        </div>
                        {currentMeterReading.isFlaggedForReview && (
                          <div className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 sm:text-sm">
                            Flagged for Review
                          </div>
                        )}
                        {currentMeterReading.isRollover && (
                          <div className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 sm:text-sm">
                            Rollover
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <User className="size-3 sm:size-4" />
                          <span className="truncate">{currentMeterReading.customerName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <FileText className="size-3 sm:size-4" />
                          <span className="truncate">{currentMeterReading.customerAccountNumber}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="size-3 sm:size-4" />
                          <span className="truncate">{formatDate(currentMeterReading.capturedAtUtc)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                      <BarChart3 className="size-4 sm:size-5" />
                      Quick Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-green-50 p-3 sm:p-4">
                        <div className="text-xs font-medium text-green-600 sm:text-sm">Total Consumption</div>
                        <div className="text-xl font-bold text-green-700 sm:text-2xl">
                          {formatNumber(consumption)} kWh
                        </div>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                        <div className="text-xs font-medium text-blue-600 sm:text-sm">Valid Consumption</div>
                        <div className="text-xl font-bold text-blue-700 sm:text-2xl">
                          {formatNumber(currentMeterReading.validConsumptionKwh)} kWh
                        </div>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-3 sm:p-4">
                        <div className="text-xs font-medium text-amber-600 sm:text-sm">Anomaly Score</div>
                        <div className="text-xl font-bold text-amber-700 sm:text-2xl">
                          {(currentMeterReading.anomalyScore * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Capture Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                      <User className="size-4 sm:size-5" />
                      Capture Info
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-600 sm:text-sm">Captured By</div>
                        <div className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                          {currentMeterReading.capturedByName}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-600 sm:text-sm">Capture Time</div>
                        <div className="text-sm font-semibold text-gray-900 sm:text-base">
                          {formatDate(currentMeterReading.capturedAtUtc)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:w-[70%]">
                  {/* Reading Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Zap className="size-4 sm:size-5" />
                      Reading Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Previous Reading</label>
                          <p className="text-lg font-bold text-gray-900  sm:text-xl">
                            {formatNumber(currentMeterReading.previousReadingKwh)} kWh
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Present Reading</label>
                          <p className="text-lg font-bold text-gray-900  sm:text-xl">
                            {formatNumber(currentMeterReading.presentReadingKwh)} kWh
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-green-50 p-3 sm:p-4">
                          <label className="text-xs font-medium text-green-600 sm:text-sm">Total Consumption</label>
                          <p className="text-lg font-bold text-green-700  sm:text-xl">
                            {formatNumber(consumption)} kWh
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-blue-50 p-3 sm:p-4">
                          <label className="text-xs font-medium text-blue-600 sm:text-sm">Valid Consumption</label>
                          <p className="text-lg font-bold text-blue-700  sm:text-xl">
                            {formatNumber(currentMeterReading.validConsumptionKwh)} kWh
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-red-50 p-3 sm:p-4">
                          <label className="text-xs font-medium text-red-600 sm:text-sm">Invalid Consumption</label>
                          <p className="text-lg font-bold text-red-700  sm:text-xl">
                            {formatNumber(currentMeterReading.invalidConsumptionKwh)} kWh
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-purple-50 p-3 sm:p-4">
                          <label className="text-xs font-medium text-purple-600 sm:text-sm">
                            Estimated Consumption
                          </label>
                          <p className="text-lg font-bold text-purple-700  sm:text-xl">
                            {formatNumber(currentMeterReading.estimatedConsumptionKwh)} kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Validation & Analysis */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <TrendingUp className="size-4 sm:size-5" />
                      Validation & Analysis
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Validation Status</label>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`size-3 ${validationStatusConfig.color} sm:size-4`} />
                            <span className={`text-sm font-semibold ${validationStatusConfig.color} sm:text-base`}>
                              {validationStatusConfig.label}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Anomaly Score</label>
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <span className={`text-sm font-semibold ${anomalyConfig.color} sm:text-base`}>
                              {(currentMeterReading.anomalyScore * 100).toFixed(1)}%
                            </span>
                            <span className={`text-xs ${anomalyConfig.color} sm:text-sm`}>{anomalyConfig.label}</span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Average Baseline</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatNumber(currentMeterReading.averageConsumptionBaselineKwh)} kWh
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Standard Deviation</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatNumber(currentMeterReading.standardDeviationKwh)} kWh
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Low Threshold</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatNumber(currentMeterReading.lowThresholdKwh)} kWh
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">High Threshold</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatNumber(currentMeterReading.highThresholdKwh)} kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Rollover Information */}
                  {currentMeterReading.isRollover && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <BarChart3 className="size-4 sm:size-5" />
                        Rollover Information
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-gray-100 bg-purple-50 p-3 sm:p-4">
                          <label className="text-xs font-medium text-purple-600 sm:text-sm">Rollover Count</label>
                          <p className="text-lg font-bold text-purple-700  sm:text-xl">
                            {currentMeterReading.rolloverCount}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-purple-50 p-3 sm:p-4">
                          <label className="text-xs font-medium text-purple-600 sm:text-sm">Rollover Adjustment</label>
                          <p className="text-lg font-bold text-purple-700  sm:text-xl">
                            {formatNumber(currentMeterReading.rolloverAdjustmentKwh)} kWh
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-purple-50 p-3 sm:p-4">
                          <label className="text-xs font-medium text-purple-600 sm:text-sm">Is Rollover</label>
                          <p className="text-lg font-bold text-purple-700  sm:text-xl">
                            {currentMeterReading.isRollover ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Timeline Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <CalendarOutlineIcon className="size-4 sm:size-5" />
                      Timeline Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Capture Time</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatDate(currentMeterReading.capturedAtUtc)}
                          </p>
                          <p className="text-xs text-gray-600 sm:text-sm">By: {currentMeterReading.capturedByName}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Billing Period</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {currentMeterReading.period}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Validation Time</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatDate(currentMeterReading.validatedAtUtc)}
                          </p>
                        </div>
                        {currentMeterReading.isFlaggedForReview && (
                          <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 sm:p-4">
                            <label className="text-xs font-medium text-amber-600 sm:text-sm">Review Status</label>
                            <p className="text-sm font-semibold text-amber-700 sm:text-base">Flagged for Review</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Notes Section */}
                  {(currentMeterReading.notes || currentMeterReading.validationNotes) && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <FileText className="size-4 sm:size-5" />
                        Notes
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {currentMeterReading.notes && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Capture Notes</label>
                            <p className="mt-2 text-sm text-gray-900 sm:text-base">{currentMeterReading.notes}</p>
                          </div>
                        )}
                        {currentMeterReading.validationNotes && (
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Validation Notes</label>
                            <p className="mt-2 text-sm text-gray-900 sm:text-base">
                              {currentMeterReading.validationNotes}
                            </p>
                          </div>
                        )}
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

export default MeterReadingDetailsPage
