"use client"

import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { agentClearCash, AgentClearCashRequest, fetchAgentInfo } from "lib/redux/agentSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { ArrowLeft } from "lucide-react"

const ClearCashPage = () => {
  const dispatch = useAppDispatch()
  const { agentClearCashLoading, agentClearCashError, agentClearCashSuccess, agentInfo } = useAppSelector(
    (state) => state.agents
  )

  const [form, setForm] = useState<AgentClearCashRequest>({
    amount: 0,
    notes: "",
  })

  const [errors, setErrors] = useState<{
    amount?: string
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

  // Fetch current agent info
  useEffect(() => {
    dispatch(fetchAgentInfo())
  }, [dispatch])

  useEffect(() => {
    if (agentClearCashSuccess) {
      notify("success", "Cash cleared successfully", {
        description: "Your cash at hand has been updated.",
      })
      // Reset form after successful clearance
      setForm({
        amount: 0,
        notes: "",
      })
    }

    if (agentClearCashError) {
      notify("error", agentClearCashError)
    }
  }, [agentClearCashSuccess, agentClearCashError])

  const handleChange = (field: keyof AgentClearCashRequest, value: string) => {
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

    if (!form.notes.trim()) {
      newErrors.notes = "Notes are required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    await dispatch(agentClearCash(form))
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-1 items-center justify-center px-4 py-8 2xl:container">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-sm">
              <h1 className="text-xl font-semibold text-gray-900">Clear Your Cash</h1>
              <p className="mt-1 text-sm text-gray-600">
                Use this form to record your cash clearance. Enter the exact amount being cleared and provide a clear
                description of the transaction.
              </p>

              <div className="mt-3 rounded-md bg-blue-50 p-3 text-xs text-blue-900">
                <p className="font-medium">Instructions:</p>
                <ol className="mt-1 list-decimal space-y-1 pl-5">
                  <li>
                    Enter the <span className="font-semibold">Amount</span> being cleared. This should match the cash
                    physically received or reconciled.
                  </li>
                  <li>
                    In <span className="font-semibold">Notes</span>, include sufficient details (e.g. reference number,
                    date range, payment channel, or any special instructions) so this clearance can be audited later.
                  </li>
                  <li>Review all values carefully before submitting; clearances cannot easily be reversed.</li>
                </ol>
              </div>

              {agentInfo && (
                <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                  <p className="font-medium">Current Cash at Hand: ₦{agentInfo.cashAtHand.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Cash Collection Limit: ₦{agentInfo.cashCollectionLimit.toLocaleString()}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-1">
                  <div>
                    <label className="mb-1 block text-sm text-[#2a2f4b]">Amount</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="amount"
                        value={`₦${formatAmount(form.amount)}`}
                        onChange={(e) => {
                          // Remove ₦ symbol and commas, then handle the change
                          const cleanValue = e.target.value.replace(/[₦,]/g, "")
                          handleChange("amount", cleanValue)
                        }}
                        placeholder="₦0"
                        className={`
                          h-[46px] w-full rounded-md border px-3 py-2 text-base outline-none transition-all duration-200
                          ${
                            errors.amount
                              ? "border-[#D14343] bg-[#FBFAFC] ring-2 ring-[#D14343]"
                              : "border-[#E0E0E0] bg-[#F9F9F9]"
                          }
                          pr-20 focus:border-transparent focus:bg-[#FBFAFC] focus:ring-2
                          focus:ring-[#004B23]
                        `}
                      />
                      {agentInfo && (
                        <button
                          type="button"
                          onClick={() => handleChange("amount", agentInfo.cashAtHand.toString())}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Max
                        </button>
                      )}
                    </div>
                    {errors.amount && <p className="mt-1 text-xs text-[#D14343]">{errors.amount}</p>}
                  </div>
                </div>

                <div className="grid gap-4">
                  <FormTextAreaModule
                    label="Notes"
                    name="notes"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    error={errors.notes}
                    placeholder="Enter details about this clearance (e.g. reason, reference, etc.)"
                    rows={4}
                  />
                </div>

                <div className="pt-4">
                  <ButtonModule type="submit" variant="primary" size="md" disabled={agentClearCashLoading}>
                    {agentClearCashLoading ? "Clearing Cash..." : "Clear Cash"}
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

export default ClearCashPage
