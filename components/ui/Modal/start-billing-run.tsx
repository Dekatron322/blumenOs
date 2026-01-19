"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "../Button/Button"
import { FormSelectModule } from "../Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { finalizeBillingPeriod, finalizeBillingPeriodByAreaOffice } from "lib/redux/postpaidSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import { notify } from "components/ui/Notification/Notification"
import { AlertCircle, AlertTriangle, Building, Calendar, CheckCircle, Loader2, X } from "lucide-react"

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
    billingPeriodId: "",
    areaOfficeId: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Get area offices and billing periods from Redux store
  const { areaOffices, loading: areaOfficesLoading } = useAppSelector((state) => state.areaOffices)
  const { finalizeByAreaOfficeLoading } = useAppSelector((state) => state.postpaidBilling)
  const { billingPeriods, loading: billingPeriodsLoading } = useAppSelector((state) => state.billingPeriods)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fetch area offices and billing periods when component mounts or modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(
        fetchAreaOffices({
          PageNumber: 1,
          PageSize: 100, // Fetch all area offices
        })
      )
      dispatch(
        fetchBillingPeriods({
          pageNumber: 0,
          pageSize: 0,
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
            billingPeriodId: parseInt(formData.billingPeriodId),
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
              billingPeriodId: parseInt(formData.billingPeriodId),
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
    if (!formData.billingPeriodId.trim()) {
      return false
    }

    if (activeTab === "areaOffice" && !formData.areaOfficeId) {
      return false
    }

    if (!isConfirmed) {
      return false
    }

    return true
  }

  // Generate period options from fetched billing periods
  const generatePeriodOptions = () => {
    const options = [{ value: "", label: "Select billing period" }]

    if (billingPeriods.length > 0) {
      // Sort billing periods by year and month (newest first)
      const sortedPeriods = [...billingPeriods].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })

      sortedPeriods.forEach((period) => {
        options.push({
          value: period.id.toString(),
          label: period.displayName,
        })
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
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-2 backdrop-blur-sm sm:p-4"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl sm:max-w-xl md:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex w-full items-start justify-between rounded-t-xl bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Start Billing Run</h2>
            <p className="mt-1 text-sm text-gray-600">
              Finalize bills for {activeTab === "period" ? "entire period" : "specific area office"}
            </p>
          </div>
          <button
            onClick={onRequestClose}
            className="ml-3 flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Mobile Tab Navigation */}
        {isMobile && (
          <div className=" bg-white px-4 pt-3 sm:hidden">
            <div className="flex gap-4 rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setActiveTab("period")}
                className={`flex w-full items-center justify-center gap-4 rounded-md p-4 py-2 text-center text-sm font-medium transition-colors ${
                  activeTab === "period" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex  items-center gap-4">
                  <Calendar className="size-4" />
                  <span className="mt-1">By Period</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("areaOffice")}
                className={`flex w-full items-center justify-center rounded-md py-2 text-center text-sm font-medium transition-colors ${
                  activeTab === "areaOffice" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Building className="size-4" />
                  <span className="mt-1">By Area</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Desktop Tab Navigation */}
        {!isMobile && (
          <div className="border-gray-200 bg-white sm:border-b">
            <nav className="flex gap-4 px-4 py-2 sm:px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("period")}
                className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
                  activeTab === "period" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center gap-4">
                  <Calendar className="size-4" />
                  <span className="mt-1">Publish By Billing Period</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("areaOffice")}
                className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
                  activeTab === "areaOffice" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center gap-4">
                  <Building className="size-4" />
                  <span className="mt-1">Publish By Area Office</span>
                </div>
              </button>
            </nav>
          </div>
        )}

        <div className="mt-4 px-4 pb-4  sm:mt-6 sm:px-6 sm:pb-6">
          {/* Warning Message */}
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 max-sm:hidden sm:mb-6 sm:p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="size-5 text-amber-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Important Notice</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p className="mb-2">
                    Starting a billing run will finalize bills for the selected{" "}
                    <span className="font-semibold">{activeTab === "period" ? "period" : "area office"}</span>. This
                    action cannot be undone.
                  </p>
                  <ul className="mt-1 space-y-1">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Generate final bills for{" "}
                        {activeTab === "period" ? "all customers" : "customers in the selected area office"}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Calculate final consumption and charges</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Close the billing period for adjustments</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Make bills available for customer viewing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 sm:space-y-6">
            {/* Period Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Calendar className="size-4 text-blue-500" />
                Billing Period
              </label>
              <FormSelectModule
                label=""
                name="billingPeriodId"
                value={formData.billingPeriodId}
                onChange={handleInputChange}
                options={periodOptions}
                required
                disabled={billingPeriodsLoading || loading}
                className="w-full"
              />
              {billingPeriodsLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="size-3 animate-spin" />
                  <span>Loading billing periods...</span>
                </div>
              )}
            </div>

            {/* Area Office Selection (only shown for area office tab) */}
            {activeTab === "areaOffice" && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Building className="size-4 text-green-500" />
                  Area Office
                </label>
                <FormSelectModule
                  label=""
                  name="areaOfficeId"
                  value={formData.areaOfficeId}
                  onChange={handleInputChange}
                  options={areaOfficeOptions}
                  required
                  disabled={areaOfficesLoading}
                  className="w-full"
                />
                {areaOfficesLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="size-3 animate-spin" />
                    <span>Loading area offices...</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4"
              >
                <div className="flex items-start">
                  <AlertCircle className="mr-2 mt-0.5 size-5 flex-shrink-0 text-red-400" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </motion.div>
            )}

            {/* Confirmation Checkbox */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirmation"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <label htmlFor="confirmation" className="text-sm text-gray-700">
                  {activeTab === "period" ? (
                    <>
                      I understand that this action will finalize the billing period for{" "}
                      <span className="font-semibold">all area offices</span> and cannot be undone. I have verified that
                      all meter readings and adjustments are complete for{" "}
                      <span className="font-semibold">
                        {formData.billingPeriodId
                          ? periodOptions.find((opt) => opt.value === formData.billingPeriodId)?.label ||
                            "the selected period"
                          : "the selected period"}
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      I understand that this action will finalize the billing period for the{" "}
                      <span className="font-semibold">selected area office</span> and cannot be undone. I have verified
                      that all meter readings and adjustments are complete for{" "}
                      <span className="font-semibold">
                        {formData.billingPeriodId
                          ? periodOptions.find((opt) => opt.value === formData.billingPeriodId)?.label ||
                            "the selected period"
                          : "the selected period"}
                      </span>{" "}
                      in this area office.
                    </>
                  )}
                </label>
              </div>

              {!isConfirmed && (formData.billingPeriodId || formData.areaOfficeId) && (
                <div className="mt-3 flex items-start gap-2 text-sm text-amber-600">
                  <AlertTriangle className="size-4 flex-shrink-0" />
                  <span>You must confirm this action to proceed</span>
                </div>
              )}
            </div>

            {/* Summary Preview */}
            {(formData.billingPeriodId || formData.areaOfficeId) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4"
              >
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <CheckCircle className="size-4" />
                  Action Summary
                </h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span>Billing Period:</span>
                    <span className="font-semibold">{formData.billingPeriodId || "Not selected"}</span>
                  </div>
                  {activeTab === "areaOffice" && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Area Office:</span>
                      <span className="font-semibold">
                        {formData.areaOfficeId
                          ? areaOfficeOptions.find((opt) => opt.value === formData.areaOfficeId)?.label
                          : "Not selected"}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span>Scope:</span>
                    <span className="font-semibold">
                      {activeTab === "period" ? "All Area Offices" : "Single Area Office"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col gap-3 rounded-b-xl bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:flex-row sm:gap-4 sm:p-6">
          <ButtonModule
            variant="dangerSecondary"
            size="lg"
            onClick={onRequestClose}
            disabled={loading || finalizeByAreaOfficeLoading}
            className="w-full sm:flex-1"
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormValid() || loading || finalizeByAreaOfficeLoading}
            className="w-full sm:flex-1"
          >
            {loading || finalizeByAreaOfficeLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Starting...
              </span>
            ) : (
              `Start Billing Run${activeTab === "areaOffice" ? "" : ""}`
            )}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default StartBillingRun
