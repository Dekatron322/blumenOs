"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { notify } from "components/ui/Notification/Notification"
import { createVatOverride } from "lib/redux/customerSlice"
import type { Customer, VatOverrideRequest } from "lib/redux/customerSlice"

interface VatOverrideModalProps {
  isOpen: boolean
  onRequestClose: () => void
  customerId: number
  customerName: string
  accountNumber: string
  currentCustomer?: Customer
}

type FormErrors = {
  [K in keyof VatOverrideRequest]?: string
}

const VatOverrideModal: React.FC<VatOverrideModalProps> = ({
  isOpen,
  onRequestClose,
  customerId,
  customerName,
  accountNumber,
  currentCustomer,
}) => {
  const dispatch = useAppDispatch()
  const { vatOverrideLoading, vatOverrideSuccess } = useAppSelector((state) => state.customers)

  const [formData, setFormData] = useState<VatOverrideRequest>({
    vatRateOverride: 0,
    isVatWaived: false,
    effectiveFromUtc: new Date().toISOString(),
    effectiveToUtc: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    reason: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.isVatWaived && (!formData.vatRateOverride || formData.vatRateOverride < 0)) {
      newErrors.vatRateOverride = "VAT rate must be 0 or greater"
    }

    if (!formData.effectiveFromUtc) {
      newErrors.effectiveFromUtc = "Effective from date is required"
    }

    if (!formData.effectiveToUtc) {
      newErrors.effectiveToUtc = "Effective to date is required"
    }

    if (new Date(formData.effectiveFromUtc) >= new Date(formData.effectiveToUtc)) {
      newErrors.effectiveToUtc = "Effective to date must be after effective from date"
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof VatOverrideRequest, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const result = await dispatch(
        createVatOverride({
          id: customerId,
          overrideData: formData,
        })
      )

      if (result.meta.requestStatus === "fulfilled") {
        notify("success", "VAT override created successfully!", {
          duration: 3000,
        })
        onRequestClose()
        // Reset form
        setFormData({
          vatRateOverride: 0,
          isVatWaived: false,
          effectiveFromUtc: new Date().toISOString(),
          effectiveToUtc: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          reason: "",
        })
      }
    } catch (error) {
      console.error("Error creating VAT override:", error)
    }
  }

  const handleClose = () => {
    if (!vatOverrideLoading) {
      onRequestClose()
      setErrors({})
      setFormData({
        vatRateOverride: 0,
        isVatWaived: false,
        effectiveFromUtc: new Date().toISOString(),
        effectiveToUtc: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        reason: "",
      })
    }
  }

  const formatDateTimeLocal = (isoString: string): string => {
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-3 backdrop-blur-sm sm:px-4"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-md rounded-lg bg-white shadow-2xl sm:max-w-lg md:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:px-6 sm:py-5">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">Create VAT Override</h2>
          <button
            onClick={handleClose}
            className="flex size-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-8"
            disabled={vatOverrideLoading}
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="max-h-[80vh]">
          <div className="flex flex-col gap-4 px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="mb-2 w-full text-center">
              <h3 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">{customerName}</h3>
              <p className="text-xs text-gray-600 sm:text-sm">Account: {accountNumber}</p>
              {currentCustomer?.currentVatOverride && (
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Current VAT Rate: {currentCustomer.currentVatOverride.vatRateOverride}%
                  {currentCustomer.currentVatOverride.isVatWaived && " (Waived)"}
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500 sm:text-sm">
              Create a temporary VAT override for this customer. This will override the standard VAT rate for the
              specified period.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormSelectModule
                label="VAT Status"
                name="isVatWaived"
                value={formData.isVatWaived ? "true" : "false"}
                onChange={(e) => {
                  const isWaived = e.target.value === "true"
                  handleInputChange("isVatWaived", isWaived)
                  if (isWaived) {
                    handleInputChange("vatRateOverride", 0)
                  }
                }}
                options={[
                  { value: "false", label: "Apply Custom VAT Rate" },
                  { value: "true", label: "Waive VAT (0%)" },
                ]}
                required
                disabled={vatOverrideLoading}
                className="sm:col-span-2"
              />

              {!formData.isVatWaived && (
                <FormInputModule
                  label="VAT Rate Override (%)"
                  name="vatRateOverride"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.vatRateOverride}
                  onChange={(e) => handleInputChange("vatRateOverride", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required={!formData.isVatWaived}
                  disabled={vatOverrideLoading || formData.isVatWaived}
                  error={errors.vatRateOverride}
                  className="sm:col-span-2"
                />
              )}

              <FormInputModule
                label="Effective From"
                name="effectiveFromUtc"
                type="datetime-local"
                value={formatDateTimeLocal(formData.effectiveFromUtc)}
                onChange={(e) => handleInputChange("effectiveFromUtc", new Date(e.target.value).toISOString())}
                required
                disabled={vatOverrideLoading}
                error={errors.effectiveFromUtc}
                placeholder={""}
              />

              <FormInputModule
                label="Effective To"
                name="effectiveToUtc"
                type="datetime-local"
                value={formatDateTimeLocal(formData.effectiveToUtc)}
                onChange={(e) => handleInputChange("effectiveToUtc", new Date(e.target.value).toISOString())}
                required
                disabled={vatOverrideLoading}
                error={errors.effectiveToUtc}
                placeholder={""}
              />

              <FormTextAreaModule
                label="Reason for Override"
                name="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Please provide a reason for this VAT override"
                required
                disabled={vatOverrideLoading}
                error={errors.reason}
                className="sm:col-span-2"
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:gap-4 sm:px-6 sm:py-5"
        >
          <ButtonModule
            variant="secondary"
            className="flex w-full text-sm sm:text-base"
            size="md"
            onClick={handleClose}
            disabled={vatOverrideLoading}
          >
            Cancel
          </ButtonModule>

          <ButtonModule
            variant="primary"
            className="flex w-full text-sm sm:text-base"
            size="md"
            type="submit"
            disabled={vatOverrideLoading}
          >
            {vatOverrideLoading ? "Creating..." : "Create Override"}
          </ButtonModule>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default VatOverrideModal
