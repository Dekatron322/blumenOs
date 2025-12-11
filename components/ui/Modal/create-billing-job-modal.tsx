"use client"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

import { FormSelectModule } from "../Input/FormSelectModule"
import { ButtonModule } from "../Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCreateBillingJob, createBillingJob } from "lib/redux/postpaidSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { AlertCircle, Building, Calendar, CheckCircle, Info, X } from "lucide-react"

interface CreateBillingJobModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
}

const CreateBillingJobModal: React.FC<CreateBillingJobModalProps> = ({ isOpen, onRequestClose, onSuccess }) => {
  const dispatch = useAppDispatch()
  const { createBillingJobLoading, createBillingJobError, createBillingJobSuccess, createBillingJobMessage } =
    useAppSelector((state) => state.postpaidBilling)

  const { areaOffices, loading: areaOfficesLoading } = useAppSelector((state) => state.areaOffices)

  const [formData, setFormData] = useState({
    period: "",
    areaOfficeId: "",
  })

  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")

  const [errors, setErrors] = useState({
    period: "",
    areaOfficeId: "",
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        period: "",
        areaOfficeId: "",
      })
      setErrors({
        period: "",
        areaOfficeId: "",
      })
      setMonth("")
      setYear("")
      dispatch(clearCreateBillingJob())

      // Load area offices for the dropdown if not already loaded
      if (!areaOffices || areaOffices.length === 0) {
        dispatch(
          fetchAreaOffices({
            PageNumber: 1,
            PageSize: 100,
          })
        )
      }
    }
  }, [isOpen, dispatch, areaOffices])

  // Handle success
  useEffect(() => {
    if (createBillingJobSuccess && isOpen) {
      onRequestClose()
      if (onSuccess) onSuccess()
    }
  }, [createBillingJobSuccess, isOpen, onRequestClose, onSuccess])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = ("target" in e ? e.target : e) as {
      name: string
      value: string | number
    }
    const stringValue = typeof value === "number" ? String(value) : value

    setFormData((prev) => ({
      ...prev,
      [name]: stringValue,
    }))

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors = {
      period: "",
      areaOfficeId: "",
    }

    if (!formData.period.trim()) {
      newErrors.period = "Billing period is required"
    } else if (!/^\d{4}-\d{2}$/.test(formData.period)) {
      newErrors.period = "Period must be in YYYY-MM format"
    }

    setErrors(newErrors)
    return !newErrors.period
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const requestData: { period: string; areaOfficeId?: number } = {
        period: formData.period,
      }

      if (formData.areaOfficeId.trim()) {
        requestData.areaOfficeId = parseInt(formData.areaOfficeId)
      }

      await dispatch(createBillingJob(requestData)).unwrap()

      // Success is handled in the useEffect above
    } catch (error) {
      // Error is handled by Redux state
      console.error("Failed to create billing job:", error)
    }
  }

  const isFormValid = () => {
    return !!formData.period.trim()
  }

  const getCurrentPeriod = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }

  const handleQuickSelectCurrentPeriod = () => {
    const currentPeriod = getCurrentPeriod()
    setFormData((prev) => ({
      ...prev,
      period: currentPeriod,
    }))

    const [, currentMonth] = currentPeriod.split("-")
    setMonth(currentMonth ?? "")
    setYear(currentPeriod.split("-")[0] ?? "")

    // Clear period error if any
    if (errors.period) {
      setErrors((prev) => ({
        ...prev,
        period: "",
      }))
    }
  }

  const handleMonthChange = (
    e: React.ChangeEvent<HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const { value } = ("target" in e ? e.target : e) as { name: string; value: string | number }
    const selectedMonth = String(value)
    setMonth(selectedMonth)

    const now = new Date()
    const currentYear = String(now.getFullYear())
    const selectedYear = year || currentYear

    setFormData((prev) => ({
      ...prev,
      period: selectedMonth ? `${selectedYear}-${selectedMonth}` : "",
    }))

    if (errors.period) {
      setErrors((prev) => ({
        ...prev,
        period: "",
      }))
    }
  }

  const handleYearChange = (
    e: React.ChangeEvent<HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const { value } = ("target" in e ? e.target : e) as { name: string; value: string | number }
    const selectedYear = String(value)
    setYear(selectedYear)

    setFormData((prev) => ({
      ...prev,
      period: selectedYear && month ? `${selectedYear}-${month}` : "",
    }))

    if (errors.period) {
      setErrors((prev) => ({
        ...prev,
        period: "",
      }))
    }
  }

  if (!isOpen) return null

  const monthOptions = [
    { value: "", label: "Select month" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const yearOptions = [
    { value: "", label: "Select year" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
    { value: "2028", label: "2028" },
  ]

  const areaOfficeOptions = [
    { value: "", label: areaOfficesLoading ? "Loading area offices..." : "Select Area Office" },
    ...areaOffices.map((office) => ({
      value: String(office.id),
      label: office.nameOfNewOAreaffice,
    })),
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm sm:p-4"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg rounded-lg bg-white shadow-2xl sm:max-w-xl md:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Responsive */}
        <div className="flex w-full items-start justify-between rounded-t-xl bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Create Billing Job</h2>
            <p className="mt-1 text-sm text-gray-600">
              Start a new billing process for a specific period and area office
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

        {/* Modal Content - Responsive */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Error Message */}
            {createBillingJobError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="size-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Failed to create billing job</h3>
                    <p className="mt-1 text-sm text-red-700">{createBillingJobError}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {createBillingJobSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="size-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Billing job created successfully</h3>
                    <p className="mt-1 text-sm text-green-700">{createBillingJobMessage}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Period Selection Section */}
            <div className="space-y-4 rounded-lg bg-gray-50 p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Calendar className="size-4 text-blue-500" />
                  Billing Period
                </h3>
                <button
                  type="button"
                  onClick={handleQuickSelectCurrentPeriod}
                  className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-500 sm:text-sm"
                >
                  <Calendar className="mr-1 size-3 sm:size-4" />
                  Use Current Month
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <FormSelectModule
                  label="Month"
                  name="month"
                  value={month}
                  onChange={handleMonthChange}
                  options={monthOptions}
                  required
                  error={errors.period}
                  className="w-full"
                />

                <FormSelectModule
                  label="Year"
                  name="year"
                  value={year}
                  onChange={handleYearChange}
                  options={yearOptions}
                  required
                  className="w-full"
                />
              </div>

              {/* Period Display */}
              {formData.period ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-center">
                    <Info className="mr-2 size-4 text-blue-400 sm:size-5" />
                    <span className="text-sm font-medium text-blue-800">
                      Selected Period: <span className="font-bold">{formData.period}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="flex items-center">
                    <Info className="mr-2 size-4 text-gray-400" />
                    <p className="text-xs text-gray-600 sm:text-sm">
                      <span className="font-medium">Format:</span> YYYY-MM (e.g., 2024-12 for December 2024)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Area Office Selection Section */}
            <div className="space-y-4 rounded-lg bg-gray-50 p-4 sm:p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Building className="size-4 text-blue-500" />
                Area Office (Optional)
              </h3>

              <FormSelectModule
                label="Select Area Office"
                name="areaOfficeId"
                value={formData.areaOfficeId}
                onChange={handleInputChange}
                options={areaOfficeOptions}
                className="w-full"
              />

              {/* Area Office Display */}
              {formData.areaOfficeId ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center">
                    <Building className="mr-2 size-4 text-green-400 sm:size-5" />
                    <span className="text-sm font-medium text-green-800">
                      {areaOfficeOptions.find((opt) => opt.value === formData.areaOfficeId)?.label}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <div className="flex items-start">
                    <Info className="mr-2 mt-0.5 size-4 flex-shrink-0 text-blue-400" />
                    <p className="text-xs text-blue-700">
                      No area office selected. Billing jobs will be generated for{" "}
                      <span className="font-semibold">all area offices</span> for the selected period.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Job Information Summary */}
            {formData.period && formData.areaOfficeId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:p-5"
              >
                <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <AlertCircle className="size-4" />
                  Job Summary
                </h4>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-amber-700">Billing Period:</span>
                    <span className="text-sm font-medium text-amber-800 sm:text-base">{formData.period}</span>
                  </div>

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-amber-700">Area Office:</span>
                    <span className="text-sm font-medium text-amber-800 sm:text-base">
                      {areaOfficeOptions.find((opt) => opt.value === formData.areaOfficeId)?.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-amber-700">Status:</span>
                    <span className="text-sm font-medium text-amber-600 sm:text-base">Pending</span>
                  </div>
                </div>

                <div className="border-t border-amber-200 pt-3">
                  <p className="text-xs text-amber-600">
                    This will create a new billing job that will process all customers in the selected area office for
                    the specified period.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Quick Info for Mobile */}
            {!formData.period && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:hidden">
                <div className="flex items-start">
                  <Info className="mr-2 mt-0.5 size-4 flex-shrink-0 text-gray-400" />
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Tip:</span> Select both month and year to create a billing job
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer - Responsive */}
        <div className="flex flex-col gap-3 rounded-b-xl bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:flex-row sm:gap-4 sm:p-6">
          <ButtonModule
            variant="dangerSecondary"
            size="md"
            onClick={onRequestClose}
            disabled={createBillingJobLoading}
            className="w-full sm:flex-1"
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!isFormValid() || createBillingJobLoading}
            className="w-full sm:flex-1"
          >
            {createBillingJobLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="size-4 animate-spin text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Creating...</span>
              </div>
            ) : (
              "Create Billing Job"
            )}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CreateBillingJobModal
