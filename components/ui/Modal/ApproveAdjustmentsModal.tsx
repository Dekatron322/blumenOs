"use client"
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

import { ButtonModule } from "components/ui/Button/Button"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"

interface ApproveAdjustmentsModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: (billingPeriodId: number) => void
  billingPeriods: Array<{ id: number; displayName: string; periodKey: string; year: number; month: number }>
  isLoading: boolean
  response?: {
    isSuccess: boolean
    message: string
  }
}

const ApproveAdjustmentsModal: React.FC<ApproveAdjustmentsModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  billingPeriods,
  isLoading,
  response,
}) => {
  const [selectedBillingPeriodId, setSelectedBillingPeriodId] = React.useState<number | undefined>()

  // Handle response notification
  React.useEffect(() => {
    if (response) {
      const notificationType = response.isSuccess ? "success" : "error"

      // Set appropriate title based on the message content
      const title = response.message.includes("No pending adjustments found")
        ? "No Pending Adjustments"
        : response.isSuccess
        ? "Adjustments Approved"
        : "Approval Failed"

      notify(notificationType, response.message, {
        title,
        duration: 5000,
      })

      // Close modal on successful response
      if (response.isSuccess) {
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    }
  }, [response])

  // Debug: Check what billing periods data we're receiving
  React.useEffect(() => {
    console.log("ApproveAdjustmentsModal - billingPeriods:", billingPeriods)
  }, [billingPeriods])

  const handleSubmit = () => {
    if (selectedBillingPeriodId) {
      onApprove(selectedBillingPeriodId)
    }
  }

  const handleClose = () => {
    setSelectedBillingPeriodId(undefined)
    onClose()
  }

  const billingPeriodOptions = billingPeriods.map((period) => ({
    value: period.id.toString(),
    label: `${period.displayName} (${period.periodKey})`,
  }))

  // Debug: Check what options we're generating
  React.useEffect(() => {
    console.log("ApproveAdjustmentsModal - billingPeriodOptions:", billingPeriodOptions)
  }, [billingPeriodOptions])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-6">
                <h2 className="text-xl font-semibold text-gray-900">Approve All Adjustments</h2>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="mb-4 text-sm text-gray-600">
                  Select the billing period for which you want to approve all adjustments:
                </p>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Billing Period</label>
                  <FormSelectModule
                    name="billingPeriod"
                    value={selectedBillingPeriodId?.toString() || ""}
                    onChange={(e) => setSelectedBillingPeriodId(e.target.value ? Number(e.target.value) : undefined)}
                    options={billingPeriodOptions}
                    className="w-full"
                  />
                </div>

                {!selectedBillingPeriodId && (
                  <p className="mb-4 text-sm text-amber-600">Please select a billing period to continue.</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t p-6">
                <ButtonModule variant="outline" onClick={handleClose} disabled={isLoading} className="px-6">
                  Cancel
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!selectedBillingPeriodId || isLoading}
                  className="px-6"
                >
                  {isLoading ? "Approving..." : "Approve All"}
                </ButtonModule>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ApproveAdjustmentsModal
