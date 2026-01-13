"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"

import { HiChevronDown, HiChevronUp } from "react-icons/hi"
import { AppDispatch, RootState } from "lib/redux/store"
import { CashRemittanceRecord, CashRemittanceStatus, fetchCashRemittanceRecords } from "lib/redux/cashRemittanceSlice"
import { ButtonModule } from "components/ui/Button/Button"
import CashRemittanceModal from "components/ui/Modal/cash-remittance-modal"
import ReceiptUploadModal from "components/ui/Modal/receipt-upload-modal"

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
  const { records, recordsLoading, recordsError, recordsSuccess } = useSelector(
    (state: RootState) => state.cashRemittance
  )

  const handleCancelSearch = () => {
    setSearchText("")
  }

  // Fetch cash remittance records with date range
  const fetchRecords = async (start?: string, end?: string) => {
    try {
      const startUtc = start || startDate || getMonthStart().toISOString()
      const endUtc = end || endDate || getMonthEnd().toISOString()

      await dispatch(
        fetchCashRemittanceRecords({
          startUtc: startUtc,
          endUtc: endUtc,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 transition-all hover:shadow-sm md:p-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
            <h4 className="text-sm font-semibold text-gray-900 md:text-base">{record.collectionOfficer.fullName}</h4>
            <span className="text-xs text-gray-500 md:text-sm">{record.collectionOfficer.email}</span>
          </div>

          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-lg font-bold text-gray-900 md:text-xl">₦{record.amount.toLocaleString()}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(record.status)}`}>
                {getStatusText(record.status)}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getBankColor(record.bankName)}`}>
                {record.bankName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2 md:gap-3 lg:grid-cols-3">
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-500 md:text-sm">Teller Number:</p>
              <p className="truncate text-xs font-medium text-gray-900 md:text-sm">{record.tellerNumber}</p>
            </div>

            <div className="flex items-center gap-1">
              <p className=" text-xs text-gray-500 md:text-sm">Department:</p>
              <p className="text-xs font-medium text-gray-900 md:text-sm">{record.collectionOfficer.departmentName}</p>
            </div>

            <div className="flex items-center gap-1">
              <p className=" text-xs text-gray-500 md:text-sm">Area Office:</p>
              <p className="text-xs font-medium text-gray-900 md:text-sm">{record.collectionOfficer.areaOfficeName}</p>
            </div>

            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-500 md:text-sm">Start Date:</p>
              <p className="text-xs font-medium text-gray-900 md:text-sm">
                {new Date(record.startDateUtc).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-500 md:text-sm">End Date:</p>
              <p className="text-xs font-medium text-gray-900 md:text-sm">
                {new Date(record.endDateUtc).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-1 ">
              <p className=" text-xs text-gray-500 md:text-sm">Deposited At:</p>
              <p className="text-xs font-medium text-gray-900 md:text-sm">
                {new Date(record.depositedAtUtc).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1">
            <p className="text-xs text-gray-500 md:text-sm">Notes:</p>
            <p className="text-xs text-gray-700 md:text-sm">{record.notes || "No notes provided"}</p>
          </div>

          {record.tellerUrl && (
            <div className="mt-2">
              <p className="mb-1 text-xs text-gray-500 md:text-sm">Teller Receipt:</p>
              <a
                href={record.tellerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 md:text-sm"
              >
                View Receipt
              </a>
            </div>
          )}
        </div>

        <div className="action-dropdown flex justify-end md:block">
          <ButtonModule
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedRecordForReceipt(record)
              setShowReceiptModal(true)
            }}
          >
            Attach Receipt
          </ButtonModule>
        </div>
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

  // Calculate statistics
  const statusCounts = filteredRecords.reduce(
    (acc, record) => {
      const status = getStatusText(record.status)
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 lg:flex-row lg:gap-6"
    >
      {/* Left Column - Records List */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-3 md:p-4 lg:p-6">
          <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between md:block">
              <h3 className="text-base font-semibold md:text-lg">Cash Mop Up Records</h3>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs hover:bg-gray-50 md:hidden"
                aria-label="Toggle sidebar"
              >
                <span>Stats</span>
                {showSidebar ? <HiChevronUp className="size-3" /> : <HiChevronDown className="size-3" />}
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 md:max-w-lg">
              <DateFilter />
              <ButtonModule variant="primary" size="md" onClick={() => setShowRecordModal(true)}>
                Record Cash Mopup
              </ButtonModule>
            </div>
          </div>

          {/* Loading State */}
          {recordsLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading cash mop up records...</div>
            </div>
          )}

          {/* Error State */}
          {recordsError && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-600">Error: {recordsError}</p>
            </div>
          )}

          {/* Records List */}
          {!recordsLoading && !recordsError && (
            <div className="space-y-3 md:space-y-4">
              {filteredRecords.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500">No cash mop up records found</p>
                </div>
              ) : (
                filteredRecords.map((record, index) => <RecordCard key={record.id} record={record} index={index} />)
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Quick Actions Button */}
      {/* <MobileQuickActions /> */}

      {/* Mobile Toggle Sidebar Button */}
      {/* <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <span>{showSidebar ? "Hide" : "Show"} Stats</span>
        {showSidebar ? <HiChevronUp className="size-4" /> : <HiChevronDown className="size-4" />}
      </button> */}

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
    </motion.div>
  )
}

export default CashRemittance
