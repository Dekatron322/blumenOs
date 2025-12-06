"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Power,
  PowerOff,
  Share2,
  Shield,
  User,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import SuspendAccountModal from "components/ui/Modal/suspend-account-modal"
import UpdateEmployeeModal from "components/ui/Modal/update-employee-modal"
import ActivateAccountModal from "components/ui/Modal/activate-account-modal"
import ResetPasswordModal from "components/ui/Modal/reset-password-modal"
import ChangeRequestModal from "components/ui/Modal/change-request-modal"
import DashboardNav from "components/Navbar/DashboardNav"
import {
  CalendarOutlineIcon,
  DepartmentInfoIcon,
  EmailOutlineIcon,
  EmployeeInfoIcon,
  ExportCsvIcon,
  ExportOutlineIcon,
  MapOutlineIcon,
  NotificationOutlineIcon,
  PasswordOutlineIcon,
  PhoneOutlineIcon,
  SettingOutlineIcon,
  UpdateUserOutlineIcon,
  UserRoleIcon,
  VerifyOutlineIcon,
} from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearChangeRequestsByEmployee,
  clearEmployeeDetails,
  fetchChangeRequestsByEmployeeId,
  fetchEmployeeDetails,
} from "lib/redux/employeeSlice"
import type {
  ChangeRequestListItem as ChangeRequestListItemType,
  ChangeRequestsRequestParams,
} from "lib/redux/employeeSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { SearchModule } from "components/ui/Search/search-module"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import ViewChangeRequestModal from "components/ui/Modal/view-change-request-model"

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
          <span>Entity Type:</span>
          <span className="font-medium">{changeRequest.entityType === 1 ? "Employee" : "Other"}</span>
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
                <strong>Entity Type:</strong> {changeRequest.entityType === 1 ? "Employee" : "Other"}
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

// Change Requests Section Component
const EmployeeChangeRequestsSection = ({ employeeId }: { employeeId: number }) => {
  const dispatch = useAppDispatch()
  const {
    changeRequestsByEmployee,
    changeRequestsByEmployeeLoading,
    changeRequestsByEmployeeError,
    changeRequestsByEmployeePagination,
  } = useAppSelector((state) => state.employee)

  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedSource, setSelectedSource] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isSourceOpen, setIsSourceOpen] = useState(false)
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch change requests for this employee
  useEffect(() => {
    const params: ChangeRequestsRequestParams = {
      pageNumber: currentPage,
      pageSize: changeRequestsByEmployeePagination.pageSize,
      ...(selectedStatus && { status: parseInt(selectedStatus) }),
      ...(selectedSource && { source: parseInt(selectedSource) }),
      ...(searchText && { reference: searchText }),
    }

    dispatch(fetchChangeRequestsByEmployeeId({ id: employeeId, params }))
  }, [
    dispatch,
    employeeId,
    currentPage,
    changeRequestsByEmployeePagination.pageSize,
    selectedStatus,
    selectedSource,
    searchText,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearChangeRequestsByEmployee())
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

    dispatch(fetchChangeRequestsByEmployeeId({ id: employeeId, params }))
    setCurrentPage(1)
  }

  const totalPages = changeRequestsByEmployeePagination.totalPages || 1
  const totalRecords = changeRequestsByEmployeePagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Loading skeleton
  if (changeRequestsByEmployeeLoading) {
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
              /* TODO: Implement CSV export for employee change requests */
            }}
            disabled={!changeRequestsByEmployee || changeRequestsByEmployee.length === 0}
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
        {changeRequestsByEmployeeError ? (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto mb-4 size-12 text-gray-400" />
            <p className="text-gray-500">Error loading change requests: {changeRequestsByEmployeeError}</p>
          </div>
        ) : changeRequestsByEmployee.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No change requests found for this employee</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {changeRequestsByEmployee.map((changeRequest: ChangeRequestListItemType) => (
              <ChangeRequestCard
                key={changeRequest.publicId}
                changeRequest={changeRequest}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {changeRequestsByEmployee.map((changeRequest: ChangeRequestListItemType) => (
              <ChangeRequestListItem
                key={changeRequest.publicId}
                changeRequest={changeRequest}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {changeRequestsByEmployee.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <p>Show rows</p>
              <select
                value={changeRequestsByEmployeePagination.pageSize}
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
      <ViewChangeRequestModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        changeRequestId={selectedChangeRequestId || ""}
      />
    </>
  )
}

const EmployeeDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const employeeId = params.id as string

  // Get employee details from Redux store
  const { employeeDetails, employeeDetailsLoading, employeeDetailsError, employeeDetailsSuccess } = useAppSelector(
    (state) => state.employee
  )
  // Get current user to check privileges
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [activeModal, setActiveModal] = useState<
    "suspend" | "activate" | "reminder" | "status" | "edit" | "resetPassword" | "changeRequest" | null
  >(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (employeeId) {
      const id = parseInt(employeeId)
      if (!isNaN(id)) {
        dispatch(fetchEmployeeDetails(id))
      }
    }

    // Cleanup function to clear employee details when component unmounts
    return () => {
      dispatch(clearEmployeeDetails())
    }
  }, [dispatch, employeeId])

  const getStatusConfig = (status: boolean) => {
    const configs = {
      true: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle,
        label: "ACTIVE",
      },
      false: {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: AlertCircle,
        label: "INACTIVE",
      },
    }
    return configs[status.toString() as keyof typeof configs] || configs.false
  }

  const getEmploymentTypeConfig = (type: string) => {
    const configs = {
      FULL_TIME: { color: "text-blue-600", bg: "bg-blue-50" },
      PART_TIME: { color: "text-purple-600", bg: "bg-purple-50" },
      CONTRACT: { color: "text-orange-600", bg: "bg-orange-50" },
    }
    return configs[type as keyof typeof configs] || configs.FULL_TIME
  }

  const closeAllModals = () => setActiveModal(null)
  const openModal = (
    modalType: "suspend" | "activate" | "reminder" | "status" | "edit" | "resetPassword" | "changeRequest"
  ) => setActiveModal(modalType)

  const handleConfirmSuspend = () => {
    console.log("Employee suspended")
    closeAllModals()
  }

  const handleConfirmReminder = (message: string) => {
    console.log("Reminder sent:", message)
    closeAllModals()
  }

  const handleUpdateSuccess = () => {
    // Refresh employee details after successful update
    if (employeeId) {
      const id = parseInt(employeeId)
      if (!isNaN(id)) {
        dispatch(fetchEmployeeDetails(id))
      }
    }
    closeAllModals()
  }

  const handleChangeRequestSuccess = () => {
    // Refresh employee details after successful change request
    if (employeeId) {
      const id = parseInt(employeeId)
      if (!isNaN(id)) {
        dispatch(fetchEmployeeDetails(id))
      }
    }
    closeAllModals()
  }

  const calculateTenure = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const years = now.getFullYear() - created.getFullYear()
    const months = now.getMonth() - created.getMonth()

    if (months < 0) {
      return `${years - 1} years ${12 + months} months`
    }
    return `${years} years ${months} months`
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    // Basic formatting for phone numbers
    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phoneNumber
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const exportToPDF = async () => {
    if (!employeeDetails) return

    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Add header with company branding
      doc.setFillColor(249, 249, 249)
      doc.rect(0, 0, pageWidth, 60, "F")

      // Company name
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("EMPLOYEE RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Employee Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Employee Profile Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("EMPLOYEE PROFILE", 14, yPosition)
      yPosition += 10

      // Profile table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Full Name", employeeDetails.fullName],
          ["Employee ID", employeeDetails.employeeId],
          ["Position", employeeDetails.position || "Not specified"],
          ["Department", employeeDetails.departmentName || "Not assigned"],
          ["Employment Type", employeeDetails.employmentType?.replace("_", " ") || "FULL TIME"],
          ["Status", employeeDetails.isActive ? "ACTIVE" : "INACTIVE"],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Contact Information Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("CONTACT INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Contact Method", "Details", "Status"]],
        body: [
          ["Email", employeeDetails.email, employeeDetails.isEmailVerified ? "✓ Verified" : "Not verified"],
          [
            "Phone",
            formatPhoneNumber(employeeDetails.phoneNumber),
            employeeDetails.isPhoneVerified ? "✓ Verified" : "Not verified",
          ],
          ["Address", employeeDetails.address || "Not provided", ""],
          ["Emergency Contact", employeeDetails.emergencyContact || "Not provided", ""],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Department & System Information
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("DEPARTMENT & SYSTEM INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Category", "Details"]],
        body: [
          ["Area Office", employeeDetails.areaOfficeName || "Not specified"],
          ["Supervisor", employeeDetails.supervisorName || "Not assigned"],
          ["Account ID", employeeDetails.accountId],
          ["Account Created", formatDate(employeeDetails.createdAt)],
          ["Account Updated", formatDate(employeeDetails.updatedAt)],
          ["Last Login", formatDate(employeeDetails.lastLoginAt)],
          ["Password Reset Required", employeeDetails.mustChangePassword ? "Yes" : "No"],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Roles & Privileges Section
      if (employeeDetails.roles && employeeDetails.roles.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("ROLES & PERMISSIONS", 14, yPosition)
        yPosition += 10

        const rolesBody = employeeDetails.roles.map((role) => [
          role.name,
          role.category,
          role.description || "No description",
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [["Role Name", "Category", "Description"]],
          body: rolesBody,
          theme: "grid",
          headStyles: { fillColor: [245, 158, 11], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }

      // Privileges Section
      if (employeeDetails.privileges && employeeDetails.privileges.length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("SYSTEM PRIVILEGES", 14, yPosition)
        yPosition += 10

        const privilegesBody = employeeDetails.privileges.map((privilege) => [
          privilege.name,
          privilege.category,
          privilege.actions
            ? privilege.actions
                .map((action) => ({ E: "Execute", R: "Read", U: "Update", W: "Write" })[action] || action)
                .join(", ")
            : "None",
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [["Privilege", "Category", "Actions"]],
          body: privilegesBody,
          theme: "grid",
          headStyles: { fillColor: [239, 68, 68], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 },
        })
      }

      // Add page numbers
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10)
      }

      // Save the PDF
      doc.save(`employee-record-${employeeDetails.employeeId}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (employeeDetailsLoading) {
    return <LoadingSkeleton />
  }

  if (employeeDetailsError || !employeeDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {employeeDetailsError ? "Error Loading Employee" : "Employee Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">
            {employeeDetailsError || "The employee you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Employees
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(employeeDetails.isActive)
  const employmentTypeConfig = getEmploymentTypeConfig(employeeDetails.employmentType)
  const StatusIcon = statusConfig.icon
  const tenure = calculateTenure(employeeDetails.createdAt || new Date().toISOString())

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
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </motion.button>

                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
                      <p className="text-gray-600">Complete overview and management</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={exportToPDF}
                      disabled={isExporting}
                    >
                      <ExportOutlineIcon className="size-4" />
                      {isExporting ? "Exporting..." : "Export"}
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
                {/* Left Column - Profile & Quick Actions */}
                <div className="flex w-[30%] flex-col space-y-6 xl:col-span-1">
                  {/* Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-[#f9f9f9] text-3xl font-bold text-[#004B23]">
                          {employeeDetails.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div
                          className={`absolute -right-1 bottom-1 ${statusConfig.bg} ${statusConfig.border} rounded-full border-2 p-1.5`}
                        >
                          <StatusIcon className={`size-4 ${statusConfig.color}`} />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{employeeDetails.fullName}</h2>
                      <p className="mb-4 text-gray-600">Employee #{employeeDetails.employeeId}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${employmentTypeConfig.bg} ${employmentTypeConfig.color}`}
                        >
                          {employeeDetails.employmentType?.replace("_", " ") ?? "FULL TIME"}
                        </div>
                        {employeeDetails.mustChangePassword && (
                          <div className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-600">
                            Password Reset
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <PhoneOutlineIcon />
                          {formatPhoneNumber(employeeDetails.phoneNumber)}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <EmailOutlineIcon />
                          {employeeDetails.email}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapOutlineIcon className="size-4" />
                          {employeeDetails.areaOfficeName || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  {canUpdate && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                        <SettingOutlineIcon />
                        Quick Actions
                      </h3>
                      <div className="space-y-3">
                        <ButtonModule
                          variant="secondary"
                          className="w-full justify-start gap-3"
                          onClick={() => openModal("reminder")}
                        >
                          <NotificationOutlineIcon />
                          Send Reminder
                        </ButtonModule>
                        <ButtonModule
                          variant="primary"
                          className="w-full justify-start gap-3"
                          onClick={() => openModal("resetPassword")}
                        >
                          <PasswordOutlineIcon size={20} />
                          Reset Password
                        </ButtonModule>
                        <ButtonModule
                          variant={employeeDetails.isActive ? "danger" : "primary"}
                          className="w-full justify-start gap-3"
                          onClick={() => openModal(employeeDetails.isActive ? "suspend" : "activate")}
                        >
                          {employeeDetails.isActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                          {employeeDetails.isActive ? "Deactivate Account" : "Activate Account"}
                        </ButtonModule>
                      </div>
                    </motion.div>
                  )}

                  {/* Roles & Privileges */}
                  {employeeDetails.roles && employeeDetails.roles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                        <UserRoleIcon />
                        Roles & Permissions
                      </h3>
                      <div className="space-y-3">
                        {employeeDetails.roles.map((role, index) => (
                          <div key={role.roleId} className="rounded-lg bg-[#f9f9f9] p-3">
                            <div className="font-medium text-gray-900">{role.name}</div>
                            <div className="text-sm text-gray-600">{role.category}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:col-span-2">
                  {/* Employment Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <EmployeeInfoIcon />
                      Employment Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Employee ID</label>
                          <p className="font-semibold text-gray-900">{employeeDetails.employeeId}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Position</label>
                          <p className="font-semibold text-gray-900">{employeeDetails.position || "Not specified"}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Account ID</label>
                          <p className="font-semibold text-gray-900">{employeeDetails.accountId}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Department</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.departmentName || "Not assigned"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Employment Type</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.employmentType?.replace("_", " ") ?? "FULL TIME"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Area Office</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.areaOfficeName || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Supervisor</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.supervisorName || "Not assigned"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <p className="font-semibold text-gray-900">
                            <span className={`inline-flex items-center gap-1 ${statusConfig.color}`}>
                              <StatusIcon className="size-4" />
                              {statusConfig.label}
                            </span>
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Password Reset</label>
                          <p className="font-semibold text-gray-900">
                            {employeeDetails.mustChangePassword ? "Required" : "Not required"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact & Personal Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <User className="size-5" />
                      Contact & Personal Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Phone className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone Number</label>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">
                                {formatPhoneNumber(employeeDetails.phoneNumber)}
                              </p>
                              <div className="text-[#f9f9f9]0 text-xs">
                                {employeeDetails.isPhoneVerified ? (
                                  <span className="text-emerald-600">✓ Verified</span>
                                ) : (
                                  <span className="text-amber-600">Not verified</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <Mail className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email Address</label>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{employeeDetails.email}</p>
                              <div className="text-[#f9f9f9]0 text-xs">
                                {employeeDetails.isEmailVerified ? (
                                  <span className="text-emerald-600">✓ Verified</span>
                                ) : (
                                  <span className="text-amber-600">Not verified</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <MapPin className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Address</label>
                            <p className="font-semibold text-gray-900">{employeeDetails.address || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                            <Shield className="size-5 text-red-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                            <p className="font-semibold text-gray-900">
                              {employeeDetails.emergencyContact || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Department Information */}
                  {employeeDetails.departmentName && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <DepartmentInfoIcon />
                        Department Information
                      </h3>
                      <div className="grid grid-cols-1 gap-4  md:grid-cols-3">
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Department</label>
                            <p className="font-semibold text-gray-900">{employeeDetails.departmentName}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Area Office</label>
                            <p className="font-semibold text-gray-900">
                              {employeeDetails.areaOfficeName || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <label className="text-sm font-medium text-gray-600">Supervisor</label>
                            <p className="font-semibold text-gray-900">
                              {employeeDetails.supervisorName || "Not assigned"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* System Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <CalendarOutlineIcon />
                      System Information
                    </h3>
                    <div className=" grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Account Created</label>
                          <p className="font-semibold text-gray-900">{formatDate(employeeDetails.createdAt)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Account Updated</label>
                          <p className="font-semibold text-gray-900">{formatDate(employeeDetails.updatedAt)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                          <label className="text-sm font-medium text-gray-600">Last Login</label>
                          <p className="font-semibold text-gray-900">{formatDate(employeeDetails.lastLoginAt)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Privileges Information */}
                  {employeeDetails.privileges && employeeDetails.privileges.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <VerifyOutlineIcon />
                        System Privileges
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {employeeDetails.privileges.map((privilege, index) => (
                          <div key={index} className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                            <div className="font-medium text-gray-900">{privilege.name}</div>
                            <div className="text-sm text-gray-600">{privilege.category}</div>
                            {privilege.actions && privilege.actions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {privilege.actions.map((action, actionIndex) => (
                                  <span
                                    key={actionIndex}
                                    className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                                  >
                                    {({ E: "Execute", R: "Read", U: "Update", W: "Write" } as Record<string, string>)[
                                      action
                                    ] || action}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Change Requests Section */}
                  <EmployeeChangeRequestsSection employeeId={employeeDetails.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SuspendAccountModal
        isOpen={activeModal === "suspend"}
        onRequestClose={closeAllModals}
        onSuccess={handleUpdateSuccess}
        employeeId={employeeDetails.id}
        employeeName={employeeDetails.fullName}
      />

      <ActivateAccountModal
        isOpen={activeModal === "activate"}
        onRequestClose={closeAllModals}
        onSuccess={handleUpdateSuccess}
        employeeId={employeeDetails.id}
        employeeName={employeeDetails.fullName}
      />

      <SendReminderModal
        isOpen={activeModal === "reminder"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmReminder}
      />

      <ResetPasswordModal
        isOpen={activeModal === "resetPassword"}
        onRequestClose={closeAllModals}
        employeeId={employeeDetails.id}
        employeeName={employeeDetails.fullName}
        onSuccess={handleUpdateSuccess}
      />

      <UpdateEmployeeModal
        isOpen={activeModal === "edit"}
        onRequestClose={closeAllModals}
        onSuccess={handleUpdateSuccess}
        employee={employeeDetails}
      />

      <ChangeRequestModal
        isOpen={activeModal === "changeRequest"}
        onRequestClose={closeAllModals}
        onSuccess={handleChangeRequestSuccess}
        employeeId={employeeDetails.id}
        employeeName={employeeDetails.fullName}
      />
    </section>
  )
}

// LoadingSkeleton component remains the same...
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-gray-100">
    <DashboardNav />
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-9 rounded-md bg-gray-200"></div>
          <div>
            <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Column Skeleton */}
        <div className="w-[30%] space-y-6">
          {/* Profile Card Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto size-20 rounded-full bg-gray-200"></div>
                <div className="absolute -right-1 bottom-1 size-6 rounded-full bg-gray-200"></div>
              </div>
              <div className="mx-auto mb-2 h-6 w-32 rounded bg-gray-200"></div>
              <div className="mx-auto mb-4 h-4 w-24 rounded bg-gray-200"></div>
              <div className="mb-6 flex justify-center gap-2">
                <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                <div className="h-6 w-20 rounded-full bg-gray-200"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-10 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Roles Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-16 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 h-6 w-48 rounded bg-gray-200"></div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default EmployeeDetailsPage
