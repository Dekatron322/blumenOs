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

import {
  fetchChangeRequestsByCustomerId,
  type ChangeRequestListItem,
  ChangeRequestsRequestParams,
  clearChangeRequestsByCustomer,
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
          <span className="font-medium">Customer</span>
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
            <div className="mt-1 text-xs text-gray-500">{sourceConfig.label}</div>
          </div>
          <div className="flex items-center gap-2">
            {canUpdate && (
              <button onClick={() => onViewDetails(changeRequest)} className="button-oulined flex items-center gap-2">
                <VscEye className="size-4" />
                View
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedSource, setSelectedSource] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isSourceOpen, setIsSourceOpen] = useState(false)
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // Loading skeleton
  if (changeRequestsByCustomerLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <UpdateUserOutlineIcon />
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
            <UpdateUserOutlineIcon />
            Change Requests
          </h3>
          <button
            className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] hover:border-[#2563EB] hover:bg-[#DBEAFE]"
            onClick={() => {
              /* TODO: Implement CSV export for customer change requests */
            }}
            disabled={!changeRequestsByCustomer || changeRequestsByCustomer.length === 0}
          >
            <ExportCsvIcon color="#2563EB" size={20} />
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
        </div>

        {/* Change Requests Display */}
        {changeRequestsByCustomerError ? (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto mb-4 size-12 text-gray-400" />
            <p className="text-gray-500">Error loading change requests: {changeRequestsByCustomerError}</p>
          </div>
        ) : changeRequestsByCustomer.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No change requests found for this customer</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <p>Show rows</p>
              <select
                value={changeRequestsByCustomerPagination.pageSize}
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
