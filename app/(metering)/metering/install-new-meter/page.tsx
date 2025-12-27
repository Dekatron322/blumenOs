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
import { addMeter, AddMeterRequest, clearMetersError } from "lib/redux/metersSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { fetchInjectionSubstations } from "lib/redux/injectionSubstationSlice"
import { fetchFeeders } from "lib/redux/feedersSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { fetchEmployees } from "lib/redux/employeeSlice"
import { fetchCountries } from "lib/redux/countriesSlice"
import { fetchCustomers } from "lib/redux/customerSlice"
import { fetchMeterBrands } from "lib/redux/meterBrandsSlice"
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"

interface MeterFormData {
  customerId: number
  serialNumber: string
  drn: string
  sgc: number
  krn: string
  ti: number
  ea: number
  tct: number
  ken: number
  mfrCode: number
  installationDate: string
  meterAddedBy: string
  meterEditedBy: string
  meterDateCreated: string
  meterType: number
  isSmart: boolean
  meterBrand: string
  meterCategory: string
  isMeterActive: boolean
  status: number
  meterState: number
  sealNumber: string
  tariffRate: number
  tariffIndex: string
  serviceBand: number
  customerClass: string
  injectionSubstationId: number
  distributionSubstationId: number
  feederId: number
  areaOfficeId: number
  state: number
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
}

const InstallNewMeterPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const { loading, error, success } = useSelector((state: RootState) => state.meters)

  const {
    distributionSubstations,
    loading: distributionSubstationsLoading,
    error: distributionSubstationsError,
  } = useSelector((state: RootState) => state.distributionSubstations)

  const {
    injectionSubstations,
    loading: injectionSubstationsLoading,
    error: injectionSubstationsError,
  } = useSelector((state: RootState) => state.injectionSubstations)

  const { feeders, loading: feedersLoading, error: feedersError } = useSelector((state: RootState) => state.feeders)

  const {
    areaOffices,
    loading: areaOfficesLoading,
    error: areaOfficesError,
  } = useSelector((state: RootState) => state.areaOffices)

  const {
    serviceStations,
    loading: serviceStationsLoading,
    error: serviceStationsError,
  } = useSelector((state: RootState) => state.serviceStations)

  const { employees, employeesLoading, employeesError } = useSelector((state: RootState) => state.employee)

  const { countries, loading: countriesLoading } = useSelector((state: RootState) => state.countries)

  const {
    customers,
    loading: customersLoading,
    error: customersError,
  } = useSelector((state: RootState) => state.customers)

  const {
    meterBrands,
    loading: meterBrandsLoading,
    error: meterBrandsError,
  } = useSelector((state: RootState) => state.meterBrands)

  const [formData, setFormData] = useState<MeterFormData>({
    customerId: 0,
    serialNumber: "",
    drn: "",
    sgc: 0,
    krn: "",
    ti: 0,
    ea: 0,
    tct: 0,
    ken: 0,
    mfrCode: 0,
    installationDate: new Date().toISOString(),
    meterAddedBy: "",
    meterEditedBy: "",
    meterDateCreated: new Date().toISOString(),
    meterType: 1,
    isSmart: true,
    meterBrand: "",
    meterCategory: "",
    isMeterActive: true,
    status: 1,
    meterState: 1,
    sealNumber: "",
    tariffRate: 0,
    tariffIndex: "",
    serviceBand: 1,
    customerClass: "",
    injectionSubstationId: 0,
    distributionSubstationId: 0,
    feederId: 0,
    areaOfficeId: 0,
    state: 0,
    address: "",
    addressTwo: "",
    city: "",
    apartmentNumber: "",
  })

  // Fetch related data when component mounts
  useEffect(() => {
    dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchInjectionSubstations({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchFeeders({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 100 }))
    dispatch(fetchServiceStations({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchEmployees({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchCountries())
    dispatch(fetchCustomers({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchMeterBrands({ pageNumber: 1, pageSize: 100 }))
  }, [dispatch])

  // Handle success and error states
  useEffect(() => {
    if (success) {
      notify("success", "Meter installed successfully", {
        description: `Meter ${formData.drn} has been installed`,
        duration: 5000,
      })
      handleReset()
    }

    if (error) {
      notify("error", "Failed to install meter", {
        description: error,
        duration: 6000,
      })
    }
  }, [success, error, formData.drn])

  // Show error notification if customers fail to load
  useEffect(() => {
    if (customersError) {
      notify("error", "Failed to load customers", {
        description: customersError,
        duration: 6000,
      })
    }
  }, [customersError])

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearMetersError())
    }
  }, [dispatch])

  // Options for dropdowns
  const booleanOptions = [
    { value: "", label: "Select option" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  const meterTypeOptions = [
    { value: 1, label: "Prepaid" },
    { value: 2, label: "Postpaid" },
  ]

  const statusOptions = [
    { value: 1, label: "Active" },
    { value: 2, label: "Deactivated" },
    { value: 3, label: "Suspended" },
    { value: 4, label: "Retired" },
  ]

  const meterStateOptions = [
    { value: 1, label: "Good" },
    { value: 2, label: "Tamper" },
    { value: 3, label: "Suspicious" },
    { value: 4, label: "Missing" },
    { value: 5, label: "Unknown" },
  ]

  const serviceBandOptions = [
    { value: 1, label: "A" },
    { value: 2, label: "B" },
    { value: 3, label: "C" },
    { value: 4, label: "D" },
    { value: 5, label: "E" },
  ]

  // Injection substation options from fetched data
  const injectionSubstationOptions = [
    { value: 0, label: "Select injection substation" },
    ...injectionSubstations.map((substation) => ({
      value: substation.id,
      label: `${substation.injectionSubstationCode} (${substation.nercCode})`,
    })),
  ]

  // Distribution substation options from fetched data
  const distributionSubstationOptions = [
    { value: 0, label: "Select distribution substation" },
    ...distributionSubstations.map((substation) => ({
      value: substation.id,
      label: `${substation.dssCode} (${substation.nercCode})`,
    })),
  ]

  // Feeder options from fetched data
  const feederOptions = [
    { value: 0, label: "Select feeder" },
    ...feeders.map((feeder) => ({
      value: feeder.id,
      label: feeder.name || `Feeder ${feeder.id}`,
    })),
  ]

  // Area office options from fetched data
  const areaOfficeOptions = [
    { value: 0, label: "Select area office" },
    ...areaOffices.map((areaOffice) => ({
      value: areaOffice.id,
      label: areaOffice.nameOfNewOAreaffice || `Area Office ${areaOffice.id}`,
    })),
  ]

  // State options from countries endpoint
  const nigeria = countries.find(
    (country) => country.name.toLowerCase() === "nigeria" || country.abbreviation.toUpperCase() === "NG"
  )

  const stateOptions = [
    { value: 0, label: "Select state" },
    ...((nigeria?.provinces ?? []).map((province) => ({
      value: province.id,
      label: province.name,
    })) || []),
  ]

  // Generate customer options from API response
  const customerOptions = [
    { value: 0, label: "Select customer" },
    ...customers.map((customer) => ({
      value: customer.id,
      label: `${customer.accountNumber} - ${customer.fullName}`,
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
        "customerId",
        "sgc",
        "ti",
        "ea",
        "tct",
        "ken",
        "mfrCode",
        "meterType",
        "status",
        "meterState",
        "tariffRate",
        "serviceBand",
        "injectionSubstationId",
        "latitude",
        "longitude",
      ].includes(name)
    ) {
      processedValue = value === "" ? 0 : Number(value)
    }

    // Handle boolean fields
    if (["isSmart", "isMeterActive"].includes(name)) {
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
      case 1: // Basic Identity
        if (!formData.customerId || formData.customerId === 0) {
          errors.customerId = "Customer ID is required"
        }
        if (!formData.serialNumber.trim()) errors.serialNumber = "Serial number is required"
        if (!formData.drn.trim()) errors.drn = "DRN is required"
        if (!formData.sealNumber.trim()) errors.sealNumber = "Seal number is required"
        break

      case 2: // Meter Details
        if (!formData.meterBrand.trim()) errors.meterBrand = "Meter brand is required"
        if (!formData.meterCategory.trim()) errors.meterCategory = "Meter category is required"
        break

      case 3: // Billing + Location
        if (!formData.tariffIndex.trim()) errors.tariffIndex = "Tariff index is required"
        if (!formData.customerClass.trim()) errors.customerClass = "Customer class is required"
        if (!formData.injectionSubstationId || formData.injectionSubstationId === 0) {
          errors.injectionSubstationId = "Injection substation is required"
        }
        if (!formData.distributionSubstationId || formData.distributionSubstationId === 0) {
          errors.distributionSubstationId = "Distribution substation is required"
        }
        if (!formData.feederId || formData.feederId === 0) {
          errors.feederId = "Feeder is required"
        }
        if (!formData.areaOfficeId || formData.areaOfficeId === 0) {
          errors.areaOfficeId = "Area office is required"
        }
        if (!formData.address.trim()) errors.address = "Address is required"
        if (!formData.city.trim()) errors.city = "City is required"
        if (!formData.state || formData.state === 0) errors.state = "State is required"
        break

      case 4: // Technical Details
        // No required fields in technical details
        break

      case 5: // Status + Installation
        if (!formData.status) errors.status = "Status is required"
        if (!formData.meterState) errors.meterState = "Meter state is required"
        if (!formData.installationDate) errors.installationDate = "Installation date is required"
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
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

    // Also validate all steps before final submission
    const allErrors: Record<string, string> = {}
    if (!formData.customerId || formData.customerId === 0) {
      allErrors.customerId = "Customer ID is required"
    }
    if (!formData.serialNumber.trim()) allErrors.serialNumber = "Serial number is required"
    if (!formData.drn.trim()) allErrors.drn = "DRN is required"
    if (!formData.sealNumber.trim()) allErrors.sealNumber = "Seal number is required"
    if (!formData.meterBrand.trim()) allErrors.meterBrand = "Meter brand is required"
    if (!formData.meterCategory.trim()) allErrors.meterCategory = "Meter category is required"
    if (!formData.tariffIndex.trim()) allErrors.tariffIndex = "Tariff index is required"
    if (!formData.customerClass.trim()) allErrors.customerClass = "Customer class is required"
    if (!formData.injectionSubstationId || formData.injectionSubstationId === 0) {
      allErrors.injectionSubstationId = "Injection substation is required"
    }
    if (!formData.distributionSubstationId || formData.distributionSubstationId === 0) {
      allErrors.distributionSubstationId = "Distribution substation is required"
    }
    if (!formData.feederId || formData.feederId === 0) {
      allErrors.feederId = "Feeder is required"
    }
    if (!formData.areaOfficeId || formData.areaOfficeId === 0) {
      allErrors.areaOfficeId = "Area office is required"
    }
    if (!formData.address.trim()) allErrors.address = "Address is required"
    if (!formData.city.trim()) allErrors.city = "City is required"
    if (!formData.state || formData.state === 0) allErrors.state = "State is required"
    if (!formData.status) allErrors.status = "Status is required"
    if (!formData.meterState) allErrors.meterState = "Meter state is required"
    if (!formData.installationDate) allErrors.installationDate = "Installation date is required"

    setFormErrors(allErrors)

    if (Object.keys(allErrors).length > 0) {
      notify("error", "Please fix all form errors before submitting", {
        description: "Some required fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      const meterData: AddMeterRequest = {
        customerId: formData.customerId,
        serialNumber: formData.serialNumber,
        drn: formData.drn,
        sgc: formData.sgc,
        krn: formData.krn,
        ti: formData.ti,
        ea: formData.ea,
        tct: formData.tct,
        ken: formData.ken,
        mfrCode: formData.mfrCode,
        installationDate: formData.installationDate,
        meterAddedBy: formData.meterAddedBy,
        meterEditedBy: formData.meterEditedBy,
        meterDateCreated: formData.meterDateCreated,
        meterType: formData.meterType,
        isSmart: formData.isSmart,
        meterBrand: formData.meterBrand,
        meterCategory: formData.meterCategory,
        isMeterActive: formData.isMeterActive,
        status: formData.status,
        meterState: formData.meterState,
        sealNumber: formData.sealNumber,
        tariffRate: formData.tariffRate,
        tariffIndex: formData.tariffIndex,
        serviceBand: formData.serviceBand,
        customerClass: formData.customerClass,
        injectionSubstationId: formData.injectionSubstationId,
        distributionSubstationId: formData.distributionSubstationId,
        feederId: formData.feederId,
        areaOfficeId: formData.areaOfficeId,
        state: typeof formData.state === "string" ? 0 : formData.state,
        address: formData.address,
        addressTwo: formData.addressTwo,
        city: formData.city,
        apartmentNumber: formData.apartmentNumber,
      }

      await dispatch(addMeter(meterData)).unwrap()
    } catch (error: any) {
      console.error("Failed to install meter:", error)
    }
  }

  const handleReset = () => {
    setFormData({
      customerId: 0,
      serialNumber: "",
      drn: "",
      sgc: 0,
      krn: "",
      ti: 0,
      ea: 0,
      tct: 0,
      ken: 0,
      mfrCode: 0,
      installationDate: new Date().toISOString(),
      meterAddedBy: "",
      meterEditedBy: "",
      meterDateCreated: new Date().toISOString(),
      meterType: 1,
      isSmart: true,
      meterBrand: "",
      meterCategory: "",
      isMeterActive: true,
      status: 1,
      meterState: 1,
      sealNumber: "",
      tariffRate: 0,
      tariffIndex: "",
      serviceBand: 1,
      customerClass: "",
      injectionSubstationId: 0,
      distributionSubstationId: 0,
      feederId: 0,
      areaOfficeId: 0,
      state: 0,
      address: "",
      addressTwo: "",
      city: "",
      apartmentNumber: "",
    })
    setCurrentStep(1)
    setFormErrors({})
    dispatch(clearMetersError())
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
          <span>Step {currentStep}/5</span>
        </button>
        <div className="text-sm font-medium text-gray-900">
          {currentStep === 1 && "Basic Identity"}
          {currentStep === 2 && "Meter Details"}
          {currentStep === 3 && "Billing & Location"}
          {currentStep === 4 && "Technical Details"}
          {currentStep === 5 && "Status & Installation"}
        </div>
      </div>
    </div>
  )

  // Step progress component for desktop
  const StepProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((step) => (
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
                {step === 1 && "Basic Identity"}
                {step === 2 && "Meter Details"}
                {step === 3 && "Billing & Location"}
                {step === 4 && "Technical"}
                {step === 5 && "Status"}
              </span>
            </div>
            {step < 5 && <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#004B23]" : "bg-gray-300"}`} />}
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
                    { step: 1, title: "Basic Identity", description: "Customer and basic meter info" },
                    { step: 2, title: "Meter Details", description: "Meter specifications and type" },
                    { step: 3, title: "Billing & Location", description: "Tariff and location details" },
                    { step: 4, title: "Technical Details", description: "Technical specifications" },
                    { step: 5, title: "Status & Installation", description: "Status and installation details" },
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
                    disabled={loading}
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
      formData.customerId !== 0 &&
      formData.serialNumber.trim() !== "" &&
      formData.drn.trim() !== "" &&
      formData.sealNumber.trim() !== "" &&
      formData.meterBrand.trim() !== "" &&
      formData.meterCategory.trim() !== "" &&
      formData.tariffIndex.trim() !== "" &&
      formData.customerClass.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state !== 0 &&
      formData.injectionSubstationId !== 0 &&
      formData.status !== 0 &&
      formData.meterState !== 0 &&
      formData.installationDate !== ""
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
              disabled={loading}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        <div className="flex gap-2">
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid() || loading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Installing..." : "Install Meter"}
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
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Install New Meter</h1>
                    <p className="text-sm text-gray-600">Install a new meter for a customer</p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule variant="outline" size="sm" onClick={handleReset} disabled={loading}>
                    Reset Form
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? "Installing..." : "Install Meter"}
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
                  <h3 className="text-lg font-semibold text-gray-900">Meter Installation</h3>
                  <p className="text-sm text-gray-600">Fill in all required fields to install a new meter</p>
                </div>

                {/* Desktop Step Progress */}
                <div className="hidden sm:block">
                  <StepProgress />
                </div>

                {/* Meter Form */}
                <form
                  id="meter-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                  }}
                  className="space-y-6"
                >
                  <AnimatePresence mode="wait">
                    {/* Step 1: Basic Identity */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Basic Identity</h4>
                          <p className="text-sm text-gray-600">Enter customer and basic meter identity information</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormSelectModule
                            label="Customer"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleInputChange}
                            options={[
                              { value: 0, label: customersLoading ? "Loading customers..." : "Select customer" },
                              ...customerOptions.filter((option) => option.value !== 0),
                            ]}
                            error={formErrors.customerId}
                            required
                            disabled={customersLoading}
                          />

                          <FormInputModule
                            label="Serial Number"
                            name="serialNumber"
                            type="text"
                            placeholder="Enter serial number"
                            value={formData.serialNumber}
                            onChange={handleInputChange}
                            error={formErrors.serialNumber}
                            required
                          />

                          <FormInputModule
                            label="DRN"
                            name="drn"
                            type="text"
                            placeholder="Enter DRN"
                            value={formData.drn}
                            onChange={handleInputChange}
                            error={formErrors.drn}
                            required
                          />

                          <FormInputModule
                            label="Seal Number"
                            name="sealNumber"
                            type="text"
                            placeholder="Enter seal number"
                            value={formData.sealNumber}
                            onChange={handleInputChange}
                            error={formErrors.sealNumber}
                            required
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Meter Details */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Meter Details</h4>
                          <p className="text-sm text-gray-600">Enter meter specifications and type information</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormSelectModule
                            label="Meter Type"
                            name="meterType"
                            value={formData.meterType}
                            onChange={handleInputChange}
                            options={meterTypeOptions}
                          />

                          <FormSelectModule
                            label="Is Smart"
                            name="isSmart"
                            value={formData.isSmart.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />

                          <FormSelectModule
                            label="Meter Brand"
                            name="meterBrand"
                            value={formData.meterBrand}
                            onChange={handleInputChange}
                            options={[
                              { value: "", label: "Select meter brand" },
                              ...meterBrands.map((brand) => ({
                                value: brand.name,
                                label: brand.name,
                              })),
                            ]}
                            error={formErrors.meterBrand}
                            required
                          />

                          <FormInputModule
                            label="Meter Category"
                            name="meterCategory"
                            type="text"
                            placeholder="Enter meter category"
                            value={formData.meterCategory}
                            onChange={handleInputChange}
                            error={formErrors.meterCategory}
                            required
                          />

                          <FormSelectModule
                            label="Is Meter Active"
                            name="isMeterActive"
                            value={formData.isMeterActive.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Billing + Location */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Billing + Location</h4>
                          <p className="text-sm text-gray-600">Enter billing configuration and location details</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormInputModule
                            label="Tariff Rate"
                            name="tariffRate"
                            type="number"
                            placeholder="Enter tariff rate"
                            value={formData.tariffRate}
                            onChange={handleInputChange}
                          />

                          <FormInputModule
                            label="Tariff Index"
                            name="tariffIndex"
                            type="text"
                            placeholder="Enter tariff index"
                            value={formData.tariffIndex}
                            onChange={handleInputChange}
                            error={formErrors.tariffIndex}
                            required
                          />

                          <FormSelectModule
                            label="Service Band"
                            name="serviceBand"
                            value={formData.serviceBand}
                            onChange={handleInputChange}
                            options={serviceBandOptions}
                          />

                          <FormInputModule
                            label="Customer Class"
                            name="customerClass"
                            type="text"
                            placeholder="Enter customer class"
                            value={formData.customerClass}
                            onChange={handleInputChange}
                            error={formErrors.customerClass}
                            required
                          />

                          <FormSelectModule
                            label="Injection Substation"
                            name="injectionSubstationId"
                            value={formData.injectionSubstationId}
                            onChange={handleInputChange}
                            options={injectionSubstationOptions}
                            error={formErrors.injectionSubstationId}
                            required
                            disabled={injectionSubstationsLoading}
                          />

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
                            label="Feeder"
                            name="feederId"
                            value={formData.feederId}
                            onChange={handleInputChange}
                            options={feederOptions}
                            error={formErrors.feederId}
                            required
                            disabled={feedersLoading}
                          />

                          <FormSelectModule
                            label="Area Office"
                            name="areaOfficeId"
                            value={formData.areaOfficeId}
                            onChange={handleInputChange}
                            options={areaOfficeOptions}
                            error={formErrors.areaOfficeId}
                            required
                            disabled={areaOfficesLoading}
                          />

                          <FormSelectModule
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            options={stateOptions}
                            error={formErrors.state}
                            required
                            disabled={countriesLoading}
                          />

                          <FormInputModule
                            label="Address"
                            name="address"
                            type="text"
                            placeholder="Enter address"
                            value={formData.address}
                            onChange={handleInputChange}
                            error={formErrors.address}
                            required
                          />

                          <FormInputModule
                            label="Address Line 2"
                            name="addressTwo"
                            type="text"
                            placeholder="Enter address line 2"
                            value={formData.addressTwo}
                            onChange={handleInputChange}
                          />

                          <FormInputModule
                            label="City"
                            name="city"
                            type="text"
                            placeholder="Enter city"
                            value={formData.city}
                            onChange={handleInputChange}
                            error={formErrors.city}
                            required
                          />

                          <FormInputModule
                            label="Apartment Number"
                            name="apartmentNumber"
                            type="text"
                            placeholder="Enter apartment number"
                            value={formData.apartmentNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Technical Details */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Technical Details</h4>
                          <p className="text-sm text-gray-600">Enter meter technical specifications and coordinates</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormInputModule
                            label="SGC"
                            name="sgc"
                            type="number"
                            placeholder="Enter SGC"
                            value={formData.sgc}
                            onChange={handleInputChange}
                          />

                          <FormInputModule
                            label="KRN"
                            name="krn"
                            type="text"
                            placeholder="Enter KRN"
                            value={formData.krn}
                            onChange={handleInputChange}
                          />

                          <FormInputModule
                            label="TI"
                            name="ti"
                            type="number"
                            placeholder="Enter TI"
                            value={formData.ti}
                            onChange={handleInputChange}
                          />

                          <FormInputModule
                            label="EA"
                            name="ea"
                            type="number"
                            placeholder="Enter EA"
                            value={formData.ea}
                            onChange={handleInputChange}
                          />

                          <FormInputModule
                            label="TCT"
                            name="tct"
                            type="number"
                            placeholder="Enter TCT"
                            value={formData.tct}
                            onChange={handleInputChange}
                          />

                          <FormInputModule
                            label="KEN"
                            name="ken"
                            type="number"
                            placeholder="Enter KEN"
                            value={formData.ken}
                            onChange={handleInputChange}
                          />

                          <FormInputModule
                            label="MFR Code"
                            name="mfrCode"
                            type="number"
                            placeholder="Enter MFR code"
                            value={formData.mfrCode}
                            onChange={handleInputChange}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 5: Status + Tenant */}
                    {currentStep === 5 && (
                      <motion.div
                        key="step-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Status + Installation</h4>
                          <p className="text-sm text-gray-600">Enter operational status and installation details</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormSelectModule
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            options={statusOptions}
                            error={formErrors.status}
                            required
                          />

                          <FormSelectModule
                            label="Meter State"
                            name="meterState"
                            value={formData.meterState}
                            onChange={handleInputChange}
                            options={meterStateOptions}
                            error={formErrors.meterState}
                            required
                          />

                          <FormInputModule
                            label="Installation Date"
                            name="installationDate"
                            type="datetime-local"
                            value={formData.installationDate.slice(0, 16)}
                            onChange={handleInputChange}
                            error={formErrors.installationDate}
                            required
                            placeholder={""}
                          />

                          <FormInputModule
                            label="Meter Added By"
                            name="meterAddedBy"
                            type="text"
                            placeholder="Enter who added this meter"
                            value={formData.meterAddedBy}
                            onChange={handleInputChange}
                          />

                          <FormInputModule
                            label="Meter Edited By"
                            name="meterEditedBy"
                            type="text"
                            placeholder="Enter who edited this meter"
                            value={formData.meterEditedBy}
                            onChange={handleInputChange}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {/* Desktop Navigation Buttons */}
                <div className="mt-6 hidden justify-between sm:flex">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft className="size-4" />
                        Previous
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {currentStep < 5 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid() || loading}
                        className="flex items-center gap-2 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? "Installing..." : "Install Meter"}
                      </button>
                    )}
                  </div>
                </div>
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

export default InstallNewMeterPage
