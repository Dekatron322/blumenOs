"use client"

import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { SearchModule } from "components/ui/Search/search-module"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { ChevronDown } from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"
import type { ChangeRequestListItem } from "lib/redux/distributionSubstationsSlice"
import { clearChangeRequests, fetchChangeRequests } from "lib/redux/distributionSubstationsSlice"
import ViewDistributionSubstationChangeRequestModal from "../ui/Modal/view-distribution-substation-change-request-modal"

// Types
type SortOrder = "asc" | "desc" | null
type ViewMode = "list" | "grid"

// Constants
const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "0", label: "Pending" },
  { value: "1", label: "Approved" },
  { value: "2", label: "Declined" },
  { value: "3", label: "Cancelled" },
  { value: "4", label: "Applied" },
  { value: "5", label: "Failed" },
]

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
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
    6: "Distribution Substation",
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
const DistributionSubstationChangeRequest = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { changeRequests, changeRequestsLoading, changeRequestsError, changeRequestsPagination } = useSelector(
    (state: RootState) => state.distributionSubstations
  )

  // State
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedSource, setSelectedSource] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isSourceOpen, setIsSourceOpen] = useState(false)
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Effects
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

    return () => {
      dispatch(clearChangeRequests())
    }
  }, [dispatch, currentPage, changeRequestsPagination.pageSize, selectedStatus, selectedSource, searchText])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-root="status-filter"]')) {
        setIsStatusOpen(false)
      }
      if (!target.closest('[data-dropdown-root="source-filter"]')) {
        setIsSourceOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handlers
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

  const handleCancelSearch = () => {
    setSearchText("")
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
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        {/* Main Content */}
        <div className="w-full rounded-md border bg-white p-5">
          {/* Header */}
          <div className="flex flex-col py-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-2xl font-medium">Distribution Substation Change Requests</p>
              <button
                className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] hover:border-[#2563EB] hover:bg-[#DBEAFE]"
                onClick={() => {
                  /* TODO: Implement CSV export */
                }}
                disabled={!changeRequests || changeRequests.length === 0}
              >
                <ExportCsvIcon color="#2563EB" size={20} />
                <p className="text-sm text-[#2563EB]">Export CSV</p>
              </button>
            </div>

            {/* Filters and Controls */}
            <div className="mt-2 flex gap-4">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by reference or requester"
                className="max-w-[300px]"
              />

              {/* View Mode Toggle */}
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
                options={STATUS_OPTIONS}
                onSelect={setSelectedStatus}
                dropdownId="status-filter"
                label="All Status"
              />

              {/* Source Filter */}
              <FilterDropdown
                isOpen={isSourceOpen}
                setIsOpen={setIsSourceOpen}
                selectedValue={selectedSource}
                options={SOURCE_OPTIONS}
                onSelect={setSelectedSource}
                dropdownId="source-filter"
                label="All Sources"
              />
            </div>
          </div>

          {/* Content */}
          <div className="w-full">
            {changeRequests.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No change requests found</p>
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
      </div>

      {/* Modal */}
      <ViewDistributionSubstationChangeRequestModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        changeRequestId={selectedChangeRequestId || ""}
      />
    </>
  )
}

// Sub-components

interface FilterDropdownProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedValue: string
  options: Array<{ value: string; label: string }>
  onSelect: (value: string) => void
  dropdownId: string
  label: string
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  isOpen,
  setIsOpen,
  selectedValue,
  options,
  onSelect,
  dropdownId,
  label,
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
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a] hover:bg-[#f9f9f9]"
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
                <strong>Entity Type:</strong> {getEntityTypeLabel(changeRequest.entityType)}
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
  <div className="mt-4 flex items-center justify-between">
    <div className="flex items-center gap-1">
      <p>Show rows</p>
      <select value={pageSize} onChange={onRowsChange} className="bg-[#F2F2F2] p-1">
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
        onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <button
        className={`px-3 py-2 ${currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <BiSolidRightArrow />
      </button>
    </div>

    <p>
      Page {currentPage} of {totalPages} ({totalRecords} total records)
    </p>
  </div>
)

export default DistributionSubstationChangeRequest
