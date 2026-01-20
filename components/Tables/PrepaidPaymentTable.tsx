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
  clearError,
  clearPrepaidPayments,
  fetchPrepaidPayments,
  PrepaidCollectorType,
  PrepaidPayment,
  PrepaidPaymentChannel,
  PrepaidPaymentsRequestParams,
  PrepaidPaymentStatus,
  setPrepaidPaymentsPagination,
} from "lib/redux/agentSlice"
import { ButtonModule } from "components/ui/Button/Button"
import ConfirmPaymentForm from "components/Forms/ConfirmPaymentForm"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import { api } from "lib/redux/authSlice"
import VendTokenModal from "components/ui/Modal/vend-token-modal"
import CollectPaymentReceiptModal from "components/ui/Modal/collect-payment-receipt-modal"

interface ActionDropdownProps {
  payment: PrepaidPayment
  onViewDetails: (payment: PrepaidPayment) => void
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

interface AppliedFilters {
  agentId?: number
  status?: PrepaidPaymentStatus
  channel?: PrepaidPaymentChannel
  collectorType?: PrepaidCollectorType
  paymentTypeId?: number
  paidFromUtc?: string
  paidToUtc?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

interface AllPrepaidPaymentsTableProps {
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

const AllPrepaidPaymentsTable: React.FC<AllPrepaidPaymentsTableProps> = ({
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
  const { prepaidPayments, prepaidPaymentsLoading, prepaidPaymentsError, prepaidPaymentsPagination } = useAppSelector(
    (state) => state.agents
  )
  const { agent } = useAppSelector((state) => state.auth)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [showConfirmForm, setShowConfirmForm] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PrepaidPayment | null>(null)
  const [showVendTokenModal, setShowVendTokenModal] = useState(false)
  const [showCollectPaymentReceiptModal, setShowCollectPaymentReceiptModal] = useState(false)

  // const handleViewPaymentDetails = (payment: Payment) => {
  //   router.push(`/agents/payments/payment-details/${payment.id}`)
  // }

  const handleConfirmPayment = (payment: PrepaidPayment) => {
    setSelectedPayment(payment)
    setShowConfirmForm(true)
  }

  const handleCloseConfirmForm = () => {
    setShowConfirmForm(false)
    setSelectedPayment(null)
  }

  const handleConfirmSuccess = () => {
    // Refetch payments to update the list
    const fetchParams: PrepaidPaymentsRequestParams = {
      PageNumber: prepaidPaymentsPagination.currentPage,
      PageSize: pageSize,
      ...(agentId !== undefined
        ? { AgentId: agentId }
        : appliedFilters.agentId
        ? { AgentId: appliedFilters.agentId }
        : {}),
      ...(customerId !== undefined && { CustomerId: customerId }),
      ...(searchText && { Search: searchText }),
      ...(appliedFilters.status && { Status: appliedFilters.status }),
      ...(appliedFilters.channel && { Channel: appliedFilters.channel }),
      ...(appliedFilters.collectorType && { CollectorType: appliedFilters.collectorType }),
      ...(appliedFilters.paymentTypeId && { PaymentTypeId: appliedFilters.paymentTypeId }),
      ...(appliedFilters.paidFromUtc && { PaidFromUtc: appliedFilters.paidFromUtc }),
      ...(appliedFilters.paidToUtc && { PaidToUtc: appliedFilters.paidToUtc }),
    }
    dispatch(fetchPrepaidPayments(fetchParams))
  }

  const handleDownloadReceipt = (payment: PrepaidPayment) => {
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
  const currentPage = prepaidPaymentsPagination.currentPage
  const pageSize = prepaidPaymentsPagination.pageSize
  const totalRecords = prepaidPaymentsPagination.totalCount
  const totalPages = prepaidPaymentsPagination.totalPages

  // Fetch prepaid payments on component mount and when search/pagination/filters change
  useEffect(() => {
    const fetchParams: PrepaidPaymentsRequestParams = {
      PageNumber: currentPage,
      PageSize: pageSize,
      // Use agentId prop if provided, otherwise use appliedFilters.agentId
      ...(agentId !== undefined
        ? { AgentId: agentId }
        : appliedFilters.agentId
        ? { AgentId: appliedFilters.agentId }
        : {}),
      ...(customerId !== undefined && { CustomerId: customerId }),
      ...(searchText && { Search: searchText }),
      // Applied filters from parent component
      ...(appliedFilters.status && { Status: appliedFilters.status }),
      ...(appliedFilters.channel && { Channel: appliedFilters.channel }),
      ...(appliedFilters.collectorType && { CollectorType: appliedFilters.collectorType }),
      ...(appliedFilters.paymentTypeId && { PaymentTypeId: appliedFilters.paymentTypeId }),
      ...(appliedFilters.paidFromUtc && { PaidFromUtc: appliedFilters.paidFromUtc }),
      ...(appliedFilters.paidToUtc && { PaidToUtc: appliedFilters.paidToUtc }),
    }

    dispatch(fetchPrepaidPayments(fetchParams))
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
  ])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearPrepaidPayments())
    }
  }, [dispatch])

  const getStatusStyle = (status: PrepaidPaymentStatus) => {
    switch (status) {
      case "Confirmed":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          dotColor: "#589E67",
        }
      case "Pending":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
          dotColor: "#D97706",
        }
      case "Failed":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          dotColor: "#AF4B4B",
        }
      case "Reversed":
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

  const getChannelStyle = (channel: PrepaidPaymentChannel) => {
    switch (channel) {
      case "Cash":
        return {
          backgroundColor: "#F3E8FF",
          color: "#7C3AED",
        }
      case "BankTransfer":
        return {
          backgroundColor: "#E0F2FE",
          color: "#0284C7",
        }
      case "Pos":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      case "Card":
        return {
          backgroundColor: "#FCE7F3",
          color: "#DB2777",
        }
      case "VendorWallet":
        return {
          backgroundColor: "#DCFCE7",
          color: "#16A34A",
        }
      case "Chaque":
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

  const getCollectorTypeStyle = (collectorType: PrepaidCollectorType) => {
    switch (collectorType) {
      case "Customer":
        return {
          backgroundColor: "#F0F9FF",
          color: "#0C4A6E",
        }
      case "SalesRep":
        return {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
        }
      case "Vendor":
        return {
          backgroundColor: "#F3E8FF",
          color: "#5B21B6",
        }
      case "Staff":
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
      dispatch(
        setPrepaidPaymentsPagination({
          totalCount: prepaidPaymentsPagination.totalCount,
          totalPages: prepaidPaymentsPagination.totalPages,
          currentPage: 1,
          pageSize,
          hasNext: prepaidPaymentsPagination.hasNext,
          hasPrevious: false,
        })
      )
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
    // Reset to first page when clearing search
    dispatch(
      setPrepaidPaymentsPagination({
        totalCount: prepaidPaymentsPagination.totalCount,
        totalPages: prepaidPaymentsPagination.totalPages,
        currentPage: 1,
        pageSize,
        hasNext: prepaidPaymentsPagination.hasNext,
        hasPrevious: false,
      })
    )
  }

  const [isExporting, setIsExporting] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportDateRange, setExportDateRange] = useState<"all" | "today" | "week" | "month" | "custom">("all")
  const [exportFromDate, setExportFromDate] = useState("")
  const [exportToDate, setExportToDate] = useState("")

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
        return {
          from: weekAgo.toISOString(),
          to: new Date().toISOString(),
        }
      case "month":
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return {
          from: monthAgo.toISOString(),
          to: new Date().toISOString(),
        }
      case "custom":
        return {
          from: exportFromDate ? new Date(exportFromDate).toISOString() : undefined,
          to: exportToDate ? new Date(exportToDate + "T23:59:59").toISOString() : undefined,
        }
      default:
        return { from: undefined, to: undefined }
    }
  }

  const exportToCSV = async () => {
    setIsExporting(true)
    setShowExportModal(false)

    try {
      const dateRange = getExportDateRange()

      // Fetch all prepaid payments from API
      const response = await api.get(buildApiUrl(API_ENDPOINTS.AGENTS.PREPAID_PAYMENT), {
        params: {
          PageNumber: 1,
          PageSize: 10000,
          ...(agentId !== undefined
            ? { AgentId: agentId }
            : appliedFilters.agentId
            ? { AgentId: appliedFilters.agentId }
            : {}),
          ...(customerId !== undefined && { CustomerId: customerId }),
          ...(searchText && { Search: searchText }),
          ...(appliedFilters.status && { Status: appliedFilters.status }),
          ...(appliedFilters.channel && { Channel: appliedFilters.channel }),
          ...(appliedFilters.collectorType && { CollectorType: appliedFilters.collectorType }),
          ...(appliedFilters.paymentTypeId && { PaymentTypeId: appliedFilters.paymentTypeId }),
          ...(dateRange.from || appliedFilters.paidFromUtc
            ? { PaidFromUtc: dateRange.from || appliedFilters.paidFromUtc }
            : {}),
          ...(dateRange.to || appliedFilters.paidToUtc ? { PaidToUtc: dateRange.to || appliedFilters.paidToUtc } : {}),
          ...(appliedFilters.sortBy && { SortBy: appliedFilters.sortBy }),
          ...(appliedFilters.sortOrder && { SortOrder: appliedFilters.sortOrder }),
        },
      })

      const allPayments: PrepaidPayment[] = response.data?.data || []

      if (allPayments.length === 0) {
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

      const escapeCSV = (value: string | number) => {
        const stringValue = String(value)
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }

      const csvContent = [headers.map(escapeCSV).join(","), ...csvRows.map((row) => row.map(escapeCSV).join(","))].join(
        "\n"
      )

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `payments_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export payments:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const paginate = (pageNumber: number) => {
    dispatch(
      setPrepaidPaymentsPagination({
        totalCount: prepaidPaymentsPagination.totalCount,
        totalPages: prepaidPaymentsPagination.totalPages,
        currentPage: pageNumber,
        pageSize,
        hasNext: pageNumber < prepaidPaymentsPagination.totalPages,
        hasPrevious: pageNumber > 1,
      })
    )
  }

  // If only showing statistics, return just the statistics cards
  if (showStatisticsOnly) {
    const totalAmount = prepaidPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const confirmedCount = prepaidPayments.filter((p) => p.status === "Confirmed").length
    const pendingCount = prepaidPayments.filter((p) => p.status === "Pending").length
    const failedCount = prepaidPayments.filter((p) => p.status === "Failed").length
    const totalCount = prepaidPayments.length

    return (
      <motion.div
        className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Total Amount Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/5 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
                <span className="text-sm">₦</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Total Amount</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">{formatCurrency(totalAmount)}</p>
            <p className="mt-1 text-xs text-white/60">{totalCount} transactions</p>
          </div>
        </div>

        {/* Confirmed Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-emerald-400/10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/20">
                <span className="text-sm text-emerald-300">✓</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Confirmed</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">{confirmedCount}</p>
            <p className="mt-1 text-xs text-emerald-300/80">
              {totalCount > 0 ? ((confirmedCount / totalCount) * 100).toFixed(1) : 0}% success rate
            </p>
          </div>
        </div>

        {/* Pending Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-amber-400/10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-400/20">
                <span className="text-sm text-amber-300">⏳</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Pending</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">{pendingCount}</p>
            <p className="mt-1 text-xs text-amber-300/80">Awaiting confirmation</p>
          </div>
        </div>

        {/* Failed Card */}
        <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-red-400/10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-400/20">
                <span className="text-sm text-red-300">✕</span>
              </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Failed</p>
            <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">{failedCount}</p>
            <p className="mt-1 text-xs text-red-300/80">Requires attention</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (prepaidPaymentsLoading) return <LoadingSkeleton />

  return (
    <div className="w-full">
      {/* Header Section with Title, Search and Filters */}
      <div className="mb-4 space-y-4">
        {/* Title Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-xl font-semibold text-gray-900 md:text-2xl">Prepaid Payments</h4>
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
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Export Payments to CSV</h3>
                <button onClick={() => setShowExportModal(false)} className="rounded-full p-1 hover:bg-gray-100">
                  <X className="size-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
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
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">From</label>
                    <input
                      type="date"
                      value={exportFromDate}
                      onChange={(e) => setExportFromDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">To</label>
                    <input
                      type="date"
                      value={exportToDate}
                      onChange={(e) => setExportToDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                    />
                  </div>
                </div>
              )}

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {prepaidPaymentsError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
          <p>Error loading prepaid payments: {prepaidPaymentsError}</p>
        </div>
      )}

      {prepaidPayments.length === 0 ? (
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
                  {prepaidPayments.map((payment, index) => (
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
                        {payment.status === "Pending" ? (
                          agent && (agent.agentType === "Supervisor" || agent.agentType === "FinanceManager") ? (
                            <ButtonModule variant="outline" size="sm" onClick={() => handleConfirmPayment(payment)}>
                              Confirm
                            </ButtonModule>
                          ) : (
                            <p className="text-center">-</p>
                          )
                        ) : payment.status === "Confirmed" ? (
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
                customerAddress: undefined,
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
            customerAddress: undefined,
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

export default AllPrepaidPaymentsTable
