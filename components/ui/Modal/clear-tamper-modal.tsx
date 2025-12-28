"use client"

import React from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { AlertTriangle } from "lucide-react"

interface ClearTamperModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
  meterId: number
  successMessage?: string
  errorMessage?: string
}

const ClearTamperModal: React.FC<ClearTamperModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading,
  meterId,
  successMessage,
  errorMessage,
}) => {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="z-[999] mt-20 w-[400px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 z-[998] bg-black bg-opacity-50 backdrop-blur-sm overflow-hidden flex items-center justify-center"
    >
      <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-4">
        <h2 className="text-lg font-bold">Clear Tamper</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>
      <div className="px-4 pb-6">
        <div className="my-4 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="size-6 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Confirm Tamper Clear</p>
            <p className="text-sm text-gray-600">
              Are you sure you want to clear the tamper status for Meter ID: <strong>#{meterId}</strong>?
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-md bg-amber-50 p-3">
          <p className="text-xs text-amber-800">
            <strong>Warning:</strong> This action will clear the tamper flag on the meter and cannot be undone. Please
            ensure this action is authorized and necessary.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="flex gap-3">
          <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={onRequestClose} disabled={loading}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="lg" onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="mr-2 size-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Clearing...
              </div>
            ) : (
              "Clear Tamper"
            )}
          </ButtonModule>
        </div>
      </div>
    </Modal>
  )
}

export default ClearTamperModal
