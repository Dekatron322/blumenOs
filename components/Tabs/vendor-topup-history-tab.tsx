"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, TrendingUp, Wallet } from "lucide-react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  fetchVendorTopUpHistory,
  clearVendorTopUpHistory,
  setVendorTopUpHistoryPagination,
} from "lib/redux/vendorSlice"

interface VendorTopUpHistoryTabProps {
  vendorId: number
}

const VendorTopUpHistoryTab: React.FC<VendorTopUpHistoryTabProps> = ({ vendorId }) => {
  const dispatch = useAppDispatch()

  const { vendorTopUpHistory, vendorTopUpHistoryLoading, vendorTopUpHistoryError, vendorTopUpHistoryPagination } =
    useAppSelector((state) => state.vendors)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  useEffect(() => {
    // Reset to first page when vendor changes
    setCurrentPage(1)

    dispatch(
      fetchVendorTopUpHistory({
        pageNumber: 1,
        pageSize,
        vendorId,
      })
    )

    return () => {
      dispatch(clearVendorTopUpHistory())
    }
  }, [dispatch, vendorId, pageSize])

  // Separate effect for page changes
  useEffect(() => {
    if (currentPage > 1) {
      dispatch(
        fetchVendorTopUpHistory({
          pageNumber: currentPage,
          pageSize,
          vendorId,
        })
      )
    }
  }, [dispatch, currentPage, pageSize, vendorId])

  const handleRetry = () => {
    // Reset to first page on retry
    setCurrentPage(1)
    dispatch(
      fetchVendorTopUpHistory({
        pageNumber: 1,
        pageSize,
        vendorId,
      })
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // The useEffect will handle the fetch with the new page
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      Pending: {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        label: "PENDING",
      },
      Confirmed: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        label: "CONFIRMED",
      },
      Failed: {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        label: "FAILED",
      },
    }
    return configs[status as keyof typeof configs] || configs.Pending
  }

  if (vendorTopUpHistoryLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading top-up history...</span>
        </div>
      </div>
    )
  }

  if (vendorTopUpHistoryError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <span className="font-medium">Error loading top-up history</span>
          </div>
          <p className="text-gray-600">{vendorTopUpHistoryError}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </motion.div>
    )
  }

  if (!vendorTopUpHistory || vendorTopUpHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Wallet className="h-12 w-12 text-gray-400" />
          <span className="text-gray-600">No top-up history available</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top-up History</h3>
          <p className="text-sm text-gray-600">Vendor wallet top-up information and history (Vendor ID: {vendorId})</p>
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Top-up History Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Top-up By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendorTopUpHistory.map((topUp) => {
                const statusConfig = getStatusConfig(topUp.status)
                return (
                  <tr key={topUp.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{topUp.reference}</div>
                      {topUp.externalReference && (
                        <div className="text-xs text-gray-500">Ext: {topUp.externalReference}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{formatCurrency(topUp.amount, topUp.currency)}</div>
                      {topUp.settledAmount !== topUp.amount && (
                        <div className="text-xs text-gray-500">
                          Settled: {formatCurrency(topUp.settledAmount, topUp.currency)}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{topUp.topUpBy}</div>
                      <div className="text-xs text-gray-500">{topUp.vendorName}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(topUp.createdAtUtc)}</div>
                      {topUp.confirmedAtUtc && topUp.status === "Confirmed" && (
                        <div className="text-xs text-gray-500">Confirmed: {formatDate(topUp.confirmedAtUtc)}</div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination - MeterInventoryTab Style */}
        {vendorTopUpHistoryPagination.totalPages > 0 && (
          <motion.div
            className="border- flex items-center justify-between px-4 py-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, vendorTopUpHistoryPagination.totalCount)} of{" "}
              {vendorTopUpHistoryPagination.totalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!vendorTopUpHistoryPagination.hasPrevious}
                className={`flex items-center justify-center rounded-md p-2 ${
                  !vendorTopUpHistoryPagination.hasPrevious
                    ? "cursor-not-allowed text-gray-400"
                    : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: !vendorTopUpHistoryPagination.hasPrevious ? 1 : 1.1 }}
                whileTap={{ scale: !vendorTopUpHistoryPagination.hasPrevious ? 1 : 0.95 }}
              >
                <MdOutlineArrowBackIosNew />
              </motion.button>

              {Array.from({ length: Math.min(5, vendorTopUpHistoryPagination.totalPages) }).map((_, index) => {
                let pageNum
                if (vendorTopUpHistoryPagination.totalPages <= 5) {
                  pageNum = index + 1
                } else if (currentPage <= 3) {
                  pageNum = index + 1
                } else if (currentPage >= vendorTopUpHistoryPagination.totalPages - 2) {
                  pageNum = vendorTopUpHistoryPagination.totalPages - 4 + index
                } else {
                  pageNum = currentPage - 2 + index
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-[#004B23] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    {pageNum}
                  </motion.button>
                )
              })}

              {vendorTopUpHistoryPagination.totalPages > 5 &&
                currentPage < vendorTopUpHistoryPagination.totalPages - 2 && <span className="px-2">...</span>}

              {vendorTopUpHistoryPagination.totalPages > 5 &&
                currentPage < vendorTopUpHistoryPagination.totalPages - 1 && (
                  <motion.button
                    onClick={() => handlePageChange(vendorTopUpHistoryPagination.totalPages)}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === vendorTopUpHistoryPagination.totalPages
                        ? "bg-[#004B23] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {vendorTopUpHistoryPagination.totalPages}
                  </motion.button>
                )}

              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!vendorTopUpHistoryPagination.hasNext}
                className={`flex items-center justify-center rounded-md  ${
                  !vendorTopUpHistoryPagination.hasNext
                    ? "cursor-not-allowed text-gray-400"
                    : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: !vendorTopUpHistoryPagination.hasNext ? 1 : 1.1 }}
                whileTap={{ scale: !vendorTopUpHistoryPagination.hasNext ? 1 : 0.95 }}
              >
                <MdOutlineArrowForwardIos />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Note */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <h5 className="font-medium text-blue-900">Top-up History Information</h5>
            <p className="mt-1 text-sm text-blue-800">
              This section displays the vendor's wallet top-up transaction history. Use the pagination controls to
              navigate through multiple pages of transactions.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VendorTopUpHistoryTab
