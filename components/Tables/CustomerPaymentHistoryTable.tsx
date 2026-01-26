"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { VscEye } from "react-icons/vsc"
import { ChevronDown } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearPaymentsStatus, getPaymentsList } from "lib/redux/customersDashboardSlice"
import Image from "next/image"
import { ButtonModule } from "components/ui/Button/Button"

// Payment status enum matching API
enum PaymentStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Failed = "Failed",
  Reversed = "Reversed",
}

// Payment channel enum matching API
enum PaymentChannel {
  Cash = "Cash",
  BankTransfer = "BankTransfer",
  Pos = "Pos",
  Card = "Card",
  VendorWallet = "VendorWallet",
  Chaque = "Chaque",
}

// Collector type enum matching API
enum CollectorType {
  Customer = "Customer",
  SalesRep = "SalesRep",
  Vendor = "Vendor",
  Staff = "Staff",
}

// Payment interface matching API response
interface Payment {
  id: number
  reference: string
  latitude: number
  longitude: number
  channel: string
  status: string
  collectorType: string
  amount: number
  amountApplied: number
  vatAmount: number
  overPaymentAmount: number
  outstandingAfterPayment: number
  outstandingBeforePayment: number
  currency: string
  paidAtUtc: string
  confirmedAtUtc: string | null
  customerId: number
  customerName: string
  customerAccountNumber: string
  postpaidBillId: number | null
  postpaidBillPeriod: string | null
  billTotalDue: number | null
  vendorId: number | null
  vendorName: string | null
  agentId: number | null
  agentCode: string | null
  agentName: string | null
  areaOfficeName: string | null
  distributionSubstationCode: string | null
  feederName: string | null
  paymentTypeId: number
  paymentTypeName: string
  isManualEntry: boolean
  isSystemGenerated: boolean
  evidenceFileUrl: string | null
  recoveryApplied: boolean
  recoveryAmount: number
  recoveryPolicyId: number | null
  recoveryPolicyName: string | null
  tokens: Array<{
    token: string
    tokenDec: string
    vendedAmount: string
    unit: string
    description: string
    drn: string
  }>
}

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
                  console.log("Update payment:", payment.id)
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

interface AllPaymentsTableProps {
  agentId?: number
  customerId?: number
  vendorId?: number
  areaOfficeId?: number
  distributionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

const AllPaymentsTable: React.FC<AllPaymentsTableProps> = ({
  agentId,
  customerId,
  vendorId,
  areaOfficeId,
  distributionSubstationId,
  feederId,
  serviceCenterId,
}) => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  // Redux state
  const paymentsList = useSelector((state: RootState) => state.customersDashboard.paymentsList)
  const paymentsPagination = useSelector((state: RootState) => state.customersDashboard.paymentsPagination)
  const isLoadingPayments = useSelector((state: RootState) => state.customersDashboard.isLoadingPayments)
  const paymentsError = useSelector((state: RootState) => state.customersDashboard.paymentsError)

  // Local state
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  // Filter dropdown states
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)
  const [isChannelFilterOpen, setIsChannelFilterOpen] = useState(false)
  const [isCollectorTypeFilterOpen, setIsCollectorTypeFilterOpen] = useState(false)

  // Filter values
  const [filters, setFilters] = useState({
    status: "",
    channel: "",
    collectorType: "",
    paymentTypeId: "",
  })

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
  })

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: PaymentStatus.Pending, label: "Pending" },
    { value: PaymentStatus.Confirmed, label: "Confirmed" },
    { value: PaymentStatus.Failed, label: "Failed" },
    { value: PaymentStatus.Reversed, label: "Reversed" },
  ]

  const channelOptions = [
    { value: "", label: "All Channels" },
    { value: PaymentChannel.Cash, label: "Cash" },
    { value: PaymentChannel.BankTransfer, label: "Bank Transfer" },
    { value: PaymentChannel.Pos, label: "POS" },
    { value: PaymentChannel.Card, label: "Card" },
    { value: PaymentChannel.VendorWallet, label: "Vendor Wallet" },
    { value: PaymentChannel.Chaque, label: "Chaque" },
  ]

  const collectorOptions = [
    { value: "", label: "All Collectors" },
    { value: CollectorType.Customer, label: "Customer" },
    { value: CollectorType.SalesRep, label: "Sales Rep" },
    { value: CollectorType.Vendor, label: "Vendor" },
    { value: CollectorType.Staff, label: "Staff" },
  ]

  const handleViewPaymentDetails = (payment: Payment) => {
    router.push(`/customer-dashboard/payments/payment-details/${payment.id}`)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (!target.closest('[data-dropdown-root="status-filter"]')) {
        setIsStatusFilterOpen(false)
      }

      if (!target.closest('[data-dropdown-root="channel-filter"]')) {
        setIsChannelFilterOpen(false)
      }

      if (!target.closest('[data-dropdown-root="collector-type-filter"]')) {
        setIsCollectorTypeFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Fetch payments when filters, search, or pagination changes
  useEffect(() => {
    const fetchPayments = () => {
      const requestParams = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        customerId,
        vendorId,
        agentId,
        areaOfficeId,
        distributionSubstationId,
        feederId,
        serviceCenterId,
        status: filters.status || undefined,
        channel: filters.channel || undefined,
        collectorType: filters.collectorType || undefined,
        paymentTypeId: filters.paymentTypeId ? parseInt(filters.paymentTypeId) : undefined,
        search: searchText || undefined,
      }

      // Remove undefined values
      const cleanParams = Object.fromEntries(Object.entries(requestParams).filter(([_, value]) => value !== undefined))

      dispatch(getPaymentsList(cleanParams as any))
    }

    fetchPayments()
  }, [
    dispatch,
    pagination.currentPage,
    pagination.pageSize,
    searchText,
    filters.status,
    filters.channel,
    filters.collectorType,
    filters.paymentTypeId,
    agentId,
    customerId,
    vendorId,
    areaOfficeId,
    distributionSubstationId,
    feederId,
    serviceCenterId,
  ])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearPaymentsStatus())
    }
  }, [dispatch])

  const getStatusStyle = (status: string) => {
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

  const getChannelStyle = (channel: string) => {
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

  const getCollectorTypeStyle = (collectorType: string) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
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

  const handleSearchChange = (value: string) => {
    setSearchText(value)
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setShowMobileSearch(false)
  }

  const handleStatusFilterChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status }))
    setIsStatusFilterOpen(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleChannelFilterChange = (channel: string) => {
    setFilters((prev) => ({ ...prev, channel }))
    setIsChannelFilterOpen(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleCollectorTypeFilterChange = (collectorType: string) => {
    setFilters((prev) => ({ ...prev, collectorType }))
    setIsCollectorTypeFilterOpen(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      channel: "",
      collectorType: "",
      paymentTypeId: "",
    })
    setSearchText("")
    setShowMobileSearch(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const paginate = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }))
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value)
    setPagination({ currentPage: 1, pageSize: newPageSize })
  }

  const getPageItems = (): (number | string)[] => {
    const total = paymentsPagination?.totalPages || 1
    const current = pagination.currentPage
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
    const total = paymentsPagination?.totalPages || 1
    const current = pagination.currentPage
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

  const changePage = (page: number) => {
    if (page > 0 && page <= (paymentsPagination?.totalPages || 1)) {
      setPagination((prev) => ({ ...prev, currentPage: page }))
    }
  }

  if (isLoadingPayments) return <LoadingSkeleton />

  const currentPayments = paymentsList || []
  const totalRecords = paymentsPagination?.totalCount || 0
  const totalPages = paymentsPagination?.totalPages || 1
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Payments</p>
          <p className="text-sm text-gray-600">View and manage all payment transactions</p>
        </div>
      </motion.div>

      {/* Header with Search and Mobile Search Toggle */}
      <motion.div
        className="flex flex-col py-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Mobile search input revealed when icon is tapped */}
        {showMobileSearch && (
          <div className="mb-3 sm:hidden">
            <SearchModule
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search by reference, customer name or account number"
              className="w-full"
            />
          </div>
        )}

        {/* Filters Section */}
        <motion.div
          className="mt-2 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Status Filter Dropdown */}
          <div className="relative" data-dropdown-root="status-filter">
            <button
              type="button"
              className="button-oulined flex items-center gap-2 text-sm md:text-base"
              onClick={() => setIsStatusFilterOpen((open) => !open)}
            >
              <IoMdFunnel className="size-4 md:size-5" />
              <span>
                {filters.status === PaymentStatus.Confirmed
                  ? "Confirmed"
                  : filters.status === PaymentStatus.Pending
                  ? "Pending"
                  : filters.status === PaymentStatus.Failed
                  ? "Failed"
                  : filters.status === PaymentStatus.Reversed
                  ? "Reversed"
                  : "All Status"}
              </span>
              <ChevronDown
                className={`size-3 text-gray-500 transition-transform md:size-4 ${
                  isStatusFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isStatusFilterOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                <div className="py-1">
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.status === "" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleStatusFilterChange("")}
                  >
                    All Status
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.status === PaymentStatus.Confirmed ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleStatusFilterChange(PaymentStatus.Confirmed)}
                  >
                    Confirmed
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.status === PaymentStatus.Pending ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleStatusFilterChange(PaymentStatus.Pending)}
                  >
                    Pending
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.status === PaymentStatus.Failed ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleStatusFilterChange(PaymentStatus.Failed)}
                  >
                    Failed
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.status === PaymentStatus.Reversed ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleStatusFilterChange(PaymentStatus.Reversed)}
                  >
                    Reversed
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Channel Filter Dropdown */}
          <div className="relative" data-dropdown-root="channel-filter">
            <button
              type="button"
              className="button-oulined flex items-center gap-2 text-sm md:text-base"
              onClick={() => setIsChannelFilterOpen((open) => !open)}
            >
              <IoMdFunnel className="size-4 md:size-5" />
              <span>
                {filters.channel === PaymentChannel.Cash
                  ? "Cash"
                  : filters.channel === PaymentChannel.BankTransfer
                  ? "Bank Transfer"
                  : filters.channel === PaymentChannel.Pos
                  ? "POS"
                  : filters.channel === PaymentChannel.Card
                  ? "Card"
                  : filters.channel === PaymentChannel.VendorWallet
                  ? "Vendor Wallet"
                  : filters.channel === PaymentChannel.Chaque
                  ? "Chaque"
                  : "All Channels"}
              </span>
              <ChevronDown
                className={`size-3 text-gray-500 transition-transform md:size-4 ${
                  isChannelFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isChannelFilterOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                <div className="py-1">
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.channel === "" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleChannelFilterChange("")}
                  >
                    All Channels
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.channel === PaymentChannel.Cash ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleChannelFilterChange(PaymentChannel.Cash)}
                  >
                    Cash
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.channel === PaymentChannel.BankTransfer ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleChannelFilterChange(PaymentChannel.BankTransfer)}
                  >
                    Bank Transfer
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.channel === PaymentChannel.Pos ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleChannelFilterChange(PaymentChannel.Pos)}
                  >
                    POS
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.channel === PaymentChannel.Card ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleChannelFilterChange(PaymentChannel.Card)}
                  >
                    Card
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.channel === PaymentChannel.VendorWallet ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleChannelFilterChange(PaymentChannel.VendorWallet)}
                  >
                    Vendor Wallet
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.channel === PaymentChannel.Chaque ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleChannelFilterChange(PaymentChannel.Chaque)}
                  >
                    Chaque
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Collector Type Filter Dropdown */}
          <div className="relative" data-dropdown-root="collector-type-filter">
            <button
              type="button"
              className="button-oulined flex items-center gap-2 text-sm md:text-base"
              onClick={() => setIsCollectorTypeFilterOpen((open) => !open)}
            >
              <IoMdFunnel className="size-4 md:size-5" />
              <span>
                {filters.collectorType === CollectorType.Customer
                  ? "Customer"
                  : filters.collectorType === CollectorType.SalesRep
                  ? "Sales Rep"
                  : filters.collectorType === CollectorType.Vendor
                  ? "Vendor"
                  : filters.collectorType === CollectorType.Staff
                  ? "Staff"
                  : "All Collectors"}
              </span>
              <ChevronDown
                className={`size-3 text-gray-500 transition-transform md:size-4 ${
                  isCollectorTypeFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCollectorTypeFilterOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                <div className="py-1">
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.collectorType === "" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCollectorTypeFilterChange("")}
                  >
                    All Collectors
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.collectorType === CollectorType.Customer ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCollectorTypeFilterChange(CollectorType.Customer)}
                  >
                    Customer
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.collectorType === CollectorType.SalesRep ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCollectorTypeFilterChange(CollectorType.SalesRep)}
                  >
                    Sales Rep
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.collectorType === CollectorType.Vendor ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCollectorTypeFilterChange(CollectorType.Vendor)}
                  >
                    Vendor
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.collectorType === CollectorType.Staff ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCollectorTypeFilterChange(CollectorType.Staff)}
                  >
                    Staff
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={handlePageSizeChange} className="button-oulined text-sm md:text-base">
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(filters.status || filters.channel || filters.collectorType || filters.paymentTypeId || searchText) && (
            <motion.button
              onClick={clearFilters}
              className="button-oulined text-sm md:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear All Filters
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Error Message */}
      {paymentsError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
          <p>Error loading payments: {paymentsError}</p>
        </div>
      )}

      {currentPayments.length === 0 ? (
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
            {searchText || filters.status || filters.channel || filters.collectorType
              ? "No matching payments found"
              : "No payments available"}
          </motion.p>
          <motion.p
            className="text-sm text-gray-600"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {searchText || filters.status || filters.channel || filters.collectorType
              ? "Try adjusting your search or filters"
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
                  {/* <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("agentName")}
                  >
                    <div className="flex items-center gap-2">
                      Agent <RxCaretSort />
                    </div>
                  </th> */}
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
                  {currentPayments.map((payment, index) => (
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
                      {/* <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{payment.agentName || "-"}</div>
                          <div className="text-xs text-gray-500">
                            {payment.agentCode ? `Code: ${payment.agentCode}` : ""}
                          </div>
                        </div>
                      </td> */}
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{payment.paymentTypeName || "-"}</td>
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
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{formatDate(payment.paidAtUtc)}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{payment.areaOfficeName || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ButtonModule
                          size="sm"
                          variant="outline"
                          icon={<VscEye />}
                          onClick={() => router.push(`/customer-portal/payment-history/${payment.id}`)}
                        >
                          View
                        </ButtonModule>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          {/* Pagination */}
          <motion.div
            className="mt-4 flex w-full flex-row items-center justify-between gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-1 max-sm:hidden">
              <p className="text-sm md:text-base">Show rows</p>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="bg-[#F2F2F2] p-1 text-sm md:text-base"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start md:gap-3">
              <button
                className={`px-2 py-1 md:px-3 md:py-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <MdOutlineArrowBackIosNew className="size-4 md:size-5" />
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                <div className="hidden items-center gap-1 md:flex md:gap-2">
                  {getPageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex size-6 items-center justify-center rounded-md text-xs md:h-7 md:w-8 md:text-sm ${
                          currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => changePage(item)}
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
                        className={`flex size-6 items-center justify-center rounded-md text-xs md:w-8 ${
                          currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => changePage(item)}
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
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <MdOutlineArrowForwardIos className="size-4 md:size-5" />
              </button>
            </div>
            <p className="text-sm max-sm:hidden md:text-base">
              Page {currentPage} of {totalPages} ({totalRecords} total records)
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

export default AllPaymentsTable
