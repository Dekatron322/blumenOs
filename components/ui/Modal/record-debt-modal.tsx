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
import { fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import { clearCreateDebtEntryState, createDebtEntry } from "lib/redux/debtManagementSlice"
import { fetchCustomers } from "lib/redux/customerSlice"
import type { Customer, CustomersRequestParams } from "lib/redux/customerSlice"

interface RecordDebtModalProps {
  isOpen: boolean
  onRequestClose: () => void
  customerId: number
  customerName: string
  accountNumber: string
}

const currencyOptions = [{ value: "NGN", label: "NGN - Nigerian Naira" }]

const RecordDebtModal: React.FC<RecordDebtModalProps> = ({
  isOpen,
  onRequestClose,
  customerId,
  customerName,
  accountNumber,
}) => {
  const dispatch = useAppDispatch()
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { createDebtEntryLoading, createDebtEntrySuccess, createDebtEntryError } = useAppSelector(
    (state) => state.debtManagement
  )
  const { customers } = useAppSelector((state) => state.customers)

  const [amount, setAmount] = React.useState("")
  const [paymentTypeId, setPaymentTypeId] = React.useState<number>(1)
  const [reason, setReason] = React.useState("")
  const [effectiveAtUtc, setEffectiveAtUtc] = React.useState<string>(new Date().toISOString().slice(0, 16))
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<number>(customerId || 0)

  React.useEffect(() => {
    if (isOpen) {
      setAmount("")
      setPaymentTypeId(1)
      setReason("")
      setEffectiveAtUtc(new Date().toISOString().slice(0, 16))
      setSelectedCustomerId(customerId || 0)

      if (!paymentTypes || paymentTypes.length === 0) {
        dispatch(fetchPaymentTypes())
      }
      if (!customers || customers.length === 0) {
        const customerParams: CustomersRequestParams = {
          pageNumber: 1,
          pageSize: 1000,
        }
        dispatch(fetchCustomers(customerParams))
      }
      dispatch(clearCreateDebtEntryState())
    }
  }, [isOpen, dispatch, paymentTypes, customers, customerId])

  const paymentTypeOptions = paymentTypes.map((type) => ({ value: type.id.toString(), label: type.name }))
  const customerOptions = customers.map((customer) => ({
    value: customer.id.toString(),
    label: `${customer.fullName} (${customer.accountNumber})`,
  }))

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  React.useEffect(() => {
    if (createDebtEntrySuccess && isOpen) {
      const customerDisplayName = selectedCustomer?.fullName || customerName
      notify("success", "Debt recorded successfully", {
        description: `Debt of ${amount} has been recorded for ${customerDisplayName}`,
        duration: 5000,
      })
      onRequestClose()
      dispatch(clearCreateDebtEntryState())
    }
  }, [createDebtEntrySuccess, isOpen, onRequestClose, dispatch, amount, customerName, selectedCustomer])

  React.useEffect(() => {
    if (createDebtEntryError && isOpen) {
      notify("error", "Failed to record debt", {
        description: createDebtEntryError,
        duration: 6000,
      })
      dispatch(clearCreateDebtEntryState())
    }
  }, [createDebtEntryError, isOpen, dispatch])

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!selectedCustomerId || selectedCustomerId === 0) {
      errors.push("Customer is required")
    }

    const numericAmount = Number(amount)
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      errors.push("Amount must be greater than zero")
    }

    if (!paymentTypeId) {
      errors.push("Payment type is required")
    }

    if (!reason.trim()) {
      errors.push("Reason is required")
    }

    if (!effectiveAtUtc) {
      errors.push("Effective date and time is required")
    } else {
      const effectiveDate = new Date(effectiveAtUtc)
      const now = new Date()
      // Allow future dates for debt entries (e.g., scheduled debts)
      if (effectiveDate.getFullYear() < 2000 || effectiveDate.getFullYear() > 2100) {
        errors.push("Please enter a valid date")
      }
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
      const debtData = {
        customerId: selectedCustomerId,
        amount: numericAmount,
        paymentTypeId,
        reason: reason.trim(),
        effectiveAtUtc: new Date(effectiveAtUtc).toISOString(),
      }

      await dispatch(createDebtEntry(debtData)).unwrap()
    } catch (error: any) {
      if (!String(error || "").includes("Network error")) {
        notify("error", "Failed to record debt", {
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
          <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">Record Debt</h2>
          <button
            onClick={onRequestClose}
            className="flex size-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-8"
            disabled={createDebtEntryLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-4 px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="mb-2 w-full text-center">
              <h3 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">Record Debt Entry</h3>
              <p className="text-xs text-gray-600 sm:text-sm">Select a customer and enter debt details</p>
            </div>

            <p className="text-xs text-gray-500 sm:text-sm">
              Enter the debt details for this customer. This will record a new debt entry in the system.
            </p>

            <FormSelectModule
              label="Customer"
              name="customerId"
              value={selectedCustomerId.toString()}
              onChange={({ target }) => setSelectedCustomerId(Number(target.value))}
              options={customerOptions}
              required
              disabled={createDebtEntryLoading}
            />

            <FormInputModule
              label="Amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={createDebtEntryLoading}
              step="0.01"
              min="0.01"
            />

            <FormSelectModule
              label="Payment Type"
              name="paymentTypeId"
              value={paymentTypeId.toString()}
              onChange={({ target }) => setPaymentTypeId(Number(target.value))}
              options={paymentTypeOptions}
              required
              disabled={createDebtEntryLoading}
            />

            <FormTextAreaModule
              label="Reason"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for this debt entry..."
              required
              disabled={createDebtEntryLoading}
              rows={3}
            />

            <FormInputModule
              label="Effective Date & Time"
              type="datetime-local"
              value={effectiveAtUtc}
              onChange={(e) => setEffectiveAtUtc(e.target.value)}
              required
              disabled={createDebtEntryLoading}
              placeholder={""}
            />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <ButtonModule variant="secondary" size="md" onClick={onRequestClose} disabled={createDebtEntryLoading}>
                Cancel
              </ButtonModule>
              <ButtonModule variant="primary" size="md" onClick={handleSubmit} disabled={createDebtEntryLoading}>
                {createDebtEntryLoading ? "Recording..." : "Record Debt"}
              </ButtonModule>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default RecordDebtModal
