"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearCreatePromoState,
  createPromo,
  CreatePromoRequest,
  selectCreatePromoError,
  selectCreatePromoLoading,
  selectCreatePromoSuccess,
} from "lib/redux/debtManagementSlice"
import { fetchCountries, selectAllProvinces, selectCountriesLoading } from "lib/redux/countriesSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchFeeders } from "lib/redux/feedersSlice"
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Hash,
  HelpCircle,
  Loader2,
  MapPin,
  Percent,
  Settings,
  Tag,
  XCircle,
  Zap,
} from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"

// Types
interface FormErrors {
  name?: string
  code?: string
  discountPercent?: string
  startAtUtc?: string
  endAtUtc?: string
  scope?: string
}

// Animation variants
const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

const AddPromoPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectCreatePromoLoading)
  const error = useAppSelector(selectCreatePromoError)
  const success = useAppSelector(selectCreatePromoSuccess)

  // Provinces, Area Offices, and Feeders data
  const provinces = useAppSelector(selectAllProvinces)
  const countriesLoading = useAppSelector(selectCountriesLoading)
  const areaOffices = useAppSelector((state: any) => state.areaOffices.areaOffices)
  const areaOfficesLoading = useAppSelector((state: any) => state.areaOffices.loading)
  const feeders = useAppSelector((state: any) => state.feeders.feeders)
  const feedersLoading = useAppSelector((state: any) => state.feeders.loading)

  // Form state
  const [formData, setFormData] = useState<CreatePromoRequest>({
    name: "",
    code: "",
    description: "",
    discountPercent: 0,
    startAtUtc: "",
    endAtUtc: "",
    scope: 1,
    provinceId: 0,
    areaOfficeId: 0,
    feederId: 0,
    isActive: true,
    isPaused: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<"basic" | "scope" | "dates">("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submissionAttempted = useRef(false)
  const explicitSubmitAttempt = useRef(false)

  // Search states for dropdowns
  const [provinceSearchTerm, setProvinceSearchTerm] = useState("")
  const [areaOfficeSearchTerm, setAreaOfficeSearchTerm] = useState("")
  const [feederSearchTerm, setFeederSearchTerm] = useState("")

  // Fetch dropdown data on component mount
  useEffect(() => {
    // Clear any existing create promo state to prevent auto-submission
    dispatch(clearCreatePromoState())

    // Fetch countries (which includes provinces)
    dispatch(fetchCountries())

    // Fetch area offices
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 1000 }))

    // Fetch feeders
    dispatch(fetchFeeders({ pageNumber: 1, pageSize: 1000 }))
  }, [dispatch])

  // Handle success redirect
  useEffect(() => {
    if (success && isSubmitting && formData.name && submissionAttempted.current) {
      notify("success", `Promo "${formData.name}" created successfully`)
      setIsSubmitting(false)
      submissionAttempted.current = false
      const timer = setTimeout(() => {
        router.push("/dm/promo")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [success, router, formData.name, isSubmitting])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      discountPercent: 0,
      startAtUtc: "",
      endAtUtc: "",
      scope: 1,
      provinceId: 0,
      areaOfficeId: 0,
      feederId: 0,
      isActive: true,
      isPaused: false,
    })
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
    submissionAttempted.current = false
    explicitSubmitAttempt.current = false
  }

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Promo name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Promo name must be at least 3 characters"
    }

    if (!formData.code.trim()) {
      newErrors.code = "Promo code is required"
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.code)) {
      newErrors.code = "Promo code can only contain letters, numbers, underscores, and hyphens"
    }

    if (formData.discountPercent <= 0) {
      newErrors.discountPercent = "Discount percentage must be greater than 0"
    } else if (formData.discountPercent > 100) {
      newErrors.discountPercent = "Discount percentage cannot exceed 100%"
    }

    if (!formData.startAtUtc) {
      newErrors.startAtUtc = "Start date is required"
    }

    if (!formData.endAtUtc) {
      newErrors.endAtUtc = "End date is required"
    } else if (formData.startAtUtc && new Date(formData.endAtUtc) <= new Date(formData.startAtUtc)) {
      newErrors.endAtUtc = "End date must be after start date"
    }

    if (formData.scope === 2 && formData.provinceId === 0) {
      newErrors.scope = "Province is required for province scope"
    } else if (formData.scope === 3 && formData.areaOfficeId === 0) {
      newErrors.scope = "Area office is required for area office scope"
    } else if (formData.scope === 4 && formData.feederId === 0) {
      newErrors.scope = "Feeder is required for feeder scope"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleInputChange = (field: keyof CreatePromoRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field if it exists
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  // Handle dropdown changes
  const handleDropdownChange = (field: keyof CreatePromoRequest) => {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleInputChange(field, Number(e.target.value))
    }
  }

  // Handle blur for validation
  const handleBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Only allow submission if explicitly called from submit button
    const submitButton = (e.nativeEvent as SubmitEvent)?.submitter as HTMLButtonElement
    if (!submitButton || submitButton.type !== "submit" || !explicitSubmitAttempt.current) {
      console.log("BLOCKING: Not from submit button or not explicit submit")
      explicitSubmitAttempt.current = false
      return
    }

    console.log("ALLOWING: From submit button")
    explicitSubmitAttempt.current = false

    if (!validateForm()) {
      notify("error", "Please fix the errors in the form")
      return
    }

    submissionAttempted.current = true
    setIsSubmitting(true)
    try {
      await dispatch(createPromo(formData)).unwrap()
      resetForm()
    } catch (error: any) {
      setIsSubmitting(false)
      submissionAttempted.current = false
      notify("error", error || "Failed to create promo")
    }
  }

  // Handle explicit submit button click
  const handleExplicitSubmit = async () => {
    explicitSubmitAttempt.current = true

    if (!validateForm()) {
      notify("error", "Please fix the errors in the form")
      explicitSubmitAttempt.current = false
      return
    }

    submissionAttempted.current = true
    setIsSubmitting(true)
    try {
      await dispatch(createPromo(formData)).unwrap()
      resetForm()
    } catch (error: any) {
      setIsSubmitting(false)
      submissionAttempted.current = false
      explicitSubmitAttempt.current = false
      notify("error", error || "Failed to create promo")
    }
  }

  // Handle back navigation
  const handleBack = () => {
    dispatch(clearCreatePromoState())
    router.push("/dm/promo")
  }

  // Format date for input
  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toISOString().slice(0, 16)
  }

  // Get current date for min attribute
  const getCurrentDateTime = () => {
    return new Date().toISOString().slice(0, 16)
  }

  // Progress steps
  const steps = [
    { id: "basic", label: "Basic Info", icon: Tag },
    { id: "dates", label: "Date Settings", icon: Calendar },
    { id: "scope", label: "Scope & Status", icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ButtonModule
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </ButtonModule>
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Promo</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Fill in the details below to create a new debt clearance promotion
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = activeTab === step.id
                const isCompleted =
                  (step.id === "basic" && formData.name && formData.code) ||
                  (step.id === "dates" && formData.startAtUtc && formData.endAtUtc) ||
                  (step.id === "scope" && formData.scope)

                return (
                  <React.Fragment key={step.id}>
                    {index > 0 && <div className={`h-0.5 w-8 ${isCompleted ? "bg-[#004B23]" : "bg-gray-200"}`} />}
                    <button
                      type="button"
                      onClick={() => setActiveTab(step.id as any)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                        isActive
                          ? "bg-[#004B23] text-white ring-2 ring-[#004B23]/20"
                          : isCompleted
                          ? "text-[#004B23] hover:bg-gray-50"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span className="hidden text-sm font-medium sm:inline">{step.label}</span>
                    </button>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Success Banner */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-xl border border-[#16A34A] bg-gradient-to-r from-[#16A34A]/10 to-[#16A34A]/5 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#16A34A]/10">
                    <CheckCircle className="size-6 text-[#16A34A]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#16A34A]">Promo Created Successfully!</h3>
                    <p className="text-sm text-[#16A34A]/80">
                      Your promo &quot;{formData.name}&quot; has been created. Redirecting to promo list...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-[#16A34A]" />
                    <span className="text-sm text-[#16A34A]">Redirecting</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className=" rounded-2xl border border-gray-200 bg-white shadow-lg"
        >
          <form
            key="promo-form"
            onSubmit={handleSubmit}
            onKeyPress={(e) => {
              if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                e.preventDefault()
              }
            }}
          >
            {/* Hidden input to prevent accidental submissions */}
            <input type="text" style={{ display: "none" }} tabIndex={-1} />
            {/* Form Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === "basic" && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Left Column */}
                      <div className="space-y-6">
                        <div className="group">
                          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Tag className="size-4 text-gray-400 group-focus-within:text-blue-500" />
                            Promo Name *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            onBlur={() => handleBlur("name")}
                            className={`w-full rounded-xl border ${
                              touched.name && errors.name
                                ? "border-[#D14343] focus:border-[#D14343] focus:ring-[#D14343]/20"
                                : "border-gray-200 focus:border-[#004B23] focus:ring-[#004B23]/20"
                            } px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4`}
                            placeholder="e.g., Summer Clearance Sale"
                            disabled={isLoading}
                          />
                          {touched.name && errors.name && <p className="mt-1 text-sm text-[#D14343]">{errors.name}</p>}
                        </div>

                        <div className="group">
                          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Hash className="size-4 text-gray-400 group-focus-within:text-blue-500" />
                            Promo Code *
                          </label>
                          <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                            onBlur={() => handleBlur("code")}
                            className={`w-full rounded-xl border ${
                              touched.code && errors.code
                                ? "border-[#D14343] focus:border-[#D14343] focus:ring-[#D14343]/20"
                                : "border-gray-200 focus:border-[#004B23] focus:ring-[#004B23]/20"
                            } px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4`}
                            placeholder="e.g., SUMMER2024"
                            disabled={isLoading}
                          />
                          {touched.code && errors.code && <p className="mt-1 text-sm text-[#D14343]">{errors.code}</p>}
                        </div>

                        <div className="group">
                          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Percent className="size-4 text-gray-400 group-focus-within:text-blue-500" />
                            Discount Percentage *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              step="0.1"
                              value={formData.discountPercent || ""}
                              onChange={(e) => handleInputChange("discountPercent", Number(e.target.value))}
                              onBlur={() => handleBlur("discountPercent")}
                              className={`w-full rounded-xl border ${
                                touched.discountPercent && errors.discountPercent
                                  ? "border-[#D14343] focus:border-[#D14343] focus:ring-[#D14343]/20"
                                  : "border-gray-200 focus:border-[#004B23] focus:ring-[#004B23]/20"
                              } px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4`}
                              placeholder="Enter percentage"
                              disabled={isLoading}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                              %
                            </span>
                          </div>
                          {touched.discountPercent && errors.discountPercent && (
                            <p className="mt-1 text-sm text-[#D14343]">{errors.discountPercent}</p>
                          )}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        <div className="group">
                          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FileText className="size-4 text-gray-400 group-focus-within:text-blue-500" />
                            Description
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-[#004B23] focus:outline-none focus:ring-4 focus:ring-[#004B23]/20"
                            placeholder="Describe your promo (optional)"
                            rows={5}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "dates" && (
                  <motion.div
                    key="dates"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                  >
                    <div className="group">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Clock className="size-4 text-gray-400 group-focus-within:text-blue-500" />
                        Start Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={formatDateTimeForInput(formData.startAtUtc)}
                        onChange={(e) => handleInputChange("startAtUtc", new Date(e.target.value).toISOString())}
                        onBlur={() => handleBlur("startAtUtc")}
                        min={getCurrentDateTime()}
                        className={`w-full rounded-xl border ${
                          touched.startAtUtc && errors.startAtUtc
                            ? "border-[#D14343] focus:border-[#D14343] focus:ring-[#D14343]/20"
                            : "border-gray-200 focus:border-[#004B23] focus:ring-[#004B23]/20"
                        } px-4 py-3 text-gray-900 transition-all focus:outline-none focus:ring-4`}
                        disabled={isLoading}
                      />
                      {touched.startAtUtc && errors.startAtUtc && (
                        <p className="mt-1 text-sm text-[#D14343]">{errors.startAtUtc}</p>
                      )}
                    </div>

                    <div className="group">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Clock className="size-4 text-gray-400 group-focus-within:text-blue-500" />
                        End Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={formatDateTimeForInput(formData.endAtUtc)}
                        onChange={(e) => handleInputChange("endAtUtc", new Date(e.target.value).toISOString())}
                        onBlur={() => handleBlur("endAtUtc")}
                        min={formData.startAtUtc ? formatDateTimeForInput(formData.startAtUtc) : getCurrentDateTime()}
                        className={`w-full rounded-xl border ${
                          touched.endAtUtc && errors.endAtUtc
                            ? "border-[#D14343] focus:border-[#D14343] focus:ring-[#D14343]/20"
                            : "border-gray-200 focus:border-[#004B23] focus:ring-[#004B23]/20"
                        } px-4 py-3 text-gray-900 transition-all focus:outline-none focus:ring-4`}
                        disabled={isLoading}
                      />
                      {touched.endAtUtc && errors.endAtUtc && (
                        <p className="mt-1 text-sm text-[#D14343]">{errors.endAtUtc}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "scope" && (
                  <motion.div
                    key="scope"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Scope Selection */}
                      <div className="space-y-6">
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Globe className="size-4 text-gray-400" />
                            Scope *
                          </label>
                          <div className="4xl:grid-cols-4 grid grid-cols-2 gap-3">
                            {[
                              { value: 1, label: "Everyone", icon: Globe, desc: "All customers" },
                              { value: 2, label: "Province", icon: MapPin, desc: "Limited to province" },
                              { value: 3, label: "Area Office", icon: Building2, desc: "Limited to area office" },
                              { value: 4, label: "Feeder", icon: Zap, desc: "Limited to feeder" },
                            ].map((option) => {
                              const Icon = option.icon
                              const isSelected = formData.scope === option.value

                              return (
                                <motion.button
                                  key={option.value}
                                  type="button"
                                  variants={buttonVariants}
                                  initial="rest"
                                  whileHover="hover"
                                  whileTap="tap"
                                  onClick={() => {
                                    handleInputChange("scope", option.value)
                                  }}
                                  className={`relative rounded-xl border p-4 text-left transition-all ${
                                    isSelected
                                      ? "border-[#004B23] bg-[#004B23]/5 shadow-sm"
                                      : "border-gray-200 bg-white hover:border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`rounded-lg p-2 ${
                                        isSelected ? "bg-[#004B23] text-white" : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      <Icon className="size-4" />
                                    </div>
                                    <div className="flex-1">
                                      <p className={`font-medium ${isSelected ? "text-[#004B23]" : "text-gray-900"}`}>
                                        {option.label}
                                      </p>
                                      <p className="text-xs text-gray-500">{option.desc}</p>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute right-2 top-2">
                                      <CheckCircle className="size-5 text-[#004B23]" />
                                    </div>
                                  )}
                                </motion.button>
                              )
                            })}
                          </div>
                          {errors.scope && <p className="mt-1 text-sm text-[#D14343]">{errors.scope}</p>}
                        </div>

                        {/* Conditional Fields based on Scope */}
                        <AnimatePresence>
                          {formData.scope === 2 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className=""
                            >
                              <FormSelectModule
                                label="Province"
                                name="provinceId"
                                value={formData.provinceId}
                                onChange={handleDropdownChange("provinceId")}
                                options={provinces.map((p: any) => ({
                                  value: p.id,
                                  label: p.name,
                                }))}
                                error={touched.provinceId && formData.provinceId === 0 ? "Province is required" : ""}
                                required
                                searchable
                                searchTerm={provinceSearchTerm}
                                onSearchChange={setProvinceSearchTerm}
                                loading={countriesLoading}
                              />
                            </motion.div>
                          )}

                          {formData.scope === 3 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <FormSelectModule
                                label="Area Office"
                                name="areaOfficeId"
                                value={formData.areaOfficeId}
                                onChange={handleDropdownChange("areaOfficeId")}
                                options={areaOffices.map((ao: any) => ({
                                  value: ao.id,
                                  label: ao.nameOfNewOAreaffice,
                                }))}
                                error={
                                  touched.areaOfficeId && formData.areaOfficeId === 0 ? "Area office is required" : ""
                                }
                                required
                                searchable
                                searchTerm={areaOfficeSearchTerm}
                                onSearchChange={setAreaOfficeSearchTerm}
                                loading={areaOfficesLoading}
                              />
                            </motion.div>
                          )}

                          {formData.scope === 4 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <FormSelectModule
                                label="Feeder"
                                name="feederId"
                                value={formData.feederId}
                                onChange={handleDropdownChange("feederId")}
                                options={feeders.map((f: any) => ({
                                  value: f.id,
                                  label: `${f.name} (${f.feederCode})`,
                                }))}
                                error={touched.feederId && formData.feederId === 0 ? "Feeder is required" : ""}
                                required
                                searchable
                                searchTerm={feederSearchTerm}
                                onSearchChange={setFeederSearchTerm}
                                loading={feedersLoading}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Status Settings */}
                      <div className="space-y-6">
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Settings className="size-4 text-gray-400" />
                            Status Settings
                          </label>
                          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                            <motion.div
                              className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
                              whileHover={{ x: 4 }}
                              onClick={(e) => {
                                e.preventDefault()
                                handleInputChange("isActive", !formData.isActive)
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`rounded-full p-1 ${
                                    formData.isActive ? "bg-[#16A34A]/10" : "bg-gray-100"
                                  }`}
                                >
                                  <CheckCircle
                                    className={`size-5 ${formData.isActive ? "text-[#16A34A]" : "text-gray-400"}`}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Active</p>
                                  <p className="text-xs text-gray-500">Promo is available for use</p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                                className="sr-only"
                              />
                              <div
                                className={`relative h-6 w-11 rounded-full transition-colors ${
                                  formData.isActive ? "bg-[#004B23]" : "bg-gray-300"
                                }`}
                              >
                                <div
                                  className={`absolute left-1 top-1 size-4 rounded-full bg-white transition-transform ${
                                    formData.isActive ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </div>
                            </motion.div>

                            <motion.div
                              className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
                              whileHover={{ x: 4 }}
                              onClick={(e) => {
                                e.preventDefault()
                                handleInputChange("isPaused", !formData.isPaused)
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`rounded-full p-1 ${
                                    formData.isPaused ? "bg-[#f58634]/10" : "bg-gray-100"
                                  }`}
                                >
                                  <XCircle
                                    className={`size-5 ${formData.isPaused ? "text-[#f58634]" : "text-gray-400"}`}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-700">Paused</p>
                                  <p className="text-xs text-gray-500">Temporarily disable promo</p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={formData.isPaused}
                                onChange={(e) => handleInputChange("isPaused", e.target.checked)}
                                className="sr-only"
                              />
                              <div
                                className={`relative h-6 w-11 rounded-full transition-colors ${
                                  formData.isPaused ? "bg-[#f58634]" : "bg-gray-300"
                                }`}
                              >
                                <div
                                  className={`absolute left-1 top-1 size-4 rounded-full bg-white transition-transform ${
                                    formData.isPaused ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        {/* Info Card */}
                        <div className="rounded-xl border border-[#004B23]/20 bg-gradient-to-br from-[#004B23]/5 to-white p-6">
                          <div className="flex gap-3">
                            <HelpCircle className="size-5 flex-shrink-0 text-[#004B23]" />
                            <div>
                              <h4 className="text-sm font-semibold text-[#004B23]">Need help?</h4>
                              <p className="mt-1 text-xs text-gray-600">
                                Global promos apply to all users. Regional promos are limited to specific provinces,
                                while local promos are restricted to specific feeders.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Summary */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 rounded-xl border border-[#D14343] bg-[#D14343]/5 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 size-5 flex-shrink-0 text-[#D14343]" />
                      <div>
                        <h4 className="text-sm font-semibold text-[#D14343]">Error Creating Promo</h4>
                        <p className="mt-1 text-sm text-[#D14343]/80">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-200 bg-gray-50 px-8 py-6">
              <div className="flex items-center justify-between">
                {/* Left side - Previous Step or Cancel */}
                <div>
                  {activeTab !== "basic" ? (
                    <ButtonModule
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const prevTab = activeTab === "dates" ? "basic" : "dates"
                        setActiveTab(prevTab)
                      }}
                      disabled={isLoading}
                      className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="mr-2 size-4" />
                      Previous Step
                    </ButtonModule>
                  ) : (
                    <ButtonModule
                      variant="outline"
                      size="sm"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </ButtonModule>
                  )}
                </div>

                {/* Right side - Progress indicator and action buttons */}
                <div className="flex items-center gap-4">
                  {/* Progress indicator */}
                  <div className="text-sm text-gray-500">
                    Step {activeTab === "basic" ? "1" : activeTab === "dates" ? "2" : "3"} of 3
                  </div>

                  {/* Action buttons */}
                  {activeTab !== "scope" ? (
                    <ButtonModule
                      variant="primary"
                      size="lg"
                      type="button"
                      onClick={() => {
                        console.log("Next Step clicked, current tab:", activeTab)
                        const nextTab = activeTab === "basic" ? "dates" : "scope"
                        console.log("Setting next tab to:", nextTab)
                        setActiveTab(nextTab)
                      }}
                      disabled={isLoading}
                      className="min-w-[140px]"
                    >
                      Next Step
                      <ArrowLeft className="ml-2 size-4 rotate-180" />
                    </ButtonModule>
                  ) : (
                    <ButtonModule
                      variant="primary"
                      size="lg"
                      type="button"
                      onClick={handleExplicitSubmit}
                      disabled={isLoading}
                      className="min-w-[140px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Tag className="mr-2 size-4" />
                          Create Promo
                        </>
                      )}
                    </ButtonModule>
                  )}
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Preview Card (Optional) */}
        {formData.name && formData.discountPercent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
          >
            <h3 className="mb-4 text-sm font-medium text-gray-700">Preview</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gradient-to-br from-[#004B23] to-[#003819] p-3">
                  <Tag className="size-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{formData.name}</p>
                  <p className="text-sm text-gray-500">Code: {formData.code || "N/A"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="bg-gradient-to-r from-[#004B23] to-[#003819] bg-clip-text text-3xl font-bold text-transparent">
                  {formData.discountPercent}% OFF
                </p>
                <p className="text-sm text-gray-500">
                  {formData.startAtUtc ? formatDateTimeForInput(formData.startAtUtc) : "No start date"} -
                  {formData.endAtUtc ? formatDateTimeForInput(formData.endAtUtc) : "No end date"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AddPromoPage
