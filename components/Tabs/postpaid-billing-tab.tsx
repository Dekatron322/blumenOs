"use client"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, ChevronDown } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { ExportCsvIcon } from "components/Icons/Icons"
import PostpaidBillDetailsModal from "components/ui/Modal/postpaid-bill-modal"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearBills,
  fetchPostpaidBills,
  type PostpaidBill,
  PostpaidBillsRequestParams,
  setPagination,
} from "lib/redux/postpaidSlice"
import Image from "next/image"

// Status options for filtering (based on your API: 0, 1, 2)
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "0", label: "Pending" },
  { value: "1", label: "Paid" },
  { value: "2", label: "Overdue" },
]

// Category options for filtering (based on your API: 1, 2)
const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "1", label: "Residential" },
  { value: "2", label: "Commercial" },
]

// Responsive Skeleton Components
const PostpaidBillCardSkeleton = () => (
  <motion.div
    className="mt-3 rounded-lg border bg-white p-4 shadow-sm"
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
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-gray-200 md:size-12"></div>
        <div className="min-w-0 flex-1">
          <div className="h-5 w-24 rounded bg-gray-200 md:w-32"></div>
          <div className="mt-1 flex flex-wrap gap-1 md:gap-2">
            <div className="mt-1 h-6 w-12 rounded-full bg-gray-200 md:w-16"></div>
            <div className="mt-1 h-6 w-16 rounded-full bg-gray-200 md:w-20"></div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-6 w-20 rounded bg-gray-200 md:h-8 md:w-24"></div>
        <div className="mt-1 h-4 w-16 rounded bg-gray-200 md:h-5 md:w-20"></div>
      </div>
    </div>

    <div className="mt-3 space-y-2 md:mt-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-3 w-20 rounded bg-gray-200 md:h-4 md:w-24"></div>
          <div className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
        </div>
      ))}
    </div>

    <div className="mt-3 rounded-md bg-yellow-50 p-2">
      <div className="flex items-center gap-2">
        <div className="size-4 rounded-full bg-gray-200"></div>
        <div className="h-3 w-24 rounded bg-gray-200 md:h-4 md:w-32"></div>
      </div>
    </div>

    <div className="mt-2 flex gap-2 md:mt-3">
      <div className="h-8 flex-1 rounded bg-gray-200 md:h-9"></div>
    </div>
  </motion.div>
)

const PostpaidBillListItemSkeleton = () => (
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 w-20 rounded bg-gray-200 md:h-4 md:w-28"></div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="size-3 rounded-full bg-gray-200"></div>
            <div className="h-3 w-24 rounded bg-gray-200 md:h-4 md:w-32"></div>
          </div>
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
    <div className="mb-3 flex w-full items-center justify-between gap-3">
      <div className="h-7 w-32 rounded bg-gray-200 md:h-8 md:w-40"></div>
      <div className="h-9 w-24 rounded bg-gray-200 md:h-10 md:w-32"></div>
    </div>
    <div className="flex flex-col gap-3 md:flex-row md:gap-4">
      <div className="h-9 w-full rounded bg-gray-200 md:h-10 md:w-60 lg:w-80"></div>
      <div className="flex flex-wrap gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-16 rounded bg-gray-200 md:h-10 md:w-20 lg:w-24"></div>
        ))}
      </div>
    </div>
  </motion.div>
)

const MobileFilterSkeleton = () => (
  <motion.div
    className="flex gap-2 md:hidden"
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
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-8 w-20 rounded-full bg-gray-200"></div>
    ))}
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

// Postpaid Bill Card Component
const PostpaidBillCard = ({
  bill,
  onViewDetails,
}: {
  bill: PostpaidBill
  onViewDetails: (bill: PostpaidBill) => void
}) => {
  const getStatusConfig = (status: number) => {
    const configs = {
      0: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "PENDING" },
      1: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "PAID" },
      2: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "OVERDUE" },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getCategoryConfig = (category: number) => {
    const configs = {
      1: { label: "Residential", color: "text-blue-600", bg: "bg-blue-50" },
      2: { label: "Commercial", color: "text-purple-600", bg: "bg-purple-50" },
    }
    return configs[category as keyof typeof configs] || configs[1]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const statusConfig = getStatusConfig(bill.status)
  const categoryConfig = getCategoryConfig(bill.category)

  return (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-green-100 md:size-12">
            <span className="text-sm font-semibold text-green-600 md:text-base">₦</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 md:text-base">{bill.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1 md:gap-2">
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
              >
                <span className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                {statusConfig.label}
              </div>
              <div className={`rounded-full px-2 py-1 text-xs ${categoryConfig.bg} ${categoryConfig.color}`}>
                {categoryConfig.label}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-gray-900 md:text-lg">{formatCurrency(bill.totalDue)}</div>
          <div className="text-xs text-gray-500 md:text-sm">Period: {bill.period}</div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-gray-600 md:mt-4">
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Account Number:</span>
          <span className="text-xs font-medium md:text-sm">{bill.customerAccountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Consumption:</span>
          <span className="text-xs font-medium md:text-sm">{bill.consumptionKwh} kWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Current Bill:</span>
          <span className="text-xs font-medium md:text-sm">{formatCurrency(bill.currentBillAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Area Office:</span>
          <span className="text-xs font-medium md:text-sm">{bill.areaOfficeName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Feeder:</span>
          <span className="text-xs font-medium md:text-sm">{bill.feederName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Created:</span>
          <span className="text-xs font-medium md:text-sm">{formatDate(bill.createdAt)}</span>
        </div>
      </div>

      {bill.openDisputeCount > 0 && (
        <div className="mt-3 rounded-md bg-yellow-50 p-2">
          <div className="flex items-center gap-2 text-xs text-yellow-800 md:text-sm">
            <AlertCircle className="size-3 md:size-4" />
            <span>{bill.openDisputeCount} open dispute(s)</span>
          </div>
        </div>
      )}

      <div className="mt-2 flex gap-2 md:mt-3">
        <button
          onClick={() => onViewDetails(bill)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white text-sm transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9] md:text-base"
        >
          <VscEye className="size-3 md:size-4" />
          View Details
        </button>
      </div>
    </div>
  )
}

// Postpaid Bill List Item Component
const PostpaidBillListItem = ({
  bill,
  onViewDetails,
}: {
  bill: PostpaidBill
  onViewDetails: (bill: PostpaidBill) => void
}) => {
  const getStatusConfig = (status: number) => {
    const configs = {
      0: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "PENDING" },
      1: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "PAID" },
      2: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "OVERDUE" },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getCategoryConfig = (category: number) => {
    const configs = {
      1: { label: "Residential", color: "text-blue-600", bg: "bg-blue-50" },
      2: { label: "Commercial", color: "text-purple-600", bg: "bg-purple-50" },
    }
    return configs[category as keyof typeof configs] || configs[1]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const statusConfig = getStatusConfig(bill.status)
  const categoryConfig = getCategoryConfig(bill.category)

  return (
    <div className="border-b bg-white p-3 transition-all hover:bg-gray-50 md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex items-start gap-3 md:items-center md:gap-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-100 max-sm:hidden md:size-10">
            <span className="text-xs font-semibold text-green-600 md:text-sm">₦</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <h3 className="text-sm font-semibold text-gray-900 md:text-base">{bill.name}</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
                >
                  <span className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                  {statusConfig.label}
                </div>
                <div className={`rounded-full px-2 py-1 text-xs ${categoryConfig.bg} ${categoryConfig.color}`}>
                  {categoryConfig.label}
                </div>
                <div className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  Period: {bill.period}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 md:gap-4 md:text-sm">
              <span>
                <strong className="md:hidden">Acc:</strong>
                <strong className="hidden md:inline">Account:</strong> {bill.customerAccountNumber}
              </span>
              <span>
                <strong>Consumption:</strong> {bill.consumptionKwh} kWh
              </span>
              <span>
                <strong>Area Office:</strong> {bill.areaOfficeName}
              </span>
              <span>
                <strong>Feeder:</strong> {bill.feederName}
              </span>
              <span>
                <strong>Created:</strong> {formatDate(bill.createdAt)}
              </span>
            </div>
            {bill.openDisputeCount > 0 && (
              <div className="mt-1 flex items-center gap-2 text-xs text-yellow-600 md:text-sm">
                <AlertCircle className="size-3" />
                <span>{bill.openDisputeCount} open dispute(s)</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between gap-2 md:items-center md:justify-end md:gap-3">
          <div className="text-right text-xs md:text-sm">
            <div className="text-base font-bold text-gray-900 md:text-lg">{formatCurrency(bill.totalDue)}</div>
            <div className="text-gray-500">Total Due</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(bill)}
              className="button-oulined flex items-center gap-2 text-xs md:text-sm"
            >
              <VscEye className="size-3 md:size-4" />
              <span className="hidden md:inline">View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PostpaidBillingTabProps {
  customerId: number
}

const PostpaidBillingTab: React.FC<PostpaidBillingTabProps> = ({ customerId }) => {
  const dispatch = useAppDispatch()
  const { bills, loading, error, success, pagination } = useAppSelector((state) => state.postpaidBilling)

  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<PostpaidBill | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  // Fetch postpaid bills for this customer
  useEffect(() => {
    const params: PostpaidBillsRequestParams = {
      pageNumber: currentPage,
      pageSize: pagination.pageSize,
      customerId: customerId,
      ...(selectedStatus && { status: parseInt(selectedStatus) }),
      ...(selectedCategory && { category: parseInt(selectedCategory) }),
      ...(searchText && { accountNumber: searchText }),
    }

    dispatch(fetchPostpaidBills(params))
  }, [dispatch, customerId, currentPage, pagination.pageSize, selectedStatus, selectedCategory, searchText])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearBills())
    }
  }, [dispatch])

  const handleViewDetails = (bill: PostpaidBill) => {
    setSelectedBill(bill)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(setPagination({ page: currentPage, pageSize: newPageSize }))
    setCurrentPage(1)
  }

  const totalPages = pagination.totalPages || 1
  const totalRecords = pagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

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
    const current = currentPage
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

  // Loading skeleton
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm md:p-6"
      >
        <HeaderSkeleton />

        {/* Mobile Filters Skeleton */}
        <div className="mt-3 md:hidden">
          <MobileFilterSkeleton />
        </div>

        {/* Postpaid Bills Display Area Skeleton */}
        <div className="mt-4 w-full">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <PostpaidBillCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {[...Array(5)].map((_, index) => (
                <PostpaidBillListItemSkeleton key={index} />
              ))}
            </div>
          )}
        </div>

        <PaginationSkeleton />
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm md:p-6"
      >
        <div className="flex flex-col py-2">
          <div className="mb-3 flex w-full items-center justify-between gap-3">
            <p className="whitespace-nowrap text-lg font-medium text-gray-900 sm:text-xl md:text-2xl">
              Postpaid Billing
            </p>

            <div className="flex items-center gap-2">
              {/* Mobile search icon button */}
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 sm:hidden md:size-9"
                onClick={() => setShowMobileSearch((prev) => !prev)}
                aria-label="Toggle search"
              >
                <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
              </button>

              {/* Export CSV button */}
              <button
                className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] text-sm hover:border-[#2563EB] hover:bg-[#DBEAFE] md:text-base"
                onClick={() => {
                  /* TODO: Implement CSV export for postpaid bills */
                }}
                disabled={!bills || bills.length === 0}
              >
                <ExportCsvIcon color="#2563EB" size={18} className="md:size-5" />
                <p className="text-xs text-[#2563EB] md:text-sm">Export CSV</p>
              </button>
            </div>
          </div>

          {/* Mobile search input revealed when icon is tapped */}
          {showMobileSearch && (
            <div className="mb-3 sm:hidden">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by account number"
                className="w-full"
              />
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2 md:flex-nowrap md:gap-4">
            {/* Desktop/Tablet search input */}
            <div className="hidden w-full sm:block md:max-w-[300px]">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by account number"
                className="w-full"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className={`button-oulined ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <MdGridView className="size-4 md:size-5" />
                <p className="text-sm md:text-base">Grid</p>
              </button>
              <button
                className={`button-oulined ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <MdFormatListBulleted className="size-4 md:size-5" />
                <p className="text-sm md:text-base">List</p>
              </button>
            </div>

            {/* Status Filter */}
            <div className="relative" data-dropdown-root="status-filter">
              <button
                type="button"
                className="button-oulined flex items-center gap-2 text-sm md:text-base"
                onClick={() => setIsStatusOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isStatusOpen}
              >
                <IoMdFunnel className="size-4 md:size-5" />
                <span>{statusOptions.find((opt) => opt.value === selectedStatus)?.label || "All Status"}</span>
                <ChevronDown
                  className={`size-3 text-gray-500 transition-transform md:size-4 ${isStatusOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isStatusOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                  <div className="py-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                          selectedStatus === option.value ? "bg-gray-50" : ""
                        }`}
                        onClick={() => {
                          setSelectedStatus(option.value)
                          setIsStatusOpen(false)
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative" data-dropdown-root="category-filter">
              <button
                type="button"
                className="button-oulined flex items-center gap-2 text-sm md:text-base"
                onClick={() => setIsCategoryOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isCategoryOpen}
              >
                <IoMdFunnel className="size-4 md:size-5" />
                <span>{categoryOptions.find((opt) => opt.value === selectedCategory)?.label || "All Categories"}</span>
                <ChevronDown
                  className={`size-3 text-gray-500 transition-transform md:size-4 ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isCategoryOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                  <div className="py-1">
                    {categoryOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                          selectedCategory === option.value ? "bg-gray-50" : ""
                        }`}
                        onClick={() => {
                          setSelectedCategory(option.value)
                          setIsCategoryOpen(false)
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
            <p>Error loading postpaid bills: {error}</p>
          </div>
        )}

        {/* Postpaid Bills Display */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 size-10 text-gray-400 md:size-12" />
              <p className="text-sm text-gray-500 md:text-base">Error loading postpaid bills: {error}</p>
            </div>
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <div className="text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-gray-100 md:size-12">
                <VscEye className="size-5 text-gray-400 md:size-6" />
              </div>
              <h3 className="mt-3 text-base font-medium text-gray-900 md:mt-4 md:text-lg">No postpaid bills found</h3>
              <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm">
                {searchText ? "Try adjusting your search criteria" : "No postpaid bills available for this customer"}
              </p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {bills.map((bill: PostpaidBill) => (
              <PostpaidBillCard key={bill.id} bill={bill} onViewDetails={handleViewDetails} />
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {bills.map((bill: PostpaidBill) => (
              <PostpaidBillListItem key={bill.id} bill={bill} onViewDetails={handleViewDetails} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {bills.length > 0 && (
          <div className="mt-4 flex w-full flex-row items-center justify-between gap-3 md:flex-row">
            <div className="flex items-center gap-1 max-sm:hidden">
              <p className="text-sm md:text-base">Show rows</p>
              <select
                value={pagination.pageSize}
                onChange={handleRowsChange}
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
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
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
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-xs md:w-8 ${
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
                <BiSolidRightArrow className="size-4 md:size-5" />
              </button>
            </div>
            <p className="text-sm max-sm:hidden md:text-base">
              Page {currentPage} of {totalPages} ({totalRecords} total records)
            </p>
          </div>
        )}

        <PostpaidBillDetailsModal isOpen={isModalOpen} onRequestClose={handleCloseModal} bill={selectedBill} />
      </motion.div>
    </>
  )
}

export default PostpaidBillingTab
