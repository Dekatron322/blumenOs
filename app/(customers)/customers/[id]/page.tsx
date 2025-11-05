"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Clock, Edit3, Mail, MapPin, Phone, Power, Share2, User } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import UpdateStatusModal from "components/ui/Modal/update-status-modal"
import SuspendAccountModal from "components/ui/Modal/suspend-account-modal"
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

interface Customer {
  id: string
  accountNumber: string
  customerName: string
  customerType: "PREPAID" | "POSTPAID"
  serviceBand: string
  tariffClass: string
  region: string
  businessUnit: string
  feederId: string | null
  transformerId: string | null
  address: string
  phoneNumber: string
  email: string
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  outstandingArrears: string
  createdAt: string
  updatedAt: string
  meters: any[]
  prepaidAccount: any | null
  postpaidAccount: any | null
}

interface Asset {
  serialNo: number
  supplyStructureType?: string
  company: string
  feederName?: string
  transformerCapacityKva?: number
  status?: string
}

// Modern data generation
const generateSampleCustomer = (id: string): Customer => {
  const firstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn"]
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
  const streets = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine St", "Elm Blvd", "View Rd", "Lake Ave"]
  const cities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
  ]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]!
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]!
  const street = `${Math.floor(Math.random() * 1000) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`
  const city = cities[Math.floor(Math.random() * cities.length)]

  return {
    id,
    accountNumber: `ACC${80000 + Math.floor(Math.random() * 20000)}`,
    customerName: `${firstName} ${lastName}`,
    customerType: Math.random() > 0.5 ? "PREPAID" : "POSTPAID",
    serviceBand: ["Band A", "Band B", "Band C"][Math.floor(Math.random() * 3)]!,
    tariffClass: ["R1", "R2", "R3", "C1", "C2"][Math.floor(Math.random() * 5)]!,
    region: ["North", "South", "East", "West"][Math.floor(Math.random() * 4)]!,
    businessUnit: ["Commercial", "Residential", "Industrial"][Math.floor(Math.random() * 3)]!,
    feederId: Math.random() > 0.3 ? `FD-${1000 + Math.floor(Math.random() * 900)}` : null,
    transformerId: Math.random() > 0.3 ? `TR-${2000 + Math.floor(Math.random() * 800)}` : null,
    address: `${street}, ${city}`,
    phoneNumber: `+1 (${555 + Math.floor(Math.random() * 445)}) ${100 + Math.floor(Math.random() * 900)}-${
      1000 + Math.floor(Math.random() * 9000)
    }`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    status: ["ACTIVE", "INACTIVE", "SUSPENDED"][Math.floor(Math.random() * 3)] as "ACTIVE" | "INACTIVE" | "SUSPENDED",
    outstandingArrears: (Math.random() * 2500).toFixed(2),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    meters: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
      id: `MTR-${3000 + i}`,
      type: ["Smart", "Digital", "Analog"][Math.floor(Math.random() * 3)],
      installedDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    })),
    prepaidAccount:
      Math.random() > 0.5
        ? {
            balance: (Math.random() * 500).toFixed(2),
            lastTopUp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          }
        : null,
    postpaidAccount:
      Math.random() > 0.5
        ? {
            lastBill: (Math.random() * 300).toFixed(2),
            dueDate: new Date(Date.now() + Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
          }
        : null,
  }
}

const generateRandomAssets = (count: number): Asset[] => {
  return Array.from({ length: count }, (_, index) => ({
    serialNo: index + 1,
    supplyStructureType: ["OVERHEAD", "UNDERGROUND", "POLES"][Math.floor(Math.random() * 3)],
    company: "EnergyCorp",
    feederName: [`Main Feeder ${index + 1}`, `Secondary ${index + 1}`, `Backup ${index + 1}`][
      Math.floor(Math.random() * 3)
    ],
    transformerCapacityKva: [50, 100, 200, 500][Math.floor(Math.random() * 4)],
    status: ["ACTIVE", "MAINTENANCE", "UPGRADING"][Math.floor(Math.random() * 3)],
  }))
}

const CustomerDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<"suspend" | "reminder" | "status" | null>(null)

  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const customerData = generateSampleCustomer(customerId)
      const customerAssets = generateRandomAssets(2)

      setCustomer(customerData)
      setAssets(customerAssets)
      setIsLoading(false)
    }

    if (customerId) {
      fetchCustomerData()
    }
  }, [customerId])

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
      INACTIVE: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
      SUSPENDED: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertCircle },
    }
    return configs[status as keyof typeof configs] || configs.INACTIVE
  }

  const getCustomerTypeConfig = (type: string) => {
    return type === "PREPAID"
      ? { color: "text-blue-600", bg: "bg-blue-50" }
      : { color: "text-purple-600", bg: "bg-purple-50" }
  }

  const closeAllModals = () => setActiveModal(null)
  const openModal = (modalType: "suspend" | "reminder" | "status") => setActiveModal(modalType)

  const handleConfirmSuspend = () => {
    console.log("Customer suspended")
    closeAllModals()
  }

  const handleConfirmReminder = (message: string) => {
    console.log("Reminder sent:", message)
    closeAllModals()
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Customer Not Found</h1>
          <p className="mb-6 text-gray-600">The customer you're looking for doesn't exist.</p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Customers
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(customer.status)
  const typeConfig = getCustomerTypeConfig(customer.customerType)
  const StatusIcon = statusConfig.icon

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-16   py-4">
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
                          {customer.customerName
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

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{customer.customerName}</h2>
                      <p className="mb-4 text-gray-600">Account #{customer.accountNumber}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          {customer.status}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${typeConfig.bg} ${typeConfig.color}`}
                        >
                          {customer.customerType}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <PhoneOutlineIcon />
                          {customer.phoneNumber}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <EmailOutlineIcon />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapOutlineIcon className="size-4" />
                          {customer.region}
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
                        Suspend Account
                      </ButtonModule>
                    </div>
                  </motion.div>

                  {/* Financial Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border  bg-white p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <FinanceOutlineIcon />
                      Financial Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="mb-2 text-3xl font-bold text-gray-900">
                          ₦{parseFloat(customer.outstandingArrears).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Outstanding Balance</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {customer.prepaidAccount && (
                          <div className="text-center">
                            <div className="text-lg font-semibold text-emerald-600">
                              ₦{parseFloat(customer.prepaidAccount.balance).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Prepaid Balance</div>
                          </div>
                        )}
                        {customer.postpaidAccount && (
                          <div className="text-center">
                            <div className="text-lg font-semibold text-amber-600">
                              ₦{parseFloat(customer.postpaidAccount.lastBill).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Last Bill</div>
                          </div>
                        )}
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
                          <p className="font-semibold text-gray-900">{customer.accountNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Customer Type</label>
                          <p className="font-semibold text-gray-900">{customer.customerType}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Tariff Class</label>
                          <p className="font-semibold text-gray-900">{customer.tariffClass}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Business Unit</label>
                          <p className="font-semibold text-gray-900">{customer.businessUnit}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Service Band</label>
                          <p className="font-semibold text-gray-900">{customer.serviceBand}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Region</label>
                          <p className="font-semibold text-gray-900">{customer.region}</p>
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
                            <p className="font-semibold text-gray-900">{customer.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <Mail className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email Address</label>
                            <p className="font-semibold text-gray-900">{customer.email}</p>
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
                            <p className="font-semibold text-gray-900">{customer.address}</p>
                          </div>
                        </div>
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
                      {customer.meters.map((meter, index) => (
                        <div
                          key={meter.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                              <MeterOutlineIcon className="size-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{meter.id}</h4>
                              <p className="text-sm text-gray-600">
                                {meter.type} Meter • Installed {new Date(meter.installedDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">Active</div>
                            <div className="text-xs text-gray-600">Last reading: 2 days ago</div>
                          </div>
                        </div>
                      ))}
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
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <CalendarOutlineIcon className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Account Created</h4>
                            <p className="text-sm text-gray-600">Customer account was successfully created</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(customer.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <CalendarOutlineIcon className="size-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Last Updated</h4>
                            <p className="text-sm text-gray-600">Account information was updated</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(customer.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(customer.updatedAt).toLocaleTimeString()}
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

      <UpdateStatusModal isOpen={activeModal === "status"} onRequestClose={closeAllModals} customer={customer} />
    </section>
  )
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column Skeleton */}
        <div className="space-y-6 xl:col-span-1">
          <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded-2xl bg-gray-200"></div>
              <div className="mx-auto mb-2 h-6 w-32 rounded bg-gray-200"></div>
              <div className="mx-auto mb-4 size-48 rounded bg-gray-200"></div>
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
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-6 xl:col-span-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 h-6 w-48 rounded bg-gray-200"></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
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

export default CustomerDetailsPage
