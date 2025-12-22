"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { approveChangeRequest, declineChangeRequest, getChangeRequestDetails } from "lib/redux/billingDisputeSlice"

interface ViewBillingDisputeChangeRequestModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
  changeRequestId: string
}

const ViewBillingDisputeChangeRequestModal: React.FC<ViewBillingDisputeChangeRequestModalProps> = ({
  isOpen,
  onRequestClose,
  onSuccess,
  changeRequestId,
}) => {
  const dispatch = useAppDispatch()
  const {
    changeRequestDetails,
    loadingChangeRequestDetails,
    approveChangeRequestError,
    approvingChangeRequest,
    declineChangeRequestError,
    decliningChangeRequest,
  } = useAppSelector((state) => state.billingDispute)
  const { user } = useAppSelector((state) => state.auth)

  const canExecute = !!user?.privileges?.some((p) => p.actions?.includes("A"))

  const [notes, setNotes] = useState("")
  const [showNotesInput, setShowNotesInput] = useState(false)
  const [error, setError] = useState("")
  const [declineReason, setDeclineReason] = useState("")
  const [showDeclineInput, setShowDeclineInput] = useState(false)
  const [declineError, setDeclineError] = useState("")

  React.useEffect(() => {
    if (isOpen && changeRequestId) {
      dispatch(getChangeRequestDetails({ identifier: changeRequestId }))
    }
  }, [isOpen, changeRequestId, dispatch])

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
      3: { label: "Customer", color: "text-orange-600" },
    }
    return configs[source as keyof typeof configs] || configs[1]
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

  const renderValue = (val: unknown): React.ReactNode => {
    if (val === null || val === undefined || val === "") return "N/A"
    if (React.isValidElement(val)) return val
    if (typeof val === "object") return JSON.stringify(val)
    if (typeof val === "boolean") return val ? "Yes" : "No"
    if (typeof val === "number") return val.toString()
    return String(val)
  }

  const handleApprove = async () => {
    if (!changeRequestId) {
      setError("No change request selected")
      return
    }

    setError("")

    try {
      await dispatch(
        approveChangeRequest({
          publicId: changeRequestId,
          request: {
            notes: notes.trim() || undefined,
          },
        })
      ).unwrap()

      onSuccess?.()
      notify("success", "Change request approved successfully")
      onRequestClose()

      setNotes("")
      setShowNotesInput(false)
    } catch (err: any) {
      setError(err || "Failed to approve change request")
      notify("error", err?.message || err || "Failed to approve change request")
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
      await dispatch(
        declineChangeRequest({
          publicId: changeRequestId,
          request: {
            reason: declineReason.trim(),
          },
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
          <h2 className="text-xl font-bold text-gray-900">Billing Dispute Change Request Details</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingChangeRequestDetails ? (
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
                <p className="text-gray-600">Loading change request details...</p>
              </div>
            </div>
          ) : changeRequestDetails ? (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                    </div>
                  </div>

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

                <div className="space-y-4">
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
                    </div>
                  </div>
                </div>
              </div>

              {showNotesInput && (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-blue-900">Add Approval Notes (Optional)</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any notes or comments about this approval..."
                    className="w-full rounded-lg border border-blue-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    rows={4}
                    disabled={approvingChangeRequest}
                  />
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                  <div className="mt-4 flex gap-3">
                    <ButtonModule
                      variant="secondary"
                      className="flex-1"
                      size="lg"
                      onClick={handleCancelApprove}
                      disabled={approvingChangeRequest}
                    >
                      Cancel
                    </ButtonModule>
                    <ButtonModule
                      variant="primary"
                      className="flex-1"
                      size="lg"
                      onClick={handleApprove}
                      disabled={approvingChangeRequest}
                    >
                      {approvingChangeRequest ? "Approving..." : "Confirm Approve"}
                    </ButtonModule>
                  </div>
                </div>
              )}

              {showDeclineInput && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-red-900">Reason for Decline</h3>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Provide a reason for declining this request..."
                    className="w-full rounded-lg border border-red-300 bg-white p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    rows={4}
                    disabled={decliningChangeRequest}
                  />
                  {(declineError || declineChangeRequestError) && (
                    <p className="mt-2 text-sm text-red-600">{declineError || declineChangeRequestError}</p>
                  )}
                  <div className="mt-4 flex gap-3">
                    <ButtonModule
                      variant="secondary"
                      className="flex-1"
                      size="lg"
                      onClick={handleCancelDecline}
                      disabled={decliningChangeRequest}
                    >
                      Cancel
                    </ButtonModule>
                    <ButtonModule
                      variant="danger"
                      className="flex-1"
                      size="lg"
                      onClick={handleDecline}
                      disabled={decliningChangeRequest}
                    >
                      {decliningChangeRequest ? "Declining..." : "Confirm Decline"}
                    </ButtonModule>
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Changes Preview</h3>
                <div className="space-y-3">
                  {parsePatchDocument(changeRequestDetails.patchDocument).length > 0 ? (
                    parsePatchDocument(changeRequestDetails.patchDocument).map((item, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">{item.path}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <div className="text-xs font-medium text-gray-500">From</div>
                            <div className="text-sm text-gray-900">{renderValue(item.from)}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">To</div>
                            <div className="text-sm text-gray-900">{renderValue(item.value)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-600">No patch changes available.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-600">No change request details found.</div>
          )}
        </div>

        <div className="bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:p-6">
          {!canExecute ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">
                You don’t have permission to approve/decline requests.
              </p>
            </div>
          ) : (
            <div className="flex gap-4">
              <ButtonModule
                variant="primary"
                className="flex-1"
                size="lg"
                onClick={handleApproveClick}
                disabled={approvingChangeRequest}
              >
                {showNotesInput ? "Confirm Approve" : "Approve Changes"}
              </ButtonModule>
              <ButtonModule
                variant="danger"
                className="flex-1"
                size="lg"
                onClick={handleDeclineClick}
                disabled={decliningChangeRequest}
              >
                {showDeclineInput ? "Confirm Decline" : "Decline Changes"}
              </ButtonModule>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

const CloseIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default ViewBillingDisputeChangeRequestModal
