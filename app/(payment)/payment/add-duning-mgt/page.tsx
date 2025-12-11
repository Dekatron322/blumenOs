"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

import { notify } from "components/ui/Notification/Notification"
import { AddIcon } from "components/Icons/Icons"
import { AppDispatch, RootState } from "lib/redux/store"
import {
  clearCreateState,
  createPaymentDunningCase,
  type CreatePaymentDunningCaseRequest,
} from "lib/redux/paymentDunningSlice"
import { clearCustomerLookup, lookupCustomer } from "lib/redux/customerSlice"
import { clearCurrentBillByReference, fetchPostpaidBillByReference, fetchPostpaidBills } from "lib/redux/postpaidSlice"
import { fetchAgents } from "lib/redux/agentSlice"

interface CustomerInfo {
  id: number
  accountNumber: string
  fullName: string
  phoneNumber: string
  email: string
  status: string
  isSuspended: boolean
  distributionSubstationCode: string
  feederName: string
  areaOfficeName: string
  address: string
  city: string
  state: string
  serviceCenterName: string
  meterNumber: string
  isPPM: boolean
  isMD: boolean
  band: string
  customerOutstandingDebtBalance: number
}

interface PostpaidBill {
  id: number
  reference: string
  period: string
  totalDue: number
  totalPaid: number
  outstandingAmount: number
  status: number
  dueDate: string
  customerName: string
  customerAccountNumber: string
}

interface BillInfo {
  id: number
  customerName: string
  customerAccountNumber: string
  period: string
  totalDue: number
  status: number
  outstandingAmount: number
}

interface DunningFormData {
  customerId: number
  postpaidBillId: number
  outstandingAmount: number
  stage: "SoftReminder" | "HardReminder" | "FieldVisit" | "DisconnectionNotice"
  assignedToUserId: number
  nextActionDueAtUtc: string
  notes: string
}

// Stage mapping utilities
const stageMap = {
  1: "SoftReminder" as const,
  2: "HardReminder" as const,
  3: "FieldVisit" as const,
  4: "DisconnectionNotice" as const,
}

const reverseStageMap = {
  SoftReminder: 1,
  HardReminder: 2,
  FieldVisit: 3,
  DisconnectionNotice: 4,
}

const stageOptions = [
  { value: 1, label: "Soft Reminder" },
  { value: 2, label: "Hard Reminder" },
  { value: 3, label: "Field Visit" },
  { value: 4, label: "Disconnection Notice" },
]

const AddDunningCasePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { creating, createError, createSuccess } = useSelector((state: RootState) => state.paymentDunnings)

  const { agents, loading: agentsLoading } = useSelector((state: RootState) => state.agents)
  const { bills, loading: billsLoading } = useSelector((state: RootState) => state.postpaidBilling)
  const { currentBillByReference, currentBillByReferenceLoading, currentBillByReferenceError } = useSelector(
    (state: RootState) => state.postpaidBilling
  )
  const { customerLookup, customerLookupLoading, customerLookupError, customerLookupSuccess } = useSelector(
    (state: RootState) => state.customers
  )

  const [identifierType, setIdentifierType] = useState<"postpaidBill" | "customer">("postpaidBill")
  const [paymentReference, setPaymentReference] = useState("")
  const [customerReference, setCustomerReference] = useState("")
  const [billInfo, setBillInfo] = useState<BillInfo | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [isValidatingReference, setIsValidatingReference] = useState(false)
  const [isValidatingCustomer, setIsValidatingCustomer] = useState(false)
  const [selectedBill, setSelectedBill] = useState<PostpaidBill | null>(null)

  const [formData, setFormData] = useState<DunningFormData>({
    customerId: 0,
    postpaidBillId: 0,
    outstandingAmount: 0,
    stage: "SoftReminder",
    assignedToUserId: 0,
    nextActionDueAtUtc: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to tomorrow
    notes: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Agent options
  const agentOptions = agents.map((agent) => ({ value: agent.id, label: agent.user.fullName }))

  // Bill options for the selected customer
  const billOptions = bills
    .filter((bill) => bill.outstandingAmount > 0)
    .map((bill) => ({
      value: bill.id,
      label: `${bill.period} - ₦${bill.outstandingAmount.toLocaleString()} (${bill.reference})`,
    }))

  // Validate payment reference
  const validatePaymentReference = async () => {
    if (!paymentReference.trim()) {
      setFormErrors((prev) => ({ ...prev, paymentReference: "Payment reference is required" }))
      return
    }

    setIsValidatingReference(true)
    setFormErrors((prev) => ({ ...prev, paymentReference: "" }))
    setBillInfo(null)
    setSelectedBill(null)

    try {
      const result = await dispatch(fetchPostpaidBillByReference(paymentReference)).unwrap()

      if (result) {
        setBillInfo({
          id: result.id,
          customerName: result.customerName,
          customerAccountNumber: result.customerAccountNumber,
          period: result.period,
          totalDue: result.totalDue,
          status: result.status,
          outstandingAmount: result.outstandingAmount || result.totalDue - result.totalPaid,
        })

        // Auto-populate the bill ID, customer ID, and amount
        setFormData((prev) => ({
          ...prev,
          postpaidBillId: result.id,
          customerId: result.customerId,
          outstandingAmount: result.outstandingAmount || result.totalDue - result.totalPaid,
        }))

        notify("success", "Bill validated successfully", {
          description: `Bill found for ${result.customerName}`,
          duration: 3000,
        })
      }
    } catch (error: any) {
      setFormErrors((prev) => ({
        ...prev,
        paymentReference: typeof error === "string" ? error : error?.message || "Invalid payment reference",
      }))
      setBillInfo(null)
      setSelectedBill(null)
      setFormData((prev) => ({
        ...prev,
        postpaidBillId: 0,
        customerId: 0,
        outstandingAmount: 0,
      }))
    } finally {
      setIsValidatingReference(false)
    }
  }

  // Validate customer reference
  const validateCustomerReference = async () => {
    if (!customerReference.trim()) {
      setFormErrors((prev) => ({ ...prev, customerReference: "Customer reference is required" }))
      return
    }

    setIsValidatingCustomer(true)
    setFormErrors((prev) => ({ ...prev, customerReference: "" }))
    setCustomerInfo(null)
    setSelectedBill(null)

    try {
      const result = await dispatch(
        lookupCustomer({
          reference: customerReference,
          type: "postpaid",
        })
      ).unwrap()

      if (result) {
        setCustomerInfo({
          id: result.id,
          accountNumber: result.accountNumber,
          fullName: result.fullName,
          phoneNumber: result.phoneNumber,
          email: result.email,
          status: result.status,
          isSuspended: result.isSuspended,
          distributionSubstationCode: result.distributionSubstationCode,
          feederName: result.feederName,
          areaOfficeName: result.areaOfficeName,
          address: result.address,
          city: result.city,
          state: result.state,
          serviceCenterName: result.serviceCenterName,
          meterNumber: result.meterNumber,
          isPPM: result.isPPM,
          isMD: result.isMD,
          band: result.band,
          customerOutstandingDebtBalance: result.customerOutstandingDebtBalance,
        })

        // Auto-populate the customer ID
        setFormData((prev) => ({
          ...prev,
          customerId: result.id,
        }))

        // Fetch customer's postpaid bills
        await dispatch(
          fetchPostpaidBills({
            customerId: result.id,
            pageNumber: 1,
            pageSize: 50,
          })
        )

        notify("success", "Customer validated successfully", {
          description: `Customer found: ${result.fullName}`,
          duration: 3000,
        })
      }
    } catch (error: any) {
      setFormErrors((prev) => ({
        ...prev,
        customerReference: typeof error === "string" ? error : error?.message || "Invalid customer reference",
      }))
      setCustomerInfo(null)
      setSelectedBill(null)
      setFormData((prev) => ({
        ...prev,
        customerId: 0,
        postpaidBillId: 0,
        outstandingAmount: 0,
      }))
    } finally {
      setIsValidatingCustomer(false)
    }
  }

  // Clear bill info when reference changes
  useEffect(() => {
    if (!paymentReference.trim()) {
      setBillInfo(null)
      setSelectedBill(null)
      setFormData((prev) => ({
        ...prev,
        postpaidBillId: 0,
        customerId: 0,
        outstandingAmount: 0,
      }))
      setFormErrors((prev) => ({ ...prev, paymentReference: "" }))
    }
  }, [paymentReference])

  // Clear customer info when reference changes
  useEffect(() => {
    if (!customerReference.trim()) {
      setCustomerInfo(null)
      setSelectedBill(null)
      setFormData((prev) => ({
        ...prev,
        customerId: 0,
        postpaidBillId: 0,
        outstandingAmount: 0,
      }))
      setFormErrors((prev) => ({ ...prev, customerReference: "" }))
    }
  }, [customerReference])

  // Handle bill selection for customer type
  const handleBillSelect = (billId: number) => {
    const bill = bills.find((b) => b.id === billId)
    setSelectedBill(bill || null)

    if (bill) {
      setFormData((prev) => ({
        ...prev,
        postpaidBillId: bill.id,
        outstandingAmount: bill.outstandingAmount,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        postpaidBillId: 0,
        outstandingAmount: 0,
      }))
    }
  }

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    let processedValue = value

    // Handle number fields
    if (["customerId", "postpaidBillId", "outstandingAmount", "assignedToUserId"].includes(name)) {
      processedValue = value === "" ? 0 : Number(value)
    }

    // Handle stage field - convert numeric value to string type
    if (name === "stage") {
      const numericValue = Number(value)
      processedValue = stageMap[numericValue as keyof typeof stageMap] || "SoftReminder"
    }

    // Handle date field
    if (name === "nextActionDueAtUtc") {
      const localDate = new Date(value)
      processedValue = localDate.toISOString()
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    // Special handling for bill selection
    if (name === "postpaidBillId" && identifierType === "customer") {
      handleBillSelect(Number(value))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (identifierType === "postpaidBill") {
      if (!paymentReference.trim()) {
        errors.paymentReference = "Payment reference is required"
      } else if (!billInfo) {
        errors.paymentReference = "Please validate the payment reference first"
      } else if (formData.postpaidBillId === 0) {
        errors.paymentReference = "Valid bill ID not found"
      } else if (formData.customerId === 0) {
        errors.paymentReference = "Valid customer ID not found"
      }
    } else if (identifierType === "customer") {
      if (!customerReference.trim()) {
        errors.customerReference = "Customer reference is required"
      } else if (!customerInfo) {
        errors.customerReference = "Please validate the customer reference first"
      } else if (formData.customerId === 0) {
        errors.customerReference = "Valid customer ID not found"
      } else if (formData.postpaidBillId === 0) {
        errors.postpaidBillId = "Postpaid bill is required"
      }
    }

    if (formData.outstandingAmount <= 0) {
      errors.outstandingAmount = "Outstanding amount must be greater than 0"
    }

    if (!formData.stage) {
      errors.stage = "Dunning stage is required"
    }

    if (formData.assignedToUserId === 0) {
      errors.assignedToUserId = "Assigned user is required"
    }

    if (!formData.nextActionDueAtUtc) {
      errors.nextActionDueAtUtc = "Next action due date is required"
    } else {
      const dueDate = new Date(formData.nextActionDueAtUtc)
      const now = new Date()
      if (dueDate <= now) {
        errors.nextActionDueAtUtc = "Next action due date must be in the future"
      }
    }

    if (!formData.notes.trim()) {
      errors.notes = "Notes are required"
    } else if (formData.notes.length < 10) {
      errors.notes = "Notes must be at least 10 characters long"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitDunningCase()
  }

  const submitDunningCase = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      const dunningCaseData: CreatePaymentDunningCaseRequest = {
        customerId: formData.customerId,
        postpaidBillId: formData.postpaidBillId,
        outstandingAmount: formData.outstandingAmount,
        stage: formData.stage,
        assignedToUserId: formData.assignedToUserId,
        nextActionDueAtUtc: formData.nextActionDueAtUtc,
        notes: formData.notes,
      }

      const result = await dispatch(createPaymentDunningCase(dunningCaseData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Dunning case created successfully", {
          description: `Dunning case ${result.data.caseNumber} has been created for ${result.data.customerName}`,
          duration: 5000,
        })

        // Redirect to dunning cases list after a delay
        setTimeout(() => {
          router.push("/dashboard/dunning")
        }, 2000)
      }
    } catch (error: any) {
      console.error("Failed to create dunning case:", error)
      const errorMessage = typeof error === "string" ? error : error?.message || "An unexpected error occurred"

      if (!errorMessage.includes("Network error")) {
        notify("error", "Failed to create dunning case", {
          description: errorMessage,
          duration: 6000,
        })
      }
    }
  }

  const handleReset = () => {
    setFormData({
      customerId: 0,
      postpaidBillId: 0,
      outstandingAmount: 0,
      stage: "SoftReminder",
      assignedToUserId: 0,
      nextActionDueAtUtc: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      notes: "",
    })
    setPaymentReference("")
    setCustomerReference("")
    setBillInfo(null)
    setCustomerInfo(null)
    setSelectedBill(null)
    setIdentifierType("postpaidBill")
    setFormErrors({})
    dispatch(clearCreateState())
    dispatch(clearCurrentBillByReference())
    dispatch(clearCustomerLookup())
  }

  // Fetch agents on component mount
  useEffect(() => {
    if (!agentsLoading && agents.length === 0) {
      dispatch(
        fetchAgents({
          pageNumber: 1,
          pageSize: 50,
        })
      )
    }
  }, [dispatch, agentsLoading, agents.length])

  const isFormValid = (): boolean => {
    const baseValidation =
      formData.outstandingAmount > 0 &&
      !!formData.stage &&
      formData.assignedToUserId > 0 &&
      formData.nextActionDueAtUtc !== "" &&
      formData.notes.trim().length >= 10

    if (identifierType === "postpaidBill") {
      return baseValidation && paymentReference.trim() !== "" && billInfo !== null
    } else {
      return baseValidation && customerReference.trim() !== "" && customerInfo !== null && formData.postpaidBillId > 0
    }
  }

  // Handle success state
  useEffect(() => {
    if (createSuccess) {
      // Success is already handled in submitDunningCase
    }
  }, [createSuccess])

  // Handle errors
  useEffect(() => {
    if (createError) {
      notify("error", "Dunning case creation failed", {
        description: createError,
        duration: 6000,
      })
    }
  }, [createError])

  // Get customer status text for display
  const getCustomerStatusText = (status: string, isSuspended: boolean): string => {
    if (isSuspended) return "Suspended"
    return status || "Active"
  }

  // Get status text for display
  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return "Draft"
      case 1:
        return "Finalized"
      case 2:
        return "Paid"
      case 3:
        return "Overdue"
      default:
        return "Unknown"
    }
  }

  // Get the numeric value for form display
  const getStageNumericValue = (stage: DunningFormData["stage"]): number => {
    return reverseStageMap[stage] || 1
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 2xl:container xl:px-16">
            {/* Page Header */}
            <div className="flex w-full flex-col justify-between gap-4  sm:flex-row sm:items-center  md:my-8 ">
              <div className="flex flex-col">
                <h4 className="text-xl font-semibold sm:text-2xl">Create New Dunning Case</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  Create a new payment dunning case for overdue payments
                </p>
              </div>

              <motion.div
                className="flex flex-wrap items-center justify-start gap-2 sm:justify-end sm:gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule variant="outline" size="md" onClick={handleReset} disabled={creating}>
                  Reset Form
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={submitDunningCase}
                  disabled={!isFormValid() || creating}
                  icon={<AddIcon />}
                  iconPosition="start"
                >
                  {creating ? "Creating..." : "Create Case"}
                </ButtonModule>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="w-full   ">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-lg bg-white p-4 shadow-sm sm:p-6"
              >
                {/* Form Header */}
                <div className="mb-6 border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dunning Case Information</h3>
                  <p className="text-sm text-gray-600">Fill in all required fields to create a new dunning case</p>
                </div>

                {/* Dunning Case Form */}
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                  {/* Section 1: Reference Selection */}
                  <div className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6">
                    <div className="border-b pb-4">
                      <h4 className="text-lg font-medium text-gray-900">Reference Selection</h4>
                      <p className="text-sm text-gray-600">Select how you want to identify the overdue payment</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <FormSelectModule
                            label="Create Dunning Case By"
                            name="identifierType"
                            value={identifierType}
                            onChange={({ target }) => {
                              const value = target.value as "postpaidBill" | "customer"
                              setIdentifierType(value)
                              setFormErrors((prev) => ({ ...prev, paymentReference: "", customerReference: "" }))
                              setPaymentReference("")
                              setCustomerReference("")
                              setBillInfo(null)
                              setCustomerInfo(null)
                              setSelectedBill(null)
                            }}
                            options={[
                              { value: "postpaidBill", label: "Postpaid Bill Reference" },
                              { value: "customer", label: "Customer Reference" },
                            ]}
                          />
                        </div>

                        {identifierType === "postpaidBill" && (
                          <div className="space-y-2">
                            <FormInputModule
                              label="Payment Reference"
                              name="paymentReference"
                              type="text"
                              placeholder="Enter payment reference"
                              value={paymentReference}
                              onChange={(e) => setPaymentReference(e.target.value)}
                              error={formErrors.paymentReference}
                              required
                            />
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <ButtonModule
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={validatePaymentReference}
                                disabled={
                                  !paymentReference.trim() || isValidatingReference || currentBillByReferenceLoading
                                }
                                type="button"
                              >
                                {isValidatingReference || currentBillByReferenceLoading
                                  ? "Validating..."
                                  : "Validate Reference"}
                              </ButtonModule>
                              {billInfo && (
                                <ButtonModule
                                  variant="dangerSecondary"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() => {
                                    setPaymentReference("")
                                    setBillInfo(null)
                                    setFormData((prev) => ({
                                      ...prev,
                                      postpaidBillId: 0,
                                      customerId: 0,
                                      outstandingAmount: 0,
                                    }))
                                  }}
                                  type="button"
                                >
                                  Clear
                                </ButtonModule>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {identifierType === "customer" && (
                        <div className="space-y-2">
                          <FormInputModule
                            label="Customer Reference"
                            name="customerReference"
                            type="text"
                            placeholder="Enter customer reference (account number)"
                            value={customerReference}
                            onChange={(e) => setCustomerReference(e.target.value)}
                            error={formErrors.customerReference}
                            required
                          />
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <ButtonModule
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={validateCustomerReference}
                              disabled={!customerReference.trim() || isValidatingCustomer || customerLookupLoading}
                              type="button"
                            >
                              {isValidatingCustomer || customerLookupLoading ? "Validating..." : "Validate Customer"}
                            </ButtonModule>
                            {customerInfo && (
                              <ButtonModule
                                variant="dangerSecondary"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => {
                                  setCustomerReference("")
                                  setCustomerInfo(null)
                                  setSelectedBill(null)
                                  setFormData((prev) => ({
                                    ...prev,
                                    customerId: 0,
                                    postpaidBillId: 0,
                                    outstandingAmount: 0,
                                  }))
                                }}
                                type="button"
                              >
                                Clear
                              </ButtonModule>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bill Information Display */}
                      {billInfo && identifierType === "postpaidBill" && (
                        <div className="grid grid-cols-1 gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:grid-cols-2">
                          <div>
                            <h5 className="font-medium text-blue-800">Bill Information</h5>
                            <div className="mt-2 space-y-1 text-sm text-blue-700">
                              <p>
                                <strong>Customer:</strong> {billInfo.customerName}
                              </p>
                              <p>
                                <strong>Account No:</strong> {billInfo.customerAccountNumber}
                              </p>
                              <p>
                                <strong>Billing Period:</strong> {billInfo.period}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-blue-800">Payment Details</h5>
                            <div className="mt-2 space-y-1 text-sm text-blue-700">
                              <p>
                                <strong>Total Due:</strong> ₦{billInfo.totalDue.toLocaleString()}
                              </p>
                              <p>
                                <strong>Outstanding:</strong> ₦{billInfo.outstandingAmount.toLocaleString()}
                              </p>
                              <p>
                                <strong>Status:</strong> {getStatusText(billInfo.status)}
                              </p>
                              <p>
                                <strong>Bill ID:</strong> {billInfo.id}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Customer Information Display */}
                      {customerInfo && identifierType === "customer" && (
                        <div className="grid grid-cols-1 gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:grid-cols-2">
                          <div>
                            <h5 className="font-medium text-blue-800">Customer Information</h5>
                            <div className="mt-2 space-y-1 text-sm text-blue-700">
                              <p>
                                <strong>Name:</strong> {customerInfo.fullName}
                              </p>
                              <p>
                                <strong>Account No:</strong> {customerInfo.accountNumber}
                              </p>
                              <p>
                                <strong>Phone:</strong> {customerInfo.phoneNumber}
                              </p>
                              <p>
                                <strong>Email:</strong> {customerInfo.email}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-blue-800">Account Details</h5>
                            <div className="mt-2 space-y-1 text-sm text-blue-700">
                              <p>
                                <strong>Status:</strong>{" "}
                                {getCustomerStatusText(customerInfo.status, customerInfo.isSuspended)}
                              </p>
                              <p>
                                <strong>Area Office:</strong> {customerInfo.areaOfficeName}
                              </p>
                              <p>
                                <strong>Feeder:</strong> {customerInfo.feederName}
                              </p>
                              <p>
                                <strong>Outstanding Balance:</strong> ₦
                                {customerInfo.customerOutstandingDebtBalance?.toLocaleString() ?? "0"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 2: Bill Selection (for customer type) */}
                  {identifierType === "customer" && customerInfo && (
                    <div className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Bill Selection</h4>
                        <p className="text-sm text-gray-600">Select the overdue bill for this dunning case</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:gap-6 ">
                        <FormSelectModule
                          label="Select Postpaid Bill"
                          name="postpaidBillId"
                          value={formData.postpaidBillId}
                          onChange={handleInputChange}
                          options={[
                            { value: 0, label: billsLoading ? "Loading bills..." : "Select a bill" },
                            ...billOptions,
                          ]}
                          error={formErrors.postpaidBillId}
                          required
                          disabled={billsLoading || billOptions.length === 0}
                        />

                        <FormInputModule
                          label="Outstanding Amount"
                          name="outstandingAmount"
                          type="number"
                          placeholder="Outstanding amount"
                          value={formData.outstandingAmount}
                          onChange={handleInputChange}
                          error={formErrors.outstandingAmount}
                          required
                          min="0.01"
                          step="0.01"
                          disabled={true} // Auto-populated from selected bill
                        />

                        {/* Selected Bill Information */}
                        {selectedBill && (
                          <div className="grid grid-cols-1 gap-4 rounded-lg border border-green-200 bg-green-50 p-4 sm:grid-cols-2">
                            <div>
                              <h5 className="font-medium text-green-800">Selected Bill Details</h5>
                              <div className="mt-2 space-y-1 text-sm text-green-700">
                                <p>
                                  <strong>Reference:</strong> {selectedBill.reference}
                                </p>
                                <p>
                                  <strong>Billing Period:</strong> {selectedBill.period}
                                </p>
                                <p>
                                  <strong>Due Date:</strong> {new Date(selectedBill.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-green-800">Payment Status</h5>
                              <div className="mt-2 space-y-1 text-sm text-green-700">
                                <p>
                                  <strong>Total Due:</strong> ₦{selectedBill.totalDue.toLocaleString()}
                                </p>
                                <p>
                                  <strong>Total Paid:</strong> ₦{selectedBill.totalPaid.toLocaleString()}
                                </p>
                                <p>
                                  <strong>Outstanding:</strong> ₦{selectedBill.outstandingAmount.toLocaleString()}
                                </p>
                                <p>
                                  <strong>Status:</strong> {getStatusText(selectedBill.status)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {billOptions.length === 0 && customerInfo && !billsLoading && (
                          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                            <div className="flex">
                              <div className="shrink-0">
                                <svg className="size-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path
                                    fillRule="evenodd"
                                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-amber-800">No overdue bills found</h3>
                                <div className="mt-2 text-sm text-amber-700">
                                  <p>This customer doesn&apos;t have any bills with outstanding amounts.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Dunning Case Details */}
                  <div className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6">
                    <div className="border-b pb-4">
                      <h4 className="text-lg font-medium text-gray-900">Dunning Case Details</h4>
                      <p className="text-sm text-gray-600">Configure the dunning case parameters</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <FormSelectModule
                        label="Dunning Stage"
                        name="stage"
                        value={getStageNumericValue(formData.stage)}
                        onChange={handleInputChange}
                        options={[{ value: "", label: "Select dunning stage" }, ...stageOptions]}
                        error={formErrors.stage}
                        required
                      />

                      <FormSelectModule
                        label="Assigned To"
                        name="assignedToUserId"
                        value={formData.assignedToUserId}
                        onChange={handleInputChange}
                        options={[
                          { value: 0, label: agentsLoading ? "Loading agents..." : "Select assigned user" },
                          ...agentOptions,
                        ]}
                        error={formErrors.assignedToUserId}
                        required
                        disabled={agentsLoading}
                      />

                      <FormInputModule
                        label="Next Action Due Date & Time"
                        name="nextActionDueAtUtc"
                        type="datetime-local"
                        value={formData.nextActionDueAtUtc}
                        onChange={handleInputChange}
                        error={formErrors.nextActionDueAtUtc}
                        required
                        placeholder={""}
                      />

                      <FormInputModule
                        label="Outstanding Amount"
                        name="outstandingAmount"
                        type="number"
                        placeholder="Outstanding amount"
                        value={formData.outstandingAmount}
                        onChange={handleInputChange}
                        error={formErrors.outstandingAmount}
                        required
                        min="0.01"
                        step="0.01"
                        disabled={
                          identifierType === "postpaidBill" || (identifierType === "customer" && selectedBill !== null)
                        }
                      />

                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm text-[#2a2f4b]">
                          Case Notes
                          <span className="text-red-500"> *</span>
                        </label>
                        <div
                          className={`
                            rounded-md border px-3 py-2
                            ${formErrors.notes ? "border-[#D14343]" : "border-[#E0E0E0]"}
                            bg-[#F9F9F9]
                          `}
                        >
                          <textarea
                            name="notes"
                            placeholder="Enter detailed notes about this dunning case (minimum 10 characters)"
                            value={formData.notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              handleInputChange({
                                target: { name: "notes", value: e.target.value },
                              })
                            }
                            rows={4}
                            required
                            className="w-full resize-y bg-transparent text-base outline-none"
                            aria-invalid={!!formErrors.notes}
                            aria-describedby={formErrors.notes ? "notes-error" : undefined}
                          />
                        </div>
                        {formErrors.notes && (
                          <p id="notes-error" className="mt-1 text-xs text-[#D14343]">
                            {formErrors.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error Summary */}
                  {Object.values(formErrors).some((e) => e) && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                      <div className="flex">
                        <div className="shrink-0">
                          <svg className="size-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        {Object.values(formErrors).some((e) => e) && (
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">Form validation errors</h3>
                            <div className="mt-2 text-sm text-amber-700">
                              <ul className="list-disc space-y-1 pl-5">
                                {Object.values(formErrors)
                                  .filter(Boolean)
                                  .map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {createSuccess && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex">
                        <div className="shrink-0">
                          <svg className="size-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-emerald-800">Dunning case created successfully!</h3>
                          <div className="mt-2 text-sm text-emerald-700">
                            <p>Redirecting to dunning cases list...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex flex-col justify-end gap-3 border-t pt-6 sm:flex-row sm:gap-4">
                    <ButtonModule
                      variant="dangerSecondary"
                      size="lg"
                      className="w-full sm:w-auto sm:min-w-[120px]"
                      onClick={handleReset}
                      disabled={creating}
                      type="button"
                    >
                      Reset
                    </ButtonModule>
                    <ButtonModule
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto sm:min-w-[180px]"
                      type="submit"
                      disabled={!isFormValid() || creating}
                    >
                      {creating ? "Creating..." : "Create Case"}
                    </ButtonModule>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AddDunningCasePage
