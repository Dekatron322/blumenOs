"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { FormSelectModule } from "../Input/FormSelectModule"

interface InstallMeterModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
}

const InstallMeterModal: React.FC<InstallMeterModalProps> = ({ isOpen, onRequestClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    accountNumber: "",
    meterType: "",
    manufacturer: "",
    installationAddress: "",
    priority: "",
    scheduledDate: "",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      console.log("Form submitted:", formData)
      onRequestClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to submit form:", error)
    }
  }

  const isFormValid = () => {
    return (
      formData.customerName.trim() &&
      formData.accountNumber.trim() &&
      formData.meterType.trim() &&
      formData.manufacturer.trim() &&
      formData.installationAddress.trim() &&
      formData.priority.trim() &&
      formData.scheduledDate.trim()
    )
  }

  // Options for dropdowns
  const meterTypeOptions = [
    { value: "", label: "Select meter type" },
    { value: "single-phase", label: "Single Phase" },
    { value: "three-phase", label: "Three Phase" },
    { value: "smart-meter", label: "Smart Meter" },
    { value: "prepaid", label: "Prepaid Meter" },
  ]

  const manufacturerOptions = [
    { value: "", label: "Select manufacturer" },
    { value: "schneider", label: "Schneider Electric" },
    { value: "siemens", label: "Siemens" },
    { value: "abb", label: "ABB" },
    { value: "general-electric", label: "General Electric" },
    { value: "landis-gyr", label: "Landis+Gyr" },
  ]

  const priorityOptions = [
    { value: "", label: "Select priority" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
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
        className="relative w-[600px] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-6">
          <h2 className="text-xl font-bold text-gray-900">Schedule Meter Installation</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 px-6 pb-6">
          <FormInputModule
            label="Customer Name"
            name="customerName"
            type="text"
            placeholder="Enter customer name"
            value={formData.customerName}
            onChange={handleInputChange}
            required
            className="col-span-2"
          />

          <FormInputModule
            label="Account Number"
            name="accountNumber"
            type="text"
            placeholder="Enter account number"
            value={formData.accountNumber}
            onChange={handleInputChange}
            required
            className="col-span-2"
          />

          <FormSelectModule
            label="Meter Type"
            name="meterType"
            value={formData.meterType}
            onChange={handleInputChange}
            options={meterTypeOptions}
            required
          />

          <FormSelectModule
            label="Manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleInputChange}
            options={manufacturerOptions}
            required
          />

          <FormInputModule
            label="Installation Address"
            name="installationAddress"
            type="text"
            placeholder="Enter full address"
            value={formData.installationAddress}
            onChange={handleInputChange}
            required
            className="col-span-2"
          />

          <FormSelectModule
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            options={priorityOptions}
            required
          />

          <FormInputModule
            label="Scheduled Date"
            name="scheduledDate"
            type="date"
            placeholder="dd/mm/yyyy"
            value={formData.scheduledDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="dangerSecondary" className="flex-1" size="lg" onClick={onRequestClose}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="lg" onClick={handleSubmit} disabled={!isFormValid()}>
            Schedule Installation
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default InstallMeterModal
