"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearVendorUpdate, fetchVendorById, updateVendor } from "lib/redux/vendorSlice"
import { fetchEmployees } from "lib/redux/employeeSlice"
import { ArrowLeft, Building, CreditCard, MapPin, Save, User } from "lucide-react"

interface VendorFormData {
  name: string
  phoneNumber: string
  email: string
  address: string
  city: string
  state: string
  canProcessPostpaid: boolean
  canProcessPrepaid: boolean
  posCollectionAllowed: boolean
  urbanCommissionPercent: number
  ruralCommissionPercent: number
  employeeUserId: number
  documentUrls: string[]
  webhookUrl: string
}

const UpdateVendor = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  const vendorId = params?.id ? parseInt(params.id as string) : 0

  const {
    vendorUpdateLoading,
    vendorUpdateError,
    vendorUpdateSuccess,
    currentVendor,
    currentVendorLoading,
    currentVendorError,
  } = useAppSelector((state) => state.vendors)

  const { employees, employeesLoading } = useAppSelector((state) => state.employee)

  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    canProcessPostpaid: false,
    canProcessPrepaid: false,
    posCollectionAllowed: false,
    urbanCommissionPercent: 0,
    ruralCommissionPercent: 0,
    employeeUserId: 0,
    documentUrls: [],
    webhookUrl: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // === EFFECTS ===

  // Fetch vendor data on mount
  useEffect(() => {
    if (vendorId > 0) {
      void dispatch(fetchVendorById(vendorId))
    }

    if (!employees || employees.length === 0) {
      void dispatch(
        fetchEmployees({
          pageNumber: 1,
          pageSize: 1000,
        })
      )
    }
  }, [dispatch, vendorId, employees])

  // Populate form when vendor data is loaded
  useEffect(() => {
    if (currentVendor && !isDataLoaded) {
      setFormData({
        name: currentVendor.name || "",
        phoneNumber: currentVendor.phoneNumber || "",
        email: currentVendor.email || "",
        address: currentVendor.address || "",
        city: currentVendor.city || "",
        state: currentVendor.state || "",
        canProcessPostpaid: currentVendor.canProcessPostpaid || false,
        canProcessPrepaid: currentVendor.canProcessPrepaid || false,
        posCollectionAllowed: currentVendor.posCollectionAllowed || false,
        urbanCommissionPercent: currentVendor.urbanCommissionPercent || 0,
        ruralCommissionPercent: currentVendor.ruralCommissionPercent || 0,
        employeeUserId: currentVendor.employeeUserId || 0,
        documentUrls: currentVendor.documentUrls || [],
        webhookUrl: currentVendor.webhookUrl || "",
      })
      setIsDataLoaded(true)
    }
  }, [currentVendor, isDataLoaded])

  // Handle success state
  useEffect(() => {
    if (vendorUpdateSuccess) {
      notify("success", "Vendor updated successfully", {
        description: "Vendor information has been updated successfully.",
        duration: 6000,
      })
      dispatch(clearVendorUpdate())

      // Navigate back after successful update
      setTimeout(() => {
        router.push(`/vendor-management/vendor-detail/${vendorId}`)
      }, 2000)
    }
  }, [vendorUpdateSuccess, dispatch, router])

  // Handle error state
  useEffect(() => {
    if (vendorUpdateError) {
      notify("error", "Failed to update vendor", {
        description: vendorUpdateError,
        duration: 6000,
      })
    }
  }, [vendorUpdateError])

  // === HELPER FUNCTIONS ===

  const employeeOptions = [
    { value: "", label: employeesLoading ? "Loading employees..." : "Select employee" },
    ...employees.map((employee) => ({
      value: employee.id.toString(),
      label: `${employee.fullName} (${employee.email})`,
    })),
  ]

  // Options for dropdowns
  const stateOptions = [
    { value: "", label: "Select state" },
    { value: "Abia", label: "Abia" },
    { value: "Adamawa", label: "Adamawa" },
    { value: "Akwa Ibom", label: "Akwa Ibom" },
    { value: "Anambra", label: "Anambra" },
    { value: "Bauchi", label: "Bauchi" },
    { value: "Bayelsa", label: "Bayelsa" },
    { value: "Benue", label: "Benue" },
    { value: "Borno", label: "Borno" },
    { value: "Cross River", label: "Cross River" },
    { value: "Delta", label: "Delta" },
    { value: "Ebonyi", label: "Ebonyi" },
    { value: "Edo", label: "Edo" },
    { value: "Ekiti", label: "Ekiti" },
    { value: "Enugu", label: "Enugu" },
    { value: "FCT", label: "Federal Capital Territory" },
    { value: "Gombe", label: "Gombe" },
    { value: "Imo", label: "Imo" },
    { value: "Jigawa", label: "Jigawa" },
    { value: "Kaduna", label: "Kaduna" },
    { value: "Kano", label: "Kano" },
    { value: "Katsina", label: "Katsina" },
    { value: "Kebbi", label: "Kebbi" },
    { value: "Kogi", label: "Kogi" },
    { value: "Kwara", label: "Kwara" },
    { value: "Lagos", label: "Lagos" },
    { value: "Nasarawa", label: "Nasarawa" },
    { value: "Niger", label: "Niger" },
    { value: "Ogun", label: "Ogun" },
    { value: "Ondo", label: "Ondo" },
    { value: "Osun", label: "Osun" },
    { value: "Oyo", label: "Oyo" },
    { value: "Plateau", label: "Plateau" },
    { value: "Rivers", label: "Rivers" },
    { value: "Sokoto", label: "Sokoto" },
    { value: "Taraba", label: "Taraba" },
    { value: "Yobe", label: "Yobe" },
    { value: "Zamfara", label: "Zamfara" },
  ]

  const commissionOptions = [
    { value: "0", label: "Select commission rate" },
    { value: "1.0", label: "1.0%" },
    { value: "1.5", label: "1.5%" },
    { value: "2.0", label: "2.0%" },
    { value: "2.5", label: "2.5%" },
    { value: "3.0", label: "3.0%" },
    { value: "3.5", label: "3.5%" },
    { value: "4.0", label: "4.0%" },
    { value: "4.5", label: "4.5%" },
    { value: "5.0", label: "5.0%" },
  ]

  const booleanOptions = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  // === EVENT HANDLERS ===

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string | number | boolean } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    let normalizedValue: string | number | boolean = value as string
    if (name === "canProcessPostpaid" || name === "canProcessPrepaid" || name === "posCollectionAllowed") {
      normalizedValue = value === "true"
    } else if (name === "urbanCommissionPercent" || name === "ruralCommissionPercent" || name === "employeeUserId") {
      normalizedValue = parseFloat(value as string) || 0
    }

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Vendor name is required"
    }
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
    if (!formData.address.trim()) {
      errors.address = "Address is required"
    }
    if (!formData.city.trim()) {
      errors.city = "City is required"
    }
    if (!formData.state) {
      errors.state = "State is required"
    }
    if (formData.urbanCommissionPercent <= 0) {
      errors.urbanCommissionPercent = "Urban commission rate must be greater than 0"
    }
    if (formData.ruralCommissionPercent <= 0) {
      errors.ruralCommissionPercent = "Rural commission rate must be greater than 0"
    }
    if (!formData.employeeUserId || formData.employeeUserId <= 0) {
      errors.employeeUserId = "Employee assignment is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isFormValid = (): boolean => {
    return (
      formData.name.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state !== "" &&
      formData.urbanCommissionPercent > 0 &&
      formData.ruralCommissionPercent > 0 &&
      formData.employeeUserId > 0 &&
      /^(\+?234|0)[789][01]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, "")) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      notify("error", "Please fix form errors before submitting", {
        description: "Some required fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      await dispatch(
        updateVendor({
          id: vendorId,
          updateData: {
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            canProcessPostpaid: formData.canProcessPostpaid,
            canProcessPrepaid: formData.canProcessPrepaid,
            posCollectionAllowed: formData.posCollectionAllowed,
            urbanCommissionPercent: formData.urbanCommissionPercent,
            ruralCommissionPercent: formData.ruralCommissionPercent,
            employeeUserId: formData.employeeUserId,
            documentUrls: formData.documentUrls,
            webhookUrl: formData.webhookUrl,
          },
        })
      ).unwrap()
    } catch (error) {
      console.error("Failed to update vendor:", error)
    }
  }

  // === RENDER ===

  // Show loading state while fetching vendor data
  if (currentVendorLoading || !isDataLoaded) {
    return (
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
        <DashboardNav />
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="flex w-full flex-col">
            <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 2xl:px-16">
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#004B23] border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading vendor information...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show error state if vendor not found
  if (currentVendorError) {
    return (
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
        <DashboardNav />
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="flex w-full flex-col">
            <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 2xl:px-16">
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">Vendor Not Found</h2>
                  <p className="mt-2 text-gray-600">The vendor you&apos;re trying to update could not be found.</p>
                  <ButtonModule variant="primary" size="md" onClick={() => router.back()} className="mt-4">
                    Go Back
                  </ButtonModule>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <DashboardNav />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 2xl:px-16">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Update Vendor</h1>
                    <p className="text-sm text-gray-600">Update information for {currentVendor?.name}</p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule
                    variant="outline"
                    size="md"
                    onClick={() => router.back()}
                    disabled={vendorUpdateLoading}
                  >
                    Cancel
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={!isFormValid() || vendorUpdateLoading}
                    icon={<Save />}
                    iconPosition="start"
                  >
                    {vendorUpdateLoading ? "Updating Vendor..." : "Update Vendor"}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Update Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="mb-6 border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vendor Information</h3>
                <p className="text-sm text-gray-600">Update the vendor&apos;s information and settings</p>
              </div>

              <form className="space-y-6 rounded-lg bg-[#F9f9f9] p-4 sm:p-6" onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <Building className="size-5" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <FormInputModule
                      label="Vendor Name"
                      name="name"
                      type="text"
                      placeholder="Enter vendor name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={formErrors.name}
                      required
                    />

                    <FormInputModule
                      label="Phone Number"
                      name="phoneNumber"
                      type="tel"
                      placeholder="Enter phone number (e.g., 08012345678)"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      error={formErrors.phoneNumber}
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

                    <FormInputModule
                      label="Webhook URL (Optional)"
                      name="webhookUrl"
                      type="url"
                      placeholder="Enter webhook URL"
                      value={formData.webhookUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <MapPin className="size-5" />
                    Location Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <div className="col-span-full">
                      <FormInputModule
                        label="Address"
                        name="address"
                        type="text"
                        placeholder="Enter vendor address"
                        value={formData.address}
                        onChange={handleInputChange}
                        error={formErrors.address}
                        required
                      />
                    </div>

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

                    <FormSelectModule
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      options={stateOptions}
                      error={formErrors.state}
                      required
                    />
                  </div>
                </div>

                {/* Services Information */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <CreditCard className="size-5 text-[#004B23]" />
                    Services
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <FormSelectModule
                      label="Can Process Postpaid"
                      name="canProcessPostpaid"
                      value={formData.canProcessPostpaid.toString()}
                      onChange={handleInputChange}
                      options={booleanOptions}
                    />

                    <FormSelectModule
                      label="Can Process Prepaid"
                      name="canProcessPrepaid"
                      value={formData.canProcessPrepaid.toString()}
                      onChange={handleInputChange}
                      options={booleanOptions}
                    />

                    <FormSelectModule
                      label="POS Collection Allowed"
                      name="posCollectionAllowed"
                      value={formData.posCollectionAllowed.toString()}
                      onChange={handleInputChange}
                      options={booleanOptions}
                    />
                  </div>
                </div>

                {/* Commission & Assignment */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <User className="size-5" />
                    Commission & Assignment
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <FormSelectModule
                      label="Urban Commission (%)"
                      name="urbanCommissionPercent"
                      value={formData.urbanCommissionPercent.toString()}
                      onChange={handleInputChange}
                      options={commissionOptions}
                      error={formErrors.urbanCommissionPercent}
                      required
                    />

                    <FormSelectModule
                      label="Rural Commission (%)"
                      name="ruralCommissionPercent"
                      value={formData.ruralCommissionPercent.toString()}
                      onChange={handleInputChange}
                      options={commissionOptions}
                      error={formErrors.ruralCommissionPercent}
                      required
                    />

                    <FormSelectModule
                      label="Assigned Employee"
                      name="employeeUserId"
                      value={formData.employeeUserId.toString()}
                      onChange={handleInputChange}
                      options={employeeOptions}
                      error={formErrors.employeeUserId}
                      required
                      disabled={employeesLoading}
                    />
                  </div>
                </div>

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
                <div className="flex flex-col-reverse justify-between gap-4 border-t pt-6 sm:flex-row">
                  <ButtonModule
                    variant="outline"
                    size="md"
                    onClick={() => router.back()}
                    disabled={vendorUpdateLoading}
                    type="button"
                  >
                    Cancel
                  </ButtonModule>

                  <ButtonModule
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={!isFormValid() || vendorUpdateLoading}
                    icon={<Save />}
                    iconPosition="end"
                  >
                    {vendorUpdateLoading ? "Updating Vendor..." : "Update Vendor"}
                  </ButtonModule>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UpdateVendor
