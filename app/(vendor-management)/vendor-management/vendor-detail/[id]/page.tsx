"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Power,
  PowerOff,
  Shield,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import TopUpWalletModal from "components/ui/Modal/top-up-wallet"
import SuspendVendorModal from "components/ui/Modal/suspend-vendor-modal"
import UpdateCommissionModal from "components/ui/Modal/update-commission-modal"
import GenerateApiKeyModal from "components/ui/Modal/generate-api-key-modal"
import VendorChangeRequestModal from "components/ui/Modal/vendor-change-request-modal"
import VendorChangeRequestsTab from "components/Tabs/vendor-change-requests-tab"
import VendorPaymentsTab from "components/Tabs/vendor-payments-tab"
import DashboardNav from "components/Navbar/DashboardNav"
import {
  BasicInfoOutlineIcon,
  CalendarOutlineIcon,
  ChangeRequestOutlineIcon,
  DepartmentInfoIcon,
  EmailOutlineIcon,
  EmployeeInfoIcon,
  ExportOutlineIcon,
  MapOutlineIcon,
  PasswordOutlineIcon,
  PaymentDisputeOutlineIcon,
  PhoneOutlineIcon,
  PostpaidBillOutlineIcon,
  SettingOutlineIcon,
  UserRoleIcon,
  VerifyOutlineIcon,
} from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentVendor, clearVendorWallet, fetchVendorById, fetchVendorWallet } from "lib/redux/vendorSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const VendorDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const vendorId = params.id as string

  // Get vendor details from Redux store
  const {
    currentVendor,
    currentVendorLoading,
    currentVendorError,
    vendorWallet,
    vendorWalletLoading,
    vendorWalletError,
  } = useAppSelector((state) => state.vendors)

  // Get current user to check privileges
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  type TabType = "details" | "payments" | "change-requests"

  const [activeModal, setActiveModal] = useState<
    | "suspend"
    | "activate"
    | "reminder"
    | "status"
    | "edit"
    | "resetPassword"
    | "generateApiKey"
    | "changeRequest"
    | "updateCommission"
    | null
  >(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("details")

  useEffect(() => {
    if (vendorId) {
      const id = parseInt(vendorId)
      if (!isNaN(id)) {
        dispatch(fetchVendorById(id))
        dispatch(fetchVendorWallet(id))
      }
    }

    // Cleanup function to clear vendor details when component unmounts
    return () => {
      dispatch(clearCurrentVendor())
      dispatch(clearVendorWallet())
    }
  }, [dispatch, vendorId])

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle,
        label: "ACTIVE",
      },
      INACTIVE: {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: AlertCircle,
        label: "INACTIVE",
      },
      PENDING: {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: AlertCircle,
        label: "PENDING",
      },
      SUSPENDED: {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: AlertCircle,
        label: "SUSPENDED",
      },
    }
    return configs[status as keyof typeof configs] || configs.INACTIVE
  }

  const getServiceConfig = (canProcess: boolean) => {
    return canProcess
      ? { color: "text-emerald-600", bg: "bg-emerald-50", label: "ENABLED" }
      : { color: "text-gray-600", bg: "bg-gray-50", label: "DISABLED" }
  }

  const getBalanceConfig = (balance: number) => {
    if (balance > 10000) {
      return { color: "text-emerald-600", bg: "bg-emerald-50", label: "HIGH" }
    } else if (balance > 1000) {
      return { color: "text-amber-600", bg: "bg-amber-50", label: "MEDIUM" }
    } else {
      return { color: "text-red-600", bg: "bg-red-50", label: "LOW" }
    }
  }

  const closeAllModals = () => setActiveModal(null)
  const openModal = (
    modalType:
      | "suspend"
      | "activate"
      | "reminder"
      | "status"
      | "edit"
      | "resetPassword"
      | "generateApiKey"
      | "changeRequest"
      | "updateCommission"
  ) => setActiveModal(modalType)

  const handleConfirmSuspend = () => {
    console.log("Vendor suspended")
    closeAllModals()
  }

  const handleConfirmReminder = (message: string) => {
    console.log("Reminder sent:", message)
    closeAllModals()
  }

  const handleUpdateSuccess = () => {
    // Refresh vendor details after successful update
    if (vendorId) {
      const id = parseInt(vendorId)
      if (!isNaN(id)) {
        dispatch(fetchVendorById(id))
        dispatch(fetchVendorWallet(id))
      }
    }
    closeAllModals()
  }

  const handleChangeRequestSuccess = () => {
    // Refresh vendor details after successful change request
    if (vendorId) {
      const id = parseInt(vendorId)
      if (!isNaN(id)) {
        dispatch(fetchVendorById(id))
        dispatch(fetchVendorWallet(id))
      }
    }
    closeAllModals()
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phoneNumber
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

  const formatCommission = (commission: number) => {
    return `${commission}%`
  }

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const refreshWallet = () => {
    if (vendorId) {
      const id = parseInt(vendorId)
      if (!isNaN(id)) {
        dispatch(fetchVendorWallet(id))
      }
    }
  }

  const exportToPDF = async () => {
    if (!currentVendor) return

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
      doc.text("VENDOR RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Vendor Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Vendor Profile Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("VENDOR PROFILE", 14, yPosition)
      yPosition += 10

      // Profile table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Vendor Name", currentVendor.name],
          ["Vendor ID", currentVendor.id.toString()],
          ["Account ID", currentVendor.accountId],
          ["BlumenPay ID", currentVendor.blumenpayId],
          ["Status", currentVendor.status],
          ["Suspended", currentVendor.isSuspended ? "Yes" : "No"],
          ["Commission", formatCommission(currentVendor.commission)],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Vendor Wallet Section
      if (vendorWallet) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("VENDOR WALLET", 14, yPosition)
        yPosition += 10

        autoTable(doc, {
          startY: yPosition,
          head: [["Field", "Details"]],
          body: [
            ["Current Balance", formatCurrency(vendorWallet.balance, vendorWallet.currency)],
            ["Currency", vendorWallet.currency],
            ["Last Top-up", formatDate(vendorWallet.lastTopUpAt)],
          ],
          theme: "grid",
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }

      // Contact Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("CONTACT INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Contact Method", "Details"]],
        body: [
          ["Email", currentVendor.email],
          ["Phone", formatPhoneNumber(currentVendor.phoneNumber)],
          ["Address", currentVendor.address],
          ["City", currentVendor.city],
          ["State", currentVendor.state],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Service Capabilities
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("SERVICE CAPABILITIES", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Service Type", "Status"]],
        body: [
          ["Postpaid Processing", currentVendor.canProcessPostpaid ? "Enabled" : "Disabled"],
          ["Prepaid Processing", currentVendor.canProcessPrepaid ? "Enabled" : "Disabled"],
        ],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Employee & System Information
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("EMPLOYEE & SYSTEM INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Category", "Details"]],
        body: [
          ["Assigned Employee", currentVendor.employeeName || "Not assigned"],
          ["Employee User ID", currentVendor.employeeUserId?.toString() || "N/A"],
          ["API Key Issued", formatDate(currentVendor.apiKeyIssuedAt)],
          ["API Key Last Used", formatDate(currentVendor.apiKeyLastUsedAt)],
          ["Suspended At", formatDate(currentVendor.suspendedAt)],
          ["Suspension Reason", currentVendor.suspensionReason || "N/A"],
          ["Last Login", formatDate(currentVendor.lastLoginAt)],
        ],
        theme: "grid",
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        styles: { fontSize: 10 },
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
      doc.save(`vendor-record-${currentVendor.blumenpayId}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (currentVendorLoading) {
    return <LoadingSkeleton />
  }

  if (currentVendorError || !currentVendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentVendorError ? "Error Loading Vendor" : "Vendor Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">{currentVendorError || "The vendor you're looking for doesn't exist."}</p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Vendors
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(currentVendor.status)
  const postpaidConfig = getServiceConfig(currentVendor.canProcessPostpaid)
  const prepaidConfig = getServiceConfig(currentVendor.canProcessPrepaid)
  const balanceConfig = vendorWallet ? getBalanceConfig(vendorWallet.balance) : null
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
                      <h1 className="text-2xl font-bold text-gray-900">Vendor Details</h1>
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

                    {canUpdate ? (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => openModal("edit")}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </ButtonModule>
                    ) : (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => openModal("changeRequest")}
                      >
                        <Edit3 className="size-4" />
                        Change Request
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
                  {/* Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f9f9f9] text-3xl font-bold text-[#0a0a0a]">
                          {currentVendor.name
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

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{currentVendor.name}</h2>
                      <p className="mb-4 text-gray-600">Vendor #{currentVendor.blumenpayId}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </div>
                        {currentVendor.isSuspended && (
                          <div className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600">
                            SUSPENDED
                          </div>
                        )}
                        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
                          Commission: {formatCommission(currentVendor.commission)}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <PhoneOutlineIcon />
                          {formatPhoneNumber(currentVendor.phoneNumber)}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <EmailOutlineIcon />
                          {currentVendor.email}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapOutlineIcon className="size-4" />
                          {currentVendor.city}, {currentVendor.state}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Vendor Wallet Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                        <Wallet className="size-5" />
                        Vendor Wallet
                      </h3>
                      <button
                        onClick={refreshWallet}
                        disabled={vendorWalletLoading}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                        title="Refresh wallet"
                      >
                        <svg
                          className={`size-4 ${vendorWalletLoading ? "animate-spin" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    </div>

                    {vendorWalletLoading ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-8 w-1/2 rounded bg-gray-200"></div>
                        <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                      </div>
                    ) : vendorWalletError ? (
                      <div className="rounded-md bg-red-50 p-3">
                        <div className="flex items-center gap-2 text-sm text-red-700">
                          <AlertCircle className="size-4" />
                          <span>Failed to load wallet</span>
                        </div>
                        <button onClick={refreshWallet} className="mt-2 text-xs text-red-600 hover:text-red-800">
                          Try again
                        </button>
                      </div>
                    ) : vendorWallet ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className={`rounded-lg ${balanceConfig?.bg} p-4`}>
                            <p className="text-sm font-medium text-gray-600">Current Balance</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(vendorWallet.balance, vendorWallet.currency)}
                            </p>
                            {balanceConfig && (
                              <div
                                className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${balanceConfig.color}`}
                              >
                                {balanceConfig.label} BALANCE
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Currency:</span>
                            <span className="font-medium text-gray-900">{vendorWallet.currency}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Last Top-up:</span>
                            <span className="font-medium text-gray-900">{formatDate(vendorWallet.lastTopUpAt)}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <ButtonModule
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={() => setIsTopUpModalOpen(true)}
                          >
                            <CreditCard className="size-4" />
                            Top Up
                          </ButtonModule>
                          <ButtonModule
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              // TODO: Implement transaction history
                              console.log("View transactions")
                            }}
                          >
                            <TrendingUp className="size-4" />
                            History
                          </ButtonModule>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <Wallet className="mx-auto mb-2 size-8" />
                        <p className="text-sm">Wallet data not available</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Quick Actions */}
                  {canUpdate && (
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
                          onClick={() => openModal("updateCommission")}
                        >
                          <PostpaidBillOutlineIcon />
                          Update Commission
                        </ButtonModule>
                        <ButtonModule
                          variant="primary"
                          className="w-full justify-start gap-3"
                          onClick={() => openModal("generateApiKey")}
                        >
                          <PasswordOutlineIcon size={20} />
                          Generate API Key
                        </ButtonModule>
                        <ButtonModule
                          variant={currentVendor.isSuspended ? "primary" : "danger"}
                          className="w-full justify-start gap-3"
                          onClick={() => openModal(currentVendor.isSuspended ? "activate" : "suspend")}
                        >
                          {currentVendor.isSuspended ? <Power className="size-4" /> : <PowerOff className="size-4" />}
                          {currentVendor.isSuspended ? "Activate Vendor" : "Suspend Vendor"}
                        </ButtonModule>
                      </div>
                    </motion.div>
                  )}

                  {/* Service Capabilities */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <UserRoleIcon />
                      Service Capabilities
                    </h3>
                    <div className="space-y-3">
                      <div className={`rounded-lg p-3 ${postpaidConfig.bg}`}>
                        <div className="font-medium text-gray-900">Postpaid Processing</div>
                        <div className={`text-sm ${postpaidConfig.color}`}>{postpaidConfig.label}</div>
                      </div>
                      <div className={`rounded-lg p-3 ${prepaidConfig.bg}`}>
                        <div className="font-medium text-gray-900">Prepaid Processing</div>
                        <div className={`text-sm ${prepaidConfig.color}`}>{prepaidConfig.label}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Main Content Area - Tabs */}
                <div className="flex w-full flex-col space-y-6 xl:col-span-2">
                  <div className="mb-4">
                    <div className="w-fit rounded-md bg-white p-2">
                      <nav className="-mb-px flex space-x-2">
                        <button
                          onClick={() => setActiveTab("details")}
                          className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                            activeTab === "details"
                              ? "bg-[#0a0a0a] text-white"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                          }`}
                        >
                          <BasicInfoOutlineIcon className="size-5" />
                          <span>Vendor Details</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("payments")}
                          className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                            activeTab === "payments"
                              ? "bg-[#0a0a0a] text-white"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                          }`}
                        >
                          <PaymentDisputeOutlineIcon className="size-5" />
                          <span>Payments</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("change-requests")}
                          className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                            activeTab === "change-requests"
                              ? "bg-[#0a0a0a] text-white"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                          }`}
                        >
                          <ChangeRequestOutlineIcon className="size-5" />
                          <span>Change Requests</span>
                        </button>
                      </nav>
                    </div>
                  </div>

                  {activeTab === "details" ? (
                    <>
                      {/* Vendor Information */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                      >
                        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <EmployeeInfoIcon />
                          Vendor Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Account ID</label>
                            <p className="font-semibold text-gray-900">{currentVendor.accountId}</p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Commission Rate</label>
                            <p className="font-semibold text-gray-900">{formatCommission(currentVendor.commission)}</p>
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
                            <label className="text-sm font-medium text-gray-600">Assigned Employee</label>
                            <p className="font-semibold text-gray-900">
                              {currentVendor.employeeName || "Not assigned"}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Suspension Reason</label>
                            <p className="font-semibold text-gray-900">{currentVendor.suspensionReason || "N/A"}</p>
                          </div>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Suspended</label>
                            <p className="font-semibold text-gray-900">{currentVendor.isSuspended ? "Yes" : "No"}</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Contact & Location Details */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                      >
                        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <User className="size-5" />
                          Contact & Location Details
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                                <Phone className="size-5 text-blue-600" />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                                <p className="font-semibold text-gray-900">
                                  {formatPhoneNumber(currentVendor.phoneNumber)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                                <Mail className="size-5 text-green-600" />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Email Address</label>
                                <p className="font-semibold text-gray-900">{currentVendor.email}</p>
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
                                <p className="font-semibold text-gray-900">{currentVendor.address}</p>
                                <p className="text-sm text-gray-600">
                                  {currentVendor.city}, {currentVendor.state}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Service Capabilities Details */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                      >
                        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                          <DepartmentInfoIcon />
                          Service Capabilities
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-4">
                            <div className={`rounded-lg border border-gray-100 p-4 ${postpaidConfig.bg}`}>
                              <label className="text-sm font-medium text-gray-600">Postpaid Processing</label>
                              <p className={`font-semibold ${postpaidConfig.color}`}>{postpaidConfig.label}</p>
                              <p className="mt-1 text-sm text-gray-600">
                                Ability to process postpaid payment transactions
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className={`rounded-lg border border-gray-100 p-4 ${prepaidConfig.bg}`}>
                              <label className="text-sm font-medium text-gray-600">Prepaid Processing</label>
                              <p className={`font-semibold ${prepaidConfig.color}`}>{prepaidConfig.label}</p>
                              <p className="mt-1 text-sm text-gray-600">
                                Ability to process prepaid payment transactions
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="space-y-4">
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-sm font-medium text-gray-600">API Key Issued</label>
                              <p className="font-semibold text-gray-900">{formatDate(currentVendor.apiKeyIssuedAt)}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-sm font-medium text-gray-600">API Key Last Used</label>
                              <p className="font-semibold text-gray-900">
                                {formatDate(currentVendor.apiKeyLastUsedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                              <label className="text-sm font-medium text-gray-600">Last Login</label>
                              <p className="font-semibold text-gray-900">{formatDate(currentVendor.lastLoginAt)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* API Information */}
                      {currentVendor.apiPublicKey && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                        >
                          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <VerifyOutlineIcon />
                            API Information
                          </h3>
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Public API Key</label>
                            <p className="break-all font-mono text-sm text-gray-900">{currentVendor.apiPublicKey}</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Document URLs */}
                      {currentVendor.documentUrls && currentVendor.documentUrls.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                        >
                          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <Shield className="size-5" />
                            Documents
                          </h3>
                          <div className="space-y-2">
                            {currentVendor.documentUrls.map((url, index) => (
                              <div key={index} className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-3">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="break-all text-blue-600 hover:text-blue-800"
                                >
                                  Document {index + 1}
                                </a>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : activeTab === "payments" ? (
                    <VendorPaymentsTab vendorId={currentVendor.id} />
                  ) : (
                    <VendorChangeRequestsTab vendorId={currentVendor.id} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}

      <SendReminderModal
        isOpen={activeModal === "reminder"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmReminder}
      />

      <TopUpWalletModal
        isOpen={isTopUpModalOpen}
        onRequestClose={() => setIsTopUpModalOpen(false)}
        onSuccess={() => {
          refreshWallet()
          setIsTopUpModalOpen(false)
        }}
        vendorId={currentVendor.id}
        vendorName={currentVendor.name}
        currentBalance={vendorWallet?.balance ?? 0}
        currency={vendorWallet?.currency ?? "NGN"}
      />

      <SuspendVendorModal
        isOpen={activeModal === "suspend"}
        onRequestClose={closeAllModals}
        onSuccess={handleUpdateSuccess}
        vendorId={currentVendor.id}
        vendorName={currentVendor.name}
      />

      <UpdateCommissionModal
        isOpen={activeModal === "updateCommission"}
        onRequestClose={closeAllModals}
        vendorId={currentVendor.id}
        vendorName={currentVendor.name}
        currentCommission={currentVendor.commission}
        onSuccess={handleUpdateSuccess}
      />

      <GenerateApiKeyModal
        isOpen={activeModal === "generateApiKey"}
        onRequestClose={closeAllModals}
        vendorId={currentVendor.id}
        vendorName={currentVendor.name}
        onSuccess={() => {
          handleUpdateSuccess()
        }}
      />

      {/* TODO: Implement UpdateVendorModal */}
      {/* <UpdateVendorModal
        isOpen={activeModal === "edit"}
        onRequestClose={closeAllModals}
        onSuccess={handleUpdateSuccess}
        vendor={currentVendor}
      /> */}

      <VendorChangeRequestModal
        isOpen={activeModal === "changeRequest"}
        onRequestClose={closeAllModals}
        onSuccess={handleChangeRequestSuccess}
        vendorId={currentVendor.id}
        vendorName={currentVendor.name}
      />
    </section>
  )
}

// LoadingSkeleton component for vendor details
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

          {/* Wallet Card Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-8 w-1/2 rounded bg-gray-200"></div>
              <div className="h-3 w-2/3 rounded bg-gray-200"></div>
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

          {/* Service Capabilities Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-16 w-full rounded bg-gray-200"></div>
              <div className="h-16 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4, 5].map((item) => (
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

export default VendorDetailsPage
