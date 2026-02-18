"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { AlertTriangle, Settings } from "lucide-react"
import { notify } from "components/ui/Notification/Notification"
import type { UpdateMeterPhaseRequest } from "lib/redux/metersSlice"

interface ChangePhaseModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: (phaseData: UpdateMeterPhaseRequest) => Promise<void>
  loading: boolean
  meterId: number
  currentPhase?: string
  successMessage?: string
  errorMessage?: string
}

const ChangePhaseModal: React.FC<ChangePhaseModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading,
  meterId,
  currentPhase,
  successMessage,
  errorMessage,
}) => {
  const [phaseData, setPhaseData] = useState<UpdateMeterPhaseRequest>({
    phaseType: "",
    changeReason: "",
  })
  const [hasShownSuccessNotification, setHasShownSuccessNotification] = useState(false)
  const [hasShownErrorNotification, setHasShownErrorNotification] = useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setPhaseData({
        phaseType: "",
        changeReason: "",
      })
      // Reset notification flags when modal opens
      setHasShownSuccessNotification(false)
      setHasShownErrorNotification(false)
    }
  }, [isOpen])

  React.useEffect(() => {
    if (successMessage && !hasShownSuccessNotification) {
      notify("success", "Phase changed successfully!", {
        title: successMessage,
        duration: 4000,
      })
      setHasShownSuccessNotification(true)
    }
  }, [successMessage, hasShownSuccessNotification])

  React.useEffect(() => {
    if (errorMessage && !hasShownErrorNotification) {
      notify("error", "Failed to change phase", {
        title: errorMessage,
        duration: 6000,
      })
      setHasShownErrorNotification(true)
    }
  }, [errorMessage, hasShownErrorNotification])

  const handleInputChange = (field: keyof UpdateMeterPhaseRequest, value: string) => {
    setPhaseData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phaseData.phaseType.trim()) {
      return
    }

    if (!phaseData.changeReason.trim()) {
      return
    }

    await onConfirm(phaseData)
  }

  const handleClose = () => {
    if (!loading) {
      onRequestClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pink-100 p-2">
              <Settings className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Change Meter Phase</h3>
              <p className="text-sm text-gray-500">Meter ID: {meterId}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {successMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {currentPhase && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Current Phase</label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm text-gray-900">{currentPhase}</p>
                </div>
              </div>
            )}

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">New Phase Type *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("phaseType", "1Q")}
                  disabled={loading}
                  className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    phaseData.phaseType === "1Q"
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  } ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className={`text-lg font-bold ${
                          phaseData.phaseType === "1Q" ? "text-blue-700" : "text-gray-900"
                        }`}
                      >
                        1Q
                      </div>
                      <div className={`text-sm ${phaseData.phaseType === "1Q" ? "text-blue-600" : "text-gray-600"}`}>
                        Single Phase
                      </div>
                    </div>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        phaseData.phaseType === "1Q" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                      }`}
                    >
                      {phaseData.phaseType === "1Q" && (
                        <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  {phaseData.phaseType === "1Q" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange("phaseType", "3Q")}
                  disabled={loading}
                  className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    phaseData.phaseType === "3Q"
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  } ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className={`text-lg font-bold ${
                          phaseData.phaseType === "3Q" ? "text-blue-700" : "text-gray-900"
                        }`}
                      >
                        3Q
                      </div>
                      <div className={`text-sm ${phaseData.phaseType === "3Q" ? "text-blue-600" : "text-gray-600"}`}>
                        Three Phase
                      </div>
                    </div>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        phaseData.phaseType === "3Q" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                      }`}
                    >
                      {phaseData.phaseType === "3Q" && (
                        <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  {phaseData.phaseType === "3Q" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Select one option above</p>
            </div>

            <div>
              <FormTextAreaModule
                id="changeReason"
                value={phaseData.changeReason}
                onChange={(e) => handleInputChange("changeReason", e.target.value)}
                placeholder="Enter reason for phase change"
                disabled={loading}
                required
                label={"Change Reason"}
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex gap-3">
            <ButtonModule
              type="button"
              variant="outline"
              size="md"
              className="flex-1"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </ButtonModule>
            <ButtonModule
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              disabled={loading || !phaseData.phaseType.trim() || !phaseData.changeReason.trim()}
              loading={loading}
            >
              {loading ? "Changing..." : "Change Phase"}
            </ButtonModule>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ChangePhaseModal
