"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useDispatch } from "react-redux"
import { AppDispatch } from "lib/redux/store"
import { addKeyChange, clearAddKeyChange } from "lib/redux/metersSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import type { AddKeyChangeRequest } from "lib/redux/metersSlice"
import { Key } from "lucide-react"

interface AddKeyChangeModalProps {
  isOpen: boolean
  onRequestClose: () => void
  meterId: number
  onSuccess: () => void
}

const AddKeyChangeModal: React.FC<AddKeyChangeModalProps> = ({ isOpen, onRequestClose, meterId, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>()

  // Form state
  const [formData, setFormData] = useState<AddKeyChangeRequest>({
    toSgc: 0,
    toKrn: 0,
    toTi: 0,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = parseInt(value) || 0
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await dispatch(addKeyChange({ id: meterId, requestData: formData })).unwrap()

      // Reset form
      setFormData({ toSgc: 0, toKrn: 0, toTi: 0 })
      onSuccess()
    } catch (error) {
      console.error("Failed to add key change:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form and clear Redux state
      setFormData({ toSgc: 0, toKrn: 0, toTi: 0 })
      dispatch(clearAddKeyChange())
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
            className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                  <Key className="size-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 md:text-xl">Add Key Change</h2>
                  <p className="text-sm text-gray-500">Generate new tokens for meter key change</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="group flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50"
                aria-label="Close modal"
              >
                <svg
                  className="size-4 transition-transform group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(100vh-200px)] w-full overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-4 md:p-6">
                {/* Form Description */}
                <div className="mb-6 rounded-lg bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                      <Key className="size-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">Key Change Parameters</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Enter the security parameters to generate new tokens for the meter key change. These values
                        determine the cryptographic characteristics of the generated tokens.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* To SGC */}
                    <div>
                      <FormInputModule
                        type="number"
                        id="toSgc"
                        name="toSgc"
                        value={formData.toSgc}
                        onChange={handleInputChange}
                        required
                        placeholder="0"
                        disabled={isSubmitting}
                        label="To SGC"
                        min="0"
                      />
                    </div>

                    {/* To KRN */}
                    <div>
                      <FormInputModule
                        type="number"
                        id="toKrn"
                        name="toKrn"
                        value={formData.toKrn}
                        onChange={handleInputChange}
                        required
                        placeholder="0"
                        disabled={isSubmitting}
                        label="To KRN"
                        min="0"
                      />
                    </div>

                    {/* To TI */}
                    <div>
                      <FormInputModule
                        type="number"
                        id="toTi"
                        name="toTi"
                        value={formData.toTi}
                        onChange={handleInputChange}
                        required
                        placeholder="0"
                        disabled={isSubmitting}
                        label="To TI"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <ButtonModule type="button" onClick={handleClose} disabled={isSubmitting} variant="outline" size="sm">
                    Cancel
                  </ButtonModule>
                  <ButtonModule
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                    size="sm"
                    loading={isSubmitting}
                  >
                    {isSubmitting ? "Generating..." : "Generate Tokens"}
                  </ButtonModule>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AddKeyChangeModal
