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
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"
import Image from "next/image"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

import { ChangeRequestListItem, fetchChangeRequests } from "lib/redux/postpaidSlice"
import ViewChangeRequestModal from "../ui/Modal/view-billing-change-request-modal"

type SortOrder = "asc" | "desc" | null

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
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

// Entity Type options for billing
const entityTypeOptions = [
  { value: "", label: "All Types" },
  { value: "1", label: "Billing Job" },
  { value: "2", label: "Postpaid Bill" },
  { value: "3", label: "Billing Period" },
]

// Responsive Skeleton Components
const ChangeRequestCardSkeleton = () => (
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
      <div className="size-5 rounded bg-gray-200 md:size-6"></div>
    </div>

    <div className="mt-3 space-y-2 md:mt-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
          <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-16"></div>
        </div>
      ))}
    </div>

    <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
      <div className="h-3 w-full rounded bg-gray-200 md:h-4"></div>
    </div>

    <div className="mt-2 flex gap-2 md:mt-3">
      <div className="h-8 flex-1 rounded bg-gray-200 md:h-9"></div>
      <div className="h-8 flex-1 rounded bg-gray-200 md:h-9"></div>
    </div>
  </motion.div>
)

const ChangeRequestListItemSkeleton = () => (
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
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-24"></div>
            ))}
          </div>
          <div className="mt-2 hidden h-3 w-40 rounded bg-gray-200 md:block md:h-4 md:w-64"></div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 md:justify-end md:gap-3">
        <div className="hidden text-right md:block">
          <div className="h-3 w-20 rounded bg-gray-200 md:h-4 md:w-24"></div>
          <div className="mt-1 h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-14 rounded bg-gray-200 md:h-9 md:w-20"></div>
          <div className="size-5 rounded bg-gray-200 md:size-6"></div>
        </div>
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
    <div className="h-7 w-32 rounded bg-gray-200 md:h-8 md:w-40"></div>
    <div className="mt-2 flex flex-col gap-3 md:mt-3 md:flex-row md:gap-4">
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

// Mobile & All Screens Filter Sidebar Component (up to 2xl)
const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  statusOptions,
  sourceOptions,
  entityTypeOptions,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  statusOptions: Array<{ value: string; label: string }>
  sourceOptions: Array<{ value: string; label: string }>
  entityTypeOptions: Array<{ value: string; label: string }>
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
}) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="mobile-filter-sidebar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <motion.div
            key="mobile-filter-content"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex h-full w-full max-w-sm flex-col bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold">Filters & Sorting</h2>
                  {getActiveFilterCount() > 0 && (
                    <p className="text-xs text-gray-500">{getActiveFilterCount()} active filter(s)</p>
                  )}
                </div>
              </div>
              <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">
                Clear All
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 space-y-4">
              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions
                    .filter((opt) => opt.value !== "")
                    .map((option) => {
                      const statusValue = parseInt(option.value)
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.status === statusValue
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                </div>
              </div>

              {/* Source Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Source</label>
                <FormSelectModule
                  name="source"
                  value={localFilters.source !== undefined ? String(localFilters.source) : ""}
                  onChange={(e) =>
                    handleFilterChange("source", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={sourceOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Entity Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Entity Type</label>
                <FormSelectModule
                  name="entityType"
                  value={localFilters.entityType !== undefined ? String(localFilters.entityType) : ""}
                  onChange={(e) =>
                    handleFilterChange("entityType", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={entityTypeOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSortExpanded((prev) => !prev)}
                  className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                  aria-expanded={isSortExpanded}
                >
                  <span>Sort By</span>
                  {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {isSortExpanded && (
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => handleSortChange(option)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                          localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                          <span className="text-purple-600">
                            {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-6 border-t bg-white p-4 2xl:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const BillingChangeRequestsTable = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { changeRequests, changeRequestsLoading, changeRequestsError, changeRequestsPagination } = useSelector(
    (state: RootState) => state.postpaidBilling
  )

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const router = useRouter()

  // Local state for filters (UI state - what user is selecting)
  const [localFilters, setLocalFilters] = useState({
    status: undefined as number | undefined,
    source: undefined as number | undefined,
    entityType: undefined as number | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state (only updated when "Apply Filters" is clicked)
  const [appliedFilters, setAppliedFilters] = useState({
    status: undefined as number | undefined,
    source: undefined as number | undefined,
    entityType: undefined as number | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Fetch billing change requests on component mount and when applied filters change
  useEffect(() => {
    dispatch(
      fetchChangeRequests({
        pageNumber: currentPage,
        pageSize: changeRequestsPagination.pageSize,
        ...(appliedFilters.status !== undefined ? { status: appliedFilters.status } : {}),
        ...(appliedFilters.source !== undefined ? { source: appliedFilters.source } : {}),
        ...(searchText && { reference: searchText }),
      })
    )
  }, [dispatch, currentPage, changeRequestsPagination.pageSize, appliedFilters, searchText])

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-root="change-request-actions"]')) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Reference A-Z", value: "reference", order: "asc" },
    { label: "Reference Z-A", value: "reference", order: "desc" },
    { label: "Requested By A-Z", value: "requestedBy", order: "asc" },
    { label: "Requested By Z-A", value: "requestedBy", order: "desc" },
    { label: "Requested Date Asc", value: "requestedAtUtc", order: "asc" },
    { label: "Requested Date Desc", value: "requestedAtUtc", order: "desc" },
    { label: "Status Asc", value: "status", order: "asc" },
    { label: "Status Desc", value: "status", order: "desc" },
    { label: "Entity Type Asc", value: "entityType", order: "asc" },
    { label: "Entity Type Desc", value: "entityType", order: "desc" },
  ]

  // Handle individual filter changes (local state)
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  // Apply all filters at once
  const applyFilters = () => {
    // Copy localFilters to appliedFilters to trigger API call
    setAppliedFilters({ ...localFilters })
    // Reset to first page when applying filters
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    const emptyFilters = {
      status: undefined,
      source: undefined,
      entityType: undefined,
      sortBy: "",
      sortOrder: "asc" as "asc" | "desc",
    }
    setLocalFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setSearchText("")
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.status !== undefined) count++
    if (localFilters.source !== undefined) count++
    if (localFilters.entityType !== undefined) count++
    if (localFilters.sortBy) count++
    return count
  }

  const getStatusConfig = (status: number) => {
    const configs = {
      0: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "DRAFT" },
      1: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "PUBLISHED" },
      2: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "REVERSED" },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getSourceConfig = (source: number) => {
    const configs = {
      0: { label: "System", color: "text-blue-600", bg: "bg-blue-50" },
      1: { label: "Manual", color: "text-green-600", bg: "bg-green-50" },
      2: { label: "Import", color: "text-purple-600", bg: "bg-purple-50" },
    }
    return configs[source as keyof typeof configs] || configs[1]
  }

  const getEntityTypeConfig = (entityType: number) => {
    const configs = {
      1: { label: "Billing Job", color: "text-purple-600", bg: "bg-purple-50" },
      2: { label: "Postpaid Bill", color: "text-blue-600", bg: "bg-blue-50" },
      3: { label: "Billing Period", color: "text-green-600", bg: "bg-green-50" },
    }
    return configs[entityType as keyof typeof configs] || { label: "Unknown", color: "text-gray-600", bg: "bg-gray-50" }
  }

  const handleApprove = (changeRequest: ChangeRequestListItem) => {
    console.log("Approving billing change request:", changeRequest.publicId)
    // TODO: Implement approve functionality for billing change requests
    // dispatch(approveChangeRequest(changeRequest.publicId))
  }

  const handleDeny = (changeRequest: ChangeRequestListItem) => {
    console.log("Denying billing change request:", changeRequest.publicId)
    // TODO: Implement deny functionality for billing change requests
    // dispatch(denyChangeRequest(changeRequest.publicId))
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
        ...(appliedFilters.status !== undefined ? { status: appliedFilters.status } : {}),
        ...(appliedFilters.source !== undefined ? { source: appliedFilters.source } : {}),
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

  const ChangeRequestCard = ({ changeRequest }: { changeRequest: ChangeRequestListItem }) => {
    const statusConfig = getStatusConfig(changeRequest.status)
    const sourceConfig = getSourceConfig(changeRequest.source || 1)
    const entityTypeConfig = getEntityTypeConfig(changeRequest.entityType)

    return (
      <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-3 shadow-sm transition-all hover:shadow-md md:p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-full ${entityTypeConfig.bg} md:size-12`}>
              <span className={`text-sm font-semibold ${entityTypeConfig.color} md:text-base`}>
                {changeRequest.requestedBy
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 md:text-base">{changeRequest.entityLabel}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-1 md:gap-2">
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
                >
                  <span className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                  {statusConfig.label}
                </div>
                <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{sourceConfig.label}</div>
                <div className={`rounded-full px-2 py-1 text-xs ${entityTypeConfig.bg} ${entityTypeConfig.color}`}>
                  {entityTypeConfig.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-xs text-gray-600 md:mt-4 md:text-sm">
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

        <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
          <p className="text-xs text-gray-500">Entity ID: {changeRequest.entityId}</p>
        </div>

        <div className="mt-2 flex gap-2 md:mt-3">
          <button
            onClick={() => handleViewDetails(changeRequest)}
            className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white text-xs transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9] md:text-sm"
          >
            <VscEye className="size-3 md:size-4" />
            View Details
          </button>
        </div>
      </div>
    )
  }

  const ChangeRequestListItem = ({ changeRequest }: { changeRequest: ChangeRequestListItem }) => {
    const statusConfig = getStatusConfig(changeRequest.status)
    const sourceConfig = getSourceConfig(changeRequest.source || 1)
    const entityTypeConfig = getEntityTypeConfig(changeRequest.entityType)

    return (
      <div className="border-b bg-white p-3 transition-all hover:bg-gray-50 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex items-start gap-3 md:items-center md:gap-4">
            <div
              className={`flex size-8 items-center justify-center rounded-full ${entityTypeConfig.bg} max-sm:hidden md:size-10`}
            >
              <span className={`text-xs font-semibold ${entityTypeConfig.color} md:text-sm`}>
                {changeRequest.requestedBy
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                <h3 className="text-sm font-semibold text-gray-900 md:text-base">{changeRequest.entityLabel}</h3>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
                  >
                    <span className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                    {statusConfig.label}
                  </div>
                  <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{sourceConfig.label}</div>
                  <div className={`rounded-full px-2 py-1 text-xs ${entityTypeConfig.bg} ${entityTypeConfig.color}`}>
                    {entityTypeConfig.label}
                  </div>
                  <div className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    Ref: {changeRequest.reference}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 md:gap-4 md:text-sm">
                <span>
                  <strong className="md:hidden">By:</strong>
                  <strong className="hidden md:inline">Requested By:</strong> {changeRequest.requestedBy}
                </span>
                <span>
                  <strong>Entity Type:</strong> {entityTypeConfig.label}
                </span>
                <span>
                  <strong>Requested:</strong> {formatDate(changeRequest.requestedAtUtc)}
                </span>
              </div>
              <p className="mt-2 hidden text-xs text-gray-500 md:block md:text-sm">
                Entity ID: {changeRequest.entityId}
              </p>
            </div>
          </div>

          <div className="flex items-start justify-between md:items-center md:gap-3">
            <div className="text-right text-xs md:text-sm">
              <div className="hidden font-medium text-gray-900 md:block">Status: {statusConfig.label}</div>
              <div className="hidden text-gray-600 md:block">
                {sourceConfig.label} • {entityTypeConfig.label}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewDetails(changeRequest)}
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

  if (changeRequestsLoading) {
    return (
      <div className="flex-3 relative mt-5 flex flex-col items-start gap-6  2xl:flex-row">
        {/* Main Content Skeleton */}
        <div className="m w-full rounded-md border bg-white p-3">
          <HeaderSkeleton />

          {/* Mobile Filters Skeleton */}
          <div className="mt-3 md:hidden">
            <MobileFilterSkeleton />
          </div>

          {/* Change Request Display Area Skeleton */}
          <div className="mt-4 w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
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
      <div className="flex-3 relative flex flex-col items-start gap-6 max-md:px-3 2xl:mt-5 2xl:flex-row">
        {/* Main Content - Billing Change Requests List/Grid */}
        <motion.div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex w-full flex-col py-2">
            <div className="mb-3 flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Filter Button for ALL screens up to 2xl */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 2xl:hidden"
                >
                  <Filter className="size-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                <p className="whitespace-nowrap text-lg font-medium sm:text-xl md:text-2xl">Billing Change Requests</p>
              </div>

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

                {/* Desktop/Tablet search input */}
                <div className="hidden sm:block">
                  <SearchModule
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onCancel={handleCancelSearch}
                    placeholder="Search by reference or requester"
                    className="w-full max-w-full md:max-w-[300px]"
                  />
                </div>

                {/* Active filters badge - Desktop only (2xl and above) */}
                {getActiveFilterCount() > 0 && (
                  <div className="hidden items-center gap-2 2xl:flex">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Hide/Show Filters button - Desktop only (2xl and above) */}
                <button
                  type="button"
                  onClick={() => setShowDesktopFilters((prev) => !prev)}
                  className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
                >
                  {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                  {showDesktopFilters ? "Hide filters" : "Show filters"}
                </button>

                {/* Export CSV Button */}
                <button
                  className="button-oulined items-center gap-2 border-[#2563EB] bg-[#DBEAFE] hover:border-[#2563EB] hover:bg-[#DBEAFE] max-sm:hidden sm:flex"
                  onClick={() => {
                    /* TODO: Implement CSV export for billing change requests */
                    console.log("Export CSV functionality to be implemented")
                  }}
                  disabled={!changeRequests || changeRequests.length === 0}
                >
                  <ExportCsvIcon color="#2563EB" size={20} />
                  <p className="text-sm text-[#2563EB]">Export CSV</p>
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
                  placeholder="Search by reference or requester"
                  className="w-full"
                />
              </div>
            )}

            {/* Mobile Export CSV Button */}
            {changeRequests && changeRequests.length > 0 && (
              <div className="mb-3 sm:hidden">
                <button
                  className="button-oulined flex w-full items-center justify-center gap-2 border-[#2563EB] bg-[#DBEAFE] hover:border-[#2563EB] hover:bg-[#DBEAFE]"
                  onClick={() => {
                    console.log("Export CSV functionality to be implemented")
                  }}
                >
                  <ExportCsvIcon color="#2563EB" size={20} />
                  <p className="text-sm text-[#2563EB]">Export CSV</p>
                </button>
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2 md:flex-nowrap md:gap-4">
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
            </div>
          </div>

          {/* Error Message */}
          {changeRequestsError && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
              <p>Error loading billing change requests: {changeRequestsError}</p>
            </div>
          )}

          {/* Change Request Display Area */}
          <div className="w-full">
            {changeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-12">
                <div className="text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-gray-100 md:size-12">
                    <VscEye className="size-5 text-gray-400 md:size-6" />
                  </div>
                  <h3 className="mt-3 text-base font-medium text-gray-900 md:mt-4 md:text-lg">
                    No billing change requests found
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm">
                    {searchText || getActiveFilterCount() > 0
                      ? "Try adjusting your filters or search criteria"
                      : "No billing change requests available"}
                  </p>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
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
            <div className="mt-4 flex w-full flex-row items-center justify-between gap-3 md:flex-row">
              <div className="flex items-center gap-1 max-sm:hidden">
                <p className="text-sm md:text-base">Show rows</p>
                <select
                  value={changeRequestsPagination.pageSize}
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
                  <BiSolidRightArrow className="size-4 md:size-5" />
                </button>
              </div>
              <p className="text-sm max-sm:hidden md:text-base">
                Page {currentPage} of {totalPages} ({totalRecords} total records)
              </p>
            </div>
          )}
        </motion.div>

        {/* Desktop Filters Sidebar (2xl and above) - Toggleable */}
        {showDesktopFilters && (
          <motion.div
            key="desktop-filters-sidebar"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="hidden w-full flex-col rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:flex 2xl:w-80 2xl:self-start"
          >
            <div className="mb-4 flex shrink-0 items-center justify-between border-b pb-3 md:pb-4">
              <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters & Sorting</h2>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
              >
                <X className="size-3 md:size-4" />
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions
                    .filter((opt) => opt.value !== "")
                    .map((option) => {
                      const statusValue = parseInt(option.value)
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.status === statusValue
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                </div>
              </div>

              {/* Source Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Source</label>
                <FormSelectModule
                  name="source"
                  value={localFilters.source !== undefined ? String(localFilters.source) : ""}
                  onChange={(e) =>
                    handleFilterChange("source", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={sourceOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Entity Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Entity Type</label>
                <FormSelectModule
                  name="entityType"
                  value={localFilters.entityType !== undefined ? String(localFilters.entityType) : ""}
                  onChange={(e) =>
                    handleFilterChange("entityType", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={entityTypeOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSortExpanded((prev) => !prev)}
                  className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                  aria-expanded={isSortExpanded}
                >
                  <span>Sort By</span>
                  {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {isSortExpanded && (
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => handleSortChange(option)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                          localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                          <span className="text-purple-600">
                            {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 shrink-0 space-y-3 border-t pt-4">
              <button
                onClick={applyFilters}
                className="button-filled flex w-full items-center justify-center gap-2 text-sm md:text-base"
              >
                <Filter className="size-4" />
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="button-oulined flex w-full items-center justify-center gap-2 text-sm md:text-base"
              >
                <X className="size-4" />
                Reset All
              </button>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 shrink-0 rounded-lg bg-gray-50 p-3 md:mt-6">
              <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">{totalRecords.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium">
                    {currentPage} / {totalPages || 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Filters:</span>
                  <span className="font-medium">{getActiveFilterCount()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile & All Screens Filter Sidebar (up to 2xl) */}
      <MobileFilterSidebar
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        statusOptions={statusOptions}
        sourceOptions={sourceOptions}
        entityTypeOptions={entityTypeOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />

      {/* View Change Request Modal */}
      <ViewChangeRequestModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        changeRequestId={selectedChangeRequestId || ""}
      />
    </>
  )
}

export default BillingChangeRequestsTable
