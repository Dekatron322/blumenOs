"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import CloseIcon from "public/close-icon"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"

import { notify } from "components/ui/Notification/Notification"
import { AppDispatch, RootState } from "lib/redux/store"
import {
  BillingDisputeData,
  clearUpdateDisputeStatus,
  clearUpdateDisputeStatusError,
  updateDisputeStatus,
} from "lib/redux/billingDisputeSlice"
import { FormTextAreaModule } from "../Input/FormTextAreaModule"

interface UpdateDisputeStatusModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
  dispute: BillingDisputeData | null
}

interface DisputeStatusFormData {
  status: number
  resolutionNotes: string
}

const UpdateDisputeStatusModal: React.FC<UpdateDisputeStatusModalProps> = ({
  isOpen,
  onRequestClose,
  onSuccess,
  dispute,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { updatingDisputeStatus, updateDisputeStatusError, updateDisputeStatusSuccess } = useSelector(
    (state: RootState) => state.billingDispute
  )

  const [formData, setFormData] = useState<DisputeStatusFormData>({
    status: 0,
    resolutionNotes: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Initialize form with dispute data when modal opens or dispute changes
  useEffect(() => {
    if (dispute && isOpen) {
      setFormData({
        status: dispute.status || 0,
        resolutionNotes: dispute.resolutionNotes || "",
      })
    }
  }, [dispute, isOpen])

  useEffect(() => {
    if (isOpen) {
      dispatch(clearUpdateDisputeStatus())
    }
  }, [dispatch, isOpen])

  // Handle success and error states
  useEffect(() => {
    if (updateDisputeStatusSuccess) {
      notify("success", "Dispute status updated successfully", {
        description: `Dispute #${dispute?.id} has been updated successfully`,
        duration: 5000,
      })

      if (onSuccess) onSuccess()
      handleClose()

      dispatch(clearUpdateDisputeStatus())
    }

    if (updateDisputeStatusError) {
      notify("error", "Failed to update dispute status", {
        description: updateDisputeStatusError,
        duration: 6000,
      })

      dispatch(clearUpdateDisputeStatus())
    }
  }, [updateDisputeStatusSuccess, updateDisputeStatusError, dispute?.id, onSuccess, dispatch])

  const handleClose = () => {
    setFormErrors({})
    dispatch(clearUpdateDisputeStatusError())
    onRequestClose()
  }

  // Dispute status options
  const disputeStatusOptions = [
    { value: 0, label: "Pending" },
    { value: 1, label: "Under Review" },
    { value: 2, label: "Resolved" },
    { value: 3, label: "Rejected" },
  ]

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    let processedValue = value
    if (name === "status") {
      processedValue = Number(value)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (formData.status === undefined || formData.status === null) {
      errors.status = "Status is required"
    }

    if (!formData.resolutionNotes.trim()) {
      errors.resolutionNotes = "Resolution notes are required"
    } else if (formData.resolutionNotes.trim().length < 10) {
      errors.resolutionNotes = "Resolution notes must be at least 10 characters"
    } else if (formData.resolutionNotes.trim().length > 1000) {
      errors.resolutionNotes = "Resolution notes cannot exceed 1000 characters"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!dispute) return

    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      await dispatch(
        updateDisputeStatus({
          id: dispute.id,
          request: formData,
        })
      ).unwrap()
    } catch (error: any) {
      console.error("Failed to update dispute status:", error)
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800"
      case 1:
        return "bg-blue-100 text-blue-800"
      case 2:
        return "bg-green-100 text-green-800"
      case 3:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: number) => {
    return disputeStatusOptions.find((opt) => opt.value === status)?.label || "Unknown"
  }

  const isFormValid = (): boolean => {
    return (
      formData.status !== undefined &&
      formData.status !== null &&
      formData.resolutionNotes.trim() !== "" &&
      formData.resolutionNotes.trim().length >= 10 &&
      formData.resolutionNotes.trim().length <= 1000
    )
  }

  if (!isOpen || !dispute) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-3 backdrop-blur-sm sm:px-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl sm:max-w-lg md:max-w-xl lg:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Update Dispute Status</h2>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-10"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Dispute Information Summary */}
          <div className="border-b border-gray-200 bg-gray-50 p-4 sm:px-6 sm:py-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 sm:text-sm">Customer</p>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">{dispute.customerName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 sm:text-sm">Account Number</p>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">{dispute.customerAccountNumber}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-500 sm:text-sm">Reason</p>
                <p className="text-sm text-gray-900 sm:text-base">{dispute.reason}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-500 sm:text-sm">Current Status</p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    dispute.status
                  )}`}
                >
                  {getStatusLabel(dispute.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4 px-4 pb-4 pt-4 sm:gap-6 sm:px-6 sm:pb-6 sm:pt-6">
            <FormSelectModule
              label="New Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[{ value: "", label: "Select new status" }, ...disputeStatusOptions]}
              error={formErrors.status}
              required
            />

            <FormTextAreaModule
              label="Resolution Notes"
              name="resolutionNotes"
              placeholder="Enter detailed resolution notes explaining the decision..."
              value={formData.resolutionNotes}
              onChange={handleInputChange}
              error={formErrors.resolutionNotes}
              required
              rows={5}
            />

            {/* Error Display */}
            {Object.keys(formErrors).length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 sm:p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="size-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Form validation errors</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <ul className="list-disc space-y-1 pl-5">
                        {Object.values(formErrors).map((error, index) => (
                          <li key={index} className="text-xs sm:text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:flex-row sm:gap-4 sm:px-6 sm:py-5">
          <ButtonModule
            variant="dangerSecondary"
            className="flex w-full"
            size="md"
            onClick={handleClose}
            disabled={updatingDisputeStatus}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex w-full"
            size="md"
            onClick={handleSubmit}
            disabled={!isFormValid() || updatingDisputeStatus}
          >
            {updatingDisputeStatus ? "Updating Status..." : "Update Status"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default UpdateDisputeStatusModal
