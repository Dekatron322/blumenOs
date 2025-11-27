"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { notify } from "../Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { topUpVendorWallet, clearVendorTopUp } from "lib/redux/vendorSlice"

interface TopUpWalletModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
  vendorId: number
  vendorName: string
  currentBalance?: number
  currency?: string
}

const TopUpWalletModal: React.FC<TopUpWalletModalProps> = ({
  isOpen,
  onRequestClose,
  onSuccess,
  vendorId,
  vendorName,
  currentBalance = 0,
  currency = "NGN",
}) => {
  const dispatch = useAppDispatch()
  const { vendorTopUpLoading, vendorTopUpError, vendorTopUpSuccess, vendorTopUpData } = useAppSelector(
    (state) => state.vendors
  )

  const [formData, setFormData] = useState({
    amount: "",
    reference: "",
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
      setFormData({ amount: "", reference: "" })
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
      const numericValue = value.replace(/[^\d.]/g, "")
      // Ensure only one decimal point
      const parts = numericValue.split(".")
      if (parts.length > 2) return
      // Limit to 2 decimal places
      if (parts[1] && parts[1].length > 2) return

      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleAmountSelect = (amount: string) => {
    setFormData((prev) => ({
      ...prev,
      amount,
    }))
  }

  const handleCustomAmount = () => {
    setFormData((prev) => ({
      ...prev,
      amount: "",
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
      if (!isNaN(amount) && amount > 0) {
        await dispatch(topUpVendorWallet({ id: vendorId, amount })).unwrap()

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

  const isAmountValid = () => {
    const amount = parseFloat(formData.amount)
    return !isNaN(amount) && amount > 0 && amount <= 1000000 // Maximum 1,000,000
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getNewBalance = () => {
    const topUpAmount = parseFloat(formData.amount)
    return isNaN(topUpAmount) ? currentBalance : currentBalance + topUpAmount
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
        <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-6">
          <h2 className="text-xl font-bold text-gray-900">
            {step === "amount" && "Top Up Wallet"}
            {step === "confirmation" && "Confirm Top-up"}
            {step === "success" && "Top-up Initiated"}
          </h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={vendorTopUpLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <div className="flex flex-col gap-6 p-6">
            {/* Vendor Info */}
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{vendorName}</h3>
                  <p className="text-sm text-gray-600">Vendor ID: {vendorId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(currentBalance)}</p>
                </div>
              </div>
            </div>

            {/* Step 1: Amount Selection */}
            {step === "amount" && (
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700">Select Amount</label>
                  <div className="grid grid-cols-2 gap-3">
                    {amountOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAmountSelect(option.value)}
                        className={`rounded-lg border p-4 text-center transition-all ${
                          formData.amount === option.value
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-lg font-semibold text-gray-900">{option.label}</div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleCustomAmount}
                      className={`rounded-lg border p-4 text-center transition-all ${
                        formData.amount && !amountOptions.find((opt) => opt.value === formData.amount)
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-lg font-semibold text-gray-900">Custom Amount</div>
                    </button>
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Or enter custom amount</label>
                  <FormInputModule
                    name="amount"
                    type="text"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    className="text-lg"
                    label={""}
                  />
                  <p className="text-xs text-gray-500">Maximum amount: ₦1,000,000</p>
                </div>

                {/* New Balance Preview */}
                {isAmountValid() && (
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">New balance will be:</span>
                      <span className="text-lg font-bold text-green-700">{formatCurrency(getNewBalance())}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Confirmation */}
            {step === "confirmation" && (
              <div className="space-y-6">
                <div className="rounded-lg bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <svg className="size-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-800">Please confirm top-up details</h4>
                      <p className="mt-1 text-sm text-amber-700">
                        This action will initiate a wallet top-up. Please verify the amount before proceeding.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor:</span>
                    <span className="font-medium text-gray-900">{vendorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Top-up Amount:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(parseFloat(formData.amount))}
                    </span>
                  </div>
                  <div className="flex justify-between ">
                    <span className="text-gray-600">Current Balance:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(currentBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Balance:</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(getNewBalance())}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    The top-up will be processed immediately. You can track the transaction status in the vendor's
                    wallet history.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === "success" && vendorTopUpData && (
              <div className="space-y-6">
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <svg className="size-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800">Top-up initiated successfully!</h4>
                      <p className="mt-1 text-sm text-green-700">
                        The wallet top-up has been initiated and is being processed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono text-sm font-medium text-gray-900">{vendorTopUpData.reference}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(vendorTopUpData.amount)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        vendorTopUpData.status === "Pending"
                          ? "text-amber-600"
                          : vendorTopUpData.status === "Confirmed"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {vendorTopUpData.status}
                    </span>
                  </div>
                  {vendorTopUpData.blumenPayAccountNumber && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {vendorTopUpData.blumenPayAccountNumber}
                      </span>
                    </div>
                  )}
                  {vendorTopUpData.blumenPayBankName && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-medium text-gray-900">{vendorTopUpData.blumenPayBankName}</span>
                    </div>
                  )}
                  {vendorTopUpData.blumenPayReference && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Payment Reference:</span>
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {vendorTopUpData.blumenPayReference}
                      </span>
                    </div>
                  )}
                  {vendorTopUpData.blumenPayExpiresAtUtc && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(vendorTopUpData.blumenPayExpiresAtUtc).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">
                    {vendorTopUpData.status === "Pending"
                      ? "Please complete the payment using the provided account details to finalize the top-up."
                      : "The top-up has been confirmed and the vendor's wallet has been updated."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          {step === "amount" && (
            <>
              <ButtonModule variant="dangerSecondary" className="flex-1" size="lg" onClick={onRequestClose}>
                Cancel
              </ButtonModule>
              <ButtonModule
                variant="primary"
                className="flex-1"
                size="lg"
                onClick={handleProceedToConfirmation}
                disabled={!isAmountValid()}
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
              Complete
            </ButtonModule>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TopUpWalletModal
