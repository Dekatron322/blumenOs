"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import BankTransferDetailsModal from "components/ui/Modal/generated-bank-transfer-modal"

// Mock data types
enum PaymentChannel {
  Cash = "CASH",
  BankTransfer = "BANK_TRANSFER",
  Pos = "POS",
  Card = "CARD",
  VendorWallet = "VENDOR_WALLET",
  Chaque = "CHEQUE",
}

// Mock payment types data
const mockPaymentTypes = [
  { id: 1, name: "Bills Payment", isActive: true },
  { id: 2, name: "Debt Repayment", isActive: true },
  { id: 3, name: "Advance Payment", isActive: true },
  { id: 4, name: "Service Charge", isActive: true },
  { id: 5, name: "Meter Purchase", isActive: true },
]

const notify = (
  type: "success" | "error" | "info",
  title: string,
  options?: { description?: string; duration?: number }
) => {
  console.log(`${type.toUpperCase()}: ${title}`, options?.description || "")

  // Create a simple notification UI
  const notification = document.createElement("div")
  notification.className = `fixed top-4 right-4 z-50 rounded-md p-4 shadow-lg ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
      ? "bg-red-500 text-white"
      : "bg-blue-500 text-white"
  }`
  notification.innerHTML = `
    <div class="font-bold">${title}</div>
    ${options?.description ? `<div class="text-sm opacity-90">${options.description}</div>` : ""}
  `
  document.body.appendChild(notification)

  setTimeout(
    () => {
      document.body.removeChild(notification)
    },
    options?.duration || 3000
  )
}

const CustomerPaymentPage: React.FC = () => {
  const [amountInput, setAmountInput] = useState("")
  const [channel, setChannel] = useState<PaymentChannel | "">(PaymentChannel.BankTransfer)
  const [narrative, setNarrative] = useState("")
  const [paymentTypeId, setPaymentTypeId] = useState<number | "">("")
  const [availableChannels, setAvailableChannels] = useState<PaymentChannel[]>([PaymentChannel.BankTransfer])
  const [isFetchingChannels, setIsFetchingChannels] = useState(false)
  const [isVirtualAccountModalOpen, setIsVirtualAccountModalOpen] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  const channelOptions = [
    { value: "", label: "Select payment channel" },
    ...availableChannels.map((channel) => ({
      value: channel,
      label: channel.replace(/([A-Z])/g, " $1").trim(),
    })),
  ]

  const defaultChannelOptions = [
    { value: "", label: "Select payment channel" },
    { value: PaymentChannel.BankTransfer, label: "Bank Transfer" },
  ]

  const fetchChannelsForAmount = (amount: number) => {
    setIsFetchingChannels(true)

    // Simulate API delay
    setTimeout(() => {
      try {
        // For demo purposes, always allow bank transfer
        setAvailableChannels([PaymentChannel.BankTransfer])

        if (amount > 50000) {
          notify("info", "Large amount detected", {
            description: "Only bank transfer is available for amounts above ₦50,000",
            duration: 3000,
          })
        }
      } catch (error) {
        console.error("Failed to fetch payment channels:", error)
        // Fallback to bank transfer only
        setAvailableChannels([PaymentChannel.BankTransfer])
      } finally {
        setIsFetchingChannels(false)
      }
    }, 500)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").trim()

    if (raw === "") {
      setAmountInput("")
      setAvailableChannels([PaymentChannel.BankTransfer])
      return
    }

    if (!/^\d*(\.\d*)?$/.test(raw)) {
      return
    }

    const [intPart, decimalPart] = raw.split(".")
    const formattedInt = intPart ? Number(intPart).toLocaleString() : ""
    const formatted = decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt
    setAmountInput(formatted)

    const amount = Number(raw)
    if (amount > 0) {
      fetchChannelsForAmount(amount)
    }
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    const rawAmount = amountInput.replace(/,/g, "").trim()
    const amount = Number(rawAmount)

    if (!rawAmount || Number.isNaN(amount) || amount <= 0) {
      notify("error", "Please enter a valid amount greater than 0")
      return
    }

    if (!channel) {
      notify("error", "Please select a payment channel")
      return
    }

    if (!paymentTypeId || typeof paymentTypeId !== "number") {
      notify("error", "Please select a payment type")
      return
    }

    setIsSubmittingPayment(true)

    // Simulate payment processing before showing modal
    setTimeout(() => {
      try {
        setIsVirtualAccountModalOpen(true)

        notify("success", "Payment request created successfully", {
          description: `Bank transfer details have been generated for ₦${amount.toLocaleString()}`,
          duration: 5000,
        })

        // Reset form after successful submission
        resetForm()
      } catch (error: any) {
        notify("error", error.message || "Failed to create payment request")
      } finally {
        setIsSubmittingPayment(false)
      }
    }, 1500)
  }

  const resetForm = () => {
    setAmountInput("")
    setChannel(PaymentChannel.BankTransfer)
    setNarrative("")
    setPaymentTypeId("")
    setAvailableChannels([PaymentChannel.BankTransfer])
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 py-4 lg:container sm:px-4 md:px-6 xl:px-16">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Make Payment</h1>
                <p className="text-sm text-gray-600">Make a payment for your utility bill via bank transfer.</p>
              </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              {/* Payment Information */}
              <motion.div
                className="rounded-md border bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-3 text-base font-semibold text-gray-800">Payment Information</h2>

                <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-blue-800">Important Information</span>
                  </div>
                  <div className="text-xs text-blue-700">
                    <p>You are logged in as a customer. All payments will be processed for your account.</p>
                    <p className="mt-1">Only bank transfer payments are available for online transactions.</p>
                  </div>
                </div>

                <div className="rounded-md border border-dashed border-[#004B23] bg-[#004B23]/5 p-4 text-sm">
                  <div className="mb-2 flex justify-between">
                    <span className="font-medium text-[#004B23]">Account Holder:</span>
                    <span className="text-base font-bold text-[#004B23]">John Smith</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="font-medium text-[#004B23]">Account Number:</span>
                    <span className="text-base font-bold text-[#004B23]">ACC00123456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-[#004B23]">Outstanding Balance:</span>
                    <span className="text-base font-bold text-[#004B23]">₦25,000</span>
                  </div>
                </div>
              </motion.div>

              {/* Payment Form */}
              <motion.div
                className="rounded-md border bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <h2 className="mb-3 text-base font-semibold text-gray-800">Payment Details</h2>

                <form onSubmit={handleSubmitPayment} className="mt-4 space-y-5">
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-blue-800">Payment Information</span>
                      {isFetchingChannels && <span className="text-xs text-blue-600">Checking availability...</span>}
                    </div>
                    <div className="text-xs text-blue-700">
                      <p>Only bank transfer payments are available for online payments.</p>
                      <p className="mt-1">Transfer will be processed within 15 minutes of successful payment.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelectModule
                      label="Payment Type"
                      name="paymentTypeId"
                      value={paymentTypeId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setPaymentTypeId(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      options={[
                        { value: "", label: "Select payment type" },
                        ...mockPaymentTypes.filter((pt) => pt.isActive).map((pt) => ({ value: pt.id, label: pt.name })),
                      ]}
                      required
                    />

                    <div>
                      <FormInputModule
                        label="Amount"
                        name="amount"
                        type="text"
                        placeholder="Enter payment amount"
                        value={amountInput}
                        onChange={handleAmountChange}
                        required
                        prefix="₦"
                      />
                      {isFetchingChannels && (
                        <p className="mt-1 text-xs text-blue-600">Checking available payment channels...</p>
                      )}
                    </div>

                    <div>
                      <FormSelectModule
                        label="Payment Channel"
                        name="channel"
                        value={channel}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setChannel(e.target.value as PaymentChannel)
                        }
                        options={channelOptions}
                        required
                        disabled={isFetchingChannels}
                      />
                      {availableChannels.length === 0 && amountInput && !isFetchingChannels && (
                        <p className="mt-1 text-xs text-amber-600">Enter an amount to see available payment channels</p>
                      )}
                      {availableChannels.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          {availableChannels.length} channel{availableChannels.length !== 1 ? "s" : ""} available
                        </p>
                      )}
                    </div>

                    <FormInputModule
                      label="Narrative (optional)"
                      name="narrative"
                      type="text"
                      placeholder="Short description or note"
                      value={narrative}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNarrative(e.target.value)}
                    />
                  </div>

                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-2 text-sm font-medium text-gray-700">Available Payment Channel:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#004B23] px-3 py-1 text-xs font-medium text-white">
                        Bank Transfer
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                    <ButtonModule
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto"
                      onClick={resetForm}
                      disabled={isSubmittingPayment}
                    >
                      Reset
                    </ButtonModule>

                    <ButtonModule
                      type="submit"
                      variant="primary"
                      className="w-full sm:w-auto"
                      disabled={isSubmittingPayment || isFetchingChannels}
                    >
                      {isSubmittingPayment ? "Processing..." : "Generate Bank Transfer Details"}
                    </ButtonModule>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Information Section */}
            <div className="mt-8 rounded-md border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-gray-800">Bank Transfer Instructions</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Important:</strong> Only bank transfer payments are available for online transactions.
                </p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>After generating payment details, you will receive a unique account number to transfer to</li>
                  <li>Transfer the exact amount specified in the payment details</li>
                  <li>Use the provided reference number as your transfer narration</li>
                  <li>Payments are processed within 15 minutes of successful transfer</li>
                  <li>Keep your transaction receipt for reference and tracking</li>
                  <li>Contact customer support if payment is not reflected after 30 minutes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BankTransferDetailsModal
        isOpen={isVirtualAccountModalOpen}
        onRequestClose={() => setIsVirtualAccountModalOpen(false)}
      />
    </section>
  )
}

export default CustomerPaymentPage
