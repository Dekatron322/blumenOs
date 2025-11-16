"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Building, Edit3, MapPin, Zap } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { DepartmentInfoIcon, ExportOutlineIcon, MapOutlineIcon, SettingOutlineIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearCurrentDistributionSubstation,
  fetchDistributionSubstationById,
} from "lib/redux/distributionSubstationsSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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

          {/* Feeder Information Skeleton */}
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

const DistributionStationDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const distributionStationId = params.id as string

  // Get distribution station details from Redux store
  const { currentDistributionSubstation, currentDistributionSubstationLoading, currentDistributionSubstationError } =
    useAppSelector((state) => state.distributionSubstations)

  // Get current user to check privileges
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (distributionStationId) {
      const id = parseInt(distributionStationId)
      if (!isNaN(id)) {
        dispatch(fetchDistributionSubstationById(id))
      }
    }

    // Cleanup function to clear distribution station details when component unmounts
    return () => {
      dispatch(clearCurrentDistributionSubstation())
    }
  }, [dispatch, distributionStationId])

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
    if (!currentDistributionSubstation) return

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
      doc.text("DISTRIBUTION SUBSTATION RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Distribution Substation Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Distribution Substation Profile Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("DISTRIBUTION SUBSTATION PROFILE", 14, yPosition)
      yPosition += 10

      // Profile table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["DSS Code", currentDistributionSubstation.dssCode],
          ["NERC Code", currentDistributionSubstation.nercCode],
          ["Old DSS Code", currentDistributionSubstation.oldDssCode || "Not specified"],
          ["Transformer Capacity", `${currentDistributionSubstation.transformerCapacityInKva} kVA`],
          ["Number of Units", currentDistributionSubstation.numberOfUnit.toString()],
          ["Public/Dedicated", currentDistributionSubstation.publicOrDedicated],
          ["Status", currentDistributionSubstation.status],
          ["Latitude", currentDistributionSubstation.latitude.toString()],
          ["Longitude", currentDistributionSubstation.longitude.toString()],
          ["Remarks", currentDistributionSubstation.remarks || "None"],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Unit Codes Section
      if (currentDistributionSubstation.numberOfUnit > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("UNIT CODES", 14, yPosition)
        yPosition += 10

        const unitCodesBody = []
        if (currentDistributionSubstation.unitOneCode) {
          unitCodesBody.push(["Unit 1", currentDistributionSubstation.unitOneCode])
        }
        if (currentDistributionSubstation.unitTwoCode) {
          unitCodesBody.push(["Unit 2", currentDistributionSubstation.unitTwoCode])
        }
        if (currentDistributionSubstation.unitThreeCode) {
          unitCodesBody.push(["Unit 3", currentDistributionSubstation.unitThreeCode])
        }
        if (currentDistributionSubstation.unitFourCode) {
          unitCodesBody.push(["Unit 4", currentDistributionSubstation.unitFourCode])
        }

        if (unitCodesBody.length > 0) {
          autoTable(doc, {
            startY: yPosition,
            head: [["Unit", "Code"]],
            body: unitCodesBody,
            theme: "grid",
            headStyles: { fillColor: [16, 185, 129], textColor: 255 },
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 },
          })
          yPosition = (doc as any).lastAutoTable.finalY + 15
        }
      }

      // Feeder Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("FEEDER INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Feeder Name", currentDistributionSubstation.feeder.name],
          ["Feeder NERC Code", currentDistributionSubstation.feeder.nercCode],
          ["KAEDCO Feeder Code", currentDistributionSubstation.feeder.kaedcoFeederCode],
          ["Feeder Voltage", `${currentDistributionSubstation.feeder.feederVoltage}V`],
          ["Injection Substation", currentDistributionSubstation.feeder.injectionSubstation.injectionSubstationCode],
          ["Area Office", currentDistributionSubstation.feeder.injectionSubstation.areaOffice.nameOfNewOAreaffice],
          ["Company", currentDistributionSubstation.feeder.injectionSubstation.areaOffice.company.name],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 9 },
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
      doc.save(
        `distribution-substation-${currentDistributionSubstation.dssCode}-${new Date().toISOString().split("T")[0]}.pdf`
      )
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (currentDistributionSubstationLoading) {
    return <LoadingSkeleton />
  }

  if (currentDistributionSubstationError || !currentDistributionSubstation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentDistributionSubstationError
              ? "Error Loading Distribution Substation"
              : "Distribution Substation Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">
            {currentDistributionSubstationError || "The distribution substation you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Distribution Substations
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
                      className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-[#f9f9f9] text-gray-700 hover:bg-gray-50"
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
                      <h1 className="text-2xl font-bold text-gray-900">Distribution Substation Details</h1>
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
                        onClick={() =>
                          router.push(
                            `/assets-management/distribution-stations/update-distribution-station/${currentDistributionSubstation.id}`
                          )
                        }
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
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                          <Zap className="size-8 text-blue-600" />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{currentDistributionSubstation.dssCode}</h2>
                      <p className="mb-4 text-gray-600">Distribution Substation #{currentDistributionSubstation.id}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                            currentDistributionSubstation.status === "ACTIVE"
                              ? "bg-green-50 text-green-600"
                              : currentDistributionSubstation.status === "INACTIVE"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {currentDistributionSubstation.status}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                            currentDistributionSubstation.publicOrDedicated === "PUBLIC"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-purple-50 text-purple-600"
                          }`}
                        >
                          {currentDistributionSubstation.publicOrDedicated}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-center gap-3 text-gray-600">
                          <MapOutlineIcon />
                          Coordinates: {currentDistributionSubstation.latitude.toFixed(4)},{" "}
                          {currentDistributionSubstation.longitude.toFixed(4)}
                        </div>
                        <div className="flex items-center justify-center gap-3 text-gray-600">
                          <span className="font-medium">NERC:</span> {currentDistributionSubstation.nercCode}
                        </div>
                        <div className="flex items-center justify-center gap-3 text-gray-600">
                          <span className="font-medium">Capacity:</span>{" "}
                          {currentDistributionSubstation.transformerCapacityInKva} kVA
                        </div>
                        <div className="flex items-center justify-center gap-3 text-gray-600">
                          <span className="font-medium">Units:</span> {currentDistributionSubstation.numberOfUnit}
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
                        <span className="text-sm text-gray-600">Transformer Capacity</span>
                        <span className="font-semibold text-gray-900">
                          {currentDistributionSubstation.transformerCapacityInKva} kVA
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Number of Units</span>
                        <span className="font-semibold text-gray-900">
                          {currentDistributionSubstation.numberOfUnit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type</span>
                        <span className="font-semibold text-gray-900">
                          {currentDistributionSubstation.publicOrDedicated}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span
                          className={`font-semibold ${
                            currentDistributionSubstation.status === "ACTIVE"
                              ? "text-green-600"
                              : currentDistributionSubstation.status === "INACTIVE"
                              ? "text-red-600"
                              : "text-amber-600"
                          }`}
                        >
                          {currentDistributionSubstation.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Feeder Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Zap className="size-5" />
                      Feeder Information
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">{currentDistributionSubstation.feeder.name}</div>
                        <div className="text-sm text-gray-600">
                          NERC: {currentDistributionSubstation.feeder.nercCode}
                        </div>
                        <div className="text-sm text-gray-600">
                          KAEDCO: {currentDistributionSubstation.feeder.kaedcoFeederCode}
                        </div>
                        <div className="text-sm text-gray-600">
                          Voltage: {currentDistributionSubstation.feeder.feederVoltage}V
                        </div>
                        <div className="text-sm text-gray-600">
                          Injection Substation:{" "}
                          {currentDistributionSubstation.feeder.injectionSubstation.injectionSubstationCode}
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
                          <label className="text-sm font-medium text-gray-600">DSS Code</label>
                          <p className="font-semibold text-gray-900">{currentDistributionSubstation.dssCode}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">NERC Code</label>
                          <p className="font-semibold text-gray-900">{currentDistributionSubstation.nercCode}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Transformer Capacity</label>
                          <p className="font-semibold text-gray-900">
                            {currentDistributionSubstation.transformerCapacityInKva} kVA
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Number of Units</label>
                          <p className="font-semibold text-gray-900">{currentDistributionSubstation.numberOfUnit}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Old DSS Code</label>
                          <p className="font-semibold text-gray-900">
                            {currentDistributionSubstation.oldDssCode || "Not specified"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Public/Dedicated</label>
                          <p className="font-semibold text-gray-900">
                            {currentDistributionSubstation.publicOrDedicated}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <p
                            className={`font-semibold ${
                              currentDistributionSubstation.status === "ACTIVE"
                                ? "text-green-600"
                                : currentDistributionSubstation.status === "INACTIVE"
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          >
                            {currentDistributionSubstation.status}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Remarks</label>
                          <p className="font-semibold text-gray-900">
                            {currentDistributionSubstation.remarks || "No remarks"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Location Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <MapPin className="size-5" />
                      Location Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <MapPin className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Latitude</label>
                            <p className="font-semibold text-gray-900">{currentDistributionSubstation.latitude}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <MapPin className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Longitude</label>
                            <p className="font-semibold text-gray-900">{currentDistributionSubstation.longitude}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> These coordinates are used for geographical mapping and system
                        operations.
                      </p>
                    </div>
                  </motion.div>

                  {/* Unit Codes Section */}
                  {currentDistributionSubstation.numberOfUnit > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Building className="size-5" />
                        Unit Codes ({currentDistributionSubstation.numberOfUnit} units)
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {currentDistributionSubstation.unitOneCode && (
                          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                            <div className="text-sm font-medium text-gray-600">Unit 1</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {currentDistributionSubstation.unitOneCode}
                            </div>
                          </div>
                        )}
                        {currentDistributionSubstation.unitTwoCode && (
                          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                            <div className="text-sm font-medium text-gray-600">Unit 2</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {currentDistributionSubstation.unitTwoCode}
                            </div>
                          </div>
                        )}
                        {currentDistributionSubstation.unitThreeCode && (
                          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                            <div className="text-sm font-medium text-gray-600">Unit 3</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {currentDistributionSubstation.unitThreeCode}
                            </div>
                          </div>
                        )}
                        {currentDistributionSubstation.unitFourCode && (
                          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                            <div className="text-sm font-medium text-gray-600">Unit 4</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {currentDistributionSubstation.unitFourCode}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Feeder Details Section */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Zap className="size-5" />
                      Feeder Details
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Feeder Name</label>
                          <p className="font-semibold text-gray-900">{currentDistributionSubstation.feeder.name}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">NERC Code</label>
                          <p className="font-semibold text-gray-900">{currentDistributionSubstation.feeder.nercCode}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">KAEDCO Code</label>
                          <p className="font-semibold text-gray-900">
                            {currentDistributionSubstation.feeder.kaedcoFeederCode}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Feeder Voltage</label>
                          <p className="font-semibold text-gray-900">
                            {currentDistributionSubstation.feeder.feederVoltage}V
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Injection Substation</label>
                          <p className="font-semibold text-gray-900">
                            {currentDistributionSubstation.feeder.injectionSubstation.injectionSubstationCode}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Area Office</label>
                          <p className="font-semibold text-gray-900">
                            {currentDistributionSubstation.feeder.injectionSubstation.areaOffice.nameOfNewOAreaffice}
                          </p>
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

export default DistributionStationDetailsPage
