"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  ClearancePromo,
  clearPausePromoState,
  clearResumePromoState,
  pausePromo,
  resumePromo,
  selectPausePromoError,
  selectPausePromoLoading,
  selectResumePromoError,
  selectResumePromoLoading,
} from "lib/redux/debtManagementSlice"
import { notify } from "components/ui/Notification/Notification"
import { AlertTriangle, Loader2 } from "lucide-react"

interface PausePromoModalProps {
  isOpen: boolean
  onRequestClose: () => void
  promo: ClearancePromo | null
}

const PausePromoModal: React.FC<PausePromoModalProps> = ({ isOpen, onRequestClose, promo }) => {
  const dispatch = useAppDispatch()
  const isPauseLoading = useAppSelector(selectPausePromoLoading)
  const isResumeLoading = useAppSelector(selectResumePromoLoading)
  const pauseError = useAppSelector(selectPausePromoError)
  const resumeError = useAppSelector(selectResumePromoError)

  const isLoading = promo?.isPaused ? isResumeLoading : isPauseLoading
  const error = promo?.isPaused ? resumeError : pauseError

  const handleConfirm = async () => {
    if (!promo) return

    try {
      if (promo.isPaused) {
        await dispatch(resumePromo(promo.id)).unwrap()
        notify("success", `Promo "${promo.name}" has been resumed successfully`)
      } else {
        await dispatch(pausePromo(promo.id)).unwrap()
        notify("success", `Promo "${promo.name}" has been paused successfully`)
      }
      onRequestClose()
    } catch (error: any) {
      notify("error", error || `Failed to ${promo.isPaused ? "resume" : "pause"} promo`)
    }
  }

  const handleClose = () => {
    if (promo?.isPaused) {
      dispatch(clearResumePromoState())
    } else {
      dispatch(clearPausePromoState())
    }
    onRequestClose()
  }

  if (!isOpen || !promo) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <motion.div
        className="mx-4 w-full max-w-lg rounded-2xl bg-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="size-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{promo.isPaused ? "Resume Promo" : "Pause Promo"}</h2>
              <p className="text-sm text-gray-500">
                {promo.isPaused ? "Resume this clearance promo" : "Temporarily pause this clearance promo"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Promo Details */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{promo.name}</h3>
                <p className="text-sm text-gray-500">Code: {promo.code}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{promo.discountPercent}% OFF</div>
                <p className="text-xs text-gray-500">Discount</p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 flex-shrink-0 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">
                  {promo.isPaused ? "Resuming this promo will:" : "Pausing this promo will temporarily suspend:"}
                </h4>
                {promo.isPaused ? (
                  <ul className="mt-2 list-inside list-disc text-sm text-yellow-700">
                    <li>Reactivate the discount for eligible customers</li>
                    <li>Allow new debt clearances with this promo</li>
                    <li>Resume automatic promo application</li>
                    <li>Make the promo visible to customers again</li>
                  </ul>
                ) : (
                  <ul className="mt-2 list-inside list-disc text-sm text-yellow-700">
                    <li>Stop new debt clearances with this promo</li>
                    <li>Suspend the discount for eligible customers</li>
                    <li>Pause automatic promo application</li>
                    <li>Hide the promo from customer view</li>
                  </ul>
                )}
                <p className="mt-2 text-sm text-yellow-700">
                  The promo can be {promo.isPaused ? "paused" : "resumed"} at any time from the promo management page.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={handleClose} disabled={isLoading}>
            Cancel
          </ButtonModule>
          <ButtonModule variant="primary" className="flex-1" size="lg" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {promo.isPaused ? "Resuming..." : "Pausing..."}
              </>
            ) : (
              <>{promo.isPaused ? "Resume Promo" : "Pause Promo"}</>
            )}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PausePromoModal
