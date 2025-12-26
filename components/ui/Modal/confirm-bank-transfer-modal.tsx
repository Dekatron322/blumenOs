"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Calendar, CheckCircle, FileText, X } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearConfirmPayment, confirmPayment } from "lib/redux/paymentSlice"
import type { ConfirmPaymentRequest } from "lib/redux/paymentSlice"

interface ConfirmBankTransferModalProps {
  isOpen: boolean
  onRequestClose: () => void
  paymentId: number
  paymentReference: string
  currentAmount?: number
  onSuccess?: () => void
}

const ConfirmBankTransferModal: React.FC<ConfirmBankTransferModalProps> = ({
  isOpen,
  onRequestClose,
  paymentId,
  paymentReference,
  currentAmount = 0,
  onSuccess,
}) => {
  const dispatch = useAppDispatch()
  const { confirmPaymentLoading, confirmPaymentError, confirmPaymentSuccess } = useAppSelector(
    (state) => state.payments
  )

  const [formData, setFormData] = useState<ConfirmPaymentRequest>({
    amount: currentAmount,
    externalReference: "",
    confirmedAtUtc: new Date().toISOString(),
    narrative: "",
    skipRecovery: false,
  })

  const formatAmount = (value: number): string => {
    return new Intl.NumberFormat("en-NG").format(value)
  }

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/,/g, "")) || 0
    handleInputChange("amount", numericValue)
  }

  const handleInputChange = (field: keyof ConfirmPaymentRequest, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await dispatch(confirmPayment({ id: paymentId, confirmData: formData })).unwrap()
      onSuccess?.()
      onRequestClose()
    } catch (error) {
      // Error is handled by Redux state
    }
  }

  const handleClose = () => {
    dispatch(clearConfirmPayment())
    onRequestClose()
  }

  const resetForm = () => {
    setFormData({
      amount: currentAmount,
      externalReference: "",
      confirmedAtUtc: new Date().toISOString(),
      narrative: "",
      skipRecovery: false,
    })
  }

  React.useEffect(() => {
    if (isOpen) {
      resetForm()
      dispatch(clearConfirmPayment())
    }
  }, [isOpen, dispatch, currentAmount])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative mx-4 w-full max-w-lg rounded-xl border border-gray-100 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle className="size-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Confirm Bank Transfer</h2>
                  <p className="text-sm text-gray-500">Payment: {paymentReference}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Amount */}
                <FormInputModule
                  label="Amount"
                  type="text"
                  placeholder="0.00"
                  value={formatAmount(formData.amount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  required
                  prefix={<span className="text-gray-500">₦</span>}
                />

                {/* External Reference */}
                <FormInputModule
                  label="External Reference"
                  type="text"
                  placeholder="Transaction reference from bank"
                  value={formData.externalReference}
                  onChange={(e) => handleInputChange("externalReference", e.target.value)}
                  required
                  prefix={<FileText className="size-4 text-gray-500" />}
                />

                {/* Confirmation Date */}
                <FormInputModule
                  label="Confirmed At"
                  type="datetime-local"
                  value={formData.confirmedAtUtc.slice(0, 16)}
                  onChange={(e) => handleInputChange("confirmedAtUtc", new Date(e.target.value).toISOString())}
                  required
                  prefix={<Calendar className="size-4 text-gray-500" />}
                  placeholder={""}
                />

                {/* Narrative */}
                <FormTextAreaModule
                  label="Narrative (Optional)"
                  placeholder="Additional notes about the confirmation"
                  value={formData.narrative}
                  onChange={(e) => handleInputChange("narrative", e.target.value)}
                  rows={3}
                />

                {/* Skip Recovery */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="skipRecovery"
                    checked={formData.skipRecovery}
                    onChange={(e) => handleInputChange("skipRecovery", e.target.checked)}
                    className="size-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    disabled={confirmPaymentLoading}
                  />
                  <label htmlFor="skipRecovery" className="text-sm text-gray-700">
                    Skip recovery process
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {confirmPaymentError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="size-4 flex-shrink-0 text-red-600" />
                  <p className="text-sm text-red-700">{confirmPaymentError}</p>
                </div>
              )}

              {/* Success Message */}
              {confirmPaymentSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                  <CheckCircle className="size-4 flex-shrink-0 text-green-600" />
                  <p className="text-sm text-green-700">Payment confirmed successfully!</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <ButtonModule
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={confirmPaymentLoading}
                  className="flex-1"
                >
                  Cancel
                </ButtonModule>
                <ButtonModule
                  type="submit"
                  variant="primary"
                  disabled={confirmPaymentLoading}
                  loading={confirmPaymentLoading}
                  className="flex-1"
                >
                  {confirmPaymentLoading ? "Confirming..." : "Confirm Transfer"}
                </ButtonModule>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmBankTransferModal
