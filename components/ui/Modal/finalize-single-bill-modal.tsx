// components/FinalizeSingleBillModal.tsx
"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "../Input/Input"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearFinalizeSingleBillStatus, finalizeSingleBill } from "lib/redux/postpaidSlice"

// Icon Component
const CloseIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface FinalizeSingleBillModalProps {
  isOpen: boolean
  onRequestClose: () => void
  billId: number
  billReference: string
  onSuccess?: () => void
}

export const FinalizeSingleBillModal: React.FC<FinalizeSingleBillModalProps> = ({
  isOpen,
  onRequestClose,
  billId,
  billReference,
  onSuccess,
}) => {
  const dispatch = useAppDispatch()
  const [effectiveAtUtc, setEffectiveAtUtc] = useState("")
  const [skipLedgerPosting, setSkipLedgerPosting] = useState(true)

  const { finalizeSingleBillLoading, finalizeSingleBillError, finalizeSingleBillSuccess, finalizeSingleBillMessage } =
    useAppSelector((state) => state.postpaidBilling)

  // Set default effective date to current time
  React.useEffect(() => {
    if (isOpen && !effectiveAtUtc) {
      const now = new Date()
      setEffectiveAtUtc(now.toISOString())
    }
  }, [isOpen, effectiveAtUtc])

  // Handle success/error states
  React.useEffect(() => {
    if (finalizeSingleBillSuccess) {
      notify("success", finalizeSingleBillMessage || "Bill finalized successfully!")
      dispatch(clearFinalizeSingleBillStatus())
      onRequestClose()
      if (onSuccess) onSuccess()
    }
    if (finalizeSingleBillError) {
      notify("error", finalizeSingleBillError)
      dispatch(clearFinalizeSingleBillStatus())
    }
  }, [
    finalizeSingleBillSuccess,
    finalizeSingleBillError,
    finalizeSingleBillMessage,
    dispatch,
    onRequestClose,
    onSuccess,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!effectiveAtUtc) {
      notify("error", "Effective date is required")
      return
    }

    try {
      await dispatch(
        finalizeSingleBill({
          id: billId,
          requestData: {
            effectiveAtUtc,
            skipLedgerPosting,
            billPdfUrl: "",
          },
        })
      ).unwrap()
    } catch (error) {
      // Error is handled by the useEffect above
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(e)
  }

  const handleClose = () => {
    if (!finalizeSingleBillLoading) {
      dispatch(clearFinalizeSingleBillStatus())
      onRequestClose()
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[600px] max-w-4xl rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Finalize Bill</h2>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={finalizeSingleBillLoading}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="mb-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Finalize Bill #{billReference}</h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone. Please review the details before finalizing.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Effective Date & Time</label>
              <FormInputModule
                type="datetime-local"
                value={effectiveAtUtc ? new Date(effectiveAtUtc).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const date = new Date(e.target.value)
                  setEffectiveAtUtc(date.toISOString())
                }}
                required
                disabled={finalizeSingleBillLoading}
                label={""}
                placeholder={""}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="skipLedgerPosting"
                checked={skipLedgerPosting}
                onChange={(e) => setSkipLedgerPosting(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={finalizeSingleBillLoading}
              />
              <label htmlFor="skipLedgerPosting" className="ml-2 block text-sm text-gray-900">
                Skip Ledger Posting
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
            disabled={finalizeSingleBillLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex-1"
            type="submit"
            disabled={finalizeSingleBillLoading}
            loading={finalizeSingleBillLoading}
          >
            {finalizeSingleBillLoading ? "Finalizing..." : "Finalize Bill"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}
