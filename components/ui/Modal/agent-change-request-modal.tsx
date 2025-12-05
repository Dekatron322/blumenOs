"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { submitChangeRequest } from "lib/redux/agentSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { FormSelectModule } from "../Input/FormSelectModule"
import { FormInputModule } from "../Input/Input"

interface ChangeRequestModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm?: () => void
  agentId: number
  agentName: string
  agentCode: string
  onSuccess?: () => void
}

interface ChangeItem {
  path: string
  value: string
}

// Define path options specific to Agent fields
const pathOptions = [
  { value: "status", label: "Status" },
  { value: "canCollectCash", label: "Can Collect Cash" },
  { value: "cashCollectionLimit", label: "Cash Collection Limit" },
  { value: "areaOfficeId", label: "Area Office" },
  { value: "serviceCenterId", label: "Service Center" },
  { value: "employeeId", label: "Employee ID" },
  { value: "position", label: "Position" },
  { value: "employmentType", label: "Employment Type" },
  { value: "emergencyContact", label: "Emergency Contact" },
  { value: "supervisorId", label: "Supervisor" },
]

// Define status options for agent status field
const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "TERMINATED", label: "Terminated" },
]

// Define employment type options
const employmentTypeOptions = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Intern" },
]

// Define boolean options for canCollectCash
const booleanOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
]

const ChangeRequestModal: React.FC<ChangeRequestModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  agentId,
  agentName,
  agentCode,
  onSuccess,
}) => {
  const dispatch = useAppDispatch()
  const { areaOffices, loading: areaOfficesLoading } = useAppSelector((state) => state.areaOffices)
  const [isLoading, setIsLoading] = useState(false)
  const [changes, setChanges] = useState<ChangeItem[]>([{ path: "", value: "" }])
  const [comment, setComment] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (isOpen) {
      dispatch(
        fetchAreaOffices({
          PageNumber: 1,
          PageSize: 100,
        })
      )
    }

    return () => {
      dispatch(clearAreaOffices())
    }
  }, [isOpen, dispatch])

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

  const handlePathChange = (index: number, value: string) => {
    setChanges((prevChanges) =>
      prevChanges.map((change, i) => {
        if (i === index) {
          return { ...change, path: value, value: "" }
        }
        return change
      })
    )

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      if (newErrors[`change-${index}-path`]) {
        delete newErrors[`change-${index}-path`]
      }
      if (newErrors[`change-${index}-value`]) {
        delete newErrors[`change-${index}-value`]
      }
      return newErrors
    })
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

      // Convert values to appropriate types based on path
      const formattedChanges = validChanges.map((change) => {
        let formattedValue = change.value

        // Handle boolean values
        if (change.path === "canCollectCash") {
          formattedValue = change.value === "true" ? "true" : "false"
        }

        // Handle numeric values
        if (
          change.path === "cashCollectionLimit" ||
          change.path === "areaOfficeId" ||
          change.path === "serviceCenterId" ||
          change.path === "supervisorId"
        ) {
          // Ensure it's a valid number
          const numValue = parseFloat(change.value)
          if (!isNaN(numValue)) {
            formattedValue = numValue.toString()
          }
        }

        return {
          path: change.path,
          value: formattedValue,
        }
      })

      const changeRequestData = {
        changes: formattedChanges,
        comment: comment.trim(),
      }

      // Submit the change request
      const result = await dispatch(
        submitChangeRequest({
          id: agentId,
          changeRequestData,
        })
      )

      if (submitChangeRequest.fulfilled.match(result)) {
        notify("success", `Change request for ${agentName} (${agentCode}) has been submitted successfully`)
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
    const option = pathOptions.find((opt) => opt.value === pathValue)
    return option ? option.label : pathValue
  }

  const getValueOptions = (path: string) => {
    switch (path) {
      case "status":
        return statusOptions
      case "canCollectCash":
        return booleanOptions
      case "employmentType":
        return employmentTypeOptions
      default:
        return undefined
    }
  }

  const getInputType = (path: string) => {
    switch (path) {
      case "cashCollectionLimit":
      case "areaOfficeId":
      case "serviceCenterId":
      case "supervisorId":
        return "number"
      default:
        return "text"
    }
  }

  const getPlaceholder = (path: string) => {
    switch (path) {
      case "cashCollectionLimit":
        return "Enter amount (e.g., 50000)"
      case "areaOfficeId":
      case "serviceCenterId":
      case "supervisorId":
        return "Enter ID number"
      case "employeeId":
        return "Enter employee ID"
      case "position":
        return "Enter position title"
      case "emergencyContact":
        return "Enter emergency contact phone"
      case "address":
        return "Enter address"
      default:
        return "Enter new value"
    }
  }

  const renderValueInput = (change: ChangeItem, index: number) => {
    if (change.path === "areaOfficeId") {
      const areaOfficeOptions = [
        {
          value: "",
          label: areaOfficesLoading ? "Loading area offices..." : "Select area office",
        },
        ...areaOffices.map((areaOffice) => ({
          value: areaOffice.id.toString(),
          label: `${areaOffice.nameOfNewOAreaffice} (${areaOffice.newKaedcoCode})`,
        })),
      ]

      return (
        <div className="flex-1">
          <FormSelectModule
            label="New Area Office"
            name={`change-${index}-value`}
            value={change.value}
            onChange={(e) => {
              const value = typeof e === "object" && "target" in e ? e.target.value : e
              handleChangeUpdate(index, "value", value as string)
            }}
            options={areaOfficeOptions}
            required
            disabled={isLoading || areaOfficesLoading}
            error={errors[`change-${index}-value`]}
            className="mb-0"
          />
        </div>
      )
    }

    const options = getValueOptions(change.path)

    if (options) {
      return (
        <div className="flex-1">
          <FormSelectModule
            label="New Value"
            name={`change-${index}-value`}
            value={change.value}
            onChange={(e) => {
              const value = typeof e === "object" && "target" in e ? e.target.value : e
              handleChangeUpdate(index, "value", value as string)
            }}
            options={[{ value: "", label: "Select value" }, ...options]}
            required
            disabled={isLoading}
            error={errors[`change-${index}-value`]}
            className="mb-0"
          />
        </div>
      )
    }

    return (
      <div className="flex-1">
        <FormInputModule
          label="New Value"
          type={getInputType(change.path)}
          name={`change-${index}-value`}
          placeholder={getPlaceholder(change.path)}
          value={change.value}
          onChange={(e) => handleChangeUpdate(index, "value", e.target.value)}
          required
          disabled={isLoading}
          error={errors[`change-${index}-value`]}
          className="mb-0"
          min={change.path === "cashCollectionLimit" ? "0" : undefined}
          step={change.path === "cashCollectionLimit" ? "0.01" : "1"}
        />
      </div>
    )
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
        className="relative w-[650px] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Request Changes for Agent</h2>
            <p className="mt-1 text-sm text-gray-600">
              {agentName} ({agentCode})
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col px-6 pb-6 pt-6">
            {/* Header Message */}
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Submit Change Request</h3>
              <p className="text-sm text-gray-600">
                Submit a change request for agent details. All changes will require approval before being applied.
              </p>
            </div>

            {/* Changes Form */}
            <div className="space-y-4">
              {/* Changes List */}
              <div className="space-y-4">
                {changes.map((change, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Change #{index + 1}</span>
                      {changes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChange(index)}
                          className="flex size-6 items-center justify-center rounded-md text-gray-400 transition-all hover:text-red-500"
                          disabled={isLoading}
                          title="Remove this change"
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
                      )}
                    </div>

                    <div className="flex gap-3">
                      {/* Path Dropdown */}
                      <div className="flex-1">
                        <FormSelectModule
                          label="Field to Change"
                          name={`change-${index}-path`}
                          value={change.path}
                          onChange={(e) => {
                            const value = typeof e === "object" && "target" in e ? e.target.value : e
                            handlePathChange(index, value as string)
                          }}
                          options={[{ value: "", label: "Select field to change" }, ...pathOptions]}
                          required
                          disabled={isLoading}
                          error={errors[`change-${index}-path`]}
                          className="mb-0"
                        />
                      </div>

                      {/* Value Input or Dropdown */}
                      {renderValueInput(change, index)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another Change Button */}
              <button
                type="button"
                onClick={handleAddChange}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-700"
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
                    placeholder="Explain why these changes are needed. Provide any relevant context or supporting information..."
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
                <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Change Request Preview
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {changes
                        .filter((change) => change.path && change.value)
                        .map((change, index) => (
                          <div key={index} className="rounded bg-white p-3">
                            <div className="mb-1 text-xs font-medium text-gray-500">{getPathLabel(change.path)}</div>
                            <div className="font-medium text-gray-900">
                              {change.path === "canCollectCash"
                                ? change.value === "true"
                                  ? "Yes"
                                  : "No"
                                : change.value}
                            </div>
                          </div>
                        ))}
                    </div>
                    {comment && (
                      <div className="mt-3 rounded bg-white p-3">
                        <div className="mb-1 text-xs font-medium text-gray-500">Reason</div>
                        <div className="text-gray-900">{comment}</div>
                      </div>
                    )}
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

export default ChangeRequestModal
