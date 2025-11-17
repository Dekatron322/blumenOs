"use client"
import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Clock, Edit3, Mail, MapPin, Phone, Power, Share2, User } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import SuspendCustomerModal from "components/ui/Modal/suspend-customer-modal"
import DashboardNav from "components/Navbar/DashboardNav"
import {
  CalendarOutlineIcon,
  EmailOutlineIcon,
  ExportOutlineIcon,
  FinanceOutlineIcon,
  MapOutlineIcon,
  MeteringOutlineIcon,
  MeterOutlineIcon,
  NotificationOutlineIcon,
  PhoneOutlineIcon,
  SettingOutlineIcon,
  UpdateUserOutlineIcon,
} from "components/Icons/Icons"

import { clearCurrentCustomer, fetchCustomerById } from "lib/redux/customerSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

interface Asset {
  serialNo: number
  supplyStructureType?: string
  company: string
  feederName?: string
  transformerCapacityKva?: number
  status?: string
}

const CustomerDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const customerId = parseInt(params.id as string)

  // Redux hooks
  const dispatch = useAppDispatch()
  const { currentCustomer, currentCustomerLoading, currentCustomerError } = useAppSelector((state) => state.customers)

  const [assets, setAssets] = useState<Asset[]>([])
  const [activeModal, setActiveModal] = useState<"suspend" | "reminder" | "status" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  // Fetch customer data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (customerId && !isNaN(customerId)) {
        setIsLoading(true)
        try {
          await dispatch(fetchCustomerById(customerId))
        } catch (error) {
          console.error("Error fetching customer:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    fetchData()

    // Cleanup when component unmounts
    return () => {
      dispatch(clearCurrentCustomer())
    }
  }, [dispatch, customerId])

  // Generate assets based on customer data
  useEffect(() => {
    if (currentCustomer) {
      const customerAssets = generateRandomAssets(2)
      setAssets(customerAssets)
    }
  }, [currentCustomer])

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
      INACTIVE: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
      SUSPENDED: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertCircle },
    }
    return configs[status as keyof typeof configs] || configs.INACTIVE
  }

  const getCustomerTypeConfig = (isPPM: boolean) => {
    return isPPM
      ? { color: "text-blue-600", bg: "bg-blue-50", label: "PREPAID" }
      : { color: "text-purple-600", bg: "bg-purple-50", label: "POSTPAID" }
  }

  const closeAllModals = () => setActiveModal(null)
  const openModal = (modalType: "suspend" | "reminder" | "status") => setActiveModal(modalType)

  const handleConfirmReminder = (message: string) => {
    console.log("Reminder sent:", message)
    closeAllModals()
  }

  const handleSuspendSuccess = () => {
    // Refresh customer data to get updated suspension status
    dispatch(fetchCustomerById(customerId))
    closeAllModals()
  }

  // Generate random assets (keeping this for now as it's not from API)
  const generateRandomAssets = (count: number): Asset[] => {
    return Array.from({ length: count }, (_, index) => ({
      serialNo: index + 1,
      supplyStructureType: ["OVERHEAD", "UNDERGROUND", "POLES"][Math.floor(Math.random() * 3)],
      company: "EnergyCorp",
      feederName: currentCustomer?.feederName || `Feeder ${index + 1}`,
      transformerCapacityKva: [50, 100, 200, 500][Math.floor(Math.random() * 4)],
      status: ["ACTIVE", "MAINTENANCE", "UPGRADING"][Math.floor(Math.random() * 3)],
    }))
  }

  // Format currency values
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Show loading state
  if (isLoading || currentCustomerLoading) {
    return <LoadingSkeleton />
  }

  // Show error state
  if (currentCustomerError || !currentCustomer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentCustomerError ? "Error Loading Customer" : "Customer Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">
            {currentCustomerError || "The customer you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Customers
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(currentCustomer.status)
  const typeConfig = getCustomerTypeConfig(currentCustomer.isPPM)
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
                      <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
                      <p className="text-gray-600">Complete overview and management</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ButtonModule variant="secondary" size="sm" className="flex items-center gap-2">
                      <ExportOutlineIcon className="size-4" />
                      Export
                    </ButtonModule>

                    {canUpdate ? (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => router.push(`/customers/update-customer/${customerId}`)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </ButtonModule>
                    ) : (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        // onClick={() => openModal("changeRequest")}
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
                          {currentCustomer.fullName
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

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{currentCustomer.fullName}</h2>
                      <p className="mb-4 text-gray-600">Account #{currentCustomer.accountNumber}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          {currentCustomer.status}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${typeConfig.bg} ${typeConfig.color}`}
                        >
                          {typeConfig.label}
                        </div>
                        {currentCustomer.isMD && (
                          <div className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-600">
                            MD CUSTOMER
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <PhoneOutlineIcon />
                          {currentCustomer.phoneNumber}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <EmailOutlineIcon />
                          {currentCustomer.email}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapOutlineIcon className="size-4" />
                          {currentCustomer.state}
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
                        variant={currentCustomer.isSuspended ? "primary" : "danger"}
                        className="w-full justify-start gap-3"
                        onClick={() => openModal("suspend")}
                      >
                        <Power className="size-4" />
                        {currentCustomer.isSuspended ? "Reactivate Account" : "Suspend Account"}
                      </ButtonModule>
                    </div>
                  </motion.div>

                  {/* Financial Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border bg-white p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <FinanceOutlineIcon />
                      Financial Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="mb-2 text-3xl font-bold text-gray-900">
                          {formatCurrency(currentCustomer.customerOutstandingDebtBalance)}
                        </div>
                        <div className="text-sm text-gray-600">Outstanding Balance</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-emerald-600">
                            {formatCurrency(currentCustomer.totalMonthlyVend)}
                          </div>
                          <div className="text-xs text-gray-600">Monthly Vend</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-amber-600">
                            {formatCurrency(currentCustomer.totalMonthlyDebt)}
                          </div>
                          <div className="text-xs text-gray-600">Monthly Debt</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:col-span-2">
                  {/* Account Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <User className="size-5" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Account Number</label>
                          <p className="font-semibold text-gray-900">{currentCustomer.accountNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Customer Type</label>
                          <p className="font-semibold text-gray-900">{typeConfig.label}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Tariff Class</label>
                          <p className="font-semibold text-gray-900">{currentCustomer.band}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Meter Number</label>
                          <p className="font-semibold text-gray-900">{currentCustomer.meterNumber || "Not assigned"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Stored Average</label>
                          <p className="font-semibold text-gray-900">{currentCustomer.storedAverage} kWh</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Tariff</label>
                          <p className="font-semibold text-gray-900">{currentCustomer.tariff}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Area Office</label>
                          <p className="font-semibold text-gray-900">{currentCustomer.areaOfficeName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Service Center</label>
                          <p className="font-semibold text-gray-900">{currentCustomer.serviceCenterName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Company</label>
                          <p className="font-semibold text-gray-900">{currentCustomer.companyName}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact & Location */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <MapOutlineIcon className="size-5" />
                      Contact & Location
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Phone className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone Number</label>
                            <p className="font-semibold text-gray-900">{currentCustomer.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <Mail className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email Address</label>
                            <p className="font-semibold text-gray-900">{currentCustomer.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <MapPin className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Full Address</label>
                            <p className="font-semibold text-gray-900">
                              {currentCustomer.address}
                              {currentCustomer.addressTwo && `, ${currentCustomer.addressTwo}`}
                              {currentCustomer.city && `, ${currentCustomer.city}`}
                              {currentCustomer.state && `, ${currentCustomer.state}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100">
                            <MapPin className="size-5 text-orange-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Coordinates</label>
                            <p className="font-semibold text-gray-900">
                              {currentCustomer.latitude}, {currentCustomer.longitude}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Distribution Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <MeterOutlineIcon className="size-5" />
                      Distribution Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Distribution Substation</label>
                          <p className="font-semibold text-gray-900">{currentCustomer.distributionSubstationCode}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Feeder Name</label>
                          <p className="font-semibold text-gray-900">{currentCustomer.feederName}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {currentCustomer.salesRepUser && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Sales Representative</label>
                            <p className="font-semibold text-gray-900">{currentCustomer.salesRepUser.fullName}</p>
                            <p className="text-sm text-gray-600">{currentCustomer.salesRepUser.email}</p>
                          </div>
                        )}
                        {currentCustomer.technicalEngineerUser && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Technical Engineer</label>
                            <p className="font-semibold text-gray-900">
                              {currentCustomer.technicalEngineerUser.fullName}
                            </p>
                            <p className="text-sm text-gray-600">{currentCustomer.technicalEngineerUser.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Assets & Equipment */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <MeterOutlineIcon className="size-5" />
                      Assets & Equipment
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {assets.map((asset, index) => (
                        <div key={asset.serialNo} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
                              <MeterOutlineIcon className="size-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Asset #{asset.serialNo}</h4>
                              <p className="text-sm text-gray-600">{asset.supplyStructureType}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Feeder</span>
                              <span className="font-medium">{asset.feederName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Capacity</span>
                              <span className="font-medium">{asset.transformerCapacityKva}kVA</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status</span>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  asset.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : asset.status === "MAINTENANCE"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-blue-50 text-blue-600"
                                }`}
                              >
                                {asset.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Meter Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <MeteringOutlineIcon className="size-5" />
                      Meter Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <MeterOutlineIcon className="size-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {currentCustomer.meterNumber || "No meter assigned"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {currentCustomer.isPPM ? "Prepaid" : "Postpaid"} Meter • {currentCustomer.band} Band
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {currentCustomer.isPPM ? "Prepaid" : "Postpaid"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {currentCustomer.isMD ? "MD Customer" : "Standard Customer"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Account Timeline */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <CalendarOutlineIcon className="size-5" />
                      Account Timeline
                    </h3>
                    <div className="space-y-4">
                      {currentCustomer.lastLoginAt && (
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                              <CalendarOutlineIcon className="size-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Last Login</h4>
                              <p className="text-sm text-gray-600">Customer last accessed their account</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(currentCustomer.lastLoginAt)}
                            </div>
                          </div>
                        </div>
                      )}
                      {currentCustomer.isSuspended && currentCustomer.suspendedAt && (
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                              <CalendarOutlineIcon className="size-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Account Suspended</h4>
                              <p className="text-sm text-gray-600">
                                {currentCustomer.suspensionReason || "No reason provided"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(currentCustomer.suspendedAt)}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <CalendarOutlineIcon className="size-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Account Created</h4>
                            <p className="text-sm text-gray-600">Customer account was successfully created</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {currentCustomer.createdAt ? formatDate(currentCustomer.createdAt) : "Unknown"}
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

      {/* Modals */}
      <SendReminderModal
        isOpen={activeModal === "reminder"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmReminder}
      />

      <SuspendCustomerModal
        isOpen={activeModal === "suspend"}
        onRequestClose={closeAllModals}
        customerId={customerId}
        customerName={currentCustomer.fullName}
        accountNumber={currentCustomer.accountNumber}
        onSuccess={handleSuspendSuccess}
      />

      {/* <UpdateStatusModal isOpen={activeModal === "status"} onRequestClose={closeAllModals} customer={currentCustomer} /> */}
    </section>
  )
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

          {/* Quick Actions Skeleton */}
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
              <div className="h-10 w-full overflow-hidden rounded bg-gray-200">
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
              <div className="h-10 w-full overflow-hidden rounded bg-gray-200">
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
              <div className="h-10 w-full overflow-hidden rounded bg-gray-200">
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

          {/* Financial Overview Skeleton */}
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
              <div className="text-center">
                <div className="mx-auto mb-2 h-8 w-32 overflow-hidden rounded bg-gray-200">
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
                <div className="mx-auto h-4 w-24 overflow-hidden rounded bg-gray-200">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="mx-auto mb-1 h-6 w-20 overflow-hidden rounded bg-gray-200">
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
                  <div className="mx-auto h-3 w-16 overflow-hidden rounded bg-gray-200">
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
                <div className="text-center">
                  <div className="mx-auto mb-1 h-6 w-20 overflow-hidden rounded bg-gray-200">
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
                  <div className="mx-auto h-3 w-16 overflow-hidden rounded bg-gray-200">
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
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                            delay: item * 0.1 + subItem * 0.1 + 0.25,
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
                            delay: item * 0.1 + subItem * 0.1 + 0.3,
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

export default CustomerDetailsPage
