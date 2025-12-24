"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { notify } from "components/ui/Notification/Notification"
import { fetchCustomerPaymentChannels, recordCustomerPayment } from "lib/redux/createCustomerSlice"
import { fetchPaymentTypes } from "lib/redux/paymentTypeSlice"

interface RecordPaymentModalProps {
  isOpen: boolean
  onRequestClose: () => void
  customerId: number
  customerName: string
  accountNumber: string
}

const currencyOptions = [{ value: "NGN", label: "NGN - Nigerian Naira" }]

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onRequestClose,
  customerId,
  customerName,
  accountNumber,
}) => {
  const dispatch = useAppDispatch()
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { customerPaymentChannels, customerPaymentChannelsLoading } = useAppSelector((state) => state.createCustomer)
  const { recordPaymentLoading } = useAppSelector((state) => state.createCustomer)

  const [amount, setAmount] = React.useState("")
  const [paymentTypeId, setPaymentTypeId] = React.useState<number>(1)
  const [channel, setChannel] = React.useState<string>("")
  const [currency, setCurrency] = React.useState("NGN")
  const [paidAtUtc, setPaidAtUtc] = React.useState<string>(new Date().toISOString().slice(0, 16))
  const [externalReference, setExternalReference] = React.useState("")
  const [narrative, setNarrative] = React.useState("")

  React.useEffect(() => {
    if (isOpen) {
      setAmount("")
      setPaymentTypeId(1)
      setChannel("")
      setCurrency("NGN")
      setPaidAtUtc(new Date().toISOString().slice(0, 16))
      setExternalReference("")
      setNarrative("")

      if (!paymentTypes || paymentTypes.length === 0) {
        dispatch(fetchPaymentTypes())
      }
      if (!customerPaymentChannels || customerPaymentChannels.length === 0) {
        dispatch(fetchCustomerPaymentChannels(customerId))
      }
    }
  }, [isOpen, dispatch, paymentTypes, customerPaymentChannels, customerId])

  if (!isOpen) return null

  const paymentTypeOptions = paymentTypes.map((type) => ({ value: type.id.toString(), label: type.name }))

  const energyBillPaymentType = paymentTypes.find(
    (paymentType) => paymentType.name && paymentType.name.toLowerCase() === "bills payment"
  )

  const validateForm = (): boolean => {
    const errors: string[] = []

    const numericAmount = Number(amount)
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      errors.push("Amount must be greater than zero")
    }

    if (!paymentTypeId) {
      errors.push("Payment type is required")
    }

    if (!paidAtUtc) {
      errors.push("Payment date and time is required")
    } else {
      const paymentDate = new Date(paidAtUtc)
      const now = new Date()
      if (paymentDate > now) {
        errors.push("Payment date cannot be in the future")
      }
    }

    if (!channel) {
      errors.push("Payment channel is required")
    }

    if (!currency) {
      errors.push("Currency is required")
    }

    if (errors.length > 0) {
      notify("error", "Please fix the form errors before submitting", {
        description: errors.join("; "),
        duration: 5000,
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const numericAmount = Number(amount)
      const paymentData = {
        paymentTypeId: paymentTypeId,
        amount: numericAmount,
        channel,
        currency,
        paidAtUtc,
        ...(externalReference.trim() && { externalReference: externalReference.trim() }),
        ...(narrative.trim() && { narrative: narrative.trim() }),
      }

      const result = await dispatch(recordCustomerPayment({ customerId, paymentData })).unwrap()

      if (result.isSuccess) {
        notify("success", "Payment recorded successfully", {
          description: `Payment of ${numericAmount} ${currency} has been recorded for ${customerName}`,
          duration: 5000,
        })
        onRequestClose()
      }
    } catch (error: any) {
      if (!String(error || "").includes("Network error")) {
        notify("error", "Failed to record payment", {
          description: error || "An unexpected error occurred",
          duration: 6000,
        })
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-3 backdrop-blur-sm sm:px-4"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:px-6 sm:py-5">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">Record Payment</h2>
          <button
            onClick={onRequestClose}
            className="flex size-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-8"
            disabled={recordPaymentLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-4 px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="mb-2 w-full text-center">
              <h3 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">{customerName}</h3>
              <p className="text-xs text-gray-600 sm:text-sm">Account: {accountNumber}</p>
            </div>

            <p className="text-xs text-gray-500 sm:text-sm">
              Enter the payment details for this customer. Payment type and customer are already set.
            </p>

            <FormInputModule
              label="Amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={recordPaymentLoading}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormSelectModule
                label="Payment Type"
                name="paymentTypeId"
                value={paymentTypeId.toString()}
                onChange={({ target }) => setPaymentTypeId(Number(target.value))}
                options={paymentTypeOptions}
                required
                disabled={recordPaymentLoading}
              />
              <FormSelectModule
                label="Channel"
                name="channel"
                value={channel}
                onChange={({ target }) => setChannel(target.value as typeof channel)}
                options={
                  customerPaymentChannels && customerPaymentChannels.length > 0
                    ? customerPaymentChannels.map((channel) => ({ value: channel, label: channel }))
                    : []
                }
                required
                disabled={recordPaymentLoading || customerPaymentChannelsLoading}
              />
            </div>

            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormSelectModule
                label="Currency"
                name="currency"
                value={currency}
                onChange={({ target }) => setCurrency(target.value)}
                options={currencyOptions}
                required
                disabled
              />
            </div> */}

            <FormInputModule
              label="Paid At"
              type="datetime-local"
              placeholder=""
              value={paidAtUtc}
              onChange={(e) => setPaidAtUtc(e.target.value)}
              required
              disabled={recordPaymentLoading}
            />

            <FormInputModule
              label="External Reference (Optional)"
              type="text"
              placeholder="Receipt number or bank reference"
              value={externalReference}
              onChange={(e) => setExternalReference(e.target.value)}
              disabled={recordPaymentLoading}
            />

            <FormTextAreaModule
              label="Narrative (Optional)"
              name="narrative"
              placeholder="Add any notes about this payment..."
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              rows={3}
              disabled={recordPaymentLoading}
            />
          </div>
        </div>

        <div className="flex gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:gap-4 sm:px-6 sm:py-5">
          <ButtonModule
            variant="secondary"
            className="flex w-full text-sm sm:text-base"
            size="md"
            onClick={onRequestClose}
            disabled={recordPaymentLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex w-full text-sm sm:text-base"
            size="md"
            onClick={handleSubmit}
            disabled={recordPaymentLoading}
          >
            {recordPaymentLoading ? "Recording..." : "Record Payment"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default RecordPaymentModal
