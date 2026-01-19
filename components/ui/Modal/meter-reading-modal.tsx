"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { notify } from "components/ui/Notification/Notification"
import { createMeterReading } from "lib/redux/postpaidSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"

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
  const { billingPeriods } = useAppSelector((state) => state.billingPeriods)

  const [billingPeriodId, setBillingPeriodId] = React.useState("")
  const [previousReadingKwh, setPreviousReadingKwh] = React.useState("")
  const [presentReadingKwh, setPresentReadingKwh] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setBillingPeriodId("")
      setPreviousReadingKwh("")
      setPresentReadingKwh("")
      setNotes("")

      // Fetch billing periods
      dispatch(
        fetchBillingPeriods({
          status: 1,
          pageNumber: 1,
          pageSize: 100,
        })
      ) // Fetch active periods
    }
  }, [isOpen, dispatch])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!billingPeriodId) {
      notify("error", "Please select a billing period")
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
          billingPeriodId: Number(billingPeriodId),
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
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:px-6 sm:py-5">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">Record Meter Reading</h2>
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
              <FormSelectModule
                label="Billing Period"
                name="billingPeriodId"
                value={billingPeriodId === "" ? "" : billingPeriodId}
                onChange={({ target }) => setBillingPeriodId(target.value === "" ? "" : target.value)}
                options={billingPeriods.map((period) => ({
                  value: period.id,
                  label: period.displayName,
                }))}
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

        <div className="flex gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:gap-4 sm:px-6 sm:py-5">
          <ButtonModule
            variant="secondary"
            className="flex w-full text-sm sm:text-base"
            size="md"
            onClick={onRequestClose}
            disabled={isLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex w-full text-sm sm:text-base"
            size="md"
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
