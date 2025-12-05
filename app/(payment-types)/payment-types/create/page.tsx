// app/payments/types/create/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, CreditCard, DollarSign, PlusCircle, XCircle } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { createPaymentType, CreatePaymentTypeRequest, resetCreateState } from "lib/redux/paymentTypeSlice"
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
          <div className="h-10 w-24 rounded bg-gray-200"></div>
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

const CreatePaymentTypePage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Get payment type creation state from Redux store
  const { creating, createSuccess, createError } = useAppSelector((state) => state.paymentTypes)

  const [formData, setFormData] = useState<CreatePaymentTypeRequest>({
    name: "",
    description: "",
    isActive: true,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetCreateState())
    }
  }, [dispatch])

  // Handle success notification and redirect
  useEffect(() => {
    if (createSuccess) {
      notify("success", `Payment type "${formData.name}" has been created successfully`)

      // Redirect to payment types list page after a short delay
      const timer = setTimeout(() => {
        router.push("/payment-types")
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [createSuccess, formData.name, router])

  // Handle error notification
  useEffect(() => {
    if (createError) {
      notify("error", createError)
    }
  }, [createError])

  const handleInputChange =
    (field: keyof CreatePaymentTypeRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSwitchChange = (field: keyof CreatePaymentTypeRequest) => (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
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

    const submitData: CreatePaymentTypeRequest = {
      ...formData,
    }

    try {
      const result = await dispatch(createPaymentType(submitData))

      if (createPaymentType.rejected.match(result)) {
        const errorMessage = (result.payload as string) || "Failed to create payment type"
        notify("error", errorMessage)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to create payment type")
    }
  }

  const handleCancel = () => {
    router.push("/payment-types")
  }

  const getError = (field: keyof CreatePaymentTypeRequest): string => {
    return touched[field] ? errors[field] || "" : ""
  }

  const isLoading = creating

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
                      <h1 className="text-2xl font-bold text-gray-900">Create New Payment Type</h1>
                      <p className="text-gray-600">Define a new payment method for transactions</p>
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
                      disabled={isLoading}
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
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="size-4" />
                          Create Payment Type
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
                                  This payment type will be immediately available for all users to select when
                                  processing transactions.
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircle className="mt-0.5 size-5 text-yellow-500" />
                              <div>
                                <h4 className="text-sm font-medium text-yellow-800">Inactive Payment Type</h4>
                                <p className="mt-1 text-sm text-yellow-600">
                                  This payment type will be created but won't be available for use until you activate
                                  it. Useful for setting up payment methods in advance.
                                </p>
                              </div>
                            </>
                          )}
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
                        disabled={isLoading}
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
                            Creating Payment Type...
                          </span>
                        ) : (
                          "Create Payment Type"
                        )}
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
                  </motion.div>

                  {/* Tips Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-blue-900">Tips for Creating Payment Types</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Use clear, descriptive names that users will recognize</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Include specific details in the description for clarity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Set to inactive if not ready for immediate use</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Consider creating payment types for common methods used in your region</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Test payment types thoroughly before making them active</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Common Examples */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <DollarSign className="size-4" />
                      Common Examples
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="text-sm font-medium text-gray-900">Credit Card</div>
                        <p className="mt-1 text-xs text-gray-600">
                          Payments made using credit cards (Visa, MasterCard, etc.)
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="text-sm font-medium text-gray-900">Bank Transfer</div>
                        <p className="mt-1 text-xs text-gray-600">Direct bank transfers or wire transfers</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="text-sm font-medium text-gray-900">Mobile Money</div>
                        <p className="mt-1 text-xs text-gray-600">Payments through mobile money services</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="text-sm font-medium text-gray-900">Cash</div>
                        <p className="mt-1 text-xs text-gray-600">Physical cash payments</p>
                      </div>
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
                      Configuration Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Type:</span>
                        <span className="font-semibold text-blue-600">Custom</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="font-semibold text-green-600">
                          {formData.isActive ? "Will be Active" : "Will be Inactive"}
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

export default CreatePaymentTypePage
