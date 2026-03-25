"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { notify } from "components/ui/Notification/Notification"
import {
  clearCustomerContractAdjustmentStatus,
  type CustomerContractAdjustmentRequest,
  createCustomerContractAdjustment,
} from "lib/redux/postpaidSlice"

interface ContractAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: number
  customerName?: string
  customerAccountNumber?: string
}

type FormErrors = {
  [K in keyof CustomerContractAdjustmentRequest]?: string
}

const ContractAdjustmentModal: React.FC<ContractAdjustmentModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  customerAccountNumber,
}) => {
  const dispatch = useAppDispatch()
  const { customerContractAdjustmentLoading, customerContractAdjustmentError, customerContractAdjustmentSuccess } =
    useAppSelector((state) => state.postpaidBilling)

  const [formData, setFormData] = useState<CustomerContractAdjustmentRequest>({
    customerId,
    amount: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    description: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required"
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required"
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CustomerContractAdjustmentRequest, value: string | number) => {
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
      const result = await dispatch(createCustomerContractAdjustment(formData))

      if (result.meta.requestStatus === "fulfilled") {
        notify("success", "Contract adjustment created successfully!", {
          duration: 3000,
        })
        onClose()
        // Reset form
        setFormData({
          customerId,
          amount: 0,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          description: "",
        })
      }
    } catch (error) {
      console.error("Error creating contract adjustment:", error)
    }
  }

  const handleClose = () => {
    if (!customerContractAdjustmentLoading) {
      dispatch(clearCustomerContractAdjustmentStatus())
      onClose()
      setErrors({})
      setFormData({
        customerId,
        amount: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        description: "",
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
      onClick={handleClose}
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
          <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">Create Contract Adjustment</h2>
          <button
            onClick={handleClose}
            className="flex size-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-8"
            disabled={customerContractAdjustmentLoading}
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="max-h-[80vh]">
          <div className="flex flex-col gap-4 px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="mb-2 w-full text-center">
              <h3 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
                {customerName || `Customer ID: ${customerId}`}
              </h3>
              <p className="text-xs text-gray-600 sm:text-sm">Account: {customerAccountNumber || "N/A"}</p>
            </div>

            <p className="text-xs text-gray-500 sm:text-sm">
              Create a contract adjustment for this customer. This will apply a recurring adjustment amount for the
              specified period.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormInputModule
                label="Adjustment Amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
                disabled={customerContractAdjustmentLoading}
                error={errors.amount}
                className="sm:col-span-2"
              />

              <FormInputModule
                label="Start Date"
                name="startDate"
                type="datetime-local"
                value={formatDateTimeLocal(formData.startDate)}
                onChange={(e) => handleInputChange("startDate", new Date(e.target.value).toISOString())}
                required
                disabled={customerContractAdjustmentLoading}
                error={errors.startDate}
                className="sm:col-span-2"
                placeholder={""}
              />

              <FormInputModule
                label="End Date"
                name="endDate"
                type="datetime-local"
                value={formatDateTimeLocal(formData.endDate)}
                onChange={(e) => handleInputChange("endDate", new Date(e.target.value).toISOString())}
                required
                disabled={customerContractAdjustmentLoading}
                error={errors.endDate}
                className="sm:col-span-2"
                placeholder={""}
              />

              <FormTextAreaModule
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter description for the contract adjustment"
                required
                disabled={customerContractAdjustmentLoading}
                error={errors.description}
                rows={3}
                className="sm:col-span-2"
              />
            </div>

            {/* Error Message */}
            {customerContractAdjustmentError && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-600">{customerContractAdjustmentError}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full gap-3 border-t border-gray-200 bg-gray-50 p-4 sm:px-6 sm:py-4">
          <ButtonModule
            onClick={handleClose}
            variant="secondary"
            className="flex w-full text-sm sm:text-base"
            size="md"
            type="button"
            disabled={customerContractAdjustmentLoading}
          >
            Cancel
          </ButtonModule>
          <form onSubmit={handleSubmit} className="flex w-full">
            <ButtonModule
              variant="primary"
              className="flex w-full text-sm sm:text-base"
              size="md"
              type="submit"
              disabled={customerContractAdjustmentLoading}
            >
              {customerContractAdjustmentLoading ? "Creating..." : "Create Adjustment"}
            </ButtonModule>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ContractAdjustmentModal
