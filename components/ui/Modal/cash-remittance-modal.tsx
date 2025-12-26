"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useDispatch } from "react-redux"
import { AppDispatch } from "lib/redux/store"
import { createCashRemittanceRecord } from "lib/redux/cashRemittanceSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"

interface CashRemittanceModalProps {
  isOpen: boolean
  onRequestClose: () => void
}

const CashRemittanceModal: React.FC<CashRemittanceModalProps> = ({ isOpen, onRequestClose }) => {
  const dispatch = useDispatch<AppDispatch>()

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    startDateUtc: "",
    endDateUtc: "",
    bankName: "",
    tellerNumber: "",
    notes: "",
    depositedAtUtc: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Helper function to convert datetime-local to UTC ISO string
  const convertToUtc = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return ""
    return new Date(dateTimeLocal).toISOString()
  }

  // Helper function to format currency with commas
  const formatCurrency = (value: string) => {
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, "")

    // Split into integer and decimal parts
    const parts = cleanValue.split(".")
    let integerPart = parts[0] || "0"
    const decimalPart = parts[1] || ""

    // Add commas to integer part
    integerPart = parseInt(integerPart).toLocaleString()

    // Combine parts
    if (decimalPart) {
      return `${integerPart}.${decimalPart.slice(0, 2)}`
    }
    return integerPart
  }

  // Handle amount input with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d.]/g, "")
    const formattedValue = formatCurrency(rawValue)

    setFormData((prev) => ({
      ...prev,
      amount: rawValue, // Store raw value for API
    }))

    // Update the input field with formatted value
    e.target.value = formattedValue
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await dispatch(
        createCashRemittanceRecord({
          amount: parseFloat(formData.amount),
          startDateUtc: convertToUtc(formData.startDateUtc),
          endDateUtc: convertToUtc(formData.endDateUtc),
          bankName: formData.bankName,
          tellerNumber: formData.tellerNumber,
          notes: formData.notes,
          depositedAtUtc: convertToUtc(formData.depositedAtUtc),
        })
      ).unwrap()

      // Reset form and close modal
      setFormData({
        amount: "",
        startDateUtc: "",
        endDateUtc: "",
        bankName: "",
        tellerNumber: "",
        notes: "",
        depositedAtUtc: "",
      })
      onRequestClose()
    } catch (error) {
      console.error("Failed to create cash remittance record:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form on close
      setFormData({
        amount: "",
        startDateUtc: "",
        endDateUtc: "",
        bankName: "",
        tellerNumber: "",
        notes: "",
        depositedAtUtc: "",
      })
      onRequestClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm sm:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 md:text-xl">Create Cash Remittance Record</h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 disabled:opacity-50"
                aria-label="Close modal"
              >
                <svg className="size-4 md:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(100vh-200px)] w-full max-w-xl overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-4 md:p-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <FormInputModule
                      type="text"
                      id="amount"
                      name="amount"
                      value={formatCurrency(formData.amount)}
                      onChange={handleAmountChange}
                      required
                      placeholder="0.00"
                      disabled={isSubmitting}
                      label={"Amount"}
                      prefix={<span className="text-gray-500">₦</span>}
                    />
                  </div>

                  <div>
                    <FormInputModule
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter bank name"
                      disabled={isSubmitting}
                      label={"Bank Name"}
                    />
                  </div>

                  {/* Start Date UTC */}
                  <div>
                    <FormInputModule
                      type="datetime-local"
                      id="startDateUtc"
                      name="startDateUtc"
                      value={formData.startDateUtc}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      label={"Transaction Start Window"}
                      placeholder={"Transaction Start window"}
                    />
                  </div>

                  {/* End Date UTC */}
                  <div>
                    <FormInputModule
                      type="datetime-local"
                      id="endDateUtc"
                      name="endDateUtc"
                      value={formData.endDateUtc}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      label={"Transaction End Window"}
                      placeholder={"Transaction End Window"}
                    />
                  </div>

                  {/* Bank Name */}

                  {/* Teller Number */}
                  <div>
                    <FormInputModule
                      type="text"
                      id="tellerNumber"
                      name="tellerNumber"
                      value={formData.tellerNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter teller number"
                      disabled={isSubmitting}
                      label={"Teller Number"}
                    />
                  </div>

                  {/* Deposited At UTC */}
                  <div>
                    <FormInputModule
                      type="datetime-local"
                      id="depositedAtUtc"
                      name="depositedAtUtc"
                      value={formData.depositedAtUtc}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      label={"Date Deposited"}
                      placeholder={"Date Deposited"}
                    />
                  </div>

                  {/* Notes */}
                </div>
                <div className="mt-3">
                  <FormTextAreaModule
                    label="Notes"
                    name="notes"
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter any additional notes"
                    disabled={isSubmitting}
                  />
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:flex-row sm:gap-4 md:p-6">
              <ButtonModule
                type="button"
                variant="secondary"
                className="flex w-full"
                size="md"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </ButtonModule>
              <ButtonModule
                type="button"
                variant="primary"
                className="flex w-full"
                size="md"
                onClick={() => document.querySelector("form")?.requestSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Record"}
              </ButtonModule>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CashRemittanceModal
