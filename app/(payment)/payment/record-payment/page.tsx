"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { notify } from "components/ui/Notification/Notification"
import { AddIcon } from "components/Icons/Icons"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearCreatePayment, createPayment, fetchPaymentChannels, type VirtualAccount } from "lib/redux/paymentSlice"
import BankTransferDetailsModal from "components/ui/Modal/bank-transfer-details-modal"
import { fetchVendors } from "lib/redux/vendorSlice"
import { CollectorType, fetchAgents, PaymentChannel } from "lib/redux/agentSlice"
import { fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import { clearCurrentBillByReference, fetchPostpaidBillByReference } from "lib/redux/postpaidSlice"
import { clearCustomerLookup, lookupCustomer } from "lib/redux/customerSlice"
import { ArrowLeft, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { VscChevronLeft, VscChevronRight } from "react-icons/vsc"

interface PaymentFormData {
  postpaidBillId: number
  customerId: number
  latitude: number
  longitude: number
  paymentTypeId: number
  amount: number
  channel: PaymentChannel
  currency: string
  externalReference: string
  narrative: string
  paidAtUtc: string
  agentId: number
  vendorId: number
  collectorType: "Customer" | "Agent" | "Vendor" | "Staff"
}

interface BillInfo {
  id: number
  customerName: string
  customerAccountNumber: string
  period: string
  totalDue: number
  status: number
}

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

// Channel mapping utilities
const channelMap = {
  1: PaymentChannel.Cash,
  2: PaymentChannel.BankTransfer,
  3: PaymentChannel.Pos,
  4: PaymentChannel.Card,
  5: PaymentChannel.VendorWallet,
  6: PaymentChannel.Cheque,
  7: PaymentChannel.BankDeposit,
  8: PaymentChannel.Vendor,
  9: PaymentChannel.Migration,
}

const reverseChannelMap = {
  [PaymentChannel.Cash]: 1,
  [PaymentChannel.BankTransfer]: 2,
  [PaymentChannel.Pos]: 3,
  [PaymentChannel.Card]: 4,
  [PaymentChannel.VendorWallet]: 5,
  [PaymentChannel.Cheque]: 6,
  [PaymentChannel.BankDeposit]: 7,
  [PaymentChannel.Vendor]: 8,
  [PaymentChannel.Migration]: 9,
}

const AddPaymentPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const {
    createPaymentLoading,
    createPaymentError,
    createPaymentSuccess,
    createdPayment,
    paymentChannels,
    paymentChannelsLoading,
  } = useSelector((state: RootState) => state.payments)

  const channelOptions = [
    { value: "", label: paymentChannelsLoading ? "Loading channels..." : "Select payment channel" },
    ...(paymentChannels || []).map((channel, index) => ({
      value: index + 1,
      label: channel,
    })),
  ]

  const { vendors, loading: vendorsLoading, error: vendorsError } = useSelector((state: RootState) => state.vendors)
  const { agents, loading: agentsLoading } = useSelector((state: RootState) => state.agents)
  const { paymentTypes, loading: paymentTypesLoading } = useSelector((state: RootState) => state.paymentTypes)
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
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null)
  const [isVirtualAccountModalOpen, setIsVirtualAccountModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [amountInput, setAmountInput] = useState("")
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)

  const [formData, setFormData] = useState<PaymentFormData>({
    postpaidBillId: 0,
    customerId: 0,
    latitude: 0,
    longitude: 0,
    paymentTypeId: 1,
    amount: 0,
    channel: PaymentChannel.Cash,
    currency: "NGN",
    externalReference: "",
    narrative: "",
    paidAtUtc: new Date().toISOString().slice(0, 16),
    agentId: 0,
    vendorId: 0,
    collectorType: "Staff",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Collector type options
  const collectorTypeOptions = [
    { value: "Staff", label: "Staff" },
    { value: "Vendor", label: "Vendor" },
    { value: "Agent", label: "Sales Rep" },
  ]

  const vendorOptions = vendors.map((vendor) => ({ value: vendor.id, label: vendor.name }))
  const agentOptions = agents.map((agent) => ({ value: agent.id, label: agent.user.fullName }))

  // Currency options
  const currencyOptions = [{ value: "NGN", label: "NGN - Nigerian Naira" }]
  const paymentTypeOptions = paymentTypes
    .filter((paymentType) => paymentType.isActive)
    .map((paymentType) => ({ value: paymentType.id, label: paymentType.name }))

  const energyBillPaymentType = paymentTypes.find((paymentType) => paymentType.name.toLowerCase() === "bills payment")

  // Validate payment reference
  const validatePaymentReference = async () => {
    if (!paymentReference.trim()) {
      setFormErrors((prev) => ({ ...prev, paymentReference: "Payment reference is required" }))
      return
    }

    setIsValidatingReference(true)
    setFormErrors((prev) => ({ ...prev, paymentReference: "" }))
    setBillInfo(null)

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
        })

        // Auto-populate the bill ID and amount
        setFormData((prev) => ({
          ...prev,
          postpaidBillId: result.id,
          amount: result.totalDue,
        }))
        setAmountInput(result.totalDue.toLocaleString())

        notify("success", "Bill validated successfully", {
          description: `Bill found for ${result.customerName}`,
          duration: 3000,
        })

        // Move to next step on mobile
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          nextStep()
        }
      }
    } catch (error: any) {
      setFormErrors((prev) => ({
        ...prev,
        paymentReference: error || "Invalid payment reference",
      }))
      setBillInfo(null)
      setFormData((prev) => ({
        ...prev,
        postpaidBillId: 1,
        amount: 0,
      }))
      setAmountInput("")
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
          state: result.provinceName,
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

        notify("success", "Customer validated successfully", {
          description: `Customer found: ${result.fullName}`,
          duration: 3000,
        })

        // Move to next step on mobile
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          nextStep()
        }
      }
    } catch (error: any) {
      setFormErrors((prev) => ({
        ...prev,
        customerReference: error || "Invalid customer reference",
      }))
      setCustomerInfo(null)
      setFormData((prev) => ({
        ...prev,
        customerId: 0,
      }))
    } finally {
      setIsValidatingCustomer(false)
    }
  }

  // Clear bill info when reference changes
  useEffect(() => {
    if (!paymentReference.trim()) {
      setBillInfo(null)
      setFormData((prev) => ({
        ...prev,
        postpaidBillId: 0,
        amount: 0,
      }))
      setAmountInput("")
      setFormErrors((prev) => ({ ...prev, paymentReference: "" }))
    }
  }, [paymentReference])

  // Clear customer info when reference changes
  useEffect(() => {
    if (!customerReference.trim()) {
      setCustomerInfo(null)
      setFormData((prev) => ({
        ...prev,
        customerId: 0,
      }))
      setFormErrors((prev) => ({ ...prev, customerReference: "" }))
    }
  }, [customerReference])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    let processedValue = value

    // Handle number fields
    if (
      [
        "postpaidBillId",
        "customerId",
        "latitude",
        "longitude",
        "paymentTypeId",
        "amount",
        "agentId",
        "vendorId",
      ].includes(name)
    ) {
      processedValue = value === "" ? 0 : Number(value)
    }

    // Handle channel field - convert numeric value to string type
    if (name === "channel") {
      const numericValue = Number(value)
      processedValue = channelMap[numericValue as keyof typeof channelMap] || PaymentChannel.Cash
    }

    // Handle date field
    if (name === "paidAtUtc") {
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
  }

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}

    switch (currentStep) {
      case 1: // Reference Validation
        if (identifierType === "postpaidBill") {
          if (!paymentReference.trim()) {
            errors.paymentReference = "Payment reference is required"
          } else if (!billInfo) {
            errors.paymentReference = "Please validate the payment reference first"
          } else if (formData.postpaidBillId === 0) {
            errors.paymentReference = "Valid bill ID not found"
          }
        } else if (identifierType === "customer") {
          if (!customerReference.trim()) {
            errors.customerReference = "Customer reference is required"
          } else if (!customerInfo) {
            errors.customerReference = "Please validate the customer reference first"
          } else if (formData.customerId === 0) {
            errors.customerReference = "Valid customer ID not found"
          }
        }
        break

      case 2: // Payment Details
        if (identifierType === "customer" && formData.paymentTypeId === 0) {
          errors.paymentTypeId = "Payment Type is required"
        }

        if (formData.amount <= 0) {
          errors.amount = "Amount must be greater than 0"
        }

        if (!formData.channel) {
          errors.channel = "Payment channel is required"
        }

        if (!formData.currency) {
          errors.currency = "Currency is required"
        }

        if (!formData.paidAtUtc) {
          errors.paidAtUtc = "Payment date and time is required"
        } else {
          const paymentDate = new Date(formData.paidAtUtc)
          const now = new Date()
          if (paymentDate > now) {
            errors.paidAtUtc = "Payment date cannot be in the future"
          }
        }
        break

      case 3: // Collector Information
        if (!formData.collectorType) {
          errors.collectorType = "Collector type is required"
        }

        if (formData.collectorType === "Vendor" && formData.vendorId <= 0) {
          errors.vendorId = "Vendor is required when collector type is Vendor"
        }

        if (formData.collectorType === "Agent" && formData.agentId <= 0) {
          errors.agentId = "Agent is required when collector type is Agent"
        }
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
      setIsMobileSidebarOpen(false)
    } else {
      notify("error", "Please fix the form errors before continuing", {
        description: "Some required fields are missing or contain invalid data",
        duration: 4000,
      })
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const submitPayment = async () => {
    if (!validateCurrentStep()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      // Prepare the data for API
      const { postpaidBillId, customerId, agentId, vendorId, ...rest } = formData

      // Ensure paymentTypeId is never 0 in the payload
      const resolvedPaymentTypeId =
        identifierType === "postpaidBill" ? energyBillPaymentType?.id ?? 1 : formData.paymentTypeId

      const paymentData = {
        ...rest,
        paymentTypeId: resolvedPaymentTypeId,
        ...(identifierType === "postpaidBill" && { postpaidBillId }),
        ...(identifierType === "customer" && { customerId }),
        // Only include optional fields if they have values
        ...(formData.externalReference && { externalReference: formData.externalReference }),
        ...(formData.narrative && { narrative: formData.narrative }),
        // Always send agentId/vendorId as either a valid ID or null so backend does not see 0
        agentId: formData.collectorType === "Agent" && agentId && agentId > 0 ? agentId : null,
        vendorId: formData.collectorType === "Vendor" && vendorId && vendorId > 0 ? vendorId : null,
        // Map form collectorType to correct CollectorType enum
        collectorType:
          formData.collectorType === "Agent"
            ? CollectorType.SalesRep
            : formData.collectorType === "Vendor"
            ? CollectorType.Vendor
            : CollectorType.Customer,
      }

      const result = await dispatch(createPayment(paymentData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Payment recorded successfully", {
          description: `Payment of ${formData.amount} ${formData.currency} has been recorded`,
          duration: 5000,
        })

        setIsSuccessModalOpen(true)

        if (result.data?.channel === PaymentChannel.BankTransfer && result.data.virtualAccount) {
          setVirtualAccount(result.data.virtualAccount)
          setIsVirtualAccountModalOpen(true)
        } else {
          setVirtualAccount(null)
          setIsVirtualAccountModalOpen(false)
        }
      }
    } catch (error: any) {
      console.error("Failed to record payment:", error)
      if (!error?.includes("Network error")) {
        notify("error", "Failed to record payment", {
          description: error || "An unexpected error occurred",
          duration: 6000,
        })
      }
    }
  }

  const handleCheckPayment = async () => {
    if (!createdPayment?.reference) return

    setIsCheckingPayment(true)
    try {
      // For now, just simulate checking payment
      // In a real implementation, you would call an API to check payment status
      await new Promise((resolve) => setTimeout(resolve, 2000))
      notify("success", "Payment confirmed!", {
        description: "Your payment has been confirmed and processed successfully.",
        duration: 5000,
      })
      setIsVirtualAccountModalOpen(false)
      setIsSuccessModalOpen(true)
    } catch (error: any) {
      notify("error", "Failed to check payment", {
        description: error || "Unable to verify payment status",
        duration: 4000,
      })
    } finally {
      setIsCheckingPayment(false)
    }
  }

  const handleConfirmPayment = () => {
    setIsVirtualAccountModalOpen(false)
    setIsSuccessModalOpen(true)
  }

  const handleReset = () => {
    setFormData({
      postpaidBillId: 0,
      customerId: 0,
      latitude: 0,
      longitude: 0,
      paymentTypeId: 1,
      amount: 0,
      channel: PaymentChannel.Cash,
      currency: "NGN",
      externalReference: "",
      narrative: "",
      paidAtUtc: new Date().toISOString().slice(0, 16),
      agentId: 0,
      vendorId: 0,
      collectorType: "Staff",
    })
    setAmountInput("")
    setPaymentReference("")
    setCustomerReference("")
    setBillInfo(null)
    setCustomerInfo(null)
    setVirtualAccount(null)
    setIsVirtualAccountModalOpen(false)
    setIsSuccessModalOpen(false)
    setIdentifierType("postpaidBill")
    setFormErrors({})
    setCurrentStep(1)
    dispatch(clearCreatePayment())
    dispatch(clearCurrentBillByReference())
    dispatch(clearCustomerLookup())
  }

  useEffect(() => {
    if (!paymentTypesLoading && paymentTypes.length === 0) {
      dispatch(fetchPaymentTypes())
    }
  }, [dispatch, paymentTypesLoading, paymentTypes.length])

  useEffect(() => {
    if (formData.collectorType === "Vendor") {
      if (!vendorsLoading && vendors.length === 0) {
        dispatch(
          fetchVendors({
            pageNumber: 1,
            pageSize: 50,
          })
        )
      }
    } else if (formData.vendorId > 0) {
      setFormData((prev) => ({ ...prev, vendorId: 0 }))
    }

    if (formData.collectorType === "Agent") {
      if (!agentsLoading && agents.length === 0) {
        dispatch(
          fetchAgents({
            pageNumber: 1,
            pageSize: 50,
          })
        )
      }
    } else if (formData.agentId > 0) {
      setFormData((prev) => ({ ...prev, agentId: 0 }))
    }
  }, [
    dispatch,
    formData.collectorType,
    formData.vendorId,
    formData.agentId,
    vendors.length,
    vendorsLoading,
    agents.length,
    agentsLoading,
  ])

  const isReferenceVerified =
    identifierType === "postpaidBill"
      ? !!billInfo && formData.postpaidBillId !== 0
      : !!customerInfo && formData.customerId !== 0

  // Automatically set default payment type for postpaid bills when payment types are loaded
  useEffect(() => {
    if (identifierType === "postpaidBill" && energyBillPaymentType && formData.paymentTypeId === 0) {
      setFormData((prev) => ({ ...prev, paymentTypeId: energyBillPaymentType.id }))
    }
  }, [identifierType, energyBillPaymentType, formData.paymentTypeId])

  // Handle success state
  useEffect(() => {
    if (createPaymentSuccess && createdPayment) {
      // Success is already handled in submitPayment
    }
  }, [createPaymentSuccess, createdPayment])

  // Handle errors
  useEffect(() => {
    if (createPaymentError) {
      notify("error", "Payment recording failed", {
        description: createPaymentError,
        duration: 6000,
      })
    }
  }, [createPaymentError])

  // Fetch payment channels
  useEffect(() => {
    dispatch(fetchPaymentChannels())
  }, [dispatch])

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

  // Get customer status text for display
  const getCustomerStatusText = (status: string, isSuspended: boolean): string => {
    if (isSuspended) return "Suspended"
    return status || "Active"
  }

  // Get the numeric value for form display
  const getChannelNumericValue = (channel: PaymentFormData["channel"]): number => {
    return reverseChannelMap[channel] || 1
  }

  // Step progress component for desktop
  const StepProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full border-2 ${
                  step === currentStep
                    ? "border-[#004B23] bg-[#004B23] text-white"
                    : step < currentStep
                    ? "border-[#004B23] bg-[#004B23] text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step < currentStep ? (
                  <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`mt-2 hidden text-xs font-medium md:block ${
                  step === currentStep ? "text-[#004B23]" : "text-gray-500"
                }`}
              >
                {step === 1 && "Reference"}
                {step === 2 && "Payment"}
                {step === 3 && "Collector"}
              </span>
            </div>
            {step < 3 && <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#004B23]" : "bg-gray-300"}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )

  // Mobile Step Navigation
  const MobileStepNavigation = () => (
    <div className="sticky top-0 z-40 mb-4 rounded-lg bg-white p-3 shadow-sm sm:hidden">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
          onClick={() => setIsMobileSidebarOpen(true)}
        >
          <Menu className="size-4" />
          <span>Step {currentStep}/3</span>
        </button>
        <div className="text-sm font-medium text-gray-900">
          {currentStep === 1 && "Reference"}
          {currentStep === 2 && "Payment"}
          {currentStep === 3 && "Collector"}
        </div>
      </div>
    </div>
  )

  // Mobile Sidebar Component
  const MobileStepSidebar = () => (
    <AnimatePresence>
      {isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 sm:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-xl sm:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Steps</h3>
                  <button
                    type="button"
                    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-600">Navigate through form steps</p>
              </div>

              {/* Steps List */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2">
                  {[
                    { step: 1, title: "Reference Validation", description: "Validate bill or customer" },
                    { step: 2, title: "Payment Details", description: "Amount, channel, and date" },
                    { step: 3, title: "Collector Information", description: "Who collected payment" },
                  ].map((item) => (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => {
                        setCurrentStep(item.step)
                        setIsMobileSidebarOpen(false)
                      }}
                      className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                        item.step === currentStep ? "bg-[#004B23] text-white" : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`flex size-7 flex-shrink-0 items-center justify-center rounded-full ${
                          item.step === currentStep
                            ? "bg-white text-[#004B23]"
                            : item.step < currentStep
                            ? "bg-[#004B23] text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.step < currentStep ? (
                          <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          item.step
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`text-sm font-medium ${
                            item.step === currentStep ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.title}
                        </div>
                        <div
                          className={`mt-1 text-xs ${item.step === currentStep ? "text-gray-200" : "text-gray-600"}`}
                        >
                          {item.description}
                        </div>
                      </div>
                      {item.step === currentStep && <ChevronRight className="size-4 flex-shrink-0" />}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="border-t bg-gray-50 p-4">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={createPaymentLoading}
                    className="w-full rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-900"
                  >
                    Close Menu
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  const isFormValid = (): boolean => {
    const baseValidation =
      formData.amount > 0 &&
      !!formData.channel &&
      formData.currency !== "" &&
      !!formData.collectorType &&
      formData.paidAtUtc !== ""

    if (identifierType === "postpaidBill") {
      return baseValidation && paymentReference.trim() !== "" && isReferenceVerified
    } else {
      return baseValidation && formData.paymentTypeId > 0 && customerReference.trim() !== "" && isReferenceVerified
    }
  }

  // Mobile Bottom Navigation Bar
  const MobileBottomNavigation = () => (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 shadow-lg sm:hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              disabled={createPaymentLoading}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={createPaymentLoading}
            className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        <div className="flex gap-2">
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={createPaymentLoading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submitPayment}
              disabled={!isFormValid() || createPaymentLoading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createPaymentLoading ? "Processing..." : "Record Payment"}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 lg:container md:px-4 lg:px-6 2xl:px-16">
            {/* Page Header - Mobile Optimized */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 sm:hidden"
                    aria-label="Go back"
                  >
                    <ArrowLeft />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Record New Payment</h1>
                    <p className="text-sm text-gray-600">Record a new payment transaction in the system</p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule variant="outline" size="sm" onClick={handleReset} disabled={createPaymentLoading}>
                    Reset Form
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    onClick={submitPayment}
                    disabled={!isFormValid() || createPaymentLoading}
                    icon={<AddIcon />}
                    iconPosition="start"
                  >
                    {createPaymentLoading ? "Processing..." : "Record Payment"}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Mobile Step Navigation */}
            <MobileStepNavigation />

            {/* Mobile Step Sidebar */}
            <MobileStepSidebar />

            {/* Main Content Area */}
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg bg-white p-4 shadow-sm sm:p-6"
              >
                {/* Form Header */}
                <div className="mb-6 border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                  <p className="text-sm text-gray-600">Fill in all required fields to record a new payment</p>
                </div>

                {/* Desktop Step Progress */}
                <div className="hidden sm:block">
                  <StepProgress />
                </div>

                {/* Payment Form */}
                <form
                  id="payment-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (currentStep < 3) {
                      nextStep()
                    } else {
                      submitPayment()
                    }
                  }}
                  className="space-y-6"
                >
                  <AnimatePresence mode="wait">
                    {/* Step 1: Reference Validation */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Reference Validation</h4>
                          <p className="text-sm text-gray-600">Validate bill or customer reference before proceeding</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormSelectModule
                            label="Record Payment By"
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

                              // Reset payment type appropriately when switching modes
                              setFormData((prev) => ({
                                ...prev,
                                paymentTypeId:
                                  value === "customer" ? 0 : energyBillPaymentType ? energyBillPaymentType.id : 0,
                              }))
                            }}
                            options={[
                              { value: "postpaidBill", label: "Postpaid Bill" },
                              { value: "customer", label: "Customer" },
                            ]}
                          />

                          {identifierType === "postpaidBill" && (
                            <div className="space-y-2">
                              <FormInputModule
                                label="Payment Bill"
                                name="paymentReference"
                                type="text"
                                placeholder="Enter payment bill"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                error={formErrors.paymentReference}
                                required
                              />
                              <div className="flex flex-wrap justify-end gap-2">
                                <ButtonModule
                                  variant="outline"
                                  size="sm"
                                  onClick={validatePaymentReference}
                                  disabled={
                                    !paymentReference.trim() || isValidatingReference || currentBillByReferenceLoading
                                  }
                                  type="button"
                                >
                                  {isValidatingReference || currentBillByReferenceLoading
                                    ? "Validating..."
                                    : "Validate Bill"}
                                </ButtonModule>
                                {billInfo && (
                                  <ButtonModule
                                    variant="dangerSecondary"
                                    size="sm"
                                    onClick={() => {
                                      setPaymentReference("")
                                      setBillInfo(null)
                                      setFormData((prev) => ({ ...prev, postpaidBillId: 0, amount: 0 }))
                                    }}
                                    type="button"
                                  >
                                    Clear
                                  </ButtonModule>
                                )}
                              </div>
                            </div>
                          )}

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
                              <div className="flex flex-wrap justify-end gap-2">
                                <ButtonModule
                                  variant="outline"
                                  size="sm"
                                  onClick={validateCustomerReference}
                                  disabled={!customerReference.trim() || isValidatingCustomer || customerLookupLoading}
                                  type="button"
                                >
                                  {isValidatingCustomer || customerLookupLoading
                                    ? "Validating..."
                                    : "Validate Customer"}
                                </ButtonModule>
                                {customerInfo && (
                                  <ButtonModule
                                    variant="dangerSecondary"
                                    size="sm"
                                    onClick={() => {
                                      setCustomerReference("")
                                      setCustomerInfo(null)
                                      setFormData((prev) => ({ ...prev, customerId: 0 }))
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
                          {billInfo && (
                            <div className="col-span-2 grid grid-cols-1 gap-4 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
                              <div>
                                <h5 className="text-sm font-medium text-blue-800 sm:text-base">Bill Information</h5>
                                <div className="mt-2 space-y-1 text-xs text-blue-700 sm:text-sm">
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
                                <h5 className="text-sm font-medium text-blue-800 sm:text-base">Payment Details</h5>
                                <div className="mt-2 space-y-1 text-xs text-blue-700 sm:text-sm">
                                  <p>
                                    <strong>Total Due:</strong> ₦{billInfo.totalDue.toLocaleString()}
                                  </p>
                                  <p>
                                    <strong>Status:</strong> {getStatusText(billInfo.status)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Customer Information Display */}
                          {customerInfo && (
                            <div className="col-span-2 grid w-full grid-cols-2 gap-4 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
                              <div>
                                <h5 className="text-sm font-medium text-blue-800 sm:text-base">Customer Information</h5>
                                <div className="mt-2 space-y-1 text-xs text-blue-700 sm:text-sm">
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
                                <h5 className="text-sm font-medium text-blue-800 sm:text-base">Account Details</h5>
                                <div className="mt-2 space-y-1 text-xs text-blue-700 sm:text-sm">
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
                                    {customerInfo.customerOutstandingDebtBalance != null
                                      ? customerInfo.customerOutstandingDebtBalance.toLocaleString()
                                      : "0"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Payment Details */}
                    {currentStep === 2 && isReferenceVerified && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Payment Details</h4>
                          <p className="text-sm text-gray-600">Specify payment amount, channel, and date</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          {identifierType === "customer" && (
                            <FormSelectModule
                              label="Payment Type"
                              name="paymentTypeId"
                              value={formData.paymentTypeId}
                              onChange={handleInputChange}
                              options={[
                                {
                                  value: 0,
                                  label: paymentTypesLoading ? "Loading payment types..." : "Select payment type",
                                },
                                ...paymentTypeOptions,
                              ]}
                              error={formErrors.paymentTypeId}
                              required
                            />
                          )}

                          <FormInputModule
                            label="Amount"
                            name="amount"
                            type="text"
                            placeholder="Enter payment amount"
                            value={amountInput}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/,/g, "").trim()

                              if (raw === "") {
                                setAmountInput("")
                                setFormData((prev) => ({
                                  ...prev,
                                  amount: 0,
                                }))
                                return
                              }

                              // Allow only digits and optional decimal point
                              if (!/^\d*(\.\d*)?$/.test(raw)) {
                                return
                              }

                              const numeric = Number(raw)
                              setFormData((prev) => ({
                                ...prev,
                                amount: Number.isNaN(numeric) ? 0 : numeric,
                              }))

                              const [intPart, decimalPart] = raw.split(".")
                              const formattedInt = intPart ? Number(intPart).toLocaleString() : ""
                              const formatted =
                                decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt
                              setAmountInput(formatted)
                            }}
                            error={formErrors.amount}
                            required
                            min="0.01"
                            step="0.01"
                            prefix="₦"
                          />

                          <FormSelectModule
                            label="Payment Channel"
                            name="channel"
                            value={getChannelNumericValue(formData.channel)}
                            onChange={handleInputChange}
                            options={channelOptions}
                            error={formErrors.channel}
                            required
                          />

                          <FormInputModule
                            label="Payment Date & Time"
                            name="paidAtUtc"
                            type="datetime-local"
                            value={formData.paidAtUtc}
                            onChange={handleInputChange}
                            error={formErrors.paidAtUtc}
                            required
                            placeholder={""}
                            max={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Collector Information */}
                    {currentStep === 3 && isReferenceVerified && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Collector Information</h4>
                          <p className="text-sm text-gray-600">Specify who collected this payment</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormSelectModule
                            label="Collector Type"
                            name="collectorType"
                            value={formData.collectorType}
                            onChange={handleInputChange}
                            options={collectorTypeOptions}
                            error={formErrors.collectorType}
                            required
                          />

                          {formData.collectorType === "Agent" && (
                            <FormSelectModule
                              label="Agent"
                              name="agentId"
                              value={formData.agentId}
                              onChange={handleInputChange}
                              options={[
                                { value: 0, label: agentsLoading ? "Loading agents..." : "Select agent" },
                                ...agentOptions,
                              ]}
                              error={formErrors.agentId}
                              required
                              disabled={agentsLoading}
                            />
                          )}

                          {formData.collectorType === "Vendor" && (
                            <FormSelectModule
                              label="Vendor"
                              name="vendorId"
                              value={formData.vendorId}
                              onChange={handleInputChange}
                              options={[
                                { value: 0, label: vendorsLoading ? "Loading vendors..." : "Select vendor" },
                                ...vendorOptions,
                              ]}
                              error={formErrors.vendorId}
                              required
                              disabled={vendorsLoading}
                            />
                          )}

                          {/* Additional Information */}
                          <div className="col-span-2 space-y-4">
                            <h5 className="text-sm font-medium text-gray-700">Additional Information</h5>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <FormInputModule
                                label="External Reference (Optional)"
                                name="externalReference"
                                type="text"
                                placeholder="Enter external reference number"
                                value={formData.externalReference}
                                onChange={handleInputChange}
                              />

                              <FormTextAreaModule
                                label="Narrative (Optional)"
                                name="narrative"
                                placeholder="Enter payment description or notes"
                                value={formData.narrative}
                                onChange={(e) =>
                                  handleInputChange({
                                    target: { name: "narrative", value: e.target.value },
                                  })
                                }
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Summary */}
                  {Object.values(formErrors).some((error) => error && error.trim() !== "") && (
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
                          <h3 className="text-sm font-medium text-amber-800">Form validation errors</h3>
                          <div className="mt-2 text-sm text-amber-700">
                            <ul className="list-disc space-y-1 pl-5">
                              {Object.values(formErrors).map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {createPaymentSuccess && createdPayment && (
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
                          <h3 className="text-sm font-medium text-emerald-800">Payment recorded successfully!</h3>
                          <div className="mt-2 text-sm text-emerald-700">
                            <p>
                              Reference: <strong>{createdPayment.reference}</strong>
                            </p>
                            <p>
                              Amount:{" "}
                              <strong>
                                {createdPayment.amount} {createdPayment.currency}
                              </strong>
                            </p>
                            <p className="mt-1">Redirecting to payment details...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Desktop Form Actions */}
                  <div className="hidden justify-between gap-4 border-t pt-6 sm:flex">
                    <div className="flex gap-4">
                      {currentStep > 1 && (
                        <ButtonModule
                          variant="outline"
                          size="md"
                          onClick={prevStep}
                          disabled={createPaymentLoading}
                          type="button"
                          icon={<VscChevronLeft />}
                          iconPosition="start"
                        >
                          Previous
                        </ButtonModule>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <ButtonModule
                        variant="dangerSecondary"
                        size="md"
                        onClick={handleReset}
                        disabled={createPaymentLoading}
                        type="button"
                      >
                        Reset
                      </ButtonModule>

                      {currentStep < 3 ? (
                        <ButtonModule
                          variant="primary"
                          size="md"
                          onClick={nextStep}
                          type="button"
                          icon={<VscChevronRight />}
                          iconPosition="end"
                        >
                          Next
                        </ButtonModule>
                      ) : (
                        <ButtonModule
                          variant="primary"
                          size="md"
                          type="button"
                          onClick={submitPayment}
                          disabled={!isFormValid() || createPaymentLoading}
                        >
                          {createPaymentLoading ? "Recording Payment..." : "Record Payment"}
                        </ButtonModule>
                      )}
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation />

      <BankTransferDetailsModal
        isOpen={isVirtualAccountModalOpen}
        onRequestClose={() => setIsVirtualAccountModalOpen(false)}
        virtualAccount={virtualAccount}
        paymentData={
          createdPayment
            ? {
                reference: createdPayment.reference,
                amount: createdPayment.amount || createdPayment.totalAmountPaid,
                currency: createdPayment.currency,
                customerName: createdPayment.customerName,
                customerAccountNumber: createdPayment.customerAccountNumber,
                customerAddress: createdPayment.customerAddress,
                customerPhoneNumber: createdPayment.customerPhoneNumber,
                customerMeterNumber: createdPayment.customerMeterNumber,
                accountType: createdPayment.accountType,
                tariffRate: createdPayment.tariffRate,
                units: createdPayment.units,
                vatRate: createdPayment.vatRate,
                vatAmount: createdPayment.vatAmount,
                electricityAmount: createdPayment.electricityAmount,
                outstandingDebt: createdPayment.outstandingDebt,
                debtPayable: createdPayment.debtPayable,
                totalAmountPaid: createdPayment.totalAmountPaid,
                status: createdPayment.status,
                paymentTypeName: createdPayment.paymentTypeName,
              }
            : null
        }
        onCheckPayment={handleCheckPayment}
        onConfirm={handleConfirmPayment}
        isCheckingPayment={isCheckingPayment}
      />
      <AnimatePresence>
        {isSuccessModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm"
              onClick={() => setIsSuccessModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center px-4"
            >
              <div className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl">
                <div className="border-b bg-[#F9F9F9] p-6">
                  <h2 className="text-lg font-bold text-gray-900">Payment Recorded Successfully</h2>
                  <p className="mt-1 text-sm text-gray-600">The payment has been recorded in the system.</p>
                </div>
                <div className="space-y-3 p-6 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      {formData.amount.toLocaleString()} {formData.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Channel:</span>
                    <span className="font-semibold">{formData.channel}</span>
                  </div>
                  {identifierType === "customer" && customerInfo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-semibold">{customerInfo.fullName}</span>
                    </div>
                  )}
                </div>
                <div className="border-t bg-[#F9F9F9] p-6">
                  <div className="flex gap-3">
                    <ButtonModule
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setIsSuccessModalOpen(false)
                        if (createdPayment?.id) {
                          router.push(`/payment/payment-detail/${createdPayment.id}`)
                        } else {
                          router.push("/payment")
                        }
                      }}
                    >
                      Close
                    </ButtonModule>
                    <ButtonModule
                      variant="primary"
                      className="flex-1"
                      onClick={() => {
                        setIsSuccessModalOpen(false)
                        handleReset()
                      }}
                    >
                      Record Another Payment
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}

export default AddPaymentPage
