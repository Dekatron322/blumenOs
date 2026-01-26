"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import VendTokenModal from "components/ui/Modal/vend-token-modal"
import VendBankTransferModal from "components/ui/Modal/vend-bank-transfer-modal"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  checkPayment,
  clearCheckPayment,
  clearCustomerLookup,
  clearVend,
  fetchPaymentChannels,
  lookupCustomer,
  PaymentChannel,
  vend,
} from "lib/redux/agentSlice"
import { fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import AllPaymentsTable from "components/Tables/AllPaymentsTable"

const VendPage: React.FC = () => {
  const dispatch = useAppDispatch()

  const {
    vendData,
    vendLoading,
    vendError,
    vendSuccess,
    customerLookupLoading,
    customerLookup,
    customerLookupError,
    customerLookupSuccess,
    paymentChannels,
    paymentChannelsLoading,
    paymentChannelsError,
    checkPaymentLoading,
    checkPaymentError,
    checkPaymentSuccess,
    checkPaymentData,
  } = useAppSelector((state) => state.agents)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)

  const [meterNumber, setMeterNumber] = useState("")
  const [customerInfo, setCustomerInfo] = useState<{
    id: number
    accountNumber: string
    fullName: string
    phoneNumber: string
    email: string
    status: string
    isSuspended: boolean
    areaOfficeName: string
    feederName: string
    customerOutstandingDebtBalance: number
    minimumPayment: number
  } | null>(null)
  const [isValidatingCustomer, setIsValidatingCustomer] = useState(false)
  const [amountInput, setAmountInput] = useState("")
  const [channel, setChannel] = useState<PaymentChannel | "">(PaymentChannel.Cash)
  const [narrative, setNarrative] = useState("")
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
  const [availableChannels, setAvailableChannels] = useState<PaymentChannel[]>([])
  const [isFetchingChannels, setIsFetchingChannels] = useState(false)
  const [lastFetchedAmount, setLastFetchedAmount] = useState<number | null>(null)
  const [isVirtualAccountModalOpen, setIsVirtualAccountModalOpen] = useState(false)
  const [virtualAccount, setVirtualAccount] = useState<any>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  // Generate channel options based on available channels
  const channelOptions = [
    { value: "", label: "Select payment channel" },
    ...availableChannels.map((channel) => ({
      value: channel,
      label: channel.replace(/([A-Z])/g, " $1").trim(),
    })),
  ]

  // Default channel options as fallback
  const defaultChannelOptions = [
    { value: "", label: "Select payment channel" },
    { value: PaymentChannel.Cash, label: "Cash" },
    { value: PaymentChannel.BankTransfer, label: "Bank Transfer" },
    { value: PaymentChannel.Pos, label: "POS" },
    { value: PaymentChannel.Card, label: "Card" },
    { value: PaymentChannel.VendorWallet, label: "Vendor Wallet" },
    { value: PaymentChannel.Cheque, label: "Cheque" },
  ]

  useEffect(() => {
    dispatch(clearVend())
    dispatch(clearCustomerLookup())
    // Load payment types for payment type selection
    dispatch(fetchPaymentTypes())
  }, [dispatch])

  // Fetch payment channels based on amount
  useEffect(() => {
    const fetchChannelsForAmount = async () => {
      const rawAmount = amountInput.replace(/,/g, "").trim()
      const amount = Number(rawAmount)

      // Only fetch if we have a valid amount, it's different from the last fetched amount, and meets minimum payment
      const meetsMinimumPayment =
        !customerInfo || customerInfo.minimumPayment <= 0 || amount >= customerInfo.minimumPayment
      if (rawAmount && !Number.isNaN(amount) && amount > 0 && amount !== lastFetchedAmount && meetsMinimumPayment) {
        setIsFetchingChannels(true)
        try {
          const result = await dispatch(fetchPaymentChannels({ amount })).unwrap()

          if (result && result.channels && Array.isArray(result.channels)) {
            setAvailableChannels(result.channels)
            setLastFetchedAmount(amount)

            // If current selected channel is not in available channels, reset it
            if (channel && !result.channels.includes(channel as PaymentChannel)) {
              setChannel(result.channels[0] || "")
            }
          } else {
            // Fallback to default channels if API returns unexpected data
            setAvailableChannels([
              PaymentChannel.Cash,
              PaymentChannel.BankTransfer,
              PaymentChannel.Pos,
              PaymentChannel.Card,
              PaymentChannel.VendorWallet,
              PaymentChannel.Cheque,
            ])
          }
        } catch (error: any) {
          console.error("Failed to fetch payment channels:", error)
          // Fallback to all channels if API fails
          setAvailableChannels([
            PaymentChannel.Cash,
            PaymentChannel.BankTransfer,
            PaymentChannel.Pos,
            PaymentChannel.Card,
            PaymentChannel.VendorWallet,
            PaymentChannel.Cheque,
          ])
        } finally {
          setIsFetchingChannels(false)
        }
      } else if (!rawAmount || amount <= 0) {
        // Reset available channels when amount is cleared or invalid
        setAvailableChannels([])
        setLastFetchedAmount(null)
      }
    }

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchChannelsForAmount()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [amountInput, dispatch, channel, lastFetchedAmount, customerInfo])

  useEffect(() => {
    if (vendSuccess && vendData) {
      // Check if payment is pending and has virtual account (bank transfer)
      if (vendData.isPending && vendData.paymentDetails?.virtualAccount) {
        setVirtualAccount(vendData.paymentDetails.virtualAccount)
        setIsVirtualAccountModalOpen(true)
      } else if (vendData.token) {
        // Show token modal if token data is available
        setIsTokenModalOpen(true)
      } else {
        // Fallback to notification for non-token vends
        notify("success", "Vend completed successfully", {
          description: `Vend of ₦${amountInput.replace(/,/g, "")} has been processed`,
          duration: 5000,
        })

        // Reset form
        setMeterNumber("")
        setAmountInput("")
        setChannel(PaymentChannel.Cash)
        setNarrative("")
        setCustomerInfo(null)
        dispatch(clearVend())
      }
    }
  }, [vendSuccess, vendData, dispatch, amountInput])

  useEffect(() => {
    if (vendError) {
      notify("error", "Failed to complete vend", {
        description: vendError,
        duration: 6000,
      })
    }
  }, [vendError])

  useEffect(() => {
    if (customerLookupSuccess && customerLookup) {
      setCustomerInfo({
        id: customerLookup.id,
        accountNumber: customerLookup.accountNumber,
        fullName: customerLookup.fullName,
        phoneNumber: customerLookup.phoneNumber,
        email: customerLookup.email,
        status: customerLookup.status,
        isSuspended: customerLookup.isSuspended,
        areaOfficeName: customerLookup.areaOfficeName,
        feederName: customerLookup.feederName,
        customerOutstandingDebtBalance: customerLookup.customerOutstandingDebtBalance,
        minimumPayment: customerLookup.minimumPayment || 0,
      })

      notify("success", "Customer validated successfully", {
        description: `Customer found: ${customerLookup.fullName}`,
        duration: 3000,
      })
    }
  }, [customerLookupSuccess, customerLookup])

  useEffect(() => {
    if (paymentChannelsError) {
      notify("error", "Failed to load payment channels", {
        description: paymentChannelsError,
        duration: 6000,
      })
    }
  }, [paymentChannelsError])

  useEffect(() => {
    if (customerLookupError) {
      notify("error", customerLookupError || "Failed to validate customer", {
        duration: 6000,
      })
    }
  }, [customerLookupError])

  useEffect(() => {
    if (checkPaymentSuccess && checkPaymentData) {
      // If the confirmed payment has tokens, close modal and show token modal
      if (checkPaymentData.token) {
        // Close the bank transfer modal
        setIsVirtualAccountModalOpen(false)
        setVirtualAccount(null)

        // Show success notification
        notify("success", "Payment confirmed successfully", {
          description: "Your bank transfer has been confirmed and the vend will be processed.",
          duration: 5000,
        })

        // Update vendData with the confirmed payment data to trigger token modal
        const updatedVendData = {
          ...vendData,
          ...checkPaymentData,
          isPending: false,
        }

        // Manually trigger the vend success flow
        dispatch({ type: "agents/vend/fulfilled", payload: updatedVendData })

        // Clear check payment state
        dispatch(clearCheckPayment())
      }
      // If token is still null, do nothing - let polling continue
    }
  }, [checkPaymentSuccess, checkPaymentData, dispatch, vendData])

  useEffect(() => {
    if (checkPaymentError) {
      notify("error", "Failed to check payment", {
        description: checkPaymentError,
        duration: 6000,
      })
    }
  }, [checkPaymentError])

  const handleLookupCustomer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!meterNumber.trim()) {
      notify("error", "Please enter a meter number")
      return
    }

    setCustomerInfo(null)
    dispatch(clearCustomerLookup())

    try {
      setIsValidatingCustomer(true)

      await dispatch(lookupCustomer(meterNumber.trim())).unwrap()
    } catch (error: any) {
      // Error is handled by the useEffect above
    } finally {
      setIsValidatingCustomer(false)
    }
  }

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerInfo) {
      notify("error", "Validate customer first before processing vend")
      return
    }

    const rawAmount = amountInput.replace(/,/g, "").trim()
    const amount = Number(rawAmount)

    if (!rawAmount || Number.isNaN(amount) || amount <= 0) {
      notify("error", "Please enter a valid amount greater than 0")
      return
    }

    // Check if amount meets minimum payment requirement
    if (customerInfo && amount < customerInfo.minimumPayment) {
      notify("error", `Minimum payment amount is ₦${customerInfo.minimumPayment.toLocaleString()}`, {
        description: `Please enter an amount of at least ₦${customerInfo.minimumPayment.toLocaleString()} to proceed with the vend.`,
        duration: 6000,
      })
      return
    }

    // Validate if selected channel is available for this amount
    if (availableChannels.length > 0 && !availableChannels.includes(channel as PaymentChannel)) {
      notify("error", "Selected payment channel is not available for this amount", {
        description: "Please select one of the available channels listed above",
        duration: 6000,
      })
      return
    }

    // Open confirmation modal
    setIsConfirmModalOpen(true)
  }

  const handleConfirmVend = async () => {
    if (!customerInfo) return

    const rawAmount = amountInput.replace(/,/g, "").trim()
    const amount = Number(rawAmount)

    // Get user location
    let latitude = 0
    let longitude = 0

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false,
        })
      })
      latitude = position.coords.latitude
      longitude = position.coords.longitude
    } catch (error) {
      console.warn("Could not get location, using default coordinates")
    }

    const payload = {
      meterNumber: meterNumber.trim(),
      amount,
      paymentTypeId: 1,
      channel: channel as string,
      latitude,
      longitude,
      externalReference: `VEND-${Date.now()}`,
      narrative: narrative.trim() || "",
    }

    setIsConfirmModalOpen(false)

    try {
      await dispatch(vend(payload)).unwrap()
    } catch (error: any) {
      notify("error", error || "Failed to complete vend")
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").trim()

    if (raw === "") {
      setAmountInput("")
      return
    }

    if (!/^\d*(\.\d*)?$/.test(raw)) {
      return
    }

    const [intPart, decimalPart] = raw.split(".")
    const formattedInt = intPart ? Number(intPart).toLocaleString() : ""
    const formatted = decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt
    setAmountInput(formatted)
  }

  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as PaymentChannel | ""
    setChannel(value)
  }

  const handleTokenModalClose = () => {
    setIsTokenModalOpen(false)
    // Reset form after closing modal
    setMeterNumber("")
    setAmountInput("")
    setChannel(PaymentChannel.Cash)
    setNarrative("")
    setCustomerInfo(null)
    dispatch(clearVend())
  }

  const handleVirtualAccountModalClose = () => {
    setIsVirtualAccountModalOpen(false)
    setVirtualAccount(null)
    // Reset form after closing modal
    setMeterNumber("")
    setAmountInput("")
    setChannel(PaymentChannel.Cash)
    setNarrative("")
    setCustomerInfo(null)
    dispatch(clearVend())
  }

  const handleCheckPayment = async () => {
    if (!vendData?.reference) {
      notify("error", "Payment reference not found")
      return
    }

    try {
      await dispatch(
        checkPayment({
          reference: vendData.reference,
        })
      ).unwrap()
    } catch (error: any) {
      console.error("Failed to check payment:", error)
      // Error is handled by the useEffect above
    }
  }

  const resetForm = () => {
    setMeterNumber("")
    setAmountInput("")
    setChannel(PaymentChannel.Cash)
    setNarrative("")
    setCustomerInfo(null)
    dispatch(clearCustomerLookup())
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container xl:px-16">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Vend</h1>
                <p className="text-sm text-gray-600">
                  Enter a customer meter number to validate the customer, then process a vend transaction.
                </p>
              </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              {/* Customer Lookup */}
              <motion.div
                className="rounded-md border bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-3 text-base font-semibold text-gray-800">Customer Validation</h2>

                <form onSubmit={handleLookupCustomer} className="space-y-4">
                  <FormInputModule
                    label="Meter Number"
                    type="text"
                    name="meterNumber"
                    placeholder="Enter customer meter number"
                    value={meterNumber}
                    onChange={(e) => setMeterNumber(e.target.value)}
                    required
                  />

                  <p className="text-xs text-gray-500">
                    Use the customer&apos;s meter number to validate the customer before processing vend.
                  </p>

                  <div className="mt-4 flex gap-3">
                    <ButtonModule
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto"
                      disabled={isValidatingCustomer || customerLookupLoading}
                    >
                      {isValidatingCustomer || customerLookupLoading ? "Validating..." : "Validate"}
                    </ButtonModule>

                    {customerInfo && (
                      <ButtonModule
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setMeterNumber("")
                          setCustomerInfo(null)
                          resetForm()
                        }}
                        disabled={isValidatingCustomer || customerLookupLoading}
                      >
                        Clear
                      </ButtonModule>
                    )}
                  </div>
                </form>

                {customerInfo && (
                  <div className="mt-4 rounded-md border border-dashed border-[#004B23] bg-[#004B23]/5 p-4 text-sm">
                    <div className="mb-2 flex justify-between">
                      <span className="font-medium text-[#004B23]">Customer:</span>
                      <span className="text-base font-bold text-[#004B23]">{customerInfo.fullName}</span>
                    </div>
                    <div className="mb-2 flex justify-between">
                      <span className="font-medium text-[#004B23]">Account Number:</span>
                      <span className="text-base font-bold text-[#004B23]">{customerInfo.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-[#004B23]">Status:</span>
                      <span className="text-base font-bold text-[#004B23]">
                        {customerInfo.isSuspended ? "Suspended" : customerInfo.status || "Active"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Channels Info - always visible with safe fallbacks */}
              </motion.div>

              {/* Vend Form */}
              <motion.div
                className="rounded-md border bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                {customerInfo && (
                  <div
                    className={`mb-4 rounded-md border-2 p-3 ${
                      customerInfo.customerOutstandingDebtBalance > 0
                        ? "border-dashed border-red-300 bg-red-50"
                        : "border-dashed border-[#004B23] bg-[#004B23]/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            customerInfo.customerOutstandingDebtBalance > 0 ? "bg-red-500" : "bg-green-500"
                          }`}
                        />
                        <span
                          className={`text-sm font-semibold ${
                            customerInfo.customerOutstandingDebtBalance > 0 ? "text-red-800" : "text-green-800"
                          }`}
                        >
                          {customerInfo.customerOutstandingDebtBalance > 0
                            ? "⚠️ OUTSTANDING DEBT ALERT"
                            : "✓ NO OUTSTANDING DEBT"}
                        </span>
                      </div>
                      <span
                        className={`text-lg font-bold ${
                          customerInfo.customerOutstandingDebtBalance > 0 ? "text-red-700" : "text-green-700"
                        }`}
                      >
                        ₦{Number(customerInfo.customerOutstandingDebtBalance).toLocaleString()}
                      </span>
                    </div>
                    {customerInfo.customerOutstandingDebtBalance > 0 ? (
                      <p className="mt-1 text-xs text-red-600">
                        Customer has outstanding debt that may affect this transaction
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-green-600">
                        Customer has no outstanding debt - transaction can proceed normally
                      </p>
                    )}
                  </div>
                )}
                <h2 className="mb-3 text-base font-semibold text-gray-800">Vend Details</h2>

                {!customerInfo && !isValidatingCustomer && (
                  <p className="text-sm text-gray-500">
                    No customer validated yet. Use the validation form on the left to find a customer by meter number.
                  </p>
                )}

                {isValidatingCustomer && <p className="text-sm text-gray-500">Validating customer...</p>}

                {customerInfo && (
                  <form onSubmit={handleOpenConfirmModal} className="mt-4 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FormInputModule
                          label="Amount"
                          name="amount"
                          type="text"
                          placeholder="Enter vend amount"
                          value={amountInput}
                          onChange={handleAmountChange}
                          required
                          min="0.01"
                          step="0.01"
                          prefix="₦"
                        />
                        {customerInfo.minimumPayment > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Minimum payment: ₦{customerInfo.minimumPayment.toLocaleString()}
                          </p>
                        )}
                        {amountInput &&
                          customerInfo.minimumPayment > 0 &&
                          Number(amountInput.replace(/,/g, "")) < customerInfo.minimumPayment && (
                            <p className="mt-1 text-xs font-medium text-red-600">
                              Entered amount is less than minimum payment of ₦
                              {customerInfo.minimumPayment.toLocaleString()}
                            </p>
                          )}
                      </div>

                      <FormSelectModule
                        label="Payment Channel"
                        name="channel"
                        value={channel}
                        onChange={handleChannelChange}
                        options={availableChannels.length > 0 ? channelOptions : defaultChannelOptions}
                        required
                        disabled={isFetchingChannels || availableChannels.length === 0}
                      />
                      {availableChannels.length === 0 && amountInput && !isFetchingChannels && (
                        <p className="mt-1 text-xs text-amber-600">Enter an amount to see available payment channels</p>
                      )}
                      {availableChannels.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          {availableChannels.length} channel{availableChannels.length !== 1 ? "s" : ""} available
                        </p>
                      )}
                      {isFetchingChannels && (
                        <p className="mt-1 text-xs text-blue-600">Checking available payment channels...</p>
                      )}

                      <div className="col-span-2 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium text-blue-800">Payment Limits & Info</span>
                          {isFetchingChannels && (
                            <span className="text-xs text-blue-600">Checking availability...</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                          <div>
                            <span className="font-medium">Cash at Hand:</span>{" "}
                            <span>₦{(paymentChannels?.cashAtHand || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-medium">Collection Limit:</span>{" "}
                            <span>₦{(paymentChannels?.cashCollectionLimit || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-medium">Max Single Cash Amount:</span>{" "}
                            <span>₦{(paymentChannels?.maxSingleAllowedCashAmount || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-medium">Available Channels:</span>{" "}
                            <span>{availableChannels.length}</span>
                          </div>
                        </div>
                        {paymentChannels?.message && (
                          <p className="mt-2 text-sm font-semibold italic text-orange-600">{paymentChannels.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Available Channels Display */}
                    {availableChannels.length > 0 && (
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                        <p className="mb-2 text-sm font-medium text-gray-700">Available Payment Channels:</p>
                        <div className="flex flex-wrap gap-2">
                          {availableChannels.map((availableChannel) => (
                            <span
                              key={availableChannel}
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                channel === availableChannel ? "bg-[#004B23] text-white" : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {availableChannel.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <FormTextAreaModule
                      label="Narrative (optional)"
                      name="narrative"
                      placeholder="Short description or note"
                      value={narrative}
                      onChange={(e) => setNarrative(e.target.value)}
                      rows={3}
                    />

                    <div className="flex  gap-3 pt-2  sm:justify-end">
                      <ButtonModule
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={resetForm}
                        disabled={vendLoading}
                      >
                        Reset
                      </ButtonModule>

                      <ButtonModule
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto"
                        disabled={
                          vendLoading ||
                          (customerInfo &&
                            customerInfo.minimumPayment > 0 &&
                            Number(amountInput.replace(/,/g, "")) < customerInfo.minimumPayment)
                        }
                      >
                        {vendLoading ? "Processing..." : "Process Vend"}
                      </ButtonModule>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>

            {/* Customer Transaction History */}
            <div className="mt-8">
              {customerInfo && (
                <div className="rounded-md border bg-white p-5 shadow-sm">
                  <h2 className="mb-3 text-base font-semibold text-gray-800">Customer Transaction History</h2>
                  <p className="mb-4 text-sm text-gray-600">Recent payments and vends for this customer.</p>
                  <AllPaymentsTable customerId={customerInfo.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Token Modal */}
      <VendTokenModal
        isOpen={isTokenModalOpen}
        onRequestClose={handleTokenModalClose}
        tokenData={vendData?.token || null}
        paymentData={
          vendData
            ? {
                reference: vendData.reference!,
                customerName: vendData.customerName!,
                customerAccountNumber: vendData.customerAccountNumber!,
                customerAddress: vendData.customerAddress,
                customerPhoneNumber: vendData.customerPhoneNumber,
                customerMeterNumber: vendData.customerMeterNumber,
                accountType: vendData.accountType,
                tariffRate: vendData.tariffRate,
                units: vendData.units,
                vatRate: vendData.vatRate,
                vatAmount: vendData.vatAmount,
                electricityAmount: vendData.electricityAmount,
                outstandingDebt: vendData.outstandingDebt,
                debtPayable: vendData.debtPayable,
                totalAmountPaid: vendData.totalAmountPaid!,
                currency: vendData.currency!,
                channel: vendData.channel!,
                status: vendData.status,
                paymentTypeName: vendData.paymentTypeName,
                paidAtUtc: vendData.paidAtUtc!,
                externalReference: vendData.externalReference,
              }
            : null
        }
      />

      {/* Bank Transfer Modal */}
      <VendBankTransferModal
        isOpen={isVirtualAccountModalOpen}
        onRequestClose={handleVirtualAccountModalClose}
        virtualAccount={virtualAccount}
        paymentData={
          vendData &&
          vendData.reference &&
          vendData.totalAmountPaid &&
          vendData.currency &&
          vendData.customerName &&
          vendData.customerAccountNumber
            ? {
                reference: vendData.reference,
                amount: vendData.totalAmountPaid,
                currency: vendData.currency,
                customerName: vendData.customerName,
                customerAccountNumber: vendData.customerAccountNumber,
                customerAddress: vendData.customerAddress,
                customerPhoneNumber: vendData.customerPhoneNumber,
                customerMeterNumber: vendData.customerMeterNumber,
                accountType: vendData.accountType,
                tariffRate: vendData.tariffRate,
                units: vendData.units,
                vatRate: vendData.vatRate,
                vatAmount: vendData.vatAmount,
                electricityAmount: vendData.electricityAmount,
                outstandingDebt: vendData.outstandingDebt,
                debtPayable: vendData.debtPayable,
                totalAmountPaid: vendData.totalAmountPaid,
                status: vendData.status,
                paymentTypeName: vendData.paymentTypeName,
              }
            : null
        }
        onCheckPayment={handleCheckPayment}
        isCheckingPayment={checkPaymentLoading}
        onConfirm={() => {
          setIsVirtualAccountModalOpen(false)
          setVirtualAccount(null)
          // Reset form after confirmation
          setMeterNumber("")
          setAmountInput("")
          setChannel(PaymentChannel.Cash)
          setNarrative("")
          setCustomerInfo(null)
          dispatch(clearVend())
        }}
      />

      {/* Vend Confirmation Modal */}
      {isConfirmModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
          onClick={() => setIsConfirmModalOpen(false)}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-xl rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 bg-[#F9F9F9] px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Confirm Vend Transaction</h2>
              <p className="mt-1 text-sm text-gray-500">Please review the details before proceeding</p>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Customer Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{customerInfo?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-medium text-gray-900">{customerInfo?.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meter Number:</span>
                    <span className="font-medium text-gray-900">{meterNumber}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md border-2 border-[#004B23] bg-[#004B23]/5 p-4">
                <h3 className="mb-3 text-sm font-medium text-[#004B23]">Vend Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount to Vend:</span>
                    <span className="text-xl font-bold text-[#004B23]">₦{amountInput}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Channel:</span>
                    <span className="font-medium text-gray-900">
                      {channel ? channel.replace(/([A-Z])/g, " $1").trim() : "Not selected"}
                    </span>
                  </div>
                  {narrative && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Narrative:</span>
                      <span className="max-w-[200px] truncate font-medium text-gray-900">{narrative}</span>
                    </div>
                  )}
                </div>
              </div>

              {customerInfo && customerInfo.customerOutstandingDebtBalance > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-700">
                    <strong>Note:</strong> Customer has an outstanding debt of ₦
                    {customerInfo.customerOutstandingDebtBalance.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-200 bg-white px-6 py-4">
              <ButtonModule
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={vendLoading}
              >
                Cancel
              </ButtonModule>
              <ButtonModule
                type="button"
                variant="primary"
                className="flex-1"
                onClick={handleConfirmVend}
                disabled={vendLoading}
              >
                {vendLoading ? "Processing..." : `Confirm ₦${amountInput}`}
              </ButtonModule>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}

export default VendPage
