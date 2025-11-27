"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Building, Calendar, DollarSign, Edit3, FileText, User, Zap } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentBill, fetchPostpaidBillById } from "lib/redux/postpaidSlice"
import { fetchDistributionSubstationById } from "lib/redux/distributionSubstationsSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import BillingJobChangeRequestModal from "components/ui/Modal/billing-job-change-request-modal"
import { SearchModule } from "components/ui/Search/search-module"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { ChevronDown } from "lucide-react"
import { clearChangeRequestsByBillingJob, fetchChangeRequestsByBillingJobId } from "lib/redux/postpaidSlice"
import type {
  ChangeRequestListItem as ChangeRequestListItemType,
  ChangeRequestsRequestParams,
} from "lib/redux/postpaidSlice"

// LoadingSkeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-gray-100">
    <DashboardNav />
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 overflow-hidden rounded-md bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div>
            <div className="mb-2 h-8 w-48 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </div>
            <div className="h-4 w-32 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            />
          </div>
          <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Column Skeleton */}
        <div className="w-[30%] space-y-6">
          {/* Profile Card Skeleton */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>
              <div className="mx-auto mb-2 h-6 w-32 overflow-hidden rounded bg-gray-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
              </div>
              <div className="mx-auto mb-4 h-4 w-24 overflow-hidden rounded bg-gray-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Skeleton */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 w-full overflow-hidden rounded bg-gray-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-6 h-6 w-48 overflow-hidden rounded bg-gray-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: item * 0.1,
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  {[1, 2, 3].map((subItem) => (
                    <div key={subItem} className="space-y-2">
                      <div className="h-4 w-32 overflow-hidden rounded bg-gray-200">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1,
                          }}
                        />
                      </div>
                      <div className="h-6 w-40 overflow-hidden rounded bg-gray-200">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1 + 0.05,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((subItem) => (
                    <div key={subItem} className="space-y-2">
                      <div className="h-4 w-32 overflow-hidden rounded bg-gray-200">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1 + 0.15,
                          }}
                        />
                      </div>
                      <div className="h-6 w-40 overflow-hidden rounded bg-gray-200">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: item * 0.1 + subItem * 0.1 + 0.2,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getStatusConfig = (status: number) => {
  const configs = {
    1: { label: "Paid", color: "text-green-600", bg: "bg-green-100" },
    2: { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-100" },
    3: { label: "Overdue", color: "text-red-600", bg: "bg-red-100" },
    4: { label: "Cancelled", color: "text-gray-600", bg: "bg-gray-100" },
  }
  return configs[status as keyof typeof configs] || configs[2]
}

const getCategoryConfig = (category: number) => {
  const configs = {
    1: { label: "Residential", color: "text-blue-600", bg: "bg-blue-100" },
    2: { label: "Commercial", color: "text-green-600", bg: "bg-green-100" },
    3: { label: "Industrial", color: "text-purple-600", bg: "bg-purple-100" },
  }
  return configs[category as keyof typeof configs] || configs[1]
}

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
]

// Change Request Card Component
const ChangeRequestCard = ({
  changeRequest,
  onViewDetails,
}: {
  changeRequest: ChangeRequestListItemType
  onViewDetails: (changeRequest: ChangeRequestListItemType) => void
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
      0: { label: "System" },
      1: { label: "Manual" },
      2: { label: "Import" },
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
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
            <span className="font-semibold text-blue-600">
              {changeRequest.requestedBy
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{changeRequest.entityLabel}</h3>
            <div className="mt-1 flex items-center gap-2">
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
              >
                <span className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                {statusConfig.label}
              </div>
              <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{sourceConfig.label}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Reference:</span>
          <span className="font-medium">{changeRequest.reference}</span>
        </div>
        <div className="flex justify-between">
          <span>Requested By:</span>
          <span className="font-medium">{changeRequest.requestedBy}</span>
        </div>
        <div className="flex justify-between">
          <span>Requested At:</span>
          <span className="font-medium">{formatDate(changeRequest.requestedAtUtc)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Public ID:</span>
          <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
            {changeRequest.publicId.slice(0, 8)}...
          </div>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-gray-500">Entity ID: {changeRequest.entityId}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onViewDetails(changeRequest)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a] hover:bg-[#f9f9f9]"
        >
          <VscEye className="size-4" />
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
  changeRequest: ChangeRequestListItemType
  onViewDetails: (changeRequest: ChangeRequestListItemType) => void
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
      0: { label: "System" },
      1: { label: "Manual" },
      2: { label: "Import" },
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
    <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-semibold text-blue-600">
              {changeRequest.requestedBy
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate font-semibold text-gray-900">{changeRequest.entityLabel}</h3>
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
              >
                <span className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                {statusConfig.label}
              </div>
              <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{sourceConfig.label}</div>
              <div className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                Ref: {changeRequest.reference}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>
                <strong>Requested By:</strong> {changeRequest.requestedBy}
              </span>
              <span>
                <strong>Requested:</strong> {formatDate(changeRequest.requestedAtUtc)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium text-gray-900">Status: {statusConfig.label}</div>
            <div className="mt-1 text-xs text-gray-500">{sourceConfig.label}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onViewDetails(changeRequest)} className="button-oulined flex items-center gap-2">
              <VscEye className="size-4" />
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Filter Dropdown Component
const FilterDropdown = ({
  isOpen,
  setIsOpen,
  selectedValue,
  options,
  onSelect,
  dropdownId,
  label,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedValue: string
  options: Array<{ value: string; label: string }>
  onSelect: (value: string) => void
  dropdownId: string
  label: string
}) => {
  const selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <div className="relative" data-dropdown-root={dropdownId}>
      <button
        type="button"
        className="button-oulined flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <IoMdFunnel />
        <span>{selectedOption?.label || label}</span>
        <ChevronDown className={`size-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
                  selectedValue === option.value ? "bg-gray-50" : ""
                }`}
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Change Requests Section Component
const BillingJobChangeRequestsSection = ({ billingJobId }: { billingJobId: number }) => {
  const dispatch = useAppDispatch()
  const {
    changeRequestsByBillingJob,
    changeRequestsByBillingJobLoading,
    changeRequestsByBillingJobError,
    changeRequestsByBillingJobPagination,
  } = useAppSelector((state) => state.postpaidBilling)

  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedSource, setSelectedSource] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isSourceOpen, setIsSourceOpen] = useState(false)
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch change requests for this billing job
  useEffect(() => {
    const params: ChangeRequestsRequestParams = {
      pageNumber: currentPage,
      pageSize: changeRequestsByBillingJobPagination.pageSize,
      ...(selectedStatus && { status: parseInt(selectedStatus) }),
      ...(selectedSource && { source: parseInt(selectedSource) }),
      ...(searchText && { reference: searchText }),
    }

    dispatch(
      fetchChangeRequestsByBillingJobId({
        id: billingJobId,
        params,
      })
    )
  }, [
    dispatch,
    billingJobId,
    currentPage,
    changeRequestsByBillingJobPagination.pageSize,
    selectedStatus,
    selectedSource,
    searchText,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearChangeRequestsByBillingJob())
    }
  }, [dispatch])

  const handleViewDetails = (changeRequest: ChangeRequestListItemType) => {
    setSelectedChangeRequestId(changeRequest.publicId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedChangeRequestId(null)
  }

  const handleCancelSearch = () => {
    setSearchText("")
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

    dispatch(
      fetchChangeRequestsByBillingJobId({
        id: billingJobId,
        params,
      })
    )
    setCurrentPage(1)
  }

  const totalPages = changeRequestsByBillingJobPagination.totalPages || 1
  const totalRecords = changeRequestsByBillingJobPagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (changeRequestsByBillingJobLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FileText className="size-5" />
          Change Requests
        </h3>
        <div className="animate-pulse">
          <div className="mb-4 flex gap-4">
            <div className="h-10 w-80 rounded bg-gray-200"></div>
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FileText className="size-5" />
            Change Requests
          </h3>
          <button
            className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] hover:border-[#2563EB] hover:bg-[#DBEAFE]"
            onClick={() => {
              /* TODO: Implement CSV export for billing job change requests */
            }}
            disabled={!changeRequestsByBillingJob || changeRequestsByBillingJob.length === 0}
          >
            <FileText className="size-4 text-[#2563EB]" />
            <p className="text-sm text-[#2563EB]">Export CSV</p>
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 flex gap-4">
          <SearchModule
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onCancel={handleCancelSearch}
            placeholder="Search by reference or requester"
            className="max-w-[300px]"
          />

          <div className="flex gap-2">
            <button
              className={`button-oulined ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <MdGridView />
              <p>Grid</p>
            </button>
            <button
              className={`button-oulined ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <MdFormatListBulleted />
              <p>List</p>
            </button>
          </div>

          {/* Status Filter */}
          <FilterDropdown
            isOpen={isStatusOpen}
            setIsOpen={setIsStatusOpen}
            selectedValue={selectedStatus}
            options={statusOptions}
            onSelect={setSelectedStatus}
            dropdownId="status-filter"
            label="All Status"
          />

          {/* Source Filter */}
          <FilterDropdown
            isOpen={isSourceOpen}
            setIsOpen={setIsSourceOpen}
            selectedValue={selectedSource}
            options={sourceOptions}
            onSelect={setSelectedSource}
            dropdownId="source-filter"
            label="All Sources"
          />
        </div>

        {/* Change Requests Display */}
        {changeRequestsByBillingJobError ? (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto mb-4 size-12 text-gray-400" />
            <p className="text-gray-500">Error loading change requests: {changeRequestsByBillingJobError}</p>
          </div>
        ) : changeRequestsByBillingJob.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No change requests found for this billing job</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {changeRequestsByBillingJob.map((changeRequest: ChangeRequestListItemType) => (
              <ChangeRequestCard
                key={changeRequest.publicId}
                changeRequest={changeRequest}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {changeRequestsByBillingJob.map((changeRequest: ChangeRequestListItemType) => (
              <ChangeRequestListItem
                key={changeRequest.publicId}
                changeRequest={changeRequest}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {changeRequestsByBillingJob.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <p>Show rows</p>
              <select
                value={changeRequestsByBillingJobPagination.pageSize}
                onChange={handleRowsChange}
                className="bg-[#F2F2F2] p-1"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={24}>24</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                className={`px-3 py-2 ${currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"}`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <BiSolidLeftArrow />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`flex h-[27px] w-[30px] items-center justify-center rounded-md ${
                      currentPage === index + 1 ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                    }`}
                    onClick={() => changePage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                className={`px-3 py-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <BiSolidRightArrow />
              </button>
            </div>
            <p>
              Page {currentPage} of {totalPages} ({totalRecords} total records)
            </p>
          </div>
        )}
      </motion.div>
    </>
  )
}

const BillDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const billId = params.id as string

  // Get bill details from Redux store
  const { currentBill, currentBillLoading, currentBillError } = useAppSelector((state) => state.postpaidBilling)
  const { currentDistributionSubstation } = useAppSelector((state) => state.distributionSubstations)

  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [activeModal, setActiveModal] = useState<"edit" | "changeRequest" | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const closeAllModals = () => setActiveModal(null)
  const openModal = (modalType: "edit" | "changeRequest") => setActiveModal(modalType)

  useEffect(() => {
    if (billId) {
      const id = parseInt(billId)
      if (!isNaN(id)) {
        dispatch(fetchPostpaidBillById(id))
      }
    }

    // Cleanup function to clear bill details when component unmounts
    return () => {
      dispatch(clearCurrentBill())
    }
  }, [dispatch, billId])

  useEffect(() => {
    if (currentBill?.distributionSubstationId) {
      dispatch(fetchDistributionSubstationById(currentBill.distributionSubstationId))
    }
  }, [dispatch, currentBill?.distributionSubstationId])

  const handleChangeRequestSuccess = () => {
    // Refresh bill details after successful change request
    if (billId) {
      const id = parseInt(billId)
      if (!isNaN(id)) {
        dispatch(fetchPostpaidBillById(id))
      }
    }
    closeAllModals()
  }

  const exportToPDF = () => {
    if (!currentBill) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Add header
    doc.setFillColor(249, 249, 249)
    doc.rect(0, 0, pageWidth, 60, "F")

    // Company name
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(10, 10, 10)
    doc.text("BILLING STATEMENT", pageWidth / 2, 20, { align: "center" })

    // Report title
    doc.setFontSize(16)
    doc.setTextColor(100, 100, 100)
    doc.text("Postpaid Bill Details", pageWidth / 2, 30, { align: "center" })

    // Date generated
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

    let yPosition = 70

    // Customer Information Section
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(10, 10, 10)
    doc.text("CUSTOMER INFORMATION", 14, yPosition)
    yPosition += 10

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Details"]],
      body: [
        ["Customer Name", currentBill.customerName],
        ["Account Number", currentBill.customerAccountNumber],
        ["Customer ID", currentBill.customerId.toString()],
        ["Category", getCategoryConfig(currentBill.category).label],
      ],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15

    // Bill Information Section
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("BILL INFORMATION", 14, yPosition)
    yPosition += 10

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Details"]],
      body: [
        ["Bill Period", currentBill.period],
        ["Bill Name", currentBill.name],
        ["Status", getStatusConfig(currentBill.status).label],
        ["Due Date", formatDate(currentBill.dueDate)],
        ["Issue Date", formatDate(currentBill.createdAt)],
      ],
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15

    // Consumption & Charges Section
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("CONSUMPTION & CHARGES", 14, yPosition)
    yPosition += 10

    autoTable(doc, {
      startY: yPosition,
      head: [["Description", "Amount (₦)"]],
      body: [
        ["Consumption (kWh)", currentBill.consumptionKwh.toFixed(2)],
        ["Tariff per kWh", formatCurrency(currentBill.tariffPerKwh)],
        ["Charge Before VAT", formatCurrency(currentBill.chargeBeforeVat)],
        ["VAT Amount", formatCurrency(currentBill.vatAmount)],
        ["Current Bill Amount", formatCurrency(currentBill.currentBillAmount)],
        ["Opening Balance", formatCurrency(currentBill.openingBalance)],
        ["Payments Previous Month", formatCurrency(currentBill.paymentsPrevMonth)],
        ["TOTAL DUE", formatCurrency(currentBill.totalDue)],
      ],
      theme: "grid",
      headStyles: { fillColor: [139, 92, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15

    // Location Information Section
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("LOCATION INFORMATION", 14, yPosition)
    yPosition += 10

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Details"]],
      body: [
        ["Area Office", currentBill.areaOfficeName],
        ["Feeder", currentBill.feederName],
        ["Distribution Substation", currentBill.distributionSubstationCode],
      ],
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    })

    // Add page numbers
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10)
    }

    // Save the PDF
    doc.save(`bill-${currentBill.customerAccountNumber}-${currentBill.period}.pdf`)
  }

  if (currentBillLoading) {
    return <LoadingSkeleton />
  }

  if (currentBillError || !currentBill) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentBillError ? "Error Loading Bill" : "Bill Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">{currentBillError || "The bill you're looking for doesn't exist."}</p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Bills
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(currentBill.status)
  const categoryConfig = getCategoryConfig(currentBill.category)

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
                      className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-[#f9f9f9] text-gray-700 hover:bg-[#f9f9f9]"
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
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971/L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462/L0.049716 9.43565/L0.0504065 7.33631/L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273/L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </motion.button>

                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Bill Details</h1>
                      <p className="text-gray-600">Complete billing information and breakdown</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={exportToPDF}
                    >
                      <FileText className="size-4" />
                      Export PDF
                    </ButtonModule>
                    {canUpdate ? (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => openModal("edit")}
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
                {/* Left Column - Customer & Quick Info */}
                <div className="flex w-[30%] flex-col space-y-6">
                  {/* Customer Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                          <User className="size-8" />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{currentBill.customerName}</h2>
                      <p className="mb-4 text-gray-600">Account: {currentBill.customerAccountNumber}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${categoryConfig.bg} ${categoryConfig.color}`}
                        >
                          {categoryConfig.label}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="font-medium">Customer ID:</span> {currentBill.customerId}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="font-medium">Billing Period:</span> {currentBill.period}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="font-medium">Due Date:</span> {formatDate(currentBill.dueDate)}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <DollarSign className="size-5" />
                      Quick Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Due</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(currentBill.totalDue)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Consumption</span>
                        <span className="font-semibold text-gray-900">{currentBill.consumptionKwh} kWh</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Bill</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentBill.currentBillAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Opening Balance</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(currentBill.openingBalance)}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Location Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Building className="size-5" />
                      Location
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">{currentBill.areaOfficeName}</div>
                        <div className="text-sm text-gray-600">Area Office</div>
                      </div>
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">{currentBill.feederName}</div>
                        <div className="text-sm text-gray-600">Feeder</div>
                      </div>
                      <div className="rounded-lg bg-[#f9f9f9] p-3">
                        <div className="font-medium text-gray-900">
                          {currentDistributionSubstation?.dssCode || currentBill.distributionSubstationCode}
                        </div>
                        <div className="text-sm text-gray-600">Distribution Station</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6">
                  {/* Bill Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <FileText className="size-5" />
                      Bill Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Bill Name</label>
                        <p className="font-semibold text-gray-900">{currentBill.name}</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Billing Period</label>
                        <p className="font-semibold text-gray-900">{currentBill.period}</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Due Date</label>
                        <p className="font-semibold text-gray-900">{formatDate(currentBill.dueDate)}</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Issue Date</label>
                        <p className="font-semibold text-gray-900">{formatDate(currentBill.createdAt)}</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9]  p-4">
                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                        <p className="font-semibold text-gray-900">{formatDateTime(currentBill.lastUpdated)}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Consumption & Billing Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Zap className="size-5" />
                      Consumption & Billing Details
                    </h3>
                    <div className="grid grid-cols-2 gap-6 ">
                      <div className="space-y-4 rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4 md:grid-cols-2">
                        <h4 className="font-semibold text-gray-900">Consumption Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual Consumption</span>
                            <span className="font-semibold">{currentBill.consumptionKwh} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Consumption</span>
                            <span className="font-semibold">{currentBill.estimatedConsumptionKwh || 0} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Forecast Consumption</span>
                            <span className="font-semibold">{currentBill.forecastConsumptionKwh} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tariff Rate</span>
                            <span className="font-semibold">{formatCurrency(currentBill.tariffPerKwh)}/kWh</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4 md:grid-cols-2">
                        <h4 className="font-semibold text-gray-900">Billing Breakdown</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Charge Before VAT</span>
                            <span className="font-semibold">{formatCurrency(currentBill.chargeBeforeVat)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">VAT Amount ({currentBill.vatRate}%)</span>
                            <span className="font-semibold">{formatCurrency(currentBill.vatAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current Bill Amount</span>
                            <span className="font-semibold">{formatCurrency(currentBill.currentBillAmount)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold text-gray-900">Total Due</span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(currentBill.totalDue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Balance & Forecast Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <DollarSign className="size-5" />
                      Balance & Forecast
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4 rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <h4 className="font-semibold text-gray-900">Balance Information</h4>
                        <div className="space-y-3 ">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Opening Balance</span>
                            <span className="font-semibold">{formatCurrency(currentBill.openingBalance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payments Previous Month</span>
                            <span className="font-semibold">{formatCurrency(currentBill.paymentsPrevMonth)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Adjusted Opening Balance</span>
                            <span className="font-semibold">{formatCurrency(currentBill.adjustedOpeningBalance)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 rounded-lg border border-dashed border-gray-200 bg-[#f9f9f9] p-4">
                        <h4 className="font-semibold text-gray-900">Forecast Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Forecast Bill Amount</span>
                            <span className="font-semibold">{formatCurrency(currentBill.forecastBillAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Forecast Total Due</span>
                            <span className="font-semibold">{formatCurrency(currentBill.forecastTotalDue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Billing Variance</span>
                            <span
                              className={`font-semibold ${
                                currentBill.billingVarianceAmount >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(currentBill.billingVarianceAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Additional Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Calendar className="size-5" />
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Meter Reading ID</label>
                        <p className="font-semibold text-gray-900">{currentBill.meterReadingId || "N/A"}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Feeder Energy Cap ID</label>
                        <p className="font-semibold text-gray-900">{currentBill.feederEnergyCapId || "N/A"}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Open Disputes</label>
                        <p className="font-semibold text-gray-900">{currentBill.openDisputeCount}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Estimated Bill</label>
                        <p className="font-semibold text-gray-900">{currentBill.isEstimated ? "Yes" : "No"}</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Meter Reading Flagged</label>
                        <p className="font-semibold text-gray-900">
                          {currentBill.isMeterReadingFlagged ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                        <label className="text-sm font-medium text-gray-600">Adjustment Status</label>
                        <p className="font-semibold text-gray-900">{currentBill.adjustmentStatus}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Ledger Entries */}
                  {currentBill.ledgerEntries && currentBill.ledgerEntries.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <FileText className="size-5" />
                        Ledger Entries ({currentBill.ledgerEntries.length})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-separate border-spacing-0 text-left">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Type
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Amount
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Code
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Memo
                              </th>
                              <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {currentBill.ledgerEntries.map((entry, index) => (
                              <tr key={entry.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                  {entry.type}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                                  {formatCurrency(entry.amount)}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                  {entry.code}
                                </td>
                                <td className="border-b px-4 py-3 text-sm text-gray-600">{entry.memo}</td>
                                <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                  {formatDateTime(entry.effectiveAtUtc)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {/* Change Requests Section */}
                  <BillingJobChangeRequestsSection billingJobId={currentBill.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BillingJobChangeRequestModal
        isOpen={activeModal === "changeRequest"}
        onRequestClose={closeAllModals}
        billingJobId={currentBill.id}
        billingJobPeriod={currentBill.period}
        areaOfficeName={currentBill.areaOfficeName}
        onSuccess={handleChangeRequestSuccess}
      />
    </section>
  )
}

export default BillDetailsPage
