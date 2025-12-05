"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { submitVendorChangeRequest } from "lib/redux/vendorSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"
import { FormSelectModule } from "../Input/FormSelectModule"
import { FormInputModule } from "../Input/Input"

interface VendorChangeRequestModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm?: () => void
  vendorId: number
  vendorName: string
  onSuccess?: () => void
}

interface ChangeItem {
  path: string
  value: string
}

const vendorPathOptions = [
  { value: "name", label: "Vendor Name" },
  { value: "phoneNumber", label: "Phone Number" },
  { value: "email", label: "Email" },
  { value: "address", label: "Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "commission", label: "Commission" },
  { value: "canProcessPostpaid", label: "Can Process Postpaid" },
  { value: "canProcessPrepaid", label: "Can Process Prepaid" },
  { value: "employeeUserId", label: "Assigned Employee" },
]

const VendorChangeRequestModal: React.FC<VendorChangeRequestModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  vendorId,
  vendorName,
  onSuccess,
}) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [changes, setChanges] = useState<ChangeItem[]>([{ path: "", value: "" }])
  const [comment, setComment] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  if (!isOpen) return null

  const handleAddChange = () => {
    setChanges([...changes, { path: "", value: "" }])
    // Clear errors when adding new change
    setErrors({})
  }

  const handleRemoveChange = (index: number) => {
    if (changes.length > 1) {
      const newChanges = changes.filter((_, i) => i !== index)
      setChanges(newChanges)
      // Clear errors when removing change
      setErrors({})
    }
  }

  const handleChangeUpdate = (index: number, field: keyof ChangeItem, value: string) => {
    const newChanges = changes.map((change, i) => {
      if (i === index) {
        return { ...change, [field]: value }
      }
      return change
    })
    setChanges(newChanges)
    // Clear error for this field when user starts typing
    if (errors[`change-${index}-${field}`]) {
      const newErrors = { ...errors }
      delete newErrors[`change-${index}-${field}`]
      setErrors(newErrors)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validate each change item
    changes.forEach((change, index) => {
      if (!change.path) {
        newErrors[`change-${index}-path`] = "Please select a field to change"
      }
      if (!change.value.trim()) {
        newErrors[`change-${index}-value`] = "Please enter a new value"
      }
    })

    // Validate comment
    if (!comment.trim()) {
      newErrors.comment = "Please provide a reason for the changes"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the errors in the form")
      return
    }

    try {
      setIsLoading(true)

      // If custom onConfirm is provided, use it
      if (onConfirm) {
        await onConfirm()
        onRequestClose()
        return
      }

      // Filter out any empty changes and prepare the request data
      const validChanges = changes.filter((change) => change.path && change.value.trim())

      const changeRequestData = {
        changes: validChanges,
        comment: comment.trim(),
      }

      // Submit the change request
      const result = await dispatch(
        submitVendorChangeRequest({
          id: vendorId,
          changeRequestData,
        })
      )

      if (submitVendorChangeRequest.fulfilled.match(result)) {
        notify("success", `Change request for ${vendorName} has been submitted successfully`)
        onSuccess?.()
        // Reset form
        setChanges([{ path: "", value: "" }])
        setComment("")
        setErrors({})
      } else {
        throw new Error(result.payload as string)
      }

      onRequestClose()
    } catch (error: any) {
      notify("error", error.message || "Failed to submit change request")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setChanges([{ path: "", value: "" }])
    setComment("")
    setErrors({})
    onRequestClose()
  }

  const getPathLabel = (pathValue: string) => {
    const option = vendorPathOptions.find((opt) => opt.value === pathValue)
    return option ? option.label : pathValue
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
    // Clear comment error when user starts typing
    if (errors.comment) {
      const newErrors = { ...errors }
      delete newErrors.comment
      setErrors(newErrors)
    }
  }

  // Helper function to format boolean values for display
  const formatValueForDisplay = (path: string, value: string) => {
    if (path === "canProcessPostpaid" || path === "canProcessPrepaid") {
      return value.toLowerCase() === "true" ? "Yes" : "No"
    }
    return value
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[600px] max-w-4xl  rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Request Vendor Changes</h2>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh]">
          <div className="flex flex-col px-6 pb-6 pt-6">
            {/* Header Message */}
            <div className="mb-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Request Changes for {vendorName}</h3>
              <p className="text-sm text-gray-600">
                Submit a change request for vendor details. Changes will require approval.
              </p>
            </div>

            {/* Changes Form */}
            <div className="space-y-4">
              {/* Changes List */}
              <div className="space-y-3">
                {changes.map((change, index) => (
                  <div key={index} className="flex gap-3">
                    {/* Path Dropdown */}
                    <div className="flex-1">
                      <FormSelectModule
                        label="Field to Change"
                        name={`change-${index}-path`}
                        value={change.path}
                        onChange={(e) => {
                          const value = typeof e === "object" && "target" in e ? e.target.value : e
                          handleChangeUpdate(index, "path", value as string)
                        }}
                        options={[{ value: "", label: "Select field to change" }, ...vendorPathOptions]}
                        required
                        disabled={isLoading}
                        error={errors[`change-${index}-path`]}
                        className="mb-0"
                      />
                    </div>

                    {/* Value Input */}
                    <div className="flex-1">
                      <FormInputModule
                        label="New Value"
                        type="text"
                        name={`change-${index}-value`}
                        placeholder={
                          change.path === "canProcessPostpaid" || change.path === "canProcessPrepaid"
                            ? "true or false"
                            : change.path === "commission"
                            ? "e.g., 2.5"
                            : "New value"
                        }
                        value={change.value}
                        onChange={(e) => handleChangeUpdate(index, "value", e.target.value)}
                        required
                        disabled={isLoading}
                        error={errors[`change-${index}-value`]}
                        className="mb-0"
                      />
                      {(change.path === "canProcessPostpaid" || change.path === "canProcessPrepaid") && (
                        <p className="mt-1 text-xs text-gray-500">
                          Enter &apos;true&apos; for Yes or &apos;false&apos; for No
                        </p>
                      )}
                      {change.path === "commission" && (
                        <p className="mt-1 text-xs text-gray-500">Enter commission percentage (e.g., 2.5 for 2.5%)</p>
                      )}
                    </div>

                    {/* Remove Button */}
                    {changes.length > 1 && (
                      <div className="flex items-end pb-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveChange(index)}
                          className="flex size-10 items-center justify-center rounded-md border border-gray-300 text-gray-400 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                          disabled={isLoading}
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Another Change Button */}
              <button
                type="button"
                onClick={handleAddChange}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add another change
              </button>

              {/* Comment Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reason for Changes <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder="Explain why these changes are needed..."
                    rows={4}
                    className={`
                      w-full rounded-md border px-3 py-2 text-sm
                      ${errors.comment ? "border-[#D14343]" : "border-[#E0E0E0]"}
                      bg-[#F9F9F9] transition-all duration-200 focus:bg-[#FBFAFC] focus:outline-none
                      focus:ring-2
                      focus:ring-[#0a0a0a] disabled:bg-gray-100
                    `}
                    disabled={isLoading}
                  />
                  {errors.comment && <p className="mt-1 text-xs text-[#D14343]">{errors.comment}</p>}
                </div>
              </div>

              {/* Preview Section */}
              {changes.some((change) => change.path && change.value) && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Change Preview</h4>
                  <div className="space-y-2 text-sm">
                    {changes
                      .filter((change) => change.path && change.value)
                      .map((change, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-600">{getPathLabel(change.path)}:</span>
                          <span className="font-medium text-gray-900">
                            {formatValueForDisplay(change.path, change.value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={handleClose} disabled={isLoading}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="lg" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Change Request"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default VendorChangeRequestModal
