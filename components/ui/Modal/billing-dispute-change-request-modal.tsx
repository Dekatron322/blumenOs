"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"
import { createChangeRequest } from "lib/redux/billingDisputeSlice"
import { FormInputModule } from "../Input/Input"

interface ChangeItem {
  path: string
  value: string
}

interface BillingDisputeChangeRequestModalProps {
  isOpen: boolean
  onRequestClose: () => void
  disputeId: number
  disputeLabel: string
  onSuccess?: () => void
}

const PATH_OPTIONS = [
  { value: "status", label: "Status" },
  { value: "resolutionNotes", label: "Resolution Notes" },
  { value: "reason", label: "Reason" },
  { value: "details", label: "Details" },
]

const STATUS_OPTIONS = [
  { value: "0", label: "Pending" },
  { value: "1", label: "Under Review" },
  { value: "2", label: "Resolved" },
  { value: "3", label: "Rejected" },
]

export const BillingDisputeChangeRequestModal: React.FC<BillingDisputeChangeRequestModalProps> = ({
  isOpen,
  onRequestClose,
  disputeId,
  disputeLabel,
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
    setErrors({})
  }

  const handleRemoveChange = (index: number) => {
    if (changes.length > 1) {
      setChanges(changes.filter((_, i) => i !== index))
      setErrors({})
    }
  }

  const handleChangeUpdate = (index: number, field: keyof ChangeItem, value: string) => {
    setChanges((prevChanges) => prevChanges.map((change, i) => (i === index ? { ...change, [field]: value } : change)))

    if (errors[`change-${index}-${field}`]) {
      const newErrors = { ...errors }
      delete newErrors[`change-${index}-${field}`]
      setErrors(newErrors)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    changes.forEach((change, index) => {
      if (!change.path) {
        newErrors[`change-${index}-path`] = "Please select a field to change"
      }
      if (!change.value.trim()) {
        newErrors[`change-${index}-value`] = "Please enter a new value"
      }
    })

    if (!comment.trim()) {
      newErrors.comment = "Please provide a reason for the changes"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setChanges([{ path: "", value: "" }])
    setComment("")
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onRequestClose()
  }

  const getPathLabel = (pathValue: string) => {
    return PATH_OPTIONS.find((opt) => opt.value === pathValue)?.label || pathValue
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)

      const validChanges = changes.filter((change) => change.path && change.value.trim())
      const changeRequestData = {
        changes: validChanges,
        comment: comment.trim(),
      }

      const result = await dispatch(
        createChangeRequest({
          id: disputeId,
          request: changeRequestData,
        })
      )

      if (createChangeRequest.fulfilled.match(result)) {
        const successMessage =
          (result.payload as { message?: string } | undefined)?.message ||
          "Change request submitted and pending approval."

        notify("success", successMessage)
        onSuccess?.()
        resetForm()
        onRequestClose()
      } else {
        throw new Error(result.payload as string)
      }
    } catch (error: any) {
      console.error("Failed to submit change request:", error)
      notify("error", error.message || "Failed to submit change request")
    } finally {
      setIsLoading(false)
    }
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
        className="relative w-[650px] max-w-4xl rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Request Dispute Changes</h2>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] p-6">
          <div className="mb-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Request Changes for {disputeLabel}</h3>
            <p className="text-sm text-gray-600">
              Submit a change request for this billing dispute. Changes require approval.
            </p>
          </div>

          <div className="space-y-4">
            {changes.map((change, index) => (
              <ChangeRow
                key={index}
                index={index}
                change={change}
                errors={errors}
                isLoading={isLoading}
                onUpdate={handleChangeUpdate}
                onRemove={handleRemoveChange}
                showRemove={changes.length > 1}
              />
            ))}

            <button
              type="button"
              onClick={handleAddChange}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              disabled={isLoading}
            >
              <PlusIcon />
              Add another change
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reason for Changes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value)
                  if (errors.comment) {
                    setErrors({ ...errors, comment: "" })
                  }
                }}
                placeholder="Explain why these changes are needed..."
                rows={4}
                className={`w-full rounded-md border px-3 py-2 text-sm ${
                  errors.comment ? "border-red-500" : "border-gray-300"
                } bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-100`}
                disabled={isLoading}
              />
              {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment}</p>}
            </div>

            {changes.some((change) => change.path && change.value) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">Change Preview</h4>
                <div className="space-y-2 text-sm">
                  {changes
                    .filter((change) => change.path && change.value)
                    .map((change, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{getPathLabel(change.path)}:</span>
                        <span className="font-medium text-gray-900">{change.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="secondary" className="flex-1" onClick={handleClose} disabled={isLoading}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Change Request"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

const ChangeRow = ({
  index,
  change,
  errors,
  isLoading,
  onUpdate,
  onRemove,
  showRemove,
}: {
  index: number
  change: ChangeItem
  errors: { [key: string]: string }
  isLoading: boolean
  onUpdate: (index: number, field: keyof ChangeItem, value: string) => void
  onRemove: (index: number) => void
  showRemove: boolean
}) => (
  <div className="flex gap-3">
    <div className="flex-1">
      <FormSelectModule
        label="Field to Change"
        name={`change-${index}-path`}
        value={change.path}
        onChange={(e) => {
          const value = typeof e === "object" && "target" in e ? e.target.value : e
          onUpdate(index, "path", value as string)
          onUpdate(index, "value", "")
        }}
        options={[{ value: "", label: "Select field to change" }, ...PATH_OPTIONS]}
        required
        disabled={isLoading}
        error={errors[`change-${index}-path`]}
      />
    </div>

    <div className="flex-1">
      {change.path === "status" ? (
        <FormSelectModule
          label="New Value"
          name={`change-${index}-value`}
          value={change.value}
          onChange={(e) => {
            const value = typeof e === "object" && "target" in e ? e.target.value : e
            onUpdate(index, "value", value as string)
          }}
          options={[{ value: "", label: "Select status" }, ...STATUS_OPTIONS]}
          required
          disabled={isLoading}
          error={errors[`change-${index}-value`]}
        />
      ) : (
        <FormInputModule
          label="New Value"
          type="text"
          name={`change-${index}-value`}
          placeholder="New value"
          value={change.value}
          onChange={(e) => onUpdate(index, "value", e.target.value)}
          required
          disabled={isLoading}
          error={errors[`change-${index}-value`]}
        />
      )}
    </div>

    {showRemove && (
      <div className="flex items-end pb-1">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="flex size-10 items-center justify-center rounded-md border border-gray-300 text-gray-400 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-500"
          disabled={isLoading}
        >
          <CloseIcon />
        </button>
      </div>
    )}
  </div>
)

const CloseIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const PlusIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

export default BillingDisputeChangeRequestModal
