"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AppDispatch, RootState } from "lib/redux/store"
import {
  clearCreateRecoveryPolicyState,
  createRecoveryPolicy,
  CreateRecoveryPolicyRequest,
} from "lib/redux/debtManagementSlice"
import { Customer, fetchCustomers } from "lib/redux/customerSlice"

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { VscAdd, VscArrowLeft, VscArrowRight } from "react-icons/vsc"

interface RecoveryPolicyFormData {
  name: string
  customerId: number
  recoveryType: number
  recoveryValue: number
  triggerThresholdAmount: number
  minimumMonthlyRecovery: number
  minRecoveryAmount: number
  maxRecoveryAmount: number
  bucketName: string
  applyBeforeBill: boolean
  enforcementEnabled: boolean
  enforcementBucketName: string
  enforcementMinAgeDays: number
  enforcementMonthlyMinimum: number
  enforcementGraceDays: number
  enforcementMode: number
  enforcementStartAtUtc: string
  isActive: boolean
  isPaused: boolean
  effectiveFromUtc: string
  effectiveToUtc: string
}

const AddRecoveryPolicyPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const { createRecoveryPolicyLoading, createRecoveryPolicyError, createRecoveryPolicySuccess, createdRecoveryPolicy } =
    useSelector((state: RootState) => state.debtManagement)
  const { customers, loading: customersLoading } = useSelector((state: RootState) => state.customers)

  const [formData, setFormData] = useState<RecoveryPolicyFormData>({
    name: "",
    customerId: 0,
    recoveryType: 0,
    recoveryValue: 0,
    triggerThresholdAmount: 0,
    minimumMonthlyRecovery: 0,
    minRecoveryAmount: 0,
    maxRecoveryAmount: 0,
    bucketName: "",
    applyBeforeBill: false,
    enforcementEnabled: false,
    enforcementBucketName: "",
    enforcementMinAgeDays: 0,
    enforcementMonthlyMinimum: 0,
    enforcementGraceDays: 0,
    enforcementMode: 0,
    enforcementStartAtUtc: "",
    isActive: true,
    isPaused: false,
    effectiveFromUtc: "",
    effectiveToUtc: "",
  })

  // Fetch customers on component mount
  useEffect(() => {
    dispatch(fetchCustomers({ pageNumber: 1, pageSize: 1000 }))
  }, [dispatch])

  // Create customer options for dropdown
  const customerOptions = customers.map((customer: Customer) => ({
    value: customer.id,
    label: `${customer.fullName} (${customer.accountNumber})`,
  }))

  // Handle success and error states
  React.useEffect(() => {
    if (createRecoveryPolicySuccess) {
      notify("success", "Recovery policy created successfully", {
        description: `${formData.name} has been added to the system`,
        duration: 5000,
      })
      handleReset()
    }

    if (createRecoveryPolicyError) {
      notify("error", "Failed to create recovery policy", {
        description: createRecoveryPolicyError,
        duration: 6000,
      })
    }
  }, [createRecoveryPolicySuccess, createRecoveryPolicyError, formData.name])

  // Clear state when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearCreateRecoveryPolicyState())
    }
  }, [dispatch])

  // Options for dropdowns
  const recoveryTypeOptions = [
    { value: 0, label: "Select recovery type" },
    { value: 1, label: "Percent" },
    { value: 2, label: "Flat" },
  ]

  const enforcementModeOptions = [
    { value: 0, label: "Select enforcement mode" },
    { value: 1, label: "Warning" },
    { value: 2, label: "Restriction" },
    { value: 3, label: "Disconnection" },
  ]

  const booleanOptions = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields
    let processedValue = value
    if (
      [
        "customerId",
        "recoveryType",
        "recoveryValue",
        "triggerThresholdAmount",
        "minimumMonthlyRecovery",
        "minRecoveryAmount",
        "maxRecoveryAmount",
        "enforcementMinAgeDays",
        "enforcementMonthlyMinimum",
        "enforcementGraceDays",
        "enforcementMode",
      ].includes(name)
    ) {
      processedValue = value === "" ? 0 : Number(value)
    }

    // Handle boolean fields
    if (["applyBeforeBill", "enforcementEnabled", "isActive", "isPaused"].includes(name)) {
      processedValue = value === "true" || value === true
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
      case 1: // Basic Information
        if (!formData.name.trim()) errors.name = "Policy name is required"
        if (!formData.customerId || formData.customerId === 0) {
          errors.customerId = "Customer ID is required"
        }
        if (!formData.recoveryType || formData.recoveryType === 0) {
          errors.recoveryType = "Recovery type is required"
        }
        if (!formData.recoveryValue || formData.recoveryValue === 0) {
          errors.recoveryValue = "Recovery value is required"
        }
        break

      case 2: // Recovery Settings
        if (!formData.triggerThresholdAmount || formData.triggerThresholdAmount === 0) {
          errors.triggerThresholdAmount = "Trigger threshold amount is required"
        }
        if (!formData.minimumMonthlyRecovery || formData.minimumMonthlyRecovery === 0) {
          errors.minimumMonthlyRecovery = "Minimum monthly recovery is required"
        }
        if (!formData.minRecoveryAmount || formData.minRecoveryAmount === 0) {
          errors.minRecoveryAmount = "Minimum recovery amount is required"
        }
        if (!formData.maxRecoveryAmount || formData.maxRecoveryAmount === 0) {
          errors.maxRecoveryAmount = "Maximum recovery amount is required"
        }
        if (!formData.bucketName.trim()) errors.bucketName = "Bucket name is required"
        break

      case 3: // Enforcement Settings
        if (!formData.enforcementMinAgeDays || formData.enforcementMinAgeDays === 0) {
          errors.enforcementMinAgeDays = "Enforcement minimum age days is required"
        }
        if (!formData.enforcementMonthlyMinimum || formData.enforcementMonthlyMinimum === 0) {
          errors.enforcementMonthlyMinimum = "Enforcement monthly minimum is required"
        }
        if (!formData.enforcementGraceDays || formData.enforcementGraceDays === 0) {
          errors.enforcementGraceDays = "Enforcement grace days is required"
        }
        if (!formData.enforcementMode || formData.enforcementMode === 0) {
          errors.enforcementMode = "Enforcement mode is required"
        }
        if (formData.enforcementEnabled && !formData.enforcementBucketName.trim()) {
          errors.enforcementBucketName = "Enforcement bucket name is required when enforcement is enabled"
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

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      const createData: CreateRecoveryPolicyRequest = {
        name: formData.name,
        customerId: formData.customerId,
        recoveryType: formData.recoveryType,
        recoveryValue: formData.recoveryValue,
        triggerThresholdAmount: formData.triggerThresholdAmount,
        minimumMonthlyRecovery: formData.minimumMonthlyRecovery,
        minRecoveryAmount: formData.minRecoveryAmount,
        maxRecoveryAmount: formData.maxRecoveryAmount,
        bucketName: formData.bucketName,
        applyBeforeBill: formData.applyBeforeBill,
        enforcementEnabled: formData.enforcementEnabled,
        enforcementBucketName: formData.enforcementBucketName,
        enforcementMinAgeDays: formData.enforcementMinAgeDays,
        enforcementMonthlyMinimum: formData.enforcementMonthlyMinimum,
        enforcementGraceDays: formData.enforcementGraceDays,
        enforcementMode: formData.enforcementMode,
        enforcementStartAtUtc: formData.enforcementStartAtUtc,
        isActive: formData.isActive,
        isPaused: formData.isPaused,
        effectiveFromUtc: formData.effectiveFromUtc,
        effectiveToUtc: formData.effectiveToUtc,
      }

      await dispatch(createRecoveryPolicy(createData)).unwrap()
    } catch (error: any) {
      console.error("Failed to create recovery policy:", error)
    }
  }

  const handleReset = () => {
    setFormData({
      name: "",
      customerId: 0,
      recoveryType: 0,
      recoveryValue: 0,
      triggerThresholdAmount: 0,
      minimumMonthlyRecovery: 0,
      minRecoveryAmount: 0,
      maxRecoveryAmount: 0,
      bucketName: "",
      applyBeforeBill: false,
      enforcementEnabled: false,
      enforcementBucketName: "",
      enforcementMinAgeDays: 0,
      enforcementMonthlyMinimum: 0,
      enforcementGraceDays: 0,
      enforcementMode: 0,
      enforcementStartAtUtc: "",
      isActive: true,
      isPaused: false,
      effectiveFromUtc: "",
      effectiveToUtc: "",
    })
    setCurrentStep(1)
    setFormErrors({})
    dispatch(clearCreateRecoveryPolicyState())
  }

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
          {currentStep === 1 && "Basic Info"}
          {currentStep === 2 && "Recovery"}
          {currentStep === 3 && "Enforcement"}
        </div>
      </div>
    </div>
  )

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
                {step === 1 && "Basic Info"}
                {step === 2 && "Recovery"}
                {step === 3 && "Enforcement"}
              </span>
            </div>
            {step < 3 && <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#004B23]" : "bg-gray-300"}`} />}
          </React.Fragment>
        ))}
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
                    { step: 1, title: "Basic Information", description: "Policy name and customer details" },
                    { step: 2, title: "Recovery Settings", description: "Recovery amounts and thresholds" },
                    { step: 3, title: "Enforcement Settings", description: "Enforcement rules and conditions" },
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
                    disabled={createRecoveryPolicyLoading}
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
    return (
      formData.name.trim() !== "" &&
      formData.customerId !== 0 &&
      formData.recoveryType !== 0 &&
      formData.recoveryValue !== 0 &&
      formData.triggerThresholdAmount !== 0 &&
      formData.minimumMonthlyRecovery !== 0 &&
      formData.minRecoveryAmount !== 0 &&
      formData.maxRecoveryAmount !== 0 &&
      formData.bucketName.trim() !== "" &&
      formData.enforcementMinAgeDays !== 0 &&
      formData.enforcementMonthlyMinimum !== 0 &&
      formData.enforcementGraceDays !== 0 &&
      formData.enforcementMode !== 0 &&
      (!formData.enforcementEnabled || formData.enforcementBucketName.trim() !== "")
    )
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
              disabled={createRecoveryPolicyLoading}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <VscArrowLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={createRecoveryPolicyLoading}
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
              disabled={createRecoveryPolicyLoading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <VscArrowRight className="size-4" />
              <span>Next</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid() || createRecoveryPolicyLoading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createRecoveryPolicyLoading ? "Adding..." : "Add Recovery Policy"}
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

          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 2xl:px-16">
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
                    <svg
                      width="1em"
                      height="1em"
                      viewBox="0 0 17 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="new-arrow-right rotate-180 transform"
                    >
                      <path
                        d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Add New Recovery Policy</h1>
                    <p className="text-sm text-gray-600">Create a new recovery policy in the system</p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={createRecoveryPolicyLoading}
                  >
                    Reset Form
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isFormValid() || createRecoveryPolicyLoading}
                    icon={<VscAdd />}
                    iconPosition="start"
                  >
                    {createRecoveryPolicyLoading ? "Adding..." : "Add Recovery Policy"}
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
                  <h3 className="text-lg font-semibold text-gray-900">Recovery Policy Information</h3>
                  <p className="text-sm text-gray-600">Fill in all required fields to create a new recovery policy</p>
                </div>

                {/* Desktop Step Progress */}
                <div className="hidden sm:block">
                  <StepProgress />
                </div>

                {/* Recovery Policy Form */}
                <form
                  id="recovery-policy-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                  }}
                  className="space-y-6"
                >
                  <AnimatePresence mode="wait">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                          <p className="text-sm text-gray-600">Enter the policy name and customer details</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormInputModule
                            label="Policy Name"
                            name="name"
                            type="text"
                            placeholder="Enter policy name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={formErrors.name}
                            required
                          />

                          <FormSelectModule
                            label="Customer"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleInputChange}
                            options={customerOptions}
                            error={formErrors.customerId}
                            required
                          />

                          <FormSelectModule
                            label="Recovery Type"
                            name="recoveryType"
                            value={formData.recoveryType}
                            onChange={handleInputChange}
                            options={recoveryTypeOptions}
                            error={formErrors.recoveryType}
                            required
                          />

                          <FormInputModule
                            label="Recovery Value"
                            name="recoveryValue"
                            type="number"
                            placeholder="Enter recovery value"
                            value={formData.recoveryValue === 0 ? "" : formData.recoveryValue}
                            onChange={handleInputChange}
                            error={formErrors.recoveryValue}
                            required
                            step="0.01"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Recovery Settings */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Recovery Settings</h4>
                          <p className="text-sm text-gray-600">Configure recovery amounts and thresholds</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormInputModule
                            label="Trigger Threshold Amount"
                            name="triggerThresholdAmount"
                            type="number"
                            placeholder="Enter trigger threshold amount"
                            value={formData.triggerThresholdAmount === 0 ? "" : formData.triggerThresholdAmount}
                            onChange={handleInputChange}
                            error={formErrors.triggerThresholdAmount}
                            required
                            step="0.01"
                          />

                          <FormInputModule
                            label="Minimum Monthly Recovery"
                            name="minimumMonthlyRecovery"
                            type="number"
                            placeholder="Enter minimum monthly recovery"
                            value={formData.minimumMonthlyRecovery === 0 ? "" : formData.minimumMonthlyRecovery}
                            onChange={handleInputChange}
                            error={formErrors.minimumMonthlyRecovery}
                            required
                            step="0.01"
                          />

                          <FormInputModule
                            label="Minimum Recovery Amount"
                            name="minRecoveryAmount"
                            type="number"
                            placeholder="Enter minimum recovery amount"
                            value={formData.minRecoveryAmount === 0 ? "" : formData.minRecoveryAmount}
                            onChange={handleInputChange}
                            error={formErrors.minRecoveryAmount}
                            required
                            step="0.01"
                          />

                          <FormInputModule
                            label="Maximum Recovery Amount"
                            name="maxRecoveryAmount"
                            type="number"
                            placeholder="Enter maximum recovery amount"
                            value={formData.maxRecoveryAmount === 0 ? "" : formData.maxRecoveryAmount}
                            onChange={handleInputChange}
                            error={formErrors.maxRecoveryAmount}
                            required
                            step="0.01"
                          />

                          <FormInputModule
                            label="Bucket Name"
                            name="bucketName"
                            type="text"
                            placeholder="Enter bucket name"
                            value={formData.bucketName}
                            onChange={handleInputChange}
                            error={formErrors.bucketName}
                            required
                          />

                          <FormSelectModule
                            label="Apply Before Bill"
                            name="applyBeforeBill"
                            value={formData.applyBeforeBill.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Enforcement Settings */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Enforcement Settings</h4>
                          <p className="text-sm text-gray-600">Configure enforcement rules and conditions</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormSelectModule
                            label="Enforcement Enabled"
                            name="enforcementEnabled"
                            value={formData.enforcementEnabled.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />

                          <FormInputModule
                            label="Enforcement Bucket Name"
                            name="enforcementBucketName"
                            type="text"
                            placeholder="Enter enforcement bucket name"
                            value={formData.enforcementBucketName}
                            onChange={handleInputChange}
                            error={formErrors.enforcementBucketName}
                            required={formData.enforcementEnabled}
                          />

                          <FormInputModule
                            label="Enforcement Min Age Days"
                            name="enforcementMinAgeDays"
                            type="number"
                            placeholder="Enter enforcement minimum age days"
                            value={formData.enforcementMinAgeDays === 0 ? "" : formData.enforcementMinAgeDays}
                            onChange={handleInputChange}
                            error={formErrors.enforcementMinAgeDays}
                            required
                          />

                          <FormInputModule
                            label="Enforcement Monthly Minimum"
                            name="enforcementMonthlyMinimum"
                            type="number"
                            placeholder="Enter enforcement monthly minimum"
                            value={formData.enforcementMonthlyMinimum === 0 ? "" : formData.enforcementMonthlyMinimum}
                            onChange={handleInputChange}
                            error={formErrors.enforcementMonthlyMinimum}
                            required
                            step="0.01"
                          />

                          <FormInputModule
                            label="Enforcement Grace Days"
                            name="enforcementGraceDays"
                            type="number"
                            placeholder="Enter enforcement grace days"
                            value={formData.enforcementGraceDays === 0 ? "" : formData.enforcementGraceDays}
                            onChange={handleInputChange}
                            error={formErrors.enforcementGraceDays}
                            required
                          />

                          <FormSelectModule
                            label="Enforcement Mode"
                            name="enforcementMode"
                            value={formData.enforcementMode}
                            onChange={handleInputChange}
                            options={enforcementModeOptions}
                            error={formErrors.enforcementMode}
                            required
                          />

                          <FormInputModule
                            label="Enforcement Start Date"
                            name="enforcementStartAtUtc"
                            type="datetime-local"
                            value={formData.enforcementStartAtUtc}
                            onChange={handleInputChange}
                            placeholder={""}
                          />

                          <FormSelectModule
                            label="Policy Active"
                            name="isActive"
                            value={formData.isActive.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />

                          <FormSelectModule
                            label="Policy Paused"
                            name="isPaused"
                            value={formData.isPaused.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />

                          <FormInputModule
                            label="Effective From Date"
                            name="effectiveFromUtc"
                            type="datetime-local"
                            value={formData.effectiveFromUtc}
                            onChange={handleInputChange}
                            placeholder={""}
                          />

                          <FormInputModule
                            label="Effective To Date"
                            name="effectiveToUtc"
                            type="datetime-local"
                            value={formData.effectiveToUtc}
                            onChange={handleInputChange}
                            placeholder={""}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Summary */}
                  {Object.keys(formErrors).length > 0 && (
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

                  {/* Desktop Form Actions */}
                  <div className="hidden justify-between gap-4 border-t pt-6 sm:flex">
                    <div className="flex gap-4">
                      {currentStep > 1 && (
                        <ButtonModule
                          variant="outline"
                          size="md"
                          onClick={prevStep}
                          disabled={createRecoveryPolicyLoading}
                          type="button"
                          icon={<VscArrowLeft />}
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
                        disabled={createRecoveryPolicyLoading}
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
                          disabled={createRecoveryPolicyLoading}
                          icon={<VscArrowRight />}
                          iconPosition="end"
                        >
                          Next
                        </ButtonModule>
                      ) : (
                        <ButtonModule
                          variant="primary"
                          size="md"
                          type="button"
                          onClick={handleSubmit}
                          disabled={!isFormValid() || createRecoveryPolicyLoading}
                        >
                          {createRecoveryPolicyLoading ? "Adding Recovery Policy..." : "Add Recovery Policy"}
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
    </section>
  )
}

export default AddRecoveryPolicyPage
