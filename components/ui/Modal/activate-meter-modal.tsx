import React, { useState } from "react"
import { X } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"

interface ActivateMeterModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: (data: { status: number; changeReason: string }) => void
  loading?: boolean
  meterId?: number
  errorMessage?: string
  successMessage?: string
}

const ActivateMeterModal: React.FC<ActivateMeterModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading = false,
  meterId,
  errorMessage,
  successMessage,
}) => {
  const [changeReason, setChangeReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (changeReason.trim()) {
      onConfirm({
        status: 1,
        changeReason: changeReason.trim(),
      })
    }
  }

  const handleClose = () => {
    if (!loading) {
      setChangeReason("")
      onRequestClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Activate Meter</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="mb-4 text-sm text-gray-600">
            Are you sure you want to activate meter {meterId}? This action will enable the meter for normal operation.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="changeReason" className="mb-2 block text-sm font-medium text-gray-700">
                Change Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="changeReason"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Please provide a reason for activating this meter..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                rows={3}
                disabled={loading}
                required
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <strong>Error:</strong> {errorMessage}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <strong>Success:</strong> {successMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <ButtonModule
                type="button"
                variant="outlineGray"
                size="md"
                className="flex-1"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </ButtonModule>
              <ButtonModule
                type="submit"
                variant="success"
                size="md"
                className="flex-1"
                disabled={!changeReason.trim() || loading}
                loading={loading}
              >
                Activate Meter
              </ButtonModule>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ActivateMeterModal
