"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { notify } from "../Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearVendorTopUp, topUpVendorWallet } from "lib/redux/vendorSlice"

interface TopUpWalletModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
  vendorId: number
  vendorName: string
  vendorEmail?: string
  currentBalance?: number
  currency?: string
}

const TopUpWalletModal: React.FC<TopUpWalletModalProps> = ({
  isOpen,
  onRequestClose,
  onSuccess,
  vendorId,
  vendorName,
  vendorEmail,
  currentBalance = 0,
  currency = "NGN",
}) => {
  const dispatch = useAppDispatch()
  const { vendorTopUpLoading, vendorTopUpError, vendorTopUpSuccess, vendorTopUpData } = useAppSelector(
    (state) => state.vendors
  )

  const [formData, setFormData] = useState({
    amount: "",
    displayAmount: "",
    reference: "",
    reason: "",
    effectiveAtUtc: new Date().toISOString(),
  })

  const [step, setStep] = useState<"amount" | "confirmation" | "success">("amount")

  // Predefined amount options
  const amountOptions = [
    { value: "1000", label: "₦1,000" },
    { value: "5000", label: "₦5,000" },
    { value: "10000", label: "₦10,000" },
    { value: "25000", label: "₦25,000" },
    { value: "50000", label: "₦50,000" },
    { value: "100000", label: "₦100,000" },
  ]

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: "",
        displayAmount: "",
        reference: "",
        reason: "",
        effectiveAtUtc: new Date().toISOString(),
      })
      setStep("amount")
      dispatch(clearVendorTopUp())
    }
  }, [isOpen, dispatch])

  // Handle success state
  useEffect(() => {
    if (vendorTopUpSuccess && vendorTopUpData) {
      setStep("success")
      notify("success", "Top-up initiated successfully", {
        description: `₦${parseFloat(formData.amount).toLocaleString()} top-up initiated for ${vendorName}`,
        duration: 5000,
      })
    }
  }, [vendorTopUpSuccess, vendorTopUpData, formData.amount, vendorName])

  // Handle errors
  useEffect(() => {
    if (vendorTopUpError) {
      notify("error", "Top-up failed", {
        description: vendorTopUpError,
        duration: 6000,
      })
    }
  }, [vendorTopUpError])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const { name, value } = "target" in e ? e.target : e

    // Validate amount input to only allow numbers and decimals
    if (name === "amount") {
      // Remove all non-numeric characters except decimal point
      const numericValue = value.replace(/[^\d.]/g, "")
      // Ensure only one decimal point
      const parts = numericValue.split(".")
      if (parts.length > 2) return
      // Limit to 2 decimal places
      if (parts[1] && parts[1].length > 2) return

      // Format with commas for display
      const formattedValue = numericValue ? parseFloat(numericValue).toLocaleString() : ""

      setFormData((prev) => ({
        ...prev,
        [name]: numericValue, // Store raw value
        displayAmount: formattedValue, // Store formatted value for display
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleAmountSelect = (amount: string) => {
    const numericValue = parseFloat(amount)
    const formattedValue = numericValue.toLocaleString()

    setFormData((prev) => ({
      ...prev,
      amount,
      displayAmount: formattedValue,
    }))
  }

  const handleCustomAmount = () => {
    setFormData((prev) => ({
      ...prev,
      amount: "",
      displayAmount: "",
    }))
  }

  const handleProceedToConfirmation = () => {
    if (isAmountValid()) {
      setStep("confirmation")
    }
  }

  const handleBackToAmount = () => {
    setStep("amount")
  }

  const handleSubmit = async () => {
    try {
      const amount = parseFloat(formData.amount)
      if (!isNaN(amount) && amount > 0 && formData.reason.trim()) {
        await dispatch(
          topUpVendorWallet({
            id: vendorId,
            amount,
            reason: formData.reason.trim(),
            effectiveAtUtc: formData.effectiveAtUtc,
          })
        ).unwrap()

        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error("Failed to process top-up:", error)
      // Error is handled by the useEffect above
    }
  }

  const handleComplete = () => {
    onRequestClose()
    if (onSuccess) {
      onSuccess()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const isAmountValid = () => {
    const amount = parseFloat(formData.amount)
    return !isNaN(amount) && amount > 0 && amount <= 1000000 // Maximum 1,000,000
  }

  const getNewBalance = () => {
    const topUpAmount = parseFloat(formData.amount)
    return isNaN(topUpAmount) ? currentBalance : currentBalance + topUpAmount
  }

  // Handle input focus to show cursor at end
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.setSelectionRange(e.target.value.length, e.target.value.length)
  }

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
        className="relative w-[600px] max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {step === "amount" && "Top Up Wallet"}
            {step === "confirmation" && "Confirm Top-up"}
            {step === "success" && "Top-up Initiated"}
          </h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            disabled={vendorTopUpLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-6">
            {/* Vendor Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{vendorName}</h3>
                  {vendorEmail && <p className="text-sm text-gray-500">Email: {vendorEmail}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(currentBalance)}</p>
                </div>
              </div>
            </div>

            {/* Step 1: Amount Selection */}
            {step === "amount" && (
              <div className="space-y-6">
                <div>
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                      <input
                        name="amount"
                        type="text"
                        placeholder="0.00"
                        value={formData.displayAmount}
                        onChange={(e) =>
                          handleInputChange({
                            target: { name: "amount", value: e.target.value.replace(/[^\d.]/g, "") },
                          })
                        }
                        onFocus={handleInputFocus}
                        required
                        className="w-full rounded-lg border border-gray-200 bg-white px-8 py-3 text-lg font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Maximum: ₦1,000,000</p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm text-gray-600">Quick amounts</p>
                  <div className="grid grid-cols-3 gap-2">
                    {amountOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAmountSelect(option.value)}
                        className={`rounded-lg border p-3 text-center transition-all ${
                          formData.amount === option.value
                            ? "border-green-900 bg-green-700 text-white"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    placeholder="Enter reason for top-up..."
                    value={formData.reason}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                    required
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                {/* New Balance Preview */}
                {isAmountValid() && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New balance:</span>
                      <span className="text-lg font-semibold text-gray-900">{formatCurrency(getNewBalance())}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Confirmation */}
            {step === "confirmation" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gray-100">
                    <svg className="size-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Confirm Top-up</h3>
                  <p className="mt-1 text-sm text-gray-500">Please review the details below</p>
                </div>

                <div className=" rounded-lg border border-gray-200 bg-[#f9f9f9] p-2">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">Vendor:</span>
                    <span className="font-medium text-gray-900">{vendorName}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 py-2">
                    <span className="text-sm text-gray-600">Top-up Amount:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(parseFloat(formData.amount))}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 py-2">
                    <span className="text-sm text-gray-600">Current Balance:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(currentBalance)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 py-2">
                    <span className="text-sm text-gray-600">New Balance:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(getNewBalance())}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <span className="text-sm text-gray-600">Reason:</span>
                    <p className="mt-1 text-sm font-medium text-gray-900">{formData.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === "success" && vendorTopUpData && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100">
                    <svg className="size-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Top-up Initiated</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {vendorTopUpData.status === "Pending"
                      ? "Payment instructions have been generated"
                      : "Top-up completed successfully"}
                  </p>
                </div>

                <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">Reference:</span>
                    <span className="font-mono text-sm font-medium text-gray-900">{vendorTopUpData.reference}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 py-2">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(vendorTopUpData.amount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 py-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        vendorTopUpData.status === "Pending" ? "text-amber-600" : "text-green-600"
                      }`}
                    >
                      {vendorTopUpData.status}
                    </span>
                  </div>
                  {vendorTopUpData.blumenPayAccountNumber && (
                    <div className="flex justify-between border-t border-gray-100 py-2">
                      <span className="text-sm text-gray-600">Account:</span>
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {vendorTopUpData.blumenPayAccountNumber}
                      </span>
                    </div>
                  )}
                  {vendorTopUpData.blumenPayBankName && (
                    <div className="flex justify-between border-t border-gray-100 py-2">
                      <span className="text-sm text-gray-600">Bank:</span>
                      <span className="font-medium text-gray-900">{vendorTopUpData.blumenPayBankName}</span>
                    </div>
                  )}
                </div>

                {vendorTopUpData.status === "Pending" && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      Complete the payment using the account details above to finalize the top-up.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-200 bg-white p-6">
          {step === "amount" && (
            <>
              <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={onRequestClose}>
                Cancel
              </ButtonModule>
              <ButtonModule
                variant="primary"
                className="flex-1"
                size="lg"
                onClick={handleProceedToConfirmation}
                disabled={!isAmountValid() || !formData.reason.trim()}
              >
                Continue
              </ButtonModule>
            </>
          )}

          {step === "confirmation" && (
            <>
              <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={handleBackToAmount}>
                Back
              </ButtonModule>
              <ButtonModule
                variant="primary"
                className="flex-1"
                size="lg"
                onClick={handleSubmit}
                disabled={vendorTopUpLoading}
                loading={vendorTopUpLoading}
              >
                {vendorTopUpLoading ? "Processing..." : "Confirm Top-up"}
              </ButtonModule>
            </>
          )}

          {step === "success" && (
            <ButtonModule variant="primary" className="flex-1" size="lg" onClick={handleComplete}>
              Done
            </ButtonModule>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TopUpWalletModal
