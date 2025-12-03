"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { notify } from "components/ui/Notification/Notification"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Edit3,
  FileText,
  Home,
  Key,
  Lock,
  RefreshCw,
  Shield,
  StopCircle,
  Tag,
  Trash2,
  Users,
  XCircle,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { CalendarOutlineIcon, ExportOutlineIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearCurrentRole,
  clearDeleteRoleState,
  deleteRole,
  fetchRoleById,
  Role as ReduxRole,
} from "lib/redux/roleSlice"

// Delete Confirmation Modal Component
interface DeleteRoleModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: () => void
  loading: boolean
  roleName: string
}

const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({ isOpen, onRequestClose, onConfirm, loading, roleName }) => {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[450px] max-w-md overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="size-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delete Role</h2>
              <p className="text-sm text-gray-600">Confirm role deletion</p>
            </div>
          </div>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-700">Warning: This action cannot be undone</h3>
                <p className="mt-1 text-sm text-red-600">
                  Deleting this role will permanently remove it from the system. Users assigned to this role will lose
                  their permissions.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              Are you sure you want to delete the role{" "}
              <span className="font-bold text-gray-900">&quot;{roleName}&quot;</span>?
            </p>
            <p className="mt-2 text-sm text-gray-600">This action will:</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="mt-0.5 size-1.5 rounded-full bg-red-500"></div>
                <span>Permanently delete the role</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 size-1.5 rounded-full bg-red-500"></div>
                <span>Remove role from all assigned users</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 size-1.5 rounded-full bg-red-500"></div>
                <span>Delete all associated permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 size-1.5 rounded-full bg-red-500"></div>
                <span>This action cannot be undone</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <ButtonModule variant="secondary" size="lg" className="flex-1" onClick={onRequestClose} disabled={loading}>
              Cancel
            </ButtonModule>
            <ButtonModule variant="danger" size="lg" className="flex-1" onClick={onConfirm} disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="mr-2 size-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Delete Role
                </>
              )}
            </ButtonModule>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

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

          {/* System Info Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
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

const RoleDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const roleId = params.id as string

  // Get role details from Redux store
  const { currentRole, currentRoleLoading, currentRoleError, deleteRoleLoading, deleteRoleSuccess, deleteRoleError } =
    useAppSelector((state) => state.roles)
  const { user } = useAppSelector((state) => state.auth)

  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [isExporting, setIsExporting] = useState(false)
  const [activeAction, setActiveAction] = useState<"edit" | "duplicate" | "permissions" | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>("privileges")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Handle delete success
  useEffect(() => {
    if (deleteRoleSuccess) {
      notify("success", "Role deleted successfully", {
        description: `The role "${currentRole?.name || ""}" has been removed.`,
      })
      setIsDeleteModalOpen(false)
      // Navigate to roles list after successful deletion
      router.push("/roles")
      // Clear delete state
      dispatch(clearDeleteRoleState())
    }
  }, [deleteRoleSuccess, router, dispatch])

  // Handle delete error
  useEffect(() => {
    if (deleteRoleError) {
      // You might want to show an error toast here
      console.error("Delete role error:", deleteRoleError)
      notify("error", "Failed to delete role", {
        description: typeof deleteRoleError === "string" ? deleteRoleError : "An unexpected error occurred.",
      })
    }
  }, [deleteRoleError])

  useEffect(() => {
    if (roleId) {
      const id = parseInt(roleId)
      if (!isNaN(id)) {
        dispatch(fetchRoleById(id))
      }
    }

    // Cleanup function to clear role details when component unmounts
    return () => {
      dispatch(clearCurrentRole())
    }
  }, [dispatch, roleId])

  const getSystemRoleConfig = (isSystem: boolean): { color: string; bg: string; icon: any; label: string } => {
    return {
      color: isSystem ? "text-purple-600" : "text-blue-600",
      bg: isSystem ? "bg-purple-50" : "bg-blue-50",
      icon: isSystem ? Lock : Users,
      label: isSystem ? "System Role" : "Custom Role",
    }
  }

  const getActionLabel = (action: number): string => {
    const actions = []
    if (action & 1) actions.push("C") // Create
    if (action & 2) actions.push("R") // Read
    if (action & 4) actions.push("U") // Update
    if (action & 8) actions.push("D") // Delete
    if (action & 16) actions.push("A") // Approve
    if (action & 32) actions.push("V") // View All
    return actions.join(", ")
  }

  const getAvailableActionsLabel = (action: number): string => {
    const actions = []
    if (action & 1) actions.push("Create")
    if (action & 2) actions.push("Read")
    if (action & 4) actions.push("Update")
    if (action & 8) actions.push("Delete")
    if (action & 16) actions.push("Approve")
    if (action & 32) actions.push("View All")
    return actions.join(", ")
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const exportToPDF = async () => {
    if (!currentRole) return

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
      doc.text("ROLE DETAILS REPORT", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text(`Role: ${currentRole.name}`, pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Role Overview Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("ROLE OVERVIEW", 14, yPosition)
      yPosition += 10

      const systemConfig = getSystemRoleConfig(currentRole.isSystem)

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Role ID", currentRole.id.toString()],
          ["Role Name", currentRole.name],
          ["Role Slug", currentRole.slug],
          ["Category", currentRole.category],
          ["Type", systemConfig.label],
          ["Description", currentRole.description || "N/A"],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Privileges Section
      if (currentRole.privileges && currentRole.privileges.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("PRIVILEGES & PERMISSIONS", 14, yPosition)
        yPosition += 10

        const privilegesData = currentRole.privileges.map((privilege) => [
          privilege.privilegeName,
          privilege.privilegeCategory,
          getActionLabel(privilege.actions),
          getAvailableActionsLabel(privilege.availableActions),
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [["Privilege Name", "Category", "Current Actions", "Available Actions"]],
          body: privilegesData,
          theme: "grid",
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15

        // Summary Statistics
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("PERMISSIONS SUMMARY", 14, yPosition)
        yPosition += 10

        const totalPrivileges = currentRole.privileges.length
        const categories = Array.from(new Set(currentRole.privileges.map((p) => p.privilegeCategory)))
        const totalActions = currentRole.privileges.reduce((sum, p) => {
          let actionCount = 0
          // Only count core CRUD actions in metrics (C, R, U, D)
          if (p.actions & 1) actionCount++ // C
          if (p.actions & 2) actionCount++ // R
          if (p.actions & 4) actionCount++ // U
          if (p.actions & 8) actionCount++ // D
          return sum + actionCount
        }, 0)

        autoTable(doc, {
          startY: yPosition,
          head: [["Metric", "Value"]],
          body: [
            ["Total Privileges", totalPrivileges.toString()],
            ["Categories", categories.join(", ")],
            ["Total Actions Granted (CRUD only)", totalActions.toString()],
            ["Average Actions per Privilege (CRUD)", (totalActions / totalPrivileges).toFixed(1)],
          ],
          theme: "grid",
          headStyles: { fillColor: [139, 92, 246], textColor: 255 },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        })
      }

      // Add footer with system info
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10)
        doc.text(`System Role: ${currentRole.isSystem ? "Yes" : "No"}`, 14, pageHeight - 10)
      }

      // Save the PDF
      doc.save(`role-${currentRole.slug}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleEditRole = () => {
    if (!currentRole) return
    console.log("Editing role:", currentRole.id)
    setActiveAction("edit")
    router.push(`/roles/edit/${currentRole.id}`)
  }

  const handleDuplicateRole = () => {
    if (!currentRole) return
    console.log("Duplicating role:", currentRole.id)
    setActiveAction("duplicate")
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleManagePermissions = () => {
    if (!currentRole) return
    console.log("Managing permissions for role:", currentRole.id)
    setActiveAction("permissions")
    setTimeout(() => setActiveAction(null), 2000)
  }

  const handleDeleteRole = () => {
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteRole = async () => {
    if (!currentRole) return

    try {
      const result = await dispatch(deleteRole(currentRole.id))
      // The useEffect will handle navigation on success
    } catch (error) {
      console.error("Failed to delete role:", error)
    }
  }

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  if (currentRoleLoading) {
    return <LoadingSkeleton />
  }

  if (currentRoleError || !currentRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentRoleError ? "Error Loading Role" : "Role Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">{currentRoleError || "The role you're looking for doesn't exist."}</p>
          <ButtonModule variant="primary" onClick={() => router.push("/roles")}>
            Back to Roles
          </ButtonModule>
        </div>
      </div>
    )
  }

  const systemConfig = getSystemRoleConfig(currentRole.isSystem)
  const SystemIcon = systemConfig.icon

  return (
    <section className="size-full">
      {/* Delete Confirmation Modal */}
      <DeleteRoleModal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteRole}
        loading={deleteRoleLoading}
        roleName={currentRole.name}
      />

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
                      <h1 className="text-2xl font-bold text-gray-900">Role Details</h1>
                      <p className="text-gray-600">Complete role profile and permissions management</p>
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

                    {!currentRole.isSystem && canUpdate && (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleEditRole}
                        disabled={activeAction === "edit"}
                      >
                        <Edit3 className="size-4" />
                        {activeAction === "edit" ? "Editing..." : "Edit Role"}
                      </ButtonModule>
                    )}

                    {/* {!currentRole.isSystem && (
                      <ButtonModule
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleDuplicateRole}
                        disabled={activeAction === "duplicate"}
                      >
                        <FileText className="size-4" />
                        {activeAction === "duplicate" ? "Duplicating..." : "Duplicate"}
                      </ButtonModule>
                    )} */}

                    {!currentRole.isSystem && canUpdate && (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleManagePermissions}
                        disabled={activeAction === "permissions"}
                      >
                        <Shield className="size-4" />
                        {activeAction === "permissions" ? "Managing..." : "Permissions"}
                      </ButtonModule>
                    )}

                    {!currentRole.isSystem && canUpdate && (
                      <ButtonModule
                        variant="danger"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleDeleteRole}
                        disabled={deleteRoleLoading}
                      >
                        <Trash2 className="size-4" />
                        {deleteRoleLoading ? "Deleting..." : "Delete Role"}
                      </ButtonModule>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-16 py-8">
              <div className="flex w-full gap-6">
                {/* Left Column - Profile & Quick Actions */}
                <div className="flex w-[30%] flex-col space-y-6 xl:col-span-1">
                  {/* Role Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div
                          className={`mx-auto mb-4 flex size-20 items-center justify-center rounded-full ${systemConfig.bg}`}
                        >
                          <SystemIcon className={`size-10 ${systemConfig.color}`} />
                        </div>
                        <div
                          className={`absolute -right-1 bottom-1 ${systemConfig.bg} rounded-full border-2 border-white p-1.5`}
                        >
                          <SystemIcon className={`size-4 ${systemConfig.color}`} />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{currentRole.name}</h2>
                      <p className="mb-4 text-sm text-gray-600">{currentRole.slug}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${systemConfig.bg} ${systemConfig.color}`}
                        >
                          {systemConfig.label}
                        </div>
                        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
                          {currentRole.category}
                        </div>
                        {currentRole.privileges && (
                          <div className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600">
                            {currentRole.privileges.length} Privileges
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="text-left text-gray-600">
                          <div className="mb-1 font-medium">Description:</div>
                          <p className="text-gray-700">{currentRole.description || "No description provided."}</p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Tag className="size-4" />
                          <span className="font-medium">Category:</span> {currentRole.category}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Key className="size-4" />
                          <span className="font-medium">Slug:</span> {currentRole.slug}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Shield className="size-4" />
                          <span className="font-medium">System Role:</span> {currentRole.isSystem ? "Yes" : "No"}
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
                      {!currentRole.isSystem && canUpdate && (
                        <ButtonModule
                          variant="primary"
                          className="w-full justify-start gap-3"
                          onClick={handleEditRole}
                          disabled={activeAction === "edit"}
                        >
                          <Edit3 className="size-4" />
                          {activeAction === "edit" ? "Editing..." : "Edit Role"}
                        </ButtonModule>
                      )}

                      {!currentRole.isSystem && canUpdate && (
                        <ButtonModule
                          variant="primary"
                          className="w-full justify-start gap-3"
                          onClick={handleManagePermissions}
                          disabled={activeAction === "permissions"}
                        >
                          <Shield className="size-4" />
                          {activeAction === "permissions" ? "Managing..." : "Manage Permissions"}
                        </ButtonModule>
                      )}

                      {/* {!currentRole.isSystem && (
                        <ButtonModule
                          variant="secondary"
                          className="w-full justify-start gap-3"
                          onClick={handleDuplicateRole}
                          disabled={activeAction === "duplicate"}
                        >
                          <FileText className="size-4" />
                          {activeAction === "duplicate" ? "Duplicating..." : "Duplicate Role"}
                        </ButtonModule>
                      )} */}

                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-start gap-3"
                        onClick={() => router.push(`/assign/${currentRole.id}`)}
                      >
                        <Users className="size-4" />
                        Assign to Users
                      </ButtonModule>

                      {!currentRole.isSystem && canUpdate && (
                        <ButtonModule
                          variant="danger"
                          className="w-full justify-start gap-3"
                          onClick={handleDeleteRole}
                          disabled={deleteRoleLoading}
                        >
                          <Trash2 className="size-4" />
                          {deleteRoleLoading ? "Deleting..." : "Delete Role"}
                        </ButtonModule>
                      )}
                    </div>
                  </motion.div>

                  {/* System Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Shield className="size-4" />
                      System Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Role Type:</span>
                        <span className={`font-semibold ${systemConfig.color}`}>{systemConfig.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="font-semibold text-gray-900">{currentRole.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Slug:</span>
                        <span className="font-semibold text-gray-900">{currentRole.slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Editable:</span>
                        <span className={`font-semibold ${currentRole.isSystem ? "text-red-600" : "text-green-600"}`}>
                          {currentRole.isSystem ? "No" : "Yes"}
                        </span>
                      </div>
                      {currentRole.privileges && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Privileges:</span>
                          <span className="font-semibold text-blue-600">{currentRole.privileges.length}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:col-span-2">
                  {/* Role Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Tag className="size-5" />
                      Role Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">Role ID</label>
                        <p className="mt-1 font-semibold text-gray-900">{currentRole.id}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">Role Name</label>
                        <p className="mt-1 font-semibold text-gray-900">{currentRole.name}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">Role Slug</label>
                        <p className="mt-1 font-semibold text-gray-900">{currentRole.slug}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">Category</label>
                        <p className="mt-1 font-semibold text-gray-900">{currentRole.category}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">System Role</label>
                        <p
                          className={`mt-1 font-semibold ${currentRole.isSystem ? "text-purple-600" : "text-blue-600"}`}
                        >
                          {currentRole.isSystem ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">Editable</label>
                        <p className={`mt-1 font-semibold ${currentRole.isSystem ? "text-red-600" : "text-green-600"}`}>
                          {currentRole.isSystem ? "No (System Role)" : "Yes"}
                        </p>
                      </div>
                      <div className="col-span-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">Description</label>
                        <p className="mt-1 text-gray-700">{currentRole.description || "No description provided."}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Privileges and Permissions */}
                  {currentRole.privileges && currentRole.privileges.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <Shield className="size-5" />
                          Privileges and Permissions
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{currentRole.privileges.length} privilege(s)</span>
                          <button
                            onClick={() => toggleSection("privileges")}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            {expandedSection === "privileges" ? "Show Less" : "Show All"}
                            <ChevronDown
                              className={`size-4 transition-transform ${
                                expandedSection === "privileges" ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Categories Filter */}
                      {expandedSection === "privileges" && (
                        <div className="mb-6">
                          <div className="mb-4 flex flex-wrap gap-2">
                            <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
                            {Array.from(new Set(currentRole.privileges.map((p) => p.privilegeCategory))).map(
                              (category) => (
                                <button
                                  key={category}
                                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                >
                                  {category}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {currentRole.privileges
                          .slice(0, expandedSection === "privileges" ? currentRole.privileges.length : 5)
                          .map((privilege, index) => (
                            <motion.div
                              key={privilege.privilegeId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="rounded-lg border border-gray-100 bg-gray-50 p-4 hover:bg-gray-100"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900">{privilege.privilegeName}</h4>
                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
                                      {privilege.privilegeCategory}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-600">{privilege.privilegeKey}</p>

                                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                      <div className="text-xs font-medium text-gray-500">Current Actions</div>
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {getActionLabel(privilege.actions)
                                          .split(", ")
                                          .map((action) => (
                                            <span
                                              key={action}
                                              className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                                            >
                                              {action}
                                            </span>
                                          ))}
                                      </div>
                                      <div className="mt-1 text-xs text-gray-500">
                                        Binary: {privilege.actions.toString(2).padStart(6, "0")}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-medium text-gray-500">Available Actions</div>
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {getAvailableActionsLabel(privilege.availableActions)
                                          .split(", ")
                                          .map((action) => (
                                            <span
                                              key={action}
                                              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                                            >
                                              {action}
                                            </span>
                                          ))}
                                      </div>
                                      <div className="mt-1 text-xs text-gray-500">
                                        Binary: {privilege.availableActions.toString(2).padStart(6, "0")}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>

                      {/* Show more button if there are more privileges */}
                      {currentRole.privileges.length > 5 && expandedSection !== "privileges" && (
                        <div className="mt-6 text-center">
                          <button
                            onClick={() => toggleSection("privileges")}
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Show all {currentRole.privileges.length} privileges
                            <ChevronDown className="size-4" />
                          </button>
                        </div>
                      )}

                      {/* Permissions Summary */}
                      {expandedSection === "privileges" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-8 border-t pt-6"
                        >
                          <h4 className="mb-4 text-lg font-semibold text-gray-900">Permissions Summary</h4>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-lg bg-blue-50 p-4">
                              <div className="text-sm font-medium text-blue-600">Total Privileges</div>
                              <div className="text-3xl font-bold text-blue-900">{currentRole.privileges.length}</div>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4">
                              <div className="text-sm font-medium text-green-600">Categories</div>
                              <div className="text-3xl font-bold text-green-900">
                                {Array.from(new Set(currentRole.privileges.map((p) => p.privilegeCategory))).length}
                              </div>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-4">
                              <div className="text-sm font-medium text-purple-600">Total Actions</div>
                              <div className="text-3xl font-bold text-purple-900">
                                {currentRole.privileges.reduce((sum, p) => {
                                  let actionCount = 0
                                  if (p.actions & 1) actionCount++ // C
                                  if (p.actions & 2) actionCount++ // R
                                  if (p.actions & 4) actionCount++ // U
                                  if (p.actions & 8) actionCount++ // D
                                  if (p.actions & 16) actionCount++ // A
                                  if (p.actions & 32) actionCount++ // V
                                  return sum + actionCount
                                }, 0)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Permissions Matrix */}
                  {currentRole.privileges && currentRole.privileges.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <Shield className="size-5" />
                          Permissions Matrix
                        </h3>
                        <button
                          onClick={() => toggleSection("matrix")}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {expandedSection === "matrix" ? "Hide Matrix" : "Show Matrix"}
                          <ChevronDown
                            className={`size-4 transition-transform ${
                              expandedSection === "matrix" ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {expandedSection === "matrix" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Privilege
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Category
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    C
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    R
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    U
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    D
                                  </th>
                                  {/* <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    A
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    V
                                  </th> */}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {currentRole.privileges.map((privilege) => (
                                  <tr key={privilege.privilegeId} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                      {privilege.privilegeName}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                      {privilege.privilegeCategory}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex justify-center">
                                        {privilege.actions & 1 ? (
                                          <CheckCircle className="size-5 text-green-500" />
                                        ) : (
                                          <XCircle className="size-5 text-gray-300" />
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex justify-center">
                                        {privilege.actions & 2 ? (
                                          <CheckCircle className="size-5 text-green-500" />
                                        ) : (
                                          <XCircle className="size-5 text-gray-300" />
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex justify-center">
                                        {privilege.actions & 4 ? (
                                          <CheckCircle className="size-5 text-green-500" />
                                        ) : (
                                          <XCircle className="size-5 text-gray-300" />
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex justify-center">
                                        {privilege.actions & 8 ? (
                                          <CheckCircle className="size-5 text-green-500" />
                                        ) : (
                                          <XCircle className="size-5 text-gray-300" />
                                        )}
                                      </div>
                                    </td>
                                    {/* <td className="px-4 py-3">
                                      <div className="flex justify-center">
                                        {privilege.actions & 16 ? (
                                          <CheckCircle className="size-5 text-green-500" />
                                        ) : (
                                          <XCircle className="size-5 text-gray-300" />
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex justify-center">
                                        {privilege.actions & 32 ? (
                                          <CheckCircle className="size-5 text-green-500" />
                                        ) : (
                                          <XCircle className="size-5 text-gray-300" />
                                        )}
                                      </div>
                                    </td> */}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="mt-6 rounded-lg bg-gray-50 p-4">
                            <h4 className="mb-2 text-sm font-medium text-gray-700">Legend:</h4>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">C:</span> Create
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">R:</span> Read
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">U:</span> Update
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">D:</span> Delete
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Usage Statistics */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Users className="size-5" />
                      Role Usage
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="text-sm font-medium text-blue-600">Users with this Role</div>
                        <div className="text-3xl font-bold text-blue-900">0</div>
                        <div className="mt-1 text-xs text-blue-500">(Data not available)</div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-4">
                        <div className="text-sm font-medium text-green-600">Active Users</div>
                        <div className="text-3xl font-bold text-green-900">0</div>
                        <div className="mt-1 text-xs text-green-500">(Data not available)</div>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-4">
                        <div className="text-sm font-medium text-purple-600">Last Assigned</div>
                        <div className="text-lg font-bold text-purple-900">Never</div>
                        <div className="mt-1 text-xs text-purple-500">No assignment data</div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => router.push(`/assign/${currentRole.id}`)}
                      >
                        <Users className="size-4" />
                        Manage User Assignments
                      </ButtonModule>
                    </div>
                  </motion.div>

                  {/* Audit Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Clock className="size-5" />
                      Audit Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">Created Date</label>
                        <p className="mt-1 text-gray-900">N/A</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">Last Modified</label>
                        <p className="mt-1 text-gray-900">N/A</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">Created By</label>
                        <p className="mt-1 text-gray-900">System</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <label className="block text-sm font-medium text-gray-600">Modified By</label>
                        <p className="mt-1 text-gray-900">System</p>
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

export default RoleDetailsPage
