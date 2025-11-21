"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Building, Calendar, CreditCard, Download, MapPin, User, Zap } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { ExportOutlineIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentPayment, fetchPaymentById } from "lib/redux/paymentSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// LoadingSkeleton component for payment details
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
              <div className="mb-6 flex justify-center gap-2">
                <div className="h-6 w-20 overflow-hidden rounded-full bg-gray-200">
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
                <div className="h-6 w-20 overflow-hidden rounded-full bg-gray-200">
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
              <div className="space-y-3">
                <div className="h-4 w-full overflow-hidden rounded bg-gray-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.0,
                    }}
                  />
                </div>
                <div className="h-4 w-full overflow-hidden rounded bg-gray-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.2,
                    }}
                  />
                </div>
                <div className="h-4 w-full overflow-hidden rounded bg-gray-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.4,
                    }}
                  />
                </div>
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
              <div className="h-4 w-full overflow-hidden rounded bg-gray-200">
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
              <div className="h-4 w-full overflow-hidden rounded bg-gray-200">
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
              <div className="h-4 w-full overflow-hidden rounded bg-gray-200">
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
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4].map((item) => (
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

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      Confirmed: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "CONFIRMED" },
      Pending: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "PENDING" },
      Failed: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "FAILED" },
      Reversed: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", label: "REVERSED" },
    }
    return configs[status as keyof typeof configs] || configs.Pending
  }

  const statusConfig = getStatusConfig(status)

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
    >
      <span className={`size-2 rounded-full ${statusConfig.border}`}></span>
      {statusConfig.label}
    </div>
  )
}

// Payment Method Badge Component
const PaymentMethodBadge = ({ method }: { method: string }) => {
  const getMethodConfig = (method: string) => {
    const configs = {
      Cash: { color: "text-purple-600", bg: "bg-purple-50", label: "CASH" },
      BankTransfer: { color: "text-blue-600", bg: "bg-blue-50", label: "BANK TRANSFER" },
      Pos: { color: "text-orange-600", bg: "bg-orange-50", label: "POS" },
      Card: { color: "text-green-600", bg: "bg-green-50", label: "CARD" },
      VendorWallet: { color: "text-red-600", bg: "bg-red-50", label: "VENDOR WALLET" },
    }
    return configs[method as keyof typeof configs] || configs.Cash
  }

  const methodConfig = getMethodConfig(method)

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${methodConfig.bg} ${methodConfig.color}`}
    >
      {methodConfig.label}
    </div>
  )
}

// Collector Type Badge Component
const CollectorTypeBadge = ({ type }: { type: string }) => {
  const getTypeConfig = (type: string) => {
    const configs = {
      Customer: { color: "text-blue-600", bg: "bg-blue-50", label: "CUSTOMER" },
      Agent: { color: "text-green-600", bg: "bg-green-50", label: "AGENT" },
      Vendor: { color: "text-orange-600", bg: "bg-orange-50", label: "VENDOR" },
      Staff: { color: "text-purple-600", bg: "bg-purple-50", label: "STAFF" },
    }
    return configs[type as keyof typeof configs] || configs.Customer
  }

  const typeConfig = getTypeConfig(type)

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${typeConfig.bg} ${typeConfig.color}`}
    >
      {typeConfig.label}
    </div>
  )
}

const PaymentDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const paymentId = params.id as string

  // Get payment details from Redux store
  const { currentPayment, currentPaymentLoading, currentPaymentError } = useAppSelector((state) => state.payments)

  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (paymentId) {
      const id = parseInt(paymentId)
      if (!isNaN(id)) {
        dispatch(fetchPaymentById(id))
      }
    }

    // Cleanup function to clear payment details when component unmounts
    return () => {
      dispatch(clearCurrentPayment())
    }
  }, [dispatch, paymentId])

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
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

  const exportToPDF = async () => {
    if (!currentPayment) return

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
      doc.text("PAYMENT RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Payment Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Payment Profile Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("PAYMENT PROFILE", 14, yPosition)
      yPosition += 10

      // Profile table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Reference", currentPayment.reference],
          ["Amount", formatCurrency(currentPayment.amount, currentPayment.currency)],
          ["Status", currentPayment.status],
          ["Payment Method", currentPayment.channel],
          ["Collector Type", currentPayment.collectorType],
          ["Payment ID", currentPayment.id.toString()],
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
          ["Customer Name", currentPayment.customerName],
          ["Account Number", currentPayment.customerAccountNumber],
          ["Customer ID", currentPayment.customerId.toString()],
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
          ["Amount Applied", formatCurrency(currentPayment.amountApplied, currentPayment.currency)],
          ["Overpayment Amount", formatCurrency(currentPayment.overPaymentAmount, currentPayment.currency)],
          ["Outstanding Before", formatCurrency(currentPayment.outstandingBeforePayment, currentPayment.currency)],
          ["Outstanding After", formatCurrency(currentPayment.outstandingAfterPayment, currentPayment.currency)],
          ["Bill Total Due", formatCurrency(currentPayment.billTotalDue, currentPayment.currency)],
          ["Currency", currentPayment.currency],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Timeline Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("TIMELINE INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Event", "Date & Time"]],
        body: [
          ["Paid At", formatDate(currentPayment.paidAtUtc)],
          ["Confirmed At", currentPayment.confirmedAtUtc ? formatDate(currentPayment.confirmedAtUtc) : "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Additional Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("ADDITIONAL INFORMATION", 14, yPosition)
      yPosition += 10

      const additionalInfo = [
        ["Vendor", currentPayment.vendorName || "N/A"],
        ["Agent", currentPayment.agentName || "N/A"],
        ["Area Office", currentPayment.areaOfficeName || "N/A"],
        ["Feeder", currentPayment.feederName || "N/A"],
        ["Bill Period", currentPayment.postpaidBillPeriod || "N/A"],
        ["Narrative", currentPayment.narrative || "N/A"],
        ["External Reference", currentPayment.externalReference || "N/A"],
        ["Recorded By", currentPayment.recordedByName || "N/A"],
      ]

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: additionalInfo,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      })

      // Virtual Account Information
      if (currentPayment.virtualAccount) {
        yPosition = (doc as any).lastAutoTable.finalY + 15

        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("VIRTUAL ACCOUNT INFORMATION", 14, yPosition)
        yPosition += 10

        autoTable(doc, {
          startY: yPosition,
          head: [["Field", "Details"]],
          body: [
            ["Account Number", currentPayment.virtualAccount.accountNumber],
            ["Bank Name", currentPayment.virtualAccount.bankName],
            ["Reference", currentPayment.virtualAccount.reference],
            ["Expires At", formatDate(currentPayment.virtualAccount.expiresAtUtc)],
          ],
          theme: "grid",
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
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
      doc.save(`payment-${currentPayment.reference}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (currentPaymentLoading) {
    return <LoadingSkeleton />
  }

  if (currentPaymentError || !currentPayment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentPaymentError ? "Error Loading Payment" : "Payment Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">{currentPaymentError || "The payment you're looking for doesn't exist."}</p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Payments
          </ButtonModule>
        </div>
      </div>
    )
  }

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
                      <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
                      <p className="text-gray-600">Complete payment overview and information</p>
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

                    <ButtonModule
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => window.print()}
                    >
                      <Download className="size-4" />
                      Print Receipt
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-16 py-8">
              <div className="flex w-full gap-6">
                {/* Left Column - Profile & Quick Stats */}
                <div className="flex w-[30%] flex-col space-y-6 xl:col-span-1">
                  {/* Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                          <CreditCard className="size-8" />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{currentPayment.reference}</h2>
                      <p className="mb-4 text-gray-600">Payment #{currentPayment.id}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <StatusBadge status={currentPayment.status} />
                        <PaymentMethodBadge method={currentPayment.channel} />
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="font-medium">Amount:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(currentPayment.amount, currentPayment.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="font-medium">Collector:</span>
                          <CollectorTypeBadge type={currentPayment.collectorType} />
                        </div>
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="font-medium">Paid:</span>
                          <span className="font-medium">{formatDate(currentPayment.paidAtUtc)}</span>
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
                      <Zap className="size-5" />
                      Payment Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Amount Applied</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentPayment.amountApplied, currentPayment.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overpayment</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentPayment.overPaymentAmount, currentPayment.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Outstanding Before</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentPayment.outstandingBeforePayment, currentPayment.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Outstanding After</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentPayment.outstandingAfterPayment, currentPayment.currency)}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Customer Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <User className="size-5" />
                      Customer
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">{currentPayment.customerName}</div>
                        <div className="text-sm text-gray-600">Account: {currentPayment.customerAccountNumber}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:col-span-2">
                  {/* Basic Payment Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <CreditCard className="size-5" />
                      Payment Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Reference</label>
                        <p className="font-semibold text-gray-900">{currentPayment.reference}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Payment Method</label>
                        <div className="mt-1">
                          <PaymentMethodBadge method={currentPayment.channel} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <div className="mt-1">
                          <StatusBadge status={currentPayment.status} />
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Collector Type</label>
                        <div className="mt-1">
                          <CollectorTypeBadge type={currentPayment.collectorType} />
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Currency</label>
                        <p className="font-semibold text-gray-900">{currentPayment.currency}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Financial Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Zap className="size-5" />
                      Financial Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <CreditCard className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Total Amount</label>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(currentPayment.amount, currentPayment.currency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <Zap className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Amount Applied</label>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(currentPayment.amountApplied, currentPayment.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100">
                            <AlertCircle className="size-5 text-orange-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Overpayment</label>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(currentPayment.overPaymentAmount, currentPayment.currency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <Building className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Bill Total Due</label>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(currentPayment.billTotalDue, currentPayment.currency)}
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
                      <Calendar className="size-5" />
                      Timeline
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Paid At</label>
                        <p className="font-semibold text-gray-900">{formatDate(currentPayment.paidAtUtc)}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Confirmed At</label>
                        <p className="font-semibold text-gray-900">
                          {currentPayment.confirmedAtUtc ? formatDate(currentPayment.confirmedAtUtc) : "Not confirmed"}
                        </p>
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
                      <Building className="size-5" />
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {currentPayment.vendorName && (
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Vendor</label>
                          <p className="font-semibold text-gray-900">{currentPayment.vendorName}</p>
                        </div>
                      )}
                      {currentPayment.agentName && (
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Agent</label>
                          <p className="font-semibold text-gray-900">{currentPayment.agentName}</p>
                        </div>
                      )}
                      {currentPayment.areaOfficeName && (
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Area Office</label>
                          <p className="font-semibold text-gray-900">{currentPayment.areaOfficeName}</p>
                        </div>
                      )}
                      {currentPayment.feederName && (
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Feeder</label>
                          <p className="font-semibold text-gray-900">{currentPayment.feederName}</p>
                        </div>
                      )}
                      {currentPayment.postpaidBillPeriod && (
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Bill Period</label>
                          <p className="font-semibold text-gray-900">{currentPayment.postpaidBillPeriod}</p>
                        </div>
                      )}
                      {currentPayment.narrative && (
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Narrative</label>
                          <p className="font-semibold text-gray-900">{currentPayment.narrative}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Virtual Account Information */}
                  {currentPayment.virtualAccount && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <CreditCard className="size-5" />
                        Virtual Account Information
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Account Number</label>
                          <p className="font-semibold text-gray-900">{currentPayment.virtualAccount.accountNumber}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Bank Name</label>
                          <p className="font-semibold text-gray-900">{currentPayment.virtualAccount.bankName}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Reference</label>
                          <p className="font-semibold text-gray-900">{currentPayment.virtualAccount.reference}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Expires At</label>
                          <p className="font-semibold text-gray-900">
                            {formatDate(currentPayment.virtualAccount.expiresAtUtc)}
                          </p>
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

export default PaymentDetailsPage
