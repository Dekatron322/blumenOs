"use client"

import React, { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Building, Calendar, DollarSign, FileText, User, Zap } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentBill, fetchPostpaidBillById } from "lib/redux/postpaidSlice"
import { fetchDistributionSubstationById } from "lib/redux/distributionSubstationsSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// LoadingSkeleton component
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
          {/* Profile Card Skeleton */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-gray-200">
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
              </div>
              <div className="mx-auto mb-2 h-6 w-32 overflow-hidden rounded bg-gray-200">
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
              <div className="mx-auto mb-4 h-4 w-24 overflow-hidden rounded bg-gray-200">
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

          {/* Quick Stats Skeleton */}
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
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 w-full overflow-hidden rounded bg-gray-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                </div>
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
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getStatusConfig = (status: number) => {
  const configs = {
    1: { label: "Paid", color: "text-green-600", bg: "bg-green-100" },
    2: { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-100" },
    3: { label: "Overdue", color: "text-red-600", bg: "bg-red-100" },
    4: { label: "Cancelled", color: "text-gray-600", bg: "bg-gray-100" },
  }
  return configs[status as keyof typeof configs] || configs[2]
}

const getCategoryConfig = (category: number) => {
  const configs = {
    1: { label: "Residential", color: "text-blue-600", bg: "bg-blue-100" },
    2: { label: "Commercial", color: "text-green-600", bg: "bg-green-100" },
    3: { label: "Industrial", color: "text-purple-600", bg: "bg-purple-100" },
  }
  return configs[category as keyof typeof configs] || configs[1]
}

const BillDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const billId = params.id as string

  // Get bill details from Redux store
  const { currentBill, currentBillLoading, currentBillError } = useAppSelector((state) => state.postpaidBilling)
  const { currentDistributionSubstation } = useAppSelector((state) => state.distributionSubstations)

  useEffect(() => {
    if (billId) {
      const id = parseInt(billId)
      if (!isNaN(id)) {
        dispatch(fetchPostpaidBillById(id))
      }
    }

    // Cleanup function to clear bill details when component unmounts
    return () => {
      dispatch(clearCurrentBill())
    }
  }, [dispatch, billId])

  useEffect(() => {
    if (currentBill?.distributionSubstationId) {
      dispatch(fetchDistributionSubstationById(currentBill.distributionSubstationId))
    }
  }, [dispatch, currentBill?.distributionSubstationId])

  const exportToPDF = () => {
    if (!currentBill) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Add header
    doc.setFillColor(249, 249, 249)
    doc.rect(0, 0, pageWidth, 60, "F")

    // Company name
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(10, 10, 10)
    doc.text("BILLING STATEMENT", pageWidth / 2, 20, { align: "center" })

    // Report title
    doc.setFontSize(16)
    doc.setTextColor(100, 100, 100)
    doc.text("Postpaid Bill Details", pageWidth / 2, 30, { align: "center" })

    // Date generated
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

    let yPosition = 70

    // Customer Information Section
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(10, 10, 10)
    doc.text("CUSTOMER INFORMATION", 14, yPosition)
    yPosition += 10

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Details"]],
      body: [
        ["Customer Name", currentBill.customerName],
        ["Account Number", currentBill.customerAccountNumber],
        ["Customer ID", currentBill.customerId.toString()],
        ["Category", getCategoryConfig(currentBill.category).label],
      ],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15

    // Bill Information Section
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("BILL INFORMATION", 14, yPosition)
    yPosition += 10

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Details"]],
      body: [
        ["Bill Period", currentBill.period],
        ["Bill Name", currentBill.name],
        ["Status", getStatusConfig(currentBill.status).label],
        ["Due Date", formatDate(currentBill.dueDate)],
        ["Issue Date", formatDate(currentBill.createdAt)],
      ],
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15

    // Consumption & Charges Section
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("CONSUMPTION & CHARGES", 14, yPosition)
    yPosition += 10

    autoTable(doc, {
      startY: yPosition,
      head: [["Description", "Amount (₦)"]],
      body: [
        ["Consumption (kWh)", currentBill.consumptionKwh.toFixed(2)],
        ["Tariff per kWh", formatCurrency(currentBill.tariffPerKwh)],
        ["Charge Before VAT", formatCurrency(currentBill.chargeBeforeVat)],
        ["VAT Amount", formatCurrency(currentBill.vatAmount)],
        ["Current Bill Amount", formatCurrency(currentBill.currentBillAmount)],
        ["Opening Balance", formatCurrency(currentBill.openingBalance)],
        ["Payments Previous Month", formatCurrency(currentBill.paymentsPrevMonth)],
        ["TOTAL DUE", formatCurrency(currentBill.totalDue)],
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
        ["Area Office", currentBill.areaOfficeName],
        ["Feeder", currentBill.feederName],
        ["Distribution Substation", currentBill.distributionSubstationCode],
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
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10)
    }

    // Save the PDF
    doc.save(`bill-${currentBill.customerAccountNumber}-${currentBill.period}.pdf`)
  }

  if (currentBillLoading) {
    return <LoadingSkeleton />
  }

  if (currentBillError || !currentBill) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentBillError ? "Error Loading Bill" : "Bill Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">{currentBillError || "The bill you're looking for doesn't exist."}</p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Bills
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(currentBill.status)
  const categoryConfig = getCategoryConfig(currentBill.category)

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
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971/L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </motion.button>

                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Bill Details</h1>
                      <p className="text-gray-600">Complete billing information and breakdown</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={exportToPDF}
                    >
                      <FileText className="size-4" />
                      Export PDF
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-16 py-8">
              <div className="flex w-full gap-6">
                {/* Left Column - Customer & Quick Info */}
                <div className="flex w-[30%] flex-col space-y-6">
                  {/* Customer Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                          <User className="size-8" />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{currentBill.customerName}</h2>
                      <p className="mb-4 text-gray-600">Account: {currentBill.customerAccountNumber}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${categoryConfig.bg} ${categoryConfig.color}`}
                        >
                          {categoryConfig.label}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="font-medium">Customer ID:</span> {currentBill.customerId}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="font-medium">Billing Period:</span> {currentBill.period}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="font-medium">Due Date:</span> {formatDate(currentBill.dueDate)}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <DollarSign className="size-5" />
                      Quick Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Due</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(currentBill.totalDue)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Consumption</span>
                        <span className="font-semibold text-gray-900">{currentBill.consumptionKwh} kWh</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Bill</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentBill.currentBillAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Opening Balance</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentBill.openingBalance)}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Location Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Building className="size-5" />
                      Location
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">{currentBill.areaOfficeName}</div>
                        <div className="text-sm text-gray-600">Area Office</div>
                      </div>
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">{currentBill.feederName}</div>
                        <div className="text-sm text-gray-600">Feeder</div>
                      </div>
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">
                          {currentDistributionSubstation?.dssCode || currentBill.distributionSubstationCode}
                        </div>
                        <div className="text-sm text-gray-600">Distribution Substation</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6">
                  {/* Bill Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <FileText className="size-5" />
                      Bill Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Bill Name</label>
                        <p className="font-semibold text-gray-900">{currentBill.name}</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Billing Period</label>
                        <p className="font-semibold text-gray-900">{currentBill.period}</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Due Date</label>
                        <p className="font-semibold text-gray-900">{formatDate(currentBill.dueDate)}</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Issue Date</label>
                        <p className="font-semibold text-gray-900">{formatDate(currentBill.createdAt)}</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9]  p-4">
                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                        <p className="font-semibold text-gray-900">{formatDateTime(currentBill.lastUpdated)}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Consumption & Billing Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Zap className="size-5" />
                      Consumption & Billing Details
                    </h3>
                    <div className="grid grid-cols-2 gap-6 ">
                      <div className="space-y-4 rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4 md:grid-cols-2">
                        <h4 className="font-semibold text-gray-900">Consumption Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual Consumption</span>
                            <span className="font-semibold">{currentBill.consumptionKwh} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Consumption</span>
                            <span className="font-semibold">{currentBill.estimatedConsumptionKwh || 0} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Forecast Consumption</span>
                            <span className="font-semibold">{currentBill.forecastConsumptionKwh} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tariff Rate</span>
                            <span className="font-semibold">{formatCurrency(currentBill.tariffPerKwh)}/kWh</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4 md:grid-cols-2">
                        <h4 className="font-semibold text-gray-900">Billing Breakdown</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Charge Before VAT</span>
                            <span className="font-semibold">{formatCurrency(currentBill.chargeBeforeVat)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">VAT Amount ({currentBill.vatRate}%)</span>
                            <span className="font-semibold">{formatCurrency(currentBill.vatAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current Bill Amount</span>
                            <span className="font-semibold">{formatCurrency(currentBill.currentBillAmount)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold text-gray-900">Total Due</span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(currentBill.totalDue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Balance & Forecast Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <DollarSign className="size-5" />
                      Balance & Forecast
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4 rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <h4 className="font-semibold text-gray-900">Balance Information</h4>
                        <div className="space-y-3 ">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Opening Balance</span>
                            <span className="font-semibold">{formatCurrency(currentBill.openingBalance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payments Previous Month</span>
                            <span className="font-semibold">{formatCurrency(currentBill.paymentsPrevMonth)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Adjusted Opening Balance</span>
                            <span className="font-semibold">{formatCurrency(currentBill.adjustedOpeningBalance)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <h4 className="font-semibold text-gray-900">Forecast Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Forecast Bill Amount</span>
                            <span className="font-semibold">{formatCurrency(currentBill.forecastBillAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Forecast Total Due</span>
                            <span className="font-semibold">{formatCurrency(currentBill.forecastTotalDue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Billing Variance</span>
                            <span
                              className={`font-semibold ${
                                currentBill.billingVarianceAmount >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(currentBill.billingVarianceAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Additional Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Calendar className="size-5" />
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Meter Reading ID</label>
                        <p className="font-semibold text-gray-900">{currentBill.meterReadingId || "N/A"}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Feeder Energy Cap ID</label>
                        <p className="font-semibold text-gray-900">{currentBill.feederEnergyCapId || "N/A"}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Open Disputes</label>
                        <p className="font-semibold text-gray-900">{currentBill.openDisputeCount}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Estimated Bill</label>
                        <p className="font-semibold text-gray-900">{currentBill.isEstimated ? "Yes" : "No"}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Meter Reading Flagged</label>
                        <p className="font-semibold text-gray-900">
                          {currentBill.isMeterReadingFlagged ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Adjustment Status</label>
                        <p className="font-semibold text-gray-900">{currentBill.adjustmentStatus}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Ledger Entries */}
                  {currentBill.ledgerEntries && currentBill.ledgerEntries.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <FileText className="size-5" />
                        Ledger Entries ({currentBill.ledgerEntries.length})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-separate border-spacing-0 text-left">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Type
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Amount
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Code
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Memo
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {currentBill.ledgerEntries.map((entry, index) => (
                              <tr key={entry.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                  {entry.type}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                                  {formatCurrency(entry.amount)}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                  {entry.code}
                                </td>
                                <td className="border-b px-4 py-3 text-sm text-gray-600">{entry.memo}</td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                  {formatDateTime(entry.effectiveAtUtc)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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

export default BillDetailsPage
