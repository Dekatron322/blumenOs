"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { AlertTriangle, Settings } from "lucide-react"
import { notify } from "components/ui/Notification/Notification"
import type { ChangeTechnicalConfigRequest } from "lib/redux/metersSlice"

interface ChangeTechnicalConfigModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: (configData: ChangeTechnicalConfigRequest) => Promise<void>
  loading: boolean
  meterId: number
  currentConfig?: {
    sgc: number
    krn: string
    tct: number
    ken: number
    mfrCode: number
    ea: number
  }
  successMessage?: string
  errorMessage?: string
}

const ChangeTechnicalConfigModal: React.FC<ChangeTechnicalConfigModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading,
  meterId,
  currentConfig,
  successMessage,
  errorMessage,
}) => {
  const [configData, setConfigData] = useState<ChangeTechnicalConfigRequest>({
    sgc: 0,
    krn: "",
    tct: 0,
    ken: 0,
    mfrCode: 0,
    ea: 0,
    changeReason: "",
  })
  const [hasShownSuccessNotification, setHasShownSuccessNotification] = useState(false)
  const [hasShownErrorNotification, setHasShownErrorNotification] = useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setConfigData({
        sgc: currentConfig?.sgc || 0,
        krn: currentConfig?.krn || "",
        tct: currentConfig?.tct || 0,
        ken: currentConfig?.ken || 0,
        mfrCode: currentConfig?.mfrCode || 0,
        ea: currentConfig?.ea || 0,
        changeReason: "",
      })
      // Reset notification flags when modal opens
      setHasShownSuccessNotification(false)
      setHasShownErrorNotification(false)
    }
  }, [isOpen, currentConfig])

  React.useEffect(() => {
    if (successMessage && !hasShownSuccessNotification) {
      notify("success", "Technical config changed successfully!", {
        title: successMessage,
        duration: 4000,
      })
      setHasShownSuccessNotification(true)
    }
  }, [successMessage, hasShownSuccessNotification])

  React.useEffect(() => {
    if (errorMessage && !hasShownErrorNotification) {
      notify("error", "Failed to change technical config", {
        title: errorMessage,
        duration: 6000,
      })
      setHasShownErrorNotification(true)
    }
  }, [errorMessage, hasShownErrorNotification])

  const handleInputChange = (field: keyof ChangeTechnicalConfigRequest, value: string | number) => {
    setConfigData((prev) => ({
      ...prev,
      [field]: field === "krn" || field === "changeReason" ? value : Number(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!configData.changeReason.trim()) {
      return
    }

    await onConfirm(configData)
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
            <div className="rounded-lg bg-red-100 p-2">
              <Settings className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Change Technical Config</h3>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormInputModule
                  id="sgc"
                  type="number"
                  value={configData.sgc}
                  onChange={(e) => handleInputChange("sgc", e.target.value)}
                  placeholder="SGC"
                  disabled={loading}
                  required
                  label={"SGC"}
                />
              </div>
              <div>
                <FormInputModule
                  id="krn"
                  value={configData.krn}
                  onChange={(e) => handleInputChange("krn", e.target.value)}
                  placeholder="KRN"
                  disabled={loading}
                  required
                  label={"KRN"}
                  type={""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormInputModule
                  id="tct"
                  type="number"
                  value={configData.tct}
                  onChange={(e) => handleInputChange("tct", e.target.value)}
                  placeholder="TCT"
                  disabled={loading}
                  required
                  label={"TCT"}
                />
              </div>
              <div>
                <FormInputModule
                  id="ken"
                  type="number"
                  value={configData.ken}
                  onChange={(e) => handleInputChange("ken", e.target.value)}
                  placeholder="KEN"
                  disabled={loading}
                  required
                  label={"KEN"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormInputModule
                  id="mfrCode"
                  type="number"
                  value={configData.mfrCode}
                  onChange={(e) => handleInputChange("mfrCode", e.target.value)}
                  placeholder="MFR Code"
                  disabled={loading}
                  required
                  label={"MFR Code"}
                />
              </div>
              <div>
                <FormInputModule
                  id="ea"
                  type="number"
                  value={configData.ea}
                  onChange={(e) => handleInputChange("ea", e.target.value)}
                  placeholder="EA"
                  disabled={loading}
                  required
                  label={"EA"}
                />
              </div>
            </div>

            <div>
              <FormTextAreaModule
                id="changeReason"
                value={configData.changeReason}
                onChange={(e) => handleInputChange("changeReason", e.target.value)}
                placeholder="Enter reason for technical config change"
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
              disabled={loading || !configData.changeReason.trim()}
              loading={loading}
            >
              {loading ? "Changing..." : "Change Config"}
            </ButtonModule>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ChangeTechnicalConfigModal
