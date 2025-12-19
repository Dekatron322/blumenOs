"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Calendar, Edit3, FileText, User, Zap } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { DepartmentInfoIcon, ExportOutlineIcon, SettingOutlineIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearSelectedFeederEnergyCap, fetchFeederEnergyCapById } from "lib/redux/feederEnergyCapSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
          <div className="h-9 w-20 rounded bg-gray-200 sm:w-24"></div>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Left Column Skeleton */}
        <div className="w-full space-y-6 xl:w-[30%]">
          {/* Profile Card Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto size-16 rounded-full bg-gray-200 sm:size-20"></div>
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
              </div>
            </div>
          </div>

          {/* Quick Stats Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 sm:h-6"></div>
            <div className="space-y-4">
              <div className="h-16 w-full rounded bg-gray-200"></div>
              <div className="h-16 w-full rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Capture Info Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 sm:h-6"></div>
            <div className="space-y-3">
              <div className="h-14 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
              <div className="mb-6 h-6 w-40 rounded bg-gray-200 sm:w-48"></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  value,
  color = "blue",
}: {
  icon: any
  label: string
  value: string | number
  color?: string
}) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-lg sm:size-12 ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          <Icon className="size-5 sm:size-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 sm:text-sm">{label}</p>
          <p className="text-lg font-bold text-gray-900 sm:text-xl">{value}</p>
        </div>
      </div>
    </div>
  )
}

const FeederEnergyCapDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const feederEnergyCapId = params.id as string

  // Get feeder energy cap details from Redux store
  const { selectedFeederEnergyCap, selectedFeederEnergyCapLoading, selectedFeederEnergyCapError } = useAppSelector(
    (state) => state.feederEnergyCaps
  )

  // Get current user to check privileges
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (feederEnergyCapId) {
      const id = parseInt(feederEnergyCapId)
      if (!isNaN(id)) {
        dispatch(fetchFeederEnergyCapById(id))
      }
    }

    // Cleanup function to clear details when component unmounts
    return () => {
      dispatch(clearSelectedFeederEnergyCap())
    }
  }, [dispatch, feederEnergyCapId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const exportToPDF = async () => {
    if (!selectedFeederEnergyCap) return

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
      doc.text("FEEDER ENERGY CAP RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Feeder Energy Cap Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Basic Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("BASIC INFORMATION", 14, yPosition)
      yPosition += 10

      // Basic information table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Feeder Energy Cap ID", selectedFeederEnergyCap.id.toString()],
          ["Feeder ID", selectedFeederEnergyCap.feederId.toString()],
          ["Period", selectedFeederEnergyCap.period],
          ["Energy Cap (kWh)", formatNumber(selectedFeederEnergyCap.energyCapKwh)],
          ["Tariff Override (per kWh)", formatCurrency(selectedFeederEnergyCap.tariffOverridePerKwh)],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Capture Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("CAPTURE INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Captured By", selectedFeederEnergyCap.capturedByName],
          ["Captured By User ID", selectedFeederEnergyCap.capturedByUserId.toString()],
          ["Captured At (UTC)", formatDate(selectedFeederEnergyCap.capturedAtUtc)],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Notes Section
      if (selectedFeederEnergyCap.notes) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("NOTES", 14, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const splitNotes = doc.splitTextToSize(selectedFeederEnergyCap.notes, pageWidth - 28)
        doc.text(splitNotes, 14, yPosition)
        yPosition += splitNotes.length * 5 + 10
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
      doc.save(`feeder-energy-cap-${selectedFeederEnergyCap.id}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (selectedFeederEnergyCapLoading) {
    return <LoadingSkeleton />
  }

  if (selectedFeederEnergyCapError || !selectedFeederEnergyCap) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-4 sm:p-6">
        <div className="flex w-full max-w-md flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-gray-400 sm:size-16" />
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {selectedFeederEnergyCapError ? "Error Loading Feeder Energy Cap" : "Feeder Energy Cap Not Found"}
          </h1>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            {selectedFeederEnergyCapError || "The feeder energy cap you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()} className="w-full sm:w-auto">
            Back to Feeder Energy Caps
          </ButtonModule>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col 2xl:container">
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-3 py-4  xl:px-16">
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
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308/L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971/L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462/L0.049716 9.43565/L0.0504065 7.33631/L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273/L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </motion.button>

                    <div>
                      <h1 className="text-lg font-bold text-gray-900 sm:text-xl xl:text-2xl">
                        Feeder Energy Cap Details
                      </h1>
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
                      <ExportOutlineIcon className="size-3 sm:size-4" />
                      <span className="max-sm:hidden">{isExporting ? "Exporting..." : "Export"}</span>
                      <span className="sm:hidden">Export</span>
                    </ButtonModule>

                    {canUpdate && (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2 text-sm"
                        onClick={() =>
                          router.push(`/billing/postpaid/feeder-energy-caps/update/${selectedFeederEnergyCap.id}`)
                        }
                      >
                        <Edit3 className="size-3 sm:size-4" />
                        <span className="max-sm:hidden">Edit</span>
                        <span className="sm:hidden">Edit</span>
                      </ButtonModule>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-3 py-6  sm:py-8 xl:px-16">
              <div className="flex w-full flex-col gap-6 xl:flex-row">
                {/* Left Column - Profile & Quick Stats */}
                <div className="flex w-full flex-col space-y-6 xl:w-[30%]">
                  {/* Profile Card */}
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
                      </div>

                      <h2 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">Feeder Energy Cap</h2>
                      <p className="mb-4 text-sm text-gray-600 sm:text-base">ID: #{selectedFeederEnergyCap.id}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 sm:text-sm">
                          Active
                        </div>
                        <div className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 sm:text-sm">
                          Configured
                        </div>
                      </div>

                      <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="size-3 sm:size-4" />
                          <span className="truncate">Period: {selectedFeederEnergyCap.period}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <User className="size-3 sm:size-4" />
                          <span className="truncate">Captured by: {selectedFeederEnergyCap.capturedByName}</span>
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
                      <SettingOutlineIcon />
                      Energy & Tariff
                    </h3>
                    <div className="space-y-4">
                      <StatCard
                        icon={Zap}
                        label="Energy Cap"
                        value={`${formatNumber(selectedFeederEnergyCap.energyCapKwh)} kWh`}
                        color="blue"
                      />
                      <StatCard
                        icon={FileText}
                        label="Tariff Override"
                        value={formatCurrency(selectedFeederEnergyCap.tariffOverridePerKwh)}
                        color="green"
                      />
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
                      Capture Information
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="text-sm font-medium text-gray-900 sm:text-base">
                          {selectedFeederEnergyCap.capturedByName}
                        </div>
                        <div className="text-xs text-gray-600 sm:text-sm">
                          Captured: {formatDate(selectedFeederEnergyCap.capturedAtUtc)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:w-[70%]">
                  {/* Basic Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <DepartmentInfoIcon className="size-4 sm:size-5" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Period</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {selectedFeederEnergyCap.period}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Energy Cap (kWh)</label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatNumber(selectedFeederEnergyCap.energyCapKwh)} kWh
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">
                            Tariff Override (per kWh)
                          </label>
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatCurrency(selectedFeederEnergyCap.tariffOverridePerKwh)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <label className="text-xs font-medium text-gray-600 sm:text-sm">Status</label>
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-green-500"></div>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">Active</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Capture Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <User className="size-4 sm:size-5" />
                      Capture Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 sm:size-10">
                            <User className="size-4 text-blue-600 sm:size-5" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Captured By</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {selectedFeederEnergyCap.capturedByName}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100 sm:size-10">
                            <Calendar className="size-4 text-orange-600 sm:size-5" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 sm:text-sm">Captured At (UTC)</label>
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">
                              {formatDate(selectedFeederEnergyCap.capturedAtUtc)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Notes Section */}
                  {selectedFeederEnergyCap.notes && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <FileText className="size-4 sm:size-5" />
                        Notes
                      </h3>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3 sm:p-4">
                        <p className="whitespace-pre-wrap text-sm text-gray-700 sm:text-base">
                          {selectedFeederEnergyCap.notes}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* No Notes Message */}
                  {!selectedFeederEnergyCap.notes && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <div className="py-8 text-center">
                        <FileText className="mx-auto mb-4 size-10 text-gray-400 sm:size-12" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">No Notes Available</h3>
                        <p className="text-sm text-gray-600 sm:text-base">
                          There are no additional notes for this feeder energy cap configuration.
                        </p>
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

export default FeederEnergyCapDetailsPage
