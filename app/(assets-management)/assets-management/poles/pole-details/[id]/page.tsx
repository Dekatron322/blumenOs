"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Edit3, MapPin, Zap } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { DepartmentInfoIcon, ExportOutlineIcon, MapOutlineIcon, SettingOutlineIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentPole, fetchPoleById } from "lib/redux/polesSlice"
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
                  {[1, 2].map((subItem) => (
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
                  {[1, 2].map((subItem) => (
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

const PoleDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const poleId = params.id as string

  // Get pole details from Redux store
  const { currentPole, currentPoleLoading, currentPoleError } = useAppSelector((state) => state.poles)

  // Get current user to check privileges
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (poleId) {
      const id = parseInt(poleId)
      if (!isNaN(id)) {
        dispatch(fetchPoleById(id))
      }
    }

    // Cleanup function to clear pole details when component unmounts
    return () => {
      dispatch(clearCurrentPole())
    }
  }, [dispatch, poleId])

  const exportToPDF = async () => {
    if (!currentPole) return

    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      // Add header
      doc.setFillColor(249, 249, 249)
      doc.rect(0, 0, pageWidth, 60, "F")

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("HT POLE RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("HT Pole Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // HT Pole Profile Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("HT POLE PROFILE", 14, yPosition)
      yPosition += 10

      // Profile table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["HT Pole ID", currentPole.id.toString()],
          ["HT Pole Number", currentPole.htPoleNumber],
          ["Status", "Active"],
          ["Asset Type", "High Tension Pole"],
          ["Voltage Level", "High Tension (HT)"],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      // Save the PDF
      doc.save(`ht-pole-${currentPole.htPoleNumber}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  // Handle loading state
  if (currentPoleLoading) {
    return <LoadingSkeleton />
  }

  // Handle error state
  if (currentPoleError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Error Loading HT Pole</h1>
          <p className="mb-6 text-gray-600">{currentPoleError}</p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to HT Poles
          </ButtonModule>
        </div>
      </div>
    )
  }

  // Handle pole not found
  if (!currentPole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">HT Pole Not Found</h1>
          <p className="mb-6 text-gray-600">The HT Pole you're looking for doesn&apos;t exist.</p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to HT Poles
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
              <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-16">
                <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
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
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </motion.button>

                    <div>
                      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">HT Pole Details</h1>
                      <p className="text-sm text-gray-600">Complete overview and management</p>
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
                        onClick={() => router.push(`/assets-management/poles/update-pole/${currentPole.id}`)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </ButtonModule>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full px-4 py-8 sm:px-6 lg:px-16">
              <div className="flex w-full flex-col gap-6 xl:flex-row">
                {/* Left Column - Profile & Quick Stats */}
                <div className="flex w-full flex-col space-y-6 xl:w-[30%]">
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

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{currentPole.htPoleNumber}</h2>
                      <p className="mb-4 text-gray-600">HT Pole #{currentPole.id}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
                          Active
                        </div>
                        <div className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600">
                          Operational
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
                        <span className="text-sm text-gray-600">Status</span>
                        <span className="font-semibold text-green-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type</span>
                        <span className="font-semibold text-gray-900">HT Pole</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Voltage Level</span>
                        <span className="font-semibold text-gray-900">High Tension</span>
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
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <DepartmentInfoIcon />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <p className="font-semibold text-green-600">Active</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">HT Pole Number</label>
                        <p className="font-semibold text-gray-900">{currentPole.htPoleNumber}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Asset Type</label>
                        <p className="font-semibold text-gray-900">High Tension Pole</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Technical Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Zap className="size-5" />
                      Technical Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Zap className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Voltage Level</label>
                            <p className="font-semibold text-gray-900">High Tension (HT)</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <MapPin className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Infrastructure Type</label>
                            <p className="font-semibold text-gray-900">Transmission Pole</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> This HT Pole is part of the electrical transmission infrastructure and is
                        used for supporting high voltage power lines.
                      </p>
                    </div>
                  </motion.div>

                  {/* System Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <SettingOutlineIcon />
                      System Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Record Type</label>
                          <p className="font-semibold text-gray-900">Asset Record</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Data Source</label>
                          <p className="font-semibold text-gray-900">Asset Management System</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Sync Status</label>
                          <p className="font-semibold text-green-600">Synchronized</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Maintenance</label>
                          <p className="font-semibold text-gray-900">Regular Schedule</p>
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

export default PoleDetailsPage
