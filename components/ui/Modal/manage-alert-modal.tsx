"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { FormSelectModule } from "../Input/FormSelectModule"

interface ManageAlertModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
  alertData?: {
    id: string
    type: string
    severity: string
    meter: string
    customer: string
  }
}

const ManageAlertModal: React.FC<ManageAlertModalProps> = ({ isOpen, onRequestClose, onSuccess, alertData }) => {
  const [formData, setFormData] = useState({
    status: "active",
    resolutionNotes: "",
  })

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    setFormData((prev) => ({
      ...prev,
      [name]: String(value),
    }))
  }

  const handleSubmit = async () => {
    try {
      console.log("Alert management submitted:", { alertData, formData })
      onRequestClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to submit alert management:", error)
    }
  }

  const isFormValid = () => {
    return formData.status.trim() && formData.resolutionNotes.trim()
  }

  // Options for status dropdown
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "investigating", label: "Investigating" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
    { value: "false-alarm", label: "False Alarm" },
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
        className="relative w-[500px] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-6">
          <h2 className="text-xl font-bold text-gray-900">Manage Alert</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Alert Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Alert Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Alert ID</label>
                <div className="mt-1 text-sm text-gray-900">{alertData?.id || "ALT001"}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <div className="mt-1 text-sm text-gray-900">{alertData?.type || "tamper"}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Severity</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      alertData?.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : alertData?.severity === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {alertData?.severity || "high"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Meter</label>
                <div className="mt-1 text-sm text-gray-900">{alertData?.meter || "MTR001234569"}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <div className="mt-1 text-sm text-gray-900">{alertData?.customer || "Chinedu Okafor"}</div>
            </div>
          </div>

          {/* Update Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Update Status</h3>
            <FormSelectModule
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={statusOptions}
              required
            />
          </div>

          {/* Resolution Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Resolution Notes</h3>
            <div>
              <label htmlFor="resolutionNotes" className="block text-sm font-medium text-gray-700">
                Enter resolution details
              </label>
              <textarea
                id="resolutionNotes"
                name="resolutionNotes"
                rows={4}
                value={formData.resolutionNotes}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-[#F3F4F6] px-3 py-2 text-sm placeholder-gray-400 focus:border-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                placeholder="Describe the resolution steps, findings, or any relevant information..."
                required
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="dangerSecondary" className="flex-1" size="lg" onClick={onRequestClose}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="lg" onClick={handleSubmit} disabled={!isFormValid()}>
            Update Alert
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ManageAlertModal
