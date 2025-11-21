"use client"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { FormSelectModule } from "../Input/FormSelectModule"
import { ButtonModule } from "../Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCreateBillingJob, createBillingJob } from "lib/redux/postpaidSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"

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

  const [errors, setErrors] = useState({
    period: "",
    areaOfficeId: "",
  })

  // Period options (typically current and previous months)
  const getPeriodOptions = () => {
    const options: { value: string; label: string }[] = [{ value: "", label: "Select Billing Period" }]

    const now = new Date()
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    })

    // Include current month + next 5 months
    for (let i = 0; i <= 5; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const value = `${year}-${month}`
      const label = formatter.format(date)
      options.push({ value, label })
    }

    return options
  }

  const periodOptions = getPeriodOptions()

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
      dispatch(clearCreateBillingJob())

      // Load area offices for the dropdown if not already loaded
      if (!areaOffices || areaOffices.length === 0) {
        dispatch(
          fetchAreaOffices({
            pageNumber: 1,
            pageSize: 100,
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

    if (!formData.areaOfficeId.trim()) {
      newErrors.areaOfficeId = "Area office is required"
    }

    setErrors(newErrors)
    return !newErrors.period && !newErrors.areaOfficeId
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const requestData = {
        period: formData.period,
        areaOfficeId: parseInt(formData.areaOfficeId),
      }

      await dispatch(createBillingJob(requestData)).unwrap()

      // Success is handled in the useEffect above
    } catch (error) {
      // Error is handled by Redux state
      console.error("Failed to create billing job:", error)
    }
  }

  const isFormValid = () => {
    return formData.period.trim() && formData.areaOfficeId.trim()
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

    // Clear period error if any
    if (errors.period) {
      setErrors((prev) => ({
        ...prev,
        period: "",
      }))
    }
  }

  if (!isOpen) return null

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
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[600px] max-w-2xl rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Billing Job</h2>
            <p className="mt-1 text-sm text-gray-600">
              Start a new billing process for a specific period and area office
            </p>
          </div>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[60vh]">
          <div className="flex flex-col gap-6 p-6">
            {/* Error Message */}
            {createBillingJobError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
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
                className="rounded-lg border border-green-200 bg-green-50 p-4"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L6.53 10.22a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.154-.114l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Billing job created successfully</h3>
                    <p className="mt-1 text-sm text-green-700">{createBillingJobMessage}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-6">
              {/* Period Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleQuickSelectCurrentPeriod}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Use Current Month
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <FormSelectModule
                      label="Billing Period"
                      name="period"
                      value={formData.period}
                      onChange={handleInputChange}
                      options={periodOptions}
                      required
                      error={errors.period}
                    />
                  </div>

                  {formData.period && (
                    <div className="col-span-2">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <div className="flex items-center">
                          <svg className="mr-2 h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium text-blue-800">Selected Period: {formData.period}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {!formData.period && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      <strong>Format:</strong> YYYY-MM (e.g., 2024-12 for December 2024)
                    </p>
                  </div>
                )}
              </div>

              {/* Area Office Selection */}
              <div className="space-y-4">
                <FormSelectModule
                  label="Area Office"
                  name="areaOfficeId"
                  value={formData.areaOfficeId}
                  onChange={handleInputChange}
                  options={areaOfficeOptions}
                  required
                  error={errors.areaOfficeId}
                />

                {formData.areaOfficeId && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center">
                      <svg className="mr-2 h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21.324-.455.63-.739.914a.75.75 0 101.06 1.06c.37-.369.69-.77.96-1.193a26.61 26.61 0 013.095 2.348.75.75 0 00.992 0 26.547 26.547 0 015.93-3.95.75.75 0 00.42-.739 41.053 41.053 0 00-.39-3.114 29.925 29.925 0 00-5.199 2.801 2.25 2.25 0 01-2.514 0c-.41-.275-.826-.541-1.25-.797a6.985 6.985 0 01-1.084 3.45 26.503 26.503 0 00-1.281-.78A5.487 5.487 0 006 12v-.54z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        {areaOfficeOptions.find((opt) => opt.value === formData.areaOfficeId)?.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Job Information Summary */}
              {formData.period && formData.areaOfficeId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                >
                  <h4 className="mb-2 text-sm font-semibold text-amber-800">Job Summary</h4>
                  <div className="space-y-2 text-sm text-amber-700">
                    <div className="flex justify-between">
                      <span>Billing Period:</span>
                      <span className="font-medium">{formData.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Area Office:</span>
                      <span className="font-medium">
                        {areaOfficeOptions.find((opt) => opt.value === formData.areaOfficeId)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium text-amber-600">Pending</span>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-amber-200 pt-3">
                    <p className="text-xs text-amber-600">
                      This will create a new billing job that will process all customers in the selected area office for
                      the specified period.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule
            variant="dangerSecondary"
            className="flex-1"
            size="lg"
            onClick={onRequestClose}
            disabled={createBillingJobLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex-1"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormValid() || createBillingJobLoading}
          >
            {createBillingJobLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
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
