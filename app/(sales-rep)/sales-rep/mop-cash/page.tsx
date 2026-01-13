"use client"

import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { createCashRemittanceRecord, CreateCashRemittanceRequest } from "lib/redux/cashRemittanceSlice"
import { fetchAgentInfo } from "lib/redux/agentSlice"
import { fetchBankLists } from "lib/redux/paymentSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"

const MopCashPage = () => {
  const dispatch = useAppDispatch()
  const { addRecordLoading, addRecordError, addRecordSuccess } = useAppSelector((state) => state.cashRemittance)
  const { agentInfo, agentInfoLoading, agentInfoError } = useAppSelector((state) => state.agents)
  const { bankLists, bankListsLoading, bankListsError } = useAppSelector((state) => state.payments)

  const [form, setForm] = useState<CreateCashRemittanceRequest>({
    amount: 0,
    startDateUtc: "",
    endDateUtc: "",
    bankName: "",
    tellerNumber: "",
    notes: "",
    depositedAtUtc: "",
  })

  const [errors, setErrors] = useState<{
    amount?: string
    startDateUtc?: string
    endDateUtc?: string
    depositedAtUtc?: string
    bankName?: string
    tellerNumber?: string
    notes?: string
  }>({})

  // Format amount for display with commas
  const formatAmount = (value: number): string => {
    if (!value || isNaN(value)) return ""
    return value.toLocaleString("en-NG")
  }

  // Parse formatted amount back to number
  const parseAmount = (formattedValue: string): number => {
    const cleanValue = formattedValue.replace(/,/g, "")
    const parsed = parseFloat(cleanValue)
    return isNaN(parsed) ? 0 : parsed
  }

  // Fetch current agent info and bank lists
  useEffect(() => {
    dispatch(fetchAgentInfo())
    dispatch(fetchBankLists())
  }, [dispatch])

  useEffect(() => {
    if (addRecordSuccess) {
      notify("success", "Cash remittance recorded successfully", {
        description: "Your cash remittance has been recorded.",
      })
      // Reset form after successful submission
      setForm({
        amount: 0,
        startDateUtc: "",
        endDateUtc: "",
        bankName: "",
        tellerNumber: "",
        notes: "",
        depositedAtUtc: "",
      })
      // Refresh agent info after successful remittance
      dispatch(fetchAgentInfo())
    }

    if (addRecordError) {
      notify("error", addRecordError)
    }
  }, [addRecordSuccess, addRecordError, dispatch])

  // Handle agent info and bank lists errors
  useEffect(() => {
    if (agentInfoError) {
      notify("error", "Failed to fetch agent info", {
        description: agentInfoError,
      })
    }
    if (bankListsError) {
      notify("error", "Failed to fetch bank lists", {
        description: bankListsError,
      })
    }
  }, [agentInfoError, bankListsError])

  const handleChange = (field: keyof CreateCashRemittanceRequest, value: string) => {
    if (field === "amount") {
      // Handle amount formatting
      const numericValue = parseAmount(value)
      setForm((prev) => ({
        ...prev,
        [field]: numericValue,
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!form.amount || form.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }

    if (!form.startDateUtc) {
      newErrors.startDateUtc = "Transaction start window is required"
    }

    if (!form.endDateUtc) {
      newErrors.endDateUtc = "Transaction end window is required"
    }

    if (!form.depositedAtUtc) {
      newErrors.depositedAtUtc = "Deposit date is required"
    }

    if (!form.bankName.trim()) {
      newErrors.bankName = "Bank name is required"
    }

    if (!form.tellerNumber.trim()) {
      newErrors.tellerNumber = "Teller number is required"
    }

    if (!form.notes.trim()) {
      newErrors.notes = "Notes are required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    await dispatch(createCashRemittanceRecord(form))
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-1 items-center justify-center px-4 py-8 2xl:container">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-sm">
              <h1 className="text-xl font-semibold text-gray-900">Record Cash Remittance</h1>
              <p className="mt-1 text-sm text-gray-600">
                Use this form to record your cash remittance to the bank. Enter the exact amount being remitted and
                provide all required details.
              </p>

              <div className="mt-3 rounded-md bg-blue-50 p-3 text-xs text-blue-900">
                <p className="font-medium">Instructions:</p>
                <ol className="mt-1 list-decimal space-y-1 pl-5">
                  <li>
                    Enter the <span className="font-semibold">Amount</span> being remitted to the bank.
                  </li>
                  <li>
                    Provide the <span className="font-semibold">Bank Name</span> where the cash was deposited.
                  </li>
                  <li>
                    Enter the <span className="font-semibold">Teller Number</span> from the deposit receipt.
                  </li>
                  <li>
                    Set the <span className="font-semibold">Transaction Start Date</span> and{" "}
                    <span className="font-semibold">End Date </span>
                    to define the period for which this cash was remitted (beginning to end of the day).
                  </li>
                  <li>
                    Enter the <span className="font-semibold">Date Deposited</span> when the cash was actually deposited
                    in the bank.
                  </li>
                  <li>
                    In <span className="font-semibold">Notes</span>, include sufficient details (e.g. reference number,
                    payment channel, or any special instructions) so this remittance can be audited later.
                  </li>
                  <li>Review all values carefully before submitting; records cannot easily be reversed.</li>
                </ol>
              </div>

              {agentInfo && (
                <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                  <p className="font-medium">
                    Current Cash at Hand: ₦
                    {agentInfoLoading ? (
                      <span className="text-gray-500">Loading...</span>
                    ) : (
                      agentInfo.cashAtHand.toLocaleString()
                    )}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInputModule
                    label="Amount"
                    type="text"
                    name="amount"
                    value={`₦${formatAmount(form.amount)}`}
                    onChange={(e) => {
                      // Remove ₦ symbol and commas, then handle the change
                      const cleanValue = e.target.value.replace(/[₦,]/g, "")
                      handleChange("amount", cleanValue)
                    }}
                    error={errors.amount}
                    placeholder="₦0"
                  />
                  <FormSelectModule
                    label="Bank Name"
                    name="bankName"
                    value={form.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    options={bankLists.map((bank) => ({ value: bank.name, label: bank.name }))}
                    error={errors.bankName}
                    disabled={bankListsLoading}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormInputModule
                    label="Transaction Start Window"
                    type="date"
                    name="startDateUtc"
                    value={form.startDateUtc}
                    onChange={(e) => handleChange("startDateUtc", e.target.value)}
                    error={errors.startDateUtc}
                    placeholder={""}
                  />
                  <FormInputModule
                    label="Transaction End Window"
                    type="date"
                    name="endDateUtc"
                    value={form.endDateUtc}
                    onChange={(e) => handleChange("endDateUtc", e.target.value)}
                    error={errors.endDateUtc}
                    placeholder={""}
                  />
                  <FormInputModule
                    label="Date Deposited"
                    type="date"
                    name="depositedAtUtc"
                    value={form.depositedAtUtc}
                    onChange={(e) => handleChange("depositedAtUtc", e.target.value)}
                    error={errors.depositedAtUtc}
                    placeholder={""}
                  />
                </div>

                <div className="grid gap-4">
                  <FormInputModule
                    label="Teller Number"
                    type="text"
                    name="tellerNumber"
                    value={form.tellerNumber}
                    onChange={(e) => handleChange("tellerNumber", e.target.value)}
                    error={errors.tellerNumber}
                    placeholder="Enter teller number from receipt"
                  />
                </div>

                <div className="grid gap-4">
                  <FormTextAreaModule
                    label="Notes"
                    name="notes"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    error={errors.notes}
                    placeholder="Enter details about this remittance (e.g. deposit date, reference, etc.)"
                    rows={4}
                  />
                </div>

                <div className="pt-4">
                  <ButtonModule type="submit" variant="primary" size="md" disabled={addRecordLoading}>
                    {addRecordLoading ? "Recording Remittance..." : "Record Cash Remittance"}
                  </ButtonModule>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MopCashPage
