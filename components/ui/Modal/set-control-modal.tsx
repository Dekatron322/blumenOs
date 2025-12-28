"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { AlertTriangle, Settings } from "lucide-react"
import type { SetControlRequest } from "lib/redux/metersSlice"

interface SetControlModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: (controlData: SetControlRequest) => Promise<void>
  loading: boolean
  meterId: number
  successMessage?: string
  errorMessage?: string
}

const SetControlModal: React.FC<SetControlModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading,
  meterId,
  successMessage,
  errorMessage,
}) => {
  const [controlData, setControlData] = useState<SetControlRequest>({
    isFlag: true,
    index: 0,
    value: 0,
    tokenTime: 0,
    flags: 0,
  })

  React.useEffect(() => {
    if (isOpen) {
      setControlData({
        isFlag: true,
        index: 0,
        value: 0,
        tokenTime: 0,
        flags: 0,
      })
    }
  }, [isOpen])

  const handleInputChange = (field: keyof SetControlRequest, value: string | boolean) => {
    setControlData((prev) => ({
      ...prev,
      [field]: field === "isFlag" ? value : Number(value),
    }))
  }

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (controlData.index < 0) {
      errors.push("Index must be a positive number")
    }

    if (controlData.value < 0) {
      errors.push("Value must be a positive number")
    }

    if (controlData.tokenTime < 0) {
      errors.push("Token time must be a positive number")
    }

    if (controlData.flags < 0) {
      errors.push("Flags must be a positive number")
    }

    if (errors.length > 0) {
      // You could add a notification system here like in record payment modal
      console.error("Form validation errors:", errors)
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    await onConfirm(controlData)
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
        className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
              <Settings className="size-5 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">Set Control</h2>
          </div>
          <button
            onClick={onRequestClose}
            className="flex size-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-8"
            disabled={loading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-4 px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="mb-2 w-full text-center">
              <h3 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">Meter ID: #{meterId}</h3>
              <p className="text-xs text-gray-600 sm:text-sm">Configure control parameters for this meter</p>
            </div>

            <p className="text-xs text-gray-500 sm:text-sm">
              Configure the control parameters for the meter. This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <input
                type="checkbox"
                id="isFlag"
                checked={controlData.isFlag}
                onChange={(e) => handleInputChange("isFlag", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="isFlag" className="text-sm font-medium text-gray-900">
                Is Flag
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInputModule
                label="Index"
                type="number"
                placeholder="0"
                value={controlData.index.toString()}
                onChange={(e) => handleInputChange("index", e.target.value)}
                required
                disabled={loading}
                min="0"
              />
              <FormInputModule
                label="Value"
                type="number"
                placeholder="0"
                value={controlData.value.toString()}
                onChange={(e) => handleInputChange("value", e.target.value)}
                required
                disabled={loading}
                min="0"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInputModule
                label="Token Time"
                type="number"
                placeholder="0"
                value={controlData.tokenTime.toString()}
                onChange={(e) => handleInputChange("tokenTime", e.target.value)}
                required
                disabled={loading}
                min="0"
              />
              <FormInputModule
                label="Flags"
                type="number"
                placeholder="0"
                value={controlData.flags.toString()}
                onChange={(e) => handleInputChange("flags", e.target.value)}
                required
                disabled={loading}
                min="0"
              />
            </div>

            <div className="rounded-md bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 flex-shrink-0 text-amber-600" />
                <p className="text-xs text-amber-800">
                  <strong>Warning:</strong> This action will modify the control settings of the meter and cannot be
                  undone. Please ensure this action is authorized and necessary.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-50 p-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <ButtonModule
                variant="secondary"
                className="flex-1"
                size="lg"
                onClick={onRequestClose}
                disabled={loading}
              >
                Cancel
              </ButtonModule>
              <ButtonModule variant="primary" className="flex-1" size="lg" onClick={handleSubmit} disabled={loading}>
                {loading ? "Setting Control..." : "Set Control"}
              </ButtonModule>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SetControlModal
