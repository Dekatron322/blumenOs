"use client"

import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCash, ClearCashRequest, clearCashStatus, fetchAgents } from "lib/redux/agentSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { ArrowLeft } from "lucide-react"

const ClearCashPage = () => {
  const dispatch = useAppDispatch()
  const { clearCashLoading, clearCashError, clearCashSuccess, agents } = useAppSelector((state) => state.agents)

  const [selectedAgentId, setSelectedAgentId] = useState<number>(0)

  const [form, setForm] = useState<ClearCashRequest>({
    collectionOfficerUserId: 0,
    amount: 0,
    notes: "",
  })

  const [errors, setErrors] = useState<{
    collectionOfficerUserId?: string
    amount?: string
    notes?: string
    agentId?: string
  }>({})

  // Fetch a list of agents for selection
  useEffect(() => {
    dispatch(
      fetchAgents({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (clearCashSuccess) {
      notify("success", "Cash cleared successfully", {
        description: "The agent's cash at hand has been updated.",
      })
    }

    if (clearCashError) {
      notify("error", clearCashError)
    }
  }, [clearCashSuccess, clearCashError])

  useEffect(() => {
    return () => {
      dispatch(clearCashStatus())
    }
  }, [dispatch])

  const handleChange = (field: keyof ClearCashRequest, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "collectionOfficerUserId" || field === "amount" ? Number(value) : value,
    }))

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!selectedAgentId || selectedAgentId <= 0) {
      newErrors.agentId = "Please select an agent for this clearance"
    }

    if (!form.collectionOfficerUserId || form.collectionOfficerUserId <= 0) {
      newErrors.collectionOfficerUserId = "Please enter a valid collection officer user ID"
    }

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

    await dispatch(
      clearCash({
        id: selectedAgentId,
        clearCashData: form,
      })
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-1 items-center justify-center px-4 py-8 2xl:container">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                <ArrowLeft className="size-4" />
                <span>Back to Agent Management</span>
              </div>

              <h1 className="text-xl font-semibold text-gray-900">Clear Cash for Sales Reps</h1>
              <p className="mt-1 text-sm text-gray-600">
                Use this form to record a cash clearance for an sales rep. Select the correct sales rep, enter the exact
                amount being cleared, and provide a clear description of the transaction.
              </p>

              <div className="mt-3 rounded-md bg-blue-50 p-3 text-xs text-blue-900">
                <p className="font-medium">Instructions:</p>
                <ol className="mt-1 list-decimal space-y-1 pl-5">
                  <li>
                    Select the <span className="font-semibold">Sales Rep</span> whose cash you are clearing.
                  </li>
                  <li>
                    Enter the <span className="font-semibold">Amount</span> being cleared. This should match the cash
                    physically received or reconciled for this sales rep.
                  </li>
                  <li>
                    In <span className="font-semibold">Notes</span>, include sufficient details (e.g. reference number,
                    date range, payment channel, or any special instructions) so this clearance can be audited later.
                  </li>
                  <li>Review all values carefully before submitting; clearances cannot easily be reversed.</li>
                </ol>
              </div>

              {errors.agentId && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{errors.agentId}</div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormSelectModule
                    label="Select Sales Rep"
                    name="agentId"
                    value={selectedAgentId}
                    onChange={(e) => {
                      const { value } = "target" in e ? e.target : { value: e }
                      const numericValue = Number(value)
                      setSelectedAgentId(numericValue)

                      // Automatically set collectionOfficerUserId based on selected agent
                      if (numericValue > 0) {
                        const selectedAgent = agents.find((agent) => agent.id === numericValue)
                        if (selectedAgent?.user?.id) {
                          setForm((prev) => ({
                            ...prev,
                            collectionOfficerUserId: selectedAgent.user.id,
                          }))
                        }
                      } else {
                        setForm((prev) => ({
                          ...prev,
                          collectionOfficerUserId: 0,
                        }))
                      }

                      if (errors.agentId) {
                        setErrors((prev) => ({
                          ...prev,
                          agentId: undefined,
                        }))
                      }
                    }}
                    options={[
                      { value: 0, label: "Select Sales Rep" },
                      ...agents.map((agent) => ({
                        value: agent.id,
                        label: `${agent.user.fullName} `,
                      })),
                    ]}
                    error={errors.agentId}
                  />
                  <FormInputModule
                    label="Amount"
                    type="number"
                    name="amount"
                    value={form.amount || ""}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    error={errors.amount}
                    placeholder={""}
                  />

                  {/* <FormInputModule
                    label="Collection Officer User ID"
                    type="number"
                    name="collectionOfficerUserId"
                    value={form.collectionOfficerUserId || ""}
                    onChange={(e) => handleChange("collectionOfficerUserId", e.target.value)}
                    error={errors.collectionOfficerUserId}
                    placeholder={""}
                  /> */}
                </div>

                <div className="grid gap-4 ">
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
                  <ButtonModule
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={clearCashLoading || !!errors.agentId}
                  >
                    {clearCashLoading ? "Clearing Cash..." : "Clear Cash"}
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
