"use client"

import React from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  approveDebtEntry,
  clearDebtEntryDetailState,
  fetchDebtEntryDetail,
  selectApproveDebtEntryLoading,
  selectDebtEntryDetail,
  selectDebtEntryDetailError,
  selectDebtEntryDetailLoading,
} from "lib/redux/debtManagementSlice"
import { notify } from "components/ui/Notification/Notification"

interface ViewDebtEntryModalProps {
  isOpen: boolean
  onRequestClose: () => void
  entryId: number
}

const ViewDebtEntryModal: React.FC<ViewDebtEntryModalProps> = ({ isOpen, onRequestClose, entryId }) => {
  const dispatch = useAppDispatch()
  const debtEntryDetail = useAppSelector(selectDebtEntryDetail)
  const isLoading = useAppSelector(selectDebtEntryDetailLoading)
  const error = useAppSelector(selectDebtEntryDetailError)
  const isApproveLoading = useAppSelector(selectApproveDebtEntryLoading)

  React.useEffect(() => {
    if (isOpen && entryId) {
      dispatch(fetchDebtEntryDetail(entryId))
    }
  }, [isOpen, entryId, dispatch])

  React.useEffect(() => {
    if (!isOpen) {
      dispatch(clearDebtEntryDetailState())
    }
  }, [isOpen, dispatch])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: number) => {
    const statusConfig = {
      1: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      2: { label: "Approved", className: "bg-green-100 text-green-800" },
      3: { label: "Rejected", className: "bg-red-100 text-red-800" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[1]
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const handleApproveEntry = async () => {
    if (!debtEntryDetail) return

    try {
      await dispatch(approveDebtEntry(debtEntryDetail.id)).unwrap()
      notify("success", "Debt entry approved successfully")
      // Refresh the entry details to show updated status
      dispatch(fetchDebtEntryDetail(entryId))
    } catch (error: any) {
      notify("error", error.message || "Failed to approve debt entry")
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[600px] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Debt Entry Details</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={isLoading}
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="mx-auto size-12 text-red-400">
                <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">Error Loading Details</h3>
              <p className="mt-2 text-sm text-gray-500">{error}</p>
              <div className="mt-4">
                <ButtonModule variant="secondary" onClick={() => dispatch(fetchDebtEntryDetail(entryId))}>
                  Retry
                </ButtonModule>
              </div>
            </div>
          ) : debtEntryDetail ? (
            <div className="p-6">
              {/* Entry Header */}
              <div className="mb-6 rounded-lg bg-blue-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Entry #{debtEntryDetail.id}</h3>
                    <p className="text-sm text-gray-600">Created on {formatDate(debtEntryDetail.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(debtEntryDetail.amount)}</p>
                    <p className="text-sm text-gray-500">Entry Amount</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Customer Information</h4>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customer Name</p>
                      <p className="text-sm font-semibold text-gray-900">{debtEntryDetail.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Account Number</p>
                      <p className="text-sm font-semibold text-gray-900">{debtEntryDetail.customerAccountNumber}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <div className="mt-1">{getStatusBadge(debtEntryDetail.status)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Entry Details */}
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Entry Details</h4>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Payment Type</p>
                      <p className="text-sm font-semibold text-gray-900">{debtEntryDetail.paymentTypeName}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Reason</p>
                      <p className="text-sm font-semibold text-gray-900">{debtEntryDetail.reason}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates Information */}
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Important Dates</h4>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Created At</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(debtEntryDetail.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Effective Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(debtEntryDetail.effectiveAtUtc)}
                      </p>
                    </div>
                    {debtEntryDetail.approvedAtUtc && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Approved At</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(debtEntryDetail.approvedAtUtc)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Approved By</p>
                          <p className="text-sm font-semibold text-gray-900">{debtEntryDetail.approvedByName}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* User Information */}
              {(debtEntryDetail.createdByName || debtEntryDetail.approvedByName) && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">User Information</h4>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {debtEntryDetail.createdByName && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Created By</p>
                          <p className="text-sm font-semibold text-gray-900">{debtEntryDetail.createdByName}</p>
                          {/* <p className="text-xs text-gray-500">User ID: #{debtEntryDetail.createdByUserId}</p> */}
                        </div>
                      )}
                      {debtEntryDetail.approvedByName && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Approved By</p>
                          <p className="text-sm font-semibold text-gray-900">{debtEntryDetail.approvedByName}</p>
                          {/* <p className="text-xs text-gray-500">User ID: #{debtEntryDetail.approvedByUserId}</p> */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-3 border-t border-gray-200 bg-gray-50 p-6">
          {debtEntryDetail && debtEntryDetail.status === 1 && (
            <ButtonModule
              variant="success"
              onClick={handleApproveEntry}
              disabled={isApproveLoading || isLoading}
              className="flex w-full"
            >
              {isApproveLoading ? "Approving..." : "Approve Entry"}
            </ButtonModule>
          )}
          <ButtonModule
            variant="secondary"
            onClick={onRequestClose}
            disabled={isLoading || isApproveLoading}
            className={debtEntryDetail && debtEntryDetail.status === 1 ? "flex w-full" : "flex w-full"}
          >
            Close
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ViewDebtEntryModal
