"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { notify } from "components/ui/Notification/Notification"
import type { ChangeTariffRequest } from "lib/redux/metersSlice"

interface ChangeTIModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: (tiData: ChangeTariffRequest) => Promise<void>
  loading: boolean
  meterId: number
  currentTI?: number
  successMessage?: string
  errorMessage?: string
}

const ChangeTIModal: React.FC<ChangeTIModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading,
  meterId,
  currentTI,
  successMessage,
  errorMessage,
}) => {
  const [tiData, setTiData] = useState<ChangeTariffRequest>({
    ti: 0,
    changeReason: "",
  })
  const [hasShownSuccessNotification, setHasShownSuccessNotification] = useState(false)
  const [hasShownErrorNotification, setHasShownErrorNotification] = useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setTiData({
        ti: currentTI || 0,
        changeReason: "",
      })
      // Reset notification flags when modal opens
      setHasShownSuccessNotification(false)
      setHasShownErrorNotification(false)
    }
  }, [isOpen, currentTI])

  React.useEffect(() => {
    if (successMessage && !hasShownSuccessNotification) {
      notify("success", "TI changed successfully!", {
        title: successMessage,
        duration: 4000,
      })
      setHasShownSuccessNotification(true)
    }
  }, [successMessage, hasShownSuccessNotification])

  React.useEffect(() => {
    if (errorMessage && !hasShownErrorNotification) {
      notify("error", "Failed to change TI", {
        title: errorMessage,
        duration: 6000,
      })
      setHasShownErrorNotification(true)
    }
  }, [errorMessage, hasShownErrorNotification])

  const handleInputChange = (field: keyof ChangeTariffRequest, value: string | number) => {
    setTiData((prev) => ({
      ...prev,
      [field]: field === "changeReason" ? value : Number(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tiData.changeReason.trim()) {
      return
    }

    await onConfirm(tiData)
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
            <div className="rounded-lg bg-orange-100 p-2">
              <RefreshCw className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Change TI</h3>
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
            <div>
              <FormInputModule
                id="ti"
                type="number"
                value={tiData.ti}
                onChange={(e) => handleInputChange("ti", e.target.value)}
                placeholder="Enter new TI value"
                disabled={loading}
                required
                label={"New TI Value"}
              />
              {currentTI !== undefined && (
                <p className="mt-1 text-xs text-gray-500">
                  Current TI: {currentTI}
                </p>
              )}
            </div>

            <div>
              <FormTextAreaModule
                id="changeReason"
                value={tiData.changeReason}
                onChange={(e) => handleInputChange("changeReason", e.target.value)}
                placeholder="Enter reason for TI change"
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
              disabled={loading || !tiData.changeReason.trim()}
              loading={loading}
            >
              {loading ? "Changing..." : "Change TI"}
            </ButtonModule>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ChangeTIModal
