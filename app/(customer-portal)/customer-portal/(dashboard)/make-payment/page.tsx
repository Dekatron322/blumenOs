"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { NotificationProvider, notify } from "components/ui/Notification/Notification"
import {
  BillingIcon,
  CashClearanceIcon,
  MeterOutlineIcon,
  RevenueIcon,
  SettingOutlineIcon,
} from "components/Icons/Icons"
import {
  clearMakePaymentStatus,
  clearPaymentTypesStatus,
  getPaymentTypes,
  makePayment,
  selectMakePaymentError,
  selectMakePaymentLoading,
  selectMakePaymentResponseData,
  selectMakePaymentSuccess,
  selectPaymentTypesError,
  selectPaymentTypesList,
  selectPaymentTypesLoading,
  selectPaymentTypesSuccess,
} from "lib/redux/customersDashboardSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"
import { AppDispatch, RootState } from "lib/redux/store"

// Mock data types
enum PaymentChannel {
  Cash = "CASH",
  BankTransfer = "BankTransfer",
  Pos = "POS",
  Card = "Card",
  VendorWallet = "VENDOR_WALLET",
  Cheque = "CHEQUE",
}

// Payment type interface
interface PaymentType {
  id: number
  name: string
  description: string
  icon: React.ReactNode
  isActive: boolean
  supportRecoveryTrigger: boolean
  canSelfService: boolean
  isSystem: boolean
  isEnergyBill: boolean
  isDebtClearance: boolean
}

// Icon mapping function
const getPaymentTypeIcon = (paymentType: any) => {
  if (paymentType.isEnergyBill) return <BillingIcon />
  if (paymentType.isDebtClearance) return <CashClearanceIcon />
  if (paymentType.isSystem) return <RevenueIcon />
  if (paymentType.name.toLowerCase().includes("service") || paymentType.name.toLowerCase().includes("maintenance"))
    return <SettingOutlineIcon />
  if (paymentType.name.toLowerCase().includes("meter")) return <MeterOutlineIcon />
  return <BillingIcon /> // Default icon
}

const CustomerPaymentPage: React.FC = () => {
  // Redux hooks
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Get customer data from Redux store
  const { isAuthenticated, customer } = useAppSelector((state: RootState) => state.customerAuth)

  const paymentTypes = useAppSelector(selectPaymentTypesList)
  const isLoadingPaymentTypes = useAppSelector(selectPaymentTypesLoading)
  const paymentTypesError = useAppSelector(selectPaymentTypesError)
  const paymentTypesSuccess = useAppSelector(selectPaymentTypesSuccess)

  // Make payment Redux state
  const makePaymentResponseData = useAppSelector(selectMakePaymentResponseData)
  const isMakingPayment = useAppSelector(selectMakePaymentLoading)
  const makePaymentError = useAppSelector(selectMakePaymentError)
  const makePaymentSuccess = useAppSelector(selectMakePaymentSuccess)

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/customer-portal/auth")
    }
  }, [isAuthenticated, router])

  // Fetch payment types on component mount
  useEffect(() => {
    dispatch(getPaymentTypes())
  }, [dispatch])

  // Handle payment types error
  useEffect(() => {
    if (paymentTypesError) {
      notify("error", "Failed to load payment types", {
        title: "Error",
        description: paymentTypesError,
        duration: 5000,
      })
    }
  }, [paymentTypesError])

  // Handle make payment success
  useEffect(() => {
    if (makePaymentSuccess && makePaymentResponseData) {
      setIsVirtualAccountModalOpen(true)

      notify("success", "Payment request created successfully", {
        title: "Success",
        description: `Bank transfer details have been generated for ₦${Number(
          amountInput.replace(/,/g, "")
        ).toLocaleString()}`,
        duration: 5000,
      })

      // Reset form after successful submission
      resetForm()
    }
  }, [makePaymentSuccess, makePaymentResponseData])

  // Handle make payment error
  useEffect(() => {
    if (makePaymentError) {
      notify("error", "Failed to create payment request", {
        title: "Error",
        description: makePaymentError,
        duration: 5000,
      })
    }
  }, [makePaymentError])

  // Cleanup payment types status on unmount
  useEffect(() => {
    return () => {
      dispatch(clearPaymentTypesStatus())
      dispatch(clearMakePaymentStatus())
    }
  }, [dispatch])

  // Transform API data to component format
  const transformedPaymentTypes: PaymentType[] =
    paymentTypes?.map((pt) => ({
      id: pt.id,
      name: pt.name,
      description: pt.description,
      icon: getPaymentTypeIcon(pt),
      isActive: pt.isActive,
      supportRecoveryTrigger: pt.supportRecoveryTrigger,
      canSelfService: pt.canSelfService,
      isSystem: pt.isSystem,
      isEnergyBill: pt.isEnergyBill,
      isDebtClearance: pt.isDebtClearance,
    })) || []
  // Step states - auto-determine initial step based on customer type
  const [currentStep, setCurrentStep] = useState<"select-payment-type" | "payment-details">(
    customer?.isMD === true ? "payment-details" : "select-payment-type"
  )

  // Form states
  const [selectedPaymentType, setSelectedPaymentType] = useState<number | null>(customer?.isMD === true ? 1 : null)
  const [amountInput, setAmountInput] = useState("")
  const [channel, setChannel] = useState<PaymentChannel | "">(PaymentChannel.BankTransfer)
  const [narrative, setNarrative] = useState("")
  const [availableChannels, setAvailableChannels] = useState<PaymentChannel[]>([
    PaymentChannel.BankTransfer,
    PaymentChannel.Card,
  ])
  const [isFetchingChannels, setIsFetchingChannels] = useState(false)
  const [isVirtualAccountModalOpen, setIsVirtualAccountModalOpen] = useState(false)

  // Reset form when going back
  const handleBackToPaymentTypes = () => {
    setCurrentStep("select-payment-type")
    setSelectedPaymentType(null)
    setAmountInput("")
    setChannel(PaymentChannel.BankTransfer)
    setNarrative("")
    setAvailableChannels([PaymentChannel.BankTransfer, PaymentChannel.Card])
  }

  // Auto-select energy bill payment type for MD customers
  useEffect(() => {
    if (customer?.isMD === true && paymentTypes && paymentTypes.length > 0) {
      const energyBillPaymentType = paymentTypes.find((pt) => pt.id === 1)
      if (energyBillPaymentType) {
        setSelectedPaymentType(1)
        setCurrentStep("payment-details")
      }
    }
  }, [customer, paymentTypes])

  const handleSelectPaymentType = (paymentTypeId: number) => {
    setSelectedPaymentType(paymentTypeId)
    setCurrentStep("payment-details")
  }

  const channelOptions = [
    { value: "", label: "Select payment channel" },
    ...availableChannels.map((channel) => ({
      value: channel,
      label: channel
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .trim(),
    })),
  ]

  const fetchChannelsForAmount = (amount: number) => {
    setIsFetchingChannels(true)

    // Simulate API delay
    setTimeout(() => {
      try {
        // For demo purposes, allow both bank transfer and card
        setAvailableChannels([PaymentChannel.BankTransfer, PaymentChannel.Card])

        if (amount > 50000) {
          notify("info", "Large amount detected", {
            title: "Info",
            description: "Only bank transfer is available for amounts above ₦50,000",
            duration: 3000,
          })
          // For large amounts, only allow bank transfer
          setAvailableChannels([PaymentChannel.BankTransfer])
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
      setAvailableChannels([PaymentChannel.BankTransfer, PaymentChannel.Card])
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
    console.log("handleSubmitPayment called")

    if (!selectedPaymentType) {
      console.log("No payment type selected")
      notify("error", "Please select a payment type", {
        title: "Validation Error",
      })
      return
    }

    const rawAmount = amountInput.replace(/,/g, "").trim()
    const amount = Number(rawAmount)

    if (!rawAmount || Number.isNaN(amount) || amount <= 0) {
      console.log("Invalid amount:", rawAmount)
      notify("error", "Please enter a valid amount greater than 0", {
        title: "Validation Error",
      })
      return
    }

    if (!channel) {
      console.log("No channel selected")
      notify("error", "Please select a payment channel", {
        title: "Validation Error",
      })
      return
    }

    console.log("Making payment request:", {
      paymentTypeId: selectedPaymentType,
      amount: amount,
      channel: channel,
    })

    // Dispatch the make payment action
    dispatch(
      makePayment({
        paymentTypeId: selectedPaymentType,
        amount: amount,
        channel: channel,
      })
    )
  }

  const resetForm = () => {
    setCurrentStep("select-payment-type")
    setSelectedPaymentType(null)
    setAmountInput("")
    setChannel(PaymentChannel.BankTransfer)
    setNarrative("")
    setAvailableChannels([PaymentChannel.BankTransfer, PaymentChannel.Card])
  }

  // Get selected payment type details
  const selectedPaymentTypeDetails = selectedPaymentType
    ? transformedPaymentTypes.find((pt) => pt.id === selectedPaymentType)
    : null

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <NotificationProvider />
      <CustomerDashboardNav />
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 lg:px-6 2xl:px-16">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Make Payment</h1>
                <p className="text-sm text-gray-600">
                  {currentStep === "select-payment-type"
                    ? "Select a payment type to continue"
                    : "Complete the payment details"}
                </p>
              </div>
              {currentStep === "payment-details" && (
                <ButtonModule
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleBackToPaymentTypes}
                  className="w-full sm:w-auto"
                >
                  ← Back to Payment Types
                </ButtonModule>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isLoadingPaymentTypes && currentStep === "select-payment-type" ? (
                // Initial loading state
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">Loading Payment Types...</h2>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gray-300"></div>
                            <div className="flex-1">
                              <div className="h-6 w-32 rounded bg-gray-300"></div>
                              <div className="mt-2 h-4 w-48 rounded bg-gray-300"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : currentStep === "select-payment-type" ? (
                <motion.div
                  key="select-payment-type"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Payment Information */}
                  <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">Select Payment Type</h2>

                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-blue-600">💡</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-blue-800">How it works</h3>
                          <p className="text-sm text-blue-700">
                            Choose the type of payment you want to make. Each payment type serves a different purpose.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Type Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {isLoadingPaymentTypes ? (
                        // Loading skeleton
                        Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="animate-pulse rounded-xl border-2 border-gray-200 bg-white p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded bg-gray-300"></div>
                                  <div className="h-6 w-32 rounded bg-gray-300"></div>
                                </div>
                                <div className="mt-2 h-4 w-48 rounded bg-gray-300"></div>
                                <div className="mt-1 h-4 w-40 rounded bg-gray-300"></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : paymentTypesError ? (
                        // Error state
                        <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                          <div className="text-red-600">
                            <h3 className="text-lg font-medium">Failed to load payment types</h3>
                            <p className="mt-2 text-sm">{paymentTypesError}</p>
                            <button
                              onClick={() => dispatch(getPaymentTypes())}
                              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                              Try Again
                            </button>
                          </div>
                        </div>
                      ) : transformedPaymentTypes.filter((pt) => pt.isActive).length === 0 ? (
                        // Empty state
                        <div className="col-span-full rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                          <div className="text-gray-600">
                            <h3 className="text-lg font-medium">No Payment Types Available</h3>
                            <p className="mt-2 text-sm">There are currently no active payment types available.</p>
                            <button
                              onClick={() => dispatch(getPaymentTypes())}
                              className="mt-4 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                            >
                              Refresh
                            </button>
                          </div>
                        </div>
                      ) : (
                        transformedPaymentTypes
                          .filter((pt) => pt.isActive)
                          .filter((pt) => {
                            // For MD customers, only show energy bill payment type (id = 1)
                            if (customer?.isMD === true) {
                              return pt.id === 1
                            }
                            // For non-MD customers, show all active payment types
                            return true
                          })
                          .map((paymentType) => (
                            <motion.div
                              key={paymentType.id}
                              whileHover={{ y: -4, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`relative cursor-pointer overflow-hidden rounded-xl border-2 p-5 transition-all duration-200 ${
                                selectedPaymentType === paymentType.id
                                  ? "border-[#004B23] bg-[#004B23]/5 shadow-md"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                              }`}
                              onClick={() => handleSelectPaymentType(paymentType.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 text-gray-700">{paymentType.icon}</div>

                                    <h3 className=" text-lg font-semibold text-gray-900">{paymentType.name}</h3>
                                  </div>
                                  <p className="text-sm text-gray-600">{paymentType.description}</p>
                                </div>
                                {selectedPaymentType === paymentType.id && (
                                  <div className="absolute right-3 top-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#004B23]">
                                      <svg
                                        className="h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500">Click to select</span>
                                <div
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    selectedPaymentType === paymentType.id
                                      ? "bg-[#004B23] text-white"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  Select
                                </div>
                              </div>
                            </motion.div>
                          ))
                      )}
                    </div>

                    {/* Account Information */}
                    <div className="mt-6 rounded-xl border border-dashed border-[#004B23] bg-[#004B23]/5 p-4">
                      <h3 className="mb-3 text-sm font-medium text-[#004B23]">Your Account Information</h3>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs text-gray-500">Account Holder</p>
                          <p className="font-semibold text-gray-900">{customer?.fullName || "N/A"}</p>
                        </div>
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs text-gray-500">Account Number</p>
                          <p className="font-semibold text-gray-900">{customer?.accountNumber || "N/A"}</p>
                        </div>
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs text-gray-500">Outstanding Balance</p>
                          <p className="font-semibold text-[#004B23]">
                            ₦{customer?.customerOutstandingBalance?.toLocaleString() || "0"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="payment-details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]"
                >
                  {/* Selected Payment Type Summary */}
                  <motion.div
                    className="rounded-xl border bg-white p-5 shadow-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">Payment Summary</h2>

                    {selectedPaymentTypeDetails && (
                      <div className="mb-6 rounded-lg border border-[#004B23]/20 bg-[#004B23]/5 p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                            <div className="h-5 w-5 text-gray-700">{selectedPaymentTypeDetails.icon}</div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{selectedPaymentTypeDetails.name}</h3>
                            <p className="text-sm text-gray-600">{selectedPaymentTypeDetails.description}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleBackToPaymentTypes}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Change Payment Type
                        </button>
                      </div>
                    )}

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <h3 className="mb-3 text-sm font-medium text-gray-700">Payment Guidelines</h3>
                      <ul className="space-y-2 text-xs text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 text-[#004B23]">✓</span>
                          <span>Only bank transfer payments are available</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 text-[#004B23]">✓</span>
                          <span>Transfer will be processed within 15 minutes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 text-[#004B23]">✓</span>
                          <span>Keep your transaction receipt for reference</span>
                        </li>
                      </ul>
                    </div>

                    {/* Account Information */}
                    <div className="mt-6">
                      <h3 className="mb-3 text-sm font-medium text-gray-700">Your Account</h3>
                      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Account Holder:</span>
                          <span className="font-medium text-gray-900">{customer?.fullName || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Account Number:</span>
                          <span className="font-medium text-gray-900">{customer?.accountNumber || "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-t pt-3">
                          <span className="text-sm text-gray-600">Outstanding Balance:</span>
                          <span className="font-bold text-[#004B23]">
                            ₦{customer?.customerOutstandingBalance?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Payment Form */}
                  <motion.div
                    className="rounded-xl border bg-white p-5 shadow-sm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800">Payment Details</h2>
                      <p className="text-sm text-gray-600">
                        Complete the payment details for {selectedPaymentTypeDetails?.name}
                      </p>
                    </div>

                    <form onSubmit={handleSubmitPayment} className="space-y-6">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                            <span className="text-sm text-blue-600">!</span>
                          </div>
                          <div>
                            <h3 className="mb-1 text-sm font-medium text-blue-800">Important Notice</h3>
                            <p className="text-xs text-blue-700">
                              Only bank transfer payments are available for online transactions. Transfers are processed
                              within 15 minutes of successful payment.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <FormInputModule
                            label="Amount"
                            name="amount"
                            type="text"
                            placeholder="0.00"
                            value={amountInput}
                            onChange={handleAmountChange}
                            required
                            prefix="₦"
                            className="text-lg font-semibold"
                          />
                          {isFetchingChannels && (
                            <p className="mt-2 text-xs text-blue-600">
                              <span className="inline-block h-2 w-2 animate-ping rounded-full bg-blue-600"></span>
                              Checking available payment channels...
                            </p>
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
                          <div className="mt-2 flex items-center justify-between">
                            {availableChannels.length > 0 && (
                              <p className="text-xs text-gray-500">
                                {availableChannels.length} available channel{availableChannels.length !== 1 ? "s" : ""}
                              </p>
                            )}
                            {amountInput && !isFetchingChannels && availableChannels.length === 0 && (
                              <p className="text-xs text-amber-600">Enter amount to see channels</p>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <FormInputModule
                            label="Payment Narrative (Optional)"
                            name="narrative"
                            type="text"
                            placeholder="Add a note about this payment"
                            value={narrative}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNarrative(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Available Channels Display */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-3 text-sm font-medium text-gray-700">Available Payment Method</p>
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#004B23] px-4 py-2">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                          <span className="text-sm font-medium text-white">Bank Transfer</span>
                        </div>
                        <p className="mt-3 text-xs text-gray-600">
                          You&apos;ll receive a unique account number to transfer to after submission.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                        <ButtonModule
                          type="button"
                          variant="secondary"
                          className="w-full sm:w-auto"
                          onClick={handleBackToPaymentTypes}
                          disabled={isMakingPayment}
                        >
                          ← Back
                        </ButtonModule>

                        <ButtonModule
                          type="button"
                          variant="secondary"
                          className="w-full sm:w-auto"
                          onClick={resetForm}
                          disabled={isMakingPayment}
                        >
                          Cancel
                        </ButtonModule>

                        <ButtonModule
                          type="submit"
                          variant="primary"
                          className="w-full sm:w-auto"
                          disabled={isMakingPayment || isFetchingChannels || !amountInput}
                        >
                          {isMakingPayment ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                              Processing...
                            </span>
                          ) : (
                            "Generate Banks Transfer Details"
                          )}
                        </ButtonModule>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions Section */}
            <motion.div
              className="mt-8 rounded-xl border bg-white p-5 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Bank Transfer Instructions</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    1
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-900">Generate Details</h3>
                  <p className="text-xs text-gray-600">
                    Submit the form to get a unique account number and reference for your transfer.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    2
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-900">Make Transfer</h3>
                  <p className="text-xs text-gray-600">
                    Transfer the exact amount to the provided account using your banking app or platform.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    3
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-gray-900">Confirmation</h3>
                  <p className="text-xs text-gray-600">
                    Payment is processed within 15 minutes. Keep your transaction receipt for reference.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* <BankTransferDetailsModal
        isOpen={isVirtualAccountModalOpen}
        onRequestClose={() => setIsVirtualAccountModalOpen(false)}
        paymentData={makePaymentResponseData}
      /> */}
    </section>
  )
}

export default CustomerPaymentPage
