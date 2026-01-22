"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { Calendar, Download, Filter, X } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearConfirmPayment,
  clearError,
  clearPayments,
  CollectorType,
  fetchAgentSummary,
  fetchPayments,
  Payment,
  PaymentChannel,
  PaymentsRequestParams,
  PaymentStatus,
  setPaymentsPagination,
  TimeRange,
} from "lib/redux/agentSlice"
import { ButtonModule } from "components/ui/Button/Button"
import ConfirmPaymentForm from "components/Forms/ConfirmPaymentForm"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import { api } from "lib/redux/authSlice"
import VendTokenModal from "components/ui/Modal/vend-token-modal"
import CollectPaymentReceiptModal from "components/ui/Modal/collect-payment-receipt-modal"

interface ActionDropdownProps {
  payment: Payment
  onViewDetails: (payment: Payment) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ payment, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return

    const buttonRect = dropdownRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    const dropdownHeight = 120

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownDirection("top")
    } else {
      setDropdownDirection("bottom")
    }
  }

  const handleButtonClick = () => {
    calculateDropdownPosition()
    setIsOpen(!isOpen)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(payment)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="focus::bg-gray-100 flex size-7 cursor-pointer items-center justify-center gap-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-200"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <RxDotsVertical />
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={
              dropdownDirection === "bottom"
                ? {
                    top: dropdownRef.current
                      ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 2
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
                : {
                    bottom: dropdownRef.current
                      ? window.innerHeight - dropdownRef.current.getBoundingClientRect().top + window.scrollY + 2
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
            }
            initial={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -10 : 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="py-1">
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewDetails}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View Details
              </motion.button>

              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  // You can add edit payment functionality here
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Payment
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const LoadingSkeleton = () => {
  return (
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5">
      {/* Header Section Skeleton */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="mb-3 md:mb-0">
          <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
          <div className="h-4 w-64 rounded bg-gray-200"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-48 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(11)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(11)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section Skeleton */}
      <div className="flex items-center justify-between border-t py-3">
        <div className="h-6 w-48 rounded bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200"></div>
          ))}
          <div className="size-8 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}

// Statistics Cards Component using Agent Summary endpoint
const StatisticsCards = () => {
  const dispatch = useAppDispatch()
  const { agentSummary, agentSummaryLoading } = useAppSelector((state) => state.agents)
  const [activeRange, setActiveRange] = useState<TimeRange>(TimeRange.Today)

  useEffect(() => {
    dispatch(fetchAgentSummary())
  }, [dispatch])

  const timeRangeTabs = [
    { value: TimeRange.Today, label: "Today" },
    { value: TimeRange.Yesterday, label: "Yesterday" },
    { value: TimeRange.ThisWeek, label: "This Week" },
    { value: TimeRange.ThisMonth, label: "This Month" },
    { value: TimeRange.LastMonth, label: "Last Month" },
    { value: TimeRange.ThisYear, label: "This Year" },
    { value: TimeRange.AllTime, label: "All Time" },
  ]

  // Get the selected period from agent summary
  const currentPeriod = agentSummary?.periods?.find((period) => period.range === activeRange)
  const summary = currentPeriod ?? {
    collectedAmount: 0,
    collectedCount: 0,
    prepaidCollectedAmount: 0,
    prepaidCollectedCount: 0,
    postpaidCollectedAmount: 0,
    postpaidCollectedCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    cashClearedAmount: 0,
    cashClearanceCount: 0,
    billingDisputesRaised: 0,
    billingDisputesResolved: 0,
    changeRequestsRaised: 0,
    changeRequestsResolved: 0,
    outstandingCashEstimate: 0,
    collectionsByChannel: [],
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "Cash":
        return "💵"
      case "BankTransfer":
        return "🏦"
      case "Pos":
        return "💳"
      case "Card":
        return "💳"
      case "VendorWallet":
        return "👛"
      case "Chaque":
        return "📝"
      default:
        return "💰"
    }
  }

  if (agentSummaryLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white/10 md:h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Time Range Tabs */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        {timeRangeTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveRange(tab.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all md:px-4 md:py-2 md:text-sm ${
              activeRange === tab.value
                ? "bg-white text-[#004B23] shadow-md"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Statistics Cards Grid */}
      <motion.div
        key={activeRange}
        className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Total Collected Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/5 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
                <span className="text-sm">₦</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Total Collected</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
              {formatCurrency(summary.collectedAmount)}
            </p>
            <p className="mt-1 text-xs text-white/60">{summary.collectedCount} transactions</p>
          </div>
        </div>

        {/* Prepaid Collections Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-blue-400/10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-400/20">
                <span className="text-sm text-blue-300">⚡</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Prepaid</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
              {formatCurrency(summary.prepaidCollectedAmount)}
            </p>
            <p className="mt-1 text-xs text-blue-300/80">{summary.prepaidCollectedCount} transactions</p>
          </div>
        </div>

        {/* Postpaid Collections Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-amber-400/10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-400/20">
                <span className="text-sm text-amber-300">📋</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Postpaid</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
              {formatCurrency(summary.postpaidCollectedAmount)}
            </p>
            <p className="mt-1 text-xs text-amber-300/80">{summary.postpaidCollectedCount} transactions</p>
          </div>
        </div>

        {/* Pending Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-orange-400/10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-orange-400/20">
                <span className="text-sm text-orange-300">⏳</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Pending</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
              {formatCurrency(summary.pendingAmount)}
            </p>
            <p className="mt-1 text-xs text-orange-300/80">{summary.pendingCount} awaiting</p>
          </div>
        </div>

        {/* Cash Cleared Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-emerald-400/10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/20">
                <span className="text-sm text-emerald-300">✓</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Cash Cleared</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
              {formatCurrency(summary.cashClearedAmount)}
            </p>
            <p className="mt-1 text-xs text-emerald-300/80">{summary.cashClearanceCount} clearances</p>
          </div>
        </div>

        {/* Outstanding Cash Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-red-400/10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-400/20">
                <span className="text-sm text-red-300">💰</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Outstanding Cash</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
              {formatCurrency(summary.outstandingCashEstimate)}
            </p>
            <p className="mt-1 text-xs text-red-300/80">Estimate</p>
          </div>
        </div>

        {/* Billing Disputes Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-purple-400/10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-purple-400/20">
                <span className="text-sm text-purple-300">⚠️</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Billing Disputes</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">{summary.billingDisputesRaised}</p>
            <p className="mt-1 text-xs text-purple-300/80">{summary.billingDisputesResolved} resolved</p>
          </div>
        </div>

        {/* Change Requests Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-cyan-400/10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-400/20">
                <span className="text-sm text-cyan-300">📝</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Change Requests</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">{summary.changeRequestsRaised}</p>
            <p className="mt-1 text-xs text-cyan-300/80">{summary.changeRequestsResolved} resolved</p>
          </div>
        </div>
      </motion.div>

      {/* Collections by Channel */}
      {summary.collectionsByChannel && summary.collectionsByChannel.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-4"
        >
          <h3 className="mb-3 text-sm font-medium text-white/80">Collections by Channel</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {summary.collectionsByChannel.map((channel) => (
              <div
                key={channel.channel}
                className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15"
              >
                <div className="relative">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
                      <span className="text-sm">{getChannelIcon(channel.channel)}</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/70">{channel.channel}</p>
                  <p className="mt-1 text-lg font-bold text-white md:text-xl">{formatCurrency(channel.amount)}</p>
                  <p className="mt-1 text-xs text-white/60">{channel.count} transactions</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

interface AppliedFilters {
  agentId?: number
  status?: PaymentStatus
  channel?: PaymentChannel
  collectorType?: CollectorType
  paymentTypeId?: number
  paidFromUtc?: string
  paidToUtc?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

interface AllPaymentsTableProps {
  agentId?: number
  customerId?: number
  appliedFilters?: AppliedFilters
  showStatisticsOnly?: boolean
  showMobileFilters?: boolean
  setShowMobileFilters?: (show: boolean) => void
  showDesktopFilters?: boolean
  setShowDesktopFilters?: (show: boolean) => void
  getActiveFilterCount?: () => number
}

const AllPaymentsTable: React.FC<AllPaymentsTableProps> = ({
  agentId,
  customerId,
  appliedFilters = {} as AppliedFilters,
  showStatisticsOnly = false,
  showMobileFilters,
  setShowMobileFilters,
  showDesktopFilters,
  setShowDesktopFilters,
  getActiveFilterCount,
}) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { payments, paymentsLoading, paymentsError, paymentsPagination } = useAppSelector((state) => state.agents)
  const { agent, user } = useAppSelector((state) => state.auth)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [showConfirmForm, setShowConfirmForm] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showVendTokenModal, setShowVendTokenModal] = useState(false)
  const [showCollectPaymentReceiptModal, setShowCollectPaymentReceiptModal] = useState(false)

  // const handleViewPaymentDetails = (payment: Payment) => {
  //   router.push(`/agents/payments/payment-details/${payment.id}`)
  // }

  const handleConfirmPayment = (payment: Payment) => {
    dispatch(clearConfirmPayment())
    setSelectedPayment(payment)
    setShowConfirmForm(true)
  }

  const handleCloseConfirmForm = () => {
    setShowConfirmForm(false)
    setSelectedPayment(null)
  }

  const handleConfirmSuccess = () => {
    // Refetch payments to update the list
    const fetchParams: PaymentsRequestParams = {
      pageNumber: paymentsPagination.currentPage,
      pageSize: pageSize,
      ...(agentId !== undefined ? { agentId } : appliedFilters.agentId ? { agentId: appliedFilters.agentId } : {}),
      ...(customerId !== undefined && { customerId }),
      ...(searchText && { search: searchText }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.channel && { channel: appliedFilters.channel }),
      ...(appliedFilters.collectorType && { collectorType: appliedFilters.collectorType }),
      ...(appliedFilters.paymentTypeId && { paymentTypeId: appliedFilters.paymentTypeId }),
      ...(appliedFilters.paidFromUtc && { paidFromUtc: appliedFilters.paidFromUtc }),
      ...(appliedFilters.paidToUtc && { paidToUtc: appliedFilters.paidToUtc }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }
    dispatch(fetchPayments(fetchParams))
  }

  const handleDownloadReceipt = (payment: Payment) => {
    setSelectedPayment(payment)
    // Determine which modal to show based on payment type
    if (
      payment.paymentTypeName?.toLowerCase().includes("token") ||
      payment.paymentTypeName?.toLowerCase().includes("vend")
    ) {
      setShowVendTokenModal(true)
    } else {
      setShowCollectPaymentReceiptModal(true)
    }
  }

  const handleCloseReceiptModals = () => {
    setShowVendTokenModal(false)
    setShowCollectPaymentReceiptModal(false)
    setSelectedPayment(null)
  }

  // Get pagination values from Redux state
  const currentPage = paymentsPagination.currentPage
  const pageSize = paymentsPagination.pageSize
  const totalRecords = paymentsPagination.totalCount
  const totalPages = paymentsPagination.totalPages

  // Fetch payments on component mount and when search/pagination/filters change
  useEffect(() => {
    const fetchParams: PaymentsRequestParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
      // Use agentId prop if provided, otherwise use appliedFilters.agentId
      ...(agentId !== undefined ? { agentId } : appliedFilters.agentId ? { agentId: appliedFilters.agentId } : {}),
      ...(customerId !== undefined && { customerId }),
      ...(searchText && { search: searchText }),
      // Applied filters from parent component
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.channel && { channel: appliedFilters.channel }),
      ...(appliedFilters.collectorType && { collectorType: appliedFilters.collectorType }),
      ...(appliedFilters.paymentTypeId && { paymentTypeId: appliedFilters.paymentTypeId }),
      ...(appliedFilters.paidFromUtc && { paidFromUtc: appliedFilters.paidFromUtc }),
      ...(appliedFilters.paidToUtc && { paidToUtc: appliedFilters.paidToUtc }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    dispatch(fetchPayments(fetchParams))
  }, [
    dispatch,
    currentPage,
    pageSize,
    searchText,
    agentId,
    customerId,
    appliedFilters.status,
    appliedFilters.channel,
    appliedFilters.collectorType,
    appliedFilters.paymentTypeId,
    appliedFilters.paidFromUtc,
    appliedFilters.paidToUtc,
    appliedFilters.sortBy,
    appliedFilters.sortOrder,
  ])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearPayments())
      dispatch(clearConfirmPayment())
    }
  }, [dispatch])

  const getStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Confirmed:
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          dotColor: "#589E67",
        }
      case PaymentStatus.Pending:
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
          dotColor: "#D97706",
        }
      case PaymentStatus.Failed:
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          dotColor: "#AF4B4B",
        }
      case PaymentStatus.Reversed:
        return {
          backgroundColor: "#EFF6FF",
          color: "#3B82F6",
          dotColor: "#3B82F6",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          dotColor: "#6B7280",
        }
    }
  }

  const getChannelStyle = (channel: PaymentChannel) => {
    switch (channel) {
      case PaymentChannel.Cash:
        return {
          backgroundColor: "#F3E8FF",
          color: "#7C3AED",
        }
      case PaymentChannel.BankTransfer:
        return {
          backgroundColor: "#E0F2FE",
          color: "#0284C7",
        }
      case PaymentChannel.Pos:
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      case PaymentChannel.Card:
        return {
          backgroundColor: "#FCE7F3",
          color: "#DB2777",
        }
      case PaymentChannel.VendorWallet:
        return {
          backgroundColor: "#DCFCE7",
          color: "#16A34A",
        }
      case PaymentChannel.Chaque:
        return {
          backgroundColor: "#FFEDD5",
          color: "#EA580C",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getCollectorTypeStyle = (collectorType: CollectorType) => {
    switch (collectorType) {
      case CollectorType.Customer:
        return {
          backgroundColor: "#F0F9FF",
          color: "#0C4A6E",
        }
      case CollectorType.SalesRep:
        return {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
        }
      case CollectorType.Vendor:
        return {
          backgroundColor: "#F3E8FF",
          color: "#5B21B6",
        }
      case CollectorType.Staff:
        return {
          backgroundColor: "#F0FDF4",
          color: "#166534",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getPaymentCategoryStyle = (isPrepaid: boolean) => {
    if (isPrepaid) {
      return {
        backgroundColor: "#DBEAFE",
        color: "#1E40AF",
      }
    }
    return {
      backgroundColor: "#FEF3C7",
      color: "#92400E",
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      setSearchText(trimmed)
      // Reset to first page when searching
      dispatch(setPaymentsPagination({ page: 1, pageSize }))
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
    // Reset to first page when clearing search
    dispatch(setPaymentsPagination({ page: 1, pageSize }))
  }

  const [isExporting, setIsExporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportDateRange, setExportDateRange] = useState<"all" | "today" | "week" | "month" | "custom">("all")
  const [exportFromDate, setExportFromDate] = useState("")
  const [exportToDate, setExportToDate] = useState("")
  const [exportPaymentCategory, setExportPaymentCategory] = useState<"all" | "prepaid" | "postpaid">("all")

  // Additional state for modal tabs
  const [exportModalTab, setExportModalTab] = useState<"basic" | "advanced">("basic")
  const [exportChannel, setExportChannel] = useState<string>("all")
  const [exportStatus, setExportStatus] = useState<string>("all")
  const [exportCollectorType, setExportCollectorType] = useState<string>("all")
  const [exportClearanceStatus, setExportClearanceStatus] = useState<string>("all")
  const [exportCustomerId, setExportCustomerId] = useState<string>("")
  const [exportVendorId, setExportVendorId] = useState<string>("")
  const [exportAgentId, setExportAgentId] = useState<string>("")
  const [exportReference, setExportReference] = useState<string>("")
  const [exportAccountNumber, setExportAccountNumber] = useState<string>("")
  const [exportMeterNumber, setExportMeterNumber] = useState<string>("")
  const [exportPaymentTypeId, setExportPaymentTypeId] = useState<string>("")
  const [exportAreaOfficeId, setExportAreaOfficeId] = useState<string>("")
  const [exportDistributionSubstationId, setExportDistributionSubstationId] = useState<string>("")
  const [exportFeederId, setExportFeederId] = useState<string>("")
  const [exportServiceCenterId, setExportServiceCenterId] = useState<string>("")
  const [exportPostpaidBillId, setExportPostpaidBillId] = useState<string>("")
  const [exportSearch, setExportSearch] = useState<string>("")
  const [exportIsCleared, setIsExportCleared] = useState<string>("all")
  const [exportIsRemitted, setIsExportRemitted] = useState<string>("all")
  const [exportCustomerIsPPM, setExportCustomerIsPPM] = useState<string>("all")
  const [exportCustomerIsMD, setExportCustomerIsMD] = useState<string>("all")
  const [exportCustomerIsUrban, setExportCustomerIsUrban] = useState<string>("all")
  const [exportCustomerProvinceId, setExportCustomerProvinceId] = useState<string>("")

  const getExportDateRange = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (exportDateRange) {
      case "today":
        const endOfToday = new Date(today)
        endOfToday.setHours(23, 59, 59, 999)
        return {
          from: today.toISOString(),
          to: endOfToday.toISOString(),
        }
      case "week":
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        const endOfWeek = new Date()
        endOfWeek.setHours(23, 59, 59, 999)
        return {
          from: weekAgo.toISOString(),
          to: endOfWeek.toISOString(),
        }
      case "month":
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        const endOfMonth = new Date()
        endOfMonth.setHours(23, 59, 59, 999)
        return {
          from: monthAgo.toISOString(),
          to: endOfMonth.toISOString(),
        }
      case "custom":
        const fromDate = exportFromDate ? new Date(exportFromDate) : null
        const toDate = exportToDate ? new Date(exportToDate) : null

        if (fromDate) fromDate.setHours(0, 0, 0, 0)
        if (toDate) toDate.setHours(23, 59, 59, 999)

        return {
          from: fromDate ? fromDate.toISOString() : undefined,
          to: toDate ? toDate.toISOString() : undefined,
        }
      default:
        return { from: undefined, to: undefined }
    }
  }

  const exportToCSV = async () => {
    console.log("Export function called!")
    setIsExporting(true)
    setShowExportModal(false)

    try {
      const dateRange = getExportDateRange()

      // Build API parameters using the proper endpoint parameters
      const params: any = {
        PageNumber: 1,
        PageSize: 1000000,
        // Use proper date-time parameters
        ...(dateRange.from && { PaidFromUtc: dateRange.from }),
        ...(dateRange.to && { PaidToUtc: dateRange.to }),
        // Add channel filter
        ...(exportChannel !== "all" && { Channel: exportChannel }),
        // Add status filter
        ...(exportStatus !== "all" && { Status: exportStatus }),
        // Add collector type filter
        ...(exportCollectorType !== "all" && { CollectorType: exportCollectorType }),
        // Add ID filters
        ...(exportCustomerId && { CustomerId: parseInt(exportCustomerId) }),
        ...(exportVendorId && { VendorId: parseInt(exportVendorId) }),
        ...(exportAgentId && { AgentId: parseInt(exportAgentId) }),
        ...(exportPaymentTypeId && { PaymentTypeId: parseInt(exportPaymentTypeId) }),
        ...(exportAreaOfficeId && { AreaOfficeId: parseInt(exportAreaOfficeId) }),
        ...(exportDistributionSubstationId && { DistributionSubstationId: parseInt(exportDistributionSubstationId) }),
        ...(exportFeederId && { FeederId: parseInt(exportFeederId) }),
        ...(exportServiceCenterId && { ServiceCenterId: parseInt(exportServiceCenterId) }),
        ...(exportPostpaidBillId && { PostpaidBillId: parseInt(exportPostpaidBillId) }),
        ...(exportCustomerProvinceId && { CustomerProvinceId: parseInt(exportCustomerProvinceId) }),
        // Add string filters
        ...(exportReference && { Reference: exportReference }),
        ...(exportAccountNumber && { AccountNumber: exportAccountNumber }),
        ...(exportMeterNumber && { MeterNumber: exportMeterNumber }),
        ...(exportSearch && { Search: exportSearch }),
        // Add boolean filters
        ...(exportIsCleared !== "all" && { IsCleared: exportIsCleared === "true" }),
        ...(exportIsRemitted !== "all" && { IsRemitted: exportIsRemitted === "true" }),
        ...(exportCustomerIsPPM !== "all" && { CustomerIsPPM: exportCustomerIsPPM === "true" }),
        ...(exportCustomerIsMD !== "all" && { CustomerIsMD: exportCustomerIsMD === "true" }),
        ...(exportCustomerIsUrban !== "all" && { CustomerIsUrban: exportCustomerIsUrban === "true" }),
        // Add clearance status filter
        ...(exportClearanceStatus !== "all" && { ClearanceStatus: exportClearanceStatus }),
        // Add prepaid filter for payment category
        ...(exportPaymentCategory === "prepaid" && { PrepaidOnly: true }),
      }

      console.log("Exporting payments with params:", params)

      // Fetch all payments from API
      const response = await api.get(buildApiUrl(API_ENDPOINTS.AGENTS.PAYMENTS), { params })

      console.log("API Response:", response)

      let allPayments: Payment[] = response.data?.data || []

      console.log("Payments found:", allPayments.length)

      // If postpaid category is selected, filter out prepaid payments
      if (exportPaymentCategory === "postpaid") {
        allPayments = allPayments.filter((payment) => payment.isPrepaid === false)
        console.log("After postpaid filter:", allPayments.length)
      }

      if (allPayments.length === 0) {
        console.log("No payments found for export")
        // Show user feedback instead of silently returning
        alert("No payments found matching your criteria. Please adjust your filters and try again.")
        setIsExporting(false)
        return
      }

      const headers = [
        "Reference",
        "Amount",
        "Customer Name",
        "Customer Account",
        "Agent Name",
        "Agent Code",
        "Payment Type",
        "Category",
        "Channel",
        "Status",
        "Collector Type",
        "Date/Time",
        "Area Office",
      ]

      const csvRows = allPayments.map((payment) => [
        payment.reference || `PAY-${payment.id}`,
        payment.amount,
        payment.customerName || "-",
        payment.customerAccountNumber || "-",
        payment.agentName || "-",
        payment.agentCode || "-",
        payment.paymentTypeName || "-",
        payment.isPrepaid ? "Prepaid" : "Postpaid",
        payment.channel,
        payment.status,
        payment.collectorType,
        payment.paidAtUtc ? formatDate(payment.paidAtUtc) : "-",
        payment.areaOfficeName || "-",
      ])

      const escapeCSV = (value: string | number | boolean) => {
        const stringValue = String(value)
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }

      const csvContent = [headers.map(escapeCSV).join(","), ...csvRows.map((row) => row.map(escapeCSV).join(","))].join(
        "\n"
      )

      console.log("CSV content generated, length:", csvContent.length)

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      const categoryLabel = exportPaymentCategory !== "all" ? `_${exportPaymentCategory}` : ""
      link.setAttribute("download", `payments${categoryLabel}_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("Export completed successfully")
    } catch (error) {
      console.error("Failed to export payments:", error)
      // Show user feedback for errors
      alert(`Failed to export payments: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`)
    } finally {
      setIsExporting(false)
    }
  }

  const paginate = (pageNumber: number) => {
    dispatch(setPaymentsPagination({ page: pageNumber, pageSize }))
  }

  // If only showing statistics, return just the statistics cards
  if (showStatisticsOnly) {
    return <StatisticsCards />
  }

  if (paymentsLoading) return <LoadingSkeleton />

  return (
    <div className="w-full">
      {/* Header Section with Title, Search and Filters */}
      <div className="mb-4 space-y-4">
        {/* Title Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-xl font-semibold text-gray-900 md:text-2xl">Payments</h4>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border-b">
              <SearchModule
                value={searchInput}
                onChange={handleSearch}
                onCancel={handleCancelSearch}
                onSearch={handleManualSearch}
                placeholder="Search payments..."
                className="w-full max-w-md"
                bgClassName="bg-gray-50"
              />
            </div>
            {/* Mobile Filter Button */}
            {setShowMobileFilters && (
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 2xl:hidden"
              >
                <Filter className="size-4" />
                <span className="hidden xs:inline">Filters</span>
                {getActiveFilterCount && getActiveFilterCount() > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#004B23] text-xs font-semibold text-white">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            )}

            {/* Desktop Filter Toggle */}
            {setShowDesktopFilters && (
              <button
                onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 2xl:flex"
              >
                {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                {showDesktopFilters ? "Hide Filters" : "Show Filters"}
                {getActiveFilterCount && getActiveFilterCount() > 0 && (
                  <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-[#004B23] text-xs font-semibold text-white">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            )}

            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              disabled={isExporting}
              className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium transition-colors ${
                isExporting ? "cursor-not-allowed text-gray-400" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Download className={`size-4 ${isExporting ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export"}</span>
            </button>
          </div>
        </div>

        {/* Search Row */}
      </div>

      {/* Export CSV Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              className="w-full max-w-lg rounded-lg bg-white shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Export Payments to CSV</h3>
                  <button onClick={() => setShowExportModal(false)} className="rounded-full p-1 hover:bg-gray-100">
                    <X className="size-5 text-gray-500" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="mt-3 flex space-x-1 rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setExportModalTab("basic")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      exportModalTab === "basic"
                        ? "bg-white text-[#004B23] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Basic Filters
                  </button>
                  <button
                    onClick={() => setExportModalTab("advanced")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      exportModalTab === "advanced"
                        ? "bg-white text-[#004B23] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Advanced Filters
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto p-4">
                {exportModalTab === "basic" ? (
                  <div className="space-y-4">
                    {/* Date Range */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "all", label: "All Time" },
                          { value: "today", label: "Today" },
                          { value: "week", label: "Last 7 Days" },
                          { value: "month", label: "Last 30 Days" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setExportDateRange(option.value as typeof exportDateRange)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                              exportDateRange === option.value
                                ? "border-[#004B23] bg-[#004B23]/10 text-[#004B23]"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setExportDateRange("custom")}
                        className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          exportDateRange === "custom"
                            ? "border-[#004B23] bg-[#004B23]/10 text-[#004B23]"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Calendar className="mr-2 inline-block size-4" />
                        Custom Date Range
                      </button>
                    </div>

                    {exportDateRange === "custom" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">From</label>
                          <input
                            type="date"
                            value={exportFromDate}
                            onChange={(e) => setExportFromDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">To</label>
                          <input
                            type="date"
                            value={exportToDate}
                            onChange={(e) => setExportToDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Payment Category */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Payment Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "all", label: "All" },
                          { value: "prepaid", label: "Prepaid" },
                          { value: "postpaid", label: "Postpaid" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setExportPaymentCategory(option.value as typeof exportPaymentCategory)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                              exportPaymentCategory === option.value
                                ? "border-[#004B23] bg-[#004B23]/10 text-[#004B23]"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Search */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Quick Search</label>
                      <input
                        type="text"
                        placeholder="Search payments..."
                        value={exportSearch}
                        onChange={(e) => setExportSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Status and Channel */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                        <select
                          value={exportStatus}
                          onChange={(e) => setExportStatus(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        >
                          <option value="all">All Status</option>
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Failed">Failed</option>
                          <option value="Reversed">Reversed</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Channel</label>
                        <select
                          value={exportChannel}
                          onChange={(e) => setExportChannel(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        >
                          <option value="all">All Channels</option>
                          <option value="Cash">Cash</option>
                          <option value="BankTransfer">Bank Transfer</option>
                          <option value="Pos">POS</option>
                          <option value="Card">Card</option>
                          <option value="VendorWallet">Vendor Wallet</option>
                        </select>
                      </div>
                    </div>

                    {/* Collector Type and Clearance Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Collector Type</label>
                        <select
                          value={exportCollectorType}
                          onChange={(e) => setExportCollectorType(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        >
                          <option value="all">All Types</option>
                          <option value="Customer">Customer</option>
                          <option value="SalesRep">Sales Rep</option>
                          <option value="Vendor">Vendor</option>
                          <option value="Staff">Staff</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Clearance Status</label>
                        <select
                          value={exportClearanceStatus}
                          onChange={(e) => setExportClearanceStatus(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        >
                          <option value="all">All Status</option>
                          <option value="Uncleared">Uncleared</option>
                          <option value="Cleared">Cleared</option>
                          <option value="ClearedWithCondition">Cleared with Condition</option>
                        </select>
                      </div>
                    </div>

                    {/* ID Filters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Customer ID</label>
                        <input
                          type="text"
                          placeholder="Enter ID"
                          value={exportCustomerId}
                          onChange={(e) => setExportCustomerId(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Reference</label>
                        <input
                          type="text"
                          placeholder="Enter reference"
                          value={exportReference}
                          onChange={(e) => setExportReference(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        />
                      </div>
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Account Number</label>
                      <input
                        type="text"
                        placeholder="Enter account number"
                        value={exportAccountNumber}
                        onChange={(e) => setExportAccountNumber(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      />
                    </div>

                    {/* Boolean Filters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Cleared Status</label>
                        <select
                          value={exportIsCleared}
                          onChange={(e) => setIsExportCleared(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        >
                          <option value="all">Any</option>
                          <option value="true">Cleared</option>
                          <option value="false">Not Cleared</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Remitted Status</label>
                        <select
                          value={exportIsRemitted}
                          onChange={(e) => setIsExportRemitted(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                        >
                          <option value="all">Any</option>
                          <option value="true">Remitted</option>
                          <option value="false">Not Remitted</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={exportToCSV}
                    disabled={exportDateRange === "custom" && !exportFromDate && !exportToDate}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                      exportDateRange === "custom" && !exportFromDate && !exportToDate
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-[#004B23] hover:bg-[#003a1b]"
                    }`}
                  >
                    <Download className="mr-2 inline-block size-4" />
                    Export
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {paymentsError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
          <p>Error loading payments: {paymentsError}</p>
        </div>
      )}

      {payments.length === 0 ? (
        <motion.div
          className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F6F6F9]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.p
            className="text-base font-bold text-[#202B3C]"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {searchText ? "No matching payments found" : "No payments available"}
          </motion.p>
          <motion.p
            className="text-sm text-gray-600"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {searchText
              ? "Try adjusting your search term"
              : "Payments will appear here once transactions are processed"}
          </motion.p>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="w-full overflow-x-auto border-x bg-[#FFFFFF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      Ref
                    </div>
                  </th>
                  <th
                    className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center gap-2">
                      Amount <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("customerName")}
                  >
                    <div className="flex items-center gap-2">
                      Customer <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("agentName")}
                  >
                    <div className="flex items-center gap-2">
                      Agent <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("paymentTypeName")}
                  >
                    <div className="flex items-center gap-2">
                      Payment Type <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("isPrepaid")}
                  >
                    <div className="flex items-center gap-2">
                      Category <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("channel")}
                  >
                    <div className="flex items-center gap-2">
                      Channel <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("collectorType")}
                  >
                    <div className="flex items-center gap-2">
                      Collector <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("paidAtUtc")}
                  >
                    <div className="flex items-center gap-2">
                      Date/Time <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("areaOfficeName")}
                  >
                    <div className="flex items-center gap-2">
                      Area Office <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {payments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                        {payment.reference || `PAY-${payment.id}`}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{payment.customerName || "-"}</div>
                          <div className="text-xs text-gray-500">{payment.customerAccountNumber || ""}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{payment.agentName || "-"}</div>
                          <div className="text-xs text-gray-500">
                            {payment.agentCode ? `Code: ${payment.agentCode}` : ""}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{payment.paymentTypeName || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getPaymentCategoryStyle(payment.isPrepaid)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {payment.isPrepaid ? "Prepaid" : "Postpaid"}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getChannelStyle(payment.channel)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {payment.channel}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getStatusStyle(payment.status)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: getStatusStyle(payment.status).dotColor,
                            }}
                          ></span>
                          {payment.status}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getCollectorTypeStyle(payment.collectorType)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {payment.collectorType}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {payment.paidAtUtc ? formatDate(payment.paidAtUtc) : "-"}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{payment.areaOfficeName || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        {payment.status === PaymentStatus.Pending ? (
                          (agent && (agent.agentType === "Supervisor" || agent.agentType === "FinanceManager")) ||
                          user?.roles?.some((role) => role.slug === "superadmin") ? (
                            <ButtonModule variant="outline" size="sm" onClick={() => handleConfirmPayment(payment)}>
                              Confirm
                            </ButtonModule>
                          ) : (
                            <p className="text-center">-</p>
                          )
                        ) : payment.status === PaymentStatus.Confirmed ? (
                          <div className="flex gap-1">
                            <ButtonModule variant="outline" size="sm" onClick={() => handleDownloadReceipt(payment)}>
                              Download Receipt
                            </ButtonModule>
                          </div>
                        ) : (
                          <p className="text-center">-</p>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          <motion.div
            className="flex items-center justify-between border-t py-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of{" "}
              {totalRecords} payments
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                <MdOutlineArrowBackIosNew />
              </motion.button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = index + 1
                } else if (currentPage <= 3) {
                  pageNum = index + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index
                } else {
                  pageNum = currentPage - 2 + index
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => paginate(pageNum)}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-[#004B23] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    {pageNum}
                  </motion.button>
                )
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

              {totalPages > 5 && currentPage < totalPages - 1 && (
                <motion.button
                  onClick={() => paginate(totalPages)}
                  className={`flex size-8 items-center justify-center rounded-md text-sm ${
                    currentPage === totalPages
                      ? "bg-[#004B23] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {totalPages}
                </motion.button>
              )}

              <motion.button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.1 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                <MdOutlineArrowForwardIos />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}

      {/* Confirm Payment Form */}
      {selectedPayment && (
        <ConfirmPaymentForm
          isOpen={showConfirmForm}
          onClose={handleCloseConfirmForm}
          paymentId={selectedPayment.id}
          paymentRef={selectedPayment.reference}
          customerName={selectedPayment.customerName}
          amount={selectedPayment.amount}
          onSuccess={handleConfirmSuccess}
        />
      )}

      {/* Vend Token Modal */}
      {selectedPayment &&
        showVendTokenModal &&
        (() => {
          const firstToken = selectedPayment.tokens?.[0]
          return (
            <VendTokenModal
              isOpen={showVendTokenModal}
              onRequestClose={handleCloseReceiptModals}
              tokenData={
                firstToken
                  ? {
                      token: firstToken.token,
                      vendedAmount: firstToken.vendedAmount,
                      unit: firstToken.unit,
                      description: firstToken.description,
                      drn: firstToken.drn,
                    }
                  : {
                      token: "N/A",
                      vendedAmount: selectedPayment.amount.toString(),
                      unit: "kWh",
                      description: selectedPayment.paymentTypeName || "Energy Payment",
                      drn: "N/A",
                    }
              }
              paymentData={{
                reference: selectedPayment.reference,
                customerName: selectedPayment.customerName || "",
                customerAccountNumber: selectedPayment.customerAccountNumber || "",
                customerAddress: selectedPayment.customerAddress,
                customerPhoneNumber: selectedPayment.phoneNumber ?? undefined,
                customerMeterNumber: firstToken?.drn,
                accountType: undefined,
                tariffRate: undefined,
                units: firstToken ? parseFloat(firstToken.vendedAmount) : undefined,
                vatRate: undefined,
                vatAmount: selectedPayment.vatAmount || undefined,
                electricityAmount: selectedPayment.amountApplied || undefined,
                outstandingDebt: selectedPayment.customerOutstandingDebtBalance || undefined,
                debtPayable: selectedPayment.recoveryAmount || undefined,
                totalAmountPaid: selectedPayment.amount,
                currency: selectedPayment.currency || "NGN",
                channel: selectedPayment.channel,
                status: selectedPayment.status,
                paymentTypeName: selectedPayment.paymentTypeName,
                paidAtUtc: selectedPayment.paidAtUtc,
                externalReference: selectedPayment.externalReference ?? undefined,
              }}
            />
          )
        })()}

      {/* Collect Payment Receipt Modal */}
      {selectedPayment && showCollectPaymentReceiptModal && (
        <CollectPaymentReceiptModal
          isOpen={showCollectPaymentReceiptModal}
          onRequestClose={handleCloseReceiptModals}
          tokenData={
            selectedPayment.tokens && selectedPayment.tokens.length > 0
              ? {
                  token: selectedPayment.tokens[0]?.token ?? "",
                  vendedAmount: selectedPayment.tokens[0]?.vendedAmount ?? "",
                  unit: selectedPayment.tokens[0]?.unit ?? "",
                  description: selectedPayment.tokens[0]?.description ?? "",
                  drn: selectedPayment.tokens[0]?.drn ?? "",
                }
              : undefined
          }
          paymentData={{
            reference: selectedPayment.reference,
            customerName: selectedPayment.customerName || "",
            customerAccountNumber: selectedPayment.customerAccountNumber || "",
            customerAddress: selectedPayment.customerAddress,
            customerPhoneNumber: selectedPayment.phoneNumber ?? undefined,
            customerMeterNumber:
              selectedPayment.tokens && selectedPayment.tokens.length > 0 ? selectedPayment.tokens[0]?.drn : undefined,
            accountType: undefined,
            tariffRate: undefined,
            units:
              selectedPayment.tokens && selectedPayment.tokens.length > 0
                ? parseFloat(selectedPayment.tokens[0]?.vendedAmount ?? "0")
                : undefined,
            vatRate: undefined,
            vatAmount: selectedPayment.vatAmount || undefined,
            electricityAmount: selectedPayment.amountApplied || undefined,
            outstandingDebt: selectedPayment.customerOutstandingDebtBalance || undefined,
            debtPayable: selectedPayment.recoveryAmount || undefined,
            totalAmountPaid: selectedPayment.amount,
            currency: selectedPayment.currency || "NGN",
            channel: selectedPayment.channel,
            status: selectedPayment.status,
            paymentTypeName: selectedPayment.paymentTypeName,
            paidAtUtc: selectedPayment.paidAtUtc,
            externalReference: selectedPayment.externalReference ?? undefined,
          }}
        />
      )}
    </div>
  )
}

export default AllPaymentsTable
