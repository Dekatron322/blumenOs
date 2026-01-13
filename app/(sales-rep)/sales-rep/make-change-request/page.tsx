"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearChangeRequestsByCustomer,
  clearCustomerLookup,
  fetchChangeRequestsByCustomerId,
  lookupCustomer,
} from "lib/redux/customerSlice"
import CustomerChangeRequestModal from "components/ui/Modal/customer-change-request-modal"
import ViewCustomerChangeRequestModal from "components/ui/Modal/view-customer-change-request-modal"

const MakeCustomerChangeRequestPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    customerLookup,
    customerLookupLoading,
    customerLookupError,
    changeRequestsByCustomer,
    changeRequestsByCustomerLoading,
    changeRequestsByCustomerError,
  } = useAppSelector((state) => state.customers)

  const [reference, setReference] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Always use postpaid lookup for now, matching existing usage
  const lookupType = "postpaid"

  // Match status color coding used in change-requests-tab
  const getStatusConfig = (status: number) => {
    const configs = {
      0: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
      1: { label: "Approved", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
      2: { label: "Declined", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
      3: { label: "Cancelled", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
      4: { label: "Applied", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
      5: { label: "Failed", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  useEffect(() => {
    // Clear any previous lookup / change-requests state when the page mounts
    dispatch(clearCustomerLookup())
    dispatch(clearChangeRequestsByCustomer())
  }, [dispatch])

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reference.trim()) {
      notify("error", "Please enter a customer reference (e.g. account number)")
      return
    }

    try {
      const result = await dispatch(
        lookupCustomer({
          reference: reference.trim(),
          type: lookupType,
        })
      )

      if (lookupCustomer.rejected.match(result)) {
        const errorMessage = (result.payload as string) || "Failed to lookup customer"
        notify("error", errorMessage)
      } else {
        notify("success", "Customer found. You can now submit a change request.")

        const customer = (result as any).payload
        if (customer && typeof customer.id === "number") {
          // Fetch past change requests for this customer (first page, small page size for quick view)
          dispatch(
            fetchChangeRequestsByCustomerId({
              id: customer.id,
              params: {
                pageNumber: 1,
                pageSize: 5,
              },
            })
          )
        }
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to lookup customer")
    }
  }

  const handleOpenChangeRequest = () => {
    if (!customerLookup) {
      notify("error", "Lookup a customer first before making a change request")
      return
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleOpenChangeRequestDetails = (publicId: string) => {
    setSelectedChangeRequestId(publicId)
    setIsViewModalOpen(true)
  }

  const handleCloseChangeRequestDetails = () => {
    setIsViewModalOpen(false)
    setSelectedChangeRequestId(null)
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 2xl:container sm:px-4 lg:px-6 2xl:px-16">
            {/* Page Header */}
            <div className="flex w-full flex-col justify-between gap-4 py-4 sm:py-6 md:flex-row md:items-center md:gap-6">
              <div>
                <h4 className="text-xl font-semibold sm:text-2xl">Customer Change Request</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  Look up a customer first, then submit a change request on their account.
                </p>
              </div>
            </div>

            {/* Lookup and Result Area */}
            <div className="flex w-full flex-col gap-6 lg:flex-row">
              <div className="w-full lg:max-w-xl">
                <motion.div
                  className="rounded-md border bg-white p-5 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h5 className="mb-3 text-base font-semibold text-gray-800">Customer Lookup</h5>

                  <form onSubmit={handleLookup} className="space-y-4">
                    <FormInputModule
                      label="Customer Account Number"
                      type="text"
                      name="customerReference"
                      placeholder="Enter account account number"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      required
                    />

                    <p className="text-xs text-gray-500">
                      This uses the ({""}
                      <code className="rounded bg-gray-100 px-1 text-[0.7rem]">customer account number</code>) to
                      validate the customer before creating a change request.
                    </p>

                    {customerLookupError && <p className="text-sm text-red-500">{customerLookupError}</p>}

                    <div className="mt-4 flex gap-3">
                      <ButtonModule
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto"
                        disabled={customerLookupLoading}
                      >
                        {customerLookupLoading ? "Looking up..." : "Lookup Customer"}
                      </ButtonModule>

                      {customerLookup && (
                        <ButtonModule
                          type="button"
                          variant="secondary"
                          className="w-full sm:w-auto"
                          onClick={() => dispatch(clearCustomerLookup())}
                          disabled={customerLookupLoading}
                        >
                          Clear
                        </ButtonModule>
                      )}
                    </div>
                  </form>
                </motion.div>
              </div>

              {/* Customer Summary and Change Request */}
              <div className="w-full">
                <motion.div
                  className="rounded-md border bg-white p-5 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h5 className="mb-3 text-base font-semibold text-gray-800">Customer Details</h5>

                  {!customerLookup && !customerLookupLoading && (
                    <p className="text-sm text-gray-500">
                      No customer selected yet. Use the lookup form to find a customer by reference.
                    </p>
                  )}

                  {customerLookupLoading && <p className="text-sm text-gray-500">Searching for customer...</p>}

                  {customerLookup && (
                    <div className="space-y-4">
                      <div className="rounded-md border border-dashed border-[#004b23] bg-[#004b23]/5 p-4 text-sm">
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Name:</span>
                          <span className="text-[#002e16]">{customerLookup.fullName}</span>
                        </div>
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Account Number:</span>
                          <span className="text-[#002e16]">{customerLookup.accountNumber}</span>
                        </div>
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Status:</span>
                          <span className="text-[#002e16]">{customerLookup.status}</span>
                        </div>
                        {/* <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Tariff:</span>
                          <span className="text-[#002e16]">{customerLookup.tariffCode}</span>
                        </div> */}
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Feeder:</span>
                          <span className="text-[#002e16]">{customerLookup.feederName}</span>
                        </div>
                        <div className="mb-2 flex justify-between">
                          <span className="font-medium text-[#004b23]">Area Office:</span>
                          <span className="text-[#002e16]">{customerLookup.areaOfficeName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-[#004b23]">Service Centre:</span>
                          <span className="text-[#002e16]">{customerLookup.serviceCenterName}</span>
                        </div>
                      </div>

                      <ButtonModule
                        type="button"
                        variant="primary"
                        className="w-full sm:w-auto"
                        onClick={handleOpenChangeRequest}
                      >
                        Make Change Request
                      </ButtonModule>

                      {/* Past Change Requests */}
                      <div className="mt-4 rounded-md border bg-white p-4 text-sm">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-semibold text-gray-800">Past Change Requests</span>
                          {changeRequestsByCustomerLoading && <span className="text-xs text-gray-500">Loading...</span>}
                        </div>

                        {changeRequestsByCustomerError && (
                          <p className="text-xs text-red-500">{changeRequestsByCustomerError}</p>
                        )}

                        {!changeRequestsByCustomerLoading &&
                          !changeRequestsByCustomerError &&
                          changeRequestsByCustomer.length === 0 && (
                            <p className="text-xs text-gray-500">
                              No previous change requests found for this customer.
                            </p>
                          )}

                        {changeRequestsByCustomer.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {changeRequestsByCustomer.slice(0, 5).map((cr) => (
                              <div
                                key={cr.id}
                                className="flex w-full items-center justify-between gap-3 rounded border border-gray-100 bg-gray-50 px-3 py-2 text-left"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleOpenChangeRequestDetails(cr.publicId)}
                                  className="flex-1 text-left"
                                >
                                  <div className="space-y-1">
                                    <div className="text-xs font-medium text-gray-800">Ref: {cr.reference}</div>
                                    <div className="text-[0.7rem] text-gray-500">
                                      Requested: {new Date(cr.requestedAtUtc).toLocaleString()}
                                    </div>
                                  </div>
                                </button>

                                <div className="flex items-end gap-2">
                                  {(() => {
                                    const statusConfig = getStatusConfig(cr.status)
                                    return (
                                      <span
                                        className={`flex items-center gap-1 rounded-full px-2 py-[2px] text-[0.7rem] ${statusConfig.bg} ${statusConfig.color}`}
                                      >
                                        <span
                                          className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}
                                        ></span>
                                        {statusConfig.label}
                                      </span>
                                    )
                                  })()}

                                  <ButtonModule
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenChangeRequestDetails(cr.publicId)}
                                  >
                                    View details
                                  </ButtonModule>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {customerLookup && (
        <CustomerChangeRequestModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          customerId={customerLookup.id}
          customerName={customerLookup.fullName}
          customerAccountNumber={customerLookup.accountNumber}
          onSuccess={() => {
            dispatch(
              fetchChangeRequestsByCustomerId({
                id: customerLookup.id,
                params: {
                  pageNumber: 1,
                  pageSize: 5,
                },
              })
            )
          }}
        />
      )}

      {selectedChangeRequestId && (
        <ViewCustomerChangeRequestModal
          isOpen={isViewModalOpen}
          onRequestClose={handleCloseChangeRequestDetails}
          changeRequestId={selectedChangeRequestId}
        />
      )}
    </section>
  )
}

export default MakeCustomerChangeRequestPage
