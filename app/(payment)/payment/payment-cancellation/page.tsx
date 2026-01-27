"use client"

import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  cancelPayment,
  cancelPaymentByReference,
  CancelPaymentRequest,
  checkPayment,
  clearCancelPayment,
  clearCancelPaymentByReference,
  clearCheckPayment,
} from "lib/redux/paymentSlice"
import { clearCustomerLookup, lookupCustomer } from "lib/redux/agentSlice"
import { clearPayments, fetchPayments } from "lib/redux/paymentSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import CancelPaymentSuccessModal from "components/ui/Modal/cancel-payment-success-modal"
import { ArrowLeft, FileText, RefreshCw, Zap } from "lucide-react"

const PaymentCancellationPage = () => {
  const dispatch = useAppDispatch()
  const {
    cancelPaymentLoading,
    cancelPaymentError,
    cancelPaymentSuccess,
    cancelPaymentData,
    cancelPaymentByReferenceLoading,
    cancelPaymentByReferenceError,
    cancelPaymentByReferenceSuccess,
    cancelPaymentByReferenceData,
    checkPaymentLoading,
    checkPaymentError,
    checkPaymentSuccess,
    checkPaymentData,
  } = useAppSelector((state) => state.payments)
  const { customerLookupLoading, customerLookup, customerLookupError, customerLookupSuccess } = useAppSelector(
    (state) => state.agents
  )
  const { payments, loading, pagination } = useAppSelector((state) => state.payments)

  const [form, setForm] = useState<CancelPaymentRequest>({
    reason: "",
  })

  const [activeTab, setActiveTab] = useState<"reference" | "meter">("reference")
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentId, setPaymentId] = useState<number | null>(null)
  const [meterNumber, setMeterNumber] = useState("")
  const [customerData, setCustomerData] = useState<{
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
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showTransactionSelection, setShowTransactionSelection] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [errors, setErrors] = useState<{
    reference?: string
    meterNumber?: string
    reason?: string
    selectedTransaction?: string
  }>({})

  useEffect(() => {
    if (cancelPaymentSuccess && cancelPaymentData) {
      setShowSuccessModal(true)
      notify("success", "Payment cancelled successfully", {
        description: "The payment has been cancelled successfully.",
      })
    }

    if (cancelPaymentByReferenceSuccess && cancelPaymentByReferenceData) {
      setShowSuccessModal(true)
      notify("success", "Payment cancelled successfully", {
        description: "The payment has been cancelled successfully.",
      })
    }

    if (cancelPaymentError) {
      notify("error", cancelPaymentError)
    }

    if (cancelPaymentByReferenceError) {
      notify("error", cancelPaymentByReferenceError)
    }
  }, [
    cancelPaymentSuccess,
    cancelPaymentError,
    cancelPaymentData,
    cancelPaymentByReferenceSuccess,
    cancelPaymentByReferenceError,
    cancelPaymentByReferenceData,
  ])

  useEffect(() => {
    if (checkPaymentSuccess && checkPaymentData) {
      setPaymentId(checkPaymentData.id)
      notify("success", "Payment found", {
        description: `Payment found: ${checkPaymentData.reference}`,
        duration: 3000,
      })
    }

    if (checkPaymentError) {
      notify("error", checkPaymentError || "Payment not found", {
        duration: 6000,
      })
    }
  }, [checkPaymentSuccess, checkPaymentError, checkPaymentData])

  useEffect(() => {
    if (customerLookupSuccess && customerLookup) {
      setCustomerData({
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

      setShowTransactionSelection(true)
      setCurrentPage(1)
      setSearchTerm("")
      setSearchQuery("")

      // Fetch customer transactions
      dispatch(
        fetchPayments({
          pageNumber: 1,
          pageSize: pageSize,
          customerId: customerLookup.id,
          search: searchQuery.trim() || undefined,
        })
      )

      notify("success", "Customer validated successfully", {
        description: `Customer found: ${customerLookup.fullName}`,
        duration: 3000,
      })
    }
  }, [customerLookupSuccess, customerLookup, dispatch, pageSize])

  useEffect(() => {
    if (customerLookupError) {
      notify("error", customerLookupError || "Failed to validate customer", {
        duration: 6000,
      })
    }
  }, [customerLookupError])

  useEffect(() => {
    return () => {
      dispatch(clearCancelPayment())
      dispatch(clearCancelPaymentByReference())
      dispatch(clearCheckPayment())
      dispatch(clearCustomerLookup())
      dispatch(clearPayments())
    }
  }, [dispatch])

  const handleChange = (field: "reference" | "reason" | "meterNumber", value: string) => {
    if (field === "reference") {
      setPaymentReference(value)
      setPaymentId(null) // Reset payment ID when reference changes
      dispatch(clearCheckPayment()) // Clear previous check payment results
    } else if (field === "meterNumber") {
      setMeterNumber(value)
    } else {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const validate = () => {
    const newErrors: typeof errors = {}

    if (activeTab === "reference") {
      if (!paymentReference.trim()) {
        newErrors.reference = "Payment reference is required"
      } else if (!checkPaymentData) {
        newErrors.reference = "Please validate the payment reference first"
      }
    } else {
      if (!selectedTransaction) {
        newErrors.selectedTransaction = "Please select a payment to cancel"
      }
    }

    if (!form.reason.trim()) {
      newErrors.reason = "Reason for cancellation is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePaymentReferenceLookup = async () => {
    if (!paymentReference.trim()) {
      notify("error", "Please enter a payment reference")
      return
    }

    dispatch(clearCheckPayment())
    try {
      await dispatch(checkPayment(paymentReference.trim())).unwrap()
    } catch (error: any) {
      // Error is handled by the useEffect above
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (activeTab === "reference") {
      await dispatch(cancelPaymentByReference({ reference: paymentReference.trim(), cancelData: form }))
    } else if (paymentId) {
      // For meter tab, still use the original cancelPayment with ID
      await dispatch(cancelPayment({ id: paymentId, cancelData: form }))
    }
  }

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleReset = () => {
    setForm({
      reason: "",
    })
    setPaymentReference("")
    setPaymentId(null)
    setErrors({})
    dispatch(clearCancelPayment())
    dispatch(clearCancelPaymentByReference())
    dispatch(clearCheckPayment())

    if (activeTab === "meter") {
      setMeterNumber("")
      setCustomerData(null)
      setSelectedTransaction(null)
      setShowTransactionSelection(false)
      setSearchTerm("")
      setSearchQuery("")
      setCurrentPage(1)
      dispatch(clearCustomerLookup())
      dispatch(clearPayments())
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    dispatch(clearCancelPayment())
    dispatch(clearCancelPaymentByReference())
    handleReset()
  }

  const handleTabChange = (tab: "reference" | "meter") => {
    setActiveTab(tab)
    setForm({
      reason: "",
    })
    setPaymentReference("")
    setPaymentId(null)
    setErrors({})
    dispatch(clearCancelPayment())
    dispatch(clearCheckPayment())
    dispatch(clearCustomerLookup())
    dispatch(clearPayments())
    // Reset meter-specific state
    setMeterNumber("")
    setCustomerData(null)
    setSelectedTransaction(null)
    setShowTransactionSelection(false)
    setSearchTerm("")
    setSearchQuery("")
    setCurrentPage(1)
  }

  const handleCustomerLookup = async () => {
    if (!meterNumber.trim()) {
      notify("error", "Please enter a meter number")
      return
    }

    setCustomerData(null)
    setSelectedTransaction(null)
    setShowTransactionSelection(false)
    setSearchTerm("")
    setSearchQuery("")
    setCurrentPage(1)
    dispatch(clearCustomerLookup())
    dispatch(clearPayments())

    try {
      await dispatch(lookupCustomer(meterNumber.trim())).unwrap()
    } catch (error: any) {
      // Error is handled by the useEffect above
    }
  }

  const handleMeterNumberChange = (value: string) => {
    setMeterNumber(value)
    // Reset transaction selection when meter number changes
    setSelectedTransaction(null)
    setShowTransactionSelection(false)
  }

  const handleTransactionSelect = (payment: any) => {
    setSelectedTransaction(payment)
    setPaymentId(payment.id)
    setErrors((prev) => ({
      ...prev,
      paymentId: undefined,
    }))
  }

  const handleTransactionCancel = () => {
    setSelectedTransaction(null)
    setPaymentId(null)
  }

  const handleSearch = () => {
    setSearchQuery(searchTerm)
    setCurrentPage(1)
    if (customerData) {
      dispatch(
        fetchPayments({
          pageNumber: 1,
          pageSize: pageSize,
          customerId: customerData.id,
          search: searchTerm.trim() || undefined,
        })
      )
    }
  }

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (customerData) {
      dispatch(
        fetchPayments({
          pageNumber: page,
          pageSize: pageSize,
          customerId: customerData.id,
          search: searchQuery.trim() || undefined,
        })
      )
    }
  }

  const displayPayments = payments || []

  return (
    <>
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="mx-auto flex w-full items-center justify-center px-4 py-8 2xl:container 2xl:px-16">
              <div className="w-full rounded-lg bg-white shadow-sm">
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.history.back()}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      <ArrowLeft className="size-5" />
                    </button>
                    <div>
                      <h1 className="text-lg font-semibold text-gray-900">Payment Cancellation</h1>
                      <p className="text-sm text-gray-500">Cancel a payment transaction</p>
                    </div>
                  </div>
                </div>

                {/* Vertical Tabs */}
                <div className="flex">
                  {/* Tab Navigation */}
                  <div className="w-56 border-r border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-1">
                      <button
                        onClick={() => handleTabChange("reference")}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          activeTab === "reference"
                            ? "border border-red-200 bg-red-100 text-red-900"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <FileText className="size-4" />
                        Cancel by Payment Reference
                      </button>
                      <button
                        onClick={() => handleTabChange("meter")}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          activeTab === "meter"
                            ? "border border-red-200 bg-red-100 text-red-900"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <Zap className="size-4" />
                        Cancel by Meter
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="flex-1 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {cancelPaymentError && (
                        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                          <div className="size-5 shrink-0 text-red-600">⚠️</div>
                          <p className="text-sm text-red-700">{cancelPaymentError}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {activeTab === "reference" ? (
                          <div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <FormInputModule
                                  label="Payment Reference"
                                  type="text"
                                  required
                                  value={paymentReference}
                                  onChange={(e) => handleChange("reference", e.target.value)}
                                  placeholder="Enter payment reference"
                                  error={errors.reference}
                                />
                              </div>
                              <div className="flex items-end">
                                <ButtonModule
                                  type="button"
                                  variant="primary"
                                  onClick={handlePaymentReferenceLookup}
                                  disabled={checkPaymentLoading || !paymentReference.trim()}
                                  className="px-4"
                                >
                                  {checkPaymentLoading ? (
                                    <span className="flex items-center gap-2">
                                      <RefreshCw className="size-4 animate-spin" />
                                      Looking up...
                                    </span>
                                  ) : (
                                    "Lookup"
                                  )}
                                </ButtonModule>
                              </div>
                            </div>

                            {/* Payment Info Display */}
                            {checkPaymentData && (
                              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                                <div className="flex items-center justify-between">
                                  <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                                    <div>
                                      <span className="font-medium">{checkPaymentData.customerName}</span>
                                      <p className="text-xs text-green-600">Ref: {checkPaymentData.reference}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs">{checkPaymentData.customerPhoneNumber}</p>
                                      <p className="text-xs">{checkPaymentData.customerAccountNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs">
                                        Amount: {formatCurrency(checkPaymentData.totalAmountPaid)}
                                      </p>
                                      <p className="text-xs">Channel: {checkPaymentData.channel}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs">Status: {checkPaymentData.status}</p>
                                      <p className="text-xs">{formatDateTime(checkPaymentData.paidAtUtc)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Customer Lookup Section */}
                            <div className="flex gap-2">
                              <div className="flex-1 ">
                                <FormInputModule
                                  label="Meter Number"
                                  type="text"
                                  required
                                  value={meterNumber}
                                  onChange={(e) => handleMeterNumberChange(e.target.value)}
                                  placeholder="Enter customer meter number"
                                />
                              </div>
                              <div className="flex items-end">
                                <ButtonModule
                                  type="button"
                                  variant="primary"
                                  onClick={handleCustomerLookup}
                                  disabled={customerLookupLoading || !meterNumber.trim()}
                                  className="px-4"
                                >
                                  {customerLookupLoading ? (
                                    <span className="flex items-center gap-2">
                                      <RefreshCw className="size-4 animate-spin" />
                                      Looking up...
                                    </span>
                                  ) : (
                                    "Lookup"
                                  )}
                                </ButtonModule>
                              </div>
                            </div>

                            {/* Customer Info Display */}
                            {customerData && (
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                                    <div>
                                      <span className="font-medium">{customerData.fullName}</span>
                                      <p className="text-xs text-blue-600">Acc: {customerData.accountNumber}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs">{customerData.phoneNumber}</p>
                                      <p className="text-xs">{customerData.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs">Meter: {meterNumber}</p>
                                      <p className="text-xs">{customerData.areaOfficeName}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs">Feeder: {customerData.feederName}</p>
                                      <p className="text-xs">Status: {customerData.status}</p>
                                      {customerData.isSuspended && (
                                        <p className="text-xs font-medium text-red-600">Suspended</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Transaction Selection */}
                            {showTransactionSelection && customerData && (
                              <div>
                                <h3 className="mb-3 font-medium text-gray-900">Select Payment to Cancel</h3>

                                {/* Search Bar */}
                                <div className="mb-4">
                                  <SearchModule
                                    value={searchTerm}
                                    onChange={(e) => handleSearchInputChange(e.target.value)}
                                    onSearch={handleSearch}
                                    placeholder="Search by reference, token, or channel..."
                                    className="w-full"
                                  />
                                </div>

                                {loading ? (
                                  <div className="flex items-center justify-center py-8">
                                    <RefreshCw className="size-6 animate-spin text-gray-400" />
                                    <span className="ml-2 text-gray-500">Loading payments...</span>
                                  </div>
                                ) : !selectedTransaction && displayPayments.length > 0 ? (
                                  <>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                      {displayPayments.map((payment: any) => (
                                        <div
                                          key={payment.id}
                                          onClick={() => handleTransactionSelect(payment)}
                                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                            selectedTransaction?.id === payment.id
                                              ? "border-red-500 bg-red-100 text-red-900"
                                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                          }`}
                                        >
                                          <div className="space-y-2">
                                            <div>
                                              <p className="text-sm font-medium text-gray-900">{payment.reference}</p>
                                              <p className="text-xs text-gray-500">
                                                {formatDateTime(payment.paidAtUtc)}
                                              </p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <div className="flex-1">
                                                {payment.token && (
                                                  <p className="text-xs text-gray-500">Token: {payment.token}</p>
                                                )}
                                                <p className="text-xs text-gray-500">{payment.channel}</p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                  {formatCurrency(payment.amount)}
                                                </p>
                                                <p className="text-xs text-gray-500">{payment.status}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Pagination */}
                                    {pagination && pagination.totalPages > 1 && (
                                      <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                          Showing {(currentPage - 1) * pageSize + 1} to{" "}
                                          {Math.min(currentPage * pageSize, pagination.totalCount)} of{" "}
                                          {pagination.totalCount} payments
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage <= 1}
                                            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                          >
                                            Previous
                                          </button>
                                          <span className="px-3 py-1 text-sm">
                                            Page {currentPage} of {pagination.totalPages}
                                          </span>
                                          <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= pagination.totalPages}
                                            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                          >
                                            Next
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  !selectedTransaction && (
                                    <div className="rounded-lg border border-gray-200 py-8 text-center text-gray-500">
                                      <p>
                                        {searchTerm
                                          ? "No payments found matching your search"
                                          : "No payments found for this customer"}
                                      </p>
                                    </div>
                                  )
                                )}

                                {selectedTransaction && (
                                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-red-800">
                                          Selected Payment: {selectedTransaction.reference} -{" "}
                                          {formatCurrency(selectedTransaction.amount)}
                                        </p>
                                        <p className="mt-1 text-xs text-red-600">
                                          {formatDateTime(selectedTransaction.paidAtUtc)} •{" "}
                                          {selectedTransaction.channel}
                                        </p>
                                      </div>
                                      <ButtonModule
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTransactionCancel}
                                        className="border-red-300 text-red-700 hover:bg-red-100"
                                      >
                                        Cancel Selection
                                      </ButtonModule>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        <div>
                          <FormTextAreaModule
                            label="Reason for Cancellation"
                            name="reason"
                            required
                            value={form.reason}
                            onChange={(e) => handleChange("reason", e.target.value)}
                            placeholder="Enter reason for payment cancellation"
                            rows={4}
                            error={errors.reason}
                          />
                        </div>
                      </div>

                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 size-5 shrink-0 text-amber-600">⚠️</div>
                          <div className="text-sm text-amber-800">
                            <p className="font-medium">Important Notice</p>
                            <p className="mt-1">
                              {activeTab === "reference"
                                ? "This action will cancel the payment with the specified ID. Cancellation cannot be undone. Please ensure this is the correct payment to cancel."
                                : "This action will cancel the selected payment. Cancellation cannot be undone. Please ensure this is the correct payment to cancel."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
                        <ButtonModule
                          type="button"
                          variant="outline"
                          onClick={handleReset}
                          className="w-full sm:w-auto"
                        >
                          Reset
                        </ButtonModule>
                        <ButtonModule
                          type="submit"
                          variant="primary"
                          className="w-full  sm:w-auto"
                          disabled={activeTab === "reference" ? cancelPaymentByReferenceLoading : cancelPaymentLoading}
                        >
                          {activeTab === "reference" ? (
                            cancelPaymentByReferenceLoading ? (
                              <span className="flex items-center gap-2">
                                <RefreshCw className="size-4 animate-spin" />
                                Processing...
                              </span>
                            ) : (
                              "Cancel Payment"
                            )
                          ) : cancelPaymentLoading ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw className="size-4 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            "Cancel Payment"
                          )}
                        </ButtonModule>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      <CancelPaymentSuccessModal
        isOpen={showSuccessModal}
        onRequestClose={handleSuccessModalClose}
        cancelData={cancelPaymentData}
      />
    </>
  )
}

export default PaymentCancellationPage
