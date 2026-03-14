import React, { useEffect, useState } from "react"
import { PaymentDisputeSource, PaymentDisputeStatus, usePaymentDispute } from "lib/hooks/usePaymentDispute"
import EmptySearchState from "components/ui/EmptySearchState"

interface PaymentDisputeListProps {
  initialParams?: {
    pageNumber?: number
    pageSize?: number
    customerId?: number
    paymentTransactionId?: number
    status?: PaymentDisputeStatus
    source?: PaymentDisputeSource
  }
}

export const PaymentDisputeList: React.FC<PaymentDisputeListProps> = ({
  initialParams = { pageNumber: 1, pageSize: 10 },
}) => {
  const {
    disputes,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    hasNext,
    hasPrevious,
    getPaymentDisputes,
    clearError,
    reset,
  } = usePaymentDispute()

  const [params, setParams] = useState({
    pageNumber: initialParams.pageNumber || 1,
    pageSize: initialParams.pageSize || 10,
    customerId: initialParams.customerId,
    paymentTransactionId: initialParams.paymentTransactionId,
    status: initialParams.status,
    source: initialParams.source,
  })

  useEffect(() => {
    getPaymentDisputes(params)
  }, [params])

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, pageNumber: newPage }))
  }

  const handleFilterChange = (newFilters: Partial<typeof params>) => {
    setParams((prev) => ({ ...prev, ...newFilters, pageNumber: 1 }))
  }

  const handleRetry = () => {
    clearError()
    getPaymentDisputes(params)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  if (loading && disputes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <h3 className="font-medium text-red-800">Error loading payment disputes</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-3 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <h3 className="mb-4 text-lg font-medium">Filters</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={params.status || ""}
              onChange={(e) =>
                handleFilterChange({
                  status: e.target.value ? (e.target.value as PaymentDisputeStatus) : undefined,
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value={PaymentDisputeStatus.Open}>Open</option>
              <option value={PaymentDisputeStatus.InReview}>In Review</option>
              <option value={PaymentDisputeStatus.Resolved}>Resolved</option>
              <option value={PaymentDisputeStatus.Rejected}>Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Source</label>
            <select
              value={params.source || ""}
              onChange={(e) =>
                handleFilterChange({
                  source: e.target.value ? (e.target.value as PaymentDisputeSource) : undefined,
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sources</option>
              <option value={PaymentDisputeSource.Employee}>Employee</option>
              <option value={PaymentDisputeSource.Customer}>Customer</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Customer ID</label>
            <input
              type="number"
              value={params.customerId || ""}
              onChange={(e) =>
                handleFilterChange({
                  customerId: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="Enter customer ID"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {disputes.length} of {totalCount} payment disputes
        </p>
      </div>

      {/* Disputes Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {disputes.map((dispute) => (
              <tr key={dispute.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{dispute.id}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{dispute.paymentReference}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{dispute.customerName}</div>
                    <div className="text-gray-500">{dispute.customerAccountNumber}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div>Requested: {formatCurrency(dispute.requestedAmount)}</div>
                    {dispute.resolvedAmount > 0 && (
                      <div className="text-green-600">Resolved: {formatCurrency(dispute.resolvedAmount)}</div>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold
                      ${dispute.status === PaymentDisputeStatus.Open ? "bg-yellow-100 text-yellow-800" : ""}
                      ${dispute.status === PaymentDisputeStatus.InReview ? "bg-blue-100 text-blue-800" : ""}
                      ${dispute.status === PaymentDisputeStatus.Resolved ? "bg-green-100 text-green-800" : ""}
                      ${dispute.status === PaymentDisputeStatus.Rejected ? "bg-red-100 text-red-800" : ""}
                    `}
                  >
                    {dispute.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold
                      ${dispute.source === PaymentDisputeSource.Employee ? "bg-purple-100 text-purple-800" : ""}
                      ${dispute.source === PaymentDisputeSource.Customer ? "bg-indigo-100 text-indigo-800" : ""}
                    `}
                  >
                    {dispute.source}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{formatDate(dispute.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevious}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {disputes.length === 0 && !loading && (
        <div className="py-8 text-center">
          <EmptySearchState title="No payment disputes found" />
        </div>
      )}
    </div>
  )
}
