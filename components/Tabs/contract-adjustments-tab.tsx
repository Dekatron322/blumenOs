"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearCustomerContractAdjustmentsStatus,
  type CustomerContractAdjustmentListItem,
  fetchCustomerContractAdjustments,
} from "lib/redux/postpaidSlice"

interface ContractAdjustmentsTabProps {
  customerId: number
  customerName: string
}

const ContractAdjustmentsTab: React.FC<ContractAdjustmentsTabProps> = ({ customerId, customerName }) => {
  const dispatch = useAppDispatch()
  const {
    customerContractAdjustments,
    customerContractAdjustmentsLoading,
    customerContractAdjustmentsError,
    customerContractAdjustmentsSuccess,
    customerContractAdjustmentsPagination,
  } = useAppSelector((state) => state.postpaidBilling)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    // Fetch contract adjustments when component mounts
    dispatch(
      fetchCustomerContractAdjustments({
        pageNumber: currentPage,
        pageSize,
        customerId,
      })
    )

    // Cleanup on unmount
    return () => {
      dispatch(clearCustomerContractAdjustmentsStatus())
    }
  }, [dispatch, customerId, currentPage])

  const handleRefresh = () => {
    dispatch(
      fetchCustomerContractAdjustments({
        pageNumber: currentPage,
        pageSize,
        customerId,
      })
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const getStatusBadge = (isActive: boolean, autoApprove: boolean) => {
    if (isActive && autoApprove) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          <CheckCircle className="size-3" />
          Active & Auto-Approved
        </span>
      )
    } else if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          <Clock className="size-3" />
          Active
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          <XCircle className="size-3" />
          Inactive
        </span>
      )
    }
  }

  if (customerContractAdjustmentsLoading && customerContractAdjustments.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-[#004B23]" />
          <p className="text-sm text-gray-600">Loading contract adjustments...</p>
        </div>
      </div>
    )
  }

  if (customerContractAdjustmentsError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 text-red-600" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading Contract Adjustments</h3>
            <p className="mt-1 text-sm text-red-700">{customerContractAdjustmentsError}</p>
            <ButtonModule onClick={handleRefresh} variant="secondary" className="mt-4" size="sm" type="button">
              <RefreshCw className="mr-2 size-4" />
              Try Again
            </ButtonModule>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Contract Adjustments</h2>
          <p className="text-sm text-gray-600">Showing contract adjustments for {customerName}</p>
        </div>
        <ButtonModule
          onClick={handleRefresh}
          variant="secondary"
          size="sm"
          type="button"
          disabled={customerContractAdjustmentsLoading}
        >
          <RefreshCw className={`mr-2 size-4 ${customerContractAdjustmentsLoading ? "animate-spin" : ""}`} />
          Refresh
        </ButtonModule>
      </div>

      {/* Adjustments List */}
      {customerContractAdjustments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-12">
          <FileText className="mb-4 size-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No Contract Adjustments</h3>
          <p className="text-center text-sm text-gray-600">This customer has no contract adjustments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {customerContractAdjustments.map((adjustment, index) => (
              <motion.div
                key={adjustment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header with reference and status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Ref: {adjustment.reference}</span>
                      {getStatusBadge(adjustment.isActive, adjustment.autoApprove)}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700">{adjustment.description}</p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="flex items-center gap-1 text-sm font-medium text-gray-900">
                          <DollarSign className="size-4 text-gray-400" />
                          {formatCurrency(adjustment.amount)}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Start Period</p>
                        <p className="flex items-center gap-1 text-sm text-gray-900">
                          <Calendar className="size-4 text-gray-400" />
                          {adjustment.startPeriod}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">End Period</p>
                        <p className="flex items-center gap-1 text-sm text-gray-900">
                          <Calendar className="size-4 text-gray-400" />
                          {adjustment.endPeriod}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Last Applied</p>
                        <p className="text-sm text-gray-900">{adjustment.lastAppliedPeriod || "Never"}</p>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span>Created: {formatDate(adjustment.createdAt)}</span>
                      <span>Last Updated: {formatDate(adjustment.lastUpdated)}</span>
                      {adjustment.lastAppliedAtUtc && <span>Applied: {formatDate(adjustment.lastAppliedAtUtc)}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pagination */}
          {customerContractAdjustmentsPagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">
                Showing page {customerContractAdjustmentsPagination.currentPage} of{" "}
                {customerContractAdjustmentsPagination.totalPages} ({customerContractAdjustmentsPagination.totalCount}{" "}
                total)
              </p>
              <div className="flex items-center gap-2">
                <ButtonModule
                  onClick={() => handlePageChange(currentPage - 1)}
                  variant="secondary"
                  size="sm"
                  type="button"
                  disabled={currentPage === 1 || customerContractAdjustmentsLoading}
                >
                  Previous
                </ButtonModule>
                <ButtonModule
                  onClick={() => handlePageChange(currentPage + 1)}
                  variant="secondary"
                  size="sm"
                  type="button"
                  disabled={
                    currentPage === customerContractAdjustmentsPagination.totalPages ||
                    customerContractAdjustmentsLoading
                  }
                >
                  Next
                </ButtonModule>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ContractAdjustmentsTab
