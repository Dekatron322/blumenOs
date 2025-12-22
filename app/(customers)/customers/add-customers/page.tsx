"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddCustomerIcon } from "components/Icons/Icons"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearCreateState, createCustomer, CreateCustomerRequest } from "lib/redux/createCustomerSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { fetchEmployees } from "lib/redux/employeeSlice"
import { fetchCustomerCategories, fetchSubCategoriesByCategoryId } from "lib/redux/customersCategoriesSlice"
import { fetchCountries } from "lib/redux/countriesSlice"
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"

interface CustomerFormData {
  fullName: string
  phoneNumber: string
  phoneOffice: string
  gender: string
  email: string
  address: string
  distributionSubstationId: number
  addressTwo: string
  city: string
  state: string
  lga: string
  serviceCenterId: number
  latitude: number
  longitude: number
  tariff: number
  tariffCode: string
  tariffID: string
  tariffInddex: string
  tariffType: string
  tariffClass: string
  newRate: number
  vat: number
  isVATWaved: boolean
  isPPM: boolean
  isMD: boolean
  isUrban: boolean
  isHRB: boolean
  isCustomerAccGovt: boolean
  comment: string
  band: string
  storedAverage: number
  salesRepUserId: number
  technicalEngineerUserId: number
  customerCategoryId: number
  customerSubCategoryId: number
}

const AddCustomerPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const { createLoading, createError, createSuccess, createdCustomers } = useSelector(
    (state: RootState) => state.createCustomer
  )

  const {
    distributionSubstations,
    loading: distributionSubstationsLoading,
    error: distributionSubstationsError,
  } = useSelector((state: RootState) => state.distributionSubstations)

  const {
    serviceStations,
    loading: serviceStationsLoading,
    error: serviceStationsError,
  } = useSelector((state: RootState) => state.serviceStations)

  const { employees, employeesLoading, employeesError } = useSelector((state: RootState) => state.employee)

  const {
    categories: customerCategories,
    loading: customerCategoriesLoading,
    error: customerCategoriesError,
  } = useSelector((state: RootState) => state.customerCategories)

  const { subCategories, subCategoriesLoading } = useSelector((state: RootState) => state.customerCategories)

  const {
    countries,
    loading: countriesLoading,
    error: countriesError,
  } = useSelector((state: RootState) => state.countries)

  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: "",
    phoneNumber: "",
    phoneOffice: "",
    gender: "",
    email: "",
    address: "",
    distributionSubstationId: 0,
    addressTwo: "",
    city: "",
    state: "",
    lga: "",
    serviceCenterId: 0,
    latitude: 0,
    longitude: 0,
    tariff: 0,
    tariffCode: "",
    tariffID: "",
    tariffInddex: "",
    tariffType: "",
    tariffClass: "",
    newRate: 0,
    vat: 0,
    isVATWaved: false,
    isPPM: false,
    isMD: false,
    isUrban: false,
    isHRB: false,
    isCustomerAccGovt: false,
    comment: "",
    band: "",
    storedAverage: 0,
    salesRepUserId: 0,
    technicalEngineerUserId: 0,
    customerCategoryId: 0,
    customerSubCategoryId: 0,
  })

  // Fetch related data when component mounts
  React.useEffect(() => {
    dispatch(
      fetchDistributionSubstations({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    dispatch(
      fetchServiceStations({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    dispatch(
      fetchEmployees({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    dispatch(fetchCustomerCategories())

    // Load countries so we can populate provinces (states) for Nigeria
    dispatch(fetchCountries())
  }, [dispatch])

  // Fetch subcategories whenever a customer category is selected
  React.useEffect(() => {
    if (formData.customerCategoryId && formData.customerCategoryId !== 0) {
      dispatch(fetchSubCategoriesByCategoryId(formData.customerCategoryId))
    }
  }, [dispatch, formData.customerCategoryId])

  // Handle success and error states
  React.useEffect(() => {
    if (createSuccess) {
      notify("success", "Customer created successfully", {
        description: `${formData.fullName} has been added to the system`,
        duration: 5000,
      })
      handleReset()
    }

    if (createError) {
      notify("error", "Failed to create customer", {
        description: createError,
        duration: 6000,
      })
    }
  }, [createSuccess, createError, formData.fullName])

  // Clear state when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearCreateState())
    }
  }, [dispatch])

  // Options for dropdowns
  const genderOptions = [
    { value: "", label: "Select gender" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ]

  const bandOptions = [
    { value: "", label: "Select band" },
    { value: "Band A", label: "Band A" },
    { value: "Band B", label: "Band B" },
    { value: "Band C", label: "Band C" },
    { value: "Band D", label: "Band D" },
    { value: "Band E", label: "Band E" },
  ]

  const tariffTypeOptions = [
    { value: "", label: "Select tariff type" },
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
    { value: "Industrial", label: "Industrial" },
  ]

  const booleanOptions = [
    { value: "", label: "Select option" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  // Distribution substation options from fetched data
  const distributionSubstationOptions = [
    { value: 0, label: "Select distribution substation" },
    ...distributionSubstations.map((substation) => ({
      value: substation.id,
      label: `${substation.dssCode} (${substation.nercCode})`,
    })),
  ]

  // Customer category options from fetched data
  const customerCategoryOptions = [
    { value: 0, label: "Select customer category" },
    ...customerCategories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ]

  // Customer sub-category options based on selected category
  const customerSubCategoryOptions = [
    { value: 0, label: "Select sub-category" },
    ...subCategories
      .filter((sub) => sub.customerCategoryId === formData.customerCategoryId)
      .map((sub) => ({ value: sub.id, label: sub.name })),
  ]

  // Province (state) options from countries endpoint (Nigeria only)
  const nigeria = countries.find(
    (country) => country.name.toLowerCase() === "nigeria" || country.abbreviation.toUpperCase() === "NG"
  )

  const provinceOptions = [
    { value: "", label: "Select state" },
    ...((nigeria?.provinces ?? []).map((province) => ({
      value: province.name,
      label: province.name,
    })) || []),
  ]

  // Service center options from fetched data
  const serviceCenterOptions = [
    { value: 0, label: "Select service center" },
    ...serviceStations.map((serviceStation) => ({
      value: serviceStation.id,
      label: `${serviceStation.name} (${serviceStation.code})`,
    })),
  ]

  // Employee options for sales rep and technical engineer
  const employeeOptions = [
    { value: 0, label: "Select employee" },
    ...employees.map((employee) => ({
      value: employee.id,
      label: `${employee.fullName} (${employee.email})`,
    })),
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields
    let processedValue = value
    if (
      [
        "distributionSubstationId",
        "serviceCenterId",
        "latitude",
        "longitude",
        "tariff",
        "newRate",
        "vat",
        "storedAverage",
        "salesRepUserId",
        "technicalEngineerUserId",
        "customerCategoryId",
        "customerSubCategoryId",
      ].includes(name)
    ) {
      processedValue = value === "" ? 0 : Number(value)
    }

    // Handle boolean fields
    if (["isVATWaved", "isPPM", "isMD", "isUrban", "isHRB", "isCustomerAccGovt"].includes(name)) {
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
      case 1: // Personal Information
        if (!formData.fullName.trim()) errors.fullName = "Full name is required"
        if (!formData.phoneNumber.trim()) {
          errors.phoneNumber = "Phone number is required"
        } else if (!/^(\+?234|0)[789][01]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
          errors.phoneNumber = "Please enter a valid Nigerian phone number"
        }
        if (!formData.email.trim()) {
          errors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Please enter a valid email address"
        }
        if (!formData.gender.trim()) errors.gender = "Gender is required"
        break

      case 2: // Address Information
        if (!formData.address.trim()) errors.address = "Address is required"
        break

      case 3: // Service Information
        if (!formData.distributionSubstationId || formData.distributionSubstationId === 0) {
          errors.distributionSubstationId = "Distribution substation is required"
        }
        if (!formData.serviceCenterId || formData.serviceCenterId === 0) {
          errors.serviceCenterId = "Service center is required"
        }
        if (!formData.band.trim()) errors.band = "Band is required"
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 7))
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
      const createData: CreateCustomerRequest = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        phoneOffice: formData.phoneOffice,
        gender: formData.gender,
        customerID: "",
        autoNumber: "",
        isCustomerNew: true,
        isPostEnumerated: false,
        statusCode: "ACTIVE",
        isReadyforExtraction: false,
        email: formData.email,
        address: formData.address,
        distributionSubstationId: formData.distributionSubstationId,
        addressTwo: formData.addressTwo,
        city: formData.city,
        state: formData.state,
        lga: formData.lga,
        serviceCenterId: formData.serviceCenterId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        tariff: formData.tariff,
        tariffCode: formData.tariffCode,
        tariffID: formData.tariffID,
        tariffInddex: formData.tariffInddex,
        tariffType: formData.tariffType,
        tariffClass: formData.tariffClass,
        newRate: formData.newRate,
        vat: formData.vat,
        isVATWaved: formData.isVATWaved,
        isPPM: formData.isPPM,
        isMD: formData.isMD,
        isUrban: formData.isUrban,
        isHRB: formData.isHRB,
        isCustomerAccGovt: formData.isCustomerAccGovt,
        comment: formData.comment,
        band: formData.band,
        storedAverage: formData.storedAverage,
        salesRepUserId: formData.salesRepUserId,
        technicalEngineerUserId: formData.technicalEngineerUserId,
        customerCategoryId: formData.customerCategoryId,
        customerSubCategoryId: formData.customerSubCategoryId,
      }

      await dispatch(createCustomer(createData)).unwrap()
    } catch (error: any) {
      console.error("Failed to create customer:", error)
    }
  }

  const handleReset = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      phoneOffice: "",
      gender: "",
      email: "",
      address: "",
      distributionSubstationId: 0,
      addressTwo: "",
      city: "",
      state: "",
      lga: "",
      serviceCenterId: 0,
      latitude: 0,
      longitude: 0,
      tariff: 0,
      tariffCode: "",
      tariffID: "",
      tariffInddex: "",
      tariffType: "",
      tariffClass: "",
      newRate: 0,
      vat: 0,
      isVATWaved: false,
      isPPM: false,
      isMD: false,
      isUrban: false,
      isHRB: false,
      isCustomerAccGovt: false,
      comment: "",
      band: "",
      storedAverage: 0,
      salesRepUserId: 0,
      technicalEngineerUserId: 0,
      customerCategoryId: 0,
      customerSubCategoryId: 0,
    })
    setFormErrors({})
    setCurrentStep(1)
    dispatch(clearCreateState())
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
          <span>Step {currentStep}/7</span>
        </button>
        <div className="text-sm font-medium text-gray-900">
          {currentStep === 1 && "Personal"}
          {currentStep === 2 && "Address"}
          {currentStep === 3 && "Service"}
          {currentStep === 4 && "Tariff"}
          {currentStep === 5 && "Meter"}
          {currentStep === 6 && "Financial"}
          {currentStep === 7 && "Additional"}
        </div>
      </div>
    </div>
  )

  // Step progress component for desktop
  const StepProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
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
                {step === 1 && "Personal"}
                {step === 2 && "Address"}
                {step === 3 && "Service"}
                {step === 4 && "Tariff"}
                {step === 5 && "Meter"}
                {step === 6 && "Financial"}
                {step === 7 && "Additional"}
              </span>
            </div>
            {step < 7 && <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#004B23]" : "bg-gray-300"}`} />}
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
                    { step: 1, title: "Personal Information", description: "Personal and contact details" },
                    { step: 2, title: "Address Information", description: "Address and location details" },
                    { step: 3, title: "Service Information", description: "Service and distribution details" },
                    { step: 4, title: "Tariff Information", description: "Tariff and billing details" },
                    { step: 5, title: "Meter and Service Options", description: "Meter and service settings" },
                    { step: 6, title: "Financial Information", description: "Financial and billing details" },
                    { step: 7, title: "Additional Information", description: "Additional details and comments" },
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
                    disabled={createLoading}
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
      formData.fullName.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.distributionSubstationId !== 0 &&
      formData.serviceCenterId !== 0 &&
      formData.band.trim() !== "" &&
      formData.gender.trim() !== ""
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
              disabled={createLoading}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={createLoading}
            className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        <div className="flex gap-2">
          {currentStep < 7 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={createLoading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid() || createLoading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createLoading ? "Adding..." : "Add Customer"}
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

          <div className="mx-auto flex w-full flex-col px-3 py-4 lg:container sm:px-4 md:px-6 xl:px-16">
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
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Add New Customer</h1>
                    <p className="text-sm text-gray-600">Create a new customer account in the system</p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule variant="outline" size="sm" onClick={handleReset} disabled={createLoading}>
                    Reset Form
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isFormValid() || createLoading}
                    icon={<AddCustomerIcon />}
                    iconPosition="start"
                  >
                    {createLoading ? "Adding..." : "Add Customer"}
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
                  <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                  <p className="text-sm text-gray-600">Fill in all required fields to create a new customer account</p>
                </div>

                {/* Desktop Step Progress */}
                <div className="hidden sm:block">
                  <StepProgress />
                </div>

                {/* Customer Form */}
                <form
                  id="customer-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                  }}
                  className="space-y-6"
                >
                  <AnimatePresence mode="wait">
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Personal Information</h4>
                          <p className="text-sm text-gray-600">
                            Enter the customer&apos;s personal and contact details
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormInputModule
                            label="Full Name"
                            name="fullName"
                            type="text"
                            placeholder="Enter full name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            error={formErrors.fullName}
                            required
                          />

                          <FormInputModule
                            label="Phone Number"
                            name="phoneNumber"
                            type="text"
                            placeholder="Enter phone number"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            error={formErrors.phoneNumber}
                            required
                          />

                          <FormInputModule
                            label="Office Phone"
                            name="phoneOffice"
                            type="text"
                            placeholder="Enter office phone (optional)"
                            value={formData.phoneOffice}
                            onChange={handleInputChange}
                          />

                          <FormSelectModule
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            options={genderOptions}
                            error={formErrors.gender}
                            required
                          />

                          <FormInputModule
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={formErrors.email}
                            required
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Address Information */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Address Information</h4>
                          <p className="text-sm text-gray-600">
                            Enter the customer&apos;s address and location details
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                            <FormInputModule
                              label="City"
                              name="city"
                              type="text"
                              placeholder="Enter city"
                              value={formData.city}
                              onChange={handleInputChange}
                            />

                            <FormSelectModule
                              label="State"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              options={provinceOptions}
                              disabled={countriesLoading}
                            />

                            <FormInputModule
                              label="LGA"
                              name="lga"
                              type="text"
                              placeholder="Enter LGA"
                              value={formData.lga}
                              onChange={handleInputChange}
                            />
                          </div>
                          <FormInputModule
                            label="Address Line 1"
                            name="address"
                            type="text"
                            placeholder="Enter address line 1"
                            value={formData.address}
                            onChange={handleInputChange}
                            error={formErrors.address}
                            required
                          />

                          <FormInputModule
                            label="Address Line 2"
                            name="addressTwo"
                            type="text"
                            placeholder="Enter address line 2 (optional)"
                            value={formData.addressTwo}
                            onChange={handleInputChange}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Service Information */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Service Information</h4>
                          <p className="text-sm text-gray-600">
                            Enter the customer&apos;s service and distribution details
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormSelectModule
                            label="Distribution Substation"
                            name="distributionSubstationId"
                            value={formData.distributionSubstationId}
                            onChange={handleInputChange}
                            options={distributionSubstationOptions}
                            error={formErrors.distributionSubstationId}
                            required
                            disabled={distributionSubstationsLoading}
                          />

                          <FormSelectModule
                            label="Service Center"
                            name="serviceCenterId"
                            value={formData.serviceCenterId}
                            onChange={handleInputChange}
                            options={serviceCenterOptions}
                            error={formErrors.serviceCenterId}
                            required
                            disabled={serviceStationsLoading}
                          />

                          <FormInputModule
                            label="Tariff"
                            name="tariff"
                            type="number"
                            placeholder="Enter tariff"
                            value={formData.tariff === 0 ? "" : formData.tariff}
                            onChange={handleInputChange}
                            step="0.01"
                          />

                          <FormSelectModule
                            label="Band"
                            name="band"
                            value={formData.band}
                            onChange={handleInputChange}
                            options={bandOptions}
                            error={formErrors.band}
                            required
                          />
                        </div>

                        {distributionSubstationsLoading && (
                          <p className="text-sm text-gray-500">Loading distribution substations...</p>
                        )}
                        {distributionSubstationsError && (
                          <p className="text-sm text-red-500">
                            Error loading distribution substations: {distributionSubstationsError}
                          </p>
                        )}
                        {serviceStationsLoading && <p className="text-sm text-gray-500">Loading service centers...</p>}
                        {serviceStationsError && (
                          <p className="text-sm text-red-500">Error loading service centers: {serviceStationsError}</p>
                        )}
                      </motion.div>
                    )}

                    {/* Step 4: Tariff Information */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Tariff Information</h4>
                          <p className="text-sm text-gray-600">Enter the customer&apos;s tariff and billing details</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                          <FormInputModule
                            label="Tariff Code"
                            name="tariffCode"
                            type="text"
                            placeholder="Enter tariff code"
                            value={formData.tariffCode}
                            onChange={handleInputChange}
                          />

                          <FormInputModule
                            label="Tariff Index"
                            name="tariffInddex"
                            type="text"
                            placeholder="Enter tariff index"
                            value={formData.tariffInddex}
                            onChange={handleInputChange}
                          />

                          <FormSelectModule
                            label="Tariff Type"
                            name="tariffType"
                            value={formData.tariffType}
                            onChange={handleInputChange}
                            options={tariffTypeOptions}
                          />

                          <FormInputModule
                            label="Tariff Class"
                            name="tariffClass"
                            type="text"
                            placeholder="Enter tariff class"
                            value={formData.tariffClass}
                            onChange={handleInputChange}
                          />

                          <FormSelectModule
                            label="VAT Waved"
                            name="isVATWaved"
                            value={formData.isVATWaved.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 5: Meter and Service Options */}
                    {currentStep === 5 && (
                      <motion.div
                        key="step-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Meter and Service Options</h4>
                          <p className="text-sm text-gray-600">Configure meter and service settings for the customer</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                          <FormSelectModule
                            label="PPM"
                            name="isPPM"
                            value={formData.isPPM.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />

                          <FormSelectModule
                            label="MD"
                            name="isMD"
                            value={formData.isMD.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />

                          <FormSelectModule
                            label="Urban"
                            name="isUrban"
                            value={formData.isUrban.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />

                          <FormSelectModule
                            label="HRB"
                            name="isHRB"
                            value={formData.isHRB.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />

                          <FormSelectModule
                            label="Government Account"
                            name="isCustomerAccGovt"
                            value={formData.isCustomerAccGovt.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 6: Financial Information */}
                    {currentStep === 6 && (
                      <motion.div
                        key="step-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Financial Information</h4>
                          <p className="text-sm text-gray-600">
                            Enter the customer&apos;s financial and billing details
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                          <FormInputModule
                            label="Stored Average"
                            name="storedAverage"
                            type="number"
                            placeholder="Enter stored average"
                            value={formData.storedAverage === 0 ? "" : formData.storedAverage}
                            onChange={handleInputChange}
                            step="0.01"
                          />

                          <FormSelectModule
                            label="Customer Category"
                            name="customerCategoryId"
                            value={formData.customerCategoryId}
                            onChange={handleInputChange}
                            options={customerCategoryOptions}
                            disabled={customerCategoriesLoading}
                          />

                          <FormSelectModule
                            label="Customer Sub-Category"
                            name="customerSubCategoryId"
                            value={formData.customerSubCategoryId}
                            onChange={handleInputChange}
                            options={customerSubCategoryOptions}
                            disabled={subCategoriesLoading || !formData.customerCategoryId}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 7: Additional Information */}
                    {currentStep === 7 && (
                      <motion.div
                        key="step-7"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                          <p className="text-sm text-gray-600">Enter additional customer details and comments</p>
                        </div>

                        <div className="space-y-4">
                          <FormInputModule
                            label="Comment"
                            name="comment"
                            type="text"
                            placeholder="Enter any comments or notes"
                            value={formData.comment}
                            onChange={handleInputChange}
                          />

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                            <FormSelectModule
                              label="Sales Representative"
                              name="salesRepUserId"
                              value={formData.salesRepUserId}
                              onChange={handleInputChange}
                              options={employeeOptions}
                              disabled={employeesLoading}
                            />

                            <FormSelectModule
                              label="Technical Engineer"
                              name="technicalEngineerUserId"
                              value={formData.technicalEngineerUserId}
                              onChange={handleInputChange}
                              options={employeeOptions}
                              disabled={employeesLoading}
                            />
                          </div>

                          {employeesLoading && <p className="text-sm text-gray-500">Loading employees...</p>}
                          {employeesError && (
                            <p className="text-sm text-red-500">Error loading employees: {employeesError}</p>
                          )}
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
                          size="lg"
                          onClick={prevStep}
                          disabled={createLoading}
                          type="button"
                          icon={<ArrowLeft />}
                          iconPosition="start"
                        >
                          Previous
                        </ButtonModule>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <ButtonModule
                        variant="dangerSecondary"
                        size="lg"
                        onClick={handleReset}
                        disabled={createLoading}
                        type="button"
                      >
                        Reset
                      </ButtonModule>

                      {currentStep < 7 ? (
                        <ButtonModule
                          variant="primary"
                          size="lg"
                          onClick={nextStep}
                          type="button"
                          icon={<ArrowRight />}
                          iconPosition="end"
                        >
                          Next
                        </ButtonModule>
                      ) : (
                        <ButtonModule
                          variant="primary"
                          size="lg"
                          type="button"
                          onClick={handleSubmit}
                          disabled={!isFormValid() || createLoading}
                        >
                          {createLoading ? "Adding Customer..." : "Add Customer"}
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

export default AddCustomerPage
