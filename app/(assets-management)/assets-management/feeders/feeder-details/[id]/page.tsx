"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Cpu, Edit3, MapPin, Zap, Building } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { DepartmentInfoIcon, ExportOutlineIcon, MapOutlineIcon, SettingOutlineIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentFeeder, fetchFeederById } from "lib/redux/feedersSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Distribution Substation Card Component
const DistributionSubstationCard = ({ substation }: { substation: any }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-purple-100">
          <Building className="size-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{substation.dssCode}</h4>
          <p className="text-sm text-gray-600">NERC: {substation.nercCode}</p>
          <p className="text-sm text-gray-600">Capacity: {substation.transformerCapacityInKva} kVA</p>
          <p className="text-sm text-gray-600">Status: {substation.status}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
        <span>ID: {substation.id}</span>
        <div className="flex items-center gap-1">
          <MapPin className="size-3" />
          <span>
            {substation.latitude?.toFixed(4)}, {substation.longitude?.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  )
}

// LoadingSkeleton component with improved uniform design
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

          {/* Injection Substation Skeleton */}
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
              <div className="h-16 w-full overflow-hidden rounded bg-gray-200">
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

const FeederDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const feederId = params.id as string

  // Get feeder details from Redux store
  const { currentFeeder, currentFeederLoading, currentFeederError } = useAppSelector((state) => state.feeders)

  // Get current user to check privileges
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [activeModal, setActiveModal] = useState<"edit" | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (feederId) {
      const id = parseInt(feederId)
      if (!isNaN(id)) {
        dispatch(fetchFeederById(id))
      }
    }

    // Cleanup function to clear feeder details when component unmounts
    return () => {
      dispatch(clearCurrentFeeder())
    }
  }, [dispatch, feederId])

  const closeAllModals = () => setActiveModal(null)
  const openModal = (modalType: "edit") => setActiveModal(modalType)

  const handleUpdateSuccess = () => {
    // Refresh feeder details after successful update
    if (feederId) {
      const id = parseInt(feederId)
      if (!isNaN(id)) {
        dispatch(fetchFeederById(id))
      }
    }
    closeAllModals()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportToPDF = async () => {
    if (!currentFeeder) return

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
      doc.text("FEEDER RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Feeder Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Feeder Profile Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("FEEDER PROFILE", 14, yPosition)
      yPosition += 10

      // Profile table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Feeder Name", currentFeeder.name],
          ["NERC Code", currentFeeder.nercCode],
          ["KAEDCO Feeder Code", currentFeeder.kaedcoFeederCode],
          ["Feeder Voltage", `${currentFeeder.feederVoltage}V`],
          ["Feeder ID", currentFeeder.id.toString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Injection Substation Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("INJECTION SUBSTATION INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Injection Substation Code", currentFeeder.injectionSubstation.injectionSubstationCode],
          ["NERC Code", currentFeeder.injectionSubstation.nercCode],
          ["Area Office", currentFeeder.injectionSubstation.areaOffice.nameOfNewOAreaffice],
          ["Area Office KAEDCO Code", currentFeeder.injectionSubstation.areaOffice.newKaedcoCode],
          ["Area Office NERC Code", currentFeeder.injectionSubstation.areaOffice.newNercCode],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // HT Pole Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("HT POLE INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["HT Pole Number", currentFeeder.htPole.htPoleNumber],
          ["HT Pole ID", currentFeeder.htPole.id.toString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Company Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("COMPANY INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Company Name", currentFeeder.injectionSubstation.areaOffice.company.name],
          ["Company NERC Code", currentFeeder.injectionSubstation.areaOffice.company.nercCode],
          [
            "NERC Supply Structure",
            currentFeeder.injectionSubstation.areaOffice.company.nercSupplyStructure.toString(),
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Distribution Substations Section
      if (currentFeeder.distributionSubstations && currentFeeder.distributionSubstations.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("DISTRIBUTION SUBSTATIONS", 14, yPosition)
        yPosition += 10

        const substationsBody = currentFeeder.distributionSubstations.map((substation) => [
          substation.dssCode,
          substation.nercCode,
          `${substation.transformerCapacityInKva} kVA`,
          substation.status,
          substation.latitude?.toString() || "N/A",
          substation.longitude?.toString() || "N/A",
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [["DSS Code", "NERC Code", "Capacity", "Status", "Latitude", "Longitude"]],
          body: substationsBody,
          theme: "grid",
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
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
      doc.save(`feeder-${currentFeeder.kaedcoFeederCode}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (currentFeederLoading) {
    return <LoadingSkeleton />
  }

  if (currentFeederError || !currentFeeder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentFeederError ? "Error Loading Feeder" : "Feeder Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">{currentFeederError || "The feeder you're looking for doesn't exist."}</p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Feeders
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
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </motion.button>

                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Feeder Details</h1>
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
                      {isExporting ? "Exporting..." : "Export"}
                    </ButtonModule>

                    {canUpdate && (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => router.push(`/assets-management/feeders/update-feeder/${currentFeeder.id}`)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </ButtonModule>
                    )}
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
                          <Cpu className="size-8" />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{currentFeeder.name}</h2>
                      <p className="mb-4 text-gray-600">Feeder #{currentFeeder.id}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
                          Active
                        </div>
                        <div className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600">
                          Operational
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="font-medium">NERC Code:</span> {currentFeeder.nercCode}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="font-medium">KAEDCO Code:</span> {currentFeeder.kaedcoFeederCode}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="font-medium">Voltage:</span> {currentFeeder.feederVoltage}V
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
                      <SettingOutlineIcon />
                      Quick Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Distribution Substations</span>
                        <span className="font-semibold text-gray-900">
                          {currentFeeder.distributionSubstations?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Injection Substation</span>
                        <span className="font-semibold text-gray-900">
                          {currentFeeder.injectionSubstation.injectionSubstationCode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">HT Pole</span>
                        <span className="font-semibold text-gray-900">{currentFeeder.htPole.htPoleNumber}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Injection Substation Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Zap className="size-5" />
                      Injection Substation
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">
                          {currentFeeder.injectionSubstation.injectionSubstationCode}
                        </div>
                        <div className="text-sm text-gray-600">NERC: {currentFeeder.injectionSubstation.nercCode}</div>
                        <div className="text-sm text-gray-600">
                          Area Office: {currentFeeder.injectionSubstation.areaOffice.nameOfNewOAreaffice}
                        </div>
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
                      <DepartmentInfoIcon />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Feeder Name</label>
                          <p className="font-semibold text-gray-900">{currentFeeder.name}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">NERC Code</label>
                          <p className="font-semibold text-gray-900">{currentFeeder.nercCode}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">KAEDCO Feeder Code</label>
                          <p className="font-semibold text-gray-900">{currentFeeder.kaedcoFeederCode}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Feeder Voltage</label>
                          <p className="font-semibold text-gray-900">{currentFeeder.feederVoltage}V</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Feeder ID</label>
                          <p className="font-semibold text-gray-900">{currentFeeder.id}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <p className="font-semibold text-green-600">Active</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Associated Assets Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Zap className="size-5" />
                      Associated Assets
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Zap className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Injection Substation</label>
                            <p className="font-semibold text-gray-900">
                              {currentFeeder.injectionSubstation.injectionSubstationCode}
                            </p>
                            <p className="text-sm text-gray-600">NERC: {currentFeeder.injectionSubstation.nercCode}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <MapPin className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Area Office</label>
                            <p className="font-semibold text-gray-900">
                              {currentFeeder.injectionSubstation.areaOffice.nameOfNewOAreaffice}
                            </p>
                            <p className="text-sm text-gray-600">
                              KAEDCO: {currentFeeder.injectionSubstation.areaOffice.newKaedcoCode}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <Cpu className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">HT Pole</label>
                            <p className="font-semibold text-gray-900">{currentFeeder.htPole.htPoleNumber}</p>
                            <p className="text-sm text-gray-600">ID: {currentFeeder.htPole.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100">
                            <Building className="size-5 text-orange-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Company</label>
                            <p className="font-semibold text-gray-900">
                              {currentFeeder.injectionSubstation.areaOffice.company.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              NERC: {currentFeeder.injectionSubstation.areaOffice.company.nercCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Distribution Substations Section */}
                  {currentFeeder.distributionSubstations && currentFeeder.distributionSubstations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Building className="size-5" />
                        Distribution Substations ({currentFeeder.distributionSubstations.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentFeeder.distributionSubstations.map((substation) => (
                          <DistributionSubstationCard key={substation.id} substation={substation} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* No Distribution Substations Message */}
                  {(!currentFeeder.distributionSubstations || currentFeeder.distributionSubstations.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="py-8 text-center">
                        <Building className="mx-auto mb-4 size-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">No Distribution Substations</h3>
                        <p className="text-gray-600">
                          This feeder doesn&apos;t have any distribution substations associated with it yet.
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

export default FeederDetailsPage
