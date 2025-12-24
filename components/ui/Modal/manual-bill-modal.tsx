"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch } from "lib/hooks/useRedux"
import { notify } from "components/ui/Notification/Notification"
import { createManualBill } from "lib/redux/postpaidSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import { useAppSelector } from "lib/hooks/useRedux"

interface ManualBillModalProps {
  isOpen: boolean
  onRequestClose: () => void
  customerId: number
  customerName: string
  accountNumber: string
  distributionSubstationId: number
  feederId: number
  tariffPerKwh: number
  vatRate: number
}

const ManualBillModal: React.FC<ManualBillModalProps> = ({
  isOpen,
  onRequestClose,
  customerId,
  customerName,
  accountNumber,
  distributionSubstationId,
  feederId,
  tariffPerKwh,
  vatRate,
}) => {
  const dispatch = useAppDispatch()
  const { billingPeriods, loading: billingPeriodsLoading } = useAppSelector((state) => state.billingPeriods)

  const [billingPeriodId, setBillingPeriodId] = React.useState<number | "">("")
  const [category, setCategory] = React.useState<number | "">("")
  const [previousReadingKwh, setPreviousReadingKwh] = React.useState("")
  const [presentReadingKwh, setPresentReadingKwh] = React.useState("")
  const [energyCapKwh, setEnergyCapKwh] = React.useState("")
  const [isEstimated, setIsEstimated] = React.useState(false)
  const [estimatedConsumptionKwh, setEstimatedConsumptionKwh] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      // Fetch billing periods
      dispatch(fetchBillingPeriods({ status: 1 })) // Fetch active periods
      setBillingPeriodId("")
      setCategory("")
      setPreviousReadingKwh("")
      setPresentReadingKwh("")
      setEnergyCapKwh("")
      setIsEstimated(false)
      setEstimatedConsumptionKwh("")
    }
  }, [isOpen, dispatch])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (billingPeriodId === "" || Number.isNaN(Number(billingPeriodId))) {
      notify("error", "Please select a billing period")
      return
    }

    if (category === "" || Number.isNaN(Number(category))) {
      notify("error", "Please provide a valid category")
      return
    }

    if (!previousReadingKwh || !presentReadingKwh) {
      notify("error", "Please provide all meter readings")
      return
    }

    if (category === 2 && !energyCapKwh) {
      notify("error", "Please provide energy cap for unmetered customers")
      return
    }

    if (isEstimated && !estimatedConsumptionKwh) {
      notify("error", "Please provide estimated consumption when bill is estimated")
      return
    }

    const previousReading = Number(previousReadingKwh)
    const presentReading = Number(presentReadingKwh)
    const energyCap = category === 2 ? Number(energyCapKwh) : 0
    const categoryValue = Number(category)
    const estimatedKwh = estimatedConsumptionKwh ? Number(estimatedConsumptionKwh) : undefined

    if ([previousReading, presentReading, categoryValue].some((v) => Number.isNaN(v))) {
      notify("error", "Numeric fields must contain valid numbers")
      return
    }

    if (category === 2 && Number.isNaN(energyCap)) {
      notify("error", "Energy cap must contain a valid number")
      return
    }

    if (presentReading < previousReading) {
      notify("error", "Present reading cannot be less than previous reading")
      return
    }

    try {
      setIsLoading(true)

      const result = await dispatch(
        createManualBill({
          customerId,
          billingPeriodId: Number(billingPeriodId),
          category: categoryValue,
          feederId,
          distributionSubstationId,
          previousReadingKwh: previousReading,
          presentReadingKwh: presentReading,
          ...(category === 2 ? { energyCapKwh: energyCap } : {}),
          tariffPerKwh,
          vatRate,
          isEstimated,
          ...(isEstimated && estimatedKwh !== undefined ? { estimatedConsumptionKwh: estimatedKwh } : {}),
        })
      )

      if (createManualBill.fulfilled.match(result)) {
        notify("success", "Manual bill generated successfully")
        onRequestClose()
      } else {
        throw new Error((result.payload as string) || "Failed to generate manual bill")
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to generate manual bill")
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
        className="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl sm:max-w-lg md:max-w-xl 2xl:max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:px-6 sm:py-5">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">Generate Manual Bill</h2>
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
              Provide the billing details to generate a manual bill for this customer.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormSelectModule
                label="Billing Period"
                name="billingPeriodId"
                value={billingPeriodId === "" ? "" : billingPeriodId}
                onChange={({ target }) => setBillingPeriodId(target.value === "" ? "" : Number(target.value))}
                options={billingPeriods.map((period) => ({
                  value: period.id,
                  label: period.displayName,
                }))}
                required
                disabled={isLoading || billingPeriodsLoading}
              />

              <FormSelectModule
                label="Category"
                name="category"
                value={category === "" ? "" : category}
                onChange={({ target }) => setCategory(target.value === "" ? "" : Number(target.value))}
                options={[
                  { value: 1, label: "Metered" },
                  { value: 2, label: "Unmetered" },
                ]}
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

              {category === 2 && (
                <FormInputModule
                  label="Energy Cap (kWh)"
                  type="number"
                  placeholder="0"
                  value={energyCapKwh}
                  onChange={(e) => setEnergyCapKwh(e.target.value)}
                  required
                  disabled={isLoading}
                />
              )}

              <div className="flex items-center gap-2 pt-5">
                <input
                  id="isEstimated"
                  type="checkbox"
                  checked={isEstimated}
                  onChange={(e) => setIsEstimated(e.target.checked)}
                  disabled={isLoading}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isEstimated" className="text-xs text-gray-700 sm:text-sm">
                  Estimated bill
                </label>
              </div>

              {isEstimated && (
                <FormInputModule
                  label="Estimated Consumption (kWh)"
                  type="number"
                  placeholder="0"
                  value={estimatedConsumptionKwh}
                  onChange={(e) => setEstimatedConsumptionKwh(e.target.value)}
                  required
                  disabled={isLoading}
                />
              )}

              <FormInputModule
                label="Tariff / kWh"
                type="number"
                placeholder=""
                value={tariffPerKwh}
                onChange={() => {}}
                disabled
              />

              <FormInputModule
                label="VAT Rate (%)"
                type="number"
                placeholder=""
                value={vatRate}
                onChange={() => {}}
                disabled
              />
            </div>
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
            {isLoading ? "Generating..." : "Generate Bill"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ManualBillModal
