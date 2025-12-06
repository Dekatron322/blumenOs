// components/Tables/AllCustomerChangeRequests.tsx
"use client"

import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { ChangeRequestListItem, fetchChangeRequests } from "lib/redux/customerSlice"
import { ChevronDown } from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"
import ViewCustomerChangeRequestModal from "components/ui/Modal/view-customer-change-request-modal"

type SortOrder = "asc" | "desc" | null

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

// Entity Type options for filtering
const entityTypeOptions = [
  { value: "", label: "All Types" },
  { value: "1", label: "Customer" },
  { value: "2", label: "Employee" },
  { value: "3", label: "Asset" },
]

// Skeleton Components
const ChangeRequestCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-4 shadow-sm"
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
        <div className="size-12 rounded-full bg-gray-200"></div>
        <div>
          <div className="h-5 w-32 rounded bg-gray-200"></div>
          <div className="mt-1 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-gray-200"></div>
            <div className="h-6 w-20 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
      <div className="size-6 rounded bg-gray-200"></div>
    </div>

    <div className="mt-4 space-y-2 text-sm">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-4 w-16 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>

    <div className="mt-3 border-t pt-3">
      <div className="h-4 w-full rounded bg-gray-200"></div>
    </div>

    <div className="mt-3 flex gap-2">
      <div className="h-9 flex-1 rounded bg-gray-200"></div>
      <div className="h-9 flex-1 rounded bg-gray-200"></div>
    </div>
  </motion.div>
)

const ChangeRequestListItemSkeleton = () => (
  <motion.div
    className="border-b bg-white p-4"
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
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-gray-200"></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-5 w-40 rounded bg-gray-200"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-gray-200"></div>
              <div className="h-6 w-20 rounded-full bg-gray-200"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="mt-2 h-4 w-64 rounded bg-gray-200"></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="mt-1 h-4 w-20 rounded bg-gray-200"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 rounded bg-gray-200"></div>
          <div className="h-9 w-20 rounded bg-gray-200"></div>
          <div className="size-6 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const PaginationSkeleton = () => (
  <motion.div
    className="mt-4 flex items-center justify-between"
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
    <div className="flex items-center gap-2">
      <div className="h-4 w-16 rounded bg-gray-200"></div>
      <div className="h-8 w-16 rounded bg-gray-200"></div>
    </div>

    <div className="flex items-center gap-3">
      <div className="size-8 rounded bg-gray-200"></div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="size-7 rounded bg-gray-200"></div>
        ))}
      </div>
      <div className="size-8 rounded bg-gray-200"></div>
    </div>

    <div className="h-4 w-24 rounded bg-gray-200"></div>
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
    <div className="h-8 w-40 rounded bg-gray-200"></div>
    <div className="mt-2 flex gap-4">
      <div className="h-10 w-80 rounded bg-gray-200"></div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
        ))}
      </div>
    </div>
  </motion.div>
)

const AllCustomerChangeRequests = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { changeRequests, changeRequestsLoading, changeRequestsError, changeRequestsPagination } = useSelector(
    (state: RootState) => state.customers
  )

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedSource, setSelectedSource] = useState("")
  const [selectedEntityType, setSelectedEntityType] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isSourceOpen, setIsSourceOpen] = useState(false)
  const [isEntityTypeOpen, setIsEntityTypeOpen] = useState(false)
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const router = useRouter()

  // Fetch change requests on component mount and when page changes
  useEffect(() => {
    dispatch(
      fetchChangeRequests({
        pageNumber: currentPage,
        pageSize: changeRequestsPagination.pageSize,
        ...(selectedStatus && { status: parseInt(selectedStatus) }),
        ...(selectedSource && { source: parseInt(selectedSource) }),
        ...(searchText && { reference: searchText }),
      })
    )
  }, [dispatch, currentPage, changeRequestsPagination.pageSize, selectedStatus, selectedSource, searchText])

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-root="change-request-actions"]')) {
        setActiveDropdown(null)
      }
      if (!target.closest('[data-dropdown-root="status-filter"]')) {
        setIsStatusOpen(false)
      }
      if (!target.closest('[data-dropdown-root="source-filter"]')) {
        setIsSourceOpen(false)
      }
      if (!target.closest('[data-dropdown-root="entity-type-filter"]')) {
        setIsEntityTypeOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

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

  const getEntityTypeConfig = (entityType: number) => {
    const configs = {
      1: { label: "Customer", color: "text-blue-600", bg: "bg-blue-50" },
      2: { label: "Employee", color: "text-green-600", bg: "bg-green-50" },
      3: { label: "Asset", color: "text-purple-600", bg: "bg-purple-50" },
    }
    return configs[entityType as keyof typeof configs] || { label: "Unknown", color: "text-gray-600", bg: "bg-gray-50" }
  }

  const handleApprove = (changeRequest: ChangeRequestListItem) => {
    console.log("Approving change request:", changeRequest.publicId)
    // TODO: Implement approve functionality
    // dispatch(approveChangeRequest({ publicId: changeRequest.publicId, notes: "Approved by admin" }))
  }

  const handleDecline = (changeRequest: ChangeRequestListItem) => {
    console.log("Declining change request:", changeRequest.publicId)
    // TODO: Implement decline functionality
    // dispatch(declineChangeRequest({ publicId: changeRequest.publicId, reason: "Request denied" }))
  }

  const handleViewDetails = (changeRequest: ChangeRequestListItem) => {
    setSelectedChangeRequestId(changeRequest.publicId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedChangeRequestId(null)
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

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      fetchChangeRequests({
        pageNumber: 1,
        pageSize: newPageSize,
        ...(selectedStatus && { status: parseInt(selectedStatus) }),
        ...(selectedSource && { source: parseInt(selectedSource) }),
        ...(searchText && { reference: searchText }),
      })
    )
    setCurrentPage(1)
  }

  const totalPages = changeRequestsPagination.totalPages || 1
  const totalRecords = changeRequestsPagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const ChangeRequestCard = ({ changeRequest }: { changeRequest: ChangeRequestListItem }) => {
    const statusConfig = getStatusConfig(changeRequest.status)
    const sourceConfig = getSourceConfig(changeRequest.source || 1)
    const entityTypeConfig = getEntityTypeConfig(changeRequest.entityType)

    return (
      <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
              <span className="font-semibold text-blue-600">
                {changeRequest.requestedBy
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "CR"}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{changeRequest.entityLabel}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
                >
                  <span className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                  {statusConfig.label}
                </div>
                <div className={`rounded-full px-2 py-1 text-xs ${sourceConfig.bg} ${sourceConfig.color}`}>
                  {sourceConfig.label}
                </div>
                <div className={`rounded-full px-2 py-1 text-xs ${entityTypeConfig.bg} ${entityTypeConfig.color}`}>
                  {entityTypeConfig.label}
                </div>
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
            <span>Entity Type:</span>
            <span className="font-medium">{entityTypeConfig.label}</span>
          </div>
          <div className="flex justify-between">
            <span>Entity ID:</span>
            <span className="font-medium">{changeRequest.entityId}</span>
          </div>
          <div className="flex justify-between">
            <span>Requested At:</span>
            <span className="font-medium">{formatDate(changeRequest.requestedAtUtc)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Public ID:</span>
            <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
              {changeRequest.publicId?.slice(0, 8)}...
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => handleViewDetails(changeRequest)}
            className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a] hover:bg-[#f9f9f9]"
          >
            <VscEye className="size-4" />
            View Details
          </button>
          {/* {changeRequest.status === 0 && (
            <>
              <button
                onClick={() => handleApprove(changeRequest)}
                className="button-oulined flex flex-1 items-center justify-center gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 transition-all duration-300 ease-in-out hover:border-emerald-300 hover:bg-emerald-100"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
              <button
                onClick={() => handleDecline(changeRequest)}
                className="button-oulined flex flex-1 items-center justify-center gap-2 border-red-200 bg-red-50 text-red-700 transition-all duration-300 ease-in-out hover:border-red-300 hover:bg-red-100"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Decline
              </button>
            </>
          )} */}
        </div>
      </div>
    )
  }

  const ChangeRequestListItem = ({ changeRequest }: { changeRequest: ChangeRequestListItem }) => {
    const statusConfig = getStatusConfig(changeRequest.status)
    const sourceConfig = getSourceConfig(changeRequest.source || 1)
    const entityTypeConfig = getEntityTypeConfig(changeRequest.entityType)

    return (
      <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
              <span className="text-sm font-semibold text-blue-600">
                {changeRequest.requestedBy
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "CR"}
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
                <div className={`rounded-full px-2 py-1 text-xs ${sourceConfig.bg} ${sourceConfig.color}`}>
                  {sourceConfig.label}
                </div>
                <div className={`rounded-full px-2 py-1 text-xs ${entityTypeConfig.bg} ${entityTypeConfig.color}`}>
                  {entityTypeConfig.label}
                </div>
                <div className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  Ref: {changeRequest.reference}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span>
                  <strong>Requested By:</strong> {changeRequest.requestedBy}
                </span>
                <span>
                  <strong>Entity ID:</strong> {changeRequest.entityId}
                </span>
                <span>
                  <strong>Requested:</strong> {formatDate(changeRequest.requestedAtUtc)}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">Public ID: {changeRequest.publicId}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="font-medium text-gray-900">Status: {statusConfig.label}</div>
              <div className="mt-1 text-xs text-gray-500">
                {sourceConfig.label} • {entityTypeConfig.label}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewDetails(changeRequest)}
                className="button-oulined flex items-center gap-2"
              >
                <VscEye className="size-4" />
                View
              </button>
              {/* {changeRequest.status === 0 && (
                <>
                  <button
                    onClick={() => handleApprove(changeRequest)}
                    className="button-oulined flex items-center gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecline(changeRequest)}
                    className="button-oulined flex items-center gap-2 border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Decline
                  </button>
                </>
              )} */}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (changeRequestsLoading) {
    return (
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        {/* Main Content Skeleton */}
        <div className="w-full rounded-md border bg-white p-5">
          <HeaderSkeleton />

          {/* Change Request Display Area Skeleton */}
          <div className="w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        {/* Main Content - Change Requests List/Grid */}
        <div className="w-full rounded-md border bg-white p-5">
          <div className="flex flex-col py-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-2xl font-medium">Customer Change Requests</p>
              <button
                className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] hover:border-[#2563EB] hover:bg-[#DBEAFE]"
                onClick={() => {
                  /* TODO: Implement CSV export for customer change requests */
                  console.log("Export CSV functionality to be implemented")
                }}
                disabled={!changeRequests || changeRequests.length === 0}
              >
                <ExportCsvIcon color="#2563EB" size={20} />
                <p className="text-sm text-[#2563EB]">Export CSV</p>
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-4">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by reference, requester, or entity label"
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
              <div className="relative" data-dropdown-root="status-filter">
                <button
                  type="button"
                  className="button-oulined flex items-center gap-2"
                  onClick={() => setIsStatusOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isStatusOpen}
                >
                  <IoMdFunnel />
                  <span>{statusOptions.find((opt) => opt.value === selectedStatus)?.label || "All Status"}</span>
                  <ChevronDown
                    className={`size-4 text-gray-500 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isStatusOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
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
                  className="button-oulined flex items-center gap-2"
                  onClick={() => setIsSourceOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isSourceOpen}
                >
                  <IoMdFunnel />
                  <span>{sourceOptions.find((opt) => opt.value === selectedSource)?.label || "All Sources"}</span>
                  <ChevronDown
                    className={`size-4 text-gray-500 transition-transform ${isSourceOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isSourceOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {sourceOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
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

              {/* Entity Type Filter */}
              <div className="relative" data-dropdown-root="entity-type-filter">
                <button
                  type="button"
                  className="button-oulined flex items-center gap-2"
                  onClick={() => setIsEntityTypeOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isEntityTypeOpen}
                >
                  <IoMdFunnel />
                  <span>{entityTypeOptions.find((opt) => opt.value === selectedEntityType)?.label || "All Types"}</span>
                  <ChevronDown
                    className={`size-4 text-gray-500 transition-transform ${isEntityTypeOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isEntityTypeOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {entityTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
                            selectedEntityType === option.value ? "bg-gray-50" : ""
                          }`}
                          onClick={() => {
                            setSelectedEntityType(option.value)
                            setIsEntityTypeOpen(false)
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

          {/* Change Request Display Area */}
          <div className="w-full">
            {changeRequests.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No change requests found</p>
                {searchText || selectedStatus || selectedSource || selectedEntityType ? (
                  <p className="mt-2 text-sm text-gray-400">Try adjusting your filters or search criteria</p>
                ) : null}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {changeRequests.map((changeRequest: ChangeRequestListItem) => (
                  <ChangeRequestCard key={changeRequest.publicId} changeRequest={changeRequest} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {changeRequests.map((changeRequest: ChangeRequestListItem) => (
                  <ChangeRequestListItem key={changeRequest.publicId} changeRequest={changeRequest} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {changeRequests.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p>Show rows</p>
                <select
                  value={changeRequestsPagination.pageSize}
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
        </div>
      </div>

      {/* View Customer Change Request Modal */}
      <ViewCustomerChangeRequestModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        changeRequestId={selectedChangeRequestId || ""}
      />
    </>
  )
}

export default AllCustomerChangeRequests
