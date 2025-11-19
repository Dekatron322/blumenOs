"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormSelectModule } from "../Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { finalizeBillingPeriod, finalizeBillingPeriodByAreaOffice } from "lib/redux/postpaidSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { notify } from "components/ui/Notification/Notification"

interface StartBillingRunProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
}

type TabType = "period" | "areaOffice"

const StartBillingRun: React.FC<StartBillingRunProps> = ({ isOpen, onRequestClose, onSuccess }) => {
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState<TabType>("period")
  const [formData, setFormData] = useState({
    period: "",
    areaOfficeId: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get area offices from Redux store
  const { areaOffices, loading: areaOfficesLoading } = useAppSelector((state) => state.areaOffices)
  const { finalizeByAreaOfficeLoading } = useAppSelector((state) => state.postpaidBilling)

  // Fetch area offices when component mounts or modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(
        fetchAreaOffices({
          pageNumber: 1,
          pageSize: 100, // Fetch all area offices
        })
      )
    }
  }, [dispatch, isOpen])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    setFormData((prev) => ({
      ...prev,
      [name]: String(value),
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async () => {
    if (!isFormValid()) return

    setLoading(true)
    setError(null)

    try {
      if (activeTab === "period") {
        // Finalize by period
        const resultAction = await dispatch(
          finalizeBillingPeriod({
            period: formData.period,
          })
        )

        if (finalizeBillingPeriod.rejected.match(resultAction)) {
          const message = (resultAction.payload as string) || "Failed to start billing run"
          throw new Error(message)
        }

        const payload = resultAction.payload as { message?: string } | undefined
        const successMessage = payload?.message || "Billing run started successfully"

        notify("success", successMessage)
        console.log("Billing run started successfully:", successMessage)
      } else {
        // Finalize by area office
        const resultAction = await dispatch(
          finalizeBillingPeriodByAreaOffice({
            areaOfficeId: parseInt(formData.areaOfficeId),
            requestData: {
              period: formData.period,
            },
          })
        )

        if (finalizeBillingPeriodByAreaOffice.rejected.match(resultAction)) {
          const message = (resultAction.payload as string) || "Failed to start billing run for area office"
          throw new Error(message)
        }

        const payload = resultAction.payload as { message?: string } | undefined
        const successMessage = payload?.message || "Billing run started successfully for area office"

        notify("success", successMessage)
        console.log("Billing run started successfully for area office:", successMessage)
      }

      onRequestClose()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Failed to start billing run:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    if (!formData.period.trim() || formData.period.length !== 7) {
      return false
    }

    if (activeTab === "areaOffice" && !formData.areaOfficeId) {
      return false
    }

    return true
  }

  // Generate period options (last 12 months and next 3 months)
  const generatePeriodOptions = () => {
    const options = []
    const currentDate = new Date()

    // Add empty option
    options.push({ value: "", label: "Select billing period" })

    // Add previous 12 months
    for (let i = 12; i >= 1; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const period = `${year}-${month}`
      options.push({
        value: period,
        label: `${date.toLocaleString("default", { month: "long" })} ${year}`,
      })
    }

    // Add current and next 3 months
    for (let i = 0; i <= 3; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const period = `${year}-${month}`
      options.push({
        value: period,
        label: `${date.toLocaleString("default", { month: "long" })} ${year}`,
      })
    }

    return options
  }

  // Generate area office options
  const generateAreaOfficeOptions = () => {
    const options = [{ value: "", label: "Select area office" }]

    if (areaOffices.length > 0) {
      areaOffices.forEach((office) => {
        options.push({
          value: office.id.toString(),
          label: office.nameOfNewOAreaffice || `Area Office ${office.id}`,
        })
      })
    }

    return options
  }

  const periodOptions = generatePeriodOptions()
  const areaOfficeOptions = generateAreaOfficeOptions()

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[500px] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-6">
          <h2 className="text-xl font-bold text-gray-900">Start Billing Run</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("period")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "period"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Finalize by Period
            </button>
            <button
              onClick={() => setActiveTab("areaOffice")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "areaOffice"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Finalize by Area Office
            </button>
          </nav>
        </div>

        <div className="mt-6 px-6 pb-6">
          {/* Warning Message */}
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Starting a billing run will finalize bills for the selected{" "}
                    {activeTab === "period" ? "period" : "area office"}. This action cannot be undone and will:
                  </p>
                  <ul className="mt-1 list-inside list-disc space-y-1">
                    <li>
                      Generate final bills for{" "}
                      {activeTab === "period" ? "all customers" : "customers in the selected area office"}
                    </li>
                    <li>Calculate final consumption and charges</li>
                    <li>Close the billing period for adjustments</li>
                    <li>Make bills available for customer viewing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Period Selection - Always Required */}
          <FormSelectModule
            label="Billing Period"
            name="period"
            value={formData.period}
            onChange={handleInputChange}
            options={periodOptions}
            required
          />

          {/* Area Office Selection - Only for Area Office Tab */}
          {activeTab === "areaOffice" && (
            <div className="mt-4">
              <FormSelectModule
                label="Area Office"
                name="areaOfficeId"
                value={formData.areaOfficeId}
                onChange={handleInputChange}
                options={areaOfficeOptions}
                required
                disabled={areaOfficesLoading}
              />
              {areaOfficesLoading && <p className="mt-1 text-sm text-gray-500">Loading area offices...</p>}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="mt-6 flex items-start space-x-3">
            <input
              type="checkbox"
              id="confirmation"
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required
            />
            <label htmlFor="confirmation" className="text-sm text-gray-700">
              {activeTab === "period" ? (
                <>
                  I understand that this action will finalize the billing period for all area offices and cannot be
                  undone. I have verified that all meter readings and adjustments are complete for{" "}
                  {formData.period || "the selected period"}.
                </>
              ) : (
                <>
                  I understand that this action will finalize the billing period for the selected area office and cannot
                  be undone. I have verified that all meter readings and adjustments are complete for{" "}
                  {formData.period || "the selected period"} in this area office.
                </>
              )}
            </label>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule
            variant="dangerSecondary"
            className="flex"
            size="lg"
            onClick={onRequestClose}
            disabled={loading || finalizeByAreaOfficeLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormValid() || loading || finalizeByAreaOfficeLoading}
            loading={loading || finalizeByAreaOfficeLoading}
          >
            {loading || finalizeByAreaOfficeLoading
              ? `Starting Billing Run...`
              : `Start Billing Run${activeTab === "areaOffice" ? " for Area Office" : ""}`}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default StartBillingRun
