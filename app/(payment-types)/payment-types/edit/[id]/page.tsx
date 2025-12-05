// app/payments/types/edit/[id]/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, CreditCard, Pencil, Save, XCircle } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  fetchPaymentTypes,
  resetUpdateState,
  setCurrentPaymentType,
  updatePaymentType,
  UpdatePaymentTypeRequest,
} from "lib/redux/paymentTypeSlice"
import { FormInputModule } from "components/ui/Input/Input"

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
    <DashboardNav />
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-md bg-gray-200"></div>
          <div>
            <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 rounded bg-gray-200"></div>
          <div className="h-10 w-28 rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column Skeleton */}
        <div className="space-y-6 md:col-span-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 h-6 w-48 rounded bg-gray-200"></div>
              <div className="space-y-4">
                <div className="h-12 w-full rounded bg-gray-200"></div>
                <div className="h-12 w-full rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-6">
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-10 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const EditPaymentTypePage = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()

  // Get payment type ID from URL params
  const paymentTypeId = params?.id ? parseInt(params.id as string) : null

  // Get payment type state from Redux store
  const { paymentTypes, loading, currentPaymentType, updating, updateSuccess, updateError } = useAppSelector(
    (state) => state.paymentTypes
  )

  const [formData, setFormData] = useState<UpdatePaymentTypeRequest>({
    id: paymentTypeId || 0,
    name: "",
    description: "",
    isActive: true,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [initialData, setInitialData] = useState<UpdatePaymentTypeRequest | null>(null)

  // Load payment type data
  useEffect(() => {
    if (paymentTypeId) {
      // Try to find payment type in existing list first
      const existingPaymentType = paymentTypes.find((pt) => pt.id === paymentTypeId)
      if (existingPaymentType) {
        setFormData({
          id: existingPaymentType.id,
          name: existingPaymentType.name,
          description: existingPaymentType.description,
          isActive: existingPaymentType.isActive,
        })
        setInitialData({
          id: existingPaymentType.id,
          name: existingPaymentType.name,
          description: existingPaymentType.description,
          isActive: existingPaymentType.isActive,
        })
        dispatch(setCurrentPaymentType(existingPaymentType))
      } else {
        // Fetch all payment types if not found in list
        dispatch(fetchPaymentTypes())
      }
    }
  }, [paymentTypeId, paymentTypes, dispatch])

  // Set current payment type when loading completes
  useEffect(() => {
    if (!loading && paymentTypes.length > 0 && paymentTypeId && !currentPaymentType) {
      const paymentType = paymentTypes.find((pt) => pt.id === paymentTypeId)
      if (paymentType) {
        setFormData({
          id: paymentType.id,
          name: paymentType.name,
          description: paymentType.description,
          isActive: paymentType.isActive,
        })
        setInitialData({
          id: paymentType.id,
          name: paymentType.name,
          description: paymentType.description,
          isActive: paymentType.isActive,
        })
        dispatch(setCurrentPaymentType(paymentType))
      }
    }
  }, [loading, paymentTypes, paymentTypeId, currentPaymentType, dispatch])

  // Check for changes
  useEffect(() => {
    if (initialData) {
      const hasFormChanged =
        formData.name !== initialData.name ||
        formData.description !== initialData.description ||
        formData.isActive !== initialData.isActive
      setHasChanges(hasFormChanged)
    }
  }, [formData, initialData])

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetUpdateState())
    }
  }, [dispatch])

  // Handle success notification and redirect
  useEffect(() => {
    if (updateSuccess) {
      notify("success", `Payment type "${formData.name}" has been updated successfully`)

      // Redirect to payment types list page after a short delay
      const timer = setTimeout(() => {
        router.push("/payment-types")
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [updateSuccess, formData.name, router])

  // Handle error notification
  useEffect(() => {
    if (updateError) {
      notify("error", updateError)
    }
  }, [updateError])

  const handleInputChange =
    (field: keyof UpdatePaymentTypeRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }))
      }

      // Mark field as touched
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }))
    }

  const handleSwitchChange = (field: keyof UpdatePaymentTypeRequest) => (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }))

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Payment type name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Payment type name must be at least 2 characters"
    } else if (formData.name.length > 100) {
      newErrors.name = "Payment type name must be less than 100 characters"
    }

    // Validate description
    if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    setErrors(newErrors)
    setTouched({
      name: true,
      description: true,
    })

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    if (!hasChanges) {
      notify("info", "No changes detected to update")
      return
    }

    const submitData: UpdatePaymentTypeRequest = {
      ...formData,
    }

    try {
      const result = await dispatch(updatePaymentType(submitData))

      if (updatePaymentType.rejected.match(result)) {
        const errorMessage = (result.payload as string) || "Failed to update payment type"
        notify("error", errorMessage)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to update payment type")
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        router.push("/payment-types")
      }
    } else {
      router.push("/payment-types")
    }
  }

  const getError = (field: keyof UpdatePaymentTypeRequest): string => {
    return touched[field] ? errors[field] || "" : ""
  }

  const handleResetForm = () => {
    if (initialData) {
      setFormData(initialData)
      setErrors({})
      setTouched({})
      notify("info", "Form reset to original values")
    }
  }

  const isLoading = updating || loading
  const isNotFound = !loading && !paymentTypes.find((pt) => pt.id === paymentTypeId) && paymentTypeId

  if (loading && !currentPaymentType) {
    return <LoadingSkeleton />
  }

  if (isNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <DashboardNav />
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <CreditCard className="mb-4 size-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Payment Type Not Found</h2>
            <p className="mb-6 text-gray-600">
              The payment type you&apos;re trying to edit doesn&apos;t exist or has been removed.
            </p>
            <ButtonModule
              variant="primary"
              onClick={() => router.push("/payment-types")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to Payment Types
            </ButtonModule>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            {/* Header */}
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-16 py-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      type="button"
                      onClick={handleCancel}
                      className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      aria-label="Go back"
                      title="Go back"
                    >
                      <ArrowLeft className="size-5" />
                    </motion.button>

                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Edit Payment Type</h1>
                      <p className="text-gray-600">Update payment method details</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <XCircle className="size-4" />
                      Cancel
                    </ButtonModule>

                    <ButtonModule
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleSubmit}
                      disabled={isLoading || !hasChanges}
                    >
                      {isLoading ? (
                        <>
                          <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="size-4" />
                          Save Changes
                        </>
                      )}
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-16 py-8">
              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
                {/* Main Form Content - 2/3 width */}
                <div className="space-y-6 md:col-span-2">
                  {/* Payment Type Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <CreditCard className="size-5" />
                      Payment Type Information
                    </h2>

                    <div className="space-y-6">
                      {/* Payment Type ID (Read-only) */}
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Type ID</label>
                        <div className="mt-1">
                          <input
                            type="text"
                            value={formData.id}
                            readOnly
                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            This is the unique identifier for the payment type
                          </p>
                        </div>
                      </div> */}

                      {/* Payment Type Name */}
                      <FormInputModule
                        label="Payment Type Name"
                        type="text"
                        name="name"
                        placeholder="Enter payment type name (e.g., 'Credit Card', 'Bank Transfer', 'Cash')"
                        value={formData.name}
                        onChange={handleInputChange("name")}
                        required
                        disabled={isLoading}
                        error={getError("name")}
                      />

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <div className="mt-1">
                          <textarea
                            value={formData.description}
                            onChange={handleInputChange("description")}
                            placeholder="Enter a brief description of this payment type..."
                            rows={4}
                            className={`
                              w-full rounded-md border px-3 py-2 text-sm
                              ${getError("description") ? "border-[#D14343]" : "border-[#E0E0E0]"}
                              bg-[#F9F9F9] transition-all duration-200 focus:bg-[#FBFAFC] focus:outline-none
                              focus:ring-2
                              focus:ring-[#0a0a0a] disabled:bg-gray-100
                            `}
                            disabled={isLoading}
                            maxLength={500}
                          />
                          {getError("description") && (
                            <p className="mt-1 text-xs text-[#D14343]">{getError("description")}</p>
                          )}
                          <div className="mt-1 flex justify-between text-xs text-gray-500">
                            <span>Optional, but recommended for clarity</span>
                            <span>{formData.description.length}/500 characters</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Status Configuration Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <CheckCircle className="size-5" />
                      Status & Configuration
                    </h2>

                    <div className="space-y-6">
                      {/* Active Status */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Active Status</label>
                          <p className="mt-1 text-sm text-gray-500">
                            Set whether this payment type is available for use
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => handleSwitchChange("isActive")(e.target.checked)}
                          disabled={isLoading}
                          className="h-5 w-5 cursor-pointer"
                        />
                      </div>

                      {/* Status Info */}
                      <div className={`rounded-lg p-4 ${formData.isActive ? "bg-green-50" : "bg-yellow-50"}`}>
                        <div className="flex items-start gap-3">
                          {formData.isActive ? (
                            <>
                              <CheckCircle className="mt-0.5 size-5 text-green-500" />
                              <div>
                                <h4 className="text-sm font-medium text-green-800">Active Payment Type</h4>
                                <p className="mt-1 text-sm text-green-600">
                                  This payment type is available for all users to select when processing transactions.
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="mt-0.5 size-5 text-yellow-500" />
                              <div>
                                <h4 className="text-sm font-medium text-yellow-800">Inactive Payment Type</h4>
                                <p className="mt-1 text-sm text-yellow-600">
                                  This payment type is not available for use. Users won&apos;t see it as an option when
                                  processing transactions.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Last Updated Info */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-start gap-3">
                          <Pencil className="mt-0.5 size-5 text-gray-500" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-800">Editing Information</h4>
                            <p className="mt-1 text-sm text-gray-600">
                              You are currently editing payment type #{formData.id}. Changes will be applied immediately
                              upon saving.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Preview Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                      <CheckCircle className="size-5" />
                      Payment Type Preview
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Payment Type ID</div>
                        <div className="text-lg font-semibold text-gray-900">#{formData.id}</div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Payment Type Name</div>
                        <div className="text-lg font-semibold text-gray-900">{formData.name || "(Not set)"}</div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Status</div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full ${formData.isActive ? "bg-green-500" : "bg-yellow-500"}`}
                          />
                          <span className={`font-semibold ${formData.isActive ? "text-green-600" : "text-yellow-600"}`}>
                            {formData.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Changes Made</div>
                        <div className="flex items-center gap-2">
                          <div className={`size-2 rounded-full ${hasChanges ? "bg-blue-500" : "bg-gray-500"}`} />
                          <span className={`font-semibold ${hasChanges ? "text-blue-600" : "text-gray-600"}`}>
                            {hasChanges ? "Has Changes" : "No Changes"}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4 md:col-span-2">
                        <div className="mb-2 text-xs font-medium text-gray-500">Description</div>
                        <div className="text-gray-900">{formData.description || "No description provided"}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Sidebar - 1/3 width */}
                <div className="space-y-6">
                  {/* Actions Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <CreditCard className="size-4" />
                      Actions
                    </h3>
                    <div className="space-y-3">
                      <ButtonModule
                        variant="primary"
                        className="w-full justify-center"
                        onClick={handleSubmit}
                        disabled={isLoading || !hasChanges}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Updating Payment Type...
                          </span>
                        ) : (
                          <>
                            <Save className="size-4" />
                            Save Changes
                          </>
                        )}
                      </ButtonModule>

                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={handleResetForm}
                        disabled={isLoading || !hasChanges}
                      >
                        Reset to Original
                      </ButtonModule>

                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        Cancel
                      </ButtonModule>
                    </div>

                    {/* Changes Indicator */}
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Changes:</span>
                        <span className={`font-semibold ${hasChanges ? "text-blue-600" : "text-gray-600"}`}>
                          {hasChanges ? "Unsaved changes" : "No changes"}
                        </span>
                      </div>
                      {hasChanges && (
                        <p className="mt-1 text-xs text-gray-600">
                          You have made changes that haven&apos;t been saved yet.
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {/* Editing Tips Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-blue-900">Tips for Editing Payment Types</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Update names carefully - existing transactions reference this name</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Changing status may affect active transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Keep descriptions clear for user understanding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Test changes in a non-production environment first if possible</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Notify users of significant payment type changes</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Current Values Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <CheckCircle className="size-4" />
                      Current Values
                    </h3>
                    <div className="space-y-3">
                      {initialData && (
                        <>
                          <div className="rounded-lg border border-gray-200 p-3">
                            <div className="text-xs font-medium text-gray-500">Original Name</div>
                            <div className="mt-1 font-medium text-gray-900">{initialData.name}</div>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-3">
                            <div className="text-xs font-medium text-gray-500">Original Status</div>
                            <div className="mt-1 flex items-center gap-2">
                              <div
                                className={`size-2 rounded-full ${
                                  initialData.isActive ? "bg-green-500" : "bg-yellow-500"
                                }`}
                              />
                              <span
                                className={`font-medium ${initialData.isActive ? "text-green-600" : "text-yellow-600"}`}
                              >
                                {initialData.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-3">
                            <div className="text-xs font-medium text-gray-500">Original Description</div>
                            <div className="mt-1 text-sm text-gray-900">
                              {initialData.description || "No description provided"}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <CreditCard className="size-4" />
                      Editing Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Type ID:</span>
                        <span className="font-semibold text-blue-600">#{formData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Current Status:</span>
                        <span className="font-semibold text-green-600">
                          {formData.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name Length:</span>
                        <span className="font-semibold text-purple-600">{formData.name.length}/100 chars</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Description Length:</span>
                        <span className="font-semibold text-purple-600">{formData.description.length}/500 chars</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Changes Made:</span>
                        <span className={`font-semibold ${hasChanges ? "text-blue-600" : "text-gray-600"}`}>
                          {hasChanges ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EditPaymentTypePage
