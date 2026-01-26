"use client"

import React, { Suspense, useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearMetersError, replaceMeter, ReplaceMeterRequest } from "lib/redux/metersSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchCountries } from "lib/redux/countriesSlice"
import { fetchCustomerById, fetchCustomers } from "lib/redux/customerSlice"
import { fetchMeterBrands } from "lib/redux/meterBrandsSlice"
import { fetchMeterCategories } from "lib/redux/meterCategorySlice"
import { fetchTariffGroups } from "lib/redux/tariffGroupSlice"
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react"

interface ReplaceMeterFormData {
  customerId: number
  oldMeterId: number
  serialNumber: string
  drn: string
  sgc?: number
  krn: string
  ti?: number
  ea?: number
  tct?: number
  ken?: number
  mfrCode?: number
  installationDate: string
  meterType: number
  isSmart: boolean
  meterBrand: string
  meterCategory: string
  isMeterActive: boolean
  status: number
  meterState: number
  sealNumber: string
  poleNumber: string
  tariffId: number
  distributionSubstationId: number
  areaOfficeId: number
  state: number
  address: string
  addressTwo: string
  city: string
  apartmentNumber: string
  latitude: number
  longitude: number
}

const ReplaceMeterPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCustomerId = searchParams.get("customerId")
  const [currentStep, setCurrentStep] = useState(1)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [successNotified, setSuccessNotified] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [customerMeters, setCustomerMeters] = useState<any[]>([])

  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({
    distributionSubstation: "",
    areaOffice: "",
  })

  const [searchLoading, setSearchLoading] = useState<Record<string, boolean>>({
    distributionSubstation: false,
    areaOffice: false,
  })

  const { loading, error, success } = useSelector((state: RootState) => state.meters)
  const { distributionSubstations, loading: distributionSubstationsLoading } = useSelector(
    (state: RootState) => state.distributionSubstations
  )
  const { areaOffices, loading: areaOfficesLoading } = useSelector((state: RootState) => state.areaOffices)
  const { countries, loading: countriesLoading } = useSelector((state: RootState) => state.countries)
  const {
    customers,
    loading: customersLoading,
    currentCustomer,
    currentCustomerLoading,
  } = useSelector((state: RootState) => state.customers)
  const { meterBrands } = useSelector((state: RootState) => state.meterBrands)
  const { meterCategories } = useSelector((state: RootState) => state.meterCategories)
  const { tariffGroups, tariffGroupsLoading } = useSelector((state: RootState) => state.tariffGroups)

  const [formData, setFormData] = useState<ReplaceMeterFormData>({
    customerId: 0,
    oldMeterId: 0,
    serialNumber: "",
    drn: "",
    sgc: undefined,
    krn: "",
    ti: undefined,
    ea: undefined,
    tct: undefined,
    ken: undefined,
    mfrCode: undefined,
    installationDate: new Date().toISOString(),
    meterType: 1,
    isSmart: false,
    meterBrand: "",
    meterCategory: "",
    isMeterActive: true,
    status: 1,
    meterState: 1,
    sealNumber: "",
    poleNumber: "",
    tariffId: 0,
    distributionSubstationId: 0,
    areaOfficeId: 0,
    state: 0,
    address: "",
    addressTwo: "",
    city: "",
    apartmentNumber: "",
    latitude: 0,
    longitude: 0,
  })

  useEffect(() => {
    dispatch(clearMetersError())
    setIsMounted(true)
    dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 100 }))
    dispatch(fetchCountries())
    dispatch(fetchCustomers({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchMeterBrands({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchMeterCategories({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchTariffGroups({ PageNumber: 1, PageSize: 100, HasNonZeroTariffIndex: true }))
  }, [dispatch])

  useEffect(() => {
    if (preselectedCustomerId) {
      const customerId = Number(preselectedCustomerId)
      dispatch(fetchCustomerById(customerId))
    }
  }, [preselectedCustomerId, dispatch])

  useEffect(() => {
    if (currentCustomer && !currentCustomerLoading) {
      setFormData((prev) => ({
        ...prev,
        customerId: currentCustomer.id,
        address: currentCustomer.address || prev.address,
        addressTwo: currentCustomer.addressTwo || prev.addressTwo,
        city: currentCustomer.city || prev.city,
        state: currentCustomer.provinceId || prev.state,
        latitude: currentCustomer.latitude || prev.latitude,
        longitude: currentCustomer.longitude || prev.longitude,
        distributionSubstationId: currentCustomer.distributionSubstationId || prev.distributionSubstationId,
        areaOfficeId: currentCustomer.serviceCenter?.areaOfficeId || prev.areaOfficeId,
        tariffId: currentCustomer.tariffId || prev.tariffId,
      }))
      setCustomerMeters(currentCustomer.meters || [])
    }
  }, [currentCustomer, currentCustomerLoading])

  const debouncedSearchRef = React.useRef<Record<string, NodeJS.Timeout>>({})

  const handleDistributionSubstationSearch = useCallback(
    (searchTerm: string) => {
      setSearchTerms((prev) => ({ ...prev, distributionSubstation: searchTerm }))
      if (debouncedSearchRef.current.distributionSubstation) {
        clearTimeout(debouncedSearchRef.current.distributionSubstation)
      }
      debouncedSearchRef.current.distributionSubstation = setTimeout(() => {
        if (searchTerm.trim()) {
          setSearchLoading((prev) => ({ ...prev, distributionSubstation: true }))
          dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 50, search: searchTerm.trim() })).finally(
            () => setSearchLoading((prev) => ({ ...prev, distributionSubstation: false }))
          )
        } else if (searchTerm === "") {
          dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 100 }))
        }
      }, 500)
    },
    [dispatch]
  )

  const handleAreaOfficeSearch = useCallback(
    (searchTerm: string) => {
      setSearchTerms((prev) => ({ ...prev, areaOffice: searchTerm }))
      if (debouncedSearchRef.current.areaOffice) {
        clearTimeout(debouncedSearchRef.current.areaOffice)
      }
      debouncedSearchRef.current.areaOffice = setTimeout(() => {
        if (searchTerm.trim()) {
          setSearchLoading((prev) => ({ ...prev, areaOffice: true }))
          dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 50, Search: searchTerm.trim() })).finally(() =>
            setSearchLoading((prev) => ({ ...prev, areaOffice: false }))
          )
        } else if (searchTerm === "") {
          dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 100 }))
        }
      }, 500)
    },
    [dispatch]
  )

  useEffect(() => {
    if (success && !successNotified && isMounted) {
      notify("success", "Meter replaced successfully", {
        description: `Meter ${formData.drn} has been installed as replacement`,
        duration: 5000,
      })
      setSuccessNotified(true)
      router.back()
    }
    if (error) {
      notify("error", "Failed to replace meter", { description: error, duration: 6000 })
    }
  }, [success, error, formData.drn, successNotified, isMounted, router])

  useEffect(() => {
    return () => {
      dispatch(clearMetersError())
      Object.values(debouncedSearchRef.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [dispatch])

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

  const tariffGroupOptions = [
    { value: 0, label: "Select tariff" },
    ...tariffGroups.map((tariff) => ({
      value: tariff.id,
      label: `Band-${String.fromCharCode(64 + tariff.serviceBand)} ${tariff.currency}${tariff.tariffRate}`,
    })),
  ]

  const distributionSubstationOptions = [
    { value: 0, label: "Select distribution substation" },
    ...distributionSubstations.map((substation) => ({
      value: substation.id,
      label: `${substation.dssCode} (${substation.nercCode})`,
    })),
  ]

  const areaOfficeOptions = [
    { value: 0, label: "Select area office" },
    ...areaOffices.map((areaOffice) => ({
      value: areaOffice.id,
      label: areaOffice.nameOfNewOAreaffice || `Area Office ${areaOffice.id}`,
    })),
  ]

  const nigeria = countries.find(
    (country) => country.name.toLowerCase() === "nigeria" || country.abbreviation.toUpperCase() === "NG"
  )

  const stateOptions = [
    { value: 0, label: "Select state" },
    ...((nigeria?.provinces ?? []).map((province) => ({ value: province.id, label: province.name })) || []),
  ]

  const oldMeterOptions = [
    { value: 0, label: "Select meter to replace" },
    ...customerMeters.map((meter) => ({
      value: meter.id,
      label: `${meter.drn || meter.serialNumber} - ${meter.meterBrand || "Unknown Brand"}`,
    })),
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    let processedValue = value

    if (
      [
        "customerId",
        "oldMeterId",
        "meterType",
        "status",
        "meterState",
        "distributionSubstationId",
        "areaOfficeId",
        "state",
        "latitude",
        "longitude",
        "tariffId",
      ].includes(name)
    ) {
      processedValue = value === "" ? 0 : Number(value)
    } else if (["sgc", "ti", "ea", "tct", "ken", "mfrCode"].includes(name)) {
      processedValue = value === "" ? undefined : Number(value)
    }

    if (["isSmart", "isMeterActive"].includes(name)) {
      processedValue = value === "true" || value === true
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }

    // Fetch customer details when customer is selected to get meters
    if (name === "customerId" && processedValue && processedValue !== 0) {
      dispatch(fetchCustomerById(processedValue))
    }
  }

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!formData.oldMeterId || formData.oldMeterId === 0) errors.oldMeterId = "Select a meter to replace"
        if (!formData.serialNumber.trim()) errors.serialNumber = "Serial number is required"
        if (!formData.drn.trim()) errors.drn = "DRN is required"
        if (!formData.sealNumber.trim()) errors.sealNumber = "Seal number is required"
        break
      case 2:
        if (!formData.meterBrand.trim()) errors.meterBrand = "Meter brand is required"
        if (!formData.meterCategory.trim()) errors.meterCategory = "Meter category is required"
        break
      case 3:
        if (!formData.tariffId || formData.tariffId === 0) errors.tariffId = "Tariff is required"
        if (!formData.distributionSubstationId) errors.distributionSubstationId = "Distribution substation is required"
        if (!formData.areaOfficeId) errors.areaOfficeId = "Area office is required"
        if (!formData.address.trim()) errors.address = "Address is required"
        if (!formData.city.trim()) errors.city = "City is required"
        if (!formData.state) errors.state = "State is required"
        break
      case 4:
        if (!formData.sgc) errors.sgc = "SGC is required"
        if (!formData.krn.trim()) errors.krn = "KRN is required"
        break
      case 5:
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

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const handleSubmit = async () => {
    // Reset success notification flag to allow new notifications
    setSuccessNotified(false)

    if (!validateCurrentStep()) {
      notify("error", "Please fix the form errors before submitting", { duration: 4000 })
      return
    }

    const allErrors: Record<string, string> = {}
    if (!formData.oldMeterId) allErrors.oldMeterId = "Select a meter to replace"
    if (!formData.serialNumber.trim()) allErrors.serialNumber = "Serial number is required"
    if (!formData.drn.trim()) allErrors.drn = "DRN is required"
    if (!formData.sealNumber.trim()) allErrors.sealNumber = "Seal number is required"
    if (!formData.sgc) allErrors.sgc = "SGC is required"
    if (!formData.krn.trim()) allErrors.krn = "KRN is required"
    if (!formData.meterBrand.trim()) allErrors.meterBrand = "Meter brand is required"
    if (!formData.meterCategory.trim()) allErrors.meterCategory = "Meter category is required"
    if (!formData.tariffId) allErrors.tariffId = "Tariff is required"
    if (!formData.distributionSubstationId) allErrors.distributionSubstationId = "Distribution substation is required"
    if (!formData.areaOfficeId) allErrors.areaOfficeId = "Area office is required"
    if (!formData.address.trim()) allErrors.address = "Address is required"
    if (!formData.city.trim()) allErrors.city = "City is required"
    if (!formData.state) allErrors.state = "State is required"

    setFormErrors(allErrors)
    if (Object.keys(allErrors).length > 0) {
      notify("error", "Please fix all form errors before submitting", { duration: 4000 })
      return
    }

    try {
      const meterData: ReplaceMeterRequest = {
        customerId: formData.customerId,
        oldMeterId: formData.oldMeterId,
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
        meterType: formData.meterType,
        isSmart: formData.isSmart,
        meterBrand: formData.meterBrand,
        meterCategory: formData.meterCategory,
        isMeterActive: formData.isMeterActive,
        status: formData.status,
        meterState: formData.meterState,
        sealNumber: formData.sealNumber,
        poleNumber: formData.poleNumber,
        tariffId: formData.tariffId,
        distributionSubstationId: formData.distributionSubstationId,
        state: formData.state,
        address: formData.address,
        addressTwo: formData.addressTwo,
        city: formData.city,
        apartmentNumber: formData.apartmentNumber,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }
      await dispatch(replaceMeter(meterData)).unwrap()
    } catch (error: any) {
      console.error("Failed to replace meter:", error)
    }
  }

  const handleReset = () => {
    setFormData({
      customerId: formData.customerId,
      oldMeterId: 0,
      serialNumber: "",
      drn: "",
      sgc: undefined,
      krn: "",
      ti: undefined,
      ea: undefined,
      tct: undefined,
      ken: undefined,
      mfrCode: undefined,
      installationDate: new Date().toISOString(),
      meterType: 1,
      isSmart: false,
      meterBrand: "",
      meterCategory: "",
      isMeterActive: true,
      status: 1,
      meterState: 1,
      sealNumber: "",
      poleNumber: "",
      tariffId: formData.tariffId,
      distributionSubstationId: formData.distributionSubstationId,
      areaOfficeId: formData.areaOfficeId,
      state: formData.state,
      address: formData.address,
      addressTwo: formData.addressTwo,
      city: formData.city,
      apartmentNumber: "",
      latitude: formData.latitude,
      longitude: formData.longitude,
    })
    setCurrentStep(1)
    setFormErrors({})
    setSuccessNotified(false)
    dispatch(clearMetersError())
  }

  const selectedCustomer = customers.find((c) => c.id === formData.customerId)

  const isFormValid = (): boolean => {
    return (
      formData.oldMeterId !== 0 &&
      formData.serialNumber.trim() !== "" &&
      formData.drn.trim() !== "" &&
      formData.sealNumber.trim() !== "" &&
      formData.meterBrand.trim() !== "" &&
      formData.meterCategory.trim() !== "" &&
      formData.tariffId !== 0 &&
      formData.address.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state !== 0
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 2xl:px-16">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    aria-label="Go back"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Replace Meter</h1>
                    <p className="text-sm text-gray-600">
                      {selectedCustomer
                        ? `Replacing meter for ${selectedCustomer.fullName} (${selectedCustomer.accountNumber})`
                        : "Replace an existing meter for a customer"}
                    </p>
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
                    {loading ? "Replacing..." : "Replace Meter"}
                  </ButtonModule>
                </div>
              </div>
            </div>

            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg bg-white p-4 shadow-sm sm:p-6"
              >
                <div className="mb-6 border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Meter Replacement</h3>
                  <p className="text-sm text-gray-600">Select the meter to replace and enter new meter details</p>
                </div>

                <div className="mb-8 hidden sm:block">
                  <div className="flex items-center justify-between">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex size-8 items-center justify-center rounded-full border-2 ${
                              step <= currentStep
                                ? "border-[#004B23] bg-[#004B23] text-white"
                                : "border-gray-300 bg-white text-gray-500"
                            }`}
                          >
                            {step < currentStep ? "✓" : step}
                          </div>
                          <span
                            className={`mt-2 text-xs font-medium ${
                              step === currentStep ? "text-[#004B23]" : "text-gray-500"
                            }`}
                          >
                            {step === 1 && "Select Meter"}
                            {step === 2 && "New Meter Details"}
                            {step === 3 && "Location"}
                            {step === 4 && "Technical"}
                            {step === 5 && "Status"}
                          </span>
                        </div>
                        {step < 5 && (
                          <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#004B23]" : "bg-gray-300"}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <form id="meter-form" onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">Select Meter to Replace</h4>
                          <p className="text-sm text-gray-600">
                            Choose the existing meter and enter new meter identity
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormSelectModule
                            label="Meter to Replace"
                            name="oldMeterId"
                            value={formData.oldMeterId}
                            onChange={handleInputChange}
                            options={oldMeterOptions}
                            error={formErrors.oldMeterId}
                            required
                            disabled={customerMeters.length === 0}
                          />
                          <FormInputModule
                            label="New Serial Number"
                            name="serialNumber"
                            type="text"
                            placeholder="Enter serial number"
                            value={formData.serialNumber}
                            onChange={handleInputChange}
                            error={formErrors.serialNumber}
                            required
                          />
                          <FormInputModule
                            label="New Meter Number (DRN)"
                            name="drn"
                            type="text"
                            placeholder="Enter meter number"
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

                    {currentStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 rounded-lg bg-[#F9f9f9] p-4 sm:space-y-6 sm:p-6"
                      >
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-medium text-gray-900">New Meter Details</h4>
                          <p className="text-sm text-gray-600">Enter the new meter specifications</p>
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
                              ...meterBrands.map((b) => ({ value: b.name, label: b.name })),
                            ]}
                            error={formErrors.meterBrand}
                            required
                          />
                          <FormSelectModule
                            label="Meter Category"
                            name="meterCategory"
                            value={formData.meterCategory}
                            onChange={handleInputChange}
                            options={[
                              { value: "", label: "Select category" },
                              ...meterCategories.map((c) => ({ value: c.name, label: c.name })),
                            ]}
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
                          <p className="text-sm text-gray-600">
                            Billing and location details (prefilled from customer)
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormSelectModule
                            label="Tariff"
                            name="tariffId"
                            value={formData.tariffId}
                            onChange={handleInputChange}
                            options={tariffGroupOptions}
                            error={formErrors.tariffId}
                            required
                            disabled={tariffGroupsLoading}
                          />
                          <FormInputModule
                            label="Pole Number"
                            name="poleNumber"
                            type="text"
                            placeholder="Enter pole number"
                            value={formData.poleNumber}
                            onChange={handleInputChange}
                          />
                          <FormSelectModule
                            label="Distribution Substation"
                            name="distributionSubstationId"
                            value={formData.distributionSubstationId}
                            onChange={handleInputChange}
                            options={distributionSubstationOptions}
                            error={formErrors.distributionSubstationId}
                            required
                            disabled={distributionSubstationsLoading || searchLoading.distributionSubstation}
                            searchable
                            onSearchChange={handleDistributionSubstationSearch}
                            searchTerm={searchTerms.distributionSubstation}
                          />
                          <FormSelectModule
                            label="Area Office"
                            name="areaOfficeId"
                            value={formData.areaOfficeId}
                            onChange={handleInputChange}
                            options={areaOfficeOptions}
                            error={formErrors.areaOfficeId}
                            required
                            disabled={areaOfficesLoading || searchLoading.areaOffice}
                            searchable
                            onSearchChange={handleAreaOfficeSearch}
                            searchTerm={searchTerms.areaOffice}
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
                          <FormInputModule
                            label="Latitude"
                            name="latitude"
                            type="number"
                            placeholder="Enter latitude"
                            value={formData.latitude}
                            onChange={handleInputChange}
                          />
                          <FormInputModule
                            label="Longitude"
                            name="longitude"
                            type="number"
                            placeholder="Enter longitude"
                            value={formData.longitude}
                            onChange={handleInputChange}
                          />
                        </div>
                      </motion.div>
                    )}

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
                          <p className="text-sm text-gray-600">Enter meter technical specifications</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                          <FormInputModule
                            label="SGC"
                            name="sgc"
                            type="number"
                            placeholder="Enter SGC"
                            value={formData.sgc ?? ""}
                            onChange={handleInputChange}
                            error={formErrors.sgc}
                            required
                          />
                          <FormInputModule
                            label="KRN"
                            name="krn"
                            type="text"
                            placeholder="Enter KRN"
                            value={formData.krn}
                            onChange={handleInputChange}
                            error={formErrors.krn}
                            required
                          />
                          <FormInputModule
                            label="EA"
                            name="ea"
                            type="number"
                            placeholder="Enter EA"
                            value={formData.ea ?? ""}
                            onChange={handleInputChange}
                          />
                          <FormInputModule
                            label="TCT"
                            name="tct"
                            type="number"
                            placeholder="Enter TCT"
                            value={formData.tct ?? ""}
                            onChange={handleInputChange}
                          />
                          <FormInputModule
                            label="KEN"
                            name="ken"
                            type="number"
                            placeholder="Enter KEN"
                            value={formData.ken ?? ""}
                            onChange={handleInputChange}
                          />
                          <FormInputModule
                            label="MFR Code"
                            name="mfrCode"
                            type="number"
                            placeholder="Enter MFR code"
                            value={formData.mfrCode ?? ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </motion.div>
                    )}

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
                            placeholder=""
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                <div className="mt-6 flex justify-between">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="size-4" /> Previous
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {currentStep < 5 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#003618] disabled:opacity-50"
                      >
                        Next <ChevronRight className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid() || loading}
                        className="flex items-center gap-2 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#003618] disabled:opacity-50"
                      >
                        {loading ? "Replacing..." : "Replace Meter"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Wrapper component with Suspense boundary
const ReplaceMeterPageWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReplaceMeterPage />
    </Suspense>
  )
}

export default ReplaceMeterPageWrapper
