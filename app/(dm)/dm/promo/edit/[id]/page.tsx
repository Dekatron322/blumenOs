"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  ClearancePromo,
  clearPromoDetailsState,
  clearUpdatePromoState,
  fetchPromoDetails,
  selectPromoDetails,
  selectPromoDetailsError,
  selectPromoDetailsLoading,
  selectUpdatePromoError,
  selectUpdatePromoLoading,
  selectUpdatePromoSuccess,
  updatePromo,
  UpdatePromoRequest,
} from "lib/redux/debtManagementSlice"
import { fetchCountries, selectAllProvinces, selectCountriesLoading } from "lib/redux/countriesSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchFeeders } from "lib/redux/feedersSlice"
import {
  AlertCircle,
  ArrowLeft,
  BadgePercent,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock3,
  Copy,
  Edit3,
  Eye,
  FileText,
  Globe,
  Info,
  Loader2,
  MapPin,
  Percent,
  Power,
  RefreshCw,
  Save,
  Shield,
  Sparkles,
  Tag,
  X,
  Zap,
} from "lucide-react"
import { useParams } from "next/navigation"

// Scope options with icons and descriptions
const scopeOptions = [
  { value: "1", label: "Global", icon: Globe, description: "Available worldwide" },
  { value: "2", label: "Regional", icon: Building2, description: "Limited to specific region" },
  { value: "3", label: "Local", icon: MapPin, description: "Local area only" },
]

// Boolean options with enhanced labels
const booleanOptions = [
  { value: "true", label: "Yes", icon: CheckCircle2 },
  { value: "false", label: "No", icon: X },
]

// Status badges configuration
const statusConfig = {
  isActive: {
    true: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    false: { label: "Inactive", color: "bg-gray-100 text-gray-700 border-gray-200", icon: AlertCircle },
  },
  isPaused: {
    true: { label: "Paused", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock3 },
    false: { label: "Running", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Zap },
  },
}

const EditPromoPage = () => {
  const router = useRouter()
  const params = useParams()
  const promoId = params.id as string
  const dispatch = useAppDispatch()
  const formRef = useRef<HTMLFormElement>(null)

  // Redux state
  const promoDetails = useAppSelector(selectPromoDetails)
  const promoDetailsLoading = useAppSelector(selectPromoDetailsLoading)
  const promoDetailsError = useAppSelector(selectPromoDetailsError)
  const updateLoading = useAppSelector(selectUpdatePromoLoading)
  const updateSuccess = useAppSelector(selectUpdatePromoSuccess)
  const updateError = useAppSelector(selectUpdatePromoError)

  // Countries/Provinces state
  const provinces = useAppSelector(selectAllProvinces)
  const provincesLoading = useAppSelector(selectCountriesLoading)

  // Area Offices and Feeders state
  const areaOffices = useAppSelector((state: any) => state.areaOffices.areaOffices)
  const areaOfficesLoading = useAppSelector((state: any) => state.areaOffices.loading)
  const feeders = useAppSelector((state: any) => state.feeders.feeders)
  const feedersLoading = useAppSelector((state: any) => state.feeders.loading)

  // Form state
  const [formData, setFormData] = useState<UpdatePromoRequest>({
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

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isPreview, setIsPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  // Search states for dropdowns
  const [provinceSearchTerm, setProvinceSearchTerm] = useState("")
  const [areaOfficeSearchTerm, setAreaOfficeSearchTerm] = useState("")
  const [feederSearchTerm, setFeederSearchTerm] = useState("")

  // Fetch promo details and dropdown data on component mount
  useEffect(() => {
    if (promoId) {
      dispatch(fetchPromoDetails(Number(promoId)))
    }
    dispatch(fetchCountries())
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 1000 }))
    dispatch(fetchFeeders({ pageNumber: 1, pageSize: 1000 }))

    return () => {
      dispatch(clearPromoDetailsState())
      dispatch(clearUpdatePromoState())
    }
  }, [dispatch, promoId])

  // Populate form when promo details are loaded
  useEffect(() => {
    if (promoDetails) {
      setFormData({
        name: promoDetails.name || "",
        code: promoDetails.code || "",
        description: promoDetails.description || "",
        discountPercent: promoDetails.discountPercent || 0,
        startAtUtc: promoDetails.startAtUtc || "",
        endAtUtc: promoDetails.endAtUtc || "",
        scope: promoDetails.scope || 1,
        provinceId: promoDetails.provinceId || 0,
        areaOfficeId: promoDetails.areaOfficeId || 0,
        feederId: promoDetails.feederId || 0,
        isActive: promoDetails.isActive || true,
        isPaused: promoDetails.isPaused || false,
      })
    }
  }, [promoDetails])

  // Handle update success
  useEffect(() => {
    if (updateSuccess) {
      notify("success", "Promo updated successfully!", {
        duration: 5000,
      })
      router.push("/dm/promo")
    }
  }, [updateSuccess, router])

  // Handle update error
  useEffect(() => {
    if (updateError) {
      notify("error" as const, updateError, {
        duration: 7000,
      })
    }
  }, [updateError])

  // Format date for input field
  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Validate form with enhanced rules
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Promo name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Promo name must be at least 3 characters"
    } else if (formData.name.length > 100) {
      newErrors.name = "Promo name must be less than 100 characters"
    }

    if (!formData.code.trim()) {
      newErrors.code = "Promo code is required"
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.code)) {
      newErrors.code = "Code can only contain letters, numbers, underscores, and hyphens"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    if (!formData.discountPercent || formData.discountPercent <= 0) {
      newErrors.discountPercent = "Discount percentage is required"
    } else if (formData.discountPercent > 100) {
      newErrors.discountPercent = "Discount percentage cannot exceed 100%"
    } else if (formData.discountPercent < 1) {
      newErrors.discountPercent = "Discount percentage must be at least 1%"
    }

    if (!formData.startAtUtc) {
      newErrors.startAtUtc = "Start date is required"
    }

    if (!formData.endAtUtc) {
      newErrors.endAtUtc = "End date is required"
    }

    if (formData.startAtUtc && formData.endAtUtc) {
      const start = new Date(formData.startAtUtc)
      const end = new Date(formData.endAtUtc)
      const now = new Date()

      if (start >= end) {
        newErrors.endAtUtc = "End date must be after start date"
      }

      if (end < now) {
        newErrors.endAtUtc = "End date cannot be in the past"
      }
    }

    // Validate province when scope is not global
    if (formData.scope !== 1 && (!formData.provinceId || formData.provinceId <= 0)) {
      newErrors.provinceId = "Province is required for regional and local scope"
    }

    // Validate area office when scope is local
    if (formData.scope === 3 && (!formData.areaOfficeId || formData.areaOfficeId <= 0)) {
      newErrors.areaOfficeId = "Area office is required for local scope"
    }

    // Validate feeder when scope is local
    if (formData.scope === 3 && (!formData.feederId || formData.feederId <= 0)) {
      newErrors.feederId = "Feeder is required for local scope"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched for validation
    const allFields = new Set(Object.keys(formData))
    setTouchedFields(allFields)

    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector(".border-red-500")
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    setIsSubmitting(true)
    try {
      await dispatch(updatePromo({ id: Number(promoId), params: formData })).unwrap()
    } catch (error) {
      console.error("Update failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle input changes with validation on blur
  const handleInputChange = (field: keyof UpdatePromoRequest, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Real-time validation for certain fields
    if (touchedFields.has(field as string)) {
      const newErrors = { ...errors }

      if (field === "discountPercent" && (Number(value) > 100 || Number(value) < 0)) {
        newErrors[field] = "Discount must be between 0 and 100"
      } else {
        delete newErrors[field as string]
      }

      setErrors(newErrors)
    }
  }

  // Handle field blur
  const handleFieldBlur = (field: string) => {
    setTouchedFields((prev) => new Set(prev).add(field))
    validateForm()
  }

  // Reset form
  const resetForm = () => {
    if (promoDetails) {
      setFormData({
        name: promoDetails.name || "",
        code: promoDetails.code || "",
        description: promoDetails.description || "",
        discountPercent: promoDetails.discountPercent || 0,
        startAtUtc: promoDetails.startAtUtc || "",
        endAtUtc: promoDetails.endAtUtc || "",
        scope: promoDetails.scope || 1,
        provinceId: promoDetails.provinceId || 0,
        areaOfficeId: promoDetails.areaOfficeId || 0,
        feederId: promoDetails.feederId || 0,
        isActive: promoDetails.isActive || true,
        isPaused: promoDetails.isPaused || false,
      })
    }
    setErrors({})
    setTouchedFields(new Set())
    notify("info", "Form has been reset", { duration: 3000 })
  }

  // Copy promo code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formData.code)
      setShowCopySuccess(true)
      setTimeout(() => setShowCopySuccess(false), 2000)
      notify("success", "Code copied to clipboard!", { duration: 2000 })
    } catch (err) {
      notify("error", "Failed to copy code")
    }
  }

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!formData.endAtUtc) return null
    const end = new Date(formData.endAtUtc)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  if (promoDetailsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <DashboardNav />
        <div className="flex items-center justify-center p-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="relative">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-[#004B23]" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full bg-[#004B23]/10"
              />
            </div>
            <p className="mt-4 text-lg text-gray-600">Loading promo details...</p>
            <p className="text-sm text-gray-400">Please wait while we fetch the data</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (promoDetailsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <DashboardNav />
        <div className="flex w-full items-center justify-center p-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
            <div className="mb-6 inline-block rounded-full bg-red-100 p-4">
              <X className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Failed to Load Promo</h2>
            <p className="mb-6 text-gray-600">We couldn&apos;t load the promo details. Please try again.</p>
            <div className="space-x-4">
              <ButtonModule
                variant="primary"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className="size-4" />
                Retry
              </ButtonModule>
              <ButtonModule
                variant="outline"
                onClick={() => router.push("/dm/promo")}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="size-4" />
                Back to Promos
              </ButtonModule>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="mx-auto w-full p-4">
        {/* Compact Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dm/promo")}
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ArrowLeft className="size-4" />
                <span>Back</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#004B23] p-2">
                  <BadgePercent className="size-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Promo</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ButtonModule variant="outline" onClick={resetForm} disabled={isSubmitting} className="h-9 px-3">
                <RefreshCw className="size-4" />
              </ButtonModule>
              <ButtonModule
                variant="outline"
                onClick={() => setIsPreview(!isPreview)}
                disabled={isSubmitting}
                className={`h-9 px-3 ${isPreview ? "bg-[#004B23] text-white hover:bg-[#003819]" : ""}`}
              >
                <Eye className="size-4" />
              </ButtonModule>
            </div>
          </div>
        </motion.div>

        {/* Compact Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Status</span>
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                  statusConfig.isActive[formData.isActive ? "true" : "false"].color
                }`}
              >
                {React.createElement(statusConfig.isActive[formData.isActive ? "true" : "false"].icon, {
                  className: "size-3",
                })}
                {statusConfig.isActive[formData.isActive ? "true" : "false"].label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Pause</span>
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                  statusConfig.isPaused[formData.isPaused ? "true" : "false"].color
                }`}
              >
                {React.createElement(statusConfig.isPaused[formData.isPaused ? "true" : "false"].icon, {
                  className: "size-3",
                })}
                {statusConfig.isPaused[formData.isPaused ? "true" : "false"].label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Days Left</span>
              <span className="text-sm font-medium">
                {getDaysRemaining() !== null ? (
                  getDaysRemaining()! > 0 ? (
                    <span className="text-[#004B23]">{getDaysRemaining()}d</span>
                  ) : (
                    <span className="text-red-600">Expired</span>
                  )
                ) : (
                  "N/A"
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Discount</span>
              <span className="text-sm font-bold text-[#004B23]">{formData.discountPercent}%</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {!isPreview ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  {/* Compact Tabs */}
                  <div className="mb-4 border-b border-gray-200">
                    <div className="flex gap-1">
                      {[
                        { id: "basic", label: "Basic", icon: FileText },
                        { id: "discount", label: "Discount", icon: Percent },
                        { id: "schedule", label: "Schedule", icon: Calendar },
                        { id: "scope", label: "Scope", icon: Globe },
                        { id: "status", label: "Status", icon: Power },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-1 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                            activeTab === tab.id
                              ? "border-[#004B23] text-[#004B23]"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {React.createElement(tab.icon, { className: "size-3" })}
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                      {activeTab === "basic" && (
                        <motion.div
                          key="basic"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-4"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <FormInputModule
                                label="Promo Name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="e.g., Summer Clearance 2024"
                                error={errors.name}
                                prefix={<Tag className="size-4" />}
                                disabled={isSubmitting}
                                type="text"
                                required
                                className={errors.name ? "border-red-500" : ""}
                              />
                            </div>
                          </div>

                          <div className="relative">
                            <FormInputModule
                              label="Promo Code"
                              name="code"
                              value={formData.code}
                              onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                              placeholder="e.g., SUMMER24"
                              error={errors.code}
                              prefix={<Edit3 className="size-4" />}
                              disabled={isSubmitting}
                              type="text"
                              required
                              className={errors.code ? "border-red-500" : ""}
                            />
                            <button
                              type="button"
                              onClick={copyToClipboard}
                              className="absolute right-2 top-9 rounded-lg p-2 transition-colors hover:bg-gray-100"
                              title="Copy code"
                            >
                              {showCopySuccess ? (
                                <Check className="size-4 text-green-600" />
                              ) : (
                                <Copy className="size-4 text-gray-400" />
                              )}
                            </button>
                          </div>

                          <FormTextAreaModule
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Describe the promo details, terms, and conditions..."
                            error={errors.description}
                            disabled={isSubmitting}
                            rows={3}
                            className={errors.description ? "border-red-500" : ""}
                          />
                        </motion.div>
                      )}

                      {activeTab === "discount" && (
                        <motion.div
                          key="discount"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <div className="rounded-lg bg-[#004B23]/5 p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <BadgePercent className="size-5 text-[#004B23]" />
                              <h3 className="font-medium text-gray-900">Discount Configuration</h3>
                            </div>

                            <div className="relative">
                              <FormInputModule
                                label="Discount Percentage"
                                name="discountPercent"
                                type="number"
                                value={formData.discountPercent}
                                onChange={(e) => handleInputChange("discountPercent", Number(e.target.value))}
                                placeholder="Enter discount percentage"
                                error={errors.discountPercent}
                                prefix={<Percent className="size-4" />}
                                disabled={isSubmitting}
                                min={1}
                                max={100}
                                step={0.1}
                                required
                                className={errors.discountPercent ? "border-red-500" : ""}
                              />
                              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <Info className="size-3" />
                                <span>Value must be between 1% and 100%</span>
                              </div>
                            </div>

                            {/* Compact Discount Preview */}
                            <div className="mt-3 rounded bg-white p-3">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-[#004B23]">{formData.discountPercent}%</span>
                                <span className="text-sm text-gray-600">OFF</span>
                              </div>
                              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${formData.discountPercent}%` }}
                                  className="h-1.5 rounded-full bg-[#004B23]"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "schedule" && (
                        <motion.div
                          key="schedule"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <FormInputModule
                                label="Start Date & Time"
                                name="startAtUtc"
                                placeholder="Select start date and time"
                                type="datetime-local"
                                value={formatDateTimeForInput(formData.startAtUtc)}
                                onChange={(e) => handleInputChange("startAtUtc", e.target.value)}
                                error={errors.startAtUtc}
                                prefix={<Clock className="size-4" />}
                                disabled={isSubmitting}
                                required
                                className={errors.startAtUtc ? "border-red-500" : ""}
                              />
                            </div>

                            <div>
                              <FormInputModule
                                label="End Date & Time"
                                name="endAtUtc"
                                type="datetime-local"
                                value={formatDateTimeForInput(formData.endAtUtc)}
                                onChange={(e) => handleInputChange("endAtUtc", e.target.value)}
                                error={errors.endAtUtc}
                                prefix={<Clock className="size-4" />}
                                disabled={isSubmitting}
                                required
                                className={errors.endAtUtc ? "border-red-500" : ""}
                                placeholder={""}
                              />
                            </div>
                          </div>

                          {/* Compact Schedule Preview */}
                          {(formData.startAtUtc || formData.endAtUtc) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded bg-blue-50 p-3"
                            >
                              <div className="text-xs text-blue-700">
                                <p>Starts: {formatDateForDisplay(formData.startAtUtc)}</p>
                                <p>Ends: {formatDateForDisplay(formData.endAtUtc)}</p>
                                {formData.startAtUtc && formData.endAtUtc && (
                                  <p className="mt-1 font-medium">
                                    Duration:{" "}
                                    {Math.ceil(
                                      (new Date(formData.endAtUtc).getTime() -
                                        new Date(formData.startAtUtc).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )}{" "}
                                    days
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === "scope" && (
                        <motion.div
                          key="scope"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Scope <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                              {scopeOptions.map((option) => {
                                const Icon = option.icon
                                const isSelected = formData.scope === parseInt(option.value)
                                return (
                                  <motion.button
                                    key={option.value}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleInputChange("scope", parseInt(option.value))}
                                    className={`relative rounded-lg border p-3 text-left transition-all ${
                                      isSelected
                                        ? "border-[#004B23] bg-[#004B23]/5"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                  >
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute right-2 top-2"
                                      >
                                        <Check className="size-4 text-[#004B23]" />
                                      </motion.div>
                                    )}
                                    <Icon
                                      className={`mb-1 size-5 ${isSelected ? "text-[#004B23]" : "text-gray-400"}`}
                                    />
                                    <p
                                      className={`text-sm font-medium ${
                                        isSelected ? "text-[#004B23]" : "text-gray-700"
                                      }`}
                                    >
                                      {option.label}
                                    </p>
                                    <p className="text-xs text-gray-500">{option.description}</p>
                                  </motion.button>
                                )
                              })}
                            </div>
                          </div>

                          <AnimatePresence>
                            {formData.scope !== 1 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 "
                              >
                                <h4 className="text-sm font-medium text-gray-700">Location Details</h4>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                  <FormSelectModule
                                    label="Province"
                                    name="provinceId"
                                    value={formData.provinceId}
                                    onChange={(e) => handleInputChange("provinceId", Number(e.target.value))}
                                    options={provinces.map((province) => ({
                                      value: province.id,
                                      label: province.name,
                                    }))}
                                    disabled={isSubmitting || provincesLoading}
                                    error={errors.provinceId}
                                    loading={provincesLoading}
                                    searchable={true}
                                    searchTerm={provinceSearchTerm}
                                    onSearchChange={setProvinceSearchTerm}
                                  />

                                  {formData.scope === 3 && (
                                    <FormSelectModule
                                      label="Area Office"
                                      name="areaOfficeId"
                                      value={formData.areaOfficeId}
                                      onChange={(e) => handleInputChange("areaOfficeId", Number(e.target.value))}
                                      options={areaOffices.map((areaOffice: any) => ({
                                        value: areaOffice.id,
                                        label: areaOffice.nameOfNewOAreaffice,
                                      }))}
                                      disabled={isSubmitting || areaOfficesLoading}
                                      error={errors.areaOfficeId}
                                      loading={areaOfficesLoading}
                                      searchable={true}
                                      searchTerm={areaOfficeSearchTerm}
                                      onSearchChange={setAreaOfficeSearchTerm}
                                    />
                                  )}

                                  {formData.scope === 3 && (
                                    <FormSelectModule
                                      label="Feeder"
                                      name="feederId"
                                      value={formData.feederId}
                                      onChange={(e) => handleInputChange("feederId", Number(e.target.value))}
                                      options={feeders.map((feeder: any) => ({
                                        value: feeder.id,
                                        label: feeder.name,
                                      }))}
                                      disabled={isSubmitting || feedersLoading}
                                      error={errors.feederId}
                                      loading={feedersLoading}
                                      searchable={true}
                                      searchTerm={feederSearchTerm}
                                      onSearchChange={setFeederSearchTerm}
                                    />
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}

                      {activeTab === "status" && (
                        <motion.div
                          key="status"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                formData.isActive
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                              onClick={() => handleInputChange("isActive", !formData.isActive)}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm text-gray-500">Active Status</p>
                                  <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
                                    <CheckCircle2
                                      className={`size-5 ${formData.isActive ? "text-emerald-600" : "text-gray-400"}`}
                                    />
                                    {formData.isActive ? "Active" : "Inactive"}
                                  </p>
                                </div>
                                <div
                                  className={`rounded-full p-2 ${formData.isActive ? "bg-emerald-100" : "bg-gray-100"}`}
                                >
                                  <Power
                                    className={`size-5 ${formData.isActive ? "text-emerald-600" : "text-gray-500"}`}
                                  />
                                </div>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                {formData.isActive
                                  ? "Promo is currently active and can be used"
                                  : "Promo is inactive and cannot be used"}
                              </p>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                formData.isPaused
                                  ? "border-amber-500 bg-amber-50"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                              onClick={() => handleInputChange("isPaused", !formData.isPaused)}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm text-gray-500">Pause State</p>
                                  <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
                                    <Clock3
                                      className={`size-5 ${formData.isPaused ? "text-amber-600" : "text-blue-600"}`}
                                    />
                                    {formData.isPaused ? "Paused" : "Running"}
                                  </p>
                                </div>
                                <div
                                  className={`rounded-full p-2 ${formData.isPaused ? "bg-amber-100" : "bg-blue-100"}`}
                                >
                                  <Clock3
                                    className={`size-5 ${formData.isPaused ? "text-amber-600" : "text-blue-600"}`}
                                  />
                                </div>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                {formData.isPaused ? "Promo is temporarily paused" : "Promo is running normally"}
                              </p>
                            </motion.div>
                          </div>

                          {/* Status Combination Warning */}
                          {formData.isActive && formData.isPaused && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                            >
                              <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-amber-600" />
                                <div>
                                  <p className="font-medium text-amber-800">Mixed Status Configuration</p>
                                  <p className="mt-1 text-sm text-amber-700">
                                    This promo is marked as Active but Paused. When paused, active promos won&apos;t be
                                    available to users even though they&apos;re marked as active.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Compact Form Actions */}
                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="text-xs text-gray-500">
                        {Object.keys(errors).length > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="size-3" />
                            {Object.keys(errors).length} error(s)
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <ButtonModule
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          disabled={isSubmitting}
                          className="h-8 px-3"
                        >
                          <X className="size-3" />
                        </ButtonModule>
                        <ButtonModule
                          type="submit"
                          variant="primary"
                          disabled={isSubmitting || updateLoading || Object.keys(errors).length > 0}
                          className="h-8 bg-[#004B23] px-4 hover:bg-[#003819]"
                        >
                          {isSubmitting || updateLoading ? (
                            <>
                              <Loader2 className="size-3 animate-spin" />
                              <span className="ml-1">Updating...</span>
                            </>
                          ) : (
                            <>
                              <Save className="size-3" />
                              <span className="ml-1">Update</span>
                            </>
                          )}
                        </ButtonModule>
                      </div>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <Eye className="size-4" />
                      Live Preview
                    </h3>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      Preview Mode
                    </span>
                  </div>

                  {/* Compact Promo Card Preview */}
                  <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-[#004B23] to-[#003819] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-white/20 p-2">
                            <Tag className="size-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-white/80">Promo Code</p>
                            <p className="text-lg font-bold text-white">{formData.code || "CODE"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/80">Discount</p>
                          <p className="text-xl font-bold text-white">{formData.discountPercent}% OFF</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">{formData.name || "Promo Name"}</h3>
                      <p className="mb-3 text-sm text-gray-600">
                        {formData.description || "Promo description will appear here..."}
                      </p>

                      <div className="grid grid-cols-2 gap-3 rounded bg-gray-50 p-3">
                        <div>
                          <p className="text-xs text-gray-500">Valid From</p>
                          <p className="text-xs font-medium text-gray-900">
                            {formatDateForDisplay(formData.startAtUtc)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Valid Until</p>
                          <p className="text-xs font-medium text-gray-900">{formatDateForDisplay(formData.endAtUtc)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Scope</p>
                          <p className="text-xs font-medium text-gray-900">
                            {scopeOptions.find((opt) => opt.value === formData.scope.toString())?.label || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <div className="mt-1 flex gap-1">
                            <span
                              className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs ${
                                statusConfig.isActive[formData.isActive ? "true" : "false"].color
                              }`}
                            >
                              {React.createElement(statusConfig.isActive[formData.isActive ? "true" : "false"].icon, {
                                className: "h-2.5 w-2.5",
                              })}
                              {statusConfig.isActive[formData.isActive ? "true" : "false"].label}
                            </span>
                            <span
                              className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs ${
                                statusConfig.isPaused[formData.isPaused ? "true" : "false"].color
                              }`}
                            >
                              {React.createElement(statusConfig.isPaused[formData.isPaused ? "true" : "false"].icon, {
                                className: "h-2.5 w-2.5",
                              })}
                              {statusConfig.isPaused[formData.isPaused ? "true" : "false"].label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {formData.scope !== 1 && (
                        <div className="mt-3 rounded border border-gray-200 p-3">
                          <p className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-700">
                            <MapPin className="size-3" />
                            Location Details
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {formData.provinceId > 0 && (
                              <div>
                                <p className="text-xs text-gray-500">Province ID</p>
                                <p className="font-medium">{formData.provinceId}</p>
                              </div>
                            )}
                            {formData.areaOfficeId > 0 && (
                              <div>
                                <p className="text-xs text-gray-500">Area Office ID</p>
                                <p className="font-medium">{formData.areaOfficeId}</p>
                              </div>
                            )}
                            {formData.feederId > 0 && (
                              <div>
                                <p className="text-xs text-gray-500">Feeder ID</p>
                                <p className="font-medium">{formData.feederId}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview Actions */}
                  <div className="mt-4 flex justify-end">
                    <ButtonModule variant="primary" onClick={() => setIsPreview(false)} className="h-8 px-3">
                      <Edit3 className="size-3" />
                      <span className="ml-1">Edit</span>
                    </ButtonModule>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Compact Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-4 space-y-4"
            >
              {/* Quick Actions */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Zap className="size-4 text-[#004B23]" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {[
                    { id: "basic", label: "Basic Info", icon: FileText },
                    { id: "discount", label: "Discount", icon: Percent },
                    { id: "schedule", label: "Schedule", icon: Calendar },
                    { id: "scope", label: "Scope", icon: Globe },
                    { id: "status", label: "Status", icon: Power },
                  ].map((action) => (
                    <ButtonModule
                      key={action.id}
                      variant="outline"
                      onClick={() => setActiveTab(action.id)}
                      className="h-8 w-full justify-start gap-2 px-2 text-xs"
                    >
                      {React.createElement(action.icon, { className: "size-3" })}
                      {action.label}
                    </ButtonModule>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Info className="size-4 text-[#004B23]" />
                  Summary
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID</span>
                    <span className="font-mono font-medium text-gray-900">#{promoId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 ${
                        statusConfig.isActive[formData.isActive ? "true" : "false"].color
                      }`}
                    >
                      {React.createElement(statusConfig.isActive[formData.isActive ? "true" : "false"].icon, {
                        className: "h-2.5 w-2.5",
                      })}
                      {statusConfig.isActive[formData.isActive ? "true" : "false"].label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-[#004B23]">{formData.discountPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium">
                      {formData.startAtUtc && formData.endAtUtc
                        ? Math.ceil(
                            (new Date(formData.endAtUtc).getTime() - new Date(formData.startAtUtc).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + "d"
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Scope</span>
                    <span className="font-medium">
                      {scopeOptions.find((opt) => opt.value === formData.scope.toString())?.label || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {Object.keys(errors).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <h4 className="mb-2 flex items-center gap-1 text-xs font-medium text-red-800">
                    <AlertCircle className="size-3" />
                    Validation Errors
                  </h4>
                  <ul className="space-y-1">
                    {Object.entries(errors).map(([field, message]) => (
                      <motion.li
                        key={field}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-1 text-xs text-red-700"
                      >
                        <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-500" />
                        <span className="capitalize">
                          {field}: {message}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPromoPage
