"use client"

import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchPayments, Payment } from "lib/redux/paymentSlice"
import { ChevronDown } from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"

type SortOrder = "asc" | "desc" | null

// Skeleton Components
const PaymentCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-3 shadow-sm md:p-4"
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
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="size-8 rounded-full bg-gray-200 md:size-10 lg:size-12"></div>
        <div className="min-w-0 flex-1">
          <div className="h-4 w-24 rounded bg-gray-200 md:h-5 md:w-28 lg:w-32"></div>
          <div className="mt-1 flex flex-wrap gap-1 md:gap-2">
            <div className="mt-1 h-5 w-12 rounded-full bg-gray-200 md:h-6 md:w-14 lg:w-16"></div>
            <div className="mt-1 h-5 w-14 rounded-full bg-gray-200 md:h-6 md:w-16 lg:w-20"></div>
          </div>
        </div>
      </div>
      <div className="size-4 rounded bg-gray-200 md:size-5 lg:size-6"></div>
    </div>

    <div className="mt-3 space-y-1.5 md:mt-4 md:space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="md:w-18 h-3 w-16 rounded bg-gray-200 md:h-4 lg:w-20"></div>
          <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-14 lg:w-16"></div>
        </div>
      ))}
    </div>

    <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
      <div className="h-3 w-full rounded bg-gray-200 md:h-4"></div>
    </div>

    <div className="mt-2 flex gap-2 md:mt-3">
      <div className="h-8 flex-1 rounded bg-gray-200 md:h-9"></div>
    </div>
  </motion.div>
)

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
      <div className="flex items-start gap-2 md:items-center md:gap-4">
        <div className="size-7 flex-shrink-0 rounded-full bg-gray-200 md:size-8 lg:size-10"></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
            <div className="h-4 w-28 rounded bg-gray-200 md:h-5 md:w-32 lg:w-40"></div>
            <div className="flex flex-wrap gap-1 md:gap-2">
              <div className="h-5 w-12 rounded-full bg-gray-200 md:h-6 md:w-14 lg:w-16"></div>
              <div className="h-5 w-14 rounded-full bg-gray-200 md:h-6 md:w-16 lg:w-20"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 md:gap-2 lg:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20 lg:w-24"></div>
            ))}
          </div>
          <div className="mt-2 hidden h-3 w-40 rounded bg-gray-200 md:block md:h-4 lg:w-64"></div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 md:justify-end md:gap-3">
        <div className="hidden text-right md:block">
          <div className="md:w-22 h-3 w-20 rounded bg-gray-200 md:h-4 lg:w-24"></div>
          <div className="md:w-18 mt-1 h-3 w-16 rounded bg-gray-200 md:h-4 lg:w-20"></div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-14 rounded bg-gray-200 md:h-8 md:w-16 lg:h-9 lg:w-20"></div>
          <div className="size-4 rounded bg-gray-200 md:size-5 lg:size-6"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const StatCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-2.5 md:p-3"
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="h-4 w-10 rounded bg-gray-200 md:h-5 md:w-12"></div>
        <div className="md:w-18 h-4 w-16 rounded bg-gray-200 md:h-5 lg:w-20"></div>
      </div>
      <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-14 lg:w-16"></div>
    </div>
    <div className="mt-2 space-y-1 md:mt-3">
      <div className="flex justify-between">
        <div className="md:w-18 h-3 w-16 rounded bg-gray-200 md:h-4 lg:w-20"></div>
        <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-14 lg:w-16"></div>
      </div>
    </div>
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
      <div className="h-7 w-12 rounded bg-gray-200 md:h-8 md:w-14 lg:w-16"></div>
    </div>

    <div className="order-1 flex items-center gap-2 md:order-2 md:gap-3">
      <div className="size-6 rounded bg-gray-200 md:size-7 lg:size-8"></div>
      <div className="flex gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="size-5 rounded bg-gray-200 md:size-6 lg:size-7"></div>
        ))}
      </div>
      <div className="size-6 rounded bg-gray-200 md:size-7 lg:size-8"></div>
    </div>

    <div className="order-3 hidden h-4 w-20 rounded bg-gray-200 md:block lg:w-24"></div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <motion.div
    className="flex flex-col py-2"
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
    <div className="h-7 w-28 rounded bg-gray-200 md:h-8 md:w-32 lg:w-40"></div>
    <div className="mt-2 flex flex-col gap-3 md:mt-3 md:flex-row md:gap-4">
      <div className="h-9 w-full rounded bg-gray-200 md:h-10 md:w-64 lg:w-80"></div>
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-16 rounded bg-gray-200 md:h-10 md:w-20 lg:w-24"></div>
        ))}
      </div>
    </div>
  </motion.div>
)

const RecentPayments = () => {
  const dispatch = useAppDispatch()
  const { payments, loading, error, pagination } = useAppSelector((state) => state.payments)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showStats, setShowStats] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const router = useRouter()

  const statusOptions = ["All Status", "Confirmed", "Pending", "Failed", "Reversed"]
  const paymentMethods = ["Bank Transfer", "POS Agent", "Card Payment", "Cash", "Vendor Wallet"]

  // Fetch payments on component mount and when page changes
  useEffect(() => {
    dispatch(
      fetchPayments({
        pageNumber: currentPage,
        pageSize: pagination.pageSize || 6,
      })
    )
  }, [dispatch, currentPage, pagination.pageSize])

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-root="payment-actions"]')) {
        setActiveDropdown(null)
      }
      if (!target.closest('[data-dropdown-root="status-filter"]')) {
        setIsStatusOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "Pending":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "Failed":
      case "Reversed":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#F2F2F2", color: "#666666" }
    }
  }

  const getPaymentMethodStyle = (method: string) => {
    switch (method) {
      case "Bank Transfer":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "POS Agent":
        return { backgroundColor: "#F4EDF7", color: "#954BAF" }
      case "Card Payment":
        return { backgroundColor: "#F0F7ED", color: "#4BAF5E" }
      case "Cash":
        return { backgroundColor: "#FEF7ED", color: "#F4A261" }
      default:
        return { backgroundColor: "#F2F2F2", color: "#666666" }
    }
  }

  const dotStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return { backgroundColor: "#589E67" }
      case "Pending":
        return { backgroundColor: "#D28E3D" }
      case "Failed":
      case "Reversed":
        return { backgroundColor: "#AF4B4B" }
      default:
        return { backgroundColor: "#666666" }
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  // Filter payments based on search text and status
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchText === "" ||
      payment.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.customerAccountNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchText.toLowerCase()) ||
      (payment.externalReference && payment.externalReference.toLowerCase().includes(searchText.toLowerCase()))

    const matchesStatus = selectedStatus === "" || selectedStatus === "All Status" || payment.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      fetchPayments({
        pageNumber: 1,
        pageSize: newPageSize,
      })
    )
    setCurrentPage(1)
  }

  const totalPages = pagination.totalPages || 1
  const totalRecords = pagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleViewDetails = (payment: Payment) => {
    router.push(`/payment/payment-detail/${payment.id}`)
  }

  // Statistics calculations
  const successfulCount = payments.filter((p) => p.status === "Confirmed").length
  const pendingCount = payments.filter((p) => p.status === "Pending").length
  const failedCount = payments.filter((p) => p.status === "Failed" || p.status === "Reversed").length

  const today = new Date().toISOString().slice(0, 10)
  const todaysSuccessfulPayments = payments.filter((p) =>
    p.paidAtUtc ? p.paidAtUtc.slice(0, 10) === today && p.status === "Confirmed" : false
  )
  const todaysRevenue = todaysSuccessfulPayments.reduce((sum, p) => sum + p.amount, 0)

  const bankTransferCount = payments.filter((p) => p.channel === "BankTransfer").length
  const posCount = payments.filter((p) => p.channel === "Pos").length
  const cardCount = payments.filter((p) => p.channel === "Card").length

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-3 shadow-sm transition-all hover:shadow-md md:p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 md:size-10 lg:size-12">
            <span className="text-xs font-semibold text-blue-600 md:text-sm">
              {payment.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 md:text-base">{payment.customerName}</h3>
            <div className="mt-1 flex items-center gap-1 md:gap-2">
              <div
                style={getStatusStyle(payment.status)}
                className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs md:px-2 md:py-1"
              >
                <span className="size-1.5 rounded-full md:size-2" style={dotStyle(payment.status)}></span>
                {payment.status.toUpperCase()}
              </div>
              <div
                style={getPaymentMethodStyle(payment.channel)}
                className="rounded-full px-1.5 py-0.5 text-xs md:px-2 md:py-1"
              >
                {payment.channel}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-gray-600 md:mt-4 md:text-sm">
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-medium">{formatCurrency(payment.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Account:</span>
          <span className="font-medium">{payment.customerAccountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Reference:</span>
          <span className="font-medium">{payment.reference}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span className="font-medium">
            {payment.paidAtUtc ? new Date(payment.paidAtUtc).toLocaleDateString() : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Payment ID:</span>
          <div className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium md:px-2 md:py-1">{payment.id}</div>
        </div>
      </div>

      <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
        <p className="text-xs text-gray-500">{payment.externalReference || "No external reference"}</p>
      </div>

      <div className="mt-2 flex gap-1.5 md:mt-3">
        <button
          onClick={() => handleViewDetails(payment)}
          className="button-oulined flex flex-1 items-center justify-center gap-1.5 bg-white text-xs transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9] md:text-sm"
        >
          <VscEye className="size-3 md:size-4" />
          View Details
        </button>
      </div>
    </div>
  )

  const PaymentListItem = ({ payment }: { payment: Payment }) => (
    <div className="border-b bg-white p-3 transition-all hover:bg-gray-50 md:p-4">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex items-start gap-2 md:items-center md:gap-4">
          <div className="flex size-7 items-center justify-center rounded-full bg-blue-100 md:size-8 lg:size-10">
            <span className="text-xs font-semibold text-blue-600 md:text-sm">
              {payment.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
              <h3 className="truncate text-sm font-semibold text-gray-900 md:text-base">{payment.customerName}</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <div
                  style={getStatusStyle(payment.status)}
                  className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs md:px-2 md:py-1"
                >
                  <span className="size-1.5 rounded-full md:size-2" style={dotStyle(payment.status)}></span>
                  {payment.status.toUpperCase()}
                </div>
                <div
                  style={getPaymentMethodStyle(payment.channel)}
                  className="rounded-full px-1.5 py-0.5 text-xs md:px-2 md:py-1"
                >
                  {payment.channel}
                </div>
                <div className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium md:px-2 md:py-1">
                  ID: {payment.id}
                </div>
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-600 md:mt-2 md:gap-2.5 md:text-sm lg:gap-4">
              <span>
                <strong>Amount:</strong> {formatCurrency(payment.amount)}
              </span>
              <span>
                <strong>Account:</strong> {payment.customerAccountNumber}
              </span>
              <span>
                <strong>Reference:</strong> {payment.reference}
              </span>
              <span>
                <strong>Date:</strong> {payment.paidAtUtc ? new Date(payment.paidAtUtc).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 md:mt-2 md:text-sm">
              {payment.externalReference || "No external reference"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1.5 md:gap-3">
          <div className="hidden text-right text-xs md:block md:text-sm">
            <div className="font-medium text-gray-900">{payment.customerAccountNumber}</div>
            <div className={`mt-0.5 text-xs ${payment.status === "Pending" ? "text-amber-600" : "text-gray-500"}`}>
              {payment.status === "Pending" ? "Awaiting Confirmation" : "Processed"}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleViewDetails(payment)}
              className="button-oulined flex items-center gap-1.5 text-xs md:text-sm"
            >
              <VscEye className="size-3 md:size-4" />
              <span className="hidden md:inline">View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const StatCard = ({
    title,
    value,
    subtitle,
    color = "blue",
  }: {
    title: string
    value: string
    subtitle: string
    color?: string
  }) => (
    <div className="rounded-lg border bg-[#f9f9f9] p-2.5 transition-all hover:shadow-sm md:p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-gray-900 md:text-base">{title}</h3>
        </div>
        <div className="flex text-sm">
          <span className="font-medium">{value}</span>
        </div>
      </div>
      <div className="mt-2 space-y-1 md:mt-3">
        <div className="flex justify-between text-xs md:text-sm">
          <span className="text-gray-600">{subtitle}</span>
        </div>
      </div>
    </div>
  )

  const getPageItems = (): (number | string)[] => {
    const total = totalPages
    const current = currentPage
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
    const current = currentPage
    const items: (number | string)[] = []

    if (total <= 4) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    if (current <= 3) {
      items.push(1, 2, 3, "...", total)
      return items
    }

    if (current > 3 && current < total - 2) {
      items.push(1, "...", current, "...", total)
      return items
    }

    items.push(1, "...", total - 2, total - 1, total)
    return items
  }

  if (loading) {
    return (
      <div className="flex-3 relative mt-5 flex flex-col items-start gap-4 lg:flex-row lg:gap-6">
        {/* Main Content Skeleton */}
        <div className={`w-full rounded-md border bg-white p-3 md:p-4 lg:p-5 ${showStats ? "lg:flex-1" : ""}`}>
          <HeaderSkeleton />

          {/* Payment Display Area Skeleton */}
          <div className="w-full">
            {viewMode === "grid" ? (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4 md:gap-4 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <PaymentCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="mt-3 divide-y md:mt-4">
                {[...Array(5)].map((_, index) => (
                  <PaymentListItemSkeleton key={index} />
                ))}
              </div>
            )}
          </div>

          <PaginationSkeleton />
        </div>

        {/* Stats Sidebar Skeleton */}
        {showStats && (
          <div className="mt-4 w-full rounded-md border bg-white p-3 md:p-4 lg:mt-0 lg:w-80 lg:p-5">
            <div className="border-b pb-3 md:pb-4">
              <div className="h-6 w-32 rounded bg-gray-200 md:w-40"></div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4 lg:grid-cols-1">
              {[...Array(6)].map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>

            {/* Summary Stats Skeleton */}
            <div className="mt-4 rounded-lg bg-gray-50 p-3 md:mt-6">
              <div className="mb-2 h-5 w-16 rounded bg-gray-200 md:w-20"></div>
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-20 rounded bg-gray-200 md:h-4 md:w-24"></div>
                    <div className="h-3 w-10 rounded bg-gray-200 md:h-4 md:w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-3 relative flex flex-col items-start gap-4 lg:flex-row lg:gap-6">
      {/* Main Content - Payments List/Grid */}
      <div className={`w-full rounded-md border bg-white p-3 md:p-4 lg:p-5 ${showStats ? "lg:flex-1" : ""}`}>
        <div className="flex flex-col py-1 md:py-2">
          <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
            <p className="text-lg font-medium md:text-xl lg:text-2xl">Recent Payments</p>
            <button
              className="button-oulined flex items-center gap-1.5 border-[#2563EB] bg-[#DBEAFE] px-2 py-1.5 text-xs hover:border-[#2563EB] hover:bg-[#DBEAFE] md:gap-2 md:px-3 md:py-2 md:text-sm"
              onClick={() => {
                /* Export functionality */
              }}
              disabled={!payments || payments.length === 0}
            >
              <ExportCsvIcon color="#2563EB" size={16} className="md:size-5" />
              <p className="text-xs text-[#2563EB] md:text-sm">Export CSV</p>
            </button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex-1">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by customer, account, or reference"
                className="w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-2.5">
              <div className="flex gap-1.5">
                <button
                  className={`button-oulined px-2 py-1.5 text-xs md:px-3 md:py-2 md:text-sm ${
                    viewMode === "grid" ? "bg-[#f9f9f9]" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <MdGridView className="size-3.5 md:size-4 lg:size-5" />
                  <p className="text-xs md:text-sm">Grid</p>
                </button>
                <button
                  className={`button-oulined px-2 py-1.5 text-xs md:px-3 md:py-2 md:text-sm ${
                    viewMode === "list" ? "bg-[#f9f9f9]" : ""
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  <MdFormatListBulleted className="size-3.5 md:size-4 lg:size-5" />
                  <p className="text-xs md:text-sm">List</p>
                </button>
              </div>

              <button
                className="button-oulined hidden px-2 py-1.5 text-xs md:inline-flex md:px-3 md:py-2 md:text-sm lg:text-base"
                onClick={() => setShowStats(!showStats)}
              >
                {showStats ? "Hide Stats" : "Show Stats"}
              </button>

              <div className="relative" data-dropdown-root="status-filter">
                <button
                  type="button"
                  className="button-oulined flex items-center gap-1.5 px-2 py-1.5 text-xs md:gap-2 md:px-3 md:py-2 md:text-sm"
                  onClick={() => setIsStatusOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isStatusOpen}
                >
                  <IoMdFunnel className="size-3.5 md:size-4" />
                  <span className="max-w-[60px] truncate md:max-w-none">{selectedStatus || "All Status"}</span>
                  <ChevronDown
                    className={`size-3 text-gray-500 transition-transform md:size-4 ${
                      isStatusOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isStatusOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-48 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-64">
                    <div className="py-1">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 md:text-sm ${
                            selectedStatus === status ? "bg-gray-50" : ""
                          }`}
                          onClick={() => {
                            setSelectedStatus(status === "All Status" ? "" : status)
                            setIsStatusOpen(false)
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Display Area */}
        <div className="w-full">
          {filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 md:py-8">
              <div className="text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-gray-100 md:size-12">
                  <VscEye className="size-5 text-gray-400 md:size-6" />
                </div>
                <h3 className="mt-3 text-base font-medium text-gray-900 md:mt-4 md:text-lg">No payments found</h3>
                <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm">
                  {searchText ? "Try adjusting your search criteria" : "No payments available"}
                </p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4 md:gap-4 lg:grid-cols-3">
              {filteredPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          ) : (
            <div className="mt-3 divide-y md:mt-4">
              {filteredPayments.map((payment) => (
                <PaymentListItem key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0">
            <div className="order-2 flex items-center gap-1.5 md:order-1">
              <p className="text-xs md:text-sm">Show rows</p>
              <select
                value={pagination.pageSize || 6}
                onChange={handleRowsChange}
                className="bg-[#F2F2F2] p-1 text-xs md:text-sm"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={24}>24</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="order-1 flex items-center gap-2 md:order-2 md:gap-3">
              <button
                className={`px-2 py-1 md:px-3 md:py-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <BiSolidLeftArrow className="size-3.5 md:size-4 lg:size-5" />
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                {/* Desktop pagination */}
                <div className="hidden items-center gap-1 md:flex md:gap-2">
                  {getPageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-xs md:h-7 md:w-7 md:text-sm lg:h-[27px] lg:w-[30px] ${
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

                {/* Mobile pagination */}
                <div className="flex items-center gap-1 md:hidden">
                  {getMobilePageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-xs ${
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
                <BiSolidRightArrow className="size-3.5 md:size-4 lg:size-5" />
              </button>
            </div>

            <p className="order-3 text-xs max-sm:hidden md:text-sm lg:text-base">
              Page {currentPage} of {totalPages} ({totalRecords} total records)
            </p>
          </div>
        )}
      </div>

      {/* Stats Sidebar */}
      <AnimatePresence initial={false}>
        {showStats && (
          <motion.div
            key="stats-sidebar"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="mt-4 w-full rounded-md border bg-white p-3 md:p-4 lg:mt-0 lg:w-80 lg:p-5"
          >
            <div className="border-b pb-3 md:pb-4">
              <h2 className="text-base font-semibold text-gray-900 md:text-lg">Payment Statistics</h2>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4 lg:grid-cols-1">
              <StatCard
                title="Today's Revenue"
                value={formatCurrency(todaysRevenue)}
                subtitle="Confirmed payments today"
                color="green"
              />
              <StatCard
                title="Successful Payments"
                value={successfulCount.toString()}
                subtitle="Total confirmed"
                color="green"
              />
              <StatCard
                title="Pending Payments"
                value={pendingCount.toString()}
                subtitle="Awaiting confirmation"
                color="yellow"
              />
              <StatCard
                title="Failed Payments"
                value={failedCount.toString()}
                subtitle="Failed or reversed"
                color="red"
              />
              <StatCard
                title="Bank Transfers"
                value={bankTransferCount.toString()}
                subtitle="Total transactions"
                color="blue"
              />
              <StatCard title="POS Payments" value={posCount.toString()} subtitle="Agent transactions" color="purple" />
            </div>

            {/* Summary Stats */}
            <div className="mt-4 rounded-lg bg-gray-50 p-3 md:mt-6">
              <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payments:</span>
                  <span className="font-medium">{totalRecords.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium">
                    {totalRecords > 0 ? Math.round((successfulCount / totalRecords) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Methods:</span>
                  <span className="font-medium">{paymentMethods.length}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Show/Hide Stats Button */}
      <button
        className="button-oulined fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 px-4 py-2 text-sm md:hidden"
        onClick={() => setShowStats(!showStats)}
      >
        {showStats ? "Hide Stats" : "Show Stats"}
      </button>
    </div>
  )
}

export default RecentPayments
