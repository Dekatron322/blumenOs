"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"

import { FormSelectModule } from "../Input/FormSelectModule"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"

interface AddAgentModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
}

const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onRequestClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    idNumber: "",
    territory: "",
    commissionRate: "",
    initialFloat: "",
    deviceId: "",
    address: "",
  })

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = ("target" in e ? e.target : e) as {
      name: string
      value: string | number
    }
    const coercedValue = typeof value === "number" ? String(value) : value
    setFormData((prev) => ({
      ...prev,
      [name]: coercedValue,
    }))
  }

  const handleSubmit = async () => {
    try {
      console.log("Agent form submitted:", formData)
      onRequestClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to submit agent form:", error)
    }
  }

  const isFormValid = () => {
    return (
      formData.fullName.trim() &&
      formData.phoneNumber.trim() &&
      formData.emailAddress.trim() &&
      formData.idNumber.trim() &&
      formData.territory.trim() &&
      formData.commissionRate.trim() &&
      formData.initialFloat.trim() &&
      formData.address.trim()
    )
  }

  // Options for territories
  const territoryOptions = [
    { value: "", label: "Select territory" },
    { value: "lagos-mainland", label: "Lagos Mainland" },
    { value: "lagos-island", label: "Lagos Island" },
    { value: "ikeja", label: "Ikeja" },
    { value: "abuja-central", label: "Abuja Central" },
    { value: "port-harcourt", label: "Port Harcourt" },
    { value: "kano", label: "Kano" },
    { value: "ibadan", label: "Ibadan" },
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
        <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Agent</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <div className="flex flex-col gap-4 p-6">
            <div className="grid grid-cols-3 gap-6">
              <FormInputModule
                label="Full Name"
                name="fullName"
                type="text"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />

              <FormInputModule
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />

              <FormInputModule
                label="Email Address"
                name="emailAddress"
                type="email"
                placeholder="Enter email"
                value={formData.emailAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className=" grid grid-cols-2 gap-6">
              <FormInputModule
                label="ID Number"
                name="idNumber"
                type="text"
                placeholder="National ID or BVN"
                value={formData.idNumber}
                onChange={handleInputChange}
                required
              />

              <FormSelectModule
                label="Territory"
                name="territory"
                value={formData.territory}
                onChange={handleInputChange}
                options={territoryOptions}
                required
              />
            </div>
            <div className=" grid grid-cols-3 gap-6">
              <FormInputModule
                label="Commission Rate (%)"
                name="commissionRate"
                type="number"
                placeholder="e.g., 2.5"
                value={formData.commissionRate}
                onChange={handleInputChange}
                required
              />

              <FormInputModule
                label="Initial Float (₦)"
                name="initialFloat"
                type="number"
                placeholder="Opening float amount"
                value={formData.initialFloat}
                onChange={handleInputChange}
                required
              />

              <FormInputModule
                label="Device ID (Optional)"
                name="deviceId"
                type="text"
                placeholder="POS terminal ID"
                value={formData.deviceId}
                onChange={handleInputChange}
              />
            </div>

            <FormInputModule
              label="Address"
              name="address"
              type="text"
              placeholder="Full residential address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="col-span-2"
            />
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="dangerSecondary" className="flex-1" size="lg" onClick={onRequestClose}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="lg" onClick={handleSubmit} disabled={!isFormValid()}>
            Add Agent
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AddAgentModal
