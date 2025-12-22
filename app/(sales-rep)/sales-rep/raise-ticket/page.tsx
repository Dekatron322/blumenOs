"use client"

import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { BillDetails, BillStatus, clearBillLookup, lookupBill } from "lib/redux/agentSlice"
import {
  clearBillingDisputeError,
  clearBillingDisputeState,
  createBillingDispute,
  CreateBillingDisputeRequest,
} from "lib/redux/billingDisputeSlice"

const CollectPaymentBillingDisputePage: React.FC = () => {
  const dispatch = useAppDispatch()

  const { billLookup, billLookupLoading, billLookupError } = useAppSelector((state) => state.agents)
  const { creating, createError, createSuccess, dispute } = useAppSelector((state) => state.billingDispute)

  const [billNumber, setBillNumber] = useState("")
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    dispatch(clearBillLookup())
    dispatch(clearBillingDisputeState())
  }, [dispatch])

  useEffect(() => {
    if (createSuccess && dispute) {
      notify("success", "Billing dispute created successfully")
    }
  }, [createSuccess, dispute])

  const canRaiseDispute = useMemo(() => {
    if (!billLookup) return false
    if (billLookup.status === BillStatus.Cancelled) return false
    return true
  }, [billLookup])

  const handleLookupBill = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!billNumber.trim()) {
      notify("error", "Please enter a bill number/reference")
      return
    }

    dispatch(clearBillingDisputeState())

    try {
      const result = await dispatch(lookupBill(billNumber.trim()))

      if (lookupBill.rejected.match(result)) {
        const message = (result.payload as string) || "Failed to lookup bill"
        notify("error", message)
      } else {
        notify("success", "Bill found. You can now raise a dispute if needed.")
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to lookup bill")
    }
  }

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!billLookup) {
      notify("error", "Lookup a bill first before creating a dispute")
      return
    }

    if (!reason.trim()) {
      notify("error", "Please provide a reason for the dispute")
      return
    }

    const readFileAsDataUrl = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
    }

    let fileUrls: string[] = []

    if (files.length > 0) {
      try {
        fileUrls = await Promise.all(files.map((file) => readFileAsDataUrl(file)))
      } catch (error) {
        notify("error", "Failed to read one or more files. Please try again.")
        return
      }
    }

    const payload: CreateBillingDisputeRequest = {
      billId: billLookup.id,
      reason: reason.trim(),
      details: details.trim(),
      fileUrls,
    }

    dispatch(clearBillingDisputeError())

    try {
      const result = await dispatch(createBillingDispute(payload))

      if (createBillingDispute.rejected.match(result)) {
        const message = (result.payload as string) || "Failed to create billing dispute"
        notify("error", message)
      } else {
        setReason("")
        setDetails("")
        setFiles([])
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to create billing dispute")
    }
  }

  const renderBillStatus = (bill?: BillDetails | null) => {
    if (!bill) return null

    const statusMap: Record<number, { label: string; color: string; bg: string }> = {
      [BillStatus.Generated]: { label: "Generated", color: "text-gray-700", bg: "bg-gray-100" },
      [BillStatus.Issued]: { label: "Issued", color: "text-blue-700", bg: "bg-blue-100" },
      [BillStatus.Paid]: { label: "Paid", color: "text-emerald-700", bg: "bg-emerald-100" },
      [BillStatus.PartiallyPaid]: { label: "Partially Paid", color: "text-amber-700", bg: "bg-amber-100" },
      [BillStatus.Overdue]: { label: "Overdue", color: "text-red-700", bg: "bg-red-100" },
      [BillStatus.Cancelled]: { label: "Cancelled", color: "text-gray-600", bg: "bg-gray-100" },
      [BillStatus.Disputed]: { label: "Disputed", color: "text-purple-700", bg: "bg-purple-100" },
    }

    const config = statusMap[bill.status] || statusMap[BillStatus.Generated]
    if (!config) return null

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-xs ${config.bg} ${config.color}`}
      >
        <span className="size-2 rounded-full bg-white" />
        {config.label}
      </span>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 lg:container sm:px-4 xl:px-16">
            <div className="flex w-full flex-col justify-between gap-4 py-4 sm:py-6 md:flex-row md:items-center md:gap-6">
              <div>
                <h4 className="text-xl font-semibold sm:text-2xl">Raise Billing Dispute</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  Look up a customer bill first. If there is an issue with the bill, you can raise a dispute.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-6 lg:flex-row">
              <div className="w-full lg:max-w-xl">
                <motion.div
                  className="rounded-md border bg-white p-5 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h5 className="mb-3 text-base font-semibold text-gray-800">Bill Lookup</h5>

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
                          }}
                          disabled={billLookupLoading}
                        >
                          Clear
                        </ButtonModule>
                      )}
                    </div>
                  </form>
                </motion.div>
              </div>

              <div className="w-full">
                <motion.div
                  className="rounded-md border bg-white p-5 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h5 className="mb-3 text-base font-semibold text-gray-800">Bill Details</h5>

                  {!billLookup && !billLookupLoading && (
                    <p className="text-sm text-gray-500">
                      No bill selected yet. Use the lookup form to find a customer bill by number or reference.
                    </p>
                  )}

                  {billLookupLoading && <p className="text-sm text-gray-500">Searching for bill...</p>}

                  {billLookup && (
                    <div className="space-y-4">
                      <div className="rounded-md border border-dashed border-[#004b23] bg-[#004b23]/5 p-4 text-sm">
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Customer:</span>
                          <span className="text-[#002e16]">{billLookup.customerName}</span>
                        </div>
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Account Number:</span>
                          <span className="text-[#002e16]">{billLookup.customerAccountNumber}</span>
                        </div>
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Bill Name:</span>
                          <span className="text-[#002e16]">{billLookup.name}</span>
                        </div>
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Period:</span>
                          <span className="text-[#002e16]">{billLookup.period}</span>
                        </div>
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Total Due:</span>
                          <span className="text-[#002e16]">{billLookup.totalDue}</span>
                        </div>
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Status:</span>
                          <span className="text-[#002e16]">{renderBillStatus(billLookup)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-[#004b23]">Area Office:</span>
                          <span className="text-[#002e16]">{billLookup.areaOfficeName}</span>
                        </div>
                      </div>

                      <div className="rounded-md border bg-white p-4 text-sm">
                        <h6 className="mb-2 text-sm font-semibold text-gray-800">Raise Billing Dispute</h6>

                        {!canRaiseDispute && (
                          <p className="mb-2 text-xs text-red-500">
                            This bill cannot accept new disputes (e.g. it may be cancelled).
                          </p>
                        )}

                        {createError && <p className="mb-2 text-xs text-red-500">{createError}</p>}

                        {createSuccess && dispute && (
                          <p className="mb-2 text-xs text-emerald-600">
                            Dispute created with ID: {dispute.id}. You can track it from the back office.
                          </p>
                        )}

                        <form onSubmit={handleCreateDispute} className="space-y-3">
                          <FormInputModule
                            label="Reason"
                            type="text"
                            name="reason"
                            placeholder="Short title for the dispute (e.g. Wrong amount, Already paid, etc.)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                          />

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700" htmlFor="disputeDetails">
                              Details
                            </label>
                            <textarea
                              id="disputeDetails"
                              className="min-h-[96px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#004b23] focus:outline-none focus:ring-1 focus:ring-[#004b23]"
                              placeholder="Provide more information about what is wrong with this bill."
                              value={details}
                              onChange={(e) => setDetails(e.target.value)}
                            />
                            <p className="text-[0.68rem] text-gray-500">
                              Be as specific as possible to help the back office team resolve the dispute quickly.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700" htmlFor="disputeFiles">
                              Attach Files (optional)
                            </label>

                            <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-center transition hover:border-[#004b23]/60 hover:bg-[#004b23]/5">
                              <input
                                id="disputeFiles"
                                type="file"
                                multiple
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                onChange={(e) => {
                                  const selectedFiles = Array.from(e.target.files || [])
                                  setFiles(selectedFiles)
                                }}
                              />

                              <div className="pointer-events-none flex flex-col items-center gap-1">
                                <div className="flex size-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 group-hover:ring-[#004b23]/70">
                                  <svg
                                    className="size-4 text-gray-500 group-hover:text-[#004b23]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 8l-4-4m0 0L8 8m4-4v12"
                                    />
                                  </svg>
                                </div>
                                <p className="text-xs font-medium text-gray-800 group-hover:text-[#004b23]">
                                  Click to browse or drag files here
                                </p>
                                <p className="text-[0.68rem] text-gray-500">
                                  Images, PDFs and other supporting documents
                                </p>
                              </div>
                            </div>

                            {files.length > 0 && (
                              <div className="space-y-1 rounded-md border border-gray-100 bg-gray-50 p-2">
                                <p className="text-[0.68rem] font-medium text-gray-700">
                                  Selected files ({files.length})
                                </p>
                                <ul className="max-h-24 space-y-1 overflow-y-auto text-[0.68rem] text-gray-600">
                                  {files.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between gap-2">
                                      <span className="truncate">{file.name}</span>
                                      <span className="shrink-0 text-[0.6rem] text-gray-400">
                                        {(file.size / 1024).toFixed(1)} KB
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            <ButtonModule
                              type="submit"
                              variant="primary"
                              className="w-full sm:w-auto"
                              disabled={creating || !canRaiseDispute}
                            >
                              {creating ? "Submitting dispute..." : "Submit Billing Dispute"}
                            </ButtonModule>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CollectPaymentBillingDisputePage
