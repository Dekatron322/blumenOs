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
import { ArrowLeft, ArrowRight } from "lucide-react"

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
  }, [dispatch])

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

  // Step progress component
  const StepProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full border-2 ${
                  step === currentStep
                    ? "border-[#0A0A0A] bg-[#0A0A0A] text-white"
                    : step < currentStep
                    ? "border-[#0A0A0A] bg-[#0A0A0A] text-white"
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
              <span className={`mt-2 text-xs font-medium ${step === currentStep ? "text-[#0A0A0A]" : "text-gray-500"}`}>
                {step === 1 && "Personal"}
                {step === 2 && "Address"}
                {step === 3 && "Service"}
                {step === 4 && "Tariff"}
                {step === 5 && "Meter"}
                {step === 6 && "Financial"}
                {step === 7 && "Additional"}
              </span>
            </div>
            {step < 7 && <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#0A0A0A]" : "bg-gray-300"}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
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

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="container mx-auto flex flex-col">
            {/* Page Header */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Add New Customer</h4>
                <p className="text-gray-600">Create a new customer account in the system</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule variant="outline" size="md" onClick={handleReset} disabled={createLoading}>
                  Reset Form
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid() || createLoading}
                  icon={<AddCustomerIcon />}
                  iconPosition="start"
                >
                  {createLoading ? "Adding Customer..." : "Add Customer"}
                </ButtonModule>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg bg-white p-6 shadow-sm"
                >
                  {/* Form Header */}
                  <div className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                    <p className="text-sm text-gray-600">
                      Fill in all required fields to create a new customer account
                    </p>
                  </div>

                  <StepProgress />

                  {/* Customer Form */}
                  <form
                    id="customer-form"
                    onSubmit={(e) => {
                      e.preventDefault()
                    }}
                    className="space-y-8"
                  >
                    <AnimatePresence mode="wait">
                      {/* Step 1: Personal Information */}
                      {currentStep === 1 && (
                        <motion.div
                          key="step-1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                        >
                          <div className="border-b pb-4">
                            <h4 className="text-lg font-medium text-gray-900">Personal Information</h4>
                            <p className="text-sm text-gray-600">
                              Enter the customer&apos;s personal and contact details
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                          className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                        >
                          <div className="border-b pb-4">
                            <h4 className="text-lg font-medium text-gray-900">Address Information</h4>
                            <p className="text-sm text-gray-600">
                              Enter the customer&apos;s address and location details
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-6">
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

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                              <FormInputModule
                                label="City"
                                name="city"
                                type="text"
                                placeholder="Enter city"
                                value={formData.city}
                                onChange={handleInputChange}
                              />

                              <FormInputModule
                                label="State"
                                name="state"
                                type="text"
                                placeholder="Enter state"
                                value={formData.state}
                                onChange={handleInputChange}
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

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              <FormInputModule
                                label="Latitude"
                                name="latitude"
                                type="number"
                                placeholder="Enter latitude"
                                value={formData.latitude}
                                onChange={handleInputChange}
                                step="0.000001"
                              />

                              <FormInputModule
                                label="Longitude"
                                name="longitude"
                                type="number"
                                placeholder="Enter longitude"
                                value={formData.longitude}
                                onChange={handleInputChange}
                                step="0.000001"
                              />
                            </div>
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
                          className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                        >
                          <div className="border-b pb-4">
                            <h4 className="text-lg font-medium text-gray-900">Service Information</h4>
                            <p className="text-sm text-gray-600">
                              Enter the customer&apos;s service and distribution details
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                              value={formData.tariff}
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
                          {serviceStationsLoading && (
                            <p className="text-sm text-gray-500">Loading service centers...</p>
                          )}
                          {serviceStationsError && (
                            <p className="text-sm text-red-500">
                              Error loading service centers: {serviceStationsError}
                            </p>
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
                          className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                        >
                          <div className="border-b pb-4">
                            <h4 className="text-lg font-medium text-gray-900">Tariff Information</h4>
                            <p className="text-sm text-gray-600">
                              Enter the customer&apos;s tariff and billing details
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <FormInputModule
                              label="Tariff Code"
                              name="tariffCode"
                              type="text"
                              placeholder="Enter tariff code"
                              value={formData.tariffCode}
                              onChange={handleInputChange}
                            />

                            <FormInputModule
                              label="Tariff ID"
                              name="tariffID"
                              type="text"
                              placeholder="Enter tariff ID"
                              value={formData.tariffID}
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

                            <FormInputModule
                              label="New Rate"
                              name="newRate"
                              type="number"
                              placeholder="Enter new rate"
                              value={formData.newRate}
                              onChange={handleInputChange}
                              step="0.01"
                            />

                            <FormInputModule
                              label="VAT"
                              name="vat"
                              type="number"
                              placeholder="Enter VAT"
                              value={formData.vat}
                              onChange={handleInputChange}
                              step="0.01"
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
                          className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                        >
                          <div className="border-b pb-4">
                            <h4 className="text-lg font-medium text-gray-900">Meter and Service Options</h4>
                            <p className="text-sm text-gray-600">
                              Configure meter and service settings for the customer
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                          className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                        >
                          <div className="border-b pb-4">
                            <h4 className="text-lg font-medium text-gray-900">Financial Information</h4>
                            <p className="text-sm text-gray-600">
                              Enter the customer&apos;s financial and billing details
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <FormInputModule
                              label="Stored Average"
                              name="storedAverage"
                              type="number"
                              placeholder="Enter stored average"
                              value={formData.storedAverage}
                              onChange={handleInputChange}
                              step="0.01"
                            />

                            <FormInputModule
                              label="Customer Category ID"
                              name="customerCategoryId"
                              type="number"
                              placeholder="Enter category ID"
                              value={formData.customerCategoryId}
                              onChange={handleInputChange}
                            />

                            <FormInputModule
                              label="Customer Sub-Category ID"
                              name="customerSubCategoryId"
                              type="number"
                              placeholder="Enter sub-category ID"
                              value={formData.customerSubCategoryId}
                              onChange={handleInputChange}
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
                          className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                        >
                          <div className="border-b pb-4">
                            <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                            <p className="text-sm text-gray-600">Enter additional customer details and comments</p>
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                            <FormInputModule
                              label="Comment"
                              name="comment"
                              type="text"
                              placeholder="Enter any comments or notes"
                              value={formData.comment}
                              onChange={handleInputChange}
                            />

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                    {/* Form Actions */}
                    <div className="flex justify-between gap-4 border-t pt-6">
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
      </div>
    </section>
  )
}

export default AddCustomerPage
