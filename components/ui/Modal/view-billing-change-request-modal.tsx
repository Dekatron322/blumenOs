"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"

import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { approveChangeRequest, declineChangeRequest, fetchChangeRequestDetails } from "lib/redux/postpaidSlice"
import { ButtonModule } from "components/ui/Button/Button"

interface ViewChangeRequestModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
  changeRequestId: string
}

const ViewChangeRequestModal: React.FC<ViewChangeRequestModalProps> = ({
  isOpen,
  onRequestClose,
  onSuccess,
  changeRequestId,
}) => {
  const dispatch = useAppDispatch()
  const {
    changeRequestDetails,
    changeRequestDetailsLoading,
    approveChangeRequestLoading,
    approveChangeRequestError,
    declineChangeRequestLoading,
    declineChangeRequestError,
  } = useAppSelector((state) => state.postpaidBilling)
  const [notes, setNotes] = useState("")
  const [showNotesInput, setShowNotesInput] = useState(false)
  const [error, setError] = useState("")
  const [declineReason, setDeclineReason] = useState("")
  const [showDeclineInput, setShowDeclineInput] = useState(false)
  const [declineError, setDeclineError] = useState("")

  React.useEffect(() => {
    if (isOpen && changeRequestId) {
      dispatch(fetchChangeRequestDetails(changeRequestId))
    }
  }, [isOpen, changeRequestId, dispatch])

  const handleApprove = async () => {
    if (!changeRequestId) {
      setError("No change request selected")
      return
    }

    setError("")

    try {
      const result = await dispatch(
        approveChangeRequest({
          publicId: changeRequestId,
          notes: notes.trim() || undefined,
        })
      ).unwrap()

      // Call success callback if provided
      onSuccess?.()

      // Notify success
      notify("success", "Change request approved successfully")

      // Close the modal
      onRequestClose()

      // Reset form
      setNotes("")
      setShowNotesInput(false)
    } catch (err: any) {
      setError(err || "Failed to approve change request")
      notify("error", err?.message || err || "Failed to approve change request")
      // Keep the notes section open for user to adjust
    }
  }

  const handleApproveClick = () => {
    if (!showNotesInput) {
      setShowNotesInput(true)
    } else {
      handleApprove()
    }
  }

  const handleCancelApprove = () => {
    setShowNotesInput(false)
    setNotes("")
    setError("")
  }

  const handleDecline = async () => {
    if (!changeRequestId) {
      setDeclineError("No change request selected")
      return
    }

    if (!declineReason.trim()) {
      setDeclineError("Please provide a reason for decline")
      return
    }

    setDeclineError("")

    try {
      const result = await dispatch(
        declineChangeRequest({
          publicId: changeRequestId,
          reason: declineReason.trim(),
        })
      ).unwrap()

      onSuccess?.()
      notify("success", "Change request declined successfully")
      onRequestClose()

      setDeclineReason("")
      setShowDeclineInput(false)
    } catch (err: any) {
      setDeclineError(err || "Failed to decline change request")
      notify("error", err?.message || err || "Failed to decline change request")
    }
  }

  const handleDeclineClick = () => {
    if (!showDeclineInput) {
      setShowDeclineInput(true)
    } else {
      handleDecline()
    }
  }

  const handleCancelDecline = () => {
    setShowDeclineInput(false)
    setDeclineReason("")
    setDeclineError("")
  }

  const getStatusConfig = (status: number) => {
    const configs = {
      0: { color: "text-amber-600", bg: "bg-amber-50", label: "PENDING" },
      1: { color: "text-emerald-600", bg: "bg-emerald-50", label: "APPROVED" },
      2: { color: "text-red-600", bg: "bg-red-50", label: "DECLINED" },
      3: { color: "text-gray-600", bg: "bg-gray-50", label: "CANCELLED" },
      4: { color: "text-blue-600", bg: "bg-blue-50", label: "APPLIED" },
      5: { color: "text-gray-600", bg: "bg-gray-50", label: "FAILED" },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getSourceConfig = (source: number) => {
    const configs = {
      0: { label: "System", color: "text-blue-600" },
      1: { label: "Manual", color: "text-green-600" },
      2: { label: "Import", color: "text-purple-600" },
    }
    return configs[source as keyof typeof configs] || configs[1]
  }

  const getEntityTypeConfig = (entityType: number) => {
    const configs = {
      1: { label: "Billing Job", color: "text-purple-600", bg: "bg-purple-50" },
      2: { label: "Postpaid Bill", color: "text-blue-600", bg: "bg-blue-50" },
      3: { label: "Billing Period", color: "text-green-600", bg: "bg-green-50" },
    }
    return configs[entityType as keyof typeof configs] || { label: "Unknown", color: "text-gray-600", bg: "bg-gray-50" }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const parseDisplayDiff = (displayDiff: string) => {
    try {
      return JSON.parse(displayDiff)
    } catch {
      return {}
    }
  }

  const parsePatchDocument = (
    patchDocument: string
  ): Array<{
    path: string
    from?: unknown
    value?: unknown
  }> => {
    try {
      return JSON.parse(patchDocument) as Array<{
        path: string
        from?: unknown
        value?: unknown
      }>
    } catch {
      return []
    }
  }

  const getFieldLabel = (path: string) => {
    const fieldMap: { [key: string]: string } = {
      "/period": "Billing Period",
      "/areaOfficeId": "Area Office",
      "/status": "Job Status",
      "/draftedCount": "Drafted Count",
      "/finalizedCount": "Finalized Count",
      "/skippedCount": "Skipped Count",
      "/totalCustomers": "Total Customers",
      "/processedCustomers": "Processed Customers",
      "/customerId": "Customer ID",
      "/consumptionKwh": "Consumption (kWh)",
      "/chargeBeforeVat": "Charge Before VAT",
      "/vatAmount": "VAT Amount",
      "/currentBillAmount": "Current Bill Amount",
      "/totalDue": "Total Due",
      "/tariffPerKwh": "Tariff per kWh",
      "/vatRate": "VAT Rate",
      "/openingBalance": "Opening Balance",
      "/paymentsPrevMonth": "Payments Previous Month",
      "/isEstimated": "Is Estimated",
      "/estimatedConsumptionKwh": "Estimated Consumption (kWh)",
      "/estimatedBillAmount": "Estimated Bill Amount",
      "/actualConsumptionKwh": "Actual Consumption (kWh)",
      "/actualBillAmount": "Actual Bill Amount",
      "/distributionSubstationId": "Distribution Substation",
      "/feederId": "Feeder",
      "/areaOfficeName": "Area Office Name",
      "/feederName": "Feeder Name",
      "/distributionSubstationCode": "Distribution Substation Code",
      "/customerName": "Customer Name",
      "/customerAccountNumber": "Customer Account Number",
    }
    return (
      fieldMap[path] ||
      path
        .replace("/", "")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
    )
  }

  const renderValue = (val: unknown): React.ReactNode => {
    if (val === null || val === undefined || val === "") return "N/A"
    if (React.isValidElement(val)) return val
    if (typeof val === "object") return JSON.stringify(val)
    if (typeof val === "boolean") return val ? "Yes" : "No"
    if (typeof val === "number") {
      // Format currency values
      if (val >= 1000) {
        return `₦${val.toLocaleString()}`
      }
      return val.toString()
    }
    return String(val)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm sm:p-4"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">Billing Change Request Details</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {changeRequestDetailsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="size-8 animate-spin text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-600">Loading billing change request details...</p>
              </div>
            </div>
          ) : changeRequestDetails ? (
            <div className="p-4 sm:p-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Reference:</span>
                        <span className="text-sm font-semibold text-gray-900">{changeRequestDetails.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            getStatusConfig(changeRequestDetails.status).bg
                          } ${getStatusConfig(changeRequestDetails.status).color}`}
                        >
                          {getStatusConfig(changeRequestDetails.status).label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Source:</span>
                        <span className={`text-sm font-semibold ${getSourceConfig(changeRequestDetails.source).color}`}>
                          {getSourceConfig(changeRequestDetails.source).label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Entity:</span>
                        <span className="text-sm font-semibold text-gray-900">{changeRequestDetails.entityLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Entity Type:</span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            getEntityTypeConfig(changeRequestDetails.entityType).bg
                          } ${getEntityTypeConfig(changeRequestDetails.entityType).color}`}
                        >
                          {getEntityTypeConfig(changeRequestDetails.entityType).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Request Information */}
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">Request Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Requested By:</span>
                        <span className="text-sm font-semibold text-gray-900">{changeRequestDetails.requestedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Requested At:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatDate(changeRequestDetails.requestedAtUtc)}
                        </span>
                      </div>
                      {changeRequestDetails.requesterComment && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Requester Comment:</span>
                          <p className="mt-1 text-sm text-gray-700">{changeRequestDetails.requesterComment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Approval Information */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">Approval Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Auto Approved:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {changeRequestDetails.autoApproved ? "Yes" : "No"}
                        </span>
                      </div>
                      {changeRequestDetails.approvedBy && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Approved By:</span>
                          <span className="text-sm font-semibold text-gray-900">{changeRequestDetails.approvedBy}</span>
                        </div>
                      )}
                      {changeRequestDetails.approvedAtUtc && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Approved At:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDate(changeRequestDetails.approvedAtUtc)}
                          </span>
                        </div>
                      )}
                      {changeRequestDetails.approvalNotes && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Approval Notes:</span>
                          <p className="mt-1 text-sm text-gray-700">{changeRequestDetails.approvalNotes}</p>
                        </div>
                      )}
                      {changeRequestDetails.declinedReason && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Declined Reason:</span>
                          <p className="mt-1 text-sm text-red-600">{changeRequestDetails.declinedReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">System Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Public ID:</span>
                        <span className="text-sm font-semibold text-gray-900">{changeRequestDetails.publicId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Entity ID:</span>
                        <span className="text-sm font-semibold text-gray-900">{changeRequestDetails.entityId}</span>
                      </div>
                      {changeRequestDetails.appliedAtUtc && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Applied At:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDate(changeRequestDetails.appliedAtUtc)}
                          </span>
                        </div>
                      )}
                      {changeRequestDetails.failureReason && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Failure Reason:</span>
                          <p className="mt-1 text-sm text-red-600">{changeRequestDetails.failureReason}</p>
                        </div>
                      )}
                      {changeRequestDetails.disputeType !== null && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Dispute Type:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {changeRequestDetails.disputeType}
                          </span>
                        </div>
                      )}
                      {changeRequestDetails.disputeId !== null && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Dispute ID:</span>
                          <span className="text-sm font-semibold text-gray-900">{changeRequestDetails.disputeId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Notes Input under Changes Preview */}
              {showNotesInput && (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-blue-900">Add Approval Notes (Optional)</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any notes or comments about this approval..."
                    className="w-full rounded-lg border border-blue-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    rows={4}
                  />
                  <div className="mt-4 flex gap-3">
                    <ButtonModule
                      variant="secondary"
                      className="flex-1"
                      size="lg"
                      onClick={handleCancelApprove}
                      disabled={approveChangeRequestLoading}
                    >
                      Cancel
                    </ButtonModule>
                    <ButtonModule
                      variant="primary"
                      className="flex-1"
                      size="lg"
                      onClick={handleApprove}
                      disabled={approveChangeRequestLoading}
                    >
                      {approveChangeRequestLoading ? "Confirming..." : "Confirm Approval"}
                    </ButtonModule>
                  </div>
                  {(error || approveChangeRequestError) && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {error || approveChangeRequestError}
                    </div>
                  )}
                </div>
              )}

              {showDeclineInput && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-red-900">Reason for Decline</h3>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Enter the reason for declining this change request..."
                    className="w-full rounded-lg border border-red-300 bg-white p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    rows={4}
                  />
                  <div className="mt-4 flex gap-3">
                    <ButtonModule
                      variant="secondary"
                      className="flex-1"
                      size="lg"
                      onClick={handleCancelDecline}
                      disabled={declineChangeRequestLoading}
                    >
                      Cancel
                    </ButtonModule>
                    <ButtonModule
                      variant="danger"
                      className="flex-1"
                      size="lg"
                      onClick={handleDecline}
                      disabled={declineChangeRequestLoading}
                    >
                      {declineChangeRequestLoading ? "Declining..." : "Confirm Decline"}
                    </ButtonModule>
                  </div>
                  {(declineError || declineChangeRequestError) && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {declineError || declineChangeRequestError}
                    </div>
                  )}
                </div>
              )}

              {/* Changes Preview */}
              <div className="mt-6">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Changes Preview</h3>

                  {changeRequestDetails.displayDiff ? (
                    <div className="space-y-4">
                      {Object.entries(
                        parseDisplayDiff(changeRequestDetails.displayDiff) as Record<
                          string,
                          { from?: unknown; to?: unknown }
                        >
                      ).map(([field, changes]: [string, { from?: unknown; to?: unknown }]) => (
                        <div key={field} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <h4 className="mb-3 font-medium text-gray-900">{getFieldLabel(field)}</h4>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Current Value:</span>
                              <p className="mt-1 rounded border bg-white p-2 text-sm text-gray-700">
                                {renderValue(changes.from)}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">New Value:</span>
                              <p className="mt-1 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">
                                {renderValue(changes.to)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : changeRequestDetails.patchDocument ? (
                    <div className="space-y-4">
                      {parsePatchDocument(changeRequestDetails.patchDocument).map((change: any, index: number) => (
                        <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <h4 className="mb-3 font-medium text-gray-900">{getFieldLabel(change.path)}</h4>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Current Value:</span>
                              <p className="mt-1 rounded border bg-white p-2 text-sm text-gray-700">
                                {change.from !== undefined ? renderValue(change.from) : "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">New Value:</span>
                              <p className="mt-1 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">
                                {renderValue(change.value)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">No changes preview available</div>
                  )}
                </div>
              </div>

              {/* Technical Details */}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="mb-2 text-lg text-red-500">Failed to load billing change request details</div>
                <p className="text-gray-600">Please try again later</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:p-6">
          <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={onRequestClose}>
            Close
          </ButtonModule>
          {changeRequestDetails?.status === 0 && (
            <>
              <ButtonModule
                type="button"
                variant="primary"
                className="flex-1"
                size="lg"
                onClick={handleApproveClick}
                disabled={approveChangeRequestLoading}
              >
                Approve Changes
              </ButtonModule>
              <ButtonModule
                variant="danger"
                className="flex-1"
                size="lg"
                onClick={handleDeclineClick}
                disabled={declineChangeRequestLoading}
              >
                {showDeclineInput ? "Confirm Decline" : "Decline Changes"}
              </ButtonModule>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ViewChangeRequestModal
