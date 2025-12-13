"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import AllPaymentsTable from "components/Tables/AllPaymentsTable"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearBillLookup,
  clearCreatePayment,
  CollectorType,
  createAgentPayment,
  lookupBill,
  PaymentChannel,
} from "lib/redux/agentSlice"
import { fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import { lookupCustomer } from "lib/redux/customerSlice"

const channelOptions = [
  { value: "", label: "Select payment channel" },
  { value: PaymentChannel.Cash, label: "Cash" },
  { value: PaymentChannel.BankTransfer, label: "Bank Transfer" },
  { value: PaymentChannel.Pos, label: "POS" },
  { value: PaymentChannel.Card, label: "Card" },
]

const CollectPaymentPage: React.FC = () => {
  const dispatch = useAppDispatch()

  const { billLookup, billLookupLoading, billLookupError } = useAppSelector((state) => state.agents)
  const { createPaymentLoading, createPaymentError, createPaymentSuccess, createdPayment } = useAppSelector(
    (state) => state.agents
  )
  const { customerLookupLoading } = useAppSelector((state) => state.customers)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)

  const [lookupMode, setLookupMode] = useState<"bill" | "customer">("bill")
  const [billNumber, setBillNumber] = useState("")
  const [customerReference, setCustomerReference] = useState("")
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
  } | null>(null)
  const [isValidatingCustomer, setIsValidatingCustomer] = useState(false)
  const [amountInput, setAmountInput] = useState("")
  const [channel, setChannel] = useState<PaymentChannel | "">(PaymentChannel.Cash)
  const [paidAt, setPaidAt] = useState<string>(new Date().toISOString().slice(0, 16))
  const [narrative, setNarrative] = useState("")
  const [paymentTypeId, setPaymentTypeId] = useState<number | "">("")

  useEffect(() => {
    dispatch(clearBillLookup())
    dispatch(clearCreatePayment())
    // Load payment types for payment type selection
    dispatch(fetchPaymentTypes())
  }, [dispatch])

  useEffect(() => {
    if (billLookup && lookupMode === "bill") {
      const total = billLookup.totalDue ?? 0
      if (total > 0) {
        setAmountInput(total.toLocaleString())
      }
    } else {
      setAmountInput("")
    }
  }, [billLookup, lookupMode])

  useEffect(() => {
    if (createPaymentSuccess && createdPayment) {
      notify("success", "Payment recorded successfully", {
        description: `Payment of ${createdPayment.amount} ${createdPayment.currency} has been recorded`,
        duration: 5000,
      })

      setBillNumber("")
      setAmountInput("")
      setChannel(PaymentChannel.Cash)
      setPaidAt(new Date().toISOString().slice(0, 16))
      setNarrative("")
      dispatch(clearBillLookup())
    }
  }, [createPaymentSuccess, createdPayment, dispatch])

  useEffect(() => {
    if (createPaymentError) {
      notify("error", "Failed to record payment", {
        description: createPaymentError,
        duration: 6000,
      })
    }
  }, [createPaymentError])

  const handleLookupBill = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!billNumber.trim()) {
      notify("error", "Please enter a bill number/reference")
      return
    }

    dispatch(clearBillLookup())

    try {
      const result = await dispatch(lookupBill(billNumber.trim()))

      if (lookupBill.rejected.match(result)) {
        const message = (result.payload as string) || "Failed to lookup bill"
        notify("error", message)

        // Fallback: try to lookup customer with the same reference, in case an account number was entered
        try {
          setIsValidatingCustomer(true)

          const customer = await dispatch(
            lookupCustomer({
              reference: billNumber.trim(),
              type: "postpaid",
            })
          ).unwrap()

          if (customer) {
            setLookupMode("customer")
            setCustomerReference(billNumber.trim())
            setCustomerInfo({
              id: customer.id,
              accountNumber: customer.accountNumber,
              fullName: customer.fullName,
              phoneNumber: customer.phoneNumber,
              email: customer.email,
              status: customer.status,
              isSuspended: customer.isSuspended,
              areaOfficeName: customer.areaOfficeName,
              feederName: customer.feederName,
              customerOutstandingDebtBalance: customer.customerOutstandingDebtBalance,
            })

            notify("success", "Customer found with this reference", {
              description: `Customer: ${customer.fullName}`,
              duration: 3000,
            })
          }
        } catch (customerError: any) {
          // If customer lookup also fails, we simply keep the original bill error
        } finally {
          setIsValidatingCustomer(false)
        }
      } else {
        notify("success", "Bill found. You can now record a payment for this bill.")
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to lookup bill")
    }
  }

  const handleLookupCustomer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerReference.trim()) {
      notify("error", "Please enter a customer reference (e.g. account number)")
      return
    }

    setCustomerInfo(null)

    try {
      setIsValidatingCustomer(true)

      const result = await dispatch(
        lookupCustomer({
          reference: customerReference.trim(),
          type: "postpaid",
        })
      ).unwrap()

      if (result) {
        setCustomerInfo({
          id: result.id,
          accountNumber: result.accountNumber,
          fullName: result.fullName,
          phoneNumber: result.phoneNumber,
          email: result.email,
          status: result.status,
          isSuspended: result.isSuspended,
          areaOfficeName: result.areaOfficeName,
          feederName: result.feederName,
          customerOutstandingDebtBalance: result.customerOutstandingDebtBalance,
        })

        notify("success", "Customer validated successfully", {
          description: `Customer found: ${result.fullName}`,
          duration: 3000,
        })
      }
    } catch (error: any) {
      notify("error", error || "Invalid customer reference")
      setCustomerInfo(null)
    } finally {
      setIsValidatingCustomer(false)
    }
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lookupMode === "bill") {
      if (!billLookup) {
        notify("error", "Lookup a bill first before recording a payment")
        return
      }
    } else {
      if (!customerInfo) {
        notify("error", "Lookup a customer first before recording a payment")
        return
      }
    }

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

    // Set payment timestamp in the background using the current time
    const paidAtUtc = new Date().toISOString()

    const payload = {
      paymentTypeId,
      amount,
      channel: channel as PaymentChannel,
      currency: "NGN",
      narrative: narrative.trim() || undefined,
      paidAtUtc,
      collectorType: CollectorType.SalesRep,
      ...(lookupMode === "bill" && billLookup
        ? { postpaidBillId: billLookup.id, customerId: billLookup.customerId }
        : {}),
      ...(lookupMode === "customer" && customerInfo ? { customerId: customerInfo.id } : {}),
    }

    try {
      const result = await dispatch(createAgentPayment(payload))

      if (createAgentPayment.rejected.match(result)) {
        const message = (result.payload as string) || "Failed to record payment"
        notify("error", message)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to record payment")
    }
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 lg:container sm:px-4 md:px-6 xl:px-16">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Collect Payment</h1>
                <p className="text-sm text-gray-600">
                  Look up a customer bill or customer account and record a payment on the field as a sales
                  representative.
                </p>
              </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              {/* Bill Lookup */}
              <motion.div
                className="rounded-md border bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-3 text-base font-semibold text-gray-800">Lookup</h2>

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLookupMode("bill")
                      setCustomerReference("")
                      setCustomerInfo(null)
                    }}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      lookupMode === "bill"
                        ? "border-[#004B23] bg-[#004B23]/5 text-[#004B23]"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    By Bill
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLookupMode("customer")
                      setBillNumber("")
                      dispatch(clearBillLookup())
                    }}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      lookupMode === "customer"
                        ? "border-[#004B23] bg-[#004B23]/5 text-[#004B23]"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    By Customer
                  </button>
                </div>

                {lookupMode === "bill" && (
                  <form onSubmit={handleLookupBill} className="space-y-4">
                    <FormInputModule
                      label="Bill Number / Reference"
                      type="text"
                      name="billNumber"
                      placeholder="Enter bill number or reference"
                      value={billNumber}
                      onChange={(e) => setBillNumber(e.target.value)}
                      required
                    />

                    <p className="text-xs text-gray-500">
                      Use the customer bill number or reference printed on the bill to fetch the latest bill details.
                    </p>

                    {billLookupError && <p className="text-sm text-red-500">{billLookupError}</p>}

                    <div className="mt-4 flex gap-3">
                      <ButtonModule
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto"
                        disabled={billLookupLoading}
                      >
                        {billLookupLoading ? "Looking up..." : "Lookup Bill"}
                      </ButtonModule>

                      {billLookup && (
                        <ButtonModule
                          type="button"
                          variant="secondary"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            dispatch(clearBillLookup())
                            setBillNumber("")
                            setAmountInput("")
                          }}
                          disabled={billLookupLoading}
                        >
                          Clear
                        </ButtonModule>
                      )}
                    </div>
                  </form>
                )}

                {lookupMode === "customer" && (
                  <form onSubmit={handleLookupCustomer} className="space-y-4">
                    <FormInputModule
                      label="Customer Reference"
                      type="text"
                      name="customerReference"
                      placeholder="Enter customer account number or reference"
                      value={customerReference}
                      onChange={(e) => setCustomerReference(e.target.value)}
                      required
                    />

                    <p className="text-xs text-gray-500">
                      Use the customer&apos;s account number or other reference to find the customer record.
                    </p>

                    <div className="mt-4 flex gap-3">
                      <ButtonModule
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto"
                        disabled={isValidatingCustomer || customerLookupLoading}
                      >
                        {isValidatingCustomer || customerLookupLoading ? "Validating..." : "Lookup Customer"}
                      </ButtonModule>

                      {customerInfo && (
                        <ButtonModule
                          type="button"
                          variant="secondary"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setCustomerReference("")
                            setCustomerInfo(null)
                          }}
                          disabled={isValidatingCustomer || customerLookupLoading}
                        >
                          Clear
                        </ButtonModule>
                      )}
                    </div>
                  </form>
                )}
              </motion.div>

              {/* Payment Details */}
              <motion.div
                className="rounded-md border bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <h2 className="mb-3 text-base font-semibold text-gray-800">Payment Details</h2>

                {lookupMode === "bill" && !billLookup && !billLookupLoading && (
                  <p className="text-sm text-gray-500">
                    No bill selected yet. Use the lookup form on the left to find a customer bill.
                  </p>
                )}

                {lookupMode === "customer" && !customerInfo && !isValidatingCustomer && (
                  <p className="text-sm text-gray-500">
                    No customer selected yet. Use the lookup form on the left to find a customer.
                  </p>
                )}

                {(billLookupLoading || isValidatingCustomer || customerLookupLoading) && (
                  <p className="text-sm text-gray-500">Searching...</p>
                )}

                {lookupMode === "bill" && billLookup && (
                  <form onSubmit={handleSubmitPayment} className="mt-4 space-y-5">
                    <div className="rounded-md border border-dashed border-[#004B23] bg-[#004B23]/5 p-4 text-sm">
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-[#004B23]">Customer:</span>
                        <span className="font-medium text-[#004B23]">{billLookup.customerName}</span>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-[#004B23]">Account Number:</span>
                        <span className="font-medium text-[#004B23]">{billLookup.customerAccountNumber}</span>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-[#004B23]">Bill Period:</span>
                        <span className="font-medium text-[#004B23]">{billLookup.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-[#004B23]">Total Due:</span>
                        <span className="font-semibold text-[#004B23]">₦{billLookup.totalDue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormSelectModule
                        label="Payment Type"
                        name="paymentTypeId"
                        value={paymentTypeId}
                        onChange={({ target }) => setPaymentTypeId(Number(target.value))}
                        options={[
                          { value: "", label: "Select payment type" },
                          ...paymentTypes.filter((pt) => pt.isActive).map((pt) => ({ value: pt.id, label: pt.name })),
                        ]}
                        required
                      />

                      <FormInputModule
                        label="Amount"
                        name="amount"
                        type="text"
                        placeholder="Enter payment amount"
                        value={amountInput}
                        onChange={(e) => {
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
                        }}
                        required
                        min="0.01"
                        step="0.01"
                        prefix="₦"
                      />

                      <FormSelectModule
                        label="Payment Channel"
                        name="channel"
                        value={channel}
                        onChange={({ target }) => setChannel(target.value as PaymentChannel | "")}
                        options={channelOptions}
                        required
                      />

                      <FormInputModule
                        label="Narrative (optional)"
                        name="narrative"
                        type="text"
                        placeholder="Short description or note"
                        value={narrative}
                        onChange={(e) => setNarrative(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                      <ButtonModule
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setAmountInput("")
                          setChannel(PaymentChannel.Cash)
                          setNarrative("")
                        }}
                        disabled={createPaymentLoading}
                      >
                        Reset
                      </ButtonModule>

                      <ButtonModule
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto"
                        disabled={createPaymentLoading}
                      >
                        {createPaymentLoading ? "Recording..." : "Record Payment"}
                      </ButtonModule>
                    </div>
                  </form>
                )}

                {lookupMode === "customer" && customerInfo && (
                  <form onSubmit={handleSubmitPayment} className="mt-4 space-y-5">
                    <div className="rounded-md border bg-gray-50 p-4 text-sm">
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-gray-700">Customer:</span>
                        <span className="text-gray-900">{customerInfo.fullName}</span>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-gray-700">Account Number:</span>
                        <span className="text-gray-900">{customerInfo.accountNumber}</span>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="text-gray-900">
                          {customerInfo.isSuspended ? "Suspended" : customerInfo.status || "Active"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Outstanding Balance:</span>
                        <span className="text-gray-900">
                          ₦{Number(customerInfo.customerOutstandingDebtBalance ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInputModule
                        label="Amount"
                        name="amount"
                        type="text"
                        placeholder="Enter payment amount"
                        value={amountInput}
                        onChange={(e) => {
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
                        }}
                        required
                        min="0.01"
                        step="0.01"
                        prefix="₦"
                      />

                      <FormSelectModule
                        label="Payment Channel"
                        name="channel"
                        value={channel}
                        onChange={({ target }) => setChannel(target.value as PaymentChannel | "")}
                        options={channelOptions}
                        required
                      />

                      <FormInputModule
                        label="Narrative (optional)"
                        name="narrative"
                        type="text"
                        placeholder="Short description or note"
                        value={narrative}
                        onChange={(e) => setNarrative(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                      <ButtonModule
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setAmountInput("")
                          setChannel(PaymentChannel.Cash)
                          setNarrative("")
                        }}
                        disabled={createPaymentLoading}
                      >
                        Reset
                      </ButtonModule>

                      <ButtonModule
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto"
                        disabled={createPaymentLoading}
                      >
                        {createPaymentLoading ? "Recording..." : "Record Payment"}
                      </ButtonModule>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>

            {/* Customer Transaction History */}
            <div className="mt-8">
              {(() => {
                const historyCustomerId =
                  lookupMode === "customer" ? customerInfo?.id : billLookup?.customerId ?? undefined

                if (!historyCustomerId) return null

                return (
                  <div className="rounded-md border bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-base font-semibold text-gray-800">Customer Transaction History</h2>
                    <p className="mb-4 text-sm text-gray-600">Recent payments recorded for this customer.</p>
                    <AllPaymentsTable customerId={historyCustomerId} />
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CollectPaymentPage
