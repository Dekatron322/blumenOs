"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Edit3,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
  StopCircle,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import AgentChangeRequestModal from "components/ui/Modal/agent-change-request-modal"
import { ExportOutlineIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { Agent, clearCurrentAgent, fetchAgentById } from "lib/redux/agentSlice"
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
                <div className="absolute -right-1 bottom-1 size-6 rounded-full bg-gray-200"></div>
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

const AgentDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const agentId = params.id as string

  // Get agent details from Redux store
  const { currentAgent, currentAgentLoading, currentAgentError } = useAppSelector((state) => state.agents)
  const { user } = useAppSelector((state) => state.auth)

  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [isExporting, setIsExporting] = useState(false)
  const [activeAction, setActiveAction] = useState<"edit" | "deactivate" | "activate" | "resetPassword" | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false)

  useEffect(() => {
    if (agentId) {
      const id = parseInt(agentId)
      if (!isNaN(id)) {
        dispatch(fetchAgentById(id))
      }
    }

    // Cleanup function to clear agent details when component unmounts
    return () => {
      dispatch(clearCurrentAgent())
    }
  }, [dispatch, agentId])

  const getStatusConfig = (status: string): { color: string; bg: string; border: string; icon: any; label: string } => {
    const configs: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
      ACTIVE: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle,
        label: "ACTIVE",
      },
      INACTIVE: {
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
        icon: XCircle,
        label: "INACTIVE",
      },
      SUSPENDED: {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: AlertCircle,
        label: "SUSPENDED",
      },
      PENDING: {
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: Clock,
        label: "PENDING",
      },
    }
    return (configs[status] ?? configs["INACTIVE"])!
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return num?.toLocaleString() || "0"
  }

  const exportToPDF = async () => {
    if (!currentAgent) return

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
      doc.text("AGENT DETAILS REPORT", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text(`Agent: ${currentAgent.user.fullName}`, pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Agent Overview Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("AGENT OVERVIEW", 14, yPosition)
      yPosition += 10

      const statusConfig = getStatusConfig(currentAgent.status)

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Agent ID", currentAgent.id.toString()],
          ["Agent Code", currentAgent.agentCode],
          ["Full Name", currentAgent.user.fullName],
          ["Email", currentAgent.user.email],
          ["Phone", currentAgent.user.phoneNumber],
          ["Status", statusConfig.label],
          ["Can Collect Cash", currentAgent.canCollectCash ? "Yes" : "No"],
          ["Cash Collection Limit", formatCurrency(currentAgent.cashCollectionLimit)],
          ["Cash at Hand", formatCurrency(currentAgent.cashAtHand)],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Employment Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("EMPLOYMENT INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Employee ID", currentAgent.user.employeeId],
          ["Position", currentAgent.user.position],
          ["Employment Type", currentAgent.user.employmentType],
          ["Employment Start", formatDate(currentAgent.user.employmentStartAt)],
          ["Employment End", formatDate(currentAgent.user.employmentEndAt) || "N/A"],
          ["Department", currentAgent.user.departmentName],
          ["Area Office", currentAgent.areaOfficeName],
          ["Service Center", currentAgent.serviceCenterName || "N/A"],
          ["Supervisor", currentAgent.user.supervisorName || "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Account Information
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("ACCOUNT INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Account ID", currentAgent.user.accountId],
          ["Last Login", formatDate(currentAgent.user.lastLoginAt) || "Never"],
          ["Created At", formatDate(currentAgent.user.createdAt)],
          ["Last Updated", formatDate(currentAgent.user.lastUpdated)],
          ["Email Verified", currentAgent.user.isEmailVerified ? "Yes" : "No"],
          ["Phone Verified", currentAgent.user.isPhoneVerified ? "Yes" : "No"],
          ["Must Change Password", currentAgent.user.mustChangePassword ? "Yes" : "No"],
          ["Is Active", currentAgent.user.isActive ? "Yes" : "No"],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Roles and Privileges
      if (currentAgent.user.roles.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("ROLES", 14, yPosition)
        yPosition += 10

        const rolesData = currentAgent.user.roles.map((role) => [role.name, role.slug, role.category])

        autoTable(doc, {
          startY: yPosition,
          head: [["Role Name", "Slug", "Category"]],
          body: rolesData,
          theme: "grid",
          headStyles: { fillColor: [245, 158, 11], textColor: 255 },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }

      // Cash Clearances
      if (currentAgent.cashClearances.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("CASH CLEARANCES", 14, yPosition)
        yPosition += 10

        const clearancesData = currentAgent.cashClearances.map((clearance) => [
          formatDate(clearance.clearedAt),
          formatCurrency(clearance.amountCleared),
          clearance.collectionOfficer.fullName,
          clearance.clearedBy.fullName,
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [["Cleared At", "Amount", "Collection Officer", "Cleared By"]],
          body: clearancesData,
          theme: "grid",
          headStyles: { fillColor: [239, 68, 68], textColor: 255 },
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
      doc.save(`agent-${currentAgent.agentCode}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleEditAgent = () => {
    if (!currentAgent) return
    console.log("Editing agent:", currentAgent.id)
    setActiveAction("edit")
    // TODO: Implement actual edit logic
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleToggleActivation = () => {
    if (!currentAgent) return
    const action = currentAgent.status === "ACTIVE" ? "deactivate" : "activate"
    console.log(`${action} agent:`, currentAgent.id)
    setActiveAction(action)
    // TODO: Implement actual activation/deactivation logic
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleResetPassword = () => {
    if (!currentAgent) return
    console.log("Resetting password for agent:", currentAgent.id)
    setActiveAction("resetPassword")
    // TODO: Implement actual password reset logic
    setTimeout(() => setActiveAction(null), 2000)
  }

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  if (currentAgentLoading) {
    return <LoadingSkeleton />
  }

  if (currentAgentError || !currentAgent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentAgentError ? "Error Loading Agent" : "Agent Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">{currentAgentError || "The agent you're looking for doesn't exist."}</p>
          <ButtonModule variant="primary" onClick={() => router.push("/agents")}>
            Back to Agents
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(currentAgent.status)
  const StatusIcon = statusConfig.icon

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
                      <h1 className="text-2xl font-bold text-gray-900">Agent Details</h1>
                      <p className="text-gray-600">Complete agent profile and management</p>
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

                    {canUpdate ? (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleEditAgent}
                        disabled={activeAction === "edit"}
                      >
                        <Edit3 className="size-4" />
                        {activeAction === "edit" ? "Editing..." : "Edit Agent"}
                      </ButtonModule>
                    ) : (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setIsChangeRequestModalOpen(true)}
                      >
                        <Edit3 className="size-4" />
                        Change Request
                      </ButtonModule>
                    )}

                    <ButtonModule
                      variant={currentAgent.status === "ACTIVE" ? "danger" : "success"}
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleToggleActivation}
                      disabled={activeAction === "deactivate" || activeAction === "activate"}
                    >
                      {currentAgent.status === "ACTIVE" ? (
                        <>
                          <StopCircle className="size-4" />
                          {activeAction === "deactivate" ? "Deactivating..." : "Deactivate"}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="size-4" />
                          {activeAction === "activate" ? "Activating..." : "Activate"}
                        </>
                      )}
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-16 py-8">
              <div className="flex w-full gap-6">
                {/* Left Column - Profile & Quick Actions */}
                <div className="flex w-[30%] flex-col space-y-6 xl:col-span-1">
                  {/* Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        {currentAgent.user.profilePicture ? (
                          <img
                            src={currentAgent.user.profilePicture}
                            alt={currentAgent.user.fullName}
                            className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                            {currentAgent.user.fullName.charAt(0)}
                          </div>
                        )}
                        <div
                          className={`absolute -right-1 bottom-1 ${statusConfig.bg} ${statusConfig.border} rounded-full border-2 p-1.5`}
                        >
                          <StatusIcon className={`size-4 ${statusConfig.color}`} />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{currentAgent.user.fullName}</h2>
                      <p className="mb-4 text-gray-600">{currentAgent.user.position}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </div>
                        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
                          {currentAgent.agentCode}
                        </div>
                        {currentAgent.canCollectCash && (
                          <div className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600">
                            Cash Collector
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail className="size-4" />
                          {currentAgent.user.email}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone className="size-4" />
                          {currentAgent.user.phoneNumber}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapPin className="size-4" />
                          {currentAgent.areaOfficeName}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="size-4" />
                          Joined {formatDate(currentAgent.user.createdAt)}
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
                      <ButtonModule
                        variant="primary"
                        className="w-full justify-start gap-3"
                        onClick={handleEditAgent}
                        disabled={activeAction === "edit"}
                      >
                        <Edit3 className="size-4" />
                        {activeAction === "edit" ? "Editing..." : "Edit Profile"}
                      </ButtonModule>

                      <ButtonModule
                        variant={currentAgent.status === "ACTIVE" ? "danger" : "success"}
                        className="w-full justify-start gap-3"
                        onClick={handleToggleActivation}
                        disabled={activeAction === "deactivate" || activeAction === "activate"}
                      >
                        {currentAgent.status === "ACTIVE" ? (
                          <>
                            <StopCircle className="size-4" />
                            {activeAction === "deactivate" ? "Deactivating..." : "Deactivate Agent"}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="size-4" />
                            {activeAction === "activate" ? "Activating..." : "Activate Agent"}
                          </>
                        )}
                      </ButtonModule>

                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-start gap-3"
                        onClick={handleResetPassword}
                        disabled={activeAction === "resetPassword"}
                      >
                        <Shield className="size-4" />
                        {activeAction === "resetPassword" ? "Resetting..." : "Reset Password"}
                      </ButtonModule>

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

                  {/* Cash Statistics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Wallet className="size-4" />
                      Cash Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cash at Hand:</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(currentAgent.cashAtHand)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Collection Limit:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(currentAgent.cashCollectionLimit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Collection:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {currentAgent.lastCashCollectionDate
                            ? formatDate(currentAgent.lastCashCollectionDate)
                            : "Never"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Can Collect Cash:</span>
                        <span
                          className={`font-semibold ${currentAgent.canCollectCash ? "text-green-600" : "text-red-600"}`}
                        >
                          {currentAgent.canCollectCash ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:col-span-2">
                  {/* Agent Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <User className="size-5" />
                      Agent Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                        <label className="text-sm font-medium text-gray-600">Agent Code</label>
                        <p className="font-semibold text-gray-900">{currentAgent.agentCode}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                        <label className="text-sm font-medium text-gray-600">Account ID</label>
                        <p className="font-semibold text-gray-900">{currentAgent.user.accountId}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <p className="font-semibold text-gray-900">
                          <span className={`inline-flex items-center gap-1 ${statusConfig.color}`}>
                            <StatusIcon className="size-4" />
                            {statusConfig.label}
                          </span>
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                        <label className="text-sm font-medium text-gray-600">Employee ID</label>
                        <p className="font-semibold text-gray-900">{currentAgent.user.employeeId}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                        <label className="text-sm font-medium text-gray-600">Employment Type</label>
                        <p className="font-semibold text-gray-900">{currentAgent.user.employmentType}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                        <label className="text-sm font-medium text-gray-600">Department</label>
                        <p className="font-semibold text-gray-900">{currentAgent.user.departmentName || "N/A"}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                        <label className="text-sm font-medium text-gray-600">Area Office</label>
                        <p className="font-semibold text-gray-900">{currentAgent.areaOfficeName || "N/A"}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                        <label className="text-sm font-medium text-gray-600">Service Center</label>
                        <p className="font-semibold text-gray-900">{currentAgent.serviceCenterName || "N/A"}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Personal Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <User className="size-5" />
                        Personal Information
                      </h3>
                      <button
                        onClick={() => toggleSection("personal")}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        {expandedSection === "personal" ? "Show Less" : "Show More"}
                        <ChevronDown
                          className={`size-4 transition-transform ${
                            expandedSection === "personal" ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <User className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Full Name</label>
                            <p className="font-semibold text-gray-900">{currentAgent.user.fullName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <Mail className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email Address</label>
                            <p className="font-semibold text-gray-900">{currentAgent.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <Phone className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone Number</label>
                            <p className="font-semibold text-gray-900">{currentAgent.user.phoneNumber}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100">
                            <Home className="size-5 text-amber-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Address</label>
                            <p className="font-semibold text-gray-900">{currentAgent.user.address || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                            <Users className="size-5 text-red-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                            <p className="font-semibold text-gray-900">{currentAgent.user.emergencyContact || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100">
                            <User className="size-5 text-indigo-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Supervisor</label>
                            <p className="font-semibold text-gray-900">{currentAgent.user.supervisorName || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional personal info (collapsible) */}
                    {expandedSection === "personal" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
                      >
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <label className="text-sm font-medium text-gray-600">Email Verification</label>
                          <p
                            className={`font-semibold ${
                              currentAgent.user.isEmailVerified ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {currentAgent.user.isEmailVerified ? "Verified" : "Not Verified"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <label className="text-sm font-medium text-gray-600">Phone Verification</label>
                          <p
                            className={`font-semibold ${
                              currentAgent.user.isPhoneVerified ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {currentAgent.user.isPhoneVerified ? "Verified" : "Not Verified"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <label className="text-sm font-medium text-gray-600">Password Change Required</label>
                          <p
                            className={`font-semibold ${
                              currentAgent.user.mustChangePassword ? "text-amber-600" : "text-green-600"
                            }`}
                          >
                            {currentAgent.user.mustChangePassword ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <label className="text-sm font-medium text-gray-600">User Active</label>
                          <p
                            className={`font-semibold ${
                              currentAgent.user.isActive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {currentAgent.user.isActive ? "Yes" : "No"}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Employment Timeline */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Calendar className="size-5" />
                      Employment Timeline
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <label className="text-sm font-medium text-gray-600">Employment Start</label>
                          <p className="font-semibold text-gray-900">
                            {formatDate(currentAgent.user.employmentStartAt)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <label className="text-sm font-medium text-gray-600">Account Created</label>
                          <p className="font-semibold text-gray-900">{formatDate(currentAgent.user.createdAt)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <label className="text-sm font-medium text-gray-600">Employment End</label>
                          <p className="font-semibold text-gray-900">
                            {currentAgent.user.employmentEndAt ? formatDate(currentAgent.user.employmentEndAt) : "N/A"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <label className="text-sm font-medium text-gray-600">Last Updated</label>
                          <p className="font-semibold text-gray-900">{formatDate(currentAgent.user.lastUpdated)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <label className="text-sm font-medium text-gray-600">Last Login</label>
                          <p className="font-semibold text-gray-900">
                            {currentAgent.user.lastLoginAt ? formatDate(currentAgent.user.lastLoginAt) : "Never"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2">
                          <label className="text-sm font-medium text-gray-600">Last Cash Collection</label>
                          <p className="font-semibold text-gray-900">
                            {currentAgent.lastCashCollectionDate
                              ? formatDate(currentAgent.lastCashCollectionDate)
                              : "Never"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Roles and Privileges */}
                  {currentAgent.user.roles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <Shield className="size-5" />
                          Roles and Privileges
                        </h3>
                        <button
                          onClick={() => toggleSection("roles")}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {expandedSection === "roles" ? "Show Less" : "Show All"}
                          <ChevronDown
                            className={`size-4 transition-transform ${expandedSection === "roles" ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {currentAgent.user.roles
                          .slice(0, expandedSection === "roles" ? currentAgent.user.roles.length : 2)
                          .map((role, index) => (
                            <div key={role.roleId} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                              <div className=" flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900">{role.name}</h4>
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
                                  {role.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{role.slug}</p>

                              {/* Show privileges for this role if expanded */}
                              {expandedSection === "roles" &&
                                currentAgent.user.privileges.filter((p) => p.category === role.category).length > 0 && (
                                  <div className="mt-3 border-t pt-3">
                                    <p className="mb-2 text-sm font-medium text-gray-700">Privileges:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {currentAgent.user.privileges
                                        .filter((p) => p.category === role.category)
                                        .map((privilege) => (
                                          <span
                                            key={privilege.key}
                                            className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                                          >
                                            {privilege.name}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ))}
                      </div>

                      {/* Show count if there are more roles */}
                      {currentAgent.user.roles.length > 2 && expandedSection !== "roles" && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => toggleSection("roles")}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + {currentAgent.user.roles.length - 2} more roles
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Cash Clearances */}
                  {currentAgent.cashClearances.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <CreditCard className="size-5" />
                          Cash Clearance History
                        </h3>
                        <button
                          onClick={() => toggleSection("clearances")}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {expandedSection === "clearances" ? "Show Less" : "Show All"}
                          <ChevronDown
                            className={`size-4 transition-transform ${
                              expandedSection === "clearances" ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Cleared At
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Amount
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Collection Officer
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Cleared By
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Notes
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {currentAgent.cashClearances
                              .slice(0, expandedSection === "clearances" ? currentAgent.cashClearances.length : 3)
                              .map((clearance, index) => (
                                <tr key={clearance.id} className="hover:bg-gray-50">
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                                    {formatDate(clearance.clearedAt)}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-green-600">
                                    {formatCurrency(clearance.amountCleared)}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                                    {clearance.collectionOfficer.fullName}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                                    {clearance.clearedBy.fullName}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{clearance.notes || "—"}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Show count if there are more clearances */}
                      {currentAgent.cashClearances.length > 3 && expandedSection !== "clearances" && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => toggleSection("clearances")}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + {currentAgent.cashClearances.length - 3} more clearances
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Cash Statistics Visualization */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Wallet className="size-5" />
                      Cash Management
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex justify-between text-sm text-gray-600">
                          <span>Cash at Hand vs Collection Limit</span>
                          <span>
                            {formatCurrency(currentAgent.cashAtHand)} /{" "}
                            {formatCurrency(currentAgent.cashCollectionLimit)}
                          </span>
                        </div>
                        <div className="h-4 w-full rounded-full bg-gray-200">
                          <div
                            className={`h-4 rounded-full transition-all duration-1000 ${
                              currentAgent.cashAtHand / currentAgent.cashCollectionLimit > 0.8
                                ? "bg-red-500"
                                : currentAgent.cashAtHand / currentAgent.cashCollectionLimit > 0.5
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (currentAgent.cashAtHand / currentAgent.cashCollectionLimit) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {((currentAgent.cashAtHand / currentAgent.cashCollectionLimit) * 100).toFixed(1)}% of limit
                          used
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-blue-50 p-4">
                          <div className="text-sm font-medium text-blue-600">Cash at Hand</div>
                          <div className="text-2xl font-bold text-blue-900">
                            {formatCurrency(currentAgent.cashAtHand)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-green-50 p-4">
                          <div className="text-sm font-medium text-green-600">Collection Limit</div>
                          <div className="text-2xl font-bold text-green-900">
                            {formatCurrency(currentAgent.cashCollectionLimit)}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-600">Cash Collection Status</div>
                            <div
                              className={`text-lg font-bold ${
                                currentAgent.canCollectCash ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {currentAgent.canCollectCash ? "Authorized" : "Not Authorized"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600">Last Collection</div>
                            <div className="text-lg font-bold text-gray-900">
                              {currentAgent.lastCashCollectionDate
                                ? formatDate(currentAgent.lastCashCollectionDate)
                                : "Never"}
                            </div>
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

      <AgentChangeRequestModal
        isOpen={isChangeRequestModalOpen}
        onRequestClose={() => setIsChangeRequestModalOpen(false)}
        agentId={currentAgent.id}
        agentName={currentAgent.user.fullName}
        agentCode={currentAgent.agentCode}
      />
    </section>
  )
}

export default AgentDetailsPage
