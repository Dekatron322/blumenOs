"use client"

import { motion } from "framer-motion"
import { AlertCircle, Calendar, DollarSign, FileText, User, X } from "lucide-react"
import { format } from "date-fns"
import { BillAdjustmentDetails } from "lib/redux/postpaidSlice"

interface BillAdjustmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  adjustmentDetails: BillAdjustmentDetails | null
  loading: boolean
  error: string | null
}

const BillAdjustmentDetailsModal: React.FC<BillAdjustmentDetailsModalProps> = ({
  isOpen,
  onClose,
  adjustmentDetails,
  loading,
  error,
}) => {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800"
      case 1:
        return "bg-green-100 text-green-800"
      case 2:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Pending"
      case 1:
        return "Approved"
      case 2:
        return "Rejected"
      default:
        return "Unknown"
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-white/50 px-3 py-1 font-mono text-sm font-bold text-white/80">
                  ADJUSTMENT DETAILS
                </span>
                {adjustmentDetails && (
                  <span
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${getStatusColor(
                      adjustmentDetails.adjustmentStatus
                    )}`}
                  >
                    {getStatusText(adjustmentDetails.adjustmentStatus)}
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">Bill Adjustment Financial Statement</h3>
              <p className="mt-1 text-sm text-white">View detailed financial statement for bill adjustment</p>
            </div>
            <motion.button
              onClick={onClose}
              className="rounded-full bg-white/50 p-2 text-gray-600 transition-colors hover:bg-white/70"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 rounded-lg bg-red-50 p-4 text-red-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Error</p>
              </div>
              <p className="mt-1 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-sm text-gray-600">Loading adjustment details...</p>
              </div>
            </div>
          )}

          {/* Adjustment Details */}
          {adjustmentDetails && !loading && (
            <div className="space-y-6">
              {/* Adjustment Overview */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-4 text-lg font-semibold text-gray-900">Adjustment Overview</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Adjustment Amount</span>
                    </div>
                    <p className="mt-2 text-xl font-bold text-gray-900">
                      {formatCurrency(adjustmentDetails.adjustmentAmount)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-600">Approved By</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {adjustmentDetails.approvedByName || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-600">Approved At</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {adjustmentDetails.approvedAtUtc ? formatDate(adjustmentDetails.approvedAtUtc) : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-600">Statement Generated</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {adjustmentDetails.statementGeneratedAtUtc
                        ? formatDate(adjustmentDetails.statementGeneratedAtUtc)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="mb-4 text-lg font-semibold text-gray-900">Customer Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Customer Name:</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{adjustmentDetails.customer.fullName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Account Number:</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {adjustmentDetails.customer.accountNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Address:</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{adjustmentDetails.customer.address}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Phone Number:</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{adjustmentDetails.customer.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Bill Information */}
              <div className="rounded-lg bg-green-50 p-4">
                <h4 className="mb-4 text-lg font-semibold text-gray-900">Bill Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Billing ID:</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{adjustmentDetails.bill.billingId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Period:</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{adjustmentDetails.bill.period}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Category:</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{adjustmentDetails.bill.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Opening Balance:</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatCurrency(adjustmentDetails.bill.openingBalance)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Current Bill Amount:</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatCurrency(adjustmentDetails.bill.currentBillAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Adjusted Total Due:</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatCurrency(adjustmentDetails.bill.adjustedTotalDue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Summary */}
              <div className="rounded-lg bg-purple-50 p-4">
                <h4 className="mb-4 text-lg font-semibold text-gray-900">Account Summary</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <span className="text-sm font-medium text-gray-600">Total Debits</span>
                    <p className="mt-1 text-lg font-bold text-red-600">
                      {formatCurrency(adjustmentDetails.accountSummary.totalDebits)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <span className="text-sm font-medium text-gray-600">Total Credits</span>
                    <p className="mt-1 text-lg font-bold text-green-600">
                      {formatCurrency(adjustmentDetails.accountSummary.totalCredits)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <span className="text-sm font-medium text-gray-600">Net Balance</span>
                    <p
                      className={`mt-1 text-lg font-bold ${
                        adjustmentDetails.accountSummary.netBalance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(adjustmentDetails.accountSummary.netBalance)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <span className="text-sm font-medium text-gray-600">Outstanding Debt</span>
                    <p className="mt-1 text-lg font-bold text-orange-600">
                      {formatCurrency(adjustmentDetails.accountSummary.outstandingDebtBalance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statement Entries */}
              {adjustmentDetails.statementEntries.length > 0 && (
                <div className="rounded-lg bg-orange-50 p-4">
                  <h4 className="mb-4 text-lg font-semibold text-gray-900">Statement Entries</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Code
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Memo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {adjustmentDetails.statementEntries.map((entry) => (
                          <tr key={entry.id}>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                              {formatDate(entry.effectiveAtUtc)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  entry.type === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {entry.type === 1 ? "Credit" : "Debit"}
                              </span>
                            </td>
                            <td
                              className={`whitespace-nowrap px-4 py-3 text-sm font-medium ${
                                entry.type === 1 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {entry.type === 1 ? "+" : "-"}
                              {formatCurrency(entry.amount)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{entry.code}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{entry.memo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payments */}
              {adjustmentDetails.payments.length > 0 && (
                <div className="rounded-lg bg-teal-50 p-4">
                  <h4 className="mb-4 text-lg font-semibold text-gray-900">Related Payments</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Reference
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Channel
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Paid At
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {adjustmentDetails.payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                              {payment.reference}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-green-600">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  payment.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{payment.channel}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                              {formatDate(payment.paidAtUtc)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default BillAdjustmentDetailsModal
