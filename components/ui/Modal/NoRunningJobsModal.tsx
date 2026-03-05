"use client"

import React from "react"
import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppSelector } from "lib/hooks/useRedux"
import { BillingJobRunStatus } from "lib/types/billing"

interface NoRunningJobsModalProps {
  isOpen: boolean
  onClose: () => void
  onStartRun: () => void
  scheduleId: number
}

export const NoRunningJobsModal: React.FC<NoRunningJobsModalProps> = ({ isOpen, onClose, onStartRun, scheduleId }) => {
  const router = useRouter()
  const { billingScheduleRun, billingScheduleRunLoading, billingScheduleRunError } = useAppSelector(
    (state) => state.postpaidBilling
  )

  // Check if there's a running job using the correct enum values
  const runStatus = billingScheduleRun?.latestRunProgress?.runStatus
  const hasRunningJob = runStatus === BillingJobRunStatus.Running || runStatus === BillingJobRunStatus.Queued

  const handleCancel = () => {
    onClose()
    router.push("/billing/generate")
  }

  // Don't show modal if there's a running job or if we're still loading
  if (!isOpen || hasRunningJob || billingScheduleRunLoading) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="mx-4 max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Play className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Running Jobs</h3>
            <p className="mb-4 text-sm text-gray-600">
              There are currently no running jobs. Would you like to start a new job?
            </p>
            {billingScheduleRunError && (
              <p className="mb-4 text-sm text-red-600">Error checking job status: {billingScheduleRunError}</p>
            )}
          </div>
          <div className="flex w-full gap-3">
            <ButtonModule className="w-full" variant="outline" onClick={handleCancel}>
              Cancel
            </ButtonModule>
            <ButtonModule className="w-full" onClick={onStartRun}>
              Start Run
            </ButtonModule>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
