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

import { clearUpdateState, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import {
  clearCurrentServiceStation,
  fetchServiceStationById,
  updateServiceStation,
  UpdateServiceStationRequest,
} from "lib/redux/serviceStationsSlice"

interface ServiceStationFormData {
  areaOfficeId: number
  name: string
  code: string
  address: string
  latitude: number
  longitude: number
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
      {[...Array(3)].map((_, sectionIndex) => (
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

const UpdateServiceStationPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const {
    updateLoading,
    updateError,
    updateSuccess,
    currentServiceStation,
    currentServiceStationLoading,
    currentServiceStationError,
  } = useSelector((state: RootState) => state.serviceStations)

  const {
    areaOffices,
    loading: areaOfficesLoading,
    error: areaOfficesError,
  } = useSelector((state: RootState) => state.areaOffices)

  const [formData, setFormData] = useState<ServiceStationFormData>({
    areaOfficeId: 0,
    name: "",
    code: "",
    address: "",
    latitude: 0,
    longitude: 0,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch service station data and area offices when component mounts or ID changes
  useEffect(() => {
    if (id) {
      const serviceStationId = parseInt(id as string)
      if (!isNaN(serviceStationId)) {
        dispatch(fetchServiceStationById(serviceStationId))
      } else {
        notify("error", "Invalid Service Station ID", {
          description: "The provided service station ID is invalid",
          duration: 4000,
        })
        router.push("/assets-management/service-stations")
      }
    } else {
      notify("error", "Service Station ID is required", {
        description: "Please provide a valid service station ID",
        duration: 4000,
      })
      router.push("/assets-management/service-stations")
    }

    // Fetch area offices for the dropdown
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )
  }, [dispatch, id, router])

  // Populate form when current service station data is loaded
  useEffect(() => {
    if (currentServiceStation) {
      setFormData({
        areaOfficeId: currentServiceStation.areaOfficeId,
        name: currentServiceStation.name,
        code: currentServiceStation.code,
        address: currentServiceStation.address,
        latitude: currentServiceStation.latitude,
        longitude: currentServiceStation.longitude,
      })
    }
  }, [currentServiceStation])

  // Handle success and error states
  useEffect(() => {
    if (updateSuccess) {
      notify("success", "Service Station updated successfully", {
        description: `${formData.name} has been updated in the system`,
        duration: 5000,
      })
      // Navigate back to service stations list after successful update
      setTimeout(() => {
        router.push("/assets-management/service-stations")
      }, 2000)
    }

    if (updateError) {
      notify("error", "Failed to update service station", {
        description: updateError,
        duration: 6000,
      })
    }

    if (currentServiceStationError) {
      notify("error", "Failed to load service station data", {
        description: currentServiceStationError,
        duration: 6000,
      })
    }
  }, [updateSuccess, updateError, currentServiceStationError, formData.name, router])

  // Area office options from fetched data
  const areaOfficeOptions = [
    { value: 0, label: "Select area office" },
    ...areaOffices.map((areaOffice) => ({
      value: areaOffice.id,
      label: `${areaOffice.nameOfNewOAreaffice} (${areaOffice.newNercCode})`,
    })),
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields - ensure proper conversion
    let processedValue = value
    if (["areaOfficeId", "latitude", "longitude"].includes(name)) {
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

    if (formData.areaOfficeId === 0) {
      errors.areaOfficeId = "Area office is required"
    }

    if (!formData.name.trim()) {
      errors.name = "Service station name is required"
    }

    if (!formData.code.trim()) {
      errors.code = "Service station code is required"
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required"
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

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitServiceStationUpdate()
  }

  const submitServiceStationUpdate = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    if (!id) {
      notify("error", "Service Station ID is missing", {
        description: "Cannot update service station without a valid ID",
        duration: 4000,
      })
      return
    }

    try {
      const serviceStationId = parseInt(id)
      if (isNaN(serviceStationId)) {
        notify("error", "Invalid service station ID", {
          description: "The provided service station ID is invalid",
          duration: 4000,
        })
        return
      }

      const updateData: UpdateServiceStationRequest = {
        areaOfficeId: formData.areaOfficeId,
        name: formData.name,
        code: formData.code,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }

      const result = await dispatch(
        updateServiceStation({
          id: serviceStationId,
          serviceStationData: updateData,
        })
      ).unwrap()

      if (result.isSuccess) {
        // Success is handled in the useEffect above
      }
    } catch (error: any) {
      console.error("Failed to update service station:", error)
      // Error is handled in the useEffect above
    }
  }

  const handleReset = () => {
    if (currentServiceStation) {
      setFormData({
        areaOfficeId: currentServiceStation.areaOfficeId,
        name: currentServiceStation.name,
        code: currentServiceStation.code,
        address: currentServiceStation.address,
        latitude: currentServiceStation.latitude,
        longitude: currentServiceStation.longitude,
      })
    }
    setFormErrors({})
    dispatch(clearUpdateState())
  }

  const handleCancel = () => {
    router.push("/assets-management/service-stations")
  }

  const isFormValid = (): boolean => {
    return (
      formData.areaOfficeId !== 0 &&
      formData.name.trim() !== "" &&
      formData.code.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.latitude !== 0 &&
      formData.longitude !== 0
    )
  }

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearUpdateState())
      dispatch(clearCurrentServiceStation())
    }
  }, [dispatch])

  // Show loading state while fetching service station data
  if (currentServiceStationLoading) {
    return (
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full">
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

  // Show error state if failed to load service station
  if (currentServiceStationError && !currentServiceStation) {
    return (
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="container mx-auto flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-red-500">
                  <svg className="mx-auto size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Failed to load service station</h3>
                <p className="mb-4 text-gray-600">{currentServiceStationError}</p>
                <ButtonModule variant="primary" onClick={() => router.push("/assets-management/service-stations")}>
                  Back to Service Stations
                </ButtonModule>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="container mx-auto flex flex-col">
            {/* Page Header */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Update Service Station</h4>
                <p className="text-gray-600">
                  {currentServiceStation
                    ? `Update details for ${currentServiceStation.name}`
                    : "Update service station details"}
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
                  onClick={submitServiceStationUpdate}
                  disabled={!isFormValid() || updateLoading}
                >
                  {updateLoading ? "Updating Service Station..." : "Update Service Station"}
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
                    <h3 className="text-lg font-semibold text-gray-900">Service Station Information</h3>
                    <p className="text-sm text-gray-600">Update the required fields to modify the service station</p>
                  </div>

                  {/* Service Station Form */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Associated Assets */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Associated Assets</h4>
                        <p className="text-sm text-gray-600">Select the area office this service station belongs to</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormSelectModule
                          label="Area Office"
                          name="areaOfficeId"
                          value={formData.areaOfficeId}
                          onChange={handleInputChange}
                          options={areaOfficeOptions}
                          error={formErrors.areaOfficeId}
                          required
                          disabled={areaOfficesLoading || updateLoading}
                        />
                      </div>
                      {areaOfficesLoading && <p className="text-sm text-gray-500">Loading area offices...</p>}
                    </div>

                    {/* Section 2: Basic Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                        <p className="text-sm text-gray-600">
                          Update the service station identification and coding information
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Service Station Name"
                          name="name"
                          type="text"
                          placeholder="Enter service station name"
                          value={formData.name}
                          onChange={handleInputChange}
                          error={formErrors.name}
                          required
                          disabled={updateLoading}
                        />

                        <FormInputModule
                          label="Service Station Code"
                          name="code"
                          type="text"
                          placeholder="Enter service station code"
                          value={formData.code}
                          onChange={handleInputChange}
                          error={formErrors.code}
                          required
                          disabled={updateLoading}
                        />

                        <div className="md:col-span-2">
                          <FormInputModule
                            label="Address"
                            name="address"
                            type="text"
                            placeholder="Enter complete address"
                            value={formData.address}
                            onChange={handleInputChange}
                            error={formErrors.address}
                            required
                            disabled={updateLoading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Geographical Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Geographical Information</h4>
                        <p className="text-sm text-gray-600">
                          Update the geographical coordinates of the service station
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

                    {/* Current Service Station Information */}
                    {currentServiceStation && (
                      <div className="space-y-6 rounded-lg bg-blue-50 p-6">
                        <div className="border-b border-blue-200 pb-4">
                          <h4 className="text-lg font-medium text-blue-900">Current Information</h4>
                          <p className="text-sm text-blue-700">This is the current data for this service station</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current Name</label>
                            <p className="font-semibold text-blue-900">{currentServiceStation.name}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current Code</label>
                            <p className="font-semibold text-blue-900">{currentServiceStation.code}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current Address</label>
                            <p className="font-semibold text-blue-900">{currentServiceStation.address}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current Latitude</label>
                            <p className="font-semibold text-blue-900">{currentServiceStation.latitude}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current Longitude</label>
                            <p className="font-semibold text-blue-900">{currentServiceStation.longitude}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Service Station ID</label>
                            <p className="font-semibold text-blue-900">{currentServiceStation.id}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4 md:col-span-2 lg:col-span-3">
                            <label className="text-sm font-medium text-blue-600">Current Area Office</label>
                            <p className="font-semibold text-blue-900">
                              {currentServiceStation.areaOffice.nameOfNewOAreaffice} (ID:{" "}
                              {currentServiceStation.areaOffice.id})
                            </p>
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
                        {updateLoading ? "Updating Service Station..." : "Update Service Station"}
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

export default UpdateServiceStationPage
