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
  BasicInfoOutlineIcon,
  ChangeRequestOutlineIcon,
  EmailOutlineIcon,
  ExportCsvIcon,
  ExportOutlineIcon,
  FinanceOutlineIcon,
  MapOutlineIcon,
  MeterOutlineIcon,
  NotificationOutlineIcon,
  PaymentDisputeOutlineIcon,
  PhoneOutlineIcon,
  PostpaidBillOutlineIcon,
  SettingOutlineIcon,
} from "components/Icons/Icons"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"

import { clearCurrentCustomer, fetchCustomerById } from "lib/redux/customerSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchPayments } from "lib/redux/paymentSlice"
import type { Payment } from "lib/redux/paymentSlice"
import PaymentReceiptModal from "components/ui/Modal/payment-receipt-modal"
import { formatCurrency as formatCurrencyUtil } from "utils/formatCurrency"

// Import tab components
import BasicInfoTab from "components/Tabs/basic-info-tab"
import PaymentDisputesTab from "components/Tabs/payment-disputes-tab"
import ChangeRequestsTab from "components/Tabs/change-requests-tab"
import PostpaidBillingTab from "components/Tabs/postpaid-billing-tab"
import { VscEye } from "react-icons/vsc"

interface Asset {
  serialNo: number
  supplyStructureType?: string
  company: string
  feederName?: string
  transformerCapacityKva?: number
  status?: string
}

// Tab types
type TabType = "basic-info" | "payments" | "change-requests" | "postpaid-billing"

// Skeleton Components
const CustomerDetailsSkeleton = () => {
  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          {/* Dashboard Nav Skeleton */}
          <div className="sticky top-0 z-50 h-16 border-b border-gray-200 bg-white">
            <div className="flex h-full items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-32 rounded bg-gray-200 md:w-40"></div>
                <div className="hidden h-8 w-48 rounded bg-gray-200 md:block lg:w-64"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-gray-200 md:size-10"></div>
                <div className="hidden h-8 w-24 rounded bg-gray-200 md:block"></div>
              </div>
            </div>
          </div>

          <div className="mx-auto flex w-full flex-col 2xl:container">
            {/* Header Skeleton */}
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-3 py-4 2xl:px-16">
                <div className="flex w-full justify-between max-sm:flex-col lg:items-center">
                  <div className="flex gap-4 lg:items-center">
                    <div className="size-9 rounded-md bg-gray-200"></div>
                    <div>
                      <div className="mb-1 h-6 w-32 rounded bg-gray-200 md:w-40"></div>
                      <div className="h-4 w-48 rounded bg-gray-200 md:w-64"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 max-sm:mt-3">
                    <div className="h-9 w-20 rounded bg-gray-200 md:w-24"></div>
                    <div className="h-9 w-20 rounded bg-gray-200 md:w-24"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-3 py-8 2xl:px-16">
              <div className="w-full gap-6 2xl:flex">
                {/* Right Sidebar Skeleton */}
                <div className="flex w-full flex-col space-y-6 2xl:max-w-[30%]">
                  {/* Profile Card Skeleton */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-center">
                      <div className="relative mx-auto mb-4">
                        <div className="mx-auto size-20 rounded-full bg-gray-200"></div>
                        <div className="absolute -right-1 bottom-1 size-6 rounded-full bg-gray-200"></div>
                      </div>

                      <div className="mx-auto mb-2 h-7 w-48 rounded bg-gray-200"></div>
                      <div className="mx-auto mb-4 h-4 w-32 rounded bg-gray-200"></div>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div className="h-7 w-16 rounded-full bg-gray-200"></div>
                        <div className="h-7 w-20 rounded-full bg-gray-200"></div>
                        <div className="h-7 w-24 rounded-full bg-gray-200"></div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          <div className="size-4 rounded-full bg-gray-200"></div>
                          <div className="h-4 w-32 rounded bg-gray-200"></div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <div className="size-4 rounded-full bg-gray-200"></div>
                          <div className="h-4 w-40 rounded bg-gray-200"></div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <div className="size-4 rounded-full bg-gray-200"></div>
                          <div className="h-4 w-28 rounded bg-gray-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions & Financial Overview Skeleton */}
                  <div className="max-xl:flex max-xl:w-full max-xl:gap-4 max-sm:flex-col max-sm:gap-3">
                    <div className="flex-1 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="size-5 rounded bg-gray-200"></div>
                        <div className="h-5 w-24 rounded bg-gray-200"></div>
                      </div>
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-10 w-full rounded bg-gray-200"></div>
                        ))}
                        <div className="h-10 w-full rounded bg-gray-200"></div>
                      </div>
                    </div>

                    <div className="flex-1 rounded-lg border bg-white p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="size-5 rounded bg-gray-200"></div>
                        <div className="h-5 w-32 rounded bg-gray-200"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="mx-auto mb-2 h-10 w-32 rounded bg-gray-200"></div>
                          <div className="mx-auto h-4 w-40 rounded bg-gray-200"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="mx-auto h-7 w-24 rounded bg-gray-200"></div>
                            <div className="mx-auto mt-1 h-3 w-16 rounded bg-gray-200"></div>
                          </div>
                          <div className="text-center">
                            <div className="mx-auto h-7 w-24 rounded bg-gray-200"></div>
                            <div className="mx-auto mt-1 h-3 w-16 rounded bg-gray-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area Skeleton */}
                <div className="flex w-full flex-col space-y-6 max-xl:mt-4 2xl:w-[70%]">
                  {/* Tabs Skeleton */}
                  <div className="sm:mb-4">
                    <div className="w-full rounded-md bg-white p-2 sm:inline-flex sm:w-auto">
                      <div className="relative sm:hidden">
                        <div className="h-10 w-full rounded-md bg-gray-200"></div>
                      </div>
                      <div className="hidden sm:block">
                        <div className="flex space-x-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-10 w-32 rounded-md bg-gray-200"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab Content Skeleton */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    {/* Basic Info Tab Skeleton */}
                    <div className="space-y-6">
                      {/* Section Headers */}
                      <div className="space-y-4">
                        <div className="h-7 w-48 rounded bg-gray-200"></div>
                        <div className="h-4 w-full rounded bg-gray-200 md:w-3/4"></div>
                      </div>

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <div className="h-4 w-24 rounded bg-gray-200"></div>
                            <div className="h-10 w-full rounded bg-gray-200"></div>
                          </div>
                        ))}
                      </div>

                      {/* Assets Section */}
                      <div className="mt-8">
                        <div className="mb-4 h-7 w-32 rounded bg-gray-200"></div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                              <div className="flex items-center justify-between">
                                <div className="h-5 w-24 rounded bg-gray-200"></div>
                                <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                              </div>
                              <div className="mt-4 space-y-2">
                                {[...Array(4)].map((_, j) => (
                                  <div key={j} className="flex justify-between">
                                    <div className="h-3 w-20 rounded bg-gray-200"></div>
                                    <div className="h-3 w-24 rounded bg-gray-200"></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Map Section */}
                      <div className="mt-8">
                        <div className="mb-4 h-7 w-32 rounded bg-gray-200"></div>
                        <div className="h-64 w-full rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const CustomerDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const customerId = parseInt(params.id as string)

  // Redux hooks
  const dispatch = useAppDispatch()
  const { currentCustomer, currentCustomerLoading, currentCustomerError } = useAppSelector((state) => state.customers)
  const {
    payments,
    loading: paymentsLoading,
    error: paymentsError,
    pagination: paymentsPagination,
  } = useAppSelector((state) => state.payments)

  const [assets, setAssets] = useState<Asset[]>([])
  const [activeModal, setActiveModal] = useState<
    "suspend" | "reminder" | "status" | "activate" | "changeRequest" | null
  >(null)
  const [activeTab, setActiveTab] = useState<TabType>("basic-info")
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileTabMenuOpen, setIsMobileTabMenuOpen] = useState(false)
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  // Payment receipt modal state
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  // Payments state
  const [paymentsPage, setPaymentsPage] = useState(1)
  const [paymentsPageSize, setPaymentsPageSize] = useState(10)

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

  // Fetch payments when Payments tab is active
  useEffect(() => {
    if (activeTab === "payments" && customerId && !isNaN(customerId)) {
      dispatch(
        fetchPayments({
          pageNumber: paymentsPage,
          pageSize: paymentsPageSize,
          customerId,
        })
      )
    }
  }, [activeTab, customerId, paymentsPage, paymentsPageSize, dispatch])

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

  // Payment receipt handlers
  const handleViewPaymentReceipt = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsReceiptModalOpen(true)
  }

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false)
    setSelectedPayment(null)
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
  const formatCurrency = (amount: number | string) => {
    return formatCurrencyUtil(amount, "₦")
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

  // Handle payments pagination
  const handlePaymentsPageChange = (page: number) => {
    setPaymentsPage(page)
  }

  const handlePaymentsPageSizeChange = (size: number) => {
    setPaymentsPageSize(size)
    setPaymentsPage(1) // Reset to first page when changing page size
  }

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case "basic-info":
        return "Basic Information"
      case "payments":
        return "Payments"
      case "change-requests":
        return "Change Requests"
      case "postpaid-billing":
        return "Postpaid Billing"
      default:
        return "Basic Information"
    }
  }

  // Show loading skeleton
  if (isLoading || currentCustomerLoading) {
    return <CustomerDetailsSkeleton />
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
    } else if (activeTab === "payments") {
      const totalPages = paymentsPagination.totalPages || 1
      const totalRecords = paymentsPagination.totalCount || 0

      // Payment Skeleton Components with Animation
      const PaymentListItemSkeleton = () => (
        <motion.div
          className="border-b bg-white p-3 md:p-4"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
            <div className="flex items-start gap-3 md:items-center md:gap-4">
              <div className="size-8 flex-shrink-0 rounded-full bg-gray-200 md:size-10"></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                  <div className="h-5 w-32 rounded bg-gray-200 md:w-40"></div>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    <div className="h-6 w-12 rounded-full bg-gray-200 md:w-16"></div>
                    <div className="h-6 w-16 rounded-full bg-gray-200 md:w-20"></div>
                    <div className="h-6 w-20 rounded-full bg-gray-200 md:w-24"></div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 md:gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-3 w-20 rounded bg-gray-200 md:h-4 md:w-28"></div>
                  ))}
                </div>
                <div className="mt-2 h-3 w-40 rounded bg-gray-200 md:h-4 md:w-64"></div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-2 md:items-center md:justify-end md:gap-3">
              <div className="text-right">
                <div className="h-6 w-20 rounded bg-gray-200 md:h-8 md:w-24"></div>
                <div className="mt-1 h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-14 rounded bg-gray-200 md:h-9 md:w-20"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )

      const HeaderSkeleton = () => (
        <motion.div
          className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div className="h-7 w-32 rounded bg-gray-200 md:h-8 md:w-40"></div>
          <div className="h-9 w-24 rounded bg-gray-200 md:h-10 md:w-32"></div>
        </motion.div>
      )

      const PaginationSkeleton = () => (
        <motion.div
          className="mt-4 flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div className="order-2 flex items-center gap-2 md:order-1">
            <div className="hidden h-4 w-12 rounded bg-gray-200 md:block md:w-16"></div>
            <div className="h-7 w-12 rounded bg-gray-200 md:h-8 md:w-16"></div>
          </div>

          <div className="order-1 flex items-center gap-2 md:order-2 md:gap-3">
            <div className="size-7 rounded bg-gray-200 md:size-8"></div>
            <div className="flex gap-1 md:gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="size-6 rounded bg-gray-200 md:size-7"></div>
              ))}
            </div>
            <div className="size-7 rounded bg-gray-200 md:size-8"></div>
          </div>

          <div className="order-3 hidden h-4 w-20 rounded bg-gray-200 md:block md:w-24"></div>
        </motion.div>
      )

      const getPageItems = (): (number | string)[] => {
        const total = totalPages
        const current = paymentsPage
        const items: (number | string)[] = []

        if (total <= 7) {
          for (let i = 1; i <= total; i += 1) {
            items.push(i)
          }
          return items
        }

        // Always show first page
        items.push(1)

        const showLeftEllipsis = current > 4
        const showRightEllipsis = current < total - 3

        if (!showLeftEllipsis) {
          // Close to the start: show first few pages
          items.push(2, 3, 4, "...")
        } else if (!showRightEllipsis) {
          // Close to the end: show ellipsis then last few pages
          items.push("...", total - 3, total - 2, total - 1)
        } else {
          // In the middle: show ellipsis, surrounding pages, then ellipsis
          items.push("...", current - 1, current, current + 1, "...")
        }

        // Always show last page
        if (!items.includes(total)) {
          items.push(total)
        }

        return items
      }

      const getMobilePageItems = (): (number | string)[] => {
        const total = totalPages
        const current = paymentsPage
        const items: (number | string)[] = []

        if (total <= 4) {
          for (let i = 1; i <= total; i += 1) {
            items.push(i)
          }
          return items
        }

        // Example for early pages on mobile: 1,2,3,...,last
        if (current <= 3) {
          items.push(1, 2, 3, "...", total)
          return items
        }

        // Middle pages: 1, ..., current, ..., last
        if (current > 3 && current < total - 2) {
          items.push(1, "...", current, "...", total)
          return items
        }

        // Near the end: 1, ..., last-2, last-1, last
        items.push(1, "...", total - 2, total - 1, total)
        return items
      }

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(amount)
      }

      const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      }

      const PaymentListItem = ({ payment }: { payment: any }) => (
        <div className="border-b bg-white p-3 transition-all hover:bg-gray-50 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
            <div className="flex items-start gap-3 md:items-center md:gap-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 max-sm:hidden md:size-10">
                <span className="text-xs font-semibold text-blue-600 md:text-sm">
                  {payment.customerName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                  <h3 className="text-sm font-semibold text-gray-900 md:text-base">{payment.customerName}</h3>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      Ref: {payment.reference}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {payment.channel}
                    </span>
                    <span className="rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
                      {payment.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 md:gap-4 md:text-sm">
                  <span>
                    <strong>Amount:</strong> {formatCurrency(payment.amount)}
                  </span>
                  <span>
                    <strong className="md:hidden">Acc:</strong>
                    <strong className="hidden md:inline">Account:</strong> {payment.customerAccountNumber}
                  </span>
                  <span>
                    <strong>Paid At:</strong> {formatDateTime(payment.paidAtUtc)}
                  </span>
                  <span>
                    <strong>Bill Period:</strong> {payment.postpaidBillPeriod || "N/A"}
                  </span>
                </div>
                {payment.externalReference && (
                  <p className="mt-2 hidden text-sm text-gray-500 md:block">{payment.externalReference}</p>
                )}
              </div>
            </div>

            <div className="flex items-start justify-between gap-2 md:items-center md:gap-3">
              <div className="text-right text-xs md:text-sm">
                <div className="text-base font-bold text-gray-900 md:text-lg">{formatCurrency(payment.amount)}</div>
                <div className="hidden text-gray-500 md:block">Payment ID: {payment.id}</div>
              </div>
              <button
                onClick={() => handleViewPaymentReceipt(payment)}
                className="button-oulined flex items-center gap-2 text-xs md:text-sm"
              >
                <span className="hidden md:inline">View</span>
                <span className="md:hidden">View</span>
              </button>
            </div>
          </div>
          {payment.externalReference && (
            <p className="mt-2 text-xs text-gray-500 md:hidden">{payment.externalReference}</p>
          )}
        </div>
      )

      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm md:p-6">
          {paymentsLoading ? (
            <>
              <HeaderSkeleton />
              <div className="divide-y">
                {[...Array(3)].map((_, index) => (
                  <PaymentListItemSkeleton key={index} />
                ))}
              </div>
              <PaginationSkeleton />
            </>
          ) : paymentsError ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12">
              <div className="text-center">
                <AlertCircle className="mx-auto mb-4 size-10 text-red-400 md:size-12" />
                <h3 className="mb-2 text-base font-medium text-gray-900 md:text-lg">Error loading payments</h3>
                <p className="text-sm text-red-600 md:text-base">{paymentsError}</p>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12">
              <div className="text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-gray-100 md:size-12">
                  <VscEye className="size-5 text-gray-400 md:size-6" />
                </div>
                <h3 className="mt-3 text-base font-medium text-gray-900 md:mt-4 md:text-lg">No payments found</h3>
                <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm">No payments available for this customer</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-semibold text-gray-900 md:text-xl">Payments</h3>
                <button
                  className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] text-sm hover:border-[#2563EB] hover:bg-[#DBEAFE] md:text-base"
                  onClick={() => {
                    /* TODO: Implement CSV export for payments */
                  }}
                  disabled={!payments || payments.length === 0}
                >
                  <ExportCsvIcon color="#2563EB" size={18} className="md:size-5" />
                  <p className="text-xs text-[#2563EB] md:text-sm">Export CSV</p>
                </button>
              </div>

              <div className="divide-y">
                {payments.map((payment) => (
                  <PaymentListItem key={payment.id} payment={payment} />
                ))}
              </div>

              {/* Pagination */}
              {payments.length > 0 && (
                <div className="mt-4 flex w-full flex-row items-center justify-between gap-3 md:flex-row">
                  <div className="flex items-center gap-1 max-sm:hidden">
                    <p className="text-sm md:text-base">Show rows</p>
                    <select
                      value={paymentsPageSize}
                      onChange={(e) => handlePaymentsPageSizeChange(Number(e.target.value))}
                      className="bg-[#F2F2F2] p-1 text-sm md:text-base"
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={18}>18</option>
                      <option value={24}>24</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start md:gap-3">
                    <button
                      className={`px-2 py-1 md:px-3 md:py-2 ${
                        paymentsPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                      }`}
                      onClick={() => handlePaymentsPageChange(paymentsPage - 1)}
                      disabled={paymentsPage === 1}
                    >
                      <BiSolidLeftArrow className="size-4 md:size-5" />
                    </button>

                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="hidden items-center gap-1 md:flex md:gap-2">
                        {getPageItems().map((item, index) =>
                          typeof item === "number" ? (
                            <button
                              key={item}
                              className={`flex h-6 w-6 items-center justify-center rounded-md text-xs md:h-7 md:w-8 md:text-sm ${
                                paymentsPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                              }`}
                              onClick={() => handlePaymentsPageChange(item)}
                            >
                              {item}
                            </button>
                          ) : (
                            <span key={`ellipsis-${index}`} className="px-1 text-gray-500">
                              {item}
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex items-center gap-1 md:hidden">
                        {getMobilePageItems().map((item, index) =>
                          typeof item === "number" ? (
                            <button
                              key={item}
                              className={`flex h-6 w-6 items-center justify-center rounded-md text-xs md:w-8 ${
                                paymentsPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                              }`}
                              onClick={() => handlePaymentsPageChange(item)}
                            >
                              {item}
                            </button>
                          ) : (
                            <span key={`ellipsis-${index}`} className="px-1 text-xs text-gray-500">
                              {item}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <button
                      className={`px-2 py-1 md:px-3 md:py-2 ${
                        paymentsPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                      }`}
                      onClick={() => handlePaymentsPageChange(paymentsPage + 1)}
                      disabled={paymentsPage === totalPages}
                    >
                      <BiSolidRightArrow className="size-4 md:size-5" />
                    </button>
                  </div>
                  <p className="text-sm max-sm:hidden md:text-base">
                    Page {paymentsPage} of {totalPages} ({totalRecords} total records)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )
    } else if (activeTab === "change-requests") {
      return <ChangeRequestsTab customerId={customerId} />
    } else if (activeTab === "postpaid-billing") {
      return <PostpaidBillingTab customerId={customerId} />
    }
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col 2xl:container">
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-3 py-4 2xl:px-16">
                <div className="flex w-full justify-between max-sm:flex-col lg:items-center">
                  <div className="flex gap-4 lg:items-center">
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
                      <h1 className="font-bold text-gray-900 xl:text-2xl">Customer Details</h1>
                      <p className="text-gray-600 max-sm:text-sm">Complete overview and management</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 max-sm:mt-3">
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

            <div className="flex w-full px-3 py-8 2xl:px-16">
              <div className=" w-full gap-6  xl:flex">
                {/* Right Sidebar - Always Visible */}
                <div className="flex w-full gap-6 space-y-6 sm:flex-col lg:max-w-full lg:flex-row lg:space-y-0 xl:max-w-[30%] xl:flex-col">
                  {/* Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-[#f9f9f9] text-3xl font-bold text-[#004B23]">
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
                  <div className=" max-xl:flex max-xl:w-full max-xl:gap-4 max-sm:flex-col max-sm:gap-3 lg:flex-col">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex-1 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                        <SettingOutlineIcon />
                        Quick Actions
                      </h3>
                      <div className="space-y-3">
                        <ButtonModule
                          variant="primary"
                          className="w-full justify-start gap-3"
                          onClick={() => openModal("reminder")}
                        >
                          <PaymentDisputeOutlineIcon />
                          Record Payment
                        </ButtonModule>
                        <ButtonModule
                          variant="outline"
                          className="w-full justify-start gap-3"
                          onClick={() => openModal("reminder")}
                        >
                          <PostpaidBillOutlineIcon className="size-4" />
                          Generate Bill
                        </ButtonModule>
                        <ButtonModule
                          variant="outline"
                          className="w-full justify-start gap-3"
                          onClick={() => openModal("reminder")}
                        >
                          <MeterOutlineIcon className="size-4" />
                          Generate Meter Reading
                        </ButtonModule>
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
                      className="flex-1 rounded-lg border bg-white p-6 xl:mt-4"
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
                </div>

                {/* Main Content Area - Tab Content */}
                <div className="flex w-full flex-col space-y-6 max-xl:mt-4 xl:w-[70%]">
                  <div className="sm:mb-4">
                    <div className="w-full rounded-md bg-white p-2 sm:inline-flex sm:w-auto">
                      <div className="relative sm:hidden">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
                          onClick={() => setIsMobileTabMenuOpen((prev) => !prev)}
                        >
                          <span>{getTabLabel(activeTab)}</span>
                          <svg
                            className={`size-4 transform transition-transform ${
                              isMobileTabMenuOpen ? "rotate-180" : "rotate-0"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {isMobileTabMenuOpen && (
                          <div className="absolute z-10 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                            <button
                              onClick={() => {
                                setActiveTab("basic-info")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "basic-info"
                                  ? "bg-[#004B23] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <BasicInfoOutlineIcon className="size-5" />
                              <span>Basic Information</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("postpaid-billing")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "postpaid-billing"
                                  ? "bg-[#004B23] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <PostpaidBillOutlineIcon className="size-5" />
                              <span>Postpaid Billing</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("payments")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "payments" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <PaymentDisputeOutlineIcon className="size-5" />
                              <span>Payments</span>
                              {paymentsPagination.totalCount > 0 && (
                                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium leading-none text-white">
                                  {paymentsPagination.totalCount}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("change-requests")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "change-requests"
                                  ? "bg-[#004B23] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <ChangeRequestOutlineIcon className="size-5" />
                              <span>Change Requests</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="hidden sm:block">
                        <nav className="-mb-px flex space-x-2">
                          <button
                            onClick={() => setActiveTab("basic-info")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "basic-info"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <BasicInfoOutlineIcon className="size-5" />
                            <span>Basic Information</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("postpaid-billing")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "postpaid-billing"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <PostpaidBillOutlineIcon className="size-5" />
                            <span>Postpaid Billing</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("payments")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "payments"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <PaymentDisputeOutlineIcon className="size-5" />
                            <span>Payments</span>
                            {paymentsPagination.totalCount > 0 && (
                              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium leading-none text-white">
                                {paymentsPagination.totalCount}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => setActiveTab("change-requests")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "change-requests"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <ChangeRequestOutlineIcon className="size-5" />
                            <span>Change Requests</span>
                          </button>
                        </nav>
                      </div>
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

      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onRequestClose={handleCloseReceiptModal}
        payment={selectedPayment}
      />
    </section>
  )
}

export default CustomerDetailsPage
