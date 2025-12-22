"use client"

import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"
import type { ChangeRequestListItem } from "lib/redux/polesSlice"
import { clearChangeRequests, fetchChangeRequests } from "lib/redux/polesSlice"
import ViewPoleChangeRequestModal from "../ui/Modal/view-pole-change-request-modal"

// Types
type ViewMode = "list" | "grid"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

// Constants
const STATUS_OPTIONS = [
  { value: "0", label: "Pending" },
  { value: "1", label: "Approved" },
  { value: "2", label: "Declined" },
  { value: "3", label: "Cancelled" },
  { value: "4", label: "Applied" },
  { value: "5", label: "Failed" },
]

const SOURCE_OPTIONS = [
  { value: "0", label: "System" },
  { value: "1", label: "Manual" },
  { value: "2", label: "Import" },
]

// Utility functions
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

const getEntityTypeLabel = (entityType: number) => {
  const types = {
    1: "Injection Substation",
    2: "Employee",
    3: "Area Office",
    4: "Feeder",
    5: "HT Pole",
  }
  return types[entityType as keyof typeof types] || "Unknown"
}

// Skeleton Components
const ChangeRequestCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-4 shadow-sm"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
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
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
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
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
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
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
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

// Main Component
const PoleChangeRequest = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { changeRequests, changeRequestsLoading, changeRequestsError, changeRequestsPagination } = useSelector(
    (state: RootState) => state.poles
  )

  // State
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(true)

  // Local filter state (not applied yet)
  const [localFilters, setLocalFilters] = useState({
    status: undefined as number | undefined,
    source: undefined as number | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters (used for API calls)
  const [appliedFilters, setAppliedFilters] = useState({
    searchText: "",
    status: undefined as number | undefined,
    source: undefined as number | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Effects
  useEffect(() => {
    dispatch(
      fetchChangeRequests({
        pageNumber: currentPage,
        pageSize: changeRequestsPagination.pageSize,
        ...(appliedFilters.status !== undefined && { status: appliedFilters.status }),
        ...(appliedFilters.source !== undefined && { source: appliedFilters.source }),
        ...(appliedFilters.searchText && { reference: appliedFilters.searchText }),
      })
    )

    return () => {
      dispatch(clearChangeRequests())
    }
  }, [dispatch, currentPage, changeRequestsPagination.pageSize, appliedFilters])

  // Handle filter changes
  const handleFilterChange = (key: string, value: number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === undefined ? undefined : value,
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
    setAppliedFilters({
      searchText: searchInput.trim(),
      status: localFilters.status,
      source: localFilters.source,
      sortBy: localFilters.sortBy,
      sortOrder: localFilters.sortOrder,
    })
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      status: undefined,
      source: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setSearchInput("")
    setAppliedFilters({
      searchText: "",
      status: undefined,
      source: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.searchText) count++
    if (appliedFilters.status !== undefined) count++
    if (appliedFilters.source !== undefined) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  // Handlers
  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      fetchChangeRequests({
        pageNumber: 1,
        pageSize: newPageSize,
        ...(appliedFilters.status !== undefined && { status: appliedFilters.status }),
        ...(appliedFilters.source !== undefined && { source: appliedFilters.source }),
        ...(appliedFilters.searchText && { reference: appliedFilters.searchText }),
      })
    )
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleCancelSearch = () => {
    setSearchInput("")
  }

  const sortOptions: SortOption[] = [
    { label: "Requested Date (Newest)", value: "requestedAtUtc", order: "desc" },
    { label: "Requested Date (Oldest)", value: "requestedAtUtc", order: "asc" },
    { label: "Reference A-Z", value: "reference", order: "asc" },
    { label: "Reference Z-A", value: "reference", order: "desc" },
    { label: "Requester A-Z", value: "requestedBy", order: "asc" },
    { label: "Requester Z-A", value: "requestedBy", order: "desc" },
  ]

  // Mobile Filter Sidebar Component
  const MobileFilterSidebar = () => {
    return (
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="flex w-full max-w-sm flex-col bg-white p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMobileFilters(false)}
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
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "status",
                            localFilters.status === parseInt(option.value) ? undefined : parseInt(option.value)
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === parseInt(option.value)
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Source</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOURCE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "source",
                            localFilters.source === parseInt(option.value) ? undefined : parseInt(option.value)
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.source === parseInt(option.value)
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsSortExpanded((prev) => !prev)}
                    className="mb-2 flex w-full items-center justify-between text-sm font-medium"
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
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                            localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                              ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span>{option.label}</span>
                          {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                            <span className="text-purple-600">
                              {option.order === "asc" ? (
                                <SortAsc className="size-4" />
                              ) : (
                                <SortDesc className="size-4" />
                              )}
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
                      setShowMobileFilters(false)
                    }}
                    className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => {
                      resetFilters()
                      setShowMobileFilters(false)
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

  const handleViewDetails = (changeRequest: ChangeRequestListItem) => {
    setSelectedChangeRequestId(changeRequest.publicId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedChangeRequestId(null)
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Derived values
  const totalPages = changeRequestsPagination.totalPages || 1
  const totalRecords = changeRequestsPagination.totalCount || 0

  // Loading state
  if (changeRequestsLoading) {
    return (
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        <div className="w-full rounded-md border bg-white p-5">
          <HeaderSkeleton />
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
      <MobileFilterSidebar />
      <div className="flex-3 relative mt-5 flex flex-col items-start gap-6 2xl:flex-row">
        {/* Main Content */}
        <div
          className={
            showDesktopFilters
              ? "w-full min-w-0 rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full min-w-0 rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
          }
        >
          {/* Header */}
          <div className="flex flex-col border-b py-2 md:py-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Filter Button for ALL screens up to 2xl */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-xs hover:bg-gray-50 sm:gap-2 sm:px-3 sm:text-sm 2xl:hidden"
                >
                  <Filter className="size-3.5 sm:size-4" />
                  <span className="hidden xs:inline">Filters</span>
                  {getActiveFilterCount() > 0 && (
                    <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
                <p className="text-base font-medium sm:text-lg md:text-2xl">Pole Change Requests</p>
              </div>
              <button
                className="button-oulined flex items-center justify-center gap-1.5 self-start border-[#2563EB] bg-[#DBEAFE] px-2 py-2 hover:border-[#2563EB] hover:bg-[#DBEAFE] sm:gap-2 sm:px-3"
                onClick={() => {
                  /* TODO: Implement CSV export */
                }}
                disabled={!changeRequests || changeRequests.length === 0}
              >
                <ExportCsvIcon color="#2563EB" size={18} className="sm:size-5" />
                <p className="hidden text-xs text-[#2563EB] sm:block sm:text-sm">Export CSV</p>
              </button>
            </div>

            {/* Search and Controls */}
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
              <SearchModule
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by reference or requester"
                className="w-full sm:max-w-[250px] md:max-w-[300px]"
                bgClassName="bg-white"
              />

              {/* View Mode Toggle */}
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  className={`button-oulined flex items-center justify-center gap-1 px-2 py-2 sm:gap-2 sm:px-3 ${
                    viewMode === "grid" ? "bg-[#f9f9f9]" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <MdGridView className="size-4 sm:size-5" />
                  <p className="hidden text-xs sm:block sm:text-sm">Grid</p>
                </button>
                <button
                  className={`button-oulined flex items-center justify-center gap-1 px-2 py-2 sm:gap-2 sm:px-3 ${
                    viewMode === "list" ? "bg-[#f9f9f9]" : ""
                  }`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  <MdFormatListBulleted className="size-4 sm:size-5" />
                  <p className="hidden text-xs sm:block sm:text-sm">List</p>
                </button>
              </div>

              {/* Hide/Show Filters button - Desktop only (2xl and above) */}
              <button
                type="button"
                onClick={() => setShowDesktopFilters((prev) => !prev)}
                className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
              >
                {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                {showDesktopFilters ? "Hide filters" : "Show filters"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="w-full">
            {changeRequests.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">
                  {appliedFilters.searchText || getActiveFilterCount() > 0
                    ? "No change requests found matching your filters"
                    : "No change requests found"}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {changeRequests.map((changeRequest) => (
                  <ChangeRequestCard
                    key={changeRequest.publicId}
                    changeRequest={changeRequest}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {changeRequests.map((changeRequest) => (
                  <ChangeRequestListItem
                    key={changeRequest.publicId}
                    changeRequest={changeRequest}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={changeRequestsPagination.pageSize}
            onPageChange={changePage}
            onRowsChange={handleRowsChange}
          />
        </div>

        {/* Desktop Filters Sidebar (2xl and above) */}
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
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleFilterChange(
                          "status",
                          localFilters.status === parseInt(option.value) ? undefined : parseInt(option.value)
                        )
                      }
                      className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                        localFilters.status === parseInt(option.value)
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Source</label>
                <div className="grid grid-cols-2 gap-2">
                  {SOURCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleFilterChange(
                          "source",
                          localFilters.source === parseInt(option.value) ? undefined : parseInt(option.value)
                        )
                      }
                      className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                        localFilters.source === parseInt(option.value)
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
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
                    {currentPage} / {totalPages}
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

      {/* Modal */}
      <ViewPoleChangeRequestModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        changeRequestId={selectedChangeRequestId || ""}
      />
    </>
  )
}

// Sub-components

interface ChangeRequestCardProps {
  changeRequest: ChangeRequestListItem
  onViewDetails: (changeRequest: ChangeRequestListItem) => void
}

const ChangeRequestCard: React.FC<ChangeRequestCardProps> = ({ changeRequest, onViewDetails }) => {
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
          <span>Entity Type:</span>
          <span className="font-medium">{getEntityTypeLabel(changeRequest.entityType)}</span>
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
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9]"
        >
          <VscEye className="size-4" />
          View Details
        </button>
      </div>
    </div>
  )
}

interface ChangeRequestListItemProps {
  changeRequest: ChangeRequestListItem
  onViewDetails: (changeRequest: ChangeRequestListItem) => void
}

const ChangeRequestListItem: React.FC<ChangeRequestListItemProps> = ({ changeRequest, onViewDetails }) => {
  const statusConfig = getStatusConfig(changeRequest.status)
  const sourceConfig = getSourceConfig(changeRequest.source || 1)

  return (
    <div className="border-b bg-white p-3 transition-all hover:bg-gray-50 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-semibold text-blue-600">
              {changeRequest.requestedBy
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="truncate font-semibold text-gray-900">{changeRequest.entityLabel}</h3>
              <div
                className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
              >
                <span className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                {statusConfig.label}
              </div>
              <div className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {sourceConfig.label}
              </div>
              <div className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                Ref: {changeRequest.reference}
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-2 text-xs text-gray-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:text-sm">
              <span className="truncate">
                <strong>Requested By:</strong> {changeRequest.requestedBy}
              </span>
              <span className="truncate">
                <strong>Entity Type:</strong> {getEntityTypeLabel(changeRequest.entityType)}
              </span>
              <span className="truncate">
                <strong>Requested:</strong> {formatDate(changeRequest.requestedAtUtc)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <div className="hidden text-right text-sm sm:block">
            <div className="font-medium text-gray-900">Status: {statusConfig.label}</div>
            <div className="mt-1 text-xs text-gray-500">{sourceConfig.label}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(changeRequest)}
              className="button-oulined flex items-center gap-2 text-xs sm:text-sm"
            >
              <VscEye className="size-4" />
              <span className="hidden sm:inline">View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalRecords: number
  pageSize: number
  onPageChange: (page: number) => void
  onRowsChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onRowsChange,
}) => (
  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-1.5 text-xs sm:text-sm">
      <p className="whitespace-nowrap">Show rows</p>
      <select
        value={pageSize}
        onChange={onRowsChange}
        className="rounded-md border border-gray-300 bg-[#F2F2F2] px-2 py-1.5 text-xs sm:text-sm"
      >
        <option value={6}>6</option>
        <option value={12}>12</option>
        <option value={18}>18</option>
        <option value={24}>24</option>
        <option value={50}>50</option>
      </select>
    </div>

    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <button
        className={`flex items-center justify-center rounded-md p-1.5 sm:p-2 ${
          currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000] hover:bg-gray-100"
        }`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <BiSolidLeftArrow className="size-4 sm:size-5" />
      </button>

      <div className="flex items-center gap-1 sm:gap-2">
        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
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
            <button
              key={pageNum}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs sm:h-[27px] sm:w-[30px] sm:text-sm ${
                currentPage === pageNum ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          )
        })}
      </div>

      <button
        className={`flex items-center justify-center rounded-md p-1.5 sm:p-2 ${
          currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000] hover:bg-gray-100"
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <BiSolidRightArrow className="size-4 sm:size-5" />
      </button>
    </div>

    <p className="text-center text-xs sm:text-left sm:text-sm">
      Page {currentPage} of {totalPages} <span className="hidden sm:inline">({totalRecords} total)</span>
    </p>
  </div>
)

export default PoleChangeRequest
