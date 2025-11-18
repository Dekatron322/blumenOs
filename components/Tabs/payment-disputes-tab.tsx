"use client"
import React from "react"
import { AlertCircle } from "lucide-react"
import { PaymentDispute } from "lib/redux/customerSlice"

interface PaymentDisputesTabProps {
  paymentDisputes: PaymentDispute[]
  loading: boolean
  error: string | null
  pagination: any
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  formatCurrency: (amount: number) => string
  formatDateTime: (dateString: string) => string
}

const PaymentDisputesTab: React.FC<PaymentDisputesTabProps> = ({
  paymentDisputes,
  loading,
  error,
  pagination,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  formatCurrency,
  formatDateTime,
}) => {
  const getDisputeStatusConfig = (status: string) => {
    const configs = {
      Open: { color: "text-blue-600", bg: "bg-blue-50" },
      InReview: { color: "text-amber-600", bg: "bg-amber-50" },
      Resolved: { color: "text-emerald-600", bg: "bg-emerald-50" },
      Rejected: { color: "text-red-600", bg: "bg-red-50" },
    }
    return configs[status as keyof typeof configs] || configs.Open
  }

  const getSourceConfig = (source: string) => {
    const configs = {
      Employee: { color: "text-purple-600", bg: "bg-purple-50" },
      Customer: { color: "text-cyan-600", bg: "bg-cyan-50" },
    }
    return configs[source as keyof typeof configs] || configs.Employee
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-600">Loading payment disputes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 size-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Error Loading Disputes</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payment Disputes</h3>
        <div className="flex items-center gap-3">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {paymentDisputes.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gray-100">
              <AlertCircle className="size-6 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Payment Disputes</h3>
            <p className="text-gray-600">This customer has no payment disputes recorded.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paymentDisputes.map((dispute: PaymentDispute) => {
              const statusConfig = getDisputeStatusConfig(dispute.status)
              const sourceConfig = getSourceConfig(dispute.source)

              return (
                <div
                  key={dispute.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Dispute #{dispute.id}</h4>
                      <p className="text-sm text-gray-600">Payment Reference: {dispute.paymentReference}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                      >
                        {dispute.status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${sourceConfig.bg} ${sourceConfig.color}`}
                      >
                        {dispute.source}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Requested Amount</label>
                      <p className="font-semibold text-gray-900">{formatCurrency(dispute.requestedAmount)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Resolved Amount</label>
                      <p className="font-semibold text-gray-900">
                        {dispute.resolvedAmount ? formatCurrency(dispute.resolvedAmount) : "Not resolved"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created</label>
                      <p className="font-semibold text-gray-900">{formatDateTime(dispute.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Resolved</label>
                      <p className="font-semibold text-gray-900">
                        {dispute.resolvedAtUtc ? formatDateTime(dispute.resolvedAtUtc) : "Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Reason</label>
                      <p className="text-gray-900">{dispute.reason}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Details</label>
                      <p className="text-gray-900">{dispute.details}</p>
                    </div>
                  </div>

                  {dispute.resolutionNotes && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">Resolution Notes</label>
                      <p className="mt-1 rounded-lg bg-gray-50 p-3 text-gray-900">{dispute.resolutionNotes}</p>
                    </div>
                  )}

                  {dispute.payment && (
                    <div className="border-t pt-4">
                      <h5 className="mb-3 font-semibold text-gray-900">Payment Details</h5>
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className="text-gray-600">Channel</label>
                          <p className="font-medium">{dispute.payment.channel}</p>
                        </div>
                        <div>
                          <label className="text-gray-600">Amount</label>
                          <p className="font-medium">{formatCurrency(dispute.payment.amount)}</p>
                        </div>
                        <div>
                          <label className="text-gray-600">Status</label>
                          <p className="font-medium">{dispute.payment.status}</p>
                        </div>
                        <div>
                          <label className="text-gray-600">Paid At</label>
                          <p className="font-medium">{formatDateTime(dispute.payment.paidAtUtc)}</p>
                        </div>
                        <div>
                          <label className="text-gray-600">Confirmed At</label>
                          <p className="font-medium">
                            {dispute.payment.confirmedAtUtc
                              ? formatDateTime(dispute.payment.confirmedAtUtc)
                              : "Not confirmed"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, pagination.totalCount)}{" "}
                of {pagination.totalCount} disputes
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PaymentDisputesTab
