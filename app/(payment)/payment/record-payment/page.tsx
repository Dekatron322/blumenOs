"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddIcon } from "components/Icons/Icons"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearCreatePayment, createPayment } from "lib/redux/paymentSlice"

interface PaymentFormData {
  postpaidBillId: number
  paymentTypeId: number
  amount: number
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet"
  currency: string
  externalReference: string
  narrative: string
  paidAtUtc: string
  agentId: number
  vendorId: number
  collectorType: "Customer" | "Agent" | "Vendor" | "Staff"
}

const AddPaymentPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { createPaymentLoading, createPaymentError, createPaymentSuccess, createdPayment } = useSelector(
    (state: RootState) => state.payments
  )

  const [formData, setFormData] = useState<PaymentFormData>({
    postpaidBillId: 0,
    paymentTypeId: 0,
    amount: 0,
    channel: "Cash",
    currency: "NGN",
    externalReference: "",
    narrative: "",
    paidAtUtc: new Date().toISOString().slice(0, 16), // Current date and time in local format
    agentId: 0,
    vendorId: 0,
    collectorType: "Customer",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Payment channel options
  const channelOptions = [
    { value: "Cash", label: "Cash" },
    { value: "BankTransfer", label: "Bank Transfer" },
    { value: "Pos", label: "POS" },
    { value: "Card", label: "Card" },
    { value: "VendorWallet", label: "Vendor Wallet" },
  ]

  // Collector type options
  const collectorTypeOptions = [
    { value: "Customer", label: "Customer" },
    { value: "Agent", label: "Agent" },
    { value: "Vendor", label: "Vendor" },
    { value: "Staff", label: "Staff" },
  ]

  // Currency options
  const currencyOptions = [
    { value: "NGN", label: "NGN - Nigerian Naira" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
  ]

  // Payment type options (you might want to fetch these from an API)
  const paymentTypeOptions = [
    { value: 1, label: "Postpaid Bill Payment" },
    { value: 2, label: "Advance Payment" },
    { value: 3, label: "Security Deposit" },
    { value: 4, label: "Other" },
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields
    let processedValue = value
    if (["postpaidBillId", "paymentTypeId", "amount", "agentId", "vendorId"].includes(name)) {
      processedValue = value === "" ? 0 : Number(value)
    }

    // Handle date field
    if (name === "paidAtUtc") {
      // Convert local datetime to ISO string
      const localDate = new Date(value)
      processedValue = localDate.toISOString()
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (formData.postpaidBillId === 0) {
      errors.postpaidBillId = "Postpaid Bill ID is required"
    }

    if (formData.paymentTypeId === 0) {
      errors.paymentTypeId = "Payment Type is required"
    }

    if (formData.amount <= 0) {
      errors.amount = "Amount must be greater than 0"
    }

    if (!formData.channel) {
      errors.channel = "Payment channel is required"
    }

    if (!formData.currency) {
      errors.currency = "Currency is required"
    }

    if (!formData.collectorType) {
      errors.collectorType = "Collector type is required"
    }

    if (!formData.paidAtUtc) {
      errors.paidAtUtc = "Payment date and time is required"
    } else {
      const paymentDate = new Date(formData.paidAtUtc)
      const now = new Date()
      if (paymentDate > now) {
        errors.paidAtUtc = "Payment date cannot be in the future"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitPayment()
  }

  const submitPayment = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      // Prepare the data for API
      const paymentData = {
        ...formData,
        // Only include optional fields if they have values
        ...(formData.externalReference && { externalReference: formData.externalReference }),
        ...(formData.narrative && { narrative: formData.narrative }),
        ...(formData.agentId > 0 && { agentId: formData.agentId }),
        ...(formData.vendorId > 0 && { vendorId: formData.vendorId }),
      }

      const result = await dispatch(createPayment(paymentData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Payment recorded successfully", {
          description: `Payment of ${formData.amount} ${formData.currency} has been recorded`,
          duration: 5000,
        })

        // Redirect to payment details page
        if (result.data?.id) {
          setTimeout(() => {
            router.push(`/payments-management/payments/${result.data.id}`)
          }, 2000)
        }
      }
    } catch (error: any) {
      console.error("Failed to record payment:", error)
      if (!error?.includes("Network error")) {
        notify("error", "Failed to record payment", {
          description: error || "An unexpected error occurred",
          duration: 6000,
        })
      }
    }
  }

  const handleReset = () => {
    setFormData({
      postpaidBillId: 0,
      paymentTypeId: 0,
      amount: 0,
      channel: "Cash",
      currency: "NGN",
      externalReference: "",
      narrative: "",
      paidAtUtc: new Date().toISOString().slice(0, 16),
      agentId: 0,
      vendorId: 0,
      collectorType: "Customer",
    })
    setFormErrors({})
    dispatch(clearCreatePayment())
  }

  const isFormValid = (): boolean => {
    return (
      formData.postpaidBillId > 0 &&
      formData.paymentTypeId > 0 &&
      formData.amount > 0 &&
      !!formData.channel && // <- change this
      formData.currency !== "" &&
      !!formData.collectorType &&
      formData.paidAtUtc !== ""
    )
  }

  // Handle success state
  useEffect(() => {
    if (createPaymentSuccess && createdPayment) {
      // Success is already handled in submitPayment
    }
  }, [createPaymentSuccess, createdPayment])

  // Handle errors
  useEffect(() => {
    if (createPaymentError) {
      notify("error", "Payment recording failed", {
        description: createPaymentError,
        duration: 6000,
      })
    }
  }, [createPaymentError])

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="container mx-auto flex flex-col">
            {/* Page Header */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Record New Payment</h4>
                <p className="text-gray-600">Record a new payment transaction in the system</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule variant="outline" size="md" onClick={handleReset} disabled={createPaymentLoading}>
                  Reset Form
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={submitPayment}
                  disabled={!isFormValid() || createPaymentLoading}
                  icon={<AddIcon />}
                  iconPosition="start"
                >
                  {createPaymentLoading ? "Recording Payment..." : "Record Payment"}
                </ButtonModule>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg bg-white p-6 shadow-sm"
                >
                  {/* Form Header */}
                  <div className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                    <p className="text-sm text-gray-600">Fill in all required fields to record a new payment</p>
                  </div>

                  {/* Payment Form */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Payment Details */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Payment Details</h4>
                        <p className="text-sm text-gray-600">Enter the basic payment information and amount</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Postpaid Bill ID"
                          name="postpaidBillId"
                          type="number"
                          placeholder="Enter postpaid bill ID"
                          value={formData.postpaidBillId}
                          onChange={handleInputChange}
                          error={formErrors.postpaidBillId}
                          required
                          min="1"
                        />

                        <FormSelectModule
                          label="Payment Type"
                          name="paymentTypeId"
                          value={formData.paymentTypeId}
                          onChange={handleInputChange}
                          options={[{ value: 0, label: "Select payment type" }, ...paymentTypeOptions]}
                          error={formErrors.paymentTypeId}
                          required
                        />

                        <FormInputModule
                          label="Amount"
                          name="amount"
                          type="number"
                          placeholder="Enter payment amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          error={formErrors.amount}
                          required
                          min="0.01"
                          step="0.01"
                        />

                        <FormSelectModule
                          label="Payment Channel"
                          name="channel"
                          value={formData.channel}
                          onChange={handleInputChange}
                          options={[{ value: "", label: "Select payment channel" }, ...channelOptions]}
                          error={formErrors.channel}
                          required
                        />

                        <FormSelectModule
                          label="Currency"
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          options={[{ value: "", label: "Select currency" }, ...currencyOptions]}
                          error={formErrors.currency}
                          required
                        />

                        <FormInputModule
                          label="Payment Date & Time"
                          name="paidAtUtc"
                          type="datetime-local"
                          value={formData.paidAtUtc}
                          onChange={handleInputChange}
                          error={formErrors.paidAtUtc}
                          required
                          placeholder={""}
                        />
                      </div>
                    </div>

                    {/* Section 2: Collector Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Collector Information</h4>
                        <p className="text-sm text-gray-600">Specify who collected this payment</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormSelectModule
                          label="Collector Type"
                          name="collectorType"
                          value={formData.collectorType}
                          onChange={handleInputChange}
                          options={[{ value: "", label: "Select collector type" }, ...collectorTypeOptions]}
                          error={formErrors.collectorType}
                          required
                        />

                        <FormInputModule
                          label="Agent ID (Optional)"
                          name="agentId"
                          type="number"
                          placeholder="Enter agent ID if applicable"
                          value={formData.agentId}
                          onChange={handleInputChange}
                          min="0"
                        />

                        <FormInputModule
                          label="Vendor ID (Optional)"
                          name="vendorId"
                          type="number"
                          placeholder="Enter vendor ID if applicable"
                          value={formData.vendorId}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Section 3: Additional Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                        <p className="text-sm text-gray-600">Provide any additional payment details or references</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormInputModule
                          label="External Reference (Optional)"
                          name="externalReference"
                          type="text"
                          placeholder="Enter external reference number"
                          value={formData.externalReference}
                          onChange={handleInputChange}
                        />

                        <FormInputModule
                          label="Narrative (Optional)"
                          name="narrative"
                          type="text"
                          placeholder="Enter payment description or notes"
                          value={formData.narrative}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Error Summary */}
                    {Object.keys(formErrors).length > 0 && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <svg className="size-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">Form validation errors</h3>
                            <div className="mt-2 text-sm text-amber-700">
                              <ul className="list-disc space-y-1 pl-5">
                                {Object.values(formErrors).map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {createPaymentSuccess && createdPayment && (
                      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <svg className="size-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-emerald-800">Payment recorded successfully!</h3>
                            <div className="mt-2 text-sm text-emerald-700">
                              <p>
                                Reference: <strong>{createdPayment.reference}</strong>
                              </p>
                              <p>
                                Amount:{" "}
                                <strong>
                                  {createdPayment.amount} {createdPayment.currency}
                                </strong>
                              </p>
                              <p className="mt-1">Redirecting to payment details...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 border-t pt-6">
                      <ButtonModule
                        variant="dangerSecondary"
                        size="lg"
                        onClick={handleReset}
                        disabled={createPaymentLoading}
                        type="button"
                      >
                        Reset
                      </ButtonModule>
                      <ButtonModule
                        variant="primary"
                        size="lg"
                        type="submit"
                        disabled={!isFormValid() || createPaymentLoading}
                      >
                        {createPaymentLoading ? "Recording Payment..." : "Record Payment"}
                      </ButtonModule>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AddPaymentPage
