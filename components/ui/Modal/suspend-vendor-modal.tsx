"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { suspendVendor, clearVendorSuspend } from "lib/redux/vendorSlice"

interface SuspendVendorModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
  vendorId: number
  vendorName: string
}

const SuspendVendorModal: React.FC<SuspendVendorModalProps> = ({
  isOpen,
  onRequestClose,
  onSuccess,
  vendorId,
  vendorName,
}) => {
  const dispatch = useAppDispatch()
  const { vendorSuspendLoading, vendorSuspendError, vendorSuspendSuccess } = useAppSelector((state) => state.vendors)

  const [suspensionReason, setSuspensionReason] = useState("")
  const [customReason, setCustomReason] = useState("")

  // Predefined suspension reasons
  const suspensionReasons = [
    { value: "violation_terms", label: "Violation of terms of service" },
    { value: "fraudulent_activity", label: "Fraudulent activity detected" },
    { value: "non_performance", label: "Poor performance or non-performance" },
    { value: "complaints", label: "Multiple customer complaints" },
    { value: "security_breach", label: "Security breach or data compromise" },
    { value: "payment_issues", label: "Payment or financial issues" },
    { value: "regulatory", label: "Regulatory compliance issues" },
    { value: "other", label: "Other (specify below)" },
  ]

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSuspensionReason("")
      setCustomReason("")
      dispatch(clearVendorSuspend())
    }
  }, [isOpen, dispatch])

  // Handle success state
  useEffect(() => {
    if (vendorSuspendSuccess) {
      notify("success", "Vendor suspended successfully", {
        description: `${vendorName} has been suspended from the platform.`,
        duration: 5000,
      })
      onRequestClose()
      if (onSuccess) {
        onSuccess()
      }
    }
  }, [vendorSuspendSuccess, vendorName, onRequestClose, onSuccess])

  // Handle errors
  useEffect(() => {
    if (vendorSuspendError) {
      notify("error", "Failed to suspend vendor", {
        description: vendorSuspendError,
        duration: 6000,
      })
    }
  }, [vendorSuspendError])

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSuspensionReason(e.target.value)
    // Clear custom reason when switching to a predefined reason
    if (e.target.value !== "other") {
      setCustomReason("")
    }
  }

  const handleCustomReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomReason(e.target.value)
  }

  const handleSubmit = async () => {
    try {
      let finalReason = ""

      if (suspensionReason === "other") {
        if (!customReason.trim()) {
          notify("error", "Reason required", {
            description: "Please provide a reason for suspension",
            duration: 4000,
          })
          return
        }
        finalReason = customReason.trim()
      } else {
        const selectedReason = suspensionReasons.find((reason) => reason.value === suspensionReason)
        finalReason = selectedReason?.label || suspensionReason
      }

      await dispatch(suspendVendor({ id: vendorId, reason: finalReason })).unwrap()
    } catch (error) {
      console.error("Failed to suspend vendor:", error)
      // Error is handled by the useEffect above
    }
  }

  const isFormValid = () => {
    if (suspensionReason === "other") {
      return customReason.trim().length > 0
    }
    return suspensionReason.length > 0
  }

  const getSelectedReasonLabel = () => {
    if (suspensionReason === "other") {
      return customReason || "Other reason"
    }
    const selected = suspensionReasons.find((reason) => reason.value === suspensionReason)
    return selected?.label || ""
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
        className="relative w-[550px] max-w-2xl  rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Suspend Vendor</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={vendorSuspendLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] ">
          <div className="flex flex-col px-6 pb-6 pt-6">
            {/* Warning Icon and Header */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <svg className="size-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Confirm Vendor Suspension</h3>
            <p className="mb-6 text-center text-gray-600">
              Are you sure you want to suspend <strong>{vendorName}</strong>'s account?
            </p>

            {/* Suspension Details */}

            {/* Suspension Reason Selection */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[#2a2f4b]">
                  Reason for Suspension
                  <span className="text-red-500"> *</span>
                </label>
                <div
                  className={`
                    rounded-md border px-3 py-2
                    ${vendorSuspendLoading ? "bg-gray-100" : "bg-[#F9F9F9]"}
                    border-[#E0E0E0]
                  `}
                >
                  <textarea
                    name="suspensionReason"
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Please provide the reason for suspension..."
                    className="h-24 w-full resize-none bg-transparent text-base outline-none disabled:cursor-not-allowed disabled:text-gray-500"
                    required
                    disabled={vendorSuspendLoading}
                  />
                </div>
              </div>

              {/* Custom Reason Input */}
              {suspensionReason === "other" && (
                <div>
                  <FormInputModule
                    id="customReason"
                    name="customReason"
                    type="text"
                    placeholder="Please provide the reason for suspension..."
                    value={customReason}
                    onChange={handleCustomReasonChange}
                    disabled={vendorSuspendLoading}
                    required
                    label={"Specify Reason"}
                  />
                </div>
              )}

              {/* Reason Summary */}
              {isFormValid() && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-700">Suspension Summary</h4>
                  <div className="mt-2 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Vendor:</span>
                      <span className="font-medium">{vendorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reason:</span>
                      <span className="font-medium text-red-600">{getSelectedReasonLabel()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Action:</span>
                      <span className="font-medium text-red-600">Immediate Suspension</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-lg bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <svg className="size-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Suspension Effects</h4>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-700">
                      <li>Vendor will not be able to process any transactions</li>
                      <li>API access will be temporarily disabled</li>
                      <li>Vendor dashboard access will be restricted</li>
                      <li>All active services will be paused</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule
            variant="secondary"
            className="flex-1"
            size="lg"
            onClick={onRequestClose}
            disabled={vendorSuspendLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="danger"
            className="flex-1"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormValid() || vendorSuspendLoading}
            loading={vendorSuspendLoading}
          >
            {vendorSuspendLoading ? "Suspending..." : "Suspend Vendor"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SuspendVendorModal
