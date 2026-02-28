"use client"

import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearEditPayment,
  clearPaymentByReference,
  clearPayments,
  editPayment,
  EditPaymentRequest,
  fetchPaymentByReference,
  fetchPayments,
} from "lib/redux/paymentSlice"
import { clearCustomerLookup, lookupCustomer } from "lib/redux/agentSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { SearchModule } from "components/ui/Search/search-module"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import EditPaymentSuccessModal from "components/ui/Modal/edit-payment-success-modal"
import { ArrowLeft, FileText, RefreshCw, Zap } from "lucide-react"

const EditPaymentPage = () => {
  const dispatch = useAppDispatch()
  const {
    editPaymentLoading,
    editPaymentError,
    editPaymentSuccess,
    editPaymentData,
    paymentByReference,
    paymentByReferenceLoading,
    paymentByReferenceError,
    paymentByReferenceSuccess,
    payments,
    loading,
    pagination,
  } = useAppSelector((state) => state.payments)
  const { customerLookupLoading, customerLookup, customerLookupError, customerLookupSuccess } = useAppSelector(
    (state) => state.agents
  )

  const [form, setForm] = useState<EditPaymentRequest>({
    newAmount: 0,
    reason: "",
    effectiveAtUtc: new Date().toISOString(),
  })

  const [activeTab, setActiveTab] = useState<"reference" | "meter">("reference")
  const [reference, setReference] = useState("")
  const [meterNumber, setMeterNumber] = useState("")
  const [paymentData, setPaymentData] = useState<any>(null)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
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
    newAmount?: string
    reason?: string
    selectedTransaction?: string
    effectiveAtUtc?: string
  }>({})

  useEffect(() => {
    if (editPaymentSuccess && editPaymentData) {
      setShowSuccessModal(true)
      notify("success", "Payment edited successfully", {
        description: `Payment amount has been updated to ${formatCurrency(editPaymentData.totalAmountPaid || 0)}`,
      })
    }

    if (editPaymentError) {
      notify("error", editPaymentError)
    }
  }, [editPaymentSuccess, editPaymentError, editPaymentData])

  useEffect(() => {
    if (paymentByReference && paymentByReferenceLoading === false && activeTab === "reference") {
      setPaymentData(paymentByReference)
      setShowPaymentInfo(true)

      // Pre-fill the current amount
      setForm((prev) => ({
        ...prev,
        newAmount: paymentByReference.amount || 0,
      }))

      notify("success", "Payment found successfully", {
        description: `Payment: ${paymentByReference.reference} - ${formatCurrency(paymentByReference.totalAmountPaid)}`,
        duration: 3000,
      })
    }
  }, [paymentByReference, paymentByReferenceLoading, activeTab])

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
  }, [customerLookupSuccess, customerLookup, dispatch, pageSize, searchQuery])

  useEffect(() => {
    if (customerLookupError) {
      notify("error", customerLookupError || "Failed to validate customer", {
        duration: 6000,
      })
    }
  }, [customerLookupError])

  useEffect(() => {
    if (paymentByReferenceError) {
      notify("error", paymentByReferenceError || "Failed to find payment", {
        duration: 6000,
      })
    }
  }, [paymentByReferenceError])

  useEffect(() => {
    return () => {
      dispatch(clearEditPayment())
      dispatch(clearCustomerLookup())
      dispatch(clearPayments())
      dispatch(clearPaymentByReference())
    }
  }, [dispatch])

  // Format amount for display with naira symbol and thousand separators
  const formatAmountForDisplay = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount) || amount === 0) return ""
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Handle amount input change with proper formatting
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e?.target?.value || ""
    const numericValue = inputValue.replace(/[^\d.]/g, "")
    const parsedValue = parseFloat(numericValue) || 0
    handleFormChange("newAmount", parsedValue)
  }

  const handleFormChange = (field: keyof EditPaymentRequest, value: string | number) => {
    // Additional safety for effectiveAtUtc field
    if (field === "effectiveAtUtc" && typeof value === "string") {
      // Ensure we have a valid ISO string
      if (!value || value === "") {
        value = new Date().toISOString()
      }
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
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

    if (activeTab === "reference") {
      if (!reference.trim()) {
        newErrors.reference = "Payment reference is required"
      }
      if (!paymentData) {
        newErrors.reference = "Please lookup the payment reference first"
      }
    } else if (activeTab === "meter") {
      if (!selectedTransaction) {
        newErrors.selectedTransaction = "Please select a transaction to edit"
      }
    }

    if (!form.newAmount || form.newAmount <= 0) {
      newErrors.newAmount = "New amount must be greater than 0"
    }

    if (!form.reason.trim()) {
      newErrors.reason = "Reason for editing payment is required"
    }

    if (!form.effectiveAtUtc) {
      newErrors.effectiveAtUtc = "Effective date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePaymentLookup = async () => {
    if (!reference.trim()) {
      notify("error", "Please enter a payment reference")
      return
    }

    setPaymentData(null)
    setShowPaymentInfo(false)
    dispatch(clearPaymentByReference())

    try {
      await dispatch(fetchPaymentByReference(reference.trim())).unwrap()
    } catch (error: any) {
      // Error is handled by the payment slice and useEffect
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    let paymentId: number

    if (activeTab === "reference") {
      paymentId = paymentData.paymentId
    } else {
      paymentId = selectedTransaction.id
    }

    await dispatch(editPayment({ id: paymentId, editData: form }))
  }

  const formatCurrency = (amount: number | undefined | null, currency: string = "NGN") => {
    if (amount === undefined || amount === null || isNaN(amount)) return "₦0.00"
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateTime = (dateString: string | undefined | null) => {
    if (!dateString) return ""
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
      newAmount: 0,
      reason: "",
      effectiveAtUtc: new Date().toISOString(),
    })
    setErrors({})
    dispatch(clearEditPayment())

    if (activeTab === "reference") {
      setReference("")
      setPaymentData(null)
      setShowPaymentInfo(false)
      dispatch(clearPaymentByReference())
    } else if (activeTab === "meter") {
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

  const handleTabChange = (tab: "reference" | "meter") => {
    setActiveTab(tab)
    // Only reset reason and effective date, preserve amount if it's already set
    setForm((prev) => ({
      ...prev,
      reason: "",
      effectiveAtUtc: new Date().toISOString(),
    }))
    // Clear tab-specific data
    setPaymentData(null)
    setShowPaymentInfo(false)
    setSelectedTransaction(null)
    setShowTransactionSelection(false)
    setReference("")
    setMeterNumber("")
    setCustomerData(null)
    setSearchTerm("")
    setSearchQuery("")
    setCurrentPage(1)
    // Clear tab-specific errors
    setErrors((prev) => ({
      ...prev,
      reference: undefined,
      meterNumber: undefined,
      selectedTransaction: undefined,
    }))
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    dispatch(clearEditPayment())
    handleReset()
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
    // Pre-fill the current amount
    setForm((prev) => ({
      ...prev,
      newAmount: payment.amount || 0,
    }))
    setErrors((prev) => ({
      ...prev,
      selectedTransaction: undefined,
    }))
  }

  const handleTransactionCancel = () => {
    setSelectedTransaction(null)
    setForm((prev) => ({
      ...prev,
      newAmount: 0,
    }))
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
                      <h1 className="text-xl font-bold text-gray-900">Edit Payment</h1>
                      <p className="text-sm text-gray-500">Modify payment amount and details</p>
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
                            ? "border border-green-200 bg-green-100 text-green-900"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <FileText className="size-4" />
                        Edit by Reference
                      </button>
                      <button
                        onClick={() => handleTabChange("meter")}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          activeTab === "meter"
                            ? "border border-green-200 bg-green-100 text-green-900"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <Zap className="size-4" />
                        Edit by Meter
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="flex-1 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {editPaymentError && (
                        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                          <div className="size-5 shrink-0 text-red-600">⚠️</div>
                          <p className="text-sm text-red-700">{editPaymentError}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {activeTab === "reference" ? (
                          <>
                            {/* Payment Reference Lookup Section */}
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <FormInputModule
                                  label="Payment Reference"
                                  type="text"
                                  required
                                  value={reference}
                                  onChange={(e) => setReference(e.target.value)}
                                  placeholder="Enter payment reference"
                                  error={errors.reference}
                                />
                              </div>
                              <div className="flex items-end">
                                <ButtonModule
                                  type="button"
                                  variant="primary"
                                  onClick={handlePaymentLookup}
                                  disabled={paymentByReferenceLoading || !reference.trim()}
                                  className="px-4"
                                >
                                  {paymentByReferenceLoading ? (
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
                            {paymentData && (
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                                    <div>
                                      <span className="font-medium">{paymentData.customerName}</span>
                                      <p className="text-xs text-blue-600">Acc: {paymentData.customerAccountNumber}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs">{paymentData.customerPhoneNumber}</p>
                                      <p className="max-w-[200px] truncate text-xs" title={paymentData.customerAddress}>
                                        {paymentData.customerAddress}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs">Ref: {paymentData.reference}</p>
                                      <p className="text-xs">Channel: {paymentData.channel}</p>
                                      {paymentData.customerMeterNumber && (
                                        <p className="text-xs">Meter: {paymentData.customerMeterNumber}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs">Type: {paymentData.accountType}</p>
                                      <p className="text-xs">Status: {paymentData.status}</p>
                                      <p className="text-xs font-medium">
                                        Current: {formatCurrency(paymentData.totalAmountPaid)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : activeTab === "meter" ? (
                          <>
                            {/* Customer Lookup Section */}
                            <div className="flex gap-2">
                              <div className="flex-1">
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
                                <h3 className="mb-3 font-medium text-gray-900">Select Transaction to Edit</h3>

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
                                    <span className="ml-2 text-gray-500">Loading transactions...</span>
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
                                              ? "border-green-500 bg-green-50"
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
                                          {pagination.totalCount} transactions
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
                                          ? "No transactions found matching your search"
                                          : "No transactions found for this customer"}
                                      </p>
                                    </div>
                                  )
                                )}

                                {errors.selectedTransaction && (
                                  <p className="mt-2 text-sm text-red-600">{errors.selectedTransaction}</p>
                                )}
                                {selectedTransaction && (
                                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-green-800">
                                          Selected Transaction: {selectedTransaction.reference} -{" "}
                                          {formatCurrency(selectedTransaction.amount)}
                                        </p>
                                        <p className="mt-1 text-xs text-green-600">
                                          {formatDateTime(selectedTransaction.paidAtUtc)} •{" "}
                                          {selectedTransaction.channel}
                                        </p>
                                      </div>
                                      <ButtonModule
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTransactionCancel}
                                        className="border-green-300 text-green-700 hover:bg-green-100"
                                      >
                                        Cancel Selection
                                      </ButtonModule>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : null}

                        {/* Edit Form Fields */}
                        <div>
                          <FormInputModule
                            label="New Amount"
                            type="text"
                            required
                            value={formatAmountForDisplay(form.newAmount)}
                            onChange={handleAmountInputChange}
                            placeholder="₦0.00"
                            error={errors.newAmount}
                          />
                          {(paymentData || selectedTransaction) && (
                            <p className="mt-1 text-xs text-gray-500">
                              Current amount: {formatCurrency(paymentData?.amount || selectedTransaction?.amount || 0)}
                            </p>
                          )}
                        </div>

                        <div>
                          <FormInputModule
                            label="Effective Date & Time"
                            type="datetime-local"
                            required
                            value={form.effectiveAtUtc ? form.effectiveAtUtc.slice(0, 16) : ""}
                            onChange={(e) =>
                              handleFormChange(
                                "effectiveAtUtc",
                                e.target.value ? new Date(e.target.value).toISOString() : ""
                              )
                            }
                            error={errors.effectiveAtUtc}
                            placeholder={""}
                          />
                        </div>

                        <div>
                          <FormTextAreaModule
                            label="Reason for Editing"
                            name="reason"
                            required
                            value={form.reason}
                            onChange={(e) => handleFormChange("reason", e.target.value)}
                            placeholder="Enter reason for editing this payment"
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
                              This action will modify the payment amount. Please ensure this is a valid edit request and
                              that you have the proper authorization.
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
                          className="w-full sm:w-auto"
                          disabled={editPaymentLoading}
                        >
                          {editPaymentLoading ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw className="size-4 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            "Edit Payment"
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
      <EditPaymentSuccessModal
        isOpen={showSuccessModal}
        onRequestClose={handleSuccessModalClose}
        editPaymentData={editPaymentData}
        originalAmount={paymentData?.totalAmountPaid || selectedTransaction?.totalAmountPaid}
        onSuccess={handleReset}
      />
    </>
  )
}

export default EditPaymentPage
