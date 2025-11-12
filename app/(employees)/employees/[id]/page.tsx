"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Edit3, Mail, MapPin, Phone, Power, Share2, Shield, User } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import SuspendAccountModal from "components/ui/Modal/suspend-account-modal"
import DashboardNav from "components/Navbar/DashboardNav"
import {
  CalendarOutlineIcon,
  DepartmentInfoIcon,
  EmailOutlineIcon,
  EmployeeInfoIcon,
  ExportOutlineIcon,
  MapOutlineIcon,
  NotificationOutlineIcon,
  PhoneOutlineIcon,
  SettingOutlineIcon,
  UpdateUserOutlineIcon,
  UserRoleIcon,
  VerifyOutlineIcon,
} from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearEmployeeDetails, fetchEmployeeDetails } from "lib/redux/employeeSlice"

const EmployeeDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const employeeId = params.id as string

  // Get employee details from Redux store
  const { employeeDetails, employeeDetailsLoading, employeeDetailsError, employeeDetailsSuccess } = useAppSelector(
    (state) => state.employee
  )

  const [activeModal, setActiveModal] = useState<"suspend" | "reminder" | "status" | null>(null)

  useEffect(() => {
    if (employeeId) {
      const id = parseInt(employeeId)
      if (!isNaN(id)) {
        dispatch(fetchEmployeeDetails(id))
      }
    }

    // Cleanup function to clear employee details when component unmounts
    return () => {
      dispatch(clearEmployeeDetails())
    }
  }, [dispatch, employeeId])

  const getStatusConfig = (status: boolean) => {
    const configs = {
      true: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle,
        label: "ACTIVE",
      },
      false: {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: AlertCircle,
        label: "INACTIVE",
      },
    }
    return configs[status.toString() as keyof typeof configs] || configs.false
  }

  const getEmploymentTypeConfig = (type: string) => {
    const configs = {
      FULL_TIME: { color: "text-blue-600", bg: "bg-blue-50" },
      PART_TIME: { color: "text-purple-600", bg: "bg-purple-50" },
      CONTRACT: { color: "text-orange-600", bg: "bg-orange-50" },
    }
    return configs[type as keyof typeof configs] || configs.FULL_TIME
  }

  const closeAllModals = () => setActiveModal(null)
  const openModal = (modalType: "suspend" | "reminder" | "status") => setActiveModal(modalType)

  const handleConfirmSuspend = () => {
    console.log("Employee suspended")
    closeAllModals()
  }

  const handleConfirmReminder = (message: string) => {
    console.log("Reminder sent:", message)
    closeAllModals()
  }

  const calculateTenure = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const years = now.getFullYear() - created.getFullYear()
    const months = now.getMonth() - created.getMonth()

    if (months < 0) {
      return `${years - 1} years ${12 + months} months`
    }
    return `${years} years ${months} months`
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    // Basic formatting for phone numbers
    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phoneNumber
  }

  if (employeeDetailsLoading) {
    return <LoadingSkeleton />
  }

  if (employeeDetailsError || !employeeDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {employeeDetailsError ? "Error Loading Employee" : "Employee Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">
            {employeeDetailsError || "The employee you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Employees
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(employeeDetails.isActive)
  const employmentTypeConfig = getEmploymentTypeConfig(employeeDetails.employmentType)
  const StatusIcon = statusConfig.icon
  const tenure = calculateTenure(employeeDetails.createdAt || new Date().toISOString())

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
                      <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
                      <p className="text-gray-600">Complete overview and management</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ButtonModule variant="secondary" size="sm" className="flex items-center gap-2">
                      <ExportOutlineIcon className="size-4" />
                      Export
                    </ButtonModule>
                    <ButtonModule variant="secondary" size="sm" className="flex items-center gap-2">
                      <Share2 className="size-4" />
                      Share
                    </ButtonModule>
                    <ButtonModule variant="primary" size="sm" className="flex items-center gap-2">
                      <Edit3 className="size-4" />
                      Edit
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
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f9f9f9] text-3xl font-bold text-[#0a0a0a]">
                          {employeeDetails.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div
                          className={`absolute -right-1 bottom-1 ${statusConfig.bg} ${statusConfig.border} rounded-full border-2 p-1.5`}
                        >
                          <StatusIcon className={`size-4 ${statusConfig.color}`} />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{employeeDetails.fullName}</h2>
                      <p className="mb-4 text-gray-600">Employee #{employeeDetails.employeeId}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${employmentTypeConfig.bg} ${employmentTypeConfig.color}`}
                        >
                          {employeeDetails.employmentType.replace("_", " ")}
                        </div>
                        {employeeDetails.mustChangePassword && (
                          <div className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-600">
                            Password Reset
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <PhoneOutlineIcon />
                          {formatPhoneNumber(employeeDetails.phoneNumber)}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <EmailOutlineIcon />
                          {employeeDetails.email}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapOutlineIcon className="size-4" />
                          {employeeDetails.areaOfficeName || "Not specified"}
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
                      <SettingOutlineIcon />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-start gap-3"
                        onClick={() => openModal("reminder")}
                      >
                        <NotificationOutlineIcon />
                        Send Reminder
                      </ButtonModule>
                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-start gap-3"
                        onClick={() => openModal("status")}
                      >
                        <UpdateUserOutlineIcon />
                        Update Status
                      </ButtonModule>
                      <ButtonModule
                        variant="danger"
                        className="w-full justify-start gap-3"
                        onClick={() => openModal("suspend")}
                      >
                        <Power className="size-4" />
                        {employeeDetails.isActive ? "Suspend Account" : "Activate Account"}
                      </ButtonModule>
                    </div>
                  </motion.div>

                  {/* Roles & Privileges */}
                  {employeeDetails.roles && employeeDetails.roles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                        <UserRoleIcon />
                        Roles & Permissions
                      </h3>
                      <div className="space-y-3">
                        {employeeDetails.roles.map((role, index) => (
                          <div key={role.roleId} className="rounded-lg bg-[#f9f9f9] p-3">
                            <div className="font-medium text-gray-900">{role.name}</div>
                            <div className="text-sm text-gray-600">{role.category}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:col-span-2">
                  {/* Employment Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <EmployeeInfoIcon />
                      Employment Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Employee ID</label>
                          <p className="font-semibold text-gray-900">{employeeDetails.employeeId}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Position</label>
                          <p className="font-semibold text-gray-900">{employeeDetails.position || "Not specified"}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Account ID</label>
                          <p className="font-semibold text-gray-900">{employeeDetails.accountId}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Department</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.departmentName || "Not assigned"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Employment Type</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.employmentType.replace("_", " ")}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Area Office</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.areaOfficeName || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Supervisor</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.supervisorName || "Not assigned"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <p className="font-semibold text-gray-900">
                            <span className={`inline-flex items-center gap-1 ${statusConfig.color}`}>
                              <StatusIcon className="size-4" />
                              {statusConfig.label}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Password Reset</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.mustChangePassword ? "Required" : "Not required"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact & Personal Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <User className="size-5" />
                      Contact & Personal Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Phone className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone Number</label>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">
                                {formatPhoneNumber(employeeDetails.phoneNumber)}
                              </p>
                              <div className="text-[#f9f9f9]0 text-xs">
                                {employeeDetails.isPhoneVerified ? (
                                  <span className="text-emerald-600">✓ Verified</span>
                                ) : (
                                  <span className="text-amber-600">Not verified</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <Mail className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email Address</label>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{employeeDetails.email}</p>
                              <div className="text-[#f9f9f9]0 text-xs">
                                {employeeDetails.isEmailVerified ? (
                                  <span className="text-emerald-600">✓ Verified</span>
                                ) : (
                                  <span className="text-amber-600">Not verified</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <MapPin className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Address</label>
                            <p className="font-semibold text-gray-900">{employeeDetails.address || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                            <Shield className="size-5 text-red-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                            <p className="font-semibold text-gray-900">
                              {employeeDetails.emergencyContact || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Department Information */}
                  {employeeDetails.departmentName && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <DepartmentInfoIcon />
                        Department Information
                      </h3>
                      <div className="grid grid-cols-1 gap-4  md:grid-cols-3">
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Department</label>
                            <p className="font-semibold text-gray-900">{employeeDetails.departmentName}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Area Office</label>
                            <p className="font-semibold text-gray-900">
                              {employeeDetails.areaOfficeName || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Supervisor</label>
                            <p className="font-semibold text-gray-900">
                              {employeeDetails.supervisorName || "Not assigned"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* System Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <CalendarOutlineIcon />
                      System Information
                    </h3>
                    <div className=" grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Account Created</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.createdAt
                              ? new Date(employeeDetails.createdAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Account Updated</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.updatedAt
                              ? new Date(employeeDetails.updatedAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Last Updated</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.updatedAt
                              ? new Date(employeeDetails.updatedAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Privileges Information */}
                  {employeeDetails.privileges && employeeDetails.privileges.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <VerifyOutlineIcon />
                        System Privileges
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {employeeDetails.privileges.map((privilege, index) => (
                          <div key={index} className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <div className="font-medium text-gray-900">{privilege.name}</div>
                            <div className="text-sm text-gray-600">{privilege.category}</div>
                            {privilege.actions && privilege.actions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {privilege.actions.map((action, actionIndex) => (
                                  <span
                                    key={actionIndex}
                                    className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                                  >
                                    {action}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SuspendAccountModal
        isOpen={activeModal === "suspend"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmSuspend}
      />

      <SendReminderModal
        isOpen={activeModal === "reminder"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmReminder}
      />

      {/* <UpdateStatusModal isOpen={activeModal === "status"} onRequestClose={closeAllModals} employee={employeeDetails} /> */}
    </section>
  )
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-gray-100">
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
                <div className="absolute -right-1 bottom-1 h-6 w-6 rounded-full bg-gray-200"></div>
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

          {/* Roles Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-16 w-full rounded bg-gray-200"></div>
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

export default EmployeeDetailsPage
