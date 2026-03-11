"use client"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, ChevronDown } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { UpdateUserOutlineIcon } from "components/Icons/Icons"
import { ExportCsvIcon } from "components/Icons/Icons"
import Image from "next/image"
import {
  type ChangeRequestListItem,
  ChangeRequestsRequestParams,
  clearChangeRequestsByCustomer,
  fetchChangeRequestsByCustomerId,
} from "lib/redux/customerSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import ViewCustomerChangeRequestModal from "components/ui/Modal/view-customer-change-request-modal"

// Status options for filtering
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "0", label: "Pending" },
  { value: "1", label: "Approved" },
  { value: "2", label: "Declined" },
  { value: "3", label: "Cancelled" },
  { value: "4", label: "Applied" },
  { value: "5", label: "Failed" },
]

// Source options for filtering
const sourceOptions = [
  { value: "", label: "All Sources" },
  { value: "0", label: "System" },
  { value: "1", label: "Manual" },
  { value: "2", label: "Import" },
  { value: "3", label: "Customer" },
]

// Responsive Skeleton Components
const ChangeRequestCardSkeleton = () => (
  <motion.div
    className="mt-2 rounded-lg border bg-white p-3 shadow-sm"
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
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-full bg-gray-200 md:size-10"></div>
        <div className="min-w-0 flex-1">
          <div className="h-4 w-20 rounded bg-gray-200 md:w-28"></div>
          <div className="mt-1 flex flex-wrap gap-1 md:gap-2">
            <div className="mt-1 h-5 w-10 rounded-full bg-gray-200 md:w-14"></div>
            <div className="md:w-18 mt-1 h-5 w-14 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-2 space-y-1 md:mt-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="md:w-18 h-2.5 w-14 rounded bg-gray-200 md:h-3"></div>
          <div className="h-2.5 w-10 rounded bg-gray-200 md:h-3 md:w-14"></div>
        </div>
      ))}
    </div>

    <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
      <div className="h-2.5 w-full rounded bg-gray-200 md:h-3"></div>
    </div>

    <div className="mt-2 flex gap-2 md:mt-3">
      <div className="h-7 flex-1 rounded bg-gray-200 md:h-8"></div>
    </div>
  </motion.div>
)

const ChangeRequestListItemSkeleton = () => (
  <motion.div
    className="border-b bg-white p-2 md:p-3"
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
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-0">
      <div className="flex items-start gap-2 md:items-center md:gap-3">
        <div className="size-6 shrink-0 rounded-full bg-gray-200 md:size-8"></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
            <div className="h-4 w-28 rounded bg-gray-200 md:w-36"></div>
            <div className="flex flex-wrap gap-1 md:gap-2">
              <div className="h-5 w-10 rounded-full bg-gray-200 md:w-14"></div>
              <div className="md:w-18 h-5 w-14 rounded-full bg-gray-200"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1 md:gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-2.5 w-14 rounded bg-gray-200 md:h-3 md:w-20"></div>
            ))}
          </div>
          <div className="mt-2 hidden h-2.5 w-36 rounded bg-gray-200 md:block md:h-3 md:w-56"></div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 md:justify-end md:gap-3">
        <div className="hidden text-right md:block">
          <div className="w-18 h-2.5 rounded bg-gray-200 md:h-3 md:w-20"></div>
          <div className="mt-1 h-2.5 w-14 rounded bg-gray-200 md:h-3 md:w-16"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="md:w-18 h-6 w-12 rounded bg-gray-200 md:h-7"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <motion.div
    className="flex flex-col py-1"
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
    <div className="h-6 w-28 rounded bg-gray-200 md:h-7 md:w-36"></div>
    <div className="mt-2 flex flex-col gap-2 md:mt-3 md:flex-row md:gap-3">
      <div className="h-8 w-full rounded bg-gray-200 md:h-9 md:w-56 lg:w-72"></div>
      <div className="flex flex-wrap gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="md:w-18 h-8 w-14 rounded bg-gray-200 md:h-9 lg:w-20"></div>
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
    className="mt-3 flex flex-col items-center justify-between gap-2 md:flex-row md:gap-0"
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
      <div className="hidden h-3 w-10 rounded bg-gray-200 md:block md:w-14"></div>
      <div className="h-6 w-10 rounded bg-gray-200 md:h-7 md:w-14"></div>
    </div>

    <div className="order-1 flex items-center gap-2 md:order-2 md:gap-2">
      <div className="size-6 rounded bg-gray-200 md:size-7"></div>
      <div className="flex gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="size-5 rounded bg-gray-200 md:size-6"></div>
        ))}
      </div>
      <div className="size-6 rounded bg-gray-200 md:size-7"></div>
    </div>

    <div className="w-18 order-3 hidden h-3 rounded bg-gray-200 md:block md:w-20"></div>
  </motion.div>
)

// Change Request Card Component
const ChangeRequestCard = ({
  changeRequest,
  onViewDetails,
}: {
  changeRequest: ChangeRequestListItem
  onViewDetails: (changeRequest: ChangeRequestListItem) => void
}) => {
  const getStatusConfig = (status: number) => {
    const configs = {
      0: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "PENDING" },
      1: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "APPROVED" },
      2: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "DECLINED" },
      3: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", label: "CANCELLED" },
      4: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "APPLIED" },
      5: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", label: "FAILED" },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getSourceConfig = (source: number) => {
    const configs = {
      0: { label: "System", color: "text-blue-600", bg: "bg-blue-50" },
      1: { label: "Manual", color: "text-green-600", bg: "bg-green-50" },
      2: { label: "Import", color: "text-purple-600", bg: "bg-purple-50" },
      3: { label: "Customer", color: "text-orange-600", bg: "bg-orange-50" },
    }
    return configs[source as keyof typeof configs] || configs[1]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const statusConfig = getStatusConfig(changeRequest.status)
  const sourceConfig = getSourceConfig(changeRequest.source || 1)

  return (
    <div className="mt-2 rounded-lg border bg-[#f9f9f9] p-3 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 md:size-10">
            <span className="text-xs font-semibold text-blue-600 md:text-sm">
              {changeRequest.requestedBy
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "CR"}
            </span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-900 md:text-sm">{changeRequest.entityLabel}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1 md:gap-2">
              <div
                className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs ${statusConfig.bg} ${statusConfig.color}`}
              >
                <span className={`size-1.5 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                {statusConfig.label}
              </div>
              <div className={`rounded-full px-1.5 py-0.5 text-xs ${sourceConfig.bg} ${sourceConfig.color}`}>
                {sourceConfig.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-1 text-xs text-gray-600 md:mt-3">
        <div className="flex justify-between">
          <span className="text-xs">Reference:</span>
          <span className="text-xs font-medium">{changeRequest.reference}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs">Requested By:</span>
          <span className="text-xs font-medium">{changeRequest.requestedBy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs">Entity Type:</span>
          <span className="text-xs font-medium">Customer</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs">Requested At:</span>
          <span className="text-xs font-medium">{formatDate(changeRequest.requestedAtUtc)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">Public ID:</span>
          <div className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium">
            {changeRequest.publicId?.slice(0, 8)}...
          </div>
        </div>
      </div>

      <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
        <p className="text-xs text-gray-500">Entity ID: {changeRequest.entityId}</p>
      </div>

      <div className="mt-2 flex gap-2 md:mt-3">
        <button
          onClick={() => onViewDetails(changeRequest)}
          className="button-oulined flex flex-1 items-center justify-center gap-1 bg-white text-xs transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9] md:text-sm"
        >
          <VscEye className="size-2.5 md:size-3" />
          View Details
        </button>
      </div>
    </div>
  )
}

// Change Request List Item Component
const ChangeRequestListItem = ({
  changeRequest,
  onViewDetails,
}: {
  changeRequest: ChangeRequestListItem
  onViewDetails: (changeRequest: ChangeRequestListItem) => void
}) => {
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const getStatusConfig = (status: number) => {
    const configs = {
      0: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "PENDING" },
      1: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "APPROVED" },
      2: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "DECLINED" },
      3: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", label: "CANCELLED" },
      4: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "APPLIED" },
      5: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", label: "FAILED" },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getSourceConfig = (source: number) => {
    const configs = {
      0: { label: "System", color: "text-blue-600", bg: "bg-blue-50" },
      1: { label: "Manual", color: "text-green-600", bg: "bg-green-50" },
      2: { label: "Import", color: "text-purple-600", bg: "bg-purple-50" },
      3: { label: "Customer", color: "text-orange-600", bg: "bg-orange-50" },
    }
    return configs[source as keyof typeof configs] || configs[1]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const statusConfig = getStatusConfig(changeRequest.status)
  const sourceConfig = getSourceConfig(changeRequest.source || 1)

  return (
    <div className="border-b bg-white p-2 transition-all hover:bg-gray-50 md:p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex items-start gap-2 md:items-center md:gap-3">
          <div className="flex size-6 items-center justify-center rounded-full bg-blue-100 max-sm:hidden md:size-8">
            <span className="text-xs font-semibold text-blue-600 md:text-xs">
              {changeRequest.requestedBy
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "CR"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <h3 className="text-xs font-semibold text-gray-900 md:text-sm">{changeRequest.entityLabel}</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <div
                  className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs ${statusConfig.bg} ${statusConfig.color}`}
                >
                  <span className={`size-1.5 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                  {statusConfig.label}
                </div>
                <div className={`rounded-full px-1.5 py-0.5 text-xs ${sourceConfig.bg} ${sourceConfig.color}`}>
                  {sourceConfig.label}
                </div>
                <div className="rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                  Ref: {changeRequest.reference}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-gray-600 md:gap-3 md:text-xs">
              <span>
                <strong className="md:hidden">Req By:</strong>
                <strong className="hidden md:inline">Requested By:</strong> {changeRequest.requestedBy}
              </span>
              <span>
                <strong>Entity ID:</strong> {changeRequest.entityId}
              </span>
              <span>
                <strong>Requested:</strong> {formatDate(changeRequest.requestedAtUtc)}
              </span>
            </div>
            <p className="mt-2 hidden text-xs text-gray-500 md:block md:text-xs">Public ID: {changeRequest.publicId}</p>
          </div>
        </div>

        <div className="flex items-start justify-between md:items-center md:gap-2">
          <div className="text-right text-xs md:text-xs">
            <div className="hidden font-medium text-gray-900 md:block">Status: {statusConfig.label}</div>
            <div className="hidden text-gray-600 md:block">{sourceConfig.label}</div>
          </div>
          <div className="flex items-center gap-2">
            {canUpdate && (
              <button
                onClick={() => onViewDetails(changeRequest)}
                className="button-oulined flex items-center gap-1 text-xs md:text-xs"
              >
                <VscEye className="size-2.5 md:size-3" />
                <span className="hidden md:inline">View</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ChangeRequestsTabProps {
  customerId: number
}

const ChangeRequestsTab: React.FC<ChangeRequestsTabProps> = ({ customerId }) => {
  const dispatch = useAppDispatch()
  const {
    changeRequestsByCustomer,
    changeRequestsByCustomerLoading,
    changeRequestsByCustomerError,
    changeRequestsByCustomerPagination,
  } = useAppSelector((state) => state.customers)

  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedSource, setSelectedSource] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isSourceOpen, setIsSourceOpen] = useState(false)
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  // Fetch change requests for this customer
  useEffect(() => {
    const params: ChangeRequestsRequestParams = {
      pageNumber: currentPage,
      pageSize: changeRequestsByCustomerPagination.pageSize,
      ...(selectedStatus && { status: parseInt(selectedStatus) }),
      ...(selectedSource && { source: parseInt(selectedSource) }),
      ...(searchText && { reference: searchText }),
    }

    dispatch(fetchChangeRequestsByCustomerId({ id: customerId, params }))
  }, [
    dispatch,
    customerId,
    currentPage,
    changeRequestsByCustomerPagination.pageSize,
    selectedStatus,
    selectedSource,
    searchText,
  ])

  // Sync local search input
  useEffect(() => {
    setSearchInput(searchText)
  }, [searchText])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearChangeRequestsByCustomer())
    }
  }, [dispatch])

  const handleViewDetails = (changeRequest: ChangeRequestListItem) => {
    setSelectedChangeRequestId(changeRequest.publicId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedChangeRequestId(null)
  }

  const handleCancelSearch = () => {
    setSearchInput("")
    setSearchText("")
    setCurrentPage(1)
  }

  // Search handlers
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate && trimmed !== searchText) {
      setSearchText(trimmed)
      setCurrentPage(1)
    }
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    const params: ChangeRequestsRequestParams = {
      pageNumber: 1,
      pageSize: newPageSize,
      ...(selectedStatus && { status: parseInt(selectedStatus) }),
      ...(selectedSource && { source: parseInt(selectedSource) }),
      ...(searchText && { reference: searchText }),
    }

    dispatch(fetchChangeRequestsByCustomerId({ id: customerId, params }))
    setCurrentPage(1)
  }

  const totalPages = changeRequestsByCustomerPagination.totalPages || 1
  const totalRecords = changeRequestsByCustomerPagination.totalCount || 0

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
  if (changeRequestsByCustomerLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm md:p-6"
      >
        <HeaderSkeleton />

        {/* Mobile Filters Skeleton */}
        <div className="mt-2 md:hidden">
          <MobileFilterSkeleton />
        </div>

        {/* Change Requests Display Area Skeleton */}
        <div className="mt-3 w-full">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <ChangeRequestCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {[...Array(5)].map((_, index) => (
                <ChangeRequestListItemSkeleton key={index} />
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
        <div className="flex flex-col py-1">
          <div className="mb-2 flex w-full items-center justify-between gap-2">
            <p className="whitespace-nowrap text-base font-medium text-gray-900 sm:text-lg md:text-lg">
              Change Requests
            </p>

            {/* Mobile search icon button */}
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 sm:hidden md:size-8"
              onClick={() => setShowMobileSearch((prev) => !prev)}
              aria-label="Toggle search"
            >
              <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
            </button>
          </div>

          {/* Search Section */}
          <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-r from-green-50/60 to-white p-4 shadow-sm">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#004B23]">Search Change Requests</p>
              <h4 className="text-sm font-medium text-gray-900">Find change request records</h4>
              <p className="text-xs text-gray-600">Search by reference, requester, or request details.</p>
            </div>
            <SearchModule
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onCancel={handleCancelSearch}
              onSearch={handleManualSearch}
              placeholder="Type reference, requester, or request details..."
              height="h-12"
              className="!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm [&_button]:min-h-[32px] [&_button]:px-4 [&_button]:text-xs [&_input]:text-xs sm:[&_input]:text-sm"
            />
          </div>

          {/* Mobile search input revealed when icon is tapped */}
          {showMobileSearch && (
            <div className="mb-2 sm:hidden">
              <SearchModule
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                onCancel={handleCancelSearch}
                onSearch={handleManualSearch}
                placeholder="Search by reference or requester"
                className="w-full"
              />
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2 md:flex-nowrap md:gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                className={`button-oulined ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <MdGridView className="size-3.5 md:size-4" />
                <p className="text-xs md:text-sm">Grid</p>
              </button>
              <button
                className={`button-oulined ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <MdFormatListBulleted className="size-3.5 md:size-4" />
                <p className="text-xs md:text-sm">List</p>
              </button>
            </div>

            {/* Status Filter */}
            <div className="relative" data-dropdown-root="status-filter">
              <button
                type="button"
                className="button-oulined flex items-center gap-1.5 text-xs md:text-sm"
                onClick={() => setIsStatusOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isStatusOpen}
              >
                <IoMdFunnel className="size-4 md:size-5" />
                <span>{statusOptions.find((opt) => opt.value === selectedStatus)?.label || "All Status"}</span>
                <ChevronDown
                  className={`size-2.5 text-gray-500 transition-transform md:size-3 ${
                    isStatusOpen ? "rotate-180" : ""
                  }`}
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

            {/* Source Filter */}
            <div className="relative" data-dropdown-root="source-filter">
              <button
                type="button"
                className="button-oulined flex items-center gap-1.5 text-xs md:text-sm"
                onClick={() => setIsSourceOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isSourceOpen}
              >
                <IoMdFunnel className="size-4 md:size-5" />
                <span>{sourceOptions.find((opt) => opt.value === selectedSource)?.label || "All Sources"}</span>
                <ChevronDown
                  className={`size-2.5 text-gray-500 transition-transform md:size-3 ${
                    isSourceOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isSourceOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                  <div className="py-1">
                    {sourceOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                          selectedSource === option.value ? "bg-gray-50" : ""
                        }`}
                        onClick={() => {
                          setSelectedSource(option.value)
                          setIsSourceOpen(false)
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
        {changeRequestsByCustomerError && (
          <div className="mb-3 rounded-md bg-red-50 p-2 text-xs text-red-700 md:p-3 md:text-sm">
            <p>Error loading change requests: {changeRequestsByCustomerError}</p>
          </div>
        )}

        {/* Change Requests Display */}
        {changeRequestsByCustomerError ? (
          <div className="py-6 text-center md:py-10">
            <AlertCircle className="mx-auto mb-3 size-8 text-gray-400 md:size-10" />
            <p className="text-xs text-gray-500 md:text-sm">
              Error loading change requests: {changeRequestsByCustomerError}
            </p>
          </div>
        ) : changeRequestsByCustomer.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 md:py-10">
            <div className="text-center">
              <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-gray-100 md:size-10">
                <VscEye className="size-4 text-gray-400 md:size-5" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 md:mt-3 md:text-base">No change requests found</h3>
              <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm">
                {searchText ? "Try adjusting your search criteria" : "No change requests available for this customer"}
              </p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
            {changeRequestsByCustomer.map((changeRequest: ChangeRequestListItem) => (
              <ChangeRequestCard
                key={changeRequest.publicId}
                changeRequest={changeRequest}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {changeRequestsByCustomer.map((changeRequest: ChangeRequestListItem) => (
              <ChangeRequestListItem
                key={changeRequest.publicId}
                changeRequest={changeRequest}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {changeRequestsByCustomer.length > 0 && (
          <div className="mt-3 flex w-full flex-row items-center justify-between gap-2 md:flex-row">
            <div className="flex items-center gap-1 max-sm:hidden">
              <p className="text-xs md:text-sm">Show rows</p>
              <select
                value={changeRequestsByCustomerPagination.pageSize}
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

            <div className="flex flex-wrap items-center justify-center md:justify-start md:gap-3">
              <button
                className={`px-1.5 py-1 md:px-2 md:py-1.5 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <BiSolidLeftArrow className="size-3.5 md:size-4" />
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                <div className="hidden items-center gap-1 md:flex md:gap-2">
                  {getPageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex size-5 items-center justify-center rounded-md text-xs md:h-6 md:w-7 md:text-xs ${
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
                        className={`flex size-5 items-center justify-center rounded-md text-xs md:w-7 ${
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
                className={`px-1.5 py-1 md:px-2 md:py-1.5 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <BiSolidRightArrow className="size-3.5 md:size-4" />
              </button>
            </div>
            <p className="text-xs max-sm:hidden md:text-sm">
              Page {currentPage} of {totalPages} ({totalRecords} total records)
            </p>
          </div>
        )}
      </motion.div>

      {/* View Change Request Modal */}
      <ViewCustomerChangeRequestModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        changeRequestId={selectedChangeRequestId || ""}
      />
    </>
  )
}

export default ChangeRequestsTab
