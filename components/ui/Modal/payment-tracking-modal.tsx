"use client"

import React from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Clock, Copy, ExternalLink, XCircle } from "lucide-react"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { notify } from "components/ui/Notification/Notification"
import type { NotificationType } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchPaymentTracking } from "lib/redux/paymentSlice"

interface PaymentTrackingModalProps {
  isOpen: boolean
  onRequestClose: () => void
  paymentId: number
}

interface PaymentTrackingData {
  id: number
  reference: string
  amount: number
  channel: "Cash" | "Transfer" | "Card" | "POS" | "BankDeposit"
  status: "Pending" | "Processing" | "Completed" | "Failed" | "Cancelled"
  clearanceStatus: "Uncleared" | "Clearing" | "Cleared" | "Suspended"
  isRemitted: boolean
  paidAtUtc: string
  location: string
  agentId: number
  agentName: string
  clearedByUserId: number | null
  clearedByName: string | null
  remittedByUserId: number | null
  remittedByName: string | null
  remittanceId: number | null
  remittanceStatus: string | null
  remittanceDepositedAtUtc: string | null
  remittanceTellerUrl: string | null
  collectionOfficerUserId: number | null
  collectionOfficerName: string | null
}

const PaymentTrackingModal: React.FC<PaymentTrackingModalProps> = ({ isOpen, onRequestClose, paymentId }) => {
  const dispatch = useAppDispatch()
  const { paymentTrackingLoading, paymentTrackingError, paymentTracking } = useAppSelector((state) => state.payments)

  React.useEffect(() => {
    if (isOpen && paymentId) {
      dispatch(fetchPaymentTracking(paymentId))
    }
  }, [isOpen, paymentId, dispatch])

  const getStatusConfig = (status: string): { color: string; bg: string; icon: React.ReactNode; label: string } => {
    const configs: { [key: string]: { color: string; bg: string; icon: React.ReactNode; label: string } } = {
      Pending: {
        color: "text-amber-600",
        bg: "bg-amber-50 border-amber-200",
        icon: <Clock className="size-4" />,
        label: "Pending",
      },
      Processing: {
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-200",
        icon: <Clock className="size-4" />,
        label: "Processing",
      },
      Completed: {
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-200",
        icon: <CheckCircle className="size-4" />,
        label: "Completed",
      },
      Confirmed: {
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-200",
        icon: <CheckCircle className="size-4" />,
        label: "Confirmed",
      },
      Failed: {
        color: "text-red-600",
        bg: "bg-red-50 border-red-200",
        icon: <XCircle className="size-4" />,
        label: "Failed",
      },
      Cancelled: {
        color: "text-gray-600",
        bg: "bg-gray-50 border-gray-200",
        icon: <XCircle className="size-4" />,
        label: "Cancelled",
      },
    }
    return configs[status] || configs.Pending!
  }

  const getClearanceConfig = (status: string) => {
    const configs: { [key: string]: { color: string; bg: string; label: string } } = {
      Uncleared: { color: "text-gray-600", bg: "bg-gray-100", label: "Uncleared" },
      Clearing: { color: "text-amber-600", bg: "bg-amber-100", label: "Clearing" },
      Cleared: { color: "text-emerald-600", bg: "bg-emerald-100", label: "Cleared" },
      Suspended: { color: "text-red-600", bg: "bg-red-100", label: "Suspended" },
    }
    return configs[status] ?? configs.Uncleared ?? { color: "text-gray-600", bg: "bg-gray-100", label: "Uncleared" }
  }

  const getChannelConfig = (channel: string) => {
    const configs: { [key: string]: { color: string; bg: string; label: string } } = {
      Cash: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Cash" },
      Transfer: { color: "text-blue-600", bg: "bg-blue-50", label: "Bank Transfer" },
      Card: { color: "text-purple-600", bg: "bg-purple-50", label: "Card" },
      POS: { color: "text-cyan-600", bg: "bg-cyan-50", label: "POS" },
      BankDeposit: { color: "text-indigo-600", bg: "bg-indigo-50", label: "Bank Deposit" },
    }
    return configs[channel] || { color: "text-gray-600", bg: "bg-gray-50", label: channel }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    notify("success" as NotificationType, `${label} copied to clipboard`)
  }

  const downloadReceipt = () => {
    // Implement receipt download logic
    notify("info" as NotificationType, "Receipt download initiated")
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
        className="relative flex h-[90vh] w-[85vw] max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Tracking</h2>
            <p className="text-sm text-gray-500">Monitor payment status and details</p>
          </div>
          <button
            onClick={onRequestClose}
            className="flex size-10 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {paymentTrackingLoading ? (
            <div className="space-y-6 p-6">
              {/* Header skeleton */}
              <div className="space-y-4">
                <div className="h-8 w-1/3 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
              </div>

              {/* Cards grid skeleton */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Details section skeleton */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
                  <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
                  <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : paymentTrackingError ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="size-10 text-red-600" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">Error Loading Tracking</h3>
                <p className="mb-6 max-w-md text-gray-600">{paymentTrackingError}</p>
                <ButtonModule variant="primary" onClick={() => dispatch(fetchPaymentTracking(paymentId))}>
                  Retry Loading
                </ButtonModule>
              </div>
            </div>
          ) : paymentTracking ? (
            <div className="p-6">
              {/* Payment Overview Card */}
              <div className="mb-8 rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50/50 to-white p-6">
                <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">Reference:</span>
                      <div className="flex items-center gap-2">
                        <code className="rounded-lg bg-gray-100 px-3 py-1 font-mono text-sm text-gray-900">
                          {paymentTracking?.reference}
                        </code>
                        <button
                          onClick={() => copyToClipboard(paymentTracking?.reference, "Reference")}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{formatCurrency(paymentTracking?.amount)}</div>
                    <p className="text-sm text-gray-500">Payment Amount</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column - Payment Details */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Status Cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex  justify-between">
                        <h3 className="text-sm font-semibold text-gray-500">Payment Status</h3>
                        {getStatusConfig(paymentTracking?.status ?? "Pending").icon}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                            getStatusConfig(paymentTracking?.status ?? "Pending").bg
                          } ${getStatusConfig(paymentTracking?.status ?? "Pending").color}`}
                        >
                          {getStatusConfig(paymentTracking?.status ?? "Pending").label}
                        </div>

                        <div className="text-xs text-gray-600">{formatDate(paymentTracking?.paidAtUtc)}</div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-500">Clearance Status</h3>
                        <div
                          className={`size-3 rounded-full ${
                            getClearanceConfig(paymentTracking?.clearanceStatus ?? "Uncleared").bg
                          }`}
                        ></div>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                          getClearanceConfig(paymentTracking?.clearanceStatus ?? "Uncleared").bg
                        } ${getClearanceConfig(paymentTracking?.clearanceStatus ?? "Uncleared").color}`}
                      >
                        {getClearanceConfig(paymentTracking?.clearanceStatus ?? "Uncleared").label}
                      </div>
                      {paymentTracking?.clearedByName && (
                        <p className="mt-2 text-xs text-gray-500">Cleared by: {paymentTracking?.clearedByName}</p>
                      )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-500">Payment Channel</h3>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                          getChannelConfig(paymentTracking?.channel ?? "Cash").bg
                        } ${getChannelConfig(paymentTracking?.channel ?? "Cash").color}`}
                      >
                        {getChannelConfig(paymentTracking?.channel ?? "Cash").label}
                      </div>
                      {paymentTracking?.location && (
                        <p className="mt-2 text-xs text-gray-500">{paymentTracking?.location}</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Timeline */}
                  <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <h3 className="mb-6 text-lg font-semibold text-gray-900">Payment Timeline</h3>
                    <div className="relative">
                      {/* Timeline line - completed section */}
                      <div className="absolute left-4 top-0 h-8 w-0.5 bg-emerald-400"></div>
                      {/* Timeline line - not completed section */}
                      <div className="absolute left-4 top-8 h-[calc(100%-2rem)] w-0.5 border-l-2 border-dashed border-gray-300"></div>

                      {/* Timeline items */}
                      <div className="space-y-8">
                        {/* Payment Initiated */}
                        {paymentTracking?.agentName && (
                          <div className="relative flex items-start">
                            <div className="relative z-10 flex size-8 items-center justify-center rounded-full bg-blue-100">
                              <div className="size-2 rounded-full bg-blue-600"></div>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">Payment Initiated</h4>
                                <span className="text-sm text-gray-500">{formatDate(paymentTracking?.paidAtUtc)}</span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                Payment was initiated by {paymentTracking?.agentName}
                              </p>
                              {/* {paymentTracking?.agentId && (
                                <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1 text-xs">
                                  <span className="font-medium">Agent ID:</span>
                                  <span>{paymentTracking?.agentId}</span>
                                </div>
                              )} */}
                            </div>
                          </div>
                        )}

                        {/* Clearance Status */}
                        {paymentTracking?.clearedByName && (
                          <div className="relative flex items-start">
                            <div
                              className={`relative z-10 flex size-8 items-center justify-center rounded-full ${
                                paymentTracking?.clearanceStatus === "Cleared"
                                  ? "bg-emerald-100"
                                  : paymentTracking?.clearanceStatus === "Clearing"
                                  ? "bg-amber-100"
                                  : paymentTracking?.clearanceStatus === "Suspended"
                                  ? "bg-red-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <div
                                className={`size-2 rounded-full ${
                                  paymentTracking?.clearanceStatus === "Cleared"
                                    ? "bg-emerald-600"
                                    : paymentTracking?.clearanceStatus === "Clearing"
                                    ? "bg-amber-600"
                                    : paymentTracking?.clearanceStatus === "Suspended"
                                    ? "bg-red-600"
                                    : "bg-gray-600"
                                }`}
                              ></div>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">Clearance</h4>
                                <span className="text-sm text-gray-500">
                                  {paymentTracking?.clearanceStatus === "Cleared" && paymentTracking?.clearedByName
                                    ? formatDate(paymentTracking?.paidAtUtc)
                                    : "Pending"}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {paymentTracking?.clearanceStatus === "Cleared"
                                  ? `Cleared by ${paymentTracking?.clearedByName}`
                                  : paymentTracking?.clearanceStatus === "Clearing"
                                  ? "Currently being cleared"
                                  : "Awaiting clearance"}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Remittance Status */}
                        {paymentTracking?.remittedByName && (
                          <div className="relative flex items-start">
                            <div
                              className={`relative z-10 flex size-8 items-center justify-center rounded-full ${
                                paymentTracking?.isRemitted ? "bg-emerald-100" : "bg-gray-100"
                              }`}
                            >
                              <div
                                className={`size-2 rounded-full ${
                                  paymentTracking?.isRemitted ? "bg-emerald-600" : "bg-gray-600"
                                }`}
                              ></div>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">Remittance</h4>
                                <span className="text-sm text-gray-500">
                                  {paymentTracking?.isRemitted && paymentTracking?.remittanceDepositedAtUtc
                                    ? formatDate(paymentTracking?.remittanceDepositedAtUtc)
                                    : ""}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {paymentTracking?.isRemitted
                                  ? `Remitted by ${paymentTracking?.remittedByName || "N/A"}`
                                  : "Awaiting remittance"}
                              </p>
                              {/* {paymentTracking?.remittanceId && (
                                <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1 text-xs">
                                  <span className="font-medium">Remittance ID:</span>
                                  <span>{paymentTracking?.remittanceId}</span>
                                </div>
                              )} */}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Additional Details */}
                <div className="space-y-6">
                  {/* Agent & Officer Info */}
                  {(paymentTracking?.agentName || paymentTracking?.collectionOfficerName) && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Officer Information</h3>
                      <div className="space-y-4">
                        {paymentTracking?.agentName && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500">Collection Agent</div>
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                {paymentTracking?.agentName?.charAt(0) || "A"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{paymentTracking?.agentName}</div>
                                {/* {paymentTracking?.agentId && (
                                  <div className="text-sm text-gray-500">ID: {paymentTracking?.agentId}</div>
                                )} */}
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentTracking?.collectionOfficerName && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500">Collection Officer</div>
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                {paymentTracking?.collectionOfficerName?.charAt(0) || "C"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {paymentTracking?.collectionOfficerName}
                                </div>
                                {/* <div className="text-sm text-gray-500">
                                  User ID: {paymentTracking?.collectionOfficerUserId}
                                </div> */}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Remittance Details */}
                  {paymentTracking?.isRemitted && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">Remittance Details</h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-500">Remitted By</div>
                          <div className="font-medium text-gray-900">{paymentTracking?.remittedByName || "N/A"}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-500">Deposited At</div>
                          <div className="font-medium text-gray-900">
                            {paymentTracking?.remittanceDepositedAtUtc
                              ? formatDate(paymentTracking?.remittanceDepositedAtUtc)
                              : "N/A"}
                          </div>
                        </div>
                        {paymentTracking?.remittanceStatus && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Remittance Status</div>
                            <div className="font-medium text-gray-900">{paymentTracking?.remittanceStatus}</div>
                          </div>
                        )}
                        {paymentTracking?.remittanceTellerUrl && (
                          <ButtonModule
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(paymentTracking?.remittanceTellerUrl!, "_blank")}
                          >
                            <ExternalLink className="mr-2 size-4" />
                            View Teller Slip
                          </ButtonModule>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="flex gap-3">
              <ButtonModule variant="ghost" size="lg" onClick={onRequestClose}>
                Cancel
              </ButtonModule>
              <ButtonModule variant="primary" size="lg" onClick={onRequestClose}>
                Done
              </ButtonModule>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PaymentTrackingModal
