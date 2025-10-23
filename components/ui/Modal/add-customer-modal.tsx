// components/ui/Modal/add-customer-modal.tsx
"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"

import { useAddCustomerMutation } from "lib/redux/customerSlice"
import { FormSelectModule } from "../Input/FormSelectModule"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { notify } from "../Notification/Notification"

interface AddCustomerModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onRequestClose, onSuccess }) => {
  const [addCustomer, { isLoading, error }] = useAddCustomerMutation()
  const [formData, setFormData] = useState({
    accountNumber: "",
    customerName: "",
    customerType: "" as "PREPAID" | "POSTPAID" | "",
    serviceBand: "",
    tariffClass: "",
    region: "",
    businessUnit: "",
    address: "",
    phoneNumber: "",
    email: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.accountNumber.trim()) {
      errors.accountNumber = "Account number is required"
    }

    if (!formData.customerName.trim()) {
      errors.customerName = "Customer name is required"
    }

    if (!formData.customerType) {
      errors.customerType = "Customer type is required"
    }

    if (!formData.serviceBand.trim()) {
      errors.serviceBand = "Service band is required"
    }

    if (!formData.tariffClass.trim()) {
      errors.tariffClass = "Tariff class is required"
    }

    if (!formData.region.trim()) {
      errors.region = "Region is required"
    }

    if (!formData.businessUnit.trim()) {
      errors.businessUnit = "Business unit is required"
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required"
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required"
    } else if (!/^(\+?234|0)[789][01]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      errors.phoneNumber = "Please enter a valid Nigerian phone number"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      const result = await addCustomer({
        accountNumber: formData.accountNumber,
        customerName: formData.customerName,
        customerType: formData.customerType as "PREPAID" | "POSTPAID",
        serviceBand: formData.serviceBand,
        tariffClass: formData.tariffClass,
        region: formData.region,
        businessUnit: formData.businessUnit,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        status: "ACTIVE", // Set to ACTIVE by default
      }).unwrap()

      console.log("Customer added successfully:", result)

      // Show success notification
      notify("success", "Customer created successfully", {
        description: `${formData.customerName} (${formData.accountNumber}) has been added to the system`,
        duration: 5000,
      })

      // Reset form
      setFormData({
        accountNumber: "",
        customerName: "",
        customerType: "",
        serviceBand: "",
        tariffClass: "",
        region: "",
        businessUnit: "",
        address: "",
        phoneNumber: "",
        email: "",
      })
      setFormErrors({})

      onRequestClose()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Failed to add customer:", error)

      // Extract error message from the API response
      const errorMessage = error?.data?.message || "An unexpected error occurred while adding the customer"

      // Show error notification
      notify("error", "Failed to add customer", {
        description: errorMessage,
        duration: 6000,
      })
    }
  }

  const isFormValid = () => {
    return (
      formData.accountNumber.trim() &&
      formData.customerName.trim() &&
      formData.customerType &&
      formData.serviceBand.trim() &&
      formData.tariffClass.trim() &&
      formData.region.trim() &&
      formData.businessUnit.trim() &&
      formData.address.trim() &&
      formData.phoneNumber.trim() &&
      formData.email.trim()
    )
  }

  // Options for dropdowns
  const customerTypeOptions = [
    { value: "", label: "Select customer type" },
    { value: "PREPAID", label: "Prepaid" },
    { value: "POSTPAID", label: "Postpaid" },
  ]

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

  const regionOptions = [
    { value: "", label: "Select region" },
    { value: "North", label: "North" },
    { value: "South", label: "South" },
    { value: "East", label: "East" },
    { value: "West", label: "West" },
    { value: "Central", label: "Central" },
  ]

  const businessUnitOptions = [
    { value: "", label: "Select business unit" },
    { value: "UnitA", label: "Unit A" },
    { value: "UnitB", label: "Unit B" },
    { value: "UnitC", label: "Unit C" },
    { value: "UnitD", label: "Unit D" },
  ]

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
        className="relative w-[800px] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="mt-6 grid grid-cols-2 gap-6 px-6 pb-6">
            {/* Account Information */}
            <FormInputModule
              label="Account Number"
              name="accountNumber"
              type="text"
              placeholder="Enter account number (e.g., ACC00123)"
              value={formData.accountNumber}
              onChange={handleInputChange}
              error={formErrors.accountNumber}
              required
            />

            <FormInputModule
              label="Customer Name"
              name="customerName"
              type="text"
              placeholder="Enter customer full name"
              value={formData.customerName}
              onChange={handleInputChange}
              error={formErrors.customerName}
              required
            />

            {/* Customer Type and Service Details */}
            <FormSelectModule
              label="Customer Type"
              name="customerType"
              value={formData.customerType}
              onChange={handleInputChange}
              options={customerTypeOptions}
              error={formErrors.customerType}
              required
            />

            <FormSelectModule
              label="Service Band"
              name="serviceBand"
              value={formData.serviceBand}
              onChange={handleInputChange}
              options={serviceBandOptions}
              error={formErrors.serviceBand}
              required
            />

            <FormSelectModule
              label="Tariff Class"
              name="tariffClass"
              value={formData.tariffClass}
              onChange={handleInputChange}
              options={tariffClassOptions}
              error={formErrors.tariffClass}
              required
            />

            <FormSelectModule
              label="Region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              options={regionOptions}
              error={formErrors.region}
              required
            />

            <FormSelectModule
              label="Business Unit"
              name="businessUnit"
              value={formData.businessUnit}
              onChange={handleInputChange}
              options={businessUnitOptions}
              error={formErrors.businessUnit}
              required
            />

            {/* Contact Information */}
            <FormInputModule
              label="Address"
              name="address"
              type="text"
              placeholder="Enter complete address"
              value={formData.address}
              onChange={handleInputChange}
              error={formErrors.address}
              required
            />

            <FormInputModule
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              placeholder="Enter phone number (e.g., 08099998888)"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              error={formErrors.phoneNumber}
              required
            />

            <FormInputModule
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
              required
            />
          </div>

          {/* Error Display - Only show if there are form errors */}
          {Object.keys(formErrors).length > 0 && (
            <div className="mx-6 mb-4 rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
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
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule
            variant="dangerSecondary"
            className="flex-1"
            size="lg"
            onClick={onRequestClose}
            disabled={isLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex-1"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? "Adding Customer..." : "Add Customer"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AddCustomerModal
