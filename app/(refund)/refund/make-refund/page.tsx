"use client"

import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearMakeRefund,
  clearManualRefund,
  makeManualRefund,
  makeRefund,
  MakeRefundRequest,
  ManualRefundRequest,
} from "lib/redux/refundSlice"
import { clearCustomerLookup, lookupCustomer } from "lib/redux/agentSlice"
import { clearPayments, fetchPayments } from "lib/redux/paymentSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import MakeRefundSuccessModal from "components/ui/Modal/make-refund-success-modal"
import { ArrowLeft, DollarSign, FileText, RefreshCw, Zap } from "lucide-react"

const MakeRefundPage = () => {
  const dispatch = useAppDispatch()
  const {
    makeRefundLoading,
    makeRefundError,
    makeRefundSuccess,
    makeRefundData,
    manualRefundLoading,
    manualRefundError,
    manualRefundSuccess,
    manualRefundData,
  } = useAppSelector((state) => state.refunds)
  const { customerLookupLoading, customerLookup, customerLookupError, customerLookupSuccess } = useAppSelector(
    (state) => state.agents
  )
  const { payments, loading, pagination } = useAppSelector((state) => state.payments)

  const [form, setForm] = useState<MakeRefundRequest>({
    reference: "",
    reason: "",
    refundTypeKey: "",
  })

  const [manualForm, setManualForm] = useState<ManualRefundRequest>({
    meterNumber: "",
    amount: 0,
    phoneNumber: "",
    reason: "",
  })

  const [manualCustomerData, setManualCustomerData] = useState<{
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

  const [showManualCustomerInfo, setShowManualCustomerInfo] = useState(false)

  const [activeTab, setActiveTab] = useState<"reference" | "meter" | "manual">("reference")
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
    refundTypeKey?: string
    selectedTransaction?: string
    manualMeterNumber?: string
    manualAmount?: string
    manualPhoneNumber?: string
    manualReason?: string
  }>({})

  const refundTypeOptions = [
    { value: "", label: "Select Refund Type" },
    // { value: "FULL_REFUND", label: "Full Refund" },
    // { value: "PARTIAL_REFUND", label: "Partial Refund" },
    // { value: "RE_VEND", label: "Re-vend" },
    { value: "prepaid-token", label: "Prepaid" },
  ]

  useEffect(() => {
    if (makeRefundSuccess && makeRefundData) {
      setShowSuccessModal(true)
      notify("success", "Refund processed successfully", {
        description: "The refund has been created and a new token has been generated.",
      })
    }

    if (makeRefundError) {
      notify("error", makeRefundError)
    }

    if (manualRefundSuccess && manualRefundData) {
      setShowSuccessModal(true)
      notify("success", "Manual refund processed successfully", {
        description: "The manual refund has been created and processed.",
      })
    }

    if (manualRefundError) {
      notify("error", manualRefundError)
    }
  }, [makeRefundSuccess, makeRefundError, makeRefundData, manualRefundSuccess, manualRefundError, manualRefundData])

  useEffect(() => {
    if (customerLookupSuccess && customerLookup) {
      if (activeTab === "meter") {
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
      } else if (activeTab === "manual") {
        setManualCustomerData({
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

        setShowManualCustomerInfo(true)

        // Auto-fill phone number from customer data
        setManualForm((prev) => ({
          ...prev,
          phoneNumber: customerLookup.phoneNumber || "",
        }))

        notify("success", "Customer validated successfully", {
          description: `Customer found: ${customerLookup.fullName}`,
          duration: 3000,
        })
      }
    }
  }, [customerLookupSuccess, customerLookup, dispatch, pageSize, activeTab, searchQuery])

  useEffect(() => {
    if (customerLookupError) {
      notify("error", customerLookupError || "Failed to validate customer", {
        duration: 6000,
      })
    }
  }, [customerLookupError])

  useEffect(() => {
    return () => {
      dispatch(clearMakeRefund())
      dispatch(clearManualRefund())
      dispatch(clearCustomerLookup())
      dispatch(clearPayments())
    }
  }, [dispatch])

  const handleChange = (field: keyof MakeRefundRequest | "meterNumber", value: string | number) => {
    if (field === "meterNumber") {
      setForm((prev) => ({
        ...prev,
        reference: value as string,
      }))
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

  const handleManualFormChange = (field: keyof ManualRefundRequest, value: string | number) => {
    if (field === "amount") {
      // Handle amount formatting for display
      const numericValue = typeof value === "string" ? value.replace(/[^\d.]/g, "") : value.toString()
      const parsedValue = parseFloat(numericValue) || 0

      setManualForm((prev) => ({
        ...prev,
        [field]: parsedValue,
      }))
    } else {
      setManualForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

    const errorField = `manual${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof errors
    if (errors[errorField]) {
      setErrors((prev) => ({
        ...prev,
        [errorField]: undefined,
      }))
    }
  }

  // Format amount for display with naira symbol and thousand separators
  const formatAmountForDisplay = (amount: number): string => {
    if (isNaN(amount) || amount === 0) return ""
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Handle amount input change with proper formatting
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = inputValue.replace(/[^\d.]/g, "")
    const parsedValue = parseFloat(numericValue) || 0
    handleManualFormChange("amount", parsedValue)
  }

  const validate = () => {
    const newErrors: typeof errors = {}

    if (activeTab === "reference") {
      if (!form.reference.trim()) {
        newErrors.reference = "Payment reference is required"
      }
    } else if (activeTab === "meter") {
      if (!selectedTransaction) {
        newErrors.selectedTransaction = "Please select a transaction to refund"
      }
    } else if (activeTab === "manual") {
      if (!manualForm.meterNumber.trim()) {
        newErrors.manualMeterNumber = "Meter number is required"
      }
      if (!manualForm.amount || manualForm.amount <= 0) {
        newErrors.manualAmount = "Amount must be greater than 0"
      }
      if (!manualForm.phoneNumber.trim()) {
        newErrors.manualPhoneNumber = "Phone number is required"
      }
      if (!manualForm.reason.trim()) {
        newErrors.manualReason = "Reason for manual refund is required"
      }
    }

    if (activeTab !== "manual") {
      if (!form.reason.trim()) {
        newErrors.reason = "Reason for refund is required"
      }

      if (!form.refundTypeKey) {
        newErrors.refundTypeKey = "Please select a refund type"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (activeTab === "manual") {
      await dispatch(makeManualRefund(manualForm))
    } else {
      await dispatch(makeRefund(form))
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
      reference: "",
      reason: "",
      refundTypeKey: "",
    })
    setManualForm({
      meterNumber: "",
      amount: 0,
      phoneNumber: "",
      reason: "",
    })
    setErrors({})
    dispatch(clearMakeRefund())
    dispatch(clearManualRefund())

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
    } else if (activeTab === "manual") {
      setManualCustomerData(null)
      setShowManualCustomerInfo(false)
      dispatch(clearCustomerLookup())
    }
  }

  const handleTabChange = (tab: "reference" | "meter" | "manual") => {
    setActiveTab(tab)
    setForm({
      reference: "",
      reason: "",
      refundTypeKey: "",
    })
    setManualForm({
      meterNumber: "",
      amount: 0,
      phoneNumber: "",
      reason: "",
    })
    setErrors({})
    dispatch(clearMakeRefund())
    dispatch(clearManualRefund())
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
    // Reset manual customer state
    setManualCustomerData(null)
    setShowManualCustomerInfo(false)
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    dispatch(clearMakeRefund())
    dispatch(clearManualRefund())
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
    setManualCustomerData(null)
    setShowManualCustomerInfo(false)
    dispatch(clearCustomerLookup())
    dispatch(clearPayments())

    try {
      await dispatch(lookupCustomer(meterNumber.trim())).unwrap()
    } catch (error: any) {
      // Error is handled by the useEffect above
    }
  }

  const handleManualCustomerLookup = async () => {
    if (!manualForm.meterNumber.trim()) {
      notify("error", "Please enter a meter number")
      return
    }

    setManualCustomerData(null)
    setShowManualCustomerInfo(false)
    dispatch(clearCustomerLookup())

    try {
      await dispatch(lookupCustomer(manualForm.meterNumber.trim())).unwrap()
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
    setForm((prev) => ({
      ...prev,
      reference: payment.reference,
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
      reference: "",
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
                      <h1 className="text-xl font-bold text-gray-900">Make Refund</h1>
                      <p className="text-sm text-gray-500">Process refund for prepaid payment</p>
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
                        Refund by Reference
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
                        Refund by Meter
                      </button>
                      <button
                        onClick={() => handleTabChange("manual")}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          activeTab === "manual"
                            ? "border border-green-200 bg-green-100 text-green-900"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <DollarSign className="size-4" />
                        Manual Refund
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="flex-1 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {(makeRefundError || manualRefundError) && (
                        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                          <div className="size-5 shrink-0 text-red-600">⚠️</div>
                          <p className="text-sm text-red-700">{makeRefundError || manualRefundError}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {activeTab === "reference" ? (
                          <div>
                            <FormInputModule
                              label="Payment Reference"
                              type="text"
                              required
                              value={form.reference}
                              onChange={(e) => handleChange("reference", e.target.value)}
                              placeholder="Enter payment reference"
                              error={errors.reference}
                            />
                          </div>
                        ) : activeTab === "meter" ? (
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
                                <h3 className="mb-3 font-medium text-gray-900">Select Transaction to Refund</h3>

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
                        ) : activeTab === "manual" ? (
                          <>
                            {/* Manual Refund Form */}
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <FormInputModule
                                  label="Meter Number"
                                  type="text"
                                  required
                                  value={manualForm.meterNumber}
                                  onChange={(e) => handleManualFormChange("meterNumber", e.target.value)}
                                  placeholder="Enter customer meter number"
                                  error={errors.manualMeterNumber}
                                />
                              </div>
                              <div className="flex items-end">
                                <ButtonModule
                                  type="button"
                                  variant="primary"
                                  onClick={handleManualCustomerLookup}
                                  disabled={customerLookupLoading || !manualForm.meterNumber.trim()}
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

                            {/* Manual Customer Info Display */}
                            {manualCustomerData && (
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                                    <div>
                                      <span className="font-medium">{manualCustomerData.fullName}</span>
                                      <p className="text-xs text-blue-600">Acc: {manualCustomerData.accountNumber}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs">{manualCustomerData.phoneNumber}</p>
                                      <p className="text-xs">{manualCustomerData.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs">Meter: {manualForm.meterNumber}</p>
                                      <p className="text-xs">{manualCustomerData.areaOfficeName}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs">Feeder: {manualCustomerData.feederName}</p>
                                      <p className="text-xs">Status: {manualCustomerData.status}</p>
                                      {manualCustomerData.isSuspended && (
                                        <p className="text-xs font-medium text-red-600">Suspended</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div>
                              <FormInputModule
                                label="Refund Amount"
                                type="text"
                                required
                                value={formatAmountForDisplay(manualForm.amount)}
                                onChange={handleAmountInputChange}
                                placeholder="₦0.00"
                                error={errors.manualAmount}
                              />
                            </div>

                            <div>
                              <FormInputModule
                                label="Phone Number"
                                type="tel"
                                required
                                value={manualForm.phoneNumber}
                                onChange={(e) => handleManualFormChange("phoneNumber", e.target.value)}
                                placeholder="Enter customer phone number"
                                error={errors.manualPhoneNumber}
                              />
                            </div>

                            <div>
                              <FormTextAreaModule
                                label="Reason for Manual Refund"
                                name="manualReason"
                                required
                                value={manualForm.reason}
                                onChange={(e) => handleManualFormChange("reason", e.target.value)}
                                placeholder="Enter reason for manual refund"
                                rows={4}
                                error={errors.manualReason}
                              />
                            </div>
                          </>
                        ) : null}

                        {activeTab !== "manual" && (
                          <>
                            <div>
                              <FormSelectModule
                                label="Refund Type"
                                name="refundTypeKey"
                                required
                                value={form.refundTypeKey}
                                onChange={(e) => handleChange("refundTypeKey", e.target.value)}
                                options={refundTypeOptions}
                                error={errors.refundTypeKey}
                              />
                            </div>

                            <div>
                              <FormTextAreaModule
                                label="Reason for Refund"
                                name="reason"
                                required
                                value={form.reason}
                                onChange={(e) => handleChange("reason", e.target.value)}
                                placeholder="Enter reason for refund"
                                rows={4}
                                error={errors.reason}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 size-5 shrink-0 text-amber-600">⚠️</div>
                          <div className="text-sm text-amber-800">
                            <p className="font-medium">Important Notice</p>
                            <p className="mt-1">
                              {activeTab === "reference"
                                ? "This action will process a refund for the selected payment. Refund attempts are limited. Please ensure this is a valid refund request."
                                : activeTab === "meter"
                                ? "This action will process a refund for the selected transaction. Refund attempts are limited. Please ensure this is a valid refund request."
                                : "This action will process a manual refund. Manual refunds should only be used in specific circumstances. Please ensure this is a valid refund request."}
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
                          disabled={makeRefundLoading || manualRefundLoading}
                        >
                          {makeRefundLoading || manualRefundLoading ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw className="size-4 animate-spin" />
                              Processing...
                            </span>
                          ) : activeTab === "manual" ? (
                            "Process Manual Refund"
                          ) : (
                            "Process Refund"
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
      <MakeRefundSuccessModal
        isOpen={showSuccessModal}
        onRequestClose={handleSuccessModalClose}
        refundData={makeRefundData || manualRefundData}
      />
    </>
  )
}

export default MakeRefundPage
