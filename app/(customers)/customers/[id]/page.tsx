"use client"
import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Clock, Edit3, Power } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import SuspendCustomerModal from "components/ui/Modal/suspend-customer-modal"
import ActivateCustomerModal from "components/ui/Modal/activate-customer-modal"
import CustomerChangeRequestModal from "components/ui/Modal/customer-change-request-modal"
import DashboardNav from "components/Navbar/DashboardNav"
import {
  EmailOutlineIcon,
  ExportOutlineIcon,
  FinanceOutlineIcon,
  MapOutlineIcon,
  NotificationOutlineIcon,
  PhoneOutlineIcon,
  SettingOutlineIcon,
} from "components/Icons/Icons"

import {
  clearCurrentCustomer,
  fetchCustomerById,
  fetchPaymentDisputes,
  PaymentDisputesRequestParams,
} from "lib/redux/customerSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

// Import tab components
import BasicInfoTab from "components/Tabs/basic-info-tab"
import PaymentDisputesTab from "components/Tabs/payment-disputes-tab"
import ChangeRequestsTab from "components/Tabs/change-requests-tab"
import LoadingSkeleton from "components/Loader/loading-skeleton"

interface Asset {
  serialNo: number
  supplyStructureType?: string
  company: string
  feederName?: string
  transformerCapacityKva?: number
  status?: string
}

// Tab types
type TabType = "basic-info" | "payment-disputes" | "change-requests"

const CustomerDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const customerId = parseInt(params.id as string)

  // Redux hooks
  const dispatch = useAppDispatch()
  const {
    currentCustomer,
    currentCustomerLoading,
    currentCustomerError,
    paymentDisputes,
    paymentDisputesLoading,
    paymentDisputesError,
    paymentDisputesPagination,
  } = useAppSelector((state) => state.customers)

  const [assets, setAssets] = useState<Asset[]>([])
  const [activeModal, setActiveModal] = useState<
    "suspend" | "reminder" | "status" | "activate" | "changeRequest" | null
  >(null)
  const [activeTab, setActiveTab] = useState<TabType>("basic-info")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  // Payment disputes state
  const [paymentDisputesPage, setPaymentDisputesPage] = useState(1)
  const [paymentDisputesPageSize, setPaymentDisputesPageSize] = useState(10)

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

  // Fetch payment disputes when tab is active
  useEffect(() => {
    if (activeTab === "payment-disputes" && customerId && !isNaN(customerId)) {
      const params: PaymentDisputesRequestParams & { customerId: number } = {
        customerId,
        pageNumber: paymentDisputesPage,
        pageSize: paymentDisputesPageSize,
      }
      dispatch(fetchPaymentDisputes(params))
    }
  }, [activeTab, customerId, paymentDisputesPage, paymentDisputesPageSize, dispatch])

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
  const openModal = (modalType: "suspend" | "reminder" | "status" | "activate" | "changeRequest") =>
    setActiveModal(modalType)

  const handleConfirmReminder = (message: string) => {
    console.log("Reminder sent:", message)
    closeAllModals()
  }

  const handleSuspendSuccess = () => {
    // Refresh customer data to get updated suspension status
    dispatch(fetchCustomerById(customerId))
    closeAllModals()
  }

  const handleActivateSuccess = () => {
    // Refresh customer data to get updated activation status
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

  // Format date with time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Handle payment disputes pagination
  const handlePaymentDisputesPageChange = (page: number) => {
    setPaymentDisputesPage(page)
  }

  const handlePaymentDisputesPageSizeChange = (size: number) => {
    setPaymentDisputesPageSize(size)
    setPaymentDisputesPage(1) // Reset to first page when changing page size
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

  // Render the appropriate content based on active tab
  const renderTabContent = () => {
    const commonProps = {
      currentCustomer,
      formatCurrency,
      formatDate,
      formatDateTime,
    }

    if (activeTab === "basic-info") {
      return <BasicInfoTab {...commonProps} assets={assets} />
    } else if (activeTab === "payment-disputes") {
      return (
        <PaymentDisputesTab
          paymentDisputes={paymentDisputes}
          loading={paymentDisputesLoading}
          error={paymentDisputesError}
          pagination={paymentDisputesPagination}
          currentPage={paymentDisputesPage}
          pageSize={paymentDisputesPageSize}
          onPageChange={handlePaymentDisputesPageChange}
          onPageSizeChange={handlePaymentDisputesPageSizeChange}
          formatCurrency={function (amount: number): string {
            throw new Error("Function not implemented.")
          }}
          formatDateTime={function (dateString: string): string {
            throw new Error("Function not implemented.")
          }}
        />
      )
    } else if (activeTab === "change-requests") {
      return <ChangeRequestsTab customerId={customerId} />
    }
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
                {/* Right Sidebar - Always Visible */}
                <div className="flex w-[30%] flex-col space-y-6">
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
                      {canUpdate && (
                        <ButtonModule
                          variant={currentCustomer.isSuspended ? "primary" : "danger"}
                          className="w-full justify-start gap-3"
                          onClick={() => (currentCustomer.isSuspended ? openModal("activate") : openModal("suspend"))}
                        >
                          <Power className="size-4" />
                          {currentCustomer.isSuspended ? "Reactivate Account" : "Suspend Account"}
                        </ButtonModule>
                      )}
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

                {/* Main Content Area - Tab Content */}
                <div className="flex w-[70%] flex-col space-y-6">
                  <div className="mb-4">
                    <div className="w-fit rounded-md bg-white p-2">
                      <nav className="-mb-px flex space-x-2">
                        <button
                          onClick={() => setActiveTab("basic-info")}
                          className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                            activeTab === "basic-info"
                              ? "bg-[#0a0a0a] text-white"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                          }`}
                        >
                          Basic Information
                        </button>
                        <button
                          onClick={() => setActiveTab("payment-disputes")}
                          className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                            activeTab === "payment-disputes"
                              ? "bg-[#0a0a0a] text-white"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                          }`}
                        >
                          Payment Disputes
                          {paymentDisputes.length > 0 && (
                            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-medium leading-none text-white">
                              {paymentDisputes.length}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab("change-requests")}
                          className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                            activeTab === "change-requests"
                              ? "bg-[#0a0a0a] text-white"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                          }`}
                        >
                          Change Requests
                        </button>
                      </nav>
                    </div>
                  </div>
                  {renderTabContent()}
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

      <CustomerChangeRequestModal
        isOpen={activeModal === "changeRequest"}
        onRequestClose={closeAllModals}
        customerId={customerId}
        customerName={currentCustomer.fullName}
        customerAccountNumber={currentCustomer.accountNumber}
        onSuccess={() => {
          closeAllModals()
        }}
      />

      <SuspendCustomerModal
        isOpen={activeModal === "suspend"}
        onRequestClose={closeAllModals}
        customerId={customerId}
        customerName={currentCustomer.fullName}
        accountNumber={currentCustomer.accountNumber}
        onSuccess={handleSuspendSuccess}
      />

      <ActivateCustomerModal
        isOpen={activeModal === "activate"}
        onRequestClose={closeAllModals}
        customerId={customerId}
        customerName={currentCustomer.fullName}
        accountNumber={currentCustomer.accountNumber}
        onSuccess={handleActivateSuccess}
      />
    </section>
  )
}

export default CustomerDetailsPage
