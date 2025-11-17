"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AppDispatch, RootState } from "lib/redux/store"
import {
  clearCurrentCustomer,
  clearUpdateState,
  fetchCustomerById,
  updateCustomerById,
  UpdateCustomerRequest,
} from "lib/redux/customerSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { fetchEmployees } from "lib/redux/employeeSlice"

interface CustomerFormData {
  fullName: string
  phoneNumber: string
  email: string
  address: string
  distributionSubstationId: number
  status: string
  addressTwo: string
  city: string
  state: string
  serviceCenterId: number
  latitude: number
  longitude: number
  tariff: number
  meterNumber: string
  isPPM: boolean
  isMD: boolean
  comment: string
  band: string
  storedAverage: number
  totalMonthlyVend: number
  totalMonthlyDebt: number
  customerOutstandingDebtBalance: number
  salesRepUserId: number
  technicalEngineerUserId: number
}

const UpdateCustomerPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const { updateLoading, updateError, updateSuccess, currentCustomer, currentCustomerLoading, currentCustomerError } =
    useSelector((state: RootState) => state.customers)

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
    email: "",
    address: "",
    distributionSubstationId: 0,
    status: "",
    addressTwo: "",
    city: "",
    state: "",
    serviceCenterId: 0,
    latitude: 0,
    longitude: 0,
    tariff: 0,
    meterNumber: "",
    isPPM: false,
    isMD: false,
    comment: "",
    band: "",
    storedAverage: 0,
    totalMonthlyVend: 0,
    totalMonthlyDebt: 0,
    customerOutstandingDebtBalance: 0,
    salesRepUserId: 0,
    technicalEngineerUserId: 0,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch customer data and related data when component mounts or ID changes
  useEffect(() => {
    if (id) {
      const customerId = parseInt(id as string)
      if (!isNaN(customerId)) {
        dispatch(fetchCustomerById(customerId))
      } else {
        notify("error", "Invalid customer ID", {
          description: "The provided customer ID is invalid",
          duration: 4000,
        })
        router.push("/customers/view-customers") // Redirect back to customers list
      }
    } else {
      notify("error", "Customer ID is required", {
        description: "Please provide a valid customer ID",
        duration: 4000,
      })
      router.push("/customers/view-customers") // Redirect back to customers list
    }

    // Fetch distribution substations for the dropdown
    dispatch(
      fetchDistributionSubstations({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    // Fetch service centers for the dropdown
    dispatch(
      fetchServiceStations({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    // Fetch employees for the dropdowns
    dispatch(
      fetchEmployees({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch, id, router])

  // Populate form when current customer data is loaded
  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        fullName: currentCustomer.fullName || "",
        phoneNumber: currentCustomer.phoneNumber || "",
        email: currentCustomer.email || "",
        address: currentCustomer.address || "",
        distributionSubstationId: currentCustomer.distributionSubstationId || 0,
        status: currentCustomer.status || "",
        addressTwo: currentCustomer.addressTwo || "",
        city: currentCustomer.city || "",
        state: currentCustomer.state || "",
        serviceCenterId: currentCustomer.serviceCenterId || 0,
        latitude: currentCustomer.latitude || 0,
        longitude: currentCustomer.longitude || 0,
        tariff: currentCustomer.tariff || 0,
        meterNumber: currentCustomer.meterNumber || "",
        isPPM: currentCustomer.isPPM || false,
        isMD: currentCustomer.isMD || false,
        comment: currentCustomer.comment || "",
        band: currentCustomer.band || "",
        storedAverage: currentCustomer.storedAverage || 0,
        totalMonthlyVend: currentCustomer.totalMonthlyVend || 0,
        totalMonthlyDebt: currentCustomer.totalMonthlyDebt || 0,
        customerOutstandingDebtBalance: currentCustomer.customerOutstandingDebtBalance || 0,
        salesRepUserId: currentCustomer.salesRepUserId || 0,
        technicalEngineerUserId: currentCustomer.technicalEngineerUserId || 0,
      })
    }
  }, [currentCustomer])

  // Handle success and error states
  useEffect(() => {
    if (updateSuccess) {
      notify("success", "Customer updated successfully", {
        description: `${formData.fullName} has been updated in the system`,
        duration: 5000,
      })
      // Navigate back to customers list after successful update
      setTimeout(() => {
        router.push("/customers/view-customers")
      }, 2000)
    }

    if (updateError) {
      notify("error", "Failed to update customer", {
        description: updateError,
        duration: 6000,
      })
    }

    if (currentCustomerError) {
      notify("error", "Failed to load customer data", {
        description: currentCustomerError,
        duration: 6000,
      })
    }
  }, [updateSuccess, updateError, currentCustomerError, formData.fullName, router])

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

  // Status options
  const statusOptions = [
    { value: "", label: "Select status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
  ]

  // Band options
  const bandOptions = [
    { value: "", label: "Select band" },
    { value: "Band A", label: "Band A" },
    { value: "Band B", label: "Band B" },
    { value: "Band C", label: "Band C" },
    { value: "Band D", label: "Band D" },
    { value: "Band E", label: "Band E" },
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
        "storedAverage",
        "totalMonthlyVend",
        "totalMonthlyDebt",
        "customerOutstandingDebtBalance",
        "salesRepUserId",
        "technicalEngineerUserId",
      ].includes(name)
    ) {
      processedValue = Number(value)
    }

    // Handle boolean fields
    if (["isPPM", "isMD"].includes(name)) {
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

  const validateForm = (): boolean => {
    // No required-field validation for update; clear any previous errors
    setFormErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitCustomerUpdate()
  }

  const submitCustomerUpdate = async () => {
    // For update, allow submitting without strict validation
    validateForm()

    if (!id) {
      notify("error", "Customer ID is missing", {
        description: "Cannot update customer without a valid ID",
        duration: 4000,
      })
      return
    }

    try {
      const customerId = parseInt(id)
      if (isNaN(customerId)) {
        notify("error", "Invalid customer ID", {
          description: "The provided customer ID is invalid",
          duration: 4000,
        })
        return
      }

      const updateData: UpdateCustomerRequest = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        distributionSubstationId: formData.distributionSubstationId,
        status: formData.status,
        addressTwo: formData.addressTwo,
        city: formData.city,
        state: formData.state,
        serviceCenterId: formData.serviceCenterId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        tariff: formData.tariff,
        meterNumber: formData.meterNumber,
        isPPM: formData.isPPM,
        isMD: formData.isMD,
        comment: formData.comment,
        band: formData.band,
        storedAverage: formData.storedAverage,
        totalMonthlyVend: formData.totalMonthlyVend,
        totalMonthlyDebt: formData.totalMonthlyDebt,
        customerOutstandingDebtBalance: formData.customerOutstandingDebtBalance,
        salesRepUserId: formData.salesRepUserId,
        technicalEngineerUserId: formData.technicalEngineerUserId,
      }

      const result = await dispatch(updateCustomerById({ id: customerId, updateData })).unwrap()

      // Success is handled in the useEffect above
    } catch (error: any) {
      console.error("Failed to update customer:", error)
      // Error is handled in the useEffect above
    }
  }

  const handleReset = () => {
    if (currentCustomer) {
      setFormData({
        fullName: currentCustomer.fullName || "",
        phoneNumber: currentCustomer.phoneNumber || "",
        email: currentCustomer.email || "",
        address: currentCustomer.address || "",
        distributionSubstationId: currentCustomer.distributionSubstationId || 0,
        status: currentCustomer.status || "",
        addressTwo: currentCustomer.addressTwo || "",
        city: currentCustomer.city || "",
        state: currentCustomer.state || "",
        serviceCenterId: currentCustomer.serviceCenterId || 0,
        latitude: currentCustomer.latitude || 0,
        longitude: currentCustomer.longitude || 0,
        tariff: currentCustomer.tariff || 0,
        meterNumber: currentCustomer.meterNumber || "",
        isPPM: currentCustomer.isPPM || false,
        isMD: currentCustomer.isMD || false,
        comment: currentCustomer.comment || "",
        band: currentCustomer.band || "",
        storedAverage: currentCustomer.storedAverage || 0,
        totalMonthlyVend: currentCustomer.totalMonthlyVend || 0,
        totalMonthlyDebt: currentCustomer.totalMonthlyDebt || 0,
        customerOutstandingDebtBalance: currentCustomer.customerOutstandingDebtBalance || 0,
        salesRepUserId: currentCustomer.salesRepUserId || 0,
        technicalEngineerUserId: currentCustomer.technicalEngineerUserId || 0,
      })
    }
    setFormErrors({})
    dispatch(clearUpdateState())
  }

  const handleCancel = () => {
    router.push("/customers/view-customers") // Navigate back to customers list
  }

  const isFormValid = (): boolean => {
    // All fields are optional for updates; always allow submit (UI disable only on loading)
    return true
  }

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearUpdateState())
      dispatch(clearCurrentCustomer())
    }
  }, [dispatch])

  // Show loading skeleton while fetching customer data
  if (currentCustomerLoading) {
    return <LoadingSkeleton />
  }

  // Show error state if failed to load customer
  if (currentCustomerError && !currentCustomer) {
    return (
      <section className="size-full">
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="container mx-auto flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-red-500">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Failed to load customer</h3>
                <p className="mb-4 text-gray-600">{currentCustomerError}</p>
                <ButtonModule variant="primary" onClick={() => router.push("/customers/view-customers")}>
                  Back to Customers
                </ButtonModule>
              </div>
            </div>
          </div>
        </div>
      </section>
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
                <h4 className="text-2xl font-semibold">Update Customer</h4>
                <p className="text-gray-600">
                  {currentCustomer ? `Update details for ${currentCustomer.fullName}` : "Update customer details"}
                </p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule variant="outline" size="md" onClick={handleCancel} disabled={updateLoading}>
                  Cancel
                </ButtonModule>
                <ButtonModule variant="outline" size="md" onClick={handleReset} disabled={updateLoading}>
                  Reset Form
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={submitCustomerUpdate}
                  disabled={!isFormValid() || updateLoading}
                  iconPosition="start"
                >
                  {updateLoading ? "Updating Customer..." : "Update Customer"}
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
                      Update the required fields to modify the customer information
                    </p>
                  </div>

                  {/* Customer Form */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Personal Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Personal Information</h4>
                        <p className="text-sm text-gray-600">Update the customer&apos;s personal and contact details</p>
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
                          label="Email Address"
                          name="email"
                          type="email"
                          placeholder="Enter email address"
                          value={formData.email}
                          onChange={handleInputChange}
                          error={formErrors.email}
                          required
                        />

                        <FormSelectModule
                          label="Status"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          options={statusOptions}
                          error={formErrors.status}
                          required
                        />
                      </div>
                    </div>

                    {/* Section 2: Address Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Address Information</h4>
                        <p className="text-sm text-gray-600">Update the customer&apos;s address and location details</p>
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

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    </div>

                    {/* Section 3: Service Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Service Information</h4>
                        <p className="text-sm text-gray-600">
                          Update the customer&apos;s service and distribution details
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
                      {serviceStationsLoading && <p className="text-sm text-gray-500">Loading service centers...</p>}
                      {serviceStationsError && (
                        <p className="text-sm text-red-500">Error loading service centers: {serviceStationsError}</p>
                      )}
                    </div>

                    {/* Section 4: Meter Information */}

                    {/* Section 5: Financial Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Financial Information</h4>
                        <p className="text-sm text-gray-600">
                          Update the customer&apos;s financial and billing details
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
                        <FormInputModule
                          label="Stored Average"
                          name="storedAverage"
                          type="number"
                          placeholder="Enter stored average"
                          value={formData.storedAverage}
                          onChange={handleInputChange}
                          step="0.01"
                        />

                        {/* <FormInputModule
                          label="Total Monthly Vend"
                          name="totalMonthlyVend"
                          type="number"
                          placeholder="Enter total monthly vend"
                          value={formData.totalMonthlyVend}
                          onChange={handleInputChange}
                          step="0.01"
                        />

                        <FormInputModule
                          label="Total Monthly Debt"
                          name="totalMonthlyDebt"
                          type="number"
                          placeholder="Enter total monthly debt"
                          value={formData.totalMonthlyDebt}
                          onChange={handleInputChange}
                          step="0.01"
                        />

                        <FormInputModule
                          label="Outstanding Balance"
                          name="customerOutstandingDebtBalance"
                          type="number"
                          placeholder="Enter outstanding balance"
                          value={formData.customerOutstandingDebtBalance}
                          onChange={handleInputChange}
                          step="0.01"
                        /> */}
                      </div>
                    </div>

                    {/* Section 6: Additional Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                        <p className="text-sm text-gray-600">Update additional customer details and comments</p>
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
                    </div>

                    {/* Current Information Display */}
                    {currentCustomer && (
                      <div className="space-y-6 rounded-lg bg-blue-50 p-6">
                        <div className="border-b border-blue-200 pb-4">
                          <h4 className="text-lg font-medium text-blue-900">Current Information</h4>
                          <p className="text-sm text-blue-700">This is the current data for this customer</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Account Number</label>
                            <p className="font-semibold text-blue-900">{currentCustomer.accountNumber}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current Status</label>
                            <p className="font-semibold text-blue-900">{currentCustomer.status}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Suspension Status</label>
                            <p className="font-semibold text-blue-900">
                              {currentCustomer.isSuspended ? "Suspended" : "Active"}
                            </p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Distribution Substation</label>
                            <p className="font-semibold text-blue-900">{currentCustomer.distributionSubstationCode}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Service Center</label>
                            <p className="font-semibold text-blue-900">{currentCustomer.serviceCenterName}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Area Office</label>
                            <p className="font-semibold text-blue-900">{currentCustomer.areaOfficeName}</p>
                          </div>
                          {currentCustomer.salesRepUser && (
                            <div className="rounded-lg border border-blue-200 bg-white p-4">
                              <label className="text-sm font-medium text-blue-600">Current Sales Rep</label>
                              <p className="font-semibold text-blue-900">{currentCustomer.salesRepUser.fullName}</p>
                              <p className="text-sm text-blue-700">{currentCustomer.salesRepUser.email}</p>
                            </div>
                          )}
                          {currentCustomer.technicalEngineerUser && (
                            <div className="rounded-lg border border-blue-200 bg-white p-4">
                              <label className="text-sm font-medium text-blue-600">Current Technical Engineer</label>
                              <p className="font-semibold text-blue-900">
                                {currentCustomer.technicalEngineerUser.fullName}
                              </p>
                              <p className="text-sm text-blue-700">{currentCustomer.technicalEngineerUser.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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
                    <div className="flex justify-end gap-4 border-t pt-6">
                      <ButtonModule
                        variant="dangerSecondary"
                        size="lg"
                        onClick={handleCancel}
                        disabled={updateLoading}
                        type="button"
                      >
                        Cancel
                      </ButtonModule>
                      <ButtonModule
                        variant="outline"
                        size="lg"
                        onClick={handleReset}
                        disabled={updateLoading}
                        type="button"
                      >
                        Reset
                      </ButtonModule>
                      <ButtonModule
                        variant="primary"
                        size="lg"
                        type="submit"
                        disabled={!isFormValid() || updateLoading}
                      >
                        {updateLoading ? "Updating Customer..." : "Update Customer"}
                      </ButtonModule>
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

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <DashboardNav />
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 overflow-hidden rounded-md bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div>
            <div className="mb-2 h-8 w-48 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </div>
            <div className="h-4 w-32 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            />
          </div>
          <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            />
          </div>
          <div className="h-10 w-32 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {/* Form Header Skeleton */}
        <div className="mb-6 border-b pb-4">
          <div className="h-6 w-64 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="mt-2 h-4 w-96 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
          </div>
        </div>

        {/* Form Sections Skeleton */}
        <div className="space-y-8">
          {[1, 2, 3, 4, 5, 6].map((section) => (
            <div key={section} className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
              {/* Section Header */}
              <div className="border-b pb-4">
                <div className="h-6 w-48 overflow-hidden rounded bg-gray-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: section * 0.1,
                    }}
                  />
                </div>
                <div className="mt-2 h-4 w-64 overflow-hidden rounded bg-gray-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: section * 0.1 + 0.1,
                    }}
                  />
                </div>
              </div>

              {/* Form Fields Skeleton */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((field) => (
                  <div key={field} className="space-y-2">
                    <div className="h-4 w-32 overflow-hidden rounded bg-gray-200">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: section * 0.1 + field * 0.1,
                        }}
                      />
                    </div>
                    <div className="h-10 w-full overflow-hidden rounded bg-gray-200">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: section * 0.1 + field * 0.1 + 0.05,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Current Information Skeleton */}
          <div className="space-y-6 rounded-lg bg-blue-50 p-6">
            <div className="border-b border-blue-200 pb-4">
              <div className="h-6 w-48 overflow-hidden rounded bg-blue-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div className="mt-2 h-4 w-64 overflow-hidden rounded bg-blue-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="rounded-lg border border-blue-200 bg-white p-4">
                  <div className="h-4 w-32 overflow-hidden rounded bg-gray-200">
                    <motion.div
                      className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: item * 0.1,
                      }}
                    />
                  </div>
                  <div className="mt-2 h-6 w-40 overflow-hidden rounded bg-gray-200">
                    <motion.div
                      className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: item * 0.1 + 0.05,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions Skeleton */}
          <div className="flex justify-end gap-4 border-t pt-6">
            <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </div>
            <div className="h-10 w-32 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default UpdateCustomerPage
