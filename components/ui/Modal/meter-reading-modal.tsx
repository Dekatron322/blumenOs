"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { useAppDispatch } from "lib/hooks/useRedux"
import { notify } from "components/ui/Notification/Notification"
import { createMeterReading } from "lib/redux/postpaidSlice"

interface MeterReadingModalProps {
  isOpen: boolean
  onRequestClose: () => void
  customerId: number
  customerName: string
  accountNumber: string
}

const MeterReadingModal: React.FC<MeterReadingModalProps> = ({
  isOpen,
  onRequestClose,
  customerId,
  customerName,
  accountNumber,
}) => {
  const dispatch = useAppDispatch()

  const [period, setPeriod] = React.useState("")
  const [previousReadingKwh, setPreviousReadingKwh] = React.useState("")
  const [presentReadingKwh, setPresentReadingKwh] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      const now = new Date()
      const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      setPeriod(defaultPeriod)
      setPreviousReadingKwh("")
      setPresentReadingKwh("")
      setNotes("")
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!period.trim()) {
      notify("error", "Please provide a meter reading period")
      return
    }

    if (!previousReadingKwh || !presentReadingKwh) {
      notify("error", "Please provide both previous and present readings")
      return
    }

    const previousReading = Number(previousReadingKwh)
    const presentReading = Number(presentReadingKwh)

    if ([previousReading, presentReading].some((v) => Number.isNaN(v))) {
      notify("error", "Readings must contain valid numbers")
      return
    }

    if (presentReading < previousReading) {
      notify("error", "Present reading cannot be less than previous reading")
      return
    }

    try {
      setIsLoading(true)

      const result = await dispatch(
        createMeterReading({
          customerId,
          period: period.trim(),
          previousReadingKwh: previousReading,
          presentReadingKwh: presentReading,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        })
      )

      if (createMeterReading.fulfilled.match(result)) {
        notify("success", "Meter reading created successfully")
        onRequestClose()
      } else {
        throw new Error((result.payload as string) || "Failed to create meter reading")
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to create meter reading")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-3 backdrop-blur-sm sm:px-4"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl sm:max-w-lg md:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">Generate Meter Reading</h2>
          <button
            onClick={onRequestClose}
            className="flex size-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-8"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-4 px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="mb-2 w-full text-center">
              <h3 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">{customerName}</h3>
              <p className="text-xs text-gray-600 sm:text-sm">Account: {accountNumber}</p>
            </div>

            <p className="text-xs text-gray-500 sm:text-sm">
              Capture the meter reading for this customer. Ensure readings are accurate before submitting.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormInputModule
                label="Period"
                type="text"
                placeholder="e.g. 2025-01"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
                disabled={isLoading}
              />

              <FormInputModule
                label="Previous Reading (kWh)"
                type="number"
                placeholder="0"
                value={previousReadingKwh}
                onChange={(e) => setPreviousReadingKwh(e.target.value)}
                required
                disabled={isLoading}
              />

              <FormInputModule
                label="Present Reading (kWh)"
                type="number"
                placeholder="0"
                value={presentReadingKwh}
                onChange={(e) => setPresentReadingKwh(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <FormTextAreaModule
              label="Notes (Optional)"
              name="notes"
              placeholder="Add any notes about this meter reading..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex gap-3 bg-white px-4 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:gap-4 sm:px-6 sm:py-5">
          <ButtonModule
            variant="secondary"
            className="flex-1 text-sm sm:text-base"
            size="sm"
            onClick={onRequestClose}
            disabled={isLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex-1 text-sm sm:text-base"
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Meter Reading"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MeterReadingModal
