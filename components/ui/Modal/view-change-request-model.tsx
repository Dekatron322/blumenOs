"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { approveChangeRequest, declineChangeRequest, fetchChangeRequestDetails } from "lib/redux/employeeSlice"

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
  } = useAppSelector((state) => state.employee)
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

  const parsePatchDocument = (patchDocument: string) => {
    try {
      return JSON.parse(patchDocument)
    } catch {
      return []
    }
  }

  const getFieldLabel = (path: string) => {
    const fieldMap: { [key: string]: string } = {
      "/fullName": "Full Name",
      "/phoneNumber": "Phone Number",
      "/position": "Position",
      "/emergencyContact": "Emergency Contact",
      "/address": "Address",
      "/email": "Email",
      "/employeeId": "Employee ID",
      "/employmentType": "Employment Type",
      "/departmentId": "Department",
      "/areaOfficeId": "Area Office",
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
    return String(val)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm sm:p-4 md:p-6"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl md:h-[85vh] lg:h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Change Request Details</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-10"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {changeRequestDetailsLoading ? (
            <div className="flex items-center justify-center p-6 sm:p-8">
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
                <p className="text-sm text-gray-600 sm:text-base">Loading change request details...</p>
              </div>
            </div>
          ) : changeRequestDetails ? (
            <div className="p-4 sm:p-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">Basic Information</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between gap-1">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Reference:</span>
                        <span className="break-all text-sm font-semibold text-gray-900 sm:text-base">
                          {changeRequestDetails.reference}
                        </span>
                      </div>
                      <div className="flex justify-between gap-1">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Status:</span>
                        <span
                          className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ${
                            getStatusConfig(changeRequestDetails.status).bg
                          } ${getStatusConfig(changeRequestDetails.status).color}`}
                        >
                          {getStatusConfig(changeRequestDetails.status).label}
                        </span>
                      </div>
                      <div className="flex  justify-between  gap-1">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Source:</span>
                        <span
                          className={`break-all text-sm font-semibold sm:text-base ${
                            getSourceConfig(changeRequestDetails.source).color
                          }`}
                        >
                          {getSourceConfig(changeRequestDetails.source).label}
                        </span>
                      </div>
                      <div className="flex justify-between gap-1">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Entity:</span>
                        <span className="break-all text-sm font-semibold text-gray-900 sm:text-base">
                          {changeRequestDetails.entityLabel}
                        </span>
                      </div>
                      <div className="flex justify-between gap-1">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Entity Type:</span>
                        <span className="text-sm font-semibold text-gray-900 sm:text-base">
                          {changeRequestDetails.entityType === 1 ? "Employee" : "Other"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Request Information */}
                  <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">Request Information</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between gap-1">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Requested By:</span>
                        <span className="break-all text-sm font-semibold text-gray-900 sm:text-base">
                          {changeRequestDetails.requestedBy}
                        </span>
                      </div>
                      <div className="flex justify-between gap-1">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Requested At:</span>
                        <span className="text-sm font-semibold text-gray-900 sm:text-base">
                          {formatDate(changeRequestDetails.requestedAtUtc)}
                        </span>
                      </div>
                      {changeRequestDetails.requesterComment && (
                        <div className="flex  justify-between gap-1">
                          <span className="text-xs font-medium text-gray-600 sm:text-sm">Requester Comment:</span>
                          <p className="mt-1 break-words text-sm text-gray-700 sm:text-base">
                            {changeRequestDetails.requesterComment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Approval Information */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">Approval Information</h3>
                    <div className="space-y-2 sm:space-y-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Auto Approved:</span>
                        <span className="text-sm font-semibold text-gray-900 sm:text-base">
                          {changeRequestDetails.autoApproved ? "Yes" : "No"}
                        </span>
                      </div>
                      {changeRequestDetails.approvedBy && (
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-medium text-gray-600 sm:text-sm">Approved By:</span>
                          <span className="break-all text-sm font-semibold text-gray-900 sm:text-base">
                            {changeRequestDetails.approvedBy}
                          </span>
                        </div>
                      )}
                      {changeRequestDetails.approvedAtUtc && (
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-medium text-gray-600 sm:text-sm">Approved At:</span>
                          <span className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatDate(changeRequestDetails.approvedAtUtc)}
                          </span>
                        </div>
                      )}
                      {changeRequestDetails.approvalNotes && (
                        <div>
                          <span className="text-xs font-medium text-gray-600 sm:text-sm">Approval Notes:</span>
                          <p className="mt-1 break-words text-sm text-gray-700 sm:text-base">
                            {changeRequestDetails.approvalNotes}
                          </p>
                        </div>
                      )}
                      {changeRequestDetails.declinedReason && (
                        <div>
                          <span className="text-xs font-medium text-gray-600 sm:text-sm">Declined Reason:</span>
                          <p className="mt-1 break-words text-sm text-red-600 sm:text-base">
                            {changeRequestDetails.declinedReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">System Information</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Public ID:</span>
                        <span className="break-all text-sm font-semibold text-gray-900 sm:text-base">
                          {changeRequestDetails.publicId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">Entity ID:</span>
                        <span className="break-all text-sm font-semibold text-gray-900 sm:text-base">
                          {changeRequestDetails.entityId}
                        </span>
                      </div>
                      {changeRequestDetails.appliedAtUtc && (
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-medium text-gray-600 sm:text-sm">Applied At:</span>
                          <span className="text-sm font-semibold text-gray-900 sm:text-base">
                            {formatDate(changeRequestDetails.appliedAtUtc)}
                          </span>
                        </div>
                      )}
                      {changeRequestDetails.failureReason && (
                        <div>
                          <span className="text-xs font-medium text-gray-600 sm:text-sm">Failure Reason:</span>
                          <p className="mt-1 break-words text-sm text-red-600 sm:text-base">
                            {changeRequestDetails.failureReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Notes Input under Changes Preview */}
              {showNotesInput && (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-3 text-base font-semibold text-blue-900 sm:text-lg">
                    Add Approval Notes (Optional)
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any notes or comments about this approval..."
                    className="w-full rounded-lg border border-blue-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-base"
                    rows={3}
                  />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <ButtonModule
                      variant="secondary"
                      className="flex-1"
                      size="sm"
                      onClick={handleCancelApprove}
                      disabled={approveChangeRequestLoading}
                    >
                      Cancel
                    </ButtonModule>
                    <ButtonModule
                      variant="primary"
                      className="flex-1"
                      size="sm"
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
                  <h3 className="mb-3 text-base font-semibold text-red-900 sm:text-lg">Reason for Decline</h3>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Enter the reason for declining this change request..."
                    className="w-full rounded-lg border border-red-300 bg-white p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 sm:text-base"
                    rows={3}
                  />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <ButtonModule
                      variant="secondary"
                      className="flex-1"
                      size="sm"
                      onClick={handleCancelDecline}
                      disabled={declineChangeRequestLoading}
                    >
                      Cancel
                    </ButtonModule>
                    <ButtonModule
                      variant="danger"
                      className="flex-1"
                      size="sm"
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
                  <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">Changes Preview</h3>

                  {changeRequestDetails.displayDiff ? (
                    <div className="space-y-4">
                      {Object.entries(
                        parseDisplayDiff(changeRequestDetails.displayDiff) as Record<
                          string,
                          { from?: unknown; to?: unknown }
                        >
                      ).map(([field, changes]: [string, { from?: unknown; to?: unknown }]) => (
                        <div key={field} className="rounded-lg border border-gray-100 bg-gray-50 p-3 sm:p-4">
                          <h4 className="mb-2 text-sm font-medium text-gray-900 sm:text-base">
                            {getFieldLabel(field)}
                          </h4>
                          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                            <div>
                              <span className="text-xs font-medium text-gray-600 sm:text-sm">Current Value:</span>
                              <div className="mt-1 rounded border bg-white p-2">
                                <p className="break-words text-xs text-gray-700 sm:text-sm">
                                  {renderValue(changes.from)}
                                </p>
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-600 sm:text-sm">New Value:</span>
                              <div className="mt-1 rounded border border-green-200 bg-green-50 p-2">
                                <p className="break-words text-xs text-green-700 sm:text-sm">
                                  {renderValue(changes.to)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-sm text-gray-500 sm:py-8 sm:text-base">
                      No changes preview available
                    </div>
                  )}
                </div>
              </div>

              {/* Patch Document (Technical Details) */}
              {/* <div className="mt-6">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Technical Details</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Canonical Paths:</span>
                      <p className="mt-1 rounded border bg-gray-50 p-2 font-mono text-sm text-gray-700">
                        {changeRequestDetails.canonicalPaths || "N/A"}
                      </p>
                    </div>
                    {changeRequestDetails.patchDocument && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Patch Document:</span>
                        <pre className="mt-1 overflow-x-auto rounded border bg-gray-50 p-3 font-mono text-sm text-xs text-gray-700">
                          {JSON.stringify(parsePatchDocument(changeRequestDetails.patchDocument), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div> */}
            </div>
          ) : (
            <div className="flex items-center justify-center p-6 sm:p-8">
              <div className="text-center">
                <div className="mb-2 text-base text-red-500 sm:text-lg">Failed to load change request details</div>
                <p className="text-sm text-gray-600 sm:text-base">Please try again later</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:flex-row sm:gap-4 sm:p-6">
          <ButtonModule variant="secondary" size="md" onClick={onRequestClose}>
            Close
          </ButtonModule>
          {changeRequestDetails?.status === 0 && (
            <>
              <ButtonModule
                type="button"
                variant="primary"
                size="md"
                onClick={handleApproveClick}
                disabled={approveChangeRequestLoading}
              >
                Approve Changes
              </ButtonModule>
              <ButtonModule
                variant="danger"
                size="md"
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
