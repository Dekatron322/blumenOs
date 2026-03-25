"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit3,
  Eye,
  Factory,
  FileText,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  PieChart,
  Power,
  Receipt,
  RefreshCw,
  Settings,
  TrendingDown,
  TrendingUp,
  User,
  Zap,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import SuspendCustomerModal from "components/ui/Modal/suspend-customer-modal"
import ActivateCustomerModal from "components/ui/Modal/activate-customer-modal"
import CustomerChangeRequestModal from "components/ui/Modal/customer-change-request-modal"
import ManualBillModal from "components/ui/Modal/manual-bill-modal"
import RecordPaymentModal from "components/ui/Modal/record-payment-modal"
import MeterReadingModal from "components/ui/Modal/meter-reading-modal"
import DashboardNav from "components/Navbar/DashboardNav"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"

import { clearCurrentCustomer, fetchCustomerById } from "lib/redux/customerSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchPayments, type PaymentsResponse } from "lib/redux/paymentSlice"
import type { Payment } from "lib/redux/paymentSlice"
import PaymentReceiptModal from "components/ui/Modal/payment-receipt-modal"
import ChangeAccountNumberModal from "components/ui/Modal/change-account-number-modal"
import TariffOverrideModal from "components/ui/Modal/tariff-override-modal"
import VatOverrideModal from "components/ui/Modal/vat-override-modal"
import ContractAdjustmentModal from "components/ui/Modal/contract-adjustment-modal"
import { formatCurrency as formatCurrencyUtil } from "utils/formatCurrency"
import { SearchModule } from "components/ui/Search/search-module"

// Import tab components
import BasicInfoTab from "components/Tabs/basic-info-tab"
import PaymentDisputesTab from "components/Tabs/payment-disputes-tab"
import ChangeRequestsTab from "components/Tabs/change-requests-tab"
import PostpaidBillingTab from "components/Tabs/postpaid-billing-tab"
import TariffOverridesTab from "components/Tabs/tariff-overrides-tab"
import VatOverridesTab from "components/Tabs/vat-overrides-tab"
import ContractAdjustmentsTab from "components/Tabs/contract-adjustments-tab"
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
type TabType =
  | "basic-info"
  | "payments"
  | "tariff-overrides"
  | "vat-overrides"
  | "contract-adjustments"
  | "change-requests"
  | "postpaid-billing"

// Modern Skeleton Components
const ProfileCardSkeleton = () => (
  <motion.div
    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
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
    <div className="text-center">
      <div className="relative inline-block">
        <div className="mx-auto mb-4 size-20 rounded-full bg-gray-200"></div>
        <div className="absolute -right-1 bottom-1 size-6 rounded-full border-2 border-white bg-gray-200"></div>
      </div>
      <div className="mx-auto mb-2 h-7 w-48 rounded bg-gray-200"></div>
      <div className="mx-auto mb-4 h-4 w-32 rounded bg-gray-200"></div>
      <div className="mb-6 flex justify-center gap-2">
        <div className="h-7 w-16 rounded-full bg-gray-200"></div>
        <div className="h-7 w-20 rounded-full bg-gray-200"></div>
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-center gap-3">
            <div className="size-4 rounded bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)

const QuickActionsSkeleton = () => (
  <motion.div
    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
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
    <div className="mb-4 flex items-center gap-2">
      <div className="size-5 rounded bg-gray-200"></div>
      <div className="h-5 w-24 rounded bg-gray-200"></div>
    </div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 w-full rounded bg-gray-200"></div>
      ))}
    </div>
  </motion.div>
)

const FinancialOverviewSkeleton = () => (
  <motion.div
    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
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
    <div className="mb-4 flex items-center gap-2">
      <div className="size-5 rounded bg-gray-200"></div>
      <div className="h-5 w-32 rounded bg-gray-200"></div>
    </div>
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto mb-2 h-10 w-32 rounded bg-gray-200"></div>
        <div className="mx-auto h-4 w-24 rounded bg-gray-200"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="mx-auto h-7 w-20 rounded bg-gray-200"></div>
          <div className="mx-auto mt-1 h-3 w-16 rounded bg-gray-200"></div>
        </div>
        <div className="text-center">
          <div className="mx-auto h-7 w-20 rounded bg-gray-200"></div>
          <div className="mx-auto mt-1 h-3 w-16 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const TabsSkeleton = () => (
  <motion.div
    className="mb-4"
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
    <div className="flex space-x-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-10 w-32 rounded-md bg-gray-200"></div>
      ))}
    </div>
  </motion.div>
)

const TabContentSkeleton = () => (
  <motion.div
    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
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
    <div className="space-y-6">
      <div className="h-7 w-48 rounded bg-gray-200"></div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="h-10 w-full rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)

const CustomerDetailsSkeleton = () => {
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col ">
            {/* Header Skeleton */}
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full p-4 md:px-6 ">
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-9 rounded-md bg-gray-200"></div>
                    <div>
                      <div className="mb-1 h-6 w-32 rounded bg-gray-200"></div>
                      <div className="size-48 rounded bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-9 w-20 rounded bg-gray-200"></div>
                    <div className="h-9 w-20 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-4 py-8 md:px-6 ">
              <div className="w-full gap-6 xl:flex">
                {/* Left Column Skeleton */}
                <div className="w-full space-y-6 xl:max-w-[30%]">
                  <ProfileCardSkeleton />
                  <QuickActionsSkeleton />
                  <FinancialOverviewSkeleton />
                </div>

                {/* Right Column Skeleton */}
                <div className="mt-6 w-full xl:mt-0 xl:w-[70%]">
                  <TabsSkeleton />
                  <TabContentSkeleton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Modern Stat Card Component
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color?: "blue" | "green" | "purple" | "amber" | "emerald" | "red"
  trend?: "up" | "down"
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2 ${colorClasses[color].split(" ")[0]}`}>
          <Icon className={`size-4 ${iconColors[color]}`} />
        </div>
        {trend && (
          <span className={trend === "up" ? "text-emerald-600" : "text-red-600"}>
            {trend === "up" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-xs text-gray-600">{title}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

// Modern Action Button Component
const ActionButton = ({
  icon: Icon,
  children,
  onClick,
  variant = "default",
}: {
  icon: React.ElementType
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "primary" | "danger" | "success"
}) => {
  const variants = {
    default: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
    primary: "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300",
    danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300",
    success: "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
  }

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${variants[variant]}`}
    >
      <Icon className="size-4" />
      {children}
    </button>
  )
}

// Modern Status Badge Component
const StatusBadge = ({ status, icon: Icon }: { status: string; icon?: React.ElementType }) => {
  const configs = {
    ACTIVE: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
    INACTIVE: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
    SUSPENDED: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: AlertCircle },
  }

  const config = configs[status as keyof typeof configs] || configs.INACTIVE
  const BadgeIcon = Icon || config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.color} ${config.border}`}
    >
      <BadgeIcon className="size-3.5" />
      {status}
    </span>
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
    | "suspend"
    | "reminder"
    | "status"
    | "activate"
    | "changeRequest"
    | "manualBill"
    | "recordPayment"
    | "meterReading"
    | "changeAccountNumber"
    | "tariffOverride"
    | "vatOverride"
    | "contractAdjustment"
    | null
  >(null)
  const [activeTab, setActiveTab] = useState<TabType>("basic-info")
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileTabMenuOpen, setIsMobileTabMenuOpen] = useState(false)
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  // Permission checks
  const canRecordPayment = !!user?.privileges?.some(
    (p) =>
      (p.key === "payments" && p.actions?.includes("W")) ||
      (p.key === "finance-bill-payments-and-vending" && p.actions?.includes("W"))
  )
  const canGenerateBill = !!user?.privileges?.some(
    (p) =>
      (p.key === "billing-postpaid" && p.actions?.includes("W")) ||
      (p.key === "billing-billing-proper" && p.actions?.includes("W"))
  )
  const canRecordMeterReading = !!user?.privileges?.some(
    (p) =>
      (p.key === "metering-meter-reading" && p.actions?.includes("W")) ||
      (p.key === "meters" && p.actions?.includes("W")) ||
      (p.key === "metering-meter-capturing-allocation" && p.actions?.includes("W"))
  )
  const canChangeAccountNumber = !!user?.privileges?.some((p) => p.key === "customers" && p.actions?.includes("U"))
  const canAddNewMeter = !!user?.privileges?.some(
    (p) =>
      (p.key === "metering-meter-changeout-activation-de-activation" && p.actions?.includes("W")) ||
      (p.key === "meters" && p.actions?.includes("W")) ||
      (p.key === "new-service-new-capture-separation" && p.actions?.includes("W"))
  )

  // Payment receipt modal state
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  // Payments state
  const [paymentsPage, setPaymentsPage] = useState(1)
  const [paymentsPageSize, setPaymentsPageSize] = useState(10)
  const [paymentsSearchInput, setPaymentsSearchInput] = useState("")

  // Fetch customer data
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
          search: paymentsSearchInput.trim() || undefined,
        })
      )
    }
  }, [activeTab, customerId, paymentsPage, paymentsPageSize, paymentsSearchInput, dispatch])

  // Generate assets
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
      ? { color: "text-blue-700", bg: "bg-blue-50", label: "PREPAID" }
      : { color: "text-purple-700", bg: "bg-purple-50", label: "POSTPAID" }
  }

  const closeAllModals = () => setActiveModal(null)
  const openModal = (
    modalType:
      | "suspend"
      | "reminder"
      | "status"
      | "activate"
      | "changeRequest"
      | "manualBill"
      | "recordPayment"
      | "meterReading"
      | "changeAccountNumber"
      | "tariffOverride"
      | "vatOverride"
      | "contractAdjustment"
  ) => setActiveModal(modalType)

  const handleConfirmReminder = (message: string) => {
    console.log("Reminder sent:", message)
    closeAllModals()
  }

  const handleSuspendSuccess = () => {
    dispatch(fetchCustomerById(customerId))
    closeAllModals()
  }

  const handleViewPaymentReceipt = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsReceiptModalOpen(true)
  }

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false)
    setSelectedPayment(null)
  }

  const handleActivateSuccess = () => {
    dispatch(fetchCustomerById(customerId))
    closeAllModals()
  }

  // Generate random assets
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

  // Format currency
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

  // Export all customer payments to CSV
  const exportPaymentsToCSV = async () => {
    if (!payments || payments.length === 0) return

    try {
      // Fetch all payments for this customer (not just the current page)
      const allPaymentsResponse = await dispatch(
        fetchPayments({
          pageNumber: 1,
          pageSize: 10000, // Large number to get all payments
          customerId,
          search: paymentsSearchInput.trim() || undefined,
        })
      )

      if (allPaymentsResponse.meta.requestStatus === "fulfilled" && allPaymentsResponse.payload) {
        const allPayments = (allPaymentsResponse.payload as PaymentsResponse).data || []

        if (allPayments.length === 0) {
          alert("No payments to export")
          return
        }

        // Create CSV headers
        const headers = [
          "Payment ID",
          "Reference",
          "Customer Name",
          "Account Number",
          "Amount",
          "Currency",
          "Payment Date",
          "Channel",
          "Status",
          "Payment Type",
          "Tariff Rate",
          "Units",
          "VAT Rate",
          "VAT Amount",
          "Electricity Amount",
          "Outstanding Debt",
          "Debt Payable",
          "Collector Name",
          "Collector Type",
          "Bill Period",
          "Meter Number",
        ]

        // Create CSV rows
        const csvRows = [
          headers.join(","),
          ...allPayments.map((payment: Payment) => {
            const row = [
              payment.id,
              `"${payment.reference}"`,
              `"${payment.customerName}"`,
              `"${payment.customerAccountNumber}"`,
              payment.totalAmountPaid || payment.amount || 0,
              payment.currency || "NGN",
              `"${formatDateTime(payment.paidAtUtc)}"`,
              `"${payment.channel}"`,
              `"${payment.status}"`,
              `"${payment.paymentTypeName}"`,
              payment.tariffRate || 0,
              payment.units || 0,
              payment.vatRate || 0,
              payment.vatAmount || 0,
              payment.electricityAmount || 0,
              payment.outstandingDebt || 0,
              payment.debtPayable || 0,
              `"${payment.collector?.name || "N/A"}"`,
              `"${payment.collector?.type || "N/A"}"`,
              `"${payment.postpaidBillPeriod || "N/A"}"`,
              `"${payment.customerMeterNumber || "N/A"}"`,
            ]
            return row.join(",")
          }),
        ]

        // Create CSV content
        const csvContent = csvRows.join("\n")

        // Create blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)

        // Generate filename with customer info and timestamp
        const timestamp = new Date().toISOString().split("T")[0]
        const customerName = currentCustomer?.fullName?.replace(/[^a-zA-Z0-9]/g, "_") || "unknown"
        const filename = `payment_history_${customerName}_${
          currentCustomer?.accountNumber || "unknown"
        }_${timestamp}.csv`

        link.setAttribute("href", url)
        link.setAttribute("download", filename)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Error exporting payments:", error)
      alert("Failed to export payments. Please try again.")
    }
  }

  // Handle payments pagination
  const handlePaymentsPageChange = (page: number) => {
    setPaymentsPage(page)
  }

  const handlePaymentsPageSizeChange = (size: number) => {
    setPaymentsPageSize(size)
    setPaymentsPage(1)
  }

  // Payments search handlers
  const handlePaymentsSearchChange = (value: string) => {
    setPaymentsSearchInput(value)
  }

  const handlePaymentsSearch = () => {
    const trimmed = paymentsSearchInput.trim()
    if (trimmed.length === 0 || trimmed.length >= 3) {
      setPaymentsPage(1) // Reset to first page when searching
    }
  }

  const handlePaymentsCancelSearch = () => {
    setPaymentsSearchInput("")
    setPaymentsPage(1) // Reset to first page when clearing search
  }

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case "basic-info":
        return "Basic Information"
      case "payments":
        return "Payments"
      case "change-requests":
        return "Change Requests"
      case "vat-overrides":
        return "VAT Overrides"
      case "postpaid-billing":
        return "Postpaid Billing"
      default:
        return "Basic Information"
    }
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "basic-info", label: "Basic Info", icon: <User className="size-4" /> },
    { id: "payments", label: "Payments", icon: <CreditCard className="size-4" /> },
    { id: "tariff-overrides", label: "Tariff Overrides", icon: <DollarSign className="size-4" /> },
    { id: "vat-overrides", label: "VAT Overrides", icon: <Receipt className="size-4" /> },
    { id: "contract-adjustments", label: "Contract Adjustments", icon: <FileText className="size-4" /> },
    { id: "change-requests", label: "Change Requests", icon: <FileText className="size-4" /> },
    { id: "postpaid-billing", label: "Postpaid Billing", icon: <Receipt className="size-4" /> },
  ]

  // Show loading skeleton
  if (isLoading || currentCustomerLoading) {
    return <CustomerDetailsSkeleton />
  }

  // Show error state
  if (currentCustomerError || !currentCustomer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="size-10 text-red-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentCustomerError ? "Error Loading Customer" : "Customer Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">
            {currentCustomerError || "The customer you're looking for doesn't exist or has been removed."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()} className="mx-auto">
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

        items.push(1)
        const showLeftEllipsis = current > 4
        const showRightEllipsis = current < total - 3

        if (!showLeftEllipsis) {
          items.push(2, 3, 4, "...")
        } else if (!showRightEllipsis) {
          items.push("...", total - 3, total - 2, total - 1)
        } else {
          items.push("...", current - 1, current, current + 1, "...")
        }

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

        items.push(1)
        const showLeftEllipsis = current > 3
        const showRightEllipsis = current < total - 2

        if (!showLeftEllipsis) {
          items.push(2, 3)
        } else if (!showRightEllipsis) {
          items.push("...", total - 1)
        } else {
          items.push("...", current - 1, current, current + 1, "...")
        }

        if (!items.includes(total)) {
          items.push(total)
        }

        return items
      }

      if (paymentsLoading) {
        return (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="mr-2 size-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading payments...</span>
          </div>
        )
      }

      if (paymentsError) {
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 size-12 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Payments</h3>
            <p className="mt-1 text-sm text-gray-600">{paymentsError}</p>
            <ButtonModule
              variant="primary"
              onClick={() =>
                dispatch(
                  fetchPayments({
                    pageNumber: paymentsPage,
                    pageSize: paymentsPageSize,
                    customerId,
                  })
                )
              }
              className="mt-4"
            >
              Try Again
            </ButtonModule>
          </div>
        )
      }

      const filteredPayments = payments.filter((payment) => {
        if (!paymentsSearchInput) return true
        const searchTerm = paymentsSearchInput.toLowerCase()
        return (
          payment.reference?.toLowerCase().includes(searchTerm) ||
          payment.channel?.toLowerCase().includes(searchTerm) ||
          payment.status?.toLowerCase().includes(searchTerm) ||
          payment.amount?.toString().includes(searchTerm) ||
          payment.paidAtUtc?.toLowerCase().includes(searchTerm)
        )
      })

      return (
        <div className="rounded-xl border border-gray-200 bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Payment History</h3>
                <p className="text-sm text-gray-600">
                  {payments.length} of {totalRecords} payments
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                onClick={exportPaymentsToCSV}
                disabled={!payments || payments.length === 0}
              >
                <Download className="size-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="border-b border-gray-200 bg-gray-50/50 p-4">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#004B23]">Search Payments</p>
              <h4 className="text-sm font-medium text-gray-900">Find payment records</h4>
              <p className="text-xs text-gray-600">Search by reference, channel, amount, or payment type.</p>
            </div>
            <SearchModule
              value={paymentsSearchInput}
              onChange={(e) => handlePaymentsSearchChange(e.target.value)}
              onCancel={handlePaymentsCancelSearch}
              onSearch={handlePaymentsSearch}
              placeholder="Search payments..."
              className="w-full"
            />
          </div>

          {/* Payments List */}
          <div className="divide-y divide-gray-200">
            {filteredPayments.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gray-100">
                  <CreditCard className="size-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No payments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {paymentsSearchInput ? "Try adjusting your search terms." : "No payment records available."}
                </p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{payment.reference}</h4>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            payment.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : payment.status === "Failed" || payment.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-4" />
                          {formatDate(payment.paidAtUtc)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="size-4" />
                          {formatCurrency(payment.amount || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="size-4" />
                          {payment.channel}
                        </span>
                        {payment.collectorType && (
                          <span className="flex items-center gap-1">
                            <User className="size-4" />
                            {payment.collectorType}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-13 flex items-center gap-2 md:ml-0">
                      <button
                        onClick={() => handleViewPaymentReceipt(payment)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Eye className="size-3.5" />
                        View Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="text-sm text-gray-600">
                  Showing {payments.length} of {totalRecords} payments
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePaymentsPageChange(paymentsPage - 1)}
                    disabled={paymentsPage <= 1}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:size-9"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  {/* Desktop pagination */}
                  <div className="hidden items-center gap-1 sm:flex">
                    {getPageItems().map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (typeof item === "number") {
                            handlePaymentsPageChange(item)
                          }
                        }}
                        disabled={typeof item !== "number"}
                        className={`flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors sm:size-9 ${
                          typeof item === "number"
                            ? paymentsPage === item
                              ? "bg-[#004B23] text-white"
                              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            : "cursor-default text-gray-400"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  {/* Mobile pagination */}
                  <div className="flex items-center gap-1 sm:hidden">
                    {getMobilePageItems().map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (typeof item === "number") {
                            handlePaymentsPageChange(item)
                          }
                        }}
                        disabled={typeof item !== "number"}
                        className={`flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                          typeof item === "number"
                            ? paymentsPage === item
                              ? "bg-[#004B23] text-white"
                              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            : "cursor-default text-gray-400"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePaymentsPageChange(paymentsPage + 1)}
                    disabled={paymentsPage >= totalPages}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:size-9"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    } else if (activeTab === "tariff-overrides") {
      return <TariffOverridesTab customerId={customerId} customerName={currentCustomer.fullName} />
    } else if (activeTab === "vat-overrides") {
      return <VatOverridesTab customerId={customerId} customerName={currentCustomer.fullName} />
    } else if (activeTab === "contract-adjustments") {
      return <ContractAdjustmentsTab customerId={customerId} customerName={currentCustomer.fullName} />
    } else if (activeTab === "change-requests") {
      return <ChangeRequestsTab customerId={customerId} />
    } else if (activeTab === "postpaid-billing") {
      return <PostpaidBillingTab customerId={customerId} />
    }
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col ">
            {/* Sticky Header */}
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
              <div className="mx-auto w-full p-4 md:px-6 ">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={() => router.back()}
                      className="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="size-4" />
                    </motion.button>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 md:text-xl">Customer Details</h1>
                      <p className="text-sm text-gray-600">View and manage customer information</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ButtonModule
                      variant="outline"
                      size="sm"
                      className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      icon={<Download className="size-4" />}
                    >
                      Export
                    </ButtonModule>

                    {canUpdate ? (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="bg-[#004B23] text-white hover:bg-[#003618]"
                        icon={<Edit3 className="size-4" />}
                        onClick={() => router.push(`/customers/update-customer/${customerId}`)}
                      >
                        Edit
                      </ButtonModule>
                    ) : (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="bg-[#004B23] text-white hover:bg-[#003618]"
                        icon={<Edit3 className="size-4" />}
                        onClick={() => openModal("changeRequest")}
                      >
                        Change Request
                      </ButtonModule>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex w-full px-4 py-6 md:px-6 ">
              <div className="w-full gap-6 xl:flex">
                {/* Left Column - Profile & Actions */}
                <div className="w-full space-y-6 xl:max-w-[30%]">
                  {/* Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#004B23] to-[#006635] text-2xl font-bold text-white">
                          {currentCustomer.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div
                          className={`absolute -right-1 bottom-1 rounded-full border-2 border-white p-1.5 ${statusConfig.bg}`}
                        >
                          <StatusIcon className={`size-4 ${statusConfig.color}`} />
                        </div>
                      </div>

                      <h2 className="mb-1 text-xl font-bold text-gray-900">{currentCustomer.fullName}</h2>
                      <p className="mb-3 text-sm text-gray-600">Account #{currentCustomer.accountNumber}</p>

                      <div className="mb-4 flex flex-wrap justify-center gap-2">
                        <StatusBadge status={currentCustomer.status} />
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}
                        >
                          {typeConfig.label}
                        </span>
                        {currentCustomer.isMD && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                            <Building2 className="size-3.5" />
                            MD
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Phone className="size-4 text-gray-400" />
                          <span>{currentCustomer.phoneNumber}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Mail className="size-4 text-gray-400" />
                          <span>{currentCustomer.email}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <MapPin className="size-4 text-gray-400" />
                          <span>{currentCustomer.provinceName}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Settings className="size-4" />
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      {canRecordPayment && (
                        <ActionButton icon={CreditCard} onClick={() => openModal("recordPayment")} variant="primary">
                          Record Payment
                        </ActionButton>
                      )}
                      {canGenerateBill && (
                        <ActionButton icon={Receipt} onClick={() => openModal("manualBill")} variant="success">
                          Generate Bill
                        </ActionButton>
                      )}
                      {canRecordMeterReading && (
                        <ActionButton icon={Activity} onClick={() => openModal("meterReading")} variant="default">
                          Record Meter Reading
                        </ActionButton>
                      )}
                      {canChangeAccountNumber && (
                        <ActionButton icon={Edit3} onClick={() => openModal("changeAccountNumber")} variant="default">
                          Change Account Number
                        </ActionButton>
                      )}
                      {canAddNewMeter && (
                        <ActionButton
                          icon={Zap}
                          onClick={() => router.push(`/metering/install-new-meter?customerId=${currentCustomer.id}`)}
                          variant="primary"
                        >
                          Add New Meter
                        </ActionButton>
                      )}
                      {canAddNewMeter && (
                        <ActionButton icon={Zap} onClick={() => openModal("tariffOverride")} variant="primary">
                          Create Tariff Override
                        </ActionButton>
                      )}
                      {canAddNewMeter && (
                        <ActionButton icon={Zap} onClick={() => openModal("vatOverride")} variant="danger">
                          Create VAT Override
                        </ActionButton>
                      )}
                      {!currentCustomer?.isPPM && (
                        <ActionButton icon={FileText} onClick={() => openModal("contractAdjustment")} variant="default">
                          Contract Adjustment
                        </ActionButton>
                      )}
                      {canAddNewMeter && currentCustomer.meters && currentCustomer.meters.length > 0 && (
                        <ActionButton
                          icon={RefreshCw}
                          onClick={() => router.push(`/metering/replace-meter?customerId=${currentCustomer.id}`)}
                          variant="default"
                        >
                          Replace Meter
                        </ActionButton>
                      )}

                      {canUpdate && (
                        <ActionButton
                          icon={Power}
                          onClick={() => (currentCustomer.isSuspended ? openModal("activate") : openModal("suspend"))}
                          variant={currentCustomer.isSuspended ? "success" : "danger"}
                        >
                          {currentCustomer.isSuspended ? "Reactivate Account" : "Suspend Account"}
                        </ActionButton>
                      )}
                    </div>
                  </motion.div>

                  {/* Financial Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <DollarSign className="size-4" />
                      Financial Overview
                    </h3>

                    <div className="mb-4 text-center">
                      <p className="text-xs text-gray-600">Outstanding Balance</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(currentCustomer.customerOutstandingDebtBalance)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <StatCard
                        title="Monthly Vend"
                        value={formatCurrency(currentCustomer.totalMonthlyVend)}
                        icon={TrendingUp}
                        color="emerald"
                      />
                      <StatCard
                        title="Monthly Debt"
                        value={formatCurrency(currentCustomer.totalMonthlyDebt)}
                        icon={TrendingDown}
                        color="amber"
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <StatCard title="Tariff Rate" value={`₦${currentCustomer.tariffRate}`} icon={Zap} color="blue" />
                      <StatCard
                        title="VAT Rate"
                        value={`${currentCustomer.currentVatOverride?.vatRateOverride || 0}%`}
                        icon={FileText}
                        color="purple"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Tabs & Content */}
                <div className="mt-6 w-full xl:mt-0 xl:w-[70%]">
                  {/* Tabs */}
                  <div className="mb-4">
                    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white p-1">
                      <div className="flex min-w-max space-x-1">
                        {tabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                              activeTab === tab.id
                                ? "bg-[#004B23] text-white"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            {tab.icon}
                            {tab.label}
                            {tab.id === "payments" && paymentsPagination.totalCount > 0 && (
                              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                                {paymentsPagination.totalCount}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === "reminder" && (
          <SendReminderModal isOpen={true} onRequestClose={closeAllModals} onConfirm={handleConfirmReminder} />
        )}

        {activeModal === "changeRequest" && (
          <CustomerChangeRequestModal
            isOpen={true}
            onRequestClose={closeAllModals}
            customerId={customerId}
            customerName={currentCustomer.fullName}
            customerAccountNumber={currentCustomer.accountNumber}
            onSuccess={closeAllModals}
          />
        )}

        {activeModal === "suspend" && (
          <SuspendCustomerModal
            isOpen={true}
            onRequestClose={closeAllModals}
            customerId={customerId}
            customerName={currentCustomer.fullName}
            accountNumber={currentCustomer.accountNumber}
            onSuccess={handleSuspendSuccess}
          />
        )}

        {activeModal === "activate" && (
          <ActivateCustomerModal
            isOpen={true}
            onRequestClose={closeAllModals}
            customerId={customerId}
            customerName={currentCustomer.fullName}
            accountNumber={currentCustomer.accountNumber}
            onSuccess={handleActivateSuccess}
          />
        )}

        {activeModal === "manualBill" && (
          <ManualBillModal
            isOpen={true}
            onRequestClose={closeAllModals}
            customerId={customerId}
            customerName={currentCustomer.fullName}
            accountNumber={currentCustomer.accountNumber}
            distributionSubstationId={currentCustomer.distributionSubstationId}
            feederId={currentCustomer.feederId}
            tariffPerKwh={currentCustomer.tariff?.tariffRate || 0}
            vatRate={currentCustomer.currentVatOverride?.vatRateOverride || 0}
          />
        )}

        {activeModal === "recordPayment" && (
          <RecordPaymentModal
            isOpen={true}
            onRequestClose={closeAllModals}
            customerId={customerId}
            customerName={currentCustomer.fullName}
            accountNumber={currentCustomer.accountNumber}
          />
        )}

        {activeModal === "meterReading" && (
          <MeterReadingModal
            isOpen={true}
            onRequestClose={closeAllModals}
            customerId={customerId}
            customerName={currentCustomer.fullName}
            accountNumber={currentCustomer.accountNumber}
          />
        )}

        {activeModal === "changeAccountNumber" && (
          <ChangeAccountNumberModal
            isOpen={true}
            onRequestClose={closeAllModals}
            customerId={customerId}
            customerName={currentCustomer.fullName}
            accountNumber={currentCustomer.accountNumber}
            currentCustomer={currentCustomer}
          />
        )}

        {activeModal === "tariffOverride" && (
          <TariffOverrideModal
            isOpen={true}
            onRequestClose={closeAllModals}
            customerId={customerId}
            customerName={currentCustomer.fullName}
            accountNumber={currentCustomer.accountNumber}
            currentCustomer={currentCustomer}
          />
        )}

        {activeModal === "vatOverride" && (
          <VatOverrideModal
            isOpen={true}
            onRequestClose={closeAllModals}
            customerId={customerId}
            customerName={currentCustomer.fullName}
            accountNumber={currentCustomer.accountNumber}
            currentCustomer={currentCustomer}
          />
        )}

        {activeModal === "contractAdjustment" && (
          <ContractAdjustmentModal
            isOpen={true}
            onClose={closeAllModals}
            customerId={customerId}
            customerName={currentCustomer.fullName}
            customerAccountNumber={currentCustomer.accountNumber}
          />
        )}
      </AnimatePresence>

      {/* Payment Receipt Modal */}
      <AnimatePresence>
        {isReceiptModalOpen && selectedPayment && (
          <PaymentReceiptModal isOpen={true} onRequestClose={handleCloseReceiptModal} payment={selectedPayment} />
        )}
      </AnimatePresence>
    </section>
  )
}

export default CustomerDetailsPage
