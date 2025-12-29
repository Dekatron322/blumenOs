"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CreditCard, RefreshCw } from "lucide-react"
import { VscEye } from "react-icons/vsc"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearPrepaidCreditHistory, fetchPrepaidCreditHistory } from "lib/redux/metersSlice"
import type { PrepaidCreditHistoryEntry } from "lib/redux/metersSlice"

interface PrepaidCreditHistoryTabProps {
  meterId: number
}

const PrepaidCreditHistoryTab: React.FC<PrepaidCreditHistoryTabProps> = ({ meterId }) => {
  const dispatch = useAppDispatch()
  const {
    prepaidCreditHistory,
    prepaidCreditHistoryLoading,
    prepaidCreditHistoryError,
    prepaidCreditHistoryPagination,
  } = useAppSelector((state) => state.meters)

  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<PrepaidCreditHistoryEntry | null>(null)

  // Fetch credit history using Redux
  useEffect(() => {
    if (meterId) {
      dispatch(fetchPrepaidCreditHistory({ id: meterId, pageNumber: currentPage, pageSize }))
    }

    return () => {
      !prepaidCreditHistoryLoading &&
        !prepaidCreditHistoryError &&
        prepaidCreditHistory.length > 0 &&
        dispatch(clearPrepaidCreditHistory())
    }
  }, [meterId, currentPage, pageSize, dispatch])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleRefresh = () => {
    dispatch(fetchPrepaidCreditHistory({ id: meterId, pageNumber: currentPage, pageSize }))
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      COMPLETED: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Completed" },
      PENDING: { color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
      FAILED: { color: "text-red-600", bg: "bg-red-50", label: "Failed" },
    }
    return configs[status as keyof typeof configs] || { color: "text-gray-600", bg: "bg-gray-50", label: status }
  }

  const getPageItems = (): (number | string)[] => {
    const items: (number | string)[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
      return items
    }

    items.push(1)
    const showLeftEllipsis = currentPage > 4
    const showRightEllipsis = currentPage < totalPages - 3

    if (!showLeftEllipsis) {
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      items.push("...", totalPages - 3, totalPages - 2, totalPages - 1)
    } else {
      items.push("...", currentPage - 1, currentPage, currentPage + 1, "...")
    }

    if (!items.includes(totalPages)) {
      items.push(totalPages)
    }

    return items
  }

  const paginatedData = prepaidCreditHistory
  const totalPages = prepaidCreditHistoryPagination.totalPages

  const CreditCardComponent = ({ event }: { event: PrepaidCreditHistoryEntry }) => {
    const statusConfig = getStatusConfig(event.isSuccessful ? "COMPLETED" : "FAILED")

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
              <CreditCard />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">#{event.id}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div className={`rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                  {statusConfig.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs text-gray-600 sm:text-sm">
          <div className="flex justify-between">
            <span>Payment ID:</span>
            <span className="font-medium">{event.paymentId}</span>
          </div>
          <div className="flex justify-between">
            <span>User Account ID:</span>
            <span className="font-medium">{event.userAccountId}</span>
          </div>
          <div className="flex justify-between">
            <span>Agent ID:</span>
            <span className="font-medium">{event.agentId}</span>
          </div>
          <div className="flex justify-between">
            <span>Vendor ID:</span>
            <span className="font-medium">{event.vendorId}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-medium">{formatDateTime(event.requestedAtUtc)}</span>
          </div>
          {event.errorMessage && (
            <div className="flex justify-between">
              <span>Error Message:</span>
              <span className="font-medium text-red-600">{event.errorMessage}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setSelectedEvent(event)}
            className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white text-sm transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9] sm:text-base"
          >
            <VscEye className="size-4" />
            View Details
          </button>
        </div>
      </motion.div>
    )
  }

  const CreditListItem = ({ event }: { event: PrepaidCreditHistoryEntry }) => {
    const statusConfig = getStatusConfig(event.isSuccessful ? "COMPLETED" : "FAILED")

    return (
      <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100 max-sm:hidden">
              <CreditCard />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">#{event.id}</h3>
                <div className="flex flex-wrap gap-2">
                  <div className={`rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:gap-4 sm:text-sm">
                <span>
                  <strong>Payment ID:</strong> {event.paymentId}
                </span>
                <span>
                  <strong>User Account:</strong> {event.userAccountId}
                </span>
                <span>
                  <strong>Date:</strong> {formatDateTime(event.requestedAtUtc)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="hidden text-right text-sm sm:block">
              <div className="font-medium text-gray-900">ID: #{event.id}</div>
              <div className="mt-1 text-xs text-gray-500">{formatDateTime(event.requestedAtUtc)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedEvent(event)}
                className="button-oulined flex items-center gap-2 text-sm"
              >
                <VscEye className="size-4" />
                <span className="max-sm:hidden">View</span>
                <span className="sm:hidden">Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (prepaidCreditHistoryLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
          <RefreshCw className="size-6 animate-spin text-gray-400" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">Loading credit history...</h3>
        <p className="mt-1 text-sm text-gray-500">Please wait while we fetch the data</p>
      </div>
    )
  }

  if (prepaidCreditHistoryError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="size-6 text-red-600" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">Error loading data</h3>
        <p className="mt-1 text-sm text-gray-500">{prepaidCreditHistoryError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Prepaid Credit History</h3>
          <p className="text-sm text-gray-500">View all credit transactions and payment history</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`button-oulined text-sm ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <MdGridView className="size-4" />
            <p className="max-sm:hidden">Grid</p>
          </button>
          <button
            className={`button-oulined text-sm ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <MdFormatListBulleted className="size-4" />
            <p className="max-sm:hidden">List</p>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <h4 className="mb-3 font-medium text-gray-900">Filter Options</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Transaction Type</label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option>All Types</option>
                <option>Top Up</option>
                <option>Payment</option>
                <option>Refund</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Payment Method</label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option>All Methods</option>
                <option>USSD</option>
                <option>Mobile App</option>
                <option>Web</option>
                <option>POS</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Date Range</label>
              <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {paginatedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
            <CreditCard />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">No credit transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">No credit transactions recorded for this meter</p>
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <div className="divide-y">
              {paginatedData.map((event) => (
                <CreditListItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedData.map((event) => (
                <CreditCardComponent key={event.id} event={event} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex w-full flex-row items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-1 max-sm:hidden">
              <p className="text-sm sm:text-base">Show rows</p>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-[#F2F2F2] p-1 text-sm sm:text-base"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={24}>24</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start sm:gap-3">
              <button
                className={`px-2 py-1 sm:px-3 sm:py-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <BiSolidLeftArrow className="size-4 sm:size-5" />
              </button>

              <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden items-center gap-1 md:flex md:gap-2">
                  {getPageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex size-6 items-center justify-center rounded-md text-xs md:h-7 md:w-8 md:text-sm ${
                          currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => setCurrentPage(item)}
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
              </div>

              <button
                className={`px-2 py-1 sm:px-3 sm:py-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <BiSolidRightArrow className="size-4 sm:size-5" />
              </button>
            </div>
            <p className="text-sm max-sm:hidden sm:text-base">
              Page {currentPage} of {totalPages} ({prepaidCreditHistoryPagination.totalCount} total records)
            </p>
          </div>
        </>
      )}

      {/* Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-w-lg rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Credit Transaction Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-medium">#{selectedEvent.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meter ID:</span>
                <span className="font-medium">{selectedEvent.meterId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-medium">{selectedEvent.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Account ID:</span>
                <span className="font-medium">{selectedEvent.userAccountId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Agent ID:</span>
                <span className="font-medium">{selectedEvent.agentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vendor ID:</span>
                <span className="font-medium">{selectedEvent.vendorId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${selectedEvent.isSuccessful ? "text-green-600" : "text-red-600"}`}>
                  {selectedEvent.isSuccessful ? "Successful" : "Failed"}
                </span>
              </div>
              {selectedEvent.errorCode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Code:</span>
                  <span className="font-medium text-red-600">{selectedEvent.errorCode}</span>
                </div>
              )}
              {selectedEvent.errorMessage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Message:</span>
                  <span className="font-medium text-red-600">{selectedEvent.errorMessage}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Requested At:</span>
                <span className="font-medium">{formatDateTime(selectedEvent.requestedAtUtc)}</span>
              </div>
              {selectedEvent.requestPayload && (
                <div>
                  <span className="text-gray-600">Request Payload:</span>
                  <div className="mt-1 rounded bg-gray-100 p-2 font-mono text-xs">{selectedEvent.requestPayload}</div>
                </div>
              )}
              {selectedEvent.responsePayload && (
                <div>
                  <span className="text-gray-600">Response Payload:</span>
                  <div className="mt-1 rounded bg-gray-100 p-2 font-mono text-xs">{selectedEvent.responsePayload}</div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelectedEvent(null)} className="button-oulined">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrepaidCreditHistoryTab
