"use client"

import React, { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearConfirmPayment, confirmPayment } from "lib/redux/agentSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"

interface ConfirmPaymentFormProps {
  isOpen: boolean
  onClose: () => void
  paymentId: number
  paymentRef: string
  customerName: string
  amount: number
  onSuccess?: () => void
}

const ConfirmPaymentForm: React.FC<ConfirmPaymentFormProps> = ({
  isOpen,
  onClose,
  paymentId,
  paymentRef,
  customerName,
  amount,
  onSuccess,
}) => {
  console.log("ConfirmPaymentForm props:", { isOpen, paymentId, paymentRef, customerName, amount })

  const dispatch = useAppDispatch()
  const { confirmPaymentLoading, confirmPaymentError, confirmPaymentSuccess } = useAppSelector((state) => state.agents)

  useEffect(() => {
    if (confirmPaymentSuccess) {
      notify("success", "Payment confirmed successfully!", {
        title: "Payment Confirmation",
        description: `Payment ${paymentRef} has been confirmed.`,
      })
      onSuccess?.()
      onClose()
    }
  }, [confirmPaymentSuccess, onSuccess, onClose, paymentRef])

  useEffect(() => {
    if (confirmPaymentError) {
      notify("error", confirmPaymentError, {
        title: "Payment Confirmation Failed",
        duration: 5000,
      })
    }
  }, [confirmPaymentError])

  // Clear confirm payment state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearConfirmPayment())
    }
  }, [dispatch])

  const handleConfirm = () => {
    console.log("ConfirmPaymentForm handleConfirm called", { paymentId, paymentRef })

    if (!paymentId) {
      console.error("Payment ID is missing, cannot confirm payment")
      return
    }

    dispatch(confirmPayment(paymentId))
      .unwrap()
      .catch((error) => {
        // Error will be handled by the Redux state and shown below
        console.error("Payment confirmation failed:", error)
      })
  }

  const handleClose = () => {
    if (!confirmPaymentLoading) {
      dispatch(clearConfirmPayment())
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[100] bg-black bg-opacity-50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <motion.div
        className="fixed right-0 top-0 z-[150] h-full w-full max-w-md bg-white shadow-xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Confirm Payment</h2>
            <button
              onClick={handleClose}
              disabled={confirmPaymentLoading}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Payment Details */}
            <div className="mb-6 space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium text-gray-900">{paymentRef}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium text-gray-900">{customerName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">₦{amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  Are you sure you want to confirm this payment? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {confirmPaymentError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-800">{confirmPaymentError}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <div className="flex justify-end gap-3">
              <ButtonModule variant="outline" onClick={handleClose} disabled={confirmPaymentLoading}>
                Cancel
              </ButtonModule>
              <ButtonModule
                variant="primary"
                onClick={handleConfirm}
                disabled={confirmPaymentLoading || !paymentId}
                loading={confirmPaymentLoading}
              >
                Confirm Payment
              </ButtonModule>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConfirmPaymentForm
