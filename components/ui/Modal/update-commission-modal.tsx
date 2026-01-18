"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { updateVendorCommission } from "lib/redux/vendorSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"

interface UpdateCommissionModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm?: () => void
  vendorId: number
  vendorName: string
  currentUrbanCommission?: number
  currentRuralCommission?: number
  onSuccess?: () => void
}

const UpdateCommissionModal: React.FC<UpdateCommissionModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  vendorId,
  vendorName,
  currentUrbanCommission,
  currentRuralCommission,
  onSuccess,
}) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = React.useState(false)
  const [urbanCommission, setUrbanCommission] = React.useState((currentUrbanCommission || 0).toString())
  const [ruralCommission, setRuralCommission] = React.useState((currentRuralCommission || 0).toString())
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (isOpen) {
      setUrbanCommission((currentUrbanCommission || 0).toString())
      setRuralCommission((currentRuralCommission || 0).toString())
      setError("")
    }
  }, [isOpen, currentUrbanCommission, currentRuralCommission])

  if (!isOpen) return null

  const validateCommission = (value: string): string => {
    const numValue = parseFloat(value)

    if (value === "" || isNaN(numValue)) {
      return "Commission must be a valid number"
    }

    if (numValue < 0) {
      return "Commission cannot be negative"
    }

    if (numValue > 100) {
      return "Commission cannot exceed 100%"
    }

    return ""
  }

  const handleUrbanCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrbanCommission(value)

    const validationError = validateCommission(value)
    setError(validationError)
  }

  const handleRuralCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRuralCommission(value)

    const validationError = validateCommission(value)
    setError(validationError)
  }

  const handleConfirm = async () => {
    const urbanValidationError = validateCommission(urbanCommission)
    const ruralValidationError = validateCommission(ruralCommission)

    if (urbanValidationError || ruralValidationError) {
      setError(urbanValidationError || ruralValidationError)
      return
    }

    try {
      setIsLoading(true)

      // If custom onConfirm is provided, use it
      if (onConfirm) {
        await onConfirm()
        onRequestClose()
        return
      }

      // Use the update vendor commission action with separate urban and rural values
      const urbanCommissionValue = parseFloat(urbanCommission)
      const ruralCommissionValue = parseFloat(ruralCommission)

      const result = await dispatch(
        updateVendorCommission({
          id: vendorId,
          urbanCommission: urbanCommissionValue,
          ruralCommission: ruralCommissionValue,
        })
      )

      if (updateVendorCommission.fulfilled.match(result)) {
        notify("success", `Commission for ${vendorName} has been updated successfully`)
        onSuccess?.()
      } else {
        throw new Error(result.payload as string)
      }

      onRequestClose()
    } catch (error: any) {
      notify("error", error.message || "Failed to update commission")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !error && !isLoading) {
      handleConfirm()
    }
  }

  const urbanCommissionValue = parseFloat(urbanCommission)
  const ruralCommissionValue = parseFloat(ruralCommission)
  const hasChanges = urbanCommissionValue !== currentUrbanCommission || ruralCommissionValue !== currentRuralCommission

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
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Update Commission</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col items-center px-6 pb-6 pt-6">
            {/* Info Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-blue-50">
                <svg className="size-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Message */}
            <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Update Vendor Commission</h3>
            <p className="mb-6 text-center text-gray-600">
              Update commission rate for <span className="font-semibold">{vendorName}</span>
            </p>

            {/* Current Commission Display */}
            <div className="mb-6 w-full space-y-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Current Urban Commission:</span>
                  <span className="text-lg font-bold text-gray-900">{currentUrbanCommission || 0}%</span>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Current Rural Commission:</span>
                  <span className="text-lg font-bold text-gray-900">{currentRuralCommission || 0}%</span>
                </div>
              </div>
            </div>

            {/* Commission Inputs */}
            <div className="mb-4 w-full space-y-4">
              <div>
                <label htmlFor="urbanCommission" className="mb-2 block text-sm font-medium text-gray-700">
                  Urban Commission Rate (%)
                </label>
                <div className="relative">
                  <input
                    id="urbanCommission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={urbanCommission}
                    onChange={handleUrbanCommissionChange}
                    onKeyPress={handleKeyPress}
                    className={`w-full rounded-lg border bg-white px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      error ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Enter urban commission percentage"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="ruralCommission" className="mb-2 block text-sm font-medium text-gray-700">
                  Rural Commission Rate (%)
                </label>
                <div className="relative">
                  <input
                    id="ruralCommission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={ruralCommission}
                    onChange={handleRuralCommissionChange}
                    onKeyPress={handleKeyPress}
                    className={`w-full rounded-lg border bg-white px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      error ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Enter rural commission percentage"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            {/* Change Indicator */}
            {hasChanges && (
              <div className="w-full rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="space-y-2">
                  {urbanCommissionValue !== currentUrbanCommission && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Urban Change:</span>
                      <span className="text-sm font-bold text-blue-700">
                        {urbanCommissionValue > (currentUrbanCommission || 0) ? "↑" : "↓"}{" "}
                        {Math.abs(urbanCommissionValue - (currentUrbanCommission || 0)).toFixed(1)}%
                        {urbanCommissionValue > (currentUrbanCommission || 0) ? " increase" : " decrease"}
                      </span>
                    </div>
                  )}
                  {ruralCommissionValue !== currentRuralCommission && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Rural Change:</span>
                      <span className="text-sm font-bold text-blue-700">
                        {ruralCommissionValue > (currentRuralCommission || 0) ? "↑" : "↓"}{" "}
                        {Math.abs(ruralCommissionValue - (currentRuralCommission || 0)).toFixed(1)}%
                        {ruralCommissionValue > (currentRuralCommission || 0) ? " increase" : " decrease"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="secondary" className="flex-1" size="md" onClick={onRequestClose} disabled={isLoading}>
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className=""
            size="md"
            onClick={handleConfirm}
            disabled={isLoading || !!error || !hasChanges}
          >
            {isLoading ? "Updating..." : "Update Commission"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default UpdateCommissionModal
