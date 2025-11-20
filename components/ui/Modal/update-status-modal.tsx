// components/ui/Modal/update-customer-modal.tsx
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormSelectModule } from "../Input/FormSelectModule"
import { notify } from "../Notification/Notification"

interface Customer {
  id: string
  accountNumber: string
  customerName: string
  customerType: "PREPAID" | "POSTPAID"
  serviceBand: string
  tariffClass: string
  region: string
  businessUnit: string
  feederId: string | null
  transformerId: string | null
  address: string
  phoneNumber: string
  email: string
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  outstandingArrears: string
  createdAt: string
  updatedAt: string
  meters: any[]
  prepaidAccount: any | null
  postpaidAccount: any | null
}

interface UpdateCustomerModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
  customer: Customer | null
}

const UpdateCustomerModal: React.FC<UpdateCustomerModalProps> = ({ isOpen, onRequestClose, onSuccess, customer }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    serviceBand: "",
    tariffClass: "",
    status: "" as "ACTIVE" | "INACTIVE" | "SUSPENDED" | "",
  })

  // Initialize form with customer data when modal opens or customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        serviceBand: customer.serviceBand || "",
        tariffClass: customer.tariffClass || "",
        status: customer.status || "",
      })
    }
  }, [customer])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    const valueStr = typeof value === "number" ? String(value) : value
    setFormData((prev) => ({
      ...prev,
      [name]: valueStr,
    }))
  }

  const handleSubmit = async () => {
    if (!customer) {
      notify("error", "No customer selected", {
        description: "Please select a customer to update",
        duration: 4000,
      })
      return
    }

    // Validate that at least one field is changed
    const hasChanges =
      formData.serviceBand !== customer.serviceBand ||
      formData.tariffClass !== customer.tariffClass ||
      formData.status !== customer.status

    if (!hasChanges) {
      notify("warning", "No changes made", {
        description: "Please update at least one field before submitting",
        duration: 4000,
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Frontend-only success
      notify("success", "Customer updated successfully", {
        description: `${customer.customerName}'s information has been updated`,
        duration: 5000,
      })

      onRequestClose()
      if (onSuccess) onSuccess()
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return formData.serviceBand && formData.tariffClass && formData.status
  }

  const hasChanges = customer
    ? formData.serviceBand !== customer.serviceBand ||
      formData.tariffClass !== customer.tariffClass ||
      formData.status !== customer.status
    : false

  // Options for dropdowns
  const serviceBandOptions = [
    { value: "", label: "Select service band" },
    { value: "A", label: "Band A" },
    { value: "B", label: "Band B" },
    { value: "C", label: "Band C" },
    { value: "D", label: "Band D" },
    { value: "E", label: "Band E" },
  ]

  const tariffClassOptions = [
    { value: "", label: "Select tariff class" },
    { value: "T1", label: "T1 - Residential" },
    { value: "T2", label: "T2 - Commercial" },
    { value: "T3", label: "T3 - Industrial" },
    { value: "T4", label: "T4 - Special Load" },
  ]

  const statusOptions = [
    { value: "", label: "Select status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
  ]

  if (!isOpen || !customer) return null

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
        className="relative w-[600px] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Update Customer</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="p-6">
            {/* Customer Information Header */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h3 className="text-lg font-semibold text-gray-900">{customer.customerName}</h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Account Number:</span> {customer.accountNumber}
                </div>
                <div>
                  <span className="font-medium">Customer Type:</span> {customer.customerType}
                </div>
                <div>
                  <span className="font-medium">Region:</span> {customer.region}
                </div>
                <div>
                  <span className="font-medium">Business Unit:</span> {customer.businessUnit}
                </div>
              </div>
            </div>

            {/* Update Fields */}
            <div className="grid grid-cols-2 gap-6">
              <FormSelectModule
                label="Service Band"
                name="serviceBand"
                value={formData.serviceBand}
                onChange={handleInputChange}
                options={serviceBandOptions}
                required
              />

              <FormSelectModule
                label="Tariff Class"
                name="tariffClass"
                value={formData.tariffClass}
                onChange={handleInputChange}
                options={tariffClassOptions}
                required
              />

              <FormSelectModule
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={statusOptions}
                required
                className="col-span-2"
              />
            </div>

            {/* Current Values Display */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-[#F9F9F9] p-4">
              <h4 className="mb-3 text-sm font-medium text-gray-900">Current Values</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Service Band:</span>
                  <div className="font-medium text-gray-900">{customer.serviceBand}</div>
                </div>
                <div>
                  <span className="text-gray-600">Tariff Class:</span>
                  <div className="font-medium text-gray-900">{customer.tariffClass}</div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div
                    className={`font-medium ${
                      customer.status === "ACTIVE"
                        ? "text-green-600"
                        : customer.status === "INACTIVE"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {customer.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule
            variant="dangerSecondary"
            className="flex-1"
            size="lg"
            onClick={onRequestClose}
            disabled={isSubmitting}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex-1"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormValid() || !hasChanges || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Customer"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default UpdateCustomerModal
