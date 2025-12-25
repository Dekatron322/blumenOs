"use client"

import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddIcon } from "components/Icons/Icons"
import { AppDispatch, RootState } from "lib/redux/store"
import {
  applyFeederEnergyCaps,
  ApplyFeederEnergyCapsRequest,
  clearApplyFeederEnergyCaps,
  clearCreateSingleFeederEnergyCap,
  createSingleFeederEnergyCap,
  CreateSingleFeederEnergyCapRequest,
} from "lib/redux/feederEnergyCapSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import { fetchFeeders } from "lib/redux/feedersSlice"
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, FileText, Menu, X } from "lucide-react"

interface FeederEnergyCapFormData {
  billingPeriodId: number
  energyCapKwh: string
  tariffOverridePerKwh: string
  notes: string
  areaOfficeId?: number
}

interface SingleFeederEnergyCapFormData {
  feederId: number
  billingPeriodId: number
  energyCapKwh: string
  tariffOverridePerKwh: string
  notes: string
}

const AddFeederEnergyCapPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    applyFeederEnergyCapsLoading,
    applyFeederEnergyCapsError,
    applyFeederEnergyCapsSuccess,
    appliedFeederEnergyCaps,
    createSingleFeederEnergyCapLoading,
    createSingleFeederEnergyCapError,
    createSingleFeederEnergyCapSuccess,
    createdSingleFeederEnergyCap,
  } = useSelector((state: RootState) => state.feederEnergyCaps)

  const {
    areaOffices,
    loading: areaOfficesLoading,
    error: areaOfficesError,
  } = useSelector((state: RootState) => state.areaOffices)

  const { billingPeriods, loading: billingPeriodsLoading } = useSelector((state: RootState) => state.billingPeriods)

  const { feeders, loading: feedersLoading, error: feedersError } = useSelector((state: RootState) => state.feeders)

  // Debug: Log feeders data
  useEffect(() => {
    console.log("Feeders data:", feeders)
    console.log("Feeders loading:", feedersLoading)
    console.log("Feeders error:", feedersError)
  }, [feeders, feedersLoading, feedersError])

  const [activeTab, setActiveTab] = useState<"single" | "multiple">("single")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [formData, setFormData] = useState<FeederEnergyCapFormData>({
    billingPeriodId: 0,
    energyCapKwh: "",
    tariffOverridePerKwh: "",
    notes: "",
    areaOfficeId: undefined,
  })

  const [singleFormData, setSingleFormData] = useState<SingleFeederEnergyCapFormData>({
    feederId: 0,
    billingPeriodId: 0,
    energyCapKwh: "",
    tariffOverridePerKwh: "",
    notes: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [singleFormErrors, setSingleFormErrors] = useState<Record<string, string>>({})

  // Fetch area offices and billing periods on component mount
  useEffect(() => {
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )
    dispatch(fetchBillingPeriods({}))
    dispatch(
      fetchFeeders({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch])

  // Generate area office options from API response
  const areaOfficeOptions = [
    { value: 0, label: "No area office (optional)" },
    ...(areaOffices?.map((office) => ({
      value: office.id,
      label: `${office.newKaedcoCode} - ${office.nameOfNewOAreaffice}`,
    })) || []),
  ]

  // Generate period options from API response
  const periodOptions = [
    { value: "", label: "Select billing period" },
    ...(billingPeriods?.map((period) => ({
      value: period.id.toString(),
      label: period.displayName,
    })) || []),
  ]

  // Generate feeder options from API response
  const feederOptions = [
    { value: "", label: "Select feeder" },
    ...(feeders?.map((feeder) => ({
      value: feeder.id.toString(),
      label: `FEEDER-${feeder.id} - ${feeder.name || `Feeder ${feeder.id}`}`,
    })) || []),
  ]

  // Debug: Log feeder options
  useEffect(() => {
    console.log("Generated feeder options:", feederOptions)
  }, [feederOptions])

  // Test function to manually fetch feeders
  const testFetchFeeders = () => {
    console.log("Manual fetch triggered")
    dispatch(
      fetchFeeders({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields and billingPeriodId
    let processedValue = value
    if (["billingPeriodId"].includes(name)) {
      processedValue = Number(value)
    } else if (name === "areaOfficeId") {
      processedValue = value === "" ? undefined : Number(value)
    }
    // Keep energyCapKwh and tariffOverridePerKwh as strings

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

  const handleSingleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields
    let processedValue = value
    if (["feederId", "billingPeriodId"].includes(name)) {
      processedValue = Number(value)
    }
    // Keep energyCapKwh and tariffOverridePerKwh as strings

    setSingleFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    // Clear error when user starts typing
    if (singleFormErrors[name]) {
      setSingleFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (formData.billingPeriodId === 0) {
      errors.billingPeriodId = "Billing period is required"
    }

    if (!formData.energyCapKwh || parseFloat(formData.energyCapKwh) <= 0) {
      errors.energyCapKwh = "Energy cap must be greater than 0"
    }

    if (!formData.tariffOverridePerKwh || parseFloat(formData.tariffOverridePerKwh) < 0) {
      errors.tariffOverridePerKwh = "Tariff override cannot be negative"
    }

    if (!formData.notes.trim()) {
      errors.notes = "Notes are required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateSingleForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (singleFormData.feederId === 0) {
      errors.feederId = "Feeder is required"
    }

    if (singleFormData.billingPeriodId === 0) {
      errors.billingPeriodId = "Billing period is required"
    }

    if (!singleFormData.energyCapKwh || parseFloat(singleFormData.energyCapKwh) <= 0) {
      errors.energyCapKwh = "Energy cap must be greater than 0"
    }

    if (!singleFormData.tariffOverridePerKwh || parseFloat(singleFormData.tariffOverridePerKwh) < 0) {
      errors.tariffOverridePerKwh = "Tariff override cannot be negative"
    }

    if (!singleFormData.notes.trim()) {
      errors.notes = "Notes are required"
    }

    setSingleFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Memoized validation results to prevent infinite re-renders
  const isMultipleFormValid = useMemo(() => {
    const errors: Record<string, string> = {}

    if (formData.billingPeriodId === 0) {
      errors.billingPeriodId = "Billing period is required"
    }

    if (!formData.energyCapKwh || parseFloat(formData.energyCapKwh) <= 0) {
      errors.energyCapKwh = "Energy cap must be greater than 0"
    }

    if (!formData.tariffOverridePerKwh || parseFloat(formData.tariffOverridePerKwh) < 0) {
      errors.tariffOverridePerKwh = "Tariff override cannot be negative"
    }

    if (!formData.notes.trim()) {
      errors.notes = "Notes are required"
    }

    return Object.keys(errors).length === 0
  }, [formData])

  const isSingleFormValid = useMemo(() => {
    const errors: Record<string, string> = {}

    if (singleFormData.feederId === 0) {
      errors.feederId = "Feeder is required"
    }

    if (singleFormData.billingPeriodId === 0) {
      errors.billingPeriodId = "Billing period is required"
    }

    if (!singleFormData.energyCapKwh || parseFloat(singleFormData.energyCapKwh) <= 0) {
      errors.energyCapKwh = "Energy cap must be greater than 0"
    }

    if (!singleFormData.tariffOverridePerKwh || parseFloat(singleFormData.tariffOverridePerKwh) < 0) {
      errors.tariffOverridePerKwh = "Tariff override cannot be negative"
    }

    if (!singleFormData.notes.trim()) {
      errors.notes = "Notes are required"
    }

    return Object.keys(errors).length === 0
  }, [singleFormData])

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitSingleFeederEnergyCap()
  }

  const handleMultipleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitMultipleFeederEnergyCaps()
  }

  const submitSingleFeederEnergyCap = async () => {
    if (!validateSingleForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      const feederEnergyCapData: CreateSingleFeederEnergyCapRequest = {
        feederId: singleFormData.feederId,
        billingPeriodId: singleFormData.billingPeriodId,
        energyCapKwh: parseFloat(singleFormData.energyCapKwh),
        tariffOverridePerKwh: parseFloat(singleFormData.tariffOverridePerKwh),
        notes: singleFormData.notes,
      }

      const result = await dispatch(createSingleFeederEnergyCap(feederEnergyCapData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Feeder energy cap created successfully", {
          description: `Energy cap for feeder ${singleFormData.feederId} has been created for billing period ID ${singleFormData.billingPeriodId}`,
          duration: 5000,
        })

        // Reset form
        setSingleFormData({
          feederId: 0,
          billingPeriodId: 0,
          energyCapKwh: "",
          tariffOverridePerKwh: "",
          notes: "",
        })
        setSingleFormErrors({})
      }
    } catch (error: any) {
      console.error("Failed to create feeder energy cap:", error)
      if (!error?.includes("Network error")) {
        notify("error", "Failed to create feeder energy cap", {
          description: error || "An unexpected error occurred",
          duration: 6000,
        })
      }
    }
  }

  const submitMultipleFeederEnergyCaps = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      const feederEnergyCapData: ApplyFeederEnergyCapsRequest = {
        billingPeriodId: formData.billingPeriodId,
        energyCapKwh: parseFloat(formData.energyCapKwh),
        tariffOverridePerKwh: parseFloat(formData.tariffOverridePerKwh),
        notes: formData.notes,
        areaOfficeId: formData.areaOfficeId || 0,
      }

      const result = await dispatch(applyFeederEnergyCaps(feederEnergyCapData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Feeder energy caps applied successfully", {
          description: `Energy caps for billing period ID ${formData.billingPeriodId} have been applied to ${result.data.length} feeders`,
          duration: 5000,
        })

        // Reset form
        setFormData({
          billingPeriodId: 0,
          energyCapKwh: "",
          tariffOverridePerKwh: "",
          notes: "",
          areaOfficeId: undefined,
        })
        setFormErrors({})
      }
    } catch (error: any) {
      console.error("Failed to apply feeder energy caps:", error)
      if (!error?.includes("Network error")) {
        notify("error", "Failed to apply feeder energy caps", {
          description: error || "An unexpected error occurred",
          duration: 6000,
        })
      }
    }
  }

  const handleReset = () => {
    setFormData({
      billingPeriodId: 0,
      energyCapKwh: "",
      tariffOverridePerKwh: "",
      notes: "",
      areaOfficeId: undefined,
    })
    setFormErrors({})
    setSingleFormData({
      feederId: 0,
      billingPeriodId: 0,
      energyCapKwh: "",
      tariffOverridePerKwh: "",
      notes: "",
    })
    setSingleFormErrors({})
    dispatch(clearApplyFeederEnergyCaps())
    dispatch(clearCreateSingleFeederEnergyCap())
  }

  // Mobile Tab Navigation
  const MobileTabNavigation = () => (
    <div className="sticky top-0 z-40 mb-4 rounded-lg bg-white p-3 shadow-sm sm:hidden">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="size-4" />
          <span>{activeTab === "single" ? "Single Application" : "Multiple Application"}</span>
        </button>
        <div className="text-sm font-medium text-gray-900">
          {activeTab === "single" ? "Single Feeder Cap" : "Multiple Feeder Caps"}
        </div>
      </div>
    </div>
  )

  // Mobile Menu Sidebar
  const MobileMenuSidebar = () => (
    <>
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 sm:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white shadow-xl transition-transform duration-200 ease-in-out sm:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
              <button
                type="button"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600">Choose application method</p>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("single")
                  setIsMobileMenuOpen(false)
                }}
                className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                  activeTab === "single" ? "bg-blue-50 text-blue-600" : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`flex size-7 flex-shrink-0 items-center justify-center rounded-full ${
                    activeTab === "single" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <FileText className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Single Application</div>
                  <div className="mt-1 text-xs text-gray-600">Apply cap to individual feeder</div>
                </div>
                {activeTab === "single" && <ChevronRight className="size-4 flex-shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("multiple")
                  setIsMobileMenuOpen(false)
                }}
                className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                  activeTab === "multiple" ? "bg-blue-50 text-blue-600" : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`flex size-7 flex-shrink-0 items-center justify-center rounded-full ${
                    activeTab === "multiple" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <FileText className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Multiple Application</div>
                  <div className="mt-1 text-xs text-gray-600">Apply caps to multiple feeders</div>
                </div>
                {activeTab === "multiple" && <ChevronRight className="size-4 flex-shrink-0" />}
              </button>
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="border-t bg-gray-50 p-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-900"
            >
              Close Menu
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-3 xl:px-16">
            {/* Page Header - Mobile Optimized */}
            <div className="mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 sm:hidden"
                    aria-label="Go back"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Apply Feeder Energy Caps</h1>
                    <p className="text-sm text-gray-600">Set energy caps and tariff overrides for feeders</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <MobileTabNavigation />

            {/* Mobile Menu Sidebar */}
            <MobileMenuSidebar />

            {/* Desktop Tab Navigation */}
            <div className="hidden sm:block">
              <div className="rounded-t-lg border-b border-gray-200 bg-white">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("single")}
                    className={`flex-1 rounded-tl-lg px-4 py-3 text-sm font-medium transition-colors sm:px-6 ${
                      activeTab === "single"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Single Application
                  </button>
                  <button
                    onClick={() => setActiveTab("multiple")}
                    className={`flex-1 rounded-tr-lg px-4 py-3 text-sm font-medium transition-colors sm:px-6 ${
                      activeTab === "multiple"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Multiple Application
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full">
              {activeTab === "single" ? (
                /* Single Application Form */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-b-lg rounded-tl-lg bg-white p-4 shadow-sm sm:rounded-t-lg sm:p-6"
                >
                  {/* Form Header */}
                  <div className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Single Feeder Energy Cap</h3>
                    <p className="text-sm text-gray-600">Apply energy cap to a specific feeder</p>
                  </div>

                  {/* Single Form */}
                  <form onSubmit={handleSingleSubmit} className="space-y-8">
                    {/* Section 1: Feeder & Period Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-4 sm:p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Feeder & Period Information</h4>
                        <p className="text-sm text-gray-600">Select the feeder and billing period</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormSelectModule
                          label="Feeder"
                          name="feederId"
                          value={singleFormData.feederId.toString()}
                          onChange={handleSingleFormChange}
                          options={feederOptions}
                          required
                          error={singleFormErrors.feederId}
                          disabled={feedersLoading}
                        />

                        <FormSelectModule
                          label="Billing Period"
                          name="billingPeriodId"
                          value={singleFormData.billingPeriodId.toString()}
                          onChange={handleSingleFormChange}
                          options={periodOptions}
                          required
                          error={singleFormErrors.billingPeriodId}
                          disabled={billingPeriodsLoading}
                        />
                      </div>
                    </div>

                    {/* Section 2: Energy Cap Details */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-4 sm:p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Energy Cap Details</h4>
                        <p className="text-sm text-gray-600">Set the energy cap and tariff override values</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Energy Cap (kWh)"
                          name="energyCapKwh"
                          type="number"
                          value={singleFormData.energyCapKwh}
                          onChange={handleSingleFormChange}
                          placeholder="Enter energy cap in kWh"
                          required
                          error={singleFormErrors.energyCapKwh}
                          min="0"
                          step="0.01"
                        />

                        <FormInputModule
                          label="Tariff Override (per kWh)"
                          name="tariffOverridePerKwh"
                          type="number"
                          value={singleFormData.tariffOverridePerKwh}
                          onChange={handleSingleFormChange}
                          placeholder="Enter tariff override"
                          required
                          error={singleFormErrors.tariffOverridePerKwh}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Section 3: Additional Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-4 sm:p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                        <p className="text-sm text-gray-600">Provide any additional notes or comments</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormInputModule
                          label="Notes"
                          name="notes"
                          type="text"
                          value={singleFormData.notes}
                          onChange={handleSingleFormChange}
                          placeholder="Enter notes for this energy cap"
                          required
                          error={singleFormErrors.notes}
                        />
                      </div>
                    </div>

                    {/* Success Message */}
                    {createSingleFeederEnergyCapSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-green-200 bg-green-50 p-4"
                      >
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <CheckCircle className="size-5 text-green-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Success</h3>
                            <p className="mt-1 text-sm text-green-700">
                              Feeder energy cap created successfully for feeder {singleFormData.feederId}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Error Message */}
                    {createSingleFeederEnergyCapError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-red-200 bg-red-50 p-4"
                      >
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="size-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="mt-1 text-sm text-red-700">{createSingleFeederEnergyCapError}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                      <ButtonModule
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={createSingleFeederEnergyCapLoading}
                      >
                        Reset
                      </ButtonModule>
                      <ButtonModule
                        type="submit"
                        disabled={!isSingleFormValid || createSingleFeederEnergyCapLoading}
                        className="w-full sm:w-auto"
                      >
                        {createSingleFeederEnergyCapLoading ? "Creating..." : "Create Energy Cap"}
                      </ButtonModule>
                    </div>
                  </form>
                </motion.div>
              ) : activeTab === "multiple" ? (
                /* Multiple Application Form (existing single form) */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-b-lg rounded-tl-lg bg-white p-4 shadow-sm sm:rounded-t-lg sm:p-6"
                >
                  {/* Form Header */}
                  <div className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Feeder Energy Cap Information</h3>
                    <p className="text-sm text-gray-600">Apply energy caps to multiple feeders</p>
                  </div>

                  {/* Feeder Energy Cap Form */}
                  <form onSubmit={handleMultipleSubmit} className="space-y-8">
                    {/* Section 1: Area Office & Period Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-4 sm:p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Area Office & Period</h4>
                        <p className="text-sm text-gray-600">Select the area office and billing period</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormSelectModule
                          label="Area Office (Optional)"
                          name="areaOfficeId"
                          value={formData.areaOfficeId || ""}
                          onChange={handleInputChange}
                          options={[
                            {
                              value: "",
                              label: areaOfficesLoading ? "Loading area offices..." : "No area office",
                            },
                            ...areaOfficeOptions.filter((option) => option.value !== 0),
                          ]}
                          error={formErrors.areaOfficeId}
                          disabled={areaOfficesLoading}
                        />

                        <FormSelectModule
                          label="Billing Period"
                          name="billingPeriodId"
                          value={formData.billingPeriodId}
                          onChange={handleInputChange}
                          options={periodOptions}
                          error={formErrors.billingPeriodId}
                          required
                        />
                      </div>
                    </div>

                    {/* Section 2: Energy Cap Details */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-4 sm:p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Energy Cap Details</h4>
                        <p className="text-sm text-gray-600">Set the energy cap and tariff override values</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Energy Cap (kWh)"
                          name="energyCapKwh"
                          type="number"
                          placeholder="Enter energy cap"
                          value={formData.energyCapKwh}
                          onChange={handleInputChange}
                          error={formErrors.energyCapKwh}
                          required
                          step="0.01"
                          min="0.01"
                        />

                        <FormInputModule
                          label="Tariff Override (per kWh)"
                          name="tariffOverridePerKwh"
                          type="number"
                          placeholder="Enter tariff override"
                          value={formData.tariffOverridePerKwh}
                          onChange={handleInputChange}
                          error={formErrors.tariffOverridePerKwh}
                          required
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Section 3: Additional Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-4 sm:p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                        <p className="text-sm text-gray-600">Provide any additional notes or comments</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormInputModule
                          label="Notes"
                          name="notes"
                          type="text"
                          placeholder="Enter any notes about these energy caps (e.g., special conditions, seasonal adjustments, etc.)"
                          value={formData.notes}
                          onChange={handleInputChange}
                          error={formErrors.notes}
                          required
                        />
                      </div>
                    </div>

                    {/* Error Summary */}
                    {Object.keys(formErrors).length > 0 && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <AlertCircle className="size-5 text-amber-400" />
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

                    {/* Form Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end sm:gap-4">
                      <ButtonModule
                        variant="dangerSecondary"
                        size="lg"
                        onClick={handleReset}
                        disabled={applyFeederEnergyCapsLoading}
                        type="button"
                        className="w-full sm:w-auto"
                      >
                        Reset
                      </ButtonModule>
                      <ButtonModule variant="primary" size="lg" type="submit" className="w-full sm:w-auto">
                        {applyFeederEnergyCapsLoading ? "Applying Caps..." : "Apply Energy Caps"}
                      </ButtonModule>
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* Bulk Upload Section */
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AddFeederEnergyCapPage
