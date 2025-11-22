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
  clearCurrentDistributionSubstation,
  clearUpdateState,
  fetchDistributionSubstationById,
  updateDistributionSubstation,
  UpdateDistributionSubstationRequest,
} from "lib/redux/distributionSubstationsSlice"
import { fetchFeeders } from "lib/redux/feedersSlice"

interface DistributionSubstationFormData {
  feederId: number
  oldDssCode: string
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  numberOfUnit: number
  unitOneCode: string
  unitTwoCode: string
  unitThreeCode: string
  unitFourCode: string
  publicOrDedicated: string
  status: string
  remarks: string
}

// Enhanced Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
            <div className="size-6 rounded-full bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-full justify-between">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced Skeleton for Form
const FormSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Header Skeleton */}
      <div className="mb-6 border-b pb-4">
        <div className="h-8 w-64 rounded bg-gray-200"></div>
        <div className="mt-2 h-4 w-96 rounded bg-gray-200"></div>
      </div>

      {/* Form Sections Skeleton */}
      {[...Array(5)].map((_, sectionIndex) => (
        <div key={sectionIndex} className="mb-6 rounded-lg border bg-gray-50 p-6">
          <div className="mb-4 border-b pb-4">
            <div className="h-6 w-48 rounded bg-gray-200"></div>
            <div className="mt-1 h-4 w-64 rounded bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, fieldIndex) => (
              <div key={fieldIndex} className="space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200"></div>
                <div className="h-10 w-full rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Form Actions Skeleton */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <div className="h-10 w-24 rounded bg-gray-200"></div>
        <div className="h-10 w-24 rounded bg-gray-200"></div>
        <div className="h-10 w-32 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

const UpdateDistributionStationPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const {
    updateLoading,
    updateError,
    updateSuccess,
    currentDistributionSubstation,
    currentDistributionSubstationLoading,
    currentDistributionSubstationError,
  } = useSelector((state: RootState) => state.distributionSubstations)

  const { feeders, loading: feedersLoading, error: feedersError } = useSelector((state: RootState) => state.feeders)

  const [formData, setFormData] = useState<DistributionSubstationFormData>({
    feederId: 0,
    oldDssCode: "",
    dssCode: "",
    nercCode: "",
    transformerCapacityInKva: 0,
    latitude: 0,
    longitude: 0,
    numberOfUnit: 0,
    unitOneCode: "",
    unitTwoCode: "",
    unitThreeCode: "",
    unitFourCode: "",
    publicOrDedicated: "",
    status: "",
    remarks: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch distribution station data and feeders when component mounts or ID changes
  useEffect(() => {
    if (id) {
      const distributionStationId = parseInt(id as string)
      if (!isNaN(distributionStationId)) {
        dispatch(fetchDistributionSubstationById(distributionStationId))
      } else {
        notify("error", "Invalid Distribution Substation ID", {
          description: "The provided distribution substation ID is invalid",
          duration: 4000,
        })
        router.push("/assets-management/distribution-stations")
      }
    } else {
      notify("error", "Distribution Substation ID is required", {
        description: "Please provide a valid distribution substation ID",
        duration: 4000,
      })
      router.push("/assets-management/distribution-stations")
    }

    // Fetch feeders for the dropdown
    dispatch(
      fetchFeeders({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch, id, router])

  // Populate form when current distribution station data is loaded
  useEffect(() => {
    if (currentDistributionSubstation) {
      setFormData({
        feederId: currentDistributionSubstation.feeder.id,
        oldDssCode: currentDistributionSubstation.oldDssCode || "",
        dssCode: currentDistributionSubstation.dssCode,
        nercCode: currentDistributionSubstation.nercCode,
        transformerCapacityInKva: currentDistributionSubstation.transformerCapacityInKva,
        latitude: currentDistributionSubstation.latitude,
        longitude: currentDistributionSubstation.longitude,
        numberOfUnit: currentDistributionSubstation.numberOfUnit,
        unitOneCode: currentDistributionSubstation.unitOneCode || "",
        unitTwoCode: currentDistributionSubstation.unitTwoCode || "",
        unitThreeCode: currentDistributionSubstation.unitThreeCode || "",
        unitFourCode: currentDistributionSubstation.unitFourCode || "",
        publicOrDedicated: currentDistributionSubstation.publicOrDedicated,
        status: currentDistributionSubstation.status,
        remarks: currentDistributionSubstation.remarks || "",
      })
    }
  }, [currentDistributionSubstation])

  // Handle success and error states
  useEffect(() => {
    if (updateSuccess) {
      notify("success", "Distribution Substation updated successfully", {
        description: `${formData.dssCode} has been updated in the system`,
        duration: 5000,
      })
      // Navigate back to distribution stations list after successful update
      setTimeout(() => {
        router.push("/assets-management/distribution-stations")
      }, 2000)
    }

    if (updateError) {
      notify("error", "Failed to update distribution substation", {
        description: updateError,
        duration: 6000,
      })
    }

    if (currentDistributionSubstationError) {
      notify("error", "Failed to load distribution substation data", {
        description: currentDistributionSubstationError,
        duration: 6000,
      })
    }
  }, [updateSuccess, updateError, currentDistributionSubstationError, formData.dssCode, router])

  // Feeder options from fetched data
  const feederOptions = [
    { value: 0, label: "Select feeder" },
    ...feeders.map((feeder) => ({
      value: feeder.id,
      label: `${feeder.name} (${feeder.nercCode}) - ${feeder.injectionSubstation.injectionSubstationCode}`,
    })),
  ]

  // Status options
  const statusOptions = [
    { value: "", label: "Select status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "MAINTENANCE", label: "Under Maintenance" },
    { value: "PLANNED", label: "Planned" },
  ]

  // Public or Dedicated options
  const publicOrDedicatedOptions = [
    { value: "", label: "Select type" },
    { value: "PUBLIC", label: "Public" },
    { value: "DEDICATED", label: "Dedicated" },
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields - ensure proper conversion
    let processedValue = value
    if (["feederId", "transformerCapacityInKva", "latitude", "longitude", "numberOfUnit"].includes(name)) {
      processedValue = value === "" ? 0 : Number(value)
      // Handle decimal numbers for coordinates
      if (["latitude", "longitude"].includes(name)) {
        processedValue = value === "" ? 0 : parseFloat(value)
      }
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
    const errors: Record<string, string> = {}

    if (formData.feederId === 0) {
      errors.feederId = "Feeder is required"
    }

    if (!formData.dssCode.trim()) {
      errors.dssCode = "DSS code is required"
    }

    if (!formData.nercCode.trim()) {
      errors.nercCode = "NERC code is required"
    }

    if (formData.transformerCapacityInKva <= 0) {
      errors.transformerCapacityInKva = "Transformer capacity is required and must be greater than 0"
    }

    // Validate coordinates
    if (formData.latitude === 0) {
      errors.latitude = "Latitude is required"
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = "Latitude must be between -90 and 90"
    }

    if (formData.longitude === 0) {
      errors.longitude = "Longitude is required"
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = "Longitude must be between -180 and 180"
    }

    if (formData.numberOfUnit < 0 || formData.numberOfUnit > 4) {
      errors.numberOfUnit = "Number of units must be between 0 and 4"
    }

    if (!formData.publicOrDedicated.trim()) {
      errors.publicOrDedicated = "Public or dedicated type is required"
    }

    if (!formData.status.trim()) {
      errors.status = "Status is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitDistributionStationUpdate()
  }

  const submitDistributionStationUpdate = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    if (!id) {
      notify("error", "Distribution Substation ID is missing", {
        description: "Cannot update distribution substation without a valid ID",
        duration: 4000,
      })
      return
    }

    try {
      const distributionStationId = parseInt(id)
      if (isNaN(distributionStationId)) {
        notify("error", "Invalid distribution substation ID", {
          description: "The provided distribution substation ID is invalid",
          duration: 4000,
        })
        return
      }

      const updateData: UpdateDistributionSubstationRequest = {
        feederId: formData.feederId,
        oldDssCode: formData.oldDssCode,
        dssCode: formData.dssCode,
        nercCode: formData.nercCode,
        transformerCapacityInKva: formData.transformerCapacityInKva,
        latitude: formData.latitude,
        longitude: formData.longitude,
        numberOfUnit: formData.numberOfUnit,
        unitOneCode: formData.unitOneCode,
        unitTwoCode: formData.unitTwoCode,
        unitThreeCode: formData.unitThreeCode,
        unitFourCode: formData.unitFourCode,
        publicOrDedicated: formData.publicOrDedicated,
        status: formData.status,
        remarks: formData.remarks,
      }

      const result = await dispatch(
        updateDistributionSubstation({
          id: distributionStationId,
          substationData: updateData,
        })
      ).unwrap()

      if (result.isSuccess) {
        // Success is handled in the useEffect above
      }
    } catch (error: any) {
      console.error("Failed to update distribution substation:", error)
      // Error is handled in the useEffect above
    }
  }

  const handleReset = () => {
    if (currentDistributionSubstation) {
      setFormData({
        feederId: currentDistributionSubstation.feeder.id,
        oldDssCode: currentDistributionSubstation.oldDssCode || "",
        dssCode: currentDistributionSubstation.dssCode,
        nercCode: currentDistributionSubstation.nercCode,
        transformerCapacityInKva: currentDistributionSubstation.transformerCapacityInKva,
        latitude: currentDistributionSubstation.latitude,
        longitude: currentDistributionSubstation.longitude,
        numberOfUnit: currentDistributionSubstation.numberOfUnit,
        unitOneCode: currentDistributionSubstation.unitOneCode || "",
        unitTwoCode: currentDistributionSubstation.unitTwoCode || "",
        unitThreeCode: currentDistributionSubstation.unitThreeCode || "",
        unitFourCode: currentDistributionSubstation.unitFourCode || "",
        publicOrDedicated: currentDistributionSubstation.publicOrDedicated,
        status: currentDistributionSubstation.status,
        remarks: currentDistributionSubstation.remarks || "",
      })
    }
    setFormErrors({})
    dispatch(clearUpdateState())
  }

  const handleCancel = () => {
    router.push("/assets-management/distribution-stations")
  }

  const isFormValid = (): boolean => {
    return (
      formData.feederId !== 0 &&
      formData.dssCode.trim() !== "" &&
      formData.nercCode.trim() !== "" &&
      formData.transformerCapacityInKva > 0 &&
      formData.latitude !== 0 &&
      formData.longitude !== 0 &&
      formData.numberOfUnit >= 0 &&
      formData.numberOfUnit <= 4 &&
      formData.publicOrDedicated.trim() !== "" &&
      formData.status.trim() !== ""
    )
  }

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearUpdateState())
      dispatch(clearCurrentDistributionSubstation())
    }
  }, [dispatch])

  // Show loading state while fetching distribution station data
  if (currentDistributionSubstationLoading) {
    return (
      <section className="size-full">
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="container mx-auto flex flex-col">
              {/* Page Header Skeleton */}
              <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
                <div>
                  <div className="h-8 w-64 rounded bg-gray-200"></div>
                  <div className="mt-2 h-4 w-96 rounded bg-gray-200"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-10 w-24 rounded bg-gray-200"></div>
                  <div className="h-10 w-24 rounded bg-gray-200"></div>
                  <div className="h-10 w-32 rounded bg-gray-200"></div>
                </div>
              </div>

              {/* Form Skeleton */}
              <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
                <div className="w-full">
                  <FormSkeleton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show error state if failed to load distribution station
  if (currentDistributionSubstationError && !currentDistributionSubstation) {
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
                <h3 className="mb-2 text-lg font-semibold">Failed to load distribution substation</h3>
                <p className="mb-4 text-gray-600">{currentDistributionSubstationError}</p>
                <ButtonModule variant="primary" onClick={() => router.push("/assets-management/distribution-stations")}>
                  Back to Distribution Substations
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
                <h4 className="text-2xl font-semibold">Update Distribution Substation</h4>
                <p className="text-gray-600">
                  {currentDistributionSubstation
                    ? `Update details for ${currentDistributionSubstation.dssCode}`
                    : "Update distribution substation details"}
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
                  onClick={submitDistributionStationUpdate}
                  disabled={!isFormValid() || updateLoading}
                >
                  {updateLoading ? "Updating Distribution Substation..." : "Update Distribution Substation"}
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
                    <h3 className="text-lg font-semibold text-gray-900">Distribution Substation Information</h3>
                    <p className="text-sm text-gray-600">
                      Update the required fields to modify the distribution substation
                    </p>
                  </div>

                  {/* Distribution Substation Form */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Associated Assets */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Associated Assets</h4>
                        <p className="text-sm text-gray-600">
                          Select the feeder this distribution substation belongs to
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormSelectModule
                          label="Feeder"
                          name="feederId"
                          value={formData.feederId}
                          onChange={handleInputChange}
                          options={feederOptions}
                          error={formErrors.feederId}
                          required
                          disabled={feedersLoading || updateLoading}
                        />
                      </div>
                      {feedersLoading && <p className="text-sm text-gray-500">Loading feeders...</p>}
                    </div>

                    {/* Section 2: Basic Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                        <p className="text-sm text-gray-600">
                          Update the distribution substation identification and coding information
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Old DSS Code"
                          name="oldDssCode"
                          type="text"
                          placeholder="Enter old DSS code"
                          value={formData.oldDssCode}
                          onChange={handleInputChange}
                          error={formErrors.oldDssCode}
                          disabled={updateLoading}
                        />

                        <FormInputModule
                          label="DSS Code"
                          name="dssCode"
                          type="text"
                          placeholder="Enter DSS code"
                          value={formData.dssCode}
                          onChange={handleInputChange}
                          error={formErrors.dssCode}
                          required
                          disabled={updateLoading}
                        />

                        <FormInputModule
                          label="NERC Code"
                          name="nercCode"
                          type="text"
                          placeholder="Enter NERC code"
                          value={formData.nercCode}
                          onChange={handleInputChange}
                          error={formErrors.nercCode}
                          required
                          disabled={updateLoading}
                        />

                        <FormInputModule
                          label="Transformer Capacity (kVA)"
                          name="transformerCapacityInKva"
                          type="number"
                          placeholder="Enter transformer capacity"
                          value={formData.transformerCapacityInKva}
                          onChange={handleInputChange}
                          error={formErrors.transformerCapacityInKva}
                          required
                          min="1"
                          disabled={updateLoading}
                        />
                      </div>
                    </div>

                    {/* Section 3: Geographical Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Geographical Information</h4>
                        <p className="text-sm text-gray-600">
                          Update the geographical coordinates of the distribution substation
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Latitude"
                          name="latitude"
                          type="number"
                          step="any"
                          placeholder="Enter latitude (e.g., 12.3456)"
                          value={formData.latitude}
                          onChange={handleInputChange}
                          error={formErrors.latitude}
                          required
                          disabled={updateLoading}
                        />

                        <FormInputModule
                          label="Longitude"
                          name="longitude"
                          type="number"
                          step="any"
                          placeholder="Enter longitude (e.g., 7.8901)"
                          value={formData.longitude}
                          onChange={handleInputChange}
                          error={formErrors.longitude}
                          required
                          disabled={updateLoading}
                        />
                      </div>
                    </div>

                    {/* Section 4: Technical Details */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Technical Details</h4>
                        <p className="text-sm text-gray-600">
                          Update the technical specifications of the distribution substation
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Number of Units"
                          name="numberOfUnit"
                          type="number"
                          placeholder="Enter number of units (0-4)"
                          value={formData.numberOfUnit}
                          onChange={handleInputChange}
                          error={formErrors.numberOfUnit}
                          required
                          min="0"
                          max="4"
                          disabled={updateLoading}
                        />

                        <FormSelectModule
                          label="Public or Dedicated"
                          name="publicOrDedicated"
                          value={formData.publicOrDedicated}
                          onChange={handleInputChange}
                          options={publicOrDedicatedOptions}
                          error={formErrors.publicOrDedicated}
                          required
                          disabled={updateLoading}
                        />

                        <FormSelectModule
                          label="Status"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          options={statusOptions}
                          error={formErrors.status}
                          required
                          disabled={updateLoading}
                        />

                        <FormInputModule
                          label="Remarks"
                          name="remarks"
                          type="text"
                          placeholder="Enter any remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          error={formErrors.remarks}
                          disabled={updateLoading}
                        />
                      </div>
                    </div>

                    {/* Section 5: Unit Codes */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Unit Codes</h4>
                        <p className="text-sm text-gray-600">
                          Update unit codes based on the number of units specified
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Unit One Code"
                          name="unitOneCode"
                          type="text"
                          placeholder="Enter unit one code"
                          value={formData.unitOneCode}
                          onChange={handleInputChange}
                          error={formErrors.unitOneCode}
                          disabled={formData.numberOfUnit < 1 || updateLoading}
                        />

                        <FormInputModule
                          label="Unit Two Code"
                          name="unitTwoCode"
                          type="text"
                          placeholder="Enter unit two code"
                          value={formData.unitTwoCode}
                          onChange={handleInputChange}
                          error={formErrors.unitTwoCode}
                          disabled={formData.numberOfUnit < 2 || updateLoading}
                        />

                        <FormInputModule
                          label="Unit Three Code"
                          name="unitThreeCode"
                          type="text"
                          placeholder="Enter unit three code"
                          value={formData.unitThreeCode}
                          onChange={handleInputChange}
                          error={formErrors.unitThreeCode}
                          disabled={formData.numberOfUnit < 3 || updateLoading}
                        />

                        <FormInputModule
                          label="Unit Four Code"
                          name="unitFourCode"
                          type="text"
                          placeholder="Enter unit four code"
                          value={formData.unitFourCode}
                          onChange={handleInputChange}
                          error={formErrors.unitFourCode}
                          disabled={formData.numberOfUnit < 4 || updateLoading}
                        />
                      </div>
                    </div>

                    {/* Current Distribution Substation Information */}
                    {currentDistributionSubstation && (
                      <div className="space-y-6 rounded-lg bg-blue-50 p-6">
                        <div className="border-b border-blue-200 pb-4">
                          <h4 className="text-lg font-medium text-blue-900">Current Information</h4>
                          <p className="text-sm text-blue-700">
                            This is the current data for this distribution substation
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current DSS Code</label>
                            <p className="font-semibold text-blue-900">{currentDistributionSubstation.dssCode}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current NERC Code</label>
                            <p className="font-semibold text-blue-900">{currentDistributionSubstation.nercCode}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current Capacity</label>
                            <p className="font-semibold text-blue-900">
                              {currentDistributionSubstation.transformerCapacityInKva} kVA
                            </p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current Status</label>
                            <p className="font-semibold text-blue-900">{currentDistributionSubstation.status}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current Type</label>
                            <p className="font-semibold text-blue-900">
                              {currentDistributionSubstation.publicOrDedicated}
                            </p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Distribution Substation ID</label>
                            <p className="font-semibold text-blue-900">{currentDistributionSubstation.id}</p>
                          </div>
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
                        {updateLoading ? "Updating Distribution Substation..." : "Update Distribution Substation"}
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

export default UpdateDistributionStationPage
