"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, FileText, Info, Search, Upload, X } from "lucide-react"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { RxCaretSort } from "react-icons/rx"
import { AppDispatch, RootState } from "lib/redux/store"
import {
  CashRemittanceRecord,
  CashRemittanceStatus,
  fetchCashRemittanceRecords,
  setPagination,
} from "lib/redux/cashRemittanceSlice"
import { ButtonModule } from "components/ui/Button/Button"
import CashRemittanceModal from "components/ui/Modal/cash-remittance-modal"
import ReceiptUploadModal from "components/ui/Modal/receipt-upload-modal"
import { HiChevronDown } from "react-icons/hi"

// ==================== Status Badge Component ====================
const StatusBadge = ({ status }: { status: CashRemittanceStatus }) => {
  const getStatusStyles = () => {
    switch (status) {
      case CashRemittanceStatus.Verified:
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case CashRemittanceStatus.Pending:
        return "bg-amber-50 text-amber-700 border-amber-200"
      case CashRemittanceStatus.Deposited:
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getDotColor = () => {
    switch (status) {
      case CashRemittanceStatus.Verified:
        return "bg-emerald-500"
      case CashRemittanceStatus.Pending:
        return "bg-amber-500"
      case CashRemittanceStatus.Deposited:
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusStyles()}`}
    >
      <span className={`size-1.5 rounded-full ${getDotColor()}`} />
      {status}
    </span>
  )
}

// ==================== Bank Badge Component ====================
const BankBadge = ({ bankName }: { bankName: string }) => {
  const getBankStyles = () => {
    switch (bankName.toLowerCase()) {
      case "access bank":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "zenith bank":
        return "bg-red-50 text-red-700 border-red-200"
      case "gtbank":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "first bank":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "uba":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getBankStyles()}`}>
      {bankName}
    </span>
  )
}

// ==================== Loading Skeleton ====================
const LoadingSkeleton = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-6 w-40 rounded-lg bg-gray-200"></div>
            <div className="mt-1 h-4 w-56 rounded-lg bg-gray-200"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-lg bg-gray-200"></div>
            <div className="h-9 w-28 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {[...Array(8)].map((_, i) => (
                <th key={i} className="px-3 py-2.5">
                  <div className="h-3.5 w-16 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {[...Array(8)].map((_, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2.5">
                    <div className="h-3.5 w-full rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-40 rounded bg-gray-200"></div>
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded-lg bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const CashRemittance = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchText, setSearchText] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<CashRemittanceRecord | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showMobileActions, setShowMobileActions] = useState(false)

  // Date range filter state
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [showDateFilter, setShowDateFilter] = useState(false)

  // Modal state
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedRecordForReceipt, setSelectedRecordForReceipt] = useState<CashRemittanceRecord | null>(null)

  // Get cash remittance data from Redux store
  const { records, recordsLoading, recordsError, recordsSuccess, pagination } = useSelector(
    (state: RootState) => state.cashRemittance
  )
  const { agent } = useSelector((state: RootState) => state.auth)

  const handleCancelSearch = () => {
    setSearchText("")
  }

  // Fetch cash remittance records with date range
  const fetchRecords = async (start?: string, end?: string, pageNumber?: number, pageSize?: number) => {
    try {
      const startUtc = start || startDate || getMonthStart().toISOString()
      const endUtc = end || endDate || getMonthEnd().toISOString()

      await dispatch(
        fetchCashRemittanceRecords({
          startUtc: startUtc,
          endUtc: endUtc,
          pageNumber: pageNumber || pagination.currentPage,
          pageSize: pageSize || pagination.pageSize,
        })
      ).unwrap()
    } catch (error) {
      console.error("Failed to fetch cash remittance records:", error)
    }
  }

  // Helper function to get start of current month
  const getMonthStart = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }

  // Helper function to get end of current month
  const getMonthEnd = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  }

  // Fetch cash remittance records on component mount and when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchRecords(startDate, endDate)
    } else {
      // Default to current month if no dates are set
      fetchRecords()
    }
  }, [startDate, endDate, dispatch])

  // Initialize with current month date range
  useEffect(() => {
    const monthStart = getMonthStart().toISOString()
    const monthEnd = getMonthEnd().toISOString()
    setStartDate(monthStart)
    setEndDate(monthEnd)
  }, [])

  // Handle date range change
  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  // Clear date filters - reset to current month
  const clearDateFilters = () => {
    const monthStart = getMonthStart().toISOString()
    const monthEnd = getMonthEnd().toISOString()
    setStartDate(monthStart)
    setEndDate(monthEnd)
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format date for input field
  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0]
  }

  // Pagination handlers
  const changePage = (page: number) => {
    if (page > 0 && page <= pagination.totalPages) {
      dispatch(setPagination({ page, pageSize: pagination.pageSize }))
      fetchRecords(startDate, endDate, page, pagination.pageSize)
    }
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(setPagination({ page: 1, pageSize: newPageSize }))
    fetchRecords(startDate, endDate, 1, newPageSize)
  }

  const getPageItems = (): (number | string)[] => {
    const total = pagination.totalPages
    const items: (number | string)[] = []

    if (total <= 5) {
      // If total pages is 5 or less, show all pages
      for (let i = 1; i <= total; i++) {
        items.push(i)
      }
    } else {
      // Always show first 3 pages, ellipsis, and last 2 pages
      for (let i = 1; i <= 3; i++) {
        items.push(i)
      }
      items.push("...")
      for (let i = total - 1; i <= total; i++) {
        items.push(i)
      }
    }

    return items
  }

  // Date Filter Component
  const DateFilter = () => (
    <div className="relative">
      <button
        onClick={() => setShowDateFilter(!showDateFilter)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="hidden md:inline">
          {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
        </span>
        <span className="md:hidden">Date Range</span>
        <svg
          className={`size-4 transition-transform ${showDateFilter ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDateFilter && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDateFilter(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Date Range</h3>
                <button
                  onClick={() => setShowDateFilter(false)}
                  className="rounded-full p-1 hover:bg-gray-100"
                  aria-label="Close date filter"
                >
                  <svg className="size-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(startDate)}
                    onChange={(e) => {
                      const newStartDate = new Date(e.target.value).toISOString()
                      handleDateRangeChange(newStartDate, endDate)
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(endDate)}
                    onChange={(e) => {
                      const newEndDate = new Date(e.target.value).toISOString()
                      handleDateRangeChange(startDate, newEndDate)
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={clearDateFilters}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDateFilter(false)}
                    className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )

  // Filter records based on search text
  const filteredRecords = records.filter(
    (record) =>
      record.collectionOfficer.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.bankName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.tellerNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      record.notes.toLowerCase().includes(searchText.toLowerCase())
  )

  const getStatusColor = (status: number) => {
    switch (status) {
      case CashRemittanceStatus.Pending:
        return "bg-yellow-100 text-yellow-800"
      case CashRemittanceStatus.Deposited:
        return "bg-blue-100 text-blue-800"
      case CashRemittanceStatus.Verified:
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case CashRemittanceStatus.Pending:
        return "pending"
      case CashRemittanceStatus.Deposited:
        return "deposited"
      case CashRemittanceStatus.Verified:
        return "verified"
      default:
        return "unknown"
    }
  }

  const getBankColor = (bankName: string) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
    ]
    const index = bankName.charCodeAt(0) % colors.length
    return colors[index]
  }

  const handleRecordAction = (record: CashRemittanceRecord, action: string) => {
    console.log(`Action: ${action} for record:`, record.id)
    setIsDropdownOpen(false)
    setSelectedRecord(null)

    switch (action) {
      case "view":
        break
      case "update":
        break
      case "approve":
        break
      case "reject":
        break
      default:
        break
    }
  }

  const ActionDropdown = ({ record }: { record: CashRemittanceRecord }) => {
    return (
      <div className="relative">
        <button
          onClick={() => {
            setSelectedRecord(record)
            setIsDropdownOpen(!isDropdownOpen)
          }}
          className="rounded-lg bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 md:px-3 md:py-1 md:text-sm"
          aria-label="Open actions menu"
        >
          <span className="hidden md:inline">Actions</span>
          <span className="md:hidden">...</span>
        </button>

        {isDropdownOpen && selectedRecord?.id === record.id && (
          <>
            <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsDropdownOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-lg border border-gray-200 bg-white shadow-lg md:absolute md:right-0 md:top-full md:mt-1 md:w-48 md:rounded-md md:rounded-t-none"
            >
              <div className="p-2 md:p-0 md:py-1">
                <div className="mb-2 flex items-center justify-between border-b pb-2 md:hidden">
                  <h3 className="text-sm font-medium text-gray-900">Record Actions</h3>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="rounded-full p-1 hover:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <HiChevronDown className="size-4 text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={() => handleRecordAction(record, "view")}
                  className="block w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 md:px-4 md:py-2"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleRecordAction(record, "update")}
                  className="block w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 md:px-4 md:py-2"
                >
                  Update Status
                </button>
                <button
                  onClick={() => handleRecordAction(record, "approve")}
                  className="block w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 md:px-4 md:py-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRecordAction(record, "reject")}
                  className="block w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 md:px-4 md:py-2"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    )
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".action-dropdown")) {
        setIsDropdownOpen(false)
        setSelectedRecord(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Auto-hide sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowSidebar(false)
      } else {
        setShowSidebar(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const RecordCard = ({ record, index }: { record: CashRemittanceRecord; index: number }) => (
    <motion.div
      key={record.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="group rounded-lg border border-gray-100 bg-white p-3 transition-all hover:border-gray-200 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Main info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Amount */}
          <div className="shrink-0">
            <p className="text-sm font-bold text-gray-900 md:text-base">₦{record.amount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{new Date(record.depositedAtUtc).toLocaleDateString()}</p>
          </div>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          {/* Officer & Bank */}
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate text-sm font-medium text-gray-900">{record.collectionOfficer.fullName}</p>
            <div className="flex items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${getBankColor(record.bankName)}`}>
                {record.bankName}
              </span>
              <span className="truncate text-xs text-gray-500">#{record.tellerNumber}</span>
            </div>
          </div>

          {/* Date Range - hidden on small screens */}
          <div className="hidden min-w-0 lg:block">
            <p className="text-xs text-gray-500">Period</p>
            <p className="text-xs font-medium text-gray-700">
              {new Date(record.startDateUtc).toLocaleDateString()} - {new Date(record.endDateUtc).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(record.status)}`}>
            {getStatusText(record.status)}
          </span>
          {record.tellerUrl ? (
            <a
              href={record.tellerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded border border-gray-200 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 sm:inline-block"
            >
              Receipt
            </a>
          ) : (
            <ButtonModule
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={() => {
                setSelectedRecordForReceipt(record)
                setShowReceiptModal(true)
              }}
            >
              Attach
            </ButtonModule>
          )}
        </div>
      </div>

      {/* Mobile: Additional info row */}
      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 sm:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-gray-900">{record.collectionOfficer.fullName}</p>
          <div className="flex items-center gap-1.5">
            <span className={`rounded px-1 py-0.5 text-xs font-medium ${getBankColor(record.bankName)}`}>
              {record.bankName}
            </span>
            <span className="text-xs text-gray-500">#{record.tellerNumber}</span>
          </div>
        </div>
        {record.tellerUrl ? (
          <a
            href={record.tellerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-blue-600"
          >
            Receipt
          </a>
        ) : (
          <button
            onClick={() => {
              setSelectedRecordForReceipt(record)
              setShowReceiptModal(true)
            }}
            className="text-xs font-medium text-gray-600"
          >
            Attach
          </button>
        )}
      </div>
    </motion.div>
  )

  const StatCard = ({
    title,
    items,
  }: {
    title: string
    items: Array<{ label: string; value: string; color: string; count: number }>
  }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-3 md:p-4 lg:p-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 md:text-base lg:text-lg">{title}</h3>
      <div className="space-y-2 md:space-y-3 lg:space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${item.color} md:size-3`}></div>
              <span className="text-xs text-gray-700 md:text-sm">{item.label}</span>
            </div>
            <span className={`text-xs font-semibold md:text-sm ${item.color.replace("bg-", "text-")}`}>
              {item.count} {item.count === 1 ? "record" : "records"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  // const QuickActionsCard = () => (
  //   <div className="rounded-lg border border-gray-200 bg-white p-3 md:p-4 lg:p-6">
  //     <h3 className="mb-3 text-sm font-semibold text-gray-900 md:text-base lg:text-lg">Quick Actions</h3>
  //     <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-2 md:gap-3">
  //       <button className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 sm:py-2.5 md:px-4 md:py-2 md:text-sm">
  //         New Remittance
  //       </button>
  //       <button className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:py-2.5 md:px-4 md:py-2 md:text-sm">
  //         Export Reports
  //       </button>
  //       <button className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:col-span-1 sm:py-2.5 md:px-4 md:py-2 md:text-sm">
  //         View Analytics
  //       </button>
  //     </div>
  //   </div>
  // )

  // const MobileQuickActions = () => (
  //   <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white shadow-lg ring-1 ring-gray-200 md:hidden">
  //     <div className="flex items-center gap-1 p-1">
  //       <button
  //         onClick={() => setShowMobileActions(!showMobileActions)}
  //         className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
  //         aria-label="Quick actions"
  //       >
  //         <span>Actions</span>
  //         {showMobileActions ? <HiChevronUp className="size-4" /> : <HiChevronDown className="size-4" />}
  //       </button>
  //     </div>

  //     {showMobileActions && (
  //       <motion.div
  //         initial={{ opacity: 0, y: 10 }}
  //         animate={{ opacity: 1, y: 0 }}
  //         className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
  //       >
  //         <button className="mb-1 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
  //           New Remittance
  //         </button>
  //         <button className="mb-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
  //           Export Reports
  //         </button>
  //         <button className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
  //           View Analytics
  //         </button>
  //       </motion.div>
  //     )}
  //   </div>
  // )

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format date range for display
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    const end = new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    return `${start} - ${end}`
  }

  if (recordsLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Cash Remittance Records</h2>
            <p className="mt-1 text-xs text-gray-600">View and manage cash mop up records</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search records..."
                className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-8 pr-8 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchText && (
                <button
                  onClick={handleCancelSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Date Filter */}
            <DateFilter />

            {/* New Record Button */}
            {agent && agent.agentType === "ClearingCashier" && (
              <button
                onClick={() => setShowRecordModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#004B23] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#003618]"
              >
                <Upload className="size-3.5" />
                <span className="hidden sm:inline">Record Cash Mop Up</span>
                <span className="sm:hidden">New Record</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {recordsError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2">
                <AlertCircle className="size-4 text-red-600" />
                <p className="text-xs text-red-700">{recordsError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content with Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {records.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center px-4">
            <div className="rounded-full bg-gray-100 p-3">
              <Info className="size-6 text-gray-400" />
            </div>
            <p className="mt-3 text-base font-medium text-gray-900">No records found</p>
            <p className="mt-1 text-xs text-gray-600">
              {searchText || (startDate && endDate)
                ? "Try adjusting your search or filters"
                : "Cash remittance records will appear here once recorded"}
            </p>
            {(searchText || (startDate && endDate)) && (
              <button
                onClick={() => {
                  setSearchText("")
                  clearDateFilters()
                }}
                className="mt-3 rounded-lg bg-[#004B23] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#003618]"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="p-2 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Amount</span>
                    </th>
                    <th className="p-2 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                        Collection Officer
                      </span>
                    </th>
                    <th className="p-2 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Bank</span>
                    </th>
                    <th className="p-2 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                        Teller Number
                      </span>
                    </th>
                    <th className="p-2 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Period</span>
                    </th>
                    <th className="p-2 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                        Deposited Date
                      </span>
                    </th>
                    <th className="p-2 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Status</span>
                    </th>
                    <th className="p-2 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredRecords.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.01 }}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                      >
                        <td className="whitespace-nowrap p-2 text-xs font-semibold text-gray-900">
                          {formatCurrency(record.amount)}
                        </td>
                        <td className="whitespace-nowrap p-2 text-xs">
                          <div className="font-medium text-gray-900">{record.collectionOfficer.fullName}</div>
                        </td>
                        <td className="whitespace-nowrap p-2">
                          <BankBadge bankName={record.bankName} />
                        </td>
                        <td className="whitespace-nowrap p-2 text-xs text-gray-700">#{record.tellerNumber}</td>
                        <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                          {formatDateRange(record.startDateUtc, record.endDateUtc)}
                        </td>
                        <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                          {formatDate(record.depositedAtUtc)}
                        </td>
                        <td className="whitespace-nowrap p-2">
                          <StatusBadge status={record.status} />
                        </td>
                        <td className="whitespace-nowrap p-2">
                          <div className="flex items-center gap-1">
                            {record.tellerUrl ? (
                              <a
                                href={record.tellerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                <FileText className="size-3" />
                                <span className="hidden sm:inline">Receipt</span>
                              </a>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedRecordForReceipt(record)
                                  setShowReceiptModal(true)
                                }}
                                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                <Upload className="size-3" />
                                <span className="hidden sm:inline">Attach</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-600">Show rows</p>
                <select
                  value={pagination.pageSize}
                  onChange={handleRowsChange}
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <p className="text-xs text-gray-600">
                  {(pagination.currentPage - 1) * pagination.pageSize + 1}-
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{" "}
                  {pagination.totalCount}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="flex size-6 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <BiSolidLeftArrow className="size-3" />
                </button>

                {getPageItems().map((item, index) => {
                  if (typeof item === "number") {
                    return (
                      <button
                        key={index}
                        onClick={() => changePage(item)}
                        className={`flex size-6 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                          item === pagination.currentPage
                            ? "bg-[#004B23] text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  } else {
                    return (
                      <span key={index} className="flex items-center px-1 text-xs text-gray-500">
                        {item}
                      </span>
                    )
                  }
                })}

                <button
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="flex size-6 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <BiSolidRightArrow className="size-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cash Remittance Modal */}
      <CashRemittanceModal isOpen={showRecordModal} onRequestClose={() => setShowRecordModal(false)} />

      {/* Receipt Upload Modal */}
      <ReceiptUploadModal
        isOpen={showReceiptModal}
        onRequestClose={() => {
          setShowReceiptModal(false)
          setSelectedRecordForReceipt(null)
        }}
        record={selectedRecordForReceipt}
      />
    </div>
  )
}

export default CashRemittance
